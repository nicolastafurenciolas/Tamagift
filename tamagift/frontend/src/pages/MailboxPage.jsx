import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { C, FONT } from '../theme';
import { useStyle } from '../styles/StyleContext';
import { isStyleId, DEFAULT_STYLE } from '../styles/registry';
import { loadPet, fetchRincon, sendLetter, saveProfile, getOwnerToken, saveOwnerToken } from '../api';
import { lookOf, parseRecipe } from '../petLook';
import PetArt from '../components/PetArt';
import { ActionButton } from '../components/ui';
import { IconEnvelope, IconGift, IconFrame, IconHeart, IconPaw, IconCamera } from '../components/icons';
import { AlbumGrid } from '../components/game/Album';
import { play } from '../sound';
import { callName } from '../personal/catalog';
import { suggestions, happenings, dayKey } from '../personal/suggest';
import { SuggestionCard, Happenings, ReplyViewer, SentHistory } from '../components/rincon/Now';
import { Fold, ERRORS } from '../components/rincon/kit';
import WriteSheet from '../components/rincon/WriteSheet';
import GiftSheet from '../components/rincon/GiftSheet';
import RememberSheet from '../components/rincon/RememberSheet';
import AboutSheet from '../components/rincon/AboutSheet';
import MochiSheet from '../components/rincon/MochiSheet';

// ─────────────────────────────────────────────────────────────────
// El rincón de quien regala (antes "el buzón"). Ver
// PLAN_REGALO_VIVO.md §3:
//   · arriba, UNA tarjeta con lo más oportuno ahora (personal/suggest.js);
//   · debajo, lo que pasó (lo que tu pareja abrió, canjeó o mandó);
//   · y cinco verbos, cada uno con su hoja: Escribirle, Regalarle,
//     Recordar, Sobre ella/él y Tu mochi.
// Más abajo, plegados: las fotos que toma su pareja y lo que ya le
// mandaste.
//
// Se entra con el link privado que se recibió al crear el regalo (?t=…,
// queda guardado en este dispositivo) o con la llave de acceso con que
// se compró. Todo se carga de una vez con fetchRincon.
// ─────────────────────────────────────────────────────────────────

const SAVE_DELAY = 700;

function Card({ children, style }) {
  return <div className="pg-card" style={{ padding: 16, width: '100%', boxSizing: 'border-box', ...style }}>{children}</div>;
}

const skipKey = (slug) => `tamagift:rincon-skip:${slug}:${dayKey()}`;
const readSkips = (slug) => { try { return JSON.parse(localStorage.getItem(skipKey(slug)) || '[]'); } catch (e) { return []; } };
const writeSkips = (slug, list) => { try { localStorage.setItem(skipKey(slug), JSON.stringify(list)); } catch (e) { /* no es grave */ } };

