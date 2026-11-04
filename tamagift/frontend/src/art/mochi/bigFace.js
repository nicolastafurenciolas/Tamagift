// Caras de pixel art de la mochi: ojos, bocas y mejillas, píxel a píxel.
//
// Cómo se eligen: cada pieza de la cara (face.js) va en un grupo
// `data-px` que lleva adentro una caja invisible de medida fija (FACE_BOX).
// Con el alto de esa caja en la rejilla se sabe cuántos píxeles de arte
// mide una unidad del dibujo (`p`), y con eso se arma la pieza al tamaño
// justo: en el cuarto (p ≈ 0.37) un ojo mide 6 píxeles, en el laboratorio
// (p ≈ 0.55) mide 9, en una miniatura de 40 px mide 3.
//
// Reglas de dibujo (las de un sprite hecho a mano):
//   · formas cerradas y simétricas, sin píxeles sueltos;
//   · trazos de 1 píxel en tamaño chico y de 2 en grande;
//   · el brillo de los ojos arriba a la IZQUIERDA en los dos ojos (la luz
//     del mundo viene de arriba a la izquierda): por eso el ojo derecho no
//     es el izquierdo espejado, se arma aparte (nombre con `.R`);
//   · lo que cambia con el lado (pestañas, delineado, ceja, lágrima) va
//     hacia afuera de la cara.
//
// Letras: k tinta · w blanco · e color (ojos: iris; boca: labios) ·
//   E ese color aclarado · t lágrima · b rubor · B rubor mezclado con la
//   piel · r boca por dentro · p lengua · g dorado · d/l un tono más
//   oscuro/claro que lo de abajo · . nada

import { SMALL_EYES, SMALL_MOUTHS } from './faceStamps.js';

// Medida de la caja invisible de cada pieza (unidades del dibujo). La
// caja está centrada en el ojo / la mejilla; la de la boca, 4 unidades
// por debajo de la línea de la boca.
export const FACE_BOX = {
  eye: { w: 32, h: 40 },
  mouth: { w: 26, h: 28, dy: 4 },
  cheek: { w: 46, h: 28 },
  mark: { w: 22, h: 22 },
};

// ── Lienzo con origen: se dibuja alrededor del ancla (el centro del ojo,
// la línea de la boca) y al final se recorta.
function canvas() {
  const S = 64, O = 32;
  const g = Array.from({ length: S }, () => Array(S).fill('.'));
  const api = {
    put(x, y, ch) { x = Math.round(x) + O; y = Math.round(y) + O; if (x >= 0 && y >= 0 && x < S && y < S) g[y][x] = ch; },
    get(x, y) { x = Math.round(x) + O; y = Math.round(y) + O; return x >= 0 && y >= 0 && x < S && y < S ? g[y][x] : '.'; },
    // pega un sprite (filas) con su esquina en (x, y)
    blit(src, x, y, over = null) {
      src.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && (!over || over.includes(api.get(x + i, y + j)))) api.put(x + i, y + j, ch); }));
    },
    // recorta: filas + ancla relativa a la esquina del recorte
    done(ax, ay) {
      let x0 = S, y0 = S, x1 = -1, y1 = -1;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (g[y][x] !== '.') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (x1 < 0) return { rows: ['.'], ax: 0.5, ay: 0.5 };
      const rows = [];
      for (let y = y0; y <= y1; y++) rows.push(g[y].slice(x0, x1 + 1).join(''));
      return { rows, ax: ax + O - x0, ay: ay + O - y0 };
    },
  };
  return api;
}

const R = (s) => (Array.isArray(s) ? s : s.trim().split(/\s+/));
const gridOf = (rows) => rows.map((r) => [...r]);
const toRows = (g) => g.map((r) => r.join(''));
const mirrorRows = (rows) => rows.map((r) => [...r].reverse().join(''));
const flipRows = (rows) => rows.slice().reverse();
const at = (g, x, y) => (y >= 0 && y < g.length && x >= 0 && x < g[0].length ? g[y][x] : '.');
const solid = (g, x, y) => at(g, x, y) !== '.';
const inner = (g, x, y) => solid(g, x, y) && solid(g, x + 1, y) && solid(g, x - 1, y) && solid(g, x, y + 1) && solid(g, x, y - 1);

// Llena las celdas de W×H cuya área cae (≥ th) dentro de `inside`, y la
// deja simétrica de izquierda a derecha.
function cover(W, H, inside, th = 0.5, ch = 'k') {
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const N = 5;
  for (let y = 0; y < H; y++) for (let x = 0; x < Math.ceil(W / 2); x++) {
    let n = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (inside(x + (i + 0.5) / N, y + (j + 0.5) / N)) n++;
    if (n / (N * N) >= th) { g[y][x] = ch; g[y][W - 1 - x] = ch; }
  }
  return g;
}
const ovalIn = (W, H) => (x, y) => ((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2 <= 1;
function oval(W, H, ch = 'k') {
  // los óvalos chicos, dibujados (el muestreo los deja cuadrados)
  const T = {
    '2x2': 'kk kk', '2x3': 'kk kk kk', '3x3': '.k. kkk .k.', '3x4': '.k. kkk kkk .k.', '4x4': '.kk. kkkk kkkk .kk.',
    '4x5': '.kk. kkkk kkkk kkkk .kk.', '5x5': '.kkk. kkkkk kkkkk kkkkk .kkk.', '5x6': '.kkk. kkkkk kkkkk kkkkk kkkkk .kkk.',
    '4x6': '.kk. kkkk kkkk kkkk kkkk .kk.', '6x6': '.kkkk. kkkkkk kkkkkk kkkkkk kkkkkk .kkkk.',
    '6x7': '.kkkk. kkkkkk kkkkkk kkkkkk kkkkkk kkkkkk .kkkk.', '5x7': '.kkk. kkkkk kkkkk kkkkk kkkkk kkkkk .kkk.',
  };
  const t = T[`${W}x${H}`];
  const g = t ? gridOf(R(t)) : cover(W, H, ovalIn(W, H), 0.5);
  if (ch !== 'k') g.forEach((r) => r.forEach((c, i) => { if (c !== '.') r[i] = ch; }));
  return g;
}

// ── OJOS ─────────────────────────────────────────────────────────

// Ojo redondo: óvalo oscuro, el color del ojo abajo, brillo grande
// arriba a la izquierda y uno chiquito abajo a la derecha.
function roundBody(H, wf = 0.84) {
  const W = Math.max(2, Math.round(H * wf));
  const g = oval(W, H);
  if (H >= 5) {
    // el iris: un óvalo más chico en la parte de abajo (no toca el borde)
    const src = g.map((r) => r.slice());
    const iris = (x, y) => ((x - W / 2) / (W * 0.36)) ** 2 + ((y - H * 0.74) / (H * 0.28)) ** 2 <= 1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!inner(src, x, y) || !iris(x + 0.5, y + 0.5)) continue;
      g[y][x] = H >= 8 && y + 0.5 > H * 0.8 ? 'E' : 'e';
    }
  }
  shine(g, H, W);
  return g;
}
function shine(g, H, W) {
  const set = (x, y) => { if (solid(g, x, y)) g[y][x] = 'w'; };
  if (H <= 3) { if (W >= 3) set(1, 1); return; }
  if (H === 4) { set(1, 1); return; }
  if (H <= 9 || W <= 6) {
    const x = 1, y = 1;
    set(x, y); set(x, y + 1); if (W >= 5) { set(x + 1, y); set(x + 1, y + 1); }
  } else {
    const o = H >= 13 ? 2 : 1;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (!(i === 2 && j === 2)) set(o + i, o + j);
  }
  if (H >= 8) { set(W - 3, H - 3); if (H >= 13) set(W - 4, H - 3); }
}

