// Pruebas de "Conecta 3 golosinas".
//   node src/match3.test.mjs

import assert from 'node:assert/strict';
import {
  SIZE, findMatches, applyGravity, resolveBoard, trySwap, hasAnyMove, createBoard, areAdjacent,
  findHint, previewSwap,
} from './match3.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

// Tablero desde filas escritas a mano, para que los casos se lean claro.
const board = (rows) => rows.flatMap((r) => [...r].map((ch) => (ch === '.' ? null : Number(ch))));

// Azar determinista (congruencial lineal): las pruebas tienen que dar
// siempre lo mismo. Un `() => 0` fijo no sirve porque haría que todas
// las fichas nuevas fueran iguales y se encadenaran cascadas sin fin.
function seededRnd(seed = 7) {
  let n = seed;
  return () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
}
const fixedRnd = seededRnd();

test('detecta línea horizontal de 3', () => {
  const g = board([
    '111000',
    '234234',
    '234234',
    '234234',
    '234234',
    '234234',
  ]);
  const hits = findMatches(g);
  assert.ok(hits.has(0) && hits.has(1) && hits.has(2), 'los tres primeros forman línea');
});

test('detecta línea vertical de 3', () => {
  const g = board([
    '512340',
    '512340',
    '512340',
    '212340',
    '312340',
    '412340',
  ]);
  const hits = findMatches(g);
  assert.ok(hits.has(0) && hits.has(SIZE) && hits.has(SIZE * 2), 'la columna 0 forma línea');
});

test('no inventa líneas donde no las hay', () => {
  const g = board([
    '010101',
    '101010',
    '010101',
    '101010',
    '010101',
    '101010',
  ]);
  assert.equal(findMatches(g).size, 0);
});

test('una línea de 4 cuenta las 4 fichas', () => {
  const g = board([
    '111120',
    '234234',
    '234234',
    '234234',
    '234234',
    '234234',
  ]);
  const hits = findMatches(g);
  assert.equal([...hits].filter((i) => i < SIZE).length, 4);
});

test('la gravedad hace caer las fichas y rellena arriba', () => {
  const g = board([
    '111111',
    '222222',
    '333333',
    '444444',
    '555555',
    '......',   // fila de abajo vacía
  ]);
  const next = applyGravity(g, 6, () => 0);
  assert.equal(next[SIZE * 5], 5, 'lo de arriba baja hasta el fondo');
  assert.ok(next.every((v) => v != null), 'no quedan huecos');
  assert.equal(next[0], 0, 'las fichas nuevas entran por arriba');
});

test('resolveBoard no se cuelga aunque el relleno siga formando líneas', () => {
  // Relleno constante: cada oleada de fichas nuevas vuelve a alinear.
  // Sin tope de cascadas esto giraría para siempre y colgaría la app.
  const g = board([
    '111000',
    '234234',
    '234234',
    '234234',
    '234234',
    '234234',
  ]);
  const res = resolveBoard(g, 5, () => 0);
  assert.ok(res.cascades <= 30, 'las cascadas tienen tope');
  assert.ok(res.cleared > 0);
});

test('resolveBoard limpia y deja el tablero sin líneas', () => {
  const g = board([
    '111000',
    '234234',
    '234234',
    '234234',
    '234234',
    '234234',
  ]);
  const { board: out, cleared, cascades } = resolveBoard(g, 5, seededRnd(3));
  assert.ok(cleared >= 3, `debe limpiar al menos 3 (limpió ${cleared})`);
  assert.ok(cascades < 30, 'con relleno variado las cascadas terminan solas');
  assert.equal(findMatches(out).size, 0, 'al terminar no pueden quedar líneas');
});

test('un intercambio que no forma línea se deshace y no puntúa', () => {
  const g = board([
    '010101',
    '101010',
    '010101',
    '101010',
    '010101',
    '101010',
  ]);
  const res = trySwap(g, 0, 1, 4, fixedRnd);
  assert.equal(res.ok, false, 'no debe aceptarse');
  assert.equal(res.cleared, 0);
  assert.deepEqual(res.board, g, 'el tablero queda igual que antes');
});

