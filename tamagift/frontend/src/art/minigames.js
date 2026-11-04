// ─────────────────────────────────────────────────────────────────
// Arte de los minijuegos, como SVG con partes (cada estilo lo redibuja
// con su kit, igual que la mochi y el cuarto).
//
// Reglas de siempre: contorno de tinta cálida, luz de arriba a la
// izquierda, formas simétricas calculadas (no a ojo) y nada que no se
// reconozca a 40 px.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, Cir, Ell, piece, G, INK, DEPTH, leaf } from './room/draw.js';
import { rng } from './color.js';

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

// ── Ayudas de escena ──────────────────────────────────────────────
// Los fondos de los minijuegos son ilustraciones en la misma vista 3/4
// del cuarto: el suelo se aleja hacia arriba sin punto de fuga, lo
// redondo apoyado es una elipse el doble de ancha que alta y la luz
// viene de arriba a la izquierda. Lo grande (cielo, pasto, pared) va
// `flat` —sin contorno— y los objetos `part`/`face`, con contorno y
// volumen. En pixel cada unidad del fondo es medio píxel de arte: nada
// importante más chico que 4–6 unidades.
const SH = '#2A1C24';
// Matita de pasto: tres hojas en una sola silueta (en pixel, una V limpia).
const tuftD = (x, y, h, k = 1) => `M${f1(x - 4.5 * k)} ${f1(y)}L${f1(x - 6.5 * k)} ${f1(y - h * 0.62)}L${f1(x - 1.8 * k)} ${f1(y - 1.5)}L${f1(x)} ${f1(y - h)}L${f1(x + 1.8 * k)} ${f1(y - 1.5)}L${f1(x + 6.5 * k)} ${f1(y - h * 0.7)}L${f1(x + 4.5 * k)} ${f1(y)}Z`;
// Nube mullida de base plana.
const cloudD = (x, y, w) => `M${f1(x)} ${f1(y)}C${f1(x - w * 0.12)} ${f1(y)} ${f1(x - w * 0.08)} ${f1(y - w * 0.26)} ${f1(x + w * 0.14)} ${f1(y - w * 0.22)}C${f1(x + w * 0.16)} ${f1(y - w * 0.46)} ${f1(x + w * 0.5)} ${f1(y - w * 0.52)} ${f1(x + w * 0.6)} ${f1(y - w * 0.3)}C${f1(x + w * 0.74)} ${f1(y - w * 0.4)} ${f1(x + w * 1.08)} ${f1(y - w * 0.3)} ${f1(x + w)} ${f1(y)}Z`;
function cloud(x, y, w, c = '#FFFFFF', o = {}) {
  let s = (o.flat ? flat : part)(cloudD(x, y, w), c, o.flat ? {} : { w: o.lw || 1.8 });
  s += shade(`M${f1(x - w * 0.04)} ${f1(y - w * 0.07)}C${f1(x + w * 0.3)} ${f1(y - w * 0.13)} ${f1(x + w * 0.7)} ${f1(y - w * 0.13)} ${f1(x + w * 1.03)} ${f1(y - w * 0.07)}L${f1(x + w)} ${f1(y)}H${f1(x)}Z`, '#9FB8E0', o.dim ?? 0.35);
  return s;
}
// Florcita de pasto: pétalos y centro (sale con o sin contorno).
// Chiquitas (r < 6) van sin contorno: a ese tamaño la tinta se come los
// pétalos y la flor se lee violeta.
function daisy(x, y, r, petal = '#FFFFFF', center = '#FFC93D', withLine = false) {
  const p = flowerPath(x, y, r, r * 0.45);
  const lined = withLine && r >= 6;
  return (lined ? part(p, petal, { w: 1.2 }) : flat(p, petal)) + Cir(x, y, Math.max(1.8, r * 0.38), { fill: center, 'data-r': 'flat' });
}
// Tulipán con tallo y hoja.
function tulip(x, y, h, c) {
  let s = line(`M${x} ${y}V${f1(y - h + 6)}`, '#4E9A4A', 2.4);
  s += part(`M${x} ${f1(y - 3)}C${f1(x - 9)} ${f1(y - 6)} ${f1(x - 8)} ${f1(y - h * 0.5)} ${x} ${f1(y - h * 0.45)}C${f1(x - 3)} ${f1(y - 8)} ${f1(x - 1)} ${f1(y - 4)} ${x} ${f1(y - 3)}Z`, '#6DBE5E', { w: 1.2 });
  s += part(`M${f1(x - 6)} ${f1(y - h + 8)}C${f1(x - 7)} ${f1(y - h + 1)} ${f1(x - 6)} ${f1(y - h - 2)} ${f1(x - 4.5)} ${f1(y - h - 2)}L${f1(x - 2)} ${f1(y - h + 2)}L${x} ${f1(y - h - 3)}L${f1(x + 2)} ${f1(y - h + 2)}L${f1(x + 4.5)} ${f1(y - h - 2)}C${f1(x + 6)} ${f1(y - h - 2)} ${f1(x + 7)} ${f1(y - h + 1)} ${f1(x + 6)} ${f1(y - h + 8)}C${f1(x + 5)} ${f1(y - h + 12)} ${f1(x - 5)} ${f1(y - h + 12)} ${f1(x - 6)} ${f1(y - h + 8)}Z`, c, { w: 1.4 });
  s += flat(`M${f1(x - 3.5)} ${f1(y - h + 2)}h2.5v6h-2.5Z`, mix(c, '#FFFFFF', 0.55));
  return s;
}
// Arbusto: racimo de bolas de hojas en tres tonos (las de adelante más claras).
function bush(x, y, w, c = '#5FA85A', o = {}) {
  const m = mat(c);
  const h = w * 0.62;
  const blobs = [[-0.32, -0.42, 0.26], [0.3, -0.46, 0.27], [0, -0.66, 0.3], [-0.12, -0.3, 0.3], [0.2, -0.28, 0.28]];
  let s = o.noShadow ? '' : Ell(x, y, w * 0.54, w * 0.1, { fill: SH, opacity: 0.18, 'data-r': 'tone' });
  blobs.forEach(([dx, dy, r], k) => {
    const col = k < 3 ? c : m.top;
    s += (o.flat ? flat : part)(ellD(f1(x + dx * w), f1(y + dy * h * 1.3), f1(r * w), f1(r * w * 0.86)), col, o.flat ? {} : { w: 1.6 });
  });
  s += flat(ellD(f1(x - 0.18 * w), f1(y - 0.72 * h), f1(0.1 * w), f1(0.06 * w)), m.hi, { opacity: 0.8 });
  if (o.berries) o.berries.forEach(([dx, dy]) => { s += Cir(f1(x + dx * w), f1(y + dy * h), Math.max(2.2, w * 0.035), { fill: o.berryColor || '#F05A78', 'data-r': 'flat' }); });
  return s;
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
// Un jardín visto en 3/4: cielo y copas de árboles al fondo, una cerca de
// estacas con su cantero de flores, el césped cortado a franjas y nueve
// hoyos de tierra. Los hoyos son todos del mismo tamaño (una sola
// perspectiva, sin punto de fuga) y van en una grilla pareja.
export const WHACK = {
  W: 330, H: 314,
  HOLE: 0.27,                 // ancho del hoyo, en fracción del ancho
  COLS: [0.197, 0.5, 0.803],  // centro de cada columna
  ROWS: [0.37, 0.63, 0.885],  // centro de la boca de cada fila
  MOUTH_Y: 0.73,              // la boca, dentro del dibujo del hoyo (100×100)
};

export function gardenSvg() {
  const { W, H } = WHACK;
  const r = rng(7);
  let s = '';
  // cielo y nubes
  s += flat(`M0 0H${W}V40H0Z`, '#BFE6F8');
  s += flat(`M0 14H${W}V40H0Z`, '#D6F0FB');
  s += cloud(34, 18, 44, '#FFFFFF', { flat: true, dim: 0.25 }) + cloud(236, 13, 34, '#FFFFFF', { flat: true, dim: 0.25 });
  // copas de árboles y seto, lejos (sin contorno: es el fondo)
  [[-6, 40, 70], [52, 42, 54], [120, 38, 64], [196, 41, 58], [262, 39, 72], [330, 42, 56]].forEach(([x, y, w], k) => {
    const c = k % 2 ? '#5E9F63' : '#6AAB66';
    s += flat(ellD(x, y - w * 0.18, w * 0.5, w * 0.34), c);
    s += flat(ellD(x - w * 0.12, y - w * 0.3, w * 0.24, w * 0.16), tone(c, 0.6), { opacity: 0.9 });
  });
  s += flat(`M0 34H${W}V64H0Z`, '#5B9A5E');
  // césped: franjas de la cortadora, apenas onduladas
  s += flat(`M0 52H${W}V${H}H0Z`, '#86C86A');
  for (let y = 70, k = 0; y < H; y += 30, k++) {
    if (k % 2) continue;
    s += flat(`M0 ${y}Q${W * 0.25} ${y - 3} ${W * 0.5} ${y}T${W} ${y}V${y + 30}Q${W * 0.75} ${y + 33} ${W * 0.5} ${y + 30}T0 ${y + 30}Z`, '#93D076');
  }
  // cerca de estacas (tablas con punta, dos travesaños y postes)
  const fy = 60;
  s += shade(`M0 ${fy - 2}H${W}V${fy + 8}H0Z`, SH, 0.16);
  s += face(rr(-4, fy - 30, W + 8, 7, 1), '#E9DCCB', { w: 1.8 }) + face(rr(-4, fy - 15, W + 8, 7, 1), '#E9DCCB', { w: 1.8 });
  for (let x = -3, k = 0; x < W; x += 15, k++) {
    const post = k % 6 === 0;
    const pw = post ? 12 : 10;
    const top = fy - (post ? 40 : 37);
    s += part(`M${x} ${fy}V${top + 6}L${x + pw / 2} ${top}L${x + pw} ${top + 6}V${fy}Z`, post ? '#F4ECE0' : '#FFF8EE', { w: 1.6 });
    s += flat(`M${x + 2} ${top + 7}h2.5v${fy - top - 9}h-2.5Z`, '#FFFFFF', { opacity: 0.8 });
    if (post) s += part(rr(x - 1, top - 3, pw + 2, 5, 1.5), '#E9DCCB', { w: 1.4 });
  }
  // cantero de flores al pie de la cerca
  s += flat(`M0 ${fy - 2}Q${W / 2} ${fy + 4} ${W} ${fy - 2}V${fy + 10}Q${W / 2} ${fy + 15} 0 ${fy + 10}Z`, '#8E5E3E');
  s += flat(`M0 ${fy + 7}Q${W / 2} ${fy + 12} ${W} ${fy + 7}V${fy + 10}Q${W / 2} ${fy + 15} 0 ${fy + 10}Z`, '#6E4630');
  const bed = [[14, '#F27A9A'], [40, '#FFC94D'], [66, '#B79AE8'], [100, '#F27A9A'], [128, '#FF9F6B'], [156, '#FFC94D'], [196, '#B79AE8'], [222, '#F27A9A'], [250, '#FFC94D'], [282, '#FF9F6B'], [310, '#B79AE8']];
  bed.forEach(([x, c], k) => { s += tulip(x, fy + 6 + (k % 2) * 2, 22 + (k % 3) * 3, c); });
  [[27, 1], [84, 0], [113, 1], [176, 0], [208, 1], [266, 0], [296, 1]].forEach(([x, k]) => { s += daisy(x, fy + 4 + k * 3, 4.5, '#FFFFFF', '#FFC93D', true); });
  // textura del césped: matitas, más grandes adelante
  for (let k = 0; k < 40; k++) {
    const y = 80 + r() * (H - 92);
    const x = r() * W;
    const near = (y - 80) / (H - 80);
    s += flat(tuftD(f1(x), f1(y), 6 + near * 4, 0.85 + near * 0.35), k % 3 ? '#6FB257' : '#78BA5E');
  }
  // ramitos de margaritas y tréboles entre los hoyos (en grupos, no sueltas)
  [[116, 160], [214, 158], [20, 150], [118, 244], [268, 236], [312, 168], [170, 88], [64, 82], [262, 84]].forEach(([x, y], k) => {
    s += Ell(x + 2, y + 5, 11, 2.6, { fill: '#5E9E4A', opacity: 0.35, 'data-r': 'tone' });
    if (k % 3 === 2) {
      // trébol de tres hojas
      [[-4, 0], [4, 0], [0, -5]].forEach(([dx, dy]) => { s += flat(ellD(x + dx, y + dy, 4, 3.4), '#5FA64E'); });
      s += flat(ellD(x - 5, y - 1, 1.8, 1.4), '#8FCF73');
    } else {
      s += daisy(x - 5, y + 1, 5.2, '#FFFFFF', '#FFC93D', true);
      s += daisy(x + 5, y - 2, 4.6, k % 2 ? '#FFE3EE' : '#FFFFFF', '#FFC93D', true);
      s += daisy(x + 1, y + 5, 3.8, '#FFFFFF', '#FFB13D', true);
    }
  });
  // piedritas
  [[150, 166], [312, 120], [212, 250], [36, 300]].forEach(([x, y], k) => {
    s += Ell(x + 1, y + 2.5, 7, 1.8, { fill: SH, opacity: 0.18, 'data-r': 'tone' });
    s += part(ellD(x, y, 6 + (k % 2) * 2, 4), '#DCD5CF', { w: 1.2 });
  });
  // marcos: malvarrosas altas a la izquierda, dos girasoles a la derecha
  const hollyhock = (x, top, c) => {
    let t = line(`M${x} ${H + 4}V${top}`, '#5E9A42', 3.2);
    t += leaf(x, top + 70, 15, 200, 6, '#6DBE5E') + leaf(x, top + 96, 16, -25, 6, '#6DBE5E');
    [[0, 0, 4], [-1, 12, 5], [1, 25, 6], [-1, 39, 6.5], [1, 53, 7]].forEach(([dx, dy, rr0], k) => {
      t += part(flowerPath(x + dx, top + dy, rr0, rr0 * 0.55, 5), k ? c : tone(c, 0.5), { w: 1.3 });
      if (k) t += Cir(x + dx, top + dy, Math.max(1.6, rr0 * 0.3), { fill: '#FFE08A', 'data-r': 'flat' });
    });
    return t;
  };
  s += hollyhock(-2, 132, '#F27A9A') + hollyhock(12, 158, '#FF9EC0');
  const sunflower = (x, top, rH) => {
    let t = line(`M${x} ${H + 4}V${top}`, '#5E9A42', 4);
    t += leaf(x, top + 46, 18, -30, 6, '#6DBE5E') + leaf(x, top + 80, 18, 205, 6, '#6DBE5E');
    t += part(flowerPath(x, top, rH, rH * 0.52, 10), '#FFC93D', { w: 1.6 }) + part(ellD(x, top, rH * 0.46, rH * 0.42), '#8A5530', { w: 1.4 });
    t += Cir(x - rH * 0.12, top - rH * 0.12, rH * 0.14, { fill: '#B5794A', 'data-r': 'flat' });
    return t;
  };
  s += sunflower(334, 150, 14) + sunflower(318, 186, 12);
  // matas altas en las esquinas de adelante
  [[6, 1.7, 22], [22, 1.3, 16], [316, 1.6, 20], [300, 1.2, 14]].forEach(([x, k, h], i) => {
    s += part(tuftD(x, H + 3, h, k), i % 2 ? '#8DCC6C' : '#7CC060', { w: 1.4 });
  });
  s += daisy(32, H - 6, 5, '#FFFFFF', '#FFC93D', true) + daisy(292, H - 8, 4.6, '#FFE3EE', '#FFC93D', true);
  return piece(W, H, s);
}

// Un topo se reconoce por tres cosas: pelaje oscuro aterciopelado, nariz
// rosada grande y las manotas rosadas de cavar apoyadas en el borde.
// `hit`: ojitos apretados y estrellitas (le dieron).
export function moleSvg(kind = 'topo', hit = false) {
  const gold = kind === 'dorado';
  const fur = gold ? '#F4C542' : '#7A6052';
  const furD = gold ? '#C9902A' : '#5B463C';
  const pink = '#FF9DB4';
  let s = '';
  // cuerpo: una gota ancha que sale del agujero (sigue hacia abajo)
  s += part('M18 104V58C18 32 33 16 50 16C67 16 82 32 82 58V104Z', fur, { w: 2.6 });
  s += shade('M62 22C74 30 80 44 80 60V104H66V60C66 44 64 32 62 22Z', furD, 0.45);
  // mechón en la coronilla
  s += part('M44 19C44 12 48 9 51 8C50 12 52 14 55 13C54 17 50 19 44 19Z', fur, { w: 1.8 });
  // panza clara
  s += flat('M34 104V82C34 72 41 66 50 66C59 66 66 72 66 82V104Z', gold ? '#FFE9A8' : '#A88A78', { opacity: 0.85 });
  // hocico claro y nariz grande
  s += part(ellD(50, 52, 15, 11), gold ? '#FFE9A8' : '#C9A896', { w: 2 });
  s += part(ellD(50, 45, 8.5, 6.5), pink, { w: 2 });
  s += line('M45.5 42.5C47 40.6 50 40.2 52 41', '#FFFFFF', 1.6, { opacity: 0.9 });
  s += line('M50 51.5V56M44 58Q50 62 56 58', INK, 1.6);
  // bigotes
  s += line('M36 50L24 47M36 54L24 55M64 50L76 47M64 54L76 55', gold ? '#8A5A1E' : '#3A2A2E', 1.2, { opacity: 0.8, 'data-skip': 'pixel' });
  if (hit) {
    // ojitos apretados (> <)
    s += line('M37 33L42 36L37 39M63 33L58 36L63 39', INK, 2);
  } else {
    // ojitos chiquitos (los topos casi no ven)
    s += Cir(40, 36, 2.6, { fill: INK, 'data-r': 'flat' }) + Cir(60, 36, 2.6, { fill: INK, 'data-r': 'flat' });
    s += Cir(39.2, 35.2, 0.9, { fill: '#FFFFFF', 'data-r': 'flat' }) + Cir(59.2, 35.2, 0.9, { fill: '#FFFFFF', 'data-r': 'flat' });
  }
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
    s += Cir(50, 12, 1.8, { fill: '#F05A78', 'data-r': 'flat' });
    [[20, 30], [82, 24], [86, 50]].forEach(([x, y]) => { s += part(starPath(x, y, 5, 2, 4), '#FFF6C8', { w: 1 }); });
  }
  if (hit) [[22, 18], [78, 14], [50, 2]].forEach(([x, y]) => { s += part(starPath(x, y, 6, 2.6, 5), '#FFE37A', { w: 1.2 }); });
  s += shine('M30 34C31 26 37 21 43 20C38 24 35 28 34 34Z', { opacity: 0.55 });
  return piece(100, 100, s);
}

