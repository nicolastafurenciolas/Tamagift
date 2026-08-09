// ─────────────────────────────────────────────────────────────────
// Lógica de "Torre de bloques", aparte del componente a propósito.
//
// Misma razón que flyPhysics.js: el bloque se mueve con
// requestAnimationFrame, que no corre en un entorno sin pantalla, así
// que dentro del componente no habría forma de comprobar la mecánica
// salvo jugando a ojo. Como función pura sí se puede probar (ver
// towerLogic.test.mjs).
// ─────────────────────────────────────────────────────────────────

export const TOWER = {
  START_W: 120,      // ancho del primer bloque
  MIN_W: 6,          // por debajo de esto la torre se cae
  // Margen para considerar el bloque "clavado". Es la mecánica que hace
  // que la torre pueda durar: sin ella el ancho solo bajaba y la partida
  // se acababa sola a los 10-15 pisos hiciera lo que hiciera quien juega.
  PERFECT_TOL: 5,
  REGROW: 9,         // cuánto ancho devuelve un bloque clavado
};

// Resuelve soltar `cur` sobre `top` en un tablero de ancho `W`.
//   { lost: true }                          → se acabó
//   { lost: false, perfect, block: {x,w} }  → bloque nuevo
export function resolveDrop(top, cur, W) {
  const left = Math.max(top.x, cur.x);
  const right = Math.min(top.x + top.w, cur.x + cur.w);
  const w = right - left;
  if (w <= TOWER.MIN_W) return { lost: true };

  const perfect = Math.abs(cur.x - top.x) <= TOWER.PERFECT_TOL;
  if (perfect) {
    // Clavado: en vez de perder ancho se recupera un poco, recentrado
    // sobre el bloque de abajo y sin salirse del tablero.
    const grown = Math.min(TOWER.START_W, top.w + TOWER.REGROW);
    const x = Math.max(0, Math.min(W - grown, top.x - (grown - top.w) / 2));
    return { lost: false, perfect: true, block: { x, w: grown } };
  }
  return { lost: false, perfect: false, block: { x: left, w } };
}
