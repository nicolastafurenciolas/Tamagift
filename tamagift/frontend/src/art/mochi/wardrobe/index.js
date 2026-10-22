// ─────────────────────────────────────────────────────────────────
// El vestidor de la mochi: todo lo que se puede poner, por ranura.
//
//   cabeza · cara · cuello · ropa · espalda · mano
//
// Cada cosa: { id, slot, label, price, colors, draw }. `colors`
// son los colores por defecto de sus partes teñibles (0, 1 o 2); quien
// juega los cambia y se guardan con lo que lleva puesto.
//
// En la receta, lo puesto va en `wear`: { cabeza: { id, c1, c2 }, … }.
// Las recetas viejas usan headAcc / neckAcc / extraAcc: siguen sirviendo
// (son los accesorios de siempre, que también están en el vestidor).
//
// `vibes` es solo una nota interna de qué gustos cubre cada cosa (para
// cuidar que haya variedad); NO se muestra: encasillar a la gente en
// "tipos" puede espantar.
// ─────────────────────────────────────────────────────────────────

import { E, P, G } from '../../svg.js';
import {
  HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES,
  head as legacyHead, neck as legacyNeck, neckBack as legacyNeckBack, faceAcc as legacyFace, faceUnder as legacyFaceUnder, accColors,
} from '../accessories.js';
import { HEAD_ITEMS } from './head.js';
import { FACE_ITEMS } from './face.js';
import { NECK_ITEMS } from './neck.js';
import { OUTFIT_ITEMS } from './outfit.js';
import { BACK_ITEMS } from './back.js';
import { HAND_ITEMS } from './hand.js';
import { nid, T } from './kit.js';

export const SLOTS = [
  { id: 'cabeza', label: 'Cabeza' },
  { id: 'cara', label: 'Cara' },
  { id: 'cuello', label: 'Cuello' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'espalda', label: 'Espalda' },
  { id: 'mano', label: 'En la mano' },
];
export const SLOT_IDS = SLOTS.map((s) => s.id);

// ── Los accesorios de siempre, como cosas del vestidor ───────────────
const LEGACY = {
  cabeza: {
    list: HEAD_ACCESSORIES,
    tint: ['mono', 'gorro', 'diadema', 'sombrero', 'gorra', 'boina', 'bandana', 'audifonos', 'cresta'],
    vibes: { mono: ['kawaii', 'coquette'], fiesta: ['kawaii'], gorro: ['cottagecore', 'aesthetic'], corona: ['princesa'], flores: ['cottagecore', 'princesa'], tiara: ['princesa', 'coquette'], diadema: ['coquette', 'kawaii'], sombrero: ['playera', 'cottagecore'], gorra: ['deportiva', 'y2k'], boina: ['aesthetic', 'academia'], bandana: ['rockera', 'cottagecore'], audifonos: ['gamer', 'y2k'], bruja: ['gotica', 'celestial', 'temporada'], vaquero: ['rockera'], aureola: ['princesa', 'celestial'], cachos: ['gotica', 'y2k'], cuernos: ['gotica', 'rockera'], monoCalavera: ['gotica'], cresta: ['rockera'], flequillo: ['rockera'] },
    price: 80,
  },
  cuello: {
    list: NECK_ACCESSORIES,
    tint: ['collar', 'pajarita', 'bufanda', 'panuelo', 'corbata', 'medalla', 'capa'],
    vibes: { collar: ['kawaii'], pajarita: ['academia', 'coquette'], bufanda: ['cottagecore', 'aesthetic'], panuelo: ['cottagecore', 'playera'], medallon: ['princesa', 'academia'], lei: ['playera'], corbata: ['academia'], medalla: ['deportiva'], capa: ['princesa', 'gotica'], choker: ['gotica', 'y2k', 'rockera'], cadena: ['rockera', 'y2k'], pinchos: ['rockera', 'gotica'] },
    price: 70,
  },
  cara: {
    list: EXTRA_ACCESSORIES,
    tint: ['antifaz'],
    vibes: { lentes: ['academia', 'aesthetic'], gafasol: ['playera', 'y2k'], antifaz: ['gotica'], pecas: ['cottagecore', 'kawaii'], lunar: ['coquette'], curita: ['kawaii'], brillos: ['y2k', 'kawaii'], parche: ['rockera', 'gotica'], piercings: ['rockera', 'gotica'], lagrima: ['gotica', 'rockera'], eyeblack: ['deportiva'], corpse: ['gotica'] },
    price: 45,
  },
};

function legacyItems(slot) {
  const L = LEGACY[slot];
  return L.list.filter((a) => a.id !== 'ninguno').map((a, i) => ({
    id: a.id, slot, label: a.label, legacy: true,
    vibes: L.vibes[a.id] || [],
    price: L.price + (i % 5) * 15,
    colors: L.tint.includes(a.id) ? ['#FF7FA8'] : [],
  }));
}

const tag = (slot, list) => list.map((it) => ({ ...it, slot }));

