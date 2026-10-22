// ─────────────────────────────────────────────────────────────────
// Capa de datos de Tamagift.
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
// falta el backend desplegado. Por eso en producción NO se cae a local:
// quien compró recibiría un link que en el otro celular no abre nada, y
// creería que funcionó. Allí un fallo del servidor es un error con
// "reintentar" (ver CreatePetError).
// ─────────────────────────────────────────────────────────────────

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Solo en `npm run dev`. El build de Netlify (`vite build`) lo apaga solo.
const ALLOW_LOCAL_FALLBACK = import.meta.env.DEV;

const PET_KEY = (slug) => `tamagift:pet:${slug}`;

function randomSlug(len = 8) {
  const alpha = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
  return s;
}

// Deja la config guardada localmente con los mismos campos que devuelve
// el backend en GET /api/pets/:slug (para que el juego no note diferencia).
export function saveLocalPet(slug, payload) {
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
    app_style: payload.app_style || null,
    hunger_meter: 60,
    love_meter: 60,
    current_mood: 'normal',
    food_preferences: payload.food_preferences || [],
    phrases: payload.phrases || [],
    // Ids estables por posición: sin id, todos los pósters compartían
    // `undefined` y comprar o colgar uno afectaba a todos.
    photos: (payload.photos || []).map((p, i) => ({ ...p, id: p.id != null ? p.id : `local-photo-${i}` })),
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

// El servidor no pudo crear la mascota (no contesta o falló). Solo se
// lanza en producción; en desarrollo se cae a localStorage.
export class CreatePetError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'CreatePetError';
    this.reason = reason;   // 'sin-conexion' | 'muy-pesado' | 'servidor' | 'datos'
  }
}

// ¿Hace falta llave para crear? Si el backend no responde: en desarrollo
// asumimos que no (modo local); en producción que sí, porque si no el
// campo de la llave desaparecería y la persona no podría escribirla
// cuando el servidor vuelva.
export async function accessKeyRequired() {
  try {
    const res = await fetch(`${API_BASE}/api/access-keys/required`);
    if (!res.ok) return !ALLOW_LOCAL_FALLBACK;
    const data = await res.json();
    return !!data.requerida;
  } catch (e) {
    return !ALLOW_LOCAL_FALLBACK;
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

// Crea la mascota. Intenta el backend; si el backend NO RESPONDE, en
// desarrollo cae a localStorage y en producción lanza CreatePetError.
// Devuelve { slug, mode: 'backend' | 'local' }.
export async function createPet(payload) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // El servidor no contesta (sin red, backend caído, CORS mal puesto).
    if (!ALLOW_LOCAL_FALLBACK) throw new CreatePetError('sin-conexion');
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
  // Algún dato no pasó la validación del servidor (texto demasiado
  // largo, demasiadas fotos…): reintentar no sirve, hay que corregirlo.
  if (res.status === 422) {
    let field = '';
    try { const d = await res.json(); field = (d.detail && d.detail[0] && d.detail[0].loc || []).slice(-2).join(' › '); } catch (e) { /* da igual */ }
    const err = new CreatePetError('datos');
    err.field = field;
    throw err;
  }
  if (!res.ok) {
    if (!ALLOW_LOCAL_FALLBACK) throw new CreatePetError(res.status === 413 ? 'muy-pesado' : 'servidor');
    const slug = randomSlug();
    saveLocalPet(slug, payload);
    return { slug, mode: 'local' };
  }

  const data = await res.json();
  // Copia local para que el link abra al toque en este mismo dispositivo
  // aunque el backend tarde o se caiga luego.
  try { saveLocalPet(data.slug, payload); } catch (e) { /* opcional */ }
  // La llave del buzón se entrega una sola vez: queda guardada en este
  // dispositivo (y en el link del buzón que se muestra al terminar).
  if (data.owner_token) saveOwnerToken(data.slug, data.owner_token);
  return { slug: data.slug, mode: 'backend', ownerToken: data.owner_token || null };
}

// fetch con tiempo límite: sin esto, con el servidor dormido la pantalla
// se quedaba en "Cargando…" para siempre.
async function fetchWithTimeout(url, opts = {}, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// Carga la mascota por slug. Devuelve { pet, mode }:
//   'live'  → del servidor
//   'local' → copia guardada en este dispositivo (servidor sin respuesta)
//   'demo'  → slug de demostración
//   'error' → no se pudo cargar (el juego ofrece reintentar). Antes un
//             fallo del servidor mostraba una mascota de demostración y
//             quien recibía el regalo veía otra mascota sin explicación.
//   'missing' → el regalo no existe (link mal copiado)
export async function loadPet(slug) {
  if (!slug || slug === 'demo') return { pet: null, mode: 'demo' };
  let failed = false;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}`);
    if (res.ok) return { pet: await res.json(), mode: 'live' };
    if (res.status === 404) {
      const local = getLocalPet(slug);
      return local ? { pet: local, mode: 'local' } : { pet: null, mode: 'missing' };
    }
    failed = true;
  } catch (err) {
    failed = true;
  }
  const local = getLocalPet(slug);
  if (local) return { pet: local, mode: 'local' };
  return { pet: null, mode: failed ? 'error' : 'demo' };
}

// Guarda el estilo visual elegido por quien recibe el regalo, para que
// lo vea igual en cualquier dispositivo. Si falla no pasa nada: el
// estilo también queda guardado en este dispositivo.
export async function setPetStyleRemote(slug, styleId) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}/style`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_style: styleId }),
    }, 8000);
    return res.ok;
  } catch (e) {
    return false;
  }
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

