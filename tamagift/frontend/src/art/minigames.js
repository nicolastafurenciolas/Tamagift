// ─────────────────────────────────────────────────────────────────
// Arte de los minijuegos, como SVG con partes (cada estilo lo redibuja
// con su kit, igual que la mochi y el cuarto).
//
// Reglas de siempre: contorno de tinta cálida, luz de arriba a la
// izquierda, formas simétricas calculadas (no a ojo) y nada que no se
// reconozca a 40 px.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, Cir, Ell, piece, G, INK } from './room/draw.js';

const f1 = (v) => +v.toFixed(1);
const pt = (cx, cy, r, deg) => [f1(cx + Math.cos((deg * Math.PI) / 180) * r), f1(cy + Math.sin((deg * Math.PI) / 180) * r)];

// Estrella de n puntas, simétrica por construcción.
export function starPath(cx, cy, R, r, n = 5, rot = -90) {
  let d = '';
  for (let k = 0; k < n * 2; k++) {
    const [x, y] = pt(cx, cy, k % 2 ? r : R, rot + (k * 180) / n);
    d += `${k ? 'L' : 'M'}${x} ${y}`;
  }
  return `${d}Z`;
}

// Flor de pétalos redondos.
export function flowerPath(cx, cy, R, r, n = 5) {
  const step = 360 / n;
  let d = `M${pt(cx, cy, r, -90 - step / 2).join(' ')}`;
  for (let i = 0; i < n; i++) {
    const a = -90 + i * step;
    d += `C${pt(cx, cy, R * 1.22, a - step * 0.48).join(' ')} ${pt(cx, cy, R * 1.22, a + step * 0.48).join(' ')} ${pt(cx, cy, r, a + step / 2).join(' ')}`;
  }
  return `${d}Z`;
}

const HEART = (cx, cy, s) => `M${cx} ${f1(cy + 16 * s)}C${f1(cx - 4 * s)} ${f1(cy + 12 * s)} ${f1(cx - 22 * s)} ${f1(cy + 2 * s)} ${f1(cx - 22 * s)} ${f1(cy - 8 * s)}C${f1(cx - 22 * s)} ${f1(cy - 17 * s)} ${f1(cx - 15 * s)} ${f1(cy - 22 * s)} ${f1(cx - 9 * s)} ${f1(cy - 22 * s)}C${f1(cx - 4 * s)} ${f1(cy - 22 * s)} ${cx} ${f1(cy - 18 * s)} ${cx} ${f1(cy - 13 * s)}C${cx} ${f1(cy - 18 * s)} ${f1(cx + 4 * s)} ${f1(cy - 22 * s)} ${f1(cx + 9 * s)} ${f1(cy - 22 * s)}C${f1(cx + 15 * s)} ${f1(cy - 22 * s)} ${f1(cx + 22 * s)} ${f1(cy - 17 * s)} ${f1(cx + 22 * s)} ${f1(cy - 8 * s)}C${f1(cx + 22 * s)} ${f1(cy + 2 * s)} ${f1(cx + 4 * s)} ${f1(cy + 12 * s)} ${cx} ${f1(cy + 16 * s)}Z`;

// ── Golosinas (Conecta 3) ─────────────────────────────────────────
// Seis tipos con FORMA y color propios: se distinguen aunque no se vea
// bien el color (daltonismo, brillo bajo, estilo neón).
export const CANDY_COLORS = ['#F05A78', '#F7B231', '#4FA6E6', '#55BE84', '#A97BE2', '#FF7FBF'];
export const CANDY_NAMES = ['Corazón', 'Estrella', 'Gota', 'Florcita', 'Gema', 'Gomita'];

