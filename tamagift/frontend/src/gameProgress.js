// ─────────────────────────────────────────────────────────────────
// Progreso de los minijuegos: niveles, estrellas y retos del día.
//
// Lo que hace que valga la pena volver a un juego no es otro juego más,
// sino una meta propia que cambia: subir de nivel, completar las tres
// estrellas, cumplir el reto de hoy. Todo lo de acá es lógica pura (sin
// React ni pantalla) para poder probarlo de verdad (gameProgress.test.mjs).
//
// Dos clases de juego:
//   · De NIVELES (golosinas, memoria, rompecabezas, cocina): cada nivel
//     se gana con 1 a 3 estrellas y desbloquea el siguiente.
//   · De PUNTAJE (los arcade): tres metas de puntaje dan las estrellas;
//     con las tres se sube de rango y las metas crecen.
// ─────────────────────────────────────────────────────────────────

import { todayKey } from './gameState.js';

// Cuántos niveles tiene cada juego de niveles.
export const LEVEL_GAMES = {
  golosinas: 30,
  memoria: 9,
  rompecabezas: 6,
  cocina: 12,
};

// Metas de puntaje del rango 1 (una por estrella). En rangos más altos
// crecen un 30% por rango.
export const SCORE_GOALS = {
  atrapar: [15, 30, 45],
  topos: [14, 24, 34],
  serpiente: [8, 16, 26],
  cruzar: [2, 4, 7],
  torre: [12, 24, 38],
  simon: [5, 8, 12],
  volar: [5, 12, 20],
  trivia: [3, 5, 6],
};
export const MAX_RANK = 9;

export const isLevelGame = (id) => id in LEVEL_GAMES;

// Metas del rango `rank` (1..MAX_RANK). Trivia no crece: las preguntas son
// las mismas y el máximo es fijo.
export function goalsFor(gameId, rank = 1) {
  const base = SCORE_GOALS[gameId];
  if (!base) return null;
  if (gameId === 'trivia') return base;
  const k = 1 + 0.3 * (Math.max(1, rank) - 1);
  return base.map((v) => Math.max(v, Math.round(v * k)));
}

export function starsForScore(gameId, score, rank = 1) {
  const g = goalsFor(gameId, rank);
  if (!g) return 0;
  return g.filter((v) => score >= v).length;
}

// Progreso guardado de un juego, con valores por defecto.
//   niveles: { unlocked, stars: { [nivel]: n } }
//   puntaje: { rank, rankStars }  (mejores estrellas en el rango actual)
export function progressOf(state, gameId) {
  const p = ((state && state.progress) || {})[gameId] || {};
  if (isLevelGame(gameId)) return { unlocked: p.unlocked || 1, stars: p.stars || {} };
  return { rank: p.rank || 1, rankStars: p.rankStars || 0 };
}

export function totalStars(state, gameId) {
  const p = progressOf(state, gameId);
  if (isLevelGame(gameId)) return Object.values(p.stars).reduce((a, b) => a + b, 0);
  return (p.rank - 1) * 3 + p.rankStars;
}

// ── Retos del día ─────────────────────────────────────────────────
// Uno por juego y por día, igual para todo el día (sale de la fecha).
// `check(score, extra)` mira lo que el juego mandó al terminar: el
// puntaje y, en `extra.stats`, lo que pasó en la partida.

const st = (extra, k) => ((extra && extra.stats) || {})[k] || 0;

