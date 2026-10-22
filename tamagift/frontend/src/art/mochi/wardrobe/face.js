// Cara: lentes, tapabocas, stickers y maquillaje (los nuevos).
// `e` es la posición de los ojos ({ y, dx }) ya corrida por las orejas.

import { G, P, Ell, Cir, OUT, GOLD, GOLD_D, shade, mixc, f, T, part, flat, line, shine, dot, heartD, starD, sparkleD } from './kit.js';

// Lente con forma: `shape(x, y)` devuelve el contorno de un lado.
function glasses(e, shape, frame, tint, bridge = 2.4) {
  const L = 100 - e.dx, R = 100 + e.dx;
  const lens = (x) => P(shape(x, e.y), { fill: tint, 'fill-opacity': 0.55, stroke: frame, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part' });
  return lens(L) + lens(R) + line(`M${f(L + 8)} ${f(e.y - 3)} Q100 ${f(e.y - 6)} ${f(R - 8)} ${f(e.y - 3)}`, frame, bridge)
    + line(`M${f(L - 5)} ${f(e.y - 3)} l3.4 -3 M${f(R - 5)} ${f(e.y - 3)} l3.4 -3`, '#FFFFFF', 1.6, { opacity: 0.85 });
}

export const FACE_ITEMS = [
  {
    id: 'gafasCorazon', label: 'Gafas de corazón', vibes: ['y2k', 'kawaii'], price: 85, colors: ['#FF5FA2'],
    draw: (g, k, { e }) => ({ front: glasses(e, (x, y) => heartD(x, y - 1, 10.5), shade(k.c1, -1.4), k.c1) }),
  },
  {
    id: 'gafasEstrella', label: 'Gafas de estrella', vibes: ['y2k', 'celestial'], price: 85, colors: ['#FFD45C'],
    draw: (g, k, { e }) => ({ front: glasses(e, (x, y) => starD(x, y, 11.5, 0.55), shade(k.c1, -1.6), k.c1) }),
  },
  {
    id: 'cateye', label: 'Gafas cat-eye', vibes: ['coquette', 'aesthetic'], price: 90, colors: ['#2A2230', '#FFB6CC'],
    draw: (g, k, { e }) => {
      // marco con las puntas de afuera levantadas
      const shape = (side) => (x, y) => `M${f(x - side * 11)} ${f(y - 7)} Q${f(x)} ${f(y - 10)} ${f(x + side * 9)} ${f(y - 6)} L${f(x + side * 13)} ${f(y - 11)} Q${f(x + side * 12)} ${f(y + 6)} ${f(x)} ${f(y + 6)} Q${f(x - side * 10)} ${f(y + 6)} ${f(x - side * 11)} ${f(y - 7)}Z`;
      const L = 100 - e.dx, R = 100 + e.dx;
      return {
        front: P(shape(-1)(L, e.y), { fill: k.c2, 'fill-opacity': 0.4, stroke: k.c1, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-r': 'part' })
          + P(shape(1)(R, e.y), { fill: k.c2, 'fill-opacity': 0.4, stroke: k.c1, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-r': 'part' })
          + line(`M${f(L + 9)} ${f(e.y - 5)} Q100 ${f(e.y - 8)} ${f(R - 9)} ${f(e.y - 5)}`, k.c1, 2.6),
      };
    },
  },
  {
    id: 'nerd', label: 'Gafas cuadradas', vibes: ['academia', 'gamer'], price: 70, colors: ['#3A2A3E'],
    draw: (g, k, { e }) => ({ front: glasses(e, (x, y) => `M${f(x - 11)} ${f(y - 8)} h22 v14 q0 3 -3 3 h-16 q-3 0 -3 -3Z`, k.c1, '#DFF4FF', 3) }),
  },
  {
    id: 'monoculo', label: 'Monóculo', vibes: ['academia'], price: 95, colors: [GOLD],
    draw: (g, k, { e }) => {
      const x = 100 + e.dx, y = e.y;
      return { front: Cir(x, y, 11, { fill: '#DFF4FF', 'fill-opacity': 0.3, stroke: k.c1, 'stroke-width': 2.8, 'data-r': 'part' }) + line(`M${f(x + 8)} ${f(y + 8)} C${f(x + 14)} ${f(y + 20)} ${f(x + 6)} ${f(y + 30)} ${f(x + 14)} ${f(y + 40)}`, shade(k.c1, -1.4), 1.4) + line(`M${f(x - 5)} ${f(y - 5)} l3.4 -3`, '#FFFFFF', 1.6, { opacity: 0.85 }) };
    },
  },
  {
    id: 'tapabocas', label: 'Tapabocas kawaii', vibes: ['otaku', 'kawaii'], price: 60, colors: ['#FFFFFF', '#FF9EB5'],
    draw: (g, k, { e }) => {
      const y = g.face.mouthY + 2, w = e.dx + 9;
      const d = `M${f(100 - w)} ${f(y - 9)} Q100 ${f(y - 12)} ${f(100 + w)} ${f(y - 9)} L${f(100 + w - 2)} ${f(y + 7)} Q100 ${f(y + 13)} ${f(100 - w + 2)} ${f(y + 7)}Z`;
      return {
        front: line(`M${f(100 - w)} ${f(y - 6)} L${f(g.l + 4)} ${f(y - 14)} M${f(100 + w)} ${f(y - 6)} L${f(g.r - 4)} ${f(y - 14)}`, '#D9D2DE', 1.6)
          + part(d, k.c1) + line(`M${f(100 - w + 3)} ${f(y - 3)} Q100 ${f(y - 5)} ${f(100 + w - 3)} ${f(y - 3)} M${f(100 - w + 3)} ${f(y + 2)} Q100 ${f(y)} ${f(100 + w - 3)} ${f(y + 2)}`, '#D9D2DE', 1.2)
          + line(`M${f(97)} ${f(y + 1)} Q${f(98.5)} ${f(y + 3.5)} 100 ${f(y + 1)} Q${f(101.5)} ${f(y + 3.5)} 103 ${f(y + 1)}`, k.c2, 1.6),
      };
    },
  },
  {
    id: 'pepinos', label: 'Pepinitos de spa', vibes: ['aesthetic', 'coquette'], price: 50, colors: ['#9BD48A'],
    draw: (g, k, { e }) => {
      const one = (x) => Cir(x, e.y, 9, { fill: k.c1, stroke: shade(k.c1, -2), 'stroke-width': 2, 'data-r': 'part' }) + Cir(x, e.y, 6.6, { fill: mixc(k.c1, '#F4FFE8', 0.65), 'data-r': 'flat' })
        + [0, 60, 120, 180, 240, 300].map((a) => dot(x + Math.cos(a * Math.PI / 180) * 3.6, e.y + Math.sin(a * Math.PI / 180) * 3.6, 0.9, shade(k.c1, -0.6))).join('');
      return { front: one(100 - e.dx) + one(100 + e.dx) };
    },
  },
  {
    id: 'stickersCorazon', label: 'Stickers de corazón', vibes: ['kawaii', 'y2k'], price: 40, colors: ['#FF6F91'],
    draw: (g, k, { e }) => ({
      under: part(heartD(100 - e.dx - 9, e.y + 11, 3.2), k.c1, { 'stroke-width': 1 }) + part(heartD(100 + e.dx + 10, e.y + 9, 2.6), k.c1, { 'stroke-width': 1 }) + part(heartD(100 + e.dx + 4, e.y + 15, 2), mixc(k.c1, '#FFFFFF', 0.4), { 'stroke-width': 1 }),
    }),
  },
  {
    id: 'brilloY2K', label: 'Brillos bajo los ojos', vibes: ['y2k', 'celestial'], price: 45, colors: ['#C7E8FF'],
    draw: (g, k, { e }) => ({
      under: [[-1, 0], [-1, 1], [1, 0], [1, 1]].map(([s, i]) => P(sparkleD(100 + s * (e.dx + 3 + i * 5), e.y + 11 + i * 2, 2.8 - i * 0.6), { fill: k.c1, stroke: shade(k.c1, -1.8), 'stroke-width': 0.8, 'data-r': 'part' })).join(''),
    }),
  },
  {
    id: 'delineado', label: 'Delineado de gatita', vibes: ['aesthetic', 'coquette', 'gotica'], price: 45, colors: ['#2A2230'],
    draw: (g, k, { e }) => ({
      front: [-1, 1].map((s) => line(`M${f(100 + s * (e.dx + 5))} ${f(e.y - 3)} L${f(100 + s * (e.dx + 11))} ${f(e.y - 7.5)}`, k.c1, 2.4)).join(''),
    }),
  },
];
