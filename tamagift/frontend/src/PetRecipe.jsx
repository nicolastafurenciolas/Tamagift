import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { BODIES, EARS, EYES, MOUTHS, CHEEK_STYLES, renderCheeks, renderBody, neckFit, INK } from './petParts';
import { TAILS, PATTERNS, renderPattern, HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, findPart } from './petAccessories';

// ─────────────────────────────────────────────────────────────────
// El "compositor": arma la mascota modular (estilo Tomodachi Life) a
// partir de una receta de partes + colores, para los 3 ánimos.
//
// Decisión importante: el backend NO cambia. Al terminar de elegir
// partes (y, si quiere, dibujar detalles encima), esto se rasteriza a
// 3 PNG normales — exactamente lo que ya guardaba el motor de dibujo
// libre. El resto de la app (el juego, el rompecabezas, etc.) no sabe
// ni le importa si el dibujo vino de partes o de un pincel libre.
// ─────────────────────────────────────────────────────────────────

export const CANVAS = 200;

export const DEFAULT_RECIPE = {
  body: 'redondo',
  ears: 'gato',
  eyes: 'redondos',
  mouth: 'sonrisa',
  tail: 'ninguna',
  cheeks: 'redondos',
  pattern: 'ninguno',
  headAcc: 'ninguno',
  neckAcc: 'ninguno',
  extraAcc: 'ninguno',
  bodyColor: '#FFD9BE',
  innerColor: '#FFF1E4',
  accentColor: '#D8697F',
  accentAlt: '#FFFFFF',
  eyeColor: '#5B3E5C',
};

// Paletas completas y coherentes entre sí. Sacar los colores al azar
// uno por uno daba combinaciones feas; además todas eran pastel, y una
// mascota sorpresa también tiene que poder salir oscura o terrosa.
const RANDOM_PALETTES = [
  { bodyColor: '#FFD9BE', innerColor: '#FFF1E4', accentColor: '#D8697F', accentAlt: '#FFFFFF', eyeColor: '#5B3E5C' },
  { bodyColor: '#FFB1C6', innerColor: '#FFF6DC', accentColor: '#C3A7EA', accentAlt: '#FFE270', eyeColor: '#7A4A8C' },
  { bodyColor: '#9DCEEF', innerColor: '#FFFFFF', accentColor: '#3D5AFE', accentAlt: '#FF3E6C', eyeColor: '#3E6B8C' },
  { bodyColor: '#8FDCB3', innerColor: '#FFF6DC', accentColor: '#FF9E1F', accentAlt: '#B14AED', eyeColor: '#5E8873' },
  { bodyColor: '#F2EAE0', innerColor: '#FFFFFF', accentColor: '#7FA894', accentAlt: '#E2A845', eyeColor: '#5E8873' },
  { bodyColor: '#463F52', innerColor: '#B9A9C9', accentColor: '#2A2530', accentAlt: '#9B6BD6', eyeColor: '#B14AED' },
  { bodyColor: '#221E29', innerColor: '#4A4454', accentColor: '#151217', accentAlt: '#A7A9AC', eyeColor: '#C9A227' },
  { bodyColor: '#5A5560', innerColor: '#D8CFC7', accentColor: '#B0453F', accentAlt: '#231F2B', eyeColor: '#2E2422' },
  { bodyColor: '#6B2737', innerColor: '#EADFCB', accentColor: '#C9A227', accentAlt: '#2A2530', eyeColor: '#C1553F' },
  { bodyColor: '#D9A05B', innerColor: '#F6EFE6', accentColor: '#7E8C61', accentAlt: '#8B5E3C', eyeColor: '#5E8873' },
  { bodyColor: '#8B5E3C', innerColor: '#EADFCB', accentColor: '#4A1F2B', accentAlt: '#C9A227', eyeColor: '#8B5E3C' },
  { bodyColor: '#A8B08A', innerColor: '#F6EFE6', accentColor: '#4F5D3A', accentAlt: '#C08552', eyeColor: '#5E8873' },
  { bodyColor: '#FF6FD8', innerColor: '#F0E6FB', accentColor: '#B14AED', accentAlt: '#C6FF3D', eyeColor: '#2BE8E8' },
  { bodyColor: '#B14AED', innerColor: '#FFE8EE', accentColor: '#FF3E6C', accentAlt: '#C9A227', eyeColor: '#FF3E6C' },
  { bodyColor: '#3D3A44', innerColor: '#C6FF3D', accentColor: '#C6FF3D', accentAlt: '#231F2B', eyeColor: '#FF3E6C' },
  { bodyColor: '#E3D6FA', innerColor: '#FFF1E4', accentColor: '#F582A7', accentAlt: '#FFFFFF', eyeColor: '#7A4A8C' },
];

