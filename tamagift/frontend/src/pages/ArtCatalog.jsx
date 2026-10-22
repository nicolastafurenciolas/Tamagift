import React, { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { drawArt } from '../art/kit';
import {
  mochiSvg, SHAPES, MOODS, EARS, EYES, MOUTHS, CHEEKS, TAILS, PATTERNS,
  HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES,
} from '../art/mochi';
import { STYLE_LIST, getStyle } from '../styles/registry';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS, findPaint, findFurniture, findWall, findFloor } from '../roomCatalog';
import { FOOD_SPRITES, UI_SPRITES } from '../sprites';
import { DECOR_CATALOG } from '../shopCatalog';
import { Car, Candy, SimonPad, SIMON_PADS, Pipe } from '../gameArt';
import { PET_STYLES } from '../petStyles';
import { DEFAULT_RECIPE } from '../PetRecipe';
import { ROOM } from '../gameState';

// ─────────────────────────────────────────────────────────────────
// Catálogo de arte (solo desarrollo): /arte
// TODO el arte de Tamagift dibujado por cada estilo, sección por
// sección: la mochi y sus piezas, accesorios, estilos de partida,
// cuartos armados, muebles, paredes, pisos, decoración, comida, íconos
// y minijuegos. Cada sección se dibuja recién cuando aparece en
// pantalla, así la página abre al toque.
// ─────────────────────────────────────────────────────────────────

const FAMILY = [
  { name: 'Nube', r: { ears: 'gato', mouth: 'w', bodyColor: '#FBEEE6', accentColor: '#E9B9A2', innerColor: '#FFFFFF', eyeColor: '#6F6A8A' } },
  { name: 'Algodón', r: { ears: 'conejoCaido', mouth: 'w', bodyColor: '#F3E6FF', innerColor: '#FFFFFF', accentColor: '#D7C0F0', eyeColor: '#8A6AA8' } },
  { name: 'Moca', r: { ears: 'oso', mouth: 'hocico', bodyColor: '#D9B08C', innerColor: '#F8E7D2', accentColor: '#A7754F', eyeColor: '#6B4A34' } },
  { name: 'Pío', r: { ears: 'pollito', mouth: 'pico', bodyColor: '#FFE58A', innerColor: '#FFF6C9', accentColor: '#F7C948', eyeColor: '#7A6A3A' } },
  { name: 'Perla', r: { ears: 'ninguna', mouth: 'hocico', bodyColor: '#DFE8F2', innerColor: '#FFFFFF', accentColor: '#B6C7DA', eyeColor: '#5A6A8A' } },
  { name: 'Tito', r: { ears: 'rana', mouth: 'sonrisa', bodyColor: '#B8E6A3', innerColor: '#EFFBE6', accentColor: '#8FCF7A', eyeColor: '#4A6A3A' } },
];
const MOOD_LABEL = { normal: 'Normal', feliz: 'Feliz', triste: 'Triste', enojado: 'Enojado', dormido: 'Dormido', sorprendido: 'Sorprendido' };
const preset = (id) => ({ ...DEFAULT_RECIPE, ...(PET_STYLES.find((p) => p.id === id) || PET_STYLES[0]).recipe });

const svgOf = (el) => renderToStaticMarkup(el);
const pet = (name, r, mood = 'normal') => ({ name, type: 'pet', r, mood });
const art = (name, el, w, h, kind = 'art') => ({ name, type: 'art', markup: typeof el === 'string' ? el : svgOf(el), w, h, kind });
const surface = (st, w, h) => svgOf(<svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}><rect width={w} height={h} fill={st.base} />{st.render && st.render(w, h)}</svg>);

// Las piezas se muestran sobre mochis distintas (cambia el animalito y el
// ancho), así se ve que cada accesorio cae bien en cualquiera.
const onFamily = (list, key, extra = {}) => list.filter((x) => x.id !== 'ninguno' && x.id !== 'ninguna')
  .map((a, i) => pet(a.label, { ...FAMILY[i % FAMILY.length].r, body: SHAPES[i % 4].id, [key]: a.id, ...extra }));

