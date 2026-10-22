// Plantas. La maceta toma el color de la tela; el follaje es siempre
// verde (con dos o tres tonos para que tenga volumen).

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, floorShadow, pot, cylinder, Cir, Ell, INK } from '../draw.js';

const G1 = '#6FB07E', G2 = '#4E8F62', G3 = '#9AD0A0';

// Hoja de monstera: corazón alargado con cortes, desde (x,y) hacia `ang`.
function monstera(x, y, len, ang, col) {
  const a = (ang * Math.PI) / 180;
  const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (t, w) => [x + ux * len * t + nx * w, y + uy * len * t + ny * w];
  const W = len * 0.5;
  const pts = [P(0.05, 0), P(0.3, W * 0.9), P(0.62, W), P(0.95, W * 0.35), P(1, 0), P(0.95, -W * 0.35), P(0.62, -W), P(0.3, -W * 0.9)];
  const [a0, a1, a2, a3, a4, a5, a6, a7] = pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`);
  let s = part(`M${a0}C${a1} ${a2} ${a3}Q${a4} ${a5}C${a6} ${a7} ${a0}Z`, col, { w: 1.8 });
  const vein = (t, sd) => { const [mx, my] = P(t, 0); const [ex, ey] = P(t + 0.12, sd * W * 0.85); return `M${mx.toFixed(1)} ${my.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`; };
  s += line([vein(0.32, 1), vein(0.32, -1), vein(0.55, 1), vein(0.55, -1)].join(''), tone(col, -1.2), 2.2, { opacity: 0.9 });
  const [mx0, my0] = P(0.05, 0), [mx1, my1] = P(0.92, 0);
  s += line(`M${mx0} ${my0}L${mx1} ${my1}`, tone(col, -0.7), 1.3, { opacity: 0.8 });
  return s;
}

export const PLANTS = [
  {
    id: 'planta', name: 'Monstera', cat: 'plantas', price: 110, w: 132, h: 206, place: 'piso', tags: ['aesthetic', 'hippie', 'rustico'],
    draw: (p) => {
      let s = floorShadow(66, 202, 34, 5);
      // tallos y hojas, de atrás para adelante (hojas grandes, con cortes)
      s += line('M66 162C60 124 44 98 30 78M66 162C70 118 84 92 104 70M66 162C64 126 62 96 66 50M66 162C74 140 96 128 114 120M66 162C58 142 36 132 18 128M66 162C70 136 80 120 92 104', '#5E8F5E', 3);
      s += monstera(66, 52, 52, -92, G2) + monstera(30, 80, 52, -136, G1) + monstera(104, 72, 50, -46, G1);
      s += monstera(92, 106, 40, -20, G2) + monstera(18, 128, 46, -168, G3) + monstera(114, 120, 46, -10, G3);
      s += pot(66, 202, 30, 22, 46, p.cloth);
      return s;
    },
  },
  {
    id: 'cactus', name: 'Cactus', cat: 'plantas', price: 70, w: 90, h: 150, place: 'piso', tags: ['hippie', 'rustico', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(45, 146, 26, 4);
      const C = '#7FB98A';
      s += part('M22 96V70C22 62 34 62 34 70V96Z', C, { w: 1.8 });
      s += part('M58 84V54C58 46 70 46 70 54V84Z', C, { w: 1.8 });
      s += part('M33 108V30C33 14 57 14 57 30V108Z', C, { w: 1.8 });
      s += part('M22 90H34V104H22Z', C, { w: 1.6 }) + part('M57 78H70V92H57Z', C, { w: 1.6 });
      s += line('M45 22V104M28 70V92M64 54V80', tone(C, -0.8), 1.4, { opacity: 0.7 });
      [[38, 40], [52, 52], [40, 70], [50, 88], [27, 78], [65, 62]].forEach(([x, y]) => { s += line(`M${x} ${y}l-3 -2M${x} ${y}l3 -2`, '#FFF6E0', 1.2); });
      s += part('M45 16c-6 -4 -6 -10 0 -10c6 0 6 6 0 10Z', '#FF8FB0', { w: 1.4 }) + part('M45 18c-9 -1 -11 -8 -6 -10c2 4 4 6 6 10Zm0 0c9 -1 11 -8 6 -10c-2 4 -4 6 -6 10Z', '#FF8FB0', { w: 1.2 });
      s += pot(45, 146, 26, 19, 38, p.cloth);
      return s;
    },
  },
  {
    id: 'flores', name: 'Maceta de tulipanes', cat: 'plantas', price: 80, w: 96, h: 120, place: 'piso', tags: ['dulce', 'princesa', 'hippie'],
    draw: (p) => {
      let s = floorShadow(48, 116, 28, 4);
      const tulip = (x, y, c) => part(`M${x - 8} ${y}C${x - 9} ${y - 10} ${x - 6} ${y - 16} ${x - 4} ${y - 16}L${x} ${y - 10}L${x + 4} ${y - 16}C${x + 6} ${y - 16} ${x + 9} ${y - 10} ${x + 8} ${y}C${x + 6} ${y + 6} ${x - 6} ${y + 6} ${x - 8} ${y}Z`, c, { w: 1.6 });
      const cols = [p.accent === '#FFFFFF' ? '#F7D56B' : p.accent, '#FF8FB0', p.cloth === '#F3E6D3' ? '#E9845A' : '#FFB06B', '#F28CA8'];
      s += line('M48 84Q36 60 28 40M48 84Q46 56 48 26M48 84Q60 60 68 38M48 84Q54 70 74 60', G2, 2.4);
      s += part('M40 84C26 74 22 60 26 50C34 60 38 70 44 82Z', G1, { w: 1.6 }) + part('M56 84C70 74 74 62 70 52C62 62 58 72 52 82Z', G1, { w: 1.6 });
      s += tulip(28, 40, cols[0]) + tulip(48, 26, cols[1]) + tulip(68, 38, cols[2]) + tulip(74, 60, cols[3]);
      s += pot(48, 116, 26, 19, 32, p.wood);
      return s;
    },
  },
  {
    id: 'arbolito', name: 'Arbolito', cat: 'plantas', price: 150, w: 124, h: 230, place: 'piso', tags: ['rustico', 'hippie', 'elegante'],
    draw: (p) => {
      let s = floorShadow(62, 226, 36, 5);
      s += face('M58 170C56 140 60 110 54 80C60 90 64 96 66 108C70 96 72 86 80 78C72 98 70 136 70 170Z', '#9A6B48');
      const blob = (cx, cy, r, c) => part(`M${cx - r} ${cy}C${cx - r} ${cy - r * 0.9} ${cx - r * 0.3} ${cy - r * 1.05} ${cx} ${cy - r}C${cx + r * 0.5} ${cy - r * 1.1} ${cx + r * 1.05} ${cy - r * 0.6} ${cx + r} ${cy}C${cx + r * 1.02} ${cy + r * 0.7} ${cx + r * 0.4} ${cy + r * 0.95} ${cx} ${cy + r * 0.85}C${cx - r * 0.6} ${cy + r * 0.95} ${cx - r * 1.02} ${cy + r * 0.6} ${cx - r} ${cy}Z`, c, { w: 1.8 });
      s += blob(40, 74, 30, G2) + blob(88, 70, 28, G2) + blob(62, 42, 34, G1) + blob(36, 104, 22, G1) + blob(90, 102, 22, G1);
      [[54, 30], [76, 40], [44, 62], [94, 60], [30, 96]].forEach(([x, y]) => { s += Ell(x, y, 7, 4, { fill: G3, 'data-r': 'flat', opacity: 0.9 }); });
      s += pot(62, 226, 34, 28, 56, p.cloth);
      return s;
    },
  },
  {
    id: 'plantaColgante', name: 'Planta colgante', cat: 'plantas', price: 90, w: 100, h: 160, place: 'pared', tags: ['hippie', 'aesthetic', 'rustico'],
    draw: (p) => {
      let s = '';
      s += Cir(50, 6, 4, { fill: 'none', stroke: '#B9A68C', 'stroke-width': 2.4, 'data-r': 'line' });
      s += line('M50 10L26 62M50 10L50 62M50 10L74 62', '#D9C6A4', 2) + line('M30 54L50 42L70 54', '#D9C6A4', 1.6);
      // hiedra que cae
      const vine = (d) => line(d, G2, 2);
      s += vine('M30 70C24 92 30 116 22 140') + vine('M50 74C52 100 46 124 52 152') + vine('M70 70C78 96 70 118 78 136');
      [[24, 92], [28, 112], [22, 132], [50, 96], [48, 118], [52, 140], [76, 92], [72, 112], [78, 128]].forEach(([x, y], i) => {
        s += part(`M${x} ${y}c${i % 2 ? 9 : -9} -2 ${i % 2 ? 10 : -10} -9 ${i % 2 ? 4 : -4} -11c${i % 2 ? -4 : 4} 3 ${i % 2 ? -6 : 6} 7 ${i % 2 ? -4 : 4} 11Z`, i % 3 ? G1 : G3, { w: 1.3 });
      });
      s += part('M26 60H74L68 84C66 90 34 90 32 84Z', p.cloth, { w: 1.8 });
      s += face(rr(24, 56, 52, 8, 3), mat(p.cloth).top, { w: 1.6 });
      s += part('M38 58c-4 -10 2 -16 8 -12c2 -8 10 -8 12 0c6 -4 12 2 8 12Z', G1, { w: 1.4 });
      return s;
    },
  },
];
