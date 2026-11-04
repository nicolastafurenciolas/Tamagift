import React, { useEffect, useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { IconFrame, IconHeart, IconCookie } from '../icons';
import { play } from '../../sound';
import { DATE_KINDS, pid } from '../../personal/catalog';
import { dayKey, nextDate, futureLabel } from '../../personal/suggest';
import { Sheet, Section, Fold, Soon, Chip, ChipRow, TextField, MainButton, SmallButton, RemoveBtn } from './kit';

// ─────────────────────────────────────────────────────────────────
// Recordar: sus fechas, nuestros lugares y recetas de quien regala.
// Los objetos con foto llegan en la etapa 4.
// ─────────────────────────────────────────────────────────────────

const PLACE_IDEAS = ['El café donde nos conocimos', 'Nuestra primera cita', 'La playa de ese viaje', 'Donde nos dimos el primer beso', 'Nuestro restaurante favorito', 'El parque de siempre'];
const RECIPE_IDEAS = ['La pasta de nuestra primera cita', 'El desayuno de los domingos', 'Mi famoso arroz', 'Las galletas de tu abuela', 'Lo que cocinamos juntos la primera vez'];

const fieldDate = {
  fontFamily: 'var(--pg-font-display)', fontSize: 14, padding: '7px 10px', borderRadius: 12,
  border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, minWidth: 0,
};

function DateRow({ kind, d, onSet, onRemove, onLabel }) {
  const today = dayKey();
  const next = d && d.date ? nextDate(d.date, today) : null;
  const full = d && /^\d{4}-/.test(d.date || '') ? d.date : d && d.date ? `${new Date().getFullYear()}-${d.date}` : '';
  return (
    <div style={{ padding: '9px 10px', borderRadius: 14, border: `1.5px solid ${C.lineSoft}`, background: d && d.date ? soft(C.amber, 0.9) : 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ flex: '1 1 140px', minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.ink }}>{kind.label}</span>
          {next && <span style={{ display: 'block', fontSize: 11.5, color: C.inkSoft }}>{next.days === 0 ? '¡Es hoy!' : `Falta${next.days === 1 ? '' : 'n'} ${next.days} día${next.days === 1 ? '' : 's'} · ${futureLabel(next.key, today)}`}</span>}
        </span>
        <input type="date" value={full} onChange={(e) => onSet(e.target.value)} aria-label={kind.label} className="pg-focus" style={fieldDate} />
        {d && (d.date || kind.id === 'otra') && <RemoveBtn onClick={onRemove} label={`Quitar ${kind.label}`} />}
      </div>
      {kind.id === 'otra' && d && (
        <TextField value={d.label} onChange={onLabel} max={50} placeholder="¿Qué se celebra? Ej.: el día que adoptamos a Luna" style={{ marginTop: 7, fontSize: 13.5, padding: '7px 10px' }} />
      )}
    </div>
  );
}

function Dates({ ctx }) {
  const { profile, setProfile } = ctx;
  const dates = profile.dates || [];
  const setDates = (fn) => setProfile((p) => ({ ...p, dates: fn(p.dates || []) }));
  const upsert = (kindId, value, id) => setDates((list) => {
    if (!value) return list.filter((x) => (id ? x.id !== id : x.kind !== kindId));
    const found = list.find((x) => (id ? x.id === id : x.kind === kindId));
    if (found) return list.map((x) => (x === found ? { ...x, date: value } : x));
    return [...list, { id: pid('d'), kind: kindId, date: value }];
  });
  const rowFor = (k) => (
    <DateRow
      key={k.id} kind={k} d={dates.find((x) => x.kind === k.id)}
      onSet={(v) => upsert(k.id, v)} onRemove={() => upsert(k.id, '')}
    />
  );
  const quick = DATE_KINDS.filter((k) => k.quick);
  const more = DATE_KINDS.filter((k) => !k.quick && k.id !== 'otra');
  const others = dates.filter((x) => x.kind === 'otra');
  const moreCount = dates.filter((x) => !quick.some((k) => k.id === x.kind)).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {quick.map(rowFor)}
      <Fold title="Más fechas" hint="El día que se conocieron, la primera cita, otra fecha especial…" badge={moreCount || null} open={moreCount ? true : undefined}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {more.map(rowFor)}
          {others.map((o) => (
            <DateRow
              key={o.id} kind={DATE_KINDS.find((k) => k.id === 'otra')} d={o}
              onSet={(v) => upsert('otra', v, o.id)} onRemove={() => upsert('otra', '', o.id)}
              onLabel={(v) => setDates((l) => l.map((x) => (x.id === o.id ? { ...x, label: v } : x)))}
            />
          ))}
          <SmallButton onClick={() => { play('pop'); setDates((l) => [...l, { id: pid('d'), kind: 'otra', date: '', label: '' }]); }} style={{ alignSelf: 'flex-start' }}>+ Otra fecha especial</SmallButton>
        </div>
      </Fold>
      <p style={{ fontSize: 11.5, color: C.inkFaint, margin: '2px 0 0' }}>Cada fecha se vuelve una temporada en su cuarto, y te avisamos unos días antes. Se guarda solo.</p>
    </div>
  );
}

