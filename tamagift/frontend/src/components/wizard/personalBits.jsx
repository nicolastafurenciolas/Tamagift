// Piezas chicas del asistente para lo personal: ideas tocables, el
// selector de fecha para celular y el campo de texto de estas tarjetas.
import React from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { MONTHS, daysIn, dateComplete, dateToWords } from './profileDraft';

// Una fila de ideas que se tocan para no pensar. En celular se desliza
// de costado en vez de ocupar tres renglones.
export function IdeaChips({ ideas, value, onPick, color }) {
  const c = color || C.rose;
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '2px 2px 4px', margin: '0 -2px' }}>
      {ideas.map((idea) => {
        const on = String(value || '').trim().toLowerCase() === idea.toLowerCase();
        return (
          <button
            key={idea}
            type="button"
            onClick={() => onPick(on ? '' : idea)}
            className="pg-focus"
            style={{
              flexShrink: 0, fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              padding: '5px 12px', borderRadius: 999, whiteSpace: 'nowrap',
              background: on ? c : C.surfaceAlt, color: on ? C.onAccent : C.inkSoft,
              border: `1.5px solid ${on ? c : C.line}`,
            }}
          >
            {idea}
          </button>
        );
      })}
    </div>
  );
}

const fieldStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 13, fontSize: 15, color: C.ink,
  border: `1.5px solid ${C.line}`, background: C.surface, fontFamily: FONT.body,
  outline: 'none', boxShadow: SHADOW.pressed,
};

export function SoftInput({ value, onChange, placeholder, maxLength, label }) {
  return (
    <input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-label={label}
      className="pg-focus"
      style={{ ...fieldStyle, marginBottom: 8 }}
    />
  );
}

export function SoftTextarea({ value, onChange, placeholder, maxLength, label }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-label={label}
      rows={2}
      className="pg-focus"
      style={{ ...fieldStyle, fontSize: 14.5, lineHeight: 1.4, resize: 'none', minHeight: 64 }}
    />
  );
}

// Selector de fecha amable para el celular: tres listas nativas (en el
// teléfono se abren como ruedita). Día y mes hacen falta; el año no.
const selectStyle = {
  ...fieldStyle, padding: '9px 8px', fontSize: 16, appearance: 'auto', cursor: 'pointer', minWidth: 0,
};

export function DatePick({ value, onChange, label, yearFrom, yearTo }) {
  const v = value || {};
  const max = daysIn(Number(v.m) || 0, Number(v.y) || 0);
  const years = [];
  for (let y = yearTo; y >= yearFrom; y--) years.push(y);
  const set = (patch) => {
    const next = { d: v.d || '', m: v.m || '', y: v.y || '', ...patch };
    const lim = daysIn(Number(next.m) || 0, Number(next.y) || 0);
    if (next.d && Number(next.d) > lim) next.d = lim;
    onChange(next.d || next.m || next.y ? next : null);
  };
  const num = (s) => (s === '' ? '' : Number(s));
  const done = dateComplete(v);
  const partial = !done && (v.d || v.m || v.y);
  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <select aria-label={`${label}: día`} value={v.d || ''} onChange={(e) => set({ d: num(e.target.value) })} className="pg-focus" style={{ ...selectStyle, flex: 0.85, color: v.d ? C.ink : C.inkFaint }}>
          <option value="">Día</option>
          {Array.from({ length: max }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select aria-label={`${label}: mes`} value={v.m || ''} onChange={(e) => set({ m: num(e.target.value) })} className="pg-focus" style={{ ...selectStyle, flex: 1.6, color: v.m ? C.ink : C.inkFaint }}>
          <option value="">Mes</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m[0].toUpperCase() + m.slice(1)}</option>)}
        </select>
        <select aria-label={`${label}: año (opcional)`} value={v.y || ''} onChange={(e) => set({ y: num(e.target.value) })} className="pg-focus" style={{ ...selectStyle, flex: 1.05, color: v.y ? C.ink : C.inkFaint }}>
          <option value="">Año</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div style={{ minHeight: 18, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: done ? C.sage : C.inkFaint }}>
          {done ? `✓ ${dateToWords(v)}` : partial ? (v.d ? 'Falta el mes' : v.m ? 'Falta el día' : 'Falta el día y el mes') : 'El año es opcional'}
        </span>
        {(done || partial) && (
          <button type="button" onClick={() => onChange(null)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkFaint, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}

export function Section({ title, hint, children, last }) {
  return (
    <div className="pg-card" style={{ padding: '14px 14px 12px', marginBottom: last ? 0 : 14 }}>
      <p style={{ fontFamily: FONT.display, fontSize: 14.5, fontWeight: 800, margin: 0, color: C.ink }}>{title}</p>
      {hint && <p style={{ fontSize: 12, color: C.inkSoft, margin: '2px 0 10px', lineHeight: 1.4 }}>{hint}</p>}
      {!hint && <div style={{ height: 8 }} />}
      {children}
    </div>
  );
}
