// Cuello: collares, lazos, cuello marinero… (los nuevos).
// La línea del cuello (kit.neckGeo) es una curva que envuelve el cuerpo
// debajo de la boca; lo que cuelga por delante cuelga del centro. Los
// dijes se dibujan grandes y con su material: metal con brillo en
// franja, perlas con su sombra, cristal con facetas.

import {
  Cir, G, GOLD, P, PEARL, SILVER, T, bail, ball, bow, chainLine, clipBody, clipTo, crescentD, dot,
  f, flat, flower, heartD, lightOf, line, mixc, neckGeo, neckScale, part, puffStarD, rr, seamOf,
  shade, shine, skipPx, sparkleD, stitch, tone,
} from './kit.js';

// Perla con su sombra abajo y su brillo.
export const pearl = (x, y, r, col = PEARL) => Cir(x, y, r, { fill: col, stroke: mixc(col, '#6E5A4A', 0.6), 'stroke-width': 1.3, 'data-r': 'part' })
  + flat(`M${f(x - r * 0.75)} ${f(y + r * 0.1)} A${f(r * 0.8)} ${f(r * 0.7)} 0 0 0 ${f(x + r * 0.75)} ${f(y + r * 0.1)} A${f(r * 0.8)} ${f(r * 0.45)} 0 0 1 ${f(x - r * 0.75)} ${f(y + r * 0.1)}Z`, shade(col, -0.6))
  + shine(x - r * 0.32, y - r * 0.36, Math.max(0.7, r * 0.3));

