// Decoración de Halloween: se vende solo en la temporada (seasons.js) y
// después queda para siempre en el cuarto de quien la compró.
//
// Tierna antes que tenebrosa: calabazas sonrientes, fantasmitas con
// cachetes, murciélagos de ojos brillantes. Misma vista 3/4 que todo el
// cuarto (frente + tapa, elipses aplastadas, luz de arriba a la izquierda).
// Lo que cuelga tiene de dónde (chinchetas, cordel, argolla) y lo que se
// apoya, su sombra. Los resplandores solo se ven en los estilos de luz
// (lofi y neón): en los demás serían una mancha.

import { face, part, flat, line, shade, shine, rr, ellD, tone, tube, Cir, Ell, INK } from './draw.js';

const SH = '#2A1C24';
const f1 = (n) => +n.toFixed(1);
const surf = (cx, y, rx) => Ell(cx, y, rx, rx * 0.2, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
const floorSh = (cx, y, rx, ry = rx * 0.16) => Ell(cx, y, rx, ry, { fill: SH, opacity: 0.22, 'data-r': 'tone' });
// sombra de contacto, más oscura y chica, justo donde toca
const contact = (cx, y, rx, ry = rx * 0.22) => Ell(cx, y, rx, ry, { fill: SH, opacity: 0.2, 'data-r': 'tone' });
// resplandor en tres escalones (sin borde duro): solo lofi y neón
const glow = (cx, cy, rx, ry, c, op = 0.32) => [1, 0.74, 0.48].map((k) => Ell(cx, cy, rx * k, ry * k, { fill: c, opacity: f1(op * 0.42), 'data-r': 'tone', 'data-only': 'lofi neon' })).join('');
// en neón lo encendido es blanco caliente (sus rellenos se apagan)
const hot = (d) => shine(d, { 'data-only': 'neon' });
const star = (x, y, r, k = 0.5) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r2 = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * r2).toFixed(1)} ${(y + Math.sin(a) * r2).toFixed(1)}`; } return `${d}Z`; };
const moon = (x, y, r) => `M${x + r * 0.25} ${y - r} A${r} ${r} 0 1 0 ${x + r * 0.25} ${y + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${x + r * 0.25} ${y - r}Z`;

const PUMPKIN = '#F28C38', PUMPKIN_D = '#DE7426', STEM = '#7A8A3E', LEAF = '#8CC063';
const NIGHT = '#3B3346', NIGHT_HI = '#5A5068', BAT = '#4A3F5C';
const GHOST = '#FBF7FF', GHOST_SH = '#DCD4F0', BLUSH = '#FFB6CC';
const TWINE = '#7A6A8E';

// Chincheta de donde se cuelga una guirnalda.
const tack = (x, y, c = '#B48AE8') => part(ellD(x, y, 3.6, 3.4), c, { w: 1.4 }) + Cir(x - 1.1, y - 1.1, 1.1, { fill: '#FFFFFF', 'data-r': 'shine' });

// Calabaza con centro de la base en (cx, by) (donde se apoya). `k` escala
// (k=1 → 66 de ancho y 44 de alto). Gajos: los de atrás más oscuros y el
// de la derecha en sombra; así se lee redonda en todos los estilos.
function pumpkin(cx, by, k, c = PUMPKIN, o = {}) {
  const cy = by - 21 * k;
  const w = o.w || (k < 0.6 ? 1.4 : 1.8);
  const lobe = (dx, rx, ry, col) => part(ellD(cx + dx * k, cy, rx * k, ry * k), col, { w });
  let s = '';
  if (o.lobes === 3) {
    s += lobe(-11, 15, 19.5, tone(c, -0.25)) + lobe(11, 15, 19.5, tone(c, -0.75));
    s += lobe(0, 14, 21.5, tone(c, 0.15));
  } else {
    s += lobe(-19, 14, 19, tone(c, -0.3)) + lobe(19, 14, 19, tone(c, -0.95));
    s += lobe(-10, 15, 21, c) + lobe(10, 15, 21, tone(c, -0.45));
    s += lobe(0, 12.5, 22, tone(c, 0.18));
  }
  // brillo en el gajo de la izquierda
  s += shine(`M${cx - 17 * k} ${cy - 6 * k} C${cx - 16 * k} ${cy - 12 * k} ${cx - 13 * k} ${cy - 16 * k} ${cx - 9 * k} ${cy - 17.5 * k} C${cx - 12 * k} ${cy - 13 * k} ${cx - 13.5 * k} ${cy - 9 * k} ${cx - 13.5 * k} ${cy - 4 * k}Z`, { opacity: 0.5 });
  if (o.stem !== false) {
    const sc = o.stemC || STEM;
    const lean = o.lean ?? 1;
    // tallo grueso y torcido, con el corte de arriba más claro
    s += part(`M${cx - 3.4 * k} ${cy - 19 * k} C${cx - 4 * k} ${cy - 25 * k} ${cx - 2 * k + lean * 1 * k} ${cy - 29 * k} ${cx + lean * 3 * k} ${cy - 31 * k} L${cx + lean * 7 * k} ${cy - 28.5 * k} C${cx + lean * 3 * k} ${cy - 26 * k} ${cx + 2.6 * k} ${cy - 23 * k} ${cx + 3.4 * k} ${cy - 19 * k}Z`, sc, { w });
    s += part(ellD(cx + lean * 5 * k, cy - 29.8 * k, 2.4 * k, 1.5 * k), tone(sc, 0.9), { w: w * 0.7 });
  }
  return s;
}

// Hoja de calabaza (tres lóbulos) desde (x, y) hacia un lado.
function pLeaf(x, y, k, sx = -1, c = LEAF) {
  const P = (dx, dy) => `${f1(x + dx * k * sx)} ${f1(y + dy * k)}`;
  const d = `M${P(0, 0)} C${P(3, -5)} ${P(8, -8)} ${P(11, -6)} C${P(12, -10)} ${P(17, -10)} ${P(18, -6)} C${P(22, -6)} ${P(23, -1)} ${P(19, 1)} C${P(16, 4)} ${P(8, 4)} ${P(0, 0)}Z`;
  return part(d, c, { w: 1.3 }) + line(`M${P(1, -0.5)} Q${P(9, -2)} ${P(17, -3)}`, tone(c, -0.9), 1.1, { opacity: 0.7 });
}

// Murciélago de fieltro con centro en (x, y): alas festoneadas, orejitas,
// ojos grandes y un colmillito. Ancho ~44·k.
function bat(x, y, k = 1, c = BAT) {
  const wing = (sx) => part(`M${3 * sx} -3 C${8 * sx} -10 ${16 * sx} -13 ${23 * sx} -10 Q${21.6 * sx} -4.6 ${19 * sx} 1 Q${16.4 * sx} -5.4 ${13 * sx} 1.6 Q${10 * sx} -4 ${4.5 * sx} 4.5 Z`, sx < 0 ? c : tone(c, -0.35), { w: 1.4 });
  let b = wing(-1) + wing(1);
  b += part('M-5.5 -1 L-5.6 -11 L-1.8 -6.6 L1.8 -6.6 L5.6 -11 L5.5 -1 C7 5 4 8.6 0 8.6 C-4 8.6 -7 5 -5.5 -1Z', c, { w: 1.5 });
  b += flat('M-3.6 -9 L-3.6 -6.6 L-2.2 -6.8Z M3.6 -9 L3.6 -6.6 L2.2 -6.8Z', '#E89AB8');
  // ojos grandes con pupila; en pixel, a este tamaño, dos puntitos de luz
  const big = { 'data-skip': 'pixel' };
  b += Ell(-2.6, -1.4, 2.5, 2.9, { fill: '#FFFFFF', 'data-r': 'flat', ...big }) + Ell(2.6, -1.4, 2.5, 2.9, { fill: '#FFFFFF', 'data-r': 'flat', ...big });
  b += Ell(-2.2, -0.7, 1.6, 2, { fill: INK, 'data-r': 'flat', ...big }) + Ell(3, -0.7, 1.6, 2, { fill: INK, 'data-r': 'flat', ...big });
  b += Ell(-2.4, -1.2, 1.3, 1.6, { fill: '#FFF6D8', 'data-r': 'flat', 'data-only': 'pixel' }) + Ell(2.4, -1.2, 1.3, 1.6, { fill: '#FFF6D8', 'data-r': 'flat', 'data-only': 'pixel' });
  b += flat('M0.4 3 L2.4 3 L1.4 5.2Z', '#FFFFFF');
  b += Ell(-4, 2.4, 1.4, 0.9, { fill: BLUSH, opacity: 0.9, 'data-r': 'flat' }) + Ell(4, 2.4, 1.4, 0.9, { fill: BLUSH, opacity: 0.9, 'data-r': 'flat' });
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${k})">${b}</g>`;
}

