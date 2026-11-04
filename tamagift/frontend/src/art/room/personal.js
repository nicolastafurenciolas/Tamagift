// ─────────────────────────────────────────────────────────────────
// Lo personal en el cuarto (ver PLAN_REGALO_VIVO.md): los objetos por
// donde llega lo que manda quien regala.
//
//   cofreSvg({ open, glow })  cofre de recuerdos (cartas con fecha)
//   frascoSvg({ fill })       frasco de estrellas (cupones)
//   diarioSvg({ open })       el diario de la mascota
//   sobreVozSvg()             sobrecito de nota de voz
//   regaloNotaSvg()           tarjetita escrita a mano (paquetes)
//   tableroSvg()              tablerito de corcho para preguntas
//
// Misma vista 3/4 que el cuarto (draw.js): frente + tapa a media
// profundidad, lo apoyado plano se ve aplastado a la mitad, luz de arriba
// a la izquierda. Cada pieza devuelve el SVG completo (string) con los
// roles del kit, así cada estilo la redibuja a su manera. Los detalles
// van de 2–3 unidades para arriba (en pixel un píxel de arte mide ~1.2–1.4
// unidades) y lo que no se lee en pixel (letra manuscrita, giros chicos)
// tiene su versión propia con data-only / data-skip.
// ─────────────────────────────────────────────────────────────────

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, hollow, tube, INK, piece } from './draw.js';
import { GOLD, surf, floorSh, glow, gloss, heart, star, dots, sparkle, bow, grain } from './decorVibes.js';

const f1 = (v) => +v.toFixed(1);
const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

// Números al azar pero siempre iguales (el dibujo no cambia entre vistas).
function seeded(seed) {
  let r = seed % 233280;
  return () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
}

// Giro leve (notas clavadas, sobres): en vectorial va girado; en pixel
// derecho, porque un borde largo apenas inclinado da escalones sueltos.
const tilt = (a, cx, cy, inner) => (a
  ? `<g transform="rotate(${a} ${cx} ${cy})" data-skip="pixel">${inner}</g><g data-only="pixel">${inner}</g>`
  : inner);

// Líneas de letra a mano. Vectorial: trazos ondulados como cursiva;
// pixel: palabras en bloquecitos (como se escribe en un sprite).
function writing(x, y, w, rows, gap, c, seed = 3, o = {}) {
  const rnd = seeded(seed);
  let v = '', px = '';
  const sq = o.sq ?? 1;
  for (let i = 0; i < rows; i++) {
    const yy = y + i * gap;
    const last = i === rows - 1 && rows > 1;
    const len = w * (last ? 0.42 + rnd() * 0.25 : 0.82 + rnd() * 0.18);
    let xx = x + (i === 0 && o.indent ? 5 : 0);
    while (xx < x + len - 3) {
      const wl = Math.max(3, Math.min(3.5 + rnd() * 9, x + len - xx));
      const n = Math.max(1, Math.round(wl / 2.2));
      const st = wl / n;
      let d = `M${f1(xx)} ${f1(yy)}`;
      for (let k = 0; k < n; k++) d += `q${f1(st / 2)} ${f1((k % 2 ? 1.6 : -2.2) * sq)} ${f1(st)} 0`;
      v += d;
      const bh = o.ph || 2.2 * Math.max(0.8, sq);
      px += `M${f1(xx)} ${f1(yy - bh / 2)}h${f1(wl)}v${f1(bh)}h${f1(-wl)}Z`;
      xx += wl + 2.8;
    }
  }
  return line(v, c, o.w || 1.3, { opacity: o.op || 0.68, 'data-skip': 'pixel' })
    + flat(px, c, { opacity: 0.7, 'data-only': 'pixel' });
}

// Rejilla de líneas paralelas de pendiente `sl` dentro de un rectángulo
// (capitoné, acolchado): una sola pasada por dirección.
function slashes(x, y, w, h, sl, step, anchor = null, kStep = 0) {
  let d = '';
  const ks = [y - sl * x, y - sl * (x + w), y + h - sl * x, y + h - sl * (x + w)];
  const kMin = Math.min(...ks), kMax = Math.max(...ks);
  const st = kStep || (step * Math.sqrt(1 + sl * sl));
  const base = anchor ? anchor[1] - sl * anchor[0] : kMin;
  for (let k = kMin + (((base - kMin) % st) + st) % st; k < kMax; k += st) {
    const xa1 = (y - k) / sl, xb1 = (y + h - k) / sl;
    const xa = Math.max(x, Math.min(xa1, xb1)), xb = Math.min(x + w, Math.max(xa1, xb1));
    if (xb - xa < 2) continue;
    d += `M${f1(xa)} ${f1(sl * xa + k)}L${f1(xb)} ${f1(sl * xb + k)}`;
  }
  return d;
}

// Sobre visto de atrás (con su solapa), para las cartas.
function envelope(x, y, w, h, c, o = {}) {
  const m = mat(c);
  let s = part(rr(x, y, w, h, 2), c, { w: 1.6 });
  s += line(`M${x + 2.5} ${y + h - 2.5}L${f1(x + w / 2)} ${f1(y + h * 0.5)}L${x + w - 2.5} ${y + h - 2.5}`, m.side, 1.3, { opacity: 0.6 });
  s += part(`M${x + 0.8} ${y + 1.4}L${f1(x + w / 2)} ${f1(y + h * 0.56)}L${x + w - 0.8} ${y + 1.4}Q${x + w - 1} ${y} ${x + w - 2.6} ${y}H${x + 2.6}Q${x + 1} ${y} ${x + 0.8} ${y + 1.4}Z`, m.top, { w: 1.4 });
  if (o.seal) s += part(heart(f1(x + w / 2), f1(y + h * 0.54), o.sealR || 3.6), o.seal, { w: 1.1 });
  return s;
}

