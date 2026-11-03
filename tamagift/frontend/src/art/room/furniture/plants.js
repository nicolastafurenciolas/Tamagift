// Plantas. La maceta toma el color de la tela (cerámica esmaltada); la
// jardinera de los tulipanes, el de la madera. El follaje es siempre
// verde, en tres tonos: atrás el más hondo, adelante el más claro, y las
// hojas de adelante tapan el borde de la maceta.

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, mat, floorShadow, Ell } from '../draw.js';
import { grain, flowerD, smallPart } from './storage.js';

const G1 = '#6FB07E', G2 = '#4E8F62', G3 = '#9AD0A0', STEM = '#5E8F5E';
const n1 = (v) => +v.toFixed(1);

/**
 * Maceta de cerámica esmaltada (apoyada en y): cuerpo cónico con brillo
 * a la izquierda y sombra a la derecha, pie sin esmaltar, labio claro y
 * tierra con piedritas. `band`: 'puntos' | 'ola' | 'carita'.
 */
function glazedPot(cx, y, rT, rB, h, c, o = {}) {
  const M = mat(c);
  const top = y - h;
  const ryB = rB * 0.5;
  let s = floorShadow(cx, y, rT + 6, 5);
  s += face(`M${cx - rT} ${top}L${cx - rB} ${y - ryB * 0.2}A${rB} ${ryB} 0 0 0 ${cx + rB} ${y - ryB * 0.2}L${cx + rT} ${top}Z`, c);
  // pie de barro sin esmaltar
  const fy = y - 8;
  const kx = (yy) => rB + (rT - rB) * ((y - yy) / h);
  s += part(`M${n1(cx - kx(fy))} ${fy}L${cx - rB} ${y - ryB * 0.2}A${rB} ${ryB} 0 0 0 ${cx + rB} ${y - ryB * 0.2}L${n1(cx + kx(fy))} ${fy}Q${cx} ${fy + 4} ${n1(cx - kx(fy))} ${fy}Z`, '#E2B48C', { w: 1.6 });
  // sombra del lado derecho y brillo del esmalte a la izquierda
  s += shade(`M${n1(cx + rT * 0.45)} ${top + 2}L${n1(cx + rB * 0.45)} ${fy}L${n1(cx + kx(fy) - 1)} ${fy}L${cx + rT - 1} ${top + 2}Z`, M.deep, 0.3);
  if (o.band === 'puntos') for (let i = -2; i <= 2; i++) s += flat(ellD(n1(cx + i * rT * 0.36), top + h * 0.42, 2.6, 2.6), mix(c, '#FFFFFF', 0.7));
  if (o.band === 'ola') s += line(`M${n1(cx - kx(top + h * 0.4) + 2)} ${top + h * 0.4}` + [0, 1, 2, 3, 4, 5].map((i) => `q${n1(kx(top + h * 0.4) / 6)} ${i % 2 ? 4 : -4} ${n1(kx(top + h * 0.4) / 3)} 0`).join(''), mix(c, '#FFFFFF', 0.65), 2.4);
  if (o.band === 'carita') {
    const ey = top + h * 0.4;
    s += flat(ellD(cx - 7, ey, 1.8, 2.4), '#3A2A3E') + flat(ellD(cx + 7, ey, 1.8, 2.4), '#3A2A3E') + flat(ellD(cx - 6.4, ey - 0.9, 0.7, 0.8), '#FFFFFF') + flat(ellD(cx + 7.6, ey - 0.9, 0.7, 0.8), '#FFFFFF');
    s += line(`M${cx - 3} ${ey + 3.5}Q${cx} ${ey + 6} ${cx + 3} ${ey + 3.5}`, '#3A2A3E', 1.5);
    s += flat(ellD(cx - 12, ey + 4, 3.4, 1.8), '#FF9FB5') + flat(ellD(cx + 12, ey + 4, 3.4, 1.8), '#FF9FB5');
  }
  s += shine(`M${n1(cx - rT + 5)} ${top + 4}L${n1(cx - rT + 8.5)} ${top + 4}L${n1(cx - rB + 6.5)} ${fy - 3}L${n1(cx - rB + 4)} ${fy - 3}Z`, { opacity: 0.75 });
  // labio y tierra
  s += face(rr(cx - rT - 3, top - 6, rT * 2 + 6, 9, 3.5), M.top, { w: 2 });
  s += line(`M${cx - rT} ${top - 3.6}H${cx + rT - 4}`, '#FFFFFF', 1.5, { opacity: 0.6 });
  s += flat(ellD(cx, top - 5, rT - 1, Math.min(4.5, rT * 0.2)), '#5A3E30');
  s += flat(ellD(cx - rT * 0.4, top - 5.4, 1.6, 1), '#8A6A58') + flat(ellD(cx + rT * 0.3, top - 4.6, 1.4, 0.9), '#8A6A58');
  return s;
}

