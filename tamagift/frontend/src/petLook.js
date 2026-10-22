// ─────────────────────────────────────────────────────────────────
// "Cómo se ve" la mascota en este momento: su receta de mochi (que cada
// estilo dibuja a su manera) o, para mascotas viejas sin receta, los
// PNG que se guardaron al crearla.
//
//   { recipe }                          receta (+ recipe.overlays: retoques a mano)
//   { urls: { normal, feliz, enojado } } respaldo en imágenes
// ─────────────────────────────────────────────────────────────────

export function parseRecipe(v) {
  if (!v) return null;
  try {
    const r = typeof v === 'string' ? JSON.parse(v) : v;
    return r && typeof r === 'object' && (r.body || r.ears || r.bodyColor) ? r : null;
  } catch (e) {
    return null;
  }
}

// `wearing`: accesorios comprados en la tienda y puestos por quien
// recibe ({ headAcc, neckAcc, extraAcc, accColor }). Se suman a la
// receta (el traje o el diseño), así se ven en todos los estilos.
export function lookOf(pet, outfit, wearing) {
  const look = baseLook(pet, outfit);
  if (look && look.recipe && wearing && Object.keys(wearing).length) {
    const w = Object.fromEntries(Object.entries(wearing).filter(([, v]) => v != null));
    return { recipe: { ...look.recipe, ...w } };
  }
  return look;
}

function baseLook(pet, outfit) {
  if (!pet) return null;
  if (outfit) {
    const r = parseRecipe(outfit.recipe);
    if (r) return { recipe: r };
    if (outfit.drawing_normal) return { urls: { normal: outfit.drawing_normal, feliz: outfit.drawing_feliz, enojado: outfit.drawing_enojado } };
  }
  const redesign = pet.active_design === 'redesign';
  const r = parseRecipe(redesign ? pet.recipe_redesign : pet.recipe_original) || (redesign ? parseRecipe(pet.recipe_original) : null);
  if (r) return { recipe: r };
  const u = (m) => (redesign && pet[`drawing_${m}_redesign`]) || pet[`drawing_${m}`];
  if (u('normal')) return { urls: { normal: u('normal'), feliz: u('feliz') || u('normal'), enojado: u('enojado') || u('normal') } };
  return null;
}

// Los retoques a mano existen para los tres ánimos con los que se diseña;
// los demás (triste, dormido…) usan el de "normal".
export function overlayFor(recipe, mood) {
  const o = recipe && recipe.overlays;
  if (!o) return null;
  return o[mood] || (['normal', 'feliz', 'enojado'].includes(mood) ? null : o.normal) || null;
}
