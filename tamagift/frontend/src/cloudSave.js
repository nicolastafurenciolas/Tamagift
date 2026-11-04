// ─────────────────────────────────────────────────────────────────
// La partida copiada al servidor.
//
// La partida se sigue guardando primero en el dispositivo (así el juego
// abre al toque y funciona sin señal), pero además se manda al servidor:
// antes, si quien recibió el regalo cambiaba de celular o borraba los
// datos del navegador, perdía las monedas, el cuarto y todo lo comprado.
//
// - Se manda como mucho cada 30 s mientras se juega, y siempre al
//   esconder o cerrar la pestaña.
// - El servidor numera cada guardado (`rev`). Cada dispositivo recuerda
//   el último número que conoce y si hay cambios suyos sin subir
//   (`dirty`), en `tamagift:sync:<slug>`.
// - Si otro dispositivo guardó entre medio, gana el último cambio hecho
//   a mano (`savedAt`). Lo que cambia con la pestaña escondida (solo
//   pasa el tiempo: bajan las barras) no cuenta como cambio: si no, un
//   celular olvidado con el juego abierto pisaría lo que se jugó en el
//   otro.
// ─────────────────────────────────────────────────────────────────

const META_KEY = (slug) => `tamagift:sync:${slug}`;

function browserStorage() {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
}

export function loadSyncMeta(slug, hadLocal, storage = browserStorage()) {
  try {
    const raw = storage && storage.getItem(META_KEY(slug));
    if (raw) return { rev: 0, dirty: false, savedAt: 0, ...JSON.parse(raw) };
  } catch (e) { /* sigue abajo */ }
  // Una partida de antes de que existiera el guardado en el servidor
  // cuenta como cambios sin subir, pero sin hora (ver resolveSave).
  return { rev: 0, dirty: !!hadLocal, savedAt: 0 };
}

function saveSyncMeta(slug, meta, storage = browserStorage()) {
  try { if (storage) storage.setItem(META_KEY(slug), JSON.stringify(meta)); } catch (e) { /* no es grave */ }
}

// Cuánto se ha jugado, para desempatar dos partidas sin hora.
export function progressScore(s) {
  if (!s) return 0;
  const n = (a) => (Array.isArray(a) ? a.length : 0);
  const owned = n(s.ownedDecor) + n(s.ownedPosters) + n(s.ownedOutfits) + n(s.ownedFurniture)
    + n(s.ownedWear) + n(s.ownedHair) + n(s.ownedHairColors) + n(s.ownedWalls) + n(s.ownedFloors);
  const stars = Object.values(s.progress || {}).reduce((t, p) => t + Object.values((p && p.stars) || {}).reduce((a, b) => a + (b || 0), 0), 0);
  return (s.coins || 0) + owned * 60 + n(s.placed) * 10 + stars * 15;
}

// Qué partida queda cuando el servidor contesta. `remote` es
// { data, rev, saved_at }. Devuelve { use: 'local' | 'remote', push }.
export function resolveSave(meta, remote, local) {
  if (!remote) return { use: 'local', push: false };
  if (!remote.data) return { use: 'local', push: true };                 // nadie guardó todavía
  if (remote.rev === meta.rev) return { use: 'local', push: !!meta.dirty };
  if (remote.rev < meta.rev) return { use: 'local', push: true };        // el servidor perdió datos
  if (!meta.dirty) return { use: 'remote', push: false };                // se jugó en otro dispositivo
  // Los dos cambiaron: gana el cambio más reciente. Sin hora (partidas
  // de antes), la que tiene más jugado.
  const mine = meta.savedAt || 0;
  const theirs = remote.saved_at || 0;
  const localWins = mine && theirs ? mine > theirs : progressScore(local) >= progressScore(remote.data);
  return localWins ? { use: 'local', push: true } : { use: 'remote', push: false };
}

export class CloudSync {
  // api: { fetchSave(slug), pushSave(slug, body, opts) } (ver api.js)
  // hydrate: completa y pone al día una partida (gameState.js)
  // onRemote(state): llegó una partida más nueva de otro dispositivo
  constructor(slug, { api, hydrate = (d) => d, onRemote, storage = browserStorage(), now = () => Date.now(),
    isVisible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
    throttleMs = 30000, minDelayMs = 3000 }) {
    Object.assign(this, { slug, api, hydrate, onRemote, storage, now, isVisible, throttleMs, minDelayMs });
    this.meta = { rev: 0, dirty: false, savedAt: 0 };
    this.ready = false;
    this.latest = null;
    this.adopted = null;
    this.timer = null;
    this.inflight = false;
    this.again = false;
    this.lastPushAt = 0;
    this.stopped = false;
  }

