import React, { useEffect, useRef, useState } from 'react';
import Sprite from '../Sprite';
import { C } from '../../theme';
import { UI_SPRITES, FOOD_SPRITES } from '../../sprites';

// ─────────────────────────────────────────────────────────────────
// Utilidades compartidas por los minijuegos.
// ─────────────────────────────────────────────────────────────────

// Ancho real de un elemento (los tableros se dibujan en % para caber
// en cualquier celular, pero el motor de sprites necesita píxeles).
export function useElementWidth(fallback = 300) {
  const ref = useRef(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setW(Math.round(el.clientWidth) || fallback);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, w];
}

// La mascota dentro de un minijuego. Sin dibujo (demo), una pelotita.
export function PetSprite({ src, size, flip = false, style }) {
  if (!src) {
    return (
      <div
        className="pg-keep-round"
        style={{ width: size * 0.8, height: size * 0.8, margin: size * 0.1, borderRadius: '50%', background: C.peach, border: `2px solid ${C.ink}`, ...style }}
      />
    );
  }
  return (
    <Sprite
      src={src} w={size} h={size} kind="pet"
      style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  );
}

// Un sprite de la biblioteca propia por nombre (burbuja, bandera…).
export function UISprite({ name, size, style, title }) {
  const render = UI_SPRITES[name];
  if (!render) return null;
  return <Sprite art={render()} cacheKey={`ui-${name}`} w={size} h={size} style={style} title={title} />;
}

export function FoodSprite({ food, size, style }) {
  const f = food || FOOD_SPRITES[0];
  return <Sprite art={f.render()} cacheKey={`food-${f.id}`} w={size} h={size} style={style} />;
}

// Imagen subida por quien regala (comida, objeto): recortada con su
// transparencia, así que se trata como arte y no como foto.
export function UploadSprite({ src, size, kind = 'art', style }) {
  return <Sprite src={src} w={size} h={size} kind={kind} style={style} />;
}
