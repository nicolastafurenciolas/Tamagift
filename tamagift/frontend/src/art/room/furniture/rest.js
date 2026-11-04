// Camas y asientos. Todos en vista 3/4 (ver draw.js): se ve el frente
// de cada pieza y su cara de arriba; lo que está contra la pared
// (respaldos, cabeceras) se ve de frente, detrás.
//
// Telas: formas infladas (lados abombados), luz arriba a la izquierda,
// sombra donde se hunden, ribetes y costuras. Madera: vetas (`grain`),
// canto iluminado y tiradores con brillo (ayudas en storage.js).

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, floorShadow, Ell, G, mirrorX } from '../draw.js';
import { grain, calm, calmD, metalOf, fabricOf } from './storage.js';

const SHEET = '#FFF8F1';
const n1 = (v) => +v.toFixed(1);

// ── Telas ─────────────────────────────────────────────────────────
// Almohada: lados abombados y esquinas en punta (las "orejitas").
const pillowD = (x, y, w, h, b = 5.5) => `M${x} ${y}Q${x + w / 2} ${y - b} ${x + w} ${y}Q${x + w + b * 0.8} ${y + h / 2} ${x + w} ${y + h}Q${x + w / 2} ${y + h + b} ${x} ${y + h}Q${x - b * 0.8} ${y + h / 2} ${x} ${y}Z`;

// Volado: festón de semicírculos alrededor de un rectángulo.
function frillD(x, y, w, h, step = 7, amp = 3.2) {
  const pts = [];
  const nx = Math.max(2, Math.round(w / step)), ny = Math.max(2, Math.round(h / step));
  for (let i = 0; i < nx; i++) pts.push([x + (w * i) / nx, y, 0, -1]);
  for (let i = 0; i < ny; i++) pts.push([x + w, y + (h * i) / ny, 1, 0]);
  for (let i = 0; i < nx; i++) pts.push([x + w - (w * i) / nx, y + h, 0, 1]);
  for (let i = 0; i < ny; i++) pts.push([x, y + h - (h * i) / ny, -1, 0]);
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  pts.forEach(([px, py, dx, dy], i) => {
    const [qx, qy] = pts[(i + 1) % pts.length];
    d += `Q${n1((px + qx) / 2 + dx * amp * 2)} ${n1((py + qy) / 2 + dy * amp * 2)} ${n1(qx)} ${n1(qy)}`;
  });
  return `${d}Z`;
}

/** Almohada inflada: luz arriba a la izquierda, se hunde abajo, un pliegue. */
function pillow(x, y, w, h, c, o = {}) {
  const b = o.b ?? 6.5;
  let s = o.frill ? flat(frillD(x - 3, y - 3, w + 6, h + 6), o.frill) : '';
  s += part(pillowD(x, y, w, h, b), c, { w: 1.8 });
  // media luna de sombra abajo (donde se apoya) y luz arriba a la izquierda
  s += shade(`M${x + 2} ${y + h * 0.55}Q${x + w / 2} ${y + h * 0.9} ${x + w - 2} ${y + h * 0.55}Q${x + w + b * 0.5} ${y + h * 0.8} ${x + w} ${y + h}Q${x + w / 2} ${y + h + b} ${x} ${y + h}Q${x - b * 0.5} ${y + h * 0.8} ${x + 2} ${y + h * 0.55}Z`, tone(c, -1.4), 0.3);
  s += shade(ellD(x + w * 0.3, y + h * 0.28, w * 0.18, h * 0.17), '#FFFFFF', 0.6);
  s += line(`M${x + w * 0.55} ${y + h * 0.3}Q${x + w * 0.68} ${y + h * 0.22} ${x + w * 0.8} ${y + h * 0.36}`, tone(c, -1.1), 1.5, { opacity: 0.55 });
  if (o.trim) s += line(`M${x + 3} ${y + h * 0.5}Q${x + 1} ${y + h * 0.75} ${x + 1.5} ${y + h - 1}M${x + w - 3} ${y + h * 0.5}Q${x + w - 1} ${y + h * 0.75} ${x + w - 1.5} ${y + h - 1}`, o.trim, 2, { opacity: 0.9 });
  return s;
}

// Corazón (de frente).
const heartD = (x, y, s) => `M${x} ${y + s * 0.85}C${x - s * 1.1} ${y + s * 0.1} ${x - s * 1.05} ${y - s * 0.95} ${x} ${y - s * 0.35}C${x + s * 1.05} ${y - s * 0.95} ${x + s * 1.1} ${y + s * 0.1} ${x} ${y + s * 0.85}Z`;

/** Cojín corazón con botón al medio. */
function heartPillow(cx, cy, k, c) {
  let s = part(heartD(cx, cy, k), c, { w: 1.8 });
  s += shade(`M${cx - k * 0.9} ${cy + k * 0.05}C${cx - k * 0.5} ${cy + k * 0.5} ${cx + k * 0.5} ${cy + k * 0.5} ${cx + k * 0.9} ${cy + k * 0.05}C${cx + k * 0.6} ${cy + k * 0.5} ${cx + k * 0.2} ${cy + k * 0.7} ${cx} ${cy + k * 0.85}C${cx - k * 0.2} ${cy + k * 0.7} ${cx - k * 0.6} ${cy + k * 0.5} ${cx - k * 0.9} ${cy + k * 0.05}Z`, tone(c, -1.3), 0.35);
  s += shade(ellD(cx - k * 0.48, cy - k * 0.38, k * 0.22, k * 0.16), '#FFFFFF', 0.6);
  s += part(ellD(cx, cy + k * 0.05, k * 0.14, k * 0.12), tone(c, -0.9), { w: 1.2 });
  return s;
}

