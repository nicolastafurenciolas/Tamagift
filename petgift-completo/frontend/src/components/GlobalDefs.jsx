import React from 'react';

// Definiciones SVG globales, montadas una sola vez.
// - pg-wobble: desplazamiento tipo "trazo hecho a mano" para darle
//   temblorcito orgánico a los contornos (clase .pg-wobble en index.css).
export default function GlobalDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        <filter id="pg-wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
