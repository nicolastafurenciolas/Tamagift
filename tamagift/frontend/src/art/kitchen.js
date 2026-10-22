// ─────────────────────────────────────────────────────────────────
// Arte de la Cocina: utensilios, ingredientes y el mesón, en la misma
// vista 3/4 del cuarto (frente + tapa, lo redondo es una elipse el doble
// de ancha que alta, luz de arriba a la izquierda). Cada estilo lo
// redibuja con su kit.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, Cir, Ell, piece, G, INK, DEPTH } from './room/draw.js';
import { starPath } from './minigames.js';

const metal = '#C9CED8';

// ── Mesón ─────────────────────────────────────────────────────────
export function counterSvg(w = 360, h = 300) {
  const top = h * 0.52;
  let s = flat(`M0 0H${w}V${top}H0Z`, '#F3EDE6');
  // azulejos de la pared
  for (let y = 0, r = 0; y < top - 4; y += 22, r++) {
    for (let x = r % 2 ? -14 : 0; x < w; x += 28) s += flat(rr(x + 1, y + 1, 26, 20, 3), r % 2 ? '#DDEFF0' : '#E7F3EF');
  }
  s += shade(`M0 ${top - 18}H${w}V${top}H0Z`, '#2A1C24', 0.08);
  // repisa con frascos
  s += face(rr(w * 0.06, top * 0.42, w * 0.34, 7, 2), '#C99A6B', { w: 1.8 });
  [[0.1, '#F7B231'], [0.18, '#E8505E'], [0.26, '#55BE84'], [0.33, '#FFFFFF']].forEach(([fx, c], i) => {
    const x = w * fx, yb = top * 0.42;
    s += face(rr(x - 7, yb - 20 + (i % 2) * 4, 14, 20 - (i % 2) * 4, 3), mix(c, '#FFFFFF', 0.35), { w: 1.6 });
    s += face(rr(x - 8, yb - 24 + (i % 2) * 4, 16, 5, 2), tone(c, -0.4), { w: 1.4 });
  });
  // ventanita con plantita
  s += face(rr(w * 0.68, top * 0.14, w * 0.24, top * 0.44, 4), '#FFFFFF', { w: 2 });
  s += flat(rr(w * 0.69 + 2, top * 0.14 + 4, w * 0.22 - 4, top * 0.4 - 4, 2), '#CBE9F7');
  s += line(`M${w * 0.8} ${top * 0.14 + 3}V${top * 0.58 - 1}M${w * 0.69} ${top * 0.36}H${w * 0.91}`, '#FFFFFF', 3);
  // mesón: tapa (profundidad × DEPTH) y frente
  const d = 70 * DEPTH;
  s += face(`M0 ${top}H${w}V${top + d}H0Z`, '#F7F1E8', { w: 2.2 });
  s += line(`M0 ${top + 3}H${w}`, '#FFFFFF', 2, { opacity: 0.8 });
  s += face(`M0 ${top + d}H${w}V${h}H0Z`, '#E7B98E', { w: 2.2 });
  for (let x = w / 6; x < w; x += w / 3) s += face(rr(x - w / 7, top + d + 12, (w / 7) * 2, h - top - d - 20, 6), '#EDC49C', { w: 1.6 }) + Cir(x, top + d + 22, 3, { fill: '#B9875A', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
  return piece(w, h, s);
}

// ── Utensilios ────────────────────────────────────────────────────
export function boardSvg() {
  const c = '#E3B27A', m = mat(c);
  let s = Ell(100, 104, 92, 10, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  s += face(rr(6, 26, 168, 70, 12), m.top, { w: 2.4 });
  s += face(`M6 84V90Q6 102 18 102H162Q174 102 174 90V84Q174 96 162 96H18Q6 96 6 84Z`, m.front, { w: 2 });
  s += face(rr(172, 46, 24, 24, 10), m.top, { w: 2.2 });
  s += Cir(186, 58, 4, { fill: tone(c, -1), 'data-r': 'flat' });
  s += line('M24 40Q60 34 100 38M30 74Q80 80 150 72', tone(c, -0.6), 1.4, { opacity: 0.6 });
  return piece(200, 112, s);
}

export function bowlSvg(fill = null) {
  const c = '#9FD3F0', m = mat(c);
  let s = Ell(100, 128, 76, 9, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  s += face('M12 52C12 100 50 126 100 126C150 126 188 100 188 52Z', m.front, { w: 2.4 });
  s += face(ellD(100, 52, 88, 88 * DEPTH * 0.5), m.top, { w: 2.4 });
  s += face(ellD(100, 54, 78, 78 * DEPTH * 0.45), tone(c, -0.8), { w: 1.6 });
  if (fill) s += flat(ellD(100, 58, 72, 72 * DEPTH * 0.38), fill);
  s += shine('M30 66C34 90 52 108 74 116C52 104 40 88 36 66Z', { opacity: 0.7 });
  s += line('M40 84Q100 96 160 84', '#FFFFFF', 2, { opacity: 0.5 });
  return piece(200, 136, s);
}

export function potSvg(fill = null) {
  const c = '#E8505E', m = mat(c);
  let s = Ell(100, 158, 80, 9, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  s += face(rr(4, 66, 26, 12, 6), m.side, { w: 2 }) + face(rr(170, 66, 26, 12, 6), m.side, { w: 2 });
  s += face('M24 52V128C24 146 60 156 100 156C140 156 176 146 176 128V52Z', m.front, { w: 2.4 });
  s += face(ellD(100, 52, 76, 76 * DEPTH * 0.5), m.top, { w: 2.4 });
  s += face(ellD(100, 54, 68, 68 * DEPTH * 0.45), '#3B2A2E', { w: 1.6 });
  if (fill) s += flat(ellD(100, 58, 64, 64 * DEPTH * 0.38), fill);
  s += shine('M36 66V124C36 136 44 142 52 146C44 136 44 124 44 66Z', { opacity: 0.55 });
  s += line('M30 104Q100 116 170 104', tone(c, 1.2), 2, { opacity: 0.6 });
  return piece(200, 166, s);
}

export function panSvg() {
  let s = Ell(100, 104, 88, 8, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  s += face('M176 58L232 46L234 56L180 70Z', '#5A4038', { w: 2 });
  s += face('M10 58C10 84 50 100 96 100C142 100 182 84 182 58Z', '#4A4652', { w: 2.4 });
  s += face(ellD(96, 58, 86, 86 * DEPTH * 0.5), '#5E5A68', { w: 2.4 });
  s += face(ellD(96, 60, 76, 76 * DEPTH * 0.44), '#2E2B35', { w: 1.6 });
  s += shine('M26 64C34 80 54 90 76 94C56 86 40 78 32 64Z', { opacity: 0.35 });
  return piece(240, 110, s);
}

export function stoveSvg() {
  let s = Ell(100, 52, 92, 7, { fill: '#2A1C24', opacity: 0.12, 'data-r': 'tone' });
  s += face(rr(4, 18, 192, 30, 8), '#D9D6E0', { w: 2.2 });
  s += face(ellD(100, 22, 56, 56 * DEPTH * 0.32), '#4A4652', { w: 2 });
  s += line(ellD(100, 22, 40, 40 * DEPTH * 0.32), '#8A8696', 2.4);
  [26, 174].forEach((x) => { s += face(ellD(x, 34, 9, 7), '#FFFFFF', { w: 1.8 }) + line(`M${x} 34L${x + 4} 29`, INK, 1.8); });
  return piece(200, 58, s);
}

// Llama del fogón (tamaño 0..1).
export function flameSvg() {
  let s = part('M50 96C26 96 18 78 26 62C30 54 36 50 36 40C44 46 46 54 44 62C50 56 52 46 50 30C66 42 76 58 74 74C72 88 64 96 50 96Z', '#FF8A3D', { w: 2 });
  s += flat('M50 92C38 92 34 82 38 74C40 70 44 68 44 62C50 66 54 72 54 78C56 74 58 70 58 64C64 70 64 80 60 86C58 90 54 92 50 92Z', '#FFD25A');
  return piece(100, 100, s);
}

export function ovenSvg(trayFill = '#F6D9A6') {
  let s = Ell(100, 176, 90, 7, { fill: '#2A1C24', opacity: 0.14, 'data-r': 'tone' });
  s += face(rr(8, 10, 184, 164, 12), '#F2EEF6', { w: 2.4 });
  s += face(rr(8, 10, 184, 26, 12), '#D9D3E3', { w: 2 });
  [40, 70, 130, 160].forEach((x) => { s += face(ellD(x, 23, 7, 6), '#FFFFFF', { w: 1.6 }); });
  s += face(rr(26, 50, 148, 104, 10), '#5A5266', { w: 2.2 });
  s += flat(rr(34, 58, 132, 88, 7), '#FFB45E', { opacity: 0.55 });
  s += face(rr(48, 108, 104, 10, 3), '#9AA0AC', { w: 1.6 });
  [62, 84, 106, 128].forEach((x) => { s += face(ellD(x + 6, 104, 9, 5), trayFill, { w: 1.4 }); });
  s += shine('M40 62H70L52 78H40Z', { opacity: 0.4 });
  s += face(rr(60, 40, 80, 6, 3), metal, { w: 1.6 });
  return piece(200, 184, s);
}

export function plateSvg() {
  let s = Ell(100, 82, 88, 8, { fill: '#2A1C24', opacity: 0.14, 'data-r': 'tone' });
  s += face(ellD(100, 52, 92, 92 * DEPTH * 0.62), '#FFFFFF', { w: 2.4 });
  s += line(ellD(100, 52, 70, 70 * DEPTH * 0.6), '#D7E9F2', 2.6);
  return piece(200, 90, s);
}

export function knifeSvg() {
  let s = face('M22 6C34 10 38 30 36 70H16V10C16 7 19 5 22 6Z', '#E9EDF3', { w: 2.2 });
  s += line('M22 14V64', '#FFFFFF', 2, { opacity: 0.8 });
  s += face(rr(12, 68, 28, 8, 3), '#6E6680', { w: 2 });
  s += face(rr(16, 74, 20, 52, 7), '#8B5A3C', { w: 2.2 });
  s += Cir(26, 90, 2.4, { fill: metal, 'data-r': 'flat' }) + Cir(26, 108, 2.4, { fill: metal, 'data-r': 'flat' });
  return piece(52, 132, s);
}

export function spoonSvg() {
  let s = face(rr(17, 40, 10, 96, 5), '#D9A06E', { w: 2 });
  s += face(ellD(22, 24, 15, 20), '#E7B98E', { w: 2.2 });
  s += flat(ellD(22, 24, 9, 13), '#C98E5A');
  return piece(44, 140, s);
}

// Panqueque (o arepa) según qué tan dorado está: 0 crudo, 0.5 en su
// punto, 1 quemado.
export function pancakeSvg(done = 0, kind = 'panqueque') {
  const raw = kind === 'arepa' ? '#F4E3A8' : '#F6E3B4';
  const gold = kind === 'arepa' ? '#E2B35A' : '#E0A458';
  const burnt = '#6B3E26';
  const t = Math.max(0, Math.min(1, done));
  const c = t < 0.5 ? mix(raw, gold, t / 0.5) : mix(gold, burnt, (t - 0.5) / 0.5);
  let s = face(ellD(60, 30, 52, 52 * DEPTH * 0.5), c, { w: 2.2 });
  s += face('M8 30V36C8 44 32 52 60 52C88 52 112 44 112 36V30C112 40 88 46 60 46C32 46 8 40 8 30Z', tone(c, -0.6), { w: 1.8 });
  if (t > 0.3) [[40, 26], [64, 22], [80, 32], [52, 34]].forEach(([x, y]) => { s += Ell(x, y, 3.5, 1.8, { fill: tone(c, -0.8), opacity: 0.6, 'data-r': 'tone' }); });
  s += shine('M24 22C34 16 48 14 60 14C46 18 34 20 28 26Z', { opacity: 0.5 });
  return piece(120, 60, s);
}

export function doughSvg(color = '#F4E3A8') {
  let s = Ell(60, 84, 46, 6, { fill: '#2A1C24', opacity: 0.14, 'data-r': 'tone' });
  s += part('M14 70C10 46 30 26 60 26C90 26 110 46 106 70C104 82 84 86 60 86C36 86 16 82 14 70Z', color, { w: 2.4 });
  s += shine('M28 44C34 34 46 30 56 30C46 34 38 40 34 48Z', { opacity: 0.6 });
  return piece(120, 92, s);
}

// Plato tapado (por si una comida no tiene dibujo propio).
export function clocheSvg() {
  let s = Ell(60, 84, 54, 6, { fill: '#2A1C24', opacity: 0.14, 'data-r': 'tone' });
  s += face(ellD(60, 76, 56, 10), '#FFFFFF', { w: 2.2 });
  s += face('M12 74C12 44 34 26 60 26C86 26 108 44 108 74Z', metal, { w: 2.4 });
  s += face(ellD(60, 22, 8, 5), '#9AA0AC', { w: 2 });
  s += shine('M26 64C28 48 40 36 54 32C42 40 34 50 32 64Z', { opacity: 0.7 });
  return piece(120, 92, s);
}

export function sparkleSvg(color = '#FFE37A') {
  return piece(40, 40, part(starPath(20, 20, 18, 6, 4, -90), color, { w: 1.6 }));
}

// ── Ingredientes (64×64) ──────────────────────────────────────────
const sh = () => Ell(32, 58, 18, 3.4, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
const gl = (d, o = 0.8) => shine(d, { opacity: o });

export const INGREDIENTS = {
  lechuga: { name: 'Lechuga', draw: () => sh() + part('M10 40C6 26 16 12 32 12C48 12 58 26 54 40C50 52 40 56 32 56C24 56 14 52 10 40Z', '#8ED07A') + part('M18 42C16 30 22 20 32 20C42 20 48 30 46 42C44 50 38 52 32 52C26 52 20 50 18 42Z', '#B8E59A', { w: 1.8 }) + line('M32 22V52M32 34L24 28M32 40L40 32', '#6BAE5C', 1.6) },
  tomate: { name: 'Tomate', draw: () => sh() + part(ellD(32, 36, 22, 19), '#E8505E') + part('M32 18L26 14L28 20L22 22L30 24L32 30L34 24L42 22L36 20L38 14Z', '#6BBF6B', { w: 1.4 }) + gl('M16 32C17 26 22 22 28 21C24 25 20 28 19 34Z') },
  pepino: { name: 'Pepino', draw: () => sh() + part('M10 44C8 34 30 16 46 14C56 14 58 22 52 30C44 42 22 52 14 50C12 49 10 47 10 44Z', '#5CA86A') + [[24, 38], [34, 30], [44, 22]].map(([x, y]) => Cir(x, y, 1.6, { fill: '#B8E59A', 'data-r': 'flat' })).join('') + gl('M16 40C22 32 32 24 42 20', 0.5) },
  huevo: { name: 'Huevo', draw: () => sh() + part('M32 10C44 10 52 30 52 40C52 50 44 56 32 56C20 56 12 50 12 40C12 30 20 10 32 10Z', '#FFF6EA') + gl('M20 30C22 22 26 16 31 14C27 20 24 26 24 32Z') },
  harina: { name: 'Harina', draw: () => sh() + part('M14 20L18 54H46L50 20L44 14H20Z', '#F4EEE6') + part('M14 20H50L44 12H20Z', '#E2D8CC', { w: 1.6 }) + flat(rr(20, 30, 24, 14, 3), '#7FC8F8') + line('M24 37H40', '#FFFFFF', 2) },
  harinaMaiz: { name: 'Harina de maíz', draw: () => sh() + part('M14 20L18 54H46L50 20L44 14H20Z', '#FFE08A') + part('M14 20H50L44 12H20Z', '#F2C14E', { w: 1.6 }) + flat(rr(20, 30, 24, 14, 3), '#E8505E') + line('M24 37H40', '#FFFFFF', 2) },
  leche: { name: 'Leche', draw: () => sh() + part('M18 22L24 14H40L46 22V54H18Z', '#FFFFFF') + part('M24 14L32 6L40 14Z', '#DCEFFB', { w: 1.6 }) + flat(rr(18, 30, 28, 12, 0), '#7FC8F8') + flat(ellD(32, 36, 6, 4), '#FFFFFF') },
  agua: { name: 'Agua', draw: () => sh() + part('M20 16H44V20C50 26 50 50 44 54H20C14 50 14 26 20 20Z', '#CFEFFF') + flat('M18 34H46V52H18Z', '#8CCBF0', { opacity: 0.8 }) + part(rr(22, 10, 20, 7, 2), '#7FC8F8', { w: 1.6 }) + gl('M20 26V48', 0.6) },
  queso: { name: 'Queso', draw: () => sh() + part('M8 42L46 20L56 34V48L18 54L8 48Z', '#FFD25A') + part('M8 42L46 20L56 34L18 46Z', '#FFE28A', { w: 1.8 }) + [[26, 48, 3], [42, 44, 2.4], [36, 32, 2.2]].map(([x, y, r]) => Cir(x, y, r, { fill: '#E2B23F', 'data-r': 'flat' })).join('') },
  zanahoria: { name: 'Zanahoria', draw: () => sh() + part('M16 50L44 18C48 14 54 16 54 22C54 26 50 28 46 30L18 54C16 56 14 52 16 50Z', '#F59A3C') + part('M48 18L52 6L54 14L60 8L56 18L62 18L52 22Z', '#6BBF6B', { w: 1.4 }) + line('M30 38L34 40M38 30L42 32M24 46L27 48', tone('#F59A3C', -1), 1.4) },
  papa: { name: 'Papa', draw: () => sh() + part('M12 36C10 24 20 16 32 16C46 16 54 24 52 36C50 48 42 54 30 54C18 54 13 46 12 36Z', '#D9B07A') + [[24, 30], [40, 28], [34, 44]].map(([x, y]) => Cir(x, y, 1.8, { fill: '#A97E4A', 'data-r': 'flat' })).join('') + gl('M18 30C20 24 26 20 32 19C26 23 22 27 21 32Z', 0.5) },
  cebolla: { name: 'Cebolla', draw: () => sh() + part('M32 16C44 22 52 32 52 42C52 50 44 56 32 56C20 56 12 50 12 42C12 32 20 22 32 16Z', '#E6B9E6') + line('M32 18V54M24 26Q20 40 26 54M40 26Q44 40 38 54', '#B886C8', 1.4) + part('M30 18L32 6L34 18Z', '#8FCB7A', { w: 1.2 }) },
  arroz: { name: 'Arroz', draw: () => sh() + part('M10 32C10 48 20 56 32 56C44 56 54 48 54 32Z', '#7FC8F8') + part(ellD(32, 32, 22, 7), '#FFFFFF', { w: 1.8 }) + part('M16 30C18 20 26 16 32 16C38 16 46 20 48 30Z', '#FFFFFF', { w: 1.8 }) + [[24, 24], [32, 21], [40, 25], [28, 28], [36, 28]].map(([x, y]) => Ell(x, y, 2, 1.2, { fill: '#E7E2DA', 'data-r': 'flat' })).join('') },
  alga: { name: 'Alga nori', draw: () => sh() + part('M12 18L52 14L54 50L14 54Z', '#2F5A3E') + line('M20 20L22 50M30 18L32 52M40 16L42 52', '#3E7A52', 1.4, { opacity: 0.8 }) },
  salmon: { name: 'Salmón', draw: () => sh() + part('M8 40C10 28 26 20 44 22C54 24 58 32 56 40C54 48 40 52 26 50C14 48 8 46 8 40Z', '#FF9A6B') + line('M18 30L24 46M28 26L34 48M38 24L44 46', '#FFD0B5', 2.4) },
  azucar: { name: 'Azúcar', draw: () => sh() + part(rr(14, 18, 36, 38, 8), '#FFFFFF') + part(rr(18, 10, 28, 10, 4), '#FF9EC8', { w: 1.6 }) + flat(rr(20, 30, 24, 14, 3), '#FFD3E6') + [[26, 36], [32, 38], [38, 35]].map(([x, y]) => R0(x, y)).join('') },
  mantequilla: { name: 'Mantequilla', draw: () => sh() + part('M10 36L40 26L54 32V44L24 54L10 48Z', '#FFE89A') + part('M10 36L40 26L54 32L24 42Z', '#FFF3C2', { w: 1.6 }) },
  chocolate: { name: 'Chocolate', draw: () => sh() + part(rr(12, 14, 40, 42, 5), '#7B4A35') + line('M12 28H52M12 42H52M25 14V56M38 14V56', tone('#7B4A35', -0.8), 1.6) + gl('M16 18H22V24H16Z', 0.4) },
  fideos: { name: 'Fideos', draw: () => sh() + part('M14 50L22 14H42L50 50Z', '#FFE08A') + line('M24 16L20 50M30 14L28 50M36 14L36 50M42 16L44 50', '#E2B85A', 1.4) + part(rr(16, 30, 32, 8, 3), '#E8505E', { w: 1.6 }) },
  carne: { name: 'Carne', draw: () => sh() + part('M10 36C10 24 24 16 38 18C50 20 56 30 52 40C48 50 34 54 22 52C14 50 10 44 10 36Z', '#C2584E') + flat('M20 34C24 28 32 26 40 28', '#F2B8B0', { opacity: 0.9 }) + gl('M16 30C18 26 22 22 28 21', 0.4) },
  tortilla: { name: 'Tortilla', draw: () => sh() + part(ellD(32, 38, 26, 14), '#F2D79A') + [[22, 36], [34, 42], [42, 34], [28, 30]].map(([x, y]) => Cir(x, y, 1.8, { fill: '#D9A85A', 'data-r': 'flat' })).join('') },
  cebollin: { name: 'Cebollín', draw: () => sh() + part('M14 52L44 12L48 14L20 54Z', '#6BBF6B') + part('M22 54L50 18L54 20L28 56Z', '#8FD37A', { w: 1.6 }) + part(rr(10, 46, 18, 10, 4), '#FFFFFF', { w: 1.6 }) },
  fresa: { name: 'Fresas', draw: () => sh() + part('M32 56C18 48 12 36 14 26C16 18 24 16 32 18C40 16 48 18 50 26C52 36 46 48 32 56Z', '#E8505E') + part('M22 20C26 14 30 14 32 18C34 14 38 14 42 20C36 22 28 22 22 20Z', '#6BBF6B', { w: 1.4 }) + [[24, 30], [34, 28], [42, 32], [28, 40], [38, 40], [32, 48]].map(([x, y]) => Ell(x, y, 1.2, 1.8, { fill: '#FFE29A', 'data-r': 'flat' })).join('') },
  sal: { name: 'Sal', draw: () => sh() + part('M20 54V24C20 18 26 14 32 14C38 14 44 18 44 24V54Z', '#FFFFFF') + part(rr(20, 10, 24, 8, 3), metal, { w: 1.6 }) + [[28, 13], [32, 12], [36, 13]].map(([x, y]) => Cir(x, y, 1, { fill: INK, 'data-r': 'flat' })).join('') },
  // rollo de sushi enrollado, listo para cortar (visto de lado)
  rollo: { name: 'Rollo de sushi', draw: () => sh() + part(rr(6, 24, 52, 26, 12), '#2F5A3E') + part(ellD(52, 37, 7, 12), '#FFFFFF', { w: 1.8 }) + flat(ellD(52, 37, 3.5, 6), '#FF9A6B') + line('M14 28V46M24 26V48M34 26V48', '#3E7A52', 1.2, { opacity: 0.8 }) },
};

// Lo que se está cocinando en la sartén, según qué tan hecho está
// (0 crudo, 0.5 en su punto, 1 quemado).
export function cookItemSvg(kind, done = 0) {
  if (kind === 'panqueque' || kind === 'arepa') return pancakeSvg(done, kind);
  const t = Math.max(0, Math.min(1, done));
  if (kind === 'huevo') {
    const edge = t < 0.5 ? mix('#FFFFFF', '#F2D6A8', t / 0.5) : mix('#F2D6A8', '#7A4A2A', (t - 0.5) / 0.5);
    let s = face('M14 30C10 18 30 8 52 10C76 8 112 16 108 32C106 46 84 52 60 50C34 50 16 44 14 30Z', '#FFFFFF', { w: 2.2 });
    s += line('M16 32C18 42 36 48 60 48C84 48 104 42 106 32', edge, 3, { opacity: 0.9 });
    s += part(ellD(60, 28, 15, 11), t > 0.75 ? '#E2A040' : '#FFC93D', { w: 2 });
    s += shine('M52 22C55 19 59 18 62 18C58 20 56 22 55 25Z', { opacity: 0.8 });
    return piece(120, 60, s);
  }
  // carne / galleta / pastel: del crudo al dorado y al quemado
  const [raw, gold] = kind === 'carne' ? ['#D85C5C', '#8A4A30'] : kind === 'pastel' ? ['#FBE3C2', '#E0A458'] : ['#F2D3A0', '#D9954E'];
  const c = t < 0.5 ? mix(raw, gold, t / 0.5) : mix(gold, '#3E2418', (t - 0.5) / 0.5);
  let s = face(ellD(60, 28, 44, 44 * DEPTH * 0.55), c, { w: 2.2 });
  s += face('M16 28V34C16 42 36 48 60 48C84 48 104 42 104 34V28C104 38 84 44 60 44C36 44 16 38 16 28Z', tone(c, -0.6), { w: 1.8 });
  if (kind === 'galleta') [[44, 24], [62, 20], [76, 28], [54, 32]].forEach(([x, y]) => { s += Cir(x, y, 3, { fill: '#5A3324', 'data-r': 'flat' }); });
  s += shine('M30 22C38 16 50 14 60 14C48 18 38 20 34 26Z', { opacity: 0.45 });
  return piece(120, 60, s);
}

// La base del plato para decorar.
export function dishBaseSvg(kind) {
  let s = Ell(80, 96, 72, 7, { fill: '#2A1C24', opacity: 0.14, 'data-r': 'tone' });
  s += face(ellD(80, 72, 76, 24), '#FFFFFF', { w: 2.2 }) + line(ellD(80, 72, 58, 17), '#D7E9F2', 2.2);
  switch (kind) {
    case 'panqueque':
      [0, 1, 2].forEach((k) => { s += face(ellD(80, 66 - k * 9, 46, 13), '#E0A458', { w: 2 }) + flat(ellD(80, 63 - k * 9, 40, 9), '#EDB86A'); });
      s += part('M64 42C64 36 96 36 96 42C96 48 86 50 80 54C74 50 64 48 64 42Z', '#FFE08A', { w: 1.6 });
      break;
    case 'arepa': s += face(ellD(80, 62, 46, 15), '#E2B35A', { w: 2 }) + flat(ellD(80, 58, 38, 9), '#EFC777') + [[66, 56], [86, 60], [96, 54]].map(([x, y]) => Ell(x, y, 4, 2, { fill: '#B57D3A', opacity: 0.6, 'data-r': 'tone' })).join(''); break;
    case 'huevo': s += face('M40 62C38 50 60 44 82 46C108 46 124 54 120 64C118 74 100 78 80 78C58 78 42 72 40 62Z', '#FFFFFF', { w: 2 }) + part(ellD(82, 58, 14, 10), '#FFC93D', { w: 1.8 }); break;
    case 'onigiri': s += part('M80 26C92 26 112 60 112 70C112 78 100 80 80 80C60 80 48 78 48 70C48 60 68 26 80 26Z', '#FFFFFF', { w: 2.2 }); break;
    case 'pasta':
      s += part('M36 66C36 50 56 42 80 42C104 42 124 50 124 66C124 74 104 78 80 78C56 78 36 74 36 66Z', '#F7D27A', { w: 2 });
      s += line('M44 62Q60 50 76 62T108 60M50 70Q66 58 82 70T116 66M58 52Q74 44 92 52', '#E2B85A', 1.6);
      s += part(ellD(80, 54, 22, 9), '#E8505E', { w: 1.6 });
      break;
    case 'tortilla': s += face(ellD(80, 64, 52, 18), '#F2D79A', { w: 2 }) + part('M48 60C56 48 104 48 112 60C104 66 56 66 48 60Z', '#8A4A30', { w: 1.6 }); break;
    case 'ramen':
      s += face('M30 54C30 80 54 92 80 92C106 92 130 80 130 54Z', '#FFFFFF', { w: 2.2 }) + face(ellD(80, 54, 50, 14), '#F7F1E8', { w: 2 });
      s += flat(ellD(80, 56, 44, 10), '#E9B46A') + line('M48 56Q64 48 80 56T112 54', '#FFE08A', 2.4) + part(ellD(98, 54, 9, 6), '#FFFFFF', { w: 1.4 }) + flat(ellD(98, 54, 4, 3), '#FFC93D');
      break;
    case 'torta':
      s += face(rr(44, 40, 72, 34, 6), '#FBE3C2', { w: 2.2 }) + face(ellD(80, 40, 36, 10), '#FFF4F7', { w: 2 });
      s += flat('M44 48Q52 56 60 48Q68 56 76 48Q84 56 92 48Q100 56 108 48Q112 54 116 48V44H44Z', '#FFF4F7');
      s += line('M46 60H114', '#F4A7B9', 3);
      break;
    default: break;
  }
  return piece(160, 104, s);
}

// granito de azúcar
function R0(x, y) { return flat(rr(x - 1.5, y - 1.5, 3, 3, 0.6), '#FFFFFF'); }

export function ingredientSvg(id) {
  const ing = INGREDIENTS[id];
  return piece(64, 64, ing ? ing.draw() : '');
}

// Para el laboratorio (/arte?set=cocina).
export function KITCHEN_ART_SET() {
  const c = (name, markup, w, h) => ({ name, markup, w, h });
  return [
    c('Mesón', counterSvg(), 360, 300),
    c('Tabla', boardSvg(), 200, 112),
    c('Tazón', bowlSvg('#F6E3B4'), 200, 136),
    c('Olla', potSvg('#F2B05E'), 200, 166),
    c('Sartén', panSvg(), 240, 110),
    c('Fogón', stoveSvg(), 200, 58),
    c('Llama', flameSvg(), 100, 100),
    c('Horno', ovenSvg(), 200, 184),
    c('Plato', plateSvg(), 200, 90),
    c('Cuchillo', knifeSvg(), 52, 132),
    c('Cuchara', spoonSvg(), 44, 140),
    c('Panqueque crudo', pancakeSvg(0), 120, 60),
    c('Panqueque dorado', pancakeSvg(0.5), 120, 60),
    c('Panqueque quemado', pancakeSvg(1), 120, 60),
    c('Masa', doughSvg(), 120, 92),
    c('Plato tapado', clocheSvg(), 120, 92),
    ...Object.entries(INGREDIENTS).map(([id, ing]) => c(ing.name, ingredientSvg(id), 64, 64)),
    ...['huevo', 'carne', 'galleta', 'pastel'].flatMap((k) => [0.1, 0.5, 0.95].map((d) => c(`${k} ${d}`, cookItemSvg(k, d), 120, 60))),
    ...['panqueque', 'arepa', 'huevo', 'onigiri', 'pasta', 'tortilla', 'ramen', 'torta'].map((k) => c(`base ${k}`, dishBaseSvg(k), 160, 104)),
  ];
}
