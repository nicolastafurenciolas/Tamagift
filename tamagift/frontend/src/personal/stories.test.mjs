// Pruebas de visitantes y sucesos de varios días (personal/stories.js).
//   node src/personal/stories.test.mjs

import assert from 'node:assert/strict';
import {
  storyToday, resolveStory, giverHelp, giverRequest, storyStatus, emptyStories,
  STORIES, MAX_CHOICES, REST_DAYS,
} from './stories.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.stack}`); process.exitCode = 1; }
}

const PET = { name: 'Mochi', phrases: [{ category: 'positiva', text: 'Eres lo mejor que me pasó' }], food_preferences: [{ food_name: 'Pizza', preference: 'gusta' }] };
const PROFILE = { likes: { flor: 'Tulipanes', animal: 'Gatos', postre: 'Cheesecake' } };
const ctxOf = (d, extra = {}) => ({ date: new Date(2026, 10, d, 15), pet: PET, profile: PROFILE, names: { nombre: 'Ana', yo: 'Leo' }, seed: 'slug', weather: d % 9 === 0 ? 'lluvia' : 'sol', ...extra });

// Juega N días: cada día pide lo que toca, lo muestra dos veces (como si
// abriera el juego otra vez) y lo resuelve con la elección `pick`.
function play(days, { pick = 0, extra = () => ({}), onBeat = () => {}, from = 1, st = emptyStories() } = {}) {
  const log = [];
  for (let d = from; d < from + days; d++) {
    const ctx = ctxOf(d, extra(d));
    const r = storyToday(st, ctx);
    st = JSON.parse(JSON.stringify(r.stories));          // como lo guarda gameState
    if (!r.beat) { log.push({ d, beat: null }); continue; }
    const again = storyToday(st, ctx);                    // abre otra vez el mismo día
    assert.deepEqual(again.beat, r.beat, 'el mismo día, el mismo paso');
    onBeat(r.beat, d, st);
    const c = r.beat.choices[Math.min(pick, r.beat.choices.length - 1)];
    const res = resolveStory(st, c && c.id, ctx);
    if (res) st = JSON.parse(JSON.stringify(res.stories));
    log.push({ d, beat: r.beat, res: res && res.result });
    // después de resolver, hoy no toca nada más
    const after = storyToday(st, ctx);
    if (res && res.result.done) assert.equal(after.beat, null, 'dos pasos el mismo día');
  }
  return { st, log };
}

test('la primera semana: nada el primer día, un paso por día como mucho, una historia a la vez', () => {
  const { log } = play(40);
  assert.equal(log[0].beat, null, 'el primer día no empieza nada');
  const beats = log.filter((x) => x.beat);
  assert.ok(beats.length >= 20, `muy pocas cosas en 40 días: ${beats.length}`);
  // una sola historia a la vez: entre el primer y último paso de una, no aparece otra
  const spans = {};
  beats.forEach((x) => { const k = `${x.beat.storyId}:${x.beat.key.split(':').pop()}`; spans[k] = spans[k] || [x.d, x.d]; spans[k][1] = x.d; });
  const list = Object.entries(spans).sort((a, b) => a[1][0] - b[1][0]);
  for (let i = 1; i < list.length; i++) {
    const [prev, [, end]] = list[i - 1];
    const [cur, [start]] = list[i];
    if (cur.startsWith('cumple') || prev.startsWith('cumple')) continue;  // el cumple pausa, ver abajo
    assert.ok(start > end, `${cur} empezó antes de que terminara ${prev}`);
    assert.ok(start - end > REST_DAYS, `sin día tranquilo entre ${prev} y ${cur}`);
  }
});

test('los personajes se presentan antes de volver, y todo termina', () => {
  const { st, log } = play(70);
  const order = log.filter((x) => x.beat).map((x) => x.beat.storyId);
  const first = (id) => order.indexOf(id);
  assert.ok(first('vecinita') < first('paraguas') || first('paraguas') < 0);
  assert.ok(first('cartero') < first('carta'));
  assert.ok(first('gato') < first('carta'));
  assert.ok(Math.min(first('vecinita'), first('cartero')) < first('planta'));
  const done = storyStatus(st).done;
  for (const id of ['vecinita', 'cartero', 'gato', 'planta', 'resfriado', 'cumple', 'carta']) assert.ok(done.includes(id), `no terminó ${id}`);
  assert.ok(STORIES.length >= 6);
});

