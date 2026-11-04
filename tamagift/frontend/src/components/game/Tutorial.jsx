import React, { useEffect, useState } from 'react';
import { C, FONT } from '../../theme';
import { PetSprite } from './common';

// ── Guía de bienvenida ────────────────────────────────────────────
// Al abrir el regalo por primera vez la mascota se presenta y enseña lo
// básico, señalando cada cosa en la pantalla. Antes se llegaba al cuarto
// sin ninguna explicación y había que adivinar para qué servía cada
// botón.
//
// Cada paso ilumina un elemento marcado con `data-tut="…"` y oscurece el
// resto (el resto no se puede tocar, lo iluminado sí). Un paso con
// `waitFor` no tiene botón: avanza cuando se hace lo que pide (el juego
// llama a `onNext`).

export const TUTORIAL_REWARD = 50;

export const TUTORIAL_STEPS = [
  {
    id: 'hola', target: () => 'room', next: '¡Hola!',
    text: ({ name, creator }) => `¡Hola! Soy ${name}${creator ? ` y ${creator} me hizo para ti` : ''}. Desde hoy vivo aquí contigo. Tócame cuando quieras.`,
  },
  {
    id: 'barras', target: () => 'meters', next: 'Entendido',
    text: () => 'Estas barras son lo que necesito: comida, cariño, energía y un buen baño. Bajan con el tiempo, así que pásate a verme.',
  },
  {
    id: 'comer', target: ({ foodOpen }) => (foodOpen ? 'food' : 'dock-comer'), waitFor: 'feed',
    text: ({ foodOpen }) => (foodOpen
      ? 'Elige algo. Tengo comidas favoritas… ¡y otras que no tanto!'
      : 'Tengo un poquito de hambre… Toca Alimentar.'),
  },
  {
    id: 'jugar', target: () => 'dock-jugar', next: 'Siguiente',
    text: () => 'En Jugar hay minijuegos para ganar monedas. Cada día hay retos nuevos, y la primera partida de cada juego paga el doble.',
  },
  {
    id: 'tienda', target: () => 'dock-tienda', next: 'Siguiente',
    text: () => 'Con las monedas me compras ropa, muebles y pintura. Lo que compres llega en una caja: suena el timbre y la abres en la puerta.',
  },
  {
    id: 'cuarto', target: () => 'room', next: '¡A jugar!',
    text: () => `Desliza el cuarto para verlo entero. De noche, apaga la luz para que duerma. Toma ${TUTORIAL_REWARD} monedas para empezar.`,
  },
];

// Rectángulo del elemento iluminado, seguido cuadro a cuadro (la cámara
// del cuarto se mueve y la bandeja de comida aparece y desaparece).
function useTargetRect(name) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    let raf = 0;
    let last = '';
    const loop = () => {
      const el = document.querySelector(`[data-tut="${name}"]`);
      const r = el ? el.getBoundingClientRect() : null;
      const key = r ? `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}` : '';
      if (key !== last) { last = key; setRect(r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [name]);
  return rect;
}

// `canFeed`: si no hay ninguna comida, el paso de comer se puede pasar.
export default function Tutorial({ step, petName, creatorName, look, foodOpen, canFeed = true, onNext, onSkip }) {
  const s = TUTORIAL_STEPS[step];
  const ctx = { name: petName, creator: creatorName, foodOpen };
  const rect = useTargetRect(s ? s.target(ctx) : '');
  if (!s) return null;

  const pad = 6;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const hole = rect && {
    left: Math.max(0, rect.left - pad), top: Math.max(0, rect.top - pad),
    right: Math.min(vw, rect.left + rect.width + pad), bottom: Math.min(vh, rect.top + rect.height + pad),
  };
  // La tarjeta va del lado con más espacio, sin tapar lo iluminado.
  const below = !hole || hole.top + (hole.bottom - hole.top) / 2 < vh * 0.5;
  const cardPos = !hole
    ? { top: '50%', transform: 'translateY(-50%)' }
    : below ? { top: Math.min(hole.bottom + 12, vh - 200) } : { bottom: Math.min(vh - hole.top + 12, vh - 200) };

  const veil = { position: 'fixed', background: 'rgba(24, 14, 34, 0.58)', pointerEvents: 'auto', transition: 'all 0.25s ease' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }} aria-live="polite">
      {hole ? (
        <>
          <div style={{ ...veil, left: 0, top: 0, right: 0, height: hole.top }} />
          <div style={{ ...veil, left: 0, top: hole.bottom, right: 0, bottom: 0 }} />
          <div style={{ ...veil, left: 0, top: hole.top, width: hole.left, height: hole.bottom - hole.top }} />
          <div style={{ ...veil, left: hole.right, top: hole.top, right: 0, height: hole.bottom - hole.top }} />
          <div
            className="pg-tut-ring"
            style={{
              position: 'fixed', left: hole.left, top: hole.top, width: hole.right - hole.left, height: hole.bottom - hole.top,
              border: `3px solid ${C.amber}`, borderRadius: 14, transition: 'all 0.25s ease', pointerEvents: 'none',
            }}
          />
        </>
      ) : <div style={{ ...veil, inset: 0 }} />}

      <div
        key={s.id} className="pg-card pg-anim-pop"
        style={{
          position: 'fixed', left: 12, right: 12, marginLeft: 'auto', marginRight: 'auto', maxWidth: 340,
          ...cardPos, padding: '12px 14px', pointerEvents: 'auto', boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: 54, height: 54, display: 'grid', placeItems: 'center' }}>
            <PetSprite look={look} mood="feliz" size={54} />
          </div>
          <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: C.ink, textAlign: 'left' }}>{s.text(ctx)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 4, flex: 1 }} aria-label={`Paso ${step + 1} de ${TUTORIAL_STEPS.length}`}>
            {TUTORIAL_STEPS.map((x, i) => (
              <span key={x.id} className="pg-keep-round" style={{ width: 7, height: 7, borderRadius: '50%', background: i <= step ? C.rose : C.line }} />
            ))}
          </div>
          {step < TUTORIAL_STEPS.length - 1 && (
            <button onClick={onSkip} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, padding: '6px 4px' }}>
              Saltar guía
            </button>
          )}
          {(s.next || !canFeed) && (
            <button onClick={onNext} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '9px 16px', fontSize: 13.5 }}>{s.next || 'Siguiente'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
