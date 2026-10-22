// Colas (asoman por atrás, a la derecha) y estampados (recortados a la
// silueta y sin tapar la cara).

import { G, P, Ell, Cir, E } from '../svg';
import { parseColor, hex, ramp } from '../color';

const shade = (c, k) => hex(ramp(parseColor(c), k));
const OUT = '#3A2A3E';

export const TAILS = [
  { id: 'ninguna', label: 'Sin cola' },
  { id: 'gato', label: 'De gatito' },
  { id: 'esponjosa', label: 'Esponjosa' },
  { id: 'corta', label: 'Pompón' },
  { id: 'rizada', label: 'Enroscada' },
  { id: 'lazo', label: 'Con lacito' },
  { id: 'demonio', label: 'De diablito' },
  { id: 'puas', label: 'De dragón' },
];

// Una cola de "tubo": contorno grueso + relleno, con punta opcional.
const tube = (d, fill, w = 9) => P(d, { fill: 'none', stroke: OUT, 'stroke-width': w + 5, 'stroke-linecap': 'round', 'data-r': 'line' })
  + P(d, { fill: 'none', stroke: fill, 'stroke-width': w, 'stroke-linecap': 'round', 'data-r': 'line' });

export function renderTail(id, g, c) {
  const x = g.r, y = g.tail.y;
  switch (id) {
    case 'gato':
      return tube(`M${x - 6} ${y + 10} C${x + 18} ${y + 12} ${x + 22} ${y - 10} ${x + 12} ${y - 18} C${x + 7} ${y - 22} ${x + 12} ${y - 30} ${x + 18} ${y - 28}`, c.body)
        + Cir(x + 18, y - 28, 4.6, { fill: c.accent, 'data-r': 'flat' });
    case 'esponjosa': {
      const d = `M${x - 8} ${y + 14} C${x + 22} ${y + 20} ${x + 36} ${y - 4} ${x + 28} ${y - 30} C${x + 24} ${y - 42} ${x + 12} ${y - 44} ${x + 8} ${y - 36} C${x + 18} ${y - 22} ${x + 12} ${y - 2} ${x - 8} ${y + 2}Z`;
      const id2 = `te${Math.round(x * 7)}`;
      return E('clipPath', { id: id2 }, P(d)) + P(d, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + G({ 'clip-path': `url(#${id2})` }, Ell(x + 18, y - 40, 16, 12, { fill: c.tailTip, 'data-r': 'flat' }));
    }
    case 'corta':
      return Cir(x + 4, y + 2, 11, { fill: c.tailTip, stroke: OUT, 'stroke-width': 2.6, 'data-r': 'part' });
    case 'rizada':
      return tube(`M${x - 4} ${y + 6} C${x + 12} ${y + 8} ${x + 16} ${y - 6} ${x + 8} ${y - 8} C${x + 2} ${y - 9} ${x + 2} ${y - 1} ${x + 8} ${y - 1}`, c.body, 6);
    case 'lazo':
      return tube(`M${x - 6} ${y + 10} C${x + 16} ${y + 12} ${x + 22} ${y - 8} ${x + 14} ${y - 22}`, c.body)
        + G({ transform: `translate(${x + 15} ${y - 6}) rotate(-20) scale(0.6)` },
          P('M0 0 C-6 -10 -20 -11 -20 -1 C-20 9 -7 8 0 0Z M0 0 C6 -10 20 -11 20 -1 C20 9 7 8 0 0Z', { fill: c.accent, stroke: OUT, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-r': 'part' })
          + Cir(0, 0, 4.6, { fill: shade(c.accent, 0.6), stroke: OUT, 'stroke-width': 2.6, 'data-r': 'part' }));
    case 'demonio':
      return tube(`M${x - 6} ${y + 10} C${x + 14} ${y + 14} ${x + 22} ${y - 6} ${x + 20} ${y - 20}`, c.devil, 5)
        + P(`M${x + 20} ${y - 32} L${x + 28} ${y - 18} L${x + 20} ${y - 14} L${x + 12} ${y - 18}Z`, { fill: c.devil, stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' });
    case 'puas': {
      const d = `M${x - 6} ${y + 16} C${x + 18} ${y + 18} ${x + 32} ${y + 4} ${x + 38} ${y - 12} C${x + 30} ${y - 2} ${x + 16} ${y + 2} ${x - 4} ${y + 2}Z`;
      const sp = [[x + 8, y + 2], [x + 18, y], [x + 28, y - 5]].map(([sx, sy]) => P(`M${sx - 5} ${sy + 1} L${sx} ${sy - 9} L${sx + 5} ${sy}Z`, { fill: c.accent, stroke: OUT, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'data-r': 'part' })).join('');
      return sp + P(d, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' });
    }
    default: return '';
  }
}

export const PATTERNS = [
  { id: 'ninguno', label: 'Liso' },
  { id: 'manchas', label: 'Manchas' },
  { id: 'rayas', label: 'Rayas' },
  { id: 'lunares', label: 'Lunares' },
  { id: 'estrellas', label: 'Estrellas' },
  { id: 'corazones', label: 'Corazones' },
  { id: 'flores', label: 'Flores' },
  { id: 'calaveras', label: 'Calaveritas' },
  { id: 'cuadros', label: 'Cuadros' },
  { id: 'tiedye', label: 'Tie-dye' },
  { id: 'leopardo', label: 'Leopardo' },
  { id: 'camuflaje', label: 'Camuflaje' },
  { id: 'rayos', label: 'Rayos' },
];

const star = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.48 : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; }
  return `${d}Z`;
};
const heart = (x, y, s) => `M${x} ${y + s * 0.85} C${x - s * 1.1} ${y + s * 0.1} ${x - s * 1.05} ${y - s * 0.95} ${x} ${y - s * 0.35} C${x + s * 1.05} ${y - s * 0.95} ${x + s * 1.1} ${y + s * 0.1} ${x} ${y + s * 0.85}Z`;

// Puntos repartidos sobre el cuerpo, salteando la cara y la panza.
function spots(g, step, jitter = 0.35) {
  const pts = [];
  let row = 0;
  for (let y = g.top + step * 0.45; y < 182 - 6; y += step * 0.86, row++) {
    for (let x = g.l + (row % 2 ? step * 0.5 : 0); x < g.r; x += step) {
      const jx = Math.sin(x * 12.9898 + y * 78.233) * step * jitter, jy = Math.cos(x * 4.1 + y * 9.7) * step * jitter;
      const px = x + jx, py = y + jy;
      const fx = (px - 100) / (g.face.dx + 17), fy = (py - (g.face.y + 6)) / 22;
      if (fx * fx + fy * fy < 1) continue;
      const bx = (px - 100) / (g.belly.rx + 3), by = (py - g.belly.cy) / (g.belly.ry + 3);
      if (bx * bx + by * by < 1) continue;
      pts.push([px, py]);
    }
  }
  return pts;
}

export function renderPattern(id, g, c) {
  if (!id || id === 'ninguno') return '';
  const a = c.accent, b = c.accentAlt;
  const fl = (d, fill, o = {}) => P(d, { fill, 'data-r': 'flat', ...o });
  let s = '';
  switch (id) {
    case 'manchas':
      s = spots(g, 44, 0.3).map(([x, y], i) => fl(`M${x - 11} ${y} C${x - 12} ${y - 9} ${x - 2} ${y - 12} ${x + 5} ${y - 9} C${x + 13} ${y - 6} ${x + 12} ${y + 6} ${x + 4} ${y + 8} C${x - 4} ${y + 11} ${x - 10} ${y + 7} ${x - 11} ${y}Z`, i % 3 === 2 ? b : a)).join('');
      break;
    case 'rayas':
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const x = 100 + i * g.w * 0.14;
        s += fl(`M${x - 3.5} ${g.topAt(x) - 4} Q${x + i * 1.5} ${g.topAt(x) + 14} ${x + 1} ${g.topAt(x) + 22} L${x + 3.5} ${g.topAt(x) - 4}Z`, a);
      }
      s += fl(`M96.5 ${g.top - 4} L98.5 ${g.top + 14} L101.5 ${g.top + 14} L103.5 ${g.top - 4}Z`, a);
      break;
    case 'lunares':
      s = spots(g, 26, 0.12).map(([x, y]) => Cir(x, y, 4.2, { fill: a, 'data-r': 'flat' })).join('');
      break;
    case 'estrellas':
      s = spots(g, 30, 0.25).map(([x, y], i) => fl(star(x, y, 5.5), i % 2 ? a : b)).join('');
      break;
    case 'corazones':
      s = spots(g, 30, 0.25).map(([x, y], i) => fl(heart(x, y, 5), i % 2 ? a : b)).join('');
      break;
    case 'flores':
      s = spots(g, 32, 0.25).map(([x, y], i) => [0, 72, 144, 216, 288].map((k) => Cir(x + Math.cos(k * Math.PI / 180) * 3.6, y + Math.sin(k * Math.PI / 180) * 3.6, 3, { fill: i % 2 ? a : b, 'data-r': 'flat' })).join('') + Cir(x, y, 2.2, { fill: '#FFE070', 'data-r': 'flat' })).join('');
      break;
    case 'calaveras':
      s = spots(g, 32, 0.2).map(([x, y]) => fl(`M${x - 5} ${y + 1} C${x - 6} ${y - 7} ${x + 6} ${y - 7} ${x + 5} ${y + 1} L${x + 3.5} ${y + 2} L${x + 3.5} ${y + 5} L${x - 3.5} ${y + 5} L${x - 3.5} ${y + 2}Z`, '#F4F0EA')
        + Cir(x - 2, y - 1.5, 1.4, { fill: '#2A2230', 'data-r': 'flat' }) + Cir(x + 2, y - 1.5, 1.4, { fill: '#2A2230', 'data-r': 'flat' })).join('');
      break;
    case 'cuadros':
      for (let x = g.l; x < g.r; x += 22) s += E('rect', { x, y: g.top - 4, width: 8, height: 190 - g.top, fill: a, opacity: 0.55, 'data-r': 'tone' });
      for (let y = g.top + 4; y < 182; y += 22) s += E('rect', { x: g.l - 4, y, width: g.w + 8, height: 8, fill: a, opacity: 0.55, 'data-r': 'tone' });
      s += P(`M${g.l} ${g.face.y - 22} H${g.r} V${g.face.y + 22} H${g.l}Z`, { fill: 'none' });
      break;
    case 'tiedye': {
      const cols = [a, b, c.inner, a];
      s = [[g.l + g.w * 0.22, g.top + 22, 30], [g.r - g.w * 0.2, g.top + 34, 26], [g.l + g.w * 0.12, 166, 22], [g.r - g.w * 0.1, 168, 20]]
        .map(([x, y, r], i) => [1, 0.66, 0.33].map((k, j) => Cir(x, y, r * k, { fill: cols[(i + j) % cols.length], opacity: 0.75, 'data-r': 'tone' })).join('')).join('');
      break;
    }
    case 'leopardo':
      s = spots(g, 28, 0.3).map(([x, y]) => fl(`M${x - 6} ${y - 2} C${x - 5} ${y - 7} ${x + 3} ${y - 7} ${x + 6} ${y - 3} M${x + 6} ${y + 2} C${x + 4} ${y + 6} ${x - 3} ${y + 7} ${x - 6} ${y + 3}`, 'none', { stroke: a, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'data-r': 'line' })
        + Ell(x, y, 2.6, 2.2, { fill: b === '#FFFFFF' ? a : b, opacity: 0.8, 'data-r': 'flat' })).join('');
      break;
    case 'camuflaje':
      s = spots(g, 34, 0.4).map(([x, y], i) => fl(`M${x - 12} ${y} C${x - 10} ${y - 9} ${x + 2} ${y - 8} ${x + 6} ${y - 4} C${x + 13} ${y - 3} ${x + 12} ${y + 7} ${x + 3} ${y + 6} C${x - 5} ${y + 9} ${x - 12} ${y + 6} ${x - 12} ${y}Z`, [a, b, shade(c.body, -1.4)][i % 3])).join('');
      break;
    case 'rayos':
      s = spots(g, 34, 0.25).map(([x, y], i) => fl(`M${x + 1} ${y - 8} L${x - 4} ${y + 1} L${x} ${y + 1} L${x - 2} ${y + 8} L${x + 5} ${y - 2} L${x + 1} ${y - 2}Z`, i % 2 ? a : '#FFD23F')).join('');
      break;
    default: break;
  }
  const id2 = `pt${Math.round(g.w * 3)}${id.length}`;
  return E('clipPath', { id: id2 }, P(g.path)) + G({ 'clip-path': `url(#${id2})` }, s);
}
