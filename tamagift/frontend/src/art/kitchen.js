// ─────────────────────────────────────────────────────────────────
// Arte de la Cocina: el mesón con su pared, los utensilios, los
// ingredientes y los platos, en la misma vista 3/4 del cuarto (frente +
// tapa, lo redondo apoyado es una elipse el doble de ancha que alta, luz
// de arriba a la izquierda). Cada estilo lo redibuja con su kit.
//
// Materiales: madera con vetas onduladas y canto claro, cerámica con
// brillo redondo y labio claro, metal con franja de brillo, enlozado con
// su borde blanco. La comida, con brillos jugosos y su tono más oscuro
// abajo: que dé hambre.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, Cir, Ell, piece, G, INK, DEPTH } from './room/draw.js';
import { starPath, flowerPath, utensilRail } from './minigames.js';

const SH = '#2A1C24';
const metal = '#C9CED8';
const f1 = (v) => +v.toFixed(1);
const shadow = (cx, cy, rx, ry, o = 0.16) => Ell(cx, cy, rx, ry, { fill: SH, opacity: o, 'data-r': 'tone' });
// vetas de madera: líneas onduladas de un tono más oscuro
function grain(x0, y0, w, h, c, n = 3, o = 0.5) {
  let d = '';
  for (let k = 0; k < n; k++) {
    const y = y0 + ((k + 0.5) * h) / n;
    const a = (k % 2 ? 1 : -1) * Math.min(3, h / n / 3);
    d += `M${f1(x0 + w * 0.04)} ${f1(y)}C${f1(x0 + w * 0.3)} ${f1(y + a)} ${f1(x0 + w * 0.45)} ${f1(y - a)} ${f1(x0 + w * 0.62)} ${f1(y + a * 0.4)}S${f1(x0 + w * 0.88)} ${f1(y - a)} ${f1(x0 + w * 0.96)} ${f1(y)}`;
  }
  return line(d, tone(c, -0.8), 1.4, { opacity: o });
}

// ── Mesón ─────────────────────────────────────────────────────────
// Pared con azulejos, ventana con cortinita y una maceta, barra de
// utensilios, una repisa a la derecha (ahí se sienta la mochi), mesada de
// mármol claro con canto de madera y muebles verde menta con tiradores.
export function counterSvg(w = 360, h = 342) {
  const top = Math.round(h * 0.585);
  const front = top + 88;
  let s = flat(`M0 0H${w}V${top}H0Z`, '#FBF1E6');
  // azulejos del salpicadero, trabados
  const tY = top - 70;
  s += flat(`M0 ${tY}H${w}V${top}H0Z`, '#C3DDD4');
  for (let y = tY + 1, r = 0; y < top; y += 13, r++) {
    for (let x = r % 2 ? -13 : 0; x < w; x += 26) s += flat(rr(x + 1, y, 24, 11, 2), r % 3 === 1 ? '#E4F3EE' : '#DCEFE8');
  }
  s += face(`M-4 ${tY - 6}H${w + 4}V${tY}H-4Z`, '#E3B98C', { w: 1.8 });
  // ventana con cortinita y maceta
  s += face(rr(18, 16, 112, 92, 4), '#FFFFFF', { w: 2.2 });
  s += flat(rr(24, 22, 100, 80, 2), '#BFE6F8');
  s += flat('M24 74Q50 62 74 72T124 66V102H24Z', '#9ED37E');
  s += flat('M24 86Q60 78 90 86T124 84V102H24Z', '#86C76A');
  s += flat('M34 40C32 34 40 30 44 34C46 28 56 28 58 35C64 33 68 38 64 42Z', '#FFFFFF');
  s += line('M74 23V101M25 62H123', '#FFFFFF', 3.4);
  let val = 'M14 12H134V24';
  for (let k = 0; k < 6; k++) val += `Q${f1(134 - k * 20 - 10)} 34 ${f1(134 - (k + 1) * 20)} 24`;
  s += part(`${val}V12Z`, '#F7A6B9', { w: 1.8 });
  s += line('M18 18H130', '#FFFFFF', 2, { opacity: 0.6 });
  s += face(rr(12, 106, 124, 8, 2), '#F2E6D8', { w: 1.8 });
  s += face('M94 106L96 92H114L116 106Z', '#E6845E', { w: 1.6 });
  s += part('M98 92C96 82 100 76 104 74C104 80 106 84 105 92Z', '#6DBE5E', { w: 1.2 }) + part('M104 92C104 80 110 74 116 74C114 82 111 88 110 92Z', '#5FAE52', { w: 1.2 });
  // barra con utensilios colgados
  s += utensilRail(150, 34);
  // repisa de la derecha con frascos (la mochi se sienta al lado)
  const shY = 99;
  s += face(rr(234, shY, 124, 8, 2), '#D9A06E', { w: 1.8 });
  s += shade(`M234 ${shY + 8}H358V${shY + 14}H234Z`, SH, 0.1);
  [[244, 114], [346, 114]].forEach(([x, y]) => { s += part(`M${x - 3} ${shY + 8}H${x + 3}V${y}L${x - 3} ${shY + 8}Z`, '#B9784A', { w: 1.2 }); });
  [[244, 20, '#FFC94D'], [259, 26, '#F27A9A']].forEach(([x, hh, c]) => {
    s += part(rr(x - 7, shY - hh, 14, hh, 4), mix(c, '#FFFFFF', 0.5), { w: 1.6 });
    s += flat(rr(x - 5, shY - hh * 0.6, 10, hh * 0.6 - 2, 3), c);
    s += part(rr(x - 8, shY - hh - 4, 16, 5, 2), tone(c, -0.4), { w: 1.4 });
    s += flat(`M${x - 4} ${shY - hh + 3}h2v${hh - 8}h-2Z`, '#FFFFFF', { opacity: 0.8 });
  });
  // mesada: tapa de mármol claro con vetas, canto de madera
  s += face(`M-4 ${top}H${w + 4}V${front}H-4Z`, '#F6EFE6', { w: 2.2 });
  s += shade(`M0 ${top}H${w}V${top + 7}H0Z`, SH, 0.1);
  s += line(`M30 ${top + 30}C70 ${top + 24} 96 ${top + 44} 140 ${top + 38}M210 ${top + 58}C250 ${top + 50} 280 ${top + 66} 330 ${top + 60}M120 ${top + 72}C150 ${top + 68} 170 ${top + 78} 196 ${top + 74}`, '#D9CCD8', 1.6, { opacity: 0.7 });
  s += face(`M-4 ${front}H${w + 4}V${front + 9}H-4Z`, '#E3B98C', { w: 2 });
  s += line(`M0 ${front + 2.5}H${w}`, '#F2D2AA', 1.6);
  // muebles de abajo con puertas y tiradores
  s += face(`M-4 ${front + 9}H${w + 4}V${h + 4}H-4Z`, '#A8D5C6', { w: 2.2 });
  const doors = 3;
  for (let k = 0; k < doors; k++) {
    const dw = w / doors;
    s += face(rr(k * dw + 8, front + 16, dw - 16, h - front - 10, 4), '#B9DFD2', { w: 1.6 });
    s += part(rr(k * dw + dw / 2 - 12, front + 22, 24, 5, 2.5), '#E8C46A', { w: 1.3 });
  }
  return piece(w, h, s);
}

