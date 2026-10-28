import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, FONT, SHADOW, soft, alpha } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Modal } from '../ui';
import { IconTrophy } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import {
  ROWS, COLS, LEVELS, levelBoard, playSwap, hasAnyMove, shuffleBoard, findHint, areAdjacent, goalStatus,
  starsFor, LEFTOVER_MOVE_POINTS,
} from '../../match3';
import { candySvg, colorBombSvg, specialOverlaySvg, jellySvg, CANDY_NAMES } from '../../art/minigames';
import { useFinish } from './meta';
import { StarRow, LevelMap } from './levelUi';

// ── Conecta 3 golosinas ───────────────────────────────────────────
// Treinta niveles con metas (juntar golosinas, llegar a un puntaje,
// limpiar gelatina), jugadas contadas y golosinas especiales. La lógica
// vive en match3.js (con pruebas); acá solo se anima.

const CHEER = ['', '', '¡Dulce!', '¡Delicioso!', '¡Divino!', '¡Increíble!', '¡Imparable!'];

function useTiles(pet) {
  return useMemo(() => {
    const imgs = (pet.food_preferences || []).filter((f) => f.image).slice(0, 6);
    const useImgs = imgs.length >= 3;
    return Array.from({ length: 6 }, (_, t) => (useImgs && imgs[t] ? { image: imgs[t].image, label: imgs[t].food_name } : { label: CANDY_NAMES[t] }));
  }, [pet]);
}

function TileArt({ tile, t, sp, px }) {
  if (sp === 'color') return <Sprite markup={colorBombSvg()} cacheKey="m3-color" w={px} h={px} />;
  return (
    <>
      {tile.image
        ? <Sprite src={tile.image} w={px} h={px} kind="photo" style={{ borderRadius: px * 0.22, overflow: 'hidden' }} />
        : <Sprite markup={candySvg(t)} cacheKey={`m3-candy-${t}`} w={px} h={px} />}
      {sp && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Sprite markup={specialOverlaySvg(sp)} cacheKey={`m3-sp-${sp}`} w={px} h={px} />
        </div>
      )}
    </>
  );
}

function GoalChip({ part, tiles, cell }) {
  const g = part.goal;
  const done = part.have >= part.need;
  let icon;
  if (g.kind === 'collect') icon = <TileArt tile={tiles[g.t]} t={g.t} px={26} />;
  else if (g.kind === 'jelly') icon = <Sprite markup={jellySvg(1)} cacheKey="m3-jelly-1" w={24} h={24} />;
  else icon = <IconTrophy size={20} color={C.amber} />;
  const left = Math.max(0, part.need - part.have);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: done ? soft(C.sage, 0.6) : C.surface, border: `1.5px solid ${done ? C.sage : C.line}`, borderRadius: 999, padding: '3px 10px 3px 4px' }}>
      <div style={{ position: 'relative', width: 26, height: 26, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <span style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: done ? C.sageDeep : C.ink }}>
        {done ? '✓' : g.kind === 'score' ? `${part.have}/${part.need}` : left}
      </span>
    </div>
  );
}

function goalText(L0, tiles) {
  return L0.goals.map((g) => {
    if (g.kind === 'score') return `Llega a ${g.n} puntos`;
    if (g.kind === 'jelly') return 'Limpia toda la gelatina';
    return `Junta ${g.n} de ${tiles[g.t].label}`;
  }).join(' · ');
}

export default function Match3Game({ pet, look, onBack, onComplete, progress, startLevel }) {
  const tiles = useTiles(pet);
  const unlocked = (progress && progress.unlocked) || 1;
  const starsByLevel = (progress && progress.stars) || {};
  const [level, setLevel] = useState(startLevel && startLevel <= unlocked ? startLevel : null);
  const [intro, setIntro] = useState(!!(startLevel && startLevel <= unlocked));

  if (level == null) {
    return (
      <Screen>
        <ScreenHeader title="Conecta 3 golosinas" subtitle="Elige un nivel" onBack={onBack} />
        <LevelMap
          count={LEVELS.length} unlocked={unlocked} stars={starsByLevel} theme="golosinas" look={look}
          colors={[C.rose, C.amber, C.sky, C.sage, C.lavender, C.peach]}
          onPick={(n) => { play('pop'); setLevel(n); setIntro(true); }}
        />
      </Screen>
    );
  }
  return (
    <Match3Level
      key={level} level={level} tiles={tiles} intro={intro} onIntroDone={() => setIntro(false)}
      onExit={() => { play('swoosh'); setLevel(null); }} onComplete={onComplete}
      best={starsByLevel[level] || 0}
    />
  );
}

