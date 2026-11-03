// Herramientas para dibujar ropa y accesorios sobre la mochi.
//
// Todo se ancla a la geometría del cuerpo (art/mochi/body.js): la línea
// del cuello, la coronilla, la altura de los ojos, el ancho a cada altura.
// Así una prenda queda bien puesta en los cuatro anchos y también cuando
// la mochi está redondita.
//
// La mochi no tiene brazos ni cintura: la ropa es la parte de abajo del
// cuerpo vestida. Para que se lea como TELA y no como una franja de color:
//   · el escote, la cintura y el ruedo son curvas "sonrisa" (la cámara
//     mira un poco desde arriba: lo que da la vuelta al cuerpo se curva
//     hacia abajo en el centro);
//   · debajo de cada borde (cuello, cinturón, volante) hay una sombrita;
//   · la prenda se oscurece hacia la derecha y abajo, como el cuerpo
//     (en pixel lo hace `roundShade`; los otros estilos ya dan volumen);
//   · costuras, ribetes, botones con brillo y estampados que siguen la
//     curva.

import { G, P, Ell, Cir, E } from '../../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../../color.js';

export { G, P, Ell, Cir, E };
export const OUT = '#3A2A3E';
export const GOLD = '#FFD166', GOLD_D = '#B0782A', SILVER = '#DCE1EA', SILVER_D = '#7C8496', PEARL = '#FBF5EC', PEARL_D = '#B8A890';
export const BOTTOM = 182;
const SHADOW = '#2A1C30';

export const shade = (c, k) => hex(ramp(parseColor(c), k));
export const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
export const lumOf = (c) => lum(parseColor(c));
export const isPale = (c) => lum(parseColor(c)) > 0.8;
export const isDarkC = (c) => lum(parseColor(c)) < 0.22;
export const f = (n) => (+n).toFixed(1);
export const T = (x, y, rot = 0, s = 1) => `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${(+s).toFixed(3)})`;

// Color para costuras, pliegues y vetas sobre una tela: en telas oscuras
// una raya más clara (si no, no se ve); en las claras, más oscura.
export const seamOf = (c, k = 1) => (lumOf(c) < 0.18 ? mixc(c, '#FFFFFF', 0.22 * k + 0.08) : shade(c, -1.1 * k));
// Un tono de luz de la tela (canto de arriba, brillo de un pliegue).
export const lightOf = (c, k = 1) => (lumOf(c) > 0.85 ? '#FFFFFF' : shade(c, 0.9 * k));
// Un acento que contraste con la tela (para ribetes por defecto).
export const contrastOf = (c) => (lumOf(c) > 0.55 ? shade(c, -1.6) : mixc(c, '#FFFFFF', 0.7));

