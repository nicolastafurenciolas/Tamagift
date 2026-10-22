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

export default function FlyGame({ look, onBack, onComplete, rank = 1 }) {
  const [, setTick] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const world = useRef(createFlyState(rank));
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
      const starsBefore = w.stars;
      const wasDead = w.dead;
      stepFly(w, dt);
      if (w.score !== before) { play('good'); setScore(w.score); }
      if (w.stars !== starsBefore) { play('coin'); setStars(w.stars); }
      if (w.dead && !wasDead) { play('bad'); setOver(true); }
      setTick((t) => (t + 1) % 100000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // El resultado se manda una sola vez y con la versión más nueva del
  // callback (antes se perdía ~1 de cada 3 partidas, ver useFinish).
  useEffect(() => { if (over) finish(world.current.score, 650, { stats: { stars: world.current.stars } }); }, [over, finish]);

  const { petY, vel, pipes } = world.current;
  const k = boardW / FLY.W;
  const boardH = boardW * FLY.H / FLY.W;
  const pipeW = q(FLY.PIPE_W * k, 2);
  const petPx = Math.round(40 * k);
  const starPx = Math.round(26 * k);

  return (
    <Screen>
      <ScreenHeader
        title="Salta y vuela" subtitle="Toca para aletear y recoge estrellas" onBack={onBack}
        right={<HeaderTag color={C.rose}>{score} <span style={{ color: C.amber }}>★{stars}</span></HeaderTag>}
      />
      <Board
        onPointerDown={flap}
        style={{
          width: '100%', maxWidth: `min(${FLY.W}px, ${(FLY.W / FLY.H) * 60}vh)`, aspectRatio: `${FLY.W} / ${FLY.H}`,
          borderRadius: 20, cursor: 'pointer', background: `linear-gradient(180deg, ${C.sky1} 0%, ${C.sky2} 85%)`,
        }}
      >
        <div ref={boardRef} style={{ position: 'absolute', inset: 0 }} />
        {/* el cielo cambia mientras más lejos vuelas: atardecer y noche */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255,140,120,0.55), rgba(255,200,130,0.35))', opacity: Math.min(1, Math.max(0, (score - 8) / 6)) * (score >= 20 ? 0 : 1), transition: 'opacity 1.5s' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(40,30,90,0.75), rgba(90,60,140,0.45))', opacity: Math.min(1, Math.max(0, (score - 18) / 4)), transition: 'opacity 1.5s' }}>
          {score >= 18 && [[12, 10], [30, 22], [58, 8], [76, 18], [88, 30], [44, 34], [20, 40]].map(([l, t], i) => (
            <span key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${l}%`, top: `${t}%`, width: 3, height: 3, borderRadius: '50%', background: '#FFF6C8', animation: `pg-breathe ${1.2 + (i % 3) * 0.4}s ease-in-out infinite` }} />
          ))}
        </div>
        {[18, 55, 82].map((l, i) => (
          <div key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${l}%`, top: `${12 + i * 22}%`, width: 46, height: 18, borderRadius: 999, background: C.glass, opacity: 0.7 }} />
        ))}
        {pipes.map((p, i) => {
          const topH = q(p.gapY * k, 8);
          const botTop = (p.gapY + (p.gap || FLY.GAP)) * k;
          const botH = q(boardH - botTop, 8);
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: p.x * k, top: p.gapY * k - topH, width: pipeW, height: topH, transform: 'scaleY(-1)' }}>
                <Sprite art={<Pipe side="bottom" color="#7FA894" />} cacheKey="pipe" w={pipeW} h={topH} kind="surface" />
              </div>
              <div style={{ position: 'absolute', left: p.x * k, top: botTop, width: pipeW, height: botH }}>
                <Sprite art={<Pipe side="bottom" color="#7FA894" />} cacheKey="pipe" w={pipeW} h={botH} kind="surface" />
              </div>
              {p.star && !p.star.taken && (
                <div style={{ position: 'absolute', left: (p.x + FLY.PIPE_W / 2) * k - starPx / 2, top: (p.gapY + p.star.dy) * k - starPx / 2, width: starPx, height: starPx, animation: 'pg-breathe 1s ease-in-out infinite' }}>
                  <UISprite name="estrella" size={starPx} />
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '7%', background: `linear-gradient(180deg, ${C.ground1}, ${C.ground2})`, borderTop: `2.5px solid ${C.ink}` }} />
        <div style={{
          position: 'absolute', left: (FLY.PET_X - 20) * k, top: (petY - 20) * k, width: petPx, height: petPx,
          transform: `rotate(${Math.max(-25, Math.min(55, vel * 0.06))}deg)`,
        }}>
          <PetSprite look={look} mood="feliz" size={petPx} />
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
