// ─────────────────────────────────────────────────────────────────
// La decoración de las fechas de la pareja (personal/dates.js): lo que
// aparece en el cuarto los días de su cumpleaños, su aniversario o el
// día que se conocieron. Tres juegos, cada uno con lo mismo:
//
//              pared            cartel        izquierda   derecha     piso
//   cumple     banderines       cinta rosa    globos      pastel      confeti
//   amor       corazones        cinta roja    velas       rosas       pétalos
//   recuerdo   estrellas (luz)  cinta azul    farol       recuerdos   estrellitas
//
// El cartel lleva el texto ("Feliz cumple, Ana") encima, en la letra del
// estilo (lo pone CelebrationLayer: CARTEL.text es el hueco).
//
// Misma vista 3/4 que el cuarto (draw.js): frente + tapa a media
// profundidad, lo redondo apoyado es una elipse aplastada, luz de arriba
// a la izquierda, sombras de contacto. Lo que cuelga, de su clavito y su
// cordel; los globos, atados a su pesito. Medidas en unidades del mundo
// (la mochi mide 200). Detalles de 2–3 unidades para arriba; lo repetido
// en un solo trazo por color.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, tube, hollow, INK, piece, G, Ell } from './draw.js';
import { floorSh, glow, gloss, heart, star, dots, bow, flame, roundShade, sparkle, GOLD } from './decorVibes.js';

const f1 = (v) => +v.toFixed(1);

function seeded(seed) {
  let r = seed % 233280;
  return () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
}

// Cordel curvo: en pixel un trazo fino en curva sale punteado; ahí va
// como tubo relleno.
const cord = (d, c, w = 2) => G({ 'data-skip': 'pixel' }, line(d, c, w)) + G({ 'data-only': 'pixel' }, tube(d, w + 0.8, c, { w: 0.8 }));
const nail = (x, y) => part(ellD(x, y, 3, 3), '#9A8F9E', { w: 1.2 }) + shine(ellD(x - 1, y - 1, 1, 1), { opacity: 0.9 });
const wallSh = (d, op = 0.14) => G({ transform: 'translate(3 4)' }, shade(d, '#2A1C24', op));
// Halo de luz: ni en neón (lo hacen los tubos) ni en lo-fi ni en papel
// (allí un disco claro se ve como una mancha).
const halo = (...a) => `<g data-skip="lofi papel">${glow(...a)}</g>`;

// Un cordel que cuelga entre (x0,y0) y (x1,y0) con `sag` de comba:
// `at(x)` da la altura y la pendiente.
function sagging(x0, x1, y0, sag) {
  const cx = (x0 + x1) / 2, cy = y0 + sag * 2;
  const at = (x) => { const t = (x - x0) / (x1 - x0); return [y0 + sag * 4 * t * (1 - t), (sag * 4 * (1 - 2 * t)) / (x1 - x0)]; };
  return { d: `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y0}`, at };
}

// ═════════════════════════════════════════════════════════════════
// PARED
// ═════════════════════════════════════════════════════════════════
export const SWAG = { w: 420, h: 104 };

const PARTY = ['#F59AB5', '#FFD86B', '#8FD9C0', '#8CC8F0', '#C3A3F0'];

/** Banderines de fiesta, 420×104: tela con dobladillo y estampados. */
export function banderinesSvg() {
  const str = sagging(10, 410, 12, 15);
  let s = '';
  const n = 11;
  for (let i = 0; i < n; i++) {
    const x = 10 + ((i + 0.5) / n) * 400;
    const [y, sl] = str.at(x);
    const a = Math.atan(sl), ca = Math.cos(a), sa = Math.sin(a);
    const hw = 15.5;
    const L = [x - hw * ca, y - hw * sa], R = [x + hw * ca, y + hw * sa];
    const sway = [1.4, -1, 0.6, -1.4, 1, -0.6, 1.2, -1.2, 0.8, -0.8, 1][i];
    const tip = [x + sway, y + 40 + (i % 3 === 1 ? 2 : 0)];
    const c = PARTY[i % PARTY.length];
    const m = mat(c);
    const flag = `M${f1(L[0])} ${f1(L[1])}L${f1(R[0])} ${f1(R[1])}Q${f1(x + 9)} ${f1(y + 21)} ${f1(tip[0])} ${f1(tip[1])}Q${f1(x - 8)} ${f1(y + 21)} ${f1(L[0])} ${f1(L[1])}Z`;
    s += wallSh(flag, 0.12);
    s += part(flag, c, { w: 1.6 });
    // el lado derecho un poco en sombra (la tela se curva)
    s += shade(`M${f1(x + 1)} ${f1(y + 3)}L${f1(R[0] - 1.5)} ${f1(R[1] + 1)}Q${f1(x + 8)} ${f1(y + 20)} ${f1(tip[0])} ${f1(tip[1] - 2)}Z`, m.deep, 0.2);
    // dobladillo sobre el cordel
    s += flat(`M${f1(L[0] + 0.8)} ${f1(L[1] + 0.6)}L${f1(R[0] - 0.8)} ${f1(R[1] + 0.6)}L${f1(R[0] - 2)} ${f1(R[1] + 4.6)}L${f1(L[0] + 2)} ${f1(L[1] + 4.6)}Z`, m.side);
    // estampado: lunares, corazón, rayita, estrella
    const cx = x + sway * 0.35, cy = y + 17;
    if (i % 4 === 0) s += dots([[cx - 5, cy - 2], [cx + 5, cy - 2.4], [cx, cy + 6]], 2.1, '#FFFFFF', { opacity: 0.92 });
    else if (i % 4 === 1) s += flat(heart(f1(cx), f1(cy), 5.4), '#FFFFFF', { opacity: 0.92 });
    else if (i % 4 === 2) s += flat(`M${f1(cx - 8)} ${f1(cy - 3)}H${f1(cx + 8)}L${f1(cx + 6.4)} ${f1(cy + 1)}H${f1(cx - 6.4)}Z`, '#FFFFFF', { opacity: 0.88 });
    else s += flat(star(f1(cx), f1(cy + 1), 6.2, 0.5), '#FFFFFF', { opacity: 0.92 });
  }
  s += cord(str.d, '#B07A8E', 2.2);
  // pompones entre las banderas, donde se anuda el cordel
  [0.18, 0.5, 0.82].forEach((t, k) => {
    const x = 10 + t * 400, [y] = str.at(x);
    const c = ['#FFFFFF', '#FFE58A', '#FFFFFF'][k];
    s += part(ellD(f1(x), f1(y + 1), 5, 5), c, { w: 1.3 }) + shine(ellD(f1(x - 1.5), f1(y - 0.6), 1.5, 1.4), { opacity: 0.8 });
  });
  s += nail(10, 11) + nail(410, 11);
  return piece(SWAG.w, SWAG.h, s);
}