// Roles (ver art/kit.js)
export const part = (d, fill, o = {}) => P(d, { fill, stroke: OUT, 'stroke-width': 2.3, 'stroke-linejoin': 'round', 'data-r': 'part', ...o });
export const flat = (d, fill, o = {}) => P(d, { fill, 'data-r': 'flat', ...o });
export const line = (d, stroke, w = 1.8, o = {}) => P(d, { fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line', ...o });
export const shine = (x, y, r, o = {}) => Cir(x, y, r, { fill: '#FFFFFF', 'data-r': 'shine', ...o });
export const tone = (d, fill, op, o = {}) => P(d, { fill, opacity: op, 'data-r': 'tone', ...o });
export const dot = (x, y, r, fill, o = {}) => Cir(x, y, r, { fill, 'data-r': 'flat', ...o });
export const ball = (x, y, r, fill, o = {}) => Cir(x, y, r, { fill, stroke: OUT, 'stroke-width': 1.8, 'data-r': 'part', ...o });
export const ellD = (x, y, rx, ry) => `M${f(x - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x + rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x - rx)} ${f(y)}Z`;
export const disc = (x, y, rx, ry, fill, o = {}) => P(ellD(x, y, rx, ry), { fill, stroke: OUT, 'stroke-width': 2.3, 'data-r': 'part', ...o });
// Costura: puntada cortada (en pixel queda un píxel sí y uno no).
export const stitch = (d, col, w = 1.3, o = {}) => line(d, col, w, { 'stroke-dasharray': '2.2 2.2', 'stroke-linecap': 'butt', ...o });
// Solo en pixel / en todos menos pixel.
export const onlyPx = (inner) => G({ 'data-only': 'pixel' }, inner);
export const skipPx = (inner) => G({ 'data-skip': 'pixel' }, inner);
// Tira fina: con contorno en los estilos vectoriales; en pixel lisa (el
// contorno de 1 px por dentro de algo de 2-3 px lo vuelve gris).
export const strip = (d, fill, o = {}) => skipPx(part(d, fill, o)) + onlyPx(flat(d, fill));

export const heartD = (x, y, s) => `M${f(x)} ${f(y + s * 0.85)} C${f(x - s * 1.1)} ${f(y + s * 0.1)} ${f(x - s * 1.05)} ${f(y - s * 0.95)} ${f(x)} ${f(y - s * 0.35)} C${f(x + s * 1.05)} ${f(y - s * 0.95)} ${f(x + s * 1.1)} ${f(y + s * 0.1)} ${f(x)} ${f(y + s * 0.85)}Z`;
export function starD(x, y, r, inner = 0.48) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)}`;
  }
  return `${d}Z`;
}
// Estrella regordeta (puntas redondeadas): se lee mejor en chiquito.
export function puffStarD(x, y, r, inner = 0.55) {
  let d = '';
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  for (let i = 0; i < 10; i += 2) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % 10], [cx, cy] = pts[(i + 2) % 10];
    if (!i) d += `M${f((pts[9][0] + ax) / 2)} ${f((pts[9][1] + ay) / 2)}`;
    d += ` Q${f(ax)} ${f(ay)} ${f((ax + bx) / 2)} ${f((ay + by) / 2)} Q${f(bx)} ${f(by)} ${f((bx + cx) / 2)} ${f((by + cy) / 2)}`;
  }
  return `${d}Z`;
}
export const sparkleD = (x, y, r) => `M${f(x)} ${f(y - r)} Q${f(x + r * 0.16)} ${f(y - r * 0.16)} ${f(x + r)} ${f(y)} Q${f(x + r * 0.16)} ${f(y + r * 0.16)} ${f(x)} ${f(y + r)} Q${f(x - r * 0.16)} ${f(y + r * 0.16)} ${f(x - r)} ${f(y)} Q${f(x - r * 0.16)} ${f(y - r * 0.16)} ${f(x)} ${f(y - r)}Z`;
export const moonD = (x, y, r) => `M${f(x + r * 0.25)} ${f(y - r)} A${f(r)} ${f(r)} 0 1 0 ${f(x + r * 0.25)} ${f(y + r)} A${f(r * 0.78)} ${f(r * 0.78)} 0 1 1 ${f(x + r * 0.25)} ${f(y - r)}Z`;
// Rectángulo redondeado como path.
export function rr(x, y, w, h, r = 0) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (!r) return `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + r)}V${f(y + h - r)}Q${f(x + w)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)}H${f(x + r)}Q${f(x)} ${f(y + h)} ${f(x)} ${f(y + h - r)}V${f(y + r)}Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)}Z`;
}

let seq = 0;
export const nid = (p) => `${p}${++seq}`;

// Corre un path de comandos absolutos (M L C Q S T H V A Z) en (dx, dy);
// los relativos (minúsculas) no se tocan, salvo que empiece con m.
export function shiftPath(d, dx, dy) {
  const toks = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let out = '', cmd = '', k = 0;
  for (const t of toks) {
    if (/[A-Za-z]/.test(t)) { cmd = t; k = 0; out += t; continue; }
    const v = +t;
    let nv = v;
    if (cmd === 'A') { const j = k % 7; if (j === 5) nv = v + dx; else if (j === 6) nv = v + dy; }
    else if (cmd === 'H') nv = v + dx;
    else if (cmd === 'V') nv = v + dy;
    else if (/[MLCQST]/.test(cmd)) nv = k % 2 ? v + dy : v + dx;
    out += `${k ? ' ' : ''}${+nv.toFixed(2)}`;
    k++;
  }
  return out;
}

// Volumen redondo para pixel: media luna de sombra abajo a la derecha
// (lo que queda afuera al correr la silueta hacia la luz), igual que el
// cuerpo. Los otros estilos ya le dan volumen a cada parte.
export function roundShade(d, fill, { ox = 7, oy = 9, op = 0.3, clipD } = {}) {
  const c = shade(fill, -3);
  const box = 'M-50 -50H260V260H-50Z';
  const one = (k, a) => tone(`${box} ${shiftPath(d, -ox * k, -oy * k)}`, c, a, { 'fill-rule': 'evenodd' });
  const id = nid('rsh');
  return onlyPx(E('clipPath', { id }, P(clipD || d)) + G({ 'clip-path': `url(#${id})` }, one(2, op * 0.75) + one(1, op * 0.8)));
}