// ── Utensilios ────────────────────────────────────────────────────
// Tabla de picar: tapa con vetas y canaleta, canto más oscuro y el mango
// con su agujero (por el agujero se ve el mesón).
export function boardSvg() {
  const c = '#E3B27A', m = mat(c);
  let s = shadow(98, 102, 92, 8);
  s += face(rr(6, 34, 166, 64, 14), m.side, { w: 2.2 });
  s += face(rr(170, 46, 26, 34, 11), m.side, { w: 2 });
  s += face(rr(6, 26, 166, 64, 14), m.top, { w: 2.4 });
  s += face(rr(168, 38, 28, 34, 12), m.top, { w: 2.2 });
  s += face(ellD(184, 55, 5, 6), '#C9B9A8', { w: 1.6 });
  s += line(rr(16, 34, 146, 48, 9), tone(c, -0.3), 1.8, { opacity: 0.45 });
  s += grain(20, 38, 140, 42, c, 4, 0.45);
  s += flat('M18 30H120V33H18Z', '#FFFFFF', { opacity: 0.55 });
  return piece(200, 112, s);
}

// Tazón de cerámica con lunares, labio claro y lo que tenga adentro.
export function bowlSvg(fill = null) {
  const c = '#9FD3F0', m = mat(c);
  let s = shadow(100, 128, 76, 8);
  s += face('M12 52C12 100 50 126 100 126C150 126 188 100 188 52Z', c, { w: 2.4 });
  s += face(rr(66, 118, 68, 10, 5), m.side, { w: 1.8 });
  // lunares sobre la panza
  [[40, 74, 5], [70, 92, 6], [104, 100, 6], [138, 92, 6], [164, 72, 5], [56, 104, 4], [150, 108, 4]].forEach(([x, y, r]) => { s += flat(ellD(x, y, r, r * 0.8), '#FFFFFF', { opacity: 0.9 }); });
  s += face(ellD(100, 52, 88, 22), '#F4FBFF', { w: 2.4 });
  s += face(ellD(100, 54, 78, 18), tone(c, -0.5), { w: 1.6 });
  s += flat('M24 56C30 46 60 40 100 40C140 40 170 46 176 56C160 48 132 45 100 45C68 45 40 48 24 56Z', tone(c, -0.9), { opacity: 0.6 });
  if (fill) {
    s += flat(ellD(100, 58, 72, 14), fill);
    s += flat(ellD(80, 54, 30, 5), mix(fill, '#FFFFFF', 0.45), { opacity: 0.8 });
  }
  s += shine('M28 70C34 92 52 108 74 116C52 104 40 90 35 70Z', { opacity: 0.7 });
  return piece(200, 136, s);
}

// Olla enlozada roja: borde blanco, asas, franja crema con corazones.
export function potSvg(fill = null) {
  const c = '#E8505E', m = mat(c);
  let s = shadow(100, 158, 80, 8);
  // asas
  s += part('M24 70C10 70 6 76 6 82C6 88 12 90 24 88Z', '#3E3848', { w: 2 }) + part('M176 70C190 70 194 76 194 82C194 88 188 90 176 88Z', '#3E3848', { w: 2 });
  s += face('M24 52V128C24 146 60 156 100 156C140 156 176 146 176 128V52Z', c, { w: 2.4 });
  s += flat('M24 96H176V116H24Z', '#FFF1E2');
  [52, 100, 148].forEach((x) => { s += part(`M${x} 112C${x - 2} 110 ${x - 7} 107 ${x - 7} 103C${x - 7} 100 ${x - 3} 99 ${x} 102C${x + 3} 99 ${x + 7} 100 ${x + 7} 103C${x + 7} 107 ${x + 2} 110 ${x} 112Z`, '#F27A9A', { w: 1.2 }); });
  s += shade('M140 54C156 60 168 80 170 100V130C168 140 160 146 150 150C156 132 156 80 140 54Z', m.deep, 0.3);
  s += face(ellD(100, 52, 77, 21), '#FFFFFF', { w: 2.4 });
  s += face(ellD(100, 54, 68, 16), '#3B2A2E', { w: 1.6 });
  if (fill) {
    s += flat(ellD(100, 58, 64, 12), fill);
    s += flat(ellD(80, 55, 26, 4), mix(fill, '#FFFFFF', 0.4), { opacity: 0.8 });
  }
  s += shine('M36 66V124C36 136 44 142 52 146C44 136 44 124 44 66Z', { opacity: 0.55 });
  return piece(200, 166, s);
}

// Sartén de hierro con mango de madera y collar de metal.
export function panSvg() {
  let s = shadow(100, 104, 88, 7);
  s += face('M180 56L196 52L198 62L184 68Z', metal, { w: 1.8 });
  s += face('M194 52L234 42C238 41 240 44 239 48L238 52C237 55 235 56 232 57L198 62Z', '#8A5A3C', { w: 2 });
  s += line('M204 54L230 47', '#B98760', 1.6, { opacity: 0.7 });
  s += face('M10 58C10 84 50 100 96 100C142 100 182 84 182 58Z', '#4A4652', { w: 2.4 });
  s += face(ellD(96, 58, 86, 21), '#6A6676', { w: 2.4 });
  s += face(ellD(96, 60, 76, 16), '#2E2B35', { w: 1.6 });
  s += line(ellD(96, 61, 54, 10), '#45414F', 2, { opacity: 0.7 });
  s += shine('M26 64C34 80 54 90 76 94C56 86 40 78 32 64Z', { opacity: 0.35 });
  return piece(240, 110, s);
}

// Hornalla a gas: base de acero, quemador y parrilla, dos perillas.
export function stoveSvg() {
  let s = shadow(100, 52, 92, 6, 0.12);
  s += face(rr(4, 22, 192, 28, 8), '#BFC4CF', { w: 2 });
  s += face(rr(4, 16, 192, 28, 8), '#E1E4EB', { w: 2.2 });
  s += flat('M12 19H160V21H12Z', '#FFFFFF', { opacity: 0.8 });
  s += face(ellD(100, 28, 46, 9), '#4A4652', { w: 1.8 });
  s += line(ellD(100, 28, 32, 6), '#8A8696', 2.6);
  // parrilla: cuatro patas sobre el quemador
  s += line('M58 28H142M100 18V38M70 21L130 35M130 21L70 35', '#2E2B35', 3);
  [26, 174].forEach((x) => {
    s += face(ellD(x, 34, 10, 6.5), '#FFFFFF', { w: 1.8 });
    s += face(rr(x - 2, 27, 4, 7, 1.5), '#9AA0AC', { w: 1.2 });
  });
  return piece(200, 58, s);
}

// Llama del fogón (tamaño 0..1).
export function flameSvg() {
  let s = part('M50 96C26 96 18 78 26 62C30 54 36 50 36 40C44 46 46 54 44 62C50 56 52 46 50 30C66 42 76 58 74 74C72 88 64 96 50 96Z', '#FF8A3D', { w: 2 });
  s += flat('M50 92C38 92 34 82 38 74C40 70 44 68 44 62C50 66 54 72 54 78C56 74 58 70 58 64C64 70 64 80 60 86C58 90 54 92 50 92Z', '#FFD25A');
  s += flat('M42 94C44 88 48 86 50 86C52 86 56 88 58 94Z', '#7FC8F8', { opacity: 0.9 });
  return piece(100, 100, s);
}