/** Guirnalda de corazones de fieltro, 420×104, con cuentas de madera. */
export function corazonesSvg() {
  const str = sagging(10, 410, 12, 14);
  const cols = ['#F25C7A', '#FFFFFF', '#F7A1B5'];
  let s = '';
  const n = 9;
  const hearts = [];
  for (let i = 0; i < n; i++) {
    const x = 10 + ((i + 0.5) / n) * 400;
    const [y] = str.at(x);
    const big = i % 2 === 0;
    const r = big ? 15 : 11;
    const drop = big ? 13 : 9;
    hearts.push({ x, y, r, drop, c: cols[i % 3], i });
  }
  // los hilitos que bajan del cordel
  hearts.forEach(({ x, y, drop }) => { s += line(`M${f1(x)} ${f1(y)}V${f1(y + drop + 2)}`, '#B07A8E', 1.6); });
  s += cord(str.d, '#B07A8E', 2.2);
  // cuentas de madera entre corazón y corazón
  const beads = [];
  for (let i = 0; i < n - 1; i++) { const x = 10 + ((i + 1) / n) * 400; const [y] = str.at(x); beads.push([f1(x), f1(y)]); }
  s += beads.map(([x, y]) => part(ellD(x, y, 3.6, 3.4), '#D9A877', { w: 1.2 })).join('');
  s += dots(beads.map(([x, y]) => [x - 1.1, y - 1.1]), 1.1, '#F6DDBF');
  hearts.forEach(({ x, y, r, drop, c }) => {
    const cy = y + drop + r * 0.62;
    const h = heart(f1(x), f1(cy), r);
    const m = mat(c);
    s += wallSh(h, 0.13);
    s += part(h, c, { w: 1.7 });
    // volumen: el lóbulo de la derecha y la punta en sombra
    s += shade(`M${f1(x)} ${f1(cy + r * 0.85)}C${f1(x + r * 1.1)} ${f1(cy + r * 0.1)} ${f1(x + r * 1.05)} ${f1(cy - r * 0.95)} ${f1(x + r * 0.2)} ${f1(cy - r * 0.42)}C${f1(x + r * 0.7)} ${f1(cy - r * 0.2)} ${f1(x + r * 0.55)} ${f1(cy + r * 0.4)} ${f1(x)} ${f1(cy + r * 0.85)}Z`, c === '#FFFFFF' ? '#E5B8C6' : m.deep, c === '#FFFFFF' ? 0.45 : 0.25);
    // costura (en pixel no: queda como puntos sueltos)
    const ink = c === '#FFFFFF' ? '#F25C7A' : '#FFFFFF';
    s += line(heart(f1(x), f1(cy), f1(r * 0.68)), ink, 1.3, { 'stroke-dasharray': '2.6 2.4', opacity: 0.9, 'data-skip': 'pixel' });
    s += shine(ellD(f1(x - r * 0.48), f1(cy - r * 0.42), f1(r * 0.17), f1(r * 0.12)), { opacity: 0.75 });
  });
  s += nail(10, 11) + nail(410, 11);
  return piece(SWAG.w, SWAG.h, s);
}

/** Luces de estrellas, 420×104: portalámparas y estrellas de vidrio encendidas. */
export function estrellasSvg() {
  const str = sagging(10, 410, 12, 16);
  const cols = ['#FFD95A', '#A9CBFF', '#FFD95A', '#FFB3C6'];
  let s = '';
  const n = 9;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = 10 + ((i + 0.5) / n) * 400;
    const [y] = str.at(x);
    pts.push([x, y, cols[i % cols.length], i % 2 ? 11 : 13.5]);
  }
  pts.forEach(([x, y, c, r]) => { s += `<g data-skip="pixel">${halo(f1(x), f1(y + 18), r * 1.9, r * 1.9, c === '#A9CBFF' ? '#E3EEFF' : '#FFF0B8', 0.75)}</g>`; });
  s += cord(str.d, '#5E5070', 2.2);
  pts.forEach(([x, y, c, r]) => {
    const cy = y + 6 + r;
    // portalámparas
    s += face(rr(f1(x - 3), f1(y - 1), 6, 7, 1.4), '#6E6480', { w: 1.2 });
    s += line(`M${f1(x - 2)} ${f1(y + 2.4)}H${f1(x + 2)}`, '#9A90AA', 1.2);
    // la estrella de vidrio, apenas girada, con su centro más claro
    const st = star(f1(x), f1(cy), r, 0.5);
    s += part(st, mix(c, '#FFFFFF', 0.12), { w: 1.6 });
    s += flat(star(f1(x - 0.4), f1(cy - 0.2), f1(r * 0.5), 0.52), mix(c, '#FFFFFF', 0.55));
    s += shade(`M${f1(x)} ${f1(cy)}L${f1(x + r * 0.95)} ${f1(cy - r * 0.31)}L${f1(x + r * 0.37)} ${f1(cy + r * 0.12)}L${f1(x + r * 0.59)} ${f1(cy + r * 0.81)}Z`, tone(c, -1.4), 0.25);
    s += shine(ellD(f1(x - r * 0.32), f1(cy - r * 0.34), f1(r * 0.14), f1(r * 0.2)), { opacity: 0.9 });
  });
  s += nail(10, 11) + nail(410, 11);
  return piece(SWAG.w, SWAG.h, s);
}

