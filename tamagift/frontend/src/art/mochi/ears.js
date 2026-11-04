// Orejas (y lo que hace a cada animalito): cada oreja se dibuja derecha,
// con la base en (0,0), y se coloca sobre el borde del cuerpo en el
// ángulo de ese punto. Así sirve igual en los cuatro anchos.
//
// Algunos animales se reconocen por la cara más que por las orejas: el
// chanchito por su ñata, el koala por su nariz grande, la capibara por su
// hocico ancho, la vaquita por su morro rosado y el panda por sus manchas.
// Eso va en `face` (encima del cuerpo, debajo de ojos y boca).
//
// Pensado para pixel: nada más fino que 2–3 unidades (en el cuarto un
// píxel de arte mide ~2.7 unidades), siluetas llenas en vez de trazos.

import { G, P, Ell, Cir, E, mirrorX } from '../svg.js';
import { parseColor, hex, ramp, mixRgb, lum } from '../color.js';

export const EARS = [
  { id: 'ninguna', label: 'Sin orejas' },
  { id: 'gato', label: 'Gatito' },
  { id: 'conejo', label: 'Conejito' },
  { id: 'conejoCaido', label: 'Conejito caído' },
  { id: 'oso', label: 'Osito' },
  { id: 'perro', label: 'Perrito' },
  { id: 'zorro', label: 'Zorrito' },
  { id: 'raton', label: 'Ratoncito' },
  { id: 'cerdito', label: 'Cerdito' },
  { id: 'panda', label: 'Panda' },
  { id: 'koala', label: 'Koala' },
  { id: 'lobo', label: 'Lobito' },
  { id: 'oveja', label: 'Ovejita' },
  { id: 'pollito', label: 'Pollito' },
  { id: 'rana', label: 'Ranita' },
  { id: 'unicornio', label: 'Unicornio' },
  { id: 'dragon', label: 'Dragoncito' },
  { id: 'murcielago', label: 'Murciélago' },
  { id: 'alas', label: 'Angelito' },
  { id: 'axolote', label: 'Ajolote' },
  { id: 'capibara', label: 'Capibara' },
  { id: 'ardilla', label: 'Ardillita' },
  { id: 'hamster', label: 'Hámster' },
  { id: 'leon', label: 'Leoncito' },
  { id: 'vaca', label: 'Vaquita' },
  { id: 'ciervo', label: 'Cervatillo' },
  { id: 'abeja', label: 'Abejita' },
];

const OUT = '#3A2A3E';
const shade = (c, k) => hex(ramp(parseColor(c), k));
const mixc = (a, b, t) => hex(mixRgb(parseColor(a), parseColor(b), t));
const f = (n) => n.toFixed(1);
const part = (d, fill, extra = {}) => P(d, { fill, stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'part', ...extra });
const flat = (d, fill, extra = {}) => P(d, { fill, 'data-r': 'flat', ...extra });
const tone = (d, fill, op, extra = {}) => P(d, { fill, opacity: op, 'data-r': 'tone', ...extra });

