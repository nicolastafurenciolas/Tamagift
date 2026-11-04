// Pruebas del frasco de estrellas y la meta de los dos (personal/jar.js).
//   node src/personal/jar.test.mjs

import assert from 'node:assert/strict';
import {
  earnStars, jarFill, canRedeem, redeem, syncPending, isPending, weekKey, ensureWeek, markCare, noteGiverSent,
  goalStatus, claimGoal, STARS_PER_DAY, DUO_REWARDS,
} from './jar.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}
const day = (d, h = 12) => new Date(2026, 10, d, h);

test('los topes: por fuente y por día', () => {
  let j = null;
  for (let i = 0; i < 10; i++) j = earnStars(j, 3, 'nivel', { date: day(4) }).jar;
  assert.equal(j.stars, 6);                  // tope de niveles
  j = earnStars(j, 5, 'cuidar', { date: day(4) }).jar;
  assert.equal(j.stars, STARS_PER_DAY);      // tope del día
  assert.equal(earnStars(j, 1, 'premio', { date: day(4) }).got, 0);
  j = earnStars(j, 2, 'premio', { date: day(5) }).jar;
  assert.equal(j.stars, STARS_PER_DAY + 2);  // otro día, de nuevo
});

test('un cupón de 30 estrellas toma unos días, no meses', () => {
  // jugando un rato normal: 2 niveles con 2 estrellas, comer y bañar, el premio del día
  let j = null, days = 0;
  while ((j ? j.stars : 0) < 30) {
    days += 1;
    const date = day(days);
    j = earnStars(j, 2, 'nivel', { date }).jar;
    j = earnStars(j, 2, 'nivel', { date }).jar;
    j = earnStars(j, 1, 'cuidar', { date }).jar;
    j = earnStars(j, 1, 'cuidar', { date }).jar;
    j = earnStars(j, 2, 'premio', { date }).jar;
  }
  assert.ok(days >= 4 && days <= 6, `tomó ${days} días`);
});

test('canjear descuenta, queda esperando y se libera al cumplirse', () => {
  const c = { id: 'c1', title: 'Vale por una cena', stars: 10 };
  let j = { stars: 12 };
  assert.ok(canRedeem(j, c));
  j = redeem(j, c, 77);
  assert.equal(j.stars, 2);
  assert.ok(isPending(j, 'c1'));
  assert.equal(canRedeem({ ...j, stars: 50 }, c), false);   // ya está esperando
  j = syncPending(j, [{ id: 77, kind: 'canje', done: false }]);
  assert.ok(isPending(j, 'c1'));
  j = syncPending(j, [{ id: 77, kind: 'canje', done: true }]);
  assert.equal(isPending(j, 'c1'), false);
  assert.equal(canRedeem({ stars: 3 }, c), false);
});

test('el frasco se llena respecto del cupón más caro', () => {
  assert.equal(jarFill({ stars: 15 }, [{ stars: 10 }, { stars: 30 }]), 0.5);
  assert.equal(jarFill({ stars: 15 }, []), 0.5);
  assert.equal(jarFill({ stars: 99 }, [{ stars: 20 }]), 1);
});

test('la meta de los dos: semana, días de cuidado, cosas mandadas y premio', () => {
  assert.equal(weekKey(day(4)), '2026-11-02');        // miércoles → lunes
  assert.equal(weekKey(day(8)), '2026-11-02');        // domingo
  assert.equal(weekKey(day(9)), '2026-11-09');
  let j = ensureWeek(null, { date: day(4) });
  const need = j.week.mine.n, theirs = j.week.theirs;
  for (let d = 2; d < 2 + need; d++) { j = markCare(j, 'jugar', { date: day(d) }); j = markCare(j, 'jugar', { date: day(d, 18) }); }
  let st = goalStatus(j, { petName: 'Mochi', giverName: 'Nico' });
  assert.equal(st.mine.have, need);
  assert.equal(st.complete, false);
  assert.equal(claimGoal(j), null);
  j = noteGiverSent(j, [day(1).getTime(), ...Array.from({ length: theirs }, () => day(3).getTime())], { date: day(4) });
  st = goalStatus(j, { petName: 'Mochi', giverName: 'Nico' });
  assert.equal(st.theirs.have, theirs);                 // lo de antes del lunes no cuenta
  assert.ok(st.theirs.text.includes('Nico'));
  assert.equal(st.complete, true);
  const r = claimGoal(j, [DUO_REWARDS[0]]);
  assert.ok(DUO_REWARDS.includes(r.rewardId));
  assert.equal(goalStatus(r.jar).rewarded, true);
  assert.equal(claimGoal(r.jar), null);                 // una vez
  // semana nueva: meta nueva, de cero
  const next = ensureWeek(r.jar, { date: day(10) });
  assert.equal(next.week.key, '2026-11-09');
  assert.equal(next.week.careDays.length, 0);
});

console.log(`\n${passed} pruebas pasaron`);
