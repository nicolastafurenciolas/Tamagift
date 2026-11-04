// Accesorios de la mochi. Ninguno tiene coordenadas fijas: todos se
// anclan a la geometría del cuerpo (coronilla, borde de arriba, línea
// del collar, posición de los ojos), así un gorro queda sobre la cabeza
// y un collar abraza el cuerpo en los cuatro anchos.

import { G, P, Ell, Cir, E, R, mirrorX } from '../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../color.js';
import * as K from './wardrobe/kit.js';
import { dome } from './wardrobe/head.js';

const OUT = '#3A2A3E';
const GOLD = '#FFD166', GOLD_D = '#B0782A', SILVER = '#DCE1EA', SILVER_D = '#7C8496';
const shade = (c, k) => hex(ramp(parseColor(c), k));
const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
const part = (d, fill, o = {}) => P(d, { fill, stroke: OUT, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'data-r': 'part', ...o });
const flat = (d, fill, o = {}) => P(d, { fill, 'data-r': 'flat', ...o });
const line = (d, stroke, w = 2, o = {}) => P(d, { fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line', ...o });
const shine = (x, y, r) => Cir(x, y, r, { fill: '#FFFFFF', 'data-r': 'shine' });
const T = (x, y, rot = 0, s = 1) => `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`;
const pale = (c) => lum(parseColor(c)) > 0.8;

export const HEAD_ACCESSORIES = [
  { id: 'ninguno', label: 'Nada' },
  { id: 'mono', label: 'Moñito' },
  { id: 'fiesta', label: 'Gorrito de fiesta' },
  { id: 'gorro', label: 'Gorro de lana' },
  { id: 'corona', label: 'Corona' },
  { id: 'flores', label: 'Corona de flores' },
  { id: 'tiara', label: 'Tiara' },
  { id: 'diadema', label: 'Diadema' },
  { id: 'sombrero', label: 'Sombrero de paja' },
  { id: 'gorra', label: 'Gorra' },
  { id: 'boina', label: 'Boina' },
  { id: 'bandana', label: 'Bandana' },
  { id: 'audifonos', label: 'Audífonos' },
  { id: 'bruja', label: 'Sombrero de bruja' },
  { id: 'vaquero', label: 'Sombrero vaquero' },
  { id: 'aureola', label: 'Aureola' },
  { id: 'cachos', label: 'Cachitos' },
  { id: 'cuernos', label: 'Cuernos' },
  { id: 'monoCalavera', label: 'Moño calavera' },
  { id: 'cresta', label: 'Cresta punk' },
  { id: 'flequillo', label: 'Mechón' },
];

export const NECK_ACCESSORIES = [
  { id: 'ninguno', label: 'Nada' },
  { id: 'collar', label: 'Collar con cascabel' },
  { id: 'pajarita', label: 'Corbatín' },
  { id: 'bufanda', label: 'Bufanda' },
  { id: 'panuelo', label: 'Pañuelo' },
  { id: 'medallon', label: 'Medallón' },
  { id: 'lei', label: 'Collar de flores' },
  { id: 'corbata', label: 'Corbata' },
  { id: 'medalla', label: 'Medalla' },
  { id: 'capa', label: 'Capa' },
  { id: 'choker', label: 'Choker' },
  { id: 'cadena', label: 'Cadena' },
  { id: 'pinchos', label: 'Collar de pinchos' },
];

export const EXTRA_ACCESSORIES = [
  { id: 'ninguno', label: 'Nada' },
  { id: 'lentes', label: 'Lentes' },
  { id: 'gafasol', label: 'Gafas de sol' },
  { id: 'antifaz', label: 'Antifaz' },
  { id: 'pecas', label: 'Pecas' },
  { id: 'lunar', label: 'Lunar' },
  { id: 'curita', label: 'Curita' },
  { id: 'brillos', label: 'Brillitos' },
  { id: 'parche', label: 'Parche' },
  { id: 'piercings', label: 'Piercings' },
  { id: 'lagrima', label: 'Lágrima tatuada' },
  { id: 'eyeblack', label: 'Pintura deportiva' },
  { id: 'corpse', label: 'Maquillaje gótico' },
];

let aid = 0;
const nid = (p) => `${p}${++aid}`;

function bow(x, y, rot, s, col) {
  const o = shade(col, -2.2);
  return G({ transform: T(x, y, rot, s) },
    part('M-3 2 L-8 15 L-3 12 L0 16 L1 3Z M2 2 L8 14 L3 12 L1 16Z', shade(col, -0.5), { stroke: o })
    + part('M0 0 C-6 -10 -20 -11 -20 -1 C-20 9 -7 8 0 0Z M0 0 C6 -10 20 -11 20 -1 C20 9 7 8 0 0Z', col, { stroke: o })
    + line('M-15 -3 C-12 -6 -8 -5 -6 -2', '#FFFFFF', 1.8, { opacity: 0.7 })
    + Ell(0, 0, 4.6, 5.2, { fill: shade(col, 0.5), stroke: o, 'stroke-width': 2.2, 'data-r': 'part' }));
}

function flower(x, y, r, col, i) {
  let s = '';
  for (let k = 0; k < 5; k++) {
    const a = (k * 72 + i * 23) * Math.PI / 180;
    s += Cir(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.55, { fill: col, stroke: shade(col, -2.2), 'stroke-width': 1.1, 'data-r': 'part' });
  }
  return s + Cir(x, y, r * 0.36, { fill: '#FFF4B8', stroke: shade(col, -2.2), 'stroke-width': 1, 'data-r': 'part' });
}
const FLOWER_COLS = ['#FF8FAB', '#FFD166', '#B8A1FF', '#8EE3C8', '#FFB38A'];

// ── CABEZA ───────────────────────────────────────────────────────
// Grandes y regordetes (se leen a 60 px): ala en perspectiva con su
// canto, copa con volumen y cinta, metal con brillo.
const domeShade = (d, col) => K.clipTo(d.d, K.tone(`M${100 + d.bw * 0.16} ${d.top - 40} C${d.x2 + 12} ${d.top - 30} ${d.x2 + 6} ${d.ys} ${d.x2 - 2} ${d.ys + 6} L${d.x2 + 12} ${d.ys + 6} L${d.x2 + 12} ${d.top - 40}Z`, '#2A1C30', 0.16))
  + line(`M${d.x1 + d.bw * 0.12} ${d.ys - 12} C${d.x1 + d.bw * 0.1} ${d.top - 8} ${100 - d.bw * 0.24} ${d.top - 18} ${100 - d.bw * 0.08} ${d.top - 19}`, K.lightOf(col, 0.9), 2, { opacity: 0.7 });
export function head(id, g, c) {
  const top = g.top;
  const sc = Math.max(0.8, Math.min(1.12, g.w / 144));
  switch (id) {
    case 'mono': {
      const p = K.onTop(g, -0.21, 3);
      return K.bow(p.x, p.y, p.rot * 0.7 - 6, 1.25 * sc, c.bowColor);
    }
    case 'monoCalavera': {
      const p = K.onTop(g, -0.21, 3);
      const ink = '#2A2230';
      return G({ transform: T(p.x, p.y, p.rot * 0.7 - 6, 1.25 * sc) },
        part('M-3 2 L-10 16 L-4.5 13.5 L-1 18 L1 3Z M2 2 L10 15.5 L4.5 13.5 L1.5 18Z', '#3A3044')
        + part('M0 0 C-6 -11 -22 -12 -22 -1 C-22 10 -7 8 0 0Z M0 0 C6 -11 22 -12 22 -1 C22 10 7 8 0 0Z', ink)
        + flat('M-3 0 C-6 -5 -12 -5 -13 -1 C-10 1 -6 2 -3 0Z M3 0 C6 -5 12 -5 13 -1 C10 1 6 2 3 0Z', '#4A3E58')
        + line('M-17 -4 C-13 -8 -9 -7 -7 -4 M17 -4 C13 -8 9 -7 7 -4', '#8A7A9E', 1.6)
        + part('M-6 2.5 C-7 -7 7 -7 6 2.5 L4 3.5 L4 7 L-4 7 L-4 3.5Z', '#F4F0EA', { 'stroke-width': 1.7 })
        + Cir(-2.4, -0.6, 1.7, { fill: ink, 'data-r': 'flat' }) + Cir(2.4, -0.6, 1.7, { fill: ink, 'data-r': 'flat' })
        + line('M-1.6 5 V7 M0 5 V7 M1.6 5 V7', ink, 0.9));
    }
    case 'fiesta': {
      const col = c.hatColor || '#7FC8F8', st = c.hatAlt && !pale(c.hatAlt) ? c.hatAlt : '#FFD166';
      const cone = 'M-18 0 L0 -46 L18 0 Q0 6 -18 0Z';
      return G({ transform: T(106, top + 5, 13, 1.08 * sc) },
        part(cone, col)
        + K.clipTo(cone, flat('M-14 -10 L-8 -26 Q0 -23 8 -26 L14 -10 Q0 -6 -14 -10Z M-5 -34 L-3 -39 Q0 -38 3 -39 L5 -34 Q0 -32.5 -5 -34Z', st)
          + K.tone('M3 -46 L22 2 L4 4Z', '#2A1C30', 0.16)
          + [[-9, -4], [7, -5], [-2, -18], [4, -30]].map(([x, y]) => K.dot(x, y, 1.7, '#FFFFFF', { opacity: 0.9 })).join(''))
        + line('M-11 -6 L-4 -32', K.lightOf(col), 1.6, { opacity: 0.7 })
        + part('M-18.5 0 Q0 6 18.5 0 L18 4 Q0 10 -18 4Z', shade(st, -0.3), { 'stroke-width': 1.8 })
        + K.ball(0, -47, 6.8, '#FF8FAB', { stroke: '#B04A6A', 'stroke-width': 2 }) + line('M-3 -49 l2 -2.4 M1 -51 l2 2', '#FFFFFF', 1.2, { opacity: 0.8 }) + shine(-2.4, -49.5, 1.6));
    }
    case 'gorro': {
      const col = c.hatColor, band = shade(col, -0.6);
      const d = dome(g, 0.82, 25);
      // tejido: columnas de puntos en V y la vuelta doblada con elástico
      let knit = '';
      for (let i = -4; i <= 4; i++) { const x = 100 + i * d.bw * 0.1; for (let y = d.top - 18 + Math.abs(i) * 2; y < d.ys - 9; y += 4.2) knit += `M${x - 1.6} ${y} L${x} ${y + 2} L${x + 1.6} ${y}`; }
      let ribs = '';
      for (let i = 1; i < 14; i++) { const t = i / 14; const x = d.x1 + (d.x2 - d.x1) * t; const yb = d.ys + 3 + (d.yc + 2 - d.ys - 3) * (1 - Math.pow(2 * t - 1, 2)); ribs += `M${x} ${yb - 2} l0 -8`; }
      return part(d.d, col) + K.clipTo(d.d, K.skipPx(line(knit, K.seamOf(col, 0.6), 1, { opacity: 0.55 }))) + domeShade(d, col)
        + part(d.brim, band) + line(ribs, K.seamOf(band, 0.8), 1.3, { opacity: 0.85 })
        + K.ball(100, top - 27, 9, c.hatAlt, { 'stroke-width': 2.3 }) + K.tone(K.ellD(102, top - 24, 6, 4.5), '#2A1C30', 0.14)
        + line(`M96 ${top - 31} q2 -2 4 -1 M99 ${top - 34} q3 0 4 2`, K.seamOf(c.hatAlt, 0.4), 1.1, { opacity: 0.8 }) + shine(96.5, top - 30, 2);
    }
    case 'corona': {
      const s = 1.42 * sc;
      // corona en 3/4: el interior oscuro detrás, las puntas, el aro con
      // grosor y las piedras engastadas
      const pts = 'M-19 3 L-21 -14 L-13 -5 L-6 -19 L0 -9 L6 -19 L13 -5 L21 -14 L19 3 Q0 8 -19 3Z';
      return G({ transform: T(100, top + 5, -3, s) },
        part('M-19 -1 Q0 -6 19 -1 L19 2 Q0 -3 -19 2Z', '#9A6A22', { stroke: GOLD_D, 'stroke-width': 1.3 })
        + part(pts, GOLD, { stroke: GOLD_D, 'stroke-width': 1.8 })
        + K.clipTo(pts, K.tone('M6 -22 L24 -16 L22 8 L4 8Z', '#7A4A10', 0.18))
        + part('M-19.5 -2 Q0 3 19.5 -2 L19.5 4 Q0 9 -19.5 4Z', shade(GOLD, -0.35), { stroke: GOLD_D, 'stroke-width': 1.6 })
        + line('M-16 0.4 Q0 5 16 0.4', '#FFF1B8', 1, { opacity: 0.9 })
        + K.ball(0, 1.6, 2.8, '#FF5B8A', { stroke: GOLD_D, 'stroke-width': 1.1 }) + shine(-0.8, 0.8, 0.8)
        + K.ball(-11, 0.6, 2, '#5FC2FF', { stroke: GOLD_D, 'stroke-width': 1 }) + K.ball(11, 0.6, 2, '#5FC2FF', { stroke: GOLD_D, 'stroke-width': 1 })
        + K.ball(-21, -15, 2.4, GOLD, { stroke: GOLD_D, 'stroke-width': 1.1 }) + K.ball(-6, -20, 2.4, GOLD, { stroke: GOLD_D, 'stroke-width': 1.1 }) + K.ball(6, -20, 2.4, GOLD, { stroke: GOLD_D, 'stroke-width': 1.1 }) + K.ball(21, -15, 2.4, GOLD, { stroke: GOLD_D, 'stroke-width': 1.1 })
        + line('M-17 -10 L-15 -4 M-8 -14 L-5 -7', '#FFF6D0', 1.3, { opacity: 0.9 }));
    }
    case 'tiara': {
      const hw = g.w * 0.28, s = 1.25 * sc;
      const arc = (dy) => `M${100 - hw} ${g.topAt(100 - hw) + dy} Q100 ${top - 6 + dy} ${100 + hw} ${g.topAt(100 + hw) + dy}`;
      return line(arc(6), SILVER_D, 5.6) + line(arc(6), SILVER, 3) + line(arc(5.2), '#FFFFFF', 1, { opacity: 0.9 })
        + G({ transform: T(100, top + 3, 0, s) },
          part('M-15 2 L-10 -7 L-6 -1 L0 -15 L6 -1 L10 -7 L15 2 Q0 4 -15 2Z', SILVER, { stroke: SILVER_D, 'stroke-width': 1.6 })
          + K.tone('M0 -15 L16 2 L4 3Z', '#4A5068', 0.16)
          + P('M0 -11.5 L3.8 -6 L0 -0.8 L-3.8 -6Z', { fill: '#C9A3FF', stroke: '#6E4FA8', 'stroke-width': 1.1, 'data-r': 'part' }) + flat('M0 -11 L2.2 -6.4 L0 -6Z', '#E9D8FF') + shine(-1, -7.5, 0.9)
          + K.ball(-10, -6.5, 1.6, '#FBF5EC', { stroke: SILVER_D, 'stroke-width': 0.9 }) + K.ball(10, -6.5, 1.6, '#FBF5EC', { stroke: SILVER_D, 'stroke-width': 0.9 })
          + flat(K.sparkleD(9, -15, 2.4), '#FFFFFF'));
    }
    case 'flores': {
      const n = 7, hw = g.w * 0.36;
      let leaves = '', fl = '';
      for (let i = 0; i < n; i++) {
        const x = 100 - hw + (2 * hw * i) / (n - 1), y = g.topAt(x) + 6;
        const r = 7.8 - Math.abs(i - (n - 1) / 2) * 0.45;
        leaves += P('M0 0 C3 -3 9 -3 12 0 C9 3 3 3 0 0Z', { transform: T(x + 2, y + 2, -25 + i * 9, 1), fill: '#7CC48A', stroke: '#3F7D50', 'stroke-width': 1.2, 'data-r': 'part' });
        fl += K.flower(x, y, r, FLOWER_COLS[i % FLOWER_COLS.length], i * 23, '#FFF4B8');
      }
      return leaves + fl;
    }
    case 'diadema': {
      const col = c.bowColor;
      const p = K.onTop(g, 0.2, 5);
      return K.headband(g, g.w * 0.41, 1, 8.5, col) + K.bow(p.x, p.y, p.rot * 0.7 + 8, 0.8 * sc, col);
    }
    case 'sombrero': {
      const col = '#F2D38A', rib = c.bowColor, straw = '#C9A04F';
      const W = g.w * 0.5;
      let weave = '';
      for (let i = -5; i <= 5; i++) weave += `M${i * W * 0.16} -1 Q${i * W * 0.2} 3 ${i * W * 0.17} 8`;
      return G({ transform: T(100, top + 7, -6, 1) },
        K.brim(0, 1, W, W * 0.21, col, { stroke: '#8A6326', th: 3 })
        + K.skipPx(line(weave, straw, 0.9, { opacity: 0.55 }))
        + line(`M${-W * 0.8} 3 C${-W * 0.6} 8 ${W * 0.6} 8 ${W * 0.8} 3`, straw, 1.3, { opacity: 0.7 })
        + K.crown(0, -1, 48 * sc, 27 * sc, col, { band: rib, bandH: 7, stroke: '#8A6326' })
        + K.skipPx(line('M-16 -12 l3 7 M-6 -20 l2 9 M6 -20 l-1 9 M16 -12 l-3 7', straw, 1, { opacity: 0.6 }))
        + K.flower(18 * sc, -5, 6.4, '#FFFFFF', 12, '#FFD166'));
    }
    case 'gorra': {
      const col = c.hatColor;
      const w2 = g.w * 0.34;
      const crownD = `M${100 - w2} ${top + 10} C${100 - w2} ${top - 17} ${100 + w2} ${top - 17} ${100 + w2} ${top + 10} Q100 ${top + 4} ${100 - w2} ${top + 10}Z`;
      const bill = `M${100 - w2 * 0.92} ${top + 8} Q100 ${top + 2} ${100 + w2 * 0.92} ${top + 8} Q${100 + w2 * 0.95} ${top + 20} 100 ${top + 21} Q${100 - w2 * 0.95} ${top + 20} ${100 - w2 * 0.92} ${top + 8}Z`;
      return part(crownD, col) + K.clipTo(crownD, K.tone(`M${100 + w2 * 0.3} ${top - 20} H${100 + w2 + 4} V${top + 12} H${100 + w2 * 0.5}Z`, '#2A1C30', 0.16))
        + line(`M100 ${top - 11} L100 ${top + 5} M${100 - w2 * 0.55} ${top - 5} Q${100 - w2 * 0.42} ${top + 1} ${100 - w2 * 0.46} ${top + 8} M${100 + w2 * 0.55} ${top - 5} Q${100 + w2 * 0.42} ${top + 1} ${100 + w2 * 0.46} ${top + 8}`, K.seamOf(col), 1.4)
        + line(`M${100 - w2 * 0.8} ${top + 2} C${100 - w2 * 0.8} ${top - 8} ${100 - w2 * 0.4} ${top - 13} ${100 - w2 * 0.15} ${top - 13}`, K.lightOf(col), 1.6, { opacity: 0.7 })
        + flat(K.rr(100 - 7, top - 4, 14, 7, 1.5), c.hatAlt, { opacity: 0.95 })
        + part(bill, shade(col, -0.45)) + K.clipTo(bill, K.tone(`M${100 - w2} ${top + 15} Q100 ${top + 24} ${100 + w2} ${top + 15} V${top + 26} H${100 - w2}Z`, '#2A1C30', 0.22))
        + K.skipPx(K.stitch(`M${100 - w2 * 0.78} ${top + 10} Q100 ${top + 17} ${100 + w2 * 0.78} ${top + 10}`, K.lightOf(col, 0.6), 1))
        + K.ball(100, top - 12, 3, shade(col, -0.5), { 'stroke-width': 1.6 });
    }
    case 'boina': {
      const col = c.beretColor;
      const W = g.w * 0.34;
      const body = `M-${W} 2 C-${W * 1.12} -11 -10 -18 6 -17 C${W} -16 ${W * 1.18} -5 ${W} 4 C${W * 0.66} 10 -${W * 0.66} 10 -${W} 2Z`;
      return G({ transform: T(96, top + 4, -10, 1.08 * sc) },
        part(body, col) + K.clipTo(body, K.tone(`M${W * 0.2} -20 C${W * 1.3} -14 ${W * 1.3} 6 ${W * 0.6} 10 L${W + 8} 12 L${W + 8} -22Z`, '#2A1C30', 0.2))
        + line(`M-${W * 0.86} 3.5 Q0 8 ${W * 0.86} 3.5`, K.seamOf(col), 1.8, { opacity: 0.8 })
        + line(`M-${W * 0.7} -6 C-${W * 0.5} -13 -6 -15 4 -15`, K.lightOf(col), 1.8, { opacity: 0.7 })
        + part('M2 -16 C1 -21 3 -23 5 -22 C6.5 -20 6.5 -18 5.5 -16Z', shade(col, -0.5), { 'stroke-width': 1.6 }));
    }
    case 'bandana': {
      const bw = g.w * 0.76, x1 = 100 - bw / 2, x2 = 100 + bw / 2, col = c.bowColor;
      const ys = g.topAt(x1) + 6;
      const capD = `M${x1} ${ys} C${x1} ${top - 12} ${100 - bw * 0.25} ${top - 16} 100 ${top - 16} C${100 + bw * 0.25} ${top - 16} ${x2} ${top - 12} ${x2} ${ys} Q100 ${top + 8} ${x1} ${ys}Z`;
      const dots = [[-0.28, -8], [-0.08, -14], [0.14, -12], [0.32, -6], [-0.18, 0], [0.06, -2], [0.24, 2]].map(([fx, dy]) => Cir(100 + bw * fx, top + dy + 6, 2.2, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'flat' })).join('');
      return part(`M${x2 + 2} ${ys} L${x2 + 17} ${ys + 3} L${x2 + 12} ${ys + 16} L${x2 + 4} ${ys + 7}Z M${x2 + 2} ${ys - 2} L${x2 + 15} ${ys - 13} L${x2 + 19} ${ys - 2}Z`, shade(col, -0.4))
        + part(capD, col) + K.clipTo(capD, dots + K.tone(`M${100 + bw * 0.2} ${top - 20} C${x2 + 8} ${top - 10} ${x2 + 4} ${ys} ${x2} ${ys + 4} H${x2 + 10} V${top - 20}Z`, '#2A1C30', 0.16))
        + line(`M${x1 + 6} ${ys - 6} C${x1 + 6} ${top - 6} ${100 - bw * 0.25} ${top - 12} ${100 - bw * 0.05} ${top - 12}`, K.lightOf(col), 1.6, { opacity: 0.7 })
        + K.ball(x2 + 3, ys - 1, 5, col, { 'stroke-width': 2 });
    }
    case 'audifonos': {
      const yc = top + Math.min(34, g.height * 0.28);
      const half = g.chordAt(yc) / 2;
      const col = c.hatColor;
      const band = `M${100 - half + 4} ${yc - 4} C${100 - half + 2} ${top - 23} ${100 + half - 2} ${top - 23} ${100 + half - 4} ${yc - 4}`;
      const hl = `M${100 - half + 8} ${yc - 14} C${100 - half + 8} ${top - 14} ${100 - 10} ${top - 18} 100 ${top - 18.5}`;
      const cup = (x) => G({ transform: T(x, yc, -6, 1) },
        part('M-7.5 -14 Q-10 -14 -10 -11 L-10 11 Q-10 14 -7.5 14 L5 14 Q10 14 10 9 L10 -9 Q10 -14 5 -14Z', col)
        + part('M-10 -11 Q-13 -11 -13 -7 L-13 7 Q-13 11 -10 11Z', '#3A3044', { 'stroke-width': 1.6 })
        + flat('M3.5 -10.5 L6.5 -10.5 L6.5 10.5 L3.5 10.5Z', shade(col, -1.2)) + shine(-4.5, -9, 1.8) + line('M-6 -10 L-6 -2', '#FFFFFF', 1.4, { opacity: 0.6 }));
      return line(band, OUT, 7.4) + line(band, shade(col, -0.4), 4) + line(hl, K.lightOf(col), 1.2, { opacity: 0.6 })
        + cup(100 - half + 1) + G({ transform: 'translate(200 0) scale(-1 1)' }, cup(100 - half + 1));
    }
    case 'bruja': {
      const col = '#4E3A70', band = '#FF9F43', W = g.w * 0.46;
      const cone = 'M-20 -1 C-16 -20 -8 -38 6 -52 C10 -56 18 -54 22 -50 C14 -50 10 -44 10 -36 C12 -22 16 -10 20 -1 Q0 4 -20 -1Z';
      return G({ transform: T(100, top + 7, -4, 1) },
        K.brim(0, 0, W, W * 0.2, col, { th: 3 })
        + G({ transform: `scale(${(1.08 * sc).toFixed(3)})` }, part(cone, col)
          + K.clipTo(cone, K.tone('M8 -56 C12 -36 16 -16 24 2 L30 2 L30 -60Z', '#140A28', 0.25))
          + line('M-13 -8 C-9 -22 -3 -36 4 -46', K.lightOf(col, 1.2), 1.6, { opacity: 0.7 })
          + part('M-19.5 -5.5 Q0 -1 19.5 -5.5 L20 -1 Q0 4 -20 -1Z', band, { 'stroke-width': 1.8 })
          + part(K.rr(-5, -7.5, 10, 8, 1.2), GOLD, { stroke: GOLD_D, 'stroke-width': 1.5 }) + flat(K.rr(-2.5, -5, 5, 3, 0.6), col)
          + flat(K.puffStarD(-6, -30, 3.4), GOLD)));
    }
    case 'vaquero': {
      const col = '#B67A45', W = g.w * 0.52, s = 1.25 * sc;
      // ala ancha con los costados levantados y copa con su hendidura
      const brimD = `M${-W} -9 C${-W * 0.92} 2 ${-W * 0.6} 8 0 8 C${W * 0.6} 8 ${W * 0.92} 2 ${W} -9 C${W * 0.82} -1 ${W * 0.5} 0 0 0 C${-W * 0.5} 0 ${-W * 0.82} -1 ${-W} -9Z`;
      const crownD = 'M-19 1 C-21 -14 -18 -26 -10 -28 C-6 -26 -3 -22 0 -22 C3 -22 6 -26 10 -28 C18 -26 21 -14 19 1 Q0 5 -19 1Z';
      return G({ transform: T(100, top + 6, 0, 1) },
        part(brimD, col) + K.tone(`M${-W * 0.9} -4 C${-W * 0.6} 6 ${W * 0.6} 6 ${W * 0.9} -4 L${W * 0.9} -1 C${W * 0.6} 9 ${-W * 0.6} 9 ${-W * 0.9} -1Z`, '#2A1C30', 0.18)
        + line(`M${-W * 0.94} -7 C${-W * 0.8} -2 ${-W * 0.6} 1 ${-W * 0.35} 2`, K.lightOf(col), 1.6, { opacity: 0.8 })
        + G({ transform: `scale(${s.toFixed(3)})` }, part(crownD, col) + K.clipTo(crownD, K.tone('M6 -30 C18 -26 24 -10 20 4 L28 4 L28 -32Z', '#2A1C30', 0.2))
          + line('M-3 -21 Q0 -13 3 -21', shade(col, -1.2), 1.6) + line('M-14 -8 C-15 -16 -13 -22 -9 -25', K.lightOf(col), 1.4, { opacity: 0.7 })
          + part('M-20 -6 Q0 -2 20 -6 L19.5 1 Q0 5 -19.5 1Z', '#5A3A24', { 'stroke-width': 1.8 })
          + part(K.puffStarD(10, -2.4, 3.6), GOLD, { stroke: GOLD_D, 'stroke-width': 0.9 })));
    }
    case 'aureola': {
      const rx = Math.min(28, g.w * 0.21);
      const y = top - 15;
      return P(`M${100 - rx} ${y} A${rx} 7 0 1 0 ${100 + rx} ${y} A${rx} 7 0 1 0 ${100 - rx} ${y}Z M${100 - rx + 5.5} ${y} A${rx - 5.5} 3.2 0 1 0 ${100 + rx - 5.5} ${y} A${rx - 5.5} 3.2 0 1 0 ${100 - rx + 5.5} ${y}Z`, { fill: '#FFE37A', stroke: GOLD_D, 'stroke-width': 1.6, 'fill-rule': 'evenodd', 'data-r': 'part' })
        + K.tone(`M${100 - rx + 2} ${y + 2} A${rx - 2} 5 0 0 0 ${100 + rx - 2} ${y + 2} L${100 + rx - 6} ${y + 2} A${rx - 6} 2.6 0 0 1 ${100 - rx + 6} ${y + 2}Z`, '#B0782A', 0.25)
        + line(`M${100 - rx * 0.6} ${y - 4.8} Q100 ${y - 7} ${100 + rx * 0.2} ${y - 6}`, '#FFFFFF', 1.6, { opacity: 0.85 })
        + flat(K.sparkleD(100 + rx + 2, y - 7, 2.8), '#FFF6C8');
    }
    case 'cachos': {
      const p = K.onTop(g, -0.17, 5);
      const horn = G({ transform: T(p.x, p.y, p.rot * 0.6 - 4, sc * 1.15) },
        part('M-7.5 4 C-8.5 -6 -5.5 -16 2.5 -23 C1 -14 4.5 -5 7.5 4Z', '#E0384F', { stroke: '#7A1F2E' })
        + K.tone('M2.5 -23 C1 -14 4.5 -5 7.5 4 L3 4 C1 -5 0 -13 2.5 -23Z', '#7A1F2E', 0.25)
        + line('M-4.5 -6 Q-2.5 -12 0.5 -17', '#FF8A9A', 1.5));
      return horn + mirrorX(horn);
    }
    case 'cuernos': {
      const x = 100 - g.w * 0.3, y = g.topAt(x) + 8;
      const horn = G({ transform: T(x, y, -8, sc * 1.35) },
        part('M6 4 C-2 -2 -12 -4 -20 2 C-28 8 -26 20 -18 22 C-12 23 -9 16 -13 13 C-16 11 -19 14 -18 16 C-23 12 -20 6 -14 4 C-8 2 -2 6 2 10Z', '#EADBC2', { stroke: '#7A6248' })
        + line('M-4 1 l-1 4 M-10 0 l0 4 M-16 3 l1.6 3.6 M-21 8 l3 2', '#A78E70', 1.4)
        + line('M-6 -1 C-12 -2 -17 0 -20 4', '#FFF8EA', 1.3, { opacity: 0.8 }));
      return horn + mirrorX(horn);
    }
    case 'cresta': {
      const col = c.punkColor;
      let s = '';
      [-2, -1, 0, 1, 2].forEach((k) => {
        const x = 100 + k * 8, y = g.topAt(x) + 5, h = 28 - Math.abs(k) * 5.5;
        const d = `M${x - 6} ${y} Q${x + k * 1.2 - 1} ${y - h * 0.6} ${x + k * 2} ${y - h} Q${x + k * 1.2 + 2} ${y - h * 0.5} ${x + 6} ${y}Z`;
        s += part(d, k % 2 ? shade(col, -0.5) : col) + line(`M${x - 2.5} ${y - 2} Q${x + k - 1} ${y - h * 0.5} ${x + k * 1.6} ${y - h + 4}`, K.lightOf(col), 1.2, { opacity: 0.7 });
      });
      return s;
    }
    case 'flequillo': {
      const col = c.hairColor;
      return G({ transform: T(100, top + 2, 0, sc * 1.1) },
        part('M-22 6 C-22 -6 -10 -12 2 -10 C14 -8 22 0 22 8 C14 2 8 2 4 6 C0 0 -6 0 -10 6 C-12 2 -18 2 -22 6Z', col)
        + line('M0 -10 C2 -20 12 -22 12 -14 C12 -9 6 -10 7 -14', OUT, 5.5) + line('M0 -10 C2 -20 12 -22 12 -14 C12 -9 6 -10 7 -14', col, 2.6)
        + line('M-14 -2 Q-8 -6 -2 -4', K.lightOf(col, 1.4), 1.6, { opacity: 0.8 }));
    }
    default: return '';
  }
}

// ── CUELLO ───────────────────────────────────────────────────────
// Todo sigue la misma línea del cuello (K.neckGeo): una curva que abraza
// el cuerpo debajo de la boca. Bandas con su canto de luz y costura,
// dijes grandes con su metal.
export function neck(id, g, c, clip) {
  const nk = K.neckGeo(g);
  const { y, cy, L, R } = nk;
  const S = K.neckScale(g);
  const clipped = (inner) => G({ 'clip-path': `url(#${clip})` }, inner);
  const band = (th, fill, o = {}) => clipped(part(nk.band(th), fill, o) + (th >= 5 ? line(nk.curve(-th * 0.22), K.lightOf(fill, 0.9), 1.2, { opacity: 0.75 }) : ''));
  switch (id) {
    case 'collar': {
      const col = c.collarColor, by = cy + 3 + 7 * S;
      // collar de tela con su costura y un cascabel grande colgando de su argolla
      return band(8, col) + clipped(K.skipPx(K.stitch(nk.curve(2), K.seamOf(col, 0.7), 1)))
        + K.bail(100, cy + 3.4, GOLD)
        + Cir(100, by, 7.5 * S, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 1.8, 'data-r': 'part' })
        + K.tone(`M${100 - 7.5 * S} ${by + 1} A${7.5 * S} ${7.5 * S} 0 0 0 ${100 + 7.5 * S} ${by + 1} A${7.5 * S} ${4 * S} 0 0 1 ${100 - 7.5 * S} ${by + 1}Z`, '#8A5A10', 0.25)
        + line(`M${100 - 5.5 * S} ${by + 1} H${100 + 5.5 * S}`, GOLD_D, 1.5) + Cir(100, by + 3.6 * S, 1.6 * S, { fill: GOLD_D, 'data-r': 'flat' }) + line(`M100 ${by + 3.6 * S} v${2.8 * S}`, GOLD_D, 1.2)
        + shine(100 - 2.6 * S, by - 3 * S, 1.8 * S);
    }
    case 'pajarita': {
      const col = c.bowColor, dk = shade(col, -0.9);
      return G({ transform: T(100, cy + 2, 0, 1.2 * S) },
        part('M0 0 L-16 -9 Q-19 0 -16 9Z M0 0 L16 -9 Q19 0 16 9Z', col)
        + K.flat('M-4 -1 L-13 -6 Q-14.5 0 -13 6 L-4 1Z M4 -1 L13 -6 Q14.5 0 13 6 L4 1Z', K.lightOf(col, 0.5))
        + line('M-14 -3.5 L-7 -1.5 M-14 3.5 L-7 1.5 M14 -3.5 L7 -1.5 M14 3.5 L7 1.5', dk, 1.2, { opacity: 0.85 })
        + part(K.rr(-4.5, -5, 9, 10, 2), shade(col, -0.45)) + line('M-1.5 -3 Q0.5 0 -1.5 3', dk, 1));
    }
    case 'bufanda': {
      const col = c.scarfColor, st = c.scarfAlt;
      const th = 15;
      // bufanda gruesa tejida a rayas: da la vuelta y una punta cae por delante con flecos
      let stripes = '';
      for (let x = L - 2; x < R + 6; x += 19) stripes += `M${x} ${y - 14} h8 V${y + 30} h-8Z`;
      let ribs = '';
      for (let x = L; x < R; x += 3.6) ribs += `M${x} ${nk.yAt(x) - th / 2 + 2} v${th - 4}`;
      const wrap = nk.band(th, 1);
      const tx = 100 + g.w * 0.17, t0 = nk.yAt(tx) + 4;
      const end = `M${tx - 8} ${t0} C${tx - 10} ${t0 + 10} ${tx - 9} ${t0 + 18} ${tx - 7} ${t0 + 24} L${tx + 9} ${t0 + 24} C${tx + 9} ${t0 + 16} ${tx + 9} ${t0 + 8} ${tx + 8} ${t0 - 2}Z`;
      let endStripes = '';
      for (let k2 = 0; k2 < 3; k2++) endStripes += `M${tx - 12} ${t0 + 3 + k2 * 7.5} h24 v3.6 h-24Z`;
      return clipped(part(wrap, col) + K.clipTo(wrap, flat(stripes, st) + K.skipPx(line(ribs, shade(col, -1), 0.9, { opacity: 0.45 })) + K.tone(nk.band(4, th / 2), '#2A1C30', 0.2)) + line(nk.curve(1 - th * 0.3), K.lightOf(col), 1.2, { opacity: 0.7 }))
        + part(end, col) + K.clipTo(end, flat(endStripes, st) + K.tone(`M${tx + 3} ${t0 - 4} H${tx + 12} V${t0 + 26} H${tx + 4}Z`, '#2A1C30', 0.18))
        + line(`M${tx - 5} ${t0 + 25} v5 M${tx - 1.5} ${t0 + 25} v6 M${tx + 2} ${t0 + 25} v5.5 M${tx + 5.5} ${t0 + 25} v5`, shade(col, -0.6), 2);
    }
    case 'panuelo': {
      const col = c.bowColor, s = 1.15 * S;
      const tri = `M${100 - 18 * s} ${cy - 2} L${100 + 18 * s} ${cy - 2} Q${100 + 6 * s} ${cy + 10 * s} 100 ${cy + 22 * s} Q${100 - 6 * s} ${cy + 10 * s} ${100 - 18 * s} ${cy - 2}Z`;
      const dots = [[-8, 4], [0, 11], [8, 4], [0, 1], [-4, 17], [4, 17]].map(([dx, dy]) => Cir(100 + dx * s, cy + dy * s, 1.7, { fill: '#FFFFFF', opacity: 0.95, 'data-r': 'flat' })).join('');
      return band(5, col) + part(tri, col) + K.clipTo(tri, dots + K.tone(`M100 ${cy - 4} L${100 + 20 * s} ${cy - 4} L100 ${cy + 24 * s}Z`, '#2A1C30', 0.16))
        + line(`M${100 - 10 * s} ${cy + 1} Q${100 - 4 * s} ${cy + 8 * s} ${100 - 1} ${cy + 16 * s}`, K.seamOf(col), 1.1, { opacity: 0.7 })
        + K.ball(100, cy - 1, 4.6, shade(col, -0.5), { 'stroke-width': 1.8 }) + line(`M${97.6} ${cy - 2.6} q2 2 0 4`, shade(col, -1.4), 1);
    }
    case 'medallon': {
      const r = 9.5 * S, my = cy + 4 + r * 1.15;
      // relicario ovalado con bisagra, su corazón grabado y brillo de metal
      return K.chainLine(g, nk, GOLD, 1.8) + K.bail(100, cy + 2.6, GOLD)
        + P(K.ellD(100, my, r * 0.86, r * 1.06), { fill: GOLD, stroke: GOLD_D, 'stroke-width': 1.8, 'data-r': 'part' })
        + P(K.ellD(100, my, r * 0.6, r * 0.78), { fill: shade(GOLD, -0.35), stroke: GOLD_D, 'stroke-width': 1, 'data-r': 'part' })
        + K.flat(K.heartD(100, my + 0.5, r * 0.36), '#E0384F') + shine(100 - r * 0.15, my - r * 0.12, r * 0.08)
        + line(`M${100 - r * 0.55} ${my - r * 0.6} Q${100 - r * 0.7} ${my - r * 0.1} ${100 - r * 0.55} ${my + r * 0.3}`, '#FFF6D0', 1.4, { opacity: 0.9 })
        + K.ball(100, my - r * 1.06, 1.6, GOLD, { stroke: GOLD_D, 'stroke-width': 1 });
    }
    case 'lei': {
      let s = '';
      const n = Math.round((R - L) / 11.5);
      for (let i = 0; i <= n; i++) {
        const [x, yy] = nk.pt(i / n, 1);
        if (i % 2) s += P('M0 0 C3 -3 8 -3 10 0 C8 3 3 3 0 0Z', { transform: T(x - 5, yy + 4, -10 + (i % 4) * 10, 1), fill: '#5FB36E', stroke: '#2F7A4E', 'stroke-width': 1, 'data-r': 'part' });
      }
      for (let i = 0; i <= n; i++) { const [x, yy] = nk.pt(i / n, 0); s += K.flower(x, yy, 7.2, FLOWER_COLS[i % FLOWER_COLS.length], i * 23, '#FFF4B8'); }
      return clipped(s);
    }
    case 'corbata': {
      const col = c.tieColor, s = 1.1 * S;
      const blade = `M${100 - 3.8 * s} ${cy + 4} L${100 + 3.8 * s} ${cy + 4} L${100 + 6.5 * s} ${cy + 22 * s} L100 ${cy + 28 * s} L${100 - 6.5 * s} ${cy + 22 * s}Z`;
      return clipped(K.tone(nk.band(4, 2.5), '#2A1C30', 0.12))
        + part(`M${100 - 7 * s} ${y - 1} L100 ${cy + 2} L${100 + 7 * s} ${y - 1}`, '#FFFFFF', { 'stroke-width': 1.6 })
        + part(blade, col) + K.clipTo(blade, line(`M${100 - 8 * s} ${cy + 11} l16 -6 M${100 - 8 * s} ${cy + 18 * s} l16 -6 M${100 - 8 * s} ${cy + 25 * s} l16 -6`, K.lightOf(col, 1.2), 2, { opacity: 0.8 }) + K.tone(`M100 ${cy} L${100 + 8 * s} ${cy} L${100 + 8 * s} ${cy + 30 * s} L100 ${cy + 30 * s}Z`, '#2A1C30', 0.16))
        + part(`M${100 - 5.5 * s} ${cy - 2.5} L${100 + 5.5 * s} ${cy - 2.5} L${100 + 3.8 * s} ${cy + 5} L${100 - 3.8 * s} ${cy + 5}Z`, shade(col, -0.45));
    }
    case 'medalla': {
      const col = c.collarColor, r = 9 * S, my = cy + 10 + r;
      return part(`M${100 - 15} ${cy - 6} L${100 - 4} ${cy + 11} L${100 + 4} ${cy + 11} L${100 + 15} ${cy - 6} L${100 + 8.5} ${cy - 6} L100 ${cy + 4} L${100 - 8.5} ${cy - 6}Z`, col)
        + line(`M${100 - 11.5} ${cy - 5} L${100 - 2} ${cy + 9} M${100 + 11.5} ${cy - 5} L${100 + 2} ${cy + 9}`, K.lightOf(col), 1.4, { opacity: 0.85 })
        + K.ball(100, cy + 11, 2.2, GOLD, { stroke: GOLD_D, 'stroke-width': 1 })
        + Cir(100, my, r, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 2, 'data-r': 'part' })
        + Cir(100, my, r * 0.72, { fill: shade(GOLD, -0.3), stroke: GOLD_D, 'stroke-width': 1, 'data-r': 'part' })
        + P(K.puffStarD(100, my, r * 0.52), { fill: '#FFF1B8', stroke: GOLD_D, 'stroke-width': 0.8, 'data-r': 'part' })
        + shine(100 - r * 0.5, my - r * 0.5, r * 0.14);
    }
    case 'capa': {
      const col = c.capeColor;
      return band(5, col) + part(`M${100 - 15} ${cy - 5} L${100 - 4} ${cy + 1} L${100 - 10} ${cy + 10}Z M${100 + 15} ${cy - 5} L${100 + 4} ${cy + 1} L${100 + 10} ${cy + 10}Z`, shade(col, -0.4))
        + Cir(100, cy, 5.4, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 2, 'data-r': 'part' }) + Cir(100, cy, 2.4, { fill: '#E0384F', 'data-r': 'flat' }) + shine(98.2, cy - 2, 1.3);
    }
    case 'choker': {
      const hy = cy + 4 + 6 * S;
      return band(6, '#221C27') + clipped(line(nk.curve(-2), '#4A3E58', 1, { opacity: 0.9 }))
        + K.bail(100, cy + 3, SILVER)
        + P(K.heartD(100, hy, 6 * S), { fill: '#D9364F', stroke: '#5A1220', 'stroke-width': 1.6, 'data-r': 'part' })
        + K.flat(K.heartD(100 - 0.6, hy - 0.5, 3.6 * S), '#F06A80') + shine(97.6, hy - 2.6 * S, 1.1);
    }
    case 'cadena': {
      let s = '';
      const n = Math.round((R - L) / 6.4);
      for (let i = 0; i <= n; i++) {
        const [x, yy] = nk.pt(i / n);
        const o = i % 2;
        s += Ell(x, yy, o ? 4.4 : 2, o ? 2.4 : 3.4, { fill: 'none', stroke: SILVER_D, 'stroke-width': 3.8, 'data-r': 'line' }) + Ell(x, yy, o ? 4.4 : 2, o ? 2.4 : 3.4, { fill: 'none', stroke: SILVER, 'stroke-width': 1.9, 'data-r': 'line' });
      }
      const lw = 12 * S, lh = 10 * S, ly = cy + 7;
      return clipped(s) + line(`M${100 - lw * 0.3} ${ly} v${-lh * 0.35} a${lw * 0.3} ${lw * 0.3} 0 0 1 ${lw * 0.6} 0 v${lh * 0.35}`, SILVER_D, 2.4)
        + part(K.rr(100 - lw / 2, ly, lw, lh, 2), SILVER, { stroke: SILVER_D })
        + K.tone(K.rr(100 + lw * 0.1, ly, lw * 0.4, lh, 2), '#2A1C30', 0.16)
        + Cir(100, ly + lh * 0.42, 1.4, { fill: SILVER_D, 'data-r': 'flat' }) + line(`M${100 - lw * 0.32} ${ly + 2} v${lh * 0.5}`, '#FFFFFF', 1.3, { opacity: 0.85 });
    }
    case 'pinchos': {
      let spikes = '';
      const n = Math.round((R - L) / 13);
      for (let i = 1; i < n; i++) {
        const [x, yy] = nk.pt(i / n, 3.4);
        spikes += P(`M${x - 3.6} ${yy - 1} L${x} ${yy + 7} L${x + 3.6} ${yy - 1}Z`, { fill: SILVER, stroke: SILVER_D, 'stroke-width': 1.3, 'stroke-linejoin': 'round', 'data-r': 'part' }) + K.flat(`M${x - 2} ${yy - 0.4} L${x - 0.4} ${yy + 4.6} L${x - 0.4} ${yy - 0.4}Z`, '#FFFFFF');
      }
      return clipped(part(nk.band(8), '#221C27') + line(nk.curve(-2.6), '#4A3E58', 1.2) + spikes);
    }
    default: return '';
  }
}

