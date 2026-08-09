import React from 'react';

// ─────────────────────────────────────────────────────────────────
// Catálogo fijo de decoración para la tienda. Todo dibujado por la
// app (SVG genérico, sin personajes ni marcas con derechos de autor)
// — se compra con monedas ganadas en los minijuegos y se coloca en
// el cuarto, junto a los pósters personales.
//
// Cada objeto lleva su propio volumen: base oscurecida, cara
// iluminada, brillo y sombra de apoyo. La primera versión eran
// siluetas planas de un solo color con un contorno, y en el cuarto se
// veían como pegatinas recortadas.
// ─────────────────────────────────────────────────────────────────

const INK = '#4A3439';
const S = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' };
const Sm = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' };
const SH = 'rgba(74,52,57,0.22)';
const SH2 = 'rgba(74,52,57,0.38)';
const LT = 'rgba(255,255,255,0.45)';
const LT2 = 'rgba(255,255,255,0.85)';

// Sombra elíptica de apoyo, común a todo lo que se posa en una superficie.
const Base = ({ cx = 30, cy = 55, rx = 20 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.22} fill={SH} />
);

export const DECOR_CATALOG = [
  {
    id: 'planta', name: 'Planta feliz', price: 60,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={57} rx={16} />
        {/* hojas: cada una con nervadura y un lado en sombra */}
        <path d="M30 42 q-16 -14 -12 -30 q13 6 12 30" fill="#7FA894" {...Sm} />
        <path d="M30 42 q-9 -13 -8 -25" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" fill="none" />
        <path d="M30 42 q16 -11 13 -26 q-14 4 -13 26" fill="#A6D6A0" {...Sm} />
        <path d="M30 42 q9 -10 8 -21" stroke={SH} strokeWidth="1.6" fill="none" />
        <path d="M30 43 q-3 -18 2 -28 q6 12 -2 28" fill="#8CC58F" {...Sm} />
        {/* maceta con cara iluminada y borde */}
        <path d="M17 40 h26 l-3 17 a3 3 0 0 1 -3 2 h-14 a3 3 0 0 1 -3 -2 Z" fill="#B06E45" {...S} />
        <path d="M20 42 h20 l-2.4 14 h-15 Z" fill="#D98E63" />
        <path d="M21 43 l-1.6 12" stroke={LT} strokeWidth="2" />
        <path d="M15 36 h30 a3 3 0 0 1 0 7 h-30 a3 3 0 0 1 0 -7 Z" fill="#C57A50" {...S} />
        <path d="M17 38 h26" stroke={LT} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'libros', name: 'Torre de libros', price: 50,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={52} rx={21} />
        {/* cada libro: lomo, canto de hojas y sombra del de abajo */}
        <g>
          <rect x="10" y="37" width="40" height="11" rx="2" fill="#B8546A" {...S} />
          <rect x="10" y="37" width="40" height="3" rx="1.5" fill={LT} />
          <rect x="44" y="39" width="5" height="7" fill="#FFF6E8" opacity="0.9" />
        </g>
        <g>
          <rect x="13" y="27" width="34" height="10" rx="2" fill="#7FA894" {...S} />
          <rect x="13" y="27" width="34" height="3" rx="1.5" fill={LT} />
          <rect x="41" y="29" width="4.5" height="6" fill="#FFF6E8" opacity="0.9" />
          <rect x="13" y="35" width="34" height="2.5" fill={SH} />
        </g>
        <g>
          <rect x="11" y="17" width="33" height="10" rx="2" fill="#E2A845" {...S} />
          <rect x="11" y="17" width="33" height="3" rx="1.5" fill={LT2} opacity="0.6" />
          <rect x="38" y="19" width="4.5" height="6" fill="#FFF6E8" opacity="0.9" />
          <rect x="11" y="25" width="33" height="2.5" fill={SH} />
        </g>
      </svg>
    ),
  },
  {
    id: 'lampara', name: 'Lámpara cálida', price: 70,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={55} rx={14} />
        {/* halo de luz */}
        <path d="M30 40 l-20 18 h40 Z" fill="#FFE9A8" opacity="0.28" />
        {/* pantalla con degradado por bandas */}
        <path d="M17 20 L43 20 L37 40 L23 40 Z" fill="#F5CF7A" {...S} />
        <path d="M17 20 L43 20 L41 26 L19 26 Z" fill="#FFE9A8" />
        <path d="M23 40 h14 l-1 -4 h-12 Z" fill={SH} />
        <path d="M20 22 L25 38" stroke={LT2} strokeWidth="2" opacity="0.7" />
        {/* pie */}
        <path d="M28.5 40 h3 v12 h-3 Z" fill="#9A8B7E" {...Sm} />
        <path d="M28.5 40 h1.2 v12 h-1.2 Z" fill={LT} />
        <ellipse cx="30" cy="53" rx="11" ry="3.4" fill="#B0A196" {...Sm} />
        <ellipse cx="30" cy="52" rx="11" ry="3.4" fill="#C9BCB1" />
        <ellipse cx="26" cy="51" rx="3.4" ry="1.1" fill={LT2} opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'osito', name: 'Osito de peluche', price: 90,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={54} rx={18} />
        {/* orejas con interior */}
        <circle cx="18" cy="17" r="7" fill="#C9945F" {...Sm} />
        <circle cx="42" cy="17" r="7" fill="#C9945F" {...Sm} />
        <circle cx="18" cy="17.5" r="3.4" fill="#EBBF92" />
        <circle cx="42" cy="17.5" r="3.4" fill="#EBBF92" />
        {/* cuerpo: base en sombra + cara iluminada encima */}
        <circle cx="30" cy="33" r="18" fill="#C9945F" {...S} />
        <circle cx="28.5" cy="31.5" r="16" fill="#E0AC77" />
        <ellipse cx="22" cy="24" rx="6.5" ry="4.5" fill={LT} transform="rotate(-25 22 24)" />
        {/* hocico */}
        <ellipse cx="30" cy="38" rx="9" ry="7" fill="#F3D9BB" />
        <ellipse cx="30" cy="41" rx="7" ry="3.5" fill={SH} opacity="0.4" />
        <path d="M26.5 34.5 q3.5 -2.5 7 0 q-3.5 4 -7 0 Z" fill={INK} />
        <path d="M30 37 v3" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        {/* ojos con brillo */}
        <circle cx="23" cy="29" r="2.8" fill={INK} />
        <circle cx="37" cy="29" r="2.8" fill={INK} />
        <circle cx="24" cy="28" r="1" fill="#fff" />
        <circle cx="38" cy="28" r="1" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'corazon-marco', name: 'Marco con corazón', price: 80,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={54} rx={17} />
        {/* marco con grosor: cara oscura detrás, cara clara delante */}
        <rect x="9" y="9" width="42" height="42" rx="6" fill="#B08A6A" {...S} />
        <rect x="12" y="11" width="38" height="38" rx="5" fill="#D6AE87" />
        <rect x="16" y="15" width="30" height="30" rx="3" fill="#FFF9F0" {...Sm} />
        <path d="M16 15 h30 v4 h-30 Z" fill={SH} opacity="0.35" />
        <path d="M30 40 C19 32 17 24 23 20.5 a6.5 6.5 0 0 1 7 3 a6.5 6.5 0 0 1 7 -3 c6 3.5 4 11.5 -7 19.5 Z" fill="#D8697F" {...Sm} />
        <ellipse cx="25.5" cy="26" rx="2.6" ry="1.8" fill={LT2} transform="rotate(-28 25.5 26)" />
        {/* soporte trasero */}
        <path d="M36 51 l7 6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'cassette', name: 'Casete retro', price: 65,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={48} rx={22} />
        <rect x="7" y="17" width="46" height="28" rx="4" fill="#9B7FCB" {...S} />
        <rect x="9" y="19" width="42" height="24" rx="3" fill="#C7ACEE" />
        <rect x="9" y="19" width="42" height="4" rx="2" fill={LT} />
        {/* ventana de la cinta, hundida */}
        <rect x="14" y="24" width="32" height="13" rx="2" fill="#6E5A92" />
        <rect x="15" y="25" width="30" height="11" rx="1.5" fill="#F2EAE0" />
        <circle cx="22" cy="30.5" r="4.5" fill="#FFFDF6" {...Sm} />
        <circle cx="38" cy="30.5" r="4.5" fill="#FFFDF6" {...Sm} />
        <circle cx="22" cy="30.5" r="1.6" fill={INK} />
        <circle cx="38" cy="30.5" r="1.6" fill={INK} />
        <path d="M26.5 30.5 h7" stroke="#8B7355" strokeWidth="3" />
        {/* etiqueta */}
        <rect x="17" y="39" width="26" height="4.5" rx="1.5" fill="#FFF6E8" {...Sm} />
        <path d="M20 41.2 h12" stroke={SH} strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'tarro-estrellas', name: 'Tarro de estrellas', price: 75,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={30} cy={55} rx={14} />
        {/* resplandor del contenido */}
        <ellipse cx="30" cy="40" rx="13" ry="15" fill="#FFE9A8" opacity="0.35" />
        {/* vidrio: cuerpo + reflejo lateral */}
        <path d="M19 24 h22 v22 a11 11 0 0 1 -22 0 Z" fill="#CFE7F5" opacity="0.75" {...S} />
        <path d="M22 26 v19 a8 8 0 0 0 4 7" stroke={LT2} strokeWidth="2.6" fill="none" opacity="0.85" />
        <path d="M37 27 v18" stroke={SH} strokeWidth="2" fill="none" opacity="0.4" />
        {/* estrellitas dentro */}
        <path d="M27 38 l1.3 2.8 3 .4 -2.2 2 .6 3 -2.7 -1.5 -2.7 1.5 .6 -3 -2.2 -2 3 -.4 Z" fill="#F2B441" />
        <path d="M35 44 l1 2.1 2.3 .3 -1.7 1.5 .4 2.3 -2 -1.1 -2 1.1 .4 -2.3 -1.7 -1.5 2.3 -.3 Z" fill="#FFD166" />
        {/* tapa con grosor */}
        <rect x="17" y="18" width="26" height="7" rx="2.5" fill="#7FB0CC" {...S} />
        <rect x="17" y="18" width="26" height="2.6" rx="1.3" fill={LT2} opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'taza', name: 'Taza humeante', price: 40,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <Base cx={29} cy={51} rx={14} />
        {/* vapor */}
        <path d="M24 22 q4 -5 0 -10 M31 22 q4 -5 0 -10" fill="none" stroke="#C9BCB1" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
        {/* asa por detrás */}
        <path d="M40 32 q9 0 9 7 q0 7 -9 7" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M40 32 q9 0 9 7 q0 7 -9 7" fill="none" stroke="#F0B7C8" strokeWidth="2.2" strokeLinecap="round" />
        {/* taza */}
        <path d="M15 28 h26 v14 a13 9 0 0 1 -26 0 Z" fill="#E8899F" {...S} />
        <path d="M17 30 h22 v12 a11 7.5 0 0 1 -22 0 Z" fill="#FFD3E0" />
        <path d="M19 31 v10 a9 6 0 0 0 3 5" stroke={LT2} strokeWidth="2.2" fill="none" opacity="0.75" />
        {/* café */}
        <ellipse cx="28" cy="28.5" rx="13" ry="4" fill="#6B4A34" {...Sm} />
        <ellipse cx="28" cy="28" rx="11" ry="3" fill="#8B5E3C" />
        <ellipse cx="24" cy="27.5" rx="3" ry="1" fill={LT} />
      </svg>
    ),
  },
];

export function findDecor(id) {
  return DECOR_CATALOG.find((d) => d.id === id) || null;
}