// Ojo grandote: más iris (color en casi todo el ojo) y la pupila.
function bigBody(H) {
  const W = Math.max(4, Math.round(H * 0.86));
  const g = oval(W, H);
  const src = g.map((r) => r.slice());
  const iris = (x, y) => ((x - W / 2) / (W * 0.4)) ** 2 + ((y - H * 0.58) / (H * 0.4)) ** 2 <= 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inner(src, x, y) || !iris(x + 0.5, y + 0.5)) continue;
    g[y][x] = y + 0.5 > H * 0.78 ? 'E' : 'e';
  }
  // pupila
  const pw = Math.max(1, Math.round(W * 0.3)), ph = Math.max(1, Math.round(H * 0.3));
  const px = Math.floor((W - pw) / 2), py = Math.round(H * 0.42);
  for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) if (g[py + j] && 'eE'.includes(g[py + j][px + i])) g[py + j][px + i] = 'k';
  shine(g, H, W);
  return g;
}

// Estrella y corazón: del color del ojo, con contorno.
function starBody(H) {
  const W = H % 2 ? H : H + 1;
  const cx = W / 2, cy = H * 0.55, Rr = H * 0.56, r = Rr * 0.5;
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r : Rr; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
  const inside = (px, py) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const g = cover(W, H, inside, 0.4, 'e');
  outlineIn(g);
  if (H >= 7) { g[Math.round(H * 0.42)][Math.floor(W / 2) - 1] = 'w'; }
  return g;
}
function heartBody(H) {
  const W = Math.round(H * 1.15) | 1;
  const s = H / 2.25;
  const g = cover(W, H, (x, y) => {
    const X = (x - W / 2) / s, Y = (1.25 * s - y) / s;
    return (X * X + Y * Y - 1) ** 3 - X * X * Y * Y * Y <= 0;
  }, 0.45, 'e');
  outlineIn(g);
  if (H >= 6) { const o = H >= 11 ? 2 : 1; g[o + 1][o + 1] = 'w'; if (H >= 9) { g[o + 1][o + 2] = 'w'; g[o + 2][o + 1] = 'w'; } }
  return g;
}
// contorno de tinta de 1 píxel adentro de la forma
function outlineIn(g) {
  const src = g.map((r) => r.slice());
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) if (src[y][x] !== '.' && !inner(src, x, y)) g[y][x] = 'k';
}

function dotBody(H) {
  const W = Math.max(2, Math.round(H * 0.86));
  const g = oval(W, H);
  if (H >= 4) g[1][1] = 'w';
  return g;
}

// Ojo de gatito: almendra del color del ojo, rendija y brillo.
function catBody(H) {
  const W = Math.max(5, Math.round(H * 1.35)) | 1;
  const g = cover(W, H, (x, y) => {
    const u = (x - W / 2) / (W / 2);
    const top = H * 0.5 - H * 0.52 * (1 - u * u), bot = H * 0.5 + H * 0.5 * (1 - u * u);
    return y >= top && y <= bot;
  }, 0.45, 'e');
  outlineIn(g);
  const c = Math.floor(W / 2);
  for (let y = 1; y < H - 1; y++) { if (g[y][c] !== '.') g[y][c] = 'k'; }
  if (H >= 8) for (let y = 2; y < H - 2; y++) { g[y][c - 1] = g[y][c - 1] === 'e' && y > 2 && y < H - 3 ? 'k' : g[y][c - 1]; }
  if (H >= 5) { const y = Math.max(1, Math.round(H * 0.3)); if (g[y][c - 2] === 'e') g[y][c - 2] = 'w'; }
  return g;
}

// Botón de peluche: círculo oscuro con cuatro agujeritos.
function buttonBody(H) {
  const W = H;
  const g = oval(W, H);
  const c = (W - 1) / 2;
  if (H >= 6) {
    const d = Math.max(1, Math.round(H * 0.14));
    const holes = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [Math.round(c + a * d - (a < 0 ? 0.01 : -0.01)), Math.round(c + b * d)]);
    if (H % 2) holes.forEach(([x, y]) => { g[y][x] = 'E'; });
    else { const lo = Math.floor(c), hi = Math.ceil(c); const dd = H >= 8 ? 1 : 0; [[lo - dd, lo - dd], [hi + dd, lo - dd], [lo - dd, hi + dd], [hi + dd, hi + dd]].forEach(([x, y]) => { g[y][x] = 'E'; }); }
  }
  if (H >= 5) g[1][1] = 'w';
  return g;
}

// El cuerpo del ojo de cada estilo (abierto). Devuelve la cuadrícula.
function bodyOf(style, p) {
  const h = (u) => Math.max(2, Math.round(u * p));
  const hand = (st, H) => (SMALL_EYES[st] && SMALL_EYES[st][H] ? gridOf(R(SMALL_EYES[st][H])) : null);
  if (style === 'puntitos') { const t = hand('puntitos', Math.max(2, h(8.8))); if (t) return t; }
  if (style === 'corazon') { const t = hand('corazon', Math.max(4, h(16.5) - 1)); if (t) return t; }
  switch (style) {
    case 'grandes': return bigBody(Math.max(4, h(20)));
    case 'puntitos': return dotBody(Math.max(2, h(8.8)));
    case 'estrella': return starBody(Math.max(5, h(19)));
    case 'corazon': return heartBody(Math.max(4, h(16.5)));
    case 'gato': return catBody(Math.max(4, h(12.5)));
    case 'botones': return buttonBody(Math.max(3, h(14)));
    case 'cruzados': return crossBody(Math.max(3, h(11.5)));
    default: return roundBody(Math.max(2, h(16)));
  }
}

function crossBody(H) {
  const g = Array.from({ length: H }, () => Array(H).fill('.'));
  const thick = H >= 7;
  for (let i = 0; i < H; i++) {
    g[i][i] = 'k'; g[i][H - 1 - i] = 'k';
    if (thick) { if (i + 1 < H) g[i][i + 1] = 'k'; if (H - 2 - i >= 0) g[i][H - 2 - i] = 'k'; }
  }
  return g;
}

// Los ojos pequeños dibujados a mano (faceStamps.js) mandan sobre el
// procedimiento: { estilo: { alto: filas } }.
function smallEye(style, H) {
  const t = SMALL_EYES[style] && SMALL_EYES[style][H];
  return t ? gridOf(R(t)) : null;
}

// ── Piezas que se suman al ojo ───────────────────────────────────

// Arco cerrado: feliz (^) o dormido (∪). `A` ancho, `t` grosor.
function arcRows(A, up) {
  const T = up ? SMALL_EYES.feliz : SMALL_EYES.dormido;
  if (T && T[A]) return R(T[A]);
  const t = A >= 10 ? 2 : 1;
  const Hh = Math.max(2, Math.round(A * 0.36)) + (t - 1);
  const g = Array.from({ length: Hh }, () => Array(A).fill('.'));
  const c = (A - 1) / 2;
  let prev = null;
  for (let x = 0; x <= Math.floor(c); x++) {
    const u = Math.abs(x - c) / c;
    const y = Math.round((Hh - t) * Math.pow(u, 1.7));
    const from = prev == null ? y : Math.min(prev - (prev > y ? 1 : 0), y), to = prev == null ? y : Math.max(y, prev - 1);
    for (let yy = Math.min(from, to); yy <= Math.max(from, to) + t - 1; yy++) {
      const Y = up ? yy : Hh - 1 - yy;
      if (Y >= 0 && Y < Hh) { g[Y][x] = 'k'; g[Y][A - 1 - x] = 'k'; }
    }
    prev = y;
  }
  return toRows(g);
}

