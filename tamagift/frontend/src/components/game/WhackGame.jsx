import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Toast } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { FoodSprite } from './common';
import { foodSpriteFor } from '../../sprites';
import { useFinish } from './meta';
import { moleSvg, bombSvg, holeBackSvg, holeFrontSvg, burstSvg } from '../../art/minigames';

// ── Dale al que salga ─────────────────────────────────────────────
// Nueve hoyos en el pasto, vistos en 3/4 (los de atrás un poco más chicos
// y más arriba). Sale un topo o lo que eligió quien regaló; a veces un
// topo dorado (vale 3) y a veces una bomba que NO hay que tocar (−3).
// Tocar un hoyo vacío resta 1: tocar todo sin mirar no sirve.

const HOLES = 9;
const DURATION = 25;

export default function WhackGame({ onBack, onComplete, targets = [], rank = 1 }) {
  const [holes, setHoles] = useState(() => Array(HOLES).fill(null));   // null | { token, kind, what, hit }
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState(null);
  const holesRef = useRef(holes);
  const tokenRef = useRef(0);
  const scoreRef = useRef(0);
  const stats = useRef({ golden: 0, bombs: 0 });
  const { finish, later } = useFinish(onComplete);

  const elapsed = DURATION - timeLeft;
  const popMs = Math.max(280, 720 - (rank - 1) * 30 - elapsed * 18);
  const visibleMs = Math.max(420, 900 - (rank - 1) * 30 - elapsed * 20);

  const setHolesBoth = (next) => { holesRef.current = next; setHoles(next); };

  useEffect(() => {
    if (gameOver) return undefined;
    const pop = setInterval(() => {
      const free = holesRef.current.map((h, i) => (h ? -1 : i)).filter((i) => i >= 0);
      if (!free.length) return;
      const idx = free[Math.floor(Math.random() * free.length)];
      tokenRef.current += 1;
      const token = tokenRef.current;
      const r = Math.random();
      const kind = elapsed > 3 && r < 0.12 ? 'bomba' : r > 0.9 ? 'dorado' : 'topo';
      const what = targets.length ? Math.floor(Math.random() * targets.length) : 0;
      const next = [...holesRef.current];
      next[idx] = { token, kind, what };
      setHolesBoth(next);
      // Se esconde SOLO si sigue siendo la misma aparición.
      later(() => {
        if (holesRef.current[idx]?.token !== token) return;
        const n2 = [...holesRef.current];
        n2[idx] = null;
        setHolesBoth(n2);
      }, kind === 'dorado' ? visibleMs * 0.7 : visibleMs);
    }, popMs);
    return () => clearInterval(pop);
  }, [gameOver, popMs, visibleMs, targets.length, later, elapsed]);

  useEffect(() => {
    if (gameOver) return undefined;
    if (timeLeft <= 0) { setGameOver(true); return undefined; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => { if (gameOver) finish(scoreRef.current, 400, { stats: { ...stats.current } }); }, [gameOver, finish]);

  function say(text, color) {
    setFlash({ key: Date.now(), text, color });
    later(() => setFlash(null), 700);
  }
  function addScore(n) {
    scoreRef.current = Math.max(0, scoreRef.current + n);
    setScore(scoreRef.current);
  }

  function tapHole(i) {
    if (gameOver) return;
    const h = holesRef.current[i];
    if (!h || h.hit) {
      play('bad');
      addScore(-1);
      say('−1', C.rose);
      return;
    }
    const next = [...holesRef.current];
    next[i] = { ...h, hit: true };
    setHolesBoth(next);
    later(() => {
      if (holesRef.current[i]?.token !== h.token) return;
      const n2 = [...holesRef.current]; n2[i] = null; setHolesBoth(n2);
    }, 220);
    if (h.kind === 'bomba') { play('bad'); stats.current.bombs += 1; addScore(-3); say('¡Bum! −3', C.rose); return; }
    if (h.kind === 'dorado') { play('coin'); stats.current.golden += 1; addScore(3); say('¡Dorado! +3', C.amber); return; }
    play('good');
    addScore(1);
  }

  function renderTarget(h, px) {
    if (h.kind === 'bomba') return <Sprite markup={bombSvg()} cacheKey="wk-bomba" w={px} h={px} />;
    if (h.kind === 'dorado' || !targets.length) return <Sprite markup={moleSvg(h.kind === 'dorado' ? 'dorado' : 'topo')} cacheKey={`wk-${h.kind}`} w={px} h={px} />;
    const t = targets[h.what % targets.length];
    if (t.image) return <Sprite src={t.image} w={px * 0.8} h={px * 0.8} kind="art" />;
    return <FoodSprite food={foodSpriteFor(t.label)} size={px * 0.75} />;
  }

  const [W, setW] = useState(300);
  useEffect(() => {
    const calc = () => setW(Math.min(330, window.innerWidth - 40, (window.innerHeight - 250) * 1.05));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  const H = W * 0.95;

  return (
    <Screen>
      <ScreenHeader title="Dale al que salga" subtitle="Dorado vale 3 · ¡no toques la bomba!" onBack={onBack} right={<HeaderTag color={C.rose}>{gameOver ? '' : `${timeLeft}s`}</HeaderTag>} />
      <div style={{ position: 'relative', width: W, height: H, borderRadius: 22, overflow: 'hidden', border: `2.5px solid ${C.ink}`, background: `linear-gradient(180deg, ${C.ground1}, ${C.ground2})`, opacity: gameOver ? 0.6 : 1, touchAction: 'manipulation' }}>
        {holes.map((h, i) => {
          const r = Math.floor(i / 3), c = i % 3;
          // 3/4: la fila de atrás más chica y más arriba
          const s = 0.84 + r * 0.08;
          const cell = (W / 3) * s;
          const cx = W / 2 + (c - 1) * (W / 3) * (0.9 + r * 0.05);
          const cy = H * (0.2 + r * 0.31);
          const px = cell;
          return (
            <button
              key={i} onClick={() => tapHole(i)} className="pg-focus" aria-label={h ? 'Tocar' : 'Hoyo vacío'}
              style={{ position: 'absolute', left: cx - px / 2, top: cy - px * 0.62, width: px, height: px, padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><Sprite markup={holeBackSvg()} cacheKey="wk-hole-b" w={px} h={px} /></div>
              {/* lo que sale: recortado en el borde del hoyo */}
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: px * 0.8, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                  position: 'absolute', left: px * 0.1, width: px * 0.8, height: px * 0.8, top: 0,
                  transform: h ? (h.hit ? 'translateY(12%) scale(0.95)' : 'translateY(8%)') : 'translateY(100%)',
                  transition: 'transform 0.14s', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  filter: h && h.hit ? 'brightness(1.4)' : undefined,
                }}>
                  {h && renderTarget(h, px * 0.8)}
                </div>
              </div>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><Sprite markup={holeFrontSvg()} cacheKey="wk-hole-f" w={px} h={px} /></div>
              {h && h.hit && (
                <div style={{ position: 'absolute', left: px * 0.25, top: 0, width: px * 0.5, height: px * 0.5, pointerEvents: 'none', animation: 'pg-pop-in 0.25s ease-out both' }}>
                  <Sprite markup={burstSvg(h.kind === 'bomba' ? '#FF8A5C' : h.kind === 'dorado' ? '#FFE37A' : '#FFFFFF')} cacheKey={`wk-burst-${h.kind}`} w={px * 0.5} h={px * 0.5} />
                </div>
              )}
            </button>
          );
        })}
        {flash && (
          <div key={flash.key} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 5 }}>
            <Toast color={flash.color}>{flash.text}</Toast>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: C.inkSoft, fontFamily: FONT.display, fontWeight: 700, marginTop: 10 }}>Puntos: {score} · fallar resta 1</p>
    </Screen>
  );
}
