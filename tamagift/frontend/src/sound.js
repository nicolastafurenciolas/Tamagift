// ─────────────────────────────────────────────────────────────────
// Sonido del juego.
//
// Todo se SINTETIZA con WebAudio en el momento — ni un solo archivo de
// audio. Eso respeta la misma regla que la música (nada con licencia
// ajena), no pesa nada en la descarga y suena consistente en todos los
// dispositivos.
//
// Cada estilo visual tiene su "paquete" de timbre: el mismo repertorio
// (comer, monedas, ganar…) suena a consola de 8 bits en pixel, a teclado
// con eco y crujido de vinilo en lo-fi, a órgano funk en retro, a
// marimba y papel en papel, a sintetizador en neón y a burbujitas en
// sticker. Las melodías son las mismas; cambia el instrumento.
//
// Detalle importante de navegadores: el audio arranca bloqueado hasta
// que la persona toca la pantalla. Por eso `unlock()` se engancha al
// primer gesto y hasta entonces no se intenta sonar nada.
// ─────────────────────────────────────────────────────────────────

const MUTE_KEY = 'tamagift:muted';
const MASTER_GAIN = 0.28;

let ctx = null;
let master = null;
let echoIn = null;
let echoNodes = null;
let unlocked = false;
let muted = readMuted();

// ── Paquetes de timbre ───────────────────────────────────────────
// wave: forma de onda de la voz principal · octave: transposición ·
// env: estira o encoge las notas · cutoff: filtro paso bajo (null =
// sin filtro) · wah: barrido del filtro (funk) · echo: cantidad de eco ·
// chorus: desafinación en cents de una segunda voz · pluck: ataque de
// marimba (decay muy rápido + armónico) · bend: la nota arranca un poco
// más grave y sube (burbuja) · crackle: crujido de vinilo en lo largo ·
// rustle: el ruido suena a papel y no a agua.
const PACKS = {
  chip: { wave: 'square', octave: 1, env: 0.75, cutoff: null, wah: 0, echo: 0, chorus: 0, pluck: false, bend: 0, crackle: false, rustle: false, quantize: true },
  lofi: { wave: 'triangle', octave: 0.5, env: 1.6, cutoff: 1500, wah: 0, echo: 0.28, chorus: 7, pluck: false, bend: 0, crackle: true, rustle: false, quantize: false },
  funk: { wave: 'sawtooth', octave: 1, env: 1, cutoff: 1300, wah: 2600, echo: 0.1, chorus: 0, pluck: false, bend: 0, crackle: false, rustle: false, quantize: false },
  paper: { wave: 'sine', octave: 1, env: 0.9, cutoff: null, wah: 0, echo: 0.06, chorus: 0, pluck: true, bend: 0, crackle: false, rustle: true, quantize: false },
  synth: { wave: 'sawtooth', octave: 1, env: 1.2, cutoff: 3200, wah: 0, echo: 0.32, chorus: 12, pluck: false, bend: 0, crackle: false, rustle: false, quantize: false },
  bubbly: { wave: 'sine', octave: 2, env: 0.8, cutoff: null, wah: 0, echo: 0.04, chorus: 0, pluck: false, bend: 0.35, crackle: false, rustle: false, quantize: false },
};
let pack = PACKS.chip;
let packId = 'chip';

export function setSoundPack(id) {
  if (!PACKS[id]) return;
  pack = PACKS[id];
  packId = id;
  if (echoNodes) echoNodes.wet.gain.value = pack.echo;
}

export function getSoundPack() {
  return packId;
}

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = !!value;
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch (e) { /* modo privado — no es crítico */ }
  if (master) master.gain.value = muted ? 0 : MASTER_GAIN;
  return muted;
}

export function toggleMuted() {
  return setMuted(!muted);
}

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : MASTER_GAIN;
  master.connect(ctx.destination);

  // Bus de eco compartido: un retardo con realimentación. Cada paquete
  // decide cuánto se oye (pack.echo); en chip no se oye nada.
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.19;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  const wet = ctx.createGain();
  wet.gain.value = pack.echo;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2400;
  echoIn = ctx.createGain();
  echoIn.connect(delay);
  delay.connect(tone);
  tone.connect(feedback);
  feedback.connect(delay);
  tone.connect(wet);
  wet.connect(master);
  echoNodes = { delay, feedback, wet };
  return ctx;
}

