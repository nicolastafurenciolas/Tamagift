import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { C, FONT } from '../theme';
import { useStyle } from '../styles/StyleContext';
import { isStyleId, DEFAULT_STYLE } from '../styles/registry';
import { loadPet, checkMailbox, sendLetter, fetchLetters, getOwnerToken, saveOwnerToken } from '../api';
import { lookOf } from '../petLook';
import { compressImageFile } from '../imageCompress';
import PetArt from '../components/PetArt';
import { IconEnvelope, IconHeart } from '../components/icons';
import { play } from '../sound';

// ─────────────────────────────────────────────────────────────────
// El buzón: quien regaló le escribe cartas (y fotos) a quien recibe,
// cuando quiera, después de crear el regalo. Le llegan en una cajita a
// la puerta del cuarto (ver TamagiftGame: cartas nuevas → pedido).
//
// Entra con el link privado que recibió al crear el regalo (?t=…) o con
// la llave de acceso con que lo compró.
// ─────────────────────────────────────────────────────────────────

const MAX = 600;
const ERRORS = {
  'sin-permiso': 'Esa llave no abre este buzón. Revisa que sea la del regalo.',
  'muchas-cartas': 'Hoy ya mandaste muchas cartas. Mañana puedes mandar más.',
  'muy-pesada': 'La foto es muy pesada. Prueba con otra.',
  'sin-conexion': 'No hay conexión con el servidor. Intenta de nuevo en un rato.',
};

function Card({ children, style }) {
  return <div className="pg-card" style={{ padding: 16, width: '100%', boxSizing: 'border-box', ...style }}>{children}</div>;
}

const fmtDate = (iso) => {
  if (!iso) return '';
  try { return new Date(`${iso}Z`).toLocaleDateString('es', { day: 'numeric', month: 'long' }); } catch (e) { return ''; }
};

