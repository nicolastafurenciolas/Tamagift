import React, { useRef, useState, useEffect } from 'react';

const INK = '#4A3439';
const ROSE = '#D8697F';
const SAGE = '#7FA894';
const BG = '#FBF1EC';
const CARD = '#FFFDF9';
const BORDER = '#E8D9D2';

const CANVAS_SIZE = 320;

const checkerStyle = {
  backgroundImage:
    'linear-gradient(45deg, #EFE7E0 25%, transparent 25%), linear-gradient(-45deg, #EFE7E0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EFE7E0 75%), linear-gradient(-45deg, transparent 75%, #EFE7E0 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  backgroundColor: '#FBF8F5',
};

const MOODS = [
  { id: 'normal', label: 'Normal', emoji: '🙂' },
  { id: 'feliz', label: 'Feliz', emoji: '😊' },
  { id: 'enojado', label: 'Enojado', emoji: '😤' },
];

const COLORS = [
  '#2E2422', '#FFFFFF', '#FFB98A', '#FFD9BE',
  '#FF9EB5', '#FFD3E0', '#8FDCB3', '#C9F0DC',
  '#9DCEEF', '#CFE8FA', '#C7ACEE', '#E3D6FA',
  '#FFE270', '#D8697F', '#7FA894', '#8B5E3C',
];

const STEP_META = [
  { id: 'bienvenida', label: 'Inicio' },
  { id: 'nombres', label: 'Nombres' },
  { id: 'dibujar', label: 'Dibujar' },
  { id: 'comidas', label: 'Comidas' },
  { id: 'frases', label: 'Frases' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'musica', label: 'Música' },
  { id: 'resumen', label: 'Resumen' },
];

// Cambia esto por la URL real de tu backend una vez lo despliegues (Render, Railway, etc.)
const API_BASE = 'http://localhost:8000';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

function StepShell({ title, subtitle, children }) {
  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      {title && <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>{title}</h2>}
      {subtitle && <p style={{ fontSize: 13, color: SAGE, textAlign: 'center', marginBottom: 18 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Chip({ active, onClick, children, color }) {
  const c = color || ROSE;
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm font-semibold focus:outline-none focus:ring-2"
      style={{ background: active ? c : '#fff', color: active ? '#fff' : INK, border: `1.5px solid ${active ? c : BORDER}` }}
    >
      {children}
    </button>
  );
}

function TextField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ marginBottom: 14, width: '100%' }}>
      {label && <label className="block text-xs font-semibold mb-1.5" style={{ color: SAGE }}>{label}</label>}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ border: `1.5px solid ${BORDER}`, background: '#fff', color: INK, resize: 'vertical' }}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ border: `1.5px solid ${BORDER}`, background: '#fff', color: INK }}
        />
      )}
    </div>
  );
}

