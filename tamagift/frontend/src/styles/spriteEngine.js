// ─────────────────────────────────────────────────────────────────
// Motor de sprites por estilo.
//
// Todo el arte de Tamagift está dibujado UNA vez (SVG de muebles,
// partes de la mascota, comida, juegos…) más lo que sube quien regala
// (PNG de la mascota, fotos). Este módulo toma cualquiera de esas
// fuentes y la redibuja en el estilo activo:
//
//   pixel   → rejilla de píxeles real: paleta limitada con rampas de
//             color, alfa duro y contorno de 1 píxel del color vecino
//             oscurecido (el "sel-out" de los sprites de consola).
//   lofi    → gradación nocturna: tonos fríos en la sombra, luz de
//             lámpara en lo claro, contorno suave y grano.
//   retro   → paleta de los 70 sin degradados, trama de puntos en las
//             sombras y contorno marrón grueso.
//   papel   → colores planos de cartulina, borde recortado irregular,
//             fibra de papel, filo claro y sombra corta de capa.
//   neon    → silueta oscura con tubos de luz en los bordes, del color
//             de cada zona, con resplandor.
//   sticker → colores vivos, borde blanco grueso y sombrita.
//
// Los resultados se guardan en caché por (fuente, tamaño, estilo): cada
// sprite se procesa una sola vez por estilo.
// ─────────────────────────────────────────────────────────────────

import { getStyle, COLOR_KEYS } from './registry';

// ── Caché y cola ─────────────────────────────────────────────────
const cache = new Map();      // key → { url, cssW, cssH }
const inflight = new Map();   // key → Promise
const MAX_CACHE = 600;

function remember(key, value) {
  cache.set(key, value);
  if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
}

export function peekSprite(key) {
  return cache.get(key) || null;
}

// Los trabajos se hacen de a uno, cediendo el hilo entre medio: con
// treinta sprites a la vez el celular no se congela al cambiar de estilo.
let queue = Promise.resolve();
function enqueue(job) {
  const run = queue.then(() => new Promise((r) => setTimeout(r, 0))).then(job);
  queue = run.catch(() => {});
  return run;
}

// Hash corto y rápido de un string (FNV-1a). Para data URLs gigantes se
// mira el largo y muestras del principio, el medio y el final.
export function hashString(s) {
  const str = s.length > 6000
    ? `${s.length}|${s.slice(0, 2000)}|${s.slice(s.length / 2 - 1000, s.length / 2 + 1000)}|${s.slice(-2000)}`
    : s;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// ── Utilidades de canvas ─────────────────────────────────────────
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function ctx2d(c) {
  return c.getContext('2d', { willReadFrequently: true });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('sprite-load'));
    img.decoding = 'async';
    img.src = src;
  });
}

// Dibuja `img` dentro de (x,y,w,h) respetando su proporción. Si hay que
// achicar mucho se hace por pasos de a la mitad: de un saque, el
// navegador se salta píxeles y quedan dientes.
function drawContain(ctx, img, x, y, w, h, fit = 'contain') {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const dw = iw * s, dh = ih * s;
  const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
  let src = img, sw = iw, sh = ih;
  while (sw / 2 > dw * 1.6 && sh / 2 > dh * 1.6) {
    const half = makeCanvas(sw / 2, sh / 2);
    const hc = half.getContext('2d');
    hc.imageSmoothingQuality = 'high';
    hc.drawImage(src, 0, 0, half.width, half.height);
    src = half; sw = half.width; sh = half.height;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (fit === 'cover') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(src, dx, dy, dw, dh);
  }
}

// Copia de `canvas` con su misma silueta pintada de un color.
function silhouette(canvas, color) {
  const s = makeCanvas(canvas.width, canvas.height);
  const c = s.getContext('2d');
  c.drawImage(canvas, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = color;
  c.fillRect(0, 0, s.width, s.height);
  return s;
}

// Silueta engordada `r` píxeles (para contornos y bordes de sticker).
function dilated(canvas, r, color) {
  const sil = silhouette(canvas, color);
  const out = makeCanvas(canvas.width, canvas.height);
  const c = out.getContext('2d');
  const steps = Math.max(12, Math.ceil(r * 6));
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    c.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r);
  }
  c.drawImage(sil, 0, 0);
  return out;
}