// Horno retro: panel con perillas y relojito, ventana con luz cálida,
// rejilla con la bandeja y manija cromada.
export function ovenSvg(trayFill = '#F6D9A6') {
  let s = shadow(100, 178, 90, 6, 0.14);
  [24, 176].forEach((x) => { s += part(rr(x - 8, 168, 16, 10, 3), '#9AA0AC', { w: 1.6 }); });
  s += face(rr(8, 10, 184, 162, 14), '#F7EFE4', { w: 2.4 });
  s += face(rr(8, 10, 184, 30, 14), '#E9DDCE', { w: 2 });
  s += flat('M16 13H170V16H16Z', '#FFFFFF', { opacity: 0.8 });
  [36, 62, 138, 164].forEach((x) => { s += face(ellD(x, 25, 7.5, 6.5), '#FFFFFF', { w: 1.6 }) + line(`M${x} 25L${x + 3} 21`, INK, 1.6); });
  s += face(rr(84, 18, 32, 14, 3), '#3E3848', { w: 1.6 });
  s += flat('M90 23h4v4h-4ZM96 23h4v4h-4ZM104 23h4v4h-4Z', '#FFB45E');
  s += face(rr(62, 46, 76, 7, 3.5), metal, { w: 1.6 }) + flat('M66 47H118V49H66Z', '#FFFFFF', { opacity: 0.8 });
  s += face(rr(24, 58, 152, 100, 12), '#5A5266', { w: 2.2 });
  s += flat(rr(32, 66, 136, 84, 8), '#FFB45E', { opacity: 0.6 });
  s += flat(rr(32, 66, 136, 30, 8), '#FFD08A', { opacity: 0.5 });
  s += line('M36 92H164', '#8C8496', 2.2);
  s += face(rr(46, 116, 108, 9, 3), '#9AA0AC', { w: 1.6 });
  [62, 86, 110, 134].forEach((x) => { s += face(ellD(x + 6, 112, 9.5, 5.5), trayFill, { w: 1.4 }) + flat(ellD(x + 4, 110.5, 4, 1.8), mix(trayFill, '#FFFFFF', 0.45)); });
  s += shine('M38 70H72L52 88H38Z', { opacity: 0.35 });
  return piece(200, 184, s);
}

export function plateSvg() {
  let s = shadow(100, 82, 88, 8, 0.14);
  s += face(ellD(100, 52, 92, 28), '#FFFFFF', { w: 2.4 });
  s += flat(ellD(100, 55, 66, 18), '#EEF4F8');
  s += line(ellD(100, 52, 80, 23), '#9FD3F0', 2.4, { opacity: 0.8 });
  s += flat('M30 44C44 34 70 30 96 30C74 34 52 38 38 48Z', '#FFFFFF');
  return piece(200, 90, s);
}

export function knifeSvg() {
  let s = face('M22 6C34 10 38 30 36 70H16V10C16 7 19 5 22 6Z', '#E9EDF3', { w: 2.2 });
  s += flat('M28 12C33 22 34 40 33 66H29C30 40 30 24 28 12Z', '#C9CED8');
  s += line('M21 14V64', '#FFFFFF', 2, { opacity: 0.85 });
  s += face(rr(12, 68, 28, 8, 3), '#6E6680', { w: 2 });
  s += face(rr(16, 74, 20, 52, 7), '#8B5A3C', { w: 2.2 });
  s += line('M22 80C24 92 22 104 24 120', '#A87250', 1.4, { opacity: 0.7 });
  s += Cir(26, 90, 2.4, { fill: metal, 'data-r': 'flat' }) + Cir(26, 108, 2.4, { fill: metal, 'data-r': 'flat' });
  return piece(52, 132, s);
}

export function spoonSvg() {
  let s = face(rr(17, 40, 10, 96, 5), '#D9A06E', { w: 2 });
  s += line('M20 50C22 70 20 96 22 128', '#B9784A', 1.4, { opacity: 0.6 });
  s += face(ellD(22, 24, 15, 20), '#E7B98E', { w: 2.2 });
  s += flat(ellD(22, 25, 9.5, 13.5), '#C98E5A');
  s += flat(ellD(18, 18, 3, 5), '#F4D2AE');
  return piece(44, 140, s);
}

// Panqueque (o arepa) según qué tan dorado está: 0 crudo, 0.5 en su
// punto, 1 quemado. Burbujitas cuando se cocina, tostado en el borde.
export function pancakeSvg(done = 0, kind = 'panqueque') {
  const arepa = kind === 'arepa';
  const raw = arepa ? '#F4E3A8' : '#F6E3B4';
  const gold = arepa ? '#E2B35A' : '#E0A458';
  const burnt = '#6B3E26';
  const t = Math.max(0, Math.min(1, done));
  const c = t < 0.5 ? mix(raw, gold, t / 0.5) : mix(gold, burnt, (t - 0.5) / 0.5);
  const th = arepa ? 10 : 7;
  let s = face(`M8 30V${30 + th}C8 ${42 + th} 32 ${50 + th} 60 ${50 + th}C88 ${50 + th} 112 ${42 + th} 112 ${30 + th}V30Z`, tone(c, -0.5), { w: 1.8 });
  s += face(ellD(60, 30, 52, 17), c, { w: 2.2 });
  s += flat(ellD(60, 31, 40, 11), mix(c, raw, 0.35), { opacity: t < 0.6 ? 0.8 : 0.3 });
  if (t > 0.15 && t < 0.7) [[40, 26], [62, 22], [80, 32], [50, 35], [72, 28]].forEach(([x, y]) => { s += flat(ellD(x, y, 2.6, 1.6), tone(c, -0.7)); });
  if (t >= 0.5) [[34, 30], [86, 26], [64, 38]].forEach(([x, y]) => { s += flat(ellD(x, y, 5, 2.4), tone(c, -1), { opacity: 0.5 + (t - 0.5) }); });
  s += shine('M24 22C34 16 48 14 60 14C46 18 34 20 28 26Z', { opacity: 0.5 });
  return piece(120, 60, s);
}

// Masa: bollo mullido con un pliegue y polvito de harina.
export function doughSvg(color = '#F4E3A8') {
  let s = shadow(60, 84, 46, 6, 0.14);
  s += part('M14 70C10 46 30 26 60 26C90 26 110 46 106 70C104 82 84 86 60 86C36 86 16 82 14 70Z', color, { w: 2.4 });
  s += line('M40 56C50 62 66 62 76 54', tone(color, -0.7), 1.8, { opacity: 0.7 });
  s += flat('M18 76C30 82 46 84 60 84C76 84 94 82 102 74C98 80 82 84 60 84C38 84 22 82 18 76Z', tone(color, -0.5), { opacity: 0.7 });
  [[30, 44], [84, 40], [70, 70], [44, 72], [92, 60]].forEach(([x, y]) => { s += flat(`M${x} ${y}h3v3h-3Z`, '#FFFFFF', { opacity: 0.85 }); });
  s += shine('M28 44C34 34 46 30 56 30C46 34 38 40 34 48Z', { opacity: 0.6 });
  return piece(120, 92, s);
}