const ROOMS = [
  { name: 'Cuarto dulce', wall: 'crema', floor: 'madera', left: 'cama', right: 'planta', hang: 'ventana', paintL: 'pastel', paintR: 'natural', r: FAMILY[0].r },
  { name: 'Cuarto de lunares', wall: 'lunares', floor: 'alfombrado', left: 'sofa', right: 'tocadiscos', hang: 'guirnalda', paintL: 'pastel', paintR: 'blanco', r: FAMILY[1].r },
  { name: 'Cuarto rockero', wall: 'ladrillo', floor: 'piedra', left: 'guitarra', right: 'estanteria', hang: 'repisa', paintL: 'negro', paintR: 'nogal', r: preset('rockero') },
  { name: 'Cabaña', wall: 'madera', floor: 'terracota', left: 'bau', right: 'planta', hang: 'ventana', paintL: 'nogal', paintR: 'bosque', r: FAMILY[2].r },
  { name: 'Cuarto gótico', wall: 'vinotinto', floor: 'ajedrez', left: 'ataud', right: 'espejo', hang: 'guirnalda', paintL: 'negro', paintR: 'vino', r: preset('gotico') },
  { name: 'Cuarto y2k', wall: 'neon', floor: 'nogal', left: 'escritorio', right: 'pesas', hang: 'repisa', paintL: 'neon', paintR: 'neon', r: preset('y2k') },
];

function sections(S) {
  const furn = (f, paint = 'natural') => {
    const k = Math.min((S * 1.25) / f.h, (S * 1.9) / f.w);
    return art(f.name, f.render(findPaint(paint)), Math.round(f.w * k), Math.round(f.h * k));
  };
  const sofa = findFurniture('sofa');
  return [
    { id: 'familia', title: 'Familia de mochis', items: FAMILY.map((f) => pet(f.name, f.r)) },
    { id: 'anchos', title: 'Los cuatro anchos', items: SHAPES.map((s) => pet(s.label, { ...FAMILY[0].r, body: s.id })) },
    { id: 'animos', title: 'Ánimos', items: MOODS.map((m) => pet(MOOD_LABEL[m], FAMILY[2].r, m)) },
    { id: 'animalitos', title: 'Animalitos (orejas)', items: onFamily(EARS, 'ears') },
    { id: 'ojos', title: 'Ojos', items: onFamily(EYES, 'eyes', { ears: 'gato' }) },
    { id: 'bocas', title: 'Bocas', items: onFamily(MOUTHS, 'mouth', { ears: 'oso' }) },
    { id: 'mejillas', title: 'Mejillas', items: onFamily(CHEEKS, 'cheeks') },
    { id: 'colas', title: 'Colas', items: onFamily(TAILS, 'tail') },
    { id: 'estampados', title: 'Estampados', items: onFamily(PATTERNS, 'pattern', { accentColor: '#E9799A', accentAlt: '#7FC8F8' }) },
    { id: 'cabeza', title: 'Accesorios de cabeza', items: onFamily(HEAD_ACCESSORIES, 'headAcc') },
    { id: 'cuello', title: 'Accesorios de cuello', items: onFamily(NECK_ACCESSORIES, 'neckAcc') },
    { id: 'cara', title: 'Detalles de la cara', items: onFamily(EXTRA_ACCESSORIES, 'extraAcc') },
    { id: 'partida', title: 'Estilos de partida', items: PET_STYLES.map((p) => pet(p.label, { ...DEFAULT_RECIPE, ...p.recipe })) },
    { id: 'cuartos', title: 'Cuartos armados', items: ROOMS.map((r) => ({ ...r, type: 'room' })) },
    { id: 'muebles', title: 'Muebles', items: FURNITURE.map((f) => furn(f)) },
    { id: 'pinturas', title: 'Pinturas de muebles (sofá)', items: FURNITURE_PAINTS.map((p) => ({ ...furn(sofa, p.id), name: p.id })) },
    { id: 'paredes', title: 'Paredes', items: WALL_STYLES.map((st) => art(st.name, surface(st, 400, 160), Math.round(S * 2.2), Math.round(S * 0.88), 'surface')) },
    { id: 'pisos', title: 'Pisos', items: FLOOR_STYLES.map((st) => art(st.name, surface(st, 400, 110), Math.round(S * 2.2), Math.round(S * 0.6), 'surface')) },
    { id: 'decoracion', title: 'Decoración', items: DECOR_CATALOG.map((d) => art(d.name, d.render(), Math.round(S * 0.75), Math.round(S * 0.75))) },
    { id: 'comida', title: 'Comida', items: FOOD_SPRITES.map((f) => art(f.id, f.render(), Math.round(S * 0.62), Math.round(S * 0.62))) },
    { id: 'iconos', title: 'Íconos y objetos', items: Object.entries(UI_SPRITES).map(([k, r]) => art(k, r(), Math.round(S * 0.52), Math.round(S * 0.52))) },
    {
      id: 'minijuegos', title: 'Minijuegos',
      items: [
        ...['#D8697F', '#7FA9DE', '#E9A83C', '#6FB894', '#B98BE0'].map((c, i) => art(`carro ${i + 1}`, <Car color={c} />, Math.round(S * 0.9), Math.round(S * 0.42))),
        ...[0, 1, 2, 3, 4].map((t) => art(`golosina ${t + 1}`, <Candy type={t} />, Math.round(S * 0.5), Math.round(S * 0.5))),
        ...SIMON_PADS.map((p) => art(`simón ${p.shape}`, <SimonPad shape={p.shape} color={p.color} lit={false} dim={false} />, Math.round(S * 0.6), Math.round(S * 0.6))),
        ...SIMON_PADS.slice(0, 2).map((p) => art(`${p.shape} encendido`, <SimonPad shape={p.shape} color={p.color} lit dim={false} />, Math.round(S * 0.6), Math.round(S * 0.6))),
        art('tubo', <Pipe side="bottom" color="#7FA894" />, Math.round(S * 0.4), Math.round(S * 0.9), 'surface'),
      ],
    },
  ];
}

