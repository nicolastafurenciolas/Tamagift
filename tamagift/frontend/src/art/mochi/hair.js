// Peinados y cejas de la mochi.
//
// La "cabeza" de una mochi es la cúpula de arriba del cuerpo. Todo peinado
// sale de esa cúpula (ver `arc`): un casquete que la cubre hasta la línea
// del pelo y, encima, MECHONES sueltos (cada uno con su contorno). Los
// mechones son los que hacen que se lea como pelo y no como un gorro.
// Como todo se ancla a la cúpula, cae en su sitio en los cuatro anchos.
//
// Capas (ver index.js):
//   back  → detrás del cuerpo (melena, coletas, moños, rizos de atrás)
//   front → sobre el cuerpo, debajo de ojos y boca (casquete, flequillo)
//   top   → encima de la cara (coleteros, trenzas, la antenita, copete)

import { G, P, Cir, Ell } from '../svg.js';
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
// `o` la separa del cuerpo (el pelo tiene grosor).
const arc = (g, th, o) => [100 + (g.hw + o) * Math.cos(th), g.ys - (g.ys - g.top + o) * Math.sin(th)];
const thAt = (g, y, o) => Math.asin(Math.max(0, Math.min(1, (g.ys - y) / (g.ys - g.top + o))));
const arcPts = (g, th0, th1, o, n = 22) => Array.from({ length: n + 1 }, (_, i) => arc(g, th0 + ((th1 - th0) * i) / n, o));

