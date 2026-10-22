import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { IconCookie } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { Candy } from '../../gameArt';
import { SIZE, MOVES_PER_GAME, createBoard, hasAnyMove, areAdjacent, previewSwap, resolveBoard, findHint } from '../../match3';
import { useFinish } from './meta';

// ── Conecta 3 golosinas ───────────────────────────────────────────
// Las fichas son SUS comidas. La lógica vive en match3.js (con pruebas).

export default function Match3Game({ pet, onBack, onComplete }) {
  const [tiles] = useState(() => {
    const withImg = (pet.food_preferences || []).filter((f) => f.image).slice(0, 5);
    if (withImg.length >= 3) return withImg.map((f) => ({ image: f.image, label: f.food_name }));
    const names = (pet.food_preferences || []).map((f) => f.food_name);
    return Array.from({ length: 5 }, (_, i) => ({ label: names[i] || `Golosina ${i + 1}` }));
  });
  const types = tiles.length;
  const [grid, setGrid] = useState(() => createBoard(types));
  const [sel, setSel] = useState(null);
  const [moves, setMoves] = useState(MOVES_PER_GAME);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(null);
  const [clearing, setClearing] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [badSwap, setBadSwap] = useState(null);
  const [hint, setHint] = useState(null);
  const [tutorial, setTutorial] = useState(true);
  const busy = clearing !== null;
  const { finish, later } = useFinish(onComplete);

  const [cellPx, setCellPx] = useState(44);
  useEffect(() => {
    const calc = () => {
      const byW = (Math.min(window.innerWidth, 340) - 28 - (SIZE - 1) * 5) / SIZE;
      const byH = (window.innerHeight - 270) / SIZE - 5;
      setCellPx(Math.max(34, Math.floor(Math.min(byW, byH, 52))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    if (busy || moves <= 0) return undefined;
    const t = setTimeout(() => setHint(findHint(grid)), 4500);
    return () => clearTimeout(t);
  }, [grid, busy, moves, sel]);

  function tap(i) {
    if (moves <= 0 || busy) return;
    setHint(null);
    setTutorial(false);
    if (sel == null) { setSel(i); play('pop'); return; }
    if (sel === i) { setSel(null); return; }
    const a = sel;
    setSel(null);
    if (!areAdjacent(a, i)) {
      play('bad');
      setBadSwap([a, i]);
      later(() => setBadSwap(null), 450);
      return;
    }
    const { swapped, matched } = previewSwap(grid, a, i);
    if (matched.size === 0) {
      play('bad');
      setBadSwap([a, i]);
      later(() => setBadSwap(null), 450);
      return;
    }
    play('good');
    setGrid(swapped);
    setClearing(matched);
    later(() => {
      const res = resolveBoard(swapped, types);
      let board = res.board;
      if (!hasAnyMove(board)) board = createBoard(types);
      setGrid(board);
      setClearing(null);
      setDropping(true);
      later(() => setDropping(false), 320);
      setScore((s) => s + res.cleared);
      setMoves((m) => m - 1);
      if (res.cascades > 1) {
        play('win');
        setFlash({ cascades: res.cascades });
        later(() => setFlash(null), 1100);
      }
    }, 340);
  }

  useEffect(() => { if (moves <= 0) finish(score, 700); }, [moves, score, finish]);

  const inner = cellPx - 6;

  return (
    <Screen>
      <ScreenHeader
        title="Conecta 3 golosinas" onBack={onBack}
        right={<HeaderTag color={C.rose}>{moves} <span style={{ fontSize: 10.5, color: C.inkSoft }}>jugadas</span></HeaderTag>}
      />
      {tutorial && (
        <div className="pg-card" style={{ width: '100%', maxWidth: 320, padding: '9px 13px', marginBottom: 10, background: C.amberSoft, borderColor: C.amber }}>
          <p style={{ fontSize: 12.5, color: C.ink, margin: 0, lineHeight: 1.45 }}>
            Cambia dos golosinas <b>vecinas</b> de lugar para juntar <b>3 iguales en línea</b>.
          </p>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, ${cellPx}px)`, gap: 5, touchAction: 'manipulation' }}>
          {grid.map((t, i) => {
            const tile = tiles[t] || tiles[0];
            const on = sel === i;
            const isClearing = clearing?.has(i);
            const isBad = badSwap?.includes(i);
            const isHint = hint?.includes(i);
            return (
              <button
                key={i} onClick={() => tap(i)}
                className={`pg-focus${isClearing ? ' pg-anim-clear' : ''}${isBad ? ' pg-anim-shake' : ''}${dropping ? ' pg-anim-drop' : ''}${isHint ? ' pg-anim-hint' : ''}`}
                aria-label={tile.label}
                style={{
                  position: 'relative', width: cellPx, height: cellPx, borderRadius: 13, cursor: 'pointer', padding: 0,
                  background: on ? soft(C.rose, 0.7) : C.surface,
                  border: `2.5px solid ${on ? C.rose : isHint ? C.amber : C.line}`,
                  boxShadow: on ? SHADOW.glowRose : SHADOW.soft,
                  transform: on ? 'scale(0.92)' : 'scale(1)',
                  transition: 'transform 0.12s, border-color 0.12s, background 0.12s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animationDelay: dropping ? `${(i % SIZE) * 22}ms` : undefined,
                  '--pg-drop': '46px',
                }}
              >
                {tile.image
                  ? <Sprite src={tile.image} w={inner} h={inner} kind="photo" style={{ borderRadius: 9, overflow: 'hidden' }} />
                  : <Sprite art={<Candy type={t} label={tile.label} />} cacheKey={`candy-${t}`} w={inner} h={inner} />}
              </button>
            );
          })}
        </div>
        {flash && (
          <div className="pg-anim-combo" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <span style={{
              fontFamily: FONT.display, fontSize: 26, fontWeight: 800, color: C.onAccent,
              background: `linear-gradient(135deg, ${C.rose}, ${C.amber})`, borderRadius: 999, padding: '10px 24px',
              boxShadow: SHADOW.lifted,
            }}>
              ¡Combo x{flash.cascades}!
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
        <IconCookie size={17} color={C.peach} />
        <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink }}>{score}</span>
        <span style={{ fontSize: 12, color: C.inkSoft }}>golosinas</span>
      </div>
    </Screen>
  );
}
