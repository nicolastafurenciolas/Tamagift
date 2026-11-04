// ─────────────────────────────────────────────────────────────────
// El diario de la mascota (PLAN_REGALO_VIVO.md §2, etapa 3): el diario
// está en la repisa y cada día la mascota escribe UNA entrada cortita,
// en primera persona, con lo que pasó y, siempre que llegó algo de
// quien regala, con eso primero.
//
// Durante el día el juego anota lo que pasa (logDiary); la entrada del
// día se escribe con plantillas con huecos, eligiendo siempre la que
// hace más que no sale (nada repetitivo). Al pasar el día queda fija
// (closeDiary). Todo es puro y serializable (game.diary):
//
//   game.diary = {
//     logs:    { [día]: [evento] }        lo anotado, de hoy y días sin cerrar
//     entries: { [día]: entrada }         lo escrito
//     used:    { [idPlantilla]: día }     para no repetir
//   }
//   entrada = { date: 'AAAA-MM-DD', text, highlights: [{ type, label }], tpl: [ids] }
//
// Eventos que entiende (lo demás se ignora):
//   { type: 'carta', kind: 'carta'|'nota'|'voz'|'paquete'|'answer'|'cofre', label? }   llegó algo de quien regala
//   { type: 'situacion', id }                 la mascota dijo un mensaje por situación (de quien regala)
//   { type: 'comida', food, fav? }            comió algo (fav: su favorita)
//   { type: 'nivel', game, label?, stars? }   terminó un nivel / partida
//   { type: 'suceso', id, label? }            un suceso de worldEvents.js ('bichito', 'moneda', 'visita', …)
//   { type: 'historia', storyId, stepId, … }  avanzó una historia (stories.js: result.log)
//   { type: 'vida', kind, food?, song? }      una escena de life.js (scene.log)
//   { type: 'foto' }                          se tomó una foto
// ─────────────────────────────────────────────────────────────────

import { fill } from './catalog.js';
import { todayKey } from '../gameState.js';
import { seeded, dayDiff } from './life.js';

export const MAX_EVENTS_PER_DAY = 40;
export const KEEP_ENTRIES = 120;

export function emptyDiary() {
  return { logs: {}, entries: {}, used: {} };
}
const D = (d) => ({ ...emptyDiary(), ...(d || {}), logs: { ...((d && d.logs) || {}) }, entries: { ...((d && d.entries) || {}) }, used: { ...((d && d.used) || {}) } });

const KNOWN = new Set(['carta', 'situacion', 'comida', 'nivel', 'suceso', 'historia', 'vida', 'foto']);

// Anota algo de hoy. Devuelve el diario nuevo (o el mismo si no aplica).
export function logDiary(diary, ev, { date = new Date() } = {}) {
  if (!ev || !KNOWN.has(ev.type)) return diary || emptyDiary();
  const d = D(diary);
  const day = todayKey(date);
  const list = d.logs[day] || [];
  if (list.length >= MAX_EVENTS_PER_DAY) return d;
  return { ...d, logs: { ...d.logs, [day]: [...list, { ...ev }] } };
}

const GAME_NAMES = {
  cocina: 'la cocina', trivia: 'la trivia', memoria: 'memoria', golosinas: 'golosinas', simon: 'Simón dice',
  volar: 'volar', atrapar: 'atrapa la comida', rompecabezas: 'el rompecabezas', topos: 'los topos',
  serpiente: 'la serpiente', cruzar: 'cruzar la calle', torre: 'la torre',
};
const low = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

// ── Plantillas ──────────────────────────────────────────────────────
// {nombre} quien recibe · {yo} quien regala · {x} el detalle
const OPEN = [
  { id: 'o1', t: 'Querido diario: hoy fue un día {clima}.' },
  { id: 'o2', t: 'Diario, te cuento cómo me fue hoy.' },
  { id: 'o3', t: 'Hoy {nombre} vino a verme y el cuarto se llenó de luz.' },
  { id: 'o4', t: 'Querido diario: tengo muchas cosas que contarte.' },
  { id: 'o5', t: 'Hoy fue uno de esos días que dan ganas de guardar.' },
  { id: 'o6', t: 'Afuera estaba {clima2} y adentro, todo calentito.', tag: 'calor' },
  { id: 'o7', t: 'Querido diario: ¡qué día!' },
  { id: 'o8', t: 'Hoy me tocó un día de esos lindos.' },
];
const CLIMA = { sol: 'soleadito', lluvia: 'de lluvia', nublado: 'nubladito', nieve: 'de nieve' };
const CLIMA2 = { sol: 'soleado', lluvia: 'lloviendo', nublado: 'nublado', nieve: 'nevando' };

