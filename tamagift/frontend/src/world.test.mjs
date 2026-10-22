// Pruebas del mundo vivo (world.js, worldEvents.js, deliveries.js).
//   node src/world.test.mjs

import assert from 'node:assert/strict';
import { phaseOf, weatherOf, tickVitals, defaultVitals, foodEffect, applyEffect, moodFrom, RATE } from './world.js';
import { rollEvent, endEvent, startEvent, EVENT_GAP } from './worldEvents.js';
import { addDelivery, arriveAll, unpack, unpackAll, hasPendingTrip, parcelAtDoor } from './deliveries.js';
import { chubOf } from './wardrobeState.js';
import { foodKindOf } from './foodCatalog.js';
import { activeSeason, seasonDaysLeft, seasonCountdown, onSale } from './seasons.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}
const at = (h, m = 0) => new Date(2026, 9, 22, h, m);
const seq = (vals) => { let i = 0; return () => vals[i++ % vals.length]; };

test('la hora del día sale de la hora del teléfono', () => {
  assert.equal(phaseOf(at(7)), 'manana');
  assert.equal(phaseOf(at(13)), 'dia');
  assert.equal(phaseOf(at(18)), 'tarde');
  assert.equal(phaseOf(at(23)), 'noche');
  assert.equal(phaseOf(at(3)), 'noche');
});

test('el clima es el mismo todo el día y solo nieva en diciembre y enero', () => {
  assert.equal(weatherOf(at(8), 'x'), weatherOf(at(22), 'x'));
  for (let d = 1; d <= 28; d++) assert.notEqual(weatherOf(new Date(2026, 6, d), 'x'), 'nieve');
});

test('las necesidades bajan con el tiempo y la energía sube durmiendo', () => {
  const t0 = 1_000_000;
  const v = defaultVitals(t0);
  const later = tickVitals(v, t0 + RATE.energy * 10);
  assert.equal(later.energy, v.energy - 10);
  const sleeping = tickVitals({ ...v, energy: 20, asleep: true }, t0 + RATE.sleepGain * 30);
  assert.equal(sleeping.energy, 50);
  assert.ok(later.hunger < v.hunger && later.clean < v.clean);
});

test('las partidas viejas (sin energía, limpieza ni peso) se completan', () => {
  const v = tickVitals({ hunger: 40, love: 50, hungerAt: 0, loveAt: 0 }, 0);
  for (const f of ['energy', 'clean', 'weight']) assert.equal(typeof v[f], 'number', f);
});

test('la chatarra engorda, lo sano adelgaza; la redondez aparece de a poco', () => {
  assert.ok(foodEffect({ id: 'pizza' }).weight > 0);
  assert.ok(foodEffect({ id: 'brocoli' }).weight < 0);
  assert.ok(foodEffect({ food_name: 'Hamburguesa doble' }).weight > 0);
  let v = defaultVitals(0);
  for (let i = 0; i < 20; i++) v = applyEffect(v, foodEffect({ id: 'hamburguesa' }), 0);
  assert.ok(chubOf(v.weight) > 0.5, `peso ${v.weight}`);
  for (let i = 0; i < 30; i++) v = applyEffect(v, foodEffect({ id: 'ensalada' }), 0);
  assert.equal(chubOf(v.weight), 0);
});

test('lo que no le gusta llena menos', () => {
  assert.ok(foodEffect({ id: 'pizza', preference: 'no_gusta' }).hunger < foodEffect({ id: 'pizza' }).hunger);
});

test('el ánimo sale de las necesidades', () => {
  assert.equal(moodFrom({ hunger: 50, love: 50, energy: 50, clean: 50, asleep: true }), 'dormido');
  assert.equal(moodFrom({ hunger: 5, love: 50, energy: 50, clean: 50 }), 'enojado');
  assert.equal(moodFrom({ hunger: 50, love: 10, energy: 50, clean: 50 }), 'triste');
  assert.equal(moodFrom({ hunger: 50, love: 50, energy: 50, clean: 50 }, 'feliz'), 'feliz');
});

test('las comidas de quien regala se clasifican por su nombre', () => {
  assert.equal(foodKindOf('Helado de mora'), 'dulce');
  assert.equal(foodKindOf('Papas fritas'), 'chatarra');
  assert.equal(foodKindOf('Aguacate'), 'saludable');
  assert.equal(foodKindOf('Agua de panela'), 'bebida');
  assert.equal(foodKindOf('Ajiaco'), 'casera');
});

