import React, { useEffect, useRef, useState } from 'react';
import { C } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Board } from '../ui';
import { play } from '../../sound';
import { PetSprite, FoodSprite, UISprite } from './common';
import { useFinish } from './meta';

// ── Serpiente golosa ──────────────────────────────────────────────
// La cabeza es SU mascota. Acelera con cada comida. Se juega
// deslizando el dedo (o con las flechas).

const COLS = 11;
const ROWS = 11;
const TICK_MS = 230;

function randomCell(exclude) {
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (exclude.some((e) => e.x === cell.x && e.y === cell.y));
  return cell;
}

export default function SnakeGame({ onBack, onComplete, treat, look, rank = 1 }) {
  const startSnake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  const [snake, setSnake] = useState(startSnake);
  const [food, setFood] = useState(() => randomCell(startSnake));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  // Golosina dorada: aparece cada 5 comidas y dura poco; vale 3.
  const [golden, setGolden] = useState(null);
  const goldenRef = useRef(null);
  const eatenRef = useRef(0);
  const stats = useRef({ golden: 0 });
  // No arranca hasta el primer gesto: antes empezaba sola y, si la
  // persona todavía estaba leyendo, chocaba contra la pared y perdía.
  const [started, setStarted] = useState(false);
  const snakeRef = useRef(startSnake);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);
  // Dirección pedida y dirección con la que se movió de verdad la última
  // vez. Antes se comparaba contra la pedida: dos giros rápidos dentro del
  // mismo paso (arriba e izquierda yendo a la derecha) la hacían volverse
  // sobre sí misma y perder sin entender por qué.
  const wantDir = useRef({ x: 1, y: 0 });
  const movedDir = useRef({ x: 1, y: 0 });
  const { finish } = useFinish(onComplete);

  const [cell, setCell] = useState(24);
  useEffect(() => {
    const calc = () => {
      const byW = (Math.min(window.innerWidth, 380) - 40) / COLS;
      const byH = (window.innerHeight - 300) / ROWS;
      setCell(Math.max(18, Math.floor(Math.min(byW, byH, 28))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  function setDirection(nx, ny) {
    const m = movedDir.current;
    if (m.x === -nx && m.y === -ny) return;
    wantDir.current = { x: nx, y: ny };
    setStarted(true);
  }

  const tickMs = Math.max(100, TICK_MS - (rank - 1) * 8 - eatenRef.current * 7);

  useEffect(() => {
    if (gameOver || !started) return undefined;
    const id = setInterval(() => {
      const prev = snakeRef.current;
      const dir = wantDir.current;
      const head = prev[0];
      const nx = head.x + dir.x;
      const ny = head.y + dir.y;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || prev.some((s) => s.x === nx && s.y === ny)) {
        play('bad');
        setGameOver(true);
        return;
      }
      movedDir.current = dir;
      const ate = foodRef.current.x === nx && foodRef.current.y === ny;
      const g = goldenRef.current;
      const ateGold = g && g.x === nx && g.y === ny;
      const next = [{ x: nx, y: ny }, ...prev];
      if (!ate && !ateGold) next.pop();
      snakeRef.current = next;
      setSnake(next);
      if (ateGold) {
        play('coin');
        stats.current.golden += 1;
        scoreRef.current += 3;
        setScore(scoreRef.current);
        goldenRef.current = null;
        setGolden(null);
      }
      if (ate) {
        play('good');
        scoreRef.current += 1;
        eatenRef.current += 1;
        setScore(scoreRef.current);
        const f = randomCell(next);
        foodRef.current = f;
        setFood(f);
        if (eatenRef.current % 5 === 0 && !goldenRef.current) {
          const gc = randomCell([...next, f]);
          const token = Date.now();
          goldenRef.current = { ...gc, token };
          setGolden(goldenRef.current);
          setTimeout(() => { if (goldenRef.current && goldenRef.current.token === token) { goldenRef.current = null; setGolden(null); } }, 6000);
        }
      }
    }, tickMs);
    return () => clearInterval(id);
  }, [gameOver, tickMs, started]);

  useEffect(() => { if (gameOver) finish(scoreRef.current, 500, { stats: { ...stats.current } }); }, [gameOver, finish]);

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
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 1 : -1, 0);
    else setDirection(0, dy > 0 ? 1 : -1);
  }

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const d = map[e.key];
      if (d) { e.preventDefault(); setDirection(d[0], d[1]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dir = movedDir.current;
  const arrow = (label, dx, dy) => (
    <button onClick={() => setDirection(dx, dy)} className="pg-btn pg-btn-ghost pg-focus" aria-label={label} style={{ fontSize: 16, padding: 0 }}>
      {label === 'Arriba' ? '▲' : label === 'Abajo' ? '▼' : label === 'Izquierda' ? '◀' : '▶'}
    </button>
  );

  return (
    <Screen>
      <ScreenHeader title="Serpiente golosa" subtitle="Desliza el dedo para girar" onBack={onBack} right={<HeaderTag>{score} pts</HeaderTag>} />
      <Board
        onTouchStart={onStart} onTouchEnd={onEnd}
        onPointerDown={(e) => { if (e.pointerType === 'mouse') onStart(e); }}
        onPointerUp={(e) => { if (e.pointerType === 'mouse') onEnd(e); }}
        style={{
          width: COLS * cell, height: ROWS * cell, borderRadius: 16, marginBottom: 12,
          backgroundImage: `repeating-linear-gradient(90deg, ${C.grid} 0 1px, transparent 1px ${cell}px),
            repeating-linear-gradient(180deg, ${C.grid} 0 1px, transparent 1px ${cell}px),
            linear-gradient(180deg, ${C.ground1}, ${C.ground2})`,
        }}
      >
        <div style={{
          position: 'absolute', left: food.x * cell, top: food.y * cell, width: cell, height: cell,
          display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pg-breathe 1.1s ease-in-out infinite',
        }}>
          <FoodSprite food={treat} size={cell} />
        </div>
        {golden && (
          <div style={{
            position: 'absolute', left: golden.x * cell, top: golden.y * cell, width: cell, height: cell, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pg-breathe 0.6s ease-in-out infinite',
            filter: `drop-shadow(0 0 5px ${C.amber}) drop-shadow(0 0 2px #fff)`,
          }}>
            <UISprite name="estrella" size={cell} />
          </div>
        )}
        {!started && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'var(--pg-font-display)', fontSize: 14, fontWeight: 700, color: C.ink, background: C.glass, padding: '7px 14px', borderRadius: 999 }}>Desliza para empezar</span>
          </div>
        )}
        {snake.map((s, i) => {
          if (i === 0) {
            return (
              <div key="head" style={{ position: 'absolute', left: s.x * cell - 4, top: s.y * cell - 4, width: cell + 8, height: cell + 8, zIndex: 3, transition: 'left 0.08s linear, top 0.08s linear' }}>
                <PetSprite look={look} mood="feliz" size={cell + 8} flip={dir.x < 0} />
              </div>
            );
          }
          const isTail = i === snake.length - 1;
          const shrink = isTail ? 6 : 3;
          return (
            <div key={i} className={isTail ? 'pg-keep-round' : undefined} style={{
              position: 'absolute', left: s.x * cell + shrink / 2, top: s.y * cell + shrink / 2,
              width: cell - shrink, height: cell - shrink, borderRadius: isTail ? '50%' : 7,
              background: i % 2 ? C.sageDeep : C.sage, border: `2px solid ${C.ink}`, zIndex: 1,
            }} />
          );
        })}
      </Board>
      {!gameOver && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gridTemplateRows: 'repeat(2, 40px)', gap: 6, justifyContent: 'center', touchAction: 'manipulation' }}>
          <span />{arrow('Arriba', 0, -1)}<span />
          {arrow('Izquierda', -1, 0)}{arrow('Abajo', 0, 1)}{arrow('Derecha', 1, 0)}
        </div>
      )}
    </Screen>
  );
}
