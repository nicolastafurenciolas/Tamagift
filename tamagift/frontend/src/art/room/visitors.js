// ─────────────────────────────────────────────────────────────────
// Los visitantes que vuelven (personal/stories.js): entran por la
// puerta del cuarto y se quedan de pie al lado del tapete.
//
//   cartero    Tobi: un perrito mochi con gorra de cartero y su bolso
//              de cuero, con una carta de corazón asomando
//   vecinita   Mimi: una conejita mochi de orejas caídas, con su
//              vestido, flor en el pelo y la canasta (siempre trae algo)
//   gato-*     el gato del barrio, en tres poses: tímido (agachado,
//              orejas para atrás, la cola enroscada), curioso (sentado,
//              orejas paradas, la cola en signo de pregunta) y amigo
//              (de pie, la cola en alto, ojitos felices y un collar
//              con cascabel)
//
// Tobi y Mimi son mochis de verdad (mochiSvg): así son del mismo mundo
// que la mascota y en pixel llevan las caras hechas a mano. Lo que
// llevan encima (gorra, bolso) se dibuja acá con los roles del kit.
// El gato es un dibujo propio, con la cara de las mochis (data-px) a su
// escala para que en pixel también tenga ojos hechos a mano.
//
// Misma luz y vista 3/4 del cuarto (draw.js). Escala: la mochi mide 200
// unidades (como la mascota en el cuarto); el gato, un poco más de la
// mitad de alto. `foot`: lo que hay debajo de los pies (la sombra).
// Para dibujarlos: <Sprite markup={svg} kind="pet" …> (como PetArt):
// con kind 'pet' el neón enciende los ojos.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, floorShadow, INK, piece, G, P, Ell, Cir } from './draw.js';
import { mochiSvg, geometry } from '../mochi/index.js';
import { renderEyes, renderMouth, renderCheeks } from '../mochi/face.js';

const f1 = (v) => +(+v).toFixed(1);
const innerOf = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// ── Tobi, el cartero ────────────────────────────────────────────────
export const CARTERO_RECIPE = {
  body: 'redondo', ears: 'perro', eyes: 'redondos', mouth: 'hocico', cheeks: 'redondos', tail: 'ninguna',
  bodyColor: '#FFF4E6', innerColor: '#FFFFFF', accentColor: '#B98563', eyeColor: '#5A4636',
  marks: 'ninguna', pattern: 'ninguno',
};
const NAVY = '#41598F';
const LEATHER = '#A9683F';
const GOLD = '#F2C14E';

