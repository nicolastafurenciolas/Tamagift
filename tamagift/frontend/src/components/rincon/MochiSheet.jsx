import React, { useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { IconPaw } from '../icons';
import { play } from '../../sound';
import PetArt from '../PetArt';
import { ModularPetStep, useDesignerState } from '../PetDesigner';
import { parseRecipe } from '../../petLook';
import { Sheet, Section, Soon, TextField, MainButton, SmallButton, Note } from './kit';

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
    ctx.setProfile((p) => ({ ...p, giver: { recipe, name: name.trim() || ctx.r.creator_name || '' } }), { now: true });
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
                {giver ? `Pronto va a tocar la puerta del cuarto de ${names.pet} para visitar a ${names.to}.` : `Una mochi que eres tú. Pronto va a visitar a ${names.to} en el cuarto de ${names.pet}.`}
              </p>
              <SmallButton onClick={() => { play('pop'); setEditing(true); }}>{giver ? 'Cambiar el diseño' : 'Diseñarlo'}</SmallButton>
            </div>
          </div>
        </Section>
      )}
      {editing && <Designer ctx={ctx} initial={giver} onDone={() => setEditing(false)} />}
      {!editing && <Soon title="Qué lleva en sus visitas" text="Un té, un juego, un regalo o una nota de voz." />}
    </Sheet>
  );
}