// ── El cartel con el nombre ──────────────────────────────────────
// Una cinta de tela colgada de dos cordeles, con las puntas dobladas
// hacia atrás. `text`: el hueco donde va la letra (lo pone la interfaz).
export const CARTEL = { w: 300, h: 92, text: { x: 50, y: 32, w: 200, h: 40 } };

const CARTEL_COL = {
  cumple: { c: '#F7A6C1', trim: '#FFFFFF', ink: '#8E2F55' },
  amor: { c: '#E8566F', trim: '#FFD1DC', ink: '#FFFFFF' },
  recuerdo: { c: '#5E72C8', trim: '#FFE38A', ink: '#FFFFFF' },
};
export const cartelInk = (theme) => (CARTEL_COL[theme] || CARTEL_COL.cumple).ink;

export function cartelSvg(theme = 'cumple') {
  const { c, trim } = CARTEL_COL[theme] || CARTEL_COL.cumple;
  const m = mat(c);
  let s = '';
  // cordeles que suben al cordel de la guirnalda
  s += line('M66 0L72 30M234 0L228 30', '#B07A8E', 1.8);
  // las puntas de atrás: dobladas, más oscuras, con su muesca
  const tailL = 'M50 42L14 46L26 60L12 74L54 70Z';
  const tailR = 'M250 42L286 46L274 60L288 74L246 70Z';
  s += wallSh(tailL) + wallSh(tailR);
  s += part(tailL, m.side, { w: 1.8 }) + part(tailR, m.side, { w: 1.8 });
  s += flat('M54 70L46 62L50 42Z', m.deep, { opacity: 0.6 }) + flat('M246 70L254 62L250 42Z', m.deep, { opacity: 0.6 });
  // la cinta del frente, con una comba suave
  const band = 'M44 30Q150 22 256 30L254 72Q150 64 46 72Z';
  s += wallSh(band, 0.16);
  s += part(band, c, { w: 2.2 });
  s += flat('M47 31.5Q150 23.6 253 31.5L252.6 36Q150 28 47.4 36Z', m.top, { opacity: 0.85 });
  s += shade('M46.4 66Q150 58 253.6 66L254 72Q150 64 46 72Z', m.deep, 0.28);
  // ribete de puntadas (en pixel, una franja lisa)
  s += line('M52 38.5Q150 30.5 248 38.5M52 64Q150 56 248 64', trim, 1.4, { 'stroke-dasharray': '4 3.4', opacity: 0.9, 'data-skip': 'pixel' });
  s += flat('M52 37.6Q150 29.6 248 37.6L248 39.6Q150 31.6 52 39.6Z', trim, { opacity: 0.8, 'data-only': 'pixel' });
  // un adorno en cada punta del frente
  if (theme === 'amor') s += part(heart(58, 51, 6.4), trim, { w: 1.3 }) + part(heart(242, 51, 6.4), trim, { w: 1.3 });
  else if (theme === 'recuerdo') s += part(star(58, 51, 7, 0.5), trim, { w: 1.3 }) + part(star(242, 51, 7, 0.5), trim, { w: 1.3 });
  else s += dots([[56, 48], [60, 55], [244, 48], [240, 55]], 2.4, trim);
  return piece(CARTEL.w, CARTEL.h, s);
}

// ═════════════════════════════════════════════════════════════════
// PISO
// ═════════════════════════════════════════════════════════════════

// Un globo: un óvalo apenas de huevo, nudito, brillo y sombra de volumen.
function balloon(cx, cy, r, c) {
  const m = mat(c);
  const ry = r * 1.16;
  const d = `M${f1(cx)} ${f1(cy + ry)}C${f1(cx - r * 0.62)} ${f1(cy + ry * 0.98)} ${f1(cx - r)} ${f1(cy + ry * 0.42)} ${f1(cx - r)} ${f1(cy - ry * 0.08)}C${f1(cx - r)} ${f1(cy - ry * 0.7)} ${f1(cx - r * 0.55)} ${f1(cy - ry)} ${f1(cx)} ${f1(cy - ry)}C${f1(cx + r * 0.55)} ${f1(cy - ry)} ${f1(cx + r)} ${f1(cy - ry * 0.7)} ${f1(cx + r)} ${f1(cy - ry * 0.08)}C${f1(cx + r)} ${f1(cy + ry * 0.42)} ${f1(cx + r * 0.62)} ${f1(cy + ry * 0.98)} ${f1(cx)} ${f1(cy + ry)}Z`;
  let s = part(`M${f1(cx - 3.6)} ${f1(cy + ry + 5)}L${f1(cx)} ${f1(cy + ry - 1)}L${f1(cx + 3.6)} ${f1(cy + ry + 5)}Z`, m.side, { w: 1.3 });
  s += part(d, c, { w: 2 });
  s += roundShade(cx, cy + ry * 0.04, r, ry, c, 0.3, 0.3);
  s += gloss(f1(cx - r * 0.42), f1(cy - ry * 0.42), f1(r * 0.2), f1(r * 0.34), -30, 0.85);
  s += shine(ellD(f1(cx - r * 0.12), f1(cy - ry * 0.74), f1(r * 0.07), f1(r * 0.07)), { opacity: 0.8 });
  return s;
}

/** Racimo de globos atado a un regalito, 150×270 (apoyado: foot 10). */
export function globosSvg() {
  const B = [
    // [x, y, r, color] de atrás para adelante
    [40, 92, 27, '#8CC8F0'],
    [112, 84, 28, '#FFD86B'],
    [76, 48, 31, '#F59AB5'],
    [70, 126, 27, '#8FD9C0'],
  ];
  const knot = ([x, y, r]) => [x, y + r * 1.16 + 5];
  let s = floorSh(75, 262, 34, 6);
  // los hilos (detrás de todo): de cada nudo bajan juntándose al moño del regalo
  const ds = B.map((b) => {
    const [kx, ky] = knot(b);
    const ex = 75, ey = 224;
    const mx = (kx + ex) / 2 + (kx < 75 ? -6 : 6), my = (ky + ey) / 2;
    return `M${f1(kx)} ${f1(ky)}Q${f1(mx)} ${f1(my)} ${ex} ${ey}`;
  });
  s += line(ds.join(''), '#B3A3BE', 1.3);
  B.forEach(([x, y, r, c]) => { s += balloon(x, y, r, c); });
  // el regalito que hace de pesito
  s += box(56, 258, 38, 26, 22, '#F59AB5', { r: 2 });
  s += flat(rr(72, 232, 6, 26, 0), '#FFFFFF') + flat('M56.6 241H93.4V246H56.6Z', '#FFFFFF', { opacity: 0.9 });
  s += flat('M58 228.5H92L91 232H59Z', '#FFFFFF', { opacity: 0.9 });
  s += bow(75, 226, 0.75, '#FFFFFF');
  // un rizo de cinta que cae
  s += line('M80 230Q90 236 86 242Q82 248 90 252', '#F59AB5', 1.6, { 'data-skip': 'pixel' });
  return piece(150, 270, s);
}

