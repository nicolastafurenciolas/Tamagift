// ─────────────────────────────────────────────────────────────────
// Herramientas de dibujo del cuarto.
//
// LA PERSPECTIVA (una sola regla para todo el cuarto):
// cámara de frente, inclinada hacia abajo, sin punto de fuga — la vista
// "3/4" de los juegos de rol clásicos.
//   · La pared se ve de frente, sin deformar.
//   · El piso se aleja hacia el fondo: una profundidad real P ocupa
//     P × DEPTH en pantalla. Las líneas que van hacia el fondo son
//     VERTICALES (no convergen) y las paralelas a la pared, horizontales.
//   · Un mueble muestra su cara de adelante (tamaño real) y, encima, su
//     cara de arriba (profundidad × DEPTH). Nunca caras laterales ni
//     trapecios: así todo el cuarto encaja y en pixel art no hay líneas
//     torcidas.
//   · Un círculo apoyado (maceta, mesa redonda, alfombra) es una elipse
//     con alto = ancho × DEPTH.
//   · La luz viene de arriba a la izquierda: la cara de arriba es la
//     más clara y la de adelante, el color tal cual.
//
// Las piezas llevan su rol (`data-r`) para que cada estilo las dibuje a
// su manera (art/kit.js): face (cara con contorno), part, flat, line,
// tone (sombra o luz transparente), shine.
// ─────────────────────────────────────────────────────────────────

import { E, G, P, R, Ell, Cir, svgDoc, mirrorX } from '../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../color.js';

export const DEPTH = 0.5;
export const INK = '#3A2A3E';
export { E, G, P, R, Ell, Cir, svgDoc, mirrorX };

const rgb = (c) => parseColor(c) || [200, 200, 200, 1];
/** Un tono más claro (k>0) o más oscuro (k<0), con el tono corrido como se pinta a mano. */
export const tone = (c, k) => hex(ramp(rgb(c), k));
export const mix = (a, b, t) => hex(mixRgb(rgb(a), rgb(b), t));
export const isDark = (c) => lum(rgb(c)) < 0.35;

// Paleta de un material: arriba (luz), adelante (base), sombra y hondo.
export function mat(c) {
  return { top: tone(c, 0.75), front: c, side: tone(c, -0.8), deep: tone(c, -1.7), hi: tone(c, 1.5) };
}

const sw = (w) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });

/** Cara de mueble (contorno, sin volumen inventado por los estilos). */
export const face = (d, fill, o = {}) => P(d, { fill, ...sw(o.w || 2.4), 'data-r': 'face', ...o.a });
/** Pieza con contorno (los estilos le pueden dar volumen). */
export const part = (d, fill, o = {}) => P(d, { fill, ...sw(o.w || 2.2), 'data-r': 'part', ...o.a });
/** Detalle pegado encima, sin contorno. */
export const flat = (d, fill, a = {}) => P(d, { fill, 'data-r': 'flat', ...a });
/** Trazo. */
export const line = (d, stroke, w = 2, a = {}) => P(d, { fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line', ...a });
/** Sombra o luz transparente. */
export const shade = (d, fill, op, a = {}) => P(d, { fill, opacity: op, 'data-r': 'tone', ...a });
export const shine = (d, a = {}) => P(d, { fill: '#FFFFFF', 'data-r': 'shine', ...a });

// Rectángulo con esquinas redondeadas como path (los kits recortan y
// rasterizan paths mejor que <rect rx>).
export function rr(x, y, w, h, r = 0) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (!r) return `M${x} ${y}h${w}v${h}h${-w}Z`;
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}
// Solo las esquinas de arriba redondeadas.
export function rrTop(x, y, w, h, r = 0) {
  r = Math.max(0, Math.min(r, w / 2, h));
  return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
}
export const ellD = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

/**
 * Caja apoyada: cara de adelante de (x, y-h) a (x+w, y) y, encima, la de
 * arriba con `d` de profundidad real.
 */
export function box(x, y, w, h, d, color, o = {}) {
  const m = mat(color);
  const dd = d * DEPTH;
  const r = o.r || 0;
  let s = '';
  if (dd > 0) s += face(rrTop(x, y - h - dd, w, dd + Math.min(r, 2), Math.min(r, dd)), o.top || m.top, { w: o.w });
  s += face(r ? rr(x, y - h, w, h, Math.min(r, h / 3)) : rr(x, y - h, w, h, 0), o.front || m.front, { w: o.w });
  if (o.lip !== false && h > 8) s += line(`M${x + 3} ${y - h + 2.2}H${x + w - 3}`, m.hi, 1.6, { opacity: 0.8 });
  return s;
}

/** Interior en sombra de un mueble (el hueco de una biblioteca). */
export const hollow = (c) => mix(tone(c, -1), '#3A2630', 0.55);

/** Sombra de apoyo en el piso (elipse aplastada). */
export const floorShadow = (cx, y, rx, ry) => Ell(cx, y, rx, ry ?? rx * 0.16, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });

