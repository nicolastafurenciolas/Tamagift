// Pruebas del cartero de lo personal (personal/engine.js).
//   node src/personal/engine.test.mjs

import assert from 'node:assert/strict';
import {
  ingestLetters, ingestAnswers, ingestCoupons, nextDrop, clearShowing, chestView, chestReady, chestNext, openChestItem,
  situationLine, situationAllowed, registerVisit, ambientSituations, packageItem, parseServerDate,
  fmtCountdown, fmtCountdownShort, hiddenIds, unannouncedChest, announceChest,
  BIG_PER_DAY, NOTES_PER_DAY, SITUATIONS_PER_DAY, DROP_GAP,
} from './engine.js';
import { rollEvent, ARRIVAL_EVENTS } from '../worldEvents.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

const T0 = new Date(2026, 10, 4, 10, 0).getTime();   // miércoles 4/11, 10:00 local
const iso = (ms) => new Date(ms).toISOString().replace('Z', '');   // como lo manda el servidor
const L = (id, kind = 'carta', extra = {}) => ({ id, kind, text: `texto ${id}`, created_at: iso(T0), ...extra });

// Entrega todo lo que se pueda en un día, abriendo cada cosa al llegar.
function drainDay(p, start) {
  const got = [];
  for (let t = start; t < start + 12 * 3600 * 1000; t += DROP_GAP) {
    const r = nextDrop(p, { now: t });
    if (!r) continue;
    p = r.personal;
    got.push(r.item);
    if (p.showing) p = clearShowing(p, r.item.id);
  }
  return { p, got };
}

test('veinte cosas un domingo llegan repartidas: 2 grandes y 3 notas por día', () => {
  const letters = [];
  for (let i = 1; i <= 20; i++) letters.push(L(i, i % 2 ? 'carta' : 'nota'));
  let p = ingestLetters(null, letters);
  assert.equal(p.queue.length, 20);
  const day1 = drainDay(p, T0);
  assert.equal(day1.got.filter((x) => x.kind === 'carta').length, BIG_PER_DAY);
  assert.equal(day1.got.filter((x) => x.kind === 'nota').length, NOTES_PER_DAY);
  const day2 = drainDay(day1.p, T0 + 24 * 3600 * 1000);
  assert.equal(day2.got.length, BIG_PER_DAY + NOTES_PER_DAY);
  assert.equal(day2.p.queue.length, 20 - 2 * (BIG_PER_DAY + NOTES_PER_DAY));
});

test('una cosa a la vez: lo grande espera a que se abra lo anterior', () => {
  let p = ingestLetters(null, [L(1, 'carta'), L(2, 'voz', { has_audio: true })]);
  const a = nextDrop(p, { now: T0 });
  assert.equal(a.item.id, 1);
  p = a.personal;
  assert.equal(nextDrop(p, { now: T0 + 10 * DROP_GAP }), null);     // la carta sigue en la puerta
  p = clearShowing(p, 1);
  const b = nextDrop(p, { now: T0 + 10 * DROP_GAP });
  assert.equal(b.item.kind, 'voz');
  assert.equal(b.item.hasAudio, true);
});

test('si hay otra cosa nueva en el cuarto (busy) no llega nada', () => {
  const p = ingestLetters(null, [L(1, 'nota')]);
  assert.equal(nextDrop(p, { now: T0, busy: true }), null);
  assert.ok(nextDrop(p, { now: T0 }));
});

test('entre dos entregas pasa un rato', () => {
  let p = ingestLetters(null, [L(1, 'nota'), L(2, 'nota')]);
  p = nextDrop(p, { now: T0 }).personal;
  assert.equal(nextDrop(p, { now: T0 + 1000 }), null);
  assert.ok(nextDrop(p, { now: T0 + DROP_GAP }));
});

test('no se repite lo que ya entró', () => {
  let p = ingestLetters(null, [L(1), L(2)]);
  p = ingestLetters(p, [L(2), L(3)]);
  assert.deepEqual(p.queue.map((x) => x.id), [1, 2, 3]);
});