// Foto instantánea: marco blanco, cielo, lomita y dos mochis con un
// corazón (los dos). `k` aplasta en alto si está apoyada plana.
function polaroid(x, y, w, h, o = {}) {
  const b = Math.max(2, w * 0.1);
  const ph = h - b - Math.max(3.4, h * 0.2);
  let s = part(rr(x, y, w, h, 1.4), '#FFFDF8', { w: 1.5 });
  s += face(rr(x + b, y + b, w - b * 2, ph, 0.8), '#BFE3F5', { w: 1.1 });
  const px = x + b, pw = w - b * 2, py = y + b;
  s += flat(`M${f1(px)} ${f1(py + ph * 0.7)}Q${f1(px + pw * 0.5)} ${f1(py + ph * 0.52)} ${f1(px + pw)} ${f1(py + ph * 0.66)}V${f1(py + ph)}H${f1(px)}Z`, '#A8D9A0');
  const r = Math.max(2.4, pw * 0.15);
  s += part(`M${f1(px + pw * 0.33 - r)} ${f1(py + ph)}C${f1(px + pw * 0.33 - r)} ${f1(py + ph - r * 2.3)} ${f1(px + pw * 0.33 + r)} ${f1(py + ph - r * 2.3)} ${f1(px + pw * 0.33 + r)} ${f1(py + ph)}Z`, '#FFF4EC', { w: 1 });
  s += part(`M${f1(px + pw * 0.66 - r)} ${f1(py + ph)}C${f1(px + pw * 0.66 - r)} ${f1(py + ph - r * 2.1)} ${f1(px + pw * 0.66 + r)} ${f1(py + ph - r * 2.1)} ${f1(px + pw * 0.66 + r)} ${f1(py + ph)}Z`, '#FFC9D6', { w: 1 });
  s += flat(heart(f1(px + pw * 0.5), f1(py + ph * 0.3), Math.max(2.2, pw * 0.13)), '#FF7FA1');
  if (o.tape) s += shade(rr(f1(x + w / 2 - w * 0.22), f1(y - 2.4), f1(w * 0.44), 5, 0.6), o.tape, 0.75);
  return s;
}

// Chinche: cabeza redonda con brillo y su sombrita en el corcho.
// Halo cálido. Ni en neón (lo hace el helper) ni en lo-fi (sobre la noche
// violeta un disco claro se ve gris, no luz) ni en papel (queda como un
// recorte blanco): ahí la luz la cuentan los destellos.
const halo = (...a) => `<g data-skip="lofi papel">${glow(...a)}</g>`;

const pin = (x, y, c) => shade(ellD(x + 1.8, y + 2.6, 3.4, 2), '#3A2418', 0.28)
  + part(ellD(x, y, 3.6, 3.6), c, { w: 1.4 }) + shine(ellD(x - 1.1, y - 1.2, 1.2, 1), { opacity: 0.9 });

// ── Cofre de recuerdos ────────────────────────────────────────────
const WOOD = '#C68B5E';
const RIBBON = '#F28FAA';
const LINING = '#E98FA6';

/**
 * Cofre de recuerdos, 140×120. `open`: la tapa atrás y adentro las cartas
 * atadas con su lazo, con luz cálida. `glow`: cerrado pero la tapa brilla
 * (hay una carta lista para abrir).
 */