// Caramelo envuelto (centro en x, y) y caramelo de maíz.
const candy = (x, y, c, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${part(`M${x - 5.5} ${y} L${x - 11} ${y - 4.5} L${x - 10} ${y} L${x - 11} ${y + 4.5}Z M${x + 5.5} ${y} L${x + 11} ${y - 4.5} L${x + 10} ${y} L${x + 11} ${y + 4.5}Z`, tone(c, 0.45), { w: 1.2 })}${part(ellD(x, y, 6.5, 4.8), c, { w: 1.4 })}${shine(`M${x - 4} ${y - 1.5} Q${x - 3} ${y - 3.6} ${x} ${y - 3.6} Q${x - 2.6} ${y - 2.4} ${x - 2.8} ${y - 0.6}Z`, { opacity: 0.8 })}</g>`;
const candyCorn = (x, y, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${part(`M${x - 6} ${y + 5} Q${x} ${y + 7.5} ${x + 6} ${y + 5} L${x + 1} ${y - 8} Q${x} ${y - 9} ${x - 1} ${y - 8}Z`, '#FFFFFF', { w: 1.3 })}${flat(`M${x - 5.2} ${y + 3} Q${x} ${y + 5.4} ${x + 5.2} ${y + 3} L${x + 3.4} ${y - 1.6} Q${x} ${y - 0.6} ${x - 3.4} ${y - 1.6}Z`, '#FFA53A')}${flat(`M${x - 6} ${y + 5} Q${x} ${y + 7.5} ${x + 6} ${y + 5} L${x + 5.2} ${y + 3} Q${x} ${y + 5.4} ${x - 5.2} ${y + 3}Z`, '#FFD84A')}</g>`;

// Cordel colgado entre (x0, y0) y (x1, y0) que baja `sag` en el medio
// (una parábola): devuelve el camino y la altura en cada x.
function sagging(x0, x1, y0, sag) {
  const cx = (x0 + x1) / 2, cy = y0 + sag * 2;
  const at = (x) => { const t = (x - x0) / (x1 - x0); return [y0 + sag * 4 * t * (1 - t), (sag * 4 * (1 - 2 * t)) / (x1 - x0)]; };
  return { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y0}`, at };
}

export const DECOR_HALLOWEEN = [
  {
    id: 'calabazaTallada', name: 'Calabaza sonriente', price: 60, w: 78, h: 74, place: 'sobre', season: 'halloween',
    draw: () => {
      let s = glow(39, 46, 40, 30, '#FFC870', 0.38) + glow(39, 72, 34, 7, '#FFD27A', 0.5) + surf(39, 72, 31) + contact(39, 71.5, 20);
      s += pumpkin(39, 72, 1.0, PUMPKIN, { lean: 1 });
      s += pLeaf(35, 23, 0.95, -1);
      s += line('M43 22 C49 20 53 24 50 27 C48 29 45 27 47 25', STEM, 1.6);
      // la tapa cortada en zigzag alrededor del tallo
      s += line('M26 31 L29.5 28.5 L33 31 L36.5 28.5 L40 31 L43.5 28.5 L47 31 L50.5 28.5 L53 30.5', tone(PUMPKIN, -1.4), 1.5, { opacity: 0.85 });
      // la cara tallada (ojitos felices y sonrisa con un diente): el hueco
      // deja ver la luz de la vela
      const hole = (d, dIn) => part(d, '#FFCF48', { w: 1.6 }) + flat(dIn, '#FFF4C0');
      s += hole('M23 47.6 L29.4 36.6 L35.8 47.6 Q29.4 49.4 23 47.6Z', 'M25.8 46.2 L29.4 40 L33 46.2 Q29.4 47.2 25.8 46.2Z');
      s += hole('M42.2 47.6 L48.6 36.6 L55 47.6 Q48.6 49.4 42.2 47.6Z', 'M45 46.2 L48.6 40 L52.2 46.2 Q48.6 47.2 45 46.2Z');
      s += hole('M24.6 52.6 Q39 58.6 53.4 52.6 Q51.4 66 39 66 Q26.6 66 24.6 52.6Z', 'M27.6 55 Q39 60 50.4 55 Q48.4 63.2 39 63.2 Q29.6 63.2 27.6 55Z');
      s += part('M40.6 56.4 L45.4 55.2 L45.2 60 L41 60.6Z', PUMPKIN, { w: 1.3 });
      s += hot('M27.6 45.6 L29.4 42.4 L31.2 45.6Z M46.8 45.6 L48.6 42.4 L50.4 45.6Z M31 57.6 Q35 59 39.4 58.8 L39.4 61 Q34 61.4 31 57.6Z');
      return s;
    },
  },
  {
    id: 'calabazas', name: 'Montón de calabazas', price: 90, w: 124, h: 92, place: 'piso', season: 'halloween',
    draw: () => {
      let s = floorSh(64, 89, 58, 7);
      s += contact(46, 86, 32) + contact(92, 89, 26);
      // la grande atrás, con su hoja y zarcillo
      s += pumpkin(46, 86, 1.32, PUMPKIN, { lean: 1 });
      s += pLeaf(41, 31, 1.1, -1);
      s += line('M52 20 C60 17 64 22 60 26 C57 29 54 26 56 24', STEM, 1.7);
      // la blanca a la derecha, más adelante
      s += pumpkin(93, 89, 0.92, '#F4EADB', { lean: -1, stemC: '#8A9A56' });
      // la chiquita adelante, amarilla
      s += contact(60, 91, 16);
      s += pumpkin(60, 91.5, 0.58, '#F9B54C', { lobes: 3, lean: 1 });
      s += pLeaf(57, 66, 0.6, 1, '#9CCB6E');
      return s;
    },
  },
  {
    id: 'murcielagos', name: 'Guirnalda de murciélagos', price: 55, w: 150, h: 66, place: 'sobre', season: 'halloween',
    draw: () => {
      const str = sagging(7, 143, 8, 19);
      let s = line(str.d, TWINE, 1.8);
      // tres murciélagos grandes colgando a distintas alturas: el del medio
      // adelante, y entre ellos dos cuentas de calabaza en el cordel
      const hang = (x, drop, k, c) => {
        const [y] = str.at(x);
        return line(`M${x} ${f1(y)} V${f1(y + drop)}`, TWINE, 1.4) + bat(x, y + drop + 11 * k, k, c);
      };
      s += hang(29, 6, 1.18, BAT) + hang(121, 6, 1.18, '#5A4A70');
      [53, 97].forEach((x) => {
        const [y] = str.at(x);
        s += part(ellD(x, y + 1.6, 4.4, 3.6), PUMPKIN, { w: 1.2 }) + line(`M${x - 1.6} ${f1(y - 0.6)}V${f1(y + 3.8)}M${x + 1.6} ${f1(y - 0.6)}V${f1(y + 3.8)}`, PUMPKIN_D, 1) + flat(rr(x - 0.8, y - 3, 1.6, 2, 0.5), STEM);
      });
      s += hang(75, 4, 1.34, '#54476A');
      s += tack(7, 8) + tack(143, 8);
      return s;
    },
  },
  {
    id: 'telarana', name: 'Telaraña con arañita', price: 40, w: 84, h: 84, place: 'sobre', season: 'halloween',
    draw: () => {
      const W = '#9A90B6';
      const cx = 42, cy = 36;
      // ocho radios un poco desparejos, como los teje una araña de verdad
      const ang = [-90, -44, 2, 46, 88, 136, 181, 226].map((a) => (a * Math.PI) / 180);
      const R = [30, 31, 30, 29, 31, 29, 31, 30];
      const pt = (i, r) => [cx + Math.cos(ang[i]) * r, cy + Math.sin(ang[i]) * r];
      let s = '';
      // hilos de anclaje a las chinchetas
      const [ax, ay] = pt(7, R[7]), [bx, by] = pt(1, R[1]);
      s += line(`M${f1(ax)} ${f1(ay)} L7 6 M${f1(bx)} ${f1(by)} L77 6`, W, 1.3);
      let rad = '';
      ang.forEach((a, i) => { const [x, y] = pt(i, R[i]), [hx, hy] = pt(i, 3.5); rad += `M${f1(hx)} ${f1(hy)} L${f1(x)} ${f1(y)} `; });
      s += line(rad, W, 1.3);
      // la espiral: tramos que se combean hacia el centro
      [4, 11, 19, 27].forEach((r0) => {
        let d = '';
        for (let i = 0; i <= ang.length; i++) {
          const j = i % ang.length, r = r0 * (R[j] / 30);
          const [x, y] = pt(j, r);
          if (!i) { d += `M${f1(x)} ${f1(y)}`; continue; }
          const am = (ang[(i - 1) % ang.length] + ang[j] + (j === 0 ? Math.PI * 2 : 0)) / 2;
          const rm = r * 0.84;
          d += ` Q${f1(cx + Math.cos(am) * rm)} ${f1(cy + Math.sin(am) * rm)} ${f1(x)} ${f1(y)}`;
        }
        s += line(d, W, 1.1);
      });
      s += Cir(cx - 13, cy + 9, 1.2, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'shine' }) + Cir(cx + 17, cy - 12, 1, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'shine' });
      s += tack(7, 6) + tack(77, 6);
      // la arañita, colgando de su hilo
      const sx = 58, sy = 70;
      s += line(`M${sx} ${cy + 14} V${sy - 6}`, W, 1.2);
      [[-1, -3, -7], [-1, 0, -2], [-1, 3, 3], [-1, 5, 7], [1, -3, -7], [1, 0, -2], [1, 3, 3], [1, 5, 7]].forEach(([d, dy, ky]) => {
        s += line(`M${sx + d * 4} ${sy + dy * 0.6} L${sx + d * 9} ${sy + ky * 0.6 - 3} L${sx + d * 12} ${sy + ky * 0.9 + 1}`, NIGHT, 1.6);
      });
      s += part(ellD(sx, sy, 7.4, 7), NIGHT, { w: 1.6 });
      s += shine(`M${sx - 5} ${sy - 2} Q${sx - 4.4} ${sy - 5.4} ${sx - 1} ${sy - 6} Q${sx - 3.4} ${sy - 4} ${sx - 3.6} ${sy - 1.4}Z`, { opacity: 0.45 });
      s += Ell(sx - 2.6, sy - 0.6, 2, 2.3, { fill: '#FFFFFF', 'data-r': 'flat' }) + Ell(sx + 2.6, sy - 0.6, 2, 2.3, { fill: '#FFFFFF', 'data-r': 'flat' });
      s += Ell(sx - 2.3, sy - 0.1, 1.1, 1.4, { fill: INK, 'data-r': 'flat' }) + Ell(sx + 2.9, sy - 0.1, 1.1, 1.4, { fill: INK, 'data-r': 'flat' });
      s += Ell(sx - 4.4, sy + 3, 1.5, 0.9, { fill: BLUSH, 'data-r': 'flat' }) + Ell(sx + 4.4, sy + 3, 1.5, 0.9, { fill: BLUSH, 'data-r': 'flat' });
      // moñito naranja en la cabeza
      s += part(`M${sx} ${sy - 7} C${sx - 3} ${sy - 11} ${sx - 7} ${sy - 10} ${sx - 6.4} ${sy - 7} C${sx - 6} ${sy - 4.4} ${sx - 2.6} ${sy - 5} ${sx} ${sy - 7}Z M${sx} ${sy - 7} C${sx + 3} ${sy - 11} ${sx + 7} ${sy - 10} ${sx + 6.4} ${sy - 7} C${sx + 6} ${sy - 4.4} ${sx + 2.6} ${sy - 5} ${sx} ${sy - 7}Z`, PUMPKIN, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'fantasmaPeluche', name: 'Fantasmita de peluche', price: 85, w: 82, h: 96, place: 'piso', season: 'halloween',
    draw: () => {
      let s = floorSh(41, 92, 32, 5.5) + contact(41, 90, 24);
      // el cuerpo de tela, con el ruedo apoyado en el piso
      s += part('M14 84 C10 62 12 36 22 24 C30 13 52 13 60 24 C70 36 72 62 68 84 Q64 91 58 87 Q52 92 46 88 Q40 92 34 88 Q28 92 22 88 Q16 91 14 84Z', GHOST, { w: 2 });
      s += shade('M58 22 C69 36 70 62 66 86 Q63 89 59 87 C63 64 62 40 53 20Z', GHOST_SH, 0.75);
      s += shade('M28 88 Q31 82 34 88Z M40 88 Q43 82 46 88Z M52 88 Q55 82 58 87Z', GHOST_SH, 0.8);
      s += shine('M21 36 C22 28 26 22 32 19 C28 25 26 30 25 38Z', { opacity: 0.85 });
      // etiqueta de peluche
      s += part('M65 70 L71 68 L72 76 L66 77Z', BLUSH, { w: 1.2 });
      // carita
      s += Ell(31, 44, 3.6, 4.6, { fill: INK, 'data-r': 'flat' }) + Ell(51, 44, 3.6, 4.6, { fill: INK, 'data-r': 'flat' });
      s += Cir(32.2, 42.4, 1.4, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(52.2, 42.4, 1.4, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += line('M37.5 51 Q41 54.4 44.5 51', INK, 1.6);
      s += Ell(24, 51, 4.4, 2.6, { fill: BLUSH, opacity: 0.9, 'data-r': 'flat' }) + Ell(58, 51, 4.4, 2.6, { fill: BLUSH, opacity: 0.9, 'data-r': 'flat' });
      // el baldecito-calabaza que abraza
      s += line('M30 64 Q41 52 52 64', '#6E5A80', 1.6);
      s += part('M29.5 64 L52.5 64 C53.5 73 50 79 41 79 C32 79 28.5 73 29.5 64Z', PUMPKIN, { w: 1.7 });
      s += part(ellD(41, 64, 11.5, 3.8), tone(PUMPKIN, -1.6), { w: 1.4 });
      s += part(ellD(36, 62.6, 3.2, 2.6), '#FF7FA8', { w: 1.1 }) + part(ellD(45.5, 62.2, 3, 2.4), '#C9A6FF', { w: 1.1 });
      s += flat('M34 68.5 L36.6 66.6 L37.6 69.6Z M48 68.5 L45.4 66.6 L44.4 69.6Z M35.5 72.6 Q41 76 46.5 72.6 Q41 74.4 35.5 72.6Z', '#5A3420');
      s += shine('M31.6 67 Q32 72 35 75.6 Q32.4 74.6 31.2 70.6Z', { opacity: 0.5 });
      // bracitos que lo sostienen
      s += part('M22 58 C17 63 21 73 30 71 C33 69 32 64 29.5 62Z', GHOST, { w: 1.7 }) + part('M60 58 C65 63 61 73 52 71 C49 69 50 64 52.5 62Z', GHOST, { w: 1.7 });
      // moñito naranja
      s += part('M41 16 C36 9 27 10 28 16 C29 21 36 20 41 16Z M41 16 C46 9 55 10 54 16 C53 21 46 20 41 16Z', PUMPKIN, { w: 1.4 }) + part(ellD(41, 16, 2.8, 3.2), PUMPKIN_D, { w: 1.2 });
      s += Cir(33, 14.6, 1.1, { fill: '#FFE2C2', 'data-r': 'flat' }) + Cir(49.6, 14.6, 1.1, { fill: '#FFE2C2', 'data-r': 'flat' });
      return s;
    },
  },
  {
    id: 'caldero', name: 'Caldero de dulces', price: 110, w: 100, h: 98, place: 'piso', season: 'halloween',
    draw: () => {
      const IRON = '#463C5A';
      let s = glow(50, 34, 40, 26, '#B8F5A0', 0.36) + floorSh(50, 96, 42, 6) + contact(50, 93, 30);
      // patitas
      s += part('M22 84 L30 86 L28 95 Q24 97 21 94Z', tone(IRON, -0.4), { w: 1.6 }) + part('M78 84 L70 86 L72 95 Q76 97 79 94Z', tone(IRON, -0.6), { w: 1.6 });
      s += part('M45 88 L55 88 L54 98 Q50 100 46 98Z', tone(IRON, -0.5), { w: 1.6 });
      // asas de argolla a los lados
      s += part(`${ellD(11, 58, 6, 6.4)} ${ellD(11, 58, 3, 3.4)}`, tone(IRON, 0.3), { w: 1.4, a: { 'fill-rule': 'evenodd' } });
      s += part(`${ellD(89, 58, 6, 6.4)} ${ellD(89, 58, 3, 3.4)}`, tone(IRON, -0.3), { w: 1.4, a: { 'fill-rule': 'evenodd' } });
      // la panza de hierro
      s += part('M14 50 C4 60 6 82 26 89 C38 94 62 94 74 89 C94 82 96 60 86 50Z', IRON, { w: 2.2 });
      s += shade('M70 52 C86 58 90 78 72 88 C62 92 56 92 50 92 C66 86 76 74 70 52Z', tone(IRON, -1.4), 0.5);
      s += shine('M15 60 C14 70 18 79 27 85 C21 78 19 70 20 60Z', { opacity: 0.32 });
      s += flat('M12 61 C30 67 70 67 88 61 L88 65 C70 71 30 71 12 65Z', tone(IRON, 0.35));
      // el borde grueso y la boca
      s += part(ellD(50, 48, 39, 15), tone(IRON, 0.55), { w: 2 });
      s += part(ellD(50, 48, 33, 11.5), '#2A2236', { w: 1.6 });
      s += flat(ellD(50, 50.5, 31, 8.6), '#7FD46A');
      s += flat(ellD(47, 50, 22, 5.4), '#A8F08E');
      // dulces flotando: medio hundidos en la poción
      s += candy(31, 46, '#FF7FA8', -24) + candy(66, 47.5, '#FFD45C', 16) + candyCorn(50, 44, 8);
      s += flat('M22 49.5 Q31 52.5 40 49.5 Q31 51 22 49.5Z M57 50.5 Q66 53.5 75 50.5 Q66 52 57 50.5Z M43 50 Q50 52.6 57 50 Q50 51.4 43 50Z', '#7FD46A');
      // la paleta clavada
      s += tube('M76 50 L83 25', 2.6, '#F7EEE4');
      s += part(ellD(84, 20, 7, 7), '#FF8FB0', { w: 1.5 }) + line('M84 20 m-4 0 a4 4 0 1 1 4 4 a2 2 0 1 1 -2 -2', '#FFFFFF', 1.4);
      s += flat(ellD(76, 50.6, 4, 1.4), '#A8F08E');
      // burbujas
      s += part(ellD(39, 55, 3.6, 2), '#C8F7B4', { w: 1.1 }) + part(ellD(60, 56, 2.6, 1.5), '#C8F7B4', { w: 1.1 });
      s += part(ellD(42, 31, 3.6, 3.6), '#D6FAC8', { w: 1.2 }) + part(ellD(57, 21.6, 2.8, 2.8), '#D6FAC8', { w: 1.1 });
      return s;
    },
  },
  {
    id: 'farolito', name: 'Farolito embrujado', price: 70, w: 58, h: 96, place: 'sobre', season: 'halloween',
    draw: () => {
      const IRON = '#3E3550';
      let s = glow(29, 62, 30, 32, '#E7C6FF', 0.4) + glow(29, 93, 24, 5, '#E7C6FF', 0.5) + surf(29, 93, 21) + contact(29, 92.5, 16);
      // base con su tapa
      s += face(rr(10, 87, 38, 6, 2), tone(IRON, -0.2), { w: 1.7 }) + face(rr(12, 83, 34, 5, 1.5), tone(IRON, 0.5), { w: 1.6 });
      // el vidrio: la luz de adentro
      s += face(rr(14, 45, 30, 38, 2), '#E9DAFF', { w: 1.7 });
      s += flat(rr(17, 48, 24, 32, 2), '#F6EAFF') + flat(ellD(29, 61, 10, 13), '#FFF4DA') + flat(ellD(29, 59, 6, 8), '#FFFDF0');
      // la velita y su llama con carita
      s += part('M23.5 66 L34.5 66 L34.5 82 L23.5 82Z', '#FFF6EA', { w: 1.4 }) + part(ellD(29, 66, 5.5, 1.8), '#FFFFFF', { w: 1.2 });
      s += flat('M31 66 Q32.6 69 31.6 72 Q30.6 70 30.2 67Z M25.4 66.4 Q24.6 69 25.6 70.6 Q26.6 69.4 26.4 66.6Z', '#F4E3CF');
      s += part('M29 47.5 C23 55 22.6 63 29 63.6 C35.4 63 35 55 29 47.5Z', '#C99BFF', { w: 1.4 });
      s += flat('M29 52.5 C26 57 26 61.4 29 61.6 C32 61.4 32 57 29 52.5Z', '#F2E4FF');
      s += hot('M29 54 C27.4 57 27.6 60.6 29 60.8 C30.4 60.6 30.6 57 29 54Z');
      s += Cir(27.4, 58.6, 0.9, { fill: INK, 'data-r': 'flat' }) + Cir(30.6, 58.6, 0.9, { fill: INK, 'data-r': 'flat' }) + Ell(29, 60.5, 0.9, 0.6, { fill: '#E2577A', 'data-r': 'flat' });
      // marco: postes y travesaño
      s += face(rr(12, 44, 4, 40, 1), tone(IRON, 0.3), { w: 1.3 }) + face(rr(42, 44, 4, 40, 1), tone(IRON, -0.2), { w: 1.3 });
      s += shine('M18 50 L21 50 L19 70 L17 70Z', { opacity: 0.55 });
      // el techo a dos aguas con alero y la argolla
      s += face('M7 46 L29 27 L51 46 L48 48.5 L10 48.5Z', IRON, { w: 1.8 });
      s += flat('M12 44.6 L29 30 L46 44.6Z', tone(IRON, 0.45));
      s += flat(moon(28, 40, 3.2), '#FFE9A8');
      s += part(ellD(29, 26.5, 3.2, 2.6), tone(IRON, 0.5), { w: 1.3 });
      s += part(`${ellD(29, 18.5, 6, 6)} ${ellD(29, 18.5, 3.4, 3.4)}`, tone(IRON, 0.2), { w: 1.4, a: { 'fill-rule': 'evenodd' } });
      return s;
    },
  },
  {
    id: 'gatoNegro', name: 'Gatito negro de peluche', price: 85, w: 80, h: 96, place: 'piso', season: 'halloween',
    draw: () => {
      const B = '#3E3650', B2 = '#4D4462';
      let s = floorSh(40, 93, 30, 5) + contact(40, 91, 22);
      // la cola enroscada por la derecha

      // cuerpo sentadito
      s += part('M20 88 C14 76 18 58 28 52 L52 52 C62 58 66 76 60 88 Q40 93 20 88Z', B, { w: 2 });
      s += shade('M50 54 C60 60 63 76 58 88 Q54 89 51 89 C57 78 56 64 46 55Z', '#1E1828', 0.45);
      s += shade('M33 62 C30 70 31 80 34 88 L46 88 C49 80 50 70 47 62 Q40 58 33 62Z', NIGHT_HI, 0.45);
      // la cola, enroscada por delante de las patas
      s += tube('M56 80 C70 80 72 92 58 92.6 C52 92.8 47 92.4 43 91.4', 6.4, B2) + part(ellD(42.6, 91.2, 3.6, 3.2), B2, { w: 1.6 });
      // patitas de adelante
      s += part(ellD(32, 88, 6.6, 4.4), B2, { w: 1.6 }) + part(ellD(48, 87.4, 6.6, 4.4), B2, { w: 1.6 });
      s += line('M30 89.6 V87 M34 89.6 V87 M46 89 V86.4 M50 89 V86.4', '#2A2236', 1.1);
      // orejas y cabeza
      s += part('M19 32 L17 9 L36 21Z', B, { w: 1.8 }) + part('M61 32 L63 9 L44 21Z', B, { w: 1.8 });
      s += flat('M21.4 27 L20.6 14.4 L31 21.6Z', '#E89AB8') + flat('M58.6 27 L59.4 14.4 L49 21.6Z', '#E89AB8');
      s += part(ellD(40, 38, 24, 19.5), B, { w: 2 });
      s += shine('M21 32 C23 26 28 22 34 20.6 C29 24 26 28 25 33Z', { opacity: 0.22 });
      // ojos dorados
      s += part(ellD(30.5, 38, 5.8, 6.4), '#FFD45C', { w: 1.3 }) + part(ellD(49.5, 38, 5.8, 6.4), '#FFD45C', { w: 1.3 });
      s += Ell(31, 39, 2.4, 4.4, { fill: INK, 'data-r': 'flat' }) + Ell(50, 39, 2.4, 4.4, { fill: INK, 'data-r': 'flat' });
      s += Cir(28.8, 35.6, 1.5, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(47.8, 35.6, 1.5, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += part('M40 46.6 l-2.6 -2.2 h5.2Z', '#FF9EC0', { w: 1 }) + line('M36.4 49 q3.6 3 3.6 0 q0 3 3.6 0', '#C9BEDB', 1.3);
      s += Ell(25, 45.4, 3.4, 2, { fill: '#E07AA6', opacity: 0.75, 'data-r': 'flat' }) + Ell(55, 45.4, 3.4, 2, { fill: '#E07AA6', opacity: 0.75, 'data-r': 'flat' });
      s += line('M12 42 L23 44 M12 48 L23 47.4 M68 42 L57 44 M68 48 L57 47.4', '#A89EBF', 1.2);
      // moño naranja con cascabel
      s += part('M40 56 C35 50 27 51 28 56.5 C29 61.5 35 60.6 40 56Z M40 56 C45 50 53 51 52 56.5 C51 61.5 45 60.6 40 56Z', PUMPKIN, { w: 1.3 });
      s += part(ellD(40, 56, 2.7, 3), PUMPKIN_D, { w: 1.1 });
      s += part(ellD(40, 62, 3.2, 3.2), '#FFD45C', { w: 1.2 }) + line('M37.6 62.6 H42.4', '#B8862A', 1.1);
      return s;
    },
  },
  {
    id: 'banderin', name: 'Banderín de Halloween', price: 50, w: 144, h: 54, place: 'sobre', season: 'halloween',
    draw: () => {
      const str = sagging(6, 138, 7, 16);
      let s = '';
      const flags = [
        [17, PUMPKIN, 'jack'], [39, '#8E6FE0', 'moon'], [61, NIGHT, 'ghost'],
        [83, PUMPKIN, 'star'], [105, '#8E6FE0', 'bat'], [127, NIGHT, 'jack2'],
      ];
      flags.forEach(([x, c, m]) => {
        const [y, sl] = str.at(x);
        const a = Math.atan(sl), ca = Math.cos(a), sa = Math.sin(a);
        const L = [x - 10.6 * ca, y - 10.6 * sa], Rr = [x + 10.6 * ca, y + 10.6 * sa];
        const tip = [x + 1, y + 29];
        // la tela, con el doblez sobre el cordel
        s += part(`M${f1(L[0])} ${f1(L[1])} L${f1(Rr[0])} ${f1(Rr[1])} Q${f1(x + 7.6)} ${f1(y + 15.5)} ${f1(tip[0])} ${f1(tip[1])} Q${f1(x - 6.6)} ${f1(y + 15.5)} ${f1(L[0])} ${f1(L[1])}Z`, c, { w: 1.5 });
        s += flat(`M${f1(L[0] + 0.6)} ${f1(L[1] + 0.4)} L${f1(Rr[0] - 0.6)} ${f1(Rr[1] + 0.4)} L${f1(Rr[0] - 1.2)} ${f1(Rr[1] + 3.4)} L${f1(L[0] + 1.2)} ${f1(L[1] + 3.4)}Z`, tone(c, -0.7));
        const mx = x + 0.4, my = y + 12;
        if (m === 'jack' || m === 'jack2') {
          const fc = m === 'jack' ? '#5A2E1A' : '#FFB347';
          s += flat(`M${mx - 5} ${my - 0.6} L${mx - 2.4} ${my - 3.6} L${mx - 1} ${my - 0.4}Z M${mx + 5} ${my - 0.6} L${mx + 2.4} ${my - 3.6} L${mx + 1} ${my - 0.4}Z M${mx - 5} ${my + 2} Q${mx} ${my + 6.6} ${mx + 5} ${my + 2} Q${mx} ${my + 4} ${mx - 5} ${my + 2}Z`, fc);
        } else if (m === 'moon') s += flat(moon(mx - 1, my, 5.4), '#FFF3C4');
        else if (m === 'star') s += flat(star(mx, my, 5.8), '#FFE07A');
        else if (m === 'ghost') {
          s += flat(`M${mx - 4.4} ${my + 6} C${mx - 5} ${my} ${mx - 4} ${my - 5} ${mx} ${my - 5} C${mx + 4} ${my - 5} ${mx + 5} ${my} ${mx + 4.4} ${my + 6} L${mx + 2.2} ${my + 4.6} L${mx} ${my + 6} L${mx - 2.2} ${my + 4.6}Z`, '#FBF7FF');
          s += Cir(mx - 1.6, my - 0.8, 0.9, { fill: INK, 'data-r': 'flat' }) + Cir(mx + 1.6, my - 0.8, 0.9, { fill: INK, 'data-r': 'flat' });
        } else if (m === 'bat') {
          s += flat(`M${mx} ${my - 1} L${mx - 2} ${my - 4} L${mx - 2.4} ${my - 1} C${mx - 5} ${my - 4} ${mx - 8} ${my - 3} ${mx - 9} ${my} Q${mx - 6} ${my} ${mx - 5} ${my + 2} Q${mx - 3} ${my + 0.6} ${mx - 1.6} ${my + 3} L${mx} ${my + 4} L${mx + 1.6} ${my + 3} Q${mx + 3} ${my + 0.6} ${mx + 5} ${my + 2} Q${mx + 6} ${my} ${mx + 9} ${my} C${mx + 8} ${my - 3} ${mx + 5} ${my - 4} ${mx + 2.4} ${my - 1} L${mx + 2} ${my - 4}Z`, '#2E2840');
        }
      });
      s += line(str.d, TWINE, 1.6);
      s += tack(6, 7) + tack(138, 7);
      return s;
    },
  },
  {
    id: 'escoba', name: 'Escoba de bruja', price: 60, w: 62, h: 124, place: 'piso', season: 'halloween',
    draw: () => {
      const WOOD = '#A8774E';
      let s = floorSh(30, 121, 25, 4) + contact(30, 119.6, 18);
      // el palo torcido, con su nudo arriba y la veta
      s += tube('M40 9 C42 18 36 30 36 46 C36 62 33 78 31 96', 6.4, WOOD);
      s += line('M39.6 14 C40 22 37 32 37 46 M36.4 56 C36 66 34.4 76 33 86', tone(WOOD, 0.9), 1.1, { opacity: 0.85 });
      s += part(ellD(39.6, 8.4, 4.4, 3.6), tone(WOOD, -0.2), { w: 1.5 }) + part(ellD(38.4, 7.4, 1.8, 1.3), tone(WOOD, 0.8), { w: 1 });
      s += part('M36.5 42 C33 40 31.5 37 32.4 35 C34.6 36 36 38.6 37 40Z', WOOD, { w: 1.2 });
      // dije de estrella colgando de un hilito
      s += line('M41 13 Q44.6 18 45.6 25', '#8C7AA6', 1.1) + part(star(46, 29.5, 5.2), '#FFD45C', { w: 1.2 }) + Cir(44.8, 28.6, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
      // las pajas, abiertas en abanico
      s += part('M26 94 C18 101 9 110 7 120 L12 117.6 L15 121.4 L19 118 L23 122 L27 118.6 L31 122.4 L35 118.6 L39 122 L43 118.4 L47 121.4 L50 117.6 L54 120 C51 110 44 101 36 94Z', '#EBC86E', { w: 1.9 });
      s += line('M14 116 C17 108 21 102 27 98 M21 118 C23 110 26 104 29 99 M30 119 C30 111 31 105 32 99 M38 118 C37 111 35 105 34 99 M46 117 C43 109 39 103 35 98', '#C59B3E', 1.2);
      s += shade('M40 98 C46 104 51 111 53 119 L50 117.6 L47 121.4 L45 119 C44 111 40 104 36 99Z', '#B07A2C', 0.4);
      s += shine('M24 99 C20 103 16 108 14 113 C18 109 21 104 26 100Z', { opacity: 0.45 });
      // amarre de cinta morada con moño
      s += part('M24.6 91.4 L37.6 95.4 L36.4 101 L23 97Z', '#8E6FE0', { w: 1.5 }) + line('M25 94.2 L37 97.8', '#B49BF0', 1.1, { opacity: 0.9 });
      s += part('M30 97.6 C25 93 19 95 21 99 C23 102 27 100.6 30 97.6Z M30 97.6 C35 95 40 98 37.6 101.4 C35.6 104 32 101.6 30 97.6Z', '#A88BF5', { w: 1.2 });
      s += part('M29 98.6 L26 106 L28.6 105 L30 107.4 L31 99.4Z', '#8E6FE0', { w: 1.1 }) + part(ellD(30, 97.8, 2, 2), '#C9B4FF', { w: 1 });
      return s;
    },
  },
];
