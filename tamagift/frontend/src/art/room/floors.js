// Pisos del cuarto, en la misma perspectiva que todo lo demás (vista
// 3/4 sin punto de fuga, ver draw.js): lo que va hacia el fondo es
// vertical, lo paralelo a la pared es horizontal, y una baldosa cuadrada
// se ve el doble de ancha que de alta (DEPTH = 0.5). Sin líneas que
// converjan: en pixel art quedaban dientes de sierra y no se leía nada.

import { G, Cir, Ell, flat, line, shade, rr, tone, mix, isDark, svgDoc, DEPTH } from './draw.js';
import { rng } from '../color.js';

const T = (id, name, c) => ({ id, name, c });

// Una fila de tablas: largos variados, uniones escalonadas, vetas.
function planks(w, h, c, seed) {
  const r = rng(seed);
  const rows = Math.max(3, Math.round(h / 18));
  const rh = h / rows;
  let s = '';
  for (let i = 0; i < rows; i++) {
    const y = i * rh;
    let x = -r() * 120;
    while (x < w) {
      const len = 110 + r() * 90;
      const col = tone(c[0], (r() - 0.5) * 0.36);
      s += flat(`M${x} ${y}h${len}v${rh}h${-len}Z`, col);
      s += flat(`M${x + 1} ${y + 1.5}h${len - 2}v2h${-(len - 2)}Z`, tone(col, 0.7), { opacity: 0.4 });
      if (r() < 0.5) s += line(`M${x + 14 + r() * 30} ${y + rh * (0.4 + r() * 0.3)}h${30 + r() * 50}`, tone(c[0], -0.6), 1.2, { opacity: 0.4 });
      s += line(`M${x} ${y + 1}V${y + rh - 1}`, tone(c[0], -1.4), 1.8, { opacity: 0.8 });
      x += len;
    }
    if (i) s += line(`M0 ${y}H${w}`, tone(c[0], -1.4), 1.8, { opacity: 0.85 });
  }
  return s;
}

