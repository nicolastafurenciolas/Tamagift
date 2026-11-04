// Paredes del cuarto. Cada diseño tiene varios colores para elegir; la
// pared se ve de frente (sin perspectiva), con la luz que baja del techo,
// una cornisa arriba y el zócalo con su moldura abajo.
//
// Reglas para que se vean bien en pixel art (1 píxel de arte ≈ 1.7–2.5
// unidades del mundo): motivos de 14 unidades o más, trazos de 2.5 o
// más, líneas largas horizontales o verticales, y nada al azar suelto:
// los papeles se arman con un módulo pensado a mano que se repite (como
// un papel tapiz de verdad), no con puntos tirados. Lo chiquito (puntos,
// estrellitas, florcitas) usa los sellos hechos a mano de pixelStamps.js.
//
// Rendimiento: el kit de pixel rasteriza pieza por pieza sobre toda la
// pared (1600 de ancho). Por eso todo lo del mismo color y la misma capa
// va junto en UN solo trazo (`brush`): un muro de 400 ladrillos son
// media docena de piezas, no mil.

import { E, G, flat, line, shade, rr, tone, mix, isDark, svgDoc } from './draw.js';

const T = (id, name, c, bb) => ({ id, name, c, bb });
const f1 = (n) => +n.toFixed(1);
// Solo en pixel / en todos menos pixel.
const onlyPx = (inner) => G({ 'data-only': 'pixel' }, inner);
const noPx = (inner) => G({ 'data-skip': 'pixel' }, inner);
// Azar fijo por celda (el mismo dibujo siempre, sin depender del orden).
const hash = (a, b = 0, s = 0) => {
  let h = (a * 374761393 + b * 668265263 + s * 1103515245) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Pincel por capas: junta en un solo trazo lo del mismo color y capa, y
// lo devuelve de la capa 0 a la última (en cada capa, en el orden en que
// apareció cada color).
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
    tone(d, color, o, k = 0) { add(k, `t${color}${o}`, d, (dd) => shade(dd, color, o)); },
    put(markup, k = 0) { const m = (layers[k] = layers[k] || new Map()); m.set(`r${m.size}`, { d: '', mk: () => markup }); },
    out() { let s = ''; layers.forEach((m) => m && m.forEach((e) => { s += e.mk(e.d); })); return s; },
  };
}

// Formas como trazo (para poder juntarlas).
const circ = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
const ell = (x, y, rx, ry) => `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;
const rect = (x, y, w, h) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const heart = (x, y, s) => `M${x} ${f1(y + s * 0.9)}C${f1(x - s * 1.15)} ${f1(y + s * 0.05)} ${f1(x - s * 1.05)} ${f1(y - s)} ${x} ${f1(y - s * 0.35)}C${f1(x + s * 1.05)} ${f1(y - s)} ${f1(x + s * 1.15)} ${f1(y + s * 0.05)} ${x} ${f1(y + s * 0.9)}Z`;
const star = (x, y, r, k = 0.45, n = 5) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const q = i % 2 ? r * k : r;
    d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * q)} ${f1(y + Math.sin(a) * q)}`;
  }
  return `${d}Z`;
};
// Destello de cuatro puntas (cóncavo).
const sparkle = (x, y, r) => `M${x} ${y - r}Q${f1(x + r * 0.16)} ${f1(y - r * 0.16)} ${x + r} ${y}Q${f1(x + r * 0.16)} ${f1(y + r * 0.16)} ${x} ${y + r}Q${f1(x - r * 0.16)} ${f1(y + r * 0.16)} ${x - r} ${y}Q${f1(x - r * 0.16)} ${f1(y - r * 0.16)} ${x} ${y - r}Z`;
// Luna creciente (la panza a la izquierda).
const crescent = (x, y, r) => `M${f1(x + r * 0.5)} ${f1(y - r * 0.866)}A${r} ${r} 0 1 0 ${f1(x + r * 0.5)} ${f1(y + r * 0.866)}A${f1(r * 0.95)} ${f1(r * 0.95)} 0 0 1 ${f1(x + r * 0.5)} ${f1(y - r * 0.866)}Z`;
// Hoja: lanza desde (x,y) con ángulo, largo y medio ancho.
const leafD = (x, y, ang, len, w) => {
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * w * 1.9, ny = Math.cos(a) * w * 1.9;
  const mx = (x + ex) / 2, my = (y + ey) / 2;
  return `M${f1(x)} ${f1(y)}Q${f1(mx + nx)} ${f1(my + ny)} ${f1(ex)} ${f1(ey)}Q${f1(mx - nx)} ${f1(my - ny)} ${f1(x)} ${f1(y)}Z`;
};
const flowerD = (x, y, r, rot = 0) => {
  let d = '';
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 - 90 + rot) * Math.PI) / 180;
    d += circ(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.48);
  }
  return d;
};

