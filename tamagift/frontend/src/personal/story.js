// ─────────────────────────────────────────────────────────────────
// "Su historia" a mano para cualquier pantalla del juego.
//
// Los lugares (mapas de niveles), las recetas de quien regala (cocina)
// y los objetos con foto viven en la ficha (pet.profile) y en las fotos
// del regalo (pet.photos). Para no pasar la ficha por cada minijuego,
// el juego la deja aquí una vez (setStory) y cada pantalla la lee con
// useStory(). Sin setStory todo sigue funcionando como antes (sin
// lugares ni recetas propias).
//
//   setStory({ profile, pet, names, seen, onSeen })
//     seen     ids de recuerdos ya abiertos (lugares)
//     onSeen   (id) => void: guarda que se abrió (si falta, se guarda en
//              este equipo con localStorage)
// ─────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from 'react';
import { callName } from './catalog.js';

let story = { profile: null, pet: null, names: {}, seen: null, onSeen: null };
const subs = new Set();

export function setStory(next) {
  const pet = next.pet || null;
  const profile = next.profile || null;
  story = {
    profile, pet,
    names: next.names || { nombre: callName(pet, profile), yo: (pet && pet.creator_name) || '' },
    seen: next.seen || null,
    onSeen: next.onSeen || null,
  };
  subs.forEach((f) => f());
}

export const getStory = () => story;

export function useStory() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, getStory, getStory);
}

// ── Recuerdos ya abiertos ────────────────────────────────────────
const lsKey = () => `tamagift:story-seen:${(story.pet && story.pet.slug) || 'local'}`;
function localSeen() {
  try { return JSON.parse(localStorage.getItem(lsKey()) || '[]'); } catch (e) { return []; }
}
export function storySeen(id) {
  const list = story.seen || localSeen();
  return list.includes(id);
}
export function markStorySeen(id) {
  if (story.onSeen) { story.onSeen(id); return; }
  try {
    const list = localSeen();
    if (!list.includes(id)) localStorage.setItem(lsKey(), JSON.stringify([...list, id]));
  } catch (e) { /* sin almacenamiento: se vuelve a mostrar, no pasa nada */ }
  story = { ...story };
  subs.forEach((f) => f());
}

// La foto n.º `i` del regalo (o null).
export function photoAt(pet, i) {
  const list = (pet && pet.photos) || [];
  const n = Number(i);
  return Number.isInteger(n) && list[n] && list[n].url ? list[n] : null;
}
