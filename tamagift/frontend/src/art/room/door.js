// La puerta de entrada (fija, a la izquierda del cuarto), su tapete y la
// caja de los pedidos. Por la puerta llegan los paquetes y las visitas.
// Misma vista 3/4 que el resto del cuarto: frentes de tamaño real y, de
// lo que sobresale (el marco, el umbral, la caja), su tapa encima.

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, box, floorShadow, Cir, INK, piece } from './draw.js';

export const DOOR = { w: 116, h: 214 };

const f1 = (n) => +n.toFixed(1);
const BRASS = '#F2C14E';

// Veta de madera: líneas onduladas (no rectas) a lo largo de una tabla.
function grain(x0, x1, y0, y1, n, c, seed = 1) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + 0.5) / n) * (x1 - x0);
    const w = 1.2 + ((i * 7 + seed) % 3) * 0.5;
    const ya = y0 + ((i * 13 + seed * 5) % 9);
    d += `M${f1(x)} ${f1(ya)} C${f1(x + w)} ${f1(ya + (y1 - ya) * 0.3)} ${f1(x - w)} ${f1(ya + (y1 - ya) * 0.6)} ${f1(x + w * 0.5)} ${f1(y1)} `;
  }
  return line(d, c, 1.1, { opacity: 0.4, 'data-skip': 'neon' });
}

// Tablero en relieve: el rebaje oscuro, el campo y su bisel con luz.
function panel(x, y, w, h, m) {
  let s = face(rr(x, y, w, h, 2.5), m.side, { w: 1.6 });
  s += face(rr(x + 3.5, y + 3.5, w - 7, h - 7, 2), m.front, { w: 1.3 });
  s += flat(`M${x + 4.5} ${y + 4.5} H${x + w - 4.5} L${x + w - 7} ${y + 7} H${x + 7} V${y + h - 7} L${x + 4.5} ${y + h - 4.5}Z`, m.top);
  s += flat(`M${x + w - 4.5} ${y + 4.5} V${y + h - 4.5} H${x + 4.5} L${x + 7} ${y + h - 7} H${x + w - 7} V${y + 7}Z`, tone(m.front, -0.45));
  return s;
}

export function doorSvg(wood = '#B98556') {
  const m = mat(wood);
  const trim = mat(tone(wood, -0.55));
  let s = '';
  // marco: jambas con su moldura y el cabezal que sobresale (con tapa)
  s += face(rr(3, 10, 13, 202, 1.5), trim.front) + face(rr(100, 10, 13, 202, 1.5), trim.front);
  s += line('M6 14 V209 M103 14 V209', trim.hi, 1.4, { opacity: 0.7 }) + line('M13 14 V209 M110 14 V209', trim.deep, 1.2, { opacity: 0.45 });
  // la hoja de la puerta, metida en el marco
  s += face(rr(16, 14, 84, 194, 1), m.front, { w: 2.2 });
  s += grain(18, 98, 16, 206, 9, m.deep, 3);
  s += shade('M16 14 H100 V21 H16Z', '#2A1C24', 0.22) + shade('M95 21 H100 V208 H95Z', '#2A1C24', 0.12);
  // ventanita redonda con su aro, el vidrio y dos brillos
  s += part(ellD(58, 56, 23, 23), m.side, { w: 2 });
  s += part(ellD(58, 56, 18.5, 18.5), '#BFE0F5', { w: 1.6 });
  s += flat('M43 62 C47 72 63 76 72 68 C66 78 48 78 43 62Z', '#A6CDE8');
  s += face(rr(56.4, 38, 3.2, 36, 0.8), m.top, { w: 1.2 }) + face(rr(40, 54.4, 36, 3.2, 0.8), m.top, { w: 1.2 });
  s += shine('M46 47 L52 41 L54 43 L48 49Z', { opacity: 0.85 }) + shine('M50 51 L56 45 L57 46.4 L51 52.4Z', { opacity: 0.6 });
  s += line('M42 43 Q49 35 58 33.4', m.hi, 1.4, { opacity: 0.8 });
  // ranura del correo, de bronce
  s += face(rr(40, 86, 36, 9, 2.5), BRASS, { w: 1.6 }) + flat(rr(44, 89, 28, 3, 1.2), '#7A5A2A') + line('M42.5 87.6 H73.5', '#FFF0B8', 1, { opacity: 0.9 });
  // dos tableros en relieve
  s += panel(26, 104, 28, 94, m) + panel(62, 104, 28, 94, m);
  // bisagras
  [[34, 50], [160, 50]].forEach(([y]) => { s += face(rr(14.6, y, 5, 14, 1), '#7C7186', { w: 1.2 }) + line(`M17 ${y + 2} V${y + 12}`, '#B4AABF', 1); });
  // pomo de bronce con roseta y bocallave
  s += face(rr(91.6, 112, 7, 26, 3.4), tone(BRASS, -0.35), { w: 1.4 });
  s += part(ellD(95.1, 121, 4.8, 4.8), BRASS, { w: 1.6 }) + Cir(93.6, 119.4, 1.5, { fill: '#FFFFFF', 'data-r': 'shine' });
  s += flat('M94.1 129 h2 v3.6 h-2Z', '#5A4020') + Cir(95.1, 129, 1.3, { fill: '#5A4020', 'data-r': 'flat' });
  // cabezal con tapa (sobresale de la pared)
  s += face(rr(0, 2, 116, 5, 2), trim.top, { w: 1.8 }) + face(rr(0, 6, 116, 9, 1), trim.front, { w: 1.8 });
  s += line('M3 9 H113', trim.hi, 1.3, { opacity: 0.6 });
  // umbral: escalón de madera con su tapa
  s += face(rr(6, 203, 104, 5, 1.5), mix(m.top, '#FFFFFF', 0.1), { w: 1.6 }) + face(rr(6, 207, 104, 7, 1), m.side, { w: 1.6 });
  return piece(DOOR.w, DOOR.h, s);
}