export function cofreSvg({ open = false, glow: lit = false } = {}) {
  const m = mat(WOOD), g = mat(GOLD);
  let s = '';
  if (open) s += halo(70, 40, 72, 44, '#FFE3A0', 0.32);
  else if (lit) s += halo(70, 54, 70, 46, '#FFE3A0', 0.4);
  s += floorSh(70, 112, 60, 7);
  // patitas de bronce
  s += part(ellD(29, 108.5, 8, 4.6), GOLD, { w: 1.6 }) + part(ellD(111, 108.5, 8, 4.6), GOLD, { w: 1.6 });

  if (open) {
    // ── tapa abierta: se ve por dentro, inclinada hacia atrás ──
    s += face(rrTop(15, 9, 110, 42, 8), m.front, { w: 2.4 });
    s += shade(rr(108, 12, 17, 39, 0), m.deep, 0.16);
    s += face(rr(23, 17, 94, 30, 3), LINING, { w: 1.8 });
    // capitoné del forro: rombos y botoncitos
    const quilt = slashes(23, 17, 94, 30, 1, 0, [31.5, 22.5], 15.56) + slashes(23, 17, 94, 30, -1, 0, [31.5, 22.5], 15.56);
    s += line(quilt, tone(LINING, -0.9), 1.3, { opacity: 0.55 });
    const btn = [];
    for (let j = 0; j < 4; j++) for (let xx = 31.5 + (j % 2 ? 7.78 : 0) - 15.56; xx < 116; xx += 15.56) if (xx > 25) btn.push([f1(xx), f1(22.5 + j * 7.78)]);
    s += dots(btn, 1.5, tone(LINING, -1.3));
    s += shade(rr(23, 17, 94, 6, 3), tone(LINING, -1.6), 0.25);
    // foto pegada en el forro
    s += tilt(-6, 44, 30, polaroid(33, 19, 22, 24, { tape: '#FFE7A0' }));
    s += tilt(5, 98, 28, part(rr(88, 21, 18, 13, 1.4), '#FFF4DE', { w: 1.3 }) + writing(91, 25.5, 12, 3, 3.4, '#9A6A7A', 7, { sq: 0.7 }));
    // herrajes de las esquinas y el labio dorado (ahora arriba)
    s += part('M15 30V17Q15 9 23 9H34V15.5H21.5V30Z', GOLD, { w: 1.5 }) + part('M125 30V17Q125 9 117 9H106V15.5H118.5V30Z', GOLD, { w: 1.5 });
    s += part(rr(13, 5.5, 114, 7.5, 3.5), GOLD, { w: 1.8 }) + line('M17 7.6H123', g.hi, 1.3, { opacity: 0.8 });
    s += part(rr(65, 0.8, 10, 9, 3), GOLD, { w: 1.5 }) + dots([[70, 4.6]], 1.5, g.deep);
    // luz cálida que sale de adentro (pinta el forro y el borde)
    s += '<defs><radialGradient id="cofreLuz" cx="0.5" cy="0.62" r="0.55"><stop offset="0" stop-color="#FFE9A8" stop-opacity="0.85"/><stop offset="0.6" stop-color="#FFE0A0" stop-opacity="0.35"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></radialGradient></defs>';
    s += `<ellipse cx="70" cy="46" rx="56" ry="26" fill="url(#cofreLuz)" data-r="tone"/>`;

    // ── la caja por arriba: el borde de madera y el hueco ──
    s += face(rrTop(18, 45, 104, 24, 3), m.top, { w: 2.2 });
    s += face(rr(24, 48.5, 92, 16.5, 2), hollow(WOOD), { w: 1.6 });
    s += shade(rr(24, 48.5, 92, 16.5, 2), '#FFC870', 0.4);
    // adentro: un sobre azul, un rollito y el atado de cartas con su lazo
    s += tilt(14, 98, 56, envelope(86, 40, 24, 22, '#BFDDF5', { seal: '#7FA9DE', sealR: 3 }));
    s += tilt(-22, 34, 52, part(rr(28, 36, 11, 28, 5), '#FFF1D8', { w: 1.5 })
      + part(ellD(33.5, 37.5, 5.5, 2.6), '#F3DDB8', { w: 1.2 }) + part(rr(27.5, 48, 12, 3.6, 1), '#E8657F', { w: 1.1 }));
    let bundle = envelope(40, 37, 32, 26, '#FFE6BF');
    bundle += envelope(51, 31, 32, 29, '#FFD6DF');
    bundle += part(rr(64, 30, 6, 32, 0), '#E8657F', { w: 1.3 }) + part(rr(39, 48, 45, 5, 0), '#E8657F', { w: 1.3 });
    bundle += bow(67, 49.5, 0.82, '#E8657F', { tails: false });
    s += tilt(-6, 62, 48, bundle);
    // el canto de adelante tapa lo de adentro
    s += face(rr(18, 64.5, 104, 5, 1.5), m.top, { w: 1.8 });
    s += line('M21 66.2H119', m.hi, 1.3, { opacity: 0.8 });
    s += sparkle(48, 27, 4.6, '#FFF3B0') + sparkle(86, 22, 5.6, '#FFF3B0') + sparkle(112, 36, 3.8, '#FFF3B0');
  }

  // ── el cuerpo (frente) ──
  s += face(rr(18, 68, 104, 40, 3), WOOD, { w: 2.4 });
  s += line('M20 88H120', m.deep, 1.8, { opacity: 0.55 });
  s += grain([[24, 58, 76, 0.8], [66, 92, 80.5, 0.7], [26, 62, 96, 0.8], [76, 92, 100, 0.7]], WOOD, 0.5);
  s += shade(rr(18, 99, 104, 9, 3), m.deep, 0.22);
  s += shade(rr(111, 68, 11, 40, 3), m.deep, 0.14);
  // herrajes de las esquinas de abajo
  s += part('M18 90H26V100H36V108H21Q18 108 18 105Z', GOLD, { w: 1.6 }) + part('M122 90H114V100H104V108H119Q122 108 122 105Z', GOLD, { w: 1.6 });
  s += dots([[22, 104], [118, 104]], 1.6, g.deep);
  // la cinta que abraza la caja, con su moño
  s += part(rr(95, 68, 11, 40, 0), RIBBON, { w: 1.6 });
  s += line('M97.6 71V106', tone(RIBBON, 1.2), 1.6, { opacity: 0.8 });
  s += bow(100.5, 79, 0.86, RIBBON);
  // la cerradura: un corazón dorado con su ojo de llave
  s += part(heart(70, 83, 12.4), GOLD, { w: 1.9 });
  s += flat(heart(70, 83.4, 8.4), lit && !open ? '#FFF2B8' : g.top);
  s += flat(ellD(70, 81.4, 2.6, 2.6) + rr(68.7, 82, 2.6, 6, 1), '#5A3A2E');
  s += gloss(63.6, 76.8, 2.6, 1.5, -40);

  if (!open) {
    // ── la tapa cerrada: abombada, con su labio dorado ──
    s += face('M15 71V49C15 35 31 28 70 28C109 28 125 35 125 49V71Z', WOOD, { w: 2.4 });
    s += flat('M17.4 49.5C17.6 37 32 30.4 70 30.4C108 30.4 122.4 37 122.6 49.5C106 45 90 43.5 70 43.5C50 43.5 34 45 17.4 49.5Z', m.top);
    s += line('M16.5 50C33 45 50 43.5 70 43.5C90 43.5 107 45 123.5 50', m.side, 1.6, { opacity: 0.6 });
    s += line('M19 40.5C34 35.5 50 34.2 70 34.2C90 34.2 106 35.5 121 40.5', m.side, 1.6, { opacity: 0.45 });
    s += line('M27 36.4C38 33 52 32 66 31.9', '#FFFFFF', 2.4, { opacity: 0.4 });
    s += line('M16 59H124', m.deep, 1.6, { opacity: 0.4 });
    s += grain([[86, 112, 38.6, 0.5], [26, 54, 46.8, 0.6], [24, 56, 54.5, 0.8], [84, 116, 63, 0.8]], WOOD, 0.45);
    s += shade('M110 46C117 47.5 123 49 123 50V64H110Z', m.deep, 0.14);
    // herrajes en las esquinas abombadas
    s += part('M15 50C15 39 20 33 30 30.4L33 37.6C26 39.4 22.6 43.4 22.6 50Z', GOLD, { w: 1.5 });
    s += part('M125 50C125 39 120 33 110 30.4L107 37.6C114 39.4 117.4 43.4 117.4 50Z', GOLD, { w: 1.5 });
    s += part(rr(13, 63.5, 114, 8, 3.5), GOLD, { w: 1.8 }) + line('M17 65.6H123', g.hi, 1.3, { opacity: 0.8 });
    s += dots([[21, 67.5], [40, 67.5], [100, 67.5], [119, 67.5]], 1.5, g.deep);
    // pasador que baja de la tapa a la cerradura
    s += part(rr(65, 60, 10, 15, 3), GOLD, { w: 1.6 }) + dots([[70, 64.5]], 1.6, g.deep);
    if (lit) {
      // brilla: canto de luz en la tapa, luz por la rendija y destellos
      s += line('M18.5 48C19 36.5 33 31 70 31C107 31 121 36.5 121.5 48', '#FFF6D0', 2.2, { opacity: 0.85 });
      s += flat('M22 71.4H63V73.2H22ZM77 71.4H94V73.2H77ZM107 71.4H118V73.2H107Z', '#FFF6C8');
      s += sparkle(26, 21, 5, '#FFF3B0') + sparkle(108, 15, 6.4, '#FFF3B0') + sparkle(130, 40, 4, '#FFF3B0') + sparkle(64, 13, 4, '#FFF3B0');
      s += flat(heart(88, 17, 4.4), '#FF9DB8', { 'data-r': 'shine' }) + flat(heart(44, 13, 3.4), '#FFB8CB', { 'data-r': 'shine' });
    }
  }
  return piece(140, 120, s);
}