function carteroCap(g) {
  // gorra de cartero: copa firme con la tapa a la vista (se ve un poco
  // desde arriba), banda oscura con la insignia (un sobre dorado) y una
  // visera grande que sale hacia adelante, sobre la frente.
  const cx = 101, y = g.top + 16;                 // línea de abajo de la banda
  const w = g.w * 0.33;                            // medio ancho de la banda
  const m = mat(NAVY);
  const tw = w + 5, ty = y - 27;                   // tapa: un poco más ancha
  let s = '';
  // pared de la copa (se abre hacia arriba) y su tapa elíptica
  s += part(`M${f1(cx - w)} ${f1(y - 6)} L${f1(cx - tw)} ${f1(ty)} A${f1(tw)} 7 0 0 0 ${f1(cx + tw)} ${f1(ty)} L${f1(cx + w)} ${f1(y - 6)} Q${f1(cx)} ${f1(y)} ${f1(cx - w)} ${f1(y - 6)}Z`, m.front, { w: 2.4 });
  s += shade(`M${f1(cx + w * 0.4)} ${f1(ty + 6)} L${f1(cx + tw - 1)} ${f1(ty + 1)} L${f1(cx + w)} ${f1(y - 6)} L${f1(cx + w * 0.45)} ${f1(y - 3)}Z`, '#1E2440', 0.25);
  s += part(ellD(cx, ty, tw, 7), m.top, { w: 2.2 });
  s += shine(`M${f1(cx - tw + 6)} ${f1(ty - 1)} Q${f1(cx - tw * 0.5)} ${f1(ty - 5.4)} ${f1(cx - 4)} ${f1(ty - 5.6)} Q${f1(cx - tw * 0.45)} ${f1(ty - 3)} ${f1(cx - tw + 9)} ${f1(ty + 1.4)}Z`, { opacity: 0.6 });
  // banda
  const band = `M${f1(cx - w - 1)} ${f1(y - 10)} Q${f1(cx)} ${f1(y - 4)} ${f1(cx + w + 1)} ${f1(y - 10)} L${f1(cx + w + 1)} ${f1(y - 1)} Q${f1(cx)} ${f1(y + 5)} ${f1(cx - w - 1)} ${f1(y - 1)}Z`;
  s += part(band, tone(NAVY, -0.9), { w: 2 });
  s += line(`M${f1(cx - w + 2)} ${f1(y - 7.6)} Q${f1(cx)} ${f1(y - 1.8)} ${f1(cx + w - 2)} ${f1(y - 7.6)}`, tone(NAVY, 0.4), 1.2, { opacity: 0.6 });
  // insignia: sobre dorado con su solapa, sobre la pared de la copa
  const bx = cx - 7.5, by = y - 22;
  s += part(rr(bx, by, 15, 10.5, 1.6), GOLD, { w: 1.6 });
  s += line(`M${bx + 1.6} ${by + 1.8} L${bx + 7.5} ${by + 6.2} L${bx + 13.4} ${by + 1.8}`, tone(GOLD, -1.2), 1.3);
  s += shine(`M${bx + 2} ${by + 2.4} h3 v1.6 h-3Z`, { opacity: 0.8 });
  // visera: media luna hacia adelante (vista desde arriba), con su canto
  const vis = `M${f1(cx - w - 1)} ${f1(y - 1)} Q${f1(cx)} ${f1(y + 5)} ${f1(cx + w + 1)} ${f1(y - 1)} Q${f1(cx + w * 0.75)} ${f1(y + 13)} ${f1(cx)} ${f1(y + 14)} Q${f1(cx - w * 0.75)} ${f1(y + 13)} ${f1(cx - w - 1)} ${f1(y - 1)}Z`;
  s += part(vis, tone(NAVY, -1.5), { w: 2.2 });
  s += line(`M${f1(cx - w * 0.6)} ${f1(y + 6.4)} Q${f1(cx)} ${f1(y + 10.4)} ${f1(cx + w * 0.6)} ${f1(y + 6.4)}`, tone(NAVY, -0.3), 1.6, { opacity: 0.9 });
  return s;
}

