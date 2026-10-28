import React, { useEffect, useMemo, useRef } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { useStyle } from '../../styles/StyleContext';
import Sprite from '../Sprite';
import { PetSprite } from './common';
import { MAP_W, MAP_STEP, mapPoints, mapScene } from '../../art/levelMaps';
import { mix, isDark } from '../../art/room/draw';

// ─────────────────────────────────────────────────────────────────
// Piezas compartidas por los juegos de niveles: la fila de estrellas y
// el mapa de niveles (un camino que serpentea, como en los juegos del
// género: se ve cuánto falta y dan ganas de llegar al final).
//
// Con `theme` el mapa es un mundo con zonas (art/levelMaps.js): fondo y
// adornos propios, un cartel al empezar cada zona y la mascota parada en
// el nivel que toca.
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

const W = MAP_W;

// El degradado del fondo: cada zona con sus colores, fundidas en el borde.
// En los estilos oscuros (neón, lo-fi) se oscurecen hacia su papel.
function zoneBackground(zones, H, paper) {
  const dark = isDark(paper);
  const tint = (c) => (dark ? mix(c, paper, 0.62) : c);
  const stops = [];
  zones.forEach((z, i) => {
    const end = i < zones.length - 1 ? zones[i + 1].y : H;
    stops.push(`${tint(z.bg[0])} ${Math.max(0, z.y + (i ? 24 : 0))}px`, `${tint(z.bg[1])} ${Math.max(z.y + 30, end - 24)}px`);
  });
  return `linear-gradient(180deg, ${stops.join(', ')})`;
}

export function LevelMap({ count, unlocked, stars = {}, colors, onPick, labels, theme, look }) {
  const ref = useRef(null);
  const { style } = useStyle();
  const pts = useMemo(() => mapPoints(count, theme ? 84 : 46), [count, theme]);
  const scene = useMemo(() => (theme ? mapScene(theme, count, pts) : null), [theme, count, pts]);
  const H = scene ? scene.H : pts[pts.length - 1].y + 60;
  const cur = Math.min(unlocked, count);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = Math.max(0, pts[cur - 1].y - el.clientHeight / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  const done = pts.slice(0, cur).map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  const path = scene ? scene.path : { base: C.line, dash: C.surface, done: C.amber };
  const bg = scene
    ? zoneBackground(scene.zones, H, (style.ui && style.ui.paper) || '#FFF8EE')
    : `linear-gradient(180deg, ${soft(C.sky, 0.55)}, ${soft(C.sage, 0.6)})`;
  return (
    <div ref={ref} className="pg-card" style={{ width: '100%', maxWidth: 340, height: 'min(560px, calc(100vh - 200px))', overflowY: 'auto', overflowX: 'hidden', padding: 0, position: 'relative', background: scene ? C.surface : bg }}>
      <div style={{ position: 'relative', width: W, height: H, margin: '0 auto', background: scene ? bg : undefined }}>
        {scene && scene.chunks.map((c) => (
          <div key={c.key} style={{ position: 'absolute', left: 0, top: c.y, width: W, height: c.h, pointerEvents: 'none' }}>
            <Sprite markup={c.markup} cacheKey={`map-${c.key}`} w={W} h={c.h} />
          </div>
        ))}
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <path d={d} fill="none" stroke={path.base} strokeWidth={scene ? 13 : 10} strokeLinecap="round" strokeLinejoin="round" opacity={scene ? 0.95 : 0.55} />
          <path d={d} fill="none" stroke={path.dash} strokeWidth="4" strokeDasharray={scene ? '6 9' : '2 10'} strokeLinecap="round" />
          {unlocked > 1 && <path d={done} fill="none" stroke={path.done} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />}
        </svg>
        {scene && scene.zones.map((z) => (
          <div
            key={z.name} className="pg-anim-pop"
            style={{
              position: 'absolute', left: '50%', top: Math.max(8, z.y - 13), transform: 'translateX(-50%)', pointerEvents: 'none', whiteSpace: 'nowrap',
              background: C.surface, border: `2px solid ${C.ink}`, borderRadius: 8, padding: '3px 12px', boxShadow: SHADOW.soft,
              fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink, zIndex: 1,
            }}
          >
            {z.name}
          </div>
        ))}
        {pts.map((p, k) => {
          const n = k + 1;
          const open = n <= unlocked;
          const isCur = n === cur;
          const col = colors[k % colors.length];
          const s = stars[n] || 0;
          return (
            <div key={n} style={{ position: 'absolute', left: p.x - 23, top: p.y - 23, width: 46, height: 46, zIndex: 2 }}>
              <button
                onClick={() => open && onPick(n)} disabled={!open} className="pg-focus pg-keep-round"
                aria-label={open ? `Nivel ${n}${labels ? `: ${labels[k]}` : ''}` : `Nivel ${n} bloqueado`}
                style={{
                  width: 46, height: 46, borderRadius: '50%', padding: 0,
                  background: open ? col : C.track, border: `3px solid ${open ? C.ink : C.line}`,
                  boxShadow: isCur ? `0 0 0 5px ${soft(C.amber, 0.3)}, ${SHADOW.lifted}` : SHADOW.soft,
                  cursor: open ? 'pointer' : 'default', color: open ? C.ink : C.inkFaint,
                  fontFamily: FONT.display, fontSize: 18, fontWeight: 800,
                  animation: isCur && !look ? 'pg-breathe 1.6s ease-in-out infinite' : 'none',
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
                <span
                  style={{
                    position: 'absolute', left: p.x > W / 2 ? 'auto' : 52, right: p.x > W / 2 ? 52 : 'auto', top: 11, whiteSpace: 'nowrap', pointerEvents: 'none',
                    fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.ink,
                    ...(scene ? { background: C.surface, borderRadius: 7, padding: '2px 7px', boxShadow: SHADOW.soft } : {}),
                  }}
                >
                  {labels[k]}
                </span>
              )}
              {/* la mascota espera en el nivel que toca */}
              {isCur && look && (
                <div className="pg-map-bob" style={{ position: 'absolute', left: -1, top: -46, width: 48, height: 48, pointerEvents: 'none' }}>
                  <PetSprite look={look} mood="feliz" size={48} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { MAP_STEP };