// Desenfoque de caja separable sobre un canal Float32 (rápido y igual
// en todos los navegadores, a diferencia de ctx.filter).
function boxBlur(src, w, h, r) {
  if (r < 1) return src;
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const norm = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    let acc = 0;
    const row = y * w;
    for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc * norm;
      acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc * norm;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

// Ruido de valor suave y determinista (mismo resultado cada vez: un
// sprite no "hierve" al redibujarse).
function hashNoise(x, y, seed = 1) {
  let n = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function smoothNoise(x, y, scale, seed) {
  const fx = x / scale, fy = y / scale;
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hashNoise(x0, y0, seed), b = hashNoise(x0 + 1, y0, seed);
  const c = hashNoise(x0, y0 + 1, seed), d = hashNoise(x0 + 1, y0 + 1, seed);
  return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
}

// ── Color ────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const s = hex.replace('#', '');
  const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function srgbToLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function toOklab(r, g, b) {
  const lr = srgbToLin(r), lg = srgbToLin(g), lb = srgbToLin(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

// Paleta pixel: rampas por tono con "hue shifting" (las sombras se van
// hacia el violeta y las luces hacia el amarillo, como pintan los
// pixel artists) + una rampa de grises cálidos. ~70 colores coherentes.
function buildPixelPalette() {
  const out = [];
  const hues = [0, 14, 28, 42, 54, 90, 140, 170, 195, 215, 240, 265, 290, 320, 340];
  const shades = [0.13, 0.24, 0.36, 0.5, 0.64, 0.77, 0.88, 0.95];
  hues.forEach((h) => {
    shades.forEach((l, i) => {
      const shift = (i - 3.5) * 6;                 // oscuro → violeta, claro → amarillo
      const toward = l < 0.5 ? 265 : 55;
      const dh = ((toward - h + 540) % 360) - 180;
      const hh = h + Math.sign(dh) * Math.min(Math.abs(dh), Math.abs(shift));
      const sat = l > 0.85 ? 0.85 : l < 0.2 ? 0.45 : 0.72;
      out.push(hslToRgb(hh, sat, l));
    });
  });
  // rampas apagadas: sin ellas un verde salvia o un rosa viejo caían
  // en un gris y las plantas se veían muertas
  [0, 25, 45, 100, 150, 200, 255, 320].forEach((h) => {
    [0.22, 0.36, 0.5, 0.64, 0.78, 0.9].forEach((l) => out.push(hslToRgb(h, 0.3, l)));
  });
  // marrones (madera, tierra) que el barrido de tonos deja cortos
  [[59, 36, 30], [94, 60, 44], [133, 87, 60], [173, 121, 82], [210, 160, 112], [236, 200, 152]].forEach((c) => out.push(c));
  // grises cálidos y los extremos
  [[22, 16, 26], [43, 29, 46], [74, 61, 74], [110, 98, 108], [152, 142, 146], [196, 188, 186], [232, 226, 220], [255, 255, 255]].forEach((c) => out.push(c));
  return out;
}

const RETRO_PALETTE = [
  '#FFF8EC', '#FCF2DC', '#F3E1BB', '#E8CB91', '#F2C14E', '#E7AE30', '#D9622A', '#B7552B', '#9E4216',
  '#E8907A', '#E7A3B4', '#B25476', '#8C8F35', '#A8AC4A', '#62661F', '#3C8C86', '#8CC6BE', '#9ED1C9',
  '#B79AC8', '#6B3E26', '#4A2A1A', '#7A5236', '#C9A27E',
].map(hexToRgb);

const NEON_HUES = [
  { h: 320, c: [255, 79, 216] },
  { h: 275, c: [181, 124, 255] },
  { h: 192, c: [77, 225, 255] },
  { h: 150, c: [61, 255, 154] },
  { h: 56, c: [255, 232, 77] },
  { h: 18, c: [255, 138, 92] },
];

function paletteLab(pal) {
  return pal.map((c) => ({ c, lab: toOklab(c[0], c[1], c[2]) }));
}
const PIXEL_PAL = paletteLab(buildPixelPalette());
const RETRO_PAL = paletteLab(RETRO_PALETTE);

function nearest(pal, r, g, b, memo) {
  const key = (r >> 2) << 12 | (g >> 2) << 6 | (b >> 2);
  const hit = memo.get(key);
  if (hit) return hit;
  const [L, A, B] = toOklab(r, g, b);
  let best = pal[0].c, bd = Infinity;
  for (let i = 0; i < pal.length; i++) {
    const p = pal[i].lab;
    const dl = (p[0] - L) * 1.15, da = p[1] - A, db = p[2] - B;
    const d = dl * dl + da * da + db * db;
    if (d < bd) { bd = d; best = pal[i].c; }
  }
  memo.set(key, best);
  return best;
}
const pixelMemo = new Map();
const retroMemo = new Map();

// Corte por la mediana: reduce los colores opacos de una imagen a `n`
// tonos representativos.
function medianCut(data, n) {
  const px = [];
  const step = Math.max(1, Math.floor(data.length / 4 / 6000));
  for (let i = 0; i < data.length; i += 4 * step) if (data[i + 3] >= 90) px.push([data[i], data[i + 1], data[i + 2]]);
  if (!px.length) return [[200, 190, 180]];
  let boxes = [px];
  while (boxes.length < n) {
    let bi = -1, bestRange = -1, ch = 0;
    boxes.forEach((b, i) => {
      if (b.length < 2) return;
      for (let c = 0; c < 3; c++) {
        let mn = 255, mx = 0;
        for (const p of b) { if (p[c] < mn) mn = p[c]; if (p[c] > mx) mx = p[c]; }
        if (mx - mn > bestRange) { bestRange = mx - mn; bi = i; ch = c; }
      }
    });
    if (bi < 0 || bestRange < 10) break;
    const b = boxes[bi].sort((p, q) => p[ch] - q[ch]);
    const mid = b.length >> 1;
    boxes.splice(bi, 1, b.slice(0, mid), b.slice(mid));
  }
  return boxes.map((b) => {
    const s = [0, 0, 0];
    b.forEach((p) => { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; });
    return s.map((v) => v / b.length);
  });
}

const BAYER4 =[0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);

// ── Los estilos ──────────────────────────────────────────────────

function processPixel(img, w, h, opts) {
  const P = opts.pixel || 3;
  const aw = Math.max(6, Math.round(w / P));
  const ah = Math.max(6, Math.round(h / P));
  const canvas = makeCanvas(aw, ah);
  const c = ctx2d(canvas);
  // 1 píxel libre en cada borde para el contorno.
  // Los íconos ya son puro trazo: con contorno extra se verían gordos.
  const pad = opts.kind === 'photo' || opts.kind === 'surface' || opts.kind === 'icon' ? 0 : 1;
  drawContain(c, img, pad, pad, aw - pad * 2, ah - pad * 2, opts.fit);
  const id = c.getImageData(0, 0, aw, ah);
  const d = id.data;
  // Solo las fotos se tramean: en una pared lisa la trama se veía como
  // ruido; ahí es mejor que el degradado quede en franjas.
  const dither = opts.kind === 'photo';
  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      const i = (y * aw + x) * 4;
      if (d[i + 3] < 100) { d[i + 3] = 0; continue; }
      d[i + 3] = 255;
      let r = d[i], g = d[i + 1], b = d[i + 2];
      if (dither) {
        const t = BAYER4[(y & 3) * 4 + (x & 3)] * (opts.kind === 'photo' ? 18 : 7);
        r = Math.max(0, Math.min(255, r + t)); g = Math.max(0, Math.min(255, g + t)); b = Math.max(0, Math.min(255, b + t));
      }
      const q = nearest(PIXEL_PAL, r, g, b, pixelMemo);
      d[i] = q[0]; d[i + 1] = q[1]; d[i + 2] = q[2];
    }
  }
  if (pad) {
    // Contorno: cada hueco vecino de un píxel lleno toma el color de ese
    // píxel muy oscurecido. Un contorno negro parejo se ve tosco; este se
    // ve como dibujado a mano píxel por píxel.
    const src = new Uint8ClampedArray(d);
    const ink = [43, 29, 46];
    for (let y = 0; y < ah; y++) {
      for (let x = 0; x < aw; x++) {
        const i = (y * aw + x) * 4;
        if (src[i + 3]) continue;
        let n = -1;
        if (x > 0 && src[i - 4 + 3]) n = i - 4;
        else if (x < aw - 1 && src[i + 4 + 3]) n = i + 4;
        else if (y > 0 && src[i - aw * 4 + 3]) n = i - aw * 4;
        else if (y < ah - 1 && src[i + aw * 4 + 3]) n = i + aw * 4;
        if (n < 0) continue;
        d[i] = Math.round(src[n] * 0.28 + ink[0] * 0.72);
        d[i + 1] = Math.round(src[n + 1] * 0.28 + ink[1] * 0.72);
        d[i + 2] = Math.round(src[n + 2] * 0.28 + ink[2] * 0.72);
        d[i + 3] = 255;
      }
    }
  }
  c.putImageData(id, 0, 0);
  return { canvas, cssW: aw * P, cssH: ah * P, pixelated: true };
}

function workSize(w, h, opts) {
  const dpr = Math.min(2, opts.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1);
  const scale = Math.min(dpr, 1400 / Math.max(w, h));
  return { W: Math.max(4, Math.round(w * scale)), H: Math.max(4, Math.round(h * scale)), k: scale };
}

function baseLayer(img, W, H, pad, fit) {
  const a = makeCanvas(W, H);
  drawContain(ctx2d(a), img, pad, pad, W - pad * 2, H - pad * 2, fit);
  return a;
}

function processSticker(img, w, h, opts) {
  const { W, H, k } = workSize(w, h, opts);
  const isSurface = opts.kind === 'surface' || opts.kind === 'photo';
  const pad = isSurface ? 0 : Math.round(6 * k);
  const art = baseLayer(img, W, H, pad, opts.fit);
  const ac = ctx2d(art);
  const id = ac.getImageData(0, 0, W, H);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const [hh, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
    const rgb = hslToRgb(hh, Math.min(1, s * 1.12), Math.min(0.97, l * 1.02 + 0.015));
    d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2];
  }
  ac.putImageData(id, 0, 0);
  if (isSurface) return { canvas: art, cssW: w, cssH: h };
  const out = makeCanvas(W, H);
  const oc = out.getContext('2d');
  const border = dilated(art, 4.2 * k, '#FFFFFF');
  const rim = dilated(art, 5.3 * k, '#E7D6DD');
  oc.save();
  oc.shadowColor = 'rgba(91,58,71,0.28)';
  oc.shadowBlur = 6 * k;
  oc.shadowOffsetY = 3 * k;
  oc.drawImage(rim, 0, 0);
  oc.restore();
  oc.drawImage(border, 0, 0);
  oc.drawImage(art, 0, 0);
  return { canvas: out, cssW: w, cssH: h };
}

function processPapel(img, w, h, opts) {
  const { W, H, k } = workSize(w, h, opts);
  const isSurface = opts.kind === 'surface' || opts.kind === 'photo';
  const pad = isSurface ? 0 : Math.round(4 * k);
  const src = baseLayer(img, W, H, pad, opts.fit);
  const sd = ctx2d(src).getImageData(0, 0, W, H).data;
  // Borde recortado con tijera: se desplaza todo un poquito según un
  // ruido suave, así la silueta deja de ser perfecta.
  const art = makeCanvas(W, H);
  const ac = ctx2d(art);
  const out = ac.createImageData(W, H);
  const d = out.data;
  const amp = isSurface ? 0 : 1.4 * k;
  const seed = opts.seed || 7;
  // Pocas cartulinas: los colores de la imagen se reducen a 7-10 tonos
  // planos (corte por la mediana). Cada tono es "un pedazo de papel".
  const pal = medianCut(sd, isSurface ? 10 : 7).map((c) => [c[0] * 0.92 + 14, c[1] * 0.92 + 12, c[2] * 0.92 + 9]);
  const idx = new Int16Array(W * H).fill(-1);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = amp ? Math.round((smoothNoise(x, y, 9 * k, seed) - 0.5) * 2 * amp) : 0;
      const dy = amp ? Math.round((smoothNoise(x + 99, y + 7, 9 * k, seed) - 0.5) * 2 * amp) : 0;
      const sx = Math.min(W - 1, Math.max(0, x + dx)), sy = Math.min(H - 1, Math.max(0, y + dy));
      const si = (sy * W + sx) * 4;
      if (sd[si + 3] < 90) continue;
      let best = 0, bd = Infinity;
      for (let p = 0; p < pal.length; p++) {
        const dr = pal[p][0] - sd[si], dg = pal[p][1] - sd[si + 1], db = pal[p][2] - sd[si + 2];
        const dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
        if (dd < bd) { bd = dd; best = p; }
      }
      idx[y * W + x] = best;
    }
  }
  // Cada capa de papel le hace sombra a la de abajo: donde cambia el
  // color, el lado de abajo a la derecha queda un poco más oscuro.
  const o = Math.max(1, Math.round(1.6 * k));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const c = idx[p];
      if (c < 0) continue;
      const i = p * 4;
      const up = y >= o && x >= o ? idx[p - o * W - o] : c;
      const edgeShade = up !== c && up >= 0 ? 0.84 : 1;
      const fiber = 0.95 + smoothNoise(x, y, 1.6 * k, 3) * 0.05 + (hashNoise(x, y, 5) - 0.5) * 0.04;
      const f = fiber * edgeShade;
      d[i] = Math.min(255, pal[c][0] * f); d[i + 1] = Math.min(255, pal[c][1] * f); d[i + 2] = Math.min(255, pal[c][2] * f);
      d[i + 3] = 255;
    }
  }
  ac.putImageData(out, 0, 0);
  if (isSurface) return { canvas: art, cssW: w, cssH: h };
  const res = makeCanvas(W, H);
  const rc = res.getContext('2d');
  rc.save();
  rc.shadowColor = 'rgba(61,50,41,0.38)';
  rc.shadowBlur = 2.5 * k;
  rc.shadowOffsetX = 1.6 * k;
  rc.shadowOffsetY = 2.6 * k;
  rc.drawImage(silhouette(art, '#3D3229'), 0, 0);
  rc.restore();
  // Filo claro del corte, arriba a la izquierda, donde le da la luz.
  rc.globalAlpha = 0.85;
  rc.drawImage(silhouette(art, '#FFFDF6'), -0.9 * k, -0.9 * k);
  rc.globalAlpha = 1;
  rc.drawImage(art, 0, 0);
  return { canvas: res, cssW: w, cssH: h };
}

