// Primera parte del paso "Frases": los tres mensajes por situación
// (triste, antes de dormir, lluvia) ya escritos con el primer ejemplo,
// para revisar o cambiar. La mascota los dice en ese momento, de parte
// de quien regala.
import React from 'react';
import { C, FONT } from '../../theme';
import { IconEnvelope } from '../icons';
import { SoftTextarea } from './personalBits';
import { QUICK_SITUATIONS, situationText } from './profileDraft';

export default function SituationsPart({ about, setAbout, names, petName, partnerName }) {
  const setSit = (id, patch) => setAbout((a) => ({
    ...a,
    situations: { ...a.situations, [id]: { ...((a.situations || {})[id] || { idx: 0, text: null }), ...patch } },
  }));
  const nextIdea = (s) => {
    const cur = (about.situations[s.id] || { idx: 0 }).idx || 0;
    setSit(s.id, { idx: (cur + 1) % s.examples.length, text: null });
  };

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
        <IconEnvelope size={17} color={C.rose} />
        <p style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>Mensajes de tu parte</p>
      </div>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px', lineHeight: 1.45 }}>
        {(petName || '').trim() || 'Su mascota'} se los va a decir a {(partnerName || '').trim() || 'tu pareja'} justo en ese momento, de tu parte.
      </p>
      {QUICK_SITUATIONS.map((s) => {
        const text = situationText(about, s, names);
        return (
          <div key={s.id} className="pg-card" style={{ padding: '11px 12px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
              <span style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.ink }}>{s.label}</span>
              <button
                type="button"
                onClick={() => nextIdea(s)}
                className="pg-btn pg-btn-ghost pg-focus"
                style={{ padding: '4px 11px', fontSize: 12, flexShrink: 0 }}
              >
                ↻ Otra idea
              </button>
            </div>
            <SoftTextarea
              label={s.label}
              value={text}
              onChange={(v) => setSit(s.id, { text: v })}
              placeholder="Vacío: este no se usa"
              maxLength={200}
            />
          </div>
        );
      })}
    </div>
  );
}
