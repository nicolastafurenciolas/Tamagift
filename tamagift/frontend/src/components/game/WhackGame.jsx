import React, { useEffect, useRef, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { UISprite, FoodSprite } from './common';
import { foodSpriteFor } from '../../sprites';
import { useFinish } from './meta';

// ── Dale al que salga ─────────────────────────────────────────────
// Salen de los agujeros las cosas que eligió quien regaló. Se acelera
// con el tiempo. Tocar un agujero vacío ahora cuesta un punto: antes
// tocar todos los agujeros sin parar ganaba siempre.

const HOLES = 9;
const DURATION = 20;

export default function WhackGame({ onBack, onComplete, targets = [] }) {
  const [holes, setHoles] = useState(() => Array(HOLES).fill(null));   // null | { token, what }
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [missFlash, setMissFlash] = useState(null);
  const holesRef = useRef(holes);
  const tokenRef = useRef(0);
  const scoreRef = useRef(0);
  const { finish, later } = useFinish(onComplete);

  const elapsed = DURATION - timeLeft;
  const popMs = Math.max(300, 700 - elapsed * 22);
  const visibleMs = Math.max(420, 850 - elapsed * 24);

  const setHolesBoth = (next) => { holesRef.current = next; setHoles(next); };

  useEffect(() => {
    if (gameOver) return undefined;
    const pop = setInterval(() => {
      const idx = Math.floor(Math.random() * HOLES);
      tokenRef.current += 1;
      const token = tokenRef.current;
      const what = targets.length ? Math.floor(Math.random() * targets.length) : 0;
      const next = [...holesRef.current];
      next[idx] = { token, what };
      setHolesBoth(next);
      // Se esconde SOLO si sigue siendo la misma aparición: antes un
      // temporizador viejo escondía antes de tiempo al que salió después.
      later(() => {
        if (holesRef.current[idx]?.token !== token) return;
        const n2 = [...holesRef.current];
        n2[idx] = null;
        setHolesBoth(n2);
      }, visibleMs);
    }, popMs);
    return () => clearInterval(pop);
  }, [gameOver, popMs, visibleMs, targets.length, later]);

  useEffect(() => {
    if (gameOver) return undefined;
    if (timeLeft <= 0) { setGameOver(true); return undefined; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => { if (gameOver) finish(scoreRef.current, 400); }, [gameOver, finish]);

  function tapHole(i) {
    if (gameOver) return;
    if (!holesRef.current[i]) {
      play('bad');
      scoreRef.current = Math.max(0, scoreRef.current - 1);
      setScore(scoreRef.current);
      setMissFlash({ key: Date.now(), i });
      return;
    }
    play('good');
    const next = [...holesRef.current];
    next[i] = null;
    setHolesBoth(next);
    scoreRef.current += 1;
    setScore(scoreRef.current);
  }

  function renderTarget(h) {
    if (!targets.length) return <UISprite name="topo" size={62} />;
    const t = targets[h.what % targets.length];
    if (t.image) return <Sprite src={t.image} w={64} h={64} kind="art" />;
    return <FoodSprite food={foodSpriteFor(t.label)} size={58} />;
  }

  return (
    <Screen>
      <ScreenHeader title="Dale al que salga" subtitle="Tócalo antes de que se esconda" onBack={onBack} right={<HeaderTag color={C.rose}>{gameOver ? '' : `${timeLeft}s`}</HeaderTag>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 'min(290px, 52vh)', marginBottom: 14, opacity: gameOver ? 0.5 : 1, touchAction: 'manipulation' }}>
        {holes.map((h, i) => (
          <button
            key={i} onClick={() => tapHole(i)} className="pg-focus pg-keep-round"
            aria-label={h ? 'Tocar' : 'Agujero vacío'}
            style={{
              aspectRatio: '1', borderRadius: '50%', position: 'relative', padding: 0,
              background: `radial-gradient(ellipse at 50% 40%, #2A1E1A 0%, #3E2C24 44%, ${C.ground2} 46%, ${C.ground1} 100%)`,
              border: `3px solid ${C.ink}`,
              boxShadow: `inset 0 8px 14px rgba(0,0,0,0.45), ${SHADOW.soft}`,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              overflow: 'hidden', cursor: 'pointer',
              animation: missFlash && missFlash.i === i ? 'pg-shake 0.3s ease' : 'none',
            }}
          >
            <div style={{
              transform: h ? 'translateY(4%)' : 'translateY(105%)', transition: 'transform 0.15s',
              width: '100%', height: '82%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {h && renderTarget(h)}
            </div>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: C.inkSoft, fontFamily: FONT.display, fontWeight: 700 }}>Puntos: {score} · fallar resta 1</p>
    </Screen>
  );
}
