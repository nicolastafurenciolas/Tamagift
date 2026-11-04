// Pruebas de "la mascota vive sus gustos" (personal/life.js).
//   node src/personal/life.test.mjs

import assert from 'node:assert/strict';
import { nextLifeScene, makeLifeScene, lifeKindsAvailable, emptyLife, inSentence, LIFE_PER_DAY, LIFE_GAP, LIFE_FIRST } from './life.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.stack}`); process.exitCode = 1; }
}

const MIN = 60 * 1000;
const PET = {
  name: 'Mochi',
  songs: [{ title: 'Nuestra canción' }, { title: 'La de la playa' }],
  photos: [
    { url: 'p0', used_for: 'poster' }, { url: 'p1', used_for: 'poster' }, { url: 'p2', used_for: 'puzzle' }, { url: null, used_for: 'poster' },
  ],
  food_preferences: [
    { food_name: 'Pizza', preference: 'gusta' }, { food_name: 'Sushi', preference: 'gusta', image: 'x.png' }, { food_name: 'Brócoli', preference: 'no_gusta' },
  ],
};
const PROFILE = { likes: { flor: 'Girasoles', serie: 'Friends', postre: 'Helado', animal: 'Gatos' } };
const NAMES = { nombre: 'Ana', yo: 'Leo' };
const base = (date, extra = {}) => ({ date, now: date.getTime(), pet: PET, profile: PROFILE, names: NAMES, seed: 'slug1', ...extra });

// Simula un día abriendo el juego cada 5 minutos de 8 a 23.
function day(life, y, m, d, extra = {}) {
  const got = [];
  for (let t = new Date(y, m, d, 8, 0).getTime(); t < new Date(y, m, d, 23, 0).getTime(); t += 5 * MIN) {
    const r = nextLifeScene(life, base(new Date(t), extra));
    if (r) { life = r.life; got.push({ ...r.scene, at: t }); }
  }
  return { life, got };
}

test('como mucho LIFE_PER_DAY por día (+1 sueño), separadas por LIFE_GAP, sin tipo ni texto repetido', () => {
  let life = emptyLife();
  for (let d = 1; d <= 12; d++) {
    const r = day(life, 2026, 10, d);
    life = r.life;
    const awake = r.got.filter((s) => s.kind !== 'sueno');
    assert.ok(awake.length <= LIFE_PER_DAY, `día ${d}: ${awake.length}`);
    assert.ok(r.got.length - awake.length <= 1, 'más de un sueño');
    assert.ok(r.got.length >= 2, `día ${d}: muy poca vida (${r.got.length})`);
    for (let i = 1; i < r.got.length; i++) assert.ok(r.got[i].at - r.got[i - 1].at >= LIFE_GAP);
    assert.equal(new Set(r.got.map((s) => s.kind)).size, r.got.length, 'tipo repetido en el día');
    assert.equal(new Set(r.got.map((s) => s.text)).size, r.got.length, 'texto repetido en el día');
    for (const s of r.got) {
      assert.ok(!/[{}]/.test(s.text), `hueco sin llenar: ${s.text}`);
      assert.ok(s.anim && s.log && s.log.type === 'vida');
    }
  }
});

test('variedad entre días: rotan canciones, fotos, comidas y gustos; las frases no se repiten seguidas', () => {
  let life = emptyLife();
  const all = [];
  for (let d = 1; d <= 20; d++) { const r = day(life, 2026, 10, d); life = r.life; all.push(...r.got); }
  const kinds = new Set(all.map((s) => s.kind));
  for (const k of ['tararear', 'poster', 'cocinar', 'gusto']) assert.ok(kinds.has(k), `nunca salió ${k}`);
  const songs = new Set(all.filter((s) => s.kind === 'tararear').map((s) => s.songIndex));
  assert.deepEqual([...songs].sort(), [0, 1]);
  const foods = new Set(all.filter((s) => s.kind === 'cocinar').map((s) => s.food.name));
  assert.deepEqual([...foods].sort(), ['Pizza', 'Sushi']);
  const posters = new Set(all.filter((s) => s.kind === 'poster').map((s) => s.photoIndex));
  assert.deepEqual([...posters].sort(), [0, 1], 'solo fotos de póster con url');
  const likes = new Set(all.filter((s) => s.kind === 'gusto').map((s) => s.likeId));
  assert.ok(likes.size >= 3, `pocos gustos: ${[...likes]}`);
  // la misma frase no sale dos veces seguidas de su tipo
  const byKind = {};
  for (const s of all) (byKind[s.kind] = byKind[s.kind] || []).push(s.text);
  for (const [k, list] of Object.entries(byKind)) for (let i = 1; i < list.length; i++) assert.notEqual(list[i], list[i - 1], `${k} repitió: ${list[i]}`);
  // de la comida jamás sale lo que no le gusta
  assert.ok(!all.some((s) => s.food && s.food.name === 'Brócoli'));
});