/** Mesita con mantel y pastel de dos pisos con velitas, 170×190 (foot 10). */
export function pastelSvg() {
  const cloth = '#FFF6EC', cm = mat(cloth);
  const cake = '#F7B8C8', ck = mat(cake);
  const cream = '#FFFDF8';
  let s = floorSh(85, 176, 64, 8);
  s += halo(85, 30, 40, 26, '#FFE9A8', 0.3);
  // mantel que cae hasta casi el piso, con volado
  let hem = '';
  for (let x = 22; x < 147.9; x += 12.6) hem += `Q${f1(x + 6.3)} 176 ${f1(x + 12.6)} 168`;
  s += face(`M26 106C24 128 22 150 22 168${hem}C148 150 146 128 144 106Z`, cloth, { w: 2.2 });
  // pliegues del mantel
  s += line('M48 116C46 134 44 150 43 168M85 120V172M122 116C124 134 126 150 127 168', cm.side, 1.4, { opacity: 0.55 });
  s += shade('M112 112C117 130 121 150 124 168L148 168C148 150 146 128 144 106Z', cm.deep, 0.14);
  // la tapa del mantel (elipse de la mesa) y la puntilla del borde
  s += face(ellD(85, 105, 60, 14), cm.top, { w: 2.2 });
  s += line('M26 107Q85 126 144 107', '#F2B8C6', 2, { opacity: 0.8 });
  // la base del pastel (bandeja con pie)
  const g = mat('#E3EEF5');
  s += face(ellD(85, 104, 16, 4.4), g.side, { w: 1.5 });
  s += face('M80 92H90L88 104H82Z', g.front, { w: 1.4 });
  s += face(ellD(85, 91, 46, 9), g.top, { w: 1.8 });
  // piso de abajo del pastel
  s += face('M51 62V88A34 7.5 0 0 0 119 88V62Z', cake, { w: 2.2 });
  s += shade('M100 64V90.5A34 7.5 0 0 0 119 88V62Z', ck.deep, 0.22);
  s += line('M51 76A34 7.5 0 0 0 119 76', ck.side, 1.6, { opacity: 0.7 });   // capa de relleno
  s += face(ellD(85, 62, 34, 7.5), cream, { w: 2 });
  // chorreado de crema por el borde (gotas de distinto largo)
  let drip = 'M51 62';
  [[56, 70], [62, 66], [69, 73], [77, 67], [86, 71], [94, 66], [102, 72], [110, 67], [116, 69]].forEach(([x, y], k, a) => {
    const nx = k < a.length - 1 ? a[k + 1][0] : 119;
    drip += `L${x - 2.4} ${f1(64 + Math.sin(k) * 0.6)}Q${x - 2.4} ${y} ${x} ${y}Q${x + 2.4} ${y} ${x + 2.4} 64.5L${f1((x + nx) / 2)} 66.5`;
  });
  drip += 'L119 62A34 7.5 0 0 1 51 62Z';
  s += part(drip, cream, { w: 1.5 });
  // grageas de colores en el piso de abajo
  s += dots([[58, 80], [70, 84], [96, 84], [108, 80], [64, 74], [102, 75]], 1.6, '#8CC8F0');
  s += dots([[63, 85], [83, 81], [114, 84], [76, 77], [91, 77]], 1.6, '#FFD86B');
  // piso de arriba
  s += face('M62 40V60A23 5 0 0 0 108 60V40Z', cake, { w: 2 });
  s += shade('M95 42V62A23 5 0 0 0 108 60V40Z', ck.deep, 0.22);
  s += face(ellD(85, 40, 23, 5), cream, { w: 1.8 });
  let drip2 = 'M62 40';
  [[66, 47], [72, 44], [79, 49], [87, 45], [95, 48], [102, 44]].forEach(([x, y]) => { drip2 += `L${x - 2} 42Q${x - 2} ${y} ${x} ${y}Q${x + 2} ${y} ${x + 2} 42.5`; });
  drip2 += 'L108 40A23 5 0 0 1 62 40Z';
  s += part(drip2, cream, { w: 1.4 });
  // fresas sobre la crema del piso de abajo (las de atrás las tapa el de arriba)
  const berry = (x, y) => part(`M${x} ${y + 5}C${x - 5} ${y + 3} ${x - 4.6} ${y - 3} ${x} ${y - 3}C${x + 4.6} ${y - 3} ${x + 5} ${y + 3} ${x} ${y + 5}Z`, '#EF4F63', { w: 1.3 })
    + flat(`M${x - 3} ${y - 3}L${x} ${y - 5.4}L${x + 3} ${y - 3}L${x} ${y - 1.6}Z`, '#6FBF5A') + dots([[x - 1.6, y + 0.4], [x + 1.6, y + 1.4]], 0.7, '#FFE9A8');
  s += berry(56, 63) + berry(114, 63) + berry(72, 67) + berry(99, 67);
  // tres velitas con rayas y su llama
  [[74, 38], [85, 36], [96, 38]].forEach(([x, y], k) => {
    const c = ['#8CC8F0', '#FFD86B', '#C3A3F0'][k];
    s += face(rr(x - 2.4, y - 15, 4.8, 15, 1), c, { w: 1.2 });
    s += line(`M${x - 2.4} ${y - 11}L${x + 2.4} ${y - 13}M${x - 2.4} ${y - 5.5}L${x + 2.4} ${y - 7.5}`, '#FFFFFF', 1.3, { opacity: 0.9 });
    s += line(`M${x} ${y - 15}V${y - 17.6}`, INK, 1.2);
    s += flame(x, y - 17, 0.8);
  });
  s += gloss(66, 50, 2.4, 5, -10, 0.6) + gloss(56, 74, 2.6, 6, -8, 0.5);
  return piece(170, 190, s);
}

