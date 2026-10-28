// Alfombras: planas sobre el piso, así que todo lo redondo es una elipse
// el doble de ancha que de alta (DEPTH). Van siempre debajo de todo.

import { face, part, flat, line, shade, rr, ellD, tone, mix, mat, Cir, Ell, INK, DEPTH } from '../draw.js';

// Corazón aplastado por la perspectiva.
const heartD = (cx, cy, s) => {
  const k = DEPTH;
  return `M${cx} ${cy + s * 0.95 * k}C${cx - s * 1.25} ${cy + s * 0.15 * k} ${cx - s * 1.15} ${cy - s * 1.05 * k} ${cx} ${cy - s * 0.4 * k}C${cx + s * 1.15} ${cy - s * 1.05 * k} ${cx + s * 1.25} ${cy + s * 0.15 * k} ${cx} ${cy + s * 0.95 * k}Z`;
};

export const RUGS = [
  {
    id: 'alfombra', name: 'Alfombra redonda', cat: 'alfombras', price: 90, w: 252, h: 90, place: 'piso', layer: 'suelo', tags: ['dulce', 'aesthetic', 'hippie'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = face('M6 44V50A120 38 0 0 0 246 50V44Z', C.side, { w: 2 });
      s += face(ellD(126, 44, 120, 38), C.front, { w: 2 });
      s += flat(ellD(126, 44, 96, 30), mix(p.cloth, '#FFFFFF', 0.45));
      s += flat(ellD(126, 44, 72, 22), C.front);
      s += flat(ellD(126, 44, 48, 15), p.accent === '#FFFFFF' ? mix(p.cloth, '#FFFFFF', 0.7) : p.accent);
      s += flat(ellD(126, 44, 22, 7), C.front);
      s += Ell(126, 44, 112, 34, { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.6, 'stroke-dasharray': '5 5', opacity: 0.55, 'data-r': 'line' });
      return s;
    },
  },
  {
    id: 'alfombraRect', name: 'Alfombra tejida', cat: 'alfombras', price: 110, w: 256, h: 84, place: 'piso', layer: 'suelo', tags: ['rustico', 'hippie', 'elegante'],
    draw: (p) => {
      const C = mat(p.cloth);
      const acc = p.accent === '#FFFFFF' ? '#F2E6D3' : p.accent;
      let s = '';
      // flecos en los lados cortos
      for (let y = 10; y <= 66; y += 7) s += line(`M8 ${y}H16M240 ${y}H248`, '#EDE2CF', 2);
      s += face(rr(14, 8, 228, 64, 2), C.front, { w: 2 });
      s += face(rr(14, 72, 228, 5, 1), C.side, { w: 1.6 });
      s += flat(rr(24, 14, 208, 52, 1), mix(p.cloth, '#FFFFFF', 0.5));
      s += flat(rr(32, 19, 192, 42, 1), C.front);
      // rombos (aplastados por la perspectiva)
      for (let x = 56; x <= 200; x += 48) {
        s += flat(`M${x} 26L${x + 16} 40L${x} 54L${x - 16} 40Z`, acc);
        s += flat(`M${x} 33L${x + 7} 40L${x} 47L${x - 7} 40Z`, C.front);
      }
      return s;
    },
  },
  {
    id: 'alfombraCorazon', name: 'Alfombra corazón', cat: 'alfombras', price: 100, w: 210, h: 96, place: 'piso', layer: 'suelo', tags: ['dulce', 'princesa', 'y2k'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = `<g transform="translate(0 5)">${face(heartD(105, 44, 86), C.side, { w: 2 })}</g>`;
      s += face(heartD(105, 44, 86), C.front, { w: 2 });
      s += flat(heartD(105, 44, 64), mix(p.cloth, '#FFFFFF', 0.45));
      s += flat(heartD(105, 44, 40), C.front);
      s += P2(heartD(105, 44, 76));
      return s;
    },
  },
  {
    id: 'alfombraOsito', name: 'Alfombra osito', cat: 'alfombras', price: 130, w: 236, h: 104, place: 'piso', layer: 'suelo', tags: ['dulce', 'aesthetic'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = '';
      [[48, 26], [188, 26]].forEach(([x, y]) => { s += face(ellD(x, y + 4, 26, 15), C.side, { w: 2 }) + face(ellD(x, y, 26, 15), C.front, { w: 2 }) + flat(ellD(x, y + 1, 14, 8), mix(p.cloth, '#FFFFFF', 0.45)); });
      s += face('M10 56V62A108 36 0 0 0 226 62V56Z', C.side, { w: 2 });
      s += face(ellD(118, 56, 108, 36), C.front, { w: 2 });
      s += flat(ellD(118, 66, 32, 14), mix(p.cloth, '#FFFFFF', 0.55));
      s += Ell(118, 60, 8, 4.5, { fill: INK, 'data-r': 'flat' });
      s += line('M118 64V70M110 72Q118 76 126 72', INK, 2);
      s += Ell(86, 50, 6, 4, { fill: INK, 'data-r': 'flat' }) + Ell(150, 50, 6, 4, { fill: INK, 'data-r': 'flat' });
      s += Ell(70, 62, 9, 4, { fill: '#FF8FA8', opacity: 0.6, 'data-r': 'tone' }) + Ell(166, 62, 9, 4, { fill: '#FF8FA8', opacity: 0.6, 'data-r': 'tone' });
      return s;
    },
  },
];

// costura punteada alrededor
function P2(d) {
  return `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="5 5" opacity="0.55" data-r="line"/>`;
}
