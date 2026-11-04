// Ropa: lo que cubre el cuerpo de la mochi. Una mochi no tiene brazos ni
// cintura, así que la ropa es la parte de abajo del cuerpo vestida: escote
// debajo de la boca, prenda recortada a la silueta y, en vestidos y
// faldas, el vuelo que se sale un poco por los costados.
//
// Cada prenda se piensa como la de verdad: de qué tela es, dónde lleva
// costuras, ribetes y botones, cómo cae. Las herramientas comunes
// (sombra bajo el cuello, volumen, falda con pliegues, encaje) están en
// kit.js.

import {
  BOTTOM, Cir, E, G, GOLD, GOLD_D, OUT, P, SILVER, SILVER_D, ball, bandD, bow, button, clipBody,
  clipTo, crescentD, disc, dot, f, flat, flower, garment, heartD, lace, laceAlong, lightOf, line,
  lumOf, mixc, neckBand, neckCurve, neckLine, neckRibs, neckShadow, neckYAt, nid, onlyPx, part,
  puffStarD, roundShade, rr, seamOf, shade, shine, skipPx, skirt, skirtPath, smileD, smileYAt,
  sparkleD, stitch, strip, tone,
} from './kit.js';

export { neckBand, skirt };

// ── Ayudas de la ropa ────────────────────────────────────────────
// Altura del borde de abajo del cuerpo en x (sube un poco a los costados).
const bottomAt = (g, x) => { const u = Math.min(1, Math.abs(x - 100) / g.hw); return BOTTOM - 10 * u * u * u; };
// Un punto dentro de la prenda: fx a lo ancho (±0.5), fv de 0 (escote) a 1 (ruedo).
function at(g, nl, fx, fv, m = 4) {
  const x = 100 + g.w * fx;
  const y0 = neckYAt(g, nl, x) + m, y1 = bottomAt(g, x) - m;
  return [x, y0 + (y1 - y0) * fv];
}
// Puño/ruedo de tejido elástico abajo (con sus rayitas y la tela de
// arriba que hace bolsa encima).
function hemRib(g, h, fill, { ribs = true, sag = 3 } = {}) {
  const y = BOTTOM - h, x1 = g.l - 10, x2 = g.r + 10;
  let d = '';
  if (ribs) for (let x = g.l + 2; x < g.r; x += 4.5) d += `M${f(x)} ${f(smileYAt(x1, x2, y, sag, x) + 2)} V${f(bottomAt(g, x) - 1)}`;
  return tone(bandD(x1, x2, y - 3, 3, sag), '#2A1C30', 0.16)
    + part(`M${f(x1)} ${f(y)} Q100 ${f(y + sag * 2)} ${f(x2)} ${f(y)} V196 H${f(x1)}Z`, fill)
    + (ribs ? line(d, seamOf(fill, 0.8), 1.2, { opacity: 0.85 }) : '');
}
// Dobladillo cosido: una puntada a lo largo del ruedo.
const hemStitch = (g, h, col) => stitch(smileD(g.l - 10, g.r + 10, BOTTOM - h, 3), col, 1.3);
// Cuello "Peter Pan": dos solapas redondas que abrazan el escote.
function collarLobes(g, nl, len, depth, fill, { gap = 1.5, n = 10 } = {}) {
  const one = (s) => {
    const top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = 100 + s * (gap + len * t);
      const y = neckYAt(g, nl, x) - 0.5;
      const dd = depth * Math.pow(Math.sin(Math.PI * Math.min(1, 0.18 + t * 0.82)), 0.7) * (1 - t * 0.35);
      top.push([x, y]); bot.push([x, y + dd]);
    }
    const pts = top.concat(bot.reverse());
    return part(`M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}Z`, fill);
  };
  return one(-1) + one(1);
}
// Volante en el escote: puntilla que cuelga de la curva del cuello.
const ruffleNeck = (g, nl, fill, r = 3.2) => laceAlong(g.l - 8, g.r + 8, (x) => neckYAt(g, nl, x) - 0.5, r, fill, { band: 0.6 });
// Tirante o correa: banda de ancho w de (x1,y1) a (x2,y2).
function strap(x1, y1, x2, y2, w, fill, o = {}) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
  return part(`M${f(x1 + nx)} ${f(y1 + ny)} L${f(x2 + nx)} ${f(y2 + ny)} L${f(x2 - nx)} ${f(y2 - ny)} L${f(x1 - nx)} ${f(y1 - ny)}Z`, fill, o);
}
// Rayas horizontales que dan la vuelta al cuerpo (siguen la curva).
function stripes(g, y0, y1, step, h, col) {
  let d = '';
  for (let y = y0; y < y1; y += step) d += bandD(g.l - 10, g.r + 10, y, h, 3);
  return flat(d, col);
}
// Estampado esparcido: `mk(x, y, i)` en puntos repartidos en la prenda.
const scatter = (g, nl, pts, mk) => pts.map(([fx, fv], i) => { const [x, y] = at(g, nl, fx, fv); return mk(x, y, i); }).join('');

