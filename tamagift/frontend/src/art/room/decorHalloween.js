// Decoración de Halloween: se vende solo en la temporada (seasons.js) y
// después queda para siempre en el cuarto de quien la compró.
//
// Tierna antes que tenebrosa: calabazas sonrientes, fantasmitas con
// cachetes, murciélagos de ojos brillantes. Misma vista 3/4 que todo el
// cuarto (frente + tapa, elipses aplastadas, luz de arriba a la izquierda).

import { face, part, flat, line, shade, shine, rr, ellD, tone, Cir, Ell, INK } from './draw.js';

const surf = (cx, y, rx) => Ell(cx, y, rx, rx * 0.22, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });
const floorSh = (cx, y, rx, ry = rx * 0.16) => Ell(cx, y, rx, ry, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });
const glow = (cx, cy, rx, ry, c, op = 0.32) => Ell(cx, cy, rx, ry, { fill: c, opacity: op, 'data-r': 'tone' });
const star = (x, y, r, k = 0.48) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr2 = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr2).toFixed(1)} ${(y + Math.sin(a) * rr2).toFixed(1)}`; } return `${d}Z`; };
const moon = (x, y, r) => `M${x + r * 0.25} ${y - r} A${r} ${r} 0 1 0 ${x + r * 0.25} ${y + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${x + r * 0.25} ${y - r}Z`;

const PUMPKIN = '#F28C38', PUMPKIN_D = '#DE7426', STEM = '#6B8A3A', LEAF = '#8CC063';
const NIGHT = '#3B3346', NIGHT_HI = '#5A5068';
const GHOST = '#FBF7FF', GHOST_SH = '#DCD4F0', BLUSH = '#FFB6CC';
const CANDLE = '#FFE07A';

// Calabaza de tres gajos con centro en (cx, cy). `k` escala; `c` color.
function pumpkin(cx, cy, k, c = PUMPKIN, stem = true) {
  const cd = tone(c, -0.45);
  let s = part(ellD(cx - 13 * k, cy, 15 * k, 18 * k), cd, { w: 1.8 });
  s += part(ellD(cx + 13 * k, cy, 15 * k, 18 * k), cd, { w: 1.8 });
  s += part(ellD(cx, cy, 15.5 * k, 19.5 * k), c, { w: 1.9 });
  s += line(`M${cx - 6 * k} ${cy - 16 * k} Q${cx - 9 * k} ${cy} ${cx - 6 * k} ${cy + 16 * k} M${cx + 6 * k} ${cy - 16 * k} Q${cx + 9 * k} ${cy} ${cx + 6 * k} ${cy + 16 * k}`, tone(c, -0.9), 1.2, { opacity: 0.55 });
  if (stem) s += part(`M${cx - 2.6 * k} ${cy - 17 * k} C${cx - 3 * k} ${cy - 22 * k} ${cx - 1 * k} ${cy - 26 * k} ${cx + 3 * k} ${cy - 28 * k} L${cx + 5 * k} ${cy - 26 * k} C${cx + 2 * k} ${cy - 23 * k} ${cx + 2 * k} ${cy - 20 * k} ${cx + 2.6 * k} ${cy - 17 * k}Z`, STEM, { w: 1.5 });
  s += shine(`M${cx - 23 * k} ${cy - 4 * k} C${cx - 22 * k} ${cy - 11 * k} ${cx - 19 * k} ${cy - 15 * k} ${cx - 15 * k} ${cy - 17 * k} C${cx - 18 * k} ${cy - 12 * k} ${cx - 20 * k} ${cy - 8 * k} ${cx - 20 * k} ${cy - 2 * k}Z`, { opacity: 0.45 });
  return s;
}

// Murciélago tierno con centro en (0, 0) (ancho ~38).
function bat(x, y, k = 1, c = NIGHT) {
  const wing = (sx) => part(`M${4 * sx} -1 C${9 * sx} -8 ${16 * sx} -9 ${20 * sx} -5 C${17 * sx} -4 ${16 * sx} -1 ${16 * sx} 1 C${14 * sx} -1 ${11 * sx} 0 ${10 * sx} 2 C${9 * sx} 0 ${6 * sx} 1 ${4 * sx} 4Z`, c, { w: 1.4 });
  const body = wing(-1) + wing(1)
    + part('M-4.5 -3 L-4 -9 L-1.5 -5 L1.5 -5 L4 -9 L4.5 -3 C5.5 2 3.5 6 0 6 C-3.5 6 -5.5 2 -4.5 -3Z', c, { w: 1.5 })
    + Cir(-1.9, -1.4, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(1.9, -1.4, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' })
    + Ell(-3, 1.6, 1.3, 0.8, { fill: BLUSH, opacity: 0.85, 'data-r': 'flat' }) + Ell(3, 1.6, 1.3, 0.8, { fill: BLUSH, opacity: 0.85, 'data-r': 'flat' });
  return `<g transform="translate(${x} ${y}) scale(${k})">${body}</g>`;
}

// Caramelo envuelto (centro en x, y).
const candy = (x, y, c, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${part(`M${x - 6} ${y} L${x - 11} ${y - 4} L${x - 11} ${y + 4}Z M${x + 6} ${y} L${x + 11} ${y - 4} L${x + 11} ${y + 4}Z`, tone(c, 0.4), { w: 1.2 })}${part(ellD(x, y, 6.5, 4.6), c, { w: 1.4 })}${line(`M${x - 2} ${y - 3} L${x + 1} ${y + 3}`, '#FFFFFF', 1.2, { opacity: 0.7 })}</g>`;

export const DECOR_HALLOWEEN = [
  {
    id: 'calabazaTallada', name: 'Calabaza sonriente', price: 60, w: 78, h: 74, place: 'sobre', season: 'halloween',
    draw: () => {
      let s = glow(39, 44, 38, 28, '#FFC870', 0.4) + surf(39, 71, 30);
      s += pumpkin(39, 48, 1.12);
      s += part('M44 19 C50 13 58 14 60 18 C55 22 49 22 44 19Z', LEAF, { w: 1.3 });
      // la cara tallada: brilla por dentro
      s += flat(ellD(29, 43, 4.6, 5.4), CANDLE) + flat(ellD(49, 43, 4.6, 5.4), CANDLE);
      s += flat('M26 52 Q39 64 52 52 Q49 54 46 53 L44 57 L41 54 Q39 55 37 54 L34 57 L32 53 Q29 54 26 52Z', CANDLE);
      s += flat(ellD(30.4, 41.6, 1.6, 1.8), '#FFF6D0') + flat(ellD(50.4, 41.6, 1.6, 1.8), '#FFF6D0');
      return s;
    },
  },
  {
    id: 'calabazas', name: 'Montón de calabazas', price: 90, w: 124, h: 92, place: 'piso', season: 'halloween',
    draw: () => {
      let s = floorSh(62, 89, 56, 7);
      s += pumpkin(46, 58, 1.42);
      s += line('M52 20 C58 12 66 16 62 22 C60 25 56 23 58 20', STEM, 1.6);
      s += pumpkin(96, 70, 0.98, '#F2ECE2');
      s += pumpkin(68, 78, 0.68, '#F7A24E');
      return s;
    },
  },
  {
    id: 'murcielagos', name: 'Guirnalda de murciélagos', price: 55, w: 150, h: 66, place: 'sobre', season: 'halloween',
    draw: () => {
      const yAt = (x) => 8 + 20 * (1 - Math.pow((x - 75) / 71, 2));
      let s = line('M4 8 Q75 48 146 8', '#6A5E80', 1.5);
      [[25, 1.32], [75, 1.45], [125, 1.32]].forEach(([x, k], i) => {
        const y = yAt(x);
        s += line(`M${x} ${y} V${y + 8}`, '#6A5E80', 1.2);
        s += bat(x, y + 19, k, i % 2 ? '#4A3F5C' : NIGHT);
      });
      [[50, '#FFD45C'], [100, '#F28C38']].forEach(([x, c]) => { s += part(star(x, yAt(x) + 8, 6), c, { w: 1.2 }); });
      return s;
    },
  },
  {
    id: 'telarana', name: 'Telaraña con arañita', price: 40, w: 84, h: 84, place: 'sobre', season: 'halloween',
    draw: () => {
      const W = '#8F86A8';
      const ang = [0, 22, 45, 68, 90].map((a) => (a * Math.PI) / 180);
      let s = '';
      ang.forEach((a) => { s += line(`M3 3 L${(3 + Math.cos(a) * 78).toFixed(1)} ${(3 + Math.sin(a) * 78).toFixed(1)}`, W, 1.3); });
      [18, 34, 50, 66].forEach((r) => {
        let d = '';
        ang.forEach((a, i) => {
          const x = 3 + Math.cos(a) * r, y = 3 + Math.sin(a) * r;
          if (!i) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; return; }
          const am = (ang[i - 1] + a) / 2, rm = r * 0.86;
          d += ` Q${(3 + Math.cos(am) * rm).toFixed(1)} ${(3 + Math.sin(am) * rm).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
        });
        s += line(d, W, 1.2);
      });
      // la arañita colgando de su hilo
      s += line('M56 34 V60', W, 1.1);
      [[-1, -3], [-1, 0], [-1, 3], [1, -3], [1, 0], [1, 3]].forEach(([sx, dy]) => { s += line(`M${56 + sx * 5} ${66 + dy} q${sx * 5} -3 ${sx * 8} ${2 + dy * 0.6}`, NIGHT, 1.4); });
      s += part(ellD(56, 66, 7, 6.6), NIGHT, { w: 1.5 });
      s += Cir(53.4, 64.6, 1.5, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(58.6, 64.6, 1.5, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += Ell(51.6, 68.4, 1.6, 1, { fill: BLUSH, 'data-r': 'flat' }) + Ell(60.4, 68.4, 1.6, 1, { fill: BLUSH, 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'fantasmaPeluche', name: 'Fantasmita de peluche', price: 85, w: 82, h: 96, place: 'piso', season: 'halloween',
    draw: () => {
      let s = floorSh(41, 93, 31, 5.5);
      s += part('M16 86 C11 64 11 34 23 21 C31 12 51 12 59 21 C71 34 71 64 66 86 Q60 80 54 86 Q47 80 41 86 Q35 80 28 86 Q22 80 16 86Z', GHOST, { w: 2 });
      s += shade('M58 24 C68 36 68 62 64 84 Q60 80 56 84 C60 64 62 40 54 22Z', GHOST_SH, 0.75);
      s += part('M64 50 C72 42 80 44 78 51 C76 56 70 58 64 58Z', GHOST, { w: 1.8 });
      s += part('M18 52 C11 52 8 60 12 64 C15 66 18 63 19 60Z', GHOST, { w: 1.8 });
      s += Ell(32, 46, 3.6, 4.6, { fill: INK, 'data-r': 'flat' }) + Ell(50, 46, 3.6, 4.6, { fill: INK, 'data-r': 'flat' });
      s += Cir(33.2, 44.4, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(51.2, 44.4, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += part(ellD(41, 56, 3.2, 3.8), '#6A4258', { w: 1.3 });
      s += Ell(25, 53, 4.4, 2.6, { fill: BLUSH, opacity: 0.9, 'data-r': 'flat' }) + Ell(57, 53, 4.4, 2.6, { fill: BLUSH, opacity: 0.9, 'data-r': 'flat' });
      // moñito naranja
      s += part('M41 16 C36 9 27 10 28 16 C29 21 36 20 41 16Z M41 16 C46 9 55 10 54 16 C53 21 46 20 41 16Z', PUMPKIN, { w: 1.4 }) + part(ellD(41, 16, 2.8, 3.2), PUMPKIN_D, { w: 1.2 });
      s += shine('M24 30 C26 24 30 20 35 18 C31 23 28 27 27 33Z', { opacity: 0.8 });
      return s;
    },
  },
  {
    id: 'caldero', name: 'Caldero de dulces', price: 110, w: 100, h: 98, place: 'piso', season: 'halloween',
    draw: () => {
      let s = glow(50, 36, 42, 24, '#B8F5A0', 0.38) + floorSh(50, 95, 42, 6);
      s += face(rr(20, 84, 9, 9, 2), NIGHT, { w: 1.6 }) + face(rr(71, 84, 9, 9, 2), NIGHT, { w: 1.6 });
      s += part('M10 52 C8 74 24 90 50 90 C76 90 92 74 90 52Z', '#433A56', { w: 2.2 });
      s += shine('M18 60 C18 72 24 80 32 84 C25 77 22 69 22 60Z', { opacity: 0.3 });
      s += part(ellD(50, 52, 42, 10.5), NIGHT_HI, { w: 2 });
      s += flat(ellD(50, 52, 35, 7.2), '#8EE07A');
      s += candy(30, 46, '#FF7FA8', -24) + candy(68, 45, '#FFD45C', 18) + candy(50, 41, '#C9A6FF', 6);
      s += line('M78 50 L84 26', '#F4EDE4', 2.4) + part(ellD(85, 21, 6.4, 6.4), '#FF8FB0', { w: 1.4 }) + line('M85 21 m-3.6 0 a3.6 3.6 0 1 1 3.6 3.6', '#FFFFFF', 1.3);
      s += part(ellD(38, 54, 5, 3.4), '#A8F08E', { w: 1.2 }) + part(ellD(62, 56, 3.6, 2.5), '#A8F08E', { w: 1.1 }) + Cir(44, 30, 2.6, { fill: '#C8F7B4', stroke: INK, 'stroke-width': 1, 'data-r': 'part' }) + Cir(56, 22, 1.8, { fill: '#C8F7B4', stroke: INK, 'stroke-width': 0.9, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'farolito', name: 'Farolito embrujado', price: 70, w: 58, h: 96, place: 'sobre', season: 'halloween',
    draw: () => {
      let s = glow(29, 58, 28, 32, '#FFD27A', 0.38) + surf(29, 93, 20);
      s += face(rr(11, 84, 36, 8, 2), NIGHT, { w: 1.8 });
      s += face(rr(14, 42, 30, 42, 3), '#D9C7FF', { w: 1.8 });
      s += flat(rr(18, 46, 22, 34, 2), '#EFE6FF');
      s += part(rr(24, 62, 10, 20, 2), '#FFF3E0', { w: 1.4 });
      s += part('M29 45 C23.5 52 24.5 60 29 60 C33.5 60 34.5 52 29 45Z', '#FFB347', { w: 1.3 }) + flat('M29 50.5 C27 54 27.4 57.6 29 57.6 C30.6 57.6 31 54 29 50.5Z', '#FFF0B0');
      s += face(rr(28, 42, 2, 42, 0), NIGHT, { w: 1 });
      s += face('M10 43 L29 26 L48 43Z', NIGHT, { w: 1.8 }) + line('M18 37 L29 28', NIGHT_HI, 1.4);
      s += line('M29 26 V19', NIGHT, 2) + line('M29 14 m-5 0 a5 5 0 1 1 10 0', NIGHT, 2);
      s += flat(moon(20, 55, 3.4), '#FFFFFF', { opacity: 0.85 });
      return s;
    },
  },
  {
    id: 'gatoNegro', name: 'Gatito negro de peluche', price: 85, w: 80, h: 96, place: 'piso', season: 'halloween',
    draw: () => {
      const B = '#3E3650';
      let s = floorSh(40, 93, 29, 5);
      s += part('M56 84 C74 84 78 64 70 56 C67 60 70 70 60 76Z', B, { w: 1.8 });
      s += part(ellD(40, 70, 22, 21), B, { w: 2 });
      s += shade('M30 58 C24 66 26 80 32 86 C30 76 30 66 34 60Z', NIGHT_HI, 0.55);
      s += part(ellD(31, 89, 7.5, 4.2), B, { w: 1.6 }) + part(ellD(49, 89, 7.5, 4.2), B, { w: 1.6 });
      s += part('M22 30 L19 9 L35 21Z', B, { w: 1.8 }) + part('M58 30 L61 9 L45 21Z', B, { w: 1.8 });
      s += flat('M23 26 L22 14 L31 21Z', '#E89AB8') + flat('M57 26 L58 14 L49 21Z', '#E89AB8');
      s += part(ellD(40, 39, 23, 19), B, { w: 2 });
      s += part(ellD(31, 39, 5.4, 6), '#FFE07A', { w: 1.3 }) + part(ellD(49, 39, 5.4, 6), '#FFE07A', { w: 1.3 });
      s += Ell(31, 40, 2.1, 4, { fill: INK, 'data-r': 'flat' }) + Ell(49, 40, 2.1, 4, { fill: INK, 'data-r': 'flat' });
      s += Cir(29.4, 37, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(47.4, 37, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += part('M40 47 l-2.4 -2.2 h4.8Z', '#FFB6CC', { w: 1 }) + line('M36.5 49.5 q3.5 3 3.5 0 q0 3 3.5 0', '#B8AECB', 1.2);
      s += line('M16 44 L27 46 M16 50 L27 49 M64 44 L53 46 M64 50 L53 49', '#8F86A8', 1.1);
      s += part('M40 58 C35 52 28 53 29 58 C30 63 35 62 40 58Z M40 58 C45 52 52 53 51 58 C50 63 45 62 40 58Z', PUMPKIN, { w: 1.3 }) + part(ellD(40, 58, 2.6, 2.9), PUMPKIN_D, { w: 1.1 });
      return s;
    },
  },
  {
    id: 'banderin', name: 'Banderín de Halloween', price: 50, w: 144, h: 54, place: 'sobre', season: 'halloween',
    draw: () => {
      const yAt = (x) => 8 + 16 * (1 - Math.pow((x - 72) / 68, 2));
      let s = line('M4 8 Q72 40 140 8', '#6A5E80', 1.5);
      const cols = [PUMPKIN, '#8E6FE0', NIGHT, PUMPKIN, '#8E6FE0', NIGHT];
      [16, 38, 61, 83, 106, 128].forEach((x, i) => {
        const y = yAt(x), c = cols[i];
        s += part(`M${x - 10} ${y - 1} L${x + 10} ${y + 1} L${x + 1} ${y + 25}Z`, c, { w: 1.5 });
        if (i % 3 === 0) s += flat(ellD(x, y + 9, 4.6, 4), NIGHT) + flat(`M${x - 0.8} ${y + 5} h2 v-2.6 h-2Z`, STEM);
        else if (i % 3 === 1) s += flat(moon(x - 1, y + 9, 5.4), '#FFF3C4');
        else s += flat(star(x, y + 9, 5.6), '#FFD45C');
      });
      return s;
    },
  },
  {
    id: 'escoba', name: 'Escoba de bruja', price: 60, w: 62, h: 124, place: 'piso', season: 'halloween',
    draw: () => {
      let s = floorSh(30, 121, 24, 4);
      s += part('M41 6 L47 8 L26 96 L20 94Z', '#B07F55', { w: 1.8 }) + line('M43 10 L24 90', '#D7A97E', 1.2, { opacity: 0.8 });
      s += part('M8 120 C8 108 13 100 18 94 L30 98 C32 106 38 112 44 120 Q26 125 8 120Z', '#EBC86E', { w: 1.9 });
      s += line('M15 117 L20 100 M22 119 L24 101 M29 119 L28 102 M36 118 L31 103', '#C59B3E', 1.2);
      s += part('M17 92 L31 97 L29 104 L15 99Z', '#8E6FE0', { w: 1.5 });
      s += part(star(44, 14, 5.5), '#FFD45C', { w: 1.1 });
      return s;
    },
  },
];
