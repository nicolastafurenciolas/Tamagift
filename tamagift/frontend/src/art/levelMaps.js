// ─────────────────────────────────────────────────────────────────
// Los mapas de niveles: cada juego de niveles es un mundo ilustrado
// dividido en zonas (Golosinas: prado de gomitas, río de chocolate,
// nubes de algodón; Cocina: huerta, mercado, pastelería…).
//
// Cómo se arma una escena (vista 3/4 de draw.js, luz de arriba a la
// izquierda):
//   · SUELO: el terreno, el camino, el agua y las sombras de contacto.
//     Se dibuja en trozos de alto fijo (kind "surface"). Cada trozo se
//     dibuja un poco más alto que lo que muestra (CHUNK_PAD) y se recorta
//     al mostrarlo: así los bordes de un trozo no se ven y los trozos
//     empalman sin costura. Solo lleva rellenos, trazos y sombras (nada
//     que un estilo sombree según su caja, que cambiaría de trozo a trozo).
//     Lo repetido (matas de pasto, adoquines, chispas) se junta en un
//     solo trazo por color: dibujar cuesta por pieza, no por forma.
//   · PIEZAS: lo que se para en el suelo (árboles, puestos, casitas,
//     puentes). Cada pieza es un dibujo propio, con su caja justa (en
//     pixel cuesta por área), dibujado en su origen: la misma pieza en
//     dos lugares se dibuja una sola vez. Van ordenadas por su base.
//   · Las paradas, la mascota, los carteles y las etiquetas son de la
//     interfaz (components/game/levelUi.jsx) y van encima de todo: las
//     piezas se ubican donde no tapen nada de eso (ni el camino).
// ─────────────────────────────────────────────────────────────────

import { part as part0, flat as flat0, line as line0, face as face0, shade, ellD, rr, rrTop, tone, mix, INK, piece } from './room/draw.js';

export const MAP_W = 300;          // marco del camino (las paradas)
export const MAP_STEP = 66;        // de parada a parada
export const SCENE_W = 360;        // el dibujo: más ancho, la tarjeta lo recorta
export const SCENE_OX = (SCENE_W - MAP_W) / 2;
export const CHUNK_PAD = 8;        // lo que se dibuja de más en cada borde de un trozo
const CHUNK = 400;
const MAP_TOP = 136;               // primera parada (arriba va el horizonte y el cartel)
const ZONE_GAP = 80;               // aire extra al cambiar de zona (transición + cartel)
const TAIL = 96;
// ── Utilidades ───────────────────────────────────────────────────
// Todo lo relleno se pasa a polígonos: papel recorta cada forma recorriendo
// su borde punto por punto, y sobre arcos y curvas eso es ~150 veces más
// lento que sobre rectas (a la vista es igual: los tramos son de ~3 px).
function arcPoly(x1, y1, rx, ry, phi, fa, fs, x2, y2, out) {
  rx = Math.abs(rx); ry = Math.abs(ry);
  if (!rx || !ry) { out.push([x2, y2]); return; }
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const xp = cp * dx + sp * dy, yp = -sp * dx + cp * dy;
  const lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const co = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, num / (den || 1)));
  const cxp = (co * rx * yp) / ry, cyp = (-co * ry * xp) / rx;
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!fs && dt > 0) dt -= Math.PI * 2; else if (fs && dt < 0) dt += Math.PI * 2;
  const n = Math.max(3, Math.min(32, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / 4)));
  for (let k = 1; k <= n; k++) {
    const t = t1 + (dt * k) / n;
    out.push([cx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, cy + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp]);
  }
}

const flatCache = new Map();
function flatten(d) {
  if (!/[AaCcQqSsTt]/.test(d)) return d;
  const hit = flatCache.get(d);
  if (hit) return hit;
  const tk = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, lcx = 0, lcy = 0, lq = null;
  const num = () => parseFloat(tk[i++]);
  let o = '';
  let pts = [];
  const flush = () => { o += pts.map(([a, b]) => `L${f1(a)} ${f1(b)}`).join(''); pts = []; };
  const cubic = (x0, y0, a, b, c, e, x3, y3) => {
    const L = Math.hypot(a - x0, b - y0) + Math.hypot(c - a, e - b) + Math.hypot(x3 - c, y3 - e);
    const n = Math.max(2, Math.min(32, Math.ceil(L / 3)));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      pts.push([u * u * u * x0 + 3 * u * u * t * a + 3 * u * t * t * c + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * b + 3 * u * t * t * e + t * t * t * y3]);
    }
  };
  const quad = (x0, y0, a, b, x2, y2) => cubic(x0, y0, x0 + (2 / 3) * (a - x0), y0 + (2 / 3) * (b - y0), x2 + (2 / 3) * (a - x2), y2 + (2 / 3) * (b - y2), x2, y2);
  while (i < tk.length) {
    if (/[a-zA-Z]/.test(tk[i])) cmd = tk[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case 'M': { flush(); x = ox + num(); y = oy + num(); sx = x; sy = y; o += `M${f1(x)} ${f1(y)}`; cmd = rel ? 'l' : 'L'; lq = null; break; }
      case 'L': { x = ox + num(); y = oy + num(); pts.push([x, y]); lq = null; break; }
      case 'H': { x = ox + num(); pts.push([x, y]); lq = null; break; }
      case 'V': { y = oy + num(); pts.push([x, y]); lq = null; break; }
      case 'C': { const a = ox + num(), b = oy + num(), c = ox + num(), e = oy + num(), x3 = ox + num(), y3 = oy + num(); cubic(x, y, a, b, c, e, x3, y3); lcx = c; lcy = e; x = x3; y = y3; lq = 'c'; break; }
      case 'S': { const a = lq === 'c' ? 2 * x - lcx : x, b = lq === 'c' ? 2 * y - lcy : y; const c = ox + num(), e = oy + num(), x3 = ox + num(), y3 = oy + num(); cubic(x, y, a, b, c, e, x3, y3); lcx = c; lcy = e; x = x3; y = y3; lq = 'c'; break; }
      case 'Q': { const a = ox + num(), b = oy + num(), x2 = ox + num(), y2 = oy + num(); quad(x, y, a, b, x2, y2); lcx = a; lcy = b; x = x2; y = y2; lq = 'q'; break; }
      case 'T': { const a = lq === 'q' ? 2 * x - lcx : x, b = lq === 'q' ? 2 * y - lcy : y; const x2 = ox + num(), y2 = oy + num(); quad(x, y, a, b, x2, y2); lcx = a; lcy = b; x = x2; y = y2; lq = 'q'; break; }
      case 'A': { const rx = num(), ry = num(), ph = num(), fa = num(), fs = num(), x2 = ox + num(), y2 = oy + num(); arcPoly(x, y, rx, ry, (ph * Math.PI) / 180, fa, fs, x2, y2, pts); x = x2; y = y2; lq = null; break; }
      case 'Z': { flush(); o += 'Z'; x = sx; y = sy; lq = null; break; }
      default: i++;
    }
  }
  flush();
  if (flatCache.size > 4000) flatCache.clear();
  flatCache.set(d, o);
  return o;
}

const part = (d, c, o) => part0(flatten(d), c, o);
const flat = (d, c, a) => flat0(flatten(d), c, a);
const face = (d, c, o) => face0(flatten(d), c, o);
const line = (d, c, w, a) => line0(flatten(d), c, w, a);
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const f1 = (v) => Math.round(v * 10) / 10;
const ev = (v) => Math.round(v / 2) * 2;
const evDn = (v) => Math.floor(v / 2) * 2;
const evUp = (v) => Math.ceil(v / 2) * 2;
const poly = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
const circ = (cx, cy, r) => ellD(f1(cx), f1(cy), f1(r), f1(r));
const ell = (cx, cy, rx, ry) => ellD(f1(cx), f1(cy), f1(rx), f1(ry));
const shine = (d, op = 0.85) => `<path d="${flatten(d)}" fill="#FFFFFF" opacity="${op}" data-r="shine"/>`;

const tonePath = (d, c, op) => shade(flatten(d), c, op);
// Estrella de n puntas.
function starD(x, y, R, k = 0.5, n = 5, rot = -90) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const r = i % 2 ? R * k : R;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return poly(pts);
}

// Brillito de 4 puntas (destello).
const sparkD = (x, y, R) => `M${f1(x)} ${f1(y - R)}Q${f1(x + R * 0.18)} ${f1(y - R * 0.18)} ${f1(x + R)} ${f1(y)}Q${f1(x + R * 0.18)} ${f1(y + R * 0.18)} ${f1(x)} ${f1(y + R)}Q${f1(x - R * 0.18)} ${f1(y + R * 0.18)} ${f1(x - R)} ${f1(y)}Q${f1(x - R * 0.18)} ${f1(y - R * 0.18)} ${f1(x)} ${f1(y - R)}Z`;

// Un tubo (varilla con grosor) a lo largo de una línea de puntos.
function tubeD(pts, w) {
  const h = w / 2;
  const L = [], Rr = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    let dx = bx - ax, dy = by - ay;
    const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    L.push([x - dy * h, y + dx * h]); Rr.push([x + dy * h, y - dx * h]);
  });
  return poly([...L, ...Rr.reverse()]);
}

// Puntos de un arco (centro, radio, ángulos en grados).
function arcPts(cx, cy, r, a0, a1, step = 12) {
  const out = [];
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return out;
}

// Banda en espiral (el remolino de un chupete).
function spiralD(cx, cy, R, turns, w) {
  const out = [], inn = [];
  const tot = turns * 360;
  for (let a = 0; a <= tot; a += 14) {
    const t = a / tot;
    const r = R * (0.1 + 0.8 * t);
    const rad = (a * Math.PI) / 180;
    const ww = w * (0.45 + 0.55 * t);
    out.push([cx + Math.cos(rad) * (r + ww / 2), cy + Math.sin(rad) * (r + ww / 2)]);
    inn.push([cx + Math.cos(rad) * Math.max(0, r - ww / 2), cy + Math.sin(rad) * Math.max(0, r - ww / 2)]);
  }
  return poly([...out, ...inn.reverse()]);
}

// Nube o mata: una base y bultos redondos encima (de izquierda a derecha).
function puffD(x0, x1, yb, bumps) {
  // bumps: [[cx, r], ...] ordenados; cada bulto es un arco que sale de la base
  let d = `M${f1(x0)} ${f1(yb)}`;
  bumps.forEach(([cx, r, dy = 0]) => {
    const cy = yb - r * 0.55 + dy;
    const a = Math.acos(Math.max(-1, Math.min(1, (yb - cy) / r)));
    d += `L${f1(cx - Math.sin(a) * r)} ${f1(cy + Math.cos(a) * r)}`;
    d += `A${f1(r)} ${f1(r)} 0 ${r > 0 ? 1 : 0} 1 ${f1(cx + Math.sin(a) * r)} ${f1(cy + Math.cos(a) * r)}`;
  });
  return `${d}L${f1(x1)} ${f1(yb)}Z`;
}

// Borde ondulado: región con el borde de arriba ondulado y el de abajo recto.
function wavyRegion(x0, x1, y, amp, period, phase, bottom) {
  const pts = [];
  for (let x = x0; x <= x1 + 0.1; x += 6) pts.push([x, y + Math.sin((x / period) * Math.PI * 2 + phase) * amp + Math.sin((x / (period * 0.43)) * Math.PI * 2 + phase * 1.7) * amp * 0.35]);
  pts.push([x1, bottom], [x0, bottom]);
  return poly(pts);
}

// Bola esponjosa (copa de árbol, algodón, arbusto): un círculo con bultos.
function fluffD(cx, cy, R, n = 7, amp = 0.1, ph = 0.4) {
  const pts = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const k = 1 + amp * Math.abs(Math.sin((a * n) / 2 + ph)) - amp * 0.5;
    pts.push([cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]);
  }
  return poly(pts);
}

// Elipse girada (como polígono).
function rotEll(cx, cy, rx, ry, deg) {
  const a = (deg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const pts = [];
  const n = Math.max(12, Math.min(32, Math.round((rx + ry) * 1.2)));
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; const x = Math.cos(t) * rx, y = Math.sin(t) * ry; pts.push([cx + x * ca - y * sa, cy + x * sa + y * ca]); }
  return poly(pts);
}

// Hoja ovalada (en pixel: al menos 4 de ancho).
const leafD = (x, y, len, ang, wid) => {
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * wid, ny = Math.cos(a) * wid;
  const mx = (x + ex) / 2, my = (y + ey) / 2;
  return `M${f1(x)} ${f1(y)}Q${f1(mx + nx)} ${f1(my + ny)} ${f1(ex)} ${f1(ey)}Q${f1(mx - nx)} ${f1(my - ny)} ${f1(x)} ${f1(y)}Z`;
};

const tuftD = (x, y, s = 1) => `M${f1(x - 5 * s)} ${f1(y)}L${f1(x - 3 * s)} ${f1(y - 5 * s)}L${f1(x - 1.5 * s)} ${f1(y - 1.5 * s)}L${f1(x)} ${f1(y - 7 * s)}L${f1(x + 1.5 * s)} ${f1(y - 1.5 * s)}L${f1(x + 3 * s)} ${f1(y - 5 * s)}L${f1(x + 5 * s)} ${f1(y)}Z`;
const at = (x, y, svg) => `<g transform="translate(${f1(x)} ${f1(y)})">${svg}</g>`;

// ── Las paradas y las zonas ──
// La zona de cada nivel (k desde 0).
export const zoneOf = (theme, count, k) => {
  const z = MAP_THEMES[theme].zones;
  return Math.min(z.length - 1, Math.floor((k * z.length) / count));
};

/**
 * Las paradas: un camino que serpentea. Con mundo (`theme`) hay sitio
 * arriba para el horizonte y el cartel, y aire extra entre zona y zona
 * para la transición (un puente, una cerca) y su cartel.
 * Cada parada dice de qué lado va su etiqueta (`side`: 'L' o 'R').
 * Los mundos con etiquetas largas (`layout`) ponen todas las etiquetas
 * de una zona del mismo lado, y del otro queda un hueco ancho para lo
 * grande de la zona (el mercado, la pastelería…).
 */
export function mapPoints(count, top, theme, labels) {
  const T = theme && MAP_THEMES[theme];
  let y = top ?? (T ? MAP_TOP : 46);
  const step = (T && T.step) || MAP_STEP;
  const out = [];
  for (let k = 0; k < count; k++) {
    if (k) {
      y += step;
      if (T && zoneOf(theme, count, k) !== zoneOf(theme, count, k - 1)) y += ZONE_GAP;
      if (T && T.extra) y += T.extra(k, count) || 0;
    }
    if (T && T.layout) {
      const { x, side } = T.layout(k, count, labels, zoneOf(theme, count, k));
      out.push({ x, y, side });
      continue;
    }
    const w = (T && T.wave) || { f: 0.95, ph: 0, amp: 96 };
    const x = MAP_W / 2 + Math.sin(k * w.f + w.ph) * w.amp;
    out.push({ x, y, side: x > MAP_W / 2 ? 'L' : 'R' });
  }
  return out;
}

// Etiquetas de una zona del mismo lado (`sides[zona]`): la parada se
// corre hacia ese lado tanto como deja el largo de su etiqueta, y del otro
// lado queda el hueco para lo grande de la zona.
function sideLayout(sides, reach = 34, wig = [0, 12, -4, 8, -2]) {
  return (k, count, labels, z) => {
    const side = sides[z % sides.length];
    const tw = labels && labels[k] != null ? labelWidth(labels[k]) : 70;
    const w = wig[k % wig.length];
    if (side === 'R') {
      const max = SCENE_W - 14 - tw - 31 - SCENE_OX;
      return { x: Math.min(MAP_W / 2 + reach + w, max), side };
    }
    const min = 14 + tw + 31 - SCENE_OX;
    return { x: Math.max(MAP_W / 2 - reach - w, min), side };
  };
}

// Ancho aproximado de una etiqueta (letra de 11.5 px + relleno).
// Las etiquetas largas van en dos o tres renglones (ancho máximo LABEL_MAX):
// su caja aproximada (generosa: en neón la letra es más ancha).
export const LABEL_MAX = 92;
const PER_LINE = Math.floor((LABEL_MAX - 14) / 7.4);
/** Los renglones de una etiqueta (la interfaz los muestra así). */
export function labelLines(text) {
  const lines = [];
  let cur = '';
  String(text).split(' ').forEach((w) => { const t = cur ? `${cur} ${w}` : w; if (t.length > PER_LINE && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur);
  return lines;
}
function labelBox(text) {
  const lines = labelLines(text);
  const longest = Math.max(...lines.map((l) => l.length));
  return { w: Math.min(LABEL_MAX + 8, Math.round(longest * 7.4 + 16)), h: lines.length * 14 + 6 };
}
const labelWidth = (s) => labelBox(s).w;

// Camino suave por las paradas (Catmull-Rom → curvas de Bézier).
function roadSegs(P) {
  const segs = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    segs.push([p1, { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }, p2]);
  }
  return segs;
}

const bz = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
function sampleRoad(segs, step) {
  const fine = [];
  segs.forEach(([a, b, c, d], i) => {
    for (let j = i ? 1 : 0; j <= 30; j++) { const t = j / 30; fine.push({ x: bz(a.x, b.x, c.x, d.x, t), y: bz(a.y, b.y, c.y, d.y, t), k: i + t }); }
  });
  let s = 0;
  fine.forEach((p, i) => { if (i) s += Math.hypot(p.x - fine[i - 1].x, p.y - fine[i - 1].y); p.s = s; });
  const out = [];
  let j = 0;
  for (let t = 0; t <= s; t += step) {
    while (j < fine.length - 2 && fine[j + 1].s < t) j++;
    const a = fine[j], b = fine[j + 1];
    const u = (t - a.s) / ((b.s - a.s) || 1);
    out.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, s: t, k: a.k + (b.k - a.k) * u });
  }
  out.forEach((p, i) => {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)];
    let dx = b.x - a.x, dy = b.y - a.y; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    p.tx = dx; p.ty = dy; p.nx = -dy; p.ny = dx;
  });
  return out;
}

export const roadPathD = (segs) => segs.map(([a, b, c, d], i) => `${i ? '' : `M${f1(a.x)} ${f1(a.y)}`}C${f1(b.x)} ${f1(b.y)} ${f1(c.x)} ${f1(c.y)} ${f1(d.x)} ${f1(d.y)}`).join('');

// ── La escena ──
const CELL = 4;
function makeScene(theme, count, pts, opts) {
  const T = MAP_THEMES[theme];
  const P = pts.map((p) => ({ x: p.x + SCENE_OX, y: p.y }));
  const H = evUp(P[P.length - 1].y + TAIL);
  const nz = T.zones.length;
  const zk = T.zones.map((_, z) => P.map((_, k) => k).filter((k) => zoneOf(theme, count, k) === z));
  const zy = T.zones.map((_, z) => {
    const k = zk[z][0];
    return !z || k == null ? 0 : ev((P[k - 1].y + P[k].y) / 2);
  });
  zy.push(H);
  const segs = roadSegs(P);
  const samp = sampleRoad(segs, 3);
  const S = {
    T, theme, count, P, H, W: SCENE_W, zk, zy, nz, segs, samp,
    labels: opts.labels || null,
    ops: [], pcs: [], r: rng(count * 7919 + theme.length * 131 + 17),
    cols: SCENE_W / CELL + 1, rows: Math.ceil(H / CELL) + 1,
  };
  S.block = new Uint8Array(S.cols * S.rows);   // lo que no se puede tapar
  S.road = new Uint8Array(S.cols * S.rows);    // por dónde pasa el camino
  S.sat = null;
  // el camino
  const mark = (arr, x0, y0, x1, y1) => {
    const c0 = Math.max(0, Math.floor(x0 / CELL)), c1 = Math.min(S.cols - 1, Math.floor(x1 / CELL));
    const r0 = Math.max(0, Math.floor(y0 / CELL)), r1 = Math.min(S.rows - 1, Math.floor(y1 / CELL));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) arr[r * S.cols + c] = 1;
  };
  S.mark = (x0, y0, x1, y1) => { mark(S.block, x0, y0, x1, y1); S.sat = null; };
  samp.forEach((p) => { mark(S.road, p.x - 13, p.y - 13, p.x + 13, p.y + 13); mark(S.block, p.x - 15, p.y - 15, p.x + 15, p.y + 15); });
  // las paradas, la mascota, las estrellas y las etiquetas
  S.stopBox = [];
  P.forEach((p, k) => {
    mark(S.block, p.x - 29, p.y - 29, p.x + 29, p.y + 29);
    mark(S.block, p.x - 25, p.y - 74, p.x + 25, p.y - 22);
    mark(S.block, p.x - 25, p.y + 20, p.x + 25, p.y + 38);
    if (S.labels && S.labels[k] != null) {
      const { w: tw, h: th } = labelBox(S.labels[k]);
      const right = (pts[k].side || (pts[k].x > MAP_W / 2 ? 'L' : 'R')) === 'R';
      const lx0 = right ? p.x + 27 : p.x - 29 - tw - 4, lx1 = right ? p.x + 29 + tw + 4 : p.x - 27;
      mark(S.block, lx0, p.y - th / 2 - 4, lx1, p.y + th / 2 + 4);
    }
  });
  // los carteles de zona (se calculan aquí para dejarles aire)
  S.signs = T.zones.map((Z, z) => signSpot(S, z, Z.name));
  S.signs.forEach((s) => mark(S.block, s.x - s.w / 2 - 6, s.y - 16, s.x + s.w / 2 + 6, s.y + 16));
  S.blockedAt = (x, y) => { const c = Math.floor(x / CELL), r = Math.floor(y / CELL); return c < 0 || r < 0 || c >= S.cols || r >= S.rows ? 0 : S.block[r * S.cols + c]; };
  S.onRoad = (x, y, m = 0) => { for (const [dx, dy] of [[0, 0], [m, 0], [-m, 0], [0, m], [0, -m]]) { const c = Math.floor((x + dx) / CELL), r = Math.floor((y + dy) / CELL); if (c >= 0 && r >= 0 && c < S.cols && r < S.rows && S.road[r * S.cols + c]) return true; } return false; };
  S.zoneAt = (y) => { let z = 0; while (z < nz - 1 && y >= zy[z + 1]) z++; return z; };
  return S;
}

// Dónde va el cartel de una zona: la primera, arriba; las demás, en el
// hueco de la transición, del lado contrario a donde cruza el camino.
function signSpot(S, z, name) {
  const w = Math.round(name.length * 7.6 + 30);
  if (!z) return { x: S.W / 2, y: 30, w };
  const a = S.P[S.zk[z][0] - 1], b = S.P[S.zk[z][0]];
  const y = ev(a.y + 50);
  // x del camino a esa altura
  const near = S.samp.reduce((best, p) => (Math.abs(p.y - y) < Math.abs(best.y - y) ? p : best), S.samp[0]);
  const left = near.x > S.W / 2;
  const x = left ? Math.max(14 + w / 2, near.x - 26 - w / 2) : Math.min(S.W - 14 - w / 2, near.x + 26 + w / 2);
  return { x: Math.round(x), y, w };
}

// Suelo: una forma con su capa, su papel y su color. Se juntan al armar
// cada trozo (mismas capa + papel + color = un solo trazo).
function gop(S, layer, kind, color, d, y0, y1, a = {}) {
  S.ops.push({ layer, kind, color, d: flatten(d), y0, y1, w: a.w || 0, op: a.op ?? 1, only: a.only || '', i: S.ops.length });
}

const G = {
  flat: (S, layer, color, d, y0, y1, only) => gop(S, layer, 'flat', color, d, y0, y1, { only }),
  line: (S, layer, color, w, d, y0, y1, op = 1, only) => gop(S, layer, 'line', color, d, y0, y1, { w, op, only }),
  tone: (S, layer, color, op, d, y0, y1) => gop(S, layer, 'tone', color, d, y0, y1, { op }),
  shine: (S, layer, d, y0, y1, op = 0.8) => gop(S, layer, 'shine', '#FFFFFF', d, y0, y1, { op }),
};

const L_BASE = 0, L_TERRAIN = 10, L_WATER = 20, L_ROAD = 30, L_DETAIL = 40, L_SHADOW = 50, L_TOP = 60;

function emitGround(S, y0, y1, dim, split = 0) {
  const sel = S.ops.filter((o) => o.y1 >= y0 && o.y0 <= y1);
  sel.sort((a, b) => a.layer - b.layer || a.i - b.i);
  const groups = [];
  let idx = new Map(), cur = null;
  for (const o of sel) {
    if (o.layer !== cur) { idx = new Map(); cur = o.layer; }
    const key = `${o.kind}|${o.color}|${o.w}|${o.op}|${o.only}`;
    let g = idx.get(key);
    if (!g) { g = { o, d: [] }; idx.set(key, g); groups.push(g); }
    g.d.push(o.d);
  }
  const col = (c) => (dim ? mix(c, dim.paper, dim.k) : c);
  // papel recorta cada forma punto por punto: con trazos muy largos tarda
  // muchísimo, así que ahí se juntan de a pocos.
  const out = [];
  groups.forEach(({ o, d }) => {
    // con `split`, cada trazo lleva a lo sumo ~`split` caracteres de forma
    const packs = [];
    if (!split) packs.push(d);
    else {
      let cur = [], len = 0;
      d.forEach((x) => { if (cur.length && len + x.length > split) { packs.push(cur); cur = []; len = 0; } cur.push(x); len += x.length; });
      if (cur.length) packs.push(cur);
    }
    for (const pk of packs) {
      const dd = pk.join('');
      if (o.kind === 'flat') out.push(flat(dd, col(o.color), o.only ? { 'data-only': o.only } : {}));
      else if (o.kind === 'line') out.push(line(dd, col(o.color), o.w, { ...(o.op < 1 ? { opacity: o.op } : {}), ...(o.only ? { 'data-only': o.only } : {}) }));
      else if (o.kind === 'tone') out.push(tonePath(dd, o.color, o.op));
      else out.push(shine(dd, o.op));
    }
  });
  return out.join('');
}

// ── Piezas ──
// Una pieza: { id, box: [x0, y0, x1, y1] (alrededor de su origen, que es
// donde se apoya), svg, shadow: [cx, cy, rx, ry], solid: [[x0,y0,x1,y1]…] }.
const defCache = new Map();
function def(id, make) {
  let d = defCache.get(id);
  if (!d) {
    d = make();
    d.id = id;
    d.box = [evDn(d.box[0] - 3), evDn(d.box[1] - 3), evUp(d.box[2] + 3), evUp(d.box[3] + 3)];
    defCache.set(id, d);
  }
  return d;
}

function markupOf(d) {
  if (!d.markup) {
    const [x0, y0, x1, y1] = d.box;
    d.markup = piece(x1 - x0, y1 - y0, `<g transform="translate(${-x0} ${-y0})">${d.svg}</g>`);
  }
  return d.markup;
}

// ¿Entra la pieza con su origen en (x, y) sin tapar nada?
function sat(S) {
  if (S.sat) return S.sat;
  const { cols, rows, block } = S;
  const s = new Int32Array((cols + 1) * (rows + 1));
  for (let r = 0; r < rows; r++) {
    let acc = 0;
    for (let c = 0; c < cols; c++) { acc += block[r * cols + c]; s[(r + 1) * (cols + 1) + c + 1] = s[r * (cols + 1) + c + 1] + acc; }
  }
  S.sat = s;
  return s;
}

function rectFree(S, x0, y0, x1, y1) {
  const s = sat(S), W1 = S.cols + 1;
  const c0 = Math.max(0, Math.floor(x0 / CELL)), c1 = Math.min(S.cols - 1, Math.floor(x1 / CELL));
  const r0 = Math.max(0, Math.floor(y0 / CELL)), r1 = Math.min(S.rows - 1, Math.floor(y1 / CELL));
  if (c1 < c0 || r1 < r0) return true;
  return s[(r1 + 1) * W1 + c1 + 1] - s[r0 * W1 + c1 + 1] - s[(r1 + 1) * W1 + c0] + s[r0 * W1 + c0] === 0;
}

const solidOf = (d) => d.solid || [d.box];
function fits(S, d, x, y, m = 2) {
  return solidOf(d).every(([a, b, c, e]) => rectFree(S, x + a + m, y + b + m, x + c - m, y + e - m));
}

function put(S, d, x, y, o = {}) {
  x = ev(x); y = ev(y);
  S.pcs.push({ d, x, y, z: o.z ?? y });
  if (o.block !== false) solidOf(d).forEach(([a, b, c, e]) => S.mark(x + a, y + b, x + c, y + e));
  if (d.shadow) {
    const [cx, cy, rx, ry] = d.shadow;
    G.tone(S, L_SHADOW, '#3B2840', 0.2, ell(x + cx, y + cy, rx, ry), y + cy - ry, y + cy + ry);
  }
  if (d.shadows) d.shadows.forEach(([cx, cy, rx, ry]) => G.tone(S, L_SHADOW, '#3B2840', 0.2, ell(x + cx, y + cy, rx, ry), y + cy - ry, y + cy + ry));
  if (d.ground) d.ground(S, x, y);
  return { x, y };
}

// Busca el mejor lugar libre para la pieza en una región; `score` más
// bajo es mejor. Devuelve el lugar o null.
function find(S, d, reg, score, step = 4) {
  let best = null, bs = Infinity;
  for (let y = reg.y0; y <= reg.y1; y += step) {
    for (let x = reg.x0; x <= reg.x1; x += step) {
      const sc = score(x, y);
      if (sc >= bs) continue;
      if (fits(S, d, x, y, reg.m ?? 2)) { best = { x, y }; bs = sc; }
    }
  }
  return best;
}

// Junta varias piezas en una (ordenadas por su base): [[def, x, y], …].
function group(id, items, extra = {}) {
  return def(`grupo-${id}`, () => {
    const list = items.slice().sort((a, b) => a[2] - b[2]);
    let s = '', x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const shadows = [];
    const solid = [];
    list.forEach(([d, x, y]) => {
      s += at(x, y, d.svg);
      x0 = Math.min(x0, x + d.box[0] + 3); y0 = Math.min(y0, y + d.box[1] + 3); x1 = Math.max(x1, x + d.box[2] - 3); y1 = Math.max(y1, y + d.box[3] - 3);
      if (d.shadow) shadows.push([x + d.shadow[0], y + d.shadow[1], d.shadow[2], d.shadow[3]]);
      if (d.shadows) d.shadows.forEach(([a, b, c, e]) => shadows.push([x + a, y + b, c, e]));
      solidOf(d).forEach(([a, b, c, e]) => solid.push([x + a, y + b, x + c, y + e]));
    });
    return { box: [x0, y0, x1, y1], svg: s, shadows, solid, ...extra };
  });
}

// ── Componer ──
// Marco: piezas que asoman por los bordes, de arriba a abajo de la zona
// (en orden revuelto para que no se repita el mismo dibujo en fila).
function frame(S, z, defs, o = {}) {
  const y0 = S.zy[z] + (o.top ?? 24), y1 = S.zy[z + 1] - (o.bottom ?? 0);
  const every = o.every ?? 70;
  const bag = [];
  const next = () => { if (!bag.length) { const b = defs.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(S.r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } bag.push(...b); } return bag.pop(); };
  for (const side of [-1, 1]) {
    for (let y = y0 + (side > 0 ? Math.round(every / 2) : 0); y < y1; y += every) {
      const d = next();
      const cx = side < 0 ? (o.inset ?? 14) : S.W - (o.inset ?? 14);
      const at = find(S, d, { x0: cx - (o.dx ?? 22), x1: cx + (o.dx ?? 22), y0: y, y1: Math.min(y1, y + every - 6), m: o.m ?? 2 }, (x, yy) => Math.abs(x - cx) * 1.5 + Math.abs(yy - y) * 0.15 + S.r() * 8, 4);
      if (at) put(S, d, at.x, at.y);
    }
  }
}

// Relleno: piezas chicas donde entren (con aire alrededor). Cada dibujo se
// usa a lo sumo `max` veces, para que no se repita.
function sprinkle(S, z, defs, n, o = {}) {
  const y0 = S.zy[z] + (o.top ?? 24), y1 = S.zy[z + 1] - (o.bottom ?? 6);
  const used = new Map();
  const max = o.max ?? 2;
  let placed = 0;
  for (let t = 0; t < n * 14 && placed < n; t++) {
    const d = defs[(placed + t) % defs.length];
    if ((used.get(d) || 0) >= max) continue;
    const x = ev(o.x0 ?? 14) + S.r() * ((o.x1 ?? S.W - 14) - (o.x0 ?? 14)), y = y0 + S.r() * (y1 - y0);
    if (fits(S, d, ev(x), ev(y), o.m ?? -6)) { put(S, d, x, y); placed++; used.set(d, (used.get(d) || 0) + 1); }
  }
  return placed;
}

// Una pieza grande en el mejor hueco cerca de (tx, ty).
function landmark(S, z, d, tx, ty, o = {}) {
  // lo grande se ve entero: no se sale de lo que muestra la tarjeta
  const reg = { x0: o.x0 ?? 14 - d.box[0], x1: o.x1 ?? S.W - 14 - d.box[2], y0: o.y0 ?? S.zy[z] + 20, y1: o.y1 ?? S.zy[z + 1] - 2, m: o.m ?? 2 };
  const at = find(S, d, reg, (x, y) => Math.abs(x - tx) * (o.kx ?? 1) + Math.abs(y - ty) * (o.ky ?? 1), o.step ?? 6);
  return at ? put(S, d, at.x, at.y, o) : null;
}

