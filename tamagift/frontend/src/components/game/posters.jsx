import React from 'react';
import Sprite from '../Sprite';
import { UISprite } from './common';
import { DEMO_POSTER_ART } from '../../sprites';
import { POSTER } from '../../roomCatalog';

// Pósters: las fotos que subió quien regaló para colgar en el cuarto.
// La mascota de demostración trae tres dibujos de muestra.

export function buildPosterList(pet) {
  const real = ((pet && pet.photos) || [])
    .filter((p) => p.used_for === 'poster' && p.url)
    // Id ESTABLE del backend (no la posición): la tienda tiene que saber
    // qué póster se compró aunque la lista cambie de orden.
    .map((p, i) => ({ id: p.id ?? `poster-${i}`, type: 'photo', url: p.url, price: p.price || 0 }));
  if (real.length) return real;
  return DEMO_POSTER_ART.map((d) => ({ ...d, type: 'demo', price: 0 }));
}

// El póster colgado: marco dibujado (cada estilo lo redibuja, se pinta
// como un mueble) y la foto adentro. Con solo `h`, el ancho sale del marco.
export function FramedPoster({ poster, paint = 'natural', w, h, pixel }) {
  const W = Math.round(w || (h * POSTER.vw) / POSTER.vh);
  const H = Math.round(h || (w * POSTER.vh) / POSTER.vw);
  const k = W / POSTER.vw;
  const ph = POSTER.photo;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <Sprite markup={POSTER.svg(paint)} cacheKey={`poster-frame-${paint}`} w={W} h={H} pixel={pixel} />
      <div style={{ position: 'absolute', left: ph.x * k, top: ph.y * k, width: ph.w * k, height: ph.h * k, overflow: 'hidden' }}>
        <PosterArt poster={poster} w={Math.round(ph.w * k)} h={Math.round(ph.h * k)} />
      </div>
    </div>
  );
}

// Contenido de un póster a un tamaño dado. Las fotos pasan por el
// estilo como "foto" (se tramean en pixel, se tiñen en neón…): en el
// cuarto son decoración y deben verse del mismo mundo que el resto.
export function PosterArt({ poster, w, h, styled = true }) {
  if (poster.type === 'photo') {
    if (!styled) return <img src={poster.url} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    return <Sprite src={poster.url} w={w} h={h} kind="photo" fit="cover" />;
  }
  return (
    <div style={{ width: w, height: h, background: poster.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <UISprite name={poster.sprite} size={Math.round(Math.min(w, h) * 0.62)} />
    </div>
  );
}