// Baldosas rectangulares (ancho a, alto a·DEPTH) con junta.
function tiles(w, h, size, grout, pick, o = {}) {
  const tw = size, th = size * DEPTH;
  const g = o.g ?? 3;
  let s = flat(`M0 0h${w}v${h}h${-w}Z`, grout);
  for (let row = 0, y = 0; y < h; row++, y += th) {
    for (let col = 0, x = (o.offset && row % 2 ? -tw / 2 : 0); x < w; col++, x += tw) {
      const fill = pick(row, col);
      s += flat(rr(x + g / 2, y + g / 2, tw - g, th - g, o.r ?? 1.5), fill);
      s += flat(`M${x + g / 2 + 2} ${y + g / 2 + 1}h${tw - g - 4}v2h${-(tw - g - 4)}Z`, tone(fill, 0.9), { opacity: 0.6 });
      if (o.motif) s += o.motif(x + tw / 2, y + th / 2, tw, th, row, col);
    }
  }
  return s;
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
      const r = rng(9);
      const cw = 40, step = 16, k = cw * DEPTH;
      let s = '';
      for (let col = 0, x = 0; x < w; col++, x += cw) {
        const up = col % 2 === 0;
        for (let y = -k - step; y < h + step; y += step) {
          const fill = tone(c[0], (r() - 0.5) * 0.4);
          const yl = up ? y + k : y, yr = up ? y : y + k;
          s += flat(`M${x} ${yl}L${x + cw} ${yr}L${x + cw} ${yr + step}L${x} ${yl + step}Z`, fill);
          s += line(`M${x} ${yl}L${x + cw} ${yr}`, tone(c[0], -1.3), 1.5, { opacity: 0.75 });
        }
        s += line(`M${x} 0V${h}`, tone(c[0], -1.5), 1.6, { opacity: 0.8 });
      }
      return s;
    },
  },
  {
    id: 'ajedrez', name: 'Baldosa ajedrez', price: 120, tags: ['y2k', 'punk', 'elegante', 'gotico'],
    tints: [
      T('clasico', 'Blanco y negro', ['#F1ECE4', '#3B3742']), T('rosa', 'Rosa', ['#FBE7EC', '#E69AB0']), T('menta', 'Menta', ['#E7F5ED', '#84C4A2']),
      T('rojo', 'Rojo', ['#F4EADD', '#B4473F']), T('azul', 'Azul', ['#EEF2F8', '#5E7DB6']), T('lila', 'Lila', ['#F1ECFA', '#9A82D2']),
    ],
    draw: (w, h, c) => tiles(w, h, 44, tone(c[1], -0.5), (row, col) => ((row + col) % 2 ? c[1] : c[0]), { g: 1.5, r: 0.5 }),
  },
  {
    id: 'baldosa', name: 'Baldosas', price: 100, tags: ['rustico', 'hippie'],
    tints: [
      T('terracota', 'Terracota', ['#C8714E', '#E2CDB8']), T('arena', 'Arena', ['#D9C2A0', '#F0E6D6']),
      T('gris', 'Gris piedra', ['#9F9AA2', '#D6D2D8']), T('verde', 'Verde', ['#7FAE95', '#E2EEE6']), T('blanca', 'Blanca', ['#ECE8E3', '#C9C3BE']),
    ],
    draw: (w, h, c) => {
      const r = rng(13);
      return tiles(w, h, 46, c[1], () => tone(c[0], (r() - 0.5) * 0.45), { g: 3.5 });
    },
  },
  {
    id: 'hidraulico', name: 'Mosaico hidráulico', price: 160, tags: ['elegante', 'hippie', 'aesthetic'],
    tints: [
      T('azul', 'Azul', ['#F1ECE2', '#4F78A8', '#E2B65A']), T('verde', 'Verde', ['#F1ECE2', '#4F8E72', '#D97A5A']),
      T('rosa', 'Rosa', ['#FBEFF1', '#D97A93', '#7AAE9A']), T('negro', 'Negro', ['#EDE8E0', '#2E2A33', '#B8433F']),
    ],
    draw: (w, h, c) => tiles(w, h, 64, tone(c[0], -0.6), () => c[0], {
      g: 1.5, r: 0.5,
      motif: (x, y, tw, th) => {
        const rx = tw * 0.34, ry = th * 0.34;
        return flat(`M${x} ${y - ry}L${x + rx} ${y}L${x} ${y + ry}L${x - rx} ${y}Z`, c[1])
          + Ell(x, y, rx * 0.35, ry * 0.35, { fill: c[2], 'data-r': 'flat' })
          + flat(`M${x - tw / 2 + 1} ${y - th / 2 + 1}l${tw * 0.16} 0l${-tw * 0.16} ${th * 0.16}Z`, c[1])
          + flat(`M${x + tw / 2 - 1} ${y + th / 2 - 1}l${-tw * 0.16} 0l${tw * 0.16} ${-th * 0.16}Z`, c[1]);
      },
    }),
  },
  {
    id: 'alfombra', name: 'Alfombra de muro a muro', price: 110, tags: ['dulce', 'aesthetic', 'hippie'],
    tints: [
      T('salvia', 'Salvia', ['#9DB08A']), T('rosa', 'Rosa', ['#E8B7C4']), T('lila', 'Lila', ['#B9A7DA']), T('gris', 'Gris', ['#A7A3AD']),
      T('azul', 'Azul', ['#8FA8CF']), T('crema', 'Crema', ['#E6D8C1']), T('vino', 'Vino', ['#7A3144']),
    ],
    draw: (w, h, c) => {
      const r = rng(21);
      let s = '';
      for (let y = 4; y < h; y += 7) {
        for (let x = (Math.floor(y / 7) % 2 ? 4 : 0); x < w; x += 8) {
          if (r() < 0.4) s += Cir(+(x + r() * 3).toFixed(1), +(y + r() * 2).toFixed(1), 2, { fill: r() < 0.5 ? tone(c[0], 0.5) : tone(c[0], -0.5), 'data-r': 'flat', opacity: 0.6 });
        }
      }
      return s;
    },
  },
  {
    id: 'losas', name: 'Losas de piedra', price: 120, tags: ['gotico', 'metalero', 'rustico'],
    tints: [
      T('gris', 'Gris', ['#4F4B55', '#8E8992', '#7F7A85', '#9C97A0']), T('arena', 'Arena', ['#8D7B62', '#C9B38F', '#BBA582', '#D5C2A0']),
      T('oscura', 'Oscura', ['#211F25', '#46424B', '#3C3842', '#514C57']),
    ],
    draw: (w, h, c) => {
      const r = rng(27);
      let s = flat(`M0 0h${w}v${h}h${-w}Z`, c[0]);
      const rows = Math.max(3, Math.round(h / 24));
      const rh = h / rows;
      for (let i = 0; i < rows; i++) {
        let x = -r() * 40;
        while (x < w) {
          const bw = 40 + r() * 50;
          const col = c[1 + Math.floor(r() * 3)];
          s += flat(rr(x + 2, i * rh + 2, bw - 4, rh - 4, 5), col);
          s += flat(`M${x + 6} ${i * rh + 3}h${bw - 14}v2h${-(bw - 14)}Z`, tone(col, 0.8), { opacity: 0.6 });
          x += bw;
        }
      }
      return s;
    },
  },
  {
    id: 'marmol', name: 'Mármol', price: 170, tags: ['elegante', 'princesa'],
    tints: [T('blanco', 'Blanco', ['#F2EFEC', '#C9C2C9']), T('negro', 'Negro', ['#2C2A30', '#5E5966']), T('rosa', 'Rosa', ['#F6E3E3', '#D9AEB4']), T('verde', 'Verde', ['#3D5A4E', '#7FA393'])],
    draw: (w, h, c) => {
      const r = rng(35);
      const tw = 96;
      let s = tiles(w, h, tw, tone(c[0], -0.7), () => c[0], { g: 1.6, r: 0.5 });
      for (let x = 0; x < w; x += tw) {
        for (let y = 0; y < h; y += tw * DEPTH) {
          if (r() < 0.6) {
            const x0 = x + 6 + r() * 30, y0 = y + 4 + r() * 8;
            s += line(`M${x0} ${y0}l${12 + r() * 8} ${5 + r() * 4}l${8 + r() * 6} ${-2 - r() * 3}l${14 + r() * 8} ${6 + r() * 5}`, c[1], 1.4, { opacity: 0.7 });
          }
        }
      }
      return s;
    },
  },
  {
    id: 'rejilla', name: 'Piso de rejilla neón', price: 170, tags: ['y2k'],
    tints: [T('fucsia', 'Fucsia', ['#1E1530', '#FF4FD8', '#4BE3F0']), T('cian', 'Cian', ['#121A2E', '#4BE3F0', '#B57CFF'])],
    draw: (w, h, c) => {
      let s = '';
      for (let x = 22; x < w; x += 44) s += line(`M${x} 0V${h}`, c[1], 2, { opacity: 0.8 });
      for (let y = 11; y < h; y += 22) s += line(`M0 ${y}H${w}`, c[2], 1.6, { opacity: 0.6 });
      return s;
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
  let s = flat(`M0 0h${w}v${h}h${-w}Z`, c[0]);
  s += `<clipPath id="fc"><path d="M0 0h${w}v${h}h${-w}Z"/></clipPath>` + G({ 'clip-path': 'url(#fc)' }, pattern.draw(w, h, c));
  if (room) {
    // contra la pared el piso recibe menos luz; adelante, más
    s += shade(`M0 0h${w}v7h${-w}Z`, '#1E141C', 0.32);
    s += shade(`M0 7h${w}v12h${-w}Z`, '#1E141C', 0.14);
    s += shade(`M0 19h${w}v14h${-w}Z`, '#1E141C', 0.06);
    s += shade(`M0 ${h - 34}h${w}v34h${-w}Z`, '#FFFFFF', dark ? 0.04 : 0.08);
  }
  return svgDoc(w, h, s);
}

export const floorSwatchSvg = (value, size = 120) => floorSvg(value, size, size, { room: false });
