import React, { useCallback, useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Sprite from '../components/Sprite';
import { PetRecipeMarkup, randomRecipe } from '../PetRecipe';
import {
  SHAPES as BODIES, EARS, EYES, MOUTHS, CHEEKS as CHEEK_STYLES, TAILS, PATTERNS,
  HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES,
} from '../art/mochi';
import { PET_STYLES } from '../petStyles';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS, wallSvg, floorSvg } from '../roomCatalog';
import { STYLE_LIST, getStyle } from '../styles/registry';
import { getMotion } from '../styles/motion';
import { useStyle } from '../styles/StyleContext';
import { renderArt } from '../art/render';

const findPart = (list, id) => list.find((p) => p.id === id) || list[0];
import { ROOM } from '../gameState';
import { play } from '../sound';
import { C, FONT, SHADOW } from '../theme';

// ─────────────────────────────────────────────────────────────────
// Aleatorizador (solo desarrollo): /aleatorio
// Cada 3 s una mascota nueva con rasgos al azar, en un estilo al azar y
// en un cuarto al azar. La siguiente se prepara mientras se ve la
// actual, así el cambio es inmediato.
// ─────────────────────────────────────────────────────────────────

const INTERVAL = 3000;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const MOODS = ['normal', 'feliz', 'enojado'];
const FLOOR_FURNITURE = FURNITURE.filter((f) => f.place !== 'pared' && f.layer !== 'suelo');
const WALL_FURNITURE = FURNITURE.filter((f) => f.place === 'pared');

const ROOM_W = 900;
const ZOOM = 0.64;

const petArt = (recipe, mood) => (
  <svg viewBox="0 0 200 200" width="200" height="200"><PetRecipeMarkup recipe={recipe} mood={mood} /></svg>
);
const pickTint = (p) => `${p.id}.${pick(p.tints).id}`;

// En pixel, el cuarto está escalado: hay que corregir el tamaño de píxel
// para que se vea igual que en el juego.
const roomPixel = (id) => { const a = getStyle(id).art; return a.kind === 'pixel' ? a.pixel / ZOOM : undefined; };

let seq = 0;
function makeCombo(prevStyle) {
  seq += 1;
  // Mitad totalmente al azar, mitad partiendo de un estilo de mascota
  // (gótico, rockero…) con algún rasgo cambiado: así salen tanto
  // combinaciones raras como personajes con carácter.
  let recipe = randomRecipe();
  if (Math.random() < 0.45) {
    const preset = pick(PET_STYLES).recipe;
    recipe = { ...recipe, ...preset, [pick(['ears', 'eyes', 'mouth', 'tail', 'headAcc'])]: recipe[pick(['ears', 'eyes', 'mouth', 'tail', 'headAcc'])] };
  }
  let styleId = pick(STYLE_LIST).id;
  if (styleId === prevStyle) styleId = pick(STYLE_LIST.filter((s) => s.id !== prevStyle)).id;
  const left = pick(FLOOR_FURNITURE);
  const right = pick(FLOOR_FURNITURE.filter((f) => f.id !== left.id));
  return {
    id: seq, recipe, styleId,
    wall: pickTint(pick(WALL_STYLES)), floor: pickTint(pick(FLOOR_STYLES)),
    left, right, hang: pick(WALL_FURNITURE),
    paintL: pick(FURNITURE_PAINTS).id, paintR: pick(FURNITURE_PAINTS).id,
    mood: pick(MOODS),
  };
}

