// Caras de la mochi: ojos, bocas y mejillas, con sus seis ánimos.
// Cada pieza va dentro de un <g data-px="…">: los kits vectoriales la
// dibujan con el SVG de acá y el kit de pixel la reemplaza por su
// versión hecha a mano píxel a píxel (art/pixelStamps.js).

import { G, P, Ell, Cir, E } from '../svg';

export const INK = '#3A2A3E';
export const MOODS = ['normal', 'feliz', 'triste', 'enojado', 'dormido', 'sorprendido'];

let cid = 0;
const clipId = () => `fc${++cid}`;

// ── OJOS ─────────────────────────────────────────────────────────
export const EYES = [
  { id: 'redondos', label: 'Brillantes' },
  { id: 'grandes', label: 'Grandotes' },
  { id: 'puntitos', label: 'Puntitos' },
  { id: 'somnolientos', label: 'Dormilones' },
  { id: 'estrella', label: 'Estrellitas' },
  { id: 'corazon', label: 'Corazones' },
  { id: 'delineados', label: 'Delineados' },
  { id: 'rebelde', label: 'Rebeldes' },
  { id: 'pestanudos', label: 'Pestañudos' },
  { id: 'cruzados', label: 'Equis' },
];

const shine = (x, y, r) => Cir(x, y, r, { fill: '#FFFFFF', 'data-r': 'shine' });
const ink = (d, w = 2.6) => P(d, { fill: 'none', stroke: INK, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line' });

function roundEye(x, y, rx, ry, c, k = 1) {
  rx *= k; ry *= k;
  return Ell(x, y, rx, ry, { fill: INK, 'data-r': 'flat' })
    + Ell(x, y + ry * 0.42, rx * 0.64, ry * 0.4, { fill: c.eye, 'data-r': 'flat', opacity: 0.85 })
    + shine(x + rx * 0.3, y - ry * 0.34, rx * 0.42)
    + shine(x - rx * 0.36, y + ry * 0.34, rx * 0.2);
}

const starPath = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.48 : r;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(2)} ${(y + Math.sin(a) * rr).toFixed(2)}`;
  }
  return `${d}Z`;
};
const heartPath = (x, y, s) => `M${x} ${y + s * 0.85} C${x - s * 1.1} ${y + s * 0.1} ${x - s * 1.05} ${y - s * 0.95} ${x} ${y - s * 0.35} C${x + s * 1.05} ${y - s * 0.95} ${x + s * 1.1} ${y + s * 0.1} ${x} ${y + s * 0.85}Z`;

// Ojo de un estilo, en su forma "abierta" (base de casi todos los ánimos).
function openEye(style, x, y, side, c, k = 1) {
  const rx = 6.6, ry = 8;
  switch (style) {
    case 'grandes': {
      const RX = 8.4 * k, RY = 10 * k;
      return Ell(x, y, RX, RY, { fill: INK, 'data-r': 'flat' })
        + Ell(x, y + RY * 0.12, RX * 0.8, RY * 0.8, { fill: c.eye, 'data-r': 'flat' })
        + Ell(x, y + RY * 0.18, RX * 0.46, RY * 0.5, { fill: INK, 'data-r': 'flat' })
        + shine(x + RX * 0.32, y - RY * 0.36, RX * 0.4)
        + shine(x - RX * 0.38, y + RY * 0.38, RX * 0.18)
        + shine(x - RX * 0.12, y - RY * 0.55, RX * 0.12);
    }
    case 'puntitos':
      return Ell(x, y, 3.7 * k, 4.4 * k, { fill: INK, 'data-r': 'flat' }) + shine(x + 1.1 * k, y - 1.5 * k, 1.3 * k);
    case 'estrella':
      return P(starPath(x, y, 9.5 * k), { fill: c.eye, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'data-r': 'part' }) + shine(x + 2 * k, y - 2.6 * k, 1.8 * k);
    case 'corazon':
      return P(heartPath(x, y, 8.6 * k), { fill: c.eye, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'data-r': 'part' }) + shine(x - 3 * k, y - 2.4 * k, 1.9 * k);
    case 'delineados': {
      const o = side; // -1 izq, +1 der: hacia afuera de la cara
      return roundEye(x, y, rx * 0.95, ry * 0.92, c, k)
        + ink(`M${x - o * 6} ${y - 7.6} Q${x} ${y - 10.6} ${x + o * 7} ${y - 6} L${x + o * 12} ${y - 9.5}`, 2.4);
    }
    case 'rebelde': {
      const o = side;
      const d = `M${x - o * 8} ${y + 1} Q${x - o * 2} ${y - 8} ${x + o * 8} ${y - 4} Q${x + o * 4} ${y + 7} ${x - o * 8} ${y + 1}Z`;
      const id = clipId();
      return E('clipPath', { id }, P(d)) + P(d, { fill: '#FFFFFF', 'data-r': 'flat' })
        + G({ 'clip-path': `url(#${id})` }, Cir(x + o * 1, y - 0.5, 5.2, { fill: c.eye, 'data-r': 'flat' }) + Cir(x + o * 1, y - 0.5, 2.6, { fill: INK, 'data-r': 'flat' }) + shine(x + o * 2.6, y - 2.2, 1.3))
        + ink(`M${x - o * 9} ${y + 1} Q${x - o * 2} ${y - 9} ${x + o * 9.5} ${y - 5}`, 2.8);
    }
    case 'pestanudos': {
      const o = side;
      return roundEye(x, y, rx, ry, c, k)
        + ink(`M${x + o * 5.5} ${y - 5.5} l${o * 4.5} -3.5 M${x + o * 6.8} ${y - 2} l${o * 5} -1.5 M${x + o * 2.5} ${y - 7.6} l${o * 2.6} -4`, 2);
    }
    case 'cruzados':
      return ink(`M${x - 5.5 * k} ${y - 5.5 * k} L${x + 5.5 * k} ${y + 5.5 * k} M${x + 5.5 * k} ${y - 5.5 * k} L${x - 5.5 * k} ${y + 5.5 * k}`, 3);
    case 'somnolientos': {
      const id = clipId();
      return E('clipPath', { id }, P(`M${x - 12} ${y - 1.5} L${x + 12} ${y - 1.5} L${x + 12} ${y + 14} L${x - 12} ${y + 14}Z`))
        + G({ 'clip-path': `url(#${id})` }, roundEye(x, y, rx, ry, c, k))
        + ink(`M${x - 7.4} ${y - 1.2} Q${x} ${y - 3.4} ${x + 7.4} ${y - 1.2}`, 2.6);
    }
    default:
      return roundEye(x, y, rx, ry, c, k);
  }
}

