import React from 'react';
import { FOODS, foodKindOf } from './foodCatalog';
import { foodSvg, foodInner } from './art/food';
import { uiInner, UI_NAMES } from './art/ui';

// ─────────────────────────────────────────────────────────────────
// Sprites propios que reemplazan a los emojis.
//
// Un emoji se dibuja con la letra del sistema operativo: en pixel art,
// en neón o en papel recortado aparecía un 🍕 de iPhone en medio de un
// mundo dibujado de otra forma. Estos son dibujos de la app, con la
// misma regla que el resto del arte (contorno de tinta cálida, cara
// iluminada y sombra) y pasan por el motor de estilos como cualquier
// otro sprite.
//
// Todos son de 64×64 y se escalan con <Sprite w h>. El dibujo vive en
// art/food.js y art/ui.js; en pixel art cada uno tiene su versión hecha
// a mano píxel a píxel (art/pixel/).
// ─────────────────────────────────────────────────────────────────

// ── Comidas ──────────────────────────────────────────────────────
// Una por cada comida de foodCatalog.js. El dibujo está en art/food.js
// (vector por piezas para los estilos; en pixel, hecho a mano).
const foodEl = (id) => React.createElement('svg', {
  viewBox: '0 0 64 64', width: 64, height: 64, 'data-px-sprite': `food.${id}`,
  dangerouslySetInnerHTML: { __html: foodInner(id) },
});

export const FOOD_SPRITES = FOODS.map((f) => ({
  id: f.id, name: f.name, kind: f.kind,
  render: () => foodEl(f.id),
  svg: () => foodSvg(f.id),
}));

// Palabras que también llevan a cada dibujo (además del id y el nombre).
const FOOD_WORDS = {
  fresa: ['frutilla', 'mora', 'frambuesa', 'cereza'], manzana: ['pera'], banano: ['banana', 'plátano', 'platano'],
  sandia: ['melón', 'melon'], uvas: ['uva'], naranja: ['mandarina', 'limón', 'limon', 'mango'], zanahoria: [],
  brocoli: ['brócoli', 'verdura', 'coliflor', 'espinaca'], aguacate: ['palta'], ensalada: ['lechuga', 'tomate', 'pepino'],
  arepa: [], empanada: ['pastel de yuca', 'pastelito'], sopa: ['ajiaco', 'sancocho', 'caldo', 'crema'],
  arroz: ['onigiri', 'arroz'], huevo: ['huevos'], panqueques: ['pancake', 'waffle', 'crepe', 'hotcake'],
  pasta: ['espagueti', 'spaghetti', 'lasaña', 'lasagna', 'macarrones'], sushi: ['maki', 'nigiri'], ramen: ['fideos', 'noodles', 'pho'],
  tacos: ['taco', 'burrito', 'nachos', 'quesadilla'], pizza: [], hamburguesa: ['burger', 'hamburgues'], papas: ['papas fritas', 'papitas', 'salchipapa', 'nuggets'],
  perro: ['perro caliente', 'hot dog', 'hotdog', 'salchicha'], helado: ['paleta', 'gelato', 'sorbete'], dona: ['donut', 'rosquilla'],
  pastel: ['torta', 'cheesecake', 'tiramisú', 'brownie', 'postre'], galleta: ['cookie', 'galletas'], chocolate: ['chocolatina', 'bombón', 'bombon'],
  cupcake: ['ponqué', 'ponque', 'muffin', 'magdalena'], macarons: ['macaron'], gomitas: ['gomita', 'caramelo', 'dulces', 'chicle'],
  algodon: ['algodón'], boba: ['té de burbujas', 'tapioca', 'malteada', 'milkshake', 'frappé', 'frappe', 'café', 'cafe'],
  leche: ['yogur', 'yogurt'], jugo: ['limonada', 'smoothie', 'batido', 'agua'],
};
// Si no hay ningún parecido, una comida que se vea del mismo tipo.
const KIND_DEFAULT = { saludable: 'manzana', casera: 'arepa', chatarra: 'hamburguesa', dulce: 'pastel', bebida: 'jugo' };

export function foodSpriteFor(name, index = 0) {
  const n = (name || '').toLowerCase().trim();
  const byId = (id) => FOOD_SPRITES.find((f) => f.id === id);
  if (byId(n)) return byId(n);
  // primero el nombre de la comida ("helado de mora" es helado), después
  // las palabras parecidas ("torta" es pastel)
  const hit = FOOD_SPRITES.find((f) => n.includes(f.id) || n.includes(f.name.toLowerCase()))
    || FOOD_SPRITES.find((f) => (FOOD_WORDS[f.id] || []).some((w) => n.includes(w)))
    || FOOD_SPRITES.find((f) => n.includes(f.name.toLowerCase().slice(0, 5)));
  if (hit) return hit;
  if (n) return byId(KIND_DEFAULT[foodKindOf(n)]) || FOOD_SPRITES[0];
  return FOOD_SPRITES[index % FOOD_SPRITES.length];
}

// ── Interfaz y escena ────────────────────────────────────────────
// Dibujos en art/ui.js (vector por piezas; en pixel, hechos a mano).
const uiEl = (name) => React.createElement('svg', {
  viewBox: '0 0 64 64', width: 64, height: 64, 'data-px-sprite': `ui.${name}`,
  dangerouslySetInnerHTML: { __html: uiInner(name) },
});
export const UI_SPRITES = Object.fromEntries(UI_NAMES.map((name) => [name, () => uiEl(name)]));

// Las seis cartas de reserva de "Encuentra las parejas" cuando no hay
// fotos ni comidas con imagen suficientes.
export const MEMORY_FALLBACK = ['globo', 'flor', 'nota', 'estrella', 'corazon', 'paleta'];

// Pósters de muestra para la mascota de demostración.
export const DEMO_POSTER_ART = [
  { id: 'demo-poster-1', sprite: 'guitarra', color: '#C7ACEE' },
  { id: 'demo-poster-2', sprite: 'claqueta', color: '#9DCEEF' },
  { id: 'demo-poster-3', sprite: 'tele', color: '#FFB98A' },
];
