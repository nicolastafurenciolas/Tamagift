import React from 'react';
import { C, FONT, SHADOW, tint, soft, alpha } from '../theme';
import { IconBack, IconHeart } from './icons';

// ─────────────────────────────────────────────────────────────────
// Piezas de interfaz compartidas por el juego y sus pantallas.
//
// Todas leen los tokens de theme.js (variables CSS), así que se visten
// solas con el estilo activo; lo propio de cada estilo (esquinas de
// píxel, brillo de neón…) lo pone index.css sobre las clases pg-*.
// ─────────────────────────────────────────────────────────────────

// Contenedor de cada pantalla: ancho de celular, centrado y con la
// entrada animada propia del estilo.
export function Screen({ children, style }) {
  return (
    <div className="w-full flex flex-col items-center pg-screen" style={{ padding: '0 14px', ...style }}>
      {children}
    </div>
  );
}

export function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <div style={{ width: '100%', maxWidth: 340, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        <button onClick={onBack} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '7px 9px', display: 'flex', alignItems: 'center' }} aria-label="Volver">
          <IconBack size={18} color={C.ink} />
        </button>
        {right || <span style={{ width: 34 }} />}
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 21, fontWeight: 800, textAlign: 'center', margin: '8px 0 2px', color: C.ink }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12.5, color: C.inkSoft, textAlign: 'center', margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// Número grande con etiqueta chica (puntos, pisos, cruces…).
export function Badge({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: color || C.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

// Fila de corazones de vidas.
export function Hearts({ lives, total = 3, size = 17 }) {
  return (
    <div style={{ display: 'flex', gap: 5 }} aria-label={`${lives} vidas`}>
      {Array.from({ length: total }, (_, i) => (
        <IconHeart key={i} size={size} color={C.rose} fill={i < lives ? C.rose : 'transparent'} />
      ))}
    </div>
  );
}

// Etiqueta de texto pequeña a la derecha de una cabecera.
export function HeaderTag({ children, color }) {
  return <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: color || C.inkSoft }}>{children}</span>;
}

// Botón redondo de la barra de arriba.
export function RoundBtn({ children, onClick, label, active, activeColor }) {
  return (
    <button
      onClick={onClick} className="pg-focus pg-keep-round" aria-label={label} title={label}
      style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        background: active ? (activeColor || C.rose) : C.surface,
        border: `1.5px solid ${active ? (activeColor || C.rose) : C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.soft,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

// Medidor compacto para superponer sobre la escena.
const METER = {
  hunger: { label: 'Hambre', color: () => C.peach },
  love: { label: 'Amor', color: () => C.rose },
  energy: { label: 'Energía', color: () => C.amber },
  clean: { label: 'Limpieza', color: () => C.sky },
};
export function MiniMeter({ kind, value, icon: Icon }) {
  const color = (METER[kind] || METER.love).color();
  const pct = Math.max(0, Math.min(100, value));
  const low = pct <= 20;
  return (
    <div
      role="meter" aria-label={(METER[kind] || METER.love).label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: C.glass, borderRadius: 999,
        padding: '3px 8px 3px 5px', border: `1px solid ${C.line}`, boxShadow: SHADOW.soft,
        animation: low ? 'pg-nudge 1.2s ease-in-out infinite' : 'none',
      }}
    >
      {Icon && <Icon size={12} color={color} />}
      <div style={{ width: 40, height: 6, borderRadius: 999, background: C.track, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: low ? C.roseDeep : color, borderRadius: 999, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

// Botón del dock de acciones de la pantalla principal.
export function ActionButton({ icon: Icon, label, color, onClick, active, tut }) {
  return (
    <button onClick={onClick} data-tut={tut} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, padding: 0 }}>
      <span
        className="pg-card"
        style={{
          width: 'min(54px, 100%)', aspectRatio: '1', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? soft(color, 0.7) : C.surface,
          borderColor: active ? color : C.line,
        }}
      >
        <Icon size={27} color={color} stroke={2.1} />
      </span>
      <span className="pg-dock-label" style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 11, color: C.ink, whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </button>
  );
}

// Velo de modal + tarjeta centrada. `position: fixed` con su propio
// fondo, por encima de todo.
export function Modal({ children, onClose, maxWidth = 330, z = 70 }) {
  return (
    <div
      className="pg-anim-rise"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: z, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.overlay, padding: 20,
      }}
    >
      <div className="pg-card pg-anim-pop" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth, padding: 22, textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// Aviso flotante (combo, perfecto, algo que no le gustó…).
export function Toast({ children, color, style }) {
  return (
    <div
      className="pg-anim-pop"
      style={{
        background: color || C.rose, color: C.onAccent, borderRadius: 999, padding: '7px 15px',
        fontFamily: FONT.display, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap',
        boxShadow: SHADOW.lifted, pointerEvents: 'none', ...style,
      }}
    >
      {children}
    </div>
  );
}

// Tablero de un minijuego: marco de escena con fondo propio del estilo.
export function Board({ children, style, className = '', ...rest }) {
  return (
    <div
      className={`pg-sticker ${className}`}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 22, touchAction: 'none',
        background: `linear-gradient(180deg, ${C.board1}, ${C.board2})`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export { alpha, tint };
