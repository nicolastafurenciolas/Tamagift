import React, { useEffect, useMemo, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { IconGift, IconSparkle } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import PetArt from '../PetArt';
import { answerReply } from '../../api';
import { parseRecipe } from '../../petLook';
import { FURNITURE, FURNITURE_CATEGORIES, FURNITURE_PAINTS } from '../../roomCatalog';
import { DECOR_CATALOG } from '../../shopCatalog';
import { WARDROBE, applyLook } from '../../wardrobeState';
import { SLOTS } from '../../art/mochi';
import { COUPON_IDEAS, fill, pid } from '../../personal/catalog';
import { couponTitle, dayLabel, dayOfIso } from '../../personal/suggest';
import { PACKS, activePacks, suggestPacks, suggestReason, withPack, withoutPack } from '../../personal/packs';
import { findPackDecor } from '../../art/room/packs';
import { Sheet, Section, Fold, Chip, ChipRow, TextField, LetterArea, MainButton, SmallButton, Note, RemoveBtn, ERRORS } from './kit';

// ─────────────────────────────────────────────────────────────────
// Regalarle: un paquete (mueble, adorno o ropa de los catálogos del
// juego, con una nota), los cupones de amor y los packs por gustos
// (personal/packs.js: adornos, ropa, comidas y frases de un gusto).
// ─────────────────────────────────────────────────────────────────

const NOTE_IDEAS = ['Vi esto y pensé en ti', 'Para tu cuarto, con cariño', 'Un detallito porque sí', 'Para que {mascota} te cuide', 'Porque te lo mereces'];

const KINDS = [
  { id: 'mueble', label: 'Un mueble' },
  { id: 'decor', label: 'Un adorno' },
  { id: 'ropa', label: 'Ropa' },
];

function PaintSwatches({ value, onPick }) {
  return (
    <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0' }}>
      {FURNITURE_PAINTS.map((p) => (
        <button
          key={p.id} onClick={() => { play('pop'); onPick(p.id); }} aria-label={`Color ${p.name}`} title={p.name} className="pg-focus pg-keep-round"
          style={{
            width: 28, height: 28, flexShrink: 0, borderRadius: '50%', cursor: 'pointer', padding: 0,
            background: `linear-gradient(135deg, ${p.wood} 50%, ${p.cloth} 50%)`,
            border: value === p.id ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
            boxShadow: value === p.id ? SHADOW.soft : 'none',
          }}
        />
      ))}
    </div>
  );
}

function Tile({ selected, onClick, name, children }) {
  return (
    <button
      onClick={onClick} className="pg-card pg-focus"
      style={{ padding: 6, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0, borderColor: selected ? C.rose : C.line, background: selected ? soft(C.rose, 0.85) : C.surface }}
    >
      <span style={{ width: '100%', height: 70, borderRadius: 10, background: C.paperDeep, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>{children}</span>
      <span style={{ fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: C.ink, lineHeight: 1.15, textAlign: 'center', minHeight: 25, overflow: 'hidden' }}>{name}</span>
    </button>
  );
}

// ── Un paquete ──────────────────────────────────────────────────
function Parcel({ ctx }) {
  const { names, r } = ctx;
  const recipe = useMemo(() => parseRecipe(r.recipe), [r.recipe]);
  const [kind, setKind] = useState('mueble');
  const [cat, setCat] = useState(FURNITURE_CATEGORIES[0].id);
  const [slot, setSlot] = useState('cabeza');
  const [item, setItem] = useState(null); // { kind, id, name, paintable, slot? }
  const [paint, setPaint] = useState('natural');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  const kinds = KINDS.filter((k) => k.id !== 'ropa' || recipe);
  const ideaVars = { ...names, nombre: names.nombre };
  const fillNote = (t) => fill(t.replace('{mascota}', names.pet), ideaVars);

  async function sendIt() {
    if (!item || sending) return;
    setSending(true); setError('');
    const payload = { kind: item.kind, id: item.kind === 'ropa' ? `${item.slot}:${item.id}` : item.id };
    if (item.paintable) payload.paint = paint;
    const res = await ctx.send({ kind: 'paquete', text: note.trim(), payload });
    setSending(false);
    if (res.ok) { setSent(item.name); setItem(null); setNote(''); setPaint('natural'); }
    else setError(ERRORS[res.error] || ERRORS['sin-conexion']);
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '4px' }}>
        <div className="pg-anim-pop" style={{ display: 'inline-block' }}><IconGift size={40} color={C.sage} fill={C.sageSoft} /></div>
        <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, margin: '6px 0 4px', color: C.ink }}>¡Paquete en camino!</div>
        <p style={{ fontSize: 13, color: C.inkSoft, margin: '0 0 12px', lineHeight: 1.4 }}>{sent} le llega a {names.to} en una caja a la puerta, con tu nota escrita a mano.</p>
        <SmallButton onClick={() => { play('pop'); setSent(null); }}>Mandar otro</SmallButton>
      </div>
    );
  }

  if (item) {
    const f = item.kind === 'mueble' ? FURNITURE.find((x) => x.id === item.id) : item.kind === 'decor' ? DECOR_CATALOG.find((x) => x.id === item.id) : null;
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 110, height: 110, borderRadius: 16, background: C.paperDeep, border: `1.5px solid ${C.line}`, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {f && <Sprite markup={f.svg(paint)} cacheKey={`rc-${item.kind}-${item.id}-${paint}`} w={100} h={100} />}
            {item.kind === 'ropa' && <PetArt recipe={applyLook(recipe, { wear: { [item.slot]: { id: item.id } } })} mood="feliz" size={104} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: C.ink }}>{item.name}</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2, lineHeight: 1.35 }}>{item.paintable ? 'Elige el color' : `Le llega a ${names.to} en una caja a la puerta`}</div>
            <button onClick={() => { play('pop'); setItem(null); }} className="pg-focus" style={{ background: 'none', border: 'none', color: C.rose, fontFamily: FONT.display, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', padding: '6px 0 0' }}>← Elegir otro</button>
          </div>
        </div>
        {item.paintable && <div style={{ marginTop: 10 }}><PaintSwatches value={paint} onPick={setPaint} /></div>}
        <div style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.ink, margin: '14px 0 6px' }}>Tu nota</div>
        <ChipRow style={{ marginBottom: 6 }}>
          {NOTE_IDEAS.map((t) => <Chip key={t} onClick={() => { play('pop'); setNote(fillNote(t)); }} style={{ fontSize: 12, padding: '5px 10px', background: 'transparent' }}>{fillNote(t)}</Chip>)}
        </ChipRow>
        <LetterArea value={note} onChange={setNote} rows={2} max={300} placeholder="Escríbele algo para la caja…" label="Nota del paquete" />
        <Note tone="error">{error}</Note>
        <MainButton onClick={sendIt} busy={sending} style={{ marginTop: 8 }}>Mandar el paquete</MainButton>
      </div>
    );
  }

  return (
    <div>
      <ChipRow style={{ marginBottom: 10 }}>
        {kinds.map((k) => <Chip key={k.id} active={kind === k.id} onClick={() => { play('pop'); setKind(k.id); }} color={C.sage}>{k.label}</Chip>)}
      </ChipRow>
      {kind === 'mueble' && (
        <>
          <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8 }}>
            {FURNITURE_CATEGORIES.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => { play('pop'); setCat(c.id); }} color={C.lavender} style={{ flexShrink: 0, fontSize: 11.5, padding: '5px 10px', whiteSpace: 'nowrap' }}>{c.name}</Chip>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
            {FURNITURE.filter((f) => f.cat === cat && !f.season).map((f) => (
              <Tile key={f.id} name={f.name} onClick={() => { play('pop'); setItem({ kind: 'mueble', id: f.id, name: f.name, paintable: true }); }}>
                <Sprite markup={f.svg('natural')} cacheKey={`furn-${f.id}-natural`} w={64} h={64} />
              </Tile>
            ))}
          </div>
        </>
      )}
      {kind === 'decor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
          {DECOR_CATALOG.filter((d) => !d.season).map((d) => (
            <Tile key={d.id} name={d.name} onClick={() => { play('pop'); setItem({ kind: 'decor', id: d.id, name: d.name, paintable: !!d.paintable }); }}>
              <Sprite markup={d.svg('natural')} cacheKey={`decor-${d.id}-natural`} w={64} h={64} />
            </Tile>
          ))}
        </div>
      )}
      {kind === 'ropa' && recipe && (
        <>
          <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8 }}>
            {SLOTS.map((s) => (
              <Chip key={s.id} active={slot === s.id} onClick={() => { play('pop'); setSlot(s.id); }} color={C.lavender} style={{ flexShrink: 0, fontSize: 11.5, padding: '5px 10px', whiteSpace: 'nowrap' }}>{s.label}</Chip>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
            {WARDROBE.filter((w) => w.slot === slot && !w.season).map((w) => (
              <Tile key={w.id} name={w.label} onClick={() => { play('pop'); setItem({ kind: 'ropa', id: w.id, slot: w.slot, name: w.label, paintable: false }); }}>
                <PetArt recipe={applyLook(recipe, { wear: { [w.slot]: { id: w.id } } })} mood="feliz" size={68} />
              </Tile>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Cupones de amor ─────────────────────────────────────────────
const STAR_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 50];

function Stars({ value, onChange }) {
  const i = Math.max(0, STAR_STEPS.indexOf(value));
  const btn = { width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, fontWeight: 800, cursor: 'pointer', padding: 0, lineHeight: 1 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
      <button className="pg-focus pg-keep-round" style={btn} aria-label="Menos estrellas" onClick={() => onChange(STAR_STEPS[Math.max(0, i - 1)])}>−</button>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.ink, minWidth: 38, justifyContent: 'center' }}>
        <IconSparkle size={13} color={C.amber} fill={C.amber} />{value}
      </span>
      <button className="pg-focus pg-keep-round" style={btn} aria-label="Más estrellas" onClick={() => onChange(STAR_STEPS[Math.min(STAR_STEPS.length - 1, i + 1)])}>+</button>
    </div>
  );
}

function CanjeCard({ ctx, x }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function done() {
    setBusy(true); setError('');
    const res = await answerReply(ctx.slug, x.id, { answer: msg.trim() || null, done: true }, ctx.auth);
    setBusy(false);
    if (res) { play('win'); ctx.updateReply(res); } else { play('bad'); setError(ERRORS['sin-conexion']); }
  }
  return (
    <div style={{ padding: 11, borderRadius: 14, background: soft(C.amber, 0.82), display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>{ctx.names.to} lo canjeó {dayLabel(dayOfIso(x.created_at))}</div>
      <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink }}>«{couponTitle(ctx.profile, x.ref)}»</div>
      <TextField value={msg} onChange={setMsg} max={200} placeholder="¿Cuándo? Ej.: el sábado a las 8" />
      <Note tone="error">{error}</Note>
      <MainButton onClick={done} busy={busy} color="sage" style={{ padding: 10, fontSize: 14 }}>Ya lo cumplí</MainButton>
    </div>
  );
}

function Coupons({ ctx }) {
  const { profile, setProfile, names, r } = ctx;
  const coupons = profile.coupons || [];
  const [own, setOwn] = useState('');
  const [ownStars, setOwnStars] = useState(15);
  const setCoupons = (fn) => setProfile((p) => ({ ...p, coupons: fn(p.coupons || []) }));
  const ideas = COUPON_IDEAS.filter((c) => !coupons.some((x) => x.title === c.title));
  const canjes = (r.replies || []).filter((x) => x.kind === 'canje');
  const pending = canjes.filter((x) => !x.done);
  const done = canjes.filter((x) => x.done);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {pending.length > 0 && pending.map((x) => <CanjeCard key={x.id} ctx={ctx} x={x} />)}
      {coupons.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {coupons.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 14, border: `1.5px dashed ${C.amber}`, background: soft(C.amber, 0.9) }}>
              <span style={{ flex: 1, minWidth: 0, fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{c.title}</span>
              <Stars value={c.stars} onChange={(v) => setCoupons((l) => l.map((y) => (y.id === c.id ? { ...y, stars: v } : y)))} />
              <RemoveBtn onClick={() => setCoupons((l) => l.filter((y) => y.id !== c.id))} label={`Quitar ${c.title}`} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Todavía no hay cupones. Toca una idea para sumarla:</p>
      )}
      {ideas.length > 0 && (
        <ChipRow>
          {ideas.slice(0, coupons.length ? 5 : 8).map((c) => (
            <Chip key={c.title} onClick={() => { play('coin'); setCoupons((l) => [...l, { id: pid('c'), title: c.title, stars: c.stars }]); }} style={{ fontSize: 12 }}>
              + {c.title}
            </Chip>
          ))}
        </ChipRow>
      )}
      <Fold title="Escribir uno propio" hint="Lo que solo ustedes entienden">
        <TextField value={own} onChange={setOwn} max={60} placeholder="Vale por…" label="Cupón propio" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 12.5, color: C.inkSoft }}>Cuesta</span>
          <Stars value={ownStars} onChange={setOwnStars} />
          <SmallButton disabled={!own.trim()} onClick={() => { play('coin'); setCoupons((l) => [...l, { id: pid('c'), title: own.trim(), stars: ownStars }]); setOwn(''); }}>Sumar</SmallButton>
        </div>
      </Fold>
      {done.length > 0 && (
        <p style={{ fontSize: 12, color: C.inkSoft, margin: 0 }}>Cumpliste: {done.map((x) => `«${couponTitle(profile, x.ref)}»`).join(', ')}.</p>
      )}
      <p style={{ fontSize: 11.5, color: C.inkFaint, margin: 0 }}>{names.to} junta estrellas jugando y los canjea. Tú ves cuándo. Se guarda solo.</p>
    </div>
  );
}