// Hoja de monstera: corazón alargado con tajos que salen del borde hacia
// la vena del medio, desde (x, y) hacia `ang` grados.
function monstera(x, y, len, ang, col) {
  const a = (ang * Math.PI) / 180;
  const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const W = len * 0.56;
  const P = (u, w) => `${n1(x + ux * len * u + nx * w)} ${n1(y + uy * len * u + ny * w)}`;
  const f = (u) => Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u * 0.9 + 0.1))), 0.6) * (1 - 0.25 * u);
  // dos tajos por lado, angostos y hondos, alternados para que no sea un helecho
  const side = (sg) => {
    const pts = [];
    pts.push([-0.08, sg * 0.42]);
    const slits = sg > 0 ? [0.36, 0.62] : [0.46, 0.74];
    for (let u = 0.06; u < 0.97; u += 0.05) {
      const slit = slits.find((v) => Math.abs(u - v) < 0.025);
      if (slit) {
        pts.push([slit - 0.03, sg * f(slit - 0.03)]);
        pts.push([slit - 0.1, sg * f(slit) * 0.28]);
        pts.push([slit + 0.02, sg * f(slit + 0.02)]);
      } else if (!slits.some((v) => Math.abs(u - v) < 0.05)) pts.push([u, sg * f(u)]);
    }
    return pts;
  };
  const R = side(1), L = side(-1).reverse();
  const d = `M${P(0, 0)}` + R.map(([u, w]) => `L${P(u, w * W)}`).join('') + `L${P(1, 0)}` + L.map(([u, w]) => `L${P(u, w * W)}`).join('') + 'Z';
  let s = part(d, col, { w: 1.8 });
  // la mitad que da la espalda a la luz, un poco más honda
  const dark = nx + ny > 0 ? 1 : -1;
  s += shade(`M${P(0.02, 0)}L${P(0.25, dark * W * 0.3)}L${P(0.6, dark * W * 0.32)}L${P(0.92, dark * W * 0.08)}L${P(0.95, 0)}Z`, tone(col, -1.2), 0.3);
  s += line(`M${P(0.02, 0)}Q${P(0.5, -dark * 1.5)} ${P(0.9, 0)}`, tone(col, 0.9), 1.6, { opacity: 0.7 });
  s += shade(`M${P(0.15, -dark * W * 0.45)}L${P(0.35, -dark * W * 0.6)}L${P(0.4, -dark * W * 0.4)}Z`, '#FFFFFF', 0.3);
  return s;
}

