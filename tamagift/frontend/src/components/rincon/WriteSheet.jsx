import React, { useEffect, useRef, useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { IconEnvelope, IconHeart } from '../icons';
import { play } from '../../sound';
import { compressImageFile } from '../../imageCompress';
import { answerReply } from '../../api';
import { QUICK_NOTES, SITUATIONS, LETTER_WHEN, fill } from '../../personal/catalog';
import { dayKey, daysBetween, prettyDay, upcomingDates, dateName, dayLabel, futureLabel, dayOfIso } from '../../personal/suggest';
import { Sheet, Section, Fold, Chip, ChipRow, LetterArea, MainButton, SmallButton, Note, RemoveBtn, ERRORS } from './kit';
import VoiceNote from './VoiceNote';

// ─────────────────────────────────────────────────────────────────
// Escribirle: lo fácil primero (sus preguntas si hay, nota rápida, una
// carta) y lo elaborado plegado (cuándo la abre, nota de voz, mensajes
// por situación).
// ─────────────────────────────────────────────────────────────────

// Para empezar a escribir sin la hoja en blanco.
const STARTERS = {
  carta: ['Hoy me acordé de ti porque…', 'Gracias por…', 'Quiero que sepas que…', 'Lo que más me gusta de ti es…'],
  respuesta: ['Me encantó lo que me mandaste…', 'Me sacaste una sonrisa enorme…', 'Yo también pienso en ti…'],
  extranes: ['Si estás leyendo esto es porque me extrañas. Yo también, muchísimo. Cierra los ojos y piensa en…'],
  triste: ['Si hoy fue un mal día, respira. Quiero recordarte que…', 'Los días feos también pasan. Mientras tanto, aquí va un abrazo…'],
  cumple: ['¡Feliz cumpleaños, {nombre}! Hoy celebro que existas…', 'Hoy es tu día y quiero que sepas que…'],
  aniversario: ['Feliz aniversario, {nombre}. Gracias por cada día juntos…', 'Otro año eligiéndote, y lo volvería a hacer…'],
  conocimos: ['¿Te acuerdas del día que nos conocimos? Yo sí…'],
};

const DAYS_OPTIONS = [3, 7, 14, 30];

// Medianoche local de un día 'AAAA-MM-DD' → ISO para open_at.
const openAtFor = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0).toISOString();
};
const addDays = (key, n) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};

// ── Nota rápida ─────────────────────────────────────────────────
function QuickNotes({ ctx }) {
  const [sent, setSent] = useState({});
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  async function go(text) {
    if (busy || sent[text]) return;
    setBusy(text); setError('');
    const r = await ctx.send({ kind: 'nota', text });
    setBusy(null);
    if (r.ok) setSent((s) => ({ ...s, [text]: true }));
    else setError(ERRORS[r.error] || ERRORS['sin-conexion']);
  }
  return (
    <>
      <ChipRow>
        {QUICK_NOTES.map((t) => (
          <Chip key={t} onClick={() => go(t)} active={!!sent[t]} color={C.sage} disabled={busy === t}>
            {sent[t] ? `✓ ${t}` : busy === t ? 'Enviando…' : t}
          </Chip>
        ))}
      </ChipRow>
      <Note tone="error">{error}</Note>
      {Object.keys(sent).length > 0 && <Note>¡Enviada! Le llega a {ctx.names.to} la próxima vez que abra a {ctx.names.pet}.</Note>}
    </>
  );
}