function carteroBag(g) {
  // bolso de cuero colgado del lado derecho: correa que sube por el
  // costado (y se pierde detrás del cuerpo), tapa con hebilla dorada y
  // una carta con corazón asomando.
  const m = mat(LEATHER);
  const x = g.r - 36, y = g.ys - 14, w = 46, h = 36;   // cuerpo del bolso (frente)
  let s = '';
  // correa: del bolso hacia arriba por el costado derecho
  const st = `M${f1(x + 8)} ${f1(y + 2)} C${f1(x + 6)} ${f1(y - 22)} ${f1(g.r - 30)} ${f1(g.top + 40)} ${f1(g.r - 44)} ${f1(g.top + 18)} L${f1(g.r - 36)} ${f1(g.top + 14)} C${f1(g.r - 20)} ${f1(g.top + 40)} ${f1(x + 18)} ${f1(y - 22)} ${f1(x + 17)} ${f1(y + 2)}Z`;
  s += part(st, tone(LEATHER, -0.35), { w: 2 });
  s += line(`M${f1(x + 12.5)} ${f1(y - 2)} C${f1(x + 12)} ${f1(y - 22)} ${f1(g.r - 25)} ${f1(g.top + 40)} ${f1(g.r - 40)} ${f1(g.top + 17)}`, tone(LEATHER, 0.5), 1.1, { opacity: 0.6, 'stroke-dasharray': '3 3', 'data-skip': 'pixel' });
  // la carta asoma por detrás de la tapa, un poco ladeada, con su
  // corazón (en el bolso del cartero siempre hay algo para esta casa)
  s += part(`M${x + 8} ${y + 6} L${x + 10} ${y - 15} L${x + 34} ${y - 11} L${x + 32} ${y + 7}Z`, '#FFFBF3', { w: 1.8 });
  s += line(`M${x + 10.6} ${y - 13.6} L${x + 21} ${y - 6} L${x + 33.2} ${y - 10}`, '#C9B9A6', 1.3);
  s += part(`M${x + 21.6} ${y - 1} C${x + 18.4} ${y - 3} ${x + 17.4} ${y - 5.6} ${x + 18.8} ${y - 7} C${x + 20} ${y - 8} ${x + 21.4} ${y - 7.4} ${x + 21.9} ${y - 6} C${x + 22.6} ${y - 7.4} ${x + 24.2} ${y - 7.9} ${x + 25.2} ${y - 6.7} C${x + 26.4} ${y - 5.2} ${x + 25} ${y - 3} ${x + 21.6} ${y - 1}Z`, '#FF6F91', { w: 1.2 });
  // cuerpo del bolso (frente) y su tapa (canto de arriba)
  s += face(rr(x, y, w, h, 7), m.front, { w: 2.4 });
  s += shade(`M${x + w - 9} ${y + 3} Q${x + w - 1} ${y + 4} ${x + w - 1} ${y + 12} V${y + h - 7} Q${x + w - 1} ${y + h - 1} ${x + w - 8} ${y + h - 1} H${x + w - 14}Z`, '#3A1E10', 0.22);
  // costura del borde
  s += line(rr(x + 4, y + 4, w - 8, h - 8, 4.5), tone(LEATHER, 0.75), 1.1, { opacity: 0.7, 'stroke-dasharray': '2.4 2.4', 'data-skip': 'pixel' });
  s += line(rr(x + 4, y + 4, w - 8, h - 8, 4.5), tone(LEATHER, 0.55), 1.2, { opacity: 0.5, 'data-only': 'pixel' });
  // tapa: cae sobre el frente, más clara arriba
  const flap = `M${x - 1} ${y + 2} Q${x - 1} ${y - 3} ${x + 6} ${y - 3} H${x + w - 6} Q${x + w + 1} ${y - 3} ${x + w + 1} ${y + 2} V${y + 13} Q${x + w / 2} ${y + 22} ${x - 1} ${y + 13}Z`;
  s += part(flap, tone(LEATHER, 0.35), { w: 2.2 });
  s += flat(`M${x + 3} ${y + 0.6} H${x + w - 3} V${y + 3} Q${x + w / 2} ${y + 5.4} ${x + 3} ${y + 3}Z`, tone(LEATHER, 0.9));
  s += shade(`M${x + 1} ${y + 15} Q${x + w / 2} ${y + 24} ${x + w - 1} ${y + 15} L${x + w - 1} ${y + 18} Q${x + w / 2} ${y + 27} ${x + 1} ${y + 18}Z`, '#3A1E10', 0.25);
  // hebilla
  s += part(rr(x + w / 2 - 5.5, y + 12, 11, 9, 2), GOLD, { w: 1.6 });
  s += flat(rr(x + w / 2 - 2.2, y + 14.6, 4.4, 4, 1), tone(LEATHER, -0.6));
  s += shine(`M${x + w / 2 - 4} ${y + 13.4} h2.4 v2 h-2.4Z`, { opacity: 0.85 });
  // brillo del cuero
  s += shine(`M${x + 4} ${y + 4.6} Q${x + 8} ${y + 1.6} ${x + 14} ${y + 1.8} Q${x + 9} ${y + 3.6} ${x + 6.4} ${y + 7}Z`, { opacity: 0.5 });
  return s;
}

export function carteroSvg(mood = 'feliz') {
  const g = geometry(CARTERO_RECIPE.body);
  const pet = innerOf(mochiSvg(CARTERO_RECIPE, mood));
  // la mochi va tal cual (200×200) y encima la gorra y el bolso; el
  // lienzo deja aire arriba para la copa de la gorra
  const dy = 24;
  const inner = G({ transform: `translate(10 ${dy})` }, pet + carteroBag(g) + carteroCap(g));
  return piece(220, 224, inner);
}

