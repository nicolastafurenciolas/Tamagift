import React, { useState, useEffect, useRef } from 'react';
import { useStyle } from '../styles/StyleContext';
import { getMotion } from '../styles/motion';
import Sprite from './Sprite';

// ─────────────────────────────────────────────────────────────────
// La mascota VIVA. Respira, parpadea, rebota al tocarla y lanza
// partículas según la reacción.
//
// El dibujo (PNG que hizo quien regaló, o un personaje genérico si no
// hay) pasa por el motor de sprites, así que en pixel es un sprite de
// verdad, en neón un dibujo de tubos de luz, etc. Y se MUEVE según el
// estilo: en pixel salta entre dos cuadros, en papel a saltitos de stop
// motion, en neón titila… (styles/motion.js).
// ─────────────────────────────────────────────────────────────────

let particleSeq = 0;

const PARTICLE = {
  love: { kind: 'heart', color: '#FF6F91', n: 5 },
  yum: { kind: 'heart', color: '#FF6F91', n: 4 },
  happy: { kind: 'sparkle', color: '#FFC94D', n: 5 },
  clean: { kind: 'bubble', color: '#7FB9DE', n: 6 },
  music: { kind: 'note', color: '#B08DF2', n: 4 },
  dislike: { kind: 'drop', color: '#8FB3C9', n: 3 },
};

const INK = '#4A3439';

function particleArt(kind, color) {
  if (kind === 'heart') return <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 21 C4.5 15.5 3 12 3 8.6 A4.5 4.5 0 0 1 12 6.8 A4.5 4.5 0 0 1 21 8.6 C21 12 19.5 15.5 12 21 Z" fill={color} stroke={INK} strokeWidth="1.6" /></svg>;
  if (kind === 'sparkle') return <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3 c0.9 4.4 2.6 6.1 7 7 c-4.4 0.9 -6.1 2.6 -7 7 c-0.9 -4.4 -2.6 -6.1 -7 -7 c4.4 -0.9 6.1 -2.6 7 -7 Z" fill={color} stroke={INK} strokeWidth="1.4" /></svg>;
  if (kind === 'bubble') return <svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="rgba(200,235,255,0.4)" stroke={color} strokeWidth="2" /><circle cx="9" cy="9" r="2" fill="#fff" /></svg>;
  if (kind === 'note') return <svg viewBox="0 0 24 24" width="24" height="24"><path d="M9 17 V6 l8 -2 v9" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" /><ellipse cx="7" cy="17" rx="2.4" ry="1.9" fill={color} /><ellipse cx="15" cy="15" rx="2.4" ry="1.9" fill={color} /></svg>;
  return <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 4 C12 4 6 12 6 15.5 A6 6 0 0 0 18 15.5 C18 12 12 4 12 4 Z" fill={color} stroke={INK} strokeWidth="1.4" /></svg>;
}