// Velas: cilindro de cera con el borde derretido, mecha y llama.
function candle(cx, by, rx, h, c) {
  const m = mat(c);
  const ry = rx * 0.32;
  const top = by - h;
  let s = face(`M${cx - rx} ${top}V${by}A${rx} ${ry} 0 0 0 ${cx + rx} ${by}V${top}Z`, c, { w: 1.8 });
  s += shade(`M${f1(cx + rx * 0.35)} ${top + 1}V${f1(by + ry * 0.8)}A${rx} ${ry} 0 0 0 ${cx + rx} ${by}V${top}Z`, m.deep, 0.2);
  // cera derretida que chorrea del borde
  s += part(`M${cx - rx} ${top}L${f1(cx - rx)} ${f1(top + 6)}Q${f1(cx - rx + 2.4)} ${f1(top + 9)} ${f1(cx - rx + 4.4)} ${f1(top + 5)}Q${f1(cx - rx * 0.2)} ${f1(top + 7.4)} ${f1(cx + rx * 0.2)} ${f1(top + 4.6)}L${f1(cx + rx * 0.4)} ${f1(top + 12)}Q${f1(cx + rx * 0.4 + 2.6)} ${f1(top + 14)} ${f1(cx + rx * 0.4 + 3)} ${f1(top + 5)}Q${f1(cx + rx * 0.8)} ${f1(top + 6)} ${cx + rx} ${top}A${rx} ${ry} 0 0 1 ${cx - rx} ${top}Z`, m.top, { w: 1.4 });
  s += face(ellD(cx, top, rx, ry), mix(m.top, '#FFFFFF', 0.4), { w: 1.4 });
  s += shade(ellD(cx, f1(top + 0.4), f1(rx * 0.6), f1(ry * 0.55)), m.side, 0.3);
  s += line(`M${cx} ${top}V${top - 4}`, INK, 1.3);
  s += flame(cx, top - 3.4, rx > 9 ? 1 : 0.85);
  return s;
}

/** Velas sobre una bandeja de madera con pétalos, 180×120 (foot 10). */
export function velasSvg() {
  let s = floorSh(90, 110, 74, 9);
  s += halo(78, 40, 66, 40, '#FFE3A0', 0.34);
  // bandeja redonda de madera
  const w = mat('#C68B5E');
  s += face('M18 96V100A72 15 0 0 0 162 100V96Z', w.front, { w: 2 });
  s += face(ellD(90, 96, 72, 15), w.top, { w: 2 });
  s += face(ellD(90, 95, 64, 12), mix(w.top, w.front, 0.3), { w: 1.2 });
  s += line('M40 94Q60 90 80 93M100 99Q120 102 140 97', w.side, 1.1, { opacity: 0.5 });
  // tres velas de pie (la alta atrás)
  s += candle(66, 96, 15, 62, '#FFF3E0');
  s += candle(100, 99, 13, 42, '#F7C6D0');
  s += candle(130, 96, 10, 28, '#FFF3E0');
  // dos velitas en vasito de vidrio adelante
  [[44, 104], [118, 108]].forEach(([x, y]) => {
    s += face(`M${x - 9} ${y - 12}L${x - 8} ${y}A8 2.6 0 0 0 ${x + 8} ${y}L${x + 9} ${y - 12}Z`, '#F7D6E0', { w: 1.5 });
    s += flat(ellD(x, y - 12, 9, 2.8), '#FFF3E0');
    s += flame(x, y - 12.4, 0.62);
    s += shine(rr(x - 6, y - 10, 2, 7, 1), { opacity: 0.7 });
  });
  // pétalos sueltos en la bandeja
  const pet = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})">${part(`M${x - 5} ${y}Q${x} ${y - 4.4} ${x + 5} ${y}Q${x} ${y + 3.4} ${x - 5} ${y}Z`, '#E8566F', { w: 1.1 })}</g>`;
  s += pet(30, 96, -10) + pet(150, 98, 15) + pet(84, 106, 5) + pet(148, 107, -20);
  return piece(180, 120, s);
}

// Una rosa vista de frente-arriba: bola de pétalos con el espiral adentro.
function rose(cx, cy, r, c) {
  const m = mat(c);
  let s = part(ellD(cx, cy, r, r * 0.9), c, { w: 1.6 });
  s += flat(ellD(f1(cx - r * 0.06), f1(cy - r * 0.18), f1(r * 0.62), f1(r * 0.5)), m.side, { opacity: 0.55 });
  s += line(`M${f1(cx - r * 0.5)} ${f1(cy - r * 0.1)}Q${f1(cx - r * 0.3)} ${f1(cy - r * 0.62)} ${f1(cx + r * 0.25)} ${f1(cy - r * 0.48)}Q${f1(cx + r * 0.62)} ${f1(cy - r * 0.2)} ${f1(cx + r * 0.32)} ${f1(cy + r * 0.12)}Q${f1(cx)} ${f1(cy + r * 0.3)} ${f1(cx - r * 0.12)} ${f1(cy - r * 0.08)}`, m.deep, 1.5, { opacity: 0.8 });
  s += line(`M${f1(cx - r * 0.85)} ${f1(cy + r * 0.2)}Q${f1(cx - r * 0.4)} ${f1(cy + r * 0.82)} ${f1(cx + r * 0.5)} ${f1(cy + r * 0.62)}`, m.side, 1.4, { opacity: 0.6 });
  s += shine(ellD(f1(cx - r * 0.48), f1(cy - r * 0.42), f1(r * 0.16), f1(r * 0.1)), { opacity: 0.7 });
  return s;
}

