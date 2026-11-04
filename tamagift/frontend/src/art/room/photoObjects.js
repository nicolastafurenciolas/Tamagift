// ─────────────────────────────────────────────────────────────────
// Objetos con sus fotos (PLAN_REGALO_VIVO.md, etapa 4): un portarretrato
// de mesa, una postal en la pared, una taza y un cojín que llevan una
// foto REAL del regalo (pet.photos[n]).
//
// El kit de cada estilo redibuja el SVG por partes, pero una foto no
// tiene partes: va por el motor de imágenes (Sprite kind="photo", que la
// pixela en pixel, la tiñe en neón…). Por eso cada objeto se arma en
// tres capas que encajan exacto:
//
//   back()   lo de atrás: sombra, cuerpo, marco de atrás, asa
//   (foto)   la imagen en su hueco `photo` { x, y, w, h }, recortada con
//            `clip` (polígono en unidades de la pieza) y girada `rot`°
//   front()  lo de adelante: el borde que tapa el corte de la foto, la
//            sombra de volumen encima (la taza es un cilindro, el cojín
//            se infla), el brillo del vidrio
//
// Misma vista 3/4 que el cuarto (draw.js): frente + tapa a media
// profundidad, lo redondo apoyado es una elipse aplastada, luz de arriba
// a la izquierda. Los giros leves (la postal) solo en vectorial: en pixel
// un borde apenas inclinado da escalones sueltos.
//
// components/game/personal/PhotoObject.jsx las junta; el cuarto las
// trata como decoración (`place`, `w`, `h`, `foot` como en decor.js).
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, INK, piece, G } from './draw.js';
import { surf, heart, dots, gloss, grain, GOLD } from './decorVibes.js';
import { PHOTO_OBJECTS } from '../../personal/catalog.js';

const f1 = (v) => +v.toFixed(1);
const FOOT = 10;
const wallSh = (d, op = 0.16) => G({ transform: 'translate(2.5 3)' }, shade(d, '#2A1C24', op));
const evenodd = { a: { 'fill-rule': 'evenodd' } };
// Giro leve: girado en vectorial, derecho en pixel.
const tilt = (a, cx, cy, inner) => (a
  ? `<g transform="rotate(${a} ${cx} ${cy})" data-skip="pixel">${inner}</g><g data-only="pixel">${inner}</g>`
  : inner);
const poly = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';

// ── Portarretrato de mesa ────────────────────────────────────────
const WOOD = '#C68B5E';
const MARCO = { w: 76, h: 92 + FOOT };
const MARCO_PHOTO = { x: 18, y: 19, w: 40, h: 54 };

function marcoBack() {
  const m = mat(WOOD);
  let s = surf(38, 91, 32);
  // la pata de atrás asoma abajo a la derecha
  s += face('M50 60L64 90.6L58.6 91.6L46 64Z', m.deep, { w: 1.6 });
  // canto de arriba (el grosor del marco visto desde arriba)
  s += face(rrTop(8, 3, 60, 6, 2.4), m.top, { w: 1.8 });
  // fondo del marco (detrás de la foto)
  s += face(rr(6, 6, 64, 84, 4), m.side, { w: 2.2 });
  return piece(MARCO.w, MARCO.h, s);
}