// Se llama en el primer toque real de la persona. Antes de eso el
// navegador no deja sonar nada, así que ni lo intentamos.
export function unlock() {
  const c = ensureCtx();
  if (!c) return;
  // iOS vuelve a suspender el contexto al bloquear la pantalla o al
  // cambiar de app: por eso se reanuda en CADA gesto y no solo el primero.
  if (c.state === 'suspended' || c.state === 'interrupted') c.resume();
  unlocked = true;
}

export function installUnlock() {
  if (typeof window === 'undefined') return () => {};
  const handler = () => unlock();
  const events = ['pointerdown', 'keydown', 'touchstart'];
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
  return () => events.forEach((e) => window.removeEventListener(e, handler));
}

function ready() {
  const c = ensureCtx();
  return c && !muted && unlocked ? c : null;
}

function semitone(freq) {
  // En chip las notas caen en la escala temperada exacta: suena más a
  // consola que una frecuencia cualquiera.
  const n = Math.round(12 * Math.log2(freq / 440));
  return 440 * Math.pow(2, n / 12);
}

// Una nota con el timbre del paquete actual.
function note({ freq = 440, dur = 0.14, gain = 0.5, delay = 0, slide = 0, attack = 0.008, wave }) {
  const c = ready();
  if (!c) return;
  const p = pack;
  let f = freq * p.octave;
  if (p.quantize) f = semitone(f);
  const d = dur * p.env;
  const t0 = c.currentTime + delay;
  const end = t0 + d;

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  // La marimba (papel) muere casi enseguida; el resto se apaga al final.
  env.gain.exponentialRampToValueAtTime(p.pluck ? gain * 0.18 : gain * 0.6, t0 + (p.pluck ? d * 0.25 : d * 0.55));
  env.gain.exponentialRampToValueAtTime(0.0001, end);

  let out = env;
  if (p.cutoff) {
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = p.wah ? 7 : 0.7;
    filter.frequency.setValueAtTime(p.cutoff, t0);
    if (p.wah) {
      filter.frequency.linearRampToValueAtTime(p.cutoff + p.wah, t0 + d * 0.35);
      filter.frequency.linearRampToValueAtTime(p.cutoff, end);
    }
    env.connect(filter);
    out = filter;
  }
  out.connect(master);
  if (p.echo && echoIn) out.connect(echoIn);

  const voices = p.chorus ? [-p.chorus, p.chorus] : [0];
  voices.forEach((cents) => {
    const osc = c.createOscillator();
    osc.type = wave || p.wave;
    osc.detune.value = cents;
    const startF = p.bend ? f * (1 - p.bend) : f;
    osc.frequency.setValueAtTime(startF, t0);
    if (p.bend) osc.frequency.exponentialRampToValueAtTime(f, t0 + Math.min(0.06, d * 0.5));
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide * p.octave), end);
    const vGain = c.createGain();
    vGain.gain.value = voices.length > 1 ? 0.6 : 1;
    osc.connect(vGain);
    vGain.connect(env);
    osc.start(t0);
    osc.stop(end + 0.03);
  });

  // Armónico de marimba: le da el "toc" de madera.
  if (p.pluck) {
    const h = c.createOscillator();
    h.type = 'sine';
    h.frequency.setValueAtTime(f * 4, t0);
    const hg = c.createGain();
    hg.gain.setValueAtTime(gain * 0.35, t0);
    hg.gain.exponentialRampToValueAtTime(0.0001, t0 + d * 0.15);
    h.connect(hg);
    hg.connect(master);
    h.start(t0);
    h.stop(t0 + d * 0.2);
  }
}

