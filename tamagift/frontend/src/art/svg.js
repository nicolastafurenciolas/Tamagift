// Mini ayudantes para escribir SVG como texto (el arte nuevo se arma
// como string: los kits de estilo lo leen y lo redibujan).

const n = (v) => (typeof v === 'number' ? +v.toFixed(2) : v);
export const attrs = (o) => Object.entries(o)
  .filter(([, v]) => v != null && v !== false)
  .map(([k, v]) => `${k}="${n(v)}"`).join(' ');
export const E = (tag, o = {}, inner) => (inner == null ? `<${tag} ${attrs(o)}/>` : `<${tag} ${attrs(o)}>${inner}</${tag}>`);
export const G = (o, inner) => E('g', o, inner);
export const P = (d, o = {}) => E('path', { d, ...o });
export const Ell = (cx, cy, rx, ry, o = {}) => E('ellipse', { cx, cy, rx, ry, ...o });
export const Cir = (cx, cy, r, o = {}) => E('circle', { cx, cy, r, ...o });
export const R = (x, y, width, height, o = {}) => E('rect', { x, y, width, height, ...o });
export const svgDoc = (w, h, inner, extra = {}) => E('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${w} ${h}`, width: w, height: h, ...extra }, inner);
// Espeja una pieza de la izquierda a la derecha alrededor de x = cx.
export const mirrorX = (inner, cx = 100) => G({ transform: `translate(${cx * 2} 0) scale(-1 1)` }, inner);
export const f = (v) => +v.toFixed(2);
