import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { IconClose, IconChevronRight } from '../icons';
import { play } from '../../sound';

// ─────────────────────────────────────────────────────────────────
// Piezas del rincón de quien regala: la hoja que sube desde abajo,
// secciones, plegables, chips y campos. Todo con los tokens del estilo
// (theme.js), así se ve bien en los seis estilos.
// ─────────────────────────────────────────────────────────────────

export const TONES = {
  rose: () => C.rose, amber: () => C.amber, sage: () => C.sage, sky: () => C.sky, lavender: () => C.lavender, peach: () => C.peach,
};
export const toneColor = (t) => (TONES[t] || TONES.rose)();

// Hoja que sube desde abajo, a pantalla casi completa en el celular.
export function Sheet({ title, subtitle, icon: Icon, color = C.rose, onClose, status, children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: C.overlay, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="rc-sheet"
        style={{
          width: '100%', maxWidth: 480, height: 'calc(100dvh - 28px)', maxHeight: 'calc(100vh - 28px)',
          background: C.paper, borderRadius: '24px 24px 0 0', boxShadow: SHADOW.lifted,
          display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: `1.5px solid ${C.line}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 10px 16px', borderBottom: `1.5px solid ${C.lineSoft}`, background: C.paper }}>
          {Icon && (
            <span className="pg-card" style={{ width: 40, height: 40, borderRadius: 14, display: 'grid', placeItems: 'center', flexShrink: 0, background: soft(color, 0.72), borderColor: color }}>
              <Icon size={22} color={color} stroke={2.1} />
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>{title}</div>
            {(subtitle || status) && <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2, lineHeight: 1.3 }}>{status || subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="pg-btn pg-btn-ghost pg-focus pg-keep-round" style={{ width: 36, height: 36, padding: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', flexShrink: 0 }}>
            <IconClose size={17} color={C.ink} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 14px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        </div>
      </div>
      <style>{`
        .rc-sheet { animation: rc-up .32s cubic-bezier(.2,.9,.3,1) both; }
        @keyframes rc-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
        [data-style="pixel"] .rc-sheet { animation-timing-function: steps(4); }
      `}</style>
    </div>
  );
}

// Una sección dentro de la hoja: título, una línea que explica y lo suyo.
export function Section({ title, hint, children, right, id, highlight }) {
  return (
    <section id={id} className="pg-card" style={{ padding: 14, ...(highlight ? { borderColor: C.rose, boxShadow: SHADOW.glowRose } : null) }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>{title}</h3>
          {right}
        </div>
      )}
      {hint && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '3px 0 0', lineHeight: 1.4 }}>{hint}</p>}
      <div style={{ marginTop: title || hint ? 10 : 0 }}>{children}</div>
    </section>
  );
}

// Lo avanzado, plegado: se abre con un toque.
export function Fold({ title, hint, children, open: openProp, defaultOpen = false, badge, id, icon: Icon, color }) {
  const [open, setOpen] = useState(openProp != null ? openProp : defaultOpen);
  useEffect(() => { if (openProp != null) setOpen(openProp); }, [openProp]);
  return (
    <section id={id} className="pg-card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => { play('pop'); setOpen((o) => !o); }} aria-expanded={open} className="pg-focus"
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: C.ink }}
      >
        {Icon && <Icon size={20} color={color || C.inkSoft} stroke={2.1} />}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: FONT.display, fontSize: 14.5, fontWeight: 800 }}>{title}</span>
          {hint && <span style={{ display: 'block', fontSize: 12, color: C.inkSoft, marginTop: 2, lineHeight: 1.3 }}>{hint}</span>}
        </span>
        {badge != null && badge !== '' && (
          <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: C.onAccent, background: C.rose, borderRadius: 999, padding: '2px 8px' }}>{badge}</span>
        )}
        <IconChevronRight size={16} color={C.inkSoft} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && <div style={{ padding: '0 14px 14px' }}>{children}</div>}
    </section>
  );
}

// "Pronto": un lugar discreto para lo que llega en otra etapa.
export function Soon({ title, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 16, border: `1.5px dashed ${C.line}`, color: C.inkSoft }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700 }}>{title}</div>
        {text && <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 1, lineHeight: 1.3 }}>{text}</div>}
      </div>
      <span style={{ fontFamily: FONT.display, fontSize: 11, fontWeight: 800, color: C.lavender, border: `1.5px solid ${C.lavender}`, borderRadius: 999, padding: '2px 9px' }}>pronto</span>
    </div>
  );
}

export function Chip({ children, onClick, active, color, disabled, title, style }) {
  const c = color || C.rose;
  return (
    <button
      onClick={onClick} disabled={disabled} title={title} className="pg-focus"
      style={{
        padding: '7px 12px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, lineHeight: 1.2,
        cursor: disabled ? 'default' : 'pointer', textAlign: 'left',
        background: active ? c : C.surface, color: active ? C.onAccent : C.ink,
        border: `1.5px solid ${active ? c : C.line}`, opacity: disabled && !active ? 0.55 : 1, ...style,
      }}
    >
      {children}
    </button>
  );
}

export const ChipRow = ({ children, style }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, ...style }}>{children}</div>;

const fieldStyle = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'var(--pg-font-body)', fontSize: 15,
  padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink,
};

export function TextField({ value, onChange, placeholder, label, max = 120, type = 'text', style, onBlur, autoFocus, ...rest }) {
  return (
    <input
      type={type} value={value || ''} onChange={(e) => onChange(e.target.value.slice(0, max))} onBlur={onBlur}
      placeholder={placeholder} aria-label={label || placeholder} className="pg-focus" autoFocus={autoFocus}
      style={{ ...fieldStyle, ...style }} {...rest}
    />
  );
}

// Papel de carta: letra a mano y renglones suaves.
export function LetterArea({ value, onChange, placeholder, label, max = 600, rows = 5, style }) {
  return (
    <div>
      <textarea
        value={value || ''} onChange={(e) => onChange(e.target.value.slice(0, max))} rows={rows}
        placeholder={placeholder} aria-label={label || placeholder} className="pg-focus"
        style={{
          ...fieldStyle, resize: 'vertical', fontFamily: FONT.hand || FONT.body, fontSize: 18, lineHeight: '26px',
          background: `repeating-linear-gradient(180deg, transparent 0 25px, ${C.lineSoft} 25px 26px), ${soft(C.amber, 0.9)}`,
          backgroundAttachment: 'local', padding: '8px 12px', ...style,
        }}
      />
      <div style={{ textAlign: 'right', fontSize: 11, color: (value || '').length > max - 40 ? C.rose : C.inkFaint, marginTop: 2 }}>{(value || '').length}/{max}</div>
    </div>
  );
}

export function MainButton({ children, onClick, disabled, busy, color = 'rose', style }) {
  return (
    <button
      onClick={onClick} disabled={disabled || busy} className={`pg-btn pg-btn-${color} pg-focus`}
      style={{ width: '100%', padding: 13, fontSize: 15, ...style }}
    >
      {busy ? 'Enviando…' : children}
    </button>
  );
}

export function SmallButton({ children, onClick, disabled, style, ...rest }) {
  return (
    <button onClick={onClick} disabled={disabled} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '7px 12px', fontSize: 12.5, ...style }} {...rest}>
      {children}
    </button>
  );
}

// Aviso corto de "¡Listo!" o de error, dentro de una sección.
export function Note({ children, tone = 'ok' }) {
  if (!children) return null;
  const c = tone === 'error' ? C.rose : C.sageDeep;
  return <p className="pg-anim-pop" style={{ fontSize: 12.5, fontWeight: 700, color: c, margin: '8px 0 0', lineHeight: 1.35 }}>{children}</p>;
}

// Un mensaje que se borra solo a los pocos segundos.
export function useFlash(ms = 3200) {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(null), ms);
    return () => clearTimeout(t);
  }, [msg, ms]);
  return [msg, setMsg];
}

// Botón chiquito de quitar (×).
export function RemoveBtn({ onClick, label = 'Quitar' }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="pg-focus pg-keep-round"
      style={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%', border: `1.5px solid ${C.line}`, background: C.surface, color: C.inkSoft, cursor: 'pointer', fontWeight: 800, fontSize: 15, lineHeight: 1, padding: 0 }}>
      ×
    </button>
  );
}

export const ERRORS = {
  'sin-permiso': 'Esa llave no abre este rincón. Revisa que sea la del regalo.',
  'muchas-cartas': 'Hoy ya mandaste muchas cosas. Mañana puedes mandar más.',
  'muy-pesada': 'Es muy pesado para mandarlo. Prueba con algo más liviano.',
  'sin-conexion': 'No hay conexión con el servidor. Intenta de nuevo en un rato.',
};
