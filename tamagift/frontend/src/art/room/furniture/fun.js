// Música, juegos, deporte, mascotas y luces.
//
// Arriba, las ayudas de MATERIAL que usan también wall.js y vibes.js:
// madera con vetas onduladas y canto iluminado, metal con su franja de
// brillo, vidrio con reflejos en diagonal y luces encendidas (halo suave
// en escalones + centro claro). Todo con la perspectiva y la luz de
// draw.js: frente + tapa, luz de arriba a la izquierda.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, floorShadow, Cir, Ell, INK, hollow, tube, DEPTH, G } from '../draw.js';
import { parseColor, lum } from '../../color.js';

export const METAL = '#5A5562';
export const STEEL = '#C9CCD3';
export const BRASS = '#D9AE5B';
export const WARM = '#FFE6A3';   // luz de bombillo
const RUBBER = '#3A3542';

// ── Ayudas de material ───────────────────────────────────────────
const f1 = (v) => Math.round(v * 10) / 10;
const rnd = (seed) => { let s = (Math.abs(Math.round(seed * 7)) % 233279) + 11; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
export const lumOf = (c) => lum(parseColor(c) || [200, 200, 200, 1]);

/**
 * Vetas de madera: trazos ondulados (nunca rectas perfectas) de un tono
 * más oscuro — más claro si la madera es oscura —, escalonados y de largo
 * distinto. En pixel tiñen lo de abajo; en neón no se dibujan (serían
 * tubos de luz).
 */
export function grain(x, y, w, h, c, o = {}) {
  if (w < 6 || h < 3) return '';
  const L = lumOf(c);
  const col = o.color || (L < 0.3 ? tone(c, 1.2) : tone(c, -1.1));
  const op = o.op ?? (L > 0.82 ? 0.3 : L < 0.3 ? 0.42 : 0.5);
  const r = rnd(o.seed ?? (x * 3.1 + y * 1.7 + w * 0.7 + h));
  const vert = !!o.vertical;
  const len = vert ? h : w, across = vert ? w : h;
  const n = o.n ?? Math.max(1, Math.round(across / (o.gap || 7)));
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5 + (r() - 0.5) * 0.55) / n;
    const a = (vert ? x : y) + across * t;
    const s0 = (vert ? y : x) + len * (0.02 + r() * 0.3);
    const s1 = (vert ? y : x) + len * (0.66 + r() * 0.32);
    const Lh = (s1 - s0) / 2, amp = (o.amp ?? 1.3) * (r() < 0.5 ? -1 : 1);
    d += vert
      ? `M${f1(a)} ${f1(s0)}q${f1(amp)} ${f1(Lh / 2)} 0 ${f1(Lh)}t0 ${f1(Lh)}`
      : `M${f1(s0)} ${f1(a)}q${f1(Lh / 2)} ${f1(amp)} ${f1(Lh)} 0t${f1(Lh)} 0`;
  }
  if (o.knot && len > 30 && across > 10) {
    const kx = vert ? x + across * 0.5 : x + len * (0.3 + r() * 0.4), ky = vert ? y + len * (0.3 + r() * 0.4) : y + across * 0.5;
    d += vert ? `M${f1(kx)} ${f1(ky - 3.5)}q2.4 3.5 0 7q-2.4 -3.5 0 -7Z` : `M${f1(kx - 3.5)} ${f1(ky)}q3.5 -2.4 7 0q-3.5 2.4 -7 0Z`;
  }
  return line(d, col, o.w ?? 1.3, { opacity: op, 'data-skip': 'neon' });
}

/** Cara de madera (x, y arriba a la izquierda) con sus vetas. */
export function plank(x, y, w, h, c, o = {}) {
  let s = face(rr(x, y, w, h, o.r ?? 2), c, { w: o.w });
  s += grain(x + 3, y + 2.5, w - 6, h - 5, c, { vertical: o.vertical, seed: o.seed, gap: o.gap, knot: o.knot });
  return s;
}

/** Caja de madera: tapa clara con vetas, frente con vetas y canto iluminado. */
export function woodBox(x, y, w, h, d, c, o = {}) {
  const m = mat(c), dd = d * DEPTH, r = o.r ?? 2;
  let s = '';
  if (dd > 0) {
    s += face(rrTop(x, y - h - dd, w, dd + Math.min(r, 2), Math.min(r, dd)), o.top || m.top, { w: o.w });
    if (dd >= 7 && o.grain !== false) s += grain(x + 4, y - h - dd + 2.2, w - 8, dd - 3.6, o.top || m.top, { gap: 4.6, amp: 0.8, seed: (o.seed || 0) + 1 });
  }
  s += face(rr(x, y - h, w, h, Math.min(r, h / 3)), o.front || m.front, { w: o.w });
  if (o.grain !== false && h > 10) s += grain(x + 4, y - h + 4, w - 8, h - 7, o.front || m.front, { seed: (o.seed || 0) + 3, vertical: o.vertical, knot: o.knot });
  if (h > 7) s += line(`M${x + 3} ${y - h + 2}H${x + w - 3}`, m.hi, 1.6, { opacity: 0.85 });
  return s;
}

/**
 * Tabla con grosor (tapa de mesa, repisa): cara de arriba con vetas y
 * canto de adelante de alto `t` con su filo de luz. `y` es el borde de
 * abajo del canto.
 */
export function slab(x, y, w, t, d, c, o = {}) {
  const m = mat(c), dd = d * DEPTH, r = o.r ?? 2;
  let s = '';
  if (dd > 0) {
    s += face(rrTop(x, y - t - dd, w, dd + 1, Math.min(r, dd)), m.top, { w: o.w });
    if (dd >= 6) s += grain(x + 4, y - t - dd + 2, w - 8, dd - 3, m.top, { gap: 4.4, amp: 0.8, seed: o.seed });
  }
  s += face(rr(x, y - t, w, t, Math.min(r, t / 2)), m.front, { w: o.w });
  if (t >= 5) s += line(`M${x + 2.5} ${y - t + 1.7}H${x + w - 2.5}`, m.hi, 1.5, { opacity: 0.85 });
  return s;
}

/** Sombra que cae bajo un voladizo (debajo de una tapa, un estante). */
export const underShadow = (x, y, w, h = 4, op = 0.3, c = '#2A1C24') => shade(rr(x, y, w, h, 0), c, op);

/** Sombra de contacto de algo apoyado (en una repisa, en una mesa). */
export const contact = (cx, y, rx, op = 0.28) => Ell(cx, y, rx, Math.max(1.6, rx * 0.22), { fill: '#2A1C24', opacity: op, 'data-r': 'tone' });

/** Cajón o puerta: panel saliente con vetas y su tirador. */
export function inset(x, y, w, h, c, o = {}) {
  const fill = o.fill || tone(c, 0.12);
  let s = face(rr(x, y, w, h, o.r ?? 2.5), fill, { w: 1.7 });
  if (o.grain !== false) s += grain(x + 3, y + 3, w - 6, h - 6, fill, { vertical: h > w * 1.2, seed: x + y, gap: 6 });
  s += line(`M${x + 2.5} ${y + 1.8}H${x + w - 2.5}`, tone(fill, 1.3), 1.3, { opacity: 0.8 });
  if (o.knob) s += knob(o.knob[0], o.knob[1], o.kr || 2.8, o.kc || BRASS);
  return s;
}

