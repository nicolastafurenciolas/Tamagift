import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, FONT, SHADOW, DRAW_COLORS, tint } from '../theme';
import { IconGift, IconSparkle, IconClose, IconBack, IconCamera, IconPencil } from './icons';
import { createPet, accessKeyRequired, checkAccessKey, AccessKeyError } from '../api';
import { toEmbedUrl, providerLabel } from '../embed';
import { DEFAULT_RECIPE, PetRecipeMarkup, recipeToPngDataUrl } from '../PetRecipe';
import BgRemover from './BgRemover';
import { isTestKey, buildTestPet, testGameState } from '../testSeed';
import { checkYouTubeEmbeddable, youtubeIdFromEmbed } from '../ytCheck';
import { musicErrorText } from './MusicBar';
import { ModularPetStep, useDesignerState } from './PetDesigner';

const CANVAS_SIZE = 320;

const MOODS = [
  { id: 'normal', label: 'Normal', emoji: '🙂' },
  { id: 'feliz', label: 'Feliz', emoji: '😊' },
  { id: 'enojado', label: 'Enojado', emoji: '😤' },
];

const STEP_META = [
  { id: 'bienvenida', label: 'Inicio' },
  { id: 'nombres', label: 'Nombres' },
  { id: 'dibujar', label: 'Dibujar' },
  { id: 'comidas', label: 'Comidas' },
  { id: 'frases', label: 'Frases' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'musica', label: 'Música' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'deco', label: 'Deco' },
  { id: 'juegos', label: 'Juegos' },
  { id: 'resumen', label: 'Resumen' },
];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Mínimo de fotos por uso (pósters / rompecabezas) exigido en el paso de Fotos.
const PHOTO_MIN = 3;

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

// ── Primitivas de UI ──────────────────────────────────────────────
function StepShell({ title, subtitle, children }) {
  return (
    <div style={{ width: '100%', maxWidth: 430, margin: '0 auto' }}>
      {title && <h2 style={{ fontFamily: FONT.display, fontSize: 21, fontWeight: 800, marginBottom: 5, textAlign: 'center' }}>{title}</h2>}
      {subtitle && <p style={{ fontSize: 13, color: C.inkSoft, textAlign: 'center', marginBottom: 20 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Chip({ active, onClick, children, color }) {
  const c = color || C.rose;
  return (
    <button
      onClick={onClick}
      className="pg-focus"
      style={{
        fontFamily: FONT.display, padding: '7px 15px', borderRadius: 999, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
        background: active ? c : C.surface, color: active ? '#fff' : C.ink,
        border: `1.5px solid ${active ? c : C.line}`,
        boxShadow: active ? `0 3px 0 ${tint(c, -0.001) === c ? c : c}` : `0 2px 0 ${C.line}`,
        transition: 'transform 0.1s',
      }}
    >
      {children}
    </button>
  );
}

function TextField({ label, value, onChange, placeholder, multiline }) {
  const shared = {
    width: '100%', padding: '11px 14px', borderRadius: 14, fontSize: 14, color: C.ink,
    border: `1.5px solid ${C.line}`, background: C.surface, fontFamily: FONT.body,
    outline: 'none', boxShadow: 'inset 0 1px 3px rgba(120,80,55,0.06)',
  };
  return (
    <div style={{ marginBottom: 14, width: '100%' }}>
      {label && <label style={{ display: 'block', fontFamily: FONT.display, fontSize: 12, fontWeight: 700, marginBottom: 6, color: C.inkSoft }}>{label}</label>}
      {multiline ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={2} className="pg-focus" style={{ ...shared, resize: 'vertical' }} />
      ) : (
        <input value={value} onChange={onChange} placeholder={placeholder} className="pg-focus" style={shared} />
      )}
    </div>
  );
}

function ItemCard({ onDelete, children, accent }) {
  return (
    <div className="pg-card pg-anim-rise" style={{ width: '100%', padding: 13, marginBottom: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, borderColor: accent || C.line, borderRadius: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      <button onClick={onDelete} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkFaint, flexShrink: 0 }}><IconClose size={16} /></button>
    </div>
  );
}

function AddButton({ onClick, color, children }) {
  const c = color || C.rose;
  return (
    <button onClick={onClick} className="pg-btn pg-focus" style={{ width: '100%', padding: '11px', fontSize: 14, background: c, color: '#fff', boxShadow: `0 4px 0 ${c === C.rose ? C.roseDeep : c === C.sage ? '#5E8873' : '#B98A1E'}` }}>
      {children}
    </button>
  );
}

// ── Paso: Bienvenida ──────────────────────────────────────────────
function WelcomeStep({ onTestKey, testState, keyRequired, accessKey, setAccessKey, keyState }) {
  const [key, setKey] = useState('');
  const wrong = key.length > 0 && !isTestKey(key);

  return (
    <StepShell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', animation: 'pg-breathe 2.6s ease-in-out infinite', marginBottom: 8 }}>
          <IconGift size={72} color={C.rose} fill={C.roseSoft} stroke={2.2} />
        </div>
        <h2 style={{ fontFamily: FONT.display, fontSize: 23, fontWeight: 800, marginBottom: 12 }}>Vas a crear un regalo único</h2>
        <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.6, marginBottom: 10 }}>
          En los próximos pasos vas a <b>dibujar su mascota</b> en 3 ánimos y darle sus comidas favoritas, frases, fotos y música.
        </p>
        <p style={{ fontFamily: FONT.hand, fontSize: 20, color: C.sage, lineHeight: 1.3 }}>Puedes ir y volver entre pasos cuando quieras — nada se pierde.</p>
      </div>

      {/* Llave de acceso: la puerta. Sin ella no se puede avanzar. */}
      {keyRequired && (
        <div className="pg-card" style={{ marginTop: 22, padding: 16, border: `2px solid ${keyState === 'ok' ? C.sage : C.line}` }}>
          <p style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
            Tu llave de acceso
          </p>
          <p style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 11, lineHeight: 1.45 }}>
            Escribe la llave que recibiste al comprar. Sirve para crear <b>una</b> mascota.
          </p>
          <input
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="TAMA-XXXXX-XXXXX-XXXXX-XXXXX"
            aria-label="Llave de acceso"
            className="pg-input pg-focus"
            style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          />
          <div style={{ minHeight: 20, marginTop: 7 }}>
            {keyState === 'checking' && <span style={{ fontSize: 12, color: C.inkSoft }}>Comprobando…</span>}
            {keyState === 'ok' && <span style={{ fontSize: 12.5, color: C.sage, fontWeight: 700 }}>Llave válida ✓ ya puedes empezar</span>}
            {keyState === 'usada' && <span style={{ fontSize: 12.5, color: C.rose, fontWeight: 700 }}>Esta llave ya se usó para crear otra mascota</span>}
            {keyState === 'invalida' && <span style={{ fontSize: 12.5, color: C.rose, fontWeight: 700 }}>Esa llave no existe — revisa que esté bien copiada</span>}
            {keyState === 'sin-conexion' && <span style={{ fontSize: 12, color: C.inkSoft }}>No se pudo comprobar ahora; se validará al finalizar</span>}
          </div>
        </div>
      )}

      {/* Atajo de pruebas: genera una mascota completa al azar y
          entrega el link, sin pasar por los 10 pasos. */}
      <div className="pg-card" style={{ marginTop: 22, padding: 14, background: C.surfaceAlt }}>
        <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>
          Clave de prueba
        </p>
        <p style={{ fontSize: 11.5, color: C.inkFaint, marginBottom: 9, lineHeight: 1.4 }}>
          Si estas probando la app, escribe la clave y se genera todo solo: mascota al azar, comidas, frases, fotos, musica y decoracion.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && isTestKey(key)) onTestKey(); }}
            placeholder="clave"
            aria-label="Clave de prueba"
            className="pg-input pg-focus"
            style={{ flex: 1 }}
          />
          <button
            onClick={() => isTestKey(key) && onTestKey()}
            disabled={!isTestKey(key) || testState === 'working'}
            className="pg-btn pg-focus"
            style={{
              padding: '10px 18px', fontSize: 13, whiteSpace: 'nowrap',
              background: isTestKey(key) ? C.sage : C.line,
              color: '#fff', border: `1.5px solid ${isTestKey(key) ? C.sage : C.line}`,
              opacity: isTestKey(key) && testState !== 'working' ? 1 : 0.55,
            }}
          >
            {testState === 'working' ? 'Generando...' : 'Generar'}
          </button>
        </div>
        {wrong && (
          <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 7 }}>Esa no es la clave.</p>
        )}
        {testState === 'error' && (
          <p style={{ fontSize: 11.5, color: C.rose, marginTop: 7 }}>No se pudo generar. Intenta de nuevo.</p>
        )}
      </div>
    </StepShell>
  );
}