// Plato tapado (por si una comida no tiene dibujo propio).
export function clocheSvg() {
  let s = shadow(60, 84, 54, 6, 0.14);
  s += face(ellD(60, 76, 56, 10), '#FFFFFF', { w: 2.2 });
  s += face('M12 74C12 44 34 26 60 26C86 26 108 44 108 74Z', metal, { w: 2.4 });
  s += flat('M14 70H106V74H14Z', '#A9AFBC');
  s += face(ellD(60, 22, 8, 5), '#9AA0AC', { w: 2 });
  s += shine('M26 64C28 48 40 36 54 32C42 40 34 50 32 64Z', { opacity: 0.7 });
  return piece(120, 92, s);
}

export function sparkleSvg(color = '#FFE37A') {
  return piece(40, 40, part(starPath(20, 20, 18, 6, 4, -90), color, { w: 1.6 }));
}

// ── Ingredientes (64×64) ──────────────────────────────────────────
// Los que se pican (lechuga, tomate, zanahoria, papa, cebolla, rollo)
// van más anchos que altos: se cortan en rodajas a lo ancho.
const sh = (rx = 18) => shadow(32, 58, rx, 3.4);
const gl = (d, o = 0.8) => shine(d, { opacity: o });

export const INGREDIENTS = {
  lechuga: {
    name: 'Lechuga',
    draw: () => {
      let s = sh(22);
      s += part('M8 40C4 28 12 16 22 16C26 10 38 10 42 16C52 16 60 28 56 40C54 50 44 56 32 56C20 56 10 50 8 40Z', '#5FAE52', { w: 2.2 });
      s += part('M14 40C12 30 18 22 26 22C30 18 36 18 40 22C48 22 52 32 50 40C48 48 40 52 32 52C24 52 16 48 14 40Z', '#8ED07A', { w: 1.8 });
      s += part('M22 38C22 30 26 26 32 26C38 26 42 30 42 38C42 44 38 48 32 48C26 48 22 44 22 38Z', '#C6EBA4', { w: 1.6 });
      s += line('M32 30V48M32 38L26 34M32 42L38 37M18 34C20 40 22 44 26 48M46 34C44 40 42 44 38 48', '#5FA250', 1.4, { opacity: 0.8 });
      s += line('M12 30C14 26 16 24 20 22M44 18C48 20 50 22 52 26', '#B8E59A', 1.8, { opacity: 0.8 });
      return s + gl('M16 30C18 24 22 20 27 19C23 23 20 26 19 32Z', 0.55);
    },
  },
  tomate: {
    name: 'Tomate',
    draw: () => {
      let s = sh(20);
      s += part('M10 36C10 25 19 18 32 18C45 18 54 25 54 36C54 48 45 56 32 56C19 56 10 48 10 36Z', '#E8505E', { w: 2.2 });
      s += shade('M44 22C51 27 54 34 52 42C50 50 44 54 36 55C44 50 48 42 48 34C48 30 46 26 44 22Z', '#9E2238', 0.35);
      s += line('M24 21C22 28 22 34 24 40M40 21C42 28 42 34 40 40', '#C93A4C', 1.4, { opacity: 0.5 });
      s += part('M32 22L25 18L28 24L20 25L28 28L30 33L33 28L42 27L36 23L39 17Z', '#5FAE52', { w: 1.4 });
      s += part(rr(31, 13, 3, 7, 1.2), '#4E9A4A', { w: 1 });
      return s + gl('M16 32C17 26 22 22 28 21C24 25 20 28 19 34Z') + flat(ellD(44, 32, 2, 3), '#FFFFFF', { opacity: 0.6 });
    },
  },
  pepino: {
    name: 'Pepino',
    draw: () => {
      let s = sh(24);
      s += part('M6 38C6 30 12 26 22 26H44C54 26 60 30 60 38C60 46 54 50 44 50H22C12 50 6 46 6 38Z', '#4E9A5A', { w: 2.2 });
      s += flat('M10 34C14 30 18 30 22 30H44C50 30 54 31 56 34C50 33 44 33 22 33C16 33 12 33 10 34Z', '#7CC27E');
      s += line('M14 40H54M18 45H50', '#3E7E4A', 1.4, { opacity: 0.6 });
      [[18, 36], [28, 41], [38, 36], [48, 41], [24, 46], [44, 46]].forEach(([x, y]) => { s += flat(`M${x} ${y}h2.4v2.4h-2.4Z`, '#B8E59A'); });
      s += part(ellD(58, 38, 3, 6), '#B8E59A', { w: 1.2 });
      return s + gl('M14 31C20 28 30 28 40 28C30 30 22 30 16 33Z', 0.5);
    },
  },
  huevo: {
    name: 'Huevo',
    draw: () => {
      let s = sh(16);
      s += part('M32 10C44 10 52 30 52 40C52 50 44 56 32 56C20 56 12 50 12 40C12 30 20 10 32 10Z', '#FFF3E2', { w: 2.2 });
      s += shade('M42 18C48 26 52 36 50 44C48 52 42 55 34 56C42 50 46 42 46 34C46 28 44 22 42 18Z', '#C9A98A', 0.3);
      [[38, 30], [26, 46], [42, 44]].forEach(([x, y]) => { s += flat(`M${x} ${y}h2v2h-2Z`, '#E2CDB5'); });
      return s + gl('M20 30C22 22 26 16 31 14C27 20 24 26 24 32Z');
    },
  },
  harina: { name: 'Harina', draw: () => sackSvgPart('#F4EEE6', '#7FC8F8', 'trigo') },
  harinaMaiz: { name: 'Harina de maíz', draw: () => sackSvgPart('#FFE08A', '#E8505E', 'maiz') },
  leche: {
    name: 'Leche',
    draw: () => {
      let s = sh(16);
      s += part('M18 24L24 14H40L46 24V54C46 55.5 45 56 44 56H20C19 56 18 55.5 18 54Z', '#FFFFFF', { w: 2.2 });
      s += part('M24 14L32 5L40 14Z', '#DCEFFB', { w: 1.6 });
      s += part(rr(29, 2, 6, 5, 1.5), '#7FC8F8', { w: 1.2 });
      s += flat('M18 30H46V44H18Z', '#7FC8F8');
      s += flat('M32 31C35 35 37 37.5 37 40C37 42.8 34.8 44.6 32 44.6C29.2 44.6 27 42.8 27 40C27 37.5 29 35 32 31Z', '#FFFFFF');
      s += shade('M38 24H46V54C46 55.5 45 56 44 56H38Z', '#7FA8C8', 0.25);
      return s + flat('M21 26h2.5v22h-2.5Z', '#FFFFFF', { opacity: 0.7 });
    },
  },
  agua: {
    name: 'Agua',
    draw: () => {
      let s = sh(14);
      s += part('M22 16H42V20C48 26 48 50 42 55C41 56 40 56 39 56H25C24 56 23 56 22 55C16 50 16 26 22 20Z', '#D9F2FF', { w: 2.2 });
      s += flat('M18.6 32H45.4C46 40 45.6 48 42 53C41 54 40 54.4 39 54.4H25C24 54.4 23 54 22 53C18.4 48 18 40 18.6 32Z', '#8CCBF0', { opacity: 0.85 });
      s += flat('M20 38H44', '#FFFFFF');
      s += part(rr(22, 9, 20, 8, 2), '#4FA6E6', { w: 1.6 });
      s += line('M25 10V16M29 10V16M33 10V16M37 10V16', '#3E8CC2', 1.2, { opacity: 0.8 });
      s += flat('M22 22h3v28h-3Z', '#FFFFFF', { opacity: 0.7 }) + flat('M38 28h2v18h-2Z', '#FFFFFF', { opacity: 0.5 });
      return s;
    },
  },
  queso: {
    name: 'Queso',
    draw: () => {
      let s = sh(24);
      s += part('M6 40L44 22L58 32V48L18 56L6 50Z', '#F2B83E', { w: 2.2 });
      s += part('M6 40L44 22L58 32L18 46Z', '#FFE08A', { w: 1.8 });
      s += flat('M18 46L58 32V48L18 56Z', '#F7C94F');
      [[26, 50, 3, 2.4], [44, 46, 2.6, 2], [36, 34, 3, 1.5], [22, 40, 2.2, 1.1], [50, 33, 2, 1]].forEach(([x, y, rx, ry]) => { s += flat(ellD(x, y, rx, ry), '#D9952A'); });
      return s + flat('M12 40L42 26L44 27L14 41Z', '#FFF6CE', { opacity: 0.9 });
    },
  },
  zanahoria: {
    name: 'Zanahoria',
    draw: () => {
      let s = sh(24);
      // hojas (a la izquierda, donde está el hombro de la raíz)
      s += part('M14 30C8 22 6 14 10 10C12 16 14 22 18 28Z', '#5FAE52', { w: 1.4 });
      s += part('M16 28C14 18 16 10 22 8C20 16 20 22 21 28Z', '#6DBE5E', { w: 1.4 });
      s += part('M18 30C22 20 28 16 34 16C28 20 25 25 23 31Z', '#5FAE52', { w: 1.4 });
      // la raíz: ancha en el hombro, se afina hasta la punta (a la derecha)
      s += part('M14 34C14 28 20 26 26 27C36 28 50 32 58 36C60 37 60 39 58 40C50 44 36 48 26 49C20 50 14 46 14 40Z', '#F59A3C', { w: 2.2 });
      s += flat('M16 33C18 30 22 29 26 29.5C36 30.5 48 33.6 55 36.4C46 35 36 34 26 34C22 34 18 34 16 33Z', '#FFC27A');
      s += line('M26 31C27 36 27 42 26 47M35 32C36 36 36 41 35 45M44 34C45 37 45 40 44 43M51 36C52 37.5 52 39 51 40.5', '#D06A1E', 1.4, { opacity: 0.6 });
      return s + flat(ellD(16, 37, 2.4, 4), '#E07E2A');
    },
  },
  papa: {
    name: 'Papa',
    draw: () => {
      let s = sh(22);
      s += part('M10 38C8 28 16 20 28 20C36 20 42 18 48 22C56 26 58 36 54 44C50 52 40 54 30 54C18 54 12 48 10 38Z', '#D9B07A', { w: 2.2 });
      s += shade('M46 26C52 30 54 38 51 44C48 50 42 52 34 53C42 48 46 42 47 36C47 32 47 29 46 26Z', '#8A6236', 0.3);
      [[22, 30], [40, 28], [34, 44], [48, 38]].forEach(([x, y]) => { s += line(`M${x - 2} ${y}Q${x} ${y + 2} ${x + 2} ${y}`, '#8A6236', 1.6); });
      [[28, 38], [18, 42], [44, 46], [32, 26]].forEach(([x, y]) => { s += flat(`M${x} ${y}h2v2h-2Z`, '#B98A54'); });
      return s + gl('M16 32C18 26 24 22 30 21C24 25 20 29 19 34Z', 0.5);
    },
  },
  cebolla: {
    name: 'Cebolla',
    draw: () => {
      let s = sh(20);
      s += part('M32 14C40 22 54 28 54 40C54 50 44 56 32 56C20 56 10 50 10 40C10 28 24 22 32 14Z', '#D99AD6', { w: 2.2 });
      s += line('M32 18C30 30 30 44 32 55M24 24C18 32 18 46 24 54M40 24C46 32 46 46 40 54', '#B070B8', 1.4, { opacity: 0.8 });
      s += part('M30 16L32 4L34 16Z', '#8FCB7A', { w: 1.2 }) + part('M33 15L38 6L36 16Z', '#7CBF68', { w: 1.2 });
      s += line('M28 56L26 60M32 56V61M36 56L38 60', '#C9A98A', 1.4);
      return s + gl('M16 36C17 30 21 26 26 24C22 28 20 32 19 38Z', 0.6);
    },
  },
  arroz: {
    name: 'Arroz',
    draw: () => {
      let s = sh(20);
      s += part('M10 34C10 48 20 56 32 56C44 56 54 48 54 34Z', '#7FC8F8', { w: 2.2 });
      s += line('M14 42C20 46 26 47 32 47C38 47 44 46 50 42', '#FFFFFF', 2, { opacity: 0.8 });
      s += part('M14 34C14 22 22 16 32 16C42 16 50 22 50 34Z', '#FFFFFF', { w: 1.8 });
      s += face(ellD(32, 34, 23, 6), '#F4FBFF', { w: 1.8 });
      [[24, 24], [32, 21], [40, 25], [28, 29], [36, 29], [20, 30], [44, 31]].forEach(([x, y]) => { s += flat(ellD(x, y, 2.2, 1.2), '#E2DDD4'); });
      return s;
    },
  },
  alga: {
    name: 'Alga nori',
    draw: () => {
      let s = sh(22);
      s += part('M10 20L50 14L56 48L16 54Z', '#2F5A3E', { w: 2.2 });
      s += line('M18 22L22 50M28 20L32 50M38 18L42 48M48 16L52 46', '#3E7A52', 1.4, { opacity: 0.7 });
      return s + flat('M14 22L48 17L49 20L15 25Z', '#5E9A72', { opacity: 0.8 });
    },
  },
  salmon: {
    name: 'Salmón',
    draw: () => {
      let s = sh(24);
      s += part('M6 40C8 28 26 20 44 22C54 24 58 32 56 40C54 48 40 52 26 50C14 48 6 46 6 40Z', '#FF9A6B', { w: 2.2 });
      s += line('M16 30C20 36 22 42 22 48M26 25C30 32 32 40 32 50M36 23C40 30 42 40 42 49M46 25C49 30 50 38 50 45', '#FFD9C4', 2.4);
      s += flat('M8 42C14 47 26 50 40 49C48 48 54 45 56 40C55 46 48 50 38 51C24 52 12 49 8 42Z', '#C96A5A');
      return s + gl('M14 30C20 25 28 23 36 23C28 26 20 28 16 32Z', 0.5);
    },
  },
  azucar: {
    name: 'Azúcar',
    draw: () => {
      let s = sh(20);
      s += part('M14 22H46V52C46 54 44 56 42 56H18C16 56 14 54 14 52Z', '#FFFFFF', { w: 2.2 });
      s += part(rr(12, 14, 36, 10, 3), '#FF9EC8', { w: 1.6 });
      s += flat(rr(18, 32, 24, 14, 3), '#FFD3E6');
      s += part(HEARTK(30, 39, 0.24), '#FF7FB4', { w: 1 });
      [[50, 50], [56, 46], [53, 54]].forEach(([x, y]) => { s += part(rr(x - 3, y - 3, 6, 6, 1), '#FFFFFF', { w: 1.2 }); });
      return s + flat('M17 26h3v22h-3Z', '#F2EEF6');
    },
  },
  mantequilla: {
    name: 'Mantequilla',
    draw: () => {
      let s = sh(24);
      s += part('M4 42L22 52L60 40L44 32Z', '#FFFFFF', { w: 1.6 });
      s += part('M10 38L38 28L52 34V44L24 54L10 48Z', '#FFE07A', { w: 2.2 });
      s += part('M10 38L38 28L52 34L24 44Z', '#FFF1B0', { w: 1.6 });
      s += part('M30 34C34 30 40 31 40 35C36 34 33 35 30 37Z', '#FFF8D8', { w: 1.2 });
      return s;
    },
  },
  chocolate: {
    name: 'Chocolate',
    draw: () => {
      let s = sh(20);
      s += part(rr(12, 12, 40, 44, 5), '#7B4A35', { w: 2.2 });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const x = 15 + c * 12.4, y = 15 + r * 13.6;
        s += flat(rr(x, y, 10.6, 11.8, 2), '#93593F') + flat(rr(x + 1, y + 1, 8, 3, 1.5), '#B07152');
      }
      s += part('M12 38L52 30V52C52 54 50 56 48 56H16C14 56 12 54 12 52Z', '#E8505E', { w: 2 });
      s += line('M12 38L52 30', '#C9CED8', 2.4);
      s += flat(rr(22, 44, 22, 6, 2), '#FFE08A');
      return s;
    },
  },
  fideos: {
    name: 'Fideos',
    draw: () => {
      // paquete transparente con los fideos largos adentro y su etiqueta
      let s = sh(20);
      s += part('M16 14H48L46 54C46 55 45 56 44 56H20C19 56 18 55 18 54Z', '#E8F4FF', { w: 2.2 });
      s += flat('M19 18H45L43.4 53H20.6Z', '#FFE08A');
      s += line('M23 18L22 53M28 18L27.6 53M33 18V53M38 18L38.4 53M43 18L42 53', '#E2B85A', 1.6);
      s += part(rr(14, 10, 36, 7, 2), '#E8505E', { w: 1.6 });
      s += part(rr(18, 30, 28, 13, 3), '#FFFFFF', { w: 1.4 });
      s += line('M24 36.5H40', '#E8505E', 2.4);
      return s + flat('M20 20h3v30h-3Z', '#FFFFFF', { opacity: 0.6 });
    },
  },
  carne: {
    name: 'Carne',
    draw: () => {
      let s = sh(24);
      s += part('M8 36C8 24 22 16 38 18C50 20 58 30 54 40C50 50 36 54 22 52C12 50 8 44 8 36Z', '#C2584E', { w: 2.2 });
      s += part('M10 38C12 46 20 50 30 51C40 52 50 48 54 42C50 52 36 56 22 54C14 52 10 46 10 38Z', '#FFE3D6', { w: 1.4 });
      s += line('M20 30C26 34 30 32 36 36M30 24C34 28 40 28 44 32M18 40C22 42 26 40 30 44', '#F2B8B0', 1.6, { opacity: 0.9 });
      s += part(ellD(44, 34, 5, 4), '#FFF6EE', { w: 1.4 });
      return s + gl('M16 28C18 24 24 20 30 19', 0.4);
    },
  },
  tortilla: {
    name: 'Tortilla',
    draw: () => {
      let s = sh(26);
      s += face('M6 38V41C6 49 18 54 32 54C46 54 58 49 58 41V38Z', '#E3C07A', { w: 1.8 });
      s += face(ellD(32, 38, 26, 13), '#F2D79A', { w: 2.2 });
      [[22, 36], [34, 42], [42, 34], [28, 31], [46, 40]].forEach(([x, y]) => { s += flat(ellD(x, y, 2.6, 1.4), '#D9A85A'); });
      return s;
    },
  },
  cebollin: {
    name: 'Cebollín',
    draw: () => {
      let s = sh(22);
      s += part('M14 50L44 10L48 12L20 52Z', '#6BBF6B', { w: 1.6 });
      s += part('M22 52L50 16L54 18L28 54Z', '#8FD37A', { w: 1.6 });
      s += part(rr(9, 44, 22, 11, 4), '#FFFFFF', { w: 1.6 });
      s += line('M9 50L5 52M9 53L5 56', '#C9B8A8', 1.4);
      return s + flat('M14 46h12v2h-12Z', '#E8F4D8');
    },
  },
  fresa: {
    name: 'Fresas',
    draw: () => {
      let s = sh(18);
      s += part('M32 56C18 48 12 36 14 26C16 18 24 16 32 18C40 16 48 18 50 26C52 36 46 48 32 56Z', '#E8505E', { w: 2.2 });
      s += shade('M44 22C49 26 50 34 47 40C44 46 40 50 34 54C40 46 44 40 45 32C45 28 45 25 44 22Z', '#9E2238', 0.35);
      s += part('M20 20C24 13 29 14 32 18C35 14 40 13 44 20C38 23 26 23 20 20Z', '#5FAE52', { w: 1.4 });
      s += part(rr(31, 10, 3, 8, 1.2), '#4E9A4A', { w: 1 });
      [[24, 30], [34, 28], [42, 32], [28, 40], [38, 40], [32, 48]].forEach(([x, y]) => { s += flat(ellD(x, y, 1.3, 1.9), '#FFE29A'); });
      return s + gl('M19 28C20 24 23 22 26 22C24 25 22 27 21 31Z', 0.7);
    },
  },
  sal: {
    name: 'Sal',
    draw: () => {
      let s = sh(14);
      s += part('M20 54V26C20 20 25 16 32 16C39 16 44 20 44 26V54C44 55 43 56 42 56H22C21 56 20 55 20 54Z', '#F4FBFF', { w: 2.2 });
      s += flat('M21 38H43V54C43 55 42 55 41 55H23C22 55 21 55 21 54Z', '#FFFFFF');
      s += part(rr(19, 10, 26, 9, 3), metal, { w: 1.6 });
      [[27, 13], [32, 12], [37, 13]].forEach(([x, y]) => { s += Cir(x, y, 1.2, { fill: INK, 'data-r': 'flat' }); });
      return s + flat('M23 24h3v26h-3Z', '#FFFFFF', { opacity: 0.8 });
    },
  },
  // rollo de sushi enrollado, listo para cortar (visto de lado)
  rollo: {
    name: 'Rollo de sushi',
    draw: () => {
      let s = sh(26);
      s += part(rr(6, 24, 52, 26, 12), '#2F5A3E', { w: 2.2 });
      s += line('M14 27V47M24 26V48M34 26V48M44 26V48', '#3E7A52', 1.2, { opacity: 0.8 });
      s += flat('M10 28C14 26 22 26 30 26H44C40 27 36 27.6 30 28Z', '#5E9A72', { opacity: 0.8 });
      s += part(ellD(52, 37, 8, 13), '#FFFFFF', { w: 1.8 });
      [[50, 31], [55, 35], [49, 42], [55, 44]].forEach(([x, y]) => { s += flat(ellD(x, y, 1.4, 0.8), '#E2DDD4'); });
      s += flat(ellD(52, 37, 3.6, 6), '#FF9A6B') + flat(ellD(53.5, 40, 1.6, 2.4), '#8FD06A');
      return s;
    },
  },
};

