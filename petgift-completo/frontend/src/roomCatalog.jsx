import React from 'react';

// ─────────────────────────────────────────────────────────────────
// Catálogo de la habitación: muebles, pintura de pared y pisos.
//
// Todo está dibujado a mano en SVG (nada generado por IA, nada con
// derechos de autor). Cada mueble declara su tamaño en unidades del
// mundo y se dibuja con su propio viewBox, así se puede escalar y
// colocar libremente sin deformarse.
//
// `tags` sirve para sugerir muebles que peguen con el estilo de la
// mascota (gótico, rústico, deportista…). No esconde nada: solo
// ordena.
// ─────────────────────────────────────────────────────────────────

const INK = '#4A3439';
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sm = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sx = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' };
const SH = 'rgba(74,52,57,0.18)';
const SH2 = 'rgba(74,52,57,0.32)';
const LT = 'rgba(255,255,255,0.5)';
const LT2 = 'rgba(255,255,255,0.8)';

// ── MUEBLES ──────────────────────────────────────────────────────
//
// Todo se dibuja con la MISMA proyección: la cámara mira el cuarto de
// frente y un poco desde arriba, así que de cada mueble se ve su cara
// frontal y, encima, la cara superior en escorzo. Esa cara superior es
// lo que convierte una silueta plana en un objeto con volumen.
//
// Cada pieza usa tres tonos derivados del color elegido:
//   TOP   -> cara de arriba, la que recibe la luz
//   FRONT -> el color tal cual
//   SIDE  -> lo que queda en sombra
// Se derivan con `lit`/`dim` en vez de escribirlos a mano, para que
// funcione igual con un mueble crema y con uno negro.
//
// Además todo lleva sombra de contacto contra el piso: sin ella los
// muebles parecen calcomanías pegadas al fondo.

function mix(hex, target, amount) {
  const h = (hex || '#CCCCCC').replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  const t = parseInt(target.replace('#', ''), 16);
  if (Number.isNaN(n) || Number.isNaN(t)) return hex;
  const r = Math.round(((n >> 16) & 255) + ((((t >> 16) & 255)) - ((n >> 16) & 255)) * amount);
  const g = Math.round(((n >> 8) & 255) + ((((t >> 8) & 255)) - ((n >> 8) & 255)) * amount);
  const b = Math.round((n & 255) + ((t & 255) - (n & 255)) * amount);
  return `rgb(${r},${g},${b})`;
}
// Cuánta luz tiene ya el color de partida (0 = negro, 1 = blanco).
function lumOf(hex) {
  const h = (hex || '#CCCCCC').replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return 0.5;
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Sobre un mueble negro, aclarar un 26% no se nota: el volumen se perdía
// y quedaba una silueta plana. Por eso la cantidad se ajusta al color —
// los oscuros reciben mucha más luz, y los claros mucha más sombra.
const lit = (hex, a = 0.26) => mix(hex, '#FFF6E8', clamp01(a * (1 + (1 - lumOf(hex)) * 1.9)));
const dim = (hex, a = 0.26) => mix(hex, '#2B1F24', clamp01(a * (0.3 + lumOf(hex) * 1.1)));

// Sombra de apoyo contra el piso.
const Floorshadow = ({ cx, cy, rx, ry = null }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry || rx * 0.16} fill="rgba(74,52,57,0.28)" />
);

