// Pruebas de la Cocina (recetas y puntaje).
//   node src/cooking.test.mjs

import assert from 'node:assert/strict';
import { RECIPES, STEP_TEXT, decoysFor, stepQuality, recipeScore, starsForCooking, portionsFor, donenessQuality } from './cooking.js';
import { FOODS } from './foodCatalog.js';
import { INGREDIENTS } from './art/kitchen.js';
import { LEVEL_GAMES } from './gameProgress.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

test('hay una receta por nivel y cada una cocina una comida del catálogo', () => {
  assert.equal(RECIPES.length, LEVEL_GAMES.cocina);
  const ids = new Set(FOODS.map((f) => f.id));
  RECIPES.forEach((r) => assert.ok(ids.has(r.food), `${r.id} → ${r.food}`));
  assert.equal(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length, 'ids únicos');
});

test('cada paso es de un tipo conocido y sus ingredientes tienen dibujo', () => {
  RECIPES.forEach((r) => {
    assert.ok(r.steps.length >= 3 && r.steps.length <= 5, `${r.id}: ${r.steps.length} pasos`);
    r.steps.forEach((s) => {
      assert.ok(STEP_TEXT[s.type], `${r.id}: paso ${s.type}`);
      [s.item, ...(s.items || [])].filter(Boolean).forEach((it) => assert.ok(INGREDIENTS[it], `${r.id}: falta el dibujo de ${it}`));
    });
  });
});

test('los señuelos nunca son ingredientes de la receta', () => {
  RECIPES.forEach((r) => r.steps.filter((s) => s.type === 'agregar').forEach((s) => {
    for (let k = 0; k < 20; k++) decoysFor(s).forEach((d) => assert.ok(!s.items.includes(d)));
  }));
});

test('la calidad siempre queda entre 0 y 1', () => {
  const cases = [
    [{ type: 'picar', cuts: 4 }, { secs: 0.5 }], [{ type: 'picar', cuts: 4 }, { secs: 99 }],
    [{ type: 'agregar' }, { mistakes: 9 }], [{ type: 'revolver', turns: 2 }, { secs: 1 }],
    [{ type: 'punto', flips: 2 }, { flips: [0.5, 1] }], [{ type: 'fuego' }, { inBand: 0, total: 5 }],
    [{ type: 'amasar', taps: 10 }, { secs: 30 }], [{ type: 'decorar' }, {}],
  ];
  cases.forEach(([s, r]) => { const q = stepQuality(s, r); assert.ok(q >= 0 && q <= 1, `${s.type}: ${q}`); });
});

test('en su punto vale más que crudo o quemado', () => {
  assert.equal(donenessQuality(0.5), 1);
  assert.ok(donenessQuality(0.62) < 1);
  assert.ok(donenessQuality(0.95) < donenessQuality(0.62));
  assert.ok(donenessQuality(0.05) < donenessQuality(0.38));
});

test('puntaje, estrellas y porciones', () => {
  assert.equal(recipeScore([1, 1, 1]), 100);
  assert.equal(starsForCooking(100), 3);
  assert.equal(starsForCooking(70), 2);
  assert.equal(starsForCooking(10), 1);
  assert.equal(portionsFor(3), 2);
  assert.equal(portionsFor(2), 1);
});

console.log(`\n${passed} pruebas OK`);
