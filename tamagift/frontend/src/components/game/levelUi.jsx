import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { useStyle } from '../../styles/StyleContext';
import Sprite from '../Sprite';
import { PetSprite } from './common';
import { MAP_W, MAP_STEP, mapPoints, mapScene, mapFrame, CHUNK_PAD, labelLines } from '../../art/levelMaps';
import { mix, isDark } from '../../art/room/draw';

// ─────────────────────────────────────────────────────────────────
// Piezas compartidas por los juegos de niveles: la fila de estrellas y
// el mapa de niveles (un camino que serpentea, como en los juegos del
// género: se ve cuánto falta y dan ganas de llegar al final).
//
// Con `theme` el mapa es un mundo ilustrado (art/levelMaps.js): el suelo
// en trozos, las piezas (árboles, puestos, casitas) cada una en su
// lugar, y encima la interfaz: el avance por el camino, el cartel de
// cada zona, las paradas, sus etiquetas y la mascota en el nivel que toca.
// Solo se dibuja lo que está cerca de la vista (y lo ya dibujado queda).
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

// El fondo provisional (mientras se dibuja el suelo): los colores de cada
// zona. En los estilos oscuros (neón, lo-fi) se oscurecen hacia su papel.
function zoneBackground(zones, H, paper) {
  const dark = isDark(paper);
  const tint = (c) => (dark ? mix(c, paper, 0.5) : c);
  const stops = [];
  zones.forEach((z, i) => {
    const end = i < zones.length - 1 ? zones[i + 1].y : H;
    stops.push(`${tint(z.bg[0])} ${Math.max(0, z.y + (i ? 24 : 0))}px`, `${tint(z.bg[1])} ${Math.max(z.y + 30, end - 24)}px`);
  });
  return `linear-gradient(180deg, ${stops.join(', ')})`;
}

// Lo que se dibuja: lo visible y un margen arriba y abajo.
const AHEAD = 360;

// Las escenas ya armadas (volver al mapa es instantáneo).
const scenes = new Map();

// El cartel de una zona: centrado donde lo pide la escena, pero sin salirse
// de lo que muestra la tarjeta (mide su ancho real, que cambia con la letra
// de cada estilo).
function ZoneSign({ z, vis0, vis1 }) {
  const ref = useRef(null);
  const [w, setW] = useState(z.sign.w);
  useLayoutEffect(() => { if (ref.current) setW(ref.current.offsetWidth); }, [z.name]);
  const x = Math.max(vis0 + 8 + w / 2, Math.min(vis1 - 8 - w / 2, z.sign.x));
  return (
    <div
      ref={ref} className="pg-anim-pop"
      style={{
        position: 'absolute', left: Math.round(x - w / 2), top: z.sign.y, transform: 'translateY(-50%)', pointerEvents: 'none', whiteSpace: 'nowrap',
        background: C.surface, border: `2px solid ${C.ink}`, borderRadius: 8, padding: '3px 12px', boxShadow: SHADOW.soft,
        fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink, zIndex: 1,
      }}
    >
      {z.name}
    </div>
  );
}