// ── Dibujo (con caché, para no redibujar al prender/apagar estilos) ──
const memo = new Map();
function drawItem(it, styleId, S, secId) {
  const key = `${secId}|${styleId}|${S}|${it.type}|${it.name}|${it.mood || ''}|${it.markup ? it.markup.length : ''}`;
  if (memo.has(key)) return memo.get(key);
  let v;
  if (it.type === 'pet') v = drawArt({ markup: mochiSvg(it.r, it.mood), styleId, w: S, h: S, kind: 'pet' });
  else if (it.type === 'art') v = drawArt({ markup: it.markup, styleId, w: it.w, h: it.h, kind: it.kind });
  else if (it.type === 'room') v = drawRoom(it, styleId, S);
  memo.set(key, v);
  return v;
}

// Un cuarto: pared, piso, muebles y mochi, cada uno dibujado por el kit
// con el mismo tamaño de píxel (en pixel art no se mezclan rejillas).
const RW = 900;
function drawRoom(rm, styleId, S) {
  // mismo tamaño que en el juego (el cuarto ocupa ~700 px de ancho)
  const zoom = Math.min(0.8, (S * 5.8) / RW);
  const st = getStyle(styleId);
  const pixel = st.art.kind === 'pixel' ? st.art.pixel / zoom : undefined;
  const d = (markup, w, h, kind = 'art') => drawArt({ markup, styleId, w, h, kind, pixel, fit: kind === 'surface' ? 'cover' : undefined });
  const layers = [];
  layers.push({ ...d(surface(findWall(rm.wall), RW, ROOM.FLOOR_Y), RW, ROOM.FLOOR_Y, 'surface'), x: 0, y: 0 });
  layers.push({ ...d(surface(findFloor(rm.floor), RW, ROOM.H - ROOM.FLOOR_Y), RW, ROOM.H - ROOM.FLOOR_Y, 'surface'), x: 0, y: ROOM.FLOOR_Y });
  const hang = findFurniture(rm.hang);
  layers.push({ ...d(svgOf(hang.render(findPaint('natural'))), hang.w, hang.h), x: RW / 2 - hang.w / 2, y: 196 - hang.h });
  const L = findFurniture(rm.left), R = findFurniture(rm.right);
  layers.push({ ...d(svgOf(L.render(findPaint(rm.paintL))), L.w, L.h), x: 190 - L.w / 2, y: 404 - L.h });
  layers.push({ ...d(svgOf(R.render(findPaint(rm.paintR))), R.w, R.h), x: 710 - R.w / 2, y: 404 - R.h });
  layers.push({ ...d(mochiSvg(rm.r, 'feliz'), ROOM.PET_W, ROOM.PET_W, 'pet'), x: RW / 2 - ROOM.PET_W / 2, y: ROOM.H - ROOM.PET_W - 6 });
  return { room: true, layers, zoom, cssW: RW * zoom, cssH: ROOM.H * zoom };
}

function Cell({ it, res }) {
  if (res && res.room) {
    return (
      <figure style={{ margin: 0, textAlign: 'center' }}>
        <div style={{ width: res.cssW, height: res.cssH, position: 'relative', overflow: 'hidden', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: RW, height: ROOM.H, transform: `scale(${res.zoom})`, transformOrigin: '0 0' }}>
            {res.layers.map((l, i) => (
              <img key={i} src={l.url} alt="" style={{ position: 'absolute', left: l.x, top: l.y, width: l.cssW, height: l.cssH, imageRendering: l.pixelated ? 'pixelated' : 'auto' }} />
            ))}
          </div>
        </div>
        <figcaption style={capStyle}>{it.name}</figcaption>
      </figure>
    );
  }
  return (
    <figure style={{ margin: 0, textAlign: 'center' }}>
      {res
        ? <img src={res.url} width={res.cssW} height={res.cssH} alt={it.name} style={{ display: 'block', margin: '0 auto', imageRendering: res.pixelated ? 'pixelated' : 'auto' }} />
        : <div style={{ width: it.w || 80, height: it.h || 80 }} />}
      <figcaption style={capStyle}>{it.name}</figcaption>
    </figure>
  );
}
const capStyle = { fontFamily: 'Nunito, system-ui, sans-serif', fontSize: 11.5, opacity: 0.75, marginTop: 3, maxWidth: 170, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.2 };

