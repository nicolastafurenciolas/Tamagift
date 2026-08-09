import React, { useState, useRef, useEffect } from 'react';
import { C, FONT, SHADOW, DRAW_COLORS, tint } from '../theme';
import { IconPencil } from './icons';
import { BODIES, EARS, EYES, MOUTHS, CHEEK_STYLES, BODY_COLORS, ACCENT_COLORS, BELLY_COLORS, EYE_COLORS } from '../petParts';
import { TAILS, PATTERNS, HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES } from '../petAccessories';
import { DEFAULT_RECIPE, randomRecipe, PetRecipeMarkup, recipeToPngDataUrl } from '../PetRecipe';
import { PET_STYLES, applyStyle, orderForStyle } from '../petStyles';

// ─────────────────────────────────────────────────────────────────
// Creador modular de mascotas — extraído de PetGiftWizard.jsx para
// poder reusarlo dentro del JUEGO (re-personalización, tarea #41), no
// solo en el asistente de creación. `useDesignerState` encapsula todo
// el estado (receta + retoque a mano); `ModularPetStep` es la UI, sin
// lógica propia, así que sirve igual dentro del wizard o del juego.
//
// getPos/StepShell/Chip/CANVAS_SIZE/MOODS están duplicados a propósito
// (copias pequeñas y estables) en vez de importarse desde
// PetGiftWizard.jsx: ese archivo también los usa para OTRAS cosas
// (OutfitDesigner, FoodsStep, etc.), así que importar de ida y vuelta
// crearía un ciclo entre los dos módulos.
// ─────────────────────────────────────────────────────────────────

const CANVAS_SIZE = 320;

const MOODS = [
  { id: 'normal', label: 'Normal', emoji: '🙂' },
  { id: 'feliz', label: 'Feliz', emoji: '😊' },
  { id: 'enojado', label: 'Enojado', emoji: '😤' },
];

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

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
        boxShadow: active ? `0 3px 0 ${c}` : `0 2px 0 ${C.line}`,
        transition: 'transform 0.1s',
      }}
    >
      {children}
    </button>
  );
}

// ── Diseñador modular (estilo Tomodachi Life) ─────────────────────
const PART_GROUPS = [
  { id: 'cuerpo', label: 'Cuerpo' },
  { id: 'cara', label: 'Cara' },
  { id: 'detalles', label: 'Detalles' },
];

