// Cara: lentes, tapabocas, stickers y maquillaje (los nuevos).
// `e` es la posición de los ojos ({ y, dx }) ya corrida por las orejas.
//
// En pixel los ojos son sellos hechos a mano que se pintan ENCIMA de todo
// y son más grandes que el ojo vectorial (~20 unidades): por eso cada
// lente mide ~26 y su marco es gordito, así el marco siempre rodea el ojo
// y se lee en los seis estilos.

import {
  Cir, G, GOLD, P, T, dot, ellD, f, flat, heartD, line, mixc, part, puffStarD, shade, shine,
  sparkleD, tone,
} from './kit.js';

// Patillas que van del marco hacia los costados de la cabeza.
const temples = (e, frame, rx) => line(`M${f(100 - e.dx - rx)} ${f(e.y - 3)} l-6 -1.5 M${f(100 + e.dx + rx)} ${f(e.y - 3)} l6 -1.5`, frame, 2.4);
// Brillo de vidrio: dos rayitas diagonales arriba a la izquierda.
const glint = (x, y, r) => line(`M${f(x - r * 0.62)} ${f(y - r * 0.05)} l${f(r * 0.38)} ${f(-r * 0.36)} M${f(x - r * 0.42)} ${f(y + r * 0.3)} l${f(r * 0.2)} ${f(-r * 0.19)}`, '#FFFFFF', 1.7, { opacity: 0.9 });

// Lente con forma: `shape(x, y)` devuelve el contorno de un lado.
export function glasses(e, shape, frame, tint, { bridge = 2.6, rx = 12, op = 0.4, w = 2.8 } = {}) {
  const L = 100 - e.dx, R = 100 + e.dx;
  const lens = (x) => P(shape(x, e.y), { fill: tint, 'fill-opacity': op, stroke: frame, 'stroke-width': w, 'stroke-linejoin': 'round', 'data-r': 'part' });
  return temples(e, frame, rx) + lens(L) + lens(R)
    + line(`M${f(L + rx * 0.72)} ${f(e.y - 4)} Q100 ${f(e.y - 8)} ${f(R - rx * 0.72)} ${f(e.y - 4)}`, frame, bridge)
    + glint(L, e.y - 1, rx) + glint(R, e.y - 1, rx);
}

