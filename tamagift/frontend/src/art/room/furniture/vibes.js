// Muebles con personalidad (ver DISENO_MUNDO_VIVO.md §8): el rincón gamer,
// el tocador con luces, la silla mariposa… Misma perspectiva que el resto
// (frente + tapa, sin costados), la misma luz (arriba a la izquierda) y
// la misma pintura (`p`). Los materiales salen de las ayudas de fun.js.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, floorShadow, Cir, Ell, INK, hollow, tube, DEPTH, G } from '../draw.js';
import { grain, woodBox, slab, underShadow, contact, inset, knob, taperLegs, rod, glints, rectPts, ellPts, halo, bulbOn, folds, METAL, STEEL, BRASS, WARM } from './fun.js';

const f1 = (v) => Math.round(v * 10) / 10;
const heart = (x, y, s) => `M${x} ${y + s * 0.85} C${x - s * 1.1} ${y + s * 0.1} ${x - s * 1.05} ${y - s * 0.95} ${x} ${y - s * 0.35} C${x + s * 1.05} ${y - s * 0.95} ${x + s * 1.1} ${y + s * 0.1} ${x} ${y + s * 0.85}Z`;
const star = (x, y, r, k = 0.42) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * q)} ${f1(y + Math.sin(a) * q)}`; } return `${d}Z`; };
const sparkle = (x, y, r) => `M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}Z`;
const DARK = '#2E2836';
const acc = (p, alt = '#F2C14E') => (p.accent === '#FFFFFF' ? alt : p.accent);
const wallShadow = (d, op = 0.16) => G({ transform: 'translate(2.5 3)' }, shade(d, '#2A1C24', op));
const nail = (x, y) => part(ellD(x, y, 2.6, 2.6), '#9A8F9E', { w: 1.1 }) + shine(ellD(x - 0.8, y - 0.8, 0.9, 0.9), { opacity: 0.9 });

// Maceta con borde y tierra (para las repisas de plantas).
function planter(cx, y, rTop, rBot, h, c, o = {}) {
  const M = mat(c);
  let s = contact(cx, y, rBot + 3);
  s += face(`M${cx - rTop} ${y - h}L${cx - rBot} ${y - 1.2}Q${cx} ${y + 1} ${cx + rBot} ${y - 1.2}L${cx + rTop} ${y - h}Z`, M.front, { w: 1.5 });
  s += shade(`M${cx + rTop * 0.3} ${y - h + 1}L${cx + rBot * 0.3} ${y - 1}L${cx + rBot - 0.6} ${y - 1.4}L${cx + rTop - 0.6} ${y - h + 1}Z`, M.deep, 0.3);
  s += face(rr(cx - rTop - 2, y - h - 4.5, rTop * 2 + 4, 5.5, 2), M.top, { w: 1.4 });
  if (o.soil !== false) s += flat(ellD(cx, y - h - 3.2, rTop - 0.5, 1.6), '#5A3E30');
  if (o.band) s += flat(`M${cx - rTop + 0.8} ${y - h * 0.55}H${cx + rTop - 0.8}L${cx + rTop - 1.2} ${y - h * 0.4}H${cx - rTop + 1.2}Z`, o.band);
  return s;
}
// Hoja con nervadura, de tres tonos según cuán adelante va.
function lf(x, y, len, ang, wid, c, o = {}) {
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * wid, ny = Math.cos(a) * wid;
  const mx = (x + ex) / 2, my = (y + ey) / 2;
  const d = `M${f1(x)} ${f1(y)}Q${f1(mx + nx)} ${f1(my + ny)} ${f1(ex)} ${f1(ey)}Q${f1(mx - nx)} ${f1(my - ny)} ${f1(x)} ${f1(y)}Z`;
  return part(d, c, { w: o.w || 1.3 }) + (o.vein === false ? '' : line(`M${f1(x)} ${f1(y)}Q${f1(mx + nx * 0.15)} ${f1(my + ny * 0.15)} ${f1(ex)} ${f1(ey)}`, tone(c, -0.8), 1, { opacity: 0.6, 'data-skip': 'pixel' }));
}

export const VIBE_FURNITURE = [
  {
    // Tocador de camerino: espejo con su marco de madera y bombillos
    // encendidos alrededor, mesa con tapa de canto, cajoneras a los lados y
    // el hueco para las rodillas; encima, perfume, labial, joyero y la
    // taza de brochas, cada uno con su sombrita.
    id: 'tocadorLuces', name: 'Tocador con luces', cat: 'mesas', price: 300, w: 150, h: 196, place: 'piso', vibes: ['coquette', 'aesthetic', 'princesa'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(75, 192, 68, 7);
      s += halo(75, 54, 72, 54, WARM, 0.8);
      s += taperLegs([18, 132], 176, 193, 7, 4.5, p.wood, { cap: BRASS });
      // cuerpo: cajoneras a los lados, cajón chato y hueco al medio
      s += face(rr(12, 120, 126, 58, 2.5), W.front);
      s += slab(6, 122, 138, 8, 40, p.wood);
      s += underShadow(12, 122, 126, 4);
      s += inset(17, 127, 38, 22, p.wood, { knob: [36, 138] }) + inset(17, 152, 38, 22, p.wood, { knob: [36, 163] });
      s += inset(95, 127, 38, 22, p.wood, { knob: [114, 138] }) + inset(95, 152, 38, 22, p.wood, { knob: [114, 163] });
      s += inset(59, 127, 32, 11, p.wood, { knob: [75, 132.5], kr: 2.2 });
      s += face('M59 142H91V178H59Z', hollow(p.wood), { w: 1.6 }) + underShadow(60, 143, 30, 5, 0.35);
      // espejo de camerino
      s += contact(75, 104, 46, 0.25);
      s += face(rr(26, 6, 98, 98, 10), W.front);
      s += grain(30, 9, 90, 4, W.front, { n: 1, amp: 0.6 }) + grain(29, 92, 92, 9, W.front, { n: 1, amp: 0.6 });
      s += line('M32 8.4H118', W.hi, 1.5, { opacity: 0.8 });
      s += face(rr(36, 16, 78, 76, 5), W.top, { w: 1.6 });
      s += face(rr(39.5, 19.5, 71, 69, 3.5), '#DCEDF7', { w: 1.5 });
      s += flat('M41 70Q75 62 109 70V87H41Z', mix('#DCEDF7', p.cloth, 0.18));
      s += shade('M41 21H109V25H44V87H41Z', '#6E8FB4', 0.2);
      s += glints(rectPts(41, 21, 68, 66), { at: 0.2, op: 0.55 });
      [[31, 22], [31, 42], [31, 62], [31, 82], [119, 22], [119, 42], [119, 62], [119, 82], [52, 11], [75, 11], [98, 11]].forEach(([x, y]) => { s += bulbOn(x, y, 3.6, WARM, { k: 0.7 }); });
      // cositas encima
      s += contact(46, 111, 7) + part('M41 101Q41 98 44 98H48Q51 98 51 101V108Q51 111 48 111H44Q41 111 41 108Z', mix(p.cloth, '#FFFFFF', 0.55), { w: 1.3 });
      s += flat(rr(42.4, 103, 7.2, 6.6, 2), p.cloth, { opacity: 0.6 }) + shine(rr(42.6, 99.6, 1.6, 6, 0.8), { opacity: 0.8 });
      s += face(rr(43.6, 94.6, 4.8, 3.6, 1), BRASS, { w: 1.1 }) + part(ellD(53, 95, 2.4, 2.4), p.cloth, { w: 1 }) + line('M48.4 96Q51 96 51 95', INK, 1);
      s += contact(58, 111, 3.4) + face(rr(56, 103, 4.4, 8, 1), BRASS, { w: 1.1 }) + part('M56.4 103V99.4L60 97.6V103Z', '#D9435E', { w: 1 });
      s += contact(100, 111, 8) + face(rrTop(93, 102, 15, 4, 2), tone(acc(p, '#F7C6D9'), 0.5), { w: 1.2 }) + face(rr(93, 105, 15, 6.4, 1.5), acc(p, '#F7C6D9'), { w: 1.3 });
      s += flat(heart(100.5, 108, 2), '#FFFFFF', { opacity: 0.9 });
      s += contact(116, 111, 5.6);
      s += line('M113 102L111 92M116 102V90M119 102L121.6 93', tone(p.wood, -1), 1.6);
      s += part(ellD(111, 91, 2, 2.6), '#F2C9B0', { w: 1 }) + part(ellD(116, 89, 2, 2.6), '#E8B4C4', { w: 1 }) + part(ellD(121.8, 92, 2, 2.6), '#F2C9B0', { w: 1 });
      s += face('M111.6 101H120.4L119.6 111H112.4Z', '#FFFFFF', { w: 1.3 }) + flat('M112.2 104H119.8V105.6H112.2Z', p.cloth);
      return s;
    },
  },
  {
    // Perchero de madera: patas, parantes y barra con remates de bola;
    // vestido con lazo, chaqueta con solapas y botones, camiseta con
    // corazón, cada uno en su gancho; abajo, zapatitos y una cartera.
    id: 'perchero', name: 'Perchero de ropa', cat: 'mesas', price: 220, w: 160, h: 200, place: 'piso', vibes: ['aesthetic', 'coquette', 'y2k'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(80, 196, 72, 7);
      s += rod(19, 192, 19, 20, 6.4, p.wood) + rod(141, 192, 141, 20, 6.4, p.wood);
      s += woodBox(4, 196, 30, 6, 16, p.wood, { r: 2.5, grain: false }) + woodBox(126, 196, 30, 6, 16, p.wood, { r: 2.5, grain: false });
      // repisa baja
      s += slab(16, 168, 128, 5, 26, p.wood);
      // zapatitos de charol con su tira, y una cartera con asa y broche
      const SH = '#D9435E';
      const shoe = (x) => contact(x + 8, 161, 9) + part(`M${x} 161V156Q${x} 151 ${x + 5} 151H${x + 9}Q${x + 16} 151 ${x + 16} 157V161Z`, SH, { w: 1.4 })
        + flat(`M${x + 4} 154.6Q${x + 8} 156.6 ${x + 12} 154.6V156.4Q${x + 8} 158.4 ${x + 4} 156.4Z`, tone(SH, -1.1)) + line(`M${x + 6} 151.6Q${x + 8} 148 ${x + 11} 151.4`, tone(SH, -0.5), 1.6)
        + shine(ellD(x + 3.4, 154, 1.2, 1.6), { opacity: 0.8 }) + face(rr(x - 0.4, 159.6, 16.8, 2.4, 1), '#FFFDF6', { w: 1 });
      s += shoe(28) + shoe(46);
      const BAG = mix(p.cloth, '#FFFFFF', 0.25);
      s += contact(108, 161, 15);
      s += line('M99 146Q99 134 108 134Q117 134 117 146', tone(BAG, -1), 2.4);
      s += part('M94 145H122L124 161H92Z', BAG, { w: 1.5 });
      s += part('M94 145H122L121 152Q108 156 95 152Z', tone(BAG, -0.35), { w: 1.3 });
      s += knob(108, 153.4, 2.2, BRASS) + flat('M96 157H120V158.4H96Z', tone(BAG, -0.7), { opacity: 0.6 });
      // barra
      s += rod(15, 20, 145, 20, 6, p.wood);
      s += part(ellD(13, 20, 5, 5), W.top, { w: 1.4 }) + part(ellD(147, 20, 5, 5), W.top, { w: 1.4 });
      const hanger = (x) => line(`M${x} 30V25Q${x} 18.6 ${x + 4} 19.2Q${x + 6} 20 ${x + 5.4} 23`, '#9A93A6', 1.6) + face(`M${x - 14} 35L${x} 28.6L${x + 14} 35V37.6L${x} 31.6L${x - 14} 37.6Z`, mix(p.wood, '#FFFFFF', 0.25), { w: 1.1 });
      // vestido
      const D = mat(p.cloth);
      s += hanger(44);
      s += part('M33 36Q38 34 44 38Q50 34 55 36L53 59H35Z', D.front, { w: 1.6 });
      s += part('M35 62L53 62L64 112Q44 120 24 112Z', D.front, { w: 1.6 });
      s += folds([34, 41, 48, 55], 66, 112, p.cloth, { op: 0.45 });
      s += flat('M37 64L30 110L33 111L39.4 64Z', D.hi, { opacity: 0.7 });
      s += flat('M33 36Q38 34 44 38L41 42Q38 37.6 34 38.4Z', '#FFFFFF', { opacity: 0.9 });
      s += face(rr(34, 58, 20, 5, 2), mix(p.cloth, '#FFFFFF', 0.7), { w: 1.2 });
      s += part('M44 60.4C40 56 36 57 37 60.4C36 64 40 64.6 44 60.4C48 64.6 52 64 51 60.4C52 57 48 56 44 60.4Z', acc(p, '#FFFFFF'), { w: 1.1 });
      // chaqueta
      const J = '#4A5B86', JM = mat(J);
      s += hanger(82);
      s += part('M68 36Q74 33 82 36Q90 33 96 36L98 100H66Z', J, { w: 1.6 });
      s += flat('M82 36L74 37L80 58ZM82 36L90 37L84 58Z', JM.side);
      s += line('M82 40V100', JM.deep, 1.3, { opacity: 0.8 });
      s += flat(rr(70, 76, 9, 2.6, 1), JM.side) + flat(rr(85, 76, 9, 2.6, 1), JM.side);
      [62, 72, 84].forEach((y) => { s += knob(85, y, 1.6, BRASS); });
      s += flat('M68.6 40L70 96L72.2 96L71 40Z', JM.hi, { opacity: 0.6 });
      // camiseta
      const tee = acc(p, '#7FC8F8');
      s += hanger(120);
      s += part('M106 36L114 34Q120 38 126 34L134 36L138 47L132 49L131 82H109L108 49L102 47Z', tee, { w: 1.6 });
      s += part(heart(120, 58, 6), mix(tee, '#FFFFFF', 0.75), { w: 1.1 });
      s += line('M114 34.6Q120 40 126 34.6', tone(tee, -0.9), 1.3, { opacity: 0.7 }) + folds([114, 127], 66, 81, tee, { op: 0.4 });
      return s;
    },
  },
  {
    // Rincón gamer: escritorio con tapa de canto y tira de luz debajo,
    // pantalla grande con un juego encendido y otra con el chat, teclado
    // de colores, mouse en su alfombrilla, audífonos y la torre con su
    // vidrio y ventiladores que brillan.
    id: 'setupGamer', name: 'Rincón gamer', cat: 'ocio', price: 360, w: 190, h: 170, place: 'piso', vibes: ['gamer', 'otaku', 'y2k'],
    draw: (p) => {
      const L = p.accent === '#FFFFFF' ? '#9AD8FF' : p.accent;
      let s = floorShadow(95, 166, 86, 8);
      s += halo(84, 44, 82, 42, mix(L, '#FFFFFF', 0.3), 0.9);
      // patas de metal
      s += rod(16, 106, 16, 164, 6, METAL) + face(rr(8, 161, 16, 5, 2), DARK, { w: 1.3 });
      // torre bajo el escritorio
      s += face(rrTop(140, 102, 40, 8, 3), '#3E3648');
      s += face(rr(140, 108, 40, 56, 3), DARK);
      s += face(rr(144, 112, 32, 44, 2), '#1E1A2A', { w: 1.4 });
      [123, 143].forEach((y) => { s += halo(160, y, 13, 9, L, 0.9) + Cir(160, y, 7.5, { fill: 'none', stroke: L, 'stroke-width': 2.4, 'data-r': 'line' }) + part(ellD(160, y, 3, 3), '#4A4256', { w: 1 }); });
      s += glints(rectPts(144.5, 112.5, 16, 12), { at: 0.1, op: 0.35, w1: 3.6, w2: 1.6, gap: 2.4 });
      s += knob(172, 159.6, 1.8, L);
      // escritorio y tira de luz
      s += slab(6, 106, 178, 7, 44, p.wood);
      s += Ell(70, 112, 62, 5, { fill: L, opacity: 0.3, 'data-r': 'tone' });
      s += line('M12 107.6H136', mix(L, '#FFFFFF', 0.35), 2.2);
      // pantalla grande con su pie
      s += face(rr(60, 70, 10, 12, 1.5), '#5A5562', { w: 1.3 }) + face(ellD(65, 83, 13, 4), '#4A4552', { w: 1.3 });
      s += face(rr(20, 12, 90, 60, 4), DARK);
      s += face(rr(24, 16, 82, 50, 2), '#3B2F7A', { w: 1.3 });
      s += flat('M25 16.6h80v18h-80Z', '#5640A0');
      s += flat(ellD(88, 30, 7, 7), '#FFC6E8') + flat(ellD(90, 28, 2, 2), '#FFE4F4');
      [[34, 24], [52, 20], [70, 30], [44, 34]].forEach(([x, y]) => { s += flat(rr(x - 1, y - 1, 2, 2, 0.4), '#FFFFFF'); });
      s += flat('M25 54L38 42L48 50L62 38L78 52L92 44L105 52V65H25Z', '#2A2266');
      s += flat('M25 58H105V65.4H25Z', '#1E1A4A') + flat('M25 58H105V59.6H25Z', L);
      s += part(rr(48, 49, 8, 9, 3), '#FF8FB0', { w: 1 }) + flat(rr(50, 52, 1.6, 1.6, 0.4), INK) + flat(rr(53, 52, 1.6, 1.6, 0.4), INK);
      s += flat(rr(28, 19, 22, 3, 1), '#2A1E4A') + flat(rr(28, 19, 15, 3, 1), '#FF6F91');
      s += glints(rectPts(25, 17, 80, 48), { at: 0.1, op: 0.3 });
      // pantalla chica con el chat
      s += face(rr(128, 66, 8, 14, 1.5), '#5A5562', { w: 1.3 }) + face(ellD(132, 81, 10, 3.4), '#4A4552', { w: 1.3 });
      s += face(rr(114, 26, 50, 42, 4), DARK);
      s += face(rr(118, 30, 42, 34, 2), '#232A3A', { w: 1.3 });
      [[36, 24, '#8ED07A'], [42, 30, '#FFD45C'], [48, 18, L], [54, 26, '#FF8FB0']].forEach(([y, w, c]) => { s += flat(rr(121, y, 4, 3, 1), c) + flat(rr(127, y + 0.4, w, 2.2, 1), '#7A8298'); });
      // teclado de colores, mouse, alfombrilla y audífonos
      s += face(rrTop(40, 84, 66, 10, 2), '#3A3044', { w: 1.5 }) + face(rr(40, 93, 66, 3.4, 1), DARK, { w: 1.3 });
      ['#FF5FA2', '#FFD45C', '#8ED07A', '#7FC8F8', '#C9A6FF'].forEach((c, i) => { s += flat(rr(43 + i * 12.2, 86, 11, 2.6, 0.8), c) + flat(rr(44 + i * 12.2, 89.6, 10, 2.4, 0.8), tone(c, -0.3)); });
      s += face(rrTop(112, 84, 34, 10, 2), mix(p.cloth, DARK, 0.25), { w: 1.4 });
      s += part(ellD(130, 88, 5.4, 3.6), '#3A3044', { w: 1.3 }) + flat(rr(129.3, 85.2, 1.4, 2.4, 0.6), L);
      s += part('M14 92C12 80 18 74 26 74C34 74 40 80 38 92H34.6C35.6 82 31 78 26 78C21 78 16.4 82 17.4 92Z', '#3A3044', { w: 1.3 });
      s += part(rr(11, 85, 9, 10, 3.6), mix(p.cloth, DARK, 0.2), { w: 1.3 }) + part(rr(32, 85, 9, 10, 3.6), mix(p.cloth, DARK, 0.2), { w: 1.3 });
      s += flat(rr(13, 87, 2, 4, 1), L) + flat(rr(34, 87, 2, 4, 1), L);
      return s;
    },
  },
  {
    // Silla gamer: respaldo de carreras con alas, ranuras de arnés, rayas
    // de color y capitoné, cojín de cabeza y lumbar, asiento con
    // costados, apoyabrazos, pistón cromado y base de cinco ruedas.
    id: 'sillaGamer', name: 'Silla gamer', cat: 'asientos', price: 220, w: 96, h: 170, place: 'piso', vibes: ['gamer', 'otaku'],
    draw: (p) => {
      const C = mat(p.cloth), D = mat(DARK);
      let s = floorShadow(48, 166, 42, 6);
      // base de cinco brazos y ruedas
      s += face('M48 146L13 156V160L48 152L83 160V156Z', '#3A3044', { w: 1.5 });
      s += face('M44 150L28 162H34L48 153L62 162H68L52 150Z', '#4A4256', { w: 1.4 });
      [[14, 162], [82, 162], [31, 165], [65, 165]].forEach(([x, y]) => { s += part(ellD(x, y, 4, 3.4), DARK, { w: 1.2 }) + flat(ellD(x - 1, y - 1, 1.4, 1), '#6E6878'); });
      // pistón
      s += face(rr(42.5, 132, 11, 18, 3), '#3A3044', { w: 1.4 });
      s += face(rr(44.5, 114, 7, 20, 2), STEEL, { w: 1.3 }) + flat(rr(45.6, 116, 1.6, 15, 0.8), '#FFFFFF');
      // apoyabrazos
      [[9, 14], [75, 82]].forEach(([x]) => { s += face(rr(x + 3, 80, 6, 32, 2), '#3A3044', { w: 1.4 }) + face(rr(x, 74, 12, 8, 3.4), DARK, { w: 1.5 }) + flat(rr(x + 2, 75.4, 8, 1.6, 0.8), D.hi); });
      // respaldo
      s += face('M22 12Q48 2 74 12L77 40Q71 46 73 54L77 96Q48 104 19 96L23 54Q25 46 19 40Z', DARK);
      s += flat('M24.6 15L28 15.6L30.4 94.6L25.4 93.6L27.6 54Q29.4 46 24.4 40.6Z', C.front) + flat('M71.4 15L68 15.6L65.6 94.6L70.6 93.6L68.4 54Q66.6 46 71.6 40.6Z', C.front);
      s += flat('M33 18Q48 13 63 18L62 92Q48 96 34 92Z', '#3A3044');
      s += line('M37 36L59 58M59 36L37 58M37 58L59 80M59 58L37 80', D.deep, 1.2, { opacity: 0.6 });
      s += face(rr(30, 22, 6, 13, 3), '#1A1622', { w: 1.2 }) + face(rr(60, 22, 6, 13, 3), '#1A1622', { w: 1.2 });
      s += part(rr(36, 16, 24, 13, 5.5), C.front, { w: 1.5 }) + flat(heart(48, 22.6, 2.8), mix(p.cloth, '#FFFFFF', 0.7));
      s += part(rr(34, 74, 28, 13, 6), C.front, { w: 1.5 }) + line('M37 80.4H59', C.side, 1.2, { opacity: 0.6 });
      s += flat('M24 18Q26 16 28.6 16L30.6 30L26 31Z', D.hi, { opacity: 0.5 });
      // asiento: tapa con costados y canto
      s += face(rrTop(16, 92, 64, 18, 8), mix(DARK, '#4A4256', 0.6));
      s += flat('M30 95H66L64 108H32Z', C.top);
      s += flat('M19 98L28 96L30 108L18 108Z', tone(p.cloth, -0.2)) + flat('M77 98L68 96L66 108L78 108Z', tone(p.cloth, -0.2));
      s += face(rr(17, 108, 62, 10, 5), DARK);
      s += line('M22 110.6H74', D.hi, 1.4, { opacity: 0.7 });
      return s;
    },
  },
  {
    // Máquina arcade: marquesina encendida, pantalla con marcianitos,
    // panel de control saliente (se ve su tapa) con palanca y botones,
    // puerta de monedas con ranuras que brillan, moldura de color por el
    // borde y la placa de abajo.
    id: 'arcade', name: 'Máquina arcade', cat: 'ocio', price: 340, w: 96, h: 200, place: 'piso', vibes: ['gamer', 'y2k', 'rockera'],
    draw: (p) => {
      const C = mat(p.cloth);
      const L = acc(p, '#9AD8FF');
      let s = floorShadow(48, 196, 44, 6);
      s += halo(48, 56, 47, 52, mix(L, '#FFFFFF', 0.3), 0.85);
      // gabinete y moldura de color
      s += face('M10 196V34Q10 8 30 8H66Q86 8 86 34V196Z', C.front);
      s += line('M13.4 194V34Q13.4 11.4 30 11.4H66Q82.6 11.4 82.6 34V194', L, 2.2, { opacity: 0.9 });
      s += flat('M14.6 120V192H18.6V120ZM77.4 120V192H81.4V120Z', C.side);
      s += shine('M17 36Q17 18 30 15H36Q22 20 21 36Z', { opacity: 0.4 });
      // marquesina encendida
      s += face(rr(17, 14, 62, 18, 3), '#FFF4DA', { w: 1.6 });
      s += flat(rr(19, 16, 58, 14, 2), mix(L, '#FFFFFF', 0.55));
      s += flat(star(31, 23, 4.6), '#FF6F91') + flat(rr(38, 20, 28, 2.6, 1.3), '#FF6F91') + flat(rr(38, 25, 20, 2.6, 1.3), '#5B7BD9') + flat(star(70, 23, 3.6), '#FFD45C');
      // pantalla
      s += face('M17 36H79V94H17Z', '#221C30');
      s += face(rr(22, 41, 52, 48, 3), '#1E1E52', { w: 1.4 });
      const alien = (x, y, c) => flat(`M${x} ${y}h8v2h2v4h-2v2h-2v-2h-4v2h-2v-2h-2v-4h2Z`, c) + flat(`M${x + 1.6} ${y + 2.4}h1.6v1.6h-1.6ZM${x + 4.8} ${y + 2.4}h1.6v1.6h-1.6Z`, '#1E1E52');
      s += alien(30, 48, '#FF8FB0') + alien(44, 48, '#FFD45C') + alien(58, 48, '#FF8FB0') + alien(37, 59, '#8ED07A') + alien(51, 59, '#8ED07A');
      s += flat('M44 80h8v2h2v4h-12v-4h2Z', L) + flat(rr(47.4, 72, 1.6, 5, 0.6), '#FFFFFF');
      [[26, 44], [68, 62], [30, 72], [66, 80]].forEach(([x, y]) => { s += flat(rr(x, y, 1.6, 1.6, 0.4), '#FFFFFF'); });
      s += glints(rectPts(23, 42, 50, 46), { at: 0.12, op: 0.3 });
      // panel de control: tapa clara y su frente
      s += face(rrTop(6, 96, 84, 16, 4), C.top);
      s += face(rr(6, 110, 84, 10, 3), C.side);
      s += line('M10 112.4H86', C.front, 1.4, { opacity: 0.8 });
      s += part(ellD(26, 105, 6, 3), DARK, { w: 1.3 }) + rod(26, 104, 26, 95, 2.6, '#8C8592', { lw: 1.1 }) + part(ellD(26, 94, 4, 4), '#E8505E', { w: 1.3 }) + shine(ellD(24.8, 92.8, 1.3, 1.3), { opacity: 0.9 });
      [[48, 104, '#FFD45C'], [58, 101, '#7FC8F8'], [68, 104, '#FF5FA2'], [78, 101, '#8ED07A']].forEach(([x, y, c]) => { s += part(ellD(x, y + 1, 3.8, 2.4), tone(c, -0.7), { w: 1.1 }) + part(ellD(x, y, 3.6, 2.2), c, { w: 1.1 }); });
      // puerta de monedas
      s += face(rr(30, 136, 36, 30, 3), '#3A3044', { w: 1.6 });
      s += face(rr(36, 141, 8, 12, 1.5), '#FFB347', { w: 1.2 }) + face(rr(52, 141, 8, 12, 1.5), '#FFB347', { w: 1.2 });
      s += flat(rr(39.2, 143, 1.6, 8, 0.6), '#7A3A10') + flat(rr(55.2, 143, 1.6, 8, 0.6), '#7A3A10');
      s += knob(48, 159, 2.2, STEEL);
      // placa de abajo
      s += face(rr(16, 182, 64, 10, 2), DARK, { w: 1.5 }) + flat(rr(20, 184, 56, 1.6, 0.8), '#4A4256');
      return s;
    },
  },
  {
    // Vitrina de figuras: mueble de madera con puertas de vidrio (marco
    // fino, reflejos), luz cálida arriba de cada estante y, adentro,
    // figuritas en su base, un peluche, una caja con ventana y mangas.
    id: 'estanteFiguras', name: 'Estante de figuras', cat: 'mesas', price: 240, w: 120, h: 190, place: 'piso', vibes: ['otaku', 'gamer', 'kawaii'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(60, 186, 56, 7);
      s += woodBox(8, 180, 104, 162, 30, p.wood, { r: 2.5, grain: false });
      s += grain(12, 5, 96, 10, W.top, { gap: 4.4, amp: 0.8 });
      s += face(rr(6, 178, 108, 8, 2), W.side, { w: 1.6 });
      const rows = [24, 76, 128];
      rows.forEach((y) => {
        s += face(rr(14, y, 92, 46, 2), hollow(p.wood), { w: 1.6 });
        s += flat(rr(18, y + 1.4, 84, 2.6, 1), '#FFF4D0');
        s += shade(`M18 ${y + 4}H102L96 ${y + 44}H24Z`, '#FFF0C8', 0.16);
      });
      // figuritas en su base
      const fig = (x, y, c, hair) => contact(x, y + 1, 7, 0.3) + face(rr(x - 7, y - 1, 14, 3.4, 1.4), '#E8F4FF', { w: 1 })
        + part(`M${x - 6} ${y - 1}L${x - 4} ${y - 13}H${x + 4}L${x + 6} ${y - 1}Z`, c, { w: 1.2 })
        + part(ellD(x, y - 19, 6.4, 6.4), '#FFE3D3', { w: 1.2 })
        + part(`M${x - 6.6} ${y - 18}C${x - 8} ${y - 30} ${x + 8} ${y - 30} ${x + 6.6} ${y - 18}C${x + 4} ${y - 22} ${x - 4} ${y - 22} ${x - 6.6} ${y - 18}Z`, hair, { w: 1.2 })
        + flat(`M${x - 3} ${y - 18}h1.6v2.4h-1.6ZM${x + 1.4} ${y - 18}h1.6v2.4h-1.6Z`, INK);
      s += fig(26, 66, '#FF7FA8', '#FFD45C') + fig(45, 66, '#5B7BD9', '#3A3044') + fig(76, 66, '#8ED07A', '#FF9EC4') + fig(95, 66, '#FFD45C', '#C97B4A');
      // peluche y caja con ventana
      s += contact(36, 119, 13);
      s += part('M24 119C22 106 28 98 36 98C44 98 50 106 48 119Z', '#FFC2D4', { w: 1.4 });
      s += part('M27 101C25 92 29 89 31 90C32 92 32 97 31 100Z', '#FFC2D4', { w: 1.2 }) + part('M45 101C47 92 43 89 41 90C40 92 40 97 41 100Z', '#FFC2D4', { w: 1.2 });
      s += flat(rr(31, 107, 2, 2.6, 1), INK) + flat(rr(39, 107, 2, 2.6, 1), INK) + Ell(36, 112, 3, 2, { fill: '#FFFFFF', 'data-r': 'flat' });
      s += contact(80, 119, 15);
      s += face(rr(64, 90, 32, 29, 2), acc(p, '#7FC8F8'), { w: 1.4 }) + face(rr(68, 94, 24, 18, 1.5), '#DDEFF8', { w: 1.2 });
      s += part(ellD(80, 101, 4.4, 4.4), '#FFE3D3', { w: 1 }) + part('M75.6 101C75 94 85 94 84.4 101C82 98.6 78 98.6 75.6 101Z', '#3A3044', { w: 1 }) + part('M76 106L84 106L86 112H74Z', '#FF7FA8', { w: 1 });
      s += glints(rectPts(68.5, 94.5, 23, 17), { at: 0.2, op: 0.5 }) + flat(rr(68, 114, 24, 2.6, 1), '#FFFFFF', { opacity: 0.8 });
      // mangas y un peluche redondo
      ['#F2C14E', '#E57B93', '#7FA9DE', '#8ED07A'].forEach((c, i) => { s += face(rr(22 + i * 8, 144, 7.4, 27, 1), c, { w: 1.2 }) + flat(rr(22.8 + i * 8, 148, 5.8, 3, 0.6), '#FFFFFF', { opacity: 0.85 }); });
      s += contact(26, 171, 10);
      s += contact(80, 171, 15);
      s += part('M66 171C62 158 70 148 80 148C90 148 98 158 94 171Z', '#C9A6FF', { w: 1.4 }) + flat(rr(74, 159, 2, 2.6, 1), INK) + flat(rr(84, 159, 2, 2.6, 1), INK) + Ell(72, 164, 3, 1.8, { fill: '#FF9EB5', opacity: 0.8, 'data-r': 'tone' }) + Ell(88, 164, 3, 1.8, { fill: '#FF9EB5', opacity: 0.8, 'data-r': 'tone' });
      // puertas de vidrio
      [[13, 47], [60, 47]].forEach(([x, w]) => {
        s += shade(rr(x + 2, 22, w - 4, 154, 1), '#CFE8F6', 0.14);
        s += G({ 'data-skip': 'pixel' }, glints(rectPts(x + 3, 24, w - 6, 46), { at: 0.6, op: 0.4 }));
        s += G({ 'data-only': 'pixel' }, shade(rr(x + 5, 26, 2, 146, 0), '#FFFFFF', 0.4) + shade(rr(x + 9, 26, 1.4, 60, 0), '#FFFFFF', 0.3));
        s += face(`M${x} 20H${x + w}V178H${x}Z M${x + 3} 23V175H${x + w - 3}V23Z`, tone(p.wood, 0.2), { w: 1.4, a: { 'fill-rule': 'evenodd' } });
      });
      s += knob(56, 100, 2.2) + knob(64, 100, 2.2);
      return s;
    },
  },
  {
    // Silla mariposa: primero es una silla —asiento tapizado con su tapa,
    // canto con ribete y botón, cuatro patas de madera (las de atrás más
    // arriba, porque están más lejos, y en sombra)— y el respaldo tiene
    // forma de mariposa: alas de arriba acolchadas con capitoné y su "ojo",
    // alas de abajo que asoman a los lados como bracitos, el cuerpo de cojín
    // rayado y las antenas.
    id: 'sillaMariposa', name: 'Silla mariposa', cat: 'asientos', price: 190, w: 140, h: 130, place: 'piso', vibes: ['y2k', 'kawaii'],
    draw: (p) => {
      const C = mat(p.cloth);
      const A = acc(p, '#FFD45C');
      const low = tone(p.cloth, 0.35);
      let s = floorShadow(70, 125, 56, 6);
      // patas de atrás
      s += taperLegs([46, 94], 98, 117, 5, 3.4, tone(p.wood, -0.5));
      // antenas
      s += line('M66 26C62 15 58 10 52 7.6M74 26C78 15 82 10 88 7.6', INK, 1.8);
      s += part(ellD(51, 7, 3.6, 3.6), A, { w: 1.2 }) + part(ellD(89, 7, 3.6, 3.6), A, { w: 1.2 });
      [-1, 1].forEach((k) => {
        const X = (v) => (k < 0 ? v : 140 - v);
        // ala de abajo: asoma al costado del asiento, como un bracito
        s += part(`M${X(66)} 70C${X(46)} 68 ${X(24)} 72 ${X(15)} 88C${X(10)} 100 ${X(22)} 110 ${X(36)} 104L${X(62)} 92Z`, low, { w: 1.9 });
        s += flat(ellD(X(22), 95, 4, 3.6), mix(low, '#FFFFFF', 0.55));
        // ala de arriba: el respaldo
        s += part(`M${X(68)} 82C${X(56)} 42 ${X(36)} 13 ${X(18)} 16C${X(4)} 19 ${X(2)} 46 ${X(11)} 60C${X(21)} 74 ${X(44)} 80 ${X(68)} 86Z`, C.front, { w: 2 });
        s += flat(`M${X(12)} 30C${X(15)} 21 ${X(25)} 18 ${X(34)} 21C${X(26)} 22 ${X(18)} 27 ${X(15)} 38Z`, C.hi, { opacity: 0.85 });
        s += line(`M${X(64)} 76C${X(50)} 66 ${X(34)} 56 ${X(16)} 50`, C.side, 1.4, { opacity: 0.45 });
        // el "ojo" del ala, lunares y capitoné
        s += part(ellD(X(32), 40, 8, 8), A, { w: 1.3 }) + flat(ellD(X(32), 40, 4.2, 4.2), mix(p.cloth, '#FFFFFF', 0.75));
        s += flat(`${ellD(X(16), 62, 3.4, 3.4)}${ellD(X(52), 66, 3, 3)}`, mix(p.cloth, '#FFFFFF', 0.5));
        s += flat(`${ellD(X(50), 46, 1.5, 1.5)}${ellD(X(26), 58, 1.5, 1.5)}${ellD(X(40), 70, 1.5, 1.5)}`, C.deep);
        s += line(`M${X(47)} 43L${X(53)} 49M${X(53)} 43L${X(47)} 49M${X(23)} 55L${X(29)} 61M${X(29)} 55L${X(23)} 61`, C.side, 1, { opacity: 0.4, 'data-skip': 'pixel' });
      });
      // cuerpo de cojín, con rayas
      s += part(rr(62.5, 22, 15, 64, 7.5), tone(p.cloth, -0.8), { w: 1.6 });
      s += flat('M63.2 38H76.8V42H63.2ZM63.2 54H76.8V58H63.2ZM63.2 70H76.8V74H63.2Z', tone(p.cloth, -1.4));
      s += flat(rr(65, 25, 2.4, 52, 1.2), tone(p.cloth, -0.1), { opacity: 0.85 });
      // asiento: tapa con el cojín, sombra del respaldo y canto con ribete
      // (tela un poco más clara que las alas, para que el asiento se lea)
      const SE = mat(mix(p.cloth, '#FFFFFF', 0.28));
      s += face(rrTop(24, 80, 92, 18, 12), SE.top);
      s += shade(rr(32, 81.4, 76, 4, 2), C.deep, 0.28);
      s += flat(ellD(58, 88.6, 20, 3.6), SE.hi, { opacity: 0.85 });
      s += flat(ellD(70, 90.6, 2.2, 1.3), SE.side) + line('M60 89.6Q70 93 80 89.6', SE.side, 1.1, { opacity: 0.45, 'data-skip': 'pixel' });
      s += face(rr(24, 94, 92, 13, 6), SE.front);
      s += line('M30 95.8H110', A, 1.8);
      s += shade(rr(28, 102.6, 84, 3.4, 1.7), SE.deep, 0.25);
      // patas de adelante con regatón
      s += taperLegs([36, 104], 105, 124, 6.4, 4.2, p.wood, { cap: BRASS });
      return s;
    },
  },
  {
    // Puf de nube: bultos de felpa con su sombra abajo y luz arriba,
    // costuras entre bultos, y una carita con cachetes.
    id: 'puffNube', name: 'Puf de nube', cat: 'asientos', price: 150, w: 130, h: 84, place: 'piso', vibes: ['kawaii', 'celestial'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = floorShadow(65, 80, 60, 7);
      const cloud = 'M14 76C2 76 1 52 18 50C16 30 40 24 50 37C56 18 84 17 90 35C102 25 123 33 118 51C131 53 131 76 116 76Z';
      s += part(cloud, C.front, { w: 2.2 });
      s += shade('M7 64C9 72 12 76 16 76H116C121 76 126 72 127 64C122 70 116 70 110 68C96 72 80 70 66 72C50 70 36 72 22 68C16 70 10 68 7 64Z', C.deep, 0.32);
      s += flat('M22 50C22 42 30 38 37 40C33 42 28 46 27 52Z', C.hi) + flat('M55 34C58 26 68 23 76 26C68 27 62 30 59 36Z', C.hi) + flat('M95 37C99 33 106 33 110 36C104 37 100 39 98 43Z', C.hi);
      s += line('M18 50C24 52 28 56 30 60M50 37C50 44 46 50 44 54M90 35C88 42 90 48 92 52M118 51C112 53 108 56 106 60', C.side, 1.4, { opacity: 0.45 });
      // carita
      s += flat(rr(49, 56, 3.6, 5, 1.8), INK) + flat(rr(76.4, 56, 3.6, 5, 1.8), INK);
      s += flat(rr(49.8, 56.6, 1.4, 1.6, 0.6), '#FFFFFF') + flat(rr(77.2, 56.6, 1.4, 1.6, 0.6), '#FFFFFF');
      s += line('M60 64Q62.5 67 65 64Q67.5 67 70 64', INK, 1.6);
      s += Ell(43, 65, 5, 2.8, { fill: '#FF9EB5', opacity: 0.75, 'data-r': 'tone' }) + Ell(86, 65, 5, 2.8, { fill: '#FF9EB5', opacity: 0.75, 'data-r': 'tone' });
      return s;
    },
  },
  {
    // Nevera retro: esmalte con brillo, puerta de arriba y de abajo con
    // la junta oscura, manijas cromadas, insignia, imanes (corazón,
    // estrella, fresa, una foto), rejilla abajo, patitas y una plantita
    // encima.
    id: 'neveraMini', name: 'Nevera mini', cat: 'mesas', price: 230, w: 92, h: 140, place: 'piso', vibes: ['kawaii', 'y2k', 'aesthetic'],
    draw: (p) => {
      const C = mat(p.cloth);
      let s = floorShadow(46, 136, 42, 6);
      s += face(rr(14, 128, 8, 8, 2), '#8C8592', { w: 1.3 }) + face(rr(70, 128, 8, 8, 2), '#8C8592', { w: 1.3 });
      s += face(rrTop(8, 12, 76, 22, 12), C.top);
      s += face(rr(8, 22, 76, 108, 12), C.front);
      s += flat(rr(14, 30, 5, 82, 2.5), C.hi, { opacity: 0.8 }) + shine(rr(15, 32, 2, 30, 1), { opacity: 0.6 });
      s += line('M9 58H83', tone(p.cloth, -1.6), 2.2);
      s += flat('M12 120H80V122.4H12Z', C.side) + line('M30 125H62', tone(p.cloth, -1.6), 1.6) + line('M30 128H62', tone(p.cloth, -1.6), 1.6, { opacity: 0.8 });
      // manijas cromadas
      s += face(rr(70, 30, 6, 22, 3), STEEL, { w: 1.4 }) + flat(rr(71.2, 32, 1.6, 16, 0.8), '#FFFFFF');
      s += face(rr(70, 64, 6, 34, 3), STEEL, { w: 1.4 }) + flat(rr(71.2, 66, 1.6, 28, 0.8), '#FFFFFF');
      s += part(ellD(42, 40, 9, 4.4), STEEL, { w: 1.2 }) + flat(rr(36.4, 39, 11, 2, 1), '#8C8592');
      // imanes
      s += part(heart(28, 72, 6), '#FF6F91', { w: 1.2 }) + shine(ellD(25.6, 70, 1.2, 1), { opacity: 0.8 });
      s += part(star(52, 70, 6), '#FFD45C', { w: 1.2 });
      s += part('M26 98C22 92 24 86 30 86C36 86 38 92 34 98C32 101 28 101 26 98Z', '#E8505E', { w: 1.2 }) + part('M26 86.6L30 83L34 86.6L30 88Z', '#6CBF6A', { w: 1 }) + flat('M28 90h1.4v1.4h-1.4ZM31.4 92h1.4v1.4h-1.4ZM29 95h1.4v1.4h-1.4Z', '#FFE29A');
      s += part('M45 82L61 84L59 102L43 100Z', '#FFFFFF', { w: 1.2 }) + flat('M46.6 84.4L59 86L57.6 97L45.2 95.4Z', '#BFE0F5') + flat('M45.6 95L49 90L52 93L55 89L58 96Z', '#8DCC8A');
      // plantita encima
      s += contact(30, 22, 8);
      s += face('M23.6 12H36.4L35 21.6Q30 23 25 21.6Z', '#FFFDF6', { w: 1.3 }) + face(rr(22.6, 9.6, 14.8, 4, 1.6), '#FFFFFF', { w: 1.2 });
      s += lf(30, 10, 10, -125, 3.4, '#6FB07E') + lf(30, 10, 10, -55, 3.4, '#6FB07E') + lf(30, 10, 11, -90, 3.4, '#8CC7A0');
      return s;
    },
  },
  {
    // Caballete de pintora: patas de madera con salpicaduras, la de atrás
    // en sombra, bandeja con pinceles y un tubo, lienzo con su canto y un
    // arcoíris pintado, prensa arriba y la paleta apoyada en el piso.
    id: 'caballete', name: 'Caballete de pintura', cat: 'ocio', price: 210, w: 120, h: 190, place: 'piso', vibes: ['aesthetic', 'cottagecore'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(60, 186, 50, 6);
      s += rod(60, 8, 66, 182, 4.6, W.side);
      s += rod(58, 6, 22, 184, 5.6, p.wood) + rod(62, 6, 98, 184, 5.6, p.wood);
      s += flat(`${ellD(30, 150, 2, 1.6)}${ellD(92, 166, 2.2, 1.6)}${ellD(94, 140, 1.6, 1.4)}`, '#5B7BD9') + flat(`${ellD(27, 166, 1.8, 1.4)}${ellD(88, 120, 1.6, 1.4)}`, '#E8505E');
      // lienzo con canto
      s += face(rrTop(20, 26, 80, 5, 1.5), '#F4EEE4', { w: 1.4 });
      s += face(rr(20, 30, 80, 84, 1.5), '#FFFDF8');
      s += flat(rr(24, 34, 72, 76, 0), '#CBE7F7');
      s += part('M28 92A32 32 0 0 1 92 92H86A26 26 0 0 0 34 92Z', '#FF8F8F', { w: 1 });
      s += flat('M34 92A26 26 0 0 1 86 92H80.6A20.6 20.6 0 0 0 39.4 92Z', '#FFD27A');
      s += flat('M39.4 92A20.6 20.6 0 0 1 80.6 92H75.4A15.4 15.4 0 0 0 44.6 92Z', '#9FE0A8');
      s += flat('M44.6 92A15.4 15.4 0 0 1 75.4 92H70.4A10.4 10.4 0 0 0 49.6 92Z', '#9CC8F2');
      s += flat('M26 94c0 -6 8 -8 11 -3c3 -4 10 -3 10 3Z', '#FFFFFF') + flat('M73 94c0 -6 8 -8 11 -3c3 -4 10 -3 10 3Z', '#FFFFFF');
      s += flat('M24 100Q44 94 60 98T96 96V110H24Z', '#8ED07A');
      s += Cir(84, 46, 6, { fill: '#FFD45C', 'data-r': 'flat' });
      s += face(rr(54, 20, 12, 8, 1.5), W.front, { w: 1.4 });
      // bandeja con pinceles
      s += slab(14, 120, 92, 6, 12, p.wood);
      s += line('M30 113L48 110', '#C98F6A', 2) + flat('M48 109L53 108.4L53.4 110.4L48.4 111Z', '#E8505E');
      s += line('M62 113L80 112', '#C98F6A', 2) + flat('M80 111L85 110.6L85.2 112.6L80.2 113Z', '#5B7BD9');
      s += face(rr(86, 108, 12, 5, 2), '#FFFFFF', { w: 1.1 }) + flat(rr(86.6, 109, 3, 3, 1), acc(p, '#FF8FB0'));
      // paleta apoyada abajo
      s += contact(92, 182, 16);
      s += part('M78 180C74 166 84 154 98 156C110 158 114 170 108 178C104 176 100 178 98 182C92 184 82 184 78 180Z', mix(p.wood, '#F6E2C4', 0.45), { w: 1.5 });
      s += part(ellD(101, 172, 3, 2.6), mix(p.wood, '#F6E2C4', 0.2), { w: 1 });
      [[86, 164, '#E8505E'], [94, 162, '#FFD45C'], [84, 173, '#5B7BD9'], [102, 164, '#8ED07A']].forEach(([x, y, c]) => { s += flat(ellD(x, y, 3, 2.4), c); });
      return s;
    },
  },
  {
    // Micrófono de cantante en su pie: trípode con regatones, caño con su
    // perilla, pinza, mango y la reja de metal con brillo; el cable baja
    // suelto hasta el piso.
    id: 'microfonoPie', name: 'Micrófono de pie', cat: 'ocio', price: 160, w: 70, h: 180, place: 'piso', vibes: ['rockera', 'y2k'],
    draw: (p) => {
      let s = floorShadow(35, 176, 28, 5);
      s += rod(35, 152, 12, 172, 3.6, '#3A3044') + rod(35, 152, 58, 172, 3.6, '#3A3044') + rod(35, 152, 35, 176, 3.6, '#4A4256');
      s += face(rr(7, 170, 9, 4.6, 2), DARK, { w: 1.2 }) + face(rr(54, 170, 9, 4.6, 2), DARK, { w: 1.2 }) + face(rr(31, 173, 8, 4.6, 2), DARK, { w: 1.2 });
      s += face(rr(31, 146, 8, 9, 2), '#3A3044', { w: 1.3 });
      s += rod(35, 150, 35, 64, 4.4, '#4A4256');
      s += face(rr(32, 100, 6, 10, 2), '#3A3044', { w: 1.3 }) + knob(41, 104, 2.8, STEEL);
      s += rod(35, 104, 35, 60, 3.4, STEEL);
      // cable suelto
      s += line('M35 56C46 62 50 78 44 96C40 110 38 124 42 140C45 152 52 160 60 166', DARK, 1.6);
      // pinza, mango y reja
      s += face(rr(30, 52, 10, 8, 2), '#3A3044', { w: 1.3 });
      s += face('M30 30H40L38.4 56H31.6Z', p.cloth, { w: 1.5 });
      s += flat('M31.6 32H33.6L32.8 54H32Z', mix(p.cloth, '#FFFFFF', 0.5)) + flat(rr(31.4, 46, 7.2, 2.4, 1), tone(p.cloth, -0.8));
      s += face(rr(29, 28, 12, 4, 1.5), STEEL, { w: 1.3 });
      s += part(ellD(35, 18, 10.5, 11.5), '#BFC3CC', { w: 1.6 });
      s += line('M25.6 14H44.4M25 19H45M26 24H44', '#8C8E98', 1.1, { opacity: 0.8 });
      s += flat('M24.6 17.6H45.4V20.4H24.6Z', '#8C8E98');
      s += shine(ellD(31, 12, 3, 3.6), { opacity: 0.8 });
      return s;
    },
  },
  {
    // Repisa escalera de plantas: costados de madera inclinados, tres
    // tablas con canto y, en cada una, macetas distintas con plantas de
    // hojas en tres tonos: potus colgante, cactus, lengua de suegra,
    // suculenta, una de hojas grandes en canasto y la regadera.
    id: 'estantePlantas', name: 'Repisa de plantas', cat: 'plantas', price: 210, w: 130, h: 176, place: 'piso', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(65, 172, 60, 6);
      s += rod(16, 172, 26, 8, 5.4, p.wood) + rod(114, 172, 104, 8, 5.4, p.wood);
      // abajo: planta de hojas grandes en canasto y la regadera
      s += slab(10, 164, 110, 6, 22, p.wood);
      s += contact(40, 157, 16);
      s += face('M27 140H53L50 157H30Z', '#D9B888', { w: 1.5 }) + line('M28.4 145H51.6M29.2 150H50.8M29.8 154.4H50.2', '#B8955F', 1.2, { opacity: 0.8 });
      s += lf(40, 140, 18, -150, 6, '#4E9E6E') + lf(40, 140, 18, -30, 6, '#4E9E6E') + lf(40, 140, 20, -110, 6.5, '#6DB67A') + lf(40, 140, 19, -70, 6.5, '#6DB67A') + lf(40, 140, 15, -90, 5.5, '#9AD3A4');
      s += contact(88, 157, 12);
      s += face('M78 141H98V154Q98 157 95 157H81Q78 157 78 154Z', acc(p, '#9FC7E8'), { w: 1.5 }) + part('M98 145L109 138L110 140L99 149Z', acc(p, '#9FC7E8'), { w: 1.2 }) + part(ellD(110, 138, 2.6, 2), tone(acc(p, '#9FC7E8'), -0.4), { w: 1 });
      s += line('M81.6 141Q81.6 133.6 88 133.6Q94.4 133.6 94.4 141', tone(acc(p, '#9FC7E8'), -0.9), 2.4) + shine(rr(80.4, 143, 2, 10, 1), { opacity: 0.6 });
      // medio: lengua de suegra y suculenta
      s += slab(12, 112, 106, 6, 22, p.wood);
      s += planter(38, 105, 10, 8, 14, p.cloth, { band: mix(p.cloth, '#FFFFFF', 0.5) });
      s += part('M32 87C30 76 31 68 34 62C36 70 36 80 36 87Z', '#4E8C60', { w: 1.3 }) + part('M37 87C36 72 38 64 41 58C43 68 42 78 41 87Z', '#6DB67A', { w: 1.3 }) + part('M42 87C42 78 44 72 47 68C48 76 46 82 45 87Z', '#4E8C60', { w: 1.3 });
      s += line('M38.6 64V84M33.6 68V84', '#C9E39A', 1.2, { opacity: 0.7, 'data-skip': 'pixel' });
      s += planter(84, 105, 10, 8, 12, '#E9A27E');
      s += part('M84 92C76 92 72 88 74 85C78 84 82 87 84 92Z', '#8CC7A0', { w: 1.2 }) + part('M84 92C92 92 96 88 94 85C90 84 86 87 84 92Z', '#8CC7A0', { w: 1.2 });
      s += part('M84 92C79 88 79 82 84 79C89 82 89 88 84 92Z', '#B4DDB8', { w: 1.2 }) + flat(ellD(84, 85, 1.4, 2), '#E8B4C4');
      // arriba: potus colgante y cactus
      s += slab(14, 60, 102, 6, 22, p.wood);
      s += planter(36, 53, 10, 8, 13, '#FFFDF6');
      s += line('M30 41C26 52 24 64 26 78M42 41C46 50 46 58 44 66', '#4E8C60', 1.4);
      [[28, 52, -150], [25, 62, 160], [26, 72, -160], [45, 54, -20], [44, 62, 20], [33, 38, -120], [39, 37, -60]].forEach(([x, y, a], i) => { s += lf(x, y, 8, a, 3.2, i % 2 ? '#6DB67A' : '#8CC7A0', { vein: false }); });
      s += planter(88, 53, 8, 6.4, 11, '#E9A27E');
      s += part('M83 41C82 30 86 24 88 24C90 24 94 30 93 41Z', '#6DB67A', { w: 1.4 }) + line('M88 27V40', '#4E8C60', 1.2, { opacity: 0.7 });
      s += part('M83 36C79 36 78 32 79 28C81 28 83 30 83.4 32Z', '#6DB67A', { w: 1.2 }) + part(ellD(88, 23, 2, 2), '#FF8FB0', { w: 1 });
      return s;
    },
  },
  {
    // Tira LED de colores: cinta sujeta a la pared con clips, chips que
    // pasan por el arcoíris (cada tramo tiñe la pared de su color), la
    // cajita del control con sus botones y el cable que baja hasta el
    // enchufe (nada queda colgando en el aire).
    id: 'tiraLed', name: 'Tira de luces LED', cat: 'luces', price: 120, w: 240, h: 40, place: 'pared', vibes: ['gamer', 'aesthetic', 'y2k'], light: true,
    draw: (p) => {
      const RGB = ['#FF7EB6', '#FFB070', '#FFE27A', '#8EE6A8', '#7FD1FF', '#B79CFF'];
      const colAt = (t) => { const f = t * (RGB.length - 1), i = Math.min(RGB.length - 2, Math.floor(f)); return mix(RGB[i], RGB[i + 1], f - i); };
      let s = '';
      for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6; s += halo(f1(14 + t * 192), 17, 28, 17, colAt(t), 1.6); }
      // cinta, chips y clips
      s += face(rr(4, 13, 206, 8, 4), '#F4F0F8', { w: 1.5 });
      for (let i = 0; i < 17; i++) { const x = 12 + i * 12, c = colAt(i / 16); s += flat(rr(x - 3, 14.6, 6, 4.8, 1.4), c) + flat(rr(x - 1.4, 15.6, 2.8, 2.6, 0.8), mix(c, '#FFFFFF', 0.75)); }
      [42, 102, 162].forEach((x) => { s += face(rr(x - 3, 10.6, 6, 12.2, 1.8), '#DDE3EE', { w: 1.1 }) + flat(rr(x - 1.8, 11.8, 1.2, 9.4, 0.6), '#FFFFFF', { opacity: 0.85 }) + flat(ellD(x + 0.6, 16.8, 1.1, 1.1), '#9AA2B6'); });
      // control con botones y el cable al enchufe
      s += G({ 'data-skip': 'pixel' }, line('M220 24C220 30 226 30 226 36', '#3A3044', 1.8)) + G({ 'data-only': 'pixel' }, tube('M220 24C220 30 226 30 226 36', 2.6, '#3A3044', { w: 0.8 }));
      const box = mix(p.wood, DARK, 0.55);
      s += face(rr(211, 9, 18, 15, 3.4), box, { w: 1.4 }) + flat(rr(213, 10.6, 14, 1.6, 0.8), tone(box, 0.8));
      [['#FF7EB6', 215], ['#8EE6A8', 220], ['#7FD1FF', 225]].forEach(([c, x]) => { s += flat(rr(x - 1.3, 17.6, 2.6, 2.6, 0.8), c); });
      s += flat(ellD(220, 13.8, 1.4, 1.4), '#1A1622');
      s += face(rr(218, 34, 16, 14, 2.6), '#F6F2EC', { w: 1.3 }) + flat(rr(219.6, 35.4, 1.4, 11, 0.7), '#FFFFFF');
      s += face(rr(222.4, 36.4, 7.2, 8, 1.6), '#4A4256', { w: 1.1 }) + flat(ellD(226, 46, 0.9, 0.9), '#B9B2C2');
      return s;
    },
  },
  {
    // Espejo ondulado: marco de resina brillante con su luz arriba a la
    // izquierda, labio interior, vidrio con un reflejo apenas rosado y dos
    // rayas de brillo.
    id: 'espejoOndulado', name: 'Espejo ondulado', cat: 'pared', price: 170, w: 96, h: 150, place: 'pared', vibes: ['aesthetic', 'coquette', 'y2k'],
    draw: (p) => {
      const C = mat(p.cloth);
      const wave = 'M48 6 C66 6 70 20 82 22 C92 26 86 44 90 56 C94 70 84 80 88 96 C92 112 80 120 76 132 C70 144 56 142 48 144 C40 142 26 144 20 132 C16 120 4 112 8 96 C12 80 2 70 6 56 C10 44 4 26 14 22 C26 20 30 6 48 6Z';
      const inner = 'M48 16 C62 16 64 28 74 30 C80 34 76 46 79 56 C82 68 74 78 77 94 C80 108 70 114 67 124 C62 134 54 132 48 134 C42 132 34 134 29 124 C26 114 16 108 19 94 C22 78 14 68 17 56 C20 46 16 34 22 30 C32 28 34 16 48 16Z';
      let s = wallShadow(wave);
      s += face(wave, C.front);
      s += shade(`${wave}M48 12C64 12 66 25 78 27C86 31 82 45 85 56C88 69 79 79 83 95C86 110 75 117 71 128C66 139 55 138 48 139C41 138 30 139 25 128C21 117 10 110 13 95C17 79 8 69 11 56C14 45 10 31 18 27C30 25 32 12 48 12Z`, C.deep, 0.25, { 'fill-rule': 'evenodd' });
      s += line('M14 26C24 22 30 10 48 9.4C60 9.4 66 16 72 20', C.hi, 2, { opacity: 0.8 });
      s += face(inner, '#DDEEF8', { w: 1.6 });
      s += flat('M21 108C28 104 38 105 48 108C58 105 68 104 77 108C76 114 70 118 67 124C62 134 54 132 48 134C42 132 34 134 29 124C26 118 21 114 21 108Z', mix('#DDEEF8', p.cloth, 0.12));
      s += glints(ellPts(48, 70, 26, 54), { at: 0.26, op: 0.6 });
      return s;
    },
  },
  {
    // Flores secas colgando boca abajo de un palito de madera, que cuelga
    // de un clavo con su cordel: lavanda, rositas y espigas, cada ramo
    // atado con una cinta.
    id: 'floresSecas', name: 'Flores secas colgantes', cat: 'pared', price: 110, w: 110, h: 110, place: 'pared', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      const rib = acc(p, '#E8B4C4');
      let s = line('M10 20L55 5L100 20', '#B8A48A', 1.4) + nail(55, 5);
      s += rod(6, 20, 104, 20, 5.4, p.wood);
      s += part(ellD(6, 20, 3.4, 3.4), mat(p.wood).top, { w: 1.2 }) + part(ellD(104, 20, 3.4, 3.4), mat(p.wood).top, { w: 1.2 });
      const stems = (x, len, c = '#8A9A60') => line(`M${x - 1} 24L${x - 6} ${24 + len}M${x} 24V${24 + len + 2}M${x + 1} 24L${x + 6} ${24 + len}`, c, 1.6);
      const tie = (x) => part(`M${x - 4} 26H${x + 4}V31H${x - 4}Z`, rib, { w: 1 }) + part(`M${x} 28.4C${x - 8} 22.6 ${x - 9} 33.4 ${x} 29.6C${x + 9} 33.4 ${x + 8} 22.6 ${x} 28.4Z`, rib, { w: 1.1 }) + line(`M${x - 1} 31L${x - 3.4} 41M${x + 1} 31L${x + 3.6} 40`, rib, 1.6);
      // lavanda: espigas que cuelgan, en abanico
      s += stems(25, 36, '#7E8C66');
      [[18, 66, -8], [22, 72, -4], [26, 74, 0], [30, 72, 4], [34, 66, 8], [26, 64, 0]].forEach(([x, y, k], i) => {
        s += part(`M${x - k * 0.2} ${y - 18}C${x + 3} ${y - 12} ${x + 3} ${y - 2} ${x + k * 0.15} ${y + 6}C${x - 3} ${y - 2} ${x - 3} ${y - 12} ${x - k * 0.2} ${y - 18}Z`, i % 2 ? '#9C86C8' : '#B9A3DE', { w: 1.1 });
        s += flat(`M${x - 1.4} ${y - 10}h1.6v1.6h-1.6ZM${x - 0.4} ${y - 4}h1.6v1.6h-1.6Z`, '#7A62A8', { opacity: 0.8 });
      });
      s += tie(25);
      // rositas secas con hojas
      s += stems(56, 44) + lf(51, 48, 10, 150, 3, '#8A9A60', { vein: false }) + lf(61, 54, 10, 30, 3, '#8A9A60', { vein: false }) + lf(54, 60, 9, 120, 2.8, '#9AAA6E', { vein: false });
      [[48, 78, '#D98A9A'], [64, 78, '#E8B4A8'], [56, 90, '#C97888']].forEach(([x, y, c]) => {
        s += part(`M${x - 4} ${y - 6}L${x} ${y - 9.4}L${x + 4} ${y - 6}Z`, '#8A9A60', { w: 0.9 });
        s += part(ellD(x, y, 6.4, 6.6), c, { w: 1.3 });
        s += line(`M${x - 3} ${y - 1}Q${x} ${y - 4.6} ${x + 3} ${y - 1}Q${x + 2} ${y + 3} ${x - 1} ${y + 2}Q${x - 2} ${y} ${x} ${y - 1}`, tone(c, -1), 1.2);
        s += flat(ellD(x - 2.6, y - 3, 1.6, 1.2), tone(c, 0.8));
      });
      s += tie(56);
      // espigas doradas con hojas largas
      s += stems(87, 30, '#B49A5E');
      s += lf(83, 44, 22, 105, 2.2, '#C9B070', { vein: false }) + lf(91, 44, 20, 75, 2.2, '#C9B070', { vein: false });
      [[81, 58], [87, 63], [93, 58]].forEach(([x, y]) => { for (let k = 0; k < 5; k++) s += part(ellD(x + (k % 2 ? 1.2 : -1.2), y - 2 + k * 4.4, 2.4, 2.8), k % 2 ? '#E2BE72' : '#EFD08E', { w: 0.9 }); });
      s += tie(87);
      return s;
    },
  },
  {
    // Esterilla de yoga en el piso: rectángulo (lo que va al fondo es
    // vertical), canto de grosor, goma con franjas suaves, dos líneas guía
    // y un loto; enrollada a la derecha (la espiral de frente) con su
    // correa y hebilla, y una toalla doblada encima.
    id: 'tapeteYoga', name: 'Tapete de yoga', cat: 'alfombras', price: 90, w: 200, h: 46, place: 'piso', layer: 'suelo', vibes: ['deportiva', 'aesthetic'],
    draw: (p) => {
      const C = mat(p.cloth);
      const lite = mix(p.cloth, '#FFFFFF', 0.55);
      const strap = acc(p, '#8A7FD0');
      let s = Ell(94, 41, 90, 4, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
      // la esterilla
      s += face(rr(8, 36, 168, 3.6, 1.2), C.side, { w: 1.6 });
      s += face(rr(8, 11, 168, 26, 2.4), C.front, { w: 1.8 });
      s += line('M14 18.2H170M14 22.6H170M14 27H170M14 31.4H170', C.side, 1.2, { opacity: 0.22 });
      s += line('M12 14.4H172M12 33.6H172', lite, 1.4, { opacity: 0.9 });
      s += line('M12 12.4H172', C.hi, 1.3, { opacity: 0.7 });
      // loto
      s += flat('M30 28C26.6 25 26.6 20 30 17.4C33.4 20 33.4 25 30 28Z', lite);
      s += flat('M30 28C24.6 28.4 20.4 25.6 19.4 21.6C24 21.4 28 24 30 28ZM30 28C35.4 28.4 39.6 25.6 40.6 21.6C36 21.4 32 24 30 28Z', mix(lite, p.cloth, 0.25));
      s += flat(rr(22, 28.4, 16, 1.6, 0.8), lite);
      // toalla doblada, con su sombrita
      const T = '#FFFDF8';
      s += contact(72, 31, 18, 0.22);
      s += face(rrTop(56, 16, 32, 12, 2.6), T, { w: 1.4 });
      s += face(rr(56, 27, 32, 4.2, 1.4), tone(T, -0.6), { w: 1.3 });
      s += flat('M60 16.8h3v10.6h-3ZM80.6 16.8h3v10.6h-3Z', p.cloth) + flat('M60 27.6h3v3h-3ZM80.6 27.6h3v3h-3Z', tone(p.cloth, -0.5));
      s += line('M58.6 21.6H85.4', tone(T, -0.8), 1.1, { opacity: 0.45 });
      // el rollo con su correa
      s += face('M172 6H196V30A12 12 0 0 1 172 30Z', C.top);
      s += flat(rr(175, 8, 3, 20, 1.5), C.hi, { opacity: 0.85 });
      s += face(ellD(184, 30, 12, 12), C.front, { w: 1.6 });
      s += line('M184 30m-1.6 0a1.6 1.6 0 1 1 3.2 0a4 4 0 1 1 -8 0a6.6 6.6 0 1 1 13.2 0a9.4 9.4 0 1 1 -18.8 0', C.side, 1.3);
      s += face(rr(170.4, 15, 27.2, 4.6, 1.4), strap, { w: 1.3 });
      s += line('M197.2 17.4Q199.6 22 198 28', strap, 2.2);
      s += face(rr(176, 13.8, 5.6, 7, 1.2), BRASS, { w: 1.1 }) + flat(rr(177.6, 15.6, 2.4, 3.4, 0.6), strap);
      return s;
    },
  },
  {
    // Alfombra de cuadros: rectángulo en el piso con cuadros que se
    // aplastan a lo hondo (el doble de anchos que de altos), ribete, canto
    // de grosor y flecos en los lados cortos.
    id: 'alfombraCuadros', name: 'Alfombra de cuadros', cat: 'alfombras', price: 140, w: 220, h: 60, place: 'piso', layer: 'suelo', vibes: ['aesthetic', 'y2k'],
    draw: (p) => {
      const C = mat(p.cloth);
      const lite = mix(p.cloth, '#FFFFFF', 0.72);
      let s = '';
      for (let y = 9; y <= 51; y += 5) s += line(`M8 ${y}H18M202 ${y}H212`, '#EFE4D2', 1.8);
      s += face(rr(16, 51, 188, 4, 1.2), C.side, { w: 1.6 });
      s += face(rr(16, 5, 188, 47, 2), C.front, { w: 1.8 });
      s += flat(rr(21, 8.5, 178, 40, 1), lite);
      const cw = 178 / 8, ch = 40 / 4;
      let d = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 0) d += `M${f1(21 + c * cw)} ${f1(8.5 + r * ch)}h${f1(cw)}v${f1(ch)}h${f1(-cw)}Z`;
      s += flat(d, tone(p.cloth, 0.15));
      s += line('M20 7.2H200', C.hi, 1.4, { opacity: 0.7 });
      return s;
    },
  },
  {
    // Alfombra de fresa: la fruta acostada en el piso (aplastada a lo
    // hondo), con su canto de grosor, semillas en filas, brillo arriba a la
    // izquierda y el cáliz de hojas atrás.
    id: 'alfombraFresa', name: 'Alfombra de fresa', cat: 'alfombras', price: 150, w: 170, h: 74, place: 'piso', layer: 'suelo', vibes: ['kawaii', 'cottagecore'],
    draw: (p) => {
      // siempre una fresa: la tela la tiñe, pero no la vuelve azul
      const C = mat(mix(p.cloth, '#F0607A', 0.65));
      const berry = (dy) => `M85 ${70 + dy}C44 ${70 + dy} 10 ${54 + dy} 13 ${34 + dy}C16 ${16 + dy} 48 ${12 + dy} 85 ${18 + dy}C122 ${12 + dy} 154 ${16 + dy} 157 ${34 + dy}C160 ${54 + dy} 126 ${70 + dy} 85 ${70 + dy}Z`;
      let s = Ell(85, 66, 76, 6, { fill: '#2A1C24', opacity: 0.14, 'data-r': 'tone' });
      s += face(berry(3), C.side, { w: 1.8 });
      s += face(berry(0), C.front, { w: 1.8 });
      s += flat('M24 30C30 21 46 18 62 20C48 22 36 26 30 34Z', C.hi, { opacity: 0.85 });
      [[46, 32], [70, 30], [100, 30], [124, 32], [34, 44], [58, 44], [85, 43], [112, 44], [136, 44], [48, 56], [72, 57], [98, 57], [122, 56], [85, 64]].forEach(([x, y]) => { s += flat(`M${x} ${y - 2.6}C${x + 2.2} ${y - 1} ${x + 2} ${y + 2} ${x} ${y + 2.4}C${x - 2} ${y + 2} ${x - 2.2} ${y - 1} ${x} ${y - 2.6}Z`, '#FFE29A'); });
      s += part('M58 20C62 10 72 9 78 14C80 6 90 6 92 14C98 9 108 10 112 20C104 25 94 21 85 24C76 21 66 25 58 20Z', '#6CBF6A', { w: 1.6 });
      s += flat('M66 17C70 13 74 13 78 15C76 17 72 18 68 19Z', '#9AD89A');
      s += part('M83 13C82 8 84 4 87 3L89 5C87 7 86 9 87 13Z', '#4E9A52', { w: 1.2 });
      return s;
    },
  },
];