// ── Mimi, la vecinita ───────────────────────────────────────────────
export const VECINITA_RECIPE = {
  body: 'alto', ears: 'conejoCaido', eyes: 'pestanudos', mouth: 'w', cheeks: 'redondos', tail: 'ninguna',
  bodyColor: '#FFD6C9', innerColor: '#FFF6F1', accentColor: '#F2A0A8', eyeColor: '#7A5A7E',
  hair: 'ninguno', brows: 'ninguna',
  wear: {
    cabeza: { id: 'florPelo', c1: '#FFD45E', c2: '#FFFFFF' },
    ropa: { id: 'vestido', c1: '#9CCBEA', c2: '#FFFFFF' },
    mano: { id: 'canasta' },
  },
};

export function vecinitaSvg(mood = 'normal') {
  const pet = innerOf(mochiSvg(VECINITA_RECIPE, mood));
  return piece(220, 224, G({ transform: 'translate(10 24)' }, pet));
}

// ── El gato del barrio ──────────────────────────────────────────────
// Atigrado naranja con pecho, hocico y patitas crema, y una muesca en la
// oreja derecha (es de la calle). La cara usa las piezas de las mochis.
const FUR = '#F2AE63';
const FUR_D = tone(FUR, -0.9);
const CREAM = '#FFF2DF';
const EAR_IN = '#F6A6A2';
const NOSE = '#EE7A8C';
const CAT_COLORS = { eye: '#6B4A2E', blush: '#FF8FA8', lips: '#C4455A', inner: CREAM, accent: FUR };

// Cara de mochi a escala k, centrada en (x, y) = altura de los ojos.
function catFace(x, y, k, mood, { eyes = 'redondos', mouth = 'w', cheeks = 'redondos', dx = 17 } = {}) {
  const gg = { face: { y: 0, dx, mouthY: 11, cheekY: 9, cheekDx: dx + 10 } };
  const inner = renderCheeks(cheeks, gg, mood, CAT_COLORS) + renderEyes(eyes, gg, mood, CAT_COLORS) + renderMouth(mouth, gg, mood, CAT_COLORS);
  return G({ transform: `translate(${f1(x - 100 * k)} ${f1(y)}) scale(${k})`, 'data-eye': '1' }, inner);
}

// Oreja de gato (triángulo blandito) con su interior; `notch` le muerde
// la punta (la muesca de gato callejero). `fold` la tumba hacia afuera.
function catEar(x, y, ang, s = 1, { notch = false, flip = false } = {}) {
  const sx = flip ? -1 : 1;
  // la muesca: un mordisquito en V en el borde de afuera, cerca de la punta
  const outer = notch
    ? 'M-12 7 L-3.6 -19 Q0 -24 3.6 -19 L5.4 -13.6 L1.8 -11.4 L7.4 -7.6 L12 7Z'
    : 'M-12 7 L-3.6 -19 Q0 -24 3.6 -19 L12 7Z';
  const innerD = 'M-6.4 4 L-1.8 -11 Q0 -14 1.8 -11 L6.4 4Z';
  return G({ transform: `translate(${f1(x)} ${f1(y)}) rotate(${ang}) scale(${f1(sx * s)} ${f1(s)})` },
    part(outer, FUR, { w: 2.2 }) + flat(innerD, EAR_IN) + shade('M3.6 -17 L12 7 L7 6.4 Z', '#5A2E10', 0.14));
}

// Rayas de atigrado sobre la frente (la "M") y en el lomo.
const tabbyHead = (x, y, s = 1) => line(
  `M${f1(x - 6 * s)} ${f1(y)} q1 -5 ${f1(2 * s)} -7 M${f1(x)} ${f1(y + 1)} v${f1(-8 * s)} M${f1(x + 6 * s)} ${f1(y)} q-1 -5 ${f1(-2 * s)} -7`,
  FUR_D, 2.4 * s,
);

function whiskers(x, y, s = 1) {
  const d = `M${f1(x - 15 * s)} ${f1(y - 1)} l${f1(-12 * s)} -2.4 M${f1(x - 15 * s)} ${f1(y + 3)} l${f1(-12 * s)} 2 M${f1(x + 15 * s)} ${f1(y - 1)} l${f1(12 * s)} -2.4 M${f1(x + 15 * s)} ${f1(y + 3)} l${f1(12 * s)} 2`;
  return line(d, '#8A6248', 1.2, { opacity: 0.75, 'data-skip': 'pixel neon' });
}