function processLofi(img, w, h, opts) {
  const { W, H, k } = workSize(w, h, opts);
  const isSurface = opts.kind === 'surface' || opts.kind === 'photo';
  const pad = isSurface ? 0 : Math.round(2.5 * k);
  const art = baseLayer(img, W, H, pad, opts.fit);
  const ac = ctx2d(art);
  const id = ac.getImageData(0, 0, W, H);
  const d = id.data;
  const night = isSurface ? 1 : 0.6;
  const dim = isSurface ? 0.62 : 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (!d[i + 3]) continue;
      let r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const lum = 0.3 * r + 0.59 * g + 0.11 * b;
      // menos saturación y luz de noche: azul-violeta en lo oscuro…
      r = lum + (r - lum) * 0.8; g = lum + (g - lum) * 0.8; b = lum + (b - lum) * 0.8;
      r = r * (1 - night * 0.36) + 0.10 * night;
      g = g * (1 - night * 0.42) + 0.07 * night;
      b = b * (1 - night * 0.2) + 0.16 * night;
      // …y lámpara cálida en lo más claro.
      const warm = Math.max(0, lum - 0.62) * 0.55;
      r += warm * 0.9; g += warm * 0.62; b += warm * 0.2;
      const n = (hashNoise(x, y, 11) - 0.5) * 0.045;
      d[i] = Math.max(0, Math.min(255, (r * dim + n) * 255));
      d[i + 1] = Math.max(0, Math.min(255, (g * dim + n) * 255));
      d[i + 2] = Math.max(0, Math.min(255, (b * dim * 1.08 + n) * 255));
    }
  }
  ac.putImageData(id, 0, 0);
  if (isSurface) return { canvas: art, cssW: w, cssH: h };
  const out = makeCanvas(W, H);
  const oc = out.getContext('2d');
  // Contorno suave y borde de luz de lámpara.
  oc.globalAlpha = 0.9;
  oc.drawImage(dilated(art, 1.6 * k, '#17121F'), 0, 0);
  oc.globalAlpha = 0.45;
  oc.drawImage(silhouette(art, '#FFC77E'), -1.2 * k, -1.4 * k);
  oc.globalAlpha = 1;
  oc.drawImage(art, 0, 0);
  return { canvas: out, cssW: w, cssH: h };
}