// ── Frasco de estrellas ───────────────────────────────────────────
const STAR_COLORS = ['#FFD86B', '#FFC2D4', '#FFD86B', '#C9B6F2', '#FFE89A', '#A8E0C4', '#FFD86B', '#FFCFA0'];
// Lugar de cada estrellita, de abajo para arriba (en cada hilera en orden
// salteado: una hilera a medio llenar no queda prolija como una repisa).
const STAR_SLOTS = (() => {
  const rnd = seeded(17);
  const rows = [[105, [21, 33, 45, 57, 69]], [96, [27, 39, 51, 63]], [87, [21, 33, 45, 57, 69]], [78, [27, 39, 51, 63]],
    [69, [21, 33, 45, 57, 69]], [60, [27, 39, 51, 63]], [51.5, [33, 45, 57]]];
  const out = [];
  rows.forEach(([y, xs], ri) => {
    const row = xs.map((x) => ({ x: f1(x + (rnd() - 0.5) * 3), y: f1(y + (rnd() - 0.5) * 3), a: Math.round((rnd() - 0.5) * 40), c: STAR_COLORS[Math.floor(rnd() * STAR_COLORS.length)], r: f1(6 + rnd() * 0.8), ri }));
    for (let i = row.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [row[i], row[j]] = [row[j], row[i]]; }
    out.push(...row);
  });
  return out;
})();