// ── Packs por gustos ────────────────────────────────────────────
// Primero los dos que sugiere la ficha; los demás, a un toque. Cada pack
// se ve con sus adornos y su ropa puesta en la mascota, una frase y sus
// comidas. "Activar" lo guarda en profile.packs (setProfile, sin pisar
// lo demás de la ficha) y el juego lo hace llegar.
function PackPreview({ pack, recipe }) {
  const tile = { borderRadius: 10, background: C.paperDeep, display: 'grid', placeItems: 'center', overflow: 'hidden', aspectRatio: '1 / 1', minWidth: 0 };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${recipe ? 5 : 3}, minmax(0, 1fr))`, gap: 5 }}>
      {pack.decor.map((id) => {
        const d = findPackDecor(id);
        return d ? <span key={id} style={tile} title={d.name}><Sprite markup={d.svg()} cacheKey={`pack-${id}`} w={56} h={56} /></span> : null;
      })}
      {recipe && pack.wear.map((w) => (
        <span key={w.id} style={tile}><PetArt recipe={applyLook(recipe, { wear: { [w.slot]: { id: w.id } } })} mood="feliz" size={58} /></span>
      ))}
    </div>
  );
}

function PackCard({ ctx, pack, recipe, reason, onActivate, onRemove }) {
  const { names } = ctx;
  const on = activePacks(ctx.profile).includes(pack.id);
  const color = C[pack.color] || C.lavender;
  const said = fill(pack.lines[0], { nombre: names.nombre, yo: names.yo });
  return (
    <div className="pg-card" style={{ padding: 11, display: 'flex', flexDirection: 'column', gap: 8, borderColor: on ? color : C.line, background: on ? soft(color, 0.88) : C.surface }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 15.5, fontWeight: 800, color: C.ink }}>{pack.name}</div>
          <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.3 }}>{pack.pitch}</div>
        </div>
        {on && <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: C.onAccent, background: color, borderRadius: 999, padding: '2px 9px', flexShrink: 0 }}>Activado ✓</span>}
      </div>
      {reason && !on && <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>Porque le gusta: {reason}</div>}
      <PackPreview pack={pack} recipe={recipe} />
      <div style={{ fontFamily: FONT.hand || FONT.body, fontSize: 15, color: C.ink, lineHeight: 1.25 }}>{names.pet} dirá: «{said}»</div>
      <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.35 }}>Para comer: {pack.foods.map((f) => f.name).join(' · ')}</div>
      {on ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.35 }}>Le aparece en su tienda como «de {names.yo || 'ti'} para ti».</span>
          <button onClick={onRemove} className="pg-focus" style={{ background: 'none', border: 'none', color: C.inkFaint, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', padding: 4, flexShrink: 0 }}>Quitar</button>
        </div>
      ) : (
        <MainButton onClick={onActivate} color="sage" style={{ padding: 10, fontSize: 14 }}>Activar para {names.nombre}</MainButton>
      )}
    </div>
  );
}

function Packs({ ctx }) {
  const { profile, setProfile, names, r } = ctx;
  const recipe = useMemo(() => parseRecipe(r.recipe), [r.recipe]);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(null);
  const [flash, setFlash] = useState('');
  // la sugerencia se calcula al abrir (no salta de lugar al activar)
  const top = useMemo(() => suggestPacks(profile, 2, { keepActive: true }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const rest = PACKS.filter((p) => !top.includes(p.id));
  const active = activePacks(profile);

  function activate(id) {
    // Aquí iría el pago del pack (cuando se venda aparte). Por ahora
    // activar es gratis: se guarda en la ficha y el juego lo hace llegar.
    play('win');
    setProfile((p) => withPack(p, id), { now: true });
    setFlash(`¡Listo! ${PACKS.find((x) => x.id === id).name} ya va camino al mundo de ${names.to}.`);
  }
  function remove(id) {
    play('pop');
    setProfile((p) => withoutPack(p, id), { now: true });
    setFlash('');
  }
  const card = (p) => <PackCard key={p.id} ctx={ctx} pack={p} recipe={recipe} reason={suggestReason(profile, p.id)} onActivate={() => activate(p.id)} onRemove={() => remove(p.id)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0, lineHeight: 1.4 }}>
        Adornos, ropa para {names.pet}, comidas y frases nuevas. Estos van con lo que nos contaste de {names.to}:
      </p>
      {top.map((id) => card(PACKS.find((p) => p.id === id)))}
      <Note>{flash}</Note>
      {!showAll ? (
        <SmallButton onClick={() => { play('pop'); setShowAll(true); }} style={{ alignSelf: 'center' }}>Ver los otros {rest.length} packs</SmallButton>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rest.map((p) => {
            if (open === p.id) return card(p);
            const hero = findPackDecor(p.hero);
            return (
              <button
                key={p.id} onClick={() => { play('pop'); setOpen(p.id); }} className="pg-card pg-focus"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', cursor: 'pointer', textAlign: 'left', background: C.surface, color: C.ink }}
              >
                <span style={{ width: 42, height: 42, borderRadius: 10, background: C.paperDeep, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {hero && <Sprite markup={hero.svg()} cacheKey={`pack-${hero.id}`} w={38} h={38} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: FONT.display, fontSize: 14, fontWeight: 800 }}>{p.name}{active.includes(p.id) ? ' ✓' : ''}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: C.inkSoft, lineHeight: 1.3 }}>{p.pitch}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <p style={{ fontSize: 11.5, color: C.inkFaint, margin: 0 }}>Le llega como regalo tuyo, sin costo para {names.to}. Se guarda solo.</p>
    </div>
  );
}

export default function GiftSheet({ ctx, focus, onClose }) {
  const { names } = ctx;
  useEffect(() => {
    if (!focus) return undefined;
    const t = setTimeout(() => { const el = document.getElementById(`rc-${focus}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    return () => clearTimeout(t);
  }, [focus]);
  const canjes = (ctx.r.replies || []).filter((x) => x.kind === 'canje' && !x.done).length;
  const nPacks = activePacks(ctx.profile).length;
  return (
    <Sheet title={`Regalarle a ${names.to}`} subtitle="Le llega en una caja a la puerta, con tu nota" icon={IconGift} color={C.sage} onClose={onClose} status={ctx.saveStatus}>
      <Section id="rc-paquete" title="Un paquete" hint={`Elige algo para el cuarto o para ${names.pet}.`} highlight={focus === 'paquete'}>
        <Parcel ctx={ctx} />
      </Section>
      <Fold
        id="rc-cupones" title="Cupones de amor" icon={IconSparkle} color={C.amber}
        hint={`Vales de verdad que ${names.to} canjea con estrellas`}
        badge={canjes ? `${canjes} por cumplir` : null}
        open={focus === 'cupones' || canjes > 0 ? true : undefined}
      >
        <Coupons ctx={ctx} />
      </Fold>
      <Fold
        id="rc-packs" title="Packs por gustos" icon={IconSparkle} color={C.lavender}
        hint={`Su mundo se llena de lo que le gusta a ${names.to}`}
        badge={nPacks ? `${nPacks} activo${nPacks > 1 ? 's' : ''}` : null}
        open={focus === 'packs' ? true : undefined}
      >
        <Packs ctx={ctx} />
      </Fold>
    </Sheet>
  );
}
