import React, { useEffect, useMemo, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../../theme';
import { play } from '../../../sound';
import { fetchReplies, sendReply } from '../../../api';
import { QUESTION_IDEAS } from '../../../personal/catalog';
import Sprite from '../../Sprite';
import { tableroSvg } from './art';

// ─────────────────────────────────────────────────────────────────
// El tablero de preguntas: notitas clavadas donde quien recibe le
// pregunta algo a quien regala y ve sus respuestas. Las respuestas nuevas
// además llegan como sorpresa al cuarto (personal/engine.js).
// ─────────────────────────────────────────────────────────────────

const ERR = { muchas: 'Hoy ya mandaste muchas cosas. Mañana se puede de nuevo.', 'muy-pesada': 'Es muy larga.', 'sin-conexion': 'No hay conexión. Intenta de nuevo en un ratito.' };
const NOTE_COLORS = ['amberSoft', 'roseSoft', 'skySoft', 'sageSoft'];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function QuestionBoard({ slug, from, fresh }) {
  const name = from || 'quien te regaló esto';
  const [list, setList] = useState(null);
  const [text, setText] = useState('');
  const [state, setState] = useState('');
  const [err, setErr] = useState('');
  const ideas = useMemo(() => shuffle(QUESTION_IDEAS).slice(0, 3), []);
  useEffect(() => {
    let alive = true;
    fetchReplies(slug).then((r) => { if (alive) setList(r ? r.filter((x) => x.kind === 'pregunta') : []); });
    return () => { alive = false; };
  }, [slug]);

  async function ask() {
    if (!text.trim()) return;
    setState('mandando'); setErr('');
    const r = await sendReply(slug, { kind: 'pregunta', text: text.trim() });
    if (r.ok) { play('good'); setList((l) => [r.reply, ...(l || [])]); setText(''); setState(''); } else { play('bad'); setErr(ERR[r.error] || ERR['sin-conexion']); setState(''); }
  }

  return (
    <div style={{ textAlign: 'left' }}>
      {tableroSvg && <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0 6px' }}><Sprite markup={tableroSvg()} cacheKey="tablero-preguntas" w={120} h={90} /></div>}
      <div className="pg-card" style={{ padding: 10 }}>
        <label style={{ display: 'block', fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 6 }}>Pregúntale algo a {name}</label>
        <textarea
          value={text} onChange={(e) => setText(e.target.value.slice(0, 300))} rows={2}
          placeholder="¿Qué quieres saber?"
          style={{ width: '100%', boxSizing: 'border-box', resize: 'none', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, padding: '8px 10px', fontFamily: FONT.body, fontSize: 13.5, lineHeight: 1.3 }}
        />
        {!text && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {ideas.map((q) => (
              <button key={q} onClick={() => { play('tap'); setText(q); }} className="pg-focus" style={{ border: `1.5px solid ${C.line}`, background: soft(C.lavender, 0.8), color: C.ink, borderRadius: 999, padding: '4px 9px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                {q}
              </button>
            ))}
          </div>
        )}
        {err && <p style={{ fontSize: 12, color: C.rose, margin: '5px 0 0' }}>{err}</p>}
        <button onClick={ask} disabled={!text.trim() || state === 'mandando'} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 8, width: '100%', padding: '9px 12px', fontSize: 13, opacity: text.trim() ? 1 : 0.6 }}>
          {state === 'mandando' ? 'Clavando la nota…' : 'Clavarla en el tablero'}
        </button>
      </div>

      {list === null && <p style={{ fontSize: 12.5, color: C.inkFaint, margin: '10px 0 0' }}>Mirando el tablero…</p>}
      {list && list.length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 0', textAlign: 'center' }}>Todavía no hay preguntas. La primera la pones tú.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9, marginTop: 10 }}>
        {(list || []).map((q, i) => {
          const isNew = fresh && fresh.has(String(q.id));
          return (
            <div
              key={q.id}
              style={{
                position: 'relative', background: C[NOTE_COLORS[i % NOTE_COLORS.length]], border: `1.5px solid ${isNew ? C.rose : C.line}`, borderRadius: 6,
                padding: '12px 9px 9px', boxShadow: SHADOW.soft, transform: `rotate(${((i % 3) - 1) * 1.4}deg)`, minWidth: 0,
              }}
            >
              <span aria-hidden className="pg-keep-round" style={{ position: 'absolute', top: 4, left: '50%', width: 8, height: 8, marginLeft: -4, borderRadius: '50%', background: C.rose, boxShadow: '0 1px 0 rgba(0,0,0,0.25)' }} />
              <div style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.ink, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{q.text}</div>
              {q.answer
                ? <div style={{ fontFamily: FONT.hand || FONT.body, fontSize: 15.5, color: C.roseDeep, lineHeight: 1.25, marginTop: 5, overflowWrap: 'anywhere' }}>{q.answer}</div>
                : <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 5 }}>Esperando su respuesta…</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