// Moño de cinta (centro en 0,0; `s` escala): lazadas infladas, el
// interior de cada lazada en sombra, pliegues que salen del nudo, nudo
// con su arruga y colas con corte en V.
export function bow(x, y, rot, s, col, tails = true) {
  const o = shade(col, -2.2), dk = shade(col, -0.9), lt = lightOf(col);
  const big = s >= 0.75;
  return G({ transform: T(x, y, rot, s) },
    (tails ? part('M-3 2 L-10 17 L-4.5 14 L-1 18.5 L1 3Z M2 2 L10 16.5 L4.5 14 L1.5 18.5Z', shade(col, -0.5), { stroke: o })
      + (big ? flat('M-2 4 L-6 13 L-4.5 14 L-1 6Z M3 4 L7 13 L4.5 14 L2 6Z', shade(col, -1.1)) : '') : '')
    + part('M0 0 C-6 -11 -21 -12 -21 -1 C-21 10 -7 8 0 0Z M0 0 C6 -11 21 -12 21 -1 C21 10 7 8 0 0Z', col, { stroke: o })
    + flat('M-3 0 C-6 -5 -12 -5 -13 -1 C-10 1 -6 2 -3 0Z M3 0 C6 -5 12 -5 13 -1 C10 1 6 2 3 0Z', dk)
    + (big ? line('M-5 3 Q-11 6 -16 4 M5 3 Q11 6 16 4', dk, 1.3, { opacity: 0.9 }) : '')
    + line('M-17 -4 C-14 -8 -9 -7 -7 -4 M17 -4 C14 -8 9 -7 7 -4', lt, 1.7, { opacity: 0.85 })
    + Ell(0, 0, 4.8, 5.6, { fill: shade(col, 0.35), stroke: o, 'stroke-width': 2.2, 'data-r': 'part' })
    + (big ? line('M-1.4 -3 Q0.6 0 -1.4 3', dk, 1.1) : ''));
}

// Flor de cinco pétalos redondeados con su centro.
export function flower(x, y, r, col, rot = 0, center = '#FFE070') {
  let s = '';
  const st = shade(col, -2.2);
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 + rot - 90) * Math.PI) / 180;
    const px = x + Math.cos(a) * r * 0.58, py = y + Math.sin(a) * r * 0.58;
    s += P(ellD(px, py, r * 0.52, r * 0.46), { fill: col, stroke: st, 'stroke-width': 1.1, 'data-r': 'part', transform: `rotate(${f(k * 72 + rot)} ${f(px)} ${f(py)})` });
  }
  return s + Cir(x, y, r * 0.36, { fill: center, stroke: shade(center, -2), 'stroke-width': 1, 'data-r': 'part' });
}

// Banda que sigue el borde de arriba de la cabeza (diademas, cintillos),
// con su canto de luz.
export function headband(g, hw, dy0, dy1, col, n = 16, { lit = true } = {}) {
  const pts = (dy) => { const out = []; for (let i = 0; i <= n; i++) { const x = 100 - hw + (2 * hw * i) / n; out.push([x, g.topAt(x) + dy]); } return out; };
  const a = pts(dy0), b = pts(dy1).reverse();
  const d = `M${a.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} L${b.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}Z`;
  const hl = pts(dy0 + (dy1 - dy0) * 0.3).slice(Math.round(n * 0.12), Math.round(n * 0.55));
  return part(d, col) + (lit && dy1 - dy0 >= 5 ? line(`M${hl.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}`, lightOf(col, 1.2), 1.5, { opacity: 0.9 }) : '');
}

// Lo que se pone sobre la cabeza: posición y giro sobre el borde en x.
export const onTop = (g, xFrac, sink = 0) => {
  const x = 100 + g.w * xFrac;
  return { x, y: g.topAt(x) + sink, rot: g.tiltAt(x) };
};