// Dibuja el camino (borde, base, luz y rayas) a partir de las muestras.
function roadBands(S, o) {
  const { samp } = S;
  const n = samp.length;
  const part0 = 40;
  for (let i = 0; i < n - 1; i += part0) {
    const sl = samp.slice(i, Math.min(n, i + part0 + 1));
    const y0 = Math.min(...sl.map((p) => p.y)) - 16, y1 = Math.max(...sl.map((p) => p.y)) + 16;
    const pts = sl.map((p) => [p.x, p.y]);
    const ends = (w) => (i === 0 ? circ(pts[0][0], pts[0][1], w / 2) : '') + (i + part0 >= n - 1 ? circ(pts[pts.length - 1][0], pts[pts.length - 1][1], w / 2) : '');
    G.flat(S, L_ROAD, o.edge, tubeD(pts, o.w + 6) + ends(o.w + 6), y0, y1);
    G.flat(S, L_ROAD + 1, o.base, tubeD(pts, o.w) + ends(o.w), y0, y1);
    if (o.light) {
      // la luz viene de arriba a la izquierda: brillo en el borde de ese lado
      const off = o.w * 0.3;
      G.flat(S, L_ROAD + 2, o.light, tubeD(sl.map((p) => { const sg = p.nx <= 0 ? 1 : -1; return [p.x + p.nx * sg * off, p.y + p.ny * sg * off]; }), o.w * 0.2), y0, y1);
    }
    if (o.neon) {
      const hw = o.w / 2 + 3;
      const edge = (sg) => `M${sl.map((p) => `${f1(p.x + p.nx * hw * sg)} ${f1(p.y + p.ny * hw * sg)}`).join('L')}`;
      G.line(S, L_ROAD + 4, o.neon, 2, edge(1) + edge(-1), y0, y1, 1, 'neon');
    }
    if (o.dash) {
      let d = '';
      for (let j = 0; j < sl.length - 2; j += 4) {
        if (Math.floor((i + j) / 4) % 2) continue;
        const a = sl[j], b = sl[Math.min(sl.length - 1, j + 2)];
        d += `M${f1(a.x)} ${f1(a.y)}L${f1(b.x)} ${f1(b.y)}`;
      }
      if (d) G.line(S, L_ROAD + 3, o.dash, 3.2, d, y0, y1, 0.95);
    }
    if (o.each) o.each(sl, y0, y1, i);
  }
}

// Dibuja el camino por zonas (cada zona con su material).
function zoneRoads(S, styleOf, extra = {}) {
  const { samp } = S;
  let i = 0;
  while (i < samp.length - 1) {
    const z = S.zoneAt(samp[i].y);
    let j = i;
    while (j < samp.length - 1 && S.zoneAt(samp[j + 1].y) === z) j++;
    const st = styleOf(z);
    const sub = { ...S, samp: samp.slice(Math.max(0, i - 1), Math.min(samp.length, j + 2)) };
    roadBands(sub, { ...st, ...extra, each: (sl, y0, y1) => {
      if (st.dots) {
        let d = '';
        sl.forEach((p, k) => { if (k % 5 === 2) d += rr(f1(p.x + p.nx * ((k % 3) - 1) * 5 - 1.5), f1(p.y + p.ny * ((k % 3) - 1) * 5 - 1), 3, 2, 1); });
        if (d) G.flat(S, L_ROAD + 3, st.dots, d, y0, y1);
      }
      if (st.slabs) {
        let d = '';
        const hw = st.w / 2 - 1;
        sl.forEach((p, k) => { if (k % 4 === 0) d += `M${f1(p.x - p.nx * hw)} ${f1(p.y - p.ny * hw)}L${f1(p.x + p.nx * hw)} ${f1(p.y + p.ny * hw)}`; });
        if (d) G.line(S, L_ROAD + 3, st.slabs, 1.4, d, y0, y1, 0.9);
      }
    } });
    i = j + 1;
  }
}

// Detalles del suelo, al azar fuera del camino.
function scatter(S, z, n, fn, o = {}) {
  const y0 = S.zy[z] + (o.top ?? 10), y1 = S.zy[z + 1] - (o.bottom ?? 10);
  for (let i = 0; i < n; i++) {
    const x = (o.x0 ?? 8) + S.r() * ((o.x1 ?? S.W - 8) - (o.x0 ?? 8)), y = y0 + S.r() * (y1 - y0);
    if (S.onRoad(x, y, o.m ?? 6)) continue;
    fn(x, y, i);
  }
}

// Macizos de florcitas al borde del camino (en el suelo, de a grupitos).
function roadFlowers(S, z, cols, leafC, o = {}) {
  const y0 = S.zy[z] + (o.top ?? 40), y1 = S.zy[z + 1] - 10;
  let side = 1, n = 0;
  for (let i = 0; i < S.samp.length; i += o.every ?? 13) {
    const p = S.samp[i];
    if (p.y < y0 || p.y > y1) continue;
    side = -side;
    const off = 21 + (n % 3) * 3;
    const cx = p.x + p.nx * off * side, cy = p.y + p.ny * off * side;
    n++;
    if (S.onRoad(cx, cy, 5) || S.blockedAt(cx, cy) && !S.onRoad(cx, cy, 0) && rectFree(S, cx - 1, cy - 1, cx + 1, cy + 1) === false && S.near && 0) continue;
    if (!rectFree(S, cx - 6, cy - 4, cx + 6, cy + 4) && !S.onRoad(cx, cy, 14)) continue;
    const pts = [[-5, 1], [1, -2], [5, 2], [-1, 4]].slice(0, 3 + (n % 2));
    pts.forEach(([dx, dy], j) => {
      const x = cx + dx, y = cy + dy;
      G.flat(S, L_DETAIL + 5, leafC, rr(x - 3.5, y + 1, 3, 2, 1) + rr(x + 0.5, y + 1.5, 3, 2, 1), y - 3, y + 4);
      G.flat(S, L_DETAIL + 6, cols[(n + j) % cols.length], rr(x - 2.5, y - 1.5, 5, 3, 1) + rr(x - 1.5, y - 2.5, 3, 5, 1), y - 3, y + 3);
      G.flat(S, L_DETAIL + 7, '#FFE58A', rr(x - 0.8, y - 0.8, 1.6, 1.6, 0), y - 1, y + 1);
    });
  }
}

// Senderito de piedras (o galletas) desde una puerta hasta el camino.
function doorPath(S, x, y, stone, dark, maxLen = 90) {
  let best = null, bd = Infinity;
  for (const p of S.samp) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  if (!best || bd > maxLen || bd < 18) return;
  const n = Math.floor((bd - 12) / 9);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.6) / (bd / 9);
    const px = x + (best.x - x) * t + (i % 2 ? 1.5 : -1.5), py = y + (best.y - y) * t;
    G.flat(S, L_DETAIL + 3, dark, ell(px, py + 1.4, 4.6, 2.4), py - 4, py + 4);
    G.flat(S, L_DETAIL + 4, stone, ell(px, py, 4.6, 2.4), py - 4, py + 4);
  }
}

// ═════════════════════════════════════════════════════════════════
// GOLOSINAS: prado de gomitas, río de chocolate (con su cascada, su
// puente de barquillo y un pueblito de casitas cupcake) y nubes de
// algodón (con huecos de cielo, arcoíris y el castillo al final).
// ═════════════════════════════════════════════════════════════════
const GOL = {
  grass: '#AEDE9C', grassLt: '#C4EAB2', grassDk: '#90CC86', grassDp: '#78B878',
  road: '#F8C3D2', roadEdge: '#E496AE', roadLt: '#FFE0E9',
  caramel: '#F4DDB0', caramelLt: '#FBEBCB', caramelDk: '#E6C68E', crumb: '#D6A86A',
  choc: '#7B4A33', chocLt: '#9C6446', chocHi: '#BE875D', chocDp: '#5B3325',
  cloud: '#F1EAFB', cloudLt: '#FFFFFF', cloudDk: '#DCD0F3', cloudDp: '#C7B8EC',
  pink: '#F47FA4', red: '#EC5570', mint: '#78D3B0', lilac: '#B79BF2', lemon: '#FFD45C', orange: '#FFA552', sky: '#7CC4F2',
};

// Matorral del borde: chupetes de alturas distintas y gomitas al pie.
const LOLLY_PAL = [[GOL.pink, '#FFFFFF'], [GOL.mint, '#FFFFFF'], [GOL.lemon, GOL.orange], [GOL.lilac, '#FFFFFF'], [GOL.sky, '#FFFFFF'], [GOL.red, '#FFE0E9'], [GOL.orange, '#FFFFFF']];
const GUM_PAL = [GOL.pink, GOL.mint, GOL.lemon, GOL.lilac, GOL.orange, GOL.sky];
// Chupete gigante: palito a rayas y remolino.
function pirulo(h, R, c, c2, bow) {
  return def(`pirulo-${h}-${R}-${c}-${c2}-${bow || ''}`, () => {
    const cy = -h - R + 5;
    let s = part(rr(-3.5, -h - 2, 7, h + 2, 2), '#FFF6F1', { w: 1.6 });
    for (let y = -6; y > -h + 4; y -= 10) s += flat(poly([[-3.5, y + 3.5], [3.5, y - 3.5], [3.5, y - 7.5], [-3.5, y - 0.5]]), GOL.red);
    s += part(circ(0, cy, R), c, { w: 2 });
    s += flat(spiralD(0, cy, R * 0.98, 2.15, R * 0.3), c2);
    s += shine(`M${f1(-R * 0.72)} ${f1(cy - R * 0.1)}A${f1(R * 0.74)} ${f1(R * 0.74)} 0 0 1 ${f1(-R * 0.1)} ${f1(cy - R * 0.72)}L${f1(-R * 0.08)} ${f1(cy - R * 0.55)}A${f1(R * 0.56)} ${f1(R * 0.56)} 0 0 0 ${f1(-R * 0.55)} ${f1(cy - R * 0.08)}Z`, 0.75);
    if (bow) {
      const by = -h + 4;
      s += part(`M0 ${by}L-10 ${by - 6}L-11 ${by + 5}Z`, bow, { w: 1.5 }) + part(`M0 ${by}L10 ${by - 6}L11 ${by + 5}Z`, bow, { w: 1.5 });
      s += part(rr(-3, by - 3, 6, 6, 2), tone(bow, -0.4), { w: 1.4 });
    }
    s += flat(tuftD(-5, 1, 0.7) + tuftD(5, 1, 0.6), GOL.grassDp);
    return { box: [-R - 2, cy - R - 2, R + 2, 4], svg: s, shadow: [0, 1, R * 0.5, 3.5], solid: [[-R, cy - R, R, cy + R], [-6, cy + R, 6, 2]] };
  });
}

// Gomita: campana translúcida con azúcar.
function gomitaSvg(x, y, r, c) {
  const h = r * 1.3;
  let s = part(`M${x - r} ${y}C${x - r} ${f1(y - h * 0.55)} ${f1(x - r * 0.62)} ${f1(y - h)} ${x} ${f1(y - h)}C${f1(x + r * 0.62)} ${f1(y - h)} ${x + r} ${f1(y - h * 0.55)} ${x + r} ${y}A${r} ${f1(r * 0.3)} 0 0 1 ${x - r} ${y}Z`, c, { w: 1.8 });
  s += flat(ell(x - r * 0.08, y - h * 0.5, r * 0.6, h * 0.3), tone(c, 0.5));
  s += tonePath(`M${x - r} ${y}A${r} ${f1(r * 0.3)} 0 0 0 ${x + r} ${y}C${x + r} ${f1(y - r * 0.32)} ${x - r} ${f1(y - r * 0.32)} ${x - r} ${y}Z`, tone(c, -1.2), 0.45);
  const sug = [[-0.5, -0.3], [0.05, -0.78], [0.5, -0.36], [-0.12, -0.18], [0.36, -0.66], [-0.4, -0.62]];
  s += flat(sug.map(([a, b]) => rr(f1(x + a * r - 1.4), f1(y + b * h - 1.4), 2.8, 2.8, 0.5)).join(''), '#FFFFFF', { opacity: 0.85 });
  s += shine(ell(x - r * 0.5, y - h * 0.62, r * 0.13, h * 0.17), 0.9);
  return s;
}

function gomitas(id, list) {
  return def(`gomitas-${id}`, () => {
    const l = list.slice().sort((a, b) => a[1] - b[1]);
    let s = '', x0 = 0, x1 = 0, y0 = 0;
    l.forEach(([x, y, r, c]) => { s += gomitaSvg(x, y, r, c); x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r * 1.35); });
    return { box: [x0 - 2, y0 - 2, x1 + 2, Math.max(...l.map((g) => g[1])) + 6], svg: s, shadows: l.map(([x, y, r]) => [x, y + 1, r * 0.95, r * 0.28]) };
  });
}

// Montón de gomitas grandes (como piedras en el prado).
function gumMound(v) {
  const R = rng(v * 53 + 11);
  const l = [];
  const n = 3 + (v % 2);
  for (let i = 0; i < n; i++) l.push([Math.round((i - (n - 1) / 2) * 15 + (R() - 0.5) * 6), Math.round((i % 2) * 8 + R() * 4), Math.round(9 + R() * 7 - (i % 2) * 2), GUM_PAL[Math.floor(R() * 6)]]);
  return gomitas(`monton${v}`, l);
}

// Bastón de caramelo: tubo con gancho y rayas.
function canePts(h, dir, r = 6) {
  const pts = [];
  for (let y = 0; y > -h + r; y -= 3) pts.push([0, y]);
  arcPts(dir * r, -h + r, r, dir > 0 ? 180 : 0, dir > 0 ? 360 : -180, 15).forEach((p) => pts.push(p));
  pts.push([dir * 2 * r, -h + r + 4]);
  return pts;
}

function caneSvg(x, y, h, dir, w = 6, c = GOL.red) {
  const pts = canePts(h, dir).map(([a, b]) => [x + a, y + b]);
  let s = part(tubeD(pts, w), '#FFF6F1', { w: 1.5 });
  let acc = 0, on = false, seg = [];
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc > 4.5) { acc = 0; on = !on; if (!on && seg.length > 1) { s += flat(tubeD(seg, w - 1.2), c); } seg = []; }
    if (on) seg.push(pts[i]);
  }
  if (on && seg.length > 1) s += flat(tubeD(seg, w - 1.2), c);
  return s;
}

// Cerca de bastones con baranda a rayas (centrada, apoyada en y=0).
function caneFence(len, gate) {
  return def(`cerca-${len}-${gate || ''}`, () => {
    let s = '';
    const n = Math.max(2, Math.round(len / 20));
    const step = len / n;
    const ry = -14;
    s += part(rr(-len / 2 - 2, ry - 3, len + 4, 6, 3), '#FFF6F1', { w: 1.5 });
    let st = '';
    for (let x = -len / 2 + 2; x < len / 2 - 4; x += 8) st += poly([[x, ry + 3], [x + 4, ry - 3], [x + 7, ry - 3], [x + 3, ry + 3]]);
    s += flat(st, GOL.pink);
    for (let i = 0; i <= n; i++) {
      const x = -len / 2 + i * step;
      const big = gate && ((i === 0 && gate === 'L') || (i === n && gate === 'R'));
      s += caneSvg(f1(x), 0, big ? 38 : 26, big ? (gate === 'L' ? -1 : 1) : 1, big ? 7 : 6, i % 2 ? GOL.red : GOL.pink);
      if (big) s += part(`M${f1(x)} -27L${f1(x - 9)} -32L${f1(x - 10)} -22Z`, GOL.mint, { w: 1.4 }) + part(`M${f1(x)} -27L${f1(x + 9)} -32L${f1(x + 10)} -22Z`, GOL.mint, { w: 1.4 }) + part(rr(f1(x - 3), -30, 6, 6, 2), '#4FB58E', { w: 1.3 });
    }
    return { box: [-len / 2 - 14, -42, len / 2 + 14, 4], svg: s, shadows: [[0, 1, len / 2 + 4, 3]] };
  });
}

// Flor de caramelo: tallo, hojas y pétalos redondos.
function candyFlower(x, y, h, c, center = GOL.lemon) {
  let s = part(rr(x - 1.6, y - h, 3.2, h, 1.4), '#5DAE6C', { w: 1.3 });
  s += part(leafD(x, y - h * 0.35, 9, -150, 3.2), '#74C483', { w: 1.3 }) + part(leafD(x, y - h * 0.55, 8, -30, 3), '#74C483', { w: 1.3 });
  const cy = y - h - 2;
  for (let i = 0; i < 5; i++) { const a = ((-90 + i * 72) * Math.PI) / 180; s += part(circ(x + Math.cos(a) * 5.2, cy + Math.sin(a) * 5.2, 4.2), c, { w: 1.3 }); }
  s += part(circ(x, cy, 3.6), center, { w: 1.3 }) + shine(circ(x - 1.2, cy - 1.2, 1.2), 0.9);
  return s;
}

function flowerPatch(id, list) {
  return def(`flores-${id}`, () => {
    let s = '', x0 = 0, x1 = 0, y0 = 0;
    list.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, h, c]) => { s += candyFlower(x, y, h, c); x0 = Math.min(x0, x - 11); x1 = Math.max(x1, x + 11); y0 = Math.min(y0, y - h - 11); });
    return { box: [x0, y0, x1, 6 + Math.max(...list.map((f) => f[1]))], svg: s, shadows: list.map(([x, y]) => [x, y + 1, 6, 2]) };
  });
}

// Jardincito cercado: cantero de flores de caramelo con cerca de bastones.
function candyGarden() {
  return def('jardin-dulce', () => {
    let s = '';
    const fl = [[-30, -18, 14, GOL.pink], [-12, -22, 18, GOL.lilac], [8, -19, 15, GOL.orange], [26, -21, 17, GOL.red], [-22, -8, 12, GOL.sky], [0, -9, 14, GOL.lemon], [20, -7, 12, GOL.pink]];
    fl.forEach(([x, y, h, c]) => { s += candyFlower(x, y, h, c); });
    s += caneFence(80).svg;
    return {
      box: [-54, -50, 54, 6], svg: s, shadows: [[0, 1, 44, 3]],
      ground: (S, x, y) => {
        G.flat(S, L_TERRAIN + 2, '#9A6A48', rr(x - 42, y - 30, 84, 28, 8), y - 32, y);
        G.flat(S, L_TERRAIN + 3, '#B07E58', rr(x - 40, y - 28, 80, 22, 7), y - 32, y);
        G.line(S, L_TERRAIN + 4, '#8A5C3E', 2, `M${x - 34} ${y - 20}h68M${x - 34} ${y - 12}h68`, y - 32, y, 0.8);
      },
    };
  });
}

// Menta acostada: disco con remolino de gajos.
function mentaSvg(x, y, r) {
  const ry = r * 0.5, th = 4;
  let s = face(`M${x - r} ${y - th}L${x - r} ${y}A${r} ${ry} 0 0 0 ${x + r} ${y}L${x + r} ${y - th}Z`, '#E9E2E6', { w: 1.6 });
  s += part(ell(x, y - th, r, ry), '#FFFFFF', { w: 1.6 });
  let w = '';
  for (let i = 0; i < 4; i++) {
    const a0 = (i * 90 * Math.PI) / 180, a1 = ((i * 90 + 45) * Math.PI) / 180, a2 = ((i * 90 + 30) * Math.PI) / 180;
    w += `M${f1(x)} ${f1(y - th)}Q${f1(x + Math.cos(a2) * r * 0.75)} ${f1(y - th + Math.sin(a2) * ry * 0.75)} ${f1(x + Math.cos(a1) * r * 0.92)} ${f1(y - th + Math.sin(a1) * ry * 0.92)}L${f1(x + Math.cos(a0) * r * 0.92)} ${f1(y - th + Math.sin(a0) * ry * 0.92)}Z`;
  }
  s += flat(w, GOL.red) + flat(ell(x, y - th, 2.6, 1.4), '#FFFFFF');
  for (let i = 0; i < 4; i++) { const a = ((i * 90 + 22) * Math.PI) / 180; s += flat(rr(f1(x + Math.cos(a) * r - 1.5), f1(y + Math.sin(a) * 0.5 - 3), 3, 3, 0.5), GOL.red); }
  return s + shine(ell(x - r * 0.45, y - th - ry * 0.45, r * 0.2, ry * 0.16), 0.9);
}

// Osito de gomita: cabeza grande y redonda, orejas, bracitos abiertos y
// panza translúcida.
function ositoSvg(x, y, c, k = 1) {
  const lt = tone(c, 0.65), dk = tone(c, -0.6);
  const X = (v) => f1(x + v * k), Y = (v) => f1(y + v * k);
  let s = '';
  s += part(ell(X(-5), Y(-2.6), 4.6 * k, 3.4 * k), c, { w: 1.5 }) + part(ell(X(5), Y(-2.6), 4.6 * k, 3.4 * k), c, { w: 1.5 });
  s += part(rotEll(X(-9.5), Y(-13), 3.4 * k, 5.6 * k, 28), c, { w: 1.5 }) + part(rotEll(X(9.5), Y(-13), 3.4 * k, 5.6 * k, -28), c, { w: 1.5 });
  s += part(ell(X(0), Y(-10), 9.5 * k, 10 * k), c, { w: 1.7 });
  s += flat(ell(X(0), Y(-9), 5.6 * k, 6.2 * k), lt);
  s += part(circ(X(-7.4), Y(-31), 4 * k), c, { w: 1.5 }) + part(circ(X(7.4), Y(-31), 4 * k), c, { w: 1.5 });
  s += flat(circ(X(-7.4), Y(-31), 1.8 * k) + circ(X(7.4), Y(-31), 1.8 * k), dk);
  s += part(ell(X(0), Y(-24), 10 * k, 9 * k), c, { w: 1.8 });
  s += flat(ell(X(0), Y(-20.5), 4.6 * k, 3.4 * k), lt);
  s += flat(rr(X(-5.2), Y(-27), 2.6 * k, 2.8 * k, 1) + rr(X(2.6), Y(-27), 2.6 * k, 2.8 * k, 1), '#3A2A3E');
  s += flat(rr(X(-1.4), Y(-22.4), 2.8 * k, 2 * k, 1), dk);
  return s + shine(ell(X(-5), Y(-28.5), 2 * k, 2.6 * k), 0.9) + shine(ell(X(-5), Y(-13), 1.6 * k, 2.8 * k), 0.7);
}

const osito = (c, k = 1) => def(`osito-${c}-${k}`, () => ({ box: [-15 * k, -37 * k, 15 * k, 4], svg: ositoSvg(0, 0, c, k), shadow: [0, 1, 10 * k, 2.8] }));

// Galleta con chispas, acostada (dorada, con borde de luz).
function cookieSvg(x, y, r, c = '#D99A55') {
  const ry = r * 0.5, th = 4;
  let s = face(`M${x - r} ${y - th}L${x - r} ${y}A${r} ${ry} 0 0 0 ${x + r} ${y}L${x + r} ${y - th}Z`, '#B47236', { w: 1.6 });
  const top = fluffD(x, y - th, r, 9, 0.07, 0.2).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, a, b) => `${a} ${f1(y - th + (parseFloat(b) - (y - th)) * 0.5)}`);
  s += part(top, c, { w: 1.6 });
  s += flat(ell(x - r * 0.12, y - th - ry * 0.12, r * 0.72, ry * 0.68), tone(c, 0.35));
  const ch = [[-0.45, -0.05], [0.1, -0.45], [0.42, 0.1], [-0.1, 0.32], [0.55, -0.35], [-0.5, -0.5]];
  s += flat(ch.map(([a, b]) => rr(f1(x + a * r - 2), f1(y - th + b * ry - 1.5), 4, 3, 1)).join(''), '#5B3325');
  return s + shine(ell(x - r * 0.42, y - th - ry * 0.48, r * 0.16, ry * 0.16), 0.7);
}

// Bombones en su pirotín plisado.
function bombonSvg(x, y, c = '#7B4A33', cup = '#F7A8C0') {
  let s = face(`M${x - 8} ${y - 8}L${x - 6.5} ${y}H${x + 6.5}L${x + 8} ${y - 8}Z`, cup, { w: 1.5 });
  s += line(`M${x - 4} ${y - 7.5}L${x - 3.4} ${y - 0.5}M${x} ${y - 7.5}V${y - 0.5}M${x + 4} ${y - 7.5}L${x + 3.4} ${y - 0.5}`, tone(cup, -0.8), 1.3, { opacity: 0.8 });
  s += part(`M${x - 8} ${y - 7}C${x - 8} ${y - 18} ${x + 8} ${y - 18} ${x + 8} ${y - 7}Z`, c, { w: 1.6 });
  s += line(`M${x - 5} ${y - 11}q2.5 -3 5 0q2.5 3 5 0`, c === '#FFF4E4' ? '#9C6446' : '#FFF4E4', 1.8);
  return s + shine(ell(x - 3.6, y - 13.6, 1.6, 1.1), 0.85);
}

function bombones(id, list) {
  return def(`bombones-${id}`, () => {
    const l = list.slice().sort((a, b) => a[1] - b[1]);
    let s = '';
    l.forEach(([x, y, c, cup]) => { s += bombonSvg(x, y, c, cup); });
    const xs = l.map((b) => b[0]);
    return { box: [Math.min(...xs) - 10, -20 + Math.min(...l.map((b) => b[1])), Math.max(...xs) + 10, Math.max(...l.map((b) => b[1])) + 4], svg: s, shadows: l.map(([x, y]) => [x, y + 1, 7, 2]) };
  });
}

// Barquillo enrollado tirado (como un tronco).
function waferLogSvg(x, y, len, r = 6) {
  let s = face(rr(x - len / 2, y - 2 * r, len, 2 * r, r), '#EDBE72', { w: 1.6 });
  let st = '';
  for (let i = x - len / 2 + 4; i < x + len / 2 - 6; i += 7) st += poly([[i, y], [i + 4, y - 2 * r], [i + 6.5, y - 2 * r], [i + 2.5, y]]);
  s += flat(st, '#D49A4E');
  s += part(ell(x + len / 2 - r * 0.5, y - r, r * 0.55, r), '#F6D79A', { w: 1.5 }) + flat(ell(x + len / 2 - r * 0.5, y - r, r * 0.28, r * 0.5), '#7B4A33');
  return s + shine(rr(x - len / 2 + 4, y - 2 * r + 2, len - 14, 2, 1), 0.6);
}

// Farol de caramelo: poste a rayas y una gomita que alumbra.
function candyLamp(c = GOL.lemon) {
  return def(`farol-${c}`, () => {
    let s = part(rr(-2.5, -40, 5, 40, 2), '#FFF6F1', { w: 1.5 });
    let st = '';
    for (let y = -4; y > -38; y -= 8) st += poly([[-2.5, y + 2.5], [2.5, y - 2.5], [2.5, y - 5.5], [-2.5, y - 0.5]]);
    s += flat(st, GOL.pink);
    s += part(rr(-6, -44, 12, 5, 2), '#B37AE0', { w: 1.5 });
    s += gomitaSvg(0, -44, 8, c);
    s += part(rr(-5, -2, 10, 4, 1.5), '#B37AE0', { w: 1.4 });
    return { box: [-10, -58, 10, 4], svg: s, shadow: [0, 1, 6, 2] };
  });
}

// Buzón de caramelo (al lado de una casita).
function candyMailbox(c = GOL.red) {
  return def(`buzon-${c}`, () => {
    let s = part(rr(-2, -22, 4, 22, 1.5), '#C98A5E', { w: 1.4 });
    s += part(rrTop(-8, -32, 16, 12, 6), c, { w: 1.6 }) + flat(rr(-8, -24, 16, 2, 0), tone(c, -0.6));
    s += part(rr(6, -36, 2.5, 10, 1), GOL.lemon, { w: 1.2 }) + part(rr(8, -36, 6, 4, 1), GOL.lemon, { w: 1.2 });
    s += part(`M-4 -31L4 -31L0 -27Z`, '#FFFFFF', { w: 1.1 });
    return { box: [-10, -38, 16, 3], svg: s, shadow: [0, 1, 6, 2] };
  });
}

// Chupetín de torta (cake pop): bola bañada con chispas y un hilo de glaseado.
function cakePop(h, R, coat, drizzle) {
  return def(`cakepop-${h}-${R}-${coat}-${drizzle}`, () => {
    const cy = -h - R + 4;
    let s = part(rr(-2.5, -h - 2, 5, h + 2, 2), '#FFF6F1', { w: 1.5 });
    s += part(circ(0, cy, R), coat, { w: 2 });
    s += flat(`M${f1(-R * 0.98)} ${f1(cy + R * 0.1)}A${R} ${R} 0 0 0 ${f1(R * 0.98)} ${f1(cy + R * 0.1)}A${R} ${f1(R * 0.7)} 0 0 1 ${f1(-R * 0.98)} ${f1(cy + R * 0.1)}Z`, tone(coat, -0.6));
    let zz = `M${f1(-R * 0.8)} ${f1(cy - R * 0.25)}`;
    for (let i = 1; i <= 6; i++) zz += `L${f1(-R * 0.8 + (i * R * 1.6) / 6)} ${f1(cy - R * 0.25 + (i % 2 ? -R * 0.32 : R * 0.12) + Math.abs(i - 3) * 0.8)}`;
    s += line(zz, drizzle, 2.4);
    const sp = [[-0.35, -0.65, 30, GOL.lemon], [0.3, -0.6, -40, GOL.sky], [0.55, 0.05, 50, GOL.mint], [-0.55, 0.2, -20, '#FFFFFF'], [0.05, 0.45, 70, GOL.pink]];
    sp.forEach(([a, b, ang, col]) => { const px = f1(a * R), py = f1(cy + b * R); s += flat(rr(px - 2.6, py - 1.1, 5.2, 2.2, 1), col, { transform: `rotate(${ang} ${px} ${py})` }); });
    s += shine(ell(-R * 0.42, cy - R * 0.45, R * 0.2, R * 0.14), 0.85);
    s += flat(tuftD(-4, 1, 0.6) + tuftD(4, 1, 0.5), '#C9A066');
    return { box: [-R - 2, cy - R - 2, R + 2, 4], svg: s, shadow: [0, 1, R * 0.5, 3], solid: [[-R, cy - R, R, cy + R], [-5, cy + R, 5, 2]] };
  });
}

// Estanque de soda con bordes de pasto, nenúfares de menta y ositos.
function sodaPond(w) {
  return def(`estanque-${w}`, () => {
    const rx = w / 2, ry = Math.round(rx * 0.42), cy = -ry - 6;
    let s = '';
    // juncos de regaliz atrás a la izquierda
    for (const [x, h] of [[-rx * 0.78, 22], [-rx * 0.66, 30], [-rx * 0.54, 18]]) {
      s += line(`M${f1(x)} ${f1(cy - ry * 0.5)}V${f1(cy - ry * 0.5 - h)}`, '#5E8C4A', 2.6);
      s += part(rr(f1(x - 3), f1(cy - ry * 0.5 - h - 8), 6, 11, 3), '#7A4A9E', { w: 1.4 });
    }
    // nenúfares de menta sobre el agua
    for (const [x, y, r] of [[-rx * 0.25, cy + 2, 7], [rx * 0.3, cy - ry * 0.25, 6]]) {
      s += part(`M${f1(x)} ${f1(y)}L${f1(x + r)} ${f1(y - 1)}A${r} ${f1(r * 0.5)} 0 1 1 ${f1(x + r * 0.7)} ${f1(y + r * 0.36)}Z`, '#7FD3A0', { w: 1.4 });
    }
    s += part(circ(f1(-rx * 0.25 - 1), f1(cy - 2), 2.8), GOL.pink, { w: 1.2 });
    // ositos en la orilla de adelante
    s += ositoSvg(rx * 0.58, 4, GOL.red);
    s += ositoSvg(rx * 0.92, 8, GOL.lemon, 0.8);
    return {
      box: [-rx - 4, cy - ry - 44, rx + 18, 12], svg: s,
      shadows: [[rx * 0.58, 5, 9, 2.6], [rx * 0.92, 9, 7, 2.2]],
      solid: [[-rx - 2, cy - ry - 4, rx + 16, 10]],
      ground: (S, x, y) => {
        const c = y + cy, y0 = c - ry - 6, y1 = c + ry + 6;
        G.flat(S, L_WATER, '#83C383', ell(x, c, rx, ry), y0, y1);
        G.flat(S, L_WATER + 1, '#5FB2E0', ell(x, c + 2.5, rx - 3, ry - 3), y0, y1);
        G.flat(S, L_WATER + 2, '#93D7F4', ell(x, c + 4.5, rx - 4, ry - 4.5), y0, y1);
        G.line(S, L_WATER + 4, '#FFFFFF', 2, `M${f1(x - rx * 0.5)} ${f1(c + 3)}h10M${f1(x + rx * 0.05)} ${f1(c + ry * 0.45)}h8M${f1(x - rx * 0.15)} ${f1(c - ry * 0.2)}h6`, y0, y1, 0.9);
        G.flat(S, L_WATER + 5, '#FFFFFF', circ(x + rx * 0.45, c + 2, 1.6) + circ(x + rx * 0.52, c - 2, 1.2) + circ(x - rx * 0.4, c - ry * 0.3, 1.4), y0, y1);
        G.line(S, L_WATER + 6, GOL.grassLt, 2.4, `M${f1(x - rx + 3)} ${f1(c + 3)}Q${f1(x)} ${f1(c + ry * 2.2)} ${f1(x + rx - 3)} ${f1(c + 3)}`, y0, y1);
      },
    };
  });
}

// Arboleda: 2–3 chupetes de alturas distintas y cosas al pie.
function lollipopGrove(id, trees, extra = []) {
  return def(`arboleda-${id}`, () => {
    let s = '', x0 = 0, x1 = 0, y0 = 0, y1 = 0;
    const shadows = [], solid = [];
    const items = [...trees.map((t) => ({ y: t[1], t })), ...extra.map((e) => ({ y: e[2], e }))].sort((a, b) => a.y - b.y);
    items.forEach(({ t, e }) => {
      if (t) {
        const [x, y, h, R, c, c2, bow] = t;
        const p = pirulo(h, R, c, c2, bow);
        s += at(x, y, p.svg);
        x0 = Math.min(x0, x + p.box[0]); x1 = Math.max(x1, x + p.box[2]); y0 = Math.min(y0, y + p.box[1]); y1 = Math.max(y1, y + 4);
        shadows.push([x, y + 1, R * 0.5, 3.5]);
        p.solid.forEach(([a, b, c3, d]) => solid.push([x + a, y + b, x + c3, y + d]));
      } else {
        const [kind, ex, ey, a, b] = e;
        if (kind === 'g') { s += gomitaSvg(ex, ey, a, b); shadows.push([ex, ey + 1, a * 0.95, a * 0.28]); x0 = Math.min(x0, ex - a); x1 = Math.max(x1, ex + a); solid.push([ex - a, ey - a * 1.3, ex + a, ey + 2]); }
        if (kind === 'm') { s += mentaSvg(ex, ey, a); shadows.push([ex, ey + 1, a, a * 0.32]); x0 = Math.min(x0, ex - a); x1 = Math.max(x1, ex + a); solid.push([ex - a, ey - 10, ex + a, ey + 2]); }
        if (kind === 'o') { s += ositoSvg(ex, ey, a); shadows.push([ex, ey + 1, 9, 2.6]); x0 = Math.min(x0, ex - 13); x1 = Math.max(x1, ex + 13); solid.push([ex - 12, ey - 32, ex + 12, ey + 2]); }
        if (kind === 'f') { s += candyFlower(ex, ey, a, b); shadows.push([ex, ey + 1, 5, 1.8]); x0 = Math.min(x0, ex - 11); x1 = Math.max(x1, ex + 11); solid.push([ex - 9, ey - a - 9, ex + 9, ey + 2]); }
        if (kind === 'c') { s += cookieSvg(ex, ey, a); shadows.push([ex, ey + 1, a, a * 0.3]); x0 = Math.min(x0, ex - a); x1 = Math.max(x1, ex + a); solid.push([ex - a, ey - 10, ex + a, ey + 2]); }
        y1 = Math.max(y1, ey + 4);
      }
    });
    return { box: [x0 - 2, y0, x1 + 2, y1 + 4], svg: s, shadows, solid };
  });
}

