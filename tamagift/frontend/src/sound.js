// ─────────────────────────────────────────────────────────────────
// Sonido del juego.
//
// Todo se SINTETIZA con WebAudio en el momento — ni un solo archivo de
// audio. Eso respeta la misma regla que la música (nada con licencia
// ajena), no pesa nada en la descarga y suena consistente en todos los
// dispositivos.
//
// Detalle importante de navegadores: el audio arranca bloqueado hasta
// que la persona toca la pantalla. Por eso `unlock()` se engancha al
// primer gesto y hasta entonces no se intenta sonar nada.
// ─────────────────────────────────────────────────────────────────

const MUTE_KEY = 'tamagift:muted';

let ctx = null;
let master = null;
let unlocked = false;
let muted = readMuted();

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
  if (master) master.gain.value = muted ? 0 : 0.28;
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
  master.gain.value = muted ? 0 : 0.28;
  master.connect(ctx.destination);
  return ctx;
}

// Se llama en el primer toque real de la persona. Antes de eso el
// navegador no deja sonar nada, así que ni lo intentamos.
export function unlock() {
  if (unlocked) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  unlocked = true;
}

export function installUnlock() {
  if (typeof window === 'undefined') return () => {};
  const handler = () => unlock();
  const events = ['pointerdown', 'keydown', 'touchstart'];
  events.forEach((e) => window.addEventListener(e, handler, { once: false, passive: true }));
  return () => events.forEach((e) => window.removeEventListener(e, handler));
}

// Una nota: onda + envolvente. `slide` mueve el tono durante la nota.
function note({ freq = 440, dur = 0.14, type = 'sine', gain = 0.5, delay = 0, slide = 0, attack = 0.008 }) {
  const c = ensureCtx();
  if (!c || muted || !unlocked) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Ruido filtrado: para agua, cepillado, cosas sin tono definido.
function noise({ dur = 0.25, gain = 0.35, delay = 0, freq = 1200, q = 1.2, sweep = 0 }) {
  const c = ensureCtx();
  if (!c || muted || !unlocked) return;
  const t0 = c.currentTime + delay;
  const frames = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq, t0);
  filter.Q.value = q;
  if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(80, freq + sweep), t0 + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(env);
  env.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

// ── El repertorio ────────────────────────────────────────────────
const SOUNDS = {
  // toque a la mascota — dos notitas alegres
  tap: () => { note({ freq: 620, dur: 0.09, type: 'triangle', gain: 0.4 }); note({ freq: 880, dur: 0.11, type: 'triangle', gain: 0.34, delay: 0.06 }); },
  // mordisco
  eat: () => { note({ freq: 260, dur: 0.08, type: 'square', gain: 0.22, slide: -90 }); note({ freq: 200, dur: 0.09, type: 'square', gain: 0.2, delay: 0.09, slide: -70 }); },
  // le gustó la comida
  yum: () => { [523, 659, 784].forEach((f, i) => note({ freq: f, dur: 0.13, type: 'triangle', gain: 0.34, delay: i * 0.07 })); },
  // no le gustó
  yuck: () => { note({ freq: 320, dur: 0.18, type: 'sawtooth', gain: 0.22, slide: -140 }); },
  // frotar la esponja
  scrub: () => noise({ dur: 0.16, gain: 0.16, freq: 1700, q: 0.9, sweep: -700 }),
  // chapuzón al terminar el baño
  splash: () => { noise({ dur: 0.5, gain: 0.3, freq: 900, q: 0.7, sweep: -600 }); [660, 880, 1100].forEach((f, i) => note({ freq: f, dur: 0.16, type: 'sine', gain: 0.26, delay: 0.05 + i * 0.08 })); },
  // monedas
  coin: () => { note({ freq: 988, dur: 0.09, type: 'square', gain: 0.26 }); note({ freq: 1319, dur: 0.16, type: 'square', gain: 0.24, delay: 0.07 }); },
  // compra en la tienda
  buy: () => { [784, 1047, 1319].forEach((f, i) => note({ freq: f, dur: 0.14, type: 'triangle', gain: 0.3, delay: i * 0.06 })); },
  // acierto en un minijuego
  good: () => { note({ freq: 784, dur: 0.1, type: 'triangle', gain: 0.34 }); note({ freq: 1047, dur: 0.14, type: 'triangle', gain: 0.3, delay: 0.08 }); },
  // fallo
  bad: () => { note({ freq: 300, dur: 0.14, type: 'sawtooth', gain: 0.2, slide: -110 }); },
  // ganar un minijuego
  win: () => { [523, 659, 784, 1047].forEach((f, i) => note({ freq: f, dur: 0.2, type: 'triangle', gain: 0.34, delay: i * 0.1 })); },
  // toque de interfaz
  pop: () => note({ freq: 720, dur: 0.06, type: 'sine', gain: 0.24 }),
  // colocar un objeto en el cuarto
  place: () => { note({ freq: 420, dur: 0.07, type: 'sine', gain: 0.26 }); note({ freq: 560, dur: 0.09, type: 'sine', gain: 0.22, delay: 0.05 }); },
  // cambio de pantalla
  swoosh: () => noise({ dur: 0.24, gain: 0.13, freq: 500, q: 0.6, sweep: 1400 }),
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
