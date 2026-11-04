// La mochi: un solo cuerpo blandito, en cuatro anchos. Todo lo demás
// (orejas, cara, gorros, collares) se ancla a la geometría que sale de
// acá, así cae en su lugar en cualquier ancho.

export const SHAPES = [
  { id: 'alto', label: 'Altito', l: 46, r: 154, top: 60, ys: 146 },
  { id: 'redondo', label: 'Redondito', l: 37, r: 163, top: 66, ys: 149 },
  { id: 'mochi', label: 'Mochi', l: 28, r: 172, top: 72, ys: 152 },
  { id: 'ancho', label: 'Anchito', l: 17, r: 183, top: 82, ys: 155 },
];

// Recetas viejas (cuerpos variados) → el ancho de mochi más parecido.
const LEGACY = { ovalado: 'alto', gotita: 'alto', pera: 'alto', redondo: 'redondo', bombon: 'redondo', nube: 'mochi', gordito: 'ancho', cuadrado: 'ancho' };

export const BOTTOM = 182;

export function shapeOf(id) {
  return SHAPES.find((s) => s.id === id) || SHAPES.find((s) => s.id === LEGACY[id]) || SHAPES[2];
}

// `chub` (0 a 1): cuánto más redondita está por comer chatarra y dulces
// (ver DISENO_MUNDO_VIVO.md §3). Más ancha y un poco más bajita; con 0 es
// la mochi de siempre.
export function geometry(shapeId, chub = 0) {
  const s = shapeOf(shapeId);
  const ch = Math.max(0, Math.min(1, chub || 0));
  const l = s.l - 10 * ch, r = s.r + 10 * ch, top = s.top + 6 * ch, ys = s.ys + 2 * ch;
  const cx = 100;
  const w = r - l, hw = w / 2;
  const k = 0.555;
  const path = `M${l} ${ys} C${l} ${top + (ys - top) * 0.36} ${cx - hw * k} ${top} ${cx} ${top} C${cx + hw * k} ${top} ${r} ${top + (ys - top) * 0.36} ${r} ${ys} C${r} ${BOTTOM - 9} ${cx + hw * 0.7} ${BOTTOM} ${cx} ${BOTTOM} C${cx - hw * 0.7} ${BOTTOM} ${l} ${BOTTOM - 9} ${l} ${ys}Z`;
  const wf = w / 144;                   // 1 = mochi clásica
  const height = BOTTOM - top;
  // Altura del borde de arriba en x (aprox. elipse).
  const topAt = (x) => {
    const t = Math.min(0.999, Math.abs(x - cx) / hw);
    return ys - (ys - top) * Math.sqrt(1 - t * t);
  };
  // Ángulo de la normal (grados, 0 = hacia arriba) en x.
  const tiltAt = (x) => {
    const e = 1.5;
    const dy = topAt(x + e) - topAt(x - e);
    return Math.atan2(dy, 2 * e) * 180 / Math.PI;
  };
  // Ancho del cuerpo a la altura y (para gorros, collares, audífonos).
  const chordAt = (y) => {
    if (y >= ys) return w;
    const t = Math.min(1, Math.max(0, (ys - y) / (ys - top)));
    return w * Math.sqrt(1 - t * t);
  };
  const fy = top + height * 0.53;
  const eyeDx = 19 * Math.pow(wf, 0.55);
  return {
    id: s.id, path, l, r, top, ys, cx, w, hw, wf, height, topAt, tiltAt, chordAt,
    face: { y: fy, dx: eyeDx, mouthY: fy + 12, cheekY: fy + 9, cheekDx: eyeDx + 11 },
    belly: { cx, cy: BOTTOM - 20, rx: w * 0.27, ry: Math.min(19, height * 0.17) },
    feet: [cx - 22 * wf, cx + 22 * wf],
    shine: { x: l + w * 0.26, y: top + height * 0.2 },
    // collar: banda que envuelve el cuerpo debajo de la boca
    neckY: fy + 25,
    // gorros: centro de la coronilla y ancho de cabeza a esa altura
    crown: { x: cx, y: top, w: w * 0.62 },
    tail: { x: r - 4, y: BOTTOM - 22 },
  };
}