function processRetro(img, w, h, opts) {
  const { W, H, k } = workSize(w, h, opts);
  const isSurface = opts.kind === 'surface' || opts.kind === 'photo';
  const pad = isSurface ? 0 : Math.round(3.5 * k);
  const art = baseLayer(img, W, H, pad, opts.fit);
  const ac = ctx2d(art);
  const id = ac.getImageData(0, 0, W, H);
  const d = id.data;
  const cell = Math.max(3, Math.round(4 * k));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] < 90) { d[i + 3] = 0; continue; }
      d[i + 3] = 255;
      const lum = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
      let q = nearest(RETRO_PAL, d[i], d[i + 1], d[i + 2], retroMemo);
      let [r, g, b] = q;
      // Trama de puntos en la sombra, como impresión barata de revista.
      if (lum < 0.62) {
        const cx = (Math.floor(x / cell) + 0.5) * cell, cy = (Math.floor(y / cell) + 0.5) * cell;
        const rad = (0.62 - lum) * cell * 0.9;
        if ((x - cx) ** 2 + (y - cy) ** 2 < rad * rad) { r *= 0.72; g *= 0.68; b *= 0.66; }
      }
      const n = (hashNoise(x, y, 13) - 0.5) * 10;
      d[i] = r + n; d[i + 1] = g + n; d[i + 2] = b + n;
    }
  }
  ac.putImageData(id, 0, 0);
  if (isSurface) return { canvas: art, cssW: w, cssH: h };
  const out = makeCanvas(W, H);
  const oc = out.getContext('2d');
  oc.drawImage(dilated(art, 2.2 * k, '#4A2A1A'), 0, 0);
  oc.drawImage(art, 0, 0);
  return { canvas: out, cssW: w, cssH: h };
}