function MiniThumb({ selected, onClick, children, label }) {
  return (
    <button onClick={onClick} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <div className="pg-checker" style={{ width: 58, height: 58, borderRadius: 15, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${selected ? C.rose : C.line}`, boxShadow: selected ? SHADOW.glowRose : 'none', transition: 'border-color 0.15s' }}>
        {children}
      </div>
      <span style={{ fontFamily: FONT.display, fontSize: 10, fontWeight: 700, color: selected ? C.rose : C.inkSoft, maxWidth: 62, textAlign: 'center', lineHeight: 1.1 }}>{label}</span>
    </button>
  );
}

// Cada tipo de parte se mira mejor desde cierta distancia: para elegir
// unos ojos no sirve ver la mascota entera en 50px. Estos encuadres
// acercan la miniatura a la zona que de verdad estás cambiando.
const THUMB_VIEW = {
  body: '0 0 200 200',
  pattern: '0 0 200 200',
  tail: '0 0 200 200',
  ears: '18 0 164 130',
  eyes: '52 62 96 76',
  mouth: '56 92 88 72',
  cheeks: '44 82 112 72',
  headAcc: '26 0 148 116',
  neckAcc: '34 104 132 96',
  extraAcc: '46 62 108 82',
};

function PartPicker({ label, field, options, recipe, setRecipe, styleId }) {
  const view = THUMB_VIEW[field] || '0 0 200 200';
  // Con un estilo activo, las piezas que pegan con él salen primero.
  // No se esconde ninguna: el resto sigue ahí, más atrás en la fila.
  const list = styleId ? orderForStyle(options, field, styleId) : options;
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 8 }}>{label}</p>
      <div className="flex gap-2.5" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {list.map((opt) => (
          <MiniThumb key={opt.id} selected={recipe[field] === opt.id} onClick={() => setRecipe((r) => ({ ...r, [field]: opt.id }))} label={opt.label}>
            <svg viewBox={view} width={52} height={52}>
              <PetRecipeMarkup recipe={{ ...recipe, [field]: opt.id }} mood="normal" />
            </svg>
          </MiniThumb>
        ))}
      </div>
    </div>
  );
}

function ColorPickerRow({ label, value, options, onPick }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 8 }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => (
          <button key={c} onClick={() => onPick(c)} aria-label={c} className="pg-focus" style={{ width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer', border: value === c ? `3px solid ${C.rose}` : `1.5px solid ${C.line}`, boxShadow: value === c ? SHADOW.glowRose : 'none' }} />
        ))}
        <label className="pg-focus" style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: `1.5px solid ${C.line}`, display: 'inline-block' }}>
          <input type="color" value={value} onChange={(e) => onPick(e.target.value)} style={{ width: '150%', height: '150%', marginLeft: '-25%', marginTop: '-25%', cursor: 'pointer' }} />
        </label>
      </div>
    </div>
  );
}

function RetouchSection({
  recipe, expanded, setExpanded, activeMood, setActiveMood, refs, histories,
  tool, setTool, color, setColor, size, setSize, hardness, setHardness,
  startStroke, moveStroke, endStroke, undo, redo, clearCanvas, copyFromNormal,
}) {
  const h = histories[activeMood] || { stack: [], index: -1 };
  const canUndo = h.index > 0;
  const canRedo = h.index < h.stack.length - 1;
  const hasOverlay = (mood) => histories[mood] && histories[mood].index > 0;

  return (
    <div className="pg-card" style={{ padding: 16, marginTop: 6 }}>
      <button onClick={() => setExpanded((v) => !v)} className="pg-focus" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <IconPencil size={16} color={C.rose} /> Retocar a mano (opcional)
        </span>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 12, color: C.inkSoft }}>{expanded ? 'Ocultar' : 'Abrir'}</span>
      </button>

      {/* Se mantiene siempre montado (solo se oculta con CSS) para no perder
          los retoques ya dibujados al cerrar y volver a abrir el panel. */}
      <div style={{ marginTop: expanded ? 16 : 0, display: expanded ? 'block' : 'none' }}>
          <p style={{ fontSize: 12.5, color: C.inkSoft, textAlign: 'center', marginBottom: 14 }}>
            Dibuja detalles encima del diseño en cada ánimo — como retocar en Tomodachi Life
          </p>

          <div className="flex gap-3 mb-4 justify-center">
            {MOODS.map((m) => (
              <button key={m.id} onClick={() => setActiveMood(m.id)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${activeMood === m.id ? C.rose : C.line}`, position: 'relative' }}>
                  <svg viewBox="0 0 200 200" width={40} height={40}><PetRecipeMarkup recipe={recipe} mood={m.id} /></svg>
                  {hasOverlay(m.id) && <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: C.sage, border: '1.5px solid #fff' }} />}
                </div>
                <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 700, color: activeMood === m.id ? C.rose : C.ink }}>{m.label}</span>
              </button>
            ))}
          </div>

          {activeMood !== 'normal' && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => copyFromNormal(activeMood)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.sage, textDecoration: 'underline', textUnderlineOffset: 4, marginBottom: 10 }}>
                Copiar retoques desde Normal
              </button>
            </div>
          )}

          <div style={{ position: 'relative', margin: '0 auto 12px', width: CANVAS_SIZE, height: CANVAS_SIZE, borderRadius: 20, overflow: 'hidden', boxShadow: `0 0 0 4px ${C.surface}, 0 0 0 6px ${C.line}, ${SHADOW.soft}`, background: C.paperDeep }}>
            <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <PetRecipeMarkup recipe={recipe} mood={activeMood} />
            </svg>
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

          <div className="flex gap-2 justify-center">
            <button onClick={() => undo(activeMood)} disabled={!canUndo} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 14px', fontSize: 12.5, opacity: canUndo ? 1 : 0.5 }}>↩ Deshacer</button>
            <button onClick={() => redo(activeMood)} disabled={!canRedo} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 14px', fontSize: 12.5, opacity: canRedo ? 1 : 0.5 }}>↪ Rehacer</button>
            <button onClick={() => clearCanvas(activeMood)} className="pg-btn pg-focus" style={{ padding: '8px 14px', fontSize: 12.5, background: C.surface, color: C.rose, border: `1.5px solid ${C.rose}`, boxShadow: `0 2px 0 ${C.roseSoft}` }}>🗑 Limpiar</button>
          </div>
      </div>
    </div>
  );
}

