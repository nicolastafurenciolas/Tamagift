import React from 'react';
import Sprite from './Sprite';
import PetArt from './PetArt';
import { STYLE_LIST } from '../styles/registry';
import { findFurniture, findPaint } from '../roomCatalog';
import { FOOD_SPRITES } from '../sprites';

// ─────────────────────────────────────────────────────────────────
// Selector de estilo visual.
//
// Cada tarjeta se pinta con los colores y la letra de SU estilo (no
// del activo) y muestra la mascota real ya redibujada en ese estilo,
// junto a un mueble y una comida: se elige viendo el resultado, no
// leyendo un nombre.
// ─────────────────────────────────────────────────────────────────

const plant = findFurniture('planta') || findFurniture('lampara');

function Preview({ s, look, petSrc, petArt, petKey, size }) {
  const pet = look
    ? <PetArt look={look} styleId={s.id} size={size} />
    : petSrc
      ? <Sprite styleId={s.id} src={petSrc} w={size} h={size} kind="pet" />
      : <Sprite styleId={s.id} art={petArt} cacheKey={petKey} w={size} h={size} kind="pet" />;
  return (
    <div style={{ position: 'relative', height: size + 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
      {plant && (
        <Sprite styleId={s.id} art={plant.render(findPaint('natural'))} cacheKey={`pick-${plant.id}`} w={Math.round(size * 0.48)} h={Math.round(size * 0.6)} />
      )}
      {pet}
      <Sprite styleId={s.id} art={FOOD_SPRITES[0].render()} cacheKey="pick-food" w={Math.round(size * 0.34)} h={Math.round(size * 0.34)} />
    </div>
  );
}

export default function StylePicker({ value, onChange, look, petSrc, petArt, petKey = 'pick-pet', columns = 2, size = 74 }) {
  return (
    <div role="radiogroup" aria-label="Estilo visual" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
      {STYLE_LIST.map((s) => {
        const on = value === s.id;
        return (
          <button
            key={s.id}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s.id)}
            className="pg-focus"
            style={{
              position: 'relative', textAlign: 'left', cursor: 'pointer', padding: '10px 10px 9px', minWidth: 0,
              borderRadius: s.id === 'pixel' ? 0 : 18,
              background: s.ui.paper,
              color: s.ui.ink,
              border: `${on ? 3 : 1.5}px solid ${on ? s.ui.rose : s.ui.line}`,
              boxShadow: on ? `0 0 0 3px ${s.ui.roseSoft}, ${s.shadow.soft}` : s.shadow.soft,
              transform: on ? 'translateY(-2px)' : 'none',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <Preview s={s} look={look} petSrc={petSrc} petArt={petArt} petKey={petKey} size={size} />
            <div style={{ fontFamily: s.fonts.display, fontWeight: 700, fontSize: 14, marginTop: 6, lineHeight: 1.1 }}>{s.name}</div>
            <div style={{ fontFamily: s.fonts.body, fontSize: 11, color: s.ui.inkSoft, lineHeight: 1.25, marginTop: 2 }}>{s.tagline}</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
              {['rose', 'amber', 'sage', 'sky', 'lavender'].map((k) => (
                <span key={k} style={{ width: 12, height: 12, borderRadius: s.id === 'pixel' ? 0 : 4, background: s.ui[k], border: `1px solid ${s.ui.line}` }} />
              ))}
            </div>
            {on && (
              <span style={{ position: 'absolute', top: 8, right: 8, background: s.ui.rose, color: s.ui.onAccent, fontFamily: s.fonts.display, fontSize: 10, fontWeight: 800, borderRadius: 999, padding: '2px 8px' }}>
                Elegido
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
