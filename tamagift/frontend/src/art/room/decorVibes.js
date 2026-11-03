// Decoración con personalidad: cosas que cuentan quién vive en el cuarto
// (ver DISENO_MUNDO_VIVO.md §8). Cada una lleva sus estilos de persona
// (`vibes`) y casi todas se pueden pintar: reciben la pintura elegida
// (`p`: wood, cloth, accent; ver furniture/paints.js).
//
// Misma vista 3/4 que todo el cuarto: frente + tapa, elipses aplastadas,
// luz de arriba a la izquierda. `place`: 'sobre' (encima de muebles, en
// la pared o donde quieras) o 'piso'. En el cuarto se dibujan a ×1.25 y
// un píxel de arte mide ~1.4 unidades: los detalles van de 2–3 unidades
// para arriba, y lo repetido (lunares, tramas) va en un solo trazo por
// color para que el papel recortado no lo vuelva confeti.
//
// Arriba van las ayudas de dibujo que comparten estos adornos y los de
// siempre (decor.js las importa de acá).

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, cylinder, leaf, Cir, Ell, INK, tube } from './draw.js';

const f1 = (v) => +v.toFixed(1);
export const SHADOW = '#2A1C24';
export const CHROME = '#DCE1EA';
export const BRASS = '#E0B65A';
export const GOLD = '#E9C46A';

/** Sombra de contacto sobre un mueble: halo suave y núcleo más oscuro. */
export const surf = (cx, y, rx) => Ell(cx, y, rx, f1(rx * 0.2), { fill: SHADOW, opacity: 0.16, 'data-r': 'tone' })
  + Ell(cx, f1(y - rx * 0.02), f1(rx * 0.66), f1(rx * 0.12), { fill: SHADOW, opacity: 0.3, 'data-r': 'tone' });
/** Sombra de contacto en el piso. */
export const floorSh = (cx, y, rx, ry = rx * 0.17) => Ell(cx, y, rx, f1(ry), { fill: SHADOW, opacity: 0.18, 'data-r': 'tone' })
  + Ell(cx, f1(y - ry * 0.1), f1(rx * 0.72), f1(ry * 0.62), { fill: SHADOW, opacity: 0.3, 'data-r': 'tone' });
/** Halo de luz (lámparas, velas). */
export const glow = (cx, cy, rx, ry, c = '#FFE9A8', op = 0.3) => Ell(cx, cy, rx, ry, { fill: c, opacity: op, 'data-r': 'tone' });

/** Media luna abajo a la derecha de una elipse (el lado en sombra de lo redondo). */
export function crescent(cx, cy, rx, ry, t = 0.3, a1 = -40, a2 = 130) {
  const P = (deg) => { const a = (deg * Math.PI) / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; };
  const [x1, y1] = P(a1), [x2, y2] = P(a2);
  const am = (((a1 + a2) / 2) * Math.PI) / 180;
  const mx = cx + Math.cos(am) * rx * (1 - t), my = cy + Math.sin(am) * ry * (1 - t);
  const qx = 2 * mx - (x1 + x2) / 2, qy = 2 * my - (y1 + y2) / 2;
  return `M${f1(x1)} ${f1(y1)}A${rx} ${ry} 0 0 1 ${f1(x2)} ${f1(y2)}Q${f1(qx)} ${f1(qy)} ${f1(x1)} ${f1(y1)}Z`;
}
/** Sombra de volumen sobre una pieza redonda de color `c`. */
export const roundShade = (cx, cy, rx, ry, c, t = 0.3, op = 0.32) => shade(crescent(cx, cy, rx, ry, t), mat(c).deep, op);
/** Brillo ovalado inclinado (esmalte, vidrio, plástico). */
export const gloss = (x, y, rx, ry, rot = -35, op = 0.85) => `<g transform="rotate(${rot} ${x} ${y})">${shine(ellD(x, y, rx, ry), { opacity: op })}</g>`;

// ── formas ──────────────────────────────────────────────────────────
export const star = (x, y, r, k = 0.48) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr2 = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr2).toFixed(1)} ${(y + Math.sin(a) * rr2).toFixed(1)}`; } return `${d}Z`; };
export const heart = (x, y, s) => `M${x} ${f1(y + s * 0.85)} C${f1(x - s * 1.1)} ${f1(y + s * 0.1)} ${f1(x - s * 1.05)} ${f1(y - s * 0.95)} ${x} ${f1(y - s * 0.35)} C${f1(x + s * 1.05)} ${f1(y - s * 0.95)} ${f1(x + s * 1.1)} ${f1(y + s * 0.1)} ${x} ${f1(y + s * 0.85)}Z`;
export const moon = (x, y, r) => `M${f1(x + r * 0.25)} ${f1(y - r)} A${r} ${r} 0 1 0 ${f1(x + r * 0.25)} ${f1(y + r)} A${f1(r * 0.78)} ${f1(r * 0.78)} 0 1 1 ${f1(x + r * 0.25)} ${f1(y - r)}Z`;
export const ball = (x, y, r, c, w = 1.4) => Cir(x, y, r, { fill: c, stroke: INK, 'stroke-width': w, 'data-r': 'part' });
/** Un punto sin contorno. */
export const dot = (x, y, r, c, a = {}) => Cir(f1(x), f1(y), r, { fill: c, 'data-r': 'flat', ...a });
/** Círculo como trazo (para juntar muchos en uno). */
export const circD = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${f1(r * 2)} 0a${r} ${r} 0 1 0 ${f1(-r * 2)} 0Z`;
/** Muchos círculos del mismo color en un solo trazo (lunares, perlas, tramas). */
export const dots = (pts, r, c, a = {}) => flat(pts.map(([x, y, r2]) => circD(x, y, r2 || r)).join(''), c, a);

// ── caritas kawaii ──────────────────────────────────────────────────
export const eye = (x, y, r = 2.4) => Ell(x, y, r, f1(r * 1.12), { fill: INK, 'data-r': 'flat' }) + Cir(f1(x - r * 0.3), f1(y - r * 0.42), f1(Math.max(0.8, r * 0.4)), { fill: '#FFFFFF', 'data-r': 'shine' });
export const blush = (x, y, rx = 3.4, c = '#FF8FB0') => Ell(x, y, rx, f1(rx * 0.55), { fill: c, opacity: 0.6, 'data-r': 'tone' });
export const smile = (x, y, w = 4, c = INK) => line(`M${f1(x - w / 2)} ${y}q${f1(w / 2)} ${f1(w * 0.55)} ${w} 0`, c, 1.4);
/** Boquita de gato (ω). */
export const catMouth = (x, y, w = 5, c = INK) => line(`M${f1(x - w / 2)} ${y}q${f1(w / 4)} ${f1(w * 0.4)} ${f1(w / 2)} 0q${f1(w / 4)} ${f1(w * 0.4)} ${f1(w / 2)} 0`, c, 1.4);

// ── piezas que se repiten ───────────────────────────────────────────
/** Moño de cinta con dos lazos, nudo y colas. `s` = escala (1 ≈ 23 de ancho). */
export function bow(x, y, s, c, o = {}) {
  const m = mat(c);
  const P = (dx, dy) => `${f1(x + dx * s)} ${f1(y + dy * s)}`;
  let out = '';
  if (o.tails !== false) {
    out += part(`M${P(-1.2, 0.6)}L${P(-5.8, 9.4)}L${P(-3.4, 8.2)}L${P(-2.2, 10.6)}L${P(0.9, 1.4)}Z`, m.side, { w: 1.2 });
    out += part(`M${P(1.2, 0.6)}L${P(5.8, 9.4)}L${P(3.4, 8.2)}L${P(2.2, 10.6)}L${P(-0.9, 1.4)}Z`, m.side, { w: 1.2 });
  }
  const loop = (k) => `M${P(0, 0)}C${P(k * 2.5, -6.8)} ${P(k * 11.4, -7.6)} ${P(k * 10.8, -1.4)}C${P(k * 10.3, 3.8)} ${P(k * 3, 3.4)} ${P(0, 0)}Z`;
  out += part(loop(-1), c, { w: 1.3 }) + part(loop(1), c, { w: 1.3 });
  const inner = (k) => `M${P(k * 1.6, -0.4)}C${P(k * 3, -3.4)} ${P(k * 6.6, -3.8)} ${P(k * 7.2, -1.4)}C${P(k * 6, 0.6)} ${P(k * 3.4, 0.8)} ${P(k * 1.6, -0.4)}Z`;
  out += flat(inner(-1) + inner(1), m.side, { opacity: 0.9 });
  out += part(rr(f1(x - 2.3 * s), f1(y - 2.7 * s), f1(4.6 * s), f1(5 * s), f1(1.6 * s)), m.top, { w: 1.2 });
  if (s >= 0.6) out += shine(`M${P(-9, -2.4)}Q${P(-8.4, -5.6)} ${P(-5, -5.4)}L${P(-5.6, -4.2)}Q${P(-7.6, -4.2)} ${P(-7.8, -2)}Z`, { opacity: 0.6 });
  return out;
}

/** Llamita: base en (x,y), alto ≈ 11·s. */
export function flame(x, y, s = 1) {
  const P = (dx, dy) => `${f1(x + dx * s)} ${f1(y + dy * s)}`;
  return part(`M${P(0, 0)}C${P(-4.2, 0)} ${P(-4.6, -5.4)} ${P(0.4, -11.6)}C${P(1.4, -7.4)} ${P(4.4, -5.4)} ${P(3.8, -2.4)}C${P(3.4, -0.6)} ${P(1.8, 0)} ${P(0, 0)}Z`, '#FFB347', { w: 1.1 })
    + flat(`M${P(0.2, -1)}C${P(-1.9, -1)} ${P(-2, -3.8)} ${P(0.4, -6.8)}C${P(1.9, -3.8)} ${P(2.2, -1)} ${P(0.2, -1)}Z`, '#FFF3B0');
}

/** Vapor que sube (una curva doble con borde suave). */
export function steam(x, y, h = 16) {
  const d = `M${x} ${y}c-5.4 ${f1(-h * 0.18)} 5 ${f1(-h * 0.34)} 0 ${f1(-h * 0.52)}s5 ${f1(-h * 0.3)} 0.4 ${f1(-h * 0.48)}`;
  return line(d, '#D8D0E4', 4.6, { opacity: 0.6, 'data-skip': 'pixel' }) + line(d, '#FFFFFF', 2.6, { opacity: 0.95 });
}

/** Veta de madera ondulada entre x1 y x2. */
export const grainD = (x1, x2, y, amp = 0.8) => { const w = (x2 - x1) / 4; return `M${f1(x1)} ${f1(y)}q${f1(w / 2)} ${f1(-amp)} ${f1(w)} 0t${f1(w)} 0t${f1(w)} 0t${f1(w)} 0`; };
export const grain = (lines, c, op = 0.5) => line(lines.map(([x1, x2, y, a]) => grainD(x1, x2, y, a)).join(''), tone(c, -0.8), 1.1, { opacity: op });

/**
 * Mimbre: hileras de tiras con las uniones corridas, sobre un fondo más
 * oscuro (que va dibujado antes). `edge(y)` da [izq, der] de cada hilera
 * (para canastas que se angostan). Una pasada por color.
 */
export function weave(x, y, w, h, c, o = {}) {
  const rh = o.rh || 5, bw = o.bw || 8;
  const edge = o.edge || (() => [x, x + w]);
  const ds = ['', ''];
  const rows = Math.floor(h / rh);
  for (let i = 0; i < rows; i++) {
    const yy = y + i * rh;
    const [l, r] = edge(yy + rh / 2);
    const off = (i % 2) * (bw / 2);
    let k = i % 2;
    for (let xx = l - off; xx < r; xx += bw, k++) {
      const a = Math.max(l + 0.4, xx + 0.6), b = Math.min(r - 0.4, xx + bw - 0.6);
      if (b - a < 2) continue;
      ds[k % 2] += rr(f1(a), f1(yy + 0.6), f1(b - a), f1(rh - 1.3), Math.min(1.6, (rh - 1.3) / 2));
    }
  }
  return (ds[0] ? flat(ds[0], c) : '') + (ds[1] ? flat(ds[1], tone(c, 0.3)) : '');
}

/** Flor de `n` pétalos (un solo contorno festoneado) con su centro. */
export function blossom(x, y, r, c, n = 5, center = '#FFD966', rot = 0) {
  const step = (Math.PI * 2) / n;
  const pt = (a, rad) => `${f1(x + Math.cos(a) * rad)} ${f1(y + Math.sin(a) * rad)}`;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + rot + (i - 0.5) * step, a1 = a0 + step;
    if (!i) d += `M${pt(a0, r * 0.42)}`;
    d += `C${pt(a0 + step * 0.05, r * 1.18)} ${pt(a1 - step * 0.05, r * 1.18)} ${pt(a1, r * 0.42)}`;
  }
  return part(`${d}Z`, c, { w: 1.2 }) + part(ellD(x, y, f1(r * 0.36), f1(r * 0.36)), center, { w: 1 });
}

/** Rosa: copa de pétalos, capullo del centro envuelto y el pétalo de adelante. */
export function rose(x, y, r, c) {
  const m = mat(c);
  const P = (dx, dy) => `${f1(x + dx * r)} ${f1(y + dy * r)}`;
  let s = part(`M${P(-1, -0.1)}C${P(-1, -0.9)} ${P(-0.3, -1.05)} ${P(0, -0.85)}C${P(0.35, -1.05)} ${P(1, -0.9)} ${P(1, -0.1)}C${P(1, 0.75)} ${P(0.4, 0.95)} ${P(0, 0.9)}C${P(-0.4, 0.95)} ${P(-1, 0.75)} ${P(-1, -0.1)}Z`, c, { w: 1.3 });
  s += part(ellD(x, f1(y - r * 0.24), f1(r * 0.56), f1(r * 0.42)), m.side, { w: 1 });
  s += flat(`M${P(-0.52, -0.16)}Q${P(-0.44, -0.66)} ${P(0.24, -0.62)}Q${P(-0.1, -0.4)} ${P(-0.52, -0.16)}Z`, tone(c, 0.35));
  s += flat(`M${P(-0.86, 0.06)}Q${P(0, 0.5)} ${P(0.86, 0.06)}Q${P(0.5, 0.78)} ${P(0, 0.8)}Q${P(-0.5, 0.78)} ${P(-0.86, 0.06)}Z`, m.top);
  return s;
}

/**
 * Destello de cuatro puntas (magia, brillos). Va con el rol de brillo:
 * ningún kit le pone contorno (en pixel, un detalle chico flotando solo
 * quedaría todo borde oscuro).
 */
export const sparkle = (x, y, r, c = '#FFD24D') => flat(`M${x} ${f1(y - r)}L${f1(x + r * 0.28)} ${f1(y - r * 0.28)}L${f1(x + r)} ${y}L${f1(x + r * 0.28)} ${f1(y + r * 0.28)}L${x} ${f1(y + r)}L${f1(x - r * 0.28)} ${f1(y + r * 0.28)}L${f1(x - r)} ${y}L${f1(x - r * 0.28)} ${f1(y - r * 0.28)}Z`, c, { 'data-r': 'shine' });

/** Pétalo/hoja carnosa en forma de cuchara, de (x,y) hacia `ang`. */
export function spoon(x, y, len, ang, wid, c, tip) {
  const a = (ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (t, w) => `${f1(x + ux * len * t + nx * wid * w)} ${f1(y + uy * len * t + ny * wid * w)}`;
  let s = part(`M${P(0, -0.45)}C${P(0.3, -1.1)} ${P(0.78, -1.05)} ${P(1, 0)}C${P(0.78, 1.05)} ${P(0.3, 1.1)} ${P(0, 0.45)}Z`, c, { w: 1.3 });
  if (tip) s += flat(`M${P(0.72, -0.72)}Q${P(0.95, -0.35)} ${P(1, 0)}Q${P(0.95, 0.35)} ${P(0.72, 0.72)}Q${P(0.8, 0)} ${P(0.72, -0.72)}Z`, tip);
  return s;
}

/** Manzana con su palito, hoja y brillo. */
export function apple(x, y, r, c = '#E8505E') {
  const P = (dx, dy) => `${f1(x + dx * r)} ${f1(y + dy * r)}`;
  let s = part(`M${P(0, -0.7)}C${P(-0.3, -1.05)} ${P(-1.05, -0.95)} ${P(-1, -0.1)}C${P(-0.95, 0.75)} ${P(-0.35, 1.05)} ${P(0, 0.85)}C${P(0.35, 1.05)} ${P(0.95, 0.75)} ${P(1, -0.1)}C${P(1.05, -0.95)} ${P(0.3, -1.05)} ${P(0, -0.7)}Z`, c, { w: 1.4 });
  s += roundShade(x, y + r * 0.05, r, r * 0.9, c, 0.3, 0.3);
  s += line(`M${P(0, -0.66)}Q${P(0.05, -1.05)} ${P(0.3, -1.3)}`, '#7A5236', 1.8);
  s += leaf(f1(x + r * 0.2), f1(y - r * 1.05), f1(r * 0.95), -24, f1(r * 0.34), '#7FC48A');
  s += gloss(f1(x - r * 0.45), f1(y - r * 0.35), f1(r * 0.22), f1(r * 0.13), -50, 0.85);
  return s;
}

/**
 * Frente de una canasta redonda de mimbre: entre la boca (elipse de arriba)
 * y la base (elipse de abajo), con hileras curvas y los palitos corridos.
 */
export function basketFront(cx, yT, rxT, ryT, yB, rxB, ryB, c, rows = 4) {
  const m = mat(c);
  const arc = (k) => { const y = yT + (yB - yT) * k, rx = rxT + (rxB - rxT) * k, ry = ryT + (ryB - ryT) * k; return { y, rx, ry }; };
  const yOn = (a, x) => a.y + a.ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / a.rx) ** 2));
  let s = face(`M${cx - rxT} ${yT}A${rxT} ${ryT} 0 0 0 ${cx + rxT} ${yT}L${cx + rxB} ${yB}A${rxB} ${ryB} 0 0 1 ${cx - rxB} ${yB}Z`, c, { w: 1.8 });
  let rl = '', st = '';
  for (let i = 1; i < rows; i++) { const a = arc(i / rows); rl += `M${f1(cx - a.rx)} ${f1(a.y)}A${f1(a.rx)} ${f1(a.ry)} 0 0 0 ${f1(cx + a.rx)} ${f1(a.y)}`; }
  for (let i = 0; i < rows; i++) {
    const a = arc(i / rows), b = arc((i + 1) / rows);
    for (let x = cx - rxT + 4 + (i % 2) * 4.5; x < cx + rxT - 3; x += 9) {
      if (Math.abs(x - cx) > Math.min(a.rx, b.rx) - 2.5) continue;
      st += `M${f1(x)} ${f1(yOn(a, x) + 1.2)}L${f1(x)} ${f1(yOn(b, x) - 1.2)}`;
    }
  }
  s += line(rl, m.deep, 1.3, { opacity: 0.75 }) + line(st, m.side, 1.3, { opacity: 0.6 });
  s += shade(`M${f1(cx + rxT * 0.45)} ${f1(yOn(arc(0), cx + rxT * 0.45))}L${cx + rxT} ${yT}L${cx + rxB} ${yB}A${rxB} ${ryB} 0 0 1 ${f1(cx + rxB * 0.45)} ${f1(yOn(arc(1), cx + rxB * 0.45))}Z`, m.deep, 0.2);
  return s;
}