// Ruido filtrado: agua, cepillado, papel, cosas sin tono definido.
function noise({ dur = 0.25, gain = 0.35, delay = 0, freq = 1200, q = 1.2, sweep = 0 }) {
  const c = ready();
  if (!c) return;
  const p = pack;
  const t0 = c.currentTime + delay;
  const frames = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  if (packId === 'chip') {
    // Ruido de consola: muestras repetidas en escalones, áspero.
    let v = 0;
    for (let i = 0; i < frames; i++) { if (i % 24 === 0) v = Math.random() * 2 - 1; data[i] = v; }
  } else if (p.rustle) {
    // Papel: ráfagas cortas, como hojas que se rozan.
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.3 ? 1 : 0.25);
  } else {
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  const f0 = p.rustle ? freq * 1.8 : packId === 'lofi' ? freq * 0.6 : freq;
  filter.frequency.setValueAtTime(f0, t0);
  filter.Q.value = q;
  if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(80, f0 + sweep), t0 + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(env);
  env.connect(master);
  if (p.echo && echoIn) env.connect(echoIn);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

// Crujido de vinilo encima de los sonidos largos en lo-fi.
function crackle(dur = 0.6) {
  if (!pack.crackle) return;
  const c = ready();
  if (!c) return;
  const t0 = c.currentTime;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() < 0.002 ? (Math.random() * 2 - 1) : 0;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = 0.5;
  src.connect(g);
  g.connect(master);
  src.start(t0);
}

// ── El repertorio ────────────────────────────────────────────────
const SOUNDS = {
  // toque a la mascota — dos notitas alegres
  tap: () => { note({ freq: 620, dur: 0.09, gain: 0.34 }); note({ freq: 880, dur: 0.11, gain: 0.3, delay: 0.06 }); },
  // mordisco
  eat: () => { note({ freq: 260, dur: 0.08, gain: 0.22, slide: -90, wave: pack.wave === 'sine' ? 'triangle' : undefined }); note({ freq: 200, dur: 0.09, gain: 0.2, delay: 0.09, slide: -70 }); },
  // le gustó la comida
  yum: () => { [523, 659, 784].forEach((f, i) => note({ freq: f, dur: 0.13, gain: 0.3, delay: i * 0.07 })); },
  // no le gustó
  yuck: () => { note({ freq: 320, dur: 0.18, gain: 0.2, slide: -140, wave: 'sawtooth' }); },
  // frotar la esponja
  scrub: () => noise({ dur: 0.16, gain: 0.16, freq: 1700, q: 0.9, sweep: -700 }),
  // chapuzón al terminar el baño
  splash: () => { noise({ dur: 0.5, gain: 0.3, freq: 900, q: 0.7, sweep: -600 }); [660, 880, 1100].forEach((f, i) => note({ freq: f, dur: 0.16, gain: 0.24, delay: 0.05 + i * 0.08 })); crackle(0.8); },
  // monedas
  coin: () => { note({ freq: 988, dur: 0.09, gain: 0.24 }); note({ freq: 1319, dur: 0.16, gain: 0.22, delay: 0.07 }); },
  // compra en la tienda
  buy: () => { [784, 1047, 1319].forEach((f, i) => note({ freq: f, dur: 0.14, gain: 0.28, delay: i * 0.06 })); crackle(0.5); },
  // acierto en un minijuego
  good: () => { note({ freq: 784, dur: 0.1, gain: 0.3 }); note({ freq: 1047, dur: 0.14, gain: 0.28, delay: 0.08 }); },
  // fallo
  bad: () => { note({ freq: 300, dur: 0.14, gain: 0.18, slide: -110, wave: pack.wave === 'sine' ? 'triangle' : pack.wave }); },
  // ganar un minijuego
  win: () => { [523, 659, 784, 1047].forEach((f, i) => note({ freq: f, dur: 0.2, gain: 0.3, delay: i * 0.1 })); crackle(1); },
  // toque de interfaz
  pop: () => note({ freq: 720, dur: 0.06, gain: 0.22 }),
  // colocar un objeto en el cuarto
  place: () => { note({ freq: 420, dur: 0.07, gain: 0.24 }); note({ freq: 560, dur: 0.09, gain: 0.2, delay: 0.05 }); },
  // cambio de pantalla
  swoosh: () => noise({ dur: 0.24, gain: 0.12, freq: 500, q: 0.6, sweep: 1400 }),
  // cambiar de estilo: un acorde que se abre
  style: () => { [392, 523, 659, 784].forEach((f, i) => note({ freq: f, dur: 0.26, gain: 0.22, delay: i * 0.05 })); },
};

/** Reproduce un efecto por nombre. Nunca lanza: si el navegador no deja
 *  sonar, el juego sigue igual. */
export function play(name) {
  try {
    const fn = SOUNDS[name];
    if (fn) fn();
  } catch (e) { /* el audio nunca puede romper el juego */ }
}

export const SOUND_NAMES = Object.keys(SOUNDS);
export const SOUND_PACKS = Object.keys(PACKS);
