// ─────────────────────────────────────────────────────────────────
// Los pedidos: lo que se compra en la tienda no aparece de la nada. Queda
// "en camino"; al volver al cuarto suena el timbre, llega una caja a la
// puerta y al abrirla es tuyo (ver DISENO_MUNDO_VIVO.md §5).
//
//   game.deliveries = [{ id, kind, refId, label, paint?, value?, wear?, arrived }]
//     kind: 'mueble' | 'decor' | 'poster' | 'ropa' | 'pared' | 'piso'
// ─────────────────────────────────────────────────────────────────

let seq = 0;
export function addDelivery(game, item) {
  seq += 1;
  const id = `d-${Date.now().toString(36)}-${seq}`;
  return { ...game, deliveries: [...(game.deliveries || []), { id, arrived: false, ...item }] };
}

export const pendingDelivery = (game, kind, refId) => (game.deliveries || []).some((d) => d.kind === kind && String(d.refId) === String(refId));
export const hasPendingTrip = (game) => (game.deliveries || []).some((d) => !d.arrived);
export const parcelAtDoor = (game) => (game.deliveries || []).some((d) => d.arrived);
export const arriveAll = (game) => ({ ...game, deliveries: (game.deliveries || []).map((d) => ({ ...d, arrived: true })) });

const addUnique = (list, v) => ((list || []).map(String).includes(String(v)) ? list || [] : [...(list || []), v]);

// Abrir uno: pasa a ser tuyo (y sale de la caja).
export function unpack(game, d) {
  let g = { ...game, deliveries: (game.deliveries || []).filter((x) => x.id !== d.id) };
  switch (d.kind) {
    case 'mueble':
      g = { ...g, ownedFurniture: addUnique(g.ownedFurniture, d.refId), furniturePaint: { ...(g.furniturePaint || {}), [d.refId]: d.paint || 'natural' } };
      break;
    case 'decor':
      g = { ...g, ownedDecor: addUnique(g.ownedDecor, d.refId), ...(d.paint ? { decorPaint: { ...(g.decorPaint || {}), [d.refId]: d.paint } } : {}) };
      break;
    case 'poster':
      g = { ...g, ownedPosters: addUnique(g.ownedPosters, d.refId), posterPaint: { ...(g.posterPaint || {}), [d.refId]: d.paint || 'natural' } };
      break;
    case 'ropa':
      g = { ...g, ownedWear: addUnique(g.ownedWear, d.refId) };
      break;
    case 'pared':
      g = { ...g, ownedWalls: addUnique(g.ownedWalls, d.refId) };
      break;
    case 'piso':
      g = { ...g, ownedFloors: addUnique(g.ownedFloors, d.refId) };
      break;
    case 'monedas':
      g = { ...g, coins: (g.coins || 0) + (d.value || 0) };
      break;
    case 'comida':
      g = { ...g, fridge: { ...(g.fridge || {}), [d.refId]: ((g.fridge || {})[d.refId] || 0) + (d.n || 1) } };
      break;
    default: break;
  }
  return g;
}

export const unpackAll = (game) => (game.deliveries || []).filter((d) => d.arrived).reduce((g, d) => unpack(g, d), game);