/** Frasco de estrellas, 90×120. `fill` (0..1): cuántas estrellitas tiene. */
export function frascoSvg({ fill = 0 } = {}) {
  const k = clamp01(fill);
  const n = Math.round(k * STAR_SLOTS.length);
  let s = '';
  if (n) s += halo(45, 78, 44, 42, '#FFF0A8', f1(0.08 + 0.2 * k));
  s += surf(45, 113, 34);
  const jar = 'M23 41C15 44.5 12 51 12 60V100C12 107.5 17 112 25 112H65C73 112 78 107.5 78 100V60C78 51 75 44.5 67 41Z';
  // el vidrio de atrás y su fondo
  s += shade(jar, '#CFEAF5', 0.45, { 'data-skip': 'papel' }) + shade(jar, '#CFEAF5', 0.2, { 'data-only': 'papel' });
  s += line('M15 104.5A30 6 0 0 1 75 104.5', '#9CC6DA', 1.6, { opacity: 0.55 });
  // las estrellitas (las de abajo primero: las de arriba se apoyan encima)
  STAR_SLOTS.slice(0, n).forEach(({ x, y, a, c, r }) => {
    const st = part(star(x, y, r, 0.56), c, { w: 1.3 });
    // retro y sticker engordan el contorno de las piezas: en una estrellita
    // se come el color; ahí va relleno + trazo fino
    s += `<g transform="rotate(${a} ${x} ${y})" data-skip="pixel retro sticker">${st}</g>`;
    s += `<g transform="rotate(${a} ${x} ${y})" data-only="retro sticker">${flat(star(x, y, r, 0.56), c)}${line(star(x, y, r, 0.56), mix(c, INK, 0.62), 1.1)}</g>`;
    s += `<g data-only="pixel">${part(star(x, y + 0.5, r + 0.3, 0.6), c, { w: 1.3 })}</g>`;
  });
  // vidrio de adelante: un velo apenas, el borde y los brillos
  s += shade(jar, '#EAF7FC', 0.12);
  s += line(jar, mix('#8FBCD2', INK, 0.28), 2.2);
  s += line('M17 106Q45 113 73 106', '#FFFFFF', 1.8, { opacity: 0.5 });
  s += shine('M16.6 58C15.6 70 15.6 86 17 100H21C19.6 86 19.6 70 20.6 58Z', { opacity: 0.85 });
  s += shine('M24.6 45.4C21 47.2 19.4 50 18.8 53.6H22.4C23 51.2 24.4 49.4 27 48Z', { opacity: 0.7 });
  s += shine(rr(68.4, 60, 3, 10, 1.5), { opacity: 0.55 }) + shine(rr(68.4, 73, 3, 3.4, 1.5), { opacity: 0.55 });
  if (k >= 1) s += sparkle(81, 64, 4.4, '#FFF3B0') + sparkle(84, 76, 2.8, '#FFF3B0');
  // cuello de vidrio con rosca
  s += face(rr(21, 34, 48, 9, 3), '#E3F1F7', { w: 1.6 });
  s += line('M24 38.6H66', '#B5D4E2', 1.3, { opacity: 0.9 });
  // tapa de tela con volado y lunares
  const T = '#F5A3B7', mt = mat(T);
  s += part('M17 32C17 15 73 15 73 32Z', T, { w: 1.8 });
  s += flat('M23 27C25 21 35 18.6 45 18.6C38 20.4 30 23 26.6 29Z', mt.top, { opacity: 0.9 });
  let rf = 'M15 30.5H75';
  for (let x = 75; x > 15.5; x -= 7.5) rf += `Q${f1(x - 3.75)} 40.5 ${f1(x - 7.5)} 31.5`;
  s += part(`${rf}Z`, T, { w: 1.5 });
  s += shade('M60 31H75L69.5 37.5Q64 40 60.8 34Z', mt.deep, 0.22);
  s += dots([[30, 25.5], [45, 21.4], [60, 25.5], [22.5, 35], [37.5, 35.4], [52.5, 35.4], [67.5, 35]], 1.9, '#FFFFFF');
  // cordel que la ata, moño y etiqueta con una estrella
  s += line('M15.5 31.4Q45 34.6 74.5 31.4', '#C9A06A', 2.4);
  s += bow(22, 32.5, 0.42, '#C9A06A', { tails: false });
  s += line('M70 33L74.5 44', '#B8925A', 1.4);
  s += tilt(8, 76, 50, part('M71 44.5L74.5 41.6L78 44.5V55.5H71Z', '#F2DFB8', { w: 1.3 }) + flat(star(74.5, 50, 2.8, 0.55), '#F2B84B'));
  return piece(90, 120, s);
}

// ── El diario de la mascota ───────────────────────────────────────
const COVER = '#B9A3E3';
const DIARY_INK = '#7A5A8C';

