// ─────────────────────────────────────────────────────────────────
// El frasco de estrellas y la meta de los dos (PLAN_REGALO_VIVO.md §2,
// etapa 5).
//
// Quien recibe junta estrellas jugando y cuidando a su mascota, y las
// canjea por los cupones de amor que puso quien regala (profile.coupons).
// El ritmo está pensado para que un cupón de 30 estrellas tome unos
// cuatro o cinco días de jugar un rato, no meses: como mucho
// STARS_PER_DAY por día, y cada fuente tiene su tope (así no se farmea
// repitiendo un solo juego).
//
// La meta de los dos: cada semana, una cosa para cada uno ("cuida a
// Mochi 5 días" + "que Nico te mande 3 cosas"). Al cumplirse las dos
// llega un objeto especial "de los dos" y quien regala se entera.
//
// Todo es puro (game.jar) y lo prueba jar.test.mjs.
//
//   game.jar = {
//     stars, total                 las que hay / todas las que juntó
//     day, today, by: { razón: n } lo ganado hoy (para los topes)
//     pending: [{ couponId, replyId, at }]   canjes esperando a quien regala
//     week: { key, mine: { kind, n }, theirs: n, careDays, playDays,
//             sent, rewarded, rewardId }
//   }
// ─────────────────────────────────────────────────────────────────

import { todayKey } from '../gameState.js';

export const STARS_PER_DAY = 8;
// tope por día de cada fuente
export const REASON_CAP = { nivel: 6, cuidar: 3, premio: 2, historia: 2 };
export const DEFAULT_TARGET = 30;

export function emptyJar() {
  return { stars: 0, total: 0, day: null, today: 0, by: {}, pending: [], week: null };
}
const J = (j) => ({ ...emptyJar(), ...(j || {}) });

function rollDay(j, date) {
  const day = todayKey(date);
  return j.day === day ? j : { ...j, day, today: 0, by: {} };
}

// Suma estrellas respetando los topes. Devuelve { jar, got }.
export function earnStars(jar, n, reason = 'nivel', { date = new Date() } = {}) {
  let j = rollDay(J(jar), date);
  const want = Math.max(0, Math.floor(n || 0));
  const capReason = REASON_CAP[reason] ?? 2;
  const got = Math.max(0, Math.min(want, capReason - (j.by[reason] || 0), STARS_PER_DAY - j.today));
  if (!got) return { jar: j, got: 0 };
  j = { ...j, stars: j.stars + got, total: j.total + got, today: j.today + got, by: { ...j.by, [reason]: (j.by[reason] || 0) + got } };
  return { jar: j, got };
}

// Cuánto se ve lleno el frasco (0..1): respecto del cupón más caro (o 30
// si todavía no hay cupones).
export function jarFill(jar, coupons) {
  const costs = (coupons || []).map((c) => Number(c.stars) || 0).filter((x) => x > 0);
  const target = costs.length ? Math.max(10, Math.min(60, Math.max(...costs))) : DEFAULT_TARGET;
  return Math.max(0, Math.min(1, J(jar).stars / target));
}

export const couponCost = (c) => Math.max(1, Number(c && c.stars) || 1);
export const isPending = (jar, couponId) => J(jar).pending.some((p) => String(p.couponId) === String(couponId));
export const canRedeem = (jar, c) => !!c && J(jar).stars >= couponCost(c) && !isPending(jar, c.id);

// Canjeado (después de que el servidor lo recibió).
export function redeem(jar, c, replyId, { now = Date.now() } = {}) {
  const j = J(jar);
  if (!canRedeem(j, c)) return j;
  return { ...j, stars: j.stars - couponCost(c), pending: [...j.pending, { couponId: c.id, replyId, at: now }] };
}

// Lo que quien regala ya cumplió deja de estar esperando.
export function syncPending(jar, replies) {
  const j = J(jar);
  if (!j.pending.length || !replies) return jar || j;
  const done = new Set(replies.filter((r) => r.kind === 'canje' && r.done).map((r) => String(r.id)));
  const pending = j.pending.filter((p) => !done.has(String(p.replyId)));
  return pending.length === j.pending.length ? jar || j : { ...j, pending };
}

