// Alfombras: planas sobre el piso. Todo lo que se dibuja sobre ellas
// (anillos, rombos, la carita del osito) va aplastado como el piso: el
// doble de ancho que de alto. Debajo, un canto más oscuro (el grosor) las
// asienta. Van siempre debajo de todo.

import { face, part, flat, line, shade, rr, ellD, tone, mix, mat, DEPTH } from '../draw.js';
import { metalOf } from './storage.js';

const n1 = (v) => +v.toFixed(1);
const CREAM = '#F6EDDC';

/**
 * Borde de una forma cerrada dada por puntos en el plano del piso (sin
 * aplastar, alrededor de cx, cy): `amp` > 0 lo hace ondulado (festón o
 * pelito). Devuelve el camino ya aplastado.
 */
function edgeD(pts, cx, cy, amp = 0, k = DEPTH) {
  const sq = ([x, y]) => `${n1(x)} ${n1(cy + (y - cy) * k)}`;
  let d = `M${sq(pts[0])}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (!amp) { d += `L${sq(b)}`; continue; }
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1;
    d += `Q${sq([mx + (dx / L) * amp, my + (dy / L) * amp])} ${sq(b)}`;
  }
  return `${d}Z`;
}
// Puntos de un óvalo (en el plano del piso).
const ovalPts = (cx, cy, rx, ry, n) => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]; });
// Puntos de un corazón (en el plano del piso), punta hacia adelante.
const heartPts = (cx, cy, s, n) => Array.from({ length: n }, (_, i) => {
  const t = (i / n) * Math.PI * 2;
  return [cx + 16 * Math.sin(t) ** 3 * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s];
});
// El canto: la misma forma, corrida hacia abajo.
const rim = (d, c, dy = 5) => `<g transform="translate(0 ${dy})">${face(d, c, { w: 2 })}</g>`;

export const RUGS = [
  {
    id: 'alfombra', name: 'Alfombra redonda', cat: 'alfombras', price: 90, w: 252, h: 90, place: 'piso', layer: 'suelo', tags: ['dulce', 'aesthetic', 'hippie'],
    draw: (p) => {
      // alfombra ovalada tejida en trenza: festón claro, anillos, una
      // corona de lunares y una flor al medio
      const C = mat(p.cloth);
      const acc = metalOf(p.accent) === p.accent ? p.accent : mix(p.cloth, '#FFFFFF', 0.75);
      const light = mix(p.cloth, '#FFFFFF', 0.55);
      const cx = 126, cy = 44, K = 38 / 120;
      const sc = edgeD(ovalPts(cx, cy, 116, 116, 30), cx, cy, 7, K);
      let s = rim(sc, C.side, 5);
      s += face(sc, light, { w: 2 });
      s += face(ellD(cx, cy, 108, 34), C.front, { w: 1.6 });
      // trenza: vueltas concéntricas (más tenues en pixel)
      [96, 70, 44].forEach((r) => { s += line(ellD(cx, cy, r, r * K), tone(p.cloth, -1), 1.6, { opacity: 0.35 }); });
      s += flat(ellD(cx, cy, 84, 26.5), light);
      s += flat(ellD(cx, cy, 78, 24.5), C.front);
      for (let i = 0; i < 16; i++) { const t = (i / 16) * Math.PI * 2; s += flat(ellD(n1(cx + Math.cos(t) * 92), n1(cy + Math.sin(t) * 92 * K), 4.2, 2.4), acc); }
      s += flat(ellD(cx, cy, 52, 16.5), mix(p.cloth, '#FFFFFF', 0.3));
      // flor de seis pétalos, acostada
      for (let i = 0; i < 6; i++) { const t = (i / 6) * Math.PI * 2 + 0.26; s += flat(ellD(n1(cx + Math.cos(t) * 20), n1(cy + Math.sin(t) * 20 * K), 13, 5.5), acc); }
      s += flat(ellD(cx, cy, 10, 3.4), mix(acc, '#E9845A', 0.45));
      s += shade(ellD(cx - 40, cy - 14, 40, 6), '#FFFFFF', 0.25);
      // en neón, los anillos y la flor se encienden como tubos
      s += line(`${ellD(cx, cy, 84, 26.5)}${ellD(cx, cy, 52, 16.5)}${ellD(cx, cy, 10, 3.4)}`, acc, 1.6, { 'data-only': 'neon' });
      s += line(ellD(cx, cy, 112, 35.5), '#FFFFFF', 1.6, { 'stroke-dasharray': '5 5', opacity: 0.55, 'data-skip': 'pixel' });
      return s;
    },
  },
  {
    id: 'alfombraRect', name: 'Alfombra tejida', cat: 'alfombras', price: 110, w: 256, h: 84, place: 'piso', layer: 'suelo', tags: ['rustico', 'hippie', 'elegante'],
    draw: (p) => {
      // kilim: guarda de dientes, rombos escalonados (pixel friendly) y
      // flecos anudados en las puntas
      const C = mat(p.cloth);
      const acc = metalOf(p.accent) === p.accent ? p.accent : '#F2E6D3';
      const dk = tone(p.cloth, -1.1);
      let s = '';
      for (let y = 11, i = 0; y <= 69; y += 6, i++) {
        const l = 9 + (i % 3);
        s += line(`M${16 - l} ${y + (i % 2)}H16M240 ${y + (i % 2)}H${240 + l}`, CREAM, 2.4);
      }
      s += face(rr(14, 72, 228, 6, 1), C.side, { w: 1.6 });
      s += face(rr(14, 8, 228, 66, 2), C.front, { w: 2 });
      // trama: pasadas finas a lo ancho
      s += line([16, 24, 32, 40, 48, 56, 64].map((y) => `M18 ${y + 0.5}H238`).join(''), tone(p.cloth, -0.8), 1.3, { opacity: 0.18, 'data-skip': 'pixel' });
      // guarda crema con dientes de sierra (aplastados)
      s += flat(rr(22, 13, 212, 56, 1), CREAM);
      s += flat(rr(28, 18, 200, 46, 1), C.front);
      let teeth = '';
      for (let x = 28; x < 226; x += 10) teeth += `M${x} 18L${x + 5} 22L${x + 10} 18ZM${x} 64L${x + 5} 60L${x + 10} 64Z`;
      s += flat(teeth, dk);
      // franjas de las puntas
      s += flat('M34 22H40V60H34ZM216 22H222V60H216Z', acc);
      // rombos escalonados, aplastados por la perspectiva
      const step = (cx, cy, r, c) => {
        let d = '';
        for (let i = 0; i < r; i++) { const w = (r - i) * 6, y0 = cy - 2.6 * (i + 1), y1 = cy + 2.6 * i; d += `M${cx - w} ${y0}H${cx + w}V${y0 + 2.6}H${cx - w}ZM${cx - w} ${y1}H${cx + w}V${y1 + 2.6}H${cx - w}Z`; }
        return flat(d, c);
      };
      [[80, 41], [128, 41], [176, 41]].forEach(([x, y], i) => {
        s += step(x, y, 7, i === 1 ? acc : CREAM) + step(x, y, 5, i === 1 ? dk : acc) + step(x, y, 2, CREAM);
      });
      s += flat('M54 39H62V43H54ZM98 39H110V43H98ZM146 39H158V43H146ZM194 39H202V43H194Z', dk);
      s += line([80, 128, 176].map((x) => `M${x - 42} 41L${x} 22.8L${x + 42} 41L${x} 59.2Z`).join('') + 'M28 18H228V64H28Z', acc, 1.6, { 'data-only': 'neon' });
      s += shade(rr(14, 8, 228, 10, 2), '#FFFFFF', 0.2);
      // nudos de los flecos
      for (let y = 11; y <= 69; y += 6) s += flat(`M13 ${y - 1.4}h3v3h-3ZM240 ${y - 1.4}h3v3h-3Z`, tone(CREAM, -0.6));
      return s;
    },
  },
  {
    id: 'alfombraCorazon', name: 'Alfombra corazón', cat: 'alfombras', price: 100, w: 210, h: 96, place: 'piso', layer: 'suelo', tags: ['dulce', 'princesa', 'y2k'],
    draw: (p) => {
      // corazón de pelo mullido (borde con pelito), ribete claro y
      // corazones adentro
      const C = mat(p.cloth);
      const light = mix(p.cloth, '#FFFFFF', 0.5);
      const cx = 105, cy = 40;
      const outer = edgeD(heartPts(cx, cy, 5.3, 44), cx, cy, 3.4);
      let s = rim(outer, C.side, 5);
      s += face(outer, C.front, { w: 2 });
      s += flat(edgeD(heartPts(cx, cy + 1, 4.2, 40), cx, cy + 1, 0), light);
      s += flat(edgeD(heartPts(cx, cy + 1, 3.7, 40), cx, cy + 1, 0), C.front);
      s += flat(edgeD(heartPts(cx, cy + 2, 1.9, 32), cx, cy + 2, 0), light);
      // pelito: rulitos sueltos
      s += line('M52 30q3 -2 6 0M70 22q3 -2 6 0M140 22q3 -2 6 0M156 32q3 -2 6 0M66 44q3 -2 6 0M146 46q3 -2 6 0M96 70q3 -2 6 0M112 64q3 -2 6 0', tone(p.cloth, -1), 1.6, { opacity: 0.4 });
      // corazoncitos acostados
      const mini = (x, y, k, c) => flat(edgeD(heartPts(x, y, k, 20), x, y, 0), c);
      const acc = metalOf(p.accent) === p.accent ? p.accent : '#FFFFFF';
      s += mini(66, 36, 0.8, acc) + mini(144, 36, 0.8, acc);
      s += shade('M58 22Q70 12 86 18Q74 18 62 28Z', '#FFFFFF', 0.4);
      s += line(edgeD(heartPts(cx, cy + 1, 3.7, 40), cx, cy + 1, 0) + edgeD(heartPts(cx, cy + 2, 1.9, 32), cx, cy + 2, 0), light, 1.6, { 'data-only': 'neon' });
      return s;
    },
  },
  {
    id: 'alfombraOsito', name: 'Alfombra osito', cat: 'alfombras', price: 130, w: 236, h: 104, place: 'piso', layer: 'suelo', tags: ['dulce', 'aesthetic'],
    draw: (p) => {
      const C = mat(p.cloth);
      const light = mix(p.cloth, '#FFFFFF', 0.55);
      const K = 36 / 108;
      const head = edgeD(ovalPts(118, 56, 108, 108, 40), 118, 56, 4.5, K);
      let s = '';
      // orejas (con pelito) detrás de la cabeza
      [[48, 26], [188, 26]].forEach(([x, y]) => {
        const ear = edgeD(ovalPts(x, y, 26, 30, 16), x, y, 3.5, 0.5);
        s += rim(ear, C.side, 4) + face(ear, C.front, { w: 2 }) + flat(ellD(x, y + 1, 14, 8), light);
      });
      s += rim(head, C.side, 5) + face(head, C.front, { w: 2 });
      s += shade(ellD(80, 36, 40, 8), '#FFFFFF', 0.3);
      // hocico, nariz con brillo y boquita
      s += flat(ellD(118, 68, 34, 14), light);
      s += part('M109 60Q118 56 127 60Q127 67 118 68Q109 67 109 60Z', '#4A3040', { w: 1.4 }) + flat(ellD(114.6, 60.4, 2.6, 1.4), '#FFFFFF');
      s += line('M118 68V71M112 72Q115 75 118 71Q121 75 124 72', '#4A3040', 2);
      // ojitos brillantes y cachetes
      [86, 150].forEach((x) => { s += flat(ellD(x, 50, 6.4, 5.2), '#3A2A3E') + flat(ellD(x - 2.4, 48.2, 2.2, 1.8), '#FFFFFF'); });
      s += flat(ellD(68, 62, 10, 4), '#FF9FB5', { opacity: 0.85 }) + flat(ellD(168, 62, 10, 4), '#FF9FB5', { opacity: 0.85 });
      s += line(`${ellD(118, 68, 34, 14)}${ellD(68, 62, 10, 4)}${ellD(168, 62, 10, 4)}`, light, 1.6, { 'data-only': 'neon' });
      // moñito en una oreja
      const ac = metalOf(p.accent) === p.accent ? p.accent : '#F7A6B9';
      s += part('M196 30C186 22 178 26 180 32C182 36 190 34 196 30C202 36 210 38 212 32C214 26 206 22 196 30Z', ac, { w: 1.6 }) + part(ellD(196, 30, 3.4, 2.8), tone(ac, -0.4), { w: 1.3 });
      return s;
    },
  },
];