// corazón chico (para etiquetas)
function HEARTK(cx, cy, k) {
  return `M${cx} ${f1(cy + 16 * k)}C${f1(cx - 22 * k)} ${f1(cy + 2 * k)} ${f1(cx - 22 * k)} ${f1(cy - 20 * k)} ${cx} ${f1(cy - 12 * k)}C${f1(cx + 22 * k)} ${f1(cy - 20 * k)} ${f1(cx + 22 * k)} ${f1(cy + 2 * k)} ${cx} ${f1(cy + 16 * k)}Z`;
}
// bolsa de papel con el borde enrollado, etiqueta y un dibujito
function sackSvgPart(paper, band, kind) {
  let s = sh(18);
  s += part('M14 22C14 20 16 18 18 18H46C48 18 50 20 50 22L48 54C48 55 47 56 46 56H18C17 56 16 55 16 54Z', paper, { w: 2.2 });
  s += part(rr(12, 12, 40, 10, 3), tone(paper, -0.25), { w: 1.6 });
  s += line('M16 17H48', tone(paper, -0.6), 1.4, { opacity: 0.7 });
  s += flat(rr(20, 28, 24, 18, 3), band);
  if (kind === 'trigo') s += line('M32 44V31M32 34L28 31M32 34L36 31M32 38L28 35M32 38L36 35M32 42L28 39M32 42L36 39', '#FFFFFF', 1.6);
  else s += part('M32 31C36 31 38 35 38 39C38 43 35 45 32 45C29 45 26 43 26 39C26 35 28 31 32 31Z', '#FFE08A', { w: 1.2 }) + line('M29 36H35M28 40H36', '#E2B03E', 1.2);
  s += shade('M42 22H49L47 54C47 55 46 55.5 45 55.5H42Z', SH, 0.12);
  return s + flat('M18 24h2.5v26h-2.5Z', '#FFFFFF', { opacity: 0.6 });
}

