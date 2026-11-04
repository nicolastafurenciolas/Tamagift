// ─────────────────────────────────────────────────────────────────
// Catálogo de lo personal (ver PLAN_REGALO_VIVO.md).
//
// Todo lo que quien regala puede sumar trae ejemplos ya escritos: nada
// empieza en blanco. Lo usan el asistente (paso "Sobre ella"), el rincón
// de quien regala y el juego (que es quien lo hace llegar).
//
// Textos: cálidos, cortos, en español neutro y sin género (sirven si
// regala un novio o una novia). En los ejemplos, {nombre} es como
// quien regala le dice a su pareja (apodo, o su nombre) y {yo} es quien
// regala; fill() los reemplaza.
//
// Forma de la ficha guardada (Pet.profile, JSON):
//   nickname       cómo le dice quien regala
//   likes          { [id de LIKES]: texto }
//   dates          [{ id, kind, date: 'AAAA-MM-DD' | 'MM-DD', label? }]
//   situations     { [id de SITUATIONS]: [texto, …] }
//   coupons        [{ id, title, stars }]
//   places         [{ id, name, note?, photo? (índice de foto) }]
//   recipes        [{ id, name, story, dish? (id de comida) }]
//   photoObjects   [{ id, kind (de PHOTO_OBJECTS), photo (índice) }]
//   giver          { recipe (mochi de quien regala, JSON), name }
//   packs          [ids de packs por gustos]
//   city           ciudad de quien recibe (para el clima real)
// ─────────────────────────────────────────────────────────────────

export const fill = (text, { nombre, yo } = {}) => String(text || '')
  .replace(/\{nombre\}/g, nombre || 'amor')
  .replace(/\{yo\}/g, yo || 'yo');

// Cómo se le dice a quien recibe en los textos (apodo > nombre).
export const callName = (pet, profile) => (profile && profile.nickname) || (pet && pet.recipient_name) || '';

// ── Ficha de gustos ──────────────────────────────────────────────
// `quick`: los que se piden en el asistente (tres, rápidos). El resto se
// suma después desde el rincón. `ideas` son tocables para no pensar.
export const LIKES = [
  { id: 'color', label: 'Su color favorito', ideas: ['Rosa', 'Lila', 'Celeste', 'Verde menta', 'Negro', 'Amarillo'], quick: true },
  { id: 'serie', label: 'Una serie o peli que ama', ideas: ['Friends', 'Studio Ghibli', 'Harry Potter', 'Un anime', 'Una novela'], quick: true },
  { id: 'risa', label: 'Algo que siempre le hace reír', ideas: ['Los videos de gatitos', 'Mis chistes malos', 'Cuando bailo', 'Los memes'], quick: true },
  { id: 'flor', label: 'Su flor favorita', ideas: ['Girasoles', 'Tulipanes', 'Rosas', 'Margaritas', 'Lavanda'] },
  { id: 'animal', label: 'Su animal favorito', ideas: ['Gatos', 'Perritos', 'Pingüinos', 'Conejitos', 'Capibaras'] },
  { id: 'bebida', label: 'Lo que le gusta tomar', ideas: ['Café', 'Té', 'Chocolate caliente', 'Boba', 'Jugo de mango'] },
  { id: 'postre', label: 'Su postre favorito', ideas: ['Helado', 'Cheesecake', 'Brownies', 'Torta de chocolate', 'Fresas con crema'] },
  { id: 'lugar', label: 'Un lugar que le encanta', ideas: ['La playa', 'La montaña', 'Un café tranquilo', 'Su cama', 'La casa de su abuela'] },
  { id: 'hobby', label: 'Lo que le gusta hacer', ideas: ['Leer', 'Dibujar', 'Bailar', 'Jugar videojuegos', 'Cocinar', 'Hacer ejercicio'] },
  { id: 'musica', label: 'Música o artista que ama', ideas: ['Taylor Swift', 'Bad Bunny', 'K-pop', 'Rock', 'Lo que suene en la radio'] },
  { id: 'sueno', label: 'Un sueño que tiene', ideas: ['Viajar a Japón', 'Tener su propia casa', 'Adoptar un perrito', 'Su propio negocio'] },
  { id: 'miedo', label: 'Algo que le da miedito', ideas: ['Las arañas', 'La oscuridad', 'Los payasos', 'Las alturas', 'Las tormentas'] },
  { id: 'mania', label: 'Una manía adorable', ideas: ['Robar mis papas fritas', 'Hablar en sueños', 'Cantar en la ducha', 'Llegar tarde'] },
];

