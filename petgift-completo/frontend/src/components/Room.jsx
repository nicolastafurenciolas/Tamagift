import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { C, FONT, SHADOW } from '../theme';
import Pet from './Pet';
import { ROOM } from '../gameState';
import { findFurniture, findWall, findFloor, findPaint } from '../roomCatalog';
import { findDecor } from '../shopCatalog';

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
const VIEW_H_MAX = 330;
const VIEW_H_MIN = 230;
const RESERVED = 330;   // lo que ocupan barra de arriba, dock y márgenes
function computeViewH() {
  if (typeof window === 'undefined') return VIEW_H_MAX;
  return Math.round(clampNum(window.innerHeight - RESERVED, VIEW_H_MIN, VIEW_H_MAX));
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
    const wanted = WALK_SPEED * clamp(absd / 70, 0.25, 1);
    p.speed += (wanted - p.speed) * Math.min(1, dt * 4);
    p.x += dir * p.speed * dt;
    p.phase += dt * (p.speed / WALK_SPEED) * 7.5;
    if (absd < 3) {
      p.x = p.target;
      p.state = 'idle';
      p.speed = 0;
      p.timer = 2.6 + rnd() * 6.5;
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
// La pared y el piso llevan luz propia: sin esto el cuarto es un par de
// rectángulos de color plano con rayas encima, que es justo lo que se
// veía como "hecho en Paint".

function Wall({ wall }) {
  const w = ROOM.W, h = ROOM.FLOOR_Y;
  const gid = `wallgrad-${wall.id}`;
  const vid = `wallvig-${wall.id}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        {/* La luz entra por arriba: la pared se oscurece hacia abajo. */}
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.20" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="1" stopColor="#4A3439" stopOpacity="0.16" />
        </linearGradient>
        {/* Viñeta suave a los lados, para que el cuarto tenga esquinas. */}
        <linearGradient id={vid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4A3439" stopOpacity="0.14" />
          <stop offset="0.06" stopColor="#4A3439" stopOpacity="0" />
          <stop offset="0.94" stopColor="#4A3439" stopOpacity="0" />
          <stop offset="1" stopColor="#4A3439" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={w} height={h} fill={wall.base} />
      {wall.render && wall.render(w, h)}
      <rect x="0" y="0" width={w} height={h} fill={`url(#${gid})`} />
      <rect x="0" y="0" width={w} height={h} fill={`url(#${vid})`} />

      {/* Rodapié: da el corte entre pared y piso y ancla la habitación. */}
      <rect x="0" y={h - 26} width={w} height="26" fill="#4A3439" opacity="0.10" />
      <rect x="0" y={h - 20} width={w} height="20" fill="#F6EFE6" />
      <rect x="0" y={h - 20} width={w} height="4" fill="#FFFFFF" opacity="0.7" />
      <rect x="0" y={h - 6} width={w} height="6" fill="#4A3439" opacity="0.22" />
      <rect x="0" y={h - 2} width={w} height="2" fill="#4A3439" opacity="0.35" />
    </svg>
  );
}

function Floor({ floor }) {
  const w = ROOM.W, h = ROOM.H - ROOM.FLOOR_Y;
  const gid = `floorgrad-${floor.id}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: ROOM.FLOOR_Y }}>
      <defs>
        {/* El piso se aclara hacia adelante: es lo que lo saca de verse
            como una franja plana pegada a la pared. */}
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A3439" stopOpacity="0.30" />
          <stop offset="0.35" stopColor="#4A3439" stopOpacity="0.06" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={w} height={h} fill={floor.base} />
      {floor.render && floor.render(w, h)}
      <rect x="0" y="0" width={w} height={h} fill={`url(#${gid})`} />
      {/* sombra de contacto contra el rodapié */}
      <rect x="0" y="0" width={w} height="14" fill="#4A3439" opacity="0.18" />
      <rect x="0" y="0" width={w} height="3" fill="#4A3439" opacity="0.3" />
    </svg>
  );
}

// Un objeto puesto en el cuarto. `item` trae posición y tamaño; el
// contenido depende de si es mueble, decoración o póster.
function PlacedItem({ item, posters, customDecor, selected, editing, onPointerDown }) {
  const inner = renderPlacedContent(item, posters, customDecor);
  if (!inner) return null;
  const { w, h } = placedSize(item, posters, customDecor);
  const f = item.kind === 'mueble' ? findFurniture(item.refId) : null;
  const onFloor = !(item.kind === 'poster' || (f && f.place === 'pared'));
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
            background: 'radial-gradient(ellipse, rgba(74,52,57,0.34) 0%, rgba(74,52,57,0) 72%)',
            pointerEvents: 'none',
          }}
        />
      )}
    <div
      onPointerDown={editing ? (e) => onPointerDown(e, item) : undefined}
      style={{
        position: 'absolute',
        left: item.x - (w * item.scale) / 2,
        top: item.y - h * item.scale,
        width: w * item.scale,
        height: h * item.scale,
        transform: `scaleX(${item.flip || 1})`,
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
    return f ? { w: f.w, h: f.h } : { w: 100, h: 100 };
  }
  if (item.kind === 'poster') return { w: 120, h: 156 };
  const custom = (customDecor || []).find((d) => String(d.id) === String(item.refId));
  if (custom) {
    const ratio = custom.ratio || 1;
    const base = 110;
    return { w: base, h: base / (ratio || 1) };
  }
  return { w: 92, h: 92 };
}