/** Diario, 110×90. Cerrado: acostado, tapa acolchada, candadito de corazón y cinta. Abierto: sus páginas escritas. */
export function diarioSvg({ open = false } = {}) {
  const m = mat(COVER), g = mat(GOLD);
  let s = '';
  if (!open) {
    // ── cerrado: parado en la repisa, con su lápiz apoyado al lado ──
    s += surf(56, 85, 34) + surf(91, 88.4, 6);
    // cinta separadora que asoma por abajo y descansa adelante
    s += part('M46 82H51.4V89.2L48.7 86.8L46 89.2Z', '#E8657F', { w: 1.3 });
    // canto de arriba: tapa de atrás, hojas y tapa de adelante
    s += face(rrTop(26, 6, 54, 9, 4), m.top, { w: 1.8 });
    s += face(rr(31.5, 8.2, 46, 4, 1), '#FFF4E2', { w: 1.3 });
    // la tapa acolchada
    s += face(rr(26, 13.5, 54, 70, 5), COVER, { w: 2.2 });
    s += flat(rr(39, 16.5, 38, 64, 4), m.top, { opacity: 0.5 });
    s += shade(rr(26, 74, 54, 9.5, 5), m.deep, 0.18);
    const Q = slashes(39, 16.5, 38, 64, 1, 0, [58, 40], 14) + slashes(39, 16.5, 38, 64, -1, 0, [58, 40], 14);
    s += line(Q, m.deep, 1.3, { opacity: 0.5, 'stroke-dasharray': '2.6 2' });
    const tufts = [];
    for (let j = -3; j <= 6; j++) for (let i = -3; i <= 3; i++) {
      if ((i + j) % 2) continue;
      const x = 58 + i * 7, y = 40 + j * 7;
      if (x > 40 && x < 76 && y > 18 && y < 79) tufts.push([x, y]);
    }
    s += dots(tufts, 1.4, m.side);
    // el lomo de tela que envuelve el borde izquierdo
    s += face(rr(26, 13.5, 11, 70, 4.5), m.side, { w: 1.8 });
    s += line('M31 18V79', m.front, 1.6, { opacity: 0.6 });
    // esquineros dorados
    s += part('M67 13.5H76Q80 13.5 80 17.5V26.5Z', GOLD, { w: 1.4 }) + part('M67 83.5H76Q80 83.5 80 79.5V70.5Z', GOLD, { w: 1.4 });
    // parche de corazón con puntadas y la huellita de la mascota
    s += part(heart(57, 39, 11.5), '#F7A6C0', { w: 1.7 });
    s += line(heart(57, 39.3, 8.4), '#FFFFFF', 1.3, { 'stroke-dasharray': '2.2 1.8', opacity: 0.85, 'data-skip': 'pixel' });
    s += dots([[57, 42, 3.2], [52.6, 37, 1.8], [57, 35.2, 1.8], [61.4, 37, 1.8]], 1.8, '#FFFFFF');
    s += gloss(50, 33, 2, 1.2, -40, 0.7);
    // etiqueta con el nombre
    s += face(rr(40, 64, 22, 10, 2), '#FFF4E2', { w: 1.4 }) + writing(43.5, 69, 15, 1, 4, DIARY_INK, 4, { sq: 0.8 });
    // correa con candadito de corazón
    s += part(rr(63, 45, 19, 9, 2.5), m.deep, { w: 1.5 });
    s += line('M66 47.6H80', m.side, 1.2, { opacity: 0.8 });
    s += line('M67 57V54.2a3 3 0 0 1 6 0V57', g.side, 1.8);
    s += part(heart(70, 60.6, 6.4), GOLD, { w: 1.5 });
    s += flat(ellD(70, 59.6, 1.4, 1.4) + rr(69.35, 59.8, 1.3, 3.2, 0.5), '#5A3A2E');
    s += gloss(67, 57.4, 1.4, 0.9, -40);
    // el lápiz apoyado (con el que escribe la mascota)
    s += `<g transform="rotate(-11 90.5 88)">${part('M87.5 81L90.5 88.4L93.5 81Z', '#F4D6AC', { w: 1.2 })}${flat('M89.6 86.2L90.5 88.4L91.4 86.2Z', '#5A4A5E')}`
      + `${face(rr(87.5, 45, 6, 36.5, 0.6), '#FFD36E', { w: 1.4 })}${line('M89.4 47V79.6', '#FFF0B8', 1.2, { opacity: 0.9 })}`
      + `${face(rr(87.3, 41.4, 6.4, 4, 0.6), '#DCE1EA', { w: 1.2 })}${part('M87.5 41.8V39.4Q87.5 36.6 90.5 36.6Q93.5 36.6 93.5 39.4V41.8Z', '#F7A6C0', { w: 1.3 })}</g>`;
    return piece(110, 90, s);
  }
  // ── abierto: tapas, páginas que se curvan hacia el lomo, letra a mano ──
  s += surf(55, 83, 50);
  s += face(rr(4, 26, 96, 52, 6), m.side, { w: 2 });
  s += face(rr(4, 74, 96, 6, 3), tone(COVER, -1.2), { w: 1.8 });
  // canto de las hojas, adelante
  s += face('M8 76C22 70.5 42 70.5 52 76.5C62 70.5 82 70.5 96 76V79C82 73.5 62 73.5 52 79.5C42 73.5 22 73.5 8 79Z', '#F1E2C8', { w: 1.4 });
  // páginas
  const PG = '#FFF8EC';
  s += face('M8 31C22 25.5 42 25.5 52 31.5V76.5C42 70.5 22 70.5 8 76Z', PG, { w: 1.8 });
  s += face('M96 31C82 25.5 62 25.5 52 31.5V76.5C62 70.5 82 70.5 96 76Z', PG, { w: 1.8 });
  s += shade('M44 28.6C47.5 29.4 50 30.3 52 31.5V76.5C50 75.2 47.5 74.2 44 73.4Z', '#B99A7A', 0.22);
  s += shade('M52 31.5C54 30.3 56.5 29.4 60 28.6V73.4C56.5 74.2 54 75.2 52 76.5Z', '#B99A7A', 0.14);
  // página izquierda: la fecha en rosa, lo que pasó y la huellita de firma
  s += line('M13 35.6Q18 34.2 24 34.6', '#E8657F', 2, { opacity: 0.85 });
  s += writing(13, 41.5, 31, 5, 5.4, DIARY_INK, 5);
  s += dots([[38, 66.2, 2.4], [34.6, 62.8, 1.3], [38, 61.6, 1.3], [41.4, 62.8, 1.3]], 1.3, '#C98AA8');
  // página derecha: una foto pegada, dos renglones y un corazón
  s += tilt(4, 70, 42, polaroid(60, 33, 22, 19, { tape: '#FFD8A8' }));
  s += flat(heart(89, 42, 3.4), '#FF8FAE');
  s += writing(60, 58, 30, 3, 5.4, DIARY_INK, 9);
  // la cinta separadora cruzando la página y saliendo por adelante
  s += tube('M55.6 30C57 44 54 60 57 84', 3.6, '#E8657F', { w: 1.2 });
  s += part('M55.2 83H59.4V89L57.3 87L55.2 89Z', '#E8657F', { w: 1.1 });
  // la correa con el candadito, suelta a un costado
  s += part('M99 49H104Q107 49 107 52V57H99Z', m.deep, { w: 1.4 });
  s += line('M102.5 59.6V58a1.8 1.8 0 0 1 3.6 0', g.side, 1.6);
  s += part(heart(104.3, 63.4, 5), GOLD, { w: 1.4 }) + flat(ellD(104.3, 62.6, 1.1, 1.1), '#5A3A2E');
  return piece(110, 90, s);
}

