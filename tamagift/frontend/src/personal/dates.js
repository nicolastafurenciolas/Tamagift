// ─────────────────────────────────────────────────────────────────
// Sus fechas como temporadas propias (PLAN_REGALO_VIVO.md, etapa 4).
//
// Cada fecha de la ficha (profile.dates) se vuelve una "temporada" de
// uno a tres días alrededor del día: el cuarto se decora (globos y
// pastel en el cumpleaños; corazones, pétalos y velas en el aniversario;
// estrellas y recuerdos el día que se conocieron), la mascota dice una
// frase propia y, si el regalo trae canciones, ese día suena "nuestra
// canción".
//
//   personalSeasonNow(profile, date, opts) → la temporada de hoy o null
//   personalSeasonsAround(profile, date)   → todas las que tocan hoy
//   occurrenceOf(date, year)               → 'AAAA-MM-DD' de ese año
//
// Lógica pura (sin React): ver dates.test.mjs. El arte vive en
// art/room/celebrations.js y el cuarto lo pone con
// components/game/personal/CelebrationLayer.jsx.
//
// Reglas:
//   · Las fechas vienen como 'AAAA-MM-DD' o 'MM-DD' (sin año).
//   · Un 29 de febrero se celebra el 28 en los años no bisiestos.
//   · Si dos fechas se pisan, gana la que es HOY; después, el orden de
//     PRIORITY (el cumpleaños primero) y la más cercana.
//   · Con año se cuentan los años ("3 años juntos"), nunca la edad.
// ─────────────────────────────────────────────────────────────────

import { fill } from './catalog.js';

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysIn = (y, m) => new Date(y, m, 0).getDate();   // m de 1 a 12

/** Lee 'AAAA-MM-DD' o 'MM-DD'. Devuelve { year|null, m, d } o null. */
export function parseDate(s) {
  const r = /^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
  if (!r) return null;
  const year = r[1] ? Number(r[1]) : null;
  const m = Number(r[2]), d = Number(r[3]);
  if (m < 1 || m > 12 || d < 1) return null;
  // el día tiene que existir en ese mes (el 29 de febrero vale siempre)
  if (d > (m === 2 ? 29 : daysIn(2001, m))) return null;
  if (year && m === 2 && d === 29 && !isLeap(year)) return null;
  return { year, m, d };
}

/** El día en que cae la fecha en `year` ('AAAA-MM-DD'). */
export function occurrenceOf(date, year) {
  const p = typeof date === 'string' ? parseDate(date) : date;
  if (!p) return null;
  const d = p.m === 2 && p.d === 29 && !isLeap(year) ? 28 : p.d;
  return `${year}-${pad(p.m)}-${pad(d)}`;
}

const toDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const diffDays = (a, b) => Math.round((dayStart(b) - dayStart(a)) / 86400000);

// ── Cómo se celebra cada fecha ───────────────────────────────────
// `span`: días antes y después del día (en total 1 a 3).
// `theme`: qué decoración trae (art/room/celebrations.js).
// En los textos: {nombre} apodo o nombre de quien recibe, {yo} quien
// regala, {n} los años, {fecha} el nombre de una fecha "otra".
export const THEMES = {
  cumple: {
    name: 'Cumpleaños', color: '#F7A6C1', ink: '#C2456F',
    wall: 'banderines', left: 'globos', right: 'pastel', floor: 'confeti',
  },
  amor: {
    name: 'Aniversario', color: '#F48CA8', ink: '#B23A63',
    wall: 'corazones', left: 'velas', right: 'rosas', floor: 'petalos',
  },
  recuerdo: {
    name: 'Recuerdo', color: '#9CB8F2', ink: '#4A5BA8',
    wall: 'estrellas', left: 'farol', right: 'recuerdos', floor: 'destellos',
  },
};