// Fila de estilos: cada tarjeta muestra la mascota tal como quedaría
// con ese estilo. Un toque cambia paleta y piezas de golpe; después se
// sigue ajustando todo a mano.
function StylePicker({ styleId, onPick }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 2 }}>
        Estilo — no todo tiene que ser rosita
      </p>
      <p style={{ fontSize: 11.5, color: C.inkSoft, opacity: 0.85, marginBottom: 9 }}>
        Elige el que vaya con ella y ajusta lo que quieras después.
      </p>
      <div className="flex gap-2.5" style={{ overflowX: 'auto', paddingBottom: 6 }}>
        {PET_STYLES.map((s) => {
          const on = styleId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              title={s.hint}
              className="pg-focus"
              style={{
                background: on ? tint(C.rose, 0.12) : C.surface,
                border: `2.5px solid ${on ? C.rose : C.line}`,
                boxShadow: on ? SHADOW.glowRose : 'none',
                borderRadius: 18, padding: '8px 8px 7px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                flexShrink: 0, width: 84, transition: 'border-color 0.15s',
              }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: 14, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(150deg, ${s.swatch[0]}, ${s.swatch[1]})`,
              }}>
                <svg viewBox="0 0 200 200" width={56} height={56}>
                  <PetRecipeMarkup recipe={{ ...DEFAULT_RECIPE, ...s.recipe }} mood="normal" />
                </svg>
              </div>
              <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 700, color: on ? C.rose : C.ink, lineHeight: 1.1, textAlign: 'center' }}>
                {s.label}
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                {s.swatch.map((col) => (
                  <span key={col} style={{ width: 8, height: 8, borderRadius: '50%', background: col, border: `1px solid ${C.line}` }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ModularPetStep({
  recipe, setRecipe, partGroup, setPartGroup, petStyle, setPetStyle,
  activeMood, setActiveMood, refs, histories,
  tool, setTool, color, setColor, size, setSize, hardness, setHardness,
  startStroke, moveStroke, endStroke, undo, redo, clearCanvas, copyFromNormal,
  retouchOpen, setRetouchOpen,
  title = 'Diseña su mascota', subtitle = 'Elige sus partes — los 3 ánimos salen solos',
}) {
  return (
    <StepShell title={title} subtitle={subtitle}>
      {/* Vista principal grande + los otros dos ánimos al lado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
        <div className="pg-sticker" style={{ width: 172, height: 172, borderRadius: 26, overflow: 'hidden', background: 'linear-gradient(180deg, #FFF6E8, #FDE9D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 200 200" width={162} height={162}><PetRecipeMarkup recipe={recipe} mood="normal" /></svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOODS.filter((m) => m.id !== 'normal').map((m) => (
            <div key={m.id} style={{ textAlign: 'center' }}>
              <div className="pg-checker" style={{ width: 68, height: 68, borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 200 200" width={62} height={62}><PetRecipeMarkup recipe={recipe} mood={m.id} /></svg>
              </div>
              <span style={{ fontFamily: FONT.display, fontSize: 10, fontWeight: 700, color: C.inkSoft }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
        <button onClick={() => { setPetStyle(null); setRecipe(randomRecipe()); }} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 18px', fontSize: 12.5 }}>
          🎲 Sorpréndeme
        </button>
        <button onClick={() => { setPetStyle(null); setRecipe(DEFAULT_RECIPE); }} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '8px 18px', fontSize: 12.5 }}>
          ↺ Empezar de cero
        </button>
      </div>

      <StylePicker
        styleId={petStyle}
        onPick={(s) => { setPetStyle(s.id); setRecipe((r) => applyStyle(r, s.id)); }}
      />

      <div className="flex gap-2 justify-center mb-4">
        {PART_GROUPS.map((g) => (
          <Chip key={g.id} active={partGroup === g.id} onClick={() => setPartGroup(g.id)}>{g.label}</Chip>
        ))}
      </div>

      {partGroup === 'cuerpo' && (
        <>
          <ColorPickerRow label="Color del cuerpo" value={recipe.bodyColor} options={BODY_COLORS} onPick={(c) => setRecipe((r) => ({ ...r, bodyColor: c }))} />
          <ColorPickerRow label="Color de la pancita" value={recipe.innerColor} options={BELLY_COLORS} onPick={(c) => setRecipe((r) => ({ ...r, innerColor: c }))} />
          <PartPicker label="Forma del cuerpo" field="body" options={BODIES} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <PartPicker label="Patrón" field="pattern" options={PATTERNS} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
        </>
      )}
      {partGroup === 'cara' && (
        <>
          <PartPicker label="Orejas" field="ears" options={EARS} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <PartPicker label="Ojos" field="eyes" options={EYES} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <ColorPickerRow label="Color de los ojos" value={recipe.eyeColor} options={EYE_COLORS} onPick={(c) => setRecipe((r) => ({ ...r, eyeColor: c }))} />
          <PartPicker label="Boca" field="mouth" options={MOUTHS} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <PartPicker label="Cachetes" field="cheeks" options={CHEEK_STYLES} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
        </>
      )}
      {partGroup === 'detalles' && (
        <>
          <ColorPickerRow label="Color de accesorios" value={recipe.accentColor} options={ACCENT_COLORS} onPick={(c) => setRecipe((r) => ({ ...r, accentColor: c }))} />
          <ColorPickerRow label="Color secundario (detalles)" value={recipe.accentAlt} options={ACCENT_COLORS} onPick={(c) => setRecipe((r) => ({ ...r, accentAlt: c }))} />
          <PartPicker label="Cola" field="tail" options={TAILS} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <PartPicker label="Accesorio de cabeza" field="headAcc" options={HEAD_ACCESSORIES} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <PartPicker label="Accesorio de cuello" field="neckAcc" options={NECK_ACCESSORIES} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
          <PartPicker label="Detalle de la cara" field="extraAcc" options={EXTRA_ACCESSORIES} recipe={recipe} setRecipe={setRecipe} styleId={petStyle} />
        </>
      )}

      <RetouchSection
        recipe={recipe} expanded={retouchOpen} setExpanded={setRetouchOpen}
        activeMood={activeMood} setActiveMood={setActiveMood} refs={refs} histories={histories}
        tool={tool} setTool={setTool} color={color} setColor={setColor} size={size} setSize={setSize}
        hardness={hardness} setHardness={setHardness}
        startStroke={startStroke} moveStroke={moveStroke} endStroke={endStroke}
        undo={undo} redo={redo} clearCanvas={clearCanvas} copyFromNormal={copyFromNormal}
      />
    </StepShell>
  );
}

// ── Estado del editor (receta + retoque a mano) ────────────────────
// Todo lo que antes vivía suelto en el componente raíz del wizard,
// encapsulado para poder usarse igual desde el asistente de creación
// y desde la re-personalización dentro del juego.
export function useDesignerState(initialRecipe) {
  const normalRef = useRef(null);
  const felizRef = useRef(null);
  const enojadoRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const refs = { normal: normalRef, feliz: felizRef, enojado: enojadoRef };

  const [recipe, setRecipe] = useState(initialRecipe || DEFAULT_RECIPE);
  const [partGroup, setPartGroup] = useState('cuerpo');
  const [petStyle, setPetStyle] = useState(null);
  const [retouchOpen, setRetouchOpen] = useState(false);

  const [activeMood, setActiveMood] = useState('normal');
  const [tool, setTool] = useState('pincel');
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [size, setSize] = useState(10);
  const [hardness, setHardness] = useState('dura');
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

  // Rasteriza la receta + los retoques a mano a 3 PNG normales, listos
  // para mandar al backend — igual que hacía `handleFinalize` en el wizard.
  async function buildPngs(px = 320) {
    const [drawing_normal, drawing_feliz, drawing_enojado] = await Promise.all(
      ['normal', 'feliz', 'enojado'].map((m) => recipeToPngDataUrl(recipe, m, histories[m].stack[histories[m].index], px))
    );
    return { drawing_normal, drawing_feliz, drawing_enojado };
  }

  return {
    recipe, setRecipe, partGroup, setPartGroup, petStyle, setPetStyle,
    retouchOpen, setRetouchOpen, activeMood, setActiveMood, refs, histories,
    tool, setTool, color, setColor, size, setSize, hardness, setHardness,
    startStroke, moveStroke, endStroke, undo, redo, clearCanvas, copyFromNormal,
    buildPngs,
  };
}
