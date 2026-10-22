// Pruebas del progreso de los minijuegos (niveles, estrellas, retos).
//   node src/gameProgress.test.mjs

import assert from 'node:assert/strict';
import {
  LEVEL_GAMES, SCORE_GOALS, goalsFor, starsForScore, progressOf, applyGameResult,
  dailyChallenge, isChallengeDone, totalStars, MAX_RANK,
} from './gameProgress.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

const DAY = '2026-10-22';

test('las metas crecen con el rango y nunca bajan', () => {
  for (const id of Object.keys(SCORE_GOALS)) {
    let prev = goalsFor(id, 1);
    assert.equal(prev.length, 3);
    for (let r = 2; r <= MAX_RANK; r++) {
      const g = goalsFor(id, r);
      g.forEach((v, i) => assert.ok(v >= prev[i], `${id} rango ${r}`));
      prev = g;
    }
  }
});

test('estrellas por puntaje', () => {
  assert.equal(starsForScore('atrapar', 0), 0);
  assert.equal(starsForScore('atrapar', 15), 1);
  assert.equal(starsForScore('atrapar', 31), 2);
  assert.equal(starsForScore('atrapar', 99), 3);
});

test('tres estrellas suben de rango; menos, no', () => {
  let { state, info } = applyGameResult({}, 'atrapar', 35, {}, DAY);
  assert.equal(info.stars, 2);
  assert.equal(info.rankUp, false);
  assert.equal(progressOf(state, 'atrapar').rankStars, 2);
  ({ state, info } = applyGameResult(state, 'atrapar', 50, {}, DAY));
  assert.equal(info.rankUp, true);
  assert.equal(progressOf(state, 'atrapar').rank, 2);
  assert.equal(progressOf(state, 'atrapar').rankStars, 0, 'el rango nuevo empieza sin estrellas');
});

test('ganar un nivel lo marca y desbloquea el siguiente; perder no', () => {
  let { state, info } = applyGameResult({}, 'golosinas', 900, { level: 1, won: false }, DAY);
  assert.equal(progressOf(state, 'golosinas').unlocked, 1);
  assert.equal(info.unlockedLevel, null);
  ({ state, info } = applyGameResult(state, 'golosinas', 900, { level: 1, won: true, stars: 2 }, DAY));
  assert.equal(progressOf(state, 'golosinas').unlocked, 2);
  assert.equal(info.unlockedLevel, 2);
  assert.equal(info.firstWin, true);
  ({ state, info } = applyGameResult(state, 'golosinas', 900, { level: 1, won: true, stars: 1 }, DAY));
  assert.equal(progressOf(state, 'golosinas').stars[1], 2, 'se guarda la mejor marca');
  assert.equal(info.firstWin, false);
  assert.equal(totalStars(state, 'golosinas'), 2);
});

test('el último nivel no desbloquea uno que no existe', () => {
  const last = LEVEL_GAMES.memoria;
  const st = { progress: { memoria: { unlocked: last, stars: {} } } };
  const { state } = applyGameResult(st, 'memoria', 10, { level: last, won: true, stars: 3 }, DAY);
  assert.equal(progressOf(state, 'memoria').unlocked, last);
});

test('el reto del día es el mismo todo el día y cambia entre días', () => {
  const a = dailyChallenge('atrapar', DAY), b = dailyChallenge('atrapar', DAY);
  assert.equal(a.text, b.text);
  const texts = new Set();
  for (let d = 1; d <= 28; d++) texts.add(dailyChallenge('atrapar', `2026-02-${String(d).padStart(2, '0')}`).text);
  assert.ok(texts.size > 1, 'en un mes salen retos distintos');
});

test('todos los juegos tienen reto y su texto no tiene huecos', () => {
  for (const id of [...Object.keys(SCORE_GOALS), ...Object.keys(LEVEL_GAMES)]) {
    for (let d = 1; d <= 20; d++) {
      const c = dailyChallenge(id, `2026-03-${String(d).padStart(2, '0')}`);
      assert.ok(c, id);
      assert.ok(!/undefined|NaN| 0 /.test(c.text), `${id}: ${c.text}`);
    }
  }
});

test('el reto paga una sola vez por día', () => {
  // Un reto de puntaje alto: con 999 se cumple sea cual sea el del día.
  let { state, info } = applyGameResult({}, 'trivia', 999, {}, DAY);
  assert.equal(info.challenge.justDone, true);
  assert.equal(info.challenge.reward > 0, true);
  assert.ok(isChallengeDone(state, 'trivia', DAY));
  ({ state, info } = applyGameResult(state, 'trivia', 999, {}, DAY));
  assert.equal(info.challenge.justDone, false);
  assert.equal(info.challenge.done, true);
  assert.equal(info.challenge.reward, 0);
});

test('jugar marca el juego como visto', () => {
  const { state } = applyGameResult({ seenGames: ['memoria'] }, 'cocina', 0, {}, DAY);
  assert.deepEqual(state.seenGames.sort(), ['cocina', 'memoria']);
});

console.log(`\n${passed} pruebas OK`);
