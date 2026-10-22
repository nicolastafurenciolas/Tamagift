// Cuello: collares, lazos, cuello marinero… (los nuevos).
// La "línea del cuello" (g.neckY) es una banda que envuelve el cuerpo
// debajo de la boca; lo que cae por delante cuelga del centro.

import { G, P, Ell, Cir, OUT, GOLD, GOLD_D, SILVER, SILVER_D, PEARL, shade, mixc, f, part, flat, line, shine, dot, ball, heartD, starD, moonD, bow, flower, clipBody } from './kit.js';

const geo = (g) => {
  const y = g.neckY, sag = 5;
  return { y, sag, cy: y + sag, L: g.l - 6, R: g.r + 6 };
};
// Punto de la banda del cuello en t (0 izq … 1 der)
const along = (g, t, dy = 0) => {
  const { y, sag, L, R } = geo(g);
  return [L + (R - L) * t, y + dy + sag * 2 * (1 - Math.pow(2 * t - 1, 2))];
};
const strand = (g, col, w = 2) => {
  const { y, sag, L, R } = geo(g);
  return clipBody(g, P(`M${f(L)} ${f(y)} Q100 ${f(y + sag * 2.4)} ${f(R)} ${f(y)}`, { fill: 'none', stroke: col, 'stroke-width': w, 'data-r': 'line' }));
};