// ── Ropa ─────────────────────────────────────────────────────────
// Una prenda cubre el cuerpo desde el escote para abajo (recortada a la
// silueta). El escote baja más en el centro (debajo de la boca) que a
// los costados, como un cuello redondo.
export function neckLine(g, { side = 6, center = 25, v = false } = {}) {
  const fy = g.face.y;
  const ys = fy + side, yc = fy + center;
  const L = g.l - 10, R = g.r + 10;
  return v
    ? { d: `M${f(L)} ${f(ys)} L100 ${f(yc + 6)} L${f(R)} ${f(ys)}`, ys, yc, v, L, R }
    : { d: `M${f(L)} ${f(ys)} Q100 ${f(yc + (yc - ys) * 0.95)} ${f(R)} ${f(ys)}`, ys, yc, v, L, R };
}
// Y del escote en x.
export function neckYAt(g, nl, x) {
  const L = g.l - 10, R = g.r + 10;
  if (nl.v) {
    const t = Math.abs(x - 100) / (100 - L);
    return nl.yc + 6 + (nl.ys - nl.yc - 6) * Math.min(1, t);
  }
  const u = (x - L) / (R - L);
  const c = nl.yc + (nl.yc - nl.ys) * 0.95;
  return (1 - u) * (1 - u) * nl.ys + 2 * (1 - u) * u * c + u * u * nl.ys;
}
// El escote corrido `dy` hacia abajo (abierto, para trazos).
export function neckCurve(g, nl, dy = 0) {
  const L = g.l - 10, R = g.r + 10;
  if (nl.v) return `M${f(L)} ${f(nl.ys + dy)} L100 ${f(nl.yc + 6 + dy)} L${f(R)} ${f(nl.ys + dy)}`;
  const c = nl.yc + (nl.yc - nl.ys) * 0.95;
  return `M${f(L)} ${f(nl.ys + dy)} Q100 ${f(c + dy)} ${f(R)} ${f(nl.ys + dy)}`;
}
// Banda que sigue el escote (cuello del suéter, ribete).
export function neckBand(g, nl, w, fill, { lit = true } = {}) {
  const L = g.l - 10, R = g.r + 10;
  let d;
  if (nl.v) d = `M${f(L)} ${f(nl.ys)} L100 ${f(nl.yc + 6)} L${f(R)} ${f(nl.ys)} L${f(R)} ${f(nl.ys + w)} L100 ${f(nl.yc + 6 + w * 1.4)} L${f(L)} ${f(nl.ys + w)}Z`;
  else {
    const c = nl.yc + (nl.yc - nl.ys) * 0.95;
    d = `M${f(L)} ${f(nl.ys)} Q100 ${f(c)} ${f(R)} ${f(nl.ys)} L${f(R)} ${f(nl.ys + w)} Q100 ${f(c + w)} ${f(L)} ${f(nl.ys + w)}Z`;
  }
  return part(d, fill) + (lit && w >= 4 ? line(neckCurve(g, nl, w * 0.32), lightOf(fill), 1.3, { opacity: 0.75 }) : '');
}
// Sombrita debajo del escote (o de una banda de ancho `from`): la tela
// de arriba hace sombra sobre la de abajo.
export function neckShadow(g, nl, from = 0, w = 4, op = 0.2) {
  const L = g.l - 10, R = g.r + 10;
  if (nl.v) return tone(`M${f(L)} ${f(nl.ys + from)} L100 ${f(nl.yc + 6 + from * 1.4)} L${f(R)} ${f(nl.ys + from)} L${f(R)} ${f(nl.ys + from + w)} L100 ${f(nl.yc + 6 + from * 1.4 + w)} L${f(L)} ${f(nl.ys + from + w)}Z`, SHADOW, op);
  const c = nl.yc + (nl.yc - nl.ys) * 0.95;
  return tone(`M${f(L)} ${f(nl.ys + from)} Q100 ${f(c + from)} ${f(R)} ${f(nl.ys + from)} L${f(R)} ${f(nl.ys + from + w)} Q100 ${f(c + from + w)} ${f(L)} ${f(nl.ys + from + w)}Z`, SHADOW, op);
}
// Rayitas de tejido elástico entre el escote corrido dy0 y dy1.
export function neckRibs(g, nl, dy0, dy1, col, step = 4.5) {
  let d = '';
  for (let x = g.l - 6; x <= g.r + 6; x += step) {
    const y = neckYAt(g, nl, x);
    d += `M${f(x)} ${f(y + dy0)} V${f(y + dy1)}`;
  }
  return line(d, col, 1.2, { opacity: 0.8 });
}

