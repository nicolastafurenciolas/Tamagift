// Lo que va colgado en la pared: se ve de frente; lo que sobresale
// (repisas, alféizar) muestra su cara de arriba como el resto. Lo que
// cuelga tiene su clavo o su cuerda, y deja una sombrita en la pared
// hacia abajo a la derecha (la luz viene de arriba a la izquierda).

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, Cir, Ell, INK, G, tube } from '../draw.js';
import { grain, slab, underShadow, contact, knob, glints, rectPts, ellPts, halo, bulbOn, folds, lumOf, BRASS, STEEL, WARM } from './fun.js';

const f1 = (v) => Math.round(v * 10) / 10;

// sombra que deja en la pared lo que cuelga
const wallShadow = (d, op = 0.16) => G({ transform: 'translate(2.5 3)' }, shade(d, '#2A1C24', op));
// Cordón curvo: en pixel un trazo fino en curva sale punteado; ahí va como
// tubo relleno (sale sólido). En los demás estilos, el trazo de siempre.
const cord = (d, c, w = 2) => G({ 'data-skip': 'pixel' }, line(d, c, w)) + G({ 'data-only': 'pixel' }, tube(d, w + 0.8, c, { w: 0.8 }));
// clavito con su brillo
const nail = (x, y) => part(ellD(x, y, 2.6, 2.6), '#9A8F9E', { w: 1.1 }) + shine(ellD(x - 0.8, y - 0.8, 0.9, 0.9), { opacity: 0.9 });

// Luna creciente de verdad (no un disco tapado con otro: en neón el disco
// de encima se veía como un aro): el círculo (cx, cy, r) menos el círculo
// corrido (dx, dy) de radio r2, con los dos arcos que se cortan.
function crescent(cx, cy, r, dx, dy, r2) {
  const d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  const a = (r * r - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r * r - a * a));
  const px = cx + a * ux, py = cy + a * uy;
  const A = [px - uy * h, py + ux * h], B = [px + uy * h, py - ux * h];
  return `M${f1(A[0])} ${f1(A[1])}A${r} ${r} 0 1 1 ${f1(B[0])} ${f1(B[1])}A${r2} ${r2} 0 0 0 ${f1(A[0])} ${f1(A[1])}Z`;
}

// ── Paisajes de la ventana (dentro del vidrio 24,24 → 140,126) ──
function skyDay(dusk) {
  const sky = dusk ? ['#FFB8A0', '#FFCDB0', '#FFE0C2'] : ['#A9D6F2', '#BFE2F7', '#D6EEFA'];
  let s = face(rr(24, 24, 116, 102, 1.5), sky[0], { w: 1.4 });
  s += flat('M25 52h114v24h-114Z', sky[1]) + flat('M25 76h114v26h-114Z', sky[2]);
  // sol (bajo y naranja al atardecer)
  if (dusk) s += Cir(104, 88, 14, { fill: '#FFD7A0', opacity: 0.6, 'data-r': 'tone' }) + Cir(104, 88, 9, { fill: '#FF9B63', 'data-r': 'flat' });
  else s += Cir(110, 46, 15, { fill: '#FFF4C0', opacity: 0.55, 'data-r': 'tone' }) + Cir(110, 46, 9, { fill: '#FFE07A', 'data-r': 'flat' }) + Cir(108, 44, 4, { fill: '#FFF6CF', 'data-r': 'flat' });
  // nubes de dos tonos
  const cloud = (x, y, k) => flat(`M${x} ${y}c0 -${5 * k} ${7 * k} -${7 * k} ${11 * k} -${3.5 * k}c${2 * k} -${6 * k} ${12 * k} -${6 * k} ${13 * k} ${0.5 * k}c${5 * k} -${1.5 * k} ${9 * k} ${1.5 * k} ${8 * k} ${3 * k}Z`, dusk ? '#FFE6D6' : '#FFFFFF')
    + flat(`M${x + 2 * k} ${y - 0.5}h${28 * k}v${-1.8 * k}h${-28 * k}Z`, dusk ? '#F7C2B4' : '#DDEBF5');
  s += cloud(34, 46, 1.1) + cloud(70, 64, 0.8);
  // colinas, arbolitos y una casita lejana
  s += flat('M25 100C42 88 58 88 74 96C90 86 112 84 139 94V125H25Z', dusk ? '#B58BA6' : '#B3DDB0');
  s += flat('M25 110C44 102 66 104 84 110C102 104 122 104 139 108V125H25Z', dusk ? '#8A7A9A' : '#8DCC8A');
  s += flat('M86 96h10v-6l5 -4l5 4v6Z', dusk ? '#C9A2A8' : '#FFFFFF') + flat('M85 91l11 -8l11 8Z', dusk ? '#A0606E' : '#E98A8A');
  [[40, 106, 5], [50, 104, 4], [118, 104, 5]].forEach(([x, y, r]) => { s += flat(`${ellD(x, y - r, r, r * 1.1)}`, dusk ? '#6E6488' : '#6DB67A') + flat(`M${x - 1} ${y}h2v3h-2Z`, dusk ? '#5A4A60' : '#8A6A50'); });
  return s;
}
function skyNight() {
  let s = face(rr(24, 24, 116, 102, 1.5), '#2E3672', { w: 1.4 });
  s += flat('M25 60h114v30h-114Z', '#3A3F80') + flat('M25 90h114v14h-114Z', '#4A4A8C');
  s += flat(crescent(108, 46, 10.5, 5.5, -3.5, 8.8), '#FFF2B0');
  s += flat(`${ellD(102, 49, 1.6, 1.4)}${ellD(104.4, 42.4, 1.1, 1)}`, '#E8D890');
  s += Cir(108, 46, 16, { fill: '#FFF2B0', opacity: 0.16, 'data-r': 'tone' });
  const star = (x, y, r) => flat(`M${x} ${y - r}L${x + r * 0.35} ${y - r * 0.35}L${x + r} ${y}L${x + r * 0.35} ${y + r * 0.35}L${x} ${y + r}L${x - r * 0.35} ${y + r * 0.35}L${x - r} ${y}L${x - r * 0.35} ${y - r * 0.35}Z`, '#FFF2B0');
  s += star(40, 38, 4) + star(66, 32, 3) + star(56, 58, 2.6) + star(126, 72, 3) + star(36, 70, 2.4);
  [[82, 44], [94, 66], [46, 50], [74, 74], [130, 30]].forEach(([x, y]) => { s += flat(rr(x - 1, y - 1, 2, 2, 0.5), '#E8E4FF'); });
  s += flat('M25 100C42 88 58 88 74 96C90 86 112 84 139 94V125H25Z', '#2A3A5A');
  s += flat('M25 110C44 102 66 104 84 110C102 104 122 104 139 108V125H25Z', '#22304A');
  s += flat('M86 96h10v-6l5 -4l5 4v6Z', '#46587E') + flat('M85 91l11 -8l11 8Z', '#5A5490') + flat('M98.5 91h3.5v3h-3.5Z', '#FFD27A');
  return s;
}

