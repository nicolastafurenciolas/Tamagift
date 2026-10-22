// ─────────────────────────────────────────────────────────────────
// Sucesos: cosas que pasan solas mientras juegas y te piden un gesto
// corto (ver DISENO_MUNDO_VIVO.md §3). Uno a la vez; como mucho uno cada
// pocos minutos, y siempre algo al volver después de un rato.
//
//   game.events = { active, nextAt, lastDay: { regalo, carta, visita }, bugs: { id: n } }
//   active = { id, type, until, data }
// ─────────────────────────────────────────────────────────────────

import { todayKey } from './gameState.js';
import { phaseOf } from './world.js';
import { FOODS } from './foodCatalog.js';

export const EVENT_GAP = 3.5 * 60 * 1000;         // entre un suceso y otro
export const EVENT_FIRST = 25 * 1000;             // el primero, al entrar

export const BUGS = [
  { id: 'mariposa', label: 'Mariposa rosada', when: 'dia' },
  { id: 'mariquita', label: 'Mariquita', when: 'dia' },
  { id: 'abejita', label: 'Abejita', when: 'dia' },
  { id: 'libelula', label: 'Libélula', when: 'dia' },
  { id: 'luciernaga', label: 'Luciérnaga', when: 'noche' },
  { id: 'polilla', label: 'Polilla lunar', when: 'noche' },
];

const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];

// ¿Qué toca ahora? Devuelve el suceso nuevo o null.
export function rollEvent(game, pet, { now = Date.now(), rnd = Math.random, date = new Date(now) } = {}) {
  const ev = game.events || {};
  if (ev.active) return null;
  if (ev.nextAt && now < ev.nextAt) return null;
  const today = todayKey(date);
  const last = ev.lastDay || {};
  const mk = (type, data = {}, ms = 5 * 60 * 1000) => ({ id: `${type}-${now.toString(36)}`, type, until: now + ms, data });

  // Lo diario primero: el regalo y la carta de quien regaló.
  if (last.regalo !== today) return mk('regalo', { gift: dailyGift(rnd) }, 24 * 3600 * 1000);
  const phrases = (pet.phrases || []).filter((p) => p.category === 'positiva' || p.category === 'casual');
  const photos = (pet.photos || []).filter((p) => p.url);
  if (last.carta !== today && (phrases.length || photos.length)) {
    const usePhoto = photos.length && (!phrases.length || rnd() < 0.35);
    return mk('carta', usePhoto ? { photo: pick(photos, rnd).url } : { text: pick(phrases, rnd).text }, 24 * 3600 * 1000);
  }

  const pool = [
    ['antojo', 3], ['bichito', 3], ['moneda', 2], ['hipo', 2],
    ...(last.visita !== today ? [['visita', 1.4]] : []),
  ];
  const total = pool.reduce((s, [, w]) => s + w, 0);
  let r = rnd() * total, type = pool[0][0];
  for (const [t, w] of pool) { if ((r -= w) <= 0) { type = t; break; } }
  return makeEvent(type, game, pet, { now, rnd, date });
}

// Arma un suceso de un tipo (también lo usa la página de pruebas).
export function makeEvent(type, game, pet, { now = Date.now(), rnd = Math.random, date = new Date(now) } = {}) {
  const mk = (t, data = {}, ms = 5 * 60 * 1000) => ({ id: `${t}-${now.toString(36)}`, type: t, until: now + ms, data });
  const phase = phaseOf(date);
  switch (type) {
    case 'regalo': return mk('regalo', { gift: dailyGift(rnd) }, 24 * 3600 * 1000);
    case 'carta': {
      const phrases = (pet.phrases || []).filter((p) => p.category === 'positiva' || p.category === 'casual');
      const photos = (pet.photos || []).filter((p) => p.url);
      if (!phrases.length && !photos.length) return null;
      const usePhoto = photos.length && (!phrases.length || rnd() < 0.35);
      return mk('carta', usePhoto ? { photo: pick(photos, rnd).url } : { text: pick(phrases, rnd).text }, 24 * 3600 * 1000);
    }
    case 'migas': return crumbsEvent(game.petX || 800, rnd, now);
    case 'antojo': {
      const liked = (pet.food_preferences || []).filter((f) => f.preference === 'gusta').map((f) => ({ name: f.food_name, giver: true }));
      const fridge = Object.entries(game.fridge || {}).filter(([, n]) => n > 0).map(([id]) => ({ id, name: (FOODS.find((f) => f.id === id) || {}).name }));
      const options = [...liked, ...fridge].filter((f) => f.name);
      if (!options.length) return mk('moneda', { x: spotX(game, rnd) }, 3 * 60 * 1000);
      return mk('antojo', { food: pick(options, rnd) }, 10 * 60 * 1000);
    }
    case 'bichito': {
      const bugs = BUGS.filter((b) => (phase === 'noche' ? b.when === 'noche' : b.when === 'dia'));
      return mk('bichito', { bug: pick(bugs, rnd).id, y: 70 + rnd() * 150, dir: rnd() < 0.5 ? 1 : -1 }, 40 * 1000);
    }
    case 'moneda':
      return mk('moneda', { x: spotX(game, rnd), amount: 5 + Math.floor(rnd() * 11) }, 4 * 60 * 1000);
    case 'hipo':
      return mk('hipo', { left: 3 }, 2 * 60 * 1000);
    case 'visita':
      return mk('visita', { friend: friendRecipe(rnd), gift: visitGift(rnd), line: pick(VISIT_LINES, rnd) }, 6 * 60 * 1000);
    default:
      return null;
  }
}