function Match3Level({ level, tiles, intro, onIntroDone, onExit, onComplete, best }) {
  const L0 = LEVELS[level - 1];
  const [board, setBoard] = useState(() => levelBoard(level));
  const [moves, setMoves] = useState(L0.moves);
  const [score, setScore] = useState(0);
  const [collected, setCollected] = useState({});
  const [clearing, setClearing] = useState(null);       // Set de ids que estallan
  const [beams, setBeams] = useState([]);               // rayos de especiales
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(null);
  const [hint, setHint] = useState(null);
  const [cheer, setCheer] = useState(null);
  const [popups, setPopups] = useState([]);
  const [shakeIds, setShakeIds] = useState(null);
  const [end, setEnd] = useState(null);                 // { won, stars, score }
  const stats = useRef({ specials: 0, maxCombo: 0 });
  const scoreRef = useRef(0);
  const collectedRef = useRef({});
  const { finish, later } = useFinish(onComplete);

  const [cell, setCell] = useState(44);
  useEffect(() => {
    const calc = () => {
      const byW = (Math.min(window.innerWidth, 380) - 30) / COLS;
      const byH = (window.innerHeight - 300) / ROWS;
      setCell(Math.max(34, Math.floor(Math.min(byW, byH, 52))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const status = goalStatus(level, { score, collected, board });

  // Pista si la persona se queda mirando.
  useEffect(() => {
    if (busy || end || intro) return undefined;
    const t = setTimeout(() => setHint(findHint(board)), 5000);
    return () => clearTimeout(t);
  }, [board, busy, end, intro, sel]);

  function popup(text, x, y, color) {
    const id = Math.random().toString(36).slice(2);
    setPopups((p) => [...p.slice(-6), { id, text, x, y, color }]);
    later(() => setPopups((p) => p.filter((q) => q.id !== id)), 900);
  }

  function runSteps(res, k = 0) {
    const steps = res.steps;
    if (k >= steps.length) {
      let b = res.board;
      if (!hasAnyMove(b)) {
        b = shuffleBoard(b);
        setCheer({ key: Date.now(), text: '¡A revolver!' });
        later(() => setCheer(null), 900);
      }
      setBoard(b);
      setBusy(false);
      return;
    }
    const st = steps[k];
    const cascade = k + 1;
    stats.current.maxCombo = Math.max(stats.current.maxCombo, cascade);
    stats.current.specials += st.specials;
    // estallido
    const ids = new Set(st.cleared.map((i) => st.before.cells[i] && st.before.cells[i].id).filter(Boolean));
    setBoard(st.before);
    setClearing(ids);
    setBeams(st.fired.map((f) => ({ ...f, key: `${f.i}-${Math.random()}` })));
    play(st.fired.length ? 'win' : cascade > 1 ? 'good' : 'pop');
    const gained = st.points * cascade;
    scoreRef.current += gained;
    setScore(scoreRef.current);
    const col = { ...collectedRef.current };
    Object.entries(st.collected).forEach(([t, n]) => { col[t] = (col[t] || 0) + n; });
    collectedRef.current = col;
    setCollected(col);
    if (st.cleared.length) {
      const i = st.cleared[Math.floor(st.cleared.length / 2)];
      popup(`+${gained}`, (i % COLS + 0.5) * cell, (Math.floor(i / COLS) + 0.3) * cell, C.amber);
    }
    if (cascade >= 2 && CHEER[Math.min(cascade, CHEER.length - 1)]) {
      setCheer({ key: Date.now(), text: CHEER[Math.min(cascade, CHEER.length - 1)] });
      later(() => setCheer(null), 1000);
    }
    later(() => {
      setClearing(null);
      setBeams([]);
      setBoard(st.afterFall);
      later(() => runSteps(res, k + 1), 300);
    }, 280);
  }

  function attempt(a, b) {
    if (busy || end || intro || moves <= 0) return;
    setSel(null);
    setHint(null);
    if (!areAdjacent(board, a, b)) return;
    const res = playSwap(board, a, b);
    if (!res.ok) {
      play('bad');
      const ids = [board.cells[a] && board.cells[a].id, board.cells[b] && board.cells[b].id];
      setShakeIds(new Set(ids));
      later(() => setShakeIds(null), 420);
      return;
    }
    setBusy(true);
    setMoves((m) => m - 1);
    // primero se ve el cambio de lugar, después estalla
    setBoard(res.swapped);
    later(() => runSteps(res, 0), 170);
  }

  // Fin del nivel: al cumplir las metas (con las jugadas que sobren como
  // bonus) o al quedarse sin jugadas.
  useEffect(() => {
    if (busy || end) return;
    const done = goalStatus(level, { score: scoreRef.current, collected: collectedRef.current, board }).done;
    if (done) {
      const bonus = moves * LEFTOVER_MOVE_POINTS;
      const final = scoreRef.current + bonus;
      const stars = starsFor(level, final);
      if (bonus) { scoreRef.current = final; setScore(final); }
      play('win');
      setEnd({ won: true, stars, score: final, bonus, left: moves });
      finish(final, 1900, { level, won: true, stars, stats: { ...stats.current } });
      return;
    }
    if (moves <= 0) {
      play('bad');
      setEnd({ won: false, stars: 0, score: scoreRef.current });
      finish(scoreRef.current, 1700, { level, won: false, stars: 0, stats: { ...stats.current } });
    }
  }, [busy, moves, board, end, level, finish]);

  // ── Gestos: tocar dos vecinas o deslizar desde una ────────────────
  const drag = useRef(null);
  function onDown(e, i) {
    if (busy || end || intro) return;
    drag.current = { i, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onMove(e) {
    const d = drag.current;
    if (!d || d.moved) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < cell * 0.35) return;
    d.moved = true;
    const r = Math.floor(d.i / COLS), c = d.i % COLS;
    const [nr, nc] = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c];
    if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) return;
    attempt(d.i, nr * COLS + nc);
  }
  function onUp(i) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || busy || end || intro) return;
    if (sel == null) { setSel(i); play('pop'); return; }
    if (sel === i) { setSel(null); return; }
    if (areAdjacent(board, sel, i)) attempt(sel, i);
    else { setSel(i); play('pop'); }
  }

  const size = cell;
  const inner = Math.round(size * 0.86);
  const pad = (size - inner) / 2;
  const boardW = COLS * size, boardH = ROWS * size;
  const hintIds = hint ? new Set(hint.map((i) => board.cells[i] && board.cells[i].id)) : null;

  // golosinas vivas, por id (así cada una se anima hasta su lugar nuevo)
  const live = [];
  board.cells.forEach((cellv, i) => { if (cellv) live.push({ ...cellv, i }); });

  return (
    <Screen>
      <ScreenHeader
        title={`Nivel ${level}`} onBack={onExit}
        right={<HeaderTag color={moves <= 3 ? C.rose : C.ink}>{moves} <span style={{ fontSize: 10.5, color: C.inkSoft }}>jugadas</span></HeaderTag>}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8, minHeight: 34 }}>
        {status.parts.map((p, k) => <GoalChip key={k} part={p} tiles={tiles} cell={size} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, color: C.ink }}>{score}</span>
        <ScoreBar score={score} stars={L0.stars} />
      </div>
      <div
        style={{ position: 'relative', width: boardW, height: boardH, touchAction: 'none', userSelect: 'none' }}
        onPointerMove={onMove}
      >
        {/* casillas */}
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          if (L0.mask && !L0.mask[i]) return null;
          const r = Math.floor(i / COLS), c = i % COLS;
          const j = board.jelly ? board.jelly[i] : 0;
          return (
            <div key={`bg-${i}`} style={{
              position: 'absolute', left: c * size + 1, top: r * size + 1, width: size - 2, height: size - 2,
              borderRadius: Math.round(size * 0.22), background: (r + c) % 2 ? alpha(C.surface, 0.85) : alpha(C.surfaceAlt, 0.85),
              boxShadow: `inset 0 0 0 1.5px ${alpha(C.line, 0.6)}`,
            }}>
              {j > 0 && <Sprite markup={jellySvg(j)} cacheKey={`m3-jelly-${j}`} w={size - 2} h={size - 2} />}
            </div>
          );
        })}
        {/* golosinas */}
        {live.map((cv) => {
          const r = Math.floor(cv.i / COLS), c = cv.i % COLS;
          const isClearing = clearing && clearing.has(cv.id);
          const on = sel === cv.i;
          const isHint = hintIds && hintIds.has(cv.id);
          const shaking = shakeIds && shakeIds.has(cv.id);
          return (
            <div
              key={cv.id}
              onPointerDown={(e) => onDown(e, cv.i)} onPointerUp={() => onUp(cv.i)}
              className={`${isClearing ? 'pg-anim-clear' : cv.drop ? 'pg-anim-drop' : ''}${shaking ? ' pg-anim-shake' : ''}`}
              role="button" aria-label={cv.sp ? 'Golosina especial' : tiles[cv.t] ? tiles[cv.t].label : 'Golosina'}
              style={{
                position: 'absolute', left: c * size + pad, top: r * size + pad, width: inner, height: inner,
                transition: 'top 0.26s cubic-bezier(.45,0,.7,1.25), left 0.16s ease',
                transform: on ? 'scale(1.12)' : undefined,
                filter: on ? `drop-shadow(0 0 6px ${C.rose})` : undefined,
                boxShadow: isHint ? SHADOW.glowRose : undefined, borderRadius: '30%',
                animationDelay: cv.drop ? `${c * 16}ms` : undefined,
                '--pg-drop': `${(cv.drop || 1) * size}px`,
                zIndex: on ? 3 : 2, cursor: 'pointer',
              }}
            >
              <div className={isHint ? 'pg-anim-hint' : undefined} style={{ position: 'relative', width: inner, height: inner, borderRadius: '30%' }}>
                <TileArt tile={tiles[cv.t] || tiles[0]} t={cv.t} sp={cv.sp} px={inner} />
              </div>
            </div>
          );
        })}
        {/* rayos de las especiales */}
        {beams.map((b) => <Beam key={b.key} beam={b} size={size} />)}
        {popups.map((p) => (
          <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 6, animation: 'pg-float-up 0.9s ease-out both', fontFamily: FONT.display, fontWeight: 800, fontSize: 15, color: p.color, textShadow: `0 1.5px 0 ${C.ink}` }}>{p.text}</div>
        ))}
        {cheer && (
          <div key={cheer.key} className="pg-anim-combo" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 7 }}>
            <span style={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 800, color: C.onAccent, background: `linear-gradient(135deg, ${C.rose}, ${C.amber})`, borderRadius: 999, padding: '9px 22px', boxShadow: SHADOW.lifted }}>{cheer.text}</span>
          </div>
        )}
      </div>
      {intro && (
        <Modal>
          <p style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.inkSoft, margin: 0 }}>Nivel {level}</p>
          <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '4px 0 6px' }}>{goalText(L0, tiles)}</h2>
          <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 10px' }}>Tienes {L0.moves} jugadas. Las que sobren dan puntos extra.</p>
          {best > 0 && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><StarRow n={best} size={20} /></div>}
          <p style={{ fontSize: 11.5, color: C.inkFaint, margin: '0 0 12px', lineHeight: 1.45 }}>4 en línea = rayada · L o T = envuelta · 5 en línea = bola de colores</p>
          <button onClick={() => { play('pop'); onIntroDone(); }} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '11px 30px', fontSize: 14 }}>¡A jugar!</button>
        </Modal>
      )}
      {end && <EndBanner end={end} need={!end.won ? status.parts.filter((p) => p.have < p.need) : []} tiles={tiles} />}
    </Screen>
  );
}