function marcoFront() {
  const m = mat(WOOD);
  const P = MARCO_PHOTO;
  let s = '';
  // marco de madera: el rectángulo de afuera menos el paspartú
  s += face(`${rr(6, 6, 64, 84, 4)}${rr(13, 13, 50, 70, 1.6)}`, WOOD, { w: 2.2, ...evenodd });
  s += grain([[9, 30, 9.6, 0.7], [40, 66, 9.2, 0.7], [9, 34, 87, 0.7], [44, 67, 86.2, 0.6]], WOOD, 0.55);
  s += line('M9.4 20V76M66.6 24V70', m.side, 1.1, { opacity: 0.45 });
  // canto iluminado arriba e izquierda, sombra abajo y derecha
  s += shine('M9 9.4H67L64.4 12H11.6L9 14.6Z', { opacity: 0.4 });
  s += shade('M67 9.4V86.6H9L11.6 84H64.4V12Z', m.deep, 0.22);
  // paspartú (cartón crema) con su bisel hacia adentro
  s += face(`${rr(13, 13, 50, 70, 1.6)}${rr(P.x, P.y, P.w, P.h, 0.6)}`, '#FFF7EA', { w: 1.6, ...evenodd });
  s += flat(`M${P.x} ${P.y}L${P.x - 2.4} ${P.y - 2.4}H${P.x + P.w + 2.4}L${P.x + P.w} ${P.y}Z`, '#E8DCC8');
  s += flat(`M${P.x} ${P.y}L${P.x - 2.4} ${P.y - 2.4}V${P.y + P.h + 2.4}L${P.x} ${P.y + P.h}Z`, '#EFE4D2');
  // la sombrita que el paspartú le hace a la foto
  s += shade(`M${P.x} ${P.y}H${P.x + P.w}V${P.y + 2.6}H${P.x + 2.6}V${P.y + P.h}H${P.x}Z`, '#3A2630', 0.22);
  // vidrio: dos rayas de brillo en diagonal
  s += shade(`M${P.x + 3} ${P.y + 20}L${P.x + 20} ${P.y + 3}H${P.x + 27}L${P.x + 3} ${P.y + 27}Z`, '#FFFFFF', 0.26, { 'data-skip': 'pixel' });
  s += shade(`M${P.x + 3} ${P.y + 31}L${P.x + 31} ${P.y + 3}H${P.x + 34}L${P.x + 3} ${P.y + 34}Z`, '#FFFFFF', 0.18, { 'data-skip': 'pixel' });
  s += shade(`M${P.x + 3} ${P.y + 18}L${P.x + 18} ${P.y + 3}H${P.x + 23}L${P.x + 3} ${P.y + 23}Z`, '#FFFFFF', 0.3, { 'data-only': 'pixel' });
  // corazoncito dorado en el travesaño de abajo
  s += part(heart(38, 86.4, 3.2), GOLD, { w: 1.1 });
  return piece(MARCO.w, MARCO.h, s);
}

// ── Postal en la pared ───────────────────────────────────────────
const POSTAL = { w: 96, h: 80 };
const POSTAL_ROT = -4;
const POSTAL_PHOTO = { x: 11, y: 15, w: 74, h: 50 };

function postalBack() {
  let s = '';
  const card = rr(6, 10, 84, 60, 2);
  s += tilt(POSTAL_ROT, 48, 40, wallSh(card) + part(card, '#FFFDF8', { w: 1.8 }));
  return piece(POSTAL.w, POSTAL.h, s);
}

function postalFront() {
  const P = POSTAL_PHOTO;
  let s = '';
  // el borde blanco que tapa el corte de la foto
  s += face(`${rr(6, 10, 84, 60, 2)}${rr(P.x, P.y, P.w, P.h, 0.4)}`, '#FFFDF8', { w: 1.8, ...evenodd });
  s += line(rr(P.x, P.y, P.w, P.h, 0.4), '#D9CFC4', 1.2, { opacity: 0.8 });
  // papel brillante de foto: un reflejo suave arriba a la izquierda
  s += shine(`M${P.x} ${P.y}H${P.x + 30}L${P.x} ${P.y + 22}Z`, { opacity: 0.16 });
  // un sticker de corazón en la esquina de abajo
  s += part(heart(80, 62, 6.2), '#F25C7A', { w: 1.3 }) + shine(ellD(77.4, 59.4, 1.4, 1), { opacity: 0.8 });
  // la cinta washi que la sostiene, arriba al medio
  const tape = 'M36 4.6L61 6.4L60 16.2L35 14.4Z';
  s += part(tape, '#F7C6D0', { w: 1.2 });
  s += dots([[41, 9], [48, 9.8], [55, 10.6]], 1.4, '#FFFFFF', { opacity: 0.9 });
  s += line('M36 4.6L35.4 9.6L36.2 14.4M61 6.4L60.6 11L60 16.2', '#E8A8B8', 1.1, { opacity: 0.8, 'data-skip': 'pixel' });
  return piece(POSTAL.w, POSTAL.h, tilt(POSTAL_ROT, 48, 40, s));
}