// Ceja triste (sube hacia adentro) o enojada (baja hacia adentro), para
// el ojo izquierdo: afuera = izquierda, adentro = derecha.
function browRows(len, steps, rising, t = 1) {
  const g = Array.from({ length: steps + t - 1 }, () => Array(len).fill('.'));
  for (let x = 0; x < len; x++) {
    const k = Math.min(steps - 1, Math.floor((x * steps) / len));
    const y = rising ? steps - 1 - k : k;
    for (let j = 0; j < t; j++) g[y + j][x] = 'k';
  }
  return toRows(g);
}

// Lágrima (gota): punta arriba, panza abajo.
function tearRows(n) {
  if (n <= 2) return ['t', 't'];
  if (n === 3) return ['.t', 'tt', 'tt'];
  if (n === 4) return ['.t.', 'ttt', 'twt', '.t.'];
  return ['..t..', '.ttt.', 'ttttt', 'twttt', 'ttttt', '.ttt.'];
}

// ── Ojos por ánimo ───────────────────────────────────────────────
// Todos devuelven { rows, ax, ay } con el ancla en el centro del ojo.
// `side`: -1 ojo izquierdo, +1 derecho. `nb`: sin ceja (la mochi tiene
// cejas propias).

function bodySprite(C, body) {
  const Hb = body.length, Wb = body[0].length;
  const x0 = -Math.floor(Wb / 2), y0 = -Math.floor(Hb / 2);
  C.blit(toRows(body), x0, y0);
  return { x0, y0, Wb, Hb, ax: x0 + Wb / 2, ay: y0 + Hb / 2 };
}

function eyeNormal(style, p, side) {
  const C = canvas();
  const eyeH = Math.round(16 * p);
  // estilos que son el ojo redondo con algo encima
  const base = ['delineados', 'pestanudos', 'llorosos', 'brillitos', 'anime', 'somnolientos', 'rebelde'].includes(style) ? 'redondos' : style;
  const small = smallEye(base, eyeH);
  let body = small || bodyOf(base, p);
  if (style === 'anime') body = animeBody(Math.max(5, Math.round(19.6 * p)));
  if (style === 'rebelde') body = rebelBody(Math.max(4, Math.round(13 * p)));
  if (style === 'llorosos') body = tearyBody(body);
  if (style === 'brillitos') body = sparkleBody(body);
  const b = bodySprite(C, body);
  const outX = side < 0 ? b.x0 - 1 : b.x0 + b.Wb;   // la columna de afuera
  const dir = side < 0 ? -1 : 1;
  if (style === 'somnolientos') {
    // párpado caído: se tapa la mitad de arriba y queda la línea
    const lid = b.y0 + Math.round(b.Hb * 0.42);
    for (let y = b.y0; y < lid; y++) for (let x = b.x0 - 1; x <= b.x0 + b.Wb; x++) C.put(x, y, '.');
    for (let x = b.x0 - 1; x <= b.x0 + b.Wb; x++) C.put(x, lid, 'k');
    if (b.Hb >= 9) for (let x = b.x0; x < b.x0 + b.Wb; x++) C.put(x, lid + 1, C.get(x, lid + 1) === '.' ? '.' : 'k');
  }
  if (style === 'delineados') {
    // rabito de delineado hacia afuera, saliendo de la esquina de arriba
    const y = b.y0 + Math.max(0, Math.round(b.Hb * 0.2));
    const n = b.Hb >= 9 ? 3 : 2;
    for (let i = 0; i < n; i++) { C.put(outX + dir * i, y - i, 'k'); if (b.Hb >= 9) C.put(outX + dir * i, y - i + 1, 'k'); }
    for (let x = b.x0; x < b.x0 + b.Wb; x++) if (C.get(x, b.y0) === '.') C.put(x, b.y0, '.');
  }
  if (style === 'pestanudos') {
    // tres pestañas hacia afuera, arriba
    const y = b.y0 + Math.round(b.Hb * 0.25);
    if (b.Hb >= 8) {
      C.put(outX, y, 'k'); C.put(outX + dir, y - 1, 'k');
      C.put(outX, y + 2, 'k'); C.put(outX + dir, y + 2, 'k');
      C.put(b.x0 + (side < 0 ? 1 : b.Wb - 2), b.y0 - 1, 'k'); C.put(b.x0 + (side < 0 ? 0 : b.Wb - 1), b.y0 - 2, 'k');
    } else {
      C.put(outX, y, 'k'); C.put(outX + dir, y - 1, 'k');
      C.put(b.x0 + (side < 0 ? 0 : b.Wb - 1), b.y0 - 1, 'k');
    }
  }
  if (style === 'anime') {
    // pestaña: el borde de arriba es grueso (2 filas) y en la esquina de
    // afuera sale una colita hacia arriba y afuera
    for (let x = b.x0; x < b.x0 + b.Wb; x++) if (!'.w'.includes(C.get(x, b.y0 + 1)) && C.get(x, b.y0) !== '.') C.put(x, b.y0 + 1, 'k');
    const cx = side < 0 ? b.x0 : b.x0 + b.Wb - 1;
    C.put(cx, b.y0, 'k'); C.put(cx + dir, b.y0, 'k'); C.put(cx + dir, b.y0 - 1, 'k');
    if (b.Hb >= 12) { C.put(cx + dir * 2, b.y0 - 1, 'k'); C.put(cx + dir * 2, b.y0 - 2, 'k'); }
  }
  if (style === 'rebelde') {
    // la mirada se va hacia afuera: el iris va del lado de afuera
    if (side > 0) {
      const m = mirrorRows(toRows(body));
      for (let j = 0; j < b.Hb; j++) for (let i = 0; i < b.Wb; i++) C.put(b.x0 + i, b.y0 + j, m[j][i]);
    }
  }
  return C.done(b.ax, b.ay);
}

// Ojo de anime: alto, iris de dos tonos, pupila y dos brillos.
function animeBody(H) {
  const W = Math.max(4, Math.round(H * 0.7));
  const g = oval(W, H);
  const src = g.map((r) => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inner(src, x, y)) continue;
    if (y + 0.5 > H * 0.3) g[y][x] = y + 0.5 > H * 0.72 ? 'E' : 'e';
  }
  const pw = Math.max(1, Math.round(W * 0.34)), ph = Math.max(1, Math.round(H * 0.28));
  const px = Math.floor((W - pw) / 2), py = Math.round(H * 0.36);
  for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) if (g[py + j] && 'eE'.includes(g[py + j][px + i])) g[py + j][px + i] = 'k';
  shine(g, Math.min(H, 12), W);
  return g;
}

