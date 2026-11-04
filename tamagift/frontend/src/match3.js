// ─────────────────────────────────────────────────────────────────
// Lógica de "Conecta 3 golosinas" (sin React: ver match3.test.mjs).
//
// Un tablero es un objeto:
//   { rows, cols, types, cells, mask, jelly, nextId }
//   · cells[i]  null o { id, t, sp }: t es el tipo de golosina (0..types-1)
//               y sp la golosina especial (null, 'h', 'v', 'bomb', 'color').
//               El `id` no cambia al caer: así la pantalla puede animar
//               cada golosina hasta su lugar nuevo.
//   · mask[i]   false = esa casilla no existe (tableros con forma).
//   · jelly[i]  capas de gelatina bajo la casilla (0, 1 o 2).
//
// Especiales (como en los juegos del género, para que se sienta familiar):
//   · 4 en línea  → rayada: limpia su fila ('h') o su columna ('v')
//   · L o T       → bomba: limpia el 3×3 de alrededor
//   · 5 en línea  → bola de colores: cambiada con una golosina, se lleva
//                    todas las de ese tipo
// Y combinadas entre sí hacen cosas más grandes (ver swapSpecials).
// ─────────────────────────────────────────────────────────────────

export const ROWS = 7;
export const COLS = 7;
const MAX_CASCADES = 30;

const at = (b, r, c) => r * b.cols + c;
const rc = (b, i) => [Math.floor(i / b.cols), i % b.cols];
const playable = (b, i) => !b.mask || b.mask[i];
const isCandy = (cell) => !!cell && cell.t >= 0 && cell.sp !== 'color';

export function cloneBoard(b) {
  return { ...b, cells: b.cells.map((c) => (c ? { ...c } : c)), jelly: b.jelly ? [...b.jelly] : null, mask: b.mask };
}

function newCell(b, t, sp = null) {
  b.nextId += 1;
  return { id: b.nextId, t, sp };
}

export function areAdjacent(b, a, c) {
  const [ra, ca] = rc(b, a), [rb, cb] = rc(b, c);
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1;
}

// ── Líneas y grupos ───────────────────────────────────────────────

// Tramos de 3 o más golosinas iguales en fila o columna.
export function findRuns(b) {
  const runs = [];
  const scan = (len, outer, cellAt, dir) => {
    for (let o = 0; o < outer; o++) {
      let start = 0;
      for (let k = 1; k <= len; k++) {
        const prev = b.cells[cellAt(o, k - 1)];
        const cur = k < len ? b.cells[cellAt(o, k)] : null;
        const same = k < len && isCandy(prev) && isCandy(cur) && prev.t === cur.t;
        if (same) continue;
        if (k - start >= 3 && isCandy(b.cells[cellAt(o, start)])) {
          runs.push({ dir, t: b.cells[cellAt(o, start)].t, cells: Array.from({ length: k - start }, (_, j) => cellAt(o, start + j)) });
        }
        start = k;
      }
    }
  };
  scan(b.cols, b.rows, (r, c) => at(b, r, c), 'h');
  scan(b.rows, b.cols, (c, r) => at(b, r, c), 'v');
  return runs;
}

// Junta los tramos que comparten golosinas (una L son dos tramos).
export function findGroups(b) {
  const runs = findRuns(b);
  const groups = [];
  for (const run of runs) {
    const touching = groups.filter((g) => run.cells.some((i) => g.cells.has(i)));
    const merged = { t: run.t, cells: new Set(run.cells), runs: [run] };
    for (const g of touching) {
      g.cells.forEach((i) => merged.cells.add(i));
      merged.runs.push(...g.runs);
      groups.splice(groups.indexOf(g), 1);
    }
    groups.push(merged);
  }
  return groups;
}

