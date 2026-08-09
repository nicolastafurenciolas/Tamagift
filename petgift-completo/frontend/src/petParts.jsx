import React from 'react';

// ─────────────────────────────────────────────────────────────────
// Librería de partes de la mascota (estilo Tomodachi Life / Picrew).
// Lienzo de 200x200. Orden de capas:
//   cola → orejas → cuerpo → patitas → pancita → patrón → sombreado
//   → cachetes → ojos → hocico/boca → accesorio cuello → cabeza → extra
//
// Todo se dibuja con volumen: cada pieza lleva su luz (blanco suave) y
// su sombra (negro suave), para que no se vea como "líneas sueltas"
// sino como algo con forma. Los accesorios envuelven de verdad al
// cuerpo (van por detrás y por delante), no flotan encima.
// ─────────────────────────────────────────────────────────────────

export const INK = '#4A3439';

// Sombra y luz reutilizables — sobre cualquier color de base.
export const SH = 'rgba(74,52,57,0.16)';   // sombra suave
export const SH2 = 'rgba(74,52,57,0.28)';  // sombra marcada
export const LT = 'rgba(255,255,255,0.55)'; // luz suave
export const LT2 = 'rgba(255,255,255,0.85)'; // brillo

// La paleta no puede ser solo pastel: hay parejas góticas, rockeras,
// metaleras, deportistas… Por eso hay bloques de tonos oscuros,
// terrosos y neón además de los pasteles.
export const BODY_COLORS = [
  // pasteles cálidos
  '#FFD9BE', '#FFC9A6', '#FFB98A', '#F7A072',
  '#FFD3E0', '#FFB1C6', '#FF9EB5', '#F582A7',
  // lilas y azules
  '#E3D6FA', '#C7ACEE', '#A98CE0', '#B8B5FF',
  '#CFE8FA', '#9DCEEF', '#7FB8E6', '#A5DEE5',
  // verdes y amarillos
  '#C9F0DC', '#8FDCB3', '#6FC99A', '#B8E0A0',
  '#FFF0B8', '#FFE270', '#FFD166', '#F2C14E',
  // neutros
  '#FFFFFF', '#F2EAE0', '#D8CFC7', '#B0A39A',
  // terrosos / rústico
  '#D9A05B', '#C08552', '#8B5E3C', '#6B4A34',
  '#A8B08A', '#7E8C61', '#5E6B4F', '#C97B5A',
  // oscuros / gótico / metalero
  '#7A6E86', '#5A5560', '#463F52', '#3D3A44',
  '#2E2A36', '#221E29', '#1A1720', '#111014',
  // dark con color
  '#5E2750', '#42234A', '#6B2737', '#4A1F2B',
  '#26404A', '#1F3247', '#3B2E1E', '#2C2018',
  // neón / y2k / extravagante
  '#FF3E6C', '#FF6FD8', '#B14AED', '#7B4BFF',
  '#00E5A0', '#2BE8E8', '#C6FF3D', '#FF9E1F',
];

export const ACCENT_COLORS = [
  // dulces
  '#D8697F', '#F582A7', '#FF9EB5', '#FFC2D6',
  '#E2A845', '#FFE270', '#7FA894', '#8FDCB3',
  '#8FC7EE', '#C3A7EA', '#FFFFFF', '#F6EFE6',
  // oscuros y sangre
  '#4A3439', '#2A2530', '#151217', '#000000',
  '#B0453F', '#8E1F2C', '#5E1120', '#6B2737',
  // metales
  '#C9A227', '#E8C766', '#A7A9AC', '#D6D8DA',
  '#8C6239', '#B87333',
  // púrpuras y góticos
  '#7B2D8E', '#5E2750', '#3E1F4E', '#9B6BD6',
  // tierra / rústico
  '#7E8C61', '#4F5D3A', '#C08552', '#8B5E3C',
  // neón / extravagante
  '#FF3E6C', '#FF6FD8', '#00E5A0', '#2BE8E8',
  '#C6FF3D', '#FF9E1F', '#3D5AFE',
];

// Pancita / interior de orejas — claros, pero también oscuros para
// que un cuerpo negro no quede obligado a tener panza crema.
export const BELLY_COLORS = [
  '#FFF1E4', '#FFFFFF', '#FFF6DC', '#FFE8EE',
  '#F0E6FB', '#E4F2FB', '#E6F6EC', '#F6EFE6',
  '#FFD9BE', '#FFC9DC', '#D8CFC7', '#EADFCB',
  '#B9A9C9', '#8E8299', '#6B6478', '#4A4454',
  '#332E3C', '#221E29', '#5E2750', '#6B2737',
  '#3B4A3A', '#4F5D3A',
];

// Iris — colores creíbles de ojos, más algunos de fantasía.
export const EYE_COLORS = [
  '#5B3E5C', '#3E6B8C', '#5E8873', '#8B5E3C',
  '#7A4A8C', '#2E2422', '#C1553F', '#D8697F',
  '#E2A845', '#4FA3A3',
  // intensos: gótico, metalero, y2k
  '#B0453F', '#8E1F2C', '#C9A227', '#A7A9AC',
  '#00E5A0', '#2BE8E8', '#B14AED', '#FF3E6C',
];

const S = { stroke: INK, strokeWidth: 3.4, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sm = { stroke: INK, strokeWidth: 2.8, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sx = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' };

// ── Patita reutilizable (con almohadillas) ───────────────────────
function Paw({ x, y, rx = 16, ry = 10, color, flip = 1 }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} {...Sm} />
      <ellipse cx={x} cy={y + ry * 0.22} rx={rx * 0.5} ry={ry * 0.42} fill={SH} />
      <ellipse cx={x - rx * 0.3 * flip} cy={y - ry * 0.35} rx={rx * 0.3} ry={ry * 0.28} fill={LT} />
    </g>
  );
}

// ── CUERPOS ──────────────────────────────────────────────────────
// face: dónde va la cara. feet: patitas delanteras. belly: pancita.
//
// `neck` es clave para que los accesorios de cuello queden PUESTOS y no
// cortos. Cada cuerpo tiene un ancho distinto: medido sobre la silueta
// rasterizada, el medio-ancho a la altura del cuello va de 59 (alargadito)
// a 74 (gordito). Los accesorios se dibujan una sola vez en un espacio
// canónico (medio-ancho 50, línea del cuello en y=146) y se estiran a
// estos valores. `y` está elegido para quedar debajo de la boca y dejar
// sitio para lo que cuelga sin salirse del cuerpo.
export const NECK_BASE_HW = 50;   // medio-ancho del espacio canónico
export const NECK_BASE_Y = 146;   // línea del cuello en el espacio canónico