function eye(style, x, y, side, mood, c) {
  const arcUp = (w = 7) => ink(`M${x - w} ${y + 2.5} Q${x} ${y - 8.5} ${x + w} ${y + 2.5}`, 2.9);
  const arcDown = (w = 7) => ink(`M${x - w} ${y - 1} Q${x} ${y + 6.5} ${x + w} ${y - 1}`, 2.7);
  switch (mood) {
    case 'feliz':
      if (style === 'corazon' || style === 'estrella') return openEye(style, x, y, side, c, 1.12);
      if (style === 'pestanudos') return arcUp() + ink(`M${x + side * 6} ${y} l${side * 4} -2.5 M${x + side * 3} ${y - 4} l${side * 2.5} -3.5`, 2);
      return arcUp(style === 'puntitos' ? 5 : style === 'grandes' ? 8.5 : 7);
    case 'dormido':
      if (style === 'pestanudos') return arcDown() + ink(`M${x + side * 6.5} ${y + 0.5} l${side * 3.6} 2.4 M${x + side * 3.5} ${y + 3.6} l${side * 2} 3`, 2);
      return arcDown(style === 'puntitos' ? 5 : 7);
    case 'enojado': {
      const id = clipId();
      const yo = y - 6.5, yi = y - 0.5; // borde de afuera y de adentro del párpado
      const xo = x + side * 13, xi = x - side * 13;
      return E('clipPath', { id }, P(`M${xi} ${yi + 1.5} L${xo} ${yo - 1.5} L${xo} ${y + 16} L${xi} ${y + 16}Z`))
        + G({ 'clip-path': `url(#${id})` }, openEye(style, x, y, side, c))
        + ink(`M${x - side * 8} ${yi - 2.5} L${x + side * 8.5} ${yo - 4.5}`, 3);
    }
    case 'triste': {
      const brow = ink(`M${x + side * 8} ${y - 11} Q${x + side * 1} ${y - 12.5} ${x - side * 7} ${y - 16}`, 2.3);
      const tear = side > 0 ? P(`M${x + 5} ${y + 7} q-3.6 6.5 0 9.5 q3.6 -3 0 -9.5z`, { fill: '#8FD3FF', stroke: '#4F9FD6', 'stroke-width': 1.2, 'data-r': 'part' }) : '';
      return openEye(style, x, y, side, c) + brow + tear;
    }
    case 'sorprendido':
      if (style === 'cruzados' || style === 'corazon' || style === 'estrella') return openEye(style, x, y, side, c, 0.9);
      return Ell(x, y, 7.6, 8.8, { fill: '#FFFFFF', stroke: INK, 'stroke-width': 2, 'data-r': 'part' })
        + Cir(x, y + 0.6, 3.6, { fill: INK, 'data-r': 'flat' }) + shine(x + 1.3, y - 0.8, 1.2);
    default:
      return openEye(style, x, y, side, c);
  }
}

