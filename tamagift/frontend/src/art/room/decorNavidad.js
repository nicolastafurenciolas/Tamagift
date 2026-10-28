// Decoración de Navidad (del 1 de diciembre a Reyes, ver seasons.js).
// Como la de Halloween: tierna, con la misma vista 3/4 que todo el cuarto.
// `giftOnly`: no se vende; llega de regalo (la esfera de nieve, el 24).

import { face, part, flat, line, shade, shine, rr, ellD, tone, box, Cir, Ell, INK } from './draw.js';

const surf = (cx, y, rx) => Ell(cx, y, rx, rx * 0.22, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });
const floorSh = (cx, y, rx, ry = rx * 0.16) => Ell(cx, y, rx, ry, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });
const glow = (cx, cy, rx, ry, c, op = 0.32) => Ell(cx, cy, rx, ry, { fill: c, opacity: op, 'data-r': 'tone' });
const star = (x, y, r, k = 0.48) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr2 = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr2).toFixed(1)} ${(y + Math.sin(a) * rr2).toFixed(1)}`; } return `${d}Z`; };
const ball = (x, y, r, c) => Cir(x, y, r, { fill: c, stroke: INK, 'stroke-width': 1.3, 'data-r': 'part' }) + Cir(x - r * 0.35, y - r * 0.35, r * 0.3, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' });

const RED = '#D9364F', RED_D = '#A8283C', GREEN = '#2F7A4E', GREEN_M = '#3E9461', GREEN_L = '#56AE78';
const GOLD = '#FFD45C', SNOW = '#F6F9FF', SNOW_SH = '#D6E2F2', BLUSH = '#FFB6CC', BROWN = '#A9744F';

// Moño de cinta con centro en (x, y).
const bow = (x, y, s, c) => part(`M${x} ${y} C${x - 6 * s} ${y - 8 * s} ${x - 15 * s} ${y - 7 * s} ${x - 14 * s} ${y} C${x - 13 * s} ${y + 6 * s} ${x - 5 * s} ${y + 4 * s} ${x} ${y}Z M${x} ${y} C${x + 6 * s} ${y - 8 * s} ${x + 15 * s} ${y - 7 * s} ${x + 14 * s} ${y} C${x + 13 * s} ${y + 6 * s} ${x + 5 * s} ${y + 4 * s} ${x} ${y}Z`, c, { w: 1.4 })
  + part(`M${x - 2 * s} ${y + 1} L${x - 7 * s} ${y + 11 * s} L${x - 2.5 * s} ${y + 9 * s}Z M${x + 2 * s} ${y + 1} L${x + 7 * s} ${y + 11 * s} L${x + 2.5 * s} ${y + 9 * s}Z`, tone(c, -0.5), { w: 1.2 })
  + part(ellD(x, y, 3 * s, 3.2 * s), tone(c, 0.3), { w: 1.2 });

export const DECOR_NAVIDAD = [
  {
    id: 'arbolNavidad', name: 'Arbolito de Navidad', price: 160, w: 124, h: 178, place: 'piso', season: 'navidad',
    draw: () => {
      let s = glow(62, 92, 58, 70, '#FFF0B0', 0.22) + floorSh(62, 175, 46, 6);
      s += face(rr(54, 146, 16, 16, 2), '#8A5A3C', { w: 1.8 });
      s += face('M38 156 L86 156 L81 175 L43 175Z', RED, { w: 1.8 }) + flat('M40 162 L84 162 L83 166 L41 166Z', GOLD);
      // tres pisos, del de abajo al de arriba
      s += part('M12 150 Q24 144 36 150 Q49 143 62 150 Q75 143 88 150 Q100 144 112 150 L84 104 Q62 112 40 104Z', GREEN, { w: 2 });
      s += part('M22 112 Q34 106 46 112 Q54 106 62 112 Q70 106 78 112 Q90 106 102 112 L78 70 Q62 78 46 70Z', GREEN_M, { w: 2 });
      s += part('M32 76 Q42 70 52 76 Q57 71 62 76 Q67 71 72 76 Q82 70 92 76 L62 30Z', GREEN_L, { w: 2 });
      s += shade('M62 30 L32 76 Q42 70 46 73 L62 36Z M46 70 L22 112 Q30 107 36 110 L48 76Z M40 104 L12 150 Q20 145 28 148 L44 110Z', '#FFFFFF', 0.16);
      // guirnaldas doradas y bolitas
      s += line('M38 92 Q62 102 86 90 M28 128 Q60 140 96 126 M46 60 Q62 66 78 58', GOLD, 2.2);
      [[44, 98, RED], [70, 97, '#7FA9DE'], [86, 84, GOLD], [34, 134, '#7FA9DE'], [56, 138, GOLD], [80, 134, RED], [100, 142, '#C9A6FF'], [22, 142, RED], [54, 64, RED], [72, 62, '#7FA9DE']].forEach(([x, y, c]) => { s += ball(x, y, 4.4, c); });
      // lucecitas
      [[50, 84], [76, 80], [40, 120], [66, 118], [90, 116], [62, 50]].forEach(([x, y], i) => { s += glow(x, y, 5, 5, ['#FFF3A8', '#FFB6CC', '#B8E8FF'][i % 3], 0.6) + Cir(x, y, 1.8, { fill: ['#FFF3A8', '#FFB6CC', '#B8E8FF'][i % 3], 'data-r': 'flat' }); });
      s += glow(62, 24, 16, 16, '#FFE89A', 0.5) + part(star(62, 24, 12), GOLD, { w: 1.6 }) + Cir(59, 21, 2, { fill: '#FFFFFF', 'data-r': 'shine' });
      return s;
    },
  },
  {
    id: 'coronaNavidad', name: 'Corona navideña', price: 70, w: 80, h: 86, place: 'sobre', season: 'navidad',
    draw: () => {
      let s = part(`${ellD(40, 38, 31, 31)} ${ellD(40, 38, 15, 15)}`, GREEN_M, { w: 2, a: { 'fill-rule': 'evenodd' } });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2, x = 40 + Math.cos(a) * 23, y = 38 + Math.sin(a) * 23;
        s += `<g transform="rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})">${part(ellD(x, y, 4.2, 8), i % 2 ? GREEN : GREEN_L, { w: 1.1 })}</g>`;
      }
      [[22, 22], [60, 26], [62, 52], [18, 50], [40, 12]].forEach(([x, y]) => { s += ball(x, y, 3.2, RED); });
      s += bow(40, 66, 1.25, RED);
      return s;
    },
  },
  {
    id: 'botasNavidad', name: 'Botas colgadas', price: 75, w: 120, h: 86, place: 'sobre', season: 'navidad',
    draw: () => {
      let s = line('M4 8 Q60 18 116 8', '#8C7A70', 1.6);
      const boot = (x, c, dy) => {
        const y = 12 + dy;
        let b = line(`M${x} ${y - 4} V${y}`, '#8C7A70', 1.2);
        b += part(`M${x - 9} ${y + 8} L${x - 9} ${y + 46} Q${x - 9} ${y + 58} ${x + 3} ${y + 58} L${x + 16} ${y + 58} Q${x + 24} ${y + 58} ${x + 24} ${y + 51} Q${x + 24} ${y + 45} ${x + 15} ${y + 44} L${x + 10} ${y + 44} L${x + 10} ${y + 8}Z`, c, { w: 1.8 });
        b += flat(`M${x - 9} ${y + 46} Q${x - 9} ${y + 58} ${x + 3} ${y + 58} L${x + 4} ${y + 49} Q${x - 3} ${y + 49} ${x - 9} ${y + 44}Z`, tone(c, 0.5));
        b += part(rr(x - 12, y, 25, 10, 4), SNOW, { w: 1.6 });
        return b;
      };
      s += boot(22, RED, 0) + boot(58, GREEN_M, 4) + boot(94, RED, 0);
      // un bastón de caramelo asoma de la del medio
      s += line('M63 22 V8 Q63 2 68 2 Q73 2 73 7', '#FFFFFF', 4) + line('M63 19 V17 M63 13 V11 M64 6 Q65 3 67 2.5 M71 2.5 Q73 4 73 7', RED, 4);
      s += flat(star(29, 56, 4), GOLD) + flat(star(101, 56, 4), GOLD);
      return s;
    },
  },
  {
    id: 'lucesNavidad', name: 'Luces de Navidad', price: 50, w: 154, h: 44, place: 'sobre', season: 'navidad',
    draw: () => {
      let s = line('M4 8 Q40 30 77 12 Q114 -4 150 18', '#3E6A4E', 1.8);
      const at = (t) => { const u = t * 2; if (u <= 1) { const x = 4 + 73 * u; return [x, (1 - u) * (1 - u) * 8 + 2 * (1 - u) * u * 30 + u * u * 12]; } const v = u - 1; return [77 + 73 * v, (1 - v) * (1 - v) * 12 + 2 * (1 - v) * v * -4 + v * v * 18]; };
      const cols = [RED, GOLD, '#7FC8F8', '#FF8FC8', '#8ED07A'];
      for (let i = 0; i < 11; i++) {
        const [x, y] = at((i + 0.5) / 11), c = cols[i % cols.length];
        s += glow(x, y + 9, 7, 7, c, 0.45);
        s += face(rr(x - 2.4, y, 4.8, 4, 1), '#3E6A4E', { w: 1 });
        s += part(`M${x} ${y + 3} C${x - 5} ${y + 6} ${x - 4.5} ${y + 13} ${x} ${y + 15} C${x + 4.5} ${y + 13} ${x + 5} ${y + 6} ${x} ${y + 3}Z`, c, { w: 1.2 });
        s += Cir(x - 1.4, y + 7.5, 1.1, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'shine' });
      }
      return s;
    },
  },
  {
    id: 'munecoNieve', name: 'Muñeco de nieve de peluche', price: 90, w: 84, h: 110, place: 'piso', season: 'navidad',
    draw: () => {
      let s = floorSh(42, 107, 32, 5.5);
      s += line('M14 64 L2 54 M6 58 L2 62 M70 64 L82 52 M78 56 L84 58', '#8A5A3C', 2.6);
      s += part(ellD(42, 82, 29, 25), SNOW, { w: 2 });
      s += shade('M58 62 C70 70 72 92 60 104 C66 92 66 74 54 64Z', SNOW_SH, 0.8);
      s += part(ellD(42, 42, 22, 20), SNOW, { w: 2 });
      s += shade('M54 26 C64 34 64 52 54 60 C58 50 58 36 50 28Z', SNOW_SH, 0.8);
      [70, 82, 94].forEach((y) => { s += Cir(42, y, 2.6, { fill: '#3A3044', 'data-r': 'flat' }); });
      s += Ell(34, 39, 2.6, 3.2, { fill: INK, 'data-r': 'flat' }) + Ell(50, 39, 2.6, 3.2, { fill: INK, 'data-r': 'flat' }) + Cir(35, 37.6, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(51, 37.6, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += part('M42 44 L56 47 L42 49Z', '#F28C38', { w: 1.2 });
      s += line('M37 52 q5 3 10 0', INK, 1.4);
      s += Ell(29, 47, 3.6, 2.2, { fill: BLUSH, 'data-r': 'flat' }) + Ell(55, 47, 3.6, 2.2, { fill: BLUSH, 'data-r': 'flat' });
      // bufanda y gorro de lana
      s += part('M22 58 Q42 66 62 58 L62 65 Q42 73 22 65Z', RED, { w: 1.6 }) + part('M52 64 L58 84 L50 84 L46 66Z', RED, { w: 1.5 }) + line('M51 80 V86 M54 80 V86 M57 80 V86', RED_D, 1.2);
      s += part('M22 30 C22 12 62 12 62 30Z', GREEN_M, { w: 1.8 }) + part(rr(20, 26, 44, 8, 4), SNOW, { w: 1.5 }) + part(ellD(42, 10, 5.5, 5.5), SNOW, { w: 1.4 });
      s += shine('M28 30 C30 26 33 24 36 23 C33 27 31 29 30 33Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'regalosApilados', name: 'Regalos apilados', price: 95, w: 114, h: 90, place: 'piso', season: 'navidad',
    draw: () => {
      let s = floorSh(57, 87, 52, 6);
      s += box(8, 86, 56, 40, 24, RED, { r: 3 }) + flat('M33 40 h6 v46 h-6Z', GOLD) + flat('M8 60 h56 v6 h-56Z', GOLD);
      s += box(60, 86, 46, 32, 22, GREEN_M, { r: 3 }) + flat('M80 48 h6 v38 h-6Z', RED) + flat('M60 66 h46 v5 h-46Z', RED);
      s += box(26, 40, 36, 24, 18, '#7FA9DE', { r: 3 }) + flat('M41 7 h5 v33 h-5Z', SNOW) + flat('M26 26 h36 v4 h-36Z', SNOW);
      s += bow(43, 8, 0.95, SNOW) + bow(83, 46, 0.8, RED);
      return s;
    },
  },
  {
    id: 'casitaJengibre', name: 'Casita de jengibre', price: 70, w: 80, h: 78, place: 'sobre', season: 'navidad',
    draw: () => {
      const G = '#C2864F';
      let s = surf(40, 75, 32);
      s += face(rr(12, 38, 56, 36, 2), G, { w: 1.9 });
      s += part('M6 42 L40 10 L74 42 L66 44 L40 20 L14 44Z', tone(G, -0.4), { w: 1.8 });
      let sc = '';
      for (let i = 0; i < 6; i++) sc += `M${12 + i * 9.3} 40 q4.6 6 9.3 0 `;
      s += line(sc, SNOW, 2.6) + line('M8 41 L40 12 L72 41', SNOW, 2.4);
      s += part('M33 74 L33 58 Q40 50 47 58 L47 74Z', '#8A5A3C', { w: 1.5 }) + Cir(44, 66, 1.3, { fill: GOLD, 'data-r': 'flat' });
      s += part(rr(17, 48, 11, 11, 1), '#FFE89A', { w: 1.4 }) + part(rr(52, 48, 11, 11, 1), '#FFE89A', { w: 1.4 }) + line('M22.5 48 V59 M17 53.5 H28 M57.5 48 V59 M52 53.5 H63', SNOW, 1.2);
      [[18, 68, RED], [26, 70, '#8ED07A'], [56, 70, '#7FC8F8'], [62, 67, RED], [40, 30, GOLD]].forEach(([x, y, c]) => { s += Cir(x, y, 2.4, { fill: c, stroke: INK, 'stroke-width': 0.9, 'data-r': 'part' }); });
      s += part(rr(54, 14, 7, 12, 1), tone(G, -0.6), { w: 1.3 });
      return s;
    },
  },
  {
    id: 'nochebuena', name: 'Nochebuena', price: 65, w: 74, h: 84, place: 'sobre', season: 'navidad',
    draw: () => {
      let s = surf(37, 81, 22);
      s += face('M22 58 L52 58 L48 80 L26 80Z', GOLD, { w: 1.8 }) + flat('M24 64 L50 64 L49.4 67 L24.6 67Z', '#E0A93A');
      const petal = (a, len, c) => `<g transform="rotate(${a} 37 34)">${part(`M37 34 C33 ${34 - len * 0.4} 34 ${34 - len * 0.8} 37 ${34 - len} C40 ${34 - len * 0.8} 41 ${34 - len * 0.4} 37 34Z`, c, { w: 1.3 })}</g>`;
      for (let i = 0; i < 6; i++) s += petal(i * 60 + 30, 24, GREEN_M);
      for (let i = 0; i < 6; i++) s += petal(i * 60, 22, RED);
      for (let i = 0; i < 5; i++) s += petal(i * 72 + 36, 13, '#E8505E');
      [[35, 32], [39, 33], [37, 36], [36, 35]].forEach(([x, y]) => { s += Cir(x, y, 1.6, { fill: GOLD, stroke: INK, 'stroke-width': 0.6, 'data-r': 'part' }); });
      return s;
    },
  },
  {
    id: 'renoPeluche', name: 'Renito de peluche', price: 90, w: 86, h: 106, place: 'piso', season: 'navidad',
    draw: () => {
      const B = '#B07A52', L = '#F2D9BC';
      let s = floorSh(43, 103, 30, 5);
      s += line('M30 24 C26 14 22 10 16 8 M24 14 L18 18 M56 24 C60 14 64 10 70 8 M62 14 L68 18', '#8A5A3C', 3.4);
      s += part(ellD(43, 78, 24, 22), B, { w: 1.9 });
      s += part(ellD(43, 82, 13, 12), L, { w: 1.2 });
      s += part(ellD(30, 99, 8, 4.4), B, { w: 1.5 }) + part(ellD(56, 99, 8, 4.4), B, { w: 1.5 });
      s += part('M22 34 C14 30 12 40 20 42Z', B, { w: 1.5 }) + part('M64 34 C72 30 74 40 66 42Z', B, { w: 1.5 });
      s += part(ellD(43, 42, 22, 19), B, { w: 1.9 });
      s += part(ellD(43, 50, 11, 8), L, { w: 1.2 });
      s += part(ellD(43, 47, 4.6, 4), RED, { w: 1.3 }) + Cir(41.6, 45.8, 1.2, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += Ell(35, 39, 2.6, 3.2, { fill: INK, 'data-r': 'flat' }) + Ell(51, 39, 2.6, 3.2, { fill: INK, 'data-r': 'flat' }) + Cir(36, 37.6, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(52, 37.6, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += line('M40 54 q3 2.6 6 0', INK, 1.3);
      s += Ell(28, 48, 3.4, 2, { fill: BLUSH, 'data-r': 'flat' }) + Ell(58, 48, 3.4, 2, { fill: BLUSH, 'data-r': 'flat' });
      s += part('M24 60 Q43 68 62 60 L62 66 Q43 74 24 66Z', GREEN_M, { w: 1.5 }) + Cir(43, 69, 3, { fill: GOLD, stroke: INK, 'stroke-width': 1, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'esferaNieve', name: 'Esfera de nieve de Navidad', price: 0, w: 66, h: 80, place: 'sobre', season: 'navidad', giftOnly: true,
    draw: () => {
      let s = surf(33, 77, 24);
      s += face('M12 76 L16 62 L50 62 L54 76Z', '#8A5A3C', { w: 1.8 }) + flat('M24 67 L42 67 L41 72 L25 72Z', GOLD);
      s += part(ellD(33, 36, 25, 26), '#E3F2FF', { w: 2 });
      s += flat('M10 44 C16 54 50 54 56 44 C56 54 46 61 33 61 C20 61 10 54 10 44Z', SNOW);
      s += part('M33 22 L25 36 L29 36 L23 46 L43 46 L37 36 L41 36Z', GREEN_M, { w: 1.3 }) + part(star(33, 21, 3.4), GOLD, { w: 0.9 });
      [[18, 24], [46, 20], [22, 40], [48, 36], [30, 14], [40, 30]].forEach(([x, y]) => { s += Cir(x, y, 1.4, { fill: '#FFFFFF', stroke: '#B8C8DE', 'stroke-width': 0.5, 'data-r': 'part' }); });
      s += shine('M16 26 C18 18 22 14 28 12 C22 17 20 21 19 29Z', { opacity: 0.85 });
      return s;
    },
  },
];