// Motivo que en pixel art se pinta con un sello hecho a mano; los demás
// estilos dibujan el vector con su kit. En pixel el sello va encima de
// todo y sin recorte: el que se asoma por arriba o por abajo pisaría la
// cornisa o el zócalo, así que ese va como vector (recortado) al pincel.
// `parts`: [[trazo, color], …] (el primero define la caja del sello).
function motif(b, name, c1, c2, parts, y, r, h, k = 1) {
  if (y - r < 1 || y + r > h - 1) { parts.forEach(([d, col]) => b.fill(d, col, 1, k)); return; }
  const inner = parts.map(([d, col]) => flat(d, col)).join('');
  b.put(onlyPx(G({ 'data-px': `motif.${name}`, 'data-c1': c1, 'data-c2': c2 || c1 }, flat(parts[0][0], parts[0][1]))), k);
  b.put(noPx(inner), k);
}

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
    // Pintura mate en dos tonos: arriba el color, abajo un pelín más
    // hondo, y entre los dos un listón pintado (con su canto de luz y su
    // sombra) a la altura de una silla: la pared lisa queda pensada, no
    // vacía.
    draw: (w, h, c) => {
      const b = brush();
      const top = Math.round(h * 0.6);
      const dark = isDark(c[0]);
      const rail = dark ? tone(c[0], -0.7) : mix('#FFFFFF', c[0], 0.35);
      b.fill(rect(0, top, w, h - top), tone(c[0], dark ? -0.12 : -0.07));
      b.tone(rect(0, top + 7, w, 5), '#2A1C24', 0.1, 1);
      b.fill(rect(0, top - 4, w, 11), rail, 1, 2);
      b.fill(rect(0, top - 4, w, 2.4), tone(rail, -0.7), 1, 3);
      b.fill(rect(0, top - 1.6, w, 2.4), tone(rail, 0.6), 1, 3);
      b.fill(rect(0, top + 4.6, w, 2.4), tone(rail, -0.45), 1, 3);
      return b.out();
    },
  },
  {
    id: 'rayas', name: 'Papel de rayas', price: 90, tags: ['dulce', 'elegante'],
    tints: [
      T('rosa', 'Rosa', ['#FBE6EB', '#F3CCD7', '#FFFFFF']), T('menta', 'Menta', ['#E6F4EC', '#C6E6D4', '#FFFFFF']),
      T('miel', 'Miel', ['#FBEFE0', '#EBD0AE', '#FFFFFF']), T('celeste', 'Celeste', ['#E6F0FA', '#C8DDF1', '#FFFFFF']),
      T('lila', 'Lila', ['#EFE9FA', '#D7CCF1', '#FFFFFF']), T('carbon', 'Carbón', ['#433F4A', '#37333D', '#5A5562']),
    ],
    // Rayas "regencia": una franja ancha de color con su filete de un tono
    // más hondo a cada lado, y en la franja clara dos hilos finos.
    draw: (w, h, c) => {
      const b = brush();
      const edge = tone(c[1], -0.35);
      for (let x = 0; x < w; x += 64) {
        b.fill(rect(x + 32, 0, 28, h), c[1]);
        b.fill(rect(x + 32, 0, 3, h) + rect(x + 57, 0, 3, h), edge, 1, 1);
        // los hilos son trazos: en neón se encienden como tubitos
        b.stroke(`M${x + 12.5} 0V${h}M${x + 19.5} 0V${h}`, c[2], 3, 1, 1);
      }
      return b.out();
    },
  },
  {
    id: 'lunares', name: 'Papel de lunares', price: 90, tags: ['dulce', 'y2k'],
    tints: [
      T('rosa', 'Rosa', ['#FCE4EB', '#EE9BB2']), T('crema', 'Crema', ['#F8EBD8', '#D9A877']), T('menta', 'Menta', ['#DDF1E6', '#FFFFFF']),
      T('lavanda', 'Lavanda', ['#E6DEF7', '#FFFFFF']), T('noche', 'Noche', ['#2C3458', '#F2D98B']),
    ],
    // lunar grande al tresbolillo y, en el medio de cada rombo, uno chiquito
    draw: (w, h, c) => {
      const b = brush();
      const small = mix(c[1], c[0], 0.3);
      for (let r = 0, y = 26; y < h + 20; r++, y += 26) {
        const big = r % 2 === 0;
        for (let x = ((r >> 1) % 2 ? 30 : 0) + (big ? 14 : 44); x < w + 20; x += 60) {
          if (big) {
            motif(b, 'dot', c[1], null, [[circ(x, y, 10.5), c[1]]], y, 10.5, h);
            b.put(noPx(flat(circ(x - 3.6, y - 3.6, 2.8), '#FFFFFF', { opacity: 0.55 })), 1);
          } else motif(b, 'dot', small, null, [[circ(x, y, 3.4), small]], y, 3.4, h);
        }
      }
      return b.out();
    },
  },
  {
    id: 'flores', name: 'Papel floreado', price: 120, tags: ['dulce', 'hippie', 'rustico'],
    tints: [
      T('crema', 'Crema', ['#F8EEDD', '#F2A7B5', '#FFD97A', '#9CC79A']), T('celeste', 'Celeste', ['#DCEBF6', '#FFFFFF', '#F7CF6B', '#8DBF9E']),
      T('salvia', 'Salvia', ['#D5E2CC', '#FFF6E5', '#F2B36B', '#6E9C6E']), T('rosa', 'Rosa', ['#F8DCE3', '#FFFFFF', '#F7C96B', '#93C49B']),
      T('noche', 'Noche', ['#2E2E4A', '#F2A7C4', '#F7D98B', '#6F9C8A']),
    ],
    // Florcitas "ditsy": cada flor con dos hojas ladeadas, y entre flor y
    // flor un pimpollo con su hojita. (La flor mide ~21 unidades: así su
    // sello de 7×7 no se agranda al doble en el cuarto y queda del mismo
    // grano que las hojas.)
    draw: (w, h, c) => {
      const b = brush();
      const leaf = c[3], leaf2 = tone(c[3], 0.3), bud = mix(c[1], c[2], 0.25);
      for (let r = 0, y = 34; y < h + 30; r++, y += 56) {
        for (let i = 0, x = (r % 2 ? 40 : 0) + 20; x < w + 30; i++, x += 80) {
          const t = (r + i) % 2 ? 1 : -1;
          b.fill(leafD(x + t * 3, y + 6, 90 - 60 * t, 13, 4), leaf);
          b.fill(leafD(x - t * 3, y + 7, 90 + 68 * t, 11, 3.6), leaf2);
          motif(b, 'flower', c[1], c[2], [[flowerD(x, y, 10, t * 12), c[1]], [circ(x, y, 3.4), c[2]]], y, 11, h, 1);
          const bx = x + 40, by = y + 28;
          if (by + 10 < h) {
            b.fill(leafD(bx, by + 3, 90 + 34 * t, 10, 3.2), leaf);
            motif(b, 'dot', bud, null, [[circ(bx, by, 4), bud]], by, 4, h, 1);
          }
        }
      }
      return b.out();
    },
  },
  {
    id: 'vichy', name: 'Papel vichy', price: 110, tags: ['dulce', 'rustico'],
    tints: [
      T('rojo', 'Rojo', ['#FBF2EE', '#D9545A']), T('rosa', 'Rosa', ['#FDF1F4', '#EE8FAA']), T('azul', 'Azul', ['#F2F6FB', '#6F96CF']),
      T('verde', 'Verde', ['#F1F7F0', '#6FAE78']), T('mostaza', 'Mostaza', ['#FBF5E6', '#D9A93E']),
    ],
    // Cuadrillé de tres valores parejos (fondo, franja y cruce): se lee
    // como tela tejida, sin transparencias que ensucien.
    draw: (w, h, c) => {
      const b = brush();
      const S = 32, B = 16;
      const half = mix(c[0], c[1], 0.36), full = mix(c[0], c[1], 0.7);
      for (let x = 0; x < w; x += S) b.fill(rect(x, 0, B, h), half);
      for (let y = 0; y < h; y += S) b.fill(rect(0, y, w, B), half);
      for (let x = 0; x < w; x += S) for (let y = 0; y < h; y += S) b.fill(rect(x, y, B, B), full, 1, 1);
      return b.out();
    },
  },
  {
    id: 'corazones', name: 'Papel de corazones', price: 110, tags: ['dulce', 'princesa', 'y2k'],
    tints: [
      T('rosa', 'Rosa', ['#FCE7EE', '#F08FAD']), T('lila', 'Lila', ['#EEE6FA', '#B79BE6']), T('crema', 'Crema', ['#FAEFE3', '#E98A84']),
      T('vino', 'Vino', ['#4E2231', '#C9506E']),
    ],
    // corazones al tresbolillo, uno pleno y uno más suave, con puntitos
    draw: (w, h, c) => {
      const b = brush();
      const soft = mix(c[1], c[0], 0.42);
      for (let r = 0, y = 32; y < h + 24; r++, y += 54) {
        for (let i = 0, x = (r % 2 ? 34 : 0) + 18; x < w + 24; i++, x += 68) {
          const col = (r + i) % 2 ? soft : c[1];
          motif(b, 'heart', col, null, [[heart(x, y, 11), col]], y, 11, h);
          b.put(noPx(flat(circ(x - 5, y - 3, 2.2), '#FFFFFF', { opacity: 0.5 })), 1);
          motif(b, 'dot', soft, null, [[circ(x + 34, y + 2, 2.6), soft]], y + 2, 2.6, h);
        }
      }
      return b.out();
    },
  },
  {
    id: 'estrellas', name: 'Cielo estrellado', price: 140, tags: ['aesthetic', 'gotico', 'y2k'],
    tints: [
      T('noche', 'Noche', ['#222B4A', '#F7E39A', '#8FA0D6']), T('morado', 'Morado', ['#2E2148', '#F4D2FF', '#9D7BD6']),
      T('negro', 'Negro', ['#18161D', '#E9E4F2', '#6E6880']), T('celeste', 'Día', ['#CFE6F7', '#FFFFFF', '#FFF2B0']),
    ],
    // Un módulo de 200×160 armado a mano: estrellas grandes, chiquitas y
    // puntitos de dos colores, y una luna cada dos módulos.
    draw: (w, h, c) => {
      const b = brush();
      const big = [[30, 34, 9], [128, 98, 10], [178, 20, 8.5], [72, 140, 8]];
      const small = [[88, 28], [20, 108], [160, 140], [62, 76], [146, 58]];
      const dots = [[54, 14, 1], [112, 46, 0], [10, 70, 1], [96, 126, 0], [190, 92, 1], [38, 154, 0], [124, 150, 1], [180, 118, 0], [150, 8, 0]];
      for (let ty = 0, j = 0; ty < h; ty += 160, j++) {
        for (let tx = 0, i = 0; tx < w + 20; tx += 200, i++) {
          big.forEach(([x, y, r]) => motif(b, 'star', c[1], null, [[star(tx + x, ty + y, r, 0.46), c[1]]], ty + y, r, h));
          small.forEach(([x, y], k) => { const col = k % 2 ? c[2] : c[1]; motif(b, 'star', col, null, [[star(tx + x, ty + y, 4.2, 0.5), col]], ty + y, 4.2, h); });
          dots.forEach(([x, y, k]) => { const col = k ? c[1] : c[2]; motif(b, 'dot', col, null, [[circ(tx + x, ty + y, 1.6), col]], ty + y, 1.6, h); });
          if ((i + j) % 2 === 0 && ty + 82 < h) b.fill(crescent(tx + 104, ty + 64, 12.5), c[1]);
        }
      }
      return b.out();
    },
  },
  {
    id: 'zocalo', name: 'Media pared de madera', price: 150, tags: ['elegante', 'rustico'],
    tints: [
      T('crema', 'Crema y miel', ['#F6E9D6', '#C99566']), T('salvia', 'Salvia y nogal', ['#D2DDC6', '#8A5D3F']),
      T('celeste', 'Celeste y blanco', ['#D8E8F4', '#F4F1EA']), T('rosa', 'Rosa y blanco', ['#F7DCE3', '#F6F1EC']),
      T('bosque', 'Bosque y nogal', ['#3F5A47', '#7A5236']), T('vino', 'Vino y negro', ['#5B2834', '#2E2830']),
    ],
    // Boiserie: tablero con paneles en relieve (el marco hundido: bisel
    // oscuro arriba y a la izquierda, claro abajo y a la derecha) y el
    // guardasilla encima con su sombra.
    draw: (w, h, c) => {
      const b = brush();
      const top = Math.round(h * 0.56);
      const wd = c[1];
      const lt = tone(wd, 0.8), dk = tone(wd, -0.85), dk2 = tone(wd, -1.1);
      b.fill(rect(0, top, w, h - top), wd);
      b.tone(rect(0, top + 8, w, 5), '#2A1C24', 0.16, 1);
      const PW = 80, y0 = top + 22, y1 = h - 12;
      for (let x = 0; x < w; x += PW) {
        const px = x + 9, pw = PW - 18;
        b.fill(`M${px} ${y0}h${pw}l-5 5h${-(pw - 10)}Z` + `M${px} ${y0}l5 5v${y1 - y0 - 10}l-5 5Z`, dk, 1, 2);
        b.fill(`M${px} ${y1}l5 -5h${pw - 10}l5 5Z` + `M${px + pw} ${y0}l-5 5v${y1 - y0 - 10}l5 5Z`, lt, 1, 2);
        b.fill(rr(px + 5, y0 + 5, pw - 10, y1 - y0 - 10, 1), tone(wd, 0.12), 1, 3);
        b.fill(rect(px + 8, y0 + 8, pw - 16, 2.6), tone(wd, 0.8), 0.8, 4);
        b.fill(rect(px + 8, y1 - 10, pw - 16, 2.6), dk, 0.5, 4);
      }
      // guardasilla: listón con su canto de luz, su cara y su sombra
      b.fill(rect(0, top - 7, w, 15), tone(wd, 0.35), 1, 5);
      b.fill(rect(0, top - 7, w, 2.6), dk2, 0.55, 6);
      b.fill(rect(0, top - 4.4, w, 3), tone(wd, 1.1), 0.85, 6);
      b.fill(rect(0, top + 4, w, 4), dk2, 0.5, 6);
      return b.out();
    },
  },
  {
    id: 'ladrillo', name: 'Ladrillo', price: 140, tags: ['rockero', 'punk', 'rustico'],
    tints: [
      T('rojo', 'Rojo', ['#E1D2C2', '#B8644A', '#A6553E', '#C7745A']), T('blanco', 'Pintado de blanco', ['#D9D2CA', '#F1ECE6', '#E7E1DA', '#F7F3EE']),
      T('gris', 'Gris', ['#BDB7BE', '#8D8792', '#7E7884', '#9B96A0']), T('crema', 'Crema', ['#E6DAC6', '#D9BE96', '#CBAF86', '#E4CCA8']),
      T('negro', 'Negro', ['#2B282F', '#45414B', '#3B3841', '#504B57']),
    ],
    // Aparejo a soga: la mayoría del color del ladrillo, alguno más hondo
    // o más claro, cada uno con su canto de luz arriba y su sombra abajo,
    // y la junta hundida.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, 0, w, h), tone(c[0], -0.15));
      const bw = 48, bh = 20, g = 4;
      for (let row = 0, y = 2; y < h; row++, y += bh + g) {
        for (let i = 0, x = (row % 2 ? -(bw + g) / 2 : 0); x < w; i++, x += bw + g) {
          const r = hash(i, row, 19);
          const col = r < 0.6 ? c[1] : r < 0.82 ? c[2] : c[3];
          b.fill(rr(x, y, bw, bh, 2), col, 1, 1);
          b.fill(rect(x + 2, y, bw - 4, 3), tone(col, 0.55), 0.85, 2);
          b.fill(rect(x + 2, y + bh - 3.4, bw - 4, 3.4), tone(col, -0.5), 0.8, 2);
        }
        b.tone(rect(0, y + bh, w, 2.4), '#2A1C24', 0.16, 3);
      }
      return b.out();
    },
    noBase: true,
  },
  {
    id: 'tablas', name: 'Paneles de madera', price: 130, tags: ['rustico', 'hippie'],
    tints: [
      T('miel', 'Miel', ['#C99A69']), T('nogal', 'Nogal', ['#8A5E40']), T('blanco', 'Blanco', ['#EEE8E0']),
      T('gris', 'Gris', ['#A8A1A3']), T('menta', 'Pintado menta', ['#BFE0CF']),
    ],
    // Machimbre: tablas verticales con la junta en V (sombra a la
    // izquierda, canto de luz a la derecha), una o dos vetas largas que
    // ondulan apenas y, de vez en cuando, un nudo con su aro.
    draw: (w, h, c) => {
      const b = brush();
      const B = 38;
      const vein = tone(c[0], -0.6), joint = mix(tone(c[0], -1), '#2E2024', 0.35), lit = tone(c[0], 0.8);
      const tones = [tone(c[0], -0.1), c[0], tone(c[0], 0.1)];
      for (let x = 0, i = 0; x < w; x += B, i++) {
        const k = hash(i, 0, 31);
        const col = tones[Math.floor(k * 3)];
        b.fill(rect(x, 0, B, h), col);
        const n = k > 0.45 ? 2 : 1;
        for (let v = 0; v < n; v++) {
          const vx = x + 12 + v * 13 + hash(i, v, 5) * 4;
          let d = `M${f1(vx)} 0`;
          for (let y = 0; y < h; y += 60) d += `Q${f1(vx + (hash(i, y, v) - 0.5) * 6)} ${y + 30} ${f1(vx + (hash(i, y + 60, v) - 0.5) * 2)} ${y + 60}`;
          b.stroke(d, vein, 2, 0.32, 1);
        }
        if (hash(i, 1, 9) < 0.22) {
          const ky = 50 + hash(i, 2, 9) * (h - 110), kx = x + 14 + hash(i, 3, 9) * 10;
          b.fill(ell(kx, ky, 6, 10), tone(c[0], -0.32), 1, 2);
          b.fill(ell(kx, ky, 2.8, 5), tone(c[0], -0.95), 1, 3);
        }
        b.fill(rect(x, 0, 3, h), joint, 0.85, 4);
        b.fill(rect(x + 3, 0, 2.4, h), lit, 0.55, 4);
      }
      return b.out();
    },
    noBase: true,
  },
  {
    id: 'azulejos', name: 'Azulejos', price: 120, tags: ['aesthetic', 'elegante'],
    tints: [
      T('blanco', 'Blanco', ['#D9D4D0', '#F6F4F1']), T('menta', 'Menta', ['#B9D9C8', '#D9F0E3']), T('rosa', 'Rosa', ['#E9C3CD', '#FBE3E9']),
      T('azul', 'Azul', ['#9FB5D6', '#CCDCF1']), T('negro', 'Negro', ['#1F1D22', '#3A3640']),
    ],
    // Azulejo de metro biselado: canto de luz arriba, sombra abajo y un
    // reflejo de esmalte en la esquina.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, 0, w, h), c[0]);
      const tw = 44, th = 22, g = 3;
      const lo = tone(c[1], -0.45), hi = tone(c[1], 0.8);
      for (let row = 0, y = 1; y < h; row++, y += th + g) {
        for (let x = (row % 2 ? -(tw + g) / 2 : 0); x < w; x += tw + g) {
          b.fill(rr(x, y, tw, th, 3), c[1], 1, 1);
          b.fill(rect(x + 3, y + th - 3.5, tw - 6, 3), lo, 0.8, 2);
          b.fill(rect(x + 3, y + 1.5, tw - 6, 2.6), hi, 0.8, 2);
          b.gloss(rect(x + 5, y + 6, 9, 3), isDark(c[1]) ? 0.3 : 0.75, 3);
        }
      }
      return b.out();
    },
    noBase: true,
  },
  {
    id: 'piedra', name: 'Muro de piedra', price: 150, tags: ['gotico', 'metalero', 'rustico'],
    tints: [
      T('gris', 'Gris', ['#6E6A72', '#9A949D', '#8B8590', '#A8A3AB']), T('arena', 'Arena', ['#9C8A70', '#CDB894', '#C1AB86', '#D8C5A3']),
      T('musgo', 'Musgo', ['#5D665A', '#8E9887', '#7F8A79', '#9DA594']), T('oscura', 'Oscura', ['#2A272E', '#4C4752', '#423E48', '#56515D']),
    ],
    // Piedras de cantera de tamaños distintos, con canto de luz arriba,
    // un filo claro a la izquierda y la panza en sombra.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, 0, w, h), c[0]);
      for (let y = 2, row = 0; y < h; row++) {
        const bh = 32 + Math.round(hash(row, 0, 43) * 8);
        let x = row % 2 ? -30 : -8, i = 0;
        while (x < w) {
          const bw = 54 + Math.round(hash(i, row, 41) * 42);
          const r = hash(i, row, 47);
          const col = r < 0.5 ? c[1] : r < 0.8 ? c[2] : c[3];
          const rad = 8 + hash(i, row, 3) * 5;
          b.fill(rr(x + 2, y + 2, bw - 4, bh - 4, rad), col, 1, 1);
          b.fill(rr(x + 4, y + bh - 12, bw - 8, 8, 5), tone(col, -0.55), 0.85, 2);
          b.fill(rr(x + 9, y + 4, bw - 24, 4, 2), tone(col, 0.7), 0.85, 2);
          b.fill(rr(x + 5, y + 9, 3.6, bh - 24, 1.8), tone(col, 0.4), 0.55, 2);
          x += bw; i++;
        }
        y += bh;
      }
      return b.out();
    },
    noBase: true,
  },
  {
    id: 'ondas', name: 'Ondas setenteras', price: 130, tags: ['hippie', 'aesthetic'],
    tints: [
      T('setentero', 'Setentero', ['#F4E3C3', '#E9A13B', '#D2602F', '#7A4A2A']), T('pastel', 'Pastel', ['#FBF0F4', '#F5B8C9', '#C5B3EC', '#9ED7C2']),
      T('mar', 'Mar', ['#EAF4F2', '#7FC4C8', '#3E8E9A', '#F1C27A']),
    ],
    // Tres franjas pegadas que ondulan juntas, como un papel de los 70:
    // ondas largas y bajitas para que en pixel los escalones sean parejos.
    draw: (w, h, c) => {
      const b = brush();
      const L = 128, A = 7;
      const wave = (y) => {
        let d = `M-${L} ${y}`;
        for (let x = -L, k = 0; x <= w + L; x += L / 2, k++) d += `Q${x + L / 4} ${f1(y + (k % 2 ? A : -A) * 1.9)} ${x + L / 2} ${y}`;
        return d;
      };
      const band = (y, th) => `${wave(y)}L${w + L * 2} ${y + th}L-${L} ${y + th}Z`;
      for (let y = 18, k = 0; y < h + 20; y += 80, k += 4) {
        b.fill(band(y, 50), c[1], 1, k);
        b.fill(band(y + 16, 34), c[2], 1, k + 1);
        b.fill(band(y + 32, 18), c[3], 1, k + 2);
        b.stroke(wave(y + 3.5), tone(c[1], 0.8), 2.6, 0.75, k + 3);
      }
      return b.out();
    },
  },
  {
    id: 'nubes', name: 'Mural de nubes', price: 160, tags: ['dulce', 'angelical', 'aesthetic'],
    tints: [
      T('dia', 'Día', ['#BFDDF5', '#FFFFFF', '#E1EEF9']), T('atardecer', 'Atardecer', ['#F8CFC2', '#FFF4EC', '#F9DFD3']),
      T('noche', 'Noche', ['#2B3460', '#9A8FCB', '#4D4A84']), T('rosa', 'Algodón', ['#F6D3E2', '#FFFFFF', '#FBE6EF']),
    ],
    // Un cielo pintado: se aclara hacia abajo en franjas y las nubes,
    // puestas a mano en dos planos, tienen copete luminoso y la panza en
    // sombra. Las de atrás son más chicas y se funden con el cielo.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, Math.round(h * 0.52), w, h), mix(c[0], c[2], 0.45));
      b.fill(rect(0, Math.round(h * 0.76), w, h), mix(c[0], c[2], 0.85), 1, 1);
      const cloud = (x, y, k, col, belly, layer) => {
        const d = `M${f1(x - 44 * k)} ${y}C${f1(x - 54 * k)} ${f1(y - 4 * k)} ${f1(x - 50 * k)} ${f1(y - 22 * k)} ${f1(x - 32 * k)} ${f1(y - 20 * k)}`
          + `C${f1(x - 30 * k)} ${f1(y - 38 * k)} ${f1(x - 6 * k)} ${f1(y - 44 * k)} ${f1(x + 6 * k)} ${f1(y - 30 * k)}`
          + `C${f1(x + 14 * k)} ${f1(y - 46 * k)} ${f1(x + 42 * k)} ${f1(y - 40 * k)} ${f1(x + 40 * k)} ${f1(y - 20 * k)}`
          + `C${f1(x + 56 * k)} ${f1(y - 22 * k)} ${f1(x + 60 * k)} ${f1(y - 2 * k)} ${f1(x + 48 * k)} ${y}Z`;
        b.fill(d, col, 1, layer);
        b.fill(`M${f1(x - 44 * k)} ${f1(y - 7 * k)}H${f1(x + 50 * k)}V${y}H${f1(x - 44 * k)}Z`, belly, 1, layer + 1);
        b.fill(`M${f1(x - 18 * k)} ${f1(y - 30 * k)}c${f1(5 * k)} ${f1(-5 * k)} ${f1(14 * k)} ${f1(-6 * k)} ${f1(19 * k)} ${f1(-1 * k)}c${f1(-6 * k)} ${f1(-1 * k)} ${f1(-12 * k)} 0 ${f1(-19 * k)} ${f1(1 * k)}Z`, '#FFFFFF', 0.85, layer + 1);
      };
      const front = c[1], back = mix(c[1], c[0], 0.38);
      const SET = [[230, 120, 0.7, 2], [560, 70, 0.6, 2], [470, 250, 0.62, 2], [700, 196, 0.55, 2], [90, 92, 1.3, 1], [370, 186, 1.1, 1], [640, 128, 0.95, 1], [150, 262, 0.85, 1]];
      for (let tx = 0; tx < w + 100; tx += 760) {
        SET.forEach(([x, y, k, plane]) => {
          const col = plane === 1 ? front : back;
          cloud(tx + x, Math.min(y, h - 14), k, col, mix(col, c[2], 0.5), plane === 1 ? 4 : 2);
        });
      }
      return b.out();
    },
  },
  {
    id: 'hojas', name: 'Papel botánico', price: 150, tags: ['hippie', 'aesthetic', 'rustico'],
    tints: [
      T('crema', 'Crema', ['#F5EEDF', '#7FAE84', '#5E8C66']), T('verde', 'Verde', ['#2F4B3C', '#6F9E78', '#88B98F']),
      T('rosa', 'Rosa', ['#F8E1E3', '#8DBB93', '#E59AA8']), T('azul', 'Azul', ['#DCE7EF', '#5F8F9A', '#7FAFB0']),
    ],
    // Ramitas de eucalipto: un tallo curvo con hojas redondas en pares,
    // de dos tonos, inclinadas a uno y otro lado.
    draw: (w, h, c) => {
      const b = brush();
      const sprig = (x, y, dir, col) => {
        const stem = tone(col, -0.55), lo = tone(col, -0.28), hi = tone(col, 0.3);
        b.fill(`M${x - 1.4} ${y + 30}Q${x + dir * 9} ${y} ${x + dir * 4 - 1.4} ${y - 30}h2.8Q${x + dir * 9 + 2.8} ${y} ${x + 1.4} ${y + 30}Z`, stem);
        [[18, 18], [-4, 17], [-24, 15]].forEach(([dy, L], k) => {
          const by = y + dy, bx = x + dir * (5 - k * 0.6);
          b.fill(leafD(bx, by + 4, dir > 0 ? 166 + k * 8 : 14 - k * 8, L - 2, 6.8), lo, 1, 1);
          b.fill(leafD(bx, by, dir > 0 ? -14 - k * 8 : 194 + k * 8, L, 7.4), k === 1 ? hi : col, 1, 2);
        });
        b.fill(leafD(x + dir * 4, y - 30, -90 + dir * 10, 15, 6.4), hi, 1, 2);
      };
      for (let r = 0, y = 56; y < h + 50; r++, y += 96) {
        for (let i = 0, x = (r % 2 ? 64 : 0) + 34; x < w + 40; i++, x += 128) {
          sprig(x, y, (r + i) % 2 ? 1 : -1, (r + i) % 3 ? c[1] : c[2]);
        }
      }
      return b.out();
    },
  },
  {
    id: 'damasco', name: 'Papel damasco', price: 170, tags: ['elegante', 'gotico', 'princesa'],
    tints: [
      T('vino', 'Vino', ['#5A2331', '#7A3446']), T('negro', 'Negro', ['#221F27', '#3A3542']), T('crema', 'Crema y oro', ['#F2E6CF', '#E0C48E']),
      T('verde', 'Verde', ['#2E4A3E', '#46685A']), T('lila', 'Lila', ['#E7DDF4', '#CDBBEA']),
    ],
    // Damasco tono sobre tono: un adorno simétrico (lirio central con su
    // calado, hojas que se abren abajo, cogollo arriba) en rombo, y un
    // rombito entre adorno y adorno.
    draw: (w, h, c) => {
      const b = brush();
      const o = c[1], hole = c[0], fine = mix(c[1], c[0], 0.45);
      const half = (x, y, m) => {
        const X = (v) => f1(x + v * m);
        return `M${X(0)} ${y - 36}C${X(6)} ${y - 26} ${X(16)} ${y - 18} ${X(16)} ${y - 4}C${X(16)} ${y + 10} ${X(8)} ${y + 18} ${X(0)} ${y + 22}Z`
          + `M${X(4)} ${y + 18}C${X(16)} ${y + 18} ${X(28)} ${y + 10} ${X(30)} ${y - 4}C${X(34)} ${y + 6} ${X(30)} ${y + 22} ${X(16)} ${y + 28}C${X(10)} ${y + 30} ${X(4)} ${y + 28} ${X(2)} ${y + 24}Z`
          + `M${X(2)} ${y + 26}C${X(6)} ${y + 34} ${X(10)} ${y + 40} ${X(0)} ${y + 46}Z`
          + `M${X(6)} ${y - 32}C${X(14)} ${y - 40} ${X(22)} ${y - 38} ${X(24)} ${y - 30}C${X(18)} ${y - 32} ${X(12)} ${y - 30} ${X(8)} ${y - 26}Z`;
      };
      for (let r = 0, y = 52; y < h + 60; r++, y += 104) {
        for (let x = (r % 2 ? 44 : 0) + 22; x < w + 50; x += 88) {
          b.fill(half(x, y, 1) + half(x, y, -1) + circ(x, y - 44, 4), o);
          b.fill(`M${x} ${y - 20}C${x + 7} ${y - 12} ${x + 8} ${y - 2} ${x} ${y + 10}C${x - 8} ${y - 2} ${x - 7} ${y - 12} ${x} ${y - 20}Z`, hole, 1, 1);
          b.fill(`M${x} ${y - 12}C${x + 3} ${y - 6} ${x + 3} ${y} ${x} ${y + 4}C${x - 3} ${y} ${x - 3} ${y - 6} ${x} ${y - 12}Z`, o, 1, 2);
          b.fill(`M${x + 44} ${y - 8}l7 10l-7 10l-7 -10Z`, fine);
        }
      }
      return b.out();
    },
  },
  {
    id: 'rejilla', name: 'Rejilla neón', price: 170, tags: ['y2k', 'aesthetic'],
    tints: [
      T('fucsia', 'Fucsia', ['#24183A', '#FF4FD8', '#4BE3F0']), T('cian', 'Cian', ['#161E36', '#4BE3F0', '#B57CFF']),
      T('atardecer', 'Atardecer', ['#2B1838', '#FF8A5C', '#FF4FA0']),
    ],
    // Rejilla de los 80: el fondo se enciende hacia abajo, las líneas
    // horizontales brillan (halo + tubo) y las verticales son tenues.
    draw: (w, h, c) => {
      const b = brush();
      b.fill(rect(0, Math.round(h * 0.45), w, h), mix(c[0], c[1], 0.08));
      b.fill(rect(0, Math.round(h * 0.75), w, h), mix(c[0], c[1], 0.16), 1, 1);
      // los tubos son trazos (en neón se encienden); el halo, un relleno
      for (let x = 24; x < w; x += 48) b.stroke(`M${x} 0V${h}`, mix(c[0], c[2], 0.5), 2.6, 1, 2);
      for (let y = 30; y < h; y += 48) {
        b.fill(rect(0, y - 3.5, w, 8), mix(c[0], c[1], 0.3), 1, 3);
        b.stroke(`M0 ${y + 0.5}H${w}`, c[1], 3, 1, 4);
      }
      for (let x = 24, i = 0; x < w; x += 48, i++) {
        for (let y = 30, j = 0; y < h; y += 48, j++) {
          if (hash(i, j, 77) < 0.12) motif(b, 'star', '#FFFFFF', null, [[sparkle(x, y, 7), '#FFFFFF']], y, 7, h, 5);
        }
      }
      return b.out();
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
const CORNICE = 10;

/** La pared entera (svg) de w × h, con cornisa, zócalo y luz. */
export function wallSvg(value, w, h, { baseboard = true } = {}) {
  const { pattern, tint } = parseWall(value);
  const c = tint.c;
  const base = c[0];
  const dark = isDark(base);
  const ph = baseboard ? h - BASEBOARD : h;
  let s = flat(rect(0, 0, w, h), base);
  s += `<clipPath id="wc"><path d="M0 0h${w}v${ph}h${-w}Z"/></clipPath>` + G({ 'clip-path': 'url(#wc)' }, pattern.draw(w, ph, c));
  // Luz: baja del techo y se apaga hacia el zócalo. En los estilos
  // vectoriales es un degradado; en pixel, bandas limpias (como se pinta
  // a mano), sin tramas.
  // (la luz no va en neón: ahí el cuarto es de noche y la daría gris)
  s += E('defs', {}, E('linearGradient', { id: 'wl', x1: 0, y1: 0, x2: 0, y2: 1 },
    `<stop offset="0" stop-color="#FFF6E8" stop-opacity="${dark ? 0.07 : 0.2}"/><stop offset="0.4" stop-color="#FFF6E8" stop-opacity="0"/>`)
    + E('linearGradient', { id: 'ws', x1: 0, y1: 0, x2: 0, y2: 1 },
      `<stop offset="0.72" stop-color="#2A1C24" stop-opacity="0"/><stop offset="1" stop-color="#2A1C24" stop-opacity="${dark ? 0.16 : 0.11}"/>`));
  s += E('rect', { x: 0, y: 0, width: w, height: ph, fill: 'url(#wl)', 'data-r': 'raw', 'data-skip': 'pixel neon' });
  s += E('rect', { x: 0, y: 0, width: w, height: ph, fill: 'url(#ws)', 'data-r': 'raw', 'data-skip': 'pixel' });
  const b1 = Math.round(ph * 0.14), b2 = Math.round(ph * 0.84);
  s += onlyPx(shade(rect(0, 0, w, b1), '#FFF6E8', dark ? 0.05 : 0.09) + shade(rect(0, b2, w, ph - b2), '#2A1C24', dark ? 0.08 : 0.04));
  if (baseboard) {
    const bb = tint.bb || (dark ? tone(base, -1.1) : mix('#FFFFFF', base, 0.3));
    const cap = tone(bb, 0.3), edge = tone(bb, dark ? -0.6 : -0.75), deep = tone(bb, dark ? -0.7 : -0.9);
    // Cornisa: moldura contra el techo, con su filo de sombra abajo y la
    // sombra que echa sobre la pared.
    s += flat(rect(0, 0, w, CORNICE), cap);
    s += flat(rect(0, CORNICE - 3, w, 3), edge);
    s += flat(rect(0, 1, w, 2.6), '#FFFFFF', { opacity: dark ? 0.15 : 0.55 });
    s += shade(rect(0, CORNICE, w, 5), '#2A1C24', dark ? 0.2 : 0.1);
    // Zócalo: tapa con canto de luz (sobresale: un filo oscuro la separa
    // de la pared), la sombra bajo la tapa, la cara y el pie.
    s += flat(rect(0, ph - 4, w, BASEBOARD + 4), bb);
    s += flat(rect(0, ph - 4, w, 2.4), edge);
    s += flat(rect(0, ph - 1.6, w, 5.6), cap);
    s += flat(rect(0, ph - 1.6, w, 2), '#FFFFFF', { opacity: dark ? 0.2 : 0.65 });
    s += flat(rect(0, ph + 4, w, 2.6), edge, { opacity: 0.8 });
    s += flat(rect(0, h - 4, w, 4), deep);
  }
  return svgDoc(w, h, s);
}

/** Muestra chica para la tienda (sin zócalo, motivos a su tamaño). */
export const wallSwatchSvg = (value, size = 120) => wallSvg(value, size, size, { baseboard: false });
