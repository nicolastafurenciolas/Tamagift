// ─────────────────────────────────────────────────────────────────
// Packs por gustos (PLAN_REGALO_VIVO.md §3, "Regalarle"; etapa 5).
//
// Quien regala activa desde su rincón un pack según lo que le gusta a su
// pareja ("elegí lo que te gusta") y el mundo se llena de eso:
//   · 3 adornos del cuarto      (art/room/packs.js, DECOR_PACKS)
//   · 2 prendas para la mascota (art/mochi/wardrobe/packs.js, PACK_WEAR)
//   · 1–2 comidas del catálogo que se vuelven "temáticas" (foodCatalog.js)
//   · 4–6 frases de la mascota  ({nombre} = cómo le dice quien regala)
//
// Se guarda en la ficha: profile.packs = ['cafe', 'gatitos', …].
// Todo es puro (sin React ni red ni arte): lo usan el rincón, el juego y
// las pruebas (packs.test.mjs).
//
// Las cosas de los packs llevan `pack` y `season: 'pack'` en el arte, así
// no salen en la tienda de siempre: el juego las muestra solo si el pack
// está activado, como "de {creator_name} para ti" (gratis, PACK_PRICE).
// ─────────────────────────────────────────────────────────────────

// Lo que cuesta en la tienda del juego algo de un pack activado (ya lo
// "pagó" quien regala). Si un día se cobra por pack, se cobra al activar.
export const PACK_PRICE = 0;

