import React, { useState, useEffect, useRef } from 'react';
import { C } from '../theme';

// ─────────────────────────────────────────────────────────────────
// La mascota VIVA. Respira, se menea, parpadea, rebota al tocarla y
// lanza partículas (corazones, destellos, gotita) según la reacción.
// Si hay dibujo del usuario lo usa; si no, dibuja un carácter tierno
// con la expresión del ánimo actual.
// ─────────────────────────────────────────────────────────────────

let particleSeq = 0;

const PARTICLE = {
  love: { emojiPath: 'heart', color: C.rose, n: 5 },
  yum: { emojiPath: 'heart', color: C.rose, n: 4 },
  happy: { emojiPath: 'sparkle', color: C.amber, n: 5 },
  clean: { emojiPath: 'bubble', color: C.sky, n: 6 },
  music: { emojiPath: 'note', color: C.lavender, n: 4 },
  dislike: { emojiPath: 'drop', color: '#9DB4C0', n: 3 },
};

function ParticleShape({ kind, color }) {
  if (kind === 'heart') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 21 C4.5 15.5 3 12 3 8.6 A4.5 4.5 0 0 1 12 6.8 A4.5 4.5 0 0 1 21 8.6 C21 12 19.5 15.5 12 21 Z" fill={color} />
      </svg>
    );
  }
  if (kind === 'sparkle') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 3 c0.9 4.4 2.6 6.1 7 7 c-4.4 0.9 -6.1 2.6 -7 7 c-0.9 -4.4 -2.6 -6.1 -7 -7 c4.4 -0.9 6.1 -2.6 7 -7 Z" fill={color} />
      </svg>
    );
  }
  if (kind === 'bubble') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18">
        <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="9" cy="9" r="2" fill={color} opacity="0.5" />
      </svg>
    );
  }
  if (kind === 'note') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M9 17 V6 l8 -2 v9" />
        <ellipse cx="7" cy="17" rx="2" ry="1.6" fill={color} />
        <ellipse cx="15" cy="15" rx="2" ry="1.6" fill={color} />
      </svg>
    );
  }
  // drop (desagrado)
  return (
    <svg viewBox="0 0 24 24" width="16" height="18">
      <path d="M12 4 C12 4 6 12 6 15.5 A6 6 0 0 0 18 15.5 C18 12 12 4 12 4 Z" fill={color} />
    </svg>
  );
}