// ── Una carta (con foto y, si quieres, con fecha) ───────────────
function LetterComposer({ ctx, preset }) {
  const { names, r, profile } = ctx;
  const today = dayKey();
  const replyTo = preset && preset.replyTo != null ? (r.replies || []).find((x) => String(x.id) === String(preset.replyTo)) : null;
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [when, setWhen] = useState((preset && preset.when) || 'ahora'); // ahora | fecha | enDias | extranes | triste
  const [date, setDate] = useState((preset && preset.date) || addDays(today, 7));
  const [inDays, setInDays] = useState(7);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);
  const fileRef = useRef(null);
  const occasion = preset && preset.occasion;

  const starters = replyTo ? STARTERS.respuesta
    : when === 'extranes' || when === 'triste' ? STARTERS[when]
      : (when === 'fecha' && occasion && STARTERS[occasion]) || STARTERS.carta;
  const upcoming = upcomingDates(profile, today, 366).filter((d) => d.next.days > 0).slice(0, 4);

  async function pickPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setError('');
    try { setPhoto(await compressImageFile(f, 1080)); } catch (err) { setError('No pude abrir esa foto. Prueba con otra (JPG o PNG).'); }
  }

  async function sendIt() {
    if (!text.trim() || sending) return;
    let openAt = null;
    let openDay = null;
    const payload = {};
    if (when === 'fecha') {
      if (daysBetween(today, date) < 1) { setError('Elige un día a partir de mañana.'); return; }
      openDay = date;
    } else if (when === 'enDias') openDay = addDays(today, inDays);
    if (openDay) openAt = openAtFor(openDay);
    if (when === 'extranes' || when === 'triste') payload.cuando = when;
    if (replyTo) payload.re = replyTo.id;
    setSending(true); setError('');
    const res = await ctx.send({
      kind: replyTo ? 'respuesta' : 'carta', text: text.trim(), photo, openAt,
      payload: Object.keys(payload).length ? payload : undefined,
    });
    setSending(false);
    if (res.ok) {
      setSent({ openDay, when });
      setText(''); setPhoto(null);
    } else setError(ERRORS[res.error] || ERRORS['sin-conexion']);
  }

  if (sent) {
    const msg = sent.openDay
      ? `Queda guardada en el cofre de ${names.pet}, con cuenta regresiva. ${names.to} la puede abrir ${futureLabel(sent.openDay)}${daysBetween(today, sent.openDay) >= 14 ? '' : ` (${prettyDay(sent.openDay)})`}.`
      : sent.when === 'extranes' ? `${names.to} la va a encontrar en el cofre, para abrirla cuando te extrañe.`
        : sent.when === 'triste' ? `${names.to} la va a encontrar en el cofre, para abrirla un día difícil.`
          : `La próxima vez que ${names.to} abra a ${names.pet} va a sonar el timbre, y la carta estará en la puerta.`;
    return (
      <div style={{ textAlign: 'center', padding: '6px 4px' }}>
        <div className="pg-anim-pop" style={{ display: 'inline-block' }}><IconEnvelope size={40} color={C.rose} fill={C.roseSoft} /></div>
        <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, margin: '6px 0 4px', color: C.ink }}>¡Carta enviada!</div>
        <p style={{ fontSize: 13, color: C.inkSoft, margin: '0 0 12px', lineHeight: 1.4 }}>{msg}</p>
        <SmallButton onClick={() => { play('pop'); setSent(null); setWhen('ahora'); }}>Escribir otra</SmallButton>
      </div>
    );
  }

  return (
    <div>
      {replyTo && (
        <div style={{ padding: '9px 11px', borderRadius: 14, background: soft(C.lavender, 0.82), marginBottom: 10 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.ink }}>Le respondes a {replyTo.kind === 'foto' ? 'su foto' : 'su carta'} ({dayLabel(dayOfIso(replyTo.created_at))})</div>
          {replyTo.text && <div style={{ fontFamily: FONT.hand || FONT.body, fontSize: 16, color: C.ink, marginTop: 3, lineHeight: 1.3 }}>«{replyTo.text}»</div>}
        </div>
      )}
      <ChipRow style={{ marginBottom: 8 }}>
        {starters.map((s) => (
          <Chip key={s} onClick={() => { play('pop'); const f = fill(s, names).replace(/…$/, ' '); setText((t) => (t.trim() ? `${t.trimEnd()} ${f}` : f)); }} style={{ fontSize: 12, padding: '5px 10px', background: 'transparent' }}>
            {fill(s, names)}
          </Chip>
        ))}
      </ChipRow>
      <LetterArea value={text} onChange={setText} placeholder={`Hola, ${names.nombre}…`} label="Tu carta" />
      <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
      {photo ? (
        <div style={{ position: 'relative', margin: '6px 0 10px', borderRadius: 10, overflow: 'hidden', border: '5px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transform: 'rotate(-1.5deg)' }}>
          <img src={photo} alt="Foto para la carta" style={{ display: 'block', width: '100%', maxHeight: 240, objectFit: 'cover' }} />
          <button onClick={() => setPhoto(null)} aria-label="Quitar la foto" className="pg-focus" style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 999, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}>×</button>
        </div>
      ) : (
        <SmallButton onClick={() => fileRef.current && fileRef.current.click()} style={{ marginBottom: 10 }}>Agregar una foto</SmallButton>
      )}

      {!replyTo && (
        <Fold
          title="¿Cuándo la abre?"
          hint={when === 'ahora' ? 'Apenas le llegue. O guárdala para un día especial.' : when === 'fecha' ? `El ${prettyDay(date)}` : when === 'enDias' ? `Dentro de ${inDays} días` : LETTER_WHEN.find((w) => w.id === when).label}
          open={when !== 'ahora' ? true : undefined}
        >
          <ChipRow>
            <Chip active={when === 'ahora'} onClick={() => setWhen('ahora')} color={C.sage}>Apenas le llegue</Chip>
            {LETTER_WHEN.map((w) => <Chip key={w.id} active={when === w.id} onClick={() => setWhen(w.id)} color={C.amber}>{w.label}</Chip>)}
          </ChipRow>
          {when !== 'ahora' && <p style={{ fontSize: 12, color: C.inkSoft, margin: '8px 0 0' }}>{String((LETTER_WHEN.find((w) => w.id === when) || {}).hint || '').replace(/[.…]+$/, '')}. Mientras tanto la ve cerrada en el cofre de {names.pet}.</p>}
          {when === 'fecha' && (
            <div style={{ marginTop: 10 }}>
              {upcoming.length > 0 && (
                <ChipRow style={{ marginBottom: 8 }}>
                  {upcoming.map((d) => (
                    <Chip key={d.id} active={date === d.next.key} onClick={() => setDate(d.next.key)} color={C.rose} style={{ fontSize: 12 }}>
                      {dateName(d)} · {prettyDay(d.next.key)}
                    </Chip>
                  ))}
                </ChipRow>
              )}
              <input
                type="date" value={date} min={addDays(today, 1)} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Día en que se abre"
                className="pg-focus" style={{ fontFamily: FONT.display, fontSize: 15, padding: '9px 12px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink }}
              />
            </div>
          )}
          {when === 'enDias' && (
            <ChipRow style={{ marginTop: 10 }}>
              {DAYS_OPTIONS.map((n) => <Chip key={n} active={inDays === n} onClick={() => setInDays(n)} color={C.rose}>{n === 7 ? 'Una semana' : n === 14 ? 'Dos semanas' : n === 30 ? 'Un mes' : `${n} días`}</Chip>)}
            </ChipRow>
          )}
        </Fold>
      )}
      <Note tone="error">{error}</Note>
      <MainButton onClick={sendIt} disabled={!text.trim()} busy={sending} style={{ marginTop: 12 }}>
        {replyTo ? 'Mandar la respuesta' : when === 'ahora' ? 'Enviar la carta' : 'Guardarla en su cofre'}
      </MainButton>
    </div>
  );
}

// ── Mensajes por situación ──────────────────────────────────────
function Situations({ ctx, preset }) {
  const { profile, setProfile, names } = ctx;
  const [openId, setOpenId] = useState((preset && preset.situation) || null);
  const sits = profile.situations || {};
  const [shown] = useState(() => SITUATIONS.filter((s) => s.quick || (sits[s.id] || []).length || s.id === (preset && preset.situation)).map((s) => s.id));
  const [more, setMore] = useState(false);
  const hidden = SITUATIONS.filter((s) => !shown.includes(s.id));
  const setList = (id, list) => setProfile((p) => ({ ...p, situations: { ...(p.situations || {}), [id]: list } }));

  // Si llegó desde la sugerencia y está vacía, ya trae la primera idea.
  useEffect(() => {
    const s = preset && preset.situation && SITUATIONS.find((x) => x.id === preset.situation);
    if (s && !(sits[s.id] || []).length) setList(s.id, [s.examples[0]]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {SITUATIONS.filter((s) => more || shown.includes(s.id)).map((s) => {
        const list = (sits[s.id] || []).filter((t) => t != null);
        const open = openId === s.id;
        const nextIdea = (cur) => {
          const i = s.examples.indexOf(cur);
          const unused = s.examples.filter((e) => !list.includes(e));
          return i >= 0 ? s.examples[(i + 1) % s.examples.length] : (unused[0] || s.examples[0]);
        };
        return (
          <div key={s.id} style={{ borderRadius: 14, border: `1.5px solid ${open ? C.sky : C.lineSoft}`, background: open ? soft(C.sky, 0.9) : 'transparent' }}>
            <button
              onClick={() => { play('pop'); setOpenId(open ? null : s.id); }} aria-expanded={open} className="pg-focus"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: C.ink }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800 }}>{s.label}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: C.inkSoft }}>{s.when}</span>
              </span>
              <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: list.length ? C.sageDeep : C.inkFaint }}>
                {list.length ? `${list.length} ${list.length === 1 ? 'mensaje' : 'mensajes'}` : 'Sin mensaje'}
              </span>
            </button>
            {open && (
              <div style={{ padding: '0 11px 11px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Todavía no tiene. Elige una idea y cámbiala si quieres.</p>}
                {list.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <textarea
                        value={fill(t, names)} rows={2} aria-label={`Mensaje ${i + 1} de ${s.label}`} className="pg-focus"
                        onChange={(e) => setList(s.id, list.map((x, j) => (j === i ? e.target.value.slice(0, 200) : x)))}
                        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: FONT.hand || FONT.body, fontSize: 16, lineHeight: 1.3, padding: '7px 10px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink }}
                      />
                      <button onClick={() => { play('pop'); setList(s.id, list.map((x, j) => (j === i ? nextIdea(x) : x))); }} className="pg-focus" style={{ background: 'none', border: 'none', color: C.sky, fontFamily: FONT.display, fontWeight: 800, fontSize: 12, cursor: 'pointer', padding: '3px 2px' }}>
                        ↻ Otra idea
                      </button>
                    </div>
                    <RemoveBtn onClick={() => setList(s.id, list.filter((_, j) => j !== i))} label="Quitar este mensaje" />
                  </div>
                ))}
                {list.length < 4 && (
                  <SmallButton onClick={() => { play('pop'); setList(s.id, [...list, s.examples.find((e) => !list.includes(e)) || '']); }} style={{ alignSelf: 'flex-start' }}>
                    {list.length ? '+ Otro mensaje' : '+ Usar una idea'}
                  </SmallButton>
                )}
                {list.length > 1 && <p style={{ fontSize: 11.5, color: C.inkFaint, margin: 0 }}>{names.pet} elige uno distinto cada vez.</p>}
              </div>
            )}
          </div>
        );
      })}
      {!more && hidden.length > 0 && (
        <SmallButton onClick={() => { play('pop'); setMore(true); }} style={{ alignSelf: 'flex-start' }}>
          Más momentos: {hidden.map((s) => s.label.toLowerCase()).slice(0, 2).join(', ')}…
        </SmallButton>
      )}
      <p style={{ fontSize: 11.5, color: C.inkFaint, margin: '4px 0 0' }}>Se guarda solo. {names.pet} lo dice con una marca de que viene de ti.</p>
    </div>
  );
}