// Curva "sonrisa" que da la vuelta al cuerpo a la altura y (más baja
// en el centro). `sag`: cuánto baja en el centro.
export const smileD = (x1, x2, y, sag = 4) => `M${f(x1)} ${f(y)} Q100 ${f(y + sag * 2)} ${f(x2)} ${f(y)}`;
export const bandD = (x1, x2, y, h, sag = 4) => `M${f(x1)} ${f(y)} Q100 ${f(y + sag * 2)} ${f(x2)} ${f(y)} L${f(x2)} ${f(y + h)} Q100 ${f(y + h + sag * 2)} ${f(x1)} ${f(y + h)}Z`;
// Y de la sonrisa en x.
export const smileYAt = (x1, x2, y, sag, x) => { const u = (x - x1) / (x2 - x1); return y + sag * 4 * u * (1 - u); };

// Prenda base: relleno desde el escote, recortado al cuerpo, con el
// contorno del cuerpo redibujado encima (la prenda no lo tapa).
// `pattern` (textura, estampado) queda recortado a la tela; `extra` va
// encima; `top` encima de la sombra de volumen.
export function garment(g, fill, { side = 6, center = 25, v = false, pattern = '', extra = '', top = '', round = true } = {}) {
  const id = nid('gw');
  const nl = neckLine(g, { side, center, v });
  const region = `${nl.d} L${f(g.r + 10)} 196 L${f(g.l - 10)} 196Z`;
  return {
    region,
    nl,
    svg: E('clipPath', { id }, P(g.path))
      + G({ 'clip-path': `url(#${id})` },
        part(region, fill)
        + (pattern ? clipTo(region, pattern) : '')
        + extra
        + (round ? roundShade(g.path, fill, { ox: g.w * 0.05, oy: (BOTTOM - g.top) * 0.09, clipD: region }) : '')
        + top
        + P(g.path, { fill: 'none', stroke: OUT, 'stroke-width': 2.8, 'data-r': 'line' })),
  };
}

// Recorta algo a la silueta del cuerpo.
export function clipBody(g, inner) {
  const id = nid('cb');
  return E('clipPath', { id }, P(g.path)) + G({ 'clip-path': `url(#${id})` }, inner);
}
// Recorta algo a una forma cualquiera.
export function clipTo(d, inner) {
  const id = nid('ct');
  return E('clipPath', { id }, P(d)) + G({ 'clip-path': `url(#${id})` }, inner);
}

// Altura y ancho del cuerpo a la altura y.
export const halfAt = (g, y) => g.chordAt(y) / 2;

// Botón cosido: redondo, con brillo (y sus agujeritos si es grande).
export function button(x, y, r, col, o = {}) {
  const st = o.stroke || shade(col, -2.4);
  return Cir(x, y, r, { fill: col, stroke: st, 'stroke-width': Math.min(1.6, r * 0.55), 'data-r': 'part' })
    + (r >= 2.6 ? skipPx(dot(x - r * 0.3, y + r * 0.1, r * 0.2, st) + dot(x + r * 0.3, y + r * 0.1, r * 0.2, st)) : '')
    + shine(x - r * 0.35, y - r * 0.4, Math.max(0.6, r * 0.32));
}

