// ─────────────────────────────────────────────────────────────────
// Física de "Salta y vuela", aparte del componente a propósito.
//
// El bucle del juego corre con requestAnimationFrame, que no se puede
// ejecutar en un entorno sin pantalla — así que si la lógica viviera
// dentro del componente no habría forma de comprobarla salvo jugando a
// ojo. Como función pura sí se puede probar de verdad (ver
// flyPhysics.test.mjs): gravedad, choques, puntaje y dificultad.
// ─────────────────────────────────────────────────────────────────

export const FLY = {
  W: 320,
  H: 400,
  GRAVITY: 1500,
  FLAP: -420,
  GAP: 132,          // hueco entre el tubo de arriba y el de abajo
  PIPE_W: 54,
  PET_X: 60,         // la mascota no avanza: el mundo pasa por ella
  PET_R: 18,         // radio VISUAL: de este tamaño se dibuja la mascota
  // Radio de CHOQUE, más chico que el visual a propósito. Con un solo
  // radio, rozar el tubo con el borde del dibujo ya mataba y el juego se
  // sentía injusto. Que la caja de choque sea menor que el sprite es lo
  // normal en este género: perdona los roces y deja que se sienta justo.
  HIT_R: 11,
  SPAWN_EVERY: 1.55, // segundos
  BASE_SPEED: 132,
  SPEED_PER_POINT: 4,
  MAX_EXTRA_SPEED: 90,
};

export function createFlyState() {
  return {
    petY: FLY.H / 2,
    vel: 0,
    pipes: [],
    spawnIn: 0,
    score: 0,
    dead: false,
    started: false,
  };
}

export function flapState(s) {
  if (s.dead) return s;
  s.started = true;
  s.vel = FLY.FLAP;
  return s;
}

// Avanza el mundo `dt` segundos. Muta y devuelve el mismo objeto: se
// llama una vez por cuadro y crear objetos nuevos 60 veces por segundo
// en un celular gama baja se nota.
//
// `spawnGapY` permite fijar el hueco en las pruebas en vez de depender
// del azar; en el juego real se pasa una función aleatoria.
export function stepFly(s, dt, spawnGapY = randomGapY) {
  if (!s.started || s.dead) return s;

  s.vel += FLY.GRAVITY * dt;
  s.petY += s.vel * dt;

  const speed = FLY.BASE_SPEED + Math.min(FLY.MAX_EXTRA_SPEED, s.score * FLY.SPEED_PER_POINT);

  s.spawnIn -= dt;
  if (s.spawnIn <= 0) {
    s.spawnIn = FLY.SPAWN_EVERY;
    s.pipes.push({ x: FLY.W + 20, gapY: spawnGapY(), scored: false });
  }

  for (const p of s.pipes) p.x -= speed * dt;
  s.pipes = s.pipes.filter((p) => p.x > -FLY.PIPE_W - 10);

  const petTop = s.petY - FLY.HIT_R;
  const petBottom = s.petY + FLY.HIT_R;

  for (const p of s.pipes) {
    // Punto al dejar atrás el tubo (su borde derecho pasó a la mascota).
    if (!p.scored && p.x + FLY.PIPE_W < FLY.PET_X - FLY.HIT_R) {
      p.scored = true;
      s.score += 1;
    }
    const overlapX = FLY.PET_X + FLY.HIT_R > p.x && FLY.PET_X - FLY.HIT_R < p.x + FLY.PIPE_W;
    if (overlapX && (petTop < p.gapY || petBottom > p.gapY + FLY.GAP)) s.dead = true;
  }

  if (petBottom > FLY.H || petTop < 0) s.dead = true;
  return s;
}

export function randomGapY() {
  return 70 + Math.random() * (FLY.H - FLY.GAP - 140);
}
