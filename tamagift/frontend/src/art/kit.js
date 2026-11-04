// ─────────────────────────────────────────────────────────────────
// Kits de dibujo por estilo.
//
// El arte de la app está escrito como SVG con PARTES con significado:
//   data-r="body"   volumen principal (cuerpo de la mascota)
//   data-r="part"   pieza con contorno (oreja, cola, mueble, sombrero)
//   data-r="flat"   detalle pegado encima, sin contorno (panza, manchas)
//   data-r="line"   trazo (boca, bigotes, costuras)
//   data-r="shine"  brillo blanco
//   data-r="tone"   luz o sombra semitransparente
//   data-px="…"     pieza que en pixel art se reemplaza por un dibujo
//                   hecho a mano píxel a píxel (ojos, bocas, mejillas)
// Si una pieza no dice nada, el rol se deduce (con contorno → part,
// solo trazo → line, transparente → tone, relleno solo → flat).
//
// Cada estilo DIBUJA esas partes a su manera — no filtra una imagen:
//   pixel   rasteriza cada parte en su rejilla, con rampas de color,
//           contorno de 1 px por parte y caras hechas a mano.
//   sticker colores vivos, contorno suave, sombra de celuloide, brillo
//           y borde blanco grueso.
//   lofi    degradados de lámpara, luz cálida en el borde, grano.
//   retro   paleta de los 70, contorno marrón grueso corrido del color
//           (impresión desfasada) y trama de puntos en las sombras.
//   papel   cada parte es una cartulina recortada a tijera, con sombra
//           de capa y fibra de papel.
//   neon    piezas oscuras con tubos de luz del color de cada parte.
// ─────────────────────────────────────────────────────────────────

import { getStyle, COLOR_KEYS } from '../styles/registry.js';
import { parseColor, hex, rgba, mixRgb, ramp, lum, rgbToHsl, hslToRgb, nearestOf, rng, inkOf } from './color.js';
import { stampFor, artStampSizes } from './pixelStamps.js';