// Botón de capitoné con sus pliegues en X (los pliegues no van en neón:
// se encenderían como una W).
function tuft(pts, c) {
  const d = pts.map(([x, y]) => `M${x - 6} ${y - 4}L${x - 2} ${y - 1.2}M${x + 6} ${y - 4}L${x + 2} ${y - 1.2}M${x - 6} ${y + 4}L${x - 2} ${y + 1.2}M${x + 6} ${y + 4}L${x + 2} ${y + 1.2}`).join('');
  let s = line(d, tone(c, -1), 1.5, { opacity: 0.5, 'data-skip': 'neon pixel' }) + line(d, tone(c, -1), 1.5, { opacity: 0.3, 'data-only': 'pixel' });
  pts.forEach(([x, y]) => { s += shade(ellD(x + 0.6, y + 1.2, 3.6, 2.8), tone(c, -1.4), 0.35) + flat(ellD(x, y, 2.4, 2.2), tone(c, -0.9)) + flat(ellD(x - 0.7, y - 0.7, 0.9, 0.8), tone(c, 1)); });
  return s;
}
// Rombos de capitoné entre botones (líneas de costura hundida).
const diamonds = (pairs, c) => {
  const d = pairs.map(([a, b]) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`).join('');
  return line(d, tone(c, -1.1), 1.5, { opacity: 0.4, 'data-skip': 'neon pixel' }) + line(d, tone(c, -1.1), 1.5, { opacity: 0.24, 'data-only': 'pixel' });
};

/**
 * Colcha: la cara de arriba (con el embozo doblado, que deja ver el
 * revés) y la caída por el frente, con pliegues que nacen del dobladillo
 * ondulado y un ribete. `motif`: 'lunares' | 'flores'.
 */
function quilt(x0, x1, yFold, yEdge, yHem, p, o = {}) {
  const C = mat(p.cloth);
  const acc = o.dot || (metalOf(p.accent) === p.accent ? p.accent : '#FFFFFF');
  const rev = mix(p.cloth, '#FFFFFF', 0.72);
  const w = x1 - x0;
  let s = '';
  // cara de arriba
  const top = mix(C.top, p.cloth, 0.25);
  s += face(rr(x0 + 2, yFold, w - 4, yEdge - yFold + 4, 6), top) + calm(x0 + 2, yFold, w - 4, yEdge - yFold + 4, top);
  // motivo sobre la cara de arriba (aplastado: está acostado)
  const dot = (x, y, rx, ry) => (o.motif === 'flores'
    ? flat(ellD(x - rx * 0.55, y, rx * 0.6, ry * 0.75), acc) + flat(ellD(x + rx * 0.55, y, rx * 0.6, ry * 0.75), acc) + flat(ellD(x, y - ry * 0.5, rx * 0.6, ry * 0.7), acc) + flat(ellD(x, y + ry * 0.5, rx * 0.6, ry * 0.7), acc) + flat(ellD(x, y, rx * 0.36, ry * 0.4), mix(acc, '#E9845A', 0.55))
    : flat(ellD(x, y, rx, ry), acc));
  for (let y = yFold + 17, ri = 0; y < yEdge - 2; y += 8, ri++) {
    for (let x = x0 + 14 + (ri % 2) * 10; x < x1 - 10; x += 20) s += dot(x, y, 3.6, 2);
  }
  // embozo doblado: el revés, con su costura y la sombrita que deja
  s += shade(rr(x0 + 4, yFold + 10, w - 8, 4.5, 2), tone(p.cloth, -1.2), 0.32);
  s += part(`M${x0} ${yFold + 2}Q${x0} ${yFold - 2} ${x0 + 5} ${yFold - 2}H${x1 - 5}Q${x1} ${yFold - 2} ${x1} ${yFold + 2}V${yFold + 9}Q${x1} ${yFold + 12} ${x1 - 4} ${yFold + 12}H${x0 + 4}Q${x0} ${yFold + 12} ${x0} ${yFold + 9}Z`, rev, { w: 1.8 });
  s += line(`M${x0 + 5} ${yFold + 8.2}H${x1 - 5}`, mix(p.cloth, rev, 0.35), 1.5, { opacity: 0.85 });
  s += shade(rr(x0 + 6, yFold, w * 0.4, 2.4, 1.2), '#FFFFFF', 0.6);
  // caída por el frente: dobladillo en ondas que bajan entre pliegue y
  // pliegue y esquinas que se recogen
  const folds = o.folds || [0.2, 0.4, 0.6, 0.8].map((t) => n1(x0 + w * t));
  const xs = [x0 - 2, ...folds, x1 + 2];
  let hem = `M${x0 - 2} ${yEdge}H${x1 + 2}V${yHem - 7}`;
  for (let i = xs.length - 1; i > 0; i--) hem += `Q${n1((xs[i] + xs[i - 1]) / 2)} ${yHem + 7} ${xs[i - 1]} ${i === 1 ? yHem - 7 : yHem - 1}`;
  hem += 'Z';
  s += face(hem, C.front) + calmD(`M${x0 + 2} ${yEdge + 3.6}H${x1 - 2}V${yHem - 6}H${x0 + 2}Z`, C.front);
  // motivo de pie (no aplastado)
  for (let y = yEdge + 7, ri = 0; y < yHem - 4; y += 9, ri++) {
    for (let x = x0 + 9 + (ri % 2) * 10; x < x1 - 4; x += 20) s += dot(x, y, 3, 3);
  }
  // pliegues: una sombra que sube desde cada punta del dobladillo y la luz
  // del lado de la ventana
  folds.forEach((fx) => {
    s += shade(`M${fx - 2.6} ${yHem}Q${fx - 1} ${yEdge + 9} ${fx} ${yEdge + 3}Q${fx + 0.6} ${yEdge + 10} ${fx + 2.6} ${yHem + 1}Z`, tone(p.cloth, -1.5), 0.32);
    s += shade(`M${fx - 9} ${yHem + 3}Q${fx - 7} ${yEdge + 12} ${fx - 5} ${yEdge + 7}Q${fx - 4} ${yEdge + 13} ${fx - 3.4} ${yHem + 1}Z`, '#FFFFFF', 0.2);
  });
  // ribete que sigue al dobladillo
  let rib = `M${x0 - 1} ${yHem - 11}`;
  for (let i = 1; i < xs.length; i++) rib += `Q${n1((xs[i - 1] + xs[i]) / 2)} ${yHem + 2} ${xs[i]} ${i === xs.length - 1 ? yHem - 11 : yHem - 5}`;
  s += line(rib, o.trim || SHEET, 3.4);
  // luz en el canto de arriba de la caída
  s += line(`M${x0 + 2} ${yEdge + 1.6}H${x1 - 2}`, C.hi, 1.6, { opacity: 0.7 });
  return s;
}

// Bolita de remate de un poste (madera torneada).
const finial = (cx, cy, r, wood) => face(rr(cx - r * 0.75, cy + r * 0.6, r * 1.5, 3.5, 1), mat(wood).front, { w: 1.4 }) + part(ellD(cx, cy, r, r), mat(wood).top, { w: 1.8 }) + shine(ellD(cx - r * 0.38, cy - r * 0.38, r * 0.3, r * 0.26));

// Pata torneada que se afina hacia el piso.
const foot = (x, y0, y1, wood, k = 6) => face(`M${x - k} ${y0}H${x + k}L${x + k * 0.6} ${y1 - 3}Q${x} ${y1 + 1} ${x - k * 0.6} ${y1 - 3}Z`, mat(wood).side, { w: 1.8 }) + line(`M${x - k * 0.45} ${y0 + 2.5}L${x - k * 0.3} ${y1 - 4}`, mat(wood).front, 1.6, { opacity: 0.8 });

// Brazo enrollado de sofá o sillón: frente, rollo arriba y la voluta.
function rolledArm(x, y, w, yBot, c) {
  const C = mat(c);
  const r = w / 2;
  let s = face(`M${x} ${y + r * 0.6}Q${x} ${y} ${x + r} ${y}Q${x + w} ${y} ${x + w} ${y + r * 0.6}V${yBot}H${x}Z`, C.front);
  s += line(`M${x + 3.5} ${y + r * 1.4}V${yBot - 4}`, C.hi, 1.6, { opacity: 0.5 });
  // voluta: el extremo redondo del rollo, con pliegues hacia un botón
  const cx = x + r, cy = y + r * 0.82;
  s += part(ellD(cx, cy, r * 0.82, r * 0.72), tone(c, 0.25), { w: 1.6 });
  s += line(`M${cx} ${cy - r * 0.62}L${cx} ${cy - 2}M${cx - r * 0.66} ${cy}L${cx - 2} ${cy}M${cx + r * 0.66} ${cy}L${cx + 2} ${cy}M${cx - r * 0.45} ${cy + r * 0.45}L${cx - 1.5} ${cy + 1.5}M${cx + r * 0.45} ${cy + r * 0.45}L${cx + 1.5} ${cy + 1.5}`, tone(c, -0.8), 1.4, { opacity: 0.5, 'data-skip': 'neon' });
  s += flat(ellD(cx, cy, 2.6, 2.4), tone(c, -0.9)) + shade(ellD(cx - r * 0.3, cy - r * 0.32, r * 0.24, r * 0.16), '#FFFFFF', 0.5);
  return s;
}

/**
 * Almohadón de asiento: cara de arriba clara y frente abombado, con
 * ribete en el canto (y, la línea donde se dobla).
 */
function seatCushion(x, y, w, top, front, c, pipe) {
  const C = mat(c);
  let s = face(rr(x, y - top, w, top + 4, 5), mix(C.top, c, 0.2)) + calm(x, y - top, w, top + 4, mix(C.top, c, 0.2));
  s += shade(ellD(x + w * 0.32, y - top * 0.55, w * 0.22, top * 0.22), '#FFFFFF', 0.35);
  s += face(`M${x} ${y}H${x + w}Q${x + w + 2} ${y + front * 0.5} ${x + w - 1} ${y + front}Q${x + w / 2} ${y + front + 3} ${x + 1} ${y + front}Q${x - 2} ${y + front * 0.5} ${x} ${y}Z`, tone(c, -0.25));
  s += shade(`M${x + 2} ${y + front * 0.62}Q${x + w / 2} ${y + front * 0.8} ${x + w - 2} ${y + front * 0.62}V${y + front}Q${x + w / 2} ${y + front + 3} ${x + 2} ${y + front}Z`, tone(c, -1.4), 0.25);
  s += line(`M${x + 2} ${y + 0.5}H${x + w - 2}`, pipe, 2.6);
  return s;
}

export const REST = [
  {
    id: 'cama', name: 'Camita', cat: 'camas', price: 180, w: 170, h: 174, place: 'piso', tags: ['dulce', 'princesa', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(85, 169, 80, 7);
      s += foot(24, 155, 170, p.wood) + foot(146, 155, 170, p.wood);
      // cabecera contra la pared: cresta redonda, postes con bolitas y un
      // corazón tallado
      const crest = (k) => `M${24 + k} 100V${36 + k}Q${24 + k} ${28 + k} ${32 + k} ${28 + k}H${52 + k * 0.4}Q${60 + k * 0.2} ${28 + k} ${64 + k * 0.3} ${20 + k}Q${72 + k * 0.1} ${8 + k} 85 ${8 + k}Q${98 - k * 0.1} ${8 + k} ${106 - k * 0.3} ${20 + k}Q${110 - k * 0.2} ${28 + k} ${118 - k * 0.4} ${28 + k}H${138 - k}Q${146 - k} ${28 + k} ${146 - k} ${36 + k}V100Z`;
      s += face(crest(0), W.front);
      s += face(crest(7), tone(p.wood, -0.18), { w: 1.6 }) + calmD(crest(10.6), tone(p.wood, -0.18));
      s += grain(32, 30, 106, 34, p.wood, { seed: 4, gap: 8 });
      s += line('M31 36Q31 31 36 31', W.hi, 1.6, { opacity: 0.8 }) + line('M66 23Q74 13 85 13', W.hi, 1.6, { opacity: 0.8 });
      s += shade(heartD(85, 29, 8), W.deep, 0.55) + line('M79 35Q85 39 91 35', W.hi, 1.4, { opacity: 0.6 });
      [19, 151].forEach((x) => { s += face(rr(x - 5.5, 18, 11, 96, 3), W.front, { w: 1.8 }) + grain(x - 4, 24, 8, 80, p.wood, { dir: 'v', gap: 6, seed: x }) + line(`M${x - 3} 22V54`, W.hi, 1.4, { opacity: 0.6 }) + finial(x, 13, 6.5, p.wood); });
      // larguero de la base (asoma bajo la colcha)
      s += face(rr(12, 136, 146, 22, 4), W.front) + calm(12, 136, 146, 22, W.front);
      s += grain(14, 146, 142, 10, p.wood, { seed: 9, gap: 6 });
      // sábana sobre el colchón y almohadas contra la cabecera
      s += face(rr(20, 54, 130, 74, 8), SHEET) + calm(20, 54, 130, 74, SHEET);
      s += shade(rr(28, 84, 112, 6, 3), tone(SHEET, -1.4), 0.3);
      s += pillow(36, 59, 68, 25, mix(p.cloth, '#FFFFFF', 0.86), { trim: mix(p.cloth, '#FFFFFF', 0.45) });
      s += heartPillow(126, 75, 13, mix(p.cloth, '#FFFFFF', 0.25));
      // colcha con lunares, embozo doblado y caída con pliegues
      s += quilt(16, 154, 92, 124, 148, p);
      return s;
    },
  },
  {
    id: 'camaDosel', name: 'Cama con dosel', cat: 'camas', price: 320, w: 196, h: 236, place: 'piso', tags: ['princesa', 'elegante', 'angelical'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      const pad = mix(p.cloth, '#FFFFFF', 0.45);
      let s = floorShadow(98, 231, 92, 8);
      // postes de atrás (asoman sobre la cabecera)
      s += face(rr(30, 40, 9, 120, 3), W.side, { w: 1.8 }) + face(rr(157, 40, 9, 120, 3), W.side, { w: 1.8 });
      // cabecera tapizada con capitoné, en un marco de madera
      const arch = (k) => `M${36 + k} 150V${92 + k * 0.6}C${36 + k} ${70 + k} ${60 + k * 0.5} ${60 + k} 98 ${60 + k}C${136 - k * 0.5} ${60 + k} ${160 - k} ${70 + k} ${160 - k} ${92 + k * 0.6}V150Z`;
      s += face(arch(0), W.front) + grain(40, 70, 116, 20, p.wood, { seed: 21, gap: 7 });
      s += face(arch(6), pad, { w: 1.6 }) + calmD(arch(9.6), pad);
      s += shade(ellD(78, 80, 18, 7), '#FFFFFF', 0.35);
      const B = [[70, 82], [98, 76], [126, 82], [84, 100], [112, 100]];
      s += diamonds([[B[0], B[3]], [B[3], B[1]], [B[1], B[4]], [B[4], B[2]], [[56, 100], B[0]], [[140, 100], B[2]], [B[0], [58, 72]], [B[2], [138, 72]], [B[0], [84, 66]], [B[2], [112, 66]], [B[1], [86, 67]], [B[1], [110, 67]]], pad);
      s += tuft(B, pad);
      // base, sábana, almohadas y colcha floreada
      s += foot(44, 208, 231, p.wood) + foot(152, 208, 231, p.wood);
      s += face(rr(30, 190, 136, 22, 4), W.front) + calm(30, 190, 136, 22, W.front) + grain(32, 200, 132, 10, p.wood, { seed: 23, gap: 6 });
      s += face(rr(38, 112, 120, 70, 6), SHEET) + calm(38, 112, 120, 70, SHEET);
      s += shade(rr(46, 136, 104, 6, 3), tone(SHEET, -1.4), 0.3);
      s += pillow(48, 119, 44, 19, '#FFFFFF', { b: 4.5, frill: pad }) + pillow(104, 119, 44, 19, '#FFFFFF', { b: 4.5, frill: pad });
      // rodillo con los extremos fruncidos
      const ac = fabricOf(p);
      s += part(rr(76, 134, 44, 14, 7), ac, { w: 1.8 }) + shade(rr(78, 142, 40, 5, 2.5), tone(ac, -1.3), 0.3) + line('M81 137.5H113', '#FFFFFF', 1.8, { opacity: 0.55 });
      [76, 120].forEach((x, i) => { s += part(ellD(x, 141, 4.5, 7.5), tone(ac, -0.35), { w: 1.6 }) + line(`M${x} 141L${x + (i ? 3 : -3)} 136M${x} 141L${x + (i ? 3.6 : -3.6)} 141M${x} 141L${x + (i ? 3 : -3)} 146`, tone(ac, -1.1), 1.3, { opacity: 0.6 }) + part(ellD(x, 141, 2, 2), tone(ac, -0.8), { w: 1.1 }); });
      s += quilt(32, 164, 148, 176, 200, p, { motif: 'flores', folds: [58, 84, 112, 138] });
      // cortinas: cuelgan del dosel, se recogen en el poste y caen al piso
      const curtain = `M4 32C4 70 10 104 14 126C8 150 2 190 2 222Q12 226 22 222Q26 224 34 220C34 186 30 150 26 126C34 100 42 66 44 32Z`;
      const cur = (c) => {
        let k = part(curtain, c, { w: 1.8 });
        k += shade('M30 34C28 70 24 104 22 126C24 150 28 190 30 220Q32 222 34 220C34 186 30 150 26 126C34 100 42 66 44 32Z', tone(c, -1.3), 0.3);
        k += line('M14 36C16 70 18 104 19 124M24 36C24 70 22 104 21 124M18 130C14 160 10 190 9 220M22 130C24 160 25 190 26 220', tone(c, -1.1), 1.5, { opacity: 0.45 });
        k += line('M9 40C10 70 13 100 16 120M15 132C11 160 7 190 6 216', '#FFFFFF', 1.6, { opacity: 0.35 });
        return k;
      };
      const tie = (x) => part(`M${x} 126C${x - 9} 118 ${x - 13} 124 ${x - 11} 130C${x - 9} 134 ${x - 4} 130 ${x} 126C${x + 4} 130 ${x + 9} 134 ${x + 11} 130C${x + 13} 124 ${x + 9} 118 ${x} 126Z`, fabricOf(p), { w: 1.5 }) + part(`M${x - 2} 128L${x - 6} 142L${x - 1} 139Z`, fabricOf(p), { w: 1.3 }) + part(`M${x + 2} 128L${x + 6} 142L${x + 1} 139Z`, fabricOf(p), { w: 1.3 }) + part(ellD(x, 127, 2.6, 2.4), tone(fabricOf(p), -0.4), { w: 1.2 });
      const left = cur(C.top);
      s += left + mirrorX(left, 98);
      // postes de adelante, con grano y un anillo torneado
      [17.5, 178.5].forEach((x) => {
        s += face(rr(x - 5.5, 30, 11, 200, 3), W.front, { w: 2 }) + grain(x - 4, 40, 8, 180, p.wood, { dir: 'v', gap: 6, seed: x + 3 });
        s += line(`M${x - 3} 34V120`, W.hi, 1.4, { opacity: 0.6 }) + face(rr(x - 7, 176, 14, 6, 2), W.top, { w: 1.6 });
      });
      s += tie(17.5) + tie(178.5);
      // techo: barra con bolitas y volado en guirnaldas con ribete
      s += face(rr(4, 16, 188, 13, 4), W.front) + line('M8 18.5H188', W.hi, 1.6, { opacity: 0.8 }) + grain(8, 21, 180, 6, p.wood, { seed: 31, gap: 6 });
      s += finial(10, 11, 6, p.wood) + finial(186, 11, 6, p.wood);
      const sw = [8, 44, 80, 116, 152, 188];
      let val = 'M6 28H190V32';
      for (let i = sw.length - 1; i > 0; i--) val += `Q${(sw[i] + sw[i - 1]) / 2} 54 ${sw[i - 1]} 32`;
      s += face(`${val}Z`, C.front);
      for (let i = 1; i < sw.length; i++) {
        const m = (sw[i] + sw[i - 1]) / 2;
        s += shade(`M${sw[i - 1] + 4} 34Q${m} 50 ${sw[i] - 4} 34Q${m} 46 ${sw[i - 1] + 4} 34Z`, tone(p.cloth, -1.4), 0.3);
        s += line(`M${sw[i - 1] + 2} 32Q${m} 51 ${sw[i] - 2} 32`, pad, 2.6);
      }
      s += line('M8 30.5H188', C.hi, 1.6, { opacity: 0.7 });
      sw.slice(1, -1).forEach((x) => { s += part(ellD(x, 33, 3.4, 3.4), metalOf(p.accent), { w: 1.3 }) + shine(ellD(x - 1.1, 32, 1, 0.9)); });
      return s;
    },
  },
  {
    id: 'cucha', name: 'Camita redonda', cat: 'camas', price: 120, w: 156, h: 88, place: 'piso', tags: ['dulce', 'aesthetic'],
    draw: (p) => {
      const C = mat(p.cloth);
      const inner = mix(p.cloth, '#FFFFFF', 0.6);
      let s = floorShadow(78, 84, 72, 7);
      // aro relleno (un rollo): su frente abombado, el borde de arriba y el
      // hueco con su colchoncito
      s += face('M6 42C6 60 10 70 18 75C34 84 56 86 78 86C100 86 122 84 138 75C146 70 150 60 150 42Z', C.front);
      // costuras del rollo por delante (gajos)
      s += line('M30 62Q28 72 31 81M54 66Q53 76 55 84.5M78 67V86M102 66Q103 76 101 84.5M126 62Q128 72 125 81', tone(p.cloth, -1.1), 1.5, { opacity: 0.45 });
      s += shade('M8 58C14 72 40 80 78 80C116 80 142 72 148 58C148 72 140 78 126 82C110 87 46 87 30 82C16 78 8 72 8 58Z', tone(p.cloth, -1.4), 0.3);
      s += line('M12 56Q13 64 19 70', '#FFFFFF', 1.8, { opacity: 0.4 });
      s += face(ellD(78, 42, 72, 28), C.top) + calmD(ellD(78, 42, 68.4, 24.4), C.top);
      s += line('M78 14.5V24M32 21Q37 25 41 29M124 21Q119 25 115 29M10 40Q20 41 29 42M146 40Q136 41 127 42', tone(p.cloth, -0.9), 1.5, { opacity: 0.4 });
      s += shade(ellD(50, 22, 24, 5), '#FFFFFF', 0.4);
      s += face(ellD(78, 42, 49, 17.5), tone(p.cloth, -0.7), { w: 1.8 });
      s += part(ellD(78, 47, 45, 12.5), inner, { w: 1.6 }) + calmD(ellD(78, 47, 41.4, 8.9), inner);
      s += shade('M34 45C38 37 58 33 78 33C98 33 118 37 122 45C114 39 98 37 78 37C58 37 42 39 34 45Z', tone(p.cloth, -1.2), 0.3);
      // ribete del borde
      s += Ell(78, 42, 69, 26.5, { fill: 'none', stroke: metalOf(p.accent) === p.accent ? p.accent : SHEET, 'stroke-width': 2.4, opacity: 0.85, 'data-r': 'line' });
      // patita bordada al frente y un hueso de juguete
      const paw = (x, y, c) => flat(ellD(x, y + 2, 4.2, 3.2), c) + flat(ellD(x - 4.6, y - 2.4, 1.8, 2), c) + flat(ellD(x - 1.6, y - 4.6, 1.8, 2), c) + flat(ellD(x + 1.6, y - 4.6, 1.8, 2), c) + flat(ellD(x + 4.6, y - 2.4, 1.8, 2), c);
      s += paw(78, 78, inner);
      s += part('M56 45h20a5 5 0 1 1 4 7a5 5 0 1 1 -4 7h-20a5 5 0 1 1 -4 -7a5 5 0 1 1 4 -7Z', '#FFF6E8', { w: 1.6 }) + shade('M56 55h20q3 0 4 2h-28q1 -2 4 -2Z', '#C9B49A', 0.4);
      s += part(ellD(104, 49, 7.5, 7.5), metalOf(p.accent) === p.accent ? p.accent : '#F28CA8', { w: 1.6 }) + line('M97 49Q104 44 111 49', '#FFFFFF', 1.6, { opacity: 0.8 }) + shine(ellD(101.5, 45.5, 1.6, 1.3));
      return s;
    },
  },
  {
    id: 'sofa', name: 'Sofá', cat: 'asientos', price: 200, w: 212, h: 134, place: 'piso', tags: ['dulce', 'rustico', 'aesthetic'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      const pipe = tone(p.cloth, 0.7);
      let s = floorShadow(106, 130, 100, 7);
      s += foot(30, 114, 130, p.wood, 5) + foot(182, 114, 130, p.wood, 5);
      // respaldo contra la pared, con ribete
      s += face(rrTop(18, 14, 176, 70, 24), tone(p.cloth, -0.45));
      s += line('M24 36Q24 19 42 19H170Q188 19 188 36', pipe, 2.2, { opacity: 0.9 });
      s += shade(rr(26, 66, 160, 18, 4), tone(p.cloth, -1.6), 0.3);
      // dos almohadones de respaldo, inflados
      s += pillow(36, 30, 66, 44, C.front, { b: 5 }) + pillow(110, 30, 66, 44, C.front, { b: 5 });
      // almohadones del asiento
      s += seatCushion(36, 90, 69, 16, 18, p.cloth, pipe) + seatCushion(107, 90, 69, 16, 18, p.cloth, pipe);
      // brazos enrollados
      const arm = rolledArm(8, 52, 32, 116, p.cloth);
      s += arm + mirrorX(arm, 106);
      // zócalo de madera
      s += face(rr(14, 110, 184, 9, 3), W.front, { w: 2 }) + grain(16, 112, 180, 5, p.wood, { seed: 41, gap: 6 }) + line('M18 112H194', W.hi, 1.4, { opacity: 0.8 });
      // cojín suelto, ladeado, con rayitas
      const ac = fabricOf(p);
      s += G({ transform: 'rotate(-12 64 66)' }, part(pillowD(48, 52, 32, 28, 4), ac, { w: 1.8 }) + line('M50 60H78M50 68H78M50 76H78', tone(ac, -0.8), 2, { opacity: 0.45 }) + shade(ellD(56, 58, 5, 3), '#FFFFFF', 0.5) + shade('M49 72Q64 78 79 72V80Q64 84 48 80Z', tone(ac, -1.3), 0.3));
      // mantita tejida doblada sobre el brazo derecho, con flecos
      const bl = mix(p.cloth, '#FFFFFF', 0.8);
      const st = metalOf(p.accent) === p.accent ? p.accent : C.side;
      s += part('M165 62Q166 50 180 48Q196 46 205 56L206 96Q200 101 192 98Q184 95 176 99Q170 102 166 98Z', bl, { w: 1.8 });
      s += line('M166 84Q172 82 178 85Q186 88 192 85Q199 82 205.6 85M166 90Q172 88 178 91Q186 94 192 91Q199 88 205.8 91', st, 2.6);
      s += shade('M165 62Q166 50 180 48Q196 46 205 56L205.2 62Q196 53 181 54Q168 56 165.4 66Z', '#FFFFFF', 0.45);
      s += shade('M196 52Q202 54 205 58L206 96Q202 99 198 98Q199 76 196 52Z', tone(bl, -1.4), 0.28) + line('M184 58Q186 76 183 96', tone(bl, -1.2), 1.5, { opacity: 0.4 });
      s += line('M170 100.5V106M175 99.5V105M180 98V104M186 97.6V103.6M191 98.6V104.6M196 99V105M201 98V104', bl, 2.2);
      return s;
    },
  },
  {
    id: 'sillon', name: 'Sillón', cat: 'asientos', price: 160, w: 128, h: 140, place: 'piso', tags: ['elegante', 'rustico'],
    draw: (p) => {
      const W = mat(p.wood), C = mat(p.cloth);
      const back = tone(p.cloth, -0.1);
      const pipe = tone(p.cloth, 0.7);
      let s = floorShadow(64, 136, 60, 7);
      s += foot(24, 122, 136, p.wood, 5) + foot(104, 122, 136, p.wood, 5);
      // respaldo de orejas con capitoné
      const shape = (k) => `M${22 + k} 86V${34 + k * 0.5}C${22 + k} ${14 + k} ${42 + k * 0.5} ${6 + k} 64 ${6 + k}C${86 - k * 0.5} ${6 + k} ${106 - k} ${14 + k} ${106 - k} ${34 + k * 0.5}V86Z`;
      s += face(shape(0), back) + calmD(shape(3.6), back);
      s += line('M27 80V35C27 18 44 11 64 11C84 11 101 18 101 35V80', pipe, 2, { opacity: 0.85 });
      s += shade(ellD(46, 24, 12, 6), '#FFFFFF', 0.35);
      const B = [[46, 30], [64, 24], [82, 30], [55, 48], [73, 48], [46, 66], [64, 66], [82, 66]];
      s += diamonds([[B[0], B[3]], [B[3], B[1]], [B[1], B[4]], [B[4], B[2]], [B[3], B[5]], [B[3], B[6]], [B[4], B[6]], [B[4], B[7]], [B[0], [36, 44]], [B[2], [92, 44]], [B[5], [36, 52]], [B[7], [92, 52]], [B[0], [54, 16]], [B[2], [74, 16]]], back);
      s += tuft(B, back);
      // asiento
      s += seatCushion(30, 92, 68, 16, 16, p.cloth, pipe);
      // brazos enrollados
      const arm = rolledArm(6, 60, 26, 124, p.cloth);
      s += arm + mirrorX(arm, 64);
      // faldón de madera
      s += face(rr(10, 117, 108, 9, 3), W.front, { w: 1.8 }) + grain(12, 119, 104, 5, p.wood, { seed: 51, gap: 6 }) + line('M14 119H114', W.hi, 1.4, { opacity: 0.8 });
      // cojincito de acento apoyado en una esquina
      const ac = fabricOf(p);
      s += G({ transform: 'rotate(10 86 80)' }, part(pillowD(74, 70, 24, 20, 3.5), ac, { w: 1.6 }) + shade('M75 82Q86 86 97 82V90Q86 93 74 90Z', tone(ac, -1.3), 0.3) + shade(ellD(80, 74, 4, 2.6), '#FFFFFF', 0.5) + line('M86 72V88', tone(ac, -0.8), 1.6, { opacity: 0.5 }));
      return s;
    },
  },
  {
    id: 'puf', name: 'Puf', cat: 'asientos', price: 70, w: 104, h: 82, place: 'piso', tags: ['dulce', 'aesthetic', 'hippie'],
    draw: (p) => {
      const C = mat(p.cloth);
      const ac = metalOf(p.accent) === p.accent ? p.accent : tone(p.cloth, 0.8);
      let s = floorShadow(52, 79, 48, 7);
      // costado abombado, fruncido en gajos
      s += face('M7 40C3 50 3 62 8 68C14 76 32 78 52 78C72 78 90 76 96 68C101 62 101 50 97 40Z', C.front);
      s += line('M20 48Q17 60 21 72M36 52Q34 64 36 76M52 53V78M68 52Q70 64 68 76M84 48Q87 60 83 72', tone(p.cloth, -1.1), 1.6, { opacity: 0.45 });
      s += line('M12 50Q10 60 13 66', '#FFFFFF', 1.8, { opacity: 0.35 });
      s += shade('M5 56C8 70 30 74 52 74C74 74 96 70 99 56C100 68 94 76 72 78C58 79 46 79 32 78C12 76 4 68 5 56Z', tone(p.cloth, -1.4), 0.3);
      // ribete abajo
      s += line('M9 69C16 76 34 78 52 78C70 78 88 76 95 69', ac, 2.6);
      // tapa: pliegues que van al botón
      s += face(ellD(52, 40, 46, 22), C.top) + calmD(ellD(52, 40, 42.4, 18.4), C.top);
      s += line('M52 40Q40 28 22 26M52 40Q62 26 80 24M52 40Q74 40 94 44M52 40Q66 52 76 60M52 40Q42 54 30 60M52 40Q30 44 10 44', tone(p.cloth, -0.8), 1.5, { opacity: 0.45, 'data-skip': 'neon' });
      s += shade(ellD(34, 30, 14, 5), '#FFFFFF', 0.45);
      s += Ell(52, 40, 44, 20.5, { fill: 'none', stroke: ac, 'stroke-width': 2.4, 'data-r': 'line' });
      s += shade(ellD(53, 42, 7, 4.6), tone(p.cloth, -1.4), 0.35);
      s += part(ellD(52, 40, 5.5, 3.8), ac, { w: 1.4 }) + shine(ellD(50.5, 38.8, 1.6, 1));
      return s;
    },
  },
  {
    id: 'pufPera', name: 'Puf pera', cat: 'asientos', price: 90, w: 116, h: 104, place: 'piso', tags: ['aesthetic', 'hippie', 'y2k'],
    draw: (p) => {
      const c = p.cloth;
      let s = floorShadow(58, 99, 54, 7);
      // la bolsa, desparramada en el piso
      s += part('M10 96C2 82 6 60 20 48C30 38 38 24 58 24C78 24 86 38 96 48C110 60 114 82 106 96Q100 101 58 101Q16 101 10 96Z', c);
      // el hueco donde uno se sienta y las arrugas que salen de ahí
      s += shade('M32 46C42 36 74 36 84 46C80 58 70 62 58 62C46 62 36 58 32 46Z', tone(c, -1.5), 0.4);
      s += line('M34 48C42 58 74 58 82 48', '#FFFFFF', 1.8, { opacity: 0.35 });
      s += line('M34 54Q24 62 20 76M82 54Q94 62 97 74M48 62Q44 74 40 88M70 62Q74 74 78 86M28 40Q22 46 18 54', tone(c, -1.2), 1.6, { opacity: 0.45 });
      s += line('M37 57Q28 64 25 74M78 58Q88 64 91 72', '#FFFFFF', 1.6, { opacity: 0.3 });
      // costura de abajo y luz arriba a la izquierda
      s += line('M12 84Q58 96 104 84', tone(c, -1.3), 1.6, { opacity: 0.5 });
      s += shade('M10 96Q16 101 58 101Q100 101 106 96C108 92 109 88 108 84Q58 98 8 84C8 88 8 92 10 96Z', tone(c, -1.5), 0.3);
      s += shade(ellD(40, 34, 10, 5), '#FFFFFF', 0.45) + shade(ellD(18, 66, 4, 9), '#FFFFFF', 0.25);
      // etiqueta cosida en la costura
      s += part('M98 84h9v8h-9Z', fabricOf(p), { w: 1.3 }) + line('M100 87h5', tone(fabricOf(p), -1), 1.2, { opacity: 0.6 });
      return s;
    },
  },
  {
    id: 'silla', name: 'Silla', cat: 'asientos', price: 80, w: 84, h: 138, place: 'piso', tags: ['rustico', 'elegante'],
    draw: (p) => {
      const W = mat(p.wood);
      const cush = p.cloth;
      let s = floorShadow(42, 134, 36, 6);
      // patas de atrás (más lejos: terminan más arriba) y travesaño
      s += face(rr(19, 84, 7, 40, 2), W.deep, { w: 1.6 }) + face(rr(58, 84, 7, 40, 2), W.deep, { w: 1.6 });
      // respaldo: postes, tablero con un corazón calado y dos barrotes
      s += face(rr(14, 10, 9, 58, 3), W.side, { w: 1.8 }) + face(rr(61, 10, 9, 58, 3), W.side, { w: 1.8 });
      s += face(rr(31, 40, 7, 26, 2), W.side, { w: 1.6 }) + face(rr(46, 40, 7, 26, 2), W.side, { w: 1.6 });
      const hd = 'M42 31C35 25 33 18 37 15C40 13 42 16 42 18C42 16 44 13 47 15C51 18 49 25 42 31Z';
      // el corazón está calado de verdad (se ve la pared); en papel, donde la
      // tijera no sabe recortar agujeros, queda tallado
      s += face(`${rrTop(11, 6, 62, 34, 13)}${hd}`, W.front, { a: { 'fill-rule': 'evenodd', 'data-skip': 'papel' } });
      s += face(rrTop(11, 6, 62, 34, 13), W.front, { a: { 'data-only': 'papel' } }) + shade(hd, W.deep, 0.6, { 'data-only': 'papel' });
      s += grain(14, 9, 56, 28, p.wood, { seed: 61, gap: 7 });
      s += line('M17 12Q17 9 22 9H34', W.hi, 1.6, { opacity: 0.8 }) + line('M38 30.5Q42 33 46 30.5', W.deep, 1.4, { opacity: 0.5 });
      // asiento de madera con su canto
      s += face(rr(7, 66, 70, 12, 3), W.top) + calm(7, 66, 70, 12, W.top);
      s += face(rr(7, 76, 70, 9, 2.5), W.front, { w: 2 }) + grain(9, 78, 66, 5, p.wood, { seed: 63, gap: 6 }) + line('M10 77.6H74', W.hi, 1.4, { opacity: 0.8 });
      // almohadón atado con dos moñitos
      s += shade(rr(14, 72, 58, 4, 2), W.deep, 0.35);
      s += part(pillowD(13, 59, 58, 14, 3.5), cush, { w: 1.8 }) + shade('M14 67Q42 74 70 67V73Q42 77 13 73Z', tone(cush, -1.3), 0.3) + shade(ellD(28, 62, 8, 2.4), '#FFFFFF', 0.5);
      s += line('M42 60V72', tone(cush, -0.9), 1.4, { opacity: 0.45 });
      const bow = (x) => part(`M${x} 60C${x - 6} 54 ${x - 9} 58 ${x - 7} 62C${x - 5} 64 ${x - 2} 62 ${x} 60C${x + 2} 62 ${x + 5} 64 ${x + 7} 62C${x + 9} 58 ${x + 6} 54 ${x} 60Z`, fabricOf(p), { w: 1.3 }) + part(ellD(x, 60, 1.8, 1.8), tone(fabricOf(p), -0.4), { w: 1.1 });
      s += bow(16) + bow(68);
      // patas de adelante y travesaño
      s += face(rr(42 - 30, 116, 60, 5, 2), W.side, { w: 1.6 });
      s += face('M11 85H19L18 135H12Z', W.front, { w: 1.8 }) + face('M65 85H73L72 135H66Z', W.front, { w: 1.8 });
      s += line('M13.5 88V130M67.5 88V130', W.hi, 1.4, { opacity: 0.7 });
      return s;
    },
  },
];
