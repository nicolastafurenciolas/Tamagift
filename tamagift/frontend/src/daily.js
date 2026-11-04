// ─────────────────────────────────────────────────────────────────
// El premio de cada día: un calendario de 7 premios que avanza un
// casillero por cada día que se entra (no tienen que ser seguidos: es un
// regalo, no una obligación que castigue faltar). Aparte se cuenta la
// racha de días seguidos, que se muestra con su llamita.
//
//   game.daily = { day: 'AAAA-MM-DD' del último premio, step: 0…6, streak, best }
// ─────────────────────────────────────────────────────────────────

import { todayKey } from './gameState.js';
import { addDelivery } from './deliveries.js';

// `kind`: 'monedas' | 'comida' | 'sorpresa' (una deco que aún no tiene).
export const DAILY_REWARDS = [
  { kind: 'monedas', value: 20 },
  { kind: 'comida', refId: 'fresa', n: 2 },
  { kind: 'monedas', value: 35 },
  { kind: 'comida', refId: 'cupcake', n: 2 },
  { kind: 'monedas', value: 50 },
  { kind: 'comida', refId: 'helado', n: 2 },
  { kind: 'sorpresa', value: 120 },
];

const dayBefore = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d - 1));
};

// ¿Hay premio hoy? Y en qué casillero va.
export function dailyStatus(game, today = todayKey()) {
  const d = game.daily || {};
  const ready = d.day !== today;
  const step = d.day == null ? 0 : ready ? ((d.step ?? -1) + 1) % DAILY_REWARDS.length : d.step ?? 0;
  const streak = d.day == null ? 0 : d.day === today || d.day === dayBefore(today) ? d.streak || 1 : 0;
  return { ready, step, streak, best: d.best || 0 };
}

// Recoge el premio de hoy. `pickSurprise(game)` elige la deco sorpresa
// (o null: entonces son monedas). Devuelve { game, reward } o null.
export function claimDaily(game, today = todayKey(), pickSurprise = () => null) {
  const st = dailyStatus(game, today);
  if (!st.ready) return null;
  const d = game.daily || {};
  const streak = d.day === dayBefore(today) ? (d.streak || 1) + 1 : 1;
  const base = DAILY_REWARDS[st.step];
  let reward = { ...base };
  if (base.kind === 'sorpresa') {
    const deco = pickSurprise(game);
    reward = deco ? { kind: 'decor', refId: deco.id, label: deco.name } : { kind: 'monedas', value: base.value };
  }
  return {
    reward,
    game: { ...game, daily: { day: today, step: st.step, streak, best: Math.max(d.best || 0, streak) } },
  };
}

// Lo que el premio le hace a la partida (las monedas y la comida llegan
// al toque; la deco sorpresa, en caja a la puerta).
export function applyDailyReward(game, r) {
  if (r.kind === 'monedas') return { ...game, coins: (game.coins || 0) + r.value };
  if (r.kind === 'comida') return { ...game, fridge: { ...(game.fridge || {}), [r.refId]: ((game.fridge || {})[r.refId] || 0) + (r.n || 1) } };
  if (r.kind === 'decor') return addDelivery(game, { kind: 'decor', refId: r.refId, label: r.label });
  return game;
}
