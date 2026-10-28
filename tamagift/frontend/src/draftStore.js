// ─────────────────────────────────────────────────────────────────
// Borrador del asistente, guardado en el dispositivo.
//
// Armar un regalo lleva un rato, y en iPhone el navegador recarga la
// pestaña si sales a copiar un link de Spotify o a elegir fotos: antes
// se perdía todo. Ahora el asistente se guarda solo mientras avanzas.
//
// Se usa IndexedDB y no localStorage porque las fotos y el audio pesan
// varios MB (localStorage se llena con 5 MB). Si IndexedDB no está
// disponible (modo privado en algunos navegadores), simplemente no se
// guarda: nunca rompe el asistente.
// ─────────────────────────────────────────────────────────────────

const DB = 'tamagift';
const STORE = 'drafts';
const KEY = 'wizard';

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('sin-indexeddb')); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const req = fn(store);
    t.oncomplete = () => { resolve(req && req.result); db.close(); };
    t.onerror = () => { reject(t.error); db.close(); };
  });
}

export async function loadDraft() {
  try {
    return (await tx('readonly', (s) => s.get(KEY))) || null;
  } catch (e) {
    return null;
  }
}

export async function saveDraft(draft) {
  try {
    await tx('readwrite', (s) => s.put({ ...draft, savedAt: Date.now() }, KEY));
    return true;
  } catch (e) {
    return false;
  }
}

export async function clearDraft() {
  try {
    await tx('readwrite', (s) => s.delete(KEY));
  } catch (e) { /* nada que borrar */ }
}
