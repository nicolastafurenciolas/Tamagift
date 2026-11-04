// ─────────────────────────────────────────────────────────────────
// El rincón de quien regala: qué conviene hacer ahora y qué pasó.
//
// Funciones puras (sin React ni red): reciben lo que devuelve
// fetchRincon (api.js) y el día de hoy, y deciden
//   · suggestions() → las ideas ordenadas por oportunidad; el rincón
//     muestra UNA sola (la primera que no se saltó). Ver
//     PLAN_REGALO_VIVO.md §1 regla 3.
//   · happenings()  → "lo que pasó": lo que tu pareja abrió, canjeó o
//     mandó, por día (nunca minuto a minuto: §5 privacidad).
//   · waiting()     → lo que todavía no abre (cartas en su cofre…).
//
// Una sugerencia: { id, icon, tone, kicker, title, text, cta, action, quick? }
//   action: { sheet: 'escribir'|'regalar'|'recordar'|'sobre'|'mochi', focus?, preset? }
//   quick:  texto de una nota rápida que se manda con un toque
// ─────────────────────────────────────────────────────────────────

import { DATE_KINDS, LIKES, SITUATIONS, QUICK_NOTES, callName } from './catalog.js';

const pad = (n) => String(n).padStart(2, '0');

// Día local 'AAAA-MM-DD'.
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const keyToDate = (key) => {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// Días de `a` a `b` (claves 'AAAA-MM-DD'); positivo si b es después.
export const daysBetween = (a, b) => Math.round((keyToDate(b) - keyToDate(a)) / 86400000);

// Del servidor llegan horas UTC sin zona ('2026-11-04T15:20:00').
// Devuelve el día local en que pasó.
export function dayOfIso(iso) {
  if (!iso) return null;
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? null : dayKey(d);
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const prettyDay = (key) => {
  if (!key) return '';
  const d = keyToDate(key);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};

// "hoy", "ayer", "hace 3 días", "el 2 de octubre".
export function dayLabel(key, today = dayKey()) {
  if (!key) return '';
  const n = daysBetween(key, today);
  if (n <= 0) return 'hoy';
  if (n === 1) return 'ayer';
  if (n < 7) return `hace ${n} días`;
  return `el ${prettyDay(key)}`;
}

// "mañana", "en 5 días", "el 13 de noviembre".
export function futureLabel(key, today = dayKey()) {
  const n = daysBetween(today, key);
  if (n <= 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n < 14) return `en ${n} días`;
  return `el ${prettyDay(key)}`;
}

// ── Fechas de la pareja ──────────────────────────────────────────

export const dateKindOf = (id) => DATE_KINDS.find((k) => k.id === id) || DATE_KINDS[DATE_KINDS.length - 1];
export const dateName = (d) => (d && d.kind === 'otra' && d.label ? d.label : dateKindOf(d && d.kind).label);

// Próxima vez que cae una fecha ('AAAA-MM-DD' o 'MM-DD'), desde hoy.
export function nextDate(date, today = dayKey()) {
  const m = /^(?:(\d{4})-)?(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!m) return null;
  const year = keyToDate(today).getFullYear();
  let key = `${year}-${m[2]}-${m[3]}`;
  if (daysBetween(today, key) < 0) key = `${year + 1}-${m[2]}-${m[3]}`;
  const years = m[1] ? Number(key.slice(0, 4)) - Number(m[1]) : null;
  return { key, days: daysBetween(today, key), years };
}

// Las fechas que vienen, la más cercana primero.
export function upcomingDates(profile, today = dayKey(), within = 400) {
  return ((profile && profile.dates) || [])
    .map((d) => ({ ...d, next: nextDate(d.date, today) }))
    .filter((d) => d.next && d.next.days <= within)
    .sort((a, b) => a.next.days - b.next.days);
}

// ── Lo que pasó ──────────────────────────────────────────────────

export const LETTER_NAMES = { carta: 'carta', nota: 'nota', paquete: 'paquete', voz: 'nota de voz', respuesta: 'respuesta' };
const snippet = (t, n = 46) => {
  const s = String(t || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};

export const couponTitle = (profile, ref) => {
  const c = ((profile && profile.coupons) || []).find((x) => String(x.id) === String(ref));
  return c ? c.title : 'un cupón';
};

// [{ id, day, kind, text, quote?, isNew, ref }] lo más nuevo primero.
export function happenings(r, today = dayKey()) {
  if (!r) return [];
  const out = [];
  const pendingIds = new Set(unansweredReplies(r).map((x) => x.id));
  for (const l of r.letters || []) {
    if (!l.opened_at) continue;
    const name = LETTER_NAMES[l.kind] || 'carta';
    out.push({
      id: `l${l.id}`, day: dayOfIso(l.opened_at), at: l.opened_at, kind: 'abrio',
      text: `Abrió tu ${name}`, quote: l.kind === 'voz' ? '' : snippet(l.text), ref: l,
    });
  }
  for (const x of r.replies || []) {
    const base = { id: `r${x.id}`, day: dayOfIso(x.created_at), at: x.created_at, isNew: !x.seen, ref: x };
    if (x.kind === 'canje') out.push({ ...base, kind: 'canje', text: `Canjeó «${couponTitle(r.profile, x.ref)}»`, quote: x.done ? 'Ya lo cumpliste' : 'Por cumplir', done: !!x.done });
    else if (x.kind === 'pregunta') out.push({ ...base, kind: 'pregunta', text: 'Te hizo una pregunta', quote: snippet(x.text, 60), done: !!x.answer });
    else if (x.kind === 'foto') out.push({ ...base, kind: 'foto', text: 'Te mandó una foto', quote: snippet(x.text), done: !pendingIds.has(x.id) });
    else if (x.kind === 'carta') out.push({ ...base, kind: 'carta', text: 'Te escribió', quote: snippet(x.text), done: !pendingIds.has(x.id) });
    else if (x.kind === 'meta') out.push({ ...base, kind: 'meta', text: 'Cumplió una meta', quote: snippet(x.text) });
    else if (x.kind === 'aviso') out.push({ ...base, kind: 'aviso', text: `${r.name || 'Su mascota'} te avisa`, quote: snippet(x.text, 60), done: !pendingAvisos(r).some((a) => a.id === x.id) && !!STORY_ACTIONS[x.ref] });
  }
  return out
    .filter((h) => h.day)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

// Cuándo pasó por última vez (solo el día).
export function lastSeenText(r, today = dayKey()) {
  if (!r || !r.last_seen_day) return '';
  const n = daysBetween(r.last_seen_day, today);
  if (n <= 0) return 'hoy';
  if (n === 1) return 'ayer';
  return `hace ${n} días`;
}

// Lo que todavía espera: cartas con fecha en su cofre y cosas sin abrir.
export function waiting(r, today = dayKey()) {
  const letters = (r && r.letters) || [];
  const now = Date.now();
  const locked = letters
    .filter((l) => l.open_at && new Date(/[zZ]$/.test(l.open_at) ? l.open_at : `${l.open_at}Z`).getTime() > now)
    .map((l) => ({ ...l, openDay: dayOfIso(l.open_at) }))
    .sort((a, b) => String(a.openDay).localeCompare(String(b.openDay)));
  const lockedIds = new Set(locked.map((l) => l.id));
  const unopened = letters.filter((l) => !l.opened_at && !lockedIds.has(l.id) && !letterWhen(l));
  return { locked, unopened };
}

// Cartas "cuando me extrañes" / "si tienes un mal día" (sin fecha).
export const letterWhen = (l) => {
  try { const p = l && l.payload ? JSON.parse(l.payload) : null; return (p && p.cuando) || null; } catch (e) { return null; }
};
export const letterPayload = (l) => {
  try { return l && l.payload ? JSON.parse(l.payload) : null; } catch (e) { return null; }
};

// ── Lo más oportuno ahora ────────────────────────────────────────

// Cartas suyas y fotos que todavía no respondiste (con una 'respuesta').
export function unansweredReplies(r) {
  const answered = new Set();
  for (const l of (r && r.letters) || []) {
    const p = letterPayload(l);
    if (p && p.re != null) answered.add(String(p.re));
  }
  return ((r && r.replies) || []).filter((x) => (x.kind === 'carta' || x.kind === 'foto') && !answered.has(String(x.id)) && !x.answer);
}

// ── Avisos de la mascota (historias del juego) ──────────────────
// Quien recibe vive una historia (p. ej. la mascota se resfría) y la
// mascota le avisa a quien regala con una reply kind 'aviso' y
// ref 'story:<id>'. Cada ref conocido trae su acción sugerida: una
// carta ya escrita (editable) con payload { story } que el juego
// convierte en lo que hace falta. Para sumar casos, se agrega acá.
//   n = { pet, to, nombre, yo }
export const STORY_ACTIONS = {
  'story:sopa': {
    story: 'sopa', icon: 'heart', tone: 'peach',
    kicker: (n) => `${n.pet} te avisa`,
    title: (n) => `${n.pet} se resfrió: ¿le mandas sopa?`,
    text: (n, aviso) => (aviso && aviso.text ? `«${snippet(aviso.text, 90)}»` : `Una sopita tuya y se cura. ${n.to} la recibe en la puerta.`),
    cta: 'Mandar la sopa',
    letter: (n) => ({
      kind: 'nota',
      text: `Una sopita calentita para ${n.pet}, y un abrazo para ti, ${n.nombre}. ¡Que se mejoren pronto!`,
      payload: { story: 'sopa' },
    }),
  },
};

// Avisos con acción conocida que todavía no atendiste (sin una carta
// con ese payload.story mandada después del aviso).
export function pendingAvisos(r) {
  const letters = (r && r.letters) || [];
  return ((r && r.replies) || []).filter((x) => {
    const act = x.kind === 'aviso' && STORY_ACTIONS[x.ref];
    if (!act) return false;
    return !letters.some((l) => {
      const p = letterPayload(l);
      return p && p.story === act.story && String(l.created_at) >= String(x.created_at);
    });
  });
}

export function suggestions(r, { today = dayKey(), seed = 0 } = {}) {
  if (!r) return [];
  const profile = r.profile || {};
  const to = r.recipient_name || 'tu pareja';
  const nick = callName({ recipient_name: r.recipient_name }, profile) || to;
  const pet = r.name || 'tu mascota';
  const letters = r.letters || [];
  const replies = r.replies || [];
  const out = [];

  // 0. Su mascota avisa algo (una historia del juego) y hay algo que hacer.
  const n = { pet, to, nombre: nick, yo: r.creator_name || '' };
  for (const a of pendingAvisos(r).slice(0, 1)) {
    const act = STORY_ACTIONS[a.ref];
    out.push({
      id: `aviso-${a.id}`, icon: act.icon, tone: act.tone,
      kicker: act.kicker(n), title: act.title(n), text: act.text(n, a),
      cta: act.cta, send: act.letter(n), action: { sheet: 'escribir', focus: 'carta' },
    });
  }

  // 1. Te hizo una pregunta y no la respondiste.
  const preguntas = replies.filter((x) => x.kind === 'pregunta' && !x.answer);
  if (preguntas.length) {
    const q = preguntas[preguntas.length - 1];
    out.push({
      id: `pregunta-${q.id}`, icon: 'envelope', tone: 'lavender',
      kicker: preguntas.length > 1 ? `${to} te hizo ${preguntas.length} preguntas` : `${to} te hizo una pregunta`,
      title: `«${snippet(q.text, 80)}»`,
      text: `Tu respuesta le llega a ${pet} y se la cuenta.`,
      cta: 'Responderle', action: { sheet: 'escribir', focus: 'preguntas' },
    });
  }

  // 2. Canjeó un cupón que todavía no cumpliste.
  const canjes = replies.filter((x) => x.kind === 'canje' && !x.done);
  if (canjes.length) {
    const c = canjes[canjes.length - 1];
    out.push({
      id: `canje-${c.id}`, icon: 'gift', tone: 'amber',
      kicker: `${to} canjeó un cupón`,
      title: `«${couponTitle(profile, c.ref)}»`,
      text: 'Cuéntale cuándo lo cumples y márcalo cuando esté hecho.',
      cta: 'Ver el cupón', action: { sheet: 'regalar', focus: 'cupones' },
    });
  }

  // 3. Te escribió o te mandó una foto.
  const suyas = unansweredReplies(r);
  if (suyas.length) {
    const x = suyas[0];
    out.push({
      id: `suya-${x.id}`, icon: x.kind === 'foto' ? 'camera' : 'envelope', tone: 'rose',
      kicker: x.kind === 'foto' ? `${to} te mandó una foto` : `${to} te escribió`,
      title: x.text ? `«${snippet(x.text, 80)}»` : (x.kind === 'foto' ? 'Mírala y respóndele' : '¿Le respondes?'),
      text: `Tu respuesta le llega en una cajita a la puerta del cuarto de ${pet}.`,
      cta: 'Responderle', action: { sheet: 'escribir', focus: 'carta', preset: { replyTo: x.id } },
    });
  }

  const sentDays = letters.map((l) => dayOfIso(l.created_at)).filter(Boolean).sort();
  const lastSent = sentDays[sentDays.length - 1] || null;
  const sinceSent = lastSent ? daysBetween(lastSent, today) : null;

  // 4. Abrió tu carta hace poco y no le mandaste nada después.
  const opened = letters
    .filter((l) => l.opened_at && l.kind !== 'respuesta')
    .sort((a, b) => String(b.opened_at).localeCompare(String(a.opened_at)))[0];
  if (opened) {
    const day = dayOfIso(opened.opened_at);
    const fresh = daysBetween(day, today) <= 2;
    const after = letters.some((l) => String(l.created_at) > String(opened.opened_at));
    if (fresh && !after) {
      const name = LETTER_NAMES[opened.kind] || 'carta';
      out.push({
        id: `abrio-${opened.id}`, icon: 'heart', tone: 'rose',
        kicker: `${to} abrió tu ${name} ${dayLabel(day, today)}`,
        title: '¿Le respondes?',
        text: opened.text && opened.kind !== 'voz' ? `«${snippet(opened.text, 60)}»` : `Una nota corta mantiene viva la conversación.`,
        cta: 'Escribirle', action: { sheet: 'escribir', focus: 'carta' },
      });
    }
  }

  // 5. Se acerca una de sus fechas y no hay nada preparado.
  const soon = upcomingDates(profile, today, 21).find((d) => !letters.some((l) => l.open_at && dayOfIso(l.open_at) === d.next.key));
  if (soon) {
    const n = soon.next.days;
    const name = dateName(soon).replace(/^Su |^Nuestro |^Nuestra |^El |^La /, (m) => m.toLowerCase());
    out.push({
      id: `fecha-${soon.id}-${soon.next.key}`, icon: 'sparkle', tone: 'amber',
      kicker: n === 0 ? `Hoy es ${name}` : n === 1 ? `Mañana es ${name}` : `Faltan ${n} días para ${name}`,
      title: n === 0 ? 'Mándale algo para que lo encuentre hoy' : '¿Preparamos algo?',
      text: n === 0 ? 'Una nota rápida le llega hoy mismo.' : `Escríbele una carta que se abra ese día: queda en el cofre de ${pet}, con cuenta regresiva.`,
      cta: n === 0 ? 'Escribirle ahora' : 'Escribir la carta',
      action: { sheet: 'escribir', focus: 'carta', preset: n === 0 ? {} : { when: 'fecha', date: soon.next.key, occasion: soon.kind } },
    });
  }

  // 6. Nunca le mandaste nada (regalo recién hecho).
  if (!letters.length) {
    out.push({
      id: 'primera', icon: 'envelope', tone: 'rose',
      kicker: `El regalo ya es de ${to}`,
      title: 'Escríbele la primera carta',
      text: `Le llega en una cajita a la puerta del cuarto de ${pet}. Suena el timbre y la abre.`,
      cta: 'Escribirle', action: { sheet: 'escribir', focus: 'carta' },
    });
  }

  // 7. Hace días que no le mandas nada.
  if (sinceSent != null && sinceSent >= 4) {
    const note = QUICK_NOTES[(seed + sinceSent) % QUICK_NOTES.length];
    out.push({
      id: `silencio-${today}`, icon: 'heart', tone: 'rose',
      kicker: `Hace ${sinceSent} días que no le mandas nada`,
      title: 'Una nota rápida toma un minuto',
      text: `Toca y le llega: «${note}»`,
      cta: 'Mandar esta nota', quick: note, action: { sheet: 'escribir', focus: 'rapida' },
    });
  }

  // 8. Sin fechas: el cumpleaños es lo primero.
  if (!(profile.dates || []).length) {
    out.push({
      id: 'sin-fechas', icon: 'sparkle', tone: 'amber',
      kicker: 'Sus fechas',
      title: `¿Cuándo es el cumpleaños de ${nick}?`,
      text: `Con sus fechas, ${pet} prepara el cuarto y te avisamos unos días antes.`,
      cta: 'Agregar fechas', action: { sheet: 'recordar', focus: 'fechas' },
    });
  }

  // 9. La ficha de gustos está casi vacía.
  const likes = profile.likes || {};
  const filled = LIKES.filter((l) => String(likes[l.id] || '').trim()).length;
  const missing = LIKES.find((l) => !String(likes[l.id] || '').trim());
  if (missing && filled < 6) {
    out.push({
      id: `gusto-${missing.id}`, icon: 'heart', tone: 'sage',
      kicker: 'Cuéntale al juego un gusto más',
      title: `¿${missing.label}?`,
      text: `${pet} lo usa para hablarle y sorprender a ${nick}. Ya sabe ${filled} de ${LIKES.length}.`,
      cta: 'Contarle', action: { sheet: 'sobre', focus: missing.id },
    });
  }

  // 10. Pocos mensajes por situación.
  const sits = profile.situations || {};
  const withMsgs = SITUATIONS.filter((s) => (sits[s.id] || []).some((t) => String(t).trim()));
  const nextSit = SITUATIONS.find((s) => !(sits[s.id] || []).some((t) => String(t).trim()));
  if (nextSit && withMsgs.length < 5) {
    out.push({
      id: `situacion-${nextSit.id}`, icon: 'paw', tone: 'sky',
      kicker: 'Mensajes por situación',
      title: `${nextSit.label}, ${pet} puede decirle algo de tu parte`,
      text: nextSit.when + '. Ya viene una idea escrita.',
      cta: 'Elegir el mensaje', action: { sheet: 'escribir', focus: 'situaciones', preset: { situation: nextSit.id } },
    });
  }

  // 11. Sin cupones de amor.
  if (!(profile.coupons || []).length) {
    out.push({
      id: 'sin-cupones', icon: 'gift', tone: 'amber',
      kicker: 'Cupones de amor',
      title: '«Vale por una cena», «vale por un masaje»…',
      text: `${nick} junta estrellas jugando y los canjea. Tú ves cuándo.`,
      cta: 'Crear cupones', action: { sheet: 'regalar', focus: 'cupones' },
    });
  }

  // 12. Siempre hay algo: una nota rápida o un paquete.
  const note = QUICK_NOTES[(seed + daysBetween('2024-01-01', today)) % QUICK_NOTES.length];
  out.push({
    id: `nota-${today}`, icon: 'envelope', tone: 'rose',
    kicker: 'Hoy podrías…',
    title: 'Mandarle una nota rápida',
    text: `Un toque y le llega: «${note}»`,
    cta: 'Mandar esta nota', quick: note, action: { sheet: 'escribir', focus: 'rapida' },
  });
  out.push({
    id: `paquete-${today}`, icon: 'gift', tone: 'sage',
    kicker: 'Hoy podrías…',
    title: `Mandarle un paquete a ${pet}`,
    text: 'Un mueble, un adorno o algo de ropa, con una nota tuya.',
    cta: 'Elegir el regalo', action: { sheet: 'regalar', focus: 'paquete' },
  });

  return out;
}

export const suggestNow = (r, opts) => suggestions(r, opts)[0] || null;