/** Perilla redonda con su punto de brillo. */
export function knob(cx, cy, r, c = BRASS) {
  return part(ellD(cx, cy, r, r), c, { w: 1.3 }) + shine(ellD(cx - r * 0.3, cy - r * 0.32, r * 0.42, r * 0.42), { opacity: 0.9 });
}

/** Patas que se afinan hacia abajo, con su regatón. */
export function taperLegs(xs, yTop, yBot, wTop, wBot, c, o = {}) {
  const C = tone(c, -0.45);
  return xs.map((x) => {
    let s = face(`M${x - wTop / 2} ${yTop}H${x + wTop / 2}L${x + wBot / 2} ${yBot - 1.5}Q${x + wBot / 2} ${yBot} ${x} ${yBot}Q${x - wBot / 2} ${yBot} ${x - wBot / 2} ${yBot - 1.5}Z`, C, { w: 1.8 });
    if (o.cap) s += face(rr(x - wBot / 2 - 0.5, yBot - 4, wBot + 1, 4, 1.2), o.cap, { w: 1.3 });
    return s;
  }).join('');
}

/**
 * Varilla recta de metal con grosor: polígono con contorno y, si es
 * gruesa, su franja de brillo del lado de la luz (arriba a la izquierda).
 */
export function rod(x0, y0, x1, y1, w, c = METAL, o = {}) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  let nx = (-dy / L), ny = (dx / L);
  if (nx + ny > 0) { nx = -nx; ny = -ny; }   // la normal que mira a la luz
  const h = w / 2;
  const P = (k) => `${f1(x0 + nx * h * k)} ${f1(y0 + ny * h * k)}L${f1(x1 + nx * h * k)} ${f1(y1 + ny * h * k)}`;
  let s = face(`M${P(1)}L${f1(x1 - nx * h)} ${f1(y1 - ny * h)}L${f1(x0 - nx * h)} ${f1(y0 - ny * h)}Z`, c, { w: o.lw ?? 1.5 });
  if (w >= 5.5 && o.shine !== false) {
    const a = 0.15, b = 0.55;
    s += flat(`M${f1(x0 + nx * h * b)} ${f1(y0 + ny * h * b)}L${f1(x1 + nx * h * b)} ${f1(y1 + ny * h * b)}L${f1(x1 + nx * h * a)} ${f1(y1 + ny * h * a)}L${f1(x0 + nx * h * a)} ${f1(y0 + ny * h * a)}Z`, tone(c, 1.5));
  }
  return s;
}

// Recorta un polígono convexo con el semiplano a·x + b·y <= c.
function clipPoly(pts, a, b, c) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const P = pts[i], Q = pts[(i + 1) % pts.length];
    const pin = a * P[0] + b * P[1] <= c, qin = a * Q[0] + b * Q[1] <= c;
    if (pin) out.push(P);
    if (pin !== qin) {
      const t = (c - a * P[0] - b * P[1]) / (a * (Q[0] - P[0]) + b * (Q[1] - P[1]));
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
    }
  }
  return out;
}
const polyD = (pts) => (pts.length > 2 ? `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z` : '');
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export const ellPts = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * Math.PI * 2), cy + ry * Math.sin((i / n) * Math.PI * 2)]);

/**
 * Reflejos de vidrio: dos franjas en diagonal (1:1, limpias en pixel),
 * una ancha y una fina, recortadas a la forma del vidrio (`pts`, un
 * polígono convexo). `at` (0–1) corre las franjas a lo largo del vidrio.
 */
export function glints(pts, o = {}) {
  const xs = pts.map((p) => p[0] + p[1]);
  const lo = Math.min(...xs), hi = Math.max(...xs), span = hi - lo;
  const at = o.at ?? 0.24;
  const w1 = o.w1 ?? Math.min(9, span * 0.075), gap = o.gap ?? Math.min(5, span * 0.04), w2 = o.w2 ?? Math.min(3.6, span * 0.03);
  const s0 = lo + span * at;
  const band = (a, b) => polyD(clipPoly(clipPoly(pts, 1, 1, b), -1, -1, -a));
  return shine(band(s0, s0 + w1), { opacity: o.op ?? 0.55 }) + shine(band(s0 + w1 + gap, s0 + w1 + gap + w2), { opacity: (o.op ?? 0.55) * 0.75 });
}

/**
 * Halo de una luz encendida. En pixel: tres elipses en escalones (quedan
 * como bandas de 1/8, 2/8 y 3/8 de opacidad, como en un sprite). En los
 * demás estilos: dos elipses difuminadas (el filtro va en el grupo, así
 * sobrevive aunque el kit reemplace la forma), una luz suave sin anillos.
 */
const GLOW_SD = [2, 4, 7, 11];
export function halo(cx, cy, rx, ry, c = WARM, k = 1) {
  const op = (v) => Math.round(v * k * 100) / 100;
  const stepped = Ell(cx, cy, rx, ry, { fill: c, opacity: op(0.12), 'data-r': 'tone' })
    + Ell(cx, cy, rx * 0.7, ry * 0.7, { fill: c, opacity: op(0.2), 'data-r': 'tone' })
    + Ell(cx, cy, rx * 0.42, ry * 0.42, { fill: c, opacity: op(0.3), 'data-r': 'tone' });
  const want = Math.min(rx, ry) * 0.22;
  const sd = GLOW_SD.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a));
  const soft = `<defs><filter id="mbGlow${sd}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${sd}"/></filter></defs>`
    + G({ filter: `url(#mbGlow${sd})` }, Ell(cx, cy, rx * 0.74, ry * 0.74, { fill: c, opacity: op(0.3), 'data-r': 'tone' }) + Ell(cx, cy, rx * 0.4, ry * 0.4, { fill: c, opacity: op(0.34), 'data-r': 'tone' }));
  return G({ 'data-only': 'pixel' }, stepped) + G({ 'data-skip': 'pixel' }, soft);
}

/** Bombillo encendido: halo, vidrio cálido y centro blanco. */
export function bulbOn(cx, cy, r, c = WARM, o = {}) {
  let s = o.halo === false ? '' : halo(cx, cy, r * 2.6, r * 2.6, c, o.k ?? 0.9);
  s += part(ellD(cx, cy, r, r), mix(c, '#FFFFFF', 0.35), { w: o.w ?? 1.2 });
  s += shine(ellD(cx - r * 0.18, cy - r * 0.2, r * 0.52, r * 0.52), { opacity: 0.95 });
  return s;
}

/** Pliegues de tela: trazos de sombra que bajan, un poco ondulados. */
export function folds(xs, y0, y1, c, o = {}) {
  const col = tone(c, -0.9);
  const d = xs.map((x, i) => `M${f1(x)} ${f1(y0)}q${i % 2 ? 1.6 : -1.6} ${f1((y1 - y0) / 2)} 0 ${f1(y1 - y0)}`).join('');
  return line(d, col, o.w ?? 1.6, { opacity: o.op ?? 0.5 });
}

