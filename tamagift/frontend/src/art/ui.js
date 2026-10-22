// ─────────────────────────────────────────────────────────────────
// Objetos de interfaz y de escena (64×64): moneda, estrella, corazón,
// trofeo, el topo del minijuego, la guitarra de los pósters de muestra…
//
// Igual que la comida: piezas con rol para los kits de cada estilo y, en
// pixel art, la versión hecha a mano (art/pixel/ui.js) con
// data-px-sprite="ui.<nombre>".
// ─────────────────────────────────────────────────────────────────

import { part, flat, line, shade, shine, rr, ellD, Cir, Ell, G, svgDoc } from './room/draw.js';

const SH = '#2A1C24';
const ground = (cx, cy, rx, ry = 3) => Ell(cx, cy, rx, ry, { fill: SH, opacity: 0.16, 'data-r': 'tone' });
const dot = (x, y, r, c) => Cir(x, y, r, { fill: c, 'data-r': 'flat' });
const gleam = (x, y, r) => Cir(x, y, r, { fill: '#FFFFFF', 'data-r': 'shine' });

// Estrella de cinco puntas exacta (simétrica por construcción).
function starPath(cx, cy, R, r) {
  let d = '';
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + 36 * k) * Math.PI) / 180;
    const rad = k % 2 ? r : R;
    d += `${k ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}
const HEART = (cx, cy, s) => `M${cx} ${cy + 22 * s}C${cx - 20 * s} ${cy + 8 * s} ${cx - 26 * s} ${cy - 2 * s} ${cx - 26 * s} ${cy - 10 * s}C${cx - 26 * s} ${cy - 19 * s} ${cx - 19 * s} ${cy - 25 * s} ${cx - 11 * s} ${cy - 25 * s}C${cx - 6 * s} ${cy - 25 * s} ${cx - 2 * s} ${cy - 22 * s} ${cx} ${cy - 18 * s}C${cx + 2 * s} ${cy - 22 * s} ${cx + 6 * s} ${cy - 25 * s} ${cx + 11 * s} ${cy - 25 * s}C${cx + 19 * s} ${cy - 25 * s} ${cx + 26 * s} ${cy - 19 * s} ${cx + 26 * s} ${cy - 10 * s}C${cx + 26 * s} ${cy - 2 * s} ${cx + 20 * s} ${cy + 8 * s} ${cx} ${cy + 22 * s}Z`;

const SPRITES = {
  burbuja: () => Cir(32, 32, 24, { fill: '#D7F0FB', 'fill-opacity': 0.35, stroke: '#6FB6E0', 'stroke-width': 3, 'data-r': 'part' })
    + shine('M15 26C16 18 22 12 30 11C24 15 19 20 18 28Z', { opacity: 0.95 })
    + dot(43, 44, 3, '#FFFFFF'),
  esponja: () => ground(32, 56, 26)
    + part(rr(6, 14, 52, 11, 4), '#4FA358')
    + part(rr(6, 24, 52, 28, 5), '#F6C945')
    + [[14, 32], [26, 36], [40, 31], [48, 41], [20, 44], [34, 46]].map(([x, y]) => Ell(x, y, 2.6, 2, { fill: '#D9961E', 'data-r': 'flat' })).join('')
    + shine('M10 30C10 27 12 26 14 26C12 28 12 31 12 34Z', { opacity: 0.8 })
    + line('M12 18H52', '#9BD86E', 2, { opacity: 0.8 }),
  bandera: () => line('M14 60V8', '#5E5266', 4.4)
    + Cir(14, 7, 3, { fill: '#F6C945', stroke: '#3A2A3E', 'stroke-width': 1.6, 'data-r': 'part' })
    + part('M16 10C26 6 34 14 44 10C48 9 52 9 56 10V36C52 35 48 35 44 36C34 40 26 32 16 36Z', '#FFFFFF')
    + [0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => ((i + j) % 2 ? '' : flat(`M${16 + i * 6.7} ${11 + j * 8.4}h6.7v8.4h-6.7Z`, '#272330')))).flat().join(''),
  pasto: () => part('M10 58C12 48 10 38 6 28C14 34 18 44 19 58ZM22 58C22 44 24 30 30 18C32 32 30 46 31 58ZM34 58C36 46 42 36 52 30C46 40 44 50 44 58ZM44 58C46 52 50 46 58 44C54 50 54 54 54 58Z', '#4FA358')
    + line('M28 26C27 36 27 46 28 56', '#9BD86E', 2, { opacity: 0.9 }),
  flor: () => line('M32 60V34', '#2C6A3D', 4)
    + part('M32 48C36 40 44 38 50 41C46 48 38 50 32 48Z', '#4FA358')
    + [0, 72, 144, 216, 288].map((a) => G({ transform: `rotate(${a} 32 24)` }, part(ellD(32, 12, 7.5, 10), '#F28AB0'))).join('')
    + Cir(32, 24, 7, { fill: '#F6C945', stroke: '#3A2A3E', 'stroke-width': 2, 'data-r': 'part' })
    + gleam(30, 22, 1.6),
  dedo: () => part('M27 60C21 54 14 46 14 40C14 35 20 35 23 39L26 43V12C26 7 34 7 34 12V30C34 26 42 26 42 30V33C42 29 50 29 50 33V36C50 32 57 33 57 37V46C57 52 54 56 51 60Z', '#FFD9BE')
    + line('M34 30V40M42 33V40M50 36V42', '#E5A884', 2)
    + shine('M28 14C28 11 30 10 31 11C30 13 30 18 30 22Z', { opacity: 0.8 })
    + part(rr(24, 54, 30, 8, 2), '#6F9BE6', { w: 2 })
    + line('M22 6L18 2M30 3V-1M38 6L42 2', '#F6C945', 3),
  llama: () => part('M32 61C17 59 10 48 13 36C15 28 22 24 22 15C30 21 32 28 30 35C36 31 38 23 36 12C49 20 55 32 53 45C51 55 43 61 32 61Z', '#F2652A')
    + flat('M32 58C24 57 21 49 23 43C25 39 29 37 29 32C35 36 39 42 39 48C39 55 36 58 32 58Z', '#FFB866')
    + flat('M32 56C28 55 27 51 28 48C29 45 31 44 31 41C34 44 36 47 36 50C36 54 34 56 32 56Z', '#FFEC9C'),
  trofeo: () => ground(32, 60, 16)
    + line('M18 14H9C9 26 15 30 22 31M46 14H55C55 26 49 30 42 31', '#F6C945', 4.4)
    + part('M18 8H46V22C46 32 40 38 32 38C24 38 18 32 18 22Z', '#F6C945')
    + part(rr(28, 37, 8, 9, 1), '#D9961E', { w: 2 })
    + part(rr(18, 46, 28, 10, 2), '#9A5A34')
    + flat('M22 49h20v3h-20Z', '#CF8D53')
    + Cir(32, 22, 5, { fill: '#FFEC9C', stroke: '#D9961E', 'stroke-width': 1.6, 'data-r': 'part' })
    + shine('M22 11L23 26C21 22 21 16 22 11Z', { opacity: 0.85 }),
  moneda: () => ground(32, 58, 18)
    + part(ellD(32, 34, 24, 24), '#D9961E')
    + part(ellD(32, 31, 24, 24), '#F6C945')
    + Cir(32, 31, 18, { fill: 'none', stroke: '#D9961E', 'stroke-width': 2.4, 'data-r': 'line' })
    + flat(HEART(32, 32, 0.42), '#D9961E')
    + shade(HEART(31, 31, 0.36), '#FFEC9C', 0.6)
    + shine('M15 24C17 17 22 12 29 10C23 14 19 19 18 26Z', { opacity: 0.85 }),
  parlante: () => part('M8 24H20L34 11V53L20 40H8Z', '#8A64D6')
    + line('M42 23C47 28 47 36 42 41M48 16C57 25 57 39 48 48', '#4D2D86', 3.6),
  silencio: () => part('M8 24H20L34 11V53L20 40H8Z', '#8A64D6')
    + line('M43 24L57 40M57 24L43 40', '#D93A4C', 4),
  cambio: () => part('M12 30C12 18 21 9 33 9C40 9 46 12 50 17L54 12V28H38L44 22C41 18 37 16 33 16C25 16 19 22 19 30Z', '#4D7BD6')
    + part('M52 34C52 46 43 55 31 55C24 55 18 52 14 47L10 52V36H26L20 42C23 46 27 48 31 48C39 48 45 42 45 34Z', '#F28AB0'),
  globo: () => part('M32 46C18 46 11 34 11 23C11 11 21 4 32 4C43 4 53 11 53 23C53 34 46 46 32 46Z', '#E23B4E')
    + part('M29 46H35L32 51Z', '#B32A43', { w: 1.8 })
    + line('M32 51C28 55 36 58 31 62', '#5E5266', 2)
    + shine('M18 18C19 12 24 8 30 8C24 11 21 15 20 21Z', { opacity: 0.9 }),
  nota: () => part('M24 14L54 8V44', '#8A64D6', { a: { fill: 'none' } })
    + part('M24 14L54 8V16L24 22Z', '#8A64D6')
    + line('M24 14V48M54 8V42', '#4D2D86', 3.4)
    + part(ellD(17, 48, 8, 6), '#8A64D6')
    + part(ellD(47, 42, 8, 6), '#8A64D6')
    + gleam(14, 46, 1.6) + gleam(44, 40, 1.6),
  estrella: () => part(starPath(32, 34, 28, 11.5), '#F6C945')
    + shine('M30 15L27 24L23 24Z', { opacity: 0.85 }),
  paleta: () => part('M32 8C48 8 58 18 58 30C58 38 52 40 46 38C40 36 38 42 42 48C46 56 38 58 32 58C18 58 6 46 6 32C6 18 18 8 32 8Z', '#F2CB94')
    + [[20, 22, '#D93A4C'], [32, 16, '#F6C945'], [44, 22, '#4FA358'], [16, 36, '#4D7BD6'], [24, 48, '#8A64D6'], [40, 30, '#F28AB0']]
      .map(([x, y, c]) => Cir(x, y, 4.8, { fill: c, stroke: '#3A2A3E', 'stroke-width': 1.8, 'data-r': 'part' }) + gleam(x - 1.5, y - 1.5, 1.2)).join(''),
  regalo: () => ground(32, 60, 24)
    + part(rr(10, 30, 44, 28, 2), '#F28AB0')
    + part(rr(7, 22, 50, 10, 2), '#FF9FC4')
    + flat('M28 22h8v36h-8Z', '#F6C945')
    + part('M32 22C24 22 15 18 16 12C17 6 26 8 32 20C38 8 47 6 48 12C49 18 40 22 32 22Z', '#F6C945')
    + shine('M12 34L13 54L11 54Z', { opacity: 0.7 }),
  // Guitarra de pie: cuerpo de ocho, boca, puente, mástil con trastes.
  guitarra: () => part(rr(29, 6, 6, 26, 1.5), '#5A2F20', { w: 2 })
    + [12, 16, 20, 24].map((y) => line(`M29.5 ${y}H34.5`, '#E8E0EC', 1.2)).join('')
    + part('M27 2H37V9H27Z', '#99592F', { w: 2 })
    + [3.5, 7].map((y) => line(`M23 ${y}H27M37 ${y}H41`, '#E8E0EC', 2)).join('')
    + part('M32 26C25 26 21 30 22 36C22 39 23 41 22 43C17 46 15 50 15 54C15 60 22 63 32 63C42 63 49 60 49 54C49 50 47 46 42 43C41 41 42 39 42 36C43 30 39 26 32 26Z', '#E39A4E')
    + Cir(32, 38, 5, { fill: '#2A1A16', stroke: '#B8692E', 'stroke-width': 2, 'data-r': 'part' })
    + part(rr(26, 52, 12, 3, 1), '#5A2F20', { w: 1.4 })
    + line('M31 9V52M33 9V52', '#E8E0EC', 0.8, { opacity: 0.8 })
    + shine('M19 52C19 48 21 46 24 45C22 48 21 51 21 55Z', { opacity: 0.7 }),
  claqueta: () => part('M8 26H56V56H8Z', '#3B3742')
    + part('M7 17L54 9L56 19L9 27Z', '#FFFFFF')
    + [0, 1, 2, 3].map((i) => flat(`M${13 + i * 11} ${16 - i * 2}l7 -1.2l-5 8l-7 1.2Z`, '#272330')).join('')
    + line('M14 36H50M14 44H38M14 50H44', '#FFFFFF', 2.6, { opacity: 0.85 }),
  tele: () => ground(32, 61, 22)
    + line('M24 6L32 16L40 6', '#4D2D86', 2.4)
    + part(rr(6, 16, 52, 40, 8), '#C6AAF4')
    + part(rr(12, 22, 32, 28, 4), '#A0D4F3')
    + shine('M16 26C20 25 24 25 28 26C24 27 20 29 17 31Z', { opacity: 0.9 })
    + Cir(51, 30, 3, { fill: '#F6C945', stroke: '#3A2A3E', 'stroke-width': 1.6, 'data-r': 'part' })
    + Cir(51, 41, 3, { fill: '#F6C945', stroke: '#3A2A3E', 'stroke-width': 1.6, 'data-r': 'part' })
    + part('M14 56H22V60H14ZM42 56H50V60H42Z', '#4D2D86', { w: 1.6 }),
  corazon: () => part(HEART(32, 34, 1.05), '#E23B4E')
    + shine('M14 20C15 14 19 11 24 11C20 14 17 17 16 22Z', { opacity: 0.9 }),
  // Topo de verdad: asoma de su hueco, pelaje oscuro, nariz rosada en
  // estrella, ojitos chiquitos y manotas con garras sobre el borde.
  topo: () => part(ellD(32, 50, 26, 9), '#2A1C1E')
    + part('M14 50C14 30 21 12 32 12C43 12 50 30 50 50Z', '#6B5A6E')
    + shade('M14 50C14 30 21 12 32 12C26 16 22 30 22 50Z', '#8E7C92', 0.6)
    + Cir(26, 28, 2.2, { fill: '#2E2430', 'data-r': 'flat' }) + Cir(38, 28, 2.2, { fill: '#2E2430', 'data-r': 'flat' })
    + gleam(25.4, 27.4, 0.8) + gleam(37.4, 27.4, 0.8)
    + part('M32 30L34 33L37.5 33L35 35.5L36 39L32 37L28 39L29 35.5L26.5 33L30 33Z', '#F28AB0', { w: 1.6 })
    + line('M24 36L16 35M24 38L17 40M40 36L48 35M40 38L47 40', '#3A2A3E', 1.2, { opacity: 0.7 })
    + Ell(22, 36, 2.6, 1.6, { fill: '#F28AB0', opacity: 0.5, 'data-r': 'tone' }) + Ell(42, 36, 2.6, 1.6, { fill: '#F28AB0', opacity: 0.5, 'data-r': 'tone' })
    + part('M10 50C12 44 16 41 22 43C24 46 23 50 22 52Z', '#F2D2C2', { w: 1.8 })
    + part('M54 50C52 44 48 41 42 43C40 46 41 50 42 52Z', '#F2D2C2', { w: 1.8 })
    + line('M13 50L12 54M17 51L17 55M21 51L22 55M51 50L52 54M47 51L47 55M43 51L42 55', '#FFF4EC', 1.8)
    + part('M4 52C4 46 14 47 20 48C26 49 38 49 44 48C50 47 60 46 60 52C60 58 48 60 32 60C16 60 4 58 4 52Z', '#A8754A')
    + [[12, 54], [24, 57], [40, 57], [52, 54]].map(([x, y]) => Ell(x, y, 2.4, 1.2, { fill: '#7A4E30', 'data-r': 'flat' })).join(''),
};

/** SVG (texto) de un objeto. En pixel se pinta su versión hecha a mano. */
export function uiSvg(name) {
  const draw = SPRITES[name];
  return draw ? svgDoc(64, 64, draw(), { 'data-px-sprite': `ui.${name}` }) : null;
}
export function uiInner(name) {
  const draw = SPRITES[name];
  return draw ? draw() : '';
}
export const UI_NAMES = Object.keys(SPRITES);
