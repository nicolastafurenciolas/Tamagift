import React from 'react';

// ─────────────────────────────────────────────────────────────────
// Sprites propios que reemplazan a los emojis.
//
// Un emoji se dibuja con la letra del sistema operativo: en pixel art,
// en neón o en papel recortado aparecía un 🍕 de iPhone en medio de un
// mundo dibujado de otra forma. Estos son dibujos de la app, con la
// misma regla que el resto del arte (contorno de tinta cálida, cara
// iluminada y sombra) y pasan por el motor de estilos como cualquier
// otro sprite.
//
// Todos son de 64×64 y se escalan con <Sprite w h>.
// ─────────────────────────────────────────────────────────────────

const INK = '#4A3439';
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sm = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' };
const LT = 'rgba(255,255,255,0.6)';
const SH = 'rgba(74,52,57,0.2)';

const Svg = ({ children }) => (
  <svg viewBox="0 0 64 64" width="64" height="64">{children}</svg>
);

// ── Comidas ──────────────────────────────────────────────────────
export const FOOD_SPRITES = [
  {
    id: 'pizza', name: 'Pizza',
    render: () => (
      <Svg>
        <path d="M32 58 L8 14 Q32 2 56 14 Z" fill="#F7C873" {...S} />
        <path d="M8 14 Q32 2 56 14 L52 22 Q32 11 12 22 Z" fill="#D98E4E" {...Sm} />
        <path d="M14 24 Q32 15 50 24 L32 56 Z" fill="#F2A65A" opacity="0.55" />
        {[[26, 26], [38, 30], [30, 40], [36, 46]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r="4.6" fill="#D8505A" {...Sm} /><circle cx={x - 1.4} cy={y - 1.4} r="1.3" fill={LT} /></g>
        ))}
        <path d="M18 18 Q30 12 44 15" fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'pastel', name: 'Pastel',
    render: () => (
      <Svg>
        <ellipse cx="32" cy="56" rx="24" ry="4" fill={SH} />
        <path d="M10 30 h44 v20 a4 4 0 0 1 -4 4 h-36 a4 4 0 0 1 -4 -4 Z" fill="#F6D7B0" {...S} />
        <path d="M10 38 h44 v5 h-44 Z" fill="#E98AA5" />
        <path d="M10 30 h44 v6 q-5 6 -10 0 q-6 6 -12 0 q-6 6 -11 0 q-5 6 -11 0 Z" fill="#FFF3F6" {...Sm} />
        <path d="M30 30 v-12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 18 c-4 -4 0 -9 0 -11 c3 4 5 7 0 11 Z" fill="#FFC24D" {...Sm} />
        <circle cx="22" cy="26" r="3.6" fill="#D8505A" {...Sm} />
        <path d="M14 46 h36" stroke={LT} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'helado', name: 'Helado',
    render: () => (
      <Svg>
        <path d="M20 32 L32 60 L44 32 Z" fill="#E6A65D" {...S} />
        <path d="M24 38 l14 8 M22 34 l18 11 M27 50 l8 -12 M23 40 l12 -8" stroke="#B97835" strokeWidth="1.6" />
        <circle cx="32" cy="24" r="13" fill="#FFB6CC" {...S} />
        <circle cx="22" cy="31" r="7" fill="#FFF1E4" {...Sm} />
        <circle cx="42" cy="31" r="7" fill="#C9F0DC" {...Sm} />
        <circle cx="27" cy="18" r="3.4" fill={LT} />
        <circle cx="32" cy="9" r="4" fill="#D8505A" {...Sm} />
      </Svg>
    ),
  },
  {
    id: 'fresa', name: 'Fresa',
    render: () => (
      <Svg>
        <path d="M32 58 C14 46 10 30 16 22 C22 16 42 16 48 22 C54 30 50 46 32 58 Z" fill="#E8505E" {...S} />
        <path d="M18 24 C24 20 40 20 46 24 C40 22 24 22 18 24 Z" fill="#B83846" />
        {[[24, 32], [34, 30], [42, 34], [28, 42], [38, 42], [32, 50]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="1.4" ry="2" fill="#FFE29A" />
        ))}
        <path d="M20 20 l6 -8 l6 6 l6 -6 l6 8 q-12 5 -24 0 Z" fill="#5FB57B" {...Sm} />
        <path d="M32 18 v-10" stroke="#3E8A57" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 30 q2 -4 6 -5" fill="none" stroke={LT} strokeWidth="3" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'dona', name: 'Dona',
    render: () => (
      <Svg>
        <ellipse cx="32" cy="56" rx="22" ry="3.6" fill={SH} />
        <ellipse cx="32" cy="34" rx="24" ry="20" fill="#E3A15E" {...S} />
        <path d="M10 32 C10 18 54 18 54 32 C54 40 48 36 44 40 C40 44 36 38 32 42 C28 46 24 40 20 42 C14 44 10 40 10 32 Z" fill="#FF8FB8" {...Sm} />
        <ellipse cx="32" cy="32" rx="7" ry="5.4" fill="#F4E9D4" {...Sm} />
        {[[18, 28, '#FFE270'], [26, 22, '#8FDCB3'], [40, 23, '#9DCEEF'], [46, 30, '#FFFFFF'], [22, 36, '#C7ACEE'], [42, 36, '#FFE270']].map(([x, y, c], i) => (
          <rect key={i} x={x} y={y} width="5" height="2" rx="1" fill={c} transform={`rotate(${i * 37} ${x} ${y})`} />
        ))}
        <path d="M16 26 q6 -6 14 -7" fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'galleta', name: 'Galleta',
    render: () => (
      <Svg>
        <ellipse cx="32" cy="57" rx="20" ry="3.4" fill={SH} />
        <circle cx="32" cy="32" r="23" fill="#E2AE6C" {...S} />
        <circle cx="32" cy="32" r="18" fill="#EDBE80" />
        {[[24, 24], [38, 22], [42, 36], [28, 40], [34, 31], [20, 34]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.6 + (i % 2)} fill="#6B3E26" />
        ))}
        <path d="M18 22 q6 -8 16 -8" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'sushi', name: 'Sushi',
    render: () => (
      <Svg>
        <ellipse cx="32" cy="54" rx="24" ry="4" fill={SH} />
        <path d="M10 34 q22 -10 44 0 v12 q-22 8 -44 0 Z" fill="#FFFFFF" {...S} />
        <path d="M10 30 q22 -16 44 0 q-22 8 -44 0 Z" fill="#FF9A6B" {...S} />
        <path d="M18 26 l6 6 M28 22 l6 7 M38 22 l6 6" stroke="#FFD0B5" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M28 33 h8 v14 h-8 Z" fill="#3B4A3F" />
      </Svg>
    ),
  },
  {
    id: 'brocoli', name: 'Brócoli',
    render: () => (
      <Svg>
        <path d="M26 58 L28 36 h8 l2 22 Z" fill="#A6D48C" {...S} />
        <circle cx="22" cy="26" r="11" fill="#5FAE5F" {...S} />
        <circle cx="42" cy="26" r="11" fill="#5FAE5F" {...S} />
        <circle cx="32" cy="17" r="12" fill="#6CBF6A" {...S} />
        <circle cx="28" cy="13" r="3" fill={LT} />
        <circle cx="19" cy="23" r="2.4" fill={LT} />
      </Svg>
    ),
  },
];

export function foodSpriteFor(name, index = 0) {
  const n = (name || '').toLowerCase();
  const match = FOOD_SPRITES.find((f) => n.includes(f.id) || n.includes(f.name.toLowerCase().slice(0, 4)));
  return match || FOOD_SPRITES[index % FOOD_SPRITES.length];
}

// ── Interfaz y escena ────────────────────────────────────────────
export const UI_SPRITES = {
  burbuja: () => (
    <Svg>
      <circle cx="32" cy="32" r="22" fill="rgba(190,230,250,0.35)" stroke="#7FB9DE" strokeWidth="3" />
      <path d="M20 24 q4 -8 12 -9" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="42" r="3" fill="#FFFFFF" opacity="0.7" />
    </Svg>
  ),
  esponja: () => (
    <Svg>
      <ellipse cx="32" cy="56" rx="20" ry="3.4" fill={SH} />
      <path d="M10 22 h44 a4 4 0 0 1 4 4 v20 a6 6 0 0 1 -6 6 h-40 a6 6 0 0 1 -6 -6 v-20 a4 4 0 0 1 4 -4 Z" fill="#FFE27A" {...S} />
      <path d="M8 30 h48" stroke="#7FC79A" strokeWidth="7" />
      <path d="M8 30 h48" stroke={INK} strokeWidth="1.6" transform="translate(0 -3.6)" />
      {[[18, 40], [30, 44], [44, 40], [24, 48], [40, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#E2B23F" />)}
      <path d="M14 24 h20" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  ),
  bandera: () => (
    <Svg>
      <path d="M16 58 V8" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M18 10 h34 l-6 10 l6 10 h-34 Z" fill="#FFFFFF" {...S} />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => ((r + c) % 2 ? null : <rect key={`${r}${c}`} x={18 + c * 7.5} y={10 + r * 6.7} width="7.5" height="6.7" fill={INK} opacity="0.85" />)))}
    </Svg>
  ),
  pasto: () => (
    <Svg>
      <path d="M14 56 q2 -22 -6 -34 q14 10 12 34 M26 56 q-2 -28 6 -44 q4 22 0 44 M38 56 q2 -20 14 -30 q-6 16 -6 30" fill="#6CBF6A" {...Sm} />
    </Svg>
  ),
  flor: () => (
    <Svg>
      <path d="M32 58 V34" stroke="#3E8A57" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 48 q10 -10 16 -4 q-6 8 -16 4" fill="#6CBF6A" {...Sm} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="32" cy="14" rx="7" ry="10" fill="#FFF3F6" {...Sm} transform={`rotate(${a} 32 26)`} />
      ))}
      <circle cx="32" cy="26" r="7" fill="#FFC24D" {...Sm} />
    </Svg>
  ),
  dedo: () => (
    <Svg>
      <path d="M26 58 c-6 -6 -12 -14 -12 -20 c0 -4 6 -4 9 0 l3 4 V14 a4 4 0 0 1 8 0 v16 a4 4 0 0 1 8 2 a4 4 0 0 1 7 3 a4 4 0 0 1 6 4 v8 c0 6 -3 10 -6 13 Z" fill="#FFD9BE" {...S} />
      <path d="M34 30 v8 M42 32 v7 M49 36 v5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8 l-4 -4 M30 6 v-4 M36 8 l4 -4" stroke="#FFC24D" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
  llama: () => (
    <Svg>
      <path d="M32 60 C16 58 10 46 14 34 C16 28 22 24 22 16 C30 22 32 28 30 34 C36 30 38 22 36 12 C48 20 54 32 52 44 C50 54 42 60 32 60 Z" fill="#FF8A3D" {...S} />
      <path d="M32 58 C24 56 22 48 24 42 C26 38 30 36 30 32 C36 36 40 42 40 48 C40 54 36 58 32 58 Z" fill="#FFD25A" />
    </Svg>
  ),
  trofeo: () => (
    <Svg>
      <path d="M20 10 h24 v14 a12 12 0 0 1 -24 0 Z" fill="#FFC94D" {...S} />
      <path d="M20 14 h-8 q0 12 10 14 M44 14 h8 q0 12 -10 14" fill="none" {...S} />
      <path d="M28 36 h8 v10 h-8 Z" fill="#E2A12C" {...Sm} />
      <path d="M18 46 h28 v10 h-28 Z" fill="#B87A3E" {...S} />
      <path d="M25 14 v12" stroke={LT} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
  moneda: () => (
    <Svg>
      <circle cx="32" cy="34" r="22" fill="#D9921F" {...S} />
      <circle cx="32" cy="31" r="21" fill="#FFC94D" {...S} />
      <circle cx="32" cy="31" r="14" fill="none" stroke="#E2A12C" strokeWidth="3" />
      <path d="M32 22 v18 M27 26 h8 a3 3 0 0 1 0 6 h-6 a3 3 0 0 0 0 6 h8" fill="none" stroke="#B87A1E" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 22 q4 -6 10 -7" fill="none" stroke={LT} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
  parlante: () => (
    <Svg>
      <path d="M10 24 h10 l14 -12 v40 l-14 -12 h-10 Z" fill="#C9B6F2" {...S} />
      <path d="M42 22 q6 10 0 20 M48 16 q11 16 0 32" fill="none" {...S} />
    </Svg>
  ),
  silencio: () => (
    <Svg>
      <path d="M10 24 h10 l14 -12 v40 l-14 -12 h-10 Z" fill="#D9D0E6" {...S} />
      <path d="M42 24 l14 16 M56 24 l-14 16" {...S} />
    </Svg>
  ),
  cambio: () => (
    <Svg>
      <path d="M14 26 a18 18 0 0 1 32 -8 l4 -6 v16 h-16 l6 -6 a11 11 0 0 0 -20 4 Z" fill="#9DCEEF" {...Sm} />
      <path d="M50 38 a18 18 0 0 1 -32 8 l-4 6 v-16 h16 l-6 6 a11 11 0 0 0 20 -4 Z" fill="#FF9EB5" {...Sm} />
    </Svg>
  ),
  globo: () => (
    <Svg>
      <path d="M32 44 C18 44 12 32 12 24 C12 12 22 6 32 6 C42 6 52 12 52 24 C52 32 46 44 32 44 Z" fill="#FF7FA0" {...S} />
      <path d="M29 44 h6 l-3 4 Z" fill="#E05A7E" {...Sm} />
      <path d="M32 48 q-6 6 0 10" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M20 18 q4 -8 12 -8" fill="none" stroke={LT} strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  ),
  nota: () => (
    <Svg>
      <path d="M24 46 V14 l26 -6 v32" fill="none" {...S} />
      <path d="M24 14 l26 -6 v8 l-26 6 Z" fill="#8E6FE0" {...Sm} />
      <ellipse cx="18" cy="47" rx="7" ry="5.5" fill="#8E6FE0" {...S} />
      <ellipse cx="44" cy="41" rx="7" ry="5.5" fill="#8E6FE0" {...S} />
    </Svg>
  ),
  estrella: () => (
    <Svg>
      <path d="M32 6 L39.5 23.5 L58 25 L44 37.5 L48.5 56 L32 46 L15.5 56 L20 37.5 L6 25 L24.5 23.5 Z" fill="#FFD25A" {...S} />
      <path d="M26 24 l6 -12" stroke={LT} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
  paleta: () => (
    <Svg>
      <path d="M32 8 C48 8 58 18 58 30 C58 38 52 40 46 38 C40 36 38 42 42 48 C46 56 38 58 32 58 C18 58 6 46 6 32 C6 18 18 8 32 8 Z" fill="#F6E1C3" {...S} />
      {[[20, 22, '#E8505E'], [32, 16, '#FFC24D'], [44, 22, '#6CBF6A'], [16, 36, '#4A9FEA'], [24, 48, '#8E6FE0']].map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="5" fill={c} {...Sm} />)}
    </Svg>
  ),
  regalo: () => (
    <Svg>
      <path d="M10 26 h44 v8 h-44 Z" fill="#FF8FB8" {...S} />
      <path d="M14 34 h36 v22 h-36 Z" fill="#FFB6CC" {...S} />
      <path d="M28 26 h8 v30 h-8 Z" fill="#FFE27A" {...Sm} />
      <path d="M32 26 c-10 -2 -16 -10 -10 -14 c6 -3 10 8 10 14 c0 -6 4 -17 10 -14 c6 4 0 12 -10 14 Z" fill="#FFE27A" {...Sm} />
    </Svg>
  ),
  guitarra: () => (
    <Svg>
      <path d="M40 8 l12 12 l-4 4 l-12 -12 Z" fill="#6B3E26" {...Sm} />
      <path d="M38 18 l8 8 l-10 10 c4 8 -2 20 -12 20 c-10 0 -18 -8 -16 -16 c1 -8 10 -10 14 -8 Z" fill="#E7AE30" {...S} />
      <circle cx="24" cy="40" r="5" fill="#6B3E26" />
      <path d="M44 16 l-26 26" stroke={INK} strokeWidth="1.4" />
    </Svg>
  ),
  claqueta: () => (
    <Svg>
      <path d="M8 26 h48 v28 h-48 Z" fill="#3B3742" {...S} />
      <path d="M8 18 l46 -8 l2 10 l-46 8 Z" fill="#FFFFFF" {...S} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${14 + i * 11} ${17 - i * 2} l8 -1.4 l-6 9 l-8 1.4 Z`} fill={INK} />)}
      <path d="M14 36 h36 M14 44 h24" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
    </Svg>
  ),
  tele: () => (
    <Svg>
      <path d="M24 8 l8 10 l8 -10" fill="none" {...Sm} />
      <rect x="6" y="18" width="52" height="38" rx="8" fill="#C9B6F2" {...S} />
      <rect x="12" y="24" width="34" height="26" rx="4" fill="#9DCEEF" {...Sm} />
      <circle cx="52" cy="30" r="2.6" fill={INK} />
      <circle cx="52" cy="40" r="2.6" fill={INK} />
      <path d="M16 28 q6 -2 10 0" fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  ),
  corazon: () => (
    <Svg>
      <path d="M32 56 C12 42 6 32 6 22 C6 13 13 7 21 7 C26 7 30 10 32 14 C34 10 38 7 43 7 C51 7 58 13 58 22 C58 32 52 42 32 56 Z" fill="#FF6F91" {...S} />
      <path d="M14 20 q2 -8 10 -8" fill="none" stroke={LT} strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  ),
  topo: () => (
    <Svg>
      <ellipse cx="32" cy="38" rx="24" ry="22" fill="#B98A5E" {...S} />
      <ellipse cx="32" cy="46" rx="13" ry="10" fill="#E8C9A0" />
      <circle cx="22" cy="30" r="3.4" fill={INK} />
      <circle cx="42" cy="30" r="3.4" fill={INK} />
      <ellipse cx="32" cy="40" rx="4" ry="3" fill="#E58EA4" {...Sm} />
      <path d="M20 22 q4 -6 10 -6" fill="none" stroke={LT} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
};

// Las seis cartas de reserva de "Encuentra las parejas" cuando no hay
// fotos ni comidas con imagen suficientes.
export const MEMORY_FALLBACK = ['globo', 'flor', 'nota', 'estrella', 'corazon', 'paleta'];

// Pósters de muestra para la mascota de demostración.
export const DEMO_POSTER_ART = [
  { id: 'demo-poster-1', sprite: 'guitarra', color: '#C7ACEE' },
  { id: 'demo-poster-2', sprite: 'claqueta', color: '#9DCEEF' },
  { id: 'demo-poster-3', sprite: 'tele', color: '#FFB98A' },
];
