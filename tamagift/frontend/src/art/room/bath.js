// Escena del baño (300×380), en la misma vista 3/4 del cuarto. Va en
// tres capas para que la mascota quede DENTRO de la tina:
//   1. fondo: pared de azulejos, piso, ducha, toalla y la tina por dentro
//   2. (la mascota)
//   3. frente de la tina, espuma y patito

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, Cir, Ell, INK, piece, tube, G, E } from './draw.js';

export const BATH_SCENE = { W: 300, H: 380, WALL_H: 250 };
const TILE = '#D8EFE6', GROUT = '#B6D8CB', TUB = '#FFFFFF', WATER = '#9FD8F2';

export function bathBackSvg() {
  const { W, H, WALL_H } = BATH_SCENE;
  let s = flat(`M0 0h${W}v${WALL_H}h${-W}Z`, GROUT);
  // azulejos (desfasados) con su brillo
  for (let row = 0, y = 1; y < WALL_H - 20; row++, y += 26) {
    for (let x = row % 2 ? -18 : 0; x < W; x += 38) {
      s += flat(rr(x + 1.5, y + 1.5, 35, 23, 3), TILE);
      s += flat(`M${x + 4} ${y + 4}h20v3h-20Z`, '#FFFFFF', { opacity: 0.6 });
    }
  }
  // guarda de azulejos oscuros y zócalo
  s += flat(`M0 ${WALL_H - 22}h${W}v22h${-W}Z`, '#7FBFAE');
  for (let x = 6; x < W; x += 24) s += flat(`M${x} ${WALL_H - 11}l6 -6l6 6l-6 6Z`, '#FFFFFF', { opacity: 0.7 });
  // piso: baldosas en 3/4 (el doble de anchas que de altas)
  s += flat(`M0 ${WALL_H}h${W}v${H - WALL_H}h${-W}Z`, '#E7E1EE');
  for (let row = 0, y = WALL_H; y < H; row++, y += 22) {
    for (let col = 0, x = 0; x < W; col++, x += 44) if ((row + col) % 2) s += flat(`M${x} ${y}h44v22h-44Z`, '#CBC1D9');
  }
  s += shade(`M0 ${WALL_H}h${W}v10h${-W}Z`, '#2A1C24', 0.18);
  // toallero con toalla
  s += tube('M18 70H92', 4, '#C9CCD3');
  s += part('M30 70H80V132C80 138 76 140 72 136L66 130L60 136C56 140 52 138 52 132V70Z', '#F7A6B9', { w: 2 });
  s += flat('M34 108H76V114H34Z', '#FFFFFF', { opacity: 0.8 });
  // ducha
  s += tube('M262 0V40Q262 52 250 52H236', 6, '#C9CCD3');
  s += part('M222 46h22l6 12h-34Z', '#DCE1EA', { w: 2 });
  [[222, 66], [230, 70], [238, 66], [246, 70]].forEach(([x, y]) => { s += Ell(x, y, 1.6, 3, { fill: '#7FC8F0', 'data-r': 'flat' }); });
  // estante con frascos
  s += face(rr(196, 128, 76, 7, 2), '#F2EAE0', { w: 1.6 });
  s += part(rr(204, 106, 14, 22, 3), '#B892E0', { w: 1.6 }) + part(rr(207, 100, 8, 7, 2), '#FFFFFF', { w: 1.2 });
  s += part(rr(224, 112, 16, 16, 3), '#7FB894', { w: 1.6 });
  s += part('M248 128c0 -14 4 -20 10 -20s10 6 10 20Z', '#F2C14E', { w: 1.6 });
  // la tina por dentro: borde de atrás y el agua
  s += face('M22 220C22 204 34 196 52 196H248C266 196 278 204 278 220Z', TUB);
  s += face('M36 222C36 210 46 205 58 205H242C254 205 264 210 264 222Z', mix(TUB, '#B9D8E6', 0.4), { w: 1.6 });
  s += flat('M38 222C40 216 48 213 58 213H242C252 213 260 216 262 222Z', WATER);
  return piece(W, H, s);
}

export function bathFrontSvg() {
  const { W, H } = BATH_SCENE;
  let s = '';
  // frente de la tina con su borde
  s += face('M22 222H278V286C278 318 254 334 220 334H80C46 334 22 318 22 286Z', TUB);
  s += face(rr(16, 216, 268, 14, 7), '#F4F1F8', { w: 2 });
  s += line('M40 248C40 290 56 314 84 318', mix(TUB, '#B9C2D6', 0.6), 3, { opacity: 0.8 });
  s += shine('M44 240c2 20 8 38 20 50c-14 -8 -22 -26 -24 -50Z', { opacity: 0.8 });
  // espuma sobre el agua: asoma por encima del borde, delante de la mascota
  [[58, 212, 15], [84, 216, 12], [108, 218, 9], [192, 218, 10], [214, 214, 14], [244, 212, 11]].forEach(([x, y, r]) => {
    s += part(ellD(x, y, r, r * 0.78), '#FFFFFF', { w: 1.6 }) + Cir(x - r * 0.3, y - r * 0.3, r * 0.22, { fill: '#DDF0FA', 'data-r': 'flat' });
  });
  // patas
  [[62, 334], [238, 334]].forEach(([x, y]) => { s += part(`M${x - 10} ${y - 4}C${x - 12} ${y + 8} ${x - 8} ${y + 14} ${x} ${y + 14}C${x + 8} ${y + 14} ${x + 12} ${y + 8} ${x + 10} ${y - 4}Z`, '#F2C14E', { w: 1.8 }); });
  s += Ell(150, 350, 118, 7, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  // patito
  s += part('M232 214c-10 0 -14 -6 -12 -12c2 -5 8 -6 12 -4c0 -6 4 -10 9 -10c6 0 9 5 8 10l6 1l-5 4c3 6 -2 11 -18 11Z', '#FFD84D', { w: 1.6 });
  s += Cir(243, 194, 1.6, { fill: INK, 'data-r': 'flat' });
  return piece(W, H, s);
}
