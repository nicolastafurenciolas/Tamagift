// Cabeza: diademas, gorros, pinzas, sombreros… (los nuevos; los de
// siempre siguen en accessories.js y entran al vestidor desde index.js).

import {
  G, P, Ell, Cir, OUT, GOLD, GOLD_D, SILVER, SILVER_D, PEARL, PEARL_D,
  shade, mixc, f, T, part, flat, line, shine, dot, ball, disc,
  heartD, starD, sparkleD, moonD, bow, flower, headband, onTop,
} from './kit.js';

const sc = (g) => Math.max(0.8, Math.min(1.12, g.w / 144));

// Cúpula de gorro (como el de lana): devuelve el contorno y medidas.
function dome(g, wFrac = 0.8, rise = 24) {
  const bw = g.w * wFrac, x1 = 100 - bw / 2, x2 = 100 + bw / 2;
  const ys = g.topAt(x1) + 7, top = g.top, yc = top + 9;
  const d = `M${f(x1)} ${f(ys)} C${f(x1 - 2)} ${f(top - rise * 0.6)} ${f(100 - bw * 0.28)} ${f(top - rise)} 100 ${f(top - rise)} C${f(100 + bw * 0.28)} ${f(top - rise)} ${f(x2 + 2)} ${f(top - rise * 0.6)} ${f(x2)} ${f(ys)} Q100 ${f(yc - 4)} ${f(x1)} ${f(ys)}Z`;
  const brim = `M${f(x1 - 3)} ${f(ys + 3)} Q100 ${f(yc + 2)} ${f(x2 + 3)} ${f(ys + 3)} L${f(x2 + 2)} ${f(ys - 8)} Q100 ${f(yc - 10)} ${f(x1 - 2)} ${f(ys - 8)}Z`;
  return { d, brim, x1, x2, ys, top, yc, bw };
}

// Orejitas sobre una diadema (izquierda dibujada; se espeja en x).
function earPair(g, xFrac, sink, local, rotK = 0.85, extraRot = 0) {
  const s = sc(g);
  // la derecha va espejada (scale -1 en x dentro del transform)
  const L = onTop(g, -xFrac, sink), R = onTop(g, xFrac, sink);
  return G({ transform: `translate(${f(L.x)} ${f(L.y)}) rotate(${f(L.rot * rotK - extraRot)}) scale(${s.toFixed(3)})` }, local)
    + G({ transform: `translate(${f(R.x)} ${f(R.y)}) rotate(${f(R.rot * rotK + extraRot)}) scale(${(-s).toFixed(3)} ${s.toFixed(3)})` }, local);
}

