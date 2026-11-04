// Peinados y cejas de la mochi.
//
// La "cabeza" de una mochi es la cúpula de arriba del cuerpo. Todo peinado
// sale de esa cúpula (ver `arc`): un casquete un poco más grande que la
// cabeza (el pelo tiene volumen) que baja hasta la línea del pelo, con el
// borde de abajo hecho de mechones. Para que se lea como PELO y no como un
// gorro (sobre todo en pixel):
//   · mechones pocos y grandes, con muescas hondas y puntas finas;
//   · hebras largas que bajan de la coronilla a cada muesca;
//   · el "anillo de luz" de pelo de anime: una banda clara con dientes;
//   · la sombra que el flequillo hace sobre la frente.
// Como todo se ancla a la cúpula, cae en su sitio en los cuatro anchos.
//
// Capas (ver index.js):
//   back  → detrás del cuerpo (melena, coletas, moños, rizos de atrás)
//   front → sobre el cuerpo, debajo de ojos y boca (casquete, flequillo)
//   top   → encima de la cara (coleteros, trenzas, la antenita, copete)

import { G, P, Cir, Ell, E } from '../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../color.js';

const OUT = '#3A2A3E';
const shade = (c, k) => hex(ramp(parseColor(c), k));
const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
const f = (n) => n.toFixed(1);
const xy = ([x, y]) => `${f(x)} ${f(y)}`;

export const HAIRSTYLES = [
  { id: 'ninguno', label: 'Sin pelo' },
  { id: 'flequillo', label: 'Flequillo' },
  { id: 'lado', label: 'De lado' },
  { id: 'bob', label: 'Bob' },
  { id: 'melena', label: 'Melena larga' },
  { id: 'coletas', label: 'Coletas' },
  { id: 'monitos', label: 'Moñitos' },
  { id: 'monoAlto', label: 'Moño alto' },
  { id: 'cola', label: 'Cola de caballo' },
  { id: 'trenzas', label: 'Trenzas' },
  { id: 'rulos', label: 'Rulos' },
  { id: 'afro', label: 'Afro' },
  { id: 'ahoge', label: 'Antenita' },
  { id: 'corto', label: 'Cortito' },
  { id: 'copete', label: 'Copete' },
];

// Colores de pelo: naturales primero, de fantasía después.
export const HAIR_COLORS = [
  '#2E2433', '#4A3028', '#7A4E36', '#B07A4A', '#E8C27A', '#C8643C', '#C9C4D2', '#F2EEE8',
  '#FF9EC4', '#FF5FA2', '#C7A6FF', '#8E6FE0', '#8FD3F5', '#5B7BD9', '#9BE3C4', '#FFB38A',
];
export const DEFAULT_HAIR_COLOR = '#7A4E36';

export const BROWS = [
  { id: 'ninguna', label: 'Sin cejas' },
  { id: 'finas', label: 'Finitas' },
  { id: 'gruesas', label: 'Gruesas' },
  { id: 'rectas', label: 'Rectas' },
  { id: 'arqueadas', label: 'Arqueadas' },
  { id: 'puntitos', label: 'Puntitos' },
];

// ── Trazos ───────────────────────────────────────────────────────

// Curva suave (Catmull-Rom) que pasa por todos los puntos.
function through(pts, move = true) {
  let d = move ? `M${xy(pts[0])}` : `L${xy(pts[0])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${xy(c1)} ${xy(c2)} ${xy(p2)}`;
  }
  return d;
}

// Punto de la cúpula: th = π a la izquierda, π/2 arriba, 0 a la derecha;
// `o` la separa del cuerpo (el pelo tiene grosor; negativo = adentro).
const arc = (g, th, o) => [100 + (g.hw + o) * Math.cos(th), g.ys - (g.ys - g.top + o) * Math.sin(th)];
const thAt = (g, y, o) => Math.asin(Math.max(0, Math.min(1, (g.ys - y) / (g.ys - g.top + o))));
const arcPts = (g, th0, th1, o, n = 22) => Array.from({ length: n + 1 }, (_, i) => arc(g, th0 + ((th1 - th0) * i) / n, o));

