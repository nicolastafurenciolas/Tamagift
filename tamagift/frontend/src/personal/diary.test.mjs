// Pruebas del diario de la mascota (personal/diary.js).
//   node src/personal/diary.test.mjs

import assert from 'node:assert/strict';
import { logDiary, writeEntry, closeDiary, todayEntry, diaryPages, diaryHasNew, emptyDiary, MAX_EVENTS_PER_DAY } from './diary.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.stack}`); process.exitCode = 1; }
}

const NAMES = { nombre: 'Ana', yo: 'Leo' };
const at = (d, h = 15) => new Date(2026, 10, d, h);
const sentences = (t) => t.split(/(?<=[.!?…)])\s+(?=[¡¿A-ZÁÉÍÓÚÑ(])/).length;

test('si llegó algo de quien regala, la entrada lo nombra (y va primero)', () => {
  const kinds = ['carta', 'nota', 'voz', 'paquete', 'answer', 'cofre'];
  for (const kind of kinds) {
    const e = writeEntry([{ type: 'comida', food: 'Pizza' }, { type: 'carta', kind, label: 'Un sofá' }], { day: '2026-11-04', names: NAMES });
    assert.ok(e.text.includes('Leo'), `${kind}: ${e.text}`);
    assert.equal(e.highlights[0].type, 'quienRegala');
  }
  const sit = writeEntry([{ type: 'situacion', id: 'lluvia' }], { day: '2026-11-04', names: NAMES });
  assert.ok(sit.text.includes('Leo'), sit.text);
  const soup = writeEntry([{ type: 'historia', storyId: 'resfriado', stepId: 'sopa', giver: true }], { day: '2026-11-04', names: NAMES });
  assert.ok(/Leo me mandó sopa/.test(soup.text), soup.text);
  const paq = writeEntry([{ type: 'carta', kind: 'paquete', label: 'Un sofá' }], { day: '2026-11-04', names: NAMES });
  assert.ok(/un sofá/.test(paq.text), paq.text);
  const many = writeEntry([{ type: 'carta', kind: 'carta' }, { type: 'carta', kind: 'voz' }, { type: 'carta', kind: 'paquete' }], { day: '2026-11-04', names: NAMES });
  assert.ok(/3/.test(many.text) && /Leo/.test(many.text), many.text);
});

test('corta, en primera persona y sin huecos', () => {
  const ev = [
    { type: 'carta', kind: 'carta' }, { type: 'nivel', game: 'golosinas', stars: 3 }, { type: 'comida', food: 'Sushi', fav: true },
    { type: 'suceso', id: 'bichito', label: 'Mariquita' }, { type: 'foto' }, { type: 'vida', kind: 'tararear', song: 'La nuestra' },
    { type: 'historia', storyId: 'gato', stepId: 'nombre', gato: 'Tofu', title: 'El gato del barrio' },
  ];
  const e = writeEntry(ev, { day: '2026-11-04', names: NAMES, weather: 'sol' });
  assert.ok(!/[{}]/.test(e.text), e.text);
  assert.ok(sentences(e.text) <= 6, `muy larga (${sentences(e.text)}): ${e.text}`);
  assert.ok(e.text.length <= 300, e.text);
  assert.ok(/Tofu/.test(e.text), 'la historia es lo más importante del día');
  assert.ok(e.highlights.length >= 3 && e.highlights.length <= 4);
  assert.equal(writeEntry([], { day: '2026-11-04' }), null, 'sin nada, sin entrada');
  assert.equal(writeEntry([{ type: 'raro' }], { day: '2026-11-04' }), null);
});

test('una entrada por día, fija al pasar el día; lo anotado se borra', () => {
  let d = emptyDiary();
  d = logDiary(d, { type: 'carta', kind: 'nota' }, { date: at(4) });
  d = logDiary(d, { type: 'comida', food: 'Pizza', fav: true }, { date: at(4, 18) });
  d = logDiary(d, { type: 'foto' }, { date: at(5) });
  const draft = todayEntry(d, { date: at(4), names: NAMES });
  assert.ok(draft.text.includes('Leo'));
  d = closeDiary(d, { date: at(5), names: NAMES });
  assert.deepEqual(Object.keys(d.entries), ['2026-11-04']);
  assert.deepEqual(Object.keys(d.logs), ['2026-11-05']);
  const fixed = d.entries['2026-11-04'].text;
  assert.equal(closeDiary(d, { date: at(5), names: NAMES }), d, 'cerrar dos veces no cambia nada');
  const pages = diaryPages(d, { date: at(5), names: NAMES });
  assert.equal(pages.length, 2);
  assert.equal(pages[0].draft, true);
  assert.equal(pages[1].text, fixed);
  assert.ok(diaryHasNew(d, null) && diaryHasNew(d, '2026-11-03') && !diaryHasNew(d, '2026-11-04'));
  // un día sin entrar: no hay página
  d = closeDiary(d, { date: at(9), names: NAMES });
  assert.deepEqual(Object.keys(d.entries).sort(), ['2026-11-04', '2026-11-05']);
});

test('variada: el mismo tipo de día dos semanas seguidas no se repite', () => {
  let d = emptyDiary();
  const texts = [];
  for (let day = 1; day <= 14; day++) {
    d = logDiary(d, { type: 'carta', kind: 'carta' }, { date: at(day) });
    d = logDiary(d, { type: 'comida', food: 'Pizza', fav: true }, { date: at(day) });
    d = closeDiary(d, { date: at(day + 1), names: NAMES, weatherOf: () => 'sol', seed: 'slug' });
    texts.push(d.entries[`2026-11-${String(day).padStart(2, '0')}`]);
  }
  for (let i = 1; i < texts.length; i++) {
    assert.notEqual(texts[i].text, texts[i - 1].text, `día ${i + 1} igual al anterior`);
    // ni la misma apertura, ni lo de quien regala, ni el mismo cierre dos días seguidos
    const shared = texts[i].tpl.filter((x) => texts[i - 1].tpl.includes(x));
    assert.deepEqual(shared, [], `día ${i + 1} repite ${shared}`);
  }
  assert.ok(new Set(texts.map((e) => e.text)).size >= 10, 'poca variedad');
  assert.ok(texts.every((e) => e.text.includes('Leo')));
});

test('no se llena: tope de cosas anotadas por día y eventos desconocidos fuera', () => {
  let d = emptyDiary();
  for (let i = 0; i < MAX_EVENTS_PER_DAY + 10; i++) d = logDiary(d, { type: 'suceso', id: 'moneda' }, { date: at(4) });
  assert.equal(d.logs['2026-11-04'].length, MAX_EVENTS_PER_DAY);
  assert.equal(logDiary(d, { type: 'nada' }, { date: at(4) }), d);
  const e = todayEntry(d, { date: at(4), names: NAMES });
  assert.equal((e.text.match(/moneda/g) || []).length, 1, 'diez monedas, una línea');
});

test('serializable', () => {
  let d = emptyDiary();
  d = logDiary(d, { type: 'historia', storyId: 'planta', stepId: 'flor', title: 'La semillita' }, { date: at(4) });
  d = closeDiary(d, { date: at(5), names: NAMES });
  const copy = JSON.parse(JSON.stringify(d));
  assert.deepEqual(copy, d);
  assert.deepEqual(diaryPages(copy, { date: at(5), names: NAMES }), diaryPages(d, { date: at(5), names: NAMES }));
});

console.log(`\n${passed} pruebas pasaron`);
