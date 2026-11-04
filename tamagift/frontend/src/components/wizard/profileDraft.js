// ─────────────────────────────────────────────────────────────────
// Lo personal que se arma en el asistente (paso "Sobre …" y la parte
// de mensajes del paso "Frases"), y cómo se convierte en la ficha que
// se manda al servidor (Pet.profile, ver personal/catalog.js).
//
// Forma del borrador (se guarda tal cual en draftStore):
//   nickname    texto
//   likes       { [id de LIKES quick]: texto }
//   dates       { [id de DATE_KINDS quick]: { d, m, y } }   (números o '')
//   situations  { [id de SITUATIONS quick]: { idx, text } }
//               text === null → se usa el ejemplo idx, rellenado con
//               los nombres de ahora (si cambian, el texto se actualiza).
// ─────────────────────────────────────────────────────────────────
import { LIKES, DATE_KINDS, SITUATIONS, fill, starterProfile, pid } from '../../personal/catalog';

export const QUICK_LIKES = LIKES.filter((l) => l.quick);
export const QUICK_DATES = DATE_KINDS.filter((k) => k.quick);
export const QUICK_SITUATIONS = SITUATIONS.filter((s) => s.quick);

export function emptyAbout() {
  const situations = {};
  for (const s of QUICK_SITUATIONS) situations[s.id] = { idx: 0, text: null };
  return { nickname: '', likes: {}, dates: {}, situations };
}

// Un borrador viejo (o de antes de este paso) puede venir incompleto.
export function normalizeAbout(raw) {
  const base = emptyAbout();
  if (!raw || typeof raw !== 'object') return base;
  return {
    nickname: typeof raw.nickname === 'string' ? raw.nickname : '',
    likes: raw.likes && typeof raw.likes === 'object' ? { ...raw.likes } : {},
    dates: raw.dates && typeof raw.dates === 'object' ? { ...raw.dates } : {},
    situations: { ...base.situations, ...(raw.situations && typeof raw.situations === 'object' ? raw.situations : {}) },
  };
}

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Días del mes; sin año, febrero admite el 29.
export function daysIn(m, y) {
  if (!m) return 31;
  if (m === 2) return y ? (new Date(Number(y), 2, 0).getDate()) : 29;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export const dateComplete = (v) => !!(v && v.d && v.m);

// 'AAAA-MM-DD' si hay año, 'MM-DD' si no (el formato de la ficha).
export function dateToString(v) {
  if (!dateComplete(v)) return null;
  const mm = String(v.m).padStart(2, '0');
  const dd = String(v.d).padStart(2, '0');
  return v.y ? `${v.y}-${mm}-${dd}` : `${mm}-${dd}`;
}

export function dateToWords(v) {
  if (!dateComplete(v)) return '';
  return `${v.d} de ${MONTHS[v.m - 1]}${v.y ? ` de ${v.y}` : ''}`;
}

// Cómo se le dice en los mensajes: apodo > nombre.
export const callNameOf = (about, partnerName) => (about.nickname || '').trim() || (partnerName || '').trim();

export function situationText(about, sit, names) {
  const st = (about.situations && about.situations[sit.id]) || { idx: 0, text: null };
  if (typeof st.text === 'string') return st.text;
  return fill(sit.examples[(st.idx || 0) % sit.examples.length], names);
}

// La ficha completa: starterProfile() + lo elegido.
export function buildProfile(about, { partnerName, creatorName } = {}) {
  const a = normalizeAbout(about);
  const names = { nombre: callNameOf(a, partnerName), yo: (creatorName || '').trim() };
  const profile = starterProfile();
  profile.nickname = a.nickname.trim().slice(0, 60);

  for (const l of QUICK_LIKES) {
    const v = String(a.likes[l.id] || '').trim();
    if (v) profile.likes[l.id] = v.slice(0, 80);
  }

  for (const k of QUICK_DATES) {
    const date = dateToString(a.dates[k.id]);
    if (date) profile.dates.push({ id: pid('f'), kind: k.id, date });
  }

  const situations = {};
  for (const s of QUICK_SITUATIONS) {
    const text = situationText(a, s, names).trim();
    if (text) situations[s.id] = [text.slice(0, 200)];
  }
  profile.situations = situations;
  return profile;
}