// ── Taza estampada ───────────────────────────────────────────────
const TAZA = { w: 74, h: 70 + FOOT };
const CUP = { cx: 32, rx: 21, top: 20, bottom: 58 };   // cilindro: tapa y base (centro de las elipses)
const RY = CUP.rx * 0.5;
// el estampado sigue la curva del cilindro: arriba 9 debajo del borde,
// abajo 6 encima de la base
const TAZA_U = 0.84;   // cuánto del ancho cubre (en ± radio)
const arcY = (y0, u) => y0 + RY * Math.sqrt(Math.max(0, 1 - u * u));
const tazaClip = (() => {
  const n = 10, top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const u = -TAZA_U + (2 * TAZA_U * i) / n;
    top.push([CUP.cx + u * CUP.rx, arcY(CUP.top + 6, u)]);
    bot.push([CUP.cx + u * CUP.rx, arcY(CUP.bottom - 3.5, u)]);
  }
  return [...top, ...bot.reverse()];
})();
const TAZA_PHOTO = {
  x: f1(CUP.cx - TAZA_U * CUP.rx), y: f1(Math.min(...tazaClip.map((p) => p[1]))),
  w: f1(2 * TAZA_U * CUP.rx), h: f1(Math.max(...tazaClip.map((p) => p[1])) - Math.min(...tazaClip.map((p) => p[1]))),
};
const CERAMIC = '#FFF9F2';
const GLAZE = '#F49FB6';

function tazaBack() {
  const { cx, rx, top, bottom } = CUP;
  const m = mat(CERAMIC);
  let s = surf(cx + 2, bottom + RY - 1, rx + 7);
  // asa: un aro con grosor del lado derecho
  s += part(`M${cx + rx - 2} ${top + 10}C${cx + rx + 15} ${top + 6} ${cx + rx + 18} ${top + 22} ${cx + rx + 14} ${top + 29}C${cx + rx + 10} ${top + 35} ${cx + rx + 3} ${top + 36} ${cx + rx - 2} ${top + 34}V${top + 28.6}C${cx + rx + 3} ${top + 30} ${cx + rx + 7.6} ${top + 28.4} ${cx + rx + 9} ${top + 24.6}C${cx + rx + 10.6} ${top + 19.6} ${cx + rx + 8} ${top + 13.6} ${cx + rx - 2} ${top + 15.4}Z`, GLAZE, { w: 1.7 });
  // cuerpo
  s += face(`M${cx - rx} ${top}V${bottom}A${rx} ${RY} 0 0 0 ${cx + rx} ${bottom}V${top}Z`, CERAMIC, { w: 2 });
  // pie esmaltado de color abajo
  s += flat(`M${cx - rx + 0.6} ${bottom - 3}A${rx} ${RY} 0 0 0 ${cx + rx - 0.6} ${bottom - 3}V${bottom}A${rx} ${RY} 0 0 1 ${cx - rx + 0.6} ${bottom}Z`, GLAZE);
  // boca: borde, interior y el café con un corazón de espuma
  s += face(ellD(cx, top, rx, RY), mix(m.top, '#FFFFFF', 0.4), { w: 1.8 });
  s += flat(ellD(cx, top + 0.8, rx - 2.4, RY - 1.6), tone(CERAMIC, -0.6));
  s += flat(ellD(cx, top + 2.2, rx - 3.4, RY - 3), '#8A5A3C');
  s += flat(heart(cx, top + 1.6, 3.6), '#F4E3CC');
  return piece(TAZA.w, TAZA.h, s);
}