// Qué especial nace de un grupo y dónde. `prefer` son las casillas que se
// acaban de mover: el especial aparece donde la persona hizo la jugada.
export function classifyGroup(b, g, prefer = []) {
  const longest = g.runs.reduce((m, r) => (r.cells.length > m.cells.length ? r : m), g.runs[0]);
  const hasH = g.runs.some((r) => r.dir === 'h'), hasV = g.runs.some((r) => r.dir === 'v');
  let sp = null;
  if (longest.cells.length >= 5) sp = 'color';
  else if (hasH && hasV) sp = 'bomb';
  else if (longest.cells.length === 4) sp = longest.dir === 'h' ? 'h' : 'v';
  if (!sp) return null;
  const free = (i) => !b.cells[i].sp;
  let pos = prefer.find((i) => g.cells.has(i) && free(i));
  if (pos == null && sp === 'bomb') {
    // la esquina de la L / el cruce de la T
    const [h, v] = [g.runs.find((r) => r.dir === 'h'), g.runs.find((r) => r.dir === 'v')];
    pos = h.cells.find((i) => v.cells.includes(i));
    if (pos != null && !free(pos)) pos = null;
  }
  if (pos == null) {
    const mid = longest.cells[Math.floor(longest.cells.length / 2)];
    pos = free(mid) ? mid : [...g.cells].find(free);
  }
  return pos == null ? null : { at: pos, sp, t: g.t };
}

// ── Explosiones ───────────────────────────────────────────────────

function mostCommonType(b) {
  const n = new Array(b.types).fill(0);
  b.cells.forEach((c) => { if (isCandy(c)) n[c.t] += 1; });
  return n.indexOf(Math.max(...n));
}

// Casillas que alcanza una especial al estallar en `i`.
export function blastCells(b, i, sp, t) {
  const [r, c] = rc(b, i);
  const out = [];
  const add = (rr, cc) => { if (rr >= 0 && cc >= 0 && rr < b.rows && cc < b.cols && playable(b, at(b, rr, cc))) out.push(at(b, rr, cc)); };
  if (sp === 'h') for (let k = 0; k < b.cols; k++) add(r, k);
  else if (sp === 'v') for (let k = 0; k < b.rows; k++) add(k, c);
  else if (sp === 'bomb') for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) add(r + dr, c + dc);
  else if (sp === 'color') {
    const tt = t >= 0 ? t : mostCommonType(b);
    b.cells.forEach((cell, j) => { if (cell && cell.t === tt) out.push(j); });
    out.push(i);
  }
  return out;
}

// ── Un paso: limpiar lo que hay que limpiar ───────────────────────
// `seed` son casillas que se limpian aunque no formen línea (las de una
// combinación de especiales). Devuelve null si no hay nada que hacer.
function clearStep(b, prefer = [], seed = null) {
  const groups = findGroups(b);
  if (!groups.length && !seed) return null;
  const before = cloneBoard(b);
  const next = cloneBoard(b);
  const toClear = new Set(seed || []);
  const created = [];
  for (const g of groups) {
    g.cells.forEach((i) => toClear.add(i));
    const cls = classifyGroup(b, g, prefer);
    if (cls) created.push(cls);
  }
  const keep = new Set(created.map((c) => c.at));
  keep.forEach((i) => toClear.delete(i));

  // Las especiales alcanzadas estallan y pueden alcanzar a otras.
  const fired = [];
  const queue = [...toClear].filter((i) => b.cells[i] && b.cells[i].sp);
  const seen = new Set(queue);
  while (queue.length) {
    const i = queue.shift();
    const cell = b.cells[i];
    fired.push({ i, sp: cell.sp });
    for (const j of blastCells(b, i, cell.sp, cell.sp === 'color' ? -1 : cell.t)) {
      if (keep.has(j)) continue;
      toClear.add(j);
      if (b.cells[j] && b.cells[j].sp && !seen.has(j)) { seen.add(j); queue.push(j); }
    }
  }

  const collected = {};
  const jellyHit = [];
  let points = 0;
  for (const i of toClear) {
    const cell = next.cells[i];
    if (cell) {
      if (cell.t >= 0) collected[cell.t] = (collected[cell.t] || 0) + 1;
      points += 10;
    }
    if (next.jelly && next.jelly[i] > 0) { next.jelly[i] -= 1; jellyHit.push(i); points += 20; }
    next.cells[i] = null;
  }
  const made = new Set();
  for (const c of created) {
    if (made.has(c.at)) continue;
    made.add(c.at);
    next.cells[c.at] = newCell(next, c.t, c.sp);
    points += c.sp === 'color' ? 60 : c.sp === 'bomb' ? 40 : 30;
  }
  return { before, afterClear: next, cleared: [...toClear], created, fired, collected, jellyHit, points, specials: created.length };
}