export function bombSvg() {
  let s = '';
  s += part(ellD(50, 64, 27, 27), '#3A3348', { w: 2.6 });
  s += shade(ellD(56, 70, 20, 19), '#120E1C', 0.35);
  s += part(rr(42, 32, 16, 10, 3), '#6E6680', { w: 2.2 });
  s += line('M50 32C50 22 56 16 64 16', '#B08A5A', 3.2);
  s += part(starPath(66, 14, 9, 3.6, 6, -90), '#FFD15C', { w: 1.6 }) + Cir(66, 14, 3, { fill: '#FFFFFF', 'data-r': 'shine' });
  s += shine('M32 54C34 46 40 41 47 40C42 44 38 48 37 55Z', { opacity: 0.5 });
  // carita enojada para que se entienda que NO se toca
  s += line('M40 60L46 63M60 60L54 63', '#FFFFFF', 2);
  s += line('M43 74Q50 70 57 74', '#FFFFFF', 2);
  return piece(100, 100, s);
}

// Hoyo en el pasto, en 3/4, en dos capas para que lo que sale quede
// ADENTRO: atrás el montículo de tierra, la boca oscura y la pared del
// fondo iluminada; adelante el labio de tierra que tapa la base. La boca
// va centrada en (50, 73) con radios 34 × 12.5 (ver WHACK.MOUTH_Y).
const SOIL = '#B98152';
// Por dónde se ve lo que sale: todo lo de arriba de la boca y, abajo, solo
// la mitad de la boca (el labio de adelante tapa el resto). En unidades
// del hoyo (100×100); WhackGame lo usa como clip-path.
export const MOUTH_CLIP = 'M-20 -40H120V73H84A34 12.5 0 0 1 16 73H-20Z';
export const MOUTH_POLY = (() => {
  const pts = [[-20, -40], [120, -40], [120, 73]];
  for (let k = 0; k <= 12; k++) { const t = (k / 12) * Math.PI; pts.push([f1(50 + 34 * Math.cos(t)), f1(73 + 12.5 * Math.sin(t))]); }
  pts.push([-20, 73]);
  return pts;
})();
export function holeBackSvg() {
  let s = '';
  s += Ell(52, 80, 48, 17, { fill: SH, opacity: 0.2, 'data-r': 'tone' });
  // montículo: la tapa de tierra suelta alrededor de la boca
  s += face(ellD(50, 74, 46, 20), SOIL, { w: 2.2 });
  s += flat('M10 70C16 60 34 55 50 55C66 55 84 60 90 70C80 63 66 60 50 60C34 60 20 63 10 70Z', '#D49E6C');
  // terrones sobre el borde de atrás
  [[19, 63, 5], [33, 57.5, 4], [68, 57.5, 4.5], [83, 63, 4]].forEach(([x, y, w]) => { s += part(ellD(x, y, w, w * 0.62), '#A5703F', { w: 1.3 }); });
  // la boca: pared del fondo iluminada y lo hondo, oscuro
  s += face(ellD(50, 73, 34, 12.5), '#3A2219', { w: 2 });
  s += flat('M16.5 71C20 64 34 60.5 50 60.5C66 60.5 80 64 83.5 71C74 67 62 65.5 50 65.5C38 65.5 26 67 16.5 71Z', '#7A4C33');
  s += flat('M19 73C24 69 36 67 50 67C64 67 76 69 81 73C72 71 62 70 50 70C38 70 28 71 19 73Z', '#55331F');
  // matitas que asoman detrás
  s += part(tuftD(9, 70, 10, 1), '#6DBE5D', { w: 1.2 }) + part(tuftD(92, 68, 9, 0.9), '#6DBE5D', { w: 1.2 });
  return piece(100, 100, s);
}
export function holeFrontSvg() {
  let s = '';
  // labio de tierra: grueso adelante, se afina hacia los costados
  s += face('M4 74A46 20 0 0 0 96 74L84 73A34 12.5 0 0 1 16 73Z', '#C68D5B', { w: 2.2 });
  s += flat('M14 81C24 88 37 90.5 50 90.5C63 90.5 76 88 86 81C80 89 66 94 50 94C34 94 20 89 14 81Z', '#A06B42');
  s += flat('M22 80C30 84 40 85.5 50 85.5C60 85.5 70 84 78 80C70 83 60 84 50 84C40 84 30 83 22 80Z', '#DCA674', { opacity: 0.9 });
  // terrones y piedritas en el labio
  [[26, 88, 4.5], [47, 92, 3.6], [71, 89.5, 4.2]].forEach(([x, y, w]) => { s += part(ellD(x, y, w, w * 0.6), '#9C673E', { w: 1.2 }); });
  s += part(ellD(60, 92.5, 3, 2), '#D9D2CC', { w: 1 });
  // matitas de pasto en el borde
  s += part(tuftD(8, 84, 11, 1), '#7CC461', { w: 1.3 }) + part(tuftD(91, 85, 12, 1.05), '#7CC461', { w: 1.3 });
  s += part(tuftD(36, 96, 7, 0.8), '#86CC69', { w: 1.1 });
  return piece(100, 100, s);
}

// Estallido al acertar (estrella de 8 puntas).
export function burstSvg(color = '#FFFFFF') {
  return piece(64, 64, part(starPath(32, 32, 28, 13, 8, -90), color, { w: 2.2 }) + flat(starPath(32, 32, 14, 7, 8, -67.5), mix(color, '#FFF6C8', 0.6)));
}

// ── Cruzar la calle ───────────────────────────────────────────────
// La calle vista desde arriba en 3/4, una casilla = 40 unidades: arriba
// el parque y la vereda de llegada (con la línea a cuadros), seis
// carriles de asfalto con sus líneas, flechas pintadas, paso de cebra,
// alcantarillas y una tapa; abajo la vereda de salida con su franja de
// pasto. Los cordones tienen su canto: el de arriba muestra la cara de
// adelante; el de abajo, solo la tapa (la cara mira hacia el otro lado).
export const STREET = { W: 280, H: 320, CELL: 40 };
const ASPHALT = '#5F5A6C';
const PAVER = '#EAE2D6';

function pavers(x0, y0, w, h, base = PAVER, joint = '#C2B6A8') {
  let s = flat(`M${x0} ${y0}h${w}v${h}h${-w}Z`, base);
  let d = '';
  for (let y = y0 + 10; y < y0 + h - 1; y += 10) d += `M${x0} ${y}H${x0 + w}`;
  for (let y = y0, row = 0; y < y0 + h - 1; y += 10, row++) {
    for (let x = x0 + (row % 2 ? 10 : 20); x < x0 + w; x += 20) d += `M${x} ${y}V${Math.min(y + 10, y0 + h)}`;
  }
  s += line(d, joint, 2, { opacity: 0.6 });
  return s;
}

