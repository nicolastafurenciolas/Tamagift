// ─────────────────────────────────────────────────────────────────
// La comida dibujada (64×64), una por cada comida de foodCatalog.js.
//
// Cada dibujo va en piezas con su rol (part, flat, line, shine, tone)
// para que cada estilo lo redibuje con su kit. En pixel art no se usa el
// vector: el SVG lleva data-px-sprite="food.<id>" y se pinta la versión
// hecha a mano píxel a píxel (art/pixel/food.js).
//
// Luz de arriba a la izquierda, vista de 3/4 en lo que se apoya (tazones,
// tortas, platos), sombra suave en el piso.
// ─────────────────────────────────────────────────────────────────

import { part, flat, line, shade, shine, rr, ellD, tone, Cir, Ell, G, svgDoc } from './room/draw.js';

const SH = '#2A1C24';
const ground = (cx, cy, rx, ry = 3.2) => Ell(cx, cy, rx, ry, { fill: SH, opacity: 0.16, 'data-r': 'tone' });
const dot = (x, y, r, c) => Cir(x, y, r, { fill: c, 'data-r': 'flat' });
const ball = (x, y, r, c, w = 2) => Cir(x, y, r, { fill: c, stroke: '#3A2A3E', 'stroke-width': w, 'data-r': 'part' });
const gleam = (x, y, r) => Cir(x, y, r, { fill: '#FFFFFF', 'data-r': 'shine' });

// Tazón en 3/4 visto un poco de arriba: cuerpo, borde y la boca (donde va
// lo de adentro). Devuelve [cuerpo, boca] por separado para poner el
// contenido en medio.
function bowl(cx, rimY, rx, depth, color, inner) {
  const ry = rx * 0.32;
  const body = part(`M${cx - rx} ${rimY}C${cx - rx} ${rimY + depth * 0.95} ${cx - rx * 0.5} ${rimY + depth} ${cx} ${rimY + depth}C${cx + rx * 0.5} ${rimY + depth} ${cx + rx} ${rimY + depth * 0.95} ${cx + rx} ${rimY}Z`, color);
  const rim = part(ellD(cx, rimY, rx, ry), tone(color, 0.6));
  const mouth = flat(ellD(cx, rimY + 0.6, rx - 3, ry - 2), inner);
  return { back: rim + mouth, front: body };
}

