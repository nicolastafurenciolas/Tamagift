// ─────────────────────────────────────────────────────────────────
// Visitantes y sucesos de varios días (PLAN_REGALO_VIVO.md §2, etapa 3),
// como en Tomodachi Life: historias cortitas con personajes que vuelven
// (Tobi el cartero, Mimi la vecinita, un gato del barrio que poco a poco
// se hace amigo), que avanzan COMO MUCHO UN PASO POR DÍA.
//
// Reparto (regla 6 del plan):
//   · una sola historia activa a la vez (el cumpleaños de la mascota
//     puede pausar la que está en curso y después la retoma);
//   · como mucho un paso por día;
//   · el primer día de juego no empieza ninguna, y entre una historia y
//     la siguiente pasa al menos un día tranquilo;
//   · si hoy ya llegaron las sorpresas grandes de quien regala
//     (`bigToday` ≥ 2) no empieza una historia nueva (sí sigue la que va).
//
// Todo es puro y serializable (game.stories). El juego:
//   1. storyToday(stories, ctx)  → { stories, beat } | null   qué toca hoy
//   2. lo muestra (visitante en la puerta, la mascota, la planta…)
//   3. resolveStory(stories, choiceId, ctx) → { stories, result }
//   4. si el paso espera a quien regala (beat.giver = 'sopa'),
//      giverHelp(stories, 'sopa', ctx) cuando llega lo suyo.
//
//   game.stories = {
//     firstDay,                 primer día que se abrió el juego
//     active: { id, step, startDay, stepDay, beatDay, doneDay, data, told } | null,
//     paused: (igual que active) | null    la que pausó el cumpleaños
//     done: { [idHistoria]: día },         cuándo terminó cada una
//     lastEnd,                             día en que terminó la última
//     flags: { gatoNombre, gatoAmigo, plantaLugar, … }   memoria entre historias
//   }
// ─────────────────────────────────────────────────────────────────

import { fill } from './catalog.js';
import { todayKey } from '../gameState.js';
import { seeded, dayDiff, inSentence } from './life.js';

export const MAX_CHOICES = 2;
export const REST_DAYS = 1;          // días tranquilos entre historias
export const START_AFTER_DAYS = 1;   // la primera, desde el segundo día
export const BIG_LIMIT = 2;          // con tantas sorpresas grandes hoy, no empieza otra

// Los personajes que vuelven. El arte está en art/room/visitors.js
// (VISITOR_ART: 'cartero', 'vecinita', 'gato-timido' | 'gato-curioso' | 'gato-amigo').
export const CAST = {
  cartero: { id: 'cartero', name: 'Tobi', label: 'Tobi, el cartero' },
  vecinita: { id: 'vecinita', name: 'Mimi', label: 'Mimi, la vecinita' },
  gato: { id: 'gato', name: 'el gatito', label: 'El gato del barrio' },
};
export const CAT_NAMES = ['Canela', 'Pelusa', 'Michi', 'Tofu', 'Bigotes', 'Mango', 'Nube', 'Oreo', 'Miso', 'Café'];

export function emptyStories() {
  return { firstDay: null, active: null, paused: null, done: {}, lastEnd: null, flags: {} };
}
const S = (s) => ({ ...emptyStories(), ...(s || {}), done: { ...((s && s.done) || {}) }, flags: { ...((s && s.flags) || {}) } });

// ── Lo que las historias saben de la ficha ──────────────────────────
const likeOf = (profile, id) => {
  const v = profile && profile.likes && profile.likes[id];
  return v && String(v).trim() ? String(v).trim() : null;
};
function vars(ctx, st) {
  const profile = ctx.profile || {};
  const pet = ctx.pet || {};
  const names = ctx.names || {};
  const liked = (pet.food_preferences || []).filter((f) => f && f.preference === 'gusta' && f.food_name).map((f) => f.food_name);
  const low = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const flor = likeOf(profile, 'flor');
  const postre = likeOf(profile, 'postre');
  return {
    nombre: names.nombre || 'amor',
    yo: names.yo || 'quien te regaló esto',
    mascota: pet.name || 'tu mascota',
    gato: st.flags.gatoNombre || 'el gatito',
    Gato: st.flags.gatoNombre || 'El gatito',
    flor: flor ? inSentence(flor, 'flor') : null,
    Flor: flor ? flor.charAt(0).toUpperCase() + flor.slice(1) : null,
    animal: likeOf(profile, 'animal') ? inSentence(likeOf(profile, 'animal'), 'animal') : null,
    postre: postre ? inSentence(postre, 'postre') : liked[0] ? low(liked[0]) : null,
    comida: liked[0] ? low(liked[0]) : null,
    gatoAmigo: !!st.flags.gatoAmigo,
    conoceMimi: !!st.done.vecinita,
    conoceTobi: !!st.done.cartero,
    lovesCats: /gat|mich/i.test(likeOf(profile, 'animal') || ''),
    cumple: ctx.petBirthday ? 'cumple' : 'mes',
    data: (st.active && st.active.data) || {},
  };
}
const T = (x, v) => fill(typeof x === 'function' ? x(v) : x, { nombre: v.nombre, yo: v.yo })
  .replace(/\{mascota\}/g, v.mascota).replace(/\{gato\}/g, v.gato).replace(/\{Gato\}/g, v.Gato);