const CHALLENGES = {
  atrapar: [
    (n) => ({ text: `Haz ${n} puntos`, n: [25, 40], check: (s) => s >= n }),
    (n) => ({ text: `Haz ${n} puntos sin perder vidas`, n: [15, 25], check: (s, x) => s >= n && st(x, 'livesLost') === 0 }),
    (n) => ({ text: `Haz un combo de ${n}`, n: [8, 14], check: (s, x) => st(x, 'maxCombo') >= n }),
    (n) => ({ text: `Agarra ${n} poderes`, n: [2, 4], check: (s, x) => st(x, 'powerups') >= n }),
  ],
  volar: [
    (n) => ({ text: `Pasa ${n} obstáculos`, n: [8, 16], check: (s) => s >= n }),
    (n) => ({ text: `Recoge ${n} estrellas`, n: [4, 9], check: (s, x) => st(x, 'stars') >= n }),
  ],
  cruzar: [
    (n) => ({ text: `Cruza ${n} veces`, n: [3, 6], check: (s) => s >= n }),
    (n) => ({ text: `Recoge ${n} monedas en la calle`, n: [4, 9], check: (s, x) => st(x, 'coins') >= n }),
    (n) => ({ text: `Cruza ${n} veces sin chocar`, n: [2, 4], check: (s, x) => s >= n && st(x, 'hits') === 0 }),
  ],
  torre: [
    (n) => ({ text: `Apila ${n} pisos de pastel`, n: [15, 26], check: (s, x) => st(x, 'floors') >= n }),
    (n) => ({ text: `Clava ${n} perfectos seguidos`, n: [3, 6], check: (s, x) => st(x, 'maxPerfect') >= n }),
  ],
  serpiente: [
    (n) => ({ text: `Come ${n} veces`, n: [10, 18], check: (s) => s >= n }),
    (n) => ({ text: `Atrapa ${n} golosinas doradas`, n: [1, 3], check: (s, x) => st(x, 'golden') >= n }),
  ],
  topos: [
    (n) => ({ text: `Haz ${n} puntos`, n: [18, 28], check: (s) => s >= n }),
    (n) => ({ text: `Atrapa ${n} topos dorados`, n: [2, 4], check: (s, x) => st(x, 'golden') >= n }),
    (n) => ({ text: `Llega a ${n} sin tocar bombas`, n: [12, 20], check: (s, x) => s >= n && st(x, 'bombs') === 0 }),
  ],
  simon: [
    (n) => ({ text: `Llega a ${n} pasos`, n: [6, 10], check: (s) => s >= n }),
  ],
  trivia: [
    (n) => ({ text: `Acierta ${n} preguntas`, n: [4, 6], check: (s) => s >= n }),
  ],
  golosinas: [
    () => ({ text: 'Gana un nivel con 3 estrellas', check: (s, x) => !!(x && x.won && x.stars >= 3) }),
    (n) => ({ text: `Crea ${n} golosinas especiales`, n: [4, 9], check: (s, x) => st(x, 'specials') >= n }),
    () => ({ text: 'Gana un nivel nuevo', check: (s, x) => !!(x && x.won && x.firstWin) }),
  ],
  memoria: [
    () => ({ text: 'Gana un nivel con 3 estrellas', check: (s, x) => !!(x && x.won && x.stars >= 3) }),
    () => ({ text: 'Gana un nivel', check: (s, x) => !!(x && x.won) }),
  ],
  rompecabezas: [
    () => ({ text: 'Arma un rompecabezas', check: (s, x) => !!(x && x.won) }),
    () => ({ text: 'Ármalo con 2 estrellas o más', check: (s, x) => !!(x && x.won && x.stars >= 2) }),
  ],
  cocina: [
    (n) => ({ text: `Cocina ${n} platos`, n: [2, 4], check: (s, x) => dishCount(x) >= n }),
    () => ({ text: 'Cocina algo con 3 estrellas', check: (s, x) => !!(x && x.stars >= 3) }),
  ],
};

const dishCount = (x) => ((x && x.dishes) || []).reduce((a, d) => a + (d.n || 1), 0);

// Número fijo a partir de un texto (FNV-1a): mismo día y juego, mismo reto.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const CHALLENGE_REWARD = 30;

export function dailyChallenge(gameId, day = todayKey()) {
  const list = CHALLENGES[gameId];
  if (!list) return null;
  const h = hash(`${day}:${gameId}`);
  const make = list[h % list.length];
  // Primero se arma con un número cualquiera solo para leer su rango.
  const probe = make(0);
  const [lo, hi] = probe.n || [0, 0];
  const n = probe.n ? lo + ((h >>> 8) % (hi - lo + 1)) : 0;
  const c = make(n);
  return { id: `${day}:${gameId}`, gameId, day, text: c.text, check: c.check, reward: CHALLENGE_REWARD };
}

export function isChallengeDone(state, gameId, day = todayKey()) {
  return ((state && state.challengesDone) || {})[gameId] === day;
}

// ── Aplicar una partida ───────────────────────────────────────────
// Devuelve el estado nuevo (sin tocar monedas) y lo que pasó, para que la
// pantalla de resultado lo cuente.
//   extra (opcional, lo manda el juego):
//     level, won, stars   juegos de niveles
//     stats               lo que pasó en la partida (para los retos)
//     dishes              platos cocinados
export function applyGameResult(state, gameId, score, extra = {}, day = todayKey()) {
  const progress = { ...((state && state.progress) || {}) };
  const info = { stars: 0, rankUp: false, unlockedLevel: null, firstWin: false, challenge: null };

  if (isLevelGame(gameId)) {
    const p = progressOf(state, gameId);
    const stars = { ...p.stars };
    let unlocked = p.unlocked;
    const lvl = extra.level || 1;
    if (extra.won) {
      const got = Math.max(1, Math.min(3, extra.stars || 1));
      info.stars = got;
      info.firstWin = !stars[lvl];
      stars[lvl] = Math.max(stars[lvl] || 0, got);
      if (lvl >= unlocked && lvl < LEVEL_GAMES[gameId]) { unlocked = lvl + 1; info.unlockedLevel = unlocked; }
    }
    progress[gameId] = { unlocked, stars };
  } else if (SCORE_GOALS[gameId]) {
    const p = progressOf(state, gameId);
    const got = starsForScore(gameId, score, p.rank);
    info.stars = got;
    let { rank, rankStars } = p;
    rankStars = Math.max(rankStars, got);
    if (got >= 3 && rank < MAX_RANK && gameId !== 'trivia') { rank += 1; rankStars = 0; info.rankUp = true; }
    info.rank = rank;
    progress[gameId] = { rank, rankStars };
  }

  const challengesDone = { ...((state && state.challengesDone) || {}) };
  const ch = dailyChallenge(gameId, day);
  if (ch) {
    const already = challengesDone[gameId] === day;
    const ok = !already && ch.check(score, { ...extra, firstWin: info.firstWin });
    if (ok) challengesDone[gameId] = day;
    info.challenge = { text: ch.text, done: already || ok, justDone: ok, reward: ok ? ch.reward : 0 };
  }

  const seenGames = Array.from(new Set([...((state && state.seenGames) || []), gameId]));
  return { state: { ...state, progress, challengesDone, seenGames }, info };
}
