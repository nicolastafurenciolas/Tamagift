// Lo que va colgado en la pared: se ve de frente; lo que sobresale
// (repisas, alféizar) muestra su cara de arriba como el resto.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, cylinder, Cir, Ell, INK, G } from '../draw.js';

const SKY = '#BFE0F5', SKY2 = '#DDF0FA', NIGHT = '#34407A';

export const WALL_ITEMS = [
  {
    id: 'ventana', name: 'Ventana', cat: 'pared', price: 130, w: 164, h: 166, place: 'pared', tags: ['dulce', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      let s = '';
      s += face(rr(14, 14, 136, 122, 4), W.front);
      // De día con sol; de noche (la hora del teléfono, `p.night`, o los
      // estilos de noche lo-fi y neón), luna y estrellas. Al atardecer,
      // cielo naranja (`p.dusk`).
      const day = face(rr(24, 24, 116, 102, 2), p.dusk ? '#FFC9A3' : SKY, { w: 1.6 })
        + flat('M25 86h114v39h-114Z', p.dusk ? '#FFB3B8' : SKY2)
        + flat('M25 112q20 -14 40 -4t40 -6t34 2v21h-114Z', p.dusk ? '#8FB98A' : '#9FD39A')
        + Cir(110, p.dusk ? 78 : 48, 10, { fill: p.dusk ? '#FF8F5A' : '#FFE07A', 'data-r': 'flat' })
        + flat('M38 58c0 -8 12 -10 16 -4c4 -6 16 -4 16 4Z', '#FFFFFF');
      const night = face(rr(24, 24, 116, 102, 2), NIGHT, { w: 1.6 })
        + flat('M25 86h114v39h-114Z', mix(NIGHT, '#8A7FC0', 0.3))
        + flat('M25 112q20 -14 40 -4t40 -6t34 2v21h-114Z', '#3F5A66')
        + Cir(110, 46, 10, { fill: '#FFF2B0', 'data-r': 'flat' }) + Cir(115, 42, 8.5, { fill: NIGHT, 'data-r': 'flat' })
        + [[40, 40, 2.2], [56, 58, 1.5], [66, 34, 1.8], [98, 64, 1.5], [128, 34, 1.8], [34, 66, 1.4]].map(([x, y, r]) => Cir(x, y, r, { fill: '#FFF2B0', 'data-r': 'flat' })).join('');
      if (p.night) s += night;
      else s += G({ 'data-skip': 'lofi neon' }, day) + G({ 'data-only': 'lofi neon' }, night);
      s += face(rr(79, 24, 6, 102, 1), W.front, { w: 1.6 }) + face(rr(24, 72, 116, 6, 1), W.front, { w: 1.6 });
      s += shine('M30 34l14 -8h6l-14 8Z', { opacity: 0.6 });
      s += box(6, 150, 152, 8, 18, p.wood, { r: 2 });
      // cortinas con lazo y barra
      s += part('M10 8C12 48 20 74 34 92C40 100 30 108 24 102C14 90 8 70 6 40V8Z', C.front, { w: 1.8 }) + part('M154 8C152 48 144 74 130 92C124 100 134 108 140 102C150 90 156 70 158 40V8Z', C.front, { w: 1.8 });
      s += line('M14 20C16 50 22 72 30 86M150 20C148 50 142 72 134 86', C.hi, 1.6, { opacity: 0.6 });
      s += part(ellD(27, 94, 6, 4), p.accent, { w: 1.4 }) + part(ellD(137, 94, 6, 4), p.accent, { w: 1.4 });
      s += face(rr(2, 4, 160, 6, 3), W.side, { w: 1.6 }) + Cir(4, 7, 4.5, { fill: W.top, stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' }) + Cir(160, 7, 4.5, { fill: W.top, stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'ventanaRedonda', name: 'Ventana de noche', cat: 'pared', price: 120, w: 124, h: 130, place: 'pared', tags: ['aesthetic', 'gotico', 'angelical'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = face(ellD(62, 60, 56, 56), W.front);
      s += face(ellD(62, 60, 46, 46), '#2B3466', { w: 1.6 });
      s += Cir(80, 42, 10, { fill: '#FFF2B0', 'data-r': 'flat' }) + Cir(85, 38, 9, { fill: '#2B3466', 'data-r': 'flat' });
      [[38, 40], [50, 78], [72, 72], [44, 58], [86, 66]].forEach(([x, y], i) => { s += Cir(x, y, i % 2 ? 1.6 : 2.4, { fill: '#FFF2B0', 'data-r': 'flat' }); });
      s += face(rr(59, 14, 6, 92, 1), W.front, { w: 1.6 }) + face(rr(16, 57, 92, 6, 1), W.front, { w: 1.6 });
      s += box(14, 124, 96, 6, 12, p.wood, { r: 2 });
      s += shine('M30 42c4 -10 12 -16 20 -18c-6 6 -10 12 -12 20Z', { opacity: 0.35 });
      return s;
    },
  },
  {
    id: 'repisa', name: 'Repisa', cat: 'pared', price: 60, w: 146, h: 86, place: 'pared', tags: ['dulce', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = '';
      // cosas sobre la repisa
      ['#E57B93', '#7FA9DE', '#F2C14E'].forEach((c, i) => { s += face(rr(16 + i * 9, 30 - i * 3, 8, 24 + i * 3, 1.2), c, { w: 1.4 }); });
      s += pot(76, 54, 10, 8, 14, p.cloth) + part('M76 40c-10 -6 -8 -16 0 -18c8 2 10 12 0 18Z', '#7FB894', { w: 1.4 });
      s += part(ellD(112, 44, 11, 11), p.accent === '#FFFFFF' ? '#F7A6B9' : p.accent, { w: 1.6 }) + line('M104 40q8 -6 16 0', '#FFFFFF', 1.6, { opacity: 0.8 });
      s += box(4, 64, 138, 8, 22, p.wood, { r: 2 });
      // ménsulas
      [24, 122].forEach((x) => { s += face(`M${x - 4} 64H${x + 4}V70L${x - 4} 84Z`, W.side, { w: 1.6 }); });
      return s;
    },
  },
  {
    id: 'guirnalda', name: 'Guirnalda de luces', cat: 'luces', price: 85, w: 228, h: 80, place: 'pared', tags: ['dulce', 'aesthetic', 'y2k', 'princesa'],
    draw: (p) => {
      let s = line('M6 12Q60 54 114 28Q166 2 222 36', '#6E5A62', 2.6);
      const cols = [p.cloth, '#FFE9A8', p.accent === '#FFFFFF' ? '#BFE0F5' : p.accent];
      [[26, 30], [53, 42], [81, 44], [110, 34], [138, 24], [166, 21], [194, 28]].forEach(([x, y], i) => {
        const c = cols[i % 3];
        s += Ell(x, y + 8, 13, 11, { fill: c, opacity: 0.25, 'data-r': 'tone' });
        s += face(rr(x - 3, y - 2, 6, 5, 1.2), '#9A8B7E', { w: 1.2 });
        s += part(`M${x} ${y + 2}C${x - 7} ${y + 4} ${x - 6} ${y + 15} ${x} ${y + 15}C${x + 6} ${y + 15} ${x + 7} ${y + 4} ${x} ${y + 2}Z`, c, { w: 1.6 });
        s += Cir(x - 2, y + 7, 1.8, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' });
      });
      return s;
    },
  },
  {
    id: 'banderines', name: 'Banderines', cat: 'pared', price: 70, w: 240, h: 76, place: 'pared', tags: ['dulce', 'hippie', 'y2k'],
    draw: (p) => {
      let s = line('M6 10Q120 40 234 10', '#8C7A70', 2.2);
      const cols = [p.cloth, '#FFFFFF', p.accent === '#FFFFFF' ? '#F7D56B' : p.accent, mix(p.cloth, '#FFFFFF', 0.5)];
      for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8;
        const x = 6 + t * 228, y = 10 + 60 * t * (1 - t);
        const c = cols[i % cols.length];
        s += part(`M${x - 12} ${y - 1}H${x + 12}L${x} ${y + 26}Z`, c, { w: 1.6 });
        if (c === '#FFFFFF') s += Cir(x, y + 8, 3, { fill: p.cloth, 'data-r': 'flat' });
      }
      return s;
    },
  },
  {
    id: 'reloj', name: 'Reloj gatito', cat: 'pared', price: 75, w: 84, h: 92, place: 'pared', tags: ['dulce', 'rustico'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = part('M16 30L20 6L36 20Z', C.front, { w: 1.8 }) + part('M68 30L64 6L48 20Z', C.front, { w: 1.8 });
      s += face(ellD(42, 50, 36, 36), C.front);
      s += face(ellD(42, 50, 28, 28), '#FFFDF8', { w: 1.6 });
      [[42, 26], [66, 50], [42, 74], [18, 50]].forEach(([x, y]) => { s += Cir(x, y, 2.2, { fill: INK, 'data-r': 'flat' }); });
      s += line('M42 50V34M42 50L54 56', INK, 2.4) + Cir(42, 50, 2.6, { fill: p.accent === '#FFFFFF' ? '#E57B93' : p.accent, stroke: INK, 'stroke-width': 1, 'data-r': 'part' });
      s += line('M42 86q-4 4 0 8', C.side, 2.4);
      return s;
    },
  },
  {
    id: 'cuadro', name: 'Cuadro de paisaje', cat: 'pared', price: 90, w: 124, h: 104, place: 'pared', tags: ['elegante', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = line('M40 18L62 4L84 18', '#8C7A70', 1.6) + Cir(62, 4, 2.4, { fill: '#8C7A70', 'data-r': 'flat' });
      s += face(rr(6, 16, 112, 84, 3), W.front);
      s += face(rr(16, 26, 92, 64, 1), '#CFE6F2', { w: 1.4 });
      s += Cir(84, 44, 8, { fill: '#FFD97A', 'data-r': 'flat' });
      s += flat('M17 76L42 48L60 66L74 54L107 82V89H17Z', '#7FAE96');
      s += flat('M17 82L34 70L58 86L84 72L107 86V89H17Z', '#5E8F74');
      s += flat('M42 48l-5 6h10Z', '#FFFFFF');
      s += line('M10 20H114', W.hi, 1.4, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'corcho', name: 'Pizarra de corcho', cat: 'pared', price: 80, w: 142, h: 108, place: 'pared', tags: ['aesthetic', 'y2k', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = face(rr(6, 6, 130, 96, 4), W.front);
      s += face(rr(14, 14, 114, 80, 2), '#C9A27A', { w: 1.4 });
      [[22, 22], [60, 30], [100, 20], [32, 64], [84, 70], [110, 58]].forEach(([x, y]) => { s += Cir(x, y, 1.2, { fill: '#A8835C', 'data-r': 'flat' }); });
      // fotos, notitas y chinches
      s += face('M22 24l30 -4l4 34l-30 4Z', '#FFFFFF', { w: 1.4 }) + flat('M25 27l24 -3l3 22l-24 3Z', '#9FCBE8');
      s += face('M68 22h28v26h-28Z', '#FFE58A', { w: 1.4 }) + line('M72 30h20M72 36h16M72 42h18', '#C9A548', 1.2);
      s += face('M100 50l26 4l-4 32l-26 -4Z', '#FFFFFF', { w: 1.4 }) + flat('M102 54l20 3l-3 22l-20 -3Z', '#F7B6C4');
      s += part('M64 62C56 56 54 50 58 46C61 44 64 46 64 48C64 46 67 44 70 46C74 50 72 56 64 62Z', p.cloth, { w: 1.4 });
      s += face('M30 70h34v20h-34Z', '#BDE5CF', { w: 1.4 }) + line('M34 76h26M34 82h20', '#7FB894', 1.2);
      [[37, 21], [82, 21], [112, 52], [47, 70]].forEach(([x, y], i) => { s += part(ellD(x, y, 3.4, 3.4), [p.cloth, '#7FA9DE', '#F2C14E', '#7FB894'][i], { w: 1.2 }); });
      return s;
    },
  },
  {
    id: 'letrero', name: 'Letrero neón', cat: 'luces', price: 140, w: 120, h: 100, place: 'pared', tags: ['y2k', 'aesthetic', 'rockero'],
    draw: (p) => {
      const glow = p.cloth;
      let s = face(rr(6, 8, 108, 84, 10), '#2A2433', { w: 2 });
      const heart = 'M60 74C40 60 30 48 34 36C38 26 52 24 60 36C68 24 82 26 86 36C90 48 80 60 60 74Z';
      s += P(heart, glow, 0.35, 9) + P(heart, glow, 1, 3.6) + P(heart, '#FFFFFF', 0.9, 1.4);
      s += Cir(16, 16, 2, { fill: '#8C8592', 'data-r': 'flat' }) + Cir(104, 16, 2, { fill: '#8C8592', 'data-r': 'flat' });
      return s;
    },
  },
];

// trazo de tubo de luz
function P(d, c, op, w) {
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" data-r="line"/>`;
}

// maceta chica (repisa)
function pot(cx, y, rTop, rBot, h, color) {
  const M = mat(color);
  return face(`M${cx - rTop} ${y - h}L${cx - rBot} ${y}H${cx + rBot}L${cx + rTop} ${y - h}Z`, M.front, { w: 1.4 }) + face(rr(cx - rTop - 2, y - h - 4, rTop * 2 + 4, 5, 2), M.top, { w: 1.4 });
}

// Marco de un póster: la foto va encima, en `photo`. Lo cuelga un hilo de
// un clavito, como el cuadro.
export const POSTER_FRAME = { w: 120, h: 156, photo: { x: 17, y: 30, w: 86, h: 112 } };
export function posterFrameDraw(p) {
  const W = mat(p.wood);
  let s = line('M40 18L60 4L80 18', '#8C7A70', 1.6) + Cir(60, 4, 2.4, { fill: '#8C7A70', 'data-r': 'flat' });
  s += face(rr(4, 16, 112, 136, 3), W.front);
  s += face(rr(11, 23, 98, 122, 2), '#FFF8EE', { w: 1.6 });
  s += face(rr(16, 29, 88, 114, 1), '#D9D2DE', { w: 1.2 });
  s += line('M8 20H112', W.hi, 1.4, { opacity: 0.6 });
  return s;
}