const florDecor = (flor) => (/tulip/i.test(flor || '') ? 'tulipanes' : /rosa/i.test(flor || '') ? 'rosas' : 'jarron');

// ── Las historias ───────────────────────────────────────────────────
// Paso: { id, who, place ('puerta' | 'cuarto' | 'ventana'), visitors?:
//   [{ id, pose? }], text, choices?: [{ id, label, reply, reward?, set?,
//   action? }], reward?, wait? (días desde el paso anterior; 1 por
//   defecto), prop?, giver? + fallbackAfter + helped + fallback }
// Recompensa: { coins?, decor?: { refId, label } } (si ya tiene el
// adorno, el juego da coinsIfOwned).
export const STORIES = [
  {
    id: 'vecinita', title: 'La vecinita nueva', prio: 3,
    steps: [
      {
        id: 'llega', who: 'vecinita', place: 'puerta', visitors: [{ id: 'vecinita' }],
        text: '¡Hola! Soy Mimi, me acabo de mudar al lado. Todavía tengo todo en cajas…',
        choices: [
          { id: 'saludar', label: 'Darle la bienvenida', reply: '¡Gracias! Qué cuarto tan acogedor tienen' },
          { id: 'galleta', label: 'Convidarle una galleta', reply: '¿Para mí? ¡Qué rica! Ya me caen bien', set: { mimiGalleta: true } },
        ],
      },
      {
        id: 'azucar', who: 'vecinita', place: 'puerta', visitors: [{ id: 'vecinita' }],
        text: (v) => (v.data.mimiGalleta
          ? '¡Hola otra vez! Tu galleta estaba riquísima… ¿me prestan una tacita de azúcar? Estoy haciendo un pastel'
          : 'Perdón la molestia… ¿me prestan una tacita de azúcar? Estoy haciendo un pastel'),
        choices: [
          { id: 'azucar', label: 'Prestarle azúcar', reply: '¡Mil gracias! Mañana les cuento cómo me quedó' },
          { id: 'ayudar', label: 'Ayudarla a hornear', reply: '¡Así da gusto cocinar! Huele riquísimo' },
        ],
      },
      {
        id: 'gracias', who: 'vecinita', place: 'puerta', visitors: [{ id: 'vecinita' }],
        text: (v) => (v.animal
          ? `¡Les traje un pedazo del pastel! Y un dibujito de ${v.animal}: me contaron que te encantan`
          : '¡Les traje un pedazo del pastel! Me alegra mucho tenerlos de vecinos'),
        reward: { coins: 30 },
        choices: [{ id: 'gracias', label: '¡Gracias, Mimi!', reply: 'Cuando quieran, aquí estoy al lado' }],
      },
    ],
  },
  {
    id: 'cartero', title: 'Tobi, el cartero', prio: 3,
    steps: [
      {
        id: 'llega', who: 'cartero', place: 'puerta', visitors: [{ id: 'cartero' }],
        text: '¡Correo! Ah, perdón: soy Tobi, el cartero nuevo. ¿Aquí vive {nombre}? Me dijeron que a esta casa llegan cartas muy bonitas',
        choices: [
          { id: 'saludar', label: 'Saludarlo', reply: '¡Un gusto! Nos vamos a ver seguido' },
          { id: 'agua', label: 'Ofrecerle agua', reply: '¡Uf, gracias! Repartir da mucha sed' },
        ],
      },
      {
        id: 'bolso', who: 'cartero', place: 'puerta', visitors: [{ id: 'cartero' }],
        text: '¡Ay, no! Se me descosió el bolso y se volaron las cartas por todo el jardín…',
        choices: [
          { id: 'juntar', label: 'Ayudarle a juntarlas', reply: '¡Están todas! Me salvaste el día', reward: { coins: 20 } },
          { id: 'coser', label: 'Coserle el bolso', reply: '¡Quedó como nuevo! Y con un corazoncito y todo' },
        ],
      },
      {
        id: 'postal', who: 'cartero', place: 'puerta', visitors: [{ id: 'cartero' }],
        text: 'Les traje una postal de la oficina. Dicen que esta es la casa con más cartas de cariño del barrio… {yo} escribe mucho, ¿eh?',
        reward: { coins: 40 },
        choices: [{ id: 'gracias', label: '¡Gracias, Tobi!', reply: 'Hasta la próxima carta' }],
      },
    ],
  },
  {
    id: 'gato', title: 'El gato del barrio', prio: 2,
    start: (st, v, ctx, rnd) => {
      const pool = [...CAT_NAMES];
      const a = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
      const b = pool[Math.floor(rnd() * pool.length)];
      return { names: [a, b] };
    },
    steps: [
      {
        id: 'asoma', who: 'gato', place: 'puerta', visitors: [{ id: 'gato', pose: 'timido' }],
        text: (v) => (v.lovesCats ? 'Psst… hay un gatito en la puerta, como los que tanto te gustan. Se esconde apenas lo miras' : 'Psst… hay un gatito en la puerta. Se esconde apenas lo miras'),
        choices: [
          { id: 'leche', label: 'Dejarle un platito', reply: 'Mañana vemos si se lo comió', set: { gatoPlato: true } },
          { id: 'calma', label: 'Dejarlo tranquilo', reply: 'Quizás vuelva cuando tenga más confianza' },
        ],
      },
      {
        id: 'nombre', who: 'gato', place: 'puerta', visitors: [{ id: 'gato', pose: 'curioso' }],
        text: (v) => (v.data.gatoPlato ? '¡Volvió el gatito y el platito está vacío! Ya no se esconde tanto. ¿Le ponemos nombre?' : '¡Volvió el gatito! Ya no se esconde tanto. ¿Le ponemos nombre?'),
        choices: (v) => (v.data.names || ['Canela', 'Pelusa']).slice(0, 2).map((n) => ({ id: `nombre:${n}`, label: n, reply: `¡${n}! Le encantó, mira cómo mueve la cola`, set: { gatoNombre: n } })),
      },
      {
        id: 'caricia', who: 'gato', place: 'cuarto', visitors: [{ id: 'gato', pose: 'curioso' }],
        text: '{Gato} entró al cuarto y se dejó acariciar la cabecita. ¡Ronronea como un motorcito!',
        choices: [
          { id: 'mimos', label: 'Hacerle mimos', reply: 'Prrr… prrr… creo que se quiere quedar un rato' },
          { id: 'croqueta', label: 'Darle una croqueta', reply: '¡Ñam! Se la comió en un segundo' },
        ],
      },
      {
        id: 'amigo', who: 'gato', place: 'cuarto', visitors: [{ id: 'gato', pose: 'amigo' }],
        text: (v) => `{Gato} te trajo un regalo: ${v.flor ? `una flor del jardín… ¡${v.flor}!` : 'una florcita del jardín.'} Creo que ya somos amigos`,
        reward: { decor: { refId: 'cojinGato', label: 'Cojín de gatito' }, coinsIfOwned: 40 },
        set: { gatoAmigo: true },
        choices: [{ id: 'abrazo', label: 'Darle un abrazo', reply: '{Gato} ahora viene a visitarnos cuando quiere' }],
      },
    ],
  },
  {
    id: 'resfriado', title: 'Un resfriado', prio: 1, minDays: 6, repeatAfter: 45,
    steps: [
      {
        id: 'achis', who: 'mascota', place: 'cuarto', mood: 'triste',
        text: '¡Achís! Creo que me resfrié… tengo la nariz roja y frío en las orejitas',
        choices: [
          { id: 'manta', label: 'Darle una mantita', reply: 'Gracias… así se está mucho mejor' },
          { id: 'te', label: 'Prepararle un té', reply: 'Mmm, con miel… ya me siento un poquito mejor' },
        ],
      },
      {
        id: 'sopa', who: 'mascota', place: 'cuarto', mood: 'triste',
        giver: 'sopa', fallbackAfter: 2,
        text: 'Sigo con mocos… Una sopita me curaría seguro. ¿Le cuentas a {yo}?',
        choices: [{ id: 'avisar', label: 'Contarle a {yo}', reply: '¡Gracias! A ver si me manda algo calentito', action: 'tellGiver' }],
        helped: '¡{yo} me mandó sopa! Con esto me curo seguro. Dile que gracias de mi parte',
        fallback: (v) => (v.conoceMimi ? 'Mimi supo de mi resfriado y me trajo sopa de su casa. ¡Qué buena vecina!' : 'Me preparé una sopita con lo que había… ¡y funcionó!'),
      },
      {
        id: 'sano', who: 'mascota', place: 'cuarto', mood: 'feliz',
        text: (v) => (v.data.helped === 'giver' ? '¡Ya estoy bien! La sopa de {yo} y tus cuidados hacen magia' : '¡Ya estoy bien! Gracias por cuidarme tanto'),
        reward: { decor: { refId: 'taza', label: 'Taza humeante' }, coinsIfOwned: 30 },
        choices: [{ id: 'yay', label: '¡Qué alegría!', reply: '¡A jugar se ha dicho!' }],
      },
    ],
  },
  {
    id: 'planta', title: 'La semillita', prio: 2, requiresAny: ['vecinita', 'cartero'],
    steps: [
      {
        id: 'semilla', who: 'mascota', place: 'cuarto', prop: { id: 'planta', stage: 0 },
        text: (v) => `${v.conoceMimi ? 'Mimi' : 'Tobi'} me regaló unas semillitas${v.flor ? ` de ${v.flor}` : ' sorpresa'}. ¿Dónde las plantamos?`,
        choices: [
          { id: 'ventana', label: 'Junto a la ventana', reply: 'Ahí les va a dar el sol. ¡Crezcan, semillitas!', set: { plantaLugar: 'ventana' } },
          { id: 'maceta', label: 'En una macetita', reply: 'Listo, con tierra blandita y un poco de agua', set: { plantaLugar: 'maceta' } },
        ],
      },
      {
        id: 'brote', who: 'mascota', place: 'cuarto', prop: { id: 'planta', stage: 1 },
        text: '¡Salió un brotecito! Es chiquitito, hay que cuidarlo',
        choices: [
          { id: 'regar', label: 'Regarlo', reply: 'Glu glu… ¡qué contento se ve!' },
          { id: 'cantar', label: 'Cantarle', reply: 'Dicen que a las plantas les gusta la música ♪' },
        ],
      },
      {
        id: 'capullo', who: 'mascota', place: 'cuarto', prop: { id: 'planta', stage: 2 }, wait: 2,
        text: 'Mira: ya tiene hojitas… ¡y un capullo!',
        choices: [
          { id: 'regar', label: 'Regarlo', reply: 'Falta poquito, lo presiento' },
          { id: 'sol', label: 'Ponerlo al sol', reply: 'Un ratito de sol y a dormir' },
        ],
      },
      {
        id: 'flor', who: 'mascota', place: 'cuarto', prop: { id: 'planta', stage: 3 },
        text: (v) => (v.Flor ? `¡Floreció! ${v.Flor}… tu flor favorita. ¿Ves? Las cosas lindas crecen con cariño` : '¡Floreció! ¿Ves? Las cosas lindas crecen con cariño'),
        reward: (v) => ({ decor: { refId: florDecor(v.flor), label: 'Flores en florero' }, coinsIfOwned: 40 }),
        choices: [{ id: 'oler', label: 'Olerla', reply: 'Mmm… huele a primavera' }],
      },
    ],
  },
  {
    // El cumpleaños de la mascota: con `petBirthday` ('MM-DD' o
    // 'AAAA-MM-DD'), cada año la víspera y el día; si no, cuando cumple
    // un mes con quien recibe (una vez).
    id: 'cumple', title: 'El cumpleaños', prio: 9, urgent: true,
    steps: [
      {
        id: 'vispera', who: 'mascota', place: 'cuarto', mood: 'feliz',
        text: (v) => (v.cumple === 'cumple' ? '¿Sabes qué? ¡Mañana es mi cumpleaños! Shhh, que es secreto' : '¿Sabes qué? Mañana cumplo un mes contigo. Shhh, que es secreto'),
        choices: [
          { id: 'festejar', label: '¡Hay que celebrarlo!', reply: '¡Sí! Me voy a poner mi mejor sonrisa' },
          { id: 'secreto', label: 'Guardar el secreto', reply: 'Gracias… aunque creo que Mimi ya sabe algo' },
        ],
      },
      {
        id: 'fiesta', who: 'mascota', place: 'cuarto', mood: 'feliz',
        visitors: (v) => [{ id: 'vecinita' }, { id: 'cartero' }, ...(v.gatoAmigo ? [{ id: 'gato', pose: 'amigo' }] : [])],
        text: (v) => {
          const quien = [v.conoceMimi && 'Mimi', v.conoceTobi && 'Tobi', v.gatoAmigo && v.gato].filter(Boolean);
          const llegan = quien.length ? `${quien.length > 1 ? `${quien.slice(0, -1).join(', ')} y ${quien[quien.length - 1]}` : quien[0]} ${quien.length > 1 ? 'llegaron' : 'llegó'} con ${v.postre ? `${v.postre} y velitas` : 'un pastel con velitas'}` : `¡Hay ${v.postre ? `${v.postre} con velitas` : 'pastel con velitas'}!`;
          return `¡Sorpresa! ${llegan}. ${v.cumple === 'cumple' ? '¡Feliz cumpleaños a mí!' : '¡Un mes juntos!'} {yo} me eligió para acompañarte, y tú eres mi mejor regalo`;
        },
        reward: { coins: 50, decor: { refId: 'regalos', label: 'Pila de regalos' }, coinsIfOwned: 30 },
        choices: [
          { id: 'deseo', label: 'Pedir un deseo', reply: 'Cerré los ojos y pedí… no te digo, si no no se cumple' },
          { id: 'velas', label: 'Soplar las velas', reply: '¡Fuuu! Todas de un soplido' },
        ],
      },
    ],
  },
  {
    id: 'paraguas', title: 'El paraguas', prio: 4, requires: ['vecinita'], weather: 'lluvia', repeatAfter: 40,
    steps: [
      {
        id: 'empapada', who: 'vecinita', place: 'puerta', visitors: [{ id: 'vecinita' }],
        text: '¡Brrr! Me agarró la lluvia sin paraguas… ¿me dejan pasar un ratito?',
        choices: [
          { id: 'prestar', label: 'Prestarle un paraguas', reply: '¡Me salvaste! Te lo devuelvo mañana' },
          { id: 'secar', label: 'Invitarla a secarse', reply: 'Qué rico está aquí adentro… gracias' },
        ],
      },
      {
        id: 'devuelve', who: 'vecinita', place: 'puerta', visitors: [{ id: 'vecinita' }],
        text: 'Vine a darles las gracias por lo de ayer… ¡con muffins recién hechos!',
        reward: { coins: 25 },
        choices: [{ id: 'gracias', label: '¡Qué ricos!', reply: 'Los hice pensando en ustedes' }],
      },
    ],
  },
  {
    // Una carta de quien regala (una de sus frases) que se "perdió" y
    // aparece gracias al gato: el regalo sigue hablando de quien regala.
    id: 'carta', title: 'La carta perdida', prio: 2, requires: ['cartero', 'gato'],
    needs: (ctx) => giverPhrases(ctx).length > 0,
    start: (st, v, ctx, rnd) => { const ph = giverPhrases(ctx); return { letter: ph[Math.floor(rnd() * ph.length)] }; },
    steps: [
      {
        id: 'perdida', who: 'cartero', place: 'puerta', visitors: [{ id: 'cartero' }],
        text: '¡Juraría que traía una carta para {nombre}! Se me debe haber caído en el camino…',
        choices: [
          { id: 'buscar', label: 'Ayudarle a buscar', reply: 'Gracias… si aparece, te la traigo volando' },
          { id: 'calma', label: 'No te preocupes', reply: 'Eres un amor. Seguiré buscando' },
        ],
      },
      {
        id: 'aparece', who: 'gato', place: 'puerta', visitors: [{ id: 'gato', pose: 'amigo' }],
        text: '¡{Gato} encontró la carta debajo de un arbusto y la trajo en la boca! Es de {yo}…',
        letter: true,
        reward: { coins: 30 },
        choices: [{ id: 'leer', label: 'Leer la carta', reply: '¡Qué bonito! {Gato} merece un premio' }],
      },
    ],
  },
];
const BY_ID = Object.fromEntries(STORIES.map((s) => [s.id, s]));

