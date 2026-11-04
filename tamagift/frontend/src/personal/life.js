// ─────────────────────────────────────────────────────────────────
// La mascota vive sus gustos (PLAN_REGALO_VIVO.md §2, etapa 3).
//
// Cada cierto rato, y como mucho unas pocas veces por día, la mascota
// hace algo solita con lo que el regalo trae: tararea la canción que
// eligió quien regala, mira su póster y suspira, cocina la comida
// favorita y la ofrece, dice una línea con un gusto de la ficha, o de
// noche sueña con una foto de los dos.
//
// Todo es puro (sin React ni red). El juego guarda el estado en
// game.life y muestra la escena que devuelve nextLifeScene:
//
//   scene = {
//     id, kind,                 'tararear' | 'poster' | 'cocinar' | 'gusto' | 'sueno'
//     text,                     lo que dice (ya con los nombres puestos)
//     anim,                     'tararear' | 'mirarPoster' | 'cocinar' | 'hablar' | 'sonar'
//     songIndex?,               índice en pet.songs        (tararear)
//     photoIndex?,              índice en pet.photos       (poster, sueno)
//     food?,                    { index, name, image }     (cocinar; index en pet.food_preferences)
//     likeId?,                  id de LIKES                (gusto)
//     offer?,                   botón opcional: { label, action: 'playSong' | 'eat', vitals? }
//     fromGiver,                true si lo que aparece lo eligió quien regala
//     log,                      lo que el diario anota (diary.js, logDiary)
//   }
//
//   game.life = { day, n, lastAt, dreamAt, kinds: [], texts: [], hist: { [clave]: día } }
//
// Reglas: como mucho LIFE_PER_DAY escenas por día (más un sueño por
// noche), una cada LIFE_GAP
// como poco, ningún tipo dos veces el mismo día, ningún texto repetido
// en el día, y entre días se elige lo que hace más que no sale (canción,
// foto, comida, gusto y frase).
// ─────────────────────────────────────────────────────────────────

import { LIKE_LINES, fill } from './catalog.js';
import { todayKey } from '../gameState.js';

const MIN = 60 * 1000;
export const LIFE_PER_DAY = 3;
export const LIFE_GAP = 25 * MIN;
// Los sueños no gastan el cupo del día (son de noche), pero hay uno por
// noche: entre uno y otro, al menos DREAM_GAP.
export const DREAM_GAP = 8 * 60 * MIN;
// Al abrir el juego, la primera escena espera un poco (que primero
// lleguen el saludo, las cartas y lo del día).
export const LIFE_FIRST = 2 * MIN;
export const LIFE_KINDS = ['tararear', 'poster', 'cocinar', 'gusto', 'sueno'];

export function emptyLife() {
  return { day: null, n: 0, lastAt: 0, dreamAt: 0, kinds: [], texts: [], hist: {} };
}
const L = (l) => ({ ...emptyLife(), ...(l || {}), hist: { ...((l && l.hist) || {}) } });