// ── Sobrecito de nota de voz ──────────────────────────────────────
/** Sobre de nota de voz, 70×56: onda de sonido que sale de un lacre de corazón. */
export function sobreVozSvg() {
  const C = '#BFCBF4', m = mat(C), W = '#E0577A', mw = mat(W);
  let s = surf(35, 52.5, 29);
  s += face(rr(6, 13, 58, 38, 4), C, { w: 2.2 });
  // pliegues de abajo (apenas) y la solapa
  s += line('M9 48.5L30 33M61 48.5L40 33', m.side, 1.4, { opacity: 0.5 });
  s += shade(rr(6, 43, 58, 8, 4), m.deep, 0.16);
  s += part('M7.4 15.4Q6.6 13 9.4 13H60.6Q63.4 13 62.6 15.4L38.4 34Q35 36.6 31.6 34Z', m.top, { w: 1.8 });
  s += line('M12 16H58', m.hi, 1.3, { opacity: 0.7 });
  // la onda de sonido: barritas a los dos lados del lacre
  const bars = [[11.5, 4.5], [16.5, 9], [21.5, 6], [26.5, 11.5], [43.5, 12], [48.5, 7], [53.5, 10], [58.5, 5]];
  s += flat(bars.map(([x, h]) => rr(f1(x - 1.6), f1(38 - h / 2), 3.2, h, 1.6)).join(''), '#7C6AC8');
  // lacre: una gota de cera con borde irregular y el corazón en relieve
  s += part('M35 26.6C38.6 26 42.4 28.2 42.6 31.4C44.4 33.6 43.2 37.8 41 38.8C40.2 41.6 36.4 42.8 34 41.8C31 42.8 27.6 40.6 27.6 37.8C25.6 35.6 26.6 31.6 29 30.4C30 27.8 32.6 26.4 35 26.6Z', W, { w: 1.7 });
  s += part(heart(35, 34.4, 4.6), mw.side, { w: 1.1 });
  s += flat(heart(34.6, 33.8, 2.6), mw.top, { opacity: 0.8 });
  s += gloss(31, 30.2, 1.7, 1, -40);
  return piece(70, 56, s);
}

// ── Tarjetita escrita a mano (la nota de los paquetes) ────────────
/** Tarjetita de papel kraft atada con cordel, 60×50. */
export function regaloNotaSvg() {
  const K = '#F0D3A2', mk = mat(K);
  let s = surf(32, 47, 24);
  // cordel: entra por el ojal y sube a atarse (al paquete)
  // la tarjeta con su punta recortada
  s += part('M15 14H51Q55 14 55 18V40Q55 44 51 44H15L5 35V23Z', K, { w: 1.9 });
  s += flat('M16 16.2H50.6Q52.8 16.2 52.8 18.4V20H16L7.6 24.6Z', mk.top, { opacity: 0.8 });
  s += shade('M5 35L15 44H51Q55 44 55 40V38H14Z', mk.deep, 0.18);
  // ojal con su aro rosado y el cordel por delante
  s += part(ellD(13.5, 29, 3.8, 3.8), '#F7A6C0', { w: 1.3 }) + flat(ellD(13.5, 29, 1.7, 1.7), mk.deep);
  s += line('M13.5 28.4C11 20 9 10 10 1', '#B8865A', 1.9) + line('M13.5 28.4C16 19 19 10 23 1', '#C9A06A', 1.9);
  // letra a mano y un corazón
  s += writing(21, 24, 28, 3, 6, '#7A4E3A', 11, { indent: true, ph: 1.7 });
  s += part(heart(47.5, 37, 3.4), '#E8657F', { w: 1.1 });
  return piece(60, 50, s);
}