test('cada paso: máximo 2 botones, textos sin huecos y con la ficha', () => {
  const seen = [];
  play(70, { onBeat: (b) => seen.push(b), pick: 1 });
  for (const b of seen) {
    assert.ok(b.choices.length <= MAX_CHOICES, `${b.key}: ${b.choices.length} botones`);
    assert.ok(!/[{}]/.test(b.text), `hueco: ${b.text}`);
    b.choices.forEach((c) => assert.ok(!/[{}]/.test(c.label), c.label));
    assert.ok(b.text.length < 220, `muy largo: ${b.text}`);
  }
  const all = seen.map((b) => b.text).join(' ');
  assert.ok(/tulipanes/i.test(all), 'usa su flor');
  assert.ok(/gatos|como los que tanto te gustan/i.test(all), 'usa su animal');
  assert.ok(/cheesecake/i.test(all), 'usa su postre');
  assert.ok(/Leo/.test(all) && /Ana/.test(all), 'nombra a los dos');
  // la planta crece paso a paso y el gato pasa de tímido a amigo
  const stages = seen.filter((b) => b.prop && b.prop.id === 'planta').map((b) => b.prop.stage);
  assert.deepEqual(stages, [0, 1, 2, 3]);
  const poses = seen.filter((b) => b.storyId === 'gato').map((b) => b.visitors[0].pose);
  assert.deepEqual(poses, ['timido', 'curioso', 'curioso', 'amigo']);
  // la carta perdida trae una frase de quien regala
  const carta = seen.find((b) => b.storyId === 'carta' && b.stepId === 'aparece');
  assert.equal(carta.letter.text, 'Eres lo mejor que me pasó');
});

test('el gato toma el nombre elegido y se recuerda en las historias que siguen', () => {
  let name = null;
  const { st, log } = play(40, { pick: 1, onBeat: (b) => { if (b.stepId === 'nombre') name = b.choices[1].label; } });
  assert.ok(name);
  assert.equal(st.flags.gatoNombre, name);
  assert.equal(st.flags.gatoAmigo, true);
  const later = log.filter((x) => x.beat && x.beat.storyId === 'gato' && x.beat.stepId !== 'asoma' && x.beat.stepId !== 'nombre');
  assert.ok(later.every((x) => x.beat.text.includes(name)), 'usa su nombre');
});

// Lleva el juego hasta el paso que espera a quien regala.
function untilSoup() {
  let st = emptyStories();
  for (let d = 1; d < 80; d++) {
    const ctx = ctxOf(d);
    const r = storyToday(st, ctx);
    st = r.stories;
    if (!r.beat) continue;
    if (r.beat.giver === 'sopa') return { st, d, beat: r.beat };
    st = resolveStory(st, r.beat.choices[0] && r.beat.choices[0].id, ctx).stories;
  }
  throw new Error('nunca llegó el resfriado');
}

test('resfriado: el paso de la sopa espera a quien regala (y el rincón lo puede ofrecer)', () => {
  let { st, d, beat } = untilSoup();
  assert.equal(beat.waiting, true);
  const ask = giverRequest(st, ctxOf(d));
  assert.equal(ask.kind, 'sopa');
  assert.deepEqual(ask.payload, { story: 'sopa' });
  assert.ok(/Mochi/.test(ask.note) && /Leo/.test(ask.note));
  // contarle a quien regala no avanza la historia
  const told = resolveStory(st, 'avisar', ctxOf(d));
  assert.equal(told.result.action, 'tellGiver');
  assert.equal(told.result.done, false);
  st = told.stories;
  assert.equal(storyToday(st, ctxOf(d)).beat.choices.length, 0, 'ya le contó: sin botón');
  // llega la sopa: se cura y lo cuenta
  const h = giverHelp(st, 'sopa', ctxOf(d));
  assert.equal(h.helped, true);
  assert.ok(/Leo me mandó sopa/.test(h.text));
  assert.equal(h.log.giver, true);
  st = h.stories;
  assert.equal(giverRequest(st, ctxOf(d)), null);
  assert.equal(giverHelp(st, 'sopa', ctxOf(d)).helped, false, 'dos sopas no cuentan');
  assert.equal(storyToday(st, ctxOf(d)).beat, null, 'hoy ya pasó lo suyo');
  const next = storyToday(st, ctxOf(d + 1)).beat;
  assert.equal(next.stepId, 'sano');
  assert.ok(/sopa de Leo/.test(next.text), next.text);
});

