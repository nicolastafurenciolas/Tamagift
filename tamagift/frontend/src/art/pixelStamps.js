// Piezas de pixel art hechas a mano (ojos, bocas, mejillas).
// Cada pieza tiene varios tamaños; se usa el más grande que entra en la
// caja que ocupa la pieza vectorial en la rejilla.
//
//   k tinta   w blanco   e color de ojos   r boca   p lengua
//   b rubor   B rubor mezclado con la piel   t lágrima   g dorado
//   d un tono más oscuro que lo de abajo    l uno más claro
//   . transparente (se ve lo de abajo)

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

// Elige la pieza: por nombre exacto, si no por estilo genérico del
// mismo ánimo, si no la normal de ese estilo.
export function stampFor(name, w, h) {
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