// Las mismas peticiones que hará <Sprite>, hechas por adelantado.
function prefetch(c) {
  const pixelOf = roomPixel;
  const jobs = [
    { art: petArt(c.recipe, c.mood), key: `rnd-pet-${c.id}-${c.mood}`, w: ROOM.PET_W, h: ROOM.PET_W, kind: 'pet', pixel: pixelOf(c.styleId) },
    ...MOODS.map((m) => ({ art: petArt(c.recipe, m), key: `rnd-pet-${c.id}-${m}-mini`, w: 84, h: 84, kind: 'pet' })),
    { markup: wallSvg(c.wall, ROOM_W, ROOM.FLOOR_Y), key: `rnd-wall-${c.wall}`, w: ROOM_W, h: ROOM.FLOOR_Y, kind: 'surface', fit: 'cover', pixel: pixelOf(c.styleId) },
    { markup: floorSvg(c.floor, ROOM_W, ROOM.H - ROOM.FLOOR_Y), key: `rnd-floor-${c.floor}`, w: ROOM_W, h: ROOM.H - ROOM.FLOOR_Y, kind: 'surface', fit: 'cover', pixel: pixelOf(c.styleId) },
    { markup: c.left.svg(c.paintL), key: `furn-${c.left.id}-${c.paintL}`, w: c.left.w, h: c.left.h, pixel: pixelOf(c.styleId) },
    { markup: c.right.svg(c.paintR), key: `furn-${c.right.id}-${c.paintR}`, w: c.right.w, h: c.right.h, pixel: pixelOf(c.styleId) },
    { markup: c.hang.svg('natural'), key: `furn-${c.hang.id}-natural`, w: c.hang.w, h: c.hang.h, pixel: pixelOf(c.styleId) },
  ];
  return Promise.all(jobs.map((j) => renderArt({
    markup: j.markup || renderToStaticMarkup(j.art), sourceKey: `k:${j.key}`, w: j.w, h: j.h, kind: j.kind || 'art', fit: j.fit, pixel: j.pixel, styleId: c.styleId,
  }).catch(() => null)));
}

function Traits({ r }) {
  const rows = [
    ['Cuerpo', findPart(BODIES, r.body)], ['Orejas', findPart(EARS, r.ears)], ['Ojos', findPart(EYES, r.eyes)],
    ['Boca', findPart(MOUTHS, r.mouth)], ['Cachetes', findPart(CHEEK_STYLES, r.cheeks)], ['Cola', findPart(TAILS, r.tail)],
    ['Estampado', findPart(PATTERNS, r.pattern)], ['Cabeza', findPart(HEAD_ACCESSORIES, r.headAcc)],
    ['Cuello', findPart(NECK_ACCESSORIES, r.neckAcc)], ['Extra', findPart(EXTRA_ACCESSORIES, r.extraAcc)],
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {rows.map(([k, p]) => (
        <span key={k} style={{ fontFamily: FONT.body, fontSize: 12, color: C.ink, background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 999, padding: '3px 10px' }}>
          <b style={{ color: C.inkSoft, fontWeight: 700 }}>{k}:</b> {p.label || p.id}
        </span>
      ))}
      <span style={{ display: 'flex', gap: 3, alignItems: 'center', padding: '0 4px' }}>
        {[r.bodyColor, r.innerColor, r.accentColor, r.accentAlt, r.eyeColor].map((c, i) => (
          <span key={i} style={{ width: 16, height: 16, borderRadius: 5, background: c, border: `1.5px solid ${C.line}` }} />
        ))}
      </span>
    </div>
  );
}

