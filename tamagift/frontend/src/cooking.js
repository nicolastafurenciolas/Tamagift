// ─────────────────────────────────────────────────────────────────
// Cocina: recetas y puntaje (lógica pura, ver cooking.test.mjs).
//
// Cada receta son 3 a 5 pasos con gestos distintos. Cada paso da una
// calidad de 0 a 1; el promedio es el puntaje (0-100) y de ahí salen las
// estrellas. Lo que se cocina es una comida del catálogo (foodCatalog.js)
// y va a la nevera: 2 porciones con tres estrellas, 1 si no.
//
// Pasos:
//   picar     item, cuts       deslizar hacia abajo sobre el ingrediente
//   agregar   items, into      arrastrar los ingredientes correctos
//   revolver  turns, into      dar vueltas con el dedo dentro del tazón
//   punto     tool, kind, flips  voltear (o sacar del horno) en su punto
//   fuego     secs             mantener la llama en la zona verde
//   amasar    taps             tocar rápido la masa
//   decorar   item, n, base    poner los toppings sobre el plato
// ─────────────────────────────────────────────────────────────────

export const STEP_TEXT = {
  picar: (s) => `Pica ${s.itemName || 'el ingrediente'}: desliza hacia abajo`,
  agregar: () => 'Arrastra los ingredientes correctos',
  revolver: () => 'Revuelve dando vueltas con el dedo',
  punto: (s) => (s.tool === 'oven' ? 'Sácalo del horno cuando esté dorado' : s.flips > 1 ? 'Voltéalo cuando esté dorado' : 'Retíralo cuando esté en su punto'),
  fuego: () => 'Mantén el fuego en la zona verde',
  amasar: () => 'Toca rápido para amasar',
  decorar: (s) => `Decora: toca el plato para poner ${s.itemName || 'los toppings'}`,
};

// Colores de lo que hay dentro del tazón u olla.
const MASA = '#F6E3B4', MAIZ = '#F4E3A8', CALDO = '#F2B05E', VERDE = '#9ED68A';

export const RECIPES = [
  { id: 'ensalada', food: 'ensalada', name: 'Ensalada fresca', steps: [
    { type: 'picar', item: 'lechuga', cuts: 3 },
    { type: 'picar', item: 'tomate', cuts: 4 },
    { type: 'agregar', items: ['lechuga', 'tomate', 'pepino'], into: 'bowl', fill: VERDE },
    { type: 'revolver', turns: 2, into: 'bowl', fill: VERDE },
  ] },
  { id: 'huevo', food: 'huevo', name: 'Huevo frito', steps: [
    { type: 'agregar', items: ['huevo'], into: 'pan' },
    { type: 'punto', tool: 'pan', kind: 'huevo', flips: 1 },
    { type: 'decorar', item: 'sal', n: 3, base: 'huevo' },
  ] },
  { id: 'panqueques', food: 'panqueques', name: 'Panqueques', steps: [
    { type: 'agregar', items: ['harina', 'leche', 'huevo'], into: 'bowl', fill: MASA },
    { type: 'revolver', turns: 3, into: 'bowl', fill: MASA },
    { type: 'punto', tool: 'pan', kind: 'panqueque', flips: 2 },
    { type: 'decorar', item: 'fresa', n: 4, base: 'panqueque' },
  ] },
  { id: 'arepa', food: 'arepa', name: 'Arepa con queso', steps: [
    { type: 'agregar', items: ['harinaMaiz', 'agua', 'sal'], into: 'bowl', fill: MAIZ },
    { type: 'amasar', taps: 12, color: MAIZ },
    { type: 'punto', tool: 'pan', kind: 'arepa', flips: 2 },
    { type: 'decorar', item: 'queso', n: 3, base: 'arepa' },
  ] },
  { id: 'sopa', food: 'sopa', name: 'Sopa calientita', steps: [
    { type: 'picar', item: 'zanahoria', cuts: 4 },
    { type: 'picar', item: 'papa', cuts: 3 },
    { type: 'agregar', items: ['zanahoria', 'papa', 'cebolla'], into: 'pot', fill: CALDO },
    { type: 'fuego', secs: 4, fill: CALDO },
    { type: 'revolver', turns: 2, into: 'pot', fill: CALDO },
  ] },
  { id: 'arroz', food: 'arroz', name: 'Bolita de arroz', steps: [
    { type: 'agregar', items: ['arroz'], into: 'bowl', fill: '#FFFFFF' },
    { type: 'amasar', taps: 9, color: '#FFFFFF' },
    { type: 'decorar', item: 'alga', n: 1, base: 'onigiri' },
  ] },
  { id: 'galleta', food: 'galleta', name: 'Galletas', steps: [
    { type: 'agregar', items: ['harina', 'azucar', 'mantequilla', 'chocolate'], into: 'bowl', fill: '#E8C49A' },
    { type: 'revolver', turns: 3, into: 'bowl', fill: '#E8C49A' },
    { type: 'punto', tool: 'oven', kind: 'galleta', flips: 1 },
  ] },
  { id: 'pasta', food: 'pasta', name: 'Pasta con tomate', steps: [
    { type: 'agregar', items: ['fideos', 'agua'], into: 'pot', fill: '#FFE7A8' },
    { type: 'fuego', secs: 4, fill: '#FFE7A8' },
    { type: 'picar', item: 'tomate', cuts: 4 },
    { type: 'revolver', turns: 2, into: 'pot', fill: '#E8705E' },
    { type: 'decorar', item: 'queso', n: 3, base: 'pasta' },
  ] },
  { id: 'tacos', food: 'tacos', name: 'Tacos', steps: [
    { type: 'picar', item: 'tomate', cuts: 3 },
    { type: 'picar', item: 'cebolla', cuts: 3 },
    { type: 'punto', tool: 'pan', kind: 'carne', flips: 2 },
    { type: 'decorar', item: 'tomate', n: 4, base: 'tortilla' },
  ] },
  { id: 'sushi', food: 'sushi', name: 'Sushi', steps: [
    { type: 'agregar', items: ['arroz', 'alga', 'salmon'], into: 'board' },
    { type: 'amasar', taps: 10, color: '#2F5A3E' },
    { type: 'picar', item: 'rollo', cuts: 5 },
  ] },
  { id: 'ramen', food: 'ramen', name: 'Ramen', steps: [
    { type: 'fuego', secs: 4, fill: '#E9B46A' },
    { type: 'agregar', items: ['fideos', 'huevo', 'cebollin'], into: 'pot', fill: '#E9B46A' },
    { type: 'revolver', turns: 2, into: 'pot', fill: '#E9B46A' },
    { type: 'decorar', item: 'cebollin', n: 4, base: 'ramen' },
  ] },
  { id: 'pastel', food: 'pastel', name: 'Torta de fresa', steps: [
    { type: 'agregar', items: ['harina', 'huevo', 'azucar', 'leche'], into: 'bowl', fill: '#FBE3C2' },
    { type: 'revolver', turns: 3, into: 'bowl', fill: '#FBE3C2' },
    { type: 'punto', tool: 'oven', kind: 'pastel', flips: 1 },
    { type: 'decorar', item: 'fresa', n: 5, base: 'torta' },
  ] },
];

