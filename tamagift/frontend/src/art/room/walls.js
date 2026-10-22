// Paredes del cuarto. Cada diseño tiene varios colores para elegir; la
// pared se ve de frente (sin perspectiva), con luz que entra por arriba,
// zócalo abajo y motivos de un tamaño que se lee también en pixel art
// (nada más chico que ~8 unidades del mundo).

import { E, G, R, Ell, Cir, P, flat, line, shade, face, rr, tone, mix, isDark, svgDoc } from './draw.js';
import { rng } from '../color.js';

const T = (id, name, c, bb) => ({ id, name, c, bb });
// Motivo que en pixel art se reemplaza por uno hecho a mano.
const motif = (name, c1, inner, c2) => G({ 'data-px': `motif.${name}`, 'data-c1': c1, 'data-c2': c2 || c1 }, inner);

// Motivos sueltos ------------------------------------------------------
const heart = (x, y, s) => `M${x} ${y + s * 0.9}C${x - s * 1.15} ${y + s * 0.05} ${x - s * 1.05} ${y - s} ${x} ${y - s * 0.35}C${x + s * 1.05} ${y - s} ${x + s * 1.15} ${y + s * 0.05} ${x} ${y + s * 0.9}Z`;
const star = (x, y, r, k = 0.45, n = 5) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr2 = i % 2 ? r * k : r;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr2).toFixed(1)} ${(y + Math.sin(a) * rr2).toFixed(1)}`;
  }
  return `${d}Z`;
};
const flower = (x, y, r, petal, mid) => {
  let s = '';
  for (let k = 0; k < 5; k++) {
    const a = (k * 72 - 90) * Math.PI / 180;
    s += Cir(+(x + Math.cos(a) * r * 0.62).toFixed(1), +(y + Math.sin(a) * r * 0.62).toFixed(1), +(r * 0.5).toFixed(1), { fill: petal, 'data-r': 'flat' });
  }
  return s + Cir(x, y, +(r * 0.36).toFixed(1), { fill: mid, 'data-r': 'flat' });
};

// Cada patrón dibuja sobre (0,0)-(w,h) — la parte de pared sin zócalo.
export const WALLS = [
  {
    id: 'liso', name: 'Pintura lisa', price: 0, tags: ['dulce'],
    tints: [
      T('crema', 'Crema', ['#F6E7D3']), T('rosa', 'Rosa', ['#F7D9E1']), T('menta', 'Menta', ['#D5EDE0']),
      T('lavanda', 'Lavanda', ['#E2DAF5']), T('celeste', 'Celeste', ['#D3E6F5']), T('durazno', 'Durazno', ['#F9DDC6']),
      T('limon', 'Limón', ['#F7EDBC']), T('salvia', 'Salvia', ['#CBD9C0']), T('gris', 'Gris perla', ['#DCD8DF']),
      T('carbon', 'Carbón', ['#3E3A45']), T('noche', 'Azul noche', ['#273153']), T('vino', 'Vino', ['#5A2733']),
    ],
    draw: () => '',
  },
  {
    id: 'rayas', name: 'Papel de rayas', price: 90, tags: ['dulce', 'elegante'],
    tints: [
      T('rosa', 'Rosa', ['#FBE6EB', '#F3CCD7', '#FFFFFF']), T('menta', 'Menta', ['#E6F4EC', '#C6E6D4', '#FFFFFF']),
      T('miel', 'Miel', ['#FBEFE0', '#EBD0AE', '#FFFFFF']), T('celeste', 'Celeste', ['#E6F0FA', '#C8DDF1', '#FFFFFF']),
      T('lila', 'Lila', ['#EFE9FA', '#D7CCF1', '#FFFFFF']), T('carbon', 'Carbón', ['#433F4A', '#37333D', '#5A5562']),
    ],
    draw: (w, h, c) => {
      let s = '';
      for (let x = 0; x < w; x += 60) {
        s += flat(`M${x + 30} 0h30v${h}h-30Z`, c[1]);
        s += line(`M${x + 15} 0V${h}`, c[2], 2.4, { opacity: 0.8 });
      }
      return s;
    },
  },
  {
    id: 'lunares', name: 'Papel de lunares', price: 90, tags: ['dulce', 'y2k'],
    tints: [
      T('rosa', 'Rosa', ['#FCE4EB', '#EE9BB2']), T('crema', 'Crema', ['#F8EBD8', '#D9A877']), T('menta', 'Menta', ['#DDF1E6', '#FFFFFF']),
      T('lavanda', 'Lavanda', ['#E6DEF7', '#FFFFFF']), T('noche', 'Noche', ['#2C3458', '#F2D98B']),
    ],
    draw: (w, h, c) => {
      let s = '';
      for (let r = 0, y = 26; y < h; r++, y += 46) for (let x = (r % 2 ? 27 : 0) + 12; x < w; x += 54) s += motif('dot', c[1], Cir(x, y, 8, { fill: c[1], 'data-r': 'flat' }));
      return s;
    },
  },
  {
    id: 'flores', name: 'Papel floreado', price: 120, tags: ['dulce', 'hippie', 'rustico'],
    tints: [
      T('crema', 'Crema', ['#F8EEDD', '#F2A7B5', '#FFD97A', '#9CC79A']), T('celeste', 'Celeste', ['#DCEBF6', '#FFFFFF', '#F7CF6B', '#8DBF9E']),
      T('salvia', 'Salvia', ['#D5E2CC', '#FFF6E5', '#F2B36B', '#6E9C6E']), T('rosa', 'Rosa', ['#F8DCE3', '#FFFFFF', '#F7C96B', '#93C49B']),
      T('noche', 'Noche', ['#2E2E4A', '#F2A7C4', '#F7D98B', '#6F9C8A']),
    ],
    draw: (w, h, c) => {
      let s = '';
      for (let r = 0, y = 34; y < h; r++, y += 64) {
        for (let x = (r % 2 ? 40 : 0) + 16; x < w; x += 80) {
          s += flat(`M${x - 4} ${y + 9}q-13 1 -18 12q12 2 18 -12Z`, c[3]) + flat(`M${x + 4} ${y + 9}q13 1 18 12q-12 2 -18 -12Z`, c[3]);
          s += motif('flower', c[1], flower(x, y, 13, c[1], c[2]), c[2]);
        }
      }
      return s;
    },
  },
  {
    id: 'vichy', name: 'Papel vichy', price: 110, tags: ['dulce', 'rustico'],
    tints: [
      T('rojo', 'Rojo', ['#FBF2EE', '#D9545A']), T('rosa', 'Rosa', ['#FDF1F4', '#EE8FAA']), T('azul', 'Azul', ['#F2F6FB', '#6F96CF']),
      T('verde', 'Verde', ['#F1F7F0', '#6FAE78']), T('mostaza', 'Mostaza', ['#FBF5E6', '#D9A93E']),
    ],
    draw: (w, h, c) => {
      let s = '';
      for (let x = 0; x < w; x += 36) s += shade(`M${x} 0h18v${h}h-18Z`, c[1], 0.34);
      for (let y = 0; y < h; y += 36) s += shade(`M0 ${y}h${w}v18h${-w}Z`, c[1], 0.34);
      return s;
    },
  },
  {
    id: 'corazones', name: 'Papel de corazones', price: 110, tags: ['dulce', 'princesa', 'y2k'],
    tints: [
      T('rosa', 'Rosa', ['#FCE7EE', '#F08FAD']), T('lila', 'Lila', ['#EEE6FA', '#B79BE6']), T('crema', 'Crema', ['#FAEFE3', '#E98A84']),
      T('vino', 'Vino', ['#4E2231', '#C9506E']),
    ],
    draw: (w, h, c) => {
      let s = '';
      for (let r = 0, y = 32; y < h; r++, y += 56) for (let x = (r % 2 ? 34 : 0) + 16; x < w; x += 68) s += motif('heart', c[1], flat(heart(x, y, 12), c[1]));
      return s;
    },
  },
  {
    id: 'estrellas', name: 'Cielo estrellado', price: 140, tags: ['aesthetic', 'gotico', 'y2k'],
    tints: [
      T('noche', 'Noche', ['#222B4A', '#F7E39A', '#8FA0D6']), T('morado', 'Morado', ['#2E2148', '#F4D2FF', '#9D7BD6']),
      T('negro', 'Negro', ['#18161D', '#E9E4F2', '#6E6880']), T('celeste', 'Día', ['#CFE6F7', '#FFFFFF', '#FFF2B0']),
    ],
    draw: (w, h, c) => {
      const r = rng(7);
      let s = '';
      for (let i = 0; i < w / 9; i++) {
        const x = r() * w, y = r() * (h - 10);
        const big = r() < 0.18;
        s += big ? motif('star', c[1], flat(star(x, y, 10, 0.42), c[1])) : Cir(+x.toFixed(1), +y.toFixed(1), r() < 0.5 ? 1.6 : 2.4, { fill: r() < 0.7 ? c[1] : c[2], 'data-r': 'flat' });
      }
      return s;
    },
  },
  {
    id: 'zocalo', name: 'Media pared de madera', price: 150, tags: ['elegante', 'rustico'],
    tints: [
      T('crema', 'Crema y miel', ['#F6E9D6', '#C99566']), T('salvia', 'Salvia y nogal', ['#D2DDC6', '#8A5D3F']),
      T('celeste', 'Celeste y blanco', ['#D8E8F4', '#F4F1EA']), T('rosa', 'Rosa y blanco', ['#F7DCE3', '#F6F1EC']),
      T('bosque', 'Bosque y nogal', ['#3F5A47', '#7A5236']), T('vino', 'Vino y negro', ['#5B2834', '#2E2830']),
    ],
    draw: (w, h, c) => {
      const top = Math.round(h * 0.56);
      const wd = c[1];
      let s = flat(`M0 ${top}h${w}v${h - top}h${-w}Z`, wd);
      for (let x = 0; x < w; x += 80) {
        s += face(rr(x + 8, top + 20, 64, h - top - 30, 2), tone(wd, -0.25), { w: 1.6 });
        s += line(`M${x + 11} ${top + 23}H${x + 69}`, tone(wd, 0.9), 1.6, { opacity: 0.8 });
      }
      s += face(rr(0, top - 4, w, 12, 0), tone(wd, 0.45), { w: 1.8 });
      s += line(`M0 ${top - 2}H${w}`, '#FFFFFF', 1.6, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'ladrillo', name: 'Ladrillo', price: 140, tags: ['rockero', 'punk', 'rustico'],
    tints: [
      T('rojo', 'Rojo', ['#E1D2C2', '#B8644A', '#A6553E', '#C7745A']), T('blanco', 'Pintado de blanco', ['#D9D2CA', '#F1ECE6', '#E7E1DA', '#F7F3EE']),
      T('gris', 'Gris', ['#BDB7BE', '#8D8792', '#7E7884', '#9B96A0']), T('crema', 'Crema', ['#E6DAC6', '#D9BE96', '#CBAF86', '#E4CCA8']),
      T('negro', 'Negro', ['#2B282F', '#45414B', '#3B3841', '#504B57']),
    ],
    draw: (w, h, c) => {
      const r = rng(19);
      let s = flat(`M0 0h${w}v${h}h${-w}Z`, c[0]);
      const bw = 46, bh = 20, g = 4;
      for (let row = 0, y = 2; y < h; row++, y += bh + g) {
        for (let x = (row % 2 ? -bw / 2 : 0); x < w; x += bw + g) {
          const col = c[1 + Math.floor(r() * 3)];
          s += flat(rr(x, y, bw, bh, 1.5), col);
          s += flat(`M${x + 2} ${y + 1}h${bw - 4}v3h${-(bw - 4)}Z`, tone(col, 0.6), { opacity: 0.45 });
        }
      }
      return s;
    },
    noBase: true,
  },
  {
    id: 'tablas', name: 'Paneles de madera', price: 130, tags: ['rustico', 'hippie'],
    tints: [
      T('miel', 'Miel', ['#C99A69']), T('nogal', 'Nogal', ['#8A5E40']), T('blanco', 'Blanco', ['#EEE8E0']),
      T('gris', 'Gris', ['#A8A1A3']), T('menta', 'Pintado menta', ['#BFE0CF']),
    ],
    draw: (w, h, c) => {
      const r = rng(31);
      let s = '';
      for (let x = 0, i = 0; x < w; x += 34, i++) {
        const col = tone(c[0], (r() - 0.5) * 0.5);
        s += flat(`M${x} 0h34v${h}h-34Z`, col);
        s += line(`M${x} 0V${h}`, tone(c[0], -1.4), 2.2, { opacity: 0.85 });
        s += line(`M${x + 2.5} 0V${h}`, tone(c[0], 0.9), 1.4, { opacity: 0.6 });
        if (r() < 0.35) { const ky = 30 + r() * (h - 80); s += Ell(x + 17, ky, 4, 6, { fill: tone(c[0], -0.9), 'data-r': 'flat', opacity: 0.8 }); }
        if (r() < 0.5) s += line(`M${x + 10 + r() * 14} ${20 + r() * 40}v${40 + r() * 80}`, tone(c[0], -0.5), 1.2, { opacity: 0.55 });
      }
      return s;
    },
    noBase: true,
  },
  {
    id: 'azulejos', name: 'Azulejos', price: 120, tags: ['aesthetic', 'elegante'],
    tints: [
      T('blanco', 'Blanco', ['#D9D4D0', '#F6F4F1']), T('menta', 'Menta', ['#B9D9C8', '#D9F0E3']), T('rosa', 'Rosa', ['#E9C3CD', '#FBE3E9']),
      T('azul', 'Azul', ['#9FB5D6', '#CCDCF1']), T('negro', 'Negro', ['#1F1D22', '#3A3640']),
    ],
    draw: (w, h, c) => {
      let s = flat(`M0 0h${w}v${h}h${-w}Z`, c[0]);
      const tw = 40, th = 20, g = 3;
      for (let row = 0, y = 1; y < h; row++, y += th + g) {
        for (let x = (row % 2 ? -tw / 2 : 0); x < w; x += tw + g) {
          s += flat(rr(x, y, tw, th, 2.5), c[1]);
          s += flat(`M${x + 3} ${y + 2}h${tw - 10}v2.5h${-(tw - 10)}Z`, '#FFFFFF', { opacity: 0.55 });
        }
      }
      return s;
    },
    noBase: true,
  },
  {
    id: 'piedra', name: 'Muro de piedra', price: 150, tags: ['gotico', 'metalero', 'rustico'],
    tints: [
      T('gris', 'Gris', ['#6E6A72', '#9A949D', '#8B8590', '#A8A3AB']), T('arena', 'Arena', ['#9C8A70', '#CDB894', '#C1AB86', '#D8C5A3']),
      T('musgo', 'Musgo', ['#5D665A', '#8E9887', '#7F8A79', '#9DA594']), T('oscura', 'Oscura', ['#2A272E', '#4C4752', '#423E48', '#56515D']),
    ],
    draw: (w, h, c) => {
      const r = rng(43);
      let s = flat(`M0 0h${w}v${h}h${-w}Z`, c[0]);
      for (let y = 2, row = 0; y < h; row++) {
        const bh = 30 + Math.round(r() * 10);
        let x = row % 2 ? -26 : -6;
        while (x < w) {
          const bw = 52 + Math.round(r() * 40);
          const col = c[1 + Math.floor(r() * 3)];
          s += flat(rr(x + 2, y + 2, bw - 4, bh - 4, 7), col);
          s += flat(`M${x + 8} ${y + 4}h${bw - 22}v3h${-(bw - 22)}Z`, tone(col, 0.8), { opacity: 0.7 });
          s += shade(`M${x + 4} ${y + bh - 9}h${bw - 8}v5h${-(bw - 8)}Z`, tone(col, -1.4), 0.5);
          x += bw;
        }
        y += bh;
      }
      return s;
    },
    noBase: true,
  },
  {
    id: 'ondas', name: 'Ondas setenteras', price: 130, tags: ['hippie', 'aesthetic'],
    tints: [
      T('setentero', 'Setentero', ['#F4E3C3', '#E9A13B', '#D2602F', '#7A4A2A']), T('pastel', 'Pastel', ['#FBF0F4', '#F5B8C9', '#C5B3EC', '#9ED7C2']),
      T('mar', 'Mar', ['#EAF4F2', '#7FC4C8', '#3E8E9A', '#F1C27A']),
    ],
    draw: (w, h, c) => {
      // franjas onduladas de tres colores que se repiten, como un papel de
      // los 70 (no un paisaje)
      const band = (y, k, a) => {
        let top = `M-40 ${y}`, bot = '';
        for (let x = -40; x <= w + 40; x += 60) top += `Q${x + 30} ${y + (Math.floor((x + 40) / 60) % 2 ? a : -a)} ${x + 60} ${y}`;
        for (let x = w + 80; x >= -40; x -= 60) bot += `Q${x - 30} ${y + k + (Math.floor((x + 40) / 60) % 2 ? -a : a)} ${x - 60} ${y + k}`;
        return `${top}L${w + 80} ${y + k}${bot}Z`;
      };
      let s = '';
      for (let y = 18; y < h; y += 78) s += flat(band(y, 14, 9), c[1]) + flat(band(y + 18, 14, 9), c[2]) + flat(band(y + 36, 10, 9), c[3]);
      return s;
    },
  },
  {
    id: 'nubes', name: 'Mural de nubes', price: 160, tags: ['dulce', 'angelical', 'aesthetic'],
    tints: [
      T('dia', 'Día', ['#BFDDF5', '#FFFFFF', '#E1EEF9']), T('atardecer', 'Atardecer', ['#F8CFC2', '#FFF4EC', '#F9DFD3']),
      T('noche', 'Noche', ['#2B3460', '#9A8FCB', '#4D4A84']), T('rosa', 'Algodón', ['#F6D3E2', '#FFFFFF', '#FBE6EF']),
    ],
    draw: (w, h, c) => {
      const r = rng(5);
      let s = '';
      const cloud = (x, y, k, col) => {
        const d = `M${x - 34 * k} ${y}C${x - 36 * k} ${y - 14 * k} ${x - 20 * k} ${y - 20 * k} ${x - 10 * k} ${y - 14 * k}C${x - 6 * k} ${y - 30 * k} ${x + 18 * k} ${y - 30 * k} ${x + 20 * k} ${y - 14 * k}C${x + 32 * k} ${y - 20 * k} ${x + 42 * k} ${y - 8 * k} ${x + 36 * k} ${y}Z`;
        return flat(d, col) + flat(`M${x - 30 * k} ${y}H${x + 34 * k}v${-5 * k}H${x - 30 * k}Z`, c[2], { opacity: 0.9 });
      };
      for (let x = 40; x < w; x += 150) s += cloud(x + r() * 40, 50 + r() * (h - 130), 0.8 + r() * 0.6, c[1]);
      for (let x = 110; x < w; x += 190) s += cloud(x + r() * 40, 40 + r() * (h - 110), 0.5 + r() * 0.3, c[2]);
      return s;
    },
  },
  {
    id: 'hojas', name: 'Papel botánico', price: 150, tags: ['hippie', 'aesthetic', 'rustico'],
    tints: [
      T('crema', 'Crema', ['#F5EEDF', '#7FAE84', '#5E8C66']), T('verde', 'Verde', ['#2F4B3C', '#6F9E78', '#88B98F']),
      T('rosa', 'Rosa', ['#F8E1E3', '#8DBB93', '#E59AA8']), T('azul', 'Azul', ['#DCE7EF', '#5F8F9A', '#7FAFB0']),
    ],
    draw: (w, h, c) => {
      let s = '';
      const frond = (x, y, a, col, k) => {
        const rad = (deg) => (deg * Math.PI) / 180;
        let out = '';
        [-38, 0, 38].forEach((d, i) => {
          const t = rad(a + d), L = (i === 1 ? 30 : 24) * k, W = (i === 1 ? 15 : 12) * k;
          const ex = x + Math.sin(t) * L, ey = y - Math.cos(t) * L;
          const nx = Math.cos(t) * W, ny = Math.sin(t) * W;
          const mx = (x + ex) / 2, my = (y + ey) / 2;
          out += flat(`M${x} ${y}Q${mx + nx} ${my + ny} ${ex} ${ey}Q${mx - nx} ${my - ny} ${x} ${y}Z`, col);
          out += line(`M${x} ${y}L${(x + ex * 2) / 3} ${(y + ey * 2) / 3}`, c[0], 1.2, { opacity: 0.35 });
        });
        return out + line(`M${x} ${y}l${-Math.sin(rad(a)) * 6} ${10}`, col, 2.2);
      };
      for (let r = 0, y = 62; y < h + 40; r++, y += 92) {
        for (let x = (r % 2 ? 60 : 0) + 26; x < w; x += 120) {
          s += frond(x, y, ((r * 3 + Math.floor(x / 120)) % 3 - 1) * 22, (r + Math.floor(x / 120)) % 2 ? c[1] : c[2], 1.55);
        }
      }
      return s;
    },
  },
  {
    id: 'damasco', name: 'Papel damasco', price: 170, tags: ['elegante', 'gotico', 'princesa'],
    tints: [
      T('vino', 'Vino', ['#5A2331', '#7A3446']), T('negro', 'Negro', ['#221F27', '#3A3542']), T('crema', 'Crema y oro', ['#F2E6CF', '#E0C48E']),
      T('verde', 'Verde', ['#2E4A3E', '#46685A']), T('lila', 'Lila', ['#E7DDF4', '#CDBBEA']),
    ],
    draw: (w, h, c) => {
      let s = '';
      const orn = (x, y) => {
        const d = `M${x} ${y - 26}C${x + 8} ${y - 16} ${x + 18} ${y - 12} ${x + 16} ${y}C${x + 14} ${y + 12} ${x + 6} ${y + 16} ${x} ${y + 28}C${x - 6} ${y + 16} ${x - 14} ${y + 12} ${x - 16} ${y}C${x - 18} ${y - 12} ${x - 8} ${y - 16} ${x} ${y - 26}Z`;
        return flat(d, c[1]) + flat(`M${x} ${y - 12}C${x + 5} ${y - 6} ${x + 7} ${y + 2} ${x} ${y + 12}C${x - 7} ${y + 2} ${x - 5} ${y - 6} ${x} ${y - 12}Z`, c[0])
          + Cir(x, y, 3, { fill: c[1], 'data-r': 'flat' });
      };
      for (let r = 0, y = 34; y < h + 30; r++, y += 64) for (let x = (r % 2 ? 36 : 0) + 18; x < w; x += 72) s += orn(x, y);
      return s;
    },
  },
  {
    id: 'rejilla', name: 'Rejilla neón', price: 170, tags: ['y2k', 'aesthetic'],
    tints: [
      T('fucsia', 'Fucsia', ['#24183A', '#FF4FD8', '#4BE3F0']), T('cian', 'Cian', ['#161E36', '#4BE3F0', '#B57CFF']),
      T('atardecer', 'Atardecer', ['#2B1838', '#FF8A5C', '#FF4FA0']),
    ],
    draw: (w, h, c) => {
      let s = '';
      for (let y = 30; y < h; y += 44) s += line(`M0 ${y}H${w}`, c[1], 2, { opacity: 0.8 });
      for (let x = 22; x < w; x += 44) s += line(`M${x} 0V${h}`, c[2], 1.3, { opacity: 0.22 });
      return s;
    },
  },
];

// Ids de antes → diseño y color de ahora (para partidas guardadas).
export const WALL_ALIASES = {
  crema: 'liso.crema', rosada: 'liso.rosa', menta: 'liso.menta', lavanda: 'liso.lavanda',
  rayas: 'rayas.miel', lunares: 'lunares.rosa', ladrillo: 'ladrillo.rojo', madera: 'tablas.miel',
  carbon: 'liso.carbon', vinotinto: 'damasco.vino', medianoche: 'estrellas.noche', neon: 'rejilla.fucsia',
};

export function parseWall(value) {
  const v = WALL_ALIASES[value] || value || 'liso.crema';
  const [pid, tid] = v.split('.');
  const pattern = WALLS.find((p) => p.id === pid) || WALLS[0];
  const tint = pattern.tints.find((t) => t.id === tid) || pattern.tints[0];
  return { pattern, tint, value: `${pattern.id}.${tint.id}` };
}

export const BASEBOARD = 22;

/** La pared entera (svg) de w × h, con zócalo y luz. */
export function wallSvg(value, w, h, { baseboard = true } = {}) {
  const { pattern, tint } = parseWall(value);
  const c = tint.c;
  const base = c[0];
  const dark = isDark(base);
  const ph = baseboard ? h - BASEBOARD : h;
  let s = flat(`M0 0h${w}v${h}h${-w}Z`, base);
  s += `<clipPath id="wc"><path d="M0 0h${w}v${ph}h${-w}Z"/></clipPath>` + G({ 'clip-path': 'url(#wc)' }, pattern.draw(w, ph, c));
  // luz: entra por arriba y se apaga hacia el zócalo. En los estilos
  // vectoriales es un degradado; en pixel, dos bandas limpias.
  s += E('defs', {}, E('linearGradient', { id: 'wl', x1: 0, y1: 0, x2: 0, y2: 1 },
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="${dark ? 0.06 : 0.16}"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.8" stop-color="#2A1C24" stop-opacity="0"/><stop offset="1" stop-color="#2A1C24" stop-opacity="0.1"/>`));
  s += E('rect', { x: 0, y: 0, width: w, height: ph, fill: 'url(#wl)', 'data-r': 'raw', 'data-skip': 'pixel' });
  s += shade(`M0 0h${w}v24h${-w}Z`, '#FFFFFF', dark ? 0.04 : 0.09, { 'data-only': 'pixel' });
  s += shade(`M0 ${ph - 22}h${w}v22h${-w}Z`, '#2A1C24', 0.06, { 'data-only': 'pixel' });
  if (baseboard) {
    const bb = tint.bb || (dark ? tone(base, -1.2) : mix('#FFFFFF', base, 0.2));
    s += face(rr(-3, ph, w + 6, BASEBOARD + 4, 0), bb, { w: 2 });
    s += flat(`M0 ${ph + 1.5}h${w}v4h${-w}Z`, tone(bb, 0.9), { opacity: 0.9 });
    s += shade(`M0 ${h - 6}h${w}v6h${-w}Z`, '#2A1C24', 0.18);
  }
  return svgDoc(w, h, s);
}

/** Muestra chica para la tienda (sin zócalo, motivos a su tamaño). */
export const wallSwatchSvg = (value, size = 120) => wallSvg(value, size, size, { baseboard: false });