// Rebelde: mirada de reojo, párpado recto y grueso arriba.
function rebelBody(H) {
  const W = Math.max(5, Math.round(H * 1.25));
  const g = cover(W, H, (x, y) => {
    const u = (x - W / 2) / (W / 2);
    return y >= H * 0.15 + H * 0.1 * u && y <= H * 0.5 + H * 0.48 * Math.sqrt(Math.max(0, 1 - u * u));
  }, 0.45, 'w');
  // asimétrico a propósito: se rehace sin la simetría
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let n = 0;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const X = x + (i + 0.5) / 4, Y = y + (j + 0.5) / 4, u = (X - W / 2) / (W / 2);
      if (Y >= H * 0.12 - H * 0.12 * u && Y <= H * 0.5 + H * 0.48 * Math.sqrt(Math.max(0, 1 - u * u))) n++;
    }
    g[y][x] = n >= 7 ? 'w' : '.';
  }
  outlineIn(g);
  // párpado grueso arriba
  for (let x = 0; x < W; x++) { let y = 0; while (y < H && g[y][x] === '.') y++; if (y < H) { g[y][x] = 'k'; if (y + 1 < H && H >= 7) g[y + 1][x] = 'k'; } }
  // iris hacia afuera (izquierda en el ojo izquierdo)
  const ir = Math.max(1, Math.round(H * 0.32));
  const icx = Math.round(W * 0.34), icy = Math.round(H * 0.58);
  for (let y = icy - ir; y <= icy + ir; y++) for (let x = icx - ir; x <= icx + ir; x++) {
    if (y < 0 || y >= H || x < 0 || x >= W || g[y][x] !== 'w') continue;
    if ((x - icx) ** 2 + (y - icy) ** 2 <= ir * ir + 0.5) g[y][x] = (x - icx) ** 2 + (y - icy) ** 2 <= (ir * 0.5) ** 2 + 0.3 ? 'k' : 'e';
  }
  return g;
}

function tearyBody(g0) {
  const g = g0.map((r) => r.slice());
  const H = g.length, W = g[0].length;
  // el fondo del ojo, aguado
  for (let x = 0; x < W; x++) { let y = H - 1; while (y > 0 && !inner(g0, x, y)) y--; if (y > H * 0.55 && 'eE'.includes(g[y][x])) g[y][x] = 't'; }
  if (H >= 7) { const x = W - 2, y = Math.round(H * 0.25); if (inner(g0, x, y)) g[y][x] = 'w'; }
  return g;
}
function sparkleBody(g0) {
  const g = g0.map((r) => r.slice());
  const H = g.length, W = g[0].length;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'w') g[y][x] = 'k';
  // destello de cuatro puntas arriba a la izquierda
  const r = H >= 11 ? 2 : 1;
  const cx = r + 1, cy = r + 1;
  for (let i = -r; i <= r; i++) { if (inner(g0, cx + i, cy)) g[cy][cx + i] = 'w'; if (inner(g0, cx, cy + i)) g[cy + i][cx] = 'w'; }
  if (H >= 8) { const x = W - 3, y = H - 3; if (inner(g0, x, y)) g[y][x] = 'w'; }
  return g;
}

function eyeHappy(style, p, side) {
  if (style === 'estrella' || style === 'corazon') return eyeNormal(style, p * 1.12, side);
  const C = canvas();
  const Hb = Math.max(2, Math.round(16 * p));
  const Wb = Math.max(2, Math.round(Hb * 0.84));
  const A = Wb + 2;
  const rows = arcRows(A, true);
  const x0 = -Math.floor(A / 2), y0 = -Math.ceil(rows.length / 2);
  C.blit(rows, x0, y0);
  if (style === 'pestanudos') {
    const dir = side < 0 ? -1 : 1, ox = side < 0 ? x0 : x0 + A - 1;
    C.put(ox + dir, y0 + rows.length - 2, 'k'); if (Hb >= 8) C.put(ox + dir * 2, y0 + rows.length - 3, 'k');
  }
  return C.done(x0 + A / 2, y0 + rows.length / 2);
}

function eyeSleep(style, p, side) {
  const C = canvas();
  const Hb = Math.max(2, Math.round(16 * p));
  const Wb = Math.max(2, Math.round(Hb * 0.84));
  const A = Wb + 2;
  const rows = arcRows(A, false);
  const x0 = -Math.floor(A / 2), y0 = 0;
  C.blit(rows, x0, y0);
  // pestañitas hacia afuera (en todos: así el ojo cerrado se lee dormido)
  const dir = side < 0 ? -1 : 1, ox = side < 0 ? x0 : x0 + A - 1;
  if (Hb >= 7 || style === 'pestanudos') C.put(ox + dir, y0 + 1, 'k');
  if (style === 'pestanudos' && Hb >= 8) C.put(ox + dir, y0 + 2, 'k');
  return C.done(x0 + A / 2, y0 + 0.5);
}

function eyeSurprised(style, p, side) {
  if (['cruzados', 'corazon', 'estrella', 'botones'].includes(style)) return eyeNormal(style, p * 0.92, side);
  const C = canvas();
  const H = Math.max(3, Math.round(17.6 * p));
  const T = SMALL_EYES.sorprendido && SMALL_EYES.sorprendido[H];
  let g;
  if (T) g = gridOf(R(T));
  else {
    const W = Math.max(3, Math.round(H * 0.86));
    g = oval(W, H, 'w');
    outlineIn(g);
    // pupila chiquita (sorpresa = pupila que se encoge) con su brillo
    const pw = Math.max(1, Math.round(W * 0.34)), ph = Math.max(1, Math.round(H * 0.34));
    const px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) g[py + j][px + i] = 'k';
    if (pw >= 2 && ph >= 2) g[py][px] = 'w';
  }
  const b = bodySprite(C, g);
  return C.done(b.ax, b.ay);
}

function eyeSad(style, p, side, nb) {
  const base = eyeNormal(style === 'botones' ? 'botones' : style, p, side);
  if (style === 'botones') return base;
  const C = canvas();
  const g = gridOf(base.rows);
  // ojos aguados: el fondo del iris se vuelve lágrima
  const Hb = g.length;
  if (!['estrella', 'corazon', 'cruzados', 'puntitos'].includes(style) && Hb >= 6) {
    for (let x = 0; x < g[0].length; x++) { let y = Hb - 1; while (y > 0 && !inner(g, x, y)) y--; if (y > Hb * 0.55 && 'eEk'.includes(g[y][x]) && inner(g, x, y)) g[y][x] = 't'; }
  }
  const x0 = -base.ax, y0 = -base.ay;
  C.blit(toRows(g), Math.round(x0), Math.round(y0));
  const W = g[0].length;
  const left = Math.round(x0), top = Math.round(y0);
  if (!nb) {
    // ceja triste: sube hacia adentro, con un renglón de aire
    const len = W + (W >= 6 ? 1 : 0);
    const steps = W >= 8 ? 3 : 2;
    const t = Hb >= 11 ? 2 : 1;
    let rows = browRows(len, steps, true, t);
    if (side > 0) rows = mirrorRows(rows);
    const bx = side < 0 ? left : left + W - len;
    C.blit(rows, bx, top - 1 - rows.length - (Hb >= 9 ? 1 : 0));
  }
  if (side > 0) {
    // una lágrima en la esquina de afuera del ojo derecho
    const n = Hb >= 13 ? 6 : Hb >= 9 ? 4 : Hb >= 6 ? 3 : 2;
    const tr = tearRows(n);
    C.blit(tr, left + W - Math.ceil(tr[0].length / 2), top + Hb - Math.ceil(tr.length / 2));
  }
  return C.done(Math.round(x0) + base.ax, Math.round(y0) + base.ay);
}