export function neckBack(id, g, c) {
  if (id !== 'capa') return '';
  // Capa de héroe que vuela hacia un costado: se lee como capa aunque la
  // mochi no tenga hombros. Forro de otro tono y pliegues del viento.
  const y = g.neckY - 6, col = c.capeColor, lin = shade(col, 1.4);
  const d = `M${g.l + 10} ${y} C${g.l - 4} ${y + 12} ${g.l - 8} ${y + 26} ${g.l - 6} ${y + 34} C${100} ${y + 40} ${g.r + 10} ${y + 30} ${g.r + 34} ${y + 22} C${g.r + 30} ${y + 14} ${g.r + 36} ${y + 6} ${g.r + 42} ${y - 4} C${g.r + 30} ${y - 4} ${g.r + 20} ${y - 10} ${g.r + 12} ${y - 18} C${g.r} ${y - 8} ${g.r - 10} ${y - 2} ${g.r - 14} ${y}Z`;
  return part(d, col)
    + K.clipTo(d, K.tone(`M${g.r + 6} ${y + 4} C${g.r + 18} ${y} ${g.r + 26} ${y - 6} ${g.r + 34} ${y - 10} L${g.r + 46} ${y - 6} L${g.r + 40} ${y + 30} L${g.r + 6} ${y + 30}Z`, '#1A0C1E', 0.22))
    + line(`M${g.r + 4} ${y + 22} C${g.r + 16} ${y + 16} ${g.r + 24} ${y + 8} ${g.r + 30} ${y - 2} M${g.r + 2} ${y + 12} C${g.r + 12} ${y + 6} ${g.r + 18} ${y - 2} ${g.r + 20} ${y - 10}`, lin, 1.8, { opacity: 0.8 });
}