const FOOD = {
  fresa: () => {
    let s = ground(32, 59, 13);
    s += part('M32 60C18 52 10 40 11 29C12 21 20 18 32 20C44 18 52 21 53 29C54 40 46 52 32 60Z', '#E23B4E');
    s += shine('M17 32C17 27 20 25 24 25C21 28 20 31 20 35C19 35 17 34 17 32Z', { opacity: 0.8 });
    [[22, 32], [30, 29], [38, 30], [45, 33], [19, 40], [27, 38], [35, 38], [43, 41], [24, 46], [32, 46], [39, 48], [31, 53]]
      .forEach(([x, y]) => { s += Ell(x, y, 1.3, 1.9, { fill: '#FFE08A', 'data-r': 'flat' }); });
    s += part('M32 23C27 23 22 27 16 25C19 22 22 20 25 19C22 17 21 14 22 11C26 13 29 15 32 17C35 15 38 13 42 11C43 14 42 17 39 19C42 20 45 22 48 25C42 27 37 23 32 23Z', '#4FA358');
    s += line('M32 18C32 13 33 9 36 6', '#2C6A3D', 3.2);
    return s;
  },
  manzana: () => {
    let s = ground(32, 59, 17);
    s += part('M32 21C27 16 17 15 12 22C7 30 9 42 14 50C18 56 25 60 32 57C39 60 46 56 50 50C55 42 57 30 52 22C47 15 37 16 32 21Z', '#DC3A4C');
    s += shine('M15 30C16 25 19 23 23 23C20 26 18 30 18 35C16 34 15 32 15 30Z', { opacity: 0.85 });
    s += line('M32 22C32 15 33 11 36 7', '#5A2F20', 3.4);
    s += part('M35 12C39 6 47 6 51 9C47 14 40 15 35 12Z', '#4FA358', { w: 2 });
    s += line('M37 11C42 10 46 9 49 9', '#2C6A3D', 1.4, { opacity: 0.7 });
    return s;
  },
  banano: () => {
    let s = ground(33, 56, 22);
    s += part('M9 19C11 35 23 49 41 49C49 49 55 45 58 39C55 41 50 43 44 42C30 41 19 31 15 17C14 13 10 14 9 19Z', '#F6C945');
    s += line('M15 23C19 35 29 43 43 44', '#D59B1E', 2, { opacity: 0.9 });
    s += shine('M11 21C12 28 15 34 20 39C15 35 12 29 11 21Z', { opacity: 0.7 });
    s += part('M8 18L8 12C8 10 12 10 12 12L13 16Z', '#5A2F20', { w: 1.8 });
    s += Cir(57.5, 39.5, 1.8, { fill: '#5A2F20', 'data-r': 'flat' });
    return s;
  },
  sandia: () => {
    let s = ground(32, 57, 22);
    s += part('M5 22A27 27 0 0 0 59 22Z', '#2C6A3D');
    s += flat('M8 22A24 24 0 0 0 56 22Z', '#8ED36F');
    s += flat('M10.5 22A21.5 21.5 0 0 0 53.5 22Z', '#F4F7EC');
    s += flat('M13 22A19 19 0 0 0 51 22Z', '#E23B4E');
    s += shade('M13 22A19 19 0 0 0 51 22L46 22A14 14 0 0 1 18 22Z', '#FFFFFF', 0.14);
    [[22, 28], [32, 30], [42, 28], [26, 36], [38, 36], [32, 42]]
      .forEach(([x, y]) => { s += Ell(x, y, 1.4, 2.4, { fill: '#272330', 'data-r': 'flat' }); });
    s += line('M6 22H58', '#3A2A3E', 2.2);
    return s;
  },
  uvas: () => {
    let s = ground(32, 60, 12);
    [[24, 24], [40, 24], [32, 30], [18, 34], [46, 34], [25, 41], [39, 41], [32, 49]]
      .forEach(([x, y]) => { s += ball(x, y, 8, '#8A64D6') + gleam(x - 3, y - 3, 1.9); });
    s += line('M31 18C31 12 30 9 28 6', '#5A2F20', 3);
    s += part('M32 13C36 7 45 6 49 10C45 15 38 16 32 13Z', '#4FA358', { w: 2 });
    return s;
  },
  naranja: () => {
    let s = ground(32, 59, 18);
    s += ball(32, 37, 22, '#EE8434', 2.4);
    s += shine('M15 31C16 25 21 20 27 19C22 23 19 27 18 33C17 33 15 33 15 31Z', { opacity: 0.8 });
    [[26, 30], [38, 28], [44, 40], [30, 45], [40, 50], [22, 41]].forEach(([x, y]) => { s += dot(x, y, 0.9, '#C85E1E'); });
    s += line('M32 15V10', '#5A2F20', 3);
    s += part('M33 12C37 6 45 5 49 9C45 14 38 15 33 12Z', '#4FA358', { w: 2 });
    return s;
  },
  zanahoria: () => {
    let s = ground(28, 59, 18, 2.6);
    s += part('M7 58C13 47 28 28 39 19C44 15 50 18 50 23C50 28 45 32 39 36C27 46 17 53 7 58Z', '#EE8434');
    s += line('M20 46L24 48M27 39L31 41M33 32L37 34M14 52L17 53', '#B9561E', 1.8);
    s += shine('M24 39C29 33 34 27 38 23C35 28 31 33 26 39Z', { opacity: 0.6 });
    s += part('M44 18C42 11 44 6 47 4C49 9 49 14 47 19Z', '#4FA358', { w: 1.8 });
    s += part('M47 20C51 14 56 12 60 13C58 18 53 21 48 22Z', '#4FA358', { w: 1.8 });
    s += part('M45 19C47 13 52 9 56 8C55 13 51 17 46 21Z', '#6FBF5E', { w: 1.8 });
    return s;
  },
  brocoli: () => {
    let s = ground(32, 60, 12, 2.6);
    // el tronco sube y se abre en ramitas que se meten DENTRO de la copa
    s += part('M26 59L27 42C24 39 20 36 19 33L45 33C44 36 40 39 37 42L38 59Z', '#9BD86E');
    s += line('M32 42V56M28 40L24 35M36 40L40 35', '#6FAA4E', 1.6);
    [[19, 29, 11], [45, 29, 11], [32, 19, 13], [25, 22, 10], [39, 22, 10], [32, 32, 10]]
      .forEach(([x, y, r]) => { s += ball(x, y, r, '#4FA358', 2.2); });
    [[16, 26], [28, 15], [40, 18], [24, 30], [46, 26], [34, 28]].forEach(([x, y]) => { s += dot(x, y, 2.4, '#7CC468'); });
    s += gleam(27, 13, 2);
    return s;
  },
  aguacate: () => {
    let s = ground(32, 60, 15, 2.6);
    s += part('M32 6C24 6 20 13 19 21C18 27 11 33 11 43C11 53 20 60 32 60C44 60 53 53 53 43C53 33 46 27 45 21C44 13 40 6 32 6Z', '#2C6A3D');
    s += flat('M32 10C26 10 23 15 22 22C21 28 15 34 15 43C15 51 22 56 32 56C42 56 49 51 49 43C49 34 43 28 42 22C41 15 38 10 32 10Z', '#D9EE9A');
    s += shade('M15 43C15 51 22 56 32 56C42 56 49 51 49 43C46 49 40 52 32 52C24 52 18 49 15 43Z', '#9BD86E', 0.6);
    s += ball(32, 41, 9, '#99592F', 2.2);
    s += gleam(29, 38, 2.4);
    return s;
  },
  ensalada: () => {
    let s = ground(32, 59, 24);
    const b = bowl(32, 33, 26, 23, '#43B5A8', '#2E6A3D');
    s += b.back;
    [[18, 28, 8], [46, 28, 8], [26, 22, 9], [38, 22, 9], [32, 29, 8], [32, 16, 7]]
      .forEach(([x, y, r]) => { s += ball(x, y, r, '#4FA358', 2); });
    [[23, 30], [41, 30], [33, 21]].forEach(([x, y]) => { s += ball(x, y, 4.2, '#E23B4E', 1.8) + gleam(x - 1.4, y - 1.4, 1.1); });
    [[13, 33], [51, 33]].forEach(([x, y]) => { s += ball(x, y, 3.6, '#B9F2A6', 1.6); });
    s += b.front;
    s += shine('M10 37C11 44 14 49 19 52C14 50 10 45 10 37Z', { opacity: 0.6 });
    s += line('M14 44C22 47 42 47 50 44', '#FFFFFF', 2, { opacity: 0.5 });
    return s;
  },
  arepa: () => {
    let s = ground(32, 56, 26);
    s += part('M5 32V39C5 47 17 52 32 52C47 52 59 47 59 39V32Z', '#D59A52');
    s += part(ellD(32, 32, 27, 13), '#F2CB94');
    [[18, 29, 4], [28, 25, 5], [42, 28, 4], [46, 36, 3], [22, 37, 3]].forEach(([x, y, w]) => { s += line(`M${x} ${y}h${w}`, '#B9772E', 2.4); });
    s += flat('M22 31C24 26 38 25 44 30C46 33 44 37 40 36C38 40 35 41 34 37C30 38 23 36 22 31Z', '#FFFFFF');
    s += flat('M40 36C41 41 42 44 40 46C38 44 38 40 38 37Z', '#FFFFFF');
    s += line('M24 31C28 28 36 27 42 30', '#D8CDD6', 1.4, { opacity: 0.8 });
    s += shine('M12 29C14 25 19 23 24 22C19 25 16 27 14 31Z', { opacity: 0.6 });
    return s;
  },
  empanada: () => {
    let s = ground(32, 54, 26);
    // media luna acostada: el doblez atrás y el borde curvo con repulgue
    s += part('M5 24C12 20 22 18 32 18C42 18 52 20 59 24C60 38 49 50 32 50C15 50 4 38 5 24Z', '#E8B05E');
    s += shine('M12 26C18 23 26 22 32 22C25 24 18 27 14 31Z', { opacity: 0.6 });
    let crimp = '';
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.06 + 0.88 * (i / 12));
      const x = 32 - Math.cos(a) * 25.5, y = 25 + Math.sin(a) * 22;
      crimp += Ell(x, y, 2.2, 1.5, { fill: '#C58A3E', transform: `rotate(${(a * 180) / Math.PI - 90} ${x.toFixed(1)} ${y.toFixed(1)})`, 'data-r': 'flat' });
    }
    s += crimp;
    [[26, 32], [36, 31], [31, 39]].forEach(([x, y]) => { s += dot(x, y, 1.4, '#C58A3E'); });
    return s;
  },
  sopa: () => {
    let s = ground(32, 60, 24);
    const b = bowl(32, 33, 26, 22, '#D93A4C', '#F2C46B');
    s += b.back;
    [[22, 33, '#EE8434'], [36, 34, '#EE8434'], [29, 31, '#4FA358'], [43, 32, '#4FA358'], [15, 33, '#4FA358']]
      .forEach(([x, y, c]) => { s += Ell(x, y, 2.6, 1.6, { fill: c, 'data-r': 'flat' }); });
    s += b.front;
    [14, 26, 38, 50].forEach((x) => { s += Cir(x, 46, 1.8, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'flat' }); });
    s += shine('M10 37C11 43 14 48 18 51C13 48 10 43 10 37Z', { opacity: 0.6 });
    s += line('M22 22C19 18 25 15 22 10M32 21C29 17 35 14 32 9M42 22C39 18 45 15 42 10', '#D8CDD6', 2.4, { opacity: 0.9 });
    return s;
  },
  arroz: () => {
    let s = ground(32, 58, 22);
    s += part('M32 7C27 7 9 37 8 45C7 52 14 56 32 56C50 56 57 52 56 45C55 37 37 7 32 7Z', '#FFF8F0');
    s += part(rr(22, 38, 20, 18, 2), '#272330');
    s += line('M25 41V53', '#5E5266', 1.6);
    [[22, 25], [37, 22], [44, 33], [17, 38], [31, 30], [40, 40]].forEach(([x, y]) => { s += Ell(x, y, 1.8, 1, { fill: '#D8CDD6', 'data-r': 'flat', transform: `rotate(-30 ${x} ${y})` }); });
    s += shine('M23 18C25 14 27 12 29 12C27 15 26 18 25 22Z', { opacity: 0.9 });
    return s;
  },
  huevo: () => {
    let s = ground(32, 54, 26);
    s += part('M10 30C6 22 14 14 22 17C27 10 41 11 45 18C54 17 60 26 56 34C60 42 52 50 42 48C36 54 22 54 18 47C9 47 4 38 10 30Z', '#FFFFFF');
    s += shade('M12 40C18 46 30 49 42 46C50 45 55 40 56 34C58 42 51 49 42 48C36 54 22 54 18 47C12 47 9 44 12 40Z', '#9C8FA0', 0.25);
    s += ball(30, 32, 10, '#F6C945', 2.2);
    s += shine('M24 29C25 25 28 23 31 23C28 25 26 28 26 31Z', { opacity: 0.9 });
    return s;
  },
  panqueques: () => {
    let s = ground(32, 58, 26);
    [44, 37, 30].forEach((y) => {
      s += part(`M6 ${y}V${y + 5}C6 ${y + 10} 18 ${y + 12} 32 ${y + 12}C46 ${y + 12} 58 ${y + 10} 58 ${y + 5}V${y}Z`, '#D59A52');
      s += part(ellD(32, y, 26, 8), '#F2CB94');
    });
    s += flat('M14 30C16 25 26 24 32 24C40 24 48 26 50 30C49 33 44 33 44 37C42 40 40 38 40 35C34 37 26 37 22 35C22 40 19 42 18 38C17 35 14 34 14 30Z', '#C8681E');
    s += part('M25 22L32 19L39 22L39 26L32 29L25 26Z', '#FFE89C', { w: 2 });
    s += flat('M25 22L32 19L39 22L32 25Z', '#FFF6CC');
    s += shine('M16 27C19 25 24 24 28 24C23 25 19 27 17 29Z', { opacity: 0.6 });
    return s;
  },
  pasta: () => {
    let s = ground(32, 58, 27);
    s += part(ellD(32, 46, 29, 11), '#FFFFFF');
    s += flat(ellD(32, 46, 21, 7), '#E9E3EC');
    s += part('M13 42C11 32 20 24 32 24C44 24 53 32 51 42C47 47 17 47 13 42Z', '#F6D978');
    s += line('M16 38C20 34 23 40 27 36C31 32 33 38 37 34C41 30 43 36 47 33M18 42C22 39 26 43 30 40C34 37 38 42 42 39', '#D8A12A', 1.6);
    s += part('M22 29C24 23 40 23 42 29C42 33 22 33 22 29Z', '#D93A4C');
    s += ball(28, 26, 5, '#99592F', 1.8) + ball(37, 27, 4.4, '#99592F', 1.8);
    s += gleam(26.5, 24.5, 1.3);
    s += dot(22, 27, 1.4, '#4FA358') + dot(41, 25, 1.4, '#4FA358') + dot(33, 22, 1.2, '#4FA358');
    return s;
  },
  sushi: () => {
    let s = ground(32, 56, 25);
    s += part(rr(7, 30, 50, 23, 9), '#FFF8F0');
    [[15, 44], [24, 48], [38, 46], [48, 42], [30, 41]].forEach(([x, y]) => { s += Ell(x, y, 1.8, 1, { fill: '#D8CDD6', 'data-r': 'flat' }); });
    s += part('M5 30C5 20 16 15 32 15C48 15 59 20 59 30C59 36 50 37 44 36C38 35 26 35 20 36C14 37 5 36 5 30Z', '#F7955A');
    s += line('M13 23L20 31M22 19L30 30M33 18L41 30M44 20L51 30', '#FFD3B5', 2.4);
    s += shine('M10 26C12 21 17 19 22 18C17 21 13 24 12 28Z', { opacity: 0.6 });
    s += part(rr(28, 14, 8, 40, 1), '#272330', { w: 1.8 });
    s += line('M30 18V50', '#5E5266', 1.2);
    return s;
  },
  ramen: () => {
    let s = ground(32, 60, 25);
    s += line('M38 6L56 26M44 4L61 23', '#CF8D53', 3);
    const b = bowl(32, 32, 27, 24, '#D93A4C', '#F2C46B');
    s += b.back;
    s += line('M10 33C14 30 17 35 21 32C25 29 27 34 31 31M30 35C34 32 37 36 41 33C45 30 48 34 52 31', '#FFEC9C', 2.4);
    s += part(ellD(42, 30, 6, 4), '#FFFFFF', { w: 1.8 }) + dot(42, 30, 2.6, '#EE8434');
    s += part(rr(13, 22, 9, 10, 1), '#2C6A3D', { w: 1.8 });
    s += part(ellD(28, 29, 4, 3), '#FFFFFF', { w: 1.6 }) + line('M26 29C27 27 30 28 29 30', '#F28AB0', 1.4);
    s += b.front;
    [14, 24, 34, 44].forEach((x) => { s += part(`M${x} 42h6v4h-6Z`, '#FFFFFF', { w: 1.2 }); });
    s += shine('M9 36C10 42 13 47 17 50C12 47 9 42 9 36Z', { opacity: 0.55 });
    return s;
  },
  tacos: () => {
    let s = ground(32, 58, 25);
    // la mitad de atrás de la tortilla asoma detrás del relleno
    s += part('M7 22A25 25 0 0 0 57 22Z', '#E3B04A');
    [[14, 21], [22, 17], [32, 16], [42, 17], [50, 21]].forEach(([x, y]) => { s += ball(x, y, 6, '#4FA358', 1.8); });
    [[19, 22], [34, 21], [46, 23]].forEach(([x, y]) => { s += ball(x, y, 3.2, '#E23B4E', 1.6); });
    s += flat('M10 25C20 22 44 22 54 25L54 28L10 28Z', '#7A3A1E');
    [[25, 25], [38, 25]].forEach(([x, y]) => { s += flat(`M${x} ${y}h6v2h-6Z`, '#FFE08A'); });
    s += part('M5 27A27 27 0 0 0 59 27Z', '#F6C945');
    [[20, 38], [34, 44], [44, 36], [26, 49]].forEach(([x, y]) => { s += dot(x, y, 1.6, '#D59B1E'); });
    s += shine('M9 31C10 38 14 44 19 48C13 45 9 39 9 31Z', { opacity: 0.6 });
    return s;
  },
  pizza: () => {
    let s = ground(32, 61, 6, 2);
    s += part('M32 60L10 14A44 44 0 0 1 54 14Z', '#FFE08A');
    s += shade('M32 60L54 14A44 44 0 0 0 46 11Z', '#E3A84A', 0.5);
    s += part('M9 12A46 46 0 0 1 55 12L52 19A40 40 0 0 0 12 19Z', '#CF8D53');
    s += shine('M14 13A42 42 0 0 1 26 9C21 11 17 13 15 16Z', { opacity: 0.55 });
    [[24, 26], [40, 28], [32, 40]].forEach(([x, y]) => { s += ball(x, y, 5.6, '#D93A4C', 1.8) + gleam(x - 2, y - 2, 1.3); });
    s += flat('M41 44C42 47 42 51 40 53C38 51 38 47 39 44Z', '#FFE08A');
    s += dot(21, 35, 1.6, '#4FA358') + dot(44, 21, 1.6, '#4FA358');
    return s;
  },
  hamburguesa: () => {
    let s = ground(32, 58, 26);
    s += part('M8 47C8 53 18 56 32 56C46 56 56 53 56 47L56 44L8 44Z', '#CF8D53');
    s += part(rr(6, 36, 52, 9, 4.5), '#6B3A22');
    s += flat('M7 36L57 36L52 41L46 36L40 42L33 36Z', '#F6C945');
    s += part('M5 33C10 30 13 35 18 32C23 29 26 34 32 31C38 28 41 34 46 31C51 28 54 33 59 31L58 36L6 36Z', '#6FBF5E', { w: 1.8 });
    s += part('M6 31C6 16 18 9 32 9C46 9 58 16 58 31Z', '#E3A35E');
    [[20, 17], [30, 14], [40, 17], [25, 23], [36, 22], [47, 23], [15, 25]].forEach(([x, y]) => { s += Ell(x, y, 1.9, 1.1, { fill: '#FFF4E6', 'data-r': 'flat' }); });
    s += shine('M12 24C13 18 18 14 24 13C19 16 15 20 14 25Z', { opacity: 0.6 });
    return s;
  },
  papas: () => {
    let s = ground(32, 60, 18);
    [[19, 12], [24, 6], [29, 10], [34, 4], [39, 9], [44, 13], [22, 18], [31, 15], [41, 17]]
      .forEach(([x, top]) => { s += part(rr(x - 2.6, top, 5.2, 30, 1), '#F6C945', { w: 1.6 }); });
    s += part('M10 26H54L49 59H15Z', '#D93A4C');
    s += flat('M10 26H54L53 31H11Z', '#B22A3C');
    s += part('M32 50C24 45 23 39 27 37C30 36 32 39 32 39C32 39 34 36 37 37C41 39 40 45 32 50Z', '#FFFFFF', { w: 1.6 });
    s += shine('M14 34L15 52L13 52Z', { opacity: 0.5 });
    return s;
  },
  perro: () => {
    let s = ground(32, 54, 28);
    s += part('M4 34C4 46 14 50 32 50C50 50 60 46 60 34Z', '#E3A35E');
    s += part(rr(3, 25, 58, 13, 6.5), '#C2543A');
    s += line('M9 31L14 28L19 33L24 28L29 33L34 28L39 33L44 28L49 33L55 29', '#F6C945', 2.6);
    s += shine('M8 28C12 27 18 27 22 28C18 29 12 29 9 30Z', { opacity: 0.6 });
    s += part('M7 32C7 24 15 20 32 20C49 20 57 24 57 32C51 30 13 30 7 32Z', '#E3A35E');
    s += shine('M14 25C19 23 25 22 30 22C24 24 19 25 15 27Z', { opacity: 0.55 });
    return s;
  },
  helado: () => {
    let s = '';
    s += part('M20 34L32 61L44 34Z', '#CF8D53');
    s += line('M24 38L38 52M22 35L40 50M27 47L35 38M24 42L36 36M30 55L36 46', '#99592F', 1.4, { opacity: 0.8 });
    s += part('M16 35C14 26 22 21 32 21C42 21 50 26 48 35C46 39 43 36 41 39C38 42 36 37 33 40C30 43 27 38 24 40C20 42 18 38 16 35Z', '#F28AB0');
    s += ball(32, 16, 11, '#6CD3BE', 2.2);
    s += shine('M23 13C24 9 27 7 30 6C28 9 26 12 25 15Z', { opacity: 0.85 });
    s += ball(36, 5.6, 3.6, '#D93A4C', 1.8) + gleam(35, 4.6, 1);
    s += line('M37 2C38 0 40 -1 42 0', '#2C6A3D', 1.6);
    return s;
  },
  dona: () => {
    let s = ground(32, 56, 27);
    // rosquilla en 3/4 con su hueco de verdad (evenodd)
    const ring = `${ellD(32, 34, 28, 20)}${ellD(32, 31, 8, 4.6)}`;
    s += part(ring, '#E8B05E', { a: { 'fill-rule': 'evenodd' } });
    s += part('M6 30C6 18 18 13 32 13C46 13 58 18 58 30C58 36 55 37 53 35C51 39 48 41 46 37C44 41 40 43 38 39C34 42 30 42 27 39C24 42 20 41 18 37C15 41 11 39 11 35C8 37 6 35 6 30ZM24 31C24 34 28 36 32 36C36 36 40 34 40 31C40 28 36 26 32 26C28 26 24 28 24 31Z', '#F28AB0', { a: { 'fill-rule': 'evenodd' } });
    s += shine('M12 24C15 19 21 16 28 16C21 18 16 21 14 26Z', { opacity: 0.8 });
    [[16, 26, '#F6C945', 20], [22, 20, '#4D7BD6', -30], [36, 18, '#FFFFFF', 10], [46, 22, '#9BD86E', 40], [50, 30, '#F6C945', -20],
      [14, 33, '#C6AAF4', 60], [42, 33, '#4D7BD6', 0], [29, 37, '#9BD86E', 45], [37, 37, '#FFFFFF', -45]]
      .forEach(([x, y, c, a]) => { s += flat(rr(x - 2.6, y - 0.9, 5.2, 1.8, 0.9), c, { transform: `rotate(${a} ${x} ${y})` }); });
    s += line('M25 32C27 36 37 36 39 32', '#B9772E', 1.6, { opacity: 0.7 });
    return s;
  },
  pastel: () => {
    let s = ground(32, 58, 25);
    // tajada: cara de adelante con capas y la de arriba con crema
    s += part('M6 30L52 30L52 55L6 55Z', '#F6D9A6');
    s += flat('M6 35H52V39H6Z', '#FFE9C9');
    s += flat('M6 43H52V48H6Z', '#F28AB0');
    s += flat('M6 46H52V48H6Z', '#C9406B');
    s += part('M6 30L20 16L58 16L52 30Z', '#FFFFFF');
    s += part('M52 30L58 16L58 41L52 55Z', '#EADFD0');
    s += flat('M10 30C10 34 12 35 13 33C14 36 17 36 17 32C19 35 22 35 22 31L6 30Z', '#FFFFFF');
    s += flat('M30 30C30 33 32 34 33 32C35 35 38 34 38 30Z', '#FFFFFF');
    s += ball(38, 13, 6, '#D93A4C', 2) + gleam(36, 11, 1.4);
    s += part('M38 8L35 4L38 5L41 4Z', '#4FA358', { w: 1.4 });
    s += shine('M12 26L22 19L28 19L16 27Z', { opacity: 0.5 });
    return s;
  },
  galleta: () => {
    let s = ground(32, 58, 24);
    // galleta con un mordisco arriba a la derecha
    s += part('M32 8C40 8 46 11 50 16C47 17 45 20 46 23C47 26 50 28 54 27C55 29 56 31 56 33C56 47 45 58 32 58C18 58 7 47 7 33C7 19 18 8 32 8Z', '#E3A85E');
    s += shade('M9 38C12 49 22 56 32 56C43 56 51 51 54 44C49 50 41 53 32 53C21 53 13 47 9 38Z', '#B9772E', 0.5);
    [[20, 20], [33, 18], [24, 32], [38, 31], [16, 40], [30, 44], [44, 42], [46, 32]].forEach(([x, y]) => {
      s += flat(`M${x - 3} ${y}C${x - 3} ${y - 3} ${x + 3} ${y - 4} ${x + 3} ${y}C${x + 3} ${y + 3} ${x - 3} ${y + 3} ${x - 3} ${y}Z`, '#5A2F20');
    });
    s += shine('M14 22C17 16 22 13 27 12C22 15 18 19 16 24Z', { opacity: 0.6 });
    s += dot(55, 20, 1.4, '#E3A85E') + dot(58, 24, 1, '#E3A85E');
    return s;
  },
  chocolate: () => {
    let s = ground(32, 60, 20);
    s += part(rr(13, 5, 38, 50, 3), '#6B3A22');
    [0, 1].forEach((cx) => [0, 1, 2].forEach((cy) => {
      const x = 16 + cx * 17, y = 8 + cy * 14;
      s += part(rr(x, y, 15, 12, 2), '#7E4628', { w: 1.6 }) + flat(`M${x + 2} ${y + 2}h11v2h-11Z`, '#A0663E');
    }));
    s += part('M10 34L54 34L54 60L10 60Z', '#D93A4C');
    s += flat('M10 34L54 34L54 37L10 37Z', '#D8CDD6');
    s += line('M10 35.5L14 33.5L18 35.5L22 33.5L26 35.5L30 33.5L34 35.5L38 33.5L42 35.5L46 33.5L50 35.5L54 33.5', '#9C8FA0', 1.4);
    s += part('M32 54C24 49 24 43 28 41C31 40 32 43 32 43C32 43 33 40 36 41C40 43 40 49 32 54Z', '#F6C945', { w: 1.6 });
    s += shine('M14 40L15 56L13 56Z', { opacity: 0.5 });
    return s;
  },
  cupcake: () => {
    let s = ground(32, 61, 18);
    s += part('M12 34H52L47 60H17Z', '#F28AB0');
    s += line('M20 36L22 59M28 36L29 59M36 36L35 59M44 36L42 59', '#C9406B', 1.8);
    s += part('M9 36C5 32 9 25 16 26C14 19 22 14 28 17C30 10 40 10 41 17C48 15 54 21 50 27C57 28 58 36 52 38C40 41 22 41 9 36Z', '#FFF4F8');
    s += line('M14 31C24 34 40 34 50 31M19 24C27 26 37 26 45 24', '#E8D5DE', 1.6);
    s += ball(33, 9, 5, '#D93A4C', 1.8) + gleam(31.4, 7.4, 1.2);
    [[18, 30, '#F6C945', 30], [28, 22, '#4D7BD6', -20], [40, 28, '#9BD86E', 50], [46, 33, '#C6AAF4', -40], [24, 34, '#F28AB0', 10]]
      .forEach(([x, y, c, a]) => { s += flat(rr(x - 2.2, y - 0.8, 4.4, 1.6, 0.8), c, { transform: `rotate(${a} ${x} ${y})` }); });
    return s;
  },
  macarons: () => {
    let s = ground(32, 60, 22);
    const mac = (y, c, inner) => part(`M8 ${y + 4}C8 ${y + 12} 56 ${y + 12} 56 ${y + 4}Z`, c)
      + flat(`M10 ${y + 1}H54V${y + 5}H10Z`, inner)
      + part(`M8 ${y + 1}C8 ${y - 7} 56 ${y - 7} 56 ${y + 1}C56 ${y + 4} 8 ${y + 4} 8 ${y + 1}Z`, c)
      + shine(`M14 ${y - 2}C18 ${y - 5} 24 ${y - 6} 30 ${y - 6}C24 ${y - 4} 18 ${y - 3} 15 ${y}Z`, { opacity: 0.6 });
    s += mac(48, '#6CD3BE', '#FFFFFF');
    s += mac(32, '#B49AF0', '#FFFFFF');
    s += mac(16, '#F28AB0', '#FFFFFF');
    return s;
  },
  gomitas: () => {
    let s = ground(32, 60, 26);
    const bear = (x, y, c, k) => {
      const t = `translate(${x} ${y}) scale(${k})`;
      return G({ transform: t },
        part('M-9 -20C-14 -20 -15 -14 -11 -12C-14 -7 -13 -1 -8 1C-14 2 -16 6 -13 9C-14 15 -10 19 -6 17C-3 21 3 21 6 17C10 19 14 15 13 9C16 6 14 2 8 1C13 -1 14 -7 11 -12C15 -14 14 -20 9 -20C6 -20 4 -18 3 -16C1 -17 -1 -17 -3 -16C-4 -18 -6 -20 -9 -20Z', c, { w: 2 })
        + Cir(-3.5, -8, 1.4, { fill: '#3A2431', 'data-r': 'flat' }) + Cir(3.5, -8, 1.4, { fill: '#3A2431', 'data-r': 'flat' })
        + shine('M-8 -14C-8 -16 -6 -17 -4 -16C-6 -15 -7 -13 -7 -11Z', { opacity: 0.9 }));
    };
    s += bear(20, 30, '#4FC266', 1.05);
    s += bear(42, 36, '#E23B4E', 1.15);
    return s;
  },
  algodon: () => {
    let s = '';
    s += part('M28 40L36 40L33 62L31 62Z', '#FFFFFF', { w: 1.8 });
    s += part('M32 4C38 4 41 8 42 11C47 9 53 13 52 19C57 21 58 28 54 32C57 37 52 43 46 42C44 47 37 48 33 44C29 48 21 47 19 42C12 43 8 37 11 32C6 28 8 21 13 19C12 13 18 8 23 11C24 7 27 4 32 4Z', '#FFC9DC');
    s += line('M19 24C23 20 28 22 31 18M34 30C38 26 43 28 46 24M17 35C21 32 26 34 29 31M33 39C36 36 40 38 43 36', '#F28AB0', 1.8);
    s += shine('M16 20C18 15 22 12 27 12C22 15 19 18 18 22Z', { opacity: 0.85 });
    return s;
  },
  boba: () => {
    let s = ground(32, 61, 16);
    s += part('M14 20H50L46 60H18Z', '#E9C9A0');
    s += shade('M14 20H50L49 30C40 32 24 32 15 30Z', '#FFFFFF', 0.35);
    [[22, 55], [28, 56], [34, 56], [40, 55], [25, 50], [31, 51], [37, 50], [43, 51]].forEach(([x, y]) => { s += Cir(x, y, 2.8, { fill: '#272330', 'data-r': 'flat' }) + Cir(x - 0.9, y - 0.9, 0.8, { fill: '#5E5266', 'data-r': 'flat' }); });
    s += part(ellD(32, 20, 19, 4.4), '#FFFFFF', { w: 2 });
    s += part('M36 22L44 2L48 3L41 22Z', '#F28AB0', { w: 1.8 });
    s += part('M27 40C21 36 21 31 24 29C27 28 28 31 28 31C28 31 29 28 32 29C35 31 35 36 27 40Z', '#C9406B', { w: 1.4 });
    s += shine('M17 26L19 52L17 52Z', { opacity: 0.6 });
    return s;
  },
  leche: () => {
    let s = ground(32, 61, 18);
    s += part('M15 20H49V59H15Z', '#FFFFFF');
    s += part('M15 20L22 8H42L49 20Z', '#E8EEF8');
    s += part('M42 8L49 20H44Z', '#C9D6EE', { w: 1.6 });
    s += flat('M15 31H49V46H15Z', '#6F9BE6');
    s += part('M32 44C26 40 26 35 29 33C31 32 32 35 32 35C32 35 33 32 35 33C38 35 38 40 32 44Z', '#FFFFFF', { w: 1.4 });
    s += flat('M42 31H49V46H42Z', '#2E5BB0');
    s += shine('M18 22L19 56L17 56Z', { opacity: 0.6 });
    s += part(rr(26, 4, 12, 4, 1), '#E8EEF8', { w: 1.6 });
    return s;
  },
  jugo: () => {
    let s = ground(30, 61, 16);
    s += part('M12 14H48L44 60H16Z', '#E8F4FB');
    s += part('M13.2 26H46.8L44 59H16Z', '#EE8434', { w: 1.4 });
    s += flat('M13.2 26H46.8L46.5 29H13.5Z', '#FFB866');
    s += line('M27 30V8M29 30V8', '#D93A4C', 2.4);
    s += line('M27 12V14M29 18V20M27 24V26', '#FFFFFF', 2.4);
    s += ball(47, 14, 9, '#F6C945', 2);
    s += flat(ellD(47, 14, 6, 6), '#FFEC9C');
    s += line('M47 8V20M41 14H53M43 10L51 18M51 10L43 18', '#F6C945', 1.2);
    s += shine('M16 18L19 56L17 56Z', { opacity: 0.6 });
    return s;
  },
};

export const FOOD_IDS = Object.keys(FOOD);

/** SVG (texto) de una comida. En pixel se pinta su versión hecha a mano. */
export function foodSvg(id) {
  const draw = FOOD[id] || FOOD.fresa;
  return svgDoc(64, 64, draw(), { 'data-px-sprite': `food.${FOOD[id] ? id : 'fresa'}` });
}

/** Lo de adentro del SVG (sin la etiqueta <svg>), para React. */
export function foodInner(id) {
  return (FOOD[id] || FOOD.fresa)();
}