test('carta con fecha va al cofre, cuenta y brilla al llegar la fecha', () => {
  const openAt = T0 + 2 * 60 * 1000;
  let p = ingestLetters(null, [L(5, 'carta', { open_at: iso(openAt), locked: true, text: '' })], { now: T0 });
  assert.equal(p.queue.length, 0);
  assert.equal(p.chest.length, 1);
  assert.equal(chestView(p, T0)[0].state, 'locked');
  assert.equal(chestNext(p, T0).id, 5);
  assert.equal(chestReady(p, T0), null);
  assert.equal(chestView(p, openAt + 1)[0].state, 'ready');
  assert.equal(chestReady(p, openAt + 1).id, 5);
  // mientras brilla no llega otra cosa grande (un indicador a la vez); una nota sí
  p = ingestLetters(p, [L(6, 'carta')]);
  assert.equal(nextDrop(p, { now: openAt + 1 }), null);
  assert.equal(nextDrop(ingestLetters(p, [L(8, 'nota')]), { now: openAt + 1 }).item.id, 8);
  p = openChestItem(p, 5, { text: 'feliz aniversario' });
  assert.equal(chestView(p, openAt + 1)[0].state, 'read');
  assert.equal(chestView(p, openAt + 1)[0].text, 'feliz aniversario');
  assert.ok(nextDrop(p, { now: openAt + 1 }));
});

test('"ábrela cuando me extrañes" queda en el cofre para cuando quiera', () => {
  let p = ingestLetters(null, [L(7, 'carta', { payload: JSON.stringify({ cuando: 'extranes' }) })]);
  assert.equal(p.chest.length, 1);
  assert.equal(chestView(p, T0)[0].state, 'anytime');
  assert.equal(chestReady(p, T0), null);   // no brilla ni bloquea
  assert.equal(unannouncedChest(p).id, 7);
  p = announceChest(p, 7);
  assert.equal(unannouncedChest(p), null);
});

test('lo que espera turno no se ve en el archivo', () => {
  const p = ingestLetters(null, [L(1), L(2, 'nota')]);
  const r = nextDrop(p, { now: T0 });
  const hidden = hiddenIds(r.personal);
  assert.equal(hidden.has('1'), false);
  assert.equal(hidden.has('2'), true);
});

test('las respuestas a sus preguntas llegan una vez', () => {
  const replies = [{ id: 3, kind: 'pregunta', text: '¿Qué canción?', answer: 'La nuestra' }, { id: 4, kind: 'pregunta', text: '¿Viaje?', answer: null }, { id: 5, kind: 'foto' }];
  let p = ingestAnswers(null, replies);
  assert.equal(p.queue.length, 1);
  assert.equal(p.queue[0].text, 'La nuestra');
  p = ingestAnswers(p, replies);
  assert.equal(p.queue.length, 1);
  const r = nextDrop(p, { now: T0 });
  assert.equal(r.item.kind, 'answer');
  assert.equal(r.personal.showing, null);
});

test('mensajes por situación: cada, sin repetir texto, máximo por día', () => {
  const profile = { situations: { buenasnoches: ['a {nombre}', 'b', 'c'], lluvia: ['ll'], triste: ['t1', 't2'], lunes: ['l'] } };
  const d1 = new Date(2026, 10, 4, 23, 0);
  let r = situationLine(null, profile, 'buenasnoches', { date: d1, names: { nombre: 'Ana' }, rnd: () => 0 });
  assert.equal(r.text, 'a Ana');
  let p = r.personal;
  assert.equal(situationLine(p, profile, 'buenasnoches', { date: d1 }), null);   // cada: 1 día
  r = situationLine(p, profile, 'lluvia', { date: d1 });
  p = r.personal;
  assert.equal(situationAllowed(p, profile, 'triste', { date: d1 }), false);     // ya van 2 hoy
  assert.equal(SITUATIONS_PER_DAY, 2);
  // al otro día vuelve, con otro texto
  const d2 = new Date(2026, 10, 5, 23, 0);
  const seen = new Set(['a Ana']);
  for (const d of [d2, new Date(2026, 10, 6, 23, 0)]) {
    r = situationLine(p, profile, 'buenasnoches', { date: d, names: { nombre: 'Ana' } });
    assert.ok(r);
    assert.ok(!seen.has(r.text), `repitió ${r.text}`);
    seen.add(r.text);
    p = r.personal;
  }
  // ya salieron los tres: vuelve a empezar sin repetir el último
  const lastText = r.text;
  r = situationLine(p, profile, 'buenasnoches', { date: new Date(2026, 10, 7, 23, 0), names: { nombre: 'Ana' } });
  assert.notEqual(r.text, lastText);
  // lluvia: cada 2 días
  assert.equal(situationAllowed(p, profile, 'lluvia', { date: d2 }), false);
  assert.equal(situationAllowed(p, profile, 'lluvia', { date: new Date(2026, 10, 6, 10, 0) }), true);
  // sin textos, no hay mensaje
  assert.equal(situationLine(p, profile, 'viernes', { date: d2 }), null);
});

