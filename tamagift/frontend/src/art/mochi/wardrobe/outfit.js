// Ropa: lo que cubre el cuerpo de la mochi. Una mochi no tiene brazos ni
// cintura, así que la ropa es la parte de abajo del cuerpo vestida: escote
// debajo de la boca, prenda recortada a la silueta y, en vestidos y
// faldas, el vuelo que se sale un poco por los costados.

import {
  G, P, Ell, Cir, E, OUT, GOLD, GOLD_D, SILVER, SILVER_D, BOTTOM,
  shade, mixc, f, T, part, flat, line, shine, dot, ball, disc, heartD, starD, moonD, sparkleD, bow, flower,
  garment, clipBody, neckLine, nid,
} from './kit.js';

// Banda que sigue el escote (cuello del suéter, ribete).
function neckBand(g, nl, w, fill) {
  const L = g.l - 10, R = g.r + 10;
  const c = nl.yc + (nl.yc - nl.ys) * 0.95;
  return part(`M${f(L)} ${f(nl.ys)} Q100 ${f(c)} ${f(R)} ${f(nl.ys)} L${f(R)} ${f(nl.ys + w)} Q100 ${f(c + w)} ${f(L)} ${f(nl.ys + w)}Z`, fill);
}
// Y del escote en x (curva cuadrática del cuello redondo).
function neckYAt(g, nl, x) {
  const L = g.l - 10, R = g.r + 10;
  const u = (x - L) / (R - L);
  const c = nl.yc + (nl.yc - nl.ys) * 0.95;
  return (1 - u) * (1 - u) * nl.ys + 2 * (1 - u) * u * c + u * u * nl.ys;
}
const half = (g, y) => g.chordAt(y) / 2;

// Falda con vuelo desde `yW` hasta el borde de abajo, un poco más ancha
// que el cuerpo; `scallop` la termina en ondas.
function skirt(g, yW, fill, { flare = 9, scallop = 0, pleats = 0, hem = BOTTOM + 3 } = {}) {
  const hw = half(g, yW) + 1;
  const L = 100 - hw, R = 100 + hw;
  let bottom = '';
  const xl = g.l - flare, xr = g.r + flare;
  if (scallop) {
    const n = scallop;
    for (let i = n; i >= 1; i--) {
      const x1 = xl + ((xr - xl) * (i - 1)) / n, xm = (x1 + xl + ((xr - xl) * i) / n) / 2;
      bottom += ` Q${f(xm)} ${f(hem + 7)} ${f(x1)} ${f(hem)}`;
    }
  } else bottom = ` Q100 ${f(hem + 6)} ${f(xl)} ${f(hem)}`;
  const d = `M${f(L)} ${f(yW)} Q100 ${f(yW + 4)} ${f(R)} ${f(yW)} C${f(R + flare * 0.3)} ${f(yW + 14)} ${f(xr)} ${f(hem - 14)} ${f(xr)} ${f(hem)}${bottom} C${f(xl)} ${f(hem - 14)} ${f(L - flare * 0.3)} ${f(yW + 14)} ${f(L)} ${f(yW)}Z`;
  let s = part(d, fill);
  if (pleats) {
    for (let i = 1; i < pleats; i++) {
      const t = i / pleats;
      const xt = L + (R - L) * t, xb = xl + (xr - xl) * t;
      s += line(`M${f(xt)} ${f(yW + 3)} L${f(xb)} ${f(hem + 2)}`, shade(fill, -1), 1.5, { opacity: 0.7 });
    }
  }
  return s;
}

