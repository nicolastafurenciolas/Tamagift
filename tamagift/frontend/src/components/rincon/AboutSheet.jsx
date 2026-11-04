import React, { useEffect, useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { IconHeart } from '../icons';
import { play } from '../../sound';
import { LIKES } from '../../personal/catalog';
import { Sheet, Section, Fold, Chip, ChipRow, TextField } from './kit';

// ─────────────────────────────────────────────────────────────────
// Contarle al juego sobre tu pareja: apodo, ciudad y la ficha de gustos.
// Lo rápido arriba; el resto de los gustos, plegado.
// ─────────────────────────────────────────────────────────────────

const NICK_IDEAS = ['Amor', 'Cielo', 'Mi vida', 'Corazón', 'Bebé', 'Mi sol'];

function LikeRow({ like, value, onChange, highlight }) {
  const filled = !!String(value || '').trim();
  return (
    <div id={`rc-${like.id}`} style={{ padding: '9px 10px', borderRadius: 14, border: `1.5px solid ${highlight ? C.rose : C.lineSoft}`, background: filled ? soft(C.sage, 0.9) : 'transparent' }}>
      <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{like.label}</div>
      <TextField value={value} onChange={onChange} max={80} placeholder="Escríbelo o toca una idea" label={like.label} style={{ fontSize: 14, padding: '7px 10px' }} />
      {!filled && (
        <ChipRow style={{ marginTop: 6 }}>
          {like.ideas.map((i) => <Chip key={i} onClick={() => { play('pop'); onChange(i); }} style={{ fontSize: 12, padding: '5px 10px' }}>{i}</Chip>)}
        </ChipRow>
      )}
    </div>
  );
}

export default function AboutSheet({ ctx, focus, onClose }) {
  const { profile, setProfile, names, r } = ctx;
  const likes = profile.likes || {};
  const setLike = (id, v) => setProfile((p) => ({ ...p, likes: { ...(p.likes || {}), [id]: v } }));
  const filledIds = LIKES.filter((l) => String(likes[l.id] || '').trim()).map((l) => l.id);
  // A la vista: los rápidos, los que ya tienen algo y el que pidió la
  // sugerencia. El resto, plegado. (Se fija al abrir para que una fila no
  // salte de lugar mientras se escribe.)
  const [shown] = useState(() => LIKES.filter((l) => l.quick || filledIds.includes(l.id) || l.id === focus).map((l) => l.id));
  const top = LIKES.filter((l) => shown.includes(l.id));
  const rest = LIKES.filter((l) => !shown.includes(l.id));
  const who = r.recipient_name || 'tu pareja';

  useEffect(() => {
    if (!focus) return undefined;
    const t = setTimeout(() => { const el = document.getElementById(`rc-${focus}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
    return () => clearTimeout(t);
  }, [focus]);

  return (
    <Sheet title={`Sobre ${who}`} subtitle={`Lo que ${names.pet} sabe para hablarle`} icon={IconHeart} color={C.sage} onClose={onClose} status={ctx.saveStatus}>
      <Section title="Cómo le dices" hint={`${names.pet} le habla así en tus mensajes.`}>
        <TextField value={profile.nickname} onChange={(v) => setProfile((p) => ({ ...p, nickname: v }))} max={30} placeholder={`Su apodo (o déjalo y le dice ${who})`} />
        {!String(profile.nickname || '').trim() && (
          <ChipRow style={{ marginTop: 6 }}>
            {NICK_IDEAS.map((n) => <Chip key={n} onClick={() => { play('pop'); setProfile((p) => ({ ...p, nickname: n })); }} style={{ fontSize: 12, padding: '5px 10px' }}>{n}</Chip>)}
          </ChipRow>
        )}
      </Section>
      <Section title="Sus gustos" hint={`${names.pet} ya sabe ${filledIds.length} de ${LIKES.length}. Con cada uno tiene más de qué hablarle.`} right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.sageDeep }}>{filledIds.length}/{LIKES.length}</span>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {top.map((l) => <LikeRow key={l.id} like={l} value={likes[l.id]} onChange={(v) => setLike(l.id, v)} highlight={focus === l.id} />)}
        </div>
      </Section>
      {rest.length > 0 && (
        <Fold title="Más gustos" hint={rest.slice(0, 3).map((l) => l.label.toLowerCase()).join(', ') + '…'} badge={rest.length}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {rest.map((l) => <LikeRow key={l.id} like={l} value={likes[l.id]} onChange={(v) => setLike(l.id, v)} />)}
          </div>
        </Fold>
      )}
      <Fold title="Su ciudad" hint="Para que en su cuarto llueva cuando llueve de verdad">
        <TextField value={profile.city} onChange={(v) => setProfile((p) => ({ ...p, city: v }))} max={60} placeholder="Ej.: Bogotá, Ciudad de México, Madrid…" label="Ciudad" />
      </Fold>
      <p style={{ fontSize: 11.5, color: C.inkFaint, textAlign: 'center', margin: 0 }}>Se guarda solo.</p>
    </Sheet>
  );
}