export const BODIES = [
  {
    id: 'redondo', label: 'Redondito',
    face: { cx: 100, cy: 110, w: 1 },
    d: 'M100 44 C147 44 171 78 171 119 C171 159 141 181 100 181 C59 181 29 159 29 119 C29 78 53 44 100 44 Z',
    belly: { cy: 138, rx: 41, ry: 32 },
    feet: [{ x: 70, y: 178, rx: 16, ry: 9 }, { x: 130, y: 178, rx: 16, ry: 9 }],
    neck: { y: 144, hw: 67, bottom: 180 },
  },
  {
    id: 'ovalado', label: 'Alargadito',
    face: { cx: 100, cy: 100, w: 0.92 },
    d: 'M100 34 C139 34 160 68 160 114 C160 158 137 182 100 182 C63 182 40 158 40 114 C40 68 61 34 100 34 Z',
    belly: { cy: 134, rx: 34, ry: 34 },
    feet: [{ x: 74, y: 179, rx: 14, ry: 8.5 }, { x: 126, y: 179, rx: 14, ry: 8.5 }],
    neck: { y: 134, hw: 59, bottom: 181 },
  },
  {
    id: 'gordito', label: 'Gordito',
    face: { cx: 100, cy: 112, w: 1.08 },
    d: 'M100 50 C152 50 178 82 178 120 C178 158 145 180 100 180 C55 180 22 158 22 120 C22 82 48 50 100 50 Z',
    belly: { cy: 140, rx: 48, ry: 31 },
    feet: [{ x: 66, y: 177, rx: 18, ry: 9.5 }, { x: 134, y: 177, rx: 18, ry: 9.5 }],
    neck: { y: 144, hw: 74, bottom: 179 },
  },
  {
    id: 'gotita', label: 'Gotita',
    // La cara iba en 118, tan abajo que no quedaba sitio entre la boca y
    // el piso para ningún accesorio de cuello. Subida a 108.
    face: { cx: 100, cy: 108, w: 0.96 },
    d: 'M100 36 C124 66 168 90 168 126 C168 160 137 181 100 181 C63 181 32 160 32 126 C32 90 76 66 100 36 Z',
    belly: { cy: 145, rx: 38, ry: 28 },
    feet: [{ x: 74, y: 178, rx: 15, ry: 9 }, { x: 126, y: 178, rx: 15, ry: 9 }],
    neck: { y: 142, hw: 66, bottom: 180 },
  },
  {
    id: 'nube', label: 'Nubecita',
    face: { cx: 100, cy: 112, w: 1 },
    d: 'M60 68 C58 46 90 38 102 56 C118 38 146 50 143 72 C168 72 178 98 165 118 C177 142 158 172 127 173 C112 183 88 183 73 173 C42 172 23 142 35 118 C22 98 34 68 60 68 Z',
    belly: { cy: 138, rx: 40, ry: 29 },
    feet: null,
    neck: { y: 144, hw: 68, bottom: 180 },
  },
  {
    id: 'cuadrado', label: 'Cuadradito',
    face: { cx: 100, cy: 110, w: 1.02 },
    d: 'M62 46 H138 A30 30 0 0 1 168 76 V146 A30 30 0 0 1 138 176 H62 A30 30 0 0 1 32 146 V76 A30 30 0 0 1 62 46 Z',
    belly: { cy: 134, rx: 42, ry: 32 },
    feet: [{ x: 68, y: 174, rx: 15, ry: 8 }, { x: 132, y: 174, rx: 15, ry: 8 }],
    neck: { y: 139, hw: 69, bottom: 175 },
  },
  {
    id: 'pera', label: 'Peritas',
    face: { cx: 100, cy: 100, w: 0.9 },
    d: 'M100 40 C132 40 150 66 150 96 C150 114 174 132 174 152 C174 170 143 182 100 182 C57 182 26 170 26 152 C26 132 50 114 50 96 C50 66 68 40 100 40 Z',
    belly: { cy: 146, rx: 46, ry: 28 },
    feet: [{ x: 70, y: 179, rx: 16, ry: 8.5 }, { x: 130, y: 179, rx: 16, ry: 8.5 }],
    neck: { y: 137, hw: 72, bottom: 181 },
  },
  {
    id: 'bombon', label: 'Bomboncito',
    face: { cx: 100, cy: 108, w: 1.04 },
    d: 'M100 46 C150 46 174 74 174 110 C174 152 147 178 100 178 C53 178 26 152 26 110 C26 74 50 46 100 46 Z',
    belly: { cy: 140, rx: 44, ry: 28 },
    feet: [{ x: 70, y: 176, rx: 16, ry: 9 }, { x: 130, y: 176, rx: 16, ry: 9 }],
    neck: { y: 140, hw: 69, bottom: 177 },
  },
];

// Calcula cómo estirar un accesorio de cuello para este cuerpo.
// El eje X se estira lo que haga falta (una bufanda en un cuerpo gordo
// SÍ es más ancha). El eje Y solo un 30% de eso, para no deformar.
export function neckFit(body) {
  const n = (body && body.neck) || { y: NECK_BASE_Y, hw: NECK_BASE_HW, bottom: 180 };
  const sx = n.hw / NECK_BASE_HW;
  const sy = 1 + (sx - 1) * 0.3;
  return {
    ...n, sx, sy,
    transform: `translate(100 ${n.y}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(-100 ${-NECK_BASE_Y})`,
  };
}

// ¿El color es tan claro que no se vería sobre un fondo claro? Se usa
// para elegir un tono de respaldo (labios, joyas) sin que desaparezcan.
export function isPale(hex) {
  const h = (hex || '#FFFFFF').replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return false;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 218;
}

// Mezcla un hex con un tono oscuro cálido — para la sombra del borde.
export function darken(hex, amount = 0.16) {
  const h = (hex || '#FFD9BE').replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (ch, t) => Math.round(ch + (t - ch) * amount);
  return `rgb(${mix(r, 74)}, ${mix(g, 52)}, ${mix(b, 57)})`;
}

// Dibuja el cuerpo completo con volumen.
// Truco para el sombreado sin usar clipPath (que ensucia la consola y
// obliga a inventar ids únicos): se pinta la silueta en un tono más
// oscuro y encima la MISMA silueta reducida un 6% y corrida hacia
// arriba-izquierda. Lo que asoma por abajo-derecha es la sombra, y como
// la copia de encima está escalada hacia adentro, nada se sale nunca
// del contorno, sea cual sea la forma del cuerpo.
export function renderBody(body, c) {
  const b = body.belly;
  return (
    <g>
      {/* patitas por detrás del cuerpo */}
      {body.feet && body.feet.map((f, i) => (
        <Paw key={i} x={f.x} y={f.y} rx={f.rx} ry={f.ry} color={c.body} flip={i === 0 ? 1 : -1} />
      ))}
      {/* silueta en tono de sombra */}
      <path d={body.d} fill={darken(c.body, 0.18)} />
      {/* copia reducida y desplazada = la zona iluminada */}
      <g transform="translate(97,105) scale(0.94) translate(-100,-110)">
        <path d={body.d} fill={c.body} />
      </g>
      {/* pancita */}
      {b && (
        <g>
          <ellipse cx="99" cy={b.cy - 2} rx={b.rx * 0.94} ry={b.ry * 0.92} fill={c.inner} opacity="0.95" />
          <ellipse cx="99" cy={b.cy + b.ry * 0.38} rx={b.rx * 0.76} ry={b.ry * 0.4} fill={SH} opacity="0.26" />
        </g>
      )}
      {/* brillo superior izquierdo */}
      <ellipse cx="72" cy="80" rx="21" ry="14" fill={LT} transform="rotate(-24 72 80)" />
      {/* contorno por encima de todo */}
      <path d={body.d} fill="none" {...S} />
    </g>
  );
}

