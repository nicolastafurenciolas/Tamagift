// Decoración de Navidad (del 1 de diciembre a Reyes, ver seasons.js).
// Como la de Halloween: tierna, con la misma vista 3/4 que todo el cuarto.
// `giftOnly`: no se vende; llega de regalo (la esfera de nieve, el 24).
// Lo que cuelga tiene de dónde (clavito, chinchetas, ganchitos) y lo que
// se apoya, su sombra. Los resplandores solo en lofi y neón.

import { face, part, flat, line, shade, shine, rr, ellD, tone, box, tube, Cir, Ell, INK } from './draw.js';

const SH = '#2A1C24';
const f1 = (n) => +n.toFixed(1);
const surf = (cx, y, rx) => Ell(cx, y, rx, rx * 0.2, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
const floorSh = (cx, y, rx, ry = rx * 0.16) => Ell(cx, y, rx, ry, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
const contact = (cx, y, rx, ry = rx * 0.22) => Ell(cx, y, rx, ry, { fill: SH, opacity: 0.2, 'data-r': 'tone' });
// resplandor en tres escalones (sin borde duro): solo lofi y neón
const glow = (cx, cy, rx, ry, c, op = 0.32) => [1, 0.74, 0.48].map((k) => Ell(cx, cy, rx * k, ry * k, { fill: c, opacity: f1(op * 0.42), 'data-r': 'tone', 'data-only': 'lofi neon' })).join('');
// en neón lo encendido es blanco caliente (sus rellenos se apagan)
const hot = (d) => shine(d, { 'data-only': 'neon' });
const star = (x, y, r, k = 0.5) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r2 = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * r2)} ${f1(y + Math.sin(a) * r2)}`; } return `${d}Z`; };
const ball = (x, y, r, c) => part(ellD(x, y, r, r), c, { w: 1.3 }) + Cir(x - r * 0.35, y - r * 0.38, r * 0.32, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'shine' });

const RED = '#D9364F', RED_D = '#A8283C', GREEN = '#2F7A4E', GREEN_M = '#3E9461', GREEN_L = '#56AE78';
const GOLD = '#FFD45C', SNOW = '#F6F9FF', SNOW_SH = '#D6E2F2', BLUSH = '#FFB6CC', BROWN = '#A9744F', CORD = '#8C7A70';

// Chincheta / clavito de donde se cuelga algo.
const tack = (x, y, c = '#E0475E') => part(ellD(x, y, 3.6, 3.4), c, { w: 1.4 }) + Cir(x - 1.1, y - 1.1, 1.1, { fill: '#FFFFFF', 'data-r': 'shine' });

// Cordel colgado entre (x0, y0) y (x1, y0) que baja `sag` en el medio.
function sagging(x0, x1, y0, sag) {
  const cx = (x0 + x1) / 2, cy = y0 + sag * 2;
  const at = (x) => { const t = (x - x0) / (x1 - x0); return [y0 + sag * 4 * t * (1 - t), (sag * 4 * (1 - 2 * t)) / (x1 - x0)]; };
  return { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y0}`, at };
}

// Moño de cinta con centro en (x, y): dos lazos, dos colas y el nudo.
const bow = (x, y, s, c) => part(`M${x - 2 * s} ${y + 1} L${x - 7 * s} ${y + 11 * s} L${x - 4.4 * s} ${y + 9.6 * s} L${x - 3 * s} ${y + 12 * s} L${x} ${y + 1.6}Z M${x + 2 * s} ${y + 1} L${x + 7 * s} ${y + 11 * s} L${x + 4.4 * s} ${y + 9.6 * s} L${x + 3 * s} ${y + 12 * s} L${x} ${y + 1.6}Z`, tone(c, -0.5), { w: 1.2 })
  + part(`M${x} ${y} C${x - 6 * s} ${y - 8 * s} ${x - 15 * s} ${y - 7 * s} ${x - 14 * s} ${y} C${x - 13 * s} ${y + 6 * s} ${x - 5 * s} ${y + 4 * s} ${x} ${y}Z M${x} ${y} C${x + 6 * s} ${y - 8 * s} ${x + 15 * s} ${y - 7 * s} ${x + 14 * s} ${y} C${x + 13 * s} ${y + 6 * s} ${x + 5 * s} ${y + 4 * s} ${x} ${y}Z`, c, { w: 1.4 })
  + flat(`M${x - 3 * s} ${y - 0.6 * s} C${x - 6 * s} ${y - 4 * s} ${x - 10 * s} ${y - 4.4 * s} ${x - 11.4 * s} ${y - 1.6 * s} C${x - 8 * s} ${y - 3 * s} ${x - 5.6 * s} ${y - 2 * s} ${x - 3 * s} ${y - 0.6 * s}Z M${x + 3 * s} ${y - 0.6 * s} C${x + 6 * s} ${y - 4 * s} ${x + 10 * s} ${y - 4.4 * s} ${x + 11.4 * s} ${y - 1.6 * s} C${x + 8 * s} ${y - 3 * s} ${x + 5.6 * s} ${y - 2 * s} ${x + 3 * s} ${y - 0.6 * s}Z`, tone(c, -0.55))
  + part(ellD(x, y, 3 * s, 3.2 * s), tone(c, 0.3), { w: 1.2 });

