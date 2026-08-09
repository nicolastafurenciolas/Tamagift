import React from 'react';
import { INK, SH, SH2, LT, LT2, isPale } from './petParts';

// Cuando el color secundario es blanco (el valor por defecto) algunas
// piezas se pierden. Esto elige un respaldo con contraste.
const alt = (c, fallback) => (c && c.accentAlt && !isPale(c.accentAlt) ? c.accentAlt : fallback);

// ─────────────────────────────────────────────────────────────────
// Colas, patrones de pelaje y accesorios (cabeza / cuello / cara).
//
// Clave para que se vean PUESTOS y no pegados encima: cada accesorio
// puede tener dos partes —
//   back(c)   → se dibuja DETRÁS del cuerpo (lo que pasa por atrás
//               del cuello / de la cabeza)
//   render(c) → se dibuja DELANTE
// Así una bufanda de verdad rodea el cuello en vez de flotar sobre él.
// Además todo lleva pliegues, nudo, sombra propia y brillo.
// ─────────────────────────────────────────────────────────────────

const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sm = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sx = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' };

// ── COLAS (detrás del cuerpo) ────────────────────────────────────
export const TAILS = [
  { id: 'ninguna', label: 'Sin cola', render: () => null },
  {
    id: 'gato', label: 'De gatito',
    render: (c) => (
      <g>
        <path d="M160 138 C192 132 200 98 182 78 C176 71 168 74 171 83 C182 100 178 122 156 128 Z" fill={c.body} {...S} />
        <path d="M166 132 C188 124 192 100 180 86" fill="none" stroke={SH2} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M176 82 C186 96 184 112 172 122" fill="none" stroke={LT} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'esponjosa', label: 'Esponjosa',
    render: (c) => (
      <g>
        <circle cx="168" cy="142" r="20" fill={c.body} {...S} />
        <circle cx="180" cy="118" r="15" fill={c.body} {...S} />
        <circle cx="176" cy="96" r="10" fill={c.body} {...S} />
        <circle cx="178" cy="114" r="7" fill={c.inner} opacity="0.85" />
        <circle cx="164" cy="136" r="8" fill={LT} />
        <path d="M158 152 a20 20 0 0 0 20 4" fill={SH} />
      </g>
    ),
  },
  {
    id: 'corta', label: 'Cortita',
    render: (c) => (
      <g>
        <circle cx="170" cy="140" r="13" fill={c.body} {...S} />
        <circle cx="166" cy="135" r="5" fill={LT} />
        <path d="M160 146 a13 13 0 0 0 18 3" fill={SH} />
      </g>
    ),
  },
  {
    id: 'rizada', label: 'Rizadita',
    render: (c) => (
      <g>
        <path d="M156 132 C182 142 195 120 184 105 C177 96 180 116 164 118" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M156 132 C182 142 195 120 184 105 C177 96 180 116 164 118" fill="none" stroke={c.body} strokeWidth="5.5" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'lazo', label: 'Con lacito',
    render: (c) => (
      <g>
        <path d="M160 138 C190 134 196 106 182 88" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M160 138 C190 134 196 106 182 88" fill="none" stroke={c.body} strokeWidth="6" strokeLinecap="round" />
        <g transform="translate(182,86)">
          <path d="M0 0 C-11 -8 -15 5 -2 4 Z" fill={c.accent} {...Sx} />
          <path d="M0 0 C11 -8 15 5 2 4 Z" fill={c.accent} {...Sx} />
          <circle cx="0" cy="1.5" r="3.4" fill={c.accent} {...Sx} />
        </g>
      </g>
    ),
  },
  {
    id: 'demonio', label: 'De diablito',
    render: (c) => (
      <g>
        {/* la cola en sí, con contorno y relleno */}
        <path d="M156 152 C186 156 194 128 184 104" fill="none" stroke={INK} strokeWidth="9.5" strokeLinecap="round" />
        <path d="M156 152 C186 156 194 128 184 104" fill="none" stroke={c.body} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M170 154 C184 152 190 138 188 124" fill="none" stroke={LT} strokeWidth="2" strokeLinecap="round" />
        {/* punta de flecha */}
        <path d="M184 104 L173 88 L184 74 L195 88 Z" fill={c.accent} {...Sm} />
        <path d="M184 80 L190 88 L184 96 Z" fill={LT} opacity="0.8" />
      </g>
    ),
  },
  {
    id: 'puas', label: 'Con púas',
    render: (c) => (
      <g>
        <path d="M154 150 C184 150 194 126 186 104" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
        <path d="M154 150 C184 150 194 126 186 104" fill="none" stroke={c.body} strokeWidth="6.5" strokeLinecap="round" />
        {/* púas siguiendo la curva */}
        <path d="M168 144 L172 132 L176 146 Z" fill={c.accent} {...Sx} />
        <path d="M182 132 L189 122 L189 136 Z" fill={c.accent} {...Sx} />
        <path d="M187 116 L195 110 L192 122 Z" fill={c.accent} {...Sx} />
        <path d="M186 104 L178 92 L192 94 Z" fill={c.accent} {...Sx} />
        <path d="M164 148 C180 146 188 134 187 120" fill="none" stroke={LT} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
];

// ── PATRONES (sobre el cuerpo) ───────────────────────────────────
export const PATTERNS = [
  { id: 'ninguno', label: 'Liso' },
  { id: 'manchas', label: 'Manchitas' },
  { id: 'rayas', label: 'Rayitas' },
  { id: 'estrellas', label: 'Estrellitas' },
  { id: 'corazones', label: 'Corazoncitos' },
  { id: 'lunares', label: 'Lunares' },
  { id: 'calaveras', label: 'Calaveritas' },
  { id: 'cuadros', label: 'Cuadros' },
  { id: 'tiedye', label: 'Tie-dye' },
  { id: 'leopardo', label: 'Leopardo' },
  { id: 'camuflaje', label: 'Camuflaje' },
  { id: 'flores', label: 'Florecitas' },
  { id: 'rayos', label: 'Rayitos' },
];

export function renderPattern(pattern, color, faceW) {
  if (!pattern || pattern === 'ninguno') return null;
  const w = faceW || 1;
  const X = (x) => 100 + (x - 100) * w;

  if (pattern === 'manchas') {
    const spots = [[62, 88, 13, 10, -20], [140, 96, 11, 8.5, 15], [72, 152, 12, 9, 10], [132, 150, 10, 7.5, -12]];
    return (
      <g opacity="0.5">
        {spots.map(([x, y, rx, ry, rot], i) => (
          <ellipse key={i} cx={X(x)} cy={y} rx={rx} ry={ry} fill={color} transform={`rotate(${rot} ${X(x)} ${y})`} />
        ))}
      </g>
    );
  }
  if (pattern === 'rayas') {
    return (
      <g opacity="0.42" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d={`M${X(46)} 82 q22 -7 40 -3`} />
        <path d={`M${X(44)} 100 q24 -8 44 -3`} />
        <path d={`M${X(154)} 82 q-22 -7 -40 -3`} />
        <path d={`M${X(156)} 100 q-24 -8 -44 -3`} />
      </g>
    );
  }
  if (pattern === 'estrellas') {
    const pts = [[66, 84, 1], [136, 92, 0.8], [74, 156, 0.9], [130, 152, 0.7]];
    const star = (x, y, s) => (
      <path d={`M${x} ${y - 8 * s} c1 4 2.2 5.2 6.2 6.2 c-4 1 -5.2 2.2 -6.2 6.2 c-1 -4 -2.2 -5.2 -6.2 -6.2 c4 -1 5.2 -2.2 6.2 -6.2 Z`} fill={color} />
    );
    return <g opacity="0.8">{pts.map(([x, y, s], i) => <React.Fragment key={i}>{star(X(x), y, s)}</React.Fragment>)}</g>;
  }
  if (pattern === 'corazones') {
    const pts = [[64, 88, 1], [138, 94, 0.85], [76, 154, 0.75]];
    const heart = (x, y, s) => (
      <path d={`M${x} ${y + 8 * s} C${x - 9 * s} ${y + 1} ${x - 8 * s} ${y - 7 * s} ${x} ${y - 3 * s} C${x + 8 * s} ${y - 7 * s} ${x + 9 * s} ${y + 1} ${x} ${y + 8 * s} Z`} fill={color} />
    );
    return <g opacity="0.75">{pts.map(([x, y, s], i) => <React.Fragment key={i}>{heart(X(x), y, s)}</React.Fragment>)}</g>;
  }
  if (pattern === 'lunares') {
    const pts = [[64, 86, 5], [138, 92, 4], [58, 118, 3.4], [146, 124, 4.4], [76, 156, 4], [128, 158, 3.4]];
    return <g opacity="0.55">{pts.map(([x, y, r], i) => <circle key={i} cx={X(x)} cy={y} r={r} fill={color} />)}</g>;
  }
  if (pattern === 'calaveras') {
    const pts = [[66, 92, 1], [136, 98, 0.85], [78, 154, 0.9], [128, 152, 0.75]];
    const skull = (x, y, s) => (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <path d="M0 -8 C6.5 -8 9 -4.5 9 0 C9 3 7.5 5.2 5.5 6.4 L5.5 10 L-5.5 10 L-5.5 6.4 C-7.5 5.2 -9 3 -9 0 C-9 -4.5 -6.5 -8 0 -8 Z" fill={color} />
        <ellipse cx="-3.4" cy="-0.6" rx="2.4" ry="2.9" fill={SH2} />
        <ellipse cx="3.4" cy="-0.6" rx="2.4" ry="2.9" fill={SH2} />
        <path d="M0 3.4 l-1.6 2.6 h3.2 Z" fill={SH2} />
        <path d="M-2 10 v-3 M2 10 v-3" stroke={SH2} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    );
    return <g opacity="0.85">{pts.map(([x, y, s], i) => <React.Fragment key={i}>{skull(X(x), y, s)}</React.Fragment>)}</g>;
  }
  if (pattern === 'cuadros') {
    // Cuadros escoceses recortados a un óvalo calculado a mano: así el
    // patrón nunca se sale del cuerpo sin necesitar máscaras.
    const CX = 100, CY = 126, RX = 43 * w, RY = 40;
    const vs = [], hs = [];
    for (let k = -2; k <= 2; k++) {
      const dx = k * 16 * w;
      const t = 1 - (dx / RX) ** 2;
      if (t > 0.03) { const hh = RY * Math.sqrt(t); vs.push([CX + dx, CY - hh, CY + hh]); }
    }
    for (let k = -2; k <= 2; k++) {
      const dy = k * 16;
      const t = 1 - (dy / RY) ** 2;
      if (t > 0.03) { const ww = RX * Math.sqrt(t); hs.push([CY + dy, CX - ww, CX + ww]); }
    }
    return (
      <g strokeLinecap="round" fill="none">
        <g stroke={color} strokeWidth="9" opacity="0.26">
          {vs.map(([x, y1, y2], i) => <path key={`vb${i}`} d={`M${x} ${y1} V${y2}`} />)}
          {hs.map(([y, x1, x2], i) => <path key={`hb${i}`} d={`M${x1} ${y} H${x2}`} />)}
        </g>
        <g stroke={color} strokeWidth="2.2" opacity="0.6">
          {vs.map(([x, y1, y2], i) => <path key={`vt${i}`} d={`M${x + 5} ${y1 + 3} V${y2 - 3}`} />)}
          {hs.map(([y, x1, x2], i) => <path key={`ht${i}`} d={`M${x1 + 3} ${y + 5} H${x2 - 3}`} />)}
        </g>
      </g>
    );
  }
  if (pattern === 'tiedye') {
    return (
      <g fill="none" stroke={color} strokeLinecap="round">
        {[0.95, 0.74, 0.53, 0.32].map((f, i) => (
          <ellipse
            key={i} cx="100" cy="126" rx={43 * f * w} ry={40 * f}
            strokeWidth={7 - i} opacity={0.2 + i * 0.11}
            transform={`rotate(${i * 13 - 18} 100 126)`}
          />
        ))}
        <circle cx="100" cy="126" r="5" fill={color} stroke="none" opacity="0.7" />
      </g>
    );
  }
  if (pattern === 'leopardo') {
    const pts = [[64, 88, 1], [136, 94, 0.85], [58, 120, 0.75], [144, 126, 0.9], [74, 154, 0.95], [130, 156, 0.8], [100, 168, 0.7]];
    const rosette = (x, y, s) => (
      <g>
        <ellipse cx={x} cy={y} rx={5 * s} ry={4 * s} fill={color} opacity="0.3" />
        <path d={`M${x - 8 * s} ${y - 1 * s} a${8 * s} ${7 * s} 0 1 1 ${16 * s} ${1 * s}`} fill="none" stroke={color} strokeWidth={2.8 * s} strokeLinecap="round" opacity="0.8" />
        <path d={`M${x - 5.5 * s} ${y + 6 * s} a${6 * s} ${5 * s} 0 0 0 ${11 * s} ${-1 * s}`} fill="none" stroke={color} strokeWidth={2.4 * s} strokeLinecap="round" opacity="0.8" />
      </g>
    );
    return <g>{pts.map(([x, y, s], i) => <React.Fragment key={i}>{rosette(X(x), y, s)}</React.Fragment>)}</g>;
  }
  if (pattern === 'camuflaje') {
    const blobs = [
      ['M-16 -6 C-8 -14 4 -12 10 -4 C16 4 8 12 -2 10 C-12 8 -22 2 -16 -6 Z', 62, 92, 1],
      ['M-14 -4 C-6 -12 6 -10 10 -2 C13 6 4 11 -4 9 C-12 7 -18 2 -14 -4 Z', 140, 104, 0.9],
      ['M-15 -5 C-7 -13 5 -11 10 -3 C15 5 6 12 -3 10 C-13 8 -20 1 -15 -5 Z', 74, 152, 1.05],
      ['M-12 -4 C-5 -11 5 -9 9 -2 C12 5 4 10 -3 8 C-11 6 -16 1 -12 -4 Z', 132, 156, 0.85],
      ['M-11 -4 C-5 -10 4 -8 8 -2 C11 4 3 9 -3 7 C-10 5 -14 1 -11 -4 Z', 100, 178, 0.8],
    ];
    return (
      <g>
        {blobs.map(([d, x, y, s], i) => (
          <g key={i} transform={`translate(${X(x)},${y}) scale(${s})`}>
            <path d={d} fill={color} opacity={i % 2 ? 0.28 : 0.46} />
          </g>
        ))}
      </g>
    );
  }
  if (pattern === 'flores') {
    const pts = [[64, 90, 1], [138, 96, 0.85], [58, 124, 0.7], [142, 130, 0.75], [76, 156, 0.95], [128, 158, 0.8]];
    const flower = (x, y, s) => (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-4.6" rx="3.4" ry="4.6" fill={color} opacity="0.78" transform={`rotate(${a})`} />
        ))}
        <circle r="2.4" fill="#FFE270" opacity="0.95" />
      </g>
    );
    return <g>{pts.map(([x, y, s], i) => <React.Fragment key={i}>{flower(X(x), y, s)}</React.Fragment>)}</g>;
  }
  if (pattern === 'rayos') {
    const pts = [[64, 90, 1], [138, 98, 0.85], [76, 154, 0.95], [128, 152, 0.75]];
    const bolt = (x, y, s) => (
      <path
        d={`M${x + 3 * s} ${y - 11 * s} L${x - 7 * s} ${y + 2 * s} L${x - 1 * s} ${y + 2 * s} L${x - 4 * s} ${y + 12 * s} L${x + 7 * s} ${y - 2 * s} L${x + 1 * s} ${y - 2 * s} Z`}
        fill={color} opacity="0.85"
      />
    );
    return <g>{pts.map(([x, y, s], i) => <React.Fragment key={i}>{bolt(X(x), y, s)}</React.Fragment>)}</g>;
  }
  return null;
}

// ── ACCESORIOS DE CABEZA ─────────────────────────────────────────
export const HEAD_ACCESSORIES = [
  { id: 'ninguno', label: 'Sin nada', render: () => null },
  {
    id: 'mono', label: 'Moño',
    render: (c) => (
      <g transform="translate(132,46)">
        {/* lazo izquierdo con pliegue */}
        <path d="M0 0 C-20 -13 -27 9 -3 7 Z" fill={c.accent} {...Sm} />
        <path d="M-3 4 C-13 -1 -17 3 -18 -4" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
        {/* lazo derecho */}
        <path d="M0 0 C20 -13 27 9 3 7 Z" fill={c.accent} {...Sm} />
        <path d="M3 4 C13 -1 17 3 18 -4" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
        {/* nudo */}
        <ellipse cx="0" cy="2" rx="6.5" ry="6" fill={c.accent} {...Sm} />
        <ellipse cx="-2" cy="0" rx="2.6" ry="2.2" fill={LT2} opacity="0.7" />
        {/* colitas */}
        <path d="M-3 7 C-6 16 -12 18 -14 14" fill="none" stroke={c.accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M3 7 C6 16 12 18 14 14" fill="none" stroke={c.accent} strokeWidth="4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'gorro', label: 'Gorrito de lana',
    render: (c) => (
      <g>
        {/* copa del gorro */}
        <path d="M58 58 C62 22 138 22 142 58 Z" fill={c.accent} {...S} />
        {/* textura tejida */}
        <path d="M72 52 C74 34 78 28 84 26 M88 50 C89 32 91 26 96 24 M104 50 C105 32 107 26 112 25 M120 52 C122 34 126 29 132 30"
          fill="none" stroke={SH} strokeWidth="2.4" strokeLinecap="round" />
        {/* vuelta del gorro (banda gruesa) */}
        <path d="M54 58 h92 a7 7 0 0 1 0 14 h-92 a7 7 0 0 1 0 -14 Z" fill={c.accentAlt || '#fff'} {...Sm} />
        <path d="M62 65 h76" stroke={SH} strokeWidth="2.4" strokeLinecap="round" />
        {/* pompón */}
        <circle cx="100" cy="18" r="11" fill={c.accentAlt || '#fff'} {...Sm} />
        <circle cx="96" cy="14" r="4" fill={LT2} />
        <path d="M92 24 a11 11 0 0 0 16 0" fill={SH} opacity="0.5" />
      </g>
    ),
  },
  {
    id: 'corona', label: 'Coronita',
    render: (c) => (
      <g transform="translate(100,40)">
        <path d="M-30 10 L-30 -8 L-15 3 L0 -17 L15 3 L30 -8 L30 10 Z" fill={c.accent} {...Sm} />
        {/* banda inferior */}
        <path d="M-30 10 h60 v5 h-60 Z" fill={c.accent} {...Sx} />
        <path d="M-26 12 h52" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
        {/* joyas */}
        <circle cx="0" cy="-17" r="3.6" fill={c.accentAlt || '#fff'} {...Sx} />
        <circle cx="-30" cy="-8" r="3" fill={c.accentAlt || '#fff'} {...Sx} />
        <circle cx="30" cy="-8" r="3" fill={c.accentAlt || '#fff'} {...Sx} />
        <circle cx="0" cy="4" r="4" fill={c.accentAlt || '#fff'} {...Sx} />
        {/* brillo */}
        <path d="M-22 6 L-16 -2" stroke={LT2} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'flores', label: 'Corona de flores',
    render: (c) => {
      const flower = (x, y, col, s = 1) => (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5.5" rx="4.4" ry="5.5" fill={col} stroke={INK} strokeWidth="1.5" transform={`rotate(${a})`} />
          ))}
          <circle r="3.2" fill="#FFE270" stroke={INK} strokeWidth="1.4" />
        </g>
      );
      const alt = c.accentAlt && c.accentAlt !== '#FFFFFF' ? c.accentAlt : '#F582A7';
      return (
        <g>
          {/* enredadera */}
          <path d="M58 62 C74 42 126 42 142 62" fill="none" stroke="#7FA894" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M74 50 q-6 -6 -1 -10 M126 50 q6 -6 1 -10" fill="none" stroke="#7FA894" strokeWidth="2.6" strokeLinecap="round" />
          {flower(64, 58, c.accent, 0.9)}
          {flower(84, 44, alt)}
          {flower(106, 41, c.accent)}
          {flower(128, 48, alt, 0.95)}
          {flower(142, 60, c.accent, 0.8)}
        </g>
      );
    },
  },
  {
    id: 'cachos', label: 'Cachitos',
    render: (c) => (
      <g>
        <path d="M76 48 C68 24 84 16 90 38 C91 44 88 48 84 50 Z" fill={c.accent} {...Sm} />
        <path d="M124 48 C132 24 116 16 110 38 C109 44 112 48 116 50 Z" fill={c.accent} {...Sm} />
        <path d="M80 42 C76 30 82 26 86 36" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
        <path d="M120 42 C124 30 118 26 114 36" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'diadema', label: 'Diadema',
    render: (c) => (
      <g>
        <path d="M60 62 C66 30 134 30 140 62" fill="none" stroke={c.accent} strokeWidth="7" strokeLinecap="round" />
        <path d="M60 62 C66 30 134 30 140 62" fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
        <g transform="translate(126,38) rotate(18)">
          <path d="M0 0 C-14 -9 -19 6 -2 5 Z" fill={c.accentAlt || '#F582A7'} {...Sx} />
          <path d="M0 0 C14 -9 19 6 2 5 Z" fill={c.accentAlt || '#F582A7'} {...Sx} />
          <circle cx="0" cy="1.5" r="4.4" fill={c.accentAlt || '#F582A7'} {...Sx} />
          <circle cx="-1.5" cy="0" r="1.8" fill={LT2} />
        </g>
      </g>
    ),
  },
  {
    id: 'sombrero', label: 'Sombrerito',
    render: (c) => (
      <g>
        {/* ala */}
        <ellipse cx="100" cy="62" rx="56" ry="13" fill={c.accent} {...Sm} />
        <ellipse cx="100" cy="60" rx="56" ry="12" fill={c.accent} />
        <ellipse cx="100" cy="59" rx="44" ry="8" fill={SH} opacity="0.4" />
        {/* copa */}
        <path d="M74 58 C74 26 126 26 126 58 Z" fill={c.accent} {...Sm} />
        {/* cinta */}
        <path d="M73 52 h54 v9 h-54 Z" fill={c.accentAlt || '#fff'} {...Sx} />
        <path d="M78 56 h44" stroke={SH} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="86" cy="38" rx="5" ry="9" fill={LT} transform="rotate(-14 86 38)" />
      </g>
    ),
  },
  {
    id: 'audifonos', label: 'Audífonos',
    render: (c) => (
      <g>
        <path d="M56 66 C58 26 142 26 144 66" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M56 66 C58 26 142 26 144 66" fill="none" stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
        <path d="M70 38 C86 28 114 28 130 38" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
        {[56, 144].map((x, i) => (
          <g key={i}>
            <rect x={x - 12} y="58" width="24" height="30" rx="11" fill={c.accent} {...Sm} />
            <rect x={x - 7} y="63" width="14" height="20" rx="7" fill={c.accentAlt || '#fff'} opacity="0.5" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'bandana', label: 'Bandana',
    render: (c) => (
      <g>
        <path d="M52 74 C58 42 142 42 148 74 Q100 60 52 74 Z" fill={c.accent} {...S} />
        <path d="M52 74 Q100 60 148 74 L148 80 Q100 66 52 80 Z" fill={alt(c, '#FFFFFF')} opacity="0.4" />
        <path d="M72 68 C74 54 78 48 84 46 M100 62 C100 52 100 48 100 46 M128 68 C126 54 122 48 116 46"
          fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M64 62 C70 50 82 44 94 42" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
        {/* estampado tipo cachemira, simplificado a gotitas */}
        <g fill={alt(c, '#FFFFFF')} opacity="0.6">
          <ellipse cx="82" cy="58" rx="2.6" ry="3.4" transform="rotate(-20 82 58)" />
          <ellipse cx="102" cy="52" rx="2.6" ry="3.4" transform="rotate(10 102 52)" />
          <ellipse cx="122" cy="58" rx="2.6" ry="3.4" transform="rotate(24 122 58)" />
        </g>
        {/* nudo y puntas al costado */}
        <ellipse cx="150" cy="76" rx="9.5" ry="8.5" fill={c.accent} {...Sm} />
        <path d="M157 71 C171 63 178 75 169 84 C163 89 157 85 155 79 Z" fill={c.accent} {...Sm} />
        <path d="M157 82 C167 88 172 99 167 106 C160 103 154 94 152 86 Z" fill={c.accent} {...Sm} />
        <path d="M161 75 C167 73 171 77 169 81 M160 87 C165 92 167 97 166 101" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'gorra', label: 'Gorra',
    render: (c) => (
      <g>
        <path d="M60 60 C62 26 138 26 140 60 Z" fill={c.accent} {...S} />
        <path d="M100 28 V60 M80 31 C78 45 78 53 79 60 M120 31 C122 45 122 53 121 60"
          fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="80" cy="42" rx="7" ry="12" fill={LT} transform="rotate(-16 80 42)" />
        <circle cx="100" cy="27" r="4.6" fill={alt(c, '#FFFFFF')} {...Sx} />
        {/* visera */}
        <path d="M50 58 Q100 80 150 58 Q150 66 100 88 Q50 66 50 58 Z" fill={c.accent} {...Sm} />
        <path d="M56 62 Q100 82 144 62" fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M54 60 Q100 78 146 60" fill="none" stroke={LT} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'boina', label: 'Boina',
    render: (c) => (
      <g transform="rotate(-7 100 48)">
        <ellipse cx="100" cy="48" rx="47" ry="25" fill={c.accent} {...S} />
        <ellipse cx="100" cy="56" rx="38" ry="14" fill={SH} opacity="0.3" />
        <path d="M58 44 C68 30 132 30 142 44" fill="none" stroke={LT} strokeWidth="3.2" strokeLinecap="round" />
        {/* cinta de la base */}
        <path d="M62 58 h76 a6.5 6.5 0 0 1 0 12 h-76 a6.5 6.5 0 0 1 0 -12 Z" fill={alt(c, '#4A3439')} {...Sm} />
        <path d="M70 64 h60" stroke={SH} strokeWidth="2.2" strokeLinecap="round" />
        {/* rabito de arriba */}
        <circle cx="120" cy="29" r="4.6" fill={c.accent} {...Sx} />
      </g>
    ),
  },
  {
    id: 'bruja', label: 'Sombrero de bruja',
    render: (c) => (
      <g>
        <ellipse cx="100" cy="66" rx="58" ry="14" fill={c.accent} {...Sm} />
        <ellipse cx="100" cy="63" rx="58" ry="13" fill={c.accent} />
        <ellipse cx="100" cy="60" rx="42" ry="8" fill={SH} opacity="0.35" />
        {/* cono con la punta doblada */}
        <path d="M80 62 C84 34 92 20 110 8 C116 24 122 46 125 62 Z" fill={c.accent} {...Sm} />
        <path d="M88 54 C92 36 98 25 108 14" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M116 20 C120 34 123 50 125 62" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        {/* cinta con hebilla */}
        <path d="M80 51 C88 47 117 47 124 53 L125 62 C115 56 89 56 80 60 Z" fill={alt(c, '#C9A227')} {...Sx} />
        <rect x="94" y="49" width="14" height="11" rx="2.5" fill={alt(c, '#C9A227')} {...Sx} />
        <rect x="97.5" y="52" width="7" height="5" rx="1.2" fill={SH2} />
      </g>
    ),
  },
  {
    id: 'monoCalavera', label: 'Moño con calavera',
    render: (c) => (
      <g transform="translate(100,40)">
        <path d="M-2 4 C-28 -14 -40 10 -8 13 Z" fill={c.accent} {...Sm} />
        <path d="M2 4 C28 -14 40 10 8 13 Z" fill={c.accent} {...Sm} />
        <path d="M-9 6 C-20 2 -26 5 -30 -3" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M9 6 C20 2 26 5 30 -3" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M-14 -3 C-22 -4 -28 0 -30 4" fill="none" stroke={LT} strokeWidth="2" strokeLinecap="round" />
        {/* nudo oscuro con calaverita */}
        <ellipse cx="0" cy="6" rx="11" ry="10" fill={alt(c, '#2A2530')} {...Sm} />
        <path d="M0 -1 C5 -1 7.2 1.6 7.2 4.6 C7.2 6.6 6.2 8.2 4.8 9.1 L4.8 12 L-4.8 12 L-4.8 9.1 C-6.2 8.2 -7.2 6.6 -7.2 4.6 C-7.2 1.6 -5 -1 0 -1 Z"
          fill="#FFFFFF" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        <ellipse cx="-2.7" cy="4.2" rx="1.9" ry="2.2" fill={INK} />
        <ellipse cx="2.7" cy="4.2" rx="1.9" ry="2.2" fill={INK} />
        <path d="M-1.6 12 v-2.6 M1.6 12 v-2.6" stroke={INK} strokeWidth="1" strokeLinecap="round" />
        {/* colitas del moño */}
        <path d="M-7 12 C-11 22 -18 25 -21 21" fill="none" stroke={c.accent} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M7 12 C11 22 18 25 21 21" fill="none" stroke={c.accent} strokeWidth="4.5" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'tiara', label: 'Tiara',
    render: (c) => (
      <g transform="translate(100,48)">
        <path d="M-36 10 C-31 -2 -19 -4 -12 -8 L0 -23 L12 -8 C19 -4 31 -2 36 10 C18 2 -18 2 -36 10 Z" fill={c.accent} {...Sm} />
        <path d="M-36 10 C-12 4 12 4 36 10 L36 16 C12 10 -12 10 -36 16 Z" fill={c.accent} {...Sx} />
        <path d="M-30 12 C-12 7 12 7 30 12" fill="none" stroke={SH2} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="0" cy="-21" r="4.6" fill={alt(c, '#8FC7EE')} {...Sx} />
        <circle cx="-19" cy="-2" r="3.4" fill={alt(c, '#8FC7EE')} {...Sx} />
        <circle cx="19" cy="-2" r="3.4" fill={alt(c, '#8FC7EE')} {...Sx} />
        <circle cx="0" cy="3" r="3.8" fill={alt(c, '#8FC7EE')} {...Sx} />
        <path d="M-28 7 L-21 0 M22 0 L28 6" stroke={LT2} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'cresta', label: 'Cresta punk',
    render: (c) => (
      <g>
        <path d="M76 62 L84 22 L92 54 L100 10 L108 54 L116 22 L124 62 Z" fill={c.accent} {...S} />
        <path d="M85 30 C87 42 88 50 88 56 M100 18 C100 34 100 46 100 56 M115 30 C113 42 112 50 112 56"
          fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M96 34 L99 16 M89 40 L86 26" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
        {/* raíz más oscura donde nace del pelaje */}
        <path d="M76 62 C86 56 114 56 124 62 Z" fill={SH2} opacity="0.5" />
      </g>
    ),
  },
  {
    id: 'aureola', label: 'Aureola',
    render: (c) => (
      <g>
        <ellipse cx="100" cy="24" rx="32" ry="10" fill="none" stroke={c.accent} strokeWidth="9.5" />
        <ellipse cx="100" cy="24" rx="32" ry="10" fill="none" stroke="#FFF6C8" strokeWidth="3.6" opacity="0.85" />
        <ellipse cx="100" cy="24" rx="32" ry="10" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.3" />
        <path d="M78 20 C84 15 96 13 106 14" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
        <g fill={c.accent} opacity="0.9">
          <path d="M62 40 c0.7 2.8 1.6 3.7 4.4 4.4 c-2.8 0.7 -3.7 1.6 -4.4 4.4 c-0.7 -2.8 -1.6 -3.7 -4.4 -4.4 c2.8 -0.7 3.7 -1.6 4.4 -4.4 Z" />
          <path d="M140 38 c0.6 2.4 1.4 3.2 3.8 3.8 c-2.4 0.6 -3.2 1.4 -3.8 3.8 c-0.6 -2.4 -1.4 -3.2 -3.8 -3.8 c2.4 -0.6 3.2 -1.4 3.8 -3.8 Z" />
        </g>
      </g>
    ),
  },
  {
    id: 'cuernos', label: 'Cuernos grandes',
    render: (c) => (
      <g>
        <path d="M72 56 C50 36 56 8 80 12 C66 22 62 40 80 58 Z" fill={c.accent} {...Sm} />
        <path d="M128 56 C150 36 144 8 120 12 C134 22 138 40 120 58 Z" fill={c.accent} {...Sm} />
        {/* anillos del cuerno */}
        <path d="M64 44 C70 42 74 44 76 48 M60 32 C66 30 70 32 72 36 M62 20 C67 18 72 20 74 24"
          fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M136 44 C130 42 126 44 124 48 M140 32 C134 30 130 32 128 36 M138 20 C133 18 128 20 126 24"
          fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M76 16 C64 26 62 40 74 54" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M124 16 C136 26 138 40 126 54" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'flequillo', label: 'Flequillo emo',
    render: (c) => (
      <g>
        <path d="M46 80 C50 40 150 34 156 74 C146 90 120 94 96 89 C80 86 60 92 50 98 C46 92 45 86 46 80 Z" fill={c.accent} {...S} />
        {/* mechones */}
        <path d="M58 84 C64 68 78 56 96 52 M78 86 C84 70 98 58 116 54 M100 87 C106 72 120 62 136 58"
          fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M62 66 C74 52 96 44 118 44" fill="none" stroke={LT} strokeWidth="2.8" strokeLinecap="round" />
        {/* mechón largo al costado */}
        <path d="M152 68 C164 90 162 118 152 138 C144 120 142 94 145 74 Z" fill={c.accent} {...Sm} />
        <path d="M152 80 C158 98 157 118 152 132" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'vaquero', label: 'Sombrero rústico',
    render: (c) => (
      <g>
        <path d="M40 66 C48 52 152 52 160 66 C150 78 50 78 40 66 Z" fill={c.accent} {...Sm} />
        <path d="M42 65 C52 59 148 59 158 65" fill="none" stroke={SH} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M74 62 C74 32 84 22 100 22 C116 22 126 32 126 62 Z" fill={c.accent} {...Sm} />
        <path d="M100 26 V54" stroke={SH2} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M88 30 C86 42 86 52 87 60 M112 30 C114 42 114 52 113 60" fill="none" stroke={SH} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="84" cy="38" rx="5" ry="10" fill={LT} transform="rotate(-14 84 38)" />
        <path d="M73 53 h54 v9 h-54 Z" fill={alt(c, '#8B5E3C')} {...Sx} />
        <path d="M78 57 h44" stroke={SH} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
];

// ── ACCESORIOS DE CUELLO ─────────────────────────────────────────
//
// Todos se dibujan en un ESPACIO CANÓNICO y luego `PetRecipe` los
// estira al cuello real del cuerpo elegido (ver `neckFit` en
// petParts.jsx). Reglas del espacio canónico:
//
//   · la línea del cuello es y = 146 y el medio-ancho es 50 (x 50..150)
//   · la banda trasera va un poco más ancha (x 47..153) para que asome
//     por los lados — eso es lo que hace que lea como "puesto"
//   · nada puede bajar de y = 174 en el centro ni de y = 166 en los
//     costados: más abajo se saldría del cuerpo en las formas chicas
//
// Como el eje X se estira más que el Y, las piezas redondas (medallas,
// argollas, dijes) se envuelven en `flat(...)` para que no salgan
// ovaladas: contrarresta la escala solo para ese pedacito.

const BAND_FRONT = 'M50 141 Q100 157 150 141 L150 153 Q100 169 50 153 Z';
const BAND_BACK = 'M47 136 Q100 121 153 136 L153 147 Q100 132 47 147 Z';
// Para cadenas y cintas finas: la parte que pasa por detrás del cuello.
// Va más ancha que el cuerpo a propósito — si no asoma por los lados,
// el colgante parece pegado en el pecho en vez de colgado del cuello.
const BAND_BACK_THIN = 'M44 135 Q100 121 156 135 L156 143 Q100 129 44 143 Z';

const flat = (n, x, y) =>
  (n && n.sx ? `translate(${x} ${y}) scale(${(1 / n.sx).toFixed(4)} ${(1 / n.sy).toFixed(4)}) translate(${-x} ${-y})` : undefined);

export const NECK_ACCESSORIES = [
  { id: 'ninguno', label: 'Sin nada', render: () => null },
  {
    id: 'collar', label: 'Collar',
    back: (c) => (
      <g>
        <path d={BAND_BACK} fill={c.accent} {...Sx} />
        <path d="M54 139 Q100 126 146 139" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    ),
    render: (c, n) => (
      <g>
        <path d={BAND_FRONT} fill={c.accent} {...Sm} />
        <path d="M54 145 Q100 161 146 145" fill="none" stroke={LT} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M56 150 Q100 166 144 150" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        {/* hebilla */}
        <g transform={flat(n, 100, 156)}>
          <rect x="90" y="150" width="20" height="13" rx="3.5" fill={alt(c, '#C9A227')} {...Sx} />
          <path d="M100 150 v13" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
          <path d="M93 153 h5" stroke={LT2} strokeWidth="1.8" strokeLinecap="round" />
        </g>
        {/* placa colgante */}
        <g transform={flat(n, 100, 168)}>
          <path d="M100 161 v3" stroke={alt(c, '#C9A227')} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="100" cy="169" r="7" fill={alt(c, '#C9A227')} {...Sx} />
          <path d="M96 169 h8 M100 165 v8" stroke={SH2} strokeWidth="1.7" strokeLinecap="round" />
          <ellipse cx="97" cy="166" rx="2.2" ry="1.6" fill={LT2} transform="rotate(-30 97 166)" />
        </g>
      </g>
    ),
  },
  {
    id: 'pajarita', label: 'Corbatín',
    back: (c) => <path d={BAND_BACK} fill={c.accent} opacity="0.92" {...Sx} />,
    render: (c, n) => (
      <g>
        <path d="M50 142 Q100 156 150 142 L150 150 Q100 164 50 150 Z" fill={c.accent} {...Sx} />
        <path d="M56 146 Q100 158 144 146" fill="none" stroke={SH2} strokeWidth="1.8" strokeLinecap="round" />
        <g transform={flat(n, 100, 156)}>
          {/* ala izquierda con pliegues */}
          <path d="M94 156 L70 144 C65 151 65 161 70 168 Z" fill={c.accent} {...Sm} />
          <path d="M89 156 C82 152 78 153 74 149 M89 156 C82 160 78 159 74 163"
            fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
          {/* ala derecha */}
          <path d="M106 156 L130 144 C135 151 135 161 130 168 Z" fill={c.accent} {...Sm} />
          <path d="M111 156 C118 152 122 153 126 149 M111 156 C118 160 122 159 126 163"
            fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
          {/* nudo */}
          <rect x="93" y="147" width="14" height="18" rx="4.5" fill={alt(c, c.accent)} {...Sm} />
          <path d="M97 151 v10" stroke={LT} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    ),
  },
  {
    id: 'bufanda', label: 'Bufanda',
    // La bufanda es la prueba de fuego de todo esto: la banda trasera
    // pasa por detrás del cuerpo y asoma por los lados, y la vuelta de
    // adelante la cruza. Eso es lo que la hace ver envuelta y no pegada.
    back: (c) => (
      <g>
        <path d="M45 133 Q100 111 155 133 L156 151 Q100 129 44 151 Z" fill={c.accent} {...Sm} />
        <path d="M52 139 Q100 120 148 139" fill="none" stroke={SH2} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M50 145 Q100 125 150 145" fill="none" stroke={LT} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    render: (c) => (
      <g>
        {/* vuelta de adelante */}
        <path d="M50 139 Q100 165 150 139 L151 155 Q100 181 49 155 Z" fill={c.accent} {...Sm} />
        {/* sombra donde el cuerpo se mete bajo la tela */}
        <path d="M52 142 Q100 166 148 142 L148 147 Q100 171 52 147 Z" fill={SH} />
        <path d="M58 150 Q100 174 142 150" fill="none" stroke={SH2} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M56 145 Q100 168 144 145" fill="none" stroke={LT} strokeWidth="2.2" strokeLinecap="round" />
        {/* nudo al costado */}
        <ellipse cx="126" cy="156" rx="13" ry="10" fill={c.accent} {...Sm} transform="rotate(-14 126 156)" />
        <path d="M118 152 q8 6 15 2" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="121" cy="152" rx="4" ry="2.4" fill={LT} transform="rotate(-14 121 152)" />
        {/* la punta cuelga hacia adentro, sobre el cuerpo */}
        <path d="M122 163 C124 170 120 174 113 175 L127 172 C131 168 132 164 131 161 Z" fill={c.accent} {...Sm} />
        <path d="M124 165 C125 169 123 172 119 173" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
        <g stroke={c.accent} strokeWidth="2.6" strokeLinecap="round">
          <path d="M114 174 l-3 2" /><path d="M119 174 l-2 3" /><path d="M124 172 l-1 3" />
        </g>
      </g>
    ),
  },
  {
    id: 'panuelo', label: 'Pañuelo',
    back: (c) => <path d={BAND_BACK} fill={c.accent} opacity="0.92" {...Sx} />,
    render: (c) => (
      <g>
        {/* triángulo */}
        <path d="M52 141 Q100 159 148 141 L128 164 L100 174 L72 164 Z" fill={c.accent} {...Sm} />
        {/* vuelta del borde de arriba */}
        <path d="M52 141 Q100 159 148 141 L148 148 Q100 166 52 148 Z" fill={alt(c, '#FFFFFF')} opacity="0.42" />
        <path d="M100 154 V172" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
        <path d="M84 152 L94 168 M116 152 L106 168" fill="none" stroke={SH} strokeWidth="2" strokeLinecap="round" />
        {/* nuditos */}
        <circle cx="68" cy="147" r="4.6" fill={c.accent} {...Sx} />
        <circle cx="132" cy="147" r="4.6" fill={c.accent} {...Sx} />
      </g>
    ),
  },
  {
    id: 'medallon', label: 'Medallón',
    back: (c) => <path d={BAND_BACK_THIN} fill={c.accent} {...Sx} />,
    render: (c, n) => (
      <g>
        <path d="M56 141 Q100 168 144 141" fill="none" stroke={INK} strokeWidth="4.6" strokeLinecap="round" />
        <path d="M56 141 Q100 168 144 141" fill="none" stroke={c.accent} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M62 145 Q100 164 138 145" fill="none" stroke={LT} strokeWidth="1.4" strokeLinecap="round" />
        <g transform={flat(n, 100, 167)}>
          <path d="M100 174 C90 166 87 159 93 155 a7 7 0 0 1 7 3 a7 7 0 0 1 7 -3 c6 4 3 11 -7 19 Z" fill={alt(c, '#D8697F')} {...Sm} />
          <ellipse cx="95" cy="161" rx="2.8" ry="2" fill={LT2} transform="rotate(-26 95 161)" />
        </g>
      </g>
    ),
  },
  {
    id: 'pinchos', label: 'Collar de pinchos',
    back: (c) => <path d={BAND_BACK} fill={c.accent} {...Sx} />,
    render: (c, n) => {
      const metal = alt(c, '#A7A9AC');
      // Las púas siguen la curva de la banda y apuntan hacia afuera:
      // que sobresalgan de la silueta es justo lo que se quiere aquí.
      const spikes = [[57, 148, -52], [70, 157, -32], [85, 163, -14], [100, 165, 0], [115, 163, 14], [130, 157, 32], [143, 148, 52]];
      return (
        <g>
          <path d={BAND_FRONT} fill={c.accent} {...Sm} />
          <path d="M56 150 Q100 166 144 150" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M54 145 Q100 161 146 145" fill="none" stroke={LT} strokeWidth="2" strokeLinecap="round" />
          {spikes.map(([x, y, rot], i) => (
            <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
              <g transform={flat(n, x, y)}>
                <path d={`M${x - 5} ${y - 1} L${x} ${y + 11} L${x + 5} ${y - 1} Z`} fill={metal} {...Sx} />
                <path d={`M${x - 1.4} ${y} L${x} ${y + 7}`} stroke={LT2} strokeWidth="1.7" strokeLinecap="round" />
              </g>
            </g>
          ))}
        </g>
      );
    },
  },
  {
    id: 'choker', label: 'Choker',
    back: (c) => <path d="M45 135 Q100 120 155 135 L155 144 Q100 129 45 144 Z" fill={c.accent} {...Sx} />,
    render: (c, n) => {
      // Borde de encaje: ondas repartidas a lo largo de la cinta.
      const scallops = [];
      for (let i = 0; i <= 9; i++) {
        const t = i / 9;
        const x = 54 + t * 92;
        const y = 150 + Math.sin(Math.PI * t) * 13;
        scallops.push(`M${x - 5} ${y} q5 5.5 10 0`);
      }
      return (
        <g>
          <path d="M52 141 Q100 161 148 141 L148 151 Q100 171 52 151 Z" fill={c.accent} {...Sx} />
          <path d="M58 145 Q100 162 142 145" fill="none" stroke={LT} strokeWidth="1.8" strokeLinecap="round" />
          <g fill="none" stroke={c.accent} strokeWidth="2.2" strokeLinecap="round" opacity="0.92">
            {scallops.map((d, i) => <path key={i} d={d} />)}
          </g>
          <g transform={flat(n, 100, 168)}>
            <path d="M100 162 v3" stroke={alt(c, '#A7A9AC')} strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="169" r="7" fill="none" stroke={alt(c, '#A7A9AC')} strokeWidth="3.6" />
            <circle cx="100" cy="169" r="7" fill="none" stroke={INK} strokeWidth="1.3" />
            <path d="M96 166 a7 7 0 0 1 4 -2" fill="none" stroke={LT2} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
      );
    },
  },
  {
    id: 'cadena', label: 'Cadenota',
    back: (c) => <path d={BAND_BACK_THIN} fill={alt(c, '#C9A227')} {...Sx} />,
    render: (c, n) => {
      const metal = alt(c, '#C9A227');
      const links = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = (1 - t) ** 2 * 56 + 2 * (1 - t) * t * 100 + t ** 2 * 144;
        const y = (1 - t) ** 2 * 140 + 2 * (1 - t) * t * 172 + t ** 2 * 140;
        links.push([x, y, (t - 0.5) * 120, i]);
      }
      return (
        <g>
          {links.map(([x, y, rot, i]) => (
            <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
              <g transform={flat(n, x, y)}>
                <ellipse cx={x} cy={y} rx={i % 2 ? 4 : 5.2} ry={i % 2 ? 6 : 4.8} fill="none" stroke={INK} strokeWidth="4.4" />
                <ellipse cx={x} cy={y} rx={i % 2 ? 4 : 5.2} ry={i % 2 ? 6 : 4.8} fill="none" stroke={metal} strokeWidth="2.6" />
              </g>
            </g>
          ))}
          {/* dije de rayo */}
          <g transform={flat(n, 100, 168)}>
            <path d="M104 160 L93 172 L99 172 L96 179 L107 166 L101 166 Z" fill={metal} {...Sx} />
            <path d="M102 163 L98 169" stroke={LT2} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      );
    },
  },
  {
    id: 'medalla', label: 'Medalla',
    back: (c) => <path d={BAND_BACK_THIN} fill={c.accent} {...Sx} />,
    render: (c, n) => {
      const metal = alt(c, '#C9A227');
      return (
        <g>
          <path d="M72 140 L95 160 L89 166 L65 145 Z" fill={c.accent} {...Sx} />
          <path d="M128 140 L105 160 L111 166 L135 145 Z" fill={c.accent} {...Sx} />
          <path d="M75 143 L93 158 M125 143 L107 158" fill="none" stroke={LT} strokeWidth="1.8" strokeLinecap="round" />
          <g transform={flat(n, 100, 167)}>
            <circle cx="100" cy="167" r="11" fill={metal} {...Sm} />
            <circle cx="100" cy="167" r="7.6" fill="none" stroke={SH2} strokeWidth="1.5" />
            <path d="M100 161 c0.9 3.7 2.2 5 6 5.9 c-3.7 0.9 -5 2.2 -5.9 6 c-0.9 -3.7 -2.2 -5 -6 -5.9 c3.7 -0.9 5 -2.2 5.9 -6 Z" fill={LT2} opacity="0.85" />
            <ellipse cx="95" cy="162" rx="2.6" ry="1.9" fill={LT2} transform="rotate(-30 95 162)" />
          </g>
        </g>
      );
    },
  },
  {
    id: 'lei', label: 'Collar de flores',
    back: (c) => (
      <g>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const x = (1 - t) ** 2 * 48 + 2 * (1 - t) * t * 100 + t ** 2 * 152;
          const y = (1 - t) ** 2 * 132 + 2 * (1 - t) * t * 144 + t ** 2 * 132;
          return <circle key={i} cx={x} cy={y} r="7" fill={i % 2 ? alt(c, '#FFE270') : c.accent} {...Sx} />;
        })}
      </g>
    ),
    render: (c, n) => {
      const petals = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const x = (1 - t) ** 2 * 52 + 2 * (1 - t) * t * 100 + t ** 2 * 148;
        const y = (1 - t) ** 2 * 141 + 2 * (1 - t) * t * 175 + t ** 2 * 141;
        petals.push([x, y, i]);
      }
      return (
        <g>
          <path d="M52 141 Q100 175 148 141" fill="none" stroke="#7FA894" strokeWidth="2.8" strokeLinecap="round" />
          {petals.map(([x, y, i]) => {
            const col = i % 3 === 0 ? c.accent : i % 3 === 1 ? alt(c, '#FFE270') : '#FFFFFF';
            return (
              <g key={i} transform={flat(n, x, y)}>
                <g transform={`translate(${x} ${y}) rotate(${i * 24})`}>
                  {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse key={a} cx="0" cy="-4.6" rx="3.4" ry="4.6" fill={col} stroke={INK} strokeWidth="1.3" transform={`rotate(${a})`} />
                  ))}
                  <circle r="2.5" fill="#FFE270" stroke={INK} strokeWidth="1.1" />
                </g>
              </g>
            );
          })}
        </g>
      );
    },
  },
  {
    id: 'capa', label: 'Capa',
    // La capa es el único accesorio cuya parte trasera NO se estira con
    // la fórmula general: es una tela que cae hasta el piso, así que se
    // dibuja a la medida del cuerpo (ancho del cuello y dónde termina).
    fitBack: false,
    back: (c, n) => {
      const hw = (n && n.hw) || 50;
      const y0 = (n && n.y) || 146;
      const bot = (n && n.bottom) || 180;
      const w = hw * 1.28;
      const L = 100 - w, R = 100 + w;
      const ct = y0 - 44;  // alto del cuello parado
      return (
        <g>
          {/* Cuello parado: va DETRÁS de la cabeza, enmarcándola. Antes
              cruzaba por delante del pecho y se comía la boca. */}
          <path d={`M${100 - hw * 0.52} ${y0 + 4} C${100 - hw * 0.86} ${y0 - 12} ${100 - hw * 1.02} ${ct + 14} ${100 - hw * 0.96} ${ct}
                    C${100 - hw * 0.62} ${ct + 10} ${100 - hw * 0.4} ${y0 - 8} ${100 - hw * 0.3} ${y0 + 4} Z`}
            fill={c.accent} {...Sm} />
          <path d={`M${100 + hw * 0.52} ${y0 + 4} C${100 + hw * 0.86} ${y0 - 12} ${100 + hw * 1.02} ${ct + 14} ${100 + hw * 0.96} ${ct}
                    C${100 + hw * 0.62} ${ct + 10} ${100 + hw * 0.4} ${y0 - 8} ${100 + hw * 0.3} ${y0 + 4} Z`}
            fill={c.accent} {...Sm} />
          <path d={`M${100 - hw * 0.78} ${y0 - 6} C${100 - hw * 0.9} ${y0 - 20} ${100 - hw * 0.92} ${ct + 12} ${100 - hw * 0.88} ${ct + 6}`}
            fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
          <path d={`M${100 + hw * 0.78} ${y0 - 6} C${100 + hw * 0.9} ${y0 - 20} ${100 + hw * 0.92} ${ct + 12} ${100 + hw * 0.88} ${ct + 6}`}
            fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
          <path
            d={`M${100 - hw * 0.72} ${y0} C${L + 6} ${y0 + 16} ${L} ${bot - 18} ${L + 2} ${bot + 8}
                L${R - 2} ${bot + 8} C${R} ${bot - 18} ${R - 6} ${y0 + 16} ${100 + hw * 0.72} ${y0}
                C${100 + hw * 0.4} ${y0 + 14} ${100 - hw * 0.4} ${y0 + 14} ${100 - hw * 0.72} ${y0} Z`}
            fill={c.accent} {...Sm}
          />
          <path
            d={`M${100 - hw * 0.5} ${y0 + 12} C${L + 14} ${y0 + 34} ${L + 8} ${bot - 12} ${L + 10} ${bot + 4}
                M100 ${y0 + 16} V${bot + 6}
                M${100 + hw * 0.5} ${y0 + 12} C${R - 14} ${y0 + 34} ${R - 8} ${bot - 12} ${R - 10} ${bot + 4}`}
            fill="none" stroke={SH2} strokeWidth="2.6" strokeLinecap="round"
          />
          <path
            d={`M${100 - hw * 0.62} ${y0 + 8} C${L + 10} ${y0 + 30} ${L + 4} ${bot - 16} ${L + 6} ${bot}`}
            fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round"
          />
        </g>
      );
    },
    render: (c, n) => (
      <g>
        {/* Solo la banda que cruza el pecho y el broche. Lo alto de la
            capa vive en la capa trasera, detrás de la cabeza. */}
        <path d="M50 142 Q100 158 150 142 L150 152 Q100 168 50 152 Z" fill={c.accent} {...Sm} />
        <path d="M56 146 Q100 160 144 146" fill="none" stroke={LT} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M58 150 Q100 164 142 150" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" />
        {/* broche */}
        <g transform={flat(n, 100, 160)}>
          <circle cx="100" cy="161" r="8" fill={alt(c, '#C9A227')} {...Sx} />
          <circle cx="100" cy="161" r="3.4" fill={LT2} opacity="0.9" />
          <path d="M96 157 a8 8 0 0 1 4 -2" fill="none" stroke={LT2} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
    ),
  },
  {
    id: 'corbata', label: 'Corbata',
    back: (c) => <path d={BAND_BACK_THIN} fill={alt(c, '#F6EFE6')} {...Sx} />,
    render: (c, n) => (
      <g>
        {/* cuello de camisa */}
        <path d="M72 140 L100 154 L88 170 L74 148 Z" fill={alt(c, '#F6EFE6')} {...Sx} />
        <path d="M128 140 L100 154 L112 170 L126 148 Z" fill={alt(c, '#F6EFE6')} {...Sx} />
        <path d="M78 145 L96 156 M122 145 L104 156" fill="none" stroke={SH} strokeWidth="1.8" strokeLinecap="round" />
        <g transform={flat(n, 100, 162)}>
          {/* nudo */}
          <path d="M92 151 L108 151 L111 163 L89 163 Z" fill={c.accent} {...Sm} />
          <path d="M95 154 L93 161" stroke={LT} strokeWidth="1.9" strokeLinecap="round" />
          {/* corbata */}
          <path d="M90 163 L110 163 L106 174 L100 180 L94 174 Z" fill={c.accent} {...Sm} />
          <path d="M93 166 L105 170" fill="none" stroke={SH2} strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <path d="M96 165 L99 175" stroke={LT} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        </g>
      </g>
    ),
  },
];

// ── ACCESORIOS DE CARA ───────────────────────────────────────────
export const EXTRA_ACCESSORIES = [
  { id: 'ninguno', label: 'Sin nada', render: () => null },
  {
    id: 'lentes', label: 'Lentes',
    render: (c, cx, cy) => (
      <g>
        {/* patillas */}
        <path d={`M${cx - 36} ${cy - 2} l-11 -4 M${cx + 36} ${cy - 2} l11 -4`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
        {/* cristales con brillo */}
        <circle cx={cx - 21} cy={cy} r="16" fill="#CFE9FB" opacity="0.45" />
        <circle cx={cx + 21} cy={cy} r="16" fill="#CFE9FB" opacity="0.45" />
        <path d={`M${cx - 28} ${cy - 8} l9 -5`} stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.95" />
        <path d={`M${cx + 14} ${cy - 8} l9 -5`} stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.95" />
        <circle cx={cx - 21} cy={cy} r="16" fill="none" stroke={INK} strokeWidth="3.2" />
        <circle cx={cx + 21} cy={cy} r="16" fill="none" stroke={INK} strokeWidth="3.2" />
        <path d={`M${cx - 5} ${cy} h10`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'gafasol', label: 'Gafas de sol',
    render: (c, cx, cy) => (
      <g>
        <path d={`M${cx - 37} ${cy - 4} l-10 -4 M${cx + 37} ${cy - 4} l10 -4`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d={`M${cx - 38} ${cy - 8} h30 a4 4 0 0 1 4 4 l-1 8 a13 13 0 0 1 -25 1 l-8 -9 Z`} fill={INK} />
        <path d={`M${cx + 38} ${cy - 8} h-30 a4 4 0 0 0 -4 4 l1 8 a13 13 0 0 0 25 1 l8 -9 Z`} fill={INK} />
        <path d={`M${cx - 30} ${cy - 3} l8 -2`} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d={`M${cx + 12} ${cy - 3} l8 -2`} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d={`M${cx - 5} ${cy - 5} h10`} stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'antifaz', label: 'Antifaz',
    render: (c, cx, cy) => (
      <g>
        <path d={`M${cx - 36} ${cy - 6} Q${cx} ${cy - 22} ${cx + 36} ${cy - 6} Q${cx + 30} ${cy + 10} ${cx} ${cy + 5} Q${cx - 30} ${cy + 10} ${cx - 36} ${cy - 6} Z`} fill={c.accent} {...Sx} />
        <path d={`M${cx - 30} ${cy - 8} Q${cx} ${cy - 18} ${cx + 30} ${cy - 8}`} fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M${cx - 36} ${cy - 6} l-8 -3 M${cx + 36} ${cy - 6} l8 -3`} stroke={c.accent} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'pecas', label: 'Pequitas',
    render: (c, cx, cy) => (
      <g fill={SH2} opacity="0.65">
        <circle cx={cx - 30} cy={cy + 16} r="2" /><circle cx={cx - 23} cy={cy + 20} r="1.7" /><circle cx={cx - 34} cy={cy + 22} r="1.6" />
        <circle cx={cx + 30} cy={cy + 16} r="2" /><circle cx={cx + 23} cy={cy + 20} r="1.7" /><circle cx={cx + 34} cy={cy + 22} r="1.6" />
      </g>
    ),
  },
  {
    id: 'lunar', label: 'Lunarcito',
    render: (c, cx, cy) => <circle cx={cx + 27} cy={cy + 24} r="3" fill={INK} />,
  },
  {
    id: 'curita', label: 'Curita',
    render: (c, cx, cy) => (
      <g transform={`rotate(-18 ${cx - 26} ${cy + 20})`}>
        <rect x={cx - 38} y={cy + 14} width="24" height="11" rx="5" fill="#FFD9A8" stroke={INK} strokeWidth="2" />
        <rect x={cx - 31} y={cy + 16} width="10" height="7" rx="2" fill="#F2C089" />
        <g fill={SH} opacity="0.7">
          <circle cx={cx - 28} cy={cy + 18} r="0.9" /><circle cx={cx - 24} cy={cy + 18} r="0.9" />
          <circle cx={cx - 28} cy={cy + 21} r="0.9" /><circle cx={cx - 24} cy={cy + 21} r="0.9" />
        </g>
      </g>
    ),
  },
  {
    id: 'piercings', label: 'Piercings',
    render: (c, cx, cy) => {
      const metal = alt(c, '#A7A9AC');
      const stud = (x, y, r = 2.6) => (
        <g>
          <circle cx={x} cy={y} r={r} fill={metal} stroke={INK} strokeWidth="1.1" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.32} fill={LT2} />
        </g>
      );
      // Ojo con las alturas: la boca vive en cy+30 y algunas (labios,
      // grito) se estiran de cy+14 a cy+47. Todo esto tiene que quedar
      // por ENCIMA de eso o al costado, si no parece una segunda boca.
      return (
        <g>
          {/* argolla en el tabique — pequeña y bien por encima de la boca */}
          <path d={`M${cx - 4.5} ${cy + 11} a4.5 4.5 0 1 0 9 0`} fill="none" stroke={metal} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M${cx - 4.5} ${cy + 11} a4.5 4.5 0 1 0 9 0`} fill="none" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
          {/* barra en la ceja */}
          <path d={`M${cx - 31} ${cy - 15} l-6 -4`} stroke={metal} strokeWidth="2.8" strokeLinecap="round" />
          {stud(cx - 31, cy - 15)}
          {stud(cx - 37, cy - 19)}
          {/* labret al costado de la boca, nunca encima */}
          {stud(cx + 21, cy + 31, 2.4)}
          {/* orejas */}
          {stud(cx + 38, cy - 4, 2.4)}
          {stud(cx - 40, cy + 6, 2.2)}
        </g>
      );
    },
  },
  {
    id: 'parche', label: 'Parche de ojo',
    render: (c, cx, cy) => (
      <g>
        <path d={`M${cx - 41} ${cy - 9} L${cx + 42} ${cy - 17}`} stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
        <path d={`M${cx - 37} ${cy - 15} h29 a6 6 0 0 1 6 6 l-2 12 a16 15 0 0 1 -32 1 l-4 -13 a5 5 0 0 1 3 -6 Z`} fill="#231F2B" {...Sx} />
        <path d={`M${cx - 30} ${cy - 8} l9 -2`} stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" opacity="0.3" />
        <path d={`M${cx - 32} ${cy + 3} q10 5 20 1`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.18" />
      </g>
    ),
  },
  {
    id: 'lagrima', label: 'Lagrimita',
    render: (c, cx, cy) => (
      <g>
        <path d={`M${cx - 24} ${cy + 13} c-4.5 6.5 -1.5 11.5 3 11.5 c4.5 0 7 -5 2.5 -11.5 Z`} fill={c.accent} {...Sx} />
        <ellipse cx={cx - 24} cy={cy + 19} rx="1.6" ry="2" fill={LT2} opacity="0.8" />
        <path d={`M${cx - 24} ${cy + 30} c-3 4.5 -1 8 2 8 c3 0 4.5 -3.5 1.5 -8 Z`} fill="none" stroke={INK} strokeWidth="1.8" />
      </g>
    ),
  },
  {
    id: 'corpse', label: 'Corpse paint',
    // Va DEBAJO de los ojos: es maquillaje sobre la piel, no encima
    // de la mirada. Por eso usa `under` en vez de `render`.
    under: (c, cx, cy) => (
      <g>
        <ellipse cx={cx - 21} cy={cy} rx="20" ry="21" fill="#1A1720" opacity="0.92" />
        <ellipse cx={cx + 21} cy={cy} rx="20" ry="21" fill="#1A1720" opacity="0.92" />
        {/* El corpse paint real deja el ojo a la vista: se despeja el
            centro con el color del cuerpo. Sin esto la mirada se dibuja
            en tinta oscura sobre negro, desaparece, y las dos manchas
            parecen un segundo par de ojos. */}
        <ellipse cx={cx - 21} cy={cy} rx="13" ry="14" fill={c.body} />
        <ellipse cx={cx + 21} cy={cy} rx="13" ry="14" fill={c.body} />
        {/* chorretones — los de adentro se quedan cortos para no llegar
            a la boca (vive en cy+30) */}
        <g stroke="#1A1720" strokeWidth="4.4" strokeLinecap="round" opacity="0.92">
          <path d={`M${cx - 30} ${cy + 16} l-2 13`} />
          <path d={`M${cx - 17} ${cy + 17} l1 5`} />
          <path d={`M${cx + 30} ${cy + 16} l2 13`} />
          <path d={`M${cx + 17} ${cy + 17} l-1 5`} />
        </g>
        {/* raya de la frente */}
        <path d={`M${cx} ${cy - 24} v-13`} stroke="#1A1720" strokeWidth="5.4" strokeLinecap="round" opacity="0.92" />
      </g>
    ),
    render: () => null,
  },
  {
    id: 'brillos', label: 'Brillitos',
    render: (c, cx, cy) => {
      const sparkle = (x, y, s, col) => (
        <path
          d={`M${x} ${y - 7 * s} c0.9 3.6 2.1 4.8 5.7 5.7 c-3.6 0.9 -4.8 2.1 -5.7 5.7 c-0.9 -3.6 -2.1 -4.8 -5.7 -5.7 c3.6 -0.9 4.8 -2.1 5.7 -5.7 Z`}
          fill={col} stroke={INK} strokeWidth="0.9" strokeLinejoin="round"
        />
      );
      const a = c.accent;
      return (
        <g>
          {sparkle(cx - 38, cy - 12, 1, '#FFFFFF')}
          {sparkle(cx + 36, cy - 6, 0.85, a)}
          {sparkle(cx - 33, cy + 22, 0.75, a)}
          {sparkle(cx + 31, cy + 25, 1, '#FFFFFF')}
          {sparkle(cx + 6, cy - 30, 0.7, a)}
          <g fill="#FFFFFF" opacity="0.9">
            <circle cx={cx - 27} cy={cy + 12} r="1.7" />
            <circle cx={cx + 26} cy={cy + 14} r="1.7" />
            <circle cx={cx - 14} cy={cy - 26} r="1.4" />
          </g>
        </g>
      );
    },
  },
  {
    id: 'eyeblack', label: 'Rayas deportivas',
    render: (c, cx, cy) => (
      <g fill="#231F2B" opacity="0.88">
        <path d={`M${cx - 32} ${cy + 12} h19 l-3.5 9 h-14.5 Z`} />
        <path d={`M${cx + 13} ${cy + 12} h19 l-1 9 h-14.5 Z`} />
        <g fill="#FFFFFF" opacity="0.14">
          <path d={`M${cx - 30} ${cy + 14} h15 l-1 2.4 h-14 Z`} />
          <path d={`M${cx + 15} ${cy + 14} h15 l-0.5 2.4 h-14 Z`} />
        </g>
      </g>
    ),
  },
];

export function findPart(list, id) {
  return list.find((p) => p.id === id) || list[0];
}