test('resfriado: si quien regala no manda nada, a los dos días se cura igual', () => {
  let { st, d } = untilSoup();
  assert.ok(storyToday(st, ctxOf(d + 1)).beat.waiting);
  const b = storyToday(st, ctxOf(d + 2)).beat;
  assert.equal(b.waiting, false);
  assert.equal(b.giver, null);
  assert.ok(/sopa/.test(b.text));
  st = resolveStory(storyToday(st, ctxOf(d + 2)).stories, 'ok', ctxOf(d + 2)).stories;
  assert.equal(storyToday(st, ctxOf(d + 3)).beat.stepId, 'sano');
});

test('el cumpleaños de la mascota pausa la historia en curso y después la retoma', () => {
  // la planta va por la mitad cuando llega la víspera del cumpleaños (12/11)
  let st = emptyStories();
  let pausedId = null;
  const extra = { petBirthday: '2025-11-12' };
  const days = [];
  for (let d = 1; d <= 25; d++) {
    const ctx = ctxOf(d, extra);
    const r = storyToday(st, ctx);
    st = r.stories;
    if (!r.beat) { days.push([d, null]); continue; }
    if (d === 11) pausedId = st.paused && st.paused.id;
    days.push([d, r.beat.storyId, r.beat.stepId]);
    const res = resolveStory(st, r.beat.choices[0] && r.beat.choices[0].id, ctx);
    if (res) st = res.stories;
  }
  const at = (d) => days.find((x) => x[0] === d);
  assert.deepEqual(at(11).slice(1), ['cumple', 'vispera']);
  assert.deepEqual(at(12).slice(1), ['cumple', 'fiesta']);
  assert.ok(pausedId, 'había una historia en curso');
  assert.equal(at(13)[1], pausedId, 'se retoma al otro día');
});

test('el día del cumpleaños mismo (sin víspera) va directo a la fiesta', () => {
  let st = { ...emptyStories(), firstDay: '2026-11-01' };
  const r = storyToday(st, ctxOf(12, { petBirthday: '11-12' }));
  assert.equal(r.beat.stepId, 'fiesta');
});

test('con muchas sorpresas de quien regala hoy no empieza otra historia (la que va sigue)', () => {
  const st0 = { ...emptyStories(), firstDay: '2026-11-01' };
  assert.equal(storyToday(st0, ctxOf(3, { bigToday: 2 })).beat, null);
  const r = storyToday(st0, ctxOf(3));
  assert.ok(r.beat);
  const st = resolveStory(r.stories, r.beat.choices[0].id, ctxOf(3)).stories;
  assert.ok(storyToday(st, ctxOf(4, { bigToday: 2 })).beat, 'la que estaba sigue');
  assert.equal(storyToday(st, ctxOf(4, { busy: true })).beat, null);
});

test('si no entra un día, la historia espera (no se salta pasos)', () => {
  let st = { ...emptyStories(), firstDay: '2026-11-01' };
  let r = storyToday(st, ctxOf(3));
  const id = r.beat.storyId;
  st = resolveStory(r.stories, r.beat.choices[0].id, ctxOf(3)).stories;
  r = storyToday(st, ctxOf(9));                  // vuelve seis días después
  assert.equal(r.beat.storyId, id);
  assert.equal(r.beat.index, 1);
});

test('estado serializable: todo es JSON y da lo mismo', () => {
  const { st } = play(30);
  const copy = JSON.parse(JSON.stringify(st));
  assert.deepEqual(copy, st);
  assert.deepEqual(storyToday(copy, ctxOf(31)), storyToday(st, ctxOf(31)));
});

console.log(`\n${passed} pruebas pasaron`);
