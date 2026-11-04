// Pruebas de los packs por gustos (personal/packs.js) y de que su arte exista.
//   node src/personal/packs.test.mjs

import assert from 'node:assert/strict';
import {
  PACKS, PACK_IDS, PACK_PRICE, findPack, cleanPackIds, activePacks, withPack, withoutPack, packItems, packLines,
  packLikeOptions, packScores, suggestPacks, suggestReason, themedFoodName, packOfDecor, packOfWear, giftLabel,
} from './packs.js';
import { FOODS } from '../foodCatalog.js';
import { DECOR_PACKS } from '../art/room/packs.js';
import { PACK_WEAR } from '../art/mochi/wardrobe/packs.js';
import { onSale } from '../seasons.js';
import { DECOR_DEFS } from '../art/room/decor.js';
import { WARDROBE } from '../art/mochi/wardrobe/index.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
}

test('ocho packs completos, con nombre, frase de venta e ícono', () => {
  assert.deepEqual(PACK_IDS, ['anime', 'kpop', 'gatitos', 'cafe', 'plantas', 'astrologia', 'futbol', 'terror']);
  for (const p of PACKS) {
    assert.ok(p.name && p.pitch && p.icon && p.hero && p.color, p.id);
    assert.ok(p.pitch.length <= 50, `frase corta: ${p.id}`);
    assert.equal(p.decor.length, 3, p.id);
    assert.equal(p.wear.length, 2, p.id);
    assert.ok(p.foods.length >= 1 && p.foods.length <= 2, p.id);
    assert.ok(p.lines.length >= 4 && p.lines.length <= 6, p.id);
    assert.ok(p.decor.includes(p.hero), `el héroe es uno de sus adornos: ${p.id}`);
  }
});

test('cada adorno y cada prenda existe en el arte, con su pack, y no se vende suelto', () => {
  for (const p of PACKS) {
    for (const id of p.decor) {
      const d = DECOR_PACKS.find((x) => x.id === id);
      assert.ok(d, `adorno ${id}`);
      assert.equal(d.pack, p.id);
      assert.equal(onSale(d, new Date(2026, 9, 15)), false, `${id} fuera de la tienda (aun en Halloween)`);
      const svg = d.draw();
      assert.ok(svg.length > 400 && !/NaN|undefined/.test(svg), `dibujo de ${id}`);
    }
    for (const w of p.wear) {
      const it = PACK_WEAR.find((x) => x.slot === w.slot && x.id === w.id);
      assert.ok(it, `prenda ${w.slot}:${w.id}`);
      assert.equal(it.pack, p.id);
      assert.equal(onSale(it), false);
    }
  }
  // y no sobra arte sin pack
  assert.equal(DECOR_PACKS.length, 24);
  assert.equal(PACK_WEAR.length, 16);
});

test('ids únicos (no chocan con los de siempre ni entre packs)', () => {
  const d = DECOR_PACKS.map((x) => x.id);
  assert.equal(new Set(d).size, d.length);
  const w = PACK_WEAR.map((x) => `${x.slot}:${x.id}`);
  assert.equal(new Set(w).size, w.length);
  const others = DECOR_DEFS.filter((x) => x.season !== 'pack').map((x) => x.id);
  for (const id of d) assert.ok(!others.includes(id), `adorno ${id} ya existe`);
  const wOthers = WARDROBE.filter((x) => x.season !== 'pack').map((x) => x.id);
  for (const x of PACK_WEAR) assert.ok(!wOthers.includes(x.id), `prenda ${x.id} ya existe`);
  // las prendas ya están en el vestidor (index.js)
  for (const x of PACK_WEAR) assert.ok(WARDROBE.some((y) => y.slot === x.slot && y.id === x.id), `${x.id} en WARDROBE`);
});

