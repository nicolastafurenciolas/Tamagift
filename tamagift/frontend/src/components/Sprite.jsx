import React, { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useStyle } from '../styles/StyleContext';
import { renderSprite, spriteCacheKey, peekSprite, hashString } from '../styles/spriteEngine';
import { renderArt, artKey, peekArt } from '../art/render';

// ─────────────────────────────────────────────────────────────────
// <Sprite>: muestra cualquier arte en el estilo activo.
//
//   <Sprite art={<svg…/>} w={64} h={64} />          arte de la app
//   <Sprite markup="<svg…>" w={64} h={64} />         arte ya en texto
//   <Sprite src={foto} w={48} h={48} kind="photo" />  imagen subida
//
// El arte de la app (art / markup) lo DIBUJA cada estilo con su kit
// (art/kit.js): pixel arma los píxeles pieza por pieza, papel recorta
// cartulina, neón enciende tubos… Las imágenes subidas por quien regala
// (fotos, dibujos) pasan por el motor de imágenes (styles/spriteEngine).
//
// Mientras se dibuja se muestra la fuente tal cual, así nunca queda un
// hueco; `w`/`h` son el tamaño en pantalla (en pixel deciden cuántos
// píxeles de arte tiene el sprite).
// ─────────────────────────────────────────────────────────────────

export default function Sprite({
  art, markup: markupProp, src, w, h, kind = 'art', fit, pixel, cacheKey,
  styleId: forcedStyle, alt = '', className = '', style, imgStyle, title,
}) {
  const { styleId: activeStyle, style: activeStyleDef } = useStyle();
  const styleId = forcedStyle || activeStyle;

  // Serializar un SVG de React cuesta: se hace una vez por `cacheKey`.
  const markup = useMemo(
    () => markupProp || (art ? renderToStaticMarkup(art) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey || markupProp || art],
  );
  const sourceKey = useMemo(
    () => (cacheKey ? `k:${cacheKey}` : hashString(markup || src || '')),
    [cacheKey, markup, src],
  );

  const isArt = !!markup;
  const req = { markup, src, w, h, kind, fit, pixel, sourceKey, styleId };
  const key = isArt ? artKey(req) : spriteCacheKey(req, styleId);
  const peek = isArt ? peekArt : peekSprite;
  const [result, setResult] = useState(() => peek(key));

  useEffect(() => {
    if (!markup && !src) { setResult(null); return undefined; }
    const ready = peek(key);
    if (ready) { setResult({ ...ready, key }); return undefined; }
    let alive = true;
    (isArt ? renderArt(req) : renderSprite(req)).then((r) => { if (alive) setResult({ ...r, key }); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const box = { position: 'relative', width: w, height: h, flexShrink: 0, ...style };
  const current = peek(key) || (result && result.key === key ? result : null);

  if (current) {
    return (
      <div className={className} style={box} title={title}>
        <img
          src={current.url}
          alt={alt}
          draggable="false"
          className={`pg-sprite${current.pixelated ? ' pg-pixelated' : ''}`}
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
  // `data-sprite-pending` permite saber (en pruebas) si falta alguno.
  const hide = activeStyleDef.art.kind === 'pixel' ? 0 : 0.9;
  return (
    <div className={className} style={box} title={title} data-sprite-pending="1">
      {src ? (
        <img
          src={src} alt={alt} draggable="false" className="pg-sprite"
          style={{ width: '100%', height: '100%', objectFit: fit || (kind === 'photo' ? 'cover' : 'contain'), pointerEvents: 'none', opacity: hide, ...imgStyle }}
        />
      ) : art ? (
        <div style={{ width: '100%', height: '100%', opacity: hide, pointerEvents: 'none' }}>{art}</div>
      ) : null}
    </div>
  );
}

// Para quien necesita el data URL directo (fondos CSS, canvas…).
export function useStyledUrl({ src, markup, w, h, kind = 'art', fit, pixel, sourceKey }) {
  const { styleId } = useStyle();
  const req = { src, markup, w, h, kind, fit, pixel, styleId, sourceKey: sourceKey || hashString(markup || src || '') };
  const isArt = !!markup;
  const key = (src || markup) ? (isArt ? artKey(req) : spriteCacheKey(req, styleId)) : null;
  const peek = isArt ? peekArt : peekSprite;
  const [r, setR] = useState(() => (key ? peek(key) : null));
  useEffect(() => {
    if (!key) { setR(null); return undefined; }
    const hit = peek(key);
    if (hit) { setR(hit); return undefined; }
    let alive = true;
    (isArt ? renderArt(req) : renderSprite(req)).then((v) => alive && setR(v)).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return key && r ? r : null;
}
