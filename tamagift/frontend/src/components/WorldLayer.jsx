import React from 'react';
import Sprite from './Sprite';
import { ROOM } from '../gameState';
import { PHASES } from '../world';
import { findFurniture } from '../roomCatalog';
import { findDecor } from '../shopCatalog';
import { switchSvg } from '../art/room/world';

// ─────────────────────────────────────────────────────────────────
// Lo que el mundo le hace al cuarto: la luz según la hora, las lámparas
// que alumbran de noche, la lluvia o la nieve en las ventanas y el
// interruptor de la luz. Todo en coordenadas del mundo (1600 × 430).
// ─────────────────────────────────────────────────────────────────

// Lo que da luz (id → cuánto alumbra, en múltiplos de su ancho).
const LIGHTS = {
  mueble: { lampara: 2.4, lamparaArco: 2.2, guirnalda: 1.2, letrero: 1.4, tiraLed: 0.8, tocadorLuces: 1.3, arcade: 1.3, setupGamer: 1.1, lavalamp: 1.6 },
  decor: {
    lampara: 2.6, velas: 2.4, lavalamp: 2.4, velaMono: 2.4, candelabro: 2.2, lamparaHongo: 2.6, lamparaConejo: 2.6, proyector: 2.8, lunaLampara: 2.6, lamparaBanquero: 2.4, polaroids: 1.4, bolaCristal: 1.8,
    // de temporada
    calabazaTallada: 2.2, farolito: 2.6, caldero: 1.6, arbolNavidad: 1.4, lucesNavidad: 1.1,
  },
};

// Rectángulo del vidrio de cada ventana, en su dibujo (para la lluvia).
const GLASS = {
  ventana: { x: 24, y: 24, w: 116, h: 102, vw: 164 },
  ventanaRedonda: { x: 16, y: 14, w: 92, h: 92, vw: 124, round: true },
};

function placedBox(it) {
  const f = it.kind === 'mueble' ? findFurniture(it.refId) : null;
  const d = it.kind === 'decor' ? findDecor(it.refId) : null;
  const w = f ? f.w : d ? Math.round(d.w * 1.25) : 100;
  const h = f ? f.h : d ? Math.round(d.h * 1.25) : 100;
  const foot = f ? f.foot : d ? d.foot * 1.25 : 0;
  const s = it.scale || 1;
  return { left: it.x - (w * s) / 2, top: it.y - (h - foot) * s, w: w * s, h: h * s };
}

export function NightLayer({ phase, lightsOff, placed, styleId }) {
  const p = PHASES[phase] || PHASES.dia;
  // lo-fi y neón ya son de noche: ahí la noche pesa la mitad
  const soften = styleId === 'lofi' || styleId === 'neon' ? 0.5 : 1;
  const dark = lightsOff ? (phase === 'noche' || phase === 'tarde' ? 0.78 : 0.5) : p.dark * soften;
  const showGlows = lightsOff || phase === 'noche' || phase === 'tarde';
  const glows = showGlows ? placed.flatMap((it) => {
    const k = (LIGHTS[it.kind] || {})[it.refId];
    if (!k) return [];
    const b = placedBox(it);
    const r = Math.max(70, b.w * k * 0.5);
    return [{ key: it.key, cx: b.left + b.w / 2, cy: b.top + b.h * 0.35, r }];
  }) : [];
  return (
    <>
      {p.tint && !lightsOff && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: p.tint, mixBlendMode: 'multiply', opacity: soften }} />
      )}
      {dark > 0 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `rgba(14,14,46,${dark})`, transition: 'background 0.6s' }} />
      )}
      {glows.map((gl) => (
        <div
          key={gl.key}
          style={{
            position: 'absolute', left: gl.cx - gl.r, top: gl.cy - gl.r, width: gl.r * 2, height: gl.r * 2, pointerEvents: 'none',
            background: `radial-gradient(circle, rgba(255,214,150,${lightsOff ? 0.5 : 0.42}) 0%, rgba(255,190,120,0.18) 45%, rgba(255,190,120,0) 70%)`,
            mixBlendMode: 'screen',
          }}
        />
      ))}
    </>
  );
}

