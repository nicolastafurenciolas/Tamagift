import React from 'react';
import * as Icons from '../components/icons';
import { C, FONT } from '../theme';

// ─────────────────────────────────────────────────────────────────
// Página de revisión (solo desarrollo): /iconos?estilo=pixel
// Todos los íconos de interfaz en los tamaños en que se usan, sobre
// fondo claro y sobre botón de color, con y sin relleno.
// ─────────────────────────────────────────────────────────────────

const SIZES = [12, 14, 16, 20, 27, 40];
const LIST = Object.entries(Icons).filter(([k]) => k.startsWith('Icon'));

export default function IconLab() {
  return (
    <div style={{ padding: 16, background: C.paper, minHeight: '100vh', color: C.ink, fontFamily: FONT.body }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 8 }}>
        {LIST.map(([name, Icon]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8 }}>
            <div style={{ width: 92, fontSize: 11, fontWeight: 700 }}>{name.slice(4)}</div>
            {SIZES.map((s) => <Icon key={s} size={s} color={C.ink} />)}
            <div style={{ background: C.rose, borderRadius: 8, padding: 4, display: 'flex' }}><Icon size={20} color={C.onAccent} /></div>
            <Icon size={20} color={C.amber} fill={C.amberSoft} />
          </div>
        ))}
      </div>
    </div>
  );
}
