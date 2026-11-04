// Escena del baño (300×380), en la misma vista 3/4 del cuarto: la pared
// de frente, el piso que se aleja (baldosas el doble de anchas que de
// altas) y lo redondo apoyado como elipse aplastada. Luz de arriba a la
// izquierda (entra por la ventanita).
//
// Va en tres capas para que la mascota quede DENTRO de la tina:
//   1. fondo: pared (pintura arriba, azulejos abajo), ventanita con su
//      maceta, toallero con toallas, repisa con frascos, cortina recogida,
//      piso, grifería, el borde de atrás de la tina y el agua
//   2. (la mascota)
//   3. frente: el labio de adelante de la tina, su panza con patas de
//      garra, la espuma que la tapa a la altura del agua, el patito, las
//      burbujas, el vapor, la alfombrita y el banquito con toallas.

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, INK, piece, G } from './draw.js';

export const BATH_SCENE = { W: 300, H: 380, WALL_H: 250 };

// Paleta del baño (una sola, armónica: menta, crema, rosa y oro).
const K = {
  paint: '#FCEBDD', tile: '#CDEBDD', grout: '#A6D2C1', trim: '#8DCBB4',
  floorA: '#FFF6EC', floorB: '#DCCFEA',
  tubOut: '#BCA8E8', enamel: '#FFFFFF', inside: '#E2ECF4', water: '#A9DDF3',
  gold: '#EDBE57', frame: '#FFF8F0', glass: '#BFE4F8',
  curtain: '#FFF3CF', dots: '#F6B4C4', ribbon: '#EF8DA8',
  towel: '#9FD3EA', towel2: '#FFFFFF', wood: '#E0B084', leaf: '#7CBF7E', pot: '#E59A72',
  mat: '#A9D8F0', duck: '#FFD84D', beak: '#F49A3C', foam: '#FFFFFF', foamLine: '#B9DDF0',
};
const f1 = (n) => +n.toFixed(1);
const rect = (x, y, w, h) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const circ = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
const ell = (x, y, rx, ry) => `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;
// Óvalo de tina visto desde arriba: lados rectos y puntas que son medias
// elipses aplastadas (rx = 2·ry).
function stad(x0, y0, x1, y1) {
  const ry = (y1 - y0) / 2, rx = ry * 2;
  return `M${x0 + rx} ${y0}H${x1 - rx}A${rx} ${ry} 0 0 1 ${x1 - rx} ${y1}H${x0 + rx}A${rx} ${ry} 0 0 1 ${x0 + rx} ${y0}Z`;
}
// El borde de la tina (ver capas): por fuera y la abertura.
const RIM = { o: [16, 198, 284, 234], i: [28, 205, 272, 227] };
// Junta todo lo del mismo color en un trazo (el kit de pixel rasteriza
// pieza por pieza).
function brush() {
  const m = new Map();
  return {
    fill(d, c, o = 1) { const k = `${c}${o}`; const e = m.get(k); if (e) e.d += d; else m.set(k, { d, c, o }); },
    out() { let s = ''; m.forEach((e) => { s += flat(e.d, e.c, e.o < 1 ? { opacity: e.o } : {}); }); return s; },
  };
}

// ── Fondo ────────────────────────────────────────────────────────
function wall() {
  const { W, WALL_H } = BATH_SCENE;
  const TOP = 112;
  let s = flat(rect(0, 0, W, TOP), K.paint);
  // luz que baja: en pixel en bandas, en los demás un degradado
  s += G({ 'data-only': 'pixel' }, shade(rect(0, 0, W, 28), '#FFFFFF', 0.25) + shade(rect(0, 28, W, 26), '#FFFFFF', 0.12));
  s += `<defs><linearGradient id="bwl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs>`;
  s += `<rect x="0" y="0" width="${W}" height="${TOP}" fill="url(#bwl)" data-r="raw" data-skip="pixel neon"/>`;
  // cornisa
  s += flat(rect(0, 0, W, 7), tone(K.paint, 0.5)) + flat(rect(0, 7, W, 2.4), tone(K.paint, -0.55)) + shade(rect(0, 9.4, W, 4), '#5A3A3A', 0.1);
  // azulejos de metro (biselados, con su brillo)
  const b = brush();
  b.fill(rect(0, TOP, W, WALL_H - TOP), K.grout);
  for (let row = 0, y = TOP + 15; y < WALL_H - 8; row++, y += 16) {
    for (let x = row % 2 ? -16 : 0; x < W; x += 32) {
      b.fill(rr(x + 1, y + 1, 30, 14, 2.5), K.tile);
      b.fill(rect(x + 3, y + 2, 26, 2.2), tone(K.tile, 0.7), 0.85);
      b.fill(rect(x + 3, y + 12, 26, 2.2), tone(K.tile, -0.4), 0.8);
      b.fill(rect(x + 5, y + 5, 6, 2.4), '#FFFFFF', 0.8);
    }
  }
  s += b.out();
  // guarda de arriba: remate redondeado y una fila de azulejos con rombos
  s += flat(rect(0, TOP, W, 15), K.trim);
  for (let x = 4; x < W; x += 20) s += flat(`M${x + 8} ${TOP + 3.5}l5 4l-5 4l-5 -4Z`, '#FFFFFF', { opacity: 0.85 });
  s += flat(rect(0, TOP + 13, W, 2.4), tone(K.trim, -0.6));
  s += face(rr(-4, TOP - 5, W + 8, 7, 3), K.frame, { w: 1.6 });
  s += shine(rect(0, TOP - 4, W, 1.8), { opacity: 0.8 });
  // zócalo de azulejo oscuro contra el piso
  s += flat(rect(0, WALL_H - 9, W, 9), K.trim) + flat(rect(0, WALL_H - 9, W, 2.2), tone(K.trim, 0.6));
  return s;
}

