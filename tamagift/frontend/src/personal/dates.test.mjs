// Pruebas de las fechas como temporadas propias (personal/dates.js).
//   node src/personal/dates.test.mjs

import assert from 'node:assert/strict';
import { personalSeasonNow, personalSeasonsAround, occurrenceOf, parseDate, fakePersonalSeason, CELEBRATIONS } from './dates.js';
import { roomSeason, activeSeason } from '../seasons.js';
import { guessDish, giverRecipes } from './recipes.js';
import { placesFor, placeSlots, zoneLevels, signLines } from '../art/levelMaps.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.stack}`); process.exitCode = 1; }
}

const NAMES = { nombre: 'Ana', yo: 'Leo' };
const D = (y, m, d) => new Date(y, m - 1, d, 15);
const prof = (...dates) => ({ dates: dates.map(([kind, date, label], i) => ({ id: `d${i}`, kind, date, label })) });

test('lee fechas con y sin año, y rechaza las imposibles', () => {
  assert.deepEqual(parseDate('1998-03-14'), { year: 1998, m: 3, d: 14 });
  assert.deepEqual(parseDate('03-14'), { year: null, m: 3, d: 14 });
  assert.deepEqual(parseDate('02-29'), { year: null, m: 2, d: 29 });
  assert.equal(parseDate('2023-02-29'), null);   // 2023 no es bisiesto
  assert.equal(parseDate('04-31'), null);
  assert.equal(parseDate('13-01'), null);
  assert.equal(parseDate(''), null);
  assert.equal(parseDate('mañana'), null);
});

test('cumpleaños: víspera, día y día después (3 días)', () => {
  const p = prof(['cumple', '1999-11-20']);
  assert.equal(personalSeasonNow(p, D(2026, 11, 18)), null);
  const eve = personalSeasonNow(p, D(2026, 11, 19), { names: NAMES });
  assert.equal(eve.offset, -1); assert.equal(eve.isDay, false); assert.equal(eve.theme, 'cumple');
  const day = personalSeasonNow(p, D(2026, 11, 20), { names: NAMES });
  assert.equal(day.isDay, true); assert.equal(day.day, '2026-11-20');
  assert.ok(day.line.includes('Ana') || day.line.includes('Leo'), day.line);
  assert.equal(day.bannerName, 'Ana');
  assert.equal(day.decor.left, 'globos'); assert.equal(day.decor.right, 'pastel');
  assert.ok(!/\{|\}/.test(day.line + day.title), day.line);
  assert.equal(personalSeasonNow(p, D(2026, 11, 21)).offset, 1);
  assert.equal(personalSeasonNow(p, D(2026, 11, 22)), null);
});

test('cumpleaños: nunca dice la edad', () => {
  const s = personalSeasonNow(prof(['cumple', '1990-06-01']), D(2026, 6, 1), { names: NAMES });
  assert.ok(!/36/.test(s.line + s.title + s.banner), s.line);
});

test('aniversario con año cuenta los años; sin año, no', () => {
  const con = personalSeasonNow(prof(['aniversario', '2021-02-14']), D(2026, 2, 14), { names: NAMES });
  assert.equal(con.years, 5);
  assert.equal(con.banner, '5 años juntos');
  const sin = personalSeasonNow(prof(['aniversario', '02-14']), D(2026, 2, 14), { names: NAMES });
  assert.equal(sin.years, null);
  assert.equal(sin.banner, 'Feliz aniversario');
  for (let d = 13; d <= 15; d++) {
    const s = personalSeasonNow(prof(['aniversario', '02-14']), D(2026, 2, d), { names: NAMES });
    assert.ok(!/\{n\}|hace\s+años/.test(s.line), s.line);   // sin año no hay "{n}" suelto
  }
  const uno = personalSeasonNow(prof(['aniversario', '2025-02-14']), D(2026, 2, 14));
  assert.equal(uno.banner, '1 año juntos');
});

test('el mismo año de la fecha (o antes) no cuenta años', () => {
  const s = personalSeasonNow(prof(['conocimos', '2026-05-02']), D(2026, 5, 2));
  assert.equal(s.years, null);
});

