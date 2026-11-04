// Ropa y accesorios de Navidad (del 1 de diciembre a Reyes, ver
// seasons.js). Lo comprado queda en el vestidor para siempre.

import {
  BOTTOM, G, GOLD, GOLD_D, OUT, P, T, bail, ball, bandD, clipBody, clipTo, dot, ellD, f, flat,
  furAlong, garment, headband, heartD, lightOf, line, neckGeo, neckLine, neckScale, neckShadow,
  neckYAt, onTop, part, rr, shade, shine, skipPx, skirt, smileYAt, starD, strip, tone,
} from './kit.js';
import { neckBand } from './outfit.js';

const sc = (g) => Math.max(0.8, Math.min(1.12, g.w / 144));
const FUR = '#FFFFFF', FUR_SH = '#DCE4F0';

// Copo de nieve de seis brazos con centro en (x, y).
const flakeD = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 2, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
    d += `M${f(x - dx)} ${f(y - dy)} L${f(x + dx)} ${f(y + dy)} `;
  }
  return d;
};
// Banda del collar: punto en t (0 izq … 1 der).
const neckAt = (g, t, dy = 0) => {
  const y = g.neckY, sag = 5, L = g.l - 6, R = g.r + 6;
  return [L + (R - L) * t, y + dy + sag * 2 * (1 - Math.pow(2 * t - 1, 2))];
};
// Cascabel con centro en (x, y).
const bell = (x, y, r, c) => ball(x, y, r, c, { stroke: shade(c, -2) }) + line(`M${f(x - r * 0.6)} ${f(y + r * 0.2)} H${f(x + r * 0.6)}`, shade(c, -2), 1.2) + dot(x, y + r * 0.5, r * 0.22, shade(c, -2.4)) + shine(x - r * 0.35, y - r * 0.4, r * 0.25);

