// ─────────────────────────────────────────────────────────────────
// Capa de datos de PetGift.
//
// Fuente de verdad de la CONFIG de la mascota (dibujos, comidas, frases,
// fotos, música): el backend. Pero si el backend no está disponible
// (ej. probando en local sin servidor, o mientras se despliega), NO
// rompemos: guardamos la config en localStorage y el link /p/:slug la
// lee de ahí en el mismo dispositivo. Así el flujo crear→jugar siempre
// funciona, y el creador nunca ve un error feo.
//
// Nota: el fallback local sólo sirve en el MISMO dispositivo. Para que
// el link funcione en el celular de la pareja (otro dispositivo) hace
// falta el backend desplegado. La UI lo aclara cuando cae en local.
// ─────────────────────────────────────────────────────────────────

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const PET_KEY = (slug) => `petgift:pet:${slug}`;

function randomSlug(len = 8) {
  const alpha = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
  return s;
}

// Deja la config guardada localmente con los mismos campos que devuelve
// el backend en GET /api/pets/:slug (para que el juego no note diferencia).
function saveLocalPet(slug, payload) {
  const record = {
    slug,
    name: payload.name,
    creator_name: payload.creator_name || null,
    recipient_name: payload.recipient_name || null,
    drawing_normal: payload.drawing_normal,
    drawing_feliz: payload.drawing_feliz,
    drawing_enojado: payload.drawing_enojado,
    recipe_original: payload.recipe_original || null,
    recipe_redesign: null,
    drawing_normal_redesign: null,
    drawing_feliz_redesign: null,
    drawing_enojado_redesign: null,
    active_design: 'original',
    hunger_meter: 60,
    love_meter: 60,
    current_mood: 'normal',
    food_preferences: payload.food_preferences || [],
    phrases: payload.phrases || [],
    photos: payload.photos || [],
    songs: payload.songs || [],
    // Igual que decor_items: sin backend no hay id autoincremental real,
    // así que se inventa uno estable por posición para este dispositivo.
    outfits: (payload.outfits || []).map((o, i) => ({ ...o, id: o.id != null ? o.id : `local-outfit-${i}` })),
    decor_items: (payload.decor_items || []).map((d, i) => ({ ...d, id: d.id != null ? d.id : `local-${i}` })),
    whack_targets: (payload.whack_targets || []).map((t, i) => ({ ...t, id: t.id != null ? t.id : `local-whack-${i}` })),
    _local: true,
  };
  try {
    localStorage.setItem(PET_KEY(slug), JSON.stringify(record));
  } catch (e) {
    // localStorage lleno (fotos pesadas como data URL). Se maneja arriba.
    throw new Error('local-storage-full');
  }
  return record;
}

export function getLocalPet(slug) {
  try {
    const raw = localStorage.getItem(PET_KEY(slug));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Error de llave de acceso: se distingue a propósito de un fallo de red.
export class AccessKeyError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'AccessKeyError';
    this.reason = reason;   // 'clave-invalida' | 'clave-usada'
  }
}

// ¿Hace falta llave para crear? Si el backend no responde, asumimos que
// no (modo local de desarrollo), pero entonces tampoco hay backend donde
// registrar nada.
export async function accessKeyRequired() {
  try {
    const res = await fetch(`${API_BASE}/api/access-keys/required`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.requerida;
  } catch (e) {
    return false;
  }
}

// Comprueba una llave SIN gastarla. Devuelve 'ok' | 'usada' | 'invalida'
// | 'sin-conexion'.
export async function checkAccessKey(key) {
  try {
    const res = await fetch(`${API_BASE}/api/access-keys/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return 'sin-conexion';
    const data = await res.json();
    return data.estado;
  } catch (e) {
    return 'sin-conexion';
  }
}

// Crea la mascota. Intenta el backend; si el backend NO RESPONDE, cae a
// localStorage. Devuelve { slug, mode: 'backend' | 'local' }.
export async function createPet(payload) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // El servidor no contesta (sin red, backend caído). Aquí sí tiene
    // sentido el respaldo local.
    const slug = randomSlug();
    saveLocalPet(slug, payload);
    return { slug, mode: 'local' };
  }

  // OJO: si el servidor SÍ contestó y rechazó la llave, NO se puede caer
  // al respaldo local — eso dejaría crear mascotas gratis sin llave, que
  // es justo lo que el sistema de licencias tiene que impedir.
  if (res.status === 400 || res.status === 409) {
    let reason = 'clave-invalida';
    try { reason = (await res.json()).detail || reason; } catch (e) { /* da igual */ }
    throw new AccessKeyError(reason);
  }
  if (!res.ok) {
    const slug = randomSlug();
    saveLocalPet(slug, payload);
    return { slug, mode: 'local' };
  }

  const data = await res.json();
  // Copia local para que el link abra al toque en este mismo dispositivo
  // aunque el backend tarde o se caiga luego.
  try { saveLocalPet(data.slug, payload); } catch (e) { /* opcional */ }
  return { slug: data.slug, mode: 'backend' };
}

// Carga la mascota por slug. Backend primero; luego localStorage.
// Devuelve el objeto pet o null (el juego cae a su mascota demo).
export async function loadPet(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/pets/${slug}`);
    if (res.ok) {
      const data = await res.json();
      return { pet: data, mode: 'live' };
    }
  } catch (err) { /* intenta local abajo */ }

  const local = getLocalPet(slug);
  if (local) return { pet: local, mode: 'local' };
  return { pet: null, mode: 'demo' };
}

// Alimenta contra el backend si la mascota es 'live'. Devuelve la respuesta
// o null si no hay backend (el juego aplica su lógica local).
export async function feedPetRemote(slug, foodName) {
  try {
    const res = await fetch(`${API_BASE}/api/pets/${slug}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_name: foodName }),
    });
    if (!res.ok) throw new Error('feed-failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

// Guarda un rediseño hecho por quien recibe el regalo. Devuelve el pet
// actualizado (con el póster de recuerdo ya incluido si era la primera
// vez) o null si no hay backend — el juego decide cómo degradar.
export async function redesignPetRemote(slug, { recipe, drawing_normal, drawing_feliz, drawing_enojado }) {
  try {
    const res = await fetch(`${API_BASE}/api/pets/${slug}/redesign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, drawing_normal, drawing_feliz, drawing_enojado }),
    });
    if (!res.ok) throw new Error('redesign-failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

// Alterna cuál diseño se muestra ('original' | 'redesign').
export async function setActiveDesignRemote(slug, activeDesign) {
  try {
    const res = await fetch(`${API_BASE}/api/pets/${slug}/design`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_design: activeDesign }),
    });
    if (!res.ok) throw new Error('design-failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}
