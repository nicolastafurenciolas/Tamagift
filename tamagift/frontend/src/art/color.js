// Utilidades de color para los kits de dibujo.

export function parseColor(c) {
  if (!c || c === 'none' || c === 'transparent') return null;
  c = c.trim();
  if (c[0] === '#') {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
  }
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map((v) => (v.endsWith('%') ? parseFloat(v) * 2.55 : parseFloat(v)));
    return [p[0], p[1], p[2], p[3] == null ? 1 : (m[1].includes('%') && p[3] > 1 ? p[3] / 255 : p[3])];
  }
  if (c === 'white') return [255, 255, 255, 1];
  if (c === 'black') return [0, 0, 0, 1];
  return null;
}

export const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const rgba = ([r, g, b], a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${+a.toFixed(3)})`;

export function mixRgb(a, b, t) { return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t); }

export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

export function hslToRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Desplaza un tono hacia `target` (grados) como mucho `amt` grados.
function towardHue(h, target, amt) {
  let d = ((target - h + 540) % 360) - 180;
  if (Math.abs(d) < amt) return target;
  return h + Math.sign(d) * amt;
}

// Rampa con "hue shifting": la sombra se enfría (hacia violeta; los
// amarillos hacia naranja) y la luz se calienta. Se conserva el CROMA y
// no la saturación HSL: un pastel no se vuelve chillón al oscurecerlo.
export function ramp(rgb, step) {
  if (!step) return rgb;
  const [h, s, l] = rgbToHsl(rgb);
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const gray = C < 0.04;
  let nh = h, nl, nc;
  if (step < 0) {
    const k = -step;
    nl = Math.max(0.04, l * (1 - 0.15 * k) - 0.015 * k);
    nc = gray ? Math.min(0.12, C + 0.03 * k) : Math.min(0.85, C * (1 + 0.22 * k) + 0.015 * k);
    const target = gray ? 265 : (h > 38 && h < 85 ? 22 : 262);
    nh = gray ? 265 : towardHue(h, target, 10 * k);
  } else {
    nl = Math.min(0.97, l + (1 - l) * 0.33 * step + 0.01);
    nc = C * (1 - 0.12 * step);
    nh = gray ? h : towardHue(h, 52, 7 * step);
  }
  const ns = Math.min(1, nc / Math.max(0.02, 1 - Math.abs(2 * nl - 1)));
  return hslToRgb([nh, ns, nl]);
}

// Color de contorno: el del relleno, muy oscurecido hacia la tinta.
export const inkOf = (rgb, ink = [43, 29, 51], t = 0.72) => mixRgb(ramp(rgb, -1), ink, t);

export const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

export function nearestOf(list, rgb) {
  let best = list[0], bd = Infinity;
  for (const c of list) {
    const dr = c[0] - rgb[0], dg = c[1] - rgb[1], db = c[2] - rgb[2];
    const rm = (c[0] + rgb[0]) / 2;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

// Generador pseudoaleatorio con semilla (para que el papel se corte
// igual cada vez).
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}
