import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader, Badge, Hearts, Board } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { Car } from '../../gameArt';
import { PetSprite, UISprite, useElementWidth } from './common';
import { useFinish } from './meta';

// ── Cruzar la calle ───────────────────────────────────────────────
// Corto, se falla rápido y siempre se puede llegar un carril más lejos.

const LANES = 7;
const COLS = 7;
const CAR_COLORS = ['#D8697F', '#E2A845', '#8FC7EE', '#C3A7EA', '#7FA894', '#EE7BC8'];

export default function CrossingGame({ look, onBack, onComplete }) {
  const [row, setRow] = useState(LANES);
  const [col, setCol] = useState(Math.floor(COLS / 2));
  const [cars, setCars] = useState(() => Array.from({ length: LANES - 1 }, (_, i) => ({
    lane: i + 1, pos: Math.random() * COLS, dir: i % 2 === 0 ? 1 : -1, speed: 0.9 + Math.random() * 0.8 + i * 0.12,
  })));
  const [crossings, setCrossings] = useState(0);
  const [lives, setLives] = useState(3);
  // play | hit | scored (llegó y está volviendo al inicio) | done
  const [state, setState] = useState('play');
  const rowRef = useRef(row); rowRef.current = row;
  const colRef = useRef(col); colRef.current = col;
  const stateRef = useRef(state); stateRef.current = state;
  const crossRef = useRef(0);
  const { finish, later } = useFinish(onComplete);
  const [boardRef, boardW] = useElementWidth(300);

  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (stateRef.current === 'play' || stateRef.current === 'scored') {
        setCars((prev) => prev.map((c) => {
          let pos = c.pos + c.dir * c.speed * dt;
          if (pos > COLS) pos -= COLS + 1;
          if (pos < -1) pos += COLS + 1;
          return { ...c, pos };
        }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (state !== 'play') return;
    const r = rowRef.current;
    if (r === 0 || r === LANES) return;
    if (cars.some((c) => c.lane === r && Math.abs(c.pos - colRef.current) < 0.72)) {
      play('bad');
      setState('hit');
      setLives((v) => v - 1);
      later(() => {
        setRow(LANES);
        setCol(Math.floor(COLS / 2));
        setState((s) => (s === 'done' ? s : 'play'));
      }, 700);
    }
  }, [cars, state, later]);

  useEffect(() => {
    if (lives > 0) return;
    setState('done');
    finish(crossRef.current, 700);
  }, [lives, finish]);

  function move(dr, dc) {
    // Solo se mueve jugando: mientras vuelve al inicio tras llegar, un
    // toque de más contaba OTRO cruce y aceleraba los carros.
    if (stateRef.current !== 'play') return;
    play('pop');
    const next = Math.max(0, Math.min(LANES, rowRef.current + dr));
    setRow(next);
    setCol((c) => Math.max(0, Math.min(COLS - 1, c + dc)));
    if (next === 0) {
      play('good');
      crossRef.current += 1;
      setCrossings(crossRef.current);
      setCars((prev) => prev.map((c) => ({ ...c, speed: c.speed * 1.09 })));
      setState('scored');
      later(() => {
        setRow(LANES);
        setState((s) => (s === 'done' ? s : 'play'));
      }, 420);
    }
  }

  const touchRef = useRef(null);
  function onStart(e) {
    const t = e.touches ? e.touches[0] : e;
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function onEnd(e) {
    if (!touchRef.current) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) { move(-1, 0); return; }
    if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1);
    else move(dy > 0 ? 1 : -1, 0);
  }

  const laneH = 100 / (LANES + 1);
  const cellW = 100 / COLS;
  const cellPx = boardW / COLS;
  const carW = Math.round(cellPx * 1.5);
  const carH = Math.round(carW * 30 / 64);

  return (
    <Screen>
      <ScreenHeader title="Cruzar la calle" subtitle="Desliza para moverte · toca para avanzar" onBack={onBack} />
      <div style={{ display: 'flex', gap: 18, marginBottom: 8, alignItems: 'center' }}>
        <Badge label="Cruces" value={crossings} />
        <Hearts lives={lives} size={18} />
      </div>
      <Board
        onTouchStart={onStart} onTouchEnd={onEnd}
        onPointerDown={(e) => { if (e.pointerType === 'mouse') onStart(e); }}
        onPointerUp={(e) => { if (e.pointerType === 'mouse') onEnd(e); }}
        style={{ width: '100%', maxWidth: 330, aspectRatio: '7 / 8', maxHeight: '58vh', borderRadius: 18, background: C.ground1 }}
      >
        <div ref={boardRef} style={{ position: 'absolute', inset: 0 }} />
        {Array.from({ length: LANES + 1 }, (_, i) => {
          const isRoad = i > 0 && i < LANES;
          return (
            <div key={i} style={{
              position: 'absolute', left: 0, right: 0, top: `${(i / (LANES + 1)) * 100}%`, height: `${laneH}%`,
              background: isRoad ? `linear-gradient(180deg, ${C.road1}, ${C.road2})` : `linear-gradient(180deg, ${C.ground1}, ${C.ground2})`,
            }}>
              {isRoad && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, transform: 'translateY(-50%)', background: `repeating-linear-gradient(90deg, ${C.amberSoft} 0 16px, transparent 16px 34px)`, opacity: 0.8 }} />
              )}
              {!isRoad && i !== 0 && [8, 30, 54, 76, 92].map((l, k) => (
                <div key={k} style={{ position: 'absolute', left: `${l}%`, top: '10%', opacity: 0.85 }}>
                  <UISprite name={k % 2 ? 'pasto' : 'flor'} size={Math.max(12, Math.round(cellPx * 0.36))} />
                </div>
              ))}
              {i === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <UISprite name="bandera" size={Math.max(16, Math.round(cellPx * 0.5))} />
                  <span style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.onAccent, letterSpacing: '0.08em', textShadow: `0 1px 0 ${C.ink}` }}>META</span>
                  <UISprite name="bandera" size={Math.max(16, Math.round(cellPx * 0.5))} />
                </div>
              )}
            </div>
          );
        })}
        {cars.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${(c.pos / COLS) * 100}%`, top: `${(c.lane / (LANES + 1)) * 100 + laneH * 0.12}%`,
            width: carW, height: carH, transform: c.dir < 0 ? 'scaleX(-1)' : undefined,
          }}>
            <Sprite art={<Car color={CAR_COLORS[c.lane % CAR_COLORS.length]} />} cacheKey={`car-${c.lane % CAR_COLORS.length}`} w={carW} h={carH} />
          </div>
        ))}
        <div style={{
          position: 'absolute', left: `${(col / COLS) * 100}%`, top: `${(row / (LANES + 1)) * 100}%`,
          width: `${cellW}%`, height: `${laneH}%`, transition: 'left 0.11s, top 0.11s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: state === 'hit' ? 'grayscale(1)' : 'none',
          transform: state === 'hit' ? 'scale(0.8) rotate(-14deg)' : 'none',
        }}>
          <PetSprite look={look} mood="normal" size={Math.round(cellPx * 0.98)} />
        </div>
      </Board>
      <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 10, textAlign: 'center' }}>Desliza en cualquier dirección · un toque avanza</p>
    </Screen>
  );
}