// Lo de quien regala (va siempre, y primero).
const GIVER = {
  carta: [
    { id: 'gc1', t: '¡Llegó una carta de {yo}! La leímos con {nombre} y me puse feliz.' },
    { id: 'gc2', t: '{yo} mandó una carta. Se nota cuánto quiere a {nombre}.' },
    { id: 'gc3', t: 'Hoy hubo carta de {yo}: {nombre} la guardó en el corazón.' },
    { id: 'gc4', t: 'El cartero trajo una carta de {yo} para {nombre}. ¡Me encantan sus cartas!' },
  ],
  nota: [
    { id: 'gn1', t: '{yo} dejó una notita para {nombre}. Me encanta cuando hace eso.' },
    { id: 'gn2', t: 'Llegó un mensajito de {yo}, cortito pero lleno de cariño.' },
  ],
  voz: [
    { id: 'gv1', t: 'Llegó una nota de voz de {yo}. ¡Qué lindo escuchar su voz!' },
    { id: 'gv2', t: '{yo} mandó un audio para {nombre}. Lo escuchamos con una sonrisa.' },
  ],
  paquete: [
    { id: 'gp1', t: '¡{yo} mandó un paquete!{x} Qué detalle tan bonito.' },
    { id: 'gp2', t: 'Tocaron la puerta: era un paquete de {yo}.{x}' },
  ],
  answer: [
    { id: 'ga1', t: '{yo} respondió una pregunta de {nombre}. Ahora sé un secretito más de ustedes.' },
    { id: 'ga2', t: 'Llegó la respuesta de {yo} a una pregunta de {nombre}. ¡Qué ternura!' },
  ],
  cofre: [
    { id: 'gk1', t: 'Abrimos una carta del cofre de recuerdos: {yo} la había guardado para hoy.' },
    { id: 'gk2', t: 'El cofre brilló y adentro había una carta de {yo}.' },
  ],
  situacion: [
    { id: 'gs1', t: 'Le di a {nombre} un mensajito que {yo} me había encargado para un momento así.' },
    { id: 'gs2', t: '{yo} me dejó dicho algo para {nombre}, y hoy era el día de decirlo.' },
  ],
  sopa: [{ id: 'gso', t: '{yo} me mandó sopa para el resfriado. ¡Me curó!' }],
  hallada: [{ id: 'gh1', t: '{x} encontró una carta perdida de {yo}. ¡Qué suerte!' }],
  muchas: [
    { id: 'gm1', t: '¡Hoy llegaron {x} cosas de {yo}! Se acordó de {nombre} todo el día.' },
    { id: 'gm2', t: '{yo} se lució: {x} sorpresas para {nombre} en un solo día.' },
  ],
};