export const HEAD_ITEMS = [
  {
    id: 'orejasGato', label: 'Diadema de gatito', vibes: ['otaku', 'kawaii'], price: 90, colors: ['#3A3044', '#FF9EC4'],
    draw: (g, k) => ({
      top: headband(g, g.w * 0.4, 2, 8, k.c1)
        + earPair(g, 0.21, 5, part('M-11 6 L-4 -19 Q0 -24 4 -19 L11 6Z', k.c1) + flat('M-6 3 L-2 -10 Q0 -13 2 -10 L6 3Z', k.c2), 0.85),
    }),
  },
  {
    id: 'orejasConejo', label: 'Diadema de conejita', vibes: ['kawaii', 'coquette'], price: 95, colors: ['#FFFFFF', '#FFB6CC'],
    draw: (g, k) => ({
      top: earPair(g, 0.14, 6, part('M0 6 C-8 6 -9 -12 -8 -24 C-7 -36 -3 -42 0 -42 C3 -42 7 -36 8 -24 C9 -12 8 6 0 6Z', k.c1) + flat('M0 1 C-3.6 1 -4.6 -12 -4.2 -22 C-3.8 -31 -1.8 -35 0 -35 C1.8 -35 3.8 -31 4.2 -22 C4.6 -12 3.6 1 0 1Z', k.c2), 0.35, 9)
        + headband(g, g.w * 0.4, 2, 8, k.c1),
    }),
  },
  {
    id: 'orejasOso', label: 'Diadema de osito', vibes: ['kawaii'], price: 85, colors: ['#A9744F', '#F3D2B5'],
    draw: (g, k) => ({
      top: earPair(g, 0.25, 4, Cir(0, -5, 10, { fill: k.c1, stroke: OUT, 'stroke-width': 2.3, 'data-r': 'part' }) + Cir(0, -4.6, 5, { fill: k.c2, 'data-r': 'flat' }), 0.6)
        + headband(g, g.w * 0.4, 2, 8, k.c1),
    }),
  },
  {
    id: 'monoGrande', label: 'Moño coquette', vibes: ['coquette', 'princesa'], price: 80, colors: ['#FFB6CC'],
    draw: (g, k) => { const p = onTop(g, 0.17, 3); return { top: bow(p.x, p.y, p.rot * 0.6 + 6, 1.45 * sc(g), k.c1) }; },
  },
  {
    id: 'florPelo', label: 'Flor en el pelo', vibes: ['playera', 'aesthetic', 'coquette'], price: 70, colors: ['#FF7F9E'],
    draw: (g, k) => {
      const p = onTop(g, -0.24, 8);
      let s = '';
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        s += P(`M0 0 C${f(Math.cos(a - 0.5) * 16)} ${f(Math.sin(a - 0.5) * 16)} ${f(Math.cos(a + 0.5) * 16)} ${f(Math.sin(a + 0.5) * 16)} 0 0Z`, { fill: k.c1, stroke: OUT, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'data-r': 'part' });
      }
      s += line('M0 0 L0 -7 M0 0 L5 -5 M0 0 L-5 -5', '#FFE070', 1.6) + dot(0, -7, 1.6, '#FFE070') + dot(5, -5, 1.4, '#FFE070') + dot(-5, -5, 1.4, '#FFE070');
      return { top: G({ transform: T(p.x, p.y, p.rot * 0.5, sc(g)) }, part('M4 6 C12 4 19 8 21 14 C13 15 8 12 4 6Z', '#6CBF6A') + s) };
    },
  },
  {
    id: 'pinzasEstrella', label: 'Pinzas de estrellas', vibes: ['y2k', 'celestial'], price: 55, colors: ['#FFD45C'],
    draw: (g, k) => {
      const one = (xf, sink, r, rot) => { const p = onTop(g, xf, sink); return part(starD(p.x, p.y, r * sc(g)), k.c1, { stroke: shade(k.c1, -2), transform: `rotate(${rot} ${f(p.x)} ${f(p.y)})` }) + shine(p.x - r * 0.25, p.y - r * 0.3, r * 0.18); };
      return { top: one(-0.3, 10, 7, -12) + one(-0.19, 6, 5.5, 10) };
    },
  },
  {
    id: 'pinzasCorazon', label: 'Pinzas de corazón', vibes: ['kawaii', 'coquette', 'y2k'], price: 55, colors: ['#FF6F91'],
    draw: (g, k) => {
      const one = (xf, sink, s, rot) => { const p = onTop(g, xf, sink); return part(heartD(p.x, p.y, s * sc(g)), k.c1, { stroke: shade(k.c1, -2), transform: `rotate(${rot} ${f(p.x)} ${f(p.y)})` }) + shine(p.x - s * 0.4, p.y - s * 0.3, s * 0.2); };
      return { top: one(-0.29, 11, 6.5, -14) + one(-0.17, 6, 5, 8) };
    },
  },
  {
    id: 'perlas', label: 'Cintillo de perlas', vibes: ['coquette', 'princesa', 'aesthetic'], price: 110, colors: [PEARL],
    draw: (g, k) => {
      let s = '';
      const hw = g.w * 0.37, n = 11;
      for (let i = 0; i <= n; i++) {
        const x = 100 - hw + (2 * hw * i) / n, y = g.topAt(x) + 5;
        s += Cir(x, y, 3.7, { fill: k.c1, stroke: mixc(k.c1, '#6E5A4A', 0.6), 'stroke-width': 1.4, 'data-r': 'part' }) + shine(x - 1.1, y - 1.2, 1.1);
      }
      return { top: s };
    },
  },
  {
    id: 'gorroFresa', label: 'Gorro de fresa', vibes: ['kawaii', 'cottagecore'], price: 130, colors: ['#E8505E', '#6CBF6A'],
    draw: (g, k) => {
      const d = dome(g, 0.82, 26);
      const seeds = [[-0.28, -14], [-0.08, -20], [0.14, -16], [0.3, -8], [-0.18, -4], [0.04, -8], [0.22, 0]].map(([fx, dy]) => Ell(100 + d.bw * fx, d.top + dy, 1.4, 2.2, { fill: '#FFE29A', 'data-r': 'flat' })).join('');
      const leaves = [-1, 0, 1].map((i) => part(`M100 ${f(d.top - 24)} C${f(100 + i * 10 - 6)} ${f(d.top - 30)} ${f(100 + i * 14)} ${f(d.top - 32)} ${f(100 + i * 16)} ${f(d.top - 26)} C${f(100 + i * 10)} ${f(d.top - 22)} ${f(100 + i * 4)} ${f(d.top - 22)} 100 ${f(d.top - 24)}Z`, k.c2)).join('');
      return { top: part(d.d, k.c1) + seeds + line(`M${f(100 - d.bw * 0.3)} ${f(d.top - 12)} Q${f(100 - d.bw * 0.24)} ${f(d.top - 20)} ${f(100 - d.bw * 0.12)} ${f(d.top - 22)}`, '#FFFFFF', 2.4, { opacity: 0.6 }) + leaves + line(`M100 ${f(d.top - 25)} l2 -8`, shade(k.c2, -1), 2.6) };
    },
  },
  {
    id: 'gorroRana', label: 'Gorro de ranita', vibes: ['kawaii', 'otaku'], price: 130, colors: ['#8ED07A'],
    draw: (g, k) => {
      const d = dome(g, 0.82, 22);
      const eye = (s) => { const x = 100 + s * d.bw * 0.22, y = d.top - 22; return disc(x, y, 9, 8.4, k.c1) + Cir(x, y + 0.5, 4.6, { fill: '#FFFFFF', stroke: OUT, 'stroke-width': 1.4, 'data-r': 'part' }) + dot(x + 0.6, y + 1, 2.4, OUT) + shine(x + 1.4, y - 0.4, 0.8); };
      return { top: eye(-1) + eye(1) + part(d.d, k.c1) + line(`M${f(100 - 8)} ${f(d.top - 6)} Q100 ${f(d.top - 1)} ${f(100 + 8)} ${f(d.top - 6)}`, shade(k.c1, -2), 1.8) + dot(100 - d.bw * 0.3, d.top - 4, 3.2, '#FF9EB5', { opacity: 0.7 }) + dot(100 + d.bw * 0.3, d.top - 4, 3.2, '#FF9EB5', { opacity: 0.7 }) };
    },
  },
  {
    id: 'calabaza', label: 'Gorro de calabaza', vibes: ['temporada', 'gotica'], price: 120, colors: ['#F28C38', '#6CBF6A'],
    draw: (g, k) => {
      const d = dome(g, 0.84, 22);
      const ribs = [-0.24, 0, 0.24].map((fx) => line(`M${f(100 + d.bw * fx)} ${f(d.top - 20 + Math.abs(fx) * 18)} Q${f(100 + d.bw * fx * 1.2)} ${f(d.top - 6)} ${f(100 + d.bw * fx * 1.1)} ${f(d.yc - 4)}`, shade(k.c1, -1), 1.8, { opacity: 0.8 })).join('');
      return { top: part(d.d, k.c1) + ribs + part(`M98 ${f(d.top - 21)} L97 ${f(d.top - 31)} Q101 ${f(d.top - 33)} 103 ${f(d.top - 30)} L102 ${f(d.top - 21)}Z`, '#7A5A3A') + part(`M103 ${f(d.top - 27)} C112 ${f(d.top - 34)} 120 ${f(d.top - 30)} 118 ${f(d.top - 24)} C113 ${f(d.top - 22)} 107 ${f(d.top - 23)} 103 ${f(d.top - 27)}Z`, k.c2) };
    },
  },
  {
    id: 'navidad', label: 'Gorro navideño', vibes: ['temporada'], price: 100, colors: ['#D9364F'],
    draw: (g, k) => {
      const d = dome(g, 0.8, 18);
      const cone = `M${f(d.x1 + 4)} ${f(d.ys - 4)} C${f(d.x1 + 6)} ${f(d.top - 24)} ${f(100 + d.bw * 0.2)} ${f(d.top - 30)} ${f(d.x2 + 18)} ${f(d.top - 4)} C${f(100 + d.bw * 0.34)} ${f(d.top - 16)} ${f(d.x2 - 2)} ${f(d.top - 6)} ${f(d.x2 - 4)} ${f(d.ys - 4)}Z`;
      return { top: part(cone, k.c1) + part(d.brim, '#FFFFFF') + disc(d.x2 + 18, d.top - 2, 7, 7, '#FFFFFF') };
    },
  },
  {
    id: 'dormir', label: 'Gorro de dormir', vibes: ['kawaii'], price: 85, colors: ['#9DB8F2', '#FFE07A'],
    draw: (g, k) => {
      const d = dome(g, 0.8, 14);
      const cone = `M${f(d.x1 + 2)} ${f(d.ys - 2)} C${f(d.x1)} ${f(d.top - 26)} ${f(100 + d.bw * 0.3)} ${f(d.top - 26)} ${f(d.x2 + 22)} ${f(d.ys - 14)} C${f(d.x2 + 8)} ${f(d.top - 6)} ${f(d.x2 - 2)} ${f(d.top)} ${f(d.x2 - 2)} ${f(d.ys - 2)}Z`;
      const stars = [[-0.2, -14], [0.12, -18], [0.32, -6]].map(([fx, dy]) => flat(starD(100 + d.bw * fx, d.top + dy, 3.6), k.c2)).join('');
      return { top: part(cone, k.c1) + stars + part(d.brim, mixc(k.c1, '#FFFFFF', 0.7)) + disc(d.x2 + 22, d.ys - 12, 6.5, 6.5, k.c2) };
    },
  },
  {
    id: 'pescador', label: 'Gorro de pescador', vibes: ['y2k', 'aesthetic'], price: 110, colors: ['#F2E6D0', '#7FB894'],
    draw: (g, k) => {
      const bw = g.w * 0.48, y = g.top + 4;
      const crown = `M${f(100 - bw * 0.62)} ${f(y)} L${f(100 - bw * 0.5)} ${f(y - 22)} Q100 ${f(y - 27)} ${f(100 + bw * 0.5)} ${f(y - 22)} L${f(100 + bw * 0.62)} ${f(y)}Z`;
      const brim = `M${f(100 - bw)} ${f(y + 6)} Q100 ${f(y + 13)} ${f(100 + bw)} ${f(y + 6)} L${f(100 + bw * 0.66)} ${f(y - 2)} Q100 ${f(y + 3)} ${f(100 - bw * 0.66)} ${f(y - 2)}Z`;
      let check = '';
      for (let i = -2; i <= 2; i++) check += flat(`M${f(100 + i * bw * 0.22 - 3)} ${f(y - 24)} h6 v24 h-6Z`, k.c2, { opacity: 0.5 });
      return { top: part(brim, k.c1) + part(crown, k.c1) + G({}, check) + flat(`M${f(100 - bw * 0.6)} ${f(y - 6)} L${f(100 + bw * 0.6)} ${f(y - 6)} L${f(100 + bw * 0.62)} ${f(y)} L${f(100 - bw * 0.62)} ${f(y)}Z`, shade(k.c2, -0.6)) };
    },
  },
  {
    id: 'pamela', label: 'Sombrero de sol', vibes: ['playera', 'aesthetic', 'coquette'], price: 140, colors: ['#FFB6CC', '#F2D38A'],
    draw: (g, k) => {
      const W = g.w * 0.58, y = g.top + 6;
      return {
        top: G({ transform: T(100, y, -5, 1) },
          part(`M${f(-W)} 2 C${f(-W)} -9 ${f(W)} -9 ${f(W)} 2 C${f(W)} 12 ${f(-W)} 12 ${f(-W)} 2Z`, k.c2, { stroke: '#8A6326' })
          + line(`M${f(-W * 0.8)} 3 C${f(-W * 0.6)} 8 ${f(W * 0.6)} 8 ${f(W * 0.8)} 3`, shade(k.c2, -0.8), 1.4, { opacity: 0.7 })
          + part('M-24 -1 C-25 -20 -12 -27 0 -27 C12 -27 25 -20 24 -1 Q0 4 -24 -1Z', k.c2, { stroke: '#8A6326' })
          + part('M-24.5 -8 Q0 -3 24.5 -8 L24 -1 Q0 4 -24 -1Z', k.c1)
          + bow(18, -5, 10, 0.55, k.c1)),
      };
    },
  },
  {
    id: 'laurel', label: 'Corona de laurel', vibes: ['academia', 'princesa'], price: 120, colors: [GOLD],
    draw: (g, k) => {
      let s = '';
      const hw = g.w * 0.38;
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        [-1, 1].forEach((side) => {
          const x = 100 + side * hw * (1 - t * 0.85), y = g.topAt(x) + 6;
          // hojas acostadas a lo largo de la cabeza, apuntando al frente,
          // en dos filas (una hacia afuera y otra hacia adentro)
          const rot = g.tiltAt(x) - side * (90 - (i % 2 ? 40 : -10));
          s += P(`M0 0 C-3 -5 -2 -10 0 -12 C2 -10 3 -5 0 0Z`, { fill: k.c1, stroke: shade(k.c1, -2.4), 'stroke-width': 1.2, 'data-r': 'part', transform: T(x, y, rot, 1) });
        });
      }
      return { top: s };
    },
  },
  {
    id: 'mago', label: 'Sombrero de mago', vibes: ['celestial', 'gotica'], price: 150, colors: ['#3B3F8F', '#FFD45C'],
    draw: (g, k) => ({
      top: G({ transform: T(100, g.top + 7, -4, sc(g)) },
        part(`M-${f(g.w * 0.42)} 0 C-${f(g.w * 0.42)} -9 ${f(g.w * 0.42)} -9 ${f(g.w * 0.42)} 0 C${f(g.w * 0.42)} 8 -${f(g.w * 0.42)} 8 -${f(g.w * 0.42)} 0Z`, k.c1)
        + part('M-20 -1 L-3 -56 Q2 -60 5 -55 L20 -1 Q0 4 -20 -1Z', k.c1)
        + flat(starD(-4, -30, 4.5), k.c2) + flat(starD(8, -14, 3.4), k.c2) + flat(moonD(4, -44, 4), k.c2) + dot(-10, -12, 1.4, k.c2) + dot(2, -36, 1.2, '#FFFFFF')),
    }),
  },
  {
    id: 'diademaLuna', label: 'Diadema de luna', vibes: ['celestial'], price: 90, colors: [GOLD, '#B8A1FF'],
    draw: (g, k) => ({
      top: headband(g, g.w * 0.38, 2, 6.5, k.c1)
        + part(moonD(100, g.top - 8, 10.5), k.c1, { stroke: shade(k.c1, -2.2) })
        + part(starD(100 + 13, g.topAt(113) - 3, 3.6), k.c2, { 'stroke-width': 1.2 }) + part(starD(100 - 13, g.topAt(87) - 2, 3), k.c2, { 'stroke-width': 1.2 }),
    }),
  },
  {
    id: 'marinero', label: 'Gorrito marinero', vibes: ['otaku', 'playera'], price: 90, colors: ['#FFFFFF', '#2E4A8A'],
    draw: (g, k) => ({
      top: G({ transform: T(106, g.top + 3, 12, sc(g) * 1.35) },
        part('M-17 2 C-18 -6 -14 -12 0 -13 C14 -12 18 -6 17 2 Q0 6 -17 2Z', k.c1)
        + part('M-17.5 -2 Q0 2 17.5 -2 L17 3 Q0 7 -17 3Z', k.c2)
        + part('M-20 -10 C-14 -18 14 -18 20 -10 C14 -13 -14 -13 -20 -10Z', k.c1)),
    }),
  },
  {
    id: 'chef', label: 'Gorro de chef', vibes: ['chef'], price: 100, colors: ['#FFFFFF'],
    draw: (g, k) => {
      const y = g.top + 6, w = g.w * 0.3;
      return {
        top: disc(100 - w * 0.6, y - 26, w * 0.55, w * 0.5, k.c1) + disc(100 + w * 0.6, y - 26, w * 0.55, w * 0.5, k.c1) + disc(100, y - 32, w * 0.62, w * 0.55, k.c1)
          + part(`M${f(100 - w)} ${f(y + 2)} L${f(100 - w)} ${f(y - 16)} Q100 ${f(y - 20)} ${f(100 + w)} ${f(y - 16)} L${f(100 + w)} ${f(y + 2)} Q100 ${f(y + 5)} ${f(100 - w)} ${f(y + 2)}Z`, k.c1)
          + line(`M${f(100 - w * 0.4)} ${f(y - 14)} L${f(100 - w * 0.45)} ${f(y)} M${f(100 + w * 0.4)} ${f(y - 14)} L${f(100 + w * 0.45)} ${f(y)}`, '#D9D2DE', 1.6),
      };
    },
  },
  {
    id: 'visera', label: 'Visera deportiva', vibes: ['deportiva', 'playera'], price: 70, colors: ['#5B7BD9'],
    draw: (g, k) => ({
      top: headband(g, g.w * 0.4, 0, 7, k.c1)
        + part(`M${f(100 - g.w * 0.26)} ${f(g.top + 7)} Q100 ${f(g.top + 1)} ${f(100 + g.w * 0.26)} ${f(g.top + 7)} Q100 ${f(g.top + 20)} ${f(100 - g.w * 0.26)} ${f(g.top + 7)}Z`, shade(k.c1, -0.4)),
    }),
  },
  {
    id: 'gafasCabeza', label: 'Gafas en la cabeza', vibes: ['aesthetic', 'y2k', 'playera'], price: 75, colors: ['#2A2230'],
    draw: (g, k) => {
      const y = g.top + 9;
      const lens = (x) => `M${f(x - 10)} ${f(y - 5)} Q${f(x - 10)} ${f(y - 6)} ${f(x - 8)} ${f(y - 6)} L${f(x + 8)} ${f(y - 6)} Q${f(x + 10)} ${f(y - 6)} ${f(x + 10)} ${f(y - 4)} Q${f(x + 9)} ${f(y + 6)} ${f(x)} ${f(y + 6)} Q${f(x - 9)} ${f(y + 6)} ${f(x - 10)} ${f(y - 5)}Z`;
      return { top: part(lens(88), k.c1) + part(lens(112), k.c1) + line(`M98 ${f(y - 4)} Q100 ${f(y - 6)} 102 ${f(y - 4)}`, OUT, 2.2) + line(`M82 ${f(y - 2)} l5 -3 M106 ${f(y - 2)} l5 -3`, '#FFFFFF', 1.6, { opacity: 0.7 }) };
    },
  },
  {
    id: 'maid', label: 'Cofia de maid', vibes: ['otaku'], price: 85, colors: ['#FFFFFF', '#2A2230'],
    draw: (g, k) => {
      const hw = g.w * 0.3;
      let lace = '';
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const x = 100 - hw + (2 * hw * i) / n, y = g.topAt(x) + 1;
        lace += disc(x, y - 4, 5, 5, k.c1, { 'stroke-width': 1.6 });
      }
      return { top: lace + headband(g, hw * 1.12, 2, 7, k.c2) };
    },
  },
  {
    id: 'velo', label: 'Velo de novia', vibes: ['princesa', 'coquette'], price: 180, colors: ['#FFFFFF', SILVER],
    draw: (g, k) => {
      const t = g.top;
      return {
        back: P(`M${f(100 - g.w * 0.2)} ${f(t + 2)} C${f(g.l - 20)} ${f(t + 30)} ${f(g.l - 22)} ${f(170)} ${f(g.l - 10)} ${f(184)} L${f(g.r + 10)} ${f(184)} C${f(g.r + 22)} ${f(170)} ${f(g.r + 20)} ${f(t + 30)} ${f(100 + g.w * 0.2)} ${f(t + 2)}Z`, { fill: k.c1, opacity: 0.55, stroke: mixc(k.c1, '#8A84A8', 0.6), 'stroke-width': 1.6, 'data-r': 'part' }),
        top: headband(g, g.w * 0.3, 1, 6, k.c2) + part(starD(100, t - 3, 5.5, 0.55), k.c2, { stroke: SILVER_D, 'stroke-width': 1.4 }),
      };
    },
  },
];