export const OUTFIT_ITEMS = [
  {
    id: 'sueter', label: 'Suéter tejido', vibes: ['aesthetic', 'cottagecore'], price: 140, colors: ['#E8C9A0', '#C9A06A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: -3, center: 24 });
      const sm = seamOf(k.c1, 0.8);
      // LA SEÑA: cuello alto de elástico, un tubo grueso doblado que sube
      // hasta debajo de la boca, con su doblez y su sombra
      const up = 6, th = 13, L = g.l - 10, R = g.r + 10, cc = nl.yc + (nl.yc - nl.ys) * 0.95;
      const band = (a, b) => `M${f(L)} ${f(nl.ys + a)} Q100 ${f(cc + a)} ${f(R)} ${f(nl.ys + a)} L${f(R)} ${f(nl.ys + b)} Q100 ${f(cc + b)} ${f(L)} ${f(nl.ys + b)}Z`;
      const collarD = band(-up, -up + th);
      let ribs = '';
      for (let x = g.l - 4; x <= g.r + 4; x += 4.4) { const y = neckYAt(g, nl, x); ribs += `M${f(x - 1)} ${f(y - up - 1)} h2 V${f(y - up + th + 1)} h-2Z`; }
      const collar = neckShadow(g, nl, -up + th, 5, 0.26)
        + part(collarD, k.c2) + clipTo(collarD, flat(ribs, seamOf(k.c2, 0.6), { opacity: 0.9 })
          + tone(band(-up + th * 0.5, -up + th * 0.5 + 2.4), '#2A1C30', 0.22) + flat(band(-up + 0.6, -up + 2.4), lightOf(k.c2, 0.8), { opacity: 0.9 }));
      // trenzas gruesas a los costados (soga de eslabones en S)
      const cable = (x) => {
        const y0 = neckYAt(g, nl, x) - up + th + 4, y1 = BOTTOM - 13;
        let links = '';
        for (let y = y0; y < y1; y += 5.2) links += part(`M${f(x - 4.8)} ${f(y - 2.6)} C${f(x - 1.4)} ${f(y - 6)} ${f(x + 5.4)} ${f(y - 0.6)} ${f(x + 4.8)} ${f(y + 3)} C${f(x + 1.4)} ${f(y + 5.2)} ${f(x - 5.4)} ${f(y + 0.6)} ${f(x - 4.8)} ${f(y - 2.6)}Z`, lightOf(k.c1, 0.5), { stroke: sm, 'stroke-width': 1.1 });
        let px = '';
        for (let y = y0 - 2; y < y1; y += 4.6) px += `M${f(x - 3.4)} ${f(y + 3)} L${f(x + 3.4)} ${f(y - 1.2)}`;
        return skipPx(tone(`M${f(x - 8)} ${f(y0 - 4)} H${f(x + 8)} V${f(y1 + 2)} H${f(x - 8)}Z`, '#2A1C30', 0.12) + links)
          + onlyPx(line(`M${f(x - 6)} ${f(y0 - 3)} V${f(y1 + 1)} M${f(x + 6)} ${f(y0 - 3)} V${f(y1 + 1)}`, sm, 2) + line(px, lightOf(k.c1, 0.9), 2.8));
      };
      let moss = '';
      for (let y = nl.yc + 8, r = 0; y < BOTTOM - 12; y += 4, r++) for (let x = 100 - g.w * 0.11 + (r % 2) * 2.5; x < 100 + g.w * 0.11; x += 5) moss += `M${f(x)} ${f(y)} l1.4 1.4`;
      const cx = g.w * 0.23;
      return {
        outfit: garment(g, k.c1, {
          side: -3, center: 24,
          pattern: skipPx(line(moss, sm, 1, { opacity: 0.55 })),
          extra: cable(100 - cx) + cable(100 + cx) + hemRib(g, 10, k.c2) + collar,
        }).svg,
      };
    },
  },
  {
    id: 'hoodie', label: 'Hoodie', vibes: ['y2k', 'gamer', 'deportiva'], price: 150, colors: ['#B8A1FF', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: -2, center: 24 });
      const sm = seamOf(k.c1);
      // LA SEÑA: la capucha caída (un rollo gordo con el forro claro a la
      // vista) y dos cordones largos con sus puntas
      const cc = nl.yc + (nl.yc - nl.ys) * 0.95, L = g.l - 10, R = g.r + 10;
      const band = (a, b) => `M${f(L)} ${f(nl.ys + a)} Q100 ${f(cc + a)} ${f(R)} ${f(nl.ys + a)} L${f(R)} ${f(nl.ys + b)} Q100 ${f(cc + b)} ${f(L)} ${f(nl.ys + b)}Z`;
      const hoodD = band(-3, 13);
      const lining = lumOf(k.c2) > 0.85 && lumOf(k.c1) > 0.75 ? shade(k.c2, -0.5) : k.c2;
      const hood = neckShadow(g, nl, 13, 6, 0.28)
        + part(hoodD, shade(k.c1, 0.15)) + clipTo(hoodD, flat(band(-3, 4), lining) + tone(band(4, 6.4), '#2A1C30', 0.25) + line(neckCurve(g, nl, 9.5), lightOf(k.c1, 0.7), 1.6, { opacity: 0.8 }));
      const yo = nl.yc + 10, ly = BOTTOM - 4;
      const cordD = (s) => `M${f(100 + s * 6.5)} ${f(yo)} Q${f(100 + s * 8.5)} ${f((yo + ly) / 2)} ${f(100 + s * 7)} ${f(ly)}`;
      const cord = (s) => line(cordD(s), shade(k.c1, -2), 4.8) + line(cordD(s), k.c2, 2.8)
        + part(rr(100 + s * 7 - 2.2, ly - 1, 4.4, 6, 1.2), shade(k.c2, -0.8), { 'stroke-width': 1.3 })
        + Cir(100 + s * 6.5, yo, 2.2, { fill: SILVER, stroke: SILVER_D, 'stroke-width': 1.1, 'data-r': 'part' });
      // bolsillo canguro con sus aberturas en sombra
      const yp = Math.max(nl.yc + 17, BOTTOM - 22), yb = BOTTOM - 7, pw = g.w * 0.27;
      const pocketD = `M${f(100 - pw)} ${f(yb)} L${f(100 - pw * 0.7)} ${f(yp)} Q100 ${f(yp - 2)} ${f(100 + pw * 0.7)} ${f(yp)} L${f(100 + pw)} ${f(yb)}Z`;
      const pocket = part(pocketD, shade(k.c1, 0.12))
        + tone(`M${f(100 - pw)} ${f(yb)} L${f(100 - pw * 0.7)} ${f(yp)} L${f(100 - pw * 0.7 + 4)} ${f(yp + 1)} L${f(100 - pw + 4)} ${f(yb)}Z M${f(100 + pw)} ${f(yb)} L${f(100 + pw * 0.7)} ${f(yp)} L${f(100 + pw * 0.7 - 4)} ${f(yp + 1)} L${f(100 + pw - 4)} ${f(yb)}Z`, '#2A1C30', 0.34)
        + skipPx(stitch(`M${f(100 - pw * 0.7 + 3)} ${f(yp + 2.6)} Q100 ${f(yp + 0.6)} ${f(100 + pw * 0.7 - 3)} ${f(yp + 2.6)}`, sm));
      return {
        outfit: garment(g, k.c1, {
          side: -2, center: 24,
          extra: pocket + hemRib(g, 7, shade(k.c1, -0.25)) + hood + cord(-1) + cord(1),
        }).svg,
      };
    },
  },
  {
    id: 'camiseta', label: 'Camiseta de corazón', vibes: ['kawaii'], price: 90, colors: ['#FFFFFF', '#FF6F91'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 25 });
      // LA SEÑA: un corazón grande estampado en el pecho
      const s = Math.min(14, (BOTTOM - nl.yc) * 0.54);
      const hx = 100, hy = nl.yc + s * 0.95 + 1.5;
      const print = part(heartD(hx, hy, s), k.c2, { stroke: shade(k.c2, -1.8), 'stroke-width': 2 })
        + flat(heartD(hx - s * 0.16, hy - s * 0.12, s * 0.6), lightOf(k.c2, 0.7))
        + shine(hx - s * 0.5, hy - s * 0.3, s * 0.17) + shine(hx - s * 0.25, hy - s * 0.48, s * 0.08)
        + skipPx(flat(sparkleD(hx - s * 1.9, hy - s * 0.5, 2.8), k.c2) + flat(sparkleD(hx + s * 1.85, hy + s * 0.1, 2.3), k.c2));
      return {
        outfit: garment(g, k.c1, {
          side: 6, center: 25,
          extra: print + hemStitch(g, 5, seamOf(k.c1, 0.7))
            + neckShadow(g, nl, 5, 3.5, 0.18) + neckBand(g, nl, 5, k.c2) + neckRibs(g, nl, 0.8, 4.4, seamOf(k.c2, 0.7)),
        }).svg,
      };
    },
  },
  {
    id: 'vestido', label: 'Vestido con vuelo', vibes: ['coquette', 'princesa', 'cottagecore'], price: 180, colors: ['#FF9EC4', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const yW = Math.min(nl.yc + 12, BOTTOM - 16);
      const hw = g.chordAt(yW) / 2 + 2;
      const fold = line(`M${f(100 - g.w * 0.18)} ${f(neckYAt(g, nl, 100 - g.w * 0.18) + 4)} Q${f(100 - g.w * 0.17)} ${f(yW - 4)} ${f(100 - g.w * 0.15)} ${f(yW)} M${f(100 + g.w * 0.18)} ${f(neckYAt(g, nl, 100 + g.w * 0.18) + 4)} Q${f(100 + g.w * 0.17)} ${f(yW - 4)} ${f(100 + g.w * 0.15)} ${f(yW)}`, seamOf(k.c1, 0.7), 1.2, { opacity: 0.7 });
      return {
        outfit: garment(g, k.c1, { side: 8, center: 26, extra: fold + neckShadow(g, nl, 0, 5, 0.16) }).svg
          + clipBody(g, ruffleNeck(g, nl, k.c2))
          + skirt(g, yW, k.c1, { flare: 8, folds: 7, hem: BOTTOM - 1, trim: k.c2, trimR: 3.4 })
          + strip(bandD(100 - hw, 100 + hw, yW - 3, 6, 2), k.c2) + onlyPx(line(smileD(100 - hw, 100 + hw, yW + 3, 2), shade(k.c2, -1.4), 1.2))
          + bow(100 + g.w * 0.2, yW, 4, 0.58, k.c2),
      };
    },
  },
  {
    id: 'overol', label: 'Overol', vibes: ['cottagecore', 'kawaii'], price: 160, colors: ['#7FA9DE', '#FFF4E0'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24 });
      const den = k.c1, top = seamOf(GOLD, 0.2), dsm = seamOf(den);
      const yB = nl.yc + 2, bw = Math.min(20, g.w * 0.16), yP = Math.min(nl.yc + 17, BOTTOM - 11);
      const L = g.l - 10, R = g.r + 10;
      const bibD = `M${f(100 - bw)} ${f(yP + 2)} L${f(100 - bw)} ${f(yB + 2.5)} Q${f(100 - bw)} ${f(yB)} ${f(100 - bw + 2.5)} ${f(yB)} L${f(100 + bw - 2.5)} ${f(yB)} Q${f(100 + bw)} ${f(yB)} ${f(100 + bw)} ${f(yB + 2.5)} L${f(100 + bw)} ${f(yP + 2)}Z`;
      const ph = Math.max(5, yP - yB - 6);
      const bib = part(bibD, den) + skipPx(stitch(`M${f(100 - bw + 2.2)} ${f(yP + 1)} V${f(yB + 2.4)} Q${f(100 - bw + 2.2)} ${f(yB + 2.2)} ${f(100 - bw + 2.6)} ${f(yB + 2.2)} H${f(100 + bw - 2.6)} Q${f(100 + bw - 2.2)} ${f(yB + 2.2)} ${f(100 + bw - 2.2)} ${f(yB + 2.4)} V${f(yP + 1)}`, top, 1.1))
        + part(rr(100 - 7, yB + 5, 14, ph, 2), shade(den, 0.2), { 'stroke-width': 1.4 })
        + part(heartD(100, yB + 5 + ph / 2, Math.min(3.2, ph * 0.4)), k.c2, { 'stroke-width': 1 });
      // pantalón: pretina con su costura, bolsillos en J y la costura del medio
      const pants = part(`M${f(L)} ${f(yP)} Q100 ${f(yP + 6)} ${f(R)} ${f(yP)} V196 H${f(L)}Z`, den)
        + skipPx(stitch(smileD(L, R, yP + 3, 3), top, 1.1))
        + line(`M100 ${f(yP + 6)} V${BOTTOM + 2}`, dsm, 1.4)
        + line(`M${f(100 - g.w * 0.31)} ${f(smileYAt(L, R, yP, 3, 100 - g.w * 0.31) + 1)} Q${f(100 - g.w * 0.29)} ${f(yP + 10)} ${f(100 - g.w * 0.2)} ${f(yP + 12)} M${f(100 + g.w * 0.31)} ${f(smileYAt(L, R, yP, 3, 100 + g.w * 0.31) + 1)} Q${f(100 + g.w * 0.29)} ${f(yP + 10)} ${f(100 + g.w * 0.2)} ${f(yP + 12)}`, dsm, 1.5);
      // tirantes: del peto a los costados, por debajo de los cachetes
      const sy = g.face.y + 3;
      const straps = strap(100 - bw + 3.5, yB + 2, g.l + 1, sy, 6, shade(den, 0.12)) + strap(100 + bw - 3.5, yB + 2, g.r - 1, sy, 6, shade(den, 0.12))
        + skipPx(stitch(`M${f(100 - bw + 3.5)} ${f(yB + 2)} L${f(g.l + 1)} ${f(sy)} M${f(100 + bw - 3.5)} ${f(yB + 2)} L${f(g.r - 1)} ${f(sy)}`, top, 1));
      // camiseta a rayas debajo
      const tee = stripes(g, nl.ys + 6, BOTTOM, 8, 3.6, mixc(k.c2, den, 0.35));
      return {
        outfit: garment(g, k.c2, {
          side: 4, center: 24,
          extra: tee + neckShadow(g, nl, 3, 3, 0.18) + neckBand(g, nl, 3, shade(k.c2, -0.3), { lit: false })
            + tone(`M${f(L)} ${f(yP - 3)} Q100 ${f(yP + 3)} ${f(R)} ${f(yP - 3)} V${f(yP)} Q100 ${f(yP + 6)} ${f(L)} ${f(yP)}Z`, '#2A1C30', 0.16)
            + pants + bib + straps
            + button(100 - bw + 3.5, yB + 3.5, 2.6, GOLD, { stroke: GOLD_D }) + button(100 + bw - 3.5, yB + 3.5, 2.6, GOLD, { stroke: GOLD_D }),
        }).svg,
      };
    },
  },
  {
    id: 'seifuku', label: 'Uniforme marinero', vibes: ['otaku'], price: 190, colors: ['#2E4A8A', '#D9364F'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 25, v: true });
      const vy = nl.yc + 6, yS = Math.min(nl.yc + 17, BOTTOM - 12);
      const L = g.l - 10, R = g.r + 10;
      // cuello marinero: dos solapas grandes que bajan hasta la V, con dos rayas blancas
      const flap = (s) => {
        const X = s < 0 ? L : R;
        return part(`M${f(X)} ${f(nl.ys - 3)} L100 ${f(vy)} L${f(100 + s * 8)} ${f(vy + 8)} L${f(X)} ${f(nl.ys + 11)}Z`, k.c1)
          + line(`M${f(X)} ${f(nl.ys + 6)} L${f(100 + s * 6.5)} ${f(vy + 4.6)} M${f(X)} ${f(nl.ys + 8.8)} L${f(100 + s * 7.6)} ${f(vy + 7.2)}`, '#FFFFFF', 1.3);
      };
      const blouse = '#FBFAFF';
      return {
        outfit: garment(g, blouse, {
          side: 6, center: 25, v: true,
          extra: tone(`M${f(L)} ${f(nl.ys + 11)} L${f(100 - 8)} ${f(vy + 8)} L100 ${f(vy + 4)} L${f(100 + 8)} ${f(vy + 8)} L${f(R)} ${f(nl.ys + 11)} L${f(R)} ${f(nl.ys + 15)} L${f(100 + 8)} ${f(vy + 12)} L${f(100 - 8)} ${f(vy + 12)} L${f(L)} ${f(nl.ys + 15)}Z`, '#2A1C30', 0.14)
            + flap(-1) + flap(1),
        }).svg
          + skirt(g, yS, k.c1, { flare: 6, pleats: 12 })
          + bow(100, vy + 5, 0, 0.72, k.c2),
      };
    },
  },
  {
    id: 'maid', label: 'Vestido de maid', vibes: ['otaku', 'coquette'], price: 200, colors: ['#2A2230', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 25 });
      const yW = Math.min(nl.yc + 12, BOTTOM - 16), aw = g.w * 0.25;
      const ab = Math.max(nl.yc + 3, yW - 10);
      // delantal: peto con volante, falda con volante y puntilla
      const bibD = `M${f(100 - aw * 0.55)} ${f(yW)} L${f(100 - aw * 0.6)} ${f(ab)} Q100 ${f(ab - 2)} ${f(100 + aw * 0.6)} ${f(ab)} L${f(100 + aw * 0.55)} ${f(yW)}Z`;
      const apronD = `M${f(100 - aw * 0.8)} ${f(yW)} Q100 ${f(yW + 3)} ${f(100 + aw * 0.8)} ${f(yW)} L${f(100 + aw)} ${f(BOTTOM)} Q100 ${f(BOTTOM + 4)} ${f(100 - aw)} ${f(BOTTOM)}Z`;
      const apron = lace(100 - aw - 1, 100 + aw + 1, BOTTOM + 1, 1, 2.8, k.c2)
        + part(apronD, k.c2) + clipTo(apronD, tone(bandD(100 - aw, 100 + aw, yW, 3, 1.5), '#2A1C30', 0.16) + line(`M${f(100 - aw * 0.4)} ${f(yW + 4)} L${f(100 - aw * 0.55)} ${f(BOTTOM)} M${f(100 + aw * 0.4)} ${f(yW + 4)} L${f(100 + aw * 0.55)} ${f(BOTTOM)}`, seamOf(k.c2, 0.6), 1.2, { opacity: 0.8 }))
        + part(bibD, k.c2) + line(`M${f(100 - aw * 0.6)} ${f(ab + 1.6)} Q100 ${f(ab - 0.4)} ${f(100 + aw * 0.6)} ${f(ab + 1.6)}`, seamOf(k.c2, 0.6), 1.1, { 'stroke-dasharray': '1.6 1.6' });
      return {
        outfit: garment(g, k.c1, { side: 6, center: 25, extra: neckShadow(g, nl, 0, 5, 0.2) }).svg
          + lace(g.l - 9, g.r + 9, BOTTOM + 4, 2, 3, k.c2)
          + skirt(g, yW, k.c1, { flare: 6, folds: 6 })
          + apron + strip(bandD(100 - aw * 0.85, 100 + aw * 0.85, yW - 2, 3.6, 1.5), k.c2, { 'stroke-width': 1.6 })
          + collarLobes(g, nl, Math.min(22, g.w * 0.17), 6, k.c2)
          + bow(100, nl.yc + 1.5, 0, 0.42, k.c1, false),
      };
    },
  },
  {
    id: 'yukata', label: 'Yukata', vibes: ['otaku', 'aesthetic'], price: 180, colors: ['#9DCEEF', '#E8648C'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 28, v: true });
      const vy = nl.yc + 6, L = g.l - 10, R = g.r + 10;
      const yO = Math.min(vy + 3, BOTTOM - 16), oh = Math.min(10, BOTTOM - yO - 5);
      const petal = mixc(k.c1, '#FFFFFF', 0.65);
      const prints = scatter(g, nl, [[-0.33, 0.2], [0.3, 0.25], [-0.2, 0.85], [0.08, 0.9], [0.34, 0.86], [-0.4, 0.62]], (x, y, i) => (y < yO - 4 || y > yO + oh + 3 ? flower(x, y, i % 2 ? 3.6 : 4.4, i % 3 ? petal : mixc(k.c2, '#FFFFFF', 0.4), i * 37, i % 3 ? k.c2 : '#FFF4C8') : ''));
      // cuello cruzado: el interior blanco (juban) y la solapa izquierda encima
      const collar = flat(`M${f(L)} ${f(nl.ys - 2)} L100 ${f(vy - 3)} L${f(R)} ${f(nl.ys - 2)} L${f(R)} ${f(nl.ys + 2)} L100 ${f(vy + 1)} L${f(L)} ${f(nl.ys + 2)}Z`, '#FFFFFF')
        + part(`M${f(L)} ${f(nl.ys + 1)} L${f(100 + 3)} ${f(vy + 2)} L${f(100 + 10)} ${f(yO + 1)} L${f(100 + 4)} ${f(yO + 1)} L${f(100 - 2)} ${f(vy + 7)} L${f(L)} ${f(nl.ys + 7)}Z`, shade(k.c1, -0.5))
        + part(`M${f(R)} ${f(nl.ys + 1)} L${f(100 + 4)} ${f(vy + 1)} L${f(100 + 2)} ${f(vy + 5)} L${f(R)} ${f(nl.ys + 7)}Z`, shade(k.c1, -0.5));
      const obi = part(bandD(L, R, yO, oh, 2), k.c2)
        + flat(bandD(L, R, yO + 0.8, 2.4, 2), lightOf(k.c2, 0.7))
        + line(smileD(L, R, yO + oh * 0.55, 2), '#FFE08A', 1.8)
        + tone(bandD(L, R, yO + oh, 3, 2), '#2A1C30', 0.2);
      // el moño del obi asoma por detrás, a un costado
      const bx = g.r + 2, by = yO + oh / 2;
      const obiBow = part(`M${f(bx - 8)} ${f(by)} C${f(bx + 2)} ${f(by - 18)} ${f(bx + 16)} ${f(by - 14)} ${f(bx + 12)} ${f(by - 3)} C${f(bx + 10)} ${f(by + 2)} ${f(bx)} ${f(by + 1)} ${f(bx - 8)} ${f(by)}Z`, k.c2)
        + part(`M${f(bx - 8)} ${f(by)} C${f(bx + 4)} ${f(by + 2)} ${f(bx + 14)} ${f(by + 6)} ${f(bx + 12)} ${f(by + 15)} C${f(bx + 6)} ${f(by + 15)} ${f(bx)} ${f(by + 8)} ${f(bx - 8)} ${f(by)}Z`, shade(k.c2, -0.4))
        + line(`M${f(bx)} ${f(by - 3)} Q${f(bx + 6)} ${f(by - 9)} ${f(bx + 10)} ${f(by - 6)}`, lightOf(k.c2), 1.4, { opacity: 0.85 });
      return {
        back: obiBow,
        outfit: garment(g, k.c1, {
          side: 4, center: 28, v: true,
          extra: prints + line(`M${f(100 + 6)} ${f(yO + oh + 1)} L${f(100 + g.w * 0.12)} ${f(BOTTOM + 2)}`, seamOf(k.c1), 1.4)
            + neckShadow(g, nl, 7, 3, 0.18) + collar + obi,
        }).svg,
      };
    },
  },
  {
    id: 'impermeable', label: 'Impermeable', vibes: ['kawaii', 'cottagecore'], price: 170, colors: ['#FFD45C', '#7A5A3A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 22 });
      const sm = seamOf(k.c1);
      const toggles = [0, 1, 2].map((i) => { const y = nl.yc + 7 + i * 8.5; return y < BOTTOM - 6 ? part(rr(100 - 4.5, y - 1.6, 9, 3.2, 1.4), k.c2, { 'stroke-width': 1.2 }) + line(`M${f(100 - 6)} ${f(y)} H${f(100 + 6)}`, shade(k.c2, -1), 1) : ''; }).join('');
      const pocketFlap = (s) => { const x = 100 + s * g.w * 0.27, y = Math.min(nl.yc + 14, BOTTOM - 14); return part(`M${f(x - 8)} ${f(y)} H${f(x + 8)} V${f(y + 3)} Q${f(x)} ${f(y + 7)} ${f(x - 8)} ${f(y + 3)}Z`, shade(k.c1, -0.2), { 'stroke-width': 1.5 }) + dot(x, y + 3.4, 1.2, k.c2); };
      // capucha puesta: enmarca la cara por arriba, con su costura y el forro
      const fy = g.face.y, o = 7;
      const pts = [];
      for (let i = 0; i <= 24; i++) {
        const th = Math.PI + 0.25 - ((Math.PI + 0.5) * i) / 24;
        pts.push(`${f(100 + (g.hw + o) * Math.cos(th))} ${f(g.ys - (g.ys - g.top + o) * Math.sin(th))}`);
      }
      const inner = `L${f(g.r - 2)} ${f(fy + 10)} C${f(g.r - 6)} ${f(fy - 22)} ${f(100 + g.w * 0.2)} ${f(fy - 26)} 100 ${f(fy - 26)} C${f(100 - g.w * 0.2)} ${f(fy - 26)} ${f(g.l + 6)} ${f(fy - 22)} ${f(g.l + 2)} ${f(fy + 10)}Z`;
      const hoodD = `M${pts.join(' L')} ${inner}`;
      const rim = `M${f(g.l + 2)} ${f(fy + 10)} C${f(g.l + 6)} ${f(fy - 22)} ${f(100 - g.w * 0.2)} ${f(fy - 26)} 100 ${f(fy - 26)} C${f(100 + g.w * 0.2)} ${f(fy - 26)} ${f(g.r - 6)} ${f(fy - 22)} ${f(g.r - 2)} ${f(fy + 10)}`;
      return {
        outfit: garment(g, k.c1, {
          side: 2, center: 22,
          extra: line(`M${f(100 + 7)} ${f(nl.yc + 1)} V${BOTTOM + 2}`, sm, 1.4) + pocketFlap(-1) + pocketFlap(1) + toggles
            + tone(`M${f(g.l + 10)} ${f(nl.ys + 12)} q4 14 3 28 l-4 0 q1 -14 -3 -26Z`, '#FFFFFF', 0.35)
            + hemStitch(g, 5, sm) + neckShadow(g, nl, 0, 4, 0.2),
        }).svg,
        top: part(hoodD, k.c1)
          + clipTo(hoodD, line(rim, shade(k.c1, -0.6), 5) + tone(`M${f(g.l - 10)} ${f(g.top - 12)} H${f(g.l + g.w * 0.3)} V${f(fy)} H${f(g.l - 10)}Z`, '#FFFFFF', 0.12))
          + line(`M100 ${f(g.top - 6)} V${f(fy - 27)}`, sm, 1.3, { opacity: 0.8 })
          + line(`M${f(g.l + 4)} ${f(fy + 2)} C${f(g.l + 4)} ${f(fy - 30)} ${f(100 - g.w * 0.25)} ${f(g.top - 2)} ${f(100 - g.w * 0.05)} ${f(g.top - 4)}`, '#FFFFFF', 1.8, { opacity: 0.55 }),
      };
    },
  },
  {
    id: 'cuero', label: 'Chaqueta de cuero', vibes: ['rockera', 'gotica', 'y2k'], price: 200, colors: ['#2A2230', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24, v: true });
      const vy = nl.yc + 6, L = g.l - 10, R = g.r + 10;
      const lapC = lumOf(k.c1) < 0.2 ? mixc(k.c1, '#FFFFFF', 0.16) : shade(k.c1, 0.45), lit = lumOf(k.c1) < 0.2 ? mixc(k.c1, '#FFFFFF', 0.45) : lightOf(k.c1, 1.4);
      const tee = part(`M${f(100 - 13)} ${f(vy - 10)} L${f(100 + 13)} ${f(vy - 10)} L${f(100 + 7)} ${f(BOTTOM + 4)} L${f(100 - 9)} ${f(BOTTOM + 4)}Z`, k.c2)
        + line(`M${f(100 - 9)} ${f(vy - 7)} Q100 ${f(vy - 3)} ${f(100 + 9)} ${f(vy - 7)}`, seamOf(k.c2, 0.6), 1.2);
      // solapas anchas con muesca y la cremallera cruzada
      const lap = (s) => part(`M${f(100 + s * 11)} ${f(vy - 9)} L${f(100 + s * 22)} ${f(vy - 3)} L${f(100 + s * 19)} ${f(vy + 1)} L${f(100 + s * 23)} ${f(vy + 5)} L${f(100 + s * 9)} ${f(vy + 16)}Z`, lapC)
        + line(`M${f(100 + s * 12)} ${f(vy - 6)} L${f(100 + s * 20)} ${f(vy - 2)} M${f(100 + s * 20.5)} ${f(vy + 5)} L${f(100 + s * 10.5)} ${f(vy + 13)}`, lit, 1.5, { opacity: 0.85 });
      const zip = line(`M${f(100 + 8)} ${f(vy + 14)} L${f(100 + 10)} ${f(BOTTOM + 2)}`, SILVER_D, 2.6) + line(`M${f(100 + 8)} ${f(vy + 14)} L${f(100 + 10)} ${f(BOTTOM + 2)}`, SILVER, 1.2, { 'stroke-dasharray': '1.4 1.4' })
        + part(rr(100 + 6.5, vy + 13, 3.4, 5.5, 1), SILVER, { stroke: SILVER_D, 'stroke-width': 1 });
      const studs = [[-24, 9], [24, 9], [-28, 15], [28, 15]].map(([dx, dy]) => ball(100 + dx, vy + dy, 1.9, SILVER, { stroke: SILVER_D, 'stroke-width': 0.8 }) + shine(100 + dx - 0.6, vy + dy - 0.6, 0.6)).join('');
      // cinturón del ruedo con hebilla, y brillo del cuero
      const yb = BOTTOM - 8;
      const belt = part(`M${f(L)} ${f(yb)} Q100 ${f(yb + 6)} ${f(R)} ${f(yb)} V196 H${f(L)}Z`, shade(k.c1, 0.15)) + part(rr(100 - g.w * 0.3 - 4, smileYAt(L, R, yb, 3, 100 - g.w * 0.3) + 0.5, 8, 6, 1), 'none', { stroke: SILVER_D, 'stroke-width': 1.8 });
      const gloss = tone(`M${f(g.l + 7)} ${f(nl.ys + 6)} q4 12 3 28 l-4 0 q1 -13 -3 -26Z M${f(100 - 30)} ${f(vy + 12)} l3 14 l-3 0 l-3 -12Z`, '#FFFFFF', lumOf(k.c1) < 0.2 ? 0.34 : 0.26);
      return {
        outfit: garment(g, k.c1, {
          side: 4, center: 24, v: true,
          extra: tee + gloss + belt + zip + lap(-1) + lap(1) + studs,
        }).svg,
      };
    },
  },
  {
    id: 'tutu', label: 'Tutú de bailarina', vibes: ['coquette', 'princesa'], price: 170, colors: ['#FFB6CC'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 10, center: 28 });
      const yW = Math.min(nl.yc + 9, BOTTOM - 18);
      const tulle = (spread, dy, col, n, depth) => {
        const xl = g.l - spread, xr = g.r + spread, y = yW + dy;
        const hw = g.chordAt(yW) / 2;
        let d = `M${f(100 - hw)} ${f(yW)} Q100 ${f(yW + 4)} ${f(100 + hw)} ${f(yW)} L${f(xr)} ${f(y)}`;
        for (let i = n; i >= 1; i--) {
          const x1 = xl + ((xr - xl) * (i - 1)) / n, xm = x1 + (xr - xl) / n / 2;
          d += ` L${f(xm)} ${f(y + depth + smileYAt(xl, xr, 0, 3, xm))} L${f(x1)} ${f(y + smileYAt(xl, xr, 0, 3, x1))}`;
        }
        return part(`${d}Z`, col, { 'stroke-width': 1.8 });
      };
      const light = mixc(k.c1, '#FFFFFF', 0.5), mid = mixc(k.c1, '#FFFFFF', 0.25);
      let net = '';
      for (let i = 0; i < 9; i++) net += `M${f(100 - g.w * 0.4 + i * g.w * 0.1)} ${f(yW + 5)} l${(i - 4) * 1.5} 9`;
      return {
        outfit: garment(g, k.c1, { side: 10, center: 28, extra: neckShadow(g, nl, 0, 4, 0.16) }).svg
          + clipBody(g, P(neckCurve(g, nl, 1), { fill: 'none', stroke: lightOf(k.c1), 'stroke-width': 1.6, 'stroke-dasharray': '2 2', 'data-r': 'line' }))
          + tulle(20, 10, light, 11, 8) + tulle(15, 13, mid, 10, 8) + tulle(10, 16, k.c1, 9, 7)
          + line(net, seamOf(k.c1, 0.6), 1, { opacity: 0.6 })
          + part(bandD(100 - g.chordAt(yW) / 2 - 1, 100 + g.chordAt(yW) / 2 + 1, yW - 2.5, 4, 2), shade(k.c1, -0.35))
          + flower(100, yW, 3.2, lightOf(k.c1), 15, shade(k.c1, -0.6))
          + flat(sparkleD(100 - g.w * 0.3, yW + 17, 2.6), '#FFFFFF') + flat(sparkleD(100 + g.w * 0.22, yW + 20, 2.2), '#FFFFFF') + flat(sparkleD(100 + g.w * 0.46, yW + 11, 1.8), '#FFFFFF'),
      };
    },
  },
  {
    id: 'pijama', label: 'Pijama de estrellitas', vibes: ['kawaii'], price: 130, colors: ['#BFD7FF', '#FFE07A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: -2, center: 24 });
      const pipe = '#FFFFFF', pipeD = mixc(k.c1, '#5A6A9A', 0.5);
      // LA SEÑA: estrellas y lunas grandes y regordetas + el cuello de
      // solapas con vivo blanco y la tapeta de botones
      const prints = scatter(g, nl, [[-0.37, 0.3], [0.33, 0.25], [-0.25, 0.85], [0.26, 0.82]], (x, y, i) => (i % 2 ? part(crescentD(x, y, 5.6), k.c2, { stroke: shade(k.c2, -2), 'stroke-width': 1.3 }) : part(puffStarD(x, y, 6.4, 0.56), k.c2, { stroke: shade(k.c2, -2), 'stroke-width': 1.3 })))
        + skipPx(scatter(g, nl, [[-0.12, 0.95], [0.43, 0.6], [-0.44, 0.62]], (x, y) => flat(puffStarD(x, y, 2.4), k.c2)));
      const lap = (s) => {
        const x0 = 100 + s * 1, xs = 100 + s * g.w * 0.27, ys = neckYAt(g, nl, xs);
        return part(`M${f(x0)} ${f(nl.yc + 1)} L${f(xs)} ${f(ys - 1)} L${f(xs + s * 2)} ${f(ys + 9)} L${f(100 + s * 10)} ${f(nl.yc + 13)}Z`, shade(k.c1, 0.15), { stroke: OUT })
          + line(`M${f(x0 + s * 1.5)} ${f(nl.yc + 1.5)} L${f(xs + s * 0.5)} ${f(ys + 1)} M${f(xs + s * 2)} ${f(ys + 9)} L${f(100 + s * 10)} ${f(nl.yc + 13)}`, pipe, 2.4);
      };
      const buttons = [0, 1, 2].map((i) => { const y = nl.yc + 16 + i * 7.5; return y < BOTTOM - 3 ? button(100 - 2.5, y, 2.6, '#FFFFFF', { stroke: pipeD }) : ''; }).join('');
      return {
        outfit: garment(g, k.c1, {
          side: -2, center: 24,
          extra: prints + line(`M${f(100 + 2)} ${f(nl.yc + 12)} V${BOTTOM + 2}`, seamOf(k.c1, 0.8), 1.6) + buttons
            + line(smileD(g.l - 10, g.r + 10, BOTTOM - 5, 3), pipe, 2.4)
            + neckShadow(g, nl, 0, 4, 0.18) + lap(-1) + lap(1),
        }).svg,
      };
    },
  },
  {
    id: 'flotador', label: 'Flotador de patito', vibes: ['playera', 'kawaii'], price: 110, colors: ['#FFD84D', '#FF9F43'],
    draw: (g, k) => {
      const y = Math.min(g.face.y + 27, BOTTOM - 21), rx = g.w / 2 + 14, ry = 20, t = 17, iry = 5;
      const ringD = `M${f(100 - rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 1 0 ${f(100 + rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 1 0 ${f(100 - rx)} ${f(y)}Z M${f(100 - rx + t)} ${f(y)} A${f(rx - t)} ${f(iry)} 0 1 1 ${f(100 + rx - t)} ${f(y)} A${f(rx - t)} ${f(iry)} 0 1 1 ${f(100 - rx + t)} ${f(y)}Z`;
      const half = (front) => {
        const id = nid('fl');
        const cl = front ? `M0 ${f(y)} H200 V200 H0Z` : `M0 0 H200 V${f(y)} H0Z`;
        return E('clipPath', { id }, P(cl)) + G({ 'clip-path': `url(#${id})` },
          P(ringD, { fill: k.c1, 'fill-rule': 'evenodd', stroke: OUT, 'stroke-width': 2.3, 'data-r': 'part' })
          + (front
            ? tone(`M${f(100 - rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 0 0 ${f(100 + rx)} ${f(y)} L${f(100 + rx - 3)} ${f(y)} A${f(rx - 3)} ${f(ry - 5)} 0 0 1 ${f(100 - rx + 3)} ${f(y)}Z`, '#B05A20', 0.22)
              + line(`M${f(100 - rx + 6)} ${f(y + 4)} Q${f(100 - rx * 0.5)} ${f(y + ry + 1)} ${f(100 - rx * 0.05)} ${f(y + ry - 1)}`, '#FFFFFF', 2.2, { opacity: 0.75 })
              + [32, 72, 112, 152].map((a) => {
                const p = (r1, r2, t) => [100 + r1 * Math.cos(t * Math.PI / 180), y + r2 * Math.sin(t * Math.PI / 180)];
                const [a1, a2] = [a - 7, a + 7];
                const q = [p(rx + 2, ry + 2, a1), p(rx + 2, ry + 2, a2), p(rx - t - 2, iry - 1, a2), p(rx - t - 2, iry - 1, a1)];
                return clipTo(ringD, flat(`M${q.map(([x, yy]) => `${f(x)} ${f(yy)}`).join(' L')}Z`, k.c2));
              }).join('')
            : line(`M${f(100 - rx + 8)} ${f(y - 2)} Q100 ${f(y - ry - 2)} ${f(100 + rx - 10)} ${f(y - 3)}`, '#FFFFFF', 1.6, { opacity: 0.6 })));
      };
      // cabeza de patito con su pico y un mechoncito; colita del otro lado
      const hx = 100 + rx - 7, hy = y - 13;
      const head = disc(hx, hy, 9.5, 9, k.c1)
        + part(`M${f(hx + 6)} ${f(hy - 1)} Q${f(hx + 16)} ${f(hy - 3)} ${f(hx + 16)} ${f(hy + 1.5)} Q${f(hx + 15)} ${f(hy + 5)} ${f(hx + 6)} ${f(hy + 3.5)}Z`, k.c2, { 'stroke-width': 1.7 })
        + line(`M${f(hx + 7)} ${f(hy + 1.3)} H${f(hx + 14)}`, shade(k.c2, -1.4), 1)
        + dot(hx + 3, hy - 3, 1.7, OUT) + shine(hx + 3.5, hy - 3.7, 0.6) + dot(hx + 0.5, hy + 2.5, 1.8, '#FF9EB5', { opacity: 0.8 })
        + line(`M${f(hx - 2)} ${f(hy - 9)} q1 -4 4 -4 M${f(hx)} ${f(hy - 9)} q2 -3 5 -2`, shade(k.c1, -1.2), 1.6)
        + shine(hx - 4, hy - 4, 1.6);
      const tail = part(`M${f(100 - rx + 4)} ${f(y - 6)} L${f(100 - rx - 6)} ${f(y - 15)} L${f(100 - rx - 3)} ${f(y - 4)}Z`, k.c1, { 'stroke-width': 1.8 });
      return { back: half(false) + tail, outfit: half(true) + head };
    },
  },
  {
    id: 'jersey', label: 'Camiseta deportiva', vibes: ['deportiva'], price: 120, colors: ['#5B7BD9', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 5, center: 17, v: true });
      const vy = nl.yc + 6, x = 100, y = Math.min(vy + 7, BOTTOM - 20);
      const h = Math.min(14, BOTTOM - 7 - y);
      // número grande con contorno (ancho de trazo pensado para pixel)
      const seven = part(`M${f(x - 7)} ${f(y)} h14 v${f(h * 0.25)} l${f(-5.5)} ${f(h * 0.75)} h-5 l5.5 ${f(-h * 0.72)} h-9Z`, k.c2, { 'stroke-width': 1.6 });
      const side = (s) => { const x0 = s < 0 ? g.l + 7 : g.r - 7; return part(`M${f(x0 - 3)} ${f(nl.ys + 4)} Q${f(x0 - s * 1)} ${f(165)} ${f(x0 - 3 + s * 2)} ${f(BOTTOM + 4)} L${f(x0 + 3 + s * 2)} ${f(BOTTOM + 4)} Q${f(x0 + 4 - s * 1)} 165 ${f(x0 + 3)} ${f(nl.ys + 4)}Z`, k.c2, { 'stroke-width': 1.5 }); };
      let mesh = '';
      for (let yy = nl.ys + 10, r = 0; yy < BOTTOM; yy += 3.6, r++) for (let xx = g.l + (r % 2) * 1.8; xx < g.r; xx += 3.6) mesh += `M${f(xx)} ${f(yy)}h0.1`;
      return {
        outfit: garment(g, k.c1, {
          side: 5, center: 17, v: true,
          pattern: skipPx(line(mesh, seamOf(k.c1, 0.6), 1.1, { opacity: 0.45 })),
          extra: side(-1) + side(1) + seven
            + hemStitch(g, 5, seamOf(k.c1, 0.8))
            + neckShadow(g, nl, 4, 3, 0.2) + neckBand(g, nl, 4, k.c2) + line(neckCurve(g, nl, 2), k.c1, 1.2),
        }).svg,
      };
    },
  },
  {
    id: 'cardigan', label: 'Cárdigan', vibes: ['aesthetic', 'academia', 'coquette'], price: 160, colors: ['#C7E3C0', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 26 });
      const vy = Math.min(nl.yc + 12, BOTTOM - 14), gap = 7;
      const sm = seamOf(k.c1, 0.8);
      // los dos delanteros: bajan del cuello en V y dejan ver la blusa
      const panel = (s) => {
        const X = s < 0 ? g.l - 10 : g.r + 10;
        return part(`M${f(X)} ${f(nl.ys - 6)} L${f(100 + s * (gap + 12))} ${f(neckYAt(g, nl, 100 + s * (gap + 12)) - 4)} L${f(100 + s * gap)} ${f(vy)} L${f(100 + s * (gap - 0.5))} 196 L${f(X)} 196Z`, k.c1);
      };
      const band = (s) => line(`M${f(100 + s * (gap + 12))} ${f(neckYAt(g, nl, 100 + s * (gap + 12)) - 3)} L${f(100 + s * (gap + 2.2))} ${f(vy + 1)} L${f(100 + s * (gap + 2))} ${BOTTOM + 2}`, lightOf(k.c1, 0.5), 3.2)
        + line(`M${f(100 + s * (gap + 12))} ${f(neckYAt(g, nl, 100 + s * (gap + 12)) - 3)} L${f(100 + s * (gap + 2.2))} ${f(vy + 1)} L${f(100 + s * (gap + 2))} ${BOTTOM + 2}`, sm, 1, { opacity: 0.7, 'stroke-dasharray': '1.4 1.6' });
      const buttons = [0, 1, 2].map((i) => { const y = vy + 1 + i * 7.5; return y < BOTTOM - 3 ? button(100 - gap - 2.2, y, 2.1, '#FFF8EC', { stroke: shade(k.c1, -2) }) : ''; }).join('');
      const pocket = (s) => { const x = 100 + s * g.w * 0.27, y = Math.min(vy + 5, BOTTOM - 13); return part(rr(x - 8, y, 16, 3.6, 1.2), shade(k.c1, -0.2), { 'stroke-width': 1.4 }) + line(`M${f(x - 6.5)} ${f(y + 0.6)} v2.6 M${f(x - 3.5)} ${f(y + 0.6)} v2.6 M${f(x - 0.5)} ${f(y + 0.6)} v2.6 M${f(x + 2.5)} ${f(y + 0.6)} v2.6 M${f(x + 5.5)} ${f(y + 0.6)} v2.6`, sm, 0.9); };
      return {
        outfit: garment(g, k.c2, {
          side: 6, center: 26,
          extra: neckShadow(g, nl, 0, 3, 0.16) + line(neckCurve(g, nl, 1.5), seamOf(k.c2, 0.6), 1.1, { opacity: 0.8 })
            + tone(`M${f(100 - gap - 2)} ${f(vy - 6)} L${f(100 - gap + 1.5)} 196 L${f(100 - gap - 3)} 196Z M${f(100 + gap + 2)} ${f(vy - 6)} L${f(100 + gap - 1.5)} 196 L${f(100 + gap + 3)} 196Z`, '#2A1C30', 0.2)
            + panel(-1) + panel(1) + pocket(-1) + pocket(1) + hemRib(g, 6, k.c1)
            + band(-1) + band(1) + buttons,
        }).svg,
      };
    },
  },
  {
    id: 'tweed', label: 'Chaleco de tweed', vibes: ['academia'], price: 170, colors: ['#9A7A5A', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 6, center: 24 });
      const L = g.l - 10, R = g.r + 10, vb = Math.min(nl.yc + 17, BOTTOM - 12);
      const xa = 100 - 11, xb = 100 + 11, ya = neckYAt(g, nl, xa) + 1, yb2 = neckYAt(g, nl, xb) + 1;
      const vestD = `M${f(L)} ${f(nl.ys + 3)} L${f(xa)} ${f(ya)} L100 ${f(vb)} L${f(xb)} ${f(yb2)} L${f(R)} ${f(nl.ys + 3)} L${f(R)} 196 L${f(L)} 196Z`;
      // espiga del tweed: solo donde hay resolución para verla; en pixel,
      // masa de color lisa con su sombra (menos detalle, se lee mejor)
      let hb = '';
      for (let y = nl.ys + 4, r = 0; y < BOTTOM + 2; y += 4, r++) for (let x = g.l - 4; x < g.r + 4; x += 4) hb += r % 2 ? `M${f(x)} ${f(y)} l2 2.6` : `M${f(x)} ${f(y)} l2 -2.6`;
      // LA SEÑA: cuello de camisa blanco en punta y corbata en la V
      const tie = '#8E1F2C';
      const collar = (s) => part(`M${f(100 + s * 1.2)} ${f(nl.yc - 2)} L${f(100 + s * 13)} ${f(nl.yc - 5)} L${f(100 + s * 10)} ${f(nl.yc + 8)}Z`, k.c2, { 'stroke-width': 1.7 });
      const tieD = `M${f(100 - 3)} ${f(nl.yc + 1)} L${f(100 + 3)} ${f(nl.yc + 1)} L${f(100 + 4.4)} ${f(vb - 1)} L100 ${f(vb + 3)} L${f(100 - 4.4)} ${f(vb - 1)}Z`;
      const buttons = [0, 1].map((i) => { const y = vb + 4 + i * 7; return y < BOTTOM - 3 ? button(100, y, 2.6, shade(k.c1, -1.6), { stroke: shade(k.c1, -2.6) }) : ''; }).join('');
      const welt = (s) => { const x = 100 + s * g.w * 0.26, y = Math.min(vb + 3, BOTTOM - 10); return part(rr(x - 8, y, 16, 3.6, 1), shade(k.c1, -0.5), { 'stroke-width': 1.3 }); };
      return {
        outfit: garment(g, k.c2, {
          side: 6, center: 24,
          extra: part(tieD, tie, { 'stroke-width': 1.5 }) + part(`M${f(100 - 3.4)} ${f(nl.yc - 1)} h6.8 l-1 4 h-4.8Z`, shade(tie, -0.4), { 'stroke-width': 1.3 })
            + part(vestD, k.c1) + clipTo(vestD, skipPx(line(hb, seamOf(k.c1, 0.9), 1.1, { opacity: 0.45 })))
            + tone(`M${f(xa)} ${f(ya)} L100 ${f(vb)} L${f(xb)} ${f(yb2)} L${f(xb)} ${f(yb2 + 4)} L100 ${f(vb + 4)} L${f(xa)} ${f(ya + 4)}Z`, '#2A1C30', 0.2)
            + line(`M${f(xa + 1)} ${f(ya + 1.5)} L100 ${f(vb - 1.5)} L${f(xb - 1)} ${f(yb2 + 1.5)}`, lightOf(k.c1, 0.6), 1.4, { opacity: 0.8 })
            + welt(-1) + welt(1) + buttons,
        }).svg + collar(-1) + collar(1),
      };
    },
  },
  {
    id: 'lolita', label: 'Vestido gótico', vibes: ['gotica'], price: 210, colors: ['#221C27', '#8E1F2C'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const yW = Math.min(nl.yc + 13, BOTTOM - 15);
      const y0 = nl.yc + 5;
      // corsé: en los estilos vectoriales con su cordón cruzado y ojales; en
      // pixel, dos cruces gruesas (el cordón fino se volvía ruido)
      let lacing = '';
      for (let y = y0; y < yW - 2; y += 4) lacing += `M${f(100 - 4)} ${f(y)} L${f(100 + 4)} ${f(y + 4)} M${f(100 + 4)} ${f(y)} L${f(100 - 4)} ${f(y + 4)}`;
      const eyelets = [];
      for (let y = y0; y <= yW - 2; y += 4) eyelets.push(dot(100 - 4.5, y, 0.9, SILVER), dot(100 + 4.5, y, 0.9, SILVER));
      const hw = g.chordAt(yW) / 2 + 2;
      const fl = 10;
      return {
        outfit: garment(g, k.c1, {
          side: 8, center: 26,
          extra: part(rr(100 - 7.5, y0 - 2, 15, yW - y0 + 2, 2), shade(k.c1, 0.35), { 'stroke-width': 1.4 })
            + skipPx(line(lacing, k.c2, 1.3) + eyelets.join(''))
            + onlyPx(line(`M${f(100 - 4)} ${f(y0)} L${f(100 + 4)} ${f(yW - 3)} M${f(100 + 4)} ${f(y0)} L${f(100 - 4)} ${f(yW - 3)}`, k.c2, 2.4))
            + neckShadow(g, nl, 0, 4, 0.2),
        }).svg
          // LA SEÑA: cuello blanco grande, lazo rojo en la cintura y la
          // enagua de puntilla blanca asomando bajo la falda
          + collarLobes(g, nl, Math.min(30, g.w * 0.22), 8, '#FFFFFF')
          + skirt(g, yW, k.c1, { flare: fl, folds: 5, trim: '#FFFFFF', trimR: 4 })
          + skipPx(clipTo(skirtPath(g, yW, { flare: fl }), lace(g.l - fl, g.r + fl, BOTTOM - 4, 2, 2.4, k.c2, { holes: false })))
          + strip(bandD(100 - hw, 100 + hw, yW - 3, 5.5, 2), k.c2)
          + bow(100, yW - 0.5, 0, 0.8, k.c2)
          + part(`M${f(100 - 1.6)} ${f(nl.yc + 2.5)} h3.2 v3.6 h3.4 v3.2 h-3.4 v6 h-3.2 v-6 h-3.4 v-3.2 h3.4Z`, SILVER, { stroke: SILVER_D, 'stroke-width': 1 }),
      };
    },
  },
  {
    id: 'trajeCalabaza', label: 'Disfraz de calabaza', vibes: ['temporada'], price: 160, colors: ['#F28C38', '#6CBF6A'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 22 });
      // gajos: franjas que siguen la panza redonda, con su sombra entre gajo y gajo
      let ribs = '', grooves = '';
      [-0.36, -0.18, 0, 0.18, 0.36].forEach((fx) => {
        const x = 100 + g.w * fx, xb = 100 + g.w * fx * 1.12;
        const y0 = neckYAt(g, nl, x) + 2;
        ribs += `M${f(x)} ${f(y0)} Q${f(100 + g.w * fx * 1.32)} ${f((y0 + BOTTOM) / 2)} ${f(xb)} ${BOTTOM + 3}`;
        grooves += `M${f(x - 2.5)} ${f(y0)} Q${f(100 + g.w * fx * 1.32 - 2.5)} ${f((y0 + BOTTOM) / 2)} ${f(xb - 2)} ${BOTTOM + 3} L${f(xb + 1)} ${BOTTOM + 3} Q${f(100 + g.w * fx * 1.32 + 1)} ${f((y0 + BOTTOM) / 2)} ${f(x + 1)} ${f(y0)}Z`;
      });
      const leaves = [-1, 1].map((s) => part(`M100 ${f(nl.yc + 2)} C${f(100 + s * 10)} ${f(nl.yc - 3)} ${f(100 + s * 19)} ${f(nl.yc + 1)} ${f(100 + s * 22)} ${f(nl.yc + 8)} C${f(100 + s * 13)} ${f(nl.yc + 11)} ${f(100 + s * 6)} ${f(nl.yc + 9)} 100 ${f(nl.yc + 2)}Z`, k.c2)
        + line(`M${f(100 + s * 2)} ${f(nl.yc + 3)} Q${f(100 + s * 11)} ${f(nl.yc + 3)} ${f(100 + s * 19)} ${f(nl.yc + 7)}`, shade(k.c2, -1), 1.1)).join('');
      const vine = line(`M${f(100 + 3)} ${f(nl.yc + 4)} c4 3 9 1 8 -3 c-1 -3 -5 -2 -4 1`, shade(k.c2, -0.6), 1.6);
      return { outfit: garment(g, k.c1, { side: 2, center: 22, extra: tone(grooves, shade(k.c1, -2.5), 0.22) + line(ribs, seamOf(k.c1), 1.3, { opacity: 0.8 }) + neckShadow(g, nl, 0, 4, 0.2) }).svg + leaves + vine };
    },
  },
  {
    id: 'sueterNavidad', label: 'Suéter navideño', vibes: ['temporada'], price: 150, colors: ['#D9364F', '#3E8A57'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 4, center: 24 });
      const L = g.l - 10, R = g.r + 10;
      const y = Math.min(nl.yc + 6, BOTTOM - 22);
      // franja de jacquard: banda blanca con arbolitos y dientes de sierra
      let saw = `M${f(L)} ${f(y)}`;
      for (let x = L, i = 0; x < R; x += 5, i++) saw += ` L${f(x + 2.5)} ${f(smileYAt(L, R, y, 3, x) + (i % 2 ? -3 : 0))}`;
      const band = flat(bandD(L, R, y, 11, 3), '#FFFFFF') + line(smileD(L, R, y + 0.6, 3), k.c1, 1.6, { 'stroke-dasharray': '2.2 2.2' }) + line(smileD(L, R, y + 10.2, 3), k.c1, 1.6, { 'stroke-dasharray': '2.2 2.2' });
      const trees = [-0.3, -0.1, 0.1, 0.3].map((fx) => { const x = 100 + g.w * fx, yy = smileYAt(L, R, y, 3, x) + 2.5; return flat(`M${f(x)} ${f(yy)} l3.6 6 h-7.2Z`, k.c2); }).join('');
      const flakes = [-0.34, -0.14, 0.12, 0.34].map((fx, i) => { const x = 100 + g.w * fx, yy = smileYAt(L, R, y + 16, 3, x) + (i % 2) * 3; return yy < BOTTOM - 9 ? flat(sparkleD(x, yy, 2.6), '#FFFFFF') : ''; }).join('');
      return { outfit: garment(g, k.c1, { side: 4, center: 24, extra: band + trees + flakes + hemRib(g, 7, '#FFFFFF') + neckShadow(g, nl, 5, 3, 0.2) + neckBand(g, nl, 5, '#FFFFFF') + neckRibs(g, nl, 1, 4.5, '#DCE4F0') }).svg };
    },
  },
  {
    id: 'delantal', label: 'Delantal de cocina', vibes: ['cottagecore', 'chef'], price: 100, colors: ['#FFFFFF', '#FF8FAB'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 8, center: 26 });
      const aw = g.w * 0.26, y0 = nl.yc + 3, yW = Math.min(y0 + 10, BOTTOM - 14);
      const apronD = `M${f(100 - aw * 0.6)} ${f(y0)} Q100 ${f(y0 - 1.5)} ${f(100 + aw * 0.6)} ${f(y0)} L${f(100 + aw * 0.62)} ${f(yW)} L${f(100 + aw)} ${f(BOTTOM)} Q100 ${f(BOTTOM + 4)} ${f(100 - aw)} ${f(BOTTOM)} L${f(100 - aw * 0.62)} ${f(yW)}Z`;
      // tiras al cuello y a la cintura (abrazan el cuerpo), volante en el borde
      const ties = clipBody(g, line(`M${f(100 - aw * 0.55)} ${f(y0 + 1)} L${f(g.l + 6)} ${f(g.face.cheekY + 13)} M${f(100 + aw * 0.55)} ${f(y0 + 1)} L${f(g.r - 6)} ${f(g.face.cheekY + 13)}`, shade(k.c1, -0.3), 3.2)
        + part(bandD(g.l - 10, g.r + 10, yW - 1.5, 3, 2), k.c2, { 'stroke-width': 1.6 }));
      const ruffle = lace(100 - aw - 1, 100 + aw + 1, BOTTOM + 1.5, 1.5, 2.6, k.c2, { holes: false });
      const ph = Math.min(9, BOTTOM - yW - 8);
      const pocket = part(`M${f(100 - 8)} ${f(yW + 3)} h16 v${f(ph - 3)} q0 3 -3 3 h-10 q-3 0 -3 -3Z`, k.c2, { 'stroke-width': 1.5 }) + flat(heartD(100, yW + 3 + ph / 2, 2.6), '#FFFFFF') + stitch(`M${f(100 - 6.5)} ${f(yW + 4.6)} h13`, '#FFFFFF', 1);
      return {
        outfit: ties + ruffle + part(apronD, k.c1)
          + clipTo(apronD, line(`M${f(100 - aw * 0.3)} ${f(yW + 3)} L${f(100 - aw * 0.45)} ${f(BOTTOM)} M${f(100 + aw * 0.3)} ${f(yW + 3)} L${f(100 + aw * 0.45)} ${f(BOTTOM)}`, seamOf(k.c1, 0.5), 1.2, { opacity: 0.8 }) + stitch(`M${f(100 - aw * 0.55)} ${f(y0 + 2.2)} Q100 ${f(y0 + 0.8)} ${f(100 + aw * 0.55)} ${f(y0 + 2.2)}`, k.c2, 1.1) + roundShade(apronD, k.c1, { ox: 2, oy: 3, op: 0.24 }))
          + pocket + bow(100 + g.w * 0.3, smileYAt(g.l - 10, g.r + 10, yW - 1.5, 2, 100 + g.w * 0.3) + 1, -8, 0.42, k.c2),
      };
    },
  },
  {
    id: 'princesa', label: 'Vestido de princesa', vibes: ['princesa'], price: 260, colors: ['#C9A6FF', GOLD],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 10, center: 28 });
      const yW = Math.min(nl.yc + 10, BOTTOM - 17);
      const gold = k.c2, goldD = shade(gold, -2.2);
      // mangas abullonadas a los costados (el gesto de princesa)
      const puff = (s) => {
        const x = s < 0 ? g.l + 3 : g.r - 3, y = g.face.y + 18;
        return part(`M${f(x - s * 6)} ${f(y - 9)} C${f(x + s * 10)} ${f(y - 14)} ${f(x + s * 14)} ${f(y + 6)} ${f(x + s * 2)} ${f(y + 10)} C${f(x - s * 4)} ${f(y + 11)} ${f(x - s * 8)} ${f(y + 2)} ${f(x - s * 6)} ${f(y - 9)}Z`, mixc(k.c1, '#FFFFFF', 0.3))
          + line(`M${f(x - s * 2)} ${f(y - 10)} q${f(s * 1.5)} 3 0 6 M${f(x + s * 3)} ${f(y - 10)} q${f(s * 1.5)} 3 0.5 6`, seamOf(k.c1, 0.6), 1.2, { opacity: 0.85 })
          + line(`M${f(x - s * 6)} ${f(y + 5)} Q${f(x + s * 3)} ${f(y + 9)} ${f(x + s * 9)} ${f(y + 2)}`, gold, 2.2)
          + line(`M${f(x + s * 1)} ${f(y - 7)} Q${f(x + s * 6)} ${f(y - 6)} ${f(x + s * 8)} ${f(y - 2)}`, '#FFFFFF', 1.5, { opacity: 0.8 });
      };
      // vestido de baile: enagua clara con volantes al centro y la sobrefalda
      // que se abre como un telón, con su ribete dorado y una roseta en el talle
      const hw = g.chordAt(yW) / 2, hem = BOTTOM + 2, fl = 13, xl = g.l - fl, xr = g.r + fl;
      const under = mixc(k.c1, '#FFFFFF', 0.45);
      const ruffles = [yW + 9, yW + 17].filter((y) => y < hem - 5).map((y) => laceAlong(100 - g.w * 0.3, 100 + g.w * 0.3, (x) => smileYAt(100 - g.w * 0.3, 100 + g.w * 0.3, y, 2.5, x), 2.6, mixc(under, '#FFFFFF', 0.5), { band: 0.4, holes: false })).join('');
      const drape = (s) => {
        const X = s < 0 ? xl : xr, W0 = 100 + s * hw, ix = 100 + s * g.w * 0.22;
        const d = `M${f(W0)} ${f(yW)} Q${f(100 + s * hw * 0.5)} ${f(yW + 2)} ${f(100 + s * 5)} ${f(yW + 2)} C${f(100 + s * 8)} ${f(yW + 14)} ${f(ix - s * 4)} ${f(hem - 8)} ${f(ix)} ${f(hem + 4)} Q${f((ix + X) / 2)} ${f(hem + 6)} ${f(X)} ${f(hem)} C${f(X)} ${f(hem - 14)} ${f(W0 + s * fl * 0.3)} ${f(yW + 14)} ${f(W0)} ${f(yW)}Z`;
        const edge = `M${f(100 + s * 5)} ${f(yW + 2)} C${f(100 + s * 8)} ${f(yW + 14)} ${f(ix - s * 4)} ${f(hem - 8)} ${f(ix)} ${f(hem + 4)}`;
        return part(d, k.c1) + clipTo(d, line(`M${f(100 + s * hw * 0.6)} ${f(yW + 3)} Q${f(100 + s * hw * 0.8)} ${f(yW + 14)} ${f(100 + s * (hw + 6))} ${f(hem + 2)} M${f(100 + s * hw * 0.25)} ${f(yW + 3)} Q${f(100 + s * hw * 0.45)} ${f(yW + 14)} ${f(100 + s * hw * 0.7)} ${f(hem + 4)}`, seamOf(k.c1, 0.7), 1.2, { opacity: 0.8 })
          + roundShade(d, k.c1, { ox: s < 0 ? 2 : 6, oy: 3 }) + (s > 0 ? tone(d, '#2A1C30', 0.1) : ''))
          + line(edge, shade(gold, -1.6), 3.4) + line(edge, gold, 1.8);
      };
      return {
        outfit: garment(g, k.c1, { side: 10, center: 28, extra: neckShadow(g, nl, 3, 4, 0.18) + neckBand(g, nl, 3, gold, { lit: false }) }).svg
          + puff(-1) + puff(1)
          + skirt(g, yW, under, { flare: fl - 3, folds: 0, hem: hem + 2 }) + ruffles
          + drape(-1) + drape(1)
          + part(bandD(100 - hw - 1, 100 + hw + 1, yW - 2.5, 4.5, 2), gold, { stroke: goldD })
          + flower(100, yW + 1.5, 4.2, '#FF9EC4', 10, gold)
          + part(`M100 ${f(nl.yc + 3)} l3.8 4 l-3.8 5.5 l-3.8 -5.5Z`, '#FF7FA8', { stroke: goldD, 'stroke-width': 1.2 }) + shine(98.8, nl.yc + 5.4, 0.9),
      };
    },
  },
  {
    id: 'bata', label: 'Bata de spa', vibes: ['aesthetic', 'coquette'], price: 120, colors: ['#FFE3EC', '#FFFFFF'],
    draw: (g, k) => {
      const nl = neckLine(g, { side: 2, center: 28, v: true });
      const vy = nl.yc + 6, L = g.l - 10, R = g.r + 10;
      const yB = Math.min(vy + 4, BOTTOM - 14);
      // felpa: rizos chiquitos (en pixel, un punteado suave)
      let loops = '';
      for (let y = nl.ys + 8, r = 0; y < BOTTOM; y += 4.2, r++) for (let x = g.l + (r % 2) * 2.4; x < g.r; x += 4.8) loops += `M${f(x)} ${f(y)} a1 1 0 1 1 0.1 0`;
      // cuello chal: dos rollos gruesos que se cruzan (izquierda encima)
      const shawl = (s, front) => part(`M${f(s < 0 ? L : R)} ${f(nl.ys - 2)} L${f(100 + s * 2 + (front ? 6 : 0))} ${f(vy + (front ? 6 : 0))} L${f(100 + s * 2 + (front ? 6 : 0) - s * 8)} ${f(vy + (front ? 6 : 0) + 6)} L${f(s < 0 ? L : R)} ${f(nl.ys + 9)}Z`, shade(k.c1, 0.25))
        + line(`M${f(s < 0 ? L : R)} ${f(nl.ys + 2)} L${f(100 + s * 2 + (front ? 6 : 0) - s * 2)} ${f(vy + (front ? 6 : 0) + 2)}`, lightOf(k.c1), 1.4, { opacity: 0.8 });
      const belt = part(bandD(L, R, yB, 5, 2), k.c1) + line(smileD(L, R, yB + 2.5, 2), seamOf(k.c1, 0.6), 1, { 'stroke-dasharray': '1.6 1.6' });
      const kx = 100 + g.w * 0.1, ky = smileYAt(L, R, yB, 2, kx) + 2.5;
      const knot = part(`M${f(kx - 1)} ${f(ky + 1)} l-3 13 l4 1 l2.5 -13Z`, k.c1, { 'stroke-width': 1.6 }) + part(`M${f(kx + 1)} ${f(ky + 1)} l6 11.5 l-3.6 1.8 l-4.4 -12Z`, k.c1, { 'stroke-width': 1.6 })
        + disc(kx, ky, 4, 3.4, shade(k.c1, 0.15), { 'stroke-width': 1.6 });
      const pocket = (() => { const x = 100 - g.w * 0.26, y = Math.min(yB + 9, BOTTOM - 10); return part(rr(x - 7, y, 14, 9, 2), k.c1, { 'stroke-width': 1.4 }) + line(`M${f(x - 7)} ${f(y + 1.6)} H${f(x + 7)}`, k.c2, 1.6); })();
      return {
        outfit: garment(g, k.c1, {
          side: 2, center: 28, v: true,
          pattern: skipPx(line(loops, seamOf(k.c1, 0.5), 0.9, { opacity: 0.5 })),
          extra: flat(`M${f(L)} ${f(nl.ys - 2)} L100 ${f(vy - 2)} L${f(R)} ${f(nl.ys - 2)} L${f(R)} ${f(nl.ys + 3)} L100 ${f(vy + 3)} L${f(L)} ${f(nl.ys + 3)}Z`, shade(k.c1, -0.4))
            + pocket + line(`M${f(100 + 7)} ${f(vy + 8)} L${f(100 + 10)} ${BOTTOM + 2}`, seamOf(k.c1, 0.6), 1.3)
            + neckShadow(g, nl, 9, 3, 0.18) + shawl(1, false) + shawl(-1, true) + belt,
        }).svg + knot,
      };
    },
  },
];