// Falda con vuelo desde `yW` hasta el borde de abajo, un poco más ancha
// que el cuerpo. `scallop` la termina en ondas; `pleats` son tablas
// (paños alternados de luz y sombra con su raya); `folds` son pliegues
// blandos (godets) que se abren hacia el ruedo.
export function skirtPath(g, yW, { flare = 9, scallop = 0, hem = BOTTOM + 3, sag = 2, waist = 1 } = {}) {
  const hw = g.chordAt(yW) / 2 + waist;
  const L = 100 - hw, R = 100 + hw;
  const xl = g.l - flare, xr = g.r + flare;
  let bottom = '';
  if (scallop) {
    const n = scallop;
    for (let i = n; i >= 1; i--) {
      const x1 = xl + ((xr - xl) * (i - 1)) / n, xm = (x1 + xl + ((xr - xl) * i) / n) / 2;
      bottom += ` Q${f(xm)} ${f(hem + 7 + smileYAt(xl, xr, 0, 2, xm))} ${f(x1)} ${f(hem + smileYAt(xl, xr, 0, 2, x1))}`;
    }
  } else bottom = ` Q100 ${f(hem + 8)} ${f(xl)} ${f(hem)}`;
  return `M${f(L)} ${f(yW)} Q100 ${f(yW + sag * 2)} ${f(R)} ${f(yW)} C${f(R + flare * 0.3)} ${f(yW + 14)} ${f(xr)} ${f(hem - 14)} ${f(xr)} ${f(hem)}${bottom} C${f(xl)} ${f(hem - 14)} ${f(L - flare * 0.3)} ${f(yW + 14)} ${f(L)} ${f(yW)}Z`;
}
export function skirt(g, yW, fill, o = {}) {
  const { flare = 9, pleats = 0, folds = 0, hem = BOTTOM + 3, sag = 2, waist = 1 } = o;
  const hw = g.chordAt(yW) / 2 + waist;
  const L = 100 - hw, R = 100 + hw;
  const xl = g.l - flare, xr = g.r + flare;
  const d = skirtPath(g, yW, o);
  let inner = '';
  const dk = seamOf(fill), sh = shade(fill, -2.6);
  const n = pleats || folds;
  if (n) {
    // líneas de pliegue del talle al ruedo
    const at = (t) => [L + (R - L) * t, xl + (xr - xl) * t];
    let lines = '';
    for (let i = 1; i < n; i++) {
      const [xt, xb] = at(i / n);
      lines += `M${f(xt)} ${f(smileYAt(L, R, yW, sag, xt) + 2)} Q${f((xt + xb) / 2 + (xb - xt) * 0.1)} ${f((yW + hem) / 2)} ${f(xb)} ${f(hem + 6)}`;
      // paños en sombra: uno sí, uno no (tablas) o al costado de cada pliegue (godets)
      if (pleats ? i % 2 : true) {
        const [xt2, xb2] = at((i + (pleats ? 1 : 0.42)) / n);
        inner += tone(`M${f(xt)} ${f(yW)} L${f(xt2)} ${f(yW)} L${f(xb2)} ${f(hem + 10)} L${f(xb)} ${f(hem + 10)}Z`, sh, pleats ? 0.16 : 0.13);
      }
    }
    inner += line(lines, dk, 1.3, { opacity: 0.85 });
  }
  // sombra bajo la cintura
  inner += tone(bandD(L - 4, R + 4, yW - 1, 3.5, sag), SHADOW, 0.18);
  // puntilla cosida en el ruedo (solo con ruedo liso)
  const trim = o.trim && !o.scallop ? laceAlong(xl + 1.5, xr - 1.5, (x) => smileYAt(xl, xr, hem, 4, x) - 1.2, o.trimR || 3, o.trim, { band: 0.55 }) : '';
  return part(d, fill) + clipTo(d, inner + roundShade(d, fill, { ox: (xr - xl) * 0.04, oy: (hem - yW) * 0.14 })) + trim;
}

// Puntilla / encaje: una tira con el borde de abajo en ondas (cada onda
// con su ojal) que cuelga de una curva `yAt(x)`.
export function laceAlong(x1, x2, yAt, r, col, { holes = true, n, band = 0.5 } = {}) {
  const cnt = n || Math.max(3, Math.round((x2 - x1) / (r * 2)));
  const step = (x2 - x1) / cnt;
  let top = '';
  for (let i = 0; i <= cnt * 2; i++) { const x = x1 + (step * i) / 2; top += `${i ? 'L' : 'M'}${f(x)} ${f(yAt(x))}`; }
  let bot = ` L${f(x2)} ${f(yAt(x2) + r * band)}`;
  for (let i = cnt; i >= 1; i--) { const x = x1 + step * (i - 1); bot += ` A${f(step / 2)} ${f(r * 0.95)} 0 0 1 ${f(x)} ${f(yAt(x) + r * band)}`; }
  let h = '';
  if (holes) for (let i = 0; i < cnt; i++) { const x = x1 + step * (i + 0.5); h += dot(x, yAt(x) + r * (band + 0.35), Math.max(0.6, r * 0.24), shade(col, -1.3)); }
  // en pixel: tira lisa (sin contorno por dentro, que la ensucia) y una
  // línea suave solo por el borde de las ondas
  return skipPx(part(`${top}${bot}Z`, col, { stroke: shade(col, -2.4), 'stroke-width': 1.2 }) + h)
    + onlyPx(flat(`${top}${bot}Z`, col) + line(`M${bot.trim().slice(1)}`, shade(col, -1.6), 1.3));
}
export const lace = (x1, x2, y, sag, r, col, o = {}) => laceAlong(x1, x2, (x) => smileYAt(x1, x2, y, sag, x), r, col, o);