const NS = 'http://www.w3.org/2000/svg';
const SKIP = new Set(['defs', 'clipPath', 'mask', 'pattern', 'linearGradient', 'radialGradient', 'filter', 'symbol', 'title', 'desc', 'style', 'metadata', 'marker']);
const GEOM = new Set(['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);

// ── Montaje ──────────────────────────────────────────────────────
function host() {
  let d = document.getElementById('pg-art-scratch');
  if (!d) {
    d = document.createElement('div');
    d.id = 'pg-art-scratch';
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;left:-20000px;top:0;width:10px;height:10px;overflow:hidden;visibility:hidden;pointer-events:none;';
    document.body.appendChild(d);
  }
  return d;
}

function resolveVars(markup, styleId) {
  const s = getStyle(styleId);
  return markup.replace(/var\(--pg-c-([a-zA-Z0-9]+)\)/g, (m, k) => (COLOR_KEYS.includes(k) ? s.ui[k] : '#888888'));
}

let uidN = 0;
const uid = (p) => `${p}${(++uidN).toString(36)}`;

function mount(markup, w, h, fit) {
  const hst = host();
  hst.innerHTML = markup;
  const svg = hst.querySelector('svg');
  if (!svg.getAttribute('viewBox')) {
    const vw = parseFloat(svg.getAttribute('width')) || w, vh = parseFloat(svg.getAttribute('height')) || h;
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  }
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('xmlns', NS);
  if (fit === 'cover') svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.overflow = 'visible';
  // Los ids se renombran para que dos sprites en el mismo documento no
  // choquen (los degradados de uno pintarían al otro).
  const pre = uid('s');
  const ids = svg.querySelectorAll('[id]');
  if (ids.length) {
    const map = {};
    ids.forEach((el) => { map[el.id] = `${pre}${el.id}`; el.id = map[el.id]; });
    svg.querySelectorAll('*').forEach((el) => {
      for (const a of ['fill', 'stroke', 'clip-path', 'mask', 'filter', 'href', 'xlink:href']) {
        const v = el.getAttribute(a);
        if (v && v.includes('#')) el.setAttribute(a, v.replace(/#([A-Za-z0-9_-]+)/g, (m, id) => (map[id] ? `#${map[id]}` : m)));
      }
    });
  }
  return svg;
}

function gradientBase(svg, ref) {
  const id = ref.replace(/^url\(["']?#/, '').replace(/["']?\)$/, '');
  const g = svg.querySelector(`[id="${id}"]`);
  if (!g) return null;
  if (g.tagName === 'pattern') {
    const r = g.querySelector('rect,circle,path,ellipse');
    return r ? parseColor(getComputedStyle(r).fill) : null;
  }
  let stops = [...g.querySelectorAll('stop')];
  if (!stops.length && g.getAttribute('href')) return gradientBase(svg, `url(${g.getAttribute('href')})`);
  if (!stops.length) return null;
  const s = stops[Math.floor((stops.length - 1) / 2 + 0.5)];
  const c = parseColor(s.getAttribute('stop-color') || getComputedStyle(s).stopColor);
  if (c) c[3] *= parseFloat(s.getAttribute('stop-opacity') ?? 1);
  // una luz que se desvanece (opaca → transparente) no es "nada": para
  // decidir su rol cuenta la opacidad promedio
  if (c && c[3] < 0.05) c[3] = stops.reduce((a, t) => a + parseFloat(t.getAttribute('stop-opacity') ?? 1), 0) / stops.length;
  return c;
}

// El degradado completo (para dibujar luces y sombras suaves pieza por
// pieza): tipo, unidades, coordenadas, transformación y paradas, siguiendo
// los `href` que heredan paradas o atributos.
const GRAD_KEYS = ['gradientUnits', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'fx', 'fy', 'gradientTransform'];
function gradSpec(svg, id) {
  let g = svg.querySelector(`[id="${id}"]`);
  if (!g || (g.tagName !== 'linearGradient' && g.tagName !== 'radialGradient')) return null;
  const type = g.tagName;
  const at = {};
  let stops = null;
  for (let n = g, guard = 0; n && guard < 6; guard++) {
    for (const k of GRAD_KEYS) if (at[k] == null && n.getAttribute(k) != null) at[k] = n.getAttribute(k);
    if (!stops) { const s = [...n.querySelectorAll('stop')]; if (s.length) stops = s; }
    const h = n.getAttribute('href') || n.getAttribute('xlink:href');
    n = h ? svg.querySelector(`[id="${h.slice(1)}"]`) : null;
  }
  if (!stops) return null;
  const num = (v, d) => (v == null ? d : v.trim().endsWith('%') ? parseFloat(v) / 100 : parseFloat(v));
  const st = stops.map((s) => {
    const c = parseColor(s.getAttribute('stop-color') || getComputedStyle(s).stopColor) || [0, 0, 0, 1];
    return { o: Math.min(1, Math.max(0, num(s.getAttribute('offset'), 0))), c: [c[0], c[1], c[2], c[3] * parseFloat(s.getAttribute('stop-opacity') ?? 1)] };
  });
  let gt = new DOMMatrix();
  if (at.gradientTransform) {
    const tmp = document.createElementNS(NS, 'g');
    tmp.setAttribute('transform', at.gradientTransform);
    svg.appendChild(tmp);
    const t = tmp.transform.baseVal.consolidate();
    if (t) gt = DOMMatrix.fromMatrix(t.matrix);
    tmp.remove();
  }
  const cx = num(at.cx, 0.5), cy = num(at.cy, 0.5);
  return {
    type, user: at.gradientUnits === 'userSpaceOnUse', gt, stops: st,
    x1: num(at.x1, 0), y1: num(at.y1, 0), x2: num(at.x2, 1), y2: num(at.y2, 0),
    cx, cy, r: num(at.r, 0.5), fx: num(at.fx, cx), fy: num(at.fy, cy),
  };
}

// Copia un degradado con sus colores pasados por `fn` (cada kit tiñe la
// luz a su modo sin perder lo suave). Devuelve la referencia nueva.
function recolorGrad(svg, defs, id, fn) {
  const g = svg.querySelector(`[id="${id}"]`);
  if (!g) return null;
  const c = g.cloneNode(true);
  c.id = uid('rg');
  if (!c.querySelector('stop')) {
    const spec = gradSpec(svg, id);
    if (!spec) return null;
    c.removeAttribute('href'); c.removeAttribute('xlink:href');
    for (const s of spec.stops) c.appendChild(mk('stop', { offset: s.o, 'stop-color': hex(s.c), 'stop-opacity': s.c[3] }));
    for (const k of GRAD_KEYS) { if (c.getAttribute(k) == null && g.getAttribute(k) == null) { /* hereda del original */ } }
  }
  c.querySelectorAll('stop').forEach((s) => {
    const col = parseColor(s.getAttribute('stop-color') || getComputedStyle(s).stopColor);
    if (col) s.setAttribute('stop-color', hex(fn(col)));
    s.removeAttribute('style');
  });
  defs.appendChild(c);
  return `url(#${c.id})`;
}

function readPaint(svg, v) {
  if (!v || v === 'none') return null;
  if (v.startsWith('url(')) return gradientBase(svg, v);
  return parseColor(v);
}

// `data-only="pixel"` dibuja la pieza solo en esos kits; `data-skip`
// la saltea en esos. Sirve para detalles que un estilo dibuja a su modo
// (la luz de la pared: degradado suave en vectorial, bandas en pixel).
function collect(svg, kitName) {
  const items = [];
  const drop = [];
  const walk = (node, ctx) => {
    for (const ch of [...node.children]) {
      const tag = ch.tagName;
      if (SKIP.has(tag)) continue;
      const only = ch.getAttribute('data-only');
      const sk = ch.getAttribute('data-skip');
      if ((only && !only.split(' ').includes(kitName)) || (sk && sk.split(' ').includes(kitName))) { drop.push(ch); continue; }
      const cs = getComputedStyle(ch);
      if (cs.display === 'none') continue;
      const op = ctx.op * parseFloat(cs.opacity || 1);
      const clips = ch.getAttribute('clip-path') ? [...ctx.clips, { ref: ch.getAttribute('clip-path'), el: ch }] : ctx.clips;
      const role = ch.getAttribute('data-r') || ctx.role;
      const skip = ch.getAttribute('data-skip') ? [...ctx.skip, ...ch.getAttribute('data-skip').split(' ')] : ctx.skip;
      const px = ch.getAttribute('data-px') || null;
      if (tag === 'g' || tag === 'svg' || tag === 'a') {
        if (px) { items.push(makeItem(svg, ch, { op, clips, role: 'stamp', px, skip })); continue; }
        walk(ch, { op, clips, role, skip });
      } else if (GEOM.has(tag)) {
        items.push(makeItem(svg, ch, { op, clips, role, px, skip }));
      } else {
        items.push({ el: ch, tag, role: 'raw', clips, op });
      }
    }
  };
  walk(svg, { op: 1, clips: [], role: null, skip: [] });
  drop.forEach((el) => el.remove());
  items.forEach((it, i) => { it.i = i; });
  return items;
}

// ¿Alguien le puso relleno a esta pieza (ella o un grupo de arriba)? Las
// líneas viejas no decían fill y el navegador las rellena de negro.
function explicitFill(el) {
  for (let n = el; n && n.tagName !== 'svg'; n = n.parentElement) {
    if (n.hasAttribute('fill') || (n.style && n.style.fill)) return true;
  }
  return false;
}

function makeItem(svg, el, { op, clips, role, px, skip = [] }) {
  const cs = getComputedStyle(el);
  let fill = readPaint(svg, cs.fill);
  let stroke = readPaint(svg, cs.stroke);
  if (stroke && !explicitFill(el)) fill = null;
  if (fill) fill = [fill[0], fill[1], fill[2], fill[3] * parseFloat(cs.fillOpacity || 1) * op];
  if (stroke) stroke = [stroke[0], stroke[1], stroke[2], stroke[3] * parseFloat(cs.strokeOpacity || 1) * op];
  const sw = stroke ? parseFloat(cs.strokeWidth) || 1 : 0;
  const tag = el.tagName;
  let r = role;
  if (px) r = 'stamp';
  if (!r) {
    if (!fill || tag === 'line' || tag === 'polyline') r = stroke ? 'line' : 'none';
    else if (fill[3] < 0.93) r = 'tone';
    else if (stroke && sw > 0.6 && stroke[3] > 0.5) r = 'part';
    else r = 'flat';
    if (r === 'flat' && fill && lum(fill) > 0.94 && fill[0] > 240 && fill[1] > 240 && fill[2] > 240) {
      try { const b = el.getBBox(); const vb = svg.viewBox.baseVal; if (b.width * b.height < vb.width * vb.height * 0.01) r = 'shine'; } catch (e) { /* sin caja */ }
    }
  }
  if (r === 'line' && !stroke && fill) { stroke = fill; }
  // degradado de verdad (luz o sombra suave): se guarda para dibujarlo
  // entero en vez de un color plano
  const gm = /^url\(["']?#([^"')]+)["']?\)/.exec(cs.fill || '');
  const gEl = gm && svg.querySelector(`[id="${gm[1]}"]`);
  const grad = gEl && (gEl.tagName === 'linearGradient' || gEl.tagName === 'radialGradient') ? gm[1] : null;
  // guiones (costuras, cordones punteados)
  let dash = null;
  if (stroke && cs.strokeDasharray && cs.strokeDasharray !== 'none') {
    const v = cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter((n) => n >= 0);
    if (v.length && v.some((n) => n > 0)) dash = v.length % 2 ? [...v, ...v] : v;
  }
  return {
    el, tag, role: r, fill, stroke, sw, op, clips, px, skip, fillRule: cs.fillRule, cap: cs.strokeLinecap, join: cs.strokeLinejoin,
    grad, gradK: parseFloat(cs.fillOpacity || 1) * op, dash, dashOff: parseFloat(cs.strokeDashoffset) || 0,
  };
}

// ── Utilidades DOM para los kits vectoriales ─────────────────────
const mk = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
};
function ensureId(el) { if (!el.id) el.id = uid('p'); return el.id; }
function cloneShape(el, attrs = {}) {
  const c = el.cloneNode(false);
  c.removeAttribute('id');
  c.removeAttribute('data-r');
  c.removeAttribute('filter');
  c.removeAttribute('clip-path');
  for (const [k, v] of Object.entries(attrs)) { if (v == null) c.removeAttribute(k); else c.setAttribute(k, v); }
  return c;
}
function after(el, ...nodes) { let ref = el; for (const n of nodes) { ref.after(n); ref = n; } return ref; }
function clipOf(defs, el) {
  const id = uid('c');
  const cp = mk('clipPath', { id });
  cp.appendChild(mk('use', { href: `#${ensureId(el)}` }));
  defs.appendChild(cp);
  return `url(#${id})`;
}
function bbox(el) { try { return el.getBBox(); } catch (e) { return { x: 0, y: 0, width: 0, height: 0 }; } }
function defsOf(svg) {
  let d = svg.querySelector(':scope > defs');
  if (!d) { d = mk('defs'); svg.insertBefore(d, svg.firstChild); }
  return d;
}
function wrapAll(svg, attrs) {
  const g = mk('g', attrs);
  const kids = [...svg.childNodes].filter((n) => !(n.tagName === 'defs'));
  kids.forEach((k) => g.appendChild(k));
  svg.appendChild(g);
  return g;
}
const paintAttr = (c) => (c ? hex(c) : 'none');
// Cambia el color de un trazo sin perder su transparencia (las juntas de
// un piso son líneas tenues: al recolorearlas no deben volverse sólidas).
function setStroke(el, color, it) {
  el.setAttribute('stroke', color);
  const a = it.stroke ? it.stroke[3] / (it.op || 1) : 1;
  if (a < 0.98) el.setAttribute('stroke-opacity', +a.toFixed(3));
}
// `face`: una cara de un mueble (la de arriba o la de adelante). Lleva
// contorno como una pieza, pero los kits no le inventan volumen: la luz
// ya viene dibujada (arriba más clara, adelante más oscura).
const isShapeRole = (r) => r === 'body' || r === 'part' || r === 'face';

// ── STICKER ──────────────────────────────────────────────────────
function kitSticker(svg, items, o) {
  const defs = defsOf(svg);
  const vbA = o.vb.width * o.vb.height;
  for (const it of items) {
    const el = it.el;
    if (it.role === 'stamp' || it.role === 'raw') continue;
    if (isShapeRole(it.role) && it.fill) {
      const base = vivid(it.fill);
      const out = hex(inkOf(base, [74, 44, 72], 0.62));
      const b = bbox(el);
      el.setAttribute('fill', hex(base));
      el.setAttribute('stroke', 'none');
      const big = it.role === 'body' || (it.role === 'part' && b.width * b.height > vbA * 0.05 && o.kind !== 'icon');
      let last = el;
      if (big) {
        const g = mk('g', { 'clip-path': clipOf(defs, el) });
        g.appendChild(cloneShape(el, { fill: hex(ramp(base, -1)), stroke: 'none' }));
        const lit = mk('g', { transform: `translate(${-b.width * 0.07} ${-b.height * 0.1})` });
        lit.appendChild(cloneShape(el, { fill: hex(base), stroke: 'none' }));
        g.appendChild(lit);
        if (it.role === 'body') {
          g.appendChild(mk('ellipse', { cx: b.x + b.width * 0.3, cy: b.y + b.height * 0.2, rx: b.width * 0.13, ry: b.height * 0.07, fill: '#fff', opacity: 0.6, transform: `rotate(-28 ${b.x + b.width * 0.3} ${b.y + b.height * 0.2})` }));
        }
        last = after(el, g);
      }
      after(last, cloneShape(el, { fill: 'none', stroke: out, 'stroke-width': Math.max(it.sw * 0.85, 2.3 * o.u), 'stroke-linejoin': 'round' }));
    } else if (it.role === 'flat' && it.fill) {
      el.setAttribute('fill', hex(vivid(it.fill)));
      el.setAttribute('stroke', 'none');
    } else if (it.role === 'line' && it.stroke) {
      const c = lum(it.stroke) < 0.35 ? '#4A2C48' : hex(vivid(it.stroke));
      setStroke(el, c, it);
    }
  }
  if (o.kind === 'art' || o.kind === 'pet') {
    const r = Math.max(2.5, 4.2 * o.u);
    o.bleed = r * 1.9;
    // Lo blanco que flota suelto (vapor, destellos) no lleva borde: si no,
    // el borde blanco lo engorda hasta volverlo una mancha.
    const shapes = items.filter((it) => isShapeRole(it.role) && it.fill).map((it) => rootBox(svg, it.el));
    const loose = items.filter((it) => {
      if (it.clips.length || it.role === 'stamp' || it.role === 'raw') return false;
      const c = it.role === 'line' ? it.stroke : (it.role === 'shine' || it.role === 'flat') ? it.fill : null;
      if (!c || lum(c) < 0.86) return false;
      const b = rootBox(svg, it.el);
      const mx = b.x + b.width / 2, my = b.y + b.height / 2;
      return !shapes.some((s) => mx >= s.x && mx <= s.x + s.width && my >= s.y && my <= s.y + s.height);
    });
    const lifted = loose.map((it) => liftToRoot(svg, it));
    const id = uid('stk');
    const f = mk('filter', { id, x: '-20%', y: '-20%', width: '140%', height: '140%' });
    f.innerHTML = `<feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d"/>
      <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="border"/>
      <feGaussianBlur in="d" stdDeviation="${r * 0.35}" result="sb"/><feOffset in="sb" dx="${r * 0.25}" dy="${r * 0.55}" result="so"/>
      <feFlood flood-color="#5a3d5c" flood-opacity="0.32"/><feComposite in2="so" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>`;
    defs.appendChild(f);
    wrapAll(svg, { filter: `url(#${id})` });
    lifted.forEach((n) => n && svg.appendChild(n));
  }
}
// Caja de una pieza en las coordenadas del dibujo (no las de su grupo).
function rootBox(svg, el) {
  const b = bbox(el);
  const m = relMatrix(svg, el);
  const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}
function relMatrix(svg, el) {
  let probe = svg.querySelector(':scope > g[data-probe]');
  if (!probe) { probe = mk('g', { 'data-probe': '1' }); svg.appendChild(probe); }
  const root = probe.getCTM(), own = el.getCTM();
  if (!root || !own) return new DOMMatrix();
  return DOMMatrix.fromMatrix(root).inverse().multiply(DOMMatrix.fromMatrix(own));
}
// Saca una pieza de sus grupos (con su posición y estilo ya resueltos)
// para dibujarla aparte, encima de todo.
function liftToRoot(svg, it) {
  const el = it.el;
  const m = relMatrix(svg, el);
  const cs = getComputedStyle(el);
  const keep = {
    fill: it.fill ? el.getAttribute('fill') || cs.fill : 'none', stroke: el.getAttribute('stroke') || cs.stroke,
    'stroke-width': cs.strokeWidth, 'stroke-linecap': cs.strokeLinecap, 'stroke-linejoin': cs.strokeLinejoin,
    'stroke-opacity': el.getAttribute('stroke-opacity') || cs.strokeOpacity, 'fill-opacity': el.getAttribute('fill-opacity') || cs.fillOpacity,
    'stroke-dasharray': cs.strokeDasharray !== 'none' ? cs.strokeDasharray : null,
  };
  el.remove();
  for (const [k, v] of Object.entries(keep)) if (v != null) el.setAttribute(k, v);
  el.setAttribute('transform', `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);
  el.setAttribute('opacity', +it.op.toFixed(3));
  el.removeAttribute('style');
  return el;
}
function vivid(c) { const [h, s, l] = rgbToHsl(c); return hslToRgb([h, s < 0.1 ? s : Math.min(1, s * 1.12 + 0.03), l]); }

// ── LO-FI ────────────────────────────────────────────────────────
function lofiGrade(c) {
  const [h, s, l] = rgbToHsl(c);
  let nh = h;
  if (s > 0.08) { const d = ((265 - h + 540) % 360) - 180; nh = h + d * 0.12; }
  return hslToRgb([nh, s * 0.8, Math.max(0.04, l * 0.93)]);
}
function kitLofi(svg, items, o) {
  const defs = defsOf(svg);
  o.bleed = 2 * o.u;
  for (const it of items) {
    const el = it.el;
    if (it.role === 'stamp' || it.role === 'raw') continue;
    if (it.fill && it.role !== 'line') {
      const base = lofiGrade(it.fill);
      if (isShapeRole(it.role)) {
        const id = uid('lg');
        const g = it.role === 'face'
          ? mk('linearGradient', { id, x1: 0, y1: 0, x2: 0.25, y2: 1 })
          : mk('radialGradient', { id, cx: '34%', cy: '26%', r: '82%' });
        const light = mixRgb(ramp(base, 1), [255, 205, 150], 0.18);
        const dark = mixRgb(ramp(base, -1.4), [36, 28, 64], 0.25);
        g.innerHTML = `<stop offset="0" stop-color="${hex(light)}"/><stop offset="0.55" stop-color="${hex(base)}"/><stop offset="1" stop-color="${hex(dark)}"/>`;
        defs.appendChild(g);
        el.setAttribute('fill', `url(#${id})`);
        el.setAttribute('stroke', hex(mixRgb(ramp(base, -2.2), [30, 22, 50], 0.3)));
        el.setAttribute('stroke-width', Math.max(1.4 * o.u, Math.min(it.sw * 0.6, 2.4 * o.u)));
        el.setAttribute('stroke-opacity', '0.85');
        el.setAttribute('stroke-linejoin', 'round');
        if (it.role === 'body' || o.kind === 'pet') {
          const b = bbox(el);
          if (b.width * b.height > o.vb.width * o.vb.height * 0.04) {
            const rim = mk('g', { 'clip-path': clipOf(defs, el) });
            const sh = mk('g', { transform: `translate(${-3 * o.u} ${-1 * o.u})` });
            sh.appendChild(cloneShape(el, { fill: 'none', stroke: '#FFC27A', 'stroke-width': 5 * o.u, 'stroke-opacity': 0.55 }));
            rim.appendChild(sh);
            after(el, rim);
          }
        }
      } else if (it.grad && (it.role === 'tone' || it.role === 'shine')) {
        // luz de lámpara o sombra suave: sigue siendo suave, en la paleta
        const g = recolorGrad(svg, defs, it.grad, lofiGrade);
        if (g) el.setAttribute('fill', g);
      } else {
        el.setAttribute('fill', hex(base));
        if (it.fill[3] < 1) el.setAttribute('fill-opacity', it.fill[3] / (it.op || 1));
        if (it.role === 'flat') el.setAttribute('stroke', 'none');
      }
    }
    if (it.role === 'line' && it.stroke) {
      setStroke(el, lum(it.stroke) < 0.3 ? '#2E2140' : hex(lofiGrade(it.stroke)), it);
    }
  }
  const id = uid('lf');
  const f = mk('filter', { id, x: '-10%', y: '-10%', width: '120%', height: '120%' });
  const ga = o.kind === 'surface' ? 0.3 : 0.42;
  f.innerHTML = `<feTurbulence type="fractalNoise" baseFrequency="${(0.95 / Math.max(0.5, o.u)).toFixed(2)}" numOctaves="2" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 ${ga} ${(-ga * 0.42).toFixed(3)}" result="g"/>
    <feComposite in="g" in2="SourceAlpha" operator="in" result="grain"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="grain"/></feMerge>`;
  defs.appendChild(f);
  wrapAll(svg, { filter: `url(#${id})` });
}

// ── RETRO 70s ────────────────────────────────────────────────────
const RETRO = ['#F6E7C8', '#F1D9A6', '#EFC46A', '#E8A33D', '#E0812F', '#D3612A', '#B5482A', '#8E3B26', '#6B3A24', '#4A2A1C',
  '#C9B458', '#A3A548', '#7D8C3E', '#58703A', '#A9C7A2', '#76A89A', '#4E8C88', '#36676B', '#E9B8A4', '#DE8E86', '#C46A72',
  '#9E4F68', '#7A4462', '#B7A0C0', '#8D7AA6', '#FFFFFF', '#2E2420', '#DCC9B6', '#A88F7A', '#7B6658',
  '#E9D3DC', '#D9C8E6', '#CFE0C3', '#F3E3A2', '#C3DADB', '#F2C9B0', '#B8CBE0', '#7F95B8', '#55688F'].map(parseColor);
const RETRO_LINE = '#3F2618';
// Se acerca a la paleta de época sin perder el color elegido (un lila
// sigue siendo lila, solo que "de los 70": más cálido y apagado).
function retroMap(c) {
  const warm = mixRgb(c, [214, 170, 110], 0.12);
  const n = nearestOf(RETRO, warm);
  const m = mixRgb(warm, n, 0.6);
  return [m[0], m[1], m[2], c[3]];
}
function kitRetro(svg, items, o) {
  const defs = defsOf(svg);
  const pats = {};
  const dots = (base) => {
    const k = hex(base);
    if (pats[k]) return pats[k];
    const id = uid('ht');
    const s = 4.6 * o.u;
    const p = mk('pattern', { id, width: s, height: s, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(30)' });
    p.innerHTML = `<rect width="${s}" height="${s}" fill="${k}"/><circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.3}" fill="${hex(retroMap(ramp(base, -1.6)))}"/>`;
    defs.appendChild(p);
    pats[k] = `url(#${id})`;
    return pats[k];
  };
  const vbA = o.vb.width * o.vb.height;
  // El contorno grueso es del estilo, pero en un sprite chico (comida de
  // 40 px) o en una pieza diminuta lo tapa todo: se achica con el tamaño.
  const sizePx = Math.min(o.vb.width, o.vb.height) / o.u;
  const k = Math.max(0.5, Math.min(1, sizePx / 110));
  const lineFor = (b, sw) => {
    const piecePx = Math.min(b.width, b.height) / o.u;
    const px = Math.max(3.3 * k, (sw / o.u) * 1.1 * k);
    return Math.max(1.1, Math.min(px, piecePx * 0.24)) * o.u;
  };
  o.bleed = 3.3 * k * o.u;
  for (const it of items) {
    const el = it.el;
    if (it.role === 'stamp' || it.role === 'raw') continue;
    if (isShapeRole(it.role) && it.fill) {
      const base = retroMap(it.fill);
      el.setAttribute('fill', hex(base));
      el.setAttribute('stroke', 'none');
      const b = bbox(el);
      // color corrido respecto de la línea, como una impresión barata
      const shift = mk('g', { transform: `translate(${1.3 * k * o.u} ${1.1 * k * o.u})` });
      el.replaceWith(shift);
      shift.appendChild(el);
      let last = shift;
      if (it.role === 'body' || (it.role === 'part' && b.width * b.height > vbA * 0.05)) {
        const g = mk('g', { 'clip-path': clipOf(defs, el), transform: shift.getAttribute('transform') });
        g.appendChild(cloneShape(el, { fill: dots(base), stroke: 'none' }));
        const lit = mk('g', { transform: `translate(${-b.width * 0.08} ${-b.height * 0.11})` });
        lit.appendChild(cloneShape(el, { fill: hex(base), stroke: 'none' }));
        g.appendChild(lit);
        last = after(shift, g);
      }
      after(last, cloneShape(el, { fill: 'none', stroke: RETRO_LINE, 'stroke-width': lineFor(b, it.sw), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    } else if (it.role === 'flat' && it.fill) {
      el.setAttribute('fill', hex(retroMap(it.fill)));
      el.setAttribute('stroke', 'none');
    } else if (it.grad && (it.role === 'tone' || it.role === 'shine')) {
      const g = recolorGrad(svg, defs, it.grad, retroMap);
      if (g) el.setAttribute('fill', g);
    } else if (it.role === 'tone' && it.fill) {
      const dark = lum(it.fill) < 0.5;
      el.setAttribute('fill', dark ? dots(retroMap(mixRgb(it.fill, [246, 231, 200], 0.4))) : hex(retroMap(it.fill)));
      el.setAttribute('fill-opacity', dark ? 0.7 : Math.min(1, it.fill[3] * 1.3));
    } else if (it.role === 'shine' && it.fill) {
      el.setAttribute('fill', '#FFF6E2');
    }
    if (it.role === 'line' && it.stroke) {
      setStroke(el, lum(it.stroke) < 0.45 ? RETRO_LINE : hex(retroMap(it.stroke)), it);
      el.setAttribute('stroke-width', it.sw * 1.2);
      el.setAttribute('stroke-linecap', 'round');
    }
  }
}

// ── PAPEL RECORTADO ──────────────────────────────────────────────
function paperTone(c) {
  const [h, s, l] = rgbToHsl(c);
  return mixRgb(hslToRgb([h, Math.min(1, s * 1.02), l * 0.98]), [243, 234, 216], 0.04);
}
function cutPath(el, o, seed) {
  let len = 0;
  try { len = el.getTotalLength(); } catch (e) { return null; }
  if (!len) return null;
  // con agujeros o varias islas (M…M…) se muestrea más fino, para que
  // cada contorno chico tenga sus puntos
  const multi = el.tagName === 'path' && ((el.getAttribute('d') || '').match(/[Mm]/g) || []).length > 1;
  const step = Math.max((multi ? 1.2 : 2.2) * o.u, Math.min(7 * o.u, len / (multi ? 40 : 14)));
  const n = Math.max(6, Math.round(len / step));
  const r = rng(seed);
  const amp = 0.95 * o.u;
  const raw = [];
  for (let i = 0; i < n; i++) {
    const p = el.getPointAtLength((i / n) * len);
    raw.push([p.x, p.y]);
  }
  // Varios trazos: se separan donde el muestreo salta. Se mide sobre los
  // puntos sin temblor: en un mismo trazo dos muestras nunca están más
  // lejos que el paso.
  const real = len / n;
  let d = '', start = true;
  for (let i = 0; i < raw.length; i++) {
    const [x, y] = raw[i];
    if (!start && i > 0) {
      const [px, py] = raw[i - 1];
      if (Math.hypot(x - px, y - py) > real * 1.6 + 0.01) { d += 'Z'; start = true; }
    }
    const jx = x + (r() - 0.5) * 2 * amp, jy = y + (r() - 0.5) * 2 * amp;
    d += `${start ? 'M' : 'L'}${jx.toFixed(1)} ${jy.toFixed(1)}`;
    start = false;
  }
  return `${d}Z`;
}
function kitPapel(svg, items, o) {
  const defs = defsOf(svg);
  const sid = uid('ps');
  const sf = mk('filter', { id: sid, x: '-20%', y: '-20%', width: '140%', height: '150%' });
  sf.innerHTML = `<feDropShadow dx="${0.9 * o.u}" dy="${1.9 * o.u}" stdDeviation="${0.5 * o.u}" flood-color="#2A1C14" flood-opacity="0.45"/>`;
  defs.appendChild(sf);
  o.bleed = 3.4 * o.u;
  let seed = 11;
  for (const it of items) {
    const el = it.el;
    seed += 7;
    if (it.role === 'stamp' || it.role === 'raw') continue;
    if (it.role === 'line' && it.stroke) {
      setStroke(el, lum(it.stroke) < 0.2 ? '#3A2722' : hex(paperTone(it.stroke)), it);
      el.setAttribute('stroke-linecap', 'round');
      continue;
    }
    if (!it.fill) continue;
    if (it.grad && (it.role === 'tone' || it.role === 'shine')) {
      // una luz suave no es una cartulina: se queda suave, en tono de papel
      const g = recolorGrad(svg, defs, it.grad, paperTone);
      if (g) { el.setAttribute('fill', g); el.setAttribute('stroke', 'none'); }
      continue;
    }
    const base = paperTone(it.fill);
    const d = (it.role === 'shine' && it.tag === 'circle') ? null : cutPath(el, o, seed * 131);
    let target = el;
    if (d) {
      target = mk('path', { d, transform: el.getAttribute('transform'), 'fill-rule': it.fillRule === 'evenodd' ? 'evenodd' : null });
      el.replaceWith(target);
    }
    target.setAttribute('stroke', 'none');
    if (it.role === 'tone') {
      const light = lum(it.fill) > 0.6;
      target.setAttribute('fill', light ? '#FFFDF6' : hex(mixRgb(base, [40, 26, 20], 0.35)));
      target.setAttribute('fill-opacity', Math.min(0.8, it.fill[3] * 1.4));
    } else {
      target.setAttribute('fill', hex(base));
      if (it.fill[3] < 1) target.setAttribute('fill-opacity', it.fill[3]);
      if (it.role !== 'shine') target.setAttribute('filter', `url(#${sid})`);
      if (isShapeRole(it.role) && it.role !== 'face' && o.kind !== 'surface') {
        const b = bbox(target);
        const rot = ((seed % 5) - 2) * 0.6;
        const t = target.getAttribute('transform') || '';
        target.setAttribute('transform', `${t} rotate(${rot} ${b.x + b.width / 2} ${b.y + b.height / 2})`);
      }
    }
  }
  const id = uid('pf');
  const f = mk('filter', { id, x: '0', y: '0', width: '100%', height: '100%' });
  f.innerHTML = `<feTurbulence type="fractalNoise" baseFrequency="${(1.3 / Math.max(0.5, o.u)).toFixed(2)}" numOctaves="1" seed="8" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.26  0 0 0 0 0.18  0 0 0 0.6 -0.33" result="fib"/>
    <feComposite in="fib" in2="SourceAlpha" operator="in" result="tex"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="tex"/></feMerge>`;
  defs.appendChild(f);
  wrapAll(svg, { filter: `url(#${id})` });
}

// ── NEÓN ─────────────────────────────────────────────────────────
function neonize(c) {
  const [h, s, l] = rgbToHsl(c);
  if (s < 0.12) return l < 0.35 ? [255, 214, 245] : [236, 230, 255];
  return hslToRgb([h, Math.max(0.85, s), Math.min(0.72, Math.max(0.6, l))]);
}
const NIGHT = [12, 8, 26];
function kitNeon(svg, items, o) {
  const defs = defsOf(svg);
  const gid = uid('ng');
  const gf = mk('filter', { id: gid, x: '-50%', y: '-50%', width: '200%', height: '200%' });
  gf.innerHTML = `<feGaussianBlur stdDeviation="${2.2 * o.u}"/>`;
  defs.appendChild(gf);
  const glowCopy = (el, color, w) => cloneShape(el, { fill: 'none', stroke: color, 'stroke-width': w, filter: `url(#${gid})`, opacity: 0.95, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  o.bleed = 6 * o.u;
  const vbA = o.vb.width * o.vb.height;
  for (const it of items) {
    const el = it.el;
    if (it.role === 'stamp' || it.role === 'raw') continue;
    if (it.role === 'line' && it.stroke) {
      const c = hex(neonize(it.stroke));
      setStroke(el, c, it);
      if (o.kind === 'surface') {
        // en paredes y pisos las líneas son tenues: el brillo es de los muebles
        el.setAttribute('stroke-opacity', Math.min(0.55, it.stroke[3]));
        continue;
      }
      if (it.stroke[3] / (it.op || 1) < 0.7) {
        // trazo tenue (veta de madera, junta, textura): marca, no es un
        // tubo de luz
        el.setAttribute('stroke-opacity', Math.min(0.45, it.stroke[3]));
        continue;
      }
      el.setAttribute('stroke-width', Math.max(it.sw, 1.6 * o.u));
      el.before(glowCopy(el, c, Math.max(it.sw, 1.6 * o.u) * 1.8));
      continue;
    }
    if (!it.fill) continue;
    if (it.role === 'shine') {
      el.setAttribute('fill', '#FFFFFF');
      continue;
    }
    if (it.grad && it.role === 'tone') {
      // luz de lámpara o ventana: brilla tal cual; sombra: noche
      const light = lum(it.fill) > 0.45;
      const g = light ? null : recolorGrad(svg, defs, it.grad, () => NIGHT);
      if (g) el.setAttribute('fill', g);
      continue;
    }
    if (it.role === 'tone') {
      const light = lum(it.fill) > 0.6;
      el.setAttribute('fill', light ? '#E9E2FF' : hex(NIGHT));
      el.setAttribute('fill-opacity', light ? it.fill[3] * 0.35 : Math.min(0.6, it.fill[3]));
      continue;
    }
    const n = neonize(it.fill);
    // Lo oscuro y chico de la mascota (ojos, narices) se enciende: en la
    // noche la mirada brilla. En el resto solo si la pieza dice que es un
    // ojo (`data-eye`): un botón o una lente oscura no se prenden en rosa.
    const eyeOk = o.kind === 'pet' || !!it.el.closest('[data-eye]');
    let darkSmall = eyeOk && it.role === 'flat' && lum(it.fill) < 0.22 && o.kind !== 'surface';
    if (darkSmall) { const b = bbox(el); darkSmall = b.width * b.height < vbA * 0.012; }
    // Detalles chicos de color (lunares, botones, estrellitas): se encienden
    // enteros como lucecitas; con solo el contorno se leen como aros.
    if (it.role === 'flat' && !darkSmall && o.kind !== 'surface' && lum(it.fill) >= 0.22) {
      const b = bbox(el);
      if (b.width * b.height < vbA * 0.006) {
        el.setAttribute('fill', hex(mixRgb(n, NIGHT, 0.12)));
        el.setAttribute('stroke', 'none');
        continue;
      }
    }
    // el cuerpo conserva algo de su color (una mochi rosada sigue siendo
    // rosada en la oscuridad), las piezas un poco menos
    const night = it.role === 'body' ? 0.64 : it.role === 'flat' ? 0.7 : 0.76;
    if (o.kind === 'surface' && it.role === 'flat') {
      // paredes y pisos: de noche, oscuros y con el color apenas; solo los
      // motivos chicos (lunares, flores, estrellas) se encienden un poco
      const bb = bbox(el);
      const big = bb.width * bb.height > o.vb.width * o.vb.height * 0.2;
      el.setAttribute('fill', hex(mixRgb(it.fill, NIGHT, big ? 0.86 : 0.78)));
      if (it.fill[3] < 1) el.setAttribute('fill-opacity', it.fill[3]);
      el.setAttribute('stroke', 'none');
      continue;
    }
    el.setAttribute('fill', darkSmall ? '#FFF2FC' : hex(mixRgb(it.fill, NIGHT, night)));
    const w = (isShapeRole(it.role) ? 2.1 : 1.3) * o.u;
    const col = darkSmall ? '#FF8AD8' : hex(n);
    el.setAttribute('stroke', col);
    el.setAttribute('stroke-width', w);
    el.setAttribute('stroke-linejoin', 'round');
    if (it.role === 'flat' && !darkSmall) el.setAttribute('stroke-opacity', 0.5);
    if (isShapeRole(it.role) || darkSmall) el.after(glowCopy(el, col, w * 1.6));
  }
}

// ── PIXEL ────────────────────────────────────────────────────────
function pathOf(el) {
  const a = (k) => parseFloat(el.getAttribute(k)) || 0;
  const p = new Path2D();
  switch (el.tagName) {
    case 'path': return new Path2D(el.getAttribute('d') || '');
    case 'circle': p.arc(a('cx'), a('cy'), a('r'), 0, Math.PI * 2); return p;
    case 'ellipse': p.ellipse(a('cx'), a('cy'), a('rx'), a('ry'), 0, 0, Math.PI * 2); return p;
    case 'rect': {
      const rx = a('rx') || a('ry');
      if (rx && p.roundRect) p.roundRect(a('x'), a('y'), a('width'), a('height'), Math.min(rx, a('width') / 2, a('height') / 2)); else p.rect(a('x'), a('y'), a('width'), a('height'));
      return p;
    }
    case 'line': p.moveTo(a('x1'), a('y1')); p.lineTo(a('x2'), a('y2')); return p;
    case 'polyline': case 'polygon': {
      const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      for (let i = 0; i + 1 < pts.length; i += 2) (i ? p.lineTo(pts[i], pts[i + 1]) : p.moveTo(pts[i], pts[i + 1]));
      if (el.tagName === 'polygon') p.closePath();
      return p;
    }
    default: return p;
  }
}
const ownMatrix = (el) => {
  const t = el.transform && el.transform.baseVal && el.transform.baseVal.consolidate();
  return t ? t.matrix : new DOMMatrix();
};
function applyClips(ctx, svg, clips) {
  for (const c of clips) {
    const id = c.ref.replace(/^url\(["']?#/, '').replace(/["']?\)$/, '');
    const cp = svg.querySelector(`[id="${id}"]`);
    if (!cp) continue;
    const m = c.el.getCTM();
    const p = new Path2D();
    cp.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,use').forEach((ch) => {
      let src = ch;
      let mm = ownMatrix(ch);
      if (ch.tagName === 'use') {
        const ref = svg.querySelector(`[id="${(ch.getAttribute('href') || ch.getAttribute('xlink:href') || '').slice(1)}"]`);
        if (!ref) return;
        src = ref;
        mm = mm.multiply(ownMatrix(ref));
      }
      p.addPath(pathOf(src), mm);
    });
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    ctx.clip(p);
  }
}

function kitPixel(svg, items, o) {
  const W = o.gw, H = o.gh;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const N = W * H;
  const idx = new Int32Array(N).fill(-1);
  const col = new Float32Array(N * 3);
  const al = new Float32Array(N);
  const isLine = new Uint8Array(N);
  const under = new Float32Array(N * 3);
  const underIdx = new Int32Array(N).fill(-1);
  const stamps = [];
  const unit = o.vb.width / W; // unidades del dibujo por píxel

  const raster = (it, mode) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    applyClips(ctx, svg, it.clips);
    const m = it.el.getCTM();
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    const path = pathOf(it.el);
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';
    if (mode === 'stroke') {
      const scale = Math.hypot(m.a, m.b) || 1;
      ctx.lineWidth = Math.max(it.sw, 1.3 / scale);
      ctx.lineCap = it.cap || 'round';
      ctx.lineJoin = 'round';
      if (it.dash) { ctx.setLineDash(it.dash); ctx.lineDashOffset = it.dashOff; }
      ctx.stroke(path);
    } else if (mode === 'clip') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fill(path, it.fillRule === 'evenodd' ? 'evenodd' : 'nonzero');
    }
    ctx.restore();
    return ctx.getImageData(0, 0, W, H).data;
  };

  // Trazo fino (menos de ~2 px): se recorre la línea y se unen los puntos
  // con escalones de un píxel, así queda continua (rasterizada salía
  // punteada en diagonal). Respeta los guiones.
  const thinMask = (it) => {
    const mask = new Uint8Array(N);
    const el = it.el;
    let len = 0;
    try { len = el.getTotalLength(); } catch (e) { return mask; }
    if (!len) return mask;
    const M = el.getCTM();
    const sc = Math.hypot(M.a, M.b) || 1;
    const step = 0.45 / sc;
    const dash = it.dash, period = dash ? dash.reduce((a, b) => a + b, 0) : 0;
    const onDash = (s) => {
      if (!dash || !period) return true;
      let t = (((s + it.dashOff) % period) + period) % period;
      for (let k = 0; k < dash.length; k++) { if (t < dash[k]) return k % 2 === 0; t -= dash[k]; }
      return true;
    };
    const plot = (x, y) => { if (x >= 0 && y >= 0 && x < W && y < H) mask[y * W + x] = 1; };
    const line = (x0, y0, x1, y1) => {
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (let guard = 0; guard < 4096; guard++) {
        plot(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    };
    const n = Math.min(20000, Math.ceil(len / step));
    let prev = null;
    for (let k = 0; k <= n; k++) {
      const s = Math.min(len, (k / n) * len);
      if (!onDash(s)) { prev = null; continue; }
      const pt = el.getPointAtLength(s);
      const x = M.a * pt.x + M.c * pt.y + M.e, y = M.b * pt.x + M.d * pt.y + M.f;
      const gx = Math.floor(x), gy = Math.floor(y);
      // un salto largo es otro trazo del mismo camino (M…M…): no se une
      if (prev && Math.hypot(x - prev[0], y - prev[1]) <= 1.6) line(prev[2], prev[3], gx, gy); else plot(gx, gy);
      prev = [x, y, gx, gy];
    }
    if (it.clips.length) {
      const c = raster(it, 'clip');
      for (let p = 0; p < N; p++) if (c[p * 4 + 3] < 128) mask[p] = 0;
    }
    return mask;
  };

  // Luz o sombra con degradado: se pinta el degradado de verdad y se baja
  // a bandas parejas, como se hacen las luces en un sprite.
  const gradRaster = (it) => {
    const spec = gradSpec(svg, it.grad);
    if (!spec) return null;
    let bb;
    try { bb = it.el.getBBox(); } catch (e) { return null; }
    if (!spec.user && (!bb.width || !bb.height)) return null;
    const M = it.el.getCTM();
    const B = spec.user ? new DOMMatrix() : new DOMMatrix([bb.width, 0, 0, bb.height, bb.x, bb.y]);
    const BG = B.multiply(spec.gt);
    const inv = BG.inverse();
    if (!Number.isFinite(inv.a)) return null;
    const T = DOMMatrix.fromMatrix(M).multiply(BG);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    applyClips(ctx, svg, it.clips);
    ctx.setTransform(T.a, T.b, T.c, T.d, T.e, T.f);
    const p2 = new Path2D();
    p2.addPath(pathOf(it.el), inv);
    const g = spec.type === 'linearGradient'
      ? ctx.createLinearGradient(spec.x1, spec.y1, spec.x2, spec.y2)
      : ctx.createRadialGradient(spec.fx, spec.fy, 0, spec.cx, spec.cy, spec.r);
    for (const s of spec.stops) g.addColorStop(s.o, `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.c[3]})`);
    ctx.fillStyle = g;
    ctx.fill(p2, it.fillRule === 'evenodd' ? 'evenodd' : 'nonzero');
    ctx.restore();
    return ctx.getImageData(0, 0, W, H).data;
  };

  for (const it of items) {
    if (it.role === 'raw' || it.role === 'none') continue;
    if (it.skip && it.skip.includes('pixel')) continue;
    if (it.role === 'stamp') {
      const b = it.el.getBoundingClientRect();
      const sr = svg.getBoundingClientRect();
      stamps.push({ it, x: b.left - sr.left + b.width / 2, y: b.top - sr.top + b.height / 2, w: b.width, h: b.height });
      continue;
    }
    if (it.role === 'line') {
      if (!it.stroke) continue;
      const c = it.stroke;
      const mm = it.el.getCTM();
      const thick = it.sw * (Math.hypot(mm.a, mm.b) || 1) >= 1.9;
      let d;
      if (thick) d = raster(it, 'stroke');
      else {
        // la máscara fina se pasa al mismo formato (alfa en cada 4.º byte)
        const m = thinMask(it);
        d = new Uint8ClampedArray(N * 4);
        for (let p = 0; p < N; p++) if (m[p]) d[p * 4 + 3] = 255;
      }
      if (c[3] < 0.95) {
        // trazo tenue: tiñe lo que hay debajo (como una junta o una veta)
        const a = Math.min(0.8, Math.max(0.25, c[3] * 1.4));
        // sobre nada (un cordón colgando sobre la pared) no hay qué teñir:
        // se dibuja con transparencia en escalones, como en un sprite
        const aloneA = Math.round(Math.min(1, c[3] * 1.8) * 4) / 4;
        for (let p = 0; p < N; p++) {
          if (d[p * 4 + 3] < 110) continue;
          if (al[p] < 0.99) {
            if (al[p] >= aloneA) continue;
            col[p * 3] = c[0]; col[p * 3 + 1] = c[1]; col[p * 3 + 2] = c[2];
            al[p] = aloneA; idx[p] = it.i; isLine[p] = 3;
            continue;
          }
          col[p * 3] += (c[0] - col[p * 3]) * a; col[p * 3 + 1] += (c[1] - col[p * 3 + 1]) * a; col[p * 3 + 2] += (c[2] - col[p * 3 + 2]) * a;
        }
        continue;
      }
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] < 70) continue;
        if (!isLine[p]) { under[p * 3] = col[p * 3]; under[p * 3 + 1] = col[p * 3 + 1]; under[p * 3 + 2] = col[p * 3 + 2]; underIdx[p] = al[p] >= 0.99 ? idx[p] : -1; }
        col[p * 3] = c[0]; col[p * 3 + 1] = c[1]; col[p * 3 + 2] = c[2];
        if (al[p] < 0.99) { al[p] = 1; idx[p] = it.i; }
        isLine[p] = thick ? 3 : 1;
      }
      continue;
    }
    if (!it.fill) continue;
    if (it.grad && (it.role === 'tone' || it.role === 'shine')) {
      const g = gradRaster(it);
      if (g) {
        const k = it.gradK;
        for (let p = 0; p < N; p++) {
          const ga = (g[p * 4 + 3] / 255) * k;
          // bandas de a quinto: la luz baja en escalones, no en niebla
          const a = Math.min(0.85, Math.round(ga * 5) / 5);
          if (a <= 0) continue;
          const gc = [g[p * 4], g[p * 4 + 1], g[p * 4 + 2]];
          if (al[p] >= 0.99) {
            col[p * 3] += (gc[0] - col[p * 3]) * a; col[p * 3 + 1] += (gc[1] - col[p * 3 + 1]) * a; col[p * 3 + 2] += (gc[2] - col[p * 3 + 2]) * a;
          } else {
            col[p * 3] = gc[0]; col[p * 3 + 1] = gc[1]; col[p * 3 + 2] = gc[2];
            al[p] = Math.max(al[p], Math.round(Math.min(0.5, a) * 8) / 8);
          }
        }
        continue;
      }
    }
    const d = raster(it, 'fill');
    const c = it.fill;
    if ((it.role === 'shine' || it.role === 'flat') && c[3] < 0.93) {
      // brillo o detalle semitransparente (lente, tul, rubor): sobre algo
      // se mezcla en escalones de a cuarto y la pieza de abajo sigue siendo
      // la dueña del píxel (su contorno y su luz no cambian)
      const a = Math.max(0.25, Math.round(c[3] * 4) / 4);
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] < 128) continue;
        if (al[p] >= 0.99) {
          col[p * 3] += (c[0] - col[p * 3]) * a; col[p * 3 + 1] += (c[1] - col[p * 3 + 1]) * a; col[p * 3 + 2] += (c[2] - col[p * 3 + 2]) * a;
        } else {
          col[p * 3] = c[0]; col[p * 3 + 1] = c[1]; col[p * 3 + 2] = c[2];
          al[p] = Math.max(al[p], a);
          idx[p] = it.i;
        }
      }
      continue;
    }
    if (it.role === 'tone') {
      const a = Math.min(0.85, c[3]);
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] < 128) continue;
        if (al[p] >= 0.99) {
          col[p * 3] += (c[0] - col[p * 3]) * a; col[p * 3 + 1] += (c[1] - col[p * 3 + 1]) * a; col[p * 3 + 2] += (c[2] - col[p * 3 + 2]) * a;
        } else {
          // sombra en el piso: píxeles semitransparentes parejos
          col[p * 3] = c[0]; col[p * 3 + 1] = c[1]; col[p * 3 + 2] = c[2];
          al[p] = Math.max(al[p], Math.round(Math.min(0.5, a) * 8) / 8);
        }
      }
      continue;
    }
    for (let p = 0; p < N; p++) {
      if (d[p * 4 + 3] < 128) continue;
      col[p * 3] = c[0]; col[p * 3 + 1] = c[1]; col[p * 3 + 2] = c[2];
      al[p] = c[3] >= 0.93 ? 1 : Math.max(al[p], c[3]);
      idx[p] = it.i;
      isLine[p] = 0;
    }
  }

  const inItem = (x, y, i) => x >= 0 && y >= 0 && x < W && y < H && idx[y * W + x] === i && al[y * W + x] >= 0.99;
  // ¿la pieza sigue por ahí (aunque algo de adelante la tape)? Lo que se
  // le pone encima no es su borde: no lleva filo de luz ni de sombra.
  const underOrIn = (x, y, i) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const q = y * W + x;
    return al[q] >= 0.99 && (idx[q] === i || idx[q] > i || isLine[q] > 0);
  };
  const setC = (p, c) => { col[p * 3] = c[0]; col[p * 3 + 1] = c[1]; col[p * 3 + 2] = c[2]; };

  // Sombreado por parte
  const boxes = new Map();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x; const i = idx[p];
    if (i < 0 || al[p] < 0.99 || isLine[p]) continue;
    let b = boxes.get(i);
    if (!b) { b = { x0: x, x1: x, y0: y, y1: y, n: 0 }; boxes.set(i, b); }
    if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; b.n++;
  }
  for (const [i, b] of boxes) {
    const it = items[i];
    if (!isShapeRole(it.role) || b.n < 8 || !it.fill) continue;
    const base = it.fill;
    const sh1 = ramp(base, -1), lt1 = ramp(base, 1);
    if (it.role === 'body') {
      // media luna de sombra abajo a la derecha y filo de luz arriba a la
      // izquierda: lo que queda afuera al correr la silueta hacia la luz
      const bw = b.x1 - b.x0 + 1, bh = b.y1 - b.y0 + 1;
      const ox = Math.max(1, Math.round(bw * 0.05)), oy = Math.max(1, Math.round(bh * 0.09));
      const sh2 = ramp(base, -1.7);
      for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
        const p = y * W + x;
        if (idx[p] !== i || isLine[p] || al[p] < 0.99) continue;
        const inS = (dx, dy) => { const qx = x + dx, qy = y + dy; return qx >= 0 && qy >= 0 && qx < W && qy < H && al[qy * W + qx] >= 0.99 && idx[qy * W + qx] >= 0; };
        if (!inS(ox * 2, oy * 2) && !inS(ox, oy)) setC(p, sh2);
        else if (!inS(ox * 2, oy * 2)) setC(p, sh1);
        else if (!inS(-ox, -oy * 1.5 | 0) && y < b.y0 + bh * 0.5) setC(p, lt1);
      }
    } else {
      for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
        const p = y * W + x;
        if (idx[p] !== i || isLine[p] || al[p] < 0.99) continue;
        const up2 = !underOrIn(x, y - 2, i) && inItem(x, y - 1, i);
        const left2 = !underOrIn(x - 2, y, i) && inItem(x - 1, y, i);
        const dn2 = !underOrIn(x, y + 2, i) && inItem(x, y + 1, i);
        const rt2 = !underOrIn(x + 2, y, i) && inItem(x + 1, y, i);
        if (dn2 || rt2) setC(p, sh1); else if (up2 || left2) setC(p, lt1);
      }
    }
  }

  // Contornos: silueta y bordes de las piezas de adelante
  const out = new Float32Array(col);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    const i = idx[p];
    if (i < 0 || al[p] < 0.99 || isLine[p]) continue;
    const it = items[i];
    if (it.role === 'shine' || it.role === 'tone' || !it.fill) continue;
    const base = it.fill;
    // una pieza de 3 píxeles o menos de ancho no lleva contorno por dentro:
    // se comería todo su color (tiras finas, tallos, cintas)
    const bx = boxes.get(i);
    const tiny = bx && Math.min(bx.x1 - bx.x0, bx.y1 - bx.y0) < 3;
    let edge = false, inner = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const qx = x + dx, qy = y + dy;
      if (qx < 0 || qy < 0 || qx >= W || qy >= H) { if (o.kind !== 'surface') edge = true; continue; }
      const q = qy * W + qx;
      if (al[q] < 0.99) { edge = true; continue; }
      const j = isLine[q] ? underIdx[q] : idx[q];
      if (j >= 0 && j !== i && j < i && isShapeRole(it.role) && !tiny) {
        const jt = items[j];
        if (jt.role !== 'line' && jt.role !== 'shine' && jt.role !== 'tone' && jt.fill) inner = true;
      }
    }
    if (edge && o.kind !== 'surface') {
      const c = inkOf(base);
      out[p * 3] = c[0]; out[p * 3 + 1] = c[1]; out[p * 3 + 2] = c[2];
    } else if (inner || (edge && o.kind === 'surface' && isShapeRole(it.role))) {
      const c = inkOf(base, [43, 29, 51], 0.45);
      out[p * 3] = c[0]; out[p * 3 + 1] = c[1]; out[p * 3 + 2] = c[2];
    }
  }
  // Trazos limpios: se quitan las esquinas en L (píxel "perfecto")
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const p = y * W + x;
    if (!isLine[p]) continue;
    if (isLine[p] !== 1) continue;
    const L = (dx, dy) => isLine[(y + dy) * W + x + dx] === 1;
    const corner = (L(-1, 0) && L(0, -1) && !L(1, 0) && !L(0, 1)) || (L(1, 0) && L(0, -1) && !L(-1, 0) && !L(0, 1))
      || (L(-1, 0) && L(0, 1) && !L(1, 0) && !L(0, -1)) || (L(1, 0) && L(0, 1) && !L(-1, 0) && !L(0, -1));
    if (corner) {
      isLine[p] = 2;
      if (underIdx[p] >= 0 || al[p] >= 0.99) { out[p * 3] = under[p * 3]; out[p * 3 + 1] = under[p * 3 + 1]; out[p * 3 + 2] = under[p * 3 + 2]; }
      if (underIdx[p] < 0 && items[idx[p]] && items[idx[p]].role === 'line') al[p] = 0;
    }
  }

  const img = ctx.createImageData(W, H);
  for (let p = 0; p < N; p++) {
    img.data[p * 4] = out[p * 3]; img.data[p * 4 + 1] = out[p * 3 + 1]; img.data[p * 4 + 2] = out[p * 3 + 2];
    img.data[p * 4 + 3] = Math.round(al[p] * 255);
  }
  // Piezas hechas a mano (ojos, bocas…). Lo que en el dibujo va delante
  // (unas gafas de sol, un antifaz, un flequillo) las tapa.
  for (const s of stamps) {
    const si = s.it.i;
    // un vidrio transparente (lentes) no tapa: los ojos se ven a través
    const covered = (p) => {
      if (idx[p] <= si || al[p] < 0.99 || isLine[p]) return false;
      const t = items[idx[p]];
      return !!t && t.role !== 'stamp' && !!t.fill && t.fill[3] >= 0.93;
    };
    drawStamp(img, W, H, s, o, covered);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.putImageData(img, 0, 0);
  return cv;
}
function colorDist(a, b) { const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return dr * dr + dg * dg + db * db; }

