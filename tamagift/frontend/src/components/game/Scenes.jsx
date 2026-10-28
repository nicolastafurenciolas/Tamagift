import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { IconHeart, IconSparkle } from '../icons';
import { UISprite, PetSprite } from './common';

// ── Apertura: "toca para abrir tu regalo" ─────────────────────────
// Ningún navegador deja sonar música sin un toque. Ese toque obligatorio
// se convierte en parte del regalo: se abre la caja y en ESE toque
// arranca la música.
export function OpeningScreen({ petName, creatorName, look, onOpen }) {
  const [opening, setOpening] = useState(false);
  function open() {
    if (opening) return;
    setOpening(true);
    onOpen();
  }
  return (
    <div
      className="pg-anim-rise"
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center',
        background: `radial-gradient(circle at 50% 40%, ${C.roseSoft}, ${C.paper} 70%)`,
      }}
    >
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        {/* la mascota asoma por detrás de la caja */}
        <div style={{ position: 'absolute', left: 25, top: opening ? -30 : 8, transition: 'top 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
          <PetSprite look={look} mood="feliz" size={100} />
        </div>
        <div style={{ position: 'absolute', left: 15, bottom: 0, animation: opening ? 'pg-bounce 0.6s ease' : 'pg-wiggle 1.6s ease-in-out infinite' }}>
          <UISprite name="regalo" size={120} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.inkSoft, margin: 0 }}>
          {creatorName ? `${creatorName} te preparó algo` : 'Alguien te preparó algo'}
        </p>
        <h1 style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 800, color: C.ink, margin: '4px 0 0' }}>{petName}</h1>
      </div>
      <button onClick={open} className="pg-btn pg-btn-rose pg-focus pg-anim-pop" style={{ fontSize: 16, padding: '14px 30px' }}>
        Toca para abrir tu regalo
      </button>
    </div>
  );
}

// ── Cinemática de recuerdos ───────────────────────────────────────
// Aparece cuando la mascota se quedó sin hambre ni amor: sus fotos y
// sus frases, una por una, y al final se recupera.
export function CinematicScreen({ photos, phrases, onFinish }) {
  const positive = (phrases || []).filter((p) => p.category === 'positiva');
  const usePhotos = photos && photos.length > 0;
  const slideCount = usePhotos ? Math.min(photos.length, 6) : Math.min(Math.max(positive.length, 1), 4);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const isDone = index >= slideCount;

  useEffect(() => {
    if (isDone) return undefined;
    let inner;
    const timer = setTimeout(() => {
      setFading(true);
      inner = setTimeout(() => { setIndex((i) => i + 1); setFading(false); }, 400);
    }, 2800);
    return () => { clearTimeout(timer); clearTimeout(inner); };
  }, [index, isDone]);

  const photo = usePhotos ? photos[index % photos.length] : null;
  const caption = positive.length > 0 ? positive[index % positive.length].text : (usePhotos ? null : 'Gracias por todos estos momentos juntos');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 30%, #3A2A38, #120D16)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {[12, 30, 68, 84, 22, 76].map((l, i) => (
        <span key={i} style={{ position: 'absolute', left: `${l}%`, top: `${12 + (i * 13) % 70}%`, animation: `pg-shimmer ${2 + i * 0.4}s ease-in-out infinite` }}>
          <IconSparkle size={12 + (i % 3) * 4} color="#FFE9A8" fill="#FFE9A8" />
        </span>
      ))}
      {!isDone && (
        <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.4s', textAlign: 'center', maxWidth: 320, zIndex: 1 }}>
          {photo && <img src={photo.url} alt="" style={{ maxWidth: '100%', maxHeight: '55vh', borderRadius: 16, marginBottom: 16, objectFit: 'contain', boxShadow: '0 0 0 6px rgba(255,255,255,0.9), 0 20px 40px rgba(0,0,0,0.4)' }} />}
          {caption && <p style={{ fontFamily: FONT.hand, color: '#fff', fontSize: 24, lineHeight: 1.3 }}>{caption}</p>}
        </div>
      )}
      {isDone && (
        <div style={{ textAlign: 'center', zIndex: 1 }} className="pg-anim-pop">
          <IconHeart size={56} color="#FF6F91" fill="#FF6F91" />
          <p style={{ fontFamily: FONT.hand, color: '#fff', fontSize: 26, margin: '12px 0 24px' }}>Gracias por acordarte de mí</p>
          <button onClick={onFinish} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '12px 30px', fontSize: 15 }}>Volver</button>
        </div>
      )}
      {!isDone && (
        <button onClick={onFinish} style={{ position: 'absolute', top: 16, right: 16, color: '#fff', opacity: 0.7, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.body }}>Saltar ✕</button>
      )}
    </div>
  );
}

// Pantalla de error al cargar el regalo (servidor caído, sin red…).
export function LoadErrorScreen({ onRetry }) {
  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center" style={{ padding: '60px 24px', textAlign: 'center', gap: 12 }}>
      <UISprite name="regalo" size={84} />
      <h2 style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink, margin: '6px 0 0' }}>No pudimos abrir tu regalo</h2>
      <p style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 300, lineHeight: 1.5, margin: 0 }}>
        Parece un problema de conexión. Tu regalo está a salvo: revisa tu internet y vuelve a intentarlo.
      </p>
      <button onClick={onRetry} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '12px 28px', fontSize: 14, marginTop: 6 }}>Reintentar</button>
    </div>
  );
}
