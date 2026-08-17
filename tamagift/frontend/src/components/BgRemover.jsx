import React, { useRef, useState, useEffect, useCallback } from 'react';
import { C, FONT, SHADOW } from '../theme';

// ─────────────────────────────────────────────────────────────────
// Recortar el fondo de una foto, a mano.
//
// Nada de esto usa IA: la "varita mágica" es un relleno por
// inundación que borra los píxeles conectados de color parecido al que
// tocaste, con una tolerancia que tú controlas. El resto son un
// borrador y un pincel para devolver lo que te comiste de más.
//
// Al exportar se recortan los márgenes transparentes, así el objeto
// queda ajustado y se puede escalar en el cuarto sin aire alrededor.
// ─────────────────────────────────────────────────────────────────

const MAX_SIDE = 460;
const MAX_HISTORY = 14;

export default function BgRemover({ file, onCancel, onDone }) {
  const canvasRef = useRef(null);
  const origRef = useRef(null);      // píxeles originales, para restaurar
  const sizeRef = useRef({ w: 0, h: 0 });
  const historyRef = useRef({ stack: [], index: -1 });
  const drawing = useRef(false);

  const [tool, setTool] = useState('varita');
  const [tolerance, setTolerance] = useState(38);
  const [brush, setBrush] = useState(26);
  const [ready, setReady] = useState(false);
  const [, bump] = useState(0);

  // ── cargar la imagen ───────────────────────────────────────────
  useEffect(() => {
    if (!file) return;
    let revoked = null;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const cv = canvasRef.current;
      if (!cv) return;
      cv.width = w; cv.height = h;
      sizeRef.current = { w, h };
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      origRef.current = new Uint8ClampedArray(data.data);
      historyRef.current = { stack: [new Uint8ClampedArray(data.data)], index: 0 };
      setReady(true);
      bump((v) => v + 1);
      if (revoked) URL.revokeObjectURL(revoked);
    };
    if (typeof file === 'string') {
      img.src = file;
    } else {
      revoked = URL.createObjectURL(file);
      img.src = revoked;
    }
  }, [file]);

  const getCtx = () => canvasRef.current && canvasRef.current.getContext('2d', { willReadFrequently: true });

  const pushHistory = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    const snap = new Uint8ClampedArray(ctx.getImageData(0, 0, w, h).data);
    const hist = historyRef.current;
    hist.stack = hist.stack.slice(0, hist.index + 1);
    hist.stack.push(snap);
    if (hist.stack.length > MAX_HISTORY) hist.stack.shift();
    hist.index = hist.stack.length - 1;
    bump((v) => v + 1);
  }, []);

  const applySnapshot = (snap) => {
    const ctx = getCtx();
    const { w, h } = sizeRef.current;
    if (!ctx || !snap) return;
    const img = ctx.createImageData(w, h);
    img.data.set(snap);
    ctx.putImageData(img, 0, 0);
  };

  const undo = () => {
    const hist = historyRef.current;
    if (hist.index <= 0) return;
    hist.index -= 1;
    applySnapshot(hist.stack[hist.index]);
    bump((v) => v + 1);
  };
  const redo = () => {
    const hist = historyRef.current;
    if (hist.index >= hist.stack.length - 1) return;
    hist.index += 1;
    applySnapshot(hist.stack[hist.index]);
    bump((v) => v + 1);
  };
  const resetAll = () => {
    if (!origRef.current) return;
    applySnapshot(origRef.current);
    pushHistory();
  };

  // ── coordenadas del puntero → píxeles del canvas ───────────────
  function pointerToPixel(e) {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - r.left) / r.width) * cv.width),
      y: Math.round(((e.clientY - r.top) / r.height) * cv.height),
    };
  }

  // ── varita mágica: relleno por inundación ──────────────────────
  function magicWand(px, py) {
    const ctx = getCtx();
    const { w, h } = sizeRef.current;
    if (!ctx || px < 0 || py < 0 || px >= w || py >= h) return;
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const at = (x, y) => (y * w + x) * 4;
    const s = at(px, py);
    if (d[s + 3] === 0) return;         // ya está borrado
    const sr = d[s], sg = d[s + 1], sb = d[s + 2];
    // La tolerancia es distancia euclídea en RGB; al cuadrado para no
    // sacar raíces dentro del bucle (son cientos de miles de píxeles).
    const tol2 = tolerance * tolerance * 3;
    const seen = new Uint8Array(w * h);
    const stack = [px, py];
    seen[py * w + px] = 1;
    while (stack.length) {
      const y = stack.pop(), x = stack.pop();
      const i = at(x, y);
      if (d[i + 3] === 0) continue;
      const dr = d[i] - sr, dg = d[i + 1] - sg, db = d[i + 2] - sb;
      if (dr * dr + dg * dg + db * db > tol2) continue;
      d[i + 3] = 0;
      if (x > 0 && !seen[y * w + x - 1]) { seen[y * w + x - 1] = 1; stack.push(x - 1, y); }
      if (x < w - 1 && !seen[y * w + x + 1]) { seen[y * w + x + 1] = 1; stack.push(x + 1, y); }
      if (y > 0 && !seen[(y - 1) * w + x]) { seen[(y - 1) * w + x] = 1; stack.push(x, y - 1); }
      if (y < h - 1 && !seen[(y + 1) * w + x]) { seen[(y + 1) * w + x] = 1; stack.push(x, y + 1); }
    }
    ctx.putImageData(imgData, 0, 0);
    pushHistory();
  }

  // ── borrador / restaurador ─────────────────────────────────────
  function paintAt(px, py) {
    const ctx = getCtx();
    const { w, h } = sizeRef.current;
    if (!ctx) return;
    const r = brush / 2;
    if (tool === 'borrar') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    // restaurar: vuelve a pegar el original solo dentro del círculo
    const x0 = Math.max(0, Math.floor(px - r)), y0 = Math.max(0, Math.floor(py - r));
    const x1 = Math.min(w, Math.ceil(px + r)), y1 = Math.min(h, Math.ceil(py + r));
    if (x1 <= x0 || y1 <= y0) return;
    const region = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
    const orig = origRef.current;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        if ((x - px) ** 2 + (y - py) ** 2 > r * r) continue;
        const src = (y * w + x) * 4;
        const dst = ((y - y0) * (x1 - x0) + (x - x0)) * 4;
        region.data[dst] = orig[src];
        region.data[dst + 1] = orig[src + 1];
        region.data[dst + 2] = orig[src + 2];
        region.data[dst + 3] = orig[src + 3];
      }
    }
    ctx.putImageData(region, x0, y0);
  }

  const onDown = (e) => {
    if (!ready) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    const { x, y } = pointerToPixel(e);
    if (tool === 'varita') { magicWand(x, y); return; }
    drawing.current = true;
    paintAt(x, y);
  };
  const onMove = (e) => {
    if (!drawing.current) return;
    const { x, y } = pointerToPixel(e);
    paintAt(x, y);
  };
  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    pushHistory();
  };

  // ── exportar recortando el aire transparente ───────────────────
  function exportTrimmed() {
    const ctx = getCtx();
    const { w, h } = sizeRef.current;
    if (!ctx) return null;
    const d = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 12) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;  // no quedó nada visible
    const cw = maxX - minX + 1, ch = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    out.getContext('2d').drawImage(canvasRef.current, minX, minY, cw, ch, 0, 0, cw, ch);
    return { image: out.toDataURL('image/png'), ratio: cw / ch };
  }

  const hist = historyRef.current;
  const canUndo = hist.index > 0;
  const canRedo = hist.index < hist.stack.length - 1;

  const TOOLS = [
    ['varita', '✨ Varita', 'Toca el fondo y se borra lo parecido'],
    ['borrar', '🧽 Borrar', 'Borra a mano lo que sobre'],
    ['restaurar', '↩ Traer', 'Devuelve lo que borraste de más'],
  ];

  return (
    <div className="pg-card" style={{ padding: 14 }}>
      <p style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>Quítale el fondo</p>
      <p style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 10 }}>
        Toca el fondo con la varita. Si se come algo que no debía, baja la tolerancia y usa “Traer”.
      </p>

      <div
        className="pg-checker"
        style={{ borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${C.line}`, marginBottom: 10, display: 'flex', justifyContent: 'center', background: C.paperDeep }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{ maxWidth: '100%', maxHeight: 300, touchAction: 'none', cursor: 'crosshair', display: 'block' }}
        />
      </div>

      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {TOOLS.map(([id, label, hint]) => (
          <button
            key={id} onClick={() => setTool(id)} title={hint} className="pg-focus"
            style={{
              padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
              fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
              background: tool === id ? C.rose : C.surface, color: tool === id ? '#fff' : C.ink,
              border: `1.5px solid ${tool === id ? C.rose : C.line}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tool === 'varita' ? (
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, whiteSpace: 'nowrap' }}>Tolerancia</span>
          <input type="range" min="6" max="110" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="flex-1" style={{ accentColor: C.rose }} />
          <span style={{ fontSize: 11.5, color: C.inkSoft, width: 24, textAlign: 'right' }}>{tolerance}</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, whiteSpace: 'nowrap' }}>Grosor</span>
          <input type="range" min="6" max="70" value={brush} onChange={(e) => setBrush(Number(e.target.value))} className="flex-1" style={{ accentColor: C.rose }} />
          <div style={{ width: Math.min(brush, 30), height: Math.min(brush, 30), borderRadius: '50%', background: C.surfaceAlt, border: `1.5px solid ${C.line}`, flexShrink: 0 }} />
        </div>
      )}

      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <MiniBtn onClick={undo} disabled={!canUndo}>↩ Deshacer</MiniBtn>
        <MiniBtn onClick={redo} disabled={!canRedo}>↪ Rehacer</MiniBtn>
        <MiniBtn onClick={resetAll}>⟲ Volver al original</MiniBtn>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '10px', fontSize: 13 }}>
          Cancelar
        </button>
        <button
          onClick={() => { const r = exportTrimmed(); if (r) onDone(r); }}
          disabled={!ready}
          className="pg-btn pg-focus"
          style={{ flex: 1, padding: '10px', fontSize: 13, background: C.rose, color: '#fff', border: `1.5px solid ${C.rose}`, opacity: ready ? 1 : 0.5 }}
        >
          Usar esta imagen
        </button>
      </div>
    </div>
  );
}

function MiniBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled} className="pg-btn pg-btn-ghost pg-focus"
      style={{ padding: '7px 12px', fontSize: 12, opacity: disabled ? 0.45 : 1 }}
    >
      {children}
    </button>
  );
}
