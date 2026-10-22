import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { C, FONT, SHADOW } from '../theme';
import Sprite from './Sprite';
import { ROOM } from '../gameState';
import { wallSvg, floorSvg, findWall, findFloor } from '../roomCatalog';
import { play } from '../sound';

// ─────────────────────────────────────────────────────────────────
// La obra: pintar la pared o enchapar el piso con el dedo.
//
//   · Pared: un rodillo gigante del alto de la pared sigue el dedo; cada
//     franja por la que pasa queda pintada, de arriba abajo y con bordes
//     rectos (40 franjas de lado a lado).
//   · Piso: donde pasa el dedo caen las baldosas una a una, encajadas en
//     su cuadrícula (25 × 3).
//
// La cámara avanza sola cuando el dedo llega al borde. Al completar,
// brillitos y se aplica. Las coordenadas son del mundo del cuarto.
// ─────────────────────────────────────────────────────────────────

const WALL_COLS = 40;
const FLOOR_COLS = 25, FLOOR_ROWS = 3;

export function gridOf(kind) {
  if (kind === 'pared') return { cols: WALL_COLS, rows: 1, cw: ROOM.W / WALL_COLS, ch: ROOM.FLOOR_Y, top: 0 };
  return { cols: FLOOR_COLS, rows: FLOOR_ROWS, cw: ROOM.W / FLOOR_COLS, ch: (ROOM.H - ROOM.FLOOR_Y) / FLOOR_ROWS, top: ROOM.FLOOR_Y };
}

// Estado de la obra. `paint(x0, y0, x1, y1)` marca las celdas por las que
// pasó el dedo (en línea, para que un trazo rápido no deje huecos).
export function usePaintJob(job, onComplete) {
  const [done, setDone] = useState(() => new Set());
  const doneRef = useRef(done);
  const finished = useRef(false);
  const lastSound = useRef(0);
  const key = job ? job.key : null;
  useEffect(() => { const s = new Set(); doneRef.current = s; setDone(s); finished.current = false; }, [key]);
  const grid = job ? gridOf(job.kind) : null;
  const total = grid ? grid.cols * grid.rows : 1;

  const paint = useCallback((x0, y0, x1, y1) => {
    if (!job || finished.current) return;
    const g = gridOf(job.kind);
    const cur = doneRef.current;
    let added = 0;
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (Math.min(g.cw, g.ch) / 2)));
    const next = new Set(cur);
    for (let i = 0; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps, y = y0 + ((y1 - y0) * i) / steps;
      if (job.kind === 'pared' && y > ROOM.FLOOR_Y + 30) continue;
      if (job.kind === 'piso' && y < ROOM.FLOOR_Y - 20) continue;
      const col = Math.max(0, Math.min(g.cols - 1, Math.floor(x / g.cw)));
      const row = g.rows === 1 ? 0 : Math.max(0, Math.min(g.rows - 1, Math.floor((y - g.top) / g.ch)));
      const k = row * g.cols + col;
      if (!next.has(k)) { next.add(k); added += 1; }
    }
    if (!added) return;
    doneRef.current = next;
    setDone(next);
    const now = performance.now();
    if (now - lastSound.current > 70) { play(job.kind === 'pared' ? 'brocha' : 'baldosa'); lastSound.current = now; }
    if (next.size >= g.cols * g.rows) {
      finished.current = true;
      play('win');
      setTimeout(() => onComplete && onComplete(job), 1100);
    }
  }, [job, onComplete]);

  // Lo que falta: si queda muy poquito, se completa solo (botón).
  const fillRest = useCallback(() => {
    if (!job || finished.current) return;
    const g = gridOf(job.kind);
    const all = new Set(Array.from({ length: g.cols * g.rows }, (_, i) => i));
    doneRef.current = all;
    setDone(all);
    finished.current = true;
    play('win');
    setTimeout(() => onComplete && onComplete(job), 1100);
  }, [job, onComplete]);

  return { done, paint, fillRest, progress: done.size / total, total };
}

