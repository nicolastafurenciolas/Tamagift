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
    s += part('M8 18C9 38 22 54 41 54C50 54 56 49 59 40C55 43 49 45 43 44C29 43 18 32 15 16C14 12 9 12 8 18Z', '#F6C945');
    s += line('M14 24C18 38 28 47 42 49', '#D59B1E', 2, { opacity: 0.9 });
    s += shine('M10 21C11 30 14 37 20 43C14 38 11 31 10 21Z', { opacity: 0.7 });
    s += part('M8 18L8 11C8 9 12 9 12 11L14 16Z', '#5A2F20', { w: 1.8 });
    s += Cir(58.5, 40.5, 1.8, { fill: '#5A2F20', 'data-r': 'flat' });
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
  // Arepa de maíz gruesa en 3/4 (canto y tapa) con las manchitas
  // tostadas de la plancha, abierta por el canto: el queso blanco
  // derretido se sale por la raja y chorrea.
  arepa: () => {
    let s = ground(32, 57, 27);
    s += part('M5 33V41C5 49 17 54 32 54C47 54 59 49 59 41V33Z', '#E0B468');
    s += line('M7 43C15 48.5 49 48.5 57 43', '#F2D594', 1.6, { opacity: 0.8 });
    [[10, 46], [20, 50], [44, 50], [54, 46]].forEach(([x, y]) => { s += dot(x, y, 1.2, '#B87A3A'); });
    s += part(ellD(32, 33, 27, 13), '#F6E2A8');
    s += shade(ellD(27, 30, 17, 7), '#FFF6DA', 0.8);
    [[15, 29, 2.4, 1.4], [27, 24, 2, 1.2], [41, 27, 2.6, 1.5], [21, 37, 2.2, 1.3], [37, 38, 2.4, 1.3], [49, 34, 2, 1.2], [10, 35, 1.6, 1], [32, 31, 1.4, 0.9]]
      .forEach(([x, y, rx, ry], i) => { s += Ell(x, y, rx, ry, { fill: i % 2 ? '#B87A3A' : '#9A5A28', opacity: 0.85, 'data-r': 'flat' }); });
    // la raja del canto y el queso que se sale
    s += line('M12 44C20 47 44 47 52 44', '#7A4A1E', 2);
    s += part('M13 44C20 46.5 44 46.5 51 44C51 47 47 49.5 41 50C38 50 37 52 36 55C35 58 31 58 31 55C30 52 28 50.5 24 50.5C18 50 13 48 13 44Z', '#FFFFFF', { w: 1.8 });
    s += shade('M36 48C41 48.5 46 47.5 49 46C48 48.5 44 50 40 50Z', '#C9BCD0', 0.6);
    s += shade('M32 51C33 53 33 55 32.5 56C32 55 31.6 53 32 51Z', '#C9BCD0', 0.5);
    s += shine('M12 29C14 25 18 23 22 22C18 25 16 27 14 31Z', { opacity: 0.55 });
    return s;
  },
  // Empanada acostada con el lado recto hacia adelante: arriba se ve el
  // domo dorado y, por todo el arco de atrás, el repulgue trenzado.
  empanada: () => {
    let s = ground(32, 56, 27);
    s += part('M4 42C4 48 17 52 32 52C47 52 60 48 60 42L60 39L4 39Z', '#C27A2E');
    s += part('M4 42C4 24 16 12 32 12C48 12 60 24 60 42C52 46 12 46 4 42Z', '#ECAA52');
    s += shade('M10 38C10 26 19 17 32 17C24 21 16 29 16 40Z', '#FFE2A6', 0.75);
    s += shade('M46 20C53 25 57 33 57 41C54 43 50 43 47 44C50 36 50 28 46 20Z', '#B8681E', 0.35);
    // repulgue: un cordón tostado por el arco y, encima, sus trenzas
    // claras (sin contorno propio: a tamaño chico no se vuelven una
    // corona oscura en los estilos de contorno grueso)
    s += line('M8.5 40C8.5 26 19 16.5 32 16.5C45 16.5 55.5 26 55.5 40', '#C8802E', 5.2);
    let crimp = '';
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.05 + 0.9 * (i / 12));
      const x = 32 - Math.cos(a) * 23.5, y = 41 - Math.sin(a) * 24.5;
      crimp += Ell(x - 0.4, y - 0.4, 2.4, 1.5, { fill: '#F8D08A', 'data-r': 'flat', transform: `rotate(${(a * 180) / Math.PI - 60} ${x} ${y})` });
    }
    s += crimp;
    [[27, 28], [37, 30], [31, 36], [22, 34], [42, 37]].forEach(([x, y]) => { s += dot(x, y, 1.3, '#C58A3E'); });
    [9, 17, 25, 33, 41, 49].forEach((x) => { s += line(`M${x} 46V49`, '#8E4E1E', 1.4, { opacity: 0.6 }); });
    s += shine('M15 27C17 22 22 19 27 18C23 21 20 24 18 29Z', { opacity: 0.6 });
    return s;
  },
  // Ajiaco en cazuela de barro: orejitas, caldo amarillo, mazorca, crema
  // y guascas, y el vapor subiendo.
  sopa: () => {
    let s = ground(32, 58, 24);
    s += line('M22 21C19 17 25 14 22 9M32 20C29 16 35 13 32 8M42 21C39 17 45 14 42 9', '#E4DAEC', 2.6, { opacity: 0.95 });
    s += part(ellD(7, 36, 5.6, 3.8), '#C2603A', { w: 2 });
    s += part(ellD(57, 36, 5.6, 3.8), '#C2603A', { w: 2 });
    s += part('M7 33C7 46 14 55 32 55C50 55 57 46 57 33Z', '#C2603A');
    s += shade('M11 36C12 45 17 51 25 53C17 52 11 46 11 36Z', '#F2B08A', 0.7);
    s += line('M10 42C20 46 44 46 54 42', '#8E3A20', 1.8, { opacity: 0.7 });
    [16, 24, 32, 40, 48].forEach((x, i) => { s += dot(x, 45 + (i % 2 ? 0.6 : -0.2), 1.3, '#F2B08A'); });
    s += part(ellD(32, 33, 25.5, 7.6), '#D8784A');
    s += flat(ellD(32, 33.6, 22, 5.6), '#E3A43A');
    s += flat(ellD(29, 32.6, 15, 3.2), '#F6CE6A');
    s += part(rr(36, 27, 11, 6.5, 3.2), '#F6C83A', { w: 1.6 });
    s += line('M39 28V33M42 28V33M45 28V33', '#D89A1A', 1.1);
    s += part(ellD(21, 32, 5.4, 2.6), '#FFF8EC', { w: 1.6 });
    s += Cir(28, 36, 1.4, { fill: '#4FA358', 'data-r': 'flat' }) + Cir(15, 34, 1.3, { fill: '#4FA358', 'data-r': 'flat' }) + Cir(49, 35, 1.3, { fill: '#2C6A3D', 'data-r': 'flat' });
    s += Ell(32, 36.5, 3, 1.4, { fill: '#F2E0A8', 'data-r': 'flat' });
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
    // la pila es una sola pieza (el canto de los tres panqueques) y las
    // separaciones son trazos tostados: así no se vuelve un bloque de
    // contornos en los estilos de línea gruesa
    s += part('M6 30V49C6 54 18 56.5 32 56.5C46 56.5 58 54 58 49V30Z', '#E3A85E');
    s += line('M6.5 37C9 42 20 44 32 44C44 44 55 42 57.5 37M6.5 44C9 49 20 51 32 51C44 51 55 49 57.5 44', '#B8742E', 2);
    s += line('M8 33C12 38 22 40 32 40C42 40 52 38 56 33M8 40C12 45 22 47 32 47C42 47 52 45 56 40', '#F6CF92', 1.6, { opacity: 0.9 });
    s += shade('M48 33C53 36 56 40 57 44V49C56 52 52 54 47 55Z', '#9C5A20', 0.25);
    s += part(ellD(32, 30, 26, 8), '#F2CB94');
    s += shade(ellD(27, 28.5, 15, 4.5), '#FFE8BE', 0.7);
    s += flat('M14 30C16 25 26 24 32 24C40 24 48 26 50 30C49 33 44 33 44 37C42 40 40 38 40 35C34 37 26 37 22 35C22 40 19 42 18 38C17 35 14 34 14 30Z', '#C8681E');
    s += flat('M20 28C24 26 30 25.5 34 26C29 27 24 28 21 30Z', '#E8902E');
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
  // Un nigiri de salmón atrás y un maki adelante.
  sushi: () => {
    let s = ground(32, 57, 27);
    let n = part(rr(7, 30, 50, 23, 9), '#FFF8F0');
    [[15, 44], [24, 48], [38, 46], [48, 42], [30, 41]].forEach(([x, y]) => { n += Ell(x, y, 1.8, 1, { fill: '#D8CDD6', 'data-r': 'flat' }); });
    n += part('M5 30C5 20 16 15 32 15C48 15 59 20 59 30C59 36 50 37 44 36C38 35 26 35 20 36C14 37 5 36 5 30Z', '#F7955A');
    n += line('M13 23L20 31M22 19L30 30M33 18L41 30M44 20L51 30', '#FFD3B5', 2.4);
    n += shine('M10 26C12 21 17 19 22 18C17 21 13 24 12 28Z', { opacity: 0.6 });
    n += part(rr(28, 14, 8, 40, 1), '#272330', { w: 1.8 });
    n += line('M30 18V50', '#5E5266', 1.2);
    s += G({ transform: 'translate(-1 -4) scale(0.84)' }, n);
    // maki: cilindro de alga, arroz y el centro de salmón y pepino
    s += part('M37 41V53C37 58 61 58 61 53V41Z', '#272330');
    s += line('M41 44V54', '#5E5266', 1.4, { opacity: 0.8 });
    s += part(ellD(49, 41, 12, 5.6), '#2E3A36');
    s += flat(ellD(49, 41, 10, 4.2), '#FFF8F0');
    [[43, 40], [55, 42], [49, 44]].forEach(([x, y]) => { s += Ell(x, y, 1.3, 0.8, { fill: '#D8CDD6', 'data-r': 'flat' }); });
    s += part(ellD(49, 41, 4.6, 2.2), '#F7955A', { w: 1.4 });
    s += dot(51, 41, 1.3, '#4FA358');
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
    // franja blanca de adorno que sigue la curva del tazón, con puntitos
    s += line('M8 41C16 45.5 48 45.5 56 41', '#FFF4E6', 3.2);
    [15, 23.5, 32, 40.5, 49].forEach((x, i) => { s += dot(x, 43.4 + (i === 0 || i === 4 ? -0.8 : 0.4), 1.1, '#8C1F3A'); });
    s += shine('M9 36C10 42 13 47 17 50C12 47 9 42 9 36Z', { opacity: 0.55 });
    return s;
  },
  // Taco de lado e inclinado: la tortilla doblada (media luna) adelante y
  // el relleno asomando por la abertura.
  tacos: () => {
    let s = ground(32, 58, 25);
    let t = '';
    [[8, 27, 5.2], [16, 25, 6], [26, 24, 6.2], [37, 24, 6.2], [47, 25, 6], [55, 27, 5]].forEach(([x, y, r]) => { t += ball(x, y, r, '#4FA358', 1.8) + Cir(x - 1.6, y - 1.8, r * 0.4, { fill: '#9BD86E', 'data-r': 'flat' }); });
    t += part(rr(8, 27, 48, 6, 3), '#8A4A26', { w: 1.6 });
    [[14, 29], [27, 30], [41, 29], [50, 30]].forEach(([x, y]) => { t += dot(x, y, 1.3, '#B8683A'); });
    [[20, 26], [42, 25]].forEach(([x, y]) => { t += ball(x, y, 3.4, '#E23B4E', 1.6) + gleam(x - 1.2, y - 1.2, 0.9); });
    [[31, 28, 20], [11, 30, -15], [53, 29, 30]].forEach(([x, y, a]) => { t += flat(rr(x - 3, y - 0.9, 6, 1.8, 0.9), '#FFE680', { transform: `rotate(${a} ${x} ${y})` }); });
    t += part('M5 32A27 25 0 0 0 59 32Z', '#F4C842');
    t += line('M7 33.5H57', '#FFE27A', 2.4);
    [[18, 42], [33, 49], [46, 41], [25, 52], [40, 53], [12, 38]].forEach(([x, y]) => { t += dot(x, y, 1.5, '#D59B1E'); });
    t += shine('M9 37C11 45 16 50 22 53C14 50 10 44 9 37Z', { opacity: 0.6 });
    s += G({ transform: 'rotate(-14 32 38)' }, t);
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
  // Perro caliente con el pan abierto: la mitad de atrás, la salchicha
  // que asoma por los dos lados con su mostaza en onda y la mitad de
  // adelante del pan encima.
  perro: () => {
    let s = ground(32, 54, 28);
    s += part('M8 32C8 22 18 18.5 32 18.5C46 18.5 56 22 56 32Z', '#E3A35E');
    s += shade('M14 25C19 21.5 27 21 34 21C27 22.5 20 24.5 16 28Z', '#FFE4B0', 0.75);
    s += part(rr(2.5, 24.5, 59, 12.5, 6.2), '#C8462E');
    s += line('M8 27.8H50', '#F49A82', 2, { opacity: 0.85 });
    s += line('M9 31.5C11 27.5 13 27.5 15 31.5S19 35.5 21 31.5S25 27.5 27 31.5S31 35.5 33 31.5S37 27.5 39 31.5S43 35.5 45 31.5S49 27.5 51 31.5S54 34 55 32', '#FFD02A', 2.6);
    s += part('M6 34C6 46 16 50.5 32 50.5C48 50.5 58 46 58 34C50 37.5 14 37.5 6 34Z', '#E8A452');
    s += shade('M10 38C16 40 25 41 33 41C25 42.5 16 42 11 41Z', '#FFE4B0', 0.75);
    s += shade('M44 45C50 44 54 41 56 38C56 43 52 47 46 48Z', '#B8681E', 0.35);
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
  // Tajada de torta con el corte de frente (capas de bizcocho, crema y
  // mermelada) y, encima, la tapa en triángulo hacia atrás con crema.
  pastel: () => {
    let s = ground(32, 58, 25);
    s += part('M8 30H54V55H8Z', '#F6D9A6');
    s += flat('M8 34H54V37H8Z', '#FFF4E6');
    s += flat('M8 41H54V45H8Z', '#E85A78');
    s += flat('M8 44H54V45H8Z', '#B8304E');
    s += flat('M8 49H54V51H8Z', '#FFF4E6');
    s += shade('M48 30H54V55H48Z', '#B8803E', 0.25);
    [[16, 52], [30, 53], [44, 52], [22, 39], [38, 39]].forEach(([x, y]) => { s += dot(x, y, 0.9, '#E3B47A'); });
    s += part('M7 30L55 30L33 17Z', '#FFFFFF');
    s += flat('M8 30C8 34 10 35 11 33C12 36 15 36 15 32C17 35 20 35 21 31L8 30Z', '#FFFFFF');
    s += flat('M34 30C34 33 36 34 37 32C39 35 42 34 42 30Z', '#FFFFFF');
    s += part(ellD(33, 22, 5.6, 3.6), '#FFFFFF', { w: 1.6 });
    s += ball(33, 15, 5.4, '#E23B4E', 2) + gleam(31, 13, 1.3);
    s += part('M33 10L30 7L33 8L36 7Z', '#4FA358', { w: 1.4 });
    return s;
  },
  // Variante para la comida que escribe quien regala ("pastel de
  // chocolate", "torta de chocolate", "brownie"…): la misma tajada, con
  // bizcocho de chocolate, crema, ganache que chorrea y una cereza.
  pastelChocolate: () => {
    let s = ground(32, 58, 25);
    s += part('M8 30H54V55H8Z', '#7A4428');
    s += flat('M8 35H54V38H8Z', '#F6E6D2');
    s += flat('M8 42H54V46H8Z', '#4A2212');
    s += flat('M8 42H54V43H8Z', '#8A4A2A');
    s += flat('M8 50H54V52H8Z', '#F6E6D2');
    s += shade('M48 30H54V55H48Z', '#2A1008', 0.25);
    [[16, 40], [30, 40], [44, 40], [22, 48], [38, 48], [14, 53], [46, 53]].forEach(([x, y]) => { s += dot(x, y, 0.9, '#9A5C3C'); });
    s += part('M7 30L55 30L33 17Z', '#5A2A18');
    s += flat('M8 30C8 34 10 35.5 11.5 33C12.5 37 15.5 37 15.5 32C17 35 20 35 21 31L8 30Z', '#5A2A18');
    s += flat('M33 30C33 33.5 35 35 36.5 32.5C38 36.5 41.5 35.5 41.5 30Z', '#5A2A18');
    s += flat('M48 30C48 32.5 49.5 33.5 50.5 31.5Z', '#5A2A18');
    s += shine('M15 28L30 20.5L32 21.5L18 29Z', { opacity: 0.35 });
    [[22, 26, 30], [40, 25, -25], [28, 28, 70]].forEach(([x, y, a]) => { s += flat(rr(x - 2, y - 0.7, 4, 1.4, 0.7), '#C08050', { transform: `rotate(${a} ${x} ${y})` }); });
    s += part(ellD(33, 22, 5.6, 3.6), '#FFF4E6', { w: 1.6 });
    s += ball(33, 15, 5.4, '#C8243A', 2) + gleam(31, 13, 1.3);
    s += line('M34 10C35 7 37 5 39 4', '#5A2F20', 1.6);
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
