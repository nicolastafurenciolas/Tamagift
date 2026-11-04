// ─────────────────────────────────────────────────────────────────
// Arte de lo personal en el cuarto: el cofre de recuerdos y el sobrecito
// de voz.
//
// El cofre "de verdad" lo dibuja art/room/personal.js (cofreSvg({ open,
// glow }), 140×120). Mientras ese archivo no exista se usa el marcador
// de abajo: import.meta.glob no falla si no hay archivo, y en cuanto
// aparece Vite lo toma solo.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, rr, Ell, Cir, piece, DEPTH } from '../../../art/room/draw.js';
import { slab as woodSlab } from '../../../art/room/furniture/storage.js';

const external = import.meta.glob('../../../art/room/personal.js', { eager: true });
const ext = Object.values(external)[0] || {};

// Marcador: un cofrecito de madera con herrajes y candado de corazón.
function cofrePlaceholder({ open = false, glow = false } = {}) {
  const W = 140, H = 120;
  const x = 18, w = 104, y = 108, h = 46, d = 30 * DEPTH;
  let s = Ell(70, 110, 56, 7, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });
  if (glow) s += Ell(70, 66, 66, 44, { fill: '#FFE08A', opacity: 0.35, 'data-r': 'tone' }) + Ell(70, 66, 50, 32, { fill: '#FFF2B8', opacity: 0.35, 'data-r': 'tone' });
  // cuerpo
  s += face(rr(x, y - h, w, h, 6), '#B9784A');
  s += line(`M${x + 5} ${y - h + 16}H${x + w - 5}M${x + 5} ${y - h + 31}H${x + w - 5}`, '#94582F', 1.4);
  s += part(rr(x + 14, y - h, 10, h, 2), '#E3B65C', { w: 1.6 }) + part(rr(x + w - 24, y - h, 10, h, 2), '#E3B65C', { w: 1.6 });
  s += shade(rr(x + 2, y - 10, w - 4, 8, 4), '#5A321A', 0.25);
  if (open) {
    // interior con brillo y la tapa abierta hacia atrás
    s += face(rr(x + 2, y - h - d - 34, w - 4, 34, 10), '#C98A58');
    s += part(rr(x + 14, y - h - d - 34, 10, 34, 2), '#E3B65C', { w: 1.6 }) + part(rr(x + w - 24, y - h - d - 34, 10, 34, 2), '#E3B65C', { w: 1.6 });
    s += face(rr(x + 3, y - h - d, w - 6, d + 4, 3), '#5A3424');
    s += Ell(70, y - h - d / 2 + 2, 40, d / 2 + 1, { fill: '#FFE9A8', opacity: 0.85, 'data-r': 'tone' });
    s += part(rr(56, y - h - 9, 28, 11, 3), '#FFF8EE', { w: 1.4 });
    s += flat('M70 61 C66.6 58.8 65 57 65.3 55.4 C65.6 53.8 67.6 53.2 70 55 C72.4 53.2 74.4 53.8 74.7 55.4 C75 57 73.4 58.8 70 61Z', '#E8506E');
  } else {
    // tapa abombada
    s += face(`M${x} ${y - h + 2}V${y - h - 12}Q${x} ${y - h - 34} 70 ${y - h - 36}Q${x + w} ${y - h - 34} ${x + w} ${y - h - 12}V${y - h + 2}Z`, '#C98A58');
    s += part(`M${x + 14} ${y - h + 2}V${y - h - 26}Q${x + 18} ${y - h - 31} ${x + 24} ${y - h - 32}V${y - h + 2}Z`, '#E3B65C', { w: 1.6 });
    s += part(`M${x + w - 14} ${y - h + 2}V${y - h - 26}Q${x + w - 18} ${y - h - 31} ${x + w - 24} ${y - h - 32}V${y - h + 2}Z`, '#E3B65C', { w: 1.6 });
    s += line(`M${x + 30} ${y - h - 24}Q70 ${y - h - 32} ${x + w - 30} ${y - h - 24}`, '#E6B48A', 2, { opacity: 0.9 });
    // candado de corazón
    s += part('M70 84 C61 78.4 57 73.6 57.8 69.2 C58.6 64.8 64.4 63.2 70 68 C75.6 63.2 81.4 64.8 82.2 69.2 C83 73.6 79 78.4 70 84Z', glow ? '#FF6E8E' : '#E8506E', { w: 1.8 });
    s += Cir(66, 70, 1.6, { fill: '#FFFFFF', 'data-r': 'shine' });
  }
  if (glow) {
    const star = (cx, cy, r) => flat(`M${cx} ${cy - r}L${cx + r * 0.3} ${cy - r * 0.3}L${cx + r} ${cy}L${cx + r * 0.3} ${cy + r * 0.3}L${cx} ${cy + r}L${cx - r * 0.3} ${cy + r * 0.3}L${cx - r} ${cy}L${cx - r * 0.3} ${cy - r * 0.3}Z`, '#FFE070');
    s += star(16, 30, 6) + star(124, 22, 7) + star(110, 52, 4) + star(28, 58, 4);
  }
  return piece(W, H, s);
}

export const cofreSvg = typeof ext.cofreSvg === 'function' ? ext.cofreSvg : cofrePlaceholder;
export const hasRealCofre = typeof ext.cofreSvg === 'function';

// El sobrecito de voz: un sobre lila con una onda de sonido en el sello.
export const voiceEnvelopeSvg = typeof ext.sobreVozSvg === 'function' ? ext.sobreVozSvg : function voicePlaceholder() {
  let s = Ell(30, 46, 24, 3.6, { fill: '#2A1C24', opacity: 0.2, 'data-r': 'tone' });
  s += face(rr(6, 13, 48, 32, 3), '#EFE6FF');
  s += flat('M7.4 43.8 L30 29 L52.6 43.8Z', '#E2D5FA');
  s += part('M6.6 14 Q6.8 13.2 8 13.2 L52 13.2 Q53.2 13.2 53.4 14 L31.4 32.6 Q30 33.8 28.6 32.6Z', '#F8F3FF', { w: 1.6 });
  s += part(rr(19, 27, 22, 14, 7), '#9C7BE0', { w: 1.4 });
  s += line('M24 34V34M27.5 31V37M31 29.5V38.5M34.5 31.5V36.5M38 33.5V34.5', '#FFFFFF', 1.8);
  return piece(60, 50, s);
};

// El tablerito de corcho (cabecera del tablero de preguntas) y la
// tarjetita de los paquetes; sin el archivo de arte, no se muestran.
export const tableroSvg = typeof ext.tableroSvg === 'function' ? ext.tableroSvg : null;
export const regaloNotaSvg = typeof ext.regaloNotaSvg === 'function' ? ext.regaloNotaSvg : null;

// La repisita del diario: una tabla de madera con dos ménsulas, colgada
// en la pared (el diario va parado encima). 120×44.
export const REPISITA = { w: 120, h: 44, top: 14 };
export function repisitaSvg() {
  let s = shade('M8 20H112V27H8Z', '#2A1C24', 0.14);
  [22, 98].forEach((x) => {
    s += face(`M${x - 4} 20H${x + 4}V23Q${x + 4} 36 ${x - 2} 40H${x - 4}Z`, '#A86E44', { w: 1.5 });
    s += flat(`M${x - 2.6} 22H${x - 1}V36H${x - 2.6}Z`, '#C68B5E', { opacity: 0.8 });
  });
  s += woodSlab(4, 20, 112, 7, 16, '#C68B5E');
  return piece(120, 44, s);
}