const HIST = {
  'vecinita:llega': 'Conocí a Mimi, la vecinita nueva. Creo que nos vamos a llevar muy bien.',
  'vecinita:azucar': 'Mimi vino a pedirnos azúcar para su pastel.',
  'vecinita:gracias': 'Mimi nos trajo un pedazo de pastel. ¡Qué rico!',
  'cartero:llega': 'Conocí a Tobi, el cartero. Dice que a esta casa llegan cartas muy bonitas (¡y es verdad!).',
  'cartero:bolso': 'A Tobi se le volaron las cartas y lo ayudamos.',
  'cartero:postal': 'Tobi nos trajo una postal de la oficina de correos.',
  'gato:asoma': 'Hay un gatito que se asoma a la puerta. Es tímido, pero curioso.',
  'gato:nombre': 'El gatito del barrio ya tiene nombre: {x}.',
  'gato:caricia': '{x} se dejó acariciar. ¡Ronronea como un motorcito!',
  'gato:amigo': '{x} y yo ya somos amigos de verdad.',
  'resfriado:achis': 'Me resfrié… y {nombre} me cuidó un montón.',
  'resfriado:sopa': 'Me tomé una sopita calentita y me sentí mejor.',
  'resfriado:sano': '¡Ya me curé del todo!',
  'planta:semilla': 'Plantamos unas semillitas. Ya quiero ver qué sale.',
  'planta:brote': '¡A la plantita le salió un brote!',
  'planta:capullo': 'La plantita tiene un capullo. Falta poquito.',
  'planta:flor': '¡Floreció la plantita! Valió la pena esperar.',
  'cumple:vispera': 'Mañana es un día especial… shhh.',
  'cumple:fiesta': '¡Hicimos una fiesta! Hubo pastel, velitas y abrazos.',
  'paraguas:empapada': 'A Mimi la agarró la lluvia y la ayudamos.',
  'paraguas:devuelve': 'Mimi nos trajo muffins para darnos las gracias.',
  'carta:perdida': 'Tobi perdió una carta para {nombre}… ¿dónde estará?',
};

const VIDA = {
  tararear: [{ id: 'vt1', t: 'Me pasé el día tarareando {x}.' }, { id: 'vt2', t: 'Canté {x} bajito y nadie me oyó… o eso creo.' }],
  poster: [{ id: 'vp1', t: 'Me quedé un rato mirando la foto de ustedes dos.' }, { id: 'vp2', t: 'Volví a mirar el póster: qué bonitos se ven.' }],
  cocinar: [{ id: 'vc1', t: 'Cociné {x} para {nombre}, y me salió bastante bien.' }, { id: 'vc2', t: 'Hoy fui chef: preparé {x}.' }],
  gusto: [{ id: 'vg1', t: 'Hablamos de las cosas que le gustan a {nombre}.' }],
  sueno: [{ id: 'vs1', t: 'Soñé con ustedes dos. Fue un sueño precioso.', tag: 'sueno' }, { id: 'vs2', t: 'Tuve un sueño lindo con una foto de los dos.', tag: 'sueno' }],
};

const SUCESO = {
  bichito: [{ id: 'sb1', t: 'Atrapamos {x} para el álbum.' }, { id: 'sb2', t: 'Entró {x} volando al cuarto. ¡La atrapamos!' }],
  moneda: [{ id: 'sm1', t: 'Encontré una moneda escondida en el piso.' }],
  visita: [{ id: 'sv1', t: 'Vino una amiga de visita y nos trajo algo rico.' }],
  antojo: [{ id: 'sa1', t: 'Tuve un antojo y {nombre} me lo cumplió.' }],
  hipo: [{ id: 'sh1', t: 'Me dio hipo… ¡hip! Ya se me pasó.' }],
  migas: [{ id: 'sg1', t: 'Dejé migas por todos lados, pero limpiamos juntos.' }],
  copos: [{ id: 'sc1', t: 'Atrapamos copitos de nieve dentro del cuarto.' }],
  fantasmas: [{ id: 'sf1', t: 'Unos fantasmitas se colaron en el cuarto. ¡Los atrapamos a todos!' }],
  dulceotruco: [{ id: 'sd1', t: 'Vinieron a pedirnos dulce o truco.' }],
  intercambio: [{ id: 'si1', t: 'Intercambiamos regalos de Navidad con una vecina.' }],
  regalo: [{ id: 'sr1', t: 'Abrí el regalito del día.' }],
};

const OTROS = {
  nivel3: [{ id: 'n31', t: '{nombre} hizo tres estrellas en {x}. ¡Qué orgullo!' }, { id: 'n32', t: '¡Tres estrellas en {x}! Lo festejamos bailando.' }],
  nivel: [{ id: 'n1', t: 'Jugamos a {x} un buen rato.' }, { id: 'n2', t: '{nombre} pasó un nivel de {x}. ¡Bien!' }],
  favorita: [{ id: 'cf1', t: 'Comí {x}, ¡de lo que más me gusta!' }, { id: 'cf2', t: 'De comer hubo {x}. Mmm, qué delicia.' }, { id: 'cf3', t: '{nombre} me dio {x}, que me encanta.' }],
  comida: [{ id: 'cm1', t: 'Comí {x}.' }, { id: 'cm2', t: 'Hoy probé {x}.' }],
  foto: [{ id: 'fo1', t: 'Nos sacamos una foto. Salimos muy bien.' }, { id: 'fo2', t: 'Hay una foto nueva en el álbum.' }],
};