function drawStamp(img, W, H, s, o, covered) {
  const el = s.it.el;
  const name = s.it.px;
  const st = stampFor(name, s.w, s.h);
  if (!st) return;
  const flip = el.getAttribute('data-flip') === '1';
  const pal = {
    k: parseColor(el.getAttribute('data-ink') || '#2B1D2E'),
    w: [255, 255, 255, 1],
    e: parseColor(el.getAttribute('data-c1') || '#2B1D2E'),
    E: mixRgb(parseColor(el.getAttribute('data-c1') || '#2B1D2E'), [255, 255, 255], 0.45),
    b: parseColor(el.getAttribute('data-c2') || '#FF8FA8'),
    r: [146, 52, 72, 1],
    p: [255, 143, 163, 1],
    t: [143, 211, 255, 1],
    g: [255, 214, 102, 1],
  };
  const rows = st.rows;
  // Dibujos enteros: su propia paleta y agrandados por un entero.
  const own = st.pal ? paletteOf(st.pal) : null;
  const k = st.k || 1;
  const h = rows.length, w = rows[0].length;
  const x0 = Math.round(s.x - (w * k) / 2 + (st.dx || 0)), y0 = Math.round(s.y - (h * k) / 2 + (st.dy || 0));
  for (let r = 0; r < h * k; r++) for (let c = 0; c < w * k; c++) {
    const ch = rows[Math.floor(r / k)][flip ? w - 1 - Math.floor(c / k) : Math.floor(c / k)];
    if (ch === '.' || ch === ' ') continue;
    const x = x0 + c, y = y0 + r;
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    if (covered && covered(y * W + x)) continue;
    const p = (y * W + x) * 4;
    let col;
    if (own) col = own[ch];
    else if (ch === 'd' || ch === 'l') {
      // un tono más oscuro/claro de lo que hay debajo (para mejillas suaves)
      const u = [img.data[p], img.data[p + 1], img.data[p + 2]];
      col = ch === 'd' ? ramp(u, -1) : ramp(u, 1);
    } else if (ch === 'B') {
      const u = [img.data[p], img.data[p + 1], img.data[p + 2]];
      col = mixRgb(u, pal.b, 0.6);
    } else col = pal[ch];
    if (!col) continue;
    img.data[p] = col[0]; img.data[p + 1] = col[1]; img.data[p + 2] = col[2]; img.data[p + 3] = 255;
  }
}

