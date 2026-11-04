import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Board } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { flySkySvg, flyCloudsSvg, flyCitySvg, flyHillsSvg, flyGroundSvg, pillarSvg, PILLAR_FLAVORS } from '../../art/minigames';
import { FLY, createFlyState, flapState, stepFly } from '../../flyPhysics';
import { PetSprite, UISprite, useElementWidth } from './common';
import { useFinish } from './meta';

// ── Salta y vuela ─────────────────────────────────────────────────
// Un toque, muerte rápida, reinicio instantáneo. La física vive en
// flyPhysics.js (con pruebas); aquí solo el bucle y el dibujo.
//
// El fondo va en capas (art/minigames.js): cielo quieto, nubes, ciudad
// lejana, colinas y pasto, cada una corriendo a su velocidad (el pasto,
// igual que los pilares). Los pilares son de golosina y miden siempre lo
// mismo: el tablero los recorta, así no hay que redibujarlos cuando los
// que suben y bajan cambian de alto.

const PILLAR_H = 440;           // alto fijo del dibujo del pilar (unidades)
const PILLAR_PAD = 10;          // lo que sobresale la cereza por arriba

// Una tira que se repite a lo ancho, corrida `offset` píxeles.
function Strip({ markup, cacheKey, w, h, offset }) {
  const x = -Math.round(((offset % w) + w) % w);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: w * 2, height: h, display: 'flex', transform: `translateX(${x}px)`, pointerEvents: 'none' }}>
      <Sprite markup={markup} cacheKey={cacheKey} w={w} h={h} kind="surface" />
      <Sprite markup={markup} cacheKey={cacheKey} w={w} h={h} kind="surface" />
    </div>
  );
}
const flavorOf = (p) => Math.floor(Math.abs(p.baseY ?? p.gapY)) % PILLAR_FLAVORS.length;

export default function FlyGame({ look, onBack, onComplete, rank = 1 }) {
  const [, setTick] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const world = useRef(createFlyState(rank));
  const scroll = useRef(0);         // cuánto avanzó el mundo (para las capas)
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
      // lo que corre el pasto: lo mismo que corrió el primer pilar
      const ref = w.pipes[0];
      const x0 = ref ? ref.x : 0;
      stepFly(w, dt);
      if (w.started && !w.dead) scroll.current += ref && w.pipes.includes(ref) ? x0 - ref.x : FLY.BASE_SPEED * dt;
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
  const boardH = Math.round(boardW * FLY.H / FLY.W);
  const pipeW = Math.round(FLY.PIPE_W * k);
  const pillarPx = Math.round(PILLAR_H * k);
  const petPx = Math.round((FLY.PET_R * 2 + 4) * k);
  const starPx = Math.round(26 * k);
  const go = scroll.current * k;
  const drift = (performance.now() / 1000) * 5 * k;

  return (
    <Screen>
      <ScreenHeader
        title="Salta y vuela" subtitle="Toca para aletear y recoge estrellas" onBack={onBack}
        right={<HeaderTag color={C.rose}>{score} <span style={{ color: C.amber }}>★{stars}</span></HeaderTag>}
      />
      <Board
        onPointerDown={flap}
        style={{
          width: '100%', maxWidth: `min(${FLY.W + 40}px, ${(FLY.W / FLY.H) * 62}vh)`, aspectRatio: `${FLY.W} / ${FLY.H}`,
          borderRadius: 20, cursor: 'pointer', background: C.sky2,
        }}
      >
        <div ref={boardRef} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Sprite markup={flySkySvg()} cacheKey="fl-sky" w={boardW} h={boardH} kind="surface" />
        </div>
        <Strip markup={flyCloudsSvg()} cacheKey="fl-clouds" w={boardW} h={boardH} offset={drift + go * 0.04} />
        <Strip markup={flyCitySvg()} cacheKey="fl-city" w={boardW} h={boardH} offset={go * 0.1} />
        <Strip markup={flyHillsSvg()} cacheKey="fl-hills" w={boardW} h={boardH} offset={go * 0.3} />
        {/* el cielo cambia mientras más lejos vuelas: atardecer y noche */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255,140,120,0.55), rgba(255,200,130,0.35))', opacity: Math.min(1, Math.max(0, (score - 8) / 6)) * (score >= 20 ? 0 : 1), transition: 'opacity 1.5s' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(40,30,90,0.75), rgba(90,60,140,0.45))', opacity: Math.min(1, Math.max(0, (score - 18) / 4)), transition: 'opacity 1.5s' }}>
          {score >= 18 && [[12, 10], [30, 22], [58, 8], [76, 18], [88, 30], [44, 34], [20, 40]].map(([l, t], i) => (
            <span key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${l}%`, top: `${t}%`, width: 3, height: 3, borderRadius: '50%', background: '#FFF6C8', animation: `pg-breathe ${1.2 + (i % 3) * 0.4}s ease-in-out infinite` }} />
          ))}
        </div>
        {pipes.map((p, i) => {
          const f = flavorOf(p);
          const gapTop = p.gapY * k;
          const botTop = (p.gapY + (p.gap || FLY.GAP)) * k;
          return (
            <React.Fragment key={i}>
              {/* pilar que cuelga: el glaseado abajo, junto al hueco */}
              <div style={{ position: 'absolute', left: Math.round(p.x * k), top: 0, width: pipeW, height: Math.max(0, gapTop), overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
                  <Sprite markup={pillarSvg(PILLAR_H, 'top', f)} cacheKey={`fl-pt-${f}`} w={pipeW} h={pillarPx} pixel={2} />
                </div>
              </div>
              {/* pilar que sube desde el pasto, con su cereza */}
              <div style={{ position: 'absolute', left: Math.round(p.x * k), top: botTop - PILLAR_PAD * k, width: pipeW, height: Math.max(0, boardH - botTop + PILLAR_PAD * k), overflow: 'hidden', pointerEvents: 'none' }}>
                <Sprite markup={pillarSvg(PILLAR_H, 'bottom', f)} cacheKey={`fl-pb-${f}`} w={pipeW} h={Math.round((PILLAR_H + PILLAR_PAD) * k)} pixel={2} />
              </div>
              {p.star && !p.star.taken && (
                <div style={{ position: 'absolute', left: (p.x + FLY.PIPE_W / 2) * k - starPx / 2, top: (p.gapY + p.star.dy) * k - starPx / 2, width: starPx, height: starPx, animation: 'pg-breathe 1s ease-in-out infinite' }}>
                  <UISprite name="estrella" size={starPx} />
                </div>
              )}
            </React.Fragment>
          );
        })}
        <Strip markup={flyGroundSvg()} cacheKey="fl-ground" w={boardW} h={boardH} offset={go} />
        <div style={{
          position: 'absolute', left: FLY.PET_X * k - petPx / 2, top: petY * k - petPx / 2, width: petPx, height: petPx,
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
