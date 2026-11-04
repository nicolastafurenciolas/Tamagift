// En la mano: la mochi no tiene brazos, así que lo "abraza" con el costado
// derecho: el objeto se apoya sobre el borde del cuerpo, a media altura.
// Cada objeto se dibuja alrededor de (0, 0), que es el punto de apoyo.
//
// Son objetos chiquitos: formas claras y regordetas, un material que se
// lea (vidrio con su brillo en raya, cartón con su manga, mimbre tejido)
// y un acento de color.

import {
  Cir, Ell, GOLD, GOLD_D, OUT, P, SILVER, ball, clipTo, disc, dot, ellD, flat, flower, heartD,
  lightOf, line, mixc, part, puffStarD, rr, shade, shine, skipPx, sparkleD, stitch, tone,
} from './kit.js';

export const HAND_ITEMS = [
  {
    id: 'boba', label: 'Té de burbujas', vibes: ['kawaii', 'y2k', 'aesthetic'], price: 70, colors: ['#E8C8A8', '#FF8FB0'],
    draw: () => (k) => {
      const cup = 'M-10 -22 L10 -22 L7.5 8 Q0 11 -7.5 8Z';
      // vaso de plástico: té con leche en dos tonos, perlas negras, tapa en cúpula y pajita gruesa
      return line('M2.5 -31 L7.5 -46', OUT, 5.4) + line('M2.5 -31 L7.5 -46', k.c2, 3.4) + line('M3.6 -35 l1.4 -4 M5.6 -41 l1 -3', '#FFFFFF', 1.2, { opacity: 0.8 })
        + part(cup, mixc(k.c1, '#FFFFFF', 0.55))
        + clipTo(cup, flat('M-12 -15 H12 V12 H-12Z', k.c1) + flat('M-12 -15 Q0 -12 12 -15 V-11 Q0 -8 -12 -11Z', lightOf(k.c1, 0.6))
          + [[-4, 4], [1, 6], [5, 2], [-5, -2], [0, 0], [3.5, -4]].map(([x, y]) => dot(x, y, 2.1, '#3A2630') + shine(x - 0.6, y - 0.7, 0.5)).join('')
          + tone('M3 -22 H12 V12 H4Z', '#2A1C30', 0.14))
        + line('M-6.5 -18 L-5 4', '#FFFFFF', 1.8, { opacity: 0.75 })
        + part('M-11.5 -22 Q-11 -31 0 -32 Q11 -31 11.5 -22 Q0 -19 -11.5 -22Z', mixc('#FFFFFF', k.c2, 0.15), { 'stroke-width': 1.8 })
        + part('M-12 -23 Q0 -20 12 -23 L11.6 -20 Q0 -17 -11.6 -20Z', k.c2, { 'stroke-width': 1.5 })
        + line('M-7 -27 Q-4 -30 0 -30', '#FFFFFF', 1.4, { opacity: 0.9 })
        + part(heartD(0, -6, 3), k.c2, { 'stroke-width': 1 });
    },
  },
  {
    id: 'helado', label: 'Helado', vibes: ['kawaii', 'playera'], price: 50, colors: ['#FFB6CC', '#C9F0DC'],
    draw: () => (k) => {
      const cone = 'M-8 -10 L0 13 L8 -10Z';
      return part(cone, '#E6A65D') + clipTo(cone, line('M-8 -4 l12 12 M-5 -10 l14 14 M3 -10 l-10 10 M8 -6 l-12 12', '#B97835', 1.3) + tone('M0 -12 L10 -12 L1 14Z', '#7A4A20', 0.18))
        + part('M-10 -10 Q0 -6 10 -10 L9 -7 Q0 -3 -9 -7Z', '#F2C27A', { 'stroke-width': 1.4 })
        // dos bolas con su chorreado y la cereza
        + part('M-10 -10 C-12 -16 -8 -21 -3 -20 C2 -24 9 -20 9 -14 C11 -12 11 -9 9 -9 C8 -6 6 -9 5 -7 C3 -4 1 -8 -1 -8 C-3 -5 -5 -9 -7 -8 C-9 -6 -11 -8 -10 -10Z', k.c2, { 'stroke-width': 1.8 })
        + part('M-8 -18 C-10 -26 -3 -31 2 -29 C8 -31 12 -25 9 -19 C10 -16 7 -15 6 -17 C4 -14 2 -17 0 -16 C-2 -13 -4 -17 -6 -15 C-8 -14 -9 -16 -8 -18Z', k.c1, { 'stroke-width': 1.8 })
        + shine(-3, -25, 1.8) + shine(-6, -15, 1.2)
        + line('M2 -30 q1 -4 4 -5', '#5A8A3A', 1.3) + ball(1.5, -31, 2.8, '#D8505A', { 'stroke-width': 1.3 }) + shine(0.7, -32, 0.7)
        + dot(-4, -22, 0.8, '#FF6F91') + dot(3, -24, 0.8, '#7FC8F8') + dot(5, -20, 0.8, '#FFD45C');
    },
  },
  {
    id: 'varita', label: 'Varita mágica', vibes: ['celestial', 'princesa', 'kawaii'], price: 90, colors: ['#FFD45C', '#FF9EC4'],
    draw: () => (k) => line('M-2 9 L7.5 -24', OUT, 5.2) + line('M-2 9 L7.5 -24', '#FFFFFF', 3) + line('M-0.6 4 L1.2 -2 M2.2 -6 L4 -12 M5 -16 L6.4 -21', k.c2, 3, { 'stroke-linecap': 'butt' })
      // cinta con moño bajo la estrella
      + part('M6 -24 C1 -21 -1 -16 1 -12 C3 -15 4 -19 7 -21Z M8 -24 C12 -20 14 -15 12 -11 C10 -14 9 -18 7 -21Z', k.c2, { 'stroke-width': 1.3 })
      + part(puffStarD(9, -31, 10.5, 0.52), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.8 }) + flat(puffStarD(8.2, -32, 5.4, 0.52), lightOf(k.c1, 0.8)) + shine(5.6, -34.5, 1.5)
      + flat(sparkleD(22, -42, 2.8), '#FFFFFF') + flat(sparkleD(-2, -41, 2.2), '#FFFFFF') + flat(sparkleD(21, -24, 1.8), k.c2),
  },
  {
    id: 'globo', label: 'Globo de corazón', vibes: ['kawaii', 'coquette'], price: 45, colors: ['#FF6F91'],
    draw: () => (k) => line('M0 4 C6 -8 -4 -20 3 -33', shade(k.c1, -1.4), 1.4)
      + part(heartD(5, -46, 13), k.c1, { stroke: shade(k.c1, -2.2) })
      + clipTo(heartD(5, -46, 13), tone('M8 -64 C20 -60 22 -44 12 -34 L24 -30 L24 -66Z', '#5A1028', 0.18))
      + P('M1.5 -35 l3.5 3 l3.5 -3Z', { fill: shade(k.c1, -0.4), stroke: OUT, 'stroke-width': 1.4, 'data-r': 'part' })
      + line('M-3 -52 Q0 -57 5 -56', '#FFFFFF', 2.4, { opacity: 0.85 }) + shine(-4.6, -48, 1.3),
  },
  {
    id: 'ramo', label: 'Ramo de flores', vibes: ['coquette', 'cottagecore'], price: 80, colors: ['#FF9EC4', '#FFFFFF'],
    draw: () => (k) => line('M-3 6 L-7 -14 M0 6 L0 -18 M3 6 L7 -14', '#4E9A5E', 2.2)
      + part('M-6 -12 C-14 -14 -16 -6 -10 -4 C-8 -8 -7 -10 -6 -12Z M7 -12 C15 -14 17 -6 11 -4 C9 -8 8 -10 7 -12Z', '#6CBF6A', { 'stroke-width': 1.3 })
      + flower(-8, -18, 6.4, k.c1, 10) + flower(8, -19, 6, k.c2, 40, '#FFC94D') + flower(0, -26, 7, mixc(k.c1, '#FFFFFF', 0.4), 70)
      + dot(-13, -26, 1.6, '#FFFFFF') + dot(13, -28, 1.6, '#FFFFFF') + dot(-3, -34, 1.4, '#FFFFFF')
      // papel kraft en cucurucho con su moño
      + part('M-11 -8 L11 -8 L4 12 L-4 12Z', '#E9D6B8') + clipTo('M-11 -8 L11 -8 L4 12 L-4 12Z', tone('M2 -10 L13 -10 L5 14 L1 14Z', '#7A5A30', 0.18) + line('M-7 -8 L-2 12 M5 -8 L2 12', '#C9AE86', 1, { opacity: 0.8 }))
      + part('M-5 -1 l5 4 l5 -4 l-1 6 l-4 -1 l-4 1Z', '#FF7FA8', { 'stroke-width': 1.3 }),
  },
  {
    id: 'peluche', label: 'Osito de peluche', vibes: ['kawaii'], price: 85, colors: ['#C08A62'],
    draw: () => (k) => {
      const light = mixc(k.c1, '#FFFFFF', 0.45);
      return disc(-7.5, -25, 4.8, 4.8, k.c1) + disc(7.5, -25, 4.8, 4.8, k.c1) + dot(-7.5, -25, 2.2, light) + dot(7.5, -25, 2.2, light)
        + disc(-9, 3, 4, 4, k.c1) + disc(9, 3, 4, 4, k.c1)
        + disc(0, 0, 10.5, 9.5, k.c1) + disc(0, -16, 10.5, 10, k.c1)
        + clipTo(ellD(0, -16, 10.5, 10), tone('M3 -28 C12 -24 13 -12 6 -6 L14 -6 L14 -28Z', '#2A1C30', 0.16))
        + Ell(0, -12.5, 5, 3.8, { fill: light, 'data-r': 'flat' }) + dot(-4.2, -18.5, 1.6, OUT) + dot(4.2, -18.5, 1.6, OUT) + shine(-3.7, -19, 0.5) + shine(4.7, -19, 0.5)
        + Ell(0, -13.8, 1.7, 1.2, { fill: OUT, 'data-r': 'flat' }) + line('M0 -12.6 v1.4 q-1.4 1.4 -2.4 0.6 M0 -11.2 q1.4 1.4 2.4 0.6', OUT, 0.9)
        + Ell(0, 2, 5.4, 4.6, { fill: light, 'data-r': 'flat' }) + skipPx(stitch('M0 -2 V6', shade(k.c1, -1), 0.9))
        + part('M-5 -7 l5 2.4 l5 -2.4 l-1 3.6 l-4 -1.2 l-4 1.2Z', '#FF7FA8', { 'stroke-width': 1.2 });
    },
  },
  {
    id: 'control', label: 'Control de videojuego', vibes: ['gamer', 'otaku'], price: 90, colors: ['#5B5B7A', '#FF5FA2'],
    draw: () => (k) => {
      const body = 'M-17 -11 Q-17 -19 -9 -19 L9 -19 Q17 -19 17 -11 L19 2 Q20 9 13.5 9 Q9.5 9 7.5 4 L-7.5 4 Q-9.5 9 -13.5 9 Q-20 9 -19 2Z';
      return part(body, k.c1) + clipTo(body, tone('M-20 -2 Q0 4 20 -2 V12 H-20Z', '#1A1428', 0.2))
        + line('M-14 -15 Q-8 -17 -2 -17', lightOf(k.c1), 1.4, { opacity: 0.8 })
        + part('M-12 -13 h3 v-3 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3Z', '#2A2230', { 'stroke-width': 1 })
        + ball(9, -13, 2.3, k.c2, { 'stroke-width': 1 }) + ball(13, -9, 2.3, '#7FC8F8', { 'stroke-width': 1 }) + ball(5, -9, 2.3, '#FFD45C', { 'stroke-width': 1 }) + ball(9, -5, 2.3, '#8ED07A', { 'stroke-width': 1 })
        + flat(rr(-3.6, -10, 2.6, 1.6, 0.6), shade(k.c1, -1.2)) + flat(rr(1, -10, 2.6, 1.6, 0.6), shade(k.c1, -1.2));
    },
  },
  {
    id: 'microfono', label: 'Micrófono', vibes: ['rockera', 'y2k'], price: 80, colors: ['#3A3044', SILVER],
    draw: () => (k) => {
      const head = ellD(0, -16, 8, 8.4);
      return part('M-3.6 -8 L3.6 -8 L2.4 13 Q0 15 -2.4 13Z', k.c1) + line('M-1.6 -4 L-1 11', lightOf(k.c1), 1.2, { opacity: 0.7 })
        + part(rr(-4.6, -10, 9.2, 3.6, 1), GOLD, { stroke: GOLD_D, 'stroke-width': 1.2 })
        + part(head, k.c2, { stroke: shade(k.c2, -2.2) })
        + clipTo(head, line('M-9 -22 l18 0 M-9 -18 l18 0 M-9 -14 l18 0 M-9 -10 l18 0 M-6 -26 l0 20 M-2 -26 l0 20 M2 -26 l0 20 M6 -26 l0 20', shade(k.c2, -1.2), 0.8, { opacity: 0.7 }) + tone('M2 -26 C10 -22 10 -12 4 -8 L10 -8 L10 -26Z', '#2A1C30', 0.18))
        + shine(-3, -20, 1.8) + line('M-1 13 C-2 18 4 20 6 24', OUT, 1.4);
    },
  },
  {
    id: 'libro', label: 'Libro', vibes: ['academia', 'aesthetic'], price: 60, colors: ['#8E1F2C', GOLD],
    draw: () => (k) => {
      // tapa dura con lomo, canto de hojas, cinta marcapáginas y adorno dorado
      return part('M-12 10 L14 6 L14 9.5 L-12 13.5Z', '#FFF8EE', { 'stroke-width': 1.5 }) + line('M-10 11.6 L12 7.8', '#D8C8B0', 0.9)
        + part('M-15 -18 L12 -22 L14 6 L-12 10Z', k.c1)
        + part('M-15 -18 L-11 -18.6 L-8 9.4 L-12 10Z', shade(k.c1, -0.5), { 'stroke-width': 1.5 })
        + part('M-4 -14 L8 -16 L9.4 -3 L-2.6 -1Z', 'none', { stroke: k.c2, 'stroke-width': 1.4 })
        + flat(puffStarD(3.2, -8.4, 3.2), k.c2) + line('M-3 2 L10 0', k.c2, 1.2)
        + part('M5 9 L5 17 L7 15 L9 17 L8.6 8.4Z', '#FF7FA8', { 'stroke-width': 1.1 })
        + line('M-6 -15 L-4 6', lightOf(k.c1), 1.2, { opacity: 0.6 });
    },
  },
  {
    id: 'camara', label: 'Cámara instantánea', vibes: ['aesthetic', 'y2k'], price: 110, colors: ['#F7C6D9', '#FFFFFF'],
    draw: () => (k) => {
      const body = 'M-17 -16 Q-17 -21 -12 -21 L12 -21 Q17 -21 17 -16 L17 9 Q17 13 12 13 L-12 13 Q-17 13 -17 9Z';
      return part(body, k.c1) + clipTo(body, tone('M-18 2 H18 V14 H-18Z', '#2A1C30', 0.14) + flat('M-18 -12 H18 V-9 H-18Z', k.c2))
        + flat(rr(-8, -12, 3, 3, 0), '#FF6F6F') + flat(rr(-5, -12, 3, 3, 0), '#FFC94D') + flat(rr(-2, -12, 3, 3, 0), '#8ED07A') + flat(rr(1, -12, 3, 3, 0), '#7FC8F8')
        + disc(0, -2, 9, 9, mixc(k.c1, '#FFFFFF', 0.4)) + disc(0, -2, 6.2, 6.2, '#3A3550', { 'stroke-width': 1.6 }) + Cir(0, -2, 3.4, { fill: '#1C1828', stroke: '#8A84A8', 'stroke-width': 1, 'data-r': 'part' })
        + shine(-2, -4, 1.6) + shine(1.6, 0, 0.7)
        + part(rr(8, -19, 6, 4.4, 1), '#FFF4C8', { 'stroke-width': 1.2 }) + part(rr(-14, -19, 6, 4, 1), '#2A2230', { 'stroke-width': 1.1 })
        + part('M-9 13 L9 13 L8 19 L-8 19Z', '#FFFFFF', { 'stroke-width': 1.4 }) + flat('M-6 13.6 L6 13.6 L5.6 16.6 L-5.6 16.6Z', '#BFD7FF');
    },
  },
  {
    id: 'cafe', label: 'Café con leche', vibes: ['aesthetic', 'academia'], price: 55, colors: ['#FFFFFF', '#B07A4A'],
    draw: () => (k) => {
      const cup = 'M-9 -16 L9 -16 L7 9 Q0 12 -7 9Z';
      return line('M-3 -27 q-3 -4 0 -8 q3 -4 0 -8 M4 -27 q-3 -4 0 -8', '#D6E2F2', 1.8, { opacity: 0.85 })
        + part(cup, k.c1) + clipTo(cup, tone('M3 -18 H11 V12 H4Z', '#2A1C30', 0.14))
        + part('M-10 -21 Q0 -24 10 -21 L10 -15.5 Q0 -13.5 -10 -15.5Z', shade(k.c2, -0.7), { 'stroke-width': 1.8 })
        + part('M-6 -24 Q0 -26 6 -24 L6 -21.5 Q0 -20.5 -6 -21.5Z', shade(k.c2, -0.9), { 'stroke-width': 1.4 })
        + part('M-8.7 -8 L8.7 -8 L8 1 L-8 1Z', k.c2, { 'stroke-width': 1.5 }) + skipPx(line('M-7 -6 L-7 -1 M-4 -6 L-4 -1 M-1 -6 L-1 -1 M2 -6 L2 -1 M5 -6 L5 -1', shade(k.c2, -0.8), 0.8, { opacity: 0.6 }))
        + flat(heartD(0, -3.6, 2.6), '#FFFFFF') + line('M-6 -13 L-5.2 6', '#FFFFFF', 1.4, { opacity: 0.6 });
    },
  },
  {
    id: 'paraguas', label: 'Paraguas', vibes: ['cottagecore', 'kawaii'], price: 100, colors: ['#FF9EC4', '#FFFFFF'],
    draw: () => (k) => {
      const can = 'M-29 -36 C-27 -58 27 -58 29 -36 Q21.75 -40 14.5 -36 Q7.25 -40 0 -36 Q-7.25 -40 -14.5 -36 Q-21.75 -40 -29 -36Z';
      return line('M0 10 L0 -40', OUT, 3.6) + line('M0 10 L0 -40', '#C8B8A0', 1.8) + line('M0 10 q0 6 -6 6 q-3 0 -3 -3', OUT, 3.4) + line('M0 10 q0 6 -6 6 q-3 0 -3 -3', '#8A5A3C', 1.8)
        + part(can, k.c1) + clipTo(can, flat('M-8 -56 L8 -56 L7 -37 Q3.5 -40 0 -36 Q-3.5 -40 -7 -37Z M-29 -56 L-20 -56 L-22 -36 Q-25 -39 -29 -36Z M29 -56 L20 -56 L22 -36 Q25 -39 29 -36Z', k.c2, { opacity: 0.95 })
          + tone('M6 -60 C24 -56 30 -46 30 -36 L34 -36 L34 -62Z', '#2A1C30', 0.16))
        + line('M0 -53 Q-8 -46 -14.5 -37 M0 -53 Q8 -46 14.5 -37 M0 -53 Q-18 -48 -29 -37 M0 -53 Q18 -48 29 -37', shade(k.c1, -1), 0.9, { opacity: 0.6 })
        + line('M-22 -44 C-18 -51 -10 -54 -4 -54', '#FFFFFF', 1.6, { opacity: 0.75 })
        + ball(0, -55, 2.2, k.c2, { 'stroke-width': 1 });
    },
  },
  {
    id: 'canasta', label: 'Canasta de pícnic', vibes: ['cottagecore'], price: 90, colors: ['#C8955E', '#FF6F6F'],
    draw: () => (k) => {
      const box = 'M-16 -9 L16 -9 L12 11 L-12 11Z';
      // mimbre tejido, mantel a cuadros asomando y una baguette
      return line('M-12 -9 C-12 -31 12 -31 12 -9', OUT, 4.4) + line('M-12 -9 C-12 -31 12 -31 12 -9', shade(k.c1, -0.4), 2.4)
        + part('M2 -10 L12 -26 L15 -24 L6 -9Z', '#E3B66E', { 'stroke-width': 1.4 }) + line('M8 -20 l2 1 M10 -23 l2 1', '#B98A48', 1)
        + part(box, k.c1) + clipTo(box, line('M-17 -3 H17 M-16 3 H16 M-16 8 H16', shade(k.c1, -1), 1.1) + line('M-11 -9 L-8.5 11 M-5 -9 L-4 11 M1 -9 L1 11 M7 -9 L6 11 M12 -9 L9.5 11', shade(k.c1, -0.7), 0.9, { opacity: 0.8 }) + tone('M6 -10 H18 V12 H4Z', '#2A1C30', 0.16))
        + part('M-17 -12 L17 -12 L16 -7 L-16 -7Z', k.c2, { 'stroke-width': 1.5 }) + flat('M-13 -12 h4 v5 h-4Z M-4 -12 h4 v5 h-4Z M5 -12 h4 v5 h-4Z', '#FFFFFF')
        + part('M-14 -7 L-10 -7 L-11 -2 Z', k.c2, { 'stroke-width': 1.2 });
    },
  },
  {
    id: 'calabazaLinterna', label: 'Calabaza encendida', vibes: ['temporada', 'gotica'], price: 70, colors: ['#F28C38'],
    draw: () => (k) => {
      const dk = shade(k.c1, -0.5);
      return line('M-12 -12 C-12 -34 12 -34 12 -12', OUT, 2.6) + line('M-12 -12 C-12 -34 12 -34 12 -12', '#6A5E80', 1.2)
        + disc(-8, -4, 9, 11, dk) + disc(8, -4, 9, 11, dk) + disc(0, -4, 10, 12.5, k.c1)
        + line('M-4 -15 Q-6 -4 -4 7 M4 -15 Q6 -4 4 7', shade(k.c1, -1.2), 1.2, { opacity: 0.7 })
        // la cara tallada brilla por dentro
        + flat('M-8 -8 l3.4 -4.4 l3.4 4.4Z M1.2 -8 l3.4 -4.4 l3.4 4.4Z M-8 -1 l2.2 2.2 l2.2 -2.2 l2.2 2.2 l2.2 -2.2 l2.2 2.2 l2.2 -2.2 l-1.6 4.6 h-8.6Z', '#FFE07A')
        + flat('M-7 -8.4 l2.4 -3 l1 1.3Z M2.2 -8.4 l2.4 -3 l1 1.3Z', '#FFF6C8')
        + part('M-1.2 -16 l0 -6 l3 0 l0 6Z', '#6B8A3A', { 'stroke-width': 1.3 }) + shine(-6, -13, 1.6);
    },
  },
];
