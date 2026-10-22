import React, { useEffect, useRef, useState } from 'react';
import { C } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { SimonPad, SIMON_PADS } from '../../gameArt';
import { useFinish } from './meta';

// ── Simón dice ────────────────────────────────────────────────────
// La secuencia crece de a uno.

// Nota de cada botón (do, mi, sol, do agudo): así la secuencia también
// se puede recordar de oído.
const PAD_SOUND = ['tap', 'good', 'coin', 'pop'];

export default function SimonGame({ onBack, onComplete }) {
  const [sequence, setSequence] = useState([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(null);
  // idle | showing | input | wait (entre rondas) | over
  const [phase, setPhase] = useState('idle');
  const seqRef = useRef([]);
  const stepRef = useRef(0);
  const phaseRef = useRef('idle');
  const { finish, later } = useFinish(onComplete);
  const [padPx, setPadPx] = useState(130);

  useEffect(() => {
    const calc = () => setPadPx(Math.floor(Math.min((Math.min(window.innerWidth, 330) - 56) / 2, (window.innerHeight - 330) / 2, 138)));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const setPhaseBoth = (p) => { phaseRef.current = p; setPhase(p); };

  function showSequence(seq) {
    setPhaseBoth('showing');
    const speed = Math.max(280, 620 - seq.length * 22);
    seq.forEach((pad, i) => {
      later(() => { setActive(pad); play(PAD_SOUND[pad]); }, i * speed + 350);
      later(() => setActive(null), i * speed + speed * 0.6 + 350);
    });
    later(() => { stepRef.current = 0; setStep(0); setPhaseBoth('input'); }, seq.length * speed + 450);
  }

  function nextRound() {
    const seq = [...seqRef.current, Math.floor(Math.random() * 4)];
    seqRef.current = seq;
    setSequence(seq);
    showSequence(seq);
  }

  function tapPad(id) {
    if (phaseRef.current !== 'input') return;
    setActive(id);
    later(() => setActive(null), 160);
    const seq = seqRef.current;
    if (id !== seq[stepRef.current]) {
      play('bad');
      setPhaseBoth('over');
      finish(seq.length - 1, 700);
      return;
    }
    play(PAD_SOUND[id]);
    if (stepRef.current + 1 === seq.length) {
      // Se cierra la entrada YA: un toque de más mientras esperaba la
      // ronda siguiente la arrancaba dos veces o la daba por perdida.
      setPhaseBoth('wait');
      later(nextRound, 620);
    } else {
      stepRef.current += 1;
      setStep(stepRef.current);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title="Simón dice"
        subtitle={phase === 'showing' ? 'Mira bien…' : phase === 'input' ? 'Ahora repite' : phase === 'wait' ? '¡Bien! Otra más…' : 'Toca empezar'}
        onBack={onBack}
        right={<HeaderTag>{sequence.length} pasos</HeaderTag>}
      />
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 290, minHeight: 12 }}>
        {phase === 'input' && sequence.map((_, i) => (
          <span key={i} className="pg-keep-round" style={{
            width: 9, height: 9, borderRadius: '50%',
            background: i < step ? C.sage : i === step ? C.rose : C.track,
            transform: i === step ? 'scale(1.3)' : 'scale(1)', transition: 'all 0.2s',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, ${padPx}px)`, gap: 14, marginBottom: 16, touchAction: 'manipulation' }}>
        {SIMON_PADS.map((p) => {
          const isLit = active === p.id;
          const dim = phase === 'showing' && !isLit;
          return (
            <button
              key={p.id} onClick={() => tapPad(p.id)} disabled={phase !== 'input'} className="pg-focus"
              aria-label={`Botón ${p.shape}`}
              style={{
                position: 'relative', width: padPx, height: padPx, border: 'none', background: 'none', padding: 0,
                cursor: phase === 'input' ? 'pointer' : 'default',
                transform: isLit ? 'scale(0.93)' : 'scale(1)',
                filter: isLit ? `drop-shadow(0 0 16px ${p.color}) brightness(1.15)` : 'none',
                transition: 'transform 0.11s, filter 0.16s',
              }}
            >
              <Sprite art={<SimonPad shape={p.shape} color={p.color} lit={isLit} dim={dim} />} cacheKey={`pad-${p.id}-${isLit ? 1 : 0}-${dim ? 1 : 0}`} w={padPx} h={padPx} />
            </button>
          );
        })}
      </div>
      {phase === 'idle' && (
        <>
          <p style={{ fontSize: 12.5, color: C.inkSoft, textAlign: 'center', maxWidth: 280, lineHeight: 1.45, marginBottom: 12 }}>
            Se encienden los botones de a uno. Memoriza el orden y repítelo: cada ronda suma uno más.
          </p>
          <button onClick={nextRound} className="pg-btn pg-btn-rose pg-focus pg-anim-hint" style={{ padding: '12px 30px', fontSize: 14 }}>Empezar</button>
        </>
      )}
    </Screen>
  );
}
