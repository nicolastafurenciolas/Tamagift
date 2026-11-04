// ─────────────────────────────────────────────────────────────────
// La cámara: una foto de lo que se ve del cuarto, tal cual, en el estilo
// activo. No hace falta una librería de capturas: todo lo del cuarto ya
// está pintado como imágenes (los sprites del kit de cada estilo), así
// que se copian una por una en un canvas en el orden en que se ven, más
// las capas de luz (la noche, el brillo de las lámparas, la lluvia o la
// nieve en las ventanas).
//
// Lo que tenga `data-photo-skip` (botones de los sucesos, por ejemplo)
// no sale en la foto.
// ─────────────────────────────────────────────────────────────────

function rgba(str) {
  const m = /rgba?\(([^)]+)\)/.exec(str || '');
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}
const css = (c) => `rgba(${c.r},${c.g},${c.b},${c.a})`;

// Las partes de un gradiente "a, b 40%, c 70%" separadas por comas de
// primer nivel (las de adentro de rgba() no cuentan).
function splitTop(s) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// radial-gradient(circle [at x% y%], color stop, …) → función que pinta.
function radialPainter(bg, rect) {
  const m = /radial-gradient\((.*)\)\s*$/.exec(bg);
  if (!m) return null;
  const parts = splitTop(m[1]);
  let cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
  if (!/rgba?\(|#|transparent/.test(parts[0])) {
    const at = /at\s+([\d.]+)%\s+([\d.]+)%/.exec(parts.shift());
    if (at) { cx = rect.x + (rect.w * Number(at[1])) / 100; cy = rect.y + (rect.h * Number(at[2])) / 100; }
  }
  // el radio "farthest-corner" de CSS, como en el navegador
  const r = Math.max(Math.hypot(cx - rect.x, cy - rect.y), Math.hypot(rect.x + rect.w - cx, rect.y + rect.h - cy), Math.hypot(cx - rect.x, rect.y + rect.h - cy), Math.hypot(rect.x + rect.w - cx, cy - rect.y));
  const stops = parts.map((p, i) => {
    const col = /transparent/.test(p) ? { r: 0, g: 0, b: 0, a: 0 } : rgba(p);
    const pct = /([\d.]+)%\s*$/.exec(p);
    return { col, at: pct ? Number(pct[1]) / 100 : i / Math.max(1, parts.length - 1) };
  }).filter((s) => s.col);
  if (!stops.length) return null;
  return (ctx) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    stops.forEach((s) => g.addColorStop(Math.min(1, Math.max(0, s.at)), css(s.col)));
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  };
}

// Estado heredado: opacidad acumulada, si va espejado, la mezcla y el
// orden de apilado (z-index de los antepasados).
function inherited(el, root) {
  let op = 1, flips = 0, blend = 'normal';
  const z = [];
  for (let n = el; n; n = n.parentElement) {
    if (n.hasAttribute && n.hasAttribute('data-photo-skip')) return null;
    const cs = getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden') return null;
    op *= Number(cs.opacity);
    if (cs.transform && cs.transform !== 'none') { try { if (new DOMMatrixReadOnly(cs.transform).a < 0) flips++; } catch (e) { /* sin matriz */ } }
    if (blend === 'normal' && cs.mixBlendMode && cs.mixBlendMode !== 'normal') blend = cs.mixBlendMode;
    if (cs.position !== 'static' && cs.zIndex !== 'auto') z.unshift(Number(cs.zIndex));
    if (n === root) break;
  }
  return op > 0.01 ? { op, flip: flips % 2 === 1, blend, z } : null;
}

const cmpZ = (a, b) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
};

const BLEND = { multiply: 'multiply', screen: 'screen', overlay: 'overlay', lighten: 'lighten', darken: 'darken' };

/**
 * Pinta en `ctx` lo que se ve en `crop` (en px de pantalla, relativo al
 * visor) del cuarto. `k`: escala de salida.
 */
