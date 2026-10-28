// Muebles con personalidad (ver DISENO_MUNDO_VIVO.md §8): el rincón gamer,
// el tocador con luces, la silla mariposa… Misma perspectiva que el resto
// (frente + tapa, sin costados) y la misma pintura (`p`).

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, cylinder, pot, legs, leaf, tube, hollow, Cir, Ell, INK } from '../draw.js';

const glow = (cx, cy, rx, ry, c = '#FFE9A8', op = 0.3) => Ell(cx, cy, rx, ry, { fill: c, opacity: op, 'data-r': 'tone' });
const bulb = (x, y, r = 3.4) => glow(x, y, r * 2.4, r * 2.4, '#FFE9A8', 0.45) + Cir(x, y, r, { fill: '#FFF6D6', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
const heart = (x, y, s) => `M${x} ${y + s * 0.85} C${x - s * 1.1} ${y + s * 0.1} ${x - s * 1.05} ${y - s * 0.95} ${x} ${y - s * 0.35} C${x + s * 1.05} ${y - s * 0.95} ${x + s * 1.1} ${y + s * 0.1} ${x} ${y + s * 0.85}Z`;

export const VIBE_FURNITURE = [
  {
    id: 'tocadorLuces', name: 'Tocador con luces', cat: 'mesas', price: 300, w: 150, h: 196, place: 'piso', vibes: ['coquette', 'aesthetic', 'princesa'],
    draw: (p) => {
      let s = floorShadow(75, 192, 66, 8);
      // espejo con bombillos alrededor
      s += face(rr(30, 8, 90, 92, 8), p.wood);
      s += face(rr(40, 18, 70, 72, 4), '#DDEEF8', { w: 1.8 });
      s += shine('M48 26 L64 26 L50 52 L44 52Z', { opacity: 0.6 }) + shine('M70 26 L76 26 L60 56 L56 56Z', { opacity: 0.4 });
      [[36, 18], [36, 40], [36, 62], [36, 84], [114, 18], [114, 40], [114, 62], [114, 84], [56, 12], [75, 12], [94, 12]].forEach(([x, y]) => { s += bulb(x, y, 3.2); });
      // mesa con cajones
      s += box(10, 190, 130, 78, 40, p.wood, { r: 3 });
      s += face(rr(18, 124, 52, 26, 3), mat(p.wood).front, { w: 1.8 }) + face(rr(80, 124, 52, 26, 3), mat(p.wood).front, { w: 1.8 }) + face(rr(18, 156, 114, 26, 3), mat(p.wood).front, { w: 1.8 });
      s += Cir(44, 137, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(106, 137, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(75, 169, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      // cositas encima
      s += face(rr(24, 96, 10, 14, 2), '#FFE3EC', { w: 1.4 }) + face(rr(26, 91, 6, 6, 1), p.accent, { w: 1.2 });
      s += part('M112 110 C108 110 108 98 114 96 L114 92 L120 92 L120 96 C126 98 126 110 122 110Z', '#F7D9F0', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'perchero', name: 'Perchero de ropa', cat: 'mesas', price: 220, w: 160, h: 200, place: 'piso', vibes: ['aesthetic', 'coquette', 'y2k'],
    draw: (p) => {
      let s = floorShadow(80, 196, 70, 7);
      s += tube('M16 194 V20 H144 V194', 5, p.wood);
      s += face(rr(6, 190, 30, 6, 3), tone(p.wood, -0.6), { w: 1.6 }) + face(rr(124, 190, 30, 6, 3), tone(p.wood, -0.6), { w: 1.6 });
      const garment = (x, c, kind) => {
        let g = line(`M${x} 20 v6`, INK, 1.4) + line(`M${x - 12} 34 L${x} 26 L${x + 12} 34`, '#8C7A70', 2);
        if (kind === 'vestido') g += part(`M${x - 11} 34 L${x + 11} 34 L${x + 9} 60 L${x + 20} 108 Q${x} 114 ${x - 20} 108 L${x - 9} 60Z`, c);
        else if (kind === 'chaqueta') g += part(`M${x - 13} 34 L${x + 13} 34 L${x + 14} 96 L${x - 14} 96Z`, c) + line(`M${x} 38 V96`, tone(c, -1), 1.4) + flat(`M${x - 8} 36 L${x} 50 L${x + 8} 36Z`, '#FFFFFF');
        else g += part(`M${x - 14} 34 L${x + 14} 34 L${x + 12} 80 L${x - 12} 80Z`, c) + flat(heart(x, 54, 5), '#FFFFFF');
        return g;
      };
      s += garment(40, p.cloth, 'vestido') + garment(80, '#2E2A3A', 'chaqueta') + garment(118, p.accent, 'camiseta');
      s += box(30, 186, 100, 20, 30, p.wood, { r: 2 }) + face(rr(40, 154, 22, 12, 4), '#FFB6CC', { w: 1.4 }) + face(rr(88, 156, 26, 10, 4), '#FFFFFF', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'setupGamer', name: 'Rincón gamer', cat: 'ocio', price: 360, w: 190, h: 170, place: 'piso', vibes: ['gamer', 'otaku', 'y2k'],
    draw: (p) => {
      let s = floorShadow(95, 166, 84, 8);
      s += glow(95, 50, 90, 46, p.accent, 0.25);
      // escritorio
      s += box(8, 98, 174, 10, 46, p.wood, { r: 2 }) + legs([20, 170], 98, 164, 8, p.wood);
      s += face(rr(122, 106, 50, 50, 3), mat(p.wood).front) + line('M126 120 H168 M126 138 H168', tone(p.wood, -1), 1.4);
      // dos pantallas
      s += face(rr(30, 22, 72, 46, 4), '#2A2230') + flat(rr(34, 26, 64, 38, 2), '#3B3F8F') + flat('M38 56 L52 40 L62 50 L72 36 L94 58 V60 H38Z', '#5B7BD9') + flat(rr(40, 30, 18, 4, 1), p.accent);
      s += face(rr(108, 30, 50, 38, 4), '#2A2230') + flat(rr(112, 34, 42, 30, 2), '#2E4A4A') + line('M116 42 h20 M116 48 h28 M116 54 h14', '#8ED07A', 2);
      s += face(rr(62, 68, 8, 10, 1), '#3A3044', { w: 1.4 }) + face(rr(128, 68, 8, 10, 1), '#3A3044', { w: 1.4 });
      // teclado RGB y mouse
      s += face(rr(44, 80, 66, 9, 3), '#2A2230', { w: 1.6 }) + ['#FF5FA2', '#FFD45C', '#8ED07A', '#7FC8F8', '#C9A6FF'].map((c, i) => flat(rr(48 + i * 12, 83, 10, 3, 1), c)).join('');
      s += face(ellD(124, 84, 7, 4.5), '#2A2230', { w: 1.4 }) + flat(ellD(124, 83, 2, 1.2), p.accent);
      // tira de luz debajo
      s += line('M12 96 H178', p.accent, 3, { opacity: 0.9 });
      return s;
    },
  },
  {
    id: 'sillaGamer', name: 'Silla gamer', cat: 'asientos', price: 220, w: 96, h: 170, place: 'piso', vibes: ['gamer', 'otaku'],
    draw: (p) => {
      let s = floorShadow(48, 166, 40, 6);
      s += face('M24 10 Q48 2 72 10 L76 96 Q48 102 20 96Z', '#2A2230');
      s += flat('M34 14 Q48 10 62 14 L64 92 Q48 96 32 92Z', p.cloth) + face(rr(34, 20, 28, 12, 5), '#3A3044', { w: 1.4 });
      s += face(rr(16, 92, 64, 20, 6), '#2A2230') + flat(rr(24, 96, 48, 10, 4), p.cloth);
      s += face(rr(8, 72, 12, 30, 3), '#3A3044', { w: 1.6 }) + face(rr(76, 72, 12, 30, 3), '#3A3044', { w: 1.6 });
      s += face(rr(44, 112, 8, 28, 2), '#7C8496', { w: 1.4 });
      s += line('M18 154 L48 140 L78 154 M48 140 V158', '#3A3044', 4) + [18, 48, 78].map((x) => Cir(x, 158, 4, { fill: '#2A2230', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' })).join('');
      return s;
    },
  },
  {
    id: 'arcade', name: 'Máquina arcade', cat: 'ocio', price: 340, w: 96, h: 200, place: 'piso', vibes: ['gamer', 'y2k', 'rockera'],
    draw: (p) => {
      let s = floorShadow(48, 196, 42, 6) + glow(48, 70, 46, 40, p.accent, 0.22);
      s += face('M10 196 V30 Q10 8 30 8 H66 Q86 8 86 30 V196Z', p.cloth);
      s += face(rr(16, 14, 64, 16, 3), '#2A2230') + line('M24 22 h48', p.accent, 3);
      s += face('M18 36 H78 V92 L72 98 H24 L18 92Z', '#2A2230') + flat(rr(24, 42, 48, 46, 2), '#2E2A6A');
      s += flat(rr(36, 58, 8, 8, 1), '#FFD45C') + flat(rr(52, 70, 8, 8, 1), '#FF5FA2') + flat('M30 80 h36 v4 h-36Z', '#8ED07A');
      s += face('M8 100 H88 L84 124 H12Z', tone(p.cloth, -0.6)) + line('M30 108 v-8', INK, 2.4) + Cir(30, 98, 4, { fill: '#E8505E', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += [[54, 110, '#FFD45C'], [64, 106, '#7FC8F8'], [74, 110, '#FF5FA2']].map(([x, y, c]) => Cir(x, y, 3.4, { fill: c, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' })).join('');
      s += face(rr(36, 150, 24, 14, 2), '#2A2230', { w: 1.4 }) + flat(rr(44, 154, 8, 6, 1), '#FFD45C');
      return s;
    },
  },
  {
    id: 'estanteFiguras', name: 'Estante de figuras', cat: 'mesas', price: 240, w: 120, h: 190, place: 'piso', vibes: ['otaku', 'gamer', 'kawaii'],
    draw: (p) => {
      let s = floorShadow(60, 186, 54, 7);
      s += box(8, 184, 104, 168, 30, p.wood, { r: 2 });
      [[14, 22], [14, 76], [14, 130]].forEach(([x, y]) => { s += face(rr(x, y, 92, 46, 2), hollow(p.wood), { w: 1.6 }) + shade(`M${x} ${y}h92v8h-92Z`, '#000000', 0.15); });
      s += glow(60, 40, 40, 20, '#E8F4FF', 0.4);
      const fig = (x, y, c, hair) => part(`M${x - 6} ${y} L${x - 4} ${y - 14} L${x + 4} ${y - 14} L${x + 6} ${y}Z`, c, { w: 1.2 }) + part(ellD(x, y - 20, 6, 6.5), '#FFE3D3', { w: 1.2 }) + part(`M${x - 6} ${y - 20} C${x - 7} ${y - 30} ${x + 7} ${y - 30} ${x + 6} ${y - 20} C${x + 3} ${y - 24} ${x - 3} ${y - 24} ${x - 6} ${y - 20}Z`, hair, { w: 1.2 }) + face(rr(x - 7, y, 14, 3, 1), '#E8F4FF', { w: 1 });
      s += fig(32, 63, '#FF7FA8', '#FFD45C') + fig(60, 63, '#5B7BD9', '#2E2A3A') + fig(88, 63, '#8ED07A', '#FF9EC4');
      s += part('M24 118 C24 100 46 100 46 118Z', '#FFB6CC', { w: 1.4 }) + Cir(30, 112, 1.6, { fill: INK, 'data-r': 'flat' }) + Cir(40, 112, 1.6, { fill: INK, 'data-r': 'flat' });
      s += face(rr(58, 96, 40, 22, 2), '#FFFFFF', { w: 1.4 }) + flat('M62 100 L74 100 L70 114 L62 114Z', '#2E2A3A') + flat('M76 100 L94 100 L94 114 L80 114Z', '#FF7FA8');
      s += part('M30 174 L30 148 L50 148 L50 174Z', '#FFE07A', { w: 1.4 }) + part('M70 174 C64 160 72 148 82 150 C92 152 96 164 88 174Z', '#C9A6FF', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'sillaMariposa', name: 'Silla mariposa', cat: 'asientos', price: 190, w: 140, h: 130, place: 'piso', vibes: ['y2k', 'kawaii'],
    draw: (p) => {
      let s = floorShadow(70, 126, 56, 7);
      s += part('M70 70 C50 20 6 14 10 50 C12 74 40 84 70 82Z', p.cloth) + part('M70 70 C90 20 134 14 130 50 C128 74 100 84 70 82Z', p.cloth);
      s += part('M70 80 C46 82 22 96 30 112 C38 124 62 112 70 96Z', tone(p.cloth, 0.5)) + part('M70 80 C94 82 118 96 110 112 C102 124 78 112 70 96Z', tone(p.cloth, 0.5));
      s += Cir(36, 46, 10, { fill: mix(p.cloth, '#FFFFFF', 0.5), 'data-r': 'flat' }) + Cir(104, 46, 10, { fill: mix(p.cloth, '#FFFFFF', 0.5), 'data-r': 'flat' });
      s += part('M64 64 C64 54 76 54 76 64 L74 110 Q70 114 66 110Z', tone(p.cloth, -0.8), { w: 1.6 });
      s += tube('M44 112 L36 124 M96 112 L104 124', 3.4, '#DCE1EA');
      return s;
    },
  },
  {
    id: 'puffNube', name: 'Puf de nube', cat: 'asientos', price: 150, w: 130, h: 84, place: 'piso', vibes: ['kawaii', 'celestial'],
    draw: (p) => {
      let s = floorShadow(65, 80, 58, 7);
      s += part('M14 74 C2 74 2 52 18 50 C16 30 40 24 50 38 C56 20 84 18 90 36 C102 26 122 34 118 52 C130 54 130 74 116 74Z', p.cloth);
      s += part('M24 52 C26 42 36 40 42 46', '#FFFFFF', { w: 1.4 }) + shade('M16 70 Q65 80 114 70 L116 74 Q65 82 14 74Z', '#2A1C24', 0.15);
      s += Cir(52, 58, 2.4, { fill: INK, 'data-r': 'flat' }) + Cir(78, 58, 2.4, { fill: INK, 'data-r': 'flat' }) + line('M61 64 q4 3 8 0', INK, 1.6) + Ell(44, 64, 4.4, 2.6, { fill: '#FF9EB5', opacity: 0.7, 'data-r': 'tone' }) + Ell(86, 64, 4.4, 2.6, { fill: '#FF9EB5', opacity: 0.7, 'data-r': 'tone' });
      return s;
    },
  },
  {
    id: 'neveraMini', name: 'Nevera mini', cat: 'mesas', price: 230, w: 92, h: 140, place: 'piso', vibes: ['kawaii', 'y2k', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(46, 136, 40, 6);
      s += box(8, 134, 76, 114, 34, p.cloth, { r: 8 });
      s += line('M8 70 H84', tone(p.cloth, -1), 2) + face(rr(70, 26, 6, 30, 3), '#DCE1EA', { w: 1.4 }) + face(rr(70, 80, 6, 30, 3), '#DCE1EA', { w: 1.4 });
      s += Cir(26, 34, 7, { fill: '#FFE07A', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }) + part(heart(46, 46, 6), '#FF6F91', { w: 1.2 }) + part('M20 92 L30 92 L32 108 L18 108Z', '#8ED07A', { w: 1.2 }) + Cir(48, 100, 6, { fill: '#7FC8F8', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += line('M14 26 C20 23 40 23 56 23', '#FFFFFF', 2, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'caballete', name: 'Caballete de pintura', cat: 'ocio', price: 210, w: 120, h: 190, place: 'piso', vibes: ['aesthetic', 'cottagecore'],
    draw: (p) => {
      let s = floorShadow(60, 186, 46, 6);
      s += tube('M60 6 L22 184 M60 6 L98 184 M60 6 L64 184', 4.4, p.wood);
      s += face(rr(16, 110, 88, 8, 2), p.wood, { w: 1.6 });
      s += face(rr(20, 30, 80, 82, 2), '#FFFDF8');
      s += flat(rr(24, 34, 72, 74, 0), '#BFE0F5') + flat('M24 82 Q50 66 72 78 T96 74 V108 H24Z', '#8ED07A') + Cir(76, 50, 9, { fill: '#FFD45C', 'data-r': 'flat' }) + flat('M30 60 c4 -8 14 -8 16 0Z', '#FFFFFF');
      s += part('M70 132 C60 124 74 112 86 118 C96 122 96 134 86 136 C80 132 76 134 70 132Z', '#F2D9BC', { w: 1.4 }) + [[78, 120, '#E8505E'], [86, 124, '#5B7BD9'], [82, 130, '#FFD45C']].map(([x, y, c]) => Cir(x, y, 2.4, { fill: c, 'data-r': 'flat' })).join('');
      return s;
    },
  },
  {
    id: 'microfonoPie', name: 'Micrófono de pie', cat: 'ocio', price: 160, w: 70, h: 180, place: 'piso', vibes: ['rockera', 'y2k'],
    draw: (p) => {
      let s = floorShadow(35, 176, 26, 5);
      s += tube('M35 172 V60', 4, '#3A3044') + tube('M14 176 L35 160 L56 176', 3.4, '#3A3044');
      s += tube('M35 64 L46 40', 3.4, '#3A3044');
      s += part('M42 46 L52 26 Q56 18 62 22 Q68 26 62 34 L50 52Z', p.cloth) + line('M52 28 l8 5 M49 34 l8 5 M46 40 l8 5', '#9AA2B6', 1.2);
      s += line('M35 70 C24 80 24 100 35 110', '#2A2230', 1.6);
      return s;
    },
  },
  {
    id: 'estantePlantas', name: 'Repisa de plantas', cat: 'plantas', price: 210, w: 130, h: 176, place: 'piso', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(65, 172, 58, 6);
      s += tube('M14 172 L24 10 M116 172 L106 10', 4, p.wood);
      [56, 108, 160].forEach((y, i) => { s += box(10 + i * -2, y, 110 + i * 4, 6, 24, p.wood, { r: 1 }); });
      s += pot(36, 50, 12, 9, 18, '#F2A7B5') + leaf(36, 32, 22, -110, 5, '#6FB07E') + leaf(36, 32, 20, -70, 5, '#8CC7A0') + leaf(36, 32, 16, -150, 4, '#6FB07E');
      s += pot(86, 50, 11, 8, 16, '#FFFFFF') + part('M86 34 c-8 -4 -10 -14 -2 -16 c4 4 4 10 2 16Z M86 34 c8 -4 10 -14 2 -16 c-4 4 -4 10 -2 16Z', '#7FB894', { w: 1.2 });
      s += pot(60, 102, 14, 10, 18, p.cloth) + [[-10, -24], [0, -28], [10, -22]].map(([dx, dy]) => part(`M${60 + dx} ${84 + dy} c-3 4 -3 14 0 ${-dy - 2} c3 -6 3 -14 0 ${-dy - 2}Z`, '#8ED07A', { w: 1.2 })).join('');
      s += line('M98 102 C104 116 96 128 102 142', '#6FB07E', 2) + leaf(100, 120, 10, 30, 3, '#8CC7A0') + leaf(98, 134, 10, 150, 3, '#8CC7A0');
      s += pot(98, 102, 10, 8, 14, '#C9A06A');
      return s;
    },
  },
  {
    id: 'tiraLed', name: 'Tira de luces LED', cat: 'luces', price: 120, w: 240, h: 40, place: 'pared', vibes: ['gamer', 'aesthetic', 'y2k'], light: true,
    draw: (p) => {
      let s = glow(120, 26, 117, 18, p.accent, 0.35);
      s += face(rr(4, 14, 232, 8, 4), '#3A3044', { w: 1.6 });
      for (let x = 12; x < 236; x += 16) s += Cir(x, 18, 2.6, { fill: mix(p.accent, '#FFFFFF', 0.4), 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'espejoOndulado', name: 'Espejo ondulado', cat: 'pared', price: 170, w: 96, h: 150, place: 'pared', vibes: ['aesthetic', 'coquette', 'y2k'],
    draw: (p) => {
      const wave = 'M48 6 C66 6 70 20 82 22 C92 26 86 44 90 56 C94 70 84 80 88 96 C92 112 80 120 76 132 C70 144 56 142 48 144 C40 142 26 144 20 132 C16 120 4 112 8 96 C12 80 2 70 6 56 C10 44 4 26 14 22 C26 20 30 6 48 6Z';
      let s = face(wave, p.cloth);
      s += face('M48 16 C62 16 64 28 74 30 C80 34 76 46 79 56 C82 68 74 78 77 94 C80 108 70 114 67 124 C62 134 54 132 48 134 C42 132 34 134 29 124 C26 114 16 108 19 94 C22 78 14 68 17 56 C20 46 16 34 22 30 C32 28 34 16 48 16Z', '#DDEEF8', { w: 1.6 });
      s += shine('M32 34 L46 30 L28 76 L22 76Z', { opacity: 0.6 }) + shine('M52 32 L58 32 L40 82 L36 82Z', { opacity: 0.4 });
      return s;
    },
  },
  {
    id: 'floresSecas', name: 'Flores secas colgantes', cat: 'pared', price: 110, w: 110, h: 110, place: 'pared', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      let s = tube('M8 14 H102', 3.4, p.wood);
      const bunch = (x, len, c) => {
        let b = line(`M${x} 16 V${16 + len}`, '#8A7A50', 1.6) + line(`M${x - 4} 20 L${x - 6} ${12 + len} M${x + 4} 20 L${x + 6} ${12 + len}`, '#8A7A50', 1.2);
        for (let i = 0; i < 5; i++) b += Cir(x - 6 + i * 3, 14 + len + (i % 2) * 3, 3, { fill: i % 2 ? c : tone(c, 0.5), stroke: INK, 'stroke-width': 0.9, 'data-r': 'part' });
        return b + line(`M${x - 4} 22 Q${x} 26 ${x + 4} 22`, p.accent, 2.4);
      };
      s += bunch(24, 60, '#E8B4C4') + bunch(55, 76, '#E8C98A') + bunch(86, 54, '#B8A1D8');
      return s;
    },
  },
  {
    id: 'tapeteYoga', name: 'Tapete de yoga', cat: 'alfombras', price: 90, w: 200, h: 46, place: 'piso', layer: 'suelo', vibes: ['deportiva', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(100, 40, 96, 6);
      s += face('M10 38 L24 10 H190 L176 38Z', p.cloth);
      s += line('M30 14 H184 M26 22 H182', mix(p.cloth, '#FFFFFF', 0.4), 1.4, { opacity: 0.7 });
      s += part('M176 38 C186 38 192 30 190 22 L190 10 C196 14 198 28 192 36 C188 42 180 42 176 38Z', tone(p.cloth, -0.5), { w: 1.6 });
      return s;
    },
  },
  {
    id: 'alfombraCuadros', name: 'Alfombra de cuadros', cat: 'alfombras', price: 140, w: 220, h: 60, place: 'piso', layer: 'suelo', vibes: ['aesthetic', 'y2k'],
    draw: (p) => {
      let s = floorShadow(110, 54, 106, 6);
      s += face('M8 54 L28 6 H192 L212 54Z', p.cloth);
      const cols = 8, rows = 4;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if ((r + c) % 2) continue;
        const y0 = 6 + (48 * r) / rows, y1 = 6 + (48 * (r + 1)) / rows;
        const xl0 = 28 - 20 * (r / rows), xr0 = 192 + 20 * (r / rows), xl1 = 28 - 20 * ((r + 1) / rows), xr1 = 192 + 20 * ((r + 1) / rows);
        const x00 = xl0 + ((xr0 - xl0) * c) / cols, x01 = xl0 + ((xr0 - xl0) * (c + 1)) / cols, x10 = xl1 + ((xr1 - xl1) * c) / cols, x11 = xl1 + ((xr1 - xl1) * (c + 1)) / cols;
        s += flat(`M${x00} ${y0} L${x01} ${y0} L${x11} ${y1} L${x10} ${y1}Z`, mix(p.cloth, '#FFFFFF', 0.75));
      }
      return s;
    },
  },
  {
    id: 'alfombraFresa', name: 'Alfombra de fresa', cat: 'alfombras', price: 150, w: 170, h: 74, place: 'piso', layer: 'suelo', vibes: ['kawaii', 'cottagecore'],
    draw: (p) => {
      let s = floorShadow(85, 66, 80, 7);
      s += face('M85 70 C40 70 8 54 12 34 C16 14 50 12 85 18 C120 12 154 14 158 34 C162 54 130 70 85 70Z', p.cloth);
      [[46, 34], [70, 30], [96, 30], [122, 34], [58, 48], [86, 46], [112, 48], [84, 60]].forEach(([x, y]) => { s += Ell(x, y, 2.6, 4, { fill: '#FFE29A', 'data-r': 'flat' }); });
      s += part('M60 18 C66 4 78 8 85 16 C92 8 104 4 110 18 C100 22 92 20 85 22 C78 20 70 22 60 18Z', '#6CBF6A', { w: 1.6 });
      return s;
    },
  },
];
