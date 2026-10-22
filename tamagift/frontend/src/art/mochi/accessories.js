// Accesorios de la mochi. Ninguno tiene coordenadas fijas: todos se
// anclan a la geometría del cuerpo (coronilla, borde de arriba, línea
// del collar, posición de los ojos), así un gorro queda sobre la cabeza
// y un collar abraza el cuerpo en los cuatro anchos.

import { G, P, Ell, Cir, E, R, mirrorX } from '../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../color.js';

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
function head(id, g, c) {
  const top = g.top;
  const sc = Math.max(0.8, Math.min(1.12, g.w / 144));
  switch (id) {
    case 'mono': {
      const x = 100 - g.w * 0.21, y = g.topAt(x) + 3;
      return bow(x, y, g.tiltAt(x) * 0.7 - 6, 1.05 * sc, c.bowColor);
    }
    case 'monoCalavera': {
      const x = 100 - g.w * 0.21, y = g.topAt(x) + 3;
      return G({ transform: T(x, y, g.tiltAt(x) * 0.7 - 6, 1.1 * sc) },
        part('M0 0 C-6 -10 -21 -11 -21 -1 C-21 9 -7 8 0 0Z M0 0 C6 -10 21 -11 21 -1 C21 9 7 8 0 0Z', '#2A2230')
        + line('M-16 -3 C-12 -6 -8 -5 -6 -2', '#8A7A9E', 1.6)
        + part('M-5 2 C-6 -6 6 -6 5 2 L3.5 3 L3.5 6 L-3.5 6 L-3.5 3Z', '#F4F0EA', { 'stroke-width': 1.6 })
        + Cir(-2, -0.6, 1.4, { fill: '#2A2230', 'data-r': 'flat' }) + Cir(2, -0.6, 1.4, { fill: '#2A2230', 'data-r': 'flat' }));
    }
    case 'fiesta': {
      const col = '#7FC8F8', st = '#FFD166';
      return G({ transform: T(106, top + 5, 13, 0.95 * sc) },
        part('M-17 0 L0 -44 L17 0 Q0 6 -17 0Z', col, { stroke: shade(col, -2.2) })
        + flat('M-11.5 -14 L-6.5 -27 Q0 -24 7 -27 L11.5 -14 Q0 -10 -11.5 -14Z', st)
        + flat('M-4 -38 L-2 -42 Q0 -41 2.5 -42 L4.2 -37 Q0 -35.5 -4 -38Z', st)
        + line('M-15 -3 Q0 3 15 -3', '#FFFFFF', 2, { opacity: 0.6 })
        + Cir(0, -45, 6.5, { fill: '#FF8FAB', stroke: '#B04A6A', 'stroke-width': 2.2, 'data-r': 'part' }) + shine(-2, -47, 1.8));
    }
    case 'gorro': {
      const bw = g.w * 0.8, x1 = 100 - bw / 2, x2 = 100 + bw / 2;
      const ys = g.topAt(x1) + 7, yc = top + 9;
      const col = c.hatColor, band = shade(col, -0.7);
      const dome = `M${x1} ${ys} C${x1 - 2} ${top - 14} ${100 - bw * 0.28} ${top - 24} 100 ${top - 24} C${100 + bw * 0.28} ${top - 24} ${x2 + 2} ${top - 14} ${x2} ${ys} Q100 ${yc - 4} ${x1} ${ys}Z`;
      const bandD = `M${x1 - 3} ${ys + 3} Q100 ${yc + 2} ${x2 + 3} ${ys + 3} L${x2 + 2} ${ys - 9} Q100 ${yc - 11} ${x1 - 2} ${ys - 9}Z`;
      let ribs = '';
      for (let i = 1; i < 10; i++) { const t = i / 10; const x = x1 + (x2 - x1) * t; const yb = ys + 3 + (yc + 2 - ys - 3) * (1 - Math.pow(2 * t - 1, 2)); ribs += line(`M${x} ${yb - 2} l0 -8`, shade(band, -1), 1.4, { opacity: 0.7 }); }
      return part(dome, col) + line(`M${100 - bw * 0.22} ${top - 12} Q${100 - bw * 0.18} ${top - 2} ${100 - bw * 0.2} ${ys - 12} M${100 + bw * 0.04} ${top - 20} Q${100 + bw * 0.06} ${top - 6} ${100 + bw * 0.05} ${yc - 12} M${100 + bw * 0.28} ${top - 14} Q${100 + bw * 0.3} ${top - 2} ${100 + bw * 0.3} ${ys - 12}`, shade(col, -0.8), 1.6, { opacity: 0.7 })
        + part(bandD, band) + ribs
        + Cir(100, top - 26, 8.5, { fill: c.hatAlt, stroke: OUT, 'stroke-width': 2.4, 'data-r': 'part' }) + Cir(97, top - 29, 2.4, { fill: '#FFFFFF', opacity: 0.6, 'data-r': 'tone' });
    }
    case 'corona': {
      return G({ transform: T(100, top + 4, 0, sc) },
        part('M-18 4 L-20 -15 L-10 -5 L0 -20 L10 -5 L20 -15 L18 4 Q0 9 -18 4Z', GOLD, { stroke: GOLD_D })
        + flat('M-18 -1 Q0 4 18 -1 L18 4 Q0 9 -18 4Z', shade(GOLD, -0.5))
        + Cir(0, 0.5, 3, { fill: '#FF5B8A', stroke: GOLD_D, 'stroke-width': 1.3, 'data-r': 'part' })
        + Cir(-11, 0, 2.2, { fill: '#5FC2FF', stroke: GOLD_D, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(11, 0, 2.2, { fill: '#5FC2FF', stroke: GOLD_D, 'stroke-width': 1.2, 'data-r': 'part' })
        + Cir(-20, -16, 2.6, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(0, -21, 2.8, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(20, -16, 2.6, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 1.2, 'data-r': 'part' })
        + shine(-6, -6, 1.6));
    }
    case 'tiara': {
      const hw = g.w * 0.26;
      const arc = (dy) => `M${100 - hw} ${g.topAt(100 - hw) + dy} Q100 ${top - 2 + dy - 4} ${100 + hw} ${g.topAt(100 + hw) + dy}`;
      return line(arc(6), SILVER_D, 5.5) + line(arc(6), SILVER, 3)
        + G({ transform: T(100, top + 2, 0, sc) },
          part('M-12 2 L-8 -8 L-4 -1 L0 -14 L4 -1 L8 -8 L12 2Z', SILVER, { stroke: SILVER_D, 'stroke-width': 1.8 })
          + P('M0 -11 L3.5 -6 L0 -1 L-3.5 -6Z', { fill: '#C9A3FF', stroke: '#6E4FA8', 'stroke-width': 1.2, 'data-r': 'part' }) + shine(-0.8, -7.5, 1));
    }
    case 'flores': {
      const n = 7, hw = g.w * 0.34;
      let leaves = '', fl = '';
      for (let i = 0; i < n; i++) {
        const x = 100 - hw + (2 * hw * i) / (n - 1), y = g.topAt(x) + 6;
        const r = 6.4 - Math.abs(i - (n - 1) / 2) * 0.35;
        leaves += Ell(x + 5, y + 2, 5, 2.6, { transform: `rotate(${-25 + i * 8} ${x + 5} ${y + 2})`, fill: '#7CC48A', stroke: '#3F7D50', 'stroke-width': 1.2, 'data-r': 'part' });
        fl += flower(x, y, r, FLOWER_COLS[i % FLOWER_COLS.length], i);
      }
      return leaves + fl;
    }
    case 'diadema': {
      const hw = g.w * 0.4, col = c.bowColor;
      const pts = (dy) => { let d = ''; for (let i = 0; i <= 12; i++) { const x = 100 - hw + (2 * hw * i) / 12; d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(g.topAt(x) + dy).toFixed(1)}`; } return d; };
      const back = (dy) => { let d = ''; for (let i = 12; i >= 0; i--) { const x = 100 - hw + (2 * hw * i) / 12; d += `L${x.toFixed(1)} ${(g.topAt(x) + dy).toFixed(1)}`; } return d; };
      const x = 100 + g.w * 0.2, y = g.topAt(x) + 5;
      return part(`${pts(2)}${back(9)}Z`, col) + line(pts(4), shade(col, 1.2), 1.6, { opacity: 0.8 }) + bow(x, y, g.tiltAt(x) * 0.7 + 8, 0.6 * sc, col);
    }
    case 'sombrero': {
      const col = '#F2D38A', rib = c.bowColor;
      return G({ transform: T(100, top + 7, -6, sc) },
        part(`M-${g.w * 0.46} 0 C-${g.w * 0.46} -10 ${g.w * 0.46} -10 ${g.w * 0.46} 0 C${g.w * 0.46} 9 -${g.w * 0.46} 9 -${g.w * 0.46} 0Z`, col, { stroke: '#8A6326' })
        + line(`M-${g.w * 0.38} 1 C-${g.w * 0.3} 5 ${g.w * 0.3} 5 ${g.w * 0.38} 1`, '#C9A04F', 1.4, { opacity: 0.8 })
        + part('M-23 -2 C-24 -22 -12 -30 0 -30 C12 -30 24 -22 23 -2 Q0 3 -23 -2Z', col, { stroke: '#8A6326' })
        + part('M-23.5 -9 Q0 -4 23.5 -9 L23 -2 Q0 3 -23 -2Z', rib)
        + flower(16, -6, 6, '#FFFFFF', 2)
        + line('M-14 -24 l4 8 M-4 -28 l2 9 M6 -28 l-1 9', '#C9A04F', 1.2, { opacity: 0.7 }));
    }
    case 'gorra': {
      const col = c.hatColor;
      const w2 = g.w * 0.33;
      return part(`M${100 - w2} ${top + 10} C${100 - w2} ${top - 16} ${100 + w2} ${top - 16} ${100 + w2} ${top + 10} Q100 ${top + 4} ${100 - w2} ${top + 10}Z`, col)
        + line(`M100 ${top - 10} L100 ${top + 6} M${100 - w2 * 0.55} ${top - 4} Q${100 - w2 * 0.4} ${top + 2} ${100 - w2 * 0.45} ${top + 8}`, shade(col, -0.9), 1.5)
        + part(`M${100 - w2 * 0.95} ${top + 9} Q100 ${top + 3} ${100 + w2 * 0.95} ${top + 9} Q${100 + w2 * 0.9} ${top + 19} 100 ${top + 19} Q${100 - w2 * 0.9} ${top + 19} ${100 - w2 * 0.95} ${top + 9}Z`, shade(col, -0.6))
        + Cir(100, top - 11, 3, { fill: shade(col, -0.6), stroke: OUT, 'stroke-width': 1.6, 'data-r': 'part' })
        + flat(`M${100 - 8} ${top - 2} h16 v7 h-16Z`, c.hatAlt, { opacity: 0.95 });
    }
    case 'boina': {
      const col = c.beretColor;
      return G({ transform: T(96, top + 4, -10, sc) },
        part(`M-${g.w * 0.3} 2 C-${g.w * 0.34} -10 -10 -16 6 -15 C${g.w * 0.3} -14 ${g.w * 0.36} -4 ${g.w * 0.3} 4 C${g.w * 0.2} 9 -${g.w * 0.2} 9 -${g.w * 0.3} 2Z`, col)
        + line(`M-${g.w * 0.26} 3 Q0 7 ${g.w * 0.26} 3`, shade(col, -1), 1.8, { opacity: 0.7 })
        + part('M2 -15 C1 -20 3 -22 5 -21 C6 -19 6 -17 5 -15Z', shade(col, -0.5), { 'stroke-width': 1.6 }));
    }
    case 'bandana': {
      const bw = g.w * 0.74, x1 = 100 - bw / 2, x2 = 100 + bw / 2, col = c.bowColor;
      const ys = g.topAt(x1) + 6;
      const dots = [[-0.25, -10], [0, -16], [0.25, -10], [-0.12, -2], [0.13, -3]].map(([fx, dy]) => Cir(100 + bw * fx, top + dy + 8, 2.2, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'flat' })).join('');
      return part(`M${x2 + 2} ${ys} L${x2 + 16} ${ys + 2} L${x2 + 12} ${ys + 14} L${x2 + 4} ${ys + 6}Z M${x2 + 2} ${ys - 2} L${x2 + 14} ${ys - 12} L${x2 + 18} ${ys - 2}Z`, shade(col, -0.4))
        + part(`M${x1} ${ys} C${x1} ${top - 12} ${100 - bw * 0.25} ${top - 16} 100 ${top - 16} C${100 + bw * 0.25} ${top - 16} ${x2} ${top - 12} ${x2} ${ys} Q100 ${top + 8} ${x1} ${ys}Z`, col)
        + dots + Cir(x2 + 3, ys - 1, 4.5, { fill: col, stroke: OUT, 'stroke-width': 2, 'data-r': 'part' });
    }
    case 'audifonos': {
      const yc = top + Math.min(34, g.height * 0.28);
      const half = g.chordAt(yc) / 2;
      const col = c.hatColor;
      const band = `M${100 - half + 4} ${yc - 4} C${100 - half + 2} ${top - 22} ${100 + half - 2} ${top - 22} ${100 + half - 4} ${yc - 4}`;
      const cup = (x, s) => G({ transform: T(x, yc, s * 6, 1) },
        part('M-7 -13 Q-9 -13 -9 -10 L-9 10 Q-9 13 -7 13 L5 13 Q9 13 9 9 L9 -9 Q9 -13 5 -13Z', col)
        + flat('M3 -10 L6 -10 L6 10 L3 10Z', shade(col, -1.2)) + shine(-4, -8, 1.6));
      return line(band, OUT, 7) + line(band, shade(col, -0.4), 3.6) + cup(100 - half + 1, -1) + G({ transform: `translate(200 0) scale(-1 1)` }, cup(100 - half + 1, -1));
    }
    case 'bruja': {
      const col = '#4E3A70', band = '#FF9F43';
      return G({ transform: T(100, top + 7, -4, sc) },
        part(`M-${g.w * 0.42} 0 C-${g.w * 0.42} -9 ${g.w * 0.42} -9 ${g.w * 0.42} 0 C${g.w * 0.42} 8 -${g.w * 0.42} 8 -${g.w * 0.42} 0Z`, col)
        + part('M-20 -1 C-16 -20 -8 -38 6 -52 C10 -56 18 -54 22 -50 C14 -50 10 -44 10 -36 C12 -22 16 -10 20 -1 Q0 4 -20 -1Z', col)
        + part('M-19.5 -5 Q0 -0.5 19.5 -5 L20 -1 Q0 4 -20 -1Z', band)
        + part('M-5 -7 h10 v8 h-10Z', GOLD, { stroke: GOLD_D, 'stroke-width': 1.6 }) + flat('M-2.5 -4.5 h5 v3 h-5Z', col)
        + P('M-6 -30 l1 2.4 l2.6 0.3 l-2 1.6 l0.7 2.5 l-2.3 -1.4 l-2.3 1.4 l0.7 -2.5 l-2 -1.6 l2.6 -0.3Z', { fill: GOLD, 'data-r': 'flat' }));
    }
    case 'vaquero': {
      const col = '#B67A45';
      return G({ transform: T(100, top + 6, 0, sc) },
        part(`M-${g.w * 0.46} -6 C-${g.w * 0.4} 6 ${g.w * 0.4} 6 ${g.w * 0.46} -6 C${g.w * 0.4} -2 ${g.w * 0.3} 3 0 3 C-${g.w * 0.3} 3 -${g.w * 0.4} -2 -${g.w * 0.46} -6Z`, col)
        + part('M-20 0 C-22 -16 -18 -28 -10 -30 C-6 -28 -3 -24 0 -24 C3 -24 6 -28 10 -30 C18 -28 22 -16 20 0 Q0 4 -20 0Z', col)
        + part('M-20.5 -7 Q0 -3 20.5 -7 L20 0 Q0 4 -20 0Z', '#5A3A24')
        + line('M-3 -22 Q0 -14 3 -22', shade(col, -1.2), 1.6)
        + P('M8 -4 l1.4 -3 l1.4 3 l3.2 0.2 l-2.4 2 l0.8 3 l-3 -1.6 l-3 1.6 l0.8 -3 l-2.4 -2Z', { fill: GOLD, stroke: GOLD_D, 'stroke-width': 0.8, 'data-r': 'part' }));
    }
    case 'aureola': {
      const rx = Math.min(26, g.w * 0.2);
      const y = top - 14;
      return P(`M${100 - rx} ${y} A${rx} 6.5 0 1 0 ${100 + rx} ${y} A${rx} 6.5 0 1 0 ${100 - rx} ${y}Z M${100 - rx + 5} ${y} A${rx - 5} 3 0 1 0 ${100 + rx - 5} ${y} A${rx - 5} 3 0 1 0 ${100 - rx + 5} ${y}Z`, { fill: '#FFE37A', stroke: GOLD_D, 'stroke-width': 1.6, 'fill-rule': 'evenodd', 'data-r': 'part' })
        + line(`M${100 - rx * 0.6} ${y - 4.5} Q100 ${y - 6.5} ${100 + rx * 0.2} ${y - 5.5}`, '#FFFFFF', 1.6, { opacity: 0.8 });
    }
    case 'cachos': {
      const x = 100 - g.w * 0.17, y = g.topAt(x) + 5;
      const horn = G({ transform: T(x, y, g.tiltAt(x) * 0.6 - 4, sc) }, part('M-7 4 C-8 -6 -5 -15 2 -21 C1 -13 4 -5 7 4Z', '#E0384F', { stroke: '#7A1F2E' }) + line('M-4 -6 Q-2 -12 1 -16', '#FF8A9A', 1.4));
      return horn + mirrorX(horn);
    }
    case 'cuernos': {
      const x = 100 - g.w * 0.3, y = g.topAt(x) + 8;
      const horn = G({ transform: T(x, y, -8, sc * 1.3) },
        part('M6 4 C-2 -2 -12 -4 -20 2 C-28 8 -26 20 -18 22 C-12 23 -9 16 -13 13 C-16 11 -19 14 -18 16 C-23 12 -20 6 -14 4 C-8 2 -2 6 2 10Z', '#EADBC2', { stroke: '#7A6248' })
        + line('M-4 1 l-1 4 M-10 0 l0 4 M-16 3 l1.6 3.6', '#A78E70', 1.4));
      return horn + mirrorX(horn);
    }
    case 'cresta': {
      const col = c.punkColor;
      let s = '';
      [-2, -1, 0, 1, 2].forEach((k) => {
        const x = 100 + k * 7.5, y = g.topAt(x) + 5, h = 24 - Math.abs(k) * 5;
        s += part(`M${x - 5.5} ${y} L${x + k * 1.5} ${y - h} L${x + 5.5} ${y}Z`, k % 2 ? shade(col, -0.5) : col);
      });
      return s;
    }
    case 'flequillo': {
      const col = c.hairColor;
      return G({ transform: T(100, top + 2, 0, sc) },
        part('M-22 6 C-22 -6 -10 -12 2 -10 C14 -8 22 0 22 8 C14 2 8 2 4 6 C0 0 -6 0 -10 6 C-12 2 -18 2 -22 6Z', col)
        + line('M0 -10 C2 -20 12 -22 12 -14 C12 -9 6 -10 7 -14', OUT, 5.5) + line('M0 -10 C2 -20 12 -22 12 -14 C12 -9 6 -10 7 -14', col, 2.6)
        + line('M-14 -2 Q-8 -6 -2 -4', shade(col, 1.4), 1.6, { opacity: 0.8 }));
    }
    default: return '';
  }
}

// ── CUELLO ───────────────────────────────────────────────────────
function neck(id, g, c, clip) {
  const y = g.neckY;
  const L = g.l - 6, Rr = g.r + 6;
  const band = (th, sag, fill, extra = {}) => P(`M${L} ${y - th / 2} Q100 ${y - th / 2 + sag * 2} ${Rr} ${y - th / 2} L${Rr} ${y + th / 2} Q100 ${y + th / 2 + sag * 2} ${L} ${y + th / 2}Z`, { fill, stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part', ...extra });
  const clipped = (inner) => G({ 'clip-path': `url(#${clip})` }, inner);
  const sag = 5;
  const cy = y + sag; // centro de adelante
  switch (id) {
    case 'collar':
      return clipped(band(7, sag, c.collarColor)) + G({}, Cir(100, cy + 8, 6.6, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 2, 'data-r': 'part' })
        + line(`M95 ${cy + 8} H105`, GOLD_D, 1.5) + Cir(100, cy + 11, 1.5, { fill: GOLD_D, 'data-r': 'flat' }) + shine(97.6, cy + 5.4, 1.5));
    case 'pajarita': {
      const col = c.bowColor;
      return G({ transform: T(100, cy + 2, 0, 1) },
        part('M0 0 L-15 -8 Q-18 0 -15 8Z M0 0 L15 -8 Q18 0 15 8Z', col) + line('M-12 -4 L-7 -2 M12 -4 L7 -2', shade(col, -1), 1.4)
        + part('M-4 -4.5 h8 v9 h-8Z', shade(col, -0.5)));
    }
    case 'bufanda': {
      const col = c.scarfColor, st = c.scarfAlt;
      const id = nid('sp');
      const pat = E('pattern', { id, width: 10, height: 10, patternUnits: 'userSpaceOnUse' }, R(0, 0, 10, 10, { fill: col }) + R(0, 5, 10, 5, { fill: st }));
      const tx = 100 + g.w * 0.16;
      return E('defs', {}, pat) + clipped(band(15, sag, `url(#${id})`))
        + part(`M${tx - 8} ${cy + 3} C${tx - 10} ${cy + 16} ${tx - 9} ${cy + 26} ${tx - 7} ${cy + 33} L${tx + 9} ${cy + 33} C${tx + 9} ${cy + 24} ${tx + 9} ${cy + 12} ${tx + 8} ${cy}Z`, `url(#${id})`)
        + line(`M${tx - 5} ${cy + 34} v5 M${tx} ${cy + 34} v6 M${tx + 5} ${cy + 34} v5`, OUT, 2);
    }
    case 'panuelo': {
      const col = c.bowColor;
      const dots = [[-7, 6], [0, 12], [7, 6], [0, 2]].map(([dx, dy]) => Cir(100 + dx, cy + dy, 1.6, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'flat' })).join('');
      return clipped(band(5, sag, col)) + part(`M${100 - 17} ${cy - 2} L${100 + 17} ${cy - 2} L100 ${cy + 22}Z`, col) + dots
        + Cir(100, cy - 1, 4.4, { fill: shade(col, -0.5), stroke: OUT, 'stroke-width': 2, 'data-r': 'part' });
    }
    case 'medallon':
      return clipped(P(`M${L} ${y} Q100 ${y + sag * 2.4} ${Rr} ${y}`, { fill: 'none', stroke: '#5A4A3A', 'stroke-width': 2.2, 'data-r': 'line' }))
        + Cir(100, cy + 11, 8, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 2, 'data-r': 'part' })
        + P(`M100 ${cy + 15} C96 ${cy + 12} 96 ${cy + 8} 100 ${cy + 10} C104 ${cy + 8} 104 ${cy + 12} 100 ${cy + 15}Z`, { fill: '#E0384F', 'data-r': 'flat' }) + shine(97, cy + 7.5, 1.6);
    case 'lei': {
      let s = '';
      const n = Math.round(g.w / 13);
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = L + (Rr - L) * t;
        const yy = y + sag * 2 * (1 - Math.pow(2 * t - 1, 2)) - 1;
        s += flower(x, yy, 6, FLOWER_COLS[i % FLOWER_COLS.length], i);
      }
      return clipped(s);
    }
    case 'corbata': {
      const col = c.tieColor;
      return part(`M${100 - 5.5} ${cy - 3} h11 l-2 7 h-7Z`, shade(col, -0.5))
        + part(`M${100 - 3.5} ${cy + 4} h7 l4 22 l-7.5 7 l-7.5 -7Z`, col)
        + line(`M${100 - 4} ${cy + 12} l8 -3 M${100 - 5} ${cy + 20} l10 -3`, shade(col, 1.3), 1.6, { opacity: 0.85 });
    }
    case 'medalla': {
      const col = c.collarColor;
      return part(`M${100 - 16} ${cy - 6} L${100 - 4} ${cy + 10} L${100 + 4} ${cy + 10} L${100 + 16} ${cy - 6} L${100 + 9} ${cy - 6} L100 ${cy + 4} L${100 - 9} ${cy - 6}Z`, col)
        + Cir(100, cy + 17, 8.5, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 2, 'data-r': 'part' })
        + P(`M100 ${cy + 11.5} l1.7 3.6 l3.9 0.4 l-2.9 2.6 l0.9 3.9 l-3.6 -2 l-3.6 2 l0.9 -3.9 l-2.9 -2.6 l3.9 -0.4Z`, { fill: '#FFF1B8', 'data-r': 'flat' });
    }
    case 'capa': {
      const col = c.capeColor;
      return clipped(band(5, sag, col)) + part(`M${100 - 14} ${cy - 4} L${100 - 4} ${cy + 1} L${100 - 9} ${cy + 9}Z M${100 + 14} ${cy - 4} L${100 + 4} ${cy + 1} L${100 + 9} ${cy + 9}Z`, shade(col, -0.4))
        + Cir(100, cy, 5, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 2, 'data-r': 'part' }) + shine(98.3, cy - 1.8, 1.4);
    }
    case 'choker':
      return clipped(band(5, sag, '#221C27')) + P(`M100 ${cy + 11} C95 ${cy + 7} 95 ${cy + 2} 100 ${cy + 5} C105 ${cy + 2} 105 ${cy + 7} 100 ${cy + 11}Z`, { fill: '#D9364F', stroke: '#5A1220', 'stroke-width': 1.6, 'data-r': 'part' })
        + line(`M100 ${cy + 1} V${cy + 4}`, SILVER_D, 1.6);
    case 'cadena': {
      let s = '';
      const n = Math.round(g.w / 7);
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = L + (Rr - L) * t;
        const yy = y + sag * 2 * (1 - Math.pow(2 * t - 1, 2));
        s += Ell(x, yy, i % 2 ? 4.2 : 1.8, i % 2 ? 2.2 : 3.2, { fill: 'none', stroke: SILVER_D, 'stroke-width': 3.6, 'data-r': 'line' }) + Ell(x, yy, i % 2 ? 4.2 : 1.8, i % 2 ? 2.2 : 3.2, { fill: 'none', stroke: SILVER, 'stroke-width': 1.8, 'data-r': 'line' });
      }
      return clipped(s) + part(`M${100 - 6} ${cy + 6} h12 v10 q0 2 -2 2 h-8 q-2 0 -2 -2Z`, SILVER, { stroke: SILVER_D })
        + line(`M${100 - 3.5} ${cy + 6} v-3 a3.5 3.5 0 0 1 7 0 v3`, SILVER_D, 2.2) + Cir(100, cy + 11, 1.4, { fill: SILVER_D, 'data-r': 'flat' });
    }
    case 'pinchos': {
      let spikes = '';
      const n = Math.round(g.w / 15);
      for (let i = 1; i < n; i++) {
        const t = i / n, x = L + (Rr - L) * t;
        const yy = y + 4 + sag * 2 * (1 - Math.pow(2 * t - 1, 2));
        spikes += P(`M${x - 3.2} ${yy - 1} L${x} ${yy + 6} L${x + 3.2} ${yy - 1}Z`, { fill: SILVER, stroke: SILVER_D, 'stroke-width': 1.3, 'stroke-linejoin': 'round', 'data-r': 'part' });
      }
      return clipped(band(8, sag, '#221C27') + spikes);
    }
    default: return '';
  }
}

