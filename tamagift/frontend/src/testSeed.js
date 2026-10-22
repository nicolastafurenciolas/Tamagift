// ─────────────────────────────────────────────────────────────────
// Semilla de prueba.
//
// Escribir la clave en el asistente arma una mascota completa al azar
// —dibujos, comidas, frases, fotos, música, ropa y decoración— y
// devuelve el link listo. Es sólo para probar cambios sin tener que
// reconfigurar todo a mano cada vez.
//
// Todo lo visual se genera con formas de código (SVG/canvas), nada de
// IA y nada con licencia ajena: son manchas de color, no fotos reales.
// ─────────────────────────────────────────────────────────────────

import { randomRecipe, recipeToPngDataUrl } from './PetRecipe';
import { PET_STYLES } from './petStyles';

export const TEST_KEY = 'test';

export function isTestKey(value) {
  return (value || '').trim().toLowerCase() === TEST_KEY;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
};

const PET_NAMES = ['Nube', 'Kuro', 'Mochi', 'Trufa', 'Pixel', 'Bruma', 'Ceniza', 'Suki', 'Tinta', 'Lúa'];
const PARTNERS = ['Sarah', 'Ana', 'Mar', 'Cami', 'Val'];
const CREATORS = ['Nico', 'Alex', 'Sam'];

const FOODS_LIKE = ['Sushi', 'Pizza', 'Helado de mora', 'Chocolate', 'Arepa con queso', 'Ramen', 'Fresas', 'Tacos'];
const FOODS_DISLIKE = ['Brócoli', 'Cebolla cruda', 'Piña en pizza', 'Aceitunas', 'Coliflor'];

const MSG_LIKE = [
  '¡Esto es justo lo que quería!',
  'Nadie me conoce como tú',
  'Otra vez, otra vez, por favor',
  'Guardaría esto para siempre',
];
const MSG_DISLIKE = [
  'No, gracias. En serio, no.',
  '¿Otra vez esto?',
  'Prefiero pasar hambre',
];

const PHRASES = {
  positiva: ['Hoy te ves increíble', 'Me alegras el día entero', 'Contigo todo es más fácil', 'Eres mi lugar favorito'],
  negativa: ['Hoy no está siendo mi día', 'Necesito un abrazo', 'Estoy de mal humor, no es tu culpa'],
  casual: ['¿Qué estás haciendo?', 'Estaba pensando en ti', 'Cuéntame algo bonito', '¿Ya comiste?', 'Hace rato no me consientes'],
};

