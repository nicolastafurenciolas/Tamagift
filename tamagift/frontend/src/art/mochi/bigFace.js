// Caras de pixel art en tamaños grandes.
//
// Con la rejilla más fina (más píxeles por mochi) los ojos ocupan 7-14
// píxeles de alto y las piezas chicas de faceStamps.js quedaban como dos
// puntitos. Estas se arman píxel a píxel con formas limpias: cada celda
// se llena si su área cae dentro de la forma (sin antialias), con
// contorno de tinta de 1 píxel y brillos en bloques. Es el ojo izquierdo;
// el derecho se espeja. El lado de afuera de la cara es la izquierda.
//
//   k tinta   w blanco   e color de ojos   E ojos aclarado   t lágrima
//   b rubor   B rubor mezclado con la piel   . nada

const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const out = (g) => g.map((r) => r.join(''));
const put = (g, x, y, ch) => { if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = ch; };
const at = (g, x, y) => (y >= 0 && y < g.length && x >= 0 && x < g[0].length ? g[y][x] : '.');

// Llena con `ch` las celdas cuya área cae (≥ th) dentro de `inside(x, y)`.
function fill(g, inside, ch, th = 0.45, over = null) {
  const N = 4;
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (over && !over.includes(g[y][x])) continue;
    let n = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (inside(x + (i + 0.5) / N, y + (j + 0.5) / N)) n++;
    if (n / (N * N) >= th) g[y][x] = ch;
  }
}
const ellipse = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

// Contorno de 1 píxel (lo que toca el vacío) de color `ch`.
function outline(g, ch = 'k') {
  const src = g.map((r) => r.slice());
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (src[y][x] === '.') continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(src, x + dx, y + dy) === '.')) g[y][x] = ch;
  }
}
// ¿Es borde (toca el vacío)?
const isEdge = (g, x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(g, x + dx, y + dy) === '.');

// Brillo en bloque (2×2 o 3×3 con las esquinas mordidas).
function shine(g, x, y, s) {
  for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
    if (s >= 3 && i === s - 1 && j === s - 1) continue;   // redondeado abajo a la derecha
    if (at(g, x + i, y + j) !== '.' && !isEdge(g, x + i, y + j)) put(g, x + i, y + j, 'w');
  }
}

// ── Ojos ─────────────────────────────────────────────────────────
function roundEye(H, wf = 0.8) {
  const W = Math.max(4, Math.round(H * wf));
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'k');
  // el color del ojo en la mitad de abajo, sin tocar el contorno
  const iris = ellipse(W / 2, H * 0.72, W * 0.36, H * 0.24);
  const src = g.map((r) => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (src[y][x] !== 'k' || isEdge(src, x, y)) continue;
    if (iris(x + 0.5, y + 0.5)) g[y][x] = y + 0.5 > H * 0.8 ? 'E' : 'e';
  }
  const s = H >= 12 ? 3 : 2;
  shine(g, Math.max(1, Math.round(W * 0.2)), Math.max(1, Math.round(H * 0.16)), s);
  if (H >= 9) put(g, Math.round(W * 0.68), Math.round(H * 0.56), 'w');
  return g;
}

// Ojo cerrado: '^' (feliz) o '∪' (dormido). Arco parejo de grosor t.
function arcEye(H, up) {
  const W = Math.round(H * 2.2) | 1;
  const g = grid(W, H);
  const t = H >= 5 ? 2 : 1;
  const c = (W - 1) / 2;
  // la mitad izquierda, y la derecha espejada (simétrico exacto)
  let prev = null;
  for (let x = 0; x <= c; x++) {
    const u = (x - c) / c;
    const y = Math.round((H - t) * u * u);
    const from = prev == null ? y : Math.min(prev, y), to = prev == null ? y : Math.max(prev, y);
    for (let yy = from; yy <= to + t - 1; yy++) { put(g, x, up ? yy : H - 1 - yy, 'k'); put(g, W - 1 - x, up ? yy : H - 1 - yy, 'k'); }
    prev = y;
  }
  return g;
}

function surprisedEye(H) {
  const W = Math.max(4, Math.round(H * 0.86));
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'w');
  outline(g, 'k');
  fill(g, ellipse(W / 2, H * 0.55, W * 0.28, H * 0.25), 'k', 0.3, ['w']);
  for (let y = 0; y < H; y++) for (let x = 0; x < Math.floor(W / 2); x++) g[y][W - 1 - x] = g[y][x];
  return g;
}