function lollyClump(v, kind = 'pirulo') {
  const R = rng(v * 131 + 7);
  const items = [];
  const n = 3;
  for (let i = 0; i < n; i++) {
    const x = Math.round((i - 1) * 26 + (R() - 0.5) * 8);
    const y = Math.round((i === 1 ? 14 : 0) + R() * 8);
    const h = Math.round(38 + R() * 30), r = Math.round(16 + R() * 9);
    if (kind === 'cakepop' && i !== 1) {
      const coat = ['#7B4A33', '#F7A8C0', '#FFF4E4', '#9C6446'][Math.floor(R() * 4)];
      items.push([cakePop(h - 6, r - 3, coat, coat === '#FFF4E4' ? GOL.pink : '#FFFFFF'), x, y]);
    } else {
      const [c, c2] = kind === 'cakepop' ? [['#9C6446', '#FFE9C8'], [GOL.orange, '#FFFFFF']][Math.floor(R() * 2)] : LOLLY_PAL[Math.floor(R() * LOLLY_PAL.length)];
      items.push([pirulo(h, r, c, c2, R() < 0.35 ? GUM_PAL[Math.floor(R() * 6)] : null), x, y]);
    }
  }
  const g1 = GUM_PAL[Math.floor(R() * 6)], g2 = GUM_PAL[Math.floor(R() * 6)];
  items.push([gomitas(`cl${v}`, [[0, 0, Math.round(9 + R() * 3), g1], [15, 5, 7, g2]]), Math.round(-12 + R() * 24), 26]);
  return group(`mata-${kind}-${v}`, items);
}

// Casita cupcake: pirotín de paredes, techo de crema, ventanas.
function cupcakeHouse(c, liner, door) {
  return def(`cupcasa-${c}-${liner}-${door}`, () => {
    const lm = tone(liner, -0.7);
    let s = '';
    s += face(`M-23 0L-27 -36L27 -36L23 0A23 5 0 0 1 -23 0Z`, liner, { w: 2 });
    let pl = '';
    for (let x = -18; x <= 18; x += 6) pl += `M${x} 2.5L${f1(x * 1.16)} -34`;
    s += line(pl, lm, 1.6, { opacity: 0.75 });
    s += tonePath(`M14 -36L27 -36L23 0A23 5 0 0 1 12 3.5Z`, lm, 0.25);
    // puerta y escalón
    s += face(rrTop(-7.5, -23, 15, 23, 7.5), door, { w: 1.8 }) + line('M0 -21V-1', tone(door, -0.8), 1.4) + flat(circ(3.8, -10, 1.4), '#FFE08A');
    s += face(rr(-10, 0, 20, 3.2, 1.2), tone(liner, -0.3), { w: 1.4 });
    // ventanas redondas con marco blanco y vidrio
    for (const wx of [-17, 17]) {
      s += face(circ(wx, -21, 5.8), '#FFFFFF', { w: 1.7 }) + flat(circ(wx, -21, 3.8), '#BFE4FA') + line(`M${wx - 3.8} -21H${wx + 3.8}M${wx} -24.8V-17.2`, '#FFFFFF', 1.6) + shine(rr(wx - 3, -24, 2, 2, 0.5), 0.9);
      s += face(rr(wx - 6, -15, 12, 4, 1.5), '#C98A5E', { w: 1.4 }) + flat(circ(wx - 3, -16, 1.8) + circ(wx + 2.5, -16.5, 1.8), GOL.red);
    }
    // techo de crema con chorreado
    const drip = (y, hw) => {
      let d = `M${-hw} ${y - 2}`;
      const n = 6;
      for (let i = 0; i < n; i++) {
        const xa = -hw + (i * 2 * hw) / n, xb = -hw + ((i + 1) * 2 * hw) / n, xm = (xa + xb) / 2;
        const dep = i % 2 ? 4 : 8;
        d += `Q${f1(xa)} ${f1(y + dep)} ${f1(xm)} ${f1(y + dep)}Q${f1(xb)} ${f1(y + dep)} ${f1(xb)} ${y - 2}`;
      }
      return d;
    };
    s += part(`${drip(-36, 31)}C33 -52 -33 -52 -31 -38Z`, c, { w: 2 });
    s += part('M-24 -46C-26 -58 26 -58 24 -46C20 -42 -20 -42 -24 -46Z', tone(c, 0.35), { w: 1.8 });
    s += part('M-15 -55C-16 -66 16 -66 15 -55C12 -52 -12 -52 -15 -55Z', tone(c, 0.6), { w: 1.7 });
    s += part('M-7 -63C-6 -72 6 -72 7 -63C4 -61 -4 -61 -7 -63Z', tone(c, 0.85), { w: 1.6 });
    s += shine('M-22 -44C-22 -50 -14 -53 -6 -53C-14 -50 -18 -48 -22 -44Z', 0.7);
    const sp = [[-20, -40, 30, GOL.lemon], [-6, -42, -30, GOL.sky], [12, -41, 40, GOL.mint], [22, -39, -20, '#FFFFFF'], [-10, -51, 60, GOL.red], [8, -52, -45, GOL.lilac], [0, -59, 10, GOL.lemon]];
    sp.forEach(([x, y, a, col]) => { s += flat(rr(x - 3, y - 1.2, 6, 2.6, 1.2), col, { transform: `rotate(${a} ${x} ${y})` }); });
    s += line('M2 -75Q4 -82 9 -84', '#5E8C4A', 2);
    s += part(circ(0, -73, 5.4), GOL.red, { w: 1.7 }) + shine(circ(-1.8, -75, 1.5), 0.95);
    return { box: [-34, -86, 34, 6], svg: s, shadow: [0, 1, 26, 5] };
  });
}

// Molino de galleta: torre de jengibre con glasé, techo de crema y aspas de
// barquillo.
function cookieMill() {
  return def('molino', () => {
    const body = '#C98A4E', icing = '#FFFFFF';
    let s = '';
    s += face('M-20 0L-15 -58H15L20 0Z', body, { w: 2 });
    s += tonePath('M8 -58H15L20 0H11Z', '#6B3D22', 0.25);
    s += line('M-18 -14Q-9 -10 0 -14Q9 -10 18 -14M-16 -36Q-8 -32 0 -36Q8 -32 16 -36', icing, 2.4);
    s += flat(rr(-12, -26, 3, 3, 1) + rr(9, -48, 3, 3, 1) + rr(6, -22, 3, 3, 1) + rr(-9, -50, 3, 3, 1), '#FF8FB0');
    s += face(rrTop(-6, -14, 12, 14, 6), '#9C6446', { w: 1.7 }) + line('M0 -12V-1', '#7B4A33', 1.3);
    s += face(circ(0, -27, 4.6), icing, { w: 1.5 }) + flat(circ(0, -27, 3), '#BFE4FA') + line('M-3 -27H3M0 -30V-24', icing, 1.3);
    // techo de crema
    s += part('M-21 -56Q-22 -64 -12 -74Q0 -84 12 -74Q22 -64 21 -56Q14 -50 10 -56Q4 -50 0 -56Q-4 -50 -10 -56Q-14 -50 -21 -56Z', '#FFC4D8', { w: 1.9 });
    s += shine('M-14 -64Q-10 -72 -2 -76Q-8 -70 -12 -62Z', 0.7);
    // aspas de barquillo en X (diagonales limpias)
    const hub = [0, -62];
    const blade = (ang) => {
      const a = (ang * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      const P = (u, v) => [hub[0] + u * ca - v * sa, hub[1] + u * sa + v * ca];
      let b = part(poly([P(6, -6), P(40, -6), P(40, 6), P(6, 6)]), '#F3C982', { w: 1.6 });
      let g = '';
      for (let u = 13; u < 40; u += 7) { const [x1, y1] = P(u, -6), [x2, y2] = P(u, 6); g += `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`; }
      const [xa, ya] = P(6, 0), [xb, yb] = P(40, 0);
      g += `M${f1(xa)} ${f1(ya)}L${f1(xb)} ${f1(yb)}`;
      b += line(g, '#D9A55A', 1.4, { opacity: 0.9 });
      return b;
    };
    s += blade(-135) + blade(-45) + blade(45) + blade(135);
    s += part(circ(hub[0], hub[1], 6), GOL.red, { w: 1.6 }) + flat(circ(hub[0], hub[1], 2.6), '#FFFFFF') + shine(circ(hub[0] - 2, hub[1] - 2, 1.2), 0.9);
    return { box: [-44, -106, 44, 4], svg: s, shadow: [0, 1, 22, 4], solid: [[-40, -102, 40, 2]] };
  });
}

// La cortina de una cascada de chocolate: angosta arriba, ancha abajo,
// bordes ondulados, vetas claras irregulares y espuma donde cae.
function chocoCurtain(top, w0, w1) {
  const L = [], Rr = [];
  for (let y = top; y <= -2; y += 3) {
    const t = (y - top) / (-2 - top);
    L.push([-(w0 + (w1 - w0) * t * t) + Math.sin(y * 0.42) * 1.8, y]);
    Rr.push([w0 + (w1 - w0) * t * t + Math.sin(y * 0.37 + 1.3) * 1.8, y]);
  }
  let s = face(poly([...L, ...Rr.reverse()]), '#8C5638', { w: 2 });
  // el labio donde el chocolate se curva sobre el borde
  s += flat(`M${-w0 - 1} ${top}Q0 ${top - 5} ${w0 + 1} ${top}V${top + 5}Q0 ${top + 9} ${-w0 - 1} ${top + 5}Z`, '#B57A52');
  const H = -2 - top;
  const st = [[-0.62, 0.12, 0.7], [-0.25, 0.05, 0.55], [0.12, 0.2, 0.95], [0.5, 0.1, 0.62], [-0.45, 0.5, 0.95], [0.32, 0.55, 0.9]];
  let d = '';
  st.forEach(([k, a, b]) => {
    const ya = top + 6 + a * H, yb = top + b * H;
    const wa = w0 + (w1 - w0) * a * a, wb = w0 + (w1 - w0) * b * b;
    d += `M${f1(k * wa)} ${f1(ya)}Q${f1(k * (wa + wb) * 0.5 + 1)} ${f1((ya + yb) / 2)} ${f1(k * wb)} ${f1(yb)}`;
  });
  s += line(d, '#C48C62', 2.4, { opacity: 0.95 });
  s += line(`M${f1(-w0 * 0.05)} ${top + 10}Q${f1(-w0 * 0.2)} ${f1(top + H * 0.4)} ${f1(-w1 * 0.08)} ${f1(top + H * 0.75)}M${f1(w0 * 0.75)} ${top + 14}Q${f1(w0 * 0.8)} ${f1(top + H * 0.45)} ${f1(w1 * 0.72)} ${f1(top + H * 0.8)}`, '#6A3B26', 2, { opacity: 0.6 });
  s += shine(`M${f1(-w0 * 0.55)} ${top + 7}h3l-1 ${f1(H * 0.35)}h-3Z`, 0.55);
  // espuma, rocío y gotitas
  s += part(puffD(-w1 - 14, w1 + 14, 5, [[-w1 - 4, 7], [-w1 * 0.45, 10], [0, 12], [w1 * 0.45, 10], [w1 + 4, 7]]), '#FFF8F0', { w: 1.8 });
  s += flat(puffD(-w1 - 6, w1 + 6, 5, [[-w1 * 0.6, 5], [w1 * 0.1, 7], [w1 * 0.7, 5]]), '#FFFFFF');
  s += flat(circ(-w1 - 10, -14, 2) + circ(w1 + 9, -17, 2.2) + circ(-w1 - 4, -21, 1.6) + circ(w1 + 3, -24, 1.4), '#FFFFFF');
  s += part(circ(-w1 - 16, -9, 2.2), '#8C5638', { w: 1.2 }) + part(circ(w1 + 15, -11, 2), '#8C5638', { w: 1.2 });
  return s;
}

// Acantilado de torta de vainilla y frutilla con cascada de chocolate (la
// cascada cae en y=0). El bizcocho es claro para que el chocolate se lea.
function chocoFalls() {
  return def('cascada', () => {
    const w = 140, top = -54, depth = 20;
    const sponge = '#F4D49A', spongeDk = '#E2B36C';
    let s = '';
    s += face(`M${-w / 2} ${top + 2}V${top - depth + 8}Q${-w / 2} ${top - depth} ${-w / 2 + 10} ${top - depth}Q${-w / 4} ${top - depth - 6} 0 ${top - depth}Q${w / 4} ${top - depth - 5} ${w / 2 - 10} ${top - depth}Q${w / 2} ${top - depth} ${w / 2} ${top - depth + 8}V${top + 2}Z`, '#FFD3E0', { w: 2 });
    s += flat(ell(-34, top - depth / 2 - 2, 16, 4) + ell(38, top - depth / 2, 12, 3.4), '#FFE6EE');
    // el arroyo de chocolate que corre por arriba hacia el borde
    s += face(`M-9 ${top - depth - 3}Q-15 ${top - depth / 2} -13 ${top + 1}H13Q15 ${top - depth / 2} 9 ${top - depth - 3}Z`, '#8C5638', { w: 1.8 });
    s += line(`M-3 ${top - depth + 2}q3 5 0 10M4 ${top - depth + 1}q-3 6 1 12`, '#C48C62', 2, { opacity: 0.9 });
    // frente en capas: bizcocho, crema, mermelada
    s += face(`M${-w / 2} ${top}H${w / 2}V-6Q${w / 2} 0 ${w / 2 - 8} 0H${-w / 2 + 8}Q${-w / 2} 0 ${-w / 2} -6Z`, sponge, { w: 2 });
    s += flat(rr(-w / 2 + 1, top + 16, w - 2, 7, 0), '#FFFFFF');
    s += flat(rr(-w / 2 + 1, top + 23, w - 2, 3, 0), '#F27C98');
    s += flat(rr(-w / 2 + 1, top + 38, w - 2, 6, 0), '#FFFFFF');
    let cr = '';
    for (const [x, y] of [[-58, 8], [-40, 5], [-28, 11], [26, 7], [40, 11], [56, 6], [-52, 31], [-36, 29], [34, 31], [52, 30], [-46, 49], [44, 50], [-26, 48], [24, 47]]) cr += rr(x - 2, top + y - 1.5, 4, 3, 1);
    s += flat(cr, spongeDk);
    s += tonePath(`M${w / 2 - 22} ${top}H${w / 2}V-6Q${w / 2} 0 ${w / 2 - 8} 0H${w / 2 - 22}Z`, '#8A5A3C', 0.22);
    // glaseado que chorrea por el borde (menos donde cae el chocolate)
    let dr = `M${-w / 2} ${top - 3}`;
    for (let x = -w / 2; x < w / 2 - 1; x += 11) {
      if (x > -22 && x < 14) { dr += `L${x + 11} ${top - 1}`; continue; }
      const dep = [7, 4, 10, 5, 8, 3][Math.abs(Math.round(x / 11)) % 6];
      dr += `L${f1(x + 2)} ${top - 1}Q${f1(x + 2)} ${top + dep} ${f1(x + 5.5)} ${top + dep}Q${f1(x + 9)} ${top + dep} ${f1(x + 9)} ${top - 1}`;
    }
    dr += `L${w / 2} ${top - 3}L${w / 2} ${top - 6}L${-w / 2} ${top - 6}Z`;
    s += part(dr, '#FFC0D3', { w: 1.6 });
    s += chocoCurtain(top, 12, 26);
    // frutillas, cerezas y una vela arriba
    s += part(circ(-46, top - 12, 5), GOL.red, { w: 1.6 }) + shine(circ(-47.6, top - 13.6, 1.4), 0.9) + line(`M-46 ${top - 16}q2 -6 7 -7`, '#5E8C4A', 1.8);
    s += part(circ(50, top - 9, 5), GOL.red, { w: 1.6 }) + shine(circ(48.4, top - 10.6, 1.4), 0.9) + line(`M50 ${top - 13}q2 -6 7 -7`, '#5E8C4A', 1.8);
    s += part(`M32 ${top - 20}C26 ${top - 20} 27 ${top - 9} 33 ${top - 7}C39 ${top - 9} 39 ${top - 20} 32 ${top - 20}Z`, '#F0485E', { w: 1.5 }) + part(`M28 ${top - 20}L32 ${top - 24}L36 ${top - 20}Z`, '#5DAE6C', { w: 1.2 }) + flat(rr(30, top - 15, 1.6, 1.6, 0.4) + rr(34, top - 13, 1.6, 1.6, 0.4), '#FFE08A');
    s += part(rr(-34, top - 30, 6, 18, 2), '#9BD3F2', { w: 1.5 }) + flat(poly([[-34, top - 22], [-28, top - 26], [-28, top - 23], [-34, top - 19]]), '#FFFFFF') + part(`M-31 ${top - 32}Q-27 ${top - 37} -31 ${top - 42}Q-35 ${top - 37} -31 ${top - 32}Z`, '#FFC94A', { w: 1.3 });
    return { box: [-w / 2 - 2, top - depth - 50, w / 2 + 2, 14], svg: s, solid: [[-w / 2, top - depth - 8, w / 2, 10]] };
  });
}

// Puente de barquillo: tablero a cuadritos con alfombra, barandas de
// caramelo. Va de y=-len (orilla de atrás) a y=0 (orilla de adelante).
function waferBridge(len) {
  return def(`puente-${len}`, () => {
    const hw = 18;
    let s = '';
    s += face(rr(-hw, -2, hw * 2, 8, 1.5), '#D9A55A', { w: 1.8 });
    s += flat(rr(-hw + 1, 1, hw * 2 - 2, 2, 0), '#FFF1DA');
    s += face(rr(-hw, -len, hw * 2, len, 2), '#F3C982', { w: 1.8 });
    let gr = '';
    for (let x = -hw + 6; x < hw; x += 6) gr += `M${x} ${-len + 2}V-3`;
    for (let y = -len + 6; y < -2; y += 6) gr += `M${-hw + 2} ${y}H${hw - 2}`;
    s += line(gr, '#DBA65E', 1.4, { opacity: 0.85 });
    s += flat(rr(-10, -len + 1, 20, len - 2, 0), GOL.road);
    s += flat(rr(-10, -len + 1, 3, len - 2, 0), GOL.roadLt);
    s += flat(rr(-10, -len + 1, 20, 3, 0) + rr(-10, -4, 20, 3, 0), GOL.roadEdge);
    for (const sx of [-1, 1]) {
      const x = sx * (hw - 1);
      const ys = [-len + 2, -len / 2 + 1, 0];
      ys.forEach((y) => { s += part(rr(x - 3, y - 12, 6, 12, 2), '#FFF6F1', { w: 1.5 }) + flat(poly([[x - 3, y - 4], [x + 3, y - 8], [x + 3, y - 5], [x - 3, y - 1]]), GOL.red); });
      s += part(rr(x - 2.5, -len - 14, 5, len + 4, 2.5), sx < 0 ? GOL.pink : '#FFB0C8', { w: 1.5 });
      ys.forEach((y) => { s += part(circ(x, y - 13, 3.8), sx < 0 ? GOL.mint : GOL.lemon, { w: 1.4 }) + shine(circ(x - 1, y - 14, 1), 0.9); });
    }
    return { box: [-hw - 6, -len - 20, hw + 6, 10], svg: s, shadow: [hw + 5, -len / 2 + 2, 6, len / 2 - 4] };
  });
}

// El río de chocolate: nace en una poza bajo la cascada y sale por el borde.
function chocoRiver(S, yr, xFall, toRight) {
  const W = S.W;
  const up = (x) => yr - 15 + Math.sin(x / 40 + 0.7) * 3;
  const dn = (x) => yr + 15 + Math.sin(x / 46 + 2.1) * 3;
  const xs = [];
  const xa = toRight ? xFall : -14, xb = toRight ? W + 14 : xFall;
  for (let x = xa; x <= xb; x += 6) xs.push(x);
  if (xs[xs.length - 1] !== xb) xs.push(xb);
  const y0 = yr - 34, y1 = yr + 30;
  const pool = (k, dy = 0) => ell(xFall, yr + 2 + dy, 34 - k, 19 - k * 0.6);
  // la barranca de atrás (se ve su cara de tierra)
  G.flat(S, L_WATER, '#D9AE74', poly([...xs.map((x) => [x, up(x) - 8]), ...xs.slice().reverse().map((x) => [x, up(x) + 2])]) + pool(-3, -6), y0, y1);
  G.flat(S, L_WATER + 1, '#C2925A', poly([...xs.map((x) => [x, up(x) - 3]), ...xs.slice().reverse().map((x) => [x, up(x) + 2])]) + pool(-1, -3), y0, y1);
  // el agua: base, sombra de la barranca, ondas y brillos
  G.flat(S, L_WATER + 2, GOL.choc, poly([...xs.map((x) => [x, up(x)]), ...xs.slice().reverse().map((x) => [x, dn(x)])]) + pool(0), y0, y1);
  G.flat(S, L_WATER + 3, GOL.chocDp, poly([...xs.map((x) => [x, up(x)]), ...xs.slice().reverse().map((x) => [x, up(x) + 5])]), y0, y1);
  let wv = '';
  for (let x = xa + 10; x < xb - 12; x += 22) { const y = yr + (Math.round(x / 22) % 2 ? 6 : -1); wv += `M${f1(x)} ${f1(y)}q4 3 8 0`; }
  wv += `M${xFall - 22} ${yr + 6}q5 4 10 0M${xFall + 8} ${yr + 9}q5 4 10 0M${xFall - 6} ${yr + 13}q4 3 8 0`;
  G.line(S, L_WATER + 4, GOL.chocLt, 2.4, wv, y0, y1);
  let hi = '';
  for (let x = xa + 26; x < xb - 14; x += 48) hi += `M${f1(x)} ${f1(yr + 10)}h5`;
  G.line(S, L_WATER + 5, GOL.chocHi, 2.2, hi, y0, y1);
  // malvaviscos flotando
  [[0.18, -1], [0.48, 6], [0.78, -3]].forEach(([t, dy]) => {
    const x = f1(xa + 14 + t * (xb - xa - 28)), y = f1(yr + dy);
    if (S.onRoad(x, y, 14) || Math.abs(x - xFall) < 40) return;
    G.flat(S, L_WATER + 6, '#E9D7CF', rr(x - 5, y - 2, 10, 6, 2.5), y - 5, y + 5);
    G.flat(S, L_WATER + 7, '#FFFFFF', rr(x - 5, y - 4, 10, 5, 2.5), y - 5, y + 5);
    G.flat(S, L_WATER + 8, '#FFC9DA', rr(x - 2, y - 3, 4, 2, 1), y - 5, y + 5);
    G.line(S, L_WATER + 9, GOL.chocLt, 2, `M${f1(x - 8)} ${f1(y + 4)}q8 3 16 0`, y - 5, y + 8);
  });
  // la orilla de adelante: borde de luz
  G.line(S, L_WATER + 10, GOL.caramelLt, 2.6, `M${xs.map((x) => `${x} ${f1(dn(x) + 1)}`).join('L')}`, y0, y1);
  G.line(S, L_WATER + 10, GOL.caramelLt, 2.6, `M${xFall - 32} ${yr + 6}Q${xFall} ${yr + 30} ${xFall + 32} ${yr + 6}`, y0, y1);
}

// Árbol de algodón de azúcar: palito de papel a rayas y copa esponjosa.
function cottonTree(h, R, c, c2) {
  return def(`algodon-${h}-${R}-${c}-${c2}`, () => {
    const cy = -h - R * 0.8;
    let s = part(rr(-2.6, -h - 4, 5.2, h + 4, 2), '#FFFFFF', { w: 1.5 });
    let st = '';
    for (let y = -4; y > -h + 2; y -= 8) st += poly([[-2.6, y + 2.6], [2.6, y - 2.6], [2.6, y - 5.6], [-2.6, y - 0.4]]);
    s += flat(st, GOL.sky);
    s += part(fluffD(0, cy, R, 7, 0.14, 0.3), c, { w: 2 });
    s += flat(fluffD(R * 0.28, cy + R * 0.18, R * 0.52, 5, 0.18, 1.1), c2);
    s += flat(fluffD(-R * 0.2, cy - R * 0.22, R * 0.5, 6, 0.16, 0.2), tone(c, 0.55));
    s += line(`M${f1(-R * 0.55)} ${f1(cy + R * 0.1)}q${f1(R * 0.25)} ${f1(-R * 0.3)} ${f1(R * 0.5)} ${f1(-R * 0.15)}M${f1(R * 0.05)} ${f1(cy - R * 0.55)}q${f1(R * 0.25)} ${f1(-R * 0.05)} ${f1(R * 0.4)} ${f1(R * 0.2)}`, '#FFFFFF', 2, { opacity: 0.85 });
    s += shine(ell(-R * 0.45, cy - R * 0.45, R * 0.16, R * 0.11), 0.9);
    return { box: [-R - 4, cy - R - 4, R + 4, 4], svg: s, shadow: [0, 1, R * 0.45, 3], solid: [[-R, cy - R, R, cy + R], [-5, cy + R, 5, 2]] };
  });
}

// Matas de algodón de azúcar para el borde de las nubes.
function cottonClump(v) {
  const R = rng(v * 71 + 3);
  const cols = [['#FFB8D2', '#BFE0FF'], ['#BFE0FF', '#FFD0E2'], ['#E2CCFF', '#FFC4D8'], ['#FFD0E2', '#C7E3FF']];
  const items = [];
  for (let i = 0; i < 3; i++) {
    const [c, c2] = cols[Math.floor(R() * cols.length)];
    items.push([cottonTree(Math.round(24 + R() * 18), Math.round(15 + R() * 8), c, c2), Math.round((i - 1) * 26 + (R() - 0.5) * 8), Math.round((i === 1 ? 12 : 0) + R() * 6)]);
  }
  return group(`matalgodon-${v}`, items);
}

// Bocha de helado gigante sobre las nubes (dos sabores, con su chorreado,
// chispas y cereza) y nubes que tapan la base.
function iceScoopHill(id, list) {
  return def(`bocha-${id}`, () => {
    let s = '', x0 = 0, x1 = 0, y0 = 0;
    list.forEach(([cx, cy, R, body, cap], j) => {
      // la bocha: un círculo un poco aplastado con borde de abajo ondulado
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const a = Math.PI + (i / 40) * Math.PI;
        pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.92]);
      }
      let d = poly(pts).slice(0, -1);
      for (let i = 0; i < 6; i++) {
        const xa = cx + R - (i * 2 * R) / 6, xb = cx + R - ((i + 1) * 2 * R) / 6;
        d += `Q${f1(xa)} ${f1(cy + 7)} ${f1((xa + xb) / 2)} ${f1(cy + 6)}Q${f1(xb)} ${f1(cy + 5)} ${f1(xb)} ${f1(cy)}`;
      }
      s += part(`${d}Z`, body, { w: 2 });
      s += tonePath(`M${f1(cx + R * 0.2)} ${f1(cy - R * 0.9)}A${R} ${f1(R * 0.92)} 0 0 1 ${f1(cx + R)} ${cy}L${f1(cx + R * 0.5)} ${cy + 4}Q${f1(cx + R * 0.7)} ${f1(cy - R * 0.5)} ${f1(cx + R * 0.2)} ${f1(cy - R * 0.9)}Z`, tone(body, -1.2), 0.25);
      // casquete chorreado
      const capY = cy - R * 0.38;
      let c = '';
      const cp = pts.filter(([, y]) => y < capY);
      c += `M${f1(cp[0][0])} ${f1(capY)}`;
      cp.forEach(([x, y]) => { c += `L${f1(x)} ${f1(y - 1.5)}`; });
      const xl = cp[0][0], xr = cp[cp.length - 1][0];
      for (let i = 0; i < 5; i++) {
        const xa = xr - (i * (xr - xl)) / 5, xb = xr - ((i + 1) * (xr - xl)) / 5;
        const dep = i % 2 ? R * 0.14 : R * 0.32;
        c += `Q${f1(xa)} ${f1(capY + dep)} ${f1((xa + xb) / 2)} ${f1(capY + dep)}Q${f1(xb)} ${f1(capY + dep)} ${f1(xb)} ${f1(capY)}`;
      }
      s += part(`${c}Z`, cap, { w: 1.8 });
      s += shine(ell(cx - R * 0.42, cy - R * 0.62, R * 0.15, R * 0.09), 0.8);
      const sp = [[-0.3, -0.72, 30, GOL.lemon], [0.2, -0.82, -40, GOL.sky], [-0.02, -0.6, 50, '#FFFFFF'], [0.45, -0.55, 10, GOL.mint], [-0.5, -0.48, -20, GOL.lilac]];
      sp.forEach(([a, b, ang, col]) => { const x = f1(cx + a * R), y = f1(cy + b * R); s += flat(rr(x - 3, y - 1.3, 6, 2.6, 1.2), col, { transform: `rotate(${ang} ${x} ${y})` }); });
      if (j === list.length - 1) {
        s += line(`M${cx} ${f1(cy - R * 0.92 - 8)}q3 -7 8 -8`, '#5E8C4A', 2);
        s += part(circ(cx, cy - R * 0.92 - 4, 5.5), GOL.red, { w: 1.6 }) + shine(circ(cx - 1.6, cy - R * 0.92 - 6, 1.5), 0.9);
      }
      x0 = Math.min(x0, cx - R); x1 = Math.max(x1, cx + R); y0 = Math.min(y0, cy - R - 16);
    });
    // nubes al pie
    s += part(puffD(x0 - 8, x1 + 8, 4, [[x0 + 2, 10], [x0 + (x1 - x0) * 0.3, 13], [x0 + (x1 - x0) * 0.62, 12], [x1 - 2, 10]]), '#FFFFFF', { w: 1.8 });
    s += flat(puffD(x0 + 4, x1 - 4, 4, [[x0 + (x1 - x0) * 0.25, 6], [x0 + (x1 - x0) * 0.6, 7]]), '#F3EEFF');
    return { box: [x0 - 10, y0, x1 + 10, 6], svg: s, shadows: [[(x0 + x1) / 2, 4, (x1 - x0) / 2 + 6, 4]], solid: [[x0 - 6, y0 + 10, x1 + 6, 4]] };
  });
}

// Arcoíris de caramelo con nubes en los pies.
function rainbow(w) {
  return def(`arcoiris-${w}`, () => {
    const cols = ['#F47A8E', '#FFAE5C', '#FFDB6B', '#8ED89A', '#7FC3F0', '#B69BF0'];
    const R = w / 2, bw = 6;
    let s = '';
    cols.forEach((c, i) => {
      const ro = R - i * bw, ri = ro - bw;
      s += part(`M${-ro} 0A${ro} ${ro} 0 0 1 ${ro} 0L${ri} 0A${ri} ${ri} 0 0 0 ${-ri} 0Z`, c, { w: 1.4 });
    });
    s += shine(`M${-R + 3} -6A${R - 3} ${R - 3} 0 0 1 ${f1(-R * 0.55)} ${f1(-R * 0.8)}L${f1(-R * 0.52)} ${f1(-R * 0.74)}A${R - 6} ${R - 6} 0 0 0 ${-R + 6} -6Z`, 0.6);
    for (const sx of [-1, 1]) {
      const x = sx * (R - (cols.length * bw) / 2);
      s += part(puffD(x - 24, x + 24, 6, [[x - 15, 10], [x - 3, 14], [x + 11, 12], [x + 19, 8]]), '#FFFFFF', { w: 1.8 });
      s += flat(puffD(x - 16, x + 14, 6, [[x - 9, 6], [x + 3, 8]]), '#F3EEFF');
    }
    return { box: [-R - 26, -R - 2, R + 26, 8], svg: s, shadows: [[-R + 18, 5, 22, 4], [R - 18, 5, 22, 4]], solid: [[-R - 24, -R, -R + 40, 6], [R - 40, -R, R + 24, 6], [-R, -R, R, -R + 30]] };
  });
}