export function candySvg(t) {
  const c = CANDY_COLORS[t % CANDY_COLORS.length];
  const lt = mix(c, '#FFFFFF', 0.5);
  let body = '', extra = '';
  switch (t % 6) {
    case 0: body = HEART(32, 34, 1.15); break;
    case 1: body = starPath(32, 35, 27, 13); break;
    case 2: body = 'M32 6C40 17 52 27 52 39C52 50 43 58 32 58C21 58 12 50 12 39C12 27 24 17 32 6Z'; break;
    case 3:
      body = flowerPath(32, 33, 21, 11);
      extra = Cir(32, 33, 8.5, { fill: mix(c, '#FFF6C8', 0.75), stroke: INK, 'stroke-width': 2, 'data-r': 'part' });
      break;
    case 4:
      body = 'M32 7L56 25L32 59L8 25Z';
      extra = flat('M8 25L56 25L32 59Z', tone(c, -0.45)) + line('M8 25H56M20 25L32 7L44 25M20 25L32 59M44 25L32 59', tone(c, 1.1), 1.4, { opacity: 0.8 });
      break;
    default:
      body = rr(10, 11, 44, 44, 11);
      extra = flat(rr(17, 18, 30, 26, 8), lt, { opacity: 0.75 }) + line('M18 48Q32 52 46 48', tone(c, -0.6), 1.6, { opacity: 0.7 });
      break;
  }
  let s = Ell(32, 59, 18, 3.2, { fill: '#2A1C24', opacity: 0.18, 'data-r': 'tone' });
  s += part(body, c, { w: 2.6 });
  s += extra;
  s += shine('M19 21C21 15 27 12 32 12C27 15 24 18 23 23Z', { opacity: 0.85 });
  s += Cir(44, 22, 2.4, { fill: '#FFFFFF', opacity: 0.6, 'data-r': 'shine' });
  return piece(64, 64, s);
}

// Bola de colores (nace de 5 en línea): bombón de chocolate con chispas.
export function colorBombSvg() {
  const cols = CANDY_COLORS;
  let s = Ell(32, 59, 18, 3.2, { fill: '#2A1C24', opacity: 0.18, 'data-r': 'tone' });
  s += part(ellD(32, 33, 24, 24), '#6B3E2E', { w: 2.6 });
  s += shade(ellD(36, 38, 18, 17), '#2A160E', 0.35);
  for (let k = 0; k < 12; k++) {
    const [x, y] = pt(32, 33, k % 2 ? 9 : 17, k * 33);
    s += G({ transform: `rotate(${(k * 47) % 180} ${x} ${y})` }, flat(rr(x - 3.5, y - 1.3, 7, 2.6, 1.3), cols[k % cols.length]));
  }
  s += shine('M17 22C20 15 26 11 32 11C26 15 22 19 21 25Z', { opacity: 0.8 });
  return piece(64, 64, s);
}

// Encima de cualquier ficha (golosina o foto): muestra que es especial.
export function specialOverlaySvg(sp) {
  let s = '';
  if (sp === 'h' || sp === 'v') {
    const bar = sp === 'h' ? rr(4, 26, 56, 12, 6) : rr(26, 4, 12, 56, 6);
    s += flat(bar, '#FFFFFF', { opacity: 0.55 });
    s += line(sp === 'h' ? 'M8 29H56M8 35H56' : 'M29 8V56M35 8V56', '#FFFFFF', 2.4, { opacity: 0.95 });
    const arrows = sp === 'h' ? 'M3 32L10 26V38Z M61 32L54 26V38Z' : 'M32 3L26 10H38Z M32 61L26 54H38Z';
    s += part(arrows, '#FFF4B0', { w: 1.6 });
  } else if (sp === 'bomb') {
    // envoltorio de bombón: las dos puntas retorcidas a los lados
    s += part('M2 22L14 28L14 36L2 42L6 32Z', '#FFFFFF', { w: 1.8 }) + part('M62 22L50 28L50 36L62 42L58 32Z', '#FFFFFF', { w: 1.8 });
    s += line('M5 27L12 31M5 37L12 33M59 27L52 31M59 37L52 33', '#C9B8E8', 1.4);
    s += line(ellD(32, 32, 22, 22), '#FFFFFF', 2.6, { opacity: 0.9, 'stroke-dasharray': '4 5' });
    [[10, 10], [54, 10], [10, 54], [54, 54]].forEach(([x, y]) => { s += part(starPath(x, y, 6, 2.4, 4, -90), '#FFF4B0', { w: 1.2 }); });
  }
  return piece(64, 64, s);
}