export const NECK_ITEMS = [
  {
    id: 'perlas', label: 'Collar de perlas', vibes: ['coquette', 'princesa', 'aesthetic'], price: 120, colors: [PEARL],
    draw: (g, k) => {
      const n = Math.round(g.w / 9);
      let s = '';
      for (let i = 0; i <= n; i++) {
        const [x, y] = along(g, i / n, 1);
        s += Cir(x, y, 3.6, { fill: k.c1, stroke: mixc(k.c1, '#6E5A4A', 0.6), 'stroke-width': 1.3, 'data-r': 'part' }) + shine(x - 1, y - 1.1, 1.1);
      }
      return { front: clipBody(g, s) };
    },
  },
  {
    id: 'lazoCuello', label: 'Lazo coquette', vibes: ['coquette', 'kawaii'], price: 75, colors: ['#FF9EC4'],
    draw: (g, k) => { const { cy } = geo(g); return { front: bow(100, cy + 1, 0, 0.95, k.c1) }; },
  },
  {
    id: 'cuelloMarinero', label: 'Cuello marinero', vibes: ['otaku', 'playera'], price: 110, colors: ['#2E4A8A', '#D9364F'],
    draw: (g, k) => {
      const { cy, L, R, y } = geo(g);
      const flapL = `M${f(L)} ${f(y - 8)} Q${f(L + 20)} ${f(y + 2)} 100 ${f(cy + 16)} L${f(100 - 7)} ${f(cy + 18)} Q${f(L + 14)} ${f(y + 12)} ${f(L)} ${f(y + 6)}Z`;
      const flapR = `M${f(R)} ${f(y - 8)} Q${f(R - 20)} ${f(y + 2)} 100 ${f(cy + 16)} L${f(100 + 7)} ${f(cy + 18)} Q${f(R - 14)} ${f(y + 12)} ${f(R)} ${f(y + 6)}Z`;
      return {
        front: clipBody(g, part(flapL, k.c1) + part(flapR, k.c1) + line(`M${f(L)} ${f(y)} Q${f(L + 18)} ${f(y + 8)} ${f(100 - 4)} ${f(cy + 13)} M${f(R)} ${f(y)} Q${f(R - 18)} ${f(y + 8)} ${f(100 + 4)} ${f(cy + 13)}`, '#FFFFFF', 1.8, { opacity: 0.9 }))
          + bow(100, cy + 16, 0, 0.7, k.c2),
      };
    },
  },
  {
    id: 'corazonColgante', label: 'Collar de corazón', vibes: ['kawaii', 'y2k', 'coquette'], price: 85, colors: ['#FF6F91', SILVER],
    draw: (g, k) => { const { cy } = geo(g); return { front: strand(g, k.c2, 2.4) + part(heartD(100, cy + 10, 8.5), k.c1, { stroke: shade(k.c1, -2) }) + shine(96.8, cy + 6.6, 1.8) }; },
  },
  {
    id: 'lunaColgante', label: 'Collar de luna', vibes: ['celestial', 'gotica'], price: 95, colors: [GOLD],
    draw: (g, k) => { const { cy } = geo(g); return { front: strand(g, shade(k.c1, -1.2), 2.2) + part(moonD(100, cy + 11, 9), k.c1, { stroke: shade(k.c1, -2.2) }) + part(starD(108, cy + 5, 3.4), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1 }) }; },
  },
  {
    id: 'margaritas', label: 'Collar de margaritas', vibes: ['cottagecore', 'hippie'], price: 80, colors: ['#FFFFFF'],
    draw: (g, k) => {
      const n = Math.round(g.w / 15);
      let s = '';
      for (let i = 0; i <= n; i++) { const [x, y] = along(g, i / n); s += flower(x, y, 5.5, k.c1, i * 20, '#FFC94D'); }
      return { front: clipBody(g, line(`M${f(geo(g).L)} ${f(geo(g).y)} Q100 ${f(geo(g).y + 12)} ${f(geo(g).R)} ${f(geo(g).y)}`, '#6CBF6A', 1.8) + s) };
    },
  },
  {
    id: 'candado', label: 'Collar con candado', vibes: ['rockera', 'y2k', 'gotica'], price: 90, colors: [SILVER, '#221C27'],
    draw: (g, k) => {
      const { cy, y, L, R, sag } = geo(g);
      const band = `M${f(L)} ${f(y - 2.5)} Q100 ${f(y - 2.5 + sag * 2)} ${f(R)} ${f(y - 2.5)} L${f(R)} ${f(y + 2.5)} Q100 ${f(y + 2.5 + sag * 2)} ${f(L)} ${f(y + 2.5)}Z`;
      return { front: clipBody(g, part(band, k.c2)) + part(`M${f(100 - 5.5)} ${f(cy + 6)} h11 v9 q0 2 -2 2 h-7 q-2 0 -2 -2Z`, k.c1, { stroke: SILVER_D }) + line(`M${f(100 - 3.2)} ${f(cy + 6)} v-3 a3.2 3.2 0 0 1 6.4 0 v3`, SILVER_D, 2) + dot(100, cy + 10.6, 1.3, SILVER_D) };
    },
  },
  {
    id: 'cristal', label: 'Collar de cristal', vibes: ['celestial', 'aesthetic'], price: 100, colors: ['#B8A1FF', GOLD],
    draw: (g, k) => {
      const { cy } = geo(g);
      return { front: strand(g, shade(k.c2, -1), 2.2) + part(`M100 ${f(cy + 3)} L${f(106)} ${f(cy + 10)} L100 ${f(cy + 24)} L${f(94)} ${f(cy + 10)}Z`, k.c1, { stroke: shade(k.c1, -2) }) + flat(`M100 ${f(cy + 3)} L${f(103)} ${f(cy + 10)} L100 ${f(cy + 21)}Z`, mixc(k.c1, '#FFFFFF', 0.45)) + ball(100, cy + 3, 2.6, k.c2) };
    },
  },
  {
    id: 'concha', label: 'Collar de conchitas', vibes: ['playera'], price: 70, colors: ['#FFE3D3'],
    draw: (g, k) => {
      const n = Math.round(g.w / 18);
      let s = '';
      for (let i = 1; i < n; i++) {
        const [x, y] = along(g, i / n, 2);
        s += part(`M${f(x - 4)} ${f(y + 3)} Q${f(x)} ${f(y - 6)} ${f(x + 4)} ${f(y + 3)} Q${f(x)} ${f(y + 5)} ${f(x - 4)} ${f(y + 3)}Z`, k.c1, { 'stroke-width': 1.4 }) + line(`M${f(x)} ${f(y - 3)} V${f(y + 3)} M${f(x - 2)} ${f(y - 1)} l1 3 M${f(x + 2)} ${f(y - 1)} l-1 3`, shade(k.c1, -1.4), 0.8);
      }
      return { front: strand(g, '#C8A57A', 1.4) + clipBody(g, s) };
    },
  },
  {
    id: 'babero', label: 'Babero', vibes: ['kawaii'], price: 50, colors: ['#FFFFFF', '#FF9EB5'],
    draw: (g, k) => {
      const { cy, y } = geo(g);
      const w = g.w * 0.22;
      return {
        front: part(`M${f(100 - w)} ${f(y - 2)} Q100 ${f(y + 4)} ${f(100 + w)} ${f(y - 2)} C${f(100 + w + 4)} ${f(cy + 14)} ${f(100 + w * 0.5)} ${f(cy + 22)} 100 ${f(cy + 22)} C${f(100 - w * 0.5)} ${f(cy + 22)} ${f(100 - w - 4)} ${f(cy + 14)} ${f(100 - w)} ${f(y - 2)}Z`, k.c1)
          + flat(heartD(100, cy + 11, 5), k.c2) + line(`M${f(100 - w + 3)} ${f(y + 2)} Q100 ${f(y + 7)} ${f(100 + w - 3)} ${f(y + 2)}`, k.c2, 1.6, { 'stroke-dasharray': '2 2.5' }),
      };
    },
  },
];
