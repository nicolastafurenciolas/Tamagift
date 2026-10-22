// Disfraces y accesorios de Halloween. Solo se venden en la temporada
// (seasons.js); lo comprado queda en el vestidor para siempre.
// Cada cosa lleva su `slot` (entra al vestidor desde index.js).

import {
  G, P, E, Cir, OUT, GOLD, GOLD_D, BOTTOM, nid,
  shade, mixc, f, T, part, flat, line, shine, dot, ellD, starD, moonD, sparkleD,
  headband, onTop, garment, neckLine, clipBody,
} from './kit.js';
import { neckBand, skirt } from './outfit.js';
import { mirrorX } from '../../svg.js';

const sc = (g) => Math.max(0.8, Math.min(1.12, g.w / 144));
const LEAF = '#6B8A3A';

// Murciélago con centro en (0, 0), ~40 de ancho.
function batShape(c, blush) {
  const wing = (sx) => part(`M${4 * sx} -1 C${9 * sx} -8 ${16 * sx} -9 ${20 * sx} -5 C${17 * sx} -4 ${16 * sx} -1 ${16 * sx} 1 C${14 * sx} -1 ${11 * sx} 0 ${10 * sx} 2 C${9 * sx} 0 ${6 * sx} 1 ${4 * sx} 4Z`, c, { 'stroke-width': 1.6 });
  return wing(-1) + wing(1)
    + part('M-4.5 -3 L-4 -9 L-1.5 -5 L1.5 -5 L4 -9 L4.5 -3 C5.5 2 3.5 6 0 6 C-3.5 6 -5.5 2 -4.5 -3Z', c, { 'stroke-width': 1.7 })
    + shine(-1.9, -1.4, 1.3) + shine(1.9, -1.4, 1.3)
    + P(ellD(-3, 1.6, 1.3, 0.8), { fill: blush, 'data-r': 'flat' }) + P(ellD(3, 1.6, 1.3, 0.8), { fill: blush, 'data-r': 'flat' });
}

// Calabacita con centro abajo en (0, 0).
function miniPumpkin(c, leaf, k = 1) {
  const cd = shade(c, -0.5);
  return G({ transform: `scale(${k})` },
    part(ellD(-9, -11, 10, 11.5), cd) + part(ellD(9, -11, 10, 11.5), cd) + part(ellD(0, -11, 10.5, 12.5), c)
    + line('M-4 -21 Q-6 -11 -4 -1 M4 -21 Q6 -11 4 -1', shade(c, -1.1), 1.2, { opacity: 0.6 })
    + part('M-2 -22 C-2.4 -27 -1 -30 2.4 -32 L4.4 -30 C2 -28 2 -25 2.2 -22Z', LEAF, { 'stroke-width': 1.5 })
    + (leaf ? part('M2.4 -27 C7 -32 14 -31 15 -27 C11 -24 6 -24 2.4 -27Z', leaf, { 'stroke-width': 1.4 }) : '')
    + shine(-11.5, -15, 2));
}

// Banda del collar (como en neck.js): punto en t (0 izq … 1 der).
const neckAt = (g, t, dy = 0) => {
  const y = g.neckY, sag = 5, L = g.l - 6, R = g.r + 6;
  return [L + (R - L) * t, y + dy + sag * 2 * (1 - Math.pow(2 * t - 1, 2))];
};