// `color`: tono del tema (theme.js: C[color]) para la tarjeta del pack.
// `hero`: el adorno que hace de ícono grande; `icon`: el corto (avisos).
export const PACKS = [
  {
    id: 'anime', name: 'Anime', pitch: 'Su serie favorita, hecha cuarto', icon: '🍙', color: 'rose', hero: 'posterAnime',
    decor: ['posterAnime', 'acrilicos', 'bento'],
    wear: [{ slot: 'cabeza', id: 'bandaNinja' }, { slot: 'ropa', id: 'haori' }],
    foods: [{ base: 'ramen', name: 'Ramen como en el anime' }, { base: 'arroz', name: 'Onigiri de la serie' }],
    lines: [
      '{nombre}, ¿un capítulo más? Prometo no hacer spoilers',
      'Hoy practiqué mi pose de protagonista. ¿Qué tal me salió?',
      'Si fuéramos un anime, este sería el episodio más bonito',
      'Preparé el bento como en la serie: con onigiri y todo 🍙',
      'Me puse la banda ninja: hoy entreno para cuidarte mejor',
    ],
  },
  {
    id: 'kpop', name: 'K-pop', pitch: 'Lightstick, photocards y su comeback favorito', icon: '💜', color: 'lavender', hero: 'lightstick',
    decor: ['lightstick', 'albumKpop', 'abanicoFan'],
    wear: [{ slot: 'mano', id: 'lightstickMano' }, { slot: 'cuello', id: 'credencial' }],
    foods: [{ base: 'boba', name: 'Boba del concierto' }, { base: 'helado', name: 'Bingsu de fresa' }],
    lines: [
      '{nombre}, ¿ponemos el comeback otra vez? Me sé la coreografía… casi',
      'Prendí el lightstick: este cuarto es un concierto y tú, primera fila 💜',
      'Te guardé la photocard más bonita. No la cambio por nada',
      'Hoy ensayé el fanchant para gritarlo contigo',
      'Si este cuarto tuviera un bias, serías tú, {nombre}',
    ],
  },
  {
    id: 'gatitos', name: 'Gatitos', pitch: 'Un cuarto lleno de michis', icon: '🐾', color: 'peach', hero: 'camitaGato',
    decor: ['rascador', 'camitaGato', 'manekiNeko'],
    wear: [{ slot: 'cabeza', id: 'gorroGato' }, { slot: 'mano', id: 'gatitoBrazos' }],
    foods: [{ base: 'leche', name: 'Lechita del gatito' }, { base: 'galleta', name: 'Galletas de patita' }],
    lines: [
      'Miau. Perdón, el gatito me está enseñando a hablar',
      '{nombre}, el gatito se durmió en la camita. ¿Lo dejamos?',
      'Hoy aprendí a amasar pancito con las patitas 🐾',
      'El gato de la suerte saluda para que hoy te vaya bonito',
      'Si tuviera bigotes, te haría cosquillas con ellos',
    ],
  },
  {
    id: 'cafe', name: 'Café', pitch: 'Su cafecito de cada mañana', icon: '☕', color: 'amber', hero: 'espresso',
    decor: ['espresso', 'tazaLatte', 'sacoCafe'],
    wear: [{ slot: 'ropa', id: 'delantalBarista' }, { slot: 'cabeza', id: 'pinzasCafe' }],
    foods: [{ base: 'leche', name: 'Latte con corazón' }, { base: 'pastel', name: 'Torta de café' }],
    lines: [
      '{nombre}, ¿un cafecito? Ya le dibujé un corazón a la espuma ☕',
      'Huele a café recién hecho… y a que hoy va a ser un buen día',
      'Hoy soy tu barista: el primer café va por mi cuenta',
      'Café con leche, galletita y tú. Plan perfecto',
      'Probé la máquina de espresso. Creo que ahora tengo demasiada energía',
    ],
  },
  {
    id: 'plantas', name: 'Plantas', pitch: 'Un rincón verde que crece con amor', icon: '🌱', color: 'sage', hero: 'monstera',
    decor: ['monstera', 'repisaPlantas', 'regadera'],
    wear: [{ slot: 'cabeza', id: 'brote' }, { slot: 'mano', id: 'macetita' }],
    foods: [{ base: 'ensalada', name: 'Ensalada de la huerta' }, { base: 'aguacate', name: 'Aguacate de la matita' }],
    lines: [
      '{nombre}, ¡la monstera sacó una hoja nueva! Mírala',
      'Les hablo bonito a las plantitas, como tú me hablas a mí 🌱',
      'Regué todo. Las plantas y yo te mandamos un abrazo verde',
      'Me salió un brotecito en la cabeza. Debe ser de tanto quererte',
      'Hoy las plantas y yo tomamos sol en la ventana ☀️',
    ],
  },
  {
    id: 'astrologia', name: 'Astrología', pitch: 'Lo que dicen las estrellas sobre ustedes', icon: '🌙', color: 'sky', hero: 'cartaAstral',
    decor: ['cartaAstral', 'movilLuna', 'globoCeleste'],
    wear: [{ slot: 'cuello', id: 'medallonZodiaco' }, { slot: 'cara', id: 'pecasConstelacion' }],
    foods: [{ base: 'macarons', name: 'Macarons de constelación' }, { base: 'algodon', name: 'Algodón de nube estelar' }],
    lines: [
      '{nombre}, hoy los astros dicen que te va a ir increíble ✨',
      'Revisé la carta astral: hay mucha suerte en tu casa del amor',
      'La luna está bonita hoy. Pedí un deseo por ti 🌙',
      'Mercurio puede estar como quiera: igual te quiero',
      'Según las estrellas, hoy toca abrazo doble',
    ],
  },
  {
    id: 'futbol', name: 'Fútbol', pitch: 'Para alentar al equipo de sus amores', icon: '⚽', color: 'sky', hero: 'copa',
    decor: ['balon', 'copa', 'camisetaMarco'],
    wear: [{ slot: 'cuello', id: 'bufandaHincha' }, { slot: 'mano', id: 'balonMano' }],
    foods: [{ base: 'perro', name: 'Perro caliente del estadio' }, { base: 'jugo', name: 'Jugo del entretiempo' }],
    lines: [
      '{nombre}, ¡golazo! Bueno, pateé el balón contra la pared ⚽',
      'Me puse la bufanda: hoy alentamos con todo',
      'Te guardé la copa: en mi equipo, siempre ganas tú 🏆',
      '¿Vemos el partido? Yo llevo las papitas',
      'Si hay penales, no puedo mirar. Avísame cuando termine',
    ],
  },
  {
    id: 'terror', name: 'Terror bonito', pitch: 'Miedito, pero tierno', icon: '🦇', color: 'lavender', hero: 'ataud',
    decor: ['pociones', 'ataud', 'plantaCarnivora'],
    wear: [{ slot: 'cabeza', id: 'tornillos' }, { slot: 'espalda', id: 'mochilaAtaud' }],
    foods: [{ base: 'gomitas', name: 'Gomitas de gusanito' }, { base: 'dona', name: 'Dona de telaraña' }],
    lines: [
      '{nombre}, ¿vemos una de miedo? Yo me tapo los ojos y tú me cuentas',
      'El murcielaguito está durmiendo de cabeza. ¡Shh! 🦇',
      'Hice pociones: la rosada es de abrazos 💗',
      'No le tengo miedo a nada… salvo a que te vayas',
      'La planta carnívora me sonrió. Creo que ya somos familia',
    ],
  },
];

export const PACK_IDS = PACKS.map((p) => p.id);
export const findPack = (id) => PACKS.find((p) => p.id === id) || null;

/** Los ids válidos, sin repetir, en el orden en que llegaron. */
export function cleanPackIds(ids) {
  const out = [];
  for (const id of Array.isArray(ids) ? ids : []) if (PACK_IDS.includes(id) && !out.includes(id)) out.push(id);
  return out;
}
/** Los packs activados en una ficha. */
export const activePacks = (profile) => cleanPackIds(profile && profile.packs);
export const isPackActive = (profile, id) => activePacks(profile).includes(id);

