// ─────────────────────────────────────────────────────────────────
// El cartero de lo personal (ver PLAN_REGALO_VIVO.md, reglas 2 y 6).
//
// Quien regala puede mandar veinte cosas un domingo; acá se reparten:
// como mucho BIG_PER_DAY sorpresas grandes por día (carta, paquete, voz)
// y unas pocas notas cortas que la mascota dice en una burbuja. Siempre
// una cosa a la vez: mientras haya algo nuevo esperando en el cuarto
// (`showing`), no llega lo siguiente.
//
// Las cartas con fecha van al cofre de recuerdos (cuenta regresiva; al
// llegar la fecha brilla) y las de "ábrela cuando me extrañes / si tienes
// un mal día" (payload.cuando) quedan en el cofre para abrir cuando
// quiera. Esas no esperan turno: las eligió quien regala para un día.
//
// También decide los mensajes por situación (catalog.js, SITUATIONS):
// respeta `cada`, no repite el mismo texto seguido y no dice más de
// SITUATIONS_PER_DAY por día.
//
// Todo es puro (sin React ni red): el juego guarda el resultado en
// game.personal y lo prueba engine.test.mjs.
//
//   game.personal = {
//     queue:   [item]            lo que llegó del buzón y espera turno
//     chest:   [item]            el cofre de recuerdos
//     showing: { id, kind, … }   lo que está esperando en el cuarto
//     day, big, notes            cuántas sorpresas van hoy
//     lastDropAt                 cuándo llegó la última (ms)
//     sit: { day, n, last: { [id]: día }, used: { [id]: [índices] } }
//     visit: { day, at }         la última visita (buenos días, ausencia)
//     answers: [idRespuesta]     respuestas a sus preguntas ya avisadas
//     seen: [id]                 todo lo que ya entró (para no repetir)
//   }
//   item = { id, kind, text, openAt, cuando, payload, hasAudio, hasPhoto,
//            createdAt, opened? }
// ─────────────────────────────────────────────────────────────────

import { SITUATIONS, fill } from './catalog.js';
import { todayKey } from '../gameState.js';

export const BIG_KINDS = ['carta', 'paquete', 'voz', 'respuesta'];
export const BIG_PER_DAY = 2;
export const NOTES_PER_DAY = 3;
export const SITUATIONS_PER_DAY = 2;
// Entre una entrega y la siguiente, aunque haya cupo (así no llegan dos
// seguidas al abrir el juego).
export const DROP_GAP = 90 * 1000;

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function emptyPersonal() {
  return { queue: [], chest: [], showing: null, day: null, big: 0, notes: 0, lastDropAt: 0, sit: { day: null, n: 0, last: {}, used: {} }, visit: null, answers: [], seen: [] };
}
const P = (p) => ({ ...emptyPersonal(), ...(p || {}) });

// El servidor manda las fechas en UTC sin zona ("2026-11-04T15:00:00").
export function parseServerDate(iso) {
  if (!iso) return null;
  const s = String(iso);
  const t = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);
  return Number.isFinite(t) ? t : null;
}

export function parsePayload(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { const v = JSON.parse(raw); return v && typeof v === 'object' ? v : null; } catch (e) { return null; }
}

export const isBig = (kind) => BIG_KINDS.includes(kind);

// Lo que llega del servidor, en la forma que guarda la partida (sin
// fotos ni audios: esos se piden al abrir).
export function toItem(l) {
  const payload = parsePayload(l.payload);
  return {
    id: l.id,
    kind: l.kind || 'carta',
    text: l.text || '',
    openAt: parseServerDate(l.open_at),
    locked: !!l.locked,
    cuando: (payload && payload.cuando) || null,
    payload,
    hasAudio: !!l.has_audio,
    hasPhoto: !!l.has_photo,
    createdAt: parseServerDate(l.created_at),
  };
}

// ¿Va al cofre? Las con fecha (aunque la fecha ya haya pasado mientras
// no entraba: abrirla en el cofre es parte del regalo) y las "cuando".
export const goesToChest = (it) => !!(it.openAt || it.locked || it.cuando);

// Mete lo nuevo del buzón. `letters` = lo que devolvió fetchLetters.
export function ingestLetters(personal, letters, { now = Date.now() } = {}) {
  const p = P(personal);
  const seen = new Set(p.seen.map(String));
  const queue = [...p.queue];
  const chest = [...p.chest];
  const added = { queue: 0, chest: 0 };
  for (const l of letters || []) {
    if (!l || l.id == null || seen.has(String(l.id))) continue;
    seen.add(String(l.id));
    const it = toItem(l);
    if (goesToChest(it)) { chest.push({ ...it, addedAt: now, announced: false }); added.chest += 1; }
    else { queue.push(it); added.queue += 1; }
  }
  // sin nada nuevo devuelve lo mismo (así la partida no cambia de balde)
  if (!added.queue && !added.chest) return personal || p;
  return { ...p, queue, chest, seen: [...seen].slice(-400) };
}