// ── La meta de los dos ──────────────────────────────────────────────
// La semana empieza el lunes.
export function weekKey(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return todayKey(d);
}
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

const MINE = [
  { kind: 'cuidar', n: 5, text: 'Cuida a {pet} 5 días' },
  { kind: 'jugar', n: 4, text: 'Juega con {pet} 4 días' },
  { kind: 'cuidar', n: 4, text: 'Cuida a {pet} 4 días' },
];
const THEIRS = [3, 2, 3];

// Los regalos "de los dos" (decoración del catálogo, de a uno por meta).
export const DUO_REWARDS = ['proyector', 'polaroids', 'lunaLampara', 'rosas', 'tetera', 'picnic', 'osito', 'joyero'];

// La meta de esta semana (la arma si es una semana nueva).
export function ensureWeek(jar, { date = new Date() } = {}) {
  const j = J(jar);
  const key = weekKey(date);
  if (j.week && j.week.key === key) return j;
  const h = hash(key);
  const m = MINE[h % MINE.length];
  return { ...j, week: { key, mine: { kind: m.kind, n: m.n }, theirs: THEIRS[(h >> 3) % THEIRS.length], careDays: [], playDays: [], sent: 0, rewarded: false, rewardId: null } };
}

// Hoy cuidó (comer, bañar, jugar) o jugó.
export function markCare(jar, kind, { date = new Date() } = {}) {
  const j = ensureWeek(jar, { date });
  const day = todayKey(date);
  const care = j.week.careDays.includes(day);
  const play = kind !== 'jugar' || j.week.playDays.includes(day);
  if (care && play) return j;
  return {
    ...j,
    week: { ...j.week, careDays: care ? j.week.careDays : [...j.week.careDays, day], playDays: play ? j.week.playDays : [...j.week.playDays, day] },
  };
}

// Quien regala mandó cosas (las cuenta al llegar al buzón, aunque el
// cartero las entregue de a poco). `createdAt` en ms.
export function noteGiverSent(jar, createdAts, { date = new Date() } = {}) {
  let j = ensureWeek(jar, { date });
  const start = new Date(`${j.week.key}T00:00:00`).getTime();
  const n = (createdAts || []).filter((t) => t && t >= start).length;
  if (!n) return j;
  j = { ...j, week: { ...j.week, sent: j.week.sent + n } };
  return j;
}

export function goalStatus(jar, { petName = 'tu mascota', giverName = 'quien te regaló esto' } = {}) {
  const w = J(jar).week;
  if (!w) return null;
  const m = MINE.find((x) => x.kind === w.mine.kind && x.n === w.mine.n) || MINE[0];
  const mineHave = Math.min(w.mine.n, (w.mine.kind === 'jugar' ? w.playDays : w.careDays).length);
  const theirsHave = Math.min(w.theirs, w.sent);
  return {
    mine: { text: m.text.replace('{pet}', petName), have: mineHave, need: w.mine.n },
    theirs: { text: `Que ${giverName} te mande ${w.theirs} cosas`, have: theirsHave, need: w.theirs },
    complete: mineHave >= w.mine.n && theirsHave >= w.theirs,
    rewarded: !!w.rewarded,
    rewardId: w.rewardId,
  };
}

// Se cumplió y todavía no llegó el premio: elige el regalo de los dos.
export function claimGoal(jar, owned = []) {
  const j = J(jar);
  const st = goalStatus(j);
  if (!st || !st.complete || st.rewarded) return null;
  const ownedSet = new Set((owned || []).map(String));
  const start = hash(j.week.key) % DUO_REWARDS.length;
  let rewardId = null;
  for (let i = 0; i < DUO_REWARDS.length; i++) {
    const id = DUO_REWARDS[(start + i) % DUO_REWARDS.length];
    if (!ownedSet.has(id)) { rewardId = id; break; }
  }
  return { jar: { ...j, week: { ...j.week, rewarded: true, rewardId } }, rewardId };
}