// Paleta de un dibujo hecho a mano, ya convertida a números (una vez).
const palCache = new WeakMap();
function paletteOf(pal) {
  let p = palCache.get(pal);
  if (!p) {
    p = {};
    for (const [ch, c] of Object.entries(pal)) p[ch] = parseColor(c);
    palCache.set(pal, p);
  }
  return p;
}

// Un dibujo entero hecho a mano, pintado tal cual en su propio lienzo
// (el navegador lo agranda con bordes duros). Se elige el tamaño más
// grande que entra con al menos 1.3 píxeles de pantalla por píxel de
// arte; si ninguno, el más chico.
function drawWholeStamp(name, w, h) {
  const sizes = artStampSizes(name);
  if (!sizes) return null;
  const m = Math.min(w, h);
  let st = sizes[0];
  for (const s of sizes) if (s.rows.length * 1.3 <= m + 0.01) st = s;
  const n = st.rows.length;
  const cw = Math.max(n, Math.round((n * w) / m)), ch = Math.max(n, Math.round((n * h) / m));
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(cw, ch);
  drawStamp(img, cw, ch, { it: { el: { getAttribute: () => null }, px: name }, x: cw / 2, y: ch / 2, w: n, h: n }, {});
  ctx.putImageData(img, 0, 0);
  return { url: cv.toDataURL('image/png'), cssW: w, cssH: h, pixelated: true };
}