// Borde de piel blanca (gorros y vestidos de invierno): ondulado y
// esponjoso por arriba y por abajo, con mechoncitos y su sombra. Sigue
// una curva `yAt(x)` (el borde de arriba).
export function furAlong(x1, x2, yAt, h, n = 7, col = '#FFFFFF') {
  const step = (x2 - x1) / n;
  let top = `M${f(x1)} ${f(yAt(x1) + h * 0.5)}`, bot = '';
  for (let i = 0; i < n; i++) { const xm = x1 + step * (i + 0.5), xe = x1 + step * (i + 1); top += ` Q${f(xm)} ${f(yAt(xm) - 2.2)} ${f(xe)} ${f(yAt(xe) + h * 0.12)}`; }
  bot += ` L${f(x2)} ${f(yAt(x2) + h * 0.88)}`;
  for (let i = n; i > 0; i--) { const xm = x1 + step * (i - 0.5), xe = x1 + step * (i - 1); bot += ` Q${f(xm)} ${f(yAt(xm) + h + 2.2)} ${f(xe)} ${f(yAt(xe) + h * 0.88)}`; }
  const d = `${top}${bot}Z`;
  let tufts = '';
  for (let i = 0; i < n; i++) { const x = x1 + step * (i + 0.72); tufts += `M${f(x)} ${f(yAt(x) + h * 0.3)} q1.6 ${f(h * 0.25)} 0 ${f(h * 0.5)}`; }
  const shadeCol = mixc(col, '#6F80A8', 0.4);
  return part(d, col, { stroke: mixc(col, '#5A6A8A', 0.55), 'stroke-width': 1.8 })
    + clipTo(d, tone(`M${f(x1 - 4)} ${f(yAt(x1) + h * 0.62)} ${Array.from({ length: 9 }, (_, i) => { const x = x1 + ((x2 - x1) * i) / 8; return `L${f(x)} ${f(yAt(x) + h * 0.62)}`; }).join(' ')} L${f(x2 + 4)} ${f(yAt(x2) + h + 6)} L${f(x1 - 4)} ${f(yAt(x1) + h + 6)}Z`, shadeCol, 0.35))
    + skipPx(line(tufts, mixc(col, '#8C9CC0', 0.3), 1.3));
}
export const furBand = (x1, x2, y, h, n = 7, col = '#FFFFFF') => furAlong(x1, x2, () => y, h, n, col);

// ── Sombreros ────────────────────────────────────────────────────
// Ala en perspectiva (vista 3/4): elipse aplastada con su canto de
// adelante (el grosor se ve como una media luna más oscura abajo).
export function brim(cx, cy, rx, ry, col, { th = 2.6, stroke = OUT } = {}) {
  const under = `M${f(cx - rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy)} L${f(cx + rx)} ${f(cy + th)} A${f(rx)} ${f(ry)} 0 0 1 ${f(cx - rx)} ${f(cy + th)}Z`;
  return part(under, shade(col, -0.9), { stroke })
    + part(ellD(cx, cy, rx, ry), col, { stroke })
    + line(`M${f(cx - rx * 0.78)} ${f(cy - ry * 0.35)} A${f(rx * 0.86)} ${f(ry * 0.8)} 0 0 1 ${f(cx - rx * 0.1)} ${f(cy - ry * 0.86)}`, lightOf(col, 0.8), 1.5, { opacity: 0.8 });
}
// Copa redondeada sobre un ala: de (cx ± w/2, cy) sube h, con su cinta.
export function crown(cx, cy, w, h, col, { band, bandH = 5, dent = 0, stroke = OUT, round = 0.55 } = {}) {
  const x1 = cx - w / 2, x2 = cx + w / 2, top = cy - h;
  const d = `M${f(x1)} ${f(cy)} C${f(x1 - 1)} ${f(cy - h * round)} ${f(cx - w * 0.36)} ${f(top)} ${f(cx)} ${f(top + dent)} C${f(cx + w * 0.36)} ${f(top)} ${f(x2 + 1)} ${f(cy - h * round)} ${f(x2)} ${f(cy)} Q${f(cx)} ${f(cy + w * 0.12)} ${f(x1)} ${f(cy)}Z`;
  let s = part(d, col, { stroke }) + clipTo(d, tone(`M${f(cx + w * 0.18)} ${f(top - 2)} C${f(x2 + 6)} ${f(top)} ${f(x2 + 4)} ${f(cy)} ${f(x2)} ${f(cy + 4)} L${f(x2 + 8)} ${f(cy + 8)} L${f(x2 + 8)} ${f(top - 4)}Z`, '#2A1C30', 0.16))
    + line(`M${f(x1 + w * 0.14)} ${f(cy - h * 0.35)} C${f(x1 + w * 0.12)} ${f(cy - h * 0.7)} ${f(cx - w * 0.22)} ${f(top + h * 0.12)} ${f(cx - w * 0.06)} ${f(top + h * 0.1)}`, lightOf(col, 0.8), 1.6, { opacity: 0.75 });
  if (band) s += clipTo(d, part(`M${f(x1 - 2)} ${f(cy - bandH)} Q${f(cx)} ${f(cy - bandH + w * 0.12)} ${f(x2 + 2)} ${f(cy - bandH)} L${f(x2 + 2)} ${f(cy + 2)} Q${f(cx)} ${f(cy + w * 0.12 + 2)} ${f(x1 - 2)} ${f(cy + 2)}Z`, band, { stroke })) + P(d, { fill: 'none', stroke, 'stroke-width': 2.3, 'data-r': 'line' });
  return s;
}
// Escala de lo que va en la cabeza según el ancho del cuerpo.
export const headScale = (g) => Math.max(0.8, Math.min(1.12, g.w / 144));

