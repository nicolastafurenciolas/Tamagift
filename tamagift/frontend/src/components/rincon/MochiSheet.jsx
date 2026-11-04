import React, { useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { IconPaw } from '../icons';
import { play } from '../../sound';
import PetArt from '../PetArt';
import { ModularPetStep, useDesignerState } from '../PetDesigner';
import { parseRecipe } from '../../petLook';
import { Sheet, Section, TextField, MainButton, SmallButton, Note } from './kit';

// ─────────────────────────────────────────────────────────────────
// Tu mochi: quien regala se diseña a sí mismo con el mismo diseñador del
// asistente. Se guarda en profile.giver = { recipe, name }. Las visitas
// (tocar la puerta, qué lleva) son de la etapa 3.
// ─────────────────────────────────────────────────────────────────

function Designer({ ctx, initial, onDone }) {
  const designer = useDesignerState(initial ? initial.recipe : null);
  const [name, setName] = useState((initial && initial.name) || ctx.r.creator_name || '');
  const [msg, setMsg] = useState('');
  function save() {
    let recipe = designer.fullRecipe();
    // Los retoques a mano pesan: si se pasan, se guarda solo la receta.
    if (JSON.stringify(recipe).length > 150000) { const { overlays, ...base } = recipe; recipe = base; }
    play('win');
    // Al diseñarlo por primera vez, entrega en persona (se puede apagar).
    const visits = initial && typeof initial.visits === 'boolean' ? initial.visits : true;
    ctx.setProfile((p) => ({ ...p, giver: { ...(p.giver || {}), recipe, name: name.trim() || ctx.r.creator_name || '', visits } }), { now: true });
    setMsg('¡Listo!');
    onDone();
  }
  return (
    <>
      <Section title="¿Cómo se llama tu mochi?">
        <TextField value={name} onChange={setName} max={30} placeholder="Tu nombre o tu apodo" />
      </Section>
      <div className="pg-card" style={{ padding: '14px 10px' }}>
        <ModularPetStep {...designer} title="" subtitle="" />
      </div>
      <Note>{msg}</Note>
      <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: -40, paddingBottom: 6 }}>
        {initial && <SmallButton onClick={onDone} style={{ flexShrink: 0 }}>Cancelar</SmallButton>}
        <MainButton onClick={save}>Guardar mi mochi</MainButton>
      </div>
    </>
  );
}

// Que su mochi entregue en persona lo que manda (lo usa el juego en la
// etapa 3). profile.giver.visits; si no está, vale true.
function Visits({ ctx, giver }) {
  const { names } = ctx;
  const on = giver ? giver.visits !== false : false;
  const toggle = () => {
    if (!giver) return;
    play('pop');
    ctx.setProfile((p) => ({ ...p, giver: { ...(p.giver || {}), visits: !on } }), { now: true });
  };
  return (
    <Section>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: giver ? 'pointer' : 'default', opacity: giver ? 1 : 0.6 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: FONT.display, fontSize: 14.5, fontWeight: 800, color: C.ink }}>Que tu mochi entregue tus cosas en persona</span>
          <span style={{ display: 'block', fontSize: 12.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.4 }}>
            {giver
              ? `A veces va a tocar la puerta del cuarto de ${names.pet} para entregarle a ${names.to} lo que mandas, y se queda un ratito.`
              : 'Primero diseña tu mochi: después puede tocar la puerta para entregar lo que mandas y quedarse un ratito.'}
          </span>
        </span>
        <button
          role="switch" aria-checked={on} aria-label="Que tu mochi entregue tus cosas en persona" onClick={toggle} disabled={!giver}
          className="pg-focus pg-keep-round"
          style={{ width: 50, height: 30, borderRadius: 999, flexShrink: 0, marginTop: 2, padding: 3, border: `1.5px solid ${on ? C.sage : C.line}`, background: on ? C.sage : C.track, cursor: giver ? 'pointer' : 'default', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background .2s' }}
        >
          <span className="pg-keep-round" style={{ width: 22, height: 22, borderRadius: '50%', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
      </label>
    </Section>
  );
}

export default function MochiSheet({ ctx, onClose }) {
  const { profile, names } = ctx;
  const giver = profile.giver && parseRecipe(profile.giver.recipe) ? profile.giver : null;
  const [editing, setEditing] = useState(false);
  return (
    <Sheet title="Tu mochi" subtitle={`Así te va a conocer ${names.pet}`} icon={IconPaw} color={C.lavender} onClose={onClose} status={ctx.saveStatus}>
      {!editing && (
        <Section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="pg-sticker" style={{ width: 104, height: 104, borderRadius: 22, background: soft(C.lavender, 0.8), display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {giver ? <PetArt recipe={parseRecipe(giver.recipe)} mood="feliz" size={96} /> : <IconPaw size={46} color={C.lavender} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, color: C.ink }}>{giver ? (giver.name || 'Tu mochi') : 'Diseña tu mochi'}</div>
              <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '3px 0 10px', lineHeight: 1.4 }}>
                {giver ? `Eres tú en el mundo de ${names.pet}. ${names.to} te va a reconocer.` : `Una mochi que eres tú. Pronto va a visitar a ${names.to} en el cuarto de ${names.pet}.`}
              </p>
              <SmallButton onClick={() => { play('pop'); setEditing(true); }}>{giver ? 'Cambiar el diseño' : 'Diseñarlo'}</SmallButton>
            </div>
          </div>
        </Section>
      )}
      {editing && <Designer ctx={ctx} initial={giver} onDone={() => setEditing(false)} />}
      {!editing && <Visits ctx={ctx} giver={giver} />}
    </Sheet>
  );
}