// Lo que la mascota dice usando la ficha (etapa 3: el mundo vivo). Un
// hueco {v} es el gusto. Se eligen al azar, de a una por día como mucho.
export const LIKE_LINES = {
  color: ['Hoy me puse algo de {v}, ¿te gusta?', 'Vi algo {v} y pensé en ti'],
  serie: ['¿Vemos {v} esta noche?', 'Soñé que estábamos dentro de {v}'],
  risa: ['Me acordé de {v} y me reí un montón', '¿Quieres reírte? Piensa en {v}'],
  flor: ['Si pudiera, te llenaría el cuarto de {v}', 'Huele a {v}… ¿o lo imaginé?'],
  animal: ['Hoy vi un dibujo de {v} y me puse feliz', '¿Y si adoptamos {v}? Bueno, ya me tienes a mí'],
  bebida: ['¿Te preparo {v}?', 'Un {v} y una charla: plan perfecto'],
  postre: ['Tengo antojo de {v}… ¿tú también?', 'Guardé {v} para después'],
  lugar: ['Cierra los ojos: estamos en {v}', 'Algún día vamos a {v}, ¿sí?'],
  hobby: ['¿Hoy toca {v}? Te acompaño', 'Me encanta verte cuando estás en {v}'],
  musica: ['Estuve tarareando {v} todo el día', '¿Ponemos {v}?'],
  sueno: ['Sé que vas a lograr {v}', 'Hoy soñé con {v}. Ya casi'],
  miedo: ['Tranqui, si aparecen {v} yo te protejo', 'Revisé el cuarto: cero {v}'],
  mania: ['Te vi: {v} otra vez 😄', 'Lo de {v} es lo más tierno del mundo'],
};

// ── Fechas de la pareja ──────────────────────────────────────────
// Cada una se vuelve una temporada propia en el juego (etapa 4).
export const DATE_KINDS = [
  { id: 'cumple', label: 'Su cumpleaños', icon: 'pastel', quick: true },
  { id: 'aniversario', label: 'Nuestro aniversario', icon: 'corazon', quick: true },
  { id: 'conocimos', label: 'El día que nos conocimos', icon: 'estrella' },
  { id: 'primeracita', label: 'Nuestra primera cita', icon: 'cafe' },
  { id: 'primerbeso', label: 'Nuestro primer beso', icon: 'beso' },
  { id: 'otra', label: 'Otra fecha especial', icon: 'calendario' },
];

// ── Mensajes por situación ───────────────────────────────────────
// La mascota los dice cuando pasa eso, con una marca de que vienen de
// quien regala. `quick`: los tres que el asistente ofrece ya escritos.
// `cada`: cuántos días tienen que pasar para repetir la situación.
export const SITUATIONS = [
  {
    id: 'triste', label: 'Si está triste', when: 'Cuando la mascota la nota decaída', quick: true, cada: 1,
    examples: ['{nombre}, me dijo que te recuerde que eres lo mejor que le pasó', 'Me pidió un abrazo para ti cuando estuvieras triste. Aquí va 🫂', 'Dice que esto también pasa, y que está contigo'],
  },
  {
    id: 'buenasnoches', label: 'Antes de dormir', when: 'Cuando apaga la luz', quick: true, cada: 1,
    examples: ['Te manda un beso de buenas noches 🌙', 'Dice que sueñes bonito, {nombre}', 'Me dijo que no te duermas sin saber que te quiere'],
  },
  {
    id: 'lluvia', label: 'Cuando llueve', when: 'Los días de lluvia', quick: true, cada: 2,
    examples: ['Me dijo que si llovía te recordara llevar paraguas ☔', 'Un día de lluvia es perfecto para pensar en ti, dice', 'Dice que la lluvia le recuerda a cuando se refugiaron juntos'],
  },
  {
    id: 'buenosdias', label: 'Al despertar', when: 'La primera vez del día, de mañana', cada: 1,
    examples: ['¡Buenos días, {nombre}! Te mandó un beso para empezar el día', 'Dice que hoy te va a ir increíble', 'Me pidió que te diga que eres su primer pensamiento'],
  },
  {
    id: 'lunes', label: 'Los lunes', when: 'Cada lunes', cada: 7,
    examples: ['Lunes otra vez… pero me dijo que tú puedes con todo', 'Dice que el lunes es más lindo si piensas en el fin de semana juntos'],
  },
  {
    id: 'viernes', label: 'Los viernes', when: 'Cada viernes', cada: 7,
    examples: ['¡Es viernes! Dice que te lo ganaste', '¿Plan de viernes? Me dijo que te espera'],
  },
  {
    id: 'desvelo', label: 'Si se desvela', when: 'Si sigue despierto o despierta pasada la medianoche', cada: 1,
    examples: ['¿Todavía sin dormir? Me dijo que a dormir, que mañana te quiere con energía 💤', 'Dice que si no puedes dormir, cuentes los besos que te debe'],
  },
  {
    id: 'ausencia', label: 'Si pasa días sin entrar', when: 'Cuando vuelve después de 3 días o más', cada: 3,
    examples: ['¡Volviste! Te extrañé… y me dijo que te extrañó muchísimo', 'Dice que te guardó un abrazo de todos los días que no viniste'],
  },
  {
    id: 'logro', label: 'Cuando logra algo difícil', when: 'Al pasar un nivel con tres estrellas', cada: 1,
    examples: ['¡Lo lograste! Me dijo que sabía que podías', 'Dice que qué orgullo le das, {nombre}'],
  },
];

