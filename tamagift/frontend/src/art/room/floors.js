// Pisos del cuarto, en la misma perspectiva que todo lo demás (vista
// 3/4 sin punto de fuga, ver draw.js): lo que va hacia el fondo es
// vertical, lo paralelo a la pared es horizontal, y una baldosa cuadrada
// se ve el doble de ancha que de alta (DEPTH = 0.5). Una diagonal a 45°
// en el piso se ve con pendiente 1:2 (justo un escalón limpio en pixel).
//
// Cada pieza (tabla, baldosa, losa) lleva su canto de luz arriba y su
// junta en sombra abajo; los tonos varían entre pocas opciones fijas (no
// al azar suelto) para que el pixel art no se vea sucio. Como en las
// paredes, lo del mismo color va junto en un solo trazo (`brush`): el
// kit de pixel rasteriza pieza por pieza.

import { E, G, flat, line, shade, rr, tone, mix, isDark, svgDoc, DEPTH } from './draw.js';

const T = (id, name, c) => ({ id, name, c });
const f1 = (n) => +n.toFixed(1);
const onlyPx = (inner) => G({ 'data-only': 'pixel' }, inner);
const hash = (a, b = 0, s = 0) => {
  let h = (a * 374761393 + b * 668265263 + s * 1103515245) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// Uno de tres tonos (el del medio, más seguido).
const pick3 = (c, r, k = 0.13) => (r < 0.5 ? c : r < 0.78 ? tone(c, k) : tone(c, -k));
const rect = (x, y, w, h) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const ell = (x, y, rx, ry) => `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;

// Pincel por capas (ver walls.js).
function brush() {
  const layers = [];
  const add = (k, key, d, mk) => {
    const m = (layers[k] = layers[k] || new Map());
    const e = m.get(key);
    if (e) e.d += d; else m.set(key, { d, mk });
  };
  const op = (o) => (o < 1 ? { opacity: o } : {});
  return {
    fill(d, color, o = 1, k = 0) { add(k, `f${color}${o}`, d, (dd) => flat(dd, color, op(o))); },
    gloss(d, o, k = 0) { add(k, `s${o}`, d, (dd) => flat(dd, '#FFFFFF', { ...op(o), 'data-r': 'shine', 'data-skip': 'neon' })); },
    stroke(d, color, w, o = 1, k = 0) { add(k, `l${color}${w}${o}`, d, (dd) => line(dd, color, w, op(o))); },
    put(markup, k = 0) { const m = (layers[k] = layers[k] || new Map()); m.set(`r${m.size}`, { d: '', mk: () => markup }); },
    out() { let s = ''; layers.forEach((m) => m && m.forEach((e) => { s += e.mk(e.d); })); return s; },
  };
}

// Tablas paralelas a la pared: largos bien distintos y uniones
// escalonadas que se leen de lejos (junta oscura y opaca + el canto claro
// de la tabla que empieza), tres tonos de madera, canto de luz arriba y
// una veta larga. Todo opaco: en pixel no queda nada a medias.
function planks(w, h, c, seed) {
  const b = brush();
  const rows = Math.max(3, Math.round(h / 18));
  const rh = h / rows;
  const joint = mix(tone(c[0], -1.05), '#3A2A2E', 0.3);
  const tones = [tone(c[0], -0.17), c[0], tone(c[0], 0.15)];
  for (let i = 0; i < rows; i++) {
    const y = i * rh;
    let x = -hash(i, 0, seed) * 160, j = 0, last = -1;
    while (x < w) {
      const len = [96, 150, 124, 188, 110, 168][Math.floor(hash(i, j, seed + 1) * 6)];
      let t = Math.floor(hash(i, j, seed + 2) * 3);
      if (t === last) t = (t + 1) % 3;
      last = t;
      const col = tones[t];
      b.fill(rect(x, y, len, rh), col);
      b.fill(rect(x, y, len, 2.2), tone(col, 0.45), 1, 1);
      // veta: una línea larga que ondula apenas
      const vy = y + rh * (0.42 + hash(i, j, seed + 3) * 0.22);
      b.fill(`M${f1(x + 12)} ${f1(vy)}q${f1(len * 0.28)} -2 ${f1(len * 0.5)} 0t${f1(len * 0.36)} 0v2.2t${f1(-len * 0.36)} 0q${f1(-len * 0.22)} -2 ${f1(-len * 0.5)} 0Z`, tone(col, -0.28), 1, 2);
      // unión: junta oscura y el canto claro de la tabla siguiente
      b.fill(rect(x - 1.3, y, 2.6, rh), joint, 1, 3);
      b.fill(rect(x + 1.3, y + 2.2, 2, rh - 4.4), tone(col, 0.5), 1, 3);
      x += len; j++;
    }
    b.fill(rect(0, y + rh - 2.4, w, 2.4), joint, 1, 4);
  }
  return b.out();
}

// Baldosas rectangulares (ancho a, alto a·DEPTH) con junta y bisel.
function tiles(w, h, size, grout, pick, o = {}) {
  const b = brush();
  const tw = size, th = size * DEPTH;
  const g = o.g ?? 3;
  b.fill(rect(0, 0, w, h), grout);
  for (let row = 0, y = 0; y < h; row++, y += th) {
    for (let col = 0, x = (o.offset && row % 2 ? -tw / 2 : 0); x < w; col++, x += tw) {
      const fill = pick(row, col);
      const x0 = x + g / 2, y0 = y + g / 2, iw = tw - g, ih = th - g;
      b.fill(rr(x0, y0, iw, ih, o.r ?? 1.5), fill, 1, 1);
      if (o.motif) o.motif(b, x + tw / 2, y + th / 2, tw, th, row, col);
      b.fill(rect(x0 + 1.5, y0 + 0.8, iw - 3, 2.2), tone(fill, 0.75), o.lit ?? 0.55, 6);
      b.fill(rect(x0 + 1.5, y0 + ih - 2.6, iw - 3, 2.2), tone(fill, -0.55), o.dim ?? 0.45, 6);
    }
  }
  // Si el dibujo pasa de una baldosa a otra (mosaico, vetas), la junta
  // se vuelve a trazar encima: el dibujo queda cortado por ella.
  if (o.groutTop) {
    for (let y = 0; y <= h; y += th) b.fill(rect(0, y - g / 2, w, g), grout, 1, 5);
    for (let x = 0; x <= w; x += tw) b.fill(rect(x - g / 2, 0, g, h), grout, 1, 5);
  }
  return b;
}

export const FLOORS = [
  {
    id: 'tablas', name: 'Tablas de madera', price: 0, tags: ['dulce', 'rustico'],
    tints: [
      T('miel', 'Miel', ['#D6A774']), T('clara', 'Clara', ['#E7CDA6']), T('nogal', 'Nogal', ['#8E5E3E']),
      T('cenizo', 'Cenizo', ['#B5ABA3']), T('blanca', 'Blanca', ['#EDE6DB']), T('cereza', 'Cereza', ['#A5584A']),
      T('ebano', 'Ébano', ['#4A3A36']),
    ],
    draw: (w, h, c) => planks(w, h, c, 3),
  },
  {
    // Chevron: tablitas a 45° que se encuentran en una costura. Vistas en
    // 3/4 la pendiente es ±DEPTH; cada columna alterna el sentido.
    id: 'espiga', name: 'Parqué chevron', price: 140, tags: ['elegante'],
    tints: [T('miel', 'Miel', ['#CF9E6C']), T('nogal', 'Nogal', ['#865A3C']), T('cenizo', 'Cenizo', ['#B9AFA4']), T('blanca', 'Blanca', ['#EFE7DC'])],
    draw: (w, h, c) => {
      const b = brush();
      const cw = 40, step = 16, k = cw * DEPTH;
      const joint = tone(c[0], -1.1);
      b.fill(rect(0, 0, w, h), joint);
      for (let col = 0, x = 0; x < w; col++, x += cw) {
        const up = col % 2 === 0;
        for (let y = -k - step, n = 0; y < h + step; y += step, n++) {
          const fill = pick3(c[0], hash(col, n, 9), 0.14);
          const yl = up ? y + k : y, yr = up ? y : y + k;
          // la tablita deja una junta de 2 abajo
          b.fill(`M${x} ${yl}L${x + cw} ${yr}L${x + cw} ${yr + step - 2}L${x} ${yl + step - 2}Z`, fill, 1, 1);
          b.fill(`M${x} ${yl}L${x + cw} ${yr}L${x + cw} ${yr + 2.4}L${x} ${yl + 2.4}Z`, tone(fill, 0.6), 0.55, 2);
        }
        b.fill(rect(x, 0, 1.8, h), joint, 0.9, 3);
      }
      return b.out();
    },
  },
  {
    id: 'ajedrez', name: 'Baldosa ajedrez', price: 120, tags: ['y2k', 'punk', 'elegante', 'gotico'],
    tints: [
      T('clasico', 'Blanco y negro', ['#F1ECE4', '#3B3742']), T('rosa', 'Rosa', ['#FBE7EC', '#E69AB0']), T('menta', 'Menta', ['#E7F5ED', '#84C4A2']),
      T('rojo', 'Rojo', ['#F4EADD', '#B4473F']), T('azul', 'Azul', ['#EEF2F8', '#5E7DB6']), T('lila', 'Lila', ['#F1ECFA', '#9A82D2']),
    ],
    // Baldosa esmaltada: cuadros parejos con junta fina, bisel y un
    // reflejo de la luz del cuarto en algunas claras.
    draw: (w, h, c) => {
      const b = tiles(w, h, 48, mix(c[0], c[1], 0.55), (row, col) => ((row + col) % 2 ? c[1] : c[0]), { g: 2, r: 0.6, lit: 0.4, dim: 0.35 });
      for (let x = 0, i = 0; x < w; x += 48, i++) {
        for (let y = 0, j = 0; y < h; y += 24, j++) {
          if ((i + j) % 2 === 0 && hash(i, j, 3) < 0.5) b.gloss(`M${x + 8} ${y + 16}l12 -8h7l-12 8Z`, 0.45, 7);
        }
      }
      return b.out();
    },
  },
  {
    id: 'baldosa', name: 'Baldosas', price: 100, tags: ['rustico', 'hippie'],
    tints: [
      T('terracota', 'Terracota', ['#C8714E', '#E2CDB8']), T('arena', 'Arena', ['#D9C2A0', '#F0E6D6']),
      T('gris', 'Gris piedra', ['#9F9AA2', '#D6D2D8']), T('verde', 'Verde', ['#7FAE95', '#E2EEE6']), T('blanca', 'Blanca', ['#ECE8E3', '#C9C3BE']),
    ],
    // Baldosa artesanal: cada una de un tono apenas distinto (tres
    // opciones), con su bisel y la junta clara.
    draw: (w, h, c) => tiles(w, h, 46, c[1], (row, col) => pick3(c[0], hash(row, col, 13), 0.16), { g: 3.6, r: 2.2 }).out(),
  },
  {
    id: 'hidraulico', name: 'Mosaico hidráulico', price: 160, tags: ['elegante', 'hippie', 'aesthetic'],
    tints: [
      T('azul', 'Azul', ['#F1ECE2', '#4F78A8', '#E2B65A']), T('verde', 'Verde', ['#F1ECE2', '#4F8E72', '#D97A5A']),
      T('rosa', 'Rosa', ['#FBEFF1', '#D97A93', '#7AAE9A']), T('negro', 'Negro', ['#EDE8E0', '#2E2A33', '#B8433F']),
    ],
    // Mosaico de cemento: en cada baldosa una flor de cuatro pétalos en
    // aspa con el centro de otro color; en cada cruce de juntas, un óvalo
    // (cuatro cuartos, uno por baldosa) con su botón.
    draw: (w, h, c) => {
      const pet = (x, y, dx, dy) => {
        const ex = x + dx, ey = y + dy;
        const nx = -dy * 0.32, ny = dx * 0.32 * DEPTH;
        return `M${x} ${y}Q${f1((x + ex) / 2 + nx)} ${f1((y + ey) / 2 + ny)} ${f1(ex)} ${f1(ey)}Q${f1((x + ex) / 2 - nx)} ${f1((y + ey) / 2 - ny)} ${x} ${y}Z`;
      };
      const b = tiles(w, h, 64, tone(c[0], -0.45), () => c[0], {
        g: 1.6, r: 0.5, lit: 0.35, dim: 0.3, groutTop: true,
        motif: (bb, x, y) => {
          // flor de cuatro pétalos redondos (gordos: se leen en pixel) y
          // cuatro hojitas en aspa entre ellos
          bb.fill(pet(x, y, 15, 7.5) + pet(x, y, -15, 7.5) + pet(x, y, 15, -7.5) + pet(x, y, -15, -7.5), c[2], 1, 2);
          bb.fill(ell(x - 9, y, 7, 4) + ell(x + 9, y, 7, 4) + ell(x, y - 5, 7, 4) + ell(x, y + 5, 7, 4), c[1], 1, 3);
          bb.fill(ell(x, y, 4.2, 2.4), c[2], 1, 4);
        },
      });
      // óvalos en los cruces de las juntas: cuatro cuartos, uno en cada
      // baldosa (la junta los corta)
      for (let x = 0; x <= w; x += 64) {
        for (let y = 0; y <= h + 1; y += 32) {
          b.fill(ell(x, y, 13, 6.6), c[1], 1, 2);
          b.fill(ell(x, y, 5, 2.6), c[2], 1, 3);
        }
      }
      return b.out();
    },
  },
  {
    id: 'alfombra', name: 'Alfombra de muro a muro', price: 110, tags: ['dulce', 'aesthetic', 'hippie'],
    tints: [
      T('salvia', 'Salvia', ['#9DB08A']), T('rosa', 'Rosa', ['#E8B7C4']), T('lila', 'Lila', ['#B9A7DA']), T('gris', 'Gris', ['#A7A3AD']),
      T('azul', 'Azul', ['#8FA8CF']), T('crema', 'Crema', ['#E6D8C1']), T('vino', 'Vino', ['#7A3144']),
    ],
    // Alfombra de pelo con dibujo tejido: hileras de bucles (trazos
    // cortos opacos, un tono más claro y uno más oscuro, desfasados) y un
    // rombo grande muy suave, como una moqueta de verdad. Sin puntos sueltos.
    draw: (w, h, c) => {
      const b = brush();
      const lo = tone(c[0], -0.24), hi = tone(c[0], 0.2), soft = tone(c[0], 0.1);
      for (let x = -40, k = 0; x < w + 40; x += 80, k++) b.fill(`M${x} 0L${x + 40} ${h / 2}L${x} ${h}L${x - 40} ${h / 2}Z`, soft);
      for (let y = 1, r = 0; y < h; y += 7, r++) {
        for (let x = (r % 2) * 7; x < w; x += 14) {
          b.fill(rect(x, y, 6, 2.4), hi, 1, 1);
          b.fill(rect(x + 1, y + 2.4, 6, 2.2), lo, 1, 1);
        }
      }
      return b.out();
    },
  },
  {
    id: 'losas', name: 'Losas de piedra', price: 120, tags: ['gotico', 'metalero', 'rustico'],
    tints: [
      T('gris', 'Gris', ['#4F4B55', '#8E8992', '#7F7A85', '#9C97A0']), T('arena', 'Arena', ['#8D7B62', '#C9B38F', '#BBA582', '#D5C2A0']),
      T('oscura', 'Oscura', ['#211F25', '#46424B', '#3C3842', '#514C57']),
    ],
    // Losas de cantera de largos distintos, esquinas gastadas, canto de
    // luz arriba y la panza en sombra.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, 0, w, h), c[0]);
      const rows = Math.max(3, Math.round(h / 26));
      const rh = h / rows;
      for (let i = 0; i < rows; i++) {
        let x = -hash(i, 0, 27) * 50, j = 0;
        const y = i * rh;
        while (x < w) {
          const bw = 52 + Math.round(hash(i, j, 28) * 3) * 16;
          const r = hash(i, j, 29);
          const col = r < 0.5 ? c[1] : r < 0.78 ? c[2] : c[3];
          b.fill(rr(x + 2, y + 2, bw - 4, rh - 4, 5), col, 1, 1);
          b.fill(rr(x + 4, y + rh - 8, bw - 8, 4.5, 2.2), tone(col, -0.5), 0.8, 2);
          b.fill(rr(x + 7, y + 3.2, bw - 18, 2.6, 1.2), tone(col, 0.75), 0.8, 2);
          x += bw; j++;
        }
      }
      return b.out();
    },
  },
  {
    id: 'marmol', name: 'Mármol', price: 170, tags: ['elegante', 'princesa'],
    tints: [T('blanco', 'Blanco', ['#F2EFEC', '#C9C2C9']), T('negro', 'Negro', ['#2C2A30', '#5E5966']), T('rosa', 'Rosa', ['#F6E3E3', '#D9AEB4']), T('verde', 'Verde', ['#3D5A4E', '#7FA393'])],
    // Placas pulidas: vetas largas y suaves que cruzan en diagonal (de
    // una placa a la otra), alguna más marcada, y el reflejo del cuarto.
    draw: (w, h, c) => {
      const tw = 96, th = tw * DEPTH;
      const b = tiles(w, h, tw, tone(c[0], -0.5), () => c[0], { g: 1.6, r: 0.4, lit: 0.4, dim: 0.25, groutTop: true });
      const v1 = mix(c[0], c[1], 0.6), v2 = mix(c[0], c[1], 0.35);
      for (let x = -60, i = 0; x < w + 60; x += 150, i++) {
        const a = hash(i, 0, 35) * 20;
        b.stroke(`M${x} -2C${f1(x + 30 + a)} ${f1(h * 0.3)} ${f1(x + 10)} ${f1(h * 0.55)} ${f1(x + 50 + a)} ${f1(h * 0.8)}S${f1(x + 70)} ${h + 4} ${f1(x + 90)} ${h + 6}`, v1, 2.2, 0.55, 2);
        b.stroke(`M${f1(x + 60 + a)} -2C${f1(x + 80)} ${f1(h * 0.25)} ${f1(x + 64)} ${f1(h * 0.5)} ${f1(x + 96 + a)} ${f1(h * 0.7)}`, v2, 1.8, 0.45, 2);
      }
      for (let x = 0, i = 0; x < w; x += tw, i++) {
        for (let y = 0, j = 0; y < h; y += th, j++) {
          if (hash(i, j, 5) < 0.55) b.gloss(`M${x + 12} ${y + th - 10}l16 -10h10l-16 10Z`, 0.35, 7);
        }
      }
      return b.out();
    },
  },
  {
    id: 'rejilla', name: 'Piso de rejilla neón', price: 170, tags: ['y2k'],
    tints: [T('fucsia', 'Fucsia', ['#1E1530', '#FF4FD8', '#4BE3F0']), T('cian', 'Cian', ['#121A2E', '#4BE3F0', '#B57CFF'])],
    // Piso de los 80: líneas que se van hacia el fondo (verticales) y
    // paralelas a la pared, con su halo; más brillo adelante.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, Math.round(h * 0.5), w, h), mix(c[0], c[1], 0.07));
      for (let y = 11; y < h; y += 22) {
        b.fill(rect(0, y - 2.5, w, 6), mix(c[0], c[2], 0.28), 1, 1);
        b.stroke(`M0 ${y + 0.3}H${w}`, c[2], 2.6, 1, 2);
      }
      for (let x = 22; x < w; x += 44) {
        b.fill(rect(x - 3, 0, 7, h), mix(c[0], c[1], 0.3), 1, 3);
        b.stroke(`M${x + 0.3} 0V${h}`, c[1], 3, 1, 4);
      }
      return b.out();
    },
  },
];

export const FLOOR_ALIASES = {
  madera: 'tablas.miel', nogal: 'tablas.nogal', ajedrez: 'ajedrez.clasico', terracota: 'baldosa.terracota',
  alfombrado: 'alfombra.salvia', piedra: 'losas.gris',
};

export function parseFloor(value) {
  const v = FLOOR_ALIASES[value] || value || 'tablas.miel';
  const [pid, tid] = v.split('.');
  const pattern = FLOORS.find((p) => p.id === pid) || FLOORS[0];
  const tint = pattern.tints.find((t) => t.id === tid) || pattern.tints[0];
  return { pattern, tint, value: `${pattern.id}.${tint.id}` };
}

/** El piso entero (svg) de w × h, con la sombra del zócalo y luz. */
export function floorSvg(value, w, h, { room = true } = {}) {
  const { pattern, tint } = parseFloor(value);
  const c = tint.c;
  const dark = isDark(c[0]);
  let s = flat(rect(0, 0, w, h), c[0]);
  s += `<clipPath id="fc"><path d="M0 0h${w}v${h}h${-w}Z"/></clipPath>` + G({ 'clip-path': 'url(#fc)' }, pattern.draw(w, h, c));
  if (room) {
    // Contra la pared el piso recibe menos luz (y el zócalo le hace
    // sombra); adelante, más. Degradado en los estilos vectoriales,
    // bandas limpias en pixel.
    s += E('defs', {}, E('linearGradient', { id: 'fl', x1: 0, y1: 0, x2: 0, y2: 1 },
      `<stop offset="0" stop-color="#1E141C" stop-opacity="0.36"/><stop offset="0.07" stop-color="#1E141C" stop-opacity="0.2"/><stop offset="0.3" stop-color="#1E141C" stop-opacity="0.04"/><stop offset="0.5" stop-color="#1E141C" stop-opacity="0"/>`)
      + E('linearGradient', { id: 'fw', x1: 0, y1: 0, x2: 0, y2: 1 },
        `<stop offset="0.6" stop-color="#FFF6E8" stop-opacity="0"/><stop offset="1" stop-color="#FFF6E8" stop-opacity="${dark ? 0.05 : 0.12}"/>`));
    s += E('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#fl)', 'data-r': 'raw', 'data-skip': 'pixel' });
    s += E('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#fw)', 'data-r': 'raw', 'data-skip': 'pixel neon' });
    s += onlyPx(
      shade(rect(0, 0, w, 4), '#1E141C', 0.34)
      + shade(rect(0, 4, w, 8), '#1E141C', 0.17)
      + shade(rect(0, 12, w, 16), '#1E141C', 0.06)
      + shade(rect(0, h - 30, w, 30), '#FFF6E8', dark ? 0.04 : 0.08),
    );
  }
  return svgDoc(w, h, s);
}

export const floorSwatchSvg = (value, size = 120) => floorSvg(value, size, size, { room: false });