// Tapete de coco con un corazón y dos huellitas: apoyado en el piso, se ve
// su cara de arriba (aplastada) y el canto de adelante.
export function doormatSvg(color = '#C97A5A') {
  const m = mat(color);
  let s = floorShadow(70, 39, 64, 5.5);
  s += face(rr(8, 31, 124, 6, 3), m.side, { w: 1.8 });
  s += face(rr(8, 7, 124, 28, 6), m.front, { w: 1.8 });
  // borde trenzado
  s += face(rr(15, 11, 110, 20, 4), tone(color, 0.45), { w: 1.4 });
  let fib = '';
  for (let x = 12; x < 130; x += 5) fib += `M${x} 8.6 l2 2 M${x + 1} 31.4 l2 -2 `;
  s += line(fib, m.deep, 1, { opacity: 0.45, 'data-skip': 'neon' });
  // el corazón y las huellitas (aplastados como el tapete)
  s += part('M70 27 C61 22 57 18 58 14.6 C59 12 63 11.4 66 13 Q68.4 14.2 70 16 Q71.6 14.2 74 13 C77 11.4 81 12 82 14.6 C83 18 79 22 70 27Z', '#FFE3D3', { w: 1.4 });
  s += shine('M61 15.4 Q62 13.6 64.4 13.6 Q62.6 14.6 62.2 16Z', { opacity: 0.8 });
  const paw = (x, y) => flat(`${ellD(x, y + 2, 3.6, 2.2)} ${ellD(x - 4, y - 1.6, 1.4, 1)} ${ellD(x - 1.4, y - 3, 1.4, 1)} ${ellD(x + 1.4, y - 3, 1.4, 1)} ${ellD(x + 4, y - 1.6, 1.4, 1)}`, tone(color, -0.8));
  s += paw(34, 20) + paw(106, 20);
  return piece(140, 44, s);
}

