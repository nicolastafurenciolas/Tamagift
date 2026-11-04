// Cabeza: diademas, gorros, pinzas, sombreros… (los nuevos; los de
// siempre siguen en accessories.js y entran al vestidor desde index.js).
//
// Lo que va en la cabeza se piensa grande y regordete (se tiene que leer
// a 60 px): los sombreros tienen ala en perspectiva con su canto, copa
// con volumen y cinta; los gorros de tela, su doblez y su textura; las
// diademas, su canto de luz.

import {
  Cir, G, GOLD, OUT, P, PEARL, SILVER, SILVER_D, T, ball, bow, brim, clipTo, crown, disc, dot,
  ellD, f, flat, headScale, headband, heartD, laceAlong, lightOf, line, lumOf, mixc, moonD, onTop,
  part, puffStarD, rr, seamOf, shade, shine, skipPx, smileYAt, sparkleD, stitch, tone,
} from './kit.js';

const sc = headScale;

// Gorro de tela que abraza la coronilla: devuelve el contorno y medidas.
// `rise`: cuánto sube sobre la cabeza.
export function dome(g, wFrac = 0.8, rise = 24) {
  const bw = g.w * wFrac, x1 = 100 - bw / 2, x2 = 100 + bw / 2;
  const ys = g.topAt(x1) + 7, top = g.top, yc = top + 9;
  const d = `M${f(x1)} ${f(ys)} C${f(x1 - 2)} ${f(top - rise * 0.6)} ${f(100 - bw * 0.28)} ${f(top - rise)} 100 ${f(top - rise)} C${f(100 + bw * 0.28)} ${f(top - rise)} ${f(x2 + 2)} ${f(top - rise * 0.6)} ${f(x2)} ${f(ys)} Q100 ${f(yc - 4)} ${f(x1)} ${f(ys)}Z`;
  const brimD = `M${f(x1 - 3)} ${f(ys + 3)} Q100 ${f(yc + 2)} ${f(x2 + 3)} ${f(ys + 3)} L${f(x2 + 2)} ${f(ys - 8)} Q100 ${f(yc - 10)} ${f(x1 - 2)} ${f(ys - 8)}Z`;
  return { d, brim: brimD, x1, x2, ys, top, yc, bw };
}
// Volumen de un gorro: brillo arriba a la izquierda y sombra a la derecha.
const domeLight = (d, col) => clipTo(d.d, tone(`M${f(100 + d.bw * 0.16)} ${f(d.top - 40)} C${f(d.x2 + 12)} ${f(d.top - 30)} ${f(d.x2 + 6)} ${f(d.ys)} ${f(d.x2 - 2)} ${f(d.ys + 6)} L${f(d.x2 + 12)} ${f(d.ys + 6)} L${f(d.x2 + 12)} ${f(d.top - 40)}Z`, '#2A1C30', 0.16))
  + line(`M${f(d.x1 + d.bw * 0.12)} ${f(d.ys - 12)} C${f(d.x1 + d.bw * 0.1)} ${f(d.top - 8)} ${f(100 - d.bw * 0.24)} ${f(d.top - 18)} ${f(100 - d.bw * 0.08)} ${f(d.top - 19)}`, lightOf(col, 0.9), 2, { opacity: 0.7 });

// Orejitas sobre una diadema (izquierda dibujada; se espeja en x).
function earPair(g, xFrac, sink, local, rotK = 0.85, extraRot = 0, k = 1) {
  const s = sc(g) * k;
  const L = onTop(g, -xFrac, sink), R = onTop(g, xFrac, sink);
  return G({ transform: `translate(${f(L.x)} ${f(L.y)}) rotate(${f(L.rot * rotK - extraRot)}) scale(${s.toFixed(3)})` }, local)
    + G({ transform: `translate(${f(R.x)} ${f(R.y)}) rotate(${f(R.rot * rotK + extraRot)}) scale(${(-s).toFixed(3)} ${s.toFixed(3)})` }, local);
}

// Pinza de pelo: barrita de metal debajo y el adorno encima.
const clipBar = (w = 11) => part(rr(-w / 2, 1, w, 3.2, 1.4), SILVER, { stroke: SILVER_D, 'stroke-width': 1.1 });