function windowArt() {
  // ventanita de arco con vidrio esmerilado abajo, una nube afuera, la
  // maceta en el alféizar y dos rayas de brillo
  const x0 = 116, x1 = 184, top = 26, bot = 94, cx = 150, r = (x1 - x0) / 2;
  const arch = (a, t, bb, rr2) => `M${cx - rr2} ${bb}V${t + rr2}A${rr2} ${rr2} 0 0 1 ${cx + rr2} ${t + rr2}V${bb}Z`;
  let s = face(arch(0, top - 6, bot + 2, r + 6), K.frame, { w: 2 });
  s += flat(arch(0, top - 2, bot, r + 2), tone(K.frame, -0.35));
  s += face(arch(0, top, bot, r), K.glass, { w: 1.6 });
  s += flat(`M${cx - 30} ${top + 40}c4 -8 14 -9 18 -3c3 -6 13 -5 14 2c5 0 7 5 5 7h-37c-3 0 -3 -5 0 -6Z`, '#FFFFFF', { opacity: 0.95 });
  // esmerilado: la mitad de abajo, blanca y con rombitos
  s += flat(rect(cx - r, top + 44, r * 2, bot - top - 44), '#F3FAFD', { opacity: 0.9 });
  for (let x = cx - r + 6, i = 0; x < cx + r; x += 11, i++) s += flat(`M${x} ${top + 52 + (i % 2) * 8}l3 3l-3 3l-3 -3Z`, K.glass, { opacity: 0.8 });
  // parteluz y travesaño
  s += face(rect(cx - 2.5, top + 2, 5, bot - top - 2), K.frame, { w: 1.4 });
  s += face(rect(cx - r, top + 42, r * 2, 5), K.frame, { w: 1.4 });
  s += shine(`M${cx - 26} ${top + 34}l14 -18h5l-14 18Z`, { opacity: 0.7 }) + shine(`M${cx + 8} ${top + 30}l10 -12h3l-10 12Z`, { opacity: 0.6 });
  // alféizar con grosor
  s += face(rr(x0 - 12, bot + 1, x1 - x0 + 24, 5, 1.5), tone(K.frame, 0.3), { w: 1.8 });
  s += face(rr(x0 - 12, bot + 6, x1 - x0 + 24, 5, 1.5), tone(K.frame, -0.4), { w: 1.8 });
  s += shade(rect(x0 - 8, bot + 11, x1 - x0 + 16, 3), '#5A3A3A', 0.14);
  // maceta con una suculenta a la derecha del alféizar
  const px = x1 + 2, py = bot + 1;
  s += part(`M${px - 8} ${py - 11}h16l-2 11h-12Z`, K.pot, { w: 1.6 }) + flat(rect(px - 9, py - 13, 18, 3.4), tone(K.pot, 0.4));
  s += part(`M${px} ${py - 12}C${px - 10} ${py - 14} ${px - 12} ${py - 24} ${px - 7} ${py - 26}C${px - 4} ${py - 20} ${px - 1} ${py - 16} ${px} ${py - 12}Z`, K.leaf, { w: 1.5 });
  s += part(`M${px} ${py - 12}C${px + 10} ${py - 14} ${px + 12} ${py - 24} ${px + 7} ${py - 26}C${px + 4} ${py - 20} ${px + 1} ${py - 16} ${px} ${py - 12}Z`, tone(K.leaf, -0.25), { w: 1.5 });
  s += part(`M${px} ${py - 12}C${px - 5} ${py - 20} ${px - 3} ${py - 30} ${px} ${py - 32}C${px + 3} ${py - 30} ${px + 5} ${py - 20} ${px} ${py - 12}Z`, tone(K.leaf, 0.3), { w: 1.5 });
  // un frasquito de sales a la izquierda
  const jx = x0 - 4;
  s += part(rr(jx - 6, bot - 14, 12, 15, 4), '#F7C9D6', { w: 1.5 }) + part(rr(jx - 4.5, bot - 18, 9, 5, 1.5), '#FFFFFF', { w: 1.3 });
  s += shine(rect(jx - 4, bot - 11, 2.4, 8), { opacity: 0.75 });
  return s;
}