// ── Cupones de amor ──────────────────────────────────────────────
// Quien recibe junta estrellas jugando y canjea; quien regala lo ve.
export const COUPON_IDEAS = [
  { title: 'Vale por una cena', stars: 30 },
  { title: 'Vale por un masaje', stars: 20 },
  { title: 'Vale por elegir la peli', stars: 10 },
  { title: 'Vale por desayuno en la cama', stars: 25 },
  { title: 'Vale por un abrazo de cinco minutos', stars: 5 },
  { title: 'Vale por una salida sorpresa', stars: 40 },
  { title: 'Vale por ganar una discusión', stars: 15 },
  { title: 'Vale por un día sin quehaceres', stars: 35 },
  { title: 'Vale por un helado', stars: 10 },
  { title: 'Vale por una carta escrita a mano', stars: 15 },
];

// ── Notas rápidas (un toque y se manda) ──────────────────────────
export const QUICK_NOTES = [
  'Pensé en ti 💭', '¿Ya comiste? 🍽️', 'Te extraño', 'Qué orgullo me das',
  'Ya quiero verte', 'Eres mi persona favorita', 'Respira, todo va a salir bien', 'Te quiero muchísimo',
];

// Cartas con fecha: ideas de cuándo abrirlas.
export const LETTER_WHEN = [
  { id: 'fecha', label: 'Un día exacto', hint: 'Su cumpleaños, el aniversario…' },
  { id: 'enDias', label: 'Dentro de unos días', hint: 'Una sorpresa para dentro de una semana' },
  { id: 'extranes', label: '"Ábrela cuando me extrañes"', hint: 'La puede abrir cuando quiera' },
  { id: 'triste', label: '"Ábrela si tienes un mal día"', hint: 'La puede abrir cuando quiera' },
];

// Preguntas sugeridas para el tablero de quien recibe.
export const QUESTION_IDEAS = [
  '¿Qué fue lo primero que te gustó de mí?', '¿Cuál es tu recuerdo favorito de los dos?',
  '¿Qué canción te recuerda a mí?', '¿A dónde quieres que viajemos?', '¿Qué es lo que más extrañas cuando no estoy?',
  '¿Cuándo supiste que me querías?',
];

// Objetos del cuarto que llevan una foto de los dos (etapa 4).
export const PHOTO_OBJECTS = [
  { id: 'marco', label: 'Portarretrato sobre la mesa' },
  { id: 'postal', label: 'Postal en la pared' },
  { id: 'taza', label: 'Taza estampada' },
  { id: 'cojin', label: 'Cojín estampado' },
];

// Una ficha nueva, con las tres situaciones rápidas ya escritas.
export function starterProfile() {
  const situations = {};
  for (const s of SITUATIONS) if (s.quick) situations[s.id] = [s.examples[0]];
  return { nickname: '', likes: {}, dates: [], situations, coupons: [], places: [], recipes: [], photoObjects: [], packs: [] };
}

let n = 0;
export const pid = (p = 'x') => `${p}${Date.now().toString(36)}${(n++).toString(36)}`;