function angryEye(H) {
  const g = roundEye(H, 0.84);
  const W = g[0].length;
  // párpado en diagonal: alto afuera (izquierda), bajo hacia la nariz
  for (let x = 0; x < W; x++) {
    const yl = Math.round(H * 0.06 + (H * 0.42 * x) / (W - 1));
    for (let y = 0; y < yl; y++) g[y][x] = '.';
    put(g, x, yl, 'k');
    if (H >= 9) put(g, x, yl + 1, 'k');
  }
  return g;
}

function sadEye(H) {
  const eyeH = H - 3;
  const e = roundEye(eyeH);
  const W = e[0].length + 1;
  const g = grid(W, H);
  for (let y = 0; y < eyeH; y++) for (let x = 0; x < W - 1; x++) g[y + 3][x] = e[y][x];
  // ceja triste (con un renglón de aire): sube hacia adentro (derecha)
  for (let x = 1; x < W - 1; x++) put(g, x, Math.round(1.4 - (1.4 * (x - 1)) / (W - 3)), 'k');
  // lágrima chiquita abajo, del lado de adentro
  put(g, W - 1, H - 3, 't'); put(g, W - 1, H - 2, 't');
  return g;
}

function bigEye(H) {
  const W = Math.max(5, Math.round(H * 0.84));
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'k');
  const src = g.map((r) => r.slice());
  const iris = ellipse(W / 2, H * 0.56, W * 0.4, H * 0.38);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (src[y][x] !== 'k' || isEdge(src, x, y)) continue;
    if (iris(x + 0.5, y + 0.5)) g[y][x] = y + 0.5 > H * 0.74 ? 'E' : 'e';
  }
  fill(g, ellipse(W / 2, H * 0.6, W * 0.18, H * 0.2), 'k', 0.45, ['e', 'E']);
  shine(g, Math.max(1, Math.round(W * 0.2)), Math.max(1, Math.round(H * 0.16)), H >= 11 ? 3 : 2);
  put(g, Math.round(W * 0.7), Math.round(H * 0.7), 'w');
  return g;
}

function dotEye(H) {
  const W = Math.max(2, Math.round(H * 0.84));
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'k', 0.4);
  put(g, Math.floor(W * 0.28), Math.floor(H * 0.22), 'w');
  return g;
}

function sleepyEye(H) {
  const g = roundEye(H);
  const W = g[0].length;
  const lid = Math.round(H * 0.42);
  for (let y = 0; y < lid; y++) for (let x = 0; x < W; x++) g[y][x] = '.';
  for (let x = 0; x < W; x++) put(g, x, lid, 'k');
  return g;
}

function starEye(H) {
  const W = H + (H % 2 ? 0 : 1);
  const g = grid(W, H);
  const cx = W / 2, cy = H * 0.56, R = H * 0.56, r = R * 0.56;
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r : R; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
  const inside = (px, py) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c; } return c; };
  fill(g, inside, 'e', 0.35);
  // simétrica a la fuerza: la mitad derecha copia a la izquierda
  for (let y = 0; y < H; y++) for (let x = 0; x < Math.floor(W / 2); x++) g[y][W - 1 - x] = g[y][x];
  outline(g, 'k');
  put(g, Math.floor(W / 2) - 1, Math.round(cy) - 1, 'w');
  return g;
}

function heartEye(H) {
  const s = H / 2.3;
  const W = (Math.round(2.3 * s) + 1) | 1;
  const g = grid(W, H);
  fill(g, (x, y) => {
    const X = (x - W / 2) / s, Y = (1.22 * s - y) / s;
    return (X * X + Y * Y - 1) ** 3 - X * X * Y * Y * Y <= 0;
  }, 'e', 0.4);
  for (let y = 0; y < H; y++) for (let x = 0; x < Math.floor(W / 2); x++) g[y][W - 1 - x] = g[y][x];
  outline(g, 'k');
  shine(g, Math.round(W * 0.2), Math.round(H * 0.18), H >= 12 ? 3 : 2);
  return g;
}