/** Jarrón de vidrio con rosas y un moño, 120×200 (foot 10). */
export function rosasSvg() {
  const glass = 'M36 116C30 132 28 150 32 168C35 182 46 190 60 190C74 190 85 182 88 168C92 150 90 132 84 116Z';
  let s = floorSh(60, 190, 38, 6);
  // tallos adentro del vidrio (desaturados por el agua)
  s += shade(glass, '#CFEAF5', 0.4, { 'data-skip': 'papel' }) + shade(glass, '#CFEAF5', 0.2, { 'data-only': 'papel' });
  s += line('M50 120L54 182M60 118V184M70 120L66 182M44 122L52 176M76 122L68 176', '#8DB487', 2.2, { opacity: 0.75 });
  s += shade('M33 150C32 160 33 170 36 176C42 186 50 188 60 188C70 188 78 186 84 176C87 170 88 160 87 150Z', '#A8D8EA', 0.35);
  s += line('M33 150Q60 155 87 150', '#8FC2D8', 1.4, { opacity: 0.7 });
  // hojas y rosas arriba
  const lf = (x, y, a, l, c = '#6FB57A') => `<g transform="rotate(${a} ${x} ${y})">${part(`M${x} ${y}Q${x + l * 0.5} ${y - l * 0.32} ${x + l} ${y}Q${x + l * 0.5} ${y + l * 0.3} ${x} ${y}Z`, c, { w: 1.4 })}${line(`M${x + 1} ${y}H${x + l - 2}`, tone(c, -0.8), 1.1, { opacity: 0.7 })}</g>`;
  s += lf(30, 104, 205, 24) + lf(90, 104, -25, 24) + lf(22, 80, 230, 18, '#86C48C') + lf(98, 80, -50, 18, '#86C48C') + lf(60, 110, 90, 12);
  s += line('M44 104L52 114M76 104L68 114M60 100V114', '#6FA868', 2.4);
  // ramo en cúpula: atrás y arriba primero, adelante y abajo después
  s += rose(58, 44, 12, '#F27C95');
  s += rose(40, 58, 13, '#E8566F') + rose(78, 58, 13, '#E8566F');
  s += rose(26, 78, 12, '#F59AB5') + rose(94, 78, 12, '#F27C95');
  s += rose(59, 66, 14, '#F59AB5');
  s += rose(42, 86, 13, '#F27C95') + rose(76, 86, 13, '#E8566F');
  s += rose(59, 98, 12, '#E8566F');
  s += lf(48, 98, 150, 11, '#86C48C') + lf(70, 98, 30, 11, '#86C48C');
  // el vidrio de adelante: borde, cuello y brillos
  s += face(rr(34, 110, 52, 9, 3.4), '#E3F1F7', { w: 1.6 });
  s += line(glass, mix('#8FBCD2', INK, 0.28), 2.2);
  s += shine('M38 128C35 142 35 158 38 170H42C39.4 158 39.4 142 42 128Z', { opacity: 0.8 });
  s += shine(rr(78, 140, 3, 12, 1.5), { opacity: 0.5 });
  // moño de cinta en el cuello
  s += bow(60, 120, 0.95, '#F7A6C1');
  return piece(120, 200, s);
}

/** Farol con una vela adentro, 100×170 (foot 10). */
export function farolSvg() {
  const metal = '#4E5C8E', mm = mat(metal);
  let s = floorSh(50, 160, 34, 6);
  s += halo(50, 102, 48, 40, '#FFE3A0', 0.4);
  // asa de aro
  s += part('M38 30C38 12 62 12 62 30L58 30C58 18 42 18 42 30Z', mm.front, { w: 1.6 });
  // techito: tapa en punta con su borde
  s += face('M30 48L50 28L70 48Z', mm.front, { w: 2 });
  s += flat('M33 46L50 31L50 46Z', mm.top, { opacity: 0.8 });
  s += face(rr(24, 46, 52, 8, 2.6), mm.top, { w: 2 });
  s += part(ellD(50, 27, 4, 4), GOLD, { w: 1.3 });
  // el vidrio con la vela y su luz
  s += face(rr(28, 54, 44, 84, 0), '#FFE2A0', { w: 2 });
  s += flat(ellD(50, 104, 17, 26), '#FFF3C8');
  s += flat(ellD(50, 106, 10, 15), '#FFFBEA');
  s += candle(50, 132, 9, 24, '#FFF3E0');
  // marco: dos varillas en las esquinas y una cruceta fina arriba
  s += face(rr(26, 54, 6, 84, 0), mm.front, { w: 1.4 }) + face(rr(68, 54, 6, 84, 0), mm.side, { w: 1.4 });
  s += face(rr(32, 62, 36, 3, 0), mm.front, { w: 1.1 });
  s += shine('M35 68H38.4V104H35Z', { opacity: 0.7 }) + shine('M62 68H64V78H62Z', { opacity: 0.5 });
  // base
  s += face(rr(24, 138, 52, 9, 2.6), mm.top, { w: 2 });
  s += face(rr(28, 147, 44, 9, 2), mm.side, { w: 1.8 });
  return piece(100, 170, s);
}

// Una foto instantánea de pie (marco blanco, cielo, dos siluetas).
function polaroid(x, y, w, h, sky) {
  const b = w * 0.1, ph = h - b - h * 0.2;
  let s = part(rr(x, y, w, h, 1.4), '#FFFDF8', { w: 1.5 });
  s += face(rr(x + b, y + b, w - b * 2, ph, 0.8), sky, { w: 1.1 });
  const px = x + b, pw = w - b * 2, py = y + b;
  s += flat(`M${f1(px)} ${f1(py + ph * 0.72)}Q${f1(px + pw * 0.5)} ${f1(py + ph * 0.52)} ${f1(px + pw)} ${f1(py + ph * 0.66)}V${f1(py + ph)}H${f1(px)}Z`, '#A8D9A0');
  const r = pw * 0.15;
  s += flat(ellD(f1(px + pw * 0.36), f1(py + ph - r), f1(r), f1(r * 1.1)), '#FFF4EC');
  s += flat(ellD(f1(px + pw * 0.64), f1(py + ph - r * 0.9), f1(r), f1(r)), '#FFC9D6');
  s += flat(heart(f1(px + pw * 0.5), f1(py + ph * 0.3), f1(Math.max(2.2, pw * 0.12))), '#FF7FA1');
  return s;
}

