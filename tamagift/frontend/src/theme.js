// ─────────────────────────────────────────────────────────────────────────
// Tamagift — tokens de diseño.
//
// La app tiene varios estilos visuales (styles/registry.js). Para que
// cambiar de estilo no obligue a reescribir cada componente, C, SHADOW y
// FONT ya no guardan colores fijos sino variables CSS: `C.rose` vale
// 'var(--pg-c-rose)', y applyStyle() llena esas variables con los
// valores del estilo activo. Cualquier `style={{ color: C.rose }}` sigue
// funcionando igual y cambia solo.
//
// Consecuencia: estos valores NO son hex. Para mezclar colores se usa
// tint(), que produce un color-mix() de CSS; y si algo necesita el color
// real (dibujar en un canvas, serializar un SVG) usa resolveColor().
// ─────────────────────────────────────────────────────────────────────────

import { COLOR_KEYS, getStyle } from './styles/registry';

const cssVar = (name) => `var(--pg-${name})`;

export const C = Object.fromEntries(COLOR_KEYS.map((k) => [k, cssVar(`c-${k}`)]));

export const SHADOW = {
  soft: cssVar('shadow-soft'),
  lifted: cssVar('shadow-lifted'),
  pressed: cssVar('shadow-pressed'),
  glowRose: cssVar('shadow-glow-rose'),
  glowSage: cssVar('shadow-glow-sage'),
};

export const FONT = {
  display: cssVar('font-display'),
  body: cssVar('font-body'),
  hand: cssVar('font-hand'),
};

// Paleta de los swatches del creador de mascotas. Son colores del DIBUJO,
// no de la interfaz: no cambian con el estilo.
export const DRAW_COLORS = [
  '#2E2422', '#FFFFFF', '#FFB98A', '#FFD9BE',
  '#FF9EB5', '#FFD3E0', '#8FDCB3', '#C9F0DC',
  '#9DCEEF', '#CFE8FA', '#C7ACEE', '#E3D6FA',
  '#FFE270', '#D8697F', '#7FA894', '#8B5E3C',
];

// Aclara un color mezclándolo con blanco (`amount` 0..1). Con un valor
// negativo lo oscurece. Acepta variables CSS, por eso devuelve un
// color-mix() y no un hex.
export function tint(color, amount = 0.5) {
  if (!amount) return color;
  const target = amount > 0 ? 'white' : 'black';
  const pct = Math.round(Math.min(1, Math.abs(amount)) * 100);
  return `color-mix(in srgb, ${color}, ${target} ${pct}%)`;
}

// Versión suave de un color para FONDOS (mosaicos de íconos, chips…):
// se mezcla con la superficie del estilo y no con blanco, así en los
// estilos oscuros queda un fondo oscuro teñido y no un parche claro.
export function soft(color, amount = 0.75) {
  const pct = Math.round(Math.min(1, Math.max(0, amount)) * 100);
  return `color-mix(in srgb, ${color}, var(--pg-c-surface) ${pct}%)`;
}

// Mismo color con transparencia (0..1).
export function alpha(color, a) {
  return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
}

// Valor real de un token (o de cualquier color) en el estilo activo.
export function resolveColor(value) {
  if (typeof value !== 'string' || !value.includes('var(')) return value;
  if (typeof document === 'undefined') return value;
  const root = getComputedStyle(document.documentElement);
  return value.replace(/var\((--[a-z0-9-]+)\)/gi, (_, name) => root.getPropertyValue(name).trim() || '#888888');
}

// Escribe en :root las variables del estilo y marca `data-style`, que
// es lo que usa index.css para los detalles propios de cada estilo
// (esquinas en píxel, brillo de neón, etc.).
export function applyStyle(styleId) {
  if (typeof document === 'undefined') return;
  const s = getStyle(styleId);
  const root = document.documentElement;
  for (const k of COLOR_KEYS) root.style.setProperty(`--pg-c-${k}`, s.ui[k]);
  root.style.setProperty('--pg-shadow-soft', s.shadow.soft);
  root.style.setProperty('--pg-shadow-lifted', s.shadow.lifted);
  root.style.setProperty('--pg-shadow-pressed', s.shadow.pressed);
  root.style.setProperty('--pg-shadow-glow-rose', s.shadow.glowRose);
  root.style.setProperty('--pg-shadow-glow-sage', s.shadow.glowSage);
  root.style.setProperty('--pg-font-display', s.fonts.display);
  root.style.setProperty('--pg-font-body', s.fonts.body);
  root.style.setProperty('--pg-font-hand', s.fonts.hand);
  root.dataset.style = s.id;
  root.style.colorScheme = s.dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', s.ui.paper);
}