const HEAD = [
  {
    id: 'gorroNoel', label: 'Gorro de Papá Noel', price: 110, colors: ['#D9364F'],
    draw: (g, k) => {
      const s = sc(g), x1 = 100 - g.w * 0.39, x2 = 100 + g.w * 0.39, top = g.top;
      const yL = g.topAt(x1) + 5, yR = g.topAt(x2) + 5;
      // gorro de terciopelo: el cono se dobla y cae a la derecha con su
      // pompón; borde de piel esponjosa que sigue la cabeza
      const tipX = x2 + 18 * s, tipY = top + 6 * s;
      const cone = `M${f(x1)} ${f(yL)} C${f(x1 + 2)} ${f(top - 22 * s)} ${f(100 + g.w * 0.08)} ${f(top - 33 * s)} ${f(x2 + 2)} ${f(top - 17 * s)} C${f(x2 + 12 * s)} ${f(top - 10 * s)} ${f(tipX + 2)} ${f(tipY - 6)} ${f(tipX)} ${f(tipY)} C${f(x2 + 3)} ${f(top - 5 * s)} ${f(x2 - 1)} ${f(yR - 10)} ${f(x2)} ${f(yR)}Z`;
      return {
        top: part(cone, k.c1) + clipTo(cone, tone(`M${f(100 + g.w * 0.05)} ${f(top - 40)} C${f(x2)} ${f(top - 30)} ${f(x2 + 4)} ${f(top - 6)} ${f(x2 - 6)} ${f(yR)} L${f(x2 + 30)} ${f(yR)} L${f(x2 + 30)} ${f(top - 40)}Z`, '#2A1C30', 0.2)
          + line(`M${f(x1 + 8)} ${f(top - 6 * s)} C${f(100 - 14)} ${f(top - 22 * s)} ${f(100 + 4)} ${f(top - 26 * s)} ${f(x2 - 8)} ${f(top - 17 * s)}`, lightOf(k.c1), 1.8, { opacity: 0.7 }))
          + furAlong(x1 - 5, x2 + 5, (x) => g.topAt(Math.max(x1, Math.min(x2, x))) - 5, 12, 6)
          + ball(tipX, tipY + 2, 8 * s, '#FFFFFF', { stroke: '#8A98B4' }) + tone(ellD(tipX + 2, tipY + 5, 5.4 * s, 3.6 * s), '#8FA0C0', 0.3) + shine(tipX - 2.6, tipY - 1, 1.7),
      };
    },
  },
  {
    id: 'cintilloReno', label: 'Cintillo de reno', price: 90, colors: ['#8A5A3C', '#D9364F'],
    draw: (g, k) => {
      const s = sc(g);
      const antler = 'M0 2 C-1 -8 -3 -16 -9 -24 M-4 -12 C-9 -14 -13 -13 -16 -10 M-6 -19 C-4 -24 -3 -28 -4 -32';
      const one = (xf, flip) => {
        const p = onTop(g, xf, 5);
        return G({ transform: `translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.rot * 0.6)}) scale(${(flip * s).toFixed(3)} ${s.toFixed(3)})` },
          line(antler, OUT, 6.4) + line(antler, k.c1, 4));
      };
      const mid = onTop(g, 0, 3);
      const holly = G({ transform: T(mid.x, mid.y, 0, s) }, part('M0 0 C-4 -6 -12 -6 -14 -2 C-10 -1 -6 1 0 0Z M0 0 C4 -6 12 -6 14 -2 C10 -1 6 1 0 0Z', '#2F7A4E', { 'stroke-width': 1.4 }) + ball(-2, -2, 2.4, k.c2, { 'stroke-width': 1.1 }) + ball(2, -2.6, 2.4, k.c2, { 'stroke-width': 1.1 }));
      return { top: one(-0.24, 1) + one(0.24, -1) + headband(g, g.w * 0.4, 2, 8, k.c1) + holly };
    },
  },
  {
    id: 'orejeras', label: 'Orejeras de peluche', price: 85, colors: ['#FFB6CC', '#FFFFFF'],
    draw: (g, k) => {
      const s = sc(g);
      // dos almohadillas redondas de peluche (borde esponjoso, centro más
      // claro, sombra abajo) unidas por una diadema sobre la cabeza
      const yp = g.top + (g.ys - g.top) * 0.42, hw = g.chordAt(yp) / 2, r = 12.5 * s;
      const pad = (sx) => {
        const x = 100 + sx * (hw - 1), y = yp;
        let d = '';
        const n2 = 12;
        for (let i = 0; i <= n2; i++) {
          const a = (i / n2) * Math.PI * 2, am = ((i - 0.5) / n2) * Math.PI * 2;
          const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
          d += i ? ` Q${f(x + Math.cos(am) * (r + 3))} ${f(y + Math.sin(am) * (r + 3))} ${f(px)} ${f(py)}` : `M${f(px)} ${f(py)}`;
        }
        d += 'Z';
        return part(d, k.c1, { stroke: shade(k.c1, -2) }) + clipTo(d, tone(`M${f(x - r - 4)} ${f(y + 2)} Q${f(x)} ${f(y + r * 0.6)} ${f(x + r + 4)} ${f(y - 2)} V${f(y + r + 4)} H${f(x - r - 4)}Z`, '#5A2A40', 0.2))
          + P(ellD(x, y + 0.5, r * 0.55, r * 0.55), { fill: k.c2, 'data-r': 'flat' })
          + skipPx(line(`M${f(x - r * 0.75)} ${f(y - r * 0.2)} q2 -2 3 0 M${f(x + r * 0.35)} ${f(y - r * 0.7)} q2 -1 3 1 M${f(x + r * 0.5)} ${f(y + r * 0.6)} q2 0 2 2`, shade(k.c1, -1), 1.1))
          + shine(x - r * 0.45, y - r * 0.45, r * 0.16);
      };
      const arcD = (dy) => `M${f(100 - hw + 2)} ${f(yp - 6 + dy)} C${f(100 - hw + 2)} ${f(g.top - 12 + dy)} ${f(100 + hw - 2)} ${f(g.top - 12 + dy)} ${f(100 + hw - 2)} ${f(yp - 6 + dy)}`;
      return { top: line(arcD(0), OUT, 7.4) + line(arcD(0), shade(k.c1, -0.7), 4.4) + line(arcD(-1), lightOf(k.c1), 1.2, { opacity: 0.7 }) + pad(-1) + pad(1) };
    },
  },
];