/** Caja de recuerdos (sombrerera con estrellas) con fotos asomadas, 170×140 (foot 10). */
export function recuerdosSvg() {
  const c = '#9CB8F2', m = mat(c);
  let s = floorSh(86, 130, 70, 8);
  // la tapa apoyada atrás, de canto: aro con grosor y su cara de arriba
  s += face(ellD(132, 76, 28, 27), m.side, { w: 2 });
  s += face(ellD(130, 75, 24, 23), m.top, { w: 1.5 });
  s += flat(star(124, 68, 4.4, 0.5) + star(138, 80, 3.6, 0.5) + star(128, 88, 3, 0.5), '#FFF3C4');
  s += shine(ellD(121, 63, 4, 2.4), { opacity: 0.6 });
  // la boca de la caja: el interior en sombra (detrás de las fotos)
  s += face(ellD(86, 84, 64, 13), m.top, { w: 2 });
  s += flat(ellD(86, 85.4, 59, 10.6), hollow(c));
  // fotos y una carta que asoman (las tapa el borde de adelante)
  s += `<g transform="rotate(-9 60 70)" data-skip="pixel">${polaroid(44, 50, 34, 40, '#BFE3F5')}</g><g data-only="pixel">${polaroid(44, 50, 34, 40, '#BFE3F5')}</g>`;
  s += `<g transform="rotate(7 98 68)" data-skip="pixel">${polaroid(84, 46, 34, 40, '#FFE0B8')}</g><g data-only="pixel">${polaroid(84, 46, 34, 40, '#FFE0B8')}</g>`;
  s += part('M68 68L92 64L95 86L71 90Z', '#FFF4E0', { w: 1.4 }) + part(heart(81.5, 76, 4.2), '#F25C7A', { w: 1 });
  // la caja: frente del cilindro (de la mitad de la boca para abajo)
  s += face('M22 84V118A64 13 0 0 0 150 118V84A64 13 0 0 1 22 84Z', c, { w: 2.2 });
  s += shade('M114 94V129A64 13 0 0 0 150 118V84A64 13 0 0 1 114 94Z', m.deep, 0.2);
  // labio del borde, más claro
  s += part('M22 84A64 13 0 0 0 150 84V88.4A64 13 0 0 1 22 88.4Z', m.top, { w: 1.5 });
  s += flat(star(44, 108, 5, 0.5) + star(84, 114, 6, 0.5) + star(124, 108, 5, 0.5) + star(62, 120, 3.6, 0.5) + star(104, 122, 3.6, 0.5), '#FFF3C4');
  // cinta que la rodea, con su moño
  s += flat('M22 99A64 13 0 0 0 150 99V104.4A64 13 0 0 1 22 104.4Z', '#F7A6C1');
  s += bow(32, 104, 0.62, '#F7A6C1', { tails: false });
  // una foto apoyada adelante, de pie
  s += `<g transform="rotate(-6 146 112)" data-skip="pixel">${polaroid(134, 94, 26, 32, '#D7CCF5')}</g><g data-only="pixel">${polaroid(136, 94, 26, 32, '#D7CCF5')}</g>`;
  return piece(170, 140, s);
}

// ── Lo que queda tirado en el piso ───────────────────────────────
// Una franja de 560×44, todo aplastado (está en el piso).
export const SCATTER = { w: 560, h: 44 };

export function confetiSvg() {
  const rnd = seeded(41);
  const cols = PARTY;
  const by = cols.map(() => '');
  for (let i = 0; i < 34; i++) {
    const x = 10 + rnd() * 536, y = 8 + rnd() * 28;
    const k = Math.floor(rnd() * cols.length);
    const w = 8 + rnd() * 4, h = 4 + rnd() * 1.6;
    const sk = (rnd() - 0.5) * 4;
    by[k] += rnd() < 0.3
      ? `M${f1(x)} ${f1(y)}a${f1(w * 0.45)} ${f1(w * 0.25)} 0 1 0 ${f1(w * 0.9)} 0a${f1(w * 0.45)} ${f1(w * 0.25)} 0 1 0 ${f1(-w * 0.9)} 0Z`
      : `M${f1(x)} ${f1(y)}l${f1(w)} ${f1(sk * 0.3)}l${f1(sk)} ${f1(h)}l${f1(-w)} ${f1(-sk * 0.3)}Z`;
  }
  let s = '';
  // serpentinas enruladas
  [['M40 30q8 -8 16 0t16 0t16 0', '#F59AB5'], ['M230 26q8 -7 16 0t16 0t14 2', '#8CC8F0'], ['M420 32q8 -8 16 0t16 0t16 0', '#FFD86B']].forEach(([d, c]) => {
    s += line(d, tone(c, -0.6), 3.6) + line(d, c, 2.2);
  });
  by.forEach((d, k) => { if (d) s += flat(d, cols[k]) + line(d, tone(cols[k], -1), 0.9, { opacity: 0.7, 'data-skip': 'pixel papel' }); });
  return piece(SCATTER.w, SCATTER.h, s);
}

export function petalosSvg() {
  const rnd = seeded(77);
  const cols = ['#E8566F', '#F27C95', '#F59AB5'];
  let s = '';
  for (let i = 0; i < 24; i++) {
    const x = 16 + rnd() * 528, y = 10 + rnd() * 24;
    const c = cols[Math.floor(rnd() * 3)];
    const a = Math.round((rnd() - 0.5) * 70);
    const w = 9 + rnd() * 3;
    const p = `M${f1(x - w)} ${f1(y)}Q${f1(x - w * 0.2)} ${f1(y - w * 0.62)} ${f1(x + w)} ${f1(y - 0.6)}Q${f1(x + w * 0.1)} ${f1(y + w * 0.46)} ${f1(x - w)} ${f1(y)}Z`;
    const inner = part(p, c, { w: 1.1 }) + flat(`M${f1(x - w * 0.5)} ${f1(y - 0.4)}Q${f1(x)} ${f1(y - w * 0.3)} ${f1(x + w * 0.6)} ${f1(y - 0.8)}`, tone(c, 0.8), { opacity: 0.6 });
    s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a}) scale(1 0.7) translate(${f1(-x)} ${f1(-y)})" data-skip="pixel">${inner}</g><g data-only="pixel">${inner}</g>`;
  }
  return piece(SCATTER.w, SCATTER.h, s);
}

