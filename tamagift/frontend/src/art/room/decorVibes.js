// Decoración con personalidad: cosas que cuentan quién vive en el cuarto
// (ver DISENO_MUNDO_VIVO.md §8). Cada una lleva sus estilos de persona
// (`vibes`) y casi todas se pueden pintar: reciben la pintura elegida
// (`p`: wood, cloth, accent; ver furniture/paints.js).
//
// Misma vista 3/4 que todo el cuarto: frente + tapa, elipses aplastadas,
// luz de arriba a la izquierda. `place`: 'sobre' (encima de muebles, en
// la pared o donde quieras) o 'piso'.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, cylinder, pot, Cir, Ell, INK, tube } from './draw.js';

const surf = (cx, y, rx) => Ell(cx, y, rx, rx * 0.22, { fill: '#2A1C24', opacity: 0.22, 'data-r': 'tone' });
const star = (x, y, r, k = 0.48) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr2 = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr2).toFixed(1)} ${(y + Math.sin(a) * rr2).toFixed(1)}`; } return `${d}Z`; };
const heart = (x, y, s) => `M${x} ${y + s * 0.85} C${x - s * 1.1} ${y + s * 0.1} ${x - s * 1.05} ${y - s * 0.95} ${x} ${y - s * 0.35} C${x + s * 1.05} ${y - s * 0.95} ${x + s * 1.1} ${y + s * 0.1} ${x} ${y + s * 0.85}Z`;
const moon = (x, y, r) => `M${x + r * 0.25} ${y - r} A${r} ${r} 0 1 0 ${x + r * 0.25} ${y + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${x + r * 0.25} ${y - r}Z`;
const glow = (cx, cy, rx, ry, c = '#FFE9A8', op = 0.3) => Ell(cx, cy, rx, ry, { fill: c, opacity: op, 'data-r': 'tone' });
const ball = (x, y, r, c, w = 1.4) => Cir(x, y, r, { fill: c, stroke: INK, 'stroke-width': w, 'data-r': 'part' });

export const DECOR_VIBES = [
  // ── Aesthetic ──────────────────────────────────────────────────
  {
    id: 'vinilos', name: 'Caja de vinilos', price: 70, w: 96, h: 74, place: 'piso', vibes: ['aesthetic', 'rockera'],
    draw: (p) => {
      let s = floorShadow(48, 71, 42, 5);
      const covers = ['#E57B93', '#2E2A3A', '#F2C14E', '#7FB894', '#7FA9DE'];
      covers.forEach((c, i) => { s += face(rr(11 + i * 12, 8 + (i % 2) * 3, 32, 38, 2), c, { w: 1.6 }); s += Cir(27 + i * 12, 27 + (i % 2) * 3, 6, { fill: tone(c, -1), 'data-r': 'flat' }); });
      s += box(8, 70, 80, 30, 26, p.wood, { r: 2 });
      s += face(rr(36, 50, 24, 6, 3), tone(p.wood, -1.2), { w: 1.4 });
      return s;
    },
  },
  {
    id: 'camaraFilm', name: 'Cámara de rollo', price: 55, w: 70, h: 54, place: 'sobre', vibes: ['aesthetic', 'y2k'],
    draw: (p) => {
      let s = surf(35, 51, 28);
      s += box(8, 50, 54, 30, 14, p.cloth, { r: 4 });
      s += face(rr(8, 28, 54, 8, 2), '#3A3044', { w: 1.6 });
      s += Cir(35, 36, 11, { fill: '#4A4458', stroke: INK, 'stroke-width': 2, 'data-r': 'part' }) + Cir(35, 36, 6.5, { fill: '#2A2230', stroke: '#8A84A8', 'stroke-width': 1.2, 'data-r': 'part' }) + Cir(32.5, 33.5, 1.8, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += face(rr(46, 14, 10, 6, 1), '#DCE1EA', { w: 1.4 }) + face(rr(14, 16, 8, 5, 1), p.accent, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'lamparaHongo', name: 'Lámpara de hongo', price: 75, w: 66, h: 76, place: 'sobre', vibes: ['aesthetic', 'cottagecore', 'kawaii'],
    draw: (p) => {
      let s = glow(33, 30, 32, 24) + surf(33, 73, 18);
      s += cylinder(33, 73, 15, 6, '#F4EDE4', { w: 1.6 });
      s += face('M27 66 C27 50 28 40 29 34 H37 C38 40 39 50 39 66Z', '#F7F0E4');
      s += face('M6 36 C6 14 60 14 60 36 C46 40 20 40 6 36Z', p.cloth);
      [[20, 26, 3.4], [36, 22, 4], [48, 30, 3], [28, 33, 2.4]].forEach(([x, y, r]) => { s += Ell(x, y, r, r * 0.8, { fill: '#FFF7EC', 'data-r': 'flat' }); });
      s += Ell(33, 37, 18, 3, { fill: '#FFF3C4', opacity: 0.9, 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'tulipanes', name: 'Florero de tulipanes', price: 60, w: 60, h: 92, place: 'sobre', vibes: ['aesthetic', 'coquette', 'cottagecore'],
    draw: (p) => {
      let s = surf(30, 89, 16);
      [[-8, 44, -10], [0, 36, 0], [9, 42, 12]].forEach(([dx, y, a]) => {
        s += line(`M30 70 Q${30 + dx * 0.5} 56 ${30 + dx} ${y}`, '#5FA66A', 2.2);
        s += `<g transform="rotate(${a} ${30 + dx} ${y})">${part(`M${30 + dx - 7} ${y - 2} C${30 + dx - 8} ${y - 14} ${30 + dx - 3} ${y - 16} ${30 + dx} ${y - 12} C${30 + dx + 3} ${y - 16} ${30 + dx + 8} ${y - 14} ${30 + dx + 7} ${y - 2} C${30 + dx + 5} ${y + 3} ${30 + dx - 5} ${y + 3} ${30 + dx - 7} ${y - 2}Z`, dx ? p.cloth : tone(p.cloth, 0.6), { w: 1.6 })}</g>`;
      });
      s += part('M20 60 C14 60 12 80 16 86 C20 90 40 90 44 86 C48 80 46 60 40 60Z', '#E8F4FF', { w: 1.8 });
      s += shade('M22 64 C18 70 18 80 20 84', '#FFFFFF', 0.7) + line('M22 64 C18 70 18 80 20 84', '#FFFFFF', 2, { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'perfumes', name: 'Perfumes y skincare', price: 65, w: 84, h: 66, place: 'sobre', vibes: ['coquette', 'aesthetic'],
    draw: (p) => {
      let s = surf(42, 63, 36);
      s += face(rr(10, 34, 18, 28, 4), '#FFE3EC', { w: 1.6 }) + face(rr(14, 26, 10, 9, 2), p.accent, { w: 1.4 }) + flat(rr(13, 44, 12, 8, 2), '#FFFFFF');
      s += part('M34 62 C30 62 30 44 38 40 L38 34 L46 34 L46 40 C54 44 54 62 50 62Z', '#F7D9F0', { w: 1.6 }) + face(rr(37, 26, 10, 8, 2), '#FFD166', { w: 1.4 }) + shine('M38 46 c-2 4 -2 10 0 13 c-1 -5 -1 -9 0 -13Z');
      s += cylinder(66, 62, 9, 14, p.cloth, { w: 1.6 }) + face(rr(58, 40, 16, 8, 3), '#FFFFFF', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'polaroids', name: 'Fotos con lucecitas', price: 70, w: 130, h: 70, place: 'sobre', vibes: ['aesthetic', 'coquette', 'kawaii'],
    draw: () => {
      let s = line('M4 10 Q65 34 126 10', '#8C7A70', 1.4);
      [[18, 15, -8, '#9DCEEF'], [48, 22, 4, '#F7B6C4'], [80, 22, -4, '#C7E3C0'], [108, 15, 8, '#FFE3A8']].forEach(([x, y, a, c]) => {
        s += `<g transform="rotate(${a} ${x} ${y + 18})">${face(rr(x - 12, y, 24, 30, 1), '#FFFFFF', { w: 1.4 })}${flat(rr(x - 9, y + 3, 18, 18, 0), c)}${flat(`M${x - 9} ${y + 21} L${x - 2} ${y + 13} L${x + 3} ${y + 18} L${x + 9} ${y + 12} V${y + 21}Z`, tone(c, -0.8))}</g>`;
        s += face(rr(x - 2, y - 3, 4, 6, 1), '#C9A06A', { w: 1 });
      });
      [10, 34, 64, 96, 120].forEach((x, i) => { const y = 10 + 24 * (1 - Math.pow((x - 65) / 61, 2)) * 0.97; s += glow(x, y + 3, 6, 6, '#FFE9A8', 0.5) + Ell(x, y + 3, 2.6, 3.4, { fill: '#FFF3C4', stroke: INK, 'stroke-width': 1, 'data-r': 'part' }); });
      return s;
    },
  },
  // ── Otaku / gamer ──────────────────────────────────────────────
  {
    id: 'manga', name: 'Pila de manga', price: 50, w: 70, h: 64, place: 'sobre', vibes: ['otaku', 'academia'],
    draw: () => {
      let s = surf(35, 61, 30);
      [['#FFFFFF', 8, 60, 52], ['#FF7FA8', 10, 52, 50], ['#2E2A3A', 6, 44, 54], ['#FFE07A', 12, 36, 46]].forEach(([c, x, y, w]) => {
        s += face(rr(x, y - 8, w, 8, 1), c, { w: 1.6 }) + flat(rr(x + 2, y - 6, 4, 4, 0), c === '#2E2A3A' ? '#FF7FA8' : '#2E2A3A');
      });
      s += face(rr(16, 10, 30, 18, 1), '#FFFFFF', { w: 1.6 }) + flat('M20 14 L30 14 L26 22 L20 22Z', '#2E2A3A') + flat('M32 14 L42 14 L42 24 L34 24Z', '#FFB6CC');
      return s;
    },
  },
  {
    id: 'capsulas', name: 'Máquina de cápsulas', price: 140, w: 74, h: 128, place: 'piso', vibes: ['otaku', 'kawaii'],
    draw: (p) => {
      let s = floorShadow(37, 125, 30, 5);
      s += box(10, 124, 54, 52, 24, p.cloth, { r: 4 });
      s += face(ellD(37, 44, 27, 30), '#E8F4FF');
      [[26, 52, '#FF7FA8'], [42, 56, '#FFE07A'], [34, 40, '#7FC8F8'], [50, 44, '#8ED07A'], [22, 38, '#C9A6FF'], [46, 30, '#FF9F43'], [30, 26, '#FFFFFF']].forEach(([x, y, c]) => { s += ball(x, y, 6, c, 1.3) + flat(`M${x - 6} ${y} A6 6 0 0 0 ${x + 6} ${y}Z`, '#FFFFFF', { opacity: 0.6 }); });
      s += shine('M18 26 C20 18 26 14 32 14 C26 18 22 22 20 30Z', { opacity: 0.7 });
      s += face(rr(28, 82, 18, 10, 2), '#3A3044', { w: 1.4 }) + Cir(37, 102, 8, { fill: '#DCE1EA', stroke: INK, 'stroke-width': 1.8, 'data-r': 'part' }) + line('M33 102 h8', '#7C8496', 2);
      s += face(rr(14, 10, 46, 8, 3), p.accent, { w: 1.6 });
      return s;
    },
  },
  {
    id: 'ramen', name: 'Ramen instantáneo', price: 35, w: 56, h: 60, place: 'sobre', vibes: ['otaku', 'chef'],
    draw: () => {
      let s = surf(28, 57, 20);
      s += face('M10 22 L46 22 L42 56 Q28 60 14 56Z', '#FFFFFF');
      s += flat('M12 30 L44 30 L43 38 L13 38Z', '#E8505E') + flat(star(28, 34, 3.6), '#FFE07A');
      s += face(ellD(28, 22, 18, 5), '#F7F0E4', { w: 1.6 }) + line('M18 21 q4 -3 8 0 t8 0', '#E8B85A', 1.6);
      s += line('M34 4 L30 22 M40 6 L34 22', '#C9A06A', 2.4);
      return s;
    },
  },
  {
    id: 'figura', name: 'Figura de chica mágica', price: 110, w: 54, h: 92, place: 'sobre', vibes: ['otaku', 'kawaii'],
    draw: (p) => {
      let s = surf(27, 89, 20);
      s += cylinder(27, 89, 18, 6, '#E8F4FF', { w: 1.6 });
      s += part('M17 82 L22 56 L32 56 L37 82Z', p.cloth, { w: 1.6 }) + part('M14 82 Q27 72 40 82Z', tone(p.cloth, 0.5), { w: 1.4 });
      s += part(ellD(27, 44, 11, 12), '#FFE3D3', { w: 1.6 });
      s += part('M15 44 C14 28 40 28 39 44 C36 38 30 36 27 38 C24 36 18 38 15 44Z', p.accent, { w: 1.6 }) + part('M15 44 C12 54 14 60 17 62 C17 54 16 48 16 44Z M39 44 C42 54 40 60 37 62 C37 54 38 48 38 44Z', p.accent, { w: 1.4 });
      s += Cir(23, 46, 1.6, { fill: INK, 'data-r': 'flat' }) + Cir(31, 46, 1.6, { fill: INK, 'data-r': 'flat' });
      s += line('M38 60 L46 40', '#FFD166', 2) + part(star(47, 37, 4.5), '#FFD166', { w: 1.2 });
      return s;
    },
  },
  {
    id: 'huevito', name: 'Mascota virtual', price: 45, w: 40, h: 50, place: 'sobre', vibes: ['y2k', 'kawaii', 'gamer'],
    draw: (p) => {
      let s = surf(20, 47, 14);
      s += part('M20 4 C32 4 36 18 36 28 C36 40 30 46 20 46 C10 46 4 40 4 28 C4 18 8 4 20 4Z', p.cloth, { w: 1.8 });
      s += face(rr(11, 16, 18, 15, 3), '#C9E8C0', { w: 1.4 }) + flat('M17 20 h2 v2 h2 v-2 h2 v4 h-2 v2 h-2 v-2 h-2Z', '#3A5A3A');
      s += Cir(13, 37, 2.2, { fill: p.accent, stroke: INK, 'stroke-width': 1, 'data-r': 'part' }) + Cir(20, 39, 2.2, { fill: p.accent, stroke: INK, 'stroke-width': 1, 'data-r': 'part' }) + Cir(27, 37, 2.2, { fill: p.accent, stroke: INK, 'stroke-width': 1, 'data-r': 'part' });
      return s;
    },
  },
  // ── Kawaii ─────────────────────────────────────────────────────
  {
    id: 'peluches', name: 'Montaña de peluches', price: 120, w: 118, h: 90, place: 'piso', vibes: ['kawaii'],
    draw: () => {
      let s = floorShadow(59, 87, 52, 6);
      const plush = (x, y, r, c, ears) => {
        let o = '';
        if (ears === 'oso') o += ball(x - r * 0.7, y - r * 0.8, r * 0.32, c) + ball(x + r * 0.7, y - r * 0.8, r * 0.32, c);
        if (ears === 'conejo') o += part(`M${x - r * 0.4} ${y - r * 0.7} C${x - r * 0.6} ${y - r * 1.8} ${x - r * 0.1} ${y - r * 1.9} ${x - r * 0.1} ${y - r * 0.8}Z M${x + r * 0.4} ${y - r * 0.7} C${x + r * 0.6} ${y - r * 1.8} ${x + r * 0.1} ${y - r * 1.9} ${x + r * 0.1} ${y - r * 0.8}Z`, c, { w: 1.4 });
        o += part(ellD(x, y, r, r * 0.92), c, { w: 1.6 });
        o += Cir(x - r * 0.32, y, r * 0.09, { fill: INK, 'data-r': 'flat' }) + Cir(x + r * 0.32, y, r * 0.09, { fill: INK, 'data-r': 'flat' }) + Ell(x, y + r * 0.22, r * 0.14, r * 0.1, { fill: INK, 'data-r': 'flat' });
        o += Ell(x - r * 0.55, y + r * 0.2, r * 0.16, r * 0.1, { fill: '#FF9EB5', opacity: 0.8, 'data-r': 'tone' }) + Ell(x + r * 0.55, y + r * 0.2, r * 0.16, r * 0.1, { fill: '#FF9EB5', opacity: 0.8, 'data-r': 'tone' });
        return o;
      };
      s += plush(34, 66, 20, '#F7D9F0', 'conejo') + plush(84, 64, 22, '#C99A72', 'oso') + plush(58, 42, 18, '#C7E8FF', 'oso') + plush(60, 76, 14, '#FFE58A', '');
      return s;
    },
  },
  {
    id: 'lamparaConejo', name: 'Lámpara de conejito', price: 70, w: 54, h: 74, place: 'sobre', vibes: ['kawaii'],
    draw: (p) => {
      let s = glow(27, 42, 28, 26, '#FFE9F2', 0.5) + surf(27, 71, 18);
      s += part('M17 22 C14 4 22 2 23 20Z M37 22 C40 4 32 2 31 20Z', '#FFFFFF', { w: 1.6 }) + flat('M18 20 C17 10 20 8 21 18Z M36 20 C37 10 34 8 33 18Z', '#FFB6CC');
      s += part('M8 52 C8 30 46 30 46 52 C46 66 8 66 8 52Z', '#FFF6FA', { w: 1.8 });
      s += Cir(20, 48, 1.8, { fill: INK, 'data-r': 'flat' }) + Cir(34, 48, 1.8, { fill: INK, 'data-r': 'flat' }) + line('M25 52 q2 2 4 0', INK, 1.4) + Ell(15, 53, 3, 1.8, { fill: '#FF9EB5', opacity: 0.8, 'data-r': 'tone' }) + Ell(39, 53, 3, 1.8, { fill: '#FF9EB5', opacity: 0.8, 'data-r': 'tone' });
      s += cylinder(27, 71, 16, 6, p.cloth, { w: 1.6 });
      return s;
    },
  },
  {
    id: 'cojinGato', name: 'Cojín de gatito', price: 55, w: 76, h: 56, place: 'piso', vibes: ['kawaii', 'otaku'],
    draw: (p) => {
      let s = floorShadow(38, 53, 32, 5);
      s += part('M10 24 L14 6 L24 18 L52 18 L62 6 L66 24 C70 36 66 50 38 50 C10 50 6 36 10 24Z', p.cloth, { w: 1.8 });
      s += flat('M14 20 L16 11 L21 18Z M62 20 L60 11 L55 18Z', '#FFB6CC');
      s += Cir(28, 32, 2.4, { fill: INK, 'data-r': 'flat' }) + Cir(48, 32, 2.4, { fill: INK, 'data-r': 'flat' }) + line('M34 37 q2 2.5 4 0 q2 2.5 4 0', INK, 1.4);
      s += line('M14 34 h8 M14 38 h8 M54 34 h8 M54 38 h8', INK, 1, { opacity: 0.6 });
      return s;
    },
  },
  // ── Coquette ───────────────────────────────────────────────────
  {
    id: 'joyero', name: 'Joyero con perlas', price: 85, w: 70, h: 56, place: 'sobre', vibes: ['coquette', 'princesa'],
    draw: (p) => {
      let s = surf(35, 53, 30);
      s += box(10, 52, 50, 22, 18, p.cloth, { r: 4 });
      s += face('M10 30 C10 10 60 10 60 30Z', tone(p.cloth, 0.4), { w: 1.8 });
      s += line('M14 38 Q35 48 56 38', '#FBF5EC', 3.4) + [18, 26, 35, 44, 52].map((x) => Cir(x, 38 + 7 * (1 - Math.pow((x - 35) / 21, 2)), 2.2, { fill: '#FBF5EC', stroke: '#B8A890', 'stroke-width': 0.8, 'data-r': 'part' })).join('');
      s += part('M35 26 c-4 -6 -12 -6 -12 0 c0 5 8 7 12 0 c4 7 12 5 12 0 c0 -6 -8 -6 -12 0Z', p.accent, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'velaMono', name: 'Velas con moño', price: 50, w: 56, h: 74, place: 'sobre', vibes: ['coquette', 'aesthetic'],
    draw: (p) => {
      let s = glow(28, 18, 16, 14) + surf(28, 71, 22);
      s += cylinder(28, 71, 16, 38, '#FFF4EC', { w: 1.8 });
      s += line('M12 52 Q28 58 44 52', p.accent, 3.6) + part('M28 56 c-4 -6 -12 -6 -12 0 c0 5 8 7 12 0 c4 7 12 5 12 0 c0 -6 -8 -6 -12 0Z', p.accent, { w: 1.2 });
      s += line('M28 33 v-5', INK, 1.4) + part('M28 28 c-3 -3 0 -9 0 -11 c2 3 4 6 0 11Z', '#FFC24D', { w: 1.2 });
      return s;
    },
  },
  {
    id: 'rosas', name: 'Florero de rosas', price: 70, w: 64, h: 90, place: 'sobre', vibes: ['coquette', 'princesa', 'gotica'],
    draw: (p) => {
      let s = surf(32, 87, 16);
      const rose = (x, y, r, c) => part(ellD(x, y, r, r * 0.9), c, { w: 1.4 }) + line(`M${x - r * 0.4} ${y} a${r * 0.4} ${r * 0.4} 0 1 1 ${r * 0.4} ${r * 0.4} M${x - r * 0.7} ${y + r * 0.1} q${r * 0.7} ${r * 0.8} ${r * 1.3} -${r * 0.2}`, tone(c, -1), 1, { opacity: 0.85 });
      s += line('M32 60 L22 36 M32 60 L32 28 M32 60 L42 36', '#4E8A55', 2);
      s += part('M22 50 c-8 -2 -10 -8 -6 -10 c4 2 6 6 6 10Z M42 48 c8 -2 10 -8 6 -10 c-4 2 -6 6 -6 10Z', '#6CBF6A', { w: 1.2 });
      s += rose(22, 34, 7, p.cloth) + rose(42, 34, 7, p.cloth) + rose(32, 24, 8, tone(p.cloth, 0.4));
      s += part('M20 62 L44 62 L40 86 L24 86Z', '#E8F4FF', { w: 1.8 }) + line('M24 66 L26 82', '#FFFFFF', 2, { opacity: 0.7 });
      return s;
    },
  },
  // ── Cottagecore ────────────────────────────────────────────────
  {
    id: 'picnic', name: 'Canasta de pícnic', price: 75, w: 84, h: 70, place: 'piso', vibes: ['cottagecore'],
    draw: (p) => {
      let s = floorShadow(42, 67, 36, 5);
      s += line('M18 36 C18 6 66 6 66 36', tone(p.wood, -0.8), 3.4);
      s += box(10, 66, 64, 28, 22, p.wood, { r: 3 });
      s += line('M12 46 H72 M12 54 H72 M24 38 V66 M42 38 V66 M60 38 V66', tone(p.wood, -1), 1.2, { opacity: 0.7 });
      s += part('M8 34 L76 34 L72 42 L12 42Z', p.cloth, { w: 1.6 }) + flat('M14 34 h8 v8 h-8Z M30 34 h8 v8 h-8Z M46 34 h8 v8 h-8Z M62 34 h8 v8 h-8Z', '#FFFFFF', { opacity: 0.9 });
      s += part('M26 30 c0 -10 14 -10 14 0Z', '#E8A15A', { w: 1.4 }) + ball(50, 28, 5, '#E8505E');
      return s;
    },
  },
  {
    id: 'hongos', name: 'Hongos del bosque', price: 55, w: 76, h: 66, place: 'piso', vibes: ['cottagecore', 'kawaii'],
    draw: (p) => {
      let s = floorShadow(38, 63, 32, 5);
      const mush = (x, y, r, c) => face(`M${x - r * 0.35} ${y} L${x - r * 0.3} ${y - r * 0.9} L${x + r * 0.3} ${y - r * 0.9} L${x + r * 0.35} ${y}Z`, '#F7F0E4', { w: 1.6 })
        + face(`M${x - r} ${y - r * 0.8} C${x - r} ${y - r * 2} ${x + r} ${y - r * 2} ${x + r} ${y - r * 0.8} C${x + r * 0.5} ${y - r * 0.6} ${x - r * 0.5} ${y - r * 0.6} ${x - r} ${y - r * 0.8}Z`, c)
        + Cir(x - r * 0.4, y - r * 1.3, r * 0.16, { fill: '#FFFFFF', 'data-r': 'flat' }) + Cir(x + r * 0.3, y - r * 1.45, r * 0.12, { fill: '#FFFFFF', 'data-r': 'flat' }) + Cir(x + r * 0.55, y - r * 1.05, r * 0.1, { fill: '#FFFFFF', 'data-r': 'flat' });
      s += mush(26, 62, 18, p.cloth) + mush(54, 62, 12, tone(p.cloth, 0.6));
      s += line('M8 62 q3 -6 6 0 M66 62 q3 -6 6 0', '#6CBF6A', 1.8);
      return s;
    },
  },
  {
    id: 'tetera', name: 'Juego de té', price: 70, w: 88, h: 62, place: 'sobre', vibes: ['cottagecore', 'coquette', 'academia'],
    draw: (p) => {
      let s = surf(44, 59, 40);
      s += line('M14 38 C2 38 4 52 14 50', INK, 2.4);
      s += part('M12 58 C6 50 8 32 30 30 C52 32 54 50 48 58Z', p.cloth, { w: 1.8 });
      s += part('M48 44 C56 40 60 32 64 30 L62 36 C58 40 54 48 48 52Z', p.cloth, { w: 1.6 });
      s += face(ellD(30, 30, 13, 3.5), tone(p.cloth, 0.5), { w: 1.4 }) + Cir(30, 25, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += flat('M18 44 c4 -4 8 0 4 4 c-4 4 -8 0 -4 -4Z M32 42 c4 -4 8 0 4 4 c-4 4 -8 0 -4 -4Z', '#FFFFFF', { opacity: 0.8 });
      s += face('M64 46 L82 46 L80 58 Q73 61 66 58Z', '#FFFFFF', { w: 1.6 }) + line('M82 49 c5 0 5 6 0 6', INK, 1.6) + flat(ellD(73, 46, 9, 2.4), '#C9895A');
      return s;
    },
  },
  {
    id: 'pan', name: 'Canasta de pan', price: 45, w: 74, h: 50, place: 'sobre', vibes: ['cottagecore', 'chef'],
    draw: () => {
      let s = surf(37, 47, 32);
      s += part('M14 22 C10 10 30 6 34 18Z', '#E8A15A', { w: 1.6 }) + line('M18 14 l4 4 M24 12 l4 4', '#B97835', 1.2);
      s += part('M30 20 C30 6 58 6 58 20Z', '#D98E4E', { w: 1.6 }) + line('M38 12 l2 6 M46 10 l2 6', '#9A5A2A', 1.4);
      s += face('M8 22 L66 22 L58 46 Q37 50 16 46Z', '#C8955E') + line('M10 28 H64 M12 34 H62 M14 40 H60', '#9A6B3E', 1.2, { opacity: 0.7 });
      s += part('M6 20 L68 20 L66 26 L8 26Z', '#FFFFFF', { w: 1.4 }) + flat('M12 20 h6 v6 h-6Z M26 20 h6 v6 h-6Z M40 20 h6 v6 h-6Z M54 20 h6 v6 h-6Z', '#E8505E', { opacity: 0.85 });
      return s;
    },
  },
  {
    id: 'lana', name: 'Canasta de lana', price: 55, w: 72, h: 62, place: 'piso', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      let s = floorShadow(36, 59, 30, 5);
      s += ball(22, 30, 11, p.cloth, 1.8) + line('M14 26 q8 -6 16 0 M13 32 q9 -5 18 1', tone(p.cloth, -1), 1.2) + ball(46, 28, 10, p.accent, 1.8) + line('M38 24 q8 -5 15 0 M37 30 q8 -4 16 1', tone(p.accent, -1), 1.2);
      s += line('M40 22 L56 2 M44 24 L62 6', '#C9A06A', 2.2);
      s += box(8, 58, 56, 22, 20, '#C8955E', { r: 4 }) + line('M10 44 H62 M10 50 H62', '#9A6B3E', 1.2, { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'pajarito', name: 'Jaula con pajarito', price: 95, w: 60, h: 100, place: 'sobre', vibes: ['cottagecore', 'aesthetic'],
    draw: (p) => {
      let s = surf(30, 97, 24);
      s += line('M30 2 V12', INK, 1.6) + Cir(30, 4, 3, { fill: 'none', stroke: INK, 'stroke-width': 1.6, 'data-r': 'line' });
      s += face(ellD(30, 92, 24, 5), p.wood, { w: 1.8 });
      s += line('M8 92 V40 C8 14 52 14 52 40 V92 M16 92 V36 M24 92 V30 M30 92 V26 M36 92 V30 M44 92 V36', tone(p.wood, -0.6), 1.6);
      s += line('M12 72 H48', tone(p.wood, -0.6), 1.8);
      s += part('M22 64 C22 56 32 54 36 60 C40 58 42 62 40 64 C40 70 26 72 22 64Z', p.cloth, { w: 1.4 }) + Cir(34, 59, 1.2, { fill: INK, 'data-r': 'flat' }) + part('M39 60 l4 1 l-4 1Z', '#FF9F43', { w: 0.8 });
      return s;
    },
  },
  // ── Gótica ─────────────────────────────────────────────────────
  {
    id: 'candelabro', name: 'Candelabro', price: 90, w: 76, h: 100, place: 'sobre', vibes: ['gotica', 'academia'],
    draw: (p) => {
      let s = glow(38, 26, 38, 22) + surf(38, 97, 18);
      const m = p.accent;
      s += cylinder(38, 97, 14, 6, m, { w: 1.6 });
      s += tube('M38 90 V58 M38 64 C26 64 18 60 16 46 M38 64 C50 64 58 60 60 46', 4, m);
      [[16, 46], [38, 40], [60, 46]].forEach(([x, y]) => { s += face(rr(x - 6, y - 2, 12, 4, 1), m, { w: 1.4 }) + face(rr(x - 3.5, y - 18, 7, 16, 1), '#F4F0EA', { w: 1.4 }) + part(`M${x} ${y - 19} c-3 -3 0 -9 0 -11 c2 3 4 6 0 11Z`, '#FFC24D', { w: 1 }); });
      return s;
    },
  },
  {
    id: 'calavera', name: 'Calavera con flores', price: 75, w: 62, h: 62, place: 'sobre', vibes: ['gotica'],
    draw: (p) => {
      let s = surf(31, 59, 22);
      s += part('M12 34 C10 14 52 14 50 34 C50 42 46 44 44 46 L44 56 L18 56 L18 46 C16 44 12 42 12 34Z', '#F4F0EA', { w: 1.8 });
      s += part(ellD(22, 34, 6, 6.5), '#3A2A3E', { w: 1 }) + part(ellD(40, 34, 6, 6.5), '#3A2A3E', { w: 1 }) + flat('M29 42 L31 38 L33 42Z', '#3A2A3E');
      s += line('M24 50 V56 M29 50 V56 M34 50 V56 M39 50 V56', INK, 1.2);
      [[18, 16, p.cloth], [30, 12, p.accent], [42, 16, p.cloth]].forEach(([x, y, c]) => { s += part(ellD(x, y, 6, 5), c, { w: 1.2 }) + Cir(x, y, 2, { fill: '#FFE070', 'data-r': 'flat' }); });
      return s;
    },
  },
  {
    id: 'bolaCristal', name: 'Bola de cristal', price: 95, w: 56, h: 66, place: 'sobre', vibes: ['gotica', 'celestial'],
    draw: (p) => {
      let s = glow(28, 28, 26, 24, '#C9A6FF', 0.35) + surf(28, 63, 20);
      s += face('M10 62 L16 48 L40 48 L46 62Z', p.wood, { w: 1.8 });
      s += part(ellD(28, 28, 20, 20), mix(p.cloth, '#E8E4FF', 0.5), { w: 1.8 });
      s += Ell(28, 32, 12, 8, { fill: p.cloth, opacity: 0.55, 'data-r': 'tone' });
      s += [[22, 26, 2.4], [34, 30, 1.8], [28, 20, 1.4]].map(([x, y, r]) => flat(star(x, y, r, 0.4), '#FFFFFF')).join('');
      s += shine('M16 20 C18 12 24 10 30 10 C24 14 20 18 18 24Z', { opacity: 0.8 });
      return s;
    },
  },
  {
    id: 'cuervo', name: 'Cuervo en su percha', price: 85, w: 60, h: 96, place: 'sobre', vibes: ['gotica'],
    draw: (p) => {
      let s = surf(30, 93, 20);
      s += cylinder(30, 93, 16, 5, p.wood, { w: 1.6 }) + face(rr(28, 40, 4, 48, 1), p.wood, { w: 1.4 }) + face(rr(12, 38, 36, 5, 2), p.wood, { w: 1.4 });
      s += part('M20 38 C14 26 18 12 30 10 C38 10 42 16 40 22 L46 22 L40 26 C42 32 38 38 32 38Z', '#2E2836', { w: 1.8 });
      s += part('M22 30 C26 34 32 34 36 30 C34 38 24 38 22 30Z', '#4A4258', { w: 1.2 }) + Cir(33, 17, 1.8, { fill: '#FFE07A', 'data-r': 'flat' }) + part('M40 20 l8 2 l-8 3Z', '#3A3044', { w: 1 });
      return s;
    },
  },
  {
    id: 'hechizos', name: 'Libro de hechizos', price: 70, w: 76, h: 50, place: 'sobre', vibes: ['gotica', 'celestial'],
    draw: (p) => {
      let s = surf(38, 47, 34);
      s += face('M6 44 L38 40 L70 44 L70 26 L38 22 L6 26Z', '#F4EBD8');
      s += line('M38 22 V40', tone('#F4EBD8', -1), 1.4) + line('M12 30 L32 28 M12 34 L30 32 M44 28 L64 30 M46 32 L62 34', '#B8A890', 1.2);
      s += face('M4 46 L38 42 L72 46 L72 49 L38 45 L4 49Z', p.cloth, { w: 1.6 });
      s += flat(moon(52, 36, 3.4), p.accent) + flat(star(22, 37, 3), p.accent);
      return s;
    },
  },
  // ── Y2K ────────────────────────────────────────────────────────
  {
    id: 'celular', name: 'Celular de tapa', price: 50, w: 36, h: 60, place: 'sobre', vibes: ['y2k'],
    draw: (p) => {
      let s = surf(18, 57, 14);
      s += part(rr(6, 30, 24, 26, 6), p.cloth, { w: 1.6 }) + part(rr(6, 6, 24, 26, 6), p.cloth, { w: 1.6 });
      s += face(rr(10, 10, 16, 14, 2), '#C9E8FF', { w: 1.2 }) + flat('M14 14 h3 v3 h-3Z', '#FF7FA8');
      s += [[12, 36], [18, 36], [24, 36], [12, 42], [18, 42], [24, 42], [12, 48], [18, 48], [24, 48]].map(([x, y]) => Cir(x, y, 1.4, { fill: '#FFFFFF', 'data-r': 'flat' })).join('');
      s += line('M30 18 C35 18 35 30 31 33', p.accent, 1.6) + part(heart(31, 37, 2.6), p.accent, { w: 1 });
      return s;
    },
  },
  {
    id: 'bolaDisco', name: 'Bola disco', price: 110, w: 64, h: 92, place: 'sobre', vibes: ['y2k', 'rockera'],
    draw: () => {
      let s = line('M32 0 V22', '#8C7A70', 1.6);
      s += part(ellD(32, 52, 26, 26), '#DCE1EA', { w: 1.8 });
      for (let i = -3; i <= 3; i++) s += line(`M${32 + i * 7} 28 Q${32 + i * 8.5} 52 ${32 + i * 7} 76`, '#9AA2B6', 1, { opacity: 0.8 });
      for (let j = 0; j < 6; j++) s += line(`M8 ${36 + j * 7} Q32 ${38 + j * 7} 56 ${36 + j * 7}`, '#9AA2B6', 1, { opacity: 0.8 });
      [[22, 40, '#FF9EC4'], [40, 46, '#9DCEEF'], [30, 62, '#FFE07A'], [46, 60, '#C9A6FF']].forEach(([x, y, c]) => { s += flat(rr(x, y, 5, 5, 0), c); });
      s += shine('M16 40 C18 32 24 28 30 28 C24 32 20 36 18 44Z', { opacity: 0.9 });
      return s;
    },
  },
  {
    id: 'mariposas', name: 'Mariposas de pared', price: 40, w: 90, h: 56, place: 'sobre', vibes: ['y2k', 'kawaii', 'cottagecore'],
    draw: (p) => {
      let s = '';
      const fly = (x, y, sc, c) => `<g transform="translate(${x} ${y}) scale(${sc})">${part('M0 0 C-4 -14 -18 -12 -16 -2 C-15 4 -6 4 0 2Z M0 0 C4 -14 18 -12 16 -2 C15 4 6 4 0 2Z', c, { w: 1.4 })}${part('M0 2 C-6 4 -12 12 -6 14 C-2 15 0 8 0 4Z M0 2 C6 4 12 12 6 14 C2 15 0 8 0 4Z', tone(c, 0.5), { w: 1.2 })}${line('M0 -4 V12', INK, 1.6)}</g>`;
      s += fly(22, 22, 1, p.cloth) + fly(64, 18, 0.8, p.accent) + fly(48, 42, 0.65, tone(p.cloth, 0.6));
      return s;
    },
  },
  // ── Celestial ──────────────────────────────────────────────────
  {
    id: 'proyector', name: 'Proyector de estrellas', price: 120, w: 60, h: 60, place: 'sobre', vibes: ['celestial', 'kawaii'], night: true,
    draw: (p) => {
      let s = glow(30, 26, 30, 24, '#B8A1FF', 0.3) + surf(30, 57, 20);
      s += cylinder(30, 57, 18, 10, p.wood, { w: 1.6 });
      s += part('M12 46 C12 16 48 16 48 46Z', mix(p.cloth, '#2E2A6A', 0.5), { w: 1.8 });
      [[22, 30], [34, 26], [40, 38], [26, 40], [30, 33]].forEach(([x, y]) => { s += flat(star(x, y, 2.6, 0.45), '#FFE07A'); });
      s += flat(moon(38, 30, 3), '#FFF3C4');
      return s;
    },
  },
  {
    id: 'lunaLampara', name: 'Lámpara de luna', price: 95, w: 60, h: 76, place: 'sobre', vibes: ['celestial', 'aesthetic'],
    draw: (p) => {
      let s = glow(30, 30, 29, 29, '#FFF3C4', 0.45) + surf(30, 73, 16);
      s += cylinder(30, 73, 14, 5, p.wood, { w: 1.6 }) + face(rr(28, 54, 4, 14, 1), p.wood, { w: 1.2 });
      s += part(ellD(30, 30, 24, 24), '#FFF6DC', { w: 1.8 });
      [[20, 22, 4], [36, 34, 5], [26, 40, 3], [38, 20, 2.6]].forEach(([x, y, r]) => { s += Ell(x, y, r, r * 0.85, { fill: '#EADFB8', 'data-r': 'flat' }); });
      return s;
    },
  },
  {
    id: 'cristales', name: 'Cristales', price: 60, w: 62, h: 56, place: 'sobre', vibes: ['celestial', 'aesthetic'],
    draw: (p) => {
      let s = surf(31, 53, 24);
      const cr = (x, h, w, c, a) => `<g transform="rotate(${a} ${x} 52)">${part(`M${x - w} 52 L${x - w} ${52 - h} L${x} ${52 - h - w} L${x + w} ${52 - h} L${x + w} 52Z`, c, { w: 1.6 })}${flat(`M${x - w * 0.4} ${52 - h + 2} L${x} ${52 - h - w + 3} L${x} 50Z`, '#FFFFFF', { opacity: 0.5 })}</g>`;
      s += cr(18, 18, 6, tone(p.cloth, 0.5), -18) + cr(44, 22, 7, tone(p.cloth, 0.3), 16) + cr(31, 30, 8, p.cloth, 0);
      s += part('M8 52 C14 46 48 46 54 52 Q31 56 8 52Z', '#B8A890', { w: 1.4 });
      return s;
    },
  },
  {
    id: 'tarot', name: 'Cartas de tarot', price: 45, w: 70, h: 46, place: 'sobre', vibes: ['celestial', 'gotica'],
    draw: (p) => {
      let s = surf(35, 43, 30);
      [[-14, -12], [0, 0], [14, 12]].forEach(([dx, a], i) => {
        s += `<g transform="rotate(${a} ${35 + dx} 40)">${face(rr(35 + dx - 9, 12, 18, 28, 2), i === 1 ? '#F4EBD8' : p.cloth, { w: 1.4 })}${i === 1 ? flat(star(35, 22, 4), p.accent) + flat(moon(35, 32, 3), p.accent) : flat(rr(35 + dx - 6, 15, 12, 22, 1), tone(p.cloth, -0.6))}</g>`;
      });
      return s;
    },
  },
  {
    id: 'atrapasuenos', name: 'Atrapasueños', price: 65, w: 56, h: 100, place: 'sobre', vibes: ['celestial', 'cottagecore'],
    draw: (p) => {
      let s = line('M28 0 V8', '#8C7A70', 1.4);
      s += Cir(28, 28, 18, { fill: 'none', stroke: p.wood, 'stroke-width': 3.4, 'data-r': 'line' });
      s += line('M28 10 L40 40 L13 22 L43 22 L16 40Z', '#F4EBD8', 1, { opacity: 0.9 }) + Cir(28, 28, 3, { fill: p.accent, stroke: INK, 'stroke-width': 1, 'data-r': 'part' });
      [[14, 46], [28, 48], [42, 46]].forEach(([x, y]) => { s += line(`M${x} ${y - 4} V${y + 18}`, '#8C7A70', 1.2) + part(`M${x} ${y + 14} C${x - 5} ${y + 22} ${x - 4} ${y + 34} ${x} ${y + 40} C${x + 4} ${y + 34} ${x + 5} ${y + 22} ${x} ${y + 14}Z`, p.cloth, { w: 1.2 }); });
      return s;
    },
  },
  // ── Dark academia ──────────────────────────────────────────────
  {
    id: 'globoTerraqueo', name: 'Globo terráqueo', price: 80, w: 58, h: 80, place: 'sobre', vibes: ['academia'],
    draw: (p) => {
      let s = surf(29, 77, 18);
      s += cylinder(29, 77, 14, 5, p.wood, { w: 1.6 }) + face(rr(27, 58, 4, 14, 1), p.wood, { w: 1.2 });
      s += line('M10 52 C2 34 12 10 32 8', '#C9A06A', 3);
      s += part(ellD(29, 34, 20, 20), '#9DCEEF', { w: 1.8 });
      s += flat('M18 24 C22 20 30 22 30 28 C28 34 22 32 20 38 C16 36 14 28 18 24Z M34 34 C38 30 44 32 44 38 C40 44 36 44 34 40Z', '#8ED07A');
      s += shine('M16 26 C18 20 22 16 28 15 C22 18 19 22 18 30Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'maquinaEscribir', name: 'Máquina de escribir', price: 110, w: 88, h: 62, place: 'sobre', vibes: ['academia', 'aesthetic'],
    draw: (p) => {
      let s = surf(44, 59, 40);
      s += face(rr(30, 6, 28, 22, 1), '#FFFFFF', { w: 1.4 }) + line('M34 12 h18 M34 16 h14 M34 20 h16', '#B8A890', 1);
      s += face(rr(16, 24, 56, 8, 4), tone(p.cloth, -0.6), { w: 1.6 });
      s += box(8, 58, 72, 22, 26, p.cloth, { r: 6 });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 7 - r; c++) s += Cir(20 + r * 4 + c * 8, 41 + r * 5 - 6, 2.4, { fill: '#F4EBD8', stroke: INK, 'stroke-width': 0.9, 'data-r': 'part' });
      return s;
    },
  },
  {
    id: 'lamparaBanquero', name: 'Lámpara de escritorio', price: 85, w: 70, h: 70, place: 'sobre', vibes: ['academia'],
    draw: (p) => {
      let s = glow(35, 40, 34, 18) + surf(35, 67, 22);
      s += box(14, 66, 42, 6, 14, p.wood, { r: 2 });
      s += face(rr(33, 32, 4, 28, 1), '#C9A06A', { w: 1.2 });
      s += face('M8 34 C8 20 62 20 62 34Z', p.cloth) + face(ellD(35, 34, 27, 4), tone(p.cloth, -0.8), { w: 1.4 }) + Ell(35, 35, 16, 2, { fill: '#FFF3C4', 'data-r': 'flat' });
      s += line('M16 28 C24 22 36 22 44 22', '#FFFFFF', 1.8, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'relojArena', name: 'Reloj de arena', price: 50, w: 44, h: 66, place: 'sobre', vibes: ['academia', 'gotica'],
    draw: (p) => {
      let s = surf(22, 63, 16);
      s += face(rr(6, 56, 32, 6, 2), p.wood, { w: 1.6 }) + face(rr(6, 4, 32, 6, 2), p.wood, { w: 1.6 });
      s += part('M10 10 L34 10 C34 22 24 28 22 32 C24 36 34 42 34 56 L10 56 C10 42 20 36 22 32 C20 28 10 22 10 10Z', '#E8F4FF', { w: 1.6 });
      s += flat('M14 14 L30 14 C30 20 24 24 22 28 C20 24 14 20 14 14Z', '#F2C14E') + flat('M14 54 C16 46 20 44 22 42 C24 44 28 46 30 54Z', '#F2C14E') + line('M22 30 V44', '#F2C14E', 1);
      s += line('M9 10 V56 M35 10 V56', p.wood, 2.4);
      return s;
    },
  },
  // ── Playera ────────────────────────────────────────────────────
  {
    id: 'conchas', name: 'Frasco de conchitas', price: 45, w: 50, h: 62, place: 'sobre', vibes: ['playera', 'cottagecore'],
    draw: (p) => {
      let s = surf(25, 59, 18);
      s += part('M10 18 L40 18 L40 54 Q25 60 10 54Z', '#E8F4FF', { w: 1.8 });
      s += flat('M11 40 L39 40 L39 54 Q25 59 11 54Z', '#F2DFB8');
      [[18, 46, '#FFB6CC'], [30, 44, '#FFE3D3'], [24, 50, '#FFFFFF'], [34, 50, '#C9A6FF']].forEach(([x, y, c]) => { s += part(`M${x - 4} ${y + 2} Q${x} ${y - 6} ${x + 4} ${y + 2}Z`, c, { w: 1 }); });
      s += face(rr(8, 10, 34, 8, 2), p.wood, { w: 1.6 }) + line('M14 22 V48', '#FFFFFF', 2, { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'tablaSurf', name: 'Tabla de surf', price: 130, w: 54, h: 170, place: 'piso', vibes: ['playera', 'deportiva'],
    draw: (p) => {
      let s = floorShadow(27, 166, 20, 4);
      s += part('M27 4 C44 30 46 120 38 160 Q27 168 16 160 C8 120 10 30 27 4Z', p.cloth, { w: 2 });
      s += flat('M27 8 C30 40 30 130 27 162 L25 162 C22 130 22 40 25 8Z', '#FFFFFF', { opacity: 0.85 });
      s += flat('M14 80 C24 76 30 70 40 72 L40 90 C30 88 24 94 14 96Z', p.accent);
      return s;
    },
  },
  // ── Arte, cocina y plantas ─────────────────────────────────────
  {
    id: 'pinceles', name: 'Tarro de pinceles', price: 40, w: 50, h: 70, place: 'sobre', vibes: ['aesthetic'],
    draw: (p) => {
      let s = surf(25, 67, 18);
      [[16, 8, -12, '#E8505E'], [24, 4, -2, '#5B7BD9'], [32, 6, 8, '#F2C14E'], [38, 12, 18, '#8ED07A']].forEach(([x, y, a, c]) => {
        s += `<g transform="rotate(${a} ${x} 48)">${face(rr(x - 1.6, y + 8, 3.2, 40, 1), '#C9A06A', { w: 1 })}${part(`M${x - 2.2} ${y + 8} L${x} ${y} L${x + 2.2} ${y + 8}Z`, c, { w: 1 })}</g>`;
      });
      s += cylinder(25, 67, 15, 24, p.cloth, { w: 1.8 }) + flat(rr(14, 50, 22, 4, 1), tone(p.cloth, -0.6));
      return s;
    },
  },
  {
    id: 'batidora', name: 'Batidora de pie', price: 130, w: 70, h: 84, place: 'sobre', vibes: ['chef', 'cottagecore', 'kawaii'],
    draw: (p) => {
      let s = surf(35, 81, 30);
      s += face('M10 80 L10 72 Q10 66 18 66 L56 66 Q62 66 62 72 L62 80Z', p.cloth);
      s += face('M48 66 L48 20 Q48 10 38 10 L22 10 Q10 10 10 22 L10 30 L40 30 L40 66Z', p.cloth);
      s += part('M18 44 L44 44 L40 64 Q31 68 22 64Z', '#DCE1EA', { w: 1.6 }) + line('M31 30 V44', '#9AA2B6', 2);
      s += Cir(18, 20, 2.6, { fill: '#FFFFFF', 'data-r': 'flat' }) + face(rr(50, 26, 6, 10, 2), tone(p.cloth, -0.8), { w: 1.2 });
      s += line('M14 16 C18 12 26 12 34 12', '#FFFFFF', 2, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'pastelVitrina', name: 'Pastel en vitrina', price: 75, w: 60, h: 76, place: 'sobre', vibes: ['chef', 'coquette', 'kawaii'],
    draw: (p) => {
      let s = surf(30, 73, 24);
      s += face(ellD(30, 66, 24, 6), '#F4F0EA', { w: 1.6 }) + face(rr(27, 66, 6, 6, 1), '#F4F0EA', { w: 1.2 });
      s += face('M12 62 L12 44 L48 44 L48 62Z', '#F6D7B0') + flat('M12 52 L48 52 L48 56 L12 56Z', p.cloth);
      s += face(ellD(30, 44, 18, 5), '#FFF3F6', { w: 1.6 }) + Cir(30, 38, 3.4, { fill: '#E8505E', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      // campana de vidrio: un brillo transparente y su contorno (no tapa el pastel)
      s += shade('M6 64 C6 22 54 22 54 64Z', '#E8F4FF', 0.28) + line('M6 64 C6 22 54 22 54 64', '#9AB8D0', 1.8) + Cir(30, 22, 3, { fill: '#DCE1EA', stroke: INK, 'stroke-width': 1.2, 'data-r': 'part' });
      s += shine('M12 50 C12 36 18 30 24 28 C18 34 16 40 16 52Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'terrario', name: 'Terrario', price: 70, w: 56, h: 64, place: 'sobre', vibes: ['aesthetic', 'cottagecore'],
    draw: () => {
      let s = surf(28, 61, 22);
      s += shade('M6 42 C6 16 50 16 50 42 C50 56 6 56 6 42Z', '#E8F4FF', 0.35);
      s += flat('M8 46 C14 52 42 52 48 46 C46 40 10 40 8 46Z', '#9A6B48');
      s += part('M18 44 c-4 -10 2 -14 4 -6 c2 -8 8 -4 4 6Z', '#6FB07E', { w: 1.2 }) + part('M32 44 c0 -12 8 -12 8 0Z', '#8CC7A0', { w: 1.2 }) + Cir(28, 44, 2.2, { fill: '#FFFFFF', stroke: INK, 'stroke-width': 0.8, 'data-r': 'part' });
      s += line('M6 42 C6 16 50 16 50 42 C50 56 6 56 6 42Z', '#9AB8D0', 1.8) + face(rr(20, 12, 16, 6, 2), '#C9A06A', { w: 1.4 }) + shine('M12 30 C14 24 18 20 24 18 C18 22 16 26 14 34Z', { opacity: 0.7 });
      return s;
    },
  },
];