// Fondo de casilla con gelatina (1 capa) o hielo (2 capas).
export function jellySvg(layers) {
  let s = '';
  if (layers >= 2) {
    s += face(rr(2, 2, 60, 60, 12), '#CFEFFF', { w: 2 });
    s += flat(rr(6, 6, 52, 22, 9), '#FFFFFF', { opacity: 0.55 });
    s += line('M14 44L22 36L20 30M44 50L40 42L48 38M50 18L44 24', '#8CC8E8', 1.6, { opacity: 0.9 });
  } else {
    s += face(rr(2, 2, 60, 60, 12), '#FFC2DC', { w: 2 });
    s += flat(rr(6, 6, 52, 20, 9), '#FFFFFF', { opacity: 0.45 });
    s += Cir(48, 46, 3, { fill: '#FFFFFF', opacity: 0.6, 'data-r': 'shine' }) + Cir(14, 48, 2, { fill: '#FFFFFF', opacity: 0.6, 'data-r': 'shine' });
  }
  return piece(64, 64, s);
}

// ── Dale al que salga ─────────────────────────────────────────────
// Un topo se reconoce por tres cosas: pelaje oscuro aterciopelado, nariz
// rosada grande y las manotas rosadas de cavar apoyadas en el borde.

export function moleSvg(kind = 'topo') {
  const gold = kind === 'dorado';
  const fur = gold ? '#F4C542' : '#7A6052';
  const furD = gold ? '#C9902A' : '#5B463C';
  const pink = '#FF9DB4';
  let s = '';
  // cuerpo: una gota ancha que sale del agujero
  s += part('M18 100V58C18 32 33 16 50 16C67 16 82 32 82 58V100Z', fur, { w: 2.6 });
  s += shade('M62 22C74 30 80 44 80 60V100H66V60C66 44 64 32 62 22Z', furD, 0.45);
  // hocico claro y nariz grande
  s += part(ellD(50, 52, 15, 11), gold ? '#FFE9A8' : '#C9A896', { w: 2 });
  s += part(ellD(50, 45, 8.5, 6.5), pink, { w: 2 });
  s += line('M45.5 42.5C47 40.6 50 40.2 52 41', '#FFFFFF', 1.6, { opacity: 0.9 });
  s += line('M50 51.5V56M44 58Q50 62 56 58', INK, 1.6);
  // bigotes
  s += line('M36 50L24 47M36 54L24 55M64 50L76 47M64 54L76 55', gold ? '#8A5A1E' : '#3A2A2E', 1.2, { opacity: 0.8, 'data-skip': 'pixel' });
  // ojitos chiquitos (los topos casi no ven) y mejillas
  s += Cir(40, 36, 2.6, { fill: INK, 'data-r': 'flat' }) + Cir(60, 36, 2.6, { fill: INK, 'data-r': 'flat' });
  s += Cir(39.2, 35.2, 0.9, { fill: '#FFFFFF', 'data-r': 'flat' }) + Cir(59.2, 35.2, 0.9, { fill: '#FFFFFF', 'data-r': 'flat' });
  s += Ell(32, 44, 4.5, 2.6, { fill: '#FF8FA8', opacity: 0.55, 'data-r': 'tone' }) + Ell(68, 44, 4.5, 2.6, { fill: '#FF8FA8', opacity: 0.55, 'data-r': 'tone' });
  // manotas rosadas con garritas, apoyadas en el borde
  const paw = (x, flip) => {
    const k = flip ? -1 : 1;
    return part(`M${x - 11 * k} 84C${x - 12 * k} 74 ${x - 6 * k} 68 ${x} 68C${x + 7 * k} 68 ${x + 12 * k} 74 ${x + 11 * k} 84Z`, pink, { w: 2.2 })
      + line(`M${x - 6 * k} 70L${x - 7 * k} 64M${x - 1 * k} 68.5L${x - 1 * k} 62M${x + 4 * k} 69L${x + 5 * k} 63`, '#FFF6EE', 2.6)
      + line(`M${x - 6 * k} 70L${x - 7 * k} 64M${x - 1 * k} 68.5L${x - 1 * k} 62M${x + 4 * k} 69L${x + 5 * k} 63`, INK, 1);
  };
  s += paw(32, false) + paw(68, true);
  if (gold) {
    s += part('M38 18L42 6L48 14L50 4L52 14L58 6L62 18Q50 22 38 18Z', '#FFE37A', { w: 1.8 });
    [[22, 30], [80, 26], [84, 50]].forEach(([x, y]) => { s += part(starPath(x, y, 5, 2, 4), '#FFF6C8', { w: 1 }); });
  }
  s += shine('M30 34C31 26 37 21 43 20C38 24 35 28 34 34Z', { opacity: 0.55 });
  return piece(100, 100, s);
}

