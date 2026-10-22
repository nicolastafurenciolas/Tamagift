// Pruebas de "Conecta 3 golosinas".
//   node src/match3.test.mjs

import assert from 'node:assert/strict';
import {
  ROWS, COLS, findRuns, findGroups, classifyGroup, applyGravity, playSwap, hasAnyMove, createBoard,
  areAdjacent, findHint, allMoves, blastCells, LEVELS, levelBoard, goalStatus, starsFor, jellyLeft, shuffleBoard,
} from './match3.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

// Azar determinista: las pruebas tienen que dar siempre lo mismo.
function seededRnd(seed = 7) {
  let n = seed;
  return () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
}

// Tablero desde filas escritas a mano (7×7). Dígito = tipo; letras =
// especiales sobre el tipo 0: h/v rayadas, b bomba, C bola de colores;
// '.' casilla vacía, ' ' casilla que no existe.
let ids = 0;
function board(rows, types = 5) {
  const cells = [];
  const mask = [];
  rows.forEach((r) => [...r].forEach((ch) => {
    mask.push(ch !== ' ');
    if (ch === ' ' || ch === '.') { cells.push(null); return; }
    ids += 1;
    if (ch === 'h' || ch === 'v') cells.push({ id: ids, t: 0, sp: ch });
    else if (ch === 'b') cells.push({ id: ids, t: 0, sp: 'bomb' });
    else if (ch === 'C') cells.push({ id: ids, t: -1, sp: 'color' });
    else cells.push({ id: ids, t: Number(ch), sp: null });
  }));
  return { rows: rows.length, cols: rows[0].length, types, cells, mask: mask.every(Boolean) ? null : mask, jelly: new Array(cells.length).fill(0), nextId: 1000 };
}
const at = (r, c) => r * COLS + c;

const NOISE = [
  '1234123',
  '2341234',
  '3412341',
  '4123412',
  '1234123',
  '2341234',
  '3412341',
];

test('detecta líneas horizontales y verticales', () => {
  const b = board(['0001234', ...NOISE.slice(1)]);
  const runs = findRuns(b);
  assert.equal(runs.length, 1);
  assert.deepEqual(runs[0].cells, [0, 1, 2]);
  const v = board(NOISE.map((r, i) => (i < 3 ? `0${r.slice(1)}` : r)));
  assert.ok(findRuns(v).some((r) => r.dir === 'v' && r.cells.length === 3));
});

test('no inventa líneas en un tablero sin ellas', () => {
  assert.equal(findRuns(board(NOISE)).length, 0);
});

test('4 en línea hace rayada; 5 hace bola de colores; L hace bomba', () => {
  const four = board(['0000123', ...NOISE.slice(1)]);
  const g4 = findGroups(four)[0];
  assert.equal(classifyGroup(four, g4, [1]).sp, 'h');
  const five = board(['0000023', ...NOISE.slice(1)]);
  assert.equal(classifyGroup(five, findGroups(five)[0]).sp, 'color');
  const ell = board(['0001234', '0234123', '0412341', ...NOISE.slice(3)]);
  const gs = findGroups(ell);
  assert.equal(gs.length, 1, 'la L es un solo grupo');
  assert.equal(classifyGroup(ell, gs[0]).sp, 'bomb');
});

test('una jugada válida limpia, crea la especial donde se jugó y gasta el tablero viejo', () => {
  // mover el 0 de (1,3) a (0,3) completa 0000 en la fila de arriba
  const b = board(['0001234', '2340123', ...NOISE.slice(2)]);
  const res = playSwap(b, at(0, 3), at(1, 3), seededRnd());
  assert.ok(res.ok);
  const first = res.steps[0];
  assert.equal(first.created.length, 1);
  assert.equal(first.created[0].sp, 'h');
  assert.equal(first.created[0].at, at(0, 3), 'nace donde llegó la golosina movida');
  assert.equal(first.collected[0], 3);
});

test('una jugada que no hace nada no gasta movimiento', () => {
  const b = board(NOISE);
  const res = playSwap(b, at(0, 0), at(0, 1), seededRnd());
  assert.equal(res.ok, false);
  assert.equal(res.board, b);
});

test('no se puede cambiar con una casilla lejana o que no existe', () => {
  const b = board(['  01234', ...NOISE.slice(1)]);
  assert.equal(areAdjacent(b, 0, 2), false);
  assert.equal(playSwap(b, at(0, 1), at(0, 2), seededRnd()).ok, false);
});

test('la rayada limpia su fila entera al estallar', () => {
  const b = board(NOISE);
  const cells = blastCells(b, at(3, 3), 'h', 0);
  assert.deepEqual(cells, [0, 1, 2, 3, 4, 5, 6].map((c) => at(3, c)));
  assert.equal(blastCells(b, at(3, 3), 'bomb', 0).length, 9);
});

test('la bola de colores con una golosina se lleva todas las de ese tipo', () => {
  const b = board(['C123412', ...NOISE.slice(1)]);
  const ones = b.cells.filter((c) => c && c.t === 1).length;
  const res = playSwap(b, at(0, 0), at(0, 1), seededRnd());
  assert.ok(res.ok);
  assert.ok(res.steps[0].collected[1] >= ones, 'se llevó todas las del tipo 1');
});