function eyeAngry(style, p, side) {
  if (style === 'botones') return eyeNormal(style, p, side);
  const base = eyeNormal(style, p, -1);   // se arma el izquierdo y se espeja la forma
  const g0 = gridOf(base.rows);
  const H = g0.length, W = g0[0].length;
  // el párpado: una línea en escalones parejos de 1:2 (2 píxeles por
  // escalón), alto afuera (izquierda), bajo hacia la nariz; se sale un
  // píxel hacia adentro, como una ceja fruncida pegada al ojo
  const y0 = H >= 9 ? 1 : H >= 6 ? 1 : 0;
  const lidAt = (x) => y0 + Math.floor(x / 2);
  const t = H >= 9 ? 2 : 1;
  const g = Array.from({ length: H + t }, (_, y) => Array.from({ length: W + 1 }, (_, x) => (y >= t && x < W ? g0[y - t][x] : '.')));
  for (let x = 0; x <= W; x++) {
    const ly = Math.min(g.length - 1, lidAt(x) + t);
    for (let y = 0; y < ly; y++) g[y][x] = '.';
    for (let j = 0; j < t; j++) if (g[ly - j]) g[ly - j][x] = 'k';
    // lo de abajo del borde del ojo que quedó suelto se cierra
  }
  // el brillo: debajo del párpado, del lado de afuera
  for (let y = 0; y < g.length; y++) for (let x = 0; x <= W; x++) if (g[y][x] === 'w') g[y][x] = 'k';
  // (justo debajo del escalón del párpado, sin tocar el borde)
  const sx = 1, sy = lidAt(2) + t + (H >= 7 ? 1 : 0);
  const okW = (x, y) => g[y] && g[y][x] === 'k' && g[y][x - 1] && g[y][x - 1] !== '.' && g[y - 1] && g[y - 1][x] !== '.';
  if (H >= 5 && okW(sx, sy)) g[sy][sx] = 'w';
  if (H >= 7 && okW(sx + 1, sy)) g[sy][sx + 1] = 'w';
  if (H >= 10 && okW(sx, sy + 1)) g[sy + 1][sx] = 'w';
  const rows = toRows(g);
  const ax = W / 2, ay = t + H / 2;
  if (side < 0) return { rows, ax, ay };
  // el derecho es el espejo exacto (el brillo sigue al párpado)
  return { rows: mirrorRows(rows), ax: W + 1 - ax, ay };
}

export function eyeStamp(style, mood, p, side, nb) {
  switch (mood) {
    case 'feliz': return eyeHappy(style, p, side);
    case 'dormido': return eyeSleep(style, p, side);
    case 'sorprendido': return eyeSurprised(style, p, side);
    case 'triste': return eyeSad(style, p, side, nb);
    case 'enojado': return eyeAngry(style, p, side);
    default: return eyeNormal(style, p, side);
  }
}

// ── BOCAS ────────────────────────────────────────────────────────
// Ancla: el centro de la línea de la boca (la `y` de face.js).

function smileRows(w, down = true) {
  const T = SMALL_MOUTHS.smile[w];
  const rows = T ? R(T) : arcRows(w, false);
  return down ? rows : flipRows(rows);
}
function wRows(w) {
  const half = Math.ceil(w / 2);
  const cup = smileRows(half);
  const W2 = half * 2 - 1;
  const g = Array.from({ length: cup.length }, () => Array(W2).fill('.'));
  cup.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { g[y][x] = ch; g[y][x + half - 1] = ch; } }));
  return toRows(g);
}
function openRows(w, h) {
  const T = SMALL_MOUTHS.open[`${w}x${h}`];
  if (T) return R(T);
  const g = cover(w, h, (x, y) => ((x - w / 2) / (w / 2)) ** 2 + (y / h) ** 2 <= 1, 0.42, 'r');
  outlineIn(g);
  for (let x = 0; x < w; x++) if (g[0][x] !== '.') g[0][x] = 'k';
  const src = g.map((r) => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (src[y][x] !== 'r') continue;
    if (((x + 0.5 - w / 2) / (w * 0.3)) ** 2 + ((y + 0.5 - h * 0.95) / (h * 0.4)) ** 2 <= 1) g[y][x] = 'p';
  }
  return toRows(g);
}
function oRows(w, h) {
  const T = SMALL_MOUTHS.o[`${w}x${h}`];
  if (T) return R(T);
  const g = oval(w, h, 'r');
  outlineIn(g);
  if (h >= 6) { const y = h - 2; for (let x = 0; x < w; x++) if (g[y][x] === 'r' && Math.abs(x + 0.5 - w / 2) < w * 0.25) g[y][x] = 'p'; }
  return toRows(g);
}
function stack(top, bottom, gap = 0) {
  // pone `bottom` debajo de `top`, centrados
  const w = Math.max(top[0].length, bottom[0].length);
  const padTo = (rows) => { const l = Math.floor((w - rows[0].length) / 2); return rows.map((r) => '.'.repeat(l) + r + '.'.repeat(w - rows[0].length - l)); };
  return [...padTo(top), ...Array(gap).fill('.'.repeat(w)), ...padTo(bottom)];
}

// La nariz del hociquito (va arriba de la boca): un triangulito redondo
// con su brillo y la rayita que la une con la boca.
function noseRows(p) {
  const n = Math.max(3, Math.round(7.6 * p)) | 1;
  if (n <= 3) return ['kkk', '.k.'];
  if (n <= 5) return ['.kkk.', 'kwkkk', '.kkk.', '..k..'];
  if (n <= 7) return ['.kkkkk.', 'kwwkkkk', 'kwkkkkk', '.kkkkk.', '..kkk..', '...k...'];
  return ['..kkkkk..', '.kwwkkkk.', 'kwwkkkkkk', 'kkkkkkkkk', '.kkkkkkk.', '..kkkkk..', '....k....', '....k....'];
}