function giverPhrases(ctx) {
  return ((ctx.pet && ctx.pet.phrases) || []).filter((p) => p && p.text && (p.category === 'positiva' || p.category === 'casual')).map((p) => String(p.text));
}

// ── Cuándo puede empezar cada una ──────────────────────────────────
function birthdayOffset(petBirthday, date) {
  // días que faltan para el cumpleaños (0 = hoy, 1 = mañana), o null
  const m = /(\d{2})-(\d{2})$/.exec(String(petBirthday || ''));
  if (!m) return null;
  const mm = Number(m[1]) - 1, dd = Number(m[2]);
  const t0 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  for (const y of [date.getFullYear(), date.getFullYear() + 1]) {
    const t = Date.UTC(y, mm, dd);
    const diff = Math.round((t - t0) / 86400000);
    if (diff >= 0) return diff;
  }
  return null;
}

function eligible(story, st, ctx, today) {
  const done = st.done[story.id];
  if (done && !(story.repeatAfter && dayDiff(done, today) >= story.repeatAfter)) {
    if (story.id !== 'cumple' || !ctx.petBirthday || dayDiff(done, today) < 300) return false;
  }
  if (story.requires && !story.requires.every((id) => st.done[id])) return false;
  if (story.requiresAny && !story.requiresAny.some((id) => st.done[id])) return false;
  if (story.minDays && dayDiff(st.firstDay, today) < story.minDays) return false;
  if (story.weather && ctx.weather !== story.weather) return false;
  if (story.needs && !story.needs(ctx)) return false;
  if (story.id === 'cumple') {
    if (ctx.petBirthday) { const off = birthdayOffset(ctx.petBirthday, ctx.date); return off === 0 || off === 1; }
    return dayDiff(st.firstDay, today) >= 29;
  }
  return true;
}