export function renderEyes(style, g, mood, c, shift = { x: 0, y: 0, dx: 0 }) {
  const y = g.face.y + shift.y;
  const dx = g.face.dx + (shift.dx || 0);
  const one = (side) => G({ 'data-px': `eye.${style}.${mood}`, 'data-c1': c.eye, 'data-flip': side > 0 ? '1' : null, 'data-ink': INK },
    eye(style, 100 + side * dx, y, side, mood, c));
  return one(-1) + one(1);
}

// ── BOCAS ────────────────────────────────────────────────────────
export const MOUTHS = [
  { id: 'sonrisa', label: 'Sonrisa' },
  { id: 'w', label: 'Boquita w' },
  { id: 'hocico', label: 'Hociquito' },
  { id: 'pico', label: 'Piquito' },
  { id: 'colmillos', label: 'Colmillitos' },
  { id: 'lengua', label: 'Lengüita' },
  { id: 'ladeada', label: 'Ladeada' },
  { id: 'labios', label: 'Labios' },
  { id: 'grito', label: 'Gritito' },
];

const RED = '#8E3048', TONGUE = '#FF8FA3';
const openMouth = (x, y, w = 8, h = 11) => P(`M${x - w} ${y - 1} Q${x} ${y + h} ${x + w} ${y - 1}Z`, { fill: RED, stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'data-r': 'part' })
  + P(`M${x - w * 0.55} ${y + h * 0.5} Q${x} ${y + h * 0.2} ${x + w * 0.55} ${y + h * 0.5} Q${x} ${y + h * 0.8} ${x - w * 0.55} ${y + h * 0.5}Z`, { fill: TONGUE, 'data-r': 'flat' });