// Delineado: ojo redondo + colita hacia afuera (izquierda) arriba.
function linerEye(H) {
  const e = roundEye(H - 1);
  const W = e[0].length + 2;
  const g = grid(W, H);
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 2; x++) g[y + 1][x + 2] = e[y][x];
  put(g, 0, 0, 'k'); put(g, 1, 1, 'k'); put(g, 1, 0, 'k'); put(g, 2, 1, 'k');
  return g;
}

// Pestañas: tres hacia afuera (izquierda) arriba.
function lashEye(H) {
  const e = roundEye(H - 2);
  const W = e[0].length + 2;
  const g = grid(W, H);
  for (let y = 0; y < H - 2; y++) for (let x = 0; x < W - 2; x++) g[y + 2][x + 2] = e[y][x];
  put(g, 0, 2, 'k'); put(g, 1, 3, 'k'); put(g, 1, 0, 'k'); put(g, 2, 1, 'k'); put(g, 3, 0, 'k'); put(g, 4, 1, 'k');
  return g;
}

function crossEye(H) {
  const W = H;
  const g = grid(W, H);
  const thick = H >= 8;
  for (let i = 0; i < H; i++) {
    put(g, i, i, 'k'); put(g, W - 1 - i, i, 'k');
    if (thick) { put(g, i + 1, i, 'k'); put(g, W - 2 - i, i, 'k'); }
  }
  return g;
}

// Ojo de anime: alto, pestaña gruesa con colita hacia afuera (izquierda).
function animeEye(H) {
  const ew = Math.max(5, Math.round(H * 0.66));
  const W = ew + 2;
  const g = grid(W, H);
  const top = Math.round(H * 0.14);
  const e = roundEye(H - top, ew / (H - top));
  for (let y = 0; y < e.length; y++) for (let x = 0; x < e[0].length; x++) if (e[y][x] !== '.') g[y + top][x + 2] = e[y][x];
  // pestaña de dos filas arriba y la colita
  for (let x = 2; x < W; x++) { put(g, x, top, 'k'); put(g, x, top + 1, 'k'); }
  put(g, 1, top, 'k'); put(g, 1, top + 1, 'k'); put(g, 0, top - 1, 'k'); put(g, 1, top - 1, 'k');
  return g;
}

function catEye(H) {
  const W = Math.round(H * 1.25);
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H * 0.48), 'e');
  outline(g, 'k');
  for (let y = 1; y < H - 1; y++) { put(g, Math.floor(W / 2), y, 'k'); if (H >= 9) put(g, Math.floor(W / 2) - 1, y, 'k'); }
  put(g, Math.floor(W / 2) + 2, Math.round(H * 0.3), 'w');
  return g;
}

function sparkleEye(H) {
  const g = roundEye(H);
  const W = g[0].length;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'w') g[y][x] = 'k';
  // destello de cuatro puntas arriba, hacia afuera, y un brillito abajo
  const r = Math.max(1, Math.round(H * 0.14));
  const cx = r + 1, cy = r + 1;
  for (let i = -r; i <= r; i++) { put(g, cx + i, cy, 'w'); put(g, cx, cy + i, 'w'); }
  if (H >= 9) put(g, Math.round(W * 0.7), Math.round(H * 0.62), 'w');
  return g;
}

function tearyEye(H) {
  const g = roundEye(H, 0.84);
  const W = g[0].length;
  const y = H - 2;
  for (let x = 1; x < W - 1; x++) if (g[y][x] !== '.' && !isEdge(g, x, y)) g[y][x] = 't';
  put(g, Math.round(W * 0.62), Math.round(H * 0.2), 'w');
  return g;
}

function buttonEye(H) {
  const W = H;
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'k');
  const c = (W - 1) / 2, d = Math.max(1, Math.round(H * 0.16));
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(g, Math.round(c + dx * d), Math.round(c + dy * d), 'E');
  put(g, Math.round(W * 0.74), Math.round(H * 0.2), 'w');
  return g;
}

