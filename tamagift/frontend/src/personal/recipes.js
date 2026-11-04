// ─────────────────────────────────────────────────────────────────
// Recetas de quien regala (profile.recipes: [{ id, name, story, dish? }])
// en la cocina del juego: cada una se cocina con los pasos de un plato
// del catálogo (cooking.js). Si quien regala no eligió el plato base,
// se adivina por el nombre ("la pasta de nuestra primera cita" → pasta)
// y si no se parece a nada, unos panqueques.
// ─────────────────────────────────────────────────────────────────

import { RECIPES } from '../cooking.js';

// palabra del nombre → receta del catálogo
const GUESS = [
  [/pasta|fideo|espagueti|spaghetti|lasa|tallar/i, 'pasta'],
  [/galleta|cookie/i, 'galleta'],
  [/arroz|onigiri|risotto/i, 'arroz'],
  [/sopa|caldo|crema de|sancocho|ajiaco/i, 'sopa'],
  [/ramen/i, 'ramen'],
  [/sushi|maki/i, 'sushi'],
  [/taco|burrito|quesadilla|fajita/i, 'tacos'],
  [/arepa|empanada/i, 'arepa'],
  [/ensalada/i, 'ensalada'],
  [/huevo|tortilla de|omelet/i, 'huevo'],
  [/torta|pastel|bizcocho|cake|cheesecake|brownie/i, 'pastel'],
  [/panque|pancake|hotcake|desayuno|waffle|crepa|crepe/i, 'panqueques'],
];

export function guessDish(name) {
  const hit = GUESS.find(([re]) => re.test(String(name || '')));
  return hit ? hit[1] : 'panqueques';
}

/** La receta del catálogo con la que se cocina la de quien regala. */
export function baseRecipeFor(r) {
  const id = r && r.dish && RECIPES.some((x) => x.id === r.dish) ? r.dish : guessDish(r && r.name);
  return RECIPES.find((x) => x.id === id) || RECIPES[0];
}

/**
 * Las recetas de quien regala, listas para la cocina:
 * [{ id, name, story, base (receta del catálogo), steps, food }].
 */
export function giverRecipes(profile) {
  return ((profile && profile.recipes) || [])
    .filter((r) => r && String(r.name || '').trim())
    .map((r) => {
      const base = baseRecipeFor(r);
      return { id: `regalo-${r.id}`, giftId: r.id, name: String(r.name).trim(), story: String(r.story || '').trim(), base, food: base.food, steps: base.steps };
    });
}