export const CELEBRATIONS = {
  cumple: {
    theme: 'cumple', span: [1, 1],
    banner: () => 'Feliz cumple',
    // banderines: el nombre va en el cartel del medio
    title: () => '¡Feliz cumple, {nombre}!',
    lines: {
      before: ['Mañana es tu cumple… shhh, estoy preparando algo con {yo}', 'Inflé globos todo el día. ¿Para qué será? 🎈'],
      day: ['¡Feliz cumple, {nombre}! {yo} me pidió que hoy te consienta todo el día 🎂', 'Hoy es tu día. Pide un deseo… {yo} ya pidió el suyo: verte feliz'],
      after: ['Todavía queda pastel del cumple, ¿quieres?', 'Ayer fue tu cumple, pero hoy también se festeja'],
    },
  },
  aniversario: {
    theme: 'amor', span: [1, 1],
    banner: (n) => (n ? `${n} ${n === 1 ? 'año' : 'años'} juntos` : 'Feliz aniversario'),
    title: (n) => (n ? `¡${n} ${n === 1 ? 'año' : 'años'} juntos!` : '¡Feliz aniversario!'),
    lines: {
      before: ['Mañana es su aniversario. Ya tengo las velitas listas 🕯️','Mañana es un día especial para ustedes dos 💗'],
      day: ['¡Feliz aniversario! {yo} dice que eres lo mejor que le pasó', 'Hoy hace {n} años que empezó lo de ustedes. {yo} te manda un beso enorme'],
      after: ['Las velitas siguen prendidas: el aniversario dura un poquito más', 'Sigo pensando en lo lindo que fue ayer'],
    },
  },
  conocimos: {
    theme: 'recuerdo', span: [0, 1],
    banner: () => 'El día que nos conocimos',
    title: (n) => (n ? `¡Hace ${n} ${n === 1 ? 'año' : 'años'} se conocieron!` : '¡Hoy se conocieron!'),
    lines: {
      day: ['Un día como hoy {yo} te conoció. Dice que todavía se acuerda de todo ✨', 'Hoy hace {n} años que se conocieron. ¡Qué suerte que pasó!'],
      after: ['Ayer me contaron cómo se conocieron. Me encantó', 'Colgué las estrellas para que no se nos olvide ese día'],
    },
  },
  primeracita: {
    theme: 'recuerdo', span: [0, 1],
    banner: () => 'Nuestra primera cita',
    title: () => '¡Un día como hoy fue su primera cita!',
    lines: {
      day: ['Un día como hoy fue su primera cita. A {yo} todavía le dan nervios de acordarse', 'Hoy hace {n} años de su primera cita ☕'],
      after: ['¿Me cuentas otra vez cómo fue esa primera cita?'],
    },
  },
  primerbeso: {
    theme: 'amor', span: [0, 1],
    banner: () => 'Nuestro primer beso',
    title: () => '¡Un día como hoy fue su primer beso!',
    lines: {
      day: ['Un día como hoy fue su primer beso 💋 {yo} dice que se acuerda de todo', 'Hoy hace {n} años de su primer beso. ¡Qué lindo!'],
      after: ['Todavía huele a pétalos por aquí'],
    },
  },
  otra: {
    theme: 'recuerdo', span: [0, 0],
    banner: (n, label) => label || 'Un día especial',
    title: (n, label) => (label ? `¡Hoy es ${label.charAt(0).toLowerCase()}${label.slice(1)}!` : '¡Hoy es un día especial!'),
    lines: {
      day: ['Hoy es un día especial: {fecha}. {yo} quería que lo celebráramos', '{yo} me dijo que hoy no es un día cualquiera: {fecha} ✨'],
    },
  },
};

// Si dos fechas tocan el mismo día (y ninguna es hoy), gana la primera.
export const PRIORITY = ['cumple', 'aniversario', 'conocimos', 'primeracita', 'primerbeso', 'otra'];

// "Nuestra canción": solo el día mismo y si el regalo trae canciones.
const SONG_LINES = {
  cumple: '¡Hoy suena su canción! {yo} la eligió para tu cumple 🎵',
  amor: 'Hoy suena nuestra canción 🎵 ¿La ponemos?',
  recuerdo: 'Hoy suena su canción, la de ustedes dos 🎵',
};