// ── Bocas ────────────────────────────────────────────────────────
// Arco de W×H con trazo conectado (sin diagonales sueltas, que en pixel
// se ven como puntitos): `down` es una sonrisa ∪, si no un ceño ∩.
function arc(W, H, down = true, t = 1) {
  const g = grid(W, H);
  const c = (W - 1) / 2;
  let prev = null;
  for (let x = 0; x <= Math.ceil(c); x++) {
    const u = Math.min(1, Math.abs(x - c) / c);
    const y = Math.round((H - t) * (1 - u * u));   // 0 en las puntas, abajo en el medio
    // une con la columna anterior sin repetir su fila (escalón limpio)
    const from = prev == null || y === prev ? y : y > prev ? prev + 1 : y;
    const to = prev == null || y === prev ? y : y > prev ? y : prev - 1;
    for (let yy = from; yy <= to + t - 1; yy++) {
      const Y = down ? yy : H - 1 - yy;
      put(g, x, Y, 'k'); put(g, W - 1 - x, Y, 'k');
    }
    prev = y;
  }
  return g;
}
// Boquita w: dos ∪ seguidos que comparten la punta del medio.
function wMouth(W) {
  const half = Math.ceil(W / 2);
  const H = Math.max(2, Math.round(W / 3.4));
  const g = grid(half * 2 - 1, H);
  const one = arc(half, H, true);
  for (let y = 0; y < H; y++) for (let x = 0; x < half; x++) if (one[y][x] === 'k') { put(g, x, y, 'k'); put(g, x + half - 1, y, 'k'); }
  return g;
}
const smile = (W) => arc(W, Math.max(2, Math.round(W / 3.2)), true);
const frown = (W) => arc(W, Math.max(2, Math.round(W / 3.4)), false);
const wavy = (W) => wMouth(W).slice().reverse();
// Boca abierta (D): línea arriba, adentro rojo con la lengua.
function openMouth(W, hf = 0.62) {
  const H = Math.max(3, Math.round(W * hf));
  const g = grid(W, H);
  fill(g, (x, y) => ((x - W / 2) / (W / 2)) ** 2 + (y / H) ** 2 <= 1, 'r', 0.45);
  outline(g, 'k');
  for (let x = 0; x < W; x++) if (g[0][x] !== '.') g[0][x] = 'k';
  fill(g, ellipse(W / 2, H * 0.86, W * 0.24, H * 0.24), 'p', 0.5, ['r']);
  return g;
}
function oMouth(H) {
  const W = Math.max(3, Math.round(H * 0.8));
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'r');
  outline(g, 'k');
  return g;
}
function lineMouth(W) {
  const g = grid(W, 2);
  for (let x = 1; x < W - 1; x++) put(g, x, 1, 'k');
  put(g, 0, 0, 'k'); put(g, W - 1, 0, 'k');
  return g;
}
// Hociquito: naricita arriba y la boca abajo.
function snout(W, under = wMouth) {
  const m = under(W);
  const mw = m[0].length;
  const nw = Math.max(3, Math.round(mw * 0.36)) | 1;
  const g = grid(mw, m.length + 3);
  const nx = Math.floor((mw - nw) / 2);
  for (let x = 0; x < nw; x++) { put(g, nx + x, 0, 'k'); if (x > 0 && x < nw - 1) put(g, nx + x, 1, 'k'); }
  put(g, nx + 1, 0, 'w');
  put(g, Math.floor(mw / 2), 2, 'k');
  for (let y = 0; y < m.length; y++) for (let x = 0; x < mw; x++) if (m[y][x] !== '.') g[y + 3][x] = m[y][x];
  return g;
}
// Sonrisa + algo colgando debajo (colmillos, lengua, dientito).
function withBelow(W, extra, add) {
  const s = smile(W);
  const g = grid(W, s.length + extra);
  for (let y = 0; y < s.length; y++) for (let x = 0; x < W; x++) g[y][x] = s[y][x];
  const lineY = (x) => { let y = 0; while (y < s.length && s[y][x] !== 'k') y++; return y; };
  add(g, lineY);
  return g;
}
const fangs = (W) => withBelow(W, 2, (g, lineY) => {
  for (const fx of [Math.round(W * 0.3), W - 1 - Math.round(W * 0.3)]) { const y = lineY(fx); put(g, fx, y + 1, 'w'); put(g, fx, y + 2, 'w'); }
});
const toothMouth = (W) => withBelow(W, 2, (g) => {
  const c = Math.floor(W / 2), H = g.length;
  const cols = W % 2 ? [c] : [c - 1, c];
  cols.forEach((x) => { put(g, x, H - 2, 'w'); put(g, x, H - 1, 'k'); });
  put(g, Math.min(...cols) - 1, H - 2, 'k'); put(g, Math.max(...cols) + 1, H - 2, 'k');
});
const tongueMouth = (W) => withBelow(W, 4, (g, lineY) => {
  const tx = Math.round(W * 0.62), y = lineY(tx);
  [[0, 1], [-1, 1], [1, 1], [0, 2], [-1, 2], [1, 2], [0, 3]].forEach(([dx, dy]) => put(g, tx + dx, y + dy, 'p'));
  [[-2, 1], [2, 1], [-2, 2], [2, 2], [-1, 3], [1, 3], [0, 4]].forEach(([dx, dy]) => put(g, tx + dx, y + dy, 'k'));
});
function smirk(W) {
  const H = Math.max(2, Math.round(W / 4));
  const g = grid(W, H);
  let prev = null;
  for (let x = 0; x < W; x++) {
    const u = x / (W - 1);
    const y = Math.round((H - 1) * (u < 0.65 ? 1 : 1 - (u - 0.65) / 0.35));
    const from = prev == null ? y : Math.min(prev, y), to = prev == null ? y : Math.max(prev, y);
    for (let yy = from; yy <= to; yy++) put(g, x, yy, 'k');
    prev = y;
  }
  return g;
}
function lips(W) {
  const H = Math.max(3, Math.round(W * 0.45));
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), 'r');
  outline(g, 'k');
  for (let x = 2; x < W - 2; x++) put(g, x, Math.floor(H / 2), 'k');
  return g;
}
function triMouth(W) {
  const H = Math.max(3, Math.round(W * 0.7));
  const g = grid(W, H);
  fill(g, (x, y) => Math.abs(x - W / 2) <= (W / 2) * (1 - y / H), 'r', 0.4);
  for (let y = 0; y < H; y++) for (let x = 0; x < Math.floor(W / 2); x++) g[y][W - 1 - x] = g[y][x];
  outline(g, 'k');
  for (let x = 0; x < W; x++) if (g[0][x] !== '.') g[0][x] = 'k';
  fill(g, ellipse(W / 2, H * 0.6, W * 0.16, H * 0.16), 'p', 0.5, ['r']);
  return g;
}
function beak(W) {
  const H = Math.max(3, Math.round(W * 0.6)) | 1;
  const g = grid(W, H);
  fill(g, (x, y) => Math.abs(x - W / 2) / (W / 2) + Math.abs(y - H / 2) / (H / 2) <= 1, 'g', 0.4);
  outline(g, 'k');
  for (let x = 1; x < W - 1; x++) if (g[Math.floor(H / 2)][x] !== '.') put(g, x, Math.floor(H / 2), 'k');
  return g;
}