// Lo que se está cocinando en la sartén, según qué tan hecho está
// (0 crudo, 0.5 en su punto, 1 quemado).
export function cookItemSvg(kind, done = 0) {
  if (kind === 'panqueque' || kind === 'arepa') return pancakeSvg(done, kind);
  const t = Math.max(0, Math.min(1, done));
  if (kind === 'huevo') {
    // la clara pasa de transparente a blanca, y el borde se dora
    const white = t < 0.25 ? mix('#F4F1EA', '#FFFFFF', t / 0.25) : '#FFFFFF';
    const edge = t < 0.5 ? mix('#FFFFFF', '#F2D6A8', t / 0.5) : mix('#F2D6A8', '#7A4A2A', (t - 0.5) / 0.5);
    let s = face('M14 30C10 18 30 8 52 10C76 8 112 16 108 32C106 46 84 52 60 50C34 50 16 44 14 30Z', white, { w: 2.2 });
    s += line('M16 32C18 42 36 48 60 48C84 48 104 42 106 32', edge, 3.4, { opacity: 0.9 });
    s += shade(ellD(64, 32, 20, 9), '#C9BCA8', 0.2);
    s += part(ellD(60, 27, 15, 11), t > 0.75 ? '#E2A040' : '#FFC93D', { w: 2 });
    s += flat(ellD(62, 31, 9, 4), t > 0.75 ? '#C98A30' : '#F2AE2A', { opacity: 0.7 });
    s += shine('M52 21C55 18 59 17 62 17C58 19 56 21 55 24Z', { opacity: 0.85 });
    return piece(120, 60, s);
  }
  // carne / galleta / pastel: del crudo al dorado y al quemado
  const [raw, gold] = kind === 'carne' ? ['#D85C5C', '#8A4A30'] : kind === 'pastel' ? ['#FBE3C2', '#E0A458'] : ['#F2D3A0', '#D9954E'];
  const c = t < 0.5 ? mix(raw, gold, t / 0.5) : mix(gold, '#3E2418', (t - 0.5) / 0.5);
  let s = face('M16 28V34C16 42 36 48 60 48C84 48 104 42 104 34V28Z', tone(c, -0.6), { w: 1.8 });
  s += face(ellD(60, 28, 44, 13), c, { w: 2.2 });
  if (kind === 'galleta') [[44, 24], [62, 20], [76, 28], [54, 32], [70, 34]].forEach(([x, y]) => { s += part(ellD(x, y, 3.2, 2.4), '#5A3324', { w: 1 }); });
  if (kind === 'carne') s += line('M34 24L48 34M52 20L66 32M70 22L84 32', tone(c, -1.2), 2.4, { opacity: t > 0.3 ? 0.8 : 0.2 });
  s += shine('M30 22C38 16 50 14 60 14C48 18 38 20 34 26Z', { opacity: 0.45 });
  return piece(120, 60, s);
}

