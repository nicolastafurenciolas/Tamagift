import React, { useRef, useState, useEffect } from 'react';

const INK = '#4A3439';
const ROSE = '#D8697F';
const SAGE = '#7FA894';
const BG = '#FBF1EC';
const CARD = '#FFFDF9';
const BORDER = '#E8D9D2';

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

const CANVAS_SIZE = 320;

const checkerStyle = {
  backgroundImage:
    'linear-gradient(45deg, #EFE7E0 25%, transparent 25%), linear-gradient(-45deg, #EFE7E0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EFE7E0 75%), linear-gradient(-45deg, transparent 75%, #EFE7E0 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  backgroundColor: '#FBF8F5',
};

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

export default function PetMoodStudio() {
  const normalRef = useRef(null);
  const felizRef = useRef(null);
  const enojadoRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [activeMood, setActiveMood] = useState('normal');
  const [tool, setTool] = useState('pincel');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(10);
  const [hardness, setHardness] = useState('dura');
  const [showGuide, setShowGuide] = useState(true);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [histories, setHistories] = useState({
    normal: { stack: [], index: -1 },
    feliz: { stack: [], index: -1 },
    enojado: { stack: [], index: -1 },
  });

  function refFor(mood) {
    if (mood === 'normal') return normalRef;
    if (mood === 'feliz') return felizRef;
    return enojadoRef;
  }

  useEffect(() => {
    const moods = ['normal', 'feliz', 'enojado'];
    const next = {};
    moods.forEach((m) => {
      const canvas = refFor(m).current;
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
    setSaved(false);
  }

  function restoreCanvas(mood, dataUrl) {
    const canvas = refFor(mood).current;
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
    const canvas = refFor(mood).current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushHistory(mood, canvas.toDataURL('image/png'));
  }

  function copyFromNormal(mood) {
    const source = normalRef.current;
    const target = refFor(mood).current;
    const ctx = target.getContext('2d');
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(source, 0, 0);
    pushHistory(mood, target.toDataURL('image/png'));
  }

  function startStroke(e, mood) {
    e.preventDefault();
    const canvas = refFor(mood).current;
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
    const canvas = refFor(mood).current;
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
    const canvas = refFor(mood).current;
    pushHistory(mood, canvas.toDataURL('image/png'));
  }

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
  const allMoodsHaveArt = ['normal', 'feliz', 'enojado'].every(hasArt);

  return (
    <div
      className="w-full min-h-full flex flex-col items-center py-8 px-4"
      style={{ background: BG, fontFamily: "'Nunito Sans', sans-serif", color: INK }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap');
      `}</style>

      <p className="text-xs tracking-widest uppercase font-semibold mb-1" style={{ color: SAGE }}>Taller de mascotas</p>
      <h1 className="text-2xl mb-5 text-center" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>Dibuja tu mascota</h1>

      <div className="flex gap-3 mb-4">
        {MOODS.map((m) => (
          <button key={m.id} onClick={() => setActiveMood(m.id)} className="flex flex-col items-center gap-1 focus:outline-none">
            <div
              className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{ width: 56, height: 56, border: `2.5px solid ${activeMood === m.id ? ROSE : BORDER}`, ...checkerStyle }}
            >
              {hasArt(m.id) && currentDataUrl(m.id) && (
                <img src={currentDataUrl(m.id)} alt={m.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
              {!hasArt(m.id) && <span style={{ fontSize: 20, opacity: 0.35 }}>{m.emoji}</span>}
            </div>
            <span className="text-xs font-bold" style={{ color: activeMood === m.id ? ROSE : INK }}>{m.label}</span>
          </button>
        ))}
      </div>

      {activeMood !== 'normal' && (
        <button
          onClick={() => copyFromNormal(activeMood)}
          className="text-xs font-bold underline underline-offset-4 mb-3 focus:outline-none"
          style={{ color: SAGE }}
        >
          Copiar desde Normal y ajustar
        </button>
      )}

      <div
        className="relative mb-3 rounded-2xl overflow-hidden"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, boxShadow: '0 4px 18px rgba(74,52,57,0.12)', ...checkerStyle }}
      >
        {showGuide && (
          <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <ellipse cx={CANVAS_SIZE / 2} cy={CANVAS_SIZE / 2 + 8} rx={CANVAS_SIZE * 0.3} ry={CANVAS_SIZE * 0.34} fill="none" stroke={INK} strokeOpacity="0.12" strokeWidth="2" strokeDasharray="6 6" />
            <line x1={CANVAS_SIZE * 0.3} y1={CANVAS_SIZE * 0.46} x2={CANVAS_SIZE * 0.7} y2={CANVAS_SIZE * 0.46} stroke={INK} strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        )}
        {['normal', 'feliz', 'enojado'].map((m) => (
          <canvas
            key={m}
            ref={refFor(m)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: activeMood === m ? 'block' : 'none', touchAction: 'none' }}
            onPointerDown={(e) => startStroke(e, m)}
            onPointerMove={(e) => moveStroke(e, m)}
            onPointerUp={() => endStroke(m)}
            onPointerLeave={() => endStroke(m)}
          />
        ))}
      </div>

      <button onClick={() => setShowGuide(!showGuide)} className="text-xs font-semibold mb-5 focus:outline-none" style={{ color: SAGE }}>
        {showGuide ? '👁 Ocultar guía' : '👁 Mostrar guía'}
      </button>

      <div className="w-full max-w-sm rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex gap-2 justify-center mb-4">
          {[
            { id: 'pincel', label: '🖌 Pincel' },
            { id: 'goma', label: '🧼 Goma' },
            { id: 'cuentagotas', label: '💧 Color' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none"
              style={{
                background: tool === t.id ? ROSE : '#fff',
                color: tool === t.id ? '#fff' : INK,
                border: `1.5px solid ${tool === t.id ? ROSE : BORDER}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: SAGE }}>Grosor</span>
          <input type="range" min="2" max="30" value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1" />
          <div
            style={{
              width: Math.max(size, 6),
              height: Math.max(size, 6),
              borderRadius: '50%',
              background: tool === 'goma' ? '#fff' : color,
              border: `1.5px solid ${BORDER}`,
              flexShrink: 0,
            }}
          />
        </div>

        <div className="flex gap-2 justify-center mb-4">
          {['dura', 'suave'].map((hd) => (
            <button
              key={hd}
              onClick={() => setHardness(hd)}
              className="px-3 py-1 rounded-full text-xs font-semibold focus:outline-none"
              style={{
                background: hardness === hd ? INK : 'transparent',
                color: hardness === hd ? '#fff' : INK,
                border: `1.5px solid ${hardness === hd ? INK : BORDER}`,
              }}
            >
              {hd === 'dura' ? 'Línea dura' : 'Línea suave'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pincel'); }}
              aria-label={c}
              className="w-7 h-7 rounded-full focus:outline-none"
              style={{ background: c, border: color === c ? `2.5px solid ${ROSE}` : `1.5px solid ${BORDER}` }}
            />
          ))}
          <label className="w-7 h-7 rounded-full overflow-hidden cursor-pointer" style={{ border: `1.5px solid ${BORDER}`, display: 'inline-block' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); setTool('pincel'); }}
              style={{ width: '150%', height: '150%', marginLeft: '-25%', marginTop: '-25%', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-center mb-5">
        <button
          onClick={() => undo(activeMood)}
          disabled={!canUndo}
          className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none"
          style={{ background: '#fff', color: canUndo ? INK : BORDER, border: `1.5px solid ${BORDER}` }}
        >
          ↩ Deshacer
        </button>
        <button
          onClick={() => redo(activeMood)}
          disabled={!canRedo}
          className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none"
          style={{ background: '#fff', color: canRedo ? INK : BORDER, border: `1.5px solid ${BORDER}` }}
        >
          ↪ Rehacer
        </button>
        <button
          onClick={() => clearCanvas(activeMood)}
          className="px-3 py-1.5 rounded-full text-xs font-bold focus:outline-none"
          style={{ background: '#fff', color: ROSE, border: `1.5px solid ${ROSE}` }}
        >
          🗑 Limpiar
        </button>
      </div>

      <div className="w-full max-w-sm rounded-2xl p-5 mb-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <label className="block text-xs font-semibold mb-2" style={{ color: SAGE }}>Nombre de tu mascota</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Mochi"
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ border: `1.5px solid ${BORDER}`, background: '#fff', color: INK }}
        />
      </div>

      <button
        onClick={() => setSaved(true)}
        disabled={!allMoodsHaveArt}
        className="px-6 py-3 rounded-full text-sm font-bold focus:outline-none"
        style={{ background: allMoodsHaveArt ? ROSE : BORDER, color: '#fff', boxShadow: allMoodsHaveArt ? '0 3px 10px rgba(216,105,127,0.4)' : 'none' }}
      >
        {saved ? '✓ Guardado' : 'Guardar mascota'}
      </button>
      {!allMoodsHaveArt && (
        <p className="text-xs mt-2 text-center" style={{ color: SAGE }}>Dibuja algo en los 3 estados de ánimo antes de guardar</p>
      )}
    </div>
  );
}
