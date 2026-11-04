import React, { useEffect, useMemo, useState } from 'react';
import Sprite from '../../Sprite';
import { useStyle } from '../../../styles/StyleContext';
import { STYLE_LIST, getStyle } from '../../../styles/registry';
import { pixelSizeFor } from '../../../art/kit';
import { findPhotoObject, photoClipCss, PHOTO_OBJECT_DEFS } from '../../../art/room/photoObjects';

// ─────────────────────────────────────────────────────────────────
// Un objeto del cuarto con una foto real adentro (art/room/photoObjects):
// tres capas que encajan exacto — lo de atrás (dibujado por el kit del
// estilo), la foto (por el motor de imágenes: en pixel se pixela con la
// misma rejilla, en neón se tiñe…) y lo de adelante (el borde que tapa el
// corte, el volumen y el brillo).
//
//   <PhotoObject kind="marco" url={foto} w={95} pixel={px} />
//
// `w`: ancho en pantalla (el alto sale del objeto). `pixel`: el tamaño
// del píxel de arte (el cuarto lo pasa; si falta se calcula igual que el
// kit, así las tres capas comparten la rejilla).
// ─────────────────────────────────────────────────────────────────

export default function PhotoObject({ kind, url, w, h, pixel, styleId, style: boxStyle }) {
  const def = findPhotoObject(kind);
  const ctx = useStyle();
  const style = styleId ? getStyle(styleId) : ctx.style;
  if (!def) return null;
  const W = Math.round(w || (h * def.w) / def.h);
  const H = Math.round(h || (W * def.h) / def.w);
  const k = W / def.w;
  const isPixel = style.art.kind === 'pixel';
  const px = isPixel ? (pixel || pixelSizeFor(style, W, H)) : undefined;
  const P = def.photo;
  // en pixel la foto cae en la rejilla del dibujo (si no, quedaba una
  // costura de medio píxel entre la foto y su marco)
  const snap = (v) => (px ? Math.round(v / px) * px : v);
  const left = snap(P.x * k), top = snap(P.y * k);
  const pw = snap(P.w * k), ph = snap(P.h * k);
  const clip = photoClipCss(def);
  const rot = !isPixel && def.rot ? def.rot : 0;
  const pivot = def.pivot ? [def.pivot[0] * k - left, def.pivot[1] * k - top] : null;
  return (
    <div style={{ position: 'relative', width: W, height: H, ...boxStyle }}>
      <Sprite markup={def.back()} cacheKey={`foto-${kind}-b`} w={W} h={H} pixel={px} styleId={styleId} style={{ position: 'absolute', left: 0, top: 0 }} />
      {url && (
        <div
          style={{
            position: 'absolute', left, top, width: pw, height: ph, overflow: 'hidden',
            clipPath: clip || undefined, WebkitClipPath: clip || undefined,
            transform: rot ? `rotate(${rot}deg)` : undefined,
            transformOrigin: pivot ? `${pivot[0]}px ${pivot[1]}px` : undefined,
          }}
        >
          <Sprite src={url} w={pw} h={ph} kind="photo" fit="cover" pixel={px} styleId={styleId} />
        </div>
      )}
      <Sprite markup={def.front()} cacheKey={`foto-${kind}-f`} w={W} h={H} pixel={px} styleId={styleId} style={{ position: 'absolute', left: 0, top: 0 }} />
    </div>
  );
}

// ── Laboratorio: /arte?set=fotos&size=220 ────────────────────────
// Cada objeto en los seis estilos, con una foto de prueba dibujada en el
// momento (una pareja al atardecer: cielo, sol, dos siluetas) o la de
// `&foto=<url>`. `&escena=1` los muestra a tamaño de juego sobre una
// mesita y en la pared.
function testPhoto(seed = 0) {
  const c = document.createElement('canvas');
  c.width = 480; c.height = 360;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 360);
  const pal = [['#FFB38A', '#FF7FA1', '#7A6AD8'], ['#9ED8FF', '#CFEFFF', '#7FC8A0']][seed % 2];
  sky.addColorStop(0, pal[2]); sky.addColorStop(0.55, pal[1]); sky.addColorStop(1, pal[0]);
  g.fillStyle = sky; g.fillRect(0, 0, 480, 360);
  g.fillStyle = '#FFF2B8'; g.beginPath(); g.arc(330, 170, 54, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3E5A8A'; g.fillRect(0, 238, 480, 122);
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 6; i++) g.fillRect(250 + i * 9, 250 + i * 14, 160 - i * 20, 4);
  // dos personas abrazadas
  g.fillStyle = '#2A2238';
  g.beginPath(); g.arc(196, 150, 26, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(250, 160, 24, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(196, 260, 46, 92, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(252, 270, 42, 86, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FF5C8A'; g.beginPath(); g.moveTo(224, 108); g.bezierCurveTo(200, 86, 214, 64, 224, 80); g.bezierCurveTo(234, 64, 248, 86, 224, 108); g.fill();
  return c.toDataURL('image/jpeg', 0.9);
}

export function PhotoObjectsLab() {
  const q = new URLSearchParams(window.location.search);
  const size = Number(q.get('size') || 200);
  const only = q.get('solo');
  const styles = only ? STYLE_LIST.filter((s) => only.split(',').includes(s.id)) : STYLE_LIST;
  const ids = q.get('ids') ? q.get('ids').split(',') : null;
  const defs = PHOTO_OBJECT_DEFS.filter((d) => !ids || ids.includes(d.id));
  const photo = useMemo(() => q.get('foto') || testPhoto(Number(q.get('f') || 0)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // listo cuando no queda ningún sprite pendiente
    let n = 0;
    const id = setInterval(() => {
      n++;
      if (!document.querySelector('[data-sprite-pending]') || n > 120) { clearInterval(id); setReady(true); document.body.dataset.ready = '1'; }
    }, 250);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ padding: 16, background: '#fff' }} data-done={ready ? '1' : '0'}>
      {styles.map((st) => (
          <div key={st.id} data-row={st.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end', background: st.ui.paper, padding: '10px 12px', marginBottom: 6, borderRadius: 12 }}>
            <div style={{ width: 90, fontFamily: st.fonts.display, color: st.ui.ink, fontSize: 14 }}>{st.name}</div>
            {defs.map((d) => (
              <div key={d.id} style={{ textAlign: 'center' }}>
                <PhotoObject kind={d.id} url={photo} styleId={st.id} w={Math.round((size * d.w) / Math.max(d.w, d.h))} />
                <div style={{ fontSize: 11, color: st.ui.inkSoft, fontFamily: 'sans-serif' }}>{d.name}</div>
              </div>
            ))}
            {q.get('escena') && defs.map((d) => (
              <div key={`${d.id}-g`} style={{ textAlign: 'center' }}>
                <PhotoObject kind={d.id} url={photo} styleId={st.id} w={Math.round(d.w * 1.25 * 0.6)} />
                <div style={{ fontSize: 10, color: st.ui.inkSoft, fontFamily: 'sans-serif' }}>juego</div>
              </div>
            ))}
          </div>
      ))}
    </div>
  );
}