export const NECK_ITEMS = [
  {
    id: 'perlas', label: 'Collar de perlas', vibes: ['coquette', 'princesa', 'aesthetic'], price: 120, colors: [PEARL],
    draw: (g, k) => {
      const nk = neckGeo(g);
      const n = Math.round((nk.R - nk.L) / 8.6);
      let s = '';
      for (let i = 0; i <= n; i++) { const [x, y] = nk.pt(i / n, 1); s += pearl(x, y, 3.9, k.c1); }
      const S = neckScale(g);
      return { front: clipBody(g, s) + bail(100, nk.cy + 4.5, SILVER) + pearl(100, nk.cy + 9.5, 4.6 * S, k.c1) };
    },
  },
  {
    id: 'lazoCuello', label: 'Lazo coquette', vibes: ['coquette', 'kawaii'], price: 75, colors: ['#FF9EC4'],
    draw: (g, k) => {
      const nk = neckGeo(g);
      return { front: clipBody(g, part(nk.band(4.5), k.c1, { 'stroke-width': 1.6 }) + line(nk.curve(-1), lightOf(k.c1), 1.1, { opacity: 0.8 })) + bow(100, nk.cy + 1, 0, 1.08 * neckScale(g), k.c1) };
    },
  },
  {
    id: 'cuelloMarinero', label: 'Cuello marinero', vibes: ['otaku', 'playera'], price: 110, colors: ['#2E4A8A', '#D9364F'],
    draw: (g, k) => {
      const nk = neckGeo(g), { L, R, y, cy } = nk;
      const flap = (s) => {
        const X = s < 0 ? L : R;
        return part(`M${f(X)} ${f(y - 9)} Q${f(X - s * 20)} ${f(y + 1)} 100 ${f(cy + 13)} L${f(100 + s * 8)} ${f(cy + 16)} Q${f(X - s * 14)} ${f(y + 12)} ${f(X)} ${f(y + 7)}Z`, k.c1)
          + line(`M${f(X)} ${f(y - 1)} Q${f(X - s * 18)} ${f(y + 7)} ${f(100 + s * 4)} ${f(cy + 12)} M${f(X)} ${f(y + 2.6)} Q${f(X - s * 17)} ${f(y + 10)} ${f(100 + s * 6)} ${f(cy + 14)}`, '#FFFFFF', 1.3, { opacity: 0.95 });
      };
      return { front: clipBody(g, tone(nk.band(5, 9), '#2A1C30', 0.14) + flap(-1) + flap(1)) + bow(100, cy + 14, 0, 0.78 * neckScale(g), k.c2) };
    },
  },
  {
    id: 'corazonColgante', label: 'Collar de corazón', vibes: ['kawaii', 'y2k', 'coquette'], price: 85, colors: ['#FF6F91', SILVER],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g), hs = 8.5 * S, hy = nk.cy + 4 + hs;
      // dije de corazón con bisel (cara de adelante más clara) y brillo
      return {
        front: chainLine(g, nk, k.c2, 1.8) + bail(100, nk.cy + 2.6, k.c2)
          + part(heartD(100, hy, hs), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.8 })
          + flat(heartD(100 - hs * 0.08, hy - hs * 0.06, hs * 0.66), lightOf(k.c1, 0.6))
          + shine(100 - hs * 0.42, hy - hs * 0.36, hs * 0.17) + flat(sparkleD(100 + hs * 0.95, hy - hs * 0.8, 2.2), '#FFFFFF'),
      };
    },
  },
  {
    id: 'lunaColgante', label: 'Collar de luna', vibes: ['celestial', 'gotica'], price: 95, colors: [GOLD],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g), r = 10 * S, my = nk.cy + 3 + r;
      return {
        front: chainLine(g, nk, k.c1, 1.8) + bail(100 + r * 0.25, nk.cy + 2.8, k.c1)
          + part(crescentD(100, my, r), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.7 })
          + flat(crescentD(100 - r * 0.1, my, r * 0.7, 0.62, 0.8), lightOf(k.c1, 0.6)) + shine(100 - r * 0.62, my - r * 0.25, r * 0.13)
          + line(`M${f(100 + r * 0.55)} ${f(my - r * 0.2)} v${f(r * 0.5)}`, shade(k.c1, -1.4), 1)
          + part(puffStarD(100 + r * 0.55, my + r * 0.55, 3.4 * S), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.1 }),
      };
    },
  },
  {
    id: 'margaritas', label: 'Collar de margaritas', vibes: ['cottagecore', 'hippie'], price: 80, colors: ['#FFFFFF'],
    draw: (g, k) => {
      const nk = neckGeo(g);
      const n = Math.round((nk.R - nk.L) / 13);
      let s = '', leaves = '';
      for (let i = 0; i <= n; i++) {
        const [x, y] = nk.pt(i / n, 1);
        if (i < n) { const [x2, y2] = nk.pt((i + 0.5) / n, 1); leaves += P('M0 0 C2.6 -3 7 -3 9 0 C7 3 2.6 3 0 0Z', { fill: '#7CC48A', stroke: '#3F7D50', 'stroke-width': 1, 'data-r': 'part', transform: T(x2 - 4, y2 + 1, i % 2 ? -20 : 25, 1) }); }
        s += flower(x, y, 6.2, k.c1, i * 20, '#FFC94D');
      }
      return { front: clipBody(g, line(nk.curve(1), '#5FA66A', 1.8) + leaves + s) };
    },
  },
  {
    id: 'candado', label: 'Collar con candado', vibes: ['rockera', 'y2k', 'gotica'], price: 90, colors: [SILVER, '#221C27'],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g), cy = nk.cy;
      const lw = 11 * S, lh = 9.5 * S, ly = cy + 6;
      return {
        front: clipBody(g, part(nk.band(6), k.c2) + skipPx(stitch(nk.curve(-1.6), seamOf(k.c2), 1)) + line(nk.curve(-2), lightOf(k.c2, 0.8), 1, { opacity: 0.6 }))
          + Cir(100, cy + 1.8, 2.6, { fill: 'none', stroke: shade(k.c1, -1.6), 'stroke-width': 1.6, 'data-r': 'line' })
          + line(`M${f(100 - lw * 0.3)} ${f(ly)} v${f(-lh * 0.35)} a${f(lw * 0.3)} ${f(lw * 0.3)} 0 0 1 ${f(lw * 0.6)} 0 v${f(lh * 0.35)}`, shade(k.c1, -1.8), 2.4)
          + part(rr(100 - lw / 2, ly, lw, lh, 2), k.c1, { stroke: shade(k.c1, -2.4), 'stroke-width': 1.6 })
          + tone(rr(100 + lw * 0.1, ly, lw * 0.4, lh, 2), '#2A1C30', 0.16)
          + dot(100, ly + lh * 0.42, 1.4, shade(k.c1, -2.4)) + line(`M100 ${f(ly + lh * 0.45)} v${f(lh * 0.28)}`, shade(k.c1, -2.4), 1.2)
          + line(`M${f(100 - lw * 0.32)} ${f(ly + 2)} v${f(lh * 0.5)}`, '#FFFFFF', 1.3, { opacity: 0.85 }),
      };
    },
  },
  {
    id: 'cristal', label: 'Collar de cristal', vibes: ['celestial', 'aesthetic'], price: 100, colors: ['#B8A1FF', GOLD],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g), cy = nk.cy + 4;
      const w = 7 * S, h = 20 * S;
      // cristal de cuarzo: punta arriba y abajo, facetas de luz y sombra
      const gem = `M100 ${f(cy)} L${f(100 + w)} ${f(cy + h * 0.28)} L${f(100 + w * 0.8)} ${f(cy + h * 0.78)} L100 ${f(cy + h)} L${f(100 - w * 0.8)} ${f(cy + h * 0.78)} L${f(100 - w)} ${f(cy + h * 0.28)}Z`;
      return {
        front: chainLine(g, nk, k.c2, 1.8)
          + part(gem, k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.6 })
          + flat(`M100 ${f(cy)} L${f(100 - w)} ${f(cy + h * 0.28)} L${f(100 - w * 0.8)} ${f(cy + h * 0.78)} L100 ${f(cy + h)} L${f(100 - w * 0.1)} ${f(cy + h * 0.5)}Z`, lightOf(k.c1, 0.7))
          + flat(`M100 ${f(cy + h)} L${f(100 + w * 0.8)} ${f(cy + h * 0.78)} L${f(100 + w * 0.35)} ${f(cy + h * 0.55)}Z`, shade(k.c1, -0.8))
          + line(`M${f(100 - w * 0.55)} ${f(cy + h * 0.32)} L${f(100 - w * 0.45)} ${f(cy + h * 0.66)}`, '#FFFFFF', 1.4, { opacity: 0.9 })
          + part(rr(100 - w * 0.7, cy - 2.4, w * 1.4, 3.6, 1), k.c2, { stroke: shade(k.c2, -2.2), 'stroke-width': 1.1 })
          + flat(sparkleD(100 + w * 1.6, cy + h * 0.3, 2.2), '#FFFFFF'),
      };
    },
  },
  {
    id: 'concha', label: 'Collar de conchitas', vibes: ['playera'], price: 70, colors: ['#FFE3D3'],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g);
      // conchas de abanico con sus estrías y cuentas entre medio
      const shell = (x, y, r, rot) => G({ transform: T(x, y, rot, r / 6) },
        part('M-6 1 C-7 -4 -3 -7.5 0 -7.5 C3 -7.5 7 -4 6 1 L2 3.5 L-2 3.5Z', k.c1, { 'stroke-width': 1.4, stroke: shade(k.c1, -2.4) })
        + line('M0 -6.5 V2.5 M-3 -5.6 L-1.2 2.5 M3 -5.6 L1.2 2.5 M-5.4 -2.6 L-2 2.6 M5.4 -2.6 L2 2.6', shade(k.c1, -1.2), 0.9)
        + part('M-2.6 3 h5.2 v2.4 h-5.2Z', shade(k.c1, -0.4), { 'stroke-width': 1, stroke: shade(k.c1, -2.4) }));
      let s = '';
      [0.3, 0.4, 0.6, 0.7].forEach((t, i) => { const [x, y] = nk.pt(t, 3); s += shell(x, y + 4, 5.5 * S, (t - 0.5) * 50 + (i % 2 ? 6 : -6)); });
      [0.2, 0.35, 0.45, 0.55, 0.65, 0.8].forEach((t, i) => { const [x, y] = nk.pt(t, 1); s += ball(x, y, 1.9, i % 2 ? '#7FD1D8' : '#FFD6A5', { 'stroke-width': 1 }); });
      return { front: clipBody(g, line(nk.curve(1), '#B08A5E', 1.6) + s) + shell(100, nk.cy + 7, 7.4 * S, 0) };
    },
  },
  {
    id: 'babero', label: 'Babero', vibes: ['kawaii'], price: 50, colors: ['#FFFFFF', '#FF9EB5'],
    draw: (g, k) => {
      const nk = neckGeo(g), { y, cy } = nk;
      const w = g.w * 0.24;
      const d = `M${f(100 - w)} ${f(y - 1)} Q100 ${f(y + 9)} ${f(100 + w)} ${f(y - 1)} C${f(100 + w + 5)} ${f(cy + 12)} ${f(100 + w * 0.55)} ${f(cy + 21)} 100 ${f(cy + 21)} C${f(100 - w * 0.55)} ${f(cy + 21)} ${f(100 - w - 5)} ${f(cy + 12)} ${f(100 - w)} ${f(y - 1)}Z`;
      return {
        front: clipBody(g, line(nk.curve(-1), k.c2, 2.4))
          + part(d, k.c1) + clipTo(d, tone(`M${f(100 - w - 6)} ${f(y - 2)} Q100 ${f(y + 9)} ${f(100 + w + 6)} ${f(y - 2)} L${f(100 + w + 6)} ${f(y + 3)} Q100 ${f(y + 14)} ${f(100 - w - 6)} ${f(y + 3)}Z`, '#2A1C30', 0.12))
          + skipPx(stitch(`M${f(100 - w + 3)} ${f(y + 2.5)} C${f(100 - w)} ${f(cy + 11)} ${f(100 - w * 0.5)} ${f(cy + 18)} 100 ${f(cy + 18)} C${f(100 + w * 0.5)} ${f(cy + 18)} ${f(100 + w)} ${f(cy + 11)} ${f(100 + w - 3)} ${f(y + 2.5)}`, k.c2, 1.2))
          + part(heartD(100, cy + 10, 5), k.c2, { 'stroke-width': 1.3, stroke: shade(k.c2, -2) }) + shine(98, cy + 8, 1),
      };
    },
  },
];
