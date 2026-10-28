// Espalda: alas, mochilas, capas y caparazones. Se dibujan detrás del
// cuerpo (solo asoma lo que sale de la silueta) y, si hace falta, una
// parte por delante (correas, el cierre de la capa).

import { G, P, Ell, Cir, OUT, GOLD, GOLD_D, shade, mixc, f, T, part, flat, line, shine, dot, ball, disc, starD, sparkleD, heartD, clipBody } from './kit.js';
import { mirrorX as mx } from '../../svg.js';

const mirror = (s) => mx(s);

export const BACK_ITEMS = [
  {
    id: 'alasHada', label: 'Alas de hada', vibes: ['kawaii', 'celestial', 'cottagecore'], price: 170, colors: ['#CDEBFF', '#FFB6E1'],
    draw: (g, k) => {
      const y = g.ys - (g.ys - g.top) * 0.55, x = g.l + 10;
      const up = P(`M${f(x)} ${f(y)} C${f(x - 16)} ${f(y - 30)} ${f(x - 40)} ${f(y - 34)} ${f(x - 40)} ${f(y - 18)} C${f(x - 40)} ${f(y - 6)} ${f(x - 20)} ${f(y + 2)} ${f(x)} ${f(y + 4)}Z`, { fill: k.c1, 'fill-opacity': 0.8, stroke: mixc(k.c1, '#5A6A9A', 0.6), 'stroke-width': 2, 'data-r': 'part' });
      const low = P(`M${f(x)} ${f(y + 6)} C${f(x - 22)} ${f(y + 8)} ${f(x - 30)} ${f(y + 26)} ${f(x - 20)} ${f(y + 30)} C${f(x - 10)} ${f(y + 32)} ${f(x - 4)} ${f(y + 20)} ${f(x + 2)} ${f(y + 12)}Z`, { fill: k.c2, 'fill-opacity': 0.8, stroke: mixc(k.c2, '#7A4A7A', 0.6), 'stroke-width': 2, 'data-r': 'part' });
      const veins = line(`M${f(x - 2)} ${f(y)} C${f(x - 14)} ${f(y - 14)} ${f(x - 26)} ${f(y - 20)} ${f(x - 34)} ${f(y - 18)} M${f(x)} ${f(y + 8)} C${f(x - 10)} ${f(y + 14)} ${f(x - 16)} ${f(y + 22)} ${f(x - 19)} ${f(y + 27)}`, '#FFFFFF', 1.4, { opacity: 0.85 });
      const one = up + low + veins + flat(sparkleD(x - 30, y - 22, 2.6), '#FFFFFF');
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'alasAngel', label: 'Alas de ángel', vibes: ['princesa', 'coquette', 'celestial'], price: 180, colors: ['#FFFFFF'],
    draw: (g, k) => {
      const wy = g.ys - 24, l = g.l;
      const feather = (dy, len) => `M${f(l + 8)} ${f(wy + dy)} C${f(l - len * 0.4)} ${f(wy + dy - 12)} ${f(l - len)} ${f(wy + dy - 6)} ${f(l - len)} ${f(wy + dy + 5)} C${f(l - len * 0.6)} ${f(wy + dy + 8)} ${f(l - len * 0.2)} ${f(wy + dy + 8)} ${f(l + 8)} ${f(wy + dy + 10)}Z`;
      const one = part(feather(-10, 38), k.c1, { stroke: '#8A84A8' }) + part(feather(-1, 32), mixc(k.c1, '#E8E4FF', 0.5), { stroke: '#8A84A8' }) + part(feather(8, 25), k.c1, { stroke: '#8A84A8' });
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'alasMurcielago', label: 'Alas de murciélago', vibes: ['gotica'], price: 160, colors: ['#3A3044'],
    draw: (g, k) => {
      const y = g.ys - 20, l = g.l;
      const one = part(`M${f(l + 10)} ${f(y)} C${f(l - 6)} ${f(y - 24)} ${f(l - 28)} ${f(y - 22)} ${f(l - 36)} ${f(y - 8)} C${f(l - 28)} ${f(y - 8)} ${f(l - 26)} ${f(y)} ${f(l - 28)} ${f(y + 6)} C${f(l - 20)} ${f(y + 2)} ${f(l - 14)} ${f(y + 6)} ${f(l - 14)} ${f(y + 12)} C${f(l - 6)} ${f(y + 6)} ${f(l + 2)} ${f(y + 8)} ${f(l + 10)} ${f(y + 10)}Z`, k.c1)
        + line(`M${f(l + 6)} ${f(y + 2)} L${f(l - 28)} ${f(y - 6)} M${f(l + 6)} ${f(y + 4)} L${f(l - 24)} ${f(y + 4)} M${f(l + 6)} ${f(y + 6)} L${f(l - 13)} ${f(y + 10)}`, shade(k.c1, 1.4), 1.2, { opacity: 0.8 });
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'alasMariposa', label: 'Alas de mariposa', vibes: ['y2k', 'cottagecore', 'kawaii'], price: 170, colors: ['#FF9EC4', '#8FD3F5'],
    draw: (g, k) => {
      const y = g.ys - (g.ys - g.top) * 0.5, x = g.l + 10;
      const up = part(`M${f(x)} ${f(y)} C${f(x - 10)} ${f(y - 34)} ${f(x - 44)} ${f(y - 30)} ${f(x - 38)} ${f(y - 8)} C${f(x - 34)} ${f(y + 4)} ${f(x - 14)} ${f(y + 4)} ${f(x)} ${f(y + 4)}Z`, k.c1);
      const low = part(`M${f(x)} ${f(y + 6)} C${f(x - 26)} ${f(y + 6)} ${f(x - 32)} ${f(y + 28)} ${f(x - 18)} ${f(y + 30)} C${f(x - 8)} ${f(y + 31)} ${f(x - 2)} ${f(y + 18)} ${f(x + 2)} ${f(y + 10)}Z`, k.c2);
      const spots = Cir(x - 24, y - 14, 5.5, { fill: mixc(k.c1, '#FFFFFF', 0.55), 'data-r': 'flat' }) + Cir(x - 33, y - 6, 3, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'flat' }) + Cir(x - 16, y + 20, 3.6, { fill: mixc(k.c2, '#FFFFFF', 0.5), 'data-r': 'flat' });
      const one = up + low + spots;
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'mochila', label: 'Mochila', vibes: ['deportiva', 'kawaii', 'academia'], price: 120, colors: ['#FF8FAB', '#FFE07A'],
    draw: (g, k) => {
      const x = g.r - 6, y = g.ys - 10;
      return {
        back: part(`M${f(x - 8)} ${f(y - 22)} Q${f(x - 8)} ${f(y - 30)} ${f(x + 6)} ${f(y - 30)} Q${f(x + 22)} ${f(y - 30)} ${f(x + 22)} ${f(y - 16)} L${f(x + 22)} ${f(y + 18)} Q${f(x + 22)} ${f(y + 24)} ${f(x + 14)} ${f(y + 24)} L${f(x - 8)} ${f(y + 24)}Z`, k.c1)
          + part(`M${f(x + 8)} ${f(y - 2)} h14 v14 q0 4 -4 4 h-10Z`, shade(k.c1, -0.4)) + ball(x + 15, y + 4, 1.8, k.c2),
        front: clipBody(g, line(`M${f(g.r - 4)} ${f(g.face.y + 2)} Q${f(g.r - 14)} ${f(g.face.y + 26)} ${f(g.r - 8)} ${f(176)}`, shade(k.c1, -0.4), 4.5)),
      };
    },
  },
  {
    id: 'mochilaOso', label: 'Mochila de osito', vibes: ['kawaii'], price: 140, colors: ['#C08A62'],
    draw: (g, k) => {
      const x = g.r + 6, y = g.ys - 12;
      const light = mixc(k.c1, '#FFFFFF', 0.45);
      return {
        back: disc(x - 9, y - 22, 6, 6, k.c1) + disc(x + 9, y - 22, 6, 6, k.c1) + disc(x, y - 6, 17, 18, k.c1)
          + Ell(x, y - 2, 7, 5.5, { fill: light, 'data-r': 'flat' }) + dot(x - 6, y - 10, 1.8, OUT) + dot(x + 6, y - 10, 1.8, OUT) + Ell(x, y - 4, 2.2, 1.6, { fill: OUT, 'data-r': 'flat' }),
        front: clipBody(g, line(`M${f(g.r - 4)} ${f(g.face.y + 2)} Q${f(g.r - 14)} ${f(g.face.y + 26)} ${f(g.r - 8)} ${f(176)}`, shade(k.c1, -0.6), 4.5)),
      };
    },
  },
  {
    id: 'capaEstrellas', label: 'Capa de estrellas', vibes: ['celestial', 'gotica', 'princesa'], price: 190, colors: ['#2E2A6A', '#FFD45C'],
    draw: (g, k) => {
      const y = g.neckY - 6;
      const d = `M${f(g.l + 10)} ${f(y)} C${f(g.l - 8)} ${f(y + 14)} ${f(g.l - 14)} ${f(y + 30)} ${f(g.l - 12)} ${f(186)} L${f(g.r + 12)} ${f(186)} C${f(g.r + 14)} ${f(y + 30)} ${f(g.r + 8)} ${f(y + 14)} ${f(g.r - 10)} ${f(y)}Z`;
      const stars = [[g.l - 6, y + 22], [g.r + 6, y + 28], [g.l - 4, 174], [g.r + 4, 170]].map(([x, yy]) => flat(starD(x, yy, 3.2), k.c2)).join('');
      return { back: part(d, k.c1) + stars, front: ball(100, g.neckY + 4, 4.5, k.c2) + shine(98.6, g.neckY + 2.6, 1.2) };
    },
  },
  {
    id: 'caparazon', label: 'Caparazón de tortuga', vibes: ['kawaii', 'playera'], price: 130, colors: ['#8ED07A', '#5A9A4A'],
    draw: (g, k) => {
      const cx = 100, cy = g.ys - 4, rx = g.w / 2 + 10, ry = (182 - g.top) * 0.55;
      let plates = '';
      [[-0.5, -0.3], [0, -0.55], [0.5, -0.3], [-0.62, 0.25], [0.62, 0.25]].forEach(([fx, fy2]) => { plates += disc(cx + rx * fx, cy + ry * fy2, rx * 0.22, ry * 0.2, k.c2, { 'stroke-width': 1.6 }); });
      return { back: disc(cx, cy, rx, ry, k.c1) + plates };
    },
  },
];