export function WeatherOnWindows({ weather, placed }) {
  if (weather === 'sol') return null;
  return placed.filter((it) => it.kind === 'mueble' && GLASS[it.refId]).map((it) => {
    const g = GLASS[it.refId];
    const b = placedBox(it);
    const k = b.w / (g.vw * 1.0);
    const style = {
      position: 'absolute', left: b.left + g.x * k, top: b.top + g.y * k, width: g.w * k, height: g.h * k,
      overflow: 'hidden', pointerEvents: 'none', borderRadius: g.round ? '50%' : 3,
    };
    if (weather === 'nublado') return <div key={it.key} style={{ ...style, background: 'rgba(170,176,196,0.45)' }} />;
    const rain = weather === 'lluvia';
    return (
      <div key={it.key} style={{ ...style, background: rain ? 'rgba(120,130,160,0.35)' : 'rgba(220,230,245,0.2)' }}>
        <div
          className={rain ? 'pg-rain' : 'pg-snow'}
          style={{
            position: 'absolute', inset: '-50% 0 0 0',
            backgroundImage: rain
              ? 'repeating-linear-gradient(105deg, rgba(220,235,255,0.0) 0 9px, rgba(220,235,255,0.75) 9px 10.5px)'
              : 'radial-gradient(circle, #FFFFFF 0 2.2px, transparent 2.6px), radial-gradient(circle, #FFFFFF 0 1.6px, transparent 2px)',
            backgroundSize: rain ? '22px 30px' : '26px 26px, 17px 17px',
            backgroundPosition: rain ? '0 0' : '0 0, 9px 11px',
          }}
        />
      </div>
    );
  });
}

export function LightSwitch({ x, y, lightsOff, onToggle, pixel }) {
  return (
    <button
      data-tap onClick={onToggle} aria-label={lightsOff ? 'Prender la luz' : 'Apagar la luz'}
      style={{ position: 'absolute', left: x, top: y, width: 30, height: 42, padding: 0, border: 'none', background: 'none', cursor: 'pointer', zIndex: 3 }}
    >
      <Sprite markup={switchSvg(!lightsOff)} cacheKey={`switch-${lightsOff ? 'off' : 'on'}`} w={30} h={42} pixel={pixel} />
    </button>
  );
}

// Zzz sobre la mascota dormida.
export function Zzz() {
  return (
    <div style={{ position: 'absolute', right: 24, top: -6, pointerEvents: 'none' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="pg-zzz" style={{ position: 'absolute', left: i * 14, top: -i * 16, fontFamily: 'inherit', fontWeight: 900, fontSize: 18 + i * 5, color: '#FFFFFF', textShadow: '0 1px 0 #3A2A3E, 1px 0 0 #3A2A3E, -1px 0 0 #3A2A3E, 0 -1px 0 #3A2A3E', animationDelay: `${i * 0.5}s` }}>z</span>
      ))}
    </div>
  );
}

// Sucia: manchitas y dos moscas que dan vueltas (se quitan bañándola).
export function Dirt({ level }) {
  if (level > 30) return null;
  const heavy = level < 15;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[[34, 62, 9], [62, 70, 7], [48, 80, 6], ...(heavy ? [[70, 56, 8], [40, 50, 6]] : [])].map(([x, y, r], i) => (
        <span key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: r, height: r * 0.8, borderRadius: '50%', background: 'rgba(120,86,60,0.45)' }} />
      ))}
      {[0, 1].map((i) => (
        <span key={`f${i}`} className="pg-fly pg-keep-round" style={{ position: 'absolute', left: '50%', top: '18%', width: 6, height: 6, borderRadius: '50%', background: '#3A3044', animationDelay: `${i * 0.7}s`, boxShadow: '0 0 0 2px rgba(255,255,255,0.6)' }} />
      ))}
    </div>
  );
}
