// Arma una mochi completa (SVG con partes) a partir de su receta.

import { G, P, Ell, E, svgDoc, mirrorX } from '../svg.js';
import { parseColor, hex, mixRgb, lum, rgbToHsl } from '../color.js';
import { geometry, SHAPES } from './body.js';
import { renderEyes, renderMouth, renderCheeks, EYES, MOUTHS, CHEEKS, INK, MOODS } from './face.js';
import { renderEars, colorsForEars, EARS } from './ears.js';
import { renderTail, renderPattern, TAILS, PATTERNS } from './tails.js';
import { HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES } from './accessories.js';
import { renderHair, renderBrows, hairColors, HAIRSTYLES, HAIR_COLORS, BROWS } from './hair.js';
import { renderMarks, MARKS } from './marks.js';
import { renderWear, wearOverflow, WARDROBE, SLOTS, findWearable, resolveWear } from './wardrobe/index.js';

export { WARDROBE, SLOTS, findWearable, resolveWear };

export { SHAPES, EYES, MOUTHS, CHEEKS, EARS, TAILS, PATTERNS, MOODS, HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, HAIRSTYLES, HAIR_COLORS, BROWS, MARKS };

export const DEFAULT_MOCHI = {
  body: 'mochi', ears: 'gato', eyes: 'redondos', mouth: 'w', tail: 'ninguna', cheeks: 'redondos', pattern: 'ninguno',
  headAcc: 'ninguno', neckAcc: 'ninguno', extraAcc: 'ninguno',
  hair: 'ninguno', brows: 'ninguna', marks: 'ninguna',
  bodyColor: '#FBEEE6', innerColor: '#FFFFFF', accentColor: '#E9A3B5', accentAlt: '#FFFFFF', eyeColor: '#6F6A8A',
};

const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
const isPale = (c) => lum(parseColor(c)) > 0.82;

function colorsOf(r) {
  const body = r.bodyColor || DEFAULT_MOCHI.bodyColor;
  const inner = r.innerColor || '#FFFFFF';
  const accent = r.accentColor || '#E9A3B5';
  const accentAlt = r.accentAlt || '#FFFFFF';
  const [h, s] = rgbToHsl(parseColor(accent));
  const pinkish = s > 0.25 && (h > 300 || h < 25);
  const c = {
    body, inner, accent, accentAlt,
    eye: r.eyeColor || '#6F6A8A',
    blush: pinkish ? mixc(accent, '#FF8FA8', 0.5) : '#FF8FA8',
    lips: isPale(accent) ? '#C4455A' : accent,
    tailTip: mixc(inner, '#FFFFFF', 0.3),
    devil: '#D9364F',
  };
  return { ...c, ...colorsForEars(c), ...hairColors(r) };
}

/**
 * SVG (string) de la mochi, con partes marcadas para los kits.
 * @param {object} recipe
 * @param {string} mood  normal | feliz | triste | enojado | dormido | sorprendido
 */
export function mochiSvg(recipe = DEFAULT_MOCHI, mood = 'normal') {
  const r = { ...DEFAULT_MOCHI, ...recipe };
  const g = geometry(r.body, r.chub);
  const c = colorsOf(r);
  const ears = renderEars(r.ears, g, c);
  const shift = ears.faceShift || { y: 0, dx: 0 };
  // (la boca no se corre con los ojos: ver renderMouth más abajo)
  const mouthY = g.face.mouthY + (ears.faceShift ? -4 : 0);
  const wear = renderWear(r, g, c, mood, { y: g.face.y + shift.y, dx: g.face.dx + (shift.dx || 0), mouthY });
  const hair = renderHair(r.hair, g, c);
  const parts = [];
  parts.push(Ell(100, 185, g.w * 0.43, 6.5, { fill: '#2A1C30', opacity: 0.16, 'data-r': 'tone' }));
  parts.push(wear.back);
  parts.push(renderTail(r.tail, g, c));
  parts.push(hair.back);
  parts.push(ears.back);
  parts.push(P(g.path, { fill: c.body, stroke: INK, 'stroke-width': 2.8, 'stroke-linejoin': 'round', 'data-r': 'body' }));
  parts.push(renderPattern(r.pattern, g, c));
  parts.push(Ell(g.belly.cx, g.belly.cy, g.belly.rx, g.belly.ry, { fill: c.inner, 'data-r': 'flat', opacity: c.inner.toUpperCase() === c.body.toUpperCase() ? 0 : 0.95 }));
  parts.push(Ell(g.shine.x, g.shine.y, g.w * 0.1, g.height * 0.055, { fill: '#FFFFFF', opacity: 0.7, transform: `rotate(-32 ${g.shine.x} ${g.shine.y})`, 'data-r': 'tone' }));
  parts.push(wear.outfit);
  parts.push(g.feet.map((x) => Ell(x, 180, 10.5 * Math.pow(g.wf, 0.4), 6, { fill: mixc(c.body, '#FFFFFF', 0.12), stroke: INK, 'stroke-width': 2.4, 'data-r': 'part' })).join(''));
  parts.push(wear.neck);
  parts.push(hair.front);
  parts.push(ears.front);
  parts.push(ears.face);
  parts.push(renderCheeks(r.cheeks, g, mood, c, { y: shift.y * 0.15, dx: (shift.dx || 0) * 0.6 }));
  parts.push(renderMarks(r.marks, g, mood, c, shift));
  parts.push(wear.under);
  parts.push(renderBrows(r.brows, g, mood, c, shift));
  parts.push(renderEyes(r.eyes, g, mood, c, shift, { brows: r.brows && r.brows !== 'ninguna' }));
  parts.push(renderMouth(r.mouth, g, mood, c, { y: mouthY - g.face.mouthY }));
  parts.push(hair.top);
  parts.push(wear.front);
  parts.push(wear.hand);
  // Que entre entera: alas, colas largas y capas sobresalen del cuerpo;
  // en los anchos más grandes se achica todo un poco desde el piso.
  const wings = ['alas', 'dragon'].includes(r.ears) ? 32 : r.ears === 'axolote' ? 24 : r.ears === 'leon' ? 22 : ['vaca', 'abeja'].includes(r.ears) ? 18 : ['murcielago', 'koala', 'raton', 'ciervo'].includes(r.ears) ? 10 : 3;
  const TAIL_OUT = { gato: 26, esponjosa: 40, corta: 16, rizada: 22, lazo: 30, demonio: 30, puas: 42, sirena: 40, ardilla: 46, leon: 28, corazon: 28 };
  const HAIR_OUT = { coletas: 34, cola: 16, afro: 22, melena: 14, bob: 10, rulos: 18 };
  const hairOut = HAIR_OUT[r.hair] || 0;
  const wo = wearOverflow(r);
  const capa = resolveWear(r).cuello?.id === 'capa';
  const right = Math.max(g.r + (TAIL_OUT[r.tail] || 3), capa ? g.r + 44 : 0, g.r + wings, g.r + hairOut, g.r + wo.right);
  const left = g.l - Math.max(wings, hairOut, wo.left);
  const half = Math.max(100 - left, right - 100);
  const k = Math.min(1, 95 / half);
  const body = parts.join('');
  const inner = k < 0.999 ? G({ transform: `translate(100 186) scale(${k.toFixed(3)}) translate(-100 -186)` }, body) : body;
  return svgDoc(200, 200, inner);
}

export { geometry };
