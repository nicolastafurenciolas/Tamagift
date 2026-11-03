// Decoración chica. `place`: 'sobre' (va encima de un mueble o donde
// quieras, y se dibuja por delante de los muebles) o 'piso'.
// Misma vista 3/4 que todo el cuarto: cada cosa muestra su frente y su
// tapa, lo redondo apoyado es una elipse aplastada y la luz viene de
// arriba a la izquierda. Las ayudas de dibujo compartidas (sombras de
// contacto, moños, llamitas, mimbre…) están en decorVibes.js.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, cylinder, leaf, tube, Cir, Ell, INK, piece, FOOT } from './draw.js';
import { DECOR_VIBES, CHROME, BRASS, apple, surf, floorSh, glow, roundShade, gloss, heart, star, dot, dots, ball, eye, blush, smile, catMouth, bow, flame, steam, grain, blossom, rose, spoon } from './decorVibes.js';
import { DECOR_HALLOWEEN } from './decorHalloween.js';
import { DECOR_NAVIDAD } from './decorNavidad.js';
import { findPaint } from './furniture/paints.js';

const f1 = (v) => +v.toFixed(1);

// Libro acostado: tapa de arriba y, adelante, el lomo o el canto de las hojas.
function book(x, y, w, t, d, c, front) {
  const m = mat(c), dd = d * 0.5;
  let s = face(rr(x, y - t - dd, w, dd + 1.5, 1.5), m.top, { w: 1.6 });
  if (front === 'hojas') {
    s += face(rr(x, y - t, w, t, 1.5), m.side, { w: 1.6 });
    s += face(rr(x + 1.8, y - t + 2.2, w - 3.6, t - 4.4, 0.6), '#FFF4E2', { w: 1.1 });
    s += line(`M${x + 3} ${y - t / 2}H${x + w - 3}`, '#E2CDB0', 1.1, { opacity: 0.9 });
  } else {
    s += face(rr(x, y - t, w, t, 2.6), c, { w: 1.6 });
    s += shade(rr(x + 1, y - t * 0.4, w - 2, t * 0.4 - 0.9, 2), m.deep, 0.3);
    s += flat(`M${x + 5} ${y - t + 1}h2.6v${t - 2}h-2.6ZM${x + w - 7.6} ${y - t + 1}h2.6v${t - 2}h-2.6Z`, '#F4D47C');
    s += flat(rr(f1(x + w * 0.36), f1(y - t + t * 0.24), f1(w * 0.26), f1(t * 0.46), 1), '#FFF6E6');
    s += line(`M${x + 3} ${y - t + 1.9}H${x + w - 3}`, m.hi, 1.3, { opacity: 0.8 });
  }
  return s;
}