export const OUTFIT_ITEMS = [
  {
    id: 'sueter', label: 'Suéter tejido', vibes: ['aesthetic', 'cottagecore'], price: 140, colors: ['#E8C9A0', '#C9A06A'],
    draw: (g, k) => {
      const gw = garment(g, k.c1, { side: -3, center: 24 });
      const cable = (x) => {
        let d = '';
        for (let y = gw.nl.yc + 10; y < BOTTOM - 4; y += 7) d += `M${f(x - 3)} ${f(y)} Q${f(x)} ${f(y + 3.5)} ${f(x + 3)} ${f(y)} M${f(x - 3)} ${f(y + 3.5)} Q${f(x)} ${f(y + 7)} ${f(x + 3)} ${f(y + 3.5)}`;
        return line(d, shade(k.c1, -1), 1.7, { opacity: 0.9 });
      };
      let rib = '';
      for (let x = g.l; x < g.r; x += 5) rib += `M${f(x)} ${BOTTOM - 9} v9`;
      return { outfit: garment(g, k.c1, { side: -3, center: 24, extra: neckBand(g, gw.nl, 5, k.c2) + cable(100 - g.w * 0.2) + cable(100 + g.w * 0.2) + part(`M${f(g.l - 10)} ${BOTTOM - 10} H${f(g.r + 10)} V196 H${f(g.l - 10)}Z`, k.c2) + line(rib, shade(k.c2, -1), 1.2, { opacity: 0.7 }) }).svg };
    },
  },
  {
    id: 'hoodie', label: 'Hoodie', vibes: ['y2k', 'gamer', 'deportiva'], price: 150, colors: ['#B8A1FF', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: -2, center: 24 });
      const yp = nl.yc + 22, pw = g.w * 0.25;
      const pocket = part(`M${f(100 - pw)} ${f(BOTTOM)} L${f(100 - pw * 0.8)} ${f(yp)} Q100 ${f(yp - 3)} ${f(100 + pw * 0.8)} ${f(yp)} L${f(100 + pw)} ${f(BOTTOM)}Z`, k.c1)
        + line(`M${f(100 - pw * 0.8)} ${f(yp)} L${f(100 - pw * 0.95)} ${f(BOTTOM - 4)} M${f(100 + pw * 0.8)} ${f(yp)} L${f(100 + pw * 0.95)} ${f(BOTTOM - 4)}`, shade(k.c1, -1), 1.3);
      const cords = line(`M${f(100 - 6)} ${f(nl.yc + 4)} L${f(100 - 7)} ${f(nl.yc + 18)} M${f(100 + 6)} ${f(nl.yc + 4)} L${f(100 + 7)} ${f(nl.yc + 18)}`, k.c2, 2) + dot(100 - 7, nl.yc + 19, 1.8, shade(k.c2, -1)) + dot(100 + 7, nl.yc + 19, 1.8, shade(k.c2, -1));
      return { outfit: garment(g, k.c1, { side: -2, center: 24, extra: neckBand(g, nl, 7, shade(k.c1, -0.35)) + pocket + cords }).svg };
    },
  },
  {
    id: 'camiseta', label: 'Camiseta de corazón', vibes: ['kawaii'], price: 90, colors: ['#FFFFFF', '#FF6F91'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 25 });
      return { outfit: garment(g, k.c1, { side: 6, center: 25, extra: neckBand(g, nl, 3.5, k.c2) + part(heartD(100, nl.yc + 22, 9), k.c2) + shine(96, nl.yc + 18, 1.6) }).svg };
    },
  },
  {
    id: 'vestido', label: 'Vestido con vuelo', vibes: ['coquette', 'princesa', 'cottagecore'], price: 180, colors: ['#FF9EC4', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const yW = nl.yc + 14;
      return {
        outfit: garment(g, k.c1, { side: 8, center: 26, extra: neckBand(g, nl, 3, k.c2) }).svg
          + skirt(g, yW, k.c1, { flare: 10, scallop: 6, pleats: 7 })
          + clipBody(g, part(`M${f(g.l - 4)} ${f(yW - 3)} Q100 ${f(yW + 1)} ${f(g.r + 4)} ${f(yW - 3)} L${f(g.r + 4)} ${f(yW + 3)} Q100 ${f(yW + 7)} ${f(g.l - 4)} ${f(yW + 3)}Z`, k.c2))
          + bow(100 + g.w * 0.18, yW + 1, 0, 0.55, k.c2),
      };
    },
  },
  {
    id: 'overol', label: 'Overol', vibes: ['cottagecore', 'kawaii'], price: 160, colors: ['#7FA9DE', '#FFF4E0'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24 });
      const yB = nl.yc + 8, bw = g.w * 0.2, yP = nl.yc + 26;
      const bib = part(`M${f(100 - bw)} ${f(yB)} L${f(100 + bw)} ${f(yB)} L${f(100 + bw + 2)} ${f(yP)} L${f(100 - bw - 2)} ${f(yP)}Z`, k.c1);
      const pants = part(`M${f(g.l - 10)} ${f(yP - 4)} Q100 ${f(yP + 2)} ${f(g.r + 10)} ${f(yP - 4)} L${f(g.r + 10)} 196 L${f(g.l - 10)} 196Z`, k.c1);
      const straps = line(`M${f(100 - bw + 3)} ${f(yB + 1)} L${f(100 - g.w * 0.36)} ${f(g.face.y + 4)} M${f(100 + bw - 3)} ${f(yB + 1)} L${f(100 + g.w * 0.36)} ${f(g.face.y + 4)}`, shade(k.c1, -0.4), 4.5);
      return {
        outfit: garment(g, k.c2, {
          side: 4, center: 24,
          extra: pants + straps + bib + ball(100 - bw + 3, yB + 3, 2.2, GOLD) + ball(100 + bw - 3, yB + 3, 2.2, GOLD)
            + part(heartD(100, yB + 10, 4), mixc(k.c1, '#FFFFFF', 0.5), { 'stroke-width': 1.4 })
            + line(`M${f(100 - bw + 2)} ${f(yP + 4)} L${f(100 - bw + 2)} ${f(yP + 16)} M${f(100 + bw - 2)} ${f(yP + 4)} L${f(100 + bw - 2)} ${f(yP + 16)}`, shade(k.c1, -1), 1.3, { 'stroke-dasharray': '2 2' }),
        }).svg,
      };
    },
  },
  {
    id: 'seifuku', label: 'Uniforme marinero', vibes: ['otaku'], price: 190, colors: ['#2E4A8A', '#D9364F'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 25, v: true });
      const yS = nl.yc + 22;
      const flapL = `M${f(g.l - 10)} ${f(nl.ys - 2)} L100 ${f(nl.yc + 8)} L${f(100 - 9)} ${f(nl.yc + 14)} L${f(g.l - 10)} ${f(nl.ys + 10)}Z`;
      const flapR = `M${f(g.r + 10)} ${f(nl.ys - 2)} L100 ${f(nl.yc + 8)} L${f(100 + 9)} ${f(nl.yc + 14)} L${f(g.r + 10)} ${f(nl.ys + 10)}Z`;
      return {
        outfit: garment(g, '#FFFFFF', { side: 6, center: 25, v: true, extra: part(flapL, k.c1) + part(flapR, k.c1) + line(`M${f(g.l - 6)} ${f(nl.ys + 3)} L${f(100 - 5)} ${f(nl.yc + 11)} M${f(g.r + 6)} ${f(nl.ys + 3)} L${f(100 + 5)} ${f(nl.yc + 11)}`, '#FFFFFF', 1.6) }).svg
          + skirt(g, yS, k.c1, { flare: 6, pleats: 9 })
          + bow(100, nl.yc + 12, 0, 0.7, k.c2),
      };
    },
  },
  {
    id: 'maid', label: 'Vestido de maid', vibes: ['otaku', 'coquette'], price: 200, colors: ['#2A2230', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 25 });
      const yW = nl.yc + 14, aw = g.w * 0.26;
      let ruffle = '';
      for (let i = 0; i <= 6; i++) { const t = i / 6; const x = 100 - aw + 2 * aw * t; ruffle += disc(x, BOTTOM + 1, 4.4, 3.6, k.c2, { 'stroke-width': 1.4 }); }
      const apron = part(`M${f(100 - aw * 0.7)} ${f(yW - 10)} L${f(100 + aw * 0.7)} ${f(yW - 10)} L${f(100 + aw)} ${f(BOTTOM)} L${f(100 - aw)} ${f(BOTTOM)}Z`, k.c2) + ruffle;
      return {
        outfit: garment(g, k.c1, { side: 6, center: 25, extra: neckBand(g, nl, 4, k.c2) }).svg
          + skirt(g, yW, k.c1, { flare: 8, scallop: 7 })
          + apron + bow(100, yW - 9, 0, 0.5, k.c2, false),
      };
    },
  },
  {
    id: 'yukata', label: 'Yukata', vibes: ['otaku', 'aesthetic'], price: 180, colors: ['#9DCEEF', '#E8648C'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 30, v: true });
      const yO = nl.yc + 10;
      const prints = [[-0.3, 14], [0.25, 4], [-0.12, 30], [0.32, 30]].map(([fx, dy]) => flower(100 + g.w * fx, yO + dy, 4, mixc(k.c1, '#FFFFFF', 0.6), fx * 100, k.c2)).join('');
      return {
        outfit: garment(g, k.c1, {
          side: 4, center: 30, v: true,
          extra: prints + line(`M${f(g.l - 6)} ${f(nl.ys + 2)} L100 ${f(nl.yc + 6)} M${f(g.r + 6)} ${f(nl.ys + 2)} L${f(100 - 4)} ${f(nl.yc + 10)}`, '#FFFFFF', 3)
            + part(`M${f(g.l - 10)} ${f(yO)} Q100 ${f(yO + 3)} ${f(g.r + 10)} ${f(yO)} L${f(g.r + 10)} ${f(yO + 11)} Q100 ${f(yO + 14)} ${f(g.l - 10)} ${f(yO + 11)}Z`, k.c2),
        }).svg + part(`M${f(100 + g.w * 0.26)} ${f(yO + 3)} l10 -6 l2 12 Z M${f(100 + g.w * 0.26)} ${f(yO + 8)} l9 8 l-11 2Z`, k.c2),
      };
    },
  },
  {
    id: 'impermeable', label: 'Impermeable', vibes: ['kawaii', 'cottagecore'], price: 170, colors: ['#FFD45C', '#7A5A3A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 22 });
      const toggles = [0, 1, 2].map((i) => part(`M${f(100 - 4)} ${f(nl.yc + 8 + i * 11)} h8 v3 h-8Z`, k.c2, { 'stroke-width': 1.4 })).join('');
      // capucha puesta: enmarca la cara por arriba
      const fy = g.face.y, o = 7;
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const th = Math.PI + 0.25 - ((Math.PI + 0.5) * i) / 20;
        pts.push(`${f(100 + (g.hw + o) * Math.cos(th))} ${f(g.ys - (g.ys - g.top + o) * Math.sin(th))}`);
      }
      const inner = `L${f(g.r - 2)} ${f(fy + 10)} C${f(g.r - 6)} ${f(fy - 22)} ${f(100 + g.w * 0.2)} ${f(fy - 26)} 100 ${f(fy - 26)} C${f(100 - g.w * 0.2)} ${f(fy - 26)} ${f(g.l + 6)} ${f(fy - 22)} ${f(g.l + 2)} ${f(fy + 10)}Z`;
      return {
        outfit: garment(g, k.c1, { side: 2, center: 22, extra: toggles + line(`M100 ${f(nl.yc + 4)} V${BOTTOM}`, shade(k.c1, -1), 1.4) }).svg,
        top: part(`M${pts.join(' L')} ${inner}`, k.c1) + line(`M${f(g.l + 8)} ${f(fy)} C${f(g.l + 8)} ${f(fy - 24)} ${f(g.r - 8)} ${f(fy - 24)} ${f(g.r - 8)} ${f(fy)}`, shade(k.c1, -0.9), 1.4, { opacity: 0.6 }),
      };
    },
  },
  {
    id: 'cuero', label: 'Chaqueta de cuero', vibes: ['rockera', 'gotica', 'y2k'], price: 200, colors: ['#2A2230', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24, v: true });
      const shirt = part(`M${f(100 - 12)} ${f(nl.yc - 4)} L${f(100 + 12)} ${f(nl.yc - 4)} L${f(100 + 9)} ${f(BOTTOM + 4)} L${f(100 - 9)} ${f(BOTTOM + 4)}Z`, k.c2);
      const lapels = part(`M${f(100 - 12)} ${f(nl.yc - 4)} L${f(100 - 20)} ${f(nl.yc + 10)} L${f(100 - 9)} ${f(nl.yc + 16)}Z`, shade(k.c1, 0.5)) + part(`M${f(100 + 12)} ${f(nl.yc - 4)} L${f(100 + 20)} ${f(nl.yc + 10)} L${f(100 + 9)} ${f(nl.yc + 16)}Z`, shade(k.c1, 0.5));
      const studs = [[-18, 8], [18, 8], [-15, 12], [15, 12]].map(([dx, dy]) => ball(100 + dx, nl.yc + dy, 1.4, SILVER, { 'stroke-width': 0.8 })).join('');
      return { outfit: garment(g, k.c1, { side: 4, center: 24, v: true, extra: shirt + lapels + studs + line(`M${f(100 - 9)} ${f(nl.yc + 16)} L${f(100 - 9)} ${f(BOTTOM)} M${f(100 + 9)} ${f(nl.yc + 16)} L${f(100 + 9)} ${f(BOTTOM)}`, SILVER, 1.6) }).svg };
    },
  },
  {
    id: 'tutu', label: 'Tutú de bailarina', vibes: ['coquette', 'princesa'], price: 170, colors: ['#FFB6CC'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 10, center: 28 });
      const yW = nl.yc + 12, tulle = mixc(k.c1, '#FFFFFF', 0.35);
      let layers = '';
      [18, 12].forEach((spread, j) => {
        const n = 9, xl = g.l - spread, xr = g.r + spread, y = yW + 10 + j * 5;
        let d = `M${f(100 - half(g, yW))} ${f(yW)} Q100 ${f(yW + 4)} ${f(100 + half(g, yW))} ${f(yW)} L${f(xr)} ${f(y)}`;
        for (let i = n; i >= 1; i--) { const x1 = xl + ((xr - xl) * (i - 1)) / n; d += ` Q${f(x1 + (xr - xl) / n / 2)} ${f(y + 9)} ${f(x1)} ${f(y)}`; }
        layers += part(`${d}Z`, j ? k.c1 : tulle, { opacity: j ? 1 : 0.9 });
      });
      return { outfit: garment(g, k.c1, { side: 10, center: 28 }).svg + layers + flat(sparkleD(100 - 10, yW + 18, 2.4), '#FFFFFF') + flat(sparkleD(100 + 14, yW + 14, 2), '#FFFFFF') };
    },
  },
  {
    id: 'pijama', label: 'Pijama de estrellitas', vibes: ['kawaii'], price: 130, colors: ['#BFD7FF', '#FFE07A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: -2, center: 24 });
      const prints = [[-0.32, 14, 's'], [0.2, 6, 'm'], [-0.08, 26, 's'], [0.33, 26, 's'], [-0.3, 38, 'm'], [0.1, 42, 's']].map(([fx, dy, t]) => (t === 's' ? flat(starD(100 + g.w * fx, nl.yc + dy, 3.4), k.c2) : flat(moonD(100 + g.w * fx, nl.yc + dy, 3.6), k.c2))).join('');
      const buttons = [0, 1, 2].map((i) => ball(100, nl.yc + 9 + i * 10, 1.8, '#FFFFFF', { 'stroke-width': 1 })).join('');
      return { outfit: garment(g, k.c1, { side: -2, center: 24, extra: prints + neckBand(g, nl, 4, '#FFFFFF') + buttons }).svg };
    },
  },
  {
    id: 'flotador', label: 'Flotador de patito', vibes: ['playera', 'kawaii'], price: 110, colors: ['#FFD84D', '#FF9F43'],
    draw: (g, k) => {
      const y = g.face.y + 44, rx = g.w / 2 + 13, ry = 14;
      const ring = (front) => {
        const id = nid('fl');
        const clip = front ? `M0 ${f(y)} H200 V200 H0Z` : `M0 0 H200 V${f(y)} H0Z`;
        return E('clipPath', { id }, P(clip)) + G({ 'clip-path': `url(#${id})` },
          P(`M${f(100 - rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 1 0 ${f(100 + rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 1 0 ${f(100 - rx)} ${f(y)}Z M${f(100 - rx + 12)} ${f(y)} A${f(rx - 12)} ${f(ry - 10)} 0 1 1 ${f(100 + rx - 12)} ${f(y)} A${f(rx - 12)} ${f(ry - 10)} 0 1 1 ${f(100 - rx + 12)} ${f(y)}Z`, { fill: k.c1, 'fill-rule': 'evenodd', stroke: OUT, 'stroke-width': 2.3, 'data-r': 'part' })
          + (front ? line(`M${f(100 - rx + 8)} ${f(y + 5)} Q100 ${f(y + ry + 4)} ${f(100 + rx - 26)} ${f(y + 8)}`, '#FFFFFF', 2.2, { opacity: 0.7 }) : ''));
      };
      const hx = 100 + rx - 6, hy = y - 6;
      const head = disc(hx, hy - 6, 8.5, 8, k.c1) + part(`M${f(hx + 6)} ${f(hy - 6)} q8 -1 9 2 q-2 3 -9 3Z`, k.c2, { 'stroke-width': 1.6 }) + dot(hx + 2.6, hy - 9, 1.5, OUT) + shine(hx + 3, hy - 9.6, 0.5);
      return { back: ring(false), outfit: ring(true) + head };
    },
  },
  {
    id: 'jersey', label: 'Camiseta deportiva', vibes: ['deportiva'], price: 120, colors: ['#5B7BD9', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 5, center: 24, v: true });
      const x = 100, y = nl.yc + 14;
      const seven = part(`M${f(x - 7)} ${f(y)} h14 v4 l-7 16 h-5 l7 -15 h-9Z`, k.c2, { 'stroke-width': 1.6 });
      const stripes = line(`M${f(g.l + 6)} ${f(nl.ys + 8)} V${BOTTOM} M${f(g.r - 6)} ${f(nl.ys + 8)} V${BOTTOM}`, k.c2, 4);
      return { outfit: garment(g, k.c1, { side: 5, center: 24, v: true, extra: stripes + seven + line(`M${f(g.l - 6)} ${f(nl.ys + 1)} L100 ${f(nl.yc + 7)} L${f(g.r + 6)} ${f(nl.ys + 1)}`, k.c2, 3) }).svg };
    },
  },
  {
    id: 'cardigan', label: 'Cárdigan', vibes: ['aesthetic', 'academia', 'coquette'], price: 160, colors: ['#C7E3C0', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 22, v: true });
      const gap = 8;
      const panel = (s) => part(`M${f(s < 0 ? g.l - 10 : g.r + 10)} ${f(nl.ys)} L${f(100 + s * gap)} ${f(nl.yc + 8)} L${f(100 + s * (gap + 2))} 196 L${f(s < 0 ? g.l - 10 : g.r + 10)} 196Z`, k.c1);
      const buttons = [0, 1, 2].map((i) => ball(100 - gap - 3, nl.yc + 14 + i * 9, 1.8, '#FFFFFF', { 'stroke-width': 1 })).join('');
      return { outfit: garment(g, k.c2, { side: 6, center: 26, extra: panel(-1) + panel(1) + buttons + line(`M${f(100 - g.w * 0.3)} ${f(BOTTOM - 14)} h12`, shade(k.c1, -1), 1.4) }).svg };
    },
  },
  {
    id: 'tweed', label: 'Chaleco de tweed', vibes: ['academia'], price: 170, colors: ['#9A7A5A', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 24 });
      const vest = part(`M${f(g.l - 10)} ${f(nl.ys + 6)} L100 ${f(nl.yc + 22)} L${f(g.r + 10)} ${f(nl.ys + 6)} L${f(g.r + 10)} 196 L${f(g.l - 10)} 196Z`, k.c1);
      let tweed = '';
      for (let i = 0; i < 9; i++) tweed += line(`M${f(g.l + i * g.w / 8)} ${f(nl.ys + 10)} l6 6 M${f(g.l + 3 + i * g.w / 8)} ${f(nl.ys + 26)} l6 6`, shade(k.c1, -0.7), 1, { opacity: 0.55 });
      const collar = part(`M${f(100 - 2)} ${f(nl.yc + 1)} L${f(100 - 11)} ${f(nl.yc - 3)} L${f(100 - 8)} ${f(nl.yc + 7)}Z M${f(100 + 2)} ${f(nl.yc + 1)} L${f(100 + 11)} ${f(nl.yc - 3)} L${f(100 + 8)} ${f(nl.yc + 7)}Z`, '#FFFFFF', { 'stroke-width': 1.6 });
      const buttons = [0, 1].map((i) => ball(100, nl.yc + 28 + i * 9, 1.8, shade(k.c1, -1.4), { 'stroke-width': 1 })).join('');
      return { outfit: garment(g, k.c2, { side: 6, center: 24, extra: vest + tweed + buttons }).svg + collar };
    },
  },
  {
    id: 'lolita', label: 'Vestido gótico', vibes: ['gotica'], price: 210, colors: ['#221C27', '#8E1F2C'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const yW = nl.yc + 14;
      let lace = '';
      const n = 8;
      for (let i = 0; i <= n; i++) { const x = g.l - 4 + ((g.w + 8) * i) / n; lace += disc(x, neckYAt(g, nl, x) + 1.5, 3.4, 3, '#FFFFFF', { 'stroke-width': 1.2 }); }
      let hemLace = '';
      for (let i = 0; i <= 9; i++) { const x = g.l - 10 + ((g.w + 20) * i) / 9; hemLace += disc(x, BOTTOM + 4, 4, 3.2, '#FFFFFF', { 'stroke-width': 1.2 }); }
      return {
        outfit: garment(g, k.c1, { side: 8, center: 26, extra: clipBody(g, lace) }).svg + hemLace
          + skirt(g, yW, k.c1, { flare: 10, scallop: 7 })
          + bow(100, yW, 0, 0.65, k.c2) + part(`M${f(100 - 1.4)} ${f(nl.yc + 4)} h2.8 v4 h3 v2.8 h-3 v6 h-2.8 v-6 h-3 v-2.8 h3Z`, SILVER, { stroke: SILVER_D, 'stroke-width': 1 }),
      };
    },
  },
  {
    id: 'trajeCalabaza', label: 'Disfraz de calabaza', vibes: ['temporada'], price: 160, colors: ['#F28C38', '#6CBF6A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 22 });
      const ribs = [-0.3, -0.1, 0.1, 0.3].map((fx) => line(`M${f(100 + g.w * fx)} ${f(nl.yc + 4)} Q${f(100 + g.w * fx * 1.3)} ${f(nl.yc + 30)} ${f(100 + g.w * fx * 1.1)} ${BOTTOM}`, shade(k.c1, -1), 1.6, { opacity: 0.8 })).join('');
      const leaves = [-1, 1].map((s) => part(`M100 ${f(nl.yc + 2)} C${f(100 + s * 10)} ${f(nl.yc - 2)} ${f(100 + s * 18)} ${f(nl.yc + 2)} ${f(100 + s * 20)} ${f(nl.yc + 8)} C${f(100 + s * 12)} ${f(nl.yc + 10)} ${f(100 + s * 6)} ${f(nl.yc + 8)} 100 ${f(nl.yc + 2)}Z`, k.c2)).join('');
      return { outfit: garment(g, k.c1, { side: 2, center: 22, extra: ribs }).svg + leaves };
    },
  },
  {
    id: 'sueterNavidad', label: 'Suéter navideño', vibes: ['temporada'], price: 150, colors: ['#D9364F', '#3E8A57'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24 });
      const y = nl.yc + 18;
      let zig = `M${f(g.l - 10)} ${f(y)}`;
      for (let x = g.l - 10, i = 0; x < g.r + 10; x += 8, i++) zig += ` L${f(x + 4)} ${f(y + (i % 2 ? -4 : 4))}`;
      const trees = [-0.26, 0, 0.26].map((fx) => part(`M${f(100 + g.w * fx)} ${f(y + 8)} l6 10 h-12Z`, k.c2, { 'stroke-width': 1.4 })).join('');
      const flakes = [-0.34, -0.12, 0.12, 0.34].map((fx) => flat(sparkleD(100 + g.w * fx, nl.yc + 6, 2.4), '#FFFFFF')).join('');
      return { outfit: garment(g, k.c1, { side: 4, center: 24, extra: neckBand(g, nl, 5, '#FFFFFF') + line(zig, '#FFFFFF', 2.4) + trees + flakes }).svg };
    },
  },
  {
    id: 'delantal', label: 'Delantal de cocina', vibes: ['cottagecore', 'chef'], price: 100, colors: ['#FFFFFF', '#FF8FAB'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const aw = g.w * 0.26, y0 = nl.yc + 4;
      const apron = part(`M${f(100 - aw * 0.75)} ${f(y0)} L${f(100 + aw * 0.75)} ${f(y0)} L${f(100 + aw)} ${f(BOTTOM)} Q100 ${f(BOTTOM + 4)} ${f(100 - aw)} ${f(BOTTOM)}Z`, k.c1);
      const straps = line(`M${f(100 - aw * 0.7)} ${f(y0 + 1)} L${f(100 - g.w * 0.34)} ${f(g.face.y + 6)} M${f(100 + aw * 0.7)} ${f(y0 + 1)} L${f(100 + g.w * 0.34)} ${f(g.face.y + 6)}`, k.c1, 3);
      const pocket = part(`M${f(100 - 9)} ${f(y0 + 18)} h18 v10 q0 4 -4 4 h-10 q-4 0 -4 -4Z`, k.c2, { 'stroke-width': 1.6 }) + flat(heartD(100, y0 + 24, 3), '#FFFFFF');
      return { outfit: clipBody(g, straps) + apron + pocket + line(`M${f(100 - aw * 0.95)} ${f(y0 + 14)} Q100 ${f(y0 + 16)} ${f(100 + aw * 0.95)} ${f(y0 + 14)}`, k.c2, 2.2, { opacity: 0.8 }) };
    },
  },
  {
    id: 'princesa', label: 'Vestido de princesa', vibes: ['princesa'], price: 260, colors: ['#C9A6FF', GOLD],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 10, center: 28 });
      const yW = nl.yc + 12;
      const sash = clipBody(g, part(`M${f(g.l - 8)} ${f(nl.ys + 4)} L${f(g.l - 8)} ${f(nl.ys + 12)} L${f(g.r + 8)} ${f(yW + 8)} L${f(g.r + 8)} ${f(yW)}Z`, k.c2));
      return {
        outfit: garment(g, k.c1, { side: 10, center: 28, extra: neckBand(g, nl, 3, k.c2) }).svg
          + skirt(g, yW, mixc(k.c1, '#FFFFFF', 0.25), { flare: 16, scallop: 5 })
          + skirt(g, yW, k.c1, { flare: 10, scallop: 7, pleats: 6, hem: BOTTOM - 2 })
          + sash + part(`M100 ${f(nl.yc + 3)} l3.6 4 l-3.6 5 l-3.6 -5Z`, '#FF7FA8', { stroke: GOLD_D, 'stroke-width': 1.2 }),
      };
    },
  },
  {
    id: 'bata', label: 'Bata de spa', vibes: ['aesthetic', 'coquette'], price: 120, colors: ['#FFE3EC', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 30, v: true });
      const yB = nl.yc + 18;
      const fluff = [[-0.3, 10], [0.28, 16], [-0.18, 34], [0.22, 38], [-0.34, 44], [0.06, 52]].map(([fx, dy]) => dot(100 + g.w * fx, nl.yc + dy, 1.2, shade(k.c1, -0.5))).join('');
      return {
        outfit: garment(g, k.c1, {
          side: 2, center: 30, v: true,
          extra: fluff + line(`M${f(g.l - 6)} ${f(nl.ys + 2)} L100 ${f(nl.yc + 10)} M${f(g.r + 6)} ${f(nl.ys + 2)} L${f(100 - 6)} ${f(nl.yc + 14)}`, k.c2, 4)
            + part(`M${f(g.l - 10)} ${f(yB)} Q100 ${f(yB + 3)} ${f(g.r + 10)} ${f(yB)} L${f(g.r + 10)} ${f(yB + 6)} Q100 ${f(yB + 9)} ${f(g.l - 10)} ${f(yB + 6)}Z`, k.c1),
        }).svg + part(`M${f(100 + 9)} ${f(yB + 4)} l7 13 l-4 1.5 l-5.5 -12Z`, k.c1, { 'stroke-width': 1.6 }) + part(`M${f(100 + 7)} ${f(yB + 4)} l-1 14 l-4 -0.5 l1.5 -13.5Z`, k.c1, { 'stroke-width': 1.6 }) + disc(100 + 8, yB + 3, 3.6, 3.2, k.c1, { 'stroke-width': 1.6 }),
      };
    },
  },
];
