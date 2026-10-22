// Puente entre los kits de dibujo y la interfaz: caché, cola (para no
// trabar el celular dibujando treinta cosas de golpe) y exportar a PNG.

import { drawArt } from './kit';
import { getStyle } from '../styles/registry';

const cache = new Map();
const inflight = new Map();
const MAX_CACHE = 900;

function remember(key, value) {
  cache.set(key, value);
  if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
}

export function artKey({ sourceKey, styleId, w, h, kind = 'art', pixel, fit }) {
  const st = getStyle(styleId);
  const px = st.art.kind === 'pixel' ? (pixel || st.art.pixel || 3) : 0;
  return `A|${st.id}|${kind}|${fit || ''}|${Math.round(w)}x${Math.round(h)}|${px ? px.toFixed(2) : ''}|${sourceKey}`;
}

export function peekArt(key) { return cache.get(key) || null; }

let queue = Promise.resolve();
function enqueue(job) {
  const run = queue.then(() => new Promise((r) => setTimeout(r, 0))).then(job);
  queue = run.catch(() => {});
  return run;
}

/** Igual que drawArt, pero con caché y en cola. */
export function renderArt(p) {
  const key = artKey(p);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  if (inflight.has(key)) return inflight.get(key);
  const job = enqueue(() => {
    const again = cache.get(key);
    if (again) return again;
    const v = drawArt(p);
    remember(key, v);
    return v;
  });
  inflight.set(key, job);
  job.finally(() => inflight.delete(key));
  return job;
}

/** Igual que renderArt pero al instante (para vistas previas que cambian mientras se edita). */
export function renderArtNow(p) {
  const key = artKey(p);
  const hit = cache.get(key);
  if (hit) return hit;
  const v = drawArt(p);
  remember(key, v);
  return v;
}

function loadImage(src) {
  return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; });
}

/** PNG (data URL) de un arte ya dibujado en un estilo, con capas encima opcionales. */
export async function artToPng({ markup, styleId, size, overlays = [] }) {
  const r = drawArt({ markup, styleId, w: size, h: size, kind: 'pet' });
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = !r.pixelated;
  const base = await loadImage(r.url);
  ctx.drawImage(base, 0, 0, size, size);
  for (const o of overlays) {
    if (!o) continue;
    try { ctx.drawImage(await loadImage(o), 0, 0, size, size); } catch (e) { /* capa rota: se ignora */ }
  }
  return c.toDataURL('image/png');
}

// Los retoques a mano de quien regala, en pixel art: se bajan a la
// rejilla con borde duro para que no queden trazos suaves sobre un sprite.
const pixCache = new Map();
export async function pixelateOverlay(src, grid) {
  const key = `${grid}|${src.length}|${src.slice(-80)}`;
  if (pixCache.has(key)) return pixCache.get(key);
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = grid; c.height = grid;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, grid, grid);
  const d = ctx.getImageData(0, 0, grid, grid);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i + 3] < 90) { d.data[i + 3] = 0; continue; }
    const a = d.data[i + 3] / 255;
    d.data[i] = Math.min(255, d.data[i] / a); d.data[i + 1] = Math.min(255, d.data[i + 1] / a); d.data[i + 2] = Math.min(255, d.data[i + 2] / a);
    d.data[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);
  const url = c.toDataURL('image/png');
  if (pixCache.size > 60) pixCache.delete(pixCache.keys().next().value);
  pixCache.set(key, url);
  return url;
}
