import React, { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useStyle } from '../styles/StyleContext';
import { renderSprite, spriteCacheKey, peekSprite, hashString } from '../styles/spriteEngine';

// ─────────────────────────────────────────────────────────────────
// <Sprite>: muestra cualquier arte ya redibujado en el estilo activo.
//
//   <Sprite art={<svg…/>} w={64} h={64} />          arte de la app
//   <Sprite src={pet.drawing_normal} w={190} h={190} kind="pet" />
//   <Sprite src={foto} w={48} h={48} kind="photo" />
//
// Mientras el motor trabaja se muestra la fuente tal cual, así nunca
// queda un hueco; cuando llega la versión con estilo la reemplaza.
// `w`/`h` son el tamaño en pantalla: en pixel definen cuántos píxeles
// de arte tendrá el sprite, por eso importa pasarlos bien.
// ─────────────────────────────────────────────────────────────────

export default function Sprite({
  art, src, w, h, kind = 'art', fit, pixel, cacheKey,
  styleId: forcedStyle, alt = '', className = '', style, imgStyle, title,
}) {
  const { styleId: activeStyle, style: activeStyleDef } = useStyle();
  const styleId = forcedStyle || activeStyle;

  // Serializar un SVG de React cuesta: se hace una vez por `cacheKey`
  // (o por render si no se dio uno).
  const markup = useMemo(
    () => (art ? renderToStaticMarkup(art) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey || art],
  );
  const sourceKey = useMemo(
    () => (cacheKey ? `k:${cacheKey}` : hashString(markup || src || '')),
    [cacheKey, markup, src],
  );

  const req = { markup, src, w, h, kind, fit, pixel, sourceKey };
  const key = spriteCacheKey(req, styleId);
  const [result, setResult] = useState(() => peekSprite(key));

  useEffect(() => {
    if (!markup && !src) { setResult(null); return undefined; }
    const ready = peekSprite(key);
    if (ready) { setResult(ready); return undefined; }
    let alive = true;
    renderSprite({ ...req, styleId }).then((r) => { if (alive) setResult({ ...r, key }); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const box = { position: 'relative', width: w, height: h, flexShrink: 0, ...style };
  const current = peekSprite(key) || (result && result.key === key ? result : null);

  if (current) {
    const isPixel = current.pixelated;
    return (
      <div className={className} style={box} title={title}>
        <img
          src={current.url}
          alt={alt}
          draggable="false"
          className={`pg-sprite${isPixel ? ' pg-pixelated' : ''}`}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: current.cssW, height: current.cssH,
            transform: 'translate(-50%, -50%)', pointerEvents: 'none',
            ...imgStyle,
          }}
        />
      </div>
    );
  }

  // Provisional: la fuente sin estilo, para que no parpadee un hueco.
  return (
    <div className={className} style={box} title={title}>
      {src ? (
        <img
          src={src} alt={alt} draggable="false" className="pg-sprite"
          style={{ width: '100%', height: '100%', objectFit: fit || (kind === 'photo' ? 'cover' : 'contain'), pointerEvents: 'none', opacity: activeStyleDef.art.kind === 'pixel' ? 0.0 : 0.9, ...imgStyle }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', opacity: activeStyleDef.art.kind === 'pixel' ? 0 : 0.9, pointerEvents: 'none' }}>{art}</div>
      )}
    </div>
  );
}

// Para quien necesita el data URL directo (fondos CSS, canvas…).
export function useStyledUrl({ src, markup, w, h, kind = 'art', fit, pixel, sourceKey }) {
  const { styleId } = useStyle();
  const req = { src, markup, w, h, kind, fit, pixel, sourceKey };
  const key = (src || markup) ? spriteCacheKey(req, styleId) : null;
  const [r, setR] = useState(() => (key ? peekSprite(key) : null));
  useEffect(() => {
    if (!key) { setR(null); return undefined; }
    const hit = peekSprite(key);
    if (hit) { setR(hit); return undefined; }
    let alive = true;
    renderSprite({ ...req, styleId }).then((v) => alive && setR(v)).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return key && r ? r : null;
}
