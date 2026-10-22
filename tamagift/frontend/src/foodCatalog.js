// ─────────────────────────────────────────────────────────────────
// Catálogo de comida: qué es cada una y qué le hace a la mochi.
//
// Es la única lista de comidas del juego. El dibujo de cada una vive en
// sprites.jsx (por id); la cocina, el súper, la huerta y la nevera usan
// estos mismos ids. Las comidas que sube quien regala no están acá: se
// clasifican por su nombre con `foodKindOf`.
// ─────────────────────────────────────────────────────────────────

// Lo que hace cada tipo de comida. `weight` sube o baja la redondez de
// la mochi (ver DISENO_MUNDO_VIVO.md §3): la chatarra y los dulces la
// redondean, lo sano y lo casero la devuelven a su forma.
export const FOOD_KINDS = {
  saludable: { label: 'Saludable', hunger: 14, weight: -2, energy: 2, love: 1 },
  casera: { label: 'Casera', hunger: 26, weight: -0.5, energy: 4, love: 1 },
  chatarra: { label: 'Chatarra', hunger: 26, weight: 4, energy: -1, love: 0 },
  dulce: { label: 'Dulce', hunger: 12, weight: 3, energy: 5, love: 2 },
  bebida: { label: 'Bebida', hunger: 6, weight: 0, energy: 6, love: 1 },
};

export const FOODS = [
  // frutas y verduras
  { id: 'fresa', name: 'Fresas', kind: 'saludable', price: 8 },
  { id: 'manzana', name: 'Manzana', kind: 'saludable', price: 6 },
  { id: 'banano', name: 'Banano', kind: 'saludable', price: 6 },
  { id: 'sandia', name: 'Sandía', kind: 'saludable', price: 9 },
  { id: 'uvas', name: 'Uvas', kind: 'saludable', price: 8 },
  { id: 'naranja', name: 'Naranja', kind: 'saludable', price: 6 },
  { id: 'zanahoria', name: 'Zanahoria', kind: 'saludable', price: 5 },
  { id: 'brocoli', name: 'Brócoli', kind: 'saludable', price: 6 },
  { id: 'aguacate', name: 'Aguacate', kind: 'saludable', price: 9 },
  { id: 'ensalada', name: 'Ensalada', kind: 'saludable', price: 16 },
  // comida casera
  { id: 'arepa', name: 'Arepa con queso', kind: 'casera', price: 14 },
  { id: 'empanada', name: 'Empanada', kind: 'casera', price: 12 },
  { id: 'sopa', name: 'Sopa calientita', kind: 'casera', price: 18 },
  { id: 'arroz', name: 'Bolita de arroz', kind: 'casera', price: 12 },
  { id: 'huevo', name: 'Huevo frito', kind: 'casera', price: 10 },
  { id: 'panqueques', name: 'Panqueques', kind: 'casera', price: 18 },
  { id: 'pasta', name: 'Pasta', kind: 'casera', price: 18 },
  { id: 'sushi', name: 'Sushi', kind: 'casera', price: 22 },
  { id: 'ramen', name: 'Ramen', kind: 'casera', price: 22 },
  { id: 'tacos', name: 'Tacos', kind: 'casera', price: 18 },
  // chatarra
  { id: 'pizza', name: 'Pizza', kind: 'chatarra', price: 16 },
  { id: 'hamburguesa', name: 'Hamburguesa', kind: 'chatarra', price: 18 },
  { id: 'papas', name: 'Papas fritas', kind: 'chatarra', price: 10 },
  { id: 'perro', name: 'Perro caliente', kind: 'chatarra', price: 14 },
  // dulces
  { id: 'helado', name: 'Helado', kind: 'dulce', price: 12 },
  { id: 'dona', name: 'Dona', kind: 'dulce', price: 10 },
  { id: 'pastel', name: 'Tajada de torta', kind: 'dulce', price: 16 },
  { id: 'galleta', name: 'Galleta', kind: 'dulce', price: 6 },
  { id: 'chocolate', name: 'Chocolatina', kind: 'dulce', price: 8 },
  { id: 'cupcake', name: 'Cupcake', kind: 'dulce', price: 12 },
  { id: 'macarons', name: 'Macarons', kind: 'dulce', price: 16 },
  { id: 'gomitas', name: 'Gomitas', kind: 'dulce', price: 8 },
  { id: 'algodon', name: 'Algodón de azúcar', kind: 'dulce', price: 10 },
  // bebidas
  { id: 'boba', name: 'Té de burbujas', kind: 'dulce', price: 14 },
  { id: 'leche', name: 'Leche', kind: 'bebida', price: 6 },
  { id: 'jugo', name: 'Jugo de naranja', kind: 'bebida', price: 8 },
];