export function LevelMap({ count, unlocked, stars = {}, colors, onPick, labels, theme, look }) {
  const ref = useRef(null);
  const { style } = useStyle();
  const paper = (style.ui && style.ui.paper) || '#FFF8EE';
  const isPixel = style.art && style.art.kind === 'pixel';
  const px = isPixel ? (style.art.pixel || 2) : undefined;
  const kit = style.art && style.art.kind;
  // en lo-fi el suelo se apaga hacia la noche del estilo (neón ya lo hace su kit)
  const dim = kit === 'lofi' ? { paper, k: 0.42 } : null;
  const labelKey = labels ? labels.join('|') : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pts = useMemo(() => mapPoints(count, undefined, theme, labels), [count, theme, labelKey]);
  const frame = useMemo(() => (theme ? mapFrame(theme, count, pts) : null), [theme, count, pts]);
  // La escena se arma después de mostrar las paradas (en un celular tarda).
  const sceneKey = theme ? `${theme}|${count}|${labelKey}|${dim ? dim.paper : ''}|${kit === 'papel' ? 'p' : ''}` : '';
  const [scene, setScene] = useState(() => (theme ? scenes.get(sceneKey) || null : null));
  useEffect(() => {
    if (!theme) return undefined;
    const hit = scenes.get(sceneKey);
    if (hit) { setScene(hit); return undefined; }
    const id = setTimeout(() => {
      const sc = mapScene(theme, count, pts, { labels, dim, kit });
      scenes.set(sceneKey, sc);
      if (scenes.size > 12) scenes.delete(scenes.keys().next().value);
      setScene(sc);
    }, 30);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey]);
  const OX = frame ? frame.OX : 0;
  const W = frame ? frame.W : MAP_W;
  const H = frame ? frame.H : pts[pts.length - 1].y + 60;
  const cur = Math.min(unlocked, count);
  const [view, setView] = useState(() => ({ top: Math.max(0, pts[cur - 1].y - 280), h: 560 }));
  const [cardW, setCardW] = useState(340);
  const seen = useRef(new Set());

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.scrollTop = Math.max(0, pts[cur - 1].y - el.clientHeight / 2);
    let raf = 0;
    const read = () => { raf = 0; setView((v) => (Math.abs(v.top - el.scrollTop) > 40 || v.h !== el.clientHeight ? { top: el.scrollTop, h: el.clientHeight } : v)); };
    read();
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const upd = () => setCardW(el.clientWidth);
    upd();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const near = (key, y0, y1) => {
    if (seen.current.has(key)) return true;
    if (y1 >= view.top - AHEAD && y0 <= view.top + view.h + AHEAD) { seen.current.add(key); return true; }
    return false;
  };

  const X = (p) => p.x + OX;
  const d = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p).toFixed(1)} ${p.y.toFixed(1)}`).join('');
  const done = pts.slice(0, cur).map((p, k) => `${k ? 'L' : 'M'}${X(p).toFixed(1)} ${p.y.toFixed(1)}`).join('');
  const bg = frame
    ? zoneBackground(frame.zones, H, paper)
    : `linear-gradient(180deg, ${soft(C.sky, 0.55)}, ${soft(C.sage, 0.6)})`;
  // el avance: miguitas de color sobre el camino hasta el nivel que toca
  const crumbs = useMemo(() => (scene ? scene.trail.filter((t) => t.k <= cur - 1 + 1e-6) : []), [scene, cur]);
  const left = Math.round((cardW - W) / 2);
  const vis0 = -left, vis1 = cardW - left;

  return (
    <div ref={ref} className="pg-card" style={{ width: '100%', maxWidth: 340, height: 'min(560px, calc(100vh - 200px))', overflowY: 'auto', overflowX: 'hidden', padding: 0, position: 'relative', background: frame ? C.surface : bg }}>
      <div style={{ position: 'relative', width: W, height: H, marginLeft: frame ? left : 'auto', marginRight: frame ? 0 : 'auto', background: frame ? bg : undefined }}>
        {scene && scene.chunks.map((c) => near(c.key, c.y, c.y + c.h) && (
          <div key={c.key} style={{ position: 'absolute', left: 0, top: c.y, width: W, height: c.h, overflow: 'hidden', pointerEvents: 'none' }}>
            <Sprite markup={c.markup} cacheKey={`map-${c.key}`} w={W} h={c.h + CHUNK_PAD * 2} kind="surface" pixel={px} style={{ position: 'absolute', left: 0, top: -CHUNK_PAD }} />
          </div>
        ))}
        {scene && scene.pieces.map((p) => near(`p${p.n}`, p.y, p.y + p.h) && (
          <Sprite
            key={`p${p.n}`} markup={p.markup} cacheKey={`mp-${p.key}`} w={p.w} h={p.h} pixel={px}
            style={{ position: 'absolute', left: p.x, top: p.y, pointerEvents: 'none' }}
          />
        ))}
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
          {!frame && <path d={d} fill="none" stroke={C.line} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />}
          {!frame && <path d={d} fill="none" stroke={C.surface} strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />}
          {!frame && unlocked > 1 && <path d={done} fill="none" stroke={C.amber} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />}
          {frame && !scene && <path d={d} fill="none" stroke={C.line} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />}
          {scene && crumbs.map((t, i) => (isPixel
            ? <rect key={i} x={Math.round(t.x / 2) * 2 - 2} y={Math.round(t.y / 2) * 2 - 2} width="4" height="4" fill={scene.path.done} stroke={scene.path.ink} strokeWidth="1" strokeOpacity="0.55" shapeRendering="crispEdges" />
            : <circle key={i} cx={t.x} cy={t.y} r="2.6" fill={scene.path.done} stroke={scene.path.ink} strokeWidth="1" strokeOpacity="0.55" />))}
        </svg>
        {scene && scene.zones.map((z) => <ZoneSign key={z.name} z={z} vis0={vis0} vis1={vis1} />)}
        {pts.map((p, k) => {
          const n = k + 1;
          const open = n <= unlocked;
          const isCur = n === cur;
          const col = colors[k % colors.length];
          const s = stars[n] || 0;
          const side = p.side || (p.x > MAP_W / 2 ? 'L' : 'R');
          return (
            <div key={n} style={{ position: 'absolute', left: X(p) - 23, top: p.y - 23, width: 46, height: 46, zIndex: 2 }}>
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
                    position: 'absolute', left: side === 'L' ? 'auto' : 52, right: side === 'L' ? 52 : 'auto', top: 23, transform: 'translateY(-50%)', pointerEvents: 'none',
                    whiteSpace: 'nowrap', lineHeight: 1.15, textAlign: side === 'L' ? 'right' : 'left',
                    fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.ink,
                    ...(frame ? { background: C.surface, borderRadius: 7, padding: '2px 7px', boxShadow: SHADOW.soft, boxSizing: 'border-box' } : {}),
                  }}
                >
                  {frame ? labelLines(labels[k]).map((l, i) => <React.Fragment key={i}>{i ? <br /> : null}{l}</React.Fragment>) : labels[k]}
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