export const ALL_INGREDIENTS = ['lechuga', 'tomate', 'pepino', 'huevo', 'harina', 'harinaMaiz', 'leche', 'agua', 'queso', 'zanahoria', 'papa', 'cebolla', 'arroz', 'alga', 'salmon', 'azucar', 'mantequilla', 'chocolate', 'fideos', 'carne', 'tortilla', 'cebollin', 'fresa', 'sal'];

// Dos ingredientes que NO van, para que agregar sea elegir y no arrastrar
// todo lo que aparece.
export function decoysFor(step, rnd = Math.random) {
  const pool = ALL_INGREDIENTS.filter((id) => !step.items.includes(id));
  const out = [];
  while (out.length < 2 && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
}

// ── Calidad de cada paso (0..1) ──────────────────────────────────
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Por rapidez: perfecto hasta `ideal` segundos, baja hasta `floor` al triple.
function bySpeed(secs, ideal, floor = 0.5) {
  if (secs <= ideal) return 1;
  return clamp01(1 - ((secs - ideal) / (ideal * 2)) * (1 - floor));
}

// Punto de cocción: 0 crudo, 0.5 perfecto, 1 quemado.
export function donenessQuality(d) {
  const off = Math.abs(d - 0.5);
  if (off <= 0.08) return 1;
  if (off <= 0.2) return 0.7;
  return 0.35;
}

export function stepQuality(step, r) {
  switch (step.type) {
    case 'picar': return bySpeed(r.secs, step.cuts * 1.3);
    case 'agregar': return clamp01(1 - 0.25 * (r.mistakes || 0));
    case 'revolver': return bySpeed(r.secs, step.turns * 1.8);
    case 'punto': return (r.flips || []).reduce((a, d) => a + donenessQuality(d), 0) / Math.max(1, (r.flips || []).length);
    case 'fuego': return clamp01(0.4 + 0.6 * (r.inBand || 0) / Math.max(0.1, r.total || 1));
    case 'amasar': return bySpeed(r.secs, step.taps * 0.28);
    case 'decorar': return 1;
    default: return 1;
  }
}

export function recipeScore(qualities) {
  if (!qualities.length) return 0;
  return Math.round((qualities.reduce((a, q) => a + q, 0) / qualities.length) * 100);
}

export function starsForCooking(score) {
  if (score >= 85) return 3;
  if (score >= 65) return 2;
  return 1;
}

export const portionsFor = (stars) => (stars >= 3 ? 2 : 1);