/** La ficha con un pack activado (sin tocar nada más de la ficha). */
export function withPack(profile, id) {
  const p = profile || {};
  if (!PACK_IDS.includes(id)) return p;
  return { ...p, packs: cleanPackIds([...(p.packs || []), id]) };
}
/** La ficha sin ese pack. */
export function withoutPack(profile, id) {
  const p = profile || {};
  return { ...p, packs: cleanPackIds(p.packs).filter((x) => x !== id) };
}

/**
 * Lo que desbloquean los packs:
 *   { decor: [{ kind: 'decor', id, pack }],
 *     wear:  [{ kind: 'ropa', slot, id, pack }],
 *     foods: [{ kind: 'comida', base, name, pack }],
 *     price: PACK_PRICE }
 */
export function packItems(ids) {
  const out = { decor: [], wear: [], foods: [], price: PACK_PRICE };
  for (const id of cleanPackIds(ids)) {
    const p = findPack(id);
    p.decor.forEach((d) => out.decor.push({ kind: 'decor', id: d, pack: id }));
    p.wear.forEach((w) => out.wear.push({ kind: 'ropa', slot: w.slot, id: w.id, pack: id }));
    p.foods.forEach((f) => out.foods.push({ kind: 'comida', base: f.base, name: f.name, pack: id }));
  }
  return out;
}

/** ¿De qué pack es este adorno / esta prenda? (null si no es de ninguno) */
export const packOfDecor = (id) => (PACKS.find((p) => p.decor.includes(id)) || {}).id || null;
export const packOfWear = (slot, id) => (PACKS.find((p) => p.wear.some((w) => w.slot === slot && w.id === id)) || {}).id || null;

/**
 * El nombre temático de una comida del catálogo si algún pack activado la
 * tiene (el primero que la nombre gana), o null.
 */
export function themedFoodName(foodId, ids) {
  for (const id of cleanPackIds(ids)) {
    const f = findPack(id).foods.find((x) => x.base === foodId);
    if (f) return f.name;
  }
  return null;
}

const fillNames = (t, { nombre, yo } = {}) => String(t).replace(/\{nombre\}/g, nombre || 'amor').replace(/\{yo\}/g, yo || 'yo');

/** Las frases de los packs: [{ pack, i, text }] (con nombres si se pasan). */
export function packLines(ids, names) {
  const out = [];
  for (const id of cleanPackIds(ids)) findPack(id).lines.forEach((t, i) => out.push({ pack: id, i, text: names ? fillNames(t, names) : t }));
  return out;
}

/**
 * Las frases de los packs con la misma forma que las líneas de gusto de
 * life.js (likeOptions): así el juego las suma a la escena 'gusto' sin
 * cambiar nada más. `line` ya no tiene {v}; {nombre} lo pone fill().
 */
export function packLikeOptions(profile) {
  return packLines(activePacks(profile)).map((l) => ({ id: `pack:${l.pack}`, i: l.i, v: '', line: l.text, key: `pack:${l.pack}:${l.i}`, pack: l.pack }));
}