// Cabeza redonda, un poco más ancha que alta, con mejillas de pelito.
function catHead(cx, cy, rx, ry, mood, o = {}) {
  let s = '';
  const head = `M${f1(cx - rx)} ${f1(cy + 2)} C${f1(cx - rx)} ${f1(cy - ry * 0.9)} ${f1(cx - rx * 0.5)} ${f1(cy - ry)} ${f1(cx)} ${f1(cy - ry)} C${f1(cx + rx * 0.5)} ${f1(cy - ry)} ${f1(cx + rx)} ${f1(cy - ry * 0.9)} ${f1(cx + rx)} ${f1(cy + 2)} C${f1(cx + rx + 2)} ${f1(cy + ry * 0.45)} ${f1(cx + rx - 3)} ${f1(cy + ry * 0.62)} ${f1(cx + rx * 0.8)} ${f1(cy + ry * 0.7)} L${f1(cx + rx * 0.62)} ${f1(cy + ry * 0.66)} C${f1(cx + rx * 0.4)} ${f1(cy + ry * 0.95)} ${f1(cx - rx * 0.4)} ${f1(cy + ry * 0.95)} ${f1(cx - rx * 0.62)} ${f1(cy + ry * 0.66)} L${f1(cx - rx * 0.8)} ${f1(cy + ry * 0.7)} C${f1(cx - rx + 3)} ${f1(cy + ry * 0.62)} ${f1(cx - rx - 2)} ${f1(cy + ry * 0.45)} ${f1(cx - rx)} ${f1(cy + 2)}Z`;
  s += P(head, { fill: FUR, stroke: INK, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'body' });
  // hocico crema
  s += flat(ellD(cx, cy + ry * 0.42, rx * 0.42, ry * 0.32), CREAM);
  // luz y sombra de la cabeza
  s += shade(`M${f1(cx + rx * 0.35)} ${f1(cy - ry * 0.9)} C${f1(cx + rx)} ${f1(cy - ry * 0.7)} ${f1(cx + rx + 1)} ${f1(cy + ry * 0.3)} ${f1(cx + rx * 0.75)} ${f1(cy + ry * 0.66)} C${f1(cx + rx * 0.85)} ${f1(cy)} ${f1(cx + rx * 0.7)} ${f1(cy - ry * 0.6)} ${f1(cx + rx * 0.35)} ${f1(cy - ry * 0.9)}Z`, '#5A2E10', 0.13);
  s += tabbyHead(cx, cy - ry * 0.55, 1);
  s += Ell(cx - rx * 0.5, cy - ry * 0.55, rx * 0.2, ry * 0.12, { fill: '#FFFFFF', opacity: 0.6, transform: `rotate(-30 ${f1(cx - rx * 0.5)} ${f1(cy - ry * 0.55)})`, 'data-r': 'tone' });
  // la naricita va con la boca (sobre el hocico)
  s += catFace(cx, cy + ry * 0.05, o.k || 0.62, mood, o.face);
  s += P(`M${f1(cx - 2.6)} ${f1(cy + ry * 0.3)} h5.2 l-2.6 3Z`, { fill: NOSE, stroke: INK, 'stroke-width': 1.2, 'stroke-linejoin': 'round', 'data-r': 'part' });
  s += whiskers(cx, cy + ry * 0.38);
  return s;
}

// Cola gorda con la punta más oscura, a lo largo de un camino.
function catTail(d, w, tipD) {
  return part(d, FUR, { w: 2.4 }) + (tipD ? flat(tipD, FUR_D) : '');
}

const paw = (x, y, rx = 7.5) => part(`M${f1(x - rx)} ${f1(y)} C${f1(x - rx)} ${f1(y - 7)} ${f1(x + rx)} ${f1(y - 7)} ${f1(x + rx)} ${f1(y)} Q${f1(x)} ${f1(y + 2.6)} ${f1(x - rx)} ${f1(y)}Z`, CREAM, { w: 2 })
  + line(`M${f1(x - 2.4)} ${f1(y - 3.4)} v2.6 M${f1(x + 2.4)} ${f1(y - 3.4)} v2.6`, '#C9A88A', 1.2, { 'data-skip': 'pixel' });

