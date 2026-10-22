// Orejas (y lo que hace a cada animalito): cada oreja se dibuja derecha,
// con la base en (0,0), y se coloca sobre el borde del cuerpo en el
// ángulo de ese punto. Así sirve igual en los cuatro anchos.

import { G, P, Ell, Cir, E, mirrorX } from '../svg.js';
import { parseColor, hex, ramp, mixRgb } from '../color.js';

export const EARS = [
  { id: 'ninguna', label: 'Sin orejas' },
  { id: 'gato', label: 'Gatito' },
  { id: 'conejo', label: 'Conejito' },
  { id: 'conejoCaido', label: 'Conejito caído' },
  { id: 'oso', label: 'Osito' },
  { id: 'perro', label: 'Perrito' },
  { id: 'zorro', label: 'Zorrito' },
  { id: 'raton', label: 'Ratoncito' },
  { id: 'cerdito', label: 'Cerdito' },
  { id: 'panda', label: 'Panda' },
  { id: 'koala', label: 'Koala' },
  { id: 'lobo', label: 'Lobito' },
  { id: 'oveja', label: 'Ovejita' },
  { id: 'pollito', label: 'Pollito' },
  { id: 'rana', label: 'Ranita' },
  { id: 'unicornio', label: 'Unicornio' },
  { id: 'dragon', label: 'Dragoncito' },
  { id: 'murcielago', label: 'Murciélago' },
  { id: 'alas', label: 'Angelito' },
];