const FACE = [
  {
    id: 'narizReno', label: 'Nariz de reno', price: 40, colors: ['#E8303F'],
    draw: (g, k, { e }) => {
      const my = e.mouthY ?? e.y + 12, y = (e.y + my) / 2 + 1.5;
      return { front: ball(100, y, 4.8, k.c1, { stroke: shade(k.c1, -2) }) + shine(98.4, y - 1.8, 1.5) };
    },
  },
  {
    id: 'copitos', label: 'Copitos en las mejillas', price: 45, colors: ['#5B7BD9'],
    draw: (g, k) => {
      const y = g.face.cheekY + 1, dx = g.face.cheekDx + 2;
      return { under: line(flakeD(100 - dx, y, 5.6) + flakeD(100 + dx, y, 5.6), k.c1, 2.2) + dot(100 - dx, y, 1.5, '#FFFFFF') + dot(100 + dx, y, 1.5, '#FFFFFF') };
    },
  },
];

const NECK = [
  {
    id: 'bufandaNavidad', label: 'Bufanda navideña', price: 90, colors: ['#D9364F', '#FFFFFF'],
    draw: (g, k) => {
      const nk = neckGeo(g), th = 13, wrap = nk.band(th, 0);
      // bufanda tejida a rayas que abraza el cuerpo; una punta cae por
      // delante con sus rayas y flecos
      let stripes = '';
      for (let x = nk.L; x < nk.R + 6; x += 19) stripes += `M${f(x)} ${f(nk.y - 14)} h8 V${f(nk.y + 30)} h-8Z`;
      let ribs = '';
      for (let x = nk.L; x < nk.R; x += 3.6) ribs += `M${f(x)} ${f(nk.yAt(x) - th / 2 + 2)} v${f(th - 4)}`;
      const tx = 100 + g.w * 0.17, t0 = nk.yAt(tx) + 3;
      const end = `M${f(tx - 7)} ${f(t0)} C${f(tx - 9)} ${f(t0 + 9)} ${f(tx - 8)} ${f(t0 + 17)} ${f(tx - 6)} ${f(t0 + 23)} L${f(tx + 9)} ${f(t0 + 23)} C${f(tx + 9)} ${f(t0 + 15)} ${f(tx + 9)} ${f(t0 + 7)} ${f(tx + 8)} ${f(t0 - 2)}Z`;
      let endStripes = '';
      for (let i = 0; i < 3; i++) endStripes += `M${f(tx - 12)} ${f(t0 + 3 + i * 7)} h24 v3.4 h-24Z`;
      return {
        front: clipBody(g, part(wrap, k.c1) + clipTo(wrap, flat(stripes, k.c2) + skipPx(line(ribs, shade(k.c1, -1), 0.9, { opacity: 0.4 })) + tone(nk.band(4, th / 2), '#2A1C30', 0.2)) + line(nk.curve(-th * 0.3), lightOf(k.c1), 1.2, { opacity: 0.7 }))
          + part(end, k.c1) + clipTo(end, flat(endStripes, k.c2) + tone(`M${f(tx + 3)} ${f(t0 - 4)} H${f(tx + 12)} V${f(t0 + 26)} H${f(tx + 4)}Z`, '#2A1C30', 0.18))
          + line(`M${f(tx - 4.5)} ${f(t0 + 24)} v5 M${f(tx - 1)} ${f(t0 + 24)} v6 M${f(tx + 2.5)} ${f(t0 + 24)} v5.5 M${f(tx + 6)} ${f(t0 + 24)} v5`, shade(k.c1, -0.4), 2),
      };
    },
  },
  {
    id: 'collarCascabeles', label: 'Collar de cascabeles', price: 75, colors: ['#D9364F', GOLD],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g);
      let s = clipBody(g, part(nk.band(5.5), k.c1, { 'stroke-width': 1.8 }) + line(nk.curve(-1.4), lightOf(k.c1), 1.1, { opacity: 0.75 }));
      [0.34, 0.5, 0.66].forEach((t, i) => {
        const [x, yy] = nk.pt(t, 3);
        const r = (i === 1 ? 6 : 4.8) * S;
        s += bail(x, yy + 0.6, k.c2) + bell(x, yy + 2 + r, r, k.c2);
      });
      // ramita de acebo en el centro
      const [hx, hy] = nk.pt(0.5, -1);
      s += part(`M${f(hx)} ${f(hy)} C${f(hx - 4)} ${f(hy - 6)} ${f(hx - 12)} ${f(hy - 6)} ${f(hx - 14)} ${f(hy - 2)} C${f(hx - 10)} ${f(hy - 1)} ${f(hx - 6)} ${f(hy + 1)} ${f(hx)} ${f(hy)}Z M${f(hx)} ${f(hy)} C${f(hx + 4)} ${f(hy - 6)} ${f(hx + 12)} ${f(hy - 6)} ${f(hx + 14)} ${f(hy - 2)} C${f(hx + 10)} ${f(hy - 1)} ${f(hx + 6)} ${f(hy + 1)} ${f(hx)} ${f(hy)}Z`, '#2F7A4E', { 'stroke-width': 1.3 });
      return { front: s };
    },
  },
];

