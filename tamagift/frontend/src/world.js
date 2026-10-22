// ─────────────────────────────────────────────────────────────────
// El mundo vivo: la hora, el clima, las necesidades de la mochi y lo que
// le hace cada cosa (ver DISENO_MUNDO_VIVO.md §3). Todo es lógica pura,
// sin React, para poder probarlo.
// ─────────────────────────────────────────────────────────────────

import { todayKey } from './gameState.js';
import { FOOD_KINDS, foodKindOf, findFood } from './foodCatalog.js';

// ── Hora del día (la del teléfono) ──────────────────────────────────
export const PHASES = {
  manana: { label: 'Mañana', tint: 'rgba(255,214,170,0.10)', dark: 0 },
  dia: { label: 'Día', tint: null, dark: 0 },
  tarde: { label: 'Atardecer', tint: 'rgba(255,140,110,0.20)', dark: 0.12 },
  // de noche con la luz prendida el cuarto está iluminado (luz cálida);
  // lo oscuro de verdad es al apagarla
  noche: { label: 'Noche', tint: 'rgba(255,196,140,0.16)', dark: 0.16 },
};
export function phaseOf(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 6 && h < 11) return 'manana';
  if (h >= 11 && h < 17.5) return 'dia';
  if (h >= 17.5 && h < 19.5) return 'tarde';
  return 'noche';
}
export const isBedtime = (date = new Date()) => { const h = date.getHours(); return h >= 22 || h < 6; };

// ── Clima: uno por día, igual todo el día ───────────────────────────
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
export function weatherOf(date = new Date(), seed = '') {
  const r = hash(`${todayKey(date)}:${seed}`);
  const m = date.getMonth();
  const winter = m === 11 || m === 0;
  if (winter && r < 0.3) return 'nieve';
  if (r < 0.62) return 'sol';
  if (r < 0.82) return 'nublado';
  return 'lluvia';
}
export const WEATHER_LABEL = { sol: 'Soleado', nublado: 'Nublado', lluvia: 'Lluvia', nieve: 'Nieve' };

// ── Necesidades ─────────────────────────────────────────────────────
// Cuánto tarda en bajar UN punto (ms). Hambre y amor ya existían.
export const RATE = {
  hunger: 50 * 1000,
  love: 100 * 1000,
  energy: 150 * 1000,       // ~4 h despierta de 100 a 0
  clean: 140 * 1000,        // ~4 h de 100 a 0
  weight: 60 * 60 * 1000,   // el peso baja 1 punto por hora solo
  sleepGain: 18 * 1000,     // durmiendo, la energía SUBE 1 punto cada 18 s
};
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export function defaultVitals(now = Date.now(), base = {}) {
  return {
    hunger: base.hunger ?? 60, love: base.love ?? 60, mood: base.mood ?? 'normal',
    energy: 80, clean: 85, weight: 0, asleep: false,
    hungerAt: now, loveAt: now, energyAt: now, cleanAt: now, weightAt: now,
  };
}

// Aplica el tiempo que pasó. Las partidas viejas no tienen energía,
// limpieza ni peso: se completan con valores por defecto.
export function tickVitals(v0, now = Date.now()) {
  const v = { ...defaultVitals(now), ...v0 };
  const steps = (field, rate) => Math.max(0, Math.floor((now - v[`${field}At`]) / rate));
  const out = { ...v };
  const dec = (field, rate) => {
    const n = steps(field, rate);
    out[field] = clamp(v[field] - n, field === 'weight' ? 0 : 0, 100);
    out[`${field}At`] = v[`${field}At`] + n * rate;
  };
  dec('hunger', RATE.hunger);
  dec('love', RATE.love);
  dec('clean', RATE.clean);
  dec('weight', RATE.weight);
  if (v.asleep) {
    const n = steps('energy', RATE.sleepGain);
    out.energy = clamp(v.energy + n);
    out.energyAt = v.energyAt + n * RATE.sleepGain;
  } else dec('energy', RATE.energy);
  return out;
}

// ── Comer ───────────────────────────────────────────────────────────
// Qué le hace una comida: por su tipo (catálogo o nombre) y por si le
// gusta. Devuelve los cambios a sumar.
export function foodEffect(food) {
  const id = food.id || null;
  const kind = (id && findFood(id) && findFood(id).kind) || food.kind || foodKindOf(food.food_name || food.name || '');
  const k = FOOD_KINDS[kind] || FOOD_KINDS.casera;
  const pref = food.preference;
  return {
    kind,
    hunger: pref === 'no_gusta' ? Math.round(k.hunger * 0.4) : k.hunger,
    weight: k.weight,
    energy: k.energy,
    love: pref === 'gusta' ? k.love + 2 : k.love,
    clean: -2,
  };
}
export function applyEffect(v, e, now = Date.now()) {
  const out = { ...v };
  for (const f of ['hunger', 'love', 'energy', 'clean', 'weight']) {
    if (!e[f]) continue;
    const was = out[f] ?? 0;
    out[f] = clamp(was + e[f]);
    // si estaba en 0 y sube, el reloj de bajada empieza de nuevo
    if (e[f] > 0 && was <= 0) out[`${f}At`] = now;
  }
  return out;
}

// Mensajes cariñosos según cómo come (nunca burlones).
export function weightNote(v) {
  if (v.weight >= 70) return 'Uy, estoy redondita… ¿hoy comemos frutas y jugamos un rato?';
  if (v.weight >= 45) return 'Me siento un poquito pesada, ¿algo más sano?';
  return null;
}

// ── Ánimo que sale de todo ──────────────────────────────────────────
export function moodFrom(v, base = 'normal') {
  if (v.asleep) return 'dormido';
  if (v.hunger < 15 || v.energy < 10) return 'enojado';
  if (v.love < 20 || v.clean < 15) return 'triste';
  return base;
}