export default function MailboxPage() {
  const { slug } = useParams();
  const { setStyleId } = useStyle();
  const [pet, setPet] = useState(null);
  const [state, setState] = useState('cargando'); // cargando | llave | listo | no-existe | error
  const [auth, setAuth] = useState({});
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [keyBusy, setKeyBusy] = useState(false);
  const [r, setR] = useState(null);
  const [profile, setProfileState] = useState({});
  const [saveState, setSaveState] = useState('idle'); // idle | pendiente | guardando | guardado | error
  const [sheet, setSheet] = useState(null); // { sheet, focus, preset }
  const [viewing, setViewing] = useState(null);
  const [skips, setSkips] = useState(() => readSkips(slug));
  const profileRef = useRef({});
  const authRef = useRef({});
  const timer = useRef(null);
  const saving = useRef(Promise.resolve());

  // ── Entrada ──────────────────────────────────────────────────────
  const enter = useCallback(async (a) => {
    const res = await fetchRincon(slug, a);
    if (res.error) return res.error;
    authRef.current = a;
    setAuth(a);
    profileRef.current = res.profile || {};
    setProfileState(res.profile || {});
    setR(res);
    if (isStyleId(res.app_style)) setStyleId(res.app_style);
    setState('listo');
    return 'ok';
  }, [slug, setStyleId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { pet: p, mode } = await loadPet(slug);
      if (!alive) return;
      if (!p) { setState(mode === 'missing' ? 'no-existe' : 'error'); return; }
      setPet(p);
      if (isStyleId(p.app_style)) setStyleId(p.app_style); else setStyleId(DEFAULT_STYLE);
      document.title = `Tu rincón · ${p.name}`;
      const urlToken = new URLSearchParams(window.location.search).get('t');
      if (urlToken) saveOwnerToken(slug, urlToken);
      const token = urlToken || getOwnerToken(slug);
      const res = token ? await enter({ token }) : 'sin-permiso';
      if (!alive) return;
      if (res === 'sin-conexion') setState('error');
      else if (res !== 'ok') setState('llave');
    })();
    return () => { alive = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function tryKey() {
    setKeyError(''); setKeyBusy(true);
    const res = await enter({ accessKey: keyInput.trim() });
    setKeyBusy(false);
    if (res === 'ok') play('coin');
    else setKeyError(res === 'sin-permiso' ? ERRORS['sin-permiso'] : ERRORS['sin-conexion']);
  }

  // ── La ficha: se guarda sola (entera, sin pisar lo que no se edita) ─
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    saving.current = saving.current.then(async () => {
      setSaveState('guardando');
      const ok = await saveProfile(slug, profileRef.current, authRef.current);
      setSaveState(ok === true ? 'guardado' : 'error');
      if (ok !== true && ok !== 'sin-permiso') timer.current = setTimeout(flush, 4000);
    });
    return saving.current;
  }, [slug]);

  const setProfile = useCallback((updater, { now = false } = {}) => {
    const next = typeof updater === 'function' ? updater(profileRef.current) : { ...profileRef.current, ...updater };
    profileRef.current = next;
    setProfileState(next);
    setR((x) => (x ? { ...x, profile: next } : x));
    setSaveState('pendiente');
    clearTimeout(timer.current);
    if (now) flush(); else timer.current = setTimeout(flush, SAVE_DELAY);
  }, [flush]);

  useEffect(() => {
    if (saveState !== 'guardado') return undefined;
    const t = setTimeout(() => setSaveState('idle'), 2400);
    return () => clearTimeout(t);
  }, [saveState]);

  useEffect(() => {
    const onHide = () => { if (timer.current) flush(); };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => { window.removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onHide); };
  }, [flush]);

  // ── Mandar algo ──────────────────────────────────────────────────
  const send = useCallback(async (opts) => {
    const res = await sendLetter(slug, { ...opts, token: authRef.current.token, accessKey: authRef.current.accessKey });
    if (res.ok) {
      play('win');
      setR((x) => (x ? { ...x, letters: [res.letter, ...(x.letters || [])] } : x));
    } else play('bad');
    return res;
  }, [slug]);

  const updateReply = useCallback((reply) => {
    setR((x) => (x ? { ...x, replies: (x.replies || []).map((y) => (y.id === reply.id ? { ...y, ...reply, seen: y.seen } : y)) } : x));
  }, []);

  // ── Hojas (el botón atrás del celular las cierra) ────────────────
  const openSheet = useCallback((action) => {
    if (!action) return;
    setViewing(null);
    setSheet(action);
    try { window.history.pushState({ rcSheet: true }, ''); } catch (e) { /* nada */ }
  }, []);
  const closeSheet = useCallback(() => {
    if (timer.current) flush();
    setSheet(null);
    try { if (window.history.state && window.history.state.rcSheet) window.history.back(); } catch (e) { /* nada */ }
  }, [flush]);
  useEffect(() => {
    const onPop = () => { if (timer.current) flush(); setSheet(null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [flush]);

  // ── Lo que se muestra ────────────────────────────────────────────
  const today = dayKey();
  const seed = useMemo(() => [...String(slug)].reduce((a, c) => a + c.charCodeAt(0), 0), [slug]);
  const ideas = useMemo(() => (r ? suggestions(r, { today, seed }) : []), [r, today, seed]);
  const visible = ideas.filter((s) => !skips.includes(s.id));
  const current = visible[0] || ideas[ideas.length - 1] || null;
  const items = useMemo(() => (r ? happenings(r, today) : []), [r, today]);

  function skip() {
    if (!current) return;
    const next = [...skips, current.id];
    setSkips(next.length >= ideas.length ? [] : next);
    writeSkips(slug, next.length >= ideas.length ? [] : next);
  }

  const look = r && parseRecipe(r.recipe) ? { recipe: parseRecipe(r.recipe) } : pet ? lookOf(pet) : null;
  const petName = (r && r.name) || (pet && pet.name) || '';
  const to = (r && r.recipient_name) || (pet && pet.recipient_name) || 'tu persona especial';
  const yo = (r && r.creator_name) || (pet && pet.creator_name) || '';
  const names = { to, pet: petName, yo, nombre: callName({ recipient_name: to }, profile) || to };
  const saveStatus = saveState === 'guardando' || saveState === 'pendiente' ? 'Guardando…' : saveState === 'guardado' ? 'Guardado ✓' : saveState === 'error' ? 'No se pudo guardar, reintentando…' : null;
  const ctx = { slug, auth, r, profile, setProfile, flush, names, send, updateReply, saveStatus };

  const pendingQ = r ? (r.replies || []).filter((x) => x.kind === 'pregunta' && !x.answer).length : 0;
  const pendingC = r ? (r.replies || []).filter((x) => x.kind === 'canje' && !x.done).length : 0;

  const verbs = [
    { id: 'escribir', label: 'Escribirle', icon: IconEnvelope, color: C.rose, badge: pendingQ ? C.rose : null },
    { id: 'regalar', label: 'Regalarle', icon: IconGift, color: C.sage, badge: pendingC ? C.amber : null },
    { id: 'recordar', label: 'Recordar', icon: IconFrame, color: C.amber },
    { id: 'sobre', label: `Sobre ${callName({ recipient_name: to }, {}) || 'su vida'}`, icon: IconHeart, color: C.lavender },
    { id: 'mochi', label: 'Tu mochi', icon: IconPaw, color: C.sky },
  ];

  function openHappening(h) {
    if (h.kind === 'carta' || h.kind === 'foto' || h.kind === 'pregunta' || h.kind === 'canje') setViewing(h.ref);
  }
  function answerViewing() {
    const x = viewing;
    if (!x) return;
    if (x.kind === 'pregunta') openSheet({ sheet: 'escribir', focus: 'preguntas' });
    else if (x.kind === 'canje') openSheet({ sheet: 'regalar', focus: 'cupones' });
    else openSheet({ sheet: 'escribir', focus: 'carta', preset: { replyTo: x.id } });
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center" style={{ color: C.ink, padding: '20px 16px 48px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {state === 'cargando' && <p style={{ fontFamily: FONT.display, color: C.inkSoft, marginTop: 60 }}>Abriendo tu rincón…</p>}
        {(state === 'no-existe' || state === 'error') && (
          <Card style={{ textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, margin: '0 0 6px' }}>{state === 'no-existe' ? 'Este rincón no existe' : 'No se pudo abrir tu rincón'}</h1>
            <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>{state === 'no-existe' ? 'Revisa que el link esté completo.' : ERRORS['sin-conexion']}</p>
            {state === 'error' && <button onClick={() => window.location.reload()} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 12, padding: '10px 22px', fontSize: 14 }}>Reintentar</button>}
          </Card>
        )}

        {pet && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ width: 76, height: 76, flexShrink: 0 }}>{look && <PetArt look={look} mood="feliz" size={76} />}</div>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ color: C.rose, textTransform: 'none', letterSpacing: '0.04em', fontSize: 12.5 }}>Tu rincón</div>
              <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, margin: '2px 0 0', lineHeight: 1.1 }}>{yo ? `Hola, ${yo}` : `El rincón de ${petName}`}</h1>
              <p style={{ fontSize: 13, color: C.inkSoft, margin: '4px 0 0', lineHeight: 1.35 }}>Todo lo que mandes le llega a {to} a través de {petName}.</p>
            </div>
          </div>
        )}

        {pet && state === 'llave' && (
          <Card>
            <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>¿Eres quien regaló a {pet.name}?</div>
            <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 10px', lineHeight: 1.4 }}>Abre el link de tu rincón que te dimos al crear el regalo, o escribe la llave de acceso con que lo compraste.</p>
            <input
              value={keyInput} onChange={(e) => setKeyInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && keyInput.trim()) tryKey(); }}
              placeholder="TAMA-XXXXX-XXXXX-XXXXX-XXXXX" aria-label="Llave de acceso" className="pg-focus"
              style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT.display, fontSize: 14, padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, textTransform: 'uppercase' }}
            />
            {keyError && <p style={{ fontSize: 12, color: C.rose, margin: '6px 0 0' }}>{keyError}</p>}
            <button onClick={tryKey} disabled={!keyInput.trim() || keyBusy} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 10, width: '100%', padding: 12, fontSize: 14 }}>{keyBusy ? 'Abriendo…' : 'Abrir mi rincón'}</button>
          </Card>
        )}

        {state === 'listo' && r && (
          <>
            <SuggestionCard
              s={current} canSkip={ideas.length > 1}
              onAction={openSheet} onSkip={skip}
              onQuick={async (text) => (await send({ kind: 'nota', text })).ok}
            />

            <Happenings r={r} items={items} names={names} onOpen={openHappening} />

            <div style={{ width: '100%' }}>
              <h2 style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink, margin: '4px 2px 10px' }}>¿Qué quieres hacer?</h2>
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                {verbs.map((v) => (
                  <ActionButton key={v.id} icon={v.icon} label={v.label} color={v.color} badge={v.badge} onClick={() => { play('pop'); openSheet({ sheet: v.id }); }} />
                ))}
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              <Fold title={`Fotos de ${petName}`} hint={`Las que ${to} le toma con la cámara del cuarto`} icon={IconCamera} color={C.sky}>
                <AlbumGrid slug={slug} petName={petName} readOnly empty={`Cuando ${to} le tome fotos a ${petName} con la cámara del cuarto, aparecen aquí.`} />
              </Fold>
              {(r.letters || []).length > 0 && (
                <Fold title="Lo que ya le mandaste" hint="Y si ya lo abrió" icon={IconEnvelope} color={C.rose} badge={(r.letters || []).length}>
                  <SentHistory r={r} />
                </Fold>
              )}
            </div>
          </>
        )}
      </div>

      {viewing && <ReplyViewer slug={slug} reply={viewing} names={names} onClose={() => setViewing(null)} onAnswer={answerViewing} />}
      {sheet && r && sheet.sheet === 'escribir' && <WriteSheet ctx={ctx} focus={sheet.focus} preset={sheet.preset} onClose={closeSheet} />}
      {sheet && r && sheet.sheet === 'regalar' && <GiftSheet ctx={ctx} focus={sheet.focus} onClose={closeSheet} />}
      {sheet && r && sheet.sheet === 'recordar' && <RememberSheet ctx={ctx} focus={sheet.focus} onClose={closeSheet} />}
      {sheet && r && sheet.sheet === 'sobre' && <AboutSheet ctx={ctx} focus={sheet.focus} onClose={closeSheet} />}
      {sheet && r && sheet.sheet === 'mochi' && <MochiSheet ctx={ctx} onClose={closeSheet} />}
    </div>
  );
}
