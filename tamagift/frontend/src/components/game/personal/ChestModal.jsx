import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import { Modal } from '../../ui';
import Sprite from '../../Sprite';
import { play } from '../../../sound';
import { cofreSvg, hasRealCofre } from './art';
import { chestView, fmtCountdown } from '../../../personal/engine';
import { LETTER_WHEN } from '../../../personal/catalog';

// ─────────────────────────────────────────────────────────────────
// El cofre de recuerdos abierto: las cartas con fecha (cerradas, con su
// cuenta regresiva, o ya listas) y las "ábrela cuando…".
// ─────────────────────────────────────────────────────────────────

const WHEN = Object.fromEntries(LETTER_WHEN.map((w) => [w.id, w.label.replace(/^"|"$/g, '')]));
const fmtDay = (ms) => {
  try {
    const d = new Date(ms);
    const hm = d.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' });
    const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(d) - day(new Date())) / 86400000);
    if (diff === 0) return `hoy a las ${hm}`;
    if (diff === 1) return `mañana a las ${hm}`;
    return `el ${d.toLocaleDateString('es', { day: 'numeric', month: 'long' })}`;
  } catch (e) { return ''; }
};

function Row({ it, onOpen }) {
  const title = it.cuando ? (WHEN[it.cuando] || 'Ábrela cuando quieras') : it.state === 'locked' ? `Se abre ${fmtDay(it.openAt)}` : it.openAt ? `Para ${fmtDay(it.openAt)}` : 'Una carta guardada';
  const sub = it.state === 'locked' ? `Faltan ${fmtCountdown(it.left)}`
    : it.state === 'ready' ? '¡Ya llegó el día!'
      : it.state === 'anytime' ? 'Puedes abrirla cuando quieras'
        : 'Ya la leíste';
  const strong = it.state === 'ready' || it.state === 'anytime';
  return (
    <div
      className="pg-card" style={{
        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
        border: it.state === 'ready' ? `2px solid ${C.rose}` : undefined, boxShadow: it.state === 'ready' ? SHADOW.glowRose : undefined,
        opacity: it.state === 'locked' ? 0.85 : 1,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 12, color: it.state === 'ready' ? C.roseDeep : C.inkSoft, marginTop: 2, fontWeight: it.state === 'ready' ? 700 : 500 }}>{sub}</div>
      </div>
      {it.state === 'locked' ? (
        <span aria-label="Cerrada" style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: C.inkFaint, flexShrink: 0 }}>Cerrada</span>
      ) : (
        <button
          onClick={() => { play('unbox'); onOpen(it); }} className={`pg-btn ${strong ? 'pg-btn-rose' : 'pg-btn-ghost'} pg-focus`}
          style={{ padding: '7px 13px', fontSize: 12.5, flexShrink: 0 }}
        >
          {it.state === 'read' ? 'Releer' : 'Abrir'}
        </button>
      )}
    </div>
  );
}

export default function ChestModal({ personal, from, onOpen, onClose }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const view = chestView(personal, now);
  const glow = view.some((it) => it.state === 'ready');
  return (
    <Modal onClose={onClose} maxWidth={360} z={80}>
      <div className="pg-anim-pop" style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
        <Sprite markup={cofreSvg({ open: true, glow })} cacheKey={`cofre-open-${glow ? 'glow' : 'calm'}-${hasRealCofre ? 'art' : 'tmp'}`} w={140} h={120} />
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 2px' }}>El cofre de recuerdos</h2>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px' }}>Lo que {from || 'quien te regaló esto'} guardó para ti.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '46vh', overflowY: 'auto', padding: 2 }}>
        {view.map((it) => <Row key={it.id} it={it} onOpen={onOpen} />)}
      </div>
      <button onClick={onClose} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, padding: '9px 24px', fontSize: 13 }}>Cerrar el cofre</button>
    </Modal>
  );
}