function neckBack(id, g, c) {
  if (id !== 'capa') return '';
  // Capa de héroe que vuela hacia un costado: se lee como capa aunque la
  // mochi no tenga hombros.
  const y = g.neckY - 6, col = c.capeColor, lin = shade(col, 1.4);
  const d = `M${g.l + 10} ${y} C${g.l - 4} ${y + 12} ${g.l - 8} ${y + 26} ${g.l - 6} ${y + 34} C${100} ${y + 40} ${g.r + 10} ${y + 30} ${g.r + 34} ${y + 22} C${g.r + 30} ${y + 14} ${g.r + 36} ${y + 6} ${g.r + 42} ${y - 4} C${g.r + 30} ${y - 4} ${g.r + 20} ${y - 10} ${g.r + 12} ${y - 18} C${g.r} ${y - 8} ${g.r - 10} ${y - 2} ${g.r - 14} ${y}Z`;
  return part(d, col) + line(`M${g.r + 4} ${y + 22} C${g.r + 16} ${y + 16} ${g.r + 24} ${y + 8} ${g.r + 30} ${y - 2}`, lin, 1.8, { opacity: 0.8 });
}

// ── CARA ─────────────────────────────────────────────────────────
function faceAcc(id, g, c, e) {
  const L = 100 - e.dx, Rx = 100 + e.dx, y = e.y;
  switch (id) {
    case 'lentes': {
      const r = 11, col = '#3A2A3E';
      return Cir(L, y, r, { fill: '#DFF4FF', 'fill-opacity': 0.25, stroke: col, 'stroke-width': 2.6, 'data-r': 'part' })
        + Cir(Rx, y, r, { fill: '#DFF4FF', 'fill-opacity': 0.25, stroke: col, 'stroke-width': 2.6, 'data-r': 'part' })
        + line(`M${L + r} ${y - 1} Q100 ${y - 5} ${Rx - r} ${y - 1}`, col, 2.4)
        + line(`M${L - r * 0.45} ${y - r * 0.4} l3.5 -3 M${Rx - r * 0.45} ${y - r * 0.4} l3.5 -3`, '#FFFFFF', 1.8, { opacity: 0.9 });
    }
    case 'gafasol': {
      const lens = (x) => `M${x - 11} ${y - 7} Q${x - 11} ${y - 8} ${x - 9} ${y - 8} L${x + 9} ${y - 8} Q${x + 11} ${y - 8} ${x + 11} ${y - 6} Q${x + 10} ${y + 8} ${x} ${y + 8} Q${x - 10} ${y + 8} ${x - 11} ${y - 7}Z`;
      return part(lens(L), '#2A2230', { 'stroke-width': 2.4 }) + part(lens(Rx), '#2A2230', { 'stroke-width': 2.4 })
        + line(`M${L + 11} ${y - 6} Q100 ${y - 9} ${Rx - 11} ${y - 6}`, OUT, 2.4)
        + line(`M${L - 7} ${y - 3} l6 -3 M${L - 6} ${y + 2} l3 -1.5 M${Rx - 7} ${y - 3} l6 -3`, '#FFFFFF', 1.8, { opacity: 0.75 });
    }
    case 'antifaz': {
      const w = e.dx + 15, col = c.maskColor;
      const d = `M${100 - w} ${y - 4} C${100 - w} ${y - 13} ${100 - 6} ${y - 11} 100 ${y - 7} C${100 + 6} ${y - 11} ${100 + w} ${y - 13} ${100 + w} ${y - 4} C${100 + w} ${y + 8} ${100 + 6} ${y + 9} 100 ${y + 4} C${100 - 6} ${y + 9} ${100 - w} ${y + 8} ${100 - w} ${y - 4}Z`
        + `M${L - 8} ${y} C${L - 8} ${y - 8} ${L + 8} ${y - 8} ${L + 8} ${y} C${L + 8} ${y + 7} ${L - 8} ${y + 7} ${L - 8} ${y}Z`
        + `M${Rx - 8} ${y} C${Rx - 8} ${y - 8} ${Rx + 8} ${y - 8} ${Rx + 8} ${y} C${Rx + 8} ${y + 7} ${Rx - 8} ${y + 7} ${Rx - 8} ${y}Z`;
      return P(d, { fill: col, 'fill-rule': 'evenodd', stroke: OUT, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'data-r': 'part' });
    }
    case 'curita': {
      const x = 100 - g.face.cheekDx + 2, yy = g.face.cheekY + 2;
      return G({ transform: T(x, yy, -28, 1) }, part('M-9 -4 h18 a4 4 0 0 1 0 8 h-18 a4 4 0 0 1 0 -8Z', '#F6C9A0', { stroke: '#9A6A48', 'stroke-width': 1.6 })
        + flat('M-3.5 -4 h7 v8 h-7Z', '#FFE3C8') + [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]].map(([dx, dy]) => Cir(dx, dy, 0.7, { fill: '#C49470', 'data-r': 'flat' })).join(''));
    }
    case 'brillos': {
      const star = (x, yy, r) => P(`M${x} ${yy - r} Q${x + r * 0.18} ${yy - r * 0.18} ${x + r} ${yy} Q${x + r * 0.18} ${yy + r * 0.18} ${x} ${yy + r} Q${x - r * 0.18} ${yy + r * 0.18} ${x - r} ${yy} Q${x - r * 0.18} ${yy - r * 0.18} ${x} ${yy - r}Z`, { fill: '#FFF3A8', stroke: '#C9A227', 'stroke-width': 1, 'data-r': 'part' });
      return star(g.l + 4, g.top + 20, 6) + star(g.r - 2, g.top + 8, 4.5) + star(g.r + 4, g.top + 34, 3.5) + star(g.l - 2, g.top + 42, 3);
    }
    case 'parche':
      return line(`M${Rx + 8} ${y - 6} L${g.r - 2} ${g.topAt(g.r - 14) + 6} M${Rx - 8} ${y - 7} L${100 - g.w * 0.22} ${g.topAt(100 - g.w * 0.22) + 2}`, '#221C27', 2.4)
        + part(`M${Rx - 10} ${y - 6} Q${Rx} ${y - 11} ${Rx + 10} ${y - 6} Q${Rx + 10} ${y + 9} ${Rx} ${y + 10} Q${Rx - 10} ${y + 9} ${Rx - 10} ${y - 6}Z`, '#221C27');
    case 'piercings': {
      const x = g.l + 6, yy = g.ys - 26;
      return Ell(x, yy, 3.8, 4.4, { fill: 'none', stroke: SILVER_D, 'stroke-width': 3.4, 'data-r': 'line' }) + Ell(x, yy, 3.8, 4.4, { fill: 'none', stroke: SILVER, 'stroke-width': 1.7, 'data-r': 'line' })
        + Ell(x + 2, yy + 9, 3.2, 3.8, { fill: 'none', stroke: SILVER_D, 'stroke-width': 3.2, 'data-r': 'line' }) + Ell(x + 2, yy + 9, 3.2, 3.8, { fill: 'none', stroke: SILVER, 'stroke-width': 1.6, 'data-r': 'line' })
        + Cir(100 + 9, g.face.mouthY + 3, 1.8, { fill: SILVER, stroke: SILVER_D, 'stroke-width': 1, 'data-r': 'part' });
    }
    default: return '';
  }
}