// ── API ──────────────────────────────────────────────────────────
const KITS = { sticker: kitSticker, lofi: kitLofi, retro: kitRetro, papel: kitPapel, neon: kitNeon };

// Tamaño del píxel de arte. En el mundo (cuarto, mascota grande) es el
// del estilo; en miniaturas se achica para que entren los detalles: una
// mochi de 60 px con píxeles de 3 tiene 20 puntos y no se le ve la cara.
export function pixelSizeFor(style, w, h, pixel) {
  if (pixel) return pixel;
  const base = style.art.pixel || 2;
  // al menos ~72 píxeles de arte a lo ancho (si no, la cara son dos puntos)
  return Math.min(base, Math.max(1, Math.min(w, h) / 72));
}

/**
 * Dibuja `markup` en el estilo `styleId`. Sincrónico.
 * Devuelve { url, cssW, cssH, pixelated }.
 */
export function drawArt({ markup, styleId, w, h, kind = 'art', pixel, fit, bleed }) {
  const style = getStyle(styleId);
  const kitName = style.art.kind;
  // En pixel, un dibujo que tiene versión hecha a mano se pinta con ella.
  if (kitName === 'pixel') {
    const m = /^<svg[^>]*\sdata-px-sprite="([^"]+)"/.exec(markup);
    const whole = m && drawWholeStamp(m[1], w, h);
    if (whole) return whole;
  }
  const px = kitName === 'pixel' ? pixelSizeFor(style, w, h, pixel) : 1;
  const gw = Math.max(4, Math.round(w / px)), gh = Math.max(4, Math.round(h / px));
  const svg = mount(resolveVars(markup, styleId), kitName === 'pixel' ? gw : w, kitName === 'pixel' ? gh : h, fit);
  try {
    const vb = svg.viewBox.baseVal;
    const scale = fit === 'cover' ? Math.max(w / vb.width, h / vb.height) : Math.min(w / vb.width, h / vb.height);
    const o = { vb, kind, u: 1 / scale, gw, gh };
    const items = collect(svg, kitName);
    if (kitName === 'pixel') {
      const cv = kitPixel(svg, items, o);
      return { url: cv.toDataURL('image/png'), cssW: w, cssH: h, pixelated: true };
    }
    (KITS[kitName] || kitSticker)(svg, items, o);
    svg.querySelectorAll(':scope > g[data-probe], :scope g[data-probe]').forEach((n) => n.remove());
    // Margen: el borde blanco del sticker, el brillo del neón o la sombra
    // del papel salen un poco de la caja; si el dibujo toca el borde, se
    // cortaban. Se agranda el lienzo para afuera (la imagen va centrada,
    // así que el dibujo queda en el mismo lugar).
    let cssW = w, cssH = h, pad = 0;
    if (bleed && o.bleed && kind !== 'surface' && fit !== 'cover') {
      const p = o.bleed;
      pad = Math.ceil(p / o.u);
      const pu = pad * o.u;
      svg.setAttribute('viewBox', `${vb.x - pu} ${vb.y - pu} ${vb.width + pu * 2} ${vb.height + pu * 2}`);
      cssW = w + pad * 2; cssH = h + pad * 2;
      svg.setAttribute('width', cssW);
      svg.setAttribute('height', cssH);
    }
    const s = new XMLSerializer().serializeToString(svg);
    return { url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`, cssW, cssH, pixelated: false, pad };
  } finally {
    host().innerHTML = '';
  }
}