export function paintRoom(ctx, viewport, world, crop, k, { onlyLocal = false } = {}) {
  const vr = viewport.getBoundingClientRect();
  const ox = vr.left + crop.x, oy = vr.top + crop.y;
  ctx.save();
  ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, crop.w, crop.h); ctx.clip();
  ctx.fillStyle = getComputedStyle(viewport).backgroundColor || '#F6EFE6';
  ctx.fillRect(0, 0, crop.w, crop.h);

  const layers = [];
  const all = [world, ...world.querySelectorAll('*')];
  all.forEach((el, order) => {
    const isImg = el.tagName === 'IMG';
    const cs = getComputedStyle(el);
    const bgc = rgba(cs.backgroundColor);
    const bgi = cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : null;
    const snow = el.classList && (el.classList.contains('pg-snow') || el.classList.contains('pg-rain'));
    if (!isImg && !(bgc && bgc.a > 0) && !bgi && !snow) return;
    if (el === world) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.right < ox || r.bottom < oy || r.left > ox + crop.w || r.top > oy + crop.h) return;
    const st = inherited(el, world);
    if (!st) return;
    const rect = { x: r.left - ox, y: r.top - oy, w: r.width, h: r.height };
    // la lluvia y la nieve van recortadas al vidrio de su ventana
    let clip = null;
    if (snow && el.parentElement) { const pr = el.parentElement.getBoundingClientRect(); clip = { x: pr.left - ox, y: pr.top - oy, w: pr.width, h: pr.height }; }
    layers.push({ el, isImg, cs, bgc, bgi, snow, rect, clip, st, order });
  });
  layers.sort((a, b) => cmpZ(a.st.z, b.st.z) || a.order - b.order);

  for (const L of layers) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, L.st.op);
    ctx.globalCompositeOperation = BLEND[L.st.blend] || 'source-over';
    if (L.clip) { ctx.beginPath(); ctx.rect(L.clip.x, L.clip.y, L.clip.w, L.clip.h); ctx.clip(); }
    const { x, y, w, h } = L.rect;
    if (L.isImg) {
      const img = L.el;
      // (una imagen de otro sitio "ensucia" el canvas y ya no se puede guardar)
      const local = /^(data|blob):/.test(img.currentSrc || img.src);
      if (img.complete && img.naturalWidth && (local || !onlyLocal)) {
        ctx.imageSmoothingEnabled = !img.classList.contains('pg-pixelated');
        if (L.st.flip) { ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); } else ctx.drawImage(img, x, y, w, h);
      }
    } else if (L.snow) {
      const rain = L.el.classList.contains('pg-rain');
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeStyle = 'rgba(220,235,255,0.7)';
      for (let yy = y; yy < y + h; yy += rain ? 14 : 13) {
        for (let xx = x + ((yy - y) % 26 ? 6 : 0); xx < x + w; xx += rain ? 11 : 13) {
          if (rain) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 3, yy + 8); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(xx, yy, 1.6, 0, Math.PI * 2); ctx.fill(); }
        }
      }
    } else {
      if (L.bgc && L.bgc.a > 0) {
        ctx.fillStyle = css(L.bgc);
        const br = parseFloat(L.cs.borderTopLeftRadius) || 0;
        if (br >= Math.min(w, h) / 2 - 0.5) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(x, y, w, h);
      }
      if (L.bgi) {
        // varios gradientes radiales separados por comas de primer nivel
        splitTop(L.bgi).forEach((g) => { const p = radialPainter(g, L.rect); if (p) p(ctx); });
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const photoDate = (d = new Date()) => `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;

/**
 * La foto con marco de polaroid. `focus`: x (px de pantalla) en que
 * centrar el recuadro (la mascota). Devuelve un data URL JPEG y la
 * miniatura.
 */
export function takePhoto({ viewport, world, focusX, caption, font, ink = '#3A2A3E', paper = '#FFFDF8', scale = 2 }) {
  const vr = viewport.getBoundingClientRect();
  // recuadro cuadrado alrededor de la mascota (lo más grande que entra)
  const side = Math.floor(Math.min(vr.width, vr.height));
  const cx = Math.max(side / 2, Math.min(vr.width - side / 2, (focusX ?? vr.left + vr.width / 2) - vr.left));
  const crop = { x: Math.round(cx - side / 2), y: Math.round(vr.height - side), w: side, h: side };
  const k = Math.max(1.5, Math.min(3, (scale * 360) / side));
  const S = Math.round(side * k);
  const pad = Math.round(S * 0.05), bottom = Math.round(S * 0.2);
  const c = document.createElement('canvas');
  c.width = S + pad * 2; c.height = S + pad + bottom;
  const ctx = c.getContext('2d');
  const paint = (onlyLocal) => {
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(pad, pad);
    paintRoom(ctx, viewport, world, crop, k, { onlyLocal });
    ctx.restore();
  };
  paint(false);
  try { ctx.getImageData(0, 0, 1, 1); } catch (e) { paint(true); }
  ctx.strokeStyle = 'rgba(58,42,62,0.18)';
  ctx.lineWidth = Math.max(1, S / 400);
  ctx.strokeRect(pad, pad, S, S);
  // el pie de foto, escrito a mano
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(bottom * 0.34)}px ${font || 'cursive'}`;
  ctx.fillText(caption || '', c.width / 2, S + pad + bottom * 0.45, c.width - pad * 2);
  const full = c.toDataURL('image/jpeg', 0.86);
  const t = document.createElement('canvas');
  const tw = 220;
  t.width = tw; t.height = Math.round((c.height * tw) / c.width);
  const tctx = t.getContext('2d');
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(c, 0, 0, t.width, t.height);
  return { image: full, thumb: t.toDataURL('image/jpeg', 0.8), width: c.width, height: c.height };
}