// ── Paso: Nombres (incluye tu nombre = creator_name) ──────────────
function NamesStep({ petName, setPetName, partnerName, setPartnerName, creatorName, setCreatorName }) {
  return (
    <StepShell title="Empecemos por los nombres" subtitle="Esto aparece en toda la experiencia">
      <TextField label="¿Cómo se va a llamar la mascota?" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Ej: Mochi" />
      <TextField label="¿Para quién es este regalo? (opcional)" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Ej: Sarah" />
      <TextField label="¿De parte de quién? (opcional)" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Tu nombre" />
    </StepShell>
  );
}

// ── Paso: Dibujar ─────────────────────────────────────────────────
// (el editor modular en si vive en PetDesigner.jsx, reusado por el juego)

// ── Paso: Comidas ─────────────────────────────────────────────────
function FoodsStep({ foods, setFoods }) {
  const [name, setName] = useState('');
  const [pref, setPref] = useState('gusta');
  const [msg, setMsg] = useState('');
  const [image, setImage] = useState(null);

  function pickImage(e) {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function add() {
    if (!name.trim()) return;
    setFoods((prev) => [...prev, {
      id: uid(), food_name: name.trim(), preference: pref, image,
      reaction_message: msg.trim() || (pref === 'gusta' ? '¡Mi favorita!' : 'Esto no me gusta mucho...'),
    }]);
    setName(''); setMsg(''); setPref('gusta'); setImage(null);
  }

  return (
    <StepShell title="Sus comidas" subtitle="Ponle su imagen y qué dice al comer cada una">
      <div className="pg-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
          <label className="pg-checker pg-focus" style={{ width: 74, height: 74, borderRadius: 16, flexShrink: 0, cursor: 'pointer', overflow: 'hidden', border: `2px dashed ${image ? C.sage : C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {image ? (
              <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <IconCamera size={22} color={C.inkSoft} />
                <span style={{ fontFamily: FONT.display, fontSize: 9.5, fontWeight: 700, color: C.inkSoft, marginTop: 2 }}>Foto</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={pickImage} style={{ display: 'none' }} />
          </label>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextField label="Comida" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Pizza" />
            {image && (
              <button onClick={() => setImage(null)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.rose, padding: 0 }}>
                Quitar imagen
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-3 mt-2">
          <Chip active={pref === 'gusta'} onClick={() => setPref('gusta')} color={C.sage}>Le gusta</Chip>
          <Chip active={pref === 'no_gusta'} onClick={() => setPref('no_gusta')} color={C.rose}>No le gusta</Chip>
        </div>
        <TextField label="Qué dice al comerla" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={pref === 'gusta' ? 'Ej: ¡Mi favorita, gracias!' : 'Ej: Esto no, por favor otra cosa'} />
        <AddButton onClick={add}>+ Agregar comida</AddButton>
      </div>
      {foods.length === 0 && <p style={{ fontSize: 12.5, textAlign: 'center', color: C.inkSoft }}>Todavía no agregas ninguna comida</p>}
      {foods.map((f) => (
        <ItemCard key={f.id} onDelete={() => setFoods((prev) => prev.filter((x) => x.id !== f.id))} accent={f.preference === 'gusta' ? C.sage : C.rose}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {f.image ? (
              <img src={f.image} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: `1.5px solid ${C.line}` }} />
            ) : (
              <span style={{ width: 38, height: 38, borderRadius: '45% 55% 50% 50%', flexShrink: 0, background: f.preference === 'gusta' ? C.peach : '#D5DEE3', border: `2px solid ${C.ink}` }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700 }}>{f.food_name} <span style={{ fontSize: 11, fontWeight: 700, color: f.preference === 'gusta' ? C.sage : C.rose }}>{f.preference === 'gusta' ? '· le gusta' : '· no le gusta'}</span></div>
              <div style={{ fontSize: 12.5, color: C.inkSoft }}>{f.reaction_message}</div>
            </div>
          </div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

// ── Paso: Frases ──────────────────────────────────────────────────
function PhrasesStep({ phrases, setPhrases }) {
  const [cat, setCat] = useState('positiva');
  const [text, setText] = useState('');
  const catLabel = { positiva: 'Positivas', negativa: 'Negativas', casual: 'Casuales' };
  const catColor = { positiva: C.sage, negativa: C.rose, casual: C.ink };
  const filtered = phrases.filter((p) => p.category === cat);

  function add() {
    if (!text.trim()) return;
    setPhrases((prev) => [...prev, { id: uid(), category: cat, text: text.trim() }]);
    setText('');
  }

  return (
    <StepShell title="Sus frases" subtitle="Lo que dice según cómo la trates">
      <div className="flex gap-2 justify-center mb-4">
        {['positiva', 'negativa', 'casual'].map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)} color={catColor[c]}>{catLabel[c]}</Chip>
        ))}
      </div>
      <div className="pg-card" style={{ padding: 16, marginBottom: 16 }}>
        <TextField label={`Frase ${catLabel[cat].toLowerCase()}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ej: Hoy me siento muy feliz" multiline />
        <AddButton onClick={add} color={catColor[cat]}>+ Agregar frase</AddButton>
      </div>
      {filtered.length === 0 && <p style={{ fontSize: 12.5, textAlign: 'center', color: C.inkSoft }}>Sin frases {catLabel[cat].toLowerCase()} todavía</p>}
      {filtered.map((p) => (
        <ItemCard key={p.id} onDelete={() => setPhrases((prev) => prev.filter((x) => x.id !== p.id))} accent={catColor[cat]}>
          <div style={{ fontSize: 14 }}>{p.text}</div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

// ── Paso: Fotos ───────────────────────────────────────────────────
// Los pósters se compran en la tienda como cualquier otra cosa (antes
// estaban gratis apenas se subían). Este es el precio sugerido por
// defecto; quien regala lo puede cambiar por cada foto.
const DEFAULT_POSTER_PRICE = 50;

// Con las monedas de los minijuegos ya balanceadas, una partida normal
// da entre 18 y 30 monedas más o menos (varía según el juego). Se usa
// este rango para sugerir precios en la tienda, para que nada quede
// carísimo (imposible de comprar sin horas de farmeo) ni regalado
// (una sola partida y ya se compró todo).
const COINS_PER_GAME_MIN = 18;
const COINS_PER_GAME_MAX = 30;

// Pista de precio: cuántas partidas de minijuego hacen falta para
// comprar algo a este precio, para que quien regala tenga una referencia
// real en vez de adivinar un número al azar.
function gamesForPrice(price) {
  const p = Math.max(0, Number(price) || 0);
  if (p <= 0) return null;
  const lo = Math.ceil(p / COINS_PER_GAME_MAX);
  const hi = Math.ceil(p / COINS_PER_GAME_MIN);
  return lo === hi ? `~${lo} partida${lo === 1 ? '' : 's'}` : `~${lo}-${hi} partidas`;
}

function PriceHint({ price }) {
  const games = gamesForPrice(price);
  if (!games) return null;
  return (
    <p style={{ fontSize: 11, color: C.inkFaint, margin: '2px 0 12px', lineHeight: 1.4 }}>
      💡 Con los minijuegos se ganan {COINS_PER_GAME_MIN}-{COINS_PER_GAME_MAX} monedas por partida — a este precio equivale a {games} de minijuego.
    </p>
  );
}

function PhotosStep({ photos, setPhotos }) {
  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, { id: uid(), url: ev.target.result, caption: '', used_for: 'puzzle', price: DEFAULT_POSTER_PRICE }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }
  const updatePhoto = (id, patch) => setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const posterCount = photos.filter((p) => p.used_for === 'poster').length;
  const puzzleCount = photos.filter((p) => p.used_for === 'puzzle').length;

  function Counter({ label, count, color }) {
    const done = count >= PHOTO_MIN;
    return (
      <div style={{ flex: 1, background: done ? tint(color, 0.78) : C.surfaceAlt, border: `1.5px solid ${done ? color : C.line}`, borderRadius: 14, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: done ? color : C.inkSoft }}>{done ? '✓ ' : ''}{count}/{PHOTO_MIN}</span>
      </div>
    );
  }

  return (
    <StepShell title="Sus fotos" subtitle={`Mínimo ${PHOTO_MIN} para pósters y ${PHOTO_MIN} para el rompecabezas`}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <Counter label="Pósters" count={posterCount} color={C.lavender} />
        <Counter label="Rompecabezas" count={puzzleCount} color={C.sage} />
      </div>
      <label className="pg-btn pg-btn-rose pg-focus" style={{ display: 'block', width: '100%', padding: 13, textAlign: 'center', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
        + Subir fotos
        <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
      </label>
      {photos.length === 0 && <p style={{ fontSize: 12.5, textAlign: 'center', color: C.inkSoft }}>Sube sus fotos y marca cada una como <b style={{ color: C.lavender }}>Póster</b> (para decorar el cuarto) o <b style={{ color: C.sage }}>Rompecabezas</b> (para el minijuego)</p>}
      {photos.map((p) => (
        <div key={p.id} className="pg-card" style={{ padding: 12, marginBottom: 10, display: 'flex', gap: 12 }}>
          <img src={p.url} alt="" style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: `2px solid ${C.surface}`, boxShadow: SHADOW.soft }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <input value={p.caption} onChange={(e) => updatePhoto(p.id, { caption: e.target.value })} placeholder="Descripción (opcional)" className="pg-focus" style={{ width: '100%', padding: '7px 10px', borderRadius: 10, fontSize: 12.5, marginBottom: 8, border: `1.5px solid ${C.line}`, outline: 'none', fontFamily: FONT.body }} />
            <div className="flex gap-1.5" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip active={p.used_for === 'puzzle'} onClick={() => updatePhoto(p.id, { used_for: 'puzzle' })} color={C.sage}>Rompecabezas</Chip>
              <Chip active={p.used_for === 'poster'} onClick={() => updatePhoto(p.id, { used_for: 'poster' })} color={C.lavender}>Póster</Chip>
              {p.used_for === 'poster' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.inkSoft }}>
                  Precio
                  <input
                    type="number" min="0" max="9999"
                    value={p.price ?? DEFAULT_POSTER_PRICE}
                    onChange={(e) => updatePhoto(p.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                    className="pg-focus"
                    style={{ width: 56, padding: '4px 6px', borderRadius: 8, fontSize: 11.5, border: `1.5px solid ${C.line}`, outline: 'none', fontFamily: FONT.body }}
                  />
                  {gamesForPrice(p.price ?? DEFAULT_POSTER_PRICE) && (
                    <span style={{ color: C.inkFaint }}>({gamesForPrice(p.price ?? DEFAULT_POSTER_PRICE)})</span>
                  )}
                </label>
              )}
            </div>
          </div>
          <button onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkFaint, flexShrink: 0 }}><IconClose size={16} /></button>
        </div>
      ))}
    </StepShell>
  );
}

// Tamaño máximo de un MP3 subido: suficiente para una canción de varios
// minutos en calidad razonable, sin dejar que un archivo enorme tumbe la
// base de datos (se guarda como data URL en la misma fila).
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ── Paso: Música ──────────────────────────────────────────────────
function MusicStep({ songs, setSongs }) {
  const [mode, setMode] = useState('link'); // 'link' | 'upload'
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  // null = sin comprobar, 'checking', {ok:true}, {ok:false,...}, {ok:null}
  const [check, setCheck] = useState(null);

  // Convertimos el link pegado a URL de embed en vivo, para poder mostrar
  // una vista previa REAL antes de agregarlo. Así el creador confirma que
  // suena en vez de descubrirlo cuando ya entregó el regalo.
  const parsed = toEmbedUrl(url, { autoplay: false });
  const recognized = parsed.provider !== 'desconocido' && !!url.trim();
  const showHelp = !!url.trim() && !recognized;

  // Muchos videos de YouTube tienen desactivada la reproducción fuera de
  // YouTube. El iframe se ve igual de cargado, así que sin comprobarlo
  // el regalo se entrega y quien lo recibe sólo oye silencio. Aquí se
  // pregunta de verdad si el video se deja incrustar.
  const ytId = parsed.provider === 'youtube' ? youtubeIdFromEmbed(parsed.url) : null;
  useEffect(() => {
    if (!ytId) { setCheck(null); return; }
    let alive = true;
    setCheck('checking');
    const t = setTimeout(() => {
      checkYouTubeEmbeddable(ytId).then((r) => { if (alive) setCheck(r); });
    }, 500);   // espera a que termines de pegar
    return () => { alive = false; clearTimeout(t); };
  }, [ytId]);

  const blocked = check && check !== 'checking' && check.ok === false;

  function add() {
    if (!url.trim() || blocked) return;
    const finalUrl = parsed.url || url.trim();
    setSongs((prev) => [...prev, {
      id: uid(),
      title: title.trim(),
      source_type: 'embed',
      embed_url: finalUrl,
      provider: parsed.provider,
    }]);
    setTitle(''); setUrl('');
  }

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo después
    if (!file) return;
    setUploadError('');
    if (!/^audio\//.test(file.type)) {
      setUploadError('Ese archivo no es de audio. Sube un MP3, M4A, WAV u OGG.');
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setUploadError(`El archivo pesa demasiado (máximo ${MAX_AUDIO_BYTES / (1024 * 1024)} MB).`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setSongs((prev) => [...prev, {
        id: uid(),
        title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
        source_type: 'upload',
        audio_data: dataUrl,
        fileName: file.name,
      }]);
      setTitle('');
    } catch (err) {
      setUploadError('No se pudo leer el archivo. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <StepShell title="Su música" subtitle="Pega el link de Spotify/YouTube, o sube un MP3 propio">
      <div className="pg-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['link', 'Pegar link'], ['upload', 'Subir archivo']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="pg-focus"
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700,
                background: mode === key ? C.lavender : C.surfaceAlt,
                color: mode === key ? '#fff' : C.ink,
                border: `1.5px solid ${mode === key ? C.lavender : C.line}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'upload' ? (
          <>
            <TextField label="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Nuestra canción" />
            <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 10, lineHeight: 1.45 }}>
              Sube un archivo de audio que ya tengas (MP3, M4A, WAV u OGG, máx. {MAX_AUDIO_BYTES / (1024 * 1024)} MB).
              Esta es la única forma de que la música suene de verdad al abrir el regalo — los links de Spotify/YouTube
              siempre necesitan que la otra persona toque play, es una restricción de los navegadores.
            </p>
            <label
              className="pg-focus"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, border: `1.5px dashed ${C.line}`,
                cursor: uploading ? 'default' : 'pointer', background: C.surfaceAlt,
                fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.lavender,
              }}
            >
              {uploading ? 'Cargando…' : '+ Elegir archivo de audio'}
              <input type="file" accept="audio/*" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
            </label>
            {uploadError && (
              <p style={{ fontSize: 12, color: C.rose, marginTop: 8, lineHeight: 1.4 }}>{uploadError}</p>
            )}
          </>
        ) : (
        <>
        <TextField label="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Nuestra canción" />
        <TextField label="Link de la canción" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Pega aquí el link de Spotify o YouTube" />

        {recognized && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: '#fff', background: parsed.provider === 'spotify' ? '#1DB954' : '#FF0000', borderRadius: 999, padding: '2px 9px' }}>
                {providerLabel(parsed.provider)}
              </span>
              <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.sage }}>Link reconocido ✓ Escúchalo aquí:</span>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${C.line}` }}>
              <iframe
                src={parsed.url}
                width="100%"
                height={parsed.height}
                style={{ border: 'none', display: 'block' }}
                allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                title="Vista previa"
              />
            </div>
          </div>
        )}

        {showHelp && (
          <p style={{ fontSize: 12, color: C.rose, marginBottom: 12, lineHeight: 1.45 }}>
            No reconocí ese link. Pega el link normal de <b>Spotify</b> (Compartir → Copiar enlace) o de <b>YouTube</b>. Ambos sirven tal cual, no necesitas el de "insertar".
          </p>
        )}

        {!url.trim() && (
          <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12, lineHeight: 1.45 }}>
            En Spotify: <b>Compartir → Copiar enlace</b>. En YouTube: <b>Compartir</b>. Pega el link normal, yo lo convierto para que suene dentro del juego.
          </p>
        )}

        {ytId && check === 'checking' && (
          <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 10 }}>Comprobando que se pueda reproducir…</p>
        )}
        {blocked && (
          <div style={{ background: '#FDECEC', border: `1.5px solid ${C.rose}`, borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
            <p style={{ fontSize: 12.5, color: C.rose, margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
              {musicErrorText(check.code)}
            </p>
            <p style={{ fontSize: 11.5, color: C.inkSoft, margin: '4px 0 0', lineHeight: 1.4 }}>
              Si lo dejas así, tu pareja no va a escuchar nada. Busca otra versión de la canción en YouTube o usa Spotify.
            </p>
          </div>
        )}
        {check && check !== 'checking' && check.ok === true && (
          <p style={{ fontSize: 12, color: C.sage, marginBottom: 10, fontWeight: 700 }}>Comprobado: esta canción sí suena dentro del juego ✓</p>
        )}
        {check && check !== 'checking' && check.ok === null && (
          <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 10, lineHeight: 1.4 }}>
            No pude comprobar la canción (puede ser tu conexión o un bloqueador). Igual la puedes agregar.
          </p>
        )}

        <AddButton onClick={add} disabled={blocked}>+ Agregar canción</AddButton>
        </>
        )}
      </div>

      {songs.length === 0 && <p style={{ fontSize: 12.5, textAlign: 'center', color: C.inkSoft }}>Todavía no agregas ninguna canción</p>}
      {songs.map((s) => (
        <ItemCard key={s.id} onDelete={() => setSongs((prev) => prev.filter((x) => x.id !== s.id))}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700 }}>{s.title || 'Sin título'}</div>
            {s.source_type === 'upload' ? (
              <span style={{ fontFamily: FONT.display, fontSize: 10, fontWeight: 800, color: '#fff', background: C.lavender, borderRadius: 999, padding: '1px 7px' }}>
                Archivo · suena sola
              </span>
            ) : s.provider && s.provider !== 'desconocido' && (
              <span style={{ fontFamily: FONT.display, fontSize: 10, fontWeight: 800, color: '#fff', background: s.provider === 'spotify' ? '#1DB954' : '#FF0000', borderRadius: 999, padding: '1px 7px' }}>
                {providerLabel(s.provider)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.source_type === 'upload' ? (s.fileName || 'audio subido') : s.embed_url}
          </div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

// ── Paso: Ropa (opcional) — cada prenda es su propio mini-diseño ──
// Reusa exactamente el mismo motor de dibujo/retoque que la mascota base:
// el creador dibuja encima de una copia de la receta para vestir a la
// mascota (sombrero, bufanda, disfraz completo...), un dibujo por ánimo.
function OutfitDesigner({ baseRecipe, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);
  const [activeMood, setActiveMood] = useState('normal');
  const [tool, setTool] = useState('pincel');
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [size, setSize] = useState(10);
  const [hardness, setHardness] = useState('dura');
  const [saving, setSaving] = useState(false);

  const normalRef = useRef(null);
  const felizRef = useRef(null);
  const enojadoRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const refs = { normal: normalRef, feliz: felizRef, enojado: enojadoRef };

  const [histories, setHistories] = useState({
    normal: { stack: [], index: -1 },
    feliz: { stack: [], index: -1 },
    enojado: { stack: [], index: -1 },
  });

  useEffect(() => {
    const moods = ['normal', 'feliz', 'enojado'];
    const next = {};
    moods.forEach((m) => {
      const canvas = refs[m].current;
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      next[m] = { stack: [canvas.toDataURL('image/png')], index: 0 };
    });
    setHistories(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushHistory(mood, dataUrl) {
    setHistories((prev) => {
      const h = prev[mood];
      const stack = h.stack.slice(0, h.index + 1);
      stack.push(dataUrl);
      return { ...prev, [mood]: { stack, index: stack.length - 1 } };
    });
  }
  function restoreCanvas(mood, dataUrl) {
    const canvas = refs[mood].current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = dataUrl;
  }
  function undo(mood) {
    setHistories((prev) => {
      const hh = prev[mood];
      if (hh.index <= 0) return prev;
      const idx = hh.index - 1;
      restoreCanvas(mood, hh.stack[idx]);
      return { ...prev, [mood]: { ...hh, index: idx } };
    });
  }
  function redo(mood) {
    setHistories((prev) => {
      const hh = prev[mood];
      if (hh.index >= hh.stack.length - 1) return prev;
      const idx = hh.index + 1;
      restoreCanvas(mood, hh.stack[idx]);
      return { ...prev, [mood]: { ...hh, index: idx } };
    });
  }
  function clearCanvas(mood) {
    const canvas = refs[mood].current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushHistory(mood, canvas.toDataURL('image/png'));
  }
  function copyFromNormal(mood) {
    const source = refs.normal.current;
    const target = refs[mood].current;
    const ctx = target.getContext('2d');
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(source, 0, 0);
    pushHistory(mood, target.toDataURL('image/png'));
  }
  function startStroke(e, mood) {
    e.preventDefault();
    const canvas = refs[mood].current;
    canvas.setPointerCapture(e.pointerId);
    const pos = getPos(e, canvas);
    if (tool === 'cuentagotas') {
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      if (pixel[3] > 0) setColor('#' + [pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join(''));
      setTool('pincel');
      return;
    }
    drawingRef.current = true;
    lastPointRef.current = pos;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = size;
    if (tool === 'goma') { ctx.globalCompositeOperation = 'destination-out'; ctx.shadowBlur = 0; }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = color; ctx.shadowBlur = hardness === 'suave' ? size * 0.5 : 0; ctx.shadowColor = color; }
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(pos.x + 0.1, pos.y + 0.1); ctx.stroke();
  }
  function moveStroke(e, mood) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = refs[mood].current;
    const pos = getPos(e, canvas);
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPointRef.current = pos;
  }
  function endStroke(mood) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    pushHistory(mood, refs[mood].current.toDataURL('image/png'));
  }

  const h = histories[activeMood] || { stack: [], index: -1 };
  const canUndo = h.index > 0;
  const canRedo = h.index < h.stack.length - 1;

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const [drawing_normal, drawing_feliz, drawing_enojado] = await Promise.all(
      ['normal', 'feliz', 'enojado'].map((m) => recipeToPngDataUrl(baseRecipe, m, histories[m].stack[histories[m].index], 320))
    );
    onSave({ id: uid(), name: name.trim(), price: Math.max(0, Number(price) || 0), drawing_normal, drawing_feliz, drawing_enojado });
  }

  return (
    <div className="pg-card" style={{ padding: 16, marginBottom: 16 }}>
      <TextField label="Nombre de la prenda" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Gorrito de invierno" />
      <TextField label="Precio en monedas" value={String(price)} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="100" />
      <PriceHint price={price} />

      <div className="flex gap-3 mb-3 justify-center">
        {MOODS.map((m) => (
          <button key={m.id} onClick={() => setActiveMood(m.id)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, overflow: 'hidden', border: `2.5px solid ${activeMood === m.id ? C.rose : C.line}` }}>
              <svg viewBox="0 0 200 200" width={36} height={36}><PetRecipeMarkup recipe={baseRecipe} mood={m.id} /></svg>
            </div>
            <span style={{ fontFamily: FONT.display, fontSize: 10, fontWeight: 700, color: activeMood === m.id ? C.rose : C.ink }}>{m.label}</span>
          </button>
        ))}
      </div>

      {activeMood !== 'normal' && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => copyFromNormal(activeMood)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.sage, textDecoration: 'underline', textUnderlineOffset: 4, marginBottom: 10 }}>
            Copiar prenda desde Normal
          </button>
        </div>
      )}

      <div style={{ position: 'relative', margin: '0 auto 12px', width: CANVAS_SIZE, height: CANVAS_SIZE, borderRadius: 20, overflow: 'hidden', boxShadow: `0 0 0 4px ${C.surface}, 0 0 0 6px ${C.line}, ${SHADOW.soft}`, background: C.paperDeep }}>
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <PetRecipeMarkup recipe={baseRecipe} mood={activeMood} />
        </svg>
        {['normal', 'feliz', 'enojado'].map((m) => (
          <canvas
            key={m} ref={refs[m]}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: activeMood === m ? 'block' : 'none', touchAction: 'none' }}
            onPointerDown={(e) => startStroke(e, m)} onPointerMove={(e) => moveStroke(e, m)} onPointerUp={() => endStroke(m)} onPointerLeave={() => endStroke(m)}
          />
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: C.inkSoft, textAlign: 'center', marginBottom: 12 }}>Dibuja la ropa o accesorio encima de la mascota — no hace falta redibujarla entera</p>

      <div className="pg-card" style={{ padding: 14, marginBottom: 10, background: C.surfaceAlt }}>
        <div className="flex gap-2 justify-center mb-3">
          {[{ id: 'pincel', label: '🖌 Pincel' }, { id: 'goma', label: '🧼 Goma' }, { id: 'cuentagotas', label: '💧 Color' }].map((t) => (
            <Chip key={t.id} active={tool === t.id} onClick={() => setTool(t.id)}>{t.label}</Chip>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: C.inkSoft }}>Grosor</span>
          <input type="range" min="2" max="30" value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1" style={{ accentColor: C.rose }} />
          <div style={{ width: Math.max(size, 6), height: Math.max(size, 6), borderRadius: '50%', background: tool === 'goma' ? '#fff' : color, border: `1.5px solid ${C.line}`, flexShrink: 0 }} />
        </div>
        <div className="flex gap-2 justify-center mb-3">
          {['dura', 'suave'].map((hd) => (
            <Chip key={hd} active={hardness === hd} onClick={() => setHardness(hd)} color={C.ink}>{hd === 'dura' ? 'Línea dura' : 'Línea suave'}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-1">
          {DRAW_COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setTool('pincel'); }} aria-label={c} className="pg-focus" style={{ width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? `3px solid ${C.rose}` : `1.5px solid ${C.line}`, boxShadow: color === c ? SHADOW.glowRose : 'none' }} />
          ))}
          <label className="pg-focus" style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: `1.5px solid ${C.line}`, display: 'inline-block' }}>
            <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool('pincel'); }} style={{ width: '150%', height: '150%', marginLeft: '-25%', marginTop: '-25%', cursor: 'pointer' }} />
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        <button onClick={() => undo(activeMood)} disabled={!canUndo} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 14px', fontSize: 12.5, opacity: canUndo ? 1 : 0.5 }}>↩ Deshacer</button>
        <button onClick={() => redo(activeMood)} disabled={!canRedo} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 14px', fontSize: 12.5, opacity: canRedo ? 1 : 0.5 }}>↪ Rehacer</button>
        <button onClick={() => clearCanvas(activeMood)} className="pg-btn pg-focus" style={{ padding: '8px 14px', fontSize: 12.5, background: C.surface, color: C.rose, border: `1.5px solid ${C.rose}`, boxShadow: `0 2px 0 ${C.roseSoft}` }}>🗑 Limpiar</button>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Cancelar</button>
        <button onClick={handleSave} disabled={!name.trim() || saving} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5, opacity: !name.trim() || saving ? 0.6 : 1 }}>
          {saving ? 'Guardando...' : '+ Guardar prenda'}
        </button>
      </div>
    </div>
  );
}

