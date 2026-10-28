import React, { useEffect, useState } from 'react';
import { C, FONT } from '../../theme';
import { Modal } from '../ui';
import { IconHeart } from '../icons';
import { fetchLetters } from '../../api';

// Las cartas que llegaron por el buzón, para volver a leerlas (viven en
// el servidor: la partida solo recuerda la última que llegó).
const fmtDate = (iso) => {
  if (!iso) return '';
  try { return new Date(`${iso}Z`).toLocaleDateString('es', { day: 'numeric', month: 'long' }); } catch (e) { return ''; }
};

export default function MailArchive({ slug, from, onOpen, onClose }) {
  const [letters, setLetters] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchLetters(slug, 0).then((l) => { if (alive) setLetters(l ? l.slice().reverse() : []); });
    return () => { alive = false; };
  }, [slug]);
  return (
    <Modal onClose={onClose} maxWidth={360} z={78}>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 2px' }}>Cartas de {from || 'quien te regaló esto'}</h2>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px' }}>Todas las que te han llegado al cuarto.</p>
      {letters === null && <p style={{ fontSize: 13, color: C.inkFaint }}>Buscando las cartas…</p>}
      {letters && letters.length === 0 && <p style={{ fontSize: 13, color: C.inkFaint }}>No se pudieron cargar ahora. Revisa tu conexión.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '52vh', overflowY: 'auto', textAlign: 'left' }}>
        {(letters || []).map((l) => (
          <button key={l.id} onClick={() => onOpen(l.id)} className="pg-card pg-focus" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <IconHeart size={16} color={C.rose} fill={C.roseSoft} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: '-webkit-box', fontSize: 13, color: C.ink, lineHeight: 1.35, overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{l.text}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: C.inkFaint, marginTop: 3 }}>{fmtDate(l.created_at)}{l.has_photo ? ' · con foto' : ''}</span>
            </span>
          </button>
        ))}
      </div>
      <button onClick={onClose} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, padding: '9px 24px', fontSize: 13 }}>Cerrar</button>
    </Modal>
  );
}
