// La puerta de entrada (fija, a la izquierda del cuarto), su tapete y la
// caja de los pedidos. Por la puerta llegan los paquetes y las visitas.
// Misma vista 3/4 que el resto del cuarto.

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, floorShadow, Cir, Ell, INK, piece } from './draw.js';

export const DOOR = { w: 116, h: 214 };

export function doorSvg(wood = '#B98556') {
  const m = mat(wood);
  let s = '';
  // marco
  s += face(rr(4, 4, 108, 210, 4), m.side);
  s += face(rr(14, 14, 88, 200, 2), m.front);
  // tableros y ventanita redonda
  s += face(rr(24, 104, 30, 46, 3), m.top, { w: 1.6 }) + face(rr(62, 104, 30, 46, 3), m.top, { w: 1.6 });
  s += face(rr(24, 158, 68, 42, 3), m.top, { w: 1.6 });
  s += face(ellD(58, 56, 24, 24), '#BFE0F5') + line('M58 32 V80 M34 56 H82', m.side, 2.4) + shine('M44 44 C46 38 50 36 54 35 C50 40 48 44 46 50Z', { opacity: 0.7 });
  // manija y timbre
  s += Cir(90, 128, 4.6, { fill: '#FFD166', stroke: INK, 'stroke-width': 1.6, 'data-r': 'part' }) + face(rr(86, 130, 8, 12, 2), '#FFD166', { w: 1.4 });
  s += line('M18 12 H98', m.hi, 1.6, { opacity: 0.7 });
  return piece(DOOR.w, DOOR.h, s);
}

export function doormatSvg(color = '#C97A5A') {
  let s = floorShadow(70, 40, 66, 6);
  s += face('M12 38 L26 10 H114 L128 38Z', color);
  s += face('M22 34 L32 14 H108 L118 34Z', tone(color, -0.5), { w: 1.4 });
  s += flat('M54 28 C48 22 50 16 56 17 C60 18 62 22 62 24 C62 22 64 18 68 17 C74 16 76 22 70 28 L62 34Z', '#FFE3D3');
  return piece(140, 44, s);
}

// Caja del pedido: cartón con cinta y un moño. `open` la dibuja abierta
// (las solapas hacia afuera y brillitos saliendo).
export function parcelSvg(open = false) {
  const C = '#D9A86C';
  let s = floorShadow(50, 92, 44, 7);
  if (open) {
    s += box(12, 90, 76, 40, 30, C, { r: 2 });
    s += face('M12 35 L-2 20 L20 22 L26 35Z', tone(C, 0.4)) + face('M88 35 L102 20 L80 22 L74 35Z', tone(C, 0.4));
    s += face('M14 35 L86 35 L80 24 L20 24Z', mix(C, '#5A3A20', 0.45));
    [[30, 10], [50, 2], [70, 12], [42, 18]].forEach(([x, y]) => { s += P4(x, y, 5, '#FFE07A'); });
    return piece(104, 96, s);
  }
  s += box(10, 90, 80, 44, 32, C, { r: 2 });
  s += face(rr(44, 30, 12, 60, 0), '#FF8FAB', { w: 1.6 }) + face('M44 30 L56 30 L60 16 L40 16Z', '#FF7FA0', { w: 1.6 });
  s += line('M14 30 H86', mix(C, '#FFFFFF', 0.4), 1.4, { opacity: 0.8 });
  s += part('M50 16 C42 4 28 4 30 12 C32 18 44 18 50 16Z M50 16 C58 4 72 4 70 12 C68 18 56 18 50 16Z', '#FF6F91', { w: 1.6 }) + Cir(50, 16, 4, { fill: '#FF9EB5', stroke: INK, 'stroke-width': 1.4, 'data-r': 'part' });
  s += flat(rr(18, 56, 20, 12, 1), '#FFFFFF', { opacity: 0.85 }) + line('M21 60 h14 M21 64 h10', '#B8A890', 1);
  return piece(100, 96, s);
}

function P4(x, y, r, c) {
  return `<path d="M${x} ${y - r} Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y} Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r} Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y} Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r}Z" fill="${c}" data-r="flat"/>`;
}