// Personaje genérico (sin dibujo): mascota redondita con la expresión
// del ánimo.
function petFaceArt(mood) {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      <path d="M58 60 C48 34 60 24 74 40 C80 48 78 58 72 64 Z" fill="#FFC9A6" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M142 60 C152 34 140 24 126 40 C120 48 122 58 128 64 Z" fill="#FFC9A6" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 46 C142 46 166 74 166 116 C166 158 140 176 100 176 C60 176 34 158 34 116 C34 74 58 46 100 46 Z" fill="#FFD9BE" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="100" cy="128" rx="42" ry="34" fill="#FFF1E4" />
      <ellipse cx="66" cy="128" rx="12" ry="8" fill="#FFB1C6" opacity="0.75" />
      <ellipse cx="134" cy="128" rx="12" ry="8" fill="#FFB1C6" opacity="0.75" />
      {mood === 'feliz' ? (
        <g>
          <path d="M68 110 Q78 96 88 110 M112 110 Q122 96 132 110" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M86 136 Q100 154 114 136 Q100 148 86 136 Z" fill="#BE4E67" />
        </g>
      ) : mood === 'enojado' ? (
        <g>
          <path d="M66 96 L86 104 M134 96 L114 104" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="80" cy="112" rx="7.5" ry="8.5" fill={INK} />
          <ellipse cx="120" cy="112" rx="7.5" ry="8.5" fill={INK} />
          <path d="M88 142 Q94 134 100 140 Q106 134 112 142" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <ellipse cx="78" cy="108" rx="8.5" ry="10" fill={INK} /><circle cx="81" cy="104" r="3" fill="#fff" />
          <ellipse cx="122" cy="108" rx="8.5" ry="10" fill={INK} /><circle cx="125" cy="104" r="3" fill="#fff" />
          <path d="M90 138 Q100 146 110 138" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export default function Pet({
  mood = 'normal',
  drawingUrl = null,
  size = 190,
  onPoke,
  reaction,          // { key, type } → dispara partículas al cambiar key
  idle = true,
  showShadow = true,
  pixel,             // tamaño del píxel de arte (en el cuarto, ya escalado)
}) {
  const { style } = useStyle();
  const motion = getMotion(style.motion);
  const [particles, setParticles] = useState([]);
  const [poked, setPoked] = useState(0);
  const lastReactionKey = useRef(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function spawn(type) {
    const spec = PARTICLE[type] || PARTICLE.love;
    const batch = [];
    for (let i = 0; i < spec.n; i++) {
      particleSeq += 1;
      batch.push({
        id: particleSeq, kind: spec.kind, color: spec.color,
        left: 50 + (Math.random() * 60 - 30),
        delay: Math.random() * 0.28,
        spin: `${(Math.random() * 40 - 20).toFixed(0)}deg`,
        scale: 0.75 + Math.random() * 0.5,
      });
    }
    setParticles((prev) => [...prev, ...batch]);
    const ids = new Set(batch.map((b) => b.id));
    timers.current.push(setTimeout(() => setParticles((prev) => prev.filter((p) => !ids.has(p.id))), 1900));
  }

  useEffect(() => {
    if (!reaction || reaction.key == null) return;
    if (reaction.key === lastReactionKey.current) return;
    lastReactionKey.current = reaction.key;
    if (reaction.key === 0) return;
    spawn(reaction.type || 'love');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reaction]);

  function handlePoke() {
    setPoked((p) => p + 1);
    spawn(mood === 'enojado' ? 'dislike' : 'love');
    if (onPoke) onPoke();
    timers.current.push(setTimeout(() => setPoked((p) => Math.max(0, p - 1)), 650));
  }

  const partSize = Math.max(16, Math.round(size * 0.12));

  return (
    <div style={{ position: 'relative', width: size, height: size, userSelect: 'none' }}>
      {showShadow && style.art.kind !== 'pixel' && (
        <div
          className="pg-keep-round"
          style={{
            position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.58, height: size * 0.11, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(20,10,20,0.28) 0%, rgba(20,10,20,0) 70%)',
          }}
        />
      )}
      {showShadow && style.art.kind === 'pixel' && (
        // En pixel la sombra también es de píxeles: un óvalo escalonado.
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: size * 0.5, height: 6, background: 'rgba(43,29,46,0.22)', clipPath: 'polygon(12% 0, 88% 0, 88% 33%, 100% 33%, 100% 67%, 88% 67%, 88% 100%, 12% 100%, 12% 67%, 0 67%, 0 33%, 12% 33%)' }} />
      )}

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute', left: `${p.left}%`, top: '34%',
            transform: `translateX(-50%) scale(${p.scale})`,
            '--pg-spin': p.spin,
            // Un solo atajo `animation` (mezclarlo con animationDelay hace
            // que React avise y pise valores al redibujar).
            animation: motion.particle.replace('forwards', `${p.delay.toFixed(2)}s forwards`),
            opacity: 0, pointerEvents: 'none', zIndex: 5,
          }}
        >
          <Sprite art={particleArt(p.kind, p.color)} cacheKey={`particle-${p.kind}`} w={partSize} h={partSize} pixel={pixel} />
        </div>
      ))}

      <div style={{ width: '100%', height: '100%', animation: idle ? motion.idle(mood) : 'none', transformOrigin: '50% 88%' }}>
        <div style={{ width: '100%', height: '100%', animation: idle ? motion.sway(mood) : 'none', transformOrigin: '50% 90%' }}>
          <button
            onClick={handlePoke}
            aria-label="Acariciar mascota"
            className="pg-focus"
            data-pet-button="1"
            style={{
              width: '100%', height: '100%', padding: 0, border: 'none', background: 'none',
              cursor: 'pointer', display: 'block',
              animation: poked ? motion.poke : 'none',
              transformOrigin: '50% 90%',
            }}
          >
            {drawingUrl
              ? <Sprite src={drawingUrl} w={size} h={size} kind="pet" alt="mascota" pixel={pixel} />
              : <Sprite art={petFaceArt(mood)} cacheKey={`petface-${mood}`} w={size} h={size} kind="pet" alt="mascota" pixel={pixel} />}
          </button>
        </div>
      </div>
    </div>
  );
}