// Hoja de potus (corazón) con el pecíolo en (x, y) y la punta hacia `ang`.
function heartLeaf(x, y, s, ang, col) {
  const a = (ang * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  // en coordenadas propias la punta va hacia +y
  const T = (px, py) => `${n1(x + px * s * ca - py * s * sa)} ${n1(y + px * s * sa + py * s * ca)}`;
  const d = `M${T(0, 0)}C${T(-0.25, -0.2)} ${T(-0.72, 0.05)} ${T(-0.56, 0.45)}C${T(-0.42, 0.76)} ${T(-0.12, 0.9)} ${T(0, 1)}C${T(0.12, 0.9)} ${T(0.42, 0.76)} ${T(0.56, 0.45)}C${T(0.72, 0.05)} ${T(0.25, -0.2)} ${T(0, 0)}Z`;
  return smallPart(d, col, 1.4) + line(`M${T(0, 0.08)}L${T(0, 0.8)}`, tone(col, -0.8), 1.3, { opacity: 0.55, 'data-skip': 'retro' });
}

// Copa de árbol: nube de bordes ondulados (racimo de hojas).
function bumpy(cx, cy, r, col, n = 9, seed = 0) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2 + seed;
    const rr2 = r * (0.92 + 0.08 * Math.sin(i * 2.3 + seed));
    const px = cx + Math.cos(t) * rr2, py = cy + Math.sin(t) * rr2 * 0.9;
    if (!i) { d += `M${n1(px)} ${n1(py)}`; continue; }
    const tm = ((i - 0.5) / n) * Math.PI * 2 + seed;
    d += `Q${n1(cx + Math.cos(tm) * r * 1.2)} ${n1(cy + Math.sin(tm) * r * 1.08)} ${n1(px)} ${n1(py)}`;
  }
  let s = part(`${d}Z`, col, { w: 1.8 });
  s += shade(`M${n1(cx - r * 0.85)} ${n1(cy + r * 0.2)}Q${cx} ${n1(cy + r * 0.55)} ${n1(cx + r * 0.85)} ${n1(cy + r * 0.2)}Q${n1(cx + r * 0.7)} ${n1(cy + r * 0.85)} ${cx} ${n1(cy + r * 0.92)}Q${n1(cx - r * 0.7)} ${n1(cy + r * 0.85)} ${n1(cx - r * 0.85)} ${n1(cy + r * 0.2)}Z`, tone(col, -1.3), 0.3);
  s += shade(ellD(n1(cx - r * 0.35), n1(cy - r * 0.4), n1(r * 0.32), n1(r * 0.2)), '#FFFFFF', 0.3);
  // hojitas del borde de arriba (marcas en V)
  s += line(`M${n1(cx - r * 0.5)} ${n1(cy - r * 0.05)}l2.5 2.5l2.5 -2.5M${n1(cx + r * 0.1)} ${n1(cy - r * 0.35)}l2.5 2.5l2.5 -2.5M${n1(cx + r * 0.3)} ${n1(cy + r * 0.2)}l2.5 2.5l2.5 -2.5`, tone(col, -0.9), 1.4, { opacity: 0.45 });
  return s;
}