// ── Cuello ───────────────────────────────────────────────────────
// La línea del cuello: una curva que da la vuelta al cuerpo debajo de
// la boca (baja `drop` en el centro). Collares, cadenas y cintas la
// siguen, recortados a la silueta; lo que cuelga, cuelga de `cy`.
export function neckGeo(g, { dy = 0, drop = 7 } = {}) {
  const y = g.neckY - 2 + dy, L = g.l - 6, R = g.r + 6;
  const yAt = (x) => { const u = (x - L) / (R - L); return y + drop * 4 * u * (1 - u); };
  return {
    y, drop, L, R, cy: y + drop, yAt,
    d: `M${f(L)} ${f(y)} Q100 ${f(y + drop * 2)} ${f(R)} ${f(y)}`,
    band: (th, off = 0) => `M${f(L)} ${f(y + off - th / 2)} Q100 ${f(y + off - th / 2 + drop * 2)} ${f(R)} ${f(y + off - th / 2)} L${f(R)} ${f(y + off + th / 2)} Q100 ${f(y + off + th / 2 + drop * 2)} ${f(L)} ${f(y + off + th / 2)}Z`,
    curve: (off = 0) => `M${f(L)} ${f(y + off)} Q100 ${f(y + off + drop * 2)} ${f(R)} ${f(y + off)}`,
    pt: (t, off = 0) => { const x = L + (R - L) * t; return [x, yAt(x) + off]; },
  };
}
// Cadenita de metal (eslabones insinuados) siguiendo la curva del cuello.
export function chainLine(g, nk, col = GOLD, w = 2.2) {
  const dk = shade(col, -1.6);
  return clipBody(g, line(nk.d, dk, w + 1.2) + line(nk.d, col, w * 0.7, { 'stroke-dasharray': '2.4 1.4' }));
}
// Argollita que une un dije a la cadena.
export const bail = (x, y, col = GOLD) => P(ellD(x, y, 1.9, 2.4), { fill: 'none', stroke: shade(col, -1.6), 'stroke-width': 1.4, 'data-r': 'line' });
// Escala de lo que cuelga del cuello según el ancho.
export const neckScale = (g) => Math.max(0.85, Math.min(1.12, g.w / 144));
// Luna creciente gordita (se lee en pixel): círculo menos otro corrido
// arriba a la derecha.
export function crescentD(x, y, r, off = 0.5, ir = 0.78) {
  const cx2 = x + off * r * 0.92, cy2 = y - off * r * 0.4, r2 = ir * r;
  const dx = cx2 - x, dy = cy2 - y, dd = Math.hypot(dx, dy);
  const a = (r * r - r2 * r2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, r * r - a * a));
  const mx = x + (a * dx) / dd, my = y + (a * dy) / dd;
  const p1 = [mx + (h * dy) / dd, my - (h * dx) / dd], p2 = [mx - (h * dy) / dd, my + (h * dx) / dd];
  return `M${f(p1[0])} ${f(p1[1])} A${f(r)} ${f(r)} 0 1 0 ${f(p2[0])} ${f(p2[1])} A${f(r2)} ${f(r2)} 0 1 1 ${f(p1[0])} ${f(p1[1])}Z`;
}