const part = (d, fill, o = {}) => P(d, { fill, stroke: OUT, 'stroke-width': 2.3, 'stroke-linejoin': 'round', 'data-r': 'part', ...o });
const line = (d, stroke, w = 1.6, o = {}) => P(d, { fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-r': 'line', ...o });
const disc = (x, y, rx, ry, fill, o = {}) => P(`M${f(x - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x + rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x - rx)} ${f(y)}Z`, { fill, stroke: OUT, 'stroke-width': 2.3, 'data-r': 'part', ...o });

function hairTones(col) {
  const light = lum(parseColor(col)) > 0.6;
  return {
    base: col,
    back: shade(col, light ? -0.9 : -0.7),   // lo de atrás, en sombra
    dark: shade(col, light ? -1.3 : -1),     // hebras
    hi: mixc(col, '#FFFFFF', light ? 0.65 : 0.45),
  };
}

// Medidas del corte en esta mochi.
function frame(g) {
  const o = 3.4;
  const fy = g.face.y;
  const sideY = fy - 4;            // hasta dónde baja el casquete por los lados
  const bangY = fy - 16;           // puntas del flequillo, en el centro
  const ths = thAt(g, sideY, o);
  const xr = arc(g, ths, o)[0], xl = 200 - xr;
  return { o, fy, sideY, bangY, ths, xr, xl, half: (xr - xl) / 2 };
}

// Casquete: la cúpula hasta una línea de pelo suave, que tapan los
// mechones. `hairline` es su altura en el centro.
function cap(g, fr, hairline = fr.bangY - 7) {
  const top = arcPts(g, Math.PI - fr.ths, fr.ths, fr.o);
  const edge = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const x = fr.xr - (fr.xr - fr.xl) * (i / n);
    const u = Math.abs(x - 100) / fr.half;
    edge.push([x, hairline + (fr.sideY - hairline) * Math.pow(u, 2.2)]);
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
// separa los mechones son hebras finas del tono oscuro del pelo, no
// tinta: con un contorno por mechón la cabeza quedaba cuadriculada.
//   sweep  → peina las puntas hacia un lado (+ derecha)
//   parted → raya al medio: las puntas se abren hacia afuera
//   depth  → corre las puntas hacia abajo; round → puntas redondas (rulos)
function bangLayout(g, fr, { n = 5, sweep = 0, parted = false, depth = 0, round = false, notch = 8 } = {}) {
  const span = fr.half * 0.97;
  const tipY = (x) => fr.bangY + depth + (fr.sideY - fr.bangY - depth) * Math.pow(Math.min(1, Math.abs(x - 100) / span), 2.4);
  const bx = (k) => 100 + (-1 + (2 * k) / n) * span;            // bordes entre mechones
  const tips = [], notches = [];
  for (let i = 0; i < n; i++) {
    const u = -1 + (2 * (i + 0.5)) / n;
    const xc = (bx(i) + bx(i + 1)) / 2;
    const away = parted ? Math.sign(u || 1) * 3 : 0;
    const x = xc + sweep * (1 - Math.abs(u) * 0.35) + u * 2 + away;
    tips.push([x, tipY(x) + (i % 2 ? 1.5 : 0) + (round ? 2 : 0)]);
  }
  for (let k = 1; k < n; k++) notches.push([bx(k) + sweep * 0.5, tipY(bx(k)) - notch]);
  return { tips, notches, round };
}

function bangEdge(fr, lay) {
  const { tips, notches, round } = lay;
  const k = round ? 0.55 : 0.22;          // cuán redonda es la punta
  // de derecha a izquierda: lado derecho, punta, muesca, punta, …, lado izquierdo
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

// Casquete con flequillo: cúpula + borde de mechones (un solo trazo) y
// las hebras que separan los mechones.
function capBangs(g, fr, t, opts = {}) {
  const lay = bangLayout(g, fr, opts);
  const top = arcPts(g, Math.PI - fr.ths, fr.ths, fr.o);
  const d = `${through(top)}${bangEdge(fr, lay)}Z`;
  const sw = opts.sweep || 0;
  const lines = lay.notches.map(([x, y]) => `M${f(x)} ${f(y + 1)} Q${f(x - sw * 0.15)} ${f(y - 6)} ${f(x - sw * 0.35)} ${f(y - 13)}`).join('');
  return part(d, t.base) + (lines ? line(lines, t.dark, 1.5, { opacity: 0.75 }) : '');
}

// Mechones largos que enmarcan la cara por los costados.
function sideLocks(g, fr, t, len, w = 12) {
  const one = (side) => {
    const x = side < 0 ? fr.xl + w * 0.42 : fr.xr - w * 0.42;
    const yTop = fr.sideY - 22;
    return part(lockD(x, yTop, x - side * 2, fr.sideY + len, w), t.base)
      + line(`M${f(x + side * 1)} ${f(yTop + 8)} Q${f(x)} ${f(fr.sideY + len * 0.5)} ${f(x - side * 1.5)} ${f(fr.sideY + len - 6)}`, t.dark, 1.2, { opacity: 0.55 });
  };
  return one(-1) + one(1);
}

// Brillo de "aureola" sobre la cúpula.
function sheen(g, fr, t) {
  const y = g.top + (g.ys - g.top) * 0.2;
  const th = thAt(g, y, 0);
  const a = arc(g, Math.PI - th + 0.12, -5), b = arc(g, Math.PI / 2 + 0.1, -5), c = arc(g, Math.PI / 2 - 0.3, -5);
  const dy = (g.ys - g.top) * 0.14;
  return line(`M${f(a[0])} ${f(a[1] + dy)} Q${f(b[0])} ${f(b[1] + dy - 2)} ${f(c[0])} ${f(c[1] + dy)}`, t.hi, 3.2, { opacity: 0.85 });
}
const parting = (g, t, x = 100) => line(`M${f(x)} ${f(g.topAt(x) - 2)} L${f(x)} ${f(g.topAt(x) + 13)}`, t.dark, 1.6, { opacity: 0.8 });

// Coletero del color de los detalles.
const scrunchie = (x, y, col, r = 5.5) => disc(x, y, r, r * 0.82, col, { 'stroke-width': 2 })
  + line(`M${f(x - r * 0.5)} ${f(y - 1)} Q${f(x)} ${f(y - r * 0.62)} ${f(x + r * 0.5)} ${f(y - 1)}`, mixc(col, '#FFFFFF', 0.5), 1.3, { opacity: 0.85 });

// Pelo de atrás: cae pegado a los costados hasta `yEnd`, con puntas.
function backHair(g, t, yEnd, spread = 5) {
  const o = 5;
  const top = arcPts(g, Math.PI, 0, o, 24);
  // Solo se ven los bordes de afuera (el cuerpo tapa el medio): cada lado
  // baja pegado al costado y termina en dos puntas.
  const mid = (g.ys + yEnd) / 2;
  const side = (s) => {
    const X = s > 0 ? g.r : g.l;
    return [[X + s * o, g.ys], [X + s * spread, mid], [X + s * (spread + 1), yEnd - 9], [X + s * (spread - 4), yEnd - 5], [X + s * (spread - 2), yEnd + 2], [X - s * 10, yEnd - 8]];
  };
  const right = side(1), left = side(-1).reverse();
  return part(`${through(top)}${through([...right, [100, yEnd - 14], ...left], false)}Z`, t.back);
}

// ── Peinados ─────────────────────────────────────────────────────
export function renderHair(id, g, c) {
  const out = { back: '', front: '', top: '' };
  if (!id || id === 'ninguno') return out;
  const t = hairTones(c.hair);
  const fr = frame(g);
  const tie = c.hairTie;
  const hairCap = (opts) => capBangs(g, fr, t, opts) + sheen(g, fr, t);
  switch (id) {
    case 'flequillo':
      out.front = hairCap({ n: 5 }) + sideLocks(g, fr, t, 8, 11);
      break;
    case 'lado':
      out.front = hairCap({ n: 4, sweep: 9, depth: -2 }) + sideLocks(g, fr, t, 6, 10)
        + parting(g, t, 100 - fr.half * 0.4);
      break;
    case 'bob':
      out.back = backHair(g, t, g.ys + 12, 6);
      out.front = hairCap({ n: 6, depth: 1 }) + sideLocks(g, fr, t, 24, 13);
      break;
    case 'melena':
      out.back = backHair(g, t, 176, 11);
      out.front = hairCap({ n: 5 }) + sideLocks(g, fr, t, 42, 14);
      break;
    case 'coletas': {
      out.front = hairCap({ n: 4, parted: true }) + parting(g, t);
      const tail = (side) => {
        const [tx, ty] = arc(g, side < 0 ? Math.PI * 0.79 : Math.PI * 0.21, 1);
        const s = side;
        const pts = [[tx - s * 2, ty - 7], [tx + s * 18, ty - 6], [tx + s * 30, ty + 14], [tx + s * 28, ty + 40], [tx + s * 20, ty + 58], [tx + s * 16, ty + 42], [tx + s * 13, ty + 18], [tx - s * 1, ty + 6]];
        return {
          back: part(`${through(pts)}Z`, t.base)
            + line(`M${f(tx + s * 9)} ${f(ty)} Q${f(tx + s * 24)} ${f(ty + 18)} ${f(tx + s * 21)} ${f(ty + 46)}`, t.dark, 1.4, { opacity: 0.65 })
            + line(`M${f(tx + s * 14)} ${f(ty - 2)} Q${f(tx + s * 22)} ${f(ty + 4)} ${f(tx + s * 25)} ${f(ty + 16)}`, t.hi, 2.2, { opacity: 0.8 }),
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
        const [bx, by] = arc(g, side < 0 ? Math.PI * 0.69 : Math.PI * 0.31, 10);
        const r = 14 * Math.pow(g.wf, 0.2);
        return disc(bx, by, r, r * 0.95, t.base)
          + line(`M${f(bx - r * 0.6)} ${f(by - r * 0.05)} Q${f(bx - r * 0.05)} ${f(by - r * 0.8)} ${f(bx + r * 0.55)} ${f(by - r * 0.2)} M${f(bx - r * 0.4)} ${f(by + r * 0.4)} Q${f(bx + r * 0.2)} ${f(by + r * 0.12)} ${f(bx + r * 0.6)} ${f(by + r * 0.42)}`, t.dark, 1.5, { opacity: 0.7 })
          + Ell(bx - r * 0.35, by - r * 0.45, r * 0.24, r * 0.16, { fill: t.hi, opacity: 0.9, 'data-r': 'shine' });
      };
      out.back = bun(-1) + bun(1);
      break;
    }
    case 'monoAlto': {
      // peinado hacia atrás: hebras que suben al moño
      out.front = part(cap(g, fr, fr.bangY - 2), t.base) + sheen(g, fr, t)
        + line([-0.6, -0.3, 0.3, 0.6].map((k) => { const x = 100 + fr.half * k; return `M${f(x)} ${f(fr.bangY + (fr.sideY - fr.bangY) * k * k - 3)} Q${f(100 + fr.half * k * 0.5)} ${f(g.top + 14)} ${f(100 + k * 4)} ${f(g.top + 2)}`; }).join(''), t.dark, 1.3, { opacity: 0.6 })
        + sideLocks(g, fr, t, 10, 8);
      const r = 15 * Math.pow(g.wf, 0.15), by = g.top - r + 3;
      out.back = disc(100, by, r, r * 0.9, t.base)
        + line(`M${f(100 - r * 0.6)} ${f(by)} Q100 ${f(by - r * 0.8)} ${f(100 + r * 0.6)} ${f(by - r * 0.1)} M${f(100 - r * 0.3)} ${f(by + r * 0.45)} Q${f(100 + r * 0.2)} ${f(by + r * 0.2)} ${f(100 + r * 0.6)} ${f(by + r * 0.45)}`, t.dark, 1.5, { opacity: 0.7 })
        + Ell(100 - r * 0.38, by - r * 0.42, r * 0.24, r * 0.15, { fill: t.hi, opacity: 0.9, 'data-r': 'shine' });
      out.top = scrunchie(100, g.top - 1, tie, 6.5);
      break;
    }
    case 'cola': {
      out.front = hairCap({ n: 4, sweep: 6 }) + sideLocks(g, fr, t, 6, 9);
      const [tx, ty] = arc(g, Math.PI * 0.28, 2);
      const pts = [[tx - 4, ty - 5], [tx + 18, ty - 16], [tx + 34, ty - 4], [tx + 36, ty + 22], [tx + 28, ty + 46], [tx + 23, ty + 27], [tx + 18, ty + 8], [tx + 3, ty + 5]];
      out.back = part(`${through(pts)}Z`, t.base)
        + line(`M${f(tx + 12)} ${f(ty - 7)} Q${f(tx + 30)} ${f(ty)} ${f(tx + 29)} ${f(ty + 34)}`, t.dark, 1.4, { opacity: 0.65 })
        + line(`M${f(tx + 18)} ${f(ty - 11)} Q${f(tx + 28)} ${f(ty - 7)} ${f(tx + 32)} ${f(ty + 4)}`, t.hi, 2.2, { opacity: 0.8 });
      out.top = scrunchie(tx + 2, ty - 1, tie, 6);
      break;
    }
    case 'trenzas': {
      out.front = hairCap({ n: 4, parted: true }) + parting(g, t);
      const braid = (side) => {
        const x0 = side < 0 ? fr.xl + 5 : fr.xr - 5;
        let s = '';
        const n = 5, y0 = fr.sideY - 2, step = 9;
        for (let i = 0; i < n; i++) {
          const y = y0 + i * step;
          const x = x0 + side * i * 0.6;
          const lean = i % 2 ? 1 : -1;
          s += part(`M${f(x - 6.5)} ${f(y - 3)} Q${f(x)} ${f(y - 7 + lean)} ${f(x + 6.5)} ${f(y - 3)} Q${f(x + 6)} ${f(y + 5)} ${f(x + lean * 1.5)} ${f(y + 6)} Q${f(x - 6)} ${f(y + 5)} ${f(x - 6.5)} ${f(y - 3)}Z`, t.base, { 'stroke-width': 2 });
        }
        const ye = y0 + n * step - 1, xe = x0 + side * n * 0.6;
        return s + part(`M${f(xe - 4.5)} ${f(ye + 1)} Q${f(xe - 3)} ${f(ye + 13)} ${f(xe)} ${f(ye + 15)} Q${f(xe + 3)} ${f(ye + 13)} ${f(xe + 4.5)} ${f(ye + 1)}Z`, t.base, { 'stroke-width': 2 })
          + scrunchie(xe, ye, tie, 4.6);
      };
      out.top = braid(-1) + braid(1);
      break;
    }
    case 'rulos': {
      // rizos que asoman por detrás y flequillo de bucles
      out.back = arcPts(g, Math.PI + 0.12, -0.12, 6, 12).map(([x, y], i) => disc(x, y, 9.5 + (i % 2) * 1.5, 9 + (i % 2) * 1.5, t.back)).join('');
      out.front = hairCap({ n: 6, round: true, depth: -1, notch: 6 })
        + arcPts(g, Math.PI * 0.78, Math.PI * 0.22, -8, 4).map(([x, y]) => line(`M${f(x - 3.5)} ${f(y + 3)} a3.6 3.6 0 1 1 3.6 3.6`, t.dark, 1.3, { opacity: 0.6 })).join('');
      break;
    }
    case 'afro': {
      out.back = arcPts(g, Math.PI + 0.16, -0.16, 9, 13).map(([x, y], i) => disc(x, y, 13 + (i % 3), 12.5 + (i % 3), t.base)).join('')
        + arcPts(g, Math.PI + 0.2, -0.2, 3, 9).map(([x, y]) => Cir(x, y, 12, { fill: t.base, 'data-r': 'flat' })).join('');
      out.front = hairCap({ n: 7, round: true, depth: -4, notch: 5 })
        + arcPts(g, Math.PI * 0.8, Math.PI * 0.2, -6, 5).map(([x, y]) => line(`M${f(x - 3)} ${f(y + 3)} a3 3 0 1 1 3 3`, t.dark, 1.2, { opacity: 0.55 })).join('');
      break;
    }
    case 'ahoge': {
      // un solo mechón rebelde que sale de la coronilla
      const x = 102, y = g.top + 3;
      out.top = part(`M${f(x - 3)} ${f(y)} C${f(x - 7)} ${f(y - 16)} ${f(x + 9)} ${f(y - 27)} ${f(x + 16)} ${f(y - 21)} C${f(x + 8)} ${f(y - 19)} ${f(x + 2)} ${f(y - 11)} ${f(x + 4)} ${f(y)}Z`, t.base);
      break;
    }
    case 'corto':
      out.front = hairCap({ n: 6, depth: -6, sweep: 3, notch: 6 });
      out.back = [-0.32, 0, 0.3].map((k, i) => {
        const [x, y] = arc(g, Math.PI / 2 - k, 2);
        return part(`M${f(x - 6)} ${f(y + 5)} L${f(x - 1 + i * 2)} ${f(y - 8)} L${f(x + 6)} ${f(y + 5)}Z`, t.base);
      }).join('');
      break;
    case 'copete': {
      out.front = part(cap(g, fr, fr.bangY - 9), t.base) + sideLocks(g, fr, t, 4, 9);
      const L = 100 - fr.half * 0.55, R = 100 + fr.half * 0.65, y = g.top + 4;
      out.top = part(`M${f(L)} ${f(y + 14)} C${f(L - 4)} ${f(y - 12)} ${f(100 + fr.half * 0.2)} ${f(y - 26)} ${f(R)} ${f(y - 14)} C${f(R - 12)} ${f(y - 12)} ${f(R - 16)} ${f(y - 2)} ${f(R - 10)} ${f(y + 12)} Q100 ${f(y + 6)} ${f(L)} ${f(y + 14)}Z`, t.base)
        + line(`M${f(L + 8)} ${f(y + 4)} C${f(L + 8)} ${f(y - 10)} ${f(100 + fr.half * 0.15)} ${f(y - 17)} ${f(R - 6)} ${f(y - 13)}`, t.hi, 2.4, { opacity: 0.85 });
      break;
    }
    default: break;
  }
  return out;
}

// ── Cejas ────────────────────────────────────────────────────────
// Siguen el ánimo: enojada baja la punta de adentro, triste la sube,
// sorprendida las levanta.
export function renderBrows(id, g, mood, c, shift = { y: 0, dx: 0 }) {
  if (!id || id === 'ninguna') return '';
  const col = c.brow;
  const y0 = g.face.y + (shift.y || 0) - (id === 'puntitos' ? 16 : 14) - (mood === 'sorprendido' ? 3.5 : mood === 'feliz' ? 1.2 : 0);
  const dx = g.face.dx + (shift.dx || 0) + 0.5;
  const one = (side) => {
    const x = 100 + side * dx;
    const tilt = mood === 'enojado' ? -side * 16 : mood === 'triste' ? side * 13 : 0;
    let s;
    switch (id) {
      case 'gruesas':
        s = P(`M${f(x - 7)} ${f(y0 + 1.5)} Q${f(x)} ${f(y0 - 4)} ${f(x + 7)} ${f(y0)} Q${f(x)} ${f(y0 - 1)} ${f(x - 7)} ${f(y0 + 3.2)}Z`, { fill: col, stroke: col, 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'data-r': 'flat' });
        break;
      case 'rectas':
        s = line(`M${f(x - 6.5)} ${f(y0)} L${f(x + 6.5)} ${f(y0 - 0.5)}`, col, 2.8);
        break;
      case 'arqueadas':
        s = line(`M${f(x - 7)} ${f(y0 + 2)} Q${f(x - 1)} ${f(y0 - 5)} ${f(x + 7)} ${f(y0 + 0.5)}`, col, 2);
        break;
      case 'puntitos':
        s = Ell(x - side * 1.5, y0, 3.4, 2.4, { fill: col, 'data-r': 'flat' });
        break;
      default:
        s = line(`M${f(x - 6)} ${f(y0 + 1)} Q${f(x)} ${f(y0 - 2.6)} ${f(x + 6)} ${f(y0 + 1)}`, col, 1.9);
    }
    return tilt ? G({ transform: `rotate(${tilt} ${f(x)} ${f(y0)})` }, s) : s;
  };
  return one(-1) + one(1);
}

export function hairColors(r) {
  const hair = r.hairColor || DEFAULT_HAIR_COLOR;
  const accent = r.accColor || r.accentColor || '#FF7FA8';
  const brow = r.hair && r.hair !== 'ninguno' ? shade(hair, -1) : mixc(OUT, r.bodyColor || '#FBEEE6', 0.25);
  // el coletero no puede ser del mismo color del pelo
  const tie = Math.abs(lum(parseColor(accent)) - lum(parseColor(hair))) < 0.08 ? '#FF7FA8' : accent;
  return { hair, brow, hairTie: tie };
}