const part = (d, fill, o = {}) => P(d, { fill, stroke: OUT, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'part', ...o });
const line = (d, stroke, w = 1.6, o = {}) => P(d, { fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line', ...o });
const disc = (x, y, rx, ry, fill, o = {}) => P(`M${f(x - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x + rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x - rx)} ${f(y)}Z`, { fill, stroke: OUT, 'stroke-width': 2.4, 'data-r': 'part', ...o });

function hairTones(col) {
  const L = lum(parseColor(col));
  const light = L > 0.6, black = L < 0.22;
  return {
    base: col,
    back: black ? mixc(col, '#000000', 0.25) : shade(col, light ? -0.9 : -0.7),   // lo de atrás, en sombra
    // hebras: en pelo negro van más claras (si no, no se ven)
    dark: black ? mixc(col, '#B8A9C6', 0.3) : shade(col, light ? -1.4 : -1.1),
    hi: mixc(col, '#FFFFFF', light ? 0.7 : black ? 0.36 : 0.5),
  };
}

let hid = 0;

// Medidas del corte en esta mochi.
function frame(g) {
  const o = 4.6;                   // el pelo se despega un poco de la cabeza
  const fy = g.face.y;
  const sideY = fy - 3;            // hasta dónde baja el casquete por los lados
  const bangY = fy - 15;           // puntas del flequillo, en el centro
  const ths = thAt(g, sideY, o);
  const xr = arc(g, ths, o)[0], xl = 200 - xr;
  return { o, fy, sideY, bangY, ths, xr, xl, half: (xr - xl) / 2 };
}

// Casquete sin flequillo (peinado hacia atrás): la cúpula hasta una línea
// de pelo suave. `hairline` es su altura en el centro.
function cap(g, fr, hairline = fr.bangY - 7, pw = 2.2) {
  const top = arcPts(g, Math.PI - fr.ths, fr.ths, fr.o);
  const edge = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const x = fr.xr - (fr.xr - fr.xl) * (i / n);
    const u = Math.abs(x - 100) / fr.half;
    edge.push([x, hairline + (fr.sideY - hairline) * Math.pow(u, pw)]);
  }
  return `${through(top)}${through(edge, false)}Z`;
}

// Un mechón suelto: nace adentro del pelo (xTop, yTop) y termina en punta.
function lockD(xTop, yTop, xTip, yTip, w) {
  const h = yTip - yTop;
  const L = xTop - w / 2, R = xTop + w / 2;
  return `M${f(L)} ${f(yTop)} C${f(L)} ${f(yTop + h * 0.55)} ${f(xTip - w * 0.2)} ${f(yTip - h * 0.25)} ${f(xTip)} ${f(yTip)} C${f(xTip + w * 0.24)} ${f(yTip - h * 0.32)} ${f(R)} ${f(yTop + h * 0.5)} ${f(R)} ${f(yTop)}Z`;
}

// Flequillo: el borde de abajo del casquete hecho de `n` mechones, de
// derecha a izquierda. Es UNA sola silueta (un solo contorno); lo que
// separa los mechones son las muescas hondas y las hebras.
//   sweep  → peina las puntas hacia un lado (+ derecha)
//   parted → raya al medio: las puntas se abren hacia afuera
//   depth  → corre las puntas hacia abajo; round → puntas redondas (rulos)
function bangLayout(g, fr, { n = 5, sweep = 0, parted = false, depth = 0, round = false, notch = 11 } = {}) {
  const span = fr.half * 0.97;
  const tipY = (x) => fr.bangY + depth + (fr.sideY - fr.bangY - depth) * Math.pow(Math.min(1, Math.abs(x - 100) / span), 2.4);
  const bx = (k) => 100 + (-1 + (2 * k) / n) * span;            // bordes entre mechones
  const tips = [], notches = [];
  for (let i = 0; i < n; i++) {
    const u = -1 + (2 * (i + 0.5)) / n;
    const xc = (bx(i) + bx(i + 1)) / 2;
    const away = parted ? Math.sign(u || 1) * 3 : 0;
    const x = xc + sweep * (1 - Math.abs(u) * 0.35) + u * 2 + away;
    // largos un poco distintos: el del medio más largo, los vecinos no
    tips.push([x, tipY(x) + (i % 2 ? 0 : 2) + (round ? 2 : 0)]);
  }
  for (let k = 1; k < n; k++) notches.push([bx(k) + sweep * 0.5, tipY(bx(k)) - notch]);
  return { tips, notches, round, sweep };
}

function bangEdge(fr, lay) {
  const { tips, notches, round } = lay;
  const k = round ? 0.55 : 0.18;          // cuán redonda es la punta
  const seq = [[fr.xr, fr.sideY]];
  for (let i = tips.length - 1; i >= 0; i--) {
    seq.push({ tip: tips[i] });
    if (i > 0) seq.push(notches[i - 1]);
  }
  seq.push([fr.xl, fr.sideY]);
  let d = `L${xy(seq[0])}`;
  for (let i = 1; i < seq.length; i++) {
    const cur = seq[i];
    if (cur.tip) {
      const A = seq[i - 1], T = cur.tip, B = seq[i + 1];
      d += `C${f(A[0])} ${f(A[1] + (T[1] - A[1]) * 0.55)} ${f(T[0] + (A[0] - T[0]) * k)} ${f(T[1] - 1)} ${xy(T)}`;
      d += `C${f(T[0] + (B[0] - T[0]) * k)} ${f(T[1] - 1)} ${f(B[0])} ${f(B[1] + (T[1] - B[1]) * 0.55)} ${xy(B)}`;
      i += 1;
    }
  }
  return d;
}

// Hebras: de la coronilla a cada muesca del flequillo, siguiendo la cabeza.
function strands(g, fr, lay, t) {
  const sw = lay.sweep || 0;
  return line(lay.notches.map(([x, y]) => {
    const u = (x - 100) / fr.half;
    const top = arc(g, Math.PI / 2 - u * 0.5 - sw * 0.01, -fr.o * 0.2 - 9);
    const mid = [(top[0] + x) / 2 + u * 4 - sw * 0.3, (top[1] + y) / 2];
    return `M${xy(top)} Q${xy(mid)} ${f(x)} ${f(y + 1.5)}`;
  }).join(''), t.dark, 2.4, { opacity: 0.75 });
}

// Anillo de luz: banda clara que cruza la cabeza, con dientes abajo
// (más ancha del lado de la luz, la izquierda).
function angelRing(g, fr, t, { from = 0.82, to = 0.32, o1 = -5.5, o2 = -9.5 } = {}) {
  const th0 = Math.PI * from, th1 = Math.PI * to;
  const top = arcPts(g, th0, th1, fr.o + o1, 14);
  const N = 9;
  const low = [];
  for (let i = 0; i <= N; i++) {
    const th = th1 + ((th0 - th1) * i) / N;
    const lean = 1 + 0.35 * (i / N);             // más gruesa a la izquierda
    low.push(arc(g, th, fr.o + o2 * lean - (i % 2 ? 3.6 : 0)));
  }
  return P(`${through(top)}L${low.map(xy).join('L')}Z`, { fill: t.hi, opacity: 0.92, 'data-r': 'flat' });
}

// La sombra que el pelo hace sobre la cara, justo debajo de su borde.
function hairShadow(g, d, dy = 3.4) {
  const id = `hs${++hid}`;
  return E('clipPath', { id }, P(g.path))
    + G({ 'clip-path': `url(#${id})` }, P(d, { fill: '#3A2A3E', opacity: 0.16, transform: `translate(0 ${dy})`, 'data-r': 'tone' }));
}

// Casquete con flequillo: sombra, cúpula + borde de mechones (un solo
// trazo), hebras y anillo de luz.
function capBangs(g, fr, t, opts = {}) {
  const lay = bangLayout(g, fr, opts);
  const top = arcPts(g, Math.PI - fr.ths, fr.ths, fr.o);
  const d = `${through(top)}${bangEdge(fr, lay)}Z`;
  const locks = opts.locks ? sideLocks(g, fr, t, ...opts.locks) : '';
  return hairShadow(g, d) + locks + part(d, t.base) + strands(g, fr, lay, t) + (opts.ring === false ? '' : angelRing(g, fr, t, opts.ringOpts));
}

// Mechones largos que enmarcan la cara por los costados. Van DEBAJO del
// casquete (que les tapa la raíz): así no quedan como orejeras.
function sideLocks(g, fr, t, len, w = 12) {
  const one = (side) => {
    const x = side < 0 ? fr.xl + w * 0.5 - 0.5 : fr.xr - w * 0.5 + 0.5;
    const yTop = fr.sideY - 9;
    // la punta se curva hacia la cara
    const d = lockD(x, yTop, x - side * 3.5, fr.sideY + len, w);
    return part(d, t.base)
      + line(`M${f(x - side * 0.5)} ${f(yTop + 8)} Q${f(x - side * 1)} ${f(fr.sideY + len * 0.5)} ${f(x - side * 2.6)} ${f(fr.sideY + len - 5)}`, t.dark, 2.2, { opacity: 0.6 });
  };
  return one(-1) + one(1);
}

const parting = (g, t, x = 100) => line(`M${f(x)} ${f(g.topAt(x) - 4)} L${f(x)} ${f(g.topAt(x) + 12)}`, t.dark, 2.4, { opacity: 0.85 });

// Coletero del color de los detalles.
const scrunchie = (x, y, col, r = 5.5) => disc(x, y, r, r * 0.82, col, { 'stroke-width': 2 })
  + line(`M${f(x - r * 0.5)} ${f(y - 1)} Q${f(x)} ${f(y - r * 0.62)} ${f(x + r * 0.5)} ${f(y - 1)}`, mixc(col, '#FFFFFF', 0.55), 2, { opacity: 0.9 });

// Pelo de atrás: cae pegado a los costados hasta `yEnd`, con puntas.
function backHair(g, t, yEnd, spread = 5) {
  const o = 6;
  const top = arcPts(g, Math.PI, 0, o, 24);
  const mid = (g.ys + yEnd) / 2;
  const side = (s) => {
    const X = s > 0 ? g.r : g.l;
    return [[X + s * o, g.ys], [X + s * spread, mid], [X + s * (spread + 0.5), yEnd - 8], [X + s * (spread - 2.5), yEnd + 1], [X - s * 4, yEnd - 3], [X - s * 10, yEnd - 8]];
  };
  const right = side(1), left = side(-1).reverse();
  const strandsBack = (s) => {
    const X = s > 0 ? g.r : g.l;
    return `M${f(X + s * (spread - 1))} ${f(g.ys - 6)} Q${f(X + s * (spread + 1))} ${f(mid)} ${f(X + s * (spread - 3))} ${f(yEnd - 6)}`;
  };
  return part(`${through(top)}${through([...right, [100, yEnd - 14], ...left], false)}Z`, t.back)
    + line(strandsBack(-1) + strandsBack(1), shade(t.back, -1), 2.2, { opacity: 0.6 });
}

// Silueta festoneada alrededor de la cabeza (rulos, afro): un solo
// contorno con `n` bultos (en pixel, muchos círculos sueltos son "perlas").
function curlyCloud(g, o, n, bump, a = 0.22, yEnd = null) {
  const R0x = g.hw + o, R0y = g.ys - g.top + o;
  const pt = (th, oo) => [100 + (R0x + oo) * Math.cos(th), g.ys - (R0y + oo) * Math.sin(th)];
  const a0 = Math.PI + a, a1 = -a;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const th = a0 + ((a1 - a0) * i) / n;
    const [x, y] = pt(th, 0);
    if (!i) { d += `M${f(x)} ${f(y)}`; continue; }
    const tm = a0 + ((a1 - a0) * (i - 0.5)) / n;
    const [cx, cy] = pt(tm, bump);
    d += `Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}`;
  }
  const yb = yEnd ?? g.ys + 6;
  const [xe] = pt(a1, 0), [xs] = pt(a0, 0);
  // abajo cierra por detrás del cuerpo (no se ve)
  return `${d}L${f(xe - 8)} ${f(yb)}L${f(xs + 8)} ${f(yb)}Z`;
}