export default function Randomizer() {
  const { setStyleId } = useStyle();
  const [cur, setCur] = useState(() => makeCombo(null));
  const [paused, setPaused] = useState(false);
  const [count, setCount] = useState(1);
  const nextRef = useRef(null);
  const curRef = useRef(cur);
  curRef.current = cur;

  // El estilo de la página entera (fondo, letras, colores) es el de la
  // mascota que se está viendo.
  useEffect(() => { setStyleId(cur.styleId); }, [cur.styleId]); // eslint-disable-line react-hooks/exhaustive-deps
  // Al salir, se deja el estilo que la persona tenía antes.
  const before = useRef(null);
  useEffect(() => {
    try { before.current = localStorage.getItem('tamagift:lastStyle'); } catch (e) { /* nada */ }
    return () => { if (before.current) setStyleId(before.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const prepareNext = useCallback((after) => {
    const n = makeCombo((after || curRef.current).styleId);
    nextRef.current = { combo: n, ready: prefetch(n) };
  }, []);

  useEffect(() => { prefetch(cur); prepareNext(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(async () => {
    if (!nextRef.current) prepareNext();
    const { combo, ready } = nextRef.current;
    await ready;
    setCur(combo);
    setCount((k) => k + 1);
    setTimeout(() => play('pop'), 30);
    prepareNext(combo);
  }, [prepareNext]);

  useEffect(() => {
    if (paused) return undefined;
    const t = setTimeout(advance, INTERVAL);
    return () => clearTimeout(t);
  }, [cur, paused, advance]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); }
      if (e.key === 'ArrowRight') advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  const c = cur;
  const sid = c.styleId;
  const pixel = roomPixel(sid);
  const st = getStyle(sid);
  const motion = getMotion(st.motion);

  return (
    <div key={c.id} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 16px 30px', gap: 14, color: C.ink }}>
      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ margin: 0 }}>Aleatorizador · mascota #{count}</p>
        <h1 style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 800, margin: '4px 0 0' }}>{st.name}</h1>
        <p style={{ fontSize: 13, color: C.inkSoft, margin: '2px 0 0' }}>{st.tagline}</p>
      </div>

      {/* El cuarto, con los mismos sprites que el juego */}
      <div className="pg-sticker" style={{ width: ROOM_W * ZOOM, height: ROOM.H * ZOOM, position: 'relative', overflow: 'hidden', borderRadius: 22, maxWidth: '96vw' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: ROOM_W, height: ROOM.H, transform: `scale(${ZOOM})`, transformOrigin: '0 0' }}>
          <div style={{ position: 'absolute', left: 0, top: 0 }}>
            <Sprite styleId={sid} markup={wallSvg(c.wall, ROOM_W, ROOM.FLOOR_Y)} cacheKey={`rnd-wall-${c.wall}`} w={ROOM_W} h={ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: ROOM.FLOOR_Y }}>
            <Sprite styleId={sid} markup={floorSvg(c.floor, ROOM_W, ROOM.H - ROOM.FLOOR_Y)} cacheKey={`rnd-floor-${c.floor}`} w={ROOM_W} h={ROOM.H - ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: ROOM_W / 2 - c.hang.w / 2, top: 200 - c.hang.h }}>
            <Sprite styleId={sid} markup={c.hang.svg('natural')} cacheKey={`furn-${c.hang.id}-natural`} w={c.hang.w} h={c.hang.h} pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: 190 - c.left.w / 2, top: 404 - c.left.h }}>
            <Sprite styleId={sid} markup={c.left.svg(c.paintL)} cacheKey={`furn-${c.left.id}-${c.paintL}`} w={c.left.w} h={c.left.h} pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: 710 - c.right.w / 2, top: 404 - c.right.h }}>
            <Sprite styleId={sid} markup={c.right.svg(c.paintR)} cacheKey={`furn-${c.right.id}-${c.paintR}`} w={c.right.w} h={c.right.h} pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: ROOM_W / 2 - ROOM.PET_W / 2, top: ROOM.H - ROOM.PET_W - 6, animation: 'pg-pop-in 0.35s ease-out' }}>
            <div style={{ animation: motion.idle(c.mood), transformOrigin: '50% 88%' }}><Sprite styleId={sid} art={petArt(c.recipe, c.mood)} cacheKey={`rnd-pet-${c.id}-${c.mood}`} w={ROOM.PET_W} h={ROOM.PET_W} kind="pet" pixel={pixel} /></div>
          </div>
        </div>
      </div>

      {/* Sus tres ánimos */}
      <div style={{ display: 'flex', gap: 12 }}>
        {MOODS.map((m) => (
          <div key={m} className="pg-card" style={{ padding: '6px 8px 4px', textAlign: 'center', borderColor: m === c.mood ? C.rose : C.line }}>
            <Sprite styleId={sid} art={petArt(c.recipe, m)} cacheKey={`rnd-pet-${c.id}-${m}-mini`} w={84} h={84} kind="pet" />
            <div style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkSoft }}>{m}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 720 }}><Traits r={c.recipe} /></div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setPaused((p) => !p)} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '10px 22px', fontSize: 14 }}>
          {paused ? 'Seguir' : 'Pausar'}
        </button>
        <button onClick={advance} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '10px 22px', fontSize: 14, boxShadow: SHADOW.soft }}>
          Siguiente
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: C.inkFaint, margin: 0 }}>Cambia cada 3 segundos · espacio = pausar · flecha derecha = siguiente</p>
    </div>
  );
}