// ── Caída ─────────────────────────────────────────────────────────
// Las golosinas bajan por su columna saltándose las casillas que no
// existen, y entran nuevas por arriba. Las nuevas guardan `drop` (cuántas
// casillas por encima del tablero empiezan) para animar la entrada.
export function applyGravity(b, rnd = Math.random) {
  const next = cloneBoard(b);
  for (let c = 0; c < b.cols; c++) {
    const slots = [];
    for (let r = 0; r < b.rows; r++) if (playable(b, at(b, r, c))) slots.push(at(b, r, c));
    const existing = slots.map((i) => next.cells[i]).filter(Boolean);
    const missing = slots.length - existing.length;
    const fresh = Array.from({ length: missing }, (_, k) => ({ ...newCell(next, Math.floor(rnd() * b.types)), drop: missing - k }));
    const column = [...fresh, ...existing.map((cell) => { const { drop, ...rest } = cell; return rest; })];
    slots.forEach((i, k) => { next.cells[i] = column[k]; });
  }
  return next;
}

function resolveFrom(b, first, rnd) {
  const steps = [first];
  let board = applyGravity(first.afterClear, rnd);
  first.afterFall = board;
  for (let n = 1; n < MAX_CASCADES; n++) {
    const s = clearStep(board);
    if (!s) break;
    s.afterFall = applyGravity(s.afterClear, rnd);
    steps.push(s);
    board = s.afterFall;
  }
  return { steps, board };
}

// ── Jugadas ───────────────────────────────────────────────────────

function swapped(b, a, c) {
  const s = cloneBoard(b);
  [s.cells[a], s.cells[c]] = [s.cells[c], s.cells[a]];
  return s;
}

// Combinaciones de especiales (o una bola de colores con cualquier cosa).
// Devuelve las casillas a limpiar y, si toca, el tablero ya transformado.
function swapSpecials(b, a, c) {
  const A = b.cells[a], B = b.cells[c];
  if (!A || !B) return null;
  const s = swapped(b, a, c);
  const pos = c; // la jugada termina en `c`
  if (A.sp === 'color' || B.sp === 'color') {
    const other = A.sp === 'color' ? B : A;
    const bombPos = A.sp === 'color' ? c : a;
    if (other.sp === 'color') return { board: s, seed: s.cells.map((_, i) => i).filter((i) => playable(s, i)) };
    const t = other.t;
    if (other.sp) {
      // todas las de ese tipo se vuelven de esa especial y estallan (la
      // bola se gasta: si estallara también se llevaría otro color)
      s.cells[bombPos] = { ...s.cells[bombPos], sp: null, t: -1 };
      const seed = [bombPos];
      s.cells.forEach((cell, i) => {
        if (cell && cell.t === t && cell.sp !== 'color') {
          cell.sp = other.sp === 'bomb' ? 'bomb' : (i % 2 ? 'h' : 'v');
          seed.push(i);
        }
      });
      return { board: s, seed };
    }
    const seed = [bombPos];
    s.cells.forEach((cell, i) => { if (cell && cell.t === t) seed.push(i); });
    s.cells[bombPos] = { ...s.cells[bombPos], sp: null, t: -1 }; // la bola se gasta
    return { board: s, seed };
  }
  if (!A.sp || !B.sp) return null;
  const [r, col] = rc(b, pos);
  const out = [];
  const add = (rr, cc) => { if (rr >= 0 && cc >= 0 && rr < b.rows && cc < b.cols && playable(b, at(b, rr, cc))) out.push(at(b, rr, cc)); };
  const striped = (x) => x.sp === 'h' || x.sp === 'v';
  if (striped(A) && striped(B)) {
    for (let k = 0; k < b.cols; k++) add(r, k);
    for (let k = 0; k < b.rows; k++) add(k, col);
  } else if (A.sp === 'bomb' && B.sp === 'bomb') {
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) add(r + dr, col + dc);
  } else {
    for (let d = -1; d <= 1; d++) {
      for (let k = 0; k < b.cols; k++) add(r + d, k);
      for (let k = 0; k < b.rows; k++) add(k, col + d);
    }
  }
  // las dos especiales se gastan en la combinación
  s.cells[a] = { ...s.cells[a], sp: null };
  s.cells[c] = { ...s.cells[c], sp: null };
  return { board: s, seed: out };
}