export const HEAD_ITEMS = [
  {
    id: 'orejasGato', label: 'Diadema de gatito', vibes: ['otaku', 'kawaii'], price: 90, colors: ['#3A3044', '#FF9EC4'],
    draw: (g, k) => {
      const ear = part('M-12.5 7 L-5 -21 Q0 -27.5 5 -21 L12.5 7Z', k.c1)
        + flat('M-6.8 3.5 L-2.4 -12.5 Q0 -16 2.4 -12.5 L6.8 3.5Z', k.c2)
        + line('M-4.2 -15 L-7.6 -2', lightOf(k.c1, 1.2), 1.5, { opacity: 0.8 });
      return { top: earPair(g, 0.22, 5, ear, 0.85, 0, 1.12) + headband(g, g.w * 0.41, 1, 8, k.c1) };
    },
  },
  {
    id: 'orejasConejo', label: 'Diadema de conejita', vibes: ['kawaii', 'coquette'], price: 95, colors: ['#FFFFFF', '#FFB6CC'],
    draw: (g, k) => {
      const ear = part('M0 7 C-9 7 -10 -12 -9 -26 C-8 -39 -3.5 -46 0 -46 C3.5 -46 8 -39 9 -26 C10 -12 9 7 0 7Z', k.c1)
        + flat('M0 1 C-4 1 -5 -12 -4.6 -24 C-4.2 -34 -2 -38.5 0 -38.5 C2 -38.5 4.2 -34 4.6 -24 C5 -12 4 1 0 1Z', k.c2)
        + line('M-5.6 -30 C-6.4 -22 -6.6 -12 -6 -4', lightOf(k.c1, 1.2), 1.4, { opacity: 0.85 });
      return { top: earPair(g, 0.14, 6, ear, 0.35, 10, 1.05) + headband(g, g.w * 0.41, 1, 8, k.c1) };
    },
  },
  {
    id: 'orejasOso', label: 'Diadema de osito', vibes: ['kawaii'], price: 85, colors: ['#A9744F', '#F3D2B5'],
    draw: (g, k) => {
      const ear = disc(0, -6, 11.5, 11, k.c1) + P(ellD(0.6, -5, 6.4, 6), { fill: k.c2, 'data-r': 'flat' }) + shine(-5, -11, 1.8);
      return { top: earPair(g, 0.25, 4, ear, 0.6, 0, 1.08) + headband(g, g.w * 0.41, 1, 8, k.c1) };
    },
  },
  {
    id: 'monoGrande', label: 'Moño coquette', vibes: ['coquette', 'princesa'], price: 80, colors: ['#FFB6CC'],
    draw: (g, k) => { const p = onTop(g, 0.18, 4); return { top: bow(p.x, p.y, p.rot * 0.6 + 6, 1.75 * sc(g), k.c1) }; },
  },
  {
    id: 'florPelo', label: 'Flor en el pelo', vibes: ['playera', 'aesthetic', 'coquette'], price: 70, colors: ['#FF7F9E'],
    draw: (g, k) => {
      const p = onTop(g, -0.25, 11);
      // flor de hibisco: pétalos anchos con su vena, estambre amarillo y dos hojas
      let petals = '';
      for (let i = 0; i < 5; i++) {
        const a = i * 72 - 90;
        petals += G({ transform: `rotate(${a})` }, part('M0 0 C4 -3 12 -6 15 -2 C17 2 13 7 8 6 C5 5.5 2 3 0 0Z', k.c1, { stroke: shade(k.c1, -2.3), 'stroke-width': 1.5 })
          + line('M2 0.6 Q7 0.4 11 0.8', shade(k.c1, -0.8), 1, { opacity: 0.8 }));
      }
      const leaves = part('M3 6 C10 6 20 10 23 17 C15 18 7 14 3 6Z', '#6CBF6A', { 'stroke-width': 1.6 }) + line('M5 7.5 Q14 11 20 16', '#3F8A4E', 1)
        + part('M-4 6 C-9 10 -14 17 -12 22 C-6 19 -3 13 -4 6Z', '#5AAE5E', { 'stroke-width': 1.6 });
      const center = flat(ellD(0, 0, 3.6, 3.6), shade(k.c1, -1.2)) + line('M0 0 L-3 -8 M0 0 L1 -9 M0 0 L4 -7', '#FFE070', 1.6) + dot(-3, -8, 1.6, '#FFE070') + dot(1, -9, 1.6, '#FFE070') + dot(4, -7, 1.6, '#FFE070');
      return { top: G({ transform: T(p.x, p.y, p.rot * 0.5, sc(g) * 1.28) }, leaves + petals + center) };
    },
  },
  {
    id: 'pinzasEstrella', label: 'Pinzas de estrellas', vibes: ['y2k', 'celestial'], price: 55, colors: ['#FFD45C'],
    draw: (g, k) => {
      const one = (xf, sink, r, rot) => {
        const p = onTop(g, xf, sink);
        return G({ transform: T(p.x, p.y, p.rot * 0.6 + rot, sc(g)) }, clipBar(r * 1.5)
          + part(puffStarD(0, -1, r, 0.52), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.6 })
          + flat(puffStarD(-0.6, -1.8, r * 0.5, 0.52), lightOf(k.c1, 0.8)) + shine(-r * 0.3, -r * 0.45, r * 0.16));
      };
      return { top: one(-0.3, 15, 10.5, -14) + one(-0.15, 10, 8, 12) };
    },
  },
  {
    id: 'pinzasCorazon', label: 'Pinzas de corazón', vibes: ['kawaii', 'coquette', 'y2k'], price: 55, colors: ['#FF6F91'],
    draw: (g, k) => {
      const one = (xf, sink, s, rot) => {
        const p = onTop(g, xf, sink);
        return G({ transform: T(p.x, p.y, p.rot * 0.6 + rot, sc(g)) }, clipBar(s * 1.6)
          + part(heartD(0, -1.5, s), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 1.6 })
          + flat(heartD(-s * 0.18, -1.5 - s * 0.12, s * 0.55), lightOf(k.c1, 0.8)) + shine(-s * 0.45, -1.5 - s * 0.32, s * 0.17));
      };
      return { top: one(-0.3, 16, 9.5, -16) + one(-0.15, 10, 7.5, 10) };
    },
  },
  {
    id: 'perlas', label: 'Cintillo de perlas', vibes: ['coquette', 'princesa', 'aesthetic'], price: 110, colors: [PEARL],
    draw: (g, k) => {
      const hw = g.w * 0.38, n = 9;
      let s = headband(g, hw, 3, 7, mixc(k.c1, '#C9B8A0', 0.35), 16, { lit: false });
      const st = mixc(k.c1, '#6E5A4A', 0.6);
      for (let i = 0; i <= n; i++) {
        const x = 100 - hw + (2 * hw * i) / n, y = g.topAt(x) + 4;
        const r = 4.2 + 1.6 * (1 - Math.abs(i - n / 2) / (n / 2));
        s += Cir(x, y, r, { fill: k.c1, stroke: st, 'stroke-width': 1.5, 'data-r': 'part' }) + flat(ellD(x + r * 0.2, y + r * 0.3, r * 0.6, r * 0.45), shade(k.c1, -0.5)) + shine(x - r * 0.35, y - r * 0.38, r * 0.32);
      }
      return { top: s };
    },
  },
  {
    id: 'gorroFresa', label: 'Gorro de fresa', vibes: ['kawaii', 'cottagecore'], price: 130, colors: ['#E8505E', '#6CBF6A'],
    draw: (g, k) => {
      const d = dome(g, 0.84, 27);
      const seed = (x, y) => P(ellD(x, y, 1.5, 2.3), { fill: '#FFE29A', stroke: '#C9973A', 'stroke-width': 0.6, 'data-r': 'flat' });
      const seeds = [[-0.32, -8], [-0.16, -18], [0.02, -11], [0.18, -19], [0.32, -9], [-0.24, 2], [-0.06, -2], [0.12, -3], [0.28, 3], [-0.36, 5]].map(([fx, dy]) => seed(100 + d.bw * fx, d.top + dy)).join('');
      // cáliz de hojas en estrella y su cabito
      let calyx = '';
      for (let i = 0; i < 6; i++) {
        const a = -90 + (i - 2.5) * 34;
        calyx += G({ transform: `translate(100 ${f(d.top - 24)}) rotate(${f(a + 90)})` }, part('M0 0 C-4 3 -5 10 0 15 C5 10 4 3 0 0Z', i % 2 ? k.c2 : shade(k.c2, -0.3), { 'stroke-width': 1.6 }));
      }
      return {
        top: part(d.d, k.c1) + domeLight(d, k.c1) + seeds + calyx + part(`M98.6 ${f(d.top - 25)} C98 ${f(d.top - 31)} 100 ${f(d.top - 35)} 103 ${f(d.top - 36)} L104 ${f(d.top - 33.6)} C102 ${f(d.top - 32)} 101 ${f(d.top - 29)} 101.6 ${f(d.top - 25)}Z`, shade(k.c2, -0.8), { 'stroke-width': 1.5 }),
      };
    },
  },
  {
    id: 'gorroRana', label: 'Gorro de ranita', vibes: ['kawaii', 'otaku'], price: 130, colors: ['#8ED07A'],
    draw: (g, k) => {
      const d = dome(g, 0.84, 23);
      const eye = (s) => {
        const x = 100 + s * d.bw * 0.23, y = d.top - 22;
        return disc(x, y, 10, 9.4, k.c1) + Cir(x, y + 0.6, 5.6, { fill: '#FFFFFF', stroke: OUT, 'stroke-width': 1.5, 'data-r': 'part' }) + dot(x + s * 0.4, y + 1.4, 3, OUT) + shine(x + s * 0.4 + 1, y + 0.2, 1.1);
      };
      return {
        top: eye(-1) + eye(1) + part(d.d, k.c1) + domeLight(d, k.c1)
          + line(`M${f(100 - 9)} ${f(d.top - 7)} Q100 ${f(d.top - 1)} ${f(100 + 9)} ${f(d.top - 7)}`, shade(k.c1, -2.2), 2)
          + dot(100 - d.bw * 0.3, d.top - 4, 3.8, '#FF9EB5', { opacity: 0.75 }) + dot(100 + d.bw * 0.3, d.top - 4, 3.8, '#FF9EB5', { opacity: 0.75 }),
      };
    },
  },
  {
    id: 'calabaza', label: 'Gorro de calabaza', vibes: ['temporada', 'gotica'], price: 120, colors: ['#F28C38', '#6CBF6A'],
    draw: (g, k) => {
      const d = dome(g, 0.86, 23);
      let grooves = '', ribs = '';
      [-0.27, 0, 0.27].forEach((fx) => {
        const x0 = 100 + d.bw * fx * 0.3, x1 = 100 + d.bw * fx * 1.25, x2 = 100 + d.bw * fx * 1.1;
        ribs += `M${f(x0)} ${f(d.top - 21)} Q${f(x1)} ${f(d.top - 8)} ${f(x2)} ${f(d.ys - 1)}`;
        grooves += `M${f(x0 - 1.4)} ${f(d.top - 21)} Q${f(x1 - 3)} ${f(d.top - 8)} ${f(x2 - 3)} ${f(d.ys - 1)} L${f(x2 + 1)} ${f(d.ys - 1)} Q${f(x1 + 1)} ${f(d.top - 8)} ${f(x0 + 1)} ${f(d.top - 21)}Z`;
      });
      return {
        top: part(d.d, k.c1) + clipTo(d.d, tone(grooves, shade(k.c1, -2.5), 0.25) + line(ribs, seamOf(k.c1), 1.6, { opacity: 0.85 })) + domeLight(d, k.c1)
          + part(`M97.5 ${f(d.top - 21)} L96.5 ${f(d.top - 32)} Q100.5 ${f(d.top - 35)} 103.5 ${f(d.top - 31)} L102.5 ${f(d.top - 21)}Z`, '#7A5A3A')
          + part(`M103 ${f(d.top - 28)} C112 ${f(d.top - 36)} 122 ${f(d.top - 32)} 120 ${f(d.top - 24)} C114 ${f(d.top - 21)} 107 ${f(d.top - 23)} 103 ${f(d.top - 28)}Z`, k.c2)
          + line(`M104 ${f(d.top - 27)} Q112 ${f(d.top - 29)} 118 ${f(d.top - 25)}`, shade(k.c2, -1), 1.1)
          + line(`M97 ${f(d.top - 27)} c-5 -1 -9 -5 -6 -9 c2 -3 6 0 4 2`, shade(k.c2, -0.6), 1.6),
      };
    },
  },
  {
    id: 'navidad', label: 'Gorro navideño', vibes: ['temporada'], price: 100, colors: ['#D9364F'],
    draw: (g, k) => {
      // gorro tejido de invierno: vuelta blanca con una guarda de zigzag y
      // copitos, tejido en V y un pompón esponjoso
      const d = dome(g, 0.84, 26);
      let knit = '';
      for (let i = -4; i <= 4; i++) { const x = 100 + i * d.bw * 0.1; for (let y = d.top - 19 + Math.abs(i) * 2; y < d.ys - 10; y += 4.2) knit += `M${f(x - 1.6)} ${f(y)} L${f(x)} ${f(y + 2)} L${f(x + 1.6)} ${f(y)}`; }
      const cuff = d.brim;
      const yz = (t) => d.ys - 3 + (d.yc - 2 - d.ys + 3) * (1 - Math.pow(2 * t - 1, 2));
      let zig = '';
      for (let i = 0; i <= 16; i++) { const t = i / 16, x = d.x1 + (d.x2 - d.x1) * t; zig += `${i ? 'L' : 'M'}${f(x)} ${f(yz(t) + (i % 2 ? -1.6 : 1.6))}`; }
      const flakes = [0.2, 0.5, 0.8].map((t) => { const x = d.x1 + (d.x2 - d.x1) * t; return line(`M${f(x)} ${f(yz(t) - 3)} v6 M${f(x - 2.6)} ${f(yz(t) - 1.5)} l5.2 3 M${f(x + 2.6)} ${f(yz(t) - 1.5)} l-5.2 3`, k.c1, 1.1); }).join('');
      return {
        top: part(d.d, k.c1) + clipTo(d.d, skipPx(line(knit, seamOf(k.c1, 0.6), 1, { opacity: 0.55 }))) + domeLight(d, k.c1)
          + part(cuff, '#FFFFFF', { stroke: OUT }) + clipTo(cuff, line(zig, '#3E8A57', 1.6) + skipPx(flakes) + tone(`M${f(d.x1 - 4)} ${f(d.ys)} Q100 ${f(d.yc + 2)} ${f(d.x2 + 4)} ${f(d.ys)} V${f(d.ys + 8)} H${f(d.x1 - 4)}Z`, '#8FA0C0', 0.25))
          + ball(100, d.top - 28, 9.5, '#FFFFFF', { stroke: '#8A98B4' }) + tone(ellD(102, d.top - 25, 6.4, 4.6), '#8FA0C0', 0.3)
          + skipPx(line(`M95 ${f(d.top - 33)} q2 -2 4 -1 M100 ${f(d.top - 36)} q3 0 4 2 M104 ${f(d.top - 30)} q1 2 0 4`, '#C8D2E4', 1.1)) + shine(96, d.top - 32, 2),
      };
    },
  },
  {
    id: 'dormir', label: 'Gorro de dormir', vibes: ['kawaii'], price: 85, colors: ['#9DB8F2', '#FFE07A'],
    draw: (g, k) => {
      const d = dome(g, 0.8, 14);
      const tipX = d.x2 + 22, tipY = d.ys - 10;
      const cone = `M${f(d.x1 + 2)} ${f(d.ys - 2)} C${f(d.x1)} ${f(d.top - 27)} ${f(100 + d.bw * 0.3)} ${f(d.top - 28)} ${f(tipX)} ${f(tipY)} C${f(d.x2 + 9)} ${f(d.top - 5)} ${f(d.x2 - 2)} ${f(d.top + 1)} ${f(d.x2 - 2)} ${f(d.ys - 2)}Z`;
      const stars = [[-0.22, -15, 4.2], [0.1, -19, 3.4], [0.32, -8, 3.8], [-0.02, -6, 3]].map(([fx, dy, r]) => flat(puffStarD(100 + d.bw * fx, d.top + dy, r), k.c2)).join('');
      // doblez con rayitas de tejido y un pompón que cuelga
      let ribs = '';
      for (let i = 1; i < 12; i++) { const t = i / 12, x = d.x1 + (d.x2 - d.x1) * t, yb = d.ys + 3 + (d.yc + 2 - d.ys - 3) * (1 - Math.pow(2 * t - 1, 2)); ribs += `M${f(x)} ${f(yb - 2)} l0 -7`; }
      return {
        top: part(cone, k.c1) + clipTo(cone, stars + tone(`M${f(100 + d.bw * 0.2)} ${f(d.top - 30)} L${f(tipX + 10)} ${f(d.top - 30)} L${f(tipX + 10)} ${f(d.ys + 4)} L${f(d.x2 - 6)} ${f(d.ys + 4)} C${f(d.x2 + 2)} ${f(d.top)} ${f(100 + d.bw * 0.3)} ${f(d.top - 18)} ${f(100 + d.bw * 0.2)} ${f(d.top - 30)}Z`, '#2A1C30', 0.14))
          + part(d.brim, mixc(k.c1, '#FFFFFF', 0.7)) + line(ribs, mixc(k.c1, '#FFFFFF', 0.35), 1.2, { opacity: 0.9 })
          + line(`M${f(tipX)} ${f(tipY)} q2 5 0 9`, shade(k.c1, -1), 1.6) + ball(tipX, tipY + 11, 5.4, k.c2, { stroke: shade(k.c2, -2.2) }) + shine(tipX - 1.6, tipY + 9, 1.3),
      };
    },
  },
  {
    id: 'pescador', label: 'Gorro de pescador', vibes: ['y2k', 'aesthetic'], price: 110, colors: ['#F2E6D0', '#7FB894'],
    draw: (g, k) => {
      const s = sc(g), bw = 52 * s, y = g.top + 5, cw = 30 * s;
      const crownD = `M${f(100 - cw)} ${f(y)} C${f(100 - cw)} ${f(y - 16)} ${f(100 - cw * 0.85)} ${f(y - 25)} 100 ${f(y - 25)} C${f(100 + cw * 0.85)} ${f(y - 25)} ${f(100 + cw)} ${f(y - 16)} ${f(100 + cw)} ${f(y)} Q100 ${f(y + 5)} ${f(100 - cw)} ${f(y)}Z`;
      const brimD = `M${f(100 - bw)} ${f(y + 8)} Q100 ${f(y + 19)} ${f(100 + bw)} ${f(y + 8)} L${f(100 + cw + 2)} ${f(y - 3)} Q100 ${f(y + 3)} ${f(100 - cw - 2)} ${f(y - 3)}Z`;
      // cuadrillé: franjas en dos sentidos que se cruzan
      let v = '', h = '';
      for (let x = 100 - bw; x < 100 + bw; x += 8) v += `M${f(x)} ${f(y - 30)} h4 v52 h-4Z`;
      for (let yy = y - 26; yy < y + 22; yy += 8) h += `M${f(100 - bw - 4)} ${f(yy)} H${f(100 + bw + 4)} v4 H${f(100 - bw - 4)}Z`;
      const check = (d) => clipTo(d, tone(v, k.c2, 0.45) + tone(h, k.c2, 0.45));
      return {
        top: part(brimD, k.c1) + check(brimD) + tone(`M${f(100 - bw)} ${f(y + 8)} Q100 ${f(y + 19)} ${f(100 + bw)} ${f(y + 8)} L${f(100 + bw - 3)} ${f(y + 6)} Q100 ${f(y + 15)} ${f(100 - bw + 3)} ${f(y + 6)}Z`, '#2A1C30', 0.2)
          + skipPx(stitch(`M${f(100 - bw + 6)} ${f(y + 6)} Q100 ${f(y + 15)} ${f(100 + bw - 6)} ${f(y + 6)}`, seamOf(k.c1), 1.1))
          + part(crownD, k.c1) + check(crownD) + clipTo(crownD, tone(`M${f(100 + cw * 0.4)} ${f(y - 30)} H${f(100 + cw + 4)} V${f(y + 6)} H${f(100 + cw * 0.6)}Z`, '#2A1C30', 0.14))
          + part(`M${f(100 - cw)} ${f(y - 5)} Q100 ${f(y)} ${f(100 + cw)} ${f(y - 5)} L${f(100 + cw)} ${f(y)} Q100 ${f(y + 5)} ${f(100 - cw)} ${f(y)}Z`, shade(k.c2, -0.5), { 'stroke-width': 1.8 }),
      };
    },
  },
  {
    id: 'pamela', label: 'Sombrero de sol', vibes: ['playera', 'aesthetic', 'coquette'], price: 140, colors: ['#FFB6CC', '#F2D38A'],
    draw: (g, k) => {
      const s = sc(g), W = g.w * 0.62, y = g.top + 6;
      const straw = shade(k.c2, -1.6);
      let weave = '';
      for (let i = -5; i <= 5; i++) weave += `M${f(i * W * 0.16)} -2 Q${f(i * W * 0.2)} 3 ${f(i * W * 0.17)} 9`;
      return {
        top: G({ transform: T(100, y, -5, 1) },
          brim(0, 2, W, W * 0.2, k.c2, { stroke: '#8A6326', th: 3 })
          + skipPx(line(weave, straw, 0.9, { opacity: 0.5 }))
          + line(`M${f(-W * 0.8)} 4 C${f(-W * 0.6)} 9 ${f(W * 0.6)} 9 ${f(W * 0.8)} 4`, straw, 1.3, { opacity: 0.6 })
          + crown(0, 0, 50 * s, 26 * s, k.c2, { band: k.c1, bandH: 7, stroke: '#8A6326' })
          + skipPx(line(`M-18 -10 l4 7 M-7 -18 l2 9 M6 -18 l-1 9 M17 -10 l-3 7`, straw, 1, { opacity: 0.55 }))
          + bow(21 * s, -4, 10, 0.62, k.c1)),
      };
    },
  },
  {
    id: 'laurel', label: 'Corona de laurel', vibes: ['academia', 'princesa'], price: 120, colors: [GOLD],
    draw: (g, k) => {
      const hw = g.w * 0.4, dk = shade(k.c1, -0.75), st = shade(k.c1, -2.4);
      let s = headband(g, hw, 4, 6.5, shade(k.c1, -0.5), 16, { lit: false });
      // dos ramas que nacen atrás y se juntan adelante: hojas acostadas a lo
      // largo de la rama, de a pares (una arriba y otra abajo), apuntando
      // hacia el centro y montadas una sobre la otra
      const leaf = (x, y, rot, col) => P('M0 0 C3 -3.6 9 -4 14 0 C9 4 3 3.6 0 0Z', { fill: col, stroke: st, 'stroke-width': 1.2, 'data-r': 'part', transform: T(x, y, rot, 1) })
        + line('M1.5 0 L11 0', shade(col, -1), 0.9, { opacity: 0.8, transform: T(x, y, rot, 1) });
      const N = 6;
      for (let i = 0; i < N; i++) {
        const t = i / N;
        [-1, 1].forEach((side) => {
          const x = 100 + side * hw * (1 - t * 0.92), y = g.topAt(x) + 5;
          const a = g.tiltAt(x) + (side < 0 ? 0 : 180);
          s += leaf(x, y, a - side * 28, i % 2 ? k.c1 : dk) + leaf(x, y, a + side * 26, i % 2 ? dk : k.c1);
        });
      }
      return { top: s + ball(100, g.top + 4.5, 3, k.c1, { stroke: st }) + shine(99, g.top + 3.4, 0.9) };
    },
  },
  {
    id: 'mago', label: 'Sombrero de mago', vibes: ['celestial', 'gotica'], price: 150, colors: ['#3B3F8F', '#FFD45C'],
    draw: (g, k) => {
      const W = g.w * 0.46, s = sc(g);
      const cone = 'M-21 -1 C-17 -20 -10 -40 -2 -56 C2 -63 9 -64 14 -60 C8 -57 5 -51 5 -44 C8 -28 15 -12 21 -1 Q0 4 -21 -1Z';
      const lit = mixc(k.c1, '#FFFFFF', 0.35);
      return {
        top: G({ transform: T(100, g.top + 7, -4, 1) },
          brim(0, 0, W, W * 0.2, k.c1, { th: 3 })
          + G({ transform: `scale(${s.toFixed(3)})` }, part(cone, k.c1)
            + clipTo(cone, tone('M2 -64 C10 -40 16 -20 24 2 L30 2 L30 -70Z', '#0E0A28', 0.25))
            + line('M-14 -8 C-10 -24 -5 -38 0 -50', lit, 1.6, { opacity: 0.7 })
            + part('M-20.5 -6 Q0 -1 20.5 -6 L21 -1 Q0 4 -21 -1Z', k.c2, { 'stroke-width': 1.8 })
            + flat(puffStarD(-5, -27, 4.6), k.c2) + flat(puffStarD(7, -15, 3.4), k.c2) + flat(moonD(2, -42, 4), k.c2) + flat(sparkleD(-11, -14, 2.4), '#FFFFFF') + flat(sparkleD(5, -33, 2), '#FFFFFF'))),
      };
    },
  },
  {
    id: 'diademaLuna', label: 'Diadema de luna', vibes: ['celestial'], price: 90, colors: [GOLD, '#B8A1FF'],
    draw: (g, k) => {
      const s = sc(g);
      return {
        top: headband(g, g.w * 0.39, 2, 7, k.c1)
          + G({ transform: T(100, g.top - 8, 0, s * 1.2) }, part(moonD(0, 0, 12), k.c1, { stroke: shade(k.c1, -2.2) }) + flat(moonD(-1.2, -1, 7.5), lightOf(k.c1, 0.8)) + shine(-5, -6, 1.4))
          + part(puffStarD(100 + 15 * s, g.topAt(115) - 4, 5), k.c2, { 'stroke-width': 1.3, stroke: shade(k.c2, -2.2) }) + part(puffStarD(100 - 15 * s, g.topAt(85) - 2, 4), k.c2, { 'stroke-width': 1.3, stroke: shade(k.c2, -2.2) })
          + flat(sparkleD(100 + 24 * s, g.topAt(124) - 9, 2.6), '#FFFFFF'),
      };
    },
  },
  {
    id: 'marinero', label: 'Gorrito marinero', vibes: ['otaku', 'playera'], price: 90, colors: ['#FFFFFF', '#2E4A8A'],
    draw: (g, k) => ({
      top: G({ transform: T(106, g.top + 3, 12, sc(g) * 1.55) },
        part('M-15 1 C-16 -7 -12 -13 0 -14 C12 -13 16 -7 15 1 Q0 5 -15 1Z', k.c1)
        + tone('M5 -14 C12 -12 16 -6 15 1 L10 2 C11 -4 9 -10 5 -14Z', '#2A1C30', 0.14)
        + part('M-15.5 -3 Q0 1 15.5 -3 L15 2 Q0 6 -15 2Z', k.c2, { 'stroke-width': 1.6 })
        + part('M-19 -10 C-13 -18 13 -18 19 -10 C13 -12.5 -13 -12.5 -19 -10Z', k.c1, { 'stroke-width': 1.6 })
        + line('M-17 -10.6 C-11 -15.6 11 -15.6 17 -10.6', seamOf(k.c1, 0.6), 1, { opacity: 0.8 })),
    }),
  },
  {
    id: 'chef', label: 'Gorro de chef', vibes: ['chef'], price: 100, colors: ['#FFFFFF'],
    draw: (g, k) => {
      const s = sc(g), y = g.top + 6, w = 22 * s;
      const sh = seamOf(k.c1, 0.5);
      const puff = disc(100 - w * 0.75, y - 25, w * 0.62, w * 0.55, k.c1) + disc(100 + w * 0.75, y - 25, w * 0.62, w * 0.55, k.c1) + disc(100, y - 32, w * 0.72, w * 0.62, k.c1)
        + tone(ellD(100 + w * 0.95, y - 22, w * 0.4, w * 0.3), '#5A6A8A', 0.16)
        + line(`M${f(100 - w * 0.42)} ${f(y - 28)} q3 -5 0 -10 M${f(100 + w * 0.36)} ${f(y - 29)} q-3 -5 0 -10`, sh, 1.2, { opacity: 0.8 });
      const band = `M${f(100 - w)} ${f(y + 2)} L${f(100 - w)} ${f(y - 16)} Q100 ${f(y - 20)} ${f(100 + w)} ${f(y - 16)} L${f(100 + w)} ${f(y + 2)} Q100 ${f(y + 6)} ${f(100 - w)} ${f(y + 2)}Z`;
      let pleats = '';
      for (let i = -3; i <= 3; i++) pleats += `M${f(100 + i * w * 0.27)} ${f(y - 15)} L${f(100 + i * w * 0.28)} ${f(y + 1)}`;
      return { top: puff + part(band, k.c1) + clipTo(band, line(pleats, sh, 1.2, { opacity: 0.8 }) + tone(`M${f(100 + w * 0.4)} ${f(y - 20)} H${f(100 + w + 2)} V${f(y + 8)} H${f(100 + w * 0.5)}Z`, '#5A6A8A', 0.14)) };
    },
  },
  {
    id: 'visera', label: 'Visera deportiva', vibes: ['deportiva', 'playera'], price: 70, colors: ['#5B7BD9'],
    draw: (g, k) => {
      const w = g.w * 0.3, y0 = g.top + 9;
      const bill = `M${f(100 - w)} ${f(y0)} Q100 ${f(y0 - 4)} ${f(100 + w)} ${f(y0)} Q${f(100 + w * 0.9)} ${f(y0 + 13)} 100 ${f(y0 + 14)} Q${f(100 - w * 0.9)} ${f(y0 + 13)} ${f(100 - w)} ${f(y0)}Z`;
      return {
        top: headband(g, g.w * 0.42, 0, 8, k.c1)
          + part(bill, shade(k.c1, -0.25)) + clipTo(bill, tone(`M${f(100 - w)} ${f(y0 + 7)} Q100 ${f(y0 + 18)} ${f(100 + w)} ${f(y0 + 7)} V${f(y0 + 20)} H${f(100 - w)}Z`, '#2A1C30', 0.2))
          + line(`M${f(100 - w * 0.7)} ${f(y0 + 2)} Q100 ${f(y0 - 0.5)} ${f(100 + w * 0.7)} ${f(y0 + 2)}`, lightOf(k.c1), 1.6, { opacity: 0.8 })
          + skipPx(stitch(`M${f(100 - w * 0.82)} ${f(y0 + 4)} Q100 ${f(y0 + 12)} ${f(100 + w * 0.82)} ${f(y0 + 4)}`, lightOf(k.c1, 0.6), 1)),
      };
    },
  },
  {
    id: 'gafasCabeza', label: 'Gafas en la cabeza', vibes: ['aesthetic', 'y2k', 'playera'], price: 75, colors: ['#2A2230'],
    draw: (g, k) => {
      const y = g.top + 8, dx = 13 * sc(g);
      const lens = (x) => `M${f(x - 11)} ${f(y - 5)} Q${f(x - 11)} ${f(y - 7)} ${f(x - 8.5)} ${f(y - 7)} L${f(x + 8.5)} ${f(y - 7)} Q${f(x + 11)} ${f(y - 7)} ${f(x + 11)} ${f(y - 4.5)} Q${f(x + 10)} ${f(y + 7)} ${f(x)} ${f(y + 7)} Q${f(x - 10)} ${f(y + 7)} ${f(x - 11)} ${f(y - 5)}Z`;
      const arms = line(`M${f(100 - dx - 11)} ${f(y - 4)} L${f(100 - g.w * 0.36)} ${f(g.topAt(100 - g.w * 0.36) + 5)} M${f(100 + dx + 11)} ${f(y - 4)} L${f(100 + g.w * 0.36)} ${f(g.topAt(100 + g.w * 0.36) + 5)}`, k.c1, 2.6);
      const tint = lumOf(k.c1) < 0.3 ? '#3A3550' : shade(k.c1, -1.6);
      return {
        top: arms + part(lens(100 - dx), tint, { stroke: k.c1, 'stroke-width': 2.4 }) + part(lens(100 + dx), tint, { stroke: k.c1, 'stroke-width': 2.4 })
          + line(`M${f(100 - dx + 11)} ${f(y - 4)} Q100 ${f(y - 7)} ${f(100 + dx - 11)} ${f(y - 4)}`, k.c1, 2.4)
          + line(`M${f(100 - dx - 6)} ${f(y - 1)} l5 -4 M${f(100 + dx - 6)} ${f(y - 1)} l5 -4`, '#FFFFFF', 1.7, { opacity: 0.85 }),
      };
    },
  },
  {
    id: 'maid', label: 'Cofia de maid', vibes: ['otaku'], price: 85, colors: ['#FFFFFF', '#2A2230'],
    draw: (g, k) => {
      const hw = g.w * 0.31, n = 8;
      // volante plisado que se abre en abanico sobre una cinta
      let frill = '';
      for (let i = 0; i <= n; i++) {
        const x = 100 - hw + (2 * hw * i) / n, y = g.topAt(x) + 2, a = g.tiltAt(x);
        frill += G({ transform: T(x, y, a, 1) }, part('M-4.6 2 C-6 -4 -4 -8.5 0 -9 C4 -8.5 6 -4 4.6 2Z', k.c1, { 'stroke-width': 1.4 }) + line('M0 -7 V0', seamOf(k.c1, 0.5), 1, { opacity: 0.8 }));
      }
      return { top: frill + headband(g, hw * 1.12, 1, 7, k.c2) + bow(100 - hw * 1.08, g.topAt(100 - hw * 1.08) + 5, g.tiltAt(100 - hw * 1.08) * 0.6, 0.38, k.c2, false) + bow(100 + hw * 1.08, g.topAt(100 + hw * 1.08) + 5, g.tiltAt(100 + hw * 1.08) * 0.6, 0.38, k.c2, false) };
    },
  },
  {
    id: 'velo', label: 'Velo de novia', vibes: ['princesa', 'coquette'], price: 180, colors: ['#FFFFFF', SILVER],
    draw: (g, k) => {
      const t = g.top;
      // tul que cae por detrás desde la coronilla, con sus pliegues y la puntilla del borde
      const L = g.l - 22, R = g.r + 22, by = 183;
      const d = `M${f(100 - g.w * 0.22)} ${f(t + 3)} C${f(g.l - 16)} ${f(t + 24)} ${f(L)} ${f(146)} ${f(L + 2)} ${f(by)} Q100 ${f(by + 6)} ${f(R - 2)} ${f(by)} C${f(R)} ${f(146)} ${f(g.r + 16)} ${f(t + 24)} ${f(100 + g.w * 0.22)} ${f(t + 3)}Z`;
      const ink = mixc(k.c1, '#7A74A0', 0.6);
      const folds = line(`M${f(100 - g.w * 0.2)} ${f(t + 8)} C${f(g.l - 10)} ${f(t + 40)} ${f(L + 7)} 158 ${f(L + 9)} ${f(by - 2)} M${f(100 - g.w * 0.26)} ${f(t + 14)} C${f(g.l - 4)} ${f(t + 44)} ${f(L + 14)} 164 ${f(L + 16)} ${f(by)} M${f(100 + g.w * 0.2)} ${f(t + 8)} C${f(g.r + 10)} ${f(t + 40)} ${f(R - 7)} 158 ${f(R - 9)} ${f(by - 2)} M${f(100 + g.w * 0.26)} ${f(t + 14)} C${f(g.r + 4)} ${f(t + 44)} ${f(R - 14)} 164 ${f(R - 16)} ${f(by)}`, ink, 1.4, { opacity: 0.85 });
      const tulle = mixc(k.c1, '#EEF0FB', 0.35);
      // tul que cae desde la coronilla hasta el piso: bien visible a los
      // costados, con pliegues y puntilla en el ruedo
      const hemLace = laceAlong(L + 2, R - 2, (x) => smileYAt(L + 2, R - 2, by - 3, 3, x), 3.4, '#FFFFFF', { band: 0.5 });
      return {
        back: P(d, { fill: tulle, opacity: 0.9, stroke: ink, 'stroke-width': 1.8, 'data-r': 'part' })
          + folds + hemLace,
        top: headband(g, g.w * 0.3, 1, 6, k.c2)
          + G({ transform: T(100, t - 2, 0, headScale(g) * 1.3) }, part('M-11 4 L-8 -6 L-4 0 L0 -11 L4 0 L8 -6 L11 4 Q0 7 -11 4Z', k.c2, { stroke: SILVER_D, 'stroke-width': 1.5 })
            + Cir(0, -3, 2.6, { fill: '#DDF2FF', stroke: SILVER_D, 'stroke-width': 1, 'data-r': 'part' }) + shine(-0.8, -4, 0.8)
            + dot(-8, -6, 1.6, PEARL) + dot(8, -6, 1.6, PEARL) + dot(0, -11, 1.6, PEARL)),
      };
    },
  },
];