export const findFood = (id) => FOODS.find((f) => f.id === id) || null;

// ── Comidas de quien regala: tipo según el nombre ───────────────────
// Se busca la palabra en el nombre ("Helado de mora" → dulce). Si no se
// reconoce nada, se toma como comida casera: es lo más neutro.
const WORDS = {
  chatarra: ['pizza', 'hamburgues', 'burger', 'papas fritas', 'papitas', 'salchipapa', 'perro caliente', 'hot dog', 'hotdog', 'nugget', 'gaseosa', 'coca', 'soda', 'doritos', 'chips', 'chicharr', 'alitas', 'mcdonald', 'kfc', 'shawarma'],
  dulce: ['helado', 'dona', 'donut', 'torta', 'pastel', 'galleta', 'chocolate', 'chocolatina', 'dulce', 'caramelo', 'gomita', 'cupcake', 'brownie', 'postre', 'flan', 'churro', 'algodón', 'algodon', 'chicle', 'nutella', 'malteada', 'milkshake', 'mousse', 'cheesecake', 'tiramis', 'arequipe', 'bocadillo', 'oblea', 'merengue', 'macaron', 'waffle', 'crepe', 'boba', 'frappe', 'bombón', 'bombon', 'paleta', 'mazapán', 'manjar'],
  saludable: ['fresa', 'manzana', 'banano', 'banana', 'plátano', 'platano', 'pera', 'uva', 'sandía', 'sandia', 'mango', 'piña', 'pina', 'naranja', 'mandarina', 'kiwi', 'melón', 'melon', 'papaya', 'durazno', 'cereza', 'arándano', 'arandano', 'mora', 'frambuesa', 'fruta', 'brócoli', 'brocoli', 'zanahoria', 'lechuga', 'ensalada', 'espinaca', 'tomate', 'pepino', 'aguacate', 'palta', 'verdura', 'yogur', 'avena', 'granola', 'nueces', 'almendra', 'coliflor', 'apio', 'cebolla', 'pimentón', 'aceituna'],
  bebida: ['leche', 'jugo', 'agua', 'limonada', 'café', 'cafe', 'té', 'chocolate caliente', 'aromática', 'smoothie', 'batido'],
};

// Cada palabra tiene que empezar una palabra del nombre ("mora" no se
// encuentra dentro de "zamora"); las bebidas además tienen que terminarla
// ("agua" no es "aguacate").
const L = 'a-zà-ÿñ';
const starts = (n, w) => new RegExp(`(^|[^${L}])${w}`).test(n);
const whole = (n, w) => new RegExp(`(^|[^${L}])${w}(?=$|[^${L}])`).test(n);

export function foodKindOf(name) {
  const n = (name || '').toLowerCase();
  // Primero lo más específico: "helado de mora" es dulce aunque tenga
  // fruta; "papas fritas" es chatarra aunque diga papa.
  if (WORDS.chatarra.some((w) => starts(n, w))) return 'chatarra';
  if (WORDS.dulce.some((w) => starts(n, w))) return 'dulce';
  if (WORDS.bebida.some((w) => whole(n, w))) return 'bebida';
  if (WORDS.saludable.some((w) => starts(n, w))) return 'saludable';
  return 'casera';
}