// Curioso: sentado, orejas paradas, la cabeza un poquito ladeada y la
// cola en signo de pregunta.
export function gatoCuriosoSvg() {
  let s = floorShadow(76, 112, 42, 6);
  // cola (detrás): sube desde atrás y se curva como "?"
  s += catTail('M100 106 C116 104 124 92 122 76 C120 62 124 48 134 44 C142 42 146 50 140 56 C136 60 132 56 134 52 C128 56 128 66 130 78 C132 96 122 112 102 112Z', 0, 'M134 44 C142 42 146 50 140 56 C136 60 132 56 134 52 C135 48 134 46 134 44Z');
  // cuerpo sentado (pera) y el anca de atrás
  s += P('M48 110 C44 94 50 76 66 70 C84 64 102 76 106 94 C108 104 104 110 96 111 Z', { fill: FUR, stroke: INK, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'body' });
  s += part('M84 110 C80 96 88 84 100 86 C110 88 112 104 104 111 Z', FUR, { w: 2.2 });
  s += line('M92 92 q4 2 6 6 M95 86 q4 1 6 5', FUR_D, 2.4);
  s += shade('M96 88 C106 90 110 102 104 110 L98 110 C104 102 102 94 96 88Z', '#5A2E10', 0.15);
  // pecho crema
  s += flat('M58 108 C54 96 58 84 68 80 C76 84 80 96 76 108Z', CREAM);
  // patitas de adelante
  s += paw(60, 111) + paw(76, 111);
  // cabeza (ladeada: la oreja izquierda más alta)
  s += catEar(53, 35, -17, 1.2) + catEar(90, 36, 19, 1.15, { notch: true });
  s += catHead(71, 50, 30, 25, 'sorprendido', { k: 0.6 });
  return piece(150, 132, G({ transform: 'translate(0 10)' }, s));
}

// Tímido: agachado contra el piso, las orejas tumbadas a los lados, la
// cola enroscada por delante y una gotita de nervios.
export function gatoTimidoSvg() {
  let s = floorShadow(80, 112, 50, 6.5);
  // cuerpo echado (pan) — detrás
  s += P('M44 110 C40 96 56 84 82 84 C110 84 128 92 128 104 C128 110 122 112 112 112 L52 112 C46 112 44 112 44 110Z', { fill: FUR, stroke: INK, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'body' });
  s += line('M96 88 q3 5 2 9 M106 89 q3 5 2 9 M116 92 q2 4 1 8', FUR_D, 2.4);
  s += shade('M112 88 C124 92 128 100 126 108 L118 110 C120 102 118 94 112 88Z', '#5A2E10', 0.15);
  // cola que rodea al cuerpo por delante, hasta las patitas
  s += catTail('M126 104 C130 112 120 116 100 115 C84 114 70 114 62 112 C60 108 64 106 70 107 C80 108 92 109 104 108 C116 107 120 104 120 100Z', 0, 'M70 107 C64 106 60 108 62 112 C66 113 70 113 72 113 C71 111 70 109 70 107Z');
  // patitas escondidas
  s += paw(54, 112, 6.5);
  // cabeza baja, orejas tumbadas hacia los lados
  s += catEar(39, 80, -78, 0.85) + catEar(77, 80, 78, 0.85, { notch: true });
  s += catHead(58, 86, 27, 22, 'triste', { k: 0.56, face: { eyes: 'redondos', cheeks: 'redondos' } });
  // gotita de nervios
  s += part('M90 62 C86 68 86 72 90 72 C94 72 94 68 90 62Z', '#BFE3F7', { w: 1.6 }) + shine('M88.6 68 q0 -2 1 -3 q0 2 -0.4 3.4Z', { opacity: 0.9 });
  return piece(150, 132, G({ transform: 'translate(0 10)' }, s));
}