function readCtx(ctx = {}) {
  const now = ctx.now ?? (ctx.date ? ctx.date.getTime() : Date.now());
  const date = ctx.date || new Date(now);
  return { ...ctx, now, date, today: todayKey(date) };
}

// El paso de hoy, listo para mostrar.
function beatOf(st, ctx) {
  const a = st.active;
  const story = BY_ID[a.id];
  const step = story.steps[a.step];
  const v = vars(ctx, st);
  const waiting = !!step.giver && !a.helped;
  const fallbackNow = waiting && step.fallbackAfter && dayDiff(a.stepDay, ctx.today) >= step.fallbackAfter;
  let text = T(step.text, v);
  let choices = typeof step.choices === 'function' ? step.choices(v) : (step.choices || []);
  if (fallbackNow) { text = T(step.fallback, v); choices = [{ id: 'ok', label: '¡Qué bueno!' }]; }
  else if (waiting && a.told) choices = [];
  const visitors = typeof step.visitors === 'function' ? step.visitors(v) : (step.visitors || []);
  return {
    key: `${story.id}:${step.id}:${a.startDay}`,
    storyId: story.id, stepId: step.id, title: story.title,
    index: a.step, of: story.steps.length, last: a.step === story.steps.length - 1,
    who: step.who, place: step.place || 'cuarto', mood: step.mood || null,
    visitors, prop: step.prop ? { ...step.prop, flor: v.flor } : null,
    text,
    choices: choices.slice(0, MAX_CHOICES).map((c) => ({ id: c.id, label: T(c.label, v), ...(c.action ? { action: c.action } : {}) })),
    giver: waiting && !fallbackNow ? step.giver : null,
    waiting: waiting && !fallbackNow,
    ...(step.letter && a.data.letter ? { letter: { text: a.data.letter, from: v.yo } } : {}),
  };
}