function processNeon(img, w, h, opts) {
  const { W, H, k } = workSize(w, h, opts);
  const isSurface = opts.kind === 'surface';
  const isPhoto = opts.kind === 'photo';
  const pad = isSurface || isPhoto ? 0 : Math.round(6 * k);
  const base = baseLayer(img, W, H, pad, opts.fit);
  const bc = ctx2d(base);
  const sd = bc.getImageData(0, 0, W, H).data;
  const N = W * H;

  if (isPhoto) {
    // Las fotos se dejan reconocibles: solo se oscurecen y se tiñen.
    for (let i = 0; i < sd.length; i += 4) {
      const lum = (0.3 * sd[i] + 0.59 * sd[i + 1] + 0.11 * sd[i + 2]) / 255;
      sd[i] = sd[i] * 0.55 + lum * 60 + 20; sd[i + 1] = sd[i + 1] * 0.45 + 8; sd[i + 2] = sd[i + 2] * 0.6 + lum * 70 + 30;
    }
    const pc = makeCanvas(W, H);
    const pctx = ctx2d(pc);
    const pid = pctx.createImageData(W, H);
    pid.data.set(sd);
    pctx.putImageData(pid, 0, 0);
    return { canvas: pc, cssW: w, cssH: h };
  }

  const alphaF = new Float32Array(N), lumF = new Float32Array(N);
  const rF = new Float32Array(N), gF = new Float32Array(N), bF = new Float32Array(N);
  for (let p = 0, i = 0; p < N; p++, i += 4) {
    const a = sd[i + 3] / 255;
    alphaF[p] = a;
    lumF[p] = (0.3 * sd[i] + 0.59 * sd[i + 1] + 0.11 * sd[i + 2]) / 255;
    // color de la zona: se pondera por lo claro para que los contornos
    // oscuros no tiñan el tubo de luz de negro.
    const wgt = a * (0.15 + lumF[p]);
    rF[p] = sd[i] * wgt; gF[p] = sd[i + 1] * wgt; bF[p] = sd[i + 2] * wgt;
    alphaF[p] = a;
  }
  const rad = Math.max(2, Math.round(3 * k));
  const wsum = new Float32Array(N);
  for (let p = 0; p < N; p++) wsum[p] = alphaF[p] * (0.15 + lumF[p]);
  const rB = boxBlur(rF, W, H, rad), gB = boxBlur(gF, W, H, rad), bB = boxBlur(bF, W, H, rad), wB = boxBlur(wsum, W, H, rad);

  // Bordes: el filo de la silueta + los cambios fuertes de luz adentro.
  const edge = new Float32Array(N);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const p = y * W + x;
      const ax = alphaF[p + 1] - alphaF[p - 1], ay = alphaF[p + W] - alphaF[p - W];
      const lx = lumF[p + 1] * alphaF[p + 1] - lumF[p - 1] * alphaF[p - 1];
      const ly = lumF[p + W] * alphaF[p + W] - lumF[p - W] * alphaF[p - W];
      const ea = Math.min(1, Math.hypot(ax, ay) * 1.6);
      const el = Math.min(1, Math.max(0, Math.hypot(lx, ly) - (isSurface ? 0.12 : 0.16)) * 3.2);
      edge[p] = Math.max(ea, el);
    }
  }
  // Tubos de 1-2 px: se engordan un poco.
  const tube = boxBlur(edge, W, H, Math.max(1, Math.round(0.8 * k)));
  const glow = boxBlur(boxBlur(edge, W, H, Math.round(3 * k)), W, H, Math.round(3 * k));

  const out = makeCanvas(W, H);
  const oc = ctx2d(out);
  const od = oc.createImageData(W, H);
  const d = od.data;
  const neonCache = new Map();
  for (let p = 0, i = 0; p < N; p++, i += 4) {
    const ws = wB[p];
    let nr = 181, ng = 124, nb = 255;
    if (ws > 0.001) {
      const r = rB[p] / ws, g = gB[p] / ws, b = bB[p] / ws;
      const key = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
      let nc = neonCache.get(key);
      if (!nc) {
        const [hh, s, l] = rgbToHsl(r, g, b);
        if (s < 0.14) nc = l > 0.55 ? [236, 222, 255] : [181, 124, 255];
        else {
          let best = NEON_HUES[0], bd = 999;
          NEON_HUES.forEach((n) => { const dd = Math.abs(((n.h - hh + 540) % 360) - 180); if (dd < bd) { bd = dd; best = n; } });
          nc = best.c;
        }
        neonCache.set(key, nc);
      }
      [nr, ng, nb] = nc;
    }
    const t = Math.min(1, tube[p] * 1.7);
    const gl = Math.min(1, glow[p] * 2.4) * 0.7;
    // Tres capas, de abajo hacia arriba (composición "over"):
    // relleno de vidrio oscuro → resplandor → núcleo del tubo.
    const fill = isSurface ? 0.3 : 0.17;
    let cr = 12 + nr * fill, cg = 7 + ng * fill, cb = 26 + nb * fill;
    let ca = alphaF[p] * (isSurface ? 1 : 0.92);
    const over = (r2, g2, b2, a2) => {
      const oa = a2 + ca * (1 - a2);
      if (oa <= 0) return;
      cr = (r2 * a2 + cr * ca * (1 - a2)) / oa;
      cg = (g2 * a2 + cg * ca * (1 - a2)) / oa;
      cb = (b2 * a2 + cb * ca * (1 - a2)) / oa;
      ca = oa;
    };
    if (gl > 0.01) over(nr, ng, nb, gl);
    if (t > 0.05) over(nr * 0.7 + 76, ng * 0.7 + 76, nb * 0.7 + 76, t);
    if (ca <= 0.01) continue;
    d[i] = Math.min(255, cr);
    d[i + 1] = Math.min(255, cg);
    d[i + 2] = Math.min(255, cb);
    d[i + 3] = Math.min(255, ca * 255);
  }
  oc.putImageData(od, 0, 0);
  return { canvas: out, cssW: w, cssH: h };
}

