// En la mano: la mochi no tiene brazos, así que lo "abraza" con el costado
// derecho: el objeto se apoya sobre el borde del cuerpo, a media altura.
// Cada objeto se dibuja alrededor de (0, 0), que es el punto de apoyo.

import { G, P, Ell, Cir, OUT, GOLD, GOLD_D, SILVER, SILVER_D, shade, mixc, f, T, part, flat, line, shine, dot, ball, disc, ellD, heartD, starD, sparkleD, flower } from './kit.js';

export const HAND_ITEMS = [
  {
    id: 'boba', label: 'Té de burbujas', vibes: ['kawaii', 'y2k', 'aesthetic'], price: 70, colors: ['#E8C8A8', '#FF8FB0'],
    draw: () => (k) => part('M-9 -24 L9 -24 L7 6 Q0 9 -7 6Z', mixc(k.c1, '#FFFFFF', 0.25))
      + flat('M-8.6 -16 L8.6 -16 L7 6 Q0 9 -7 6Z', k.c1)
      + [[-3, 2], [2, 3], [4, -2], [-4, -3], [0, -1]].map(([x, y]) => dot(x, y, 1.8, '#4A3439')).join('')
      + part('M-10.5 -28 Q0 -31 10.5 -28 L10 -23 Q0 -21 -10 -23Z', k.c2, { 'stroke-width': 1.8 })
      + line('M3 -29 L7 -42', k.c2, 3) + line('M3 -29 L7 -42', OUT, 1, { opacity: 0.35 }) + line('M-5 -12 L-4.4 2', '#FFFFFF', 1.6, { opacity: 0.6 }),
  },
  {
    id: 'helado', label: 'Helado', vibes: ['kawaii', 'playera'], price: 50, colors: ['#FFB6CC', '#C9F0DC'],
    draw: () => (k) => part('M-7 -10 L0 12 L7 -10Z', '#E6A65D') + line('M-4 -6 l7 7 M-2 -10 l8 8 M4 -8 l-6 10', '#B97835', 1.2)
      + disc(0, -16, 9, 8.5, k.c1) + disc(-5, -10, 5, 4.4, k.c2, { 'stroke-width': 1.6 }) + shine(-3, -20, 2) + ball(1, -25, 2.6, '#D8505A', { 'stroke-width': 1.4 }),
  },
  {
    id: 'varita', label: 'Varita mágica', vibes: ['celestial', 'princesa', 'kawaii'], price: 90, colors: ['#FFD45C', '#FF9EC4'],
    draw: () => (k) => line('M-2 8 L8 -26', OUT, 5) + line('M-2 8 L8 -26', k.c2, 2.6)
      + part(starD(9, -30, 9.5, 0.5), k.c1, { stroke: shade(k.c1, -2) }) + shine(6.5, -33, 1.6)
      + flat(sparkleD(20, -40, 2.6), '#FFFFFF') + flat(sparkleD(-1, -40, 2), '#FFFFFF'),
  },
  {
    id: 'globo', label: 'Globo de corazón', vibes: ['kawaii', 'coquette'], price: 45, colors: ['#FF6F91'],
    draw: () => (k) => line('M0 4 C6 -10 -4 -22 4 -34', OUT, 1.4)
      + part(heartD(5, -46, 12), k.c1, { stroke: shade(k.c1, -2) }) + P('M2 -36 l3 3 l3 -3Z', { fill: k.c1, stroke: OUT, 'stroke-width': 1.4, 'data-r': 'part' }) + line('M-1 -52 Q2 -56 6 -55', '#FFFFFF', 2, { opacity: 0.7 }),
  },
  {
    id: 'ramo', label: 'Ramo de flores', vibes: ['coquette', 'cottagecore'], price: 80, colors: ['#FF9EC4', '#FFFFFF'],
    draw: () => (k) => line('M-2 8 L-6 -14 M1 8 L0 -18 M4 8 L7 -14', '#5FA66A', 2.2)
      + flower(-7, -18, 6, k.c1, 10) + flower(7, -18, 6, k.c2, 40, '#FFC94D') + flower(0, -25, 6.5, mixc(k.c1, '#FFFFFF', 0.4), 70)
      + part('M-9 -6 L9 -6 L4 10 L-4 10Z', '#F2E6D0') + part('M-5 -5 l5 5 l5 -5', '#FF7FA8', { 'stroke-width': 1.4 }),
  },
  {
    id: 'peluche', label: 'Osito de peluche', vibes: ['kawaii'], price: 85, colors: ['#C08A62'],
    draw: () => (k) => {
      const light = mixc(k.c1, '#FFFFFF', 0.45);
      return disc(-7, -24, 4.6, 4.6, k.c1) + disc(7, -24, 4.6, 4.6, k.c1) + disc(0, 0, 10, 9, k.c1) + disc(0, -16, 10, 9.5, k.c1)
        + Ell(0, -13, 4.6, 3.4, { fill: light, 'data-r': 'flat' }) + dot(-4, -18, 1.4, OUT) + dot(4, -18, 1.4, OUT) + Ell(0, -14, 1.6, 1.1, { fill: OUT, 'data-r': 'flat' })
        + Ell(0, 2, 5, 4.2, { fill: light, 'data-r': 'flat' }) + part('M-4 -8 l4 2 l4 -2 l-1 3 l-3 -1 l-3 1Z', '#FF7FA8', { 'stroke-width': 1.2 });
    },
  },
  {
    id: 'control', label: 'Control de videojuego', vibes: ['gamer', 'otaku'], price: 90, colors: ['#5B5B7A', '#FF5FA2'],
    draw: () => (k) => part('M-16 -10 Q-16 -18 -8 -18 L8 -18 Q16 -18 16 -10 L18 2 Q19 8 13 8 Q9 8 7 3 L-7 3 Q-9 8 -13 8 Q-19 8 -18 2Z', k.c1)
      + flat('M-11 -12 h3 v-3 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3Z', '#2A2230') + ball(8, -12, 2.2, k.c2, { 'stroke-width': 1 }) + ball(12, -8, 2.2, '#7FC8F8', { 'stroke-width': 1 }) + ball(4, -8, 2.2, '#FFD45C', { 'stroke-width': 1 }),
  },
  {
    id: 'microfono', label: 'Micrófono', vibes: ['rockera', 'y2k'], price: 80, colors: ['#3A3044', SILVER],
    draw: () => (k) => part('M-3.5 -8 L3.5 -8 L2.5 12 Q0 14 -2.5 12Z', k.c1) + disc(0, -15, 7.5, 8, k.c2, { stroke: SILVER_D })
      + line('M-5 -18 h10 M-6 -14 h12 M-5 -10 h10', SILVER_D, 1, { opacity: 0.8 }) + shine(-2.6, -19, 1.6),
  },
  {
    id: 'libro', label: 'Libro', vibes: ['academia', 'aesthetic'], price: 60, colors: ['#8E1F2C', GOLD],
    draw: () => (k) => part('M-14 -18 L12 -22 L14 6 L-12 10Z', k.c1) + part('M-12 10 L14 6 L14 9 L-12 13Z', '#FFF8EE', { 'stroke-width': 1.6 })
      + line('M-8 -12 L7 -15 M-7 -6 L6 -9', k.c2, 1.6) + flat(starD(0, -1, 3), k.c2),
  },
  {
    id: 'camara', label: 'Cámara instantánea', vibes: ['aesthetic', 'y2k'], price: 110, colors: ['#F7C6D9', '#FFFFFF'],
    draw: () => (k) => part('M-16 -16 Q-16 -20 -12 -20 L12 -20 Q16 -20 16 -16 L16 8 Q16 12 12 12 L-12 12 Q-16 12 -16 8Z', k.c1)
      + disc(0, -3, 8, 8, '#4A4458') + Cir(0, -3, 4.6, { fill: '#2A2230', stroke: '#8A84A8', 'stroke-width': 1.2, 'data-r': 'part' }) + shine(-2, -5, 1.6)
      + part('M8 -18 h5 v4 h-5Z', '#FFE07A', { 'stroke-width': 1.2 }) + flat('M-13 -17 h6 v3 h-6Z', k.c2),
  },
  {
    id: 'cafe', label: 'Café con leche', vibes: ['aesthetic', 'academia'], price: 55, colors: ['#FFFFFF', '#B07A4A'],
    draw: () => (k) => part('M-9 -16 L9 -16 L7 8 Q0 11 -7 8Z', k.c1) + part('M-10 -20 Q0 -23 10 -20 L10 -15 Q0 -13 -10 -15Z', shade(k.c2, -0.6), { 'stroke-width': 1.8 })
      + part('M-8.6 -8 L8.6 -8 L8 0 L-8 0Z', k.c2, { 'stroke-width': 1.4 }) + flat(heartD(0, -4.4, 2), '#FFFFFF'),
  },
  {
    id: 'paraguas', label: 'Paraguas', vibes: ['cottagecore', 'kawaii'], price: 100, colors: ['#FF9EC4', '#FFFFFF'],
    draw: () => (k) => line('M0 10 L0 -40', OUT, 3.4) + line('M0 10 L0 -40', '#B8B0C8', 1.6) + line('M0 10 q0 5 -5 5', OUT, 3)
      + part('M-28 -36 C-26 -56 26 -56 28 -36 Q21 -40 14 -36 Q7 -40 0 -36 Q-7 -40 -14 -36 Q-21 -40 -28 -36Z', k.c1)
      + flat('M-7 -51 C-3 -54 3 -54 7 -51 L7 -37 Q3.5 -39.5 0 -36 Q-3.5 -39.5 -7 -37Z', k.c2, { opacity: 0.9 }) + ball(0, -54, 2, k.c2, { 'stroke-width': 1 }),
  },
  {
    id: 'canasta', label: 'Canasta de pícnic', vibes: ['cottagecore'], price: 90, colors: ['#C8955E', '#FF6F6F'],
    draw: () => (k) => line('M-12 -10 C-12 -30 12 -30 12 -10', shade(k.c1, -0.8), 3)
      + part('M-16 -10 L16 -10 L12 10 L-12 10Z', k.c1) + line('M-15 -4 H15 M-14 2 H14 M-8 -10 L-7 10 M0 -10 V10 M8 -10 L7 10', shade(k.c1, -1), 1.2)
      + part('M-16 -12 L16 -12 L16 -8 L-16 -8Z', k.c2, { 'stroke-width': 1.6 }) + flat('M-12 -12 h4 v4 h-4Z M-2 -12 h4 v4 h-4Z M8 -12 h4 v4 h-4Z', '#FFFFFF'),
  },
  {
    id: 'calabazaLinterna', label: 'Calabaza encendida', vibes: ['temporada', 'gotica'], price: 70, colors: ['#F28C38'],
    draw: () => (k) => disc(0, -6, 14, 12, k.c1) + line('M-5 -17 Q-7 -6 -5 5 M5 -17 Q7 -6 5 5', shade(k.c1, -1), 1.4)
      + flat('M-8 -9 l3 -4 l3 4Z M2 -9 l3 -4 l3 4Z M-7 -1 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l-2 4 h-8Z', '#FFE07A') + part('M-1 -18 l0 -6 l3 0 l0 6Z', '#6B8A3A', { 'stroke-width': 1.4 }),
  },
];