// Mancuerna tumbada: manija cromada con su moleteado y dos cabezas
// hexagonales vistas de costado (franja de arriba clara, de abajo oscura).
function dumbbell(cx, y, half, headW, headH, color) {
  const hx = half - headW;
  let s = face(rr(cx - hx - 1, y - headH / 2 - 2.6, hx * 2 + 2, 5.2, 2), STEEL, { w: 1.4 });
  s += line(`M${cx - 3} ${y - headH / 2 - 1.6}v3.2M${cx} ${y - headH / 2 - 1.6}v3.2M${cx + 3} ${y - headH / 2 - 1.6}v3.2`, '#8C8E98', 1, { opacity: 0.7, 'data-skip': 'neon' });
  [-1, 1].forEach((k) => {
    const x = k < 0 ? cx - half : cx + hx;
    s += face(`M${x + 1.5} ${y - headH}H${x + headW - 1.5}L${x + headW} ${y - headH + 2.5}V${y - 2.5}L${x + headW - 1.5} ${y}H${x + 1.5}L${x} ${y - 2.5}V${y - headH + 2.5}Z`, color, { w: 1.7 });
    s += flat(`M${x + 1.2} ${y - headH + 1.2}H${x + headW - 1.2}V${y - headH * 0.7}H${x + 1.2}Z`, tone(color, 0.75));
    s += flat(`M${x + 1.2} ${y - headH * 0.28}H${x + headW - 1.2}V${y - 1.2}H${x + 1.2}Z`, tone(color, -0.6));
    s += shine(rr(x + 2, y - headH + 1.6, Math.max(2, headW * 0.3), 2, 1), { opacity: 0.7 });
  });
  return s;
}

// Contorno de la guitarra (cuerpo en ocho), corrido y escalado desde el centro.
function guitarBody(dx = 0, dy = 0, k = 1) {
  const X = (v) => f1(46 + (v - 46) * k + dx), Y = (v) => f1(151 + (v - 151) * k + dy);
  return `M${X(46)} ${Y(104)}C${X(58)} ${Y(104)} ${X(69)} ${Y(109)} ${X(69)} ${Y(122)}C${X(69)} ${Y(132)} ${X(63)} ${Y(136)} ${X(63)} ${Y(142)}`
    + `C${X(63)} ${Y(149)} ${X(76)} ${Y(156)} ${X(76)} ${Y(172)}C${X(76)} ${Y(189)} ${X(63)} ${Y(198)} ${X(46)} ${Y(198)}`
    + `C${X(29)} ${Y(198)} ${X(16)} ${Y(189)} ${X(16)} ${Y(172)}C${X(16)} ${Y(156)} ${X(29)} ${Y(149)} ${X(29)} ${Y(142)}`
    + `C${X(29)} ${Y(136)} ${X(23)} ${Y(132)} ${X(23)} ${Y(122)}C${X(23)} ${Y(109)} ${X(34)} ${Y(104)} ${X(46)} ${Y(104)}Z`;
}