// La base del plato para decorar.
export function dishBaseSvg(kind) {
  let s = shadow(80, 96, 72, 7, 0.14);
  s += face(ellD(80, 72, 76, 24), '#FFFFFF', { w: 2.2 });
  s += flat(ellD(80, 74, 58, 16), '#EEF4F8');
  s += line(ellD(80, 72, 68, 20), '#9FD3F0', 2.2, { opacity: 0.8 });
  switch (kind) {
    case 'panqueque':
      [0, 1, 2].forEach((k) => {
        const y = 68 - k * 10;
        s += face(`M34 ${y}V${y + 5}C34 ${y + 12} 56 ${y + 16} 80 ${y + 16}C104 ${y + 16} 126 ${y + 12} 126 ${y + 5}V${y}Z`, '#C98A48', { w: 1.8 });
        s += face(ellD(80, y, 46, 12), '#E0A458', { w: 1.8 }) + flat(ellD(80, y + 1, 36, 8), '#EDB86A');
      });
      s += part('M60 46C60 40 100 40 100 46C100 50 96 52 94 58C92 62 88 62 88 56C86 52 72 54 70 58C68 62 64 60 64 54C62 50 60 50 60 46Z', '#C9702E', { w: 1.6 });
      s += part(rr(72, 34, 16, 9, 2), '#FFF1B0', { w: 1.4 });
      break;
    case 'arepa':
      s += face('M34 62V68C34 76 56 82 80 82C104 82 126 76 126 68V62Z', '#C98E3E', { w: 1.8 });
      s += face(ellD(80, 62, 46, 14), '#E2B35A', { w: 2 }) + flat(ellD(80, 60, 36, 9), '#EFC777');
      [[66, 58], [86, 62], [98, 56], [74, 66]].forEach(([x, y]) => { s += flat(ellD(x, y, 4, 2), '#B57D3A', { opacity: 0.7 }); });
      break;
    case 'huevo':
      s += face('M40 64C38 52 60 46 82 48C108 48 124 56 120 66C118 76 100 80 80 80C58 80 42 74 40 64Z', '#FFFFFF', { w: 2 });
      s += line('M42 66C46 74 60 78 80 78C100 78 114 74 118 66', '#F2D6A8', 3);
      s += part(ellD(82, 60, 14, 10), '#FFC93D', { w: 1.8 }) + shine('M76 55C78 53 81 52 84 52C81 54 79 55 78 58Z', { opacity: 0.8 });
      break;
    case 'onigiri':
      s += part('M80 26C92 26 112 60 112 70C112 78 100 80 80 80C60 80 48 78 48 70C48 60 68 26 80 26Z', '#FFFFFF', { w: 2.2 });
      [[70, 50], [88, 46], [80, 62], [96, 64], [64, 66]].forEach(([x, y]) => { s += flat(ellD(x, y, 2.2, 1.2), '#E7E2DA'); });
      s += shine('M70 40C74 34 78 31 80 31C77 35 74 40 73 45Z', { opacity: 0.8 });
      break;
    case 'pasta':
      s += part('M36 66C36 50 56 42 80 42C104 42 124 50 124 66C124 74 104 78 80 78C56 78 36 74 36 66Z', '#F7D27A', { w: 2 });
      s += line('M44 62Q60 50 76 62T108 60M50 70Q66 58 82 70T116 66M58 52Q74 44 92 52', '#E2B85A', 1.8);
      s += part('M60 56C60 48 100 48 100 56C100 62 92 64 80 64C68 64 60 62 60 56Z', '#E8505E', { w: 1.6 });
      s += flat(ellD(74, 53, 6, 2), '#F58A94');
      s += part(ellD(92, 50, 4, 3), '#6DBE5E', { w: 1 });
      break;
    case 'tortilla':
      s += face(ellD(80, 64, 52, 18), '#F2D79A', { w: 2 });
      [[56, 64], [104, 62], [80, 74]].forEach(([x, y]) => { s += flat(ellD(x, y, 3, 1.6), '#D9A85A'); });
      s += part('M48 60C56 48 104 48 112 60C104 66 56 66 48 60Z', '#8A4A30', { w: 1.6 });
      s += line('M58 57L66 54M74 53L82 52M90 53L98 55', '#6E3A24', 1.6, { opacity: 0.8 });
      break;
    case 'ramen':
      s += face('M30 54C30 80 54 92 80 92C106 92 130 80 130 54Z', '#FFFFFF', { w: 2.2 });
      s += line('M36 64C46 70 60 72 80 72C100 72 114 70 124 64', '#E8505E', 2.4, { opacity: 0.8 });
      s += face(ellD(80, 54, 50, 14), '#F7F1E8', { w: 2 });
      s += flat(ellD(80, 56, 44, 10), '#E9B46A') + line('M48 56Q64 48 80 56T112 54', '#FFE08A', 2.4);
      s += part(ellD(98, 54, 9, 6), '#FFFFFF', { w: 1.4 }) + flat(ellD(98, 54, 4, 3), '#FFC93D');
      s += part('M58 52L72 46L74 50L60 56Z', '#2F5A3E', { w: 1.2 });
      break;
    case 'torta':
      s += face(rr(44, 40, 72, 34, 6), '#FBE3C2', { w: 2.2 });
      s += flat('M46 54H114V60H46Z', '#F4A7B9');
      s += face(ellD(80, 40, 36, 10), '#FFF4F7', { w: 2 });
      s += flat('M44 44Q52 52 60 44Q68 52 76 44Q84 52 92 44Q100 52 108 44Q112 50 116 44V42H44Z', '#FFF4F7');
      break;
    default: break;
  }
  return piece(160, 104, s);
}