test('visitas: primera del día y días sin entrar', () => {
  let v = registerVisit(null, { date: new Date(2026, 10, 1, 9) });
  assert.equal(v.firstToday, true);
  v = registerVisit(v.personal, { date: new Date(2026, 10, 1, 15) });
  assert.equal(v.firstToday, false);
  v = registerVisit(v.personal, { date: new Date(2026, 10, 4, 8) });
  assert.equal(v.firstToday, true);
  assert.equal(v.daysAway, 3);
  const amb = ambientSituations({ date: new Date(2026, 10, 4, 8), session: v, weather: 'lluvia' });
  assert.deepEqual(amb.slice(0, 3), ['ausencia', 'buenosdias', 'lluvia']);
  assert.ok(ambientSituations({ date: new Date(2026, 10, 4, 2) }).includes('desvelo'));
  assert.ok(ambientSituations({ date: new Date(2026, 10, 9, 10) }).includes('lunes'));
  assert.ok(ambientSituations({ date: new Date(2026, 10, 6, 10) }).includes('viernes'));
  assert.ok(ambientSituations({ date: new Date(2026, 10, 4, 15), sad: true }).includes('triste'));
});

test('paquetes: se entiende lo que manda el rincón', () => {
  assert.deepEqual(packageItem(JSON.stringify({ kind: 'mueble', refId: 'sofa', label: 'Sofá' })), { kind: 'mueble', label: 'Sofá', refId: 'sofa' });
  assert.deepEqual(packageItem({ item: { kind: 'ropa', slot: 'cabeza', id: 'gorro' } }), { kind: 'ropa', label: '', wear: { id: 'gorro' }, refId: 'cabeza:gorro' });
  assert.equal(packageItem({ kind: 'pared', value: 'rayas.rosa' }).refId, 'rayas');
  assert.equal(packageItem({ kind: 'monedas', value: 99999 }).value, 500);
  assert.equal(packageItem({ kind: 'nave' }), null);
  assert.equal(packageItem('no es json'), null);
});

test('fechas del servidor y cuenta regresiva', () => {
  assert.equal(parseServerDate('2026-11-04T15:00:00'), Date.UTC(2026, 10, 4, 15));
  assert.equal(parseServerDate('2026-11-04T15:00:00+00:00'), Date.UTC(2026, 10, 4, 15));
  assert.equal(fmtCountdown(3 * 86400e3 + 5), '3 días');
  assert.equal(fmtCountdown(5 * 3600e3 + 20 * 60e3), '5 h 20 min');
  assert.equal(fmtCountdown(90e3), '1 min');
  assert.equal(fmtCountdownShort(125e3), '2:05');
  assert.equal(fmtCountdownShort(26 * 3600e3), '1 d');
});

test('con algo de quien regala esperando, no llega nada más a la puerta', () => {
  const pet = { phrases: [{ category: 'casual', text: 'hola' }], food_preferences: [] };
  for (let i = 0; i < 60; i++) {
    const ev = rollEvent({ events: {} }, pet, { now: T0 + i, quiet: true, rnd: () => (i % 10) / 10 });
    assert.ok(ev && !ARRIVAL_EVENTS.includes(ev.type), ev && ev.type);
  }
  assert.equal(rollEvent({ events: {} }, pet, { now: T0 }).type, 'regalo');
});

test('cupón cumplido: llega una vez, como sorpresa chiquita', () => {
  const profile = { coupons: [{ id: 'k1', title: 'Vale por una cena', stars: 30 }] };
  const replies = [{ id: 9, kind: 'canje', ref: 'k1', done: true, answer: 'el sábado' }, { id: 10, kind: 'canje', ref: 'k1', done: false }];
  let p = ingestCoupons(null, replies, profile);
  assert.equal(p.queue.length, 1);
  assert.equal(p.queue[0].text, 'Vale por una cena');
  p = ingestCoupons(p, replies, profile);
  assert.equal(p.queue.length, 1);
  const r = nextDrop(p, { now: T0 });
  assert.equal(r.item.kind, 'cupon');
  assert.equal(r.personal.notes, 0);
});

console.log(`\n${passed} pruebas pasaron`);