function ScoreBar({ score, stars }) {
  const max = stars[2] || 1;
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div style={{ position: 'relative', width: 170, height: 12, borderRadius: 999, background: C.track, overflow: 'visible' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.amber}, ${C.rose})`, transition: 'width 0.3s' }} />
      {stars.map((s, k) => (k === 0 && !s ? null : (
        <span key={k} style={{ position: 'absolute', left: `${Math.min(100, (s / max) * 100)}%`, top: -5, transform: 'translateX(-50%)', fontSize: 14, color: score >= s ? C.amber : C.inkFaint, textShadow: `0 1px 0 ${C.surface}` }}>★</span>
      )))}
    </div>
  );
}

function Beam({ beam, size }) {
  const r = Math.floor(beam.i / COLS), c = beam.i % COLS;
  const common = { position: 'absolute', pointerEvents: 'none', zIndex: 5, borderRadius: 999, animation: 'pg-pad-flash 0.32s ease-out both' };
  const glow = `0 0 14px ${C.amber}, 0 0 4px #fff`;
  if (beam.sp === 'h') return <div style={{ ...common, left: 0, right: 0, top: r * size + size * 0.32, height: size * 0.36, background: 'rgba(255,255,255,0.85)', boxShadow: glow }} />;
  if (beam.sp === 'v') return <div style={{ ...common, top: 0, bottom: 0, left: c * size + size * 0.32, width: size * 0.36, background: 'rgba(255,255,255,0.85)', boxShadow: glow }} />;
  const k = beam.sp === 'bomb' ? 3 : 1.4;
  return (
    <div style={{ ...common, left: (c + 0.5) * size, top: (r + 0.5) * size, width: size * k, height: size * k, transform: 'translate(-50%,-50%)', border: '4px solid rgba(255,255,255,0.9)', boxShadow: glow }} />
  );
}

function EndBanner({ end, need, tiles }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
      <div className="pg-card pg-anim-pop" style={{ padding: '16px 24px', textAlign: 'center', boxShadow: SHADOW.lifted }}>
        {end.won ? (
          <>
            <p style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, margin: 0 }}>¡Nivel superado!</p>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 4px' }}><StarRow n={end.stars} size={30} animate /></div>
            {end.bonus > 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>+{end.bonus} por {end.left} jugadas que sobraron</p>}
          </>
        ) : (
          <>
            <p style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink, margin: 0 }}>¡Casi!</p>
            <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '4px 0 0' }}>
              Faltó {need.map((p) => (p.goal.kind === 'score' ? `${p.need - p.have} puntos` : p.goal.kind === 'jelly' ? `${p.need - p.have} gelatinas` : `${p.need - p.have} de ${tiles[p.goal.t].label}`)).join(' y ')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