function towelRack() {
  // barra dorada con sus dos soportes, una toalla grande celeste con
  // franjas y otra chica blanca con ribete rosa colgadas encima
  let s = face(rr(10, 66, 6, 10, 2), K.gold, { w: 1.6 }) + face(rr(84, 66, 6, 10, 2), K.gold, { w: 1.6 });
  s += face(rr(12, 68, 76, 5, 2.5), K.gold, { w: 1.6 }) + shine(rect(16, 68.6, 66, 1.6), { opacity: 0.8 });
  // toalla grande (doblada sobre la barra: la parte de atrás asoma arriba)
  s += part('M22 72C22 66 28 64 40 64C52 64 58 66 58 72V142H22Z', K.towel, { w: 2 });
  s += flat(rect(22, 120, 36, 6), '#FFFFFF') + flat(rect(22, 129, 36, 3), '#FFFFFF');
  s += flat(rect(22, 136, 36, 6), tone(K.towel, -0.3));
  s += line('M30 78V116M46 80V114', tone(K.towel, -0.45), 2, { opacity: 0.55 });
  s += shade(`M50 72H58V142H50Z`, tone(K.towel, -1), 0.25);
  s += shine(`M25 74C26 70 30 68 36 68C31 70 28 72 28 78Z`, { opacity: 0.6 });
  // toalla chica encima
  s += part('M54 72C54 67 58 65 66 65C74 65 80 67 80 72V118H54Z', K.towel2, { w: 2 });
  s += flat(rect(54, 106, 26, 5), K.ribbon) + flat(rect(54, 113, 26, 2.4), K.ribbon);
  s += line('M62 78V102', '#D9E6EE', 2, { opacity: 0.8 });
  s += shade('M74 72H80V118H74Z', '#8FA9C0', 0.22);
  return s;
}