// Caja del pedido: cartón con las solapas cerradas y cinta de embalar,
// etiqueta con un corazón y flechas de "este lado arriba". `open` la
// dibuja abierta: solapas afuera, papel de seda asomando y brillitos.
export function parcelSvg(open = false) {
  const C = '#D9A86C';
  const cm = mat(C);
  const TAPE = '#EFD29A';
  let s = floorShadow(open ? 52 : 50, 91, 44, 6.5);
  if (open) {
    const x = 14, w = 76;
    // solapa de atrás, parada
    s += face(`M${x + 2} 30 L${x + w - 2} 30 L${x + w - 6} 14 L${x + 6} 14Z`, cm.top);
    s += line(`M${x + 8} 18 H${x + w - 8}`, tone(C, -0.4), 1, { opacity: 0.5 });
    // la caja y su boca
    s += box(x, 90, w, 44, 32, C, { r: 2 });
    s += face(rr(x + 4, 31, w - 8, 12, 2), '#6E4C38', { w: 1.6 });
    s += flat(rr(x + 5, 32, w - 10, 4.6, 1.5), '#946A4A');
    // papel de seda asomando
    s += part(`M${x + 10} 40 C${x + 8} 32 ${x + 16} 26 ${x + 22} 31 C${x + 24} 22 ${x + 36} 22 ${x + 38} 30 C${x + 42} 22 ${x + 54} 24 ${x + 54} 32 C${x + 60} 27 ${x + 68} 32 ${x + 66} 40Z`, '#FFC9DA', { w: 1.5 });
    s += line(`M${x + 22} 31 L${x + 25} 38 M${x + 38} 30 L${x + 39} 38 M${x + 54} 32 L${x + 52} 38`, '#F29BB8', 1.2);
    s += shine(`M${x + 16} 31 Q${x + 18} 28 ${x + 21} 28.4 Q${x + 18} 30 ${x + 17.6} 33Z`, { opacity: 0.8 });
    // solapas de los lados abiertas hacia afuera
    s += face(`M${x} 30 L${x - 12} 20 L${x - 14} 36 L${x} 44Z`, tone(C, 0.35));
    s += face(`M${x + w} 30 L${x + w + 12} 20 L${x + w + 14} 36 L${x + w} 44Z`, tone(C, -0.25));
    // solapa de adelante, caída sobre el frente (se ve su cara de adentro)
    s += shade(`M${x + 2} 60 L${x + w - 2} 60 L${x + w - 2} 65 L${x + 2} 65Z`, '#5A3A20', 0.25);
    s += face(`M${x} 45.6 L${x + w} 45.6 L${x + w + 3} 61 L${x - 3} 61Z`, mix(C, '#F3E3C8', 0.35));
    s += line(`M${x + 4} 49.4 H${x + w - 4}`, tone(C, -0.3), 1, { opacity: 0.45 });
    // la cinta cortada quedó en la solapa de atrás
    s += face(`M${x + 32} 14 L${x + 44} 14 L${x + 44} 24 L${x + 41} 22.4 L${x + 38} 24.6 L${x + 35} 22.4 L${x + 32} 24Z`, TAPE, { w: 1.2 });
    [[20, 7, 6], [52, 4, 7.4], [85, 9, 5.6]].forEach(([px, py, r]) => { s += P4(px, py, r, '#FFE07A'); });
    return piece(104, 96, s);
  }
  s += box(10, 90, 80, 44, 32, C, { r: 2 });
  // la costura de las solapas de arriba y la cinta que la cierra
  s += line('M50 29 V44', tone(C, -1), 1.3, { opacity: 0.7 });
  s += face('M44 28.4 L56 28.4 L56 44 L44 44Z', TAPE, { w: 1.4 });
  s += face('M44 44 L56 44 L56 57 L53 55.4 L50 57.6 L47 55.4 L44 57Z', TAPE, { w: 1.4 });
  s += shine('M45.6 30 h2 v26 h-2Z', { opacity: 0.45 });
  // canto de las solapas en el frente
  s += line('M13 47 H87', tone(C, -0.5), 1, { opacity: 0.5 });
  // etiqueta de envío con corazón
  s += face(rr(16, 58, 24, 17, 1.5), '#FFFBF3', { w: 1.4 });
  s += line('M19 62.4 H31 M19 66 H28 M19 69.6 H26', '#B8A890', 1.1);
  s += part('M35 71.6 C32.4 70 31 68.6 31.2 67.2 C31.4 66 33 65.6 35 67 C37 65.6 38.6 66 38.8 67.2 C39 68.6 37.6 70 35 71.6Z', '#FF6F91', { w: 1 });
  // flechas de "este lado arriba"
  // (trazos y no rellenos: en pixel, un relleno encima de la cara le
  // dibuja un halo de luz y sombra alrededor)
  s += line('M73 70.4 V61.6 M68.8 65.8 L73 61.6 L77.2 65.8 M83 70.4 V61.6 M78.8 65.8 L83 61.6 L87.2 65.8 M69 74 H87', tone(C, -0.9), 2.6);
  return piece(100, 96, s);
}

function P4(x, y, r, c) {
  return `<path d="M${x} ${y - r} Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y} Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r} Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y} Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r}Z" fill="${c}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round" data-r="part"/>`;
}
