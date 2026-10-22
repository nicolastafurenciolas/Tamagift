// ─────────────────────────────────────────────────────────────────
// Cómo se mueve cada estilo.
//
// La misma mascota respira distinto según el estilo: en pixel salta
// entre dos cuadros sin interpolar (como un sprite de consola), en
// papel se mueve a saltitos de stop motion, en neón titila, en retro
// rebota como caricatura de goma, en lo-fi respira despacio y en
// sticker tiembla como gelatina.
// ─────────────────────────────────────────────────────────────────

const PROFILES = {
  pixel: {
    idle: (mood) => `pg-pixel-bob ${mood === 'enojado' ? 0.5 : mood === 'feliz' ? 0.7 : 1}s infinite`,
    sway: () => 'none',
    poke: 'pg-pixel-bob 0.24s 3',
    particle: 'pg-pixel-float 1.1s steps(7, end) forwards',
    shadow: () => 'none',
    // En el cuarto: posición pegada a la rejilla de píxeles, sin
    // inclinarse al caminar (girar un sprite rompe los píxeles).
    walk: { grid: 5, tilt: 0, bob: 5, stepped: true, fps: 0 },
  },
  calm: {
    idle: (mood) => `pg-calm-breathe ${mood === 'enojado' ? 3 : 4.4}s ease-in-out infinite`,
    sway: (mood) => `pg-sway ${mood === 'enojado' ? 4 : 7}s ease-in-out infinite`,
    poke: 'pg-bounce 0.8s ease',
    particle: 'pg-float-up 1.8s ease-out forwards',
    shadow: (mood) => `pg-calm-breathe 4.4s ease-in-out infinite alternate-reverse`,
    walk: { grid: 0, tilt: 1.2, bob: 3, stepped: false, fps: 0 },
  },
  bouncy: {
    idle: (mood) => `pg-retro-bounce ${mood === 'feliz' ? 0.75 : mood === 'enojado' ? 0.55 : 1.1}s ease-in-out infinite`,
    sway: () => 'none',
    poke: 'pg-bounce 0.55s cubic-bezier(.34,1.56,.64,1)',
    particle: 'pg-float-up 1.1s cubic-bezier(.34,1.56,.64,1) forwards',
    shadow: (mood) => `pg-retro-bounce ${mood === 'feliz' ? 0.75 : 1.1}s ease-in-out infinite alternate-reverse`,
    walk: { grid: 0, tilt: 3, bob: 9, stepped: false, fps: 0 },
  },
  stopmotion: {
    idle: (mood) => `pg-stop-sway ${mood === 'enojado' ? 0.75 : 1.5}s steps(3, end) infinite`,
    sway: () => 'none',
    poke: 'pg-bounce 0.6s steps(5, end)',
    particle: 'pg-float-up 1.3s steps(8, end) forwards',
    shadow: () => 'none',
    // 8 cuadros por segundo, como una animación de papel de verdad.
    walk: { grid: 0, tilt: 2.5, bob: 4, stepped: false, fps: 8 },
  },
  neon: {
    idle: (mood) => `pg-breathe ${mood === 'enojado' ? 2 : 3}s ease-in-out infinite, pg-neon-flicker ${mood === 'enojado' ? 2.2 : 5.5}s linear infinite`,
    sway: (mood) => `pg-sway ${mood === 'enojado' ? 3 : 5}s ease-in-out infinite`,
    poke: 'pg-bounce 0.6s ease',
    particle: 'pg-float-up 1.25s ease-out forwards',
    shadow: () => 'none',
    walk: { grid: 0, tilt: 1.5, bob: 4, stepped: false, fps: 0 },
  },
  jelly: {
    idle: (mood) => `pg-jelly-idle ${mood === 'feliz' ? 1.6 : mood === 'enojado' ? 1 : 2.4}s ease-in-out infinite`,
    sway: (mood) => `pg-sway ${mood === 'enojado' ? 2.6 : 4.2}s ease-in-out infinite`,
    poke: 'pg-jelly 0.55s ease',
    particle: 'pg-float-up 1.25s ease-out forwards',
    shadow: (mood) => `pg-jelly-idle 2.4s ease-in-out infinite`,
    walk: { grid: 0, tilt: 2.2, bob: 6, stepped: false, fps: 0 },
  },
};

// Gestos cortos (comer, alegrarse con ropa nueva, decir que no,
// asustarse). En pixel solo se desplaza (escalar un sprite rompe los
// píxeles) y a saltos; en papel también a saltos; en el resto, suave.
const ACTS = {
  chew: { px: 'pg-px-chew 0.9s steps(6, end)', soft: 'pg-chew 0.9s ease-in-out' },
  hop: { px: 'pg-px-hop 0.7s steps(5, end)', soft: 'pg-hop 0.7s cubic-bezier(.34,1.56,.64,1)' },
  nope: { px: 'pg-px-nope 0.6s steps(6, end)', soft: 'pg-nope 0.6s ease-in-out' },
  startle: { px: 'pg-px-startle 0.8s steps(8, end)', soft: 'pg-startle 0.8s ease-out' },
};
for (const [id, p] of Object.entries(PROFILES)) {
  p.act = (name) => {
    const a = ACTS[name];
    if (!a) return 'none';
    if (id === 'pixel') return a.px;
    return id === 'stopmotion' ? a.soft.replace(/ (ease-in-out|ease-out|cubic-bezier\([^)]*\))$/, ' steps(6, end)') : a.soft;
  };
}

export function getMotion(id) {
  return PROFILES[id] || PROFILES.calm;
}