test('dos especiales juntas combinan su explosión', () => {
  const b = board(['hv12341', ...NOISE.slice(1)]);
  const res = playSwap(b, at(0, 0), at(0, 1), seededRnd());
  assert.ok(res.ok);
  assert.ok(res.steps[0].cleared.length >= ROWS + COLS - 1, 'fila y columna completas');
});

test('la gravedad conserva las golosinas, las baja y rellena arriba', () => {
  const b = board(['1234123', '.......', ...NOISE.slice(2)]);
  const keepIds = b.cells[at(0, 0)].id;
  const g = applyGravity(b, seededRnd());
  assert.equal(g.cells[at(1, 0)].id, keepIds, 'la de arriba bajó una casilla');
  assert.ok(g.cells[at(0, 0)].drop >= 1, 'la nueva sabe desde dónde cae');
  assert.ok(g.cells.every((c, i) => !b.mask || !b.mask[i] || c), 'no quedan huecos');
});

test('la gravedad salta las casillas que no existen', () => {
  const b = board(['1      ', '       ', '2      ', ...NOISE.slice(3)]);
  const g = applyGravity(b, seededRnd());
  assert.equal(g.cells[at(1, 0)], null, 'la casilla que no existe sigue vacía');
  assert.equal(g.cells[at(2, 0)].t, 2);
});

test('cada cascada termina (tope) y el tablero queda lleno', () => {
  const rnd = seededRnd(3);
  let b = createBoard({ types: 3 }, rnd);
  for (let k = 0; k < 40; k++) {
    const m = allMoves(b)[0];
    if (!m) { b = shuffleBoard(b, rnd); continue; }
    const res = playSwap(b, m[0], m[1], rnd);
    assert.ok(res.ok);
    assert.ok(res.steps.length <= 30);
    b = res.board;
    assert.ok(b.cells.every(Boolean), 'sin huecos');
  }
});

test('un tablero nuevo no trae líneas hechas y siempre tiene jugada', () => {
  for (let s = 1; s < 25; s++) {
    const b = createBoard({ types: 6 }, seededRnd(s));
    assert.equal(findRuns(b).length, 0);
    assert.ok(hasAnyMove(b));
    assert.ok(findHint(b));
  }
});

test('todos los niveles arman su tablero con su forma y gelatina', () => {
  assert.equal(LEVELS.length, 30);
  LEVELS.forEach((L0) => {
    const b = levelBoard(L0.level, seededRnd(L0.level));
    assert.equal(findRuns(b).length, 0, `nivel ${L0.level}`);
    assert.ok(hasAnyMove(b), `nivel ${L0.level} sin jugadas`);
    if (L0.goals.some((g) => g.kind === 'jelly')) assert.ok(jellyLeft(b) > 0, `nivel ${L0.level} sin gelatina`);
    L0.goals.filter((g) => g.kind === 'collect').forEach((g) => assert.ok(g.t < L0.types, `nivel ${L0.level}: tipo inexistente`));
  });
});

test('las metas y las estrellas se cuentan bien', () => {
  const st = goalStatus(2, { score: 0, collected: { 0: LEVELS[1].goals[0].n }, board: levelBoard(2, seededRnd()) });
  assert.equal(st.done, true);
  assert.equal(starsFor(1, 0), 1);
  assert.equal(starsFor(1, 99999), 3);
});

// Un bot sencillo (elige la jugada que más limpia) tiene que poder ganar
// cada nivel al menos una vez en pocos intentos: si no, el nivel está mal
// calibrado y frustraría a cualquiera.
function botPlays(level, seed) {
  const rnd = seededRnd(seed);
  const L0 = LEVELS[level - 1];
  let b = levelBoard(level, rnd);
  let score = 0;
  const collected = {};
  for (let m = 0; m < L0.moves; m++) {
    let best = null;
    for (const [a, c] of allMoves(b)) {
      const r = playSwap(b, a, c, seededRnd(seed * 31 + m));
      if (!r.ok) continue;
      const gain = r.steps.reduce((s0, st) => s0 + st.points + st.jellyHit.length * 15 + L0.goals.filter((g) => g.kind === 'collect').reduce((x, g) => x + (st.collected[g.t] || 0) * 12, 0), 0);
      if (!best || gain > best.gain) best = { a, c, gain };
    }
    if (!best) { b = shuffleBoard(b, rnd); continue; }
    const r = playSwap(b, best.a, best.c, rnd);
    r.steps.forEach((st, k) => { score += st.points * (k + 1); Object.entries(st.collected).forEach(([t, n]) => { collected[t] = (collected[t] || 0) + n; }); });
    b = r.board;
    if (!hasAnyMove(b)) b = shuffleBoard(b, rnd);
    if (goalStatus(level, { score, collected, board: b }).done) return true;
  }
  return false;
}

test('cada nivel se puede ganar (bot sencillo, varios intentos)', () => {
  const lost = [];
  for (const L0 of LEVELS) {
    let won = false;
    for (let s = 1; s <= 4 && !won; s++) won = botPlays(L0.level, s * 17 + L0.level);
    if (!won) lost.push(L0.level);
  }
  assert.deepEqual(lost, [], `niveles que el bot no gana: ${lost.join(', ')}`);
});

console.log(`\n${passed} pruebas OK`);