export const PLANTS = [
  {
    id: 'planta', name: 'Monstera', cat: 'plantas', price: 110, w: 180, h: 206, place: 'piso', tags: ['aesthetic', 'hippie', 'rustico'],
    draw: (p) => {
      let s = '';
      // pecíolos que salen de la tierra
      const base = [90, 154];
      const L = [[90, 64, 56, -94, G2], [52, 84, 54, -138, G2], [130, 78, 52, -44, G2], [42, 118, 46, -172, G1], [140, 112, 46, -12, G1], [66, 140, 38, 158, G3], [114, 138, 38, 22, G3]];
      const stem = (lx, ly) => line(`M${base[0]} ${base[1]}Q${n1((base[0] + lx) / 2 + (lx < 90 ? 6 : -6))} ${n1((base[1] + ly) / 2 + 10)} ${lx} ${ly}`, STEM, 4.2) + line(`M${base[0]} ${base[1]}Q${n1((base[0] + lx) / 2 + (lx < 90 ? 6 : -6))} ${n1((base[1] + ly) / 2 + 10)} ${lx} ${ly}`, '#86B886', 1.3, { opacity: 0.8, 'data-skip': 'pixel' });
      L.slice(0, 5).forEach(([lx, ly]) => { s += stem(lx, ly); });
      L.slice(0, 5).forEach(([lx, ly, len, ang, c]) => { s += monstera(lx, ly, len, ang, c); });
      s += glazedPot(90, 202, 30, 22, 46, p.cloth, { band: 'puntos' });
      // dos hojas de adelante, que caen por delante del borde
      L.slice(5).forEach(([lx, ly]) => { s += stem(lx, ly); });
      L.slice(5).forEach(([lx, ly, len, ang, c]) => { s += monstera(lx, ly, len, ang, c); });
      return s;
    },
  },
  {
    id: 'cactus', name: 'Cactus', cat: 'plantas', price: 70, w: 90, h: 150, place: 'piso', tags: ['hippie', 'rustico', 'aesthetic'],
    draw: (p) => {
      const C = '#7FB98A', Cd = tone(C, -0.9), Cl = tone(C, 0.9);
      let s = '';
      // brazos y columna, redondeados, con costillas
      s += part('M14 92V70Q14 62 21 62Q28 62 28 70V80H36V96H22Q14 96 14 92Z', C, { w: 1.8 });
      s += part('M70 76V52Q70 44 63 44Q56 44 56 52V66H50V80H64Q70 80 70 76Z', C, { w: 1.8 });
      s += part('M31 112V34Q31 18 45 18Q59 18 59 34V112Z', C, { w: 1.8 });
      s += line('M38 26V110M52 26V110', Cd, 1.6, { opacity: 0.45 }) + line('M45 20V110', Cl, 1.8, { opacity: 0.6 });
      s += line('M21 66V90M63 48V72', Cl, 1.6, { opacity: 0.6 });
      s += shade('M52 24Q59 26 59 36V110H53Z', Cd, 0.3);
      // areolas: pelusa blanca con espinitas
      [[38, 34], [52, 42], [38, 52], [52, 62], [38, 72], [52, 82], [38, 92], [21, 72], [21, 84], [63, 52], [63, 64]].forEach(([x, y]) => {
        s += flat(ellD(x, y, 1.6, 1.4), '#FFF8EA') + line(`M${x - 1} ${y - 1}l-2.4 -2M${x + 1} ${y - 1}l2.4 -2`, '#FFF8EA', 1.1, { opacity: 0.9, 'data-skip': 'pixel' });
      });
      // flor rosada en la punta
      s += part(flowerD(45, 15, 6, 6, 0.08), '#FF8FB0', { w: 1.4 }) + flat(ellD(45, 15, 2.2, 2), '#FFE08A') + shade(ellD(42.6, 12.6, 2, 1.4), '#FFFFFF', 0.5);
      // maceta con carita y un cactus bolita adelante
      s += glazedPot(45, 146, 26, 19, 36, p.cloth, { band: 'carita' });
      s += part('M14 112Q12 100 22 98Q32 98 31 112Z', tone(C, 0.3), { w: 1.6 }) + line('M22 99V111M17 102Q16 106 17 111M27 102Q28 106 27 111', Cd, 1.3, { opacity: 0.45 });
      s += flat(ellD(22, 104, 1.3, 1.2), '#FFF8EA') + flat(ellD(18, 107, 1.2, 1.1), '#FFF8EA') + flat(ellD(26, 107, 1.2, 1.1), '#FFF8EA');
      s += part(flowerD(22, 97.5, 3.2, 5, 0.1), '#FFD0DC', { w: 1.1 });
      return s;
    },
  },
  {
    id: 'flores', name: 'Maceta de tulipanes', cat: 'plantas', price: 80, w: 96, h: 120, place: 'piso', tags: ['dulce', 'princesa', 'hippie'],
    draw: (p) => {
      const W = mat(p.wood);
      let s = floorShadow(48, 116, 36, 5);
      // tulipanes: tallos, hojas largas y cabezas en copa
      // el blanco es cálido (crema en la sombra): un blanco frío salía gris lila en pixel
      const WHITE = 'blanco';
      const tl = [[21, 50, p.accent === '#FFFFFF' ? '#F7D56B' : mix(p.accent, '#F7D56B', 0.2)], [36, 32, '#FF8FB0'], [52, 42, WHITE], [67, 28, '#FFB06B'], [78, 52, '#F28CA8']];
      tl.forEach(([x, y]) => { s += line(`M${48 + (x - 48) * 0.3} 86Q${(x + 48) / 2} ${(y + 86) / 2 + 6} ${x} ${y + 8}`, STEM, 4); });
      s += part('M30 86C18 76 14 62 16 52C24 60 30 72 36 84Z', G2, { w: 1.5 }) + part('M66 86C78 74 82 62 80 52C72 62 66 72 60 84Z', G2, { w: 1.5 });
      s += part('M40 86C32 70 30 58 34 48C40 60 44 72 46 84Z', G1, { w: 1.5 }) + part('M56 86C66 72 68 60 64 50C58 62 54 72 50 84Z', G1, { w: 1.5 });
      // cabezas un poco más grandes (×1.2): en pixel, el contorno se comía las chicas
      const tulip = (x, y, c, k = 1.2) => {
        const X = (v) => n1(x + v * k), Y = (v) => n1(y + v * k);
        const white = c === WHITE;
        const back = white ? '#F5D6AA' : c, front = white ? '#FFFCF4' : tone(c, 0.35), dark = white ? '#D49A64' : tone(c, -1.4);
        let t = smallPart(`M${X(-8)} ${Y(-6)}L${X(-6)} ${Y(-14)}L${X(-2)} ${Y(-8)}L${x} ${Y(-15)}L${X(2)} ${Y(-8)}L${X(6)} ${Y(-14)}L${X(8)} ${Y(-6)}Q${X(8)} ${Y(8)} ${x} ${Y(8)}Q${X(-8)} ${Y(8)} ${X(-8)} ${Y(-6)}Z`, back, 1.6);
        t += smallPart(`M${X(-4.5)} ${Y(-9)}Q${x} ${Y(-15)} ${X(4.5)} ${Y(-9)}Q${X(5)} ${Y(5)} ${x} ${Y(7)}Q${X(-5)} ${Y(5)} ${X(-4.5)} ${Y(-9)}Z`, front, 1.3);
        t += shade(`M${X(2)} ${Y(6)}Q${X(7)} ${Y(4)} ${X(7.5)} ${Y(-4)}Q${X(6)} ${Y(2)} ${X(2)} ${Y(6)}Z`, dark, white ? 0.5 : 0.35) + shade(ellD(X(-2), Y(-4), 1.4 * k, 3 * k), '#FFFFFF', 0.6);
        return t;
      };
      tl.forEach(([x, y, c]) => { s += tulip(x, y, c); });
      // jardinera de madera: tierra arriba, tablas con vetas y patitas
      s += face(rr(16, 78, 64, 12, 3), W.top) + flat(rr(19, 80, 58, 7, 2), '#5A3E30') + flat(ellD(30, 83, 2, 1.1), '#8A6A58') + flat(ellD(62, 82.6, 1.6, 1), '#8A6A58');
      s += face(rr(14, 86, 68, 26, 3), W.front);
      s += line('M16 95H80M16 104H80', tone(p.wood, -1), 1.6, { opacity: 0.55 }) + grain(17, 87, 62, 24, p.wood, { seed: 161, gap: 5 });
      s += line('M17 88.6H79', W.hi, 1.5, { opacity: 0.85 });
      s += face('M18 111H28V115Q23 118 18 115Z', W.side, { w: 1.5 }) + face('M68 111H78V115Q73 118 68 115Z', W.side, { w: 1.5 });
      // el par de hojas de adelante, sobre el borde
      s += part('M34 92C26 86 22 80 22 74C28 78 34 84 38 90Z', G3, { w: 1.4 }) + part('M62 92C70 86 74 80 74 74C68 78 62 84 58 90Z', G3, { w: 1.4 });
      return s;
    },
  },
  {
    id: 'arbolito', name: 'Arbolito', cat: 'plantas', price: 150, w: 124, h: 230, place: 'piso', tags: ['rustico', 'hippie', 'elegante'],
    draw: (p) => {
      let s = '';
      // tronco con corteza, que se abre en dos ramas
      const bark = '#9A6B48';
      s += face('M56 172C55 150 58 128 56 106C52 98 44 92 38 86L42 82C48 88 54 92 60 98C62 90 68 82 78 76L82 80C74 88 68 96 66 106C66 130 68 152 68 172Z', bark);
      s += line('M60 168C59 150 61 130 59 112M64 160C64 146 65 130 63 118', tone(bark, -1), 1.5, { opacity: 0.5 }) + line('M58 164C57 148 59 132 58 114', tone(bark, 0.9), 1.4, { opacity: 0.6 });
      // copa: racimos de atrás (hondos) a adelante (claros)
      s += bumpy(38, 74, 28, G2, 9, 0.3) + bumpy(88, 68, 27, G2, 9, 1.1);
      s += bumpy(62, 44, 32, G1, 10, 0.7);
      s += bumpy(34, 104, 22, G1, 8, 2) + bumpy(92, 100, 22, G1, 8, 0.4);
      s += bumpy(60, 86, 20, G3, 8, 1.6);
      // limoncitos con su hojita y brillo
      [[42, 92], [82, 82], [64, 58], [30, 62], [100, 108]].forEach(([x, y], i) => {
        s += part(`M${x - 5.5} ${y}Q${x - 5.5} ${y - 5} ${x} ${y - 5.2}Q${x + 6} ${y - 5} ${x + 6.5} ${y - 0.5}Q${x + 7.5} ${y + 1.4} ${x + 6} ${y + 1.6}Q${x + 5} ${y + 5} ${x} ${y + 5}Q${x - 5.5} ${y + 5} ${x - 5.5} ${y}Z`, '#FFD84D', { w: 1.4 });
        s += shade(`M${x - 4} ${y + 2}Q${x} ${y + 5} ${x + 5} ${y + 2}Q${x + 2} ${y + 4.6} ${x - 4} ${y + 2}Z`, '#E09A1F', 0.45) + shine(ellD(x - 2.4, y - 2.2, 1.3, 1));
        if (i % 2 === 0) s += part(`M${x} ${y - 5}Q${x + 4} ${y - 10} ${x + 8} ${y - 8}Q${x + 5} ${y - 4} ${x} ${y - 5}Z`, G3, { w: 1.1 });
      });
      s += glazedPot(62, 226, 34, 26, 52, p.cloth, { band: 'ola' });
      return s;
    },
  },
  {
    id: 'plantaColgante', name: 'Planta colgante', cat: 'plantas', price: 90, w: 100, h: 160, place: 'pared', tags: ['hippie', 'aesthetic', 'rustico'],
    draw: (p) => {
      const cord = '#E6D3B0', cordD = '#B9A07A';
      const potC = p.cloth;
      let s = '';
      // gancho en la pared y el atado de arriba
      s += face(rr(44, 2, 12, 6, 2), '#C9C2CF', { w: 1.4 }) + part(ellD(50, 10, 3.6, 3.6), '#C9C2CF', { w: 1.4 }) + flat(ellD(50, 10, 1.4, 1.4), '#7E7686');
      // guías de atrás (detrás de la maceta)
      const vine = (pts, i0) => {
        let v = line(`M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`, STEM, 2.6);
        pts.slice(1).forEach(([x, y], i) => { v += heartLeaf(x, y, 12.5 - i * 1.1, (i + i0) % 2 ? 40 : -40, [G2, G1, G3][(i + i0) % 3]); });
        return v;
      };
      s += vine([[36, 80], [33, 100], [36, 120]], 1) + vine([[66, 80], [69, 102], [65, 122]], 0);
      // cuerdas de macramé: se abren en rombos con nuditos
      const cords = 'M48 18L30 44L36 62M52 18L70 44L64 62M49 18L42 36L52 48L58 36L51 18M42 36L30 44M58 36L70 44';
      const twine = (d) => line(d, cordD, 4.4, { 'data-skip': 'pixel' }) + line(d, cord, 2, { 'data-skip': 'pixel' }) + line(d, '#C9AC7E', 4, { 'data-only': 'pixel' });
      s += twine(cords);
      [[42, 36], [58, 36], [30, 44], [70, 44], [52, 48]].forEach(([x, y]) => { s += flat(ellD(x, y, 3.2, 3), '#A88A5E') + flat(ellD(x - 0.8, y - 0.8, 1.4, 1.2), cord); });
      s += face(rr(45.5, 13, 9, 7, 2.5), cord, { w: 1.3 }) + line('M46.5 15.5H53.5M46.5 17.8H53.5', cordD, 1.2, { opacity: 0.8 });
      // maceta bola esmaltada
      s += face('M24 62H76Q76 86 50 88Q24 86 24 62Z', potC);
      s += shade('M58 64H74Q74 82 54 86Q66 78 58 64Z', tone(potC, -1.4), 0.3) + shine('M30 66H34Q34 76 40 82Q31 78 30 66Z', { opacity: 0.7 });
      s += line('M26 72Q50 77 74 72', mix(potC, '#FFFFFF', 0.6), 2.2);
      s += face(rr(22, 58, 56, 7, 3), mat(potC).top, { w: 1.6 });
      // cuerdas que abrazan la maceta y la borla de abajo
      s += twine('M36 62Q38 80 50 90M64 62Q62 80 50 90');
      s += face(rr(46.5, 88, 7, 7, 2.5), cord, { w: 1.3 });
      s += twine('M47.5 95Q46 104 45 110M50 95V112M52.5 95Q54 104 55 110');
      // mata de hojas arriba y guías de adelante
      [[30, 58, -150, G2], [38, 54, -120, G1], [46, 52, -95, G2], [56, 52, -70, G1], [64, 54, -50, G3], [70, 58, -25, G1], [42, 60, 170, G3], [60, 60, 10, G3]].forEach(([x, y, a, c]) => { s += heartLeaf(x, y, 11, a + 90, c); });
      s += vine([[28, 64], [24, 84], [27, 104], [23, 124], [25, 142]], 0) + vine([[50, 88], [52, 108], [48, 128], [50, 146]], 2) + vine([[72, 64], [77, 86], [74, 106], [77, 126]], 1);
      return s;
    },
  },
];