export const FUN = [
  {
    // Guitarra acústica derecha en su soporte (vertical: en pixel las
    // líneas largas quedan limpias). Tapa de abeto con sombreado
    // "sunburst", aro que asoma arriba (su tapa), boca con roseta,
    // golpeador, puente y mástil con incrustaciones.
    id: 'guitarra', name: 'Guitarra', cat: 'ocio', price: 140, w: 92, h: 214, place: 'piso', tags: ['rockero', 'metalero', 'hippie', 'punk'],
    draw: (p) => {
      const W = mat(p.wood);
      const top = mix(p.wood, '#F8E6C2', 0.3);
      const FB = '#3A2A2E';
      let s = floorShadow(46, 207, 36, 5);
      // soporte, detrás: poste, horquilla del mástil y patas abiertas
      s += rod(46, 196, 46, 74, 4, METAL);
      s += face('M38 70Q38 78 46 78Q54 78 54 70H51Q51 74.5 46 74.5Q41 74.5 41 70Z', RUBBER, { w: 1.3 });
      s += rod(46, 188, 14, 206, 4.4, METAL) + rod(46, 188, 78, 206, 4.4, METAL);
      s += face(rr(9, 203, 10, 5, 2), RUBBER, { w: 1.3 }) + face(rr(73, 203, 10, 5, 2), RUBBER, { w: 1.3 });
      // cuerpo: aro (asoma arriba, es su "tapa"), tapa y sombreado del borde
      s += face(guitarBody(0, -4), tone(p.wood, -0.35));
      s += face(guitarBody(), top);
      s += shade(`${guitarBody()}${guitarBody(0, 0, 0.84)}`, tone(p.wood, -1.3), 0.32, { 'fill-rule': 'evenodd' });
      s += shade(`${guitarBody()}${guitarBody(0, 0, 0.93)}`, tone(p.wood, -1.6), 0.3, { 'fill-rule': 'evenodd' });
      s += shine('M27 118C28 112 33 108 39 108C34 112 31 117 30 124Z', { opacity: 0.5 });
      s += shine('M21 166C22 160 26 156 30 155C27 159 25 164 25 170Z', { opacity: 0.35 });
      // roseta, boca, golpeador y puente
      s += part(ellD(46, 129, 12.5, 12.5), p.cloth, { w: 1.4 });
      s += face(ellD(46, 129, 8.5, 8.5), '#2A1E24', { w: 1.5 });
      s += shade('M40 133Q46 137 52 133Q50 136.5 46 136.5Q42 136.5 40 133Z', '#000000', 0.25);
      s += flat('M55.5 137C61 139.5 62 146 59 150.5C56 154 51.5 153 51 149.5C54.5 146.5 56.5 142 55.5 137Z', mix(top, '#5A3328', 0.45));
      s += face(rr(32, 171, 28, 7, 3), FB, { w: 1.5 });
      s += flat(rr(35, 172.4, 22, 2.2, 1), '#F1E8DA');
      // mástil: diapasón con trastes e incrustaciones, cejuela y clavijero
      s += face(rr(41.5, 24, 9, 86, 1.6), FB, { w: 1.6 });
      [34, 43, 51.5, 59.5, 67, 74, 80.5, 86.5, 92, 97.5, 102.5].forEach((y) => { s += line(`M42.6 ${y}H49.4`, '#B9AFA6', 1, { 'data-skip': 'pixel' }); });
      [[47.5], [63.5], [77.5], [95]].forEach(([y]) => { s += Cir(46, y, 1.5, { fill: '#EFE6D6', 'data-r': 'flat' }); });
      s += flat(rr(41.5, 23.4, 9, 2.6, 0.8), '#F1E8DA');
      s += face('M40.5 25L38.5 8Q38.5 3 43 3H49Q53.5 3 53.5 8L51.5 25Z', FB, { w: 1.6 });
      s += flat('M42 7H50V21H42Z', mix(FB, p.wood, 0.35), { opacity: 0.9 });
      [8.5, 14, 19.5].forEach((y) => { s += part(ellD(35, y, 3.2, 2.4), '#E9E2D2', { w: 1.1 }) + part(ellD(57, y, 3.2, 2.4), '#E9E2D2', { w: 1.1 }); });
      // cuerdas (en pixel no: serían puntos sueltos)
      s += line('M43.6 25L43 173M45.2 25L45.2 173M46.8 25L47 173M48.4 25L49 173', '#FFFFFF', 0.6, { opacity: 0.75, 'data-skip': 'pixel neon' });
      // cuna del soporte, adelante: dos apoyos de goma
      s += face(rr(19, 193, 13, 7, 2.5), RUBBER, { w: 1.4 }) + face(rr(60, 193, 13, 7, 2.5), RUBBER, { w: 1.4 });
      return s;
    },
  },
  {
    // Teclado en su soporte en X, con un cancionero abierto en el atril
    // y el pedal en el piso.
    id: 'teclado', name: 'Teclado', cat: 'ocio', price: 180, w: 178, h: 130, place: 'piso', tags: ['elegante', 'aesthetic', 'rockero'],
    draw: (p) => {
      const K = mat(p.wood);
      let s = floorShadow(89, 126, 82, 5);
      // cable del pedal (va por detrás)
      s += line('M156 118C150 108 152 96 142 86', '#2A2530', 1.6);
      // soportes en X: la pata de atrás primero, la de adelante encima
      [[30, 76], [102, 148]].forEach(([a, b]) => {
        s += rod(a, 122, b, 76, 5.5, METAL) + rod(b, 122, a, 76, 5.5, METAL);
        s += knob((a + b) / 2, 99, 2.8, STEEL);
        s += face(rr(a - 5, 119, 10, 5, 2), RUBBER, { w: 1.3 }) + face(rr(b - 5, 119, 10, 5, 2), RUBBER, { w: 1.3 });
        s += face(rr(a - 4, 72, b - a + 8, 5, 2), RUBBER, { w: 1.4 });
      });
      // pedal de sustain en el piso
      s += face('M150 124L152 116H166L168 124Z', '#2E2A33', { w: 1.5 }) + face(rr(152, 113, 14, 4, 1.5), STEEL, { w: 1.2 });
      // atril con un cancionero abierto
      s += face(rr(60, 18, 58, 30, 2), '#3A3542', { w: 1.6 });
      s += part('M63 22Q76 19 89 22V45Q76 42 63 45Z', '#FFFDF6', { w: 1.4 }) + part('M89 22Q102 19 115 22V45Q102 42 89 45Z', '#FFFDF6', { w: 1.4 });
      s += shade('M86 22.5Q89 23 92 22.5V45Q89 45.5 86 45Z', '#8A7F86', 0.35);
      [27.5, 32.5, 37.5].forEach((y) => { s += line(`M66 ${y}Q76 ${y - 1.6} 86 ${y}M92 ${y}Q102 ${y - 1.6} 112 ${y}`, '#B5ABB8', 1.1); });
      [[70, 31], [77, 27], [96, 36], [104, 31]].forEach(([x, y]) => { s += Ell(x, y, 2, 1.6, { fill: INK, 'data-r': 'flat' }) + line(`M${x + 1.6} ${y}v-6`, INK, 1.1); });
      s += face(rr(58, 44, 62, 5, 2), '#3A3542', { w: 1.5 });
      // teclado: tapa con panel y teclas, frente de la caja
      s += face(rrTop(10, 44, 158, 22, 3), K.top);
      s += grain(14, 46, 150, 3, K.top, { n: 1, amp: 0.6 });
      s += face(rr(18, 47, 34, 6, 2.5), '#3A3542', { w: 1.3 }) + line('M21 49.4H49M21 51.2H49', '#6E6878', 1, { opacity: 0.9 });
      s += face(rr(126, 47, 34, 6, 2.5), '#3A3542', { w: 1.3 }) + line('M129 49.4H157M129 51.2H157', '#6E6878', 1, { opacity: 0.9 });
      s += face(rr(74, 47, 26, 6, 1.5), '#9FDDBB', { w: 1.3 }) + flat(rr(77, 49, 9, 2, 0.6), '#4E8C70');
      [58, 64, 106, 112].forEach((x, i) => { s += Cir(x, 50, 2.2, { fill: i < 2 ? p.accent : p.cloth, stroke: INK, 'stroke-width': 1.1, 'data-r': 'part' }); });
      s += face(rr(16, 54.5, 146, 11.5, 1), '#FFFFFF', { w: 1.4 });
      for (let i = 1; i < 18; i++) s += line(`M${16 + i * 8.11} 55.5V65`, '#CFC8D3', 1.1);
      for (let i = 0; i < 17; i++) { const k = i % 7; if (k === 2 || k === 6) continue; const x = 16 + (i + 1) * 8.11; s += flat(rr(x - 2.6, 54.5, 5.2, 6.6, 0.8), '#2A2530'); }
      s += face(rr(10, 65, 158, 13, 3), K.front);
      s += grain(16, 69, 146, 6, K.front, { n: 1 });
      s += line('M13 67.4H165', K.hi, 1.5, { opacity: 0.8 });
      s += part(rr(84, 70, 10, 4, 2), p.accent === '#FFFFFF' ? p.cloth : p.accent, { w: 1.1 });
      return s;
    },
  },
  {
    // Mueble de discos: tapa con canto, compartimento con los vinilos
    // (uno asoma de su funda), parlante y, encima, el tocadiscos con su
    // plato, el disco con surcos y el brazo de metal.
    id: 'tocadiscos', name: 'Tocadiscos', cat: 'ocio', price: 170, w: 132, h: 156, place: 'piso', tags: ['hippie', 'rockero', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(66, 152, 60, 5);
      s += taperLegs([22, 110], 136, 153, 7, 4.5, p.wood, { cap: BRASS });
      s += face(rr(12, 72, 108, 66, 2.5), W.front);
      s += grain(16, 120, 100, 14, W.front, { seed: 4 });
      s += slab(6, 74, 120, 7, 36, p.wood);
      s += underShadow(12, 74, 108, 4);
      // vinilos en su compartimento
      s += face(rr(18, 82, 46, 50, 2), hollow(p.wood), { w: 1.6 });
      s += underShadow(19, 83, 44, 6, 0.35);
      const sleeves = [[21, 7, 44, '#E57B93'], [28.5, 6, 40, '#2E2A33'], [35, 7, 46, '#7FA9DE'], [42.5, 6, 42, '#F2C14E'], [49, 7, 45, '#3E3A46'], [56.5, 6, 41, '#7FB894']];
      sleeves.forEach(([x, w, h, c]) => { s += face(rr(x, 131 - h, w, h, 1), c, { w: 1.2 }) + flat(rr(x + 1, 131 - h + 1.2, Math.max(1.5, w - 3), 2, 0.6), tone(c, 0.9)); });
      s += part(ellD(39, 85, 6.5, 3.2), '#25212B', { w: 1.2 }) + flat(ellD(39, 84.6, 2, 1), p.cloth);
      // parlante: panel, woofer con su cono y tweeter
      s += inset(68, 82, 46, 50, p.wood);
      s += part(ellD(91, 112, 15, 15), RUBBER, { w: 1.6 });
      s += face(ellD(91, 112, 11, 11), '#57515F', { w: 1.4 });
      s += shade('M83 106Q86 102 91 101.5Q86 104 85 108Z', '#FFFFFF', 0.25);
      s += part(ellD(91, 112, 4.5, 4.5), '#7A7484', { w: 1.2 }) + shine(ellD(89.8, 110.8, 1.6, 1.6), { opacity: 0.8 });
      s += part(ellD(91, 90, 4.6, 4.6), RUBBER, { w: 1.3 }) + flat(ellD(91, 90, 2, 2), '#8A8494');
      // tocadiscos: base con su tapa, plato, disco y brazo
      s += face(rrTop(18, 34, 96, 20, 3), '#4A4552');
      s += face(rr(18, 53, 96, 10, 2), '#3A3542');
      s += line('M21 55H111', '#6E6878', 1.3, { opacity: 0.8 });
      s += face(ellD(50, 45, 20, 10), STEEL, { w: 1.5 });
      s += face(ellD(50, 43.6, 18.5, 9.2), '#25212B', { w: 1.4 });
      s += line(`${ellD(50, 43.6, 14, 7)}${ellD(50, 43.6, 10, 5)}`, '#55505F', 1, { opacity: 0.85 });
      s += line('M35 42Q38 37 46 36', '#9A93A6', 1.4, { opacity: 0.8 });
      s += part(ellD(50, 43.6, 5.4, 2.7), p.cloth, { w: 1.1 }) + Cir(50, 43.6, 0.9, { fill: STEEL, 'data-r': 'flat' });
      s += rod(83, 38, 67, 46, 2.6, STEEL, { lw: 1.2 });
      s += face(rr(63, 44.5, 6, 3.6, 1), '#3A3542', { w: 1.1 });
      s += part(ellD(85, 37, 4.5, 3.4), STEEL, { w: 1.3 }) + face(rr(86, 33, 6, 4, 1.4), '#6E6878', { w: 1.1 });
      s += knob(102, 47, 2.6, p.accent === '#FFFFFF' ? p.cloth : p.accent);
      s += face(rr(94, 41, 10, 3, 1.2), '#6E6878', { w: 1 });
      // una nota que sale bailando
      s += line('M108 26V12l9 -3v13', INK, 2) + Ell(106, 26, 3.4, 2.6, { fill: p.cloth, stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' }) + Ell(115, 22, 3.4, 2.6, { fill: p.cloth, stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' });
      return s;
    },
  },
  {
    // Tele de tubo con antena de conejo sobre su mueble; en la pantalla,
    // un jueguito encendido. En el hueco del medio, la consola y los
    // cartuchos; el control descansa adelante.
    id: 'tele', name: 'Tele y consola', cat: 'ocio', price: 230, w: 172, h: 176, place: 'piso', tags: ['y2k', 'aesthetic', 'deportista'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      let s = floorShadow(86, 172, 82, 5);
      s += taperLegs([22, 150], 156, 173, 7, 4.5, p.wood);
      s += face(rr(12, 118, 148, 40, 2.5), W.front);
      s += slab(8, 120, 156, 7, 42, p.wood);
      s += underShadow(12, 120, 148, 4);
      s += inset(18, 126, 48, 28, p.wood, { knob: [61, 140] });
      s += inset(106, 126, 48, 28, p.wood, { knob: [111, 140] });
      // hueco con la consola y dos cartuchos
      s += face(rr(70, 126, 32, 28, 2), hollow(p.wood), { w: 1.6 });
      s += underShadow(71, 127, 30, 4, 0.35);
      s += face(rr(74, 129, 6, 11, 1), '#7FA9DE', { w: 1.1 }) + face(rr(81, 130, 6, 10, 1), '#F2C14E', { w: 1.1 });
      s += face(rrTop(73, 140, 26, 5, 2), '#FFFFFF', { w: 1.3 }) + face(rr(73, 144, 26, 9, 1.5), '#E8E4EC', { w: 1.4 });
      s += flat(rr(76, 147.5, 4, 2, 0.8), '#7FD69A') + line('M84 148.5H95', '#B9B2C2', 1.2);
      // cable del control (por detrás de la tele)
      s += line('M48 112C52 104 70 104 86 108', '#4A4552', 1.5);
      // antena
      s += rod(82, 26, 62, 4, 2.8, STEEL, { lw: 1.2 }) + rod(90, 26, 112, 6, 2.8, STEEL, { lw: 1.2 });
      s += knob(62, 4, 3, p.accent === '#FFFFFF' ? '#F2C14E' : p.accent) + knob(112, 6, 3, p.accent === '#FFFFFF' ? '#F2C14E' : p.accent);
      // la tele: caja redondeada con tapa
      s += face(rrTop(28, 22, 116, 16, 10), C.top);
      s += face(rr(28, 34, 116, 74, 10), C.front);
      s += shade(rr(28, 96, 116, 12, 0), tone(p.cloth, -1.4), 0.18);
      s += part(ellD(86, 27, 9, 4.5), tone(p.cloth, -0.3), { w: 1.4 });
      s += shine('M34 46Q34 40 40 39H52Q42 41 38 50Z', { opacity: 0.55 });
      // pantalla: marco oscuro, vidrio curvo con el jueguito y reflejos
      s += face(rr(34, 41, 82, 61, 11), '#2A2B3D', { w: 2 });
      s += face(rr(39, 45, 72, 53, 9), '#8FD0F2', { w: 1.6 });
      s += flat('M41 63h68v20h-68Z', '#B4E1F7');
      s += flat('M40 82C48 74 58 74 64 80C70 74 84 72 92 78C98 74 106 75 110 79V88H40Z', '#93D38A');
      s += flat('M39 86H111V89Q111 98 102 98H48Q39 98 39 89Z', '#6FB86A');
      s += flat('M39 86H111V88.5H39Z', '#4E9A52');
      s += flat('M52 56c0 -4 6 -5 8 -2c2 -3 8 -2 8 2Z', '#FFFFFF');
      s += part(rr(60, 74, 12, 11, 5), '#FF8FB0', { w: 1.3 }) + Cir(63.8, 78.5, 1.1, { fill: INK, 'data-r': 'flat' }) + Cir(68.2, 78.5, 1.1, { fill: INK, 'data-r': 'flat' });
      s += part(ellD(88, 64, 3.6, 3.6), '#FFD45C', { w: 1.2 });
      s += shade(`${rr(39, 45, 72, 53, 9)}${rr(43, 48.5, 64, 46, 8)}`, '#1E2A50', 0.22, { 'fill-rule': 'evenodd' });
      s += glints(rectPts(41, 47, 68, 49), { at: 0.12, op: 0.4 });
      // perillas y parlante
      [52, 70].forEach((y) => { s += part(ellD(130, y, 6, 6), C.top, { w: 1.5 }) + line(`M130 ${y}L${y === 52 ? 133.5 : 126.5} ${y - 3.5}`, INK, 1.6) + shine(ellD(128, y - 2.4, 1.6, 1.6), { opacity: 0.8 }); });
      [84, 89, 94].forEach((y) => { s += flat(rr(122, y, 16, 2.4, 1.2), C.deep); });
      // el control, adelante
      s += part('M38 114C38 108 48 107 52 110C56 107 66 108 66 114C66 118 60 119 57 116H43C40 119 38 118 38 114Z', '#4A4552', { w: 1.4 });
      s += flat('M41 112.2h4v1.6h-4ZM42.2 111h1.6v4h-1.6Z', '#C9C2D2') + Cir(60, 111.8, 1.3, { fill: '#FF6F91', 'data-r': 'flat' }) + Cir(63, 113.6, 1.3, { fill: '#7FC8F8', 'data-r': 'flat' });
      return s;
    },
  },
  {
    // Rack de mancuernas de dos pisos (cabezas hexagonales de goma,
    // manijas cromadas), una toalla colgada y la botella de agua.
    id: 'pesas', name: 'Set de pesas', cat: 'ocio', price: 120, w: 152, h: 118, place: 'piso', tags: ['deportista', 'rockero'],
    draw: (p) => {
      let s = floorShadow(76, 114, 72, 5);
      // estructura: parantes, patas y bandejas
      s += rod(16, 108, 16, 24, 7, METAL) + rod(136, 108, 136, 24, 7, METAL);
      s += face(rr(4, 105, 26, 7, 3), RUBBER, { w: 1.6 }) + face(rr(122, 105, 26, 7, 3), RUBBER, { w: 1.6 });
      s += face(rr(10, 21, 12, 5, 2), RUBBER, { w: 1.3 }) + face(rr(130, 21, 12, 5, 2), RUBBER, { w: 1.3 });
      const tray = (y) => face(rr(10, y, 132, 6, 2), tone(METAL, 0.55), { w: 1.6 }) + flat(rr(13, y + 1.2, 126, 1.6, 0.6), tone(METAL, 1.6));
      // arriba tres chicas, abajo dos grandes
      const small = p.accent === '#FFFFFF' ? p.wood : p.accent;
      [[40, p.cloth], [76, small], [112, p.cloth]].forEach(([x, c]) => { s += dumbbell(x, 52, 16, 7, 14, c); });
      s += tray(52);
      [[50, tone(p.cloth, -0.9)], [102, tone(p.cloth, -0.9)]].forEach(([x, c]) => { s += dumbbell(x, 90, 22, 10, 22, c); });
      s += tray(90);
      // toalla colgada del parante derecho: paño de adelante largo, el de
      // atrás asoma, pliegues y dos rayas cerca del borde
      const T = mix(p.cloth, '#FFFFFF', 0.55), TM = mat(T);
      s += part('M140 23C146 25 149 35 149.5 47Q147 49.6 144.4 47.8Q142 49.6 139.6 47.4Z', TM.side, { w: 1.5 });
      s += part('M131 21Q136 16.6 141 21C142.4 30 144.2 43 145 60Q141.4 62.8 137.4 60.4Q133.6 62.8 129.6 60.4Q126.4 62.6 123 60C125 44 128 30 131 21Z', T, { w: 1.6 });
      s += flat('M124.6 52.4Q134.6 53.8 144.4 52.2L144.6 55.2Q134.6 56.8 124.2 55.4Z', p.cloth === '#F3E6D3' ? '#E9845A' : p.cloth);
      s += folds([130.6, 137.4], 27, 50, T, { op: 0.45 });
      s += flat('M132.4 22.4Q136 19.6 139.8 22.4L139.4 24.8Q136 22.8 132.8 24.8Z', TM.hi);
      // botella de agua
      s += contact(146, 112, 6);
      s += face(rr(140, 90, 12, 22, 4), '#BFE5F5', { w: 1.5 });
      s += flat(rr(141, 99, 10, 12, 3), '#8FCDEB');
      s += flat(rr(140.5, 95, 11, 6, 0), p.cloth === '#F3E6D3' ? '#E9845A' : p.cloth);
      s += face(rr(142, 85, 8, 6, 2), '#FFFFFF', { w: 1.3 }) + shine(rr(142.5, 101, 2.2, 8, 1), { opacity: 0.7 });
      return s;
    },
  },
  {
    // Acuario sobre su mueble: tapa con luz, agua con la superficie
    // brillante, arena con piedritas, plantas, un cofre del tesoro, dos
    // peces, burbujas y los reflejos del vidrio.
    id: 'pecera', name: 'Pecera', cat: 'ocio', price: 210, w: 140, h: 172, place: 'piso', tags: ['aesthetic', 'hippie', 'dulce'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(70, 168, 64, 5);
      s += face(rr(14, 102, 112, 62, 2.5), W.front);
      s += face(rr(10, 160, 120, 6, 2), W.side, { w: 1.6 });
      s += slab(8, 104, 124, 7, 30, p.wood);
      s += underShadow(14, 104, 112, 4);
      s += inset(19, 110, 49, 46, p.wood, { knob: [62, 133] }) + inset(72, 110, 49, 46, p.wood, { knob: [78, 133] });
      // el tanque: marco de abajo, agua y arena
      s += face(rr(14, 22, 112, 72, 2), '#7CC3E2', { w: 2 });
      s += flat('M15.5 28h109v10h-109Z', '#A6DCF0');
      s += shade('M15.5 66h109v26h-109Z', '#2E6A9A', 0.16);
      s += line('M17 29.5q6 -1.6 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t9 0', '#E4F6FC', 1.4);
      s += flat('M15.5 84Q30 78 46 81T80 80T124.5 79V92.5H15.5Z', '#EBD6A8');
      [[24, 87, '#C98F6A'], [29, 89, '#8A7F96'], [56, 86, '#E57B93'], [61, 88.5, '#C98F6A'], [96, 87, '#8A7F96'], [101, 89, '#F2C14E'], [116, 86.5, '#C98F6A']].forEach(([x, y, c]) => { s += part(ellD(x, y, 3, 2), c, { w: 1 }); });
      // cofre del tesoro entreabierto
      s += part('M92 85V75Q92 72 95 72H113Q116 72 116 75V85Z', '#A0683E', { w: 1.5 });
      s += flat('M92.8 77.4h22.4v2.6h-22.4Z', '#E8B84A') + flat('M96 73h2.6v11.4h-2.6ZM109.4 73h2.6v11.4h-2.6Z', '#E8B84A', { opacity: 0.9 });
      s += flat('M93 71.4h22v2h-22Z', '#FFE07A');
      s += part('M90.6 71.6Q90.6 62.4 104 61.4Q117.4 62.4 117.4 71.6Z', '#B97A48', { w: 1.5 });
      s += flat('M95 67Q96 64 101 63.2', '#D49A66') + face(rr(102, 76, 4, 5, 1), '#FFD45C', { w: 1 });
      // plantas
      s += part('M27 84C22 70 30 60 25 44C34 56 32 70 33 84Z', '#4E9E6E', { w: 1.4 });
      s += part('M33 84C33 70 42 62 40 50C48 62 42 74 40 84Z', '#79C08A', { w: 1.4 });
      s += part('M70 84C68 76 72 70 76 68C76 74 74 80 76 84Z', '#5FAE7C', { w: 1.2 }) + part('M76 84C77 78 82 74 86 74C84 78 80 81 80 84Z', '#8FD09A', { w: 1.2 });
      // peces
      const fish = (x, y, c, k) => part(`M${x} ${y}c${8 * k} -7 ${19 * k} -6 ${23 * k} 0c${-4 * k} 6 ${-15 * k} 7 ${-23 * k} 0Z`, c, { w: 1.4 })
        + part(`M${x + 1 * k} ${y}l${-7 * k} -5.5l${1.5 * k} 5.5l${-1.5 * k} 5.5Z`, tone(c, -0.5), { w: 1.2 })
        + flat(`M${x + 9 * k} ${y - 4.6}l${3 * k} -3l${3 * k} 2.6Z`, tone(c, -0.4))
        + flat(`M${x + 12 * k} ${y - 4}l${-2 * k} 8h${2.6 * k}l${2 * k} -8Z`, '#FFFFFF', { opacity: 0.85 })
        + Cir(x + 18 * k, y - 1, 1.5, { fill: INK, 'data-r': 'flat' });
      s += fish(52, 52, '#F2994A', 1) + fish(100, 46, p.cloth, -1);
      // burbujas del aireador
      s += face(rr(42, 84, 7, 4, 1.5), '#8A8298', { w: 1.1 });
      [[46, 76, 2.6], [44, 65, 3.2], [47, 53, 2.6], [45, 42, 3.4]].forEach(([x, y, r]) => { s += Cir(x, y, r, { fill: '#DFF4FB', stroke: '#FFFFFF', 'stroke-width': 1, 'data-r': 'part' }); });
      // vidrio
      s += glints(rectPts(15.5, 31, 56, 34), { at: 0.18, op: 0.45 });
      s += face(rr(12, 91, 116, 6, 2), '#3A3542', { w: 1.6 });
      // tapa con la luz
      s += face(rrTop(10, 8, 120, 10, 3), W.top);
      s += face(rr(10, 16, 120, 9, 2.5), W.front, { w: 2 });
      s += line('M13 18H127', W.hi, 1.4, { opacity: 0.8 });
      s += flat(rr(30, 24.5, 80, 3, 1.5), '#FFF4C8');
      return s;
    },
  },
  {
    // Torre para jugar: bases y pisos alfombrados (tela mullida, bordes
    // blandos), postes de sisal con su soga, casita con entrada redonda y
    // huellita, cama en la cima y un pompón colgando.
    id: 'rascador', name: 'Torre para jugar', cat: 'ocio', price: 190, w: 126, h: 230, place: 'piso', tags: ['dulce', 'hippie'],
    draw: (p) => {
      const C = mat(p.cloth);
      const SIS = '#D9BE90';
      const sisal = (cx, yb, h) => {
        let d = '';
        for (let y = yb - 3; y > yb - h + 2; y -= 3.6) d += `M${cx - 7} ${f1(y)}Q${cx} ${f1(y + 2.4)} ${cx + 7} ${f1(y)}`;
        return face(rr(cx - 7, yb - h, 14, h, 1), SIS, { w: 1.7 }) + line(d, tone(SIS, -0.9), 1.2, { opacity: 0.6 }) + flat(rr(cx - 5, yb - h + 2, 2, h - 4, 1), tone(SIS, 0.8));
      };
      const pad = (x, y, w, h, d) => {
        let q = face(rrTop(x, y - h - d * DEPTH, w, d * DEPTH + 3, 6), C.top);
        q += face(rr(x, y - h, w, h, Math.min(5, h / 2)), C.front);
        q += line(`M${x + 4} ${y - h + 2}H${x + w - 4}`, C.hi, 1.6, { opacity: 0.7 });
        q += flat(`M${x + 8} ${y - h - d * DEPTH * 0.55}h3v1.6h-3ZM${x + w * 0.45} ${y - h - d * DEPTH * 0.35}h3v1.6h-3ZM${x + w - 14} ${y - h - d * DEPTH * 0.6}h3v1.6h-3Z`, C.side, { opacity: 0.5 });
        return q;
      };
      let s = floorShadow(63, 226, 60, 6);
      s += pad(6, 226, 114, 11, 40);
      s += sisal(98, 205, 84);
      // casita con entrada redonda (adentro, su piso más claro) y una huellita
      s += pad(12, 200, 60, 46, 34);
      s += face(ellD(40, 178, 13, 13), mix(tone(p.cloth, -1.8), '#2A1C2A', 0.55), { w: 1.7 });
      s += flat('M29.5 183Q40 192 50.5 183Q48.6 189.6 40 190.4Q31.4 189.6 29.5 183Z', mix(tone(p.cloth, -0.9), '#2A1C2A', 0.25));
      s += shade('M28 176A12 12 0 0 1 46 166.4A13 13 0 0 0 30.4 180Z', '#000000', 0.25);
      const paw = (x, y) => flat(`${ellD(x, y + 2, 3.2, 2.6)}${ellD(x - 3.6, y - 2, 1.4, 1.6)}${ellD(x - 1.2, y - 3.6, 1.4, 1.6)}${ellD(x + 1.2, y - 3.6, 1.4, 1.6)}${ellD(x + 3.6, y - 2, 1.4, 1.6)}`, C.side, { opacity: 0.85 });
      s += paw(62, 170);
      s += pad(68, 125, 52, 9, 30);
      s += sisal(40, 136, 60);
      // la cima con su camita
      s += pad(14, 82, 60, 9, 34);
      s += face(ellD(44, 62, 26, 10), C.side, { w: 1.8 });
      s += face('M18 62A26 10 0 0 0 70 62V66A26 10 0 0 1 18 66Z', C.front, { w: 1.6 });
      s += face(ellD(44, 62, 19, 6.5), mix(p.cloth, '#FFFFFF', 0.45), { w: 1.5 });
      s += line('M30 60Q44 56 58 60', tone(mix(p.cloth, '#FFFFFF', 0.45), -0.6), 1.3, { opacity: 0.6 });
      // pompón colgando de un hilo
      s += line('M112 125V150', '#8C8592', 1.3);
      const toy = p.accent === '#FFFFFF' ? '#F2C14E' : p.accent;
      s += part('M112 150l2.4 1.6l2.8 -0.6l0.4 2.8l2.2 1.8l-1.6 2.4l0.6 2.8l-2.8 0.4l-1.8 2.2l-2.2 -1.8l-2.8 0.6l-0.4 -2.8l-2.4 -1.6l1.6 -2.4l-0.6 -2.8l2.8 -0.4Z', toy, { w: 1.4 });
      s += flat(ellD(110.6, 154, 2, 1.6), tone(toy, 1));
      return s;
    },
  },
  {
    // Espejo de pie (de vestidor): postes torneados con remate de bola,
    // marco ovalado con su bisel, vidrio con reflejos, pivotes de bronce y
    // un corazón de tela arriba.
    id: 'espejo', name: 'Espejo de pie', cat: 'ocio', price: 120, w: 102, h: 188, place: 'piso', tags: ['princesa', 'elegante', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(51, 184, 46, 5);
      // postes torneados y travesaño
      [19, 83].forEach((x) => {
        s += face(rr(x - 4, 34, 8, 146, 3), W.front, { w: 1.8 });
        s += grain(x - 2, 44, 4, 128, W.front, { vertical: true, n: 1, amp: 0.5 });
        s += face(rr(x - 5.5, 60, 11, 6, 2.5), W.top, { w: 1.5 }) + face(rr(x - 5.5, 150, 11, 6, 2.5), W.top, { w: 1.5 });
        s += part(ellD(x, 29, 6, 6), W.top, { w: 1.6 }) + shine(ellD(x - 2, 27, 2, 2), { opacity: 0.8 });
        s += face(rr(x - 3, 34, 6, 3, 1), W.side, { w: 1.2 });
      });
      s += face(rr(20, 166, 62, 6, 2), W.side, { w: 1.6 });
      s += woodBox(4, 184, 32, 8, 24, p.wood, { r: 3 }) + woodBox(66, 184, 32, 8, 24, p.wood, { r: 3 });
      // pivotes
      s += face(rr(22, 95, 8, 6, 1.5), BRASS, { w: 1.3 }) + face(rr(72, 95, 8, 6, 1.5), BRASS, { w: 1.3 });
      // marco con bisel y vidrio
      s += face(ellD(51, 98, 31, 56), W.front);
      s += face(ellD(51, 98, 27, 51.5), W.top, { w: 1.6 });
      s += face(ellD(51, 98, 23.5, 47.5), '#CFE5F4', { w: 1.6 });
      s += shade(`${ellD(51, 98, 23.5, 47.5)}${ellD(53, 96, 21, 44)}`, '#6E8FB4', 0.25, { 'fill-rule': 'evenodd' });
      s += glints(ellPts(51, 98, 23.5, 47.5), { at: 0.26, op: 0.6 });
      s += knob(26, 98, 3.2) + knob(76, 98, 3.2);
      // corazón de tela, arriba
      s += part('M51 46C44 40 41 35 45 32C48 29.6 51 32 51 33.4C51 32 54 29.6 57 32C61 35 58 40 51 46Z', p.cloth, { w: 1.5 });
      s += shine(ellD(47, 34.6, 1.4, 1.2), { opacity: 0.8 });
      return s;
    },
  },
  {
    // Lámpara de pie encendida: base pesada, varilla con su anillo,
    // pantalla de tela plisada (se ve su boca de arriba, iluminada por
    // dentro), ribetes, cadenita y un charco de luz en el piso.
    id: 'lampara', name: 'Lámpara de pie', cat: 'luces', price: 110, w: 78, h: 218, place: 'piso', tags: ['aesthetic', 'elegante', 'dulce'],
    draw: (p) => {
      const W = mat(p.wood);
      const sh = mix(p.cloth, '#FFF3D6', 0.18), S = mat(sh);
      const trim = p.accent === '#FFFFFF' ? tone(p.cloth, -0.6) : p.accent;
      let s = floorShadow(39, 213, 26, 4);
      s += halo(39, 209, 32, 8, WARM, 0.9);
      s += halo(39, 50, 38, 40, WARM, 1.35);
      // base y varilla
      s += face('M21 207V211A18 7.5 0 0 0 57 211V207Z', W.side, { w: 1.7 });
      s += face(ellD(39, 207, 18, 7.5), W.top, { w: 1.7 });
      s += line('M26 204.6Q32 201.8 39 201.6', W.hi, 1.5, { opacity: 0.8 });
      s += face(rr(35.5, 68, 7, 140, 2.5), W.front, { w: 1.6 });
      s += flat(rr(36.8, 72, 1.8, 130, 0.9), W.hi);
      s += face(rr(33.5, 136, 11, 5, 2), W.top, { w: 1.4 });
      s += line('M48 66V84', '#8C8592', 1.2) + knob(48, 86, 2, BRASS);
      // pantalla: boca de arriba (adentro, la luz), frente plisado y ribetes
      const Ttop = 24, Tbot = 62;
      s += face(`M23 ${Ttop}L14 ${Tbot}A25 12.5 0 0 0 64 ${Tbot}L55 ${Ttop}Z`, S.front);
      const pleat = (t) => { const k = Math.sqrt(1 - t * t); return `M${f1(39 + 16 * t)} ${f1(Ttop + 8 * k)}L${f1(39 + 25 * t)} ${f1(Tbot + 12.5 * k)}`; };
      s += line([-0.8, -0.5, -0.2, 0.15, 0.45, 0.75].map(pleat).join(''), S.side, 1.3, { opacity: 0.55 });
      s += shade(`M47 ${Ttop + 7}L52 ${Tbot + 11}A25 12.5 0 0 0 64 ${Tbot}L55 ${Ttop}Q53 ${Ttop + 5} 47 ${Ttop + 7}Z`, S.deep, 0.22);
      s += flat(`M26 ${Ttop + 6.5}L19 ${Tbot + 6}L22.5 ${Tbot + 8.5}L29.5 ${Ttop + 7.5}Z`, S.hi, { opacity: 0.8 });
      s += shade(`M15.6 ${Tbot - 7}L14 ${Tbot}A25 12.5 0 0 0 64 ${Tbot}L62.4 ${Tbot - 7}A23.4 11.7 0 0 1 15.6 ${Tbot - 7}Z`, '#FFF6D8', 0.35);
      s += part(`M14 ${Tbot}A25 12.5 0 0 0 64 ${Tbot}L64 ${Tbot - 3.4}A25 12.5 0 0 1 14 ${Tbot - 3.4}Z`, trim, { w: 1.4 });
      s += face(ellD(39, Ttop, 16, 8), mix(sh, '#FFF0C0', 0.55), { w: 1.6 });
      s += flat(`M23.4 ${Ttop + 1}A15.6 7.6 0 0 1 54.6 ${Ttop + 1}A15.6 4.6 0 0 0 23.4 ${Ttop + 1}Z`, tone(sh, -0.5), { opacity: 0.7 });
      s += line(`M31 ${Ttop + 2}Q39 ${Ttop - 3} 47 ${Ttop + 2}`, BRASS, 1.3);
      s += part(ellD(39, Ttop + 2.2, 6.5, 4), '#FFF8E2', { w: 1.2 }) + shine(ellD(38, Ttop + 1.4, 3.4, 1.8), { opacity: 1 });
      s += part(`M23 ${Ttop}A16 8 0 0 0 55 ${Ttop}L55 ${Ttop + 3}A16 8 0 0 1 23 ${Ttop + 3}Z`, trim, { w: 1.3 });
      return s;
    },
  },
  {
    // Lámpara de arco: base de mármol, arco de metal con su brillo, cúpula
    // de tela con el bombillo asomando abajo y la luz que cae al piso.
    id: 'lamparaArco', name: 'Lámpara de arco', cat: 'luces', price: 150, w: 156, h: 222, place: 'piso', tags: ['elegante', 'aesthetic'],
    draw: (p) => {
      const MARBLE = '#EFEAE6';
      const C = mat(p.cloth);
      let s = floorShadow(31, 218, 26, 4);
      s += halo(122, 213, 30, 8, WARM, 0.9);
      s += halo(122, 94, 34, 34, WARM, 1.35);
      // base de mármol con vetas
      s += face(rrTop(14, 180, 34, 13, 3), tone(MARBLE, 0.4));
      s += face(rr(14, 192, 34, 24, 2.5), MARBLE);
      s += line('M17 197q6 2 9 7t8 6M30 194q3 4 9 5M38 206q2 3 7 4', '#B4AAB6', 1.2, { opacity: 0.75, 'data-skip': 'neon' });
      s += line('M20 184q8 -2 14 1t10 -1', '#B4AAB6', 1.1, { opacity: 0.6, 'data-skip': 'neon' });
      s += line('M17 194.2H45', '#FFFFFF', 1.5, { opacity: 0.8 });
      // arco de metal (la luz pega del lado de arriba)
      const arc = 'M31 186C27 120 40 42 92 28C116 22 124 40 123 60';
      s += tube(arc, 7, p.wood);
      s += G({ transform: 'translate(-1.1 -1)' }, line('M30.6 178C27 120 40 42 92 28C110 23.6 118 32 121 44', tone(p.wood, 1.4), 1.5));
      s += face(rr(26.5, 176, 9, 6, 2), tone(p.wood, -0.4), { w: 1.4 });
      // cúpula, bombillo y su luz
      s += part(ellD(122, 94, 7, 7), '#FFF6D6', { w: 1.3 }) + shine(ellD(120.6, 92.6, 3.6, 3.6), { opacity: 1 });
      s += face('M100 84C100 68 110 60 122 60C134 60 144 68 144 84Z', C.front);
      s += shade('M131 62C138 66 144 74 144 84H136C136 74 134 68 131 62Z', C.deep, 0.25);
      s += shine('M106 76C106 70 110 65 116 63.4C112 67 110 71 110 77Z', { opacity: 0.55 });
      s += part('M99 84A23 6 0 0 0 145 84V81A23 5 0 0 1 99 81Z', tone(p.cloth, -0.35), { w: 1.4 });
      s += flat('M104 86.4A20 4.4 0 0 0 140 86.4A20 3 0 0 1 104 86.4Z', '#FFF0C0', { opacity: 0.9 });
      s += face(rr(118.5, 55, 7, 7, 2), tone(p.wood, -0.3), { w: 1.4 });
      return s;
    },
  },
];
