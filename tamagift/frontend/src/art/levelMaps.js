// ─────────────────────────────────────────────────────────────────
// Los mapas de niveles con su mundo: cada juego de niveles tiene su
// paisaje dividido en zonas (Golosinas: prado de gomitas, río de
// chocolate, nubes de algodón; Cocina: huerta, mercado, pastelería…).
//
// Los adornos van en los huecos entre parada y parada, del lado contrario
// al camino, y se dibujan con roles como todo (cada estilo los redibuja
// con su kit). El fondo se parte en trozos de alto fijo para no dibujar
// una imagen enorme de una vez.
// ─────────────────────────────────────────────────────────────────

import { part, flat, line, face, ellD, rr, tone, box, Cir, Ell, INK, piece } from './room/draw.js';

export const MAP_W = 300;
export const MAP_STEP = 66;
const CHUNK = 660;

// Las paradas: un camino que serpentea. Con mundo hay sitio arriba para
// el cartel de la primera zona.
export function mapPoints(count, top = 46) {
  return Array.from({ length: count }, (_, k) => ({ x: MAP_W / 2 + Math.sin(k * 0.95) * 96, y: top + k * MAP_STEP }));
}

// Azar con semilla: el mismo mapa siempre.
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const star = (x, y, R, k = 0.48) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr2 = i % 2 ? R * k : R; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr2).toFixed(1)} ${(y + Math.sin(a) * rr2).toFixed(1)}`; } return `${d}Z`; };
const shadow = (x, y, rx) => Ell(x, y, rx, rx * 0.22, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
const shineDot = (x, y, r) => Cir(x, y, r, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'shine' });

// ── Adornos (x, y = donde se apoyan; s = escala) ────────────────────
// Cada uno: [función, alto aproximado] para que no se corte en un trozo.
const P = {
  gomita: [(x, y, s, c) => shadow(x, y, 13 * s) + part(`M${x - 13 * s} ${y} C${x - 13 * s} ${y - 18 * s} ${x + 13 * s} ${y - 18 * s} ${x + 13 * s} ${y}Z`, c, { w: 1.6 }) + [[-6, -6], [3, -10], [6, -4], [-2, -3]].map(([dx, dy]) => Cir(x + dx * s, y + dy * s, 1.1 * s, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'flat' })).join('') + shineDot(x - 6 * s, y - 11 * s, 2 * s), 22],
  chupete: [(x, y, s, c) => shadow(x, y, 8 * s) + line(`M${x} ${y} V${y - 30 * s}`, INK, 3.4 * s + 2) + line(`M${x} ${y} V${y - 30 * s}`, '#F4EDE4', 3.4 * s) + part(ellD(x, y - 40 * s, 12 * s, 12 * s), c, { w: 1.6 }) + line(`M${x} ${y - 40 * s} m-3 0 a3 3 0 1 1 3 3 a6 6 0 1 1 -6 -6 a9 9 0 1 1 9 9`, '#FFFFFF', 2) + shineDot(x - 5 * s, y - 46 * s, 2 * s), 54],
  menta: [(x, y, s) => { let o = shadow(x, y + 2, 10 * s) + part(ellD(x, y - 10 * s, 11 * s, 11 * s), '#FFFFFF', { w: 1.6 }); for (let i = 0; i < 6; i += 2) { const a1 = (i * Math.PI) / 3, a2 = ((i + 1) * Math.PI) / 3; o += flat(`M${x} ${y - 10 * s} L${(x + Math.cos(a1) * 10 * s).toFixed(1)} ${(y - 10 * s + Math.sin(a1) * 10 * s).toFixed(1)} A${10 * s} ${10 * s} 0 0 1 ${(x + Math.cos(a2) * 10 * s).toFixed(1)} ${(y - 10 * s + Math.sin(a2) * 10 * s).toFixed(1)}Z`, '#F05A78'); } return o; }, 24],
  cupcake: [(x, y, s, c) => shadow(x, y, 12 * s) + part(`M${x - 11 * s} ${y - 16 * s} L${x + 11 * s} ${y - 16 * s} L${x + 8 * s} ${y} L${x - 8 * s} ${y}Z`, '#F7C873', { w: 1.6 }) + line(`M${x - 4 * s} ${y - 15 * s} L${x - 3 * s} ${y - 1} M${x + 4 * s} ${y - 15 * s} L${x + 3 * s} ${y - 1}`, '#D9A24E', 1.2) + part(`M${x - 13 * s} ${y - 16 * s} C${x - 15 * s} ${y - 26 * s} ${x - 6 * s} ${y - 32 * s} ${x} ${y - 30 * s} C${x + 6 * s} ${y - 32 * s} ${x + 15 * s} ${y - 26 * s} ${x + 13 * s} ${y - 16 * s}Z`, c, { w: 1.6 }) + Cir(x, y - 33 * s, 3.4 * s, { fill: '#E8303F', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' }), 38],
  nubeAlgodon: [(x, y, s, c) => part(`M${x - 20 * s} ${y} C${x - 30 * s} ${y} ${x - 28 * s} ${y - 16 * s} ${x - 16 * s} ${y - 15 * s} C${x - 14 * s} ${y - 28 * s} ${x + 6 * s} ${y - 30 * s} ${x + 9 * s} ${y - 18 * s} C${x + 22 * s} ${y - 22 * s} ${x + 30 * s} ${y - 6 * s} ${x + 20 * s} ${y}Z`, c, { w: 1.5 }) + shineDot(x - 10 * s, y - 18 * s, 3 * s), 30],
  chispas: [(x, y, s) => ['#F05A78', '#4FA6E6', '#F7B231', '#55BE84', '#A97BE2'].map((c, i) => flat(rr(x - 18 * s + i * 8 * s, y - 6 * s - (i % 2) * 7 * s, 5 * s, 2.2 * s, 1), c, { transform: `rotate(${i * 37} ${x - 16 * s + i * 8 * s} ${y - 5 * s})` })).join(''), 16],
  zanahoria: [(x, y, s) => shadow(x, y, 14 * s) + part(ellD(x, y - 2 * s, 14 * s, 5 * s), '#8A5A3C', { w: 1.4 }) + part(`M${x - 4 * s} ${y - 4 * s} L${x} ${y + 6 * s} L${x + 4 * s} ${y - 4 * s}Z`, '#F28C38', { w: 1.3 }) + part(`M${x} ${y - 4 * s} C${x - 8 * s} ${y - 14 * s} ${x - 9 * s} ${y - 20 * s} ${x - 5 * s} ${y - 22 * s} C${x - 2 * s} ${y - 16 * s} ${x - 1 * s} ${y - 10 * s} ${x} ${y - 4 * s}Z M${x} ${y - 4 * s} C${x + 8 * s} ${y - 14 * s} ${x + 9 * s} ${y - 20 * s} ${x + 5 * s} ${y - 22 * s} C${x + 2 * s} ${y - 16 * s} ${x + 1 * s} ${y - 10 * s} ${x} ${y - 4 * s}Z`, '#56AE78', { w: 1.2 }), 26],
  lechuga: [(x, y, s) => shadow(x, y, 13 * s) + part(ellD(x, y - 9 * s, 14 * s, 10 * s), '#8CC063', { w: 1.5 }) + part(ellD(x, y - 11 * s, 9 * s, 7 * s), '#B5DC8A', { w: 1.2 }) + line(`M${x} ${y - 4 * s} V${y - 16 * s} M${x - 7 * s} ${y - 7 * s} L${x - 2 * s} ${y - 13 * s} M${x + 7 * s} ${y - 7 * s} L${x + 2 * s} ${y - 13 * s}`, '#5E9A45', 1.1), 22],
  tomatera: [(x, y, s) => shadow(x, y, 10 * s) + line(`M${x} ${y} V${y - 42 * s}`, '#A9744F', 2.4 * s) + [[-6, -14], [6, -24], [-6, -32], [5, -38]].map(([dx, dy]) => part(ellD(x + dx * s, y + dy * s, 6 * s, 3.4 * s), '#56AE78', { w: 1 })).join('') + [[5, -12], [-5, -22], [6, -30]].map(([dx, dy]) => Cir(x + dx * s, y + dy * s, 4.2 * s, { fill: '#E8303F', stroke: INK, 'stroke-width': 1.1, 'data-r': 'part' })).join(''), 46],
  cajon: [(x, y, s, c) => shadow(x, y, 20 * s) + box(x - 18 * s, y, 36 * s, 16 * s, 12 * s, '#C99A62', { r: 2 }) + [[-11, 0], [0, -2], [11, 0], [-5, -5], [6, -6]].map(([dx, dy]) => Cir(x + dx * s, y - 21 * s + dy * s, 5 * s, { fill: c, stroke: INK, 'stroke-width': 1.1, 'data-r': 'part' })).join(''), 34],
  toldo: [(x, y, s, c) => { let o = shadow(x, y, 30 * s) + face(rr(x - 26 * s, y - 22 * s, 52 * s, 22 * s, 2), '#C99A62', { w: 1.6 }) + line(`M${x - 24 * s} ${y - 22 * s} V${y - 54 * s} M${x + 24 * s} ${y - 22 * s} V${y - 54 * s}`, '#8A5A3C', 2.4); for (let i = 0; i < 6; i++) o += part(`M${x - 30 * s + i * 10 * s} ${y - 60 * s} h${10 * s} v${10 * s} q${-5 * s} ${5 * s} ${-10 * s} 0Z`, i % 2 ? '#FFFFFF' : c, { w: 1.2 }); return o + [[-14, -26], [-4, -27], [8, -26], [17, -27]].map(([dx, dy], i) => Cir(x + dx * s, y + dy * s, 4.4 * s, { fill: ['#F28C38', '#8ED07A', '#E8303F', '#FFD45C'][i], stroke: INK, 'stroke-width': 1, 'data-r': 'part' })).join(''); }, 64],
  torta: [(x, y, s, c) => shadow(x, y, 16 * s) + face(`M${x - 4 * s} ${y} L${x - 2 * s} ${y - 8 * s} L${x + 2 * s} ${y - 8 * s} L${x + 4 * s} ${y}Z`, '#E8E4F0', { w: 1.3 }) + face(ellD(x, y - 9 * s, 17 * s, 3.5 * s), '#E8E4F0', { w: 1.3 }) + face(rr(x - 13 * s, y - 30 * s, 26 * s, 20 * s, 3), '#FBE3C8', { w: 1.6 }) + flat(rr(x - 13 * s, y - 22 * s, 26 * s, 4 * s, 0), c) + part(`M${x - 14 * s} ${y - 30 * s} Q${x - 9 * s} ${y - 24 * s} ${x - 4 * s} ${y - 30 * s} Q${x + 1 * s} ${y - 24 * s} ${x + 5 * s} ${y - 30 * s} Q${x + 10 * s} ${y - 24 * s} ${x + 14 * s} ${y - 30 * s} Q${x} ${y - 36 * s} ${x - 14 * s} ${y - 30 * s}Z`, '#FFFFFF', { w: 1.3 }) + Cir(x, y - 35 * s, 3.4 * s, { fill: '#E8303F', stroke: INK, 'stroke-width': 1.1, 'data-r': 'part' }), 40],
  harina: [(x, y, s) => shadow(x, y, 12 * s) + part(`M${x - 11 * s} ${y} L${x - 12 * s} ${y - 22 * s} Q${x} ${y - 28 * s} ${x + 12 * s} ${y - 22 * s} L${x + 11 * s} ${y}Z`, '#F4EDE4', { w: 1.6 }) + flat(rr(x - 7 * s, y - 15 * s, 14 * s, 8 * s, 2), '#F7C873') + Cir(x, y - 11 * s, 2 * s, { fill: '#C99A62', 'data-r': 'flat' }), 28],
  nube: [(x, y, s) => part(`M${x - 22 * s} ${y} C${x - 30 * s} ${y} ${x - 28 * s} ${y - 12 * s} ${x - 18 * s} ${y - 12 * s} C${x - 16 * s} ${y - 24 * s} ${x + 4 * s} ${y - 26 * s} ${x + 8 * s} ${y - 15 * s} C${x + 20 * s} ${y - 18 * s} ${x + 28 * s} ${y - 4 * s} ${x + 20 * s} ${y}Z`, '#FFFFFF', { w: 1.4 }), 26],
  globo: [(x, y, s, c) => line(`M${x} ${y} C${x - 4 * s} ${y - 8 * s} ${x + 4 * s} ${y - 14 * s} ${x} ${y - 20 * s}`, '#8C7A70', 1.2) + part(`M${x} ${y - 20 * s} C${x - 11 * s} ${y - 22 * s} ${x - 13 * s} ${y - 42 * s} ${x} ${y - 44 * s} C${x + 13 * s} ${y - 42 * s} ${x + 11 * s} ${y - 22 * s} ${x} ${y - 20 * s}Z`, c, { w: 1.5 }) + shineDot(x - 4 * s, y - 36 * s, 2.4 * s), 46],
  pajaro: [(x, y, s) => line(`M${x - 8 * s} ${y - 10 * s} Q${x - 4 * s} ${y - 15 * s} ${x} ${y - 10 * s} Q${x + 4 * s} ${y - 15 * s} ${x + 8 * s} ${y - 10 * s}`, '#5A5068', 1.8), 14],
  foto: [(x, y, s, c) => { const rot = ((x * 7) % 14) - 7; return `<g transform="rotate(${rot} ${x} ${y - 20 * s})">${line(`M${x} ${y - 46 * s} V${y - 38 * s}`, '#8C7A70', 1.2)}${part(rr(x - 2.5 * s, y - 40 * s, 5 * s, 6 * s, 1), '#C99A62', { w: 1 })}${face(rr(x - 15 * s, y - 36 * s, 30 * s, 34 * s, 1), '#FFFFFF', { w: 1.4 })}${flat(rr(x - 12 * s, y - 33 * s, 24 * s, 22 * s, 0), c)}${flat(`M${x - 12 * s} ${y - 11 * s} L${x - 4 * s} ${y - 20 * s} L${x + 1 * s} ${y - 15 * s} L${x + 6 * s} ${y - 21 * s} L${x + 12 * s} ${y - 11 * s}Z`, tone(c, -0.8))}${Cir(x + 6 * s, y - 27 * s, 2.6 * s, { fill: '#FFF3C4', 'data-r': 'flat' })}</g>`; }, 48],
  corazon: [(x, y, s, c) => part(`M${x} ${y - 2 * s} C${x - 11 * s} ${y - 9 * s} ${x - 12 * s} ${y - 20 * s} ${x - 5 * s} ${y - 21 * s} C${x - 2 * s} ${y - 21 * s} ${x} ${y - 18 * s} ${x} ${y - 16 * s} C${x} ${y - 18 * s} ${x + 2 * s} ${y - 21 * s} ${x + 5 * s} ${y - 21 * s} C${x + 12 * s} ${y - 20 * s} ${x + 11 * s} ${y - 9 * s} ${x} ${y - 2 * s}Z`, c, { w: 1.4 }) + shineDot(x - 5 * s, y - 16 * s, 1.8 * s), 22],
  estrella: [(x, y, s) => part(star(x, y - 10 * s, 9 * s), '#FFD45C', { w: 1.2 }) + Cir(x - 2 * s, y - 12 * s, 1.4 * s, { fill: '#FFFFFF', 'data-r': 'shine' }), 22],
  luna: [(x, y, s) => part(`M${x + 4 * s} ${y - 32 * s} A${16 * s} ${16 * s} 0 1 0 ${x + 4 * s} ${y} A${12 * s} ${12 * s} 0 1 1 ${x + 4 * s} ${y - 32 * s}Z`, '#FFF3C4', { w: 1.4 }), 34],
  pieza: [(x, y, s, c) => { const k = 10 * s; const d = `M${x - k} ${y - 2 * k} H${x - k * 0.3} C${x - k * 0.35} ${y - 2.6 * k} ${x + k * 0.35} ${y - 2.6 * k} ${x + k * 0.3} ${y - 2 * k} H${x + k} V${y - k * 1.3} C${x + k * 1.6} ${y - k * 1.35} ${x + k * 1.6} ${y - k * 0.65} ${x + k} ${y - k * 0.7} V${y} H${x - k} Z`; return shadow(x, y, 12 * s) + part(d, c, { w: 1.6 }) + shineDot(x - 5 * s, y - 15 * s, 2 * s); }, 28],
  flor: [(x, y, s, c) => line(`M${x} ${y} V${y - 16 * s}`, '#56AE78', 2) + [0, 72, 144, 216, 288].map((a) => Cir(x + Math.cos((a * Math.PI) / 180) * 5 * s, y - 20 * s + Math.sin((a * Math.PI) / 180) * 5 * s, 4 * s, { fill: c, stroke: INK, 'stroke-width': 1, 'data-r': 'part' })).join('') + Cir(x, y - 20 * s, 3 * s, { fill: '#FFD45C', stroke: INK, 'stroke-width': 1, 'data-r': 'part' }), 28],
  hongo: [(x, y, s) => shadow(x, y, 10 * s) + part(rr(x - 4 * s, y - 12 * s, 8 * s, 12 * s, 3), '#F4EDE4', { w: 1.3 }) + part(`M${x - 13 * s} ${y - 11 * s} C${x - 13 * s} ${y - 26 * s} ${x + 13 * s} ${y - 26 * s} ${x + 13 * s} ${y - 11 * s}Z`, '#E8505E', { w: 1.5 }) + [[-6, -17], [3, -21], [7, -14]].map(([dx, dy]) => Cir(x + dx * s, y + dy * s, 2 * s, { fill: '#FFFFFF', 'data-r': 'flat' })).join(''), 28],
  arbusto: [(x, y, s) => shadow(x, y, 20 * s) + part(`M${x - 22 * s} ${y} C${x - 26 * s} ${y - 14 * s} ${x - 12 * s} ${y - 24 * s} ${x - 4 * s} ${y - 18 * s} C${x} ${y - 30 * s} ${x + 18 * s} ${y - 26 * s} ${x + 16 * s} ${y - 14 * s} C${x + 26 * s} ${y - 12 * s} ${x + 24 * s} ${y} ${x + 18 * s} ${y}Z`, '#6FB07E', { w: 1.6 }) + [[-10, -10], [6, -16], [14, -6]].map(([dx, dy]) => Cir(x + dx * s, y + dy * s, 2.4 * s, { fill: '#FF8FB0', 'data-r': 'flat' })).join(''), 30],
};

// Lo ancho, cuando va de paisaje en el borde, no pasa de este tamaño.
const EDGE_MAX = { toldo: 1.1, cajon: 1.4, torta: 1.5, arbusto: 1.6, nubeAlgodon: 1.6, nube: 1.6 };

// Lo grande de cada zona que cruza el mapa de lado a lado (detrás del camino).
const BAND = {
  rio: (y, w) => part(`M-4 ${y - 14} C${w * 0.25} ${y - 24} ${w * 0.5} ${y - 4} ${w * 0.75} ${y - 14} S${w} ${y - 18} ${w + 4} ${y - 14} V${y + 18} C${w * 0.75} ${y + 10} ${w * 0.5} ${y + 28} ${w * 0.25} ${y + 18} S0 ${y + 14} -4 ${y + 18}Z`, '#8A5A3C', { w: 2 })
    + line(`M14 ${y - 2} q24 -8 48 0 M120 ${y + 6} q22 -7 44 0 M214 ${y - 4} q22 -7 44 0`, '#B98760', 2.4)
    + line(`M60 ${y + 10} q14 -5 28 0 M180 ${y + 12} q14 -5 28 0`, '#6E4630', 2)
    + [[40, 2, '#FF9EC4'], [96, 9, '#8FD3F5'], [168, -3, '#FFD45C'], [236, 8, '#C9A6FF']].map(([x, dy, c]) => flat(rr(x, y + dy, 6, 2.4, 1), c)).join(''),
  surcos: (y, w) => part(`M-4 ${y - 16} Q${w / 2} ${y - 24} ${w + 4} ${y - 16} V${y + 18} Q${w / 2} ${y + 10} -4 ${y + 18}Z`, '#B48A5A', { w: 1.8 })
    + [0, 1, 2].map((i) => line(`M6 ${y - 8 + i * 9} Q${w / 2} ${y - 15 + i * 9} ${w - 6} ${y - 8 + i * 9}`, '#8F6A42', 2.2)).join('')
    + [24, 84, 150, 214, 270].map((x, i) => flat(`M${x} ${y - 6 + (i % 2) * 9} c-3 -6 -1 -9 2 -10 c1 3 1 6 -2 10Z`, '#7FB05A')).join(''),
  mantel: (y, w) => { let o = ''; for (let i = 0; i < Math.ceil(w / 20); i++) o += flat(rr(i * 20, y - 10, 10, 10, 0), '#F7B6C8', { opacity: 0.8 }) + flat(rr(i * 20 + 10, y, 10, 10, 0), '#F7B6C8', { opacity: 0.8 }); return o; },
  cuerdaFotos: (y, w) => line(`M0 ${y - 30} Q${w / 2} ${y - 6} ${w} ${y - 30}`, '#8C7A70', 1.2),
  camino: (y, w) => flat(`M0 ${y - 6} Q${w / 2} ${y + 6} ${w} ${y - 6} V${y + 4} Q${w / 2} ${y + 16} 0 ${y + 4}Z`, '#E7D6A8', { opacity: 0.85 }),
};

// Los mundos. `zones`: nombre, colores del fondo (de arriba a abajo),
// adornos con sus colores y, si tiene, lo que cruza el mapa.
export const MAP_THEMES = {
  golosinas: {
    path: { base: '#F7B6C8', dash: '#FFFFFF', done: '#F05A78' },
    zones: [
      { name: 'Prado de gomitas', bg: ['#FDE7EF', '#E3F5E8'], props: ['gomita', 'chupete', 'menta', 'chispas'], edge: ['gomita', 'chupete'], colors: ['#F05A78', '#4FA6E6', '#F7B231', '#55BE84', '#A97BE2'] },
      { name: 'Río de chocolate', bg: ['#FBE6D4', '#F6DCC6'], props: ['cupcake', 'chupete', 'gomita', 'chispas'], edge: ['cupcake', 'chupete'], colors: ['#FF9EC4', '#C9A6FF', '#8FD3F5', '#FFD45C'], band: 'rio' },
      { name: 'Nubes de algodón', bg: ['#EEE6FF', '#DFF0FF'], props: ['nubeAlgodon', 'menta', 'cupcake', 'gomita'], edge: ['nubeAlgodon'], colors: ['#FFC2DA', '#C7E3FF', '#E2D2FF', '#FFE3A8'] },
    ],
  },
  cocina: {
    path: { base: '#E3C29A', dash: '#FFF6E8', done: '#E8964A' },
    zones: [
      { name: 'La huerta', bg: ['#E8F5DC', '#D8ECC6'], props: ['zanahoria', 'lechuga', 'zanahoria'], edge: ['tomatera', 'arbusto'], colors: ['#8CC063'], band: 'surcos' },
      { name: 'El mercado', bg: ['#FFF2D9', '#FBE6C4'], props: ['cajon', 'cajon', 'harina'], edge: ['toldo'], colors: ['#E8303F', '#F28C38', '#8ED07A', '#FFD45C'] },
      { name: 'La pastelería', bg: ['#FDE6EE', '#F8D9E5'], props: ['cupcake', 'harina', 'cupcake'], edge: ['torta'], colors: ['#FF9EC4', '#C9A6FF', '#8FD3F5'], band: 'mantel' },
    ],
  },
  memoria: {
    path: { base: 'rgba(255,255,255,0.75)', dash: '#FFD45C', done: '#FFB347' },
    zones: [
      { name: 'Mañana de recuerdos', bg: ['#D9EEFF', '#EAF6FF'], props: ['globo', 'pajaro', 'corazon'], edge: ['nube'], colors: ['#FF9EC4', '#8FD3F5', '#FFD45C'] },
      { name: 'Tarde de fotos', bg: ['#FFE4CF', '#FBD3DD'], props: ['foto', 'corazon', 'foto'], edge: ['globo', 'nube'], colors: ['#8FD3F5', '#FFB6CC', '#C9A6FF', '#8ED07A'], band: 'cuerdaFotos' },
      { name: 'Noche de estrellas', bg: ['#45498A', '#2E3166'], props: ['estrella', 'foto', 'estrella'], edge: ['luna', 'estrella'], colors: ['#7FA9DE', '#C9A6FF'], dark: true },
    ],
  },
  rompecabezas: {
    path: { base: '#D8C49A', dash: '#F6EFDD', done: '#7FC08A' },
    zones: [
      { name: 'El jardín', bg: ['#E4F6E2', '#D2EEDA'], props: ['pieza', 'flor', 'pieza'], edge: ['arbusto', 'flor'], colors: ['#F05A78', '#4FA6E6', '#F7B231', '#A97BE2'], band: 'camino' },
      { name: 'El bosque', bg: ['#D8EDD5', '#C7E3CB'], props: ['hongo', 'pieza', 'flor'], edge: ['arbusto', 'hongo'], colors: ['#55BE84', '#F7B231', '#FF8FB0'] },
    ],
  },
};

// La zona de cada nivel (k desde 0).
export const zoneOf = (theme, count, k) => {
  const z = MAP_THEMES[theme].zones;
  return Math.min(z.length - 1, Math.floor((k * z.length) / count));
};

/**
 * Todo lo que el mapa necesita para dibujarse: alto, trozos de fondo
 * (SVG), dónde empieza cada zona (para el degradado y el cartel) y los
 * colores del camino.
 */
export function mapScene(theme, count, pts) {
  const T = MAP_THEMES[theme];
  const W = MAP_W;
  const H = pts[pts.length - 1].y + 70;
  const r = rng(count * 7919 + theme.length * 131);
  // dónde empieza cada zona (en y)
  const starts = T.zones.map((_, zi) => {
    const k = pts.findIndex((_, i) => zoneOf(theme, count, i) === zi);
    return k <= 0 ? 0 : Math.round((pts[k - 1].y + pts[k].y) / 2);
  });
  // adornos: en cada hueco entre paradas, del lado contrario al camino.
  // Uno grande asomando por el borde (paisaje), uno mediano más adentro
  // y, a veces, uno chico cerca del centro.
  const items = [];
  const add = (name, x, y, sc, c) => { const [fn, ph] = P[name]; items.push({ y, top: y - ph * sc - 4, svg: fn(Math.round(x), Math.round(y), +sc.toFixed(2), c) }); };
  for (let k = -1; k < pts.length; k++) {
    const a = pts[Math.max(0, k)], b = pts[Math.min(pts.length - 1, k + 1)];
    const midY = k < 0 ? a.y - 22 : k === pts.length - 1 ? a.y + 46 : (a.y + b.y) / 2;
    const midX = k < 0 || k === pts.length - 1 ? a.x : (a.x + b.x) / 2;
    const Z = T.zones[zoneOf(theme, count, Math.max(0, Math.min(pts.length - 1, k + 1)))];
    const side = midX < W / 2 ? 1 : -1;
    const at = (d) => (side > 0 ? W - d : d);
    const y = midY + 18 + (r() - 0.5) * 10;
    const big = pick(Z.edge || Z.props, r);
    add(big, at(14 + r() * 10), y + 6, Math.min(EDGE_MAX[big] || 9, 1.7 + r() * 0.5), pick(Z.colors, r));
    add(pick(Z.props, r), at(72 + r() * 18), y - 4, 1.25 + r() * 0.3, pick(Z.colors, r));
    if (r() < 0.6) add(pick(Z.props, r), W / 2 + side * (18 + r() * 20), y + 2 + (r() - 0.5) * 10, 0.95 + r() * 0.2, pick(Z.colors, r));
  }
  // lo que cruza de lado a lado, una vez por zona (a media zona)
  const bands = T.zones.map((Z, zi) => {
    if (!Z.band) return null;
    const end = starts[zi + 1] || H;
    const ks = pts.map((p, i) => i).filter((i) => zoneOf(theme, count, i) === zi);
    const gap = ks.length > 1 ? ks[Math.floor(ks.length / 2) - 1] : ks[0];
    const y = gap != null && pts[gap + 1] ? Math.round((pts[gap].y + pts[gap + 1].y) / 2) : Math.round((starts[zi] + end) / 2);
    return { y, top: y - 34, band: true, svg: BAND[Z.band](y, W) };
  }).filter(Boolean);
  // en trozos: cada cosa va en el trozo donde cae entera
  const n = Math.ceil(H / CHUNK);
  const chunks = Array.from({ length: n }, (_, i) => ({ y: i * CHUNK, h: Math.min(CHUNK, H - i * CHUNK), parts: [] }));
  [...bands, ...items].forEach((it) => {
    // lo que cae entre dos trozos se dibuja en los dos (cada uno recorta su parte)
    chunks.forEach((c) => { if (it.y + 16 > c.y && it.top < c.y + c.h) c.parts.push(it); });
  });
  return {
    W, H,
    path: T.path,
    zones: T.zones.map((Z, zi) => ({ name: Z.name, y: starts[zi], dark: !!Z.dark, bg: Z.bg })),
    chunks: chunks.map((c, i) => ({
      key: `${theme}-${count}-${i}`, y: c.y, h: c.h,
      markup: piece(W, c.h, `<g transform="translate(0 ${-c.y})">${c.parts.sort((a, b) => (a.band ? 0 : 1) - (b.band ? 0 : 1) || a.y - b.y).map((p) => p.svg).join('')}</g>`),
    })),
  };
}