const startActive = (id, today, data = {}, step = 0) => ({ id, step, startDay: today, stepDay: today, beatDay: null, doneDay: null, data, told: false, helped: null });

// ¿Qué toca hoy? Devuelve { stories, beat } o null.
//   ctx = {
//     now, date,
//     pet, profile, names: { nombre, yo },   para los textos
//     weather,                               'sol' | 'nublado' | 'lluvia' | 'nieve'
//     bigToday?,                             sorpresas grandes de quien regala hoy (engine.js: personal.big)
//     busy?,                                 hay otra cosa en pantalla: hoy no (todavía)
//     petBirthday?,                          'MM-DD' o 'AAAA-MM-DD' (cumpleaños de la mascota)
//     seed?, rnd?
//   }
// Mientras el paso de hoy no se resuelva, devuelve el mismo beat (se
// puede volver a mostrar). Ya resuelto, hoy no toca nada más.
export function storyToday(stories, ctx = {}) {
  const c = readCtx(ctx);
  let st = S(stories);
  if (!st.firstDay) st = { ...st, firstDay: c.today };
  if (c.busy) return { stories: st, beat: null };
  const rnd = c.rnd || seeded(`${c.seed ?? ''}|${c.today}|historia`);

  // el cumpleaños pausa lo que esté en curso (y no espera descanso)
  const cumple = BY_ID.cumple;
  if ((!st.active || st.active.id !== 'cumple') && eligible(cumple, st, c, c.today) && !(st.active && st.active.doneDay === c.today) && !(st.active && st.active.beatDay === c.today)) {
    const off = c.petBirthday ? birthdayOffset(c.petBirthday, c.date) : 1;
    st = { ...st, paused: st.active || st.paused, active: startActive('cumple', c.today, {}, off === 0 ? 1 : 0) };
  }

  if (st.active) {
    const a = st.active;
    const story = BY_ID[a.id];
    if (!story) return { stories: { ...st, active: null }, beat: null };
    // ya pasó lo de hoy
    if (a.doneDay === c.today) return { stories: st, beat: null };
    const step = story.steps[a.step];
    const wait = step.wait ?? 1;
    if (a.doneDay && dayDiff(a.doneDay, c.today) < wait) return { stories: st, beat: null };
    let active = a;
    if (a.doneDay) active = { ...a, stepDay: c.today, doneDay: null, told: false, helped: null };
    active = { ...active, beatDay: c.today };
    st = { ...st, active };
    return { stories: st, beat: beatOf(st, c) };
  }

  // retomar la que pausó el cumpleaños
  if (st.paused) {
    st = { ...st, active: { ...st.paused, beatDay: null }, paused: null };
    if (st.active.doneDay === c.today) return { stories: st, beat: null };
    return storyToday(st, { ...ctx, rnd });
  }

  // empezar una nueva
  const none = { stories: st, beat: null };
  if (dayDiff(st.firstDay, c.today) < START_AFTER_DAYS) return none;
  if (st.lastEnd && dayDiff(st.lastEnd, c.today) <= REST_DAYS) return none;
  if ((c.bigToday || 0) >= BIG_LIMIT) return none;
  const pool = STORIES.filter((s) => s.id !== 'cumple' && eligible(s, st, c, c.today));
  if (!pool.length) return none;
  // las de presentación (prio ≥ 3) van primero; las demás, al azar
  // con su peso
  const top = Math.max(...pool.map((s) => s.prio || 1));
  const best = top >= 3 ? pool.filter((s) => (s.prio || 1) === top) : pool;
  const total = best.reduce((n, s) => n + (top >= 3 ? 1 : s.prio || 1), 0);
  let r = rnd() * total, story = best[best.length - 1];
  for (const s of best) { if ((r -= top >= 3 ? 1 : s.prio || 1) <= 0) { story = s; break; } }
  const data = story.start ? story.start(st, vars(c, st), c, rnd) : {};
  st = { ...st, active: { ...startActive(story.id, c.today, data), beatDay: c.today } };
  return { stories: st, beat: beatOf(st, c) };
}

