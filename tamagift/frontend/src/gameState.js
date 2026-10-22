// ─────────────────────────────────────────────────────────────────
// Estado de juego persistente POR MASCOTA (slug), guardado en el
// dispositivo de quien juega (localStorage). A propósito separado de
// la config de la mascota (nombre, dibujos, comidas...) que viene del
// backend: monedas, qué se ha comprado y cómo quedó decorado el cuarto
// es del dispositivo de la pareja, no algo que el backend necesite.
// ─────────────────────────────────────────────────────────────────

const KEY = (slug) => `tamagift:gamestate:${slug}`;

// Medidas del cuarto, en unidades del mundo. Es ancho a propósito: la
// mascota camina por él y la cámara la sigue, así que hay sitio de
// sobra para pósters, muebles y decoración sin amontonar nada.
export const ROOM = {
  W: 1600,          // ancho total del cuarto
  H: 430,           // alto total
  FLOOR_Y: 320,     // dónde empieza el piso
  WALL_PAD: 40,     // margen donde no se cuelgan pósters
  PET_W: 200,       // tamaño de la mascota en unidades del mundo
};

// Versión actual del gameState. Súbela cada vez que agregues una
// migración nueva a MIGRATIONS (ver abajo) — así una partida guardada
// con una versión vieja se pone al día sola, sin importar cuánto tiempo
// haya pasado ni cuántas migraciones le falten por aplicar.
export const CURRENT_GAME_VERSION = 1;

export const DEFAULT_GAME_STATE = {
  version: CURRENT_GAME_VERSION,
  coins: 0,
  ownedDecor: [],       // ids del catálogo fijo de decoración
  ownedPosters: [],     // ids ESTABLES (Photo.id del backend) de pósters comprados
  ownedOutfits: [],     // ids ESTABLES (Outfit.id del backend) de las prendas que se poseen
  ownedFurniture: [],   // ids de muebles comprados
  furniturePaint: {},   // { [idMueble]: idColorFURNITURE_PAINTS }, elegido antes de comprar
  posterPaint: {},      // { [idPóster]: idColorFURNITURE_PAINTS } del marco
  ownedWalls: ['liso'],    // diseños de pared comprados (el color se elige gratis)
  ownedFloors: ['tablas'],
  equippedOutfit: null, // id ESTABLE de la prenda puesta, o null
  ownedAcc: [],         // accesorios de la mochi comprados en la tienda
  wearing: {},          // { headAcc, neckAcc, extraAcc, accColor } puestos
  wall: 'liso.crema',      // "diseño.color" (los ids viejos se siguen entendiendo)
  floor: 'tablas.miel',
  // Todo lo que está puesto en el cuarto, con su posición libre.
  // { key, kind: 'mueble'|'decor'|'poster', refId, x, y, scale, flip, paint }
  placed: [],
  petX: ROOM.W / 2,
  // ── Minijuegos ──────────────────────────────────────────────────
  // Récord por juego: { [gameId]: mejorPuntaje }. Es LO que hace que
  // valga la pena volver a jugar — sin un número propio que superar,
  // una partida más da igual.
  records: {},
  // Última fecha (YYYY-MM-DD local) en que se jugó cada juego, para el
  // bonus diario: { [gameId]: '2026-08-04' }.
  lastPlayedDay: {},
  // Racha de días seguidos entrando a jugar.
  streak: 0,
  lastStreakDay: null,
  // Partidas de hoy por juego ({ [gameId]: { day, n } }): repetir el
  // mismo juego muchas veces el mismo día paga menos.
  playsToday: {},
  // ── Estado de la mascota en este dispositivo ───────────────────
  // Hambre y amor con la hora del último cálculo. Antes no se guardaban:
  // al recargar volvían a los valores del servidor (el amor siempre en
  // 60) y lo ganado bañándola o jugando se perdía.
  vitals: null,          // { hunger, love, hungerAt, loveAt, mood }
  lastBathCoinsAt: 0,    // el baño paga monedas como mucho cada 30 min
  // Estilo visual elegido por quien recibe (si no, el de quien regaló).
  style: null,
};

// Cuántas partidas de `gameId` van hoy (antes de esta).
export function playsTodayFor(state, gameId) {
  const e = (state.playsToday || {})[gameId];
  return e && e.day === todayKey() ? e.n : 0;
}