// Un piso del arbolito: vértice arriba, ramas que caen en festón abajo.
// `shadowY`: hasta dónde llega la sombra del piso de arriba.
function tier(cx, top, bot, hw, c, shadowY) {
  const n = Math.max(3, Math.round((hw * 2) / 13));
  const step = (hw * 2) / n;
  let edge = '';
  for (let i = 0; i < n; i++) {
    const x0 = cx - hw + i * step, x1 = x0 + step;
    edge += ` Q${f1(x0 + step / 2)} ${f1(bot + 6.5)} ${f1(x1)} ${f1(bot)}`;
  }
  let s = part(`M${cx} ${top} L${f1(cx - hw)} ${bot}${edge} L${cx} ${top}Z`, c, { w: 2 });
  // la luz entra por la izquierda
  s += flat(`M${cx} ${top + 3} L${f1(cx - hw + 4)} ${f1(bot - 1)} Q${f1(cx - hw + step / 2 + 2)} ${f1(bot + 4)} ${f1(cx - hw + step + 2)} ${f1(bot)} L${f1(cx - hw * 0.25)} ${f1(top + (bot - top) * 0.35)}Z`, tone(c, 0.55));
  // sombra que deja el piso de arriba
  if (shadowY) {
    const t = (shadowY - top) / (bot - top), w = hw * t - 1.5;
    const m = Math.max(2, Math.round((w * 2) / 12)), st = (w * 2) / m;
    let d = `M${cx} ${top + 1} L${f1(cx - w)} ${f1(shadowY)}`;
    for (let i = 0; i < m; i++) d += ` Q${f1(cx - w + i * st + st / 2)} ${f1(shadowY + 5)} ${f1(cx - w + (i + 1) * st)} ${f1(shadowY)}`;
    s += flat(`${d}Z`, tone(c, -0.7));
  }
  return s;
}

// Hoja de acebo con pinchos, desde (x, y) hacia `ang` grados.
function holly(x, y, ang, len, c = '#25633F') {
  const a = (ang * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v) => `${f1(x + u * ca - v * sa)} ${f1(y + u * sa + v * ca)}`;
  const L = len;
  return part(`M${P(0, 0)} Q${P(L * 0.12, -3.2)} ${P(L * 0.25, -4.6)} Q${P(L * 0.36, -2.6)} ${P(L * 0.5, -4.8)} Q${P(L * 0.62, -2.8)} ${P(L * 0.76, -4)} Q${P(L * 0.86, -1.6)} ${P(L, 0)} Q${P(L * 0.86, 1.6)} ${P(L * 0.76, 4)} Q${P(L * 0.62, 2.8)} ${P(L * 0.5, 4.8)} Q${P(L * 0.36, 2.6)} ${P(L * 0.25, 4.6)} Q${P(L * 0.12, 3.2)} ${P(0, 0)}Z`, c, { w: 1.2 })
    + line(`M${P(1, 0)} L${P(L * 0.86, 0)}`, tone(c, 0.9), 1, { opacity: 0.8 });
}
// Aro de pino con el borde mullido (festones hacia afuera y hacia adentro).
function fluffyRing(cx, cy, R, r, nO, nI, bo, bi) {
  const ring = (rad, n, bump, dir) => {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = dir * (i / n) * Math.PI * 2, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      if (!i) { d += `M${f1(x)} ${f1(y)}`; continue; }
      const am = dir * ((i - 0.5) / n) * Math.PI * 2;
      d += ` Q${f1(cx + Math.cos(am) * (rad + bump))} ${f1(cy + Math.sin(am) * (rad + bump))} ${f1(x)} ${f1(y)}`;
    }
    return `${d}Z`;
  };
  return `${ring(R, nO, bo, 1)} ${ring(r, nI, -bi, -1)}`;
}
// Mata redonda y mullida (las partes claras de la corona).
function fluffyBlob(cx, cy, rx, ry, b) {
  let d = '';
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    if (!i) { d += `M${f1(x)} ${f1(y)}`; continue; }
    const am = ((i - 0.5) / n) * Math.PI * 2;
    d += ` Q${f1(cx + Math.cos(am) * (rx + b))} ${f1(cy + Math.sin(am) * (ry + b))} ${f1(x)} ${f1(y)}`;
  }
  return `${d}Z`;
}
const berries = (x, y, r = 2.6) => ball(x - r * 0.9, y + r * 0.3, r, RED) + ball(x + r * 0.9, y + r * 0.4, r, RED) + ball(x, y - r * 0.8, r, '#E8485E');

