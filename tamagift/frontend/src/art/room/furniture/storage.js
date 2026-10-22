// Mesas y muebles para guardar cosas. Misma regla 3/4: frente + cara de
// arriba; lo que va encima (lámparas, libros) se apoya en esa cara.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, legs, cylinder, Cir, Ell, mirrorX, INK, hollow } from '../draw.js';

const BOOK = ['#E57B93', '#7FA9DE', '#F2C14E', '#7FB894', '#B892E0', '#E9845A', '#5F7FA6'];

// Una fila de libros parados sobre una repisa (y = la repisa).
function books(x0, y, n, maxH, seed = 0, gap = 0) {
  let s = '', x = x0;
  for (let i = 0; i < n; i++) {
    const w = 7 + ((i * 7 + seed) % 4);
    const h = maxH - ((i * 5 + seed * 3) % 9);
    const c = BOOK[(i + seed) % BOOK.length];
    s += face(rr(x, y - h, w, h, 1.2), c, { w: 1.4 });
    s += line(`M${x + 2} ${y - h + 4}h${w - 4}`, tone(c, 1.2), 1.2, { opacity: 0.8 });
    x += w + gap;
  }
  return { s, x };
}

// Lamparita de mesa (base y pantalla) apoyada en (cx, y).
function tableLamp(cx, y, shadeCol, k = 1) {
  return part(`M${cx - 6 * k} ${y}h${12 * k}l-2 ${-4 * k}h${-8 * k}Z`, '#E8E0D6', { w: 1.4 })
    + line(`M${cx} ${y - 4 * k}V${y - 20 * k}`, '#8C8592', 2)
    + face(`M${cx - 13 * k} ${y - 18 * k}L${cx - 8 * k} ${y - 34 * k}H${cx + 8 * k}L${cx + 13 * k} ${y - 18 * k}Z`, shadeCol, { w: 1.6 })
    + Ell(cx, y - 14 * k, 18 * k, 6 * k, { fill: '#FFE9A8', opacity: 0.35, 'data-r': 'tone' });
}

