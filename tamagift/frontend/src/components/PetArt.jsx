import React, { useEffect, useMemo, useState } from 'react';
import Sprite from './Sprite';
import { useStyle } from '../styles/StyleContext';
import { getStyle } from '../styles/registry';
import { mochiSvg } from '../art/mochi';
import { pixelateOverlay } from '../art/render';
import { pixelSizeFor } from '../art/kit';
import { overlayFor } from '../petLook';

// ─────────────────────────────────────────────────────────────────
// La mascota dibujada en el estilo activo a partir de su "look"
// (petLook.js). Si tiene receta, cada estilo la dibuja de cero; si es
// una mascota vieja con PNG, el PNG pasa por el motor de imágenes.
//
//   <PetArt look={look} mood="feliz" size={190} />
//   <PetArt recipe={receta} mood="normal" size={64} view="40 90 120 80" />
// ─────────────────────────────────────────────────────────────────

function Overlay({ src, size, pixelSize, flip }) {
  const [url, setUrl] = useState(pixelSize ? null : src);
  useEffect(() => {
    if (!pixelSize) { setUrl(src); return undefined; }
    let alive = true;
    pixelateOverlay(src, Math.max(8, Math.round(size / pixelSize))).then((u) => alive && setUrl(u)).catch(() => alive && setUrl(src));
    return () => { alive = false; };
  }, [src, size, pixelSize]);
  if (!url) return null;
  return (
    <img
      src={url} alt="" draggable="false"
      className={pixelSize ? 'pg-pixelated' : undefined}
      style={{ position: 'absolute', inset: 0, width: size, height: size, pointerEvents: 'none', transform: flip ? 'scaleX(-1)' : undefined }}
    />
  );
}

export default function PetArt({ look, recipe: recipeProp, mood = 'normal', size, pixel, styleId: forced, flip = false, view, style, className, alt = 'mascota' }) {
  const { styleId: active } = useStyle();
  const styleId = forced || active;
  const recipe = recipeProp || (look && look.recipe) || null;
  const base = useMemo(() => {
    if (!recipe) return null;
    const { overlays, ...rest } = recipe;
    return rest;
  }, [recipe]);
  const baseKey = base ? JSON.stringify(base) : '';
  const markup = useMemo(() => {
    if (!base) return null;
    const m = mochiSvg(base, mood);
    return view ? m.replace('viewBox="0 0 200 200"', `viewBox="${view}"`) : m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey, mood, view]);

  const st = getStyle(styleId);
  const pixelSize = st.art.kind === 'pixel' ? pixelSizeFor(st, size, size, pixel) : 0;
  const wrap = { position: 'relative', width: size, height: size, flexShrink: 0, ...style };

  if (markup) {
    const ov = !view ? overlayFor(recipe, mood) : null;
    return (
      <div className={className} style={wrap} role="img" aria-label={alt}>
        <Sprite
          markup={markup} cacheKey={`mochi:${baseKey}:${mood}:${view || ''}`} w={size} h={size} kind="pet" pixel={pixel} styleId={styleId}
          imgStyle={flip ? { transform: 'translate(-50%, -50%) scaleX(-1)' } : undefined}
        />
        {ov && <Overlay src={ov} size={size} pixelSize={pixelSize} flip={flip} />}
      </div>
    );
  }
  const url = look && look.urls ? (look.urls[mood] || look.urls.normal) : null;
  if (url) {
    return <Sprite src={url} w={size} h={size} kind="pet" pixel={pixel} styleId={styleId} className={className} alt={alt} style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }} />;
  }
  return <div className={className} style={wrap} />;
}