function shelf() {
  // repisa de madera (tapa + canto + ménsulas) con frascos de alturas y
  // colores distintos
  const x0 = 196, x1 = 242, y = 140;
  let s = '';
  // frascos (detrás de la tapa no: apoyados encima)
  s += part(rr(x0 + 4, y - 26, 12, 26, 3), '#C8A8EA', { w: 1.6 }) + part(rr(x0 + 7, y - 31, 6, 6, 1.5), '#FFFFFF', { w: 1.3 }) + part(rr(x0 + 8.5, y - 36, 3, 6, 1), '#FFFFFF', { w: 1.2 });
  s += flat(rect(x0 + 6, y - 18, 8, 6), '#FFFFFF', { opacity: 0.85 });
  s += shine(rect(x0 + 6, y - 24, 2.4, 6), { opacity: 0.7 });
  s += part(rr(x0 + 18, y - 16, 14, 16, 5), '#86CDB0', { w: 1.6 }) + part(rr(x0 + 17, y - 20, 16, 5, 2), '#F7B4C4', { w: 1.4 });
  s += shine(rect(x0 + 21, y - 13, 2.4, 6), { opacity: 0.7 });
  s += part(`M${x0 + 36} ${y}V${y - 13}C${x0 + 36} ${y - 18} ${x0 + 44} ${y - 18} ${x0 + 44} ${y - 13}V${y}Z`, '#FFD772', { w: 1.5 }) + part(rr(x0 + 38, y - 22, 4, 5, 1), '#E59A72', { w: 1.2 });
  // tapa y canto
  s += face(rect(x0 - 4, y - 2, x1 - x0 + 8, 4), tone(K.wood, 0.55), { w: 1.6 });
  s += face(rect(x0 - 4, y + 2, x1 - x0 + 8, 4.5), K.wood, { w: 1.6 });
  s += part(`M${x0 + 2} ${y + 6}h5v3l-5 6Z`, tone(K.wood, -0.3), { w: 1.4 }) + part(`M${x1 - 2} ${y + 6}h-5v3l5 6Z`, tone(K.wood, -0.3), { w: 1.4 });
  s += shade(rect(x0, y + 7, x1 - x0, 3), '#2E5A4C', 0.18);
  return s;
}

function curtain() {
  // barral corto contra la pared y la cortina recogida a la derecha con
  // un lazo: pliegues verticales, lunares rosa y el ruedo festoneado
  const rodY = 16;
  let s = face(rr(204, rodY - 2, 100, 5, 2.5), K.gold, { w: 1.6 }) + face(rr(200, rodY - 6, 8, 13, 3), K.gold, { w: 1.6 });
  s += shine(rect(210, rodY - 1.2, 88, 1.6), { opacity: 0.8 });
  const body = `M232 ${rodY + 2}H302V210H262C266 196 268 182 266 168C264 158 260 154 262 150C252 120 236 70 232 ${rodY + 2}Z`;
  s += part(body, K.curtain, { w: 2 });
  // aros
  for (let x = 236; x < 300; x += 12) s += face(rr(x - 3, rodY - 3, 6, 7, 3), K.gold, { w: 1.2 });
  // pliegues (sombras verticales que se juntan en el lazo)
  s += shade(`M246 ${rodY + 4}C250 70 258 120 264 150H270C268 120 262 70 258 ${rodY + 4}Z`, '#C9A86A', 0.3);
  s += shade(`M272 ${rodY + 4}C274 70 276 120 276 150H284C284 120 284 70 284 ${rodY + 4}Z`, '#C9A86A', 0.28);
  s += shade('M270 160C272 176 272 194 268 210H278C280 194 280 176 278 160Z', '#C9A86A', 0.3);
  // lunares
  // (lunares como tono: si fueran piezas, en pixel la tela les haría un
  // borde de luz alrededor a cada uno)
  s += shade([[244, 40], [262, 30], [282, 44], [254, 78], [274, 70], [292, 92], [264, 112], [286, 128], [294, 64], [272, 186], [290, 176], [286, 204]].map(([x, y]) => circ(x, y, 3.4)).join(''), K.dots, 0.85);
  s += shade('M290 18H302V210H290Z', '#B8945A', 0.22);
  // lazo
  s += part('M258 148C262 140 270 140 274 146C280 140 290 140 292 148C290 156 280 156 274 152C270 158 260 156 258 148Z', K.ribbon, { w: 1.6 });
  s += part('M272 150c-3 6 -6 12 -10 16l5 1c3 -4 6 -10 7 -15Z', K.ribbon, { w: 1.4 }) + part('M276 150c3 6 5 12 8 16l-5 1c-2 -4 -4 -10 -4 -15Z', K.ribbon, { w: 1.4 });
  s += part(ellD(274, 148, 4, 3.4), tone(K.ribbon, -0.25), { w: 1.4 });
  return s;
}