// Castillo de dulce: torres con techo de cucurucho, muros de colores.
function candyCastle() {
  return def('castillo', () => {
    let s = '';
    const wall = '#FFD6E2', wallDk = '#F4B5C9', cone = '#E9B46C';
    const tower = (x, base, w, h, roof, flag) => {
      let t = face(rr(x - w / 2, base - h, w, h, 2), wall, { w: 2 });
      let br = '';
      for (let y = base - h + 10, row = 0; y < base - 4; y += 9, row++) for (let bx = x - w / 2 + (row % 2 ? 4 : 8); bx < x + w / 2 - 6; bx += 10) br += rr(bx, y, 6, 4, 1.5);
      t += flat(br, wallDk);
      t += face(rr(x - w / 2 - 3, base - h - 6, w + 6, 8, 2), '#FFFFFF', { w: 1.8 });
      let dr = '';
      for (let dx = x - w / 2 - 1; dx < x + w / 2; dx += 7) dr += rr(dx, base - h + 1, 4, 4 + ((dx * 7) % 3), 2);
      t += flat(dr, '#FFFFFF');
      t += face(`M${x - w / 2 - 2} ${base - h - 7}L${x} ${base - h - 7 - roof}L${x + w / 2 + 2} ${base - h - 7}Z`, cone, { w: 2 });
      let g = '';
      for (let k = -2; k <= 2; k++) g += `M${f1(x + k * 6 - 6)} ${base - h - 8}L${f1(x + k * 3)} ${f1(base - h - 8 - roof * 0.6)}M${f1(x + k * 6 + 6)} ${base - h - 8}L${f1(x + k * 3)} ${f1(base - h - 8 - roof * 0.6)}`;
      t += line(g, '#C98B44', 1.4, { opacity: 0.75 });
      t += part(circ(x, base - h - 9 - roof, 4.5), GOL.red, { w: 1.5 }) + shine(circ(x - 1.4, base - h - 10.5 - roof, 1.2), 0.9);
      t += line(`M${x} ${base - h - 13 - roof}V${base - h - 26 - roof}`, '#8C7A70', 1.6) + part(`M${x} ${base - h - 26 - roof}L${x + 11} ${base - h - 22 - roof}L${x} ${base - h - 18 - roof}Z`, flag, { w: 1.3 });
      // ventana de corazón
      const wy = base - h * 0.58;
      t += face(`M${x} ${wy + 6}C${x - 8} ${wy} ${x - 6} ${wy - 7} ${x} ${wy - 3}C${x + 6} ${wy - 7} ${x + 8} ${wy} ${x} ${wy + 6}Z`, '#FFF2C2', { w: 1.6 });
      return t;
    };
    s += tower(-48, -18, 26, 74, 34, GOL.lemon);
    s += tower(48, -18, 26, 74, 34, GOL.mint);
    s += tower(0, -34, 32, 76, 40, GOL.pink);
    // muro con almenas, ladrillos de colores y portón
    s += face(rr(-58, -56, 116, 56, 3), wall, { w: 2 });
    let br = '';
    const bc = ['#FFC2D6', '#C9E8FF', '#FFF0B8', '#D8F2E2'];
    const bricks = [[], [], [], []];
    for (let y = -46, row = 0; y < -4; y += 10, row++) for (let x = -54 + (row % 2 ? 6 : 0); x < 50; x += 13) bricks[(row + Math.round(x / 13)) & 3].push(rr(x, y, 10, 6, 2));
    bricks.forEach((b, i) => { s += flat(b.join(''), bc[i]); });
    void br;
    for (let x = -58; x < 56; x += 16) s += face(rr(x, -64, 12, 9, 2), wallDk, { w: 1.6 });
    for (let x = -52; x < 56; x += 16) s += gomitaSvg(x, -64, 4.2, [GOL.mint, GOL.lemon, GOL.lilac, GOL.pink][Math.abs(x) % 4]);
    let dr = 'M-58 -56';
    for (let x = -58; x < 58; x += 8) dr += `Q${x + 2} ${-49 + (x % 16 ? 2 : 6)} ${x + 4} ${-49 + (x % 16 ? 2 : 6)}Q${x + 6} ${-49 + (x % 16 ? 2 : 6)} ${x + 8} -56`;
    s += part(`${dr}V-58H-58Z`, '#FFFFFF', { w: 1.4 });
    s += face(rrTop(-15, -36, 30, 36, 15), '#FFFFFF', { w: 2 });
    s += face(rrTop(-12, -33, 24, 33, 12), '#9C6446', { w: 1.8 }) + line('M0 -31V-1M-10 -18H10', '#7B4A33', 1.6);
    s += flat(circ(6, -14, 1.6), '#FFE08A');
    s += mentaSvg(0, -40, 7);
    return { box: [-66, -168, 66, 6], svg: s, shadow: [0, 1, 60, 6] };
  });
}

// Hueco en las nubes: se ve el cielo de abajo (con nubecitas lejanas).
function skyHole(S, x, y, rx) {
  const ry = rx * 0.42, y0 = y - ry - 4, y1 = y + ry + 4;
  G.flat(S, L_TERRAIN + 2, GOL.cloudDp, ell(x, y, rx, ry), y0, y1);
  G.flat(S, L_TERRAIN + 3, '#A9D4FA', ell(x, y + 3, rx - 3, ry - 3), y0, y1);
  G.flat(S, L_TERRAIN + 4, '#C8E6FF', ell(x + 2, y + 5, rx - 8, ry - 6), y0, y1);
  G.flat(S, L_TERRAIN + 5, '#FFFFFF', puffD(x - rx * 0.55, x - rx * 0.05, y + ry * 0.5, [[x - rx * 0.4, 4], [x - rx * 0.22, 5.5]]) + puffD(x + rx * 0.15, x + rx * 0.5, y + ry * 0.1, [[x + rx * 0.27, 3.5], [x + rx * 0.4, 3]]), y0, y1);
  G.line(S, L_TERRAIN + 6, '#FFFFFF', 3, `M${f1(x - rx + 2)} ${f1(y + 1)}Q${f1(x)} ${f1(y + ry * 2.1)} ${f1(x + rx - 2)} ${f1(y + 1)}`, y0, y1);
}

function golosinasGround(S) {
  const { zy, H, W } = S;
  const r = S.r;
  // horizonte: cielo, nubes y colinas de gomitas
  G.flat(S, L_BASE, '#DDEEFF', rr(-10, -10, W + 20, 80), -10, 70);
  G.flat(S, L_BASE, '#EAF4FF', rr(-10, -10, W + 20, 34), -10, 24);
  G.flat(S, L_BASE + 1, '#FFFFFF', puffD(-6, 70, 34, [[6, 10], [22, 14], [40, 11], [56, 8]]) + puffD(250, 340, 26, [[262, 8], [280, 13], [300, 11], [322, 9]]), 0, 40);
  const hills = [[-10, 64, 52, '#F59AB8'], [52, 64, 40, '#B79BF2'], [104, 64, 48, '#7FD3B2'], [170, 64, 36, '#FFC56B'], [222, 64, 50, '#F59AB8'], [292, 64, 42, '#7FD3B2'], [350, 64, 40, '#B79BF2']];
  hills.forEach(([x, y, rr0, c]) => {
    G.flat(S, L_BASE + 2, c, `M${x - rr0} ${y + 20}C${x - rr0} ${y - rr0 * 1.1} ${x + rr0} ${y - rr0 * 1.1} ${x + rr0} ${y + 20}Z`, y - rr0, y + 20);
    G.flat(S, L_BASE + 3, tone(c, 0.5), ell(x - rr0 * 0.25, y - rr0 * 0.42, rr0 * 0.42, rr0 * 0.22), y - rr0, y);
    G.flat(S, L_BASE + 4, '#FFFFFF', [[-0.4, -0.3], [0.2, -0.5], [0.45, -0.15], [-0.1, -0.1]].map(([a, b]) => rr(f1(x + a * rr0), f1(y + b * rr0), 3, 3, 0.6)).join(''), y - rr0, y);
  });
  // prado (zona 0), tierra de bizcocho (zona 1), piso de nubes (zona 2)
  G.flat(S, L_BASE + 5, GOL.grass, wavyRegion(-10, W + 10, 72, 3, 90, 0.4, zy[1] + 40), 60, zy[1] + 40);
  G.flat(S, L_BASE + 6, GOL.caramel, wavyRegion(-10, W + 10, zy[1] + 2, 4, 70, 1.3, zy[2] + 40), zy[1] - 10, zy[2] + 40);
  G.flat(S, L_BASE + 7, GOL.cloud, rr(-10, zy[2] + 20, W + 20, H - zy[2] + 10), zy[2] + 10, H + 20);
  // borde de nubes entre el bizcocho y las nubes
  const bump = [];
  for (let x = -12; x < W + 20; x += 26 + r() * 10) bump.push([x, 12 + r() * 8, -r() * 4]);
  G.flat(S, L_BASE + 8, GOL.cloudDk, puffD(-14, W + 14, zy[2] + 40, bump.map(([x, rr0, dy]) => [x, rr0 + 2, dy])), zy[2] - 10, zy[2] + 42);
  G.flat(S, L_BASE + 9, GOL.cloudLt, puffD(-14, W + 14, zy[2] + 36, bump), zy[2] - 10, zy[2] + 42);
  // nubes: montoncitos esponjosos con su sombra lila abajo
  for (let y = zy[2] + 70; y < H - 10; y += 30 + r() * 16) {
    const x = 10 + r() * (W - 20), R0 = 12 + r() * 12;
    const bumps = [[x - R0 * 0.9, R0 * 0.62], [x, R0, -2], [x + R0 * 0.85, R0 * 0.7]];
    G.flat(S, L_TERRAIN, GOL.cloudDk, puffD(x - R0 * 1.6, x + R0 * 1.6, y + 3, bumps), y - R0 - 6, y + 4);
    G.flat(S, L_TERRAIN + 1, '#FBF8FF', puffD(x - R0 * 1.5, x + R0 * 1.5, y, bumps.map(([a, b, c = 0]) => [a, b - 1, c])), y - R0 - 6, y + 4);
  }
  // manchas de luz y de pasto más oscuro en el prado
  for (let y = 96; y < zy[1] - 20; y += 40) {
    const x = 20 + r() * (W - 40), rx = 22 + r() * 26;
    G.flat(S, L_TERRAIN, r() < 0.5 ? GOL.grassLt : GOL.grassDk, puffD(x - rx, x + rx, y + 8, [[x - rx * 0.5, rx * 0.3], [x, rx * 0.42], [x + rx * 0.5, rx * 0.3]]), y - 30, y + 10);
  }
  // en el bizcocho: manchones de luz y de pasto de menta
  for (let y = zy[1] + 30; y < zy[2] - 20; y += 46) {
    const x = 20 + r() * (W - 40), rx = 22 + r() * 24;
    G.flat(S, L_TERRAIN, r() < 0.6 ? GOL.caramelLt : '#CDE7B8', ell(x, y + r() * 20, rx, rx * 0.34), y - 10, y + 40);
  }
}

function golosinasDetails(S) {
  scatter(S, 0, 140, (x, y) => G.flat(S, L_DETAIL, GOL.grassDp, tuftD(x, y, 0.8 + S.r() * 0.4), y - 8, y + 1), { top: 70 });
  const fc = [GOL.pink, '#FFFFFF', GOL.lemon, GOL.lilac];
  scatter(S, 0, 60, (x, y, i) => {
    const c = fc[i % fc.length];
    G.flat(S, L_DETAIL + 1, c, rr(x - 3, y - 1.5, 6, 3, 1) + rr(x - 1.5, y - 3, 3, 6, 1), y - 3, y + 3);
    G.flat(S, L_DETAIL + 2, GOL.lemon, rr(x - 1, y - 1, 2, 2, 0), y - 1, y + 1);
  }, { top: 80 });
  const sc = [GOL.pink, GOL.sky, GOL.lemon, GOL.mint, GOL.lilac];
  scatter(S, 1, 80, (x, y, i) => {
    const c = sc[i % sc.length];
    const a = Math.round(S.r() * 4) * 45;
    const d = a % 90 === 0 ? (a % 180 === 0 ? rr(x - 3, y - 1.2, 6, 2.4, 1) : rr(x - 1.2, y - 3, 2.4, 6, 1)) : poly(a === 45 ? [[x - 3, y + 1.5], [x + 1.5, y - 3], [x + 3, y - 1.5], [x - 1.5, y + 3]] : [[x - 3, y - 1.5], [x - 1.5, y - 3], [x + 3, y + 1.5], [x + 1.5, y + 3]]);
    G.flat(S, L_DETAIL, c, d, y - 3, y + 3);
  }, { top: 20 });
  scatter(S, 1, 60, (x, y) => G.flat(S, L_DETAIL + 1, GOL.caramelDk, ell(x, y, 3 + S.r() * 2, 1.6), y - 2, y + 2), { top: 20 });
  scatter(S, 1, 36, (x, y) => G.flat(S, L_DETAIL + 2, GOL.chocLt, rr(x - 2, y - 1.5, 4, 3, 1), y - 2, y + 2), { top: 20 });
  scatter(S, 2, 46, (x, y, i) => G.flat(S, L_DETAIL, i % 3 ? '#FFFFFF' : GOL.lemon, sparkD(x, y, 3.5 + S.r() * 2), y - 6, y + 6), { top: 50 });
}

function golosinasBuild(S) {
  golosinasGround(S);
  roadBands(S, { edge: GOL.roadEdge, base: GOL.road, light: GOL.roadLt, w: 20, dash: '#FFFFFF', neon: '#FF7FB6' });
  const { P, zk, zy, W } = S;
  const mid = (z) => (zy[z] + zy[z + 1]) / 2;
  // el río: en el hueco con aire extra de la zona 1
  const z1 = zk[1];
  let best = null;
  for (let i = 0; i < z1.length - 1; i++) {
    const a = P[z1[i]], b = P[z1[i + 1]];
    if (b.y - a.y > MAP_STEP + 10 && (!best || Math.abs(b.x - a.x) < Math.abs(best.b.x - best.a.x))) best = { a, b };
  }
  if (best) {
    const yr = ev(best.a.y + 36 + (best.b.y - best.a.y - 36 - 26) / 2);
    const xb = ev((best.a.x + best.b.x) / 2);
    const right = xb < W / 2; // la cascada, del lado contrario al puente
    const xFall = right ? 262 : 98;
    chocoRiver(S, yr, xFall, !right);
    put(S, waferBridge(50), xb, yr + 24);
    put(S, chocoFalls(), xFall, yr - 8, { block: false });
    S.mark(xFall - 70, yr - 100, xFall + 70, yr + 22);
    S.mark(-20, yr - 26, W + 20, yr + 22);
  }
  const trY = (z) => { const a = P[zk[z][0] - 1], b = P[zk[z][0]]; return ev((a.y + b.y) / 2); };
  const roadX = (y) => S.samp.reduce((bst, p) => (Math.abs(p.y - y) < Math.abs(bst.y - y) ? p : bst), S.samp[0]).x;
  // transición prado → bizcocho: cerca de bastones con portón
  {
    const y = trY(1) + 12, x = roadX(y);
    const lw = ev(x - 20 + 10), rw = ev(W + 10 - (x + 20));
    if (lw > 24) put(S, caneFence(lw, 'R'), ev(-10 + lw / 2), y, { block: false });
    if (rw > 24) put(S, caneFence(rw, 'L'), ev(x + 20 + rw / 2), y, { block: false });
    S.mark(-10, y - 44, W + 10, y + 4);
  }
  // transición bizcocho → nubes: arcoíris al costado del camino
  {
    const y = trY(2), x = roadX(y);
    landmark(S, 2, rainbow(124), x < W / 2 ? W - 100 : 100, y + 40, { y0: y - 20, y1: y + 140, x0: 50, x1: W - 50, kx: 0.6 });
  }
  // ── zona 0: el prado ──
  landmark(S, 0, sodaPond(110), W / 2, zy[0] + 330, { ky: 0.4, kx: 0.3 });
  landmark(S, 0, lollipopGrove('a', [[-30, 0, 50, 24, GOL.pink, '#FFFFFF', GOL.mint], [6, 8, 36, 18, GOL.lemon, GOL.orange], [36, -2, 58, 22, GOL.sky, '#FFFFFF']], [['g', -6, 16, 9, GOL.lilac], ['f', 22, 18, 12, GOL.red], ['g', 52, 12, 7, GOL.mint]]), W / 2, zy[0] + 150, { ky: 0.5, kx: 0.3 });
  landmark(S, 0, candyGarden(), W / 2, zy[0] + 470, { ky: 0.4, kx: 0.3 });
  landmark(S, 0, lollipopGrove('b', [[0, 0, 54, 25, GOL.mint, '#FFFFFF', GOL.pink], [-34, 12, 34, 16, GOL.lilac, '#FFFFFF']], [['o', 28, 14, GOL.orange], ['g', 44, 6, 8, GOL.lemon], ['m', -10, 18, 10]]), W / 2, zy[0] + 620, { ky: 0.5, kx: 0.3 });
  frame(S, 0, [lollyClump(1), gumMound(1), lollyClump(2), lollyClump(8), lollyClump(3), gumMound(2), lollyClump(4), lollyClump(9), gumMound(6), lollyClump(10)], { top: 84, every: 56, inset: 12, dx: 18 });
  sprinkle(S, 0, [
    flowerPatch('p1', [[-10, 0, 16, GOL.pink], [6, -4, 20, GOL.lilac], [16, 4, 12, GOL.orange]]),
    gumMound(3),
    flowerPatch('p2', [[-8, 0, 18, GOL.red], [8, 2, 14, GOL.sky]]),
    lollipopGrove('chico', [[0, 0, 30, 15, GOL.orange, '#FFFFFF']], [['g', 18, 8, 7, GOL.mint]]),
    osito(GOL.lilac),
    gumMound(7),
    flowerPatch('p3', [[0, 0, 14, GOL.lemon], [12, 4, 11, GOL.pink]]),
  ], 24, { top: 90, m: -4 });
  roadFlowers(S, 0, [GOL.pink, '#FFFFFF', GOL.lemon, GOL.lilac], '#78B878');
  // ── zona 1: el pueblito del río ──
  const villa = group('villa', [[cupcakeHouse('#FFC4D8', '#9BD3F2', '#C98A5E'), -32, 0], [cupcakeHouse('#FFF0C2', '#F7A8C0', '#9C6446'), 34, 12], [candyLamp(GOL.lemon), 2, 20], [candyMailbox(GOL.red), -60, 14]], { doors: [[-32, 4], [34, 16]] });
  const v1 = landmark(S, 1, villa, W / 2, mid(1) + 130, { ky: 0.35, kx: 0.4 });
  if (v1) villa.doors.forEach(([dx, dy]) => doorPath(S, v1.x + dx, v1.y + dy, '#E2B06A', '#B47236'));
  const casa3 = group('casita3', [[cupcakeHouse('#D9C6FF', '#FFD27A', '#C98A5E'), 0, 0], [candyLamp(GOL.pink), 36, 8], [candyMailbox(GOL.sky), -34, 10]], { doors: [[0, 4]] });
  const v2 = landmark(S, 1, casa3, W / 2, mid(1) - 150, { ky: 0.35, kx: 0.4 });
  if (v2) casa3.doors.forEach(([dx, dy]) => doorPath(S, v2.x + dx, v2.y + dy, '#E2B06A', '#B47236'));
  landmark(S, 1, cookieMill(), W / 2, mid(1) + 20, { ky: 0.25, kx: 0.5 });
  landmark(S, 1, group('popsgrove', [[cakePop(40, 15, '#7B4A33', '#FFFFFF'), -22, 0], [cakePop(52, 17, '#F7A8C0', '#FFFFFF'), 4, 10], [cakePop(34, 13, '#FFF4E4', GOL.pink), 28, 2], [bombones('b1', [[-8, 0, '#7B4A33', '#F7A8C0'], [8, 4, '#FFF4E4', '#9BD3F2']]), -6, 26]]), W / 2, zy[1] + 90, { ky: 0.5, kx: 0.3 });
  frame(S, 1, [lollyClump(5, 'cakepop'), gumMound(8), lollyClump(6, 'cakepop'), def('troncos', () => ({ box: [-26, -18, 26, 4], svg: waferLogSvg(0, 0, 44) + waferLogSvg(4, -8, 34, 5), shadow: [0, 1, 24, 3] })), lollyClump(7, 'cakepop'), lollyClump(11), lollyClump(12, 'cakepop')], { top: 30, every: 58, inset: 12, dx: 18 });
  sprinkle(S, 1, [
    bombones('b2', [[-9, 0, '#9C6446', '#FFD27A'], [7, 3, '#7B4A33', '#F7A8C0'], [-1, 9, '#FFF4E4', '#B79BF2']]),
    gumMound(4),
    lollipopGrove('f', [[0, 0, 34, 16, GOL.lilac, '#FFFFFF', GOL.lemon]], [['m', 22, 10, 9]]),
    candyLamp(GOL.mint),
    osito(GOL.mint),
    cakePop(30, 12, '#9C6446', GOL.lemon),
    lollyClump(13),
  ], 20, { top: 40, m: -4 });
  roadFlowers(S, 1, [GOL.pink, '#FFFFFF', GOL.sky], '#9CC97E');
  // ── zona 2: las nubes ──
  const last = P[P.length - 1];
  landmark(S, 2, candyCastle(), last.x < W / 2 ? W - 96 : 96, last.y + 10, { y0: last.y - 150, y1: S.H - 6, ky: 0.4 });
  landmark(S, 2, iceScoopHill('a', [[-28, -2, 32, '#C7F0DC', '#FFFFFF'], [22, 0, 42, '#FFC4D8', '#8C5638']]), 70, zy[2] + 150, { ky: 0.4, kx: 0.6, x0: 60, x1: W - 60 });
  landmark(S, 2, iceScoopHill('b', [[24, -2, 30, '#FFF0C2', '#F47FA4'], [-20, 0, 40, '#C9B6FF', '#FFFFFF']]), W - 70, zy[2] + 340, { ky: 0.4, kx: 0.6, x0: 60, x1: W - 60 });
  frame(S, 2, [cottonClump(1), gumMound(9), cottonClump(2), cottonClump(3), cottonClump(5), gumMound(10), cottonClump(4)], { top: 60, every: 60, inset: 12, dx: 18 });
  // huecos de cielo entre las nubes
  for (let y = zy[2] + 120, i = 0; y < S.H - 60; y += 150, i++) {
    const rx = 30 + S.r() * 12;
    for (let t = 0; t < 30; t++) {
      const x = 40 + S.r() * (W - 80);
      if (rectFree(S, x - rx - 6, y - 24, x + rx + 6, y + 24) && !S.onRoad(x, y, rx + 10)) { skyHole(S, x, y, rx); S.mark(x - rx, y - 18, x + rx, y + 18); break; }
    }
  }
  sprinkle(S, 2, [
    group('algodones', [[cottonTree(26, 16, '#FFB8D2', '#E2CCFF'), 0, 0], [cottonTree(20, 13, '#BFE0FF', '#FFD0E2'), 26, 8]]),
    gumMound(5),
    cottonTree(30, 18, '#FFD0E2', '#C7E3FF'),
    osito(GOL.sky, 0.9),
    cottonClump(6),
  ], 16, { top: 60, m: -4 });
  golosinasDetails(S);
}

// ═════════════════════════════════════════════════════════════════
// COCINA: la huerta (canteros con surcos, zanahorias que asoman el
// hombro, tomateras, zapallos, girasoles, espantapájaros, cobertizo), el
// mercado (puestos con toldo de festón, cajones de fruta, balanza,
// pizarritas, banderines, adoquines) y la pastelería (fachada con vitrina,
// terraza, fuente-torta, plaza de baldosas).
// ═════════════════════════════════════════════════════════════════
const COC = {
  grass: '#B5DC97', grassLt: '#C9E8B0', grassDk: '#9ACB80', grassDp: '#80B86C',
  road: '#E6CA9C', roadEdge: '#C9A26E', roadLt: '#F3E0BE',
  soil: '#8A5A3C', soilDk: '#6B4229', soilLt: '#A97852',
  wood: '#C98F5A', woodLt: '#E4B37E', woodDk: '#9C6A40', woodDp: '#7A4E2E',
  cobGap: '#C3B19F', cob: '#E0D4C3', cob2: '#D5C7B4', cob3: '#EAE0D1', cobLt: '#F6F0E6',
  tile: '#FBE3E8', tile2: '#FFF6F0', tileGap: '#E8C8CF',
  leaf: '#6DBA5E', leafLt: '#97D27B', leafDk: '#4F9A4B',
};

function appleSvg(x, y, r, c = '#E8475A') {
  let s = part(`M${f1(x)} ${f1(y - r * 1.55)}C${f1(x - r * 0.5)} ${f1(y - r * 1.95)} ${f1(x - r * 1.1)} ${f1(y - r * 1.6)} ${f1(x - r)} ${f1(y - r * 0.9)}C${f1(x - r * 0.9)} ${f1(y - r * 0.2)} ${f1(x - r * 0.4)} ${y} ${f1(x)} ${f1(y - r * 0.12)}C${f1(x + r * 0.4)} ${y} ${f1(x + r * 0.9)} ${f1(y - r * 0.2)} ${f1(x + r)} ${f1(y - r * 0.9)}C${f1(x + r * 1.1)} ${f1(y - r * 1.6)} ${f1(x + r * 0.5)} ${f1(y - r * 1.95)} ${f1(x)} ${f1(y - r * 1.55)}Z`, c, { w: 1.4 });
  s += line(`M${f1(x)} ${f1(y - r * 1.5)}l${f1(r * 0.25)} ${f1(-r * 0.55)}`, '#7A4E2E', 1.6);
  s += part(leafD(x + r * 0.2, y - r * 1.85, r * 0.9, -25, r * 0.32), '#6DBA5E', { w: 1.1 });
  return s + shine(ell(x - r * 0.45, y - r * 1.15, r * 0.2, r * 0.28), 0.85);
}

function orangeSvg(x, y, r, c = '#FFA23C') {
  let s = part(circ(x, y - r, r), c, { w: 1.4 });
  s += flat(rr(f1(x + r * 0.2), f1(y - r * 0.6), 1.5, 1.5, 0.4) + rr(f1(x - r * 0.4), f1(y - r * 0.45), 1.5, 1.5, 0.4) + rr(f1(x + r * 0.45), f1(y - r * 1.2), 1.5, 1.5, 0.4), tone(c, -0.6));
  s += flat(circ(x, y - r * 1.85, 1.2), '#6B8E3A');
  return s + shine(ell(x - r * 0.4, y - r * 1.35, r * 0.24, r * 0.2), 0.8);
}

function pearSvg(x, y, r, c = '#C9DB5C') {
  let s = part(`M${f1(x)} ${f1(y - r * 2.1)}C${f1(x - r * 0.45)} ${f1(y - r * 2.1)} ${f1(x - r * 0.5)} ${f1(y - r * 1.4)} ${f1(x - r * 0.75)} ${f1(y - r * 1)}C${f1(x - r * 1.15)} ${f1(y - r * 0.4)} ${f1(x - r * 0.7)} ${y} ${f1(x)} ${y}C${f1(x + r * 0.7)} ${y} ${f1(x + r * 1.15)} ${f1(y - r * 0.4)} ${f1(x + r * 0.75)} ${f1(y - r * 1)}C${f1(x + r * 0.5)} ${f1(y - r * 1.4)} ${f1(x + r * 0.45)} ${f1(y - r * 2.1)} ${f1(x)} ${f1(y - r * 2.1)}Z`, c, { w: 1.4 });
  s += line(`M${f1(x)} ${f1(y - r * 2.05)}l${f1(r * 0.15)} ${f1(-r * 0.5)}`, '#7A4E2E', 1.5);
  return s + shine(ell(x - r * 0.35, y - r * 0.85, r * 0.18, r * 0.26), 0.8);
}

function grapesSvg(x, y, r = 2.6, c = '#9B6BC8') {
  const pts = [[0, -1], [-1, -1.9], [1, -1.9], [-2, -2.8], [0, -2.8], [2, -2.8], [-1, -3.7], [1, -3.7]];
  let s = '';
  pts.forEach(([a, b]) => { s += part(circ(f1(x + a * r * 0.95), f1(y + b * r * 0.95), r), c, { w: 1.1 }); });
  s += line(`M${x} ${f1(y - r * 4.6)}l1 -3`, '#7A4E2E', 1.4) + part(leafD(x + 1, y - r * 4.8, 6, -20, 2.4), '#6DBA5E', { w: 1 });
  return s + flat(circ(f1(x - r * 1.1), f1(y - r * 3), 0.9) + circ(f1(x + r * 0.2), f1(y - r * 1.2), 0.9), '#FFFFFF');
}

function bananaSvg(x, y, k = 1) {
  let s = '';
  [[-5, 0], [0, -2], [5, -1]].forEach(([dx, dy], i) => {
    const bx = x + dx * k, by = y + dy * k;
    s += part(`M${f1(bx - 2 * k)} ${f1(by - 12 * k)}Q${f1(bx - 6 * k)} ${f1(by - 3 * k)} ${f1(bx + 3 * k)} ${f1(by)}Q${f1(bx - 1 * k)} ${f1(by - 4 * k)} ${f1(bx + 1 * k)} ${f1(by - 12 * k)}Z`, i === 1 ? '#FFD95C' : '#FFCC3E', { w: 1.2 });
  });
  s += part(rr(f1(x - 2 * k), f1(y - 15 * k), 4 * k, 4 * k, 1), '#8A6A3A', { w: 1.1 });
  return s;
}

function melonSvg(x, y, r = 9) {
  let s = part(ell(x, y - r * 0.75, r * 1.2, r * 0.8), '#5DAE62', { w: 1.6 });
  s += line(`M${f1(x - r * 0.7)} ${f1(y - r * 1.3)}Q${f1(x - r * 0.9)} ${f1(y - r * 0.75)} ${f1(x - r * 0.7)} ${f1(y - r * 0.15)}M${x} ${f1(y - r * 1.5)}V${f1(y)}M${f1(x + r * 0.7)} ${f1(y - r * 1.3)}Q${f1(x + r * 0.9)} ${f1(y - r * 0.75)} ${f1(x + r * 0.7)} ${f1(y - r * 0.15)}`, '#3F8A47', 2);
  return s + shine(ell(x - r * 0.5, y - r * 1.1, r * 0.25, r * 0.14), 0.7);
}

function melonSlice(x, y, r = 8) {
  let s = part(`M${x - r} ${y - 2}A${r} ${r * 0.75} 0 0 0 ${x + r} ${y - 2}Z`, '#5DAE62', { w: 1.5 });
  s += part(`M${x - r + 2} ${y - 2}A${r - 2} ${(r - 2) * 0.72} 0 0 0 ${x + r - 2} ${y - 2}Z`, '#F25A6A', { w: 1.2 });
  return s + flat(rr(x - 3, y + 1, 1.5, 2, 0.5) + rr(x + 2, y + 1.5, 1.5, 2, 0.5) + rr(x - 0.5, y + 2.5, 1.5, 2, 0.5), '#3A2A3E');
}

function tomatoSvg(x, y, r = 4, c = '#E8443C') {
  let s = part(ell(x, y - r * 0.9, r * 1.08, r * 0.92), c, { w: 1.3 });
  s += flat(starD(x, y - r * 1.65, r * 0.75, 0.42, 5), '#4F9A4B');
  return s + shine(ell(x - r * 0.42, y - r * 1.15, r * 0.22, r * 0.18), 0.85);
}

function carrotBunch(x, y) {
  let s = '';
  [[-4, 0, -20], [0, 1, 0], [4, 0, 18]].forEach(([dx, dy, a]) => {
    const cx = x + dx, cy = y + dy;
    s += part(`M${cx - 2.8} ${cy - 12}L${cx + 2.8} ${cy - 12}L${cx + 0.6} ${cy}L${cx - 0.6} ${cy}Z`, '#F5893A', { w: 1.2, a: { transform: `rotate(${a} ${cx} ${cy - 12})` } });
  });
  s += part(leafD(x - 2, y - 12, 9, -115, 2.6), COC.leaf, { w: 1 }) + part(leafD(x + 1, y - 12, 10, -80, 2.6), COC.leafLt, { w: 1 }) + part(leafD(x + 3, y - 12, 8, -50, 2.4), COC.leaf, { w: 1 });
  return s;
}

// Lechuga: roseta de hojas onduladas en tres verdes.
function lettuceSvg(x, y, R = 8, c = '#7CC46A') {
  const sq = (d) => d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, a, b) => `${a} ${f1(y - R * 0.6 + (parseFloat(b) - (y - R * 0.6)) * 0.72)}`);
  let s = part(sq(fluffD(x, y - R * 0.6, R, 9, 0.18, 0.2)), c, { w: 1.4 });
  s += flat(sq(fluffD(x - R * 0.1, y - R * 0.75, R * 0.66, 7, 0.2, 1)), tone(c, 0.45));
  s += flat(sq(fluffD(x - R * 0.15, y - R * 0.85, R * 0.34, 5, 0.2, 0.5)), tone(c, 0.9));
  return s + line(`M${f1(x - R * 0.55)} ${f1(y - R * 0.5)}l${f1(R * 0.25)} ${f1(-R * 0.15)}M${f1(x + R * 0.6)} ${f1(y - R * 0.45)}l${f1(-R * 0.25)} ${f1(-R * 0.15)}`, tone(c, 1.2), 1.2, { opacity: 0.8 });
}

// Repollo: cabeza redonda y hojas de afuera con nervaduras.
function cabbageSvg(x, y, R = 7) {
  let s = part(`M${x - R * 1.4} ${y - 1}Q${x - R * 1.3} ${f1(y - R * 1.2)} ${x} ${f1(y - R * 0.9)}Q${x + R * 1.3} ${f1(y - R * 1.2)} ${x + R * 1.4} ${y - 1}Q${x} ${y + 2} ${x - R * 1.4} ${y - 1}Z`, '#6FAE7E', { w: 1.3 });
  s += part(circ(x, y - R * 0.95, R * 0.85), '#A9D9AE', { w: 1.4 });
  s += line(`M${f1(x - R * 0.5)} ${f1(y - R * 0.4)}Q${f1(x - R * 0.2)} ${f1(y - R * 1.2)} ${f1(x + R * 0.4)} ${f1(y - R * 1.5)}M${f1(x + R * 0.1)} ${f1(y - R * 0.25)}Q${f1(x + R * 0.6)} ${f1(y - R * 0.8)} ${f1(x + R * 0.7)} ${f1(y - R * 1.2)}`, '#7FBF8A', 1.3);
  return s + shine(ell(x - R * 0.35, y - R * 1.35, R * 0.2, R * 0.14), 0.7);
}

// Zanahoria plantada: se ve el copete y el hombro naranja; la tierra de
// adelante (la dibuja quien la planta) tapa el resto.
function carrotInSoil(x, y) {
  let s = part(leafD(x - 1.5, y - 4, 12, -120, 3), COC.leafDk, { w: 1.1 });
  s += part(leafD(x, y - 4, 15, -92, 3.2), COC.leaf, { w: 1.1 });
  s += part(leafD(x + 1.5, y - 4, 12, -60, 3), COC.leafLt, { w: 1.1 });
  s += part(`M${x - 5.5} ${y + 2}C${x - 5.5} ${y - 5} ${x + 5.5} ${y - 5} ${x + 5.5} ${y + 2}Z`, '#F5893A', { w: 1.4 });
  s += line(`M${x - 3.5} ${y - 0.4}h2.6M${x + 0.5} ${y + 1}h2.4`, '#D86A22', 1.2, { opacity: 0.9 });
  return s + flat(rr(x - 3.4, y - 3.4, 2.2, 1.8, 0.6), '#FFC08A');
}

