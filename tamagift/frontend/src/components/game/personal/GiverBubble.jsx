import React from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import { IconHeart } from '../../icons';

// La burbuja de la mascota cuando lo que dice viene de quien regala: borde
// rosado, un corazoncito y "de parte de …" arriba, para que se note que no
// es una frase cualquiera de la mascota.
export default function GiverBubble({ text, header }) {
  return (
    <div
      className="pg-anim-pop" role="status"
      style={{
        position: 'relative', background: C.glass, border: `2px solid ${C.rose}`, borderRadius: 16,
        padding: '5px 13px 8px', boxShadow: SHADOW.glowRose || SHADOW.soft, maxWidth: '100%', textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: FONT.display, fontSize: 10.5, fontWeight: 800, color: C.roseDeep, lineHeight: 1.2 }}>
        <IconHeart size={11} color={C.rose} fill={C.rose} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{header}</span>
      </div>
      <div style={{ fontFamily: FONT.body, fontSize: 12.5, fontWeight: 600, color: C.ink, lineHeight: 1.3, marginTop: 2 }}>{text}</div>
    </div>
  );
}
