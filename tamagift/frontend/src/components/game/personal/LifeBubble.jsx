import React from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import Sprite from '../../Sprite';
import { foodSpriteFor } from '../../../sprites';

// ─────────────────────────────────────────────────────────────────
// La burbuja de una escena de la vida de la mascota (personal/life.js):
// lo que dice y, si viene al caso, la foto que mira o con la que sueña,
// la comida que cocinó y un botón ("Ponerla", "¡A comer!").
//   scene.photoUrl / scene.food → miniatura;  offer → botón
// ─────────────────────────────────────────────────────────────────

export default function LifeBubble({ scene, onOffer }) {
  const dream = scene.kind === 'sueno';
  const thumb = scene.photoUrl
    ? <img src={scene.photoUrl} alt="" style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8, border: '3px solid #FFFFFF', boxShadow: SHADOW.soft, transform: 'rotate(-4deg)', flexShrink: 0, filter: dream ? 'saturate(0.8) brightness(1.05)' : 'none' }} />
    : scene.food
      ? (scene.food.image
        ? <img src={scene.food.image} alt="" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
        : <Sprite art={foodSpriteFor(scene.food.name).render()} cacheKey={`food-${foodSpriteFor(scene.food.name).id}`} w={38} h={38} />)
      : null;
  return (
    <div className="pg-anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 9, background: C.glass, borderRadius: dream ? 22 : 16,
          border: `1.5px ${dream ? 'dashed' : 'solid'} ${dream ? C.lavender : C.rose}`, padding: '7px 13px', boxShadow: SHADOW.soft,
          fontFamily: FONT.body, fontSize: 12.5, fontWeight: 600, color: C.ink, lineHeight: 1.3, textAlign: thumb ? 'left' : 'center',
        }}
      >
        {thumb}
        <span>{scene.text}</span>
      </div>
      {scene.offer && onOffer && (
        <button
          onClick={onOffer} className="pg-btn pg-btn-rose pg-focus"
          style={{ pointerEvents: 'auto', padding: '6px 14px', fontSize: 12.5 }}
        >
          {scene.offer.label}
        </button>
      )}
    </div>
  );
}
