import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import { Modal } from '../../ui';
import { play } from '../../../sound';
import { saveSnapshot, sendReply } from '../../../api';
import { sharePhoto, downloadPhoto, canShareFiles } from '../Album';

// ─────────────────────────────────────────────────────────────────
// La foto recién tomada del cuarto (lo mismo que PhotoModal de
// Album.jsx) y, además, "Mandársela a {quien regala}": le llega a su
// rincón como respuesta (sendReply, kind 'foto').
// ─────────────────────────────────────────────────────────────────

const ERR_SAVE = { 'muchas-fotos': 'Hoy ya guardaste muchas fotos. Mañana caben más.', 'muy-pesada': 'La foto quedó muy pesada para guardarla.', 'sin-conexion': 'No hay conexión: bájala para no perderla.' };
const ERR_SEND = { muchas: 'Hoy ya mandaste muchas cosas. Mañana se puede de nuevo.', 'muy-pesada': 'La foto quedó muy pesada para mandarla.', 'sin-conexion': 'No hay conexión. Intenta de nuevo en un ratito.' };

export default function PhotoSendModal({ photo, slug, petName, giverName, canSave, onClose, onOpenAlbum }) {
  const [save, setSave] = useState('nueva');   // nueva | guardando | guardada | error
  const [send, setSend] = useState('nueva');   // nueva | mandando | enviada | error
  const [err, setErr] = useState('');
  const giver = giverName || 'quien te regaló esto';

  async function doSave() {
    setSave('guardando');
    const r = await saveSnapshot(slug, { image: photo.image, thumb: photo.thumb, caption: photo.caption });
    if (r.ok) { play('coin'); setSave('guardada'); setErr(''); } else { play('bad'); setErr(ERR_SAVE[r.error] || ERR_SAVE['sin-conexion']); setSave('error'); }
  }
  async function doSend() {
    setSend('mandando');
    const r = await sendReply(slug, { kind: 'foto', photo: photo.image, text: photo.caption || null });
    if (r.ok) { play('good'); setSend('enviada'); setErr(''); } else { play('bad'); setErr(ERR_SEND[r.error] || ERR_SEND['sin-conexion']); setSend('error'); }
  }

  return (
    <Modal onClose={onClose} maxWidth={340} z={86}>
      <div className="pg-anim-pop" style={{ padding: '4px 6px 10px' }}>
        <div style={{ transform: 'rotate(-1.5deg)', boxShadow: SHADOW.lifted || '0 6px 18px rgba(0,0,0,0.18)', borderRadius: 4, overflow: 'hidden', background: '#FFFDF8' }}>
          <img src={photo.image} alt={`Foto de ${petName}`} style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>
      </div>
      {save === 'guardada' && <p style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.sageDeep || C.sage, margin: '6px 0 2px' }}>¡Guardada en el álbum!</p>}
      {send === 'enviada' && <p style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.roseDeep, margin: '6px 0 2px' }}>¡Se la mandamos a {giver}!</p>}
      {err && <p style={{ fontSize: 12.5, color: C.rose, margin: '6px 0 2px' }}>{err}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
        {canSave && send !== 'enviada' && (
          <button onClick={doSend} disabled={send === 'mandando'} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '11px 18px', fontSize: 14 }}>
            {send === 'mandando' ? 'Mandando…' : `Mandársela a ${giver}`}
          </button>
        )}
        {canSave && save !== 'guardada' && (
          <button onClick={doSave} disabled={save === 'guardando'} className={`pg-btn ${send === 'enviada' ? 'pg-btn-rose' : 'pg-btn-ghost'} pg-focus`} style={{ padding: '10px 18px', fontSize: 13.5 }}>
            {save === 'guardando' ? 'Guardando…' : 'Guardar en el álbum'}
          </button>
        )}
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={() => { play('pop'); sharePhoto(photo.image, petName); }} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '9px 10px', fontSize: 13 }}>{canShareFiles() ? 'Compartir' : 'Descargar'}</button>
          {canShareFiles() && <button onClick={() => { play('pop'); downloadPhoto(photo.image, petName); }} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '9px 10px', fontSize: 13 }}>Descargar</button>}
        </div>
        {canSave && save === 'guardada' && <button onClick={onOpenAlbum} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '9px 10px', fontSize: 13 }}>Ver el álbum</button>}
        <button onClick={onClose} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft, padding: 6 }}>{save === 'guardada' || send === 'enviada' ? 'Listo' : 'Descartar'}</button>
      </div>
    </Modal>
  );
}