export const STORAGE = [
  {
    id: 'escritorio', name: 'Escritorio', cat: 'mesas', price: 160, w: 196, h: 148, place: 'piso', tags: ['aesthetic', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(98, 143, 92, 6);
      // patas a la izquierda, cajonera a la derecha
      s += legs([16, 64], 82, 144, 8, p.wood);
      s += face(rr(118, 80, 66, 64, 3), W.front);
      [86, 106, 126].forEach((y) => { s += face(rr(124, y, 54, 16, 2), tone(p.wood, 0.15), { w: 1.4 }) + face(rr(146, y + 6, 10, 4, 2), p.accent, { w: 1.2 }); });
      // tablero: cara de arriba + canto
      s += box(6, 84, 184, 10, 56, p.wood);
      // cosas sobre la mesa
      s += tableLamp(30, 66, p.cloth, 1.1);
      const b = books(150, 66, 3, 20, 2);
      s += b.s;
      s += face(rr(66, 58, 50, 6, 1.5), '#FFFFFF', { w: 1.4 });
      s += line('M70 61H112', tone('#FFFFFF', -0.5), 1, { opacity: 0.7 });
      s += face(rr(122, 52, 12, 13, 3), mix(p.cloth, '#FFFFFF', 0.5), { w: 1.4 }) + line('M134 56q5 2 0 6', INK, 1.6);
      return s;
    },
  },
  {
    id: 'mesaLuz', name: 'Mesita de luz', cat: 'mesas', price: 80, w: 78, h: 116, place: 'piso', tags: ['dulce', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(39, 112, 34, 5);
      s += legs([12, 66], 98, 113, 6, p.wood);
      s += box(6, 100, 66, 46, 34, p.wood, { r: 4 });
      s += face(rr(12, 64, 54, 14, 2), tone(p.wood, 0.15), { w: 1.4 }) + Cir(39, 71, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += face(rr(12, 82, 54, 14, 2), tone(p.wood, 0.15), { w: 1.4 }) + Cir(39, 89, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += tableLamp(30, 48, p.cloth, 1);
      s += part(rr(48, 38, 14, 10, 3), '#FFF6E8', { w: 1.4 }) + Cir(55, 43, 3, { fill: '#FFFFFF', stroke: INK, 'stroke-width': 1, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'mesaCentro', name: 'Mesita ratona', cat: 'mesas', price: 90, w: 156, h: 76, place: 'piso', tags: ['aesthetic', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(78, 72, 72, 6);
      s += legs([20, 136], 46, 73, 8, p.wood);
      // tablero ovalado: cara de arriba elíptica + canto
      s += face('M8 36V44A70 17 0 0 0 148 44V36Z', W.front);
      s += face(ellD(78, 36, 70, 17), W.top);
      s += line('M24 30Q78 22 132 30', W.hi, 1.6, { opacity: 0.6 });
      // taza y revista
      s += face('M40 28l26 -3l6 10l-26 3Z', '#FFFFFF', { w: 1.4 }) + flat('M46 30l14 -1.6l1.4 2.6l-14 1.6Z', p.cloth);
      s += cylinder(102, 38, 7, 10, mix(p.accent, '#FFFFFF', 0.3), { w: 1.4 });
      s += line('M109 30q5 2 0 6', INK, 1.5);
      return s;
    },
  },
  {
    id: 'comoda', name: 'Cómoda', cat: 'mesas', price: 140, w: 146, h: 124, place: 'piso', tags: ['rustico', 'dulce'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(73, 119, 68, 6);
      s += legs([14, 132], 108, 121, 7, p.wood);
      s += box(6, 110, 134, 72, 40, p.wood, { r: 4 });
      [44, 66, 88].forEach((y) => {
        s += face(rr(14, y, 118, 18, 2), tone(p.wood, 0.15), { w: 1.4 });
        s += face(rr(40, y + 7, 12, 4, 2), p.accent, { w: 1.2 }) + face(rr(94, y + 7, 12, 4, 2), p.accent, { w: 1.2 });
      });
      // encima: un jarrón con flores y un portarretratos
      s += cylinder(32, 36, 8, 16, mix(p.cloth, '#FFFFFF', 0.25), { w: 1.4 });
      [[-6, -30, '#F2A7B5'], [4, -34, '#FFD97A'], [10, -26, '#F2A7B5']].forEach(([dx, dy, c]) => { s += line(`M32 20L${32 + dx} ${36 + dy + 6}`, '#6E9C6E', 1.4) + Cir(32 + dx, 36 + dy + 4, 4.5, { fill: c, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }); });
      s += face(rr(96, 14, 28, 22, 2), p.accent, { w: 1.6 }) + face(rr(100, 18, 20, 14, 1), '#BFDDF5', { w: 1.2 }) + flat('M100 32l7 -7l5 5l4 -3l4 5Z', '#7FB894');
      return s;
    },
  },
  {
    id: 'tocador', name: 'Tocador', cat: 'mesas', price: 175, w: 160, h: 200, place: 'piso', tags: ['princesa', 'aesthetic', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(80, 195, 74, 6);
      // espejo ovalado contra la pared, con focos
      s += face(ellD(80, 62, 40, 50), W.front);
      s += face(ellD(80, 62, 31, 41), '#CDE6F5', { w: 1.8 });
      s += shine('M60 52C62 36 72 28 82 26C72 34 66 44 64 58Z', { opacity: 0.7 });
      [[44, 34], [38, 62], [44, 90], [116, 34], [122, 62], [116, 90], [80, 14]].forEach(([x, y]) => { s += Cir(x, y, 4.5, { fill: '#FFF2C2', stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' }); });
      s += legs([16, 144], 180, 197, 7, p.wood);
      s += box(8, 182, 144, 62, 42, p.wood, { r: 4 });
      s += face(rr(16, 128, 62, 20, 2), tone(p.wood, 0.15), { w: 1.4 }) + face(rr(82, 128, 62, 20, 2), tone(p.wood, 0.15), { w: 1.4 });
      s += Cir(47, 138, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(113, 138, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += face(rr(16, 152, 128, 24, 2), tone(p.wood, 0.1), { w: 1.4 });
      // perfumes y labial sobre el tocador
      s += part('M30 114h12v-10l-2 -3h-8l-2 3Z', mix(p.cloth, '#FFFFFF', 0.4), { w: 1.4 }) + part('M33 101h6v-5h-6Z', p.accent, { w: 1.2 });
      s += part('M116 114h10v-14h-10Z', p.cloth, { w: 1.4 }) + part('M117 100h8l-2 -7h-4Z', '#E9E3DC', { w: 1.2 });
      s += part(ellD(72, 112, 10, 4), '#FFFFFF', { w: 1.2 });
      return s;
    },
  },
  {
    id: 'ropero', name: 'Ropero', cat: 'mesas', price: 220, w: 150, h: 236, place: 'piso', tags: ['rustico', 'elegante', 'princesa'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(75, 231, 70, 6);
      s += legs([16, 134], 218, 233, 8, p.wood);
      s += box(10, 222, 130, 196, 30, p.wood, { r: 3 });
      s += face(rr(4, 16, 142, 12, 3), W.top, { w: 2 });
      s += face(rr(16, 34, 57, 176, 3), tone(p.wood, 0.12), { w: 1.6 }) + face(rr(77, 34, 57, 176, 3), tone(p.wood, 0.12), { w: 1.6 });
      s += face(rr(24, 44, 41, 70, 10), tone(p.wood, -0.15), { w: 1.4 }) + face(rr(85, 44, 41, 70, 10), tone(p.wood, -0.15), { w: 1.4 });
      s += face(rr(24, 124, 41, 76, 4), tone(p.wood, -0.15), { w: 1.4 }) + face(rr(85, 124, 41, 76, 4), tone(p.wood, -0.15), { w: 1.4 });
      s += face(rr(66, 112, 5, 18, 2), p.accent, { w: 1.2 }) + face(rr(79, 112, 5, 18, 2), p.accent, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'estanteria', name: 'Biblioteca', cat: 'mesas', price: 150, w: 132, h: 210, place: 'piso', tags: ['elegante', 'aesthetic', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(66, 205, 62, 6);
      s += box(6, 206, 120, 186, 34, p.wood, { r: 3 });
      // hueco con fondo en sombra
      s += face(rr(14, 30, 104, 160, 2), hollow(p.wood), { w: 1.6 });
      const shelves = [72, 112, 152, 190];
      shelves.forEach((y) => { s += face(rr(14, y - 4, 104, 7, 1), W.top, { w: 1.4 }); });
      // estante 1: libros + plantita
      s += books(20, 68, 6, 32, 0).s;
      s += cylinder(98, 68, 7, 10, '#E9845A', { w: 1.4 });
      s += part('M98 56c-8 -6 -6 -14 0 -16c6 2 8 10 0 16Z', '#7FB894', { w: 1.4 });
      // estante 2: libros caídos + caja
      s += books(20, 108, 3, 30, 3).s;
      s += face('M50 108l26 -26l6 6l-26 26Z', BOOK[4], { w: 1.4 });
      s += face(rr(84, 86, 28, 22, 2), p.cloth, { w: 1.4 }) + face(rr(84, 86, 28, 5, 1), tone(p.cloth, 0.6), { w: 1.2 });
      // estante 3: libros apilados + portarretratos
      [0, 1, 2].forEach((i) => { s += face(rr(22, 141 - i * 7, 36 - i * 4, 7, 1.2), BOOK[(i + 2) % 7], { w: 1.4 }); });
      s += books(70, 148, 4, 30, 5).s;
      // estante 4: canasto
      s += face(rr(22, 166, 44, 24, 4), '#D9B07A', { w: 1.6 }) + line('M24 172H64M24 178H64M24 184H64', '#B08850', 1.2, { opacity: 0.8 });
      s += books(74, 188, 4, 30, 1).s;
      s += face(rr(6, 198, 120, 8, 2), W.front, { w: 1.8 });
      return s;
    },
  },
  {
    id: 'bau', name: 'Baúl', cat: 'mesas', price: 100, w: 140, h: 108, place: 'piso', tags: ['rustico', 'elegante', 'gotico'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(70, 103, 66, 6);
      // cuerpo
      s += face(rr(10, 52, 120, 52, 4), W.front);
      s += line('M14 64H126M14 80H126', tone(p.wood, -0.6), 1.4, { opacity: 0.6 });
      // tapa abovedada: el arco se ve de frente, con la luz arriba
      s += face('M8 56V40C8 22 34 10 70 10C106 10 132 22 132 40V56Z', W.top);
      s += line('M18 36C26 24 46 18 70 18', W.hi, 2, { opacity: 0.7 });
      s += face('M8 52H132V60H8Z', tone(p.wood, -0.4), { w: 1.6 });
      // herrajes
      [26, 114].forEach((x) => { s += face(`M${x - 6} 12C${x - 6} 12 ${x + 6} 11 ${x + 6} 12V102H${x - 6}Z`, p.accent, { w: 1.6 }); });
      s += face(rr(60, 50, 20, 22, 4), p.accent, { w: 1.6 }) + face(rr(67, 58, 6, 8, 2), INK, { w: 1 });
      return s;
    },
  },
  {
    id: 'cajaJuguetes', name: 'Caja de juguetes', cat: 'mesas', price: 110, w: 132, h: 112, place: 'piso', tags: ['dulce', 'y2k'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(66, 107, 62, 6);
      s += face(rr(8, 38, 116, 18, 3), hollow(p.wood));
      // juguetes que asoman por arriba
      s += part(ellD(36, 44, 18, 18), '#F7D56B', { w: 1.8 }) + line('M20 40Q36 30 52 40', '#E57B93', 3);
      s += part('M70 52C66 32 74 20 84 22C96 24 98 38 92 52Z', '#C99A72', { w: 1.8 }) + Cir(74, 24, 6, { fill: '#C99A72', stroke: INK, 'stroke-width': 1.6, 'data-r': 'part' }) + Cir(92, 26, 6, { fill: '#C99A72', stroke: INK, 'stroke-width': 1.6, 'data-r': 'part' });
      s += Cir(80, 36, 1.8, { fill: INK, 'data-r': 'flat' }) + Cir(88, 36, 1.8, { fill: INK, 'data-r': 'flat' }) + Ell(84, 42, 3, 2, { fill: '#8A5E40', 'data-r': 'flat' });
      s += face(rr(98, 30, 20, 20, 3), '#7FA9DE', { w: 1.6 }) + flat('M104 35h8v10h-8Z', '#FFFFFF', { opacity: 0.6 });
      s += face(rr(8, 50, 116, 54, 4), W.front) + line('M12 53H120', W.hi, 1.8, { opacity: 0.8 });
      // caja (abierta: el hueco va detrás de los juguetes)
      s += face(rr(14, 64, 104, 34, 4), tone(p.wood, 0.1), { w: 1.4 });
      ['#E57B93', '#7FA9DE', '#F2C14E'].forEach((c, i) => { s += face(rr(26 + i * 30, 66, 22, 24, 3), c, { w: 1.4 }); });
      s += flat('M33 72h8l-4 12Z', '#FFFFFF', { opacity: 0.8 }) + Cir(67, 78, 5, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'flat' }) + flat('M93 72h10v10h-10Z', '#FFFFFF', { opacity: 0.8 });
      return s;
    },
  },
  {
    id: 'ataud', name: 'Estante ataúd', cat: 'mesas', price: 190, w: 116, h: 216, place: 'piso', tags: ['gotico', 'metalero'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(58, 211, 50, 6);
      const out = 'M58 6L96 30L86 210H30L20 30Z';
      s += face(out, W.front);
      s += face('M58 18L86 36L78 200H38L30 36Z', hollow(p.wood), { w: 1.6 });
      [70, 112, 154].forEach((y) => { s += face(`M${34 - (y - 36) * 0.02} ${y - 3}H${82 + (y - 36) * 0.02}V${y + 4}H${34 - (y - 36) * 0.02}Z`, W.top, { w: 1.4 }); });
      // velas
      [44, 56].forEach((x, i) => {
        s += face(rr(x - 4, 50 + i * 4, 8, 17 - i * 4, 1.5), '#F3EDE3', { w: 1.4 });
        s += part(`M${x} ${44 + i * 4}c-3 -4 0 -9 0 -9c0 0 3 5 0 9Z`, '#FFC94D', { w: 1.2 });
      });
      s += Ell(50, 46, 14, 10, { fill: '#FFE3A0', opacity: 0.3, 'data-r': 'tone' });
      // pociones
      s += part('M64 109h12v-10l-3 -5h-6l-3 5Z', p.cloth, { w: 1.4 }) + part('M67 94h6v-5h-6Z', '#B9A68C', { w: 1.2 });
      s += part(ellD(48, 102, 7, 7), '#7FB894', { w: 1.4 }) + part('M45 95h6v-6h-6Z', '#B9A68C', { w: 1.2 });
      s += books(40, 151, 4, 26, 4).s;
      s += part('M58 182c-12 0 -16 10 -10 16h20c6 -6 2 -16 -10 -16Z', '#F3EDE3', { w: 1.6 }) + Cir(53, 189, 2.5, { fill: INK, 'data-r': 'flat' }) + Cir(63, 189, 2.5, { fill: INK, 'data-r': 'flat' });
      s += face('M58 6L96 30L94 40L58 18L22 40L20 30Z', W.top, { w: 1.8 });
      return s;
    },
  },
];