// ── OREJAS ───────────────────────────────────────────────────────
// Van DETRÁS del cuerpo. Cada una lleva interior + pelusa + sombra.
export const EARS = [
  { id: 'ninguna', label: 'Sin orejas', render: () => null },
  {
    id: 'gato', label: 'Gatito',
    render: (c) => (
      <g>
        <path d="M50 76 C40 40 56 28 80 52 C87 60 84 72 77 80 Z" fill={c.body} {...S} />
        <path d="M150 76 C160 40 144 28 120 52 C113 60 116 72 123 80 Z" fill={c.body} {...S} />
        <path d="M57 70 C50 46 60 40 72 54 C76 60 74 66 70 72 Z" fill={c.inner} {...Sx} />
        <path d="M143 70 C150 46 140 40 128 54 C124 60 126 66 130 72 Z" fill={c.inner} {...Sx} />
        <path d="M60 66 C55 50 61 46 68 55" fill="none" stroke={SH2} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M140 66 C145 50 139 46 132 55" fill="none" stroke={SH2} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'conejo', label: 'Conejito',
    render: (c) => (
      <g>
        <g transform="rotate(-13 76 46)">
          <ellipse cx="76" cy="46" rx="14.5" ry="32" fill={c.body} {...S} />
          <ellipse cx="76" cy="48" rx="7" ry="23" fill={c.inner} />
          <ellipse cx="78" cy="54" rx="3.6" ry="16" fill={SH} opacity="0.5" />
          <ellipse cx="72" cy="32" rx="3.8" ry="9" fill={LT} />
        </g>
        <g transform="rotate(13 124 46)">
          <ellipse cx="124" cy="46" rx="14.5" ry="32" fill={c.body} {...S} />
          <ellipse cx="124" cy="48" rx="7" ry="23" fill={c.inner} />
          <ellipse cx="126" cy="54" rx="3.6" ry="16" fill={SH} opacity="0.5" />
          <ellipse cx="120" cy="32" rx="3.8" ry="9" fill={LT} />
        </g>
      </g>
    ),
  },
  {
    id: 'oso', label: 'Osito',
    render: (c) => (
      <g>
        <circle cx="54" cy="62" r="22" fill={c.body} {...S} />
        <circle cx="146" cy="62" r="22" fill={c.body} {...S} />
        <circle cx="54" cy="63" r="11.5" fill={c.inner} />
        <circle cx="146" cy="63" r="11.5" fill={c.inner} />
        <path d="M46 70 a11.5 11.5 0 0 0 16 0" fill={SH} opacity="0.45" />
        <path d="M138 70 a11.5 11.5 0 0 0 16 0" fill={SH} opacity="0.45" />
        <circle cx="47" cy="54" r="5" fill={LT} />
        <circle cx="139" cy="54" r="5" fill={LT} />
      </g>
    ),
  },
  {
    id: 'perro', label: 'Perrito',
    render: (c) => (
      <g>
        <path d="M52 56 C24 58 18 100 34 122 C50 140 66 122 62 96 Z" fill={c.body} {...S} />
        <path d="M148 56 C176 58 182 100 166 122 C150 140 134 122 138 96 Z" fill={c.body} {...S} />
        <path d="M48 68 C32 74 30 104 42 118" fill="none" stroke={SH2} strokeWidth="3" strokeLinecap="round" />
        <path d="M152 68 C168 74 170 104 158 118" fill="none" stroke={SH2} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="40" cy="76" rx="6" ry="11" fill={LT} transform="rotate(-18 40 76)" />
        <ellipse cx="160" cy="76" rx="6" ry="11" fill={LT} transform="rotate(18 160 76)" />
      </g>
    ),
  },
  {
    id: 'zorro', label: 'Zorrito',
    render: (c) => (
      <g>
        <path d="M44 80 C32 34 54 24 86 52 Z" fill={c.body} {...S} />
        <path d="M156 80 C168 34 146 24 114 52 Z" fill={c.body} {...S} />
        <path d="M52 70 C44 42 56 36 76 54 Z" fill={c.inner} {...Sx} />
        <path d="M148 70 C156 42 144 36 124 54 Z" fill={c.inner} {...Sx} />
        <path d="M48 62 C42 40 50 34 62 44" fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M152 62 C158 40 150 34 138 44" fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'raton', label: 'Ratoncito',
    render: (c) => (
      <g>
        <circle cx="48" cy="54" r="27" fill={c.body} {...S} />
        <circle cx="152" cy="54" r="27" fill={c.body} {...S} />
        <circle cx="48" cy="55" r="15" fill={c.inner} />
        <circle cx="152" cy="55" r="15" fill={c.inner} />
        <path d="M37 62 a15 15 0 0 0 22 0" fill={SH} opacity="0.4" />
        <path d="M141 62 a15 15 0 0 0 22 0" fill={SH} opacity="0.4" />
        <circle cx="39" cy="44" r="6" fill={LT} />
        <circle cx="143" cy="44" r="6" fill={LT} />
      </g>
    ),
  },
  {
    id: 'oveja', label: 'Ovejita',
    render: (c) => (
      <g>
        {/* orejitas caídas */}
        <ellipse cx="46" cy="74" rx="18" ry="11" fill={c.body} {...Sm} transform="rotate(-26 46 74)" />
        <ellipse cx="154" cy="74" rx="18" ry="11" fill={c.body} {...Sm} transform="rotate(26 154 74)" />
        {/* lana con volumen */}
        <circle cx="70" cy="46" r="16" fill={c.inner} {...Sm} />
        <circle cx="100" cy="36" r="18" fill={c.inner} {...Sm} />
        <circle cx="130" cy="46" r="16" fill={c.inner} {...Sm} />
        <circle cx="85" cy="52" r="13" fill={c.inner} {...Sm} />
        <circle cx="115" cy="52" r="13" fill={c.inner} {...Sm} />
        <circle cx="94" cy="32" r="6" fill={LT2} />
        <circle cx="74" cy="42" r="4.5" fill={LT} />
        <path d="M78 58 a13 13 0 0 0 18 2" fill="none" stroke={SH} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'unicornio', label: 'Unicornio',
    render: (c) => (
      <g>
        <path d="M50 76 C40 44 56 34 80 54 C87 62 84 72 77 80 Z" fill={c.body} {...S} />
        <path d="M150 76 C160 44 144 34 120 54 C113 62 116 72 123 80 Z" fill={c.body} {...S} />
        <path d="M57 70 C50 48 60 42 72 56 Z" fill={c.inner} {...Sx} />
        <path d="M143 70 C150 48 140 42 128 56 Z" fill={c.inner} {...Sx} />
        {/* cuerno con espiral */}
        <path d="M100 48 L89 20 L100 8 L111 20 Z" fill={c.accent} {...Sm} />
        <path d="M93 35 L107 31 M95 26 L105 23" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M100 11 L104 21 L100 25 Z" fill={LT2} />
        {/* mechón de crin */}
        <path d="M84 50 C74 38 82 30 92 40" fill={c.accent} {...Sx} opacity="0.9" />
      </g>
    ),
  },
  {
    id: 'cerdito', label: 'Cerdito',
    render: (c) => (
      <g>
        <path d="M52 70 C42 44 68 36 84 58 Z" fill={c.body} {...S} />
        <path d="M148 70 C158 44 132 36 116 58 Z" fill={c.body} {...S} />
        <path d="M58 64 C52 48 68 44 78 58 Z" fill={c.inner} {...Sx} />
        <path d="M142 64 C148 48 132 44 122 58 Z" fill={c.inner} {...Sx} />
      </g>
    ),
  },
  {
    id: 'koala', label: 'Koala',
    render: (c) => (
      <g>
        {/* orejas peludas: base + pelusa alrededor */}
        <circle cx="44" cy="74" r="28" fill={c.body} {...S} />
        <circle cx="156" cy="74" r="28" fill={c.body} {...S} />
        {[-40, -14, 12, 38, 64].map((a, i) => (
          <ellipse key={`l${i}`} cx="44" cy="74" rx="30" ry="5" fill={c.inner} opacity="0.55" transform={`rotate(${a} 44 74)`} />
        ))}
        {[-40, -14, 12, 38, 64].map((a, i) => (
          <ellipse key={`r${i}`} cx="156" cy="74" rx="30" ry="5" fill={c.inner} opacity="0.55" transform={`rotate(${-a} 156 74)`} />
        ))}
        <circle cx="44" cy="74" r="15" fill={c.inner} />
        <circle cx="156" cy="74" r="15" fill={c.inner} />
        <circle cx="36" cy="66" r="5.5" fill={LT} />
        <circle cx="148" cy="66" r="5.5" fill={LT} />
      </g>
    ),
  },
  {
    id: 'panda', label: 'Pandita',
    render: (c) => (
      <g>
        <circle cx="52" cy="58" r="21" fill={INK} {...Sm} />
        <circle cx="148" cy="58" r="21" fill={INK} {...Sm} />
        <circle cx="52" cy="59" r="10" fill="rgba(255,255,255,0.22)" />
        <circle cx="148" cy="59" r="10" fill="rgba(255,255,255,0.22)" />
        <circle cx="45" cy="50" r="5" fill="rgba(255,255,255,0.4)" />
        <circle cx="141" cy="50" r="5" fill="rgba(255,255,255,0.4)" />
      </g>
    ),
  },
  {
    id: 'alas', label: 'Alitas',
    render: (c) => (
      <g>
        <path d="M46 92 C16 74 12 106 28 122 C40 134 56 124 56 108 Z" fill={c.inner} {...Sm} />
        <path d="M154 92 C184 74 188 106 172 122 C160 134 144 124 144 108 Z" fill={c.inner} {...Sm} />
        <path d="M44 100 C28 92 24 112 34 120" fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M156 100 C172 92 176 112 166 120" fill="none" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M40 108 C30 104 28 116 34 120" fill="none" stroke={SH} strokeWidth="2" strokeLinecap="round" />
        <path d="M160 108 C170 104 172 116 166 120" fill="none" stroke={SH} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'murcielago', label: 'Murciélago',
    render: (c) => (
      <g>
        {/* oreja izquierda: membrana con nervaduras, como un ala */}
        <path d="M62 90 C46 70 40 44 48 22 C64 40 78 58 84 82 Z" fill={c.body} {...S} />
        <path d="M65 82 C54 66 50 48 54 34 C64 48 74 62 78 78 Z" fill={c.inner} opacity="0.9" />
        <path d="M60 78 C54 62 52 48 55 38 M66 80 C62 66 61 54 62 46" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M52 40 C50 52 54 66 60 76" fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
        {/* oreja derecha (espejo) */}
        <path d="M138 90 C154 70 160 44 152 22 C136 40 122 58 116 82 Z" fill={c.body} {...S} />
        <path d="M135 82 C146 66 150 48 146 34 C136 48 126 62 122 78 Z" fill={c.inner} opacity="0.9" />
        <path d="M140 78 C146 62 148 48 145 38 M134 80 C138 66 139 54 138 46" fill="none" stroke={SH2} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M148 40 C150 52 146 66 140 76" fill="none" stroke={LT} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'lobo', label: 'Lobito',
    render: (c) => (
      <g>
        <path d="M54 90 C44 60 50 32 68 24 C80 44 84 68 82 88 Z" fill={c.body} {...S} />
        <path d="M146 90 C156 60 150 32 132 24 C120 44 116 68 118 88 Z" fill={c.body} {...S} />
        <path d="M61 82 C55 60 59 40 69 34 C77 50 79 68 77 82 Z" fill={c.inner} {...Sx} />
        <path d="M139 82 C145 60 141 40 131 34 C123 50 121 68 123 82 Z" fill={c.inner} {...Sx} />
        {/* mechones de pelo en el borde */}
        <path d="M56 76 l-7 4 M53 62 l-8 2 M55 48 l-8 -1" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M144 76 l7 4 M147 62 l8 2 M145 48 l8 -1" stroke={SH2} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M66 34 C60 50 58 66 60 80" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M134 34 C140 50 142 66 140 80" fill="none" stroke={LT} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'dragon', label: 'Dragoncito',
    render: (c) => (
      <g>
        {/* aleta con púas */}
        <path d="M58 92 L40 76 L54 74 L42 54 L58 58 L54 34 L72 56 L82 84 Z" fill={c.body} {...S} />
        <path d="M142 92 L160 76 L146 74 L158 54 L142 58 L146 34 L128 56 L118 84 Z" fill={c.body} {...S} />
        <path d="M62 86 L52 76 L62 76 L56 62 L64 64 L62 48 L72 62 Z" fill={c.inner} opacity="0.85" />
        <path d="M138 86 L148 76 L138 76 L144 62 L136 64 L138 48 L128 62 Z" fill={c.inner} opacity="0.85" />
        {/* cuernitos por delante de la aleta */}
        <path d="M78 52 C70 34 78 26 86 40 C88 46 85 50 82 52 Z" fill={c.accent} {...Sx} />
        <path d="M122 52 C130 34 122 26 114 40 C112 46 115 50 118 52 Z" fill={c.accent} {...Sx} />
        <path d="M80 46 C77 38 80 34 83 40" fill="none" stroke={SH2} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M120 46 C123 38 120 34 117 40" fill="none" stroke={SH2} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    ),
  },
];

// ── OJOS ─────────────────────────────────────────────────────────
// Ojos grandes y brillantes: iris, pupila, 2 brillos y pestañas.
const EYE_DX = 21;

function GlossyEye({ x, y, rx, ry, iris }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={INK} />
      {iris && <ellipse cx={x} cy={y + ry * 0.16} rx={rx * 0.66} ry={ry * 0.66} fill={iris} opacity="0.9" />}
      <ellipse cx={x + rx * 0.34} cy={y - ry * 0.4} rx={rx * 0.34} ry={ry * 0.3} fill="#fff" />
      <ellipse cx={x - rx * 0.36} cy={y + ry * 0.36} rx={rx * 0.2} ry={ry * 0.18} fill="#fff" opacity="0.75" />
    </g>
  );
}

export const EYES = [
  {
    id: 'redondos', label: 'Redonditos',
    render: (cx, cy, mood, c) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      if (mood === 'feliz') return (
        <g>
          <path d={`M${L - 11} ${cy + 2} Q${L} ${cy - 14} ${L + 11} ${cy + 2}`} fill="none" {...S} />
          <path d={`M${R - 11} ${cy + 2} Q${R} ${cy - 14} ${R + 11} ${cy + 2}`} fill="none" {...S} />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <GlossyEye x={L} y={cy + 3} rx={8.5} ry={9} iris={c && c.eye} />
          <GlossyEye x={R} y={cy + 3} rx={8.5} ry={9} iris={c && c.eye} />
          <path d={`M${L - 13} ${cy - 13} L${L + 10} ${cy - 5}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d={`M${R + 13} ${cy - 13} L${R - 10} ${cy - 5}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          <GlossyEye x={L} y={cy} rx={9.5} ry={11} iris={c && c.eye} />
          <GlossyEye x={R} y={cy} rx={9.5} ry={11} iris={c && c.eye} />
        </g>
      );
    },
  },
  {
    id: 'grandes', label: 'Ojotes',
    render: (cx, cy, mood, c) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      if (mood === 'feliz') return (
        <g>
          <path d={`M${L - 13} ${cy + 3} Q${L} ${cy - 17} ${L + 13} ${cy + 3}`} fill="none" {...S} />
          <path d={`M${R - 13} ${cy + 3} Q${R} ${cy - 17} ${R + 13} ${cy + 3}`} fill="none" {...S} />
          <path d={`M${L - 15} ${cy - 6} l-5 -4 M${R + 15} ${cy - 6} l5 -4`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <GlossyEye x={L} y={cy + 3} rx={11} ry={12} iris={c && c.eye} />
          <GlossyEye x={R} y={cy + 3} rx={11} ry={12} iris={c && c.eye} />
          <path d={`M${L - 15} ${cy - 14} L${L + 11} ${cy - 6}`} stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 14} L${R - 11} ${cy - 6}`} stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          <GlossyEye x={L} y={cy} rx={13} ry={15} iris={c && c.eye} />
          <GlossyEye x={R} y={cy} rx={13} ry={15} iris={c && c.eye} />
          {/* pestañitas */}
          <path d={`M${L - 13} ${cy - 10} l-5 -4 M${R + 13} ${cy - 10} l5 -4`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: 'somnolientos', label: 'Soñolientos',
    render: (cx, cy, mood) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      if (mood === 'feliz') return (
        <g>
          <path d={`M${L - 11} ${cy + 1} Q${L} ${cy - 11} ${L + 11} ${cy + 1}`} fill="none" {...S} />
          <path d={`M${R - 11} ${cy + 1} Q${R} ${cy - 11} ${R + 11} ${cy + 1}`} fill="none" {...S} />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <path d={`M${L - 12} ${cy - 4} Q${L} ${cy + 5} ${L + 12} ${cy - 6}`} fill="none" {...S} />
          <path d={`M${R - 12} ${cy - 6} Q${R} ${cy + 5} ${R + 12} ${cy - 4}`} fill="none" {...S} />
        </g>
      );
      return (
        <g>
          <path d={`M${L - 12} ${cy - 2} Q${L} ${cy + 7} ${L + 12} ${cy - 2}`} fill="none" {...S} />
          <path d={`M${R - 12} ${cy - 2} Q${R} ${cy + 7} ${R + 12} ${cy - 2}`} fill="none" {...S} />
          <path d={`M${L - 6} ${cy + 6} l0 4 M${R + 6} ${cy + 6} l0 4`} stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    },
  },
  {
    id: 'estrella', label: 'Estrellitas',
    render: (cx, cy, mood, c) => {
      const col = (c && c.eye) || INK;
      const star = (x, y, s) => (
        <g>
          <path
            d={`M${x} ${y - 11 * s} c1.3 5.2 3 6.9 8.2 8.2 c-5.2 1.3 -6.9 3 -8.2 8.2 c-1.3 -5.2 -3 -6.9 -8.2 -8.2 c5.2 -1.3 6.9 -3 8.2 -8.2 Z`}
            fill={INK}
          />
          <path
            d={`M${x} ${y - 6 * s} c0.7 2.8 1.6 3.7 4.4 4.4 c-2.8 0.7 -3.7 1.6 -4.4 4.4 c-0.7 -2.8 -1.6 -3.7 -4.4 -4.4 c2.8 -0.7 3.7 -1.6 4.4 -4.4 Z`}
            fill={col === INK ? '#fff' : col} opacity="0.9"
          />
        </g>
      );
      const L = cx - EYE_DX, R = cx + EYE_DX;
      if (mood === 'enojado') return (
        <g>
          {star(L, cy + 3, 0.85)}
          {star(R, cy + 3, 0.85)}
          <path d={`M${L - 15} ${cy - 14} L${L + 11} ${cy - 6}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 14} L${R - 11} ${cy - 6}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
      const s = mood === 'feliz' ? 1.15 : 1;
      return <g>{star(L, cy, s)}{star(R, cy, s)}</g>;
    },
  },
  {
    id: 'corazon', label: 'Corazoncitos',
    render: (cx, cy, mood, c) => {
      const col = (c && c.eye) || '#D8697F';
      const heart = (x, y, s) => (
        <g>
          <path d={`M${x} ${y + 9 * s} C${x - 12 * s} ${y} ${x - 10 * s} ${y - 10 * s} ${x} ${y - 4 * s} C${x + 10 * s} ${y - 10 * s} ${x + 12 * s} ${y} ${x} ${y + 9 * s} Z`} fill={col} {...Sx} />
          <ellipse cx={x - 4 * s} cy={y - 2 * s} rx={2.6 * s} ry={2 * s} fill="#fff" opacity="0.85" transform={`rotate(-20 ${x - 4 * s} ${y - 2 * s})`} />
        </g>
      );
      const L = cx - EYE_DX, R = cx + EYE_DX;
      if (mood === 'enojado') return (
        <g>
          {heart(L, cy + 3, 0.85)}{heart(R, cy + 3, 0.85)}
          <path d={`M${L - 15} ${cy - 14} L${L + 11} ${cy - 6}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 14} L${R - 11} ${cy - 6}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
      const s = mood === 'feliz' ? 1.15 : 1;
      return <g>{heart(L, cy, s)}{heart(R, cy, s)}</g>;
    },
  },
  {
    id: 'puntitos', label: 'Puntitos',
    render: (cx, cy, mood) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      if (mood === 'feliz') return (
        <g>
          <path d={`M${L - 9} ${cy + 1} Q${L} ${cy - 10} ${L + 9} ${cy + 1}`} fill="none" {...Sm} />
          <path d={`M${R - 9} ${cy + 1} Q${R} ${cy - 10} ${R + 9} ${cy + 1}`} fill="none" {...Sm} />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <ellipse cx={L} cy={cy + 2} rx="6" ry="6.5" fill={INK} />
          <ellipse cx={R} cy={cy + 2} rx="6" ry="6.5" fill={INK} />
          <path d={`M${L - 12} ${cy - 11} L${L + 8} ${cy - 5}`} stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
          <path d={`M${R + 12} ${cy - 11} L${R - 8} ${cy - 5}`} stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          <circle cx={L} cy={cy} r="6.5" fill={INK} />
          <circle cx={R} cy={cy} r="6.5" fill={INK} />
          <circle cx={L + 2.4} cy={cy - 2.4} r="2" fill="#fff" />
          <circle cx={R + 2.4} cy={cy - 2.4} r="2" fill="#fff" />
        </g>
      );
    },
  },
  {
    // Delineado con rabillo — la base del look gótico / rockero / aesthetic.
    id: 'delineados', label: 'Delineados',
    render: (cx, cy, mood, c) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      // dir = hacia afuera de la cara (izq: -1, der: +1)
      const liner = (x, dir, y) => (
        <path
          d={`M${x - 13 * dir} ${y - 1} Q${x} ${y - 15} ${x + 12 * dir} ${y - 7} L${x + 21 * dir} ${y - 15}`}
          fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"
        />
      );
      const lowLash = (x, dir, y) => (
        <path d={`M${x + 8 * dir} ${y + 9} l${3 * dir} 4`} stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      );
      if (mood === 'feliz') return (
        <g>
          <path d={`M${L - 11} ${cy + 2} Q${L} ${cy - 13} ${L + 11} ${cy + 2}`} fill="none" {...S} />
          <path d={`M${R - 11} ${cy + 2} Q${R} ${cy - 13} ${R + 11} ${cy + 2}`} fill="none" {...S} />
          {liner(L, -1, cy + 2)}
          {liner(R, 1, cy + 2)}
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <GlossyEye x={L} y={cy + 4} rx={9} ry={9} iris={c && c.eye} />
          <GlossyEye x={R} y={cy + 4} rx={9} ry={9} iris={c && c.eye} />
          {liner(L, -1, cy + 3)}
          {liner(R, 1, cy + 3)}
          <path d={`M${L - 15} ${cy - 15} L${L + 11} ${cy - 8}`} stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 15} L${R - 11} ${cy - 8}`} stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          <GlossyEye x={L} y={cy + 1} rx={10.5} ry={12} iris={c && c.eye} />
          <GlossyEye x={R} y={cy + 1} rx={10.5} ry={12} iris={c && c.eye} />
          {liner(L, -1, cy)}
          {liner(R, 1, cy)}
          {lowLash(L, -1, cy)}
          {lowLash(R, 1, cy)}
        </g>
      );
    },
  },
  {
    // Mirada de "me da igual" — párpado caído. Rockero / metalero / cool.
    id: 'rebelde', label: 'Rebeldes',
    render: (cx, cy, mood, c) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      const iris = (c && c.eye) || '#8FC7EE';
      const half = (x, y, r) => (
        <g>
          {/* solo la mitad de abajo del ojo asoma bajo el párpado */}
          <path d={`M${x - r} ${y} a${r} ${r * 1.05} 0 0 0 ${r * 2} 0 Z`} fill={INK} />
          <ellipse cx={x} cy={y + r * 0.42} rx={r * 0.58} ry={r * 0.46} fill={iris} opacity="0.92" />
          <ellipse cx={x + r * 0.34} cy={y + r * 0.24} rx={r * 0.22} ry={r * 0.16} fill="#fff" />
          {/* párpado grueso */}
          <path d={`M${x - r - 1.5} ${y} h${r * 2 + 3}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
      if (mood === 'feliz') return (
        <g>
          {half(L, cy - 1, 11)}
          {half(R, cy - 1, 11)}
          <path d={`M${L - 13} ${cy - 12} q13 -5 26 -1`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${R + 13} ${cy - 12} q-13 -5 -26 -1`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          {half(L, cy + 2, 9.5)}
          {half(R, cy + 2, 9.5)}
          <path d={`M${L - 15} ${cy - 13} L${L + 11} ${cy - 5}`} stroke={INK} strokeWidth="4.4" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 13} L${R - 11} ${cy - 5}`} stroke={INK} strokeWidth="4.4" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          {half(L, cy, 11)}
          {half(R, cy, 11)}
          <path d={`M${L - 13} ${cy - 13} q13 3 26 -2`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${R + 13} ${cy - 13} q-13 3 -26 -2`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    // Pestañas largas y dramáticas — princesa, glam, extravagante.
    id: 'pestanudos', label: 'Pestañudos',
    render: (cx, cy, mood, c) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      const lashes = (x, dir, y) => (
        <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none">
          <path d={`M${x + 11 * dir} ${y - 9} l${7 * dir} -7`} />
          <path d={`M${x + 14 * dir} ${y - 3} l${8 * dir} -4`} />
          <path d={`M${x + 14 * dir} ${y + 3} l${8 * dir} 1`} />
        </g>
      );
      if (mood === 'feliz') return (
        <g>
          <path d={`M${L - 13} ${cy + 3} Q${L} ${cy - 17} ${L + 13} ${cy + 3}`} fill="none" {...S} />
          <path d={`M${R - 13} ${cy + 3} Q${R} ${cy - 17} ${R + 13} ${cy + 3}`} fill="none" {...S} />
          {lashes(L, -1, cy)}{lashes(R, 1, cy)}
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <GlossyEye x={L} y={cy + 3} rx={11} ry={12} iris={c && c.eye} />
          <GlossyEye x={R} y={cy + 3} rx={11} ry={12} iris={c && c.eye} />
          {lashes(L, -1, cy + 2)}{lashes(R, 1, cy + 2)}
          <path d={`M${L - 15} ${cy - 15} L${L + 11} ${cy - 7}`} stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 15} L${R - 11} ${cy - 7}`} stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          <GlossyEye x={L} y={cy} rx={12.5} ry={14.5} iris={c && c.eye} />
          <GlossyEye x={R} y={cy} rx={12.5} ry={14.5} iris={c && c.eye} />
          {lashes(L, -1, cy)}{lashes(R, 1, cy)}
        </g>
      );
    },
  },
  {
    // Clásico de caricatura punk / metalera: los ojitos en equis.
    id: 'cruzados', label: 'Equis',
    render: (cx, cy, mood) => {
      const L = cx - EYE_DX, R = cx + EYE_DX;
      const s = mood === 'feliz' ? 10.5 : mood === 'enojado' ? 8.5 : 9.5;
      const x_ = (x, y) => (
        <g stroke={INK} strokeWidth="4.2" strokeLinecap="round">
          <path d={`M${x - s} ${y - s} L${x + s} ${y + s}`} />
          <path d={`M${x + s} ${y - s} L${x - s} ${y + s}`} />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          {x_(L, cy + 3)}{x_(R, cy + 3)}
          <path d={`M${L - 15} ${cy - 14} L${L + 11} ${cy - 7}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d={`M${R + 15} ${cy - 14} L${R - 11} ${cy - 7}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
      return <g>{x_(L, cy)}{x_(R, cy)}</g>;
    },
  },
];

// ── BOCAS (con hocico opcional, lengua y volumen) ────────────────
export const MOUTHS = [
  {
    id: 'sonrisa', label: 'Sonrisa suave',
    render: (cx, cy, mood) => {
      if (mood === 'feliz') return (
        <g>
          <path d={`M${cx - 15} ${cy - 2} Q${cx} ${cy + 17} ${cx + 15} ${cy - 2} Z`} fill="#7A2E3F" {...Sx} />
          <path d={`M${cx - 7} ${cy + 8} Q${cx} ${cy + 16} ${cx + 7} ${cy + 8} Z`} fill="#F58AA0" />
        </g>
      );
      if (mood === 'enojado') return (
        <path d={`M${cx - 13} ${cy + 7} Q${cx - 6.5} ${cy - 2} ${cx} ${cy + 4} Q${cx + 6.5} ${cy - 2} ${cx + 13} ${cy + 7}`} fill="none" {...Sm} />
      );
      return <path d={`M${cx - 11} ${cy - 1} Q${cx} ${cy + 9} ${cx + 11} ${cy - 1}`} fill="none" {...Sm} />;
    },
  },
  {
    id: 'w', label: 'Boquita w',
    render: (cx, cy, mood) => {
      const d = mood === 'feliz' ? 12 : mood === 'enojado' ? 5 : 8.5;
      return (
        <g>
          <path d={`M${cx - 15} ${cy - 1} Q${cx - 7.5} ${cy + d} ${cx} ${cy - 1} Q${cx + 7.5} ${cy + d} ${cx + 15} ${cy - 1}`} fill="none" {...Sm} />
          {mood === 'feliz' && <ellipse cx={cx} cy={cy + 7} rx="4.5" ry="3.4" fill="#F58AA0" opacity="0.9" />}
        </g>
      );
    },
  },
  {
    id: 'hocico', label: 'Hociquito',
    render: (cx, cy, mood) => (
      <g>
        {/* almohadilla del hocico */}
        <ellipse cx={cx} cy={cy + 2} rx="20" ry="14" fill="rgba(255,255,255,0.55)" />
        {/* naricita */}
        <path d={`M${cx - 7} ${cy - 8} Q${cx} ${cy - 12} ${cx + 7} ${cy - 8} Q${cx} ${cy + 1} ${cx - 7} ${cy - 8} Z`} fill={INK} />
        <ellipse cx={cx - 2.5} cy={cy - 9} rx="2" ry="1.4" fill="#fff" opacity="0.7" />
        {/* boca en Y */}
        <path d={`M${cx} ${cy - 1} v5`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        {mood === 'feliz' ? (
          <g>
            <path d={`M${cx} ${cy + 4} Q${cx - 9} ${cy + 14} ${cx - 13} ${cy + 3}`} fill="none" {...Sx} />
            <path d={`M${cx} ${cy + 4} Q${cx + 9} ${cy + 14} ${cx + 13} ${cy + 3}`} fill="none" {...Sx} />
            <path d={`M${cx - 5} ${cy + 9} Q${cx} ${cy + 16} ${cx + 5} ${cy + 9} Z`} fill="#F58AA0" />
          </g>
        ) : mood === 'enojado' ? (
          <g>
            <path d={`M${cx} ${cy + 4} Q${cx - 7} ${cy - 1} ${cx - 12} ${cy + 4}`} fill="none" {...Sx} />
            <path d={`M${cx} ${cy + 4} Q${cx + 7} ${cy - 1} ${cx + 12} ${cy + 4}`} fill="none" {...Sx} />
          </g>
        ) : (
          <g>
            <path d={`M${cx} ${cy + 4} Q${cx - 6} ${cy + 10} ${cx - 11} ${cy + 3}`} fill="none" {...Sx} />
            <path d={`M${cx} ${cy + 4} Q${cx + 6} ${cy + 10} ${cx + 11} ${cy + 3}`} fill="none" {...Sx} />
          </g>
        )}
      </g>
    ),
  },
  {
    id: 'pico', label: 'Piquito',
    render: (cx, cy, mood) => {
      if (mood === 'feliz') return (
        <g>
          <path d={`M${cx - 11} ${cy - 3} L${cx + 11} ${cy - 3} L${cx} ${cy + 5} Z`} fill="#F2B441" {...Sx} />
          <path d={`M${cx - 9} ${cy + 1} L${cx + 9} ${cy + 1} L${cx} ${cy + 11} Z`} fill="#E09B2D" {...Sx} />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <path d={`M${cx - 10} ${cy + 3} L${cx} ${cy - 5} L${cx + 10} ${cy + 3} Z`} fill="#F2B441" {...Sx} />
        </g>
      );
      return (
        <g>
          <path d={`M${cx - 9} ${cy - 3} L${cx + 9} ${cy - 3} L${cx} ${cy + 7} Z`} fill="#F2B441" {...Sx} />
          <path d={`M${cx - 5} ${cy - 3} L${cx + 5} ${cy - 3}`} stroke={SH2} strokeWidth="1.8" />
        </g>
      );
    },
  },
  {
    id: 'colmillos', label: 'Colmillitos',
    render: (cx, cy, mood) => {
      const base = mood === 'feliz'
        ? `M${cx - 15} ${cy - 2} Q${cx} ${cy + 15} ${cx + 15} ${cy - 2}`
        : mood === 'enojado'
        ? `M${cx - 13} ${cy + 6} Q${cx} ${cy - 3} ${cx + 13} ${cy + 6}`
        : `M${cx - 11} ${cy - 1} Q${cx} ${cy + 8} ${cx + 11} ${cy - 1}`;
      const ty = mood === 'enojado' ? cy + 2 : cy;
      return (
        <g>
          {mood === 'feliz' && <path d={`M${cx - 15} ${cy - 2} Q${cx} ${cy + 15} ${cx + 15} ${cy - 2} Z`} fill="#7A2E3F" />}
          <path d={base} fill="none" {...Sm} />
          <path d={`M${cx - 7} ${ty} l1.5 7 l3 -6`} fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d={`M${cx + 7} ${ty} l-1.5 7 l-3 -6`} fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      );
    },
  },
  {
    id: 'lengua', label: 'Lengüita',
    render: (cx, cy, mood) => (
      <g>
        <path
          d={mood === 'enojado'
            ? `M${cx - 12} ${cy + 5} Q${cx} ${cy - 3} ${cx + 12} ${cy + 5}`
            : `M${cx - 13} ${cy - 2} Q${cx} ${cy + 11} ${cx + 13} ${cy - 2}`}
          fill="none" {...Sm}
        />
        <path d={`M${cx - 6} ${cy + (mood === 'enojado' ? 4 : 6)} q6 14 12 0 z`} fill="#F58AA0" {...Sx} />
        <path d={`M${cx} ${cy + (mood === 'enojado' ? 6 : 8)} v5`} stroke="#C9566F" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    ),
  },
  {
    // Media sonrisa de "sé algo que tú no" — rockera, gótica, canchera.
    id: 'ladeada', label: 'Media sonrisa',
    render: (cx, cy, mood) => {
      if (mood === 'feliz') return (
        <g>
          <path d={`M${cx - 14} ${cy + 3} Q${cx - 2} ${cy + 13} ${cx + 14} ${cy - 7}`} fill="none" {...Sm} />
          <path d={`M${cx + 6} ${cy - 1} l1.5 6 l3 -5`} fill="#fff" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <path d={`M${cx + 13} ${cy - 8} l4 -3`} stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
      if (mood === 'enojado') return (
        <path d={`M${cx - 14} ${cy - 4} Q${cx - 1} ${cy + 9} ${cx + 13} ${cy + 6}`} fill="none" {...Sm} />
      );
      return (
        <g>
          <path d={`M${cx - 12} ${cy + 2} Q${cx - 2} ${cy + 8} ${cx + 12} ${cy - 4}`} fill="none" {...Sm} />
          <path d={`M${cx + 11} ${cy - 5} l3 -3`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    // Labios pintados — princesa, glam, extravagante. Toman el color
    // de accesorio, con un rojo de respaldo si el acento es muy claro.
    id: 'labios', label: 'Labios',
    render: (cx, cy, mood, c) => {
      const raw = (c && c.accent) || '#B0453F';
      const lip = isPale(raw) ? '#B0453F' : raw;
      const dark = darken(lip, 0.3);
      if (mood === 'feliz') return (
        <g>
          <path d={`M${cx - 16} ${cy - 2} Q${cx - 8} ${cy - 9} ${cx - 2} ${cy - 4} Q${cx} ${cy - 7} ${cx + 2} ${cy - 4} Q${cx + 8} ${cy - 9} ${cx + 16} ${cy - 2} Q${cx} ${cy + 16} ${cx - 16} ${cy - 2} Z`} fill={lip} {...Sx} />
          <path d={`M${cx - 12} ${cy - 1} Q${cx} ${cy + 3} ${cx + 12} ${cy - 1} Q${cx} ${cy + 1} ${cx - 12} ${cy - 1} Z`} fill="#fff" opacity="0.9" />
          <ellipse cx={cx - 5} cy={cy + 6} rx="4.5" ry="2.6" fill="#fff" opacity="0.45" transform={`rotate(-14 ${cx - 5} ${cy + 6})`} />
        </g>
      );
      if (mood === 'enojado') return (
        <g>
          <path d={`M${cx - 13} ${cy + 3} Q${cx - 6} ${cy - 4} ${cx} ${cy} Q${cx + 6} ${cy - 4} ${cx + 13} ${cy + 3} Q${cx} ${cy + 8} ${cx - 13} ${cy + 3} Z`} fill={lip} {...Sx} />
          <path d={`M${cx - 9} ${cy + 3} Q${cx} ${cy + 5} ${cx + 9} ${cy + 3}`} fill="none" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
      return (
        <g>
          <path d={`M${cx - 14} ${cy - 1} Q${cx - 7} ${cy - 8} ${cx - 2} ${cy - 3} Q${cx} ${cy - 6} ${cx + 2} ${cy - 3} Q${cx + 7} ${cy - 8} ${cx + 14} ${cy - 1} Q${cx} ${cy + 11} ${cx - 14} ${cy - 1} Z`} fill={lip} {...Sx} />
          <path d={`M${cx - 14} ${cy - 1} Q${cx} ${cy + 2} ${cx + 14} ${cy - 1}`} fill="none" stroke={dark} strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx={cx - 5} cy={cy + 4} rx="4.5" ry="2.4" fill="#fff" opacity="0.5" transform={`rotate(-14 ${cx - 5} ${cy + 4})`} />
        </g>
      );
    },
  },
  {
    // Boca abierta de grito — metalero, punk, extravagante.
    id: 'grito', label: 'Gritito',
    render: (cx, cy, mood) => {
      const h = mood === 'enojado' ? 17 : mood === 'feliz' ? 14 : 11;
      const w = mood === 'enojado' ? 14 : mood === 'feliz' ? 15 : 11;
      return (
        <g>
          <path d={`M${cx - w} ${cy - h * 0.45} Q${cx} ${cy - h * 0.95} ${cx + w} ${cy - h * 0.45} Q${cx + w * 0.8} ${cy + h} ${cx} ${cy + h} Q${cx - w * 0.8} ${cy + h} ${cx - w} ${cy - h * 0.45} Z`} fill="#5E1120" {...Sx} />
          {/* dientes de arriba */}
          <path d={`M${cx - w * 0.8} ${cy - h * 0.42} Q${cx} ${cy - h * 0.8} ${cx + w * 0.8} ${cy - h * 0.42} L${cx + w * 0.7} ${cy - h * 0.14} Q${cx} ${cy - h * 0.5} ${cx - w * 0.7} ${cy - h * 0.14} Z`} fill="#fff" opacity="0.95" />
          {/* lengua */}
          <path d={`M${cx - w * 0.5} ${cy + h * 0.15} Q${cx} ${cy + h * 1.05} ${cx + w * 0.5} ${cy + h * 0.15} Z`} fill="#F58AA0" />
          <path d={`M${cx} ${cy + h * 0.4} v${h * 0.4}`} stroke="#C9566F" strokeWidth="1.6" strokeLinecap="round" />
          {mood === 'enojado' && (
            <g stroke={INK} strokeWidth="3.4" strokeLinecap="round">
              <path d={`M${cx - w - 6} ${cy - h} l-5 -4`} /><path d={`M${cx + w + 6} ${cy - h} l5 -4`} />
            </g>
          )}
        </g>
      );
    },
  },
];

// ── CACHETES ─────────────────────────────────────────────────────
export const CHEEK_STYLES = [
  { id: 'ninguno', label: 'Sin cachetes' },
  { id: 'redondos', label: 'Redonditos' },
  { id: 'alargados', label: 'Alargados' },
  { id: 'corazon', label: 'Corazoncitos' },
  { id: 'rayitas', label: 'Rayitas' },
  { id: 'brillos', label: 'Con brillitos' },
  { id: 'sombras', label: 'Sombreados' },
];

export function renderCheeks(style, cx, cy, spread, color) {
  if (style === 'ninguno' || !style) return null;
  const lx = cx - spread, rx = cx + spread;
  if (style === 'corazon') {
    const heart = (x, y) => (
      <g>
        <path d={`M${x} ${y + 7} C${x - 8} ${y + 1} ${x - 7} ${y - 6} ${x} ${y - 2} C${x + 7} ${y - 6} ${x + 8} ${y + 1} ${x} ${y + 7} Z`} fill={color} opacity="0.8" />
      </g>
    );
    return <g>{heart(lx, cy)}{heart(rx, cy)}</g>;
  }
  if (style === 'rayitas') {
    const lines = (x, dir) => (
      <g stroke={color} strokeWidth="2.6" strokeLinecap="round" opacity="0.8">
        <path d={`M${x - 7 * dir} ${cy - 5} l${10 * dir} 3`} />
        <path d={`M${x - 7 * dir} ${cy + 1} l${10 * dir} 3`} />
        <path d={`M${x - 7 * dir} ${cy + 7} l${10 * dir} 3`} />
      </g>
    );
    return <g>{lines(lx, 1)}{lines(rx, -1)}</g>;
  }
  if (style === 'brillos') {
    // Rubor con destellitos — el "highlighter" del look aesthetic.
    const sparkle = (x, y, s) => (
      <path
        d={`M${x} ${y - 5 * s} c0.6 2.4 1.4 3.2 3.8 3.8 c-2.4 0.6 -3.2 1.4 -3.8 3.8 c-0.6 -2.4 -1.4 -3.2 -3.8 -3.8 c2.4 -0.6 3.2 -1.4 3.8 -3.8 Z`}
        fill="#fff" opacity="0.95"
      />
    );
    return (
      <g>
        <ellipse cx={lx} cy={cy} rx="12" ry="8" fill={color} opacity="0.65" />
        <ellipse cx={rx} cy={cy} rx="12" ry="8" fill={color} opacity="0.65" />
        {sparkle(lx - 5, cy - 3, 1)}{sparkle(lx + 5, cy + 3, 0.7)}
        {sparkle(rx + 5, cy - 3, 1)}{sparkle(rx - 5, cy + 3, 0.7)}
      </g>
    );
  }
  if (style === 'sombras') {
    // Pómulo marcado y ojeritas — el aire gótico / dark.
    return (
      <g>
        <ellipse cx={lx} cy={cy} rx="13" ry="7" fill={color} opacity="0.34" transform={`rotate(-14 ${lx} ${cy})`} />
        <ellipse cx={rx} cy={cy} rx="13" ry="7" fill={color} opacity="0.34" transform={`rotate(14 ${rx} ${cy})`} />
        <path d={`M${lx - 9} ${cy - 6} q9 5 17 1`} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
        <path d={`M${rx + 9} ${cy - 6} q-9 5 -17 1`} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
      </g>
    );
  }
  if (style === 'alargados') {
    return (
      <g opacity="0.72">
        <ellipse cx={lx} cy={cy} rx="14" ry="6.5" fill={color} />
        <ellipse cx={rx} cy={cy} rx="14" ry="6.5" fill={color} />
        <ellipse cx={lx - 3} cy={cy - 1.5} rx="6" ry="2.4" fill="#fff" opacity="0.35" />
        <ellipse cx={rx - 3} cy={cy - 1.5} rx="6" ry="2.4" fill="#fff" opacity="0.35" />
      </g>
    );
  }
  return (
    <g opacity="0.78">
      <ellipse cx={lx} cy={cy} rx="11" ry="8" fill={color} />
      <ellipse cx={rx} cy={cy} rx="11" ry="8" fill={color} />
      <ellipse cx={lx - 3} cy={cy - 2.5} rx="4" ry="2.6" fill="#fff" opacity="0.4" />
      <ellipse cx={rx - 3} cy={cy - 2.5} rx="4" ry="2.6" fill="#fff" opacity="0.4" />
    </g>
  );
}

export { Paw };