export function destellosSvg() {
  const rnd = seeded(19);
  const cols = ['#FFD95A', '#A9CBFF', '#FFB3C6'];
  let s = '';
  for (let i = 0; i < 16; i++) {
    const x = 16 + rnd() * 528, y = 12 + rnd() * 22;
    const c = cols[i % 3];
    const r = 7 + rnd() * 3;
    // estrellita de papel acostada: aplastada a la mitad
    const st = star(0, 0, r, 0.5);
    s += `<g transform="translate(${f1(x)} ${f1(y)}) scale(1 0.6)">${part(st, c, { w: 1.4 })}${flat(star(-0.4, -0.5, f1(r * 0.45), 0.5), mix(c, '#FFFFFF', 0.6))}</g>`;
  }
  for (let i = 0; i < 6; i++) s += sparkle(f1(40 + rnd() * 480), f1(10 + rnd() * 20), 4.6, '#FFF3B0');
  return piece(SCATTER.w, SCATTER.h, s);
}

// ═════════════════════════════════════════════════════════════════
// Los juegos completos
// ═════════════════════════════════════════════════════════════════
// Cada pieza: { svg(), w, h, foot } (foot: margen debajo de donde se apoya).
export const CELEBRATION_PIECES = {
  banderines: { w: SWAG.w, h: SWAG.h, svg: banderinesSvg },
  corazones: { w: SWAG.w, h: SWAG.h, svg: corazonesSvg },
  estrellas: { w: SWAG.w, h: SWAG.h, svg: estrellasSvg },
  globos: { w: 150, h: 270, foot: 10, svg: globosSvg },
  pastel: { w: 170, h: 190, foot: 10, svg: pastelSvg },
  velas: { w: 180, h: 120, foot: 10, svg: velasSvg },
  rosas: { w: 120, h: 200, foot: 10, svg: rosasSvg },
  farol: { w: 100, h: 170, foot: 10, svg: farolSvg },
  recuerdos: { w: 170, h: 140, foot: 10, svg: recuerdosSvg },
  confeti: { w: SCATTER.w, h: SCATTER.h, svg: confetiSvg },
  petalos: { w: SCATTER.w, h: SCATTER.h, svg: petalosSvg },
  destellos: { w: SCATTER.w, h: SCATTER.h, svg: destellosSvg },
};

// Para el laboratorio (/arte?set=fiestas). `svg` se arma al pedirlo.
const entry = (id, name, w, h, make) => ({ id, name, w, h, get svg() { return make(); } });
export const CELEBRATION_ART = [
  entry('banderines', 'Banderines de cumple', SWAG.w, SWAG.h, banderinesSvg),
  entry('cartel-cumple', 'Cartel de cumple', CARTEL.w, CARTEL.h, () => cartelSvg('cumple')),
  entry('globos', 'Globos', 150, 270, globosSvg),
  entry('pastel', 'Pastel en su mesita', 170, 190, pastelSvg),
  entry('confeti', 'Confeti', SCATTER.w, SCATTER.h, confetiSvg),
  entry('corazones', 'Guirnalda de corazones', SWAG.w, SWAG.h, corazonesSvg),
  entry('cartel-amor', 'Cartel de aniversario', CARTEL.w, CARTEL.h, () => cartelSvg('amor')),
  entry('velas', 'Velas', 180, 120, velasSvg),
  entry('rosas', 'Rosas', 120, 200, rosasSvg),
  entry('petalos', 'Pétalos', SCATTER.w, SCATTER.h, petalosSvg),
  entry('estrellas', 'Luces de estrellas', SWAG.w, SWAG.h, estrellasSvg),
  entry('cartel-recuerdo', 'Cartel de recuerdo', CARTEL.w, CARTEL.h, () => cartelSvg('recuerdo')),
  entry('farol', 'Farol', 100, 170, farolSvg),
  entry('recuerdos', 'Caja de recuerdos', 170, 140, recuerdosSvg),
  entry('destellos', 'Estrellitas', SCATTER.w, SCATTER.h, destellosSvg),
];

const innerOf = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const THEME_SET = {
  cumple: ['banderines', 'globos', 'pastel', 'confeti'],
  amor: ['corazones', 'velas', 'rosas', 'petalos'],
  recuerdo: ['estrellas', 'farol', 'recuerdos', 'destellos'],
};

/**
 * Conjunto del laboratorio. `&escena=1`: cada juego armado en un rincón
 * del cuarto (480×430, a la escala del juego) con la mochi; `&ids=`:
 * solo esas piezas. `corner(pared, piso, extra, W)` lo da ArtLab.
 */
export function fiestasSet(q, pet, corner) {
  const ids = q.get('ids') ? q.get('ids').split(',') : null;
  if (!q.get('escena')) return CELEBRATION_ART.filter((d) => !ids || ids.includes(d.id)).map((d) => ({ name: d.name, markup: d.svg, w: d.w, h: d.h }));
  const W = 640;
  return Object.entries(THEME_SET).filter(([t]) => !ids || ids.includes(t)).map(([theme, [wall, left, right, floor]]) => {
    const P = CELEBRATION_PIECES;
    const at = (id, x, bottom) => { const p = P[id]; return `<g transform="translate(${f1(x - p.w / 2)} ${f1(bottom + (p.foot || 0) - p.h)})">${innerOf(p.svg())}</g>`; };
    let extra = `<g transform="translate(${W / 2 - SWAG.w / 2} 6)">${innerOf(P[wall].svg())}</g>`;
    extra += `<g transform="translate(${W / 2 - CARTEL.w / 2} 40)">${innerOf(cartelSvg(theme))}</g>`;
    extra += at(floor, W / 2, 432);
    extra += at(left, 110, 420) + at(right, W - 110, 420);
    extra += `<g transform="translate(${W / 2 - 100} 226)">${pet}</g>`;
    return { name: theme, kind: 'surface', w: 640, h: 430, markup: corner(q.get('pared') || 'liso.crema', q.get('piso') || 'tablas.miel', extra, W) };
  });
}