function mouthRows(style, mood, p) {
  const u = (x) => Math.max(1, Math.round(x * p));
  // anchos base (en píxeles), un poco más generosos que el dibujo: una
  // boca de 1 píxel de grosor necesita aire para leerse
  const ws = Math.max(3, u(14.5));              // sonrisa
  const ww = Math.max(5, u(17) | 1);            // boquita w
  const wo = Math.max(4, u(15.5));              // boca abierta
  const ho = Math.max(3, Math.round(wo * 0.5));
  if (style === 'pico') {
    const open = mood === 'feliz' || mood === 'sorprendido';
    return { rows: beakRows(Math.max(5, u(13)) | 1, open), a: 1 };
  }
  if (style === 'hocico') {
    const nose = noseRows(p);
    const under = mood === 'feliz' ? openRows(Math.max(4, u(13)), Math.max(3, Math.round(u(13) * 0.5)))
      : mood === 'enojado' ? smileRows(Math.max(4, u(12)), false)
        : mood === 'triste' ? flipRows(wRows(Math.max(7, u(15) | 1)))
          : mood === 'sorprendido' ? oRows(Math.max(4, u(8)), Math.max(4, u(9)))
            : mood === 'dormido' ? smileRows(Math.max(3, u(8)))
              : wRows(Math.max(5, u(15) | 1));
    // la nariz se une a la boca por el medio (el filtrum)
    const joined = mood === 'normal' || mood === 'triste';
    const rows = stack(nose, under, joined ? 0 : 1);
    // en el dibujo la nariz va 3 unidades arriba de la línea y la boca 2 abajo
    return { rows, a: nose.length + (joined ? 0 : 1) - 0.5 - 2 * p };
  }
  switch (mood) {
    case 'feliz':
      if (style === 'labios') return { rows: lipsOpenRows(Math.max(5, u(16))), a: 0 };
      if (style === 'grito') return { rows: oRows(Math.max(4, u(15)), Math.max(5, u(17))), a: 0 };
      if (style === 'colmillos') return { rows: fangsOpen(wo, ho), a: 0 };
      return { rows: openRows(wo, ho), a: 0 };
    case 'enojado':
      if (style === 'grito') return { rows: shoutRows(Math.max(5, u(16))), a: -1 };
      if (style === 'colmillos') return { rows: fangsUnder(smileRows(Math.max(4, u(12)), false), true), a: -1 };
      return { rows: smileRows(Math.max(4, u(12)), false), a: -1 };
    case 'triste': return { rows: flipRows(wRows(Math.max(7, u(14) | 1))), a: -1 };
    case 'sorprendido': return { rows: oRows(Math.max(4, u(8.5)), Math.max(4, u(10.5))), a: -1 };
    case 'dormido': return { rows: smileRows(Math.max(3, u(8))), a: -0.5 };
    default: break;
  }
  switch (style) {
    case 'w': return { rows: wRows(ww), a: 0 };
    case 'colmillos': return { rows: fangsUnder(smileRows(Math.max(5, u(14)))), a: 0 };
    case 'lengua': return { rows: tongueRows(Math.max(5, u(14))), a: 0 };
    case 'ladeada': return { rows: smirkRows(Math.max(4, u(13.5))), a: -1 };
    case 'labios': return { rows: lipsRows(Math.max(5, u(16))), a: 0 };
    case 'grito': return { rows: oRows(Math.max(4, u(11)), Math.max(4, u(13))), a: -0.5 };
    case 'abierta': return { rows: openRows(Math.max(4, u(13)), Math.max(3, Math.round(u(13) * 0.5))), a: 0 };
    case 'dientito': return { rows: toothRows(Math.max(5, u(13))), a: 0 };
    case 'triangulo': return { rows: triRows(Math.max(4, u(13))), a: 0 };
    case 'beso': return { rows: kissRows(Math.max(3, u(8.5))), a: -1 };
    case 'pucheros': return { rows: poutRows(Math.max(4, u(9.5))), a: -1 };
    default: return { rows: smileRows(ws), a: 0 };
  }
}

