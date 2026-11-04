import React, { useEffect, useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { IconFrame, IconHeart, IconCookie } from '../icons';
import { play } from '../../sound';
import { DATE_KINDS, PHOTO_OBJECTS, pid } from '../../personal/catalog';
import { dayKey, nextDate, futureLabel } from '../../personal/suggest';
import { loadPet } from '../../api';
import { RECIPES } from '../../cooking';
import { baseRecipeFor } from '../../personal/recipes';
import PhotoObject from '../game/personal/PhotoObject';
import { Sheet, Section, Fold, Chip, ChipRow, TextField, MainButton, SmallButton, RemoveBtn } from './kit';

// ─────────────────────────────────────────────────────────────────
// Recordar: sus fechas, nuestros lugares, recetas de quien regala y
// objetos con sus fotos (un portarretrato, una taza… con una de las
// fotos que ya subió al regalo).
// ─────────────────────────────────────────────────────────────────

// Las fotos que ya subió quien regala (el rincón no las trae: se piden
// aparte, una vez).
function usePhotos(slug) {
  const [photos, setPhotos] = useState(null);
  useEffect(() => {
    let alive = true;
    loadPet(slug).then(({ pet }) => { if (alive) setPhotos(((pet && pet.photos) || []).map((p, i) => ({ ...p, i })).filter((p) => p.url)); }).catch(() => alive && setPhotos([]));
    return () => { alive = false; };
  }, [slug]);
  return photos;
}

const thumb = { width: 56, height: 56, objectFit: 'cover', borderRadius: 10, display: 'block' };

// Una tira de fotos para elegir una (o ninguna, si `none`).
function PhotoStrip({ photos, value, onPick, none }) {
  if (!photos) return <p style={{ fontSize: 12, color: C.inkFaint, margin: 0 }}>Buscando tus fotos…</p>;
  if (!photos.length) return <p style={{ fontSize: 12, color: C.inkSoft, margin: 0 }}>Este regalo todavía no tiene fotos.</p>;
  return (
    <div className="pg-scroll-x" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 3 }}>
      {none && (
        <button onClick={() => { play('pop'); onPick(null); }} className="pg-focus" aria-label="Sin foto" style={{ ...thumb, flexShrink: 0, padding: 0, border: `2.5px ${value == null ? 'solid' : 'dashed'} ${value == null ? C.rose : C.line}`, background: C.surface, color: C.inkSoft, fontFamily: FONT.display, fontSize: 11, cursor: 'pointer' }}>Sin foto</button>
      )}
      {photos.map((p) => (
        <button
          key={p.i} onClick={() => { play('pop'); onPick(p.i); }} aria-label={`Foto ${p.i + 1}`} aria-pressed={value === p.i} className="pg-focus"
          style={{ flexShrink: 0, padding: 0, borderRadius: 12, border: `2.5px solid ${value === p.i ? C.rose : 'transparent'}`, background: 'none', cursor: 'pointer', boxShadow: value === p.i ? `0 0 0 3px ${soft(C.rose, 0.6)}` : 'none' }}
        >
          <img src={p.url} alt="" style={thumb} draggable="false" />
        </button>
      ))}
    </div>
  );
}

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