// Canciones reales en formato embed — para probar que el reproductor
// suena de verdad. YouTube permite autoplay tras un gesto; Spotify no.
// Comprobadas con la API de YouTube: se pueden incrustar. La radio lofi
// que habia antes devolvia error 150 (el dueno no permite incrustarla) y
// la prueba salia siempre en silencio.
const SONGS = [
  { title: 'Cancion de prueba 1', embed_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
  { title: 'Cancion de prueba 2', embed_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' },
];

const PALETTES = [
  ['#FF6FD8', '#2BE8E8'], ['#D8697F', '#FFE270'], ['#7FA894', '#F2EAE0'],
  ['#B14AED', '#C6FF3D'], ['#8B5E3C', '#EADFCB'], ['#463F52', '#9B6BD6'],
];

// Una "foto" de prueba: degradado con formas. Sirve para pósters y
// para el rompecabezas (que necesita una imagen con detalle visible).
function fakePhoto(seed) {
  const [a, b] = PALETTES[seed % PALETTES.length];
  const shapes = Array.from({ length: 5 }, (_, i) => {
    const x = 40 + ((seed * 37 + i * 61) % 220);
    const y = 40 + ((seed * 53 + i * 97) % 220);
    const r = 22 + ((seed + i * 13) % 46);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,${0.14 + (i % 3) * 0.12})"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <defs><linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
    </linearGradient></defs>
    <rect width="300" height="300" fill="url(#g${seed})"/>${shapes}
    <text x="150" y="160" font-family="sans-serif" font-size="34" font-weight="bold"
      fill="rgba(255,255,255,0.85)" text-anchor="middle">prueba ${seed}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// Un objeto decorativo de prueba, ya "recortado" (fondo transparente).
function fakeDecor(seed) {
  const [a, b] = PALETTES[seed % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
    <circle cx="60" cy="60" r="46" fill="${a}" stroke="#4A3439" stroke-width="5"/>
    <circle cx="60" cy="60" r="16" fill="${b}" stroke="#4A3439" stroke-width="4"/>
    <circle cx="60" cy="60" r="4" fill="#4A3439"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

/**
 * Arma un payload completo de mascota, listo para `createPet`.
 * Devuelve también la receta usada, por si se quiere mostrar.
 */
export async function buildTestPet() {
  // Mitad de las veces un estilo con carácter, mitad totalmente al azar:
  // así la prueba cubre tanto los presets como combinaciones raras.
  const useStyle = Math.random() < 0.5;
  const style = pick(PET_STYLES);
  const recipe = useStyle
    ? { ...randomRecipe(), ...style.recipe }
    : randomRecipe();

  const [drawing_normal, drawing_feliz, drawing_enojado] = await Promise.all([
    recipeToPngDataUrl(recipe, 'normal', null, 320),
    recipeToPngDataUrl(recipe, 'feliz', null, 320),
    recipeToPngDataUrl(recipe, 'enojado', null, 320),
  ]);

  // Con imagen a propósito: "Atrapa la comida" solo hace caer comidas que
  // tengan foto, y perder vida por atrapar algo que no le gusta depende de
  // eso. Sin imágenes la clave de prueba no ejercitaba ninguna de las dos.
  const likes = pickN(FOODS_LIKE, 4).map((name, i) => ({
    food_name: name,
    preference: 'gusta',
    reaction_message: pick(MSG_LIKE),
    image: fakeDecor(20 + i),
  }));
  const dislikes = pickN(FOODS_DISLIKE, 2).map((name, i) => ({
    food_name: name,
    preference: 'no_gusta',
    reaction_message: pick(MSG_DISLIKE),
    image: fakeDecor(40 + i),
  }));

  const phrases = [];
  Object.entries(PHRASES).forEach(([category, list]) => {
    pickN(list, 3).forEach((text) => phrases.push({ category, text }));
  });

  // 3 pósters + 3 de rompecabezas: justo la regla mínima del asistente.
  const photos = [];
  for (let i = 0; i < 3; i++) photos.push({ url: fakePhoto(i + 1), caption: null, used_for: 'poster', price: 45 });
  for (let i = 0; i < 3; i++) photos.push({ url: fakePhoto(i + 11), caption: null, used_for: 'puzzle' });

  const decor_items = [
    { name: 'Disco de prueba', description: 'Un objeto generado para testear', price: 60, image: fakeDecor(2), ratio: 1 },
    { name: 'Recuerdo de prueba', description: null, price: 90, image: fakeDecor(4), ratio: 1 },
  ];

  // Blancos propios de "Dale al que salga", para poder probar que el
  // juego prefiere estos por encima de comidas/decoración.
  const whack_targets = [
    { name: 'Blanco de prueba 1', image: fakeDecor(6) },
    { name: 'Blanco de prueba 2', image: fakeDecor(8) },
  ];

  return {
    recipe,
    payload: {
      name: pick(PET_NAMES),
      creator_name: pick(CREATORS),
      recipient_name: pick(PARTNERS),
      drawing_normal, drawing_feliz, drawing_enojado,
      recipe_original: JSON.stringify(recipe),
      food_preferences: [...likes, ...dislikes],
      phrases,
      photos,
      songs: SONGS,
      // Un traje de prueba: la misma mochi con corona y capa.
      outfits: [{
        name: 'Traje de realeza', price: 40,
        drawing_normal, drawing_feliz, drawing_enojado,
        recipe: JSON.stringify({ ...recipe, headAcc: 'corona', neckAcc: 'capa' }),
      }],
      decor_items,
      whack_targets,
    },
  };
}

/**
 * Estado de juego inicial para probar: monedas de sobra y todo
 * comprado, para poder tocar la tienda y el cuarto sin farmear.
 */
export function testGameState() {
  return {
    coins: 9999,
    ownedFurniture: ['cama', 'sofa', 'estanteria', 'tocadiscos', 'alfombra', 'planta', 'ventana', 'guirnalda', 'repisa'],
    ownedWalls: ['crema', 'rayas', 'lunares', 'ladrillo', 'carbon', 'vinotinto', 'neon', 'medianoche'],
    ownedFloors: ['madera', 'nogal', 'ajedrez', 'terracota', 'alfombrado', 'piedra'],
  };
}