export const WARDROBE = [
  ...legacyItems('cabeza'), ...tag('cabeza', HEAD_ITEMS),
  ...legacyItems('cara'), ...tag('cara', FACE_ITEMS),
  ...legacyItems('cuello'), ...tag('cuello', NECK_ITEMS),
  ...tag('ropa', OUTFIT_ITEMS),
  ...tag('espalda', BACK_ITEMS),
  ...tag('mano', HAND_ITEMS),
];

export const findWearable = (slot, id) => WARDROBE.find((w) => w.slot === slot && w.id === id) || null;

// Cuánto se sale de la silueta (para que la mochi se achique y entre).
const OUT_MAP = {
  alasHada: 42, alasAngel: 40, alasMurcielago: 38, alasMariposa: 42, mochila: 24, mochilaOso: 25, capaEstrellas: 14, caparazon: 12,
  velo: 22, flotador: 15, vestido: 11, maid: 9, lolita: 11, princesa: 17, tutu: 19, seifuku: 7,
};
const HAND_OUT = 32;

// Qué lleva puesto, ranura por ranura (con lo viejo traducido).
export function resolveWear(r) {
  const out = {};
  if (r.headAcc && r.headAcc !== 'ninguno') out.cabeza = { id: r.headAcc };
  if (r.neckAcc && r.neckAcc !== 'ninguno') out.cuello = { id: r.neckAcc };
  if (r.extraAcc && r.extraAcc !== 'ninguno') out.cara = { id: r.extraAcc };
  for (const [slot, v] of Object.entries(r.wear || {})) {
    if (!SLOT_IDS.includes(slot)) continue;
    if (!v || !v.id || v.id === 'ninguno') delete out[slot];
    else out[slot] = v;
  }
  // descarta lo que no existe (ids viejos o de otra versión)
  for (const slot of Object.keys(out)) if (!findWearable(slot, out[slot].id)) delete out[slot];
  return out;
}

// Cuánto sobresale lo puesto a la izquierda y a la derecha.
export function wearOverflow(r) {
  const w = resolveWear(r);
  let left = 0, right = 0;
  for (const [slot, v] of Object.entries(w)) {
    const o = OUT_MAP[v.id] || 0;
    if (slot === 'mano') right = Math.max(right, HAND_OUT);
    else if (v.id === 'mochila' || v.id === 'mochilaOso') right = Math.max(right, o);
    else { left = Math.max(left, o); right = Math.max(right, o); }
  }
  return { left, right };
}

/**
 * Dibuja lo puesto. Devuelve capas para index.js:
 *   back    detrás de todo (alas, mochilas, capas, el velo)
 *   outfit  la ropa, sobre el cuerpo y la panza
 *   neck    collares (sobre la ropa)
 *   under   cosas pegadas a la piel de la cara (stickers, pecas)
 *   front   lentes, capuchas y gorros
 *   hand    lo que lleva en la mano
 */
export function renderWear(r, g, c, mood, eyes) {
  const wear = resolveWear(r);
  const L = { back: '', outfit: '', neck: '', under: '', front: '', hand: '' };
  const e = eyes || { y: g.face.y, dx: g.face.dx };
  const colorsFor = (it, v) => {
    const base = r.accColor || r.accentColor || '#FF7FA8';
    const c1 = (v && v.c1) || (it.legacy ? base : it.colors[0]) || base;
    const c2 = (v && v.c2) || it.colors[1] || '#FFFFFF';
    return { c1, c2 };
  };
  const legacyColors = (k) => ({ ...c, ...accColors({ ...r, accColor: k.c1 }) });

  let hoodTop = '', faceFront = '', headTop = '';
  for (const slot of SLOT_IDS) {
    const v = wear[slot];
    if (!v) continue;
    const it = findWearable(slot, v.id);
    const k = colorsFor(it, v);
    if (it.legacy) {
      const cc = legacyColors(k);
      if (slot === 'cabeza') headTop += legacyHead(v.id, g, cc);
      else if (slot === 'cara') { L.under += legacyFaceUnder(v.id, g, cc, e); faceFront += legacyFace(v.id, g, cc, e); }
      else if (slot === 'cuello') {
        const clip = nid('nk');
        const front = legacyNeck(v.id, g, cc, clip);
        if (front) L.neck += E('clipPath', { id: clip }, P(g.path)) + front;
        L.back += legacyNeckBack(v.id, g, cc);
      }
      continue;
    }
    if (slot === 'mano') {
      const s = 1.3 * Math.pow(g.wf, 0.3);
      const hx = g.r - 5, hy = g.ys + 4;
      L.hand += G({ transform: T(hx, hy, 0, s) }, it.draw()(k));
      continue;
    }
    const out = it.draw(g, k, { e, mood }) || {};
    L.back += out.back || '';
    if (slot === 'ropa') { L.outfit += out.outfit || ''; hoodTop += out.top || ''; }
    else if (slot === 'cuello') L.neck += out.front || '';
    else if (slot === 'cara') { L.under += out.under || ''; faceFront += out.front || ''; }
    else if (slot === 'cabeza') headTop += out.top || out.front || '';
    else if (slot === 'espalda') L.neck += out.front || '';
  }
  L.front = hoodTop + faceFront + headTop;
  return L;
}