// Amigo: de pie, la cola en alto con la punta en gancho, ojitos felices,
// el collar rojo con cascabel y un corazoncito.
export function gatoAmigoSvg() {
  let s = floorShadow(80, 112, 48, 6.5);
  // cola parada (detrás)
  s += catTail('M110 78 C116 70 120 56 118 40 C117 30 122 22 130 22 C138 22 140 30 134 34 C130 36 128 32 130 30 C126 32 126 38 127 46 C130 62 124 76 116 84Z', 0, 'M130 22 C138 22 140 30 134 34 C130 36 128 32 130 30 C127 28 127 24 130 22Z');
  // patas del lado de allá (más oscuras, asoman entre las de acá)
  const leg = (x, y0, w, c) => part(rr(x, y0, w, 112 - y0 + 1, w / 2), c, { w: 2.2 });
  s += leg(70, 92, 10, tone(FUR, -0.35)) + leg(97, 90, 10, tone(FUR, -0.35));
  // cuerpo (bien apoyado sobre las patas)
  s += P('M48 86 C48 72 64 66 84 66 C104 66 120 72 120 86 C120 99 106 104 86 104 C64 104 48 100 48 86Z', { fill: FUR, stroke: INK, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-r': 'body' });
  s += line('M84 68 q3 6 1 11 M96 69 q3 6 1 11 M107 72 q2 5 0 9', FUR_D, 2.4);
  s += shade('M100 68 C114 70 122 80 118 92 C114 99 106 102 96 103 C108 96 112 84 100 68Z', '#5A2E10', 0.15);
  s += flat('M55 94 C57 86 65 82 73 84 C75 92 71 100 63 101 C59 100 55 98 55 94Z', CREAM);
  // patas del lado de acá, con sus patitas crema
  s += leg(56, 94, 11.5, FUR) + leg(106, 92, 11.5, FUR);
  s += paw(61.8, 112.4, 6.4) + paw(111.8, 112.4, 6.4);
  // cabeza
  s += catEar(41, 28, -13, 1.2) + catEar(76, 28, 15, 1.15, { notch: true });
  s += catHead(58, 44, 29, 24, 'feliz', { k: 0.6 });
  // collar con cascabel
  s += part('M38 60 Q58 70 78 60 L79 65 Q58 76 37 65Z', '#E5546B', { w: 2 });
  s += part(ellD(58, 71, 5, 5), GOLD, { w: 1.6 }) + line('M54.6 72 H61.4', tone(GOLD, -1.3), 1.2) + Cir(56.6, 69.4, 1.3, { fill: '#FFFFFF', 'data-r': 'shine' });
  // corazoncito
  s += part('M104 24 C98 20 96 16 98 13 C100 10.6 103 11 104 13.6 C105 11 108 10.6 110 13 C112 16 110 20 104 24Z', '#FF7E9C', { w: 1.6 }) + shine('M99.6 14.2 q1 -1.6 2.6 -1.4 q-1.4 0.8 -1.6 2.2Z', { opacity: 0.85 });
  return piece(150, 132, G({ transform: 'translate(0 10)' }, s));
}

// ── Lo que usan el juego y el laboratorio ───────────────────────────
// w, h: tamaño del lienzo (unidades). La mochi visitante entra entera
// en 200 de alto (como la mascota); el gato es más chico.
const entry = (id, name, w, h, svg, extra = {}) => ({ id, name, w, h, svg, foot: 10, ...extra });
export const VISITOR_ART = [
  entry('cartero', 'Tobi, el cartero', 220, 224, carteroSvg()),
  entry('vecinita', 'Mimi, la vecinita', 220, 224, vecinitaSvg()),
  entry('gato-timido', 'Gato tímido', 150, 132, gatoTimidoSvg(), { pose: 'timido' }),
  entry('gato-curioso', 'Gato curioso', 150, 132, gatoCuriosoSvg(), { pose: 'curioso' }),
  entry('gato-amigo', 'Gato amigo', 150, 132, gatoAmigoSvg(), { pose: 'amigo' }),
];

// Para stories.js: { id: 'gato', pose: 'curioso' } → el dibujo.
export function visitorArt(id, pose) {
  const key = id === 'gato' ? `gato-${pose || 'curioso'}` : id;
  return VISITOR_ART.find((v) => v.id === key) || null;
}