const CLOSE = [
  { id: 'c1', t: 'Mañana quiero otro día así.' },
  { id: 'c2', t: 'Buenas noches, diario.' },
  { id: 'c3', t: 'Te quiero, {nombre}.' },
  { id: 'c4', t: 'Me voy a dormir con el corazón calentito.', tag: 'calor' },
  { id: 'c5', t: 'Fin. (Bueno, hasta mañana.)' },
  { id: 'c6', t: 'Qué suerte tengo de estar aquí.' },
  { id: 'c7', t: 'Ahora, a soñar bonito.', tag: 'sueno' },
  { id: 'c8', t: 'Hasta mañana, diario.' },
  { id: 'c9', t: 'Guardo este día en mi corazoncito.' },
];

// Elige la plantilla que hace más que no sale (azar entre empatadas).
// `taken` guarda lo ya usado en la entrada (ids y temas: dos frases con
// "calentito" no van juntas).
function choose(list, used, day, rnd, taken) {
  const opts = list.filter((x) => !taken.has(x.id) && !(x.tag && taken.has(`#${x.tag}`)));
  const pool = opts.length ? opts : list;
  const age = (x) => (used[x.id] ? dayDiff(used[x.id], day) : 10000);
  const best = Math.max(...pool.map(age));
  const top = pool.filter((x) => age(x) === best);
  const x = top[Math.floor(rnd() * top.length) % top.length];
  taken.add(x.id);
  if (x.tag) taken.add(`#${x.tag}`);
  return x;
}

const isGiver = (e) => e.type === 'carta' || e.type === 'situacion'
  || (e.type === 'suceso' && e.id === 'carta')
  || (e.type === 'historia' && (e.giver || (e.storyId === 'carta' && e.stepId === 'aparece')));

function giverKind(e) {
  if (e.type === 'situacion') return 'situacion';
  if (e.type === 'suceso') return 'nota';
  if (e.type === 'historia') return e.giver ? 'sopa' : 'hallada';
  return GIVER[e.kind] ? e.kind : 'carta';
}

