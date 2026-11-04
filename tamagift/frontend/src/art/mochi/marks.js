// Marcas de la cara: bigotes, una estrellita bajo el ojo, la luna en la
// frente… Rasgos de nacimiento (se eligen al diseñarla), no accesorios.

import { G, P, Cir, Ell } from '../svg.js';
import { FACE_BOX } from './bigFace.js';
import { parseColor, hex, ramp, mixRgb } from '../color.js';

const OUT = '#3A2A3E';
const shade = (c, k) => hex(ramp(parseColor(c), k));
const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
const f = (n) => n.toFixed(1);

export const MARKS = [
  { id: 'ninguna', label: 'Sin marcas' },
  { id: 'bigotes', label: 'Bigotitos' },
  { id: 'corazon', label: 'Corazón' },
  { id: 'estrella', label: 'Estrellita' },
  { id: 'luna', label: 'Luna' },
  { id: 'gema', label: 'Gema' },
  { id: 'flor', label: 'Florecita' },
  { id: 'sonrojo', label: 'Sonrojo' },
];

const star = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.5 : r; d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)}`; }
  return `${d}Z`;
};
const heart = (x, y, s) => `M${f(x)} ${f(y + s * 0.85)} C${f(x - s * 1.1)} ${f(y + s * 0.1)} ${f(x - s * 1.05)} ${f(y - s * 0.95)} ${f(x)} ${f(y - s * 0.35)} C${f(x + s * 1.05)} ${f(y - s * 0.95)} ${f(x + s * 1.1)} ${f(y + s * 0.1)} ${f(x)} ${f(y + s * 0.85)}Z`;

// Las marcas chiquitas (ícono) llevan su pieza hecha a mano en pixel;
// los demás estilos las dibujan tal cual (sin el contorno grueso del kit).
const sizer = (x, y) => P(`M${f(x - FACE_BOX.mark.w / 2)} ${f(y - FACE_BOX.mark.h / 2)}h${FACE_BOX.mark.w}v${FACE_BOX.mark.h}h${-FACE_BOX.mark.w}Z`, { fill: 'none' });
const icon = (name, x, y, c1, ink, inner) => G({ 'data-px': `mark.${name}`, 'data-c1': c1, 'data-ink': ink }, sizer(x, y) + inner);

export function renderMarks(id, g, mood, c, shift = { y: 0, dx: 0 }) {
  if (!id || id === 'ninguna') return '';
  const fy = g.face.y + (shift.y || 0);
  const dx = g.face.dx + (shift.dx || 0);
  const cy = g.face.cheekY + (shift.y || 0) * 0.15;
  const cdx = g.face.cheekDx + (shift.dx || 0) * 0.6;
  switch (id) {
    case 'bigotes': {
      // dos bigotes por lado, bien separados (tres se funden en pixel)
      const one = (s) => P([-16, 10].map((a) => {
        const x0 = 100 + s * (cdx + 8), y0 = cy - 1.5 + a * 0.22;
        const r = (a * Math.PI) / 180;
        return `M${f(x0)} ${f(y0)} l${f(s * Math.cos(r) * 11)} ${f(Math.sin(r) * 11)}`;
      }).join(''), { fill: 'none', stroke: c.dark ? '#FFF0F6' : mixc(OUT, c.body, 0.15), 'stroke-width': 2, 'stroke-linecap': 'round', 'data-r': 'line' });
      return one(-1) + one(1);
    }
    case 'corazon':
      return icon('corazon', 100 - dx - 4, fy + 13, '#FF6F91', shade('#FF6F91', -1.6), P(heart(100 - dx - 4, fy + 13, 4.6), { fill: '#FF6F91', stroke: shade('#FF6F91', -1.6), 'stroke-width': 1.4, 'data-r': 'part' }));
    case 'estrella':
      return icon('estrella', 100 - dx - 4, fy + 13, '#FFD45C', '#A87A1E', P(star(100 - dx - 4, fy + 13, 5.6), { fill: '#FFD45C', stroke: '#B88A2A', 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'data-r': 'part' }));
    case 'luna': {
      // medialuna: el círculo grande menos uno corrido arriba a la derecha
      const x = 100, y = fy - 25, R1 = 7, R2 = 5.8, ox = 3.4, oy = -2;
      const d0 = Math.hypot(ox, oy), a = (R1 * R1 - R2 * R2 + d0 * d0) / (2 * d0), h = Math.sqrt(Math.max(0, R1 * R1 - a * a));
      const ux = ox / d0, uy = oy / d0;
      const p1 = [x + ux * a - uy * h, y + uy * a + ux * h], p2 = [x + ux * a + uy * h, y + uy * a - ux * h];
      return icon('luna', x, y, '#FFD45C', '#A87A1E', P(`M${f(p1[0])} ${f(p1[1])} A${R1} ${R1} 0 1 1 ${f(p2[0])} ${f(p2[1])} A${R2} ${R2} 0 0 0 ${f(p1[0])} ${f(p1[1])}Z`, { fill: '#FFD45C', stroke: '#B88A2A', 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'data-r': 'part' }));
    }
    case 'gema': {
      const x = 100, y = fy - 24, col = c.accent;
      return icon('gema', x, y, col, shade(col, -1.8), P(`M${x} ${f(y - 6.5)} L${x + 4.8} ${f(y)} L${x} ${f(y + 6.5)} L${x - 4.8} ${f(y)}Z`, { fill: col, stroke: shade(col, -1.8), 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + P(`M${x - 2.2} ${f(y - 1.6)} L${x} ${f(y - 4.4)} L${x + 0.7} ${f(y - 1.4)}Z`, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' }));
    }
    case 'flor': {
      const x = 100 + cdx + 6, y = cy - 10, col = '#FF8FAB';
      return G({ 'data-px': 'mark.flor', 'data-c1': col, 'data-ink': shade(col, -1.6) }, sizer(x, y) + [0, 72, 144, 216, 288].map((a) => Cir(x + Math.cos(((a - 90) * Math.PI) / 180) * 3.4, y + Math.sin(((a - 90) * Math.PI) / 180) * 3.4, 2.9, { fill: col, stroke: shade(col, -1.6), 'stroke-width': 1.1, 'data-r': 'part' })).join('')
        + Cir(x, y, 2, { fill: '#FFE070', 'data-r': 'flat' }));
    }
    case 'sonrojo': {
      // rayitas de sonrojo de anime, encima de las mejillas
      const col = mood === 'enojado' ? '#E0405A' : shade(c.blush, -0.6);
      const one = (s) => P([-3.4, 0, 3.4].map((d) => `M${f(100 + s * cdx + d + 1.6)} ${f(cy - 2.6)} l-3.2 5`).join(''), { fill: 'none', stroke: col, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'data-r': 'line', opacity: 0.9 })
        + Ell(100 + s * cdx, cy, 8, 4.2, { fill: c.blush, opacity: 0.35, 'data-r': 'tone' });
      return one(-1) + one(1);
    }
    default: return '';
  }
}
