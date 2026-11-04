// Espalda: alas, mochilas, capas y caparazones. Se dibujan detrás del
// cuerpo (solo asoma lo que sale de la silueta) y, si hace falta, una
// parte por delante (correas, el cierre de la capa).
//
// Las alas nacen de la espalda a media altura y se abren grandes hacia
// los costados (se tienen que leer detrás de una mochi redonda); las
// mochilas asoman por un costado con su asa y su bolsillo; las capas
// caen hasta el piso con sus pliegues y el forro de otro color.

import {
  BOTTOM, Ell, OUT, P, ball, clipBody, clipTo, disc, dot, ellD, f, flat, lightOf, line, lumOf,
  mixc, onlyPx, part, puffStarD, rr, shade, shine, skipPx, sparkleD, stitch, tone,
} from './kit.js';
import { mirrorX as mx } from '../../svg.js';

const mirror = (s) => mx(s);
const S = (g) => Math.max(0.85, Math.min(1.1, g.w / 144));
// Correa de mochila por delante (abraza el costado derecho).
const strapFront = (g, col) => clipBody(g, P(`M${f(g.r - 2)} ${f(g.face.y - 2)} Q${f(g.r - 15)} ${f(g.face.y + 24)} ${f(g.r - 9)} 178`, { fill: 'none', stroke: OUT, 'stroke-width': 7.5, 'stroke-linecap': 'round', 'data-r': 'line' })
  + line(`M${f(g.r - 2)} ${f(g.face.y - 2)} Q${f(g.r - 15)} ${f(g.face.y + 24)} ${f(g.r - 9)} 178`, col, 5)
  + skipPx(stitch(`M${f(g.r - 2)} ${f(g.face.y - 2)} Q${f(g.r - 15)} ${f(g.face.y + 24)} ${f(g.r - 9)} 178`, lightOf(col, 0.7), 1)));