function renderPlacedContent(item, posters, customDecor) {
  if (item.kind === 'mueble') {
    const f = findFurniture(item.refId);
    if (!f) return null;
    return f.render(findPaint(item.paint));
  }
  if (item.kind === 'poster') {
    const p = (posters || []).find((x) => x.id === item.refId);
    if (!p) return null;
    return (
      <div style={{
        width: '100%', height: '100%', background: '#FFF9F0', padding: 7,
        border: `4px solid ${C.ink}`, borderRadius: 4, boxShadow: '5px 7px 0 rgba(74,52,57,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {p.type === 'photo'
          ? <img src={p.url} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{p.emoji}</div>}
      </div>
    );
  }
  // decoración: primero la que subió quien regaló, si no la del catálogo
  const custom = (customDecor || []).find((d) => String(d.id) === String(item.refId));
  if (custom) {
    return <img src={custom.image} alt={custom.name} draggable="false" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(3px 5px 0 rgba(74,52,57,0.2))' }} />;
  }
  const d = findDecor(item.refId);
  return d ? d.render() : null;
}

// ── El cuarto ────────────────────────────────────────────────────
export default function Room({
  petName, mood, drawingUrl, posters, customDecor,
  game, setGame, editing, onPokePet, reaction, cameraRef, fullBleed = false,
}) {
  const viewportRef = useRef(null);
  const worldRef = useRef(null);
  const petRef = useRef(null);

  const [viewW, setViewW] = useState(340);
  const [viewH, setViewH] = useState(computeViewH);
  const zoom = viewH / ROOM.H;
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
    const onResize = () => setViewH(computeViewH());
    window.addEventListener('resize', onResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, []);

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
      const bob = p.state === 'walk' ? Math.abs(Math.sin(p.phase)) * 5 : 0;
      const tilt = p.state === 'walk' ? Math.sin(p.phase) * 2.2 : 0;
      petRef.current.style.transform =
        `translate3d(${p.x - ROOM.PET_W / 2}px, ${-bob}px, 0) rotate(${tilt}deg) scaleX(${p.facing})`;
    }
  }, [cameraRef, worldViewW, zoom]);

  useLayoutEffect(() => {
    cam.current.x = clamp(pet.current.x - worldViewW / 2, 0, maxCam);
    paint();
  }, [worldViewW, maxCam, paint, zoom]);

  useEffect(() => {
    let raf, last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!editing) stepPet(pet.current, dt);
      stepCamera(cam.current, pet.current, dt, worldViewW, maxCam, editing, now);
      paint();
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldViewW, maxCam, editing, paint, zoom]);

  // Guarda dónde quedó la mascota al salir, para que no reaparezca
  // siempre en el mismo sitio.
  useEffect(() => () => {
    setGame((g) => ({ ...g, petX: Math.round(pet.current.x) }));
  }, [setGame]);

  // ── Arrastrar: mueve la cámara, o el objeto si estás editando ────
  const onViewportPointerDown = useCallback((e) => {
    if (drag.current) return;
    viewportRef.current.setPointerCapture(e.pointerId);
    drag.current = { mode: 'cam', x0: e.clientX, cam0: cam.current.x, moved: 0 };
  }, []);

  const onItemPointerDown = useCallback((e, item) => {
    e.stopPropagation();
    viewportRef.current.setPointerCapture(e.pointerId);
    setSelected(item.key);
    drag.current = { mode: 'item', key: item.key, x0: e.clientX, y0: e.clientY, ix: item.x, iy: item.y, moved: 0 };
  }, []);

  const onPointerMove = useCallback((e) => {
    const d = drag.current;
    if (!d) return;
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
  }, [maxCam, setGame, posters, customDecor]);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (d && d.mode === 'cam' && d.moved < 5) setSelected(null);
  }, []);

  const placed = game.placed || [];
  // Se dibujan de atrás hacia adelante: lo que está más abajo en el
  // piso tapa a lo que está más arriba. Da profundidad gratis.
  const sorted = [...placed].sort((a, b) => a.y - b.y);
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
          background: findWall(game.wall).base,
        }}
      >
        <div
          ref={worldRef}
          style={{ position: 'absolute', left: 0, top: 0, width: ROOM.W, height: ROOM.H, transformOrigin: '0 0', willChange: 'transform' }}
        >
          <Wall wall={findWall(game.wall)} />
          <Floor floor={findFloor(game.floor)} />

          {sorted.map((item) => (
            <PlacedItem
              key={item.key} item={item} posters={posters} customDecor={customDecor}
              selected={selected === item.key} editing={editing} onPointerDown={onItemPointerDown}
            />
          ))}

          {/* La mascota va siempre delante de los muebles: por eso los
              muebles quedan pegados al fondo del piso. */}
          <div
            ref={petRef}
            style={{
              position: 'absolute', left: 0, top: ROOM.H - ROOM.PET_W - 6,
              width: ROOM.PET_W, height: ROOM.PET_W, willChange: 'transform',
              transformOrigin: '50% 92%',
            }}
          >
            <Pet mood={mood} drawingUrl={drawingUrl} size={ROOM.PET_W} onPoke={onPokePet} reaction={reaction} />
          </div>
        </div>

        {/* pista de que el cuarto sigue a los lados */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg, rgba(74,52,57,0.10), transparent 8%, transparent 92%, rgba(74,52,57,0.10))' }} />
        <div style={{ position: 'absolute', right: 10, bottom: 7, fontFamily: FONT.display, fontSize: 10, fontWeight: 700, color: 'rgba(74,52,57,0.42)', pointerEvents: 'none' }}>
          {editing ? 'arrastra para acomodar' : 'desliza para ver el cuarto'}
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
        color: danger ? C.rose : C.ink,
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
  const onWall = item.kind === 'poster' || (f && f.place === 'pared');
  const x = clamp(item.x, sw / 2 + 8, ROOM.W - sw / 2 - 8);
  const y = onWall
    ? clamp(item.y, ROOM.WALL_PAD + sh, ROOM.FLOOR_Y - 14)
    : clamp(item.y, ROOM.FLOOR_Y + 8, ROOM.H - 34);
  return { ...item, x, y };
}

// Dónde cae algo nuevo: en el centro de lo que estás mirando, pero
// buscando un hueco. Sin esto todo aterriza en el mismo punto y lo que
// ves es una pila, no un cuarto.
export function defaultPlacement(kind, refId, posters, customDecor, opts = {}) {
  const { centerX = ROOM.W / 2, placed = [], paint = 'natural' } = opts;
  const f = kind === 'mueble' ? findFurniture(refId) : null;
  const onWall = kind === 'poster' || (f && f.place === 'pared');
  const y = onWall ? ROOM.FLOOR_Y - 110 : ROOM.H - 60;
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
