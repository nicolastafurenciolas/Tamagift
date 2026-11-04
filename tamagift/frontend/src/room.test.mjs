// Pruebas del cuarto (paredes, pisos, muebles, decoración).
//   node src/room.test.mjs
//
// Sin navegador: todo el arte del cuarto se arma como texto. Se revisa
// que ningún diseño, color o pintura produzca coordenadas rotas, que los
// ids viejos de las partidas guardadas se sigan entendiendo y que los
// tamaños que usa el cuarto calcen con el dibujo.

import assert from 'node:assert/strict';
import { FOOT } from './art/room/draw.js';
import { WALLS, WALL_ALIASES, parseWall, wallSvg, wallSwatchSvg } from './art/room/walls.js';
import { FLOORS, FLOOR_ALIASES, parseFloor, floorSvg, floorSwatchSvg } from './art/room/floors.js';
import { FURNITURE_DEFS, FURNITURE_PAINTS, FURNITURE_CATEGORIES, FURNITURE_SCALE, findPaint, POSTER } from './art/room/furniture/index.js';
import { DECOR_DEFS } from './art/room/decor.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

const broken = (svg) => /NaN|undefined|null|Infinity/.test(svg);
const balanced = (svg) => (svg.match(/<g[\s>]/g) || []).length === (svg.match(/<\/g>/g) || []).length;
const viewBox = (svg) => (svg.match(/viewBox="([^"]+)"/) || [])[1];
const unique = (list) => new Set(list).size === list.length;

test('cada diseño de pared, en cada color, da un SVG sano', () => {
  for (const p of WALLS) {
    assert.ok(p.tints.length >= 1, `${p.id} sin colores`);
    for (const t of p.tints) {
      for (const svg of [wallSvg(`${p.id}.${t.id}`, 640, 300), wallSwatchSvg(`${p.id}.${t.id}`, 48)]) {
        assert.ok(!broken(svg), `${p.id}.${t.id} roto`);
        assert.ok(balanced(svg), `${p.id}.${t.id} con <g> sin cerrar`);
      }
    }
  }
});

test('cada diseño de piso, en cada color, da un SVG sano', () => {
  for (const p of FLOORS) {
    assert.ok(p.tints.length >= 1, `${p.id} sin colores`);
    for (const t of p.tints) {
      for (const svg of [floorSvg(`${p.id}.${t.id}`, 640, 120), floorSwatchSvg(`${p.id}.${t.id}`, 48)]) {
        assert.ok(!broken(svg), `${p.id}.${t.id} roto`);
        assert.ok(balanced(svg), `${p.id}.${t.id} con <g> sin cerrar`);
      }
    }
  }
});

test('ids de paredes, pisos y sus colores sin repetir', () => {
  assert.ok(unique(WALLS.map((p) => p.id)));
  assert.ok(unique(FLOORS.map((p) => p.id)));
  for (const p of [...WALLS, ...FLOORS]) assert.ok(unique(p.tints.map((t) => t.id)), `${p.id} repite un color`);
});

test('los ids viejos de pared y piso apuntan a algo que existe', () => {
  for (const [old, v] of Object.entries(WALL_ALIASES)) assert.equal(parseWall(old).value, v, `pared "${old}"`);
  for (const [old, v] of Object.entries(FLOOR_ALIASES)) assert.equal(parseFloor(old).value, v, `piso "${old}"`);
});

test('un valor desconocido o vacío cae en algo válido', () => {
  for (const v of [undefined, null, '', 'nada', 'rayas.nada']) {
    assert.ok(WALLS.some((p) => p.id === parseWall(v).pattern.id));
    assert.ok(FLOORS.some((p) => p.id === parseFloor(v).pattern.id));
  }
  assert.equal(parseWall('rayas.nada').pattern.id, 'rayas', 'un color que no existe conserva el diseño');
});

test('cada mueble, con cada pintura, da un SVG sano', () => {
  for (const f of FURNITURE_DEFS) {
    for (const paint of FURNITURE_PAINTS) {
      const svg = f.svg(paint.id);
      assert.ok(!broken(svg), `${f.id} / ${paint.id} roto`);
      assert.ok(balanced(svg), `${f.id} / ${paint.id} con <g> sin cerrar`);
    }
  }
});

test('muebles: ids únicos, categoría válida y al menos 3 por categoría', () => {
  assert.ok(unique(FURNITURE_DEFS.map((f) => f.id)));
  const cats = new Set(FURNITURE_CATEGORIES.map((c) => c.id));
  for (const f of FURNITURE_DEFS) assert.ok(cats.has(f.cat), `${f.id} en categoría "${f.cat}"`);
  for (const c of FURNITURE_CATEGORIES) assert.ok(FURNITURE_DEFS.filter((f) => f.cat === c.id).length >= 3, `pocos en ${c.id}`);
});

test('el tamaño en el cuarto calza con el dibujo (escala y margen de abajo)', () => {
  for (const f of FURNITURE_DEFS) {
    assert.equal(viewBox(f.svg('natural')), `0 0 ${f.vw} ${f.vh}`, f.id);
    assert.equal(f.w, Math.round(f.vw * FURNITURE_SCALE), `${f.id} ancho`);
    assert.equal(f.h, Math.round(f.vh * FURNITURE_SCALE), `${f.id} alto`);
    assert.equal(f.foot, FOOT * FURNITURE_SCALE, `${f.id} margen`);
    assert.ok(['pared', 'piso', 'suelo'].includes(f.layer), `${f.id} capa "${f.layer}"`);
  }
  assert.equal(viewBox(POSTER.svg('natural')), `0 0 ${POSTER.vw} ${POSTER.vh}`);
  const ph = POSTER.photo;
  assert.ok(ph.x >= 0 && ph.y >= 0 && ph.x + ph.w <= POSTER.vw && ph.y + ph.h <= POSTER.vh, 'la foto del póster cae dentro del marco');
});

test('pinturas: ids únicos, todas con madera, tela y detalle', () => {
  assert.ok(unique(FURNITURE_PAINTS.map((p) => p.id)));
  for (const p of FURNITURE_PAINTS) for (const k of ['wood', 'cloth', 'accent']) assert.match(p[k], /^#[0-9A-Fa-f]{6}$/, `${p.id}.${k}`);
  assert.equal(findPaint('no-existe').id, FURNITURE_PAINTS[0].id, 'una pintura desconocida usa la primera');
});

test('decoración: SVG sano, ids únicos y lugar válido', () => {
  assert.ok(unique(DECOR_DEFS.map((d) => d.id)));
  for (const d of DECOR_DEFS) {
    const svg = d.svg();
    assert.ok(!broken(svg), `${d.id} roto`);
    assert.ok(balanced(svg), `${d.id} con <g> sin cerrar`);
    assert.equal(viewBox(svg), `0 0 ${d.w} ${d.h}`, `${d.id} viewBox`);
    assert.equal(d.foot, FOOT, `${d.id} margen`);
    assert.ok(['piso', 'sobre'].includes(d.place), `${d.id} lugar "${d.place}"`);
  }
});

console.log(`\n${passed} pruebas OK`);