// ── Peinados ─────────────────────────────────────────────────────
export function renderHair(id, g, c) {
  const out = { back: '', front: '', top: '' };
  if (!id || id === 'ninguno') return out;
  const t = hairTones(c.hair);
  const fr = frame(g);
  const tie = c.hairTie;
  const hairCap = (opts) => capBangs(g, fr, t, opts);
  switch (id) {
    case 'flequillo':
      out.front = hairCap({ n: 5, locks: [9, 12] });
      break;
    case 'lado':
      out.front = hairCap({ n: 4, sweep: 10, depth: -2, locks: [7, 11] })
        + parting(g, t, 100 - fr.half * 0.4);
      break;
    case 'bob':
      out.back = backHair(g, t, g.ys + 14, 7);
      out.front = hairCap({ n: 6, depth: 1, locks: [24, 14] });
      break;
    case 'melena':
      out.back = backHair(g, t, 174, 11);
      out.front = hairCap({ n: 5, locks: [40, 15] });
      break;
    case 'coletas': {
      out.front = hairCap({ n: 4, parted: true }) + parting(g, t);
      const tail = (side) => {
        const [tx, ty] = arc(g, side < 0 ? Math.PI * 0.79 : Math.PI * 0.21, 1);
        const s = side;
        const pts = [[tx - s * 2, ty - 7], [tx + s * 18, ty - 6], [tx + s * 30, ty + 14], [tx + s * 28, ty + 40], [tx + s * 20, ty + 58], [tx + s * 16, ty + 42], [tx + s * 13, ty + 18], [tx - s * 1, ty + 6]];
        return {
          back: part(`${through(pts)}Z`, t.base)
            + line(`M${f(tx + s * 9)} ${f(ty)} Q${f(tx + s * 24)} ${f(ty + 18)} ${f(tx + s * 21)} ${f(ty + 46)}`, t.dark, 2.2, { opacity: 0.7 })
            + line(`M${f(tx + s * 14)} ${f(ty - 2)} Q${f(tx + s * 22)} ${f(ty + 4)} ${f(tx + s * 25)} ${f(ty + 16)}`, t.hi, 3, { opacity: 0.85 }),
          top: scrunchie(tx + s * 1.5, ty, tie),
        };
      };
      const L = tail(-1), R = tail(1);
      out.back = L.back + R.back;
      out.top = L.top + R.top;
      break;
    }
    case 'monitos': {
      out.front = hairCap({ n: 4, parted: true }) + parting(g, t);
      const bun = (side) => {
        const [bx, by] = arc(g, side < 0 ? Math.PI * 0.69 : Math.PI * 0.31, 11);
        const r = 15 * Math.pow(g.wf, 0.2);
        // el moño: una bola con dos vueltas de pelo y su brillo
        return disc(bx, by, r, r * 0.95, t.base)
          + line(`M${f(bx - r * 0.7)} ${f(by + r * 0.05)} Q${f(bx - r * 0.1)} ${f(by - r * 0.85)} ${f(bx + r * 0.62)} ${f(by - r * 0.15)} M${f(bx - r * 0.45)} ${f(by + r * 0.5)} Q${f(bx + r * 0.2)} ${f(by + r * 0.15)} ${f(bx + r * 0.68)} ${f(by + r * 0.45)}`, t.dark, 2.2, { opacity: 0.75 })
          + Ell(bx - r * 0.38, by - r * 0.46, r * 0.26, r * 0.17, { fill: t.hi, opacity: 0.95, 'data-r': 'shine' });
      };
      out.back = bun(-1) + bun(1);
      break;
    }
    case 'monoAlto': {
      // peinado hacia atrás: hebras que suben al moño y su anillo de luz
      // la línea del pelo sube en el medio: se ve la frente despejada
      const hl = fr.bangY - 15;
      const d = cap(g, fr, hl, 1.5);
      const hlAt = (x) => hl + (fr.sideY - hl) * Math.pow(Math.abs(x - 100) / fr.half, 1.5);
      out.front = hairShadow(g, d, 2.6) + sideLocks(g, fr, t, 10, 9) + part(d, t.base)
        + line([-0.66, -0.33, 0, 0.33, 0.66].map((k) => { const x = 100 + fr.half * k; return `M${f(x)} ${f(hlAt(x) - 2.5)} Q${f(100 + fr.half * k * 0.6)} ${f(g.top + 18)} ${f(100 + k * 6)} ${f(g.top + 2)}`; }).join(''), t.dark, 2.4, { opacity: 0.7 })
        + angelRing(g, fr, t, { from: 0.8, to: 0.36, o1: -6, o2: -10 });
      const r = 16 * Math.pow(g.wf, 0.15), by = g.top - r + 3;
      out.back = disc(100, by, r, r * 0.9, t.base)
        + line(`M${f(100 - r * 0.65)} ${f(by)} Q100 ${f(by - r * 0.85)} ${f(100 + r * 0.65)} ${f(by - r * 0.1)} M${f(100 - r * 0.35)} ${f(by + r * 0.45)} Q${f(100 + r * 0.2)} ${f(by + r * 0.2)} ${f(100 + r * 0.65)} ${f(by + r * 0.45)}`, t.dark, 2.2, { opacity: 0.75 })
        + Ell(100 - r * 0.4, by - r * 0.42, r * 0.26, r * 0.16, { fill: t.hi, opacity: 0.95, 'data-r': 'shine' });
      out.top = scrunchie(100, g.top - 1, tie, 6.5);
      break;
    }
    case 'cola': {
      out.front = hairCap({ n: 4, sweep: 7, locks: [7, 10] });
      const [tx, ty] = arc(g, Math.PI * 0.28, 2);
      const pts = [[tx - 4, ty - 5], [tx + 18, ty - 16], [tx + 34, ty - 4], [tx + 36, ty + 22], [tx + 28, ty + 47], [tx + 23, ty + 27], [tx + 18, ty + 8], [tx + 3, ty + 5]];
      out.back = part(`${through(pts)}Z`, t.base)
        + line(`M${f(tx + 12)} ${f(ty - 7)} Q${f(tx + 30)} ${f(ty)} ${f(tx + 29)} ${f(ty + 34)}`, t.dark, 2.2, { opacity: 0.7 })
        + line(`M${f(tx + 18)} ${f(ty - 11)} Q${f(tx + 28)} ${f(ty - 7)} ${f(tx + 32)} ${f(ty + 4)}`, t.hi, 3, { opacity: 0.85 });
      out.top = scrunchie(tx + 2, ty - 1, tie, 6);
      break;
    }
    case 'trenzas': {
      out.front = hairCap({ n: 4, parted: true }) + parting(g, t);
      // trenza: eslabones que se montan uno sobre otro, inclinados a un
      // lado y al otro (así se lee el tejido y no un collar de cuentas)
      const braid = (side) => {
        const x0 = side < 0 ? fr.xl + 5 : fr.xr - 5;
        let s = '';
        const n = 6, y0 = fr.sideY - 3, step = 7.6;
        for (let i = 0; i < n; i++) {
          const y = y0 + i * step;
          const x = x0 + side * i * 0.5;
          const lean = i % 2 ? 1 : -1;
          s += part(`M${f(x - 6.8)} ${f(y - 4 + lean * 1.5)} Q${f(x)} ${f(y - 8)} ${f(x + 6.8)} ${f(y - 4 - lean * 1.5)} Q${f(x + 6.5)} ${f(y + 4)} ${f(x + lean * 1.8)} ${f(y + 6.5)} Q${f(x - 6.5)} ${f(y + 4)} ${f(x - 6.8)} ${f(y - 4 + lean * 1.5)}Z`, t.base, { 'stroke-width': 2.2 })
            + line(`M${f(x - lean * 4)} ${f(y - 3)} Q${f(x)} ${f(y)} ${f(x + lean * 3)} ${f(y + 3)}`, t.dark, 2, { opacity: 0.55 });
        }
        const ye = y0 + n * step - 2, xe = x0 + side * n * 0.5;
        return s + part(`M${f(xe - 5)} ${f(ye + 1)} Q${f(xe - 3.5)} ${f(ye + 13)} ${f(xe)} ${f(ye + 16)} Q${f(xe + 3.5)} ${f(ye + 13)} ${f(xe + 5)} ${f(ye + 1)}Z`, t.base, { 'stroke-width': 2.2 })
          + scrunchie(xe, ye, tie, 4.8);
      };
      out.top = braid(-1) + braid(1);
      break;
    }
    case 'rulos': {
      // rulos: una nube de bucles detrás y flequillo de bucles
      out.back = part(curlyCloud(g, 5, 11, 10), t.back)
        + line(arcPts(g, Math.PI + 0.05, -0.05, 9, 7).map(([x, y]) => `M${f(x - 3.6)} ${f(y + 3)} a3.8 3.8 0 1 1 3.8 3.8`).join(''), shade(t.back, -1.1), 2.2, { opacity: 0.7 });
      out.front = hairCap({ n: 6, round: true, depth: -1, notch: 8, ringOpts: { from: 0.8, to: 0.34 } })
        + line(arcPts(g, Math.PI * 0.76, Math.PI * 0.24, -10, 4).map(([x, y]) => `M${f(x - 3.6)} ${f(y + 3)} a3.8 3.8 0 1 1 3.8 3.8`).join(''), t.dark, 2.2, { opacity: 0.65 });
      break;
    }
    case 'afro': {
      // afro: una nube grande y redonda de rizos, con su luz adentro
      out.back = part(curlyCloud(g, 14, 12, 13, 0.32, g.ys + 16), t.base)
        + P(curlyCloud(g, 3, 12, 9, 0.32, g.ys + 10), { fill: t.back, 'data-r': 'flat' })
        + line(arcPts(g, Math.PI + 0.12, -0.12, 17, 8).map(([x, y]) => `M${f(x - 3.4)} ${f(y + 3)} a3.4 3.4 0 1 1 3.4 3.4`).join(''), t.dark, 2.2, { opacity: 0.6 });
      out.front = hairCap({ n: 7, round: true, depth: -5, notch: 6, ringOpts: { from: 0.78, to: 0.36 } })
        + line(arcPts(g, Math.PI * 0.8, Math.PI * 0.2, -7, 5).map(([x, y]) => `M${f(x - 3)} ${f(y + 3)} a3 3 0 1 1 3 3`).join(''), t.dark, 2.2, { opacity: 0.6 });
      break;
    }
    case 'ahoge': {
      // un solo mechón rebelde que sale de la coronilla (con su brillo)
      const x = 102, y = g.top + 3;
      out.top = part(`M${f(x - 3.4)} ${f(y)} C${f(x - 8)} ${f(y - 16)} ${f(x + 9)} ${f(y - 28)} ${f(x + 17)} ${f(y - 22)} C${f(x + 9)} ${f(y - 19.5)} ${f(x + 2.6)} ${f(y - 11)} ${f(x + 4.4)} ${f(y)}Z`, t.base)
        + line(`M${f(x - 2)} ${f(y - 9)} C${f(x - 2)} ${f(y - 16)} ${f(x + 4)} ${f(y - 21)} ${f(x + 9)} ${f(y - 22)}`, t.hi, 2.2, { opacity: 0.9 });
      break;
    }
    case 'corto': {
      out.front = hairCap({ n: 6, depth: -6, sweep: 3, notch: 8, ringOpts: { from: 0.8, to: 0.36 } });
      // picos cortos en la coronilla, como pelo recién cortado
      out.back = [-0.34, -0.1, 0.14, 0.36].map((k, i) => {
        const [x, y] = arc(g, Math.PI / 2 - k, 3);
        const a = -k * 50;
        return G({ transform: `translate(${f(x)} ${f(y)}) rotate(${f(a)})` }, part(`M-6 5 C-5 -1 -2 -6 ${i % 2 ? 1 : 2} -11 C3 -5 5 -1 6 5Z`, t.base));
      }).join('');
      break;
    }
    case 'copete': {
      // copete: una ola de pelo que sube desde la frente y se dobla hacia
      // atrás, sobre un casquete corto
      out.front = hairCap({ n: 7, depth: -10, notch: 5, sweep: 4, locks: [5, 9], ringOpts: { from: 0.82, to: 0.5, o1: -6, o2: -9 } });
      const L = 100 - fr.half * 0.62, R = 100 + fr.half * 0.6, y = g.top + 6;
      const wave = `M${f(L)} ${f(y + 13)} C${f(L - 5)} ${f(y - 6)} ${f(100 - fr.half * 0.2)} ${f(y - 22)} ${f(100 + fr.half * 0.28)} ${f(y - 21)} C${f(R + 2)} ${f(y - 20)} ${f(R + 8)} ${f(y - 9)} ${f(R)} ${f(y - 4)} C${f(R - 4)} ${f(y - 1)} ${f(R - 8)} ${f(y - 4)} ${f(R - 10)} ${f(y - 1)} C${f(R - 12)} ${f(y + 4)} ${f(R - 10)} ${f(y + 9)} ${f(R - 12)} ${f(y + 12)} Q100 ${f(y + 7)} ${f(L)} ${f(y + 13)}Z`;
      out.top = part(wave, t.base)
        + line(`M${f(L + 7)} ${f(y + 6)} C${f(L + 6)} ${f(y - 8)} ${f(100 - fr.half * 0.05)} ${f(y - 16)} ${f(R - 4)} ${f(y - 13)}`, t.hi, 3, { opacity: 0.9 })
        + line(`M${f(L + 14)} ${f(y + 10)} C${f(L + 14)} ${f(y)} ${f(100 + fr.half * 0.05)} ${f(y - 8)} ${f(R - 8)} ${f(y - 6)}`, t.dark, 2.2, { opacity: 0.65 });
      break;
    }
    default: break;
  }
  return out;
}

