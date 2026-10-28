import React from 'react';
import { useStyle } from '../../styles/StyleContext';
import { C } from '../../theme';
import Sprite from '../Sprite';

// Íconos propios de los minijuegos nuevos, con el mismo trazo que los de
// components/icons.jsx (y la misma rejilla en pixel art).
function Svg({ size = 24, color = 'currentColor', stroke = 2, children, style, ...rest }) {
  const { style: active } = useStyle();
  const pixel = active.art.kind === 'pixel';
  const svg = (
    <svg
      viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color === 'currentColor' && pixel ? C.ink : color}
      strokeWidth={pixel ? Math.max(stroke, 2.4) : stroke}
      strokeLinecap="round" strokeLinejoin="round" className="pg-icon" aria-hidden="true"
      shapeRendering={pixel ? 'crispEdges' : undefined}
      style={{ color: color === 'currentColor' ? undefined : color, ...style }} {...rest}
    >
      {children}
    </svg>
  );
  if (pixel && size >= 20) return <Sprite art={svg} w={size} h={size} pixel={2} kind="icon" style={style} />;
  return svg;
}

// Olla con vapor (Cocina)
export function IconPot(props) {
  return (
    <Svg {...props}>
      <path d="M4 11 h16 v5 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 Z" fill={props.fill || 'none'} />
      <path d="M2.5 11 h19 M9 8.5 h6" />
      <path d="M9 5 q-1 -1.5 0 -3 M12.5 5.5 q-1 -1.5 0 -3 M16 5 q-1 -1.5 0 -3" />
    </Svg>
  );
}

// Calendario con palomita (reto del día)
export function IconTarget(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </Svg>
  );
}
