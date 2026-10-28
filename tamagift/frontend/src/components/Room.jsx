import React, { useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { C, FONT } from '../theme';
import Pet from './Pet';
import Sprite from './Sprite';
import { useStyle } from '../styles/StyleContext';
import { getMotion } from '../styles/motion';
import { FramedPoster } from './game/posters';
import { ROOM } from '../gameState';
import { findFurniture, findWall, findFloor, wallSvg, floorSvg, FURNITURE_PAINTS, POSTER } from '../roomCatalog';
import { findDecor } from '../shopCatalog';
import { doorSvg, doormatSvg, parcelSvg, DOOR } from '../art/room/door';
import { usePaintJob, PaintLayer, PaintTool, PaintHud } from './PaintJob';
import { NightLayer, WeatherOnWindows, LightSwitch, Zzz, Dirt } from './WorldLayer';
import { takePhoto } from '../snapshot';

// La puerta de entrada vive a la izquierda del cuarto: nada se puede poner
// encima (los pedidos y las visitas llegan por ahí).
export const DOOR_X = 34;
export const DOOR_ZONE = 176;      // hasta dónde llega la zona de la puerta
export const DOOR_SPOT = 252;      // dónde se para la mascota a abrir

// ─────────────────────────────────────────────────────────────────
// El cuarto.
//
// Es un mundo ancho (1600 unidades) del que en pantalla solo se ve un
// pedazo. La mascota camina sola de un lado a otro con pausas, y la
// cámara la sigue; si arrastras con el dedo, la cámara te obedece a ti
// y vuelve a seguirla unos segundos después.
//
// La animación NO pasa por el estado de React: posición de la mascota
// y de la cámara viven en refs y se escriben directo sobre el
// `transform` de dos divs. Con estado sería un re-render por cuadro y
// se sentiría pesado en un celular.
// ─────────────────────────────────────────────────────────────────

// El alto del visor se adapta a la pantalla: en un celular corto se
// encoge para que el dock de acciones siga entrando sin scroll, pero
// nunca baja de 230 px para que la mascota no quede diminuta.
const VIEW_H_MAX = 520;
const VIEW_H_MIN = 230;
const RESERVED = 310;   // lo que ocupan barra de arriba, dock y márgenes
// Decorando, debajo del cuarto aparece la bandeja (y la barra del objeto
// elegido): el cuarto se achica para que todo siga entrando sin scroll.
const RESERVED_EDITING = 520;
function computeViewH(editing = false, extra = 0) {
  if (typeof window === 'undefined') return VIEW_H_MAX;
  const reserved = (editing ? RESERVED_EDITING : RESERVED) + extra;
  return Math.round(clampNum(window.innerHeight - reserved, editing ? 180 : VIEW_H_MIN, VIEW_H_MAX));
}
const clampNum = (v, a, b) => Math.max(a, Math.min(b, v));
const WALK_SPEED = 46;        // unidades del mundo por segundo
const FOLLOW_AFTER_DRAG = 3200; // ms que la cámara respeta tu arrastre

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ── El paseo ─────────────────────────────────────────────────────
// Sale del componente a propósito: así se puede probar de verdad, sin
// depender de que el navegador esté pintando cuadros.

export function pickWalkTarget(p, rnd = Math.random) {
  // Paseos cortos casi siempre y de vez en cuando uno largo: el `rnd()²`
  // sesga la distancia hacia lo corto. Con distancias uniformes la
  // mascota se pasaba la vida cruzando el cuarto de punta a punta.
  const margin = ROOM.PET_W * 0.6;
  const far = ROOM.W - margin;
  let t = p.x;
  for (let i = 0; i < 6; i++) {
    const delta = (90 + rnd() * rnd() * 430) * (rnd() < 0.5 ? -1 : 1);
    t = clamp(p.x + delta, margin, far);
    if (Math.abs(t - p.x) >= 60) break;
    t = clamp(p.x - delta, margin, far);  // rebota contra la pared
    if (Math.abs(t - p.x) >= 60) break;
  }
  p.target = t;
  p.state = 'walk';
  p.facing = t > p.x ? 1 : -1;
  return p;
}

export function stepPet(p, dt, rnd = Math.random) {
  if (p.state === 'idle') {
    p.timer -= dt;
    p.speed = Math.max(0, p.speed - WALK_SPEED * 3 * dt);
    if (p.timer <= 0) pickWalkTarget(p, rnd);
  } else {
    const dist = p.target - p.x;
    const dir = Math.sign(dist);
    const absd = Math.abs(dist);
    // Acelera al arrancar y frena al llegar. Sin esto el paseo se ve
    // robótico: arranque instantáneo y parada seca.
    // corre cuando la llaman (el timbre, una visita)
    const wanted = WALK_SPEED * (p.rush ? 3.4 : 1) * clamp(absd / 70, 0.25, 1);
    p.speed += (wanted - p.speed) * Math.min(1, dt * 4);
    p.x += dir * p.speed * dt;
    p.phase += dt * (p.speed / WALK_SPEED) * 7.5;
    if (absd < 3) {
      p.x = p.target;
      p.state = 'idle';
      p.speed = 0;
      p.timer = p.rush ? 7 : 2.6 + rnd() * 6.5;
      p.rush = false;
      // A veces se queda mirando para el otro lado.
      if (rnd() < 0.35) p.facing = -p.facing;
    }
  }
  p.x = clamp(p.x, ROOM.PET_W * 0.5, ROOM.W - ROOM.PET_W * 0.5);
  return p;
}

export function stepCamera(cam, p, dt, worldViewW, maxCam, editing, now) {
  // Sigue a la mascota, salvo que acabes de arrastrar con el dedo.
  if (now > cam.manualUntil && !editing) {
    const want = clamp(p.x - worldViewW / 2, 0, maxCam);
    cam.x += (want - cam.x) * (1 - Math.exp(-dt * 2.6));
  }
  cam.x = clamp(cam.x, 0, maxCam);
  return cam;
}

// ── Piezas del decorado ──────────────────────────────────────────
// Pared y piso salen de src/art/room (misma perspectiva que los
// muebles) y pasan por el motor de estilos como superficies.

function Wall({ value, pixel }) {
  const markup = useMemo(() => wallSvg(value, ROOM.W, ROOM.FLOOR_Y), [value]);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <Sprite markup={markup} cacheKey={`wall-${value}`} w={ROOM.W} h={ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
    </div>
  );
}

function Floor({ value, pixel }) {
  const markup = useMemo(() => floorSvg(value, ROOM.W, ROOM.H - ROOM.FLOOR_Y), [value]);
  return (
    <div style={{ position: 'absolute', left: 0, top: ROOM.FLOOR_Y }}>
      <Sprite markup={markup} cacheKey={`floor-${value}`} w={ROOM.W} h={ROOM.H - ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
    </div>
  );
}

// Ambiente propio de cada estilo, encima del cuarto.
function Ambience({ styleId, layer }) {
  if (styleId === 'lofi' && layer === 'front') {
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 18% 22%, rgba(255,199,126,0.30), transparent 38%), radial-gradient(circle at 78% 30%, rgba(255,199,126,0.16), transparent 34%)', mixBlendMode: 'screen' }} />
        {[12, 34, 58, 81].map((l, i) => (
          <span key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${l}%`, bottom: '24%', width: 5, height: 5, borderRadius: '50%', background: '#FFE3B0', boxShadow: '0 0 6px #FFC77E', animation: `pg-drift ${7 + i * 1.3}s linear ${i * 1.4}s infinite`, pointerEvents: 'none' }} />
        ))}
      </>
    );
  }
  if (styleId === 'neon' && layer === 'back') {
    return <div style={{ position: 'absolute', left: 0, right: 0, top: ROOM.FLOOR_Y - 1, height: 3, background: '#FF4FD8', boxShadow: '0 0 10px #FF4FD8, 0 0 22px rgba(255,79,216,0.6)', pointerEvents: 'none' }} />;
  }
  return null;
}

// Un objeto puesto en el cuarto. `item` trae posición y tamaño; el
// contenido depende de si es mueble, decoración o póster.
function PlacedItem({ item, posters, customDecor, selected, editing, onPointerDown, pixel, faded, sky }) {
  const inner = renderPlacedContent(item, posters, customDecor, pixel, sky);
  if (!inner) return null;
  const { w, h, foot = 0 } = placedSize(item, posters, customDecor);
  // Los muebles y la decoración del catálogo traen su sombra dibujada;
  // solo lo que subió quien regaló necesita una.
  const onFloor = item.kind === 'decor' && (customDecor || []).some((d) => String(d.id) === String(item.refId));
  const sw = w * item.scale;
  return (
    <>
      {/* Sombra de contacto: sin esto los muebles parecen calcomanías
          pegadas encima del piso en vez de estar apoyados en él. */}
      {onFloor && (
        <div
          style={{
            position: 'absolute',
            left: item.x - sw * 0.42,
            top: item.y - 10,
            width: sw * 0.84,
            height: 20,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(30,18,26,0.34) 0%, rgba(30,18,26,0) 72%)',
            pointerEvents: 'none',
          }}
        />
      )}
    <div
      onPointerDown={editing ? (e) => onPointerDown(e, item) : undefined}
      style={{
        position: 'absolute',
        left: item.x - (w * item.scale) / 2,
        top: item.y - (h - foot) * item.scale,
        width: w * item.scale,
        height: h * item.scale,
        transform: `scaleX(${item.flip || 1})`,
        // en obra, lo de encima se ve casi transparente: se ve lo que pintas
        opacity: faded ? 0.18 : 1,
        transition: 'opacity 0.3s',
        cursor: editing ? 'grab' : 'default',
        touchAction: 'none',
        outline: selected ? `3px dashed ${C.rose}` : 'none',
        outlineOffset: 5,
        borderRadius: 6,
      }}
    >
      {inner}
    </div>
    </>
  );
}

function placedSize(item, posters, customDecor) {
  if (item.kind === 'mueble') {
    const f = findFurniture(item.refId);
    return f ? { w: f.w, h: f.h, foot: f.foot } : { w: 100, h: 100 };
  }
  if (item.kind === 'poster') return { w: POSTER.w, h: POSTER.h };
  const custom = (customDecor || []).find((d) => String(d.id) === String(item.refId));
  if (custom) {
    const ratio = custom.ratio || 1;
    const base = 110;
    return { w: base, h: base / (ratio || 1) };
  }
  const d = findDecor(item.refId);
  return d ? { w: Math.round(d.w * 1.25), h: Math.round(d.h * 1.25), foot: d.foot * 1.25 } : { w: 92, h: 92 };
}

function renderPlacedContent(item, posters, customDecor, pixel, sky) {
  const { w, h } = placedSize(item, posters, customDecor);
  const sw = Math.round(w * item.scale), sh = Math.round(h * item.scale);
  if (item.kind === 'mueble') {
    const f = findFurniture(item.refId);
    if (!f) return null;
    const paint = item.paint || 'natural';
    // las ventanas muestran el cielo de la hora (noche, atardecer)
    if (f.id === 'ventana' && sky && sky !== 'dia') {
      const pt = { ...(FURNITURE_PAINTS.find((x) => x.id === paint) || FURNITURE_PAINTS[0]), night: sky === 'noche', dusk: sky === 'tarde' };
      return <Sprite markup={f.svg(pt)} cacheKey={`furn-${f.id}-${paint}-${sky}`} w={sw} h={sh} pixel={pixel} />;
    }
    return <Sprite markup={f.svg(paint)} cacheKey={`furn-${f.id}-${paint}`} w={sw} h={sh} pixel={pixel} />;
  }
  if (item.kind === 'poster') {
    const p = (posters || []).find((x) => String(x.id) === String(item.refId));
    if (!p) return null;
    return <FramedPoster poster={p} paint={item.paint || 'natural'} w={sw} h={sh} pixel={pixel} />;
  }
  // decoración: primero la que subió quien regaló, si no la del catálogo
  const custom = (customDecor || []).find((d) => String(d.id) === String(item.refId));
  if (custom) return <Sprite src={custom.image} w={sw} h={sh} kind="art" pixel={pixel} />;
  const d = findDecor(item.refId);
  const paint = item.paint || 'natural';
  return d ? <Sprite markup={d.svg(paint)} cacheKey={`decor-${d.id}-${paint}`} w={sw} h={sh} pixel={pixel} /> : null;
}

// ── El cuarto ────────────────────────────────────────────────────
export default function Room({
  petName, mood, look, posters, customDecor,
  game, setGame, editing, onPokePet, reaction, cameraRef, fullBleed = false,
  extraReserved = 0,   // alto que ocupan paneles abiertos debajo (comida, música)
  parcel = false,      // hay una caja en la puerta
  onOpenParcel,
  summon = null,       // { key, x }: la mascota camina hasta x (p. ej. a abrir la puerta)
  paintJob = null,     // { kind: 'pared'|'piso', value, key }: obra en curso
  onPaintDone,
  world = null,        // { phase, weather, lightsOff }
  onToggleLights,
  asleep = false,      // dormida: no camina
  cleanLevel = 100,    // sucia: manchitas y moscas
  eventLayer = null,   // sucesos dibujados en coordenadas del mundo
  cameraApi = null,    // ref: aquí queda la función que toma la foto (snapshot.js)
}) {
  const viewportRef = useRef(null);
  const worldRef = useRef(null);
  const petRef = useRef(null);

  const { style } = useStyle();
  const walk = getMotion(style.motion).walk;
  const [viewW, setViewW] = useState(340);
  const [viewH, setViewH] = useState(() => computeViewH(editing, extraReserved));
  const zoom = viewH / ROOM.H;
  // Tamaño del píxel de arte en unidades del mundo: así, una vez escalado
  // el cuarto, cada píxel mide en pantalla lo mismo que en el resto del
  // juego. Se redondea el zoom para no redibujar todo por cada píxel de
  // diferencia al girar el teléfono.
  const zq = Math.max(0.3, Math.round(zoom * 20) / 20);
  const pixel = style.art.kind === 'pixel' ? (style.art.pixel || 3) / zq : undefined;
  const [selected, setSelected] = useState(null);

  // Todo el movimiento vive en refs — ver la nota de arriba.
  const pet = useRef({ x: game.petX || ROOM.W / 2, facing: 1, state: 'idle', timer: 1.2, target: 0, speed: 0, phase: 0 });
  const cam = useRef({ x: 0, manualUntil: 0 });
  const drag = useRef(null);

  const worldViewW = viewW / zoom;
  const maxCam = Math.max(0, ROOM.W - worldViewW);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewW(el.clientWidth));
    ro.observe(el);
    setViewW(el.clientWidth);
    const onResize = () => setViewH(computeViewH(editing, extraReserved));
    onResize();
    window.addEventListener('resize', onResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, [editing, extraReserved]);

  // Pinta la posición actual. Se llama desde el bucle y también una vez
  // al montar: si `requestAnimationFrame` está suspendido (pestaña en
  // segundo plano) el cuarto igual aparece bien puesto y no con la
  // mascota pegada al borde izquierdo.
  const paint = useCallback(() => {
    const p = pet.current;
    // La pantalla del cuarto necesita saber qué zona estás mirando para
    // soltar ahí lo que agregues.
    if (cameraRef) cameraRef.current = cam.current.x + worldViewW / 2;
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${-cam.current.x * zoom}px,0,0) scale(${zoom})`;
    }
    if (petRef.current) {
      // Cada estilo camina distinto: pixel salta de a un píxel y sin
      // inclinarse, retro rebota de más, papel va a saltitos.
      let bob = p.state === 'walk' ? Math.abs(Math.sin(p.phase)) * walk.bob : 0;
      const tilt = p.state === 'walk' ? Math.sin(p.phase) * walk.tilt : 0;
      let x = p.x - ROOM.PET_W / 2;
      if (walk.grid) {
        const g = pixel || walk.grid;
        x = Math.round(x / g) * g;
        bob = Math.round(bob / g) * g;
      }
      petRef.current.style.transform =
        `translate3d(${x}px, ${-bob}px, 0) rotate(${tilt}deg) scaleX(${p.facing})`;
    }
  }, [cameraRef, worldViewW, zoom, walk, pixel]);

  useLayoutEffect(() => {
    cam.current.x = clamp(pet.current.x - worldViewW / 2, 0, maxCam);
    paint();
  }, [worldViewW, maxCam, paint, zoom]);

  useEffect(() => {
    let raf, last = performance.now(), lastPaint = 0;
    const frameMs = walk.fps ? 1000 / walk.fps : 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!editing && !paintJob && !asleep) stepPet(pet.current, dt);
      // Pintando: si el dedo llega al borde, la cámara avanza sola (y sigue
      // pintando por donde pasa).
      const d = drag.current;
      if (paintJob && d && d.mode === 'paint' && viewportRef.current) {
        const r = viewportRef.current.getBoundingClientRect();
        const rel = (d.clientX - r.left) / r.width;
        const dir = rel < 0.16 ? -1 : rel > 0.84 ? 1 : 0;
        if (dir) {
          cam.current.x = clamp(cam.current.x + dir * 360 * dt, 0, maxCam);
          const w = { x: cam.current.x + (d.clientX - r.left) / zoom, y: (d.clientY - r.top) / zoom };
          pjRef.current.paint(d.last.x, d.last.y, w.x, w.y);
          d.last = w;
        }
      }
      stepCamera(cam.current, pet.current, dt, worldViewW, maxCam, editing || !!paintJob, now);
      // En papel la mascota se pinta a 8 cuadros por segundo (stop
      // motion), aunque la física siga corriendo suave por debajo.
      if (!frameMs || now - lastPaint >= frameMs) { paint(); lastPaint = now; }
      else if (worldRef.current) worldRef.current.style.transform = `translate3d(${-cam.current.x * zoom}px,0,0) scale(${zoom})`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldViewW, maxCam, editing, paint, zoom, walk, paintJob, asleep]);

  // Obra: pintar la pared o enchapar el piso con el dedo (PaintJob.jsx).
  const pj = usePaintJob(paintJob, onPaintDone);
  const pjRef = useRef(pj);
  pjRef.current = pj;
  const [toolAt, setToolAt] = useState(null);
  const toWorld = useCallback((clientX, clientY) => {
    const r = viewportRef.current.getBoundingClientRect();
    return { x: cam.current.x + (clientX - r.left) / zoom, y: (clientY - r.top) / zoom };
  }, [zoom]);
  useEffect(() => { setToolAt(null); }, [paintJob && paintJob.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Que vaya a algún lado (al timbre, a recibir una visita).
  useEffect(() => {
    if (!summon) return;
    const p = pet.current;
    p.target = clamp(summon.x, ROOM.PET_W * 0.5, ROOM.W - ROOM.PET_W * 0.5);
    p.state = 'walk';
    p.rush = true;
    p.facing = p.target > p.x ? 1 : -1;
    cam.current.manualUntil = 0;
  }, [summon && summon.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guarda dónde quedó la mascota al salir, para que no reaparezca
  // siempre en el mismo sitio.
  useEffect(() => () => {
    setGame((g) => ({ ...g, petX: Math.round(pet.current.x) }));
  }, [setGame]);

  // ── Arrastrar: mueve la cámara, o el objeto si estás editando ────
  const onViewportPointerDown = useCallback((e) => {
    if (drag.current) return;
    // Si se tocó a la mascota, el clic tiene que llegarle a ella: capturar
    // el puntero aquí se lo robaba y con mouse no se podía acariciar.
    if (paintJob) {
      if (e.target.closest && e.target.closest('[data-tap]')) return;
      viewportRef.current.setPointerCapture(e.pointerId);
      const w = toWorld(e.clientX, e.clientY);
      drag.current = { mode: 'paint', last: w, clientX: e.clientX, clientY: e.clientY };
      pjRef.current.paint(w.x, w.y, w.x, w.y);
      setToolAt(w);
      return;
    }
    if (!editing && e.target.closest && e.target.closest('[data-pet-button],[data-tap]')) return;
    viewportRef.current.setPointerCapture(e.pointerId);
    drag.current = { mode: 'cam', x0: e.clientX, cam0: cam.current.x, moved: 0 };
  }, [editing, paintJob, toWorld]);

  const onItemPointerDown = useCallback((e, item) => {
    e.stopPropagation();
    viewportRef.current.setPointerCapture(e.pointerId);
    setSelected(item.key);
    drag.current = { mode: 'item', key: item.key, x0: e.clientX, y0: e.clientY, ix: item.x, iy: item.y, moved: 0 };
  }, []);

  const onPointerMove = useCallback((e) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === 'paint') {
      const w = toWorld(e.clientX, e.clientY);
      pjRef.current.paint(d.last.x, d.last.y, w.x, w.y);
      d.last = w; d.clientX = e.clientX; d.clientY = e.clientY;
      setToolAt(w);
      return;
    }
    if (d.mode === 'cam') {
      const dx = e.clientX - d.x0;
      d.moved = Math.max(d.moved, Math.abs(dx));
      cam.current.x = clamp(d.cam0 - dx / zoom, 0, maxCam);
      cam.current.manualUntil = performance.now() + FOLLOW_AFTER_DRAG;
    } else {
      const dx = (e.clientX - d.x0) / zoom;
      const dy = (e.clientY - d.y0) / zoom;
      d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy));
      setGame((g) => ({
        ...g,
        placed: g.placed.map((it) => (it.key === d.key ? clampPlacement({ ...it, x: d.ix + dx, y: d.iy + dy }, posters, customDecor) : it)),
      }));
    }
  }, [maxCam, setGame, posters, customDecor, toWorld]);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (d && d.mode === 'cam' && d.moved < 5) setSelected(null);
  }, []);

  // La cámara: la foto se centra en la mascota.
  if (cameraApi) {
    cameraApi.current = (opts) => {
      const pr = petRef.current && petRef.current.getBoundingClientRect();
      return takePhoto({ viewport: viewportRef.current, world: worldRef.current, focusX: pr ? pr.left + pr.width / 2 : undefined, ...opts });
    };
  }

  const placed = game.placed || [];
  // Se dibujan de atrás hacia adelante: primero las alfombras (siempre
  // debajo de todo), después muebles y cuadros según qué tan adelante
  // estén, y al final lo chico que va encima de los muebles.
  // (las partidas de antes de la puerta pueden tener algo encima de ella:
  // se muestra corrido, y al moverlo queda guardado en su sitio)
  const sorted = [...placed].map((it) => (it.x < DOOR_ZONE + 60 ? clampPlacement(it, posters, customDecor) : it)).sort((a, b) => layerOf(a) - layerOf(b) || a.y - b.y);
  const sel = placed.find((p) => p.key === selected) || null;

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={viewportRef}
        onPointerDown={onViewportPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={fullBleed ? undefined : 'pg-sticker'}
        style={{
          position: 'relative', width: '100%', height: viewH, overflow: 'hidden',
          // A sangre completa no lleva esquinas ni borde: la escena llega
          // hasta los bordes de la pantalla y se gana ancho para deslizar.
          borderRadius: fullBleed ? 0 : 24,
          borderTop: fullBleed ? `2px solid ${C.line}` : undefined,
          borderBottom: fullBleed ? `2px solid ${C.line}` : undefined,
          touchAction: 'none', cursor: editing ? 'default' : 'grab',
          background: C.paperDeep,
        }}
      >
        <div
          ref={worldRef}
          style={{ position: 'absolute', left: 0, top: 0, width: ROOM.W, height: ROOM.H, transformOrigin: '0 0', willChange: 'transform' }}
        >
          <Wall value={findWall(game.wall).value} pixel={pixel} />
          {paintJob && paintJob.kind === 'pared' && <PaintLayer job={paintJob} done={pj.done} pixel={pixel} />}
          <Floor value={findFloor(game.floor).value} pixel={pixel} />
          {paintJob && paintJob.kind === 'piso' && <PaintLayer job={paintJob} done={pj.done} pixel={pixel} />}
          <Ambience styleId={style.id} layer="back" />

          {/* puerta de entrada y su tapete (fijos) */}
          <div style={{ position: 'absolute', left: DOOR_X, top: ROOM.FLOOR_Y + 6 - DOOR.h, width: DOOR.w, height: DOOR.h, pointerEvents: 'none' }}>
            <Sprite markup={doorSvg()} cacheKey="door" w={DOOR.w} h={DOOR.h} pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: DOOR_X - 12, top: ROOM.FLOOR_Y + 4, width: 140, height: 44, pointerEvents: 'none' }}>
            <Sprite markup={doormatSvg()} cacheKey="doormat" w={140} h={44} pixel={pixel} />
          </div>

          {sorted.map((item) => (
            <PlacedItem
              key={item.key} item={item} posters={posters} customDecor={customDecor}
              selected={selected === item.key} editing={editing} onPointerDown={onItemPointerDown} pixel={pixel}
              faded={false} sky={world && world.phase === 'manana' ? 'dia' : world && world.phase}
            />
          ))}

          {world && <WeatherOnWindows weather={world.weather} placed={placed} />}
          {onToggleLights && <LightSwitch x={DOOR_X + DOOR.w + 12} y={ROOM.FLOOR_Y - 150} lightsOff={world && world.lightsOff} onToggle={onToggleLights} pixel={pixel} />}
          {parcel && (
            <button
              data-tap onClick={onOpenParcel} aria-label="Abrir el pedido" className="pg-parcel"
              style={{ position: 'absolute', left: DOOR_X + 4, top: ROOM.H - 104, width: 100, height: 96, padding: 0, border: 'none', background: 'none', cursor: 'pointer', zIndex: 2 }}
            >
              <Sprite markup={parcelSvg(false)} cacheKey="parcel-closed" w={100} h={96} pixel={pixel} />
            </button>
          )}

          {/* La mascota va siempre delante de los muebles: por eso los
              muebles quedan pegados al fondo del piso. */}
          <div
            ref={petRef}
            style={{
              opacity: 1,
              position: 'absolute', left: 0, top: ROOM.H - ROOM.PET_W - 6,
              width: ROOM.PET_W, height: ROOM.PET_W, willChange: 'transform',
              transformOrigin: '50% 92%',
            }}
          >
            <Pet mood={mood} look={look} size={ROOM.PET_W} onPoke={onPokePet} reaction={reaction} pixel={pixel} />
            <Dirt level={cleanLevel} />
            {asleep && <Zzz />}
          </div>
          {eventLayer}
          <Ambience styleId={style.id} layer="front" />
          {world && <NightLayer phase={world.phase} lightsOff={world.lightsOff} placed={placed} styleId={style.id} />}
          {paintJob && <PaintTool job={paintJob} at={toolAt} />}
        </div>
        {paintJob && <PaintHud job={paintJob} progress={pj.progress} onCancel={() => onPaintDone && onPaintDone(null)} onFillRest={pj.fillRest} />}

        {/* pista de que el cuarto sigue a los lados */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg, rgba(20,12,20,0.12), transparent 8%, transparent 92%, rgba(20,12,20,0.12))' }} />
        <div style={{ position: 'absolute', right: 10, bottom: 7, fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: '#FFFFFF', textShadow: '0 1px 0 rgba(0,0,0,0.55), 0 0 4px rgba(0,0,0,0.45)', opacity: 0.92, pointerEvents: 'none' }}>
          {paintJob ? '' : editing ? 'arrastra para acomodar' : 'desliza para ver el cuarto'}
        </div>
      </div>

      {/* barra del objeto seleccionado */}
      {editing && sel && (
        <div className="pg-card" style={{ marginTop: 10, padding: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginRight: 2 }}>
            {labelFor(sel, posters, customDecor)}
          </span>
          <SmallBtn onClick={() => updateSel(setGame, sel.key, (it) => ({ ...it, scale: clamp(it.scale * 1.12, 0.4, 2.2) }))}>＋</SmallBtn>
          <SmallBtn onClick={() => updateSel(setGame, sel.key, (it) => ({ ...it, scale: clamp(it.scale / 1.12, 0.4, 2.2) }))}>－</SmallBtn>
          <SmallBtn onClick={() => updateSel(setGame, sel.key, (it) => ({ ...it, flip: (it.flip || 1) * -1 }))}>⇄</SmallBtn>
          <SmallBtn
            danger
            onClick={() => { setGame((g) => ({ ...g, placed: g.placed.filter((it) => it.key !== sel.key) })); setSelected(null); }}
          >
            Quitar
          </SmallBtn>
          {(sel.kind === 'mueble' || sel.kind === 'poster' || (sel.kind === 'decor' && (findDecor(sel.refId) || {}).paintable)) && (
            <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, width: '100%', overflowX: 'auto', paddingTop: 4 }}>
              {FURNITURE_PAINTS.map((pt) => (
                <button
                  key={pt.id} title={pt.name} aria-label={`Pintar ${pt.name}`} className="pg-focus pg-keep-round"
                  onClick={() => {
                    updateSel(setGame, sel.key, (it) => ({ ...it, paint: pt.id }));
                    const field = sel.kind === 'mueble' ? 'furniturePaint' : sel.kind === 'poster' ? 'posterPaint' : 'decorPaint';
                    setGame((g) => ({ ...g, [field]: { ...(g[field] || {}), [sel.refId]: pt.id } }));
                  }}
                  style={{
                    width: 26, height: 26, flexShrink: 0, borderRadius: '50%', padding: 0, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${pt.wood} 50%, ${pt.cloth} 50%)`,
                    border: (sel.paint || 'natural') === pt.id ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SmallBtn({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="pg-focus"
      style={{
        padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
        fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
        background: danger ? C.surface : C.surfaceAlt,
        color: danger ? C.rose : C.ink, minWidth: 40,
        border: `1.5px solid ${danger ? C.rose : C.line}`,
      }}
    >
      {children}
    </button>
  );
}

function updateSel(setGame, key, fn) {
  setGame((g) => ({ ...g, placed: g.placed.map((it) => (it.key === key ? fn(it) : it)) }));
}

// Capa de dibujo: alfombras abajo de todo; lo que va "sobre" un mueble,
// arriba de todo.
function layerOf(item) {
  if (item.kind === 'mueble') {
    const f = findFurniture(item.refId);
    return f && f.layer === 'suelo' ? 0 : 1;
  }
  if (item.kind === 'decor') {
    const d = findDecor(item.refId);
    return d && d.place === 'sobre' ? 2 : 1;
  }
  return 1;
}

function labelFor(item, posters, customDecor) {
  if (item.kind === 'mueble') return (findFurniture(item.refId) || {}).name || 'Mueble';
  if (item.kind === 'poster') return 'Póster';
  const custom = (customDecor || []).find((d) => String(d.id) === String(item.refId));
  if (custom) return custom.name;
  return (findDecor(item.refId) || {}).name || 'Decoración';
}

// Mantiene cada cosa donde tiene sentido: los pósters y lo que cuelga,
// en la pared; los muebles, apoyados en el piso y siempre detrás de la
// mascota.
export function clampPlacement(item, posters, customDecor) {
  const { w, h } = placedSize(item, posters, customDecor);
  const sw = w * item.scale, sh = h * item.scale;
  const f = item.kind === 'mueble' ? findFurniture(item.refId) : null;
  const d = item.kind === 'decor' ? findDecor(item.refId) : null;
  const onWall = item.kind === 'poster' || (f && f.place === 'pared');
  const anywhere = d && d.place === 'sobre';   // encima de una mesa, una repisa…
  const x = clamp(item.x, DOOR_ZONE + sw / 2, ROOM.W - sw / 2 - 8);
  let y;
  if (onWall) y = clamp(item.y, ROOM.WALL_PAD + sh, ROOM.FLOOR_Y - 14);
  else if (anywhere) y = clamp(item.y, ROOM.WALL_PAD + sh, ROOM.H - 30);
  else if (f && f.layer === 'suelo') y = clamp(item.y, ROOM.FLOOR_Y + 30, ROOM.H - 4);
  else y = clamp(item.y, ROOM.FLOOR_Y + 8, ROOM.H - 34);
  return { ...item, x, y };
}

// Dónde cae algo nuevo: en el centro de lo que estás mirando, pero
// buscando un hueco. Sin esto todo aterriza en el mismo punto y lo que
// ves es una pila, no un cuarto.
export function defaultPlacement(kind, refId, posters, customDecor, opts = {}) {
  const { centerX = ROOM.W / 2, placed = [], paint = 'natural' } = opts;
  const f = kind === 'mueble' ? findFurniture(refId) : null;
  const onWall = kind === 'poster' || (f && f.place === 'pared');
  const y = onWall ? ROOM.FLOOR_Y - 110 : (f && f.layer === 'suelo') ? ROOM.H - 12 : ROOM.H - 60;
  const { w } = placedSize({ kind, refId, scale: 1 }, posters, customDecor);

  // Se prueban posiciones alternando a un lado y al otro del centro.
  const sameLevel = placed.filter((p) => Math.abs(p.y - y) < 70);
  const free = (x) => sameLevel.every((p) => {
    const pw = placedSize(p, posters, customDecor).w * p.scale;
    return Math.abs(p.x - x) > (pw + w) * 0.42;
  });

  let x = clamp(centerX, 110, ROOM.W - 110);
  if (!free(x)) {
    const step = Math.max(90, w * 0.75);
    for (let i = 1; i <= 14; i++) {
      const cand = clamp(centerX + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * step, 110, ROOM.W - 110);
      if (free(cand)) { x = cand; break; }
      x = cand;  // si nada queda libre, al menos no se apila encima
    }
  }
  return clampPlacement({ kind, refId, scale: 1, flip: 1, paint, x, y }, posters, customDecor);
}