function fangsUnder(rows, frown = false) {
  if (!frown && SMALL_MOUTHS.fangs[rows[0].length]) return R(SMALL_MOUTHS.fangs[rows[0].length]);
  const g = gridOf(rows);
  const w = g[0].length;
  const out = [...g.map((r) => r.slice()), Array(w).fill('.'), Array(w).fill('.')];
  const lineY = (x) => { let y = 0; while (y < g.length && g[y][x] !== 'k') y++; return y; };
  const fx = [Math.round(w * 0.28), w - 1 - Math.round(w * 0.28)];
  for (const x of fx) {
    const y = lineY(x);
    if (frown) { out[y + 1][x] = 'w'; out[y + 2] && (out[y + 2][x] = 'k'); }
    else { out[y + 1][x] = 'w'; if (w >= 8) out[y + 1][x + (x < w / 2 ? 1 : -1)] = out[y + 1][x + (x < w / 2 ? 1 : -1)] === '.' ? 'k' : out[y + 1][x + (x < w / 2 ? 1 : -1)]; out[y + 2][x] = 'k'; }
  }
  while (out.length && out[out.length - 1].every((c) => c === '.')) out.pop();
  return toRows(out);
}
function fangsOpen(w, h) {
  const g = gridOf(openRows(w, h));
  const fx = [Math.round(w * 0.25), w - 1 - Math.round(w * 0.25)];
  for (const x of fx) if (g[1] && g[1][x] === 'r') g[1][x] = 'w';
  return toRows(g);
}
function tongueRows(w) {
  const s = gridOf(smileRows(w));
  const out = [...s.map((r) => r.slice()), Array(w).fill('.'), Array(w).fill('.'), Array(w).fill('.')];
  const tx = Math.round(w * 0.64);
  let y = 0; while (y < s.length && s[y][tx] !== 'k') y++;
  const big = w >= 9;
  const shape = big ? [[0, 1, 'p'], [-1, 1, 'p'], [1, 1, 'p'], [0, 2, 'p'], [-1, 2, 'p'], [1, 2, 'p'], [-2, 1, 'k'], [2, 1, 'k'], [-2, 2, 'k'], [2, 2, 'k'], [-1, 3, 'k'], [0, 3, 'k'], [1, 3, 'k']]
    : [[0, 1, 'p'], [1, 1, 'p'], [0, 2, 'k'], [1, 2, 'k'], [-1, 1, 'k'], [2, 1, 'k']];
  for (const [dx, dy, ch] of shape) if (out[y + dy] && tx + dx >= 0 && tx + dx < w && out[y + dy][tx + dx] === '.') out[y + dy][tx + dx] = ch;
  while (out.length && out[out.length - 1].every((c) => c === '.')) out.pop();
  return toRows(out);
}
function toothRows(w) {
  if (SMALL_MOUTHS.tooth[w]) return R(SMALL_MOUTHS.tooth[w]);
  const s = gridOf(smileRows(w));
  const out = [...s.map((r) => r.slice()), Array(w).fill('.'), Array(w).fill('.')];
  const H = s.length;
  const c = Math.floor(w / 2);
  const cols = w % 2 ? [c] : [c - 1, c];
  const tw = w >= 9 ? cols : [cols[0]];
  for (const x of tw) { out[H][x] = 'w'; if (w >= 9) out[H + 1][x] = 'w'; }
  const lo = Math.min(...tw) - 1, hi = Math.max(...tw) + 1;
  out[H][lo] = 'k'; out[H][hi] = 'k';
  if (w >= 9) { out[H + 1][lo] = 'k'; out[H + 1][hi] = 'k'; }
  tw.forEach((x) => { out[H + (w >= 9 ? 2 : 1)] && (out[H + (w >= 9 ? 2 : 1)][x] = 'k'); });
  while (out.length && out[out.length - 1].every((ch) => ch === '.')) out.pop();
  return toRows(out);
}
function smirkRows(w) {
  const T = SMALL_MOUTHS.smirk[w];
  if (T) return R(T);
  const H = Math.max(2, Math.round(w / 3.6));
  const g = Array.from({ length: H }, () => Array(w).fill('.'));
  let prev = null;
  for (let x = 0; x < w; x++) {
    const u = x / (w - 1);
    const y = Math.round((H - 1) * (u < 0.6 ? 1 : Math.max(0, 1 - (u - 0.6) / 0.4)));
    const from = prev == null ? y : Math.min(prev, y), to = prev == null ? y : Math.max(prev, y);
    for (let yy = from; yy <= to; yy++) g[yy][x] = 'k';
    prev = y;
  }
  return toRows(g);
}
function lipsRows(w) {
  const T = SMALL_MOUTHS.lips[w];
  if (T) return R(T);
  const H = Math.max(3, Math.round(w * 0.46));
  const g = cover(w, H, (x, y) => {
    const u = Math.abs(x - w / 2) / (w / 2);
    const top = H * 0.12 + H * 0.22 * Math.cos(u * Math.PI * 1.15) * (u < 0.9 ? 1 : 0) + H * 0.1;
    const bot = H * 0.5 + H * 0.5 * Math.sqrt(Math.max(0, 1 - u * u));
    return y >= (u < 0.18 ? top + H * 0.12 : top - H * 0.08) && y <= bot && u <= 1;
  }, 0.45, 'e');
  const mid = Math.round(H * 0.45);
  for (let x = 1; x < w - 1; x++) if (g[mid][x] !== '.') g[mid][x] = 'r';
  // brillo en el labio de abajo
  if (H >= 4) { const y = mid + 2; const x = Math.round(w * 0.36); if (g[y] && g[y][x] === 'e') g[y][x] = 'E'; }
  return toRows(g);
}
function lipsOpenRows(w) {
  const H = Math.max(4, Math.round(w * 0.62));
  const g = cover(w, H, (x, y) => ((x - w / 2) / (w / 2)) ** 2 + ((y - H * 0.4) / (H * 0.62)) ** 2 <= 1 && y >= 0, 0.45, 'e');
  const src = g.map((r) => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    if (src[y][x] === '.') continue;
    const ins = ((x + 0.5 - w / 2) / (w * 0.36)) ** 2 + ((y + 0.5 - H * 0.42) / (H * 0.32)) ** 2 <= 1;
    if (ins) g[y][x] = 'r';
  }
  return toRows(g);
}
function shoutRows(w) {
  const T = SMALL_MOUTHS.shout[w];
  if (T) return R(T);
  const H = Math.max(3, Math.round(w * 0.5));
  const g = cover(w, H, (x, y) => ((x - w / 2) / (w / 2)) ** 2 + ((y - H * 0.25) / (H * 0.8)) ** 2 <= 1 && y >= H * 0.12, 0.45, 'r');
  outlineIn(g);
  // dientes en zigzag arriba
  for (let x = 1; x < w - 1; x++) if (g[1] && g[1][x] === 'r' && x % 2 === 0) g[1][x] = 'w';
  return toRows(g);
}
function triRows(w) {
  const T = SMALL_MOUTHS.tri[w];
  if (T) return R(T);
  const H = Math.max(3, Math.round(w * 0.66));
  const g = cover(w, H, (x, y) => Math.abs(x - w / 2) <= (w / 2) * (1 - (y / H) ** 1.6), 0.42, 'r');
  outlineIn(g);
  for (let x = 0; x < w; x++) if (g[0][x] !== '.') g[0][x] = 'k';
  const src = g.map((r) => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (src[y][x] === 'r' && y >= H * 0.5) g[y][x] = 'p';
  return toRows(g);
}
function kissRows(h) {
  const T = SMALL_MOUTHS.kiss[h];
  if (T) return R(T);
  return R('kk.. ..k. .k.. ..k. kk..');
}
function poutRows(w) {
  const T = SMALL_MOUTHS.pout[w];
  if (T) return R(T);
  const H = Math.max(3, Math.round(w * 0.7));
  const g = cover(w, H, (x, y) => ((x - w / 2) / (w / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2 <= 1, 0.5, 'e');
  for (let x = 1; x < w - 1; x++) if (g[Math.floor(H / 2)][x] !== '.') g[Math.floor(H / 2)][x] = 'r';
  if (H >= 4) g[Math.floor(H / 2) + 1][Math.round(w * 0.32)] = 'E';
  return toRows(g);
}
function beakRows(w, open) {
  const T = SMALL_MOUTHS[open ? 'beakOpen' : 'beak'][w];
  if (T) return R(T);
  const H = Math.max(3, Math.round(w * (open ? 0.75 : 0.55)));
  if (!open) {
    const g = cover(w, H, (x, y) => Math.abs(x - w / 2) / (w / 2) + Math.abs(y - H * 0.45) / (H * 0.55) <= 1.05, 0.45, 'e');
    outlineIn(g);
    const mid = Math.round(H * 0.45);
    for (let x = 1; x < w - 1; x++) if (g[mid][x] !== '.' && (x === 1 || x === w - 2 || g[mid][x - 1] !== '.')) g[mid][x] = 'k';
    for (let y = 1; y < mid; y++) for (let x = 0; x < w; x++) if (g[y][x] === 'e') g[y][x] = 'E';
    return toRows(g);
  }
  const g = cover(w, H, (x, y) => Math.abs(x - w / 2) / (w / 2) + Math.abs(y - H * 0.5) / (H * 0.5) <= 1.05, 0.45, 'e');
  outlineIn(g);
  const mid = Math.round(H * 0.45);
  for (let x = 2; x < w - 2; x++) if (g[mid][x] !== '.') g[mid][x] = 'r';
  for (let y = 1; y < mid; y++) for (let x = 0; x < w; x++) if (g[y][x] === 'e') g[y][x] = 'E';
  return toRows(g);
}

export function mouthStamp(style, mood, p) {
  const { rows, a } = mouthRows(style, mood, p);
  const C = canvas();
  const w = rows[0].length;
  const x0 = -Math.floor(w / 2);
  C.blit(rows, x0, 0);
  // `a`: qué renglón cae sobre la línea de la boca (puede ser negativo:
  // la boca baja un poco, como las de ánimo que en el dibujo van más abajo)
  return C.done(x0 + w / 2, a + 0.5);
}

// ── MEJILLAS ─────────────────────────────────────────────────────
// Ancla: el centro de la mejilla. `side`: -1 izquierda, +1 derecha.

function blushRows(w, h, ch = 'B') {
  const T = { '3x2': 'BBB BBB', '4x2': 'BBBB BBBB', '4x3': '.BB. BBBB .BB.', '5x3': '.BBB. BBBBB .BBB.', '6x3': '.BBBB. BBBBBB .BBBB.', '7x3': '.BBBBB. BBBBBBB .BBBBB.', '7x4': '.BBBBB. BBBBBBB BBBBBBB .BBBBB.', '8x4': '.BBBBBB. BBBBBBBB BBBBBBBB .BBBBBB.', '6x2': 'BBBBBB .BBBB.', '8x3': '.BBBBBB. BBBBBBBB .BBBBBB.', '5x2': 'BBBBB .BBB.' };
  const t = T[`${w}x${h}`];
  const g = t ? gridOf(R(t)) : cover(w, h, ovalIn(w, h), 0.5, 'B');
  if (ch !== 'B') g.forEach((r) => r.forEach((c, i) => { if (c === 'B') r[i] = ch; }));
  return g;
}

export function cheekStamp(style, mood, p, side) {
  const u = (x) => Math.max(1, Math.round(x * p));
  const C = canvas();
  let g, ax = null, ay = null;
  switch (style) {
    case 'alargados': g = blushRows(Math.max(4, u(20)), Math.max(2, u(6.5))); break;
    case 'grandes': g = blushRows(Math.max(5, u(21)), Math.max(3, u(12))); break;
    case 'corazon': {
      const H = Math.max(3, u(8.6));
      g = heartBody(H).map((r) => r.map((c) => (c === '.' ? '.' : 'b')));
      break;
    }
    case 'estrellas': {
      const H = Math.max(3, u(9.6)) | 1;
      g = starBody(H).map((r) => r.map((c) => (c === '.' ? '.' : 'b')));
      break;
    }
    case 'rayitas': case 'lineas': {
      g = blushRows(Math.max(5, u(15.5)), Math.max(3, u(9.2)));
      const H = g.length, W = g[0].length;
      const ink = style === 'lineas' ? 'k' : 'w';
      // tres rayitas en diagonal (///), del color claro u oscuro
      const n = W >= 9 ? 3 : 2;
      const step = W / (n + 0.4);
      for (let i = 0; i < n; i++) {
        const x = Math.round(step * (i + 0.7));
        for (let j = 0; j < Math.min(H, 2 + (H >= 5 ? 1 : 0)); j++) {
          const yy = Math.round((H - Math.min(H, 2 + (H >= 5 ? 1 : 0))) / 2) + j;
          const xx = x + (Math.min(H, 3) - 1 - j) - 1;
          if (g[yy] && g[yy][xx] && g[yy][xx] !== '.') g[yy][xx] = ink;
        }
      }
      break;
    }
    case 'brillos': {
      g = blushRows(Math.max(4, u(15)), Math.max(2, u(9.2)));
      // el destello va arriba, hacia afuera
      const H = g.length, W = g[0].length;
      const r = p >= 0.5 ? 2 : 1;
      const sx = side < 0 ? -r - 1 : W + r, sy = -r - 1;
      for (let i = -r; i <= r; i++) { C.put(sx + i - Math.floor(W / 2), sy - Math.floor(H / 2), 'w'); C.put(sx - Math.floor(W / 2), sy + i - Math.floor(H / 2), 'w'); }
      break;
    }
    case 'sombras': {
      // ojeras: un pliegue en curva (∪) un tono más oscuro, justo debajo
      // de cada ojo (el ojo termina 1 unidad arriba del centro de la mejilla)
      const W = Math.max(4, u(15)), H = W >= 8 ? 3 : 2;
      const rows = H === 2 ? ['d' + '.'.repeat(W - 2) + 'd', '.' + 'd'.repeat(W - 2) + '.']
        : ['d' + '.'.repeat(W - 2) + 'd', 'dd' + '.'.repeat(W - 4) + 'dd', '.' + 'd'.repeat(W - 2) + '.'];
      const off = 11 * p * -side; // hacia el ojo
      C.blit(rows, Math.round(-W / 2 + off), Math.round(-1 * p));
      return C.done(0, 0);
    }
    default: g = blushRows(Math.max(3, u(15.5)), Math.max(2, u(9.2)));
  }
  // (enojada: el color del rubor ya viene rojo en data-c2)
  const H = g.length, W = g[0].length;
  const x0 = -Math.floor(W / 2), y0 = -Math.floor(H / 2);
  C.blit(toRows(g), x0, y0);
  return C.done(ax ?? x0 + W / 2, ay ?? y0 + H / 2);
}

// Mochi oscura: la tinta del ojo viene clara (data-ink), así que el ojo
// abierto se pinta un tono más oscuro que el cuerpo ('d') y lleva un aro
// claro alrededor; lo que es trazo (ojos cerrados, cejas, la X) queda
// claro.
function darkEye(st) {
  const g = gridOf(st.rows);
  const H = g.length, W = g[0].length;
  // la mancha más grande (4 vecinos) es el ojo
  const seen = g.map((r) => r.map(() => false));
  let best = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (seen[y][x] || g[y][x] === '.') continue;
    const comp = [], st2 = [[x, y]]; seen[y][x] = true;
    while (st2.length) {
      const [cx, cy] = st2.pop(); comp.push([cx, cy]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx] && g[ny][nx] !== '.' && g[ny][nx] !== 't') { seen[ny][nx] = true; st2.push([nx, ny]); }
      }
    }
    if (comp.length > best.length) best = comp;
  }
  const filled = best.filter(([x, y]) => 'eEw'.includes(g[y][x])).length;
  if (!filled) return st;                      // un trazo: queda claro
  const whites = best.filter(([x, y]) => g[y][x] === 'w').length;
  best.forEach(([x, y]) => { if (g[y][x] === 'k') g[y][x] = 'd'; });
  if (whites > best.length * 0.35) return { ...st, rows: toRows(g) };   // ojo blanco (sorpresa): sin aro
  // aro claro de 1 píxel
  const P2 = 1;
  const out = Array.from({ length: H + 2 * P2 }, (_, y) => Array.from({ length: W + 2 * P2 }, (_, x) => at(g, x - P2, y - P2)));
  const inC = new Set(best.map(([x, y]) => `${x + P2},${y + P2}`));
  for (let y = 0; y < out.length; y++) for (let x = 0; x < out[0].length; x++) {
    if (out[y][x] !== '.') continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inC.has(`${x + dx},${y + dy}`))) out[y][x] = 'k';
  }
  return { rows: toRows(out), ax: st.ax + P2, ay: st.ay + P2 };
}