function floor() {
  const { W, H, WALL_H } = BATH_SCENE;
  const b = brush();
  b.fill(rect(0, WALL_H, W, H - WALL_H), K.floorA);
  for (let row = 0, y = WALL_H; y < H; row++, y += 20) {
    for (let col = 0, x = -10; x < W; col++, x += 40) {
      if ((row + col) % 2) b.fill(rect(x, y, 40, 20), K.floorB);
    }
  }
  for (let y = WALL_H + 20; y < H; y += 20) b.fill(rect(0, y - 1, W, 2), mix(K.floorA, K.floorB, 0.65));
  for (let x = 30; x < W; x += 40) b.fill(rect(x - 1, WALL_H, 2, H - WALL_H), mix(K.floorA, K.floorB, 0.65));
  let s = b.out();
  // reflejitos de la ventana en las baldosas claras
  s += shine(`M138 ${WALL_H + 30}l10 -6h8l-10 6Z`, { opacity: 0.6 }) + shine(`M98 ${WALL_H + 70}l10 -6h6l-10 6Z`, { opacity: 0.5 });
  // sombra contra la pared
  s += shade(rect(0, WALL_H, W, 5), '#3A2A3E', 0.16) + shade(rect(0, WALL_H + 5, W, 8), '#3A2A3E', 0.07);
  return s;
}

function faucet() {
  // grifo de época a la izquierda, en el borde de atrás: caño de cuello
  // de cisne y dos manijas (agua fría y caliente)
  let s = face(rr(42, 176, 8, 26, 3), K.gold, { w: 1.8 });
  s += part('M44 180C44 164 54 158 64 160C70 161 74 166 74 172V178H68V173C68 168 64 166 60 166C54 166 50 170 50 180Z', K.gold, { w: 1.8 });
  s += face(rr(66, 176, 10, 5, 2), tone(K.gold, -0.25), { w: 1.4 });
  s += part(ellD(36, 186, 6, 4), '#9FD3EA', { w: 1.4 }) + part(ellD(58, 188, 6, 4), '#F59AB2', { w: 1.4 });
  s += face(rr(33, 186, 26, 5, 2), tone(K.gold, -0.15), { w: 1.4 });
  s += line('M46.5 182V171C47 167 50 164.5 54 163.5', '#FFFFFF', 2, { opacity: 0.8 });
  // gotita colgando del caño
  s += part('M71 182c-2 3 -2 6 0 6c2 0 2 -3 0 -6Z', K.water, { w: 1.2 });
  return s;
}

function tubBack() {
  // el borde entero (se ve el de atrás), la abertura y el agua con su
  // espuma de atrás
  const [o0, o1, o2, o3] = RIM.o, [i0, i1, i2, i3] = RIM.i;
  let s = face(stad(o0, o1, o2, o3), K.enamel, { w: 2.2 });
  s += flat(stad(i0, i1, i2, i3), K.inside);
  s += flat(stad(i0 + 2, i1 + 4, i2 - 2, i3), K.water);
  s += flat(stad(i0 + 10, i1 + 7, i2 - 10, i3 - 3), tone(K.water, 0.45), { opacity: 0.6 });
  s += shine(`M${i0 + 30} ${i1 + 8}h40v2.2h-40Z`, { opacity: 0.7 }) + shine(`M${i2 - 70} ${i1 + 10}h26v2h-26Z`, { opacity: 0.55 });
  // espuma de atrás (asoma a los lados de la mascota)
  const foam = circ(56, 208, 9) + circ(70, 204, 8) + circ(84, 208, 7) + circ(218, 207, 8) + circ(232, 203, 9) + circ(246, 208, 8);
  s += part(foam, K.foam, { w: 1.6, a: { stroke: K.foamLine } });
  return s;
}

export function bathBackSvg() {
  const { W, H } = BATH_SCENE;
  let s = wall() + floor() + windowArt() + towelRack() + shelf() + curtain();
  // vapor detrás de la mascota: volutas que suben y se desvanecen
  s += shade('M106 190C98 176 112 168 106 154C102 146 108 138 112 134C108 144 118 152 112 164C108 172 116 180 112 190Z', '#FFFFFF', 0.45);
  s += shade('M196 188C188 172 202 164 196 150C193 142 198 134 202 130C198 140 208 148 202 160C198 168 206 178 202 188Z', '#FFFFFF', 0.4);
  // sombra de la tina contra la pared y en el piso
  s += shade('M20 236C30 250 60 256 150 256C240 256 270 250 280 236Z', '#3A4A50', 0.12);
  s += faucet() + tubBack();
  return piece(W, H, s);
}

