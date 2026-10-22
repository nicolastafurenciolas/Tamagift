import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Board } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { Pipe } from '../../gameArt';
import { FLY, createFlyState, flapState, stepFly } from '../../flyPhysics';
import { PetSprite, UISprite, useElementWidth } from './common';
import { useFinish } from './meta';

// ── Salta y vuela ─────────────────────────────────────────────────
// Un toque, muerte rápida, reinicio instantáneo. La física vive en
// flyPhysics.js (con pruebas); aquí solo el bucle y el dibujo.

const q = (v, step) => Math.max(step, Math.round(v / step) * step);

export default function FlyGame({ drawingUrl, onBack, onComplete }) {
  const [, setTick] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const world = useRef(createFlyState());
  const { finish } = useFinish(onComplete);
  const [boardRef, boardW] = useElementWidth(FLY.W);

  function flap() {
    const w = world.current;
    if (w.dead) return;
    if (!w.started) setStarted(true);
    flapState(w);
    play('pop');
  }

  useEffect(() => {
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const w = world.current;
      const before = w.score;
      const wasDead = w.dead;
      stepFly(w, dt);
      if (w.score !== before) { play('good'); setScore(w.score); }
      if (w.dead && !wasDead) { play('bad'); setOver(true); }
      setTick((t) => (t + 1) % 100000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // El resultado se manda una sola vez y con la versión más nueva del
  // callback (antes se perdía ~1 de cada 3 partidas, ver useFinish).
  useEffect(() => { if (over) finish(world.current.score, 650); }, [over, finish]);

  const { petY, vel, pipes } = world.current;
  const k = boardW / FLY.W;
  const boardH = boardW * FLY.H / FLY.W;
  const pipeW = q(FLY.PIPE_W * k, 2);
  const petPx = Math.round(40 * k);

  return (
    <Screen>
      <ScreenHeader title="Salta y vuela" subtitle="Toca para aletear" onBack={onBack} right={<HeaderTag color={C.rose}>{score}</HeaderTag>} />
      <Board
        onPointerDown={flap}
        style={{
          width: '100%', maxWidth: `min(${FLY.W}px, ${(FLY.W / FLY.H) * 60}vh)`, aspectRatio: `${FLY.W} / ${FLY.H}`,
          borderRadius: 20, cursor: 'pointer', background: `linear-gradient(180deg, ${C.sky1} 0%, ${C.sky2} 85%)`,
        }}
      >
        <div ref={boardRef} style={{ position: 'absolute', inset: 0 }} />
        {[18, 55, 82].map((l, i) => (
          <div key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${l}%`, top: `${12 + i * 22}%`, width: 46, height: 18, borderRadius: 999, background: C.glass, opacity: 0.7 }} />
        ))}
        {pipes.map((p, i) => {
          const topH = q(p.gapY * k, 8);
          const botTop = (p.gapY + FLY.GAP) * k;
          const botH = q(boardH - botTop, 8);
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: p.x * k, top: p.gapY * k - topH, width: pipeW, height: topH, transform: 'scaleY(-1)' }}>
                <Sprite art={<Pipe side="bottom" color="#7FA894" />} cacheKey="pipe" w={pipeW} h={topH} kind="surface" />
              </div>
              <div style={{ position: 'absolute', left: p.x * k, top: botTop, width: pipeW, height: botH }}>
                <Sprite art={<Pipe side="bottom" color="#7FA894" />} cacheKey="pipe" w={pipeW} h={botH} kind="surface" />
              </div>
            </React.Fragment>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '7%', background: `linear-gradient(180deg, ${C.ground1}, ${C.ground2})`, borderTop: `2.5px solid ${C.ink}` }} />
        <div style={{
          position: 'absolute', left: (FLY.PET_X - 20) * k, top: (petY - 20) * k, width: petPx, height: petPx,
          transform: `rotate(${Math.max(-25, Math.min(55, vel * 0.06))}deg)`,
        }}>
          <PetSprite src={drawingUrl} size={petPx} />
        </div>
        {!started && !over && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
            <UISprite name="dedo" size={44} style={{ animation: 'pg-nudge 1.2s ease-in-out infinite' }} />
            <p style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink, background: C.glass, padding: '6px 14px', borderRadius: 999 }}>Toca para volar</p>
          </div>
        )}
      </Board>
    </Screen>
  );
}