// ── MARCAS (corazón, estrella, luna, gema, florecita) ─────────────
// e: color de la marca · k: su contorno · g/b: el centro de la flor
export function markStamp(style, p) {
  const C = canvas();
  const H = Math.max(5, Math.round(11 * p));
  let g;
  switch (style) {
    case 'corazon': g = H <= 5 ? gridOf(R('.k.k. kekek keeek .kek. ..k..')) : SMALL_EYES.corazon[H] ? gridOf(R(SMALL_EYES.corazon[H])) : heartBody(H); break;
    case 'estrella': g = starBody(H % 2 ? H : H + 1); break;
    case 'luna': g = gridOf(R(H <= 6 ? '..kkk .kek. kek.. kek.. .kek. ..kkk' : H <= 8 ? '..kkk. .keek. keek.. kek... keek.. .keek. ..kkk.' : '...kkkk. ..keeeek .keekkk. kek..... kek..... kek..... .keekkk. ..keeeek ...kkkk.')); break;
    case 'gema': g = gridOf(R(H <= 6 ? '..k.. .kwk. kweek .kek. ..k..' : '...k... ..kwk.. .kwwek. kweeeek .keeek. ..kek.. ...k...')); break;
    case 'flor': g = gridOf(R(H <= 6 ? '.eke. eeeee kegek eeeee .eke.' : '.ee.ee. eeeeeee .eegee. eegggee .eegee. eeeeeee .ee.ee.')); break;
    default: return null;
  }
  const Hh = g.length, W = g[0].length;
  C.blit(toRows(g), -Math.floor(W / 2), -Math.floor(Hh / 2));
  return C.done(-Math.floor(W / 2) + W / 2, -Math.floor(Hh / 2) + Hh / 2);
}

// ── Elección ─────────────────────────────────────────────────────
const cache = new Map();
// name: "eye.redondos.triste.Rn" · "mouth.w.feliz" · "cheek.redondos.normal.R"
// w, h: la caja en la rejilla. Devuelve { rows, dx, dy } para el kit.
export function faceStamp(name, w, h) {
  const [kind, style, mood = 'normal', flags = ''] = name.split('.');
  const box = FACE_BOX[kind];
  if (!box) return null;
  const p = h / box.h;
  const q = Math.round(p * 40) / 40;   // escalones: la misma pieza para tamaños casi iguales
  const key = `${name}@${q}`;
  let st = cache.get(key);
  if (!st) {
    const side = flags.includes('R') ? 1 : -1;
    if (kind === 'eye') {
      st = eyeStamp(style, mood, q, side, flags.includes('n'));
      if (flags.includes('D') && style !== 'cruzados') st = darkEye(st);
    }
    else if (kind === 'mouth') st = mouthStamp(style, mood, q);
    else if (kind === 'mark') st = markStamp(style, q);
    else st = cheekStamp(style, mood, q, side);
    cache.set(key, st);
  }
  const sw = st.rows[0].length, sh = st.rows.length;
  // drawStamp: x0 = round(centro − ancho/2 + dx) → que el ancla caiga en su punto
  const ay = kind === 'mouth' ? st.ay + (box.dy || 0) * p : st.ay;
  return { rows: st.rows, dx: sw / 2 - st.ax, dy: sh / 2 - ay };
}