// Una lista de cosas con nombre e historia (lugares, recetas).
function StoryList({ ctx, field, ideas, namePh, storyPh, storyKey, addLabel, emptyText }) {
  const { profile, setProfile } = ctx;
  const list = profile[field] || [];
  const setList = (fn) => setProfile((p) => ({ ...p, [field]: fn(p[field] || []) }));
  const [name, setName] = useState('');
  const [story, setStory] = useState('');
  const [adding, setAdding] = useState(false);
  const free = ideas.filter((i) => !list.some((x) => x.name === i));

  function add() {
    if (!name.trim()) return;
    play('coin');
    setList((l) => [...l, { id: pid(field[0]), name: name.trim(), [storyKey]: story.trim() }]);
    setName(''); setStory(''); setAdding(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {list.length === 0 && !adding && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>{emptyText}</p>}
      {list.map((x) => (
        <div key={x.id} style={{ padding: '9px 10px', borderRadius: 14, background: soft(C.rose, 0.9), display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextField value={x.name} onChange={(v) => setList((l) => l.map((y) => (y.id === x.id ? { ...y, name: v } : y)))} max={60} label="Nombre" style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 14, padding: '6px 9px' }} />
            <textarea
              value={x[storyKey] || ''} rows={2} placeholder={storyPh} aria-label="Historia" className="pg-focus"
              onChange={(e) => setList((l) => l.map((y) => (y.id === x.id ? { ...y, [storyKey]: e.target.value.slice(0, 300) } : y)))}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', marginTop: 6, fontFamily: FONT.hand || FONT.body, fontSize: 16, lineHeight: 1.3, padding: '6px 9px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink }}
            />
          </div>
          <RemoveBtn onClick={() => setList((l) => l.filter((y) => y.id !== x.id))} label={`Quitar ${x.name}`} />
        </div>
      ))}
      {adding ? (
        <div style={{ padding: 10, borderRadius: 14, border: `1.5px dashed ${C.line}`, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {free.length > 0 && (
            <ChipRow>
              {free.slice(0, 4).map((i) => <Chip key={i} active={name === i} onClick={() => { play('pop'); setName(i); }} style={{ fontSize: 12, padding: '5px 10px' }}>{i}</Chip>)}
            </ChipRow>
          )}
          <TextField value={name} onChange={setName} max={60} placeholder={namePh} autoFocus />
          <textarea
            value={story} onChange={(e) => setStory(e.target.value.slice(0, 300))} rows={3} placeholder={storyPh} aria-label="Historia" className="pg-focus"
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: FONT.hand || FONT.body, fontSize: 16, lineHeight: 1.3, padding: '8px 10px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <SmallButton onClick={() => { setAdding(false); setName(''); setStory(''); }} style={{ flexShrink: 0 }}>Cancelar</SmallButton>
            <MainButton onClick={add} disabled={!name.trim()} style={{ padding: 9, fontSize: 14 }}>Guardar</MainButton>
          </div>
        </div>
      ) : (
        <SmallButton onClick={() => { play('pop'); setAdding(true); }} style={{ alignSelf: 'flex-start' }}>{addLabel}</SmallButton>
      )}
    </div>
  );
}

export default function RememberSheet({ ctx, focus, onClose }) {
  const { names, profile } = ctx;
  useEffect(() => {
    if (!focus) return undefined;
    const t = setTimeout(() => { const el = document.getElementById(`rc-${focus}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    return () => clearTimeout(t);
  }, [focus]);
  return (
    <Sheet title="Recordar" subtitle="Lo que es solo de ustedes dos" icon={IconFrame} color={C.amber} onClose={onClose} status={ctx.saveStatus}>
      <Section id="rc-fechas" title="Sus fechas" hint={`Cumpleaños, aniversario… ${names.pet} las celebra con ${names.to}.`} highlight={focus === 'fechas'}>
        <Dates ctx={ctx} />
      </Section>
      <Fold
        id="rc-lugares" title="Nuestros lugares" icon={IconHeart} color={C.rose} badge={(profile.places || []).length || null}
        hint="El café donde se conocieron, ese viaje… Se vuelven niveles de su mapa."
        open={focus === 'lugares' ? true : undefined}
      >
        <StoryList
          ctx={ctx} field="places" storyKey="note" ideas={PLACE_IDEAS} addLabel="+ Sumar un lugar"
          namePh="Nombre del lugar" storyPh="¿Qué pasó ahí? (opcional)" emptyText="Los lugares que son de ustedes."
        />
      </Fold>
      <Fold
        id="rc-recetas" title="Tus recetas" icon={IconCookie} color={C.peach} badge={(profile.recipes || []).length || null}
        hint={`Lo que le cocinas tú. ${names.pet} lo va a cocinar en su cuarto.`}
        open={focus === 'recetas' ? true : undefined}
      >
        <StoryList
          ctx={ctx} field="recipes" storyKey="story" ideas={RECIPE_IDEAS} addLabel="+ Sumar una receta"
          namePh="Nombre de la receta" storyPh="Su historia: cuándo la hiciste, por qué es especial…" emptyText="La comida que tiene una historia."
        />
      </Fold>
      <Soon title="Objetos con sus fotos" text="Un portarretrato, una taza o un cojín con una foto de los dos." />
    </Sheet>
  );
}
