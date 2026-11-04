import React, { useState } from 'react';
import { C, FONT } from '../../../theme';
import { play } from '../../../sound';
import { sendReply } from '../../../api';

// "Responder": un botón chiquito debajo de la carta que, al tocarlo, se
// vuelve una hojita para escribirle de vuelta a quien regala. Llega a su
// rincón (sendReply, kind 'carta'; `refId` = la carta que responde).

const ERR = { muchas: 'Hoy ya mandaste muchas cosas. Mañana se puede de nuevo.', 'muy-pesada': 'Es muy largo para mandarlo.', 'sin-conexion': 'No hay conexión. Intenta de nuevo en un ratito.' };

export default function ReplyBox({ slug, to, refId, kind = 'carta' }) {
  const [state, setState] = useState('cerrada'); // cerrada | escribiendo | mandando | enviada
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const name = to || 'quien te regaló esto';

  async function send() {
    if (!text.trim()) return;
    setState('mandando'); setErr('');
    const r = await sendReply(slug, { kind, text: text.trim(), ref: refId != null ? String(refId) : null });
    if (r.ok) { play('good'); setState('enviada'); } else { play('bad'); setErr(ERR[r.error] || ERR['sin-conexion']); setState('escribiendo'); }
  }

  if (state === 'enviada') {
    return <p style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.sageDeep || C.sage, margin: '12px 0 0' }}>¡Se la mandamos! {name} la va a leer en su rincón.</p>;
  }
  if (state === 'cerrada') {
    return (
      <button onClick={() => { play('pop'); setState('escribiendo'); }} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, padding: '8px 18px', fontSize: 13 }}>
        Responder
      </button>
    );
  }
  return (
    <div className="pg-anim-pop" style={{ marginTop: 12, textAlign: 'left' }}>
      <textarea
        value={text} onChange={(e) => setText(e.target.value.slice(0, 600))} rows={3} autoFocus
        placeholder={`Escríbele algo a ${name}…`} aria-label={`Respuesta para ${name}`}
        style={{ width: '100%', boxSizing: 'border-box', resize: 'none', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, padding: '9px 11px', fontFamily: FONT.hand || FONT.body, fontSize: 17, lineHeight: 1.3 }}
      />
      {err && <p style={{ fontSize: 12, color: C.rose, margin: '4px 0 0' }}>{err}</p>}
      <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
        <button onClick={send} disabled={!text.trim() || state === 'mandando'} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: '9px 12px', fontSize: 13, opacity: text.trim() ? 1 : 0.6 }}>
          {state === 'mandando' ? 'Mandando…' : `Mandársela a ${name}`}
        </button>
        <button onClick={() => { play('pop'); setState('cerrada'); }} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '9px 12px', fontSize: 13 }}>Luego</button>
      </div>
    </div>
  );
}