export function randomRecipe() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
  const pal = RANDOM_PALETTES[Math.floor(Math.random() * RANDOM_PALETTES.length)];
  return {
    body: pick(BODIES),
    ears: pick(EARS),
    eyes: pick(EYES),
    mouth: pick(MOUTHS),
    tail: pick(TAILS),
    cheeks: pick(CHEEK_STYLES),
    pattern: pick(PATTERNS),
    headAcc: pick(HEAD_ACCESSORIES),
    neckAcc: pick(NECK_ACCESSORIES),
    extraAcc: pick(EXTRA_ACCESSORIES),
    ...pal,
  };
}

// Cuerpo del SVG (sin <svg> envolvente) para poder componerlo tanto en
// vivo (preview) como al rasterizar a canvas.
export function PetRecipeMarkup({ recipe, mood }) {
  const r = recipe;
  const body = findPart(BODIES, r.body);
  const ears = findPart(EARS, r.ears);
  const eyes = findPart(EYES, r.eyes);
  const mouth = findPart(MOUTHS, r.mouth);
  const tail = findPart(TAILS, r.tail);
  const headAcc = findPart(HEAD_ACCESSORIES, r.headAcc);
  const neckAcc = findPart(NECK_ACCESSORIES, r.neckAcc);
  const extraAcc = findPart(EXTRA_ACCESSORIES, r.extraAcc);

  const face = body.face || { cx: 100, cy: 112, w: 1 };
  const eyeY = face.cy - 4;
  const mouthY = face.cy + 26;
  const cheekY = face.cy + 14;
  const cheekSpread = 40 * face.w;

  const colorSet = {
    body: r.bodyColor, inner: r.innerColor,
    accent: r.accentColor, accentAlt: r.accentAlt,
    eye: r.eyeColor || null,
  };
  const cheekColor = r.accentColor === '#4A3439' ? '#FFB1C6' : r.accentColor;

  // Los accesorios de cuello se dibujan en un espacio canónico y aquí se
  // estiran al cuello real de ESTE cuerpo — si no, en un cuerpo gordito o
  // de pera se quedan cortos y no llegan a cubrir.
  const nf = neckFit(body);
  const wrapNeck = (node, fit = true) =>
    (node ? <g transform={fit ? nf.transform : undefined}>{node}</g> : null);

  return (
    <>
      {/* Capas de atrás: cola, orejas y la parte del accesorio de cuello
          que pasa POR DETRÁS (así una bufanda envuelve de verdad). */}
      {tail.render(colorSet)}
      {ears.render(colorSet)}
      {neckAcc.back && wrapNeck(neckAcc.back(colorSet, nf), neckAcc.fitBack !== false)}

      {/* Cuerpo con volumen (patitas, pancita, luz y sombra) */}
      {renderBody(body, colorSet)}

      {renderPattern(r.pattern, r.accentColor, face.w)}
      {renderCheeks(r.cheeks, face.cx, cheekY, cheekSpread, cheekColor)}

      {/* Maquillaje que va sobre la piel pero DEBAJO de la mirada
          (corpse paint, sombras): si fuera encima taparía los ojos. */}
      {extraAcc.under && extraAcc.under(colorSet, face.cx, eyeY)}

      {eyes.render(face.cx, eyeY, mood, colorSet)}
      {mouth.render(face.cx, mouthY, mood, colorSet)}

      {/* Capas de adelante */}
      {wrapNeck(neckAcc.render(colorSet, nf))}
      {headAcc.render(colorSet)}
      {extraAcc.render(colorSet, face.cx, eyeY)}
    </>
  );
}

// Vista previa en vivo (para el asistente).
export default function PetRecipePreview({ recipe, mood = 'normal', size = 200 }) {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <PetRecipeMarkup recipe={recipe} mood={mood} />
    </svg>
  );
}

// Convierte la receta (+ opcional overlay dibujado a mano) a un PNG
// data URL de `px`×`px`, para los 3 ánimos. Esto es lo que se guarda
// en drawing_normal / drawing_feliz / drawing_enojado, igual que antes.
export function recipeToPngDataUrl(recipe, mood, overlayDataUrl, px = 320) {
  return new Promise((resolve) => {
    const svgMarkupString = renderToStaticSvgString(recipe, mood, px);
    const svgBlobUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkupString)))}`;

    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');

    const baseImg = new Image();
    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, px, px);
      if (overlayDataUrl) {
        const overlayImg = new Image();
        overlayImg.onload = () => {
          ctx.drawImage(overlayImg, 0, 0, px, px);
          resolve(canvas.toDataURL('image/png'));
        };
        overlayImg.onerror = () => resolve(canvas.toDataURL('image/png'));
        overlayImg.src = overlayDataUrl;
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    };
    baseImg.onerror = () => resolve(overlayDataUrl || '');
    baseImg.src = svgBlobUrl;
  });
}

// Serializa la receta a un string SVG completo (con namespace), para
// poder cargarlo en una <Image> y dibujarlo en canvas.
function renderToStaticSvgString(recipe, mood, px) {
  const inner = ReactDOMServer.renderToStaticMarkup(<PetRecipeMarkup recipe={recipe} mood={mood} />);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${CANVAS} ${CANVAS}">${inner}</svg>`;
}