// ── Cejas ────────────────────────────────────────────────────────
// Siguen el ánimo: enojada baja la punta de adentro, triste la sube,
// sorprendida las levanta. Gruesas para que se lean en pixel.
export function renderBrows(id, g, mood, c, shift = { y: 0, dx: 0 }) {
  if (!id || id === 'ninguna') return '';
  const col = c.brow;
  const y0 = g.face.y + (shift.y || 0) - (id === 'puntitos' ? 16 : 14.5) - (mood === 'sorprendido' ? 3.5 : mood === 'feliz' ? 1.2 : 0);
  const dx = g.face.dx + (shift.dx || 0) + 0.5;
  const one = (side) => {
    const x = 100 + side * dx;
    const tilt = mood === 'enojado' ? -side * 18 : mood === 'triste' ? side * 15 : 0;
    let s;
    switch (id) {
      case 'gruesas':
        s = P(`M${f(x - 7.5)} ${f(y0 + 2)} Q${f(x)} ${f(y0 - 4.6)} ${f(x + 7.5)} ${f(y0)} Q${f(x + 1)} ${f(y0 - 0.4)} ${f(x - 7.5)} ${f(y0 + 3.8)}Z`, { fill: col, stroke: col, 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'data-r': 'flat' });
        break;
      case 'rectas':
        s = line(`M${f(x - 6.5)} ${f(y0)} L${f(x + 6.5)} ${f(y0 - 0.5)}`, col, 3);
        break;
      case 'arqueadas':
        s = line(`M${f(x - 7)} ${f(y0 + 2)} Q${f(x - 1)} ${f(y0 - 5)} ${f(x + 7)} ${f(y0 + 0.5)}`, col, 2.5);
        break;
      case 'puntitos':
        s = Ell(x - side * 1.5, y0, 3.6, 2.6, { fill: col, 'data-r': 'flat' });
        break;
      default:
        s = line(`M${f(x - 6)} ${f(y0 + 1)} Q${f(x)} ${f(y0 - 2.6)} ${f(x + 6)} ${f(y0 + 1)}`, col, 2.3);
    }
    return tilt ? G({ transform: `rotate(${tilt} ${f(x)} ${f(y0)})` }, s) : s;
  };
  return one(-1) + one(1);
}

export function hairColors(r) {
  const hair = r.hairColor || DEFAULT_HAIR_COLOR;
  const accent = r.accColor || r.accentColor || '#FF7FA8';
  const body = r.bodyColor || '#FBEEE6';
  const darkBody = lum(parseColor(body)) < 0.3;
  // sin pelo, la ceja es del tono de la cara; en una mochi oscura, clara
  const brow = r.hair && r.hair !== 'ninguno' ? (darkBody && lum(parseColor(hair)) < 0.3 ? mixc(hair, '#FFFFFF', 0.45) : shade(hair, -1))
    : darkBody ? mixc('#FFF0F6', body, 0.2) : mixc(OUT, body, 0.25);
  // el coletero no puede ser del mismo color del pelo
  const tie = Math.abs(lum(parseColor(accent)) - lum(parseColor(hair))) < 0.08 ? '#FF7FA8' : accent;
  return { hair, brow, hairTie: tie };
}