// Migas: después de comer, a veces caen al piso.
export function crumbsEvent(petX, rnd = Math.random, now = Date.now()) {
  const n = 3 + Math.floor(rnd() * 3);
  return { id: `migas-${now.toString(36)}`, type: 'migas', until: now + 5 * 60 * 1000, data: { crumbs: Array.from({ length: n }, (_, i) => ({ i, x: petX - 120 + rnd() * 240, y: 360 + rnd() * 50 })) } };
}

function spotX(game, rnd) {
  // al lado de algún mueble, si hay; si no, en cualquier parte del piso
  const furn = (game.placed || []).filter((p) => p.kind === 'mueble');
  if (furn.length) { const f = pick(furn, rnd); return Math.max(220, Math.min(1560, f.x + (rnd() < 0.5 ? -1 : 1) * (50 + rnd() * 40))); }
  return 260 + rnd() * 1250;
}

function dailyGift(rnd) {
  const r = rnd();
  if (r < 0.45) return { kind: 'monedas', value: 30 + Math.floor(rnd() * 5) * 10, label: 'Monedas del día' };
  if (r < 0.8) { const f = pick(FOODS, rnd); return { kind: 'comida', refId: f.id, n: 2, label: `${f.name} ×2` }; }
  return { kind: 'monedas', value: 80, label: '¡Bolsa grande de monedas!' };
}

function visitGift(rnd) {
  const f = pick(FOODS.filter((x) => x.kind === 'dulce' || x.kind === 'saludable'), rnd);
  return rnd() < 0.5 ? { kind: 'comida', refId: f.id, n: 1, label: f.name } : { kind: 'monedas', value: 25 + Math.floor(rnd() * 4) * 5, label: 'Monedas' };
}

const VISIT_LINES = [
  '¡Hola, vecina! Te traje algo rico.',
  'Pasaba por aquí y me acordé de ti.',
  '¡Qué lindo está tu cuarto!',
  'Hice galletas y te guardé un poquito.',
  '¿Jugamos después? ¡Te dejo esto!',
];

const FRIEND_PALETTES = [
  { bodyColor: '#C7E8FF', innerColor: '#FFFFFF', accentColor: '#7FA9DE' },
  { bodyColor: '#FFE58A', innerColor: '#FFF6C9', accentColor: '#FF9F43' },
  { bodyColor: '#D7F2C8', innerColor: '#F4FFEE', accentColor: '#7FB894' },
  { bodyColor: '#F3E6FF', innerColor: '#FFFFFF', accentColor: '#B8A1FF' },
  { bodyColor: '#FFD9BE', innerColor: '#FFF1E4', accentColor: '#D8697F' },
];
function friendRecipe(rnd) {
  return {
    body: pick(['alto', 'redondo', 'mochi', 'ancho'], rnd),
    ears: pick(['oso', 'conejo', 'perro', 'raton', 'hamster', 'capibara', 'pollito', 'zorro'], rnd),
    eyes: pick(['redondos', 'grandes', 'puntitos'], rnd), mouth: pick(['w', 'sonrisa', 'hocico'], rnd), cheeks: 'redondos',
    hair: rnd() < 0.4 ? pick(['flequillo', 'monitos', 'coletas'], rnd) : 'ninguno', hairColor: '#7A4E36',
    wear: rnd() < 0.6 ? { cabeza: { id: pick(['mono', 'gorro', 'boina', 'orejasOso', 'florPelo'], rnd) } } : {},
    ...pick(FRIEND_PALETTES, rnd),
  };
}

// Cerrar un suceso: queda registrado y el próximo se agenda.
export function endEvent(game, { now = Date.now(), date = new Date(now) } = {}) {
  const ev = game.events || {};
  const a = ev.active;
  const lastDay = { ...(ev.lastDay || {}) };
  if (a && ['regalo', 'carta', 'visita'].includes(a.type)) lastDay[a.type] = todayKey(date);
  return { ...game, events: { ...ev, active: null, lastDay, nextAt: now + EVENT_GAP * (0.7 + Math.random() * 0.6) } };
}

export function startEvent(game, active) {
  return { ...game, events: { ...(game.events || {}), active } };
}