// Montón de frutas (dos filas, de atrás para adelante) dentro de un ancho.
function fruitPile(kind, x, y, w) {
  const fn = { manzana: (a, b) => appleSvg(a, b, 4.2), naranja: (a, b) => orangeSvg(a, b, 4), pera: (a, b) => pearSvg(a, b, 3.4), limon: (a, b) => orangeSvg(a, b, 3.6, '#FFE05A'), tomate: (a, b) => tomatoSvg(a, b, 4), manzanaV: (a, b) => appleSvg(a, b, 4.2, '#9BCB4C') }[kind];
  let s = '';
  if (kind === 'uva') { for (let i = 0; i < Math.floor(w / 11); i++) s += grapesSvg(x - w / 2 + 6 + i * 11, y - (i % 2) * 2, 2.4, i % 3 === 2 ? '#7FB24C' : '#9B6BC8'); return s; }
  if (kind === 'banana') { for (let i = 0; i < Math.floor(w / 14); i++) s += bananaSvg(x - w / 2 + 8 + i * 14, y - (i % 2)); return s; }
  if (kind === 'zanahoria') { for (let i = 0; i < Math.floor(w / 12); i++) s += carrotBunch(x - w / 2 + 7 + i * 12, y); return s; }
  if (kind === 'lechuga') { for (let i = 0; i < Math.floor(w / 13); i++) s += lettuceSvg(x - w / 2 + 7 + i * 13, y, 6); return s; }
  const n = Math.max(2, Math.floor(w / 8.4));
  for (let i = 0; i < n - 1; i++) s += fn(x - w / 2 + 8 + i * 8.4, y - 4);
  for (let i = 0; i < n; i++) s += fn(x - w / 2 + 4 + i * 8.4, y);
  return s;
}

// Cajón de madera con tablas y fruta asomando (x,y = frente abajo al medio).
function crateSvg(x, y, w, kind, h = 13) {
  let s = face(rr(x - w / 2, y - h - 5, w, 6, 1.5), COC.woodDk, { w: 1.5 });
  s += fruitPile(kind, x, y - h + 1, w - 4);
  s += face(rr(x - w / 2, y - h, w, h, 1.5), COC.wood, { w: 1.7 });
  s += flat(rr(x - w / 2 + 1, y - h / 2 - 1, w - 2, 2, 0), COC.woodDk);
  s += line(`M${x - w / 2 + 3} ${y - h + 3}q${f1(w / 4)} -1 ${f1(w / 2)} 0M${f1(x + 2)} ${y - 3}q${f1(w / 6)} 1 ${f1(w / 3)} 0`, COC.woodDk, 1.2, { opacity: 0.6 });
  s += flat(rr(x - w / 2 + 2, y - h + 2, 2, 2, 0.5) + rr(x + w / 2 - 4, y - h + 2, 2, 2, 0.5) + rr(x - w / 2 + 2, y - 4, 2, 2, 0.5) + rr(x + w / 2 - 4, y - 4, 2, 2, 0.5), '#8C7A70');
  return s + line(`M${x - w / 2 + 2} ${y - h + 1.5}H${x + w / 2 - 2}`, COC.woodLt, 1.4, { opacity: 0.9 });
}

// Canasta tejida con fruta.
function basketSvg(x, y, w, kind) {
  let s = fruitPile(kind, x, y - 9, w - 6);
  s += face(`M${x - w / 2} ${y - 10}L${x - w / 2 + 3} ${y}H${x + w / 2 - 3}L${x + w / 2} ${y - 10}Z`, '#D9A867', { w: 1.6 });
  let wv = '';
  for (let i = 0; i < 3; i++) wv += `M${x - w / 2 + 2} ${y - 8 + i * 3}H${x + w / 2 - 2}`;
  for (let xx = x - w / 2 + 5; xx < x + w / 2 - 3; xx += 5) wv += `M${xx} ${y - 9}V${y - 1}`;
  s += line(wv, '#B07E44', 1.2, { opacity: 0.8 });
  return s + face(rr(x - w / 2 - 1, y - 12, w + 2, 3, 1.5), '#C99355', { w: 1.3 });
}

// Pizarrita de precio (en un palito).
function priceBoard(x, y, mark = '#F25A6A') {
  let s = part(rr(x - 1.2, y - 8, 2.4, 8, 1), COC.woodDk, { w: 1.1 });
  s += face(rr(x - 8, y - 18, 16, 11, 1.5), COC.wood, { w: 1.4 }) + flat(rr(x - 6.5, y - 16.5, 13, 8, 0.5), '#3E4A44');
  s += line(`M${x - 5} ${y - 14}h5M${x - 5} ${y - 11}h7`, '#FFFFFF', 1.2, { opacity: 0.9 });
  return s + flat(circ(x + 4, y - 14, 1.6), mark);
}

// Balanza de mostrador con su platillo.
function scaleSvg(x, y) {
  let s = face(rr(x - 7, y - 5, 14, 5, 1.5), '#E86A5E', { w: 1.4 });
  s += part(rr(x - 1.5, y - 12, 3, 7, 1), '#B8B2C2', { w: 1.2 });
  s += face(circ(x + 0.5, y - 9, 3.4), '#FFFFFF', { w: 1.2 }) + line(`M${x + 0.5} ${y - 9}l2 -2`, '#E8443C', 1);
  s += part(`M${x - 9} ${y - 14}Q${x} ${y - 9} ${x + 9} ${y - 14}Z`, '#D8D4E2', { w: 1.3 });
  s += orangeSvg(x - 2, y - 14, 2.8) + orangeSvg(x + 3, y - 14.5, 2.8);
  return s + shine(rr(x - 6, y - 14, 4, 1.4, 0.6), 0.8);
}

// Banderines colgando de una cuerda entre dos puntos.
function buntingSvg(x1, y1, x2, y2, cols, sag = 10) {
  const n = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 10));
  const P = (t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag];
  let d = `M${f1(x1)} ${f1(y1)}`;
  for (let i = 1; i <= 16; i++) { const [x, y] = P(i / 16); d += `L${f1(x)} ${f1(y)}`; }
  let s = line(d, '#8C7A70', 1.3);
  for (let i = 1; i < n; i++) {
    const [ax, ay] = P((i - 0.38) / n), [bx, by] = P((i + 0.38) / n);
    s += part(poly([[ax, ay], [bx, by], [(ax + bx) / 2, (ay + by) / 2 + 8]]), cols[i % cols.length], { w: 1.1 });
  }
  return s;
}

// Banderines entre los dos puestos del mercado (del poste del de arriba al
// farol de abajo).
function bunting2() {
  return def('banderines-mercado', () => ({ box: [-56, -76, 56, 30], svg: buntingSvg(-50, -72, 50, -74, ['#E8574F', '#FFD45C', '#4FA86E', '#7FC3F0', '#F47FA4'], 7), solid: [[-50, -76, 50, -70]] }));
}

// Puesto del mercado: postes, mostrador de madera, toldo a rayas con
// festón (las rayas siguen la curva del borde), sombra debajo, cajones de
// fruta, canasta, pizarrita y balanza.
function marketStall(id, o) {
  return def(`puesto-${id}`, () => {
    const w = 100, hw = w / 2, ch = 22, top = -ch - 7;
    const [c1, c2] = o.awn;
    let s = '';
    // postes de atrás
    s += face(rr(-hw + 2, -70, 5, 46, 1.5), COC.woodDk, { w: 1.5 }) + face(rr(hw - 7, -70, 5, 46, 1.5), COC.woodDk, { w: 1.5 });
    // estante de atrás con frascos o flores
    s += face(rr(-hw + 4, -50, w - 8, 4, 1), COC.woodLt, { w: 1.3 });
    // mercadería sobre el mostrador
    s += crateSvg(-28, top + 1, 34, o.fruits[0]);
    s += basketSvg(5, top + 2, 26, o.fruits[1]);
    s += crateSvg(32, top + 1, 30, o.fruits[2]);
    // mostrador
    s += face(rr(-hw, top, w, 8, 2), COC.woodLt, { w: 1.7 });
    s += face(rr(-hw, -ch, w, ch, 2), COC.wood, { w: 1.9 });
    s += line(`M${-hw + 2} ${-ch + 7.5}H${hw - 2}M${-hw + 2} ${-ch + 15}H${hw - 2}`, COC.woodDk, 1.6, { opacity: 0.9 });
    s += line(`M${-hw + 8} ${-ch + 4}q10 -1.5 20 0M${-hw + 46} ${-ch + 11}q12 1.5 24 0M${-hw + 18} ${-ch + 19}q9 -1 18 0`, COC.woodDk, 1.1, { opacity: 0.55 });
    s += line(`M${-hw + 2} ${top + 1.5}H${hw - 2}`, '#F6D2A2', 1.4);
    // tela del mostrador con el color del toldo
    let cl = `M${-hw + 14} ${-ch}H${hw - 14}V${-ch + 9}`;
    for (let x = hw - 14; x > -hw + 14; x -= 9) cl += `Q${f1(x - 4.5)} ${-ch + 14} ${f1(x - 9)} ${-ch + 9}`;
    s += part(`${cl}Z`, c2, { w: 1.4 });
    s += part(`M${-6} ${-ch + 2}h12v8l-6 -3l-6 3Z`, c1, { w: 1.3 });
    // postes de adelante
    s += face(rr(-hw - 3, -74, 6, 74, 2), COC.wood, { w: 1.7 }) + face(rr(hw - 3, -74, 6, 74, 2), COC.wood, { w: 1.7 });
    s += line(`M${-hw - 1.5} -72V-2M${hw - 1.5} -72V-2`, COC.woodLt, 1.2, { opacity: 0.8 });
    // sombra del toldo sobre lo de atrás
    s += tonePath(`M${-hw + 2} -64H${hw - 2}V-54Q0 -50 ${-hw + 2} -54Z`, '#3B2840', 0.22);
    // toldo: cara de arriba (inclinada hacia adelante) y festón
    const yb = (x) => -66 + 3 * (x / (hw + 6)) ** 2; // borde de adelante, curvo
    const yt = (x) => -86 + 1.5 * (x / (hw + 6)) ** 2;
    const n = 8, sw = (w + 12) / n;
    for (let i = 0; i < n; i++) {
      const xa = -hw - 6 + i * sw, xb = xa + sw, xm = (xa + xb) / 2;
      const col = i % 2 ? c2 : c1;
      const ya = yt(xa) + 2, yb2 = yt(xb) + 2;
      s += face(poly([[xa + 2, ya], [xb + 2, yb2], [xb, yb(xb)], [xa, yb(xa)]]), col, { w: 1.4 });
      s += part(`M${f1(xa)} ${f1(yb(xa) - 1)}H${f1(xb)}V${f1(yb(xb) + 3)}Q${f1(xm + sw * 0.25)} ${f1(yb(xm) + 9)} ${f1(xm)} ${f1(yb(xm) + 9)}Q${f1(xm - sw * 0.25)} ${f1(yb(xm) + 9)} ${f1(xa)} ${f1(yb(xa) + 3)}Z`, col, { w: 1.4 });
    }
    s += line(`M${-hw - 4} ${f1(yt(-hw) + 3)}L${hw + 8} ${f1(yt(hw) + 3)}`, '#FFFFFF', 1.6, { opacity: 0.55 });
    // letrero arriba con la fruta pintada
    s += line(`M-10 ${-88}V${-96}M10 ${-88}V${-96}`, COC.woodDk, 2);
    s += face(rr(-16, -106, 32, 12, 2), '#FFF4E0', { w: 1.6 });
    s += o.sign === 'veg' ? carrotBunch(0, -95) : appleSvg(-5, -96, 3.4) + orangeSvg(5, -96, 3.2);
    // pizarrita y balanza
    s += priceBoard(-hw + 12, -ch + 2, c1);
    s += scaleSvg(hw - 14, top + 1);
    return { box: [-hw - 8, -108, hw + 10, 4], svg: s, shadow: [2, 1, hw + 4, 5], solid: [[-hw - 6, -100, hw + 10, 4]] };
  });
}

// Puesto de flores: gradas de madera con baldes de flores y un toldito.
function flowerStall() {
  return def('puesto-flores', () => {
    let s = '';
    s += face(rr(-34, -66, 4, 66, 1.5), COC.woodDk, { w: 1.4 }) + face(rr(30, -66, 4, 66, 1.5), COC.woodDk, { w: 1.4 });
    const bucket = (x, y, c, c2) => {
      let b = '';
      for (let i = 0; i < 5; i++) { const fx = x - 6 + i * 3, fy = y - 12 - (i % 2) * 4; b += line(`M${fx} ${y - 6}L${fx} ${fy + 2}`, COC.leafDk, 1.4); }
      [[-5, -14, c], [0, -18, c2], [5, -14, c], [-2.5, -11, c2], [3, -11, c]].forEach(([dx, dy, col]) => { b += part(circ(x + dx, y + dy, 2.8), col, { w: 1 }); });
      b += face(`M${x - 6} ${y - 8}L${x - 5} ${y}H${x + 5}L${x + 6} ${y - 8}Z`, '#9AA6B4', { w: 1.3 }) + line(`M${x - 5.5} ${y - 5}H${x + 5.5}`, '#C7CED8', 1.1);
      return b;
    };
    // gradas
    s += face(rr(-30, -44, 60, 6, 1), COC.woodLt, { w: 1.4 });
    [[-20, -44, '#F47FA4', '#FFFFFF'], [0, -44, '#FFD45C', '#FFA552'], [20, -44, '#B79BF2', '#FFFFFF']].forEach(([x, y, c, c2]) => { s += bucket(x, y, c, c2); });
    s += face(rr(-32, -26, 64, 6, 1), COC.woodLt, { w: 1.4 });
    [[-22, -26, '#E8574F', '#F47FA4'], [-4, -26, '#FFFFFF', '#FFD45C'], [14, -26, '#F47FA4', '#B79BF2'], [28, -26, '#7FC3F0', '#FFFFFF']].forEach(([x, y, c, c2]) => { s += bucket(x, y, c, c2); });
    s += face(rr(-34, -20, 68, 20, 2), COC.wood, { w: 1.8 }) + line('M-32 -10H32', COC.woodDk, 1.4);
    s += bucket(-26, 4, '#FFD45C', '#FFFFFF') + bucket(26, 6, '#F47FA4', '#E8574F');
    // toldito a rayas con festón
    const n = 6, sw = 76 / n;
    for (let i = 0; i < n; i++) {
      const xa = -38 + i * sw, xb = xa + sw, xm = (xa + xb) / 2, col = i % 2 ? '#FFFFFF' : '#F47FA4';
      s += face(poly([[xa + 1, -80], [xb + 1, -80], [xb, -70], [xa, -70]]), col, { w: 1.3 });
      s += part(`M${f1(xa)} -71H${f1(xb)}V-68Q${f1(xm + sw * 0.3)} -62 ${f1(xm)} -62Q${f1(xm - sw * 0.3)} -62 ${f1(xa)} -68Z`, col, { w: 1.3 });
    }
    s += tonePath('M-32 -68H32V-60Q0 -57 -32 -60Z', '#3B2840', 0.2);
    return { box: [-40, -82, 40, 12], svg: s, shadow: [0, 1, 36, 4], solid: [[-38, -80, 38, 10]] };
  });
}

// Carretilla de frutas con dos ruedas y manija.
function fruitCart(kind = 'manzana') {
  return def(`carretilla-${kind}`, () => {
    let s = '';
    s += line('M22 -12L34 -4', COC.woodDk, 2.6);
    s += fruitPile(kind, -2, -22, 40) + fruitPile(kind === 'manzana' ? 'naranja' : 'manzana', -2, -18, 44);
    s += face('M-26 -22H22L18 -8H-22Z', COC.wood, { w: 1.8 }) + line('M-24 -15H20', COC.woodDk, 1.3);
    s += face(circ(-14, -5, 6), COC.woodDk, { w: 1.6 }) + flat(circ(-14, -5, 2), '#8C7A70');
    s += face(circ(10, -5, 6), COC.woodDk, { w: 1.6 }) + flat(circ(10, -5, 2), '#8C7A70');
    s += priceBoard(18, -20, '#E8574F');
    return { box: [-28, -42, 36, 3], svg: s, shadow: [0, 0, 26, 3] };
  });
}

// Pila de cajones en el piso (para el frente de un puesto).
function crateStack(id, kinds) {
  return def(`cajones-${id}`, () => {
    let s = crateSvg(-10, 2, 24, kinds[0]) + crateSvg(12, 6, 22, kinds[1]);
    if (kinds[2]) s += melonSvg(-2, 10, 7) + melonSlice(16, 12, 6);
    return { box: [-24, -26, 26, 14], svg: s, shadows: [[-10, 3, 13, 2.5], [12, 7, 12, 2.5]] };
  });
}

// Barril de madera con flejes (y algo encima).
function barrelSvg(x, y, top = 'manzana') {
  let s = face(`M${x - 9} ${y - 20}Q${x - 11} ${y - 10} ${x - 9} ${y}H${x + 9}Q${x + 11} ${y - 10} ${x + 9} ${y - 20}Z`, '#B9824E', { w: 1.6 });
  s += line(`M${x - 10} ${y - 15}H${x + 10}M${x - 10} ${y - 5}H${x + 10}`, '#6E6670', 2);
  s += line(`M${x - 4} ${y - 19}V${y - 1}M${x + 3} ${y - 19}V${y - 1}`, '#9C6A40', 1.1, { opacity: 0.6 });
  s += face(ell(x, y - 20, 9, 3.6), '#D9A46A', { w: 1.4 });
  if (top) s += fruitPile(top, x, y - 20, 16);
  return s;
}

// Bolsas de arpillera (papas, harina).
function sackSvg(x, y, c = '#E3CFA2', mark = '#C98F5A') {
  let s = part(`M${x - 8} ${y}Q${x - 10} ${y - 10} ${x - 6} ${y - 15}L${x - 3} ${y - 19}H${x + 3}L${x + 6} ${y - 15}Q${x + 10} ${y - 10} ${x + 8} ${y}Z`, c, { w: 1.5 });
  s += line(`M${x - 4} ${y - 17}H${x + 4}`, '#8C7A70', 1.6);
  return s + flat(rr(x - 4, y - 10, 8, 5, 1.5), mark);
}

// Farol de calle (hierro verde con su luz).
function streetLamp() {
  return def('farola', () => {
    let s = face(rr(-4, -6, 8, 6, 1.5), '#4E7A6A', { w: 1.4 });
    s += part(rr(-1.8, -50, 3.6, 46, 1.4), '#4E7A6A', { w: 1.3 });
    s += part('M-6 -50H6L4 -62H-4Z', '#FFF0B0', { w: 1.4 }) + line('M0 -50V-62', '#4E7A6A', 1.2);
    s += part('M-8 -61H8L0 -68Z', '#4E7A6A', { w: 1.4 }) + part(circ(0, -69.5, 2), '#4E7A6A', { w: 1.1 });
    s += line('M-1.8 -40H-7Q-9 -40 -9 -38', '#4E7A6A', 1.6) + part(rr(-12, -38, 6, 5, 1.5), '#F47FA4', { w: 1 });
    return { box: [-14, -72, 10, 3], svg: s, shadow: [0, 1, 6, 2] };
  });
}

// Banco de plaza (madera y hierro).
function bench() {
  return def('banco', () => {
    let s = line('M-16 0V-8M16 0V-8M-14 -8V-20M14 -8V-20', '#4E7A6A', 2);
    s += face(rr(-19, -10, 38, 4, 1.2), COC.woodLt, { w: 1.4 });
    s += face(rr(-18, -22, 36, 4, 1.2), COC.wood, { w: 1.3 }) + face(rr(-18, -16, 36, 4, 1.2), COC.wood, { w: 1.3 });
    return { box: [-21, -24, 21, 3], svg: s, shadow: [0, 1, 18, 2.4] };
  });
}

// Cantero de madera: tabla de adelante con vetas, borde de arriba, tierra
// con surcos y una verdura por surco. La tierra de cada surco tapa la
// parte de abajo de lo plantado.
function raisedBed(id, w, crops) {
  return def(`cantero-${id}`, () => {
    const hw = w / 2, fh = 12, rowH = 16, D = 10 + crops.length * rowH;
    let s = '';
    s += face(rr(-hw, -fh - D, w, D + 4, 3), COC.woodLt, { w: 1.8 });
    s += flat(rr(-hw + 5, -fh - D + 5, w - 10, D - 4, 2), COC.soil);
    const rowY = (i) => -fh - D + 9 + (i + 0.62) * rowH;
    crops.forEach((crop, i) => {
      const y = rowY(i);
      const big = crop === 'lechuga' || crop === 'repollo';
      const n = Math.floor((w - 14) / (big ? 20 : 15));
      const gap = (w - 14) / n;
      // surco hundido detrás
      s += flat(rr(-hw + 5, y - 5, w - 10, 3, 0), COC.soilDk);
      for (let j = 0; j < n; j++) {
        const x = f1(-hw + 7 + gap * (j + 0.5) + (i % 2 ? 3 : -3));
        if (crop === 'zanahoria') s += carrotInSoil(x, y);
        if (crop === 'lechuga') s += lettuceSvg(x, y + 2, 9);
        if (crop === 'repollo') s += cabbageSvg(x, y + 2, 7.5);
      }
      // el lomo de tierra del surco, adelante de lo plantado
      let rd = `M${-hw + 5} ${f1(y + 0.5)}`;
      for (let x = -hw + 5; x <= hw - 5; x += 7) rd += `Q${x + 3.5} ${f1(y - 1.5)} ${x + 7} ${f1(y + 0.5)}`;
      rd += `L${hw - 5} ${f1(y + 5)}L${-hw + 5} ${f1(y + 5)}Z`;
      s += flat(rd, COC.soilLt);
      s += flat(rr(-hw + 8, y + 1, 3, 1.6, 0.6) + rr(-hw + 30, y + 2, 3, 1.6, 0.6) + rr(hw - 24, y + 1.5, 3, 1.6, 0.6), '#C99A70');
    });
    // tabla de adelante y esquineros
    s += face(rr(-hw, -fh, w, fh, 2), COC.wood, { w: 1.9 });
    s += line(`M${-hw + 3} ${-fh + 6}H${hw - 3}`, COC.woodDk, 1.4, { opacity: 0.85 });
    s += line(`M${-hw + 10} ${-fh + 3}q12 -1.4 24 0M${f1(hw * 0.1)} ${-fh + 9}q14 1.4 28 0`, COC.woodDk, 1.1, { opacity: 0.5 });
    s += line(`M${-hw + 2} ${-fh + 1.5}H${hw - 2}`, '#F6D2A2', 1.4);
    s += face(rr(-hw - 2, -fh - 4, 7, fh + 4, 1.5), COC.woodDk, { w: 1.6 }) + face(rr(hw - 5, -fh - 4, 7, fh + 4, 1.5), COC.woodDk, { w: 1.6 });
    s += flat(rr(-hw + 0.5, -fh + 2, 2, 2, 0.5) + rr(hw - 2.5, -fh + 2, 2, 2, 0.5), '#8C7A70');
    return { box: [-hw - 4, -fh - D - 18, hw + 4, 4], svg: s, shadow: [0, 1, hw + 2, 4], solid: [[-hw - 2, -fh - D - 8, hw + 2, 3]] };
  });
}

// Tomatera atada a sus tutores, con tomates maduros y alguno verde.
function tomatoPlant(id, h = 48) {
  return def(`tomatera-${id}-${h}`, () => {
    let s = '';
    s += face(rr(-9, -h, 4, h, 1.5), COC.woodLt, { w: 1.4 }) + face(rr(6, -h + 4, 4, h - 4, 1.5), COC.woodLt, { w: 1.4 });
    s += face(rr(-11, -h * 0.62, 23, 3.4, 1.5), COC.woodLt, { w: 1.3 });
    const clumps = [[-6, -h * 0.25, 9], [6, -h * 0.4, 9], [-5, -h * 0.58, 8], [7, -h * 0.74, 8], [-2, -h * 0.9, 7]];
    clumps.forEach(([x, y, r]) => { s += part(fluffD(x, y, r, 6, 0.22, x * 0.1), COC.leaf, { w: 1.4 }); s += flat(fluffD(x - r * 0.25, y - r * 0.3, r * 0.5, 5, 0.2, 1), COC.leafLt); });
    s += line(`M-7 ${f1(-h * 0.3)}l3 2M8 ${f1(-h * 0.5)}l-3 2M-7 ${f1(-h * 0.7)}l3 2`, '#F2E2C2', 1.6);
    [[-9, -h * 0.18, 4.4, '#E8443C'], [9, -h * 0.32, 4.4, '#E8443C'], [-2, -h * 0.46, 4, '#F25A44'], [10, -h * 0.62, 3.8, '#E8443C'], [-8, -h * 0.66, 3.8, '#9BCB4C'], [3, -h * 0.82, 3.6, '#F07A3A']].forEach(([x, y, r, c]) => { s += tomatoSvg(f1(x), f1(y + r), r, c); });
    s += flat(tuftD(-4, 1, 0.7) + tuftD(5, 1, 0.6), COC.grassDp);
    return { box: [-16, -h - 10, 18, 4], svg: s, shadow: [0, 1, 12, 3] };
  });
}

// Zapallos con hojas grandes y zarcillos.
function pumpkinPatch() {
  return def('zapallos', () => {
    let s = '';
    s += part(fluffD(-16, -14, 11, 5, 0.25, 0.3), COC.leafDk, { w: 1.5 }) + flat(fluffD(-18, -16, 6, 5, 0.2, 1), COC.leaf);
    s += part(fluffD(20, -12, 10, 5, 0.25, 1.2), COC.leafDk, { w: 1.5 }) + flat(fluffD(18, -14, 5, 5, 0.2, 0.4), COC.leaf);
    const pk = (x, y, r, c) => {
      let p = part(ell(x - r * 0.45, y - r * 0.62, r * 0.6, r * 0.62), tone(c, -0.35), { w: 1.4 });
      p += part(ell(x + r * 0.45, y - r * 0.62, r * 0.6, r * 0.62), tone(c, -0.35), { w: 1.4 });
      p += part(ell(x, y - r * 0.66, r * 0.55, r * 0.66), c, { w: 1.5 });
      p += part(`M${x - 1.6} ${f1(y - r * 1.2)}q-1 -5 3 -6l1.6 1.4q-2.6 1 -1.6 4.6Z`, '#7A8A3A', { w: 1.1 });
      return p + shine(ell(x - r * 0.18, y - r * 0.95, r * 0.12, r * 0.16), 0.7);
    };
    s += pk(-6, 0, 13, '#F29B44') + pk(16, 4, 9, '#F5B04E');
    s += line('M-26 -2q-6 -4 -2 -9q4 -3 5 1M28 2q6 -3 3 -8', COC.leafDk, 1.4);
    return { box: [-30, -28, 32, 6], svg: s, shadows: [[-6, 1, 14, 3], [16, 5, 10, 2.5]] };
  });
}

// Girasoles de distintas alturas (corona de pétalos en un solo trazo).
function sunflowers(id, list) {
  return def(`girasoles-${id}`, () => {
    let s = '';
    list.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, h]) => {
      s += part(rr(x - 1.6, y - h, 3.2, h, 1.4), '#5E9E4A', { w: 1.2 });
      s += part(leafD(x, y - h * 0.4, 10, -160, 3.4), COC.leaf, { w: 1.2 }) + part(leafD(x, y - h * 0.6, 9, -20, 3.2), COC.leafLt, { w: 1.2 });
      const cy = y - h - 3;
      s += part(starD(x, cy, 11, 0.62, 12, -90), '#FFD23E', { w: 1.3 });
      s += flat(starD(x, cy, 8, 0.7, 12, -75), '#FFE680');
      s += part(circ(x, cy, 4.8), '#8A5A2E', { w: 1.3 }) + flat(rr(x - 2, cy - 2, 1.5, 1.5, 0.4) + rr(x + 1, cy - 1, 1.5, 1.5, 0.4) + rr(x - 1, cy + 1.5, 1.5, 1.5, 0.4), '#5E3A1C');
    });
    const xs = list.map((f) => f[0]);
    return { box: [Math.min(...xs) - 13, -Math.max(...list.map((f) => f[2])) - 18, Math.max(...xs) + 13, 6], svg: s, shadows: list.map(([x, y]) => [x, y + 1, 5, 1.8]) };
  });
}

// Espantapájaros con sombrero de paja, camisa a cuadros y un pajarito.
function scarecrow() {
  return def('espantapajaros', () => {
    let s = face(rr(-2.5, -46, 5, 46, 1.5), COC.woodDk, { w: 1.5 });
    s += face(rr(-22, -38, 44, 4.4, 1.5), COC.woodDk, { w: 1.5 });
    s += part('M-24 -38l-5 -2l2 4l-3 2l5 0Z', '#F2CF6A', { w: 1.1 }) + part('M24 -38l5 -2l-2 4l3 2l-5 0Z', '#F2CF6A', { w: 1.1 });
    s += face('M-15 -40H15L12 -20H-12Z', '#E8574F', { w: 1.6 });
    s += line('M-9 -40L-7.5 -20M0 -40V-20M9 -40L7.5 -20M-14 -33H14M-13 -26H13', '#B83A3A', 1.3, { opacity: 0.8 });
    s += part(rr(-4, -32, 6, 6, 1), '#7FB4E6', { w: 1.1 });
    s += part('M-8 -20L-10 -10L-4 -12L0 -9L4 -12L10 -10L8 -20Z', '#F2CF6A', { w: 1.3 });
    s += part(circ(0, -48, 8), '#EBD3A2', { w: 1.6 });
    s += flat(rr(-4, -50, 2.4, 2.4, 0.8) + rr(2, -50, 2.4, 2.4, 0.8), '#3A2A3E');
    s += line('M-4 -45q4 3 8 0M-3 -44.4v1.4M0 -43.6v1.4M3 -44.4v1.4', '#8A5A3C', 1.1);
    s += flat(ell(-5.5, -46, 1.6, 1) + ell(5.5, -46, 1.6, 1), '#F7A8A0');
    s += part(ell(0, -55, 15, 3.6), '#E9C25A', { w: 1.5 }) + part('M-8 -55C-8 -64 8 -64 8 -55Z', '#E9C25A', { w: 1.5 }) + flat(rr(-8, -58, 16, 2.4, 0), '#E8574F');
    // pajarito en el brazo
    s += part(ell(18, -42, 4, 3.2), '#7FB4E6', { w: 1.2 }) + part(circ(21, -45, 2.4), '#7FB4E6', { w: 1.1 }) + flat(rr(21.6, -45.8, 1.2, 1.2, 0.3), '#3A2A3E') + part('M23 -45l2.4 0.8l-2.4 0.8Z', '#FFB347', { w: 0.8 });
    return { box: [-31, -66, 31, 3], svg: s, shadow: [0, 1, 8, 2] };
  });
}

// Cobertizo de madera con techo de tejas, herramientas y regadera.
function gardenShed() {
  return def('cobertizo', () => {
    const w = 64, hw = w / 2, h = 40;
    let s = '';
    s += face(rr(-hw, -h, w, h, 2), '#C98A5A', { w: 2 });
    let pl = '';
    for (let x = -hw + 8; x < hw; x += 8) pl += `M${x} ${-h + 2}V-2`;
    s += line(pl, '#A56E44', 1.3, { opacity: 0.8 });
    s += tonePath(`M${hw - 10} ${-h}H${hw}V0H${hw - 10}Z`, '#5A3424', 0.2);
    // puerta con su cruz de madera
    s += face(rr(-10, -30, 20, 30, 1.5), '#8E5A36', { w: 1.7 });
    s += line('M-8 -28L8 -4M-8 -16H8', '#6E4228', 1.6);
    s += flat(circ(6, -15, 1.4), '#FFD45C');
    // ventanita con jardinera
    s += face(rr(15, -31, 12, 11, 1.5), '#FFFFFF', { w: 1.5 }) + flat(rr(16.5, -29.5, 9, 8, 0.5), '#BFE4FA') + line('M21 -29.5V-21.5M16.5 -25.5H25.5', '#FFFFFF', 1.2);
    s += face(rr(14, -20, 14, 4, 1.2), '#9C6A40', { w: 1.3 }) + flat(circ(17, -21, 2) + circ(21.5, -21.6, 2) + circ(25.5, -21, 2), '#F47FA4');
    // techo de tejas (cara de adelante del techo)
    s += face(rr(-hw - 6, -h - 22, w + 12, 24, 2), '#D6674F', { w: 2 });
    let tl = '';
    for (let row = 0; row < 3; row++) {
      const y = -h - 16 + row * 7;
      tl += `M${-hw - 4} ${y}`;
      for (let x = -hw - 4; x < hw + 5; x += 8) tl += `Q${x + 4} ${y + 4} ${x + 8} ${y}`;
    }
    s += line(tl, '#A9483A', 1.4, { opacity: 0.9 });
    s += line(`M${-hw - 4} ${-h - 20}H${hw + 4}`, '#F09A7E', 1.6, { opacity: 0.9 });
    s += tonePath(`M${-hw} ${-h}H${hw}V${-h + 5}H${-hw}Z`, '#3B2840', 0.25);
    // rastrillo y pala apoyados
    s += line(`M${-hw - 4} -2L${-hw + 2} -36`, COC.woodDk, 2.4) + part(`M${-hw - 2} -40h12v3h-12Z`, '#9AA2AE', { w: 1.1, a: { transform: `rotate(10 ${-hw + 2} -38)` } });
    s += line(`M${-hw + 10} -2L${-hw + 12} -30`, COC.woodDk, 2.4);
    s += part(`M${-hw + 8} -2l2 -9h6l1 9Z`, '#B8BEC8', { w: 1.2 });
    // regadera
    s += part(`M${hw + 4} 0V-11H${hw + 16}V0Z`, '#5FB3A0', { w: 1.5 }) + line(`M${hw + 16} -8L${hw + 22} -14`, '#5FB3A0', 2.4) + line(`M${hw + 6} -11Q${hw + 10} -17 ${hw + 14} -11`, '#3E8C7A', 1.6);
    return { box: [-hw - 8, -h - 24, hw + 24, 4], svg: s, shadow: [4, 1, hw + 8, 4] };
  });
}

