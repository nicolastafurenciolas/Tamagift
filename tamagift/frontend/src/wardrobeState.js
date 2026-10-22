// ─────────────────────────────────────────────────────────────────
// El vestidor en la partida: qué tiene, qué lleva puesto, su peinado y
// cuán redondita está. Todo vive en el estado de juego (gameState.js);
// acá están las reglas.
//
//   game.ownedWear   ['ropa:sueter', 'cabeza:mono', …]   comprado en Moda
//   game.wear        { cabeza: { id, c1, c2 }, … }        puesto ahora
//                    ({ id: 'ninguno' } = se lo quitó, aunque la receta
//                    de quien regaló lo traiga)
//   game.ownedHair   ['coletas', …]                        de la peluquería
//   game.ownedHairColors ['#FF9EC4', …]                    tintes de fantasía
//   game.look        { hair, hairColor, brows }            su peinado actual
// ─────────────────────────────────────────────────────────────────

import { WARDROBE, findWearable, resolveWear, HAIRSTYLES, HAIR_COLORS, BROWS } from './art/mochi/index.js';

// Lo que tiene desde el primer día (además de lo que traiga su diseño):
// un básico por ranura para que pueda jugar a vestirla desde el comienzo.
export const STARTER_WEAR = ['cabeza:mono', 'cabeza:diadema', 'cara:lentes', 'cuello:collar', 'cuello:panuelo', 'ropa:camiseta', 'mano:globo'];

// Colores de tela y metales para teñir lo que se compra.
export const FABRIC_COLORS = [
  '#FFFFFF', '#F4EDE4', '#FFB6CC', '#FF6F91', '#E8505E', '#8E1F2C', '#F28C38', '#FFD45C',
  '#8ED07A', '#3E8A57', '#8FD3F5', '#5B7BD9', '#2E4A8A', '#C9A6FF', '#8E6FE0', '#A9744F',
  '#5A5068', '#2A2230', '#FFD166', '#DCE1EA',
];

export const HAIR_PRICE = 150;
export const HAIR_COLOR_PRICE = 60;
export const FREE_HAIR_COLORS = HAIR_COLORS.slice(0, 8);   // los naturales
export { WARDROBE, HAIRSTYLES, HAIR_COLORS, BROWS };

const key = (slot, id) => `${slot}:${id}`;

// ¿Lo tiene? (comprado, del kit inicial o porque venía en su diseño)
export function ownsWear(game, baseRecipe, slot, id) {
  if (STARTER_WEAR.includes(key(slot, id))) return true;
  if ((game.ownedWear || []).includes(key(slot, id))) return true;
  const fromGift = baseRecipe ? resolveWear(baseRecipe)[slot] : null;
  return !!(fromGift && fromGift.id === id);
}

// Lo que tiene de una ranura, con lo de su diseño primero.
export function ownedInSlot(game, baseRecipe, slot) {
  return WARDROBE.filter((w) => w.slot === slot && ownsWear(game, baseRecipe, slot, w.id));
}

// Lo que lleva puesto ahora en cada ranura: su diseño + lo que cambió.
export function wornNow(game, baseRecipe) {
  return resolveWear({ ...(baseRecipe || {}), wear: { ...((baseRecipe && baseRecipe.wear) || {}), ...(game.wear || {}) } });
}

export const ownsHair = (game, baseRecipe, id) => id === 'ninguno' || (baseRecipe && baseRecipe.hair === id) || (game.ownedHair || []).includes(id);
export const ownsHairColor = (game, baseRecipe, c) => FREE_HAIR_COLORS.includes(c) || (baseRecipe && baseRecipe.hairColor === c) || (game.ownedHairColors || []).includes(c);

// Peso → redondez del cuerpo (ver DISENO_MUNDO_VIVO.md §3). Hasta 25 de
// peso no se nota; desde ahí se redondea de a poco hasta el máximo.
export function chubOf(weight) {
  const w = Number(weight) || 0;
  return w <= 25 ? 0 : Math.min(1, (w - 25) / 60);
}

// La receta como se ve hoy: la de su diseño + ropa, peinado y redondez.
export function applyLook(recipe, game) {
  if (!recipe || !game) return recipe;
  const look = game.look || {};
  const out = { ...recipe, wear: { ...(recipe.wear || {}), ...(game.wear || {}) } };
  if (look.hair) out.hair = look.hair;
  if (look.hairColor) out.hairColor = look.hairColor;
  if (look.brows) out.brows = look.brows;
  const chub = chubOf(game.vitals && game.vitals.weight);
  if (chub) out.chub = chub;
  return out;
}

// Precio de algo del vestidor.
export const wearPrice = (slot, id) => (findWearable(slot, id) || {}).price || 0;

// Partidas viejas: los accesorios comprados en la pestaña "Accesorios"
// (headAcc / neckAcc / extraAcc con un solo color) pasan al vestidor.
const OLD_FIELD = { headAcc: 'cabeza', neckAcc: 'cuello', extraAcc: 'cara' };
export function migrateOldAccessories(state) {
  const owned = new Set(state.ownedWear || []);
  for (const k of state.ownedAcc || []) {
    const [field, id] = String(k).split(':');
    if (OLD_FIELD[field] && id) owned.add(key(OLD_FIELD[field], id));
  }
  const wear = { ...(state.wear || {}) };
  const w = state.wearing || {};
  for (const [field, slot] of Object.entries(OLD_FIELD)) {
    if (w[field] != null) wear[slot] = { id: w[field], ...(w.accColor ? { c1: w.accColor } : {}) };
  }
  const out = { ...state, ownedWear: [...owned], wear };
  delete out.ownedAcc;
  delete out.wearing;
  return out;
}
