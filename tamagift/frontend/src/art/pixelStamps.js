import { registerFaceStamps } from './mochi/faceStamps.js';

// Piezas de pixel art hechas a mano (ojos, bocas, mejillas).
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

// ── Ojos genéricos por ánimo ─────────────────────────────────────
def('eye.redondos.normal', ['wk kk kk', '.k. kwk kkk .e.', '.kk. kwkk kkkk kkkk .ee.']);
def('eye.redondos.feliz', ['.k. k.k', '.kk. k..k', '.kkk. k...k']);
def('eye.redondos.dormido', ['k.k .k.', 'k..k .kk.', 'k...k .kkk.']);
def('eye.redondos.sorprendido', ['kk kk', '.k. kwk .k.', '.kk. kwwk kkkk .kk.']);
def('eye.redondos.enojado', ['k.. .kk kk', 'kk.. .kkk .wkk .kek', 'kk... .kk.. .kkkk .wkkk .kkek']);
def('eye.redondos.triste', ['..k wk. kk. ke.', '...kk wkk.. kkk.. kkk.. eke..', '....kk .kkk.. kwkk.. kkkk.. kkkk.. .ee.t.']);

// Variantes por estilo de ojo (las que no están caen en "redondos")
def('eye.puntitos.normal', ['k', 'kk', 'wk kk']);
def('eye.puntitos.sorprendido', ['k', 'kk kk']);
def('eye.grandes.normal', ['wkk kek kek', '.kk. kwek keek .kk.', '.kkk. kwwek kweek keeek .kkk.']);
def('eye.estrella.normal', ['.e. eee e.e', '..e.. .eee. eewee .e.e.', '..e.. ..e.. eewee .eee. .e.e.']);
def('eye.estrella.feliz', ['..e.. .eee. eewee .e.e.', '..e.. ..e.. eewee .eee. .e.e.']);
def('eye.corazon.normal', ['e.e eee .e.', 'ee.ee ewee. .eee. ..e..', '.e.e. eweee eeeee .eee. ..e..']);
def('eye.corazon.feliz', ['ee.ee ewee. .eee. ..e..', '.e.e. eweee eeeee .eee. ..e..']);
def('eye.somnolientos.normal', ['kkk kek', 'kkkk kwkk .ee.', 'kkkkk .kwkk .keek']);
def('eye.delineados.normal', ['.wk. .kkk kek.', '...k. kwkk. kkkk. .ee..', '....kk .kwk.. kkkkk. kkkk.. .ee...']);
def('eye.rebelde.normal', ['kkk. .wek', 'kkkk. .wek. ..ww.', 'kkkkk. .wwek. ..www.']);
def('eye.pestanudos.normal', ['..k wk. kk. ke.', '...k. .kk.k kwkk. kkkk. .ee..', '....k. ..k.k. .kk.k. kwkk.. kkkk.. .ee...']);
def('eye.pestanudos.feliz', ['..k .k. k.k', '...k. .kk.. k..k.', '....k. .kkk.. k...k.']);
def('eye.cruzados.normal', ['k.k .k. k.k', 'k..k .kk. .kk. k..k', 'k...k .k.k. ..k.. .k.k. k...k']);
def('eye.cruzados.feliz', ['k.k .k. k.k', 'k..k .kk. .kk. k..k']);

// ── Bocas ────────────────────────────────────────────────────────
def('mouth.sonrisa.normal', ['k.k .k.', 'k..k .kk.', 'k...k .kkk.']);
def('mouth.w.normal', ['k.k.k .k.k.', 'k..k..k .kk.kk.', 'k...k...k .k.k.k.k. ..k...k..']);
def('mouth.hocico.normal', ['.k. k.k', '.kkk. ..k.. .k.k.', '..kkk.. ..kkk.. ...k... .kk.kk.']);
def('mouth.hocico.feliz', ['.k. krk', '.kkk. ..k.. krrrk .rpr.', '..kkk.. ...k... .krrrk. ..rpr..']);
def('mouth.hocico.enojado', ['.k. .k. k.k', '.kkk. ..k.. .kkk. k...k']);
def('mouth.hocico.triste', ['.kkk. ..k.. .k.k. k...k']);
def('mouth.hocico.sorprendido', ['.kkk. ..k.. ..r.. .rrr.']);
def('mouth.hocico.dormido', ['.kkk. ..k.. .kkk.']);
def('mouth.sonrisa.feliz', ['krk .p.', 'krrk .pp.', 'krrrk .rpr. ..k..', 'krrrrk .rppr. ..rr..']);
def('mouth.sonrisa.enojado', ['.k. k.k', '.kk. k..k', '.kkk. k...k']);
def('mouth.sonrisa.triste', ['.k.k. k.k.k', '..k.k.. .k.k.k. k.....k']);
def('mouth.sonrisa.sorprendido', ['k', '.k. krk .k.', '.kk. krrk .kk.']);
def('mouth.sonrisa.dormido', ['kk', '.kk.', 'k..k .kk.']);
def('mouth.colmillos.normal', ['k.k w.w', 'k...k .kkk. .w.w.', 'k.....k .kkkkk. .w...w.']);
def('mouth.colmillos.feliz', ['krrrk .w.w. ..r..', 'krrrrrk .w.r.w. ..rpr..']);
def('mouth.lengua.normal', ['k.k .kp ..p', 'k...k .kkp. ...pp', 'k....k .kkpp. ...pp.']);
def('mouth.ladeada.normal', ['..k kk.', '...k .kk.', '....k ..kk. kk...']);
def('mouth.labios.normal', ['rr', '.r.r. rrrrr .rrr.', '.rr.rr. rrrrrrr .rrrrr.']);
def('mouth.grito.normal', ['kk rk', '.k. krk kpk', '.kk. krrk krrk .kk.']);
def('mouth.pico.normal', ['ggg .g.', '.ggg. ggggg .ggg.', '..ggg.. ggggggg .ggggg. ..ggg..']);
def('mouth.pico.feliz', ['ggg rrr ggg', '.ggg. .rrr. .ggg.', '.gggg. ..rr.. .gggg.']);

// ── Mejillas ─────────────────────────────────────────────────────
def('cheek.redondos.normal', ['BB', 'BBB', 'BBBB .BB.']);
def('cheek.redondos.enojado', ['bb', 'bbb', 'bbbb .bb.']);
def('cheek.alargados.normal', ['BBB', 'BBBB', 'BBBBB']);
def('cheek.corazon.normal', ['b.b .b.', 'bb.bb .bbb. ..b..']);
def('cheek.rayitas.normal', ['w.w', 'BwBw', 'BwBwB .BBB.']);
def('cheek.brillos.normal', ['..w BB.', '...w. ..... .BBB.']);
def('cheek.sombras.normal', ['dd', 'ddd', 'dddd']);

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

// Rasgos que se agregaron después (cada módulo registra los suyos).
registerFaceStamps(def);

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
  return best;
}