test('un intercambio que forma línea sí puntúa', () => {
  // Cambiar (0,0) con (1,0) pone tres '2' en la fila 0.
  const g = board([
    '122345',
    '234153',
    '345215',
    '451534',
    '515342',
    '153425',
  ]);
  const res = trySwap(g, 0, SIZE, 6, () => 0.99);
  assert.equal(res.ok, true, 'el intercambio debería valer');
  assert.ok(res.cleared >= 3, `debe limpiar al menos 3 (limpió ${res.cleared})`);
});

test('no se puede intercambiar fichas que no son vecinas', () => {
  const g = createBoard(5, () => 0.42);
  const res = trySwap(g, 0, 35, 5);
  assert.equal(res.ok, false);
});

test('areAdjacent reconoce vecinos y rechaza diagonales', () => {
  assert.equal(areAdjacent(0, 1), true, 'derecha');
  assert.equal(areAdjacent(0, SIZE), true, 'abajo');
  assert.equal(areAdjacent(0, SIZE + 1), false, 'diagonal no');
  assert.equal(areAdjacent(SIZE - 1, SIZE), false, 'no se envuelve de fila');
});

test('el tablero inicial no regala líneas y tiene jugadas', () => {
  for (let seed = 0; seed < 25; seed++) {
    let n = seed + 1;
    const rnd = () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
    const g = createBoard(5, rnd);
    assert.equal(findMatches(g).size, 0, `semilla ${seed}: no debe empezar con líneas`);
    assert.equal(hasAnyMove(g), true, `semilla ${seed}: debe haber al menos una jugada`);
  }
});

test('hasAnyMove ve la jugada obvia', () => {
  // Intercambiar (0,1) con (1,1) alinea tres '0' en la fila de arriba.
  const g = board([
    '010333',
    '101444',
    '245245',
    '452452',
    '524524',
    '245245',
  ]);
  assert.equal(hasAnyMove(g), true);
});

test('hasAnyMove coincide con una comprobación independiente', () => {
  // En vez de inventar a mano un tablero sin jugadas (fácil de
  // equivocarse: en un damero de 2 colores SÍ hay jugadas, porque un
  // cambio vertical alinea dos tríos horizontales), se compara contra
  // una implementación ingenua sobre muchos tableros al azar.
  const naive = (g) => {
    for (let a = 0; a < SIZE * SIZE; a++) {
      for (let b = 0; b < SIZE * SIZE; b++) {
        if (!areAdjacent(a, b)) continue;
        const t = [...g];
        [t[a], t[b]] = [t[b], t[a]];
        if (findMatches(t).size > 0) return true;
      }
    }
    return false;
  };

  let vistosConJugada = 0, vistosSinJugada = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const rnd = seededRnd(seed);
    // Pocos tipos → más probable que salga alguno sin jugadas.
    const g = Array.from({ length: SIZE * SIZE }, () => Math.floor(rnd() * 3));
    const esperado = naive(g);
    assert.equal(hasAnyMove(g), esperado, `semilla ${seed}`);
    esperado ? vistosConJugada++ : vistosSinJugada++;
  }
  assert.ok(vistosConJugada > 0, 'la muestra debe incluir tableros con jugada');
});

test('findHint devuelve una jugada que de verdad sirve', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const rnd = seededRnd(seed);
    const g = Array.from({ length: SIZE * SIZE }, () => Math.floor(rnd() * 4));
    const hint = findHint(g);
    if (hint === null) { assert.equal(hasAnyMove(g), false, `semilla ${seed}`); continue; }
    const [a, b] = hint;
    assert.equal(areAdjacent(a, b), true, `semilla ${seed}: la pista debe ser de vecinas`);
    const { matched } = previewSwap(g, a, b);
    assert.ok(matched.size >= 3, `semilla ${seed}: la pista tiene que formar línea`);
  }
});

test('previewSwap no toca el tablero original', () => {
  const g = createBoard(5, seededRnd(11));
  const copia = [...g];
  previewSwap(g, 0, 1);
  assert.deepEqual(g, copia, 'previewSwap no debe mutar lo que recibe');
});

console.log(`\n${passed} pruebas OK`);
