// Mesas y muebles para guardar cosas. Misma regla 3/4: frente + cara de
// arriba; lo que va encima (lámparas, libros) se apoya en esa cara.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, legs, cylinder, Cir, Ell, mirrorX, INK, hollow, isDark } from '../draw.js';

// ── Ayudas de dibujo de madera y metal (también las usan rest.js,
// rugs.js y plants.js). Pensadas para pixel art: nada más fino que
// ~2 unidades (en el cuarto, un píxel de arte mide unas 2 unidades del
// dibujo), las vetas son trazos tenues que tiñen la madera y los brillos
// van arriba a la izquierda.
const n1 = (v) => +v.toFixed(1);

/** Azar con semilla: la misma veta cada vez que se dibuja. */
export function seeded(seed = 1) {
  let s = (Math.abs(Math.round(seed * 7919)) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Color de la veta: más oscura en madera clara, más clara en madera oscura. */
export const grainCol = (wood) => (isDark(wood) ? tone(wood, 1.1) : tone(wood, -1.2));

/**
 * Vetas onduladas a lo largo de una tabla (x, y, w, h). `dir: 'v'` para
 * tablas paradas (puertas, patas). No son rectas: ondean y se cortan.
 */
export function grain(x, y, w, h, wood, o = {}) {
  const vert = o.dir === 'v';
  const L = vert ? h : w, T = vert ? w : h;
  const pt = (u, v) => (vert ? `${n1(x + v)} ${n1(y + u)}` : `${n1(x + u)} ${n1(y + v)}`);
  // `k`: cuántas vetas por tabla (en pixel, menos y más largas: si no, ruido)
  const paths = (gap, ampK, cut) => {
    const r = seeded(o.seed ?? 3);
    const n = Math.max(1, Math.round(T / gap));
    let d = '';
    for (let i = 0; i < n; i++) {
      const t = (T / n) * (i + 0.5) + (r() - 0.5) * 2;
      const a0 = 3 + r() * L * cut, a1 = L - 3 - r() * L * cut;
      if (a1 - a0 < 12) continue;
      const per = (o.per ?? 26) + r() * 14, amp = (1.1 + r() * 1.2) * (o.amp ?? 1) * ampK;
      let a = a0, k = r() < 0.5 ? 1 : -1;
      d += `M${pt(a0, t)}`;
      while (a < a1 - 1) { const nb = Math.min(a1, a + per / 2); d += `Q${pt((a + nb) / 2, t + amp * k)} ${pt(nb, t)}`; a = nb; k = -k; }
    }
    return d;
  };
  const c = grainCol(wood);
  let s = '';
  const dv = paths(o.gap ?? 9, 1, 0.25);
  if (o.knot) { const [kx, ky] = o.knot; s += Ell(kx, ky, 4, 2, { fill: 'none', stroke: c, 'stroke-width': 1.3, opacity: (o.op ?? 0.5) * 0.9, 'data-r': 'line', 'data-skip': 'pixel neon' }); }
  if (dv) s += line(dv, c, o.w ?? 1.4, { opacity: o.op ?? 0.5, 'data-skip': 'pixel neon' });
  // pixel: vetas largas, casi rectas (un escalón de vez en cuando) y suaves
  const dp = paths((o.gap ?? 9) * (o.pxGap ?? 1.7), 0.55, 0.15);
  if (dp) s += line(dp, c, 1.4, { opacity: o.pxOp ?? 0.26, 'data-only': 'pixel' });
  return s;
}

// Lo que se ve como metal: un acento blanco se vuelve plateado.
const hexLum = (c) => { const v = parseInt(c.slice(1), 16); return (0.2126 * (v >> 16 & 255) + 0.7152 * (v >> 8 & 255) + 0.0722 * (v & 255)) / 255; };
export const metalOf = (c) => (hexLum(c) > 0.93 ? '#DCD5E4' : c);
/** Acento para una tela (cojín, moño): si el acento es blanco, un tono claro de la tela. */
export const fabricOf = (p) => (hexLum(p.accent) > 0.93 ? mix(p.cloth, '#FFFFFF', 0.72) : p.accent);

/**
 * En pixel, el kit le pone a cada cara un filo de luz y de sombra por
 * dentro del contorno, y también alrededor de lo que se le apoya encima
 * (un tirador quedaba con un "halo"). Una copia lisa de la cara, metida
 * ~2 píxeles, deja el filo del borde y calma el resto: lo que va encima ya
 * no hace halo y su sombrita se ve. Solo en pixel (en lofi mataría el
 * degradado de la cara).
 */
export const calm = (x, y, w, h, c, r = 1) => flat(rr(x + 3.6, y + 3.6, w - 7.2, h - 7.2, r), c, { 'data-only': 'pixel' });
export const calmD = (d, c) => flat(d, c, { 'data-only': 'pixel' });

/** Tirador de barra (metal con franja de brillo y su sombrita en el cajón). */
export function pull(cx, cy, metal, w = 14) {
  const c = metalOf(metal), M = mat(c);
  return shade(rr(cx - w / 2 + 2, cy + 1.5, w - 1, 3.5, 1.7), '#2A1C24', 0.28)
    + part(rr(cx - w / 2, cy - 3.5, w, 7, 3.5), c, { w: 1.4 })
    + flat(rr(cx - w / 2 + 2.5, cy - 2.2, w - 7, 2.2, 1.1), M.hi)
    + shine(rr(cx - w / 2 + 2.2, cy - 2.2, 3, 2.2, 1.1));
}

/** Perilla redonda de metal. */
export function knob(cx, cy, metal, r = 3.8) {
  const c = metalOf(metal);
  return shade(ellD(cx + 1.2, cy + 1.6, r, r * 0.85), '#2A1C24', 0.3)
    + part(ellD(cx, cy, r, r), c, { w: 1.3 })
    + shine(ellD(cx - r * 0.35, cy - r * 0.35, r * 0.4, r * 0.34));
}

/**
 * Tablero con grosor: tapa (con vetas que corren a lo ancho) y canto
 * iluminado; debajo del voladizo, la sombra que cae en el mueble.
 */
export function slab(x, y, w, t, d, wood, o = {}) {
  const W = mat(wood);
  const dd = d * 0.5;
  let s = '';
  if (o.under) s += shade(rr(o.under[0], y + t, o.under[1], 4.5, 1), W.deep, 0.4);
  s += face(rrTop(x, y - dd, w, dd + 2, Math.min(4, dd)), W.top) + calm(x, y - dd, w, dd + 2, W.top);
  s += grain(x + 2, y - dd + 1, w - 4, dd - 1, wood, { gap: 4.5, seed: o.seed ?? 5, amp: 0.6, op: 0.4 });
  s += face(rr(x, y, w, t, Math.min(2.5, t / 2.5)), W.front);
  s += line(`M${x + 3} ${y + 1.8}H${x + w - 3}`, W.hi, 1.6, { opacity: 0.9 });
  return s;
}

/** Cajón: frente con vetas, bisel claro arriba y un tirador (o dos). */
export function drawer(x, y, w, h, wood, metal, o = {}) {
  const c = tone(wood, 0.12);
  let s = face(rr(x, y, w, h, 2), c, { w: 1.6 }) + calm(x, y, w, h, c);
  s += grain(x + 2, y + 2, w - 4, h - 4, wood, { seed: o.seed ?? x + y, gap: 7, op: 0.42 });
  s += line(`M${x + 2.5} ${y + 2}H${x + w - 2.5}`, tone(wood, 1.2), 1.4, { opacity: 0.75 });
  const hs = o.handles ?? (w > 70 ? [x + w * 0.27, x + w * 0.73] : [x + w / 2]);
  hs.forEach((hx) => { s += o.knob ? knob(hx, y + h / 2, metal) : pull(hx, y + h / 2, metal, o.pw ?? 14); });
  return s;
}

/** Flor de `n` pétalos (roseta) centrada en (cx, cy). */
export function flowerD(cx, cy, r, n = 5, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = ((i / n) * 2 + rot) * Math.PI - Math.PI / 2, a1 = (((i + 1) / n) * 2 + rot) * Math.PI - Math.PI / 2, am = (a0 + a1) / 2;
    const v0 = `${n1(cx + Math.cos(a0) * r * 0.42)} ${n1(cy + Math.sin(a0) * r * 0.42)}`;
    const v1 = `${n1(cx + Math.cos(a1) * r * 0.42)} ${n1(cy + Math.sin(a1) * r * 0.42)}`;
    const c0 = `${n1(cx + Math.cos(am - 0.5) * r * 1.45)} ${n1(cy + Math.sin(am - 0.5) * r * 1.45)}`;
    const c1 = `${n1(cx + Math.cos(am + 0.5) * r * 1.45)} ${n1(cy + Math.sin(am + 0.5) * r * 1.45)}`;
    d += `${i ? '' : `M${v0}`}C${c0} ${c1} ${v1}`;
  }
  return `${d}Z`;
}

const LEAF = '#6FAE78';
/** Florero de cerámica (apoyado en y) con tres flores. */
export function vaseFlowers(cx, y, col, k = 1) {
  const v = mix(col, '#FFFFFF', 0.3);
  let s = shade(ellD(cx + 1, y, 10 * k, 2.5 * k), '#2A1C24', 0.25);
  // tallos y hojitas detrás de las flores
  s += line(`M${cx} ${y - 14 * k}Q${cx - 4 * k} ${y - 24 * k} ${cx - 8 * k} ${y - 30 * k}M${cx} ${y - 14 * k}Q${cx + 1 * k} ${y - 26 * k} ${cx + 2 * k} ${y - 36 * k}M${cx} ${y - 14 * k}Q${cx + 6 * k} ${y - 22 * k} ${cx + 10 * k} ${y - 27 * k}`, '#5E9466', 1.8 * k);
  s += smallPart(`M${cx - 1} ${y - 18 * k}C${cx - 8 * k} ${y - 22 * k} ${cx - 12 * k} ${y - 20 * k} ${cx - 14 * k} ${y - 17 * k}C${cx - 9 * k} ${y - 14 * k} ${cx - 4 * k} ${y - 14 * k} ${cx - 1} ${y - 18 * k}Z`, LEAF, 1.3);
  s += smallPart(`M${cx + 1} ${y - 20 * k}C${cx + 7 * k} ${y - 25 * k} ${cx + 12 * k} ${y - 24 * k} ${cx + 15 * k} ${y - 21 * k}C${cx + 10 * k} ${y - 17 * k} ${cx + 5 * k} ${y - 17 * k} ${cx + 1} ${y - 20 * k}Z`, tone(LEAF, 0.4), 1.3);
  [[cx - 8 * k, y - 31 * k, '#FFB3C4', 0], [cx + 10 * k, y - 28 * k, '#FFE08A', 0.2], [cx + 2 * k, y - 37 * k, '#FFFFFF', 0.1]].forEach(([fx, fy, c, rot]) => {
    s += smallPart(flowerD(fx, fy, 4.6 * k, 5, rot), c, 1.3) + flat(ellD(fx, fy, 1.8 * k, 1.8 * k), c === '#FFE08A' ? '#E9845A' : '#F2C14E');
  });
  // panza redonda, cuello y labio
  s += part(`M${cx - 4 * k} ${y - 15 * k}C${cx - 4 * k} ${y - 11 * k} ${cx - 10 * k} ${y - 10 * k} ${cx - 10 * k} ${y - 5 * k}C${cx - 10 * k} ${y - 1 * k} ${cx - 6 * k} ${y} ${cx} ${y}C${cx + 6 * k} ${y} ${cx + 10 * k} ${y - 1 * k} ${cx + 10 * k} ${y - 5 * k}C${cx + 10 * k} ${y - 10 * k} ${cx + 4 * k} ${y - 11 * k} ${cx + 4 * k} ${y - 15 * k}Z`, v, { w: 1.5 });
  s += shade(`M${cx + 3 * k} ${y - 1 * k}C${cx + 8 * k} ${y - 2 * k} ${cx + 9 * k} ${y - 5 * k} ${cx + 8.5 * k} ${y - 8 * k}C${cx + 6 * k} ${y - 4 * k} ${cx + 4 * k} ${y - 3 * k} ${cx + 3 * k} ${y - 1 * k}Z`, tone(v, -1.4), 0.4);
  s += part(rr(cx - 5.5 * k, y - 17 * k, 11 * k, 3.5 * k, 1.5), tone(v, 0.5), { w: 1.3 });
  s += shine(ellD(cx - 5 * k, y - 7 * k, 1.6 * k, 2.4 * k));
  return s;
}

/** Portarretratos parado sobre un mueble (esquina izquierda x, apoyado en y). */
export function frame(x, y, wood, accent, w = 24, h = 20) {
  const F = metalOf(accent);
  let s = shade(rr(x + 2, y - 2, w, 4, 2), '#2A1C24', 0.25);
  s += part(rr(x, y - h, w, h, 2), F, { w: 1.5 });
  s += flat(rr(x + 4, y - h + 4, w - 8, h - 8, 1), '#BFE0F5');
  s += flat(`M${x + 4} ${y - 4}V${y - 9}Q${x + 9} ${y - 13} ${x + 14} ${y - 9}Q${x + 17} ${y - 11} ${x + w - 4} ${y - 8}V${y - 4}Z`, '#8FCB8F');
  s += flat(ellD(x + w - 8, y - h + 8, 2.2, 2.2), '#FFE08A');
  s += line(`M${x + 2.5} ${y - h + 2}H${x + w - 3}`, tone(F, 1.2), 1.2, { opacity: 0.8 });
  return s;
}

// ── Cositas que viven sobre y dentro de los muebles ──────────────

// Lomos de libros: colores armónicos (y uno de cuero, otro crema).
const BOOK = ['#E57B93', '#7FA9DE', '#F2C14E', '#7FB894', '#B892E0', '#E9845A', '#5F7FA6', '#F3E6D3', '#A8735A'];

/** Hoja suelta (lanza) desde (x, y) hacia `ang` grados. */
/**
 * Pieza chica (hoja, pétalo): con su contorno; en retro, rellena y con un
 * trazo fino, porque el contorno grueso de ese estilo la volvía un manchón.
 */
export const smallPart = (d, c, w = 1.4) => part(d, c, { w, a: { 'data-skip': 'retro' } }) + flat(d, c, { 'data-only': 'retro' }) + line(d, '#4A2E22', 1.1, { 'data-only': 'retro' });

export function leafAt(x, y, len, ang, wid, c, w = 1.3) {
  const a = (ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (t, q) => `${n1(x + ux * len * t + nx * q)} ${n1(y + uy * len * t + ny * q)}`;
  return smallPart(`M${P(0, 0)}Q${P(0.42, wid * 1.25)} ${P(1, 0)}Q${P(0.42, -wid * 1.25)} ${P(0, 0)}Z`, c, w);
}

/** Un libro parado, de lomo (apoyado en y), con bandas y etiqueta. */
function book(x, y, w, h, c, o = {}) {
  let s = face(rr(x, y - h, w, h, 1.4), c, { w: 1.4 });
  const band = isDark(c) ? tone(c, 1.6) : tone(c, 1.1);
  if (h > 16) s += line(`M${x + 1.6} ${y - h + 4}H${x + w - 1.6}M${x + 1.6} ${y - 4.5}H${x + w - 1.6}`, band, 1.6, { opacity: 0.95 });
  if (o.label && w >= 8) s += flat(rr(x + 2.2, y - h * 0.62, w - 4.4, h * 0.2, 0.8), mix(c, '#FFFFFF', 0.72));
  return s;
}
/** Libro apoyado en otro (inclinado sobre su esquina de abajo). */
const leanBook = (x, y, w, h, c, ang) => `<g transform="rotate(${ang} ${ang > 0 ? x + w : x} ${y})">${book(x, y, w, h, c)}</g>`;
/** Libro acostado (pila): lomo largo con sus bandas. */
function flatBook(x, y, L, t, c) {
  return face(rr(x, y - t, L, t, 1.3), c, { w: 1.4 }) + line(`M${x + 4} ${y - t + 1.6}V${y - 1.6}M${x + L - 4} ${y - t + 1.6}V${y - 1.6}`, tone(c, 1.2), 1.5, { opacity: 0.9 });
}

// Lamparita de mesa apoyada en (cx, y): pie de cerámica panzón, varilla y
// pantalla con festón; alrededor, el halo cálido de la luz.
function tableLamp(cx, y, shadeCol, trim, k = 1) {
  const X = (v) => n1(cx + v * k), Y = (v) => n1(y - v * k);
  let s = Ell(cx, y - 24 * k, 24 * k, 15 * k, { fill: '#FFE9A8', opacity: 0.28, 'data-r': 'tone' });
  s += shade(ellD(cx + 1, y, 10 * k, 2.4 * k), '#2A1C24', 0.25);
  s += part(`M${X(-3.5)} ${Y(13)}C${X(-10)} ${Y(12)} ${X(-10)} ${Y(0)} ${X(-5)} ${Y(0)}H${X(5)}C${X(10)} ${Y(0)} ${X(10)} ${Y(12)} ${X(3.5)} ${Y(13)}Z`, '#F4EEE6', { w: 1.5 });
  s += shade(`M${X(3)} ${Y(1)}C${X(8)} ${Y(2)} ${X(8.5)} ${Y(7)} ${X(7)} ${Y(10)}C${X(5)} ${Y(6)} ${X(4)} ${Y(3)} ${X(3)} ${Y(1)}Z`, '#B9A9B4', 0.45);
  s += shine(ellD(cx - 5 * k, y - 7 * k, 1.4 * k, 2.2 * k));
  s += face(rr(cx - 1.6 * k, y - 21 * k, 3.2 * k, 9 * k, 1), '#C9B79A', { w: 1.3 });
  // pantalla
  let sc = `M${X(-8)} ${Y(36)}H${X(8)}L${X(14)} ${Y(19)}`;
  for (let i = 0; i < 4; i++) sc += `Q${X(10.5 - i * 7)} ${Y(15.5)} ${X(7 - i * 7)} ${Y(19)}`;
  s += part(`${sc}Z`, shadeCol, { w: 1.6 });
  s += shade(`M${X(2)} ${Y(36)}H${X(8)}L${X(14)} ${Y(19)}Q${X(10.5)} ${Y(15.5)} ${X(7)} ${Y(19)}Z`, tone(shadeCol, -1.4), 0.3);
  s += shade(`M${X(-6.5)} ${Y(34)}L${X(-11)} ${Y(21)}L${X(-8)} ${Y(21)}L${X(-4)} ${Y(34)}Z`, '#FFFFFF', 0.45);
  s += line(`M${X(-13)} ${Y(20)}H${X(13)}`, trim, 2.2);
  return s;
}

// Tetera panzona con lunares, apoyada en (cx, y).
function teapot(cx, y, c) {
  const C = mat(c);
  const dot = mix(c, '#FFFFFF', 0.78);
  let s = shade(ellD(cx + 2, y, 14, 2.8), '#2A1C24', 0.25);
  s += part(`M${cx - 10} ${y - 14.5}C${cx - 20} ${y - 15.5} ${cx - 20} ${y - 2.5} ${cx - 10} ${y - 3.5}L${cx - 10} ${y - 6.5}C${cx - 15.6} ${y - 6} ${cx - 15.6} ${y - 12.6} ${cx - 10} ${y - 11.6}Z`, c, { w: 1.5 });
  s += face(`M${cx + 9} ${y - 10}Q${cx + 14} ${y - 10} ${cx + 17} ${y - 18}L${cx + 21} ${y - 19}Q${cx + 19} ${y - 6} ${cx + 9} ${y - 4}Z`, c, { w: 1.5 });
  s += part(`M${cx - 12} ${y - 9}C${cx - 12} ${y - 16} ${cx - 7} ${y - 18} ${cx} ${y - 18}C${cx + 7} ${y - 18} ${cx + 12} ${y - 16} ${cx + 12} ${y - 9}C${cx + 12} ${y - 3} ${cx + 7} ${y} ${cx} ${y}C${cx - 7} ${y} ${cx - 12} ${y - 3} ${cx - 12} ${y - 9}Z`, c, { w: 1.7 });
  s += shade(`M${cx + 3} ${y - 1}C${cx + 9} ${y - 2} ${cx + 11} ${y - 6} ${cx + 11} ${y - 10}C${cx + 9} ${y - 5} ${cx + 6} ${y - 3} ${cx + 3} ${y - 1}Z`, C.deep, 0.35);
  [[-5, -10], [3, -13], [5, -6], [-2, -5]].forEach(([dx, dy]) => { s += flat(ellD(cx + dx, y + dy, 1.9, 1.8), dot); });
  s += shine(ellD(cx - 7, y - 12, 1.5, 2.4));
  s += face(ellD(cx, y - 17.5, 8, 2.6), C.top, { w: 1.4 }) + part(ellD(cx, y - 20.5, 2.8, 2.4), tone(c, 0.4), { w: 1.3 }) + shine(ellD(cx - 1, y - 21.3, 0.8, 0.7));
  return s;
}

// Taza de té con su platito, apoyada en (cx, y).
function teacup(cx, y, c) {
  let s = shade(ellD(cx + 1, y + 0.5, 10, 2.4), '#2A1C24', 0.22);
  s += smallPart(ellD(cx, y, 10, 3), '#FFFDF8', 1.4);
  const asa = `M${cx + 5} ${y - 8}Q${cx + 10} ${y - 8} ${cx + 9} ${y - 5}Q${cx + 8} ${y - 3} ${cx + 5} ${y - 3.5}`;
  s += line(asa, INK, 4.2) + line(asa, c, 2);
  s += smallPart(`M${cx - 7} ${y - 10}Q${cx - 7} ${y - 1.5} ${cx} ${y - 1.5}Q${cx + 7} ${y - 1.5} ${cx + 7} ${y - 10}Z`, c, 1.5);
  s += line(`M${cx - 6.4} ${y - 7}Q${cx} ${y - 5.4} ${cx + 6.4} ${y - 7}`, '#FFFFFF', 2.2) + shine(ellD(cx - 4.4, y - 4.6, 1, 1.4));
  s += smallPart(ellD(cx, y - 10, 7, 2.2), '#FFFDF8', 1.2) + flat(ellD(cx, y - 9.8, 4.8, 1.3), '#C98A50');
  return s;
}

// Gatito de cerámica (adorno de repisa), sentado en (cx, y).
function ceramicCat(cx, y, c = '#FFF6EC') {
  let s = shade(ellD(cx + 1, y, 7, 1.8), '#2A1C24', 0.25);
  s += smallPart(`M${cx - 6} ${y}C${cx - 7} ${y - 6} ${cx - 5} ${y - 9} ${cx} ${y - 9}C${cx + 5} ${y - 9} ${cx + 7} ${y - 6} ${cx + 6} ${y}Z`, c, 1.4);
  s += smallPart(`M${cx - 5.5} ${y - 12}L${cx - 5} ${y - 18}L${cx - 2} ${y - 15}H${cx + 2}L${cx + 5} ${y - 18}L${cx + 5.5} ${y - 12}C${cx + 5.5} ${y - 8} ${cx - 5.5} ${y - 8} ${cx - 5.5} ${y - 12}Z`, c, 1.4);
  s += flat(ellD(cx - 2.2, y - 12.5, 0.9, 1.1), INK) + flat(ellD(cx + 2.2, y - 12.5, 0.9, 1.1), INK);
  s += flat(ellD(cx - 3.6, y - 10.6, 1.2, 0.7), '#FF9FB5') + flat(ellD(cx + 3.6, y - 10.6, 1.2, 0.7), '#FF9FB5');
  s += part(ellD(cx, y - 7.6, 1.6, 1.4), '#F2C14E', { w: 1 });
  s += shine(ellD(cx - 3.4, y - 15, 0.9, 1.2));
  return s;
}

// Frasco de vidrio con caramelos de colores.
function candyJar(cx, y, lid) {
  let s = shade(ellD(cx + 1, y, 10, 2), '#2A1C24', 0.22);
  s += part(`M${cx - 8} ${y - 17}Q${cx - 10} ${y - 9} ${cx - 8} ${y - 2}Q${cx - 8} ${y} ${cx - 6} ${y}H${cx + 6}Q${cx + 8} ${y} ${cx + 8} ${y - 2}Q${cx + 10} ${y - 9} ${cx + 8} ${y - 17}Z`, '#DDEFF5', { w: 1.5 });
  [[-4.5, -3.5, '#F28CA8'], [0, -3, '#7FB894'], [4.5, -3.5, '#F2C14E'], [-2.5, -7.5, '#7FA9DE'], [2.5, -7.5, '#E9845A'], [-5, -11, '#B892E0'], [0.5, -11.5, '#F28CA8'], [5, -11, '#7FA9DE']].forEach(([dx, dy, c]) => { s += flat(ellD(cx + dx, y + dy, 2.2, 2.1), mix(c, '#DDEFF5', 0.15)); });
  s += line(`M${cx - 5.5} ${y - 14}L${cx - 6.5} ${y - 5}`, '#FFFFFF', 1.8, { opacity: 0.9 }) + line(`M${cx - 3} ${y - 15}L${cx - 3.6} ${y - 11}`, '#FFFFFF', 1.4, { opacity: 0.8 });
  s += face(rr(cx - 7, y - 21, 14, 5, 2), lid, { w: 1.4 }) + face(rr(cx - 2, y - 24, 4, 3, 1), tone(lid, -0.3), { w: 1.1 });
  return s;
}

// Potus en maceta, con una guía que cae por el borde de la repisa.
function shelfPlant(cx, y, potC, drop = 18) {
  const G2 = '#4E8F62', G1 = '#6FB07E', G3 = '#9AD0A0';
  let s = line(`M${cx + 5} ${y - 12}Q${cx + 12} ${y - 6} ${cx + 11} ${y + drop}`, '#5E8F5E', 1.8);
  s += leafAt(cx + 12, y + drop * 0.35, 7, 70, 2.6, G1) + leafAt(cx + 11, y + drop * 0.75, 7, 110, 2.6, G2) + leafAt(cx + 11, y + drop, 7, 85, 2.6, G3);
  s += leafAt(cx - 2, y - 12, 10, -150, 3.2, G2) + leafAt(cx + 1, y - 13, 11, -95, 3.4, G2) + leafAt(cx + 3, y - 12, 10, -35, 3.2, G1);
  s += leafAt(cx - 1, y - 12, 8, -125, 3, G1) + leafAt(cx + 2, y - 12, 8, -60, 3, G3);
  s += part(`M${cx - 7} ${y - 12}H${cx + 7}L${cx + 5.5} ${y}H${cx - 5.5}Z`, potC, { w: 1.5 });
  s += face(rr(cx - 8.5, y - 14, 17, 4, 1.5), tone(potC, 0.6), { w: 1.3 });
  s += shine(rr(cx - 5, y - 9, 1.8, 5, 0.9));
  return s;
}

// Canasto tejido (trama de mimbre) con algo que asoma.
function basket(x, y, w, h, peek) {
  const c = '#D9B07A';
  let s = shade(rr(x + 2, y - 2, w, 4, 2), '#2A1C24', 0.25);
  if (peek) s += part(`M${x + 6} ${y - h + 2}Q${x + w * 0.3} ${y - h - 7} ${x + w * 0.55} ${y - h - 3}Q${x + w * 0.8} ${y - h - 8} ${x + w - 5} ${y - h + 2}Z`, peek, { w: 1.5 }) + line(`M${x + w * 0.35} ${y - h - 3}Q${x + w * 0.42} ${y - h} ${x + w * 0.4} ${y - h + 2}`, tone(peek, -1), 1.4, { opacity: 0.5 });
  s += face(`M${x} ${y - h}H${x + w}L${x + w - 3} ${y - 2}Q${x + w - 3} ${y} ${x + w - 5} ${y}H${x + 5}Q${x + 3} ${y} ${x + 3} ${y - 2}Z`, c, { w: 1.6 });
  let wv = '';
  for (let yy = y - h + 6, r = 0; yy < y - 2; yy += 5, r++) for (let xx = x + 4 + (r % 2) * 4; xx < x + w - 6; xx += 8) wv += `M${xx} ${yy}h4`;
  s += line(wv, tone(c, -1.1), 1.6, { opacity: 0.55 });
  s += face(rr(x - 1, y - h - 1, w + 2, 5, 2), tone(c, 0.5), { w: 1.4 });
  s += part(`M${x + w * 0.5 - 7} ${y - h + 1}H${x + w * 0.5 + 7}V${y - h + 5}H${x + w * 0.5 - 7}Z`, tone(c, -0.6), { w: 1.2 });
  return s;
}

// Perfume de vidrio: frasco facetado, líquido, brillos y tapón dorado.
// Perfume en frasco de corazón: vidrio claro, perfume rosado adentro, dos
// rayas de brillo y tapón dorado. Grande y simple para que se lea en pixel.
function perfumeHeart(cx, y, c, cap) {
  const hd = (k, dy = 0) => `M${cx} ${y - 3 + dy}C${cx - 11 * k} ${y - 9 * k + dy} ${cx - 10 * k} ${y - 21 * k + dy} ${cx} ${y - 16 * k + dy}C${cx + 10 * k} ${y - 21 * k + dy} ${cx + 11 * k} ${y - 9 * k + dy} ${cx} ${y - 3 + dy}Z`;
  let s = shade(ellD(cx + 1, y, 9, 2), '#2A1C24', 0.25);
  s += smallPart(rr(cx - 4, y - 3.5, 8, 3.5, 1), mix(c, '#FFFFFF', 0.55), 1.3);
  s += smallPart(hd(1), mix(c, '#FFFFFF', 0.72), 1.6);
  s += flat(`M${cx} ${y - 5.4}C${cx - 8} ${y - 9.5} ${cx - 8.6} ${y - 13} ${cx - 8.4} ${y - 14}H${cx + 8.4}C${cx + 8.6} ${y - 13} ${cx + 8} ${y - 9.5} ${cx} ${y - 5.4}Z`, c);
  s += line(`M${cx - 6} ${y - 16}L${cx - 7} ${y - 12}`, '#FFFFFF', 2, { opacity: 0.95 }) + line(`M${cx - 3.4} ${y - 17.4}L${cx - 3.8} ${y - 15.4}`, '#FFFFFF', 1.6, { opacity: 0.9 });
  s += smallPart(rr(cx - 2.2, y - 21, 4.4, 4.5, 1), cap, 1.2) + smallPart(ellD(cx, y - 23.2, 4, 3), cap, 1.3) + shine(ellD(cx - 1.4, y - 24, 1.1, 0.9));
  return s;
}
// Frasco alto de vidrio con perfume lila hasta la mitad y tapa redonda.
function perfumeTall(cx, y, c, cap) {
  let s = shade(ellD(cx + 1, y, 7.5, 1.8), '#2A1C24', 0.25);
  s += smallPart(rr(cx - 6, y - 18, 12, 18, 2.5), mix(c, '#FFFFFF', 0.72), 1.6);
  s += flat(rr(cx - 4.4, y - 10, 8.8, 8.6, 1.6), c);
  s += line(`M${cx - 3.2} ${y - 15}L${cx - 3.8} ${y - 6}`, '#FFFFFF', 2, { opacity: 0.95 });
  s += smallPart(rr(cx - 2, y - 21, 4, 3.4, 1), cap, 1.2) + smallPart(ellD(cx, y - 24, 4.4, 3.6), tone(c, -0.3), 1.3) + shine(ellD(cx - 1.6, y - 25, 1.2, 1));
  return s;
}

/** Vela con su gotita de cera, llama y halo. */
function candle(cx, y, h, c = '#F3EDE3') {
  let s = Ell(cx, y - h - 6, 11, 11, { fill: '#FFE3A0', opacity: 0.16, 'data-r': 'tone', 'data-skip': 'pixel' }) + Ell(cx, y - h - 6, 6.5, 6.5, { fill: '#FFF0C0', opacity: 0.28, 'data-r': 'tone', 'data-skip': 'pixel' });
  s += face(rr(cx - 4, y - h, 8, h, 1.5), c, { w: 1.4 });
  s += part(`M${cx - 4} ${y - h + 1}Q${cx - 2} ${y - h + 1} ${cx - 2.6} ${y - h + 6}Q${cx - 3} ${y - h + 8} ${cx - 4} ${y - h + 6}Z`, mix(c, '#FFFFFF', 0.5), { w: 1 });
  s += line(`M${cx} ${y - h}V${y - h - 2.5}`, INK, 1.2);
  s += part(`M${cx} ${y - h - 1.5}C${cx - 4.6} ${y - h - 4} ${cx - 2.2} ${y - h - 11} ${cx} ${y - h - 14}C${cx + 2.2} ${y - h - 11} ${cx + 4.6} ${y - h - 4} ${cx} ${y - h - 1.5}Z`, '#FFC94D', { w: 1.1 });
  s += flat(ellD(cx, y - h - 5, 1.7, 2.6), '#FFF4C8');
  return s;
}

export const STORAGE = [
  {
    id: 'escritorio', name: 'Escritorio', cat: 'mesas', price: 160, w: 196, h: 148, place: 'piso', tags: ['aesthetic', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(98, 144, 92, 6);
      // panel del fondo (más atrás: termina más arriba) y pata izquierda
      const back = mix(hollow(p.wood), W.front, 0.4);
      s += face(rr(18, 82, 102, 30, 2), back, { w: 1.8 }) + grain(20, 86, 98, 22, back, { seed: 71, gap: 8 });
      s += face('M9 82H21L19 141Q15 144 11 141Z', W.side, { w: 1.8 }) + line('M12.5 86L13.5 134', W.front, 1.6, { opacity: 0.8 });
      // cajonera a la derecha
      s += face(rr(118, 80, 68, 62, 3), W.front) + grain(120, 82, 64, 58, p.wood, { seed: 73 });
      [88, 106, 124].forEach((y, i) => { s += drawer(124, y, 56, 15, p.wood, p.accent, { seed: 74 + i }); });
      // tablero con voladizo
      s += slab(4, 76, 188, 8, 48, p.wood, { under: [118, 68], seed: 75 });
      // sobre la mesa: lámpara, cuaderno abierto con lápiz, lapicero y una
      // pila de libros con una manzana
      s += tableLamp(28, 68, p.cloth, metalOf(p.accent));
      // cuaderno abierto: tapa de color que asoma alrededor, hojas blanco
      // cálido con renglones gruesos y un corazón dibujado, cinta que cae
      // por el canto y un lápiz grande con goma rosada
      const cov = tone(p.cloth, -0.25);
      s += shade('M56 71L110 71L108 75H58Z', '#2A1C24', 0.25);
      s += face('M52 59Q67 54 81 59Q95 54 112 59L110 73Q95 69 81 73Q67 69 54 73Z', cov, { w: 1.6 });
      s += face('M56 58Q68 54.5 81 58.5V70Q68 66.5 57 70Z', '#FFFBF2', { w: 1.4 }) + face('M81 58.5Q94 54.5 107 58L106 70Q94 66.5 81 70Z', '#FFFBF2', { w: 1.4 });
      s += line('M57.5 70Q68 67 80 70.6M82 70.6Q94 67 105.5 70', '#E6D6BC', 1.6);
      s += line('M61 60.5Q69 58.2 77 61M61 64Q69 61.7 77 64.5', '#7FA2D8', 1.8);
      s += flat('M94 66.5C88 62.5 88.5 58.5 91.4 58.2C93 58 94 59.4 94 60.4C94 59.4 95 58 96.6 58.2C99.5 58.5 100 62.5 94 66.5Z', '#E25D5D');
      s += flat('M79.4 71H82.6V80L81 78.4L79.4 80Z', '#E25D5D');
      s += face('M84 72L98 55L102 58.4L88 75.4Z', '#F7C948', { w: 1.3 }) + line('M86 72.6L99.6 56.4', '#FFE48A', 1.4, { opacity: 0.9 });
      s += face('M98 55L100.4 52.2Q102.4 50.6 104 52.2Q105.6 54 104.4 55.6L102 58.4Z', '#F28CA8', { w: 1.3 }) + face('M97.4 55.7L99.4 53.4L103 56.4L101 58.8Z', '#D9D2DE', { w: 1.1 });
      s += face('M84 72L88 75.4L82.6 77.8Z', '#F3D2A6', { w: 1.2 }) + flat('M82.2 76L83.6 77.2L81.6 78.6Z', '#3A2A3E');
      s += shade(ellD(126, 70, 7, 1.8), '#2A1C24', 0.22);
      s += line('M122 58L120 48M126 57V45M130 58L133 49', '#E57B93', 2.4) + line('M120 48L119.6 46M126 45V43M133 49L133.6 47', INK, 1.6);
      s += face('M120 57H132L131 70H121Z', mix(p.cloth, '#FFFFFF', 0.45), { w: 1.4 }) + line('M121 61H131', tone(p.cloth, -0.4), 1.6, { opacity: 0.6 });
      s += flatBook(148, 72, 34, 6, BOOK[6]) + flatBook(150, 66, 30, 6, BOOK[2]) + flatBook(147, 60, 32, 5, BOOK[0]);
      s += part('M166 55C160 55 159 47 163 45C164 44 165.5 44.5 166 45.5C166.5 44.5 168 44 169 45C173 47 172 55 166 55Z', '#E25D5D', { w: 1.4 }) + line('M166 45.5Q166.5 43 168 41.5', '#7A5236', 1.6) + leafAt(167, 43, 6, -20, 2, '#7FB894') + shine(ellD(163.6, 48, 0.9, 1.4));
      return s;
    },
  },
  {
    id: 'mesaLuz', name: 'Mesita de luz', cat: 'mesas', price: 80, w: 78, h: 116, place: 'piso', tags: ['dulce', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(39, 112, 34, 5);
      [14, 64].forEach((x) => { s += face(`M${x - 5} 99H${x + 5}L${x + 3} 110Q${x} 113 ${x - 3} 110Z`, W.side, { w: 1.7 }); });
      s += face(rr(8, 48, 62, 54, 3), W.front) + grain(10, 50, 58, 48, p.wood, { seed: 81 });
      s += drawer(14, 54, 50, 16, p.wood, p.accent, { seed: 82, knob: true });
      // repisa abierta con libros acostados y un canastito
      const H = hollow(p.wood);
      s += face(rr(14, 74, 50, 23, 2), H, { w: 1.6 }) + calm(14, 74, 50, 23, H) + shade(rr(14, 74, 50, 5, 1), '#1E141C', 0.35);
      s += flatBook(17, 97, 28, 6, BOOK[1]) + flatBook(19, 91, 24, 5, BOOK[0]) + flatBook(18, 86, 26, 5, BOOK[7]);
      s += part('M49 97V86Q49 84 51 84H59Q61 84 61 86V97Z', '#D9B07A', { w: 1.4 }) + line('M50 89H60M50 93H60', '#B08850', 1.4, { opacity: 0.7 });
      s += slab(4, 42, 70, 6, 24, p.wood, { under: [8, 62], seed: 83 });
      // lamparita y despertador
      s += tableLamp(24, 38, p.cloth, metalOf(p.accent), 0.82);
      const ck = metalOf(p.accent);
      s += shade(ellD(56, 38, 9, 2), '#2A1C24', 0.22);
      s += line('M50 37.5L48.5 39.5M62 37.5L63.5 39.5', INK, 1.6);
      s += part(ellD(51, 24.5, 3.6, 3.2), ck, { w: 1.3 }) + part(ellD(61, 24.5, 3.6, 3.2), ck, { w: 1.3 });
      s += part(ellD(56, 31, 8, 7.5), mix(p.cloth, '#FFFFFF', 0.25), { w: 1.6 }) + flat(ellD(56, 31.2, 5.6, 5.2), '#FFFDF8');
      s += line('M56 31.2V28M56 31.2L58.4 32.4', INK, 1.4) + shine(ellD(52, 27, 1.2, 1));
      return s;
    },
  },
  {
    id: 'mesaCentro', name: 'Mesita ratona', cat: 'mesas', price: 90, w: 156, h: 76, place: 'piso', tags: ['aesthetic', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(78, 72, 70, 6);
      // patas de atrás: asoman a los costados, más arriba (están más lejos)
      [24, 132].forEach((x) => { s += face(`M${x - 3.5} 46H${x + 3.5}L${x + 2.5} 62Q${x} 64 ${x - 2.5} 62Z`, W.deep, { w: 1.6 }); });
      // faldón bajo el tablero, en su sombra
      const legC = tone(p.wood, -0.35);
      s += face('M24 54A66 17 0 0 0 132 54V59A66 17 0 0 1 24 59Z', legC, { w: 1.6 }) + shade('M24 54A66 17 0 0 0 132 54V56.5A66 17 0 0 1 24 56.5Z', W.deep, 0.4);
      // patas de adelante torneadas: collar, cuenta y pie de bola
      [30, 126].forEach((x) => {
        s += face(`M${x - 3.6} 58H${x + 3.6}L${x + 2.6} 68H${x - 2.6}Z`, legC, { w: 1.6 });
        s += face(rr(x - 5.5, 55, 11, 5, 1.5), W.front, { w: 1.6 }) + line(`M${x - 3.5} 56.6H${x + 3}`, W.hi, 1.3, { opacity: 0.8 });
        s += part(ellD(x, 63.5, 4.8, 2.4), W.front, { w: 1.4 }) + part(ellD(x, 69.6, 4.6, 2.8), W.front, { w: 1.5 }) + shine(ellD(x - 2, 68.8, 1, 0.9), { opacity: 0.6 });
      });
      // tablero ovalado: canto con filo de luz, cara de arriba con vetas y
      // una moldura tallada alrededor
      s += face('M8 36V44A70 17 0 0 0 148 44V36Z', W.front) + line('M10 40.5A68 16 0 0 0 146 40.5', W.hi, 1.6, { opacity: 0.8 });
      s += face(ellD(78, 36, 70, 17), W.top) + calmD(ellD(78, 36, 66.4, 13.4), W.top);
      s += grain(24, 24, 108, 22, p.wood, { seed: 91, gap: 5, amp: 0.6, pxGap: 2.4 });
      s += line(ellD(78, 36, 61, 13.4), tone(p.wood, -0.8), 1.5, { opacity: 0.55, 'data-skip': 'pixel' }) + line(ellD(78, 36.9, 61, 13.4), W.hi, 1.3, { opacity: 0.65, 'data-skip': 'pixel' });
      s += shade(ellD(48, 27, 22, 4), '#FFFFFF', 0.3);
      // la merienda: florerito, taza de cada lado, tetera sobre su
      // carpetita de encaje y un plato de galletas
      s += vaseFlowers(32, 36, p.accent === '#FFFFFF' ? p.cloth : p.accent, 0.8);
      s += `<g transform="translate(66 39) scale(1 0.4)">${flat(flowerD(0, 0, 22, 12), '#FFFFFF', { opacity: 0.95 })}</g>`;
      s += teapot(64, 39, mix(p.cloth, '#FFFFFF', 0.2));
      s += teacup(97, 37, mix(p.cloth, '#FFFFFF', 0.35));
      s += shade(ellD(123, 46.5, 14, 3.4), '#2A1C24', 0.2) + smallPart(ellD(122, 44, 14, 4.6), '#FFFDF8', 1.4) + flat(ellD(122, 44, 10.5, 3.2), mix(p.cloth, '#FFFFFF', 0.55));
      [[116.5, 42.6, '#F0BE7E'], [127, 42, '#E8B070'], [122, 45.4, '#F0BE7E']].forEach(([x, y, c]) => { s += smallPart(ellD(x, y, 5.6, 3.4), c, 1.2) + flat(ellD(x - 1.8, y - 0.6, 1.1, 0.8), '#7A4A30') + flat(ellD(x + 1.8, y + 0.6, 1.1, 0.8), '#7A4A30') + flat(ellD(x + 0.4, y - 1.4, 0.9, 0.6), '#7A4A30'); });
      return s;
    },
  },
  {
    id: 'comoda', name: 'Cómoda', cat: 'mesas', price: 140, w: 146, h: 140, place: 'piso', tags: ['rustico', 'dulce'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(73, 136, 68, 6);
      // patitas de bollo en las esquinas
      [20, 126].forEach((x) => { s += face(`M${x - 8} 121H${x + 8}V124Q${x + 8} 134 ${x} 134Q${x - 8} 134 ${x - 8} 124Z`, W.side, { w: 1.8 }) + shine(ellD(x - 4, 126, 1.5, 2), { opacity: 0.5 }); });
      // cuerpo y faldón con un arco
      s += face(rr(10, 54, 126, 66, 2), W.front);
      s += face('M10 118H136V126H104Q73 116 42 126H10Z', W.front, { w: 1.8 });
      s += shade('M44 126Q73 118 102 126Z', W.deep, 0.35);
      // tres cajones
      [60, 79, 98].forEach((y, i) => { s += drawer(17, y, 112, 17, p.wood, p.accent, { seed: 11 + i * 5 }); });
      // tapa con voladizo
      s += slab(4, 47, 138, 7, 22, p.wood, { under: [10, 126] });
      // encima: florero de cerámica con flores y un portarretratos
      s += vaseFlowers(32, 43, p.cloth);
      s += frame(92, 43, p.wood, p.accent);
      return s;
    },
  },
  {
    id: 'tocador', name: 'Tocador', cat: 'mesas', price: 175, w: 160, h: 200, place: 'piso', tags: ['princesa', 'aesthetic', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      const ac = metalOf(p.accent);
      let s = floorShadow(80, 196, 74, 6);
      // espejo ovalado entre dos columnitas, con un moño arriba
      s += face(rr(30, 50, 8, 56, 3), W.side, { w: 1.7 }) + face(rr(122, 50, 8, 56, 3), W.side, { w: 1.7 });
      s += part(ellD(34, 58, 4, 4), ac, { w: 1.3 }) + part(ellD(126, 58, 4, 4), ac, { w: 1.3 });
      s += face(ellD(80, 58, 41, 47), W.front) + grain(46, 20, 68, 76, p.wood, { dir: 'v', gap: 9, seed: 101 });
      s += face(ellD(80, 58, 33, 39), '#CFE6F3', { w: 1.8 }) + calmD(ellD(80, 58, 29.4, 35.4), '#CFE6F3');
      s += shade('M47 72C50 90 64 98 80 97C100 96 112 82 113 64C108 80 96 90 80 90C66 90 54 84 47 72Z', '#8FB4D8', 0.35);
      s += shine('M56 50C58 36 66 26 76 22L80 25C70 30 63 40 61 52Z', { opacity: 0.75 }) + shine('M64 58C65 50 68 44 72 40L74 42C71 46 69 52 68 58Z', { opacity: 0.55 });
      s += line('M44 40Q50 22 66 16', W.hi, 1.8, { opacity: 0.7 });
      s += part('M80 12C72 4 64 6 66 13C68 18 76 16 80 12C84 16 92 18 94 13C96 6 88 4 80 12Z', ac, { w: 1.5 }) + part('M78 13L72 24L77 22ZM82 13L88 24L83 22Z', ac, { w: 1.3 }) + part(ellD(80, 12, 3, 3), tone(ac, -0.4), { w: 1.2 });
      // mesa: cajones, faldón con arco y patas curvas
      s += face('M21 146H31Q32 170 28 191Q25 194 22 191Q24 170 21 146Z', W.side, { w: 1.8 }) + face('M129 146H139Q136 170 138 191Q135 194 132 191Q128 170 129 146Z', W.side, { w: 1.8 });
      s += line('M24 150Q26 170 24.6 188M132 150Q131 170 134.4 188', W.front, 1.5, { opacity: 0.8 });
      s += face(rr(10, 118, 140, 30, 2), W.front);
      s += face('M10 146H150V152H112Q80 142 48 152H10Z', W.front, { w: 1.8 }) + shade('M50 152Q80 144 110 152Z', W.deep, 0.35);
      s += drawer(16, 122, 62, 22, p.wood, p.accent, { seed: 102, knob: true }) + drawer(82, 122, 62, 22, p.wood, p.accent, { seed: 103, knob: true });
      s += slab(6, 112, 148, 7, 28, p.wood, { under: [10, 140], seed: 104 });
      // perfumes, labial y un alhajero redondo
      s += perfumeHeart(28, 107, p.cloth, ac) + perfumeTall(47, 108, mix(p.cloth, '#B892E0', 0.55), ac);
      s += shade(ellD(117, 108, 4, 1.2), '#2A1C24', 0.25) + face(rr(114, 98, 6, 10, 1), ac, { w: 1.2 }) + part(`M114.6 98V93.5Q117 90.5 119.4 93.5V98Z`, '#E04F78', { w: 1.2 });
      s += shade(ellD(134, 108, 10, 2), '#2A1C24', 0.22) + face('M125 106V101H143V106Q143 108 141 108H127Q125 108 125 106Z', mix(p.cloth, '#FFFFFF', 0.35), { w: 1.4 }) + face(ellD(134, 101, 9, 3), mix(p.cloth, '#FFFFFF', 0.55), { w: 1.4 }) + part(ellD(134, 98.6, 2.2, 1.6), ac, { w: 1.1 });
      return s;
    },
  },
  {
    id: 'ropero', name: 'Ropero', cat: 'mesas', price: 220, w: 150, h: 236, place: 'piso', tags: ['rustico', 'elegante', 'princesa'],
    draw: (p) => {
      const W = mat(p.wood);
      const ac = metalOf(p.accent);
      let s = floorShadow(75, 232, 70, 6);
      [22, 128].forEach((x) => { s += face(`M${x - 8} 218H${x + 8}V221Q${x + 8} 231 ${x} 231Q${x - 8} 231 ${x - 8} 221Z`, W.side, { w: 1.8 }); });
      // cuerpo
      s += face(rr(10, 30, 130, 190, 3), W.front);
      s += line('M14 36V214', W.hi, 1.6, { opacity: 0.6 }) + shade(rr(133, 34, 5, 184, 2), W.deep, 0.3);
      // dos puertas con paneles (el de arriba en arco) y vetas paradas
      const door = (x) => {
        let d = face(rr(x, 38, 56, 144, 2), tone(p.wood, 0.1), { w: 1.6 }) + calm(x, 38, 56, 144, tone(p.wood, 0.1));
        d += grain(x + 3, 41, 50, 138, p.wood, { dir: 'v', gap: 11, seed: x });
        const up = `M${x + 8} 104V62Q${x + 8} 46 ${x + 28} 46Q${x + 48} 46 ${x + 48} 62V104Z`;
        d += face(up, tone(p.wood, -0.12), { w: 1.4 }) + line(`M${x + 10.5} 101V62Q${x + 10.5} 49 ${x + 28} 49`, tone(p.wood, 1), 1.5, { opacity: 0.7 });
        d += face(rr(x + 8, 112, 40, 62, 3), tone(p.wood, -0.12), { w: 1.4 }) + line(`M${x + 10.5} 171V115H${x + 45}`, tone(p.wood, 1), 1.5, { opacity: 0.7 });
        return d;
      };
      s += door(18) + door(76);
      // un pañuelo que quedó apretado entre las puertas
      s += part('M73 138Q68 150 70 164Q73 169 77 163Q80 152 78 138Z', p.cloth, { w: 1.5 }) + flat(ellD(72.6, 152, 1.4, 1.4), '#FFFFFF') + flat(ellD(75.6, 160, 1.4, 1.4), '#FFFFFF') + flat(ellD(74.4, 145, 1.2, 1.2), '#FFFFFF');
      // tiradores y bocallave de corazón
      s += knob(68, 112, ac, 4) + knob(82, 112, ac, 4);
      s += part('M75 92C71 89 71 85 73 84C74 83.4 75 84 75 84.8C75 84 76 83.4 77 84C79 85 79 89 75 92Z', ac, { w: 1.2 });
      // cajón de abajo y zócalo
      s += drawer(18, 188, 114, 24, p.wood, p.accent, { seed: 111 });
      s += face(rr(8, 214, 134, 6, 2), W.side, { w: 1.6 });
      // cornisa con voladizo y copete tallado
      s += slab(2, 24, 146, 8, 24, p.wood, { seed: 112 });
      s += face('M48 25Q52 14 62 14Q68 4 75 4Q82 4 88 14Q98 14 102 25Z', W.front, { w: 1.7 }) + line('M56 22Q58 18 64 17.5Q69 9 75 8.5', W.hi, 1.5, { opacity: 0.7 });
      s += shade('M75 20C70 16 70 12 72.4 11C73.8 10.4 75 11.4 75 12.4C75 11.4 76.2 10.4 77.6 11C80 12 80 16 75 20Z', W.deep, 0.5);
      return s;
    },
  },
  {
    id: 'estanteria', name: 'Biblioteca', cat: 'mesas', price: 150, w: 132, h: 210, place: 'piso', tags: ['elegante', 'aesthetic', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood);
      const H = hollow(p.wood);
      let s = floorShadow(66, 205, 62, 6);
      s += face(rr(6, 24, 120, 182, 3), W.front) + grain(8, 26, 116, 176, p.wood, { dir: 'v', gap: 12, seed: 121 });
      s += line('M9.5 30V196', W.hi, 1.6, { opacity: 0.6 });
      // fondo en sombra con sus tablas
      s += face(rr(14, 31, 104, 165, 2), H, { w: 1.6 }) + calm(14, 31, 104, 165, H);
      s += line('M40 33V194M66 33V194M92 33V194', tone(H, -0.8), 1.5, { opacity: 0.5 });
      // repisas: canto claro, y debajo, la sombra que tiran
      const shelves = [72, 112, 152];
      s += shade(rr(14, 31, 104, 6, 1), '#1E141C', 0.4);
      shelves.forEach((y) => { s += shade(rr(14, y + 6, 104, 6, 1), '#1E141C', 0.4); });
      // 1: libros, uno apoyado, y un potus que se descuelga
      s += book(18, 72, 9, 31, BOOK[0], { label: true }) + book(27, 72, 8, 34, BOOK[7]) + book(35, 72, 10, 29, BOOK[6], { label: true }) + book(45, 72, 8, 32, BOOK[2]);
      s += leanBook(59, 72, 8, 28, BOOK[3], -16);
      s += book(70, 72, 7, 25, BOOK[4]);
      // 2: pila con un gatito de cerámica, libros y un frasco de caramelos
      s += flatBook(18, 112, 32, 6, BOOK[1]) + flatBook(20, 106, 27, 6, BOOK[5]) + flatBook(19, 100, 30, 5, BOOK[3]);
      s += ceramicCat(33, 95);
      s += book(54, 112, 9, 30, BOOK[8], { label: true }) + book(63, 112, 7, 27, BOOK[0]) + book(70, 112, 10, 31, BOOK[4], { label: true }) + book(80, 112, 8, 28, BOOK[2]);
      s += candyJar(103, 112, metalOf(p.accent));
      // 3: retrato, libros y otro apoyado
      s += frame(18, 152, p.wood, p.accent, 20, 26);
      s += book(42, 152, 10, 32, BOOK[5], { label: true }) + book(52, 152, 8, 29, BOOK[1]) + book(60, 152, 9, 33, BOOK[7]) + book(69, 152, 7, 27, BOOK[6]);
      s += leanBook(83, 152, 9, 30, BOOK[0], -14) + book(98, 152, 9, 30, BOOK[3], { label: true }) + book(107, 152, 8, 26, BOOK[8]);
      // 4: canasto con una mantita y dos libros grandes
      s += basket(18, 194, 44, 22, mix(p.cloth, '#FFFFFF', 0.25));
      s += book(68, 194, 13, 35, BOOK[6], { label: true }) + book(81, 194, 12, 32, BOOK[8], { label: true });
      s += flatBook(96, 194, 20, 7, BOOK[2]) + flatBook(97, 187, 18, 6, BOOK[4]);
      shelves.forEach((y) => { s += face(rr(12, y, 108, 7, 1.5), W.top, { w: 1.5 }) + line(`M15 ${y + 2}H117`, W.hi, 1.4, { opacity: 0.8 }); });
      s += shelfPlant(100, 72, mix(p.cloth, '#FFFFFF', 0.25), 20);
      // zócalo y cornisa
      s += face(rr(4, 194, 124, 12, 3), W.front, { w: 1.8 }) + grain(6, 197, 120, 7, p.wood, { seed: 123, gap: 6 }) + line('M8 196.5H124', W.hi, 1.5, { opacity: 0.8 });
      s += slab(2, 18, 128, 8, 22, p.wood, { seed: 124 });
      return s;
    },
  },
  {
    id: 'bau', name: 'Baúl', cat: 'mesas', price: 100, w: 140, h: 108, place: 'piso', tags: ['rustico', 'elegante', 'gotico'],
    draw: (p) => {
      const W = mat(p.wood);
      const ac = metalOf(p.accent);
      const A = mat(ac);
      let s = floorShadow(70, 104, 66, 6);
      // cuerpo de tablas
      s += face(rr(10, 54, 120, 48, 4), W.front) + calm(10, 54, 120, 48, W.front);
      s += line('M13 70H127M13 86H127', tone(p.wood, -0.9), 1.6, { opacity: 0.55 });
      s += grain(12, 56, 116, 44, p.wood, { seed: 131, gap: 8 });
      s += line('M13 72H127M13 88H127', W.hi, 1.3, { opacity: 0.45 });
      // tapa abovedada: el arco de frente, la luz arriba
      s += face('M7 58V42C7 22 34 10 70 10C106 10 133 22 133 42V58Z', W.top) + calmD('M10.6 54.4V42C10.6 25 36 13.6 70 13.6C104 13.6 129.4 25 129.4 42V54.4Z', W.top);
      s += grain(14, 22, 112, 30, p.wood, { seed: 132, gap: 8 });
      s += line('M18 36C26 24 46 17 70 17', W.hi, 2, { opacity: 0.7 });
      s += face('M6 52H134V60H6Z', tone(p.wood, -0.35), { w: 1.6 }) + line('M9 54H131', W.hi, 1.3, { opacity: 0.6 });
      // herrajes: zunchos con remaches, esquineros y cerradura de corazón
      [30, 110].forEach((x) => {
        s += face(`M${x - 6} 13.5Q${x} 12 ${x + 6} 13.5V102H${x - 6}Z`, ac, { w: 1.6 }) + line(`M${x - 3.5} 18V98`, A.hi, 1.6, { opacity: 0.8 });
        [24, 46, 66, 92].forEach((y) => { s += part(ellD(x, y, 1.7, 1.7), A.side, { w: 1 }); });
      });
      s += face('M10 92V98Q10 102 14 102H22V96Q16 96 16 92Z', ac, { w: 1.4 }) + face('M130 92V98Q130 102 126 102H118V96Q124 96 124 92Z', ac, { w: 1.4 });
      s += face(rr(59, 50, 22, 24, 4), ac, { w: 1.6 }) + line('M62 53H70', A.hi, 1.6, { opacity: 0.85 });
      s += flat('M70 67C64.5 63 64 58.5 66.4 57.2C68 56.4 70 57.6 70 59C70 57.6 72 56.4 73.6 57.2C76 58.5 75.5 63 70 67Z', A.deep) + flat('M69 65h2v4h-2Z', A.deep);
      return s;
    },
  },
  {
    id: 'cajaJuguetes', name: 'Caja de juguetes', cat: 'mesas', price: 110, w: 132, h: 112, place: 'piso', tags: ['dulce', 'y2k'],
    draw: (p) => {
      const W = mat(p.wood);
      const H = hollow(p.wood);
      let s = floorShadow(66, 107, 62, 6);
      // la tapa abierta, apoyada atrás, y el hueco
      s += face(rr(10, 18, 112, 28, 4), tone(p.wood, -0.3)) + grain(12, 20, 108, 24, tone(p.wood, -0.3), { seed: 141 });
      s += face(rr(8, 40, 116, 16, 3), H) + calm(8, 40, 116, 16, H);
      // juguetes que asoman: pelota de playa, osito, cubo con estrella
      s += part(ellD(34, 44, 17, 17), '#FFFFFF', { w: 1.8 });
      s += flat('M34 27C26 32 24 44 26 58C30 58 32 58 34 61C32 50 31 38 34 27Z', '#F28CA8') + flat('M34 27C42 32 44 44 42 58C38 58 36 58 34 61C36 50 37 38 34 27Z', '#7FA9DE') + flat('M17.4 40C19 34 24 29 30 27.6C27 32 26 38 26 44Z', '#F2C14E') + flat('M50.6 40C49 34 44 29 38 27.6C41 32 42 38 42 44Z', '#7FB894');
      s += part(ellD(34, 36, 4, 3), '#FFFFFF', { w: 1.2 }) + shine(ellD(27, 34, 2.4, 3.4), { opacity: 0.8 });
      const bear = '#C99A72';
      s += part(ellD(73, 24, 6, 6), bear, { w: 1.6 }) + part(ellD(95, 24, 6, 6), bear, { w: 1.6 }) + flat(ellD(73, 24, 2.8, 2.8), '#E9C4A0') + flat(ellD(95, 24, 2.8, 2.8), '#E9C4A0');
      s += part('M84 22C96 22 100 32 100 40C100 50 94 56 84 56C74 56 68 50 68 40C68 32 72 22 84 22Z', bear, { w: 1.8 });
      s += flat(ellD(84, 44, 7, 5.4), '#E9C4A0') + flat(ellD(84, 41.6, 2.6, 1.8), '#5A3826') + line('M84 43.6V46M81.6 47Q84 48.6 86.4 47', '#5A3826', 1.3);
      s += flat(ellD(78, 36, 1.8, 2.2), INK) + flat(ellD(90, 36, 1.8, 2.2), INK) + flat(ellD(74.6, 43, 2.6, 1.6), '#FF9FB5') + flat(ellD(93.4, 43, 2.6, 1.6), '#FF9FB5');
      s += part('M88 50H106V56H88Z', fabricOf(p), { w: 1.4 });
      s += face(rr(104, 30, 18, 18, 3), '#8FC7EE', { w: 1.6 }) + flat('M113 33.5L114.6 37H118.4L115.4 39.4L116.6 43L113 40.8L109.4 43L110.6 39.4L107.6 37H111.4Z', '#FFFFFF');
      // frente de la caja con baldosas pintadas
      s += face(rr(8, 50, 116, 54, 4), W.front) + calm(8, 50, 116, 54, W.front) + line('M12 53.4H120', W.hi, 1.8, { opacity: 0.8 });
      s += grain(10, 56, 112, 44, p.wood, { seed: 142 });
      const tiles = [['#F28CA8', 'corazon'], ['#7FA9DE', 'luna'], ['#F2C14E', 'estrella']];
      tiles.forEach(([c, k], i) => {
        const x = 20 + i * 33, y = 62;
        s += face(rr(x, y, 26, 28, 4), c, { w: 1.6 }) + line(`M${x + 3} ${y + 2.6}H${x + 23}`, tone(c, 1.2), 1.5, { opacity: 0.8 });
        if (k === 'corazon') s += flat(`M${x + 13} ${y + 22}C${x + 4} ${y + 16} ${x + 4} ${y + 8} ${x + 9} ${y + 7.4}C${x + 11} ${y + 7.2} ${x + 13} ${y + 9} ${x + 13} ${y + 10.4}C${x + 13} ${y + 9} ${x + 15} ${y + 7.2} ${x + 17} ${y + 7.4}C${x + 22} ${y + 8} ${x + 22} ${y + 16} ${x + 13} ${y + 22}Z`, '#FFFFFF');
        if (k === 'luna') s += flat(`M${x + 16} ${y + 6}C${x + 8} ${y + 6} ${x + 5} ${y + 16} ${x + 9} ${y + 21}C${x + 13} ${y + 25} ${x + 20} ${y + 23} ${x + 21} ${y + 19}C${x + 15} ${y + 21} ${x + 10} ${y + 16} ${x + 12} ${y + 11}C${x + 13} ${y + 8} ${x + 15} ${y + 6.5} ${x + 16} ${y + 6}Z`, '#FFFFFF');
        if (k === 'estrella') s += flat(`M${x + 13} ${y + 5}L${x + 15.6} ${y + 11.4}H${x + 22}L${x + 16.8} ${y + 15.4}L${x + 18.8} ${y + 22}L${x + 13} ${y + 18}L${x + 7.2} ${y + 22}L${x + 9.2} ${y + 15.4}L${x + 4} ${y + 11.4}H${x + 10.4}Z`, '#FFFFFF');
      });
      s += face(rr(6, 98, 120, 7, 2.5), W.side, { w: 1.6 });
      return s;
    },
  },
  {
    id: 'ataud', name: 'Estante ataúd', cat: 'mesas', price: 190, w: 116, h: 216, place: 'piso', tags: ['gotico', 'metalero'],
    draw: (p) => {
      const W = mat(p.wood);
      const H = hollow(p.wood);
      let s = floorShadow(58, 211, 50, 6);
      s += face('M58 6L96 30L86 210H30L20 30Z', W.front) + grain(26, 24, 64, 182, p.wood, { dir: 'v', gap: 10, seed: 151 });
      s += line('M24 33L33 206', W.hi, 1.6, { opacity: 0.6 });
      const inner = 'M58 18L86 36L78 200H38L30 36Z';
      s += face(inner, H, { w: 1.6 }) + calmD('M58 22.2L82.4 38L74.6 196.4H41.4L33.6 38Z', H);
      // telaraña en el rincón de arriba
      s += line('M58 22L58 40M58 22L48 34M58 22L68 34M52 30Q58 33 64 30M50 35Q58 39 66 35', '#E9E3F0', 1.2, { opacity: 0.7, 'data-skip': 'pixel' });
      const ledge = (y) => { const k = (y - 36) * 0.05; return face(`M${31 + k * 0.3} ${y}H${85 - k * 0.3}V${y + 6}H${31 + k * 0.3}Z`, W.top, { w: 1.4 }) + shade(`M${32} ${y + 6}H${84}V${y + 11}H${32}Z`, '#1E141C', 0.4); };
      // velas
      s += candle(45, 70, 18) + candle(56, 70, 12, '#E9E0D2');
      s += ledge(70);
      // pociones de vidrio
      s += part('M64 111C58 111 57 105 61 101V95H67V101C71 105 70 111 64 111Z', '#DCEFE8', { w: 1.4 }) + flat('M58.6 105C58.6 108 61 110.6 64 110.6C67 110.6 69.4 108 69.4 105Z', '#7FD4A0') + face(rr(60.5, 92, 7, 4, 1), '#B9A68C', { w: 1.1 }) + line('M60.6 103L60 107', '#FFFFFF', 1.4, { opacity: 0.85 });
      s += part('M42 111V97L44 93H50L52 97V111Z', mix(p.cloth, '#FFFFFF', 0.55), { w: 1.4 }) + flat('M42.6 102H51.4V110.4H42.6Z', p.cloth) + face(rr(44.5, 89, 5, 4, 1), '#B9A68C', { w: 1.1 }) + line('M44.6 99V106', '#FFFFFF', 1.4, { opacity: 0.85 });
      s += ledge(112);
      // libros de hechizos
      s += book(40, 154, 9, 28, '#5F4B8B', { label: true }) + book(49, 154, 8, 25, '#8E1F2C') + book(57, 154, 10, 30, '#3E5A4A', { label: true }) + leanBook(70, 154, 8, 24, '#6E5A7E', -14);
      s += ledge(154);
      // calavera
      s += shade(ellD(58, 197, 11, 2), '#000000', 0.3);
      s += part('M58 176C48 176 45 183 46 188C46.6 191 49 192 50 193V197H66V193C67 192 69.4 191 70 188C71 183 68 176 58 176Z', '#F3EDE3', { w: 1.6 });
      s += flat(ellD(53, 186, 3, 3.2), '#3A2A3E') + flat(ellD(63, 186, 3, 3.2), '#3A2A3E') + flat('M58 189L56.6 192H59.4Z', '#3A2A3E') + line('M54 195V197M58 195V197M62 195V197', '#B9A99A', 1.2);
      s += shine(ellD(52, 180, 2, 1.2), { opacity: 0.7 });
      // tapa en punta, con una cruz
      s += face('M58 6L96 30L94 40L58 18L22 40L20 30Z', W.top, { w: 1.8 }) + line('M26 31.4L58 11.5', W.hi, 1.5, { opacity: 0.7 });
      // tiradorcito de metal en la punta
      s += knob(58, 12, p.accent, 3.4);
      return s;
    },
  },
];
