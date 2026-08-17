// Pruebas de la física de "Salta y vuela".
//   node src/flyPhysics.test.mjs
//
// Existen porque el bucle del juego usa requestAnimationFrame, que no
// corre en un entorno sin pantalla: sin esto, la única forma de saber
// si la gravedad, los choques o el puntaje funcionan sería jugar a ojo.

import assert from 'node:assert/strict';
import { FLY, createFlyState, flapState, stepFly } from './flyPhysics.js';

const DT = 1 / 60;
const midGap = () => (FLY.H - FLY.GAP) / 2;   // hueco centrado, camino libre

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

test('quieta hasta el primer aleteo', () => {
  const s = createFlyState();
  const y0 = s.petY;
  for (let i = 0; i < 30; i++) stepFly(s, DT, midGap);
  assert.equal(s.petY, y0, 'no debe caer antes de empezar');
  assert.equal(s.pipes.length, 0, 'no deben aparecer tubos antes de empezar');
});

test('la gravedad la hace caer', () => {
  const s = flapState(createFlyState());
  const y0 = s.petY;
  for (let i = 0; i < 40; i++) stepFly(s, DT, midGap);
  assert.ok(s.petY > y0, `debería haber caído (y0=${y0}, y=${s.petY})`);
});

test('aletear la empuja hacia arriba', () => {
  const s = flapState(createFlyState());
  for (let i = 0; i < 20; i++) stepFly(s, DT, midGap);
  const yAntes = s.petY;
  flapState(s);
  for (let i = 0; i < 6; i++) stepFly(s, DT, midGap);
  assert.ok(s.petY < yAntes, 'tras aletear debe subir');
});

test('se muere si toca el suelo', () => {
  const s = flapState(createFlyState());
  for (let i = 0; i < 600 && !s.dead; i++) stepFly(s, DT, midGap);
  assert.ok(s.dead, 'sin aletear tiene que estrellarse');
});

test('se muere si sale por arriba', () => {
  const s = createFlyState();
  s.started = true;
  s.petY = 20;
  s.vel = -400;
  for (let i = 0; i < 30 && !s.dead; i++) stepFly(s, DT, midGap);
  assert.ok(s.dead, 'el techo también mata');
});

test('suma un punto al pasar un tubo', () => {
  const s = createFlyState();
  s.started = true;
  // Mantiene la mascota centrada en el hueco a mano, para aislar el
  // puntaje de la habilidad de volar.
  for (let i = 0; i < 60 * 6 && !s.dead; i++) {
    s.petY = midGap() + FLY.GAP / 2;
    s.vel = 0;
    stepFly(s, DT, midGap);
  }
  assert.ok(s.score >= 1, `debería haber puntuado al menos 1 (score=${s.score})`);
  assert.ok(!s.dead, 'volando por el centro del hueco no debe chocar');
});

test('choca contra el tubo si va por fuera del hueco', () => {
  const s = createFlyState();
  s.started = true;
  for (let i = 0; i < 60 * 4 && !s.dead; i++) {
    s.petY = 40;              // bien arriba, fuera del hueco centrado
    s.vel = 0;
    stepFly(s, DT, midGap);
  }
  assert.ok(s.dead, 'pasar por fuera del hueco tiene que matar');
});

// El motivo de que HIT_R sea menor que PET_R: rozar el tubo con el borde
// del dibujo no debe matar. Antes se usaba un solo radio y el juego se
// sentía injusto — se perdía por roces que visualmente parecían pasar.
test('rozar el tubo con el borde del dibujo NO mata', () => {
  const gapY = midGap();
  // petY elegido para que el sprite invada el tubo pero la caja de choque no.
  const petY = gapY + FLY.PET_R - 4;
  assert.ok(petY - FLY.PET_R < gapY, 'el dibujo tiene que estar invadiendo el tubo');
  assert.ok(petY - FLY.HIT_R >= gapY, 'la caja de choque tiene que estar libre');

  const s = createFlyState();
  s.started = true;
  s.pipes = [{ x: FLY.PET_X - 10, gapY, scored: true }];
  s.spawnIn = 999;
  for (let i = 0; i < 30 && !s.dead; i++) {
    s.petY = petY;
    s.vel = 0;
    stepFly(s, DT, midGap);
  }
  assert.ok(!s.dead, 'un roce dentro del margen de perdón no puede matar');
});

test('meterse de verdad en el tubo sí mata', () => {
  const gapY = midGap();
  const s = createFlyState();
  s.started = true;
  s.pipes = [{ x: FLY.PET_X - 10, gapY, scored: true }];
  s.spawnIn = 999;
  for (let i = 0; i < 30 && !s.dead; i++) {
    s.petY = gapY - 20;        // claramente por encima del hueco
    s.vel = 0;
    stepFly(s, DT, midGap);
  }
  assert.ok(s.dead, 'el perdón no puede volver el juego imposible de perder');
});

test('un mismo tubo no puntúa dos veces', () => {
  const s = createFlyState();
  s.started = true;
  s.pipes = [{ x: FLY.PET_X - FLY.PET_R - FLY.PIPE_W - 1, gapY: midGap(), scored: false }];
  s.spawnIn = 999;            // que no aparezcan tubos nuevos
  for (let i = 0; i < 20; i++) {
    s.petY = midGap() + FLY.GAP / 2;
    s.vel = 0;
    stepFly(s, DT, midGap);
  }
  assert.equal(s.score, 1, 'el mismo tubo solo puede dar un punto');
});

test('acelera con el puntaje, con tope', () => {
  const lento = createFlyState(); lento.started = true; lento.score = 0;
  const rapido = createFlyState(); rapido.started = true; rapido.score = 10;
  const topado = createFlyState(); topado.started = true; topado.score = 999;

  for (const s of [lento, rapido, topado]) {
    s.pipes = [{ x: 200, gapY: midGap(), scored: true }];
    s.spawnIn = 999;
    s.petY = midGap() + FLY.GAP / 2;
    stepFly(s, DT, midGap);
  }
  const avance = (s) => 200 - s.pipes[0].x;
  assert.ok(avance(rapido) > avance(lento), 'con más puntos los tubos van más rápido');
  const esperadoTope = (FLY.BASE_SPEED + FLY.MAX_EXTRA_SPEED) * DT;
  assert.ok(Math.abs(avance(topado) - esperadoTope) < 0.01, 'la velocidad tiene tope');
});

test('los tubos que salen de pantalla se descartan', () => {
  const s = createFlyState();
  s.started = true;
  s.pipes = [{ x: -FLY.PIPE_W - 50, gapY: midGap(), scored: true }];
  s.spawnIn = 999;
  s.petY = midGap() + FLY.GAP / 2;
  stepFly(s, DT, midGap);
  assert.equal(s.pipes.length, 0, 'no se acumulan tubos viejos en memoria');
});

console.log(`\n${passed} pruebas OK`);
