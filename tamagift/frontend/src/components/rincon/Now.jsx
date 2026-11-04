import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { IconEnvelope, IconGift, IconHeart, IconSparkle, IconCamera, IconPaw, IconFrame } from '../icons';
import { play } from '../../sound';
import { fetchReply } from '../../api';
import { Modal } from '../ui';
import { toneColor, SmallButton, MainButton } from './kit';
import { dayLabel, dayOfIso, prettyDay, lastSeenText, waiting, letterWhen, LETTER_NAMES, futureLabel } from '../../personal/suggest';

// ─────────────────────────────────────────────────────────────────
// Arriba del rincón: la tarjeta de "lo más oportuno ahora" y, debajo,
// "lo que pasó" (por día, nunca minuto a minuto).
// ─────────────────────────────────────────────────────────────────

const ICONS = { envelope: IconEnvelope, gift: IconGift, heart: IconHeart, sparkle: IconSparkle, camera: IconCamera, paw: IconPaw, frame: IconFrame };

export function SuggestionCard({ s, onAction, onQuick, onSkip, canSkip }) {
  const [state, setState] = useState(null); // null | enviando | enviada | error
  useEffect(() => { setState(null); }, [s && s.id]);
  if (!s) return null;
  const color = toneColor(s.tone);
  const Icon = ICONS[s.icon] || IconHeart;
  async function quick() {
    if (state) return;
    setState('enviando');
    const ok = await onQuick(s.quick);
    setState(ok ? 'enviada' : 'error');
  }
  return (
    <div
      className="pg-card pg-anim-pop"
      style={{ width: '100%', boxSizing: 'border-box', padding: 16, position: 'relative', overflow: 'hidden', borderColor: color, background: `linear-gradient(160deg, ${soft(color, 0.72)}, ${C.surface} 70%)`, boxShadow: SHADOW.lifted }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="pg-card" style={{ width: 46, height: 46, borderRadius: 16, display: 'grid', placeItems: 'center', flexShrink: 0, background: C.surface, borderColor: color }}>
          <Icon size={26} color={color} stroke={2.1} fill={soft(color, 0.6)} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.inkSoft, letterSpacing: '0.02em' }}>{s.kicker}</div>
          <div style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, lineHeight: 1.18, marginTop: 3, overflowWrap: 'anywhere' }}>{s.title}</div>
          {s.text && <p style={{ fontSize: 13, color: C.inkSoft, margin: '6px 0 0', lineHeight: 1.4 }}>{s.text}</p>}
        </div>
      </div>
      {state === 'enviada' ? (
        <div className="pg-anim-pop" style={{ marginTop: 14, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 14, color: C.sageDeep }}>
          ✓ ¡Enviada! Le llega la próxima vez que abra el juego.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <MainButton onClick={s.quick ? quick : () => { play('pop'); onAction(s.action); }} busy={state === 'enviando'} style={{ padding: 12, fontSize: 15 }}>
            {s.cta}
          </MainButton>
        </div>
      )}
      {state === 'error' && <p style={{ fontSize: 12, color: C.rose, margin: '6px 0 0' }}>No se pudo mandar. Intenta de nuevo en un rato.</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, minHeight: 20 }}>
        {s.quick && state !== 'enviada' ? (
          <button onClick={() => { play('pop'); onAction(s.action); }} className="pg-focus" style={linkStyle}>Elegir otra nota</button>
        ) : <span />}
        {canSkip && (
          <button onClick={() => { play('pop'); onSkip(); }} className="pg-focus" style={{ ...linkStyle, color: C.inkFaint }}>{state === 'enviada' ? 'Siguiente idea →' : 'Otra idea →'}</button>
        )}
      </div>
    </div>
  );
}

