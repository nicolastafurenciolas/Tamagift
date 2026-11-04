import { faceStamp } from './mochi/bigFace.js';

// Piezas de pixel art hechas a mano (motivos, comida, objetos, íconos y,
// por medio de mochi/bigFace.js, la cara de la mochi).
// Cada pieza tiene varios tamaños; se usa el más grande que entra en la
// caja que ocupa la pieza vectorial en la rejilla.
//
//   k tinta   w blanco   e color de ojos   r boca   p lengua
//   b rubor   B rubor mezclado con la piel   t lágrima   g dorado
//   d un tono más oscuro que lo de abajo    l uno más claro
//   . transparente (se ve lo de abajo)

import { FOOD_PIXELS } from './pixel/food.js';
import { UI_PIXELS } from './pixel/ui.js';
import { GAME_PIXELS } from './pixel/game.js';

const S = {};
const def = (name, sizes) => { S[name] = sizes.map((rows) => ({ rows: typeof rows === 'string' ? rows.trim().split(/\s+/) : rows })).sort((a, b) => a.rows.length - b.rows.length); };

// Ojos, bocas y mejillas de la mochi: los arma mochi/bigFace.js al tamaño
// justo (ver faceStamp). Acá quedan los motivos y los dibujos enteros.

// ── Motivos de paredes y objetos ─────────────────────────────────
// e = color principal (data-c1), b = segundo color (data-c2), w = brillo
def('motif.heart', [
  '.e.e. eeeee eeeee .eee. ..e..',
  '.ee.ee. ewweeee eweeeee eeeeeee .eeeee. ..eee.. ...e...',
  '.eee.eee. eewweeeee ewweeeeee eweeeeeee eeeeeeeee .eeeeeee. ..eeeee.. ...eee... ....e....',
]);
def('motif.dot', ['ee ee', '.e. eee .e.', '.ee. ewee eeee .ee.', '.eee. eweee eeeee eeeee .eee.', '..ee.. .eeee. eweeee eeeeee .eeee. ..ee..']);
def('motif.star', [
  '.e. eee .e.',
  '..e.. .eee. eeeee .e.e.',
  '...e... ..eee.. eeeeeee .eeeee. ..eee.. .ee.ee. .e...e.',
]);
def('motif.flower', [
  '.e. ebe .e.',
  '.e.e. eeeee .ebe. eeeee .e.e.',
  '.ee.ee. eeeeeee .eebee. eebbbee .eebee. eeeeeee .ee.ee.',
]);


// ── Dibujos enteros hechos a mano (comida, objetos, íconos) ─────────
// Tienen su propia paleta: cada letra es un color (ver pixel/palette.js;
// cada dibujo puede cambiar o agregar letras). Se usan de dos formas:
//   · el SVG entero lleva data-px-sprite="food.fresa": en pixel se pinta
//     directamente este dibujo, en el tamaño que mejor llene la caja;
//   · un grupo con data-px="…" dentro de otro dibujo: se pinta en su
//     caja, agrandado por un entero si la caja es el doble o más.
const ART = {};
export function defArt(name, pal, sizes) {
  const list = sizes.map((rows) => {
    const r = typeof rows === 'string' ? rows.trim().split(/\s+/) : rows;
    if (import.meta.env && import.meta.env.DEV && r.some((x) => x.length !== r[0].length)) {
      console.warn(`pixel ${name}: filas de largo distinto`, r.map((x) => x.length));
    }
    return { rows: r, pal };
  }).sort((a, b) => a.rows.length - b.rows.length);
  ART[name] = list;
  S[name] = list;
}
export const artStampSizes = (name) => ART[name] || null;

// Los dibujos hechos a mano viven en art/pixel/ (uno por tema).
[FOOD_PIXELS, UI_PIXELS, GAME_PIXELS].forEach((group) => {
  Object.entries(group).forEach(([name, v]) => defArt(name, v.pal, v.sizes));
});

// El tamaño del dibujo que mejor llena una caja de w×h píxeles de
// rejilla, y por cuánto agrandarlo (siempre un entero: así cada píxel
// del dibujo es un cuadrado parejo).
export function pickArtStamp(name, w, h) {
  const sizes = ART[name];
  if (!sizes) return null;
  let best = null;
  for (const s of sizes) {
    const k = Math.floor(Math.min((w + 0.5) / s.rows[0].length, (h + 0.5) / s.rows.length));
    if (k < 1) continue;
    const size = s.rows.length * k;
    if (!best || size > best.size || (size === best.size && s.rows.length > best.st.rows.length)) best = { st: s, k, size };
  }
  return best ? { ...best.st, k: best.k } : { ...sizes[0], k: 1 };
}

// Elige la pieza: por nombre exacto, si no por estilo genérico del
// mismo ánimo, si no la normal de ese estilo.
export function stampFor(name, w, h) {
  if (ART[name]) return pickArtStamp(name, w, h);
  if (/^(eye|mouth|cheek|mark)\./.test(name)) return faceStamp(name, w, h);
  const [kind, style, mood] = name.split('.');
  const tries = [name, `${kind}.${style}.normal`, `${kind}.redondos.${mood}`, `${kind}.sonrisa.${mood}`, `${kind}.redondos.normal`, `${kind}.sonrisa.normal`];
  if (kind === 'mouth' && mood !== 'normal' && !S[name]) tries.splice(1, 0, `${kind}.sonrisa.${mood}`);
  if (kind === 'eye' && mood !== 'normal' && !S[name]) tries.splice(1, 0, `${kind}.redondos.${mood}`);
  let sizes = null;
  for (const t of tries) if (S[t]) { sizes = S[t]; break; }
  if (!sizes) return null;
  const maxH = Math.max(1, Math.round(h + 0.4)), maxW = Math.max(1, Math.round(w + 0.6));
  let best = sizes[0];
  for (const s of sizes) if (s.rows.length <= maxH && s.rows[0].length <= maxW + 1) best = s;
  // Si la caja es el doble o más que la pieza más grande, se agranda por
  // un entero (sigue siendo pixel art parejo y no queda como un puntito).
  const k = Math.floor(Math.min(maxH / best.rows.length, (maxW + 1) / best.rows[0].length));
  return k >= 2 ? { ...best, k } : best;
}
