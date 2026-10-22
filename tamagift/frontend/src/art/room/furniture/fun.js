// Música, juegos, deporte, mascotas y luces.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, legs, cylinder, Cir, Ell, mirrorX, INK, hollow, tube } from '../draw.js';

const METAL = '#5A5562';
const STEEL = '#C9CCD3';

// Mancuerna vista de frente, apoyada en y: manija y dos cabezas con su
// cara de arriba.
function dumbbell(cx, y, half, headW, headH, color) {
  const M = mat(color);
  const hx = half - headW;
  let s = face(rr(cx - hx - 1, y - headH / 2 - 2.5, hx * 2 + 2, 5, 2), STEEL, { w: 1.4 });
  [-1, 1].forEach((k) => {
    const x = k < 0 ? cx - half : cx + hx;
    s += face(rr(x, y - headH, headW, headH, 2.5), M.front, { w: 1.6 });
    s += flat(`M${x + 1.5} ${y - headH + 1.5}h${headW - 3}v3h${-(headW - 3)}Z`, M.top, { opacity: 0.9 });
  });
  return s;
}

export const FUN = [
  {
    // Proporciones de guitarra de verdad: el cuerpo es la mitad del largo,
    // la parte de abajo más ancha que la de arriba, la boca sobre la
    // cintura y el puente en la parte ancha. Va en su soporte.
    id: 'guitarra', name: 'Guitarra', cat: 'ocio', price: 140, w: 92, h: 214, place: 'piso', tags: ['rockero', 'metalero', 'hippie', 'punk'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(46, 210, 34, 5);
      // soporte (de metal, atrás)
      s += tube('M30 210L40 168', 4.5, METAL) + tube('M62 210L52 168', 4.5, METAL) + tube('M26 209H66', 4.5, METAL);
      let g = '';
      g += face('M43 106C55 106 67 111 67 124C67 133 61 138 61 143C61 149 74 156 74 174C74 191 61 201 43 201C25 201 12 191 12 174C12 156 25 149 25 143C25 138 19 133 19 124C19 111 31 106 43 106Z', W.side);
      g += face('M43 103C55 103 67 108 67 121C67 130 61 135 61 140C61 146 74 153 74 171C74 188 61 197 43 197C25 197 12 188 12 171C12 153 25 146 25 140C25 135 19 130 19 121C19 108 31 103 43 103Z', W.top);
      g += shine('M24 116C26 109 33 106 38 106C32 110 28 116 27 124Z', { opacity: 0.45 });
      g += part('M50 131C58 133 61 141 58 150C55 156 49 156 47 151C51 147 52 139 50 131Z', W.deep, { w: 1.2 });
      g += Cir(43, 131, 12, { fill: 'none', stroke: p.cloth, 'stroke-width': 2.6, 'data-r': 'line' });
      g += face(ellD(43, 131, 9, 9), '#2A2026', { w: 1.6 });
      g += face(rr(29, 168, 28, 7, 3), '#3A2A2E', { w: 1.4 });
      g += face('M38.2 107L39.2 24H46.8L47.8 107Z', W.side, { w: 1.6 });
      g += flat('M39.6 105L40.3 25H45.7L46.4 105Z', '#3A2A2E');
      [34, 44, 53.5, 62.5, 71, 79, 86.5, 93.5, 100].forEach((y) => { g += line(`M40 ${y}H46`, '#CFC6BC', 1.1, { 'data-skip': 'pixel' }); });
      g += face('M38 25L36.5 7Q36.5 3 40 3H46Q49.5 3 49.5 7L48 25Z', '#3A2A2E', { w: 1.6 });
      [8, 13.5, 19].forEach((y) => { g += line(`M36.8 ${y}h-4.5M49.2 ${y}h4.5`, STEEL, 2.6); });
      g += line('M41 24L40 171M43 24L43 171M45 24L46 171', '#FFFFFF', 0.7, { opacity: 0.7, 'data-skip': 'pixel' });
      s += `<g transform="rotate(7 46 205)">${g}</g>`;
      // apoyo del soporte por delante
      s += tube('M30 176H62', 4.5, METAL);
      return s;
    },
  },
  {
    id: 'teclado', name: 'Teclado', cat: 'ocio', price: 180, w: 178, h: 130, place: 'piso', tags: ['elegante', 'aesthetic', 'rockero'],
    draw: (p) => {
      let s = floorShadow(89, 126, 78, 5);
      // atril con partitura (atrás)
      s += face(rr(62, 26, 56, 30, 2), '#FFFFFF', { w: 1.6 });
      [33, 39, 45].forEach((y) => { s += line(`M66 ${y}H114`, '#B9B2BA', 1, { opacity: 0.9 }); });
      s += Cir(74, 39, 2.4, { fill: INK, 'data-r': 'flat' }) + Cir(88, 33, 2.4, { fill: INK, 'data-r': 'flat' }) + Cir(102, 45, 2.4, { fill: INK, 'data-r': 'flat' });
      // patas en X
      ['M34 126L78 76', 'M78 126L34 76', 'M100 126L144 76', 'M144 126L100 76'].forEach((d) => { s += tube(d, 6, METAL); });
      // teclado: cara de arriba con las teclas, canto adelante
      const K = mat(p.wood);
      s += face(rr(10, 52, 158, 18, 3), K.top);
      s += face(rr(16, 56, 146, 12, 1), '#FFFFFF', { w: 1.4 });
      for (let x = 22; x < 160; x += 7.3) s += line(`M${x} 57V67`, '#C9C2CB', 0.9);
      for (let x = 20; x < 158; x += 7.3) { const k = Math.round((x - 20) / 7.3) % 7; if (k !== 2 && k !== 6) s += flat(`M${x + 2.6} 56h4v6.5h-4Z`, '#2A2530'); }
      [24, 34, 44].forEach((x) => { s += Cir(x, 54.5, 1.6, { fill: p.accent, 'data-r': 'flat' }); });
      s += face(rr(10, 68, 158, 12, 3), K.front);
      s += line('M14 71H164', K.hi, 1.4, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'tocadiscos', name: 'Tocadiscos', cat: 'ocio', price: 170, w: 132, h: 156, place: 'piso', tags: ['hippie', 'rockero', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(66, 152, 60, 5);
      s += legs([20, 112], 138, 153, 6, p.wood);
      s += box(8, 142, 116, 78, 34, p.wood, { r: 3 });
      // adelante: discos a la izquierda, parlante a la derecha
      s += face(rr(14, 72, 50, 64, 2), hollow(p.wood), { w: 1.6 });
      ['#E57B93', '#2E2A33', '#7FA9DE', '#F2C14E', '#2E2A33', '#7FB894'].forEach((c, i) => { s += face(rr(17 + i * 7.5, 78 + (i % 2) * 3, 6, 56 - (i % 2) * 3, 1), c, { w: 1.2 }); });
      s += face(rr(70, 72, 48, 64, 3), tone(p.wood, 0.1), { w: 1.6 });
      s += face(ellD(94, 104, 18, 18), '#3A3542', { w: 1.6 });
      s += Cir(94, 104, 6, { fill: '#6E6878', 'data-r': 'flat' });
      // el tocadiscos encima: base con su cara de arriba
      s += box(18, 60, 96, 10, 30, '#3A3542', { r: 2 });
      s += face(ellD(54, 52, 25, 7), '#1E1A24', { w: 1.6 });
      s += Ell(54, 52, 7, 2.2, { fill: p.cloth, 'data-r': 'flat' });
      s += line('M36 50Q54 46 70 49', '#4A4552', 1, { opacity: 0.9 });
      s += line('M100 44L84 49L72 52', STEEL, 2.2) + Cir(100, 44, 3.5, { fill: STEEL, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += Cir(104, 54, 2.4, { fill: p.accent, 'data-r': 'flat' });
      // una nota que sale bailando
      s += line('M104 22V8l10 -3v13', INK, 2) + Ell(102, 22, 3.4, 2.6, { fill: p.cloth, stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' }) + Ell(112, 18, 3.4, 2.6, { fill: p.cloth, stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'tele', name: 'Tele y consola', cat: 'ocio', price: 230, w: 172, h: 176, place: 'piso', tags: ['y2k', 'aesthetic', 'deportista'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(86, 172, 80, 5);
      s += legs([20, 152], 158, 173, 6, p.wood);
      s += box(8, 162, 156, 50, 40, p.wood, { r: 3 });
      s += face(rr(14, 118, 70, 40, 2), tone(p.wood, 0.12), { w: 1.4 }) + face(rr(88, 118, 70, 40, 2), tone(p.wood, 0.12), { w: 1.4 });
      s += face(rr(76, 134, 4, 10, 2), p.accent, { w: 1 }) + face(rr(92, 134, 4, 10, 2), p.accent, { w: 1 });
      // antena (atrás) y tele retro
      s += tube('M78 34L62 6', 3, METAL) + tube('M96 34L112 8', 3, METAL) + Cir(62, 6, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(112, 8, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += box(26, 108, 120, 76, 26, p.cloth, { r: 8 });
      s += face(rr(34, 40, 84, 60, 12), '#2A2B3D', { w: 2 });
      s += flat('M40 46h72v48h-72Z', '#3E4B6E', { opacity: 0.9 });
      s += part('M76 84C64 76 60 68 64 62C67 58 72 58 76 64C80 58 85 58 88 62C92 68 88 76 76 84Z', '#FF8FB0', { w: 1.6 });
      s += shine('M40 48h20l-8 10h-12Z', { opacity: 0.3 });
      s += Cir(132, 56, 5, { fill: mix(p.cloth, '#FFFFFF', 0.5), stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' }) + Cir(132, 74, 5, { fill: mix(p.cloth, '#FFFFFF', 0.5), stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' });
      [86, 90, 94].forEach((y) => { s += line(`M126 ${y}H138`, tone(p.cloth, -0.8), 1.4); });
      // consola y control sobre el mueble
      s += box(118, 116, 36, 8, 14, '#E8E4EC', { r: 2 }) + Cir(124, 112, 1.6, { fill: '#7FB894', 'data-r': 'flat' });
      s += line('M52 116Q40 112 30 116', '#4A4552', 1.4) + part('M46 116c0 -5 18 -5 18 0c2 4 -4 6 -9 3c-5 3 -11 1 -9 -3Z', '#4A4552', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'pesas', name: 'Set de pesas', cat: 'ocio', price: 120, w: 152, h: 118, place: 'piso', tags: ['deportista', 'rockero'],
    draw: (p) => {
      let s = floorShadow(76, 114, 72, 5);
      // soporte de dos pisos
      const up = face(rr(12, 22, 8, 88, 2), METAL, { w: 1.8 });
      s += up + mirrorX(up, 76);
      s += face(rr(4, 104, 32, 8, 3), METAL, { w: 1.8 }) + face(rr(116, 104, 32, 8, 3), METAL, { w: 1.8 });
      s += face(rr(12, 54, 128, 6, 2), tone(METAL, 0.6), { w: 1.6 }) + face(rr(12, 90, 128, 6, 2), tone(METAL, 0.6), { w: 1.6 });
      // arriba tres chicas, abajo dos grandes
      [[40, p.cloth], [76, p.accent === '#FFFFFF' ? p.wood : p.accent], [112, p.cloth]].forEach(([x, c]) => { s += dumbbell(x, 54, 16, 7, 14, c); });
      [[50, p.wood], [102, p.wood]].forEach(([x, c]) => { s += dumbbell(x, 90, 22, 10, 22, c); });
      // una botella de agua al pie
      s += face(rr(138, 92, 10, 20, 3), '#9FD6F0', { w: 1.4 }) + face(rr(139, 88, 8, 5, 1.5), p.cloth, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'pecera', name: 'Pecera', cat: 'ocio', price: 210, w: 140, h: 172, place: 'piso', tags: ['aesthetic', 'hippie', 'dulce'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(70, 168, 64, 5);
      s += box(12, 166, 116, 58, 32, p.wood, { r: 3 });
      s += face(rr(18, 114, 50, 46, 2), tone(p.wood, 0.12), { w: 1.4 }) + face(rr(72, 114, 50, 46, 2), tone(p.wood, 0.12), { w: 1.4 });
      // la pecera: agua, arena, plantas, peces y burbujas
      s += face(rr(14, 22, 112, 76, 4), '#86CBE6');
      s += flat('M16 24h108v12h-108Z', '#B7E3F2', { opacity: 0.8 });
      s += flat('M16 84q26 -8 54 -2t54 -4v14h-108Z', '#E9D3A6');
      s += part('M30 88C26 74 34 64 30 50C38 62 34 74 36 88Z', '#5FB07E', { w: 1.4 }) + part('M40 88C40 72 48 66 46 56C52 68 46 78 46 88Z', '#7FC48A', { w: 1.4 });
      s += part('M110 88C106 76 114 70 110 60C118 70 114 80 116 88Z', '#5FB07E', { w: 1.4 });
      const fish = (x, y, c, k) => part(`M${x} ${y}c${8 * k} -7 ${18 * k} -5 ${22 * k} 0c${-4 * k} 5 ${-14 * k} 7 ${-22 * k} 0Z M${x} ${y}l${-7 * k} -5v10Z`, c, { w: 1.4 }) + Cir(x + 16 * k, y - 1, 1.4, { fill: INK, 'data-r': 'flat' });
      s += fish(56, 52, '#F2994A', 1) + fish(96, 68, p.cloth, -1);
      [[74, 40, 3], [78, 32, 2.2], [72, 28, 1.6]].forEach(([x, y, r]) => { s += Cir(x, y, r, { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.2, 'data-r': 'line' }); });
      s += shine('M20 40l10 -10h6l-10 10Z', { opacity: 0.5 }) + shine('M22 56l20 -20h3l-20 20Z', { opacity: 0.35 });
      s += face(rr(10, 16, 120, 9, 3), W.front, { w: 2 });
      return s;
    },
  },
  {
    id: 'rascador', name: 'Torre para jugar', cat: 'ocio', price: 190, w: 126, h: 230, place: 'piso', tags: ['dulce', 'hippie'],
    draw: (p) => {
      const SIS = '#D9BE90';
      const sisal = (cx, yb, h) => cylinder(cx, yb, 7, h, SIS, { w: 1.6 }) + Array.from({ length: Math.floor(h / 7) }, (_, i) => line(`M${cx - 7} ${yb - 4 - i * 7}H${cx + 7}`, tone(SIS, -0.7), 1, { opacity: 0.7 })).join('');
      let s = floorShadow(63, 226, 60, 6);
      s += box(6, 226, 114, 10, 40, p.cloth, { r: 4 });
      s += sisal(98, 204, 84);
      // casita con puerta redonda
      s += box(12, 198, 60, 46, 36, p.cloth, { r: 4 });
      s += face(ellD(42, 178, 13, 13), tone(p.cloth, -1.8), { w: 1.6 });
      s += box(70, 124, 50, 8, 30, p.cloth, { r: 4 });
      s += sisal(42, 136, 60);
      s += box(14, 82, 60, 8, 34, p.cloth, { r: 4 });
      s += line('M18 64c10 -8 42 -8 52 0', tone(p.cloth, -0.8), 2.6);
      // pelotita colgando
      s += line('M112 124V152', '#8C8592', 1.4) + part(ellD(112, 158, 7, 7), p.accent === '#FFFFFF' ? '#F2C14E' : p.accent, { w: 1.6 });
      return s;
    },
  },
  {
    id: 'espejo', name: 'Espejo de pie', cat: 'ocio', price: 120, w: 102, h: 188, place: 'piso', tags: ['princesa', 'elegante', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(51, 184, 46, 5);
      s += face(rr(15, 34, 8, 146, 3), W.front, { w: 1.8 }) + face(rr(79, 34, 8, 146, 3), W.front, { w: 1.8 });
      s += Cir(19, 32, 5, { fill: W.top, stroke: INK, 'stroke-width': 1.6, 'data-r': 'part' }) + Cir(83, 32, 5, { fill: W.top, stroke: INK, 'stroke-width': 1.6, 'data-r': 'part' });
      s += box(4, 184, 34, 7, 26, p.wood, { r: 3 }) + box(64, 184, 34, 7, 26, p.wood, { r: 3 });
      s += face(ellD(51, 96, 31, 56), W.front);
      s += face(ellD(51, 96, 24, 48), '#CFE6F5', { w: 1.8 });
      s += shine('M34 92C34 70 42 56 52 52C44 62 40 76 40 96Z', { opacity: 0.7 }) + shine('M58 128C64 120 66 110 66 100C69 110 68 122 62 130Z', { opacity: 0.5 });
      s += Cir(22, 96, 3.5, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(80, 96, 3.5, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += part('M51 40C45 34 42 30 46 27C49 25 51 28 51 29C51 28 53 25 56 27C60 30 57 34 51 40Z', p.cloth, { w: 1.4 });
      return s;
    },
  },
  {
    id: 'lampara', name: 'Lámpara de pie', cat: 'luces', price: 110, w: 78, h: 218, place: 'piso', tags: ['aesthetic', 'elegante', 'dulce'],
    draw: (p) => {
      let s = floorShadow(39, 214, 26, 4);
      s += Ell(39, 70, 38, 30, { fill: '#FFE9A8', opacity: 0.28, 'data-r': 'tone' });
      s += cylinder(39, 214, 22, 6, p.wood, { w: 1.8 });
      s += face(rr(36, 60, 6, 148, 2.5), p.wood, { w: 1.6 });
      s += face('M10 64L20 18H58L68 64Z', mat(p.cloth).front);
      s += face(ellD(39, 64, 29, 5), tone(p.cloth, -0.4), { w: 1.6 });
      s += face(ellD(39, 18, 19, 3.5), mat(p.cloth).top, { w: 1.6 });
      s += line('M24 26L18 58', mat(p.cloth).hi, 1.8, { opacity: 0.6 });
      s += Ell(39, 66, 14, 3.2, { fill: '#FFF3C4', 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'lamparaArco', name: 'Lámpara de arco', cat: 'luces', price: 150, w: 156, h: 222, place: 'piso', tags: ['elegante', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(30, 218, 26, 4);
      s += Ell(120, 104, 34, 26, { fill: '#FFE9A8', opacity: 0.28, 'data-r': 'tone' });
      s += cylinder(30, 218, 22, 16, mix(p.wood, '#FFFFFF', 0.25), { w: 1.8 });
      s += tube('M30 204C26 120 40 40 92 26C118 20 124 40 124 62', 6.5, p.wood);
      s += face('M100 82C100 66 110 60 120 60C130 60 140 66 140 82Z', mat(p.cloth).front);
      s += face(ellD(120, 82, 20, 4.5), tone(p.cloth, -0.4), { w: 1.6 });
      s += Ell(120, 84, 10, 2.6, { fill: '#FFF3C4', 'data-r': 'flat' });
      s += line('M106 70Q110 64 116 63', mat(p.cloth).hi, 1.6, { opacity: 0.7 });
      return s;
    },
  },
];