// Coloca una oreja izquierda (dibujada derecha) sobre el borde y la
// espeja a la derecha.
function pair(g, xFrac, sink, local, { tilt = 0.85, rot = 0, scale } = {}) {
  const s = scale ?? Math.pow(g.wf, 0.35);
  const x = 100 - g.w * xFrac;
  const y = g.topAt(x) + sink;
  const a = g.tiltAt(x) * tilt + rot;
  const left = G({ transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a.toFixed(1)}) scale(${s.toFixed(3)})` }, local);
  return left + mirrorX(left);
}
// Una pieza a un lado del cuerpo (en coordenadas del dibujo) y su espejo.
const both = (s) => s + mirrorX(s);

let zid = 0;

// Ala de membrana (dragón, murciélago): nace arriba en la espalda y se
// abre hacia afuera con tres puntas y sus varillas.
function membraneWing(g, col, size = 1) {
  const s = size * Math.pow(g.wf, 0.3);
  const x = g.l + 12, y = g.ys - (g.ys - g.top) * 0.42;
  const wing = part('M4 8 L2 -4 C-2 -16 -12 -26 -26 -28 C-25 -21 -24 -16 -27 -10 C-21 -11 -16 -8 -16 -2 C-11 -5 -6 -2 -5 4 C-2 3 2 5 4 8Z', col)
    + P('M1 -2 L-24 -25 M0 0 L-24 -11 M1 2 L-14 -3', { fill: 'none', stroke: shade(col, -1.1), 'stroke-width': 2.2, 'stroke-linecap': 'round', 'data-r': 'line' });
  return both(G({ transform: `translate(${f(x)} ${f(y)}) scale(${s.toFixed(3)})` }, wing));
}

export function renderEars(id, g, c) {
  const inner = c.earInner;
  // side: orejas que cuelgan a los costados (van debajo del pelo)
  const out = { back: '', side: '', front: '', face: '', faceShift: null };
  const fy = g.face.y;
  switch (id) {
    case 'gato':
      out.back = pair(g, 0.26, 10, part('M-15 9 L-6.5 -21 Q0 -29.5 6.5 -21 L15 9Z', c.body) + flat('M-8.5 4 L-2.8 -13.5 Q0 -18 2.8 -13.5 L8.5 4Z', inner), { rot: -3, scale: 1.16 * Math.pow(g.wf, 0.35) });
      break;
    case 'conejo':
      out.back = pair(g, 0.14, 10, part('M0 6 C-10 6 -12 -14 -11 -27 C-10 -41 -4.5 -49 0 -49 C4.5 -49 10 -41 11 -27 C12 -14 10 6 0 6Z', c.body) + flat('M0 0 C-4.6 0 -6 -14 -5.6 -25 C-5 -35 -2.2 -41 0 -41 C2.2 -41 5 -35 5.6 -25 C6 -14 4.6 0 0 0Z', inner), { tilt: 0.4, rot: -9 });
      break;
    case 'conejoCaido': {
      // orejas largas que caen por los costados de la cabeza, por fuera
      const x = 100 - g.w * 0.25, y = g.topAt(x) + 3;
      const ear = part('M8 -3 C-4 -10 -20 -7 -27 6 C-33 18 -34 34 -27 41 C-20 47 -12 39 -12 28 C-12 18 -5 9 9 4Z', c.body)
        + flat('M3 -1 C-6 -5 -17 -1 -22 9 C-27 19 -27 31 -23 35 C-19 38 -16 32 -16 25 C-15 15 -8 7 4 3Z', inner)
        + tone('M-27 6 C-33 18 -34 34 -27 41 C-31 30 -30 16 -24 6Z', '#3A2A3E', 0.12);
      const L = G({ transform: `translate(${f(x)} ${f(y)}) scale(${Math.pow(g.wf, 0.3).toFixed(3)})` }, ear);
      out.side = both(L);
      break;
    }
    case 'oso':
      out.back = pair(g, 0.27, 6, Cir(0, -6.5, 13, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'data-r': 'part' }) + Cir(0, -5.5, 7, { fill: inner, 'data-r': 'flat' }), { tilt: 0.6 });
      break;
    case 'perro': {
      const x = 100 - g.w * 0.31, y = g.topAt(x) + 5;
      const ear = part('M7 -6 C-7 -11 -21 -1 -22 17 C-23 33 -15 44 -7 42 C1 40 3 26 5 14 C6 6 11 -2 7 -6Z', c.accent)
        + tone('M-22 17 C-23 33 -15 44 -7 42 C-15 38 -18 28 -16 14 C-15 6 -12 0 -8 -4 C-16 0 -21 8 -22 17Z', '#3A2A3E', 0.14);
      const L = G({ transform: `translate(${f(x)} ${f(y)}) scale(${Math.pow(g.wf, 0.3).toFixed(3)})` }, ear);
      out.side = both(L);
      break;
    }
    case 'zorro': {
      const id2 = `zt${++zid}`;
      const d = 'M-18 10 C-19 -5 -14 -25 -3 -35 C0 -38 2 -38 4 -34 L20 10Z';
      out.back = pair(g, 0.25, 10, E('clipPath', { id: id2 }, P(d)) + part(d, c.body)
        + G({ 'clip-path': `url(#${id2})` }, flat('M-30 -21 L22 -40 L22 -17 Q0 -13 -30 -9Z', c.tip))
        + P(d, { fill: 'none', stroke: OUT, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'line' })
        + flat('M-10 5 C-10 -6 -7 -16 -1 -22 L10 5Z', inner), { tilt: 0.7 });
      break;
    }
    case 'raton':
      out.back = pair(g, 0.3, 9, Cir(0, -12, 17.5, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'data-r': 'part' }) + Cir(1, -11, 11, { fill: inner, 'data-r': 'flat' }), { tilt: 0.7 });
      break;
    case 'cerdito': {
      // orejas de chancho: anchas, con la punta doblada hacia adelante
      out.front = pair(g, 0.25, 9, part('M-15 8 C-15 -4 -10 -16 -2 -20 C4 -17 13 -6 15 6Z', c.body) + flat('M-8.5 4 C-7.5 -4 -4.5 -10.5 -1 -12.5 C3 -9.5 7.5 -3 8.5 4Z', inner)
        + part('M-2 -20 C4 -17 9.5 -10.5 11.5 -4 C5 -1 -1 -2 -6.5 -7.5 C-5.5 -12.5 -4 -16.5 -2 -20Z', shade(c.body, -0.35)), { tilt: 0.55, rot: -4 });
      // la ñata: ovalada, rosada, con sus dos agujeritos
      const sc = c.snout;
      const y = fy + 5.5, rx = 8.4 * Math.pow(g.wf, 0.15), ry = 6;
      out.face = Ell(100, y, rx, ry, { fill: sc, stroke: OUT, 'stroke-width': 2.2, 'data-r': 'part' })
        + Ell(100 - rx * 0.36, y + 0.4, 1.7, 2.6, { fill: shade(sc, -2.2), 'data-r': 'flat' })
        + Ell(100 + rx * 0.36, y + 0.4, 1.7, 2.6, { fill: shade(sc, -2.2), 'data-r': 'flat' })
        + Ell(100 - rx * 0.5, y - ry * 0.55, rx * 0.28, 1.2, { fill: '#FFFFFF', opacity: 0.7, 'data-r': 'shine' });
      out.faceMouthDy = 2;
      break;
    }
    case 'panda': {
      const dark = c.patch;
      out.back = pair(g, 0.27, 6, Cir(0, -6.5, 12.5, { fill: dark, stroke: '#2A2230', 'stroke-width': 2.6, 'data-r': 'part' }) + Cir(0, -5.5, 6.4, { fill: shade(dark, 0.5), 'data-r': 'flat' }), { tilt: 0.6 });
      const y = fy + 1, dx = g.face.dx;
      // manchas en lágrima, inclinadas hacia afuera (más anchas abajo)
      out.face = [-1, 1].map((s) => G({ transform: `rotate(${s * -24} ${f(100 + s * dx)} ${f(y)})` },
        P(`M${f(100 + s * dx)} ${f(y - 12.5)} C${f(100 + s * dx + 9)} ${f(y - 12.5)} ${f(100 + s * dx + 12.5)} ${f(y - 2)} ${f(100 + s * dx + 11)} ${f(y + 6)} C${f(100 + s * dx + 9)} ${f(y + 13.5)} ${f(100 + s * dx - 9)} ${f(y + 13.5)} ${f(100 + s * dx - 11)} ${f(y + 6)} C${f(100 + s * dx - 12.5)} ${f(y - 2)} ${f(100 + s * dx - 9)} ${f(y - 12.5)} ${f(100 + s * dx)} ${f(y - 12.5)}Z`, { fill: dark, 'data-r': 'flat' }))).join('');
      break;
    }
    case 'koala': {
      const fluffy = 'M-16 2 C-24 -2 -24 -14 -17 -18 C-17 -27 -6 -32 0 -26 C6 -32 17 -27 17 -18 C24 -14 24 -2 16 2 C10 6 -10 6 -16 2Z';
      out.back = pair(g, 0.3, 8, part(fluffy, c.body) + flat('M-9 -2 C-13 -6 -11 -14 -6 -15 C-4 -21 4 -21 6 -15 C11 -14 13 -6 9 -2 C5 0 -5 0 -9 -2Z', c.inner), { tilt: 0.75 });
      // la nariz grande y oscura del koala, con su brillo
      const y = fy + 4.5;
      out.face = P(`M100 ${f(y - 6.5)} C${f(105.5)} ${f(y - 6.5)} ${f(106)} ${f(y - 1)} ${f(105)} ${f(y + 2.5)} C${f(104)} ${f(y + 6.5)} ${f(96)} ${f(y + 6.5)} ${f(95)} ${f(y + 2.5)} C${f(94)} ${f(y - 1)} ${f(94.5)} ${f(y - 6.5)} 100 ${f(y - 6.5)}Z`, { fill: '#4A3F55', stroke: OUT, 'stroke-width': 2, 'data-r': 'part' })
        + Ell(97.6, y - 3, 1.5, 2.1, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' });
      out.faceMouthDy = 2;
      break;
    }
    case 'lobo':
      out.back = pair(g, 0.24, 10, part('M-14.5 9 L-7 -28 Q0 -35.5 6.5 -28 L15.5 9Z', c.body)
        + flat('M-7.5 5 L-3.2 -17 Q0 -20 3.2 -17 L8.5 5Z', inner)
        + flat('M-4.5 5 L-2 -8 L0 -2 L2 -9 L4.5 5Z', c.body), { tilt: 0.8 });
      break;
    case 'oveja': {
      // copete de lana: una sola nube festoneada (en pixel, muchos
      // círculos sueltos se ven como perlas) con rulitos adentro
      const t = g.top, k = Math.pow(g.wf, 0.25);
      const cx = 100, rx = 32 * k, ry = 15, cy = t + 9;
      const n = 10;
      let d = '';
      for (let i = 0; i <= n; i++) {
        const th = Math.PI + 0.25 - ((Math.PI + 0.5) * i) / n;
        const x = cx + rx * Math.cos(th), y = cy - ry * Math.sin(th);
        if (!i) { d += `M${f(x)} ${f(y)}`; continue; }
        const tm = Math.PI + 0.25 - ((Math.PI + 0.5) * (i - 0.5)) / n;
        d += `Q${f(cx + (rx + 7) * Math.cos(tm))} ${f(cy - (ry + 7) * Math.sin(tm))} ${f(x)} ${f(y)}`;
      }
      // el borde de abajo: rulitos sobre la frente
      const xr = cx + rx * Math.cos(-0.25), xl = cx + rx * Math.cos(Math.PI + 0.25), yb = cy + ry * Math.sin(0.25);
      const m = 4;
      for (let i = 1; i <= m; i++) {
        const x = xr - ((xr - xl) * i) / m, xm = xr - ((xr - xl) * (i - 0.5)) / m;
        d += `Q${f(xm)} ${f(yb + 9)} ${f(x)} ${f(yb)}`;
      }
      const curl = (x, y, r) => `M${f(x - r)} ${f(y)} a${f(r)} ${f(r)} 0 1 1 ${f(r)} ${f(r)}`;
      out.front = part(`${d}Z`, c.wool)
        // sombra en la parte de abajo de la nube y rizos marcados
        + P(`M${f(xl)} ${f(yb - 2)} Q${f(cx)} ${f(yb + 4)} ${f(xr)} ${f(yb - 2)} L${f(xr - 2)} ${f(cy - 2)} Q${f(cx)} ${f(cy + 4)} ${f(xl + 2)} ${f(cy - 2)}Z`, { fill: shade(c.wool, -1.2), opacity: 0.55, 'data-r': 'tone' })
        + P(curl(cx - 16 * k, cy + 1, 4) + curl(cx + 1 * k, cy - 5, 4.2) + curl(cx + 17 * k, cy + 2, 3.8) + curl(cx - 6 * k, cy + 7, 3.4) + curl(cx + 9 * k, cy + 7, 3.4), { fill: 'none', stroke: shade(c.wool, -1.8), 'stroke-width': 2.6, 'stroke-linecap': 'round', 'data-r': 'line' })
        + Ell(cx - 10 * k, t - 2, 5, 2.4, { fill: '#FFFFFF', opacity: 0.85, 'data-r': 'shine' });
      out.back = pair(g, 0.36, 13, part('M3 2 C-5 -3 -18 -1 -24 6 C-16 11 -5 11 3 8Z', c.body) + flat('M-1 3 C-7 1.5 -14 2.5 -18 5.5 C-12 8 -6 7.5 -1 6Z', inner), { tilt: 0.3, rot: -8 });
      break;
    }
    case 'pollito': {
      // tres plumitas en la coronilla
      const t = g.top, pc = shade(c.body, -0.25);
      const feather = (x, rot, len) => G({ transform: `translate(${f(100 + x)} ${f(t + 4)}) rotate(${rot})` },
        part(`M-3.2 2 C-4.5 ${f(-len * 0.45)} -2.5 ${f(-len * 0.85)} 0.5 ${f(-len)} C2.5 ${f(-len * 0.8)} 3.8 ${f(-len * 0.4)} 3.2 2Z`, pc, { 'stroke-width': 2.2 }));
      // un mechoncito que brota: una pluma alta inclinada y una chiquita
      out.front = feather(-4, -26, 13) + feather(2, 14, 20);
      // alitas pegadas a los costados, con la punta hacia abajo
      // alitas pegadas a los costados, con la punta hacia abajo y afuera
      const wy = g.ys - 4, wc = shade(c.body, -0.3), L = g.l;
      const wing = part(`M${f(L + 9)} ${f(wy - 15)} C${f(L - 6)} ${f(wy - 15)} ${f(L - 14)} ${f(wy + 2)} ${f(L - 10)} ${f(wy + 17)} C${f(L - 6)} ${f(wy + 12)} ${f(L - 2)} ${f(wy + 13)} ${f(L + 1)} ${f(wy + 8)} C${f(L + 4)} ${f(wy + 9)} ${f(L + 7)} ${f(wy + 6)} ${f(L + 8)} ${f(wy + 1)} C${f(L + 12)} ${f(wy - 3)} ${f(L + 12)} ${f(wy - 11)} ${f(L + 9)} ${f(wy - 15)}Z`, wc)
        + tone(`M${f(L - 10)} ${f(wy + 17)} C${f(L - 14)} ${f(wy + 4)} ${f(L - 9)} ${f(wy - 7)} ${f(L - 2)} ${f(wy - 12)} C${f(L - 6)} ${f(wy - 3)} ${f(L - 7)} ${f(wy + 7)} ${f(L - 10)} ${f(wy + 17)}Z`, '#3A2A3E', 0.14);
      out.front += both(wing);
      break;
    }
    case 'rana': {
      const bx = g.w * 0.22;
      const by = g.topAt(100 - bx) + 1;
      const bump = Cir(100 - bx, by, 16.5, { fill: c.body, stroke: OUT, 'stroke-width': 2.6, 'data-r': 'part' });
      out.back = bump + mirrorX(bump);
      out.faceShift = { y: by - g.face.y, dx: bx - g.face.dx };
      break;
    }
    case 'unicornio': {
      const t = g.top;
      out.back = pair(g, 0.22, 9, part('M-9.5 8 L-4 -20 Q0 -25 4 -20 L9.5 8Z', c.body) + flat('M-4.5 4 L-1.6 -11.5 L1.6 -11.5 L4.5 4Z', inner), { tilt: 0.9 });
      const id2 = `uh${++zid}`, id3 = `uk${++zid}`;
      const horn = 'M-7.5 1 L0 -36 L7.5 1 Q0 4 -7.5 1Z';
      // cuerno con su espiral en bandas (no en rayitas: en pixel se pierden)
      out.front = G({ transform: `translate(100 ${f(t + 6)}) rotate(8)` },
        E('clipPath', { id: id3 }, P(horn)) + part(horn, '#FFE08A', { stroke: '#A8781E' })
        + G({ 'clip-path': `url(#${id3})` }, flat('M-9 -6 L9 -12 L9 -6 L-9 0Z M-9 -21 L9 -27 L9 -21.5 L-9 -15.5Z', '#D99A2E'))
        + P(horn, { fill: 'none', stroke: '#A8781E', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-r': 'line' })
        + Ell(-2.6, -14, 1.2, 5, { fill: '#FFFFFF', opacity: 0.8, transform: 'rotate(12 -2.6 -14)', 'data-r': 'shine' }))
        + E('clipPath', { id: id2 }, P(g.path))
        + G({ 'clip-path': `url(#${id2})` },
          P(`M${100 - g.w * 0.3} ${t + 26} C${100 - g.w * 0.26} ${t + 4} ${100 - 4} ${t - 4} ${100 + 6} ${t + 2} C${100 - 2} ${t + 10} ${100 - 4} ${t + 18} ${100 - g.w * 0.14} ${t + 28}Z`, { fill: c.mane1, 'data-r': 'flat' })
          + P(`M${100 + 2} ${t + 2} C${100 + 16} ${t - 2} ${100 + g.w * 0.3} ${t + 8} ${100 + g.w * 0.33} ${t + 26} C${100 + g.w * 0.22} ${t + 18} ${100 + 12} ${t + 14} ${100 + 4} ${t + 18} C${100 + 6} ${t + 12} ${100 + 4} ${t + 6} ${100 + 2} ${t + 2}Z`, { fill: c.mane2, 'data-r': 'flat' }));
      break;
    }
    case 'dragon':
      out.back = membraneWing(g, c.accent, 1.18)
        + pair(g, 0.2, 9, part('M-6.5 8 C-8.5 -6 -7.5 -16 -2 -25 C3.5 -18 7.5 -8 6.5 8Z', '#FFF0C9', { stroke: '#8A6A2E' })
          + flat('M-7 -2 L5.8 0 L5.4 3 L-7.2 1Z M-6 -11 L4.6 -9 L4 -6 L-6.6 -8Z', '#E9CF8E'), { tilt: 0.9, rot: -8 })
        + pair(g, 0.36, 18, part('M2 0 C-10 -8 -21 -4 -25 2 C-19 4 -15 8 -15 12 C-11 10 -5 10 2 8Z', c.accent), { tilt: 0.4, rot: -12 });
      break;
    case 'murcielago': {
      const ear = part('M-15 10 C-21 -4 -21 -23 -10 -35 C-8 -27 -4 -23 0 -23 C2 -29 6 -33 10 -35 C14 -21 16 -2 15 10Z', c.accent)
        + flat('M-9 6 C-12 -4 -12 -16 -8 -26 C-6 -20 -3 -17 0 -17 C2 -21 4 -24 6 -26 C9 -16 10 -4 9 6Z', mixc(c.accent, '#FF9EC0', 0.35));
      out.back = membraneWing(g, shade(c.accent, -0.3), 0.72) + pair(g, 0.26, 10, ear, { tilt: 0.85, rot: -6 });
      break;
    }
    case 'alas': {
      const wy = g.ys - 22;
      const feather = (dy, len) => `M${g.l + 8} ${wy + dy} C${g.l - len * 0.4} ${wy + dy - 10} ${g.l - len} ${wy + dy - 4} ${g.l - len} ${wy + dy + 6} C${g.l - len * 0.6} ${wy + dy + 8} ${g.l - len * 0.2} ${wy + dy + 8} ${g.l + 8} ${wy + dy + 10}Z`;
      const wing = part(feather(-6, 30), '#FFFFFF', { stroke: '#8A84A8' }) + part(feather(2, 26), '#F1EDFF', { stroke: '#8A84A8' }) + part(feather(10, 20), '#E6E1FA', { stroke: '#8A84A8' });
      out.back = both(wing);
      break;
    }
    case 'axolote': {
      // branquias: tres plumas rosadas a cada lado, con borde en rulitos y
      // la vena del medio
      const frond = part('M-3 1 C-6 -2 -7 -5 -5 -7.5 C-8.5 -9.5 -8.5 -13.5 -5.2 -14.5 C-7.2 -18 -5 -21.5 0 -24.5 C5 -21.5 7.2 -18 5.2 -14.5 C8.5 -13.5 8.5 -9.5 5 -7.5 C7 -5 6 -2 3 1Z', c.gill, { 'stroke-width': 2.2 })
        + flat('M-1 0 L-1 -18.5 Q0 -20 1 -18.5 L1 0Z', shade(c.gill, -0.9));
      const s = 1.1 * Math.pow(g.wf, 0.3);
      const y0 = g.ys - (g.ys - g.top) * 0.62;
      const L = [-66, -40, -14].map((a, i) => {
        const y = y0 + i * 10;
        const x = 100 - g.chordAt(y) / 2 + 4;
        return G({ transform: `translate(${f(x)} ${f(y)}) rotate(${a}) scale(${s.toFixed(3)})` }, frond);
      }).join('');
      out.back = both(L);
      break;
    }
    case 'capibara': {
      out.back = pair(g, 0.3, 5, Cir(0, -6, 9.5, { fill: shade(c.body, -0.3), stroke: OUT, 'stroke-width': 2.4, 'data-r': 'part' }) + Cir(0, -5.4, 4.6, { fill: shade(c.body, -1), 'data-r': 'flat' }), { tilt: 0.55 });
      // el hocico ancho de la capibara, con los orificios arriba
      const y = fy + 9, rx = 13 * Math.pow(g.wf, 0.15), ry = 8.6, mc = shade(c.body, -0.45);
      out.face = P(`M${f(100 - rx)} ${f(y - 1)} C${f(100 - rx)} ${f(y - ry - 1)} ${f(100 + rx)} ${f(y - ry - 1)} ${f(100 + rx)} ${f(y - 1)} C${f(100 + rx)} ${f(y + ry)} ${f(100 - rx)} ${f(y + ry)} ${f(100 - rx)} ${f(y - 1)}Z`, { fill: mc, 'data-r': 'flat' })
        + Ell(100 - 4.6, y - 4.4, 2.2, 1.5, { fill: shade(c.body, -2.2), 'data-r': 'flat' })
        + Ell(100 + 4.6, y - 4.4, 2.2, 1.5, { fill: shade(c.body, -2.2), 'data-r': 'flat' });
      break;
    }
    case 'hamster':
      out.back = pair(g, 0.33, 6, Cir(0, -7, 11, { fill: c.body, stroke: OUT, 'stroke-width': 2.4, 'data-r': 'part' }) + Cir(0, -6.4, 6, { fill: inner, 'data-r': 'flat' }), { tilt: 0.7 });
      break;
    case 'ardilla':
      out.back = pair(g, 0.25, 9, part('M-11.5 8 L-5 -17.5 Q0 -23.5 5 -17.5 L11.5 8Z', c.body)
        + flat('M-6 4 L-2.4 -10.5 Q0 -13.5 2.4 -10.5 L6 4Z', inner)
        + part('M-2.5 -20 C-7 -26 -5 -34 0 -39 C1 -33 4.5 -29 3.4 -22Z', shade(c.body, -0.8), { 'stroke-width': 2.2 }), { tilt: 0.85 });
      break;
    case 'leon': {
      // melena: una sola forma festoneada alrededor de la cabeza (detrás),
      // con la sombra pegada al cuerpo; y orejitas redondas encima
      const n = 12, R0x = g.hw + 7, R0y = g.ys - g.top + 7;
      const pt = (th, o) => [100 + (R0x + o) * Math.cos(th), g.ys - (R0y + o) * Math.sin(th)];
      const a0 = Math.PI + 0.32, a1 = -0.32;
      const ring = (o, bump) => {
        let d = '';
        for (let i = 0; i <= n; i++) {
          const th = a0 + ((a1 - a0) * i) / n;
          const [x, y] = pt(th, o);
          if (!i) { d += `M${f(x)} ${f(y)}`; continue; }
          const tm = a0 + ((a1 - a0) * (i - 0.5)) / n;
          const [cx, cy] = pt(tm, o + bump);
          d += `Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}`;
        }
        const [xe, ye] = pt(a1, -16), [xs, ys2] = pt(a0, -16);
        return `${d}L${f(xe)} ${f(ye)}L${f(xs)} ${f(ys2)}Z`;
      };
      out.back = part(ring(0, 12), c.mane) + flat(ring(-7, 8), shade(c.mane, -0.7))
        + pair(g, 0.27, 5, Cir(0, -5, 9.5, { fill: c.body, stroke: OUT, 'stroke-width': 2.4, 'data-r': 'part' }) + Cir(0, -4.6, 5, { fill: inner, 'data-r': 'flat' }), { tilt: 0.6 });
      break;
    }
    case 'vaca': {
      out.back = pair(g, 0.42, 14, part('M4 3 C-6 -9 -27 -9 -32 1 C-27 10 -8 10 4 8Z', c.body) + flat('M-1 3 C-8 -3 -20 -3 -25 2 C-20 6 -8 6 -1 5Z', inner), { tilt: 0.2, rot: -12 })
        + pair(g, 0.17, 6, part('M-5.5 5 C-7.5 -4 -5.5 -13 1.5 -18.5 C1 -11 3.5 -4 5.5 5Z', '#F3E6C8', { stroke: '#7A6040' })
          + flat('M-6 -4 C-3 -3 1 -3 4 -4.5 L4.6 -1.5 C1 0 -3 0 -6.2 -1Z', '#D9C49A'), { tilt: 0.9 });
      // el morro rosado, con las fosas arriba (la boca va encima)
      const my = g.face.mouthY + 1, rx = 14 * Math.pow(g.wf, 0.15);
      out.face = Ell(100, my, rx, 9, { fill: c.muzzle, stroke: shade(c.muzzle, -1.4), 'stroke-width': 1.8, 'data-r': 'part' })
        + Ell(100 - rx * 0.42, my - 4.5, 1.9, 1.5, { fill: shade(c.muzzle, -2), 'data-r': 'flat' })
        + Ell(100 + rx * 0.42, my - 4.5, 1.9, 1.5, { fill: shade(c.muzzle, -2), 'data-r': 'flat' });
      break;
    }
    case 'ciervo': {
      // cuernitos de un solo trazo grueso (en pixel una rama fina se pierde)
      const antler = part('M-2.6 4 L-2.6 -9 C-2.6 -13 -5 -16 -8.4 -19.5 L-6 -22 C-3.6 -19.6 -1.6 -17.4 -0.4 -15.4 L-0.4 -21.5 C-0.4 -24.5 0.2 -26.8 1.8 -29 L4.4 -27.8 C3.2 -25.8 2.8 -23.6 2.8 -21 L2.8 -14.4 C4.4 -16.4 6.6 -18.4 8.2 -21 L10.6 -19.4 C8.6 -15 5.4 -11.2 2.8 -8.2 L2.8 4Z', '#C8955E', { stroke: '#6E4A2C', 'stroke-width': 2.2 });
      out.back = pair(g, 0.17, 7, antler, { tilt: 0.85, rot: -4 })
        + pair(g, 0.36, 14, part('M3 2 C-3 -8 -17 -10 -21 -2 C-16 4 -6 6 3 6Z', c.body) + flat('M-1 2 C-5 -3 -13 -4 -16 -1 C-12 2 -6 3 -1 4Z', inner), { tilt: 0.3, rot: -18 });
      break;
    }
    case 'abeja': {
      const t = g.top;
      const ant = (s) => P(`M${100 + s * 9} ${t + 6} C${100 + s * 9} ${t - 6} ${100 + s * 13} ${t - 14} ${100 + s * 19} ${t - 18}`, { fill: 'none', stroke: OUT, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-r': 'line' })
        + Cir(100 + s * 20, t - 19, 4.8, { fill: '#3A3044', stroke: OUT, 'stroke-width': 1.6, 'data-r': 'part' }) + Cir(100 + s * 18.6, t - 20.6, 1.4, { fill: '#FFFFFF', 'data-r': 'shine' });
      const wy = g.ys - (g.ys - g.top) * 0.62;
      const wing = part(`M${g.l + 10} ${wy + 6} C${g.l - 6} ${wy - 6} ${g.l - 16} ${wy - 22} ${g.l - 6} ${wy - 26} C${g.l + 4} ${wy - 28} ${g.l + 10} ${wy - 12} ${g.l + 12} ${wy}Z`, '#EAF6FF', { stroke: '#6F9CC0', 'stroke-width': 2.2 })
        + P(`M${g.l + 8} ${wy + 2} C${g.l} ${wy - 6} ${g.l - 6} ${wy - 14} ${g.l - 4} ${wy - 20}`, { fill: 'none', stroke: '#B9D7EE', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'data-r': 'line' });
      out.back = both(wing);
      out.front = ant(-1) + ant(1);
      break;
    }
    default: break;
  }
  return out;
}

export function colorsForEars(c) {
  const pinkBody = (() => { const [r, g2, b] = parseColor(c.body); return r > 200 && r - b > 15 && r - g2 > 25; })();
  return {
    earInner: c.inner === '#FFFFFF' || c.inner.toUpperCase() === '#FFF1E4' ? mixc(c.inner, '#FFB3C6', 0.55) : c.inner,
    tip: shade(c.body, -2.2),
    patch: '#4A3F55',
    // lana: blanca y un poco fría, que se separe de un cuerpo claro
    wool: lum(parseColor(c.body)) > 0.8 ? '#FFFFFF' : mixc('#FFFFFF', c.body, 0.08),
    mane1: c.accent,
    mane2: c.accentAlt === '#FFFFFF' ? '#B8A1FF' : c.accentAlt,
    gill: mixc(c.accent, '#FF7FA8', 0.75),
    mane: shade(mixc(c.accent, '#E89A3C', 0.5), -0.4),
    // la ñata del chanchito: un rosado un poco más fuerte que el cuerpo
    snout: pinkBody ? shade(c.body, -0.6) : mixc(c.body, '#F49AB2', 0.55),
    // el morro de la vaquita
    muzzle: lum(parseColor(c.body)) < 0.3 ? '#E9A3B0' : mixc('#F7C2C8', c.body, 0.15),
  };
}