const HEAD = [
  {
    id: 'calabacita', label: 'Calabacita en la cabeza', price: 75, colors: ['#F28C38', '#8CC063'],
    draw: (g, k) => { const p = onTop(g, 0.17, 7); return { top: G({ transform: T(p.x, p.y, p.rot * 0.7 + 10, 1.25 * sc(g)) }, miniPumpkin(k.c1, k.c2)) }; },
  },
  {
    id: 'diademaMurcielago', label: 'Diadema de murciélago', price: 80, colors: ['#3A3044', '#FF9EC4'],
    draw: (g, k) => {
      const p = onTop(g, 0, 2), s = sc(g);
      return { top: headband(g, g.w * 0.4, 2, 8, k.c1) + G({ transform: T(p.x, p.y - 9 * s, 0, 1.55 * s) }, batShape(k.c1, k.c2)) };
    },
  },
  {
    id: 'sombreroEstrellas', label: 'Sombrero de bruja con estrellas', price: 120, colors: ['#5A3A8A', '#F28C38'],
    draw: (g, k) => {
      const bw = g.w * 0.48;
      const s = part(`M${f(-bw)} 0 C${f(-bw)} -10 ${f(bw)} -10 ${f(bw)} 0 C${f(bw)} 9 ${f(-bw)} 9 ${f(-bw)} 0Z`, k.c1)
        + line(`M${f(-bw + 8)} 3 C${f(-bw * 0.4)} 6 ${f(bw * 0.4)} 6 ${f(bw - 8)} 3`, shade(k.c1, 1.2), 1.6, { opacity: 0.7 })
        + part('M-22 -2 C-18 -22 -10 -42 2 -58 C6 -63 16 -64 25 -58 C15 -57 10 -50 10 -40 C12 -26 18 -12 22 -2 Q0 4 -22 -2Z', k.c1)
        + part('M-21.5 -7.5 Q0 -2.5 21.5 -7.5 L22 -2 Q0 4 -22 -2Z', k.c2)
        + flat(starD(-8, -27, 3.6), GOLD) + flat(starD(7, -17, 2.6), GOLD) + flat(moonD(-1, -42, 3.2), '#FFF3C4')
        + line('M25 -58 Q31 -51 29 -45', OUT, 1.3) + part(starD(29, -41, 4.6), GOLD, { stroke: GOLD_D, 'stroke-width': 1.4 });
      return { top: G({ transform: T(100, g.top + 8, -6, sc(g)) }, s) };
    },
  },
];

const FACE = [
  {
    id: 'antifazMurcielago', label: 'Antifaz de murciélago', price: 70, colors: ['#3A3044'],
    draw: (g, k, { e }) => {
      const y = e.y, w = e.dx + 15;
      const X = (sx, dx) => f(100 + sx * dx), Y = (dy) => f(y + dy);
      // contorno con las puntas de ala a los lados; los ojos quedan al aire
      const outer = `M100 ${Y(-6)}`
        + ` C${X(-1, 6)} ${Y(-11)} ${X(-1, e.dx + 2)} ${Y(-13)} ${X(-1, w - 4)} ${Y(-12)}`
        + ` L${X(-1, w + 7)} ${Y(-19)} L${X(-1, w + 4)} ${Y(-7)} L${X(-1, w + 10)} ${Y(-1)}`
        + ` C${X(-1, w + 1)} ${Y(9)} ${X(-1, e.dx + 3)} ${Y(10)} ${X(-1, 7)} ${Y(6)} L100 ${Y(3)}`
        + ` L${X(1, 7)} ${Y(6)} C${X(1, e.dx + 3)} ${Y(10)} ${X(1, w + 1)} ${Y(9)} ${X(1, w + 10)} ${Y(-1)}`
        + ` L${X(1, w + 4)} ${Y(-7)} L${X(1, w + 7)} ${Y(-19)} L${X(1, w - 4)} ${Y(-12)}`
        + ` C${X(1, e.dx + 2)} ${Y(-13)} ${X(1, 6)} ${Y(-11)} 100 ${Y(-6)}Z`;
      const hole = (x) => ellD(x, y, 8, 7);
      return { front: P(`${outer} ${hole(100 - e.dx)} ${hole(100 + e.dx)}`, { fill: k.c1, 'fill-rule': 'evenodd', stroke: OUT, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'data-r': 'part' }) + flat(sparkleD(100 + w + 4, y - 23, 2.6), '#FFFFFF') };
    },
  },
  {
    id: 'colmillos', label: 'Colmillitos de vampiro', price: 45, colors: [],
    draw: (g, k, { e }) => {
      // asoman justo debajo de la boca (más grandes que en la vida real:
      // si no, en pixel art no se ven)
      // (la boca en pixel es una pieza hecha a mano que se pinta encima:
      // los colmillos cuelgan por debajo de ella para que no los tape)
      const y = (e.mouthY ?? e.y + 12) + 3.2;
      return { front: part(`M93.6 ${f(y)} L96.8 ${f(y + 7.5)} L99.6 ${f(y)}Z M100.4 ${f(y)} L103.2 ${f(y + 7.5)} L106.4 ${f(y)}Z`, '#FFFFFF', { 'stroke-width': 1.7 }) };
    },
  },
];