export const DECOR_NAVIDAD = [
  {
    id: 'arbolNavidad', name: 'Arbolito de Navidad', price: 160, w: 124, h: 178, place: 'piso', season: 'navidad',
    draw: () => {
      let s = glow(62, 96, 60, 74, '#FFF0B0', 0.3) + floorSh(62, 175, 50, 6.5) + contact(62, 174, 26);
      // tronco y macetero de lata roja con banda dorada
      s += face(rr(55, 140, 14, 20, 2), '#8A5A3C', { w: 1.8 });
      s += face('M40 156 L84 156 L80.5 174 Q62 177 43.5 174Z', RED, { w: 1.9 }) + face(rr(37, 151, 50, 8, 3), tone(RED, 0.5), { w: 1.8 });
      s += flat('M41.4 162 L82.6 162 L81.6 166.6 L42.4 166.6Z', GOLD) + shine('M44 158 L48 158 L46.4 172 L44.6 171Z', { opacity: 0.4 });
      // cuatro pisos de ramas, de abajo hacia arriba
      s += tier(62, 98, 146, 52, GREEN, 120);
      s += tier(62, 70, 118, 42, tone(GREEN, 0.25), 92);
      s += tier(62, 44, 90, 32, GREEN_M, 64);
      s += tier(62, 22, 62, 21, GREEN_L);
      // guirnaldas de cuentas doradas
      s += line('M30 132 Q60 146 96 128 M36 102 Q62 114 88 100 M44 76 Q62 85 79 74', GOLD, 2.4);
      s += line('M30 132 Q60 146 96 128 M36 102 Q62 114 88 100 M44 76 Q62 85 79 74', '#FFF3B0', 0.9, { 'stroke-dasharray': '1.5 3.5', 'data-skip': 'pixel' });
      // bolitas, unas más grandes que otras
      [[22, 146, 5, RED], [46, 141, 4.6, '#7FA9DE'], [76, 140, 5, GOLD], [102, 147, 5, '#C9A6FF'], [58, 124, 4.4, RED], [86, 116, 4.6, '#7FA9DE'], [34, 116, 4.2, GOLD],
        [50, 96, 4.2, '#C9A6FF'], [74, 92, 4.4, RED], [62, 70, 3.8, '#7FA9DE'], [44, 84, 3.6, RED], [80, 82, 3.6, GOLD]].forEach(([x, y, r, c]) => {
        s += flat(rr(x - 1.4, y - r - 1.6, 2.8, 2.2, 0.6), '#C9A040') + ball(x, y, r, c);
      });
      // lucecitas
      [[52, 56, '#FFF3A8'], [70, 50, '#FFB6CC'], [40, 108, '#B8E8FF'], [66, 104, '#FFF3A8'], [92, 136, '#FFB6CC'], [28, 138, '#FFF3A8'], [68, 132, '#B8E8FF'], [56, 80, '#FFB6CC']].forEach(([x, y, c]) => {
        s += glow(x, y, 6, 6, c, 0.7) + part(ellD(x, y, 2.2, 2.4), c, { w: 1 }) + hot(ellD(x, y, 1, 1.1));
      });
      // la estrella de la punta
      s += glow(62, 20, 18, 18, '#FFE89A', 0.6);
      s += part(star(62, 20, 12.5), GOLD, { w: 1.7 }) + flat(star(62, 20.4, 6.4), '#FFE99A') + Cir(58.6, 16.4, 1.8, { fill: '#FFFFFF', 'data-r': 'shine' });
      // un regalito al pie
      s += box(86, 176, 22, 14, 10, '#7FA9DE', { r: 2 }) + flat('M95 162 h4 v14 h-4Z', SNOW) + flat('M95 157 h4 v5 h-4Z', tone(SNOW, -0.3));
      s += bow(97, 157, 0.55, SNOW);
      return s;
    },
  },
  {
    id: 'coronaNavidad', name: 'Corona navideña', price: 70, w: 80, h: 86, place: 'sobre', season: 'navidad',
    draw: () => {
      const cx = 40, cy = 46;
      const rad = (d) => (d * Math.PI) / 180;
      // borde de agujas: zigzag con puntas desparejas alrededor de un círculo
      const fringe = (n, rv, rt, off, dir) => {
        let d = '';
        for (let i = 0; i <= n; i++) {
          const a = dir * rad(off + (i * 360) / n), am = dir * rad(off + ((i + 0.5) * 360) / n);
          const v = `${f1(cx + Math.cos(a) * rv)} ${f1(cy + Math.sin(a) * rv)}`;
          d += i ? `L${v}` : `M${v}`;
          if (i < n) { const k = [0, 1.7, 0.5, 2.3, 0.9][i % 5] * (rt > rv ? 1 : -0.55), aj = am + dir * rad([0, 2.2, -1.6, 1, -2.4][i % 5]); d += `L${f1(cx + Math.cos(aj) * (rt + k))} ${f1(cy + Math.sin(aj) * (rt + k))}`; }
        }
        return `${d}Z`;
      };
      // la cinta que la cuelga del clavito
      let s = part('M36.4 4 L43.6 4 L44.6 22 L35.4 22Z', RED, { w: 1.4 }) + flat('M40 4.6 L43.4 4.6 L44 21 L40.4 21Z', tone(RED, -0.6));
      s += part(ellD(40, 5, 2.8, 2.6), '#C8C0D0', { w: 1.2 }) + Cir(39.2, 4.2, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
      // la silueta: un solo aro con agujas que asoman por afuera y por adentro
      // (redondo y frondoso, no un polígono; en papel queda una sola cartulina)
      s += part(`${fringe(26, 23.4, 28, 0, 1)} ${fringe(14, 15.2, 11.6, 10, -1)}`, GREEN, { w: 1.7, a: { 'fill-rule': 'evenodd' } });
      // el cuerpo del aro, más claro, tapando el nacimiento de las agujas
      s += part(`${ellD(cx, cy, 24, 24)} ${ellD(cx, cy, 14.6, 14.6)}`, GREEN_M, { w: 1.4, a: { 'fill-rule': 'evenodd' } });
      s += shade(`${ellD(cx + 1.6, cy + 2, 23.2, 23.2)} ${ellD(cx - 1.4, cy - 1.6, 22.4, 22.4)}`, '#1E4A30', 0.45, { 'fill-rule': 'evenodd' });
      // ramitas claras y oscuras encima (en papel serían confeti: no van)
      let lt = '', dk = '';
      for (let i = 0; i < 18; i++) {
        const a = rad(i * 20 + 6), r = i % 2 ? 21 : 17.6, b = a + rad(75);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, ux = Math.cos(b) * 3.4, uy = Math.sin(b) * 3.4;
        const d = `M${f1(x - ux - uy * 0.4)} ${f1(y - uy + ux * 0.4)} L${f1(x + ux)} ${f1(y + uy)} L${f1(x - ux + uy * 0.4)} ${f1(y - uy - ux * 0.4)}Z `;
        if (Math.sin(a) < 0.35 && Math.cos(a) < 0.5) lt += d; else dk += d;
      }
      s += flat(lt, GREEN_L, { 'data-skip': 'papel' }) + flat(dk, tone(GREEN_M, -0.45), { 'data-skip': 'papel' });
      // acebo con racimos de bolitas, una piña y el moño
      s += holly(26, 22, 200, 12) + holly(27, 23, 250, 11, '#3A8556') + berries(28, 24);
      s += holly(66, 46, -20, 11) + holly(66, 47, 30, 11, '#3A8556') + berries(64, 46.4);
      s += part('M17 52 C13 56 13 63 17 66 C21 63 22 57 17 52Z', '#9A6B48', { w: 1.3 }) + line('M14.4 57 L19.6 58 M14 61 L20 62', '#6E4A30', 1.1);
      s += bow(40, 74, 1.15, RED);
      return s;
    },
  },
  {
    id: 'botasNavidad', name: 'Botas colgadas', price: 75, w: 120, h: 86, place: 'sobre', season: 'navidad',
    draw: () => {
      const str = sagging(6, 114, 8, 5);
      let s = '';
      // bota tejida: puño de peluche, pierna, talón y punta de otro color
      const boot = (bx, c, heel, deco) => {
        const [y0] = str.at(bx + 9);
        const by = y0 + 6;
        let b = line(`M${bx + 9} ${f1(y0)} V${f1(by + 2)}`, CORD, 1.3) + part(`M${bx + 6} ${f1(by + 3)} Q${bx + 9} ${f1(by - 4)} ${bx + 12} ${f1(by + 3)}`, '#F2E8DA', { w: 1.2, a: { fill: 'none' } });
        const leg = `M${bx} ${by + 8} L${bx + 18} ${by + 8} L${bx + 18} ${by + 34} C${bx + 18} ${by + 37} ${bx + 21} ${by + 38} ${bx + 25} ${by + 38.4} Q${bx + 31} ${by + 39} ${bx + 31} ${by + 45} Q${bx + 31} ${by + 51} ${bx + 24} ${by + 51} L${bx + 8} ${by + 51} Q${bx} ${by + 51} ${bx} ${by + 43}Z`;
        b += part(leg, c, { w: 1.8 });
        if (deco === 'rayas') b += flat(`M${bx + 0.8} ${by + 16} h16.4 v4 h-16.4Z M${bx + 0.8} ${by + 25} h16.4 v4 h-16.4Z`, SNOW);
        if (deco === 'lunares') [[5, 16], [13, 19], [6, 26], [14, 29], [9, 36]].forEach(([dx, dy]) => { b += Cir(bx + dx, by + dy, 1.8, { fill: SNOW, 'data-r': 'flat' }); });
        if (deco === 'estrella') b += flat(star(bx + 9, by + 24, 5.4), GOLD);
        b += flat(`M${bx + 0.9} ${by + 41} Q${bx + 0.9} ${by + 50.1} ${bx + 8} ${by + 50.1} L${bx + 11} ${by + 50.1} Q${bx + 11} ${by + 44} ${bx + 4} ${by + 40}Z`, heel);
        b += flat(`M${bx + 26} ${by + 38.8} Q${bx + 30.1} ${by + 39.6} ${bx + 30.1} ${by + 45} Q${bx + 30.1} ${by + 50.1} ${bx + 24} ${by + 50.1} L${bx + 22} ${by + 50.1} Q${bx + 24.6} ${by + 44} ${bx + 26} ${by + 38.8}Z`, heel);
        b += shade(`M${bx + 13} ${by + 9} L${bx + 17.2} ${by + 9} L${bx + 17.2} ${by + 34} L${bx + 13} ${by + 36}Z`, tone(c, -1.2), 0.35);
        // puño esponjoso
        b += part(`M${bx - 2.6} ${by + 2} Q${bx - 3} ${by - 1} ${bx} ${by - 0.6} L${bx + 18} ${by - 0.6} Q${bx + 21} ${by - 1} ${bx + 20.6} ${by + 2} L${bx + 20.6} ${by + 8} Q${bx + 19} ${by + 11} ${bx + 16.4} ${by + 9.6} Q${bx + 14} ${by + 11.6} ${bx + 11.4} ${by + 9.8} Q${bx + 9} ${by + 11.8} ${bx + 6.6} ${by + 9.8} Q${bx + 4} ${by + 11.6} ${bx + 1.6} ${by + 9.6} Q${bx - 1.4} ${by + 11} ${bx - 2.6} ${by + 8}Z`, SNOW, { w: 1.6 });
        b += shade(`M${bx + 14} ${by + 0.4} L${bx + 19.6} ${by + 0.4} L${bx + 19.6} ${by + 7.6} Q${bx + 18} ${by + 9.6} ${bx + 15.6} ${by + 8.6}Z`, SNOW_SH, 0.8);
        return b;
      };
      // un bastón de caramelo asoma de la primera; un osito de la última
      const [yc] = str.at(21);
      s += tube(`M21 ${f1(yc + 10)} V${f1(yc - 6)} Q21 ${f1(yc - 11)} 25.5 ${f1(yc - 11)} Q30 ${f1(yc - 11)} 30 ${f1(yc - 6.5)}`, 3.6, '#FFFFFF');
      s += line(`M19.6 ${f1(yc - 1)} L22.4 ${f1(yc - 3)} M19.6 ${f1(yc - 6)} L22.4 ${f1(yc - 8)} M24.4 ${f1(yc - 10.8)} L26.4 ${f1(yc - 12.4)} M28.6 ${f1(yc - 9.4)} L31.4 ${f1(yc - 8.6)}`, RED, 1.6);
      const [yo] = str.at(93);
      s += part(ellD(93, yo + 2, 6.6, 6), BROWN, { w: 1.4 }) + part(ellD(88, yo - 3, 2.6, 2.6), BROWN, { w: 1.2 }) + part(ellD(98, yo - 3, 2.6, 2.6), BROWN, { w: 1.2 });
      s += part(ellD(93, yo + 4.4, 2.8, 2), '#F2D9BC', { w: 1 }) + Cir(90.6, yo + 1, 0.9, { fill: INK, 'data-r': 'flat' }) + Cir(95.4, yo + 1, 0.9, { fill: INK, 'data-r': 'flat' });
      s += boot(12, RED, GREEN_M, 'rayas') + boot(48, GREEN_M, RED, 'estrella') + boot(84, '#F4ECE0', RED, 'lunares');
      s += line(str.d, CORD, 1.6);
      s += tack(6, 8, GOLD) + tack(114, 8, GOLD);
      return s;
    },
  },
  {
    id: 'lucesNavidad', name: 'Luces de Navidad', price: 50, w: 154, h: 44, place: 'sobre', season: 'navidad',
    draw: () => {
      const CABLE = '#3E6A4E';
      const A = sagging(7, 77, 8, 10), B = sagging(77, 147, 8, 10);
      let s = line(`${A.d} ${B.d}`, CABLE, 1.8);
      const cols = [RED, GOLD, '#7FC8F8', '#FF8FC8', '#8ED07A'];
      [[A, 7, 77], [B, 77, 147]].forEach(([S, x0, x1], k) => {
        for (let i = 0; i < 5; i++) {
          const x = x0 + ((i + 0.5) / 5) * (x1 - x0);
          const [y, sl] = S.at(x);
          const c = cols[(i + k * 2) % 5];
          const rot = f1((Math.atan(sl) * 180) / Math.PI * 0.6 + (i % 2 ? 6 : -6));
          let b = glow(x, y + 11, 8, 8, c, 0.6);
          b += face(rr(x - 2.6, y + 0.6, 5.2, 5, 1.2), '#2E5A3E', { w: 1.1 });
          b += part(`M${x} ${y + 4.6} C${x - 5.2} ${y + 7} ${x - 5} ${y + 14} ${x} ${y + 17.4} C${x + 5} ${y + 14} ${x + 5.2} ${y + 7} ${x} ${y + 4.6}Z`, c, { w: 1.3 });
          b += Cir(x - 1.6, y + 9, 1.2, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' }) + hot(`M${x} ${y + 8} C${x - 2} ${y + 10} ${x - 2} ${y + 13} ${x} ${y + 14.6} C${x + 2} ${y + 13} ${x + 2} ${y + 10} ${x} ${y + 8}Z`);
          s += `<g transform="rotate(${rot} ${f1(x)} ${f1(y)})">${b}</g>`;
        }
      });
      s += tack(7, 8, '#7FA98A') + tack(77, 8, '#7FA98A') + tack(147, 8, '#7FA98A');
      return s;
    },
  },
  {
    id: 'munecoNieve', name: 'Muñeco de nieve de peluche', price: 90, w: 84, h: 110, place: 'piso', season: 'navidad',
    draw: () => {
      let s = floorSh(42, 107, 33, 5.5) + contact(42, 105.6, 24);
      // bracitos de ramita con mitones
      s += tube('M16 66 L5 56', 3, '#8A5A3C') + tube('M9 59.6 L5.4 62.6', 2.2, '#8A5A3C');
      s += tube('M68 66 L79 54', 3, '#8A5A3C') + tube('M75 58.4 L80 60', 2.2, '#8A5A3C');
      const mitten = (x, y, sx) => part(`M${x} ${y} C${x - 4.6 * sx} ${y - 1} ${x - 6 * sx} ${y - 7} ${x - 3 * sx} ${y - 10} C${x - 0.4 * sx} ${y - 12.4} ${x + 3.6 * sx} ${y - 11} ${x + 4.4 * sx} ${y - 7.6} L${x + 6.4 * sx} ${y - 8.6} C${x + 8.4 * sx} ${y - 8.6} ${x + 8.4 * sx} ${y - 5.6} ${x + 6 * sx} ${y - 4} C${x + 5 * sx} ${y - 1} ${x + 3 * sx} ${y + 0.4} ${x} ${y}Z`, RED, { w: 1.3 })
        + part(`M${x - 2.4 * sx} ${y - 1.4} L${x + 3.6 * sx} ${y - 0.6} L${x + 3.2 * sx} ${y + 2.6} L${x - 2.8 * sx} ${y + 1.8}Z`, SNOW, { w: 1.1 });
      s += mitten(6, 56, 1) + mitten(78, 54, -1);
      // las dos bolas de nieve
      s += part(ellD(42, 82, 29, 24), SNOW, { w: 2 });
      s += shade('M58 62 C70 70 72 92 60 104 C66 92 66 74 54 64Z', SNOW_SH, 0.9);
      s += shade('M18 96 Q42 110 66 96 Q60 105 42 106 Q24 105 18 96Z', SNOW_SH, 0.7);
      s += part(ellD(42, 43, 22, 20), SNOW, { w: 2 });
      s += shade('M54 27 C64 35 64 53 54 61 C58 51 58 37 50 29Z', SNOW_SH, 0.9);
      s += shine('M27 36 C28 30 32 26 37 24.6 C33 28 31 32 30.6 37Z', { opacity: 0.9 });
      // botones de carbón
      [[42, 76, 2.8], [42, 86, 2.6], [42, 96, 2.4]].forEach(([x, y, r]) => { s += part(ellD(x, y, r, r), '#4A4054', { w: 1 }) + Cir(x - 0.8, y - 0.9, 0.7, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'shine' }); });
      // carita
      s += Ell(34, 40, 2.8, 3.4, { fill: INK, 'data-r': 'flat' }) + Ell(50, 40, 2.8, 3.4, { fill: INK, 'data-r': 'flat' }) + Cir(35, 38.6, 1, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(51, 38.6, 1, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += part('M41 44.4 L55 47.4 Q55.6 48.6 54.6 49 L41 50.2Z', '#F28C38', { w: 1.3 }) + line('M45 45.6 L45.6 49.4 M49 46.4 L49.4 49.2', '#C4621E', 1);
      s += line('M37 53 Q42 56.4 47 53', INK, 1.5);
      s += Ell(28.6, 48, 3.6, 2.2, { fill: BLUSH, 'data-r': 'flat' }) + Ell(55.4, 48, 3.6, 2.2, { fill: BLUSH, 'data-r': 'flat' });
      // bufanda a rayas con flecos
      s += part('M51 62 L58.6 84 L50.6 85.4 L45.6 64Z', RED, { w: 1.5 }) + flat('M52.4 70 L55.8 69.4 L57.2 73.6 L53.8 74.4Z', SNOW);
      s += line('M51.6 85.6 L51.2 89.4 M54.4 85.2 L54.4 89 M57.4 84.6 L57.8 88.4', RED_D, 1.4);
      s += part('M20 59 Q42 68 64 59 L64 66.6 Q42 75.6 20 66.6Z', RED, { w: 1.6 });
      s += flat('M29 62.6 L33 63.6 L33 71.4 L29 70.2Z M41 64.4 L45 64.4 L45 72.4 L41 72.4Z M53 63.6 L57 62.6 L57 70.2 L53 71.4Z', SNOW);
      // gorro de lana con doblez y pompón
      s += part('M22 31 C21 13 63 13 62 31Z', GREEN_M, { w: 1.8 });
      s += line('M30 30 L31 19 M37 30 L37.4 16.6 M44 30 L44 16.4 M51 30 L50.6 17.6', tone(GREEN_M, -0.6), 1.1, { opacity: 0.7 });
      s += part(rr(19, 27, 46, 9, 4.5), SNOW, { w: 1.6 }) + line('M24 29.6 V33.6 M29 29.6 V33.6 M34 29.6 V33.6 M39 29.6 V33.6 M44 29.6 V33.6 M49 29.6 V33.6 M54 29.6 V33.6 M59 29.6 V33.6', SNOW_SH, 1.2);
      s += part(ellD(42, 11, 6, 5.6), SNOW, { w: 1.4 }) + shade('M44 7 C48 9 48 14 44 16 C46 13 46 10 44 7Z', SNOW_SH, 0.9);
      return s;
    },
  },
  {
    id: 'regalosApilados', name: 'Regalos apilados', price: 95, w: 114, h: 90, place: 'piso', season: 'navidad',
    draw: () => {
      let s = floorSh(57, 87.5, 54, 6.5) + contact(34, 86.4, 30) + contact(84, 86.6, 24);
      // la caja roja grande, con tapa y lunares
      s += box(8, 86, 52, 34, 22, RED, { r: 2 });
      [[15, 60], [25, 72], [15, 80], [49, 62], [53, 76], [43, 82]].forEach(([x, y]) => { s += Cir(x, y, 2.2, { fill: '#FFE0E4', 'data-r': 'flat' }); });
      s += flat('M31 52 h6 v34 h-6Z', GOLD) + flat('M31 41 h6 v11 h-6Z', tone(GOLD, 0.5));
      s += box(5, 54, 58, 9, 24, tone(RED, 0.15), { r: 2 }) + flat('M31 45 h6 v9 h-6Z', GOLD) + flat('M6 37.8 h56 v2.6 h-56Z M31 33 h6 v12 h-6Z', tone(GOLD, 0.5));
      // la verde a rayas, a la derecha
      s += box(60, 87, 46, 28, 22, GREEN_M, { r: 2 });
      [[66], [76], [96]].forEach(([x]) => { s += flat(`M${x} 62 h4 v25 h-4Z`, tone(GREEN_M, 0.45)); });
      s += flat('M84 62 h6 v25 h-6Z', RED) + flat('M84 49 h6 v11 h-6Z', tone(RED, 0.5));
      s += box(58, 62, 50, 8, 24, tone(GREEN_M, 0.15), { r: 2 }) + flat('M84 54 h6 v8 h-6Z', RED) + flat('M59 47.6 h48 v2.6 h-48Z M84 42 h6 v12 h-6Z', tone(RED, 0.5));
      s += bow(87, 50, 0.85, RED);
      // etiqueta colgada del moño
      s += line('M92 52 Q96 56 97.6 60', CORD, 1) + part('M95 59 L103 57.6 L104.6 66 L96.6 67.4Z', '#FFF8EE', { w: 1.2 }) + Cir(97, 60.2, 0.9, { fill: CORD, 'data-r': 'flat' }) + line('M98 63 L102.6 62.2', '#C9B8A8', 1);
      // la azul chiquita arriba
      s += box(22, 41, 32, 18, 16, '#7FA9DE', { r: 2 }) + flat('M35.5 23 h5 v18 h-5Z', SNOW) + flat('M35.5 16 h5 v7 h-5Z', tone(SNOW, -0.2));
      s += box(20, 24, 36, 6, 18, tone('#7FA9DE', 0.2), { r: 2 }) + flat('M35.5 18 h5 v6 h-5Z', SNOW) + flat('M21 13.4 h34 v2.2 h-34Z M35.5 9 h5 v9 h-5Z', tone(SNOW, -0.2));
      s += bow(38, 14, 0.95, SNOW);
      return s;
    },
  },
  {
    id: 'casitaJengibre', name: 'Casita de jengibre', price: 70, w: 80, h: 78, place: 'sobre', season: 'navidad',
    draw: () => {
      const G = '#C2864F', GD = tone('#C2864F', -0.6);
      let s = surf(40, 75, 34);
      // la bandeja con nieve de azúcar
      s += part(ellD(40, 70, 37, 7.4), '#E6EEF8', { w: 1.8 }) + flat(ellD(40, 69, 32, 5), SNOW);
      // chimenea con nieve
      s += face(rr(53, 14, 8, 16, 1), GD, { w: 1.4 }) + part('M51.6 15 Q52 11.4 57 11.4 Q62 11.4 62.4 15 Q60 16.6 57 15.6 Q54 16.6 51.6 15Z', SNOW, { w: 1.2 });
      // paredes de galleta
      s += face(rr(13, 38, 54, 33, 2), G, { w: 1.9 });
      s += flat('M13.6 40 L66.4 40 L66.4 44 L13.6 44Z', tone(G, -0.4));
      // techo a dos aguas con tejas de glaseado
      s += part('M4 45 L40 10 L76 45 L68.4 47.4 L40 20.6 L11.6 47.4Z', tone(G, -0.25), { w: 1.8 });
      s += line('M7.4 44 L40 12.6 L72.6 44', SNOW, 3);
      s += line('M12 46 L40 20.4 L68 46', SNOW, 2.2) + line('M12 49.4 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0 q2.4 3.2 4.8 0', SNOW, 2.4);
      // gomitas en el caballete
      [[22, 30, '#FF7FA8'], [31, 21.6, '#8ED07A'], [49, 21.6, '#FFD45C'], [58, 30, '#7FC8F8']].forEach(([x, y, c]) => { s += part(`M${x - 3} ${y + 1.6} Q${x - 3} ${y - 2.8} ${x} ${y - 2.8} Q${x + 3} ${y - 2.8} ${x + 3} ${y + 1.6}Z`, c, { w: 1.1 }); });
      s += part(ellD(40, 31, 4, 4), '#FFE89A', { w: 1.3 }) + line('M40 27 V35 M36 31 H44', SNOW, 1.2);
      // ventanas con luz y puerta con bastones
      s += part(rr(17, 51, 11, 10, 2), '#FFE08A', { w: 1.4 }) + part(rr(52, 51, 11, 10, 2), '#FFE08A', { w: 1.4 });
      s += line('M22.5 51 V61 M17 56 H28 M57.5 51 V61 M52 56 H63', SNOW, 1.4);
      s += hot('M18.6 52.4 h3 v2.6 h-3Z M53.6 52.4 h3 v2.6 h-3Z');
      s += part('M33.6 70 L33.6 59 Q40 51 46.4 59 L46.4 70Z', '#8A5A3C', { w: 1.5 }) + line('M34.6 59.4 Q40 52.6 45.4 59.4', SNOW, 1.3) + Cir(44, 64.6, 1.3, { fill: GOLD, 'data-r': 'flat' });
      s += tube('M30.6 70 V58.6 Q30.6 56 28.6 56', 2.6, '#FFFFFF') + tube('M49.4 70 V58.6 Q49.4 56 51.4 56', 2.6, '#FFFFFF');
      s += line('M29.4 68 L31.8 66.6 M29.4 63.6 L31.8 62.2 M48.2 68 L50.6 66.6 M48.2 63.6 L50.6 62.2', RED, 1.4);
      // botones de caramelo en el zócalo
      [[17, 67.4, RED], [23, 68, '#8ED07A'], [57, 68, '#7FC8F8'], [63, 67.4, '#FF7FA8']].forEach(([x, y, c]) => { s += ball(x, y, 2.4, c); });
      return s;
    },
  },
  {
    id: 'nochebuena', name: 'Nochebuena', price: 65, w: 74, h: 84, place: 'sobre', season: 'navidad',
    draw: () => {
      let s = surf(37, 81, 23) + contact(37, 80.4, 15);
      // maceta envuelta en papel dorado, con moño
      s += face('M21 56 L53 56 L48.6 80 Q37 82.4 25.4 80Z', GOLD, { w: 1.8 });
      s += flat('M25 60 L29 58 L27.6 79 L25.4 78.6Z M38 58.6 L41 58 L40.6 80.6 L37.6 80.8Z', '#FFE89A') + shade('M44 58 L51.6 58 L48 79.6 L44.6 80.2Z', '#B07A1E', 0.35);
      s += part('M18 56 L22 51.4 L25 55 L29 50.6 L33 55 L37 50.4 L41 55 L45 50.6 L49 55 L52 51.4 L56 56 Q37 60 18 56Z', '#FFE07A', { w: 1.6 });
      // hojas verdes de abajo
      const lf = (a, len, c) => `<g transform="rotate(${a} 37 36)">${part(`M37 36 C32 ${36 - len * 0.35} 33 ${36 - len * 0.8} 37 ${36 - len} C41 ${36 - len * 0.8} 42 ${36 - len * 0.35} 37 36Z`, c, { w: 1.3 })}${line(`M37 ${36 - 3} L37 ${36 - len + 3}`, tone(c, -0.8), 1, { opacity: 0.7 })}</g>`;
      [-128, -64, 0, 64, 128, 180].forEach((a, i) => { s += lf(a + 30, 25, i % 2 ? GREEN : GREEN_M); });
      // brácteas rojas, dos coronas
      [0, 72, 144, 216, 288].forEach((a, i) => { s += lf(a, 23 - (i % 2) * 2, RED); });
      [36, 108, 180, 252, 324].forEach((a) => { s += lf(a, 15, '#EE5466'); });
      // el centro amarillo
      [[34.6, 34.6], [39.2, 35], [37, 38.4], [35, 38], [39.6, 38.6], [37, 33]].forEach(([x, y]) => { s += part(ellD(x, y, 1.7, 1.7), '#F5D24A', { w: 0.8 }); });
      s += bow(37, 68, 0.8, RED);
      return s;
    },
  },
  {
    id: 'renoPeluche', name: 'Renito de peluche', price: 90, w: 86, h: 106, place: 'piso', season: 'navidad',
    draw: () => {
      const B = '#B07A52', L = '#F2D9BC', ANT = '#D8B486';
      let s = floorSh(43, 103, 31, 5) + contact(43, 101.4, 22);
      // cuernitos de terciopelo
      s += tube('M31 27 C27 18 24 13 18 9', 4.6, ANT) + tube('M25 16 L17 18.6', 3.8, ANT) + tube('M21.6 11.6 L19.4 4.8', 3.6, ANT);
      s += tube('M55 27 C59 18 62 13 68 9', 4.6, ANT) + tube('M61 16 L69 18.6', 3.8, ANT) + tube('M64.4 11.6 L66.6 4.8', 3.6, ANT);
      // cuerpo sentadito y pancita
      s += part('M22 98 C16 84 20 64 30 58 L56 58 C66 64 70 84 64 98 Q43 103 22 98Z', B, { w: 1.9 });
      s += shade('M54 60 C64 66 67 84 62 98 Q58 99 55 99 C61 86 60 70 50 61Z', '#6E4A30', 0.35);
      s += part(ellD(43, 83, 13, 13), L, { w: 1.2 });
      // patitas con pezuñas
      s += part('M24 94 C24 89 36 89 36 94 L36 99 Q30 101.6 24 99Z', B, { w: 1.5 }) + part('M50 94 C50 89 62 89 62 94 L62 99 Q56 101.6 50 99Z', B, { w: 1.5 });
      s += part('M24 97 L36 97 L36 99.6 Q30 102 24 99.6Z', '#5E4030', { w: 1.2 }) + part('M50 97 L62 97 L62 99.6 Q56 102 50 99.6Z', '#5E4030', { w: 1.2 });
      // orejas y cabeza
      s += part('M22 34 C13 30 10 39 19 43Z', B, { w: 1.5 }) + part('M64 34 C73 30 76 39 67 43Z', B, { w: 1.5 });
      s += flat('M20 36 C15.4 35 14.6 39 19.6 40.6Z', '#E8B0A8') + flat('M66 36 C70.6 35 71.4 39 66.4 40.6Z', '#E8B0A8');
      s += part(ellD(43, 41, 22, 19), B, { w: 1.9 });
      s += shine('M25 36 C26 30 30 26 35 24.6 C31 28 29 32 28.6 37Z', { opacity: 0.35 });
      s += part(ellD(43, 50, 11.6, 8.2), L, { w: 1.2 });
      s += glow(43, 46.6, 8, 7, '#FF6A7E', 0.7);
      s += part(ellD(43, 46.6, 4.8, 4.1), RED, { w: 1.3 }) + Cir(41.4, 45.2, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += Ell(34.6, 38, 2.8, 3.4, { fill: INK, 'data-r': 'flat' }) + Ell(51.4, 38, 2.8, 3.4, { fill: INK, 'data-r': 'flat' }) + Cir(35.6, 36.6, 1, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(52.4, 36.6, 1, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += line('M39.6 53.6 Q43 56.4 46.4 53.6', INK, 1.4);
      s += Ell(28, 47, 3.4, 2, { fill: BLUSH, 'data-r': 'flat' }) + Ell(58, 47, 3.4, 2, { fill: BLUSH, 'data-r': 'flat' });
      // collar de cinta con cascabel
      s += part('M25 59 Q43 66 61 59 L61 64.6 Q43 71.6 25 64.6Z', GREEN_M, { w: 1.5 });
      s += part(ellD(43, 71, 3.6, 3.6), GOLD, { w: 1.2 }) + line('M40.4 71.6 H45.6', '#B8862A', 1.1) + Cir(42, 69.8, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
      return s;
    },
  },
  {
    id: 'esferaNieve', name: 'Esfera de nieve de Navidad', price: 0, w: 66, h: 80, place: 'sobre', season: 'navidad', giftOnly: true,
    draw: () => {
      const WOOD = '#8A5A3C';
      let s = surf(33, 77, 25) + contact(33, 76.4, 18);
      // pedestal de madera con su placa dorada
      s += face('M11 77 L14 65 L52 65 L55 77Z', WOOD, { w: 1.8 }) + face(rr(12, 61, 42, 5, 2), tone(WOOD, 0.55), { w: 1.6 });
      s += face(rr(24, 68, 18, 6, 1.2), GOLD, { w: 1.2 }) + line('M27 71 H39', '#C9A040', 1);
      s += line('M15 75 C22 73 26 75 32 73.6 M40 75.4 C45 74 48 75 52 73.6', tone(WOOD, -0.6), 1, { opacity: 0.6 });
      // el vidrio y lo de adentro (un poco desaturado)
      s += part(ellD(33, 35, 25, 26), '#E6F2FB', { w: 2 });
      s += flat('M9.4 44 C14 53 52 53 56.6 44 C56 53.6 46 60.8 33 60.8 C20 60.8 10 53.6 9.4 44Z', SNOW);
      s += shade('M42 47 C48 47 54 46 56.4 44.6 C55.6 53 46.6 60.4 36 60.8 C44 57 46 51 42 47Z', SNOW_SH, 0.8);
      // casita con techo nevado y pinito
      s += face(rr(26, 37, 14, 11, 1), '#E07A6E', { w: 1.3 }) + part('M23.6 38.4 L33 30 L42.4 38.4Z', SNOW, { w: 1.3 }) + part(rr(31, 41.6, 4, 6.4, 1), '#8A5A3C', { w: 1 }) + flat(rr(27.6, 40, 2.8, 2.8, 0.6), '#FFE08A');
      s += part('M46 26 L41.6 34.4 L44 34.4 L40.6 41 L51.4 41 L48 34.4 L50.4 34.4Z', '#5E9C78', { w: 1.2 }) + flat(rr(45, 41, 2, 4, 0.4), '#8A5A3C');
      [[17, 24], [44, 17], [21, 39], [52, 31], [29, 15], [37, 25], [14, 33]].forEach(([x, y], i) => { s += Cir(x, y, i % 2 ? 1.2 : 1.6, { fill: '#FFFFFF', 'data-r': 'flat' }); });
      // dos brillos en el vidrio
      s += shine('M15 26 C17 18 22 13 28 11.4 C22 16 19.6 21 18.6 28Z', { opacity: 0.85 }) + shine('M46.6 50 C49.6 47 51.6 43.6 52.6 40 C53 44.6 51.6 48 49 50.6Z', { opacity: 0.6 });
      // aro donde el vidrio entra en la base
      s += face(rr(16, 57.6, 34, 4.6, 2.3), tone(WOOD, 0.3), { w: 1.4 });
      return s;
    },
  },
];
