import React from 'react';
import { simonPadSvg, carSvg, pillarSvg } from './art/minigames';
import { asElement } from './art/room/draw';

// ─────────────────────────────────────────────────────────────────
// Arte de los minijuegos.
//
// Vive aparte de TamagiftGame.jsx por lo mismo que el arte del cuarto
// vive en roomCatalog.jsx: son dibujos, no lógica, y mezclarlos hace
// ilegibles los dos.
//
// Mismas reglas que el resto del arte del proyecto:
//   · contorno de tinta cálida (#4A3439), nunca negro puro
//   · volumen con una cara iluminada arriba y una sombra al lado
//   · sombra de contacto contra el suelo, si algo se apoya
//   · nada generado por IA: todo son formas dibujadas a mano
// ─────────────────────────────────────────────────────────────────

const INK = '#4A3439';

// ── Carro (Cruzar la calle) ────────────────────────────────────────
// El autito de la calle (art/minigames.js: carSvg): de costado, con el
// techo y el capó vistos un poco desde arriba, ventanas con brillo,
// faros, parachoques y ruedas bajo su pasarruedas. `kind`: 0 burbuja,
// 1 furgoneta, 2 gotita.
export function Car({ color = '#D8697F', flip = false, kind = 0 }) {
  const m = carSvg(color, kind);
  return asElement(React, flip ? m.replace(/^(<svg[^>]*>)([\s\S]*)(<\/svg>)$/, '$1<g transform="translate(64 0) scale(-1 1)">$2</g>$3') : m);
}

// ── Botón de Simón dice ────────────────────────────────────────────
// Una gomita de colores hundida en la tapa de la cajita de música (el
// dibujo vive en art/minigames.js: simonPadSvg). Cada botón tiene FORMA
// propia además de color: se distinguen aun mirándolos de reojo; en
// pixel art la figura es la hecha a mano (art/pixel/game.js).
export function SimonPad({ shape, color, lit = false, dim = false }) {
  return asElement(React, simonPadSvg(shape, color, lit, dim));
}

export const SIMON_PADS = [
  { id: 0, shape: 'corazon', color: '#E4647E' },
  { id: 1, shape: 'estrella', color: '#E9A83C' },
  { id: 2, shape: 'flor', color: '#6FB894' },
  { id: 3, shape: 'luna', color: '#7FA9DE' },
];

// ── Golosina (Conecta 3) ───────────────────────────────────────────
// Caramelos con brillo y contorno, no emojis sueltos sobre un cuadrado
// de color. Cada tipo tiene forma distinta para que se distingan sin
// depender solo del color.
const CANDY_SHAPES = ['circulo', 'rombo', 'gota', 'flor', 'estrella'];

export function Candy({ type = 0, label }) {
  const palette = ['#F2647E', '#F0B23C', '#69B9E4', '#7ECB96', '#B98BE0'];
  const color = palette[type % palette.length];
  const light = mixHex(color, '#FFFFFF', 0.5);
  const deep = mixHex(color, '#2B1F24', 0.28);
  const shape = CANDY_SHAPES[type % CANDY_SHAPES.length];
  const gid = `candy-${type}`;

  const body = {
    circulo: <circle cx="32" cy="33" r="23" />,
    rombo: <path d="M32 8 L57 33 L32 58 L7 33 Z" />,
    gota: <path d="M32 7 C44 20 52 27 52 37 C52 48 43 57 32 57 C21 57 12 48 12 37 C12 27 20 20 32 7 Z" />,
    flor: <path d="M32 9 C38 9 42 14 41 20 C47 17 53 20 54 26 C55 32 51 37 45 37 C50 41 50 48 45 52 C40 56 33 54 32 47 C31 54 24 56 19 52 C14 48 14 41 19 37 C13 37 9 32 10 26 C11 20 17 17 23 20 C22 14 26 9 32 9 Z" />,
    estrella: <path d="M32 7 L39 25 L58 27 L44 39 L48 57 L32 47.5 L16 57 L20 39 L6 27 L25 25 Z" />,
  }[shape];

  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ display: 'block' }} role="img" aria-label={label} data-px-sprite={`candy.${type % CANDY_SHAPES.length}`}>
      <defs>
        <radialGradient id={gid} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor={light} />
          <stop offset="62%" stopColor={color} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
      </defs>
      {/* sombra propia, para que no parezca pegatina plana */}
      <g transform="translate(0 2.5)" opacity="0.22">
        {React.cloneElement(body, { fill: INK, stroke: 'none' })}
      </g>
      {React.cloneElement(body, { fill: `url(#${gid})`, stroke: INK, strokeWidth: 2.6, strokeLinejoin: 'round' })}
      {/* destello de vidrio */}
      <ellipse cx="24" cy="22" rx="7.5" ry="5" fill="#fff" opacity="0.72" transform="rotate(-28 24 22)" />
      <circle cx="41" cy="21" r="2.4" fill="#fff" opacity="0.5" />
    </svg>
  );
}

// ── Pilar de golosina (Salta y vuela) ──────────────────────────────
// Antes era un tubo verde liso; ahora es un bastón a rayas con su
// glaseado (art/minigames.js: pillarSvg). `side="top"` cuelga.
export function Pipe({ side = 'bottom' }) {
  return asElement(React, pillarSvg(160, side === 'top' ? 'top' : 'bottom', 0));
}

// ── Utilidad de color ──────────────────────────────────────────────
// Mezcla dos colores hex. Igual que el `mix` de roomCatalog.jsx, pero
// aquí duplicado a propósito: importar de ida y vuelta entre el arte
// del cuarto y el de los juegos crearía un enredo entre módulos que no
// tienen nada que ver.
function mixHex(hex, target, amount) {
  const parse = (h) => {
    const s = (h || '#888888').replace('#', '');
    const full = s.length === 3 ? s.split('').map((x) => x + x).join('') : s;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(target);
  const m = (a, b) => Math.round(a + (b - a) * amount);
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
}