const linkStyle = { background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', fontFamily: 'var(--pg-font-display)', fontWeight: 800, fontSize: 12, color: 'var(--pg-c-inkSoft)' };

const H_ICON = { abrio: IconEnvelope, canje: IconSparkle, pregunta: IconHeart, foto: IconCamera, carta: IconEnvelope, meta: IconSparkle };
const H_TONE = { abrio: 'rose', canje: 'amber', pregunta: 'lavender', foto: 'sky', carta: 'rose', meta: 'sage' };

export function Happenings({ r, items, names, onOpen }) {
  const [all, setAll] = useState(false);
  const seen = lastSeenText(r);
  const { locked, unopened } = waiting(r);
  const shown = all ? items.slice(0, 20) : items.slice(0, 4);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 2px 8px' }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Lo que pasó</h2>
        {seen && <span style={{ fontSize: 12, color: C.inkSoft }}>{names.to} entró {seen}</span>}
      </div>
      <div className="pg-card" style={{ padding: '4px 12px' }}>
        {items.length === 0 && (
          <p style={{ fontSize: 13, color: C.inkSoft, margin: '10px 0', lineHeight: 1.4 }}>
            Aquí vas a ver cuando {names.to} abra lo que le mandas, canjee un cupón o te responda.
          </p>
        )}
        {shown.map((h, i) => {
          const Icon = H_ICON[h.kind] || IconHeart;
          const color = toneColor(H_TONE[h.kind]);
          const clickable = h.kind === 'foto' || h.kind === 'carta' || h.kind === 'pregunta' || h.kind === 'canje';
          const Row = clickable ? 'button' : 'div';
          return (
            <Row
              key={h.id} onClick={clickable ? () => onOpen(h) : undefined} className={clickable ? 'pg-focus' : undefined}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', background: 'none', border: 'none', borderTop: i ? `1.5px solid ${C.lineSoft}` : 'none', textAlign: 'left', cursor: clickable ? 'pointer' : 'default', color: C.ink }}
            >
              <span style={{ width: 32, height: 32, borderRadius: 11, background: soft(color, 0.75), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon size={17} color={color} stroke={2.2} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>
                  {h.text}
                  {h.done && <span style={{ marginLeft: 6, fontSize: 11.5, fontWeight: 800, color: C.sageDeep }}>{h.kind === 'canje' ? '' : '· respondida'}</span>}
                  {h.isNew && <span style={{ marginLeft: 6, fontFamily: FONT.display, fontSize: 10.5, fontWeight: 800, color: C.onAccent, background: C.rose, borderRadius: 999, padding: '1px 6px', verticalAlign: 'middle' }}>nuevo</span>}
                </span>
                {h.quote && <span style={{ display: 'block', fontSize: 12, color: C.inkSoft, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.kind === 'canje' ? h.quote : `«${h.quote}»`}</span>}
              </span>
              <span style={{ fontSize: 11.5, color: C.inkFaint, flexShrink: 0 }}>{dayLabel(h.day)}</span>
            </Row>
          );
        })}
        {items.length > 4 && (
          <button onClick={() => { play('pop'); setAll((a) => !a); }} className="pg-focus" style={{ ...linkStyle, display: 'block', width: '100%', padding: '8px 0 10px', borderTop: `1.5px solid ${C.lineSoft}` }}>
            {all ? 'Ver menos' : `Ver ${Math.min(20, items.length) - 4} más`}
          </button>
        )}
      </div>
      {(locked.length > 0 || unopened.length > 0) && (
        <p style={{ fontSize: 12, color: C.inkSoft, margin: '8px 4px 0', lineHeight: 1.4 }}>
          {locked.length > 0 && <>En su cofre: {locked.length === 1 ? 'una carta' : `${locked.length} cartas`} con fecha (la próxima se abre {futureLabel(locked[0].openDay)}). </>}
          {unopened.length > 0 && <>Por abrir: {unopened.length === 1 ? `tu ${LETTER_NAMES[unopened[0].kind] || 'carta'}` : `${unopened.length} cosas tuyas`}.</>}
        </p>
      )}
    </div>
  );
}

// Lo que te mandó (carta o foto): se abre grande, con "Responderle".
export function ReplyViewer({ slug, reply, names, onClose, onAnswer }) {
  const [full, setFull] = useState(null);
  useEffect(() => {
    let alive = true;
    if (reply && reply.has_photo) fetchReply(slug, reply.id).then((x) => { if (alive) setFull(x); });
    return () => { alive = false; };
  }, [slug, reply]);
  if (!reply) return null;
  return (
    <Modal onClose={onClose} maxWidth={380} z={90}>
      <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 700 }}>{names.to} · {dayLabel(dayOfIso(reply.created_at))}</div>
      {reply.has_photo && (
        <div style={{ margin: '10px 0', borderRadius: 10, overflow: 'hidden', border: '5px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', minHeight: 120, background: C.paperDeep, display: 'grid', placeItems: 'center' }}>
          {full && full.photo ? <img src={full.photo} alt="Foto que te mandó" style={{ display: 'block', width: '100%', maxHeight: '50vh', objectFit: 'contain' }} /> : <span style={{ fontSize: 12, color: C.inkSoft }}>Abriendo la foto…</span>}
        </div>
      )}
      {reply.text && <p style={{ fontFamily: FONT.hand || FONT.body, fontSize: 20, color: C.ink, lineHeight: 1.35, margin: '10px 0', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{reply.text}</p>}
      {reply.answer && <p style={{ fontSize: 12.5, color: C.sageDeep, margin: '0 0 10px' }}>Le respondiste: «{reply.answer}»</p>}
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <SmallButton onClick={onClose} style={{ flexShrink: 0 }}>Cerrar</SmallButton>
        <MainButton onClick={onAnswer} style={{ padding: 10, fontSize: 14 }}>{reply.kind === 'pregunta' ? 'Responder' : reply.kind === 'canje' ? 'Ver el cupón' : 'Responderle'}</MainButton>
      </div>
    </Modal>
  );
}

// "Lo que ya le mandaste": cada cosa con su estado (abierta, en el
// cofre hasta tal día, por abrir).
export function SentHistory({ r }) {
  const letters = r.letters || [];
  const now = Date.now();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {letters.slice(0, 40).map((l) => {
        const locked = l.open_at && new Date(/[zZ]$/.test(l.open_at) ? l.open_at : `${l.open_at}Z`).getTime() > now;
        const cuando = letterWhen(l);
        const status = l.opened_at ? `La abrió ${dayLabel(dayOfIso(l.opened_at))}`
          : locked ? `En su cofre hasta el ${prettyDay(dayOfIso(l.open_at))}`
            : cuando === 'extranes' ? 'Para cuando te extrañe' : cuando === 'triste' ? 'Para un mal día' : 'Todavía no la abre';
        return (
          <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderTop: `1.5px solid ${C.lineSoft}` }}>
            <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 800, color: C.inkSoft, background: C.paperDeep, borderRadius: 999, padding: '2px 7px', flexShrink: 0, marginTop: 1 }}>{LETTER_NAMES[l.kind] || 'carta'}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{l.text || (l.kind === 'voz' ? 'Nota de voz' : l.kind === 'paquete' ? 'Un paquete' : '')}</div>
              <div style={{ fontSize: 11.5, color: l.opened_at ? C.sageDeep : C.inkFaint, marginTop: 2 }}>
                {dayLabel(dayOfIso(l.created_at)).replace(/^./, (c) => c.toUpperCase())}{l.has_photo ? ' · con foto' : ''} · {status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