// Lo que se pone al decorar: no el ingrediente entero sino cómo queda
// servido (una pizca de sal, cebollín picado, tomate en cubitos…).
const TOPPINGS = {
  sal: () => {
    let s = '';
    [[24, 30], [32, 26], [40, 31], [28, 38], [36, 36], [44, 39], [20, 40], [33, 44]].forEach(([x, y], k) => { s += part(rr(x - 2.6, y - 2.6, 5.2, 5.2, 1), k % 3 ? '#FFFFFF' : '#EEF4F8', { w: 1 }); });
    return s;
  },
  fresa: () => {
    let s = shadow(32, 50, 14, 3);
    s += part('M32 50C20 44 14 34 16 26C18 18 26 16 32 20C38 16 46 18 48 26C50 34 44 44 32 50Z', '#E8505E', { w: 2 });
    s += part('M32 44C24 40 21 33 22 28C23 23 28 22 32 25C36 22 41 23 42 28C43 33 40 40 32 44Z', '#FFD3DA', { w: 1.2 });
    s += flat('M32 27C30 31 30 37 32 41C34 37 34 31 32 27Z', '#FFFFFF', { opacity: 0.9 });
    [[22, 34], [42, 34], [27, 42], [37, 42]].forEach(([x, y]) => { s += flat(ellD(x, y, 1, 1.5), '#FFE29A'); });
    return s;
  },
  queso: () => {
    let s = shadow(32, 46, 16, 3);
    [[22, 38, -20], [32, 34, 15], [40, 40, -35], [28, 44, 40], [36, 46, -10], [44, 34, 30]].forEach(([x, y, a]) => {
      s += G({ transform: `rotate(${a} ${x} ${y})` }, part(rr(x - 6, y - 2, 12, 4, 2), '#FFD25A', { w: 1.1 }));
    });
    return s;
  },
  alga: () => part(rr(24, 14, 16, 38, 2), '#2F5A3E', { w: 2 }) + line('M28 16V50M33 16V50', '#3E7A52', 1.2, { opacity: 0.7 }),
  tomate: () => {
    let s = shadow(32, 48, 16, 3);
    [[24, 36], [36, 33], [30, 44], [42, 42]].forEach(([x, y]) => {
      s += part(rr(x - 5, y - 5, 10, 10, 2.5), '#E8505E', { w: 1.4 }) + flat(rr(x - 3, y - 3, 4, 2.4, 1), '#FF9AA2');
    });
    return s;
  },
  cebollin: () => {
    let s = '';
    [[24, 32], [36, 28], [30, 40], [42, 38], [20, 42]].forEach(([x, y], k) => {
      s += part(ellD(x, y, 5, 4), k % 2 ? '#8FD37A' : '#6BBF6B', { w: 1.3 }) + flat(ellD(x, y, 2, 1.6), '#E8F4D8');
    });
    return s;
  },
};
export function toppingSvg(id) {
  return TOPPINGS[id] ? piece(64, 64, TOPPINGS[id]()) : ingredientSvg(id);
}

export function ingredientSvg(id) {
  const ing = INGREDIENTS[id];
  return piece(64, 64, ing ? ing.draw() : '');
}

// Para el laboratorio (/arte?set=cocina).
export function KITCHEN_ART_SET() {
  const c = (name, markup, w, h, kind) => ({ name, markup, w, h, kind });
  return [
    c('Mesón', counterSvg(360, 342), 360, 342, 'surface'),
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
    ...Object.keys(TOPPINGS).map((k) => c(`encima: ${k}`, toppingSvg(k), 64, 64)),
  ];
}