test('las comidas temáticas salen del catálogo existente', () => {
  for (const p of PACKS) for (const f of p.foods) assert.ok(FOODS.some((x) => x.id === f.base), `${p.id}: ${f.base}`);
  assert.equal(themedFoodName('ramen', ['anime']), 'Ramen como en el anime');
  assert.equal(themedFoodName('ramen', ['cafe']), null);
  // si dos packs nombran la misma comida, gana el primero activado
  assert.equal(themedFoodName('leche', ['cafe', 'gatitos']), 'Latte con corazón');
  assert.equal(themedFoodName('leche', ['gatitos', 'cafe']), 'Lechita del gatito');
});

test('frases: con {nombre}, sin género de quien recibe', () => {
  const GENDER = /\b(cansad[ao]|despiert[ao]|sol[ao]|list[ao]|campe[oó]n(a)?|juntos|juntas|amig[ao]s?|preciosa|precioso|la mejor|el mejor)\b/i;
  for (const p of PACKS) {
    assert.ok(p.lines.some((t) => t.includes('{nombre}')), `${p.id} nombra a quien recibe`);
    for (const t of p.lines) assert.ok(!GENDER.test(t), `${p.id}: «${t}»`);
    assert.ok(!GENDER.test(p.pitch), p.pitch);
  }
});

test('cleanPackIds / activePacks: válidos, sin repetir, en orden', () => {
  assert.deepEqual(cleanPackIds(['cafe', 'x', 'cafe', 'anime']), ['cafe', 'anime']);
  assert.deepEqual(cleanPackIds(null), []);
  assert.deepEqual(activePacks({ packs: ['terror', 'nada'] }), ['terror']);
  assert.deepEqual(activePacks({}), []);
});

test('withPack / withoutPack no pisan lo demás de la ficha', () => {
  const prof = { nickname: 'Cielo', likes: { color: 'Lila' }, coupons: [{ id: 'c1' }], packs: ['cafe'] };
  const a = withPack(prof, 'gatitos');
  assert.deepEqual(a.packs, ['cafe', 'gatitos']);
  assert.equal(a.nickname, 'Cielo');
  assert.deepEqual(a.coupons, prof.coupons);
  assert.deepEqual(prof.packs, ['cafe'], 'no muta la ficha');
  assert.deepEqual(withPack(a, 'gatitos').packs, ['cafe', 'gatitos'], 'activar dos veces no duplica');
  assert.equal(withPack(prof, 'inventado'), prof);
  assert.deepEqual(withoutPack(a, 'cafe').packs, ['gatitos']);
  assert.deepEqual(withPack({}, 'anime').packs, ['anime']);
});

test('packItems: lo que desbloquean, gratis', () => {
  const it = packItems(['cafe', 'plantas', 'cafe']);
  assert.equal(it.decor.length, 6);
  assert.equal(it.wear.length, 4);
  assert.equal(it.foods.length, 4);
  assert.equal(it.price, PACK_PRICE);
  assert.equal(PACK_PRICE, 0);
  assert.deepEqual(it.decor[0], { kind: 'decor', id: 'espresso', pack: 'cafe' });
  assert.deepEqual(it.wear[0], { kind: 'ropa', slot: 'ropa', id: 'delantalBarista', pack: 'cafe' });
  assert.deepEqual(packItems([]), { decor: [], wear: [], foods: [], price: 0 });
  assert.equal(packOfDecor('monstera'), 'plantas');
  assert.equal(packOfDecor('osito'), null);
  assert.equal(packOfWear('mano', 'balonMano'), 'futbol');
  assert.equal(packOfWear('cabeza', 'balonMano'), null);
});