function faceUnder(id, g, c, e) {
  const L = 100 - e.dx, Rx = 100 + e.dx, y = e.y;
  switch (id) {
    case 'pecas': {
      const dots = (x, s) => [[0, 0], [s * 4, -2.4], [s * 5, 2.6], [s * 1, 4]].map(([dx, dy]) => Cir(x + dx, g.face.cheekY + dy - 1, 1.15, { fill: '#9A5A3E', opacity: 0.85, 'data-r': 'flat' })).join('');
      return dots(L - 6, -1) + dots(Rx + 6, 1);
    }
    case 'lunar':
      return Cir(100 + 13, g.face.mouthY - 1, 1.8, { fill: '#3A2A3E', 'data-r': 'flat' });
    case 'lagrima':
      return P(`M${L - 3} ${y + 11} q-3 5.5 0 8 q3 -2.5 0 -8z`, { fill: 'none', stroke: '#3A2A3E', 'stroke-width': 1.5, 'data-r': 'line' });
    case 'eyeblack':
      return [L, Rx].map((x) => P(`M${x - 7} ${y + 11} h14 v4.5 h-14Z`, { fill: '#221C27', 'data-r': 'flat' })).join('');
    case 'corpse': {
      const ink = '#1D1720';
      return [[L, -1], [Rx, 1]].map(([x, s]) => P(`M${x - 11} ${y - 9} L${x + 11} ${y - 9} L${x + s * 2} ${y + 14} Q${x} ${y + 9} ${x - s * 2} ${y + 14}Z`, { fill: ink, 'data-r': 'flat' })).join('')
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