function tazaFront() {
  const { cx, rx, top, bottom } = CUP;
  const m = mat(CERAMIC);
  let s = '';
  // el volumen del cilindro encima de la foto: el lado derecho en sombra,
  // una franja de brillo a la izquierda
  s += shade(`M${cx + rx * 0.42} ${arcY(top, 0.42)}L${cx + rx} ${top}V${bottom}A${rx} ${RY} 0 0 1 ${f1(cx + rx * 0.42)} ${f1(arcY(bottom, 0.42))}Z`, m.deep, 0.24);
  s += shade(`M${cx + rx * 0.74} ${arcY(top, 0.74)}L${cx + rx} ${top}V${bottom}A${rx} ${RY} 0 0 1 ${f1(cx + rx * 0.74)} ${f1(arcY(bottom, 0.74))}Z`, m.deep, 0.16);
  s += shine(`M${f1(cx - rx * 0.7)} ${f1(arcY(top, 0.7) + 2)}H${f1(cx - rx * 0.56)}V${f1(arcY(bottom, 0.56) - 4)}H${f1(cx - rx * 0.7)}Z`, { opacity: 0.55 });
  // un filete fino alrededor del estampado (tapa el corte de la foto)
  s += line(poly(tazaClip), mix(CERAMIC, INK, 0.18), 1.3, { opacity: 0.85 });
  return piece(TAZA.w, TAZA.h, s);
}

// ── Cojín estampado ──────────────────────────────────────────────
const COJIN = { w: 100, h: 84 + FOOT };
const FABRIC = '#F7C6D0';
const PIPING = '#E8798F';
const COJIN_PHOTO = { x: 27, y: 22, w: 46, h: 40 };
// el estampado se infla con el relleno: bordes un poco abombados
const cojinClip = (() => {
  const { x, y, w, h } = COJIN_PHOTO;
  const n = 8, b = 2.4, out = [];
  const bulge = (t) => Math.sin(t * Math.PI) * b;
  for (let i = 0; i <= n; i++) out.push([x + (w * i) / n, y - bulge(i / n) * 0.6]);
  for (let i = 1; i <= n; i++) out.push([x + w + bulge(i / n), y + (h * i) / n]);
  for (let i = 1; i <= n; i++) out.push([x + w - (w * i) / n, y + h + bulge(i / n) * 0.8]);
  for (let i = 1; i < n; i++) out.push([x - bulge(i / n), y + h - (h * i) / n]);
  return out;
})();
const cojinShape = 'M8 10C20 13 34 14 50 13C66 14 80 13 92 10C89 22 88 34 89 44C88 56 89 68 93 80C80 76 66 75 50 76C34 75 20 76 7 80C11 68 12 56 11 44C12 34 11 22 8 10Z';

function cojinBack() {
  const m = mat(FABRIC);
  let s = '';
  s += shade('M8 77C24 85 76 85 93 77C82 90 20 90 8 77Z', '#2A1C24', 0.2);
  s += part(cojinShape, FABRIC, { w: 2.2 });
  // el lado de abajo y la derecha más hundidos
  s += shade('M7 80C20 76 34 75 50 76C66 75 80 76 93 80C82 72 66 70 50 71C34 70 18 72 7 80Z', m.deep, 0.25);
  s += shade('M92 10C89 22 88 34 89 44C88 56 89 68 93 80C86 68 84 56 85 44C84 32 86 20 92 10Z', m.deep, 0.2);
  // ribete de cordón por el borde
  s += line(cojinShape, PIPING, 2.6);
  return piece(COJIN.w, COJIN.h, s);
}

function cojinFront() {
  const m = mat(FABRIC);
  let s = '';
  // tela alrededor del estampado: el borde de la foto queda cosido
  s += line(poly(cojinClip), mix(FABRIC, '#FFFFFF', 0.4), 2, { opacity: 0.95 });
  // volumen del relleno sobre la foto: luz arriba a la izquierda, sombra abajo y a la derecha
  s += shade('M28 24C36 22.6 46 22.4 54 23C44 25.6 35 29 29 36Z', '#FFFFFF', 0.16);
  s += shade('M74 26C75.4 38 75.2 50 73.6 63C62 64.6 46 64.6 30 63.4C46 61 60 58 68 52C72 45 73.6 36 74 26Z', m.deep, 0.18);
  // puntadas de la costura alrededor del estampado
  s += line(poly(cojinClip.map(([x, y]) => [x + (x - 50) * 0.12, y + (y - 42) * 0.14])), m.side, 1.2, { 'stroke-dasharray': '2.6 2.4', opacity: 0.6, 'data-skip': 'pixel' });
  // arrugas de las esquinas (la tela tira hacia la punta)
  s += line('M8 10Q16 16 20 22M92 10Q84 16 80 22M7 80Q14 72 20 68M93 80Q86 72 80 68', m.side, 1.5, { opacity: 0.55 });
  s += line('M14 30Q12 44 15 58M86 30Q88 44 85 58', m.side, 1.2, { opacity: 0.35, 'data-skip': 'pixel' });
  return piece(COJIN.w, COJIN.h, s);
}