const shade = (c, k) => hex(ramp(parseColor(c), k));
const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
const part = (d, fill, extra = {}) => P(d, { fill, stroke: '#3A2A3E', 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part', ...extra });
const flat = (d, fill, extra = {}) => P(d, { fill, 'data-r': 'flat', ...extra });

// Coloca una oreja izquierda (dibujada derecha) sobre el borde y la
// espeja a la derecha.
function pair(g, xFrac, sink, local, { tilt = 0.85, rot = 0, scale } = {}) {
  const s = scale ?? Math.pow(g.wf, 0.35);
  const x = 100 - g.w * xFrac;
  const y = g.topAt(x) + sink;
  const a = g.tiltAt(x) * tilt + rot;
  const left = G({ transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a.toFixed(1)}) scale(${s.toFixed(3)})` }, local);
  return left + mirrorX(left);
}

let zid = 0;

export function renderEars(id, g, c) {
  const inner = c.earInner;
  const out = { back: '', front: '', face: '', faceShift: null };
  switch (id) {
    case 'gato':
      out.back = pair(g, 0.25, 10, part('M-15 9 L-6.5 -21 Q0 -29.5 6.5 -21 L15 9Z', c.body) + flat('M-8 3 L-2.6 -12.5 Q0 -16.5 2.6 -12.5 L8 3Z', inner));
      break;
    case 'conejo':
      out.back = pair(g, 0.14, 10, part('M0 6 C-9 6 -11 -14 -10 -26 C-9 -40 -4 -48 0 -48 C4 -48 9 -40 10 -26 C11 -14 9 6 0 6Z', c.body) + flat('M0 0 C-4 0 -5.5 -14 -5 -24 C-4.6 -34 -2 -40 0 -40 C2 -40 4.6 -34 5 -24 C5.5 -14 4 0 0 0Z', inner), { tilt: 0.4, rot: -9 });
      break;
    case 'conejoCaido': {
      const x = 100 - g.w * 0.2, y = g.topAt(x) + 3;
      const ear = part('M9 -3 C-5 -9 -23 -3 -31 15 C-37 31 -33 45 -25 45 C-17 45 -13 31 -8 19 C-3 9 5 4 13 1Z', c.body)
        + flat('M3 -2 C-7 -5 -19 1 -25 15 C-29 26 -27 36 -23 36 C-18 35 -15 26 -11 17 C-7 10 0 5 6 2Z', inner);
      const L = G({ transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${Math.pow(g.wf, 0.3).toFixed(3)})` }, ear);
      out.front = L + mirrorX(L);
      break;
    }
    case 'oso':
      out.back = pair(g, 0.27, 6, Cir(0, -6, 12.5, { fill: c.body, stroke: '#3A2A3E', 'stroke-width': 2.6, 'data-r': 'part' }) + Cir(0, -5, 6.4, { fill: inner, 'data-r': 'flat' }), { tilt: 0.6 });
      break;
    case 'perro': {
      const x = 100 - g.w * 0.31, y = g.topAt(x) + 5;
      const ear = part('M7 -6 C-7 -11 -20 -1 -21 17 C-22 33 -15 43 -7 41 C1 39 3 25 5 13 C6 5 11 -2 7 -6Z', c.accent)
        + P('M-14 26 C-14 16 -11 6 -5 0', { fill: 'none', stroke: shade(c.accent, 1), 'stroke-width': 2.2, 'stroke-linecap': 'round', 'data-r': 'line', opacity: 0.8 });
      const L = G({ transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${Math.pow(g.wf, 0.3).toFixed(3)})` }, ear);
      out.front = L + mirrorX(L);
      break;
    }
    case 'zorro': {
      const id2 = `zt${++zid}`;
      const d = 'M-17 10 C-18 -5 -13 -24 -3 -34 C0 -37 2 -37 4 -33 L19 10Z';
      out.back = pair(g, 0.25, 10, E('clipPath', { id: id2 }, P(d)) + part(d, c.body)
        + G({ 'clip-path': `url(#${id2})` }, flat('M-30 -22 L20 -40 L20 -18 Q0 -14 -30 -10Z', c.tip))
        + P(d, { fill: 'none', stroke: '#3A2A3E', 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'line' })
        + flat('M-9 4 C-9 -6 -6 -16 -1 -22 L9 4Z', inner), { tilt: 0.7 });
      break;
    }
    case 'raton':
      out.back = pair(g, 0.3, 9, Cir(0, -12, 17, { fill: c.body, stroke: '#3A2A3E', 'stroke-width': 2.6, 'data-r': 'part' }) + Cir(1, -11, 10.5, { fill: inner, 'data-r': 'flat' }), { tilt: 0.7 });
      break;
    case 'cerdito':
      // orejas de chancho: anchas, con la punta doblada hacia adelante
      out.front = pair(g, 0.25, 9, part('M-14 8 C-14 -4 -9 -15 -2 -19 C4 -16 12 -6 14 6Z', c.body) + flat('M-8 4 C-7 -4 -4 -10 -1 -12 C3 -9 7 -3 8 4Z', inner)
        + part('M-2 -19 C4 -16 9 -10 11 -4 C5 -1 -1 -2 -6 -7 C-5 -12 -4 -16 -2 -19Z', shade(c.body, -0.35)), { tilt: 0.55, rot: -4 });
      break;
    case 'panda': {
      const dark = c.patch;
      out.back = pair(g, 0.27, 6, Cir(0, -6, 12, { fill: dark, stroke: '#2A2230', 'stroke-width': 2.6, 'data-r': 'part' }), { tilt: 0.6 });
      const y = g.face.y + 1, dx = g.face.dx;
      out.face = [-1, 1].map((s) => Ell(100 + s * dx + s * 1.5, y, 10.5, 12, { fill: dark, transform: `rotate(${s * -25} ${100 + s * dx} ${y})`, 'data-r': 'flat' })).join('');
      break;
    }
    case 'koala': {
      const fluffy = `M-16 2 C-24 -2 -24 -14 -17 -18 C-17 -27 -6 -32 0 -26 C6 -32 17 -27 17 -18 C24 -14 24 -2 16 2 C10 6 -10 6 -16 2Z`;
      out.back = pair(g, 0.3, 8, part(fluffy, c.body) + flat('M-9 -2 C-13 -6 -11 -14 -6 -15 C-4 -21 4 -21 6 -15 C11 -14 13 -6 9 -2 C5 0 -5 0 -9 -2Z', c.inner), { tilt: 0.75 });
      break;
    }
    case 'lobo':
      out.back = pair(g, 0.24, 10, part('M-14 9 L-7 -27 Q0 -34 6 -27 L15 9Z', c.body)
        + flat('M-7 5 L-3 -16 L4 -16 L8 5Z', inner)
        + P('M-4 4 l1 -9 M0 5 l0 -11 M4 4 l-1 -9', { fill: 'none', stroke: c.body, 'stroke-width': 2, 'stroke-linecap': 'round', 'data-r': 'line' }), { tilt: 0.8 });
      break;
    case 'oveja': {
      const t = g.top;
      const tuft = [[-14, 6, 8], [-5, 1, 9], [5, 1, 9], [14, 6, 8], [0, 9, 8]].map(([x, y, r]) => Cir(100 + x, t + y, r, { fill: c.wool, stroke: '#3A2A3E', 'stroke-width': 2.4, 'data-r': 'part' })).join('');
      out.front = tuft;
      out.back = pair(g, 0.34, 12, part('M2 2 C-6 -2 -18 0 -22 6 C-14 10 -4 10 3 8Z', c.body) + flat('M-2 3 C-7 2 -13 3 -16 5 C-11 7 -6 7 -1 6Z', inner), { tilt: 0.3, rot: -10 });
      break;
    }
    case 'pollito': {
      const t = g.top;
      out.front = P(`M100 ${t + 3} C97 ${t - 9} 89 ${t - 13} 84 ${t - 9} C90 ${t - 7} 94 ${t - 2} 96 ${t + 4}Z`, { fill: c.body, stroke: '#3A2A3E', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + P(`M101 ${t + 3} C101 ${t - 11} 108 ${t - 17} 115 ${t - 14} C109 ${t - 10} 106 ${t - 4} 105 ${t + 4}Z`, { fill: c.body, stroke: '#3A2A3E', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part' });
      const wy = g.ys - 4;
      const wing = part(`M${g.l + 4} ${wy - 10} C${g.l - 10} ${wy - 8} ${g.l - 12} ${wy + 8} ${g.l - 2} ${wy + 12} C${g.l + 2} ${wy + 13} ${g.l + 6} ${wy + 8} ${g.l + 7} ${wy + 2}Z`, shade(c.body, -0.4));
      out.back = wing + mirrorX(wing);
      break;
    }
    case 'rana': {
      const bx = g.w * 0.22;
      const by = g.topAt(100 - bx) + 1;
      const bump = Cir(100 - bx, by, 16.5, { fill: c.body, stroke: '#3A2A3E', 'stroke-width': 2.6, 'data-r': 'part' });
      out.back = bump + mirrorX(bump);
      out.faceShift = { y: by - g.face.y, dx: bx - g.face.dx };
      break;
    }
    case 'unicornio': {
      const t = g.top;
      out.back = pair(g, 0.22, 9, part('M-9 8 L-4 -19 Q0 -24 4 -19 L9 8Z', c.body) + flat('M-4 4 L-1.5 -11 L1.5 -11 L4 4Z', inner), { tilt: 0.9 });
      const id2 = `uh${++zid}`;
      out.front = G({ transform: `translate(100 ${t + 6}) rotate(8)` },
        part('M-6.5 0 L0 -34 L6.5 0 Q0 3 -6.5 0Z', '#FFE08A', { stroke: '#B88A2A' })
        + P('M-4.6 -7 L4.6 -10 M-3.2 -16 L3.2 -18.5 M-1.8 -25 L1.8 -26.5', { fill: 'none', stroke: '#B88A2A', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'data-r': 'line' }))
        + E('clipPath', { id: id2 }, P(g.path))
        + G({ 'clip-path': `url(#${id2})` },
          P(`M${100 - g.w * 0.3} ${t + 26} C${100 - g.w * 0.26} ${t + 4} ${100 - 4} ${t - 4} ${100 + 6} ${t + 2} C${100 - 2} ${t + 10} ${100 - 4} ${t + 18} ${100 - g.w * 0.14} ${t + 28}Z`, { fill: c.mane1, 'data-r': 'flat' })
          + P(`M${100 + 2} ${t + 2} C${100 + 16} ${t - 2} ${100 + g.w * 0.3} ${t + 8} ${100 + g.w * 0.33} ${t + 26} C${100 + g.w * 0.22} ${t + 18} ${100 + 12} ${t + 14} ${100 + 4} ${t + 18} C${100 + 6} ${t + 12} ${100 + 4} ${t + 6} ${100 + 2} ${t + 2}Z`, { fill: c.mane2, 'data-r': 'flat' }));
      break;
    }
    case 'dragon':
      out.back = pair(g, 0.2, 9, part('M-6 8 C-8 -6 -7 -16 -2 -24 C3 -18 7 -8 6 8Z', '#FFF0C9', { stroke: '#9A7A3A' })
        + P('M-6 -4 l9 2 M-5 -12 l8 2', { fill: 'none', stroke: '#C9A65A', 'stroke-width': 1.5, 'data-r': 'line' }), { tilt: 0.9, rot: -8 })
        + pair(g, 0.36, 18, part('M2 0 C-10 -8 -20 -4 -24 2 C-18 4 -14 8 -14 12 C-10 10 -4 10 2 8Z', c.accent), { tilt: 0.4, rot: -12 });
      {
        const wy = g.ys - 14;
        const wing = part(`M${g.l + 10} ${wy} C${g.l - 6} ${wy - 22} ${g.l - 26} ${wy - 18} ${g.l - 30} ${wy - 6} C${g.l - 22} ${wy - 6} ${g.l - 20} ${wy + 2} ${g.l - 22} ${wy + 8} C${g.l - 14} ${wy + 4} ${g.l - 8} ${wy + 8} ${g.l - 8} ${wy + 14} C${g.l - 2} ${wy + 8} ${g.l + 4} ${wy + 8} ${g.l + 10} ${wy + 10}Z`, c.accent);
        out.back = wing + mirrorX(wing) + out.back;
      }
      break;
    case 'murcielago': {
      const ear = part('M-15 10 C-20 -4 -20 -22 -10 -34 C-8 -26 -4 -22 0 -22 C2 -28 6 -32 10 -34 C14 -20 16 -2 15 10Z', c.accent)
        + P('M-10 -30 C-8 -16 -6 -6 -4 6 M8 -30 C6 -16 4 -6 2 6', { fill: 'none', stroke: shade(c.accent, -1.5), 'stroke-width': 1.6, 'data-r': 'line' });
      out.back = pair(g, 0.26, 10, ear, { tilt: 0.85, rot: -6 });
      break;
    }
    case 'alas': {
      const wy = g.ys - 22;
      const feather = (dy, len) => `M${g.l + 8} ${wy + dy} C${g.l - len * 0.4} ${wy + dy - 10} ${g.l - len} ${wy + dy - 4} ${g.l - len} ${wy + dy + 6} C${g.l - len * 0.6} ${wy + dy + 8} ${g.l - len * 0.2} ${wy + dy + 8} ${g.l + 8} ${wy + dy + 10}Z`;
      const wing = part(feather(-6, 30), '#FFFFFF', { stroke: '#8A84A8' }) + part(feather(2, 26), '#F4F1FF', { stroke: '#8A84A8' }) + part(feather(10, 20), '#FFFFFF', { stroke: '#8A84A8' });
      out.back = wing + mirrorX(wing);
      break;
    }
    default: break;
  }
  return out;
}

export function colorsForEars(c) {
  return {
    earInner: c.inner === '#FFFFFF' || c.inner.toUpperCase() === '#FFF1E4' ? mixc(c.inner, '#FFB3C6', 0.55) : c.inner,
    tip: shade(c.body, -2.2),
    patch: '#2E2733',
    wool: mixc('#FFFFFF', c.body, 0.08),
    mane1: c.accent,
    mane2: c.accentAlt === '#FFFFFF' ? '#B8A1FF' : c.accentAlt,
  };
}
