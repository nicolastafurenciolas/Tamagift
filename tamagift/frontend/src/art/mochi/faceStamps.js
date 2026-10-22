// Píxeles hechos a mano de los rasgos nuevos (ojos, bocas, mejillas).
// Mismo formato que art/pixelStamps.js: cada pieza en varios tamaños, filas
// separadas por espacios; el ojo es el izquierdo (el derecho se espeja).
//
//   k tinta   w blanco   e color de ojos   r boca   p lengua   t lágrima
//   b rubor   B rubor mezclado con la piel   . transparente

export function registerFaceStamps(def) {
  // ── Ojos ───────────────────────────────────────────────────────
  // anime: pestaña gruesa que se sale hacia afuera (a la izquierda)
  def('eye.anime.normal', ['kkk kwe kee', 'kkkk .kwe .kee .ee.', 'kkkkk .kwek .keek .keek ..ee.', 'kkkkkk .kwwek .kwkek .keeek .keeek ..eee.']);
  // gato: almendra con la pupila en rendija
  def('eye.gato.normal', ['.k. eke .k.', '.kkk. kekwk .kkk.', '.kkk. kekwk kekek .kkk.', '..kkk. .kekwk kekeek .keke. ..kk..']);
  // brillitos: destello de cuatro puntas
  def('eye.brillitos.normal', ['kwk www kek', '.kk. kwkk wwwk kwkk .ee.', '.kkk. kkwkk kwwwk kkwkk .kek.', '.kkkk. kkwkkk kwwwkk kkwkkk keeeek .kkkk.']);
  // brillosos: ojo grande y lágrima de brillo abajo
  def('eye.llorosos.normal', ['wk kk tt', '.kk. kwkk kkkk .tt.', '.kkk. kwkkk kkkkk keeek .ttt.', '.kkkk. kwwkkk kwkkkk kkkkkk keeeek .tttt.']);
  // botones de peluche (no cambian con el ánimo)
  for (const m of ['normal', 'feliz', 'triste', 'enojado', 'dormido', 'sorprendido']) {
    def(`eye.botones.${m}`, ['kk kk', '.k. kwk .k.', '.kk. kwwk kwwk .kk.', '.kkk. kwkwk kkkkk kwkwk .kkk.']);
  }

  // ── Bocas ──────────────────────────────────────────────────────
  def('mouth.abierta.normal', ['krk .p.', 'krrk .pp.', 'krrrk .rpr. ..k..']);
  def('mouth.dientito.normal', ['k.k .w.', 'k..k .kk. .w..', 'k...k .kkk. ..w..', 'k....k .kkkk. ..ww..']);
  def('mouth.triangulo.normal', ['krk .k.', 'krrk .kk.', 'krrrk .kpk. ..k..', 'krrrrk .krpk. ..kk..']);
  def('mouth.beso.normal', ['kk .k kk', 'kk. ..k kk.', 'kk. ..k .k. ..k kk.']);
  def('mouth.pucheros.normal', ['rr', '.rr. rrrr', '.r.r. rrrrr .rrr.']);

  // ── Mejillas ───────────────────────────────────────────────────
  def('cheek.grandes.normal', ['BBB', 'BBBB BBBB', 'BBBBB BBBBB .BBB.', '.BBBB. BBBBBB BBBBBB .BBBB.']);
  def('cheek.grandes.enojado', ['bbb', 'bbbb bbbb', 'bbbbb bbbbb .bbb.']);
  def('cheek.estrellas.normal', ['.b. bbb .b.', '..b.. .bbb. bbbbb .b.b.']);
  def('cheek.lineas.normal', ['BbB', 'BbBb bBbB', 'BBbBb BbBbB .BBB.']);
  def('cheek.lineas.enojado', ['bkb', 'bkbk kbkb', 'bbkbk bkbkb .bbb.']);
}