/**
 * Intenta cambiar `a` con `c`. Si la jugada no hace nada, `ok: false` y
 * el tablero queda igual (no se gasta movimiento).
 * Si funciona: `steps` (una por cascada, para animar) y el tablero final.
 */
export function playSwap(b, a, c, rnd = Math.random) {
  if (!areAdjacent(b, a, c) || !playable(b, a) || !playable(b, c) || !b.cells[a] || !b.cells[c]) return { ok: false, board: b };
  const combo = swapSpecials(b, a, c);
  if (combo) {
    const first = clearStep(combo.board, [a, c], combo.seed);
    first.before = combo.board;
    first.combo = true;
    return { ok: true, swapped: swapped(b, a, c), ...resolveFrom(b, first, rnd) };
  }
  const s = swapped(b, a, c);
  const first = clearStep(s, [a, c]);
  if (!first) return { ok: false, board: b };
  return { ok: true, swapped: s, ...resolveFrom(b, first, rnd) };
}

// ¿Esta jugada haría algo? (sin resolverla entera)
function wouldPlay(b, a, c) {
  const A = b.cells[a], B = b.cells[c];
  if (!A || !B) return false;
  if (A.sp === 'color' || B.sp === 'color' || (A.sp && B.sp)) return true;
  return findRuns(swapped(b, a, c)).length > 0;
}

export function findHint(b) {
  for (let r = 0; r < b.rows; r++) {
    for (let c = 0; c < b.cols; c++) {
      const a = at(b, r, c);
      if (!playable(b, a)) continue;
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (r + dr >= b.rows || c + dc >= b.cols) continue;
        const o = at(b, r + dr, c + dc);
        if (playable(b, o) && wouldPlay(b, a, o)) return [a, o];
      }
    }
  }
  return null;
}

export const hasAnyMove = (b) => findHint(b) !== null;

// Todas las jugadas posibles (para el bot de las pruebas y las pistas).
export function allMoves(b) {
  const out = [];
  for (let r = 0; r < b.rows; r++) {
    for (let c = 0; c < b.cols; c++) {
      const a = at(b, r, c);
      if (!playable(b, a)) continue;
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (r + dr >= b.rows || c + dc >= b.cols) continue;
        const o = at(b, r + dr, c + dc);
        if (playable(b, o) && wouldPlay(b, a, o)) out.push([a, o]);
      }
    }
  }
  return out;
}

// ── Tableros ──────────────────────────────────────────────────────

// Rellena las casillas normales sin dejar líneas hechas (sería regalar
// puntos) y asegurando al menos una jugada. Respeta las especiales.
function refill(b, rnd) {
  for (let tries = 0; tries < 300; tries++) {
    const next = cloneBoard(b);
    next.cells = next.cells.map((cell, i) => {
      if (!playable(b, i)) return null;
      if (cell && cell.sp) return cell;
      return { id: cell ? cell.id : ++next.nextId, t: Math.floor(rnd() * b.types), sp: null };
    });
    for (let guard = 0; guard < 300; guard++) {
      const runs = findRuns(next);
      if (!runs.length) break;
      runs.forEach((run) => { const i = run.cells[1]; next.cells[i] = { ...next.cells[i], t: Math.floor(rnd() * b.types) }; });
    }
    if (!findRuns(next).length && hasAnyMove(next)) return next;
  }
  return b;
}