// ── El catálogo ──────────────────────────────────────────────────
// `photo`: el hueco de la foto en unidades de la pieza; `clip`: el
// polígono (mismas unidades) o null si es el rectángulo; `rot`: giro en
// grados alrededor de `pivot` (solo en vectorial).
const DEFS = {
  marco: { w: MARCO.w, h: MARCO.h, foot: FOOT, place: 'sobre', back: marcoBack, front: marcoFront, photo: MARCO_PHOTO, clip: null, rot: 0 },
  postal: { w: POSTAL.w, h: POSTAL.h, foot: 0, place: 'sobre', wall: true, back: postalBack, front: postalFront, photo: POSTAL_PHOTO, clip: null, rot: POSTAL_ROT, pivot: [48, 40] },
  taza: { w: TAZA.w, h: TAZA.h, foot: FOOT, place: 'sobre', back: tazaBack, front: tazaFront, photo: TAZA_PHOTO, clip: tazaClip, rot: 0 },
  cojin: { w: COJIN.w, h: COJIN.h, foot: FOOT, place: 'sobre', back: cojinBack, front: cojinFront, photo: COJIN_PHOTO, clip: cojinClip, rot: 0 },
};

export const PHOTO_OBJECT_DEFS = PHOTO_OBJECTS.map((o) => ({ ...o, ...DEFS[o.id], name: o.label }));
export const findPhotoObject = (kind) => PHOTO_OBJECT_DEFS.find((d) => d.id === kind) || null;

/** El recorte de la foto como `clip-path` de CSS (en % de su caja), o null. */
export function photoClipCss(def) {
  if (!def || !def.clip) return null;
  const { x, y, w, h } = def.photo;
  return `polygon(${def.clip.map(([px, py]) => `${f1(((px - x) / w) * 100)}% ${f1(((py - y) / h) * 100)}%`).join(', ')})`;
}

/** Id de decoración de un objeto con foto de la ficha. */
export const photoObjectDecorId = (po) => `foto-${po.id}`;

/**
 * Los objetos con foto de la ficha, listos para el cuarto:
 * [{ id ('foto-…'), kind, name, url, photo (índice), def }]. Se saltean
 * los que apuntan a una foto que ya no existe.
 */
export function photoObjectItems(profile, pet) {
  const photos = (pet && pet.photos) || [];
  return ((profile && profile.photoObjects) || []).map((po) => {
    const def = findPhotoObject(po && po.kind);
    const ph = po && photos[Number(po.photo)];
    if (!def || !ph || !ph.url) return null;
    return { id: photoObjectDecorId(po), kind: def.id, name: def.name, url: ph.url, photo: Number(po.photo), def };
  }).filter(Boolean);
}

/**
 * Los mismos objetos como decoración "subida" (el formato de
 * pet.decor_items que el cuarto y la bandeja ya conocen), con
 * `photoObject` para dibujarlos con PhotoObject:
 * [{ id, name, image, ratio, photoObject: { kind, url, def } }].
 */
export function photoObjectDecor(profile, pet) {
  return photoObjectItems(profile, pet).map((it) => ({
    id: it.id,
    name: `${it.name.split(' ')[0]} con su foto`,
    image: it.url,
    ratio: it.def.w / it.def.h,
    photoObject: { kind: it.kind, url: it.url, def: it.def },
  }));
}

/** Tamaño en el cuarto (×1.25, como la decoración del catálogo). */
export const photoObjectSize = (def) => ({ w: Math.round(def.w * 1.25), h: Math.round(def.h * 1.25), foot: def.foot * 1.25 });