const NECK = [
  {
    id: 'collarCalabazas', label: 'Collar de calabacitas', price: 70, colors: ['#F28C38'],
    draw: (g, k) => {
      const y = g.neckY, sag = 5, L = g.l - 6, R = g.r + 6;
      let s = clipBody(g, P(`M${f(L)} ${f(y)} Q100 ${f(y + sag * 2.4)} ${f(R)} ${f(y)}`, { fill: 'none', stroke: '#6A5E80', 'stroke-width': 2, 'data-r': 'line' }));
      [0.3, 0.5, 0.7].forEach((t, i) => {
        const [x, yy] = neckAt(g, t, 2);
        s += G({ transform: T(x, yy + 11, (t - 0.5) * 30, i === 1 ? 0.62 : 0.5) }, miniPumpkin(k.c1, null));
      });
      return { front: s };
    },
  },
];

const OUTFIT = [
  {
    id: 'disfrazCalabaza', label: 'Disfraz de calabaza', price: 160, colors: ['#F28C38', '#6B8A3A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24 });
      let ribs = '';
      [-0.36, -0.18, 0.18, 0.36].forEach((t) => {
        const x = 100 + g.w * t;
        ribs += `M${f(x)} ${f(nl.yc + 2)} Q${f(x + g.w * t * 0.35)} ${f((nl.yc + BOTTOM) / 2)} ${f(x)} ${f(BOTTOM + 4)}`;
      });
      const yF = nl.yc + (BOTTOM - nl.yc) * 0.42, dark = shade(k.c1, -2.4);
      const jack = flat(`M${f(100 - 14)} ${f(yF)} l5 -7 l5 7Z M${f(100 + 4)} ${f(yF)} l5 -7 l5 7Z`, dark)
        + flat(`M${f(100 - 15)} ${f(yF + 6)} Q100 ${f(yF + 18)} ${f(100 + 15)} ${f(yF + 6)} Q${f(100 + 8)} ${f(yF + 9)} ${f(100 + 5)} ${f(yF + 8)} L${f(100 + 3)} ${f(yF + 11)} L${f(100 + 1)} ${f(yF + 8.6)} Q100 ${f(yF + 9)} ${f(100 - 4)} ${f(yF + 8.6)} L${f(100 - 6)} ${f(yF + 11.4)} L${f(100 - 8)} ${f(yF + 8)} Q${f(100 - 11)} ${f(yF + 8.6)} ${f(100 - 15)} ${f(yF + 6)}Z`, dark);
      let leaves = '';
      [0.18, 0.36, 0.64, 0.82].forEach((t) => {
        const x = g.l - 10 + (g.w + 20) * t;
        const u = (x - (g.l - 10)) / (g.w + 20), yy = (1 - u) * (1 - u) * nl.ys + 2 * (1 - u) * u * (nl.yc + (nl.yc - nl.ys) * 0.95) + u * u * nl.ys + 4;
        leaves += part(`M${f(x - 6)} ${f(yy)} Q${f(x)} ${f(yy + 13)} ${f(x + 6)} ${f(yy)}Z`, shade(k.c2, 0.25), { 'stroke-width': 1.6 });
      });
      return { outfit: garment(g, k.c1, { side: 4, center: 24, extra: line(ribs, shade(k.c1, -1), 1.6, { opacity: 0.6 }) + jack + leaves + neckBand(g, nl, 5, k.c2) }).svg };
    },
  },
  {
    id: 'disfrazFantasma', label: 'Disfraz de fantasmita', price: 150, colors: ['#FBF7FF', '#FFB6CC'],
    draw: (g, k, { e }) => {
      const nl = neckLine(g, { side: 2, center: 20 });
      const sheet = garment(g, k.c1, { side: 2, center: 20, extra: line(`M${f(100 + g.w * 0.28)} ${f(nl.yc + 6)} Q${f(100 + g.w * 0.34)} ${f(BOTTOM - 20)} ${f(100 + g.w * 0.3)} ${f(BOTTOM)}`, mixc(k.c1, '#8A80B0', 0.35), 1.6, { opacity: 0.7 }) }).svg
        + skirt(g, nl.yc + 18, k.c1, { flare: 12, scallop: 5, hem: BOTTOM + 6 })
        + flat(ellD(100 - g.w * 0.22, BOTTOM - 14, 4.5, 2.6), k.c2, { opacity: 0.9 }) + flat(ellD(100 + g.w * 0.22, BOTTOM - 14, 4.5, 2.6), k.c2, { opacity: 0.9 });
      // la sábana también tapa la cabeza (la cara queda al aire)
      const fy = e ? e.y : g.face.y, o = 6;
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const th = Math.PI + 0.25 - ((Math.PI + 0.5) * i) / 20;
        pts.push(`${f(100 + (g.hw + o) * Math.cos(th))} ${f(g.ys - (g.ys - g.top + o) * Math.sin(th))}`);
      }
      const inner = `L${f(g.r - 2)} ${f(fy + 12)} C${f(g.r - 6)} ${f(fy - 20)} ${f(100 + g.w * 0.2)} ${f(fy - 24)} 100 ${f(fy - 24)} C${f(100 - g.w * 0.2)} ${f(fy - 24)} ${f(g.l + 6)} ${f(fy - 20)} ${f(g.l + 2)} ${f(fy + 12)}Z`;
      return { outfit: sheet, top: part(`M${pts.join(' L')} ${inner}`, k.c1) + line(`M${f(g.l + 10)} ${f(fy - 4)} C${f(g.l + 10)} ${f(fy - 26)} ${f(g.r - 10)} ${f(fy - 26)} ${f(g.r - 10)} ${f(fy - 4)}`, mixc(k.c1, '#8A80B0', 0.35), 1.4, { opacity: 0.6 }) };
    },
  },
  {
    id: 'vestidoBruja', label: 'Vestido de brujita', price: 180, colors: ['#5A3A8A', '#F28C38'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const yW = nl.yc + 14;
      const sk = skirt(g, yW, k.c1, { flare: 10, pleats: 6 });
      // dos franjas en el ruedo, recortadas a la falda
      const d = (sk.match(/ d="([^"]+)"/) || [])[1];
      const id = nid('vb');
      let bands = '';
      for (let i = 0; i < 2; i++) { const yb = BOTTOM - 1 - i * 9; bands += P(`M${f(g.l - 24)} ${f(yb - 4)} H${f(g.r + 24)} V${f(yb)} H${f(g.l - 24)}Z`, { fill: k.c2, 'data-r': 'flat' }); }
      const trim = d ? E('clipPath', { id }, P(d)) + G({ 'clip-path': `url(#${id})` }, bands) : '';
      return {
        outfit: garment(g, k.c1, { side: 8, center: 26, extra: neckBand(g, nl, 3, k.c2) }).svg
          + sk + trim
          + clipBody(g, part(`M${f(g.l - 4)} ${f(yW - 3)} Q100 ${f(yW + 1)} ${f(g.r + 4)} ${f(yW - 3)} L${f(g.r + 4)} ${f(yW + 3)} Q100 ${f(yW + 7)} ${f(g.l - 4)} ${f(yW + 3)}Z`, k.c2))
          + part(starD(100 - g.w * 0.16, yW + 17, 4.2), GOLD, { stroke: GOLD_D, 'stroke-width': 1.2 })
          + part(starD(100 + g.w * 0.19, yW + 22, 3.4), GOLD, { stroke: GOLD_D, 'stroke-width': 1.2 })
          + flat(moonD(100 + g.w * 0.02, yW + 11, 3.4), '#FFF3C4'),
      };
    },
  },
  {
    id: 'pijamaEsqueleto', label: 'Pijama de esqueleto', price: 150, colors: ['#2A2230', '#F4EDE4'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24 });
      // las costillas se reparten en lo que hay entre el escote y el
      // borde (en las mochis bajitas es poco)
      const top = nl.yc + 3, bone = k.c2, yP = BOTTOM - 13;
      const gap = Math.max(5, Math.min(8, (yP - top - 8) / 3));
      let ribs = line(`M100 ${f(top)} V${f(yP)}`, bone, 3.2);
      for (let i = 0; i < 3; i++) {
        const y = top + 4 + i * gap, hw = g.w * (0.26 - i * 0.03);
        ribs += line(`M${f(100 - hw)} ${f(y + 4)} Q${f(100 - hw * 0.5)} ${f(y - 2)} 100 ${f(y)} Q${f(100 + hw * 0.5)} ${f(y - 2)} ${f(100 + hw)} ${f(y + 4)}`, bone, 2.6);
      }
      const pelvis = part(`M${f(100 - 12)} ${f(yP)} C${f(100 - 14)} ${f(yP + 9)} ${f(100 - 4)} ${f(yP + 10)} 100 ${f(yP + 5)} C${f(100 + 4)} ${f(yP + 10)} ${f(100 + 14)} ${f(yP + 9)} ${f(100 + 12)} ${f(yP)} Q100 ${f(yP - 4)} ${f(100 - 12)} ${f(yP)}Z`, bone, { 'stroke-width': 1.4 });
      return { outfit: garment(g, k.c1, { side: 4, center: 24, extra: ribs + pelvis + neckBand(g, nl, 4, shade(k.c1, 0.6)) }).svg };
    },
  },
];