// ── Sus preguntas ───────────────────────────────────────────────
function QuestionCard({ ctx, q }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function answer() {
    if (!text.trim() || busy) return;
    setBusy(true); setError('');
    const r = await answerReply(ctx.slug, q.id, { answer: text.trim() }, ctx.auth);
    setBusy(false);
    if (r) { play('win'); ctx.updateReply(r); } else { play('bad'); setError(ERRORS['sin-conexion']); }
  }
  return (
    <div style={{ padding: 11, borderRadius: 14, background: soft(C.lavender, 0.85), display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>{ctx.names.to} te preguntó {dayLabel(dayOfIso(q.created_at))}</div>
        <div style={{ fontFamily: FONT.hand || FONT.body, fontSize: 18, color: C.ink, lineHeight: 1.3, marginTop: 2 }}>«{q.text}»</div>
      </div>
      <LetterArea value={text} onChange={setText} rows={3} max={600} placeholder="Tu respuesta…" label="Tu respuesta" />
      <Note tone="error">{error}</Note>
      <MainButton onClick={answer} disabled={!text.trim()} busy={busy} style={{ padding: 10, fontSize: 14 }}>Responder</MainButton>
    </div>
  );
}

export default function WriteSheet({ ctx, focus, preset, onClose }) {
  const { r, names } = ctx;
  const pending = (r.replies || []).filter((x) => x.kind === 'pregunta' && !x.answer).slice().reverse();
  const answered = (r.replies || []).filter((x) => x.kind === 'pregunta' && x.answer);

  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`rc-${focus}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(t);
  }, [focus]);

  return (
    <Sheet title={`Escribirle a ${names.to}`} subtitle={`Todo le llega a través de ${names.pet}`} icon={IconEnvelope} color={C.rose} onClose={onClose} status={ctx.saveStatus}>
      {pending.length > 0 && (
        <Section id="rc-preguntas" title={pending.length > 1 ? `Te hizo ${pending.length} preguntas` : 'Te hizo una pregunta'} hint="Desde el tablero del juego. Tu respuesta se la cuenta su mascota." highlight={focus === 'preguntas'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map((q) => <QuestionCard key={q.id} ctx={ctx} q={q} />)}
          </div>
        </Section>
      )}
      <Section id="rc-rapida" title="Una nota rápida" hint="Un toque y se la manda." highlight={focus === 'rapida'}>
        <QuickNotes ctx={ctx} />
      </Section>
      <Section id="rc-carta" title={preset && preset.replyTo != null ? 'Respóndele' : 'Una carta'} hint={preset && preset.replyTo != null ? null : `Con foto si quieres. Llega en una cajita a la puerta del cuarto de ${names.pet}.`} highlight={focus === 'carta' && !!preset && Object.keys(preset).length > 0}>
        <LetterComposer ctx={ctx} preset={preset} key={JSON.stringify(preset || {})} />
      </Section>
      <Fold id="rc-voz" title="Una nota de voz" hint="Que escuche tu voz. Hasta un minuto." icon={IconHeart} color={C.rose} open={focus === 'voz' ? true : undefined}>
        <VoiceNote ctx={ctx} />
      </Fold>
      <Fold
        id="rc-situaciones" title="Mensajes por situación" icon={IconHeart} color={C.sky}
        hint={`Lo que ${names.pet} le dice de tu parte si está triste, si llueve, antes de dormir…`}
        open={focus === 'situaciones' ? true : undefined}
      >
        <Situations ctx={ctx} preset={preset} />
      </Fold>
      {answered.length > 0 && (
        <Fold title="Preguntas que ya respondiste" badge={answered.length}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {answered.map((q) => (
              <div key={q.id} style={{ fontSize: 13, color: C.ink, lineHeight: 1.35 }}>
                <div style={{ fontWeight: 700 }}>«{q.text}»</div>
                <div style={{ color: C.inkSoft, fontFamily: FONT.hand || FONT.body, fontSize: 16 }}>{q.answer}</div>
              </div>
            ))}
          </div>
        </Fold>
      )}
      {pending.length === 0 && (
        <p style={{ fontSize: 12, color: C.inkFaint, textAlign: 'center', margin: '2px 8px 0' }}>Cuando {names.to} te haga una pregunta desde el tablero del juego, aparece aquí arriba.</p>
      )}
    </Sheet>
  );
}