export const WALL_ITEMS = [
  {
    // Ventana de doble hoja: marco con grosor y vetas, el vidrio con el
    // cielo de la hora (y su sombra arriba a la izquierda, donde el marco
    // le tapa la luz), reflejos, alféizar con ménsulas, cortinas plisadas
    // con lazo y la barra con sus argollas. El vidrio queda en
    // (24, 24, 116 × 102): ahí dibuja la lluvia WorldLayer.jsx.
    id: 'ventana', name: 'Ventana', cat: 'pared', price: 130, w: 164, h: 166, place: 'pared', tags: ['dulce', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      const frame = tone(p.wood, 0.25);
      let s = wallShadow(rr(14, 14, 136, 122, 4));
      // marco: moldura de afuera con vetas, luego el cielo
      s += face(rr(14, 14, 136, 122, 4), W.front);
      s += grain(17, 18, 5, 112, W.front, { vertical: true, n: 1, amp: 0.6 }) + grain(142, 18, 5, 112, W.front, { vertical: true, n: 1, amp: 0.6 });
      s += grain(22, 16.5, 120, 5, W.front, { n: 1, amp: 0.6 });
      s += line('M18 16.4H146', W.hi, 1.5, { opacity: 0.8 });
      const day = skyDay(p.dusk), night = skyNight();
      if (p.night) s += night;
      else s += G({ 'data-skip': 'lofi neon' }, day) + G({ 'data-only': 'lofi neon' }, night);
      s += shade('M25 25H139V31H31V125H25Z', '#2A2050', 0.22);
      s += glints(rectPts(25, 25, 54, 47), { at: 0.22, op: 0.5 }) + glints(rectPts(86, 79, 53, 46), { at: 0.2, op: 0.35 });
      // hojas: travesaño y parante con su luz
      s += face(rr(79, 23, 7, 104, 1.5), frame, { w: 1.6 }) + face(rr(23, 72, 118, 7, 1.5), frame, { w: 1.6 });
      s += flat(rr(80.4, 25, 1.6, 46, 0.8), tone(frame, 1.2)) + flat(rr(25, 73.3, 53, 1.6, 0.8), tone(frame, 1.2));
      s += knob(82.5, 92, 2.4, BRASS);
      // alféizar con su canto, sombra en la pared y ménsulas
      s += shade('M10 150H154V156H10Z', '#2A1C24', 0.18);
      [22, 142].forEach((x) => { s += face(`M${x - 5} 150H${x + 5}V152Q${x + 5} 160 ${x - 3} 162H${x - 5}Z`, W.side, { w: 1.5 }); });
      s += slab(6, 150, 152, 8, 20, p.wood);
      // macetita con una suculenta, en el alféizar
      s += contact(126, 141.5, 8);
      s += face('M119 132H133L131.5 141.5Q126 143 120.5 141.5Z', '#E9A27E', { w: 1.4 }) + face(rr(118, 129.5, 16, 4, 1.5), '#F2B996', { w: 1.3 });
      s += part('M126 130C120 129 118 124 121 121C123 124 125 126 126 130Z', '#79BE8A', { w: 1.2 }) + part('M126 130C132 129 134 124 131 121C129 124 127 126 126 130Z', '#79BE8A', { w: 1.2 }) + part('M126 130C123 125 124 119 126 116C128 119 129 125 126 130Z', '#9AD3A4', { w: 1.2 });
      // cortinas: paño plisado que cae, recogido con un lazo
      const curtain = (k) => {
        const X = (v) => (k < 0 ? v : 164 - v);
        const d = `M${X(6)} 9H${X(30)}C${X(30)} 36 ${X(34)} 66 ${X(32)} 88C${X(31)} 94 ${X(26)} 98 ${X(24)} 100C${X(28)} 108 ${X(30)} 120 ${X(30)} 140Q${X(23)} 143 ${X(18)} 140Q${X(12)} 143 ${X(5)} 140C${X(6)} 120 ${X(10)} 108 ${X(14)} 100C${X(9)} 92 ${X(6)} 70 ${X(6)} 9Z`;
        let c = part(d, C.front, { w: 1.8 });
        c += line(`M${X(13)} 12C${X(13)} 40 ${X(16)} 70 ${X(18)} 94M${X(22)} 12C${X(22)} 40 ${X(25)} 68 ${X(26)} 90M${X(14)} 106C${X(13)} 118 ${X(12)} 130 ${X(11)} 139M${X(23)} 106C${X(24)} 118 ${X(25)} 130 ${X(24)} 139`, C.side, 1.4, { opacity: 0.55 });
        c += flat(`M${X(9)} 12C${X(9)} 40 ${X(11)} 68 ${X(14)} 92L${X(16)} 92C${X(13)} 68 ${X(11)} 40 ${X(11)} 12Z`, C.hi, { opacity: 0.7 });
        c += part(`M${X(10)} 96Q${X(20)} 102 ${X(32)} 95L${X(33)} 100Q${X(20)} 107 ${X(9)} 101Z`, p.accent === '#FFFFFF' ? tone(p.cloth, -0.6) : p.accent, { w: 1.4 });
        c += part(ellD(X(30), 98, 3.6, 3.2), p.accent === '#FFFFFF' ? tone(p.cloth, -0.6) : p.accent, { w: 1.2 });
        return c;
      };
      s += curtain(-1) + curtain(1);
      // barra con argollas y remates
      s += face(rr(3, 4.5, 158, 5, 2.5), tone(p.wood, -0.3), { w: 1.5 }) + flat(rr(6, 5.6, 152, 1.4, 0.7), W.hi);
      [12, 20, 28, 136, 144, 152].forEach((x) => { s += part(ellD(x, 9, 2.6, 2.6), BRASS, { w: 1 }); });
      s += part(ellD(4, 7, 4.5, 4.5), W.top, { w: 1.4 }) + part(ellD(160, 7, 4.5, 4.5), W.top, { w: 1.4 });
      return s;
    },
  },
  {
    // Ojo de buey de noche: aro con grosor y cuatro dovelas, bisel en
    // sombra arriba a la izquierda, cielo con luna (y sus cráteres),
    // estrellas, una nube que pasa, y una velita encendida en el
    // alféizar. El vidrio es el círculo (62, 60) r 46 (WorldLayer.jsx).
    id: 'ventanaRedonda', name: 'Ventana de noche', cat: 'pared', price: 120, w: 124, h: 130, place: 'pared', tags: ['aesthetic', 'gotico', 'angelical'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = wallShadow(ellD(62, 60, 56, 56));
      s += face(ellD(62, 60, 56, 56), W.front);
      s += line(`M${f1(62 - 52 * 0.7)} ${f1(60 - 52 * 0.7)}A52 52 0 0 1 ${f1(62 + 52 * 0.7)} ${f1(60 - 52 * 0.7)}`, W.hi, 1.6, { opacity: 0.8 });
      // dovelas en los cuatro puntos
      [[62, 7, 10, 8], [62, 113, 10, 8], [9, 60, 8, 10], [115, 60, 8, 10]].forEach(([x, y, w, h]) => { s += face(rr(x - w / 2, y - h / 2, w, h, 1.5), W.top, { w: 1.5 }); });
      // cielo
      s += face(ellD(62, 60, 46, 46), '#2B3466', { w: 1.6 });
      s += flat('M17 70A46 46 0 0 0 107 70Z', '#353D78') + flat('M22 86A46 46 0 0 0 102 86Z', '#43468A');
      s += flat(crescent(78, 40, 12.5, 6.5, -4, 10.5), '#FFF2B0');
      s += Cir(78, 40, 19, { fill: '#FFF2B0', opacity: 0.14, 'data-r': 'tone' });
      s += flat(`${ellD(70.6, 44, 2, 1.8)}${ellD(73.4, 36.4, 1.4, 1.3)}${ellD(76, 48.6, 1.4, 1.2)}`, '#E8D890');
      const star = (x, y, r) => flat(`M${x} ${y - r}L${x + r * 0.35} ${y - r * 0.35}L${x + r} ${y}L${x + r * 0.35} ${y + r * 0.35}L${x} ${y + r}L${x - r * 0.35} ${y + r * 0.35}L${x - r} ${y}L${x - r * 0.35} ${y - r * 0.35}Z`, '#FFF2B0');
      s += star(36, 42, 4) + star(48, 76, 3) + star(90, 74, 3.4) + star(44, 26, 2.4);
      [[58, 34], [30, 62], [96, 56], [70, 86]].forEach(([x, y]) => { s += flat(rr(x - 1, y - 1, 2, 2, 0.5), '#E8E4FF'); });
      s += flat('M58 58c0 -4 5 -6 9 -3c2 -5 11 -5 12 1c4 -1 7 2 6 4Z', '#5C62A8') + flat('M62 53.4c2 -2 5 -2 7 0', '#7A80C0');
      // bisel (sombra del aro sobre el vidrio) y reflejos
      s += shade(`${ellD(62, 60, 46, 46)}${ellD(65, 63, 44, 44)}`, '#141838', 0.35, { 'fill-rule': 'evenodd' });
      s += glints(ellPts(62, 60, 46, 46), { at: 0.2, op: 0.3, w1: 5, w2: 2.2, gap: 4 });
      // cruz
      s += face(rr(59, 14, 6, 92, 1.5), W.top, { w: 1.5 }) + face(rr(16, 57, 92, 6, 1.5), W.top, { w: 1.5 });
      s += flat(rr(60.2, 16, 1.4, 40, 0.7), W.hi) + flat(rr(18, 58.2, 40, 1.4, 0.7), W.hi);
      // alféizar con una velita encendida
      s += shade('M18 124H106V129H18Z', '#2A1C24', 0.18);
      s += slab(14, 124, 96, 6, 14, p.wood);
      s += halo(94, 104, 16, 16, WARM, 0.9);
      s += contact(94, 117.5, 6);
      s += face(rr(89.5, 106, 9, 11.5, 2), '#FFF4E6', { w: 1.4 }) + flat(rr(91, 107.5, 2, 8, 1), '#FFFFFF');
      s += line('M94 106V103.6', INK, 1.2);
      s += part('M94 96.5C96.6 99.5 96.6 102.6 94 103.4C91.4 102.6 91.4 99.5 94 96.5Z', '#FFC74A', { w: 1.1 }) + shine(ellD(94, 101.3, 1, 1.5), { opacity: 1 });
      return s;
    },
  },
  {
    // Repisa de madera con ménsulas talladas: libros (uno recostado),
    // una plantita en su maceta, un portarretrato y un frasquito, cada
    // cosa con su sombra sobre la tabla.
    id: 'repisa', name: 'Repisa', cat: 'pared', price: 60, w: 146, h: 86, place: 'pared', tags: ['dulce', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      const acc = p.accent === '#FFFFFF' ? '#F7A6B9' : p.accent;
      let s = '';
      // sombra en la pared y ménsulas
      s += shade('M8 64H140V72H8Z', '#2A1C24', 0.16);
      [24, 122].forEach((x) => {
        s += wallShadow(`M${x - 4} 64H${x + 4}V67Q${x + 4} 80 ${x - 2} 84H${x - 4}Z`);
        s += face(`M${x - 4} 64H${x + 4}V67Q${x + 4} 80 ${x - 2} 84H${x - 4}Z`, W.side, { w: 1.5 });
        s += flat(`M${x - 2.6} 66H${x - 1}V81H${x - 2.6}Z`, W.front, { opacity: 0.8 });
      });
      // libros parados y uno recostado
      const book = (x, w, h, c, band) => {
        let b = contact(x + w / 2, 52, w * 0.6, 0.22);
        b += face(rr(x, 52 - h, w, h, 1), c, { w: 1.3 }) + flat(rr(x + 0.8, 52 - h + 0.6, w - 1.6, 1.8, 0.6), '#FFF6E2');
        b += flat(rr(x, 52 - h * band, w, 2.4, 0), tone(c, 1)) + flat(rr(x, 52 - h * band + 4, w, 1.6, 0), tone(c, 1));
        return b;
      };
      s += book(13, 8, 30, '#E57B93', 0.78) + book(21, 7, 26, '#7FA9DE', 0.7) + book(28, 9, 33, '#F2C14E', 0.8) + book(37, 7, 28, p.cloth, 0.72);
      s += part('M45 52L57 27L62.6 29.4L50.6 54.4Z', '#7FB894', { w: 1.3 }) + flat('M47 49.6L58.6 26.8L59.8 27.3L48.2 50.1Z', '#FFF6E2');
      // plantita
      s += contact(76, 52, 9);
      s += face('M69 40H83L81.5 51.5Q76 53 70.5 51.5Z', mix(p.cloth, '#FFFFFF', 0.3), { w: 1.4 }) + face(rr(68, 37, 16, 4.5, 1.8), tone(mix(p.cloth, '#FFFFFF', 0.3), 0.7), { w: 1.3 });
      s += flat('M70 44.5H82V46H70Z', tone(mix(p.cloth, '#FFFFFF', 0.3), -0.6));
      s += part('M76 38C68 36 65 28 68 24C72 27 75 31 76 38Z', '#5FA872', { w: 1.3 }) + part('M76 38C84 36 87 28 84 24C80 27 77 31 76 38Z', '#5FA872', { w: 1.3 });
      s += part('M76 38C72 31 73 22 76 17C79 22 80 31 76 38Z', '#8DCB97', { w: 1.3 }) + line('M76 36V22', '#4E8C60', 1, { opacity: 0.6 });
      // portarretrato recostado contra la pared
      s += contact(102, 52, 10, 0.22);
      s += face('M92 52L94 28H112L114 52Z', W.front, { w: 1.4 }) + face('M96 48L97.4 32H108.6L110 48Z', '#FFF6EE', { w: 1.2 });
      s += flat('M97.6 47L98.6 35H107.4L108.4 47Z', '#BFE0F5') + flat('M98 47L101 41L104 44L106 41.5L108.2 47Z', '#8DCC8A') + part('M103 40.6C101.2 39 100.4 37.6 101.4 36.8C102.2 36.2 103 36.8 103 37.2C103 36.8 103.8 36.2 104.6 36.8C105.6 37.6 104.8 39 103 40.6Z', acc, { w: 0.8 });
      // frasquito con bolitas de dulce
      s += contact(126, 52, 7);
      s += face('M119 36H133V49Q133 52 130 52H122Q119 52 119 49Z', '#E4F2F8', { w: 1.4 });
      s += flat('M120.4 43H131.6V48.6Q131.6 50.6 129.6 50.6H122.4Q120.4 50.6 120.4 48.6Z', acc, { opacity: 0.9 });
      s += Cir(123.6, 44.6, 1.6, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'flat' }) + Cir(128, 46.8, 1.4, { fill: '#FFFFFF', opacity: 0.7, 'data-r': 'flat' });
      s += face(rr(118, 32, 16, 5, 1.8), p.wood, { w: 1.3 }) + shine(rr(120.6, 39, 2, 9, 1), { opacity: 0.75 });
      // la tabla: tapa con vetas y canto, con su sombra debajo
      s += slab(4, 64, 138, 8, 24, p.wood);
      return s;
    },
  },
  {
    // Guirnalda de luces: cable en dos guirnaldas colgado de tres
    // clavitos, con bombillos encendidos (halo, vidrio de color y centro
    // blanco) que cuelgan de su portalámparas.
    id: 'guirnalda', name: 'Guirnalda de luces', cat: 'luces', price: 85, w: 228, h: 80, place: 'pared', tags: ['dulce', 'aesthetic', 'y2k', 'princesa'],
    draw: (p) => {
      const P = [[8, 9], [61, 54], [114, 9], [167, 54], [220, 9]];
      const at = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
      const cols = [WARM, p.cloth, p.accent === '#FFFFFF' ? '#BFE0F5' : p.accent];
      let s = '';
      const pts = [];
      [0.2, 0.5, 0.8].forEach((t) => pts.push(at(P[0], P[1], P[2], t)));
      [0.2, 0.5, 0.8].forEach((t) => pts.push(at(P[2], P[3], P[4], t)));
      pts.splice(3, 0, [114, 14]);
      pts.forEach(([x, y], i) => { s += halo(x, y + 12, 15, 15, cols[i % 3] === WARM ? WARM : mix(cols[i % 3], '#FFFFFF', 0.3), 0.85); });
      s += cord(`M${P[0][0]} ${P[0][1]}Q${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]}Q${P[3][0]} ${P[3][1]} ${P[4][0]} ${P[4][1]}`, '#5E4E58', 2);
      s += nail(8, 8) + nail(114, 8) + nail(220, 8);
      pts.forEach(([x, y], i) => {
        const c = cols[i % 3];
        // vidrio con color (si es muy pálido, en retro se confunde con la pared y parece apagado)
        const glass = c === WARM ? '#FFD98A' : mix(c, '#FFFFFF', 0.25);
        s += face(rr(x - 2.6, y - 1, 5.2, 6, 1.2), '#7A6A72', { w: 1.1 });
        s += part(`M${f1(x)} ${f1(y + 5)}C${f1(x - 6.5)} ${f1(y + 7)} ${f1(x - 6)} ${f1(y + 18)} ${f1(x)} ${f1(y + 18.5)}C${f1(x + 6)} ${f1(y + 18)} ${f1(x + 6.5)} ${f1(y + 7)} ${f1(x)} ${f1(y + 5)}Z`, glass, { w: 1.4 });
        s += flat(ellD(x, y + 12.6, 2.6, 3.6), mix(glass, '#FFFFFF', 0.6));
        s += shine(ellD(x - 2.2, y + 10, 1.2, 2), { opacity: 0.95 });
      });
      return s;
    },
  },
  {
    // Banderines de tela colgados de un cordón: cada uno con su dobladillo
    // arriba, un poquito de vaivén y un estampado sencillo.
    id: 'banderines', name: 'Banderines', cat: 'pared', price: 70, w: 240, h: 76, place: 'pared', tags: ['dulce', 'hippie', 'y2k'],
    draw: (p) => {
      const acc = p.accent === '#FFFFFF' ? '#F7D56B' : p.accent;
      // con una tela muy clara, la cuarta bandera va de la madera (si no, todo se ve blanco)
      const pale = lumOf(p.cloth) > 0.78;
      const cols = [p.cloth, '#FFFDF6', acc, pale ? mix(p.wood, '#FFFFFF', 0.15) : mix(p.cloth, '#FFFFFF', 0.5)];
      const dot = pale ? tone(p.wood, -0.2) : p.cloth;
      const yAt = (x) => { const t = (x - 6) / 228; return 9 + 2 * (1 - t) * t * 30 + 0; };
      let s = cord('M6 9Q120 69 234 9', '#8C7A70', 2);
      s += nail(6, 8) + nail(234, 8);
      for (let i = 0; i < 8; i++) {
        const x = 6 + ((i + 0.5) / 8) * 228;
        const xl = x - 12, xr = x + 12, yl = yAt(xl), yr = yAt(xr);
        const sway = [1.5, -1, 0.5, -1.5, 1, -0.5, 1.5, -1][i];
        const tipX = x + sway, tipY = (yl + yr) / 2 + 27 + (i % 3 === 1 ? 2 : 0);
        const c = cols[i % 4];
        const flag = `M${f1(xl)} ${f1(yl)}L${f1(xr)} ${f1(yr)}L${f1(tipX)} ${f1(tipY)}Z`;
        s += G({ transform: 'translate(2 2.5)' }, shade(flag, '#2A1C24', 0.12));
        s += part(flag, c, { w: 1.5 });
        s += shade(`M${f1(x)} ${f1((yl + yr) / 2 + 1)}L${f1(xr - 1)} ${f1(yr + 1)}L${f1(tipX)} ${f1(tipY - 1)}Z`, tone(c, -1.2), 0.18);
        s += flat(`M${f1(xl + 0.8)} ${f1(yl + 0.6)}L${f1(xr - 0.8)} ${f1(yr + 0.6)}L${f1(xr - 1.8)} ${f1(yr + 3.6)}L${f1(xl + 1.8)} ${f1(yl + 3.6)}Z`, tone(c, c === '#FFFDF6' ? -0.5 : -0.7));
        const cy = (yl + yr) / 2 + 11, cx = x + sway * 0.3;
        if (i % 4 === 0) s += flat(`${ellD(cx - 4, cy - 1, 1.6, 1.6)}${ellD(cx + 4, cy - 1.4, 1.6, 1.6)}${ellD(cx, cy + 5, 1.6, 1.6)}`, pale ? dot : '#FFFFFF', { opacity: 0.9 });
        else if (i % 4 === 1) s += flat(`M${f1(cx)} ${f1(cy + 4)}C${f1(cx - 5)} ${f1(cy + 0.5)} ${f1(cx - 4)} ${f1(cy - 4)} ${f1(cx)} ${f1(cy - 1.5)}C${f1(cx + 4)} ${f1(cy - 4)} ${f1(cx + 5)} ${f1(cy + 0.5)} ${f1(cx)} ${f1(cy + 4)}Z`, dot);
        else if (i % 4 === 3) s += flat(`M${f1(xl + 5)} ${f1(cy - 3)}H${f1(xr - 5)}L${f1(xr - 6.4)} ${f1(cy)}H${f1(xl + 6.4)}Z`, '#FFFFFF', { opacity: 0.85 });
      }
      return s;
    },
  },
  {
    // Reloj gatito: orejas con su interior rosado, aro con grosor, esfera
    // con marcas, agujas, vidrio con reflejo, bigotes y la cola que hace
    // de péndulo.
    id: 'reloj', name: 'Reloj gatito', cat: 'pared', price: 75, w: 84, h: 92, place: 'pared', tags: ['dulce', 'rustico'],
    draw: (p) => {
      const C = mat(p.cloth);
      const acc = p.accent === '#FFFFFF' ? '#E57B93' : p.accent;
      let s = wallShadow(ellD(42, 50, 34, 34));
      // cola-péndulo (detrás)
      s += part('M44 80C46 86 54 86 56 82C58 78 62 79 62 83C62 90 52 93 46 89C42 86 41 82 44 80Z', C.side, { w: 1.6 });
      // orejas
      s += part('M14 32L18 6L36 20Z', C.front, { w: 1.7 }) + part('M70 32L66 6L48 20Z', C.front, { w: 1.7 });
      s += flat('M18.6 24L20.4 12L29.4 19.4Z', '#FFB3C4') + flat('M65.4 24L63.6 12L54.6 19.4Z', '#FFB3C4');
      // aro con grosor (luz arriba a la izquierda) y esfera
      s += face(ellD(42, 50, 34, 34), C.front);
      s += line('M17 33A30 30 0 0 1 50 18.6', C.hi, 2, { opacity: 0.75 });
      s += face(ellD(42, 50, 27, 27), C.side, { w: 1.5 });
      s += face(ellD(42.6, 50.6, 25, 25), '#FFFDF6', { w: 1.3 });
      [[42, 29, 2.4, 5], [63.4, 50.6, 5, 2.4], [42, 71.4, 2.4, 5], [21.6, 50.6, 5, 2.4]].forEach(([x, y, w, h]) => { s += flat(rr(x - w / 2, y - h / 2, w, h, 1), INK); });
      [30, 60, 120, 150, 210, 240, 300, 330].forEach((a) => { const r = (a * Math.PI) / 180; s += flat(ellD(f1(42.6 + Math.sin(r) * 20), f1(50.6 - Math.cos(r) * 20), 1.1, 1.1), '#9A8F9E'); });
      // agujas y centro
      s += part('M41 51.6L40.6 35.6Q42.6 33 44.6 35.6L44.2 51.6Z', INK, { w: 0.6 }) + part('M42.2 49.4L54.6 54.4L53.6 57L41.6 52.6Z', INK, { w: 0.6 });
      s += part(ellD(42.6, 50.6, 2.8, 2.8), acc, { w: 1 });
      // vidrio
      s += G({ 'data-skip': 'pixel' }, glints(ellPts(42.6, 50.6, 25, 25), { at: 0.18, op: 0.4 }));
      // bigotes y naricita sobre el aro
      s += line('M9 52H2M9 57L2 59.6M75 52H82M75 57L82 59.6', INK, 1.5);
      return s;
    },
  },
  {
    // Cuadro de paisaje: moldura con vetas y un escalón más claro, tela
    // pintada (cielo, montañas con nieve, lago, pinos y flores), placa de
    // bronce y el hilo del clavo.
    id: 'cuadro', name: 'Cuadro de paisaje', cat: 'pared', price: 90, w: 124, h: 104, place: 'pared', tags: ['elegante', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = line('M38 17L62 4L86 17', '#8C7A70', 1.4) + nail(62, 4);
      s += wallShadow(rr(6, 16, 112, 84, 3));
      s += face(rr(6, 16, 112, 84, 3), W.front);
      s += grain(9, 18.5, 106, 4, W.front, { n: 1, amp: 0.6 }) + grain(9, 93.5, 106, 4, W.front, { n: 1, amp: 0.6 });
      s += line('M10 18.4H114', W.hi, 1.4, { opacity: 0.8 });
      s += face(rr(12, 22, 100, 72, 2), W.top, { w: 1.5 });
      // la pintura
      s += face(rr(16, 26, 92, 64, 1), '#BFE0F2', { w: 1.3 });
      s += flat('M17 27h90v14h-90Z', '#A6D2EE');
      s += Cir(86, 40, 9, { fill: '#FFF3C2', opacity: 0.6, 'data-r': 'tone' }) + Cir(86, 40, 6, { fill: '#FFD97A', 'data-r': 'flat' });
      s += flat('M28 38c0 -4 6 -5 8 -2c2 -3 8 -2 8 2Z', '#FFFFFF');
      s += flat('M17 68L36 46L50 58L64 44L84 62L107 50V74H17Z', '#A9A4D2');
      s += flat('M17 74L40 52L56 66L72 54L107 76V80H17Z', '#6E9E8A');
      s += flat('M40 52L35 57.6L39 56.4L42 58.8L45 55.6Z', '#FFFFFF') + flat('M72 54L68 57.6L71 57L73.6 59L76.4 57Z', '#FFFFFF');
      s += flat('M17 76H107V82H17Z', '#7FB7DA') + line('M30 78.6H46M64 79H86', '#D8EEF8', 1.3);
      s += flat('M17 82Q44 79 62 82T107 81V89H17Z', '#8CC27E');
      [[26, 82, 9], [96, 81, 8]].forEach(([x, y, h]) => { s += flat(`M${x} ${y - h}L${x + 4} ${y - 2}H${x - 4}Z`, '#3F7A5A') + flat(`M${x} ${y - h + 3}L${x + 5} ${y}H${x - 5}Z`, '#4E8C68'); });
      [[50, 86, '#FFFFFF'], [56, 85, '#FFB3C4'], [74, 86.4, '#FFE07A']].forEach(([x, y, c]) => { s += flat(rr(x - 1, y - 1, 2.2, 2.2, 0.6), c); });
      s += shade('M17 27H107V30H20V89H17Z', '#2A1C24', 0.22);
      // placa de bronce
      s += face(rr(54, 95, 16, 4.4, 1), BRASS, { w: 1 });
      return s;
    },
  },
  {
    // Pizarra de corcho: marco de madera, corcho con su granito, dos
    // polaroids, notas adhesivas (una con la punta levantada), un
    // corazón de papel y chinches con brillo.
    id: 'corcho', name: 'Pizarra de corcho', cat: 'pared', price: 80, w: 142, h: 108, place: 'pared', tags: ['aesthetic', 'y2k', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood);
      const CORK = '#C8A272';
      let s = wallShadow(rr(6, 6, 130, 96, 4));
      s += face(rr(6, 6, 130, 96, 4), W.front);
      s += grain(9, 8.5, 124, 4, W.front, { n: 1, amp: 0.6 }) + grain(9, 95, 124, 4, W.front, { n: 1, amp: 0.6 });
      s += line('M10 8.4H132', W.hi, 1.4, { opacity: 0.8 });
      s += face(rr(14, 14, 114, 80, 2), CORK, { w: 1.4 });
      // granito del corcho, en racimos
      s += flat('M20 30h2v2h-2ZM23 32h2v2h-2ZM60 20h2v2h-2ZM63 18h2v2h-2ZM90 50h2v2h-2ZM87 52h2v2h-2ZM20 80h2v2h-2ZM24 84h2v2h-2ZM112 88h2v2h-2ZM115 85h2v2h-2ZM70 84h2v2h-2Z', '#A8805A');
      s += flat('M28 22h2v2h-2ZM98 18h2v2h-2ZM54 60h2v2h-2ZM118 40h2v2h-2ZM44 88h2v2h-2Z', '#E6C49C');
      s += shade('M15 15H127V19H19V93H15Z', '#2A1C24', 0.2);
      // polaroid 1 (ladeada)
      s += shade('M24 23L54 19L58 53L28 57Z', '#2A1C24', 0.18);
      s += face('M22 21L52 17L56 51L26 55Z', '#FFFFFF', { w: 1.4 });
      s += flat('M25 24L49 21L51.6 42L27.6 45Z', '#9FCBE8') + flat('M26.6 40L32 33L37 38L42 31L50.8 39L51.2 41.6L27.6 44.6Z', '#8DCC8A');
      // nota amarilla con renglones y la punta levantada
      s += shade('M70 24h28v26h-28Z', '#2A1C24', 0.18);
      s += face('M68 22h28v20l-6 6h-22Z', '#FFE58A', { w: 1.4 });
      s += part('M96 42l-6 6v-6Z', '#E9C860', { w: 1.1 });
      s += line('M72 29h20M72 34h16M72 39h12', '#C9A548', 1.2);
      // polaroid 2
      s += shade('M102 51l26 4l-4 32l-26 -4Z', '#2A1C24', 0.18);
      s += face('M100 49l26 4l-4 32l-26 -4Z', '#FFFFFF', { w: 1.4 });
      s += flat('M102.4 52.6l20.6 3.2l-2.8 21.8l-20.6 -3.2Z', '#F7B6C4') + flat(ellD(111, 64, 4, 4), '#FFE0EA');
      // corazón de papel
      s += part('M64 64C56 58 54 52 58 48C61 46 64 48 64 50C64 48 67 46 70 48C74 52 72 58 64 64Z', p.cloth, { w: 1.4 });
      s += shine(ellD(60, 51, 1.4, 1.2), { opacity: 0.7 });
      // nota verde
      s += shade('M32 72h34v20h-34Z', '#2A1C24', 0.18);
      s += face('M30 70h34v20h-34Z', '#BDE5CF', { w: 1.4 }) + line('M34 76h26M34 82h20', '#7FB894', 1.2);
      // chinches
      const pin = (x, y, c) => contact(x + 1.4, y + 2.6, 3, 0.25) + part(ellD(x, y, 3.4, 3.4), c, { w: 1.2 }) + shine(ellD(x - 1, y - 1.1, 1.1, 1.1), { opacity: 0.9 });
      s += pin(37, 21, p.cloth) + pin(82, 21, '#7FA9DE') + pin(112, 52, '#F2C14E') + pin(47, 70, '#7FB894');
      return s;
    },
  },
  {
    // Letrero de neón: tablero oscuro sobre separadores de metal, el tubo
    // del corazón encendido (resplandor, tubo de color y alma blanca), dos
    // destellos y la luz que tiñe la pared alrededor.
    id: 'letrero', name: 'Letrero neón', cat: 'luces', price: 140, w: 120, h: 100, place: 'pared', tags: ['y2k', 'aesthetic', 'rockero'],
    draw: (p) => {
      const glow = p.cloth;
      const spark = p.accent === '#FFFFFF' ? '#BFE0F5' : p.accent;
      let s = halo(60, 50, 60, 50, mix(glow, '#FFFFFF', 0.3), 0.8);
      s += wallShadow(rr(6, 8, 108, 84, 10));
      s += face(rr(6, 8, 108, 84, 10), '#2A2433', { w: 2 });
      s += line('M14 10.6H106', '#4A4258', 1.6, { opacity: 0.9 });
      const heart = 'M60 74C40 60 30 48 34 36C38 26 52 24 60 36C68 24 82 26 86 36C90 48 80 60 60 74Z';
      s += T(heart, glow, 0.3, 11) + T(heart, glow, 0.45, 7) + T(heart, glow, 1, 4) + T(heart, '#FFFFFF', 0.95, 1.6);
      const sp = (x, y, r) => flat(`M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}Z`, spark);
      s += sp(92, 26, 5.5) + sp(28, 66, 4);
      // separadores de metal en las esquinas
      [[16, 18], [104, 18], [16, 82], [104, 82]].forEach(([x, y]) => { s += part(ellD(x, y, 3.2, 3.2), STEEL, { w: 1.1 }) + shine(ellD(x - 1, y - 1, 1, 1), { opacity: 0.9 }); });
      return s;
    },
  },
];

