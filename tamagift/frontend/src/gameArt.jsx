import React from 'react';

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
// Antes eran rectángulos de color con un cuadradito blanco encima. Un
// carro se reconoce por la silueta: cabina hundida, ruedas que asoman
// por debajo, faros y luces traseras.
export function Car({ color = '#D8697F', flip = false }) {
  const dark = mixHex(color, '#2B1F24', 0.34);
  const light = mixHex(color, '#FFF6E8', 0.42);
  return (
    <svg viewBox="0 0 64 30" width="100%" height="100%" style={{ display: 'block', transform: flip ? 'scaleX(-1)' : 'none', overflow: 'visible' }}>
      {/* sombra en el asfalto */}
      <ellipse cx="32" cy="27.5" rx="26" ry="3.2" fill="rgba(0,0,0,0.28)" />

      {/* ruedas: se dibujan primero para que el cuerpo las tape a medias */}
      {[19, 45].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="24" r="5.4" fill="#2E2A31" stroke={INK} strokeWidth="1.6" />
          <circle cx={cx} cy="24" r="2.1" fill="#9A9298" />
        </g>
      ))}

      {/* cuerpo */}
      <path
        d="M5 22 Q4 14 10 13 L18 13 Q23 5.5 32 5.5 Q41 5.5 45 13 L55 14 Q60 15 59.5 22 Q59.5 24.5 56 24.5 L8 24.5 Q5 24.5 5 22 Z"
        fill={color} stroke={INK} strokeWidth="1.9" strokeLinejoin="round"
      />
      {/* techo iluminado */}
      <path d="M18.5 13 Q23 6.4 32 6.4 Q40.5 6.4 44.3 13 Z" fill={light} opacity="0.95" />
      {/* franja baja en sombra, da grosor */}
      <path d="M6 20.5 L58.5 20.5 Q59 24 56 24.4 L8 24.4 Q5.4 24 6 20.5 Z" fill={dark} opacity="0.55" />

      {/* ventanas */}
      <path d="M21 12.4 Q24.5 7.8 31 7.6 L31 12.4 Z" fill="#DCF0FA" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M33 7.6 Q39 7.9 42.3 12.4 L33 12.4 Z" fill="#DCF0FA" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M22.5 11.6 Q25 8.9 29 8.6" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />

      {/* faro delantero y luz trasera */}
      <ellipse cx="57.5" cy="17.5" rx="2.3" ry="2.1" fill="#FFE9A8" stroke={INK} strokeWidth="1.1" />
      <ellipse cx="6.6" cy="17.6" rx="1.8" ry="1.9" fill="#E4645C" stroke={INK} strokeWidth="1.1" />
      {/* manija, para que no se vea vacío el costado */}
      <rect x="28" y="16.5" width="6" height="1.5" rx="0.75" fill={dark} opacity="0.7" />
    </svg>
  );
}

// ── Botón de Simón dice ────────────────────────────────────────────
// Cada botón tiene FORMA propia además de color: así se distinguen aun
// mirándolos de reojo, y no son cuatro cuadrados planos.
// Flor de cinco pétalos redondos (la de antes, de cuatro lóbulos finos,
// se leía como una X).
function flowerPath(cx, cy, R, r, n = 5) {
  const P = (ang, rad) => {
    const t = (ang * Math.PI) / 180;
    return `${(cx + Math.cos(t) * rad).toFixed(1)} ${(cy + Math.sin(t) * rad).toFixed(1)}`;
  };
  const step = 360 / n;
  let d = `M${P(-90 - step / 2, r)}`;
  for (let i = 0; i < n; i++) {
    const a = -90 + i * step;
    d += `C${P(a - step * 0.48, R * 1.22)} ${P(a + step * 0.48, R * 1.22)} ${P(a + step / 2, r)}`;
  }
  return `${d}Z`;
}

const PAD_SHAPES = {
  corazon: 'M32 50 C14 38 8 30 8 22 C8 15 13 10 19.5 10 C24.5 10 29 13 32 17.5 C35 13 39.5 10 44.5 10 C51 10 56 15 56 22 C56 30 50 38 32 50 Z',
  estrella: 'M32 8 L39.2 24.2 L56.5 26 L43.5 37.8 L47.4 55 L32 46 L16.6 55 L20.5 37.8 L7.5 26 L24.8 24.2 Z',
  flor: flowerPath(32, 33, 25.5, 11),
  // luna creciente gruesa: arco grande por fuera, mordida por dentro
  luna: 'M45 9 A24 24 0 1 0 45 55 A27 27 0 0 1 45 9 Z',
};

export function SimonPad({ shape, color, lit, dim }) {
  const glow = mixHex(color, '#FFFFFF', 0.55);
  const deep = mixHex(color, '#2B1F24', 0.3);
  const gid = `pad-${shape}`;
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={gid} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor={lit ? '#FFFFFF' : glow} />
          <stop offset="55%" stopColor={lit ? glow : color} />
          <stop offset="100%" stopColor={lit ? color : deep} />
        </radialGradient>
      </defs>

      {/* placa de fondo con volumen */}
      <rect x="2.5" y="3.5" width="59" height="59" rx="18" fill={deep} opacity={dim ? 0.5 : 0.9} />
      <rect x="2.5" y="2" width="59" height="58" rx="18" fill={`url(#${gid})`} stroke={INK} strokeWidth="2.4" />
      {/* brillo superior: lo que la hace ver de vidrio y no plana */}
      <path d="M11 16 Q20 6 34 6.5 Q24 11 18.5 21 Z" fill="#fff" opacity={lit ? 0.75 : 0.42} />

      {/* la figura (en pixel art, su versión hecha a mano: simétrica) */}
      <g transform="translate(32 33) scale(0.62) translate(-32 -32)" opacity={dim ? 0.55 : 1} data-skip="pixel">
        <path d={PAD_SHAPES[shape]} fill={lit ? '#FFFFFF' : 'rgba(255,255,255,0.9)'} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        {shape === 'flor' && <circle cx="32" cy="33" r="8.5" fill={lit ? glow : color} stroke={INK} strokeWidth="2" />}
      </g>
      <g data-only="pixel" data-px={`pad.${shape}`}>
        <rect x="12" y="13" width="40" height="40" fill="#FFFFFF" opacity="0" />
      </g>
    </svg>
  );
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

// ── Tubo con boca (Salta y vuela) ──────────────────────────────────
// Un tubo se lee como tubo por la boca más ancha del extremo; sin ella
// eran dos barras verdes.
export function Pipe({ side = 'top', color = '#7FA894' }) {
  const light = mixHex(color, '#FFF6E8', 0.34);
  const deep = mixHex(color, '#2B1F24', 0.3);
  const flip = side === 'top';
  return (
    <svg viewBox="0 0 54 120" width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block', transform: flip ? 'scaleY(-1)' : 'none' }}>
      {/* caña */}
      <rect x="7" y="10" width="40" height="112" fill={color} stroke={INK} strokeWidth="2.6" />
      <rect x="10.5" y="10" width="9" height="112" fill={light} opacity="0.75" />
      <rect x="38" y="10" width="7" height="112" fill={deep} opacity="0.5" />
      {/* boca */}
      <rect x="1.5" y="1.5" width="51" height="17" rx="4" fill={color} stroke={INK} strokeWidth="2.6" />
      <rect x="5" y="4" width="10" height="12" rx="2.5" fill={light} opacity="0.8" />
      <rect x="41" y="4" width="7" height="12" rx="2.5" fill={deep} opacity="0.45" />
    </svg>
  );
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
