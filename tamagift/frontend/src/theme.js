// ─────────────────────────────────────────────────────────────────────────
// Tamagift — sistema de diseño "hecho a mano / storybook"
// Un solo lugar para todos los colores, sombras y tipografías, para que
// TODA la app se sienta de la misma mano. Estos valores están espejados en
// index.css como variables CSS (--pg-*) para lo que se estilice por clases.
// ─────────────────────────────────────────────────────────────────────────

export const C = {
  // Papel / superficies
  paper: '#FBF3E9',      // fondo base, crema cálido tipo papel
  paperDeep: '#F0DFCC',  // zonas más hondas (piso de la escena)
  surface: '#FFFDF8',    // tarjetas
  surfaceAlt: '#FFF7EC', // tarjetas alternas / hover

  // Tinta (contornos y texto) — marrón cálido, nunca negro puro
  ink: '#4A3439',
  inkSoft: '#8A7167',    // texto secundario
  inkFaint: '#B7A79C',   // texto muy tenue / deshabilitado

  // Acentos
  rose: '#D8697F',
  roseDeep: '#BE4E67',
  roseSoft: '#FBDBE1',
  sage: '#7FA894',
  sageDeep: '#5E8873',
  sageSoft: '#DCEDE3',
  amber: '#E2A845',
  amberSoft: '#FBEAC6',
  sky: '#8FC7EE',
  skySoft: '#DDF0FB',
  lavender: '#C3A7EA',
  lavenderSoft: '#EEE4FB',
  peach: '#FFC29B',

  // Líneas / bordes cálidos
  line: '#EAD9C7',
  lineSoft: '#F2E6D8',
};

// Sombras cálidas (tinte marrón, nunca gris frío) — dan el aire "impreso".
export const SHADOW = {
  soft: '0 4px 14px rgba(120,80,55,0.10)',
  lifted: '0 10px 26px rgba(120,80,55,0.16)',
  pressed: 'inset 0 2px 5px rgba(120,80,55,0.14)',
  glowRose: '0 6px 20px rgba(216,105,127,0.28)',
  glowSage: '0 6px 20px rgba(127,168,148,0.28)',
};

export const FONT = {
  display: "'Baloo 2', system-ui, sans-serif", // títulos redonditos
  body: "'Nunito Sans', system-ui, sans-serif",  // cuerpo
  hand: "'Caveat', 'Baloo 2', cursive",          // acento a mano (notas)
};

// Paleta lista para los swatches del creador de mascotas.
export const DRAW_COLORS = [
  '#2E2422', '#FFFFFF', '#FFB98A', '#FFD9BE',
  '#FF9EB5', '#FFD3E0', '#8FDCB3', '#C9F0DC',
  '#9DCEEF', '#CFE8FA', '#C7ACEE', '#E3D6FA',
  '#FFE270', '#D8697F', '#7FA894', '#8B5E3C',
];

// Helper: mezcla un hex con blanco (para tintes suaves puntuales).
export function tint(hex, amount = 0.5) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