function StyleRow({ sec, st, S, active }) {
  const [res, setRes] = useState(() => sec.items.map(() => null));
  useEffect(() => {
    if (!active) return undefined;
    let alive = true, i = 0;
    const step = () => {
      if (!alive) return;
      const t0 = performance.now();
      const next = [];
      while (i < sec.items.length && performance.now() - t0 < 24) { next.push([i, drawItem(sec.items[i], st.id, S, sec.id)]); i++; }
      setRes((prev) => { const c = prev.slice(); next.forEach(([k, v]) => { c[k] = v; }); return c; });
      if (i < sec.items.length) setTimeout(step, 0);
    };
    step();
    return () => { alive = false; };
  }, [active, sec, st.id, S]);
  return (
    <div style={{ background: st.ui.paper, color: st.ui.ink, borderRadius: 14, padding: '10px 12px 12px', marginBottom: 8, border: `1px solid ${st.ui.line}` }}>
      <div style={{ fontFamily: st.fonts.display, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{st.name}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        {sec.items.map((it, k) => <Cell key={k} it={it} res={res[k]} />)}
      </div>
    </div>
  );
}

function Section({ sec, styles, S }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section id={sec.id} ref={ref} style={{ marginBottom: 34, scrollMarginTop: 120 }}>
      <h2 style={{ fontFamily: "'Baloo 2', Nunito, sans-serif", fontSize: 24, margin: '0 0 10px', color: '#3A2A3E' }}>
        {sec.title} <span style={{ fontSize: 14, opacity: 0.55, fontWeight: 600 }}>· {sec.items.length}</span>
      </h2>
      {styles.map((st) => <StyleRow key={st.id} sec={sec} st={st} S={S} active={seen} />)}
    </section>
  );
}

export default function ArtCatalog() {
  const [on, setOn] = useState(() => new Set(STYLE_LIST.map((s) => s.id)));
  const [S, setS] = useState(120);
  const secs = useMemo(() => sections(S), [S]);
  const styles = STYLE_LIST.filter((s) => on.has(s.id));
  const toggle = (id) => setOn((prev) => { const n = new Set(prev); if (n.has(id) && n.size > 1) n.delete(id); else n.add(id); return n; });
  useEffect(() => {
    document.title = 'Arte de Tamagift';
    document.body.dataset.ready = '1';
    // con #seccion en el link, ir ahí (la página se arma después de cargar)
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView(); }, 50);
  }, []);
  const chip = (activeChip) => ({ border: '1.5px solid #3A2A3E', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: activeChip ? '#3A2A3E' : '#FFFFFF', color: activeChip ? '#FFFFFF' : '#3A2A3E', fontFamily: 'Nunito, system-ui, sans-serif' });
  return (
    <div style={{ background: '#F7F3EE', minHeight: '100vh', color: '#3A2A3E', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(247,243,238,0.95)', backdropFilter: 'blur(6px)', borderBottom: '1px solid #E2D8CC', padding: '12px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: "'Baloo 2', Nunito, sans-serif", fontSize: 26, margin: 0, marginRight: 8 }}>Arte de Tamagift</h1>
          {STYLE_LIST.map((s) => (
            <button key={s.id} onClick={() => toggle(s.id)} style={{ ...chip(on.has(s.id)), background: on.has(s.id) ? s.ui.rose : '#FFFFFF', borderColor: s.ui.rose, color: on.has(s.id) ? s.ui.onAccent : '#3A2A3E' }}>{s.name}</button>
          ))}
          <span style={{ marginLeft: 6, fontSize: 13, opacity: 0.7 }}>Tamaño</span>
          {[[90, 'Chico'], [120, 'Normal'], [160, 'Grande']].map(([v, l]) => <button key={v} onClick={() => setS(v)} style={chip(S === v)}>{l}</button>)}
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8, fontSize: 13 }}>
          {secs.map((s) => <a key={s.id} href={`#${s.id}`} style={{ color: '#7A5A8A', textDecoration: 'none', fontWeight: 700 }}>{s.title}</a>)}
        </nav>
      </div>
      <main style={{ padding: '20px 20px 60px', maxWidth: 1500, margin: '0 auto' }}>
        <p style={{ marginTop: 0, opacity: 0.75, fontSize: 14 }}>
          Cada fila es el mismo arte dibujado por un estilo distinto. Toca un estilo arriba para mostrarlo u ocultarlo.
        </p>
        {secs.map((sec) => <Section key={`${sec.id}-${S}`} sec={sec} styles={styles} S={S} />)}
      </main>
    </div>
  );
}