const PROCESSORS = {
  pixel: processPixel,
  sticker: processSticker,
  papel: processPapel,
  lofi: processLofi,
  retro: processRetro,
  neon: processNeon,
};

// ── SVG → imagen ─────────────────────────────────────────────────
// El arte en vivo usa variables CSS (C.rose…) y `currentColor`; un SVG
// cargado como imagen no ve las variables de la página, así que se
// reemplazan por los valores del estilo destino antes de cargarlo.
function resolveVars(markup, styleId) {
  const s = getStyle(styleId);
  return markup.replace(/var\(--pg-c-([a-zA-Z]+)\)/g, (m, k) => (COLOR_KEYS.includes(k) ? s.ui[k] : '#888888'));
}

function prepareSvg(markup, w, h, styleId) {
  let m = resolveVars(markup, styleId);
  m = m.replace(/^<svg\b([^>]*)>/, (all, attrs) => {
    let a = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    if (!/xmlns=/.test(a)) a += ' xmlns="http://www.w3.org/2000/svg"';
    if (!/viewBox=/.test(attrs) && /width="(\d+)/.test(attrs)) {
      const vw = attrs.match(/width="([\d.]+)/)[1], vh = (attrs.match(/height="([\d.]+)/) || [0, vw])[1];
      a += ` viewBox="0 0 ${vw} ${vh}"`;
    }
    return `<svg${a} width="${Math.round(w)}" height="${Math.round(h)}">`;
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(m)}`;
}

/**
 * Redibuja un sprite en un estilo.
 * @param {object} p
 * @param {string} [p.markup]  SVG serializado (arte de la app)
 * @param {string} [p.src]     URL o data URL de una imagen
 * @param {number} p.w, p.h    tamaño en px de pantalla
 * @param {string} p.styleId
 * @param {string} [p.kind]    'art' | 'pet' | 'photo' | 'surface'
 * @param {number} [p.pixel]   tamaño del píxel de arte (solo pixel)
 * @param {string} [p.fit]     'contain' | 'cover'
 */
export function renderSprite(p) {
  const style = getStyle(p.styleId);
  const kind = p.kind || 'art';
  const fit = p.fit || (kind === 'photo' ? 'cover' : 'contain');
  const pixel = p.pixel || style.art.pixel || 3;
  const srcKey = p.sourceKey || hashString(p.markup || p.src || '');
  const key = `${style.id}|${kind}|${fit}|${Math.round(p.w)}x${Math.round(p.h)}|${pixel}|${srcKey}`;
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  if (inflight.has(key)) return inflight.get(key);

  const job = enqueue(async () => {
    // Las fuentes vectoriales se cargan grandes para que el reescalado
    // tenga detalle de sobra.
    const loadW = Math.max(64, Math.min(1600, p.w * 2.5));
    const loadH = Math.max(64, Math.min(1600, p.h * 2.5));
    const url = p.markup ? prepareSvg(p.markup, loadW, loadH, style.id) : p.src;
    const img = await loadImage(url);
    const proc = PROCESSORS[style.art.kind] || processSticker;
    let res;
    try {
      res = proc(img, p.w, p.h, { kind, fit, pixel, seed: (srcKey.charCodeAt(0) || 7) % 97 });
    } catch (e) {
      // Una imagen de otro dominio sin permiso no se puede leer: se
      // devuelve tal cual antes que dejar un hueco.
      return { url, cssW: p.w, cssH: p.h, pixelated: false, raw: true };
    }
    const value = { url: res.canvas.toDataURL('image/png'), cssW: res.cssW, cssH: res.cssH, pixelated: !!res.pixelated };
    remember(key, value);
    return value;
  });
  inflight.set(key, job);
  job.finally(() => inflight.delete(key));
  return job;
}

export function spriteCacheKey(p, styleId) {
  const style = getStyle(styleId);
  const kind = p.kind || 'art';
  const fit = p.fit || (kind === 'photo' ? 'cover' : 'contain');
  const pixel = p.pixel || style.art.pixel || 3;
  const srcKey = p.sourceKey || hashString(p.markup || p.src || '');
  return `${style.id}|${kind}|${fit}|${Math.round(p.w)}x${Math.round(p.h)}|${pixel}|${srcKey}`;
}