const OUTFIT = [
  {
    id: 'sueterNavideno', label: 'Suéter navideño', price: 150, colors: ['#D9364F', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: -3, center: 24 });
      const yZ = nl.yc + 9;
      let zig = `M${f(g.l - 10)} ${f(yZ)}`;
      for (let x = g.l - 10, i = 0; x < g.r + 10; x += 6, i++) zig += ` L${f(x + 6)} ${f(yZ + (i % 2 ? 0 : 5))}`;
      const flakes = [[-0.26, 0.55], [0.26, 0.55], [-0.06, 0.75], [0.16, 0.85]].map(([t, u]) => line(flakeD(100 + g.w * t, nl.yc + (BOTTOM - nl.yc) * u, 4.2), k.c2, 1.6)).join('');
      const yT = nl.yc + (BOTTOM - nl.yc) * 0.55;
      const tree = part(`M100 ${f(yT - 10)} L${f(100 - 8)} ${f(yT + 4)} L${f(100 + 8)} ${f(yT + 4)}Z`, '#2F7A4E', { 'stroke-width': 1.4 }) + flat(starD(100, yT - 11, 2.6), GOLD);
      let rib = '';
      for (let x = g.l; x < g.r; x += 5) rib += `M${f(x)} ${BOTTOM - 9} v9`;
      return { outfit: garment(g, k.c1, { side: -3, center: 24, extra: neckBand(g, nl, 5, k.c2) + line(zig, k.c2, 2.4) + flakes + tree + part(`M${f(g.l - 10)} ${BOTTOM - 10} H${f(g.r + 10)} V196 H${f(g.l - 10)}Z`, k.c2) + line(rib, shade(k.c2, -1), 1.2, { opacity: 0.7 }) }).svg };
    },
  },
  {
    id: 'vestidoNoel', label: 'Vestido de Mamá Noel', price: 180, colors: ['#D9364F', '#2A2230'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const yW = Math.min(nl.yc + 13, BOTTOM - 16);
      const hw = g.chordAt(yW) / 2 + 2;
      const fl = 9, xl = g.l - fl, xr = g.r + fl, hem = BOTTOM - 2;
      // terciopelo: brillo suave en el costado iluminado
      const sheen = tone(`M${f(g.l + 6)} ${f(nl.ys + 6)} q5 12 4 ${f(yW - nl.ys - 8)} l-4 0 q1 -10 -4 -20Z`, '#FFFFFF', 0.25);
      const belt = strip(bandD(100 - hw, 100 + hw, yW - 3, 6, 2), k.c2);
      const buckle = part(rr(100 - 5.5, yW - 3.6, 11, 8.2, 1.2), GOLD, { stroke: GOLD_D, 'stroke-width': 1.4 }) + flat(rr(100 - 2.8, yW - 1.2, 5.6, 3.4, 0.6), k.c2) + shine(96, yW - 2.2, 0.8);
      const poms = [0, 1].map((i) => { const y = nl.yc + 6 + i * 5.5; return y < yW - 4 ? ball(100, y, 2, FUR, { stroke: '#9AA6BA', 'stroke-width': 1 }) : ''; }).join('');
      return {
        outfit: garment(g, k.c1, { side: 8, center: 26, extra: sheen + neckShadow(g, nl, 6, 3, 0.2) }).svg
          + clipBody(g, furAlong(g.l - 10, g.r + 10, (x) => neckYAt(g, nl, x) - 2, 8, 9))
          + poms
          + skirt(g, yW, k.c1, { flare: fl, folds: 6, hem })
          + furAlong(xl - 1, xr + 1, (x) => smileYAt(xl, xr, hem - 5, 4, x), 9, 10)
          + belt + buckle,
      };
    },
  },
  {
    id: 'pijamaCopos', label: 'Pijama de copitos', price: 140, colors: ['#7FA9DE', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 22 });
      const pts = [[-0.32, 0.25], [-0.1, 0.4], [0.14, 0.22], [0.32, 0.45], [-0.26, 0.7], [0.04, 0.75], [0.26, 0.85]];
      const flakes = pts.map(([t, u]) => line(flakeD(100 + g.w * t, nl.yc + 6 + (BOTTOM - nl.yc) * u, 3.6), k.c2, 1.5)).join('');
      const buttons = [0, 1, 2].map((i) => ball(100, nl.yc + 8 + i * 10, 1.9, k.c2, { 'stroke-width': 1 })).join('');
      return { outfit: garment(g, k.c1, { side: 2, center: 22, extra: flakes + line(`M100 ${f(nl.yc + 3)} V${BOTTOM}`, shade(k.c1, -1), 1.4) + buttons + neckBand(g, nl, 4, k.c2) }).svg };
    },
  },
];