// Las respuestas de quien regala a sus preguntas: llegan como sorpresa
// chiquita (la mascota la cuenta), una vez cada una.
export function ingestAnswers(personal, replies) {
  const p = P(personal);
  const known = new Set(p.answers.map(String));
  const fresh = (replies || []).filter((r) => r && r.kind === 'pregunta' && r.answer && !known.has(String(r.id)));
  if (!fresh.length) return personal || p;
  const items = fresh
    .sort((a, b) => a.id - b.id)
    .map((r) => ({ id: `r${r.id}`, replyId: r.id, kind: 'answer', text: r.answer, question: r.text || '' }));
  return { ...p, queue: [...p.queue, ...items], answers: [...p.answers, ...fresh.map((r) => r.id)].slice(-200) };
}

// Los cupones que quien regala marcó como cumplidos: "¡Nico cumplió tu
// cupón!" llega como sorpresa chiquita, una vez cada uno.
export function ingestCoupons(personal, replies, profile) {
  const p = P(personal);
  const known = new Set((p.coupons || []).map(String));
  const fresh = (replies || []).filter((r) => r && r.kind === 'canje' && r.done && !known.has(String(r.id)));
  if (!fresh.length) return personal || p;
  const title = (ref) => (((profile && profile.coupons) || []).find((c) => String(c.id) === String(ref)) || {}).title || 'tu cupón';
  const items = fresh.sort((a, b) => a.id - b.id).map((r) => ({ id: `c${r.id}`, replyId: r.id, kind: 'cupon', text: title(r.ref), answer: r.answer || '' }));
  return { ...p, queue: [...p.queue, ...items], coupons: [...(p.coupons || []), ...fresh.map((r) => r.id)].slice(-200) };
}

function rollDay(p, now) {
  const day = todayKey(new Date(now));
  return p.day === day ? p : { ...p, day, big: 0, notes: 0 };
}

// ¿Qué llega ahora? Devuelve { personal, item } o null.
//   busy: hay otra cosa nueva en el cuarto (un paquete en la puerta, una
//   visita…) y lo personal espera.
export function nextDrop(personal, { now = Date.now(), busy = false, gap = DROP_GAP } = {}) {
  let p = rollDay(P(personal), now);
  if (busy || p.showing) return null;
  if (p.lastDropAt && now - p.lastDropAt < gap) return null;
  // mientras el cofre brilla no llega nada grande (un solo aviso a la
  // vez en el cuarto); lo que es solo una burbuja sí puede llegar
  const glow = !!chestReady(p, now);
  // lo que contesta a algo que hizo quien recibe (su pregunta, su cupón)
  // va primero: lo está esperando
  const reply = p.queue.findIndex((it) => it.kind === 'answer' || it.kind === 'cupon');
  const idx = reply >= 0 ? reply : p.queue.findIndex((it) => {
    if (glow && isBig(it.kind)) return false;
    if (it.kind === 'answer' || it.kind === 'cupon') return true;
    if (isBig(it.kind)) return p.big < BIG_PER_DAY;
    return p.notes < NOTES_PER_DAY;
  });
  if (idx < 0) return null;
  const item = p.queue[idx];
  const queue = p.queue.filter((_, i) => i !== idx);
  const big = isBig(item.kind);
  p = {
    ...p, queue, lastDropAt: now,
    big: p.big + (big ? 1 : 0),
    notes: p.notes + (!big && item.kind !== 'answer' && item.kind !== 'cupon' ? 1 : 0),
    // lo grande queda esperando en el cuarto hasta que lo abra
    showing: big ? { id: item.id, kind: item.kind, at: now } : null,
  };
  return { personal: p, item };
}

// Lo que estaba esperando ya se abrió (o se guardó).
export function clearShowing(personal, id) {
  const p = P(personal);
  if (!p.showing || (id != null && String(p.showing.id) !== String(id))) return p;
  return { ...p, showing: null };
}