export function createBoard({ rows = ROWS, cols = COLS, types = 5, mask = null, jelly = null } = {}, rnd = Math.random) {
  const b = { rows, cols, types, mask, jelly: jelly ? [...jelly] : new Array(rows * cols).fill(0), cells: new Array(rows * cols).fill(null), nextId: 0 };
  return refill(b, rnd);
}

// Sin jugadas posibles: se rebarajan las golosinas normales.
export const shuffleBoard = (b, rnd = Math.random) => refill(b, rnd);

export const jellyLeft = (b) => (b.jelly || []).reduce((a, v) => a + v, 0);

// ── Niveles ───────────────────────────────────────────────────────
// Formas del tablero (7×7): # casilla, . no hay.
const SHAPES = {
  lleno: null,
  corazon: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
  rombo: ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'],
  cruz: ['..###..', '..###..', '#######', '#######', '#######', '..###..', '..###..'],
  dona: ['#######', '#######', '##...##', '##...##', '##...##', '#######', '#######'],
  copa: ['#######', '#######', '.#####.', '..###..', '..###..', '.#####.', '#######'],
  mariposa: ['##...##', '###.###', '#######', '#######', '#######', '###.###', '##...##'],
};

const maskOf = (shape) => (SHAPES[shape] ? SHAPES[shape].join('').split('').map((ch) => ch === '#') : null);

// Gelatinas: qué casillas la tienen (1 = gelatina, 2 = hielo de dos capas).
function jellyLayout(kind, mask) {
  const j = new Array(ROWS * COLS).fill(0);
  const put = (r, c, v) => { const i = r * COLS + c; if (!mask || mask[i]) j[i] = v; };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (kind === 'centro' && r >= 2 && r <= 4 && c >= 2 && c <= 4) put(r, c, 1);
      if (kind === 'abajo' && r >= 5) put(r, c, 1);
      if (kind === 'todo') put(r, c, 1);
      if (kind === 'hielo-abajo') put(r, c, r === 6 ? 2 : r === 5 ? 1 : 0);
      if (kind === 'ajedrez' && (r + c) % 2 === 0 && r >= 1 && r <= 5) put(r, c, 1);
      if (kind === 'marco' && (r === 0 || c === 0 || r === 6 || c === 6)) put(r, c, 1);
      if (kind === 'hielo-centro' && r >= 2 && r <= 4 && c >= 2 && c <= 4) put(r, c, 2);
      if (kind === 'diagonal' && (r === c || r + c === 6)) put(r, c, 1);
    }
  }
  return j;
}

