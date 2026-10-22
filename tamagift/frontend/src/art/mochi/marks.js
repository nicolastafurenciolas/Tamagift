// Marcas de la cara: bigotes, una estrellita bajo el ojo, la luna en la
// frente… Rasgos de nacimiento (se eligen al diseñarla), no accesorios.

import { G, P, Cir, Ell } from '../svg.js';
import { parseColor, hex, ramp } from '../color.js';

const OUT = '#3A2A3E';
const shade = (c, k) => hex(ramp(parseColor(c), k));
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

export function renderMarks(id, g, mood, c, shift = { y: 0, dx: 0 }) {
  if (!id || id === 'ninguna') return '';
  const fy = g.face.y + (shift.y || 0);
  const dx = g.face.dx + (shift.dx || 0);
  const cy = g.face.cheekY + (shift.y || 0) * 0.15;
  const cdx = g.face.cheekDx + (shift.dx || 0) * 0.6;
  switch (id) {
    case 'bigotes': {
      const one = (s) => P([-12, 0, 12].map((a) => {
        const x0 = 100 + s * (cdx + 9), y0 = cy - 1 + a * 0.12;
        const r = (a * Math.PI) / 180;
        return `M${f(x0)} ${f(y0)} l${f(s * Math.cos(r) * 10)} ${f(Math.sin(r) * 10)}`;
      }).join(''), { fill: 'none', stroke: OUT, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'data-r': 'line', opacity: 0.85 });
      return one(-1) + one(1);
    }
    case 'corazon':
      return P(heart(100 - dx - 3, fy + 12.5, 3.3), { fill: '#FF6F91', stroke: shade('#FF6F91', -1.6), 'stroke-width': 1, 'data-r': 'part' });
    case 'estrella':
      return P(star(100 - dx - 3, fy + 12.5, 4), { fill: '#FFD45C', stroke: '#B88A2A', 'stroke-width': 1, 'stroke-linejoin': 'round', 'data-r': 'part' });
    case 'luna': {
      const x = 100, y = fy - 25;
      return P(`M${f(x + 1.5)} ${f(y - 6)} A6 6 0 1 0 ${f(x + 1.5)} ${f(y + 6)} A4.6 4.6 0 1 1 ${f(x + 1.5)} ${f(y - 6)}Z`, { fill: '#FFD45C', stroke: '#B88A2A', 'stroke-width': 1, 'data-r': 'part' });
    }
    case 'gema': {
      const x = 100, y = fy - 24, col = c.accent;
      return P(`M${x} ${f(y - 5.5)} L${x + 4} ${f(y)} L${x} ${f(y + 5.5)} L${x - 4} ${f(y)}Z`, { fill: col, stroke: shade(col, -1.8), 'stroke-width': 1.2, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + P(`M${x - 1.8} ${f(y - 1.4)} L${x} ${f(y - 3.6)} L${x + 0.6} ${f(y - 1.2)}Z`, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' });
    }
    case 'flor': {
      const x = 100 + cdx + 6, y = cy - 9, col = '#FF8FAB';
      return G({}, [0, 72, 144, 216, 288].map((a) => Cir(x + Math.cos((a * Math.PI) / 180) * 2.6, y + Math.sin((a * Math.PI) / 180) * 2.6, 2.2, { fill: col, stroke: shade(col, -1.6), 'stroke-width': 0.8, 'data-r': 'part' })).join('')
        + Cir(x, y, 1.5, { fill: '#FFE070', 'data-r': 'flat' }));
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