// Carácter genérico (cuando no hay dibujo). Ojos que parpadean +
// expresión por ánimo + cachetes sonrojados.
function PetFace({ mood }) {
  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* orejitas */}
      <path d="M58 60 C48 34 60 24 74 40 C80 48 78 58 72 64 Z" fill="#FFC9A6" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M142 60 C152 34 140 24 126 40 C120 48 122 58 128 64 Z" fill="#FFC9A6" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 56 C56 42 63 37 70 46" fill="#FFB1D9" opacity="0.7" />
      <path d="M138 56 C144 42 137 37 130 46" fill="#FFB1D9" opacity="0.7" />

      {/* cuerpo redondito */}
      <path
        d="M100 46 C142 46 166 74 166 116 C166 158 140 176 100 176 C60 176 34 158 34 116 C34 74 58 46 100 46 Z"
        fill="#FFD9BE" stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round"
      />
      {/* pancita clara */}
      <ellipse cx="100" cy="128" rx="42" ry="34" fill="#FFF1E4" />

      {/* cachetes */}
      <ellipse cx="66" cy="128" rx="12" ry="8" fill="#FFB1C6" opacity="0.75" />
      <ellipse cx="134" cy="128" rx="12" ry="8" fill="#FFB1C6" opacity="0.75" />

      {/* ojos + boca por ánimo */}
      {mood === 'normal' && (
        <g>
          <g style={{ transformOrigin: '78px 108px', animation: 'pg-blink 4.2s infinite' }}>
            <ellipse cx="78" cy="108" rx="8.5" ry="10" fill={C.ink} />
            <circle cx="81" cy="104" r="3" fill="#fff" />
          </g>
          <g style={{ transformOrigin: '122px 108px', animation: 'pg-blink 4.2s infinite' }}>
            <ellipse cx="122" cy="108" rx="8.5" ry="10" fill={C.ink} />
            <circle cx="125" cy="104" r="3" fill="#fff" />
          </g>
          <path d="M90 138 Q100 146 110 138" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {mood === 'feliz' && (
        <g>
          <path d="M68 110 Q78 96 88 110" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M112 110 Q122 96 132 110" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M86 136 Q100 154 114 136 Q100 148 86 136 Z" fill={C.roseDeep} opacity="0.9" />
          <path d="M88 138 Q100 148 112 138" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {mood === 'enojado' && (
        <g>
          <line x1="66" y1="96" x2="86" y2="104" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="134" y1="96" x2="114" y2="104" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="80" cy="112" rx="7.5" ry="8.5" fill={C.ink} />
          <ellipse cx="120" cy="112" rx="7.5" ry="8.5" fill={C.ink} />
          <path d="M88 142 Q94 134 100 140 Q106 134 112 142" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
  reaction,          // { key, type }  -> dispara partículas al cambiar key
  idle = true,       // animación de reposo (respirar/menear)
  showShadow = true,
}) {
  const [particles, setParticles] = useState([]);
  const [poked, setPoked] = useState(0);
  const lastReactionKey = useRef(null);

  function spawn(type) {
    const spec = PARTICLE[type] || PARTICLE.love;
    const batch = [];
    for (let i = 0; i < spec.n; i++) {
      particleSeq += 1;
      batch.push({
        id: particleSeq,
        kind: spec.emojiPath,
        color: spec.color,
        left: 50 + (Math.random() * 60 - 30),  // % dentro de la caja
        delay: Math.random() * 0.28,
        spin: (Math.random() * 40 - 20).toFixed(0) + 'deg',
        scale: 0.7 + Math.random() * 0.6,
      });
    }
    setParticles((prev) => [...prev, ...batch]);
    const ids = batch.map((b) => b.id);
    setTimeout(() => setParticles((prev) => prev.filter((p) => !ids.includes(p.id))), 1400);
  }

  useEffect(() => {
    if (!reaction || reaction.key == null) return;
    if (reaction.key === lastReactionKey.current) return;
    lastReactionKey.current = reaction.key;
    spawn(reaction.type || 'love');
  }, [reaction]);

  function handlePoke() {
    setPoked((p) => p + 1);
    spawn(mood === 'enojado' ? 'dislike' : 'love');
    if (onPoke) onPoke();
    setTimeout(() => setPoked((p) => Math.max(0, p - 1)), 620);
  }

  const bob = mood === 'feliz' ? 2 : mood === 'enojado' ? 5 : 3.2;

  return (
    <div style={{ position: 'relative', width: size, height: size, userSelect: 'none' }}>
      {/* sombra que ancla a la mascota al piso (clave para que no "flote") */}
      {showShadow && (
        <div
          style={{
            position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.6, height: size * 0.12, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(120,80,55,0.22) 0%, rgba(120,80,55,0) 70%)',
            // La dirección va dentro del atajo: mezclar `animation` con
            // `animationDirection` hace que React avise y puede pisar
            // el valor en un re-render.
            animation: idle ? `pg-breathe ${bob}s ease-in-out infinite alternate-reverse` : 'none',
          }}
        />
      )}

      {/* partículas */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute', left: `${p.left}%`, top: '38%',
            transform: `translateX(-50%) scale(${p.scale})`,
            '--pg-spin': p.spin,
            animation: `pg-float-up 1.25s ease-out ${p.delay}s forwards`,
            pointerEvents: 'none', zIndex: 5,
          }}
        >
          <ParticleShape kind={p.kind} color={p.color} />
        </div>
      ))}

      {/* respirar */}
      <div style={{ width: '100%', height: '100%', animation: idle ? `pg-breathe ${bob}s ease-in-out infinite` : 'none', transformOrigin: '50% 85%' }}>
        {/* menear */}
        <div style={{ width: '100%', height: '100%', animation: idle ? `pg-sway ${bob * 1.7}s ease-in-out infinite` : 'none', transformOrigin: '50% 90%' }}>
          {/* rebote al tocar */}
          <button
            onClick={handlePoke}
            aria-label="Acariciar mascota"
            className="pg-focus"
            style={{
              width: '100%', height: '100%', padding: 0, border: 'none', background: 'none',
              cursor: 'pointer', display: 'block',
              animation: poked ? 'pg-bounce 0.6s ease' : 'none',
              transformOrigin: '50% 90%',
            }}
          >
            {drawingUrl ? (
              <img src={drawingUrl} alt="mascota" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
            ) : (
              <PetFace mood={mood} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