export function bombSvg() {
  let s = '';
  s += part(ellD(50, 64, 27, 27), '#3A3348', { w: 2.6 });
  s += part(rr(42, 32, 16, 10, 3), '#6E6680', { w: 2.2 });
  s += line('M50 32C50 22 56 16 64 16', '#B08A5A', 3.2);
  s += part(starPath(66, 14, 9, 3.6, 6, -90), '#FFD15C', { w: 1.6 }) + Cir(66, 14, 3, { fill: '#FFFFFF', 'data-r': 'shine' });
  s += shine('M32 54C34 46 40 41 47 40C42 44 38 48 37 55Z', { opacity: 0.5 });
  // carita enojada para que se entienda que NO se toca
  s += line('M40 60L46 63M60 60L54 63', '#FFFFFF', 2);
  s += line('M43 74Q50 70 57 74', '#FFFFFF', 2);
  return piece(100, 100, s);
}

// Agujero en el pasto visto en 3/4: atrás (hueco y borde de tierra) y
// adelante (el labio de tierra que tapa la base de lo que sale).
export function holeBackSvg() {
  let s = '';
  s += face(ellD(50, 78, 44, 18), '#9C6B45', { w: 2.4 });
  s += flat(ellD(50, 78, 36, 12), '#3B241A');
  s += shade(ellD(50, 75, 30, 8), '#000000', 0.25);
  return piece(100, 100, s);
}
export function holeFrontSvg() {
  let s = '';
  // labio de tierra: grueso adelante, se afina hacia los costados
  s += face('M4 76C4 90 24 99 50 99C76 99 96 90 96 76C90 82 74 86 50 86C26 86 10 82 4 76Z', '#B57D50', { w: 2.4 });
  s += flat('M14 84C24 89 36 91 50 91C64 91 76 89 86 84C78 90 64 94 50 94C36 94 22 90 14 84Z', '#D9A06E', { opacity: 0.7 });
  [[24, 92], [44, 95], [66, 94], [80, 89]].forEach(([x, y]) => { s += Cir(x, y, 1.6, { fill: '#8A5A36', 'data-r': 'flat' }); });
  // matitas de pasto en el borde
  s += part('M10 82L8 72L14 80L16 70L18 82Z', '#6DBE6D', { w: 1.4 }) + part('M84 84L86 74L88 82L92 72L92 84Z', '#6DBE6D', { w: 1.4 });
  return piece(100, 100, s);
}

// Estallido al acertar (estrella de 8 puntas).
export function burstSvg(color = '#FFFFFF') {
  return piece(64, 64, part(starPath(32, 32, 28, 13, 8, -90), color, { w: 2.2 }) + flat(starPath(32, 32, 14, 7, 8, -67.5), mix(color, '#FFF6C8', 0.6)));
}