export default function MailboxPage() {
  const { slug } = useParams();
  const { setStyleId } = useStyle();
  const [pet, setPet] = useState(null);
  const [state, setState] = useState('cargando'); // cargando | llave | listo | no-existe | error
  const [auth, setAuth] = useState({});
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState('');
  const [letters, setLetters] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { pet: p, mode } = await loadPet(slug);
      if (!alive) return;
      if (!p) { setState(mode === 'missing' ? 'no-existe' : 'error'); return; }
      setPet(p);
      if (isStyleId(p.app_style)) setStyleId(p.app_style); else setStyleId(DEFAULT_STYLE);
      document.title = `Buzón de ${p.name}`;
      // la llave: la del link (se recuerda en este dispositivo) o la guardada
      const urlToken = new URLSearchParams(window.location.search).get('t');
      if (urlToken) saveOwnerToken(slug, urlToken);
      const token = urlToken || getOwnerToken(slug);
      if (token && (await checkMailbox(slug, { token })) === 'ok') {
        if (!alive) return;
        setAuth({ token });
        setState('listo');
      } else if (alive) setState('llave');
      const list = await fetchLetters(slug, 0);
      if (alive && list) setLetters(list.slice().reverse());
    })();
    return () => { alive = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function tryKey() {
    setKeyError('');
    const r = await checkMailbox(slug, { access_key: keyInput });
    if (r === 'ok') { play('coin'); setAuth({ accessKey: keyInput }); setState('listo'); }
    else setKeyError(r === 'no' ? ERRORS['sin-permiso'] : ERRORS['sin-conexion']);
  }

  async function pickPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setPhotoError('');
    try { setPhoto(await compressImageFile(f, 1080)); } catch (err) { setPhotoError('No pude abrir esa foto. Prueba con otra (JPG o PNG).'); }
  }

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true); setError('');
    const r = await sendLetter(slug, { text: text.trim(), photo, token: auth.token, accessKey: auth.accessKey });
    setSending(false);
    if (r.ok) {
      play('win');
      setSent(r.letter);
      setLetters((l) => [r.letter, ...l]);
      setText(''); setPhoto(null);
    } else {
      play('bad');
      setError(ERRORS[r.error] || ERRORS['sin-conexion']);
    }
  }

  const look = pet ? lookOf(pet) : null;
  const to = (pet && pet.recipient_name) || 'tu persona especial';

  return (
    <div className="w-full min-h-full flex flex-col items-center" style={{ color: C.ink, padding: '24px 16px 40px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {state === 'cargando' && <p style={{ fontFamily: FONT.display, color: C.inkSoft, marginTop: 60 }}>Abriendo el buzón…</p>}
        {(state === 'no-existe' || state === 'error') && (
          <Card style={{ textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, margin: '0 0 6px' }}>{state === 'no-existe' ? 'Este buzón no existe' : 'No se pudo abrir el buzón'}</h1>
            <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>{state === 'no-existe' ? 'Revisa que el link esté completo.' : ERRORS['sin-conexion']}</p>
          </Card>
        )}

        {pet && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <div style={{ width: 84, height: 84, flexShrink: 0 }}>{look && <PetArt look={look} mood="feliz" size={84} />}</div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>Buzón de {pet.name}</h1>
                <p style={{ fontSize: 13, color: C.inkSoft, margin: '4px 0 0', lineHeight: 1.35 }}>Escríbele a {to}. La carta le llega en una cajita a la puerta del cuarto de {pet.name}.</p>
              </div>
            </div>

            {state === 'llave' && (
              <Card>
                <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>¿Eres quien regaló a {pet.name}?</div>
                <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 10px', lineHeight: 1.4 }}>Abre el link del buzón que te dimos al crear el regalo, o escribe la llave de acceso con que lo compraste.</p>
                <input
                  value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="TAMA-XXXXX-XXXXX-XXXXX-XXXXX" aria-label="Llave de acceso" className="pg-focus"
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT.display, fontSize: 14, padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, textTransform: 'uppercase' }}
                />
                {keyError && <p style={{ fontSize: 12, color: C.rose, margin: '6px 0 0' }}>{keyError}</p>}
                <button onClick={tryKey} disabled={!keyInput.trim()} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 10, width: '100%', padding: 12, fontSize: 14 }}>Abrir el buzón</button>
              </Card>
            )}

            {state === 'listo' && (sent ? (
              <Card style={{ textAlign: 'center', borderColor: C.sage }}>
                <div className="pg-anim-pop" style={{ display: 'inline-block' }}><IconEnvelope size={38} color={C.rose} /></div>
                <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, margin: '6px 0 4px' }}>¡Carta enviada!</div>
                <p style={{ fontSize: 13, color: C.inkSoft, margin: '0 0 12px', lineHeight: 1.4 }}>La próxima vez que {to} abra a {pet.name} va a sonar el timbre, y la carta estará en la puerta.</p>
                <button onClick={() => { play('pop'); setSent(null); }} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '10px 24px', fontSize: 14 }}>Escribir otra</button>
              </Card>
            ) : (
              <Card>
                <textarea
                  value={text} onChange={(e) => setText(e.target.value.slice(0, MAX))} rows={6} placeholder={`Hola, ${to}…`} aria-label="Tu carta" className="pg-focus"
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: FONT.hand || FONT.body, fontSize: 18, lineHeight: 1.4, padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: '#FFFBF3', color: C.ink }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 10px' }}>
                  <button onClick={() => fileRef.current && fileRef.current.click()} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '7px 12px', fontSize: 12.5 }}>{photo ? 'Cambiar foto' : 'Agregar una foto'}</button>
                  <span style={{ fontSize: 11.5, color: text.length > MAX - 40 ? C.rose : C.inkFaint }}>{text.length}/{MAX}</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
                {photoError && <p style={{ fontSize: 12, color: C.rose, margin: '0 0 8px' }}>{photoError}</p>}
                {photo && (
                  <div style={{ position: 'relative', marginBottom: 10, borderRadius: 10, overflow: 'hidden', border: '5px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transform: 'rotate(-1.5deg)' }}>
                    <img src={photo} alt="Foto para la carta" style={{ display: 'block', width: '100%', maxHeight: 260, objectFit: 'cover' }} />
                    <button onClick={() => setPhoto(null)} aria-label="Quitar la foto" className="pg-focus" style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 999, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}>×</button>
                  </div>
                )}
                {error && <p style={{ fontSize: 12.5, color: C.rose, margin: '0 0 8px' }}>{error}</p>}
                <button onClick={send} disabled={!text.trim() || sending} className="pg-btn pg-btn-rose pg-focus" style={{ width: '100%', padding: 13, fontSize: 15, opacity: !text.trim() || sending ? 0.6 : 1 }}>
                  {sending ? 'Enviando…' : 'Enviar la carta'}
                </button>
              </Card>
            ))}

            {letters.length > 0 && state === 'listo' && (
              <div style={{ width: '100%' }}>
                <p style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.inkSoft, margin: '6px 0 8px' }}>Cartas que ya mandaste</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {letters.map((l) => (
                    <div key={l.id} className="pg-card" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <IconHeart size={16} color={C.rose} fill={C.roseSoft} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{l.text}</div>
                        <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 3 }}>{fmtDate(l.created_at)}{l.has_photo ? ' · con foto' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