function reward(step, choice, v) {
  const a = typeof step.reward === 'function' ? step.reward(v) : step.reward;
  const b = choice && (typeof choice.reward === 'function' ? choice.reward(v) : choice.reward);
  if (!a && !b) return null;
  const out = { ...(a || {}), ...(b || {}) };
  if (a && b && a.coins && b.coins) out.coins = a.coins + b.coins;
  return out;
}

// La persona eligió (o tocó el único botón). Devuelve
// { stories, result: { reply, reward, action, done, storyDone, log } } o null.
//   · action 'tellGiver': el juego le avisa a quien regala (el paso
//     sigue esperando su sopa).
//   · storyDone: terminó la historia.
export function resolveStory(stories, choiceId, ctx = {}) {
  const c = readCtx(ctx);
  let st = S(stories);
  const a = st.active;
  if (!a || a.doneDay === c.today) return null;
  const story = BY_ID[a.id];
  const step = story.steps[a.step];
  const v = vars(c, st);
  const waiting = !!step.giver && !a.helped;
  const fallbackNow = waiting && step.fallbackAfter && dayDiff(a.stepDay || c.today, c.today) >= step.fallbackAfter;
  const choices = typeof step.choices === 'function' ? step.choices(v) : (step.choices || []);
  let choice = choices.find((x) => x.id === choiceId) || null;
  if (fallbackNow) choice = { id: 'ok', reply: '' };
  if (!choice && choices.length) choice = choices[0];

  // contarle a quien regala: no avanza, sigue esperando
  if (waiting && !fallbackNow) {
    if (a.told) return null;
    st = { ...st, active: { ...a, told: true } };
    return { stories: st, result: { reply: T(choice ? choice.reply : '', v), reward: null, action: (choice && choice.action) || null, done: false, storyDone: false, log: null } };
  }

  const set = { ...(step.set || {}), ...((choice && choice.set) || {}) };
  const data = { ...a.data, ...Object.fromEntries(Object.entries(set).map(([k, val]) => [k, val])), ...(fallbackNow ? { helped: 'fallback' } : {}) };
  const flags = { ...st.flags, ...set };
  const rw = reward(step, choice, { ...v, data });
  const last = a.step >= story.steps.length - 1;
  const reply = T(choice && choice.reply ? choice.reply : '', { ...vars(c, { ...st, flags }), data });
  const log = { type: 'historia', storyId: story.id, stepId: step.id, title: story.title, last, who: step.who, text: beatOf(st, c).text, ...(flags.gatoNombre ? { gato: flags.gatoNombre } : {}) };
  if (last) {
    st = { ...st, flags, active: null, done: { ...st.done, [story.id]: c.today }, lastEnd: c.today };
    // si el cumpleaños pausó otra, mañana sigue esa (hoy ya hubo paso)
    if (st.paused) st = { ...st, paused: { ...st.paused, doneDay: c.today } };
  } else {
    st = { ...st, flags, active: { ...a, data, step: a.step + 1, doneDay: c.today, told: false, helped: null } };
  }
  return { stories: st, result: { reply, reward: rw, action: (choice && choice.action) || null, done: true, storyDone: last, log } };
}

