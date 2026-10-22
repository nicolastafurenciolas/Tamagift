// Camas y asientos. Todos en vista 3/4 (ver draw.js): se ve el frente
// de cada pieza y su cara de arriba; lo que está contra la pared
// (respaldos, cabeceras) se ve de frente, detrás.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, floorShadow, legs, Cir, Ell, G, mirrorX } from '../draw.js';

const SHEET = '#FFF8F1';

export const REST = [
  {
    id: 'cama', name: 'Camita', cat: 'camas', price: 180, w: 170, h: 174, place: 'piso', tags: ['dulce', 'princesa', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      let s = floorShadow(85, 168, 80, 7);
      s += legs([26, 144], 160, 171, 10, p.wood);
      // cabecera, contra la pared
      s += face(rrTop(20, 8, 130, 64, 18), W.front);
      s += face(rr(33, 21, 104, 40, 9), tone(p.wood, -0.3), { w: 1.6 });
      s += line('M38 26H120', W.hi, 1.6, { opacity: 0.7 });
      // colchón visto desde arriba, con la almohada contra la cabecera
      s += face(rr(22, 54, 126, 82, 6), SHEET);
      s += part(rr(40, 60, 90, 24, 10), '#FFFFFF', { w: 1.8 });
      s += line('M52 68Q85 74 118 68', tone(SHEET, -0.6), 1.4, { opacity: 0.6 });
      // cobija: arriba (clara) y su caída por el frente (más oscura)
      s += face(rr(17, 92, 136, 44, 5), C.top);
      s += flat('M17 92h136v9H17Z', SHEET);
      s += line('M17 101H153', tone(p.cloth, -0.2), 1.4, { opacity: 0.8 });
      [44, 85, 126].forEach((x) => { s += flat(`M${x - 5} 116l5 5l5 -5l-5 -5Z`, p.accent, { opacity: 0.9 }); });
      s += face(rr(17, 134, 136, 18, 4), C.front);
      // pie de la cama
      s += face(rr(14, 146, 142, 18, 4), W.front);
      s += line('M20 150H150', W.hi, 1.6, { opacity: 0.8 });
      return s;
    },
  },
  {
    id: 'camaDosel', name: 'Cama con dosel', cat: 'camas', price: 320, w: 196, h: 236, place: 'piso', tags: ['princesa', 'elegante', 'angelical'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      let s = floorShadow(98, 230, 92, 8);
      // postes de atrás (asoman sobre la cabecera)
      s += face(rr(28, 34, 9, 150, 3), W.side, { w: 1.8 }) + face(rr(159, 34, 9, 150, 3), W.side, { w: 1.8 });
      s += face(rrTop(36, 70, 124, 62, 20), W.front);
      s += face(rr(48, 84, 100, 36, 10), tone(p.wood, -0.3), { w: 1.6 });
      s += face(rr(38, 116, 120, 82, 6), SHEET);
      s += part(rr(54, 122, 40, 22, 9), '#FFFFFF', { w: 1.8 }) + part(rr(102, 122, 40, 22, 9), '#FFFFFF', { w: 1.8 });
      s += face(rr(33, 152, 130, 46, 5), C.top);
      s += flat('M33 152h130v9H33Z', SHEET);
      s += line('M33 161H163', tone(p.cloth, -0.2), 1.4, { opacity: 0.8 });
      s += face(rr(33, 196, 130, 16, 4), C.front);
      s += face(rr(28, 206, 140, 16, 4), W.front);
      // postes de adelante y techo de tela con volados
      s += face(rr(12, 30, 11, 200, 3), W.front, { w: 2 }) + face(rr(173, 30, 11, 200, 3), W.front, { w: 2 });
      s += face(rr(6, 14, 184, 18, 6), W.top);
      let val = 'M8 30';
      for (let x = 8; x < 188; x += 20) val += `Q${x + 10} 46 ${x + 20} 30`;
      s += face(`${val}V26H8Z`, C.front);
      // cortinas atadas a los postes
      s += part('M8 32C10 70 16 96 20 118C24 124 30 120 26 112C24 90 26 64 34 32Z', C.top, { w: 1.8 });
      s += part('M188 32C186 70 180 96 176 118C172 124 166 120 170 112C172 90 170 64 162 32Z', C.top, { w: 1.8 });
      s += part('M14 116C20 112 28 112 32 118C26 122 20 122 14 116Z', p.accent, { w: 1.4 });
      s += part('M182 116C176 112 168 112 164 118C170 122 176 122 182 116Z', p.accent, { w: 1.4 });
      s += Cir(17, 22, 6, { fill: W.top, stroke: '#3A2A3E', 'stroke-width': 1.8, 'data-r': 'part' }) + Cir(178, 22, 6, { fill: W.top, stroke: '#3A2A3E', 'stroke-width': 1.8, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'cucha', name: 'Camita redonda', cat: 'camas', price: 120, w: 156, h: 88, place: 'piso', tags: ['dulce', 'aesthetic'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = floorShadow(78, 82, 72, 8);
      // aro acolchado: frente, borde de arriba y el hueco con su cojín
      s += face(`M8 46A70 34 0 0 0 148 46V54A70 32 0 0 1 8 54Z`, C.front);
      s += face(ellD(78, 46, 70, 33), C.top);
      s += face(ellD(78, 46, 49, 21), tone(p.cloth, -0.6), { w: 1.8 });
      s += part(ellD(78, 50, 45, 17), mix(p.cloth, '#FFFFFF', 0.55), { w: 1.6 });
      s += line('M50 42Q78 36 106 42', C.hi, 1.6, { opacity: 0.7 });
      // un hueso de juguete
      s += part('M60 52h22a5 5 0 1 1 4 7a5 5 0 1 1 -4 7h-22a5 5 0 1 1 -4 -7a5 5 0 1 1 4 -7Z', '#FFF6E8', { w: 1.6 });
      return s;
    },
  },
  {
    id: 'sofa', name: 'Sofá', cat: 'asientos', price: 200, w: 212, h: 134, place: 'piso', tags: ['dulce', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      let s = floorShadow(106, 130, 100, 7);
      s += legs([30, 182], 118, 131, 8, p.wood);
      // respaldo contra la pared, con dos almohadones
      s += face(rrTop(20, 12, 172, 68, 22), tone(p.cloth, -0.15));
      s += line('M36 20H176', C.hi, 1.8, { opacity: 0.7 });
      s += part(rr(36, 28, 68, 48, 13), C.front, { w: 1.8 }) + part(rr(108, 28, 68, 48, 13), C.front, { w: 1.8 });
      // asiento: arriba claro, frente oscuro
      s += face(rr(34, 72, 144, 30, 6), C.top);
      s += line('M106 74V100', tone(p.cloth, -0.6), 1.6, { opacity: 0.8 });
      s += face(rr(34, 100, 144, 18, 5), tone(p.cloth, -0.35));
      s += line('M106 102V116', tone(p.cloth, -0.9), 1.4, { opacity: 0.7 });
      // brazos
      const arm = face(rrTop(10, 52, 30, 18, 9), C.top) + face(rr(10, 64, 30, 54, 6), C.front) + line('M16 70V110', C.hi, 1.4, { opacity: 0.5 });
      s += arm + mirrorX(arm, 106);
      s += face(rr(14, 112, 184, 10, 3), W.front, { w: 2 });
      return s;
    },
  },
  {
    id: 'sillon', name: 'Sillón', cat: 'asientos', price: 160, w: 128, h: 140, place: 'piso', tags: ['elegante', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      let s = floorShadow(64, 136, 60, 7);
      s += legs([24, 104], 124, 137, 7, p.wood);
      // respaldo con capitoné
      s += face('M24 80V30C24 12 44 6 64 6C84 6 104 12 104 30V80Z', tone(p.cloth, -0.15));
      [[44, 30], [64, 24], [84, 30], [54, 52], [74, 52]].forEach(([x, y]) => { s += Cir(x, y, 2.6, { fill: tone(p.cloth, -1), 'data-r': 'flat' }); });
      s += line('M44 30L54 52L64 24L74 52L84 30', tone(p.cloth, -0.6), 1.2, { opacity: 0.6 });
      s += face(rr(30, 76, 68, 28, 6), C.top);
      s += face(rr(30, 102, 68, 20, 5), tone(p.cloth, -0.35));
      // brazos enrollados
      const arm = face('M8 64C8 52 30 52 30 64V122H8Z', C.front) + face(ellD(19, 62, 11, 7), C.top) + Cir(19, 62, 3, { fill: tone(p.cloth, -0.6), 'data-r': 'flat' });
      s += arm + mirrorX(arm, 64);
      s += face(rr(10, 118, 108, 8, 3), W.front, { w: 1.8 });
      return s;
    },
  },
  {
    id: 'puf', name: 'Puf', cat: 'asientos', price: 70, w: 104, h: 82, place: 'piso', tags: ['dulce', 'aesthetic', 'hippie'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = floorShadow(52, 79, 48, 7);
      s += face('M6 42V68A46 11 0 0 0 98 68V42Z', C.front);
      [24, 42, 62, 80].forEach((x) => { s += line(`M${x} 50Q${x + (x < 52 ? -2 : 2)} 62 ${x} 76`, tone(p.cloth, -0.6), 1.3, { opacity: 0.6 }); });
      s += face(ellD(52, 42, 46, 23), C.top);
      s += line('M52 42L22 34M52 42L82 34M52 42L36 58M52 42L68 58', tone(p.cloth, -0.45), 1.3, { opacity: 0.7 });
      s += part(ellD(52, 42, 5, 3.4), p.accent, { w: 1.4 });
      s += line('M14 40Q52 22 90 40', C.hi, 1.6, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'pufPera', name: 'Puf pera', cat: 'asientos', price: 90, w: 116, h: 104, place: 'piso', tags: ['aesthetic', 'hippie', 'y2k'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = floorShadow(58, 99, 54, 7);
      s += part('M12 96C2 74 12 44 34 32C48 24 64 24 76 32C98 46 112 74 104 96Z', p.cloth);
      s += shade('M40 40C50 34 64 34 72 40C66 48 50 50 40 40Z', tone(p.cloth, -1.4), 0.45);
      s += line('M58 30C56 54 52 74 48 96', tone(p.cloth, -0.7), 1.4, { opacity: 0.6 });
      s += line('M30 50C42 58 66 60 88 54', tone(p.cloth, -0.7), 1.4, { opacity: 0.5 });
      return s;
    },
  },
  {
    id: 'silla', name: 'Silla', cat: 'asientos', price: 80, w: 84, h: 138, place: 'piso', tags: ['rustico', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(42, 134, 36, 6);
      // respaldo con un corazón calado
      s += face(rr(16, 30, 8, 36, 2), W.side, { w: 1.8 }) + face(rr(60, 30, 8, 36, 2), W.side, { w: 1.8 });
      s += face(rrTop(12, 8, 60, 34, 12), W.front);
      s += shade('M42 34C34 28 32 20 37 17C40 15 42 18 42 20C42 18 44 15 47 17C52 20 50 28 42 34Z', tone(p.wood, -1.6), 0.75);
      // asiento con cojín
      s += face(rr(8, 62, 68, 22, 3), W.top);
      s += part(rr(13, 64, 58, 16, 6), p.cloth, { w: 1.6 });
      s += face(rr(8, 82, 68, 10, 3), W.front, { w: 2 });
      s += legs([15, 69], 92, 135, 7, p.wood);
      s += face(rr(15, 116, 54, 5, 2), W.side, { w: 1.6 });
      return s;
    },
  },
];
