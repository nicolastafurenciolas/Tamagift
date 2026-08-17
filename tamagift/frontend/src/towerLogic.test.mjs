// Pruebas de "Torre de bloques".
//   node src/towerLogic.test.mjs
//
// El bloque se mueve con requestAnimationFrame, que no corre sin
// pantalla: sin esto la única forma de saber si clavar un bloque de
// verdad devuelve ancho sería jugar a ojo muchas veces.

import assert from 'node:assert/strict';
import { TOWER, resolveDrop } from './towerLogic.js';

const W = 300;
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

test('un bloque desalineado se recorta a lo que quedó apoyado', () => {
  const top = { x: 100, w: 100 };
  const cur = { x: 130, w: 100 };          // 30 de desfase
  const r = resolveDrop(top, cur, W);
  assert.equal(r.lost, false);
  assert.equal(r.perfect, false);
  assert.equal(r.block.w, 70, 'pierde exactamente lo que sobresalió');
  assert.equal(r.block.x, 130);
});

test('sin apoyo suficiente se pierde', () => {
  const top = { x: 100, w: 100 };
  const cur = { x: 197, w: 100 };          // solo 3 de solape
  assert.equal(resolveDrop(top, cur, W).lost, true);
});

// El motivo de existir de la mecánica: sin esto la torre solo se
// angostaba y la partida se acababa sola a los pocos pisos.
test('clavarlo justo DEVUELVE ancho en vez de quitarlo', () => {
  const top = { x: 100, w: 80 };
  const cur = { x: 102, w: 80 };           // dentro del margen de perdón
  const r = resolveDrop(top, cur, W);
  assert.equal(r.perfect, true);
  assert.ok(r.block.w > top.w, `debería ensanchar (${top.w} → ${r.block.w})`);
  assert.equal(r.block.w, 80 + TOWER.REGROW);
});

test('el desfase justo en el límite del perdón todavía cuenta como clavado', () => {
  const top = { x: 100, w: 80 };
  const r = resolveDrop(top, { x: 100 + TOWER.PERFECT_TOL, w: 80 }, W);
  assert.equal(r.perfect, true);
});

test('un pixel más allá del perdón ya NO es clavado', () => {
  const top = { x: 100, w: 80 };
  const r = resolveDrop(top, { x: 100 + TOWER.PERFECT_TOL + 1, w: 80 }, W);
  assert.equal(r.perfect, false);
  assert.ok(r.block.w < top.w, 'sin clavarlo tiene que angostarse');
});

test('el ancho recuperado nunca pasa del ancho inicial', () => {
  const top = { x: 90, w: TOWER.START_W };
  const r = resolveDrop(top, { x: 90, w: TOWER.START_W }, W);
  assert.equal(r.block.w, TOWER.START_W, 'no puede crecer más que el bloque original');
});

test('un bloque clavado no se sale del tablero', () => {
  for (const x of [0, 2, W - 60, W - 50]) {
    const top = { x, w: 50 };
    const r = resolveDrop(top, { x, w: 50 }, W);
    assert.ok(r.block.x >= 0, `x=${r.block.x} no puede ser negativo`);
    assert.ok(r.block.x + r.block.w <= W, `se sale por la derecha (${r.block.x}+${r.block.w})`);
  }
});

// La prueba que de verdad responde a la queja "la torre es muy corta".
test('clavando siempre, la torre no se agota', () => {
  let top = { x: 90, w: TOWER.START_W };
  for (let piso = 0; piso < 200; piso++) {
    const r = resolveDrop(top, { x: top.x, w: top.w }, W);
    assert.equal(r.lost, false, `se cayó en el piso ${piso} pese a clavar todos`);
    top = r.block;
  }
  assert.equal(top.w, TOWER.START_W, 'clavando siempre se mantiene el ancho máximo');
});

// Y el contraste: sin clavar, la partida sí se acaba (el juego no se
// volvió imposible de perder).
test('desalineando siempre, la torre se acaba', () => {
  let top = { x: 90, w: TOWER.START_W };
  let pisos = 0;
  for (; pisos < 200; pisos++) {
    const r = resolveDrop(top, { x: top.x + 10, w: top.w }, W);
    if (r.lost) break;
    top = r.block;
  }
  assert.ok(pisos < 200, 'fallando siempre tiene que acabarse en algún momento');
  assert.ok(pisos > 3, `debería aguantar unos pisos antes de caerse (aguantó ${pisos})`);
});

console.log(`\n${passed} pruebas OK`);
