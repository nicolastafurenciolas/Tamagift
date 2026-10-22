import React, { useEffect, useRef } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';

// ─────────────────────────────────────────────────────────────────
// Piezas compartidas por los juegos de niveles: la fila de estrellas y
// el mapa de niveles (un camino que serpentea, como en los juegos del
// género: se ve cuánto falta y dan ganas de llegar al final).
// ─────────────────────────────────────────────────────────────────

export function StarRow({ n = 0, total = 3, size = 14, animate = false, gap = 1 }) {
  return (
    <span style={{ display: 'inline-flex', gap, lineHeight: 1 }} aria-label={`${n} de ${total} estrellas`}>
      {Array.from({ length: total }, (_, k) => (
        <span
          key={k}
          className={animate && k < n ? 'pg-anim-pop' : undefined}
          style={{
            fontSize: size, color: k < n ? C.amber : C.track, animationDelay: animate ? `${0.15 + k * 0.22}s` : undefined,
            textShadow: k < n ? `0 1px 0 ${C.ink}` : 'none', fontFamily: 'sans-serif',
          }}
        >★</span>
      ))}
    </span>
  );
}

const STEP = 66;
const W = 300;

export function LevelMap({ count, unlocked, stars = {}, colors, onPick, labels }) {
  const ref = useRef(null);
  const pts = Array.from({ length: count }, (_, k) => ({ x: W / 2 + Math.sin(k * 0.95) * 96, y: 46 + k * STEP }));
  const H = pts[pts.length - 1].y + 60;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const y = pts[Math.min(unlocked, count) - 1].y;
    el.scrollTop = Math.max(0, y - el.clientHeight / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  const done = pts.slice(0, Math.min(unlocked, count)).map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  return (
    <div ref={ref} className="pg-card" style={{ width: '100%', maxWidth: 340, height: 'min(560px, calc(100vh - 200px))', overflowY: 'auto', overflowX: 'hidden', padding: 0, position: 'relative', background: `linear-gradient(180deg, ${soft(C.sky, 0.55)}, ${soft(C.sage, 0.6)})` }}>
      <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <path d={d} fill="none" stroke={C.line} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
          <path d={d} fill="none" stroke={C.surface} strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
          {unlocked > 1 && <path d={done} fill="none" stroke={C.amber} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />}
        </svg>
        {pts.map((p, k) => {
          const n = k + 1;
          const open = n <= unlocked;
          const cur = n === Math.min(unlocked, count);
          const col = colors[k % colors.length];
          const s = stars[n] || 0;
          return (
            <div key={n} style={{ position: 'absolute', left: p.x - 23, top: p.y - 23, width: 46, height: 46 }}>
              <button
                onClick={() => open && onPick(n)} disabled={!open} className="pg-focus pg-keep-round"
                aria-label={open ? `Nivel ${n}${labels ? `: ${labels[k]}` : ''}` : `Nivel ${n} bloqueado`}
                style={{
                  width: 46, height: 46, borderRadius: '50%', padding: 0,
                  background: open ? col : C.track, border: `3px solid ${open ? C.ink : C.line}`,
                  boxShadow: cur ? `0 0 0 5px ${soft(C.amber, 0.3)}, ${SHADOW.lifted}` : SHADOW.soft,
                  cursor: open ? 'pointer' : 'default', color: open ? C.ink : C.inkFaint,
                  fontFamily: FONT.display, fontSize: 18, fontWeight: 800,
                  animation: cur ? 'pg-breathe 1.6s ease-in-out infinite' : 'none',
                }}
              >
                {open ? n : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={{ display: 'block', margin: 'auto' }}>
                    <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.6" />
                  </svg>
                )}
              </button>
              {open && s > 0 && (
                <span style={{ position: 'absolute', left: '50%', top: 45, transform: 'translateX(-50%)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                  <StarRow n={s} size={13} />
                </span>
              )}
              {labels && open && (
                <span style={{ position: 'absolute', left: p.x > W / 2 ? 'auto' : 52, right: p.x > W / 2 ? 52 : 'auto', top: 13, whiteSpace: 'nowrap', fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.ink, pointerEvents: 'none' }}>{labels[k]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
