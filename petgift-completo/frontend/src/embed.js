// ─────────────────────────────────────────────────────────────────
// Normalizador de links de música.
//
// El problema real: la gente copia el link normal de compartir
// (https://open.spotify.com/track/XXXX?si=...) y lo pega tal cual. Ese
// link NO funciona dentro de un <iframe> (Spotify y YouTube lo bloquean
// con X-Frame-Options), así que el reproductor se quedaba en blanco y
// "no sonaba la música".
//
// Aquí convertimos cualquier forma común de link a su URL de *embed*,
// que sí se puede incrustar. Así el creador pega lo que sea y funciona.
// ─────────────────────────────────────────────────────────────────

const SPOTIFY_KINDS = ['track', 'album', 'playlist', 'episode', 'show', 'artist'];

// Devuelve { url, provider, height } listo para meter en un <iframe>.
// provider: 'spotify' | 'youtube' | 'desconocido'
export function toEmbedUrl(raw, { autoplay = false } = {}) {
  const input = (raw || '').trim();
  if (!input) return { url: '', provider: 'desconocido', height: 152 };

  // ── Spotify ────────────────────────────────────────────────────
  // URI nativo: spotify:track:ID
  const uriMatch = input.match(/^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]+)/i);
  if (uriMatch) {
    const kind = uriMatch[1].toLowerCase();
    return {
      url: `https://open.spotify.com/embed/${kind}/${uriMatch[2]}`,
      provider: 'spotify',
      height: kind === 'track' || kind === 'episode' ? 152 : 352,
    };
  }

  if (/open\.spotify\.com/i.test(input)) {
    // Soporta /intl-es/ y cualquier prefijo de idioma, con o sin /embed/
    const m = input.match(
      new RegExp(`open\\.spotify\\.com/(?:embed/)?(?:[a-z-]+/)?(${SPOTIFY_KINDS.join('|')})/([A-Za-z0-9]+)`, 'i')
    );
    if (m) {
      const kind = m[1].toLowerCase();
      return {
        url: `https://open.spotify.com/embed/${kind}/${m[2]}`,
        provider: 'spotify',
        height: kind === 'track' || kind === 'episode' ? 152 : 352,
      };
    }
  }

  // ── YouTube ────────────────────────────────────────────────────
  if (/youtu\.be|youtube\.com|youtube-nocookie\.com/i.test(input)) {
    let videoId = null;
    let listId = null;

    const short = input.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    if (short) videoId = short[1];

    const watch = input.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    if (!videoId && watch) videoId = watch[1];

    const embed = input.match(/\/embed\/([A-Za-z0-9_-]{6,})/i);
    if (!videoId && embed && embed[1] !== 'videoseries') videoId = embed[1];

    const shorts = input.match(/\/shorts\/([A-Za-z0-9_-]{6,})/i);
    if (!videoId && shorts) videoId = shorts[1];

    const list = input.match(/[?&]list=([A-Za-z0-9_-]+)/i);
    if (list) listId = list[1];

    const params = [];
    // El usuario toca la canción para reproducirla: eso cuenta como gesto,
    // así que autoplay sí arranca en YouTube.
    if (autoplay) params.push('autoplay=1');
    params.push('rel=0');
    const qs = params.length ? `?${params.join('&')}` : '';

    if (videoId) {
      const withList = listId ? `${qs}${qs ? '&' : '?'}list=${listId}` : qs;
      return { url: `https://www.youtube.com/embed/${videoId}${withList}`, provider: 'youtube', height: 200 };
    }
    if (listId) {
      return { url: `https://www.youtube.com/embed/videoseries${qs}${qs ? '&' : '?'}list=${listId}`, provider: 'youtube', height: 200 };
    }
  }

  // No reconocido: lo devolvemos igual (quizá ya es un embed válido de otro lado).
  return { url: input, provider: 'desconocido', height: 152 };
}

// Etiqueta amigable para mostrar en la interfaz.
export function providerLabel(provider) {
  if (provider === 'spotify') return 'Spotify';
  if (provider === 'youtube') return 'YouTube';
  return 'Link';
}