// ── Azar con semilla (mismo estado + misma semilla = misma escena) ──
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seeded(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : hashStr(String(seed));
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Días entre dos claves AAAA-MM-DD.
export function dayDiff(a, b) {
  if (!a || !b) return Infinity;
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
}

// Elige entre opciones la que hace más que no sale (nunca salida = la
// más vieja); entre empatadas decide el azar.
function freshest(options, keyOf, hist, today, rnd) {
  if (!options.length) return null;
  const age = (o) => { const d = hist[keyOf(o)]; return d ? dayDiff(d, today) : 10000; };
  const best = Math.max(...options.map(age));
  const top = options.filter((o) => age(o) === best);
  return top[Math.floor(rnd() * top.length) % top.length];
}

// "Girasoles" → "girasoles" dentro de una frase; los nombres propios
// (series, artistas) quedan como están.
const KEEP_CASE = new Set(['serie', 'musica']);
export function inSentence(v, likeId) {
  const s = String(v || '').trim();
  if (!s || KEEP_CASE.has(likeId)) return s;
  // siglas ("ABBA", "K-pop") quedan como están
  if (/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ-]/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// ── Frases (español neutro, sin género de quien recibe ni de la mascota) ──
// {yo} quien regala · {nombre} quien recibe · {cancion} · {comida}
const TEXTS = {
  tararear: [
    { id: 't1', t: '♪ Mmm mm mmm… no se me sale de la cabeza «{cancion}»' },
    { id: 't2', t: '♪ ¿La reconoces? Es «{cancion}», la que eligió {yo}' },
    { id: 't3', t: '♪ La la la… con «{cancion}» todo se siente más bonito' },
    { id: 't4', t: '♪ Estoy practicando «{cancion}» para cantártela entera' },
    { id: 't5', t: '♪ Te canto «{cancion}» bajito, a ver si te saco una sonrisa', mood: 'triste' },
    { id: 't6', t: '♪ Con la lluvia, «{cancion}» suena todavía mejor', weather: 'lluvia' },
  ],
  poster: [
    { id: 'p1', t: 'Ay… me encanta esta foto de ustedes dos' },
    { id: 'p2', t: '*suspiro* Qué bonitos se ven aquí' },
    { id: 'p3', t: 'Cada vez que miro esta foto pienso en cuánto te quiere {yo}' },
    { id: 'p4', t: '¿Te acuerdas de este día? Yo no estaba, pero se nota que fue lindo' },
    { id: 'p5', t: 'Esta foto es mi parte favorita del cuarto' },
    { id: 'p6', t: 'Mira qué sonrisa… así me gusta verte, {nombre}', mood: 'triste' },
  ],
  cocinar: [
    { id: 'c1', t: 'Te preparé {comida}, de lo que más te gusta. ¿Quieres?' },
    { id: 'c2', t: '¡Sorpresa! Cociné {comida} sin ayuda… bueno, casi' },
    { id: 'c3', t: 'Le pregunté a {yo} qué te gusta comer y me dijo: {comida}. ¡Aquí tienes!' },
    { id: 'c4', t: 'Huele rico, ¿no? Es {comida}. Te guardé el primer plato' },
    { id: 'c5', t: 'Día de lluvia, día de {comida}. Te serví un plato', weather: 'lluvia' },
    { id: 'c6', t: 'Para los días grises: {comida}, como a ti te gusta', mood: 'triste' },
  ],
  sueno: [
    { id: 's1', t: 'Zzz… soñé con este día… salían tú y {yo}…' },
    { id: 's2', t: 'Zzz… en mi sueño estaban ustedes dos, riéndose así' },
    { id: 's3', t: 'Mmm… soñé que nos íbamos de paseo los tres…' },
    { id: 's4', t: 'Zzz… qué sueño tan bonito… había una foto y un abrazo…' },
    { id: 's5', t: 'Zzz… {nombre}… {yo}… zzz…' },
  ],
};

const ANIM = { tararear: 'tararear', poster: 'mirarPoster', cocinar: 'cocinar', gusto: 'hablar', sueno: 'sonar' };

// ── Lo que el regalo trae ───────────────────────────────────────────
function songsOf(pet) {
  return ((pet && pet.songs) || []).map((s, index) => ({ index, title: String((s && s.title) || '').trim() }));
}
// Pósters: los que están colgados (`hungPhotos`, índices en pet.photos)
// o, si el juego no lo dice, todas las fotos marcadas como póster.
function postersOf(pet, hung) {
  const photos = (pet && pet.photos) || [];
  const ok = (i) => photos[i] && photos[i].url;
  if (Array.isArray(hung)) return hung.filter(ok);
  return photos.map((p, i) => i).filter((i) => ok(i) && photos[i].used_for === 'poster');
}
function dreamPhotosOf(pet) {
  return ((pet && pet.photos) || []).map((p, i) => i).filter((i) => pet.photos[i] && pet.photos[i].url);
}
function likedFoodsOf(pet) {
  return ((pet && pet.food_preferences) || [])
    .map((f, index) => ({ index, name: String((f && f.food_name) || '').trim(), image: (f && f.image) || null, pref: f && f.preference }))
    .filter((f) => f.pref === 'gusta' && f.name);
}
function likeOptions(profile) {
  const likes = (profile && profile.likes) || {};
  const out = [];
  for (const [id, v] of Object.entries(likes)) {
    const lines = LIKE_LINES[id];
    if (!lines || !String(v || '').trim()) continue;
    lines.forEach((line, i) => out.push({ id, i, v: inSentence(v, id), line, key: `like:${id}:${i}` }));
  }
  return out;
}

// El contexto del momento, normalizado.
function readCtx(ctx = {}) {
  const now = ctx.now ?? (ctx.date ? ctx.date.getTime() : Date.now());
  const date = ctx.date || new Date(now);
  const h = date.getHours();
  const night = h >= 22 || h < 6;
  return {
    ...ctx, now, date, h, night,
    today: todayKey(date),
    sleeping: !!ctx.sleeping,
    mood: ctx.mood || 'normal',
    weather: ctx.weather || null,
    names: ctx.names || {},
    said: new Set((ctx.said || []).map(String)),
  };
}

// ¿Qué tipos se pueden hoy, ahora? (sin mirar el cupo)
export function lifeKindsAvailable(ctx = {}) {
  const c = readCtx(ctx);
  const pet = c.pet || {};
  const out = [];
  if (c.sleeping) return dreamPhotosOf(pet).length ? ['sueno'] : [];
  if (c.mood === 'dormido') return [];
  const awake = c.h >= 7 && c.h < 23;
  if (awake && songsOf(pet).length) out.push('tararear');
  if (awake && c.h < 22 && postersOf(pet, c.hungPhotos).length) out.push('poster');
  if (c.h >= 8 && c.h < 21 && c.mood !== 'enojado' && likedFoodsOf(pet).length) out.push('cocinar');
  if (c.h >= 7 && likeOptions(c.profile).some((o) => !c.said.has(o.key) && !c.said.has('gusto'))) out.push('gusto');
  if (c.night && dreamPhotosOf(pet).length) out.push('sueno');
  return out;
}

// Elige la variante de frase: que encaje con el clima / ánimo si hay una
// para eso, que no se haya dicho hoy y, entre días, la que hace más que
// no sale.
function pickText(kind, c, hist, rnd, vars, todayTexts) {
  const all = TEXTS[kind].map((x) => ({ ...x, text: fill(x.t.replace(/\{cancion\}/g, vars.cancion || '').replace(/\{comida\}/g, vars.comida || ''), c.names) }));
  const fits = (x) => (!x.weather || x.weather === c.weather) && (!x.mood || x.mood === c.mood);
  const fresh = all.filter((x) => fits(x) && !todayTexts.has(x.text) && !c.said.has(x.text));
  const special = fresh.filter((x) => x.weather || x.mood);
  // lo que va con el momento sale primero, si no salió hace poco
  const sp = special.filter((x) => dayDiff(hist[`txt:${kind}:${x.id}`], c.today) >= 2);
  const pool = sp.length ? sp : fresh.filter((x) => !x.weather && !x.mood).length ? fresh.filter((x) => !x.weather && !x.mood) : fresh;
  return freshest(pool, (x) => `txt:${kind}:${x.id}`, hist, c.today, rnd);
}

// Arma la escena de un tipo (también sirve para la página de pruebas).
// Devuelve { scene, keys } o null si ese tipo no se puede.
export function makeLifeScene(kind, ctx = {}, life = null) {
  const c = readCtx(ctx);
  const st = L(life);
  const hist = st.hist;
  const rnd = c.rnd || seeded(`${c.seed ?? ''}|${c.today}|${st.day === c.today ? st.n : 0}|${kind}`);
  const todayTexts = new Set(st.day === c.today ? st.texts : []);
  const pet = c.pet || {};
  const names = c.names;
  const base = { id: `vida-${kind}-${c.today}-${st.day === c.today ? st.n : 0}`, kind, anim: ANIM[kind] };
  switch (kind) {
    case 'tararear': {
      const song = freshest(songsOf(pet), (s) => `song:${s.index}`, hist, c.today, rnd);
      if (!song) return null;
      const x = pickText(kind, c, hist, rnd, { cancion: song.title || 'nuestra canción' }, todayTexts);
      if (!x) return null;
      return {
        scene: { ...base, text: x.text, songIndex: song.index, fromGiver: true, offer: { label: 'Ponerla', action: 'playSong' }, log: { type: 'vida', kind, song: song.title || null } },
        keys: [`song:${song.index}`, `txt:${kind}:${x.id}`],
      };
    }
    case 'poster': {
      const idx = freshest(postersOf(pet, c.hungPhotos), (i) => `photo:${i}`, hist, c.today, rnd);
      if (idx == null) return null;
      const x = pickText(kind, c, hist, rnd, {}, todayTexts);
      if (!x) return null;
      return { scene: { ...base, text: x.text, photoIndex: idx, fromGiver: true, log: { type: 'vida', kind } }, keys: [`photo:${idx}`, `txt:${kind}:${x.id}`] };
    }
    case 'cocinar': {
      const food = freshest(likedFoodsOf(pet), (f) => `food:${f.index}`, hist, c.today, rnd);
      if (!food) return null;
      const x = pickText(kind, c, hist, rnd, { comida: food.name.charAt(0).toLowerCase() + food.name.slice(1) }, todayTexts);
      if (!x) return null;
      return {
        scene: {
          ...base, text: x.text, food: { index: food.index, name: food.name, image: food.image }, fromGiver: true,
          offer: { label: '¡A comer!', action: 'eat', vitals: { hunger: 18, love: 6 } },
          log: { type: 'vida', kind, food: food.name },
        },
        keys: [`food:${food.index}`, `txt:${kind}:${x.id}`],
      };
    }
    case 'gusto': {
      const opts = likeOptions(c.profile).filter((o) => !c.said.has(o.key));
      // un gusto distinto del de la última vez y, dentro de él, la línea
      // que hace más que no sale
      const byLike = [...new Set(opts.map((o) => o.id))].map((id) => ({ id }));
      const like = freshest(byLike, (o) => `likeid:${o.id}`, hist, c.today, rnd);
      if (!like) return null;
      const lines = opts.filter((o) => o.id === like.id).map((o) => ({ ...o, text: fill(o.line.replace(/\{v\}/g, o.v), names) })).filter((o) => !todayTexts.has(o.text) && !c.said.has(o.text));
      const o = freshest(lines, (q) => q.key, hist, c.today, rnd);
      if (!o) return null;
      return { scene: { ...base, text: o.text, likeId: o.id, fromGiver: false, log: { type: 'vida', kind, likeId: o.id } }, keys: [o.key, `likeid:${o.id}`] };
    }
    case 'sueno': {
      const idx = freshest(dreamPhotosOf(pet), (i) => `dream:${i}`, hist, c.today, rnd);
      if (idx == null) return null;
      const x = pickText(kind, c, hist, rnd, {}, todayTexts);
      if (!x) return null;
      return { scene: { ...base, text: x.text, photoIndex: idx, fromGiver: true, log: { type: 'vida', kind } }, keys: [`dream:${idx}`, `txt:${kind}:${x.id}`] };
    }
    default:
      return null;
  }
}

// Pesos según el momento: con pena, canción y comida rica; con lluvia,
// cocinar; lo de ayer pesa menos (variedad entre días).
function weightOf(kind, c, st) {
  let w = { tararear: 1, poster: 1, cocinar: 1, gusto: 1.2, sueno: 3 }[kind] || 1;
  if (c.mood === 'triste' && (kind === 'tararear' || kind === 'cocinar')) w *= 1.8;
  if (c.weather === 'lluvia' && kind === 'cocinar') w *= 1.8;
  if (c.mood === 'feliz' && kind === 'poster') w *= 1.4;
  const last = st.hist[`kind:${kind}`];
  if (last && dayDiff(last, c.today) <= 1) w *= 0.5;
  return w;
}

// ¿Toca una escena ahora? Devuelve { life, scene } o null.
//   ctx = {
//     now, date,               la hora (date manda si viene)
//     pet,                     la mascota (songs, photos, food_preferences)
//     profile,                 la ficha (likes)
//     names: { nombre, yo },   para fill() (callName y creator_name)
//     mood, weather,           ánimo de la mochi y clima de hoy
//     sleeping,                luz apagada (solo sueños)
//     hungPhotos?,             índices de pet.photos colgados como póster
//     said?,                   textos o claves ('like:color:0', 'gusto') ya dichos hoy
//     busy?,                   hay otra cosa en pantalla: no toca nada
//     sessionStart?,           cuándo se abrió el juego (ms)
//     seed?,                   semilla (slug); rnd? para pruebas
//   }
export function nextLifeScene(life, ctx = {}) {
  const c = readCtx(ctx);
  let st = L(life);
  if (st.day !== c.today) st = { ...st, day: c.today, n: 0, kinds: [], texts: [] };
  if (c.busy) return null;
  if (st.lastAt && c.now - st.lastAt < LIFE_GAP) return null;
  if (c.sessionStart && c.now - c.sessionStart < LIFE_FIRST) return null;
  const full = st.n >= LIFE_PER_DAY;
  const dreamOk = !st.dreamAt || c.now - st.dreamAt >= DREAM_GAP;
  const kinds = lifeKindsAvailable(ctx).filter((k) => !st.kinds.includes(k) && (k === 'sueno' ? dreamOk : !full));
  if (!kinds.length) return null;
  const rnd = c.rnd || seeded(`${c.seed ?? ''}|${c.today}|${st.n}`);
  const pool = kinds.map((k) => [k, weightOf(k, c, st)]);
  // se prueban en orden de sorteo hasta que uno arme escena
  const order = [];
  const left = [...pool];
  while (left.length) {
    const total = left.reduce((s, [, w]) => s + w, 0);
    let r = rnd() * total, idx = 0;
    for (let i = 0; i < left.length; i++) { if ((r -= left[i][1]) <= 0) { idx = i; break; } idx = i; }
    order.push(left[idx][0]);
    left.splice(idx, 1);
  }
  for (const k of order) {
    const made = makeLifeScene(k, { ...ctx, rnd: c.rnd || seeded(`${c.seed ?? ''}|${c.today}|${st.n}|${k}`) }, st);
    if (!made) continue;
    const hist = { ...st.hist, [`kind:${k}`]: c.today };
    made.keys.forEach((key) => { hist[key] = c.today; });
    // la historia no crece sin fin: se queda con lo de los últimos 60 días
    for (const [key, d] of Object.entries(hist)) if (dayDiff(d, c.today) > 60) delete hist[key];
    const dream = k === 'sueno';
    const next = { ...st, n: st.n + (dream ? 0 : 1), lastAt: c.now, ...(dream ? { dreamAt: c.now } : {}), kinds: [...st.kinds, k], texts: [...st.texts, made.scene.text], hist };
    return { life: next, scene: made.scene };
  }
  return null;
}