function ItemCard({ onDelete, children, accent }) {
  return (
    <div className="w-full rounded-xl p-3 mb-2 flex items-start justify-between gap-2" style={{ background: CARD, border: `1px solid ${accent || BORDER}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      <button onClick={onDelete} className="focus:outline-none" style={{ color: ROSE, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✕</button>
    </div>
  );
}

function WelcomeStep() {
  return (
    <StepShell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🎁</div>
        <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Vas a crear un regalo único</h2>
        <p style={{ fontSize: 14, color: INK, lineHeight: 1.6, marginBottom: 8 }}>
          En los próximos pasos vas a dibujar su mascota en 3 estados de ánimo, agregar sus comidas favoritas, frases, fotos y música.
        </p>
        <p style={{ fontSize: 14, color: SAGE, lineHeight: 1.6 }}>Puedes ir y volver entre pasos cuando quieras — nada se pierde.</p>
      </div>
    </StepShell>
  );
}

function NamesStep({ petName, setPetName, partnerName, setPartnerName }) {
  return (
    <StepShell title="Empecemos por los nombres" subtitle="Esto va a aparecer en toda la experiencia">
      <TextField label="¿Cómo se va a llamar la mascota?" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Ej: Mochi" />
      <TextField label="¿Para quién es este regalo? (opcional)" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Ej: Sarah" />
    </StepShell>
  );
}

function DrawStep({
  activeMood, setActiveMood, refs, histories,
  tool, setTool, color, setColor, size, setSize,
  hardness, setHardness, showGuide, setShowGuide,
  startStroke, moveStroke, endStroke, undo, redo, clearCanvas, copyFromNormal,
}) {
  function currentDataUrl(mood) {
    const hh = histories[mood];
    if (!hh || hh.index < 0) return null;
    return hh.stack[hh.index];
  }
  function hasArt(mood) {
    return histories[mood] && histories[mood].index > 0;
  }
  const h = histories[activeMood] || { stack: [], index: -1 };
  const canUndo = h.index > 0;
  const canRedo = h.index < h.stack.length - 1;

  return (
    <StepShell title="Dibuja a tu mascota" subtitle="Un dibujo por cada estado de ánimo">
      <div className="flex gap-3 mb-4 justify-center">
        {MOODS.map((m) => (
          <button key={m.id} onClick={() => setActiveMood(m.id)} className="flex flex-col items-center gap-1 focus:outline-none">
            <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ width: 52, height: 52, border: `2.5px solid ${activeMood === m.id ? ROSE : BORDER}`, ...checkerStyle }}>
              {hasArt(m.id) && currentDataUrl(m.id) && <img src={currentDataUrl(m.id)} alt={m.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
              {!hasArt(m.id) && <span style={{ fontSize: 18, opacity: 0.35 }}>{m.emoji}</span>}
            </div>
            <span className="text-xs font-bold" style={{ color: activeMood === m.id ? ROSE : INK }}>{m.label}</span>
          </button>
        ))}
      </div>

      {activeMood !== 'normal' && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => copyFromNormal(activeMood)} className="text-xs font-bold underline underline-offset-4 mb-3 focus:outline-none" style={{ color: SAGE }}>
            Copiar desde Normal y ajustar
          </button>
        </div>
      )}

      <div className="relative mx-auto mb-3 rounded-2xl overflow-hidden" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, boxShadow: '0 4px 18px rgba(74,52,57,0.12)', ...checkerStyle }}>
        {showGuide && (
          <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <ellipse cx={CANVAS_SIZE / 2} cy={CANVAS_SIZE / 2 + 8} rx={CANVAS_SIZE * 0.3} ry={CANVAS_SIZE * 0.34} fill="none" stroke={INK} strokeOpacity="0.12" strokeWidth="2" strokeDasharray="6 6" />
            <line x1={CANVAS_SIZE * 0.3} y1={CANVAS_SIZE * 0.46} x2={CANVAS_SIZE * 0.7} y2={CANVAS_SIZE * 0.46} stroke={INK} strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        )}
        {['normal', 'feliz', 'enojado'].map((m) => (
          <canvas
            key={m}
            ref={refs[m]}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: activeMood === m ? 'block' : 'none', touchAction: 'none' }}
            onPointerDown={(e) => startStroke(e, m)}
            onPointerMove={(e) => moveStroke(e, m)}
            onPointerUp={() => endStroke(m)}
            onPointerLeave={() => endStroke(m)}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setShowGuide(!showGuide)} className="text-xs font-semibold mb-4 focus:outline-none" style={{ color: SAGE }}>
          {showGuide ? '👁 Ocultar guía' : '👁 Mostrar guía'}
        </button>
      </div>

      <div className="w-full rounded-2xl p-4 mb-3" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex gap-2 justify-center mb-4">
          {[{ id: 'pincel', label: '🖌 Pincel' }, { id: 'goma', label: '🧼 Goma' }, { id: 'cuentagotas', label: '💧 Color' }].map((t) => (
            <Chip key={t.id} active={tool === t.id} onClick={() => setTool(t.id)}>{t.label}</Chip>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: SAGE }}>Grosor</span>
          <input type="range" min="2" max="30" value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1" />
          <div style={{ width: Math.max(size, 6), height: Math.max(size, 6), borderRadius: '50%', background: tool === 'goma' ? '#fff' : color, border: `1.5px solid ${BORDER}`, flexShrink: 0 }} />
        </div>
        <div className="flex gap-2 justify-center mb-4">
          {['dura', 'suave'].map((hd) => (
            <Chip key={hd} active={hardness === hd} onClick={() => setHardness(hd)} color={INK}>{hd === 'dura' ? 'Línea dura' : 'Línea suave'}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-1">
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setTool('pincel'); }} aria-label={c} className="w-7 h-7 rounded-full focus:outline-none" style={{ background: c, border: color === c ? `2.5px solid ${ROSE}` : `1.5px solid ${BORDER}` }} />
          ))}
          <label className="w-7 h-7 rounded-full overflow-hidden cursor-pointer" style={{ border: `1.5px solid ${BORDER}`, display: 'inline-block' }}>
            <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool('pincel'); }} style={{ width: '150%', height: '150%', marginLeft: '-25%', marginTop: '-25%', cursor: 'pointer' }} />
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-center mb-2">
        <button onClick={() => undo(activeMood)} disabled={!canUndo} className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none" style={{ background: '#fff', color: canUndo ? INK : BORDER, border: `1.5px solid ${BORDER}` }}>↩ Deshacer</button>
        <button onClick={() => redo(activeMood)} disabled={!canRedo} className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none" style={{ background: '#fff', color: canRedo ? INK : BORDER, border: `1.5px solid ${BORDER}` }}>↪ Rehacer</button>
        <button onClick={() => clearCanvas(activeMood)} className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none" style={{ background: '#fff', color: ROSE, border: `1.5px solid ${ROSE}` }}>🗑 Limpiar</button>
      </div>
    </StepShell>
  );
}

function FoodsStep({ foods, setFoods }) {
  const [name, setName] = useState('');
  const [pref, setPref] = useState('gusta');
  const [msg, setMsg] = useState('');

  function add() {
    if (!name.trim()) return;
    setFoods((prev) => [...prev, {
      id: uid(), food_name: name.trim(), preference: pref,
      reaction_message: msg.trim() || (pref === 'gusta' ? '¡Mi favorita!' : 'Esto no me gusta mucho...'),
    }]);
    setName(''); setMsg(''); setPref('gusta');
  }

  return (
    <StepShell title="Sus comidas" subtitle="Qué debería decir al comer cada una">
      <div className="w-full rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <TextField label="Comida" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Pizza" />
        <div className="flex gap-2 mb-3">
          <Chip active={pref === 'gusta'} onClick={() => setPref('gusta')} color={SAGE}>Le gusta</Chip>
          <Chip active={pref === 'no_gusta'} onClick={() => setPref('no_gusta')} color={ROSE}>No le gusta</Chip>
        </div>
        <TextField label="Qué dice al comerla" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={pref === 'gusta' ? 'Ej: ¡Mi favorita, gracias!' : 'Ej: Esto no, por favor otra cosa'} />
        <button onClick={add} className="w-full py-2 rounded-full text-sm font-bold focus:outline-none" style={{ background: ROSE, color: '#fff' }}>+ Agregar comida</button>
      </div>
      {foods.length === 0 && <p className="text-xs text-center" style={{ color: SAGE }}>Todavía no agregas ninguna comida</p>}
      {foods.map((f) => (
        <ItemCard key={f.id} onDelete={() => setFoods((prev) => prev.filter((x) => x.id !== f.id))} accent={f.preference === 'gusta' ? SAGE : ROSE}>
          <div className="text-sm font-bold">{f.food_name} <span style={{ fontSize: 11, fontWeight: 700, color: f.preference === 'gusta' ? SAGE : ROSE }}>{f.preference === 'gusta' ? '· le gusta' : '· no le gusta'}</span></div>
          <div className="text-xs" style={{ color: INK, opacity: 0.75 }}>{f.reaction_message}</div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

function PhrasesStep({ phrases, setPhrases }) {
  const [cat, setCat] = useState('positiva');
  const [text, setText] = useState('');
  const catLabel = { positiva: 'Positivas', negativa: 'Negativas', casual: 'Casuales' };
  const catColor = { positiva: SAGE, negativa: ROSE, casual: INK };
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
      <div className="w-full rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <TextField label={`Frase ${catLabel[cat].toLowerCase()}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ej: Hoy me siento muy feliz" multiline />
        <button onClick={add} className="w-full py-2 rounded-full text-sm font-bold focus:outline-none" style={{ background: catColor[cat], color: '#fff' }}>+ Agregar frase</button>
      </div>
      {filtered.length === 0 && <p className="text-xs text-center" style={{ color: SAGE }}>Sin frases {catLabel[cat].toLowerCase()} todavía</p>}
      {filtered.map((p) => (
        <ItemCard key={p.id} onDelete={() => setPhrases((prev) => prev.filter((x) => x.id !== p.id))} accent={catColor[cat]}>
          <div className="text-sm">{p.text}</div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

function PhotosStep({ photos, setPhotos }) {
  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, { id: uid(), url: ev.target.result, caption: '', used_for: 'puzzle' }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }
  function updatePhoto(id, patch) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <StepShell title="Sus fotos" subtitle="Para el rompecabezas y los pósters del cuarto">
      <label className="block w-full py-3 rounded-full text-sm font-bold text-center cursor-pointer mb-4" style={{ background: ROSE, color: '#fff' }}>
        + Subir fotos
        <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
      </label>
      {photos.length === 0 && <p className="text-xs text-center" style={{ color: SAGE }}>Todavía no subes ninguna foto</p>}
      {photos.map((p) => (
        <div key={p.id} className="w-full rounded-xl p-3 mb-2 flex gap-3" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <img src={p.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <input value={p.caption} onChange={(e) => updatePhoto(p.id, { caption: e.target.value })} placeholder="Descripción (opcional)" className="w-full px-2 py-1 rounded-lg text-xs mb-2 focus:outline-none" style={{ border: `1.5px solid ${BORDER}` }} />
            <div className="flex gap-1.5">
              <Chip active={p.used_for === 'puzzle'} onClick={() => updatePhoto(p.id, { used_for: 'puzzle' })}>Rompecabezas</Chip>
              <Chip active={p.used_for === 'poster'} onClick={() => updatePhoto(p.id, { used_for: 'poster' })}>Póster</Chip>
            </div>
          </div>
          <button onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))} className="focus:outline-none" style={{ color: ROSE, fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>
      ))}
    </StepShell>
  );
}

function MusicStep({ songs, setSongs }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  function add() {
    if (!url.trim()) return;
    setSongs((prev) => [...prev, { id: uid(), title: title.trim(), embed_url: url.trim() }]);
    setTitle(''); setUrl('');
  }
  return (
    <StepShell title="Su música" subtitle="Links para insertar de Spotify o YouTube">
      <div className="w-full rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <TextField label="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Nuestra canción" />
        <TextField label="Link para insertar" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://open.spotify.com/embed/track/..." />
        <p className="text-xs mb-3" style={{ color: SAGE }}>En Spotify: Compartir → Insertar canción. En YouTube: Compartir → Insertar.</p>
        <button onClick={add} className="w-full py-2 rounded-full text-sm font-bold focus:outline-none" style={{ background: ROSE, color: '#fff' }}>+ Agregar canción</button>
      </div>
      {songs.length === 0 && <p className="text-xs text-center" style={{ color: SAGE }}>Todavía no agregas ninguna canción</p>}
      {songs.map((s) => (
        <ItemCard key={s.id} onDelete={() => setSongs((prev) => prev.filter((x) => x.id !== s.id))}>
          <div className="text-sm font-bold">{s.title || 'Sin título'}</div>
          <div className="text-xs truncate" style={{ color: INK, opacity: 0.6 }}>{s.embed_url}</div>
        </ItemCard>
      ))}
    </StepShell>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <span className="text-xs font-semibold" style={{ color: SAGE }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: INK }}>{value}</span>
    </div>
  );
}

function SummaryStep({ petName, partnerName, histories, foods, phrases, photos, songs, submitState, resultSlug, lastError, onFinalize }) {
  function currentDataUrl(mood) {
    const hh = histories[mood];
    if (!hh || hh.index < 0) return null;
    return hh.stack[hh.index];
  }
  return (
    <StepShell title="Revisa y finaliza" subtitle="Así va a quedar el regalo">
      <div className="flex gap-3 justify-center mb-5">
        {MOODS.map((m) => (
          <div key={m.id} className="rounded-xl overflow-hidden" style={{ width: 64, height: 64, border: `2px solid ${BORDER}`, ...checkerStyle }}>
            {currentDataUrl(m.id) && <img src={currentDataUrl(m.id)} alt={m.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
          </div>
        ))}
      </div>
      <div className="w-full rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <SummaryRow label="Mascota" value={petName || '—'} />
        <SummaryRow label="Para" value={partnerName || '—'} />
        <SummaryRow label="Comidas configuradas" value={String(foods.length)} />
        <SummaryRow label="Frases configuradas" value={String(phrases.length)} />
        <SummaryRow label="Fotos" value={String(photos.length)} />
        <SummaryRow label="Canciones" value={String(songs.length)} />
      </div>
      <button
        onClick={onFinalize}
        disabled={submitState === 'sending'}
        className="w-full py-3 rounded-full text-sm font-bold focus:outline-none mb-3"
        style={{ background: ROSE, color: '#fff', opacity: submitState === 'sending' ? 0.6 : 1 }}
      >
        {submitState === 'sending' ? 'Enviando...' : 'Finalizar y crear el link'}
      </button>
      {submitState === 'success' && (
        <div className="w-full rounded-xl p-3 text-center" style={{ background: '#EAF6EF', border: `1px solid ${SAGE}` }}>
          <p className="text-sm font-bold" style={{ color: INK }}>¡Listo! Tu mascota se creó.</p>
          <p className="text-xs mt-1" style={{ color: SAGE }}>slug: {resultSlug}</p>
        </div>
      )}
      {submitState === 'error' && (
        <div className="w-full rounded-xl p-3" style={{ background: '#FDEDEF', border: `1px solid ${ROSE}` }}>
          <p className="text-xs font-bold mb-1" style={{ color: INK }}>No se pudo conectar al backend en {API_BASE}</p>
          <p className="text-xs mb-2" style={{ color: INK, opacity: 0.75 }}>Normal si no tienes uno corriendo ahora mismo. Aquí está el JSON exacto que se enviaría, para probar tu backend manualmente:</p>
          <textarea readOnly value={lastError} rows={6} className="w-full text-xs p-2 rounded-lg" style={{ border: `1px solid ${BORDER}`, fontFamily: 'monospace' }} />
        </div>
      )}
    </StepShell>
  );
}

function ProgressDots({ step, setStep }) {
  return (
    <div className="flex gap-1.5 justify-center mb-6 flex-wrap px-4">
      {STEP_META.map((s, i) => (
        <button
          key={s.id}
          onClick={() => { if (i <= step) setStep(i); }}
          disabled={i > step}
          aria-label={s.label}
          style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, background: i <= step ? ROSE : BORDER, border: 'none', transition: 'all 0.2s', cursor: i <= step ? 'pointer' : 'default' }}
        />
      ))}
    </div>
  );
}

export default function PetGiftWizard() {
  const [step, setStep] = useState(0);
  const [petName, setPetName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [foods, setFoods] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [songs, setSongs] = useState([]);

  const normalRef = useRef(null);
  const felizRef = useRef(null);
  const enojadoRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const refs = { normal: normalRef, feliz: felizRef, enojado: enojadoRef };

  const [activeMood, setActiveMood] = useState('normal');
  const [tool, setTool] = useState('pincel');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(10);
  const [hardness, setHardness] = useState('dura');
  const [showGuide, setShowGuide] = useState(true);
  const [histories, setHistories] = useState({
    normal: { stack: [], index: -1 },
    feliz: { stack: [], index: -1 },
    enojado: { stack: [], index: -1 },
  });

  const [submitState, setSubmitState] = useState('idle');
  const [resultSlug, setResultSlug] = useState(null);
  const [lastError, setLastError] = useState('');

  useEffect(() => {
    const moods = ['normal', 'feliz', 'enojado'];
    const next = {};
    moods.forEach((m) => {
      const canvas = refs[m].current;
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      const snap = canvas.toDataURL('image/png');
      next[m] = { stack: [snap], index: 0 };
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
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
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
      if (pixel[3] > 0) {
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
        setColor(hex);
      }
      setTool('pincel');
      return;
    }

    drawingRef.current = true;
    lastPointRef.current = pos;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    if (tool === 'goma') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.shadowBlur = hardness === 'suave' ? size * 0.5 : 0;
      ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
    ctx.stroke();
  }

  function moveStroke(e, mood) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = refs[mood].current;
    const pos = getPos(e, canvas);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPointRef.current = pos;
  }

  function endStroke(mood) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = refs[mood].current;
    pushHistory(mood, canvas.toDataURL('image/png'));
  }

  function hasArt(mood) {
    return histories[mood] && histories[mood].index > 0;
  }

  function canProceed() {
    if (step === 1) return petName.trim().length > 0;
    if (step === 2) return ['normal', 'feliz', 'enojado'].every(hasArt);
    return true;
  }

  async function handleFinalize() {
    setSubmitState('sending');
    const payload = {
      name: petName,
      recipient_name: partnerName || null,
      drawing_normal: histories.normal.stack[histories.normal.index],
      drawing_feliz: histories.feliz.stack[histories.feliz.index],
      drawing_enojado: histories.enojado.stack[histories.enojado.index],
      food_preferences: foods.map((f) => ({ food_name: f.food_name, preference: f.preference, reaction_message: f.reaction_message })),
      phrases: phrases.map((p) => ({ category: p.category, text: p.text })),
      photos: photos.map((p) => ({ url: p.url, caption: p.caption, used_for: p.used_for })),
      songs: songs.map((s) => ({ title: s.title, embed_url: s.embed_url })),
    };
    try {
      const res = await fetch(`${API_BASE}/api/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('server error');
      const data = await res.json();
      setResultSlug(data.slug);
      setSubmitState('success');
    } catch (err) {
      setLastError(JSON.stringify(payload, null, 2));
      setSubmitState('error');
    }
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center py-8 px-4" style={{ background: BG, fontFamily: "'Nunito Sans', sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap');
      `}</style>

      <p className="text-xs tracking-widest uppercase font-semibold mb-1" style={{ color: SAGE }}>Taller de mascotas</p>
      <h1 className="text-xl mb-1 text-center" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>Crea su regalo</h1>
      <p className="text-xs mb-5 text-center" style={{ color: SAGE }}>Paso {step + 1} de {STEP_META.length} · {STEP_META[step].label}</p>

      <ProgressDots step={step} setStep={setStep} />

      <div style={{ width: '100%', display: step === 0 ? 'block' : 'none' }}><WelcomeStep /></div>
      <div style={{ width: '100%', display: step === 1 ? 'block' : 'none' }}>
        <NamesStep petName={petName} setPetName={setPetName} partnerName={partnerName} setPartnerName={setPartnerName} />
      </div>
      <div style={{ width: '100%', display: step === 2 ? 'block' : 'none' }}>
        <DrawStep
          activeMood={activeMood} setActiveMood={setActiveMood} refs={refs} histories={histories}
          tool={tool} setTool={setTool} color={color} setColor={setColor} size={size} setSize={setSize}
          hardness={hardness} setHardness={setHardness} showGuide={showGuide} setShowGuide={setShowGuide}
          startStroke={startStroke} moveStroke={moveStroke} endStroke={endStroke}
          undo={undo} redo={redo} clearCanvas={clearCanvas} copyFromNormal={copyFromNormal}
        />
      </div>
      <div style={{ width: '100%', display: step === 3 ? 'block' : 'none' }}><FoodsStep foods={foods} setFoods={setFoods} /></div>
      <div style={{ width: '100%', display: step === 4 ? 'block' : 'none' }}><PhrasesStep phrases={phrases} setPhrases={setPhrases} /></div>
      <div style={{ width: '100%', display: step === 5 ? 'block' : 'none' }}><PhotosStep photos={photos} setPhotos={setPhotos} /></div>
      <div style={{ width: '100%', display: step === 6 ? 'block' : 'none' }}><MusicStep songs={songs} setSongs={setSongs} /></div>
      <div style={{ width: '100%', display: step === 7 ? 'block' : 'none' }}>
        <SummaryStep
          petName={petName} partnerName={partnerName} histories={histories}
          foods={foods} phrases={phrases} photos={photos} songs={songs}
          submitState={submitState} resultSlug={resultSlug} lastError={lastError}
          onFinalize={handleFinalize}
        />
      </div>

      <div className="flex gap-3 mt-6 w-full justify-center" style={{ maxWidth: 420 }}>
        {step > 0 && (
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="px-5 py-2.5 rounded-full text-sm font-bold focus:outline-none" style={{ background: '#fff', color: INK, border: `1.5px solid ${BORDER}` }}>
            Atrás
          </button>
        )}
        {step < STEP_META.length - 1 && (
          <button
            onClick={() => canProceed() && setStep((s) => Math.min(STEP_META.length - 1, s + 1))}
            disabled={!canProceed()}
            className="px-6 py-2.5 rounded-full text-sm font-bold focus:outline-none flex-1"
            style={{ background: canProceed() ? ROSE : BORDER, color: '#fff' }}
          >
            Siguiente
          </button>
        )}
      </div>
      {step === 2 && !canProceed() && <p className="text-xs mt-2 text-center" style={{ color: SAGE }}>Dibuja algo en los 3 estados de ánimo para continuar</p>}
      {step === 1 && !canProceed() && <p className="text-xs mt-2 text-center" style={{ color: SAGE }}>Escribe un nombre para continuar</p>}
    </div>
  );
}