// Llegó lo de quien regala para el paso que lo espera (la sopa). Lo
// resuelve en el acto (aunque hoy ya haya habido paso: es su regalo) y
// devuelve la frase de la mascota. { stories, helped, text, log }.
export function giverHelp(stories, kind, ctx = {}) {
  const c = readCtx(ctx);
  let st = S(stories);
  const a = st.active;
  const step = a && BY_ID[a.id] && BY_ID[a.id].steps[a.step];
  // solo si el paso ya se mostró y sigue esperando (el rincón lo ofrece
  // recién entonces, ver giverRequest)
  if (!step || step.giver !== kind || a.helped || a.doneDay) return { stories: st, helped: false, text: null, log: null };
  const v = vars(c, st);
  const story = BY_ID[a.id];
  st = { ...st, active: { ...a, helped: 'giver', data: { ...a.data, helped: 'giver' }, step: a.step + 1, doneDay: c.today, told: false } };
  const text = T(step.helped, v);
  return { stories: st, helped: true, text, log: { type: 'historia', storyId: story.id, stepId: step.id, title: story.title, giver: true, text } };
}

// Lo que el rincón de quien regala puede ofrecer ahora ("Mandarle sopa").
// Ojo: game.stories vive en el dispositivo de quien recibe; para que el
// rincón lo sepa, el juego tiene que contarlo (ver el informe).
export function giverRequest(stories, ctx = {}) {
  const st = S(stories);
  const a = st.active;
  const step = a && BY_ID[a.id] && BY_ID[a.id].steps[a.step];
  if (!step || !step.giver || a.helped || a.doneDay) return null;
  const v = vars(readCtx(ctx), st);
  return {
    storyId: a.id, stepId: step.id, kind: step.giver, since: a.stepDay,
    label: GIVER_ASK[step.giver].label,
    note: T(GIVER_ASK[step.giver].note, v),
    payload: { story: step.giver },
  };
}
export const GIVER_ASK = {
  sopa: { label: 'Mandarle sopa', note: '{mascota} tiene un resfriado y dice que una sopita de {yo} lo cura todo' },
};

// Para el rincón o una página de pruebas: en qué va cada cosa.
export function storyStatus(stories) {
  const st = S(stories);
  const a = st.active;
  return {
    active: a ? { id: a.id, title: BY_ID[a.id].title, step: a.step, of: BY_ID[a.id].steps.length } : null,
    paused: st.paused ? st.paused.id : null,
    done: Object.keys(st.done),
    flags: st.flags,
  };
}