export const FACE_ITEMS = [
  {
    id: 'gafasCorazon', label: 'Gafas de corazón', vibes: ['y2k', 'kawaii'], price: 85, colors: ['#FF5FA2'],
    draw: (g, k, { e }) => ({ front: glasses(e, (x, y) => heartD(x, y - 1.5, 12.5), shade(k.c1, -1.5), k.c1, { rx: 13, op: 0.5, w: 3 }) }),
  },
  {
    id: 'gafasEstrella', label: 'Gafas de estrella', vibes: ['y2k', 'celestial'], price: 85, colors: ['#FFD45C'],
    draw: (g, k, { e }) => ({ front: glasses(e, (x, y) => puffStarD(x, y, 14, 0.6), shade(k.c1, -1.7), k.c1, { rx: 13, op: 0.5, w: 3 }) }),
  },
  {
    id: 'cateye', label: 'Gafas cat-eye', vibes: ['coquette', 'aesthetic'], price: 90, colors: ['#2A2230', '#FFB6CC'],
    draw: (g, k, { e }) => {
      // marco con las puntas de afuera levantadas
      const shape = (side) => (x, y) => `M${f(x - side * 12)} ${f(y - 8)} Q${f(x)} ${f(y - 12)} ${f(x + side * 10)} ${f(y - 8)} L${f(x + side * 15)} ${f(y - 13)} Q${f(x + side * 14)} ${f(y + 7)} ${f(x)} ${f(y + 8)} Q${f(x - side * 12)} ${f(y + 8)} ${f(x - side * 12)} ${f(y - 8)}Z`;
      const L = 100 - e.dx, R = 100 + e.dx;
      const lens = (s, x) => P(shape(s)(x, e.y), { fill: k.c2, 'fill-opacity': 0.42, stroke: k.c1, 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'data-r': 'part' });
      return {
        front: temples(e, k.c1, 13) + lens(-1, L) + lens(1, R)
          + line(`M${f(L + 10)} ${f(e.y - 6)} Q100 ${f(e.y - 9)} ${f(R - 10)} ${f(e.y - 6)}`, k.c1, 2.8)
          + dot(L - 11, e.y - 9, 1.2, '#FFFFFF') + dot(R + 11, e.y - 9, 1.2, '#FFFFFF')
          + glint(L, e.y - 1, 12) + glint(R, e.y - 1, 12),
      };
    },
  },
  {
    id: 'nerd', label: 'Gafas cuadradas', vibes: ['academia', 'gamer'], price: 70, colors: ['#3A2A3E'],
    draw: (g, k, { e }) => ({ front: glasses(e, (x, y) => `M${f(x - 12.5)} ${f(y - 9.5)} h25 v16 q0 3.5 -3.5 3.5 h-18 q-3.5 0 -3.5 -3.5Z`, k.c1, '#DFF4FF', { rx: 12.5, op: 0.3, w: 3.4, bridge: 3 }) }),
  },
  {
    id: 'monoculo', label: 'Monóculo', vibes: ['academia'], price: 95, colors: [GOLD],
    draw: (g, k, { e }) => {
      const x = 100 + e.dx, y = e.y, r = 13;
      return {
        front: line(`M${f(x + r * 0.7)} ${f(y + r * 0.7)} C${f(x + 16)} ${f(y + 22)} ${f(x + 6)} ${f(y + 30)} ${f(x + 14)} ${f(y + 40)}`, shade(k.c1, -1.4), 1.4, { 'stroke-dasharray': '2 1.2' })
          + Cir(x, y, r, { fill: '#DFF4FF', 'fill-opacity': 0.28, stroke: k.c1, 'stroke-width': 3.2, 'data-r': 'part' })
          + P(`M${f(x - r * 0.95)} ${f(y - r * 0.3)} A${f(r * 0.95)} ${f(r * 0.95)} 0 0 1 ${f(x + r * 0.3)} ${f(y - r * 0.95)}`, { fill: 'none', stroke: '#FFF6D0', 'stroke-width': 1.1, 'data-r': 'line' })
          + glint(x, y - 1, r) + Cir(x + r * 0.7, y + r * 0.7, 1.6, { fill: k.c1, stroke: shade(k.c1, -1.6), 'stroke-width': 0.9, 'data-r': 'part' }),
      };
    },
  },
  {
    id: 'tapabocas', label: 'Tapabocas kawaii', vibes: ['otaku', 'kawaii'], price: 60, colors: ['#FFFFFF', '#FF9EB5'],
    draw: (g, k, { e }) => {
      const y = (e.mouthY ?? g.face.mouthY) + 3, w = e.dx + 10;
      const d = `M${f(100 - w)} ${f(y - 10)} Q100 ${f(y - 13)} ${f(100 + w)} ${f(y - 10)} L${f(100 + w - 2)} ${f(y + 7)} Q100 ${f(y + 14)} ${f(100 - w + 2)} ${f(y + 7)}Z`;
      const pl = shade(k.c1, -0.7);
      return {
        front: line(`M${f(100 - w)} ${f(y - 7)} L${f(g.l + 3)} ${f(y - 15)} M${f(100 + w)} ${f(y - 7)} L${f(g.r - 3)} ${f(y - 15)}`, mixc(k.c1, '#9A90B0', 0.4), 1.8)
          + part(d, k.c1) + tone(`M${f(100 + w * 0.3)} ${f(y - 12)} L${f(100 + w)} ${f(y - 10)} L${f(100 + w - 2)} ${f(y + 7)} Q${f(100 + w * 0.6)} ${f(y + 11)} ${f(100 + w * 0.35)} ${f(y + 11)}Z`, '#5A4A70', 0.14)
          + line(`M${f(100 - w + 3)} ${f(y - 4)} Q100 ${f(y - 6)} ${f(100 + w - 3)} ${f(y - 4)} M${f(100 - w + 3)} ${f(y + 1.5)} Q100 ${f(y - 0.5)} ${f(100 + w - 3)} ${f(y + 1.5)}`, pl, 1.2, { opacity: 0.85 })
          + line(`M${f(96.5)} ${f(y + 3.5)} Q${f(98.2)} ${f(y + 6.5)} 100 ${f(y + 3.5)} Q${f(101.8)} ${f(y + 6.5)} 103.5 ${f(y + 3.5)}`, k.c2, 1.8)
          + dot(100 - w * 0.62, y + 3, 2.2, k.c2, { opacity: 0.7 }) + dot(100 + w * 0.62, y + 3, 2.2, k.c2, { opacity: 0.7 }),
      };
    },
  },
  {
    id: 'pepinos', label: 'Pepinitos de spa', vibes: ['aesthetic', 'coquette'], price: 50, colors: ['#9BD48A'],
    draw: (g, k, { e }) => {
      // rodaja de pepino: cáscara verde oscura, pulpa clara y el anillo de semillas
      const one = (x) => Cir(x, e.y, 12.5, { fill: shade(k.c1, -0.6), stroke: shade(k.c1, -2.2), 'stroke-width': 2, 'data-r': 'part' })
        + Cir(x, e.y, 10.4, { fill: mixc(k.c1, '#F4FFE8', 0.62), 'data-r': 'flat' })
        + [0, 60, 120, 180, 240, 300].map((a) => P(ellD(x + Math.cos(a * Math.PI / 180) * 5, e.y + Math.sin(a * Math.PI / 180) * 5, 1.5, 0.9), { fill: shade(k.c1, -0.3), 'data-r': 'flat', transform: `rotate(${a} ${f(x + Math.cos(a * Math.PI / 180) * 5)} ${f(e.y + Math.sin(a * Math.PI / 180) * 5)})` })).join('')
        + shine(x - 5, e.y - 6, 1.6);
      return { front: one(100 - e.dx) + one(100 + e.dx) };
    },
  },
  {
    id: 'stickersCorazon', label: 'Stickers de corazón', vibes: ['kawaii', 'y2k'], price: 40, colors: ['#FF6F91'],
    draw: (g, k, { e }) => {
      const st = (x, y, s, col, rot) => G({ transform: T(x, y, rot, 1) }, part(heartD(0, 0, s), col, { 'stroke-width': 1.2, stroke: shade(col, -2) }) + shine(-s * 0.4, -s * 0.3, s * 0.2));
      return { under: st(100 - e.dx - 11, e.y + 12, 4.2, k.c1, -12) + st(100 + e.dx + 12, e.y + 9, 3.4, k.c1, 10) + st(100 + e.dx + 6, e.y + 16, 2.6, mixc(k.c1, '#FFFFFF', 0.4), -6) };
    },
  },
  {
    id: 'brilloY2K', label: 'Brillos bajo los ojos', vibes: ['y2k', 'celestial'], price: 45, colors: ['#C7E8FF'],
    draw: (g, k, { e }) => ({
      under: [[-1, 0], [-1, 1], [1, 0], [1, 1]].map(([s, i]) => P(sparkleD(100 + s * (e.dx + 4 + i * 6), e.y + 13 + i * 2.4, 3.6 - i * 0.8), { fill: k.c1, stroke: shade(k.c1, -1.8), 'stroke-width': 0.9, 'data-r': 'part' })).join('')
        + dot(100 - e.dx - 13, e.y + 9, 1, '#FFFFFF') + dot(100 + e.dx + 15, e.y + 10, 1, '#FFFFFF'),
    }),
  },
  {
    id: 'delineado', label: 'Delineado de gatita', vibes: ['aesthetic', 'coquette', 'gotica'], price: 45, colors: ['#2A2230'],
    draw: (g, k, { e }) => ({
      // el rabito sale del borde de afuera del ojo (más allá del sello de pixel)
      front: [-1, 1].map((s) => P(`M${f(100 + s * (e.dx + 8))} ${f(e.y - 3)} L${f(100 + s * (e.dx + 15))} ${f(e.y - 9)} L${f(100 + s * (e.dx + 9.5))} ${f(e.y - 1)}Z`, { fill: k.c1, stroke: k.c1, 'stroke-width': 1, 'stroke-linejoin': 'round', 'data-r': 'flat' })).join(''),
    }),
  },
];