// ── Frente ───────────────────────────────────────────────────────
function clawFoot(x, flip) {
  const m = flip ? -1 : 1;
  const X = (v) => f1(x + v * m);
  // pata curva que termina en una garra que agarra una bolita
  let s = part(`M${X(-8)} 316C${X(-10)} 328 ${X(-6)} 336 ${X(-12)} 344C${X(-14)} 348 ${X(-10)} 352 ${X(-4)} 351H${X(8)}C${X(12)} 351 ${X(13)} 346 ${X(9)} 342C${X(5)} 336 ${X(10)} 326 ${X(10)} 316Z`, K.gold, { w: 1.8 });
  s += part(ellD(x + 1 * m, 348, 7, 4.4), tone(K.gold, -0.3), { w: 1.6 });
  s += line(`M${X(-6)} 349v-4M${X(0)} 350v-5M${X(6)} 349v-4`, tone(K.gold, -0.7), 1.6, { opacity: 0.8 });
  s += line(`M${X(-5)} 320C${X(-6)} 328 ${X(-3)} 334 ${X(-7)} 340`, '#FFFFFF', 2, { opacity: 0.75 });
  return s;
}

function tubFront() {
  const [o0, o1, o2, o3] = RIM.o, [i0, i1, i2, i3] = RIM.i;
  const cy = (o1 + o3) / 2, oy = (o3 - o1) / 2, ox = oy * 2, iy = (i3 - i1) / 2, ix = iy * 2;
  let s = '';
  // la panza de la tina: ancha arriba, se recoge hacia el fondo
  const body = `M${o0 + 4} ${cy}C${o0 + 4} 270 ${o0 + 18} 314 ${o0 + 64} 322H${o2 - 64}C${o2 - 18} 314 ${o2 - 4} 270 ${o2 - 4} ${cy}Z`;
  s += face(body, K.tubOut, { w: 2.4 });
  s += shade(`M${o2 - 40} ${cy + 10}C${o2 - 20} 250 ${o2 - 22} 300 ${o2 - 58} 318H${o2 - 64}C${o2 - 24} 312 ${o2 - 6} 270 ${o2 - 6} ${cy + 6}Z`, tone(K.tubOut, -1.2), 0.35);
  s += shade(`M${o0 + 40} 312C${o0 + 80} 320 ${o2 - 80} 320 ${o2 - 40} 312L${o2 - 64} 321H${o0 + 64}Z`, tone(K.tubOut, -1.2), 0.3);
  s += shine(`M${o0 + 18} 246C${o0 + 20} 272 ${o0 + 30} 292 ${o0 + 44} 304C${o0 + 28} 296 ${o0 + 16} 276 ${o0 + 14} 248Z`, { opacity: 0.75 });
  // filete dorado bajo el borde (una cinta rellena: una línea curva
  // gruesa sale cortada en pixel)
  s += flat(`M${o0 + 10} ${o3 + 5}Q150 ${o3 + 15} ${o2 - 10} ${o3 + 5}L${o2 - 10} ${o3 + 8}Q150 ${o3 + 18} ${o0 + 10} ${o3 + 8}Z`, K.gold);
  return s;
}

function tubLip() {
  const [o0, o1, o2, o3] = RIM.o, [i0, i1, i2, i3] = RIM.i;
  const cy = (o1 + o3) / 2, oy = (o3 - o1) / 2, ox = oy * 2, iy = (i3 - i1) / 2, ix = iy * 2;
  let s = '';
  // labio de adelante (la mitad de abajo del borde, encima de la mascota
  // y de la espuma, que queda adentro de la tina)
  const lip = `M${o0} ${cy}A${ox} ${oy} 0 0 0 ${o0 + ox} ${o3}H${o2 - ox}A${ox} ${oy} 0 0 0 ${o2} ${cy}`
    + `L${i2} ${cy}A${ix} ${iy} 0 0 1 ${i2 - ix} ${i3}H${i0 + ix}A${ix} ${iy} 0 0 1 ${i0} ${cy}Z`;
  s += face(lip, K.enamel, { w: 2.2 });
  s += shade(`M${o0 + 30} ${o3 - 3}H${o2 - 30}V${o3 - 1}H${o0 + 30}Z`, '#8FA6C0', 0.3);
  s += line(`M${i0 + 26} ${i3 + 2}H${i2 - 50}`, '#FFFFFF', 2, { opacity: 0.9 });
  return s;
}