export const BACK_ITEMS = [
  {
    id: 'alasHada', label: 'Alas de hada', vibes: ['kawaii', 'celestial', 'cottagecore'], price: 170, colors: ['#CDEBFF', '#FFB6E1'],
    draw: (g, k) => {
      const s = S(g), y = g.ys - (g.ys - g.top) * 0.55, x = g.l + 12;
      // ala de arriba grande y redonda, la de abajo chica; tul translúcido con nervaduras
      const upD = `M${f(x)} ${f(y)} C${f(x - 14 * s)} ${f(y - 34 * s)} ${f(x - 46 * s)} ${f(y - 42 * s)} ${f(x - 48 * s)} ${f(y - 22 * s)} C${f(x - 50 * s)} ${f(y - 6 * s)} ${f(x - 26 * s)} ${f(y + 3)} ${f(x)} ${f(y + 5)}Z`;
      const lowD = `M${f(x)} ${f(y + 6)} C${f(x - 24 * s)} ${f(y + 8)} ${f(x - 36 * s)} ${f(y + 28 * s)} ${f(x - 24 * s)} ${f(y + 34 * s)} C${f(x - 12 * s)} ${f(y + 38 * s)} ${f(x - 4)} ${f(y + 22 * s)} ${f(x + 2)} ${f(y + 13)}Z`;
      const edge1 = mixc(k.c1, '#5A6A9A', 0.6), edge2 = mixc(k.c2, '#7A4A7A', 0.6);
      const wing = (d, c, e) => P(d, { fill: c, 'fill-opacity': 0.85, stroke: e, 'stroke-width': 2, 'data-r': 'part', 'data-skip': 'pixel' }) + onlyPx(part(d, mixc(c, '#FFFFFF', 0.15), { stroke: e }));
      const veins = line(`M${f(x - 2)} ${f(y + 1)} C${f(x - 14 * s)} ${f(y - 14 * s)} ${f(x - 28 * s)} ${f(y - 24 * s)} ${f(x - 40 * s)} ${f(y - 26 * s)} M${f(x - 4)} ${f(y + 2)} C${f(x - 18 * s)} ${f(y - 4 * s)} ${f(x - 30 * s)} ${f(y - 8 * s)} ${f(x - 42 * s)} ${f(y - 10 * s)} M${f(x)} ${f(y + 9)} C${f(x - 10 * s)} ${f(y + 15 * s)} ${f(x - 16 * s)} ${f(y + 24 * s)} ${f(x - 22 * s)} ${f(y + 30 * s)}`, '#FFFFFF', 1.4, { opacity: 0.9 });
      const one = wing(upD, k.c1, edge1) + wing(lowD, k.c2, edge2) + veins
        + clipTo(upD, tone(`M${f(x - 50 * s)} ${f(y - 10 * s)} C${f(x - 30 * s)} ${f(y)} ${f(x - 10)} ${f(y + 6)} ${f(x + 4)} ${f(y + 6)} L${f(x + 4)} ${f(y + 12)} L${f(x - 52 * s)} ${f(y + 12)}Z`, '#5A6A9A', 0.16))
        + flat(sparkleD(x - 36 * s, y - 28 * s, 3), '#FFFFFF') + flat(sparkleD(x - 22 * s, y + 26 * s, 2.2), '#FFFFFF') + dot(x - 44 * s, y - 14 * s, 1.2, '#FFFFFF');
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'alasAngel', label: 'Alas de ángel', vibes: ['princesa', 'coquette', 'celestial'], price: 180, colors: ['#FFFFFF'],
    draw: (g, k) => {
      const s = S(g), wy = g.ys - 26, l = g.l + 8;
      const ink = mixc(k.c1, '#7A74A0', 0.55), sh = mixc(k.c1, '#C8CCE8', 0.55);
      // tres filas de plumas que se abren en abanico, la de arriba con el borde festoneado
      const coverts = `M${f(l)} ${f(wy - 12)} C${f(l - 14 * s)} ${f(wy - 30 * s)} ${f(l - 40 * s)} ${f(wy - 30 * s)} ${f(l - 46 * s)} ${f(wy - 16 * s)}`
        + ` Q${f(l - 40 * s)} ${f(wy - 12 * s)} ${f(l - 40 * s)} ${f(wy - 8 * s)} Q${f(l - 32 * s)} ${f(wy - 6 * s)} ${f(l - 30 * s)} ${f(wy - 2 * s)} Q${f(l - 22 * s)} ${f(wy - 2 * s)} ${f(l - 18 * s)} ${f(wy + 2 * s)} Q${f(l - 10 * s)} ${f(wy)} ${f(l)} ${f(wy + 4)}Z`;
      const feather = (dy, len, w2) => `M${f(l)} ${f(wy + dy)} C${f(l - len * 0.4)} ${f(wy + dy - w2)} ${f(l - len)} ${f(wy + dy - w2 * 0.6)} ${f(l - len)} ${f(wy + dy + 3)} C${f(l - len * 0.62)} ${f(wy + dy + w2 * 0.7)} ${f(l - len * 0.25)} ${f(wy + dy + w2 * 0.6)} ${f(l)} ${f(wy + dy + w2 * 0.7)}Z`;
      const one = part(feather(6, 30 * s, 9), sh, { stroke: ink }) + part(feather(0, 40 * s, 10), k.c1, { stroke: ink }) + part(feather(-6, 48 * s, 10), sh, { stroke: ink })
        + part(coverts, k.c1, { stroke: ink })
        + line(`M${f(l - 4)} ${f(wy - 8)} C${f(l - 16 * s)} ${f(wy - 20 * s)} ${f(l - 30 * s)} ${f(wy - 22 * s)} ${f(l - 40 * s)} ${f(wy - 18 * s)}`, '#FFFFFF', 1.6, { opacity: 0.9 })
        + line(`M${f(l - 6)} ${f(wy + 1)} L${f(l - 44 * s)} ${f(wy - 2)} M${f(l - 6)} ${f(wy + 6)} L${f(l - 36 * s)} ${f(wy + 7)} M${f(l - 6)} ${f(wy + 11)} L${f(l - 26 * s)} ${f(wy + 13)}`, ink, 1, { opacity: 0.6 });
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'alasMurcielago', label: 'Alas de murciélago', vibes: ['gotica'], price: 160, colors: ['#3A3044'],
    draw: (g, k) => {
      const s = S(g), y = g.ys - 22, l = g.l + 10;
      // membrana entre los dedos, con el borde de abajo en arcos y la garrita arriba
      const d = `M${f(l)} ${f(y)} C${f(l - 8 * s)} ${f(y - 22 * s)} ${f(l - 28 * s)} ${f(y - 30 * s)} ${f(l - 44 * s)} ${f(y - 16 * s)} Q${f(l - 40 * s)} ${f(y - 6 * s)} ${f(l - 41 * s)} ${f(y + 2 * s)} Q${f(l - 34 * s)} ${f(y - 2 * s)} ${f(l - 29 * s)} ${f(y + 6 * s)} Q${f(l - 22 * s)} ${f(y + 2 * s)} ${f(l - 17 * s)} ${f(y + 11 * s)} Q${f(l - 9 * s)} ${f(y + 6 * s)} ${f(l)} ${f(y + 12)}Z`;
      const bone = lumOf(k.c1) < 0.25 ? mixc(k.c1, '#FFFFFF', 0.35) : shade(k.c1, -1.4);
      const one = part(d, k.c1) + clipTo(d, tone(`M${f(l - 50 * s)} ${f(y - 4 * s)} L${f(l + 4)} ${f(y + 4)} L${f(l + 4)} ${f(y + 20)} L${f(l - 50 * s)} ${f(y + 20)}Z`, '#0E0A16', 0.22))
        + line(`M${f(l + 2)} ${f(y + 2)} L${f(l - 43 * s)} ${f(y - 15 * s)} M${f(l + 2)} ${f(y + 3)} L${f(l - 40 * s)} ${f(y + 1 * s)} M${f(l + 2)} ${f(y + 5)} L${f(l - 29 * s)} ${f(y + 5 * s)} M${f(l + 2)} ${f(y + 7)} L${f(l - 17 * s)} ${f(y + 10 * s)}`, bone, 1.3, { opacity: 0.9 })
        + part(`M${f(l - 44 * s)} ${f(y - 16 * s)} l-3 -4 l4.5 1.5Z`, bone, { 'stroke-width': 1.2 });
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'alasMariposa', label: 'Alas de mariposa', vibes: ['y2k', 'cottagecore', 'kawaii'], price: 170, colors: ['#FF9EC4', '#8FD3F5'],
    draw: (g, k) => {
      const s = S(g), y = g.ys - (g.ys - g.top) * 0.5, x = g.l + 12;
      const upD = `M${f(x)} ${f(y)} C${f(x - 10 * s)} ${f(y - 38 * s)} ${f(x - 50 * s)} ${f(y - 36 * s)} ${f(x - 44 * s)} ${f(y - 10 * s)} C${f(x - 40 * s)} ${f(y + 4)} ${f(x - 16 * s)} ${f(y + 4)} ${f(x)} ${f(y + 4)}Z`;
      const lowD = `M${f(x)} ${f(y + 6)} C${f(x - 30 * s)} ${f(y + 6)} ${f(x - 36 * s)} ${f(y + 32 * s)} ${f(x - 20 * s)} ${f(y + 34 * s)} C${f(x - 9 * s)} ${f(y + 36 * s)} ${f(x - 2)} ${f(y + 20 * s)} ${f(x + 2)} ${f(y + 11)}Z`;
      const rim1 = shade(k.c1, -1.6), rim2 = shade(k.c2, -1.6);
      // borde oscuro con lunarcitos claros, ojo de color en cada ala
      const one = part(upD, k.c1) + clipTo(upD, P(upD, { fill: 'none', stroke: rim1, 'stroke-width': 7, 'data-r': 'line' }))
        + part(lowD, k.c2) + clipTo(lowD, P(lowD, { fill: 'none', stroke: rim2, 'stroke-width': 6, 'data-r': 'line' }))
        + disc(x - 26 * s, y - 16 * s, 6 * s, 5.5 * s, mixc(k.c1, '#FFFFFF', 0.55), { 'stroke-width': 1.3, stroke: rim1 }) + dot(x - 26 * s, y - 16 * s, 2.4 * s, k.c2)
        + dot(x - 41 * s, y - 14 * s, 1.5, '#FFFFFF') + dot(x - 36 * s, y - 27 * s, 1.5, '#FFFFFF') + dot(x - 24 * s, y + 30 * s, 1.4, '#FFFFFF')
        + disc(x - 17 * s, y + 20 * s, 4 * s, 3.6 * s, mixc(k.c2, '#FFFFFF', 0.5), { 'stroke-width': 1.2, stroke: rim2 })
        + line(`M${f(x - 4)} ${f(y + 1)} C${f(x - 14 * s)} ${f(y - 10 * s)} ${f(x - 22 * s)} ${f(y - 14 * s)} ${f(x - 30 * s)} ${f(y - 15 * s)}`, '#FFFFFF', 1.2, { opacity: 0.7 });
      return { back: one + mirror(one) };
    },
  },
  {
    id: 'mochila', label: 'Mochila', vibes: ['deportiva', 'kawaii', 'academia'], price: 120, colors: ['#FF8FAB', '#FFE07A'],
    draw: (g, k) => {
      const x = g.r - 10, y = g.ys - 12, w = 32, h = 44;
      // mochila escolar: cuerpo redondeado, asa arriba, tapa con hebilla y bolsillo con cierre
      const bodyD = rr(x, y - h / 2, w, h, 9);
      return {
        back: line(`M${f(x + 9)} ${f(y - h / 2 + 1)} q7 -10 14 0`, OUT, 4.6) + line(`M${f(x + 9)} ${f(y - h / 2 + 1)} q7 -10 14 0`, shade(k.c1, -0.6), 2.4)
          + part(bodyD, k.c1) + clipTo(bodyD, tone(`M${f(x + w - 8)} ${f(y - h)} H${f(x + w + 4)} V${f(y + h)} H${f(x + w - 8)}Z`, '#2A1C30', 0.18))
          + part(`M${f(x)} ${f(y - h / 2 + 9)} Q${f(x)} ${f(y - h / 2)} ${f(x + 9)} ${f(y - h / 2)} H${f(x + w - 9)} Q${f(x + w)} ${f(y - h / 2)} ${f(x + w)} ${f(y - h / 2 + 9)} V${f(y - 6)} Q${f(x + w / 2)} ${f(y + 1)} ${f(x)} ${f(y - 6)}Z`, shade(k.c1, 0.2))
          + part(rr(x + w / 2 - 3, y - 7, 6, 7, 1.5), k.c2, { 'stroke-width': 1.4 })
          + part(rr(x + 4, y + 4, w - 8, h / 2 - 8, 4), shade(k.c1, -0.25), { 'stroke-width': 1.6 })
          + line(`M${f(x + 7)} ${f(y + 7.5)} H${f(x + w - 7)}`, shade(k.c1, -1.6), 1.4) + ball(x + w - 9, y + 7.5, 1.6, k.c2, { 'stroke-width': 1 })
          + skipPx(stitch(`M${f(x + 3)} ${f(y - h / 2 + 12)} V${f(y + h / 2 - 6)}`, lightOf(k.c1, 0.7), 1)),
        front: strapFront(g, shade(k.c1, -0.4)),
      };
    },
  },
  {
    id: 'mochilaOso', label: 'Mochila de osito', vibes: ['kawaii'], price: 140, colors: ['#C08A62'],
    draw: (g, k) => {
      const x = g.r + 8, y = g.ys - 14;
      const light = mixc(k.c1, '#FFFFFF', 0.45);
      // cabeza de osito: orejas con su interior, hocico, ojitos con brillo y un cierre en la frente
      return {
        back: disc(x - 11, y - 24, 7.5, 7.5, k.c1) + disc(x + 11, y - 24, 7.5, 7.5, k.c1) + dot(x - 11, y - 24, 3.6, light) + dot(x + 11, y - 24, 3.6, light)
          + disc(x, y - 6, 20, 19.5, k.c1) + clipTo(ellD(x, y - 6, 20, 19.5), tone(`M${f(x + 6)} ${f(y - 30)} C${f(x + 24)} ${f(y - 20)} ${f(x + 24)} ${f(y + 6)} ${f(x + 10)} ${f(y + 16)} L${f(x + 26)} ${f(y + 16)} L${f(x + 26)} ${f(y - 30)}Z`, '#2A1C30', 0.18))
          + line(`M${f(x - 12)} ${f(y - 18)} Q${f(x)} ${f(y - 23)} ${f(x + 12)} ${f(y - 18)}`, shade(k.c1, -1.4), 1.4, { 'stroke-dasharray': '1.6 1.4' })
          + disc(x, y - 1, 8.5, 6.5, light, { 'stroke-width': 1.6 }) + Ell(x, y - 3, 2.8, 2, { fill: OUT, 'data-r': 'flat' })
          + line(`M${f(x)} ${f(y - 1)} v2 q-2 2 -3.5 1 M${f(x)} ${f(y + 1)} q2 2 3.5 1`, OUT, 1.2)
          + dot(x - 7.5, y - 10, 2.3, OUT) + dot(x + 7.5, y - 10, 2.3, OUT) + shine(x - 6.7, y - 11, 0.8) + shine(x + 8.3, y - 11, 0.8)
          + dot(x - 13, y - 3, 2.6, '#FF9EB5', { opacity: 0.7 }) + dot(x + 13, y - 3, 2.6, '#FF9EB5', { opacity: 0.7 }),
        front: strapFront(g, shade(k.c1, -0.6)),
      };
    },
  },
  {
    id: 'capaEstrellas', label: 'Capa de estrellas', vibes: ['celestial', 'gotica', 'princesa'], price: 190, colors: ['#2E2A6A', '#FFD45C'],
    draw: (g, k) => {
      const fy = g.face.y, fl = 18, y0 = fy - 8;
      // capa de maga: cuello alto en punta a los lados de la cabeza (con el
      // forro dorado a la vista) y la capa que se abre hasta el piso
      const half = `M100 ${f(y0 - 4)} L${f(g.l + 8)} ${f(y0)} C${f(g.l - 8)} ${f(y0 + 20)} ${f(g.l - fl)} ${f(BOTTOM - 20)} ${f(g.l - fl)} ${f(BOTTOM + 4)} Q${f(g.l - fl + 8)} ${f(BOTTOM)} ${f(g.l - 4)} ${f(BOTTOM + 5)} L100 ${f(BOTTOM + 5)}Z`;
      const collar = `M${f(g.l + 16)} ${f(y0 + 4)} C${f(g.l + 2)} ${f(y0 - 6)} ${f(g.l - 6)} ${f(y0 - 22)} ${f(g.l - 4)} ${f(y0 - 32)} C${f(g.l + 6)} ${f(y0 - 22)} ${f(g.l + 16)} ${f(y0 - 12)} ${f(g.l + 26)} ${f(y0 - 4)}Z`;
      const stars = [[g.l - 8, y0 + 26, 3.4], [g.l - 13, BOTTOM - 14, 2.8], [g.l - 3, BOTTOM - 26, 2.2]].map(([sx, sy, r]) => flat(puffStarD(sx, sy, r), k.c2)).join('');
      const one = part(half, k.c1) + clipTo(half, stars + line(`M${f(g.l - 4)} ${f(y0 + 24)} Q${f(g.l - 9)} ${f(y0 + 40)} ${f(g.l - 10)} ${f(BOTTOM + 2)}`, lightOf(k.c1, 1.2), 1.4, { opacity: 0.7 }))
        + part(`M${f(g.l - fl + 1)} ${f(BOTTOM - 6)} Q${f(g.l - fl + 6)} ${f(BOTTOM - 4)} ${f(g.l - 6)} ${f(BOTTOM)} L${f(g.l - 4)} ${f(BOTTOM + 5)} Q${f(g.l - fl + 8)} ${f(BOTTOM)} ${f(g.l - fl)} ${f(BOTTOM + 4)}Z`, k.c2, { 'stroke-width': 1.6 })
        + part(collar, k.c1) + part(`M${f(g.l + 16)} ${f(y0 + 2)} C${f(g.l + 5)} ${f(y0 - 6)} ${f(g.l)} ${f(y0 - 18)} ${f(g.l)} ${f(y0 - 26)} C${f(g.l + 8)} ${f(y0 - 18)} ${f(g.l + 15)} ${f(y0 - 10)} ${f(g.l + 22)} ${f(y0 - 4)}Z`, k.c2, { 'stroke-width': 1.4 });
      return {
        back: one + mirror(one) + tone(`M${f(g.r + 2)} ${f(y0)} L${f(g.r + fl + 4)} ${f(BOTTOM)} L${f(g.r - 2)} ${f(BOTTOM + 6)}Z`, '#0E0A28', 0.2),
        front: part(`M${f(100 - 9)} ${f(g.neckY - 1)} L100 ${f(g.neckY + 7)} L${f(100 + 9)} ${f(g.neckY - 1)}`, k.c1, { fill: 'none', 'stroke-width': 2.4 })
          + line(`M${f(100 - 8)} ${f(g.neckY + 1)} Q100 ${f(g.neckY + 5)} ${f(100 + 8)} ${f(g.neckY + 1)}`, k.c2, 1.4)
          + part(puffStarD(100, g.neckY + 6, 6.2), k.c2, { stroke: shade(k.c2, -2.2), 'stroke-width': 1.6 }) + shine(98, g.neckY + 4, 1.2),
      };
    },
  },
  {
    id: 'caparazon', label: 'Caparazón de tortuga', vibes: ['kawaii', 'playera'], price: 130, colors: ['#8ED07A', '#5A9A4A'],
    draw: (g, k) => {
      // caparazón ancho y abombado que asoma detrás: borde de escamas en
      // festón todo alrededor (se ve a los costados) y la fila de placas
      // hexagonales de arriba asomando sobre la cabeza
      const cx = 100, rx = g.w / 2 + 17, top = g.top - 30, cy = g.ys + 4, ry = cy - top;
      const rim = shade(k.c1, -0.45), n = 16;
      const at = (t, kk = 1) => { const a = Math.PI + t * Math.PI; return [cx + Math.cos(a) * rx * kk, cy + Math.sin(a) * ry * kk]; };
      let outer = '';
      for (let i = 0; i <= n; i++) {
        const [x, y] = at(i / n), [mx, my] = at((i - 0.5) / n, 1.07);
        outer += i ? ` Q${f(mx)} ${f(my)} ${f(x)} ${f(y)}` : `M${f(x)} ${f(y)}`;
      }
      const shellD = `${outer} L${f(cx + rx - 3)} ${f(BOTTOM - 4)} Q${f(cx)} ${f(BOTTOM + 8)} ${f(cx - rx + 3)} ${f(BOTTOM - 4)}Z`;
      const innerD = ellD(cx, cy + 2, rx * 0.9, ry * 0.9);
      let seams = '';
      for (let i = 1; i < n; i++) { const [x1, y1] = at(i / n), [x2, y2] = at(i / n, 0.9); seams += `M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2 + 2)}`; }
      const hex = (x, y, r) => { let d = ''; for (let i = 0; i < 6; i++) { const a = (i * 60 + 30) * Math.PI / 180; d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * r)} ${f(y + Math.sin(a) * r * 0.8)}`; } return `${d}Z`; };
      const hr = 10;
      const plates = [[0, top + 23], [-rx * 0.4, top + 31], [rx * 0.4, top + 31], [-rx * 0.7, top + 52], [rx * 0.7, top + 52]].map(([dx, y]) =>
        part(hex(cx + dx, y, hr), k.c2, { 'stroke-width': 1.7 }) + flat(hex(cx + dx - 1, y - 1, hr * 0.55), lightOf(k.c2, 0.5))).join('');
      return {
        back: part(shellD, rim) + clipTo(shellD, line(seams, shade(k.c1, -1.6), 1.4)
          + P(innerD, { fill: k.c1, stroke: shade(k.c1, -1.8), 'stroke-width': 1.6, 'data-r': 'part' }) + clipTo(innerD, plates)
          + tone(`M${f(cx + rx * 0.35)} ${f(top - 6)} C${f(cx + rx + 6)} ${f(top + 6)} ${f(cx + rx + 8)} ${f(cy)} ${f(cx + rx * 0.5)} ${f(BOTTOM)} L${f(cx + rx + 12)} ${f(BOTTOM)} L${f(cx + rx + 12)} ${f(top - 6)}Z`, '#1E3A1A', 0.22))
          + line(`M${f(cx - rx * 0.78)} ${f(cy - ry * 0.5)} C${f(cx - rx * 0.6)} ${f(cy - ry * 0.85)} ${f(cx - rx * 0.3)} ${f(top + 6)} ${f(cx - rx * 0.08)} ${f(top + 4)}`, '#FFFFFF', 2, { opacity: 0.5 }),
      };
    },
  },
];