// ── Paso: Objetos decorativos ─────────────────────────────────────
// Quien regala sube fotos de cosas que significan algo (un vinilo, una
// entrada, un peluche), les quita el fondo a mano y les pone nombre,
// descripción y precio. Aparecen en la tienda del juego y se pueden
// colocar en el cuarto.
function DecorStep({ decorItems, setDecorItems }) {
  const [pending, setPending] = useState(null);   // archivo en edición
  const [cut, setCut] = useState(null);           // {image, ratio} ya recortado
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(80);
  const fileRef = useRef(null);

  function reset() {
    setPending(null); setCut(null); setName(''); setDesc(''); setPrice(80);
    if (fileRef.current) fileRef.current.value = '';
  }

  function save() {
    if (!cut || !name.trim()) return;
    setDecorItems((prev) => [...prev, {
      name: name.trim(),
      description: desc.trim() || null,
      price: Math.max(0, Number(price) || 0),
      image: cut.image,
      ratio: cut.ratio,
    }]);
    reset();
  }

  return (
    <StepShell title="Objetos para su cuarto" subtitle="Cosas con significado que podrá comprar y poner (opcional)">
      {decorItems.length > 0 && (
        <div className="flex gap-2.5 flex-wrap" style={{ marginBottom: 16 }}>
          {decorItems.map((d, i) => (
            <div key={i} className="pg-card" style={{ padding: 8, width: 104, position: 'relative' }}>
              <div className="pg-checker" style={{ width: '100%', height: 68, borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={d.image} alt={d.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, marginTop: 5, lineHeight: 1.1 }}>{d.name}</div>
              <div style={{ fontSize: 10.5, color: C.inkSoft }}>{d.price} monedas</div>
              <button
                onClick={() => setDecorItems((prev) => prev.filter((_, j) => j !== i))}
                aria-label="Quitar"
                className="pg-focus"
                style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: C.surface, border: '1.5px solid ' + C.line, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {!pending && !cut && (
        <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
          <IconCamera size={30} color={C.sage} />
          <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 14px' }}>
            Sube la foto de un objeto — le quitas el fondo aquí mismo y queda como adorno para el cuarto.
          </p>
          <input
            ref={fileRef} type="file" accept="image/*"
            onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) setPending(f); }}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileRef.current && fileRef.current.click()} className="pg-btn pg-focus" style={{ padding: '10px 20px', fontSize: 13, background: C.rose, color: '#fff', border: '1.5px solid ' + C.rose }}>
            Elegir foto
          </button>
        </div>
      )}

      {pending && !cut && (
        <BgRemover file={pending} onCancel={reset} onDone={(r) => { setPending(null); setCut(r); }} />
      )}

      {cut && (
        <div className="pg-card" style={{ padding: 16 }}>
          <div className="pg-checker" style={{ width: '100%', height: 130, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <img src={cut.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>¿Cómo se llama?</p>
          <input
            value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
            placeholder="El vinilo que escuchamos ese día"
            className="pg-input pg-focus" style={{ width: '100%', marginBottom: 10 }}
          />
          <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>¿Por qué es especial? (opcional)</p>
          <input
            value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={200}
            placeholder="Lo pusiste la primera vez que fui a tu casa"
            className="pg-input pg-focus" style={{ width: '100%', marginBottom: 10 }}
          />
          <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Precio en monedas</p>
          <input
            type="number" min="0" max="9999" value={price} onChange={(e) => setPrice(e.target.value)}
            className="pg-input pg-focus" style={{ width: 120, marginBottom: 4 }}
          />
          <PriceHint price={price} />
          <div className="flex gap-2">
            <button onClick={reset} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '10px', fontSize: 13 }}>Descartar</button>
            <button
              onClick={save} disabled={!name.trim()}
              className="pg-btn pg-focus"
              style={{ flex: 1, padding: '10px', fontSize: 13, background: C.sage, color: '#fff', border: '1.5px solid ' + C.sage, opacity: name.trim() ? 1 : 0.5 }}
            >
              Guardar objeto
            </button>
          </div>
        </div>
      )}
    </StepShell>
  );
}

// ── Paso: Juegos ──────────────────────────────────────────────────
// Configura qué sale de los agujeros en "Dale al que salga". Antes el
// juego reusaba las fotos de comidas y decoración, que no siempre tienen
// gracia como blanco; aquí se sube exactamente lo que se quiere golpear
// (con el mismo recortador de fondo que la decoración).
function GamesStep({ whackTargets, setWhackTargets }) {
  const [pending, setPending] = useState(null);
  const [cut, setCut] = useState(null);
  const [name, setName] = useState('');
  const fileRef = useRef(null);

  function reset() {
    setPending(null); setCut(null); setName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function save() {
    if (!cut || !name.trim()) return;
    setWhackTargets((prev) => [...prev, { name: name.trim(), image: cut.image }]);
    reset();
  }

  return (
    <StepShell title="Dale al que salga" subtitle="Qué va a salir de los agujeros (opcional)">
      <div className="pg-card" style={{ padding: 14, marginBottom: 16, background: C.surfaceAlt }}>
        <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
          Sube fotos de lo que quieras que aparezca para golpear en el minijuego.
          Puede ser cualquier cosa que les cause gracia a los dos.
          <br />
          <span style={{ color: C.inkFaint }}>
            Si no subes nada, el juego usa las comidas y objetos que ya configuraste.
          </span>
        </p>
      </div>

      {whackTargets.length > 0 && (
        <div className="flex gap-2.5 flex-wrap" style={{ marginBottom: 16 }}>
          {whackTargets.map((t, i) => (
            <div key={i} className="pg-card" style={{ padding: 8, width: 104, position: 'relative' }}>
              {/* Fondo circular como el agujero del juego: se ve tal cual
                  va a quedar, no una foto suelta que después sorprende. */}
              <div style={{ width: '100%', height: 68, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDBB8C', border: `2px solid ${C.ink}` }}>
                <img src={t.image} alt={t.name} style={{ maxWidth: '82%', maxHeight: '82%', objectFit: 'contain' }} />
              </div>
              <div style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, marginTop: 5, lineHeight: 1.1 }}>{t.name}</div>
              <button
                onClick={() => setWhackTargets((prev) => prev.filter((_, j) => j !== i))}
                aria-label="Quitar"
                className="pg-focus"
                style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: C.surface, border: '1.5px solid ' + C.line, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {!pending && !cut && (
        <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
          <IconCamera size={30} color={C.peach} />
          <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 14px' }}>
            Sube una foto y quítale el fondo — queda lista para salir del agujero.
          </p>
          <input
            ref={fileRef} type="file" accept="image/*"
            onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) setPending(f); }}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileRef.current && fileRef.current.click()} className="pg-btn pg-focus" style={{ padding: '10px 20px', fontSize: 13, background: C.rose, color: '#fff', border: '1.5px solid ' + C.rose }}>
            Elegir foto
          </button>
        </div>
      )}

      {pending && !cut && (
        <BgRemover file={pending} onCancel={reset} onDone={(r) => { setPending(null); setCut(r); }} />
      )}

      {cut && (
        <div className="pg-card" style={{ padding: 16 }}>
          <div style={{ width: 130, height: 130, margin: '0 auto 12px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDBB8C', border: `3px solid ${C.ink}`, boxShadow: 'inset 0 6px 10px rgba(0,0,0,0.3)' }}>
            <img src={cut.image} alt="" style={{ maxWidth: '82%', maxHeight: '82%', objectFit: 'contain' }} />
          </div>
          <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>¿Cómo se llama?</p>
          <input
            value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
            placeholder="Ej: el profe de matemáticas"
            className="pg-input pg-focus" style={{ width: '100%', marginBottom: 12 }}
          />
          <div className="flex gap-2">
            <button onClick={reset} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '10px', fontSize: 13 }}>Descartar</button>
            <button
              onClick={save} disabled={!name.trim()}
              className="pg-btn pg-focus"
              style={{ flex: 1, padding: '10px', fontSize: 13, background: C.sage, color: '#fff', border: '1.5px solid ' + C.sage, opacity: name.trim() ? 1 : 0.5 }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </StepShell>
  );
}

function OutfitsStep({ recipe, outfits, setOutfits }) {
  const [designing, setDesigning] = useState(false);

  function handleSave(outfit) {
    setOutfits((prev) => [...prev, outfit]);
    setDesigning(false);
  }

  return (
    <StepShell title="Su ropa (opcional)" subtitle="Prendas que se compran con monedas ganadas jugando">
      {!designing && (
        <button onClick={() => setDesigning(true)} className="pg-btn pg-btn-rose pg-focus" style={{ width: '100%', padding: 13, fontSize: 14, marginBottom: 16 }}>
          + Diseñar una prenda
        </button>
      )}
      {designing && <OutfitDesigner baseRecipe={recipe} onSave={handleSave} onCancel={() => setDesigning(false)} />}

      {outfits.length === 0 && !designing && <p style={{ fontSize: 12.5, textAlign: 'center', color: C.inkSoft }}>Todavía no diseñas ninguna prenda — está bien, es opcional</p>}
      {outfits.map((o) => (
        <ItemCard key={o.id} onDelete={() => setOutfits((prev) => prev.filter((x) => x.id !== o.id))}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={o.drawing_normal} alt={o.name} style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.paperDeep }} />
            <div>
              <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700 }}>{o.name}</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>{o.price} monedas</div>
            </div>
          </div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

// ── Paso: Resumen ─────────────────────────────────────────────────
function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
      <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{value}</span>
    </div>
  );
}

function SummaryStep({ petName, partnerName, histories, foods, phrases, photos, songs, submitState, resultSlug, resultMode, showDetails, lastPayload, onFinalize, onCopyLink, copied }) {
  function currentDataUrl(mood) {
    const hh = histories[mood];
    if (!hh || hh.index < 0) return null;
    return hh.stack[hh.index];
  }
  const link = resultSlug ? `${window.location.origin}/p/${resultSlug}` : '';
  return (
    <StepShell title="Revisa y finaliza" subtitle="Así va a quedar el regalo">
      <div className="flex gap-3 justify-center mb-5">
        {MOODS.map((m) => (
          <div key={m.id} className="pg-checker" style={{ width: 66, height: 66, borderRadius: 16, overflow: 'hidden', border: `2.5px solid ${C.line}`, boxShadow: SHADOW.soft }}>
            {currentDataUrl(m.id) && <img src={currentDataUrl(m.id)} alt={m.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
          </div>
        ))}
      </div>
      <div className="pg-card" style={{ padding: 16, marginBottom: 16 }}>
        <SummaryRow label="Mascota" value={petName || '—'} />
        <SummaryRow label="Para" value={partnerName || '—'} />
        <SummaryRow label="Comidas" value={String(foods.length)} />
        <SummaryRow label="Frases" value={String(phrases.length)} />
        <SummaryRow label="Fotos" value={String(photos.length)} />
        <SummaryRow label="Canciones" value={String(songs.length)} />
      </div>

      {submitState !== 'success' && (
        <button onClick={onFinalize} disabled={submitState === 'sending'} className="pg-btn pg-btn-rose pg-focus" style={{ width: '100%', padding: 14, fontSize: 15, marginBottom: 12, opacity: submitState === 'sending' ? 0.6 : 1 }}>
          {submitState === 'sending' ? 'Creando el regalo...' : '🎁 Finalizar y crear el link'}
        </button>
      )}

      {submitState === 'success' && (
        <div className="pg-card pg-anim-pop" style={{ padding: 18, textAlign: 'center', borderColor: C.sage }}>
          <IconSparkle size={40} color={C.amber} fill={C.amber} />
          <p style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, margin: '6px 0 4px' }}>¡Tu regalo está listo!</p>
          <p style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 14 }}>Comparte este link con {partnerName || 'tu pareja'} para que lo agregue a su celular.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: C.surfaceAlt, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: '8px 10px', marginBottom: 12 }}>
            <span style={{ flex: 1, fontSize: 12, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{link}</span>
            <button onClick={onCopyLink} className="pg-btn pg-btn-sage pg-focus" style={{ padding: '6px 12px', fontSize: 12 }}>{copied ? '¡Copiado!' : 'Copiar'}</button>
          </div>
          {resultMode === 'local' && (
            <p style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45, textAlign: 'left' }}>
              <b style={{ color: C.amber }}>Nota:</b> se guardó en <b>este dispositivo</b> (no encontré el servidor). El link abre aquí perfecto, pero para que funcione en el celular de {partnerName || 'tu pareja'} hay que publicar el servidor. Te ayudo con eso cuando quieras.
            </p>
          )}
        </div>
      )}

      {submitState === 'error' && (
        <div className="pg-card" style={{ padding: 14, borderColor: C.rose }}>
          <p style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 700, marginBottom: 4, color: C.ink }}>No pudimos crear el link ahora mismo</p>
          <p style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: showDetails ? 10 : 0 }}>Revisa tu conexión e inténtalo de nuevo. Nada de lo que hiciste se perdió.</p>
          {showDetails && (
            <textarea readOnly value={lastPayload} rows={6} style={{ width: '100%', fontSize: 11, padding: 8, borderRadius: 10, border: `1px solid ${C.line}`, fontFamily: 'monospace', background: C.surfaceAlt }} />
          )}
        </div>
      )}
    </StepShell>
  );
}