// La foto de un lugar (opcional): plegada hasta que se toca.
function ItemPhoto({ photos, value, onPick }) {
  const [open, setOpen] = useState(false);
  const cur = photos && value != null ? photos.find((p) => p.i === Number(value)) : null;
  if (photos && !photos.length) return null;
  return (
    <div style={{ marginTop: 7 }}>
      {!open ? (
        <button onClick={() => { play('pop'); setOpen(true); }} className="pg-focus" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.inkSoft, fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700 }}>
          {cur ? <img src={cur.url} alt="" style={{ ...thumb, width: 34, height: 34, borderRadius: 8 }} /> : null}
          {cur ? 'Cambiar la foto' : '+ Sumar una foto (opcional)'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 11.5, color: C.inkSoft }}>Se abre cuando pase esta zona del mapa:</span>
          <PhotoStrip photos={photos} value={cur ? cur.i : null} none onPick={(v) => { onPick(v); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

// El plato con el que se cocina una receta en el juego.
function DishPick({ value, onPick, name }) {
  const [open, setOpen] = useState(false);
  const base = baseRecipeFor({ dish: value, name });
  return (
    <div style={{ marginTop: 7 }}>
      {!open ? (
        <button onClick={() => { play('pop'); setOpen(true); }} className="pg-focus" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.inkSoft, fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, textAlign: 'left' }}>
          En el juego se cocina como: <span style={{ color: C.ink }}>{base.name}</span> · Cambiar
        </button>
      ) : (
        <ChipRow>
          {RECIPES.map((r) => (
            <Chip key={r.id} active={base.id === r.id} color={C.peach} onClick={() => { play('pop'); onPick(r.id); setOpen(false); }} style={{ fontSize: 12, padding: '5px 10px' }}>{r.name}</Chip>
          ))}
        </ChipRow>
      )}
    </div>
  );
}

// ── Objetos con sus fotos ────────────────────────────────────────
function PhotoObjects({ ctx, photos }) {
  const { profile, setProfile, names } = ctx;
  const list = profile.photoObjects || [];
  const setList = (fn) => setProfile((p) => ({ ...p, photoObjects: fn(p.photoObjects || []) }));
  const [kind, setKind] = useState(null);
  const [photo, setPhoto] = useState(null);
  const url = (i) => { const p = photos && photos.find((x) => x.i === Number(i)); return p ? p.url : null; };
  const firstUrl = photos && photos.length ? photos[0].url : null;
  const adding = kind != null;

  function save() {
    if (kind == null || photo == null) return;
    play('coin');
    setList((l) => [...l, { id: pid('o'), kind, photo }]);
    setKind(null); setPhoto(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {list.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {list.map((o) => {
            const def = PHOTO_OBJECTS.find((k) => k.id === o.kind);
            return (
              <div key={o.id} style={{ position: 'relative', padding: '8px 8px 6px', borderRadius: 14, background: soft(C.amber, 0.88), display: 'flex', flexDirection: 'column', alignItems: 'center', width: 96, boxSizing: 'border-box' }}>
                <PhotoObject kind={o.kind} url={url(o.photo)} w={70} />
                <span style={{ fontSize: 11, color: C.inkSoft, textAlign: 'center', lineHeight: 1.2, marginTop: 3 }}>{def ? def.label : ''}</span>
                <span style={{ position: 'absolute', top: 2, right: 2 }}><RemoveBtn onClick={() => setList((l) => l.filter((x) => x.id !== o.id))} label={`Quitar ${def ? def.label : 'objeto'}`} /></span>
              </div>
            );
          })}
        </div>
      )}
      {photos && photos.length === 0 ? (
        <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Cuando el regalo tenga fotos, vas a poder ponerlas en un portarretrato, una taza o un cojín.</p>
      ) : !adding ? (
        <>
          {list.length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Aparecen en su cuarto como decoración, con una foto de ustedes.</p>}
          <SmallButton onClick={() => { play('pop'); setKind(PHOTO_OBJECTS[0].id); setPhoto(photos && photos.length ? photos[0].i : null); }} style={{ alignSelf: 'flex-start' }}>+ Sumar un objeto con foto</SmallButton>
        </>
      ) : (
        <div style={{ padding: 10, borderRadius: 14, border: `1.5px dashed ${C.line}`, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <span style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.ink }}>1. El objeto</span>
          <div className="pg-scroll-x" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 3 }}>
            {PHOTO_OBJECTS.map((k) => (
              <button
                key={k.id} onClick={() => { play('pop'); setKind(k.id); }} aria-pressed={kind === k.id} className="pg-focus"
                style={{ flexShrink: 0, width: 84, padding: '6px 4px', borderRadius: 14, cursor: 'pointer', background: kind === k.id ? soft(C.amber, 0.75) : C.surface, border: `2px solid ${kind === k.id ? C.amber : C.lineSoft}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
              >
                <PhotoObject kind={k.id} url={url(photo) || firstUrl} w={56} />
                <span style={{ fontSize: 10.5, color: C.ink, lineHeight: 1.15, fontFamily: FONT.display, fontWeight: 700 }}>{k.label}</span>
              </button>
            ))}
          </div>
          <span style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.ink }}>2. La foto</span>
          <PhotoStrip photos={photos} value={photo} onPick={setPhoto} />
          <div style={{ display: 'flex', gap: 8 }}>
            <SmallButton onClick={() => { setKind(null); setPhoto(null); }} style={{ flexShrink: 0 }}>Cancelar</SmallButton>
            <MainButton onClick={save} disabled={photo == null} style={{ padding: 9, fontSize: 14 }}>Ponerlo en su cuarto</MainButton>
          </div>
          <p style={{ fontSize: 11.5, color: C.inkFaint, margin: 0 }}>{names.pet} lo va a tener en su cuarto para acomodarlo donde quiera.</p>
        </div>
      )}
    </div>
  );
}

// Una lista de cosas con nombre e historia (lugares, recetas).
function StoryList({ ctx, field, ideas, namePh, storyPh, storyKey, addLabel, emptyText, photos, withDish }) {
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
            {photos && <ItemPhoto photos={photos} value={x.photo} onPick={(v) => setList((l) => l.map((y) => (y.id === x.id ? { ...y, photo: v } : y)))} />}
            {withDish && <DishPick value={x.dish} name={x.name} onPick={(v) => setList((l) => l.map((y) => (y.id === x.id ? { ...y, dish: v } : y)))} />}
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
  const photos = usePhotos(ctx.slug);
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
          ctx={ctx} field="places" storyKey="note" ideas={PLACE_IDEAS} addLabel="+ Sumar un lugar" photos={photos}
          namePh="Nombre del lugar" storyPh="¿Qué pasó ahí? (opcional)" emptyText="Los lugares que son de ustedes."
        />
      </Fold>
      <Fold
        id="rc-recetas" title="Tus recetas" icon={IconCookie} color={C.peach} badge={(profile.recipes || []).length || null}
        hint={`Lo que le cocinas tú. ${names.pet} lo va a cocinar en su cuarto.`}
        open={focus === 'recetas' ? true : undefined}
      >
        <StoryList
          ctx={ctx} field="recipes" storyKey="story" ideas={RECIPE_IDEAS} addLabel="+ Sumar una receta" withDish
          namePh="Nombre de la receta" storyPh="Su historia: cuándo la hiciste, por qué es especial…" emptyText="La comida que tiene una historia."
        />
      </Fold>
      <Fold
        id="rc-objetos" title="Objetos con sus fotos" icon={IconFrame} color={C.amber} badge={(profile.photoObjects || []).length || null}
        hint="Un portarretrato, una postal, una taza o un cojín con una foto de los dos."
        open={focus === 'objetos' ? true : undefined}
      >
        <PhotoObjects ctx={ctx} photos={photos} />
      </Fold>
    </Sheet>
  );
}
