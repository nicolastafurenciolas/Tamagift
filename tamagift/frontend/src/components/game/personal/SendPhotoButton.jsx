import React, { useState } from 'react';
import { C, FONT } from '../../../theme';
import { play } from '../../../sound';
import { sendReply } from '../../../api';
import { IconHeart } from '../../icons';

// "Mandársela a {quien regala}": la foto del cuarto le llega a su rincón
// (sendReply, kind 'foto'). Va dentro de PhotoModal (Album.jsx) como
// `extraAction`.

const ERR = { muchas: 'Hoy ya mandaste muchas cosas. Mañana se puede de nuevo.', 'muy-pesada': 'La foto quedó muy pesada para mandarla.', 'sin-conexion': 'No hay conexión. Intenta de nuevo en un ratito.' };

export default function SendPhotoButton({ slug, photo, giverName }) {
  const [state, setState] = useState('nueva'); // nueva | mandando | enviada
  const [err, setErr] = useState('');
  const giver = giverName || 'quien te regaló esto';
  async function send() {
    setState('mandando'); setErr('');
    const r = await sendReply(slug, { kind: 'foto', photo: photo.image, text: photo.caption || null });
    if (r.ok) { play('good'); setState('enviada'); } else { play('bad'); setErr(ERR[r.error] || ERR['sin-conexion']); setState('nueva'); }
  }
  if (state === 'enviada') {
    return <p style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.roseDeep, margin: '2px 0' }}>¡Se la mandamos a {giver}!</p>;
  }
  return (
    <>
      <button
        onClick={send} disabled={state === 'mandando'} className="pg-btn pg-btn-ghost pg-focus"
        style={{ padding: '10px 18px', fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: C.roseDeep, borderColor: C.rose }}
      >
        <IconHeart size={15} color={C.rose} fill={C.roseSoft} />
        {state === 'mandando' ? 'Mandando…' : `Mandársela a ${giver}`}
      </button>
      {err && <p style={{ fontSize: 12.5, color: C.rose, margin: 0 }}>{err}</p>}
    </>
  );
}