// Una frase que no necesite los años si no se saben.
function pickLine(list, years, seed) {
  const ok = list.filter((t) => years || !t.includes('{n}'));
  const pool = ok.length ? ok : list;
  return pool[Math.abs(seed) % pool.length];
}

const hash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return h; };

/**
 * Todas las temporadas propias que tocan en `date`, la que gana primero.
 * opts: { names: { nombre, yo }, songs: n.º de canciones del regalo }
 */
export function personalSeasonsAround(profile, date = new Date(), opts = {}) {
  const list = (profile && Array.isArray(profile.dates)) ? profile.dates : [];
  const today = dayStart(date);
  const y = today.getFullYear();
  const out = [];
  list.forEach((entry, i) => {
    if (!entry) return;
    const def = CELEBRATIONS[entry.kind] || CELEBRATIONS.otra;
    const p = parseDate(entry.date);
    if (!p) return;
    const [before, after] = def.span;
    // el día puede ser del año pasado o del que viene (31 de dic. → 1 de ene.)
    for (const yy of [y - 1, y, y + 1]) {
      const occ = occurrenceOf(p, yy);
      const offset = diffDays(toDate(occ), today);   // negativo: todavía no llega
      if (offset < -before || offset > after) continue;
      const years = p.year && yy > p.year ? yy - p.year : null;
      out.push(build(entry, def, occ, offset, years, i, opts));
    }
  });
  const prio = (s) => { const k = PRIORITY.indexOf(s.kind); return k < 0 ? PRIORITY.length : k; };
  return out.sort((a, b) => (b.isDay - a.isDay) || (prio(a) - prio(b)) || (Math.abs(a.offset) - Math.abs(b.offset)) || (a.offset - b.offset));
}

function build(entry, def, occ, offset, years, i, opts) {
  const kind = CELEBRATIONS[entry.kind] ? entry.kind : 'otra';
  const theme = THEMES[def.theme];
  const label = kind === 'otra' ? String(entry.label || '').trim() : '';
  const names = opts.names || {};
  const say = (t) => fill(t, names).replace(/\{n\}/g, years || '').replace(/\{fecha\}/g, label ? label.charAt(0).toLowerCase() + label.slice(1) : 'un día especial');
  const when = offset < 0 ? 'before' : offset > 0 ? 'after' : 'day';
  const pool = def.lines[when] || def.lines.day;
  const seed = hash(`${entry.id || i}-${occ}`);
  const isDay = offset === 0;
  const songs = Number(opts.songs) || 0;
  return {
    id: `${entry.id || `${kind}${i}`}-${occ}`,
    dateId: entry.id || null,
    kind, theme: def.theme, day: occ, offset, isDay, years,
    name: theme.name,
    banner: def.banner(years, label),
    // en el cumpleaños el cartel lleva el nombre de quien recibe
    bannerName: kind === 'cumple' ? (names.nombre || '') : '',
    title: say(def.title(years, label)),
    line: say(pickLine(pool, years, seed)),
    song: isDay && songs > 0,
    songLine: isDay && songs > 0 ? say(SONG_LINES[def.theme]) : null,
    color: theme.color, ink: theme.ink,
    decor: { wall: theme.wall, left: theme.left, right: theme.right, floor: theme.floor },
  };
}

/** La temporada propia de hoy (la que gana) o null. */
export function personalSeasonNow(profile, date = new Date(), opts = {}) {
  return personalSeasonsAround(profile, date, opts)[0] || null;
}

/** Una temporada armada a mano (para el laboratorio y ?fiesta= en desarrollo). */
export function fakePersonalSeason(kind = 'cumple', date = new Date(), opts = {}) {
  const k = CELEBRATIONS[kind] ? kind : 'cumple';
  const day = keyOf(dayStart(date));
  const years = opts.years ?? (k === 'cumple' ? null : 3);
  const y = years ? Number(day.slice(0, 4)) - years : null;
  const entry = { id: `prueba-${k}`, kind: k, date: y ? `${y}${day.slice(4)}` : day.slice(5), label: opts.label };
  return personalSeasonNow({ dates: [entry] }, date, opts);
}