// ── Minijuegos: récords, bonus diario y racha ───────────────────────

// Fecha local en formato YYYY-MM-DD. Local a propósito, no UTC: el
// "día" tiene que coincidir con el día de quien juega, no con Greenwich.
export function todayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Multiplicador de la PRIMERA partida de cada juego cada día.
export const DAILY_BONUS_MULTIPLIER = 2;

// ¿Esta partida cuenta como la primera del día para este juego?
export function isDailyBonusReady(state, gameId) {
  return (state.lastPlayedDay || {})[gameId] !== todayKey();
}

// Algunos juegos se ganan con MENOS (movimientos), no con más.
export const LOWER_IS_BETTER = new Set(['memoria', 'rompecabezas']);

export function isNewRecord(state, gameId, score) {
  const prev = (state.records || {})[gameId];
  if (prev == null) return true;
  return LOWER_IS_BETTER.has(gameId) ? score < prev : score > prev;
}

// Devuelve el estado actualizado tras jugar: récord, día jugado y racha.
// No toca monedas — de eso se encarga quien llama (awardCoins).
export function registerPlay(state, gameId, score) {
  const today = todayKey();
  const records = { ...(state.records || {}) };
  if (isNewRecord(state, gameId, score)) records[gameId] = score;

  const lastPlayedDay = { ...(state.lastPlayedDay || {}), [gameId]: today };
  const playsToday = { ...(state.playsToday || {}), [gameId]: { day: today, n: playsTodayFor(state, gameId) + 1 } };

  // Racha: sube si el último día jugado fue ayer, se reinicia si se
  // saltó uno o más días, y no hace nada si ya se jugó hoy.
  let { streak = 0, lastStreakDay = null } = state;
  if (lastStreakDay !== today) {
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    streak = lastStreakDay === yesterday ? streak + 1 : 1;
    lastStreakDay = today;
  }

  return { ...state, records, lastPlayedDay, playsToday, streak, lastStreakDay };
}

// ── Migraciones ─────────────────────────────────────────────────────
// Cada entrada convierte de la versión N a la N+1. Una partida guardada
// SIEMPRE se migra desde su `version` (o 0 si nunca tuvo una) hasta
// CURRENT_GAME_VERSION, aplicando cada paso en orden — así agregar
// contenido nuevo (minijuegos, muebles, estilos) nunca exige tocar esto,
// y sólo hace falta un paso nuevo cuando el FORMATO de los datos guardados
// cambia de verdad (como cuando `placedDecor` se reemplazó por `placed`).
const MIGRATIONS = {
  // 0 → 1: versiones viejas guardaban `placedDecor` (una lista de ids sin
  // posición, apilados en una esquina). Se convierte a objetos colocados
  // para que nadie pierda lo que ya había comprado.
  0: (state) => {
    if (Array.isArray(state.placedDecor) && state.placedDecor.length && !state.placed?.length) {
      state.placed = state.placedDecor.map((id, i) => ({
        key: `mig-${id}-${i}`,
        kind: 'decor',
        refId: id,
        x: 300 + i * 150,
        y: ROOM.FLOOR_Y - 60,
        scale: 1,
        flip: 1,
      }));
    }
    delete state.placedDecor;
    return state;
  },
};

function migrate(state) {
  let v = state.version || 0;
  while (v < CURRENT_GAME_VERSION && MIGRATIONS[v]) {
    state = MIGRATIONS[v](state);
    v += 1;
  }
  state.version = CURRENT_GAME_VERSION;
  return state;
}

export function loadGameState(slug) {
  try {
    const raw = localStorage.getItem(KEY(slug));
    if (!raw) return { ...DEFAULT_GAME_STATE, placed: [] };
    return migrate({ ...DEFAULT_GAME_STATE, ...JSON.parse(raw) });
  } catch (e) {
    return { ...DEFAULT_GAME_STATE, placed: [] };
  }
}

export function saveGameState(slug, state) {
  try {
    localStorage.setItem(KEY(slug), JSON.stringify(state));
  } catch (e) {
    // localStorage lleno o bloqueado — el progreso de monedas no es crítico,
    // seguimos sin romper el juego.
  }
}

let placeSeq = 0;
export function newPlacementKey(prefix = 'p') {
  placeSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${placeSeq}`;
}