const BACK = [
  {
    id: 'sacoRegalos', label: 'Saco de regalos', price: 150, colors: ['#B07A52', '#D9364F'],
    draw: (g, k) => {
      const x = g.r - 2, y = g.ys - 14;
      const gifts = part(`M${f(x - 4)} ${f(y - 30)} h14 v12 h-14Z`, '#7FA9DE', { 'stroke-width': 1.6 }) + flat(`M${f(x + 2)} ${f(y - 30)} h3 v12 h-3Z`, '#FFFFFF')
        + part(`M${f(x + 8)} ${f(y - 36)} h12 v14 h-12Z`, k.c2, { 'stroke-width': 1.6 }) + flat(`M${f(x + 13)} ${f(y - 36)} h2.6 v14 h-2.6Z`, GOLD)
        + part(`M${f(x + 14)} ${f(y - 37)} C${f(x + 10)} ${f(y - 43)} ${f(x + 6)} ${f(y - 40)} ${f(x + 14)} ${f(y - 36)} C${f(x + 22)} ${f(y - 40)} ${f(x + 18)} ${f(y - 43)} ${f(x + 14)} ${f(y - 37)}Z`, GOLD, { 'stroke-width': 1.2 });
      const sack = part(`M${f(x - 10)} ${f(y - 22)} C${f(x - 14)} ${f(y - 2)} ${f(x - 10)} ${f(y + 26)} ${f(x + 10)} ${f(y + 28)} C${f(x + 30)} ${f(y + 26)} ${f(x + 32)} ${f(y)} ${f(x + 26)} ${f(y - 22)} Q${f(x + 8)} ${f(y - 16)} ${f(x - 10)} ${f(y - 22)}Z`, k.c1)
        + line(`M${f(x - 8)} ${f(y - 18)} Q${f(x + 8)} ${f(y - 12)} ${f(x + 24)} ${f(y - 18)}`, shade(k.c1, -1.2), 2.4)
        + line(`M${f(x + 2)} ${f(y + 2)} C${f(x + 4)} ${f(y + 12)} ${f(x + 10)} ${f(y + 18)} ${f(x + 18)} ${f(y + 16)}`, shade(k.c1, -0.8), 1.4, { opacity: 0.7 });
      return {
        back: gifts + sack,
        front: clipBody(g, line(`M${f(g.r - 4)} ${f(g.face.y + 2)} Q${f(g.r - 16)} ${f(g.face.y + 26)} ${f(g.r - 10)} ${f(176)}`, shade(k.c1, -1.2), 4)),
      };
    },
  },
];

