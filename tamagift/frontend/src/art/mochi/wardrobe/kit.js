// Herramientas para dibujar ropa y accesorios sobre la mochi.
//
// Todo se ancla a la geometría del cuerpo (art/mochi/body.js): la línea
// del cuello, la coronilla, la altura de los ojos, el ancho a cada altura.
// Así una prenda queda bien puesta en los cuatro anchos y también cuando
// la mochi está redondita.

import { G, P, Ell, Cir, E } from '../../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../../color.js';

export { G, P, Ell, Cir, E };
export const OUT = '#3A2A3E';
export const GOLD = '#FFD166', GOLD_D = '#B0782A', SILVER = '#DCE1EA', SILVER_D = '#7C8496', PEARL = '#FBF5EC', PEARL_D = '#B8A890';
export const BOTTOM = 182;

export const shade = (c, k) => hex(ramp(parseColor(c), k));
export const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
export const isPale = (c) => lum(parseColor(c)) > 0.8;
export const isDarkC = (c) => lum(parseColor(c)) < 0.22;
export const f = (n) => (+n).toFixed(1);
export const T = (x, y, rot = 0, s = 1) => `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${(+s).toFixed(3)})`;

// Roles (ver art/kit.js)
export const part = (d, fill, o = {}) => P(d, { fill, stroke: OUT, 'stroke-width': 2.3, 'stroke-linejoin': 'round', 'data-r': 'part', ...o });
export const flat = (d, fill, o = {}) => P(d, { fill, 'data-r': 'flat', ...o });
export const line = (d, stroke, w = 1.8, o = {}) => P(d, { fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line', ...o });
export const shine = (x, y, r, o = {}) => Cir(x, y, r, { fill: '#FFFFFF', 'data-r': 'shine', ...o });
export const tone = (d, fill, op) => P(d, { fill, opacity: op, 'data-r': 'tone' });
export const dot = (x, y, r, fill, o = {}) => Cir(x, y, r, { fill, 'data-r': 'flat', ...o });
export const ball = (x, y, r, fill, o = {}) => Cir(x, y, r, { fill, stroke: OUT, 'stroke-width': 1.8, 'data-r': 'part', ...o });
export const disc = (x, y, rx, ry, fill, o = {}) => P(`M${f(x - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x + rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x - rx)} ${f(y)}Z`, { fill, stroke: OUT, 'stroke-width': 2.3, 'data-r': 'part', ...o });
export const ellD = (x, y, rx, ry) => `M${f(x - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x + rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x - rx)} ${f(y)}Z`;

export const heartD = (x, y, s) => `M${f(x)} ${f(y + s * 0.85)} C${f(x - s * 1.1)} ${f(y + s * 0.1)} ${f(x - s * 1.05)} ${f(y - s * 0.95)} ${f(x)} ${f(y - s * 0.35)} C${f(x + s * 1.05)} ${f(y - s * 0.95)} ${f(x + s * 1.1)} ${f(y + s * 0.1)} ${f(x)} ${f(y + s * 0.85)}Z`;
export function starD(x, y, r, inner = 0.48) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)}`;
  }
  return `${d}Z`;
}
export const sparkleD = (x, y, r) => `M${f(x)} ${f(y - r)} Q${f(x + r * 0.16)} ${f(y - r * 0.16)} ${f(x + r)} ${f(y)} Q${f(x + r * 0.16)} ${f(y + r * 0.16)} ${f(x)} ${f(y + r)} Q${f(x - r * 0.16)} ${f(y + r * 0.16)} ${f(x - r)} ${f(y)} Q${f(x - r * 0.16)} ${f(y - r * 0.16)} ${f(x)} ${f(y - r)}Z`;
export const moonD = (x, y, r) => `M${f(x + r * 0.25)} ${f(y - r)} A${f(r)} ${f(r)} 0 1 0 ${f(x + r * 0.25)} ${f(y + r)} A${f(r * 0.78)} ${f(r * 0.78)} 0 1 1 ${f(x + r * 0.25)} ${f(y - r)}Z`;

let seq = 0;
export const nid = (p) => `${p}${++seq}`;

// Moño de cinta (centro en 0,0; `s` escala).
export function bow(x, y, rot, s, col, tails = true) {
  const o = shade(col, -2.2);
  return G({ transform: T(x, y, rot, s) },
    (tails ? part('M-3 2 L-9 17 L-3.5 13.5 L0 18 L1 3Z M2 2 L9 16 L3.5 13.5 L1 18Z', shade(col, -0.5), { stroke: o }) : '')
    + part('M0 0 C-6 -10 -20 -11 -20 -1 C-20 9 -7 8 0 0Z M0 0 C6 -10 20 -11 20 -1 C20 9 7 8 0 0Z', col, { stroke: o })
    + line('M-15 -3 C-12 -6 -8 -5 -6 -2 M15 -3 C12 -6 8 -5 6 -2', '#FFFFFF', 1.6, { opacity: 0.65 })
    + Ell(0, 0, 4.6, 5.2, { fill: shade(col, 0.4), stroke: o, 'stroke-width': 2.2, 'data-r': 'part' }));
}

export function flower(x, y, r, col, rot = 0, center = '#FFE070') {
  let s = '';
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 + rot) * Math.PI) / 180;
    s += Cir(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.55, { fill: col, stroke: shade(col, -2.2), 'stroke-width': 1.1, 'data-r': 'part' });
  }
  return s + Cir(x, y, r * 0.36, { fill: center, stroke: shade(col, -2.2), 'stroke-width': 1, 'data-r': 'part' });
}

// Banda que sigue el borde de arriba de la cabeza (diademas, cintillos).
export function headband(g, hw, dy0, dy1, col, n = 14) {
  const pts = (dy) => { const out = []; for (let i = 0; i <= n; i++) { const x = 100 - hw + (2 * hw * i) / n; out.push([x, g.topAt(x) + dy]); } return out; };
  const a = pts(dy0), b = pts(dy1).reverse();
  return part(`M${a.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} L${b.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}Z`, col);
}

// Lo que se pone sobre la cabeza: posición y giro sobre el borde en x.
export const onTop = (g, xFrac, sink = 0) => {
  const x = 100 + g.w * xFrac;
  return { x, y: g.topAt(x) + sink, rot: g.tiltAt(x) };
};

// ── Ropa ─────────────────────────────────────────────────────────
// Una prenda cubre el cuerpo desde el escote para abajo (recortada a la
// silueta). El escote baja más en el centro (debajo de la boca) que a
// los costados, como un cuello redondo.
export function neckLine(g, { side = 6, center = 25, v = false } = {}) {
  const fy = g.face.y;
  const ys = fy + side, yc = fy + center;
  const L = g.l - 10, R = g.r + 10;
  return v
    ? { d: `M${f(L)} ${f(ys)} L100 ${f(yc + 6)} L${f(R)} ${f(ys)}`, ys, yc }
    : { d: `M${f(L)} ${f(ys)} Q100 ${f(yc + (yc - ys) * 0.95)} ${f(R)} ${f(ys)}`, ys, yc };
}

// Prenda base: relleno desde el escote, recortado al cuerpo, con el
// contorno del cuerpo redibujado encima (la prenda no lo tapa).
export function garment(g, fill, { side = 6, center = 25, v = false, extra = '' } = {}) {
  const id = nid('gw');
  const nl = neckLine(g, { side, center, v });
  const region = `${nl.d} L${f(g.r + 10)} 196 L${f(g.l - 10)} 196Z`;
  return {
    region,
    nl,
    svg: E('clipPath', { id }, P(g.path))
      + G({ 'clip-path': `url(#${id})` },
        part(region, fill)
        + extra
        + P(g.path, { fill: 'none', stroke: OUT, 'stroke-width': 2.8, 'data-r': 'line' })),
  };
}

// Recorta algo a la silueta del cuerpo.
export function clipBody(g, inner) {
  const id = nid('cb');
  return E('clipPath', { id }, P(g.path)) + G({ 'clip-path': `url(#${id})` }, inner);
}

// Altura y ancho del cuerpo a la altura y.
export const halfAt = (g, y) => g.chordAt(y) / 2;