const BACK = [
  {
    id: 'capaVampiro', label: 'Capa de vampiro', price: 170, colors: ['#2A2230', '#C8303F'],
    draw: (g, k) => {
      const y0 = g.neckY - 4, l = g.l, r = g.r;
      // la capa: por detrás, abierta, con puntas abajo y el cuello alto
      const half = `M100 ${f(y0)} L${f(l - 4)} ${f(y0 + 2)} C${f(l - 14)} ${f(y0 + 30)} ${f(l - 18)} ${f(BOTTOM - 10)} ${f(l - 16)} ${f(BOTTOM + 4)} L${f(l - 4)} ${f(BOTTOM - 4)} L${f(l + 6)} ${f(BOTTOM + 6)} L100 ${f(BOTTOM)}Z`;
      const collar = `M${f(l + 10)} ${f(y0 + 2)} C${f(l - 2)} ${f(y0 - 10)} ${f(l - 8)} ${f(y0 - 26)} ${f(l - 6)} ${f(y0 - 36)} C${f(l + 4)} ${f(y0 - 24)} ${f(l + 14)} ${f(y0 - 12)} ${f(l + 22)} ${f(y0 - 2)}Z`;
      const one = part(half, k.c1) + part(collar, k.c2) + line(`M${f(l - 4)} ${f(y0 - 22)} C${f(l + 2)} ${f(y0 - 14)} ${f(l + 8)} ${f(y0 - 8)} ${f(l + 14)} ${f(y0 - 2)}`, shade(k.c2, -0.8), 1.3, { opacity: 0.7 });
      return {
        back: one + mirrorX(one),
        front: part(`M${f(100 - 9)} ${f(g.neckY + 2)} L100 ${f(g.neckY + 8)} L${f(100 + 9)} ${f(g.neckY + 2)}`, k.c1, { fill: 'none', 'stroke-width': 2 })
          + Cir(100, g.neckY + 8, 4.4, { fill: k.c2, stroke: OUT, 'stroke-width': 1.8, 'data-r': 'part' }) + shine(98.6, g.neckY + 6.6, 1.2),
      };
    },
  },
];

