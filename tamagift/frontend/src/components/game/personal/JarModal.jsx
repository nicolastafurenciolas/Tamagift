import React, { useState } from 'react';
import { C, FONT, soft } from '../../../theme';
import { Modal } from '../../ui';
import Sprite from '../../Sprite';
import { play } from '../../../sound';
import { sendReply } from '../../../api';
import { frascoSvg } from '../../../art/room/personal';
import { jarFill, couponCost, isPending, goalStatus } from '../../../personal/jar';

// ─────────────────────────────────────────────────────────────────
// El frasco de estrellas abierto: cuántas hay, los cupones de amor que
// puso quien regala (con su costo) y, discreta abajo, la meta de los dos
// de esta semana. Canjear avisa a quien regala (sendReply 'canje') y el
// cupón queda "esperando" hasta que lo marque cumplido.
// ─────────────────────────────────────────────────────────────────

const ERR = { muchas: 'Hoy ya mandaste muchas cosas. Mañana se puede de nuevo.', 'sin-conexion': 'No hay conexión. Intenta de nuevo en un ratito.' };

function Star({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill="#FFD25A" stroke="#C9922E" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function Dots({ have, need }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, flexShrink: 0 }} aria-label={`${have} de ${need}`}>
      {Array.from({ length: need }, (_, i) => (
        <span key={i} className="pg-keep-round" style={{ width: 8, height: 8, borderRadius: '50%', background: i < have ? C.rose : 'transparent', border: `1.5px solid ${i < have ? C.roseDeep : C.line}` }} />
      ))}
    </span>
  );
}

function Coupon({ c, jar, giver, onRedeem }) {
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const cost = couponCost(c);
  const pending = isPending(jar, c.id);
  const short = Math.max(0, cost - (jar.stars || 0));
  async function go() {
    setBusy(true); setErr('');
    const r = await onRedeem(c);
    setBusy(false);
    if (!r.ok) { setErr(ERR[r.error] || ERR['sin-conexion']); play('bad'); } else setAsk(false);
  }
  return (
    <div className="pg-card" style={{ padding: '10px 12px', textAlign: 'left', border: pending ? `1.5px dashed ${C.rose}` : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.ink, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{c.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.inkSoft, marginTop: 3 }}>
            <Star size={12} /> {cost} {pending ? `· esperando que ${giver} lo cumpla` : short ? `· te faltan ${short}` : ''}
          </div>
        </div>
        {!pending && !ask && (
          <button
            onClick={() => { play('pop'); setAsk(true); }} disabled={short > 0}
            className={`pg-btn ${short ? 'pg-btn-ghost' : 'pg-btn-rose'} pg-focus`} style={{ padding: '7px 13px', fontSize: 12.5, flexShrink: 0, opacity: short ? 0.55 : 1 }}
          >
            Canjear
          </button>
        )}
      </div>
      {ask && (
        <div className="pg-anim-pop" style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={go} disabled={busy} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: '8px 10px', fontSize: 12.5 }}>
            {busy ? 'Mandando…' : `Sí, por ${cost} estrellas`}
          </button>
          <button onClick={() => { play('pop'); setAsk(false); }} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 12px', fontSize: 12.5 }}>Todavía no</button>
        </div>
      )}
      {err && <p style={{ fontSize: 12, color: C.rose, margin: '5px 0 0' }}>{err}</p>}
    </div>
  );
}

export default function JarModal({ jar, coupons, slug, petName, giverName, onRedeemed, onClose }) {
  const giver = giverName || 'quien te regaló esto';
  const list = (coupons || []).filter((c) => c && c.title);
  const goal = goalStatus(jar, { petName, giverName: giver });
  async function redeemOne(c) {
    const r = await sendReply(slug, { kind: 'canje', ref: String(c.id), text: c.title });
    if (r.ok) onRedeemed(c, r.reply);
    return r;
  }
  return (
    <Modal onClose={onClose} maxWidth={360} z={80}>
      <div className="pg-anim-pop" style={{ display: 'flex', justifyContent: 'center' }}>
        <Sprite markup={frascoSvg({ fill: jarFill(jar, list) })} cacheKey={`frasco-${Math.round(jarFill(jar, list) * 20)}`} w={72} h={96} />
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Star size={18} /> {jar.stars || 0} {jar.stars === 1 ? 'estrella' : 'estrellas'}
      </h2>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '2px 0 12px' }}>Se juntan jugando y cuidando a {petName}.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '40vh', overflowY: 'auto', padding: 2 }}>
        {list.length ? list.map((c) => <Coupon key={c.id} c={c} jar={jar} giver={giver} onRedeem={redeemOne} />) : (
          <div className="pg-card" style={{ padding: '12px 14px', fontSize: 13, color: C.inkSoft, lineHeight: 1.4 }}>
            {giver} todavía no puso cupones de amor. Mientras, tus estrellas se quedan guardaditas aquí, esperando.
          </div>
        )}
      </div>

      {goal && (
        <div style={{ marginTop: 12, padding: '9px 11px', borderRadius: 12, border: `1.5px dashed ${C.line}`, background: soft(C.rose, 0.88), textAlign: 'left' }}>
          <div style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: C.roseDeep, marginBottom: 5 }}>
            {goal.rewarded ? '¡Cumplieron la meta de la semana!' : 'La meta de los dos, esta semana'}
          </div>
          {goal.rewarded ? (
            <div style={{ fontSize: 12, color: C.ink }}>Les llegó un regalo de los dos. La semana que viene, otra.</div>
          ) : (
            [goal.mine, goal.theirs].map((g) => (
              <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.ink, marginTop: 3 }}>
                <span style={{ flex: 1, minWidth: 0 }}>{g.text}</span>
                <Dots have={g.have} need={g.need} />
              </div>
            ))
          )}
        </div>
      )}
      <button onClick={onClose} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, padding: '9px 24px', fontSize: 13 }}>Cerrar</button>
    </Modal>
  );
}
