// Prendas y accesorios de los packs por gustos (personal/packs.js): dos
// por pack. Entran al vestidor desde index.js como las de temporada.
//
// Todos llevan `pack` y `season: 'pack'`: así no salen en la tienda de
// siempre (`onSale` y los filtros `!w.season`); los ve quien tenga el
// pack activado. Lo que ya tiene puesto se dibuja igual que todo.

import {
  BOTTOM, Cir, G, GOLD, GOLD_D, OUT, P, SILVER, SILVER_D, T, ball, bandD, clipBody, clipTo, crescentD,
  disc, dot, ellD, f, flat, garment, headScale, heartD, lightOf, line, mixc, neckGeo, neckLine,
  neckScale, neckShadow, neckYAt, onTop, onlyPx, part, puffStarD, roundShade, rr, seamOf, shade,
  shine, skipPx, smileYAt, sparkleD, stitch, strip, tone,
} from './kit.js';
import { dome } from './head.js';

const sc = headScale;
const poly = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}Z`;

// Grano de café (centro 0,0; ~r de largo) con su surco en S.
const beanD = (r) => ellD(0, 0, r, r * 0.74);
const bean = (r, col) => part(beanD(r), col, { 'stroke-width': 1.5 })
  + line(`M${f(-r * 0.62)} ${f(r * 0.1)} C${f(-r * 0.2)} ${f(-r * 0.5)} ${f(r * 0.2)} ${f(r * 0.5)} ${f(r * 0.62)} ${f(-r * 0.1)}`, shade(col, -1.4), 1.4)
  + shine(-r * 0.42, -r * 0.34, Math.max(0.8, r * 0.16));
// Barrita de la pinza.
const clipBar = (w = 11) => part(rr(-w / 2, 1, w, 3.2, 1.4), SILVER, { stroke: SILVER_D, 'stroke-width': 1.1 });
// Balón chiquito (centro 0,0).
function soccer(r, white, dark) {
  const c = ellD(0, 0, r, r);
  const pent = (x, y, rr2, a0) => poly([0, 1, 2, 3, 4].map((i) => { const a = ((a0 + i * 72) * Math.PI) / 180; return [x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]; }));
  let outer = '';
  for (let i = 0; i < 5; i++) { const a = ((-54 + i * 72) * Math.PI) / 180; outer += pent(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, r * 0.32, -54 + i * 72 + 180); }
  return part(c, white) + clipTo(c, flat(pent(0, 0, r * 0.34, -90) + outer, dark) + tone(`M${f(r * 0.3)} ${f(-r * 1.1)} C${f(r * 1.3)} ${f(-r * 0.6)} ${f(r * 1.2)} ${f(r * 0.8)} ${f(r * 0.2)} ${f(r * 1.1)} L${f(r * 1.2)} ${f(r * 1.2)} L${f(r * 1.2)} ${f(-r * 1.2)}Z`, '#2A1C30', 0.18))
    + P(c, { fill: 'none', stroke: OUT, 'stroke-width': 2, 'data-r': 'line' }) + shine(-r * 0.42, -r * 0.45, r * 0.16);
}
// Correa de mochila por delante (abraza el costado derecho).
const strapFront = (g, col) => clipBody(g, P(`M${f(g.r - 2)} ${f(g.face.y - 2)} Q${f(g.r - 15)} ${f(g.face.y + 24)} ${f(g.r - 9)} 178`, { fill: 'none', stroke: OUT, 'stroke-width': 7.5, 'stroke-linecap': 'round', 'data-r': 'line' })
  + line(`M${f(g.r - 2)} ${f(g.face.y - 2)} Q${f(g.r - 15)} ${f(g.face.y + 24)} ${f(g.r - 9)} 178`, col, 5)
  + skipPx(stitch(`M${f(g.r - 2)} ${f(g.face.y - 2)} Q${f(g.r - 15)} ${f(g.face.y + 24)} ${f(g.r - 9)} 178`, lightOf(col, 0.7), 1)));

// ── Anime ──────────────────────────────────────────────────────────
const ANIME = [
  {
    id: 'bandaNinja', slot: 'cabeza', label: 'Banda ninja', price: 80, colors: ['#2E4A8A', SILVER],
    draw: (g, k) => {
      // cinta de tela que cruza la frente, placa de metal y el nudo con sus colas
      const y = g.face.y - 36, h = 10, x1 = g.l - 10, x2 = g.r + 10;
      const band = clipBody(g, tone(bandD(x1, x2, y + h, 3, 2), '#2A1C30', 0.2) + part(bandD(x1, x2, y, h, 2), k.c1)
        + line(`M${f(x1)} ${f(y + 2.4)} Q100 ${f(y + 6.4)} ${f(x2)} ${f(y + 2.4)}`, lightOf(k.c1), 1.3, { opacity: 0.8 }));
      const py = smileYAt(x1, x2, y, 2, 100) - 1.5, pw = 28 * Math.min(1.1, sc(g) * 1.05);
      const plate = part(rr(100 - pw / 2, py, pw, h + 3, 2.6), k.c2, { stroke: shade(k.c2, -2), 'stroke-width': 1.8 })
        + line(`M${f(100 - pw / 2 + 3)} ${f(py + 2.2)} H${f(100 + pw / 2 - 3)}`, '#FFFFFF', 1.3, { opacity: 0.9 })
        + P(puffStarD(100, py + (h + 3) / 2 + 0.4, 4.4, 0.5), { fill: 'none', stroke: shade(k.c2, -1.6), 'stroke-width': 1.4, 'data-r': 'line' })
        + dot(100 - pw / 2 + 3, py + h - 0.6, 1, shade(k.c2, -1.6)) + dot(100 + pw / 2 - 3, py + h - 0.6, 1, shade(k.c2, -1.6))
        + dot(100 - pw / 2 + 3, py + 4.6, 1, shade(k.c2, -1.6)) + dot(100 + pw / 2 - 3, py + 4.6, 1, shade(k.c2, -1.6));
      const xr = 100 + g.chordAt(y + h / 2) / 2 - 3, yk = y + h / 2 + 1;
      const tails = part(`M${f(xr)} ${f(yk - 2)} C${f(xr + 10)} ${f(yk - 2)} ${f(xr + 16)} ${f(yk + 6)} ${f(xr + 21)} ${f(yk + 16)} L${f(xr + 14)} ${f(yk + 15)} C${f(xr + 11)} ${f(yk + 8)} ${f(xr + 6)} ${f(yk + 4)} ${f(xr)} ${f(yk + 3)}Z`, shade(k.c1, -0.3))
        + part(`M${f(xr)} ${f(yk)} C${f(xr + 8)} ${f(yk + 4)} ${f(xr + 9)} ${f(yk + 14)} ${f(xr + 8)} ${f(yk + 23)} L${f(xr + 2)} ${f(yk + 20)} C${f(xr + 3)} ${f(yk + 12)} ${f(xr + 1)} ${f(yk + 7)} ${f(xr - 3)} ${f(yk + 4)}Z`, k.c1)
        + part(ellD(xr, yk, 4.6, 4.2), shade(k.c1, 0.2));
      return { top: band + plate + tails };
    },
  },
  {
    id: 'haori', slot: 'ropa', label: 'Haori a cuadros', price: 190, colors: ['#3E8A62', '#2A2230'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 22 });
      const step = 9;
      let ch = '';
      for (let y = nl.ys - 6, j = 0; y < 196; y += step, j++) for (let x = g.l - 12, i = 0; x < g.r + 12; x += step, i++) if ((i + j) % 2 === 0) ch += `M${f(x)} ${f(y)}h${step}v${step}h${-step}Z`;
      // la abertura del frente: kimono oscuro con su cuello blanco en V
      const yc = nl.yc + 1, op = 9;
      const inner = poly([[100 - op - 2, yc - 2], [100 + op + 2, yc - 2], [100 + op - 3, BOTTOM + 6], [100 - op + 3, BOTTOM + 6]]);
      const under = part(inner, '#3A3044') + clipTo(inner, line(`M${f(100 - op)} ${f(yc - 1)} L100 ${f(yc + 13)} L${f(100 + op)} ${f(yc - 1)}`, '#F4EDE4', 3.4)
        + part(`M${f(100 - op - 4)} ${f(yc + 22)} H${f(100 + op + 4)} V${f(yc + 29)} H${f(100 - op - 4)}Z`, '#C8303F', { 'stroke-width': 1.4 }));
      // solapas lisas a cada lado de la abertura
      const lap = (s) => part(poly([[100 + s * (op + 2), yc - 3], [100 + s * (op + 8), yc - 4], [100 + s * (op + 3), BOTTOM + 6], [100 + s * (op - 3), BOTTOM + 6]]), shade(k.c1, -0.7), { 'stroke-width': 1.8 });
      // el cordón con sus dos pompones
      const hy = yc + 16;
      const himo = line(`M${f(100 - op - 4)} ${f(hy)} Q100 ${f(hy + 4)} ${f(100 + op + 4)} ${f(hy)}`, '#FFFFFF', 2.2) + ball(100 - 3, hy + 3, 2.4, '#FFFFFF', { 'stroke-width': 1.2 }) + ball(100 + 3, hy + 3, 2.4, '#FFFFFF', { 'stroke-width': 1.2 });
      return { outfit: garment(g, k.c1, { side: 6, center: 22, pattern: flat(ch, k.c2), extra: under + lap(-1) + lap(1) + himo + neckShadow(g, nl, 0, 3, 0.2) }).svg };
    },
  },
];

// ── K-pop ──────────────────────────────────────────────────────────
const KPOP = [
  {
    id: 'lightstickMano', slot: 'mano', label: 'Lightstick', price: 70, colors: ['#C9A6FF', '#FF8FC0'],
    draw: () => (k) => {
      const bulb = ellD(3, -24, 12, 12);
      return part('M-2.6 -10 L4.6 -10 L3 14 Q0.6 16 -1.4 14Z', '#FFFFFF') + line('M-0.6 -6 L-0.2 10', '#E4DCF0', 1.2)
        + part(rr(-0.4, -2, 3, 4.4, 1.2), k.c2, { 'stroke-width': 1 })
        + part(rr(-4.4, -14, 11, 5, 2), k.c1, { 'stroke-width': 1.6 })
        + part(bulb, mixc(k.c1, '#FFFFFF', 0.75)) + clipTo(bulb, tone('M6 -38 C18 -34 18 -16 8 -11 L18 -11 L18 -38Z', '#5A3A8A', 0.16))
        + part(heartD(3, -23.4, 6.6), k.c2, { 'stroke-width': 1.5 }) + flat(heartD(1.6, -25, 2.8), lightOf(k.c2, 0.8))
        + shine(-3.6, -30, 1.8) + flat(sparkleD(18, -36, 3), '#FFFFFF') + flat(sparkleD(-10, -30, 2.2), mixc(k.c1, '#FFFFFF', 0.4));
    },
  },
  {
    id: 'credencial', slot: 'cuello', label: 'Credencial de concierto', price: 60, colors: ['#FF8FC0', '#C9A6FF'],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g);
      // la cinta con corazoncitos y la tarjeta en su funda
      const strap = clipBody(g, part(nk.band(5.6), k.c1, { 'stroke-width': 1.6 }) + line(nk.curve(0), '#FFFFFF', 1.4, { 'stroke-dasharray': '1.6 4', opacity: 0.9 }));
      const cx = 100, cy = nk.cy + 2, w = 22 * S, h = Math.min(25 * S, BOTTOM + 3 - (cy + 5));
      const x = cx - w / 2, y = cy + 5;
      const card = line(`M${f(cx)} ${f(cy - 1)} V${f(y + 1)}`, shade(k.c1, -1), 1.6) + part(rr(cx - 2.4, cy - 2, 4.8, 4, 1.2), SILVER, { stroke: SILVER_D, 'stroke-width': 1 })
        + part(rr(x, y, w, h, 2.2), '#FFFFFF', { 'stroke-width': 1.7 })
        + clipTo(rr(x, y, w, h, 2.2), flat(rr(x, y, w, h * 0.3, 0), k.c2) + flat(rr(x + w * 0.16, y + h * 0.38, w * 0.3, h * 0.36, 1), mixc(k.c1, '#FFFFFF', 0.4)))
        + part(heartD(x + w * 0.7, y + h * 0.54, 2.6), k.c1, { 'stroke-width': 1 })
        + flat(`M${f(x + 2.4)} ${f(y + h - 4)}h1v2.4h-1Zm2 0h2v2.4h-2Zm3 0h1v2.4h-1Zm2 0h1.6v2.4h-1.6Zm2.6 0h1v2.4h-1Z`, OUT)
        + flat(sparkleD(x + w * 0.5, y + h * 0.15, 2), '#FFFFFF') + line(`M${f(x + 2.2)} ${f(y + 2.4)} L${f(x + 2.2)} ${f(y + h - 6)}`, '#FFFFFF', 1.2, { opacity: 0.8 });
      return { front: strap + card };
    },
  },
];

// ── Gatitos ────────────────────────────────────────────────────────
const GATITOS = [
  {
    id: 'gorroGato', slot: 'cabeza', label: 'Gorro de gatito', price: 110, colors: ['#F2D3B0', '#FFB3C6'],
    draw: (g, k) => {
      const d = dome(g, 0.86, 22), s = sc(g);
      // orejitas de tela tejida (detrás del gorro), el gorro y su doblez acanalado
      const ear = (side) => {
        const x = 100 + side * d.bw * 0.3, y = d.top - 21;
        return G({ transform: T(x, y, side * 14, s) }, part('M-11 6 L-4 -17 Q0 -22 4 -17 L11 6Z', k.c1) + flat('M-6 3 L-2 -10 Q0 -13 2 -10 L6 3Z', k.c2));
      };
      let knit = '';
      for (let x = d.x1 + 6; x < d.x2 - 3; x += 6) knit += `M${f(x)} ${f(d.top - 18)} l2 3 l2 -3 M${f(x)} ${f(d.top - 9)} l2 3 l2 -3 M${f(x)} ${f(d.top)} l2 3 l2 -3`;
      let ribs = '';
      for (let x = d.x1 + 1; x < d.x2; x += 4.5) ribs += `M${f(x)} ${f(d.ys - 6)} v8`;
      return {
        top: ear(-1) + ear(1) + part(d.d, k.c1)
          + clipTo(d.d, skipPx(line(knit, seamOf(k.c1, 0.5), 1.1, { opacity: 0.7 })) + tone(`M${f(100 + d.bw * 0.16)} ${f(d.top - 40)} C${f(d.x2 + 12)} ${f(d.top - 30)} ${f(d.x2 + 6)} ${f(d.ys)} ${f(d.x2 - 2)} ${f(d.ys + 6)} L${f(d.x2 + 12)} ${f(d.ys + 6)} L${f(d.x2 + 12)} ${f(d.top - 40)}Z`, '#2A1C30', 0.15))
          + part(d.brim, shade(k.c1, -0.15)) + clipTo(d.brim, line(ribs, seamOf(k.c1, 0.7), 1.2, { opacity: 0.8 }))
          + flat(heartD(100 + d.bw * 0.26, d.ys - 2.6, 2.6), k.c2),
      };
    },
  },
  {
    id: 'gatitoBrazos', slot: 'mano', label: 'Gatito en brazos', price: 90, colors: ['#F2A65A', '#FFFFFF'],
    draw: () => (k) => {
      const dk = shade(k.c1, -0.9);
      return part('M-12 10 C-14 -2 -8 -8 2 -8 C12 -8 16 -2 14 10 Q1 14 -12 10Z', k.c1)
        + line('M8 -6 Q12 0 10 8 M3 -7 Q6 0 4 8', dk, 2, { opacity: 0.8 })
        + part('M12 6 C22 6 24 -6 18 -12 C20 -4 18 2 11 2Z', k.c1, { 'stroke-width': 1.8 })
        + part('M-13 -20 L-14 -34 L-5 -27Z', k.c1, { 'stroke-width': 1.8 }) + part('M13 -20 L14 -34 L5 -27Z', k.c1, { 'stroke-width': 1.8 })
        + flat('M-11.6 -23 L-12.2 -30.6 L-7.4 -27Z M11.6 -23 L12.2 -30.6 L7.4 -27Z', '#FFB3C6')
        + part(ellD(0, -18, 14, 12), k.c1)
        + clipTo(ellD(0, -18, 14, 12), flat(ellD(0, -11, 8, 5.4), k.c2) + line('M-4 -30 Q-3 -26 -4 -23 M0 -30.6 V-25 M4 -30 Q3 -26 4 -23', dk, 1.8))
        + dot(-5.4, -18, 2.2, OUT) + dot(5.4, -18, 2.2, OUT) + shine(-6, -19, 0.8) + shine(4.8, -19, 0.8)
        + flat('M-1.4 -14.4 h2.8 l-1.4 1.6Z', '#F28CA8') + line('M-3 -12 q1.5 1.6 3 0 q1.5 1.6 3 0', OUT, 1.2)
        + dot(-9, -13.4, 2.4, '#FF9EB5', { opacity: 0.7 }) + dot(9, -13.4, 2.4, '#FF9EB5', { opacity: 0.7 })
        + part(ellD(-6, 8, 4.4, 3.2), k.c2, { 'stroke-width': 1.4 }) + part(ellD(5, 8.4, 4.4, 3.2), k.c2, { 'stroke-width': 1.4 });
    },
  },
];

// ── Café ───────────────────────────────────────────────────────────
const CAFE = [
  {
    id: 'delantalBarista', slot: 'ropa', label: 'Delantal de barista', price: 140, colors: ['#8A5A3C', '#F4E6D0'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const aw = g.w * 0.3, y0 = nl.yc + 2, yW = Math.min(y0 + 9, BOTTOM - 16);
      const apronD = `M${f(100 - aw * 0.58)} ${f(y0)} Q100 ${f(y0 - 1.5)} ${f(100 + aw * 0.58)} ${f(y0)} L${f(100 + aw * 0.6)} ${f(yW)} L${f(100 + aw)} ${f(BOTTOM + 2)} Q100 ${f(BOTTOM + 5)} ${f(100 - aw)} ${f(BOTTOM + 2)} L${f(100 - aw * 0.6)} ${f(yW)}Z`;
      // tiras de cuero al cuello y la cinta de la cintura
      const ties = clipBody(g, line(`M${f(100 - aw * 0.5)} ${f(y0 + 1)} L${f(g.l + 8)} ${f(g.face.cheekY + 12)} M${f(100 + aw * 0.5)} ${f(y0 + 1)} L${f(g.r - 8)} ${f(g.face.cheekY + 12)}`, shade(k.c1, -0.8), 3.4)
        + part(bandD(g.l - 10, g.r + 10, yW - 1.5, 3.2, 2), shade(k.c1, -0.5), { 'stroke-width': 1.6 }));
      const ph = Math.min(9, BOTTOM - yW - 9), py = BOTTOM - ph - 6;
      // bolsillo de abajo con sus divisiones, un lápiz asomando y el logo de la tacita
      const pocket = part(`M${f(100 - aw * 0.72)} ${f(py)} H${f(100 + aw * 0.72)} V${f(py + ph)} H${f(100 - aw * 0.72)}Z`, shade(k.c1, -0.25), { 'stroke-width': 1.5 })
        + stitch(`M100 ${f(py + 1)} V${f(py + ph - 1)} M${f(100 - aw * 0.66)} ${f(py + 1.6)} H${f(100 + aw * 0.66)}`, k.c2, 1);
      const pen = part(rr(100 + aw * 0.3, py - 7, 3.2, 9, 1), '#FFD45C', { 'stroke-width': 1.2 }) + flat(rr(100 + aw * 0.3, py - 7, 3.2, 2.4, 1), '#FF7FA8');
      const ly = yW + Math.max(4, (py - yW) * 0.42);
      const logo = disc(100, ly, 6.6, 6.6, k.c2, { 'stroke-width': 1.4 })
        + part(`M${f(96.4)} ${f(ly - 2)} H${f(103.6)} L${f(103)} ${f(ly + 2.6)} Q100 ${f(ly + 4)} ${f(97)} ${f(ly + 2.6)}Z`, k.c1, { 'stroke-width': 1 })
        + line(`M${f(103.4)} ${f(ly - 1)} q2.6 0.4 1 2.6`, k.c1, 1.2) + line(`M99 ${f(ly - 3.4)} q-1 -1.4 0 -2.6 M101.4 ${f(ly - 3.4)} q-1 -1.4 0 -2.6`, k.c1, 1, { opacity: 0.9 });
      return {
        outfit: ties + pen + part(apronD, k.c1)
          + clipTo(apronD, stitch(`M${f(100 - aw * 0.53)} ${f(y0 + 2.2)} Q100 ${f(y0 + 0.8)} ${f(100 + aw * 0.53)} ${f(y0 + 2.2)}`, k.c2, 1.1)
            + stitch(`M${f(100 - aw * 0.55)} ${f(yW + 2)} L${f(100 - aw * 0.92)} ${f(BOTTOM)} M${f(100 + aw * 0.55)} ${f(yW + 2)} L${f(100 + aw * 0.92)} ${f(BOTTOM)}`, k.c2, 1)
            + roundShade(apronD, k.c1, { ox: 2, oy: 3, op: 0.26 }))
          + pocket + logo,
      };
    },
  },
  {
    id: 'pinzasCafe', slot: 'cabeza', label: 'Pinzas de granito de café', price: 50, colors: ['#7A4A30', '#FFFFFF'],
    draw: (g, k) => {
      const one = (xf, sink, inner, rot) => { const p = onTop(g, xf, sink); return G({ transform: T(p.x, p.y, p.rot * 0.6 + rot, sc(g)) }, inner); };
      // dos granos y una tacita de latte con su corazón
      const cup = clipBar(13) + part('M-8 -10 H8 L6.4 2 Q0 4.4 -6.4 2Z', k.c2) + line('M7.6 -7 q4.4 0.4 2.6 4.6', OUT, 1.6)
        + part(ellD(0, -10, 8, 2.6), shade(k.c1, 0.4), { 'stroke-width': 1.4 }) + flat(heartD(0, -10.2, 1.8), '#FFFFFF');
      return { top: one(-0.31, 15, clipBar(12) + G({ transform: 'translate(0 -4)' }, bean(9, k.c1)), -28) + one(-0.15, 10, clipBar(10) + G({ transform: 'translate(0 -3)' }, bean(7, shade(k.c1, 0.3))), 18) + one(0.2, 9, cup, 8) };
    },
  },
];

// ── Plantas ────────────────────────────────────────────────────────
const PLANTAS = [
  {
    id: 'brote', slot: 'cabeza', label: 'Brotecito', price: 45, colors: ['#7FC97A'],
    draw: (g, k) => {
      const p = onTop(g, 0.02, 3), s = sc(g) * 1.15;
      const leafD = (side) => `M0 -14 C${f(side * 4)} -22 ${f(side * 14)} -25 ${f(side * 19)} -20 C${f(side * 15)} -12 ${f(side * 6)} -10 0 -14Z`;
      return {
        top: G({ transform: T(p.x, p.y, p.rot * 0.5 + 4, s) },
          line('M0 2 C-1 -4 1 -9 0 -15', OUT, 4.6) + line('M0 2 C-1 -4 1 -9 0 -15', shade(k.c1, -0.4), 2.6)
          + part(leafD(-1), shade(k.c1, -0.15), { 'stroke-width': 1.8 }) + part(leafD(1), k.c1, { 'stroke-width': 1.8 })
          + line('M-1 -15 Q-8 -19.4 -15 -19.6', shade(k.c1, -0.9), 1.1, { opacity: 0.8 }) + line('M1 -15 Q8 -19.4 15 -19.6', shade(k.c1, -0.9), 1.1, { opacity: 0.8 })
          + shine(8, -21, 1.3) + P(`M-12 -26 C-13.6 -23.6 -13.6 -22 -12 -21.4 C-10.4 -22 -10.4 -23.6 -12 -26Z`, { fill: '#BFE8FF', stroke: '#6AA8D8', 'stroke-width': 1, 'data-r': 'part' })),
      };
    },
  },
  {
    id: 'macetita', slot: 'mano', label: 'Macetita con su planta', price: 60, colors: ['#E08A5E', '#7FC97A'],
    draw: () => (k) => {
      const potD = 'M-10 -6 L-7.6 11 Q0 14 7.6 11 L10 -6Z';
      const lf = (a, len, c) => G({ transform: `rotate(${a})` }, part(`M0 0 C-4 -${len * 0.3} -4 -${len * 0.8} 0 -${len} C4 -${len * 0.8} 4 -${len * 0.3} 0 0Z`, c, { 'stroke-width': 1.5 }) + line(`M0 -2 V-${f(len * 0.8)}`, shade(c, -0.8), 1, { opacity: 0.7 }));
      return G({ transform: 'translate(0 -14)' }, lf(-38, 15, shade(k.c2, -0.2)) + lf(36, 14, shade(k.c2, -0.2)) + lf(-4, 18, k.c2) + lf(-70, 10, lightOf(k.c2, 0.4)) + lf(68, 10, lightOf(k.c2, 0.4)))
        + part(potD, k.c1) + clipTo(potD, tone('M4 -8 H12 V14 H5Z', '#2A1C30', 0.18))
        + part(rr(-12, -11, 24, 6, 2), lightOf(k.c1, 0.5), { 'stroke-width': 1.7 }) + flat(ellD(0, -10.6, 9.6, 1.6), '#6B4A3A')
        + dot(-3.6, 2, 1.3, OUT) + dot(3.6, 2, 1.3, OUT) + line('M-1.6 4.4 q1.6 1.6 3.2 0', OUT, 1.1)
        + dot(-6, 4.6, 1.6, '#FF9EB5', { opacity: 0.7 }) + dot(6, 4.6, 1.6, '#FF9EB5', { opacity: 0.7 }) + shine(-7, -3, 1);
    },
  },
];

// ── Astrología ─────────────────────────────────────────────────────
const ASTRO = [
  {
    id: 'medallonZodiaco', slot: 'cuello', label: 'Medallón del zodiaco', price: 110, colors: [GOLD, '#2E3A78'],
    draw: (g, k) => {
      const nk = neckGeo(g), S = neckScale(g);
      const dk = shade(k.c1, -1.6);
      const chain = clipBody(g, line(nk.d, dk, 4) + line(nk.d, k.c1, 2.2, { 'stroke-dasharray': '2.6 1.4' }));
      const x = 100, y = nk.cy + 12.6 * S, r = 11.4 * S;
      let ticks = '';
      for (let i = 0; i < 12; i++) { const a = (i * 30 * Math.PI) / 180; ticks += `M${f(x + Math.cos(a) * r * 0.62)} ${f(y + Math.sin(a) * r * 0.62)} L${f(x + Math.cos(a) * r * 0.78)} ${f(y + Math.sin(a) * r * 0.78)}`; }
      const med = P(ellD(x, nk.cy + 1.6, 1.9, 2.4), { fill: 'none', stroke: dk, 'stroke-width': 1.4, 'data-r': 'line' })
        + disc(x, y, r, r, k.c1, { stroke: dk, 'stroke-width': 1.8 }) + disc(x, y, r * 0.8, r * 0.8, k.c2, { stroke: dk, 'stroke-width': 1.2 })
        + skipPx(line(ticks, k.c1, 1, { opacity: 0.9 }))
        + flat(crescentD(x - r * 0.15, y + r * 0.05, r * 0.42), k.c1) + flat(puffStarD(x + r * 0.32, y - r * 0.28, r * 0.22), '#FFF3C4')
        + shine(x - r * 0.55, y - r * 0.55, Math.max(0.9, r * 0.14)) + flat(sparkleD(x + r + 3, y - r * 0.4, 2.2), '#FFFFFF');
      return { front: chain + med };
    },
  },
  {
    id: 'pecasConstelacion', slot: 'cara', label: 'Pecas de constelación', price: 50, colors: ['#FFD45C'],
    draw: (g, k, { e }) => {
      // tres estrellitas por mejilla unidas por su línea punteada
      const side = (s) => {
        const pts = [[e.dx + 3, 14], [e.dx + 12.4, 17.4], [e.dx + 7.4, 24.4]].map(([dx, dy]) => [100 + s * dx, e.y + dy]);
        return skipPx(line(`M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}`, mixc(k.c1, '#FFFFFF', 0.3), 1, { 'stroke-dasharray': '1.4 1.6', opacity: 0.95 }))
          + pts.map(([x, y], i) => P(puffStarD(x, y, i === 1 ? 4.6 : 3.6, 0.52), { fill: k.c1, stroke: shade(k.c1, -1.8), 'stroke-width': 1.1, 'data-r': 'part' })).join('');
      };
      return { under: side(-1) + side(1) };
    },
  },
];

// ── Fútbol ─────────────────────────────────────────────────────────
const FUTBOL = [
  {
    id: 'bufandaHincha', slot: 'cuello', label: 'Bufanda de hincha', price: 90, colors: ['#7FB8F0', '#FFFFFF'],
    draw: (g, k) => {
      const nk = neckGeo(g, { dy: 1 }), S = neckScale(g);
      const band = nk.band(10);
      let st = '';
      for (let x = nk.L - 4; x < nk.R + 4; x += 14) st += `M${f(x)} ${f(nk.y - 14)} h7 v40 h-7Z`;
      const wrap = clipBody(g, tone(nk.band(3, 6.6), '#2A1C30', 0.18) + part(band, k.c1) + clipTo(band, flat(st, k.c2) + tone(`M${f(nk.L)} ${f(nk.y + 1)} Q100 ${f(nk.y + 1 + nk.drop * 2)} ${f(nk.R)} ${f(nk.y + 1)} V${f(nk.y + 8)} H${f(nk.L)}Z`, '#2A1C30', 0.14))
        + P(band, { fill: 'none', stroke: OUT, 'stroke-width': 2.2, 'data-r': 'line' }));
      // la punta que cuelga adelante, con sus rayas y los flecos
      const x0 = 100 + 9 * S, y0 = nk.cy - 2, w = 15 * S, h = Math.min(30, BOTTOM - 1 - y0);
      const end = poly([[x0, y0], [x0 + w, y0 - 1], [x0 + w + 3, y0 + h], [x0 + 3, y0 + h + 1]]);
      let es = '';
      for (let i = 0; i < 4; i++) { const yy = y0 + 4 + i * 7; es += poly([[x0 - 1, yy], [x0 + w + 2, yy - 0.6], [x0 + w + 2.6, yy + 3.4], [x0 - 0.4, yy + 4]]); }
      let fr = '';
      for (let i = 0; i <= 4; i++) { const xx = x0 + 3.4 + i * (w / 4); fr += `M${f(xx)} ${f(y0 + h + 0.6)} l0.4 4`; }
      const tail = part(end, k.c1) + clipTo(end, flat(es, k.c2) + tone(poly([[x0 + w * 0.6, y0], [x0 + w + 4, y0], [x0 + w + 4, y0 + h + 2], [x0 + w * 0.7, y0 + h + 2]]), '#2A1C30', 0.16)) + line(fr, k.c2 === '#FFFFFF' ? shade(k.c1, -0.4) : k.c2, 2);
      return { front: wrap + tail + part(ellD(x0 + w / 2, y0, w * 0.55, 3.6), shade(k.c1, -0.25), { 'stroke-width': 1.6 }) };
    },
  },
  {
    id: 'balonMano', slot: 'mano', label: 'Balón de fútbol', price: 55, colors: ['#FFFFFF', '#2E3446'],
    draw: () => (k) => G({ transform: 'translate(2 -9)' }, soccer(13, k.c1, k.c2)),
  },
];

// ── Terror bonito ──────────────────────────────────────────────────
const TERROR = [
  {
    id: 'tornillos', slot: 'cabeza', label: 'Tornillos de monstruito', price: 60, colors: [SILVER, '#8ED07A'],
    draw: (g, k) => {
      const y = g.face.y - 6, half = g.chordAt(y) / 2, s = sc(g);
      // un tornillo a cada lado de la cabeza y una costurita en la frente
      const bolt = (side) => {
        const x = 100 + side * (half - 2);
        return G({ transform: T(x, y, 0, s) },
          part(rr(side < 0 ? -11 : 1, -4.4, 10, 8.8, 1.4), shade(k.c1, -0.2), { stroke: shade(k.c1, -2.2), 'stroke-width': 1.8 })
          + part(rr(side < 0 ? -19 : 9, -8, 10, 16, 2), k.c1, { stroke: shade(k.c1, -2.2), 'stroke-width': 2 })
          + line(`M${side < 0 ? -14 : 14} -4.6 V4.6`, shade(k.c1, -1.4), 1.6) + shine(side < 0 ? -16.4 : 11.6, -4.6, 1.2));
      };
      const sy = g.face.y - 30, sx = 100 + g.w * 0.16;
      const stitchX = line(`M${f(sx - 9)} ${f(sy + 1)} Q${f(sx)} ${f(sy - 2)} ${f(sx + 9)} ${f(sy + 1)}`, shade(k.c2, -1.6), 1.6)
        + line(`M${f(sx - 6)} ${f(sy - 3)} l1 6 M${f(sx - 1)} ${f(sy - 4)} l0.6 6 M${f(sx + 4)} ${f(sy - 3.4)} l-0.4 6`, shade(k.c2, -1.6), 1.4);
      return { top: bolt(-1) + bolt(1) + stitchX };
    },
  },
  {
    id: 'mochilaAtaud', slot: 'espalda', label: 'Mochila de ataúd', price: 130, colors: ['#5E3A62', '#FFB3C6'],
    draw: (g, k) => {
      const w = 30, h = 44, x = Math.min(g.r - 8, 198 - w), y = g.ys - 14;
      const coffin = poly([[x + w * 0.26, y - h / 2], [x + w * 0.74, y - h / 2], [x + w, y - h * 0.2], [x + w * 0.8, y + h / 2], [x + w * 0.2, y + h / 2], [x, y - h * 0.2]]);
      const inner = poly([[x + w * 0.32, y - h / 2 + 4], [x + w * 0.68, y - h / 2 + 4], [x + w - 4, y - h * 0.2], [x + w * 0.76, y + h / 2 - 4], [x + w * 0.24, y + h / 2 - 4], [x + 4, y - h * 0.2]]);
      return {
        back: line(`M${f(x + 8)} ${f(y - h / 2 + 1)} q6 -9 12 0`, OUT, 4.6) + line(`M${f(x + 8)} ${f(y - h / 2 + 1)} q6 -9 12 0`, shade(k.c1, -0.6), 2.4)
          + part(coffin, k.c1) + clipTo(coffin, tone(`M${f(x + w * 0.62)} ${f(y - h)} H${f(x + w + 4)} V${f(y + h)} H${f(x + w * 0.62)}Z`, '#2A1C30', 0.2))
          + P(inner, { fill: 'none', stroke: k.c2, 'stroke-width': 1.8, 'stroke-dasharray': '2.4 1.8', 'data-r': 'line' })
          + part(heartD(x + w / 2, y - 2, 5.4), k.c2, { 'stroke-width': 1.5 }) + shine(x + w / 2 - 2.6, y - 4, 1)
          + Cir(x + w / 2 - 7, y + 10, 1.4, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 0.8, 'data-r': 'part' }) + Cir(x + w / 2 + 7, y + 10, 1.4, { fill: GOLD, stroke: GOLD_D, 'stroke-width': 0.8, 'data-r': 'part' })
          + line(`M${f(x + w * 0.3)} ${f(y - h / 2 + 2.4)} H${f(x + w * 0.62)}`, lightOf(k.c1, 0.8), 1.3, { opacity: 0.8 }),
        front: strapFront(g, shade(k.c1, -0.4)),
      };
    },
  },
];

const PALETTE = ['#2E4A8A', '#3E8A62', '#2A2230', '#C9A6FF', '#FF8FC0', '#F2D3B0', '#F2A65A', '#8A5A3C', '#7A4A30', '#7FC97A', '#E08A5E', '#FFD45C', '#7FB8F0', '#FFFFFF', '#5E3A62', '#FFB6CC'];
const tag = (pack, list) => list.map((it) => ({ ...it, pack, season: 'pack', palette: PALETTE, vibes: ['pack'] }));

export const PACK_WEAR = [
  ...tag('anime', ANIME), ...tag('kpop', KPOP), ...tag('gatitos', GATITOS), ...tag('cafe', CAFE),
  ...tag('plantas', PLANTAS), ...tag('astrologia', ASTRO), ...tag('futbol', FUTBOL), ...tag('terror', TERROR),
];