// La superficie nueva, solo donde ya se pintó o enchapó.
export function PaintLayer({ job, done, pixel }) {
  const g = gridOf(job.kind);
  const isWall = job.kind === 'pared';
  const value = isWall ? findWall(job.value).value : findFloor(job.value).value;
  const markup = useMemo(() => (isWall ? wallSvg(value, ROOM.W, ROOM.FLOOR_Y) : floorSvg(value, ROOM.W, ROOM.H - ROOM.FLOOR_Y)), [value, isWall]);
  const surface = (
    <Sprite markup={markup} cacheKey={`${isWall ? 'wall' : 'floor'}-${value}`} w={ROOM.W} h={isWall ? ROOM.FLOOR_Y : ROOM.H - ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
  );
  if (isWall) {
    // franjas seguidas en un solo recorte (menos elementos)
    const runs = [];
    for (let c = 0; c < g.cols; c++) {
      if (!done.has(c)) continue;
      const last = runs[runs.length - 1];
      if (last && last[1] === c - 1) last[1] = c; else runs.push([c, c]);
    }
    return runs.map(([a, b]) => (
      <div key={a} style={{ position: 'absolute', left: a * g.cw, top: 0, width: (b - a + 1) * g.cw, height: ROOM.FLOOR_Y, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: -a * g.cw, top: 0 }}>{surface}</div>
      </div>
    ));
  }
  return [...done].map((k) => {
    const col = k % g.cols, row = Math.floor(k / g.cols);
    return (
      <div key={k} className="pg-lay" style={{ position: 'absolute', left: col * g.cw, top: g.top + row * g.ch, width: g.cw, height: g.ch, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: -col * g.cw, top: -row * g.ch }}>{surface}</div>
      </div>
    );
  });
}

// El rodillo (pared) o la baldosa en la mano (piso), donde está el dedo.
export function PaintTool({ job, at }) {
  if (!at) return null;
  if (job.kind === 'pared') {
    const color = (findWall(job.value).tint.c || ['#FFB6CC'])[0];
    const H = ROOM.FLOOR_Y - 16;
    return (
      <svg style={{ position: 'absolute', left: at.x - 26, top: 6, pointerEvents: 'none', overflow: 'visible' }} width="80" height={H + 120} viewBox={`0 0 80 ${H + 120}`}>
        <rect x="6" y="2" width="38" height={H} rx="16" fill={color} stroke="#3A2A3E" strokeWidth="3" />
        <rect x="14" y="10" width="8" height={H - 20} rx="4" fill="#FFFFFF" opacity="0.45" />
        <path d={`M44 ${H / 2} H62 V${H + 40}`} fill="none" stroke="#3A2A3E" strokeWidth="9" strokeLinecap="round" />
        <path d={`M44 ${H / 2} H62 V${H + 40}`} fill="none" stroke="#C9CCD3" strokeWidth="5" strokeLinecap="round" />
        <rect x="54" y={H + 36} width="16" height="70" rx="7" fill="#FF8FAB" stroke="#3A2A3E" strokeWidth="3" />
      </svg>
    );
  }
  const g = gridOf('piso');
  return (
    <div style={{ position: 'absolute', left: at.x - g.cw / 2, top: at.y - g.ch - 10, width: g.cw, height: g.ch, pointerEvents: 'none', borderRadius: 4, boxShadow: '0 10px 14px rgba(40,20,30,0.3)', background: 'rgba(255,255,255,0.55)', border: '3px solid #3A2A3E' }} />
  );
}

// Lo que se ve encima: cuánto va, la pista y los botones.
export function PaintHud({ job, progress, onCancel, onFillRest }) {
  const pct = Math.round(progress * 100);
  const isWall = job.kind === 'pared';
  return (
    <>
      <div style={{ position: 'absolute', left: 12, right: 12, top: 10, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 6 }}>
        <div className="pg-card" style={{ padding: '8px 12px', minWidth: 210, maxWidth: 300, pointerEvents: 'auto', boxShadow: SHADOW.soft }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink }}>{pct >= 100 ? '¡Listo! Quedó perfecto' : isWall ? `Pintando · ${pct}%` : `Enchapando · ${pct}%`}</span>
            {pct < 100 && <button onClick={onCancel} className="pg-focus" style={{ background: 'none', border: 'none', fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, cursor: 'pointer' }}>Cancelar</button>}
          </div>
          <div style={{ height: 7, borderRadius: 4, background: C.track, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: C.sage, transition: 'width 0.2s' }} />
          </div>
          {pct < 100 && (
            <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 5 }}>
              {isWall ? 'Desliza el dedo de lado a lado sobre la pared' : 'Desliza el dedo por el piso para poner las baldosas'}
              {pct >= 85 && <button onClick={onFillRest} className="pg-focus" style={{ marginLeft: 6, background: 'none', border: 'none', color: C.rose, fontFamily: FONT.display, fontWeight: 800, fontSize: 11, cursor: 'pointer', padding: 0 }}>Terminar lo que falta</button>}
            </div>
          )}
        </div>
      </div>
      {pct >= 100 && (
        <div className="pg-anim-pop" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35), transparent 60%)' }} />
      )}
    </>
  );
}
