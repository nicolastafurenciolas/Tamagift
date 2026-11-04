import React, { useEffect, useState } from 'react';
import { C, FONT } from '../../theme';
import { Modal } from '../ui';
import { IconHeart, IconEnvelope, IconMusic } from '../icons';
import { fetchLetters } from '../../api';
import { play } from '../../sound';
import { ShopTab } from './Shop';
import QuestionBoard from './personal/QuestionBoard';
import { packageItem, parseServerDate } from '../../personal/engine';
import { fill } from '../../personal/catalog';

// Lo que llegó de quien regaló, para volver a verlo (vive en el servidor:
// la partida solo recuerda la última que llegó), y el tablero de
// preguntas. Lo que todavía espera turno (`hidden`) no aparece: sería
// arruinar la sorpresa.
const fmtDate = (iso) => {
  const t = parseServerDate(iso);
  if (!t) return '';
  try { return new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'long' }); } catch (e) { return ''; }
};

// `inChest`: está en el cofre y todavía no se abrió (se abre desde ahí).
function describe(l, inChest) {
  if (inChest) return { title: 'Una carta en el cofre', sub: l.open_at ? `Se abre el ${fmtDate(l.open_at)}` : 'Para abrir cuando quieras', icon: 'cofre' };
  if (l.locked) return { title: 'Una carta en el cofre', sub: `Se abre el ${fmtDate(l.open_at)}`, icon: 'cofre' };
  if (l.kind === 'voz') return { title: l.text || 'Una nota de voz', sub: 'Nota de voz', icon: 'voz' };
  if (l.kind === 'paquete') { const p = packageItem(l.payload); return { title: l.text || 'Un paquete con nota', sub: `Paquete${p && p.label ? `: ${p.label}` : ''}`, icon: 'carta' }; }
  if (l.kind === 'nota') return { title: l.text, sub: 'Nota', icon: 'nota' };
  return { title: l.text || (l.has_photo ? 'Una foto' : 'Una carta'), sub: l.has_photo ? 'Con foto' : '', icon: 'carta' };
}

// `hidden`: lo que todavía espera turno; `inChest`: lo que está en el
// cofre sin abrir; `names`: para rellenar {nombre} / {yo} en los textos.
export default function MailArchive({ slug, from, hidden, inChest, names, freshAnswers, initialTab = 'cartas', onOpen, onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [letters, setLetters] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchLetters(slug, 0).then((l) => { if (alive) setLetters(l ? l.filter((x) => !(hidden && hidden.has(String(x.id)))).reverse() : false); });
    return () => { alive = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = from || 'quien te regaló esto';
  return (
    <Modal onClose={onClose} maxWidth={370} z={78}>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 8px' }}>Lo de {name}</h2>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
        <ShopTab active={tab === 'cartas'} onClick={() => { play('tap'); setTab('cartas'); }}>Cartas</ShopTab>
        <ShopTab active={tab === 'preguntas'} onClick={() => { play('tap'); setTab('preguntas'); }}>Preguntas</ShopTab>
      </div>
      <div style={{ maxHeight: '56vh', overflowY: 'auto', padding: 2 }}>
        {tab === 'preguntas' ? <QuestionBoard slug={slug} from={from} fresh={freshAnswers} /> : (
          <>
            {letters === null && <p style={{ fontSize: 13, color: C.inkFaint }}>Buscando las cartas…</p>}
            {letters === false && <p style={{ fontSize: 13, color: C.inkFaint }}>No se pudieron cargar ahora. Revisa tu conexión.</p>}
            {letters && letters.length === 0 && <p style={{ fontSize: 13, color: C.inkSoft }}>Todavía no llegó nada. Cuando {name} te mande algo, va a llegar a tu cuarto.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              {(letters || []).map((l) => {
                const chest = !!(l.locked || (inChest && inChest.has(String(l.id))));
                const d = describe(l, chest);
                const title = chest ? d.title : fill(d.title, names);
                const Icon = d.icon === 'voz' ? IconMusic : d.icon === 'carta' || d.icon === 'cofre' ? IconEnvelope : IconHeart;
                return (
                  <button key={l.id} onClick={() => onOpen({ ...l, inChest: chest })} className="pg-card pg-focus" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <Icon size={16} color={C.rose} fill={C.roseSoft} />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: '-webkit-box', fontSize: 13, color: C.ink, lineHeight: 1.35, overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: C.inkFaint, marginTop: 3 }}>{[fmtDate(l.created_at), d.sub].filter(Boolean).join(' · ')}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      <button onClick={onClose} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, padding: '9px 24px', fontSize: 13 }}>Cerrar</button>
    </Modal>
  );
}