// ── Progreso ──────────────────────────────────────────────────────
function ProgressDots({ step, setStep }) {
  return (
    <div className="flex gap-1.5 justify-center mb-6 flex-wrap px-4">
      {STEP_META.map((s, i) => (
        <button
          key={s.id}
          onClick={() => { if (i <= step) setStep(i); }}
          disabled={i > step}
          aria-label={s.label}
          style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? C.rose : C.line, border: 'none', transition: 'all 0.25s', cursor: i <= step ? 'pointer' : 'default' }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
export default function TamagiftWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [petName, setPetName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [foods, setFoods] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [songs, setSongs] = useState([]);
  const [outfits, setOutfits] = useState([]);
  // Recipe (piezas modulares) + retoques a mano, encapsulados en el
  // mismo hook que usa la re-personalización dentro del juego.
  const designer = useDesignerState(DEFAULT_RECIPE);
  const [decorItems, setDecorItems] = useState([]);
  const [whackTargets, setWhackTargets] = useState([]);
  const [testState, setTestState] = useState('idle');
  const [accessKey, setAccessKey] = useState('');
  const [keyRequired, setKeyRequired] = useState(false);
  const [keyState, setKeyState] = useState(null);

  // ¿Este despliegue cobra? Lo decide el servidor, no el navegador.
  useEffect(() => { accessKeyRequired().then(setKeyRequired); }, []);

  // Comprobación temprana, solo para avisar: la de verdad se hace al
  // crear la mascota, en el servidor, y es la que gasta la llave.
  useEffect(() => {
    if (!keyRequired) { setKeyState(null); return; }
    const raw = accessKey.trim();
    if (raw.length < 8) { setKeyState(null); return; }
    let alive = true;
    setKeyState('checking');
    const t = setTimeout(() => {
      checkAccessKey(raw).then((st) => { if (alive) setKeyState(st); });
    }, 450);
    return () => { alive = false; clearTimeout(t); };
  }, [accessKey, keyRequired]);

  const [submitState, setSubmitState] = useState('idle');
  const [resultSlug, setResultSlug] = useState(null);
  const [resultMode, setResultMode] = useState('backend');
  const [lastPayload, setLastPayload] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const posterCount = photos.filter((p) => p.used_for === 'poster').length;
  const puzzleCount = photos.filter((p) => p.used_for === 'puzzle').length;

  function canProceed() {
    // Paso 0: si este despliegue cobra, no se avanza sin una llave
    // válida. Da igual lo bonito que sea el resto: sin llave no hay app.
    if (step === 0 && keyRequired) return keyState === 'ok' || keyState === 'sin-conexion';
    if (step === 1) return petName.trim().length > 0;
    if (step === 5) return posterCount >= PHOTO_MIN && puzzleCount >= PHOTO_MIN;
    return true;
  }

  async function handleFinalize() {
    setSubmitState('sending');
    // La mascota modular (receta de partes) + los retoques a mano opcionales
    // (el canvas transparente encima) se rasterizan aquí a 3 PNG normales —
    // el backend sigue guardando exactamente lo mismo que antes.
    const { drawing_normal, drawing_feliz, drawing_enojado } = await designer.buildPngs(320);
    const payload = {
      name: petName,
      creator_name: creatorName || null,
      recipient_name: partnerName || null,
      drawing_normal, drawing_feliz, drawing_enojado,
      // Se guarda también la receta modular (no sólo el PNG ya aplanado)
      // para que quien reciba el regalo pueda rediseñarla más adelante
      // usando el mismo creador, partiendo de esto en vez de cero.
      recipe_original: JSON.stringify(designer.recipe),
      food_preferences: foods.map((f) => ({ food_name: f.food_name, preference: f.preference, reaction_message: f.reaction_message, image: f.image || null })),
      phrases: phrases.map((p) => ({ category: p.category, text: p.text })),
      photos: photos.map((p) => ({ url: p.url, caption: p.caption, used_for: p.used_for, price: p.used_for === 'poster' ? (p.price ?? DEFAULT_POSTER_PRICE) : 0 })),
      songs: songs.map((s) => ({
        title: s.title,
        source_type: s.source_type || 'embed',
        embed_url: s.source_type === 'upload' ? '' : s.embed_url,
        audio_data: s.source_type === 'upload' ? s.audio_data : null,
      })),
      outfits: outfits.map((o) => ({ name: o.name, price: o.price, drawing_normal: o.drawing_normal, drawing_feliz: o.drawing_feliz, drawing_enojado: o.drawing_enojado })),
      decor_items: decorItems.map((d) => ({ name: d.name, description: d.description, price: d.price, image: d.image, ratio: d.ratio })),
      whack_targets: whackTargets.map((t) => ({ name: t.name, image: t.image })),
      access_key: accessKey.trim() || null,
    };
    try {
      // createPet intenta el backend y, si no está, cae a localStorage.
      // Sólo lanza si ni siquiera localStorage pudo guardar (muy raro).
      const { slug, mode } = await createPet(payload);
      setResultSlug(slug);
      setResultMode(mode);
      setSubmitState('success');
    } catch (err) {
      // Una llave rechazada no es un fallo de red: hay que decirlo claro
      // y mandar a la persona al paso 0, no ofrecerle "reintentar".
      if (err instanceof AccessKeyError) {
        setKeyState(err.reason === 'clave-usada' ? 'usada' : 'invalida');
        setSubmitState('idle');
        setStep(0);
        return;
      }
      setLastPayload(JSON.stringify(payload, null, 2));
      setSubmitState('error');
    }
  }

  // Atajo de pruebas: arma una mascota completa al azar, la crea y
  // salta directo a la pantalla del link, sin pasar por los 10 pasos.
  async function handleTestKey() {
    setTestState('working');
    try {
      const { payload } = await buildTestPet();
      const { slug, mode } = await createPet({ ...payload, access_key: accessKey.trim() || null });
      // Monedas y catalogo desbloqueado, para poder tocar tienda y
      // cuarto de inmediato sin tener que farmear jugando.
      try {
        localStorage.setItem(`tamagift:gamestate:${slug}`, JSON.stringify(testGameState()));
      } catch (e) { /* modo privado - no es critico */ }
      setResultSlug(slug);
      setResultMode(mode);
      setSubmitState('success');
      setStep(STEP_META.length - 1);
      setTestState('idle');
    } catch (err) {
      if (err instanceof AccessKeyError) {
        setKeyState(err.reason === 'clave-usada' ? 'usada' : 'invalida');
        setTestState('idle');
        return;
      }
      setTestState('error');
    }
  }

  function copyLink() {
    const link = `${window.location.origin}/p/${resultSlug}`;
    try { navigator.clipboard.writeText(link); } catch (e) { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center py-8 px-4" style={{ color: C.ink }}>
      <p className="eyebrow" style={{ marginBottom: 4 }}>Taller de mascotas</p>
      <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, marginBottom: 3, textAlign: 'center' }}>Crea su regalo</h1>
      <p style={{ fontSize: 12, marginBottom: 18, textAlign: 'center', color: C.inkSoft }}>Paso {step + 1} de {STEP_META.length} · {STEP_META[step].label}</p>

      <ProgressDots step={step} setStep={setStep} />

      <div style={{ width: '100%', display: step === 0 ? 'block' : 'none' }}>
        <WelcomeStep
          onTestKey={handleTestKey} testState={testState}
          keyRequired={keyRequired} accessKey={accessKey} setAccessKey={setAccessKey} keyState={keyState}
        />
      </div>
      <div style={{ width: '100%', display: step === 1 ? 'block' : 'none' }}>
        <NamesStep petName={petName} setPetName={setPetName} partnerName={partnerName} setPartnerName={setPartnerName} creatorName={creatorName} setCreatorName={setCreatorName} />
      </div>
      <div style={{ width: '100%', display: step === 2 ? 'block' : 'none' }}>
        <ModularPetStep {...designer} />
      </div>
      <div style={{ width: '100%', display: step === 3 ? 'block' : 'none' }}><FoodsStep foods={foods} setFoods={setFoods} /></div>
      <div style={{ width: '100%', display: step === 4 ? 'block' : 'none' }}><PhrasesStep phrases={phrases} setPhrases={setPhrases} /></div>
      <div style={{ width: '100%', display: step === 5 ? 'block' : 'none' }}><PhotosStep photos={photos} setPhotos={setPhotos} /></div>
      <div style={{ width: '100%', display: step === 6 ? 'block' : 'none' }}><MusicStep songs={songs} setSongs={setSongs} /></div>
      <div style={{ width: '100%', display: step === 7 ? 'block' : 'none' }}><OutfitsStep recipe={designer.recipe} outfits={outfits} setOutfits={setOutfits} /></div>
      <div style={{ width: '100%', display: step === 8 ? 'block' : 'none' }}><DecorStep decorItems={decorItems} setDecorItems={setDecorItems} /></div>
      <div style={{ width: '100%', display: step === 9 ? 'block' : 'none' }}><GamesStep whackTargets={whackTargets} setWhackTargets={setWhackTargets} /></div>
      <div style={{ width: '100%', display: step === 10 ? 'block' : 'none' }}>
        <SummaryStep
          petName={petName} partnerName={partnerName} histories={designer.histories}
          foods={foods} phrases={phrases} photos={photos} songs={songs}
          submitState={submitState} resultSlug={resultSlug} resultMode={resultMode} showDetails={showDetails} lastPayload={lastPayload}
          onFinalize={handleFinalize} onCopyLink={copyLink} copied={copied}
        />
        {submitState === 'success' && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={() => navigate(`/p/${resultSlug}`)} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '10px 22px', fontSize: 13.5 }}>Ver el regalo →</button>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 w-full justify-center" style={{ maxWidth: 430 }}>
        {step > 0 && (
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '11px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconBack size={15} /> Atrás
          </button>
        )}
        {step < STEP_META.length - 1 && (
          <button
            onClick={() => canProceed() && setStep((s) => Math.min(STEP_META.length - 1, s + 1))}
            disabled={!canProceed()}
            className="pg-btn pg-btn-rose pg-focus"
            style={{ padding: '11px 24px', fontSize: 14, flex: 1 }}
          >
            Siguiente
          </button>
        )}
      </div>
      {step === 0 && !canProceed() && <p style={{ fontSize: 12, marginTop: 8, textAlign: 'center', color: C.inkSoft }}>Escribe tu llave de acceso para empezar</p>}
      {step === 1 && !canProceed() && <p style={{ fontSize: 12, marginTop: 8, textAlign: 'center', color: C.inkSoft }}>Escribe un nombre para continuar</p>}
      {step === 5 && !canProceed() && <p style={{ fontSize: 12, marginTop: 8, textAlign: 'center', color: C.inkSoft }}>Necesitas al menos {PHOTO_MIN} pósters y {PHOTO_MIN} de rompecabezas (te faltan {Math.max(0, PHOTO_MIN - posterCount)} póster y {Math.max(0, PHOTO_MIN - puzzleCount)} rompecabezas)</p>}
    </div>
  );
}
