// ─────────────────────────────────────────────────────────────────
// Lógica de "Conecta 3 golosinas".
//
// Aparte del componente porque las cascadas son la parte fácil de
// romper: al limpiar un grupo caen fichas, al caer pueden formar otro
// grupo, y así encadenado. Como módulo puro se puede probar de verdad
// (ver match3.test.mjs) en vez de confiar en que "se ve bien".
//
// El tablero es un array plano de `SIZE*SIZE`; cada celda guarda el
// índice del tipo de golosina (0..types-1).
// ─────────────────────────────────────────────────────────────────

export const SIZE = 6;
export const MOVES_PER_GAME = 20;

const idx = (r, c) => r * SIZE + c;

export function inBounds(r, c) {
  return r >= 0 && c >= 0 && r < SIZE && c < SIZE;
}

export function areAdjacent(a, b) {
  const ra = Math.floor(a / SIZE), ca = a % SIZE;
  const rb = Math.floor(b / SIZE), cb = b % SIZE;
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1;
}

// Devuelve el conjunto de posiciones que forman línea de 3 o más.
export function findMatches(grid) {
  const hits = new Set();

  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= SIZE; c++) {
      const same = c < SIZE && grid[idx(r, c)] != null && grid[idx(r, c)] === grid[idx(r, c - 1)];
      if (same) { run++; continue; }
      if (run >= 3) for (let k = c - run; k < c; k++) hits.add(idx(r, k));
      run = 1;
    }
  }

  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= SIZE; r++) {
      const same = r < SIZE && grid[idx(r, c)] != null && grid[idx(r, c)] === grid[idx(r - 1, c)];
      if (same) { run++; continue; }
      if (run >= 3) for (let k = r - run; k < r; k++) hits.add(idx(k, c));
      run = 1;
    }
  }

  return hits;
}

// Las fichas caen a llenar los huecos y entran nuevas por arriba.
export function applyGravity(grid, types, rnd = Math.random) {
  const next = [...grid];
  for (let c = 0; c < SIZE; c++) {
    let write = SIZE - 1;
    for (let r = SIZE - 1; r >= 0; r--) {
      const v = next[idx(r, c)];
      if (v != null) { next[idx(write, c)] = v; write--; }
    }
    for (let r = write; r >= 0; r--) next[idx(r, c)] = Math.floor(rnd() * types);
  }
  return next;
}

// Limpia todo lo que haga línea, deja caer, y repite mientras se sigan
// formando líneas. Devuelve el tablero final y cuántas fichas cayeron
// en total (el puntaje) y cuántas cascadas encadenó.
// El tope de cascadas no es decorativo: si las fichas que entran por
// arriba vuelven a formar línea una y otra vez (posible con pocos tipos
// o con mala suerte), esto se quedaría girando para siempre y colgaría
// la pestaña. Con el tope, en el peor caso se corta y el tablero queda
// jugable aunque tenga alguna línea sin resolver.
const MAX_CASCADES = 30;

export function resolveBoard(grid, types, rnd = Math.random) {
  let board = [...grid];
  let cleared = 0;
  let cascades = 0;

  while (cascades < MAX_CASCADES) {
    const hits = findMatches(board);
    if (hits.size === 0) break;
    cascades++;
    cleared += hits.size;
    hits.forEach((i) => { board[i] = null; });
    board = applyGravity(board, types, rnd);
  }

  return { board, cleared, cascades };
}

// Intercambia dos fichas. Si el cambio no forma ninguna línea, el
// tablero vuelve como estaba (`ok: false`) — así no se gastan
// movimientos en jugadas que no hacen nada.
export function trySwap(grid, a, b, types, rnd = Math.random) {
  if (!areAdjacent(a, b)) return { ok: false, board: grid, cleared: 0, cascades: 0 };

  const swapped = [...grid];
  [swapped[a], swapped[b]] = [swapped[b], swapped[a]];

  if (findMatches(swapped).size === 0) {
    return { ok: false, board: grid, cleared: 0, cascades: 0 };
  }

  const res = resolveBoard(swapped, types, rnd);
  return { ok: true, ...res };
}

// Devuelve un par [a, b] que forma línea, o null si no hay ninguno.
// Sirve para dos cosas: saber si el tablero sigue vivo, y poder
// señalarle una jugada a quien se queda mirando sin saber qué hacer.
export function findHint(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const a = idx(r, c);
      const vecinos = [];
      if (c + 1 < SIZE) vecinos.push(idx(r, c + 1));
      if (r + 1 < SIZE) vecinos.push(idx(r + 1, c));
      for (const b of vecinos) {
        const t = [...grid];
        [t[a], t[b]] = [t[b], t[a]];
        if (findMatches(t).size > 0) return [a, b];
      }
    }
  }
  return null;
}

// ¿Queda alguna jugada posible? Si no, el tablero está muerto y hay
// que rebarajarlo, o la partida se queda trabada sin que sea culpa de
// quien juega.
export function hasAnyMove(grid) {
  return findHint(grid) !== null;
}

// Aplica el intercambio sin resolver nada: sirve para poder ANIMAR el
// cambio y el estallido antes de que caigan las fichas nuevas.
export function previewSwap(grid, a, b) {
  const swapped = [...grid];
  [swapped[a], swapped[b]] = [swapped[b], swapped[a]];
  return { swapped, matched: findMatches(swapped) };
}

// Tablero inicial: sin líneas ya hechas (sería regalar puntos) y con
// al menos una jugada disponible.
export function createBoard(types, rnd = Math.random) {
  for (let intento = 0; intento < 200; intento++) {
    let grid = Array.from({ length: SIZE * SIZE }, () => Math.floor(rnd() * types));
    // Deshace las líneas iniciales cambiando la ficha ofensora.
    for (let guard = 0; guard < 200; guard++) {
      const hits = findMatches(grid);
      if (hits.size === 0) break;
      hits.forEach((i) => { grid[i] = Math.floor(rnd() * types); });
    }
    if (findMatches(grid).size === 0 && hasAnyMove(grid)) return grid;
  }
  // Fallback pragmático: patrón fijo sin líneas, por si el azar no ayuda.
  return Array.from({ length: SIZE * SIZE }, (_, i) => (i + Math.floor(i / SIZE)) % types);
}