function foamFront() {
  // espuma sobre el agua, adentro de la tina: asoma por encima del labio
  // y tapa la panza de la mascota
  const blobs = [[48, 216, 11], [64, 212, 12], [82, 215, 10], [100, 218, 10], [120, 220, 10], [138, 218, 11], [158, 220, 10], [178, 218, 11], [198, 219, 10], [216, 215, 11], [234, 211, 12], [252, 215, 10]];
  const d = blobs.map(([x, y, r]) => ellD(x, y, r, r * 0.86)).join('');
  let s = part(d, K.foam, { w: 1.8, a: { stroke: '#9FC9E0' } });
  // sombra suave abajo de cada pompa y brillitos arriba
  blobs.forEach(([x, y, r], k) => {
    if (k % 2 === 0) s += shade(`M${x - r * 0.7} ${y + r * 0.35}Q${x} ${y + r * 0.9} ${x + r * 0.7} ${y + r * 0.35}Q${x} ${y + r * 0.6} ${x - r * 0.7} ${y + r * 0.35}Z`, '#A8CFE6', 0.6);
  });
  s += shine(ellD(60, 205, 4, 2.6), { opacity: 0.9 }) + shine(ellD(134, 211, 3.6, 2.4), { opacity: 0.9 }) + shine(ellD(230, 204, 4, 2.6), { opacity: 0.9 });
  return s;
}

function duck() {
  // patito de goma flotando en la espuma, mirando a la mascota
  const x = 238, y = 206;
  let s = part(`M${x - 16} ${y}C${x - 18} ${y - 10} ${x - 8} ${y - 12} ${x - 2} ${y - 8}C${x - 4} ${y - 18} ${x + 4} ${y - 24} ${x + 10} ${y - 20}C${x + 16} ${y - 17} ${x + 15} ${y - 9} ${x + 10} ${y - 6}C${x + 16} ${y - 6} ${x + 18} ${y} ${x + 14} ${y + 4}C${x + 6} ${y + 8} ${x - 12} ${y + 8} ${x - 16} ${y}Z`, K.duck, { w: 1.8 });
  s += part(`M${x - 6} ${y - 16}C${x - 10} ${y - 16} ${x - 13} ${y - 14} ${x - 12} ${y - 12}C${x - 9} ${y - 11} ${x - 6} ${y - 12} ${x - 4} ${y - 13}Z`, K.beak, { w: 1.4 });
  s += flat(ellD(x + 1, y - 17, 1.8, 2.2), INK) + flat(ellD(x + 0.4, y - 17.8, 0.7, 0.8), '#FFFFFF');
  s += part(`M${x} ${y - 4}C${x + 4} ${y - 6} ${x + 10} ${y - 4} ${x + 9} ${y}C${x + 6} ${y + 2} ${x + 1} ${y + 1} ${x} ${y - 4}Z`, tone(K.duck, -0.3), { w: 1.3 });
  s += shine(`M${x - 12} ${y - 4}C${x - 12} ${y - 8} ${x - 8} ${y - 9} ${x - 5} ${y - 8}C${x - 8} ${y - 7} ${x - 10} ${y - 6} ${x - 11} ${y - 3}Z`, { opacity: 0.8 });
  s += flat(ellD(x + 6, y - 14, 2.6, 1.6), '#FF9FB4', { opacity: 0.7 });
  return s;
}

function bubble(x, y, r) {
  return part(ellD(x, y, r, r), '#EAF7FF', { w: 1.3, a: { stroke: '#8EC2E0', 'fill-opacity': 0.75 } })
    + shine(ellD(x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.24), { opacity: 0.95 });
}

function mat() {
  // alfombrita mullida con forma de nube, ribete claro y su sombra
  const d = 'M44 352C40 346 48 340 56 343C60 336 72 336 78 342C84 336 96 336 102 342C108 336 120 336 126 342C132 336 144 337 148 344C156 341 164 347 160 353C166 358 160 366 152 364C148 371 136 371 130 366C124 372 112 372 106 366C100 372 88 372 82 366C76 372 64 371 60 365C52 368 42 362 46 357C40 357 40 353 44 352Z';
  let s = flat(ellD(102, 364, 64, 9), '#3A2A3E', { opacity: 0.12, 'data-r': 'tone' });
  s += part(d, K.mat, { w: 2 });
  s += flat('M56 350C60 346 70 345 78 348C86 344 98 344 104 348C112 344 124 344 130 348C138 345 146 347 150 352C146 350 138 350 130 352C124 349 112 349 104 352C98 349 86 349 78 352C70 349 62 349 56 350Z', tone(K.mat, 0.6), { opacity: 0.9 });
  s += shade('M60 362C80 366 128 366 150 360C146 364 136 366 130 365C120 368 90 368 80 366C72 366 64 365 60 362Z', tone(K.mat, -1), 0.3);
  return s;
}