const HAND = [
  {
    id: 'bastonCaramelo', label: 'Bastón de caramelo', price: 45, colors: ['#D9364F'],
    draw: () => (k) => line('M0 14 L0 -22 Q0 -32 8 -32 Q16 -32 16 -24', OUT, 7.4) + line('M0 14 L0 -22 Q0 -32 8 -32 Q16 -32 16 -24', '#FFFFFF', 5)
      + line('M0 10 V6 M0 0 V-4 M0 -10 V-14 M0 -20 Q0 -24 2 -27 M7 -32 Q10 -32 12 -31 M15.4 -27 Q16 -26 16 -24', k.c1, 5) + line('M-1 12 L-1 -20', '#FFFFFF', 1, { opacity: 0.7 }),
  },
  {
    id: 'chocolateCaliente', label: 'Chocolate caliente', price: 55, colors: ['#FFFFFF', '#D9364F'],
    draw: () => (k) => line('M-5 -26 q-3 -5 0 -9 q3 -4 0 -8 M3 -26 q-3 -5 0 -9 q3 -4 0 -8', '#D6E2F2', 1.8, { opacity: 0.9 })
      + part('M9 -12 C17 -12 17 0 9 0', k.c1, { fill: 'none', 'stroke-width': 3.4 })
      + part('M-10 -18 L10 -18 L8 8 Q0 11 -8 8Z', k.c1)
      + part('M-10.4 -20 Q0 -23 10.4 -20 L10 -15 Q0 -13 -10 -15Z', '#7A4A30', { 'stroke-width': 1.6 })
      + ball(-4, -20, 3, '#FFF6EE', { 'stroke-width': 1.1 }) + ball(2, -21, 3, '#FFE0EA', { 'stroke-width': 1.1 }) + ball(5, -19, 2.6, '#FFF6EE', { 'stroke-width': 1.1 })
      + flat(heartD(0, -4, 3.2), k.c2),
  },
  {
    id: 'regaloMano', label: 'Regalito', price: 60, colors: ['#2F7A4E', '#D9364F'],
    draw: () => (k) => part('M-13 -18 L13 -18 L13 8 L-13 8Z', k.c1) + part('M-15 -24 L15 -24 L15 -17 L-15 -17Z', shade(k.c1, 0.4), { 'stroke-width': 1.8 })
      + flat('M-2.4 -24 h4.8 v32 h-4.8Z', k.c2)
      + part('M0 -24 C-5 -32 -14 -31 -12 -26 C-11 -23 -5 -23 0 -24Z M0 -24 C5 -32 14 -31 12 -26 C11 -23 5 -23 0 -24Z', k.c2, { 'stroke-width': 1.4 }) + ball(0, -24, 2.6, shade(k.c2, -0.4), { 'stroke-width': 1.2 }),
  },
];

const PALETTE = ['#D9364F', '#A8283C', '#2F7A4E', '#56AE78', '#FFFFFF', '#F4EDE4', '#FFD45C', '#7FA9DE', '#8FD3F5', '#B07A52', '#8A5A3C', '#3A3044', '#FFB6CC', '#C9A6FF'];
const tagged = (slot, list) => list.map((it) => ({ ...it, slot, season: 'navidad', palette: PALETTE, vibes: ['temporada'] }));

export const NAVIDAD_WEAR = [
  ...tagged('cabeza', HEAD), ...tagged('cara', FACE), ...tagged('cuello', NECK),
  ...tagged('ropa', OUTFIT), ...tagged('espalda', BACK), ...tagged('mano', HAND),
];