/** Cilindro de pie (maceta, pata redonda, lámpara): tapa elíptica + frente. */
export function cylinder(cx, y, rx, h, color, o = {}) {
  const m = mat(color);
  const ry = rx * DEPTH;
  const top = y - h;
  let s = face(`M${cx - rx} ${top}V${y}A${rx} ${ry} 0 0 0 ${cx + rx} ${y}V${top}Z`, o.front || m.front, { w: o.w });
  s += face(ellD(cx, top, rx, ry), o.top || m.top, { w: o.w });
  return s;
}

/** Maceta cónica (más ancha arriba) con tierra. */
export function pot(cx, y, rTop, rBot, h, color, soil = '#5A3E30') {
  const m = mat(color);
  const ryT = rTop * DEPTH, ryB = rBot * DEPTH;
  const top = y - h;
  let s = face(`M${cx - rTop} ${top}L${cx - rBot} ${y - ryB * 0.2}A${rBot} ${ryB} 0 0 0 ${cx + rBot} ${y - ryB * 0.2}L${cx + rTop} ${top}Z`, m.front);
  s += shade(`M${cx + rTop * 0.35} ${top + 2}L${cx + rBot * 0.35} ${y - 2}L${cx + rBot - 1} ${y - ryB * 0.5}L${cx + rTop - 1} ${top + 2}Z`, m.deep, 0.35);
  s += face(rr(cx - rTop - 3, top - 5, rTop * 2 + 6, 9, 3), m.top);
  s += flat(ellD(cx, top - 4.5, rTop - 1, ryT * 0.6), soil);
  return s;
}

/** Patas rectas. */
export function legs(xs, yTop, yBot, w, color) {
  return xs.map((x) => face(rr(x - w / 2, yTop, w, yBot - yTop, Math.min(2, w / 3)), tone(color, -0.5), { w: 2 })).join('');
}

/** Hojas: una lanza curva desde (x,y) con largo, ángulo (grados) y ancho. */
export function leaf(x, y, len, ang, wid, color, o = {}) {
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * wid, ny = Math.cos(a) * wid;
  const bend = o.bend ?? 0.25;
  const mx = x + (ex - x) * 0.5 + nx * bend * 2, my = y + (ey - y) * 0.5 + ny * bend * 2;
  const d = `M${x} ${y}Q${mx + nx} ${my + ny} ${ex} ${ey}Q${mx - nx} ${my - ny} ${x} ${y}Z`;
  const m = mat(color);
  return part(d, color, { w: o.w || 1.8 }) + line(`M${x} ${y}Q${mx} ${my} ${ex} ${ey}`, m.side, 1.2, { opacity: 0.7 });
}

/**
 * Varilla con grosor (tubo) a lo largo de un camino: un polígono relleno
 * con contorno. Una línea gruesa en diagonal, rasterizada en pixel art,
 * sale punteada; un tubo relleno sale sólido.
 */
export function tube(d, width, color, o = {}) {
  if (typeof document === 'undefined') return line(d, color, width);
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(svgNS, 'path');
  el.setAttribute('d', d);
  const host = document.createElementNS(svgNS, 'svg');
  host.appendChild(el);
  host.style.position = 'absolute'; host.style.visibility = 'hidden';
  document.body.appendChild(host);
  let len = 0;
  try { len = el.getTotalLength(); } catch (e) { /* sin largo */ }
  const n = Math.max(2, Math.ceil(len / 6));
  const pts = [];
  for (let i = 0; i <= n; i++) { const pt = el.getPointAtLength((i / n) * len); pts.push([pt.x, pt.y]); }
  host.remove();
  const half = width / 2;
  const left = [], right = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    let dx = bx - ax, dy = by - ay;
    const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    left.push([x - dy * half, y + dx * half]); right.push([x + dy * half, y - dx * half]);
  });
  const poly = [...left, ...right.reverse()].map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';
  return face(poly, color, { w: o.w || 1.6 });
}

/** Una pieza completa: svg con viewBox w×h. */
export const piece = (w, h, inner) => svgDoc(w, h, inner);

// Margen bajo los dibujos que se apoyan: ahí caben la sombra en el piso y
// la base redonda de macetas y lámparas sin que el borde las corte. Quien
// los pone en el cuarto lo descuenta (`foot`), así siguen apoyados en `y`.
export const FOOT = 10;

/** Para quien usa React: <svg> con el contenido ya armado. */
export function asElement(React, markup) {
  const m = markup.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/);
  const vb = (m[1].match(/viewBox="([^"]+)"/) || [])[1];
  return React.createElement('svg', { viewBox: vb, width: '100%', height: '100%', xmlns: 'http://www.w3.org/2000/svg', dangerouslySetInnerHTML: { __html: m[2] } });
}