  persistMeta() { saveSyncMeta(this.slug, this.meta, this.storage); }

  // Al cargar: devuelve la partida con la que se juega (la de este
  // dispositivo o la del servidor).
  async start(local, hadLocal) {
    this.meta = loadSyncMeta(this.slug, hadLocal, this.storage);
    this.latest = local;
    const remote = await this.api.fetchSave(this.slug);
    if (this.stopped) return local;
    const d = resolveSave(this.meta, remote, local);
    let chosen = local;
    if (d.use === 'remote') chosen = this.take(remote);
    else if (remote) this.meta.rev = remote.data ? remote.rev : 0;
    this.ready = true;
    if (d.push) { this.meta.dirty = true; this.persistMeta(); this.flush(); }
    return chosen;
  }

  take(remote) {
    const state = this.hydrate(remote.data);
    this.meta = { rev: remote.rev, dirty: false, savedAt: remote.saved_at || 0 };
    this.persistMeta();
    this.adopted = state;
    this.latest = state;
    return state;
  }

  adopt(remote) {
    const state = this.take(remote);
    if (this.onRemote) this.onRemote(state);
  }

  // Cada vez que cambia la partida.
  changed(state) {
    this.latest = state;
    if (!this.ready || this.stopped || state === this.adopted) return;
    if (!this.isVisible()) return;
    this.meta.dirty = true;
    this.meta.savedAt = this.now();
    this.persistMeta();
    this.schedule();
  }

  schedule() {
    if (this.timer || this.stopped) return;
    const wait = Math.max(this.minDelayMs, this.lastPushAt + this.throttleMs - this.now());
    this.timer = setTimeout(() => { this.timer = null; this.flush(); }, wait);
  }

  // Manda la partida si hay algo sin subir. `keepalive` al cerrar.
  async flush({ keepalive = false } = {}, tries = 0) {
    if (!this.ready || !this.meta.dirty || !this.latest) return;
    if (this.inflight && !keepalive) { this.again = true; return; }
    const sentAt = this.meta.savedAt;
    this.inflight = true;
    this.lastPushAt = this.now();
    const res = await this.api.pushSave(this.slug, { data: this.latest, rev: this.meta.rev, savedAt: this.meta.savedAt }, { keepalive });
    this.inflight = false;
    if (this.stopped && !keepalive) return;
    if (!res || (res.failed && res.failed >= 500)) {
      // Sin conexión o el servidor falló: se reintenta más tarde (y lo
      // jugado sigue en el dispositivo).
      this.schedule();
      return;
    }
    if (res.failed) {
      // El servidor no acepta la partida (todavía no tiene esta función,
      // o la partida no pasa la validación): reintentar no cambia nada.
      this.stop();
      return;
    }
    if (res.ok) {
      this.meta.rev = res.rev;
      if (this.meta.savedAt === sentAt) this.meta.dirty = false;
      this.persistMeta();
    } else if (res.conflict) {
      const d = resolveSave(this.meta, res, this.latest);
      if (d.use === 'remote') { this.adopt(res); return; }
      this.meta.rev = res.rev;
      this.persistMeta();
      if (tries < 3) { await this.flush({ keepalive }, tries + 1); return; }
    }
    this.again = false;
    if (this.meta.dirty) this.schedule();
  }

  // Al volver a la pestaña: ¿se jugó en otro dispositivo mientras tanto?
  async pull() {
    if (!this.ready || this.stopped) return;
    const remote = await this.api.fetchSave(this.slug);
    if (this.stopped || !remote || !remote.data || remote.rev === this.meta.rev) {
      if (this.meta.dirty) this.schedule();
      return;
    }
    const d = resolveSave(this.meta, remote, this.latest);
    if (d.use === 'remote') { this.adopt(remote); return; }
    this.meta.rev = remote.rev;
    this.meta.dirty = true;
    this.persistMeta();
    this.flush();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