test('29 de febrero: el 29 en bisiestos, el 28 en los demás', () => {
  assert.equal(occurrenceOf('02-29', 2028), '2028-02-29');
  assert.equal(occurrenceOf('02-29', 2027), '2027-02-28');
  const p = prof(['conocimos', '2020-02-29']);
  assert.equal(personalSeasonNow(p, D(2027, 2, 28)).isDay, true);
  assert.equal(personalSeasonNow(p, D(2027, 3, 1)).offset, 1);
  assert.equal(personalSeasonNow(p, D(2028, 2, 28)), null);          // en bisiesto el 28 todavía no
  assert.equal(personalSeasonNow(p, D(2028, 2, 29)).isDay, true);
  assert.equal(personalSeasonNow(p, D(2028, 2, 29)).years, 8);
  const cumple = prof(['cumple', '02-29']);
  assert.equal(personalSeasonNow(cumple, D(2027, 2, 27)).offset, -1);  // víspera del 28
});

test('fechas sin año en el cambio de año (31 de dic. y 1 de ene.)', () => {
  const p = prof(['cumple', '12-31']);
  assert.equal(personalSeasonNow(p, D(2026, 12, 30)).offset, -1);
  assert.equal(personalSeasonNow(p, D(2026, 12, 31)).isDay, true);
  const after = personalSeasonNow(p, D(2027, 1, 1));
  assert.equal(after.offset, 1); assert.equal(after.day, '2026-12-31');
  const ene = prof(['aniversario', '2020-01-01']);
  const eve = personalSeasonNow(ene, D(2026, 12, 31));
  assert.equal(eve.offset, -1); assert.equal(eve.day, '2027-01-01'); assert.equal(eve.years, 7);
});

test('cuántos días dura cada una (de 1 a 3)', () => {
  for (const [kind, c] of Object.entries(CELEBRATIONS)) {
    const p = prof([kind, '07-10', 'el día que adoptamos a Luna']);
    let n = 0;
    for (let d = 5; d <= 15; d++) if (personalSeasonNow(p, D(2026, 7, d))) n++;
    assert.equal(n, c.span[0] + c.span[1] + 1, kind);
    assert.ok(n >= 1 && n <= 3, kind);
  }
});

test('si se pisan, gana la de hoy y después el cumpleaños', () => {
  const p = prof(['aniversario', '05-10'], ['cumple', '05-11']);
  // 10 de mayo: aniversario es hoy, el cumple es mañana → aniversario
  assert.equal(personalSeasonNow(p, D(2026, 5, 10)).kind, 'aniversario');
  // 11 de mayo: cumple es hoy (el aniversario fue ayer) → cumple
  assert.equal(personalSeasonNow(p, D(2026, 5, 11)).kind, 'cumple');
  // el 9: los dos son "mañana o pasado"; el aniversario es víspera, el cumple no toca
  assert.equal(personalSeasonNow(p, D(2026, 5, 9)).kind, 'aniversario');
  // ninguno es hoy pero los dos tocan: gana el cumpleaños
  const q = prof(['aniversario', '05-10'], ['cumple', '05-12']);
  assert.equal(personalSeasonNow(q, D(2026, 5, 11)).kind, 'cumple');
  assert.equal(personalSeasonsAround(q, D(2026, 5, 11)).length, 2);
});

test('"otra" usa su nombre y dura un día', () => {
  const p = prof(['otra', '08-03', 'El día que adoptamos a Luna']);
  const s = personalSeasonNow(p, D(2026, 8, 3), { names: NAMES });
  assert.equal(s.banner, 'El día que adoptamos a Luna');
  assert.ok(s.line.includes('el día que adoptamos a Luna'), s.line);
  assert.equal(personalSeasonNow(p, D(2026, 8, 4)), null);
  const sinNombre = personalSeasonNow(prof(['otra', '08-03']), D(2026, 8, 3));
  assert.equal(sinNombre.banner, 'Un día especial');
});

test('nuestra canción: solo el día mismo y si hay canciones', () => {
  const p = prof(['aniversario', '09-09']);
  assert.equal(personalSeasonNow(p, D(2026, 9, 9), { songs: 2 }).song, true);
  assert.ok(personalSeasonNow(p, D(2026, 9, 9), { songs: 2, names: NAMES }).songLine);
  assert.equal(personalSeasonNow(p, D(2026, 9, 9), { songs: 0 }).song, false);
  assert.equal(personalSeasonNow(p, D(2026, 9, 10), { songs: 2 }).song, false);
});

