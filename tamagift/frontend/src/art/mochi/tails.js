// Colas (asoman por atrás, a la derecha) y estampados (recortados a la
// silueta y sin tapar la cara).

import { G, P, Ell, Cir, E } from '../svg.js';
import { parseColor, hex, ramp } from '../color.js';

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
  { id: 'sirena', label: 'De sirena' },
  { id: 'ardilla', label: 'De ardilla' },
  { id: 'leon', label: 'De leoncito' },
  { id: 'corazon', label: 'Con corazón' },
];

// Cola de "tubo" como FORMA llena (no como trazo): así el pixel le da su
// luz y su sombra como a cualquier pieza. La línea del medio pasa por los
// puntos (curva suave) y el grosor va de w0 a w1 (punta redonda).
function centerline(pts, n = 40) {
  const out = [];
  const seg = pts.length - 1;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * seg, k = Math.min(seg - 1, Math.floor(u)), t = u - k;
    const p0 = pts[k - 1] || pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] || p2;
    const tt = t * t, ttt = tt * t;
    const q = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * tt + (-a + 3 * b - 3 * c + d) * ttt);
    out.push([q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}
function tubeD(pts, w0, w1) {
  const c = centerline(pts);
  const L = [], Rr = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const w = (w0 + (w1 - w0) * (i / (c.length - 1))) / 2;
    L.push([c[i][0] + nx * w, c[i][1] + ny * w]);
    Rr.push([c[i][0] - nx * w, c[i][1] - ny * w]);
  }
  // punta redonda
  const e = c[c.length - 1], p = c[c.length - 2];
  const ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
  const cap = [];
  for (let k = 1; k < 6; k++) { const th = ang + Math.PI / 2 - (Math.PI * k) / 6; cap.push([e[0] + Math.cos(th) * w1 / 2, e[1] + Math.sin(th) * w1 / 2]); }
  const all = [...L, ...cap, ...Rr.reverse()];
  return `M${all.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;
}
const tube = (pts, fill, w0 = 10, w1 = 8, extra = {}) => P(tubeD(pts, w0, w1), { fill, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part', ...extra });
const tone = (d, op = 0.14) => P(d, { fill: '#3A2A3E', opacity: op, 'data-r': 'tone' });
let tid = 0;

export function renderTail(id, g, c) {
  const x = g.r, y = g.tail.y;
  switch (id) {
    case 'gato': {
      // cola de gato que sube en S y dobla la punta, con la punta de color
      const pts = [[x - 8, y + 10], [x + 10, y + 9], [x + 19, y - 4], [x + 14, y - 18], [x + 15, y - 29], [x + 23, y - 33]];
      const id2 = `tg${++tid}`;
      const d = tubeD(pts, 15, 12);
      return E('clipPath', { id: id2 }, P(d)) + P(d, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + G({ 'clip-path': `url(#${id2})` }, Cir(x + 22, y - 33, 9, { fill: c.accent, 'data-r': 'flat' }));
    }
    case 'esponjosa': {
      // cola de zorro: gorda, con un mechón en el borde y la punta clara
      const d = `M${x - 8} ${y + 14} C${x + 22} ${y + 20} ${x + 38} ${y - 4} ${x + 30} ${y - 30} C${x + 27} ${y - 40} ${x + 19} ${y - 46} ${x + 11} ${y - 43} C${x + 13} ${y - 40} ${x + 9} ${y - 38} ${x + 7} ${y - 37} C${x + 17} ${y - 24} ${x + 13} ${y - 6} ${x + 2} ${y - 1} C${x} ${y + 1} ${x - 4} ${y + 1} ${x - 8} ${y + 2}Z`;
      const id2 = `te${++tid}`;
      return E('clipPath', { id: id2 }, P(d)) + P(d, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + G({ 'clip-path': `url(#${id2})` }, P(`M${x + 2} ${y - 34} C${x + 12} ${y - 30} ${x + 26} ${y - 30} ${x + 40} ${y - 36} L${x + 40} ${y - 52} L${x + 2} ${y - 52}Z`, { fill: c.tailTip, 'data-r': 'flat' })
          + tone(`M${x + 2} ${y - 1} C${x + 14} ${y - 6} ${x + 18} ${y - 22} ${x + 10} ${y - 36} L${x + 4} ${y - 34} C${x + 10} ${y - 22} ${x + 8} ${y - 8} ${x - 6} ${y + 2}Z`, 0.12))
        + P(`M${x + 8} ${y + 8} C${x + 22} ${y + 4} ${x + 28} ${y - 10} ${x + 26} ${y - 22}`, { fill: 'none', stroke: shade(c.body, -0.9), 'stroke-width': 2.2, 'stroke-linecap': 'round', 'data-r': 'line', opacity: 0.7 });
    }
    case 'corta': {
      // pompón de conejo: una bolita festoneada, esponjosa, con su brillo
      const cx = x + 4, cy = y + 1, r = 11;
      let d = '';
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const th = (i / n) * Math.PI * 2;
        const px = cx + r * Math.cos(th), py = cy + r * Math.sin(th);
        if (!i) { d += `M${px.toFixed(1)} ${py.toFixed(1)}`; continue; }
        const tm = ((i - 0.5) / n) * Math.PI * 2;
        d += `Q${(cx + (r + 4) * Math.cos(tm)).toFixed(1)} ${(cy + (r + 4) * Math.sin(tm)).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
      return P(`${d}Z`, { fill: c.tailTip, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + Ell(cx - 3.5, cy - 4, 3.6, 2.4, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'shine' });
    }
    case 'rizada': {
      // colita de chancho: un resorte de una vuelta y media
      const pts = [[x - 6, y + 6], [x + 8, y + 7], [x + 15, y], [x + 13, y - 8], [x + 6, y - 9], [x + 4, y - 3], [x + 10, y], [x + 17, y - 6], [x + 21, y - 12]];
      return tube(pts, c.body, 10, 8.5);
    }
    case 'lazo':
      return tube([[x - 8, y + 10], [x + 10, y + 9], [x + 19, y - 4], [x + 16, y - 21]], c.body, 13, 11)
        + G({ transform: `translate(${x + 18} ${y - 8}) rotate(-20) scale(0.95)` },
          P('M-3 3 L-8 14 L-3 12 L0 15Z M3 3 L8 14 L3 12 L0 15Z', { fill: shade(c.accent, -0.5), stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' })
          + P('M0 0 C-6 -10 -20 -11 -20 -1 C-20 9 -7 8 0 0Z M0 0 C6 -10 20 -11 20 -1 C20 9 7 8 0 0Z', { fill: c.accent, stroke: OUT, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-r': 'part' })
          + Cir(0, 0, 4.6, { fill: shade(c.accent, 0.6), stroke: OUT, 'stroke-width': 2.6, 'data-r': 'part' }));
    case 'demonio':
      return tube([[x - 8, y + 10], [x + 10, y + 11], [x + 20, y - 2], [x + 20, y - 18]], c.devil, 10, 8)
        + P(`M${x + 20} ${y - 33} L${x + 29} ${y - 18} L${x + 20} ${y - 13} L${x + 11} ${y - 18}Z`, { fill: c.devil, stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + P(`M${x + 20} ${y - 28} L${x + 16} ${y - 19} L${x + 19} ${y - 19}Z`, { fill: '#FFFFFF', opacity: 0.55, 'data-r': 'shine' });
    case 'puas': {
      // cola de dragón: gorda en la base, se afina y sube; púas en el lomo
      const pts = [[x - 8, y + 12], [x + 12, y + 12], [x + 28, y + 2], [x + 38, y - 14]];
      const sp = [[x + 8, y + 5, 0], [x + 19, y + 1, 18], [x + 29, y - 6, 35]].map(([sx, sy, a]) => G({ transform: `translate(${sx} ${sy}) rotate(${a})` },
        P('M-5.5 2 L0 -10 L5.5 2Z', { fill: c.accent, stroke: OUT, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'data-r': 'part' }))).join('');
      return sp + tube(pts, c.body, 18, 7)
        + P(`M${x - 4} ${y + 15} C${x + 12} ${y + 16} ${x + 26} ${y + 8} ${x + 34} ${y - 4}`, { fill: 'none', stroke: c.inner, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-r': 'line', opacity: 0.9 });
    }
    case 'sirena': {
      // aleta de sirena: el tronco que sube y dos lóbulos que se abren
      const col = c.accent;
      const id2 = `ts${++tid}`;
      const d = `M${x - 8} ${y + 14} C${x + 6} ${y + 16} ${x + 14} ${y + 6} ${x + 17} ${y - 4} C${x + 20} ${y - 14} ${x + 26} ${y - 24} ${x + 36} ${y - 27} C${x + 32} ${y - 16} ${x + 31} ${y - 8} ${x + 41} ${y + 1} C${x + 30} ${y + 2} ${x + 22} ${y + 8} ${x + 12} ${y + 16} C${x + 4} ${y + 19} ${x - 2} ${y + 19} ${x - 8} ${y + 19}Z`;
      return E('clipPath', { id: id2 }, P(d)) + P(d, { fill: col, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + G({ 'clip-path': `url(#${id2})` }, P(`M${x + 18} ${y - 3} L${x + 33} ${y - 22} L${x + 35} ${y - 20} L${x + 21} ${y - 1}Z M${x + 20} ${y + 2} L${x + 38} ${y - 1} L${x + 38} ${y + 2} L${x + 21} ${y + 5}Z`, { fill: shade(col, 0.8), 'data-r': 'flat', opacity: 0.9 })
          + P(`M${x - 8} ${y + 8} C${x + 4} ${y + 10} ${x + 9} ${y + 4} ${x + 11} ${y} L${x + 30} ${y + 30} L${x - 8} ${y + 30}Z`, { fill: shade(col, -0.5), 'data-r': 'flat', opacity: 0.5 }));
    }
    case 'ardilla': {
      const d = `M${x - 8} ${y + 14} C${x + 28} ${y + 22} ${x + 44} ${y - 8} ${x + 32} ${y - 38} C${x + 26} ${y - 56} ${x + 4} ${y - 56} ${x + 6} ${y - 40} C${x + 16} ${y - 38} ${x + 22} ${y - 26} ${x + 15} ${y - 13} C${x + 9} ${y - 3} ${x - 2} ${y + 2} ${x - 8} ${y + 2}Z`;
      const id2 = `ta${++tid}`;
      return E('clipPath', { id: id2 }, P(d)) + P(d, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + G({ 'clip-path': `url(#${id2})` }, Ell(x + 16, y - 50, 16, 12, { fill: c.tailTip, 'data-r': 'flat' })
          + tone(`M${x + 15} ${y - 13} C${x + 22} ${y - 26} ${x + 16} ${y - 38} ${x + 6} ${y - 40} L${x + 8} ${y - 34} C${x + 14} ${y - 30} ${x + 16} ${y - 22} ${x + 10} ${y - 12}Z`, 0.12))
        + P(`M${x + 6} ${y + 6} C${x + 26} ${y + 2} ${x + 32} ${y - 18} ${x + 26} ${y - 34}`, { fill: 'none', stroke: shade(c.body, -0.8), 'stroke-width': 2.2, 'stroke-linecap': 'round', 'data-r': 'line', opacity: 0.7 });
    }
    case 'leon':
      return tube([[x - 8, y + 10], [x + 10, y + 11], [x + 19, y - 2], [x + 20, y - 16]], c.body, 11, 9)
        + P(`M${x + 20} ${y - 31} C${x + 12} ${y - 27} ${x + 12} ${y - 17} ${x + 15} ${y - 14} C${x + 17} ${y - 16} ${x + 18} ${y - 14} ${x + 20} ${y - 12} C${x + 22} ${y - 14} ${x + 23} ${y - 16} ${x + 25} ${y - 14} C${x + 28} ${y - 17} ${x + 28} ${y - 27} ${x + 20} ${y - 31}Z`, { fill: shade(c.accent, -0.6), stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' });
    case 'corazon': {
      const hx = x + 20, hy = y - 23, s2 = 9;
      return tube([[x - 8, y + 10], [x + 10, y + 11], [x + 19, y - 2], [x + 20, y - 14]], c.body, 11, 9)
        + P(`M${hx} ${hy + s2 * 0.85} C${hx - s2 * 1.1} ${hy + s2 * 0.1} ${hx - s2 * 1.05} ${hy - s2 * 0.95} ${hx} ${hy - s2 * 0.35} C${hx + s2 * 1.05} ${hy - s2 * 0.95} ${hx + s2 * 1.1} ${hy + s2 * 0.1} ${hx} ${hy + s2 * 0.85}Z`, { fill: c.accent, stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + Ell(hx - 3.2, hy - 2.6, 2, 1.4, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'shine' });
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
  { id: 'vaca', label: 'Vaquita' },
  { id: 'galaxia', label: 'Galaxia' },
  { id: 'degrade', label: 'Degradé' },
  { id: 'fresa', label: 'Fresita' },
  { id: 'sakura', label: 'Sakura' },
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
      s = spots(g, 29, 0.12).map(([x, y]) => Cir(x, y, 5, { fill: a, 'data-r': 'flat' })).join('');
      break;
    case 'estrellas':
      s = spots(g, 38, 0.22).map(([x, y], i) => fl(star(x, y, 7.6), i % 2 ? a : b)).join('');
      break;
    case 'corazones':
      s = spots(g, 38, 0.22).map(([x, y], i) => fl(heart(x, y, 6.8), i % 2 ? a : b)).join('');
      break;
    case 'flores':
      s = spots(g, 40, 0.22).map(([x, y], i) => [0, 72, 144, 216, 288].map((k) => Cir(x + Math.cos((k - 90) * Math.PI / 180) * 4.8, y + Math.sin((k - 90) * Math.PI / 180) * 4.8, 3.9, { fill: i % 2 ? a : b, 'data-r': 'flat' })).join('') + Cir(x, y, 2.8, { fill: '#FFE070', 'data-r': 'flat' })).join('');
      break;
    case 'calaveras':
      // calaverita: cráneo redondo, mandíbula con dientes, ojos grandes
      s = spots(g, 40, 0.2).map(([x, y]) => G({ transform: `translate(${x} ${y}) scale(1.4)` }, fl('M-5 1 C-6 -7 6 -7 5 1 L3.5 2 L3.5 5 L-3.5 5 L-3.5 2Z', '#F4F0EA')
        + Ell(-2.1, -1.4, 1.6, 1.8, { fill: '#2A2230', 'data-r': 'flat' }) + Ell(2.1, -1.4, 1.6, 1.8, { fill: '#2A2230', 'data-r': 'flat' }) + fl('M-0.6 1.6 L0.6 1.6 L0 0.6Z', '#2A2230'))).join('');
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
      // rosetas: dos medias lunas gruesas abrazando un centro más claro
      s = spots(g, 34, 0.3).map(([x, y]) => fl(`M${x - 7.5} ${y - 2} C${x - 6} ${y - 8.5} ${x + 3.5} ${y - 8.5} ${x + 7.5} ${y - 3.5} M${x + 7.5} ${y + 2.5} C${x + 5} ${y + 7.5} ${x - 3.5} ${y + 8.5} ${x - 7.5} ${y + 3.5}`, 'none', { stroke: a, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'data-r': 'line' })
        + Ell(x, y, 3.6, 3, { fill: b === '#FFFFFF' ? a : b, opacity: 0.8, 'data-r': 'flat' })).join('');
      break;
    case 'camuflaje':
      s = spots(g, 34, 0.4).map(([x, y], i) => fl(`M${x - 12} ${y} C${x - 10} ${y - 9} ${x + 2} ${y - 8} ${x + 6} ${y - 4} C${x + 13} ${y - 3} ${x + 12} ${y + 7} ${x + 3} ${y + 6} C${x - 5} ${y + 9} ${x - 12} ${y + 6} ${x - 12} ${y}Z`, [a, b, shade(c.body, -1.4)][i % 3])).join('');
      break;
    case 'vaca':
      s = spots(g, 50, 0.32).map(([x, y], i) => fl(`M${x - 14} ${y - 2} C${x - 15} ${y - 12} ${x - 3} ${y - 15} ${x + 6} ${y - 11} C${x + 15} ${y - 8} ${x + 16} ${y + 3} ${x + 8} ${y + 9} C${x + 1} ${y + 14} ${x - 8} ${y + 12} ${x - 12} ${y + 6} C${x - 16} ${y + 4} ${x - 13} ${y + 1} ${x - 14} ${y - 2}Z`, i % 4 === 3 ? b : '#3A3540')).join('');
      break;
    case 'galaxia':
      s = [[g.l + g.w * 0.25, g.top + 24, 34, '#3B2A7A'], [g.r - g.w * 0.22, g.top + 40, 30, '#1F3A7A'], [g.l + g.w * 0.15, 168, 26, '#5A2A7A'], [g.r - g.w * 0.12, 166, 26, '#2A2A6A']]
        .map(([x, y, r, col]) => Cir(x, y, r, { fill: col, opacity: 0.55, 'data-r': 'tone' })).join('')
        + spots(g, 15, 0.45).map(([x, y], i) => (i % 5 === 0
          ? P(`M${x} ${y - 3.4} Q${x + 0.6} ${y - 0.6} ${x + 3.4} ${y} Q${x + 0.6} ${y + 0.6} ${x} ${y + 3.4} Q${x - 0.6} ${y + 0.6} ${x - 3.4} ${y} Q${x - 0.6} ${y - 0.6} ${x} ${y - 3.4}Z`, { fill: '#FFF6C8', 'data-r': 'flat' })
          : Cir(x, y, 1.1, { fill: '#FFFFFF', 'data-r': 'flat' }))).join('');
      break;
    case 'degrade':
      [0.62, 0.48, 0.34, 0.2, 0.1].forEach((op, i) => { s += E('rect', { x: g.l - 4, y: 182 - (i + 1) * 15, width: g.w + 8, height: 16, fill: a, opacity: op, 'data-r': 'tone' }); });
      break;
    case 'fresa':
      s = spots(g, 19, 0.22).map(([x, y], i) => Ell(x, y, 2, 3, { fill: '#FFE7A3', stroke: '#C99A3A', 'stroke-width': 0.6, transform: `rotate(${(i % 3 - 1) * 14} ${x} ${y})`, 'data-r': 'flat' })).join('');
      break;
    case 'sakura':
      s = spots(g, 38, 0.3).map(([x, y], i) => G({ transform: `translate(${x} ${y}) scale(1.3) translate(${-x} ${-y})` }, i % 3 === 2
        ? fl(`M${x} ${y - 3} C${x + 3} ${y - 3} ${x + 3} ${y + 2} ${x} ${y + 3} C${x - 1} ${y + 1} ${x - 1} ${y - 1} ${x} ${y - 3}Z`, '#FFB7CF', { transform: `rotate(${i * 37} ${x} ${y})` })
        : [0, 72, 144, 216, 288].map((k) => { const r = (k - 90) * Math.PI / 180; return Ell(x + Math.cos(r) * 4, y + Math.sin(r) * 4, 3.1, 2.4, { fill: i % 2 ? '#FF9EC0' : '#FFC2D6', transform: `rotate(${k} ${x + Math.cos(r) * 3.4} ${y + Math.sin(r) * 3.4})`, 'data-r': 'flat' }); }).join('') + Cir(x, y, 1.7, { fill: '#D9467A', 'data-r': 'flat' }))).join('');
      break;
    case 'rayos':
      s = spots(g, 40, 0.25).map(([x, y], i) => G({ transform: `translate(${x} ${y}) scale(1.35)` }, fl('M1 -8 L-4.5 1 L-0.5 1 L-2.5 8 L5.5 -2.5 L1.2 -2.5Z', i % 2 ? a : '#FFD23F'))).join('');
      break;
    default: break;
  }
  const id2 = `pt${Math.round(g.w * 3)}${id.length}`;
  return E('clipPath', { id: id2 }, P(g.path)) + G({ 'clip-path': `url(#${id2})` }, s);
}