// ── Tablerito de corcho para preguntas ────────────────────────────
/** Tablero de corcho colgado de un clavo, 160×120, con notitas clavadas. */
export function tableroSvg() {
  const F = '#B47A52', mf = mat(F), K = '#E0B27A', mk = mat(K);
  let s = '';
  // cordel y clavo
  s += line('M30 19L80 5L130 19', '#8A6A4A', 1.8);
  s += part(ellD(80, 5, 3, 3), '#C9C3CF', { w: 1.3 });
  // marco con grosor (canto de arriba) y el corcho
  s += face(rrTop(12, 13.5, 136, 5, 3), mf.top, { w: 1.8 });
  s += face(rr(10, 16, 140, 100, 6), F, { w: 2.4 });
  s += grain([[16, 60, 21, 0.6], [92, 140, 20.6, 0.6], [16, 70, 111, 0.6], [96, 144, 111.6, 0.6]], F, 0.5);
  s += line('M15 18.4H145', mf.hi, 1.4, { opacity: 0.6 });
  s += face(rr(20, 26, 120, 80, 2), K, { w: 1.8 });
  // sombra del marco sobre el corcho (luz de arriba a la izquierda)
  s += shade('M20 26H140V30H24V106H20Z', mk.deep, 0.35);
  // textura del corcho: granitos en racimos
  const rnd = seeded(29);
  const dk = [], lt = [];
  for (let i = 0; i < 34; i++) {
    const x = 26 + rnd() * 110, y = 33 + rnd() * 68;
    (i % 3 ? dk : lt).push([f1(x), f1(y), 1.1 + rnd() * 0.5], [f1(x + 2.2), f1(y + 0.8), 0.9]);
  }
  s += dots(dk, 1.2, mk.side, { opacity: 0.75 }) + dots(lt, 1.2, mk.top, { opacity: 0.8 });
  // 1 · notita amarilla con un "?" bien grande
  const Y = '#FFE38A';
  s += tilt(-5, 41, 49, shade(rr(29, 37, 34, 32, 1), '#3A2418', 0.22) + part(rr(26, 34, 34, 32, 1.2), Y, { w: 1.6 })
    + flat('M26.8 34.8H59.2V39H26.8Z', tone(Y, 0.6), { opacity: 0.8 })
    + tube('M37 46C37 40.5 49 40 49 46C49 50 43 50.6 43 55.4', 3.4, '#E8657F', { w: 1.1 }) + part(ellD(43, 60.6, 2.2, 2.2), '#E8657F', { w: 1.1 }));
  s += pin(43, 37.5, '#E8505E');
  // 2 · foto de los dos
  s += tilt(4, 82, 46, shade(rr(70, 34, 28, 32, 1), '#3A2418', 0.22) + polaroid(67, 31, 28, 32));
  s += pin(81, 33.5, '#7FA9DE');
  // 3 · nota rosa con renglones y un corazón
  const P = '#FFC9D6';
  s += tilt(6, 121, 46, shade(rr(109, 36, 28, 26, 1), '#3A2418', 0.22) + part(rr(106, 33, 28, 26, 1.2), P, { w: 1.6 })
    + writing(110, 40, 20, 3, 5.2, '#9A4E6A', 13) + flat(heart(127, 53, 3.2), '#E8657F'));
  s += pin(120, 35.5, '#7FB894');
  // 4 · tarjetita menta con la respuesta (y un tilde de corazón)
  const M = '#BDE8D2';
  s += tilt(-3, 47, 88, shade(rr(33, 80, 34, 22, 1), '#3A2418', 0.22) + part(rr(30, 77, 34, 22, 1.2), M, { w: 1.6 })
    + writing(34, 84, 24, 3, 5, '#4E7A68', 19, { sq: 0.85 }));
  s += pin(47, 79.5, '#F2C14E');
  // 5 · entrada de cine de recuerdo, con su picado
  const T = '#F7B267';
  s += tilt(5, 108, 88, shade(rr(92, 82, 36, 17, 1), '#3A2418', 0.22)
    + part('M89 79H125V84.4A2.6 2.6 0 0 0 125 89.6V95H89V89.6A2.6 2.6 0 0 0 89 84.4Z', T, { w: 1.6 })
    + line('M116 81.4V93', tone(T, -0.8), 1.4, { 'stroke-dasharray': '2 1.8' })
    + flat(star(103, 87, 4.4, 0.5), '#FFF3D6') + flat(rr(118.6, 84.6, 3.6, 5, 1), tone(T, -0.6)));
  s += pin(97, 81.5, '#C9B6F2');
  return piece(160, 120, s);
}

// Para el laboratorio (/arte?set=personal). `svg` se arma al pedirlo.
const entry = (id, name, w, h, make) => ({ id, name, w, h, get svg() { return make(); } });
export const PERSONAL_ART = [
  entry('cofre', 'Cofre de recuerdos', 140, 120, () => cofreSvg()),
  entry('cofre-brilla', 'Cofre (carta lista)', 140, 120, () => cofreSvg({ glow: true })),
  entry('cofre-abierto', 'Cofre abierto', 140, 120, () => cofreSvg({ open: true })),
  entry('frasco-0', 'Frasco vacío', 90, 120, () => frascoSvg({ fill: 0 })),
  entry('frasco-mitad', 'Frasco a la mitad', 90, 120, () => frascoSvg({ fill: 0.5 })),
  entry('frasco-lleno', 'Frasco lleno', 90, 120, () => frascoSvg({ fill: 1 })),
  entry('diario', 'Diario', 110, 90, () => diarioSvg()),
  entry('diario-abierto', 'Diario abierto', 110, 90, () => diarioSvg({ open: true })),
  entry('sobre-voz', 'Nota de voz', 70, 56, () => sobreVozSvg()),
  entry('regalo-nota', 'Tarjetita', 60, 50, () => regaloNotaSvg()),
  entry('tablero', 'Tablero de preguntas', 160, 120, () => tableroSvg()),
];