// Cerca de madera (tablas en punta y dos travesaños).
function woodFence(len) {
  return def(`cercaMadera-${len}`, () => {
    let s = '';
    s += face(rr(-len / 2, -17, len, 4, 1), COC.woodLt, { w: 1.4 }) + face(rr(-len / 2, -8, len, 4, 1), COC.woodLt, { w: 1.4 });
    const n = Math.max(2, Math.round(len / 9));
    for (let i = 0; i <= n; i++) {
      const x = -len / 2 + (i * len) / n;
      s += face(`M${f1(x - 3)} 0V-20L${f1(x)} -24L${f1(x + 3)} -20V0Z`, i % 4 === 0 ? COC.woodDk : '#F0E2C6', { w: 1.4 });
    }
    return { box: [-len / 2 - 4, -26, len / 2 + 4, 3], svg: s, shadows: [[0, 1, len / 2, 2.5]] };
  });
}

// Manzano para los bordes: tronco, copa en tres verdes, manzanas.
function appleTree(id, R = 26, h = 26, fruit = '#E8475A') {
  return def(`manzano-${id}`, () => {
    let s = face(`M-4 0L-3 ${-h}H3L4 0Z`, '#9C6A40', { w: 1.6 });
    s += line(`M-1 ${-h * 0.4}l-6 -6M1 ${-h * 0.6}l5 -5`, '#9C6A40', 2.4);
    const cy = -h - R * 0.7;
    s += part(fluffD(0, cy, R, 8, 0.16, 0.3), COC.leafDk, { w: 2 });
    s += flat(fluffD(-R * 0.15, cy - R * 0.15, R * 0.78, 7, 0.16, 1), COC.leaf);
    s += flat(fluffD(-R * 0.35, cy - R * 0.38, R * 0.42, 6, 0.18, 0.5), COC.leafLt);
    [[-0.5, 0.1], [0.3, -0.35], [0.55, 0.25], [-0.1, 0.45], [-0.3, -0.5]].forEach(([a, b]) => { s += part(circ(f1(a * R), f1(cy + b * R), 3.2), fruit, { w: 1.1 }) + flat(rr(f1(a * R - 1.6), f1(cy + b * R - 1.8), 1.4, 1.4, 0.4), '#FFFFFF'); });
    return { box: [-R - 2, cy - R - 2, R + 2, 4], svg: s, shadow: [0, 1, R * 0.6, 4], solid: [[-R, cy - R, R, cy + R * 0.6], [-6, cy + R * 0.6, 6, 2]] };
  });
}

// Arbusto redondo (con flores o bayas).
function bush(id, R = 12, dots = '#F47FA4') {
  return def(`arbusto-${id}-${R}`, () => {
    let s = part(fluffD(0, -R * 0.8, R, 7, 0.18, 0.5).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, a, b) => `${a} ${f1(-R * 0.8 + (parseFloat(b) + R * 0.8) * 0.8)}`), COC.leafDk, { w: 1.6 });
    s += flat(fluffD(-R * 0.2, -R * 0.95, R * 0.6, 6, 0.2, 1), COC.leaf);
    s += flat(fluffD(-R * 0.35, -R * 1.1, R * 0.3, 5, 0.2, 0.2), COC.leafLt);
    if (dots) s += flat([[-0.5, -0.6], [0.3, -1.1], [0.55, -0.45], [-0.1, -0.3]].map(([a, b]) => rr(f1(a * R - 1.5), f1(b * R - 1.5), 3, 3, 1)).join(''), dots);
    return { box: [-R - 2, -R * 1.7, R + 2, 4], svg: s, shadow: [0, 1, R * 0.9, 2.6] };
  });
}

// La pastelería: fachada con vitrina (tortas en bases, panes, medialunas,
// cupcakes en estantes), toldo, puerta con campanita, letrero colgante,
// jardinera, techo de tejas de chocolate con glaseado y un cupcake gigante.
function bakery() {
  return def('pasteleria', () => {
    const w = 148, hw = w / 2, h = 86;
    let s = '';
    // chimenea con humito
    s += face(rr(40, -h - 46, 12, 24, 1.5), '#C9776A', { w: 1.6 }) + face(rr(38, -h - 50, 16, 6, 1.5), '#E0948A', { w: 1.4 });
    s += part(fluffD(50, -h - 60, 5, 5, 0.2, 0), '#FFFFFF', { w: 1.3 }) + part(fluffD(56, -h - 70, 4, 5, 0.2, 1), '#FFFFFF', { w: 1.2 });
    // techo de tejas de chocolate (cara de adelante) con glaseado
    s += face(rr(-hw - 6, -h - 30, w + 12, 30, 3), '#9C6446', { w: 2 });
    let tl = '';
    for (let row = 0; row < 3; row++) {
      const y = -h - 24 + row * 8;
      tl += `M${-hw - 4} ${y}`;
      for (let x = -hw - 4; x < hw + 5; x += 10) tl += `Q${x + 5} ${y + 5} ${x + 10} ${y}`;
    }
    s += line(tl, '#7B4A33', 1.5, { opacity: 0.9 });
    let dr = `M${-hw - 6} ${-h - 4}`;
    for (let x = -hw - 6, i = 0; x < hw + 6; x += 12, i++) { const dep = i % 2 ? 4 : 9; dr += `Q${x + 2} ${-h + dep} ${x + 6} ${-h + dep}Q${x + 10} ${-h + dep} ${x + 12} ${-h - 4}`; }
    s += part(`${dr}V${-h - 8}H${-hw - 6}Z`, '#FFF6F0', { w: 1.6 });
    s += line(`M${-hw - 4} ${-h - 28}H${hw + 4}`, '#C48C62', 1.6, { opacity: 0.9 });
    // cupcake gigante en el techo (el letrero de la tienda)
    s += face('M-13 -136L-16 -114H16L13 -136Z', '#F7A8C0', { w: 1.8 });
    s += line('M-8 -135L-9.5 -115M-2.6 -135V-115M2.6 -135V-115M8 -135L9.5 -115', '#E07C9C', 1.3, { opacity: 0.85 });
    s += part('M-17 -134C-20 -146 -8 -154 0 -152C8 -154 20 -146 17 -134C10 -130 -10 -130 -17 -134Z', '#FFF2E4', { w: 1.8 });
    s += part('M-10 -148C-10 -158 10 -158 10 -148C5 -145 -5 -145 -10 -148Z', '#FFF8F0', { w: 1.6 });
    s += part(circ(0, -158, 4.6), '#E8443C', { w: 1.5 }) + shine(circ(-1.5, -159.5, 1.3), 0.9);
    s += flat(rr(-12, -140, 4, 1.8, 0.8) + rr(-2, -143, 4, 1.8, 0.8) + rr(7, -139, 4, 1.8, 0.8), '#7FC3F0');
    // pared
    s += face(rr(-hw, -h, w, h, 2), '#FBD3DB', { w: 2 });
    s += tonePath(`M${hw - 16} ${-h}H${hw}V0H${hw - 16}Z`, '#8A4A5A', 0.14);
    s += face(rr(-hw - 3, -h - 2, w + 6, 6, 1.5), '#FFFFFF', { w: 1.6 });
    // zócalo de ladrillos
    s += face(rr(-hw, -16, w, 16, 1.5), '#D98A72', { w: 1.8 });
    let br = '';
    for (let y = -11, row = 0; y < 0; y += 5, row++) br += `M${-hw + 1} ${y}H${hw - 1}`;
    for (let x = -hw + 8; x < hw; x += 12) br += `M${x} -16V-11M${x + 6} -11V-6M${x} -6V-1`;
    s += line(br, '#F4C2B0', 1.2, { opacity: 0.9 });
    // vitrina con estantes y cosas ricas
    const vx = -64, vy = -66, vw = 72, vh = 46;
    s += face(rr(vx - 3, vy - 3, vw + 6, vh + 6, 2), '#FFFFFF', { w: 1.8 });
    s += flat(rr(vx, vy, vw, vh, 1), '#D9EEF4');
    s += flat(rr(vx, vy + 20, vw, 2.4, 0), '#C98F5A') + flat(rr(vx, vy + vh - 3, vw, 3, 0), '#C98F5A');
    // estante de arriba: torta en su base y cupcakes
    s += face(rr(vx + 8, vy + 16, 18, 4, 1), '#E8E4F0', { w: 1.2 }) + part(rr(vx + 15, vy + 12, 4, 5, 1), '#E8E4F0', { w: 1 });
    s += face(rr(vx + 7, vy + 2, 20, 10, 2), '#FFF2E4', { w: 1.3 }) + flat(rr(vx + 7.5, vy + 6, 19, 2.4, 0), '#F27C98') + part(circ(vx + 17, vy + 1.5, 2.4), '#E8443C', { w: 1 });
    for (const [cx, col] of [[vx + 36, '#FFC4D8'], [vx + 48, '#C9B6FF'], [vx + 60, '#FFF0C2']]) {
      s += face(`M${cx - 4} ${vy + 13}L${cx - 3} ${vy + 19}H${cx + 3}L${cx + 4} ${vy + 13}Z`, '#F7C873', { w: 1.1 });
      s += part(`M${cx - 5} ${vy + 13}C${cx - 5} ${vy + 7} ${cx + 5} ${vy + 7} ${cx + 5} ${vy + 13}Z`, col, { w: 1.1 }) + flat(circ(cx, vy + 7.5, 1.4), '#E8443C');
    }
    // estante de abajo: panes, medialunas y una baguette
    for (const bx of [vx + 10, vx + 24]) {
      s += part(`M${bx - 6} ${vy + 42}C${bx - 7} ${vy + 34} ${bx + 7} ${vy + 34} ${bx + 6} ${vy + 42}Z`, '#E0A35A', { w: 1.2 });
      s += line(`M${bx - 3} ${vy + 38}l2 -2M${bx + 1} ${vy + 38}l2 -2`, '#F6D59A', 1.2);
    }
    for (const cx of [vx + 40, vx + 54]) {
      s += part(`M${cx - 8} ${vy + 42}Q${cx} ${vy + 32} ${cx + 8} ${vy + 42}Q${cx} ${vy + 38} ${cx - 8} ${vy + 42}Z`, '#E9B060', { w: 1.2 });
      s += line(`M${cx - 3} ${vy + 36}l1 4M${cx + 3} ${vy + 36}l-1 4`, '#C98436', 1.1);
    }
    s += part(rr(vx + 62, vy + 26, 6, 16, 3), '#E0A35A', { w: 1.1 });
    // brillos del vidrio
    s += shine(`M${vx + 6} ${vy + vh}L${vx + 24} ${vy}H${vx + 30}L${vx + 12} ${vy + vh}Z`, 0.35) + shine(`M${vx + 34} ${vy + vh}L${vx + 52} ${vy}H${vx + 55}L${vx + 37} ${vy + vh}Z`, 0.3);
    // jardinera bajo la vitrina
    s += face(rr(vx - 2, vy + vh + 3, vw + 4, 7, 1.5), '#9C6A40', { w: 1.5 });
    s += flat([0, 12, 24, 36, 48, 60, 70].map((d) => circ(vx + 2 + d, vy + vh + 2, 3)).join(''), '#6DBA5E');
    s += flat([6, 30, 54].map((d) => circ(vx + 2 + d, vy + vh + 1, 2.4)).join(''), '#F47FA4') + flat([18, 42, 66].map((d) => circ(vx + 2 + d, vy + vh + 1, 2.4)).join(''), '#FFD45C');
    // puerta con vidrio, campanita y corazón de "abierto"
    const dx = 22;
    s += face(rr(dx - 3, -60, 32, 60, 2), '#FFFFFF', { w: 1.8 });
    s += face(rr(dx, -57, 26, 57, 1.5), '#8ACBB8', { w: 1.6 });
    s += flat(rr(dx + 4, -53, 18, 22, 1), '#D9EEF4') + shine(`M${dx + 6} -31L${dx + 14} -53H${dx + 17}L${dx + 9} -31Z`, 0.35);
    s += part(`M${dx + 13} -40C${dx + 7} -44 ${dx + 8} -49 ${dx + 13} -46.5C${dx + 18} -49 ${dx + 19} -44 ${dx + 13} -40Z`, '#F47FA4', { w: 1.1 });
    s += line(`M${dx + 4} -24H${dx + 22}M${dx + 4} -14H${dx + 22}`, '#6DAE9A', 1.4) + flat(circ(dx + 21, -28, 1.6), '#FFD45C');
    s += part(`M${dx + 11} -66h4l1 4h-6Z`, '#FFD45C', { w: 1.1 });
    s += face(rr(dx - 6, 0, 38, 4, 1.5), '#E2D6CC', { w: 1.4 });
    // toldo a rayas con festón sobre la vitrina y la puerta
    const n = 11, ax0 = -hw + 2, aw = w - 4, sw = aw / n;
    for (let i = 0; i < n; i++) {
      const xa = ax0 + i * sw, xb = xa + sw, xm = (xa + xb) / 2;
      const col = i % 2 ? '#FFFFFF' : '#F47FA4';
      s += face(poly([[xa + 1, -82], [xb + 1, -82], [xb, -72], [xa, -72]]), col, { w: 1.3 });
      s += part(`M${f1(xa)} -73H${f1(xb)}V-70Q${f1(xm + sw * 0.3)} -64 ${f1(xm)} -64Q${f1(xm - sw * 0.3)} -64 ${f1(xa)} -70Z`, col, { w: 1.3 });
    }
    s += tonePath(`M${-hw + 2} -70H${hw - 2}V-64Q0 -61 ${-hw + 2} -64Z`, '#3B2840', 0.18);
    // letrero colgante con una medialuna
    s += line(`M${hw - 2} -76H${hw + 12}`, '#6E5A50', 2) + line(`M${hw + 2} -76V-72M${hw + 10} -76V-72`, '#6E5A50', 1.2);
    s += face(rr(hw - 2, -72, 16, 14, 2), '#FFF4E0', { w: 1.5 });
    s += part(`M${hw - 0} -62Q${hw + 6} -70 ${hw + 12} -62Q${hw + 6} -65 ${hw} -62Z`, '#E9B060', { w: 1.1 });
    return { box: [-hw - 8, -166, hw + 16, 6], svg: s, shadow: [0, 1, hw + 4, 5], solid: [[-hw - 6, -160, hw + 14, 5]] };
  });
}

// Mesita de café con sombrilla, dos sillas, una porción de torta y una taza.
function cafeTable(c = '#F47FA4') {
  return def(`cafe-${c}`, () => {
    let s = '';
    const chair = (x, y, flip) => {
      let ch = part(rr(x - 6, y - 10, 2.4, 10, 1), '#5FA88E', { w: 1 }) + part(rr(x + 3.6, y - 10, 2.4, 10, 1), '#5FA88E', { w: 1 });
      ch += part(`M${x - 6 * flip} ${y - 11}V${y - 21}Q${x - 6 * flip} ${y - 25} ${x} ${y - 25}Q${x + 6 * flip} ${y - 25} ${x + 6 * flip} ${y - 21}V${y - 11}H${x + 3.6 * flip}V${y - 20}Q${x + 3.6 * flip} ${y - 22.4} ${x} ${y - 22.4}Q${x - 3.6 * flip} ${y - 22.4} ${x - 3.6 * flip} ${y - 20}V${y - 11}Z`, '#5FA88E', { w: 1.1 });
      ch += face(ell(x, y - 10, 7.5, 2.8), '#8ACBB8', { w: 1.3 });
      return ch;
    };
    s += chair(-19, -6, 1);
    s += part(rr(-1.8, -22, 3.6, 20, 1.2), '#C8C2D2', { w: 1.2 }) + face(ell(0, -1, 7, 2.4), '#B8B2C2', { w: 1.2 });
    s += face('M-16 -22V-19.6A16 5.6 0 0 0 16 -19.6V-22Z', '#E8E4F0', { w: 1.3 });
    s += face(ell(0, -22, 16, 5.6), '#FFFFFF', { w: 1.5 });
    s += face('M-10 -24L-1 -27.5L-1 -22.4L-10 -21.4Z', '#FFF2E4', { w: 1.1 }) + flat('M-10 -23.2L-1 -26V-24.6L-10 -22Z', '#F27C98') + part(circ(-5, -27.4, 1.8), '#E8443C', { w: 0.9 });
    s += face(ell(7, -22, 5, 1.8), '#FFFFFF', { w: 1.1 }) + face(rr(4.4, -27.6, 5.4, 5.4, 1.5), '#FFFFFF', { w: 1.1 }) + line('M9.8 -26.4q2.6 0.6 0 2.8', '#C8C2D2', 1.2);
    // sombrilla: gajos de la punta al borde de adelante, con festón
    s += part(rr(-1.3, -62, 2.6, 40, 1), '#E8E4F0', { w: 1.1 });
    const n = 8, R = 27, ry = 7, yr = -50;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI - (i * Math.PI) / n, a1 = Math.PI - ((i + 1) * Math.PI) / n;
      const p0 = [Math.cos(a0) * R, yr + Math.sin(a0) * ry], p1 = [Math.cos(a1) * R, yr + Math.sin(a1) * ry];
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      s += part(`M0 -66L${f1(p0[0])} ${f1(p0[1])}Q${f1(mx)} ${f1(my + 6)} ${f1(p1[0])} ${f1(p1[1])}Z`, i % 2 ? '#FFFFFF' : c, { w: 1.2 });
    }
    s += shine('M-4 -63L-16 -52L-12 -51L-2 -62Z', 0.5);
    s += part(circ(0, -67, 2.2), '#E8E4F0', { w: 1 });
    s += chair(19, 2, -1);
    return { box: [-30, -70, 30, 4], svg: s, shadows: [[0, 1, 18, 3], [-19, -5, 7, 2], [19, 3, 7, 2]] };
  });
}

// Pizarrón de vereda (caballete) con una torta dibujada.
function sidewalkBoard() {
  return def('pizarron', () => {
    let s = line('M-8 0L-5 -22M8 0L5 -22', COC.woodDk, 2);
    s += face(rr(-8, -24, 16, 20, 2), COC.wood, { w: 1.5 }) + flat(rr(-6.5, -22.5, 13, 17, 1), '#3E4A44');
    s += line('M-3 -10h6M-3 -13h6M-4 -16h8', '#FFFFFF', 1.2, { opacity: 0.9 }) + flat(circ(0, -19, 1.6), '#F25A6A');
    return { box: [-10, -26, 10, 3], svg: s, shadow: [0, 1, 8, 2] };
  });
}

// Maceta con arbolito podado en bola.
function topiary(c = '#E8957E') {
  return def(`topiaria-${c}`, () => {
    let s = face('M-7 -10L-5.5 0H5.5L7 -10Z', c, { w: 1.5 }) + face(rr(-8, -12, 16, 3.4, 1.2), tone(c, 0.4), { w: 1.3 });
    s += part(rr(-1.4, -24, 2.8, 13, 1), COC.woodDk, { w: 1.1 });
    s += part(fluffD(0, -30, 9, 7, 0.14, 0.3), COC.leafDk, { w: 1.5 }) + flat(fluffD(-2, -32, 5, 6, 0.14, 1), COC.leaf) + flat(rr(-4, -35, 2.4, 2.4, 0.8) + rr(3, -29, 2.4, 2.4, 0.8), '#F47FA4');
    return { box: [-11, -41, 11, 3], svg: s, shadow: [0, 1, 7, 2] };
  });
}

// Fuente de la plaza con forma de torta de tres pisos (el agua cae en
// chorritos desde cada piso).
function cakeFountain() {
  return def('fuente-torta', () => {
    let s = '';
    // pileta
    s += face('M-34 -8V0A34 10 0 0 0 34 0V-8Z', '#E2D6CC', { w: 1.8 });
    s += face(ell(0, -8, 34, 10), '#F2EAE2', { w: 1.8 });
    s += flat(ell(0, -7, 29, 7.4), '#9ED8F2') + line('M-18 -6q6 2 12 0M4 -4q6 2 12 0', '#FFFFFF', 1.6, { opacity: 0.85 });
    // pisos de la torta
    const tier = (y, w, h, c, drip) => {
      let t = face(`M${-w} ${y - h}V${y}A${w} ${w * 0.3} 0 0 0 ${w} ${y}V${y - h}Z`, c, { w: 1.8 });
      t += face(ell(0, y - h, w, w * 0.3), tone(c, 0.4), { w: 1.6 });
      let d = `M${-w} ${y - h}`;
      for (let i = 0; i < 6; i++) { const xa = -w + (i * 2 * w) / 6, xb = xa + (2 * w) / 6; d += `Q${f1(xa + (xb - xa) * 0.5)} ${f1(y - h + (i % 2 ? 3 : 6))} ${f1(xb)} ${y - h}`; }
      t += part(`${d}A${w} ${w * 0.3} 0 0 0 ${-w} ${y - h}Z`, drip, { w: 1.3 });
      return t;
    };
    s += tier(-8, 20, 12, '#F7A8C0', '#FFFFFF');
    s += tier(-24, 14, 11, '#FFF0C2', '#F47FA4');
    s += tier(-39, 8, 10, '#C9E6FA', '#FFFFFF');
    s += part(circ(0, -54, 4), '#E8443C', { w: 1.4 }) + shine(circ(-1.2, -55.4, 1.1), 0.9);
    // chorritos de agua
    s += line('M-14 -30q-6 4 -8 14M14 -30q6 4 8 14M-8 -46q-5 4 -7 12M8 -46q5 4 7 12', '#7FC3F0', 2.2, { opacity: 0.95 });
    s += flat(circ(-23, -10, 1.6) + circ(23, -10, 1.6) + circ(-16, -26, 1.3) + circ(16, -26, 1.3), '#FFFFFF');
    return { box: [-36, -60, 36, 12], svg: s, shadow: [0, 3, 34, 6], solid: [[-36, -58, 36, 10]] };
  });
}

// Bicicleta de reparto con canasto de baguettes.
function breadBike() {
  return def('bici-pan', () => {
    let s = '';
    const wheel = (x) => line(ellD(x, -9, 9, 9), '#4A4A52', 2.4) + line(`M${x - 6} -9h12M${x} -15v12`, '#8C8692', 1.2) + flat(circ(x, -9, 1.8), '#6E6670');
    s += wheel(-15) + wheel(15);
    s += line('M-15 -9L-4 -9L4 -22L-6 -22ZM-4 -9L-8 -26M4 -22L15 -9M4 -22L6 -28', '#5FA88E', 2.2);
    s += line('M-11 -27h6M3 -29h6', '#4E7A6A', 2.2);
    s += part(rr(9, -32, 14, 9, 2), '#D9A867', { w: 1.4 }) + line('M11 -29h10M11 -26h10', '#B07E44', 1);
    s += part(rr(11, -42, 4, 13, 2), '#E0A35A', { w: 1.1, a: { transform: 'rotate(-12 13 -36)' } }) + part(rr(16, -41, 4, 12, 2), '#E9B060', { w: 1.1, a: { transform: 'rotate(10 18 -35)' } });
    return { box: [-26, -44, 26, 3], svg: s, shadow: [0, 1, 24, 2.6] };
  });
}

function cocinaGround(S) {
  const { zy, H, W } = S;
  const r = S.r;
  // horizonte de campo: cielo, lomas con árboles y un granero lejano
  G.flat(S, L_BASE, '#DDF0FF', rr(-10, -10, W + 20, 84), -10, 74);
  G.flat(S, L_BASE + 1, '#FFFFFF', puffD(10, 90, 30, [[22, 8], [40, 12], [62, 10], [80, 7]]) + puffD(230, 330, 22, [[246, 8], [266, 11], [290, 9], [312, 7]]), 0, 36);
  G.flat(S, L_BASE + 2, '#A6D38C', `M-10 74Q60 30 140 58Q220 34 300 54Q340 46 370 60V90H-10Z`, 30, 90);
  G.flat(S, L_BASE + 3, '#8EC47A', `M-10 82Q80 52 170 74Q260 56 370 72V96H-10Z`, 50, 96);
  // granero lejano y arbolitos
  G.flat(S, L_BASE + 4, '#D9675A', rr(262, 40, 22, 16, 1) + poly([[260, 41], [273, 31], [286, 41]]), 30, 56);
  G.flat(S, L_BASE + 5, '#FFFFFF', rr(270, 47, 6, 9, 0) + rr(262, 40, 24, 2, 0), 30, 56);
  G.flat(S, L_BASE + 4, '#6FAE5E', circ(70, 42, 7) + circ(80, 46, 6) + circ(196, 48, 6) + circ(206, 50, 5), 30, 56);
  // pasto (huerta), adoquines (mercado), plaza de baldosas (pastelería)
  G.flat(S, L_BASE + 6, COC.grass, wavyRegion(-10, W + 10, 80, 2, 80, 0.3, zy[1] + 40), 70, zy[1] + 40);
  G.flat(S, L_BASE + 7, COC.cobGap, rr(-10, zy[1] + 6, W + 20, zy[2] - zy[1] + 40), zy[1], zy[2] + 40);
  G.flat(S, L_BASE + 8, COC.tileGap, rr(-10, zy[2] + 6, W + 20, H - zy[2] + 10), zy[2], H + 20);
  // adoquines: piedras redondeadas de tamaños distintos, en tres tonos
  const cobCols = [COC.cob, COC.cob2, COC.cob3];
  const stone = (x, y, w, h) => poly([[x + 2, y], [x + w - 2, y], [x + w, y + 1.6], [x + w, y + h - 1.6], [x + w - 2, y + h], [x + 2, y + h], [x, y + h - 1.6], [x, y + 1.6]]);
  for (let y = zy[1] + 10, row = 0; y < zy[2] + 6; y += 7, row++) {
    let x = -12 + (row % 2) * 5 + r() * 3;
    while (x < W + 10) {
      const w = 8 + Math.round(r() * 4);
      const c = cobCols[Math.floor(r() * 3)];
      G.flat(S, L_TERRAIN, c, stone(x, y + (r() < 0.3 ? 0.6 : 0), w, 5.4), y, y + 6);
      if (r() < 0.22) G.flat(S, L_TERRAIN + 1, COC.cobLt, rr(f1(x + 2), y + 1, 4, 1.4, 0), y, y + 3);
      x += w + 2;
    }
  }
  // baldosas: damero rosado y crema
  for (let y = zy[2] + 10, row = 0; y < H + 8; y += 8, row++) {
    for (let x = -10, col = 0; x < W + 10; x += 14, col++) G.flat(S, L_TERRAIN, (row + col) % 2 ? COC.tile : COC.tile2, rr(x, y, 13, 7, 1), y, y + 8);
  }
  // borde de pasto que se mete en los adoquines (transición)
  G.flat(S, L_TERRAIN + 2, COC.grassDk, wavyRegion(-10, W + 10, zy[1] - 6, 4, 50, 2, zy[1] + 8), zy[1] - 14, zy[1] + 10);
  G.flat(S, L_TERRAIN + 3, COC.grass, wavyRegion(-10, W + 10, zy[1] - 10, 4, 50, 2, zy[1] + 4), zy[1] - 18, zy[1] + 6);
  // manchones de luz y de sombra en el pasto
  for (let y = 100; y < zy[1] - 30; y += 36) {
    const x = 20 + r() * (W - 40), rx = 20 + r() * 24;
    G.flat(S, L_TERRAIN, r() < 0.5 ? COC.grassLt : COC.grassDk, puffD(x - rx, x + rx, y + 8, [[x - rx * 0.5, rx * 0.3], [x, rx * 0.42], [x + rx * 0.5, rx * 0.3]]), y - 30, y + 10);
  }
}

function cocinaDetails(S) {
  scatter(S, 0, 120, (x, y) => G.flat(S, L_DETAIL, COC.grassDp, tuftD(x, y, 0.8 + S.r() * 0.4), y - 8, y + 1), { top: 70 });
  const fc = ['#FFFFFF', '#FFD45C', '#F47FA4', '#B79BF2'];
  scatter(S, 0, 50, (x, y, i) => {
    G.flat(S, L_DETAIL + 1, fc[i % fc.length], rr(x - 3, y - 1.5, 6, 3, 1) + rr(x - 1.5, y - 3, 3, 6, 1), y - 3, y + 3);
    G.flat(S, L_DETAIL + 2, '#FFE58A', rr(x - 1, y - 1, 2, 2, 0), y - 1, y + 1);
  }, { top: 80 });
  // pétalos y hojitas caídas en los adoquines y la plaza
  scatter(S, 1, 26, (x, y) => G.flat(S, L_DETAIL, COC.leafLt, leafD(x, y, 4, -30, 1.6), y - 3, y + 3), { top: 20 });
  scatter(S, 2, 26, (x, y, i) => G.flat(S, L_DETAIL, i % 2 ? '#F7A8C0' : '#FFFFFF', rr(x - 1.5, y - 1, 3, 2, 1), y - 2, y + 2), { top: 20 });
}

// El camino cambia de material con la zona: tierra, losas, baldosas rosadas.
function cocinaRoad(S) {
  const styles = [
    { edge: COC.roadEdge, base: COC.road, light: COC.roadLt, w: 20, dots: '#B89670' },
    { edge: '#A8968A', base: '#EEE6DA', light: '#FBF6EE', w: 22, slabs: '#CDBFAF' },
    { edge: '#E2A9B6', base: '#F9DCE2', light: '#FFF1F4', w: 22, slabs: '#EFC2CC' },
  ];
  zoneRoads(S, (z) => styles[z], { neon: '#FFC27A' });
}

function cocinaBuild(S) {
  cocinaGround(S);
  cocinaRoad(S);
  const { P, zk, zy, W } = S;
  const mid = (z) => (zy[z] + zy[z + 1]) / 2;
  const trY = (z) => { const a = P[zk[z][0] - 1], b = P[zk[z][0]]; return ev((a.y + b.y) / 2); };
  const roadX = (y) => S.samp.reduce((bst, p) => (Math.abs(p.y - y) < Math.abs(bst.y - y) ? p : bst), S.samp[0]).x;
  // del lado contrario a las etiquetas de cada zona queda el hueco grande
  const pocket = (z) => (P[zk[z][0]].side === 'R' ? 'L' : 'R');
  const px = (z, k = 0.3) => (pocket(z) === 'L' ? W * k : W * (1 - k));
  // transición huerta → mercado: cerca de madera con hueco para el camino
  {
    const y = trY(1) + 8, x = roadX(y);
    const lw = ev(x - 20 + 10), rw = ev(W + 10 - (x + 20));
    if (lw > 20) put(S, woodFence(lw), ev(-10 + lw / 2), y, { block: false });
    if (rw > 20) put(S, woodFence(rw), ev(x + 20 + rw / 2), y, { block: false });
    S.mark(-10, y - 28, W + 10, y + 4);
  }
  // transición mercado → pastelería: macetas con arbolitos a los lados
  {
    const y = trY(2) + 6, x = roadX(y);
    for (const dx of [-34, -56, 34, 56]) { const tx = x + dx; if (tx > 8 && tx < W - 8 && rectFree(S, tx - 9, y - 40, tx + 9, y + 2)) put(S, topiary(dx % 2 ? '#E8957E' : '#8ACBB8'), tx, y); }
  }
  // ── la huerta ──
  landmark(S, 0, group('cobertizo', [[gardenShed(), 0, 0], [appleTree('h1', 24, 24), -62, 6], [sunflowers('h1', [[0, 0, 40], [12, 4, 32]]), 60, 6]]), px(0, 0.24), zy[0] + 120, { ky: 0.5, kx: 0.8 });
  landmark(S, 0, group('canteros', [[raisedBed('zan', 96, ['zanahoria', 'zanahoria', 'zanahoria']), 0, 0], [tomatoPlant('a', 48), 62, -2], [scarecrow(), -6, 38], [raisedBed('lech', 96, ['lechuga', 'repollo']), 0, 92], [tomatoPlant('b', 42), 62, 92]]), px(0, 0.28), mid(0) + 40, { ky: 0.4, kx: 0.8 });
  landmark(S, 0, pumpkinPatch(), px(0, 0.2), zy[1] - 40, { ky: 0.6, kx: 0.6 });
  frame(S, 0, [appleTree('h2', 22, 22), bush('h1', 13), appleTree('h3', 26, 26, '#F5B04E'), bush('h2', 11, '#FFFFFF'), sunflowers('h2', [[0, 0, 44], [10, 4, 36], [-9, 6, 30]])], { top: 100, every: 62, inset: 12, dx: 18 });
  sprinkle(S, 0, [bush('h3', 10), sunflowers('h3', [[0, 0, 34]]), def('regadera', () => ({ box: [-10, -14, 10, 3], svg: part('M-7 0V-10H5V0Z', '#5FB3A0', { w: 1.5 }) + line('M5 -7L11 -13', '#5FB3A0', 2.4) + line('M-5 -10Q-1 -16 3 -10', '#3E8C7A', 1.6), shadow: [0, 1, 7, 2] })), def('canasta-v', () => ({ box: [-14, -24, 14, 3], svg: basketSvg(0, 0, 24, 'tomate'), shadow: [0, 1, 12, 2.5] }))], 10, { top: 90, m: -4 });
  // ── el mercado ──
  const sg = pocket(1) === 'R' ? 1 : -1;
  const stallA = group('mercadoA', [
    [marketStall('frutas', { awn: ['#E8574F', '#FFF6EE'], fruits: ['manzana', 'banana', 'naranja'], sign: 'fruit' }), 0, 0],
    [crateStack('a', ['pera', 'uva', true]), -36 * sg, 26],
    [bunting2(), 0, 0],
  ]);
  const stallB = group('mercadoB', [
    [marketStall('verduras', { awn: ['#4FA86E', '#FFF6EE'], fruits: ['zanahoria', 'lechuga', 'tomate'], sign: 'veg' }), 0, 0],
    [def('bolsas', () => ({ box: [-22, -22, 34, 3], svg: sackSvg(-10, 0) + sackSvg(8, 2, '#F2E6C8', '#E8574F') + barrelSvg(26, 2, 'limon'), shadow: [6, 2, 24, 3] })), -34 * sg, 26],
  ]);
  landmark(S, 1, stallA, px(1, 0.26), zy[1] + 130, { ky: 0.8, kx: 0.5, m: 0 });
  landmark(S, 1, stallB, px(1, 0.26), zy[2] - 30, { ky: 0.8, kx: 0.5, m: 0 });
  landmark(S, 1, group('flores', [[flowerStall(), 0, 0], [streetLamp(), 50 * sg, 6]]), px(1, 0.3), mid(1) + 20, { ky: 0.6, kx: 0.4, m: 0 });
  frame(S, 1, [def('barriles', () => ({ box: [-24, -40, 24, 4], svg: barrelSvg(-10, 0, 'manzana') + barrelSvg(10, 4, 'naranja'), shadows: [[-10, 1, 10, 2.5], [10, 5, 10, 2.5]] })), streetLamp(), crateStack('b', ['manzanaV', 'limon']), topiary('#8ACBB8')], { top: 40, every: 62, inset: 16, dx: 16 });
  sprinkle(S, 1, [fruitCart('manzana'), bench(), def('canasta-f', () => ({ box: [-14, -24, 14, 3], svg: basketSvg(0, 0, 24, 'naranja'), shadow: [0, 1, 12, 2.5] })), crateStack('c', ['manzana', 'pera']), def('bolsa', () => ({ box: [-10, -22, 10, 3], svg: sackSvg(0, 0), shadow: [0, 1, 8, 2] })), fruitCart('naranja')], 9, { top: 30, m: -4, max: 1 });
  // ── la pastelería ──
  const last = P[P.length - 1];
  landmark(S, 2, bakery(), px(2, 0.26), Math.min(last.y - 10, mid(2) + 40), { ky: 0.4, kx: 0.8 });
  landmark(S, 2, group('terraza', [[cafeTable('#F47FA4'), 0, 0], [cafeTable('#7FC3F0'), 60, 16], [sidewalkBoard(), -40, 12]]), px(2, 0.3), zy[2] + 70, { ky: 0.4, kx: 0.8 });
  landmark(S, 2, cakeFountain(), W / 2, mid(2), { ky: 0.3, kx: 0.3 });
  frame(S, 2, [topiary('#E8957E'), streetLamp(), topiary('#8ACBB8'), bush('p1', 11, '#FFFFFF'), bench()], { top: 40, every: 64, inset: 14, dx: 16 });
  sprinkle(S, 2, [breadBike(), topiary('#F7C873'), bench(), bush('p2', 10), fruitCart('limon')], 6, { top: 40, m: -4, max: 1 });
  roadFlowers(S, 0, ['#FFFFFF', '#FFD45C', '#F47FA4'], COC.grassDp);
  cocinaDetails(S);
}