/** Cuadrillé (vichy) dentro de un rectángulo: franjas que se cruzan. */
export function gingham(x, y, w, h, c, step = 4.4) {
  let s = flat(rr(x, y, w, h, 0), mix(c, '#FFFFFF', 0.62));
  let v = '', hz = '';
  for (let xx = x + step * 0.5; xx < x + w - 0.5; xx += step * 2) v += `M${f1(xx)} ${y}h${f1(Math.min(step, x + w - xx))}v${h}h${f1(-Math.min(step, x + w - xx))}Z`;
  for (let yy = y + step * 0.5; yy < y + h - 0.5; yy += step * 2) hz += `M${x} ${f1(yy)}h${w}v${f1(Math.min(step, y + h - yy))}h${-w}Z`;
  return s + shade(v, c, 0.45) + shade(hz, c, 0.45);
}

export const DECOR_VIBES = [
  // ── Aesthetic ──────────────────────────────────────────────────
  {
    id: 'vinilos', name: 'Caja de vinilos', price: 70, w: 96, h: 74, place: 'piso', vibes: ['aesthetic', 'rockera'],
    draw: (p) => {
      const W = p.wood, m = mat(W);
      let s = floorSh(48, 71, 44, 6);
      // borde de atrás y el fondo del cajón, en sombra
      s += face(rr(8, 26, 80, 3.4, 1), m.top, { w: 1.4 });
      s += face(rr(10, 29, 76, 10, 0), mix(m.deep, '#2A1C24', 0.35), { w: 1.2 });
      // fundas paradas, de atrás para adelante; de una asoma el disco
      const sleeve = (x, y, w, c, art = '') => face(rr(x, y, w, 40, 1.6), c, { w: 1.6 }) + line(`M${x + 2.4} ${y + 2.2}H${x + w - 2.4}`, tone(c, 1.2), 1.2, { opacity: 0.7 }) + art;
      s += sleeve(15, 6, 58, '#3A3346', dot(60, 14, 4.6, '#F28CA8') + dot(60, 14, 1.4, '#3A3346'));
      s += sleeve(23, 10.5, 58, '#F2C14E', flat('M23.8 17H80.2V20.4H23.8Z', '#E57B93'));
      s += part(ellD(50, 16, 13, 13), '#2A2632', { w: 1.6 }) + line('M40.4 16a9.6 9.6 0 0 1 19.2 0', '#4E4860', 1.2);
      s += part(ellD(50, 16, 4.4, 4.4), p.accent === '#FFFFFF' ? '#F28CA8' : p.accent, { w: 1.1 }) + dot(50, 16, 1.2, '#2A2632') + shine('M40.2 13.6Q41.8 8 47 6.2L47.4 7.8Q43 9.6 42 14Z', { opacity: 0.6 });
      s += sleeve(13, 15.5, 60, '#7FB894', flat('M22 24h10v10h-10ZM34 24h10v10h-10Z', tone('#7FB894', 0.6)));
      s += sleeve(19, 20, 60, '#E57B93', flat(heart(49, 28.6, 4.6), '#FFF4F7'));
      s += sleeve(11, 24.5, 64, '#7FA9DE', flat('M34 38a9 9 0 0 1 18 0Z', '#FFE07A') + line('M43 26.6v-2.4M35.6 29.6l-1.8 -1.6M50.4 29.6l1.8 -1.6', '#FFE07A', 1.6));
      // cantos de los costados
      s += face(rr(8, 26, 4.4, 13, 1), m.top, { w: 1.4 }) + face(rr(83.6, 26, 4.4, 13, 1), m.top, { w: 1.4 });
      // frente: canto, dos tablas con agarradera, postes y clavitos
      s += face(rr(8, 36.6, 80, 3.6, 1.2), m.top, { w: 1.5 });
      s += face(rr(8, 40, 80, 15, 1.5), W, { w: 1.8 }) + face(rr(8, 55, 80, 15, 1.5), tone(W, -0.12), { w: 1.8 });
      s += grain([[16, 34, 45.6, 0.7], [62, 80, 50, 0.7], [17, 47, 61, 0.7], [56, 79, 65.4, 0.7]], W, 0.5);
      s += face(rr(36, 43.2, 24, 7, 3.5), mix(m.deep, '#2A1C24', 0.45), { w: 1.4 });
      s += face(rr(8, 36.6, 7, 33.4, 1.5), tone(W, -0.3), { w: 1.6 }) + face(rr(81, 36.6, 7, 33.4, 1.5), tone(W, -0.3), { w: 1.6 });
      s += dots([[11.5, 44.6], [11.5, 64], [84.5, 44.6], [84.5, 64]], 1.2, m.deep);
      s += shade(rr(15, 64.6, 66, 5, 1.5), m.deep, 0.18);
      return s;
    },
  },
  {
    id: 'camaraFilm', name: 'Cámara de rollo', price: 55, w: 70, h: 54, place: 'sobre', vibes: ['aesthetic', 'y2k'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), K = '#3A3044';
      let s = surf(35, 51, 30);
      // joroba del visor
      s += face(rr(28.6, 5.4, 12.8, 3, 1), '#F4F6FA', { w: 1.3 });
      s += face('M26 18L28.6 8H41.4L44 18Z', CHROME, { w: 1.6 }) + line('M30.4 10.6L28.8 16.6', '#FFFFFF', 1.2, { opacity: 0.8 });
      // tapa, placa cromada y cuero
      s += face(rrTop(8, 12, 54, 7.4, 3), '#F0F2F6', { w: 1.6 });
      s += face(rr(8, 18, 54, 32, 4), CHROME, { w: 1.8 });
      s += face('M8 27H62V46Q62 50 58 50H12Q8 50 8 46Z', C, { w: 1.6 });
      s += shade('M52 27H62V46Q62 50 58 50H52Z', mc.deep, 0.22);
      s += line('M10.6 19.8H59.4', '#FFFFFF', 1.2, { opacity: 0.85 });
      // palanca, disparador, visor y plaquita
      s += tube('M13 15.4L21.4 12.4', 2.2, '#C3C9D4');
      s += face(rr(48, 9, 7, 5, 1.6), p.accent, { w: 1.3 });
      s += face(rr(12, 20.4, 8.6, 5, 1.2), '#3E4B6E', { w: 1.2 }) + flat('M13.2 21.4h2.6l-2.6 2.6Z', '#9FB4E0');
      s += face(rr(50, 21, 8, 4, 1), tone(C, 0.5), { w: 1 });
      // objetivo: un cilindro que sale hacia uno (se ve su canto arriba)
      s += part(ellD(35, 33.8, 11.8, 11.8), '#4A4458', { w: 1.8 });
      s += part(ellD(35, 35.4, 11.8, 11.8), '#5E586E', { w: 1.6 });
      s += line('M26.6 35.4a8.4 8.4 0 1 0 16.8 0a8.4 8.4 0 1 0 -16.8 0', '#8A84A0', 1.2);
      s += part(ellD(35, 35.4, 7, 7), '#2A2238', { w: 1.4 }) + flat(ellD(35, 35.4, 3.8, 3.8), '#4A3A78');
      s += shine('M30.4 31.8Q32 29.4 35 29L35.2 30.8Q33 31.2 32 33Z', { opacity: 0.9 }) + dot(38.4, 38.6, 1.1, '#FFFFFF', { opacity: 0.8 });
      // argollas de la correa
      s += face(rr(5.6, 21, 3, 5.4, 1), CHROME, { w: 1 }) + face(rr(61.4, 21, 3, 5.4, 1), CHROME, { w: 1 });
      return s;
    },
  },
  {
    id: 'lamparaHongo', name: 'Lámpara de hongo', price: 75, w: 66, h: 76, place: 'sobre', vibes: ['aesthetic', 'cottagecore', 'kawaii'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), S = '#F7F0E4', ms = mat(S), Wd = p.wood;
      let s = glow(33, 42, 31, 17, '#FFE9A8', 0.32) + surf(33, 73, 18);
      s += line('M47 70.6C54 71.6 58 68 63 70', '#6E6878', 1.6);
      // rodaja de tronco
      s += cylinder(33, 73, 16, 5, Wd, { w: 1.6 });
      s += line(`${ellD(33, 68.2, 10, 4.4)}${ellD(33, 68.2, 5, 2.2)}`, tone(Wd, -0.6), 1, { opacity: 0.55 });
      // pie, con la luz que cae de arriba
      s += part('M27 68.6C26 58 28 47 29.6 39H36.4C38 47 40 58 39 68.6Z', S, { w: 1.6 });
      s += shade('M34.6 39H36.4C38 47 40 58 39 68.6H35.2C36.2 58 35.8 47 34.6 39Z', ms.deep, 0.24);
      s += flat(ellD(33, 40.4, 5.4, 2), '#FFF3C4');
      // laminillas encendidas bajo el sombrero
      s += flat(ellD(33, 37.6, 23, 3.4), '#FFE7A8');
      // sombrero con lunares
      s += part('M5 35.6C5 13 61 13 61 35.6C52 39.6 14 39.6 5 35.6Z', C, { w: 1.8 });
      s += shade('M44 16.6C54 20 61 27 61 35.6C57 37.4 52 38.4 46 39C51 32 50 23 44 16.6Z', mc.deep, 0.26);
      s += dots([[18.5, 26, 3.8], [33, 19.6, 4.4], [47.5, 25, 3.4], [26, 32.4, 2.6], [41, 32.6, 2.8], [55.4, 31, 2.2], [11.6, 31.6, 2]], 2, '#FFF7EC');
      s += gloss(15, 22, 3.6, 1.8, -32, 0.75);
      return s;
    },
  },
  {
    id: 'tulipanes', name: 'Florero de tulipanes', price: 60, w: 60, h: 92, place: 'sobre', vibes: ['aesthetic', 'coquette', 'cottagecore'],
    draw: (p) => {
      const C = p.cloth, G = '#5FA66A', A = p.accent === '#FFFFFF' ? '#F7D6E0' : p.accent;
      let s = surf(30, 89.5, 17);
      // hojas largas y tallos
      s += part('M27 62C20 52 13 44 9 31C17 37 23 46 29.6 57Z', '#6CB577', { w: 1.4 });
      s += part('M33 62C40 54 46 46 51 35C44 40 38 47 30.6 57Z', G, { w: 1.4 });
      s += line('M27.6 66Q24 48 19.4 35M30 66Q31 44 31 27M32.4 66Q37 50 41.6 37', G, 2.2);
      // tulipanes: dos pétalos de atrás y el del medio adelante
      const tulip = (x, y, c, a) => `<g transform="rotate(${a} ${x} ${y + 6})">${part(`M${x - 6.8} ${y + 1}C${x - 7.8} ${y - 6} ${x - 5.2} ${y - 10.4} ${x - 2} ${y - 11.4}L${x} ${y - 6}L${x + 2} ${y - 11.4}C${x + 5.2} ${y - 10.4} ${x + 7.8} ${y - 6} ${x + 6.8} ${y + 1}C${x + 5} ${y + 6.4} ${x - 5} ${y + 6.4} ${x - 6.8} ${y + 1}Z`, c, { w: 1.5 })}${part(`M${x - 3.8} ${y + 3.8}C${x - 4.6} ${y - 3} ${x - 2} ${y - 9.4} ${x} ${y - 10.4}C${x + 2} ${y - 9.4} ${x + 4.6} ${y - 3} ${x + 3.8} ${y + 3.8}C${x + 2} ${y + 5.4} ${x - 2} ${y + 5.4} ${x - 3.8} ${y + 3.8}Z`, tone(c, 0.38), { w: 1.2 })}</g>`;
      s += tulip(19, 33, tone(C, -0.2), -14) + tulip(42, 35, tone(C, -0.2), 14) + tulip(31, 25, C, 0);
      // florero de vidrio con agua (los tallos se ven adentro)
      const V = 'M18 58V86A12 4.6 0 0 0 42 86V58Z';
      s += shade(V, '#E8F4FF', 0.45);
      s += flat('M18.7 68V86A11.3 4.3 0 0 0 41.3 86V68Z', '#CDEBF7', { opacity: 0.85 });
      s += line('M27.4 68.6L26.2 88M30 68.6L30.6 89.4M32.6 68.6L34.4 88', '#7DB58A', 1.6, { opacity: 0.85 });
      s += line('M19.4 68.2Q30 70.6 40.6 68.2', '#FFFFFF', 1.2, { opacity: 0.8 });
      s += line(V, mix('#9CC6DA', INK, 0.3), 1.8) + line(ellD(30, 58, 12, 3.4), mix('#9CC6DA', INK, 0.3), 1.5);
      s += shine('M20.6 61.6V81.6h2.2V61.6Z', { opacity: 0.7 });
      // cinta con moño
      s += flat('M18.5 74H41.5V77.4H18.5Z', A) + bow(30, 75.6, 0.52, A);
      return s;
    },
  },
  {
    id: 'perfumes', name: 'Perfumes y skincare', price: 65, w: 84, h: 66, place: 'sobre', vibes: ['coquette', 'aesthetic'],
    draw: (p) => {
      const G = '#E9C46A', mg = mat(G), C = p.cloth, A = p.accent;
      let s = surf(42, 64, 39);
      // bandeja de espejo con borde dorado
      s += face('M4 57A38 7.5 0 0 0 80 57V60A38 7.5 0 0 1 4 60Z', mg.side, { w: 1.5 });
      s += face(ellD(42, 57, 38, 7.5), G, { w: 1.6 });
      s += flat(ellD(42, 57.4, 35, 6), '#E2EAF2') + line('M16 56Q26 52.4 38 52.2', '#FFFFFF', 1.4, { opacity: 0.8 });
      // gotero de vidrio ámbar
      s += cylinder(54, 55, 5.4, 15, '#F0B27A', { w: 1.4 }) + shine(rr(50.4, 42, 1.6, 9, 0.8), { opacity: 0.7 });
      s += face(rr(51, 35.4, 6, 4.6, 1), '#3A3044', { w: 1.2 }) + part(ellD(54, 33, 2.8, 3.6), '#3A3044', { w: 1.1 });
      // frasco de perfume con perilla y borla
      s += part('M17 34H41Q44 34 44 37V55Q44 58 41 58H17Q14 58 14 55V37Q14 34 17 34Z', mix(C, '#FFFFFF', 0.6), { w: 1.8 });
      s += flat('M15.4 42H42.6V55Q42.6 56.6 41 56.6H17Q15.4 56.6 15.4 55Z', C, { opacity: 0.85 });
      s += line('M17.4 37.4L20 40M40.6 37.4L38 40', '#FFFFFF', 1.2, { opacity: 0.8 });
      s += face(rr(22, 45.4, 14, 7, 1.2), '#FFF8EE', { w: 1 }) + flat(heart(29, 48.8, 2), tone(C, -0.6));
      s += shine('M16.6 40V53H18.4V40Z', { opacity: 0.75 });
      s += face(rr(24, 29.6, 10, 5, 1.2), G, { w: 1.4 }) + face(rr(25.6, 25, 6.8, 5, 1.6), mg.top, { w: 1.3 });
      s += line('M25.6 27.2Q18 26 12.6 31.4', G, 1.6);
      s += part(ellD(10.4, 36, 4.2, 5.2), A === '#FFFFFF' ? '#FFD3DF' : A, { w: 1.4 }) + gloss(9, 34, 1.2, 0.7, -40, 0.8);
      s += line('M10.4 41.2V46.6', G, 1.4) + part('M8.4 46.4h4l1 6.4h-6Z', G, { w: 1.1 });
      // tarrito de crema
      s += cylinder(68, 61, 9.4, 7.4, '#FFFFFF', { w: 1.6 });
      s += cylinder(68, 54.4, 9.8, 4, C, { w: 1.5 }) + gloss(63, 49.6, 1.8, 0.9, -20, 0.7);
      s += flat(rr(63, 56.8, 10, 2.4, 1), tone(C, 0.5));
      return s;
    },
  },
  {
    id: 'polaroids', name: 'Fotos con lucecitas', price: 70, w: 130, h: 70, place: 'sobre', vibes: ['aesthetic', 'coquette', 'kawaii'],
    draw: () => {
      const yAt = (t) => 9 + 72 * t * (1 - t), xAt = (t) => 4 + 122 * t;
      let s = '';
      // dos clavitos sostienen el cordel
      s += Ell(5, 9.6, 2.6, 1.6, { fill: '#2A1C24', opacity: 0.2, 'data-r': 'tone' }) + Ell(127, 9.6, 2.6, 1.6, { fill: '#2A1C24', opacity: 0.2, 'data-r': 'tone' });
      s += part(ellD(4, 8, 2.2, 2.2), '#B8BFCC', { w: 1 }) + part(ellD(126, 8, 2.2, 2.2), '#B8BFCC', { w: 1 });
      s += line('M4 9Q65 45 126 9', '#B8925A', 1.4);
      // fotos colgadas con broches de madera
      const art = {
        sol: (x, y) => flat(`M${x - 8.5} ${y + 17}Q${x} ${y + 12} ${x + 8.5} ${y + 16}V${y + 21.5}H${x - 8.5}Z`, '#9CD49A') + dot(x - 2.6, y + 10.6, 3.2, '#FFE07A'),
        corazon: (x, y) => part(heart(x, y + 13.6, 5), '#FF7FA1', { w: 1.1 }),
        flor: (x, y) => line(`M${x} ${y + 21}V${y + 15}`, '#6CB577', 1.6) + blossom(x, y + 12, 4.6, '#FFFFFF', 5, '#FFD966'),
        mochi: (x, y) => part(`M${x - 6.6} ${y + 21.5}C${x - 6.6} ${y + 9} ${x + 6.6} ${y + 9} ${x + 6.6} ${y + 21.5}Z`, '#FFF8F2', { w: 1.1 }) + dots([[x - 2.4, y + 15.6], [x + 2.4, y + 15.6]], 1.1, INK) + blush(x - 4, y + 17.6, 1.4) + blush(x + 4, y + 17.6, 1.4),
      };
      [[0.14, -5, '#BFE3F5', 'sol'], [0.38, 4, '#FFD3DF', 'corazon'], [0.62, -3, '#D5F0CC', 'flor'], [0.86, 5, '#FFE8B0', 'mochi']].forEach(([t, a, bg, k]) => {
        const x = f1(xAt(t)), y = f1(yAt(t));
        s += `<g transform="rotate(${a} ${x} ${y})">${shade(rr(x - 9.4, y + 5, 22, 26, 1), '#2A1C24', 0.14)}${face(rr(x - 11, y + 3, 22, 26, 1), '#FFFFFF', { w: 1.4 })}${flat(rr(x - 8.5, y + 5.5, 17, 16, 0.5), bg)}${art[k](x, y)}${face(rr(x - 1.8, y - 3, 3.6, 8.6, 1), '#D9B48A', { w: 1 })}${line(`M${x - 1.8} ${y + 1}h3.6`, '#9A7A58', 1)}</g>`;
      });
      // lucecitas entre las fotos
      [0.035, 0.258, 0.5, 0.742, 0.965].forEach((t) => {
        const x = f1(xAt(t)), y = f1(yAt(t));
        s += glow(x, y + 5, 5.4, 5.4, '#FFE9A8', 0.45) + face(rr(x - 1.4, y - 0.4, 2.8, 2.8, 0.6), '#4A4458', { w: 0.9 }) + part(ellD(x, y + 4.8, 2.4, 3), '#FFF3B0', { w: 1 });
      });
      return s;
    },
  },
  // ── Otaku / gamer ──────────────────────────────────────────────
  {
    id: 'manga', name: 'Pila de manga', price: 50, w: 70, h: 64, place: 'sobre', vibes: ['otaku', 'academia'],
    draw: () => {
      let s = surf(35, 61, 31);
      // la pila: lomos blancos con su franja de color y el número del tomo
      const vol = (x, y, w, t, c) => face(rr(x, y - t, w, t, 1.2), '#FFFFFF', { w: 1.5 }) + flat(rr(x + 1.2, y - t + 1.2, 10, t - 2.4, 0.6), c) + flat(rr(x + w - 8.6, y - t + 1.6, 5.6, t - 3.2, 0.6), '#3A3346') + line(`M${x + 14} ${y - t / 2}H${x + w - 12}`, '#C9C2D0', 1.4);
      s += face(rr(9, 19.4, 42, 7, 1), '#B8E6A8', { w: 1.4 }) + flat(rr(12, 21, 14, 3.6, 0.6), '#FFFFFF');
      s += vol(5, 61, 46, 9, '#FF7FA8') + vol(9, 52, 42, 8.4, '#7FC8F8') + vol(4, 43.6, 46, 9, '#FFD24D') + vol(9, 34.6, 42, 8.2, '#8ED07A');
      // un tomo parado, apoyado en la pila, con la tapa a la vista
      s += `<g transform="rotate(-7 52 60)">`;
      s += face(rr(41, 14, 23, 46, 1.4), '#FFFFFF', { w: 1.6 }) + flat(rr(43, 16, 19, 42, 0.8), '#FFC9DA');
      s += flat(rr(43, 16.4, 19, 5.4, 0.6), '#E8505E') + line('M45.6 19.1h3M50.6 19.1h3M55.6 19.1h3', '#FFFFFF', 1.4);
      // la chica de la tapa: pelo, cara, ojos grandes y su cuello marinero
      s += part('M44.4 41C43 31 46 25 52.5 25C59 25 62 31 60.6 41Z', '#5B4B8A', { w: 1.2 });
      s += part('M43 58C43 50 46.4 47 52.5 47C58.6 47 62 50 62 58Z', '#FFFFFF', { w: 1.2 }) + part('M46 47.6L52.5 54L59 47.6L56.4 46.6L52.5 50.4L48.6 46.6Z', '#3E4B8A', { w: 1 }) + part('M52.5 53.4l-2.6 2l2.6 1.4l2.6 -1.4Z', '#E8505E', { w: 0.9 });
      s += part(ellD(52.5, 38, 6.8, 7.2), '#FFE3D3', { w: 1.2 });
      s += part('M45.6 37C45 30.4 49 28 52.5 28C56 28 60 30.4 59.4 37C57.6 34 55.4 33.4 54 34.6C53 32.6 50.6 32.6 49.6 34.8C48 33.6 46.6 34.6 45.6 37Z', '#5B4B8A', { w: 1.1 });
      s += eye(49.6, 39, 1.8) + eye(55.4, 39, 1.8) + blush(48, 42, 1.6) + blush(57, 42, 1.6);
      s += `</g>`;
      return s;
    },
  },
  {
    id: 'capsulas', name: 'Máquina de cápsulas', price: 140, w: 74, h: 128, place: 'piso', vibes: ['otaku', 'kawaii'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), A = p.accent;
      let s = floorSh(37, 125, 32, 5);
      s += box(10, 124, 54, 52, 24, C, { r: 4 });
      s += shade(rr(54, 73, 9, 50, 3), mc.deep, 0.2);
      // cúpula de vidrio con cápsulas de dos colores
      const gx = 37, gy = 42, gr = 25;
      s += shade(ellD(gx, gy, gr, gr), '#E8F4FF', 0.45);
      const cap = (x, y, r, c) => part(ellD(x, y, r, r), '#FFFFFF', { w: 1.3 }) + flat(`M${f1(x - r + 0.6)} ${y}A${r - 0.6} ${r - 0.6} 0 0 1 ${f1(x + r - 0.6)} ${y}Z`, c) + line(`M${f1(x - r + 0.4)} ${y}H${f1(x + r - 0.4)}`, tone(c, -0.8), 1.1) + dot(x - r * 0.4, y - r * 0.45, r * 0.2, '#FFFFFF', { opacity: 0.9 });
      [[26, 57, 5.8, '#FF7FA8'], [38, 58, 5.8, '#FFE07A'], [49.6, 56.6, 5.8, '#7FC8F8'], [20.6, 47, 5.6, '#8ED07A'], [32, 47.6, 5.6, '#C9A6FF'], [43.6, 47, 5.6, '#FF9F43'], [54, 46, 5.4, '#FF7FA8'], [27, 37.6, 5.4, '#7FC8F8'], [38.6, 37, 5.4, '#FFE07A'], [49, 36.4, 5.2, '#8ED07A']]
        .forEach(([x, y, r, c]) => { s += cap(x, y, r, c); });
      s += line(ellD(gx, gy, gr, gr), mix('#9CC6DA', INK, 0.3), 2);
      s += shine('M16 34C17 25 23 19 30 18C24 22 20 27 19 35Z', { opacity: 0.75 }) + dot(52, 26, 2, '#FFFFFF', { opacity: 0.7 });
      // aro de la cúpula y tapa con perilla
      s += face('M17 62.6A20 5 0 0 0 57 62.6V70A20 5 0 0 1 17 70Z', mc.side, { w: 1.6 }) + line('M18.4 64.4Q37 70 55.6 64.4', mc.top, 1.2, { opacity: 0.8 });
      s += cylinder(37, 21, 9, 5.4, A, { w: 1.5 }) + part(ellD(37, 13.4, 3, 2.6), A, { w: 1.2 });
      // panel: monedero, perilla y salida con una cápsula esperando
      s += face(rr(26, 77, 22, 9, 2), CHROME, { w: 1.4 }) + flat(rr(32, 80.4, 10, 2.2, 1), '#3A3044');
      s += part(ellD(37, 97, 9.6, 9.6), CHROME, { w: 1.8 }) + face(rr(28.4, 94.6, 17.2, 4.8, 2.4), '#B8BFCC', { w: 1.3 }) + gloss(32.4, 91.4, 2.2, 1.2, -35, 0.85);
      s += face(rr(27, 107, 20, 12, 5), '#3A3044', { w: 1.6 }) + cap(37, 115, 4.6, '#FF7FA8') + face(rr(27, 107, 20, 3.6, 1.8), tone(C, -0.6), { w: 1.2 });
      s += part(star(55, 82, 3.6), A === '#FFFFFF' ? '#FFE07A' : A, { w: 1.1 });
      return s;
    },
  },
  {
    id: 'ramen', name: 'Ramen instantáneo', price: 35, w: 56, h: 60, place: 'sobre', vibes: ['otaku', 'chef'],
    draw: () => {
      const R = '#E8505E';
      let s = surf(28, 57.6, 21);
      // la tapa despegada, parada atrás
      s += part('M12.6 21C9 9.6 22 2.4 37.6 5C43.6 6 46 9 45 12.4C40 12.4 34.4 15 30.4 21Z', '#F4F0EA', { w: 1.5 });
      s += flat('M17 11.6C22 7.6 30 6.4 36.4 7.8L35.6 10.8C29.4 9.8 23.4 10.6 19 13.4Z', R);
      // el vaso con su banda
      s += part('M10 22L15 54A13 4 0 0 0 41 54L46 22Z', '#FFFFFF', { w: 1.8 });
      s += flat('M11.6 32.4H44.4L43.2 41H12.8Z', R) + flat(star(28, 36.8, 3.6), '#FFE07A') + dots([[17.6, 36.8], [38.4, 36.8]], 1.2, '#FFE07A');
      s += shade('M38 22.6H46L41 54A13 4 0 0 1 35 57.6Z', '#B8AFC4', 0.3);
      // la boca: caldo, fideos y lo de arriba
      s += face(ellD(28, 22, 18, 6.4), '#F4F0EA', { w: 1.6 });
      s += flat(ellD(28, 22.6, 15.6, 4.8), '#E8A24E');
      s += line('M14.6 22.6q2.4 -2.4 4.8 0t4.8 0t4.8 0t4.8 0t4.8 0', '#FFE7A0', 2) + line('M17 25.2q2.4 -2 4.8 0t4.8 0t4.8 0t4.8 0', '#FFE7A0', 1.8);
      s += face(rr(37.6, 12.6, 5.6, 9, 0.8), '#2E4A3A', { w: 1.2 });
      s += part(ellD(20.6, 20.6, 4.4, 3.2), '#FFFFFF', { w: 1.1 }) + dot(20.6, 20.8, 1.9, '#FFC23D');
      s += part(ellD(33.4, 20.4, 4, 3), '#FFFFFF', { w: 1.1 }) + line('M32.2 20.6a1.3 1 0 1 1 1.6 1', '#F28CA8', 1.1);
      s += dots([[27, 19.4], [28.6, 24.4], [39.4, 23.4], [16.4, 23.8]], 1.1, '#7FC48A');
      // palillos apoyados en el borde
      s += tube('M5.6 29.6L44.6 10.6', 2.4, '#D9B48A') + tube('M8.6 32.6L48 15.6', 2.4, '#C9A06A');
      return s;
    },
  },
  {
    id: 'figura', name: 'Figura de chica mágica', price: 110, w: 54, h: 92, place: 'sobre', vibes: ['otaku', 'kawaii'],
    draw: (p) => {
      const C = p.cloth, H = p.accent === '#FFFFFF' ? '#F4E6FF' : p.accent, SK = '#FFE3D3', mh = mat(H);
      let s = surf(27, 89.5, 20);
      // base de acrílico con plaquita
      s += cylinder(27, 89, 18, 5, '#E3F1FA', { w: 1.6 }) + face(rr(20, 85.6, 14, 3, 0.8), tone(C, 0.4), { w: 1 });
      s += shine('M12 84.6Q14 81.6 19 80.6L19.4 82Q15.6 82.8 13.6 85.2Z', { opacity: 0.7 });
      // piernas y botitas
      s += face(rr(22.2, 71, 3.6, 11, 1.4), '#FFFFFF', { w: 1.2 }) + face(rr(28.2, 71, 3.6, 11, 1.4), '#FFFFFF', { w: 1.2 });
      s += part(ellD(23.6, 82.4, 3.6, 2.4), tone(C, -0.4), { w: 1.1 }) + part(ellD(30.4, 82.4, 3.6, 2.4), tone(C, -0.4), { w: 1.1 });
      // falda con volado y torso
      let fr = 'M11.4 73.6';
      for (let x = 11.4; x < 42.6; x += 5.2) fr += `Q${f1(x + 2.6)} 79.4 ${f1(x + 5.2)} 73.6`;
      s += part(`${fr}L41.6 71.6H12.4Z`, '#FFFFFF', { w: 1.2 });
      s += part('M19 58C16.4 64 13.6 68.6 12.4 72.6C20 75.6 34 75.6 41.6 72.6C40.4 68.6 37.6 64 35 58Z', C, { w: 1.6 });
      s += shade('M30 59H35C37.6 64 40.4 68.6 41.6 72.6C38.6 73.8 35 74.4 31.4 74.6C32.4 69 32 63 30 59Z', mat(C).deep, 0.24);
      s += part('M21 51.6H33L35 59.6H19Z', tone(C, 0.45), { w: 1.4 });
      // brazos: uno levanta la varita
      s += tube('M20.6 53.4L15.4 62', 3, SK) + tube('M33.4 53.4L41.4 45.4', 3, SK);
      s += tube('M40.6 48L45.4 30.6', 1.8, '#FFF4FA') + part(star(45.8, 27.4, 5.2, 0.5), '#FFD966', { w: 1.2 });
      s += part(star(38, 22, 1.8, 0.4), '#FFFFFF', { w: 0.8 }) + part(star(50.6, 36, 1.6, 0.4), '#FFFFFF', { w: 0.8 });
      s += bow(27, 53.6, 0.36, H, { tails: false });
      // cabeza: coletas, pelo, cara y flequillo
      s += part('M14.6 35C8 39 7 50 11 56.6C12.4 50 13.6 44 17.6 39.6Z', H, { w: 1.4 }) + part('M39.4 35C46 39 47 50 43 56.6C41.6 50 40.4 44 36.4 39.6Z', H, { w: 1.4 });
      s += part(ellD(27, 37, 13, 12.6), H, { w: 1.6 });
      s += part(ellD(27, 40.4, 10, 9.4), SK, { w: 1.4 });
      s += part('M15.6 38.4C15 29 21 25 27 25C33 25 39 29 38.4 38.4C36 34.4 33 33.4 31 35.4C29.6 32.4 25 31.4 23 35C21 33 18 34.4 15.6 38.4Z', H, { w: 1.3 });
      s += line('M19 29.6Q22 27.4 25 27.4', mh.hi, 1.3, { opacity: 0.9 });
      s += dots([[15.4, 37], [38.6, 37]], 1.9, C);
      s += eye(23.2, 42.4, 1.9) + eye(30.8, 42.4, 1.9) + blush(19.8, 45.6, 2.2) + blush(34.2, 45.6, 2.2) + smile(27, 46.2, 2.4);
      s += part(star(27, 25.6, 3.2, 0.5), '#FFD966', { w: 1.1 });
      return s;
    },
  },
  {
    id: 'huevito', name: 'Mascota virtual', price: 45, w: 40, h: 50, place: 'sobre', vibes: ['y2k', 'kawaii', 'gamer'],
    draw: (p) => {
      const C = p.cloth, A = p.accent;
      let s = surf(20, 47.4, 15);
      // argolla del llavero
      s += Cir(20, 3.6, 2.6, { fill: 'none', stroke: '#9AA2B6', 'stroke-width': 1.6, 'data-r': 'line' });
      // el huevo, con lunarcitos
      s += part('M20 6C32 6 36.5 19 36.5 28.5C36.5 40 30 46 20 46C10 46 3.5 40 3.5 28.5C3.5 19 8 6 20 6Z', C, { w: 1.8 });
      s += roundShade(20, 27, 16.5, 19.5, C, 0.22, 0.28);
      s += dots([[8.6, 18], [31.4, 17.6], [6.4, 32.6], [33.6, 33], [13.6, 10.4], [26.4, 10.2]], 1.3, tone(C, 0.75));
      // bisel y pantalla con su bichito
      s += face(rr(9.4, 14.4, 21.2, 18.2, 4.6), tone(C, 0.6), { w: 1.4 });
      s += face(rr(12, 17, 16, 13, 2), '#C9E8C0', { w: 1.2 });
      s += flat('M17 20h6v1h1v5h-1v1h-6v-1h-1v-5h1Z', '#3A5A3A') + flat('M18 22h1.4v1.4h-1.4ZM20.6 22h1.4v1.4h-1.4Z', '#C9E8C0');
      s += flat('M13.6 28h2v1h-2ZM24.4 28h2v1h-2Z', '#7FA47A');
      s += shine('M13 18.2h4.6L13 22.6Z', { opacity: 0.5 });
      // botones
      s += ball(13, 37.6, 2.5, A, 1.1) + ball(20, 39.6, 2.5, A, 1.1) + ball(27, 37.6, 2.5, A, 1.1);
      s += gloss(9.6, 13, 2.6, 1.3, -45, 0.8);
      return s;
    },
  },
  // ── Kawaii ─────────────────────────────────────────────────────
  {
    id: 'peluches', name: 'Montaña de peluches', price: 120, w: 118, h: 90, place: 'piso', vibes: ['kawaii'],
    draw: () => {
      let s = floorSh(59, 87.4, 54, 6);
      // conejita (atrás, derecha)
      const BU = '#F7D9F0', mb = mat(BU);
      s += part('M74 30C70 14 72 4 77 4C81 5 80 18 79.4 29Z', BU, { w: 1.5 }) + flat('M75.4 27C73.4 16 74.6 8.6 76.8 8.4C78.4 9.6 78 18 77.6 27Z', '#FFB6CC');
      s += part('M85 29.6C86 18 90 10 96 11C100.4 12 99.4 17.4 95 19.4C92 21 90.4 25 90.4 30Z', BU, { w: 1.5 }) + flat('M87.6 26C88.6 19 91.4 14 95.4 13.6C96.6 14.6 95.6 16.6 93.6 17.6C91.4 19 90 22.4 89.8 27Z', '#FFB6CC');
      s += part(ellD(82, 66, 19, 17), BU, { w: 1.6 }) + roundShade(82, 66, 19, 17, BU, 0.24, 0.32);
      s += part(ellD(82, 42, 16, 14), BU, { w: 1.6 }) + roundShade(82, 42, 16, 14, BU, 0.2, 0.28);
      s += eye(76.4, 42.4, 2) + eye(87.6, 42.4, 2) + part(ellD(82, 46, 1.6, 1.2), '#F28CA8', { w: 0.9 }) + catMouth(82, 47.6, 3.4) + blush(72.6, 47, 2.6) + blush(91.4, 47, 2.6);
      // osito (atrás, izquierda)
      const BR = '#C99A72', LB = '#F2D9BC';
      s += part(ellD(23.6, 23, 6.6, 6.6), BR, { w: 1.5 }) + part(ellD(48.4, 23, 6.6, 6.6), BR, { w: 1.5 }) + flat(ellD(23.6, 23.6, 3.4, 3.4) + ellD(48.4, 23.6, 3.4, 3.4), LB);
      s += part(ellD(36, 66, 21, 18), BR, { w: 1.6 }) + roundShade(36, 66, 21, 18, BR, 0.24, 0.3);
      s += part(ellD(36, 38, 17, 15), BR, { w: 1.6 }) + roundShade(36, 38, 17, 15, BR, 0.2, 0.26);
      s += part(ellD(36, 44.4, 7.4, 5.4), LB, { w: 1.2 }) + part('M33.4 41.8C33.4 40.4 38.6 40.4 38.6 41.8C38.6 43.2 37 44.2 36 44.2C35 44.2 33.4 43.2 33.4 41.8Z', INK, { w: 0.9 }) + line('M36 44.2v1.4M33.6 46.4q2.4 1.8 4.8 0', INK, 1.2);
      s += eye(29.4, 37, 2.1) + eye(42.6, 37, 2.1) + blush(25.6, 43, 2.8) + blush(46.4, 43, 2.8);
      s += bow(36, 54.6, 0.5, '#7FA9DE');
      // gatito (adelante, al medio)
      const CA = '#FFF4E6', OR = '#F7B26A';
      s += part(ellD(58, 78, 15, 9.6), CA, { w: 1.5 }) + part(ellD(51.6, 85, 4.6, 3), CA, { w: 1.2 }) + part(ellD(64.4, 85, 4.6, 3), CA, { w: 1.2 });
      s += part('M45.6 58L46.4 46.6L54 52.6Z', CA, { w: 1.4 }) + part('M70.4 58L69.6 46.6L62 52.6Z', CA, { w: 1.4 }) + flat('M47.6 54.6L48 49.6L51.6 52.6ZM68.4 54.6L68 49.6L64.4 52.6Z', '#FFB6CC');
      s += part(ellD(58, 61.6, 14, 12), CA, { w: 1.6 }) + roundShade(58, 61.6, 14, 12, '#E8D6C4', 0.22, 0.3);
      s += flat('M47.4 56C49.6 51.4 55 50 57.4 52C55.6 55.4 52 57.6 48.6 59.6Z', OR);
      s += eye(52.6, 61.6, 1.9) + eye(63.4, 61.6, 1.9) + catMouth(58, 64.8, 4) + blush(49.6, 65, 2.2) + blush(66.4, 65, 2.2);
      s += line('M44 63.4h4.4M44.4 66.6l4 -1M72 63.4h-4.4M71.6 66.6l-4 -1', '#B8A49A', 1, { opacity: 0.8 });
      // pollito (adelante, derecha)
      const CH = '#FFE58A';
      s += part(ellD(93, 77, 12, 11), CH, { w: 1.6 }) + roundShade(93, 77, 12, 11, CH, 0.24, 0.3);
      s += line('M92 66.4q-1 -4 2 -5', '#E8B84A', 1.8);
      s += part('M98 77.4C103 76 104.6 80 102 82.4C100 82 98.4 80 98 77.4Z', tone(CH, -0.3), { w: 1.1 });
      s += eye(89, 75, 1.8) + eye(96, 75, 1.8) + part('M90.6 78.4L94.4 78.4L92.5 80.6Z', '#FF9F43', { w: 0.9 }) + blush(86.6, 79, 1.8) + blush(98.4, 79, 1.8);
      return s;
    },
  },
  {
    id: 'lamparaConejo', name: 'Lámpara de conejito', price: 70, w: 54, h: 74, place: 'sobre', vibes: ['kawaii'],
    draw: (p) => {
      const W = '#FFF7FB';
      let s = glow(27, 44, 27, 27, '#FFE9F2', 0.5) + surf(27, 71.4, 19);
      // base con su botón
      s += cylinder(27, 71, 17, 6, p.cloth, { w: 1.6 }) + face(rr(37.6, 66.4, 4, 2.4, 1), tone(p.cloth, -0.7), { w: 1 });
      // orejas
      s += part('M15 31C11 12 18 4 21.6 8C24 12 23 22 22 32Z', W, { w: 1.6 }) + flat('M17 27C15 15.6 18 10.6 20 12.4C21.4 15.4 21 22 20.4 28Z', '#FFC4D6');
      s += part('M39 31C43 12 36 4 32.4 8C30 12 31 22 32 32Z', W, { w: 1.6 }) + flat('M37 27C39 15.6 36 10.6 34 12.4C32.6 15.4 33 22 33.6 28Z', '#FFC4D6');
      // cuerpo de silicona encendido
      s += part('M8 56C8 36 16 27 27 27C38 27 46 36 46 56C46 63.4 40 66.6 27 66.6C14 66.6 8 63.4 8 56Z', W, { w: 1.8 });
      s += flat(ellD(27, 50, 13.4, 11.4), '#FFF1C8', { opacity: 0.9, 'data-skip': 'neon' }) + shine(ellD(27, 50, 12, 10), { opacity: 0.5, 'data-only': 'neon' });
      // dormidito
      s += line('M17.6 46.4q2.8 2.6 5.6 0M30.8 46.4q2.8 2.6 5.6 0', INK, 1.5) + blush(16.4, 51.6, 3) + blush(37.6, 51.6, 3) + catMouth(27, 51, 3.6);
      s += part(ellD(20.4, 63, 4, 2.6), W, { w: 1.3 }) + part(ellD(33.6, 63, 4, 2.6), W, { w: 1.3 });
      return s;
    },
  },
  {
    id: 'cojinGato', name: 'Cojín de gatito', price: 55, w: 76, h: 56, place: 'piso', vibes: ['kawaii', 'otaku'],
    draw: (p) => {
      const C = p.cloth, m = mat(C);
      let s = floorSh(38, 53, 33, 5);
      s += part('M8 30C7 22 9 12 13 6C17 8 21 13 24 17C33 15 43 15 52 17C55 13 59 8 63 6C67 12 69 22 68 30C70 42 62 51 38 51C14 51 6 42 8 30Z', C, { w: 1.8 });
      s += flat('M13.6 12C15.4 13 18 15 19.6 17.6L14 21C13.4 18 13.2 15 13.6 12ZM62.4 12C60.6 13 58 15 56.4 17.6L62 21C62.6 18 62.8 15 62.4 12Z', '#FFB6CC');
      s += shade('M47 49C58 47 66 40 67.6 31C69 42 62 50.6 38 51C41 50.6 44 50 47 49Z', m.deep, 0.3);
      s += line('M34 19.6v4M38 18.6v5M42 19.6v4', m.side, 1.6, { opacity: 0.7 });
      s += eye(28, 32, 2.6) + eye(48, 32, 2.6) + catMouth(38, 37, 6) + blush(22, 37.4, 3.6) + blush(54, 37.4, 3.6);
      s += line('M11.6 33h8M12 37.8l8 -1.6M64.4 33h-8M64 37.8l-8 -1.6', m.deep, 1.2, { opacity: 0.6 });
      s += part(ellD(28, 48.6, 6, 3.6), tone(C, 0.35), { w: 1.3 }) + part(ellD(48, 48.6, 6, 3.6), tone(C, 0.35), { w: 1.3 });
      s += line('M26 46.4v2.4M30 46.4v2.4M46 46.4v2.4M50 46.4v2.4', m.side, 1, { opacity: 0.7 });
      s += gloss(19, 19, 3.6, 1.8, -40, 0.7);
      return s;
    },
  },
  // ── Coquette ───────────────────────────────────────────────────
  {
    id: 'joyero', name: 'Joyero con perlas', price: 85, w: 70, h: 56, place: 'sobre', vibes: ['coquette', 'princesa'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), G = GOLD, mg = mat(G), V = mix(tone(C, -1.3), '#5A1E3A', 0.45);
      let s = surf(35, 53.4, 31);
      // tapa abierta, parada atrás, con su espejo
      s += face(rrTop(11, 2.6, 48, 4.4, 2), mc.top, { w: 1.4 });
      s += face(rr(10, 6, 50, 19, 3), C, { w: 1.8 });
      s += face(rr(14, 8.8, 42, 13.4, 6.6), G, { w: 1.3 });
      s += face(rr(16.2, 10.6, 37.6, 9.8, 4.9), '#DDEBF5', { w: 1.1 });
      s += shine('M21 19.6L28 11.4H31.6L24.6 19.6Z', { opacity: 0.6 }) + shine('M33.6 19.6L37.6 14.6H39.6L35.6 19.6Z', { opacity: 0.5 });
      // la caja abierta: canto de arriba y el terciopelo de adentro
      s += face(rr(10, 23, 50, 12, 2), mc.top, { w: 1.6 });
      s += face(rr(13, 25, 44, 8.4, 1.5), V, { w: 1.2 });
      s += line('M35 25.6V32.6', tone(V, -0.8), 1.4);
      // un anillo en su ranura
      s += line(ellD(24, 30.2, 3.4, 2.4), G, 1.8) + part(ellD(24, 27.2, 2.2, 1.9), '#FF8FB8', { w: 1 }) + dot(23.4, 26.6, 0.8, '#FFFFFF');
      // frente con filo dorado y cerradura
      s += face(rr(10, 34, 50, 18, 3), C, { w: 1.8 });
      s += shade(rr(11, 46, 48, 5.4, 2.6), mc.deep, 0.22);
      s += line('M12.6 36.8H57.4', G, 1.4);
      s += face(rr(31, 37.6, 8, 7, 1.6), G, { w: 1.2 }) + dot(35, 40.2, 1.2, mg.deep) + flat('M34.4 40.4h1.2l0.5 2.4h-2.2Z', mg.deep);
      s += part(ellD(14.6, 52.6, 3, 2), G, { w: 1.1 }) + part(ellD(55.4, 52.6, 3, 2), G, { w: 1.1 });
      // collar de perlas que se sale por el borde y cuelga
      let pr = '';
      for (let i = 0; i <= 8; i++) { const t = i / 8; pr += circD(40.6 + 15.6 * t, 32.6 + 12.4 * Math.sin(Math.PI * t), 2.1); }
      pr += circD(42.6, 29.4, 2) + circD(53.6, 29.4, 2);
      s += part(pr, '#FBF5EC', { w: 1 });
      return s;
    },
  },
  {
    id: 'velaMono', name: 'Velas con moño', price: 50, w: 56, h: 74, place: 'sobre', vibes: ['coquette', 'aesthetic'],
    draw: (p) => {
      const A = p.accent === '#FFFFFF' ? '#F7B6C8' : p.accent, W = '#FFF4EC', mw = mat(W);
      let s = glow(25, 16, 14, 10, '#FFE9A8', 0.2) + surf(28, 71.6, 25);
      // platito con festón
      s += face('M4 67.4A24 6 0 0 0 52 67.4V69.4A24 6 0 0 1 4 69.4Z', tone('#FFFFFF', -0.4), { w: 1.4 });
      s += face(ellD(28, 67.4, 24, 6), '#FFFFFF', { w: 1.5 }) + line(ellD(28, 67.6, 20, 4.6), '#F2E6EC', 1.2);
      const candle = (cx, base, rx, h, ry2, bs) => {
        const ry = rx * 0.5, top = base - h;
        let o = cylinder(cx, base, rx, h, W, { w: 1.6 });
        o += shade(`M${f1(cx + rx * 0.3)} ${top}H${cx + rx}V${base}A${rx} ${ry} 0 0 1 ${f1(cx + rx * 0.3)} ${f1(base + ry * 0.95)}Z`, mw.deep, 0.22);
        o += flat(ellD(cx, top + 0.6, f1(rx * 0.66), f1(ry * 0.6)), tone(W, 0.4));
        [[-rx * 0.45, 6], [rx * 0.25, 9]].forEach(([dx, len]) => { const x = cx + dx; const yy = top + ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2)); o += flat(`M${f1(x - 1.6)} ${f1(yy - 1)}V${f1(yy + len)}a1.6 1.6 0 0 0 3.2 0V${f1(yy - 1)}Z`, '#FFFFFF'); });
        o += face(`M${cx - rx} ${ry2}A${rx} ${ry} 0 0 0 ${cx + rx} ${ry2}V${ry2 + 4}A${rx} ${ry} 0 0 1 ${cx - rx} ${ry2 + 4}Z`, A, { w: 1.3 });
        o += bow(cx, f1(ry2 + ry + 2), bs, A);
        o += line(`M${cx} ${top}v-3.4`, INK, 1.6) + flame(cx, top - 2.8, rx > 10 ? 0.85 : 0.7);
        return o;
      };
      s += candle(21, 65, 12, 40, 44, 0.62) + candle(41.4, 68, 9, 20, 55, 0.44);
      return s;
    },
  },
  {
    id: 'rosas', name: 'Florero de rosas', price: 70, w: 64, h: 90, place: 'sobre', vibes: ['coquette', 'princesa', 'gotica'],
    draw: (p) => {
      const C = p.cloth, A = p.accent === '#FFFFFF' ? '#F7C6D9' : p.accent, V = '#FBF7F2', mv = mat(V);
      let s = surf(32, 87.6, 18);
      // tallos y hojas
      s += line('M32 61Q26 50 20 38M32 61Q32 46 32 30M32 61Q38 50 44 38M32 61Q27 55 22 51M32 61Q37 55 42.6 52', '#4E8A55', 2);
      s += leaf(29, 53, 11, 198, 3.2, '#6CBF6A') + leaf(35, 52, 11, -18, 3.2, '#5BAA5C') + leaf(30, 44, 9.4, -150, 2.7, '#7FCB7A') + leaf(34, 42, 9.4, -30, 2.7, '#6CBF6A');
      // rosas y capullos
      const bud = (x, y, c) => part(`M${x} ${y + 3.4}C${x - 3.6} ${y + 1.4} ${x - 2.8} ${y - 4} ${x} ${y - 5}C${x + 2.8} ${y - 4} ${x + 3.6} ${y + 1.4} ${x} ${y + 3.4}Z`, c, { w: 1.1 }) + flat(`M${x - 2.6} ${y + 1.4}L${x} ${y + 4}L${x + 2.6} ${y + 1.4}L${x} ${y + 2.6}Z`, '#5BAA5C');
      s += bud(22, 50.4, tone(C, 0.2)) + bud(42.6, 51.4, tone(C, 0.2));
      s += rose(20, 36.6, 7.2, tone(C, -0.2)) + rose(44, 36.6, 7.2, tone(C, -0.2)) + rose(32, 26.4, 8.6, C);
      s += dots([[14, 44, 1.4], [16.4, 47.4, 1.3], [50, 44.6, 1.4], [47.6, 47.8, 1.3], [26, 44.4, 1.2], [38.4, 45, 1.2]], 1.4, '#FFFFFF');
      // jarrón de porcelana con filo dorado y moño
      s += part('M24.4 64C24.4 70 17 72.6 17 79.6C17 85.6 22 87.6 32 87.6C42 87.6 47 85.6 47 79.6C47 72.6 39.6 70 39.6 64Z', V, { w: 1.8 });
      s += roundShade(32, 79, 15, 9, '#D8CCD8', 0.3, 0.32);
      s += shine('M20.6 76C20 78.6 20.6 81.6 22 83.4L23.6 82.6C22.6 81 22.2 78.6 22.6 76.6Z', { opacity: 0.9 });
      s += face(rr(22, 58.6, 20, 5.8, 2.6), mv.top, { w: 1.5 }) + line('M23.6 59.8H40.4', GOLD, 1.6);
      s += flat(ellD(32, 60.6, 6.6, 1.3), mv.deep);
      s += line('M18.6 80.6Q32 85 45.4 80.6', GOLD, 1.4, { opacity: 0.9 });
      s += bow(32, 67.4, 0.58, A);
      return s;
    },
  },
  // ── Cottagecore ────────────────────────────────────────────────
  {
    id: 'picnic', name: 'Canasta de pícnic', price: 75, w: 84, h: 70, place: 'piso', vibes: ['cottagecore'],
    draw: (p) => {
      const W = p.wood, mw = mat(W), K = p.cloth;
      let s = floorSh(42, 67.4, 38, 5);
      // asa trenzada
      s += tube('M16 40C16 10 68 10 68 40', 4.6, mw.side);
      s += line('M17.4 31.4l2.4 -2.6M21.4 23.4l3 -2.2M28.6 17.4l3.6 -1.4M38 14.6h3.8M47.4 15.4l3.6 1.2M56.4 19.2l3 2.2M62.6 25.6l2.2 2.8', mw.top, 1.4, { opacity: 0.85 });
      // boca de la canasta, en sombra, y lo que se lleva
      s += face(rr(8, 31, 68, 10, 2), mix(mw.deep, '#2A1C24', 0.4), { w: 1.4 });
      s += `<g transform="rotate(26 61 30)">${part(rr(55, 9, 11, 34, 5.5), '#E8B26A', { w: 1.5 })}${line('M57.6 16l5.6 -2.4M57.6 23l5.6 -2.4M57.6 30l5.6 -2.4', '#C98A4A', 1.4)}${shine(rr(56.6, 12, 1.6, 14, 0.8), { opacity: 0.6 })}</g>`;
      s += cylinder(28, 40, 7.4, 10, '#D9475A', { w: 1.5 }) + shine(rr(22.4, 31.4, 1.6, 6.4, 0.8), { opacity: 0.6 });
      s += cylinder(28, 30.4, 8, 3, '#FFFFFF', { w: 1.4 }) + dots([[24.4, 26.6], [28, 25.4], [31.6, 26.6], [26, 28.4], [30, 28.4]], 0.9, '#E8505E');
      s += apple(44, 33.6, 5.8);
      // borde enrollado y frente tejido
      s += face(rr(6, 38, 72, 5.6, 2.8), mw.top, { w: 1.6 }) + line('M10 39l2.4 3.6M17 39l2.4 3.6M24 39l2.4 3.6M31 39l2.4 3.6M38 39l2.4 3.6M45 39l2.4 3.6M52 39l2.4 3.6M59 39l2.4 3.6M66 39l2.4 3.6M73 39l2 3', mw.side, 1.2, { opacity: 0.6 });
      s += face('M9 43.6H75L72 64Q71 66.6 68 66.6H16Q13 66.6 12 64Z', mix(mw.deep, '#2A1C24', 0.25), { w: 1.8 });
      s += weave(9, 44, 66, 22, W, { rh: 5.5, bw: 9, edge: (y) => { const k = (y - 43.6) / 23; return [9 + 3 * k, 75 - 3 * k]; } });
      // servilleta a cuadros colgando por adelante
      s += part('M15 42.6H39V53.4Q36 55.4 33 53.4Q30 55.4 27 53.4Q24 55.4 21 53.4Q18 55.4 15 53.4Z', mix(K, '#FFFFFF', 0.62), { w: 1.4 });
      s += gingham(15.6, 43.2, 22.8, 9.6, K, 3.2);
      return s;
    },
  },
  {
    id: 'hongos', name: 'Hongos del bosque', price: 55, w: 76, h: 66, place: 'piso', vibes: ['cottagecore', 'kawaii'],
    draw: (p) => {
      const C = p.cloth, S = '#F7F0E4', ms = mat(S), M = '#86BE6E', mm = mat(M);
      let s = floorSh(38, 63, 34, 5);
      // montículo de musgo con pastito
      s += part('M5 62.6C7 52 20 47.4 38 47.4C56 47.4 69 52 71 62.6Z', M, { w: 1.6 });
      s += shade('M48 48.4C60 50 69 54 71 62.6H52C56 58 55 52 48 48.4Z', mm.deep, 0.26);
      s += dots([[14, 57], [22, 53], [31, 51], [46, 51.6], [56, 54], [63, 58.6], [19, 60], [40, 56]], 1.4, mm.top);
      const mush = (x, y, r, c, h) => {
        const m = mat(c), ct = y - h;
        let o = part(`M${f1(x - r * 0.34)} ${y}C${f1(x - r * 0.38)} ${f1(y - h * 0.5)} ${f1(x - r * 0.3)} ${ct} ${f1(x - r * 0.24)} ${ct}H${f1(x + r * 0.24)}C${f1(x + r * 0.3)} ${ct} ${f1(x + r * 0.38)} ${f1(y - h * 0.5)} ${f1(x + r * 0.34)} ${y}Z`, S, { w: 1.4 });
        o += shade(`M${f1(x + r * 0.08)} ${ct}H${f1(x + r * 0.24)}C${f1(x + r * 0.3)} ${ct} ${f1(x + r * 0.38)} ${f1(y - h * 0.5)} ${f1(x + r * 0.34)} ${y}H${f1(x + r * 0.1)}Z`, ms.deep, 0.24);
        if (h > 8) o += part(`M${f1(x - r * 0.42)} ${f1(ct + h * 0.32)}Q${x} ${f1(ct + h * 0.52)} ${f1(x + r * 0.42)} ${f1(ct + h * 0.32)}L${f1(x + r * 0.34)} ${f1(ct + h * 0.2)}Q${x} ${f1(ct + h * 0.34)} ${f1(x - r * 0.34)} ${f1(ct + h * 0.2)}Z`, tone(S, 0.4), { w: 1.1 });
        o += flat(ellD(x, f1(ct + 0.6), f1(r * 0.8), f1(r * 0.16)), '#E8D6BE');
        o += part(`M${x - r} ${ct}C${x - r} ${f1(ct - r * 1.15)} ${x + r} ${f1(ct - r * 1.15)} ${x + r} ${ct}C${f1(x + r * 0.5)} ${f1(ct + r * 0.22)} ${f1(x - r * 0.5)} ${f1(ct + r * 0.22)} ${x - r} ${ct}Z`, c, { w: 1.6 });
        o += shade(`M${f1(x + r * 0.2)} ${f1(ct - r * 0.86)}C${f1(x + r * 0.85)} ${f1(ct - r * 0.7)} ${x + r} ${f1(ct - r * 0.3)} ${x + r} ${ct}C${f1(x + r * 0.75)} ${f1(ct + r * 0.12)} ${f1(x + r * 0.5)} ${f1(ct + r * 0.18)} ${f1(x + r * 0.35)} ${f1(ct + r * 0.2)}C${f1(x + r * 0.7)} ${f1(ct - r * 0.3)} ${f1(x + r * 0.6)} ${f1(ct - r * 0.7)} ${f1(x + r * 0.2)} ${f1(ct - r * 0.86)}Z`, m.deep, 0.26);
        o += dots([[x - r * 0.45, ct - r * 0.5, r * 0.2], [x + r * 0.1, ct - r * 0.7, r * 0.24], [x + r * 0.58, ct - r * 0.35, r * 0.15], [x - r * 0.05, ct - r * 0.25, r * 0.13]], 1, '#FFF8EE');
        o += gloss(f1(x - r * 0.6), f1(ct - r * 0.55), f1(r * 0.16), f1(r * 0.09), -35, 0.7);
        return o;
      };
      s += mush(26, 56, 17, C, 16) + mush(53, 55, 12, tone(C, 0.35), 12);
      // pastito, una florcita y el hongo chiquito de adelante
      s += part('M7 62.4L9 55L11 60L13.4 52.6L15.4 62.4Z', '#6CBF6A', { w: 1.2 }) + part('M60 62.4L62 56L64 60.4L66.4 53.6L68.4 62.4Z', '#6CBF6A', { w: 1.2 });
      s += line('M66 52.6v-4', '#5BAA5C', 1.4) + blossom(66, 47, 3.2, '#FFFFFF', 5, '#FFD966');
      s += mush(40, 62, 7, tone(C, -0.1), 6);
      return s;
    },
  },
  {
    id: 'tetera', name: 'Juego de té', price: 70, w: 88, h: 62, place: 'sobre', vibes: ['cottagecore', 'coquette', 'academia'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), A = p.accent === '#FFFFFF' ? '#FFD966' : p.accent, WH = '#FFFFFF', mw = mat(WH);
      let s = surf(31, 59.6, 24) + surf(71, 59.6, 16);
      // tetera: asa, pico, cuerpo y tapa
      s += part('M15 34.6C4.6 33.4 3.4 50.6 13.6 51.6L14.6 47.4C8.6 46.6 8.8 38.6 15 39Z', C, { w: 1.6 });
      s += part('M46.4 48C51 46 52.6 40 55.6 33C56.6 30.4 58.6 28.6 61.6 28.4L62.4 31.2C60.4 31.6 59 33 58.4 35C56 42 54.4 49 48 53.4Z', C, { w: 1.6 });
      s += face(rr(21, 55.4, 20, 3.6, 1.4), mc.side, { w: 1.4 });
      s += part(ellD(31, 43, 18, 15), C, { w: 1.8 });
      s += roundShade(31, 43, 18, 15, C, 0.26, 0.3);
      s += line('M14.2 40.6Q31 47.4 47.8 40.6', '#FFFFFF', 1.6, { opacity: 0.9 });
      s += blossom(31, 48.4, 4.2, '#FFFFFF', 5, A) + dots([[22, 47], [40, 47]], 1.5, '#FFFFFF');
      s += face(ellD(31, 29.4, 11, 3.6), mc.top, { w: 1.5 });
      s += part('M22.6 29.2C22.6 22.4 39.4 22.4 39.4 29.2Z', tone(C, 0.3), { w: 1.5 }) + ball(31, 21.4, 2.8, A, 1.2);
      s += gloss(20, 34.6, 3.4, 1.8, -40, 0.85);
      // taza con su platito y vapor
      s += face('M56 56A15 4.4 0 0 0 86 56V57.6A15 4.4 0 0 1 56 57.6Z', mw.side, { w: 1.3 });
      s += face(ellD(71, 56, 15, 4.4), WH, { w: 1.5 }) + line(ellD(71, 56.2, 10.4, 2.8), '#EFE6EE', 1.2);
      s += part('M79.6 46C86 45 87 52.4 80.6 54L80 51.8C83 51 83 47.8 80 48.2Z', WH, { w: 1.4 });
      s += part('M61 44H81L79.6 51.6C78.6 55.4 74 56.4 71 56.4C68 56.4 63.4 55.4 62.4 51.6Z', WH, { w: 1.6 });
      s += face(ellD(71, 44, 10, 2.8), mw.top, { w: 1.3 }) + flat(ellD(71, 44.3, 8.4, 2), '#C9895A');
      s += flat(heart(71, 49.8, 2.4), C) + line('M62.2 46.4Q71 49.4 79.8 46.4', C, 1.2, { opacity: 0.8 });
      s += steam(70, 40.4, 12);
      return s;
    },
  },
  {
    id: 'pan', name: 'Canasta de pan', price: 45, w: 74, h: 50, place: 'sobre', vibes: ['cottagecore', 'chef'],
    draw: () => {
      const W = '#C8955E', mw = mat(W), K = '#E8505E';
      let s = surf(37, 47.6, 31);
      // boca de la canasta con la servilleta adentro
      s += face(ellD(37, 24, 31, 9), mix(mw.side, '#2A1C24', 0.2), { w: 1.6 });
      s += flat(ellD(37, 24.6, 26, 6.6), mix(K, '#FFFFFF', 0.62));
      // panes: baguette atrás, hogaza al medio y pancito
      s += `<g transform="rotate(-14 50 15)">${part(rr(31, 9.4, 38, 10, 5), '#F0C27E', { w: 1.5 })}${line('M38.6 11.4l3.6 5.6M46.4 11.4l3.6 5.6M54.2 11.4l3.6 5.6M62 11.4l2.6 4', '#B87A3C', 1.6)}${shine(rr(34, 11, 10, 1.6, 0.8), { opacity: 0.6 })}</g>`;
      s += part(ellD(28, 20.4, 12.6, 9.4), '#C97F3E', { w: 1.6 }) + roundShade(28, 20.4, 12.6, 9.4, '#C97F3E', 0.26, 0.3);
      s += line('M21.4 15.4L34.6 24.6M34.6 15.4L21.4 24.6', '#F6DDB0', 2) + gloss(21.6, 15.4, 2.6, 1.2, -25, 0.6);
      s += part(ellD(48.6, 23.4, 8.6, 6.2), '#E6A85C', { w: 1.5 }) + line('M44.4 22.4Q48.6 19.6 52.8 22.4', '#B87A3C', 1.5) + roundShade(48.6, 23.4, 8.6, 6.2, '#E6A85C', 0.3, 0.26);
      // dos puntas de la servilleta caen por el borde de adelante
      const flap = (d, dark) => part(d, mix(K, '#FFFFFF', 0.62), { w: 1.3 }) + shade(dark, K, 0.5);
      s += flap('M10 25.6L23 30.6L15 40Z', 'M13.4 27L16.4 28.2L15.4 36.4L14.4 37.6ZM10.6 29.4L21 31.6L20 33L11.6 31.2Z');
      s += flap('M64 25.6L51 30.6L59 40Z', 'M60.6 27L57.6 28.2L58.6 36.4L59.6 37.6ZM63.4 29.4L53 31.6L54 33L62.4 31.2Z');
      // la canasta: frente tejido y borde enrollado
      s += basketFront(37, 25, 31, 9, 43, 25, 5.4, W, 3);
      s += face('M5.4 24A31.6 9.4 0 0 0 68.6 24V27.4A31.6 9.4 0 0 1 5.4 27.4Z', mw.top, { w: 1.6 });
      s += line('M9 26.4l2 2.6M15.6 29l2 2.6M23 31.2l2 2.6M31 32.4l2 2.6M39 32.6l2 2.6M47 31.6l2 2.6M54.6 29.6l2 2.6M61.4 26.8l2 2.4', mw.side, 1.2, { opacity: 0.65 });
      s += flap('M12 27.4L22 31.4L17 38.6Z', 'M14.6 28.6L16.8 29.6L16.6 35.6Z') + flap('M62 27.4L52 31.4L57 38.6Z', 'M59.4 28.6L57.2 29.6L57.4 35.6Z');
      return s;
    },
  },
  {
    id: 'lana', name: 'Canasta de lana', price: 55, w: 72, h: 62, place: 'piso', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      const W = '#C8955E', mw = mat(W), C1 = p.cloth, C2 = p.accent === '#FFFFFF' ? '#F2E6D8' : p.accent;
      let s = floorSh(36, 59.4, 32, 5);
      // boca de la canasta
      s += face(ellD(36, 30, 27, 9), mix(mw.deep, '#2A1C24', 0.4), { w: 1.6 });
      // ovillos con sus vueltas
      const yarn = (x, y, r, c) => part(ellD(x, y, r, r), c, { w: 1.6 }) + roundShade(x, y, r, r, c, 0.28, 0.3)
        + line(`M${f1(x - r * 0.8)} ${f1(y - r * 0.32)}Q${x} ${f1(y - r * 1.05)} ${f1(x + r * 0.8)} ${f1(y - r * 0.4)}M${f1(x - r * 0.95)} ${f1(y + r * 0.12)}Q${x} ${f1(y - r * 0.5)} ${f1(x + r * 0.95)} ${f1(y)}M${f1(x - r * 0.72)} ${f1(y + r * 0.6)}Q${x} ${f1(y + r * 0.1)} ${f1(x + r * 0.76)} ${f1(y + r * 0.56)}M${f1(x - r * 0.2)} ${f1(y - r * 0.95)}Q${f1(x + r * 0.5)} ${y} ${f1(x + r * 0.1)} ${f1(y + r * 0.95)}`, tone(c, -0.9), 1.2, { opacity: 0.85 })
        + gloss(f1(x - r * 0.45), f1(y - r * 0.45), f1(r * 0.18), f1(r * 0.1), -40, 0.7);
      s += yarn(24, 25, 11, C1) + yarn(47, 24, 10, C2);
      // agujas de tejer clavadas en un ovillo
      s += tube('M44 21L57.4 4.6', 2, '#C9A06A') + part(ellD(58, 4, 2.2, 2.2), '#E8505E', { w: 1 });
      s += tube('M48.6 22.4L63.6 9', 2, '#C9A06A') + part(ellD(64.4, 8.4, 2.2, 2.2), '#E8505E', { w: 1 });
      s += yarn(36, 30.4, 8, '#F3E6D3');
      // la canasta
      s += basketFront(36, 31, 27, 9, 56, 22, 6, W, 4);
      s += face('M8.4 30A27.6 9.4 0 0 0 63.6 30V33.4A27.6 9.4 0 0 1 8.4 33.4Z', mw.top, { w: 1.6 });
      // la hebra que cae hasta el piso
      s += line('M17 31.4C11 33.6 8.4 42 9.4 50C10 55.6 5.6 58 2.6 57.4', C1, 1.8);
      return s;
    },
  },
  {
    id: 'pajarito', name: 'Jaula con pajarito', price: 95, w: 60, h: 100, place: 'sobre', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      const Wd = p.wood, mw = mat(Wd), B = tone(Wd, -0.9), C = p.cloth, mc = mat(C);
      let s = surf(30, 97.6, 26);
      // gancho y remate de arriba
      s += Cir(30, 4.6, 3, { fill: 'none', stroke: B, 'stroke-width': 1.6, 'data-r': 'line' }) + part(ellD(30, 10.4, 3.4, 2.8), Wd, { w: 1.2 });
      // piso de la jaula
      s += face('M5 89.6A25 5 0 0 0 55 89.6V96A25 5 0 0 1 5 96Z', Wd, { w: 1.6 }) + face(ellD(30, 89.6, 25, 5), mw.top, { w: 1.5 });
      s += line('M7 93.6Q30 99 53 93.6', mw.hi, 1.2, { opacity: 0.7 });
      // percha y pajarito
      s += tube('M11 64H49', 2.4, Wd);
      s += part('M17 57C14 54 11 55 10 58C13 58 15 59 17 61Z', tone(C, -0.3), { w: 1.2 });
      s += part(ellD(27, 56, 10, 7.6), C, { w: 1.6 }) + part(ellD(34.4, 47.6, 6.4, 6.2), C, { w: 1.6 });
      s += shade(crescent(27, 56, 10, 7.6, 0.28), mc.deep, 0.28);
      s += part('M19 54C22 50 30 50 32 55C29 59 23 60 19 57Z', tone(C, 0.4), { w: 1.2 });
      s += part('M40.4 46.6L45 48L40.6 50Z', '#FF9F43', { w: 1 }) + eye(36.6, 46.6, 1.5) + blush(37.4, 50.4, 1.6);
      s += line('M25 63.4v1.6M29 63.4v1.6', '#C97A3A', 1.2);
      // barrotes y aros (delante del pajarito)
      let bars = '';
      [12.6, 19.2, 25.8, 34.2, 40.8, 47.4].forEach((x) => { bars += `M${x} 89V42C${x} 27 ${f1(30 + (x - 30) * 0.45)} 16 30 14`; });
      s += line(bars, B, 1.3, { opacity: 0.85 });
      s += line('M6 89.4V42C6 24 18 14 30 14C42 14 54 24 54 42V89.4', B, 2);
      s += line('M6 42A24 4.4 0 0 0 54 42M6 70A24 4.4 0 0 0 54 70', B, 1.8);
      s += line('M36 86V75Q40.6 71.6 45.2 75V86', B, 1.4);
      // florcitas trepando
      s += leaf(6, 80, 8, -40, 2.4, '#7FB894') + leaf(6, 72, 7, 210, 2.2, '#6CB577');
      s += blossom(8.4, 76, 3.4, '#FFB6CC', 5, '#FFE07A');
      return s;
    },
  },
  // ── Gótica ─────────────────────────────────────────────────────
  {
    id: 'candelabro', name: 'Candelabro', price: 90, w: 76, h: 100, place: 'sobre', vibes: ['gotica', 'academia'],
    draw: (p) => {
      const M = p.accent, mm = mat(M), W = '#F4F0EA', mw = mat(W);
      let s = glow(38, 22, 30, 12, '#FFE9A8', 0.2) + surf(38, 97.6, 18);
      // pie abombado y fuste torneado
      s += part('M24 96.6C24 91.6 30 88.6 38 88.6C46 88.6 52 91.6 52 96.6A14 3.4 0 0 1 24 96.6Z', M, { w: 1.6 });
      s += face(rr(36, 64, 4, 24, 1.6), M, { w: 1.4 }) + line('M37.2 66V86', mm.hi, 1, { opacity: 0.8 });
      s += part(ellD(38, 86.4, 5, 3), M, { w: 1.3 }) + part(ellD(38, 75, 4.6, 3), M, { w: 1.3 });
      // brazos con sus rulos
      s += tube('M38 66C26 66 17.6 62 16 51', 3.4, M) + tube('M38 66C50 66 58.4 62 60 51', 3.4, M) + tube('M38 66V48', 3.4, M);
      s += line('M24 64.6q-2.4 3.6 1 5q2.6 0.6 2.6 -2M52 64.6q2.4 3.6 -1 5q-2.6 0.6 -2.6 -2', M, 1.6);
      s += part(ellD(38, 66, 3.4, 2.8), M, { w: 1.2 }) + gloss(36.8, 65, 0.9, 0.6, -30, 0.9);
      // platillos, velas con chorreado y llamas
      [[16, 50.6, 18], [38, 47, 22], [60, 50.6, 18]].forEach(([x, y, h]) => {
        s += face(rr(x - 3.6, y - h, 7.2, h - 0.6, 1.2), W, { w: 1.4 }) + shade(rr(x + 0.8, y - h + 0.6, 2.4, h - 1.6, 0.8), mw.deep, 0.22);
        s += flat(`M${x - 3.6} ${y - h + 0.6}h3.2v4.4a1.6 1.6 0 0 1 -3.2 0Z`, '#FFFFFF');
        s += part(`M${x - 6.4} ${y - 0.6}H${x + 6.4}L${x + 4} ${y + 2.6}H${x - 4}Z`, M, { w: 1.3 });
        s += line(`M${x} ${y - h}v-3`, INK, 1.5) + flame(x, y - h - 2.6, 0.8);
      });
      return s;
    },
  },
  {
    id: 'calavera', name: 'Calavera con flores', price: 75, w: 62, h: 62, place: 'sobre', vibes: ['gotica'],
    draw: (p) => {
      const B = '#F4F0EA', mb = mat(B), C = p.cloth, A = p.accent === '#FFFFFF' ? '#FFD3DF' : p.accent, D = '#3A2A3E';
      let s = surf(31, 59.6, 22);
      // cráneo redondito con su mandíbula
      s += part('M12 35C10 15 52 15 50 35C50 42 47 45 44 46.6V52.6C44 55.6 41 57.6 38 57.6H24C21 57.6 18 55.6 18 52.6V46.6C15 45 12 42 12 35Z', B, { w: 1.8 });
      s += shade('M42 19.6C49 24 51 30 50 35C50 42 47 45 44 46.6V52.6C44 55.6 41 57.6 38 57.6H35C40 56 41.4 52 41.6 47C45.6 44 47.4 40 47.6 35C47.8 28 45.6 23 42 19.6Z', mb.deep, 0.26);
      // cuencas con brillito, nariz de corazón al revés y dientes
      s += part(ellD(22.6, 35.4, 6, 6.6), D, { w: 1.1 }) + part(ellD(39.4, 35.4, 6, 6.6), D, { w: 1.1 });
      s += dots([[20.6, 33.2, 1.8], [37.4, 33.2, 1.8], [24.4, 38, 0.9], [41.2, 38, 0.9]], 1, '#FFFFFF');
      s += flat('M31 45L28.4 41.8C27.8 40.8 28.8 39.8 29.8 40.4L31 41.2L32.2 40.4C33.2 39.8 34.2 40.8 33.6 41.8Z', D);
      s += face(rr(22, 48.4, 18, 6, 2), '#FFFFFF', { w: 1.3 }) + line('M26.6 48.8V54M31 48.8V54M35.4 48.8V54', mb.side, 1.2);
      s += blush(16.6, 42.4, 2.6) + blush(45.4, 42.4, 2.6);
      // corona de flores
      s += leaf(17, 21, 9, 200, 2.8, '#5BAA5C') + leaf(45, 21, 9, -20, 2.8, '#5BAA5C') + leaf(27, 14, 7, -120, 2.4, '#6CBF6A') + leaf(35, 14, 7, -60, 2.4, '#6CBF6A');
      s += rose(19.4, 19, 6, C) + rose(42.6, 19, 6, C);
      s += blossom(25.4, 13.4, 3.6, '#FFFFFF', 5, '#FFE070') + blossom(36.6, 13.4, 3.6, '#FFFFFF', 5, '#FFE070');
      s += blossom(31, 14, 5.2, A, 5, '#FFE070');
      return s;
    },
  },
  {
    id: 'bolaCristal', name: 'Bola de cristal', price: 95, w: 56, h: 66, place: 'sobre', vibes: ['gotica', 'celestial'],
    draw: (p) => {
      const C = p.cloth, Wd = p.wood, mw = mat(Wd), G = BRASS, mg = mat(G);
      let s = glow(28, 28, 27, 25, mix(C, '#E0D4FF', 0.4), 0.35) + surf(28, 63.6, 22);
      // base de madera con aro de bronce
      s += part('M7 62.4C7 56 13.4 52.4 28 52.4C42.6 52.4 49 56 49 62.4A21 3.6 0 0 1 7 62.4Z', Wd, { w: 1.6 }) + grain([[13, 41, 58.6, 0.6]], Wd, 0.45);
      s += face('M14 49.4H42L39.6 54.6H16.4Z', G, { w: 1.4 }) + line('M15.6 50.8H40.4', mg.hi, 1.1, { opacity: 0.8 });
      // la bola: niebla, estrellitas y brillo
      s += part(ellD(28, 28.6, 20, 20), mix(C, '#EDE8FF', 0.55), { w: 1.8 });
      s += flat('M11.6 32.6C15.6 26.6 23.6 30.6 28 26.6C32.4 22.6 40.4 24.6 44.4 30.6C42.4 38.6 34.4 44.6 26 44.6C18 44.6 13 39.6 11.6 32.6Z', mix(C, '#FFFFFF', 0.2));
      s += line('M15.6 35C21.6 31 27.6 37 33.6 32C37.6 29 41.6 31 43 34', '#FFFFFF', 1.4, { opacity: 0.75 });
      s += flat(star(21, 24, 2.8, 0.42), '#FFFFFF') + flat(star(36, 36.4, 2.2, 0.42), '#FFFFFF') + flat(moon(33, 19.6, 2.6), '#FFF3C4');
      s += roundShade(28, 28.6, 20, 20, C, 0.2, 0.24);
      s += shine('M13.6 23C15.6 15 21.6 10.6 27.6 10.2C21.6 13.6 17.6 17.6 16.2 25Z', { opacity: 0.85 }) + dot(40, 40.4, 1.4, '#FFFFFF', { opacity: 0.8 });
      // garras de bronce que la sostienen
      s += part('M16.4 50C14.4 46.6 14.6 43.6 16.4 42C17.4 44.6 18.8 47.4 20.6 50Z', G, { w: 1.2 }) + part('M39.6 50C41.6 46.6 41.4 43.6 39.6 42C38.6 44.6 37.2 47.4 35.4 50Z', G, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'cuervo', name: 'Cuervo en su percha', price: 85, w: 60, h: 96, place: 'sobre', vibes: ['gotica'],
    draw: (p) => {
      const Wd = p.wood, mw = mat(Wd), K = '#2E2836', K2 = '#4A4258';
      let s = surf(30, 93.6, 20);
      // la percha en T
      s += cylinder(30, 93, 15, 5, Wd, { w: 1.6 });
      s += face(rr(28, 43, 4, 45, 1.4), Wd, { w: 1.4 }) + line('M29.2 46V86', mw.hi, 1, { opacity: 0.7 });
      s += face(rr(9, 39.4, 42, 5, 2.4), Wd, { w: 1.5 }) + part(ellD(9, 41.9, 2.8, 2.8), mw.top, { w: 1.2 }) + part(ellD(51, 41.9, 2.8, 2.8), mw.top, { w: 1.2 });
      // el cuervo: cola, cuerpo, ala, cabeza
      s += part('M20 34.6L7 43.4L10 46L14 44.4L13.4 47.6L23.4 38.6Z', K, { w: 1.4 });
      s += `<g transform="rotate(-18 27 30)">${part(ellD(27, 30.4, 11.4, 8.6), K, { w: 1.8 })}</g>`;
      s += part('M24 31C28 31 33 33 36 37C32 39 27 38.6 24 36Z', K2, { w: 1.1 });
      s += part('M16.4 28.6C20 22 29 22 32.6 27.6C31 33.6 24 37 17.6 36Z', K2, { w: 1.4 }) + line('M20 30.6l7 -2.4M19.4 33.4l7.4 -1.6', '#6A6080', 1.2, { opacity: 0.85 });
      s += part(ellD(35, 18.6, 7.8, 7.2), K, { w: 1.8 });
      s += part('M41 16.4L49.4 19.4L41.2 22.4Z', '#8A8496', { w: 1.2 }) + line('M41.6 19.4h5.4', '#5E5870', 1);
      s += dot(37.4, 17, 2.1, '#FFE07A') + dot(37.8, 17.2, 1.1, INK) + dot(37, 16.4, 0.6, '#FFFFFF');
      // una llavecita dorada en el pico (le gusta lo que brilla)
      s += line('M47.4 21L51 25.2', GOLD, 1.6) + Cir(52.4, 26.8, 2, { fill: 'none', stroke: GOLD, 'stroke-width': 1.5, 'data-r': 'line' }) + line('M48.6 22.4l1.6 -1.2M49.8 23.8l1.4 -1', GOLD, 1.2);
      s += line('M25 38.4V41M27.4 38.6V41M31 38.6V41M33.4 38.4V41', '#8A8496', 1.4);
      s += gloss(31.4, 14.6, 1.6, 0.9, -30, 0.5);
      return s;
    },
  },
  {
    id: 'hechizos', name: 'Libro de hechizos', price: 70, w: 76, h: 50, place: 'sobre', vibes: ['gotica', 'celestial'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), A = p.accent === '#FFFFFF' ? '#FFE07A' : p.accent, PG = '#F6EDD8';
      let s = glow(38, 26, 32, 14, mix(A, '#FFFFFF', 0.5), 0.22) + surf(38, 47.6, 35);
      // tapas de cuero y canto de las hojas
      s += face('M2 45L38 41L74 45L70 21L38 17.6L6 21Z', C, { w: 1.6 });
      s += face('M2 45L38 41L74 45V47.6L38 43.6L2 47.6Z', mc.side, { w: 1.4 });
      s += face('M5 41.8L38 38L71 41.8V44.4L38 40.6L5 44.4Z', '#EFE2C6', { w: 1.2 });
      // las dos páginas abiertas
      s += part('M38 38.2C30 35.6 17 36.2 5.4 39.8L9 22.6C19 19.8 30 19.6 38 21.6Z', PG, { w: 1.5 });
      s += part('M38 38.2C46 35.6 59 36.2 70.6 39.8L67 22.6C57 19.8 46 19.6 38 21.6Z', PG, { w: 1.5 });
      s += shade('M34.6 21.6Q38 22.4 41.4 21.6V37.8Q38 39 34.6 37.8Z', '#B8A890', 0.4);
      s += line('M11.6 26.4Q20 24.6 31 25.4M11 34.6Q20 32.8 31 33.4M45 25.4Q56 24.6 64.4 26.4M45 33.4Q56 32.8 65 34.6M45 29.4Q52 28.8 58 29.6', '#B8A890', 1.2);
      s += line(ellD(21, 30, 5.6, 3.6), A, 1.4) + flat(star(21, 30, 2.6, 0.45), A);
      s += flat(moon(60, 29.4, 3), A) + flat(star(52, 30, 1.6, 0.45), A);
      // cinta separadora y chispitas de magia
      s += part('M39.4 22H42.4V47.2L40.9 45.4L39.4 47.2Z', A, { w: 1 });
      s += sparkle(27, 10, 4.4) + sparkle(49, 6.6, 3.6) + sparkle(58, 14, 2.4) + sparkle(17, 15, 2.2);
      return s;
    },
  },
  // ── Y2K ────────────────────────────────────────────────────────
  {
    id: 'celular', name: 'Celular de tapa', price: 50, w: 36, h: 60, place: 'sobre', vibes: ['y2k'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), A = p.accent === '#FFFFFF' ? '#FFB6CC' : p.accent;
      let s = surf(18, 57.6, 15);
      // mitad de abajo, con su teclado
      s += part(rr(6, 31, 24, 25, 6), C, { w: 1.6 });
      s += shade(rr(23, 32.4, 6, 22, 3), mc.deep, 0.24);
      s += part(ellD(18, 37, 4.6, 3), tone(C, 0.5), { w: 1.2 }) + dot(18, 37, 1.3, tone(C, -0.4));
      let k = '';
      [43, 47.4, 51.8].forEach((y) => [12, 18, 24].forEach((x) => { k += rr(x - 2.3, y - 1.4, 4.6, 2.8, 1.3); }));
      s += flat(k, tone(C, 0.65));
      // bisagra y mitad de arriba con la pantalla
      s += face(rr(7, 28.6, 22, 4.2, 2), mc.side, { w: 1.3 });
      s += face(rr(25.6, 1.6, 3.2, 5, 1.4), mc.side, { w: 1.1 });
      s += part(rr(6, 5, 24, 25, 6), C, { w: 1.6 });
      s += flat(rr(15, 7, 6, 1.4, 0.7), mc.deep);
      s += face(rr(9.6, 9.4, 16.8, 15, 2), '#2E2A3A', { w: 1.2 });
      s += face(rr(11, 10.8, 14, 12, 1), '#BFE6FF', { w: 1 }) + flat(heart(18, 17, 3.4), '#FF7FA8') + flat('M12.4 12.4h1.2v1.6h-1.2ZM14.2 11.8h1.2v2.2h-1.2Z', '#6E8FB8');
      s += shine('M11.6 11.4h4L11.6 15.4Z', { opacity: 0.5 }) + gloss(9, 8, 1.6, 0.8, -40, 0.7);
      s += flat(star(24, 27, 1.8, 0.5), '#FFFFFF');
      // correa con dijes colgando de la esquina
      s += line('M28.6 7.6C33.4 7 34.6 14 33.2 21', A, 1.6) + dots([[33.8, 12.4], [33.9, 16.6]], 1.6, '#FFFFFF');
      s += part(star(33, 25, 3.6, 0.5), '#FFE07A', { w: 1.1 }) + line('M32.6 28.4L31 31', A, 1.2) + part(heart(30.4, 32.6, 2.6), A, { w: 1 });
      return s;
    },
  },
  {
    id: 'bolaDisco', name: 'Bola disco', price: 110, w: 64, h: 92, place: 'sobre', vibes: ['y2k', 'rockera'],
    draw: () => {
      const M = '#DCE1EA', K = '#3A3542';
      let s = surf(32, 89.6, 18);
      // pie con su motorcito
      s += cylinder(32, 89, 14, 7, K, { w: 1.6 }) + line('M19.4 85.6Q32 90.6 44.6 85.6', '#6A6480', 1.2) + dot(38, 86.4, 1.4, '#FF7FC4');
      s += face(rr(30, 60, 4, 22, 1.4), '#B8BFCC', { w: 1.3 }) + part(ellD(32, 61.6, 5, 3), '#B8BFCC', { w: 1.2 });
      // la bola de espejitos
      s += part(ellD(32, 36, 24, 24), M, { w: 1.8 });
      let gl = '';
      for (let k = -3; k <= 3; k++) { const y = 36 + k * 6.4, hw = Math.sqrt(24 * 24 - (k * 6.4) ** 2); gl += `M${f1(32 - hw)} ${f1(y)}Q32 ${f1(y + 2.4)} ${f1(32 + hw)} ${f1(y)}`; }
      for (let j = -3; j <= 3; j++) gl += `M${f1(32 + j * 2.4)} 12.6Q${f1(32 + j * 8.6)} 36 ${f1(32 + j * 2.4)} 59.4`;
      s += line(gl, '#9AA2B6', 1.1, { opacity: 0.85 });
      s += flat('M19 23.6h4.6v4.6H19ZM25.6 18.4h4.6v4.4h-4.6ZM14.6 30h4.4v4.6h-4.4Z', '#FFFFFF');
      s += flat('M35 40h4.6v4.6H35Z', '#FF9EC4') + flat('M42 27.6h4.4v4.6H42Z', '#9DCEEF') + flat('M24.6 46.4h4.6v4.6h-4.6Z', '#FFE07A') + flat('M39.4 50.6h4.4v4.4h-4.4Z', '#C9A6FF');
      s += roundShade(32, 36, 24, 24, '#9AA2B6', 0.22, 0.32);
      s += shine('M14 30C15 21 21 15 28 13.6C22 17.6 18.6 22.6 17.2 31Z', { opacity: 0.85 });
      // destellos de colores en la pared
      s += sparkle(7, 12, 4, '#FF9EC4') + sparkle(57, 18, 3.4, '#9DCEEF') + sparkle(57.6, 55, 3, '#FFE07A') + sparkle(6, 50, 2.8, '#C9A6FF');
      return s;
    },
  },
  {
    id: 'mariposas', name: 'Mariposas de pared', price: 40, w: 90, h: 56, place: 'sobre', vibes: ['y2k', 'kawaii', 'cottagecore'],
    draw: (p) => {
      const U = 'M0 0C-3 -13 -17 -14.6 -17.6 -5.4C-17.8 0.6 -9 3 0 1.4Z', L = 'M0 1.4C-7 3 -13.6 10 -9.4 14C-5.4 16.6 -1 11.4 0 5Z';
      const both = (d) => `${d}<g transform="scale(-1 1)">${d}</g>`;
      const fly = (x, y, sc, c, a) => {
        const m = mat(c), t = (dx, dy) => `translate(${x + dx} ${y + dy}) rotate(${a}) scale(${sc})`;
        let o = `<g transform="${t(2.4, 3)}">${both(shade(U + L, '#2A1C24', 0.13))}</g>`;
        o += `<g transform="${t(0, 0)}">`;
        o += both(part(U, c, { w: 1.4 }) + flat('M-4 -2C-6 -9 -13 -10.6 -14.6 -6C-14.4 -2.4 -9 -0.6 -4 -2Z', tone(c, 0.5)) + part(L, tone(c, 0.3), { w: 1.3 }));
        o += both(dots([[-12.4, -8.6, 1.6], [-8.4, 8.4, 1.3]], 1.4, '#FFFFFF'));
        o += part(rr(-1.6, -5, 3.2, 17, 1.6), '#4A3A50', { w: 1 });
        o += line('M-0.6 -4.6Q-3 -10 -5 -11.4M0.6 -4.6Q3 -10 5 -11.4', '#4A3A50', 1.1) + dots([[-5.2, -11.6], [5.2, -11.6]], 1.2, '#4A3A50');
        return o + '</g>';
      };
      return fly(23, 23, 1, p.cloth, -10) + fly(66, 18, 0.8, p.accent === '#FFFFFF' ? '#9FD8E8' : p.accent, 12) + fly(49, 43, 0.62, tone(p.cloth, 0.5), -4);
    },
  },
  // ── Celestial ──────────────────────────────────────────────────
  {
    id: 'proyector', name: 'Proyector de estrellas', price: 120, w: 60, h: 60, place: 'sobre', vibes: ['celestial', 'kawaii'], night: true,
    draw: (p) => {
      const D = mix(p.cloth, '#2E2A6A', 0.55), md = mat(D), Wd = p.wood;
      let s = glow(30, 36, 22, 14, '#B8A1FF', 0.22) + surf(30, 57.6, 21);
      // base con su botón
      s += cylinder(30, 57, 19, 9, Wd, { w: 1.6 }) + line('M11.6 52.6Q30 59.4 48.4 52.6', tone(Wd, 0.6), 1.2, { opacity: 0.8 });
      s += face(rr(40, 51, 6, 3.4, 1.4), p.accent, { w: 1.1 });
      // cúpula con estrellas y luna caladas, encendidas
      s += part('M12 47C12 21.6 48 21.6 48 47Z', D, { w: 1.8 });
      s += shade('M36 25.4C43.6 28 48 36 48 47H40C41 38 40 30.6 36 25.4Z', md.deep, 0.3);
      s += flat(`${star(21, 38.6, 3, 0.45)}${star(37, 33.6, 3.2, 0.45)}${star(41, 42.6, 2.4, 0.45)}${star(27.4, 43.6, 2.2, 0.45)}${star(25, 30.6, 1.8, 0.45)}`, '#FFE07A');
      s += flat(moon(31, 36, 3.6), '#FFF3C4');
      s += gloss(19, 31, 2.6, 1.3, -40, 0.6);
      // estrellas proyectadas alrededor
      s += sparkle(7, 11, 3.4, '#FFD24D') + sparkle(52, 8, 3.8, '#FFD24D') + sparkle(19, 4, 2.4, '#C9A6FF') + sparkle(55.6, 27, 2.6, '#C9A6FF') + sparkle(4.6, 30, 2.4, '#FFD24D') + sparkle(39, 3.6, 2.2, '#FFD24D');
      return s;
    },
  },
  {
    id: 'lunaLampara', name: 'Lámpara de luna', price: 95, w: 60, h: 76, place: 'sobre', vibes: ['celestial', 'aesthetic'],
    draw: (p) => {
      const Wd = p.wood, mw = mat(Wd), L = '#FFF6DC';
      let s = glow(30, 30, 30, 30, '#FFF3C4', 0.45) + surf(30, 73.6, 17);
      // pie
      s += cylinder(30, 73, 14, 5, Wd, { w: 1.6 }) + face(rr(28, 50, 4, 19, 1.2), Wd, { w: 1.3 }) + line('M29.2 52V67', mw.hi, 1, { opacity: 0.7 });
      // la luna, con cráteres iluminados de arriba a la izquierda
      s += part(ellD(30, 30, 23, 23), L, { w: 1.8 });
      [[21, 22, 4.4], [37, 33, 5.4], [25, 40, 3.4], [39, 19.6, 2.8], [15.6, 32, 2.4], [31, 26, 1.8]].forEach(([x, y, r]) => {
        s += flat(ellD(x, y, r, f1(r * 0.86)), '#EADFB8');
        s += flat(`M${f1(x - r)} ${y}A${r} ${f1(r * 0.86)} 0 0 1 ${f1(x + r)} ${y}Q${x} ${f1(y - r * 0.3)} ${f1(x - r)} ${y}Z`, '#D9C995');
        s += line(`M${f1(x - r * 0.6)} ${f1(y + r * 0.62)}Q${f1(x + r * 0.3)} ${f1(y + r * 1.02)} ${f1(x + r * 0.92)} ${f1(y + r * 0.1)}`, '#FFFDF2', 1.2);
      });
      s += roundShade(30, 30, 23, 23, '#E8D6A0', 0.28, 0.35);
      s += gloss(19, 17, 3.6, 1.8, -40, 0.7);
      // la cuna de madera que la sostiene
      s += tube('M9 37C9.4 56 50.6 56 51 37', 3, Wd);
      return s;
    },
  },
  {
    id: 'cristales', name: 'Cristales', price: 60, w: 62, h: 56, place: 'sobre', vibes: ['celestial', 'aesthetic'],
    draw: (p) => {
      const C = p.cloth, R = '#A89A92', mr = mat(R);
      let s = glow(31, 30, 28, 22, mix(C, '#FFFFFF', 0.5), 0.25) + surf(31, 53.6, 26);
      // piedra de la geoda
      s += part('M6 53C6 45.6 12 41.6 20 41.6H43C51 41.6 57 45.6 57 53Z', R, { w: 1.6 });
      // cristales: prisma con su cara clara, su cara en sombra y la punta
      const cr = (x, base, h, w, c, a) => {
        const m = mat(c), top = base - h, tip = top - w * 1.2;
        let o = part(`M${x - w} ${base}V${top}L${x} ${f1(tip)}L${x + w} ${top}V${base}Z`, c, { w: 1.5 });
        o += shade(`M${f1(x + w * 0.15)} ${base}V${top}L${x} ${f1(tip)}L${x + w} ${top}V${base}Z`, m.deep, 0.32);
        o += line(`M${f1(x + w * 0.15)} ${top}L${x} ${f1(tip)}`, m.side, 1.1, { opacity: 0.8 });
        o += shine(`M${f1(x - w + 1.4)} ${base - 2}V${top + 1}L${f1(x - w * 0.45)} ${f1(top - w * 0.5)}V${base - 2}Z`, { opacity: 0.55 });
        return `<g transform="rotate(${a} ${x} ${base})">${o}</g>`;
      };
      s += cr(17, 48, 12, 6, tone(C, 0.45), -22) + cr(46, 48, 15, 7, tone(C, 0.25), 18);
      s += cr(31, 47, 22, 8.4, C, 0);
      s += cr(23.6, 49, 8, 4, tone(C, 0.6), -8) + cr(39, 49, 9, 4.4, tone(C, 0.5), 10);
      // borde de la piedra adelante y destellos
      s += part('M8 53C9 48.4 16 46.4 24 47.4C30 48.2 34 46.4 40 47C48 47.6 55 48.4 56 53Z', tone(R, 0.3), { w: 1.4 });
      s += shade('M44 47.4C50 48 55 49 56 53H44Z', mr.deep, 0.25) + dots([[16, 51], [27, 50.4], [37, 51.6], [48, 51]], 1, mr.side);
      s += sparkle(19, 22, 3.2, '#FFFFFF') + sparkle(51, 19, 2.6, '#FFFFFF');
      return s;
    },
  },
  {
    id: 'tarot', name: 'Cartas de tarot', price: 45, w: 70, h: 46, place: 'sobre', vibes: ['celestial', 'gotica'],
    draw: (p) => {
      const Wd = p.wood, mw = mat(Wd), C = p.cloth, A = p.accent === '#FFFFFF' ? GOLD : p.accent;
      let s = surf(35, 43.6, 33);
      // dos cartas de dorso y la del medio de frente, paradas en su atril
      const back = (x, a) => `<g transform="rotate(${a} ${x} 38)">${face(rr(x - 9, 9.6, 18, 29, 2), C, { w: 1.5 })}${line(rr(x - 6.6, 12, 13.2, 24, 1), A, 1.2)}${flat(star(x, 24, 4, 0.45), A)}${dots([[x - 4.4, 14.4], [x + 4.4, 14.4], [x - 4.4, 33.6], [x + 4.4, 33.6]], 0.9, A)}</g>`;
      s += back(19, -13) + back(51, 13);
      s += face(rr(26, 6, 18, 31.4, 2), '#F6EDD8', { w: 1.6 }) + line(rr(28.2, 8.2, 13.6, 27, 1), A, 1.2);
      s += flat(moon(35, 16.6, 4.6), A) + flat(star(35, 27.6, 3.6, 0.45), A) + sparkle(30.6, 21.6, 1.6, A) + sparkle(39.6, 22.4, 1.4, A);
      s += flat(rr(29.6, 31.6, 10.8, 2.4, 0.6), tone(A, -0.4));
      // atril de madera
      s += face(rrTop(4, 33.4, 62, 4.4, 1.6), mw.top, { w: 1.4 }) + line('M8 35.8H62', mw.deep, 1.4);
      s += face(rr(4, 37, 62, 6, 1.6), Wd, { w: 1.6 }) + grain([[10, 34, 40.4, 0.6], [40, 60, 39.8, 0.6]], Wd, 0.5);
      return s;
    },
  },
  {
    id: 'atrapasuenos', name: 'Atrapasueños', price: 65, w: 56, h: 100, place: 'sobre', vibes: ['celestial', 'cottagecore'],
    draw: (p) => {
      const Wd = p.wood, C = p.cloth, A = p.accent === '#FFFFFF' ? '#9FD8E8' : p.accent, T = '#BFA98A';
      let s = Ell(29, 3.6, 2.6, 1.4, { fill: '#2A1C24', opacity: 0.2, 'data-r': 'tone' }) + part(ellD(28, 2.8, 2, 2), '#B8BFCC', { w: 1 });
      s += line('M28 3.4V10', '#8C7A70', 1.4);
      // aro forrado con sus vueltas
      s += line(circD(28, 28, 18), Wd, 4);
      let wr = '';
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; wr += `M${f1(28 + Math.cos(a) * 16.2)} ${f1(28 + Math.sin(a) * 16.2)}L${f1(28 + Math.cos(a) * 19.8)} ${f1(28 + Math.sin(a) * 19.8)}`; }
      s += line(wr, tone(Wd, -0.8), 1.1, { opacity: 0.7 });
      // la red de siete puntas con su cuenta
      const pt = (i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7; return `${f1(28 + Math.cos(a) * 15.6)} ${f1(28 + Math.sin(a) * 15.6)}`; };
      s += line(`M${pt(0)}L${pt(3)}L${pt(6)}L${pt(2)}L${pt(5)}L${pt(1)}L${pt(4)}Z`, T, 1.2);
      s += ball(28, 28, 2.6, A, 1.1) + dots([[28, 17.4], [35.4, 31.6], [21, 33]], 1.3, A);
      // tiras con cuentas y plumas
      [[14, 41, C], [28, 46, tone(C, 0.45)], [42, 41, C]].forEach(([x, y, c]) => {
        s += line(`M${x} ${y}V${y + 13}`, '#8C7A70', 1.2) + ball(x, y + 5, 1.9, A, 1);
        const f = y + 13;
        s += part(`M${x} ${f}C${x - 5.6} ${f + 8} ${x - 4.8} ${f + 22} ${x} ${f + 29}C${x + 4.8} ${f + 22} ${x + 5.6} ${f + 8} ${x} ${f}Z`, c, { w: 1.2 });
        s += line(`M${x} ${f + 2}V${f + 31}`, tone(c, -0.9), 1.1);
        s += line(`M${x} ${f + 9}l-3.4 -2.6M${x} ${f + 15}l3.4 -2.6M${x} ${f + 21}l-3 -2.4`, tone(c, -0.6), 1, { opacity: 0.8 });
      });
      return s;
    },
  },
  // ── Dark academia ──────────────────────────────────────────────
  {
    id: 'globoTerraqueo', name: 'Globo terráqueo', price: 80, w: 58, h: 80, place: 'sobre', vibes: ['academia'],
    draw: (p) => {
      const Wd = p.wood, mw = mat(Wd), O = '#E8D9B5', L = '#B9A06C', cx = 29, cy = 33, r = 20;
      let s = surf(29, 77.6, 19);
      // pie torneado
      s += cylinder(29, 77, 15, 5, Wd, { w: 1.6 }) + grain([[17, 41, 75, 0.5]], Wd, 0.45);
      s += part('M24.6 72C24.6 67 27.2 65 27.2 57H30.8C30.8 65 33.4 67 33.4 72Z', Wd, { w: 1.5 }) + part(ellD(29, 64.6, 4.4, 2.4), mw.top, { w: 1.2 });
      // la esfera antigua: mar de pergamino, tierras sepia y rosa de los vientos
      s += part(ellD(cx, cy, r, r), O, { w: 1.8 });
      s += flat('M14 22C18 18 25 18 27 22C28 26 24 28 22 31C21 34 22 37 19 38C16 36 13 31 13 27C13 25 13 23 14 22ZM21 41C25 40 27 43 26 47C25 50 23 52 21 53C20 50 19 46 19 44C19 42 20 41 21 41ZM34 18C38 16 43 18 45 22C46 27 43 30 41 34C40 38 37 41 35 39C34 35 33 31 34 27C32 24 32 20 34 18Z', L);
      s += line('M9.6 37Q29 45 48.4 29', tone(O, -0.5), 1.1, { opacity: 0.7 }) + line('M29 13.4V52.6', tone(O, -0.5), 1, { opacity: 0.5 });
      s += sparkle(40, 44, 3.4, tone(L, -0.6));
      s += roundShade(cx, cy, r, r, '#C9B484', 0.24, 0.3);
      s += gloss(20, 22.6, 3.6, 2, -40, 0.65);
      // meridiano completo de bronce con sus pernos
      s += line(circD(cx, cy, 23.2), BRASS, 3);
      s += line('M29 9.2v2M29 54.8v2M5.8 33h2M50.2 33h2M12.6 16.6l1.4 1.4M45.4 16.6l-1.4 1.4M12.6 49.4l1.4 -1.4M45.4 49.4l-1.4 -1.4', mat(BRASS).deep, 1.1);
      s += part(ellD(29, 9.8, 2.2, 2.2), BRASS, { w: 1.1 }) + part(ellD(29, 56.2, 2.4, 2.4), BRASS, { w: 1.1 });
      return s;
    },
  },
  {
    id: 'maquinaEscribir', name: 'Máquina de escribir', price: 110, w: 88, h: 62, place: 'sobre', vibes: ['academia', 'aesthetic'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), K = '#3A3542';
      let s = surf(44, 59.6, 41);
      // la hoja en el rodillo
      s += face(rr(28, 2, 32, 22, 1), '#FFFFFF', { w: 1.4 }) + line('M32 7.4h20M32 11.4h15M32 15.4h22', '#B8A890', 1.2);
      // carro: palanca, rodillo y perillas
      s += tube('M9.6 16.4L4 9', 2.2, CHROME) + part(ellD(3.6, 8.2, 2, 2), CHROME, { w: 1 });
      s += face(rr(9, 18.6, 70, 8.4, 4.2), K, { w: 1.6 }) + line('M13 20.4H75', '#6E6884', 1.2);
      s += part(ellD(8, 22.8, 3.6, 4.8), CHROME, { w: 1.3 }) + part(ellD(80, 22.8, 3.6, 4.8), CHROME, { w: 1.3 });
      // teclado (la tapa inclinada) con sus teclas redondas
      s += face(rr(7, 26.6, 74, 17.4, 3), mc.top, { w: 1.6 });
      const rim = [], cap = [];
      [[31, 9, 13], [35.6, 9, 16.6], [40.2, 8, 20.2]].forEach(([y, n, x0]) => { for (let i = 0; i < n; i++) { rim.push([x0 + i * 7.6, y]); cap.push([x0 + i * 7.6, y - 0.3]); } });
      s += dots(rim, 2.7, '#F4EBD8') + dots(cap, 1.8, K);
      // frente con la barra espaciadora y su placa
      s += face(rr(5, 43, 78, 15, 4), C, { w: 1.8 });
      s += face(rr(26, 44.6, 36, 4, 2), CHROME, { w: 1.2 });
      s += shade(rr(6, 52.6, 76, 4.4, 2.2), mc.deep, 0.22) + line('M9 45.6H22M66 45.6H79', mc.hi, 1.2, { opacity: 0.7 });
      s += flat(rr(36, 51, 16, 3, 1.5), GOLD);
      s += face(rr(10, 57.4, 9, 2.6, 1), K, { w: 1 }) + face(rr(69, 57.4, 9, 2.6, 1), K, { w: 1 });
      return s;
    },
  },
  {
    id: 'lamparaBanquero', name: 'Lámpara de escritorio', price: 85, w: 70, h: 70, place: 'sobre', vibes: ['academia'],
    draw: (p) => {
      const G = p.cloth, mg = mat(G), B = BRASS, mb = mat(B);
      let s = glow(35, 52, 32, 9, '#FFE9A8', 0.35) + surf(35, 67.6, 27);
      // base de bronce
      s += face(rrTop(14, 57.6, 42, 4, 2), mb.top, { w: 1.4 }) + face(rr(12, 61, 46, 6.4, 2.6), B, { w: 1.6 }) + line('M15 62.6H55', mb.hi, 1.2, { opacity: 0.8 });
      // brazo y perilla
      s += tube('M35 58.6V38', 3, B) + part(ellD(35, 50, 3, 2), B, { w: 1.1 });
      // pantalla de vidrio verde (media caña), con la luz por debajo
      s += flat(rr(10, 37.4, 50, 2.6, 1.3), '#FFF3C4');
      s += part('M8 37C8 24 18 20.4 35 20.4C52 20.4 62 24 62 37Z', G, { w: 1.8 });
      s += shade('M48 21.6C57 23.6 62 28.6 62 37H52C52 30 51 25 48 21.6Z', mg.deep, 0.3);
      s += face(rr(7, 35, 56, 4, 2), mg.side, { w: 1.5 });
      s += shine('M14 32C14 27 18 24.4 25 23.4L25.6 25C20 26 16.6 28.6 16.4 32.6Z', { opacity: 0.7 }) + line('M30 23.6H40', '#FFFFFF', 1.2, { opacity: 0.6 });
      s += part(ellD(35, 19.8, 3, 2), B, { w: 1.1 });
      // cadenita con su perla
      s += line('M48 39V50', mb.side, 1.1) + part(ellD(48, 51.6, 1.8, 2.2), B, { w: 1 });
      return s;
    },
  },
  {
    id: 'relojArena', name: 'Reloj de arena', price: 50, w: 44, h: 66, place: 'sobre', vibes: ['academia', 'gotica'],
    draw: (p) => {
      const Wd = p.wood, mw = mat(Wd), S = '#F2C14E';
      let s = surf(22, 63.6, 18);
      // poste de atrás
      s += face(rr(20.4, 9, 3.2, 47, 1.4), tone(Wd, -0.4), { w: 1.2 });
      // el vidrio con la arena que cae
      const G = 'M11 10.6H33C33 22 25 28 22.6 32.6C25 37 33 42 33 54H11C11 42 19 37 21.4 32.6C19 28 11 22 11 10.6Z';
      s += shade(G, '#E8F4FF', 0.5);
      s += flat('M14.6 19.6H29.4C28.4 25 24.6 28.4 22 30.6C19.4 28.4 15.6 25 14.6 19.6Z', S) + flat(ellD(22, 19.6, 7.4, 1.8), tone(S, 0.45));
      s += line('M22 30.6V46', S, 1.3);
      s += flat('M12.4 53.6C13.8 47.6 18.6 44.4 22 44C25.4 44.4 30.2 47.6 31.6 53.6Z', S) + flat('M17.6 47.6Q22 44.4 26.4 47.6Q22 46.4 17.6 47.6Z', tone(S, 0.45));
      s += line(G, mix('#9CC6DA', INK, 0.3), 1.6);
      s += shine('M13.4 13.4C13.4 18 15 21.6 17.4 24.6L16.4 25.6C13.6 22.4 12 18.4 12 13.4Z', { opacity: 0.75 }) + shine('M14 50.6C14.4 47 16 44.4 18.4 42.4L19 43.6C17 45.6 15.8 48 15.4 51Z', { opacity: 0.6 });
      // tapas de madera con su canto y patitas
      s += face(rrTop(5, 3.6, 34, 3.4, 1.4), mw.top, { w: 1.3 }) + face(rr(4, 6.4, 36, 4.6, 2), Wd, { w: 1.5 });
      s += face(rrTop(5, 52.6, 34, 3.4, 1.4), mw.top, { w: 1.3 }) + face(rr(4, 55.4, 36, 5.4, 2), Wd, { w: 1.5 });
      s += part(ellD(8, 61.4, 2.6, 1.8), mw.side, { w: 1 }) + part(ellD(36, 61.4, 2.6, 1.8), mw.side, { w: 1 });
      // postes torneados de adelante
      [7.6, 36.4].forEach((x) => { s += face(rr(x - 1.6, 10.8, 3.2, 42.4, 1.4), Wd, { w: 1.3 }) + part(ellD(x, 32, 2.6, 2), mw.top, { w: 1.1 }) + part(ellD(x, 14, 2.2, 1.6), mw.top, { w: 1 }) + part(ellD(x, 50, 2.2, 1.6), mw.top, { w: 1 }); });
      return s;
    },
  },
  // ── Playera ────────────────────────────────────────────────────
  {
    id: 'conchas', name: 'Frasco de conchitas', price: 45, w: 50, h: 62, place: 'sobre', vibes: ['playera', 'cottagecore'],
    draw: (p) => {
      let s = surf(25, 59.6, 19);
      const jar = 'M15 20.4C10 21.4 8 25 8 30V52C8 57 12 58.6 17 58.6H33C38 58.6 42 57 42 52V30C42 25 40 21.4 35 20.4Z';
      s += shade(jar, '#E3F2F8', 0.5);
      s += flat('M8.6 43.6C14 41.4 22 43 27 42C33 41 38 42 41.4 43.4V52C41.4 56.4 38 58 33 58H17C12 58 8.6 56.4 8.6 52Z', '#F2DFB8') + dots([[14, 50], [21, 55], [30, 53], [37, 49], [26, 47]], 0.9, '#D9BF8E');
      // conchitas: abanico con sus rayas, caracol, estrella de mar y una perla
      const fan = (x, y, r, c, a) => `<g transform="rotate(${a} ${x} ${y})">${part(`M${x} ${f1(y + r * 0.62)}L${x - r} ${f1(y - r * 0.15)}A${r} ${r} 0 0 1 ${x + r} ${f1(y - r * 0.15)}Z`, c, { w: 1.2 })}${line(`M${x} ${f1(y + r * 0.5)}L${f1(x - r * 0.62)} ${f1(y - r * 0.68)}M${x} ${f1(y + r * 0.5)}L${x} ${f1(y - r * 0.92)}M${x} ${f1(y + r * 0.5)}L${f1(x + r * 0.62)} ${f1(y - r * 0.68)}`, tone(c, -0.8), 1, { opacity: 0.8 })}${part(rr(x - 2.4, f1(y + r * 0.5), 4.8, 2.4, 0.8), c, { w: 1 })}</g>`;
      s += fan(15.6, 37.6, 5, '#C9A6FF', -16);
      s += part('M27 34C33 34 37 39 35 45C33 49 27 50 24.6 46C23 43 25 40 28 41C30 42 29.6 44.6 28 44.4', '#FFE3D3', { w: 1.3 }) + part('M27 34C24 35 22.4 38 23 41L24.6 40C24.6 37.4 25.6 35.6 27 34Z', '#F7C6B0', { w: 1 });
      s += fan(18.6, 51, 6.2, '#FFB6CC', 6);
      s += `<g transform="rotate(12 35 52)">${part(star(35, 52, 6, 0.48), '#F7A26B', { w: 1.2 })}</g>` + dots([[35, 52], [35, 47.6], [31.4, 51], [38.6, 51], [33, 55], [37, 55]], 0.8, '#FFD3B0');
      s += part(ellD(26, 55.6, 2.4, 2.4), '#FFFFFF', { w: 1 });
      // vidrio, cuello y corcho atado con cordel
      s += line(jar, mix('#9CC6DA', INK, 0.25), 1.8);
      s += shine('M11.6 30C10.8 36 10.8 46 11.6 52h2C12.8 46 12.8 36 13.6 30Z', { opacity: 0.7 }) + shine(rr(36.6, 27, 2.2, 6, 1.1), { opacity: 0.55 });
      s += face(rr(15, 13.4, 20, 8, 2), '#E3F2F8', { w: 1.3 });
      s += face(rrTop(17, 3.6, 16, 3.4, 1.4), '#E9C79A', { w: 1.2 }) + face(rr(16, 6.4, 18, 9.6, 3), '#D9B48A', { w: 1.4 }) + dots([[20, 10], [26, 12.6], [30.6, 9.4]], 0.9, '#B8925A');
      s += line('M14.6 17.8Q25 19.8 35.4 17.8', '#B8925A', 1.8) + bow(19, 18.6, 0.34, '#B8925A', { tails: false });
      return s;
    },
  },
  {
    id: 'tablaSurf', name: 'Tabla de surf', price: 130, w: 54, h: 170, place: 'piso', vibes: ['playera', 'deportiva'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), A = p.accent === '#FFFFFF' ? '#FFE07A' : p.accent;
      let s = floorSh(27, 166.6, 22, 4.4);
      s += part('M27 4C42 26 46 110 39 158Q27 168 15 158C8 110 12 26 27 4Z', C, { w: 2 });
      s += shade('M33 18C41 40 43.6 110 37.4 156Q33 160 30 161.4C36 140 38 70 33 18Z', mc.deep, 0.24);
      s += line('M20.6 40C17.6 70 17.6 120 20 150', '#FFFFFF', 1.8, { opacity: 0.6 });
      // franjas de la punta, larguero y una flor de hibisco
      s += flat('M18.4 30Q27 33.4 35.6 30L36.2 35.4Q27 38.8 17.8 35.4Z', A) + flat('M17.4 39.4Q27 42.6 36.6 39.4L36.8 42Q27 45.2 17.2 42Z', '#FFFFFF');
      s += line('M27 8V162', '#C9A06A', 1.4, { opacity: 0.85 });
      s += leaf(31, 98, 10, 30, 3, '#6CB577');
      s += blossom(27, 92, 8.4, '#FF8FB0', 5, '#FFE07A') + line('M27 92L27 85.6', '#E8505E', 1.2);
      // el invento enrollado al pie de la tabla
      s += dot(27, 150, 1.6, '#3A3542');
      s += line('M27 151C34 153 37 159.6 32 162.6C27 165.6 20.6 163 22.6 158.6C24.4 154.6 30.4 156.6 30.4 160.6', '#3A3542', 1.8);
      return s;
    },
  },
  // ── Arte, cocina y plantas ─────────────────────────────────────
  {
    id: 'pinceles', name: 'Tarro de pinceles', price: 40, w: 50, h: 70, place: 'sobre', vibes: ['aesthetic'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C);
      let s = surf(25, 67.6, 18);
      // boca del tarro
      s += face(ellD(25, 41, 15, 7.5), mc.top, { w: 1.6 }) + flat(ellD(25, 41.4, 12.4, 5.4), mix(mc.deep, '#2A1C24', 0.3));
      // pinceles con su virola y la punta con pintura, y un lápiz
      const brush = (x, top, a, hc, pc) => `<g transform="rotate(${a} ${x} 50)">${face(rr(x - 1.7, top + 10, 3.4, 42 - top, 1.4), hc, { w: 1.2 })}${face(rr(x - 2.3, top + 5.4, 4.6, 5.2, 1), CHROME, { w: 1 })}${part(`M${x - 2.3} ${top + 6}C${x - 2.7} ${top + 2} ${x - 0.8} ${top - 1} ${x} ${top - 2.4}C${x + 0.8} ${top - 1} ${x + 2.7} ${top + 2} ${x + 2.3} ${top + 6}Z`, '#6A5242', { w: 1.1 })}${flat(`M${x - 1.4} ${top + 0.6}C${x - 1.2} ${top - 0.6} ${x - 0.4} ${top - 1.6} ${x} ${top - 2}C${x + 0.4} ${top - 1.6} ${x + 1.2} ${top - 0.6} ${x + 1.4} ${top + 0.6}Z`, pc)}</g>`;
      s += brush(16, 9, -14, '#E8505E', '#7FC8F8');
      s += `<g transform="rotate(-3 22 50)">${face(rr(20, 10, 4, 34, 0.6), '#FFD24D', { w: 1.2 })}${line('M22 11V43', '#F2B526', 1.1)}${part('M20 10.4L22 4L24 10.4Z', '#F2D7B0', { w: 1.1 })}${flat('M21.3 6.4L22 4L22.7 6.4Z', '#3A3542')}</g>`;
      s += brush(29, 6, 6, '#5B7BD9', '#FFD24D') + brush(35, 12, 18, '#8ED07A', '#FF7FA8');
      // frente del tarro de cerámica, con salpicaduras y chorreados
      s += face('M10 41A15 7.5 0 0 0 40 41V67A15 7.5 0 0 1 10 67Z', C, { w: 1.8 });
      s += shade('M32 47.6A15 7.5 0 0 0 40 41V67A15 7.5 0 0 1 32 73.8Z', mc.deep, 0.24);
      s += flat('M15.4 46.6v6a1.7 1.7 0 0 0 3.4 0v-4.6ZM24.4 48.4v9a1.7 1.7 0 0 0 3.4 0v-9Z', '#7FC8F8') + flat('M33.4 46.8v4.6a1.6 1.6 0 0 0 3.2 0v-6Z', '#FF7FA8');
      s += dots([[16, 60, 1.6], [31.4, 62, 1.4], [22.6, 65, 1.2]], 1.4, '#FFD24D');
      s += shine(rr(12.6, 50, 2.2, 10, 1.1), { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'batidora', name: 'Batidora de pie', price: 130, w: 70, h: 84, place: 'sobre', vibes: ['chef', 'cottagecore', 'kawaii'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), mch = mat(CHROME);
      let s = surf(36, 81.6, 31);
      // base
      s += face(rrTop(9, 69.6, 54, 4, 2), mc.top, { w: 1.4 }) + face(rr(8, 73, 56, 8, 3.4), C, { w: 1.6 }) + shade(rr(9, 77.4, 54, 3, 1.5), mc.deep, 0.24);
      // columna y cabeza
      s += part('M10 73.4V40C10 33 13 30 18 30H24.6V73.4Z', C, { w: 1.8 }) + shade('M20 31H24.6V73H20Z', mc.deep, 0.22);
      s += part('M10 26C10 15 16 11 26 11H54C61 11 65 15 65 22C65 28 61 32 54 32H18C13 32 10 30 10 26Z', C, { w: 1.8 });
      s += shade('M11.4 27.6H64C62.4 30.6 58.6 32 54 32H18C15 32 12.6 30.4 11.4 27.6Z', mc.deep, 0.28);
      s += face(rr(46, 11.4, 4.4, 20.4, 1.2), CHROME, { w: 1.2 }) + part(ellD(14.4, 20.4, 4, 5), CHROME, { w: 1.3 });
      s += face(rr(18, 31.4, 6.4, 3.2, 1.4), CHROME, { w: 1.1 }) + flat(rr(27, 18.4, 13, 2.8, 1.4), tone(C, 0.6));
      s += shine('M20 14.4Q30 12.8 40 13.4V15.2Q30 15 21 16.4Z', { opacity: 0.7 });
      // batidor que baja al bol
      s += line('M43.6 32V48', mch.side, 2.2);
      s += line('M39.6 47C39.6 57 47.6 57 47.6 47M41.6 47C41.6 55 45.6 55 45.6 47', mch.deep, 1.3);
      // bol de metal con la masa rosada
      s += part('M61 53.6C67.4 53.4 68.4 62.4 62 63.4L61.4 60.8C64.2 60.2 64 56.4 61.4 56.4Z', CHROME, { w: 1.3 });
      s += part('M24 50H63L59.4 66C58.4 70 52.6 72 43.5 72C34.4 72 28.6 70 27.6 66Z', CHROME, { w: 1.8 });
      s += shade('M52 50.6H63L59.4 66C58.6 69.4 55 71 50 71.6C53 66 53.6 58 52 50.6Z', mch.deep, 0.3);
      s += line('M29 54V65', '#FFFFFF', 1.8, { opacity: 0.8 });
      s += face(ellD(43.5, 50, 19.5, 4), mch.top, { w: 1.5 }) + flat(ellD(43.5, 50.4, 16.6, 3), '#FFD3DF');
      s += flat('M36 50.6Q38 47 40.6 50.4Q43 46.6 46 50.6Q48.6 47.6 51 50.6Z', '#FFE6EC');
      return s;
    },
  },
  {
    id: 'pastelVitrina', name: 'Pastel en vitrina', price: 75, w: 60, h: 76, place: 'sobre', vibes: ['chef', 'coquette', 'kawaii'],
    draw: (p) => {
      const C = p.cloth, mc = mat(C), PL = '#FBF8F4', mp = mat(PL);
      let s = surf(30, 73.6, 24);
      // platón con pie
      s += part(ellD(30, 71, 9.4, 2.8), mp.side, { w: 1.3 }) + face(rr(26.6, 63.6, 6.8, 7.4, 1.6), PL, { w: 1.3 });
      s += face('M6 62A24 6 0 0 0 54 62V64A24 6 0 0 1 6 64Z', mp.side, { w: 1.4 }) + face(ellD(30, 62, 24, 6), PL, { w: 1.5 });
      // pastel con relleno, cobertura chorreada, frutillas y crema
      s += cylinder(30, 60, 15, 14, '#F6D7B0', { w: 1.6 });
      s += face('M15 52.4A15 7.5 0 0 0 45 52.4V55.4A15 7.5 0 0 1 15 55.4Z', C, { w: 1.2 });
      s += shade('M38 46.6H45V60A15 7.5 0 0 1 38 66.6Z', '#C9A06A', 0.25);
      s += face(ellD(30, 46, 15, 7.5), '#FFF3F6', { w: 1.5 });
      s += flat('M15.2 46.6Q15 50.6 16.6 51.4Q18.4 51 18.6 48.6Q20 54 22.4 53.6Q24.4 53 24.4 50Q26.6 55.4 29.4 54.6Q31.4 54 31.4 51.6Q33.6 55 36 54.2Q38 53.4 37.6 50.4Q39.6 53.4 41.6 52.4Q43.6 51.2 42.6 48.6Q44.4 50.6 44.8 46.6Q30 56 15.2 46.6Z', '#FFF3F6');
      const berry = (x, y) => part(`M${x} ${y + 3.6}C${x - 3.6} ${y + 1.4} ${x - 3.4} ${y - 2.6} ${x} ${y - 2.4}C${x + 3.4} ${y - 2.6} ${x + 3.6} ${y + 1.4} ${x} ${y + 3.6}Z`, '#E8505E', { w: 1.1 }) + flat(`M${x - 2} ${y - 2.4}L${x} ${y - 1}L${x + 2} ${y - 2.4}L${x} ${y - 3.6}Z`, '#6CBF6A') + dots([[x - 1, y], [x + 1.2, y + 0.8]], 0.5, '#FFE07A');
      s += part(ellD(22, 45.6, 3, 2.2), '#FFFFFF', { w: 1 }) + part(ellD(38, 45.6, 3, 2.2), '#FFFFFF', { w: 1 });
      s += berry(25.4, 44) + berry(34.6, 44) + berry(30, 41.6);
      // campana de vidrio con su perilla
      s += shade('M5 63C5 22 55 22 55 63Z', '#E8F4FF', 0.26);
      s += line('M5 63C5 22 55 22 55 63', mix('#9AB8D0', INK, 0.2), 1.8);
      s += part(ellD(30, 30.2, 3.2, 2.8), CHROME, { w: 1.2 });
      s += shine('M10.6 50C10.6 39 15.6 32 22 29.6C17 34 14.6 41 14.4 51Z', { opacity: 0.65 }) + shine('M46.6 39.6C48.6 42.6 49.6 46 50 50L48.4 50.4C48 46.6 47 43.4 45.2 40.6Z', { opacity: 0.5 });
      return s;
    },
  },
  {
    id: 'terrario', name: 'Terrario', price: 70, w: 56, h: 64, place: 'sobre', vibes: ['aesthetic', 'cottagecore'],
    draw: () => {
      const F = '#D9B266', mf = mat(F);
      let s = surf(28, 61.6, 23);
      // terrario geométrico: vidrio de atrás
      const out = 'M10 59L5 40L17 15H39L51 40L46 59Z';
      s += shade(out, '#E3F2F8', 0.42);
      // capas: piedritas, tierra y musgo
      s += flat('M6.6 46.6H49.4L46 58.6H10Z', '#C9C2D0') + dots([[12, 52], [19, 55], [27, 52.6], [35, 55.4], [43, 52]], 1.3, '#A8A0B4');
      s += flat('M5.8 43.4H50.2L49.4 47H6.6Z', '#7A5A44');
      s += part('M6.4 43.6C10 38.6 19 37.6 28 39.4C37 37.6 46 38.6 49.6 43.6C42 46 14 46 6.4 43.6Z', '#86BE6E', { w: 1.3 });
      // plantitas: suculenta, helecho y un hongo rojo
      s += spoon(17.4, 40.4, 9.4, -152, 3.4, '#76B394') + spoon(20, 40.4, 9.4, -28, 3.4, '#76B394') + spoon(18.7, 40.4, 10, -90, 3.4, '#96CFAF');
      s += line('M37 41C37 34 38 28 42 24', '#5BAA5C', 1.6);
      s += leaf(37.6, 36, 6, -160, 2, '#6CB577') + leaf(38.4, 31, 5.4, -20, 1.8, '#6CB577') + leaf(39.6, 27, 4.6, -150, 1.6, '#86C49A') + leaf(37.2, 38.6, 6, -10, 2, '#86C49A');
      s += face(rr(28.4, 37, 2.2, 4.4, 1), '#FFF6E8', { w: 0.9 }) + part('M25.6 37.4C25.6 33.4 33.4 33.4 33.4 37.4Z', '#E8505E', { w: 1.1 }) + dots([[28, 35.4], [31.2, 36]], 0.7, '#FFFFFF');
      // marco de bronce y brillos del vidrio
      s += line(out, mf.side, 1.8) + line('M5 40H51M17 15L13 40L10 59M39 15L43 40L46 59', F, 1.3);
      s += part(ellD(28, 13, 2.2, 1.8), F, { w: 1 }) + line('M28 13V15', mf.side, 1.4);
      s += shine('M9.6 38.6L17 23.4L18.4 24.2L11.4 39Z', { opacity: 0.65 }) + shine('M42 22L44 26L43 26.4L41 22.4Z', { opacity: 0.5 });
      return s;
    },
  },
];
