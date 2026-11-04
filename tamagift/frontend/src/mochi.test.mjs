// Pruebas de la mochi (el SVG por partes que cada estilo redibuja).
//   node src/mochi.test.mjs
//
// No hace falta navegador: la mochi se arma como texto. Se revisa que
// ninguna combinación produzca coordenadas rotas (NaN, undefined), que
// las recetas viejas sigan sirviendo y que los estilos de partida solo
// usen piezas que existen.

import assert from 'node:assert/strict';
import {
  mochiSvg, geometry, SHAPES, EARS, EYES, MOUTHS, CHEEKS, TAILS, PATTERNS,
  HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, MOODS,
} from './art/mochi/index.js';
import { shapeOf } from './art/mochi/body.js';
import { PET_STYLES } from './petStyles.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

const broken = (svg) => /NaN|undefined|null|Infinity/.test(svg);
const balanced = (svg) => (svg.match(/<g[\s>]/g) || []).length === (svg.match(/<\/g>/g) || []).length;
const ids = (list) => list.map((x) => x.id);

test('cada pieza, en cada ancho y ánimo, da un SVG sano', () => {
  const fields = { ears: EARS, eyes: EYES, mouth: MOUTHS, cheeks: CHEEKS, tail: TAILS, pattern: PATTERNS, headAcc: HEAD_ACCESSORIES, neckAcc: NECK_ACCESSORIES, extraAcc: EXTRA_ACCESSORIES };
  let n = 0;
  for (const s of SHAPES) {
    for (const [field, list] of Object.entries(fields)) {
      for (const opt of list) {
        for (const mood of MOODS) {
          const svg = mochiSvg({ body: s.id, [field]: opt.id }, mood);
          assert.ok(!broken(svg), `${s.id}/${field}=${opt.id}/${mood} tiene coordenadas rotas`);
          assert.ok(balanced(svg), `${s.id}/${field}=${opt.id}/${mood} tiene grupos sin cerrar`);
          n++;
        }
      }
    }
  }
  assert.ok(n > 2000);
});

test('la cara queda dentro del cuerpo en los cuatro anchos', () => {
  for (const s of SHAPES) {
    const g = geometry(s.id);
    assert.ok(g.face.y > g.top + 20 && g.face.y < 182 - 30, `${s.id}: ojos fuera de lugar`);
    assert.ok(g.face.dx * 2 < g.chordAt(g.face.y) * 0.7, `${s.id}: ojos muy separados`);
    assert.ok(g.neckY > g.face.mouthY + 4 && g.neckY < 178, `${s.id}: collar fuera de lugar`);
  }
});

test('los anchos van de más angosto a más ancho', () => {
  const ws = SHAPES.map((s) => geometry(s.id).w);
  for (let i = 1; i < ws.length; i++) assert.ok(ws[i] > ws[i - 1]);
});

test('los cuerpos viejos caen en un ancho de mochi', () => {
  assert.equal(shapeOf('gotita').id, 'alto');
  assert.equal(shapeOf('gordito').id, 'ancho');
  assert.equal(shapeOf('redondo').id, 'redondo');
  assert.equal(shapeOf('no-existe').id, 'mochi');
});

test('las piezas de las recetas viejas siguen existiendo', () => {
  const oldEars = ['ninguna', 'gato', 'conejo', 'oso', 'perro', 'zorro', 'raton', 'oveja', 'unicornio', 'cerdito', 'koala', 'panda', 'alas', 'murcielago', 'lobo', 'dragon'];
  const oldHead = ['ninguno', 'mono', 'gorro', 'corona', 'flores', 'cachos', 'diadema', 'sombrero', 'audifonos', 'bandana', 'gorra', 'boina', 'bruja', 'monoCalavera', 'tiara', 'cresta', 'aureola', 'cuernos', 'flequillo', 'vaquero'];
  const oldNeck = ['ninguno', 'collar', 'pajarita', 'bufanda', 'panuelo', 'medallon', 'pinchos', 'choker', 'cadena', 'medalla', 'lei', 'capa', 'corbata'];
  const oldExtra = ['ninguno', 'lentes', 'gafasol', 'antifaz', 'pecas', 'lunar', 'curita', 'piercings', 'parche', 'lagrima', 'corpse', 'brillos', 'eyeblack'];
  for (const [old, list] of [[oldEars, EARS], [oldHead, HEAD_ACCESSORIES], [oldNeck, NECK_ACCESSORIES], [oldExtra, EXTRA_ACCESSORIES]]) {
    for (const id of old) assert.ok(ids(list).includes(id), `falta la pieza vieja "${id}"`);
  }
});

test('los estilos de partida solo usan piezas que existen', () => {
  const lists = { ears: EARS, eyes: EYES, mouth: MOUTHS, cheeks: CHEEKS, tail: TAILS, pattern: PATTERNS, headAcc: HEAD_ACCESSORIES, neckAcc: NECK_ACCESSORIES, extraAcc: EXTRA_ACCESSORIES };
  for (const p of PET_STYLES) {
    for (const [field, list] of Object.entries(lists)) {
      const v = p.recipe[field];
      if (v != null) assert.ok(ids(list).includes(v), `${p.label}: ${field}="${v}" no existe`);
    }
    assert.ok(!broken(mochiSvg(p.recipe, 'feliz')), `${p.label} sale roto`);
  }
});

test('con alas, cola larga y capa la mochi se achica para entrar entera', () => {
  const svg = mochiSvg({ body: 'ancho', ears: 'alas', tail: 'puas', neckAcc: 'capa' });
  const m = svg.match(/scale\(([\d.]+)\) translate\(-100 -186\)/);
  assert.ok(m && Number(m[1]) < 0.9, 'no se achicó');
  assert.ok(!/scale\([\d.]+\) translate\(-100 -186\)/.test(mochiSvg({ body: 'alto', ears: 'gato' })), 'una mochi chica no debería achicarse');
});

console.log(`\n${passed} pruebas pasaron`);