// ═════════════════════════════════════════════════════════════════
// ENCUENTRA LAS PAREJAS: un viaje de recuerdos por el cielo, de la mañana
// a la noche. El camino es un rastro de nubecitas; lo grande va en islas
// flotantes (con su pasto arriba y su tierra con raíces abajo).
// ═════════════════════════════════════════════════════════════════
const MEM = {
  sky: [['#BFE3FF', '#E4F3FF', '#FFF1DE'], ['#FFE6C6', '#FFCFB8', '#F6B3C6'], ['#7472BE', '#4C4C96', '#2E2F66']],
  grass: ['#9FD67E', '#F2C76A', '#5E8F86'], grassLt: ['#C2E89E', '#FFE09A', '#86B9A6'],
  earth: ['#B58A68', '#C08A6A', '#5A5480'], earthDk: ['#8E664A', '#9A6650', '#403C66'],
};

// Isla flotante: pasto arriba (elipse), borde de luz, tierra en capas que
// termina en punta, raíces y enredaderas colgando. t = 0 mañana, 1 tarde, 2 noche.
function islandSvg(w, t) {
  const rx = w / 2, ry = Math.round(w * 0.2), dep = Math.round(w * 0.5);
  let s = '';
  const L = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; L.push([-rx + u * 2 * rx, Math.sin(u * Math.PI) * (ry * 0.6 + dep * Math.pow(Math.sin(u * Math.PI), 2.2)) + (i % 3 === 1 ? 3 : 0)]); }
  s += face(poly([[-rx, 0], ...L, [rx, 0]]), MEM.earth[t], { w: 2 });
  s += flat(poly([[-rx + 6, ry * 0.5], ...L.slice(3, 14).map(([x, y]) => [x * 0.8, y * 0.62 + ry * 0.4])]), MEM.earthDk[t]);
  s += line(`M${f1(-rx * 0.7)} ${f1(ry * 0.9)}q${f1(rx * 0.3)} 4 ${f1(rx * 0.6)} 0M${f1(-rx * 0.2)} ${f1(ry * 1.9)}q${f1(rx * 0.3)} 4 ${f1(rx * 0.55)} 0`, tone(MEM.earth[t], 0.5), 1.6, { opacity: 0.8 });
  s += line(`M${f1(-rx * 0.35)} ${f1(dep * 0.7)}q-4 8 0 14M${f1(rx * 0.3)} ${f1(dep * 0.6)}q5 6 2 12M${f1(rx * 0.05)} ${f1(dep * 0.95)}v8`, t === 2 ? '#2E2A4A' : '#7A5A3E', 1.6);
  s += line(`M${f1(-rx * 0.82)} ${f1(ry * 0.4)}q-2 10 2 18M${f1(rx * 0.75)} ${f1(ry * 0.5)}q3 8 0 15`, MEM.grass[t], 2.2);
  s += flat(circ(f1(-rx * 0.8), f1(ry * 0.4 + 18), 2.2) + circ(f1(rx * 0.75), f1(ry * 0.5 + 15), 2.2), t === 2 ? '#B9C6FF' : '#F47FA4');
  // pasto
  s += part(ell(0, 0, rx, ry), MEM.grass[t], { w: 2 });
  s += flat(ell(-rx * 0.15, -ry * 0.18, rx * 0.72, ry * 0.6), MEM.grassLt[t]);
  let tf = '';
  for (let i = 0; i < 7; i++) { const x = -rx * 0.75 + i * rx * 0.25; tf += tuftD(f1(x), f1(ry * 0.85 - Math.abs(x) * 0.12), 0.6); }
  s += flat(tf, tone(MEM.grass[t], -0.6));
  return s;
}

function island(id, w, t, items = [], extra = {}) {
  return def(`isla-${id}`, () => {
    const rx = w / 2, ry = Math.round(w * 0.2);
    let s = islandSvg(w, t);
    let y0 = -ry;
    items.slice().sort((a, b) => a[2] - b[2]).forEach(([d, x, y]) => { s += at(x, y, d.svg); y0 = Math.min(y0, y + d.box[1]); });
    return { box: [-rx - 4, y0 - 2, rx + 4, Math.round(w * 0.5) + 14], svg: s, solid: [[-rx, y0 + 6, rx, Math.round(w * 0.42)]], ...extra };
  });
}

// Árbol redondo (el de la hamaca, el del pícnic…).
function roundTree(id, R, h, t, fruit) {
  return def(`arbolito-${id}`, () => {
    const g = [['#4F9A4B', '#6DBA5E', '#97D27B'], ['#6E9A3E', '#94BE52', '#C5DC72'], ['#355E66', '#4A7F80', '#6CA49C']][t];
    let s = face(`M-4 0L-3 ${-h}H3L4 0Z`, '#9C6A40', { w: 1.6 });
    const cy = -h - R * 0.7;
    s += part(fluffD(0, cy, R, 8, 0.15, 0.3), g[0], { w: 2 });
    s += flat(fluffD(-R * 0.15, cy - R * 0.15, R * 0.76, 7, 0.16, 1), g[1]);
    s += flat(fluffD(-R * 0.35, cy - R * 0.4, R * 0.4, 6, 0.18, 0.5), g[2]);
    if (fruit) [[-0.5, 0.1], [0.3, -0.35], [0.5, 0.3], [-0.1, 0.45]].forEach(([a, b]) => { s += part(circ(f1(a * R), f1(cy + b * R), 2.8), fruit, { w: 1 }); });
    return { box: [-R - 2, cy - R - 2, R + 2, 4], svg: s, shadow: [0, 1, R * 0.5, 3] };
  });
}

// Hamaca colgada de una rama (dos sogas y un asiento).
function swingSvg(x, y, h) {
  return line(`M${x - 7} ${y - h}V${y - 10}M${x + 7} ${y - h}V${y - 10}`, '#8C7A70', 1.4) + face(rr(x - 9, y - 11, 18, 4, 1.5), '#C98F5A', { w: 1.4 });
}

// Racimo de globos atados a un poste (las cuerdas bajan al nudo).
function balloonBunch(id, cols, h = 52) {
  return def(`globos-${id}`, () => {
    let s = face(rr(-2, -14, 4, 14, 1.2), '#F0E2C6', { w: 1.3 });
    const B = [[-12, -h + 6, cols[0]], [0, -h, cols[1]], [12, -h + 4, cols[2]], [-6, -h + 18, cols[3] || cols[0]], [7, -h + 17, cols[4] || cols[1]]];
    B.forEach(([bx, by]) => { s += line(`M0 -13Q${f1(bx * 0.4)} ${f1((by - 13) / 2)} ${bx} ${by + 9}`, '#8C7A70', 1.1); });
    B.forEach(([bx, by, c]) => {
      s += part(`M${bx} ${by + 9}C${bx - 8} ${by + 7} ${bx - 9} ${by - 8} ${bx} ${by - 9}C${bx + 9} ${by - 8} ${bx + 8} ${by + 7} ${bx} ${by + 9}Z`, c, { w: 1.5 });
      s += part(`M${bx - 1.6} ${by + 11.4}H${bx + 1.6}L${bx} ${by + 8.6}Z`, c, { w: 1 });
      s += shine(ell(bx - 3, by - 3, 1.8, 2.8), 0.85);
    });
    return { box: [-22, -h - 12, 22, 3], svg: s, shadow: [0, 1, 4, 1.5] };
  });
}

// Globos sueltos que suben (las cuerdas se juntan en un moño que cuelga).
function freeBalloons(id, cols) {
  return def(`globos-sueltos-${id}`, () => {
    let s = '';
    const B = [[-9, -40, cols[0]], [3, -46, cols[1]], [12, -36, cols[2]]];
    B.forEach(([bx, by]) => { s += line(`M0 -8Q${f1(bx * 0.4)} ${f1((by - 8) / 2)} ${bx} ${by + 9}`, '#8C7A70', 1.1); });
    s += line('M0 -8q3 4 0 8', '#8C7A70', 1.1) + part('M0 -8l-4 -2v4ZM0 -8l4 -2v4Z', '#F47F8E', { w: 0.9 });
    B.forEach(([bx, by, c]) => {
      s += part(`M${bx} ${by + 9}C${bx - 8} ${by + 7} ${bx - 9} ${by - 8} ${bx} ${by - 9}C${bx + 9} ${by - 8} ${bx + 8} ${by + 7} ${bx} ${by + 9}Z`, c, { w: 1.5 });
      s += part(`M${bx - 1.6} ${by + 11.4}H${bx + 1.6}L${bx} ${by + 8.6}Z`, c, { w: 1 });
      s += shine(ell(bx - 3, by - 3, 1.8, 2.8), 0.85);
    });
    return { box: [-20, -58, 22, 2], svg: s };
  });
}

// Cerquita blanca de estacas.
function picketFence(len) {
  return def(`estacas-${len}`, () => {
    let s = face(rr(-len / 2, -12, len, 3, 1), '#FFFFFF', { w: 1.2 });
    const n = Math.max(2, Math.round(len / 7));
    for (let i = 0; i <= n; i++) { const x = -len / 2 + (i * len) / n; s += face(`M${f1(x - 2.2)} 0V-14L${f1(x)} -17L${f1(x + 2.2)} -14V0Z`, '#FFFFFF', { w: 1.2 }); }
    return { box: [-len / 2 - 3, -19, len / 2 + 3, 2], svg: s };
  });
}

// Florcitas sueltas para las islas.
function flowerDots(id, list) {
  return def(`florcitas-${id}`, () => {
    let s = '';
    list.forEach(([x, y, c]) => { s += line(`M${x} ${y}v-5`, '#4F9A4B', 1.4) + part(circ(x, y - 7, 2.6), c, { w: 1 }) + flat(circ(x, y - 7, 1), '#FFE58A'); });
    const xs = list.map((f) => f[0]), ys = list.map((f) => f[1]);
    return { box: [Math.min(...xs) - 4, Math.min(...ys) - 12, Math.max(...xs) + 4, Math.max(...ys) + 2], svg: s };
  });
}

// Mantel de pícnic a cuadros con canasta, sándwiches y tetera.
function picnicSvg() {
  let s = face('M-30 -14H26L32 4H-24Z', '#FFFFFF', { w: 1.6 });
  let ck = '';
  for (let r0 = 0; r0 < 3; r0++) for (let c = 0; c < 8; c++) if ((r0 + c) % 2 === 0) { const y = -14 + r0 * 6, xo = r0 * 2; ck += poly([[-30 + xo + c * 7, y], [-23 + xo + c * 7, y], [-21 + xo + c * 7, y + 6], [-28 + xo + c * 7, y + 6]]); }
  s += flat(ck, '#F47F8E');
  // canasta
  s += face('M-18 -14L-16 -4H-2L0 -14Z', '#D9A867', { w: 1.5 }) + line('M-17 -10H-1M-16.5 -7H-1.5', '#B07E44', 1.1);
  s += line('M-16 -14Q-9 -24 -2 -14', '#B07E44', 2) + flat(rr(-15, -16, 12, 2.4, 1), '#F47F8E');
  // sándwiches y tetera
  s += face('M6 -6L14 -6L10 -12Z', '#F6D59A', { w: 1.2 }) + flat('M7 -7L13 -7L10 -10Z', '#8CD07A');
  s += face(ell(22, -8, 5, 4), '#8ACBB8', { w: 1.3 }) + line('M27 -9l3 -3M17 -9q-3 -1 -2 3', '#6DAE9A', 1.6) + part(rr(20.6, -14, 3, 2.4, 1), '#6DAE9A', { w: 1 });
  return s;
}

// Fotos colgadas de una cuerda con ganchitos, y lucecitas, entre dos postes.
function photoLine(len, cols) {
  let s = face(rr(-len / 2 - 2, -52, 4, 52, 1.5), '#C98F5A', { w: 1.4 }) + face(rr(len / 2 - 2, -52, 4, 52, 1.5), '#C98F5A', { w: 1.4 });
  const sag = (u) => -48 + Math.sin(u * Math.PI) * 9;
  let d = `M${-len / 2} ${sag(0)}`;
  for (let i = 1; i <= 16; i++) d += `L${f1(-len / 2 + (len * i) / 16)} ${f1(sag(i / 16))}`;
  s += line(d, '#8C7A70', 1.2);
  // lucecitas
  for (let i = 1; i < 10; i++) { const u = i / 10; s += part(circ(f1(-len / 2 + len * u), f1(sag(u) + 2.4), 1.8), ['#FFE58A', '#FFB3C6', '#B9E6FF'][i % 3], { w: 0.9 }); }
  // fotos con su ganchito (un poco giradas)
  const n = cols.length;
  cols.forEach((c, i) => {
    const u = (i + 0.7) / (n + 0.4), x = -len / 2 + len * u, y = sag(u);
    const rot = ((i * 37) % 14) - 7;
    let p = part(rr(-1.4, -2, 2.8, 5, 0.8), '#C98F5A', { w: 0.9 });
    p += face(rr(-8, 2, 16, 18, 1), '#FFFFFF', { w: 1.3 }) + flat(rr(-6.5, 3.5, 13, 11, 0), c);
    p += flat(`M-6.5 14.5L-2.5 9L0.5 12L3.5 8.5L6.5 14.5Z`, tone(c, -0.8)) + flat(circ(3.5, 6.5, 1.6), '#FFF3C4');
    s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})">${p}</g>`;
  });
  return s;
}

// Casita con ventanas encendidas (de noche).
function nightCottage() {
  return def('casita-noche', () => {
    let s = '';
    s += face(rr(14, -54, 8, 14, 1.2), '#8E7A9A', { w: 1.4 }) + part(fluffD(20, -62, 3.4, 5, 0.2, 0), '#C9C2E6', { w: 1 });
    s += face(rr(-26, -32, 52, 32, 2), '#E9D9C7', { w: 2 });
    s += tonePath('M16 -32H26V0H16Z', '#2A2048', 0.25);
    s += face(rr(-31, -50, 62, 20, 2), '#6C5A9A', { w: 2 });
    let tl = '';
    for (let row = 0; row < 2; row++) { const y = -45 + row * 7; tl += `M-29 ${y}`; for (let x = -29; x < 30; x += 8) tl += `Q${x + 4} ${y + 4} ${x + 8} ${y}`; }
    s += line(tl, '#54457E', 1.3, { opacity: 0.9 });
    // ventanas encendidas y puerta
    for (const wx of [-15, 15]) s += face(rr(wx - 6, -24, 12, 11, 1.5), '#FFE48A', { w: 1.5 }) + line(`M${wx} -24V-13M${wx - 6} -18.5H${wx + 6}`, '#C99A4A', 1.2) + flat(rr(wx - 4.5, -22.5, 3.5, 3, 0.5), '#FFFFFF');
    s += face(rrTop(-5, -18, 10, 18, 5), '#8E5A36', { w: 1.5 }) + flat(circ(2.6, -9, 1.2), '#FFE48A');
    s += face(rr(-24, -10, 10, 3, 1), '#8E5A36', { w: 1.1 }) + flat(circ(-21, -11, 1.6) + circ(-17, -11.5, 1.6), '#F47FA4');
    return { box: [-34, -68, 34, 4], svg: s, shadow: [0, 1, 28, 4] };
  });
}

// Farol encendido.
function glowLamp() {
  return def('farol-noche', () => {
    let s = face(rr(-3, -4, 6, 4, 1.2), '#3E3A5E', { w: 1.2 }) + part(rr(-1.4, -36, 2.8, 32, 1), '#3E3A5E', { w: 1.1 });
    s += part('M-5 -36H5L4 -46H-4Z', '#FFE48A', { w: 1.3 }) + part('M-7 -45H7L0 -51Z', '#3E3A5E', { w: 1.3 });
    return { box: [-9, -54, 9, 3], svg: s, shadow: [0, 1, 4, 1.5] };
  });
}

// Telescopio en su trípode, mirando la luna.
function telescope() {
  return def('telescopio', () => {
    let s = line('M0 -14L-8 0M0 -14L8 0M0 -14V0', '#8C6A50', 2);
    s += part(`M-4 -14L14 -28L17 -24L-1 -10Z`, '#7FA8D8', { w: 1.5 }) + part(rr(13, -31, 6, 9, 1.5), '#5E86B8', { w: 1.3, a: { transform: 'rotate(-38 16 -26)' } });
    return { box: [-11, -34, 21, 3], svg: s };
  });
}

// La luna creciente con cráteres y carita (de noche).
function moon() {
  return def('luna', () => {
    let s = part('M10.7 -36.9A20 20 0 1 0 10.7 -3.1A17 17 0 1 1 10.7 -36.9Z', '#FFF0B8', { w: 1.8 });
    s += flat(circ(-12, -29, 2.6) + circ(-6, -9, 2) + circ(-15, -14, 1.5), '#F2DC8E');
    s += line('M-13 -23q2 -2.6 4 0', '#3A2A3E', 1.3) + line('M-14 -17q2.6 2.2 5 0', '#3A2A3E', 1.2);
    s += flat(ell(-16.5, -19.5, 1.8, 1.1), '#FFB8B8');
    return { box: [-22, -42, 14, 4], svg: s };
  });
}

// Sol de la mañana con carita feliz y rayos.
function sunFace() {
  return def('sol', () => {
    let s = part(starD(0, -20, 22, 0.72, 12, -90), '#FFD45C', { w: 1.6 });
    s += part(circ(0, -20, 14), '#FFE58A', { w: 1.6 });
    s += line('M-8 -21q2 -3 4 0M4 -21q2 -3 4 0', '#9A6A2A', 1.5) + line('M-4 -15q4 3.4 8 0', '#9A6A2A', 1.4);
    s += flat(ell(-9, -16, 2.4, 1.3) + ell(9, -16, 2.4, 1.3), '#FFA88A');
    return { box: [-24, -44, 24, 4], svg: s };
  });
}

// Globo aerostático con su canasta (va flotando, la soga cuelga).
function hotAirBalloon() {
  return def('aerostatico', () => {
    let s = '';
    const cols = ['#F47F8E', '#FFD45C', '#7FC3F0', '#FFD45C', '#F47F8E'];
    const R = 24, cy = -58;
    const env = (k) => `M0 ${cy - R}C${f1(R * 1.25 * k)} ${cy - R} ${f1(R * 1.2 * k)} ${cy + 8} ${f1(R * 0.36 * k)} ${cy + R + 6}L${f1(-R * 0.36 * k)} ${cy + R + 6}C${f1(-R * 1.2 * k)} ${cy + 8} ${f1(-R * 1.25 * k)} ${cy - R} 0 ${cy - R}Z`;
    s += part(env(1), cols[0], { w: 2 });
    s += flat(env(0.62), cols[1]) + flat(env(0.26), cols[2]);
    s += shine(`M${-R * 0.7} ${cy - 6}Q${-R * 0.75} ${cy - R * 0.7} ${-R * 0.3} ${cy - R * 0.88}Q${-R * 0.55} ${cy - R * 0.5} ${-R * 0.55} ${cy - 4}Z`, 0.55);
    s += line(`M${f1(-R * 0.36)} ${cy + R + 6}L-6 -18M${f1(R * 0.36)} ${cy + R + 6}L6 -18`, '#8C7A70', 1.2);
    s += face(rr(-8, -18, 16, 12, 2), '#C98F5A', { w: 1.6 }) + line('M-7 -13H7', '#9C6A40', 1.2);
    s += part('M10 -8l8 2l-8 3Z', '#7FC3F0', { w: 1 }) + line('M10 -9V-2', '#8C7A70', 1);
    return { box: [-R - 6, cy - R - 4, R + 6, 0], svg: s };
  });
}

// Cometa con su cola de moñitos (la cuerda baja hasta la isla).
function kite(len) {
  return def(`cometa-${len}`, () => {
    let s = line(`M0 0Q${f1(-len * 0.4)} ${f1(-len * 0.4)} ${f1(-len * 0.55)} ${f1(-len)}`, '#8C7A70', 1.1);
    const kx = f1(-len * 0.55), ky = f1(-len);
    s += part(`M${kx} ${ky - 12}L${kx + 9} ${ky}L${kx} ${ky + 12}L${kx - 9} ${ky}Z`, '#F47F8E', { w: 1.5 }) + flat(`M${kx} ${ky - 12}L${kx + 9} ${ky}L${kx} ${ky}Z`, '#FFD45C') + flat(`M${kx} ${ky}L${kx - 9} ${ky}L${kx} ${ky + 12}Z`, '#FFD45C');
    s += line(`M${kx} ${ky + 12}q4 6 0 12q-4 6 0 12`, '#8C7A70', 1.1);
    [[0, 18], [0, 30]].forEach(([dx, dy]) => { s += part(`M${kx + dx - 4} ${ky + dy - 2}L${kx + dx} ${ky + dy}L${kx + dx - 4} ${ky + dy + 2}ZM${kx + dx + 4} ${ky + dy - 2}L${kx + dx} ${ky + dy}L${kx + dx + 4} ${ky + dy + 2}Z`, '#7FC3F0', { w: 1 }); });
    return { box: [-len * 0.55 - 12, -len - 14, 4, 4], svg: s };
  });
}

// Farolito de papel que sube solo: cuerpo redondeado con costillas, luz
// adentro y su llamita abajo.
function skyLantern(c = '#FFB36B') {
  return def(`farolito-${c}`, () => {
    let s = part('M-7 -20Q-10 -8 -6 0H6Q10 -8 7 -20Q0 -24 -7 -20Z', c, { w: 1.5 });
    s += flat('M-4 -18Q-6 -8 -3 -2H3Q6 -8 4 -18Q0 -20 -4 -18Z', '#FFE6A8');
    s += line('M-3.5 -19Q-5 -9 -2 -1M3.5 -19Q5 -9 2 -1', tone(c, -0.5), 1.1, { opacity: 0.8 });
    s += part(rr(-5, -1, 10, 3, 1), tone(c, -0.6), { w: 1.1 });
    s += part('M0 5Q-2.4 3.4 0 0.6Q2.4 3.4 0 5Z', '#FFD45C', { w: 0.9 });
    return { box: [-11, -25, 11, 7], svg: s };
  });
}

function memoriaGround(S) {
  const { zy, H, W } = S;
  const r = S.r;
  // el cielo en bandas (en pixel; los demás estilos ven el degradado de atrás)
  const colAt = (y) => {
    const z = S.zoneAt(y);
    const y0 = zy[z], y1 = zy[z + 1];
    const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
    const [a, b, c] = MEM.sky[z];
    let col = t < 0.5 ? mix(a, b, t * 2) : mix(b, c, (t - 0.5) * 2);
    // fundido con la zona siguiente en el último tramo
    if (z < S.nz - 1 && y > y1 - 40) col = mix(col, MEM.sky[z + 1][0], (y - (y1 - 40)) / 80);
    if (z > 0 && y < y0 + 40) col = mix(MEM.sky[z - 1][2], col, 0.5 + (y - y0) / 80);
    return col;
  };
  for (let y = -10; y < H + 12; y += 12) G.flat(S, L_BASE, colAt(y + 6), rr(-10, y, W + 20, 12.5), y, y + 13, 'pixel');
  // nubes lejanas (de día blancas, de tarde rosadas, de noche lilas)
  for (let y = 40; y < H; y += 46 + r() * 30) {
    const z = S.zoneAt(y);
    const x = r() * W, R0 = 8 + r() * 10;
    const c = ['#FFFFFF', '#FFE4E4', '#7A78BE'][z], c2 = ['#E6F0FF', '#F7C4CE', '#5E5CA6'][z];
    G.flat(S, L_TERRAIN, c2, puffD(x - R0 * 2, x + R0 * 2, y + 2, [[x - R0, R0 * 0.7], [x, R0], [x + R0, R0 * 0.75]]), y - R0 - 4, y + 4);
    G.flat(S, L_TERRAIN + 1, c, puffD(x - R0 * 1.9, x + R0 * 1.9, y, [[x - R0, R0 * 0.62], [x, R0 * 0.92], [x + R0, R0 * 0.66]]), y - R0 - 4, y + 4);
  }
  // pajaritos de la mañana
  for (let i = 0; i < 7; i++) {
    const y = zy[0] + 70 + r() * (zy[1] - zy[0] - 100), x = 20 + r() * (W - 40);
    if (S.onRoad(x, y, 12)) continue;
    G.line(S, L_DETAIL, '#6E6A8E', 1.8, `M${f1(x - 6)} ${f1(y)}q3 -4 6 0q3 -4 6 0`, y - 5, y + 2);
  }
  // estrellas, constelaciones y una estrella fugaz en la noche
  const z2 = S.nz - 1;
  scatter(S, z2, 70, (x, y, i) => G.flat(S, L_DETAIL, i % 4 ? '#FFFFFF' : '#FFE58A', i % 3 ? rr(x - 1, y - 1, 2, 2, 0) : sparkD(x, y, 3 + S.r() * 2), y - 5, y + 5), { top: 20, m: 10 });
  const cons = [[[0, 0], [14, -6], [26, -2], [36, 8], [30, 20], [16, 18]], [[0, 0], [10, 10], [22, 6], [30, 16]]];
  cons.forEach((pts0, ci) => {
    for (let t = 0; t < 20; t++) {
      const x = 20 + S.r() * (W - 80), y = zy[z2] + 40 + S.r() * (zy[z2 + 1] - zy[z2] - 80);
      if (!rectFree(S, x - 4, y - 12, x + 44, y + 26)) continue;
      const P0 = pts0.map(([a, b]) => [x + a, y + b]);
      G.line(S, L_DETAIL + 1, '#BFC8FF', 1.2, `M${P0.map(([a, b]) => `${f1(a)} ${f1(b)}`).join('L')}`, y - 12, y + 26, 0.7);
      G.flat(S, L_DETAIL + 2, '#FFF6C8', P0.map(([a, b]) => sparkD(a, b, 3.2)).join(''), y - 12, y + 26);
      S.mark(x - 4, y - 12, x + 44, y + 26);
      break;
    }
    void ci;
  });
  {
    const y = zy[z2] + 30 + S.r() * 40, x = 40 + S.r() * 120;
    G.line(S, L_DETAIL + 1, '#FFFFFF', 1.6, `M${f1(x)} ${f1(y)}l40 14`, y, y + 16, 0.6);
    G.flat(S, L_DETAIL + 2, '#FFF6C8', sparkD(x + 42, y + 15, 5), y, y + 22);
  }
}

// El camino: un rastro de nubecitas (una nube grande debajo de cada parada).
function cloudTrail(S) {
  const { samp, P } = S;
  const cols = [['#FFFFFF', '#D8E6FA'], ['#FFF4F0', '#F2C4CC'], ['#8E8CD0', '#6664AE']];
  samp.forEach((p, i) => {
    if (i % 5) return;
    const z = S.zoneAt(p.y);
    const R0 = 6 + (i % 3);
    G.flat(S, L_ROAD, cols[z][1], puffD(p.x - R0 * 1.8, p.x + R0 * 1.8, p.y + R0 * 0.5 + 2, [[p.x - R0 * 0.9, R0 * 0.7], [p.x, R0], [p.x + R0 * 0.9, R0 * 0.72]]), p.y - R0 - 4, p.y + R0);
    G.flat(S, L_ROAD + 1, cols[z][0], puffD(p.x - R0 * 1.7, p.x + R0 * 1.7, p.y + R0 * 0.5, [[p.x - R0 * 0.9, R0 * 0.6], [p.x, R0 * 0.9], [p.x + R0 * 0.9, R0 * 0.62]]), p.y - R0 - 4, p.y + R0);
  });
  P.forEach((p) => {
    const z = S.zoneAt(p.y);
    G.flat(S, L_ROAD + 2, cols[z][1], puffD(p.x - 38, p.x + 38, p.y + 22, [[p.x - 24, 14], [p.x - 6, 20], [p.x + 14, 18], [p.x + 28, 12]]), p.y - 4, p.y + 26);
    G.flat(S, L_ROAD + 3, cols[z][0], puffD(p.x - 36, p.x + 36, p.y + 19, [[p.x - 24, 12], [p.x - 6, 18], [p.x + 14, 16], [p.x + 28, 10]]), p.y - 4, p.y + 24);
  });
  G.line(S, L_ROAD + 4, '#C9C6FF', 2, samp.filter((p, i) => i % 5 === 0 && S.zoneAt(p.y) === S.nz - 1).map((p) => `M${f1(p.x - 8)} ${f1(p.y + 3)}h16`).join('') || 'M0 0', 0, S.H, 1, 'neon');
}

function memoriaBuild(S) {
  memoriaGround(S);
  cloudTrail(S);
  const { P, zk, zy, W } = S;
  const mid = (z) => (zy[z] + zy[z + 1]) / 2;
  const pocket = (z) => (P[zk[z][0]].side === 'R' ? 'L' : 'R');
  const px = (z, k = 0.3) => (pocket(z) === 'L' ? W * k : W * (1 - k));
  // ── mañana ──
  landmark(S, 0, sunFace(), pocket(0) === 'L' ? W - 60 : 60, zy[0] + 70, { y0: 20, ky: 1, kx: 0.4 });
  const morning = island('manana', 128, 0, [
    [roundTree('m1', 20, 22, 0, '#F47FA4'), -28, -4],
    [def('hamaca', () => ({ box: [-10, -32, 10, 2], svg: swingSvg(0, 0, 30) })), -6, 4],
    [picketFence(44), 26, 2],
    [balloonBunch('m1', ['#F47F8E', '#7FC3F0', '#FFD45C', '#B79BF2', '#8ED89A']), 40, 0],
    [flowerDots('m1', [[-46, 6, '#FFFFFF'], [-40, 10, '#FFD45C'], [8, 12, '#F47FA4'], [16, 9, '#FFFFFF']]), 0, 0],
  ]);
  landmark(S, 0, morning, px(0, 0.3), mid(0) + 20, { ky: 0.5, kx: 0.6 });
  landmark(S, 0, island('manana2', 76, 0, [[def('banco-m', () => ({ box: [-12, -16, 12, 2], svg: face(rr(-11, -8, 22, 3, 1), '#C98F5A', { w: 1.2 }) + face(rr(-10, -15, 20, 3, 1), '#C98F5A', { w: 1.2 }) + line('M-9 0V-8M9 0V-8', '#8C6A50', 1.6) })), -8, 0], [kite(60), 14, 0], [flowerDots('m2', [[-24, 4, '#F47FA4'], [20, 6, '#FFD45C']]), 0, 0]]), px(0, 0.75), zy[1] - 60, { ky: 0.6, kx: 0.5 });
  sprinkle(S, 0, [freeBalloons('m2', ['#FFD45C', '#F47F8E', '#7FC3F0']), freeBalloons('m3', ['#B79BF2', '#8ED89A', '#F47F8E'])], 2, { top: 60, m: -6, max: 1 });
  // ── tarde ──
  const picnic = island('picnic', 136, 1, [
    [roundTree('t1', 18, 22, 1), -50, -8],
    [roundTree('t2', 16, 20, 1, '#FF9E6A'), 52, -6],
    [def('fotos', () => ({ box: [-50, -56, 50, 22], svg: photoLine(96, ['#8FD3F5', '#FFB6CC', '#C9A6FF', '#8ED07A', '#FFD45C']) })), 0, -4],
    [def('picnic', () => ({ box: [-32, -26, 34, 6], svg: picnicSvg() })), 0, 8],
  ]);
  landmark(S, 1, picnic, px(1, 0.32), mid(1), { ky: 0.4, kx: 0.6 });
  landmark(S, 1, hotAirBalloon(), px(1, 0.75), zy[1] + 60, { ky: 0.5, kx: 0.4 });
  sprinkle(S, 1, [skyLantern('#FFB36B'), skyLantern('#F47F8E'), skyLantern('#FFD45C')], 5, { top: 40, m: -6, max: 2 });
  // ── noche ──
  landmark(S, 2, moon(), pocket(2) === 'L' ? 60 : W - 60, zy[2] + 60, { ky: 1, kx: 0.4 });
  const night = island('noche', 132, 2, [
    [roundTree('n1', 16, 20, 2), -46, -6],
    [nightCottage(), 4, 2],
    [glowLamp(), 46, 6],
    [flowerDots('n1', [[-30, 10, '#B9C6FF'], [30, 12, '#FFE58A']]), 0, 0],
  ]);
  landmark(S, 2, night, px(2, 0.3), mid(2) + 30, { ky: 0.4, kx: 0.6 });
  landmark(S, 2, island('noche2', 70, 2, [[telescope(), 0, 2]]), px(2, 0.78), zy[2] + 140, { ky: 0.5, kx: 0.5 });
  // luciérnagas
  scatter(S, 2, 26, (x, y) => { G.flat(S, L_DETAIL + 3, '#FFF6A8', rr(x - 1, y - 1, 2.4, 2.4, 1), y - 2, y + 2); }, { top: 40, m: 12 });
}