test('sucesos: primero el regalo del día, después la carta, y no se repiten el mismo día', () => {
  const pet = { phrases: [{ category: 'positiva', text: 'te quiero' }], photos: [], food_preferences: [] };
  const now = at(12).getTime();
  let g = { events: {} };
  const r1 = rollEvent(g, pet, { now, rnd: seq([0.1]) });
  assert.equal(r1.type, 'regalo');
  g = endEvent(startEvent(g, r1), { now });
  const r2 = rollEvent({ ...g, events: { ...g.events, nextAt: 0 } }, pet, { now, rnd: seq([0.1]) });
  assert.equal(r2.type, 'carta');
  g = endEvent(startEvent(g, r2), { now });
  const r3 = rollEvent({ ...g, events: { ...g.events, nextAt: 0 } }, pet, { now, rnd: seq([0.5]) });
  assert.ok(!['regalo', 'carta'].includes(r3.type));
  assert.ok(g.events.nextAt >= now + EVENT_GAP * 0.69);
});

test('Halloween: del 1 al 31 de octubre, con cuenta regresiva', () => {
  assert.equal(activeSeason(new Date(2026, 9, 1)).id, 'halloween');
  assert.equal(activeSeason(new Date(2026, 9, 31, 23, 50)).id, 'halloween');
  assert.equal(activeSeason(new Date(2026, 8, 30)), null);
  assert.equal(activeSeason(new Date(2026, 10, 1)), null);
  const hw = activeSeason(new Date(2026, 9, 22));
  assert.equal(seasonDaysLeft(hw, new Date(2026, 9, 22, 21)), 10);
  assert.equal(seasonCountdown(hw, new Date(2026, 9, 30)), 'Quedan 2 días');
  assert.equal(seasonCountdown(hw, new Date(2026, 9, 31)), '¡Último día!');
  assert.ok(onSale({ id: 'x' }, new Date(2026, 5, 1)));
  assert.ok(onSale({ season: 'halloween' }, new Date(2026, 9, 5)));
  assert.ok(!onSale({ season: 'halloween' }, new Date(2026, 10, 2)));
});

test('Halloween: la visita disfrazada viene una vez al día y los fantasmitas solo en temporada', () => {
  const pet = { phrases: [], photos: [], food_preferences: [] };
  const day = (d, h) => ({ now: new Date(2026, 9, d, h).getTime(), date: new Date(2026, 9, d, h) });
  const done = (d) => ({ events: { lastDay: { regalo: `2026-10-${d}`, carta: `2026-10-${d}` } } });
  const { now, date } = day(22, 20);
  const ev = rollEvent(done(22), pet, { now, date, rnd: seq([0.3]) });
  assert.equal(ev.type, 'dulceotruco');
  assert.equal(ev.data.friend.wear.mano.id, 'cubetaDulces');
  assert.ok(ev.data.friend.wear.ropa.id);
  const after = endEvent(startEvent(done(22), ev), { now, date });
  assert.equal(after.events.lastDay.dulceotruco, '2026-10-22');
  const types = new Set();
  for (let i = 0; i < 40; i++) {
    const r = rollEvent({ ...after, events: { ...after.events, nextAt: 0 } }, pet, { now, date, rnd: seq([i / 40, 0.5]) });
    if (r) types.add(r.type);
  }
  assert.ok(!types.has('dulceotruco'), 'una sola vez al día');
  assert.ok(types.has('fantasmas'));
  // en noviembre ya no
  const nov = { now: new Date(2026, 10, 3, 20).getTime(), date: new Date(2026, 10, 3, 20) };
  const novTypes = new Set();
  for (let i = 0; i < 40; i++) {
    const r = rollEvent({ events: { lastDay: { regalo: '2026-11-03', carta: '2026-11-03' } } }, pet, { ...nov, rnd: seq([i / 40, 0.5]) });
    if (r) novTypes.add(r.type);
  }
  assert.ok(!novTypes.has('dulceotruco') && !novTypes.has('fantasmas'));
});

test('pedidos: llegan, se abren y lo comprado es tuyo', () => {
  let g = { coins: 0, ownedFurniture: [], fridge: {} };
  g = addDelivery(g, { kind: 'mueble', refId: 'sofa', paint: 'menta' });
  g = addDelivery(g, { kind: 'monedas', refId: 'monedas', value: 50 });
  g = addDelivery(g, { kind: 'comida', refId: 'fresa', n: 2 });
  assert.ok(hasPendingTrip(g) && !parcelAtDoor(g));
  g = arriveAll(g);
  assert.ok(parcelAtDoor(g));
  g = unpack(g, g.deliveries[0]);
  assert.deepEqual(g.ownedFurniture, ['sofa']);
  assert.equal(g.furniturePaint.sofa, 'menta');
  g = unpackAll(g);
  assert.equal(g.coins, 50);
  assert.equal(g.fridge.fresa, 2);
  assert.equal(g.deliveries.length, 0);
});

console.log(`\n${passed} pruebas OK`);