export function streetSvg() {
  const { W, H, CELL: C } = STREET;
  const r = rng(21);
  let s = '';
  // ── arriba: parque, vereda de llegada y la meta
  s += flat(`M0 0H${W}V14H0Z`, '#8CCB6C');
  for (let x = -6, k = 0; x < W + 10; x += 17, k++) {
    const c = k % 2 ? '#5E9E58' : '#68A85F';
    s += flat(ellD(x, 9, 10, 8), c) + flat(ellD(x - 3, 5, 4.5, 3), tone(c, 0.7));
    if (k % 3 === 1) s += Cir(x + 3, 7, 2.2, { fill: k % 2 ? '#FF9DB8' : '#FFFFFF', 'data-r': 'flat' });
  }
  s += pavers(0, 14, W, 23);
  // línea de llegada a cuadros, pintada en la vereda
  for (let x = 0, k = 0; x < W; x += 8, k++) {
    s += flat(`M${x} 27h8v4h-8Z`, k % 2 ? '#FFFFFF' : '#3E3848');
    s += flat(`M${x} 31h8v4h-8Z`, k % 2 ? '#3E3848' : '#FFFFFF');
  }
  // banderas de la meta, en su poste
  [12, 268].forEach((x, k) => {
    s += Ell(x + 1, 36, 5, 1.8, { fill: SH, opacity: 0.25, 'data-r': 'tone' });
    s += face(rr(x - 1.5, 2, 3.5, 34, 1.5), '#C9CED8', { w: 1.4 });
    const dir = k ? -1 : 1;
    const fx = x + 2 * dir;
    s += part(`M${fx} 3C${fx + 8 * dir} 1 ${fx + 12 * dir} 6 ${fx + 20 * dir} 3V15C${fx + 12 * dir} 18 ${fx + 8 * dir} 13 ${fx} 15Z`, '#FFFFFF', { w: 1.4 });
    s += flat(`M${fx + 5 * dir} 2.6V8.6H${fx + 10 * dir}V3.4C${fx + 8.4 * dir} 2.8 ${fx + 6.6 * dir} 2.6 ${fx + 5 * dir} 2.6ZM${fx} 8.8V14.6C${fx + 2 * dir} 14.2 ${fx + 3.6 * dir} 14 ${fx + 5 * dir} 14.2V8.6ZM${fx + 10 * dir} 8.6V15.2C${fx + 12 * dir} 16 ${fx + 13.4 * dir} 16.2 ${fx + 15 * dir} 15.6V9.4C${fx + 13.4 * dir} 9.4 ${fx + 11.6 * dir} 9 ${fx + 10 * dir} 8.6ZM${fx + 15 * dir} 3.6V9.4C${fx + 16.6 * dir} 9.2 ${fx + 18.2 * dir} 8.8 ${fx + 20 * dir} 8.6V3C${fx + 18.2 * dir} 3.8 ${fx + 16.6 * dir} 3.9 ${fx + 15 * dir} 3.6Z`, '#3E3848');
    s += part(ellD(x + 0.2, 2, 2.6, 2.4), '#FFD15C', { w: 1.2 });
  });
  // cordón de arriba: tapa clara y cara de adelante que baja a la calle
  s += flat(`M0 36H${W}V40H0Z`, '#F4EEE6');
  s += face(`M-4 40H${W + 4}V45H-4Z`, '#B9AEA4', { w: 1.6 });

  // ── la calle
  s += flat(`M0 45H${W}V280H0Z`, ASPHALT);
  for (let k = 0; k < 70; k++) {
    const x = r() * W, y = 48 + r() * 228;
    s += flat(ellD(f1(x), f1(y), f1(1.6 + r() * 2.2), f1(1 + r() * 1.2)), k % 2 ? '#6B6578' : '#544F60');
  }
  // grietitas
  s += line('M150 222L156 226L154 232L160 236', '#4B4656', 1.6, { opacity: 0.7 });
  s += line('M212 214L220 210L226 216', '#4B4656', 1.6, { opacity: 0.7 });
  // bordes pintados y líneas entre carriles (cortadas en la cebra)
  s += flat(`M0 49H${W}V52H0Z`, '#EDE8E0', { opacity: 0.92 });
  s += flat(`M0 272H${W}V275H0Z`, '#EDE8E0', { opacity: 0.92 });
  for (let k = 1; k < 6; k++) {
    const y = 40 + k * C;
    for (let x = 4; x < W; x += 28) {
      if (x + 16 > 114 && x < 166) continue;
      s += flat(`M${x} ${y - 1.5}h16v3h-16Z`, k === 3 ? '#F6D36B' : '#EDE8E0', { opacity: 0.92 });
    }
  }
  // en neón las líneas de la calle son tubos de luz (si no, se pierden)
  for (let k = 1; k < 6; k++) {
    const y = 40 + k * C;
    for (let x = 4; x < W; x += 28) {
      if (x + 16 > 114 && x < 166) continue;
      s += part(`M${x} ${y - 1.5}h16v3h-16Z`, k === 3 ? '#F6D36B' : '#EDE8E0', { w: 1, a: { 'data-only': 'neon' } });
    }
  }
  for (let y = 55; y < 270; y += 13) s += part(`M123 ${y}h34v7h-34Z`, '#F4F0E8', { w: 1, a: { 'data-only': 'neon' } });
  // paso de cebra en la columna del medio
  for (let y = 55; y < 270; y += 13) s += flat(`M123 ${y}h34v7h-34Z`, '#F4F0E8', { opacity: 0.95, 'data-skip': 'neon' });
  s += flat('M118 53h44v1.6h-44ZM118 268.4h44v1.6h-44Z', '#F4F0E8', { opacity: 0.6 });
  // flechas pintadas (el sentido de cada carril), gastadas
  for (let k = 0; k < 6; k++) {
    const dir = k % 2 === 0 ? 1 : -1;
    const cy = 40 + k * C + C / 2;
    const cx = dir > 0 ? (k % 4 === 0 ? 214 : 70) : (k % 4 === 1 ? 70 : 214);
    const t = (x) => cx + x * dir;
    s += shade(`M${t(-14)} ${cy - 2.5}H${t(3)}V${cy - 7}L${t(14)} ${cy}L${t(3)} ${cy + 7}V${cy + 2.5}H${t(-14)}Z`, '#F2EEE6', 0.55);
  }
  // tapa de alcantarilla (redonda en el suelo: una elipse)
  [[70, 178], [214, 102]].forEach(([x, y]) => {
    s += part(ellD(x, y, 10, 5), '#7B7487', { w: 1.6 });
    s += line(`M${x - 6} ${y - 2}H${x + 6}M${x - 7} ${y + 1}H${x + 7}M${x - 3} ${y - 4}V${y + 4}M${x + 3} ${y - 4}V${y + 4}`, '#5A5466', 1.6, { opacity: 0.9 });
  });
  // rejillas de desagüe junto a los cordones
  [[30, 53], [214, 53], [96, 266], [242, 266]].forEach(([x, y]) => {
    s += face(rr(x - 10, y, 20, 6, 1.5), '#3F3A48', { w: 1.4 });
    s += line(`M${x - 6} ${y + 1.5}V${y + 4.5}M${x - 2} ${y + 1.5}V${y + 4.5}M${x + 2} ${y + 1.5}V${y + 4.5}M${x + 6} ${y + 1.5}V${y + 4.5}`, '#77708A', 1.6);
  });

  // ── abajo: vereda de salida y franja de pasto
  s += flat(`M0 280H${W}V284H0Z`, '#F4EEE6');
  s += line(`M0 280H${W}`, '#B9AEA4', 2);
  s += pavers(0, 284, W, 22);
  s += flat(`M0 306H${W}V${H}H0Z`, '#8CCB6C');
  s += flat(`M0 306H${W}V308H0Z`, '#78B35C');
  for (let x = 6, k = 0; x < W; x += 13, k++) s += flat(tuftD(x + (k % 3) * 2, 316 + (k % 2) * 2, 6 + (k % 3) * 2, 0.9), k % 2 ? '#6FB257' : '#78BA5E');
  [[40, 314, '#FFFFFF'], [96, 316, '#FFE3EE'], [180, 313, '#FFFFFF'], [236, 316, '#FFE3EE']].forEach(([x, y, c]) => { s += daisy(x, y, 4.4, c, '#FFC93D', true); });
  // hidrante en la vereda
  s += Ell(17, 304, 8, 2.2, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
  s += part('M11 304V292C11 289.5 12.5 288 15 288H19C21.5 288 23 289.5 23 292V304Z', '#E8505E', { w: 1.6 });
  s += part('M10.5 289C10.5 284.5 13.5 282 17 282C20.5 282 23.5 284.5 23.5 289Z', '#F0707B', { w: 1.6 });
  s += part(rr(7, 293, 4.5, 4.5, 1.2), '#C93E4D', { w: 1.2 }) + part(rr(22.5, 293, 4.5, 4.5, 1.2), '#C93E4D', { w: 1.2 });
  s += part(rr(9.5, 302, 15, 3.5, 1), '#C93E4D', { w: 1.2 });
  s += flat('M13 290h2.6v11h-2.6Z', '#FFFFFF', { opacity: 0.55 });
  // arbusto en la esquina
  s += bush(272, 318, 40, '#5FA85A', { berries: [[-0.1, -0.8], [0.2, -0.6]] });
  return piece(W, H, s);
}

// ── Autitos (Cruzar la calle) ─────────────────────────────────────
// De costado, mirando a la derecha, en la vista 3/4 del mundo: la cara
// del costado entera y, encima, el techo y el capó vistos un poco desde
// arriba (la tapa, más clara). Ruedas que asoman bajo el pasarruedas,
// faros, parachoques y ventanas con brillo. Tres modelos.
export const CAR_KINDS = 3;
export function carSvg(color, kind = 0) {
  const m = mat(color);
  const glass = '#D2ECF8';
  let s = Ell(32, 30.8, 27, 2.6, { fill: SH, opacity: 0.3, 'data-r': 'tone' });
  const wheels = [18, 47];
  if (kind === 1) {
    // furgoneta: caja alta y trompa corta
    s += part('M5 25.5V11C5 7.8 7 6 10 6H43C46 6 48 7 49.6 9L55.6 15.4C58.6 16 60 17.8 60 20.6V25.5C60 27 59 28 57.5 28H7.5C6 28 5 27 5 25.5Z', color, { w: 2.2 });
    s += flat('M7 7.4C7.6 6.6 8.6 6.2 10 6.2H43C45 6.2 46.6 6.8 47.8 8.2C45 7.8 42 7.6 39 7.6H10C8.6 7.6 7.6 7.6 7 7.4Z', m.top);
    s += part(rr(9, 9.6, 11.5, 7, 1.6), glass, { w: 1.4 }) + part(rr(23, 9.6, 11.5, 7, 1.6), glass, { w: 1.4 });
    s += part('M37.5 9.6H46.6L52 16.6H37.5Z', glass, { w: 1.4 });
    s += flat('M5.6 18.6H59.4V21H5.6Z', mix(color, '#FFFFFF', 0.62));
    s += shine('M11 15L14.5 10.8H16.2L12.8 15Z') + shine('M39.5 15L42.6 10.8H44.2L41.2 15Z');
    s += line('M36 10V26', m.side, 1.2, { opacity: 0.7 });
  } else if (kind === 2) {
    // gotita: chiquito y redondo, una sola ventana grande
    s += part('M7 25.5V19C7 11 14.6 5.6 26 5.6H35C47 5.6 56.4 11.4 57.6 18.6C58.6 19.4 59 20.4 59 21.6V25.5C59 27 58 28 56.5 28H9.5C8 28 7 27 7 25.5Z', color, { w: 2.2 });
    s += flat('M14 10.6C17.6 8 21.6 7 26 7H35C41 7 46.6 8.6 50.4 11.6C45 10.4 40 10 35 10H26C21.6 10 17.6 10.2 14 10.6Z', m.top);
    s += part('M18 15.6C19.6 12 23 10.8 27 10.8H35.6C40.6 10.8 45 12.4 47.6 15.6Z', glass, { w: 1.4 });
    s += line('M32 11V15.4', m.side, 1.4);
    s += shine('M21 15L24.6 12H26.4L23 15Z');
    s += flat(ellD(32, 20.5, 5.5, 2.6), mix(color, '#FFFFFF', 0.55));
  } else {
    // burbuja: cabina redonda, capó y maletero
    s += part('M5 25.5V20C5 16.4 7.6 14.8 11.5 14.3L17.5 13.6C20.5 8 25.5 5 32.5 5C39.5 5 44 8 47.5 13.4L54.5 14.2C58.6 14.8 60 17.5 60 21V25.5C60 27 59 28 57.5 28H7.5C6 28 5 27 5 25.5Z', color, { w: 2.2 });
    s += flat('M19.5 12.4C22.2 8.6 26.4 6.6 32.5 6.6C38.6 6.6 42.4 8.6 45 12.2C41 11 36.6 10.5 32.5 10.5C28 10.5 23.6 11 19.5 12.4Z', m.top);
    s += flat('M48.4 14.8L54.2 15.5C56.4 15.8 57.8 16.7 58.4 18.1C55 17.2 51.4 16.6 48.4 16.6ZM6.6 18C7.2 16.6 8.8 15.8 11.4 15.5L16.8 14.9V16.6C13 16.6 9.6 17.1 6.6 18Z', m.top);
    s += part('M20.6 13.6C23 10.8 26.6 9.7 31.2 9.7V13.6Z', glass, { w: 1.4 });
    s += part('M33.8 9.7C38.2 9.8 41.6 10.9 44 13.6H33.8Z', glass, { w: 1.4 });
    s += shine('M23 13L26.4 10.8H28L24.8 13Z');
    s += line('M32.5 14.4V25', m.side, 1.2, { opacity: 0.7 });
  }
  // manija, faldón en sombra, faros y parachoques
  s += flat(rr(kind === 1 ? 38.5 : 35, kind === 1 ? 12 : 16.6, 4, 1.8, 0.9), m.deep);
  s += shade('M6 23.4H59V25.5C59 27 58 27.6 57 27.6H8C6.8 27.6 6 27 6 25.5Z', m.deep, 0.35);
  s += part(ellD(58.2, kind === 1 ? 18.6 : 19, 1.9, 1.8), '#FFE9A8', { w: 1 });
  s += part(rr(kind === 2 ? 6 : 4, 17.4, 2.6, 3.6, 1), '#F0646E', { w: 1 });
  s += part(rr(55.6, 23.6, 6.4, 3, 1.4), '#E4E1EA', { w: 1.2 }) + part(rr(2.6, 23.6, 6.4, 3, 1.4), '#E4E1EA', { w: 1.2 });
  // ruedas bajo su pasarruedas
  wheels.forEach((x) => {
    s += shade(`M${x - 7.4} 26.4A7.4 7 0 0 1 ${x + 7.4} 26.4Z`, m.deep, 0.75);
    s += part(ellD(x, 27.6, 5.6, 5.6), '#3B3542', { w: 1.6 });
    s += flat(ellD(x, 27.6, 2.6, 2.6), '#D9D6E0');
    s += Cir(x - 0.9, 26.7, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
  });
  return piece(64, 34, s);
}

// Camión de helados: caja larga con ventanita de atender y su toldo, un
// cucurucho gigante en el techo y la cabina adelante. Va el doble de
// largo que un auto.
export function truckSvg(color) {
  const box = '#FBF3E8';
  const m = mat(color);
  let s = Ell(55, 41, 51, 3, { fill: SH, opacity: 0.3, 'data-r': 'tone' });
  // cucurucho en el techo (detrás de la caja)
  s += part('M33 9L39 22L45 9Z', '#E2B06A', { w: 1.6 });
  s += line('M35.4 12L41 18M37.6 9.6L43 14.6M42.6 12L37.4 17.6', '#B98243', 1.2, { opacity: 0.8 });
  s += part('M31 9.6C31 4.4 34.6 1.4 39 1.4C43.4 1.4 47 4.4 47 9.6C45 11 33 11 31 9.6Z', '#FF9EC0', { w: 1.6 });
  s += Cir(40.6, 1.6, 1.8, { fill: '#F05A78', stroke: INK, 'stroke-width': 1, 'data-r': 'part' });
  // caja de carga
  s += face(rr(4, 12, 70, 25, 3), box, { w: 2.2 });
  s += flat('M5.4 13.4C6 12.6 7 12.2 8 12.2H70C71.4 12.2 72.4 12.8 72.8 13.6Z', '#FFFFFF');
  s += flat('M5 30H73V33.6C73 35 72 36 70.6 36H7.4C6 36 5 35 5 33.6Z', color);
  // ventanita de atender, con su toldo a rayas y el mostrador
  s += face(rr(12, 17.6, 30, 9.4, 1.6), '#7C5A6A', { w: 1.6 });
  s += flat(rr(14, 19, 26, 3, 1), '#9C7A8A');
  s += face(rr(10.4, 26.4, 33.2, 3, 1.2), '#E9DCCB', { w: 1.4 });
  let aw = 'M9.6 14.6H44.4V18.6';
  for (let k = 0; k < 6; k++) aw += `Q${f1(44.4 - k * 5.8 - 2.9)} 22.6 ${f1(44.4 - (k + 1) * 5.8)} 18.6`;
  s += part(`${aw}V14.6Z`, '#FFFFFF', { w: 1.4 });
  for (let k = 0; k < 6; k += 2) s += flat(`M${f1(9.6 + k * 5.8)} 14.8H${f1(9.6 + (k + 1) * 5.8)}V18.6Q${f1(9.6 + k * 5.8 + 2.9)} 22.2 ${f1(9.6 + k * 5.8)} 18.6Z`, color);
  // corazón pintado en la caja
  s += part(HEART(58, 23, 0.32), '#FF7FA8', { w: 1.2 });
  // cabina
  s += face('M74 18H91C96 18 99 21 101.4 25L105.6 28.4V36H74Z', color, { w: 2.2 });
  s += flat('M75.4 19.4H90.6C93.6 19.4 95.8 20.6 97.6 22.6C95 21.4 92.6 21 90.4 21H75.4Z', m.top);
  s += part('M79 21.4H90C93 21.4 95 23.2 96.4 26H79Z', '#D2ECF8', { w: 1.4 });
  s += shine('M81 25L84 22.4H85.8L82.8 25Z');
  s += flat(rr(80, 28, 4, 1.8, 0.9), m.deep);
  s += part(ellD(104, 30.4, 1.9, 1.8), '#FFE9A8', { w: 1 });
  s += part(rr(103, 33, 5, 3, 1.4), '#E4E1EA', { w: 1.2 });
  s += part(rr(2.4, 31, 3, 3.6, 1), '#F0646E', { w: 1 });
  [20, 44, 92].forEach((x) => {
    s += shade(`M${x - 7.6} 35.4A7.6 7 0 0 1 ${x + 7.6} 35.4Z`, '#5A4E5E', 0.55);
    s += part(ellD(x, 36.6, 6, 6), '#3B3542', { w: 1.6 });
    s += flat(ellD(x, 36.6, 2.8, 2.8), '#D9D6E0');
    s += Cir(x - 1, 35.6, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
  });
  return piece(110, 44, s);
}

// ── Salta y vuela ─────────────────────────────────────────────────
// Un cielo en capas que se mueven a distinta velocidad (paralaje): el
// cielo y el sol quietos, nubes que van muy lento, una ciudad lejana,
// colinas con árboles y una casita, y el pasto de adelante, que corre a
// la misma velocidad que los pilares. Cada capa mide FLY_SCENE y se
// repite a lo ancho sin costura (lo que sale por la derecha entra por la
// izquierda).
export const FLY_SCENE = { W: 320, H: 400, GROUND: 372 };

// Dibuja `fn(dx)` dos veces, corrido un ancho, para que la tira empalme.
const wrap = (fn, W) => fn(0) + fn(-W);

export function flySkySvg() {
  const { W, H } = FLY_SCENE;
  let s = '';
  [['#A3D8F4', 0], ['#B3DFF6', 70], ['#C3E6F8', 140], ['#D2ECF9', 210], ['#E0F2FA', 270], ['#EAF6FB', 320]].forEach(([c, y]) => { s += flat(`M0 ${y}H${W}V${H}H0Z`, c); });
  // sol con su halo
  s += flat(ellD(258, 62, 38, 38), '#FFFDF2', { opacity: 0.3 });
  s += flat(ellD(258, 62, 28, 28), '#FFFDF2', { opacity: 0.45 });
  s += part(ellD(258, 62, 20, 20), '#FFE58A', { w: 1.8 });
  s += flat(ellD(252, 56, 7, 5), '#FFF8DA');
  return piece(W, H, s);
}

export function flyCloudsSvg() {
  const { W, H } = FLY_SCENE;
  const one = (x, y, w, o) => wrap((dx) => cloud(x + dx, y, w, '#FFFFFF', { flat: true, dim: o }), W);
  let s = one(18, 74, 64, 0.3) + one(150, 128, 50, 0.3) + one(232, 40, 40, 0.25) + one(96, 196, 36, 0.22) + one(272, 176, 56, 0.3);
  return piece(W, H, s);
}

export function flyCitySvg() {
  const { W, H } = FLY_SCENE;
  let s = '';
  const blds = [
    [0, 26, 70, '#B7C2EA', 'flat'], [24, 22, 96, '#A6B2E2', 'dome'], [44, 30, 58, '#C4CBEE', 'flat'],
    [72, 18, 120, '#A0ADDF', 'spire'], [88, 34, 74, '#B7C2EA', 'step'], [120, 24, 62, '#C4CBEE', 'flat'],
    [142, 28, 104, '#A6B2E2', 'flat'], [168, 20, 80, '#B7C2EA', 'dome'], [186, 36, 64, '#C4CBEE', 'step'],
    [220, 22, 112, '#A0ADDF', 'clock'], [240, 30, 70, '#B7C2EA', 'flat'], [268, 26, 90, '#A6B2E2', 'step'], [292, 30, 60, '#C4CBEE', 'flat'],
  ];
  const base = 330;
  s += wrap((dx) => blds.map(([x, w, h, c, roof]) => {
    const X = x + dx, top = base - h;
    let b = flat(`M${X} ${base + 20}V${top}H${X + w}V${base + 20}Z`, c);
    if (roof === 'dome') b += flat(`M${X} ${top}A${w / 2} ${w * 0.42} 0 0 1 ${X + w} ${top}Z`, c);
    if (roof === 'spire') b += flat(`M${X + 2} ${top}L${X + w / 2} ${top - 28}L${X + w - 2} ${top}Z`, c) + flat(`M${X + w / 2 - 1} ${top - 38}h2v10h-2Z`, c);
    if (roof === 'step') b += flat(`M${X + 5} ${top}V${top - 10}H${X + w - 5}V${top}Z`, c);
    if (roof === 'clock') {
      b += flat(`M${X + 3} ${top}V${top - 18}L${X + w / 2} ${top - 32}L${X + w - 3} ${top - 18}V${top}Z`, c);
      b += flat(ellD(X + w / 2, top - 12, 6, 6), '#E6EAFB');
    }
    // ventanas en columnas (de día, un poco más claras que la pared)
    for (let y = top + 8; y < base + 6; y += 12) for (let wx = X + 5; wx + 5 < X + w - 2; wx += 9) b += flat(`M${wx} ${y}h4v6h-4Z`, mix(c, '#FFFFFF', 0.45));
    return b;
  }).join(''), W);
  return piece(W, H, s);
}

export function flyHillsSvg() {
  const { W, H } = FLY_SCENE;
  let s = '';
  const ridge = (y, amp, c, k) => {
    let d = `M0 ${H}V${y}`;
    for (let x = 0; x <= W; x += 40) d += `Q${x + 20} ${y - amp * (((x / 40 + k) % 3) ? 1 : 0.4)} ${x + 40} ${y}`;
    return flat(`${d}V${H}Z`, c);
  };
  s += ridge(326, 26, '#A8D886', 0);
  // casita con techo rojo y su chimenea, en la loma de atrás
  const house = (x) => {
    let h = flat(`M${x + 12} 296h4v-10h-4Z`, '#B9706E');
    h += part(`M${x} 320V304H${x + 26}V320Z`, '#FFF4E4', { w: 1.4 });
    h += part(`M${x - 3} 305L${x + 13} 292L${x + 29} 305Z`, '#E8636E', { w: 1.4 });
    h += flat(`M${x + 4} 308h6v5h-6Z`, '#9ED3F0') + flat(`M${x + 15} 309h6v11h-6Z`, '#B98760');
    return h;
  };
  s += house(114);
  s += ridge(346, 22, '#8FCB70', 1);
  // árboles redondos sobre las lomas
  const tree = (x, y, rr0, c) => flat(`M${x - 1.5} ${y}h3v${-rr0 * 0.8}h-3Z`, '#8A6248') + flat(ellD(x, y - rr0 * 1.2, rr0, rr0 * 0.95), c) + flat(ellD(x - rr0 * 0.3, y - rr0 * 1.5, rr0 * 0.4, rr0 * 0.3), tone(c, 0.6));
  s += wrap((dx) => tree(34 + dx, 324, 10, '#6BAF5E') + tree(56 + dx, 327, 7, '#7DBB66') + tree(206 + dx, 322, 12, '#6BAF5E') + tree(228 + dx, 326, 8, '#7DBB66') + tree(300 + dx, 344, 9, '#5FA458'), W);
  s += ridge(362, 16, '#7EBF62', 2);
  return piece(W, H, s);
}

export function flyGroundSvg() {
  const { W, H, GROUND: G0 } = FLY_SCENE;
  let s = '';
  s += flat(`M0 ${G0}H${W}V${H}H0Z`, '#A9764E');
  s += flat(`M0 ${G0 + 10}H${W}V${G0 + 14}H0Z`, '#8E5F3E');
  // piedritas en la tierra
  [[20, 390], [70, 386], [128, 393], [180, 388], [236, 392], [292, 387]].forEach(([x, y], k) => { s += flat(ellD(x, y, 3 + (k % 2), 2), '#C99A6E'); });
  // pasto con borde ondulado y matitas que asoman
  let d = `M0 ${G0 + 10}V${G0}`;
  for (let x = 0; x < W; x += 16) d += `Q${x + 8} ${G0 + 4} ${x + 16} ${G0}`;
  s += part(`${d}V${G0 + 10}Q${W * 0.75} ${G0 + 13} ${W / 2} ${G0 + 10}T0 ${G0 + 10}Z`, '#8CCB6C', { w: 1.8 });
  s += flat(`M0 ${G0 + 1}H${W}V${G0 + 4}H0Z`, '#A6DA82');
  for (let x = 6, k = 0; x < W; x += 20, k++) s += part(tuftD(x + (k % 3) * 3, G0 + 2, 8 + (k % 3) * 3, 0.9), k % 2 ? '#7CC060' : '#8DCC6C', { w: 1.2 });
  [[46, '#FFFFFF'], [150, '#FFE3EE'], [262, '#FFFFFF']].forEach(([x, c]) => { s += line(`M${x} ${G0 + 2}V${G0 - 8}`, '#5E9A42', 2) + daisy(x, G0 - 10, 5, c, '#FFC93D'); });
  return piece(W, H, s);
}

// Pilar de golosina: un bastón a rayas con su glaseado. `end`:
// 'bottom' sube desde el pasto (el glaseado arriba, con chorreados que
// bajan y una cereza); 'top' cuelga desde arriba (el glaseado abajo y los
// chorreados que caen). `h` en unidades del juego (el ancho es 54).
export const PILLAR_FLAVORS = [
  { stripe: '#F27A9A', icing: '#FFB3CC', top: '#F05A78' },
  { stripe: '#5FC2A0', icing: '#BDF0DA', top: '#F05A78' },
  { stripe: '#9C84E0', icing: '#D9CCFA', top: '#FFC93D' },
];
export function pillarSvg(h, end = 'bottom', flavor = 0) {
  const F = PILLAR_FLAVORS[flavor % PILLAR_FLAVORS.length];
  const W = 54;
  const up = end === 'bottom';
  const H = Math.max(30, Math.round(h));
  const pad = up ? 10 : 0;        // lugar para la cereza
  const capH = 22;
  // el bastón ocupa de y0 a y1; el glaseado va en la punta libre
  const y0 = up ? pad + capH - 4 : -4;
  const y1 = up ? H + pad + 4 : H - capH + 4;
  let s = '';
  s += face(`M8 ${y0}H46V${y1}H8Z`, '#FFF6EE', { w: 2.2 });
  // rayas en espiral, recortadas al bastón (no se asoman por las puntas)
  let st = '';
  for (let y = y0 - 30; y < y1 + 20; y += 24) st += flat(`M8 ${f1(y + 19)}L46 ${f1(y)}V${f1(y + 10)}L8 ${f1(y + 29)}Z`, F.stripe);
  const cid = `baston-${end}-${H}`;
  s += `<defs><clipPath id="${cid}"><path d="M8 ${y0}H46V${y1}H8Z"/></clipPath></defs>` + G({ 'clip-path': `url(#${cid})` }, st);
  s += flat(`M12 ${y0}H17V${y1}H12Z`, '#FFFFFF', { opacity: 0.55 });
  s += shade(`M37 ${y0}H46V${y1}H37Z`, '#5A3A5A', 0.18);
  // chispitas: pocas y gorditas (en pixel, de 2–3 píxeles; no ruido)
  const sprinkles = (oy) => [[14, 4, '#FFC93D', 0], [27, 2, '#5FC2A0', 1], [39, 6, '#7FA9DE', 0], [23, 10, '#F05A78', 1]].map(([x, y, c, k]) => {
    const Y = y + oy;
    return flat(k ? `M${x - 3} ${Y + 1.6}L${x + 2} ${Y - 1}L${x + 3.6} ${Y + 1.4}L${x - 1.4} ${Y + 4}Z` : `M${x - 3} ${Y}h6v3h-6Z`, c);
  }).join('');
  if (up) {
    // glaseado en la tapa, con chorreados que bajan por el bastón y cereza
    const t = pad, b = pad + capH;
    s += part(`M1 ${b - 6}C1 ${t + 3} 12 ${t} 27 ${t}C42 ${t} 53 ${t + 3} 53 ${b - 6}C53 ${b - 1} 50 ${b} 47 ${b}C47 ${b + 7} 39 ${b + 7} 39 ${b}H35C35 ${b + 12} 25 ${b + 12} 25 ${b}H17C17 ${b + 5} 9 ${b + 5} 9 ${b}H7C3 ${b} 1 ${b - 2} 1 ${b - 6}Z`, F.icing, { w: 2.2 });
    s += flat(`M6 ${b - 9}C6 ${t + 6} 12 ${t + 4} 20 ${t + 4}V${t + 8}C14 ${t + 8} 10 ${t + 10} 10 ${b - 9}Z`, '#FFFFFF', { opacity: 0.75 });
    s += sprinkles(t + 5);
    s += line(`M28 ${t + 1}C28 ${t - 4} 31 ${t - 7} 35 ${t - 8}`, '#6E8F3E', 2);
    s += part(ellD(27, t - 1, 6, 5.4), F.top, { w: 1.8 }) + flat(ellD(25, t - 3, 2, 1.6), '#FFFFFF', { opacity: 0.9 });
  } else {
    // cuelga: una faja de glaseado en la punta de abajo y gotas que caen
    const c0 = H - 28;
    s += part(`M1 ${c0 + 4}C1 ${c0 + 1} 4 ${c0} 8 ${c0}H46C50 ${c0} 53 ${c0 + 1} 53 ${c0 + 4}V${c0 + 12}C53 ${c0 + 16} 51 ${c0 + 17} 47 ${c0 + 17}C47 ${c0 + 23} 39 ${c0 + 23} 39 ${c0 + 17}H35C35 ${c0 + 27} 25 ${c0 + 27} 25 ${c0 + 17}H17C17 ${c0 + 21} 9 ${c0 + 21} 9 ${c0 + 17}H7C3 ${c0 + 17} 1 ${c0 + 15} 1 ${c0 + 12}Z`, F.icing, { w: 2.2 });
    s += flat(`M6 ${c0 + 3}H24V${c0 + 6}H6Z`, '#FFFFFF', { opacity: 0.75 });
    s += sprinkles(c0 + 3);
  }
  return piece(W, H + pad, s);
}

// ── Serpiente golosa ──────────────────────────────────────────────
// Un mantel de pícnic a cuadros (cada cuadro del mantel es una casilla
// del juego) tendido sobre el pasto, con su dobladillo cosido y flecos
// arriba y abajo. `n` casillas por lado, `m` de margen de pasto (en
// casillas). Una casilla = 40 unidades.
export function picnicSvg(n = 11, m = 0.45) {
  const C = 40, M = Math.round(m * C);
  const S = n * C + M * 2;
  const r = rng(5);
  let s = flat(`M0 0H${S}V${S}H0Z`, '#8CCB6C');
  // pasto del margen: matitas y flores
  for (let k = 0; k < 60; k++) {
    const side = k % 4;
    const t = r() * S;
    const u = r() * M;
    const [x, y] = side === 0 ? [t, u] : side === 1 ? [t, S - u] : side === 2 ? [u, t] : [S - u, t];
    s += flat(tuftD(f1(x), f1(y + 4), 6, 0.8), k % 3 ? '#6FB257' : '#78BA5E');
  }
  [[M * 0.5, S * 0.3], [S - M * 0.5, S * 0.62], [S * 0.72, M * 0.45], [S * 0.18, S - M * 0.45], [S - M * 0.5, M * 0.6]].forEach(([x, y], k) => { s += daisy(f1(x), f1(y), 5, k % 2 ? '#FFE3EE' : '#FFFFFF', '#FFC93D'); });
  // sombra del mantel en el pasto
  s += shade(`M${M + 4} ${M + 6}H${S - M + 4}V${S - M + 6}H${M + 4}Z`, SH, 0.18);
  // el mantel: blanco, franjas rosadas y donde se cruzan, más intenso
  const W0 = '#FFF6F2', L = '#FAC8D3', D = '#F29BB0';
  s += flat(`M${M} ${M}H${S - M}V${S - M}H${M}Z`, W0);
  for (let i = 0; i < n; i += 2) s += flat(`M${M + i * C} ${M}h${C}V${S - M}h${-C}Z`, L);
  for (let j = 0; j < n; j += 2) s += flat(`M${M} ${M + j * C}H${S - M}v${C}H${M}Z`, L);
  for (let i = 0; i < n; i += 2) for (let j = 0; j < n; j += 2) s += flat(`M${M + i * C} ${M + j * C}h${C}v${C}h${-C}Z`, D);
  // trama de la tela: hilos finos en cada franja (tenues)
  let d = '';
  for (let i = 0; i < n; i++) d += `M${M + i * C + 13} ${M}V${S - M}M${M + i * C + 27} ${M}V${S - M}`;
  s += line(d, '#E07A94', 1.6, { opacity: 0.18 });
  // dobladillo cosido
  s += line(`M${M + 7} ${M + 7}H${S - M - 7}V${S - M - 7}H${M + 7}Z`, '#E07A94', 1.8, { opacity: 0.55, 'stroke-dasharray': '6 5' });
  // flecos arriba y abajo
  for (let x = M + 6; x < S - M - 2; x += 10) {
    s += flat(`M${x} ${M - 7}h4v7h-4Z`, '#F7B5C4') + flat(`M${x} ${S - M}h4v7h-4Z`, '#F7B5C4');
  }
  return piece(S, S, s);
}

// Un tramo del cuerpo: una bolita mullida con brillo y sombra de apoyo.
export function snakeBallSvg(color = '#8FD6A8', tail = false) {
  const m = mat(color);
  const R = tail ? 11 : 14;
  let s = Ell(20, 33, R * 0.9, 3.2, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
  s += part(ellD(20, 20 + (14 - R) * 0.6, R, R * 0.94), color, { w: 2.2 });
  s += flat(ellD(20, 25 + (14 - R) * 0.5, R * 0.62, R * 0.3), m.side, { opacity: 0.55 });
  s += flat(ellD(15.5, 14.5 + (14 - R) * 0.7, R * 0.32, R * 0.22), '#FFFFFF', { opacity: 0.85 });
  return piece(40, 40, s);
}

// Platito de pícnic para que la comida no quede tirada en el mantel.
export function picnicPlateSvg() {
  let s = Ell(20, 30, 17, 4, { fill: SH, opacity: 0.18, 'data-r': 'tone' });
  s += face(ellD(20, 27, 17, 8.5), '#FFFFFF', { w: 1.8 });
  s += flat(ellD(20, 27.4, 11, 5), '#EEF4F8');
  s += line(ellD(20, 27, 14.5, 7), '#9FD3F0', 1.6, { opacity: 0.8 });
  return piece(40, 40, s);
}

// Barra de utensilios colgados (cucharón, espátula, batidor), 84 de
// ancho desde (x, y). La usan la cocina de "Atrapa" y el mesón de Cocina.
export function utensilRail(x, y) {
  const X = (v) => x + v - 206, Y = (v) => y + v - 72;
  let s = Ell(X(250), Y(140), 34, 2.4, { fill: SH, opacity: 0.08, 'data-r': 'tone' });
  s += face(rr(X(206), Y(72), 84, 4, 2), '#C9CED8', { w: 1.4 });
  [214, 282].forEach((v) => { s += part(rr(X(v) - 2, Y(68), 4, 6, 1), '#A9AFBC', { w: 1.2 }); });
  s += line(`M${X(224)} ${Y(76)}V${Y(80)}M${X(248)} ${Y(76)}V${Y(80)}M${X(270)} ${Y(76)}V${Y(80)}`, '#8E95A3', 2);
  s += face(rr(X(222.5), Y(80), 3, 30, 1.5), '#E2B06A', { w: 1.2 }) + part(`M${X(216)} ${Y(110)}C${X(216)} ${Y(120)} ${X(232)} ${Y(120)} ${X(232)} ${Y(110)}Z`, '#C9CED8', { w: 1.4 });
  s += face(rr(X(246.5), Y(80), 3, 28, 1.5), '#E86A6A', { w: 1.2 }) + part(rr(X(242), Y(106), 12, 16, 3), '#F08A8A', { w: 1.4 });
  s += line(`M${X(246)} ${Y(110)}V${Y(119)}M${X(250)} ${Y(110)}V${Y(119)}`, '#C9555A', 1.6);
  s += face(rr(X(268.5), Y(80), 3, 18, 1.5), '#9C84E0', { w: 1.2 });
  s += part(`M${X(270)} ${Y(97)}C${X(262)} ${Y(104)} ${X(262)} ${Y(120)} ${X(270)} ${Y(124)}C${X(278)} ${Y(120)} ${X(278)} ${Y(104)} ${X(270)} ${Y(97)}Z`, '#E8ECF2', { w: 1.4 });
  s += line(`M${X(270)} ${Y(98)}V${Y(123)}M${X(266)} ${Y(103)}C${X(264)} ${Y(110)} ${X(265)} ${Y(118)} ${X(268)} ${Y(122)}M${X(274)} ${Y(103)}C${X(276)} ${Y(110)} ${X(275)} ${Y(118)} ${X(272)} ${Y(122)}`, '#A9AFBC', 1.4);
  return s;
}

// Sombra de apoyo suelta (para la mochi parada en el piso de una escena).
export function groundShadowSvg() {
  return piece(40, 10, Ell(20, 5, 17, 3.6, { fill: SH, opacity: 0.25, 'data-r': 'tone' }));
}

// ── Atrapa la comida ──────────────────────────────────────────────
// Una cocina: la comida cae desde la alacena de arriba (las puertas
// abiertas, frascos adentro) y la mochi la ataja en el piso a cuadros.
// La pared queda tranquila en el medio para que lo que cae se lea.
export const KITCHEN = { W: 300, H: 380, FLOOR: 344 };

export function kitchenSvg() {
  const { W, H, FLOOR } = KITCHEN;
  let s = '';
  // pared: papel con rayitas muy suaves
  s += flat(`M0 0H${W}V${FLOOR}H0Z`, '#FCEFE3');
  for (let x = 6; x < W; x += 24) s += flat(`M${x} 60h9V${FLOOR}h-9Z`, '#F8E6D7');
  // ventana con cortinas (izquierda)
  s += face(rr(14, 96, 92, 96, 4), '#FFFFFF', { w: 2.2 });
  s += flat(rr(20, 102, 80, 84, 2), '#BFE6F8');
  s += flat('M20 150Q44 140 60 150T100 146V186H20Z', '#9ED37E');
  s += cloud(30, 126, 26, '#FFFFFF', { flat: true, dim: 0.2 });
  s += line('M60 103V185M21 144H99', '#FFFFFF', 3.4);
  s += face(rr(8, 190, 104, 8, 2), '#F2E6D8', { w: 1.8 });
  // maceta con hierbas en el alféizar
  s += face('M76 190L78 176H96L98 190Z', '#E6845E', { w: 1.6 });
  s += part('M80 176C78 166 82 160 86 158C86 164 88 168 87 176Z', '#6DBE5E', { w: 1.2 }) + part('M86 176C86 164 92 158 98 158C96 166 93 172 92 176Z', '#5FAE52', { w: 1.2 });
  // cortinas a cuadritos, atadas
  [[8, 1], [112, -1]].forEach(([x, k]) => {
    s += part(`M${x} 88H${x + 22 * k}C${x + 24 * k} 120 ${x + 8 * k} 134 ${x + 14 * k} 150C${x + 18 * k} 168 ${x + 22 * k} 186 ${x + 20 * k} 196H${x}Z`, '#F7A6B9', { w: 1.8 });
    s += line(`M${x + 6 * k} 92V194M${x + 13 * k} 92C${x + 14 * k} 120 ${x + 5 * k} 136 ${x + 9 * k} 150`, '#FFFFFF', 2, { opacity: 0.6 });
    s += part(rr(x + (k > 0 ? 6 : -18), 146, 12, 6, 3), '#FFD15C', { w: 1.2 });
  });
  s += face(rr(4, 84, 112, 6, 3), '#C99A6B', { w: 1.6 });
  // reloj de pared, colgado de su clavo
  s += Cir(150, 78, 1.8, { fill: '#8A6248', 'data-r': 'flat' });
  s += part(ellD(150, 100, 19, 19), '#FFB3C8', { w: 2 });
  s += face(ellD(150, 100, 13.5, 13.5), '#FFFBF4', { w: 1.6 });
  [[150, 89.5], [160.5, 100], [150, 110.5], [139.5, 100]].forEach(([x, y]) => { s += Cir(x, y, 1.6, { fill: '#C9A0B4', 'data-r': 'flat' }); });
  s += line('M150 100V92M150 100L156 103', INK, 2);
  s += utensilRail(206, 72);
  // repisa con frascos y una taza (derecha)
  s += face(rr(196, 196, 92, 7, 2), '#C99A6B', { w: 1.8 });
  s += shade('M196 203H288V209H196Z', SH, 0.1);
  [[208, 22, '#FFD15C'], [228, 28, '#F7A6B9'], [250, 20, '#9ED3F0']].forEach(([x, h, c]) => {
    s += part(rr(x - 8, 196 - h, 16, h, 4), mix(c, '#FFFFFF', 0.55), { w: 1.6 });
    s += flat(rr(x - 6, 196 - h * 0.6, 12, h * 0.6 - 2, 3), c);
    s += part(rr(x - 9, 192 - h, 18, 5, 2), tone(c, -0.4), { w: 1.4 });
    s += flat(`M${x - 5} ${199 - h}h2v${h - 8}h-2Z`, '#FFFFFF', { opacity: 0.8 });
  });
  s += part('M266 196V182H282V192C282 195 280 196 278 196Z', '#FFFFFF', { w: 1.6 }) + line('M282 185C289 185 289 192 282 192', INK, 2.4);
  s += flat('M268 186h12v3h-12Z', '#7FC8F0');
  // alacena de arriba: de donde cae todo (puertas abiertas)
  s += face(`M-4 -6H${W + 4}V58H-4Z`, '#E6BC8E', { w: 2.2 });
  s += flat(`M-4 50H${W + 4}V58H-4Z`, '#D3A574');
  s += shade(`M0 58H${W}V66H0Z`, SH, 0.14);
  // adentro de la alacena, en sombra, con frascos
  s += face(rr(70, 4, 160, 42, 3), '#8E6248', { w: 1.8 });
  s += flat(rr(74, 24, 152, 4, 1), '#B98760');
  [[88, '#FFC94D'], [110, '#F27A9A'], [134, '#8FD6A8'], [160, '#FFFFFF'], [186, '#B79AE8'], [208, '#FF9F6B']].forEach(([x, c], k) => {
    const h = 12 + (k % 3) * 2;
    s += part(rr(x - 6, 24 - h, 12, h, 3), mix(c, '#FFFFFF', 0.4), { w: 1.3 }) + flat(rr(x - 7, 22 - h, 14, 3, 1.5), tone(c, -0.5));
    s += part(rr(x - 6, 46 - h + 2, 12, h - 2, 3), mix(c, '#FFFFFF', 0.25), { w: 1.3 });
  });
  // puertas abiertas a cada lado, y las cerradas de las puntas
  const door = (x, w) => face(rr(x, 2, w, 46, 3), '#F0CDA2', { w: 1.8 }) + face(rr(x + 5, 7, w - 10, 36, 2), '#E6BC8E', { w: 1.4 });
  s += door(6, 58) + door(236, 58);
  s += part('M70 4L54 -2V56L70 48Z', '#F0CDA2', { w: 1.6 }) + part('M230 4L246 -2V56L230 48Z', '#F0CDA2', { w: 1.6 });
  s += part(ellD(58, 26, 2.6, 2.6), '#C9CED8', { w: 1.2 }) + part(ellD(242, 26, 2.6, 2.6), '#C9CED8', { w: 1.2 });
  s += part(ellD(56, 30, 2.4, 2.4), '#C9CED8', { w: 1.2 }) + part(ellD(244, 30, 2.4, 2.4), '#C9CED8', { w: 1.2 });
  // zócalo y piso a cuadros en 3/4 (baldosas el doble de anchas que altas)
  s += face(`M-4 ${FLOOR - 8}H${W + 4}V${FLOOR}H-4Z`, '#C99A6B', { w: 1.8 });
  s += flat(`M0 ${FLOOR}H${W}V${H}H0Z`, '#F4EDE4');
  for (let row = 0, y = FLOOR; y < H; row++, y += 14) {
    for (let col = 0, x = 0; x < W; col++, x += 28) if ((row + col) % 2 === 0) s += flat(`M${x} ${y}h28v14h-28Z`, '#BFDDE6');
  }
  s += shade(`M0 ${FLOOR}H${W}V${FLOOR + 6}H0Z`, SH, 0.12);
  // muebles bajos en las puntas: mesada con frutero y con tarro de galletas
  const lowCab = (x, w) => {
    let t = face(`M${x} ${FLOOR + 2}V${FLOOR - 44}H${x + w}V${FLOOR + 2}Z`, '#F0CDA2', { w: 2 });
    t += face(rr(x + 6, FLOOR - 38, w - 12, 34, 2), '#E6BC8E', { w: 1.4 });
    t += part(ellD(x + (x < W / 2 ? w - 14 : 14), FLOOR - 22, 2.4, 2.4), '#C9CED8', { w: 1.2 });
    t += face(`M${x - 3} ${FLOOR - 44}V${FLOOR - 52}H${x + w + 3}V${FLOOR - 44}Z`, '#FFFFFF', { w: 1.8 });
    t += face(`M${x - 3} ${FLOOR - 52}V${FLOOR - 56}H${x + w + 3}V${FLOOR - 52}Z`, '#ECE6EF', { w: 1.6 });
    return t;
  };
  s += lowCab(-8, 58) + lowCab(W - 50, 58);
  const fy0 = FLOOR - 52;
  s += part(`M10 ${fy0 - 10}H40C40 ${fy0 - 2} 34 ${fy0} 25 ${fy0}C16 ${fy0} 10 ${fy0 - 2} 10 ${fy0 - 10}Z`, '#9ED3F0', { w: 1.6 });
  s += part(ellD(18, fy0 - 12, 5.5, 5), '#F05A78', { w: 1.3 }) + part(ellD(30, fy0 - 13, 6, 5.4), '#FFC93D', { w: 1.3 }) + part(ellD(24, fy0 - 17, 5, 4.6), '#8FD06A', { w: 1.3 });
  s += part(`M${W - 36} ${fy0}V${fy0 - 18}C${W - 36} ${fy0 - 22} ${W - 32} ${fy0 - 24} ${W - 26} ${fy0 - 24}H${W - 18}C${W - 12} ${fy0 - 24} ${W - 8} ${fy0 - 22} ${W - 8} ${fy0 - 18}V${fy0}Z`, '#DDEFF6', { w: 1.6 });
  s += part(rr(W - 34, fy0 - 29, 24, 6, 2.5), '#F7A6B9', { w: 1.4 });
  s += part(ellD(W - 27, fy0 - 9, 5, 4.4), '#D9A06E', { w: 1.2 }) + part(ellD(W - 17, fy0 - 7, 4.6, 4), '#C98E5A', { w: 1.2 });
  s += flat(`M${W - 32} ${fy0 - 20}h2.4v10h-2.4Z`, '#FFFFFF', { opacity: 0.8 });
  return piece(W, H, s);
}

// ── Torre de pastel ───────────────────────────────────────────────
// El pastel crece en medio de una plaza y sube por encima de los techos,
// atraviesa las nubes, pasa el atardecer y llega a la noche estrellada.
// El fondo es alto y se corre más lento que la torre (paralaje). Se
// dibuja en trozos cuadrados para que cada uno sea liviano.
export const TOWER_BG = { W: 330, H: 1320, CHUNK: 330 };

function towerScene() {
  const { W, H } = TOWER_BG;
  const Y = (y) => H - y;          // y medido desde el piso, hacia arriba
  const r = rng(3);
  let s = '';
  // cielo por franjas: día abajo, atardecer, noche arriba
  const bands = [[0, '#CDEBFA'], [230, '#BDE3F8'], [380, '#AED9F4'], [470, '#BFCDF0'], [520, '#D6C4EC'], [570, '#EDBCD2'], [620, '#F6C9AE'], [665, '#E0A9C4'], [700, '#A693D4'], [760, '#7D70BE'], [830, '#5D55A4'], [910, '#433E86'], [1000, '#322E6C'], [1100, '#26235A'], [1220, '#1E1C4C']];
  bands.forEach(([y0, c], k) => {
    const y1 = k + 1 < bands.length ? bands[k + 1][0] : H;
    s += flat(`M0 ${Y(y1)}H${W}V${Y(y0)}H0Z`, c);
  });
  // estrellas y luna arriba
  for (let k = 0; k < 64; k++) {
    const y = 700 + r() * 610, x = r() * W;
    const big = k % 7 === 0;
    s += big ? part(starPath(f1(x), f1(Y(y)), 5, 2, 4), '#FFF2B8', { w: 1 }) : flat(`M${f1(x)} ${f1(Y(y))}h3v3h-3Z`, '#FFF6D8', { opacity: 0.6 + (k % 3) * 0.15 });
  }
  s += part(`M272 ${Y(1192)}A30 30 0 1 0 300 ${Y(1150)}A24 24 0 1 1 272 ${Y(1192)}Z`, '#FFEBA8', { w: 2 });
  s += flat(ellD(258, Y(1162), 4, 3), '#F2D98A') + flat(ellD(268, Y(1144), 3, 2.4), '#F2D98A');
  // un planetita con anillo
  s += part(ellD(56, Y(1030), 13, 13), '#F7A6B9', { w: 1.6 }) + part(`M38 ${Y(1028)}C40 ${Y(1022)} 72 ${Y(1022)} 74 ${Y(1028)}C72 ${Y(1032)} 40 ${Y(1032)} 38 ${Y(1028)}Z`, '#FFD15C', { w: 1.4 });
  // nubes del atardecer y del día
  [[20, 600, 70, '#FFE2EE'], [230, 640, 60, '#FFE2EE'], [-10, 430, 80, '#FFFFFF'], [190, 470, 90, '#FFFFFF'], [110, 360, 60, '#FFFFFF'], [250, 300, 50, '#FFFFFF']].forEach(([x, y, w, c]) => { s += cloud(x, Y(y), w, c, { flat: true, dim: 0.25 }); });
  // globo aerostático y pajaritos
  const bx = 250, by = Y(520);
  s += part(`M${bx} ${by + 26}C${bx - 26} ${by + 8} ${bx - 26} ${by - 30} ${bx} ${by - 30}C${bx + 26} ${by - 30} ${bx + 26} ${by + 8} ${bx} ${by + 26}Z`, '#FF9F6B', { w: 1.8 });
  s += flat(`M${bx - 6} ${by - 29}C${bx - 12} ${by - 14} ${bx - 10} ${by + 10} ${bx - 2} ${by + 24}L${bx + 2} ${by + 24}C${bx + 10} ${by + 10} ${bx + 12} ${by - 14} ${bx + 6} ${by - 29}Z`, '#FFE08A');
  s += line(`M${bx - 6} ${by + 22}L${bx - 5} ${by + 32}M${bx + 6} ${by + 22}L${bx + 5} ${by + 32}`, '#8A6248', 1.6);
  s += part(rr(bx - 7, by + 31, 14, 9, 2), '#C99A6B', { w: 1.4 });
  [[70, 380], [92, 392], [60, 400]].forEach(([x, y]) => { s += line(`M${x - 6} ${Y(y) - 2}Q${x - 3} ${Y(y) - 5} ${x} ${Y(y)}Q${x + 3} ${Y(y) - 5} ${x + 6} ${Y(y) - 2}`, '#5E5A7A', 2); });
  // ciudad lejana (sin contorno)
  [[0, 40, 230], [36, 30, 270], [64, 44, 210], [104, 34, 290], [136, 46, 240], [180, 30, 260], [208, 42, 300], [248, 36, 220], [282, 50, 250]].forEach(([x, w, h], k) => {
    const c = k % 2 ? '#B8C6EA' : '#C6D1EF';
    s += flat(`M${x} ${Y(0)}V${Y(h)}H${x + w}V${Y(0)}Z`, c);
    for (let yy = h - 14; yy > 40; yy -= 16) for (let xx = x + 6; xx + 6 < x + w; xx += 11) s += flat(`M${xx} ${Y(yy)}h5v7h-5Z`, '#E4EAF9');
  });
  // edificios de la plaza, con su cara y su tapa
  const bld = (x, w, h, c, roof) => {
    const m = mat(c);
    let b = face(`M${x} ${Y(20)}V${Y(h)}H${x + w}V${Y(20)}Z`, c, { w: 2 });
    b += face(`M${x - 3} ${Y(h)}V${Y(h + 7)}H${x + w + 3}V${Y(h)}Z`, roof || m.top, { w: 1.8 });
    for (let yy = h - 18; yy > 56; yy -= 26) for (let xx = x + 8; xx + 12 < x + w; xx += 20) {
      b += face(rr(xx, Y(yy), 12, 15, 2), '#D2ECF8', { w: 1.4 }) + flat(`M${xx + 2} ${Y(yy) + 2}h3v10h-3Z`, '#FFFFFF', { opacity: 0.7 });
    }
    return b;
  };
  s += bld(-6, 74, 170, '#F7C7B2', '#E89C86') + bld(232, 104, 150, '#C9E3C6', '#97C795');
  // pastelería: toldo a rayas y vidriera
  s += face(`M68 ${Y(20)}V${Y(110)}H232V${Y(20)}Z`, '#FFF0E6', { w: 2 });
  s += face(`M64 ${Y(110)}V${Y(118)}H236V${Y(110)}Z`, '#E89CB2', { w: 1.8 });
  s += face(rr(84, Y(96), 132, 20, 4), '#FFFFFF', { w: 1.8 });
  s += flat(rr(92, Y(91), 116, 10, 2), '#F27A9A');
  // toldo
  let aw = `M70 ${Y(70)}H230V${Y(78)}`;
  for (let k = 0; k < 8; k++) aw += `Q${230 - k * 20 - 10} ${Y(70) + 12} ${230 - (k + 1) * 20} ${Y(78)}`;
  s += part(`${aw}V${Y(70)}Z`, '#FFFFFF', { w: 1.8 });
  for (let k = 0; k < 8; k += 2) s += flat(`M${70 + k * 20} ${Y(70)}H${90 + k * 20}V${Y(78)}Q${80 + k * 20} ${Y(70) + 12} ${70 + k * 20} ${Y(78)}Z`, '#F7A6B9');
  // vidrieras con pastelitos a los costados de la puerta (la torre tapa el medio)
  [[78, 46], [186, 46]].forEach(([x, w]) => {
    s += face(rr(x, Y(64), w, 40, 3), '#D2ECF8', { w: 1.6 });
    s += flat(rr(x + 2, Y(32), w - 4, 3, 1), '#E9DCCB');
    s += part(rr(x + 8, Y(43), 12, 11, 3), '#F7A6B9', { w: 1.2 }) + part(rr(x + 26, Y(41), 12, 9, 3), '#FFE08A', { w: 1.2 });
  });
  // plaza: baldosas y faroles
  s += flat(`M0 ${Y(20)}H${W}V${H}H0Z`, '#E7DFD3');
  let d = '';
  for (let yy = 4; yy < 20; yy += 8) d += `M0 ${Y(yy)}H${W}`;
  for (let xx = 0, k = 0; xx < W; xx += 22, k++) d += `M${xx + (k % 2) * 11} ${Y(20)}V${H}`;
  s += line(d, '#C9BDB0', 2, { opacity: 0.6 });
  [30, 300].forEach((x) => {
    s += face(rr(x - 2, Y(130), 4, 112, 2), '#5E5A7A', { w: 1.4 });
    s += part(`M${x - 8} ${Y(132)}H${x + 8}L${x + 5} ${Y(146)}H${x - 5}Z`, '#FFE9A8', { w: 1.4 });
    s += face(rr(x - 9, Y(134), 18, 4, 1.5), '#5E5A7A', { w: 1.2 });
    s += Ell(x, Y(18), 8, 2, { fill: SH, opacity: 0.2, 'data-r': 'tone' });
  });
  return s;
}
// `chunk` 0 es el de abajo (la plaza); el último, el cielo de noche.
export function towerBgSvg(chunk) {
  const { W, H, CHUNK } = TOWER_BG;
  return piece(W, CHUNK, G({ transform: `translate(0 ${-(H - (chunk + 1) * CHUNK)})` }, towerScene()));
}
export const TOWER_CHUNKS = Math.ceil(TOWER_BG.H / TOWER_BG.CHUNK);

// Piso del pastel: bizcocho con relleno de crema y glaseado con
// chorreados, `w`×22 px. Los chorreados caen siempre en el mismo lugar
// medido desde la izquierda, así dos pisos iguales se ven iguales.
export const CAKE_FLAVORS = [
  { cake: '#F6D9A6', icing: '#FFFFFF', cream: '#FFF1D6', top: '#F27A9A' },  // vainilla
  { cake: '#F4A7B9', icing: '#FFF4F7', cream: '#FFFFFF', top: '#F05A78' },  // fresa
  { cake: '#8A5A44', icing: '#FFD3E2', cream: '#F7E3D2', top: '#FFFFFF' },  // chocolate
  { cake: '#B9D89A', icing: '#FFF8E8', cream: '#EAF5DA', top: '#F05A78' },  // matcha
  { cake: '#B8B2EC', icing: '#FFFFFF', cream: '#E9E6FB', top: '#7FA9DE' },  // arándano
];
export function cakeLayerSvg(w, flavor = 0) {
  const F = CAKE_FLAVORS[flavor % CAKE_FLAVORS.length];
  const W = Math.max(8, Math.round(w));
  const m = mat(F.cake);
  let s = '';
  s += face(rr(1, 5, W - 2, 16, Math.min(4, W / 3)), F.cake, { w: 2 });
  s += flat(`M2 18H${W - 2}V19.5C${W - 2} 20 ${W - 3} 20 ${W - 4} 20H4C3 20 2 20 2 19.5Z`, m.side, { opacity: 0.8 });
  if (W > 14) s += flat(`M2 12H${W - 2}V14.6H2Z`, F.cream);
  // glaseado de arriba con chorreados
  let d = `M1 8V4C1 2.4 2.4 1 4 1H${W - 4}C${W - 2.4} 1 ${W - 1} 2.4 ${W - 1} 4V8`;
  for (let x = W - 1; x > 1;) {
    const step = Math.min(x - 1, 9 + ((x * 7) % 5));
    const nx = x - step;
    const deep = ((nx * 13) % 3) === 0 && step > 6;
    d += deep ? `C${f1(x - 1)} 8 ${f1(x - 2)} 12.5 ${f1(x - step / 2)} 12.5C${f1(nx + 2)} 12.5 ${f1(nx + 1)} 8 ${f1(nx)} 8` : `Q${f1(x - step / 2)} 10.5 ${f1(nx)} 8`;
    x = nx;
  }
  s += part(`${d}Z`, F.icing, { w: 1.8 });
  if (W > 10) s += flat(`M4 2.6H${Math.min(W - 6, 24)}V4.4H4Z`, '#FFFFFF', { opacity: 0.85 });
  // chispitas en el glaseado
  for (let x = 9; x < W - 6; x += 17) s += flat(`M${x} 4h3v2h-3Z`, x % 2 ? F.top : '#FFC93D');
  return piece(W, 22, s);
}

// Bandeja con pie donde se arma el pastel.
export function cakeStandSvg() {
  let s = Ell(80, 30, 64, 5, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
  s += face('M62 30C62 24 70 20 72 14H88C90 20 98 24 98 30Z', '#E9EEF5', { w: 2 });
  s += face(ellD(80, 30, 20, 4.5), '#D9DFEA', { w: 1.6 });
  s += face(rr(2, 8, 156, 8, 4), '#F4F7FB', { w: 2 });
  s += flat('M8 9.4H120V11.4H8Z', '#FFFFFF');
  s += flat('M8 14H152V15H8Z', '#C9D1DE');
  return piece(160, 36, s);
}

// ── Simón dice ────────────────────────────────────────────────────
// Una cajita de música de madera, vista en 3/4: la tapa clara donde van
// los cuatro botones, el frente con su parlante de agujeritos, esquineros
// de bronce y patitas. Los botones son gomitas de colores: la tapa con
// brillo de azúcar y el canto más oscuro; al apretarse se hunden (el
// canto se achica). Cada uno con su figura (corazón, estrella, flor, luna)
// para distinguirlos sin depender del color.
export const PAD_SHAPES = {
  corazon: 'M32 50 C14 38 8 30 8 22 C8 15 13 10 19.5 10 C24.5 10 29 13 32 17.5 C35 13 39.5 10 44.5 10 C51 10 56 15 56 22 C56 30 50 38 32 50 Z',
  estrella: 'M32 8 L39.2 24.2 L56.5 26 L43.5 37.8 L47.4 55 L32 46 L16.6 55 L20.5 37.8 L7.5 26 L24.8 24.2 Z',
  flor: flowerPath(32, 33, 25.5, 11),
  luna: 'M45 9 A24 24 0 1 0 45 55 A27 27 0 0 1 45 9 Z',
};

export function simonPadSvg(shape, color, lit = false, dim = false) {
  const base = dim ? mix(color, '#9C93A6', 0.45) : lit ? mix(color, '#FFFFFF', 0.35) : color;
  const m = mat(base);
  const p = lit ? 5 : 0;                 // cuánto se hunde
  let s = '';
  // el hueco en la tapa de la caja
  s += face(rr(3, 12, 58, 50, 17), '#7A5446', { w: 2 });
  s += flat(rr(6, 15, 52, 12, 10), '#5E3E34');
  // la gomita: canto y tapa
  s += part(rr(6, 9 + p, 52, 49 - p, 16), m.side, { w: 2.2 });
  s += part(rr(6, 7 + p, 52, 40, 16), base, { w: 2.2 });
  s += flat(rr(10, 11 + p, 44, 30, 13), mix(base, '#FFFFFF', 0.18));
  // brillo y granitos de azúcar
  s += shine(`M13 ${22 + p}C13 ${15 + p} 17 ${11 + p} 25 ${11 + p}C20 ${13 + p} 17 ${16 + p} 16.5 ${23 + p}Z`, { opacity: lit ? 0.9 : 0.75 });
  [[48, 14], [44, 40], [15, 37]].forEach(([x, y]) => { s += flat(`M${x} ${y + p}h2.4v2.4h-2.4Z`, '#FFFFFF', { opacity: 0.8 }); });
  // la figura (en pixel, su versión hecha a mano)
  const fig = PAD_SHAPES[shape];
  s += G({ transform: `translate(32 ${27 + p}) scale(0.5) translate(-32 -32)`, opacity: dim ? 0.6 : 1, 'data-skip': 'pixel' },
    part(fig, lit ? '#FFFFFF' : '#FFFDF8', { w: 3.4 }) + (shape === 'flor' ? Cir(32, 33, 8.5, { fill: base, stroke: INK, 'stroke-width': 3, 'data-r': 'part' }) : ''));
  s += `<g data-only="pixel" data-px="pad.${shape}"><rect x="19" y="${14 + p}" width="26" height="26" fill="#FFFFFF" opacity="0"/></g>`;
  return piece(64, 64, s);
}

// La caja (w×h en px de pantalla); los botones van encima, dentro de la
// tapa (de `pad` a `w - pad` y de `pad` a `h - front - pad`).
export const SIMON_BOX = { pad: 16, front: 44 };
export function simonConsoleSvg(w, h) {
  const { front } = SIMON_BOX;
  const wood = '#D9A06E', top = '#EBC290';
  const ft = h - front;
  let s = Ell(w / 2, h - 3, w * 0.48, 5, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
  // patitas
  [16, w - 16].forEach((x) => { s += part(rr(x - 8, h - 12, 16, 9, 3), '#B9784A', { w: 1.8 }); });
  // frente con vetas
  s += face(rr(4, ft - 10, w - 8, front + 2, 10), wood, { w: 2.4 });
  s += line(`M14 ${ft + 8}C${w * 0.3} ${ft + 4} ${w * 0.5} ${ft + 12} ${w * 0.7} ${ft + 7}S${w - 30} ${ft + 9} ${w - 14} ${ft + 6}M18 ${ft + 24}C${w * 0.25} ${ft + 20} ${w * 0.45} ${ft + 28} ${w * 0.62} ${ft + 23}`, tone(wood, -0.7), 1.6, { opacity: 0.55 });
  // parlante de agujeritos y una notita musical
  const cx = w / 2, cy = ft + 14;
  s += face(rr(cx - 34, cy - 10, 68, 20, 9), '#B9784A', { w: 1.8 });
  for (let k = -3; k <= 3; k++) for (let j = 0; j < 2; j++) s += Cir(cx + k * 8 + (j ? 4 : 0), cy - 4 + j * 8, 1.8, { fill: '#6E4430', 'data-r': 'flat' });
  s += line(`M${w - 42} ${cy + 6}V${cy - 8}L${w - 30} ${cy - 11}V${cy + 3}`, '#FFE08A', 2.4);
  s += part(ellD(w - 45, cy + 6, 4, 3.2), '#FFE08A', { w: 1.4 }) + part(ellD(w - 33, cy + 3, 4, 3.2), '#FFE08A', { w: 1.4 });
  s += part(`M${36} ${cy}A7 7 0 1 1 ${36.1} ${cy}Z`, '#E8C46A', { w: 1.6 });
  s += line(`M33 ${cy}H39M36 ${cy - 3}V${cy + 3}`, '#A9822E', 1.6);
  // tapa
  s += face(rr(4, 4, w - 8, ft - 6, 18), top, { w: 2.4 });
  s += flat(rr(10, 9, w - 20, 5, 2.5), '#F7DDB4');
  s += line(`M22 ${ft * 0.5}C${w * 0.3} ${ft * 0.48} ${w * 0.6} ${ft * 0.54} ${w - 22} ${ft * 0.5}`, tone(top, -0.5), 1.4, { opacity: 0.35 });
  // esquineros de bronce
  [[10, 10], [w - 10, 10], [10, h - 14], [w - 10, h - 14]].forEach(([x, y]) => { s += part(ellD(x, y, 4.5, 4), '#E8C46A', { w: 1.4 }) + flat(ellD(x - 1, y - 1, 1.6, 1.2), '#FFF2C2'); });
  return piece(w, h, s);
}

// ── Encuentra las parejas ─────────────────────────────────────────
// Cartas de verdad sobre una mesa de juego: paño verde con costura y
// borde de madera. El reverso tiene marco, un enrejado de rombos y un
// medallón festoneado con un corazón; el frente es cartulina con un
// filete fino, para que la foto o el dibujo sea el protagonista.
export function cardBackSvg() {
  let s = flat(rr(5, 7, 92, 92, 12), SH, { opacity: 0.2 });
  s += face(rr(3, 3, 92, 92, 12), '#FFF6EC', { w: 2.4 });
  s += face(rr(10, 10, 78, 78, 7), '#EE9DBB', { w: 1.6 });
  // enrejado de rombos (en pixel, diagonales limpias 1:1)
  let d = '';
  for (let k = -78; k <= 78; k += 13) d += `M${10 + Math.max(0, k)} ${10 + Math.max(0, -k)}L${88 - Math.max(0, -k)} ${88 - Math.max(0, k)}M${10 + Math.max(0, k)} ${88 - Math.max(0, -k)}L${88 - Math.max(0, -k)} ${10 + Math.max(0, k)}`;
  s += `<defs><clipPath id="rombos"><path d="${rr(11, 11, 76, 76, 6)}"/></clipPath></defs>` + G({ 'clip-path': 'url(#rombos)' }, line(d, '#F7C4D6', 2.2, { opacity: 0.9 }));
  s += line(rr(14, 14, 70, 70, 5), '#FFF0F5', 1.8, { opacity: 0.85 });
  // medallón con corazón
  s += part(flowerPath(49, 49, 19, 15, 10), '#FFF6EC', { w: 2 });
  s += part(HEART(49, 50, 0.62), '#F05A78', { w: 1.8 });
  s += flat(ellD(43, 43.5, 3, 2.2), '#FFFFFF', { opacity: 0.85 });
  // corazoncitos en las esquinas del marco
  [[16, 17], [82, 17], [16, 81], [82, 81]].forEach(([x, y]) => { s += flat(HEART(x, y, 0.18), '#FFFFFF'); });
  return piece(100, 100, s);
}
export function cardFaceSvg(matched = false) {
  let s = flat(rr(5, 7, 92, 92, 12), SH, { opacity: 0.16 });
  s += face(rr(3, 3, 92, 92, 12), '#FFFBF4', { w: 2.4 });
  s += line(rr(9, 9, 80, 80, 7), matched ? '#8FD6A8' : '#F2D6C8', 2, { opacity: 0.9 });
  if (matched) [[15, 15], [83, 15], [15, 83], [83, 83]].forEach(([x, y]) => { s += part(starPath(x, y, 5, 2.2, 4), '#FFD15C', { w: 1 }); });
  return piece(100, 100, s);
}
// La mesa: borde de madera y paño con su costura (w×h en px).
export function cardTableSvg(w, h) {
  let s = Ell(w / 2, h - 4, w * 0.47, 6, { fill: SH, opacity: 0.2, 'data-r': 'tone' });
  s += face(rr(2, 2, w - 4, h - 8, 18), '#C98E5A', { w: 2.4 });
  s += flat(rr(6, 5, w - 12, 5, 2.5), '#E2AE7A');
  s += line(`M16 ${h - 13}C${w * 0.3} ${h - 16} ${w * 0.6} ${h - 10} ${w - 16} ${h - 13}`, '#A06B42', 1.6, { opacity: 0.6 });
  s += face(rr(12, 12, w - 24, h - 28, 11), '#6FAE8E', { w: 2 });
  s += flat(rr(15, 14, w - 30, 6, 3), '#82BE9F');
  s += line(rr(18, 18, w - 36, h - 40, 7), '#A6D8BC', 1.8, { opacity: 0.7, 'stroke-dasharray': '6 5' });
  return piece(w, h, s);
}

// ── Caja de bombones (Conecta 3) ──────────────────────────────────
// Las golosinas van en una caja de bombones vista desde arriba en 3/4:
// el borde de cartón con su canto adelante, una cinta en la esquina y un
// pirotín de papel plisado por casilla (las casillas que el nivel no usa
// quedan como el fondo de la caja). `mask`: qué casillas existen.
export const CANDY_BOX = { B: 14, FRONT: 8 };
const CUPS = ['#FFFFFF', '#FFE6EE', '#FFF3D6', '#E8F4FF'];
export function candyBoxSvg(cols, rows, cell, mask = null) {
  const { B, FRONT } = CANDY_BOX;
  const W = cols * cell + B * 2, H = rows * cell + B * 2;
  let s = Ell(W / 2, H + FRONT - 2, W * 0.48, 5, { fill: SH, opacity: 0.2, 'data-r': 'tone' });
  // canto de adelante y tapa del borde
  s += face(rr(0, 6, W, H + FRONT - 6, 14), '#E07A98', { w: 2.4 });
  s += face(rr(0, 0, W, H, 14), '#F7A6B9', { w: 2.4 });
  s += flat(rr(6, 3, W - 12, 4, 2), '#FFC9D6');
  // fondo de la caja
  s += face(rr(B - 4, B - 4, cols * cell + 8, rows * cell + 8, 9), '#B9617C', { w: 1.8 });
  s += flat(rr(B - 1, B - 1, cols * cell + 2, 6, 3), '#9E4F68', { opacity: 0.7 });
  // pirotines plisados
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (mask && !mask[r * cols + c]) continue;
    const x = B + c * cell, y = B + r * cell;
    const pad = Math.max(2, cell * 0.06);
    const cw = cell - pad * 2;
    const col = CUPS[(r * 3 + c) % CUPS.length];
    // en neón el pirotín no se enciende (competía con las golosinas)
    s += part(rr(x + pad, y + pad, cw, cw, cw * 0.3), col, { w: 1.4, a: { 'data-skip': 'neon' } });
    s += flat(rr(x + pad, y + pad, cw, cw, cw * 0.3), col, { 'data-only': 'neon' });
    // pliegues: rayitas que van del borde hacia adentro
    let d = '';
    const n = 4;
    for (let k = 1; k < n; k++) {
      const t = pad + (cw * k) / n;
      d += `M${f1(x + t)} ${f1(y + pad + 1.5)}V${f1(y + pad + cw * 0.16)}M${f1(x + t)} ${f1(y + pad + cw - 1.5)}V${f1(y + pad + cw * 0.84)}`;
      d += `M${f1(x + pad + 1.5)} ${f1(y + t)}H${f1(x + pad + cw * 0.16)}M${f1(x + pad + cw - 1.5)} ${f1(y + t)}H${f1(x + pad + cw * 0.84)}`;
    }
    s += line(d, tone(col, -0.9), 1.6, { opacity: 0.6 });
    s += flat(rr(x + pad + cw * 0.2, y + pad + cw * 0.2, cw * 0.6, cw * 0.6, cw * 0.2), tone(col, -0.25));
  }
  // cinta con moño en la esquina de arriba a la derecha
  s += part(`M${W - 30} 0H${W - 20}L${W} 20V30Z`, '#FFD15C', { w: 1.8 });
  s += part(`M${W - 13} 9C${W - 26} -2 ${W - 30} 12 ${W - 15} 13ZM${W - 9} 13C${W + 2} 1 ${W + 8} 16 ${W - 7} 17Z`, '#FFE08A', { w: 1.6 });
  s += part(ellD(W - 11, 13, 4, 3.6), '#F2B730', { w: 1.4 });
  return piece(W, H + FRONT, s);
}

// ── Rompecabezas deslizante ───────────────────────────────────────
// Una bandeja de madera de las de verdad: marco con canto y vetas, y el
// fondo hundido (más oscuro) que se ve en el hueco de la pieza que falta.
// `px` es el lado de la foto; el marco suma F por lado y el canto abajo.
export const PUZZLE_FRAME = { F: 14, FRONT: 8 };
export function puzzleFrameSvg(px) {
  const { F, FRONT } = PUZZLE_FRAME;
  const S = px + F * 2;
  const wood = '#D49A62';
  let s = Ell(S / 2, S + FRONT - 2, S * 0.48, 5, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
  s += face(rr(0, 6, S, S + FRONT - 6, 12), tone(wood, -0.5), { w: 2.4 });
  s += face(rr(0, 0, S, S, 12), wood, { w: 2.4 });
  s += flat(rr(6, 3, S - 12, 4, 2), '#EDBF8C');
  // vetas en el marco
  s += line(`M10 ${F * 0.55}C${S * 0.3} ${F * 0.3} ${S * 0.55} ${F * 0.8} ${S - 10} ${F * 0.5}M10 ${S - F * 0.45}C${S * 0.35} ${S - F * 0.7} ${S * 0.6} ${S - F * 0.25} ${S - 10} ${S - F * 0.5}`, tone(wood, -0.8), 1.6, { opacity: 0.5 });
  s += line(`M${F * 0.5} 16C${F * 0.3} ${S * 0.4} ${F * 0.75} ${S * 0.6} ${F * 0.45} ${S - 16}M${S - F * 0.5} 16C${S - F * 0.75} ${S * 0.35} ${S - F * 0.3} ${S * 0.65} ${S - F * 0.5} ${S - 16}`, tone(wood, -0.8), 1.6, { opacity: 0.5 });
  // fondo hundido de la bandeja
  s += face(rr(F - 3, F - 3, px + 6, px + 6, 5), '#8A5A3C', { w: 1.8 });
  s += flat(rr(F, F, px, 7, 2), '#6E4630', { opacity: 0.8 });
  let d = '';
  for (let y = F + 16; y < F + px - 6; y += 18) d += `M${F + 6} ${y}C${F + px * 0.3} ${y - 4} ${F + px * 0.6} ${y + 4} ${F + px - 6} ${y}`;
  s += line(d, '#7A4C33', 1.6, { opacity: 0.6 });
  // clavitos en las esquinas
  [[F / 2, F / 2], [S - F / 2, F / 2], [F / 2, S - F / 2], [S - F / 2, S - F / 2]].forEach(([x, y]) => { s += part(ellD(x, y, 2.8, 2.6), '#E8C46A', { w: 1.2 }); });
  return piece(S, S + FRONT, s);
}

// ── Trivia del corazón ────────────────────────────────────────────
// Una guirnalda de banderines con corazones cruza arriba, y la pregunta
// va escrita en una carta de papel con cinta adhesiva y un sello de cera.
export function buntingSvg(w) {
  const h = 34;
  let s = line(`M-4 6Q${w / 2} 22 ${w + 4} 6`, '#B98760', 2);
  const cols = ['#F7A6B9', '#FFE08A', '#A9DFC4', '#C9B8F0'];
  const n = Math.max(5, Math.round(w / 30));
  for (let k = 0; k < n; k++) {
    const x = ((k + 0.5) / n) * w;
    const t = x / w;
    const y = 6 + 32 * t * (1 - t);    // sobre la curva de la cuerda
    const c = cols[k % cols.length];
    s += part(`M${f1(x - 10)} ${f1(y - 1)}H${f1(x + 10)}L${f1(x)} ${f1(y + 22)}Z`, c, { w: 1.6 });
    s += flat(HEART(f1(x), f1(y + 7), 0.17), '#FFFFFF', { opacity: 0.9 });
  }
  return piece(w, h, s);
}
// El papel toma el color de "superficie" del estilo (oscuro en lo-fi y
// neón), así la letra de la pregunta (color de tinta del estilo) siempre
// se lee.
export function letterCardSvg(w, h) {
  let s = flat(rr(4, 6, w - 6, h - 6, 10), SH, { opacity: 0.16 });
  s += face(rr(2, 2, w - 6, h - 6, 10), 'var(--pg-c-surface)', { w: 2.2 });
  // renglones tenues
  let d = '';
  for (let y = 22; y < h - 12; y += 14) d += `M16 ${y}H${w - 20}`;
  s += line(d, 'var(--pg-c-line)', 1.6, { opacity: 0.45 });
  // margen rosado y cintas adhesivas en dos esquinas
  s += line(`M14 8V${h - 10}`, '#F7A6B9', 1.8, { opacity: 0.7 });
  s += flat(`M-2 12L18 2L24 14L4 24Z`, '#A9DFC4', { opacity: 0.85 });
  s += flat(`M${w - 26} 2L${w - 4} 10L${w - 8} 22L${w - 30} 14Z`, '#FFE08A', { opacity: 0.85 });
  // sello de cera con corazón
  s += part(flowerPath(w - 24, h - 20, 11, 9, 8), '#E8505E', { w: 1.8 });
  s += flat(HEART(w - 24, h - 19.5, 0.3), '#F58A94');
  return piece(w, h, s);
}

// ── Viñetas del menú de minijuegos ────────────────────────────────
// Cada tarjeta del menú muestra una escenita de su juego (150×56), con
// las mismas piezas que el juego: así se reconoce de un vistazo.
const inner = (m) => m.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const put = (m, x, y, k) => G({ transform: `translate(${x} ${y}) scale(${k})` }, inner(m));
export const THUMB = { W: 150, H: 56 };
export function gameThumbSvg(id) {
  const { W, H } = THUMB;
  let s = '';
  const sky = (c1 = '#BFE6F8', c2 = '#D9F1FB') => flat(`M0 0H${W}V${H}H0Z`, c1) + flat(`M0 ${H * 0.45}H${W}V${H}H0Z`, c2);
  switch (id) {
    case 'topos':
      s += sky() + flat(`M0 22H${W}V${H}H0Z`, '#86C86A') + flat(`M0 40H${W}V${H}H0Z`, '#93D076');
      for (let x = -2; x < W; x += 12) s += part(`M${x} 24V12L${x + 4} 8L${x + 8} 12V24Z`, '#FFF8EE', { w: 1.2 });
      s += face(rr(-2, 13, W + 4, 3, 1), '#E9DCCB', { w: 1 });
      [[20, 30, '#F27A9A'], [130, 28, '#FFC94D']].forEach(([x, y, c]) => { s += tulip(x, y, 14, c); });
      s += put(holeBackSvg(), 47, -2, 0.56) + G({ 'clip-path': 'url(#thBoca)' }, put(moleSvg(), 47 + 15 * 0.56, -2 + 22 * 0.56, 0.56 * 0.7)) + put(holeFrontSvg(), 47, -2, 0.56);
      s += `<defs><clipPath id="thBoca"><path transform="translate(47 -2) scale(0.56)" d="${MOUTH_CLIP}"/></clipPath></defs>`;
      [[18, 48], [126, 46], [104, 52]].forEach(([x, y]) => { s += daisy(x, y, 4, '#FFFFFF', '#FFC93D'); });
      break;
    case 'cruzar':
      s += flat(`M0 0H${W}V10H0Z`, '#8CCB6C') + flat(`M0 8H${W}V16H0Z`, PAVER) + flat(`M0 16H${W}V48H0Z`, ASPHALT) + flat(`M0 48H${W}V${H}H0Z`, PAVER);
      s += face(`M-2 15H${W + 2}V18H-2Z`, '#B9AEA4', { w: 1 });
      for (let x = 4; x < W; x += 22) if (x < 58 || x > 92) s += flat(`M${x} 31h12v2h-12Z`, '#EDE8E0');
      for (let y = 19; y < 47; y += 7) s += flat(`M64 ${y}h22v4h-22Z`, '#F4F0E8');
      s += put(carSvg('#E2A845', 0), 4, 15, 0.5) + put(carSvg('#8FC7EE', 2), 96, 30, 0.5);
      s += put(carSvg('#D8697F', 1), 104, 15, 0.42);
      break;
    case 'volar':
      s += sky('#A9DCF6', '#CFEDF9');
      s += cloud(10, 18, 26, '#FFFFFF', { flat: true, dim: 0.25 }) + cloud(104, 12, 22, '#FFFFFF', { flat: true, dim: 0.25 });
      [[0, 22, 26, '#B7C2EA'], [22, 16, 32, '#A6B2E2'], [96, 20, 28, '#B7C2EA'], [120, 26, 22, '#C4CBEE']].forEach(([x, w, h, c]) => { s += flat(`M${x} ${H}V${H - h - 8}H${x + w}V${H}Z`, c); });
      s += flat(`M0 ${H}V44Q20 36 40 44T80 42T120 44T150 42V${H}Z`, '#8FCB70');
      s += put(pillarSvg(56, 'top', 0), 64, -8, 0.5) + put(pillarSvg(40, 'bottom', 1), 64, 28, 0.5);
      s += flat(`M0 50H${W}V${H}H0Z`, '#A9764E') + flat(`M0 49H${W}V52H0Z`, '#8CCB6C');
      s += part(starPath(38, 26, 6, 2.6), '#FFD15C', { w: 1.2 });
      break;
    case 'serpiente': {
      const L = '#FAC8D3', D = '#F29BB0';
      s += flat(`M0 0H${W}V${H}H0Z`, '#FFF6F2');
      for (let i = 0; i < 12; i += 2) s += flat(`M${i * 14} 0h14V${H}h-14Z`, L);
      for (let j = 0; j < 4; j += 2) s += flat(`M0 ${j * 14}H${W}v14H0Z`, L);
      for (let i = 0; i < 12; i += 2) for (let j = 0; j < 4; j += 2) s += flat(`M${i * 14} ${j * 14}h14v14h-14Z`, D);
      [[30, 22], [44, 22], [58, 22], [58, 36]].forEach(([x, y], k) => { s += put(snakeBallSvg(k % 2 ? '#74C895' : '#8FD6A8', k === 0), x - 8, y - 9, 0.42); });
      s += put(picnicPlateSvg(), 100, 14, 0.62) + part(ellD(112.4, 26, 5, 4.6), '#E8505E', { w: 1.2 }) + part('M112 21L114 17', '#5E9A42', { w: 1 });
      break;
    }
    case 'atrapar':
      s += flat(`M0 0H${W}V${H}H0Z`, '#FCEFE3');
      for (let x = 4; x < W; x += 16) s += flat(`M${x} 14h6V${H}h-6Z`, '#F8E6D7');
      s += face(`M-2 -4H${W + 2}V14H-2Z`, '#E6BC8E', { w: 1.4 }) + face(rr(46, 1, 58, 11, 2), '#8E6248', { w: 1.2 });
      [[54, '#FFC94D'], [66, '#F27A9A'], [78, '#8FD6A8'], [90, '#B79AE8']].forEach(([x, c]) => { s += part(rr(x - 3, 4, 6, 7, 1.5), c, { w: 1 }); });
      s += face(rr(8, 20, 30, 22, 2), '#FFFFFF', { w: 1.4 }) + flat(rr(11, 23, 24, 16, 1), '#BFE6F8') + flat('M11 33Q20 29 35 33V39H11Z', '#9ED37E');
      s += part('M6 18H18C16 28 12 34 14 44H6Z', '#F7A6B9', { w: 1.2 }) + part('M40 18H28C30 28 34 34 32 44H40Z', '#F7A6B9', { w: 1.2 });
      s += part(ellD(126, 26, 7, 7), '#FFB3C8', { w: 1.2 }) + face(ellD(126, 26, 4.6, 4.6), '#FFFBF4', { w: 1 });
      s += flat(`M0 46H${W}V${H}H0Z`, '#F4EDE4');
      for (let x = 0, k = 0; x < W; x += 14, k++) s += flat(`M${x} ${46 + (k % 2) * 5}h14v5h-14Z`, '#BFDDE6');
      s += part(ellD(60, 24, 6, 5.6), '#E8505E', { w: 1.2 }) + line('M60 19L61 15', '#5E9A42', 1.4);
      s += part(starPath(106, 30, 6, 2.6), '#FFD15C', { w: 1.2 });
      s += part(rr(70, 34, 12, 8, 3), '#F7A6B9', { w: 1.2 }) + flat(rr(70, 34, 12, 3, 1.5), '#FFFFFF');
      break;
    case 'torre':
      s += sky('#BDE3F8', '#CDEBFA');
      [[0, 24, 30], [20, 18, 40], [102, 22, 36], [124, 26, 28]].forEach(([x, w, h], k) => { s += flat(`M${x} ${H}V${H - h}H${x + w}V${H}Z`, k % 2 ? '#B8C6EA' : '#C6D1EF'); });
      s += put(cakeStandSvg(), 43, 45, 0.4);
      [[100, 0, 0], [92, 1, 3], [96, 2, -2], [84, 3, 6], [78, 4, 4]].forEach(([w, f, dx], k) => { s += put(cakeLayerSvg(w, f), 75 - w * 0.17 + dx, 46 - (k + 1) * 7.5, 0.34); });
      s += cloud(108, 14, 24, '#FFFFFF', { flat: true, dim: 0.25 });
      break;
    case 'simon':
      s += flat(`M0 0H${W}V${H}H0Z`, '#EBC290') + line(`M8 30C40 27 80 34 142 29`, '#C99A6B', 1.4, { opacity: 0.5 });
      [['corazon', '#E4647E'], ['estrella', '#E9A83C'], ['flor', '#6FB894'], ['luna', '#7FA9DE']].forEach(([sh0, col], k) => { s += put(simonPadSvg(sh0, col, k === 1), 10 + k * 34, 10, 0.5); });
      break;
    case 'trivia':
      s += flat(`M0 0H${W}V${H}H0Z`, '#FFF1F4');
      s += put(buntingSvg(150), 0, 0, 1);
      s += face(rr(30, 22, 90, 30, 6), '#FFFBF4', { w: 1.6 });
      s += line('M38 32H110M38 40H96', '#F2D6C8', 2);
      s += part(flowerPath(110, 46, 6, 5, 8), '#E8505E', { w: 1.2 }) + flat(HEART(110, 46.4, 0.17), '#F58A94');
      break;
    case 'memoria':
      s += flat(`M0 0H${W}V${H}H0Z`, '#6FAE8E') + line(rr(4, 4, W - 8, H - 8, 4), '#A6D8BC', 1.4, { opacity: 0.7, 'stroke-dasharray': '4 4' });
      s += put(cardBackSvg(), 16, 9, 0.38) + put(cardFaceSvg(true), 58, 9, 0.38) + put(cardBackSvg(), 100, 9, 0.38);
      s += part(HEART(77, 28, 0.42), '#F05A78', { w: 1.2 });
      break;
    case 'golosinas':
      s += flat(`M0 0H${W}V${H}H0Z`, '#B9617C');
      for (let k = 0; k < 6; k++) {
        const x = 6 + k * 24;
        s += part(rr(x, 6, 22, 22, 7), CUPS[k % 4], { w: 1 }) + part(rr(x, 30, 22, 22, 7), CUPS[(k + 1) % 4], { w: 1 });
        s += put(candySvg(k % 6), x + 1, 7, 0.31) + put(candySvg((k + 3) % 6), x + 1, 31, 0.31);
      }
      break;
    case 'rompecabezas': {
      s += flat(`M0 0H${W}V${H}H0Z`, '#D49A62');
      const cols = ['#F7A6B9', '#FFE08A', '#9ED3F0', '#A9DFC4', '#C9B8F0', '#FFC2A0'];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
        if (r === 1 && c === 4) { s += flat(rr(8 + c * 23, 6 + r * 23, 21, 21, 2), '#8A5A3C'); continue; }
        s += part(rr(8 + c * 23, 6 + r * 23, 21, 21, 2), cols[(r * 6 + c) % 6], { w: 1.2 }) + flat(rr(10 + c * 23, 8 + r * 23, 8, 3, 1), '#FFFFFF', { opacity: 0.6 });
      }
      break;
    }
    case 'cocina':
      s += flat(`M0 0H${W}V30H0Z`, '#DCEFE8');
      for (let y = 2, r = 0; y < 30; y += 9, r++) for (let x = r % 2 ? -9 : 0; x < W; x += 18) s += flat(rr(x + 1, y, 16, 7, 1.5), '#E8F5F0');
      s += flat(`M0 30H${W}V44H0Z`, '#F6EFE6') + face(`M-2 44H${W + 2}V48H-2Z`, '#E3B98C', { w: 1 }) + flat(`M0 48H${W}V${H}H0Z`, '#A8D5C6');
      // olla roja humeando y una zanahoria
      s += line('M66 12Q62 8 66 4M76 12Q72 8 76 4M86 12Q82 8 86 4', '#FFFFFF', 2, { opacity: 0.9 });
      s += part('M54 20V36C54 41 64 44 76 44C88 44 98 41 98 36V20Z', '#E8505E', { w: 1.6 }) + flat('M54 28H98V32H54Z', '#FFF1E2');
      s += face(ellD(76, 20, 22, 5.5), '#FFFFFF', { w: 1.6 }) + flat(ellD(76, 21, 18, 3.6), '#F2B05E');
      s += G({ transform: 'translate(104 26) scale(0.42)' }, INGREDIENT_CARROT());
      s += G({ transform: 'translate(14 22) scale(0.4)' }, INGREDIENT_TOMATO());
      break;
    default: s += flat(`M0 0H${W}V${H}H0Z`, '#F3EDE6');
  }
  return piece(W, H, s);
}
// zanahoria y tomate mini para la viñeta de la cocina (sin importar
// art/kitchen.js, que ya importa de este archivo)
function INGREDIENT_CARROT() {
  return part('M14 30C8 22 6 14 10 10C12 16 14 22 18 28Z', '#5FAE52', { w: 1.6 }) + part('M18 30C22 20 28 16 34 16C28 20 25 25 23 31Z', '#5FAE52', { w: 1.6 })
    + part('M14 34C14 28 20 26 26 27C36 28 50 32 58 36C60 37 60 39 58 40C50 44 36 48 26 49C20 50 14 46 14 40Z', '#F59A3C', { w: 2.4 });
}
function INGREDIENT_TOMATO() {
  return part('M10 36C10 25 19 18 32 18C45 18 54 25 54 36C54 48 45 56 32 56C19 56 10 48 10 36Z', '#E8505E', { w: 2.4 }) + part('M32 22L25 18L28 24L20 25L28 28L30 33L33 28L42 27L36 23L39 17Z', '#5FAE52', { w: 1.6 });
}

// La escena de la trivia: un rincón de escritorio. Pared empapelada con
// la guirnalda, una ventana con cortinas y un corcho con notitas; abajo
// el escritorio de madera con una taza humeante, un lapicero y, en el
// medio, la carta donde va escrita la pregunta (TRIVIA_LETTER: dónde
// cae el texto). El papel toma el color de "superficie" del estilo.
export const TRIVIA_DESK = { W: 336, H: 214 };
export const TRIVIA_LETTER = { x: 70, y: 126, w: 196, h: 72 };
export function triviaDeskSvg() {
  const { W, H } = TRIVIA_DESK;
  const L = TRIVIA_LETTER;
  const top = 118, edge = 198;
  let s = flat(`M0 0H${W}V${top}H0Z`, '#F7E4D8');
  for (let y = 14, r = 0; y < top; y += 22, r++) for (let x = r % 2 ? 22 : 8; x < W; x += 28) s += flat(HEART(x, y, 0.12), '#F2CDBF');
  s += inner(buntingSvg(W));
  // ventana con cortinas
  s += face(rr(16, 32, 86, 70, 4), '#FFFFFF', { w: 2 });
  s += flat(rr(21, 37, 76, 60, 2), '#BFE6F8');
  s += flat('M21 80Q42 70 60 78T97 74V97H21Z', '#9ED37E');
  s += cloud(30, 56, 22, '#FFFFFF', { flat: true, dim: 0.2 });
  s += line('M59 38V96M22 66H96', '#FFFFFF', 3);
  s += part('M10 28H28C26 50 20 70 24 104H10Z', '#F7A6B9', { w: 1.6 }) + part('M108 28H90C92 50 98 70 94 104H108Z', '#F7A6B9', { w: 1.6 });
  s += face(rr(6, 24, 106, 6, 3), '#C99A6B', { w: 1.6 });
  // corcho con notitas y chinches
  s += face(rr(214, 30, 108, 74, 4), '#B9784A', { w: 2 });
  s += flat(rr(220, 36, 96, 62, 2), '#DDB07A');
  [[236, 46], [262, 70], [300, 44], [292, 80], [228, 84]].forEach(([x, y]) => { s += flat(`M${x} ${y}h2v2h-2Z`, '#C08A52'); });
  s += G({ transform: 'rotate(-6 244 66)' }, face(rr(228, 46, 32, 38, 1.5), '#FFFFFF', { w: 1.4 }) + flat(rr(232, 50, 24, 22, 1), '#FFC2D4') + flat(HEART(244, 61, 0.28), '#F05A78'));
  s += G({ transform: 'rotate(5 288 58)' }, face(rr(274, 44, 30, 28, 1.5), '#FFF1A8', { w: 1.4 }) + line('M279 53H299M279 59H295M279 65H297', '#D9B94E', 1.6));
  s += part(starPath(296, 86, 8, 3.6), '#A9DFC4', { w: 1.2 });
  [[244, 47, '#F05A78'], [289, 45, '#4FA6E6'], [296, 80, '#FFC93D']].forEach(([x, y, c]) => { s += part(ellD(x, y, 3, 3), c, { w: 1 }); });
  // escritorio: tapa con vetas y canto con tirador
  s += face(`M-4 ${top}H${W + 4}V${edge}H-4Z`, '#E8B985', { w: 2.2 });
  s += shade(`M0 ${top}H${W}V${top + 6}H0Z`, SH, 0.12);
  s += line(`M10 ${top + 22}C80 ${top + 18} 140 ${top + 28} 210 ${top + 22}S300 ${top + 26} 330 ${top + 20}M20 ${top + 60}C90 ${top + 56} 170 ${top + 66} 240 ${top + 58}`, '#C99060', 1.6, { opacity: 0.55 });
  s += face(`M-4 ${edge}H${W + 4}V${H + 4}H-4Z`, '#C98E5A', { w: 2.2 });
  s += part(rr(W / 2 - 16, edge + 5, 32, 5, 2.5), '#E8C46A', { w: 1.3 });
  // la carta (con su sombra), cintas y sello
  s += flat(rr(L.x + 3, L.y + 4, L.w, L.h, 4), SH, { opacity: 0.18 });
  s += face(rr(L.x, L.y, L.w, L.h, 4), 'var(--pg-c-surface)', { w: 2 });
  let d = '';
  for (let y = L.y + 18; y < L.y + L.h - 6; y += 13) d += `M${L.x + 12} ${y}H${L.x + L.w - 12}`;
  s += line(d, 'var(--pg-c-line)', 1.6, { opacity: 0.45 });
  s += flat(`M${L.x - 6} ${L.y + 8}L${L.x + 14} ${L.y - 2}L${L.x + 19} ${L.y + 9}L${L.x - 1} ${L.y + 19}Z`, '#A9DFC4', { opacity: 0.85 });
  s += part(flowerPath(L.x + L.w - 14, L.y + L.h - 12, 10, 8, 8), '#E8505E', { w: 1.8 }) + flat(HEART(L.x + L.w - 14, L.y + L.h - 11.5, 0.27), '#F58A94');
  // taza con corazón y vapor
  s += line('M28 140Q24 134 28 128M38 140Q34 134 38 128', '#FFFFFF', 2.2, { opacity: 0.9 });
  s += shadow0(34, 182, 22);
  s += line('M50 154C60 154 60 172 50 172', '#3A2A3E', 5) + line('M50 154C60 154 60 172 50 172', '#FFFFFF', 2.6);
  s += part('M18 146H50V174C50 178 46 182 42 182H26C22 182 18 178 18 174Z', '#FFFFFF', { w: 2 });
  s += face(ellD(34, 146, 16, 4), '#8A5A44', { w: 1.6 });
  s += flat(HEART(34, 163, 0.32), '#F05A78');
  // lapicero con lápices
  s += line('M300 150L294 124M308 150L310 120M316 150L322 126', '#5E5A7A', 2);
  s += part('M292 126L294 118L297 125Z', '#FFC93D', { w: 1 }) + part('M308 122L311 114L313 121Z', '#F05A78', { w: 1 }) + part('M320 128L325 121L325 128Z', '#4FA6E6', { w: 1 });
  s += shadow0(306, 184, 20);
  s += part('M290 150H322V178C322 181 320 183 317 183H295C292 183 290 181 290 178Z', '#9ED3F0', { w: 2 });
  s += flat(rr(292, 160, 28, 5, 2), '#FFFFFF', { opacity: 0.7 });
  return piece(W, H, s);
}
const shadow0 = (cx, cy, rx) => Ell(cx, cy, rx, rx * 0.2, { fill: SH, opacity: 0.18, 'data-r': 'tone' });

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

// Para el laboratorio de arte (/arte?set=juegos): todo junto. Con
// `&pieza=jardin,topo` se ven solo esas (por nombre, sin tildes ni
// mayúsculas: basta el comienzo).
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]/g, '');
export function GAME_ART_SET() {
  const c = (name, markup, w = 64, h = 64, kind) => ({ name, markup, w, h, kind });
  const all = [
    c('Jardín (topos)', gardenSvg(), WHACK.W, WHACK.H, 'surface'),
    ...CANDY_COLORS.map((_, t) => c(CANDY_NAMES[t], candySvg(t))),
    c('Bola de colores', colorBombSvg()),
    c('Rayada horizontal', specialOverlaySvg('h')),
    c('Rayada vertical', specialOverlaySvg('v')),
    c('Envuelta', specialOverlaySvg('bomb')),
    c('Gelatina', jellySvg(1)),
    c('Hielo', jellySvg(2)),
    c('Topo', moleSvg(), 100, 100),
    c('Topo golpeado', moleSvg('topo', true), 100, 100),
    c('Topo dorado', moleSvg('dorado'), 100, 100),
    c('Bomba', bombSvg(), 100, 100),
    c('Hoyo atrás', holeBackSvg(), 100, 100),
    c('Hoyo adelante', holeFrontSvg(), 100, 100),
    c('Hoyo con topo', holeBackSvg().replace(/<\/svg>$/, '') + moleInHole(), 100, 100),
    ...['iman', 'reloj', 'doble', 'escudo'].map((k) => c(k, powerSvg(k))),
    c('Estallido', burstSvg('#FFE37A')),
    c('Calle (cruzar)', streetSvg(), STREET.W, STREET.H, 'surface'),
    ...['#D8697F', '#E2A845', '#8FC7EE', '#C3A7EA', '#7FA894', '#EE7BC8'].map((col, k) => c(`Auto ${k + 1}`, carSvg(col, k % CAR_KINDS), 64, 34)),
    c('Camión', truckSvg('#8FC7EE'), 110, 44),
    c('Camión rosa', truckSvg('#EE7BC8'), 110, 44),
    c('Cielo (volar)', flySkySvg() .replace(/<\/svg>$/, '') + [flyCloudsSvg(), flyCitySvg(), flyHillsSvg(), flyGroundSvg()].map((m) => m.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')).join('') + '</svg>', FLY_SCENE.W, FLY_SCENE.H, 'surface'),
    ...[0, 1, 2].map((f) => c(`Pilar ${f + 1}`, pillarSvg(150, 'bottom', f), 54, 160)),
    ...[0, 1, 2].map((f) => c(`Pilar colgante ${f + 1}`, pillarSvg(150, 'top', f), 54, 150)),
    c('Mantel (serpiente)', picnicSvg(), 476, 476, 'surface'),
    c('Bolita', snakeBallSvg(), 40, 40), c('Bolita 2', snakeBallSvg('#6CC08E'), 40, 40), c('Bolita cola', snakeBallSvg('#8FD6A8', true), 40, 40),
    c('Platito', picnicPlateSvg(), 40, 40),
    c('Cocina (atrapar)', kitchenSvg(), KITCHEN.W, KITCHEN.H, 'surface'),
    ...Array.from({ length: TOWER_CHUNKS }, (_, k) => c(`Torre fondo ${k + 1}`, towerBgSvg(TOWER_CHUNKS - 1 - k), TOWER_BG.W, TOWER_BG.CHUNK, 'surface')),
    ...CAKE_FLAVORS.map((_, f) => c(`Piso ${f + 1}`, cakeLayerSvg(132 - f * 18, f), 132 - f * 18, 22)),
    c('Bandeja', cakeStandSvg(), 160, 36),
    c('Caja de música', simonConsoleSvg(316, 336), 316, 336),
    ...[['corazon', '#E4647E'], ['estrella', '#E9A83C'], ['flor', '#6FB894'], ['luna', '#7FA9DE']].flatMap(([sh, col]) => [c(`Gomita ${sh}`, simonPadSvg(sh, col)), c(`Gomita ${sh} encendida`, simonPadSvg(sh, col, true))]),
    c('Gomita apagada', simonPadSvg('luna', '#7FA9DE', false, true)),
    c('Carta reverso', cardBackSvg(), 100, 100), c('Carta frente', cardFaceSvg(), 100, 100), c('Carta pareja', cardFaceSvg(true), 100, 100),
    c('Mesa de cartas', cardTableSvg(336, 440), 336, 440),
    c('Caja de bombones', candyBoxSvg(7, 7, 44), 7 * 44 + 28, 7 * 44 + 36),
    c('Bandeja rompecabezas', puzzleFrameSvg(300), 328, 336),
    c('Escritorio trivia', triviaDeskSvg(), TRIVIA_DESK.W, TRIVIA_DESK.H, 'surface'),
    c('Guirnalda', buntingSvg(320), 320, 34), c('Carta pregunta', letterCardSvg(330, 96), 330, 96),
    ...['cocina', 'trivia', 'memoria', 'golosinas', 'simon', 'volar', 'atrapar', 'rompecabezas', 'topos', 'serpiente', 'cruzar', 'torre'].map((g) => c(`Viñeta ${g}`, gameThumbSvg(g), THUMB.W, THUMB.H, 'surface')),
    c('Caja con huecos', candyBoxSvg(7, 7, 44, Array.from({ length: 49 }, (_, i) => !(i === 0 || i === 6 || i === 42 || i === 48 || i === 24))), 7 * 44 + 28, 7 * 44 + 36),
  ];
  const want = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('pieza') : null;
  if (!want) return all;
  const keys = want.split(',').map(norm);
  return all.filter((x) => keys.some((k) => norm(x.name).startsWith(k)));
}

// Para el laboratorio: un hoyo con su topo adentro, como en el juego.
function moleInHole() {
  const inner = (m) => m.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<defs><clipPath id="boca"><path d="${MOUTH_CLIP}"/></clipPath></defs><g clip-path="url(#boca)"><g transform="translate(15 26.2) scale(0.7)">${inner(moleSvg())}</g></g>${inner(holeFrontSvg())}</svg>`;
}
