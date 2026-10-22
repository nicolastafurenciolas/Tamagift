// Decoración chica. `place`: 'sobre' (va encima de un mueble o donde
// quieras, y se dibuja por delante de los muebles) o 'piso'.
// Misma vista 3/4 que todo el cuarto.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, cylinder, pot, Cir, Ell, INK, piece } from './draw.js';

const surfaceShadow = (cx, y, rx) => Ell(cx, y, rx, rx * 0.22, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });

const DEFS = [
  {
    id: 'planta', name: 'Suculenta', price: 45, w: 64, h: 72, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(32, 69, 20);
      const leafs = [[-14, 8, -40], [14, 8, 40], [-8, 0, -18], [8, 0, 18], [0, -4, 0]];
      leafs.forEach(([dx, dy, a]) => { s += `<g transform="rotate(${a} ${32 + dx} ${36 + dy})">${part(`M${32 + dx} ${38 + dy}c-7 -6 -7 -18 0 -22c7 4 7 16 0 22Z`, a ? '#8CC7A0' : '#6FB07E', { w: 1.5 })}</g>`; });
      s += pot(32, 69, 18, 13, 22, '#F2A7B5');
      s += Cir(26, 58, 2, { fill: INK, 'data-r': 'flat' }) + Cir(38, 58, 2, { fill: INK, 'data-r': 'flat' }) + line('M30 62q2 2 4 0', INK, 1.4);
      return s;
    },
  },
  {
    id: 'libros', name: 'Pila de libros', price: 40, w: 84, h: 70, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(42, 67, 36);
      const bk = [['#7FA9DE', 8, 66, 70], ['#E57B93', 12, 56, 64], ['#F2C14E', 6, 46, 72], ['#7FB894', 14, 36, 58]];
      bk.forEach(([c, x, y, w]) => {
        s += face(rr(x, y - 10, w, 10, 2), c, { w: 1.6 });
        s += flat(rr(x + w - 8, y - 8, 6, 6, 1), '#FFF8EE');
        s += line(`M${x + 3} ${y - 7}h${w - 14}`, tone(c, 1.2), 1.2, { opacity: 0.8 });
      });
      s += part('M46 26c-4 -6 -2 -14 6 -14c6 0 8 8 4 14Z', '#FF8FA8', { w: 1.4 }) + line('M50 26v-6', '#6E9C6E', 1.4);
      return s;
    },
  },
  {
    id: 'lampara', name: 'Lámpara de mesa', price: 60, w: 66, h: 96, place: 'sobre',
    draw: () => {
      let s = Ell(33, 34, 30, 22, { fill: '#FFE9A8', opacity: 0.3, 'data-r': 'tone' });
      s += surfaceShadow(33, 93, 20);
      s += cylinder(33, 93, 16, 8, '#E8DFF0', { w: 1.6 });
      s += face(rr(30, 44, 6, 42, 2), '#C9B8D9', { w: 1.4 });
      s += face('M10 46L18 10H48L56 46Z', '#F7B6C4');
      s += face(ellD(33, 46, 23, 4.5), tone('#F7B6C4', -0.4), { w: 1.4 });
      s += Ell(33, 47, 10, 2.4, { fill: '#FFF3C4', 'data-r': 'flat' });
      s += line('M22 16L16 40', '#FFFFFF', 1.6, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'osito', name: 'Osito de peluche', price: 90, w: 88, h: 96, place: 'piso',
    draw: () => {
      const B = '#C99A72', L = '#F2D9BC';
      let s = floorShadow(44, 92, 34, 6);
      s += part(ellD(44, 66, 26, 24), B, { w: 1.8 });
      s += part(ellD(44, 70, 14, 13), L, { w: 1.2 });
      s += part(ellD(22, 86, 12, 8), B, { w: 1.6 }) + part(ellD(66, 86, 12, 8), B, { w: 1.6 });
      s += part(ellD(22, 86, 6, 4), L, { w: 1 }) + part(ellD(66, 86, 6, 4), L, { w: 1 });
      s += part(ellD(18, 60, 8, 12), B, { w: 1.6 }) + part(ellD(70, 60, 8, 12), B, { w: 1.6 });
      s += part(ellD(24, 18, 10, 10), B, { w: 1.6 }) + part(ellD(64, 18, 10, 10), B, { w: 1.6 }) + flat(ellD(24, 19, 5, 5), L) + flat(ellD(64, 19, 5, 5), L);
      s += part(ellD(44, 34, 24, 21), B, { w: 1.8 });
      s += part(ellD(44, 42, 11, 8), L, { w: 1.2 });
      s += Ell(44, 39, 4, 3, { fill: INK, 'data-r': 'flat' }) + line('M44 42v3M40 46q4 3 8 0', INK, 1.4);
      s += Cir(35, 32, 2.6, { fill: INK, 'data-r': 'flat' }) + Cir(53, 32, 2.6, { fill: INK, 'data-r': 'flat' });
      s += part('M44 52l-9 -5v10Zm0 0l9 -5v10Z', '#E57B93', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'corazon-marco', name: 'Portarretratos', price: 60, w: 70, h: 78, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(35, 75, 24);
      s += face('M50 74L42 54H28L20 74Z', '#C99A72', { w: 1.4 });
      s += face(rr(8, 6, 54, 58, 6), '#F7B6C4');
      s += face(rr(15, 13, 40, 44, 3), '#CFE6F5', { w: 1.4 });
      s += part('M35 50C24 42 20 36 23 30C26 25 32 25 35 30C38 25 44 25 47 30C50 36 46 42 35 50Z', '#FF8FA8', { w: 1.4 });
      s += shine('M18 16h8l-6 6h-2Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'cassette', name: 'Radio casete', price: 70, w: 104, h: 74, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(52, 71, 44);
      s += line('M22 22Q52 2 82 22', '#5A5562', 4);
      s += box(6, 70, 92, 44, 16, '#E57B93', { r: 6 });
      [28, 76].forEach((x) => { s += face(ellD(x, 48, 15, 15), '#3A3542', { w: 1.6 }) + Cir(x, 48, 6, { fill: '#6E6878', 'data-r': 'flat' }); });
      s += face(rr(42, 34, 20, 26, 2), '#FFF6E8', { w: 1.4 }) + Cir(48, 44, 3, { fill: INK, 'data-r': 'flat' }) + Cir(56, 44, 3, { fill: INK, 'data-r': 'flat' });
      [44, 52, 60].forEach((x) => { s += face(rr(x - 3, 21, 6, 5, 1), '#3A3542', { w: 1 }); });
      return s;
    },
  },
  {
    id: 'tarro-estrellas', name: 'Tarro de estrellas', price: 75, w: 58, h: 80, place: 'sobre',
    draw: () => {
      let s = Ell(29, 50, 30, 30, { fill: '#FFF0A8', opacity: 0.3, 'data-r': 'tone' });
      s += surfaceShadow(29, 77, 20);
      s += face('M10 30C8 40 8 66 12 72C16 78 42 78 46 72C50 66 50 40 48 30Z', '#DDF0F8');
      [[20, 50], [34, 44], [28, 62], [38, 60], [22, 38]].forEach(([x, y], i) => { s += part(`M${x} ${y - 5}l1.6 3.4l3.6 0.4l-2.7 2.4l0.8 3.6l-3.3 -1.9l-3.3 1.9l0.8 -3.6l-2.7 -2.4l3.6 -0.4Z`, i % 2 ? '#FFE07A' : '#FFC6E0', { w: 1 }); });
      s += face(rr(9, 22, 40, 10, 3), '#C9A27A', { w: 1.6 }) + line('M14 26h30', '#E9C79A', 1.4);
      s += shine('M14 36c0 10 0 22 2 30h-3c-2 -8 -2 -20 1 -30Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'taza', name: 'Taza humeante', price: 35, w: 58, h: 64, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(28, 61, 20);
      s += line('M22 18c-6 -6 6 -8 0 -14M32 18c-6 -6 6 -8 0 -14', '#C9C2D0', 2.2, { opacity: 0.8 });
      s += line('M42 34q12 2 10 12q-2 8 -12 6', INK, 5) + line('M42 34q12 2 10 12q-2 8 -12 6', '#FFFFFF', 2.4);
      s += cylinder(28, 60, 16, 32, '#FFFFFF', { w: 1.8 });
      s += flat(ellD(28, 28, 12, 4.6), '#8A5A3C');
      s += part('M28 50C22 46 20 42 22 39C24 37 27 37 28 40C29 37 32 37 34 39C36 42 34 46 28 50Z', '#FF8FA8', { w: 1.2 });
      return s;
    },
  },
  {
    id: 'velas', name: 'Velas aromáticas', price: 45, w: 74, h: 72, place: 'sobre',
    draw: () => {
      let s = Ell(37, 40, 34, 24, { fill: '#FFE3A0', opacity: 0.28, 'data-r': 'tone' });
      s += surfaceShadow(37, 69, 32);
      [[18, 69, 11, 30, '#F7C6D9'], [40, 69, 10, 40, '#FFF1D6'], [58, 69, 9, 22, '#D6C6F2']].forEach(([cx, y, r, h, c]) => {
        s += cylinder(cx, y, r, h, c, { w: 1.6 });
        s += line(`M${cx} ${y - h - r * 0.5}v-5`, INK, 1.4);
        s += part(`M${cx} ${y - h - r * 0.5 - 4}c-3 -3 -1 -8 0 -9c1 1 3 6 0 9Z`, '#FFC94D', { w: 1 });
      });
      return s;
    },
  },
  {
    id: 'globo', name: 'Globo terráqueo', price: 80, w: 66, h: 96, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(33, 93, 20);
      s += cylinder(33, 93, 16, 6, '#C99A72', { w: 1.6 });
      s += face(rr(30, 70, 6, 18, 2), '#C99A72', { w: 1.4 });
      s += line('M14 26C8 46 18 66 38 72', '#C9A227', 3);
      s += part(ellD(33, 42, 25, 25), '#7FC8F0', { w: 1.8 });
      s += flat('M20 30c6 -4 14 -2 16 4c-2 6 -10 4 -12 10c-4 -2 -6 -8 -4 -14Z', '#7FC48A') + flat('M38 46c6 -2 12 2 12 8c-4 4 -10 2 -12 -2Z', '#7FC48A') + flat('M30 56c4 0 6 4 4 8c-4 0 -6 -4 -4 -8Z', '#7FC48A');
      s += shine('M20 30c2 -6 8 -10 14 -10c-6 2 -10 6 -12 12Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'despertador', name: 'Despertador', price: 40, w: 62, h: 70, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(31, 67, 20);
      s += part(ellD(16, 16, 8, 6), '#F2C14E', { w: 1.6 }) + part(ellD(46, 16, 8, 6), '#F2C14E', { w: 1.6 });
      s += line('M18 62l-4 5M44 62l4 5', INK, 3);
      s += part(ellD(31, 40, 24, 24), '#7FA9DE', { w: 1.8 });
      s += face(ellD(31, 40, 17, 17), '#FFFDF8', { w: 1.4 });
      s += line('M31 40V29M31 40l8 4', INK, 2.2) + Cir(31, 40, 2, { fill: '#E57B93', 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'cojin', name: 'Cojín corazón', price: 50, w: 84, h: 72, place: 'piso',
    draw: () => {
      let s = floorShadow(42, 68, 34, 6);
      s += part('M42 66C14 52 6 36 10 24C14 12 30 10 42 24C54 10 70 12 74 24C78 36 70 52 42 66Z', '#F28CA8', { w: 1.8 });
      s += line('M42 60C22 50 16 38 18 28', '#FFFFFF', 1.6, { opacity: 0.5, 'stroke-dasharray': '4 4' });
      s += shine('M18 24c2 -6 8 -8 12 -6c-4 0 -8 2 -10 8Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'jarron', name: 'Jarrón con flores', price: 55, w: 66, h: 104, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(33, 101, 18);
      const fl = (x, y, c) => [0, 72, 144, 216, 288].map((a) => Cir(+(x + Math.cos(a * Math.PI / 180) * 5).toFixed(1), +(y + Math.sin(a * Math.PI / 180) * 5).toFixed(1), 4.5, { fill: c, stroke: INK, 'stroke-width': 1, 'data-r': 'part' })).join('') + Cir(x, y, 3, { fill: '#FFE07A', 'data-r': 'flat' });
      s += line('M33 64L18 30M33 64L33 18M33 64L48 28M33 64L26 40', '#6E9C6E', 1.8);
      s += part('M24 46c-8 -2 -10 -8 -8 -12c6 2 8 6 8 12Z', '#7FB894', { w: 1.2 });
      s += fl(18, 28, '#F2A7B5') + fl(33, 16, '#FFFFFF') + fl(48, 26, '#C6B3F0');
      s += part('M20 60C16 72 18 92 24 100H42C48 92 50 72 46 60Z', '#7FA9DE', { w: 1.8 });
      s += face(ellD(33, 60, 13, 4), tone('#7FA9DE', 0.6), { w: 1.4 });
      s += line('M24 70c0 8 0 16 3 22', '#FFFFFF', 1.8, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'regalos', name: 'Pila de regalos', price: 70, w: 96, h: 96, place: 'piso',
    draw: () => {
      let s = floorShadow(48, 92, 42, 6);
      const gift = (x, y, w, h, c, r) => box(x, y, w, h, w * 0.7, c, { r: 2 }) + flat(`M${x + w / 2 - 3} ${y - h - w * 0.35}h6v${h + w * 0.35}h-6Z`, r) + part(`M${x + w / 2} ${y - h - w * 0.35}c-8 -8 -12 -2 -6 2Zm0 0c8 -8 12 -2 6 2Z`, r, { w: 1.2 });
      s += gift(6, 92, 46, 34, '#7FA9DE', '#FFE07A');
      s += gift(48, 92, 40, 28, '#F2A7B5', '#FFFFFF');
      s += gift(26, 54, 36, 24, '#7FB894', '#F28CA8');
      return s;
    },
  },
  {
    id: 'pelota', name: 'Pelota de playa', price: 35, w: 66, h: 66, place: 'piso',
    draw: () => {
      let s = floorShadow(33, 62, 26, 5);
      s += part(ellD(33, 34, 27, 27), '#FFFFFF', { w: 1.8 });
      s += flat('M33 7C20 14 16 30 20 50C10 44 6 32 10 22C14 14 22 8 33 7Z', '#F2A7B5') + flat('M33 7C46 14 50 30 46 50C56 44 60 32 56 22C52 14 44 8 33 7Z', '#7FA9DE');
      s += flat('M20 50C26 56 40 56 46 50C44 58 40 61 33 61C26 61 22 58 20 50Z', '#FFE07A');
      s += part(ellD(33, 9, 5, 3), '#FFE07A', { w: 1.2 });
      s += shine('M16 22c2 -6 6 -10 12 -12c-4 4 -8 8 -10 14Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'consola', name: 'Consolita', price: 85, w: 70, h: 56, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(35, 53, 30);
      s += box(6, 52, 58, 6, 40, '#C6B3F0', { r: 8 });
      s += face(rr(20, 18, 30, 16, 2), '#3E4B6E', { w: 1.4 }) + part('M35 30C31 27 30 25 31 23C32 22 34 22 35 24C36 22 38 22 39 23C40 25 39 27 35 30Z', '#FF8FB0', { w: 1 });
      s += flat('M10 24h6v2h-6Zm2 -2h2v6h-2Z', '#3A3542') + Cir(56, 22, 2.4, { fill: '#F28CA8', 'data-r': 'flat' }) + Cir(60, 28, 2.4, { fill: '#7FB894', 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'pecesito', name: 'Pecera redonda', price: 80, w: 74, h: 78, place: 'sobre',
    draw: () => {
      let s = surfaceShadow(37, 75, 26);
      s += face('M14 20C2 36 6 64 22 72C30 76 44 76 52 72C68 64 72 36 60 20Z', '#A9DDF2');
      s += flat('M8 46C14 44 20 48 26 46C32 44 38 48 44 46C50 44 56 48 66 46C66 56 62 66 52 72C44 76 30 76 22 72C12 66 8 56 8 46Z', '#7FC8E8');
      s += part('M30 56c6 -6 14 -6 18 0c-4 6 -12 6 -18 0Zm0 0l-6 -4v8Z', '#F2994A', { w: 1.2 }) + Cir(44, 55, 1.2, { fill: INK, 'data-r': 'flat' });
      s += part('M20 70c-2 -8 2 -12 0 -18c4 4 4 10 4 18Z', '#6FB07E', { w: 1 });
      s += face(ellD(37, 20, 23, 6), '#DDF0F8', { w: 1.6 });
      s += shine('M16 34c2 -6 6 -10 10 -12c-2 4 -6 8 -8 14Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'lavalamp', name: 'Lámpara de lava', price: 75, w: 48, h: 100, place: 'sobre',
    draw: () => {
      let s = Ell(24, 50, 22, 32, { fill: '#FFB6E6', opacity: 0.25, 'data-r': 'tone' });
      s += surfaceShadow(24, 97, 16);
      s += face('M12 96L16 74H32L36 96Z', '#8A7FA6', { w: 1.6 });
      s += face('M16 74C12 54 14 34 18 18H30C34 34 36 54 32 74Z', '#C9A9F0');
      s += part(ellD(24, 58, 6, 8), '#FF6FC8', { w: 1 }) + part(ellD(22, 38, 4, 6), '#FF6FC8', { w: 1 }) + part(ellD(27, 66, 3, 3), '#FF6FC8', { w: 1 });
      s += face('M18 18L20 6H28L30 18Z', '#8A7FA6', { w: 1.6 });
      return s;
    },
  },
  {
    id: 'conejito', name: 'Peluche conejito', price: 85, w: 72, h: 104, place: 'piso',
    draw: () => {
      const B = '#F4EEF8', P = '#F7C6D9';
      let s = floorShadow(36, 100, 28, 5);
      s += part('M24 40C18 26 18 6 24 4C30 4 32 24 30 40Z', B, { w: 1.6 }) + part('M48 40C54 26 54 6 48 4C42 4 40 24 42 40Z', B, { w: 1.6 });
      s += flat('M25 36C22 26 22 12 25 10C27 12 28 26 28 36Z', P) + flat('M47 36C50 26 50 12 47 10C45 12 44 26 44 36Z', P);
      s += part(ellD(36, 78, 22, 20), B, { w: 1.8 });
      s += part(ellD(20, 96, 9, 5), B, { w: 1.4 }) + part(ellD(52, 96, 9, 5), B, { w: 1.4 });
      s += part(ellD(36, 50, 20, 17), B, { w: 1.8 });
      s += Cir(29, 48, 2.4, { fill: INK, 'data-r': 'flat' }) + Cir(43, 48, 2.4, { fill: INK, 'data-r': 'flat' });
      s += part('M36 54l-2 -2h4Z', P, { w: 1 }) + line('M33 57q3 2 6 0', INK, 1.2);
      s += Ell(25, 55, 4, 2.4, { fill: P, opacity: 0.8, 'data-r': 'tone' }) + Ell(47, 55, 4, 2.4, { fill: P, opacity: 0.8, 'data-r': 'tone' });
      s += part('M36 68l-7 -4v8Zm0 0l7 -4v8Z', '#7FA9DE', { w: 1.2 });
      return s;
    },
  },
];

export const DECOR_DEFS = DEFS.map((d) => ({ ...d, svg: () => piece(d.w, d.h, d.draw()) }));
export const findDecorDef = (id) => DECOR_DEFS.find((d) => d.id === id) || null;
