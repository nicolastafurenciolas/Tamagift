// Pruebas del premio de cada día (daily.js).
//   node src/daily.test.mjs

import assert from 'node:assert/strict';
import { dailyStatus, claimDaily, DAILY_REWARDS } from './daily.js';
import { reminderIcs } from './reminder.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

test('el primer día hay premio y es el primero del calendario', () => {
  const st = dailyStatus({}, '2026-10-22');
  assert.equal(st.ready, true);
  assert.equal(st.step, 0);
  const r = claimDaily({}, '2026-10-22');
  assert.deepEqual(r.reward, DAILY_REWARDS[0]);
  assert.deepEqual(r.game.daily, { day: '2026-10-22', step: 0, streak: 1, best: 1 });
});

test('una sola vez por día', () => {
  const g = claimDaily({}, '2026-10-22').game;
  assert.equal(dailyStatus(g, '2026-10-22').ready, false);
  assert.equal(claimDaily(g, '2026-10-22'), null);
});

test('días seguidos suben la racha; el calendario avanza aunque se falte', () => {
  let g = claimDaily({}, '2026-10-22').game;
  g = claimDaily(g, '2026-10-23').game;
  assert.equal(g.daily.streak, 2);
  assert.equal(g.daily.step, 1);
  // se saltó el 24: la racha vuelve a 1, pero el calendario no se pierde
  g = claimDaily(g, '2026-10-25').game;
  assert.equal(g.daily.streak, 1);
  assert.equal(g.daily.step, 2);
  assert.equal(g.daily.best, 2);
  assert.equal(dailyStatus(g, '2026-10-27').streak, 0, 'racha rota se muestra en 0');
});

test('cruza fin de mes y de año', () => {
  let g = claimDaily({}, '2026-12-31').game;
  g = claimDaily(g, '2027-01-01').game;
  assert.equal(g.daily.streak, 2);
});

test('el séptimo día es una sorpresa (o monedas si ya tiene todo) y vuelve a empezar', () => {
  let g = {};
  for (let i = 0; i < 6; i++) g = claimDaily(g, `2026-10-${10 + i}`).game;
  const r = claimDaily(g, '2026-10-16', () => ({ id: 'osito', name: 'Osito de peluche' }));
  assert.deepEqual(r.reward, { kind: 'decor', refId: 'osito', label: 'Osito de peluche' });
  const r2 = claimDaily(g, '2026-10-16', () => null);
  assert.deepEqual(r2.reward, { kind: 'monedas', value: 120 });
  assert.equal(dailyStatus(r.game, '2026-10-17').step, 0);
});

test('el recordatorio: todos los días a la hora elegida, desde la próxima vez', () => {
  const ics = reminderIcs({ petName: 'Luna, la mochi', url: 'https://tamagift.app/p/abc123?algo=muy-largo-para-que-haya-que-doblar-la-linea', slug: 'abc123', hour: 20, now: new Date(2026, 9, 22, 21, 5) });
  assert.ok(ics.includes('RRULE:FREQ=DAILY'));
  assert.ok(ics.includes('DTSTART:20261023T200000'), 'ya pasaron las 20: empieza mañana');
  assert.ok(ics.includes('SUMMARY:Visitar a Luna\\, la mochi'));
  for (const l of ics.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75, l);
  const early = reminderIcs({ petName: 'Luna', url: 'x', hour: 20, now: new Date(2026, 9, 22, 9) });
  assert.ok(early.includes('DTSTART:20261022T200000'));
});

console.log(`\n${passed} pruebas del premio diario`);