const HAND = [
  {
    id: 'cubetaDulces', label: 'Cubeta de dulces', price: 70, colors: ['#F28C38'],
    draw: () => (k) => line('M-14 -14 C-14 -34 14 -34 14 -14', OUT, 2.6) + line('M-14 -14 C-14 -34 14 -34 14 -14', '#6A5E80', 1.2)
      + part(ellD(-9, -2, 9, 10), shade(k.c1, -0.5)) + part(ellD(9, -2, 9, 10), shade(k.c1, -0.5)) + part(ellD(0, -2, 10, 11), k.c1)
      + flat('M-8 -6 l3 -4 l3 4Z M2 -6 l3 -4 l3 4Z M-8 1 Q0 9 8 1 Q4 3 0 2.6 Q-4 3 -8 1Z', shade(k.c1, -2.4))
      + part(ellD(-5, -13, 4.4, 3), '#FF7FA8', { 'stroke-width': 1.2 }) + part(ellD(4, -14, 4, 2.8), '#C9A6FF', { 'stroke-width': 1.2 }) + part(ellD(0, -12, 3.6, 2.6), '#FFD45C', { 'stroke-width': 1.2 })
      + part(ellD(0, -14, 15, 3.6), shade(k.c1, -0.9), { fill: 'none', 'stroke-width': 1.6 }),
  },
  {
    id: 'escobita', label: 'Escobita de bruja', price: 65, colors: ['#8E6FE0'],
    draw: () => (k) => part('M10 -40 L14 -38 L-2 6 L-6 4Z', '#B07F55', { 'stroke-width': 1.6 })
      + part('M-16 22 C-16 14 -12 8 -8 4 L1 7 C2 12 6 18 9 24 Q-4 27 -16 22Z', '#EBC86E', { 'stroke-width': 1.7 })
      + line('M-11 20 L-7 9 M-5 22 L-3 10 M1 22 L-1 11', '#C59B3E', 1.1)
      + part('M-8 2 L2 6 L0 10 L-10 6Z', k.c1, { 'stroke-width': 1.4 }) + part(starD(13, -41, 4.2), GOLD, { stroke: GOLD_D, 'stroke-width': 1.2 }),
  },
  {
    id: 'piruleta', label: 'Piruleta embrujada', price: 45, colors: ['#8E6FE0', '#F28C38'],
    draw: () => (k) => line('M0 12 L0 -14', '#F4EDE4', 4) + line('M0 12 L0 -14', OUT, 0.9, { opacity: 0.4 })
      + part(ellD(0, -29, 16, 16), k.c1)
      + line('M0 -29 m-3.6 0 a3.6 3.6 0 1 1 3.6 3.6 a7.4 7.4 0 1 1 -7.4 -7.4 a11 11 0 1 1 11 11', k.c2, 3)
      + shine(-7, -36, 2.6) + flat(sparkleD(17, -44, 3), '#FFFFFF'),
  },
];

// Colores de Halloween primero (calabaza, morado, negro…) y después
// los demás tonos de siempre, para quien quiera un disfraz rosado.
const PALETTE = ['#F28C38', '#5A3A8A', '#3A3044', '#2A2230', '#8E6FE0', '#C8303F', '#6B8A3A', '#8CC063', '#FBF7FF', '#FFD45C', '#FF9EC4', '#FFB6CC', '#8FD3F5', '#A9744F'];
const tagged = (slot, list) => list.map((it) => ({ ...it, slot, season: 'halloween', palette: PALETTE, vibes: ['temporada'] }));

export const HALLOWEEN_WEAR = [
  ...tagged('cabeza', HEAD), ...tagged('cara', FACE), ...tagged('cuello', NECK),
  ...tagged('ropa', OUTFIT), ...tagged('espalda', BACK), ...tagged('mano', HAND),
];