test('dormida solo sueña, con una foto; de noche sueña una vez', () => {
  const night = new Date(2026, 10, 4, 23, 30);
  assert.deepEqual(lifeKindsAvailable(base(night, { sleeping: true })), ['sueno']);
  const r = nextLifeScene(null, base(night, { sleeping: true }));
  assert.equal(r.scene.kind, 'sueno');
  assert.equal(r.scene.anim, 'sonar');
  assert.ok(PET.photos[r.scene.photoIndex].url);
  const r2 = nextLifeScene(r.life, base(new Date(night.getTime() + LIFE_GAP + 1), { sleeping: true }));
  assert.equal(r2, null, 'un sueño por noche');
  assert.equal(nextLifeScene(null, base(new Date(2026, 10, 4, 12), { sleeping: true, pet: { ...PET, photos: [] } })), null);
});

test('cocinar ofrece su comida y tararear ofrece ponerla', () => {
  const c = makeLifeScene('cocinar', base(new Date(2026, 10, 4, 13)));
  assert.equal(c.scene.offer.action, 'eat');
  assert.ok(['Pizza', 'Sushi'].includes(c.scene.food.name));
  assert.ok(/pizza|sushi/.test(c.scene.text), c.scene.text);
  const t = makeLifeScene('tararear', base(new Date(2026, 10, 4, 13)));
  assert.equal(t.scene.offer.action, 'playSong');
  assert.ok(/«(Nuestra canción|La de la playa)»/.test(t.scene.text), t.scene.text);
  assert.equal(t.scene.fromGiver, true);
});

test('lluvia y pena eligen frases que van con el momento', () => {
  const rain = makeLifeScene('cocinar', base(new Date(2026, 10, 4, 13), { weather: 'lluvia' }));
  assert.ok(/lluvia/i.test(rain.scene.text), rain.scene.text);
  const sad = makeLifeScene('tararear', base(new Date(2026, 10, 4, 13), { mood: 'triste' }));
  assert.ok(/sonrisa/.test(sad.scene.text), sad.scene.text);
});

test('lo ya dicho hoy no se repite (said), y "gusto" se puede bloquear', () => {
  const date = new Date(2026, 10, 4, 12);
  const made = makeLifeScene('gusto', base(date));
  const again = makeLifeScene('gusto', base(date, { said: [made.scene.text] }));
  assert.ok(!again || again.scene.text !== made.scene.text);
  assert.ok(!lifeKindsAvailable(base(date, { said: ['gusto'] })).includes('gusto'));
});

test('ocupado, recién abierto o sin nada que mostrar: no toca', () => {
  const date = new Date(2026, 10, 4, 12);
  assert.equal(nextLifeScene(null, base(date, { busy: true })), null);
  assert.equal(nextLifeScene(null, base(date, { sessionStart: date.getTime() - 10 * 1000 })), null);
  assert.ok(nextLifeScene(null, base(date, { sessionStart: date.getTime() - LIFE_FIRST })));
  assert.equal(nextLifeScene(null, base(date, { pet: { photos: [], songs: [], food_preferences: [] }, profile: {} })), null);
  assert.equal(nextLifeScene(null, base(date, { mood: 'dormido' })), null);
});

test('posters colgados: solo los que están en la pared', () => {
  const s = makeLifeScene('poster', base(new Date(2026, 10, 4, 12), { hungPhotos: [1] }));
  assert.equal(s.scene.photoIndex, 1);
  assert.equal(makeLifeScene('poster', base(new Date(2026, 10, 4, 12), { hungPhotos: [] })), null);
});

test('serializable y determinista: mismo estado + misma semilla = misma escena', () => {
  let life = emptyLife();
  for (let d = 1; d <= 3; d++) life = day(life, 2026, 10, d).life;
  const copy = JSON.parse(JSON.stringify(life));
  const date = new Date(2026, 10, 4, 15);
  const a = nextLifeScene(life, base(date));
  const b = nextLifeScene(copy, base(date));
  assert.deepEqual(a, b);
  assert.deepEqual(JSON.parse(JSON.stringify(a.life)), a.life);
  // otra semilla, otro día posible
  const c = nextLifeScene(copy, base(date, { seed: 'otra' }));
  assert.ok(c);
});

test('los gustos van dentro de la frase con minúscula, salvo series y artistas', () => {
  assert.equal(inSentence('Girasoles', 'flor'), 'girasoles');
  assert.equal(inSentence('Friends', 'serie'), 'Friends');
  assert.equal(inSentence('Taylor Swift', 'musica'), 'Taylor Swift');
  assert.equal(inSentence('K-pop', 'musica'), 'K-pop');
  assert.equal(inSentence('ABBA', 'hobby'), 'ABBA');
  const s = makeLifeScene('gusto', base(new Date(2026, 10, 4, 12), { profile: { likes: { flor: 'Girasoles' } } }));
  assert.ok(/girasoles/.test(s.scene.text), s.scene.text);
});

console.log(`\n${passed} pruebas pasaron`);