// Lo que llegó al cofre y todavía no se contó (la mascota avisa una vez).
export function unannouncedChest(personal) {
  return P(personal).chest.find((it) => !it.announced) || null;
}
export function announceChest(personal, id) {
  const p = P(personal);
  return { ...p, chest: p.chest.map((it) => (id == null || String(it.id) === String(id) ? { ...it, announced: true } : it)) };
}
// Todas las que faltan contar (se cuentan juntas, en un solo aviso).
export const unannouncedChestAll = (personal) => P(personal).chest.filter((it) => !it.announced);

// Estado de cada cosa del cofre:
//   'locked' (falta: `left` ms) | 'ready' (llegó la fecha, sin abrir) |
//   'anytime' ("cuando me extrañes", sin abrir) | 'read' (ya leída)
export function chestState(it, now = Date.now()) {
  if (it.opened) return 'read';
  if (it.openAt && it.openAt > now) return 'locked';
  if (it.locked && !it.openAt) return 'locked';
  if (it.openAt) return 'ready';
  return 'anytime';
}

export function chestView(personal, now = Date.now()) {
  const order = { ready: 0, anytime: 1, locked: 2, read: 3 };
  return P(personal).chest
    .map((it) => ({ ...it, state: chestState(it, now), left: it.openAt ? Math.max(0, it.openAt - now) : 0 }))
    .sort((a, b) => order[a.state] - order[b.state] || (a.state === 'locked' ? a.openAt - b.openAt : a.id - b.id));
}

// La primera con fecha que ya se puede abrir: el cofre brilla.
export function chestReady(personal, now = Date.now()) {
  return P(personal).chest.find((it) => chestState(it, now) === 'ready') || null;
}

// La próxima que falta (para la cuenta regresiva del cofre).
export function chestNext(personal, now = Date.now()) {
  const locked = P(personal).chest.filter((it) => chestState(it, now) === 'locked' && it.openAt);
  return locked.sort((a, b) => a.openAt - b.openAt)[0] || null;
}

export function openChestItem(personal, id, full) {
  const p = P(personal);
  return {
    ...p,
    chest: p.chest.map((it) => (String(it.id) === String(id)
      ? { ...it, opened: true, locked: false, ...(full && full.text != null ? { text: full.text } : {}), ...(full && full.has_photo != null ? { hasPhoto: !!full.has_photo } : {}) }
      : it)),
  };
}

// "3 días", "5 h 20 min", "4 min", "12 s".
export function fmtCountdown(ms) {
  if (ms <= 0) return 'ya';
  const d = Math.floor(ms / DAY);
  if (d >= 2) return `${d} días`;
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / MIN);
  if (h >= 1) return m ? `${h} h ${m} min` : `${h} h`;
  if (m >= 1) return `${m} min`;
  return `${Math.max(1, Math.ceil(ms / 1000))} s`;
}

// Corto, para el letrerito encima del cofre: "3 d", "5 h", "12:04".
export function fmtCountdownShort(ms) {
  if (ms <= 0) return '¡ya!';
  const d = Math.floor(ms / DAY);
  if (d >= 1) return `${d} d`;
  const h = Math.floor(ms / HOUR);
  if (h >= 1) return `${h} h`;
  const m = Math.floor(ms / MIN);
  const s = Math.floor((ms % MIN) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Paquetes ─────────────────────────────────────────────────────────
// payload = { kind, refId, label?, paint?, value?, wear?, n? } (o lo
// mismo dentro de `item`). Devuelve lo que va a la caja de pedidos
// (deliveries.js) o null si no se entiende.
const PACKAGE_KINDS = ['mueble', 'decor', 'poster', 'ropa', 'pared', 'piso', 'comida', 'monedas'];
export function packageItem(payload) {
  const raw = parsePayload(payload);
  if (!raw) return null;
  const src = raw.item && typeof raw.item === 'object' ? raw.item : raw.gift && typeof raw.gift === 'object' ? raw.gift : raw;
  const kind = src.kind || src.type;
  if (!PACKAGE_KINDS.includes(kind)) return null;
  let refId = src.refId ?? src.ref ?? src.id ?? null;
  const out = { kind, label: src.label || src.name || '' };
  if (kind === 'ropa') {
    if (src.slot && refId && !String(refId).includes(':')) refId = `${src.slot}:${refId}`;
    if (!refId || !String(refId).includes(':')) return null;
    const [, wearId] = String(refId).split(':');
    out.wear = src.wear && typeof src.wear === 'object' ? src.wear : { id: wearId };
  }
  if (kind === 'pared' || kind === 'piso') {
    const value = src.value || refId;
    if (!value) return null;
    out.value = value;
    refId = refId && !String(refId).includes('.') ? refId : String(value).split('.')[0];
  }
  if (kind === 'monedas') { out.value = Math.max(1, Math.min(500, Number(src.value || src.amount || 50) || 50)); refId = refId || 'monedas'; }
  if (kind === 'comida') out.n = Math.max(1, Math.min(10, Number(src.n || 1) || 1));
  if (refId == null) return null;
  out.refId = refId;
  if (src.paint) out.paint = src.paint;
  return out;
}

// ── Mensajes por situación ──────────────────────────────────────────
const SIT = Object.fromEntries(SITUATIONS.map((s) => [s.id, s]));

function daysBetween(a, b) {
  const pa = Date.UTC(...a.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))));
  const pb = Date.UTC(...b.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))));
  return Math.round((pb - pa) / DAY);
}