// ── Camión (Cruzar la calle) ──────────────────────────────────────
// De lado, mirando a la derecha: caja de carga larga atrás y cabina con
// ventana adelante. Va el doble de largo que un carro.
export function truckSvg(color) {
  const box = '#F4EEE6';
  let s = Ell(55, 37, 50, 3, { fill: '#000000', opacity: 0.25, 'data-r': 'tone' });
  s += face(rr(4, 6, 66, 26, 3), box, { w: 2.2 });
  s += flat(rr(8, 10, 58, 7, 2), color, { opacity: 0.9 });
  s += line('M8 22H66', tone(box, -0.5), 1.4, { opacity: 0.7 });
  s += face('M70 14H90C95 14 98 17 100 22L104 26V32H70Z', color, { w: 2.2 });
  s += face('M76 17H89C92 17 94 19 95 22H76Z', '#DCF0FA', { w: 1.4 });
  s += shine('M78 19H86L83 21H78Z', { opacity: 0.8 });
  s += face(ellD(102, 26, 2.2, 2), '#FFE9A8', { w: 1 });
  [18, 40, 88].forEach((x) => { s += face(ellD(x, 32, 6, 6), '#2E2A31', { w: 1.6 }) + Cir(x, 32, 2.4, { fill: '#9A9298', 'data-r': 'flat' }); });
  return piece(110, 40, s);
}

// ── Poderes de "Atrapa la comida" ─────────────────────────────────
export function powerSvg(kind) {
  let s = Ell(32, 59, 16, 3, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  if (kind === 'iman') {
    s += part('M14 12H26V34C26 38 29 40 32 40C35 40 38 38 38 34V12H50V34C50 46 42 54 32 54C22 54 14 46 14 34Z', '#E8505E', { w: 2.4 });
    s += part(rr(14, 8, 12, 9, 2), '#DCE1EA', { w: 2 }) + part(rr(38, 8, 12, 9, 2), '#DCE1EA', { w: 2 });
    s += shine('M18 22V34C18 40 21 45 26 48C20 43 20 38 20 22Z', { opacity: 0.6 });
  } else if (kind === 'reloj') {
    s += part(ellD(18, 15, 7, 6), '#FFC94D', { w: 2 }) + part(ellD(46, 15, 7, 6), '#FFC94D', { w: 2 });
    s += part(ellD(32, 35, 20, 20), '#FF8FB0', { w: 2.4 });
    s += face(ellD(32, 35, 14, 14), '#FFF8F0', { w: 1.8 });
    s += line('M32 35V25M32 35L40 39', INK, 2.2);
    s += line('M20 54L16 59M44 54L48 59', INK, 2.2);
  } else if (kind === 'doble') {
    s += part(starPath(26, 34, 18, 8), '#FFD15C', { w: 2.2 });
    s += part(starPath(42, 26, 13, 6), '#FFE9A0', { w: 2 });
    s += shine('M20 30L24 24L26 30Z', { opacity: 0.8 });
  } else if (kind === 'escudo') {
    s += part('M32 8L52 15V32C52 44 43 53 32 57C21 53 12 44 12 32V15Z', '#7FC8F8', { w: 2.4 });
    s += flat('M32 14L46 19V32C46 41 40 47 32 51Z', '#B8E2FB');
    s += part(HEART(32, 31, 0.42), '#FF6F91', { w: 1.6 });
  }
  return piece(64, 64, s);
}

// Para el laboratorio de arte (/arte?set=juegos): todo junto.
export function GAME_ART_SET() {
  const c = (name, markup, w = 64, h = 64) => ({ name, markup, w, h });
  return [
    ...CANDY_COLORS.map((_, t) => c(CANDY_NAMES[t], candySvg(t))),
    c('Bola de colores', colorBombSvg()),
    c('Rayada horizontal', specialOverlaySvg('h')),
    c('Rayada vertical', specialOverlaySvg('v')),
    c('Envuelta', specialOverlaySvg('bomb')),
    c('Gelatina', jellySvg(1)),
    c('Hielo', jellySvg(2)),
    c('Topo', moleSvg(), 100, 100),
    c('Topo dorado', moleSvg('dorado'), 100, 100),
    c('Bomba', bombSvg(), 100, 100),
    c('Hoyo atrás', holeBackSvg(), 100, 100),
    c('Hoyo adelante', holeFrontSvg(), 100, 100),
    ...['iman', 'reloj', 'doble', 'escudo'].map((k) => c(k, powerSvg(k))),
  ];
}