// ── CARA ─────────────────────────────────────────────────────────
// Lentes y antifaces grandes: en pixel los ojos (sellos hechos a mano)
// se pintan encima y miden ~20 unidades; el marco tiene que rodearlos.
export function faceAcc(id, g, c, e) {
  const L = 100 - e.dx, Rx = 100 + e.dx, y = e.y;
  const glint = (x, yy, r) => line(`M${x - r * 0.62} ${yy - r * 0.05} l${r * 0.38} ${-r * 0.36} M${x - r * 0.42} ${yy + r * 0.3} l${r * 0.2} ${-r * 0.19}`, '#FFFFFF', 1.7, { opacity: 0.9 });
  switch (id) {
    case 'lentes': {
      const r = 12.5, col = '#3A2A3E';
      return line(`M${L - r} ${y - 3} l-6 -1.5 M${Rx + r} ${y - 3} l6 -1.5`, col, 2.4)
        + Cir(L, y, r, { fill: '#DFF4FF', 'fill-opacity': 0.25, stroke: col, 'stroke-width': 2.8, 'data-r': 'part' })
        + Cir(Rx, y, r, { fill: '#DFF4FF', 'fill-opacity': 0.25, stroke: col, 'stroke-width': 2.8, 'data-r': 'part' })
        + line(`M${L + r - 1} ${y - 2} Q100 ${y - 6} ${Rx - r + 1} ${y - 2}`, col, 2.6)
        + glint(L, y - 1, r) + glint(Rx, y - 1, r);
    }
    case 'gafasol': {
      const lens = (x) => `M${x - 13} ${y - 8} Q${x - 13} ${y - 10} ${x - 10.5} ${y - 10} L${x + 10.5} ${y - 10} Q${x + 13} ${y - 10} ${x + 13} ${y - 7.5} Q${x + 12} ${y + 9} ${x} ${y + 9} Q${x - 12} ${y + 9} ${x - 13} ${y - 8}Z`;
      const lensIn = (x) => `M${x - 10} ${y - 1} Q${x} ${y + 3} ${x + 10} ${y - 1} Q${x + 9} ${y + 7} ${x} ${y + 7} Q${x - 9} ${y + 7} ${x - 10} ${y - 1}Z`;
      return line(`M${L - 13} ${y - 6} l-6 -1.5 M${Rx + 13} ${y - 6} l6 -1.5`, '#221C27', 2.6)
        + part(lens(L), '#2A2230', { 'stroke-width': 2.6 }) + part(lens(Rx), '#2A2230', { 'stroke-width': 2.6 })
        + K.flat(lensIn(L), '#4A4466') + K.flat(lensIn(Rx), '#4A4466')
        + line(`M${L + 12} ${y - 7} Q100 ${y - 10} ${Rx - 12} ${y - 7}`, OUT, 2.8)
        + line(`M${L - 8} ${y - 3} l6 -4 M${L - 6} ${y + 2} l3 -2 M${Rx - 8} ${y - 3} l6 -4`, '#FFFFFF', 1.8, { opacity: 0.8 });
    }
    case 'antifaz': {
      const w = e.dx + 18, col = c.maskColor;
      const d = `M${100 - w} ${y - 4} C${100 - w} ${y - 14} ${100 - 6} ${y - 13} 100 ${y - 8} C${100 + 6} ${y - 13} ${100 + w} ${y - 14} ${100 + w} ${y - 4} C${100 + w} ${y + 9} ${100 + 7} ${y + 11} 100 ${y + 5} C${100 - 7} ${y + 11} ${100 - w} ${y + 9} ${100 - w} ${y - 4}Z`
        + `M${L - 11} ${y} C${L - 11} ${y - 10} ${L + 11} ${y - 10} ${L + 11} ${y} C${L + 11} ${y + 9} ${L - 11} ${y + 9} ${L - 11} ${y}Z`
        + `M${Rx - 11} ${y} C${Rx - 11} ${y - 10} ${Rx + 11} ${y - 10} ${Rx + 11} ${y} C${Rx + 11} ${y + 9} ${Rx - 11} ${y + 9} ${Rx - 11} ${y}Z`;
      return line(`M${100 - w} ${y - 3} L${g.l + 2} ${y - 7} M${100 + w} ${y - 3} L${g.r - 2} ${y - 7}`, shade(col, -0.8), 2)
        + P(d, { fill: col, 'fill-rule': 'evenodd', stroke: OUT, 'stroke-width': 2.3, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + line(`M${100 - w + 3} ${y - 6} C${100 - w + 4} ${y - 11} ${100 - 16} ${y - 11} ${100 - 12} ${y - 10}`, K.lightOf(col), 1.6, { opacity: 0.8 });
    }
    case 'curita': {
      const x = 100 - g.face.cheekDx + 2, yy = g.face.cheekY + 2;
      return G({ transform: T(x, yy, -28, 1.15) }, part('M-9 -4 h18 a4 4 0 0 1 0 8 h-18 a4 4 0 0 1 0 -8Z', '#F6C9A0', { stroke: '#9A6A48', 'stroke-width': 1.6 })
        + flat('M-3.5 -4 h7 v8 h-7Z', '#FFE3C8') + [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]].map(([dx, dy]) => Cir(dx, dy, 0.7, { fill: '#C49470', 'data-r': 'flat' })).join(''));
    }
    case 'brillos': {
      const star = (x, yy, r) => P(K.sparkleD(x, yy, r), { fill: '#FFF3A8', stroke: '#C9A227', 'stroke-width': 1, 'data-r': 'part' }) + K.flat(K.sparkleD(x - r * 0.1, yy - r * 0.1, r * 0.45), '#FFFFFF');
      return star(g.l + 4, g.top + 20, 7) + star(g.r - 2, g.top + 8, 5.4) + star(g.r + 4, g.top + 34, 4.2) + star(g.l - 2, g.top + 42, 3.6);
    }
    case 'parche': {
      // parche negro con su cinta en diagonal por la cabeza
      const px = Rx + 1;
      return line(`M${px + 9} ${y - 7} L${g.r - 2} ${g.topAt(g.r - 14) + 6} M${px - 9} ${y - 8} L${100 - g.w * 0.22} ${g.topAt(100 - g.w * 0.22) + 2}`, '#221C27', 2.6)
        + part(`M${px - 12} ${y - 7} Q${px} ${y - 13} ${px + 12} ${y - 7} Q${px + 12} ${y + 10} ${px} ${y + 11} Q${px - 12} ${y + 10} ${px - 12} ${y - 7}Z`, '#221C27')
        + line(`M${px - 8} ${y - 6} Q${px - 2} ${y - 9} ${px + 4} ${y - 8}`, '#5A4E6A', 1.4, { opacity: 0.9 }) + K.skipPx(K.stitch(`M${px - 9} ${y - 4} Q${px - 9} ${y + 7} ${px} ${y + 8} Q${px + 9} ${y + 7} ${px + 9} ${y - 4}`, '#4A3E58', 1));
    }
    case 'piercings': {
      const x = g.l + 6, yy = g.ys - 26;
      return Ell(x, yy, 3.8, 4.4, { fill: 'none', stroke: SILVER_D, 'stroke-width': 3.4, 'data-r': 'line' }) + Ell(x, yy, 3.8, 4.4, { fill: 'none', stroke: SILVER, 'stroke-width': 1.7, 'data-r': 'line' })
        + Ell(x + 2, yy + 9, 3.2, 3.8, { fill: 'none', stroke: SILVER_D, 'stroke-width': 3.2, 'data-r': 'line' }) + Ell(x + 2, yy + 9, 3.2, 3.8, { fill: 'none', stroke: SILVER, 'stroke-width': 1.6, 'data-r': 'line' })
        + Cir(100 + 9, g.face.mouthY + 3, 1.8, { fill: SILVER, stroke: SILVER_D, 'stroke-width': 1, 'data-r': 'part' });
    }
    default: return '';
  }
}

export function faceUnder(id, g, c, e) {
  const L = 100 - e.dx, Rx = 100 + e.dx, y = e.y;
  switch (id) {
    case 'pecas': {
      const dots = (x, s) => [[0, 0], [s * 4, -2.4], [s * 5, 2.6], [s * 1, 4]].map(([dx, dy]) => Cir(x + dx, g.face.cheekY + dy, 1.3, { fill: '#9A5A3E', opacity: 0.85, 'data-r': 'flat' })).join('');
      return dots(L - 8, -1) + dots(Rx + 8, 1);
    }
    case 'lunar':
      return Cir(100 + 14, g.face.mouthY - 1, 1.9, { fill: '#3A2A3E', 'data-r': 'flat' });
    case 'lagrima':
      return P(`M${L - 6} ${y + 12} q-3 5.5 0 8 q3 -2.5 0 -8z`, { fill: 'none', stroke: '#3A2A3E', 'stroke-width': 1.5, 'data-r': 'line' });
    case 'eyeblack':
      return [L, Rx].map((x) => P(`M${x - 8} ${y + 12} h16 v4.5 h-16Z`, { fill: '#221C27', 'data-r': 'flat' })).join('');
    case 'corpse': {
      const ink = '#1D1720';
      return [[L, -1], [Rx, 1]].map(([x, s]) => P(`M${x - 12} ${y - 10} L${x + 12} ${y - 10} L${x + s * 2} ${y + 15} Q${x} ${y + 10} ${x - s * 2} ${y + 15}Z`, { fill: ink, 'data-r': 'flat' })).join('')
        + P(`M${100 - 2} ${g.face.mouthY + 2} L${100 - 3.5} ${g.face.mouthY + 14} M${100 + 2} ${g.face.mouthY + 2} L${100 + 3.5} ${g.face.mouthY + 14}`, { fill: 'none', stroke: ink, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'data-r': 'line' });
    }
    default: return '';
  }
}

export function accColors(r) {
  // `accColor`: color que quien recibe eligió para lo que se compró en la
  // tienda; si no hay, el de la receta.
  const accent = r.accColor || r.accentColor || '#E9A3B5';
  const alt = r.accentAlt || '#FFFFFF';
  const vivid = pale(accent) ? '#FF7FA8' : accent;
  return {
    bowColor: vivid,
    hatColor: pale(accent) ? '#7FC8F8' : accent,
    hatAlt: pale(alt) ? '#FFFFFF' : alt,
    beretColor: pale(accent) ? '#D9364F' : accent,
    punkColor: pale(accent) ? '#FF4FA0' : accent,
    hairColor: pale(alt) ? '#6B4A3A' : alt,
    collarColor: vivid,
    scarfColor: pale(accent) ? '#7FC8F8' : accent,
    scarfAlt: mixc(pale(accent) ? '#7FC8F8' : accent, '#FFFFFF', 0.6),
    tieColor: pale(accent) ? '#5B7BD9' : accent,
    capeColor: pale(accent) ? '#8E2A44' : accent,
    maskColor: pale(accent) ? '#3A2A4E' : accent,
  };
}

/** Capas: back (detrás del cuerpo), underFace (sobre la piel, bajo los ojos), front. */
export function renderAccessories(r, g, c, mood, eyes) {
  const cc = { ...c, ...accColors(r) };
  const clip = nid('nk');
  const e = eyes || { y: g.face.y, dx: g.face.dx };
  const neckFront = r.neckAcc && r.neckAcc !== 'ninguno' ? neck(r.neckAcc, g, cc, clip) : '';
  return {
    back: neckBack(r.neckAcc, g, cc),
    underFace: faceUnder(r.extraAcc, g, cc, e),
    front: (neckFront ? E('clipPath', { id: clip }, P(g.path)) + neckFront : '') + faceAcc(r.extraAcc, g, cc, e) + head(r.headAcc, g, cc),
  };
}