// Escribe la entrada de un día con lo anotado. Puro.
//   ctx = { date | day, names: { nombre, yo }, weather?, used?, seed?, rnd? }
// Devuelve { date, text, highlights, tpl } o null (día sin nada).
export function writeEntry(events, ctx = {}) {
  const list = (events || []).filter((e) => e && KNOWN.has(e.type));
  if (!list.length) return null;
  const day = ctx.day || todayKey(ctx.date || new Date());
  const names = { nombre: (ctx.names && ctx.names.nombre) || 'amor', yo: (ctx.names && ctx.names.yo) || 'quien me regaló' };
  const used = ctx.used || {};
  const rnd = ctx.rnd || seeded(`${ctx.seed ?? ''}|diario|${day}`);
  const taken = new Set();
  const tpl = [];
  const highlights = [];
  const put = (x, vars = {}) => {
    tpl.push(x.id);
    let s = x.t;
    s = s.replace(/\{x\}/g, vars.x ?? '').replace(/\{clima\}/g, CLIMA[ctx.weather] || 'bonito').replace(/\{clima2\}/g, CLIMA2[ctx.weather] || 'tranquilo');
    s = fill(s, names);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const parts = [];

  // 1. Lo de quien regala, primero (uno o el resumen si fueron varias).
  const giver = list.filter(isGiver);
  let giverLine = null;
  if (giver.length) {
    const big = giver.filter((e) => e.type === 'carta' || e.type === 'historia');
    const kinds = giver.map(giverKind);
    if (big.length >= 3) giverLine = put(choose(GIVER.muchas, used, day, rnd, taken), { x: String(big.length) });
    else {
      // lo más grande que llegó: carta > voz > paquete > cofre > sopa > hallada > respuesta > nota > situación
      const order = ['carta', 'voz', 'paquete', 'cofre', 'sopa', 'hallada', 'answer', 'nota', 'situacion'];
      const k = order.find((o) => kinds.includes(o)) || kinds[0];
      const e = giver[kinds.indexOf(k)];
      const x = k === 'paquete' && e.label ? ` Adentro venía: ${low(e.label)}.` : k === 'hallada' ? (e.gato || 'El gatito') : '';
      giverLine = put(choose(GIVER[k], used, day, rnd, taken), { x });
    }
    highlights.push(...giver.slice(0, 3).map((e) => ({ type: 'quienRegala', label: giverLabel(e, names) })));
  }

  // 2. Hasta dos momentos más, de lo más importante a lo más chico y sin
  // repetir de qué se trata.
  const moments = [];
  for (const e of list) {
    if (isGiver(e)) continue;
    if (e.type === 'historia') {
      const t = HIST[`${e.storyId}:${e.stepId}`];
      if (t) moments.push({ text: fill(t.replace(/\{x\}/g, e.gato || 'el gatito'), names), hl: { type: 'historia', label: e.title || 'Una historia' }, prio: 5, group: `historia:${e.storyId}` });
    } else if (e.type === 'nivel') {
      const label = e.label || GAME_NAMES[e.game] || 'un juego';
      const three = (e.stars || 0) >= 3;
      moments.push({ key: `n:${e.game}`, build: () => put(choose(three ? OTROS.nivel3 : OTROS.nivel, used, day, rnd, taken), { x: label }), hl: { type: 'nivel', label: `${label.charAt(0).toUpperCase() + label.slice(1)}${three ? ' ★★★' : ''}` }, prio: three ? 4 : 2, group: 'nivel' });
    } else if (e.type === 'comida' && e.food) {
      moments.push({ key: `c:${e.food}`, build: () => put(choose(e.fav ? OTROS.favorita : OTROS.comida, used, day, rnd, taken), { x: low(e.food) }), hl: { type: 'comida', label: e.food }, prio: e.fav ? 3 : 1, group: 'comida' });
    } else if (e.type === 'vida' && VIDA[e.kind]) {
      const x = e.kind === 'tararear' ? (e.song ? `«${e.song}»` : 'nuestra canción') : e.kind === 'cocinar' ? low(e.food || 'algo rico') : '';
      moments.push({ key: `v:${e.kind}`, build: () => put(choose(VIDA[e.kind], used, day, rnd, taken), { x }), hl: { type: 'vida', label: VIDA_LABEL[e.kind] }, prio: 3, group: `vida:${e.kind}` });
    } else if (e.type === 'suceso' && SUCESO[e.id]) {
      const x = e.id === 'bichito' ? `una ${low(e.label || 'mariposa')}` : '';
      moments.push({ key: `s:${e.id}`, build: () => put(choose(SUCESO[e.id], used, day, rnd, taken), { x }), hl: { type: 'suceso', label: SUCESO_LABEL[e.id] || 'Un suceso' }, prio: 1.5, group: `suceso:${e.id}` });
    } else if (e.type === 'foto') {
      moments.push({ key: 'foto', build: () => put(choose(OTROS.foto, used, day, rnd, taken)), hl: { type: 'foto', label: 'Una foto' }, prio: 2.5, group: 'foto' });
    }
  }
  // de cada grupo, uno; de la historia, el último paso del día
  const byGroup = new Map();
  for (const m of moments) {
    if (!byGroup.has(m.group) || m.prio >= byGroup.get(m.group).prio) byGroup.set(m.group, m);
  }
  const ranked = [...byGroup.values()].sort((a, b) => b.prio - a.prio || rnd() - 0.5);
  const room = giverLine ? 2 : 3;
  const chosen = ranked.slice(0, room);

  // 3. Armado: (apertura) + quien regala + momentos + cierre. Si ya hay
  // mucho, sin apertura: corto siempre.
  const sentences = [];
  const long = (giverLine ? 1 : 0) + chosen.length >= 3;
  if (!long) sentences.push(put(choose(ctx.weather ? OPEN : OPEN.filter((o) => !o.t.includes('{clima')), used, day, rnd, taken)));
  if (giverLine) sentences.push(giverLine);
  for (const m of chosen) {
    sentences.push(m.build ? m.build() : m.text);
    if (m.hl) highlights.push(m.hl);
  }
  sentences.push(put(choose(CLOSE, used, day, rnd, taken)));
  parts.push(...sentences);
  return { date: day, text: parts.join(' '), highlights, tpl };
}

const VIDA_LABEL = { tararear: 'Nuestra canción', poster: 'El póster', cocinar: 'Cocinó', gusto: 'Sus gustos', sueno: 'Un sueño' };
const SUCESO_LABEL = { bichito: 'Un bichito', moneda: 'Una moneda', visita: 'Una visita', antojo: 'Un antojo', hipo: 'Hipo', migas: 'Migas', copos: 'Copitos', fantasmas: 'Fantasmitas', dulceotruco: 'Dulce o truco', intercambio: 'Regalos', regalo: 'El regalo del día' };

function giverLabel(e, names) {
  const yo = names.yo;
  if (e.type === 'situacion') return `Un mensaje de ${yo}`;
  if (e.type === 'suceso') return `Cartita de ${yo}`;
  if (e.type === 'historia') return e.giver ? `Sopa de ${yo}` : `Carta de ${yo}`;
  return {
    carta: `Carta de ${yo}`, nota: `Nota de ${yo}`, voz: `Voz de ${yo}`, paquete: `Paquete de ${yo}`,
    answer: `Respuesta de ${yo}`, cofre: `Del cofre de ${yo}`,
  }[e.kind] || `De ${yo}`;
}

function remember(d, entry) {
  const used = { ...d.used };
  (entry.tpl || []).forEach((id) => { used[id] = entry.date; });
  for (const [id, day] of Object.entries(used)) if (dayDiff(day, entry.date) > 40) delete used[id];
  return used;
}

// Cierra los días pasados: escribe su entrada (una sola, fija) y borra
// lo anotado. Se llama al abrir el juego y cuando cambia el día.
//   ctx = { date, names, seed, weatherOf?(día) }
export function closeDiary(diary, ctx = {}) {
  let d = D(diary);
  const today = todayKey(ctx.date || new Date());
  const past = Object.keys(d.logs).filter((day) => day < today).sort();
  if (!past.length) return diary || d;
  for (const day of past) {
    if (!d.entries[day]) {
      const weather = ctx.weatherOf ? ctx.weatherOf(day) : undefined;
      const entry = writeEntry(d.logs[day], { ...ctx, day, weather, used: d.used });
      if (entry) d = { ...d, entries: { ...d.entries, [day]: entry }, used: remember(d, entry) };
    }
    const logs = { ...d.logs };
    delete logs[day];
    d = { ...d, logs };
  }
  const keys = Object.keys(d.entries).sort();
  if (keys.length > KEEP_ENTRIES) {
    const entries = { ...d.entries };
    keys.slice(0, keys.length - KEEP_ENTRIES).forEach((k) => delete entries[k]);
    d = { ...d, entries };
  }
  return d;
}

// La página de hoy, mientras se escribe (no se guarda).
//   ctx = { date, names, weather, seed }
export function todayEntry(diary, ctx = {}) {
  const d = D(diary);
  const day = todayKey(ctx.date || new Date());
  return writeEntry(d.logs[day], { ...ctx, day, used: d.used });
}

// Todas las páginas, la más nueva primero (la de hoy con draft: true).
export function diaryPages(diary, ctx = {}) {
  const d = D(diary);
  const today = todayEntry(d, ctx);
  const past = Object.values(d.entries).sort((a, b) => (a.date < b.date ? 1 : -1));
  return [...(today ? [{ ...today, draft: true }] : []), ...past];
}

// ¿Hay algo nuevo en el diario? (para que brille en la repisa, uno a la vez)
export function diaryHasNew(diary, lastSeenDay) {
  const keys = Object.keys(D(diary).entries).sort();
  return keys.length > 0 && (!lastSeenDay || keys[keys.length - 1] > lastSeenDay);
}