// tubo de luz (trazo)
function T(d, c, op, w) {
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" data-r="line"/>`;
}

// Marco de un póster: la foto va encima, en `photo`. Lo cuelga un hilo de
// un clavito, como el cuadro; moldura con vetas, escalón claro y un
// paspartú con su corte en bisel.
export const POSTER_FRAME = { w: 120, h: 156, photo: { x: 17, y: 30, w: 86, h: 112 } };
export function posterFrameDraw(p) {
  const W = mat(p.wood);
  let s = line('M40 17L60 4L80 17', '#8C7A70', 1.4) + nail(60, 4);
  s += wallShadow(rr(4, 16, 112, 136, 3));
  s += face(rr(4, 16, 112, 136, 3), W.front);
  s += grain(7, 18.4, 106, 3.6, W.front, { n: 1, amp: 0.6 }) + grain(7, 146, 106, 3.6, W.front, { n: 1, amp: 0.6 });
  s += line('M8 18.4H112', W.hi, 1.4, { opacity: 0.8 });
  s += face(rr(9, 21, 102, 126, 2), W.top, { w: 1.4 });
  s += face(rr(12, 24, 96, 120, 1), '#FFF8EE', { w: 1.3 });
  s += shade('M12.6 24.6H107.4V27.6H15.6V143.4H12.6Z', '#2A1C24', 0.14);
  s += face(rr(16, 29, 88, 114, 1), '#D9D2DE', { w: 1.2 });
  s += line('M16 143.6H104.4V29', '#FFFFFF', 1.4, { opacity: 0.8 });
  return s;
}
