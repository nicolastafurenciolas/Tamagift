import React from 'react';
import Sprite from '../Sprite';
import { UISprite } from './common';
import { DEMO_POSTER_ART } from '../../sprites';

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