// ── Mejillas ─────────────────────────────────────────────────────
function cheek(W, H, ch = 'B') {
  const g = grid(W, H);
  fill(g, ellipse(W / 2, H / 2, W / 2, H / 2), ch, 0.5);
  return g;
}
function lineCheek(W, H, light = 'w') {
  const g = cheek(W, H);
  for (let x = 1; x < W - 2; x += 3) { put(g, x + 1, Math.floor(H / 2) - 1, light); put(g, x, Math.floor(H / 2), light); }
  return g;
}

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const BIG_FACE = {
  smile, wMouth, openMouth, snout, fangs, tongueMouth, smirk, lips, toothMouth, triMouth, beak, frown, wavy, oMouth, lineMouth,
  roundEye, arcEye, surprisedEye, angryEye, sadEye, bigEye, dotEye, sleepyEye, starEye, heartEye,
  linerEye, lashEye, crossEye, animeEye, catEye, sparkleEye, tearyEye, buttonEye,
};

export function registerBigFace(extend) {
  const E = (name, fn, hs) => extend(name, hs.map((h) => out(fn(h))));
  const eyeH = range(6, 15);
  E('eye.redondos.normal', (h) => roundEye(h), eyeH);
  E('eye.redondos.feliz', (h) => arcEye(h, true), range(3, 7));
  E('eye.redondos.dormido', (h) => arcEye(h, false), range(3, 7));
  E('eye.redondos.sorprendido', surprisedEye, eyeH);
  E('eye.redondos.enojado', angryEye, eyeH);
  E('eye.redondos.triste', sadEye, range(9, 17));
  E('eye.grandes.normal', bigEye, range(7, 17));
  E('eye.puntitos.normal', dotEye, range(3, 8));
  E('eye.puntitos.sorprendido', dotEye, range(3, 8));
  E('eye.somnolientos.normal', sleepyEye, eyeH);
  E('eye.estrella.normal', starEye, range(7, 17));
  E('eye.estrella.feliz', starEye, range(7, 17));
  E('eye.corazon.normal', heartEye, range(7, 17));
  E('eye.corazon.feliz', heartEye, range(7, 17));
  E('eye.delineados.normal', linerEye, range(7, 15));
  E('eye.pestanudos.normal', lashEye, range(8, 16));
  E('eye.pestanudos.feliz', (h) => arcEye(h, true), range(3, 7));
  E('eye.rebelde.normal', angryEye, eyeH);
  E('eye.cruzados.normal', crossEye, range(5, 12));
  E('eye.cruzados.feliz', crossEye, range(5, 12));
  E('eye.anime.normal', animeEye, range(9, 19));
  E('eye.gato.normal', catEye, range(5, 12));
  E('eye.brillitos.normal', sparkleEye, eyeH);
  E('eye.llorosos.normal', tearyEye, eyeH);
  for (const m of ['normal', 'feliz', 'triste', 'enojado', 'dormido', 'sorprendido']) E(`eye.botones.${m}`, buttonEye, range(5, 14));
  // bocas (los ánimos que una boca no tiene caen en los de "sonrisa")
  const M = (name, fn, ws) => extend(name, ws.map((w) => out(fn(w))));
  const mw = range(7, 20);
  M('mouth.sonrisa.normal', smile, mw);
  M('mouth.sonrisa.feliz', (w) => openMouth(w), range(5, 16));
  M('mouth.sonrisa.enojado', frown, mw);
  M('mouth.sonrisa.triste', wavy, mw);
  M('mouth.sonrisa.sorprendido', (w) => oMouth(Math.round(w * 1.2)), range(3, 12));
  M('mouth.sonrisa.dormido', lineMouth, range(4, 12));
  M('mouth.w.normal', wMouth, mw);
  M('mouth.hocico.normal', (w) => snout(w), mw);
  M('mouth.hocico.feliz', (w) => snout(w, (x) => openMouth(x, 0.5)), mw);
  M('mouth.hocico.enojado', (w) => snout(w, frown), mw);
  M('mouth.hocico.triste', (w) => snout(w, wavy), mw);
  M('mouth.hocico.dormido', (w) => snout(w, lineMouth), mw);
  M('mouth.colmillos.normal', fangs, mw);
  M('mouth.lengua.normal', tongueMouth, mw);
  M('mouth.ladeada.normal', smirk, mw);
  M('mouth.labios.normal', lips, range(7, 18));
  M('mouth.grito.normal', (w) => openMouth(w, 0.95), range(5, 14));
  M('mouth.abierta.normal', (w) => openMouth(w), range(5, 16));
  M('mouth.dientito.normal', toothMouth, mw);
  M('mouth.triangulo.normal', triMouth, range(5, 16));
  M('mouth.pico.normal', beak, range(5, 16));
  M('mouth.pico.feliz', beak, range(5, 16));
  extend('cheek.redondos.normal', range(5, 15).map((w) => out(cheek(w, Math.max(3, Math.round(w * 0.58))))));
  extend('cheek.redondos.enojado', range(5, 15).map((w) => out(cheek(w, Math.max(3, Math.round(w * 0.58)), 'b'))));
  extend('cheek.alargados.normal', range(6, 18).map((w) => out(cheek(w, Math.max(2, Math.round(w * 0.38))))));
  extend('cheek.grandes.normal', range(6, 18).map((w) => out(cheek(w, Math.max(3, Math.round(w * 0.6))))));
  extend('cheek.grandes.enojado', range(6, 18).map((w) => out(cheek(w, Math.max(3, Math.round(w * 0.6)), 'b'))));
  extend('cheek.rayitas.normal', range(6, 15).map((w) => out(lineCheek(w, Math.max(3, Math.round(w * 0.6))))));
  extend('cheek.lineas.normal', range(6, 15).map((w) => out(lineCheek(w, Math.max(3, Math.round(w * 0.6)), 'k'))));
}