// Cada nivel: tipos de golosina, jugadas, forma, gelatina y metas.
//   meta: { kind: 'score', n } · { kind: 'collect', t, n } · { kind: 'jelly' }
const L = (types, moves, shape, jelly, goals) => ({ types, moves, shape, jelly, goals });
const RAW = [
  L(4, 12, 'lleno', null, [{ kind: 'score', n: 1500 }]),
  L(4, 14, 'lleno', null, [{ kind: 'collect', t: 0, n: 22 }]),
  L(4, 15, 'corazon', null, [{ kind: 'score', n: 1800 }]),
  L(4, 10, 'lleno', 'centro', [{ kind: 'jelly' }]),
  L(5, 18, 'lleno', null, [{ kind: 'collect', t: 1, n: 22 }, { kind: 'collect', t: 2, n: 22 }]),
  L(4, 16, 'rombo', null, [{ kind: 'collect', t: 3, n: 24 }]),
  L(5, 18, 'lleno', 'abajo', [{ kind: 'jelly' }]),
  L(5, 20, 'cruz', null, [{ kind: 'score', n: 2200 }]),
  L(4, 26, 'corazon', 'todo', [{ kind: 'jelly' }]),
  L(5, 22, 'lleno', null, [{ kind: 'collect', t: 0, n: 30 }, { kind: 'collect', t: 4, n: 28 }]),
  L(5, 22, 'dona', null, [{ kind: 'score', n: 1500 }]),
  L(5, 16, 'lleno', 'hielo-centro', [{ kind: 'jelly' }]),
  L(5, 22, 'mariposa', null, [{ kind: 'collect', t: 2, n: 24 }]),
  L(5, 24, 'lleno', 'hielo-abajo', [{ kind: 'jelly' }]),
  L(5, 22, 'corazon', null, [{ kind: 'collect', t: 1, n: 24 }, { kind: 'collect', t: 3, n: 24 }]),
  L(5, 14, 'cruz', 'centro', [{ kind: 'jelly' }]),
  L(6, 24, 'lleno', null, [{ kind: 'score', n: 2400 }]),
  L(5, 28, 'dona', 'marco', [{ kind: 'jelly' }]),
  L(6, 22, 'lleno', null, [{ kind: 'collect', t: 5, n: 24 }]),
  L(5, 20, 'corazon', 'ajedrez', [{ kind: 'jelly' }]),
  L(6, 24, 'copa', null, [{ kind: 'score', n: 1800 }]),
  L(6, 32, 'lleno', 'diagonal', [{ kind: 'jelly' }]),
  L(6, 28, 'mariposa', null, [{ kind: 'collect', t: 0, n: 20 }, { kind: 'collect', t: 5, n: 20 }]),
  L(5, 26, 'lleno', 'marco', [{ kind: 'jelly' }]),
  L(6, 24, 'rombo', null, [{ kind: 'score', n: 1400 }]),
  L(6, 30, 'lleno', 'todo', [{ kind: 'jelly' }]),
  L(6, 26, 'corazon', null, [{ kind: 'collect', t: 2, n: 22 }, { kind: 'collect', t: 4, n: 22 }]),
  L(5, 30, 'dona', 'hielo-abajo', [{ kind: 'jelly' }]),
  L(6, 28, 'cruz', null, [{ kind: 'collect', t: 1, n: 26 }, { kind: 'collect', t: 3, n: 26 }]),
  L(6, 26, 'lleno', 'hielo-centro', [{ kind: 'jelly' }, { kind: 'score', n: 3000 }]),
];

export const LEVELS = RAW.map((l, k) => {
  const mask = maskOf(l.shape);
  const jelly = l.jelly ? jellyLayout(l.jelly, mask) : null;
  const scoreGoal = l.goals.find((g) => g.kind === 'score');
  // Estrellas: 1 al cumplir las metas; 2 y 3 por puntaje (las jugadas que
  // sobran suman al final, así que terminar rápido también cuenta).
  const stars = scoreGoal ? [scoreGoal.n, Math.round(scoreGoal.n * 1.3), Math.round(scoreGoal.n * 1.6)] : [0, l.moves * 85, l.moves * 135];
  return { level: k + 1, ...l, mask, jelly, stars };
});

export function levelBoard(level, rnd = Math.random) {
  const L0 = LEVELS[level - 1];
  return createBoard({ rows: ROWS, cols: COLS, types: L0.types, mask: L0.mask, jelly: L0.jelly }, rnd);
}

// Avance de las metas: { done, parts: [{ goal, have, need }] }
export function goalStatus(level, { score, collected, board }) {
  const L0 = LEVELS[level - 1];
  const parts = L0.goals.map((g) => {
    if (g.kind === 'score') return { goal: g, have: Math.min(score, g.n), need: g.n };
    if (g.kind === 'collect') return { goal: g, have: Math.min(collected[g.t] || 0, g.n), need: g.n };
    const total = L0.jelly.reduce((a, v) => a + v, 0);
    return { goal: g, have: total - jellyLeft(board), need: total };
  });
  return { done: parts.every((p) => p.have >= p.need), parts };
}

export const LEFTOVER_MOVE_POINTS = 60;

export function starsFor(level, score) {
  const s = LEVELS[level - 1].stars;
  return 1 + (score >= s[1] ? 1 : 0) + (score >= s[2] ? 1 : 0);
}
