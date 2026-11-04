import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import { Modal } from '../../ui';
import Sprite from '../../Sprite';
import { play } from '../../../sound';
import { diarioSvg } from '../../../art/room/personal';

// ─────────────────────────────────────────────────────────────────
// El diario de la mascota (personal/diary.js), abierto como un librito:
// una página por día, la más nueva primero (la de hoy, "escribiéndose").
// ─────────────────────────────────────────────────────────────────

const fmt = (day) => {
  try {
    const d = new Date(`${day}T12:00:00`);
    const s = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch (e) { return day; }
};

export default function DiaryModal({ pages, petName, onClose }) {
  const [i, setI] = useState(0);
  const page = pages[i];
  const go = (d) => { play('pop'); setI((v) => Math.max(0, Math.min(pages.length - 1, v + d))); };
  return (
    <Modal onClose={onClose} maxWidth={360} z={80}>
      <div className="pg-anim-pop" style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
        <Sprite markup={diarioSvg({ open: true })} cacheKey="diario-abierto" w={110} h={90} />
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 800, color: C.ink, margin: '2px 0 10px' }}>El diario de {petName}</h2>
      {!page ? (
        <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.4 }}>Todavía no escribió nada. Esta noche va a contar lo que pasó hoy.</p>
      ) : (
        <div
          key={page.date}
          className="pg-anim-pop"
          style={{
            position: 'relative', textAlign: 'left', background: '#FFFBF3', border: '1.5px solid #E8D9C4', borderRadius: 6,
            padding: '14px 16px 16px 26px', boxShadow: SHADOW.soft, minHeight: 170,
            backgroundImage: 'repeating-linear-gradient(180deg, transparent 0, transparent 25px, rgba(140,122,112,0.18) 25px, rgba(140,122,112,0.18) 26px)',
            backgroundPosition: '0 38px',
          }}
        >
          <span aria-hidden style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1.5, background: 'rgba(232,80,110,0.35)' }} />
          <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 15, color: '#D06A86', margin: '0 0 6px' }}>
            {fmt(page.date)}{page.draft ? ' · hoy' : ''}
          </p>
          <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 18.5, color: '#4A3439', lineHeight: '26px', margin: 0, whiteSpace: 'pre-wrap' }}>{page.text}</p>
          {page.draft && <p style={{ fontSize: 11.5, color: '#8C7A70', margin: '8px 0 0' }}>(se sigue escribiendo hasta la noche)</p>}
        </div>
      )}
      {pages.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <button onClick={() => go(1)} disabled={i >= pages.length - 1} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '7px 12px', fontSize: 12.5, opacity: i >= pages.length - 1 ? 0.45 : 1 }}>‹ Antes</button>
          <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkFaint }}>{i + 1} / {pages.length}</span>
          <button onClick={() => go(-1)} disabled={i === 0} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '7px 12px', fontSize: 12.5, opacity: i === 0 ? 0.45 : 1 }}>Después ›</button>
        </div>
      )}
      <button onClick={onClose} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 12, padding: '9px 24px', fontSize: 13 }}>Cerrar el diario</button>
    </Modal>
  );
}