// place: 'piso' (se apoya en el suelo) | 'pared' (cuelga)
export const FURNITURE = [
  {
    // Vista desde los pies de la cama: cabecero al fondo, colchón que se
    // ensancha hacia el espectador. Antes era una tabla horizontal con un
    // cuadrado al lado y no se leía como una cama.
    id: 'cama', name: 'Camita', price: 180, w: 180, h: 178, place: 'piso',
    tags: ['dulce', 'princesa', 'aesthetic'],
    render: (c) => (
      <svg viewBox="0 0 180 178" width="100%" height="100%">
        <Floorshadow cx={90} cy={172} rx={78} />

        {/* patas traseras */}
        <path d="M34 128 v22 M146 128 v22" stroke={dim(c.wood, 0.45)} strokeWidth="8" strokeLinecap="round" />

        {/* cabecero: panel con marco y relleno hundido */}
        <path d="M32 54 V26 a12 12 0 0 1 12 -12 h92 a12 12 0 0 1 12 12 v28 Z" fill={c.wood} {...S} />
        <path d="M32 26 a12 12 0 0 1 12 -12 h92 a12 12 0 0 1 12 12 z" fill={lit(c.wood, 0.3)} />
        <path d="M46 50 V30 a4 4 0 0 1 4 -4 h80 a4 4 0 0 1 4 4 v20 Z" fill={dim(c.wood, 0.16)} />
        <path d="M50 48 V32 h30" fill="none" stroke={lit(c.wood, 0.4)} strokeWidth="2.4" strokeLinecap="round" />

        {/* colchón: trapecio, más ancho cerca del espectador */}
        <path d="M36 52 h108 l14 74 h-136 Z" fill="#FFF8EC" {...S} />
        <path d="M36 52 h108 l3 16 h-114 Z" fill={dim('#FFF8EC', 0.10)} />

        {/* almohadas, apoyadas contra el cabecero */}
        <g>
          <path d="M46 54 h38 l3 18 h-44 Z" fill="#FFFDF8" {...Sm} />
          <path d="M50 58 q16 -4 30 0" fill="none" stroke="rgba(74,52,57,0.18)" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 54 h38 l3 18 h-44 Z" fill="#FFFDF8" {...Sm} />
          <path d="M100 58 q16 -4 30 0" fill="none" stroke="rgba(74,52,57,0.18)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* sábana doblada + cobija, con pliegues que convergen al fondo */}
        <path d="M31 76 h118 l2 12 h-122 Z" fill="#FFFFFF" {...Sm} />
        <path d="M29 88 h122 l7 38 h-136 Z" fill={c.cloth} {...S} />
        <path d="M29 88 h122 l1.4 7 h-124.8 Z" fill={lit(c.cloth, 0.32)} />
        <g stroke={dim(c.cloth, 0.3)} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.75">
          <path d="M62 92 l-4 32" /><path d="M92 92 l0 32" /><path d="M122 92 l4 32" />
        </g>
        <path d="M34 118 h112" stroke={dim(c.cloth, 0.42)} strokeWidth="3" strokeLinecap="round" />

        {/* base y patas delanteras */}
        <path d="M22 126 h136 v14 a5 5 0 0 1 -5 5 h-126 a5 5 0 0 1 -5 -5 Z" fill={c.wood} {...S} />
        <path d="M22 126 h136 v5 h-136 Z" fill={lit(c.wood, 0.34)} />
        <path d="M28 145 v16 M152 145 v16" stroke={dim(c.wood, 0.35)} strokeWidth="9" strokeLinecap="round" />
        <path d="M28 145 v16" stroke={lit(c.wood, 0.2)} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'sofa', name: 'Sofá', price: 200, w: 215, h: 140, place: 'piso',
    tags: ['dulce', 'aesthetic', 'elegante'],
    render: (c) => (
      <svg viewBox="0 0 215 140" width="100%" height="100%">
        <Floorshadow cx={107} cy={133} rx={94} />

        {/* respaldo: tres cojines con su remate iluminado arriba */}
        <path d="M28 30 h159 a14 14 0 0 1 14 14 v42 h-187 v-42 a14 14 0 0 1 14 -14 Z" fill={c.cloth} {...S} />
        <path d="M28 30 h159 a14 14 0 0 1 14 14 h-187 a14 14 0 0 1 14 -14 Z" fill={lit(c.cloth, 0.3)} />
        <path d="M85 32 V84 M130 32 V84" stroke={dim(c.cloth, 0.32)} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M40 76 q22 -12 40 -3 M92 76 q22 -12 34 -3 M137 76 q22 -12 40 -3" fill="none" stroke={dim(c.cloth, 0.2)} strokeWidth="2.2" strokeLinecap="round" />

        {/* brazos: cara frontal + canto superior redondeado */}
        <path d="M6 60 a16 16 0 0 1 16 -16 h12 v66 h-28 Z" fill={c.cloth} {...S} />
        <path d="M6 60 a16 16 0 0 1 16 -16 h12 v9 h-28 Z" fill={lit(c.cloth, 0.26)} />
        <path d="M181 60 a16 16 0 0 1 16 -16 h12 v66 h-28 Z" fill={c.cloth} {...S} transform="scale(-1,1) translate(-390,0)" />
        <path d="M181 44 h12 a16 16 0 0 1 16 16 h-28 Z" fill={dim(c.cloth, 0.2)} />

        {/* asiento: cara superior clara en escorzo + frente en sombra */}
        <path d="M34 86 h147 l12 12 h-171 Z" fill={lit(c.cloth, 0.2)} {...Sm} />
        <path d="M22 98 h171 v14 a5 5 0 0 1 -5 5 h-161 a5 5 0 0 1 -5 -5 Z" fill={dim(c.cloth, 0.14)} {...S} />
        <path d="M107 86 l0 12" stroke={dim(c.cloth, 0.3)} strokeWidth="2.4" />

        {/* faldón y patas */}
        <path d="M30 117 v12 M185 117 v12" stroke={dim(c.wood, 0.3)} strokeWidth="9" strokeLinecap="round" />
        <path d="M30 117 v12" stroke={lit(c.wood, 0.25)} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'estanteria', name: 'Estantería', price: 150, w: 150, h: 210, place: 'piso',
    tags: ['elegante', 'rustico', 'dulce'],
    render: (c) => (
      <svg viewBox="0 0 150 210" width="100%" height="100%">
        <Floorshadow cx={75} cy={205} rx={62} />

        {/* costado en escorzo: es lo que le da grosor al mueble */}
        <path d="M132 14 l12 -8 v190 l-12 8 Z" fill={dim(c.wood, 0.34)} {...Sm} />
        <path d="M18 14 h114 l12 -8 h-114 Z" fill={lit(c.wood, 0.5)} {...Sm} />

        {/* carcasa y fondo hundido */}
        <path d="M18 14 h114 v190 h-114 Z" fill={c.wood} {...S} />
        <path d="M28 22 h94 v174 h-94 Z" fill={dim(c.wood, 0.3)} />

        {/* baldas: canto superior iluminado y bajo-sombra */}
        {[64, 110, 156].map((y, i) => (
          <g key={i}>
            <path d={`M22 ${y} h106 v10 h-106 Z`} fill={c.wood} {...Sm} />
            {/* canto superior bien iluminado: es lo que hace ver que la
                balda tiene grosor y no es una raya */}
            <path d={`M22 ${y} h106 v5 h-106 Z`} fill={lit(c.wood, 0.55)} />
            <path d={`M22 ${y} h106 v1.6 h-106 Z`} fill="rgba(255,255,255,0.6)" />
            <path d={`M28 ${y + 9} h94 v5 h-94 Z`} fill="rgba(0,0,0,0.22)" />
          </g>
        ))}

        {/* libros: alturas distintas y uno recostado */}
        <g {...Sx}>
          <rect x="33" y="30" width="12" height="34" rx="2" fill="#C4536B" />
          <rect x="33" y="30" width="12" height="4" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="47" y="26" width="10" height="38" rx="2" fill="#6F9B87" />
          <rect x="59" y="34" width="13" height="30" rx="2" fill="#D9A03F" />
          <rect x="74" y="28" width="9" height="36" rx="2" fill="#7FB4DC" />
          <path d="M86 64 l30 -9 v9 Z" fill="#B08AD4" />
        </g>
        <g {...Sx}>
          <rect x="33" y="78" width="11" height="32" rx="2" fill="#B08AD4" />
          <rect x="46" y="72" width="14" height="38" rx="2" fill="#A03F3A" />
          <rect x="46" y="72" width="14" height="4" rx="1.5" fill="rgba(255,255,255,0.35)" />
          <rect x="62" y="84" width="10" height="26" rx="2" fill="#E8C55C" />
        </g>

        {/* maceta y taza, con su propio volumen */}
        <g>
          <path d="M96 156 h22 l-3 -18 h-16 Z" fill="#B06E45" {...Sx} />
          <ellipse cx="107" cy="138" rx="11" ry="3.2" fill="#D98E63" {...Sx} />
          <path d="M107 138 q-11 -18 -3 -28 q9 8 3 28" fill="#7FA894" {...Sx} />
          <path d="M107 138 q11 -13 5 -23 q-10 5 -5 23" fill="#A6D6A0" {...Sx} />
        </g>
        <g>
          <path d="M92 196 h20 v-13 a10 6 0 0 1 -20 0 Z" fill="#FFD3E0" {...Sx} transform="translate(0,-3)" />
          <ellipse cx="102" cy="180" rx="10" ry="3" fill="#8B5E3C" {...Sx} />
        </g>

        <path d="M12 204 h126" stroke={dim(c.wood, 0.5)} strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'tocadiscos', name: 'Tocadiscos', price: 170, w: 128, h: 152, place: 'piso',
    tags: ['rockero', 'aesthetic', 'elegante', 'y2k'],
    render: (c) => (
      <svg viewBox="0 0 128 152" width="100%" height="100%">
        <Floorshadow cx={64} cy={147} rx={52} />

        {/* mesita con canto y patas */}
        <path d="M12 106 h96 l10 -7 h-96 Z" fill={lit(c.wood, 0.34)} {...Sm} />
        <path d="M12 106 h96 v9 h-96 Z" fill={c.wood} {...Sm} />
        <path d="M108 106 l10 -7 v9 l-10 7 Z" fill={dim(c.wood, 0.3)} {...Sx} />
        <path d="M20 115 v24 M100 115 v24" stroke={dim(c.wood, 0.36)} strokeWidth="7" strokeLinecap="round" />

        {/* tapa levantada por detrás */}
        <path d="M22 62 l8 -30 h72 l-8 30 Z" fill="rgba(190,215,230,0.5)" {...Sx} />
        <path d="M26 58 l6 -22 h20" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.4" strokeLinecap="round" />

        {/* cuerpo: cara superior en escorzo + frente */}
        <path d="M14 70 h92 l10 -8 h-92 Z" fill={lit(c.wood, 0.3)} {...Sm} />
        <path d="M14 70 h92 v36 h-92 Z" fill={c.wood} {...S} />
        <path d="M106 70 l10 -8 v36 l-10 8 Z" fill={dim(c.wood, 0.32)} {...Sx} />

        {/* plato y disco sobre la cara superior */}
        <ellipse cx="56" cy="66" rx="30" ry="11" fill={dim(c.wood, 0.45)} />
        <ellipse cx="56" cy="64" rx="28" ry="10" fill="#241F2A" {...Sx} />
        <ellipse cx="56" cy="63.5" rx="20" ry="7" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" />
        <ellipse cx="56" cy="63.5" rx="12" ry="4.2" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
        <ellipse cx="56" cy="63.5" rx="8" ry="2.9" fill={c.cloth} {...Sx} />
        <ellipse cx="56" cy="63.5" rx="1.8" ry="0.8" fill="#FFF6E8" />
        <path d="M32 60 a28 10 0 0 1 22 -7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />

        {/* brazo */}
        <circle cx="98" cy="60" r="5.5" fill="#B9BCC0" {...Sx} />
        <path d="M98 60 L74 66" stroke="#8E9296" strokeWidth="4" strokeLinecap="round" />
        <path d="M98 60 L74 66" stroke="#D4D7DA" strokeWidth="1.4" strokeLinecap="round" />

        {/* controles en el frente */}
        <circle cx="26" cy="88" r="6" fill={dim(c.wood, 0.5)} {...Sx} />
        <circle cx="24.5" cy="86" r="2" fill="rgba(255,255,255,0.5)" />
        <rect x="42" y="84" width="34" height="8" rx="4" fill={dim(c.wood, 0.45)} {...Sx} />
        <rect x="60" y="85" width="8" height="6" rx="3" fill={c.cloth} />

        {/* notas */}
        <g opacity="0.85">
          <path d="M96 30 v-14 l12 -3 v14" fill="none" stroke={c.cloth} strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="93" cy="31" rx="3.6" ry="2.8" fill={c.cloth} />
          <ellipse cx="105" cy="28" rx="3.6" ry="2.8" fill={c.cloth} />
        </g>
      </svg>
    ),
  },
  {
    id: 'alfombra', name: 'Alfombra', price: 90, w: 230, h: 66, place: 'piso',
    tags: ['dulce', 'hippie', 'rustico', 'aesthetic'],
    render: (c) => (
      <svg viewBox="0 0 230 66" width="100%" height="100%">
        {/* Se ve tumbada en el piso: elipse aplastada y flecos que caen
            hacia el espectador. */}
        <ellipse cx="115" cy="36" rx="108" ry="25" fill={dim(c.cloth, 0.3)} />
        <ellipse cx="115" cy="33" rx="106" ry="24" fill={c.cloth} {...S} />
        <ellipse cx="115" cy="30" rx="80" ry="17" fill="none" stroke={lit(c.cloth, 0.42)} strokeWidth="4" />
        <ellipse cx="115" cy="30" rx="52" ry="11" fill="none" stroke={dim(c.cloth, 0.3)} strokeWidth="4" />
        <ellipse cx="115" cy="29" rx="26" ry="5.6" fill={lit(c.cloth, 0.3)} />
        <path d="M50 20 a80 17 0 0 1 40 -8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
        {/* flecos */}
        <g stroke={dim(c.cloth, 0.16)} strokeWidth="3.2" strokeLinecap="round">
          {Array.from({ length: 13 }, (_, i) => {
            const t = (i / 12) * Math.PI;
            const x = 115 - Math.cos(t) * 104, y = 33 + Math.sin(t) * 24;
            return <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(t) * -3).toFixed(1)} ${(4 + Math.sin(t) * 3).toFixed(1)}`} />;
          })}
        </g>
      </svg>
    ),
  },
  {
    id: 'planta', name: 'Planta grande', price: 110, w: 120, h: 195, place: 'piso',
    tags: ['hippie', 'rustico', 'aesthetic', 'dulce'],
    render: (c) => (
      <svg viewBox="0 0 120 195" width="100%" height="100%">
        <Floorshadow cx={60} cy={189} rx={38} />
        {/* hojas: cada una con su nervadura y su mitad en sombra */}
        <path d="M60 138 C42 118 20 106 14 74 C36 68 56 90 60 118 Z" fill="#6E9C82" {...Sm} />
        <path d="M60 138 C46 120 30 108 22 84" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.4" />
        <path d="M60 138 C78 114 102 104 106 72 C84 68 64 92 60 118 Z" fill="#8CC58F" {...Sm} />
        <path d="M60 138 C74 116 90 106 98 84" fill="none" stroke="rgba(74,52,57,0.22)" strokeWidth="2.4" />
        <path d="M58 136 C54 100 60 60 78 34 C92 56 82 104 62 134 Z" fill="#A6D6A0" {...Sm} />
        <path d="M70 46 C66 74 64 106 62 130" fill="none" stroke="rgba(74,52,57,0.22)" strokeWidth="2.4" />
        <path d="M58 132 C52 100 40 66 26 44 C16 66 34 108 54 130 Z" fill="#7FA894" {...Sm} />
        <path d="M32 56 C40 82 48 108 56 128" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" />

        {/* maceta con boca elíptica: sin eso parece un trapecio pegado */}
        <path d="M32 148 h56 l-8 40 a5 5 0 0 1 -5 4 h-30 a5 5 0 0 1 -5 -4 Z" fill={dim('#C57A50', 0.12)} {...S} />
        <path d="M38 152 h44 l-6 34 h-32 Z" fill="#D98E63" />
        <path d="M41 154 l-5 30" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="60" cy="146" rx="30" ry="8" fill="#C57A50" {...S} />
        <ellipse cx="60" cy="145" rx="24" ry="5.6" fill="#5F4632" />
        <path d="M40 142 a30 8 0 0 1 20 -4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'escritorio', name: 'Escritorio', price: 160, w: 195, h: 140, place: 'piso',
    tags: ['elegante', 'y2k', 'deporte'],
    render: (c) => (
      <svg viewBox="0 0 195 140" width="100%" height="100%">
        <Floorshadow cx={97} cy={134} rx={84} />
        {/* tablero: cara superior en escorzo + canto */}
        <path d="M8 58 h170 l12 -9 h-170 Z" fill={lit(c.wood, 0.36)} {...Sm} />
        <path d="M8 58 h170 v10 h-170 Z" fill={c.wood} {...S} />
        <path d="M178 58 l12 -9 v10 l-12 9 Z" fill={dim(c.wood, 0.3)} {...Sx} />

        {/* cajonera con tiradores */}
        <path d="M112 68 h64 v54 h-64 Z" fill={c.wood} {...Sm} />
        <path d="M112 68 h64 v3 h-64 Z" fill={lit(c.wood, 0.3)} />
        {[80, 98, 116].map((y, i) => (
          <g key={i}>
            <path d={`M116 ${y} h56 v2 h-56 Z`} fill={dim(c.wood, 0.4)} />
            <rect x="136" y={y - 9} width="16" height="4" rx="2" fill={dim(c.wood, 0.55)} />
          </g>
        ))}
        <path d="M14 68 v54" stroke={dim(c.wood, 0.36)} strokeWidth="9" strokeLinecap="round" />
        <path d="M14 68 v54" stroke={lit(c.wood, 0.18)} strokeWidth="3" strokeLinecap="round" />

        {/* flexo */}
        <path d="M34 58 V32 q0 -9 11 -11" fill="none" stroke={dim(c.wood, 0.5)} strokeWidth="4" strokeLinecap="round" />
        <path d="M34 20 h28 l-7 15 h-14 Z" fill={c.cloth} {...Sm} />
        <path d="M34 20 h28 l-2 4 h-24 Z" fill={lit(c.cloth, 0.4)} />
        <ellipse cx="34" cy="57" rx="13" ry="4" fill={dim(c.cloth, 0.2)} {...Sx} />
        {/* cuaderno abierto */}
        <path d="M66 50 l18 -3 v9 l-18 3 Z" fill="#FFFDF6" {...Sx} />
        <path d="M84 47 l18 3 v9 l-18 -3 Z" fill="#F2EAE0" {...Sx} />
        <path d="M70 51 h10 M88 52 h10" stroke="rgba(74,52,57,0.3)" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: 'espejo', name: 'Espejo', price: 120, w: 96, h: 168, place: 'piso',
    tags: ['princesa', 'aesthetic', 'extravagante'],
    render: (c) => (
      <svg viewBox="0 0 96 168" width="100%" height="100%">
        <Floorshadow cx={48} cy={163} rx={32} />
        {/* marco con grosor: aro exterior oscuro y aro interior claro */}
        <path d="M48 8 C74 8 87 32 87 64 C87 98 72 126 48 126 C24 126 9 98 9 64 C9 32 22 8 48 8 Z" fill={dim(c.wood, 0.3)} {...S} />
        <path d="M48 13 C71 13 82 35 82 64 C82 95 69 120 48 120 C27 120 14 95 14 64 C14 35 25 13 48 13 Z" fill={c.wood} />
        <path d="M48 20 C68 20 77 39 77 64 C77 91 65 113 48 113 C31 113 19 91 19 64 C19 39 28 20 48 20 Z" fill="#C9DFEC" {...Sm} />
        {/* reflejo del cristal */}
        <path d="M48 20 C38 20 30 27 26 39 L58 113 C68 108 77 90 77 64 C77 45 70 28 58 22 Z" fill="#E4F1F8" opacity="0.75" />
        <path d="M29 48 C32 33 39 25 49 23" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        <path d="M26 76 C27 60 32 47 41 39" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        {/* pie con volumen */}
        <path d="M42 126 h12 v20 h-12 Z" fill={c.wood} {...Sm} />
        <path d="M42 126 h4 v20 h-4 Z" fill={lit(c.wood, 0.26)} />
        <path d="M20 158 h56 a8 8 0 0 0 -8 -12 h-40 a8 8 0 0 0 -8 12 Z" fill={c.wood} {...S} />
        <path d="M20 158 h56 v3 a3 3 0 0 1 -3 3 h-50 a3 3 0 0 1 -3 -3 Z" fill={dim(c.wood, 0.3)} />
        <path d="M30 150 h20" stroke={lit(c.wood, 0.35)} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'puf', name: 'Puf', price: 70, w: 108, h: 80, place: 'piso',
    tags: ['dulce', 'hippie', 'aesthetic'],
    render: (c) => (
      <svg viewBox="0 0 108 80" width="100%" height="100%">
        <Floorshadow cx={54} cy={74} rx={40} />
        {/* base hundida + cara superior abombada */}
        <path d="M54 20 C82 20 101 34 101 50 C101 64 80 72 54 72 C28 72 7 64 7 50 C7 34 26 20 54 20 Z" fill={dim(c.cloth, 0.22)} {...S} />
        <path d="M54 20 C80 20 98 33 98 46 C98 57 78 64 54 64 C30 64 10 57 10 46 C10 33 28 20 54 20 Z" fill={c.cloth} />
        <path d="M54 21 C76 21 93 32 97 44 C81 37 67 34 54 34 C41 34 27 37 11 44 C15 32 32 21 54 21 Z" fill={lit(c.cloth, 0.42)} />
        <path d="M54 22 C68 22 80 27 88 34 C76 30 65 28 54 28 C43 28 32 30 20 34 C28 27 40 22 54 22 Z" fill={lit(c.cloth, 0.62)} />
        {/* costuras que se abren desde el botón */}
        <g stroke={dim(c.cloth, 0.34)} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M54 24 V64" /><path d="M32 27 C26 42 27 55 34 64" /><path d="M76 27 C82 42 81 55 74 64" />
        </g>
        <ellipse cx="36" cy="32" rx="13" ry="6" fill="rgba(255,255,255,0.34)" transform="rotate(-16 36 32)" />
        <circle cx="54" cy="24" r="5" fill={dim(c.cloth, 0.4)} {...Sx} />
        <circle cx="52.6" cy="22.6" r="1.6" fill="rgba(255,255,255,0.5)" />
      </svg>
    ),
  },
  {
    id: 'guitarra', name: 'Guitarra', price: 140, w: 86, h: 205, place: 'piso',
    tags: ['rockero', 'metalero', 'hippie', 'punk'],
    render: (c) => (
      <svg viewBox="0 0 86 205" width="100%" height="100%">
        <Floorshadow cx={44} cy={200} rx={28} />
        <g transform="rotate(8 43 120)">
          {/* caja con canto en sombra y tapa iluminada */}
          <path d="M43 198 C21 198 10 181 12 164 C14 151 25 145 27 134 C29 123 20 115 22 104 C24 91 33 84 43 84 C53 84 62 91 64 104 C66 115 57 123 59 134 C61 145 72 151 74 164 C76 181 65 198 43 198 Z" fill={dim(c.wood, 0.3)} {...S} />
          <path d="M43 193 C25 193 16 179 18 165 C20 154 30 148 32 137 C34 126 25 118 27 107 C29 96 36 90 43 90 C50 90 57 96 59 107 C61 118 52 126 54 137 C56 148 66 154 68 165 C70 179 61 193 43 193 Z" fill={c.wood} />
          <path d="M30 110 C26 124 34 132 32 145 C30 157 22 163 20 173 C16 160 20 148 26 138 C22 128 24 117 30 110 Z" fill={lit(c.wood, 0.28)} />
          {/* boca con profundidad */}
          <circle cx="43" cy="158" r="13" fill="#1F1A24" {...Sm} />
          <circle cx="43" cy="158" r="16" fill="none" stroke={c.cloth} strokeWidth="2.6" />
          <path d="M32 152 a13 13 0 0 1 8 -6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          {/* mástil y clavijero */}
          <path d="M36 90 h14 v-70 h-14 Z" fill={dim(c.wood, 0.18)} {...Sm} />
          <path d="M36 90 h4 v-70 h-4 Z" fill={lit(c.wood, 0.2)} />
          <path d="M34 20 h18 a4 4 0 0 1 4 4 v16 h-26 v-16 a4 4 0 0 1 4 -4 Z" fill="#2A2530" {...Sm} />
          <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.2">
            <path d="M38 24 v152 M43 24 v152 M48 24 v152" />
          </g>
          <g stroke="#B9BCC0" strokeWidth="3" strokeLinecap="round">
            <path d="M30 26 h-5 M30 34 h-5 M56 26 h5 M56 34 h5" />
          </g>
          <path d="M32 176 h22 v6 h-22 Z" fill="#4A3439" {...Sx} />
        </g>
      </svg>
    ),
  },
  {
    id: 'bau', name: 'Baúl', price: 100, w: 140, h: 100, place: 'piso',
    tags: ['rustico', 'elegante', 'gotico'],
    render: (c) => (
      <svg viewBox="0 0 140 100" width="100%" height="100%">
        <Floorshadow cx={70} cy={95} rx={58} />
        {/* cuerpo con costado en escorzo */}
        <path d="M14 46 h104 l10 -7 h-104 Z" fill={lit(c.wood, 0.3)} {...Sx} />
        <path d="M14 46 h104 v38 a5 5 0 0 1 -5 5 h-94 a5 5 0 0 1 -5 -5 Z" fill={c.wood} {...S} />
        <path d="M14 46 h104 v7 h-104 Z" fill={lit(c.wood, 0.22)} />
        <path d="M18 82 h96 v7 a5 5 0 0 1 -5 5 h-86 a5 5 0 0 1 -5 -5 Z" fill={dim(c.wood, 0.3)} />
        <path d="M118 46 l10 -7 v38 l-10 7 Z" fill={dim(c.wood, 0.34)} {...Sx} />
        {/* Tapa abombada, en tres franjas anchas. Con una sola franja fina
            de luz el baúl se leía como una caja plana, sobre todo pintado
            de negro: la masa oscura se comía el brillo. */}
        <path d="M14 46 a52 26 0 0 1 104 0 Z" fill={dim(c.wood, 0.3)} {...S} />
        <path d="M17 43 a49 25 0 0 1 98 0 a49 19 0 0 0 -98 0 Z" fill={c.wood} />
        <path d="M21 36 a45 22 0 0 1 90 0 a45 14 0 0 0 -90 0 Z" fill={lit(c.wood, 0.34)} />
        <path d="M27 29 a39 18 0 0 1 78 0 a39 11 0 0 0 -78 0 Z" fill={lit(c.wood, 0.62)} />
        <path d="M34 25 a32 14 0 0 1 26 -6" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M14 46 h104" stroke={dim(c.wood, 0.45)} strokeWidth="3" />
        {/* refuerzos metálicos */}
        <path d="M40 22 v67 M100 22 v67" stroke={dim(c.cloth, 0.15)} strokeWidth="8" />
        <path d="M38 22 v67 M98 22 v67" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
        {/* cerradura */}
        <rect x="60" y="42" width="20" height="17" rx="3" fill="#C9A227" {...Sx} />
        <rect x="62" y="44" width="16" height="5" rx="2" fill="rgba(255,255,255,0.4)" />
        <circle cx="70" cy="52" r="2.6" fill="#4A3439" />
      </svg>
    ),
  },
  {
    id: 'ataud', name: 'Estante ataúd', price: 190, w: 118, h: 215, place: 'piso',
    tags: ['gotico', 'metalero', 'punk'],
    render: (c) => (
      <svg viewBox="0 0 118 215" width="100%" height="100%">
        <Floorshadow cx={59} cy={210} rx={44} />
        {/* silueta con canto lateral */}
        <path d="M59 6 L98 46 L90 180 a9 9 0 0 1 -9 9 h-44 a9 9 0 0 1 -9 -9 L20 46 Z" fill={dim(c.wood, 0.3)} {...S} />
        <path d="M59 12 L92 47 L85 176 h-52 L26 47 Z" fill={c.wood} />
        <path d="M59 12 L44 46 L38 176 h-5 L26 47 Z" fill={lit(c.wood, 0.16)} />
        {/* interior hundido */}
        <path d="M59 22 L84 50 L78 170 h-38 L34 50 Z" fill={dim(c.wood, 0.4)} />
        {/* baldas */}
        {[62, 106, 148].map((y, i) => (
          <g key={i}>
            <path d={`M${34 + i * 1.5} ${y} h${50 - i * 3} v8 h-${50 - i * 3} Z`} fill={c.wood} {...Sx} />
            <path d={`M${34 + i * 1.5} ${y} h${50 - i * 3} v2.5 h-${50 - i * 3} Z`} fill={lit(c.wood, 0.4)} />
          </g>
        ))}
        {/* velas con llama y cera */}
        <g>
          <rect x="38" y="36" width="11" height="26" rx="2" fill="#EDE3D4" {...Sx} />
          <path d="M38 40 q5 4 11 0 v-4 h-11 Z" fill="#FFFDF6" />
          <path d="M43.5 36 q-4.5 -8 0 -12 q4.5 4 0 12" fill="#FFC65C" />
          <rect x="55" y="44" width="9" height="18" rx="2" fill="#D8CFC7" {...Sx} />
          <path d="M59.5 44 q-3.5 -6 0 -9 q3.5 3 0 9" fill="#FFC65C" />
        </g>
        {/* frasco */}
        <g>
          <path d="M44 106 h26 v-20 a13 13 0 0 0 -26 0 Z" fill={c.cloth} opacity="0.8" {...Sx} />
          <path d="M48 100 v-14 a9 9 0 0 1 5 -8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.4" />
          <rect x="51" y="80" width="12" height="6" rx="2" fill="#8E9296" {...Sx} />
        </g>
      </svg>
    ),
  },
  {
    id: 'pesas', name: 'Pesas', price: 80, w: 140, h: 80, place: 'piso',
    tags: ['deporte'],
    render: (c) => (
      <svg viewBox="0 0 140 80" width="100%" height="100%">
        <Floorshadow cx={70} cy={72} rx={54} />
        {/* barra con brillo longitudinal */}
        <path d="M34 46 h72" stroke="#6E7275" strokeWidth="11" strokeLinecap="round" />
        <path d="M34 43 h72" stroke="#C6C9CC" strokeWidth="3.4" strokeLinecap="round" />
        {/* discos: aro exterior + cara frontal + brillo */}
        {[[24, 20], [116, -20]].map(([x, s], i) => (
          <g key={i}>
            <ellipse cx={x} cy={46} rx={13} ry={22} fill={dim(c.cloth, 0.32)} {...Sm} />
            <ellipse cx={x + (i ? -3 : 3)} cy={46} rx={11} ry={19} fill={c.cloth} />
            <ellipse cx={x + (i ? -5 : 5)} cy={38} rx={4} ry={7} fill="rgba(255,255,255,0.45)" />
            <ellipse cx={x + (i ? -3 : 3)} cy={46} rx={4} ry={7} fill={dim(c.cloth, 0.45)} />
          </g>
        ))}
        {/* topes */}
        <path d="M40 46 v0" />
        <rect x="38" y="34" width="6" height="24" rx="3" fill="#8E9296" {...Sx} />
        <rect x="96" y="34" width="6" height="24" rx="3" fill="#8E9296" {...Sx} />
      </svg>
    ),
  },
  {
    id: 'tocador', name: 'Tocador', price: 175, w: 158, h: 196, place: 'piso',
    tags: ['princesa', 'extravagante', 'aesthetic'],
    render: (c) => (
      <svg viewBox="0 0 158 196" width="100%" height="100%">
        <Floorshadow cx={79} cy={190} rx={68} />
        {/* espejo ovalado con marco grueso y bombillas */}
        <path d="M79 8 C107 8 122 34 122 66 C122 94 105 112 79 112 C53 112 36 94 36 66 C36 34 51 8 79 8 Z" fill={dim(c.wood, 0.28)} {...S} />
        <path d="M79 14 C104 14 116 37 116 66 C116 91 101 106 79 106 C57 106 42 91 42 66 C42 37 54 14 79 14 Z" fill={c.wood} />
        <path d="M79 21 C101 21 111 40 111 66 C111 88 98 100 79 100 C60 100 47 88 47 66 C47 40 57 21 79 21 Z" fill="#C9DFEC" {...Sm} />
        <path d="M79 21 C68 21 60 28 55 41 L92 99 C103 93 111 82 111 66 C111 44 98 25 79 21 Z" fill="#E4F1F8" opacity="0.7" />
        <path d="M58 48 C61 34 68 26 78 24" fill="none" stroke="#FFFFFF" strokeWidth="4.4" strokeLinecap="round" opacity="0.85" />
        <g>
          {[[43, 42], [39, 70], [115, 42], [119, 70], [79, 11]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="#FFE9A8" opacity="0.35" />
              <circle cx={x} cy={y} r="5" fill="#FFF3C4" {...Sx} />
              <circle cx={x - 1.6} cy={y - 1.6} r="1.6" fill="#FFFFFF" />
            </g>
          ))}
        </g>
        {/* mesa con cara superior y cajones */}
        <path d="M12 112 h134 l10 -8 h-134 Z" fill={lit(c.wood, 0.34)} {...Sm} />
        <path d="M12 112 h134 v66 a6 6 0 0 1 -6 6 h-122 a6 6 0 0 1 -6 -6 Z" fill={c.wood} {...S} />
        <path d="M146 112 l10 -8 v66 l-10 8 Z" fill={dim(c.wood, 0.3)} {...Sx} />
        {[128, 152].map((y, i) => (
          <g key={i}>
            <path d={`M20 ${y} h118 v2 h-118 Z`} fill={dim(c.wood, 0.4)} />
            <rect x="64" y={y - 10} width="30" height="5" rx="2.5" fill={dim(c.wood, 0.5)} />
            <rect x="64" y={y - 10} width="30" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
          </g>
        ))}
        {/* frasquitos sobre la mesa */}
        <g {...Sx}>
          <path d="M24 112 h14 v-14 h-14 Z" fill={c.cloth} />
          <rect x="27" y="92" width="8" height="6" rx="1.5" fill="#C9A227" />
          <path d="M26 110 v-10" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        </g>
      </svg>
    ),
  },
  {
    id: 'ventana', name: 'Ventana', price: 130, w: 156, h: 158, place: 'pared',
    tags: ['dulce', 'rustico', 'aesthetic', 'elegante'],
    render: (c) => (
      <svg viewBox="0 0 156 158" width="100%" height="100%">
        {/* marco exterior con grosor */}
        <path d="M10 8 h136 a6 6 0 0 1 6 6 v122 a6 6 0 0 1 -6 6 h-136 a6 6 0 0 1 -6 -6 v-122 a6 6 0 0 1 6 -6 Z" fill={dim(c.wood, 0.26)} {...S} />
        <path d="M10 8 h136 a6 6 0 0 1 6 6 h-148 a6 6 0 0 1 6 -6 Z" fill={lit(c.wood, 0.34)} />
        {/* derrame: la pared tiene espesor, así que el hueco va hundido */}
        <path d="M20 20 h116 v108 h-116 Z" fill={dim(c.wood, 0.42)} />
        <path d="M25 25 h106 v98 h-106 Z" fill="#BFE3F5" {...Sm} />

        {/* cielo con degradado por bandas y sol */}
        <path d="M25 25 h106 v34 h-106 Z" fill="#A9D8F0" />
        <path d="M25 89 h106 v34 h-106 Z" fill="#D6EEF9" />
        <circle cx="106" cy="46" r="11" fill="#FFE9A8" />
        <circle cx="106" cy="46" r="16" fill="#FFE9A8" opacity="0.3" />
        <g fill="#FFFFFF" opacity="0.9">
          <ellipse cx="48" cy="48" rx="15" ry="8" /><ellipse cx="60" cy="45" rx="11" ry="6.5" />
          <ellipse cx="96" cy="96" rx="14" ry="7" /><ellipse cx="84" cy="98" rx="10" ry="5" />
        </g>
        {/* colinas al fondo */}
        <path d="M25 106 q22 -18 44 0 q20 -14 40 0 q12 -8 22 -3 v20 h-106 Z" fill="#9CC98D" opacity="0.85" />

        {/* cruceta con luz arriba y sombra abajo */}
        <path d="M75 25 h6 v98 h-6 Z" fill={c.wood} />
        <path d="M75 25 h2 v98 h-2 Z" fill={lit(c.wood, 0.4)} />
        <path d="M25 71 h106 v6 h-106 Z" fill={c.wood} />
        <path d="M25 71 h106 v2 h-106 Z" fill={lit(c.wood, 0.4)} />
        <path d="M25 77 h106 v2 h-106 Z" fill="rgba(0,0,0,0.18)" />
        {/* reflejo diagonal del cristal */}
        <path d="M34 123 L72 25 h13 L47 123 Z" fill="#FFFFFF" opacity="0.16" />
        <path d="M92 123 L120 25 h6 L98 123 Z" fill="#FFFFFF" opacity="0.11" />

        {/* alféizar con canto */}
        <path d="M2 128 h152 l-6 8 h-140 Z" fill={lit(c.wood, 0.3)} {...Sm} />
        <path d="M8 136 h140 v8 a4 4 0 0 1 -4 4 h-132 a4 4 0 0 1 -4 -4 Z" fill={dim(c.wood, 0.2)} {...Sm} />

        {/* cortinas con pliegues */}
        <path d="M10 8 h30 c3 42 -5 80 -14 106 c-7 -32 -12 -70 -16 -106 Z" fill={c.cloth} {...Sm} />
        <path d="M18 14 c2 34 1 62 -2 84" fill="none" stroke={dim(c.cloth, 0.3)} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M28 14 c2 32 0 58 -4 78" fill="none" stroke={lit(c.cloth, 0.35)} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M146 8 h-30 c-3 42 5 80 14 106 c7 -32 12 -70 16 -106 Z" fill={c.cloth} {...Sm} />
        <path d="M138 14 c-2 34 -1 62 2 84" fill="none" stroke={dim(c.cloth, 0.3)} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'repisa', name: 'Repisa', price: 60, w: 136, h: 66, place: 'pared',
    tags: ['dulce', 'aesthetic', 'rustico', 'elegante'],
    render: (c) => (
      <svg viewBox="0 0 136 66" width="100%" height="100%">
        {/* tabla con canto superior en escorzo */}
        <path d="M8 40 h112 l8 -6 h-112 Z" fill={lit(c.wood, 0.36)} {...Sx} />
        <path d="M8 40 h112 v9 a3 3 0 0 1 -3 3 h-106 a3 3 0 0 1 -3 -3 Z" fill={c.wood} {...S} />
        <path d="M120 40 l8 -6 v9 l-8 6 Z" fill={dim(c.wood, 0.3)} {...Sx} />
        {/* escuadras */}
        <path d="M24 52 l-7 10 h5 l7 -10 Z" fill={dim(c.wood, 0.35)} {...Sx} />
        <path d="M106 52 l7 10 h-5 l-7 -10 Z" fill={dim(c.wood, 0.35)} {...Sx} />
        {/* cosas encima, con sombra propia sobre la tabla */}
        <ellipse cx="30" cy="39" rx="14" ry="3" fill="rgba(74,52,57,0.2)" />
        <g {...Sx}>
          <rect x="20" y="16" width="10" height="23" rx="2" fill="#C4536B" />
          <rect x="20" y="16" width="10" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="32" y="12" width="9" height="27" rx="2" fill="#6F9B87" />
        </g>
        <ellipse cx="70" cy="39" rx="12" ry="3" fill="rgba(74,52,57,0.2)" />
        <g {...Sx}>
          <path d="M62 39 h16 l-2 -12 h-12 Z" fill="#C08552" />
          <ellipse cx="70" cy="27" rx="8" ry="2.4" fill="#D98E63" />
          <path d="M70 27 q-8 -13 -2 -20 q7 6 2 20" fill="#8CC58F" />
        </g>
        <ellipse cx="104" cy="39" rx="11" ry="3" fill="rgba(74,52,57,0.2)" />
        <g {...Sx}>
          <circle cx="104" cy="29" r="10" fill={c.cloth} />
          <path d="M99 25 a6 6 0 0 1 5 -4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </svg>
    ),
  },
  {
    id: 'guirnalda', name: 'Guirnalda de luces', price: 85, w: 224, h: 76, place: 'pared',
    tags: ['dulce', 'aesthetic', 'y2k', 'princesa'],
    render: (c) => (
      <svg viewBox="0 0 224 76" width="100%" height="100%">
        <path d="M6 12 Q60 54 112 28 Q164 2 218 36" fill="none" stroke="rgba(74,52,57,0.35)" strokeWidth="3.4" strokeLinecap="round" />
        {[[26, 30], [53, 42], [81, 44], [110, 34], [138, 24], [166, 21], [194, 28]].map(([x, y], i) => (
          <g key={i}>
            {/* halo, para que se lea que están encendidas */}
            <circle cx={x} cy={y + 6} r="14" fill={i % 2 ? c.cloth : '#FFE9A8'} opacity="0.22" />
            <path d={`M${x} ${y - 6} v6`} stroke="rgba(74,52,57,0.5)" strokeWidth="2.6" />
            <rect x={x - 3} y={y - 3} width="6" height="5" rx="1.5" fill="#9A8B7E" />
            <circle cx={x} cy={y + 6} r="7.5" fill={i % 2 ? c.cloth : '#FFE9A8'} {...Sx} />
            <circle cx={x - 2.4} cy={y + 3.4} r="2.4" fill="rgba(255,255,255,0.8)" />
          </g>
        ))}
      </svg>
    ),
  },
];

// ── PINTURA DE PARED ─────────────────────────────────────────────
// Los patrones llevan luz y sombra propias: una raya plana de un solo
// color se lee como una línea de Paint; con un borde claro arriba y uno
// oscuro abajo se lee como papel pegado a la pared.
export const WALL_STYLES = [
  {
    id: 'crema', name: 'Crema lisa', price: 0, base: '#F6E7D3', tags: ['dulce'],
    render: () => null,
  },
  {
    id: 'rosada', name: 'Rosa suave', price: 60, base: '#FADCE4', tags: ['dulce', 'princesa'],
    render: () => null,
  },
  {
    id: 'menta', name: 'Menta', price: 60, base: '#D8EFE2', tags: ['aesthetic', 'hippie'],
    render: () => null,
  },
  {
    id: 'lavanda', name: 'Lavanda', price: 60, base: '#E3DCF5', tags: ['aesthetic', 'princesa'],
    render: () => null,
  },
  {
    id: 'rayas', name: 'Papel de rayas', price: 110, base: '#FBEFE0', tags: ['elegante', 'dulce'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.ceil(w / 46) }, (_, i) => (
          <g key={i}>
            <rect x={i * 46} y={0} width={22} height={h} fill="#E7C9A8" opacity="0.5" />
            <rect x={i * 46} y={0} width={2.5} height={h} fill="#FFFFFF" opacity="0.55" />
            <rect x={i * 46 + 19.5} y={0} width={2.5} height={h} fill="#4A3439" opacity="0.12" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'lunares', name: 'Papel de lunares', price: 110, base: '#FDE6EC', tags: ['dulce', 'y2k'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.ceil(h / 42) }, (_, r) =>
          Array.from({ length: Math.ceil(w / 42) + 1 }, (_, i) => {
            const cx = i * 42 + (r % 2 ? 21 : 0), cy = r * 42 + 20;
            return (
              <g key={`${r}-${i}`}>
                <circle cx={cx} cy={cy + 1.5} r="6.5" fill="#4A3439" opacity="0.10" />
                <circle cx={cx} cy={cy} r="6.5" fill="#F3AFC2" opacity="0.62" />
                <circle cx={cx - 2} cy={cy - 2.2} r="2.2" fill="#FFFFFF" opacity="0.5" />
              </g>
            );
          })
        )}
      </g>
    ),
  },
  {
    id: 'ladrillo', name: 'Ladrillo', price: 130, base: '#C58C6E', tags: ['rustico', 'rockero', 'punk'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.ceil(h / 30) }, (_, r) => (
          <g key={r}>
            {Array.from({ length: Math.ceil(w / 62) + 1 }, (_, i) => {
              const x = i * 62 + (r % 2 ? 31 : 0), y = r * 30;
              return (
                <g key={i}>
                  {/* cada ladrillo con su luz arriba y su sombra abajo */}
                  <rect x={x + 1.5} y={y + 1.5} width={59} height={27} fill="#B87F62" />
                  <rect x={x + 1.5} y={y + 1.5} width={59} height={3} fill="#FFFFFF" opacity="0.22" />
                  <rect x={x + 1.5} y={y + 25} width={59} height={3.5} fill="#4A3439" opacity="0.20" />
                  <rect x={x + 58} y={y + 1.5} width={2.5} height={27} fill="#4A3439" opacity="0.14" />
                </g>
              );
            })}
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'madera', name: 'Tablones', price: 130, base: '#B98A5E', tags: ['rustico', 'elegante'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.ceil(w / 54) }, (_, i) => (
          <g key={i}>
            <rect x={i * 54} y={0} width={3} height={h} fill="#4A3439" opacity="0.26" />
            <rect x={i * 54 + 3} y={0} width={3} height={h} fill="#FFFFFF" opacity="0.22" />
            {/* veta */}
            <path d={`M${i * 54 + 26} 0 q6 ${h * 0.3} 0 ${h * 0.55} q-6 ${h * 0.25} 0 ${h * 0.45}`} stroke="#4A3439" strokeWidth="1.4" fill="none" opacity="0.13" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'carbon', name: 'Gris carbón', price: 90, base: '#3B3742', tags: ['gotico', 'rockero', 'metalero'],
    render: () => null,
  },
  {
    id: 'vinotinto', name: 'Vinotinto', price: 120, base: '#4E1F2B', tags: ['gotico', 'elegante', 'extravagante'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.ceil(w / 70) + 1 }, (_, i) =>
          Array.from({ length: Math.ceil(h / 70) + 1 }, (_, r) => {
            const x = i * 70 + 35, y = r * 70 + 12;
            return (
              <g key={`${i}-${r}`}>
                <path d={`M${x} ${y + 1.5} c14 10 14 26 0 36 c-14 -10 -14 -26 0 -36 Z`} fill="#2E0F18" opacity="0.5" />
                <path d={`M${x} ${y} c14 10 14 26 0 36 c-14 -10 -14 -26 0 -36 Z`} fill="none" stroke="#9B6474" strokeWidth="2.2" opacity="0.55" />
                <path d={`M${x - 5} ${y + 12} q5 -6 5 -10`} stroke="#C79AA6" strokeWidth="1.6" fill="none" opacity="0.4" />
              </g>
            );
          })
        )}
      </g>
    ),
  },
  {
    id: 'medianoche', name: 'Azul medianoche', price: 90, base: '#22304A', tags: ['gotico', 'aesthetic', 'angelical'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.floor((w * h) / 7000) }, (_, i) => {
          const x = ((i * 137) % w), y = ((i * 271) % h);
          const r = i % 5 === 0 ? 2.6 : i % 3 === 0 ? 1.8 : 1.2;
          return (
            <g key={i}>
              {i % 5 === 0 && <circle cx={x} cy={y} r={r * 2.6} fill="#FFFFFF" opacity="0.10" />}
              <circle cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.35 + (i % 4) * 0.16} />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    id: 'neon', name: 'Neón', price: 140, base: '#2A1740', tags: ['y2k', 'punk', 'extravagante'],
    render: (w, h) => (
      <g>
        {Array.from({ length: Math.ceil(w / 80) + 1 }, (_, i) => (
          <g key={i}>
            <path d={`M${i * 80} ${h} L${i * 80 + 40} 0`} stroke="#FF6FD8" strokeWidth="7" fill="none" opacity="0.18" />
            <path d={`M${i * 80} ${h} L${i * 80 + 40} 0`} stroke="#FF6FD8" strokeWidth="2.6" fill="none" opacity="0.75" />
          </g>
        ))}
        {Array.from({ length: Math.ceil(h / 60) + 1 }, (_, r) => (
          <g key={`h${r}`}>
            <path d={`M0 ${r * 60} H${w}`} stroke="#2BE8E8" strokeWidth="6" fill="none" opacity="0.12" />
            <path d={`M0 ${r * 60} H${w}`} stroke="#2BE8E8" strokeWidth="1.8" fill="none" opacity="0.6" />
          </g>
        ))}
      </g>
    ),
  },
];

// ── PISOS ────────────────────────────────────────────────────────
// Las juntas se dibujan en PERSPECTIVA: las filas de atrás son finas y
// las de adelante anchas, y las verticales se abren hacia el frente.
// Un piso con líneas paralelas iguales se ve como papel cuadriculado,
// no como un suelo.

// Reparte `n` filas de forma que la de atrás sea fina y la de adelante
// ancha (progresión cuadrática). Devuelve las alturas acumuladas.
function perspectiveRows(h, n) {
  const ys = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    ys.push(h * (t * t * 0.72 + t * 0.28));
  }
  return ys;
}

// Tablas: se abren en abanico desde un punto de fuga alto y centrado.
function plankLines(w, h, count, stroke, width) {
  const vpX = w / 2, vpY = -h * 2.1;
  const lines = [];
  for (let i = 0; i <= count; i++) {
    const xBottom = (i / count) * w * 1.9 - w * 0.45;
    const k = (0 - vpY) / (h - vpY);
    const xTop = vpX + (xBottom - vpX) * k;
    lines.push(<path key={i} d={`M${xTop.toFixed(1)} 0 L${xBottom.toFixed(1)} ${h}`} stroke={stroke} strokeWidth={width} fill="none" />);
  }
  return lines;
}

export const FLOOR_STYLES = [
  {
    id: 'madera', name: 'Madera clara', price: 0, base: '#E0BE95', tags: ['dulce'],
    render: (w, h) => (
      <g>
        {plankLines(w, h, 26, 'rgba(74,52,57,0.22)', 2.2)}
        {plankLines(w, h, 26, 'rgba(255,255,255,0.30)', 1)}
        {perspectiveRows(h, 4).slice(1, -1).map((y, i) => (
          <path key={i} d={`M0 ${y.toFixed(1)} H${w}`} stroke="rgba(74,52,57,0.14)" strokeWidth="2" fill="none" />
        ))}
      </g>
    ),
  },
  {
    id: 'nogal', name: 'Madera oscura', price: 70, base: '#8B5E3C', tags: ['elegante', 'rustico', 'gotico'],
    render: (w, h) => (
      <g>
        {plankLines(w, h, 24, 'rgba(0,0,0,0.28)', 2.4)}
        {plankLines(w, h, 24, 'rgba(255,235,200,0.16)', 1)}
        {perspectiveRows(h, 4).slice(1, -1).map((y, i) => (
          <path key={i} d={`M0 ${y.toFixed(1)} H${w}`} stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none" />
        ))}
      </g>
    ),
  },
  {
    id: 'ajedrez', name: 'Baldosa ajedrez', price: 120, base: '#F2EAE0', tags: ['y2k', 'punk', 'elegante'],
    render: (w, h) => {
      const rows = perspectiveRows(h, 5);
      const out = [];
      for (let r = 0; r < rows.length - 1; r++) {
        const y0 = rows[r], y1 = rows[r + 1];
        // más columnas al fondo (se ven más chicas), menos al frente
        const cols = 26 - r * 3;
        const cw = w / cols;
        for (let c = 0; c < cols; c++) {
          if ((c + r) % 2 !== 0) continue;
          out.push(<rect key={`${r}-${c}`} x={c * cw} y={y0} width={cw} height={y1 - y0} fill="#3B3742" opacity="0.82" />);
        }
      }
      return <g>{out}</g>;
    },
  },
  {
    id: 'terracota', name: 'Terracota', price: 100, base: '#C97B5A', tags: ['rustico', 'hippie'],
    render: (w, h) => {
      const rows = perspectiveRows(h, 5);
      const out = [];
      for (let r = 0; r < rows.length - 1; r++) {
        const y0 = rows[r], y1 = rows[r + 1];
        const cols = 22 - r * 3;
        const cw = w / cols;
        out.push(<path key={`h${r}`} d={`M0 ${y0} H${w}`} stroke="rgba(74,52,57,0.3)" strokeWidth={1.4 + r * 0.5} fill="none" />);
        out.push(<path key={`s${r}`} d={`M0 ${y0 + 2} H${w}`} stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" fill="none" />);
        for (let c = 0; c <= cols; c++) {
          const x = c * cw + (r % 2 ? cw / 2 : 0);
          out.push(<path key={`v${r}-${c}`} d={`M${x.toFixed(1)} ${y0} V${y1}`} stroke="rgba(74,52,57,0.26)" strokeWidth={1.2 + r * 0.35} fill="none" />);
        }
      }
      return <g>{out}</g>;
    },
  },
  {
    id: 'alfombrado', name: 'Alfombrado', price: 110, base: '#9DB08A', tags: ['aesthetic', 'hippie', 'dulce'],
    render: (w, h) => {
      const out = [];
      // pelusa: mechones más largos y separados hacia el frente
      for (let r = 0; r < 7; r++) {
        const t = r / 6;
        const y = h * (t * t * 0.72 + t * 0.28);
        const step = 7 + t * 16;
        const len = 4 + t * 11;
        for (let x = (r % 2 ? step / 2 : 0); x < w; x += step) {
          out.push(<path key={`${r}-${x}`} d={`M${x.toFixed(1)} ${y.toFixed(1)} l${(len * 0.35).toFixed(1)} ${(-len).toFixed(1)}`} stroke="rgba(255,255,255,0.26)" strokeWidth={1 + t} fill="none" strokeLinecap="round" />);
        }
      }
      return <g>{out}</g>;
    },
  },
  {
    id: 'piedra', name: 'Piedra fría', price: 100, base: '#7C7A85', tags: ['gotico', 'metalero'],
    render: (w, h) => {
      const rows = perspectiveRows(h, 5);
      const out = [];
      for (let r = 0; r < rows.length - 1; r++) {
        const y0 = rows[r], y1 = rows[r + 1];
        const cols = 16 - r * 2;
        const cw = w / cols;
        out.push(<path key={`h${r}`} d={`M0 ${y0} H${w}`} stroke="rgba(0,0,0,0.34)" strokeWidth={1.6 + r * 0.6} fill="none" />);
        out.push(<path key={`s${r}`} d={`M0 ${y0 + 2.5} H${w}`} stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" fill="none" />);
        for (let c = 0; c <= cols; c++) {
          const x = c * cw + (r % 2 ? cw / 2 : 0);
          out.push(<path key={`v${r}-${c}`} d={`M${x.toFixed(1)} ${y0} V${y1}`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.4 + r * 0.4} fill="none" />);
        }
      }
      return <g>{out}</g>;
    },
  },
];

export const findFurniture = (id) => FURNITURE.find((f) => f.id === id) || null;
export const findWall = (id) => WALL_STYLES.find((w) => w.id === id) || WALL_STYLES[0];
export const findFloor = (id) => FLOOR_STYLES.find((f) => f.id === id) || FLOOR_STYLES[0];

// Colores de madera/tela con los que se pintan los muebles. Quien juega
// puede repintar cada mueble, así el mismo sofá sirve para un cuarto
// pastel y para uno gótico.
export const FURNITURE_PAINTS = [
  { id: 'natural', wood: '#D9A05B', cloth: '#D8697F' },
  { id: 'nogal', wood: '#8B5E3C', cloth: '#7FA894' },
  { id: 'blanco', wood: '#F2EAE0', cloth: '#8FC7EE' },
  { id: 'pastel', wood: '#F7D6C4', cloth: '#C3A7EA' },
  { id: 'negro', wood: '#3B3742', cloth: '#8E1F2C' },
  { id: 'vino', wood: '#4E1F2B', cloth: '#C9A227' },
  { id: 'neon', wood: '#2A1740', cloth: '#FF6FD8' },
  { id: 'bosque', wood: '#5E6B4F', cloth: '#E2A845' },
];

export const findPaint = (id) => FURNITURE_PAINTS.find((p) => p.id === id) || FURNITURE_PAINTS[0];