// ── Sugerencia según la ficha ────────────────────────────────────
// Se buscan palabras en los gustos (likes) de la ficha. Fuerte = 3 (lo
// nombra directo), media = 2, suave = 1. "Lo que le da miedito" no
// cuenta (si le asustan las arañas, no le sugerimos terror).
const KEYWORDS = {
  anime: {
    3: ['anime', 'animes', 'manga', 'ghibli', 'totoro', 'naruto', 'one piece', 'dragon ball', 'sailor moon', 'pokemon', 'demon slayer', 'kimetsu', 'jujutsu', 'haikyuu', 'attack on titan', 'shingeki', 'spy x family', 'chainsaw', 'evangelion', 'otaku', 'cosplay', 'japon'],
    2: ['videojuego', 'videojuegos', 'gamer', 'nintendo', 'zelda', 'mario'],
    1: ['jugar', 'playstation', 'japones', 'dibujar', 'sushi', 'ramen'],
  },
  kpop: {
    3: ['k-pop', 'kpop', 'k pop', 'bts', 'blackpink', 'twice', 'stray kids', 'newjeans', 'seventeen', 'exo', 'aespa', 'itzy', 'le sserafim', 'enhypen', 'ateez', 'k-drama', 'kdrama', 'dorama', 'doramas', 'corea', 'coreano', 'idol'],
    1: ['bailar', 'boba', 'cantar'],
  },
  gatitos: {
    3: ['gato', 'gatos', 'gatito', 'gatitos', 'michi', 'michis', 'felino'],
    1: ['animales', 'mascota', 'mascotas'],
  },
  cafe: {
    3: ['cafe', 'cafecito', 'latte', 'capuchino', 'cappuccino', 'espresso', 'cafeteria', 'starbucks'],
    1: ['friends', 'leer', 'libros', 'desayuno'],
  },
  plantas: {
    3: ['planta', 'plantas', 'plantitas', 'jardin', 'jardineria', 'suculenta', 'suculentas', 'cactus', 'huerta', 'monstera', 'naturaleza', 'bosque'],
    2: ['flores', 'flor'],
    1: ['girasol', 'girasoles', 'tulipan', 'tulipanes', 'lavanda', 'margarita', 'margaritas', 'rosas', 'orquidea', 'montana', 'campo'],
  },
  astrologia: {
    3: ['astrologia', 'horoscopo', 'zodiaco', 'signo', 'signos', 'tarot', 'astral', 'astros', 'astronomia', 'constelacion', 'constelaciones', 'cristales',
      'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis'],
    2: ['luna', 'estrellas', 'universo', 'galaxia'],
    1: ['cielo', 'noche', 'espacio'],
  },
  futbol: {
    3: ['futbol', 'soccer', 'messi', 'ronaldo', 'cr7', 'mundial', 'seleccion', 'champions', 'real madrid', 'barcelona', 'barca', 'estadio', 'gol', 'goles'],
    2: ['partido', 'partidos', 'equipo', 'boca', 'river', 'millonarios', 'nacional', 'chivas', 'pumas'],
    1: ['deporte', 'deportes', 'ejercicio', 'correr', 'gym'],
  },
  terror: {
    3: ['terror', 'halloween', 'tim burton', 'merlina', 'wednesday', 'addams', 'stranger things', 'coraline', 'el conjuro', 'fantasma', 'fantasmas', 'zombi', 'zombis', 'zombies', 'vampiro', 'vampiros', 'gotico', 'gotica', 'calavera', 'calaveras', 'monstruos'],
    2: ['miedo', 'bruja', 'brujas', 'brujitas'],
    1: ['oscuro', 'misterio', 'suspenso', 'true crime'],
  },
};
// Si la ficha no dice nada, el orden por defecto (lo que más gusta).
export const DEFAULT_ORDER = ['gatitos', 'cafe', 'plantas', 'anime', 'astrologia', 'kpop', 'futbol', 'terror'];
const SKIP_LIKES = ['miedo'];

export const normalize = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const hasWord = (text, w) => new RegExp(`(^|[^a-z0-9])${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?=$|[^a-z0-9])`).test(text);

/** Puntaje de cada pack según la ficha: { anime: 3, cafe: 0, … }. */
export function packScores(profile) {
  const likes = (profile && profile.likes) || {};
  const texts = Object.entries(likes).filter(([k, v]) => !SKIP_LIKES.includes(k) && String(v || '').trim()).map(([, v]) => normalize(v));
  const out = {};
  for (const id of PACK_IDS) {
    let sc = 0;
    for (const [w, words] of Object.entries(KEYWORDS[id])) {
      for (const t of texts) if (words.some((word) => hasWord(t, word))) sc += Number(w);
    }
    out[id] = sc;
  }
  return out;
}

/**
 * Los `n` packs sugeridos para esta ficha: primero los que nombra (más
 * puntaje primero), después el orden por defecto. Los ya activados van al
 * final (no se sugiere lo que ya tiene), salvo `keepActive`.
 */
export function suggestPacks(profile, n = 2, { keepActive = false } = {}) {
  const sc = packScores(profile);
  const act = keepActive ? [] : activePacks(profile);
  const rank = (id) => DEFAULT_ORDER.indexOf(id);
  return [...PACK_IDS].sort((a, b) => (act.includes(a) - act.includes(b)) || (sc[b] - sc[a]) || (rank(a) - rank(b))).slice(0, n);
}

/** ¿Por qué se sugiere? El gusto de la ficha que lo hizo saltar (o null). */
export function suggestReason(profile, id) {
  const likes = (profile && profile.likes) || {};
  const kw = KEYWORDS[id];
  if (!kw) return null;
  for (const [k, v] of Object.entries(likes)) {
    if (SKIP_LIKES.includes(k) || !String(v || '').trim()) continue;
    const t = normalize(v);
    if (Object.values(kw).some((words) => words.some((w) => hasWord(t, w)))) return String(v).trim();
  }
  return null;
}

/** La etiqueta de la tienda del juego: "De Nico para ti". */
export const giftLabel = (creatorName) => (creatorName ? `De ${creatorName} para ti` : 'Un regalo para ti');