export function situationTexts(profile, id) {
  const list = profile && profile.situations && profile.situations[id];
  return (Array.isArray(list) ? list : typeof list === 'string' ? [list] : []).map((t) => String(t || '').trim()).filter(Boolean);
}

// ¿Puede salir esta situación hoy? (sin elegir texto)
export function situationAllowed(personal, profile, id, { date = new Date() } = {}) {
  const p = P(personal);
  const s = SIT[id];
  if (!s || !situationTexts(profile, id).length) return false;
  const day = todayKey(date);
  const sit = p.sit || {};
  if (sit.day === day && (sit.n || 0) >= SITUATIONS_PER_DAY) return false;
  const last = (sit.last || {})[id];
  if (last && daysBetween(last, day) < (s.cada || 1)) return false;
  return true;
}

// Elige el texto (uno distinto cada vez) y lo anota. Devuelve
// { personal, text } o null. `names` = { nombre, yo } para fill().
export function situationLine(personal, profile, id, { date = new Date(), rnd = Math.random, names = {} } = {}) {
  if (!situationAllowed(personal, profile, id, { date })) return null;
  const p = P(personal);
  const texts = situationTexts(profile, id);
  const day = todayKey(date);
  const sit = { day: null, n: 0, last: {}, used: {}, ...(p.sit || {}) };
  let used = ((sit.used || {})[id] || []).filter((i) => i < texts.length);
  let options = texts.map((_, i) => i).filter((i) => !used.includes(i));
  if (!options.length) {
    // ya salieron todos: vuelve a empezar, pero sin repetir el último
    const lastIdx = used[used.length - 1];
    used = [];
    options = texts.map((_, i) => i).filter((i) => texts.length === 1 || i !== lastIdx);
  }
  const idx = options[Math.floor(rnd() * options.length) % options.length];
  const next = {
    ...p,
    sit: {
      day,
      n: (sit.day === day ? sit.n || 0 : 0) + 1,
      last: { ...(sit.last || {}), [id]: day },
      used: { ...(sit.used || {}), [id]: [...used, idx] },
    },
  };
  return { personal: next, text: fill(texts[idx], names), id };
}

// La visita de hoy: ¿es la primera del día? ¿cuántos días estuvo sin
// entrar? Se llama una vez al abrir el juego.
export function registerVisit(personal, { now = Date.now(), date = new Date(now) } = {}) {
  const p = P(personal);
  const day = todayKey(date);
  const prev = p.visit;
  const firstToday = !prev || prev.day !== day;
  const daysAway = prev && prev.day ? Math.max(0, daysBetween(prev.day, day)) : 0;
  return { personal: { ...p, visit: { day, at: now } }, firstToday, daysAway };
}

// Qué situaciones aplican ahora, en orden de prioridad.
//   session: { firstToday, daysAway, startedAt }
export function ambientSituations({ date = new Date(), weather, sad = false, session = {} } = {}) {
  const h = date.getHours();
  const out = [];
  if ((session.daysAway || 0) >= 3) out.push('ausencia');
  if (session.firstToday && h >= 5 && h < 12) out.push('buenosdias');
  if (h >= 0 && h < 5) out.push('desvelo');
  if (sad) out.push('triste');
  if (weather === 'lluvia') out.push('lluvia');
  const wd = date.getDay();
  if (wd === 1 && h >= 6) out.push('lunes');
  if (wd === 5 && h >= 6) out.push('viernes');
  return out;
}

// Lo que se ve en el archivo de cartas: lo que todavía espera turno no
// aparece (sería arruinar la sorpresa).
export function hiddenIds(personal) {
  const p = P(personal);
  return new Set(p.queue.filter((it) => it.kind !== 'answer' && it.kind !== 'cupon').map((it) => String(it.id)));
}