// ═════════════════════════════════════════════════════════════════
// ROMPECABEZAS: un jardín y un bosque donde las piezas son parte del
// paisaje (las piedras del camino, el estanque, un seto podado, piezas
// tiradas entre el musgo).
// ═════════════════════════════════════════════════════════════════
const ROM = {
  lawn: '#B9E09A', lawnLt: '#CDEBB2', lawnDk: '#9ED082', lawnDp: '#86BF6E',
  floor: '#8FBF7A', floorDk: '#74A863', moss: '#A9D388', floorLt: '#A2CE8A',
  stone: '#EEE5D5', stoneDk: '#C4B6A2', stoneLt: '#FBF6EC',
  pieces: ['#F27C8E', '#7FC3F0', '#FFD45C', '#8ED89A', '#B79BF2', '#FFA552'],
};

// Contorno de una pieza de rompecabezas (cuadrada, lado s) con perillas:
// k = [arriba, derecha, abajo, izquierda]: 1 sale, -1 entra, 0 liso.
// sy aplasta en vertical (vista 3/4 en el piso: 0.55).
function puzzleD(cx, cy, s, k = [1, -1, 1, -1], sy = 1, rot = 0) {
  const h = s / 2, r = s * 0.15;
  const corners = [[-h, -h], [h, -h], [h, h], [-h, h]];
  const pts = [];
  for (let e = 0; e < 4; e++) {
    const [ax, ay] = corners[e], [bx, by] = corners[(e + 1) % 4];
    const ux = (bx - ax) / s, uy = (by - ay) / s;
    const nx = uy, ny = -ux; // hacia afuera (los bordes van en sentido horario)
    pts.push([ax, ay]);
    const kk = k[e];
    if (!kk) continue;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const L = (x, y) => [mx + ux * x + nx * y * kk, my + uy * x + ny * y * kk];
    pts.push(L(-0.42 * r, 0));
    for (let a = 205; a >= -25; a -= 23) { const t = (a * Math.PI) / 180; pts.push(L(Math.cos(t) * r, r + Math.sin(t) * r)); }
    pts.push(L(0.42 * r, 0));
  }
  const ca = Math.cos((rot * Math.PI) / 180), sa = Math.sin((rot * Math.PI) / 180);
  return poly(pts.map(([x, y]) => { const X = x * ca - y * sa, Y = x * sa + y * ca; return [cx + X, cy + Y * sy]; }));
}

// Seto podado con forma de pieza (de pie).
function puzzleHedge(c = '#5FA85A') {
  return def(`seto-pieza-${c}`, () => {
    let s = face(`M-18 0V-4H18V0Z`, '#8E6A4A', { w: 1.4 });
    s += part(puzzleD(0, -24, 34, [1, 1, 0, -1], 1), c, { w: 2 });
    s += flat(puzzleD(-2, -26, 22, [1, 0, 0, 0], 1), tone(c, 0.45));
    let lv = '';
    [[-10, -30], [4, -18], [-4, -12], [10, -32], [12, -14], [-12, -18]].forEach(([x, y]) => { lv += leafD(x, y, 4.5, -40, 1.6); });
    s += flat(lv, tone(c, -0.5));
    return { box: [-28, -54, 28, 4], svg: s, shadow: [0, 1, 18, 3] };
  });
}

// Glorieta blanca con techo turquesa y, adentro, una mesa con un
// rompecabezas a medio armar.
function gazebo() {
  return def('glorieta', () => {
    let s = '';
    // piso
    s += face('M-40 -6V0A40 10 0 0 0 40 0V-6Z', '#E6DCCB', { w: 1.8 });
    s += face(ell(0, -6, 40, 10), '#F4EEE2', { w: 1.8 });
    // poste de atrás
    s += face(rr(-2, -58, 4, 46, 1.2), '#FFFFFF', { w: 1.3 });
    // mesa con rompecabezas
    s += part(rr(-2, -20, 4, 12, 1), '#C98F5A', { w: 1.2 });
    s += face(ell(0, -21, 16, 5), '#E4B37E', { w: 1.5 });
    ROM.pieces.slice(0, 5).forEach((c, i) => { s += flat(puzzleD(-9 + i * 4.5, -21.5 + (i % 2) * 1.6, 4.4, [i % 2 ? 1 : -1, 1, i % 2 ? -1 : 1, -1], 0.55), c); });
    s += part(puzzleD(14, -10, 5, [1, -1, 1, 0], 0.55, 20), ROM.pieces[5], { w: 1 });
    // postes de adelante y barandas
    for (const x of [-38, -14, 14, 38]) s += face(rr(x - 2.2, -60, 4.4, 56 - Math.abs(x) * 0.06, 1.2), '#FFFFFF', { w: 1.4 });
    s += face(rr(-38, -24, 22, 3, 1), '#FFFFFF', { w: 1.2 }) + face(rr(16, -24, 22, 3, 1), '#FFFFFF', { w: 1.2 });
    s += line('M-33 -21V-6M-27 -21V-5M-21 -21V-5M21 -21V-5M27 -21V-5M33 -21V-6', '#FFFFFF', 1.6);
    // techo
    s += part('M-46 -58Q-30 -64 0 -90Q30 -64 46 -58Q44 -54 38 -56Q30 -52 22 -55Q14 -51 6 -54Q0 -51 -6 -54Q-14 -51 -22 -55Q-30 -52 -38 -56Q-44 -54 -46 -58Z', '#7FC9C0', { w: 2 });
    s += line('M0 -88L-16 -56M0 -88L16 -56', '#5FAFA6', 1.4, { opacity: 0.9 });
    s += shine('M-30 -62Q-18 -70 -6 -82Q-14 -70 -24 -60Z', 0.55);
    s += part(circ(0, -92, 3), '#FFD45C', { w: 1.2 });
    return { box: [-48, -96, 48, 12], svg: s, shadow: [0, 2, 42, 7], solid: [[-46, -94, 46, 10]] };
  });
}

// Bebedero de pájaros con un pajarito.
function birdbath() {
  return def('bebedero', () => {
    let s = face('M-7 0L-5 -4H5L7 0Z', '#D8D2C8', { w: 1.4 }) + face(rr(-2.6, -18, 5.2, 14, 1.5), '#E6E0D6', { w: 1.3 });
    s += face('M-13 -20Q0 -12 13 -20Z', '#E6E0D6', { w: 1.5 }) + face(ell(0, -20, 13, 3.6), '#F4F0EA', { w: 1.4 }) + flat(ell(0, -20, 10, 2.4), '#9ED8F2');
    s += part(ell(6, -25, 3.6, 2.8), '#F2A65A', { w: 1.1 }) + part(circ(9, -28, 2.2), '#F2A65A', { w: 1 }) + flat(rr(9.4, -28.8, 1.1, 1.1, 0.3), '#3A2A3E') + part('M11 -28l2 0.6l-2 0.8Z', '#FFD45C', { w: 0.7 });
    return { box: [-15, -32, 15, 3], svg: s, shadow: [0, 1, 8, 2] };
  });
}

// Tulipanes en grupito.
function tulips(id, list) {
  return def(`tulipanes-${id}`, () => {
    let s = '';
    list.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, h, c]) => {
      s += line(`M${x} ${y}V${y - h}`, '#4F9A4B', 1.8) + part(leafD(x, y - 2, 8, -110, 2.4), '#6DBA5E', { w: 1 });
      s += part(`M${x - 4} ${y - h - 6}L${x - 4} ${y - h}Q${x} ${y - h + 3} ${x + 4} ${y - h}L${x + 4} ${y - h - 6}L${x + 2} ${y - h - 3.6}L${x} ${y - h - 7}L${x - 2} ${y - h - 3.6}Z`, c, { w: 1.2 });
    });
    const xs = list.map((f) => f[0]);
    return { box: [Math.min(...xs) - 8, -Math.max(...list.map((f) => f[2])) - 10, Math.max(...xs) + 8, Math.max(...list.map((f) => f[1])) + 3], svg: s, shadows: list.map(([x, y]) => [x, y + 1, 4, 1.4]) };
  });
}

// Pino en capas.
function pine(id, h = 60, c = '#4E9A6A') {
  return def(`pino-${id}-${h}`, () => {
    let s = face('M-4 0L-3 -12H3L4 0Z', '#8A5E3E', { w: 1.5 });
    const tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const y = -10 - i * (h - 14) / tiers, w = 22 - i * 5;
      s += part(`M${-w} ${f1(y)}Q0 ${f1(y + 5)} ${w} ${f1(y)}L${f1(w * 0.3)} ${f1(y - (h - 4) / tiers - 6)}L0 ${f1(y - (h - 4) / tiers - 9)}L${f1(-w * 0.3)} ${f1(y - (h - 4) / tiers - 6)}Z`, i % 2 ? tone(c, 0.2) : c, { w: 1.7 });
      s += flat(`M${f1(-w * 0.65)} ${f1(y - 2)}L${f1(-w * 0.2)} ${f1(y - (h - 4) / tiers)}L${f1(-w * 0.05)} ${f1(y - 4)}Z`, tone(c, 0.6));
    }
    return { box: [-24, -h - 6, 24, 4], svg: s, shadow: [0, 1, 14, 3], solid: [[-22, -h, 22, 2]] };
  });
}

// Hongos (rojo con lunares y uno marrón chiquito).
function mushrooms(id, list) {
  return def(`hongos-${id}`, () => {
    let s = '';
    list.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, r, c]) => {
      s += face(`M${x - r * 0.35} ${y}L${x - r * 0.3} ${y - r * 0.9}H${x + r * 0.3}L${x + r * 0.35} ${y}Z`, '#F6EEDD', { w: 1.3 });
      s += part(`M${x - r} ${y - r * 0.8}C${x - r} ${y - r * 2} ${x + r} ${y - r * 2} ${x + r} ${y - r * 0.8}Q${x} ${y - r * 0.5} ${x - r} ${y - r * 0.8}Z`, c, { w: 1.6 });
      if (c !== '#B98A5E') s += flat(circ(x - r * 0.45, y - r * 1.3, r * 0.2) + circ(x + r * 0.25, y - r * 1.55, r * 0.17) + circ(x + r * 0.55, y - r * 1.05, r * 0.15), '#FFFFFF');
      s += shine(ell(x - r * 0.5, y - r * 1.55, r * 0.14, r * 0.1), 0.7);
    });
    const xs = list.map((f) => f[0]);
    const big = Math.max(...list.map((f) => f[2]));
    return { box: [Math.min(...xs) - big - 2, -big * 2 - 4, Math.max(...xs) + big + 2, Math.max(...list.map((f) => f[1])) + 3], svg: s, shadows: list.map(([x, y, r]) => [x, y + 1, r * 0.7, 2]) };
  });
}

function mushroomsSmall(x, y) {
  return face(`M${x - 1.4} ${y}V${y - 4}H${x + 1.4}V${y}Z`, '#F6EEDD', { w: 1 }) + part(`M${x - 4} ${y - 3.4}C${x - 4} ${y - 8} ${x + 4} ${y - 8} ${x + 4} ${y - 3.4}Z`, '#B98A5E', { w: 1.1 });
}

// Casita en un hongo gigante, con puerta, ventanas y chimenea.
function mushroomHouse() {
  return def('casa-hongo', () => {
    let s = '';
    s += face('M-18 0Q-20 -16 -16 -34H16Q20 -16 18 0Z', '#F6EEDD', { w: 2 });
    s += tonePath('M8 -34H16Q20 -16 18 0H10Z', '#8A6A4A', 0.2);
    s += face(rrTop(-6, -20, 12, 20, 6), '#9C6446', { w: 1.6 }) + flat(circ(3, -10, 1.3), '#FFD45C');
    s += face(circ(-11, -24, 4), '#FFFFFF', { w: 1.4 }) + flat(circ(-11, -24, 2.6), '#FFE48A');
    s += face(circ(11, -22, 3.6), '#FFFFFF', { w: 1.4 }) + flat(circ(11, -22, 2.3), '#FFE48A');
    s += part('M-36 -32C-38 -66 38 -66 36 -32Q0 -24 -36 -32Z', '#E8574F', { w: 2.2 });
    s += flat(circ(-20, -46, 5) + circ(4, -54, 4.4) + circ(22, -42, 4) + circ(-4, -38, 3), '#FFFFFF');
    s += shine('M-26 -44Q-22 -54 -12 -58Q-20 -52 -22 -42Z', 0.6);
    s += face(rr(16, -64, 7, 12, 1), '#B98A5E', { w: 1.3 }) + part(fluffD(21, -70, 3.4, 5, 0.2, 0), '#FFFFFF', { w: 1 });
    s += face(rr(-12, 0, 24, 3, 1.2), '#C9BCA8', { w: 1.2 });
    s += flat(tuftD(-22, 2, 0.7) + tuftD(22, 2, 0.7), ROM.floorDk);
    return { box: [-40, -76, 40, 4], svg: s, shadow: [0, 1, 26, 4] };
  });
}

// Tronco caído con anillos y musgo.
function fallenLog() {
  return def('tronco-caido', () => {
    let s = face(rr(-28, -14, 52, 14, 7), '#9C6A40', { w: 1.8 });
    s += line('M-20 -9q10 -2 20 0M-10 -4q12 2 22 0', '#7A4E2E', 1.4, { opacity: 0.7 });
    s += part(ell(24, -7, 6, 7), '#E4B37E', { w: 1.6 }) + line('M24 -7m-3 0a3 3.4 0 1 0 6 0a3 3.4 0 1 0 -6 0', '#B98A5E', 1.2);
    s += flat(puffD(-24, 0, -12, [[-18, 4], [-10, 5], [-4, 3.4]]), ROM.moss);
    s += mushroomsSmall(-2, -12);
    return { box: [-30, -24, 32, 3], svg: s, shadow: [0, 1, 28, 3] };
  });
}

// Tocón con una pieza de rompecabezas encima (alguien la dejó ahí).
function stumpWithPiece() {
  return def('tocon-pieza', () => {
    let s = face('M-12 0Q-13 -8 -11 -14H11Q13 -8 12 0Z', '#9C6A40', { w: 1.8 });
    s += line('M-6 -12V-2M3 -13V-3', '#7A4E2E', 1.2, { opacity: 0.7 });
    s += face(ell(0, -14, 11, 4), '#E4B37E', { w: 1.6 }) + line('M-5 -14a5 1.8 0 1 0 10 0a5 1.8 0 1 0 -10 0', '#C98F5A', 1.1);
    s += part(puzzleD(1, -16, 8, [1, -1, 0, 1], 0.55, 15), ROM.pieces[1], { w: 1.2 });
    s += part(leafD(-12, -2, 7, -150, 2.6), '#6DBA5E', { w: 1 }) + part(leafD(12, -1, 7, -30, 2.6), '#6DBA5E', { w: 1 });
    return { box: [-16, -24, 16, 3], svg: s, shadow: [0, 1, 12, 2.5] };
  });
}

// Helechos.
function fern(id) {
  return def(`helecho-${id}`, () => {
    let s = '';
    [[-150, 14], [-120, 16], [-90, 17], [-60, 16], [-30, 14]].forEach(([a, l], i) => { s += part(leafD(0, 0, l, a, 3.2), i % 2 ? '#5FAF62' : '#4F9A55', { w: 1.1 }); });
    return { box: [-18, -19, 18, 3], svg: s, shadow: [0, 1, 10, 2] };
  });
}

function rompecabezasGround(S) {
  const { zy, H, W } = S;
  const r = S.r;
  G.flat(S, L_BASE, '#DDF0FF', rr(-10, -10, W + 20, 80), -10, 70);
  G.flat(S, L_BASE + 1, '#FFFFFF', puffD(30, 120, 30, [[44, 8], [64, 12], [88, 10], [106, 7]]) + puffD(220, 320, 24, [[236, 8], [258, 11], [282, 9], [302, 7]]), 0, 36);
  // fila de árboles lejanos (el bosque que viene)
  let tr = 'M-10 76';
  for (let x = -10; x <= W + 10; x += 14) tr += `Q${x + 7} ${44 + ((x * 7) % 11)} ${x + 14} 76`;
  G.flat(S, L_BASE + 2, '#8CC79A', `${tr}V90H-10Z`, 40, 90);
  G.flat(S, L_BASE + 3, ROM.lawn, wavyRegion(-10, W + 10, 72, 2, 60, 0.5, zy[1] + 40), 60, zy[1] + 40);
  G.flat(S, L_BASE + 4, ROM.floor, wavyRegion(-10, W + 10, zy[1] + 4, 4, 50, 1.4, H + 20), zy[1] - 6, H + 20);
  // manchas del pasto (jardín) y musgo (bosque)
  for (let y = 100; y < zy[1] - 20; y += 34) {
    const x = 20 + r() * (W - 40), rx = 20 + r() * 22;
    G.flat(S, L_TERRAIN, r() < 0.5 ? ROM.lawnLt : ROM.lawnDk, puffD(x - rx, x + rx, y + 8, [[x - rx * 0.5, rx * 0.3], [x, rx * 0.42], [x + rx * 0.5, rx * 0.3]]), y - 30, y + 10);
  }
  for (let y = zy[1] + 30; y < H; y += 30) {
    const x = 20 + r() * (W - 40), rx = 18 + r() * 22;
    G.flat(S, L_TERRAIN, r() < 0.5 ? ROM.moss : ROM.floorDk, puffD(x - rx, x + rx, y + 8, [[x - rx * 0.5, rx * 0.3], [x, rx * 0.42], [x + rx * 0.5, rx * 0.3]]), y - 30, y + 10);
  }
}

// El camino: piedras con forma de pieza, encastradas una tras otra; debajo
// de cada parada, una pieza grande.
function puzzlePath(S) {
  const { samp, P } = S;
  let n = 0;
  for (let i = 2; i < samp.length; i += 6) {
    const p = samp[i];
    // lejos de las paradas (ahí va la pieza grande)
    if (P.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 30)) continue;
    const ang = (Math.atan2(p.ty, p.tx) * 180) / Math.PI - 90;
    const k = n % 2 ? [1, -1, -1, 1] : [-1, 1, 1, -1];
    const forest = S.zoneAt(p.y) > 0;
    const c = forest ? '#E2DCC8' : ROM.stone;
    G.flat(S, L_ROAD, ROM.stoneDk, puzzleD(p.x, p.y + 2.4, 17, k, 0.58, ang), p.y - 14, p.y + 16);
    G.flat(S, L_ROAD + 1, c, puzzleD(p.x, p.y, 17, k, 0.58, ang), p.y - 14, p.y + 14);
    if (forest && n % 3 === 0) G.flat(S, L_ROAD + 2, ROM.moss, ell(p.x - 3, p.y + 2, 3.6, 1.6), p.y, p.y + 4);
    else G.flat(S, L_ROAD + 2, ROM.stoneLt, ell(p.x - 3, p.y - 2, 4, 1.4), p.y - 4, p.y);
    n++;
  }
  P.forEach((p, k) => {
    const c = ROM.pieces[k % ROM.pieces.length];
    G.flat(S, L_ROAD + 3, tone(c, -0.9), puzzleD(p.x, p.y + 8, 60, [-1, 1, 1, -1], 0.5), p.y - 16, p.y + 34);
    G.flat(S, L_ROAD + 4, mix(c, '#FFFFFF', 0.4), puzzleD(p.x, p.y + 5, 60, [-1, 1, 1, -1], 0.5), p.y - 16, p.y + 32);
    G.flat(S, L_ROAD + 5, mix(c, '#FFFFFF', 0.7), puzzleD(p.x - 4, p.y + 2, 40, [0, 0, 0, 0], 0.4), p.y - 8, p.y + 14);
  });
  G.line(S, L_ROAD + 5, '#9CF0B8', 1.6, samp.filter((p, i) => i % 6 === 0).map((p) => `M${f1(p.x - 6)} ${f1(p.y)}h12`).join(''), 0, S.H, 1, 'neon');
}

// Estanque con forma de pieza, con nenúfares.
function puzzlePond(S, x, y, s) {
  const y0 = y - s * 0.5, y1 = y + s * 0.5;
  G.flat(S, L_WATER, ROM.lawnDp, puzzleD(x, y, s + 6, [1, -1, 1, 1], 0.5), y0 - 6, y1 + 6);
  G.flat(S, L_WATER + 1, '#6FB9E2', puzzleD(x, y + 2, s, [1, -1, 1, 1], 0.5), y0, y1);
  G.flat(S, L_WATER + 2, '#9ED8F4', puzzleD(x + 1, y + 4, s - 6, [1, -1, 1, 1], 0.5), y0, y1);
  G.line(S, L_WATER + 3, '#FFFFFF', 1.8, `M${f1(x - s * 0.25)} ${f1(y + 2)}h8M${f1(x + s * 0.05)} ${f1(y + s * 0.18)}h6`, y0, y1, 0.9);
  [[-0.2, -0.05], [0.18, 0.12], [-0.05, 0.2]].forEach(([a, b], i) => {
    const lx = x + a * s, ly = y + b * s;
    G.flat(S, L_WATER + 4, '#6DBA5E', `M${f1(lx)} ${f1(ly)}L${f1(lx + 5)} ${f1(ly - 1)}A5 2.6 0 1 1 ${f1(lx + 4)} ${f1(ly + 1.6)}Z`, ly - 4, ly + 4);
    if (i === 0) G.flat(S, L_WATER + 5, '#F7A8C0', circ(lx - 1, ly - 1, 1.8), ly - 3, ly + 1);
  });
  S.mark(x - s * 0.62, y - s * 0.34, x + s * 0.62, y + s * 0.34);
}

function rompecabezasBuild(S) {
  rompecabezasGround(S);
  puzzlePath(S);
  const { P, zk, zy, W } = S;
  const mid = (z) => (zy[z] + zy[z + 1]) / 2;
  const trY = (z) => { const a = P[zk[z][0] - 1], b = P[zk[z][0]]; return ev((a.y + b.y) / 2); };
  const roadX = (y) => S.samp.reduce((bst, p) => (Math.abs(p.y - y) < Math.abs(bst.y - y) ? p : bst), S.samp[0]).x;
  // ── el jardín ──
  // estanque con forma de pieza en el hueco más grande
  {
    let best = null;
    for (let y = zy[0] + 120; y < zy[1] - 60; y += 8) for (let x = 60; x < W - 60; x += 8) {
      if (!rectFree(S, x - 46, y - 26, x + 46, y + 26) || S.onRoad(x, y, 50)) continue;
      const sc = Math.abs(y - mid(0)) * 0.3 + Math.abs(x - W / 2) * 0.2;
      if (!best || sc < best.sc) best = { x, y, sc };
    }
    if (best) {
      puzzlePond(S, best.x, best.y, 70);
      const bb = birdbath();
      if (fits(S, bb, best.x + 52, best.y + 18)) put(S, bb, best.x + 52, best.y + 18);
    }
  }
  landmark(S, 0, gazebo(), W / 2, zy[0] + 150, { ky: 0.5, kx: 0.4 });
  frame(S, 0, [puzzleHedge('#5FA85A'), bush('r1', 12, '#F7A8C0'), appleTree('r1', 20, 22, '#F7A8C0'), tulips('r1', [[-8, 0, 12, '#F27C8E'], [0, 3, 15, '#FFD45C'], [8, 1, 11, '#F27C8E']]), bush('r2', 13, '#FFFFFF'), roundTree('r3', 18, 20, 0), puzzleHedge('#6DBA5E')], { top: 90, every: 58, inset: 14, dx: 16 });
  sprinkle(S, 0, [tulips('r2', [[-6, 0, 12, '#B79BF2'], [4, 2, 14, '#FFFFFF'], [12, 0, 11, '#B79BF2']]), puzzleHedge('#7FC06A'), bench(), tulips('r3', [[-6, 0, 13, '#FFA552'], [5, 2, 11, '#F27C8E']]), bush('r3', 10, '#FFD45C')], 10, { top: 90, m: -4, max: 2 });
  // transición jardín → bosque: seto con dos pilares de rosas a los lados del camino
  {
    const y = trY(1) + 10, x = roadX(y);
    const lw = ev(x - 22 + 10), rw = ev(W + 10 - (x + 22));
    const hedge = (len) => def(`seto-${len}`, () => {
      let s = face(rr(-len / 2, -16, len, 16, 5), '#4F9A55', { w: 1.8 }) + face(rr(-len / 2, -22, len, 8, 4), '#6DBA5E', { w: 1.6 });
      let d = '';
      for (let xx = -len / 2 + 6; xx < len / 2 - 4; xx += 11) d += leafD(xx, -10 - ((xx * 3) % 4), 4.6, -40, 1.6);
      s += flat(d, '#3E8A4A');
      s += flat(Array.from({ length: Math.floor(len / 16) }, (_, i) => circ(-len / 2 + 8 + i * 16, -20 + (i % 2) * 2, 2.2)).join(''), '#F7A8C0');
      return { box: [-len / 2 - 2, -24, len / 2 + 2, 3], svg: s, shadows: [[0, 1, len / 2, 3]] };
    });
    if (lw > 20) put(S, hedge(lw), ev(-10 + lw / 2), y, { block: false });
    if (rw > 20) put(S, hedge(rw), ev(x + 22 + rw / 2), y, { block: false });
    S.mark(-10, y - 26, W + 10, y + 4);
  }
  // ── el bosque ──
  landmark(S, 1, mushroomHouse(), W / 2, mid(1) + 20, { ky: 0.4, kx: 0.4 });
  landmark(S, 1, fallenLog(), W / 2, zy[1] + 80, { ky: 0.5, kx: 0.3 });
  frame(S, 1, [pine('a', 66), roundTree('b1', 20, 22, 0), pine('b', 56, '#3F8A60'), group('bosque-a', [[pine('c', 60), -14, 0], [pine('d', 48, '#3F8A60'), 14, 8]]), roundTree('b2', 18, 20, 0, '#F27C8E'), group('bosque-b', [[roundTree('b4', 16, 18, 0), -16, 0], [pine('e', 52), 12, 6]])], { top: 30, every: 46, inset: 12, dx: 18 });
  sprinkle(S, 1, [group('bosque-c', [[pine('f', 50), -10, 0], [pine('g', 40, '#3F8A60'), 12, 6], [fern('c'), 0, 12]]), mushrooms('a', [[-8, 0, 8, '#E8574F'], [6, 3, 5, '#B98A5E'], [12, -1, 4, '#E8574F']]), stumpWithPiece(), fern('a'), roundTree('b5', 17, 18, 0), mushrooms('b', [[0, 0, 7, '#E8574F'], [10, 2, 4, '#B98A5E']]), fern('b'), pine('h', 46)], 14, { top: 40, m: -4, max: 2 });
  // piezas de rompecabezas tiradas entre el musgo
  scatter(S, 1, 16, (x, y, i) => {
    const c = ROM.pieces[i % ROM.pieces.length];
    G.flat(S, L_DETAIL, tone(c, -0.8), puzzleD(x, y + 1.6, 12, [1, -1, i % 2 ? 1 : -1, 1], 0.55, (i * 37) % 60 - 30), y - 8, y + 8);
    G.flat(S, L_DETAIL + 1, c, puzzleD(x, y, 12, [1, -1, i % 2 ? 1 : -1, 1], 0.55, (i * 37) % 60 - 30), y - 8, y + 8);
  }, { top: 30, m: 12 });
  scatter(S, 0, 90, (x, y) => G.flat(S, L_DETAIL, ROM.lawnDp, tuftD(x, y, 0.8 + S.r() * 0.4), y - 8, y + 1), { top: 70 });
  scatter(S, 1, 90, (x, y) => G.flat(S, L_DETAIL, ROM.floorDk, tuftD(x, y, 0.8 + S.r() * 0.4), y - 8, y + 1), { top: 20 });
  roadFlowers(S, 0, ['#FFFFFF', '#F7A8C0', '#FFD45C'], ROM.lawnDp);
}

// ═════════════════════════════════════════════════════════════════
// Los mundos. `zones`: nombre y colores del fondo provisional (mientras
// se dibuja la escena); `path`: colores del avance; `step`, `layout` y
// `wave`: cómo se reparten las paradas; `build`: arma la escena.
// ═════════════════════════════════════════════════════════════════
export const MAP_THEMES = {
  golosinas: {
    path: { done: '#F05A78', ink: INK },
    extra: (k, count) => {
      // aire para el río en la zona del medio
      const z1 = Math.floor(count / 3);
      return k === z1 + 2 ? 44 : 0;
    },
    zones: [
      { name: 'Prado de gomitas', bg: ['#DDEEFF', '#AEDE9C'] },
      { name: 'Río de chocolate', bg: ['#F4DDB0', '#F4DDB0'] },
      { name: 'Nubes de algodón', bg: ['#F1EAFB', '#F1EAFB'] },
    ],
    build: golosinasBuild,
  },
  cocina: {
    path: { done: '#E8964A', ink: INK },
    step: 92,
    layout: sideLayout(['R', 'L', 'R'], 40, [0, 22, 6, 28, 10]),
    zones: [
      { name: 'La huerta', bg: ['#DDF0FF', '#B5DC97'] },
      { name: 'El mercado', bg: ['#D9CBB8', '#D9CBB8'] },
      { name: 'La pastelería', bg: ['#F9E4E8', '#F9E4E8'] },
    ],
    build: cocinaBuild,
  },
  memoria: {
    path: { done: '#FFB347', ink: INK },
    step: 96,
    layout: sideLayout(['L', 'R', 'L'], 36, [0, 22, 8, 26]),
    zones: [
      { name: 'Mañana de recuerdos', bg: ['#BFE3FF', '#FFF1DE'] },
      { name: 'Tarde de fotos', bg: ['#FFE6C6', '#F6B3C6'] },
      { name: 'Noche de estrellas', bg: ['#7472BE', '#2E2F66'], dark: true },
    ],
    build: memoriaBuild,
  },
  rompecabezas: {
    path: { done: '#F27C8E', ink: INK },
    step: 108,
    wave: { f: 1.25, ph: 0.3, amp: 80 },
    zones: [
      { name: 'El jardín', bg: ['#DDF0FF', '#B9E09A'] },
      { name: 'El bosque', bg: ['#8FBF7A', '#8FBF7A'] },
    ],
    build: rompecabezasBuild,
  },
};

/**
 * Lo que el mapa necesita antes de armar la escena (es barato): ancho,
 * alto, corrimiento del camino y dónde empieza cada zona.
 */
export function mapFrame(theme, count, pts) {
  const T = MAP_THEMES[theme];
  const H = evUp(pts[pts.length - 1].y + TAIL);
  const zones = T.zones.map((Z, z) => {
    const k = pts.findIndex((_, i) => zoneOf(theme, count, i) === z);
    return { name: Z.name, bg: Z.bg, dark: !!Z.dark, y: k <= 0 ? 0 : ev((pts[k - 1].y + pts[k].y) / 2) };
  });
  return { W: SCENE_W, OX: SCENE_OX, H, zones };
}

/**
 * Todo lo que el mapa necesita para dibujarse.
 * opts: { labels, dim: { paper, k } (oscurecer el suelo en estilos de noche) }
 * Devuelve el ancho y alto del dibujo, los trozos del suelo, las piezas
 * (cada una con su lugar), el camino y los carteles de cada zona.
 */
export function mapScene(theme, count, pts, opts = {}) {
  const S = makeScene(theme, count, pts, opts);
  S.T.build(S);
  if (opts.debug) {
    let d = '';
    for (let r0 = 0; r0 < S.rows; r0++) for (let c = 0; c < S.cols; c++) if (S.block[r0 * S.cols + c]) d += `M${c * CELL} ${r0 * CELL}h${CELL}v${CELL}h${-CELL}Z`;
    gop(S, 99, 'tone', '#FF0000', d, 0, S.H, { op: 0.25 });
  }
  const dim = opts.dim || null;
  const split = opts.kit === 'papel' ? 1800 : 0;
  const dk = (dim ? `-d${Math.round(dim.k * 100)}${dim.paper}` : '') + (split ? `-s${split}` : '');
  // trozos del suelo
  const chunks = [];
  for (let y = 0; y < S.H; y += CHUNK) {
    let h = Math.min(CHUNK, S.H - y);
    if (S.H - (y + h) < 160 && y + h < S.H) h = S.H - y; // sin trozos chiquitos al final
    const y0 = y - CHUNK_PAD, y1 = y + h + CHUNK_PAD;
    chunks.push({
      key: `${theme}-${count}-g${chunks.length}${dk}`, y, h,
      markup: piece(S.W, h + CHUNK_PAD * 2, `<g transform="translate(0 ${-y0})">${emitGround(S, y0, y1, dim, split)}</g>`),
    });
    if (y + h >= S.H) break;
    y += h - CHUNK;
  }
  const pieces = S.pcs.slice().sort((a, b) => a.z - b.z || a.x - b.x).map((p, i) => ({
    key: `${p.d.id}`, n: i, x: p.x + p.d.box[0], y: p.y + p.d.box[1], w: p.d.box[2] - p.d.box[0], h: p.d.box[3] - p.d.box[1], z: p.z, markup: markupOf(p.d),
  }));
  return {
    W: S.W, OX: SCENE_OX, H: S.H,
    path: S.T.path,
    road: roadPathD(S.segs),
    zones: S.T.zones.map((Z, z) => ({ name: Z.name, y: S.zy[z], dark: !!Z.dark, bg: Z.bg, sign: S.signs[z] })),
    chunks, pieces,
    trail: S.samp.filter((p, i) => i % 4 === 2).map((p) => ({ x: f1(p.x), y: f1(p.y), k: p.k })),
  };
}