const DEFS = [
  {
    id: 'planta', name: 'Suculenta', price: 45, w: 64, h: 72, place: 'sobre',
    draw: () => {
      const C = '#F2A7B5', m = mat(C);
      let s = surf(32, 69, 20);
      // maceta de cerámica: cuerpo, aro con su boca y la tierra
      s += part('M15.5 49L20 63.5A12 5.5 0 0 0 44 63.5L48.5 49Z', C, { w: 1.8 });
      s += shade('M39.5 51L37 68.5A12 5.5 0 0 0 44 63.5L48.5 49Z', m.deep, 0.28);
      s += face('M14 44A18 7 0 0 0 50 44V50A18 7 0 0 1 14 50Z', m.top, { w: 1.8 });
      s += face(ellD(32, 44, 18, 7), tone(C, 1.1), { w: 1.8 });
      s += flat(ellD(32, 44.6, 14.6, 5), '#6B4A3A');
      // la roseta, como una flor de loto carnosa: las hojas de atrás, el
      // centro parado y las de adelante (más claras) encima
      const G = ['#5E9C7E', '#76B394', '#96CFAF', '#BCE6CC'], TIP = '#EE91AA';
      s += spoon(30, 42, 20, -150, 6, G[0], TIP) + spoon(34, 42, 20, -30, 6, G[0], TIP);
      s += spoon(31, 41, 18, -112, 6, G[1], TIP) + spoon(33, 41, 18, -68, 6, G[1], TIP) + spoon(32, 41.5, 14, -90, 5, G[3]);
      s += spoon(30, 43.5, 17, 172, 6, G[1], TIP) + spoon(34, 43.5, 17, 8, 6, G[1], TIP);
      s += spoon(30.5, 44, 12, 140, 6, G[2]) + spoon(33.5, 44, 12, 40, 6, G[2]);
      // varita con florcitas de campana
      s += line('M37 30C41 21 45 15 51 11', '#76B394', 2.4);
      [[46, 16], [51, 11], [55.6, 15]].forEach(([x, y]) => { s += part(`M${x - 2.8} ${y}C${x - 2.8} ${y - 4} ${x + 2.8} ${y - 4} ${x + 2.8} ${y}L${x + 1.6} ${y + 2.8}H${x - 1.6}Z`, '#FF9E7A', { w: 1.1 }); });
      // carita y brillo del esmalte
      s += eye(25.5, 61, 2.2) + eye(38.5, 61, 2.2) + blush(21.6, 64.4, 2.8) + blush(42.4, 64.4, 2.8) + smile(32, 63.8, 4);
      s += shine(rr(18.6, 53, 2.4, 6, 1.2), { opacity: 0.8 });
      return s;
    },
  },
  {
    id: 'libros', name: 'Pila de libros', price: 40, w: 84, h: 70, place: 'sobre',
    draw: () => {
      let s = surf(42, 67, 37);
      s += book(8, 67, 66, 11, 28, '#7FA9DE');
      s += book(12, 56, 58, 9, 26, '#E57B93', 'hojas');
      // cinta del separador que asoma de las hojas
      s += part('M55 49.5h3.6v17l-1.8 -2.2l-1.8 2.2Z', '#E8505E', { w: 1.1 });
      s += book(7, 47, 62, 11, 28, '#F2C14E');
      s += book(15, 36, 50, 9, 24, '#7FB894');
      s += Ell(41, 24.5, 6.5, 1.6, { fill: '#2A1C24', opacity: 0.25, 'data-r': 'tone' });
      s += apple(41, 18.5, 6.4);
      return s;
    },
  },
  {
    id: 'lampara', name: 'Lámpara de mesa', price: 60, w: 66, h: 96, place: 'sobre',
    draw: () => {
      const S = '#F7B6C4', ms = mat(S), V = '#A8DCC8', mv = mat(V);
      let s = glow(33, 50, 31, 10, '#FFE9A8', 0.3) + surf(33, 93, 18);
      // pie de bronce y jarrón de cerámica pintado
      s += cylinder(33, 93, 9, 4, BRASS, { w: 1.6 });
      s += part(ellD(33, 76, 14, 13), V, { w: 1.8 });
      s += roundShade(33, 76, 14, 13, V, 0.3, 0.3);
      s += line('M19.6 77Q33 84 46.4 77', '#FFFFFF', 2, { opacity: 0.9 });
      s += dots([[25.5, 71], [33, 69.6], [40.5, 71]], 1.7, '#FFFFFF');
      s += gloss(25, 70, 3, 1.8, -40);
      s += face(rr(28, 61, 10, 4, 2), mv.top, { w: 1.4 });
      s += face(rr(31, 47, 4, 15, 1), BRASS, { w: 1.4 }) + line('M32.2 49V60', '#FFF2C6', 1, { opacity: 0.9 });
      // cordón con su perla
      s += line('M50 50V60', '#B8925A', 1.2) + part(ellD(50, 61.5, 1.8, 2.2), BRASS, { w: 1 });
      // pantalla plisada con festón
      s += line('M33 16V10', BRASS, 1.8) + part(ellD(33, 9, 2.4, 2.4), BRASS, { w: 1.1 });
      s += face('M19 16L9 48A24 5 0 0 0 57 48L47 16Z', S, { w: 2 });
      s += shade('M41 16L47 16L57 48A24 5 0 0 1 46 52.2Z', ms.deep, 0.22);
      let pl = '';
      for (let i = -3; i <= 3; i++) { const xb = 33 + i * 6.9; pl += `M${33 + i * 4} 17L${f1(xb)} ${f1(48 + 5 * Math.sqrt(1 - Math.pow((i * 6.9) / 24, 2)) - 2)}`; }
      s += line(pl, ms.side, 1.1, { opacity: 0.45 });
      s += face(ellD(33, 16, 14, 3), '#FFE3BC', { w: 1.5 });
      s += line('M18.5 21L12.5 42', '#FFFFFF', 2, { opacity: 0.55 });
      // festón de abajo: un borde de ondas color crema
      const cy = (x) => 48 + 5 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 33) / 24, 2)));
      let tr = `M9 ${f1(cy(9) - 2.4)}`;
      for (let x = 13; x <= 57; x += 4) tr += `L${x} ${f1(cy(x) - 2.4)}`;
      tr += `L57 ${f1(cy(57) + 0.6)}`;
      for (let x = 57; x > 9; x -= 4) tr += `Q${x - 2} ${f1(cy(x - 2) + 4)} ${x - 4} ${f1(cy(x - 4) + 0.6)}`;
      s += part(`${tr}Z`, '#FFF4E8', { w: 1.2 });
      return s;
    },
  },
  {
    id: 'osito', name: 'Osito de peluche', price: 90, w: 88, h: 96, place: 'piso',
    draw: () => {
      const B = '#C99A72', L = '#F2D9BC', m = mat(B);
      let s = floorSh(44, 92, 34, 6);
      s += part(ellD(44, 66, 26, 24), B, { w: 1.8 });
      s += roundShade(44, 66, 26, 24, B, 0.24, 0.3);
      s += part(ellD(44, 70, 14, 13), L, { w: 1.2 });
      // remiendo de corazón con puntadas
      s += part(heart(50.5, 71, 5.2), '#F7A6B9', { w: 1.2 }) + line('M45.2 68.4l-2 -1.2M55.8 68.4l2 -1.2M50.5 76.4v2', m.deep, 1.3, { 'data-skip': 'pixel' });
      // patas con almohadillas y deditos
      [22, 66].forEach((x) => {
        s += part(ellD(x, 86, 12, 8), B, { w: 1.6 });
        s += part(ellD(x, 87.5, 6.4, 4.2), L, { w: 1 });
        s += dots([[x - 4.6, 81.6], [x, 80.6], [x + 4.6, 81.6]], 1.6, L);
      });
      // brazos
      s += part(ellD(18, 60, 8, 12), B, { w: 1.6 }) + part(ellD(70, 60, 8, 12), B, { w: 1.6 });
      s += flat(ellD(18, 66.5, 4.4, 3.6) + ellD(70, 66.5, 4.4, 3.6), L);
      // cabeza
      s += part(ellD(24, 18, 10, 10), B, { w: 1.6 }) + part(ellD(64, 18, 10, 10), B, { w: 1.6 });
      s += flat(ellD(24, 19, 5.4, 5.4) + ellD(64, 19, 5.4, 5.4), L);
      s += part(ellD(44, 34, 24, 21), B, { w: 1.8 });
      s += roundShade(44, 34, 24, 21, B, 0.2, 0.26);
      s += part(ellD(44, 42, 11, 8), L, { w: 1.2 });
      s += part('M40.2 38.4C40.2 36.4 47.8 36.4 47.8 38.4C47.8 40.6 45.6 42 44 42C42.4 42 40.2 40.6 40.2 38.4Z', INK, { w: 1 }) + Cir(42.2, 38, 0.9, { fill: '#FFFFFF', 'data-r': 'shine' });
      s += line('M44 42v2.2M40.4 45.2q3.6 2.6 7.2 0', INK, 1.4);
      s += eye(35, 32, 2.6) + eye(53, 32, 2.6) + blush(29.5, 39, 3.6) + blush(58.5, 39, 3.6);
      s += bow(44, 54, 0.78, '#E57B93');
      return s;
    },
  },
  {
    id: 'corazon-marco', name: 'Portarretratos', price: 60, w: 70, h: 78, place: 'sobre',
    draw: () => {
      const F = '#F7B6C4', m = mat(F);
      let s = surf(35, 75, 27);
      // marco con grosor (canto de arriba), bisel y paspartú
      s += face(rrTop(9, 10, 52, 5, 2), m.top, { w: 1.6 });
      s += face(rr(8, 13, 54, 62, 5), F, { w: 2 });
      s += shade(rr(8, 63, 54, 12, 5), m.deep, 0.18);
      s += face(rr(13, 18, 44, 52, 3), m.side, { w: 1.4 });
      s += face(rr(15, 20, 41, 49, 2), '#FFF6EC', { w: 1.2 });
      // la foto: cielo, sol, nube, lomita y una mochi con su corazón
      s += face(rr(19, 24, 33, 40, 1), '#BFE3F5', { w: 1.2 });
      s += flat('M19.6 52Q32 45 51.4 51V63.4H19.6Z', '#9CD49A');
      s += dot(26, 31, 4.2, '#FFE07A');
      s += part('M26 56C26 42.5 46 42.5 46 56Z', '#FFF8F2', { w: 1.3 }) + part('M28.4 48.6l0.8 -6l4.6 3.4ZM43.6 48.6l-0.8 -6l-4.6 3.4Z', '#FFF8F2', { w: 1.1 });
      s += dots([[32.4, 50.4], [39.6, 50.4]], 1.5, INK) + blush(29.8, 53, 2.2) + blush(42.2, 53, 2.2) + smile(36, 52.6, 2.8);
      s += flat(heart(43.5, 31, 3.2), '#FF7FA1');
      // brillo del vidrio
      s += shine('M21 38L33 26H37.6L21 42.6Z', { opacity: 0.35 });
      // corazoncito de adorno arriba
      s += part(heart(35, 12.5, 6.2), '#FF7FA1', { w: 1.4 }) + gloss(32, 10.5, 1.6, 1, -40);
      return s;
    },
  },
  {
    id: 'cassette', name: 'Radio casete', price: 70, w: 104, h: 74, place: 'sobre',
    draw: () => {
      const C = '#E57B93', m = mat(C), K = '#3A3542';
      let s = surf(52, 71, 46);
      s += tube('M82 24L97 5', 2.2, CHROME) + part(ellD(97.6, 4.4, 2.4, 2.4), CHROME, { w: 1.1 });
      s += tube('M21 26C21 9 83 9 83 26', 4.2, '#6E6878');
      s += face(rr(16.5, 21, 9, 7, 2), K, { w: 1.4 }) + face(rr(78.5, 21, 9, 7, 2), K, { w: 1.4 });
      s += box(6, 70, 92, 42, 14, C, { r: 6 });
      [39.5, 46.5, 53.5, 60.5].forEach((x, i) => { s += face(rr(x, 22.4, 5.6, 4.2, 1), i ? '#F4F0EA' : '#FFE07A', { w: 1.1 }); });
      // parlantes: aro cromado, rejilla, cono y tapita
      [27, 77].forEach((x) => {
        s += part(ellD(x, 49, 16.5, 16.5), CHROME, { w: 1.8 });
        s += part(ellD(x, 49, 13.5, 13.5), K, { w: 1.3 });
        s += line(`M${x - 10} 49a10 10 0 1 0 20 0a10 10 0 1 0 -20 0`, '#57506A', 1.3);
        s += part(ellD(x, 49, 6.6, 6.6), '#5E576E', { w: 1.2 });
        s += part(ellD(x, 49, 3, 3), '#9A93AE', { w: 1 });
        s += shine(`M${x - 13.6} 45a15 15 0 0 1 8 -9l0.8 1.8a13 13 0 0 0 -6.8 7.8Z`, { opacity: 0.8 });
      });
      // casetera con su casete (las ruedas miran como ojitos)
      s += face(rr(42, 33, 20, 28, 3), '#F4F0EA', { w: 1.6 });
      s += face(rr(44.5, 36, 15, 14, 2), '#4A4458', { w: 1.2 });
      s += flat(rr(45.6, 37, 12.8, 4.4, 1), '#FFD3DF');
      s += dots([[48.4, 45.4], [55.6, 45.4]], 2.5, '#FFFFFF') + dots([[48.4, 45.4], [55.6, 45.4]], 1.1, INK);
      s += smile(52, 53.6, 4.6) + blush(46.4, 54, 2.2) + blush(57.6, 54, 2.2);
      s += dots([[38.5, 31], [65.5, 31]], 1.4, '#9DF2C6');
      s += face(rr(14, 69.2, 10, 3.4, 1), K, { w: 1.2 }) + face(rr(80, 69.2, 10, 3.4, 1), K, { w: 1.2 });
      return s;
    },
  },
  {
    id: 'tarro-estrellas', name: 'Tarro de estrellas', price: 75, w: 58, h: 80, place: 'sobre',
    draw: () => {
      let s = glow(29, 52, 28, 28, '#FFF0A8', 0.22) + surf(29, 76.5, 21);
      const jar = 'M14 31C10 33 9 38 9 44V68C9 74 13 76.5 18 76.5H40C45 76.5 49 74 49 68V44C49 38 48 33 44 31Z';
      s += shade(jar, '#CFEAF5', 0.5);
      // estrellitas de papel, amontonadas (las de atrás primero)
      const cols = ['#FFE07A', '#FFB6CC', '#BFE3FF', '#C9F0D0', '#E2C9FF', '#FFC9A8'];
      [[24, 47.5, 6, 4, 8], [36, 48.5, 6, 3, -10], [17.5, 58.5, 6.2, 1, 0], [29.5, 58.5, 6.4, 0, 14], [41.5, 59.5, 6, 2, -6],
        [16.5, 70, 6, 5, 12], [28.5, 70.5, 6.4, 4, -4], [40.5, 70, 6, 1, 6]]
        .forEach(([x, y, r, k, a]) => {
          s += `<g transform="rotate(${a} ${x} ${y})" data-skip="pixel">${part(star(x, y, r, 0.52), cols[k], { w: 1.1 })}</g>`;
          s += `<g data-only="pixel">${part(star(x, y + 0.6, r, 0.6), cols[k], { w: 1.1 })}</g>`;
        });
      // vidrio de adelante: contorno y dos brillos
      s += line(jar, mix('#9CC6DA', INK, 0.25), 2);
      s += shine('M13.6 40C12.6 48 12.6 60 14 69h2.4C15 60 15 48 16 40Z', { opacity: 0.75 }) + shine(rr(42.4, 40, 2.4, 7, 1.2), { opacity: 0.6 });
      // cuello con rosca y tapa de tela con volado
      s += face(rr(14, 26, 30, 6.5, 2), '#E3F1F7', { w: 1.4 }) + line('M16.5 29.4H41.5', '#B8D6E4', 1.2);
      const T = '#F7A6B9';
      s += part('M11 24C11 14 47 14 47 24Z', T, { w: 1.6 });
      let rf = 'M9.5 23.5H48.5';
      for (let x = 48.5; x > 10; x -= 4.875) rf += `Q${f1(x - 2.44)} ${31.5} ${f1(x - 4.875)} 24.5`;
      s += part(`${rf}Z`, T, { w: 1.3 });
      s += dots([[18, 19.5], [26, 17.6], [34, 17.6], [42, 19.5], [22, 27.4], [30.5, 27.8], [39, 27.4]], 1.2, '#FFFFFF');
      s += line('M10 24.2Q29 26.6 48 24.2', '#C9A06A', 2.2);
      s += bow(17, 25.4, 0.36, '#C9A06A', { tails: false });
      // etiqueta colgando del cordel
      s += line('M17 27L14 35.5', '#B8925A', 1.2);
      s += `<g transform="rotate(-10 13 40)">${face(rr(9, 35, 9, 11, 1.6), '#F2DFB8', { w: 1.2 })}${flat(heart(13.5, 41, 2.2), '#E57B93')}</g>`;
      return s;
    },
  },
  {
    id: 'taza', name: 'Taza humeante', price: 35, w: 58, h: 64, place: 'sobre',
    draw: () => {
      const C = '#F4AFC2', m = mat(C), W = '#FFF6EE';
      let s = surf(28, 61.5, 25);
      // platito
      s += cylinder(28, 59, 24, 2.4, W, { w: 1.6 });
      s += flat(ellD(28, 56.8, 15, 3.8), tone(W, -0.35));
      // asa
      s += part('M37 33C48.5 31 52 37 51 43C50 49 45 52.4 37 51.4V46.6C43 47.2 46 45 46.5 42C47 38.4 44 36.4 37 37.6Z', C, { w: 1.6 });
      // cuerpo de la taza
      s += cylinder(26, 55, 13.5, 24, C, { w: 1.8 });
      s += shade('M33 31.5H39.5V55A13.5 6.75 0 0 1 33 60.9Z', m.deep, 0.26);
      s += flat(ellD(26, 31.6, 11, 5), '#8A5A3C') + flat(ellD(26, 32.4, 8.4, 3.2), '#A87250');
      // malvaviscos flotando
      s += part(rr(17.6, 27.6, 7, 5, 1.8), '#FFFFFF', { w: 1.2 }) + part(rr(27, 27, 7, 5, 1.8), '#FFD3DF', { w: 1.2 });
      s += part(heart(26, 43.5, 5), '#FFFFFF', { w: 1.2 });
      s += shine(rr(15.2, 36, 2.6, 13, 1.3), { opacity: 0.75 });
      s += steam(22, 24, 16) + steam(31, 21.5, 14);
      return s;
    },
  },
  {
    id: 'velas', name: 'Velas aromáticas', price: 45, w: 74, h: 72, place: 'sobre',
    draw: () => {
      let s = glow(39, 22, 30, 18, '#FFE3A0', 0.22) + surf(37, 69, 34);
      // bandeja ovalada
      const T = '#E9D7C3', mt = mat(T);
      s += face('M4 57A33 9 0 0 0 70 57V60A33 9 0 0 1 4 60Z', mt.side, { w: 1.6 });
      s += face(ellD(37, 57, 33, 9), mt.top, { w: 1.6 });
      s += flat(ellD(37, 57.6, 29, 7), T);
      const candle = (cx, y, rx, h, c, drips) => {
        const m = mat(c), ry = rx * 0.5, top = y - h;
        let o = cylinder(cx, y, rx, h, c, { w: 1.6 });
        o += shade(`M${cx + rx * 0.3} ${top}H${cx + rx}V${y}A${rx} ${ry} 0 0 1 ${f1(cx + rx * 0.3)} ${f1(y + ry * 0.95)}Z`, m.deep, 0.24);
        o += flat(ellD(cx, top + 0.6, rx * 0.66, ry * 0.6), tone(c, 0.3));
        drips.forEach(([dx, len]) => { const x = cx + dx; const yy = top + ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2)); o += flat(`M${f1(x - 1.6)} ${f1(yy - 1)}V${f1(yy + len)}a1.6 1.6 0 0 0 3.2 0V${f1(yy - 1)}Z`, m.top); });
        o += line(`M${cx} ${top}v-3.4`, INK, 1.6) + flame(cx, top - 2.8, 0.8);
        return o;
      };
      s += candle(41, 55, 9, 38, '#FFF1D6', [[-5, 6], [2, 9], [6, 4]]);
      s += candle(20, 60, 10, 25, '#F7C6D9', [[-4, 5], [4, 8]]);
      // vela en vasito de vidrio
      const G = 'M47 46V61A9.5 4.75 0 0 0 66 61V46Z';
      s += shade(G, '#E6F3F8', 0.55);
      s += flat('M47.6 51V61A8.9 4.4 0 0 0 65.4 61V51Z', '#D6C6F2') + flat(ellD(56.5, 51, 8.9, 3.4), '#E4D8F7');
      s += line(`M56.5 51v-3`, INK, 1.4) + flame(56.5, 48.2, 0.7);
      s += face('M47.2 54.5H65.8V59.5H47.2Z', '#F2DFB8', { w: 1.1 }) + flat(heart(56.5, 57, 1.8), '#E57B93');
      s += line(G, mix('#9CC6DA', INK, 0.3), 1.6) + line(ellD(56.5, 46, 9.5, 3.2), mix('#9CC6DA', INK, 0.3), 1.4);
      s += shine(rr(49, 47.5, 1.8, 11, 0.9), { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'globo', name: 'Globo terráqueo', price: 80, w: 66, h: 96, place: 'sobre',
    draw: () => {
      const W = '#C99A72', O = '#8ED0F2', cx = 33, cy = 44, r = 23;
      let s = surf(33, 93, 19);
      s += cylinder(33, 93, 15, 6, W, { w: 1.6 }) + grain([[20, 46, 90.5, 0.6]], W, 0.5);
      s += cylinder(33, 86.5, 7.5, 3, tone(W, 0.35), { w: 1.4 });
      s += tube('M33 84C33 78 27 75 22.6 70', 4, BRASS);
      // la esfera: mar, continentes, ecuador, volumen y brillo
      s += part(ellD(cx, cy, r, r), O, { w: 1.8 });
      s += flat('M16 30C20 25 28 24 31 28C33 31 30 34 27 36C25 38 26 41 23 42C20 41 18 37 17 34C16 33 15 31 16 30ZM27 46C31 45 34 48 33 52C32 56 30 60 28 63C26 60 26 55 25 51C24 48 25 46 27 46ZM41 31C45 29 50 31 51 35C52 40 49 44 47 48C46 52 43 55 41 52C40 48 39 44 40 40C38 37 39 33 41 31Z', '#8FD08A');
      s += flat(ellD(49.5, 57, 2.6, 1.6) + ellD(19, 52, 1.8, 1.2), '#8FD08A');
      s += roundShade(cx, cy, r, r, O, 0.24, 0.28);
      s += gloss(24, 33, 4.6, 2.6, -40, 0.8);
      s += part(heart(42.6, 38.4, 4.2), '#FF7FA1', { w: 1.2 }) + gloss(41, 36.6, 1.1, 0.7, -40, 0.9);
      // medio meridiano de bronce de polo a polo
      s += tube('M43.5 19.1A27 27 0 0 0 22.6 68.9', 3.2, BRASS);
      s += part(ellD(43.5, 19.1, 2.2, 2.2), BRASS, { w: 1.1 }) + part(ellD(22.6, 68.9, 2.2, 2.2), BRASS, { w: 1.1 });
      return s;
    },
  },
  {
    id: 'despertador', name: 'Despertador', price: 40, w: 62, h: 70, place: 'sobre',
    draw: () => {
      const B = '#7FA9DE', G = '#F2C14E', m = mat(B), mg = mat(G);
      let s = surf(31, 67.5, 23);
      s += tube('M20 58L14.5 66', 3.2, m.side) + tube('M42 58L47.5 66', 3.2, m.side);
      s += part(ellD(14, 66.4, 2.6, 1.8), m.side, { w: 1.1 }) + part(ellD(48, 66.4, 2.6, 1.8), m.side, { w: 1.1 });
      // campanas con su martillito al medio
      const bell = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})">${part(`M${x - 9} ${y + 3}C${x - 9} ${y - 8.5} ${x + 9} ${y - 8.5} ${x + 9} ${y + 3}Z`, G, { w: 1.5 })}${face(rr(x - 10, y + 2, 20, 3.6, 1.6), mg.side, { w: 1.3 })}${shine(`M${x - 6} ${y - 1}Q${x - 5.6} ${y - 5} ${x - 2} ${y - 5.6}L${x - 2.6} ${y - 3.8}Q${x - 4.4} ${y - 3.4} ${x - 4.4} ${y - 0.6}Z`, { opacity: 0.75 })}${part(ellD(x, y - 7, 2, 1.8), mg.side, { w: 1 })}</g>`;
      s += bell(15, 15.5, -28) + bell(47, 15.5, 28);
      s += line('M31 17V8.6', '#9AA2B6', 2.2) + face(rr(26.6, 5.4, 8.8, 3.6, 1.6), CHROME, { w: 1.2 });
      // caja, bisel cromado y esfera
      s += part(ellD(31, 41, 23, 23), B, { w: 1.8 });
      s += roundShade(31, 41, 23, 23, B, 0.22, 0.3);
      s += part(ellD(31, 41, 18.6, 18.6), CHROME, { w: 1.4 });
      s += face(ellD(31, 41, 15.6, 15.6), '#FFFDF8', { w: 1.2 });
      s += flat('M30 27.6h2v3.4h-2ZM30 51h2v3.4h-2ZM17.6 40h3.4v2h-3.4ZM41 40h3.4v2h-3.4Z', INK);
      s += dots([[37.6, 29.6], [42.4, 34.4], [42.4, 47.6], [37.6, 52.4], [24.4, 52.4], [19.6, 47.6], [19.6, 34.4], [24.4, 29.6]], 0.9, mix(INK, '#FFFDF8', 0.4));
      s += line('M31 41V31.6', INK, 2.4) + line('M31 41L38.4 45', INK, 2.2) + part(ellD(31, 41, 2.2, 2.2), '#E57B93', { w: 1 });
      s += shine('M20 34C21 29 25 27 29 26.4C26 29 23.6 31.6 22.6 36Z', { opacity: 0.5 });
      s += gloss(19, 30, 3, 1.6, -45, 0.8);
      return s;
    },
  },
  {
    id: 'cojin', name: 'Cojín corazón', price: 50, w: 84, h: 72, place: 'piso',
    draw: () => {
      const C = '#F28CA8', m = mat(C), cx = 42, cy = 37.5, k = 1.9;
      const H = (t, sc, ox = 0, oy = 0) => {
        let y = -sc * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        if (y > 9 * sc) y = 9 * sc + (y - 9 * sc) * 0.5;   // relleno: la punta queda roma
        return [cx + ox + 16 * sc * Math.pow(Math.sin(t), 3), cy + oy + y];
      };
      const path = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
      let s = floorSh(42, 64.5, 20, 4);
      // volado de encaje alrededor
      const n = 30;
      let rf = '';
      for (let i = 0; i < n; i++) {
        const t0 = (i / n) * Math.PI * 2, t1 = ((i + 1) / n) * Math.PI * 2, tm = (t0 + t1) / 2;
        const [x0, y0] = H(t0, k * 1.1), [x1, y1] = H(t1, k * 1.1), [xm, ym] = H(tm, k * 1.24);
        rf += `${i ? '' : `M${f1(x0)} ${f1(y0)}`}Q${f1(xm)} ${f1(ym)} ${f1(x1)} ${f1(y1)}`;
      }
      s += part(`${rf}Z`, '#FFF4F7', { w: 1.4 });
      // el corazón inflado, capitoné con tres botones
      const pts = Array.from({ length: 64 }, (_, i) => H((i / 64) * Math.PI * 2, k));
      s += part(path(pts), C, { w: 1.8 });
      const sh = [];
      for (let i = 0; i <= 24; i++) sh.push(H(0.12 * Math.PI + (i / 24) * 0.88 * Math.PI, k));
      for (let i = 24; i >= 0; i--) sh.push(H(0.12 * Math.PI + (i / 24) * 0.88 * Math.PI, k * 0.8, 3, 3.4));
      s += shade(path(sh), m.deep, 0.26);
      s += line('M42 40L29 31M42 40L55 31M42 40L37 28M42 40L47 28M42 40L35 50M42 40L49 50', m.side, 1.4, { opacity: 0.55 });
      s += part(ellD(42, 40, 3.4, 3.2), tone(C, 0.5), { w: 1.2 }) + flat(ellD(42, 40.6, 1.6, 1.2), m.side);
      s += gloss(23, 22, 4.6, 2.4, -38, 0.75);
      return s;
    },
  },
  {
    id: 'jarron', name: 'Jarrón con flores', price: 55, w: 66, h: 104, place: 'sobre',
    draw: () => {
      const V = '#7FA9DE', m = mat(V);
      let s = surf(33, 101, 18);
      // jarrón de cerámica con su boca
      s += part('M27 64C27 69 18 73 18 85C18 95 24 101 33 101C42 101 48 95 48 85C48 73 39 69 39 64Z', V, { w: 1.8 });
      s += roundShade(33, 85, 15, 16, V, 0.3, 0.3);
      s += line('M19 82Q33 88 47 82', '#FFFFFF', 1.8, { opacity: 0.9 }) + dots([[24.5, 91], [33, 93.4], [41.5, 91]], 1.6, '#FFFFFF');
      s += shine('M22.6 78C21 82 21 88 22.4 92L24.2 91.4C23.2 88 23.2 83 24.6 79Z', { opacity: 0.75 });
      s += face(rr(24, 59, 18, 5.4, 2.6), m.top, { w: 1.5 });
      s += flat(ellD(33, 60.2, 6.6, 1.4), m.deep);
      // tallos, hojas y el ramo
      s += line('M33 61Q26 48 18 34M33 61Q33 44 34 23M33 61Q40 46 48 31M33 61Q29 55 22 50M33 61Q38 55 45 51', '#6E9C6E', 2);
      s += leaf(30, 54, 13, 196, 3.4, '#7FB894') + leaf(37, 53, 13, -18, 3.4, '#6FA886') + leaf(31, 42, 10, -146, 2.8, '#8CC7A0') + leaf(36, 40, 10, -34, 2.8, '#7FB894');
      s += dots([[20, 48], [23, 46], [24.5, 50], [44, 48], [47, 50.5], [46, 47]], 1.8, '#FFFFFF');
      s += blossom(48, 30, 7.2, '#C6B3F0', 5, '#FFE07A', 0.3);
      s += blossom(18, 33, 7.6, '#FFFFFF', 8, '#FFD24D');
      s += rose(34, 21, 8.6, '#F7A6B9');
      s += part(ellD(22, 50, 2.6, 3.2), '#FFD966', { w: 1 }) + part(ellD(45.2, 51, 2.6, 3.2), '#FFB6CC', { w: 1 });
      return s;
    },
  },
  {
    id: 'regalos', name: 'Pila de regalos', price: 70, w: 96, h: 96, place: 'piso',
    draw: () => {
      let s = floorSh(48, 92, 44, 6);
      // caja con tapa: cuerpo, canto de la tapa y tapa de arriba con la cinta
      const gift = (x, y, w, h, lid, d, c, rib, pat) => {
        const m = mat(c), mr = mat(rib), dd = d * 0.5, cx = x + w / 2;
        let o = face(rr(x, y - h, w, h, 1.5), c, { w: 1.8 });
        o += pat;
        o += shade(rr(x + w - 7, y - h + 1, 6, h - 2, 1), m.deep, 0.18);
        o += face(rrTop(x - 2, y - h - lid - dd, w + 4, dd + 1.5, 2), m.top, { w: 1.6 });
        o += face(rr(x - 2, y - h - lid, w + 4, lid, 1.5), tone(c, 0.2), { w: 1.6 });
        o += shade(rr(x - 1, y - h - 0.6, w + 2, 2.2, 1), m.deep, 0.3);
        o += flat(`M${cx - 3} ${y - h - lid - dd + 0.8}h6V${y - 0.8}h-6Z`, rib);
        o += flat(`M${x - 1.4} ${f1(y - h - lid - dd / 2 - 1.5)}H${x + w + 1.4}v3H${x - 1.4}Z`, mr.top);
        o += line(`M${cx - 1.6} ${y - h - lid + 1}V${y - 2}`, mr.hi, 1.1, { opacity: 0.8 });
        return o;
      };
      // grande de atrás (lunares) con una sombrerera arriba
      const pol = [];
      [67, 76, 85].forEach((yy, j) => { for (let xx = 11 + (j % 2) * 5; xx < 54; xx += 10) if (Math.abs(xx - 31) > 5.5) pol.push([xx, yy]); });
      s += gift(6, 92, 50, 30, 7, 28, '#8EB8E8', '#FFE07A', dots(pol, 2.3, '#FFFFFF'));
      // sombrerera
      const L = '#C9B6EE', ml = mat(L);
      s += cylinder(31, 50, 13, 13, L, { w: 1.6 });
      s += shade('M36 37H44V50A13 6.5 0 0 1 36 56.1Z', ml.deep, 0.22);
      s += flat('M29 37.5h4V56.4h-4Z', '#F28CA8');
      s += face('M17 35.5A14 7 0 0 0 45 35.5V39A14 7 0 0 1 17 39Z', ml.top, { w: 1.5 });
      s += face(ellD(31, 35.5, 14, 7), tone(L, 0.9), { w: 1.5 });
      s += flat('M29 28.6h4v13.8h-4Z', '#F28CA8');
      s += bow(31, 35, 0.62, '#F28CA8');
      // chica de adelante (rayas)
      let st = '';
      for (let xx = 54; xx < 90; xx += 6) st += `M${xx} 70h3V91h-3Z`;
      s += gift(52, 92, 38, 22, 6, 22, '#F4A7B9', '#9ED9C0', flat(st, tone('#F4A7B9', 0.55)));
      s += bow(71, 58, 0.7, '#9ED9C0');
      // etiqueta
      s += line('M74 60L80 66', '#B8925A', 1.1) + `<g transform="rotate(16 82 69)">${face(rr(78, 65, 9, 7, 1.4), '#F2DFB8', { w: 1.1 })}${flat(heart(82.5, 68.4, 1.6), '#E57B93')}</g>`;
      return s;
    },
  },
  {
    id: 'pelota', name: 'Pelota de playa', price: 35, w: 66, h: 66, place: 'piso',
    draw: () => {
      const cx = 33, cy = 34, r = 27, tilt = 0.42, rot = 0.35;
      // cada gajo: dos meridianos desde el polo hasta donde se esconden,
      // cerrados por el borde de la pelota
      const P3 = (th, ph) => {
        const X = r * Math.sin(th) * Math.sin(ph), Y = r * Math.cos(th), Z = r * Math.sin(th) * Math.cos(ph);
        return [X, Y * Math.cos(tilt) - Z * Math.sin(tilt), Y * Math.sin(tilt) + Z * Math.cos(tilt)];
      };
      const merid = (ph) => {
        const pts = [];
        let prev = 0.12;
        for (let i = 0; i <= 48; i++) {
          const th = 0.12 + (i / 48) * (Math.PI - 0.12);
          const [X, Y2, Z2] = P3(th, ph);
          if (Z2 < 0) {
            let a = prev, b = th;
            for (let k = 0; k < 14; k++) { const mth = (a + b) / 2; if (P3(mth, ph)[2] >= 0) a = mth; else b = mth; }
            const [Xe, Ye] = P3(a, ph); const n = r / (Math.hypot(Xe, Ye) || 1);
            pts.push([Xe * n, Ye * n]);
            break;
          }
          pts.push([X, Y2]); prev = th;
        }
        return pts;
      };
      const scr = ([X, Y]) => `${f1(cx + X)} ${f1(cy - Y)}`;
      let s = floorSh(33, 62.5, 25, 4.6);
      s += part(ellD(cx, cy, r, r), '#FFFFFF', { w: 1.8 });
      const cols = ['#F28CA8', null, '#7FB6E8', null, '#FFD966', null];
      cols.forEach((c, k) => {
        if (!c) return;
        const p1 = rot + (k * Math.PI) / 3, p2 = p1 + Math.PI / 3;
        const edge = [];
        for (let j = 1; j < 8; j++) { const m2 = merid(p1 + ((p2 - p1) * j) / 8); edge.push(m2[m2.length - 1]); }
        const pts = [...merid(p1), ...edge, ...merid(p2).reverse()];
        s += flat(`M${pts.map(scr).join('L')}Z`, c);
      });
      s += roundShade(cx, cy, r, r, '#C9C2D8', 0.24, 0.32);
      const [px, py] = [cx, f1(cy - r * Math.cos(tilt))];
      s += part(ellD(px, py, 5.4, 3), '#FFFFFF', { w: 1.2 }) + part(ellD(px, py - 0.4, 2.2, 1.3), '#F28CA8', { w: 1 });
      s += gloss(20, 21, 5.4, 2.8, -38, 0.85);
      return s;
    },
  },
  {
    id: 'consola', name: 'Consolita', price: 85, w: 70, h: 56, place: 'sobre',
    draw: () => {
      const B = '#C6B3F0', m = mat(B), K = '#4A4458';
      let s = surf(35, 53, 31);
      // atril de acrílico
      s += shade('M18 52L23 41H47L52 52Z', '#DDEFF7', 0.5) + line('M18 52L23 41H47L52 52', '#A9CADB', 1.3);
      // gatillos y canto de arriba
      s += face(rrTop(10, 9, 14, 6, 2.6), m.side, { w: 1.4 }) + face(rrTop(46, 9, 14, 6, 2.6), m.side, { w: 1.4 });
      s += part('M5 26C5 17 9 13.4 17 13.4H53C61 13.4 65 17 65 26V36C65 44 61 46.6 53 46.6H17C9 46.6 5 44 5 36Z', B, { w: 1.8 });
      s += shade('M5.6 37C6 43 9.6 46 17 46H53C60.4 46 64 43 64.4 37Z', m.deep, 0.22);
      s += line('M9 16.6Q11 15 17 15H40', m.hi, 1.4, { opacity: 0.8 });
      // pantalla con un jueguito
      s += face(rr(19, 17, 32, 22, 3), '#3E3A52', { w: 1.4 });
      s += face(rr(22.5, 20, 25, 16, 1), '#BFE3C8', { w: 1 });
      s += flat('M32 24h2v-1h2v1h2v-1h2v1h1v3h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-3Z', '#E8507A');
      s += flat('M23.5 33.6H46.5V35.2H23.5Z', '#8CC79A') + dots([[27, 25], [43.5, 29.5]], 0.9, '#FFFFFF');
      s += shine('M24 21.2H30L24 27.6Z', { opacity: 0.4 });
      // cruceta, botones y parlante
      s += part('M11 26h3v-3h3v3h3v3h-3v3h-3v-3h-3Z', K, { w: 1.2 }) + flat('M14.6 23.6h1.8v1.8h-1.8Z', '#7A7290');
      s += ball(57, 25.4, 3, '#F28CA8', 1.2) + ball(52.2, 30.6, 3, '#9ED9C0', 1.2) + dots([[56, 24.4], [51.2, 29.6]], 0.9, '#FFFFFF');
      s += face(rr(28.6, 41.4, 5.4, 2.4, 1.2), K, { w: 1 }) + face(rr(36, 41.4, 5.4, 2.4, 1.2), K, { w: 1 });
      s += line('M55 39.6l3 -3M58 40.6l3 -3', m.side, 1.4);
      // cartucho acostado adelante
      s += face(rr(48, 46.4, 16, 6, 1.4), '#7FA9DE', { w: 1.3 }) + face(rr(48, 51.4, 16, 2.4, 1), tone('#7FA9DE', -0.6), { w: 1.2 }) + flat(rr(51, 47.6, 10, 3.4, 0.8), '#FFF6E6');
      return s;
    },
  },
  {
    id: 'pecesito', name: 'Pecera redonda', price: 80, w: 74, h: 78, place: 'sobre',
    draw: () => {
      const cx = 37;
      const bowl = 'M20.4 19A30 30 0 0 0 22 70A15 4 0 0 0 52 70A30 30 0 0 0 53.6 19Z';
      let s = surf(37, 75, 25);
      s += shade(bowl, '#DDF0F8', 0.4);
      // agua con su superficie
      s += flat('M12.3 27A30 30 0 0 0 22 70A15 4 0 0 0 52 70A30 30 0 0 0 61.7 27A24.7 6 0 0 0 12.3 27Z', '#8ACFEA', { opacity: 0.9 });
      s += flat(ellD(cx, 27, 24.7, 6), '#B9E4F4', { opacity: 0.95 }) + line('M20 27.6q4 -2 8 0t8 0', '#FFFFFF', 1.2, { opacity: 0.8 });
      // piedritas y algas
      s += part('M15.6 63C24 57 50 57 58.4 63L52 70A15 4 0 0 1 22 70Z', '#F2E2CC', { w: 1.3 });
      s += dots([[21, 63.4], [33, 61.4], [47, 62.6]], 2, '#F7B6C4') + dots([[27, 66], [40, 65], [53, 64.6]], 2, '#A9D2F0') + dots([[36, 68.6], [45.6, 68]], 1.8, '#FFFFFF');
      s += part('M22 62C19 56 23 52 20 46C24 49 26 54 25 61Z', '#6FB07E', { w: 1.2 }) + part('M26 61C26 55 29 52 28 48C31 52 31 57 29 61Z', '#86C49A', { w: 1.1 });
      // pececito de colores con su cola de velo
      const O = '#F7944A';
      s += part('M33 44C28 38 22 39 23 45C22 50 28 52 33 46Z', tone(O, 0.35), { w: 1.2 });
      s += part(ellD(40, 45, 8.4, 5.6), O, { w: 1.4 });
      s += flat('M35 48.6Q40 51.4 46 48.4Q42 47.4 35 48.6Z', tone(O, 0.6));
      s += part('M39 40C40 36 44 36 45 40Z', tone(O, 0.3), { w: 1 });
      s += eye(44.6, 43.6, 1.5) + line('M48 46.2l0.4 0', INK, 1.2);
      s += dots([[51, 39.6, 1.8], [52.6, 34.6, 1.4], [51.4, 30.6, 1.1]], 1.6, '#EAF8FF');
      // vidrio de adelante: contorno, boca y brillos
      s += line(bowl, mix('#8FBCD4', INK, 0.3), 2.2);
      s += face(ellD(cx, 19, 17.6, 4.6), '#E6F4FA', { w: 1.6 }) + flat(ellD(cx, 19.4, 14.4, 3), '#A7D7EC');
      s += shine('M14 38C14 30 18 25 23 22.5C19.6 27 17.6 32 17 39Z', { opacity: 0.7 }) + shine('M56.6 53C58.4 50.6 59.4 48 59.8 45L61.4 45.4C61 48.6 59.8 51.4 58 54Z', { opacity: 0.55 });
      return s;
    },
  },
  {
    id: 'lavalamp', name: 'Lámpara de lava', price: 75, w: 48, h: 100, place: 'sobre',
    draw: () => {
      const M = '#9C8FC0', m = mat(M), L = '#C9A9F0', W = '#FF6FC8', mw = mat(W);
      let s = glow(24, 46, 20, 30, '#FFB6E6', 0.18) + surf(24, 97, 16);
      // base de cono con su anillo
      s += part('M9 95L16 70H32L39 95A15 3.5 0 0 1 9 95Z', M, { w: 1.8 });
      s += shade('M28 70H32L39 95A15 3.5 0 0 1 31 98.2Z', m.deep, 0.28);
      s += line('M10.4 90H37.6', m.hi, 1.4, { opacity: 0.7 }) + shine('M14.6 92L19.4 73H21.2L17 93Z', { opacity: 0.55 });
      // botella de vidrio con el líquido y la lava
      const glass = 'M16.5 70C13 60 13 50 14.5 42C16 34 18.5 28 19.5 22H28.5C29.5 28 32 34 33.5 42C35 50 35 60 31.5 70Z';
      s += part(glass, L, { w: 1.8 });
      s += shade('M28 22H28.5C29.5 28 32 34 33.5 42C35 50 35 60 31.5 70H27C29.4 60 29.6 50 28.6 42C27.8 34 27 28 28 22Z', mat(L).deep, 0.2);
      const blob = (d, hx, hy) => part(d, W, { w: 1.2 }) + gloss(hx, hy, 1.4, 0.9, -40, 0.85);
      s += blob('M17 69.4C16.6 64 20 62 24 63.2C28 62 31.4 64 31 69.4Z', 20.6, 65);
      s += blob('M22 58C18 58 17 53 19 50C20.6 47.4 23.6 47 25 49C27 52 26 58 22 58Z', 20.4, 51);
      s += blob('M21 31C20 27 22 24.6 24.6 25C27 25.4 28 28.4 27 31.4C26 34.4 22 34.4 21 31Z', 22.6, 27.4);
      s += part(ellD(28.4, 42, 2.4, 3), W, { w: 1 }) + shade(ellD(24, 66.4, 6, 1.6), mw.deep, 0.3);
      s += shine('M16.8 62C15.6 54 16 46 17.6 40h1.8C18 46 17.6 54 18.6 62Z', { opacity: 0.7 });
      // tapa
      s += part('M19 22.5L21 11.4C21.5 8.4 26.5 8.4 27 11.4L29 22.5Z', M, { w: 1.6 }) + shine('M21.6 20.6L22.8 12h1.4L23.4 20.6Z', { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'conejito', name: 'Peluche conejito', price: 85, w: 72, h: 104, place: 'piso',
    draw: () => {
      const B = '#F4EEF8', P = '#F7C6D9', m = mat(B);
      let s = floorSh(36, 100, 29, 5);
      // orejas: una parada y otra que se dobla en la punta
      s += part('M25 42C19 28 19 8 25 5C31 4 33 24 31 42Z', B, { w: 1.6 }) + flat('M25.6 37C22.4 27 22.4 13 25.4 10C27.6 12.6 28.6 26 28.2 37Z', P);
      s += part('M42 42C41 30 42 19 46 14C50 9.6 58 11 60 18C57 16.6 53 17.4 51 21.4C49 26 48 34 48 42Z', B, { w: 1.6 }) + flat('M44.6 38C44 29 45 21 48 17.4C50 15.4 53 14.6 55 15.4C52.6 16.6 50.6 18.6 49.4 22C48 26 47.4 32 47.4 38Z', P);
      // cuerpo y patas con almohadillas
      s += part(ellD(36, 79, 21, 19), B, { w: 1.8 });
      s += roundShade(36, 79, 21, 19, B, 0.24, 0.35);
      [21, 51].forEach((x) => {
        s += part(ellD(x, 95, 9.4, 5.8), B, { w: 1.5 });
        s += flat(ellD(x, 95.8, 4.8, 3), P) + dots([[x - 3.6, 92], [x, 91.2], [x + 3.6, 92]], 1.2, P);
      });
      // zanahoria abrazada
      s += part('M24 89L43 72C46 70 49 73 47 76L28 91C26.4 92.4 23 91 24 89Z', '#F7A04B', { w: 1.4 });
      s += line('M30 84.4l2.4 2.4M35 80l2.4 2.4M40 75.6l2.4 2.4', tone('#F7A04B', -1), 1.2, { opacity: 0.8 });
      s += part('M46 72C46 66 50 64 52 66C52 69 49 71 47 73ZM47 73C51 70 56 71 56 74C53 75.6 50 75 47.6 74Z', '#7FC48A', { w: 1.1 });
      s += part(ellD(27, 79, 5.6, 7), B, { w: 1.4 }) + part(ellD(45.6, 78, 5.6, 7), B, { w: 1.4 });
      // cabeza
      s += part(ellD(36, 50, 20, 17), B, { w: 1.8 });
      s += roundShade(36, 50, 20, 17, B, 0.2, 0.32);
      s += eye(29, 49, 2.4) + eye(43, 49, 2.4) + blush(24, 54.6, 3.2) + blush(48, 54.6, 3.2);
      s += part('M34.2 52.6C34.2 51.4 37.8 51.4 37.8 52.6C37.8 53.8 36.6 54.6 36 54.6C35.4 54.6 34.2 53.8 34.2 52.6Z', '#F28CA8', { w: 1 });
      s += catMouth(36, 55.4, 5);
      s += bow(36, 66, 0.55, '#7FA9DE');
      return s;
    },
  },
];

// Las de siempre + las de personalidad (decorVibes.js) + las de
// temporada (`season`, ver seasons.js). Las que reciben pintura
// (`draw(p)`) se pueden teñir con las pinturas de los muebles.
export const DECOR_DEFS = [...DEFS, ...DECOR_VIBES, ...DECOR_HALLOWEEN, ...DECOR_NAVIDAD].map((d) => ({
  ...d,
  vibes: d.vibes || [],
  paintable: d.draw.length > 0,
  h: d.h + FOOT,
  foot: FOOT,
  svg: (paint) => piece(d.w, d.h + FOOT, d.draw(typeof paint === 'object' && paint ? paint : findPaint(paint || 'natural'))),
}));
export const findDecorDef = (id) => DECOR_DEFS.find((d) => d.id === id) || null;