test('packLines y packLikeOptions (forma de las líneas de gusto de life.js)', () => {
  const raw = packLines(['terror']);
  assert.equal(raw.length, findPack('terror').lines.length);
  assert.ok(raw[0].text.includes('{nombre}'));
  const named = packLines(['terror'], { nombre: 'Cielo' });
  assert.ok(named[0].text.startsWith('Cielo,'));
  const opts = packLikeOptions({ packs: ['futbol', 'anime'] });
  assert.equal(opts.length, findPack('futbol').lines.length + findPack('anime').lines.length);
  assert.deepEqual(Object.keys(opts[0]).sort(), ['i', 'id', 'key', 'line', 'pack', 'v']);
  assert.equal(opts[0].id, 'pack:futbol');
  assert.equal(opts[0].key, 'pack:futbol:0');
  assert.equal(new Set(opts.map((o) => o.key)).size, opts.length);
  assert.deepEqual(packLikeOptions({}), []);
});

test('sugerencia: videojuegos o un anime → anime', () => {
  assert.equal(suggestPacks({ likes: { hobby: 'Jugar videojuegos' } })[0], 'anime');
  assert.equal(suggestPacks({ likes: { serie: 'Un anime' } })[0], 'anime');
  assert.equal(suggestPacks({ likes: { serie: 'Studio Ghibli' } })[0], 'anime');
  assert.equal(suggestReason({ likes: { serie: 'Studio Ghibli' } }, 'anime'), 'Studio Ghibli');
});

test('sugerencia: cada gusto lleva a su pack', () => {
  const cases = [
    [{ musica: 'K-pop' }, 'kpop'], [{ musica: 'BTS' }, 'kpop'], [{ serie: 'Un k-drama' }, 'kpop'],
    [{ animal: 'Gatos' }, 'gatitos'], [{ risa: 'Los videos de gatitos' }, 'gatitos'],
    [{ bebida: 'Café' }, 'cafe'], [{ lugar: 'Un café tranquilo' }, 'cafe'],
    [{ hobby: 'Cuidar sus plantas' }, 'plantas'], [{ flor: 'Girasoles', lugar: 'La montaña' }, 'plantas'],
    [{ sueno: 'Que le lean el tarot' }, 'astrologia'], [{ mania: 'Hablar de su signo, es Leo' }, 'astrologia'],
    [{ hobby: 'Ver fútbol' }, 'futbol'], [{ serie: 'Los partidos de la Selección' }, 'futbol'],
    [{ serie: 'Merlina' }, 'terror'], [{ risa: 'Las pelis de terror malas' }, 'terror'],
  ];
  for (const [likes, want] of cases) assert.equal(suggestPacks({ likes })[0], want, JSON.stringify(likes));
});

test('sugerencia: el miedo no cuenta, sin datos va el orden por defecto, y son dos', () => {
  assert.notEqual(suggestPacks({ likes: { miedo: 'Las películas de terror' } })[0], 'terror');
  assert.deepEqual(suggestPacks({}), ['gatitos', 'cafe']);
  assert.deepEqual(suggestPacks(null), ['gatitos', 'cafe']);
  const two = suggestPacks({ likes: { hobby: 'Jugar videojuegos', bebida: 'Café' } });
  assert.deepEqual([...two].sort(), ['anime', 'cafe']);
  // "leo" no se encuentra dentro de "leer"
  assert.equal(packScores({ likes: { hobby: 'Leer' } }).astrologia, 0);
});

test('sugerencia: lo ya activado no se vuelve a sugerir', () => {
  const s = suggestPacks({ likes: { hobby: 'Jugar videojuegos' }, packs: ['anime'] });
  assert.ok(!s.includes('anime'));
  assert.equal(suggestPacks({ likes: { hobby: 'Jugar videojuegos' }, packs: ['anime'] }, 2, { keepActive: true })[0], 'anime');
  assert.equal(suggestPacks({}, 8).length, 8);
});

test('etiqueta de la tienda', () => {
  assert.equal(giftLabel('Nico'), 'De Nico para ti');
  assert.equal(giftLabel(''), 'Un regalo para ti');
});

console.log(`\n${passed} pruebas pasaron${process.exitCode ? ' (con fallas)' : ''}`);