// ── Partida guardada en el servidor ──────────────────────────────────
// La partida (monedas, compras, cuarto…) vive en el dispositivo y se
// copia al servidor para no perderla al cambiar de celular. Ver
// cloudSave.js para cuándo se manda y cuál gana si hay dos.

// Devuelve { data, rev, saved_at } (data null si nunca se guardó) o
// null si el servidor no contesta.
export async function fetchGameSave(slug) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}/save`, {}, 8000);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Manda la partida. Texto plano a propósito: sin la consulta previa de
// CORS, así también sale con `keepalive` al cerrar la pestaña.
// Devuelve { ok, rev } | { conflict, data, rev, saved_at } | { failed: status }
// | null (sin conexión).
export async function pushGameSave(slug, { data, rev, savedAt, force = false }, { keepalive = false } = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/pets/${slug}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ data, rev, saved_at: Math.round(savedAt || 0), force }),
      keepalive,
    });
    if (res.ok) return { ok: true, ...(await res.json()) };
    if (res.status === 409) return { conflict: true, ...(await res.json()) };
    return { failed: res.status };
  } catch (e) {
    return null;
  }
}

// ── Buzón: cartas de quien regaló ────────────────────────────────────
// Quien regaló escribe desde /buzon/:slug (con la llave del buzón o con
// la llave de acceso con que compró el regalo); a quien recibe le llegan
// como paquete a la puerta.

const OWNER_KEY = (slug) => `tamagift:owner:${slug}`;
export function saveOwnerToken(slug, token) {
  try { localStorage.setItem(OWNER_KEY(slug), token); } catch (e) { /* no es grave */ }
}
export function getOwnerToken(slug) {
  try { return localStorage.getItem(OWNER_KEY(slug)); } catch (e) { return null; }
}

// ¿Esta llave abre el buzón? 'ok' | 'no' | 'sin-conexion'
export async function checkMailbox(slug, auth) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}/mailbox/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(auth),
    }, 10000);
    if (!res.ok) return res.status === 404 ? 'no-existe' : 'sin-conexion';
    return (await res.json()).ok ? 'ok' : 'no';
  } catch (e) {
    return 'sin-conexion';
  }
}

// Manda una carta. Devuelve { ok, letter } o { error: 'sin-permiso' |
// 'muchas-cartas' | 'muy-pesada' | 'sin-conexion' }.
export async function sendLetter(slug, { text, photo, token, accessKey }) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}/letters`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, photo: photo || null, token: token || null, access_key: accessKey || null }),
    }, 30000);
    if (res.ok) return { ok: true, letter: await res.json() };
    if (res.status === 403) return { error: 'sin-permiso' };
    if (res.status === 429) return { error: 'muchas-cartas' };
    if (res.status === 413 || res.status === 422) return { error: 'muy-pesada' };
    return { error: 'sin-conexion' };
  } catch (e) {
    return { error: 'sin-conexion' };
  }
}

// Las cartas más nuevas que `after` (sin fotos), o null sin conexión.
export async function fetchLetters(slug, after = 0) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}/letters?after=${Number(after) || 0}`, {}, 10000);
    return res.ok ? await res.json() : null;
  } catch (e) {
    return null;
  }
}

// Una carta completa, con su foto.
export async function fetchLetter(slug, id) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/pets/${slug}/letters/${Number(id)}`, {}, 20000);
    return res.ok ? await res.json() : null;
  } catch (e) {
    return null;
  }
}
