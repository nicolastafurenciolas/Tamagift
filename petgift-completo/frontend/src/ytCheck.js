// ─────────────────────────────────────────────────────────────────
// Comprobar si un video de YouTube se puede incrustar.
//
// Muchos videos (sobre todo música oficial y directos) tienen desactivada
// la reproducción fuera de YouTube. El iframe se ve cargado igual, así
// que el creador cree que quedó bien y quien recibe el regalo se
// encuentra con silencio y sin explicación.
//
// Esto crea un reproductor invisible y espera a que YouTube diga si el
// video sirve o no. Es la única forma de saberlo antes de entregarlo.
// ─────────────────────────────────────────────────────────────────

let apiPromise = null;

function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => reject(new Error('sin-api'));
    document.head.appendChild(tag);
    setTimeout(() => reject(new Error('timeout')), 12000);
  }).catch((e) => { apiPromise = null; throw e; });
  return apiPromise;
}

/**
 * Comprueba un id de video.
 * Devuelve { ok: true } | { ok: false, code, reason }
 * Si la API no carga (sin red, bloqueador), devuelve { ok: null } —
 * "no se pudo comprobar", que NO es lo mismo que "está mal".
 */
export function checkYouTubeEmbeddable(videoId, timeoutMs = 9000) {
  if (!videoId) return Promise.resolve({ ok: false, code: 2, reason: 'link-invalido' });

  return loadApi().then((YT) => new Promise((resolve) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:200px;height:120px;pointer-events:none';
    document.body.appendChild(host);
    const mount = document.createElement('div');
    host.appendChild(mount);

    let settled = false;
    let player = null;
    let graceTimer = null;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (graceTimer) clearTimeout(graceTimer);
      try { if (player && player.destroy) player.destroy(); } catch (e) { /* ya se fue */ }
      host.remove();
      resolve(result);
    };

    try {
      player = new YT.Player(mount, {
        videoId,
        playerVars: { playsinline: 1 },
        events: {
          // OJO: `onReady` significa "el reproductor está listo", NO que el
          // video sirva. El error llega DESPUÉS, cuando intenta cargarlo.
          // Si se resuelve aquí mismo, todo pasa la prueba — hasta un id
          // inventado. Por eso se espera un momento a ver si hay error.
          onReady: () => {
            graceTimer = setTimeout(() => finish({ ok: true }), 2500);
          },
          onError: (e) => finish({ ok: false, code: e && e.data, reason: 'rechazado' }),
        },
      });
    } catch (e) {
      finish({ ok: null, reason: 'sin-api' });
    }
    setTimeout(() => finish({ ok: null, reason: 'timeout' }), timeoutMs);
  })).catch(() => ({ ok: null, reason: 'sin-api' }));
}

export function youtubeIdFromEmbed(embedUrl) {
  const m = (embedUrl || '').match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