function stool() {
  // banquito de madera (asiento redondo = elipse aplastada) con dos
  // toallas dobladas y una pastilla de jabón
  const cx = 276, top = 330;
  let s = flat(ellD(cx, 376, 26, 5), '#3A2A3E', { opacity: 0.16, 'data-r': 'tone' });
  s += face(rr(cx - 19, top + 6, 6, 40, 2), tone(K.wood, -0.35), { w: 1.6 }) + face(rr(cx + 13, top + 6, 6, 40, 2), tone(K.wood, -0.45), { w: 1.6 });
  s += face(rr(cx - 3, top + 8, 6, 36, 2), tone(K.wood, -0.6), { w: 1.4 });
  s += face(`M${cx - 24} ${top}V${top + 5}A24 8 0 0 0 ${cx + 24} ${top + 5}V${top}Z`, tone(K.wood, -0.15), { w: 1.8 });
  s += face(ellD(cx, top, 24, 9), tone(K.wood, 0.5), { w: 1.8 });
  // toallas dobladas (la de abajo menta, la de arriba rosa)
  s += face(rr(cx - 17, top - 13, 34, 11, 4), '#BEE6D4', { w: 1.7 }) + line(`M${cx - 13} ${top - 7}H${cx + 13}`, tone('#BEE6D4', -0.4), 1.6, { opacity: 0.7 });
  s += face(rr(cx - 15, top - 24, 30, 11, 4), '#F7B8C8', { w: 1.7 }) + flat(rect(cx - 15, top - 17, 30, 2.4), '#FFFFFF', { opacity: 0.9 });
  s += face(rr(cx - 7, top - 31, 14, 7, 3), '#FFF1F6', { w: 1.5 }) + shine(rect(cx - 4, top - 29.6, 6, 1.8), { opacity: 0.9 });
  return s;
}

export function bathFrontSvg() {
  const { W, H } = BATH_SCENE;
  let s = flat(ellD(150, 352, 124, 9), '#3A2A3E', { opacity: 0.16, 'data-r': 'tone' });
  s += clawFoot(56, false) + clawFoot(244, true);
  s += tubFront() + foamFront() + tubLip();
  // pompas que rebalsan sobre el borde, en las puntas
  s += part(ellD(30, 212, 8, 6.4) + ellD(40, 208, 7, 6) + ellD(270, 213, 7, 5.8), K.foam, { w: 1.7, a: { stroke: '#9FC9E0' } });
  s += shine(ellD(37, 205, 2.6, 1.8), { opacity: 0.9 });
  s += duck();
  s += bubble(40, 196, 6) + bubble(30, 178, 4) + bubble(262, 190, 5) + bubble(270, 172, 3.6) + bubble(118, 206, 4);
  // vapor de adelante (tenue)
  s += shade('M24 174C18 162 28 154 24 142C22 136 26 130 30 128C26 136 34 144 30 154C26 162 32 168 30 176Z', '#FFFFFF', 0.35);
  s += shade('M282 168C276 156 286 148 282 136C280 130 284 124 288 122C284 130 292 138 288 148C284 156 290 162 288 170Z', '#FFFFFF', 0.3);
  s += mat() + stool();
  return piece(W, H, s);
}

// ── Piezas sueltas que se animan encima de la escena ─────────────
/** Una burbuja que sube del agua (24×24). */
export function bathBubbleSvg() {
  return piece(24, 24, bubble(12, 12, 8.5));
}
/** Una voluta de vapor (28×56). */
export function bathSteamSvg() {
  return piece(28, 56, shade('M12 54C4 42 18 34 12 22C9 14 14 6 18 2C14 12 24 20 18 32C14 40 22 46 18 54Z', '#FFFFFF', 0.55));
}
