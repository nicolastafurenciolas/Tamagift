import React from 'react';
import { useStyle } from '../styles/StyleContext';
import { C } from '../theme';
import Sprite from './Sprite';

// ─────────────────────────────────────────────────────────────────
// Íconos dibujados a mano. Reemplazan los emojis de interfaz para
// que la app no se sienta "de plantilla". Trazo redondeado + un
// temblorcito opcional (wobble) para el aire de cuaderno.
// Todos heredan el color con `color` (por defecto currentColor).
// ─────────────────────────────────────────────────────────────────

// En pixel, los íconos se redibujan sobre una rejilla de 2 px (más fina
// que la de 3 px de los sprites, para que algo de 16 px siga legible);
// en neón brillan del color de su trazo. En el resto se dibujan tal cual.
function Svg({ size = 24, color = 'currentColor', stroke = 2, wobble = false, children, style, ...rest }) {
  const { style: active } = useStyle();
  const svg = (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color === 'currentColor' && active.art.kind === 'pixel' ? C.ink : color}
      strokeWidth={active.art.kind === 'pixel' ? Math.max(stroke, 2.4) : stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pg-icon${wobble ? ' pg-wobble' : ''}`}
      aria-hidden="true"
      shapeRendering={active.art.kind === 'pixel' ? 'crispEdges' : undefined}
      style={{ color: color === 'currentColor' ? undefined : color, ...style }}
      {...rest}
    >
      {children}
    </svg>
  );
  // Por debajo de 20 px una rejilla de 2 px deja el ícono ilegible: ahí
  // se dibuja el vector tal cual, con bordes nítidos.
  if (active.art.kind === 'pixel' && size >= 20) {
    return <Sprite art={svg} w={size} h={size} pixel={2} kind="icon" style={style} />;
  }
  return svg;
}

// Tazón con comida (Alimentar)
export function IconBowl(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 11.5 h17 a8.5 8.5 0 0 1 -17 0 Z" fill={props.fill || 'none'} />
      <ellipse cx="12" cy="11.5" rx="8.5" ry="1.9" />
      <path d="M9 8.2 a1.7 1.7 0 1 1 3 -0.4" />
      <path d="M13 8 a1.5 1.5 0 1 1 2.6 -0.2" />
      <path d="M12 5.5 c0 -1 1 -1.3 1 -2.2" />
    </Svg>
  );
}

// Tina con burbujas (Bañar)
export function IconTub(props) {
  return (
    <Svg {...props}>
      <path d="M3 12.5 h18 v1.5 a4 4 0 0 1 -4 4 H7 a4 4 0 0 1 -4 -4 Z" fill={props.fill || 'none'} />
      <path d="M5 12.5 V7.8 a2 2 0 0 1 2 -2 h0.4" />
      <path d="M7.4 5.8 h2.4" />
      <path d="M5 18.5 v1.4 M19 18.5 v1.4" />
      <circle cx="15.5" cy="6" r="1.1" />
      <circle cx="18" cy="8" r="0.8" />
      <circle cx="17.4" cy="4.4" r="0.7" />
    </Svg>
  );
}

// Pelota de juguete (Jugar)
export function IconBall(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M12 3.7 c-3 3.4 -3 9.9 0 16.6" />
      <path d="M12 3.7 c3 3.4 3 9.9 0 16.6" />
      <path d="M4 9.5 c5.2 1.8 10.8 1.8 16 0" />
    </Svg>
  );
}

// Cuadro colgado (Cuarto)
export function IconFrame(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="2.4" />
      <circle cx="9" cy="9.5" r="1.4" />
      <path d="M5.2 17 l4.2 -4.6 3 2.8 2.6 -3 3.8 4.4" />
    </Svg>
  );
}

// Notas musicales (Música)
export function IconMusic(props) {
  return (
    <Svg {...props}>
      <path d="M9 17.2 V6 l9 -2 v9.4" />
      <ellipse cx="6.8" cy="17.4" rx="2.2" ry="1.8" transform="rotate(-16 6.8 17.4)" />
      <ellipse cx="15.8" cy="15.4" rx="2.2" ry="1.8" transform="rotate(-16 15.8 15.4)" />
      <path d="M9 8.4 l9 -2" />
    </Svg>
  );
}

// Corazón (Amor) — relleno si se pasa `fill`
export function IconHeart(props) {
  return (
    <Svg {...props}>
      <path
        d="M12 20.5 C5 15.8 3 12.3 3 8.8 A4.6 4.6 0 0 1 12 7 a4.6 4.6 0 0 1 9 1.8 c0 3.5 -2 7 -9 11.7 Z"
        fill={props.fill || 'none'}
      />
    </Svg>
  );
}

// Galleta con chispas (Hambre)
export function IconCookie(props) {
  return (
    <Svg {...props}>
      <path
        d="M12 3.5 a8.5 8.5 0 1 0 8.5 8.5 a2.3 2.3 0 0 1 -3 -3 a2.3 2.3 0 0 1 -2.6 -2.9 A8.5 8.5 0 0 0 12 3.5 Z"
        fill={props.fill || 'none'}
      />
      <circle cx="9" cy="10" r="0.9" fill={props.color || 'currentColor'} stroke="none" />
      <circle cx="13" cy="14" r="0.9" fill={props.color || 'currentColor'} stroke="none" />
      <circle cx="9.5" cy="15" r="0.8" fill={props.color || 'currentColor'} stroke="none" />
    </Svg>
  );
}

// Sobre / carta (momento de recordar)
export function IconEnvelope(props) {
  return (
    <Svg {...props}>
      <rect x="3.2" y="6" width="17.6" height="12" rx="2.4" fill={props.fill || 'none'} />
      <path d="M3.6 7 l8.4 6 8.4 -6" />
      <path d="M12 13 v0" />
    </Svg>
  );
}

// Flecha atrás
export function IconBack(props) {
  return (
    <Svg {...props}>
      <path d="M14.5 5.5 L8 12 l6.5 6.5" />
    </Svg>
  );
}

// Cerrar
export function IconClose(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 6.5 l11 11 M17.5 6.5 l-11 11" />
    </Svg>
  );
}

// Destello / estrellita
export function IconSparkle(props) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 c0.9 4.4 2.6 6.1 7 7 c-4.4 0.9 -6.1 2.6 -7 7 c-0.9 -4.4 -2.6 -6.1 -7 -7 c4.4 -0.9 6.1 -2.6 7 -7 Z"
        fill={props.fill || 'none'} />
    </Svg>
  );
}

// Huella
export function IconPaw(props) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="15" rx="4" ry="3.3" fill={props.fill || 'none'} />
      <ellipse cx="7" cy="9.5" rx="1.7" ry="2.2" fill={props.fill || 'none'} />
      <ellipse cx="17" cy="9.5" rx="1.7" ry="2.2" fill={props.fill || 'none'} />
      <ellipse cx="10" cy="7" rx="1.5" ry="2" fill={props.fill || 'none'} />
      <ellipse cx="14" cy="7" rx="1.5" ry="2" fill={props.fill || 'none'} />
    </Svg>
  );
}

// Lápiz (dibujar / editar)
export function IconPencil(props) {
  return (
    <Svg {...props}>
      <path d="M15.5 5.5 l3 3 L9 18 l-4 1 1 -4 Z" fill={props.fill || 'none'} />
      <path d="M14 7 l3 3" />
    </Svg>
  );
}

// Regalo
export function IconGift(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="9.5" width="16" height="10.5" rx="2" fill={props.fill || 'none'} />
      <path d="M3 9.5 h18 M12 9.5 V20" />
      <path d="M12 9.5 C10 6 6.5 5 6 7 c-0.4 1.7 3.2 2.5 6 2.5 Z" fill={props.fill || 'none'} />
      <path d="M12 9.5 C14 6 17.5 5 18 7 c0.4 1.7 -3.2 2.5 -6 2.5 Z" fill={props.fill || 'none'} />
    </Svg>
  );
}

// Cámara (subir foto de comida)
export function IconCamera(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 8 h3 l1.4 -2 h6.2 l1.4 2 h3 a1.5 1.5 0 0 1 1.5 1.5 v8 a1.5 1.5 0 0 1 -1.5 1.5 H3.5 A1.5 1.5 0 0 1 2 17.5 v-8 A1.5 1.5 0 0 1 3.5 8 Z" fill={props.fill || 'none'} />
      <circle cx="12" cy="13.5" r="3.3" />
    </Svg>
  );
}

// Moneda (monedas del juego)
export function IconCoin(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.3" fill={props.fill || 'none'} />
      <circle cx="12" cy="12" r="5.4" />
      <path d="M12 9.2 v5.6 M10.4 10 h2.4 a1.3 1.3 0 0 1 0 2.6 h-1.6 a1.3 1.3 0 0 0 0 2.6 h2.4" transform="scale(0.7) translate(5.1 5.1)" />
    </Svg>
  );
}

// Camiseta (ropa / outfits)
export function IconShirt(props) {
  return (
    <Svg {...props}>
      <path d="M8.5 4 L4 6.5 l1.6 3.2 2.2 -1 V20 h8.4 V8.7 l2.2 1 L20 6.5 15.5 4 a3.5 3.5 0 0 1 -7 0 Z" fill={props.fill || 'none'} />
    </Svg>
  );
}

// Bolsa de compras (tienda)
export function IconBag(props) {
  return (
    <Svg {...props}>
      <path d="M6 8 h12 l-1 12 H7 Z" fill={props.fill || 'none'} />
      <path d="M9 8 a3 3 0 0 1 6 0" />
    </Svg>
  );
}

// Puerta / flecha a otro cuarto
export function IconDoor(props) {
  return (
    <Svg {...props}>
      <path d="M6 3.5 h9 a1 1 0 0 1 1 1 V20 H6 Z" fill={props.fill || 'none'} />
      <circle cx="12.6" cy="12" r="0.9" fill={props.color || 'currentColor'} stroke="none" />
      <path d="M4 20 h16" />
    </Svg>
  );
}

// Chevron (navegación entre cuartos)
export function IconChevronRight(props) {
  return (
    <Svg {...props}>
      <path d="M9 5.5 L15.5 12 L9 18.5" />
    </Svg>
  );
}


// ── Íconos de los minijuegos ─────────────────────────────────────
// Cada juego tiene el suyo. Antes reutilizaban íconos sueltos que no
// tenían nada que ver: la batalla naval salía con un bolso de compras.

// Dos cartas, una girada: memoria
export function IconCards(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="9" height="13" rx="2" transform="rotate(-9 7.5 12.5)" />
      <rect x="12" y="5" width="9" height="13" rx="2" transform="rotate(7 16.5 11.5)" />
      <path d="M16 9.5 l1.2 2 2 .3 -1.5 1.4 .4 2.1 -1.9 -1 -1.9 1 .4 -2.1 -1.5 -1.4 2 -.3 Z" />
    </Svg>
  );
}

// Comida cayendo hacia un tazón: atrapar
export function IconCatch(props) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="4.5" r="1.8" />
      <circle cx="15.5" cy="7" r="1.5" />
      <path d="M3.5 14 h17 a8.5 8.5 0 0 1 -17 0 Z" />
      <path d="M2 14 h20" />
    </Svg>
  );
}

// Pieza de rompecabezas
export function IconPuzzle(props) {
  return (
    <Svg {...props}>
      <path d="M4 5.5 h5 a1.8 1.8 0 1 1 3.6 0 h5 v5 a1.8 1.8 0 1 0 0 3.6 v5 h-5 a1.8 1.8 0 1 0 -3.6 0 h-5 v-5 a1.8 1.8 0 1 1 0 -3.6 Z" />
    </Svg>
  );
}

// Topo asomando de su agujero
export function IconMole(props) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="18" rx="9" ry="3.2" />
      <path d="M6.5 18 a5.5 6 0 0 1 11 0" />
      <circle cx="10" cy="13.5" r="0.9" />
      <circle cx="14" cy="13.5" r="0.9" />
      <path d="M11 16 h2" />
    </Svg>
  );
}

// Serpiente enroscada
export function IconSnake(props) {
  return (
    <Svg {...props}>
      <path d="M4 18 h8 a3 3 0 0 0 0 -6 h-4 a3 3 0 0 1 0 -6 h6" />
      <circle cx="18.5" cy="6" r="2.2" />
      <circle cx="19.2" cy="5.4" r="0.5" fill="currentColor" />
    </Svg>
  );
}

// Carretera con líneas: cruzar
export function IconRoad(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 21 L9 3" />
      <path d="M17.5 21 L15 3" />
      <path d="M12 4.5 v3 M12 10.5 v3 M12 16.5 v3" />
    </Svg>
  );
}

// Bloques apilados: torre
export function IconTower(props) {
  return (
    <Svg {...props}>
      <rect x="4.5" y="16" width="15" height="4.5" rx="1" />
      <rect x="6.5" y="11" width="11" height="4.5" rx="1" />
      <rect x="8.5" y="6" width="8" height="4.5" rx="1" />
      <path d="M12 6 V3.5" />
    </Svg>
  );
}


// Paleta de pintor: cambiar el estilo visual
export function IconPalette(props) {
  return (
    <Svg {...props}>
      <path d="M12 3 C17.5 3 21 6.6 21 11 C21 14 18.8 14.6 16.8 13.9 C14.8 13.2 14 15.2 15.3 17.2 C16.6 19.4 14.6 21 12 21 C6.9 21 3 17 3 12 C3 7 6.9 3 12 3 Z" fill={props.fill || 'none'} />
      <circle cx="7.6" cy="10.4" r="1.3" />
      <circle cx="11.2" cy="7" r="1.3" />
      <circle cx="15.6" cy="8.2" r="1.3" />
      <circle cx="8.6" cy="15.2" r="1.3" />
    </Svg>
  );
}

// Reproducir / pausar / siguiente (música)
export function IconPlay(props) {
  return (
    <Svg {...props}>
      <path d="M8 5.5 L18.5 12 L8 18.5 Z" fill={props.fill || 'none'} />
    </Svg>
  );
}
export function IconPause(props) {
  return (
    <Svg {...props}>
      <rect x="6.5" y="5.5" width="3.6" height="13" rx="1" fill={props.fill || 'none'} />
      <rect x="13.9" y="5.5" width="3.6" height="13" rx="1" fill={props.fill || 'none'} />
    </Svg>
  );
}
export function IconNext(props) {
  return (
    <Svg {...props}>
      <path d="M5.5 6 L13.5 12 L5.5 18 Z" fill={props.fill || 'none'} />
      <path d="M17.5 6 v12" />
    </Svg>
  );
}

// Parlante con y sin sonido
export function IconSpeaker(props) {
  return (
    <Svg {...props}>
      <path d="M4 9.5 h3.5 L12 5.5 v13 L7.5 14.5 H4 Z" fill={props.fill || 'none'} />
      <path d="M15.5 9 q2 3 0 6 M18 6.8 q3.6 5.2 0 10.4" />
    </Svg>
  );
}
export function IconMute(props) {
  return (
    <Svg {...props}>
      <path d="M4 9.5 h3.5 L12 5.5 v13 L7.5 14.5 H4 Z" fill={props.fill || 'none'} />
      <path d="M15.5 9.5 l5 5 M20.5 9.5 l-5 5" />
    </Svg>
  );
}

// Flechas en círculo: cambiar entre diseños
export function IconSwap(props) {
  return (
    <Svg {...props}>
      <path d="M5 10 a7 7 0 0 1 12.5 -3.5 L19 8.5" />
      <path d="M19 4.5 v4 h-4" />
      <path d="M19 14 a7 7 0 0 1 -12.5 3.5 L5 15.5" />
      <path d="M5 19.5 v-4 h4" />
    </Svg>
  );
}

// Trofeo (récords)
export function IconTrophy(props) {
  return (
    <Svg {...props}>
      <path d="M7.5 4 h9 v5 a4.5 4.5 0 0 1 -9 0 Z" fill={props.fill || 'none'} />
      <path d="M7.5 5.5 H4.5 a3 3 0 0 0 3.4 4.2 M16.5 5.5 h3 a3 3 0 0 1 -3.4 4.2" />
      <path d="M12 13.5 v3.5 M8.5 20 h7 l-1 -3 h-5 Z" />
    </Svg>
  );
}

// Llamita (racha)
export function IconFlame(props) {
  return (
    <Svg {...props}>
      <path d="M12 21 C7.5 21 5.5 17.5 6.5 14 C7.3 11.4 9.5 10.5 9.5 7 C12.5 9 13.5 11 13 13 C14.5 12 15 10 14.5 7.5 C17.5 9.5 19 12.5 18 16 C17.2 19 15 21 12 21 Z" fill={props.fill || 'none'} />
    </Svg>
  );
}

export default {
  IconBowl, IconTub, IconBall, IconFrame, IconMusic, IconHeart,
  IconCookie, IconEnvelope, IconBack, IconClose, IconSparkle, IconPaw, IconPencil, IconGift,
  IconCamera, IconCoin, IconShirt, IconBag, IconDoor, IconChevronRight,
  IconCards, IconCatch, IconPuzzle, IconMole, IconSnake, IconRoad, IconTower,
  IconPalette, IconPlay, IconPause, IconNext, IconSpeaker, IconMute, IconSwap, IconTrophy, IconFlame,
};