test('ficha vacía, rota o con fechas malas: nada', () => {
  assert.equal(personalSeasonNow(null, D(2026, 1, 1)), null);
  assert.equal(personalSeasonNow({}, D(2026, 1, 1)), null);
  assert.equal(personalSeasonNow({ dates: 'x' }, D(2026, 1, 1)), null);
  assert.equal(personalSeasonNow({ dates: [null, { kind: 'cumple', date: '' }, { kind: 'cumple', date: '02-30' }] }, D(2026, 2, 28)), null);
  // tipo desconocido: se celebra como "otra"
  assert.equal(personalSeasonNow({ dates: [{ kind: 'raro', date: '03-03' }] }, D(2026, 3, 3)).kind, 'otra');
});

test('el id cambia de año a año (para avisar una sola vez)', () => {
  const p = prof(['cumple', '04-04']);
  const a = personalSeasonNow(p, D(2026, 4, 4)), b = personalSeasonNow(p, D(2027, 4, 4));
  assert.notEqual(a.id, b.id);
  assert.equal(a.id, personalSeasonNow(p, D(2026, 4, 3)).id);   // la víspera es la misma temporada
});

test('convive con Halloween y Navidad: la propia gana en el cuarto', () => {
  const p = prof(['cumple', '10-31']);
  const r = roomSeason(p, D(2026, 10, 31), { names: NAMES });
  assert.equal(r.top, 'personal');
  assert.equal(r.fixed.id, 'halloween');          // la tienda sigue con Halloween
  assert.equal(r.personal.kind, 'cumple');
  const nav = roomSeason(prof(['aniversario', '12-25']), D(2026, 12, 25));
  assert.equal(nav.top, 'personal'); assert.equal(nav.fixed.id, 'navidad');
  const solo = roomSeason(p, D(2026, 12, 2));
  assert.equal(solo.top, 'fixed'); assert.equal(solo.personal, null);
  assert.equal(roomSeason(p, D(2026, 6, 2)).top, null);
  assert.equal(activeSeason(D(2026, 10, 31)).id, 'halloween');
});

test('una temporada armada a mano para el laboratorio', () => {
  for (const k of Object.keys(CELEBRATIONS)) {
    const s = fakePersonalSeason(k, D(2026, 11, 4), { names: NAMES });
    assert.ok(s && s.isDay, k);
    assert.equal(s.kind, k);
  }
});

// ── Su historia: lugares y recetas ───────────────────────────────
test('lugares: primero la primera zona de cada mundo', () => {
  const P = ['A', 'B', 'C', 'D', 'E', 'F'].map((name, i) => ({ id: i, name }));
  assert.deepEqual(placesFor('golosinas', P).map((p) => p && p.name), ['A', 'E', null]);
  assert.deepEqual(placesFor('cocina', P).map((p) => p && p.name), ['B', 'F', null]);
  assert.deepEqual(placesFor('rompecabezas', P).map((p) => p && p.name), ['D', null]);
  assert.deepEqual(placesFor('memoria', []), [null, null, null]);
  // un lugar sin nombre no cuenta: X va a golosinas, Y a cocina
  assert.deepEqual(placesFor('golosinas', [{ name: '  ' }, { name: 'X' }, { name: 'Y' }]).map((p) => p && p.name), ['X', null, null]);
  assert.equal(placeSlots().length, 11);
  assert.deepEqual(zoneLevels('cocina', 12, 0), [1, 2, 3, 4]);
  assert.equal(signLines('El café donde nos conocimos hace años').length, 2);
  assert.deepEqual(signLines('La huerta'), ['La huerta']);
});

test('recetas de quien regala: plato base elegido o adivinado', () => {
  assert.equal(guessDish('La pasta de nuestra primera cita'), 'pasta');
  assert.equal(guessDish('Las galletas de tu abuela'), 'galleta');
  assert.equal(guessDish('Lo que cocinamos la primera vez'), 'panqueques');
  const r = giverRecipes({ recipes: [{ id: 1, name: 'Mi famoso arroz', story: 'Con amor' }, { id: 2, name: 'Sorpresa', dish: 'ramen' }, { id: 3, name: '' }, { id: 4, name: 'Rara', dish: 'nada' }] });
  assert.deepEqual(r.map((x) => x.base.id), ['arroz', 'ramen', 'panqueques']);
  assert.equal(r[0].story, 'Con amor');
  assert.ok(r[0].steps.length >= 3);
  assert.deepEqual(giverRecipes(null), []);
});

console.log(`\n${passed} pruebas ok`);
