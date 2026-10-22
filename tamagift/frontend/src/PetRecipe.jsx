import React from 'react';
import {
  mochiSvg, DEFAULT_MOCHI, SHAPES, EARS, EYES, MOUTHS, CHEEKS, TAILS, PATTERNS,
  HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES,
} from './art/mochi';
import { artToPng } from './art/render';

// ─────────────────────────────────────────────────────────────────
// La receta de la mascota. Desde el rediseño las mascotas son MOCHIS:
// un cuerpito blandito (en cuatro anchos) con orejitas, cara, colas,
// estampados y accesorios. La receta usa los mismos campos de siempre,
// así las recetas viejas y los estilos de partida siguen sirviendo.
//
// El juego dibuja la mascota desde la receta en el estilo activo (ver
// components/PetArt.jsx). Igual se guardan tres PNG, como respaldo y
// para lugares que necesitan una imagen (pósters, mascotas viejas).
// ─────────────────────────────────────────────────────────────────

export const CANVAS = 200;
export const DEFAULT_RECIPE = DEFAULT_MOCHI;

// Paletas completas y coherentes entre sí: sacar los colores uno por
// uno daba combinaciones feas. También hay oscuras y terrosas.
const RANDOM_PALETTES = [
  { bodyColor: '#FBEEE6', innerColor: '#FFFFFF', accentColor: '#E9A3B5', accentAlt: '#FFFFFF', eyeColor: '#6F6A8A' },
  { bodyColor: '#FFD9BE', innerColor: '#FFF1E4', accentColor: '#D8697F', accentAlt: '#FFFFFF', eyeColor: '#5B3E5C' },
  { bodyColor: '#F3E6FF', innerColor: '#FFFFFF', accentColor: '#B8A1FF', accentAlt: '#FFE270', eyeColor: '#7A4A8C' },
  { bodyColor: '#FFE58A', innerColor: '#FFF6C9', accentColor: '#FF9F43', accentAlt: '#FFFFFF', eyeColor: '#7A6A3A' },
  { bodyColor: '#DFE8F2', innerColor: '#FFFFFF', accentColor: '#7FC8F8', accentAlt: '#FF8FAB', eyeColor: '#3E6B8C' },
  { bodyColor: '#B8E6A3', innerColor: '#EFFBE6', accentColor: '#FF8FAB', accentAlt: '#FFFFFF', eyeColor: '#4A6A3A' },
  { bodyColor: '#D9B08C', innerColor: '#F8E7D2', accentColor: '#7E8C61', accentAlt: '#C9A227', eyeColor: '#5E3A24' },
  { bodyColor: '#FFB1C6', innerColor: '#FFF6DC', accentColor: '#C3A7EA', accentAlt: '#FFE270', eyeColor: '#7A4A8C' },
  { bodyColor: '#9DCEEF', innerColor: '#FFFFFF', accentColor: '#3D5AFE', accentAlt: '#FF3E6C', eyeColor: '#2E4A6B' },
  { bodyColor: '#8FDCB3', innerColor: '#FFF6DC', accentColor: '#FF9E1F', accentAlt: '#B14AED', eyeColor: '#2E6B52' },
  { bodyColor: '#463F52', innerColor: '#B9A9C9', accentColor: '#9B6BD6', accentAlt: '#2A2530', eyeColor: '#C9A3FF' },
  { bodyColor: '#2E2933', innerColor: '#5A5264', accentColor: '#D9364F', accentAlt: '#A7A9AC', eyeColor: '#E6C43A' },
  { bodyColor: '#6B2737', innerColor: '#EADFCB', accentColor: '#C9A227', accentAlt: '#2A2530', eyeColor: '#F2C46B' },
  { bodyColor: '#A8B08A', innerColor: '#F6EFE6', accentColor: '#C08552', accentAlt: '#4F5D3A', eyeColor: '#3E4A2A' },
  { bodyColor: '#FF9EDB', innerColor: '#FFF0FA', accentColor: '#B14AED', accentAlt: '#C6FF3D', eyeColor: '#5A2A8A' },
  { bodyColor: '#F6ECDC', innerColor: '#FFFFFF', accentColor: '#7A5644', accentAlt: '#FFFFFF', eyeColor: '#5FB0EE' },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Algunas piezas salen más seguido (lo tierno de base), otras de vez en cuando.
const weighted = (list, favs, k = 0.55) => (Math.random() < k ? pick(favs) : pick(list).id);

export function randomRecipe() {
  return {
    body: pick(SHAPES).id,
    ears: weighted(EARS.filter((e) => e.id !== 'ninguna'), ['gato', 'conejo', 'conejoCaido', 'oso', 'perro', 'pollito', 'rana', 'raton'], 0.5),
    eyes: weighted(EYES, ['redondos', 'redondos', 'grandes', 'puntitos'], 0.6),
    mouth: weighted(MOUTHS, ['w', 'sonrisa', 'hocico', 'w'], 0.6),
    tail: Math.random() < 0.55 ? 'ninguna' : pick(TAILS).id,
    cheeks: weighted(CHEEKS, ['redondos', 'redondos', 'rayitas'], 0.65),
    pattern: Math.random() < 0.6 ? 'ninguno' : pick(PATTERNS).id,
    headAcc: Math.random() < 0.45 ? 'ninguno' : pick(HEAD_ACCESSORIES).id,
    neckAcc: Math.random() < 0.5 ? 'ninguno' : pick(NECK_ACCESSORIES).id,
    extraAcc: Math.random() < 0.7 ? 'ninguno' : pick(EXTRA_ACCESSORIES).id,
    ...pick(RANDOM_PALETTES),
  };
}

const innerOf = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// Cuerpo del SVG (sin <svg> envolvente), sin estilo: para lugares que
// arman su propio <svg>. Lo normal es usar <PetArt>, que la dibuja en el
// estilo activo.
export function PetRecipeMarkup({ recipe, mood }) {
  // eslint-disable-next-line react/no-danger
  return <g dangerouslySetInnerHTML={{ __html: innerOf(mochiSvg(recipe, mood)) }} />;
}

export default function PetRecipePreview({ recipe, mood = 'normal', size = 200 }) {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <PetRecipeMarkup recipe={recipe} mood={mood} />
    </svg>
  );
}

// PNG de respaldo (receta + retoque a mano opcional) en estilo sticker:
// es lo que se guarda en drawing_normal / drawing_feliz / drawing_enojado.
export function recipeToPngDataUrl(recipe, mood, overlayDataUrl, px = 320) {
  const { overlays, ...base } = recipe || {};
  return artToPng({ markup: mochiSvg(base, mood), styleId: 'sticker', size: px, overlays: [overlayDataUrl] })
    .catch(() => overlayDataUrl || '');
}