const fang = (x, y, s = 1) => P(`M${x - 2.2 * s} ${y} L${x + 2.2 * s} ${y} L${x} ${y + 4.4 * s}Z`, { fill: '#FFFFFF', stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round', 'data-r': 'part' });

function mouth(style, x, y, mood, c) {
  if (style === 'pico') {
    if (mood === 'feliz' || mood === 'sorprendido') {
      return P(`M${x - 7} ${y - 1} Q${x} ${y - 5} ${x + 7} ${y - 1} Q${x} ${y + 1} ${x - 7} ${y - 1}Z`, { fill: '#FFA94D', stroke: '#B5651D', 'stroke-width': 1.8, 'data-r': 'part' })
        + P(`M${x - 6} ${y + 1.5} Q${x} ${y + 9} ${x + 6} ${y + 1.5}Z`, { fill: '#FF8C3A', stroke: '#B5651D', 'stroke-width': 1.8, 'data-r': 'part' });
    }
    return P(`M${x - 7} ${y} Q${x} ${y - 5} ${x + 7} ${y} Q${x} ${y + 6.5} ${x - 7} ${y}Z`, { fill: '#FFA94D', stroke: '#B5651D', 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'data-r': 'part' })
      + P(`M${x - 6} ${y} Q${x} ${y + 1.5} ${x + 6} ${y}`, { fill: 'none', stroke: '#B5651D', 'stroke-width': 1.3, 'data-r': 'line' });
  }
  const muzzle = style === 'hocico'
    ? Ell(x, y - 3, 3.8, 2.7, { fill: INK, 'data-r': 'flat' }) + shine(x - 1.2, y - 3.8, 0.9)
    : '';
  const my = style === 'hocico' ? y + 2 : y;
  switch (mood) {
    case 'feliz':
      if (style === 'labios') return P(`M${x - 8} ${y} Q${x} ${y + 12} ${x + 8} ${y} Q${x} ${y - 3} ${x - 8} ${y}Z`, { fill: '#7A1F35', stroke: c.lips, 'stroke-width': 3, 'data-r': 'part' });
      if (style === 'grito') return Ell(x, y + 4, 8, 9, { fill: RED, stroke: INK, 'stroke-width': 2.2, 'data-r': 'part' }) + Ell(x, y + 9, 4.6, 3, { fill: TONGUE, 'data-r': 'flat' });
      return muzzle + openMouth(x, my, style === 'hocico' ? 6.5 : 8, style === 'hocico' ? 9 : 11) + (style === 'colmillos' ? fang(x - 4.5, my - 0.5, 0.8) + fang(x + 4.5, my - 0.5, 0.8) : '');
    case 'enojado':
      if (style === 'grito') return P(`M${x - 8} ${y + 6} L${x - 4} ${y + 1} L${x} ${y + 5} L${x + 4} ${y + 1} L${x + 8} ${y + 6} Q${x} ${y + 12} ${x - 8} ${y + 6}Z`, { fill: RED, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'data-r': 'part' });
      return muzzle + ink(`M${x - 6} ${my + 4.5} Q${x} ${my - 1} ${x + 6} ${my + 4.5}`) + (style === 'colmillos' ? fang(x - 3.6, my + 2.4, 0.75) + fang(x + 3.6, my + 2.4, 0.75) : '');
    case 'triste':
      return muzzle + ink(`M${x - 7} ${my + 4.5} Q${x - 3.5} ${my} ${x} ${my + 3} Q${x + 3.5} ${my} ${x + 7} ${my + 4.5}`, 2.4);
    case 'sorprendido':
      return muzzle + Ell(x, my + 3, 4, 5, { fill: RED, stroke: INK, 'stroke-width': 1.8, 'data-r': 'part' });
    case 'dormido':
      return muzzle + ink(`M${x - 3.5} ${my + 1} Q${x} ${my + 3.8} ${x + 3.5} ${my + 1}`, 2.3);
    default: break;
  }
  switch (style) {
    case 'w': case 'hocico':
      return muzzle + ink(`M${x - 7.5} ${my} Q${x - 3.8} ${my + 5.5} ${x} ${my + 0.8} Q${x + 3.8} ${my + 5.5} ${x + 7.5} ${my}`, 2.4);
    case 'colmillos':
      return ink(`M${x - 7} ${y} Q${x} ${y + 6} ${x + 7} ${y}`) + fang(x - 4, y + 2.4, 0.85) + fang(x + 4, y + 2.4, 0.85);
    case 'lengua':
      return P(`M${x - 1} ${y + 2} q0 7.5 5 7.5 q5 0 4.5 -7.5Z`, { fill: TONGUE, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + ink(`M${x - 7} ${y} Q${x} ${y + 5.5} ${x + 7} ${y}`);
    case 'ladeada':
      return ink(`M${x - 6} ${y + 2.5} Q${x + 1} ${y + 4.5} ${x + 7} ${y - 2}`);
    case 'labios':
      return P(`M${x - 8} ${y + 1} Q${x - 4} ${y - 3.5} ${x} ${y - 0.5} Q${x + 4} ${y - 3.5} ${x + 8} ${y + 1} Q${x} ${y + 7} ${x - 8} ${y + 1}Z`, { fill: c.lips, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'data-r': 'part' })
        + ink(`M${x - 7} ${y + 1} Q${x} ${y + 2.4} ${x + 7} ${y + 1}`, 1.3);
    case 'grito':
      return Ell(x, y + 3, 5.5, 6.5, { fill: RED, stroke: INK, 'stroke-width': 2, 'data-r': 'part' }) + Ell(x, y + 6.5, 3, 2, { fill: TONGUE, 'data-r': 'flat' });
    default:
      return ink(`M${x - 6.5} ${y} Q${x} ${y + 6} ${x + 6.5} ${y}`);
  }
}

export function renderMouth(style, g, mood, c, shift = { y: 0 }) {
  const y = g.face.mouthY + (shift.y || 0);
  // El hocico (la parte clarita) es una pieza aparte: en pixel se dibuja
  // como forma y solo la nariz y la boca son píxeles hechos a mano.
  const muzzle = style === 'hocico' ? Ell(100, y + 1, 12, 8.5, { fill: c.inner, 'data-r': 'flat' }) : '';
  return muzzle + G({ 'data-px': `mouth.${style}.${mood}`, 'data-ink': INK, 'data-c1': c.lips, 'data-c2': c.inner }, mouth(style, 100, y, mood, c));
}

// ── MEJILLAS ─────────────────────────────────────────────────────
export const CHEEKS = [
  { id: 'ninguno', label: 'Sin mejillas' },
  { id: 'redondos', label: 'Redonditas' },
  { id: 'alargados', label: 'Alargadas' },
  { id: 'corazon', label: 'Corazoncitos' },
  { id: 'rayitas', label: 'Rayitas' },
  { id: 'brillos', label: 'Con brillitos' },
  { id: 'sombras', label: 'Ojeras' },
];

function cheek(style, x, y, side, c, mood) {
  const col = mood === 'enojado' ? '#FF5B6E' : c.blush;
  const op = mood === 'enojado' ? 0.75 : 0.55;
  switch (style) {
    case 'alargados': return Ell(x, y, 10, 3.6, { fill: col, opacity: op, 'data-r': 'tone' });
    case 'corazon': return P(heartPath(x, y, 4.2), { fill: col, opacity: Math.min(1, op + 0.25), 'data-r': 'flat' });
    case 'rayitas': return Ell(x, y, 7.5, 4.6, { fill: col, opacity: op, 'data-r': 'tone' })
      + [-3.5, 0, 3.5].map((d) => P(`M${x + d - 1.4} ${y + 1.8} l2.8 -3.6`, { stroke: '#FFFFFF', 'stroke-width': 1.3, 'stroke-linecap': 'round', fill: 'none', opacity: 0.9, 'data-r': 'line' })).join('');
    case 'brillos': return Ell(x, y, 7.5, 4.6, { fill: col, opacity: op, 'data-r': 'tone' })
      + P(starPath(x + side * 9, y - 8, 3), { fill: '#FFFFFF', 'data-r': 'shine' });
    case 'sombras': return Ell(x - side * 11, y - 6, 9, 5, { fill: '#3A2A3E', opacity: 0.22, 'data-r': 'tone' });
    default: return Ell(x, y, 7.5, 4.6, { fill: col, opacity: op, 'data-r': 'tone' });
  }
}

export function renderCheeks(style, g, mood, c, shift = { y: 0, dx: 0 }) {
  if (!style || style === 'ninguno') return '';
  const y = g.face.cheekY + (shift.y || 0);
  const dx = g.face.cheekDx + (shift.dx || 0);
  const one = (side) => G({ 'data-px': `cheek.${style}.${mood === 'enojado' ? 'enojado' : 'normal'}`, 'data-c2': mood === 'enojado' ? '#FF5B6E' : c.blush, 'data-flip': side > 0 ? '1' : null },
    cheek(style, 100 + side * dx, y, side, c, mood));
  return one(-1) + one(1);
}
