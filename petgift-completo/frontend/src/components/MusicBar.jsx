import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { toEmbedUrl } from '../embed';

// ─────────────────────────────────────────────────────────────────
// Motor de música — sin interfaz visible.
//
// Por qué no basta con un <iframe src="...autoplay=1">:
// ningún navegador deja que un iframe de otro origen empiece a sonar
// solo. Chrome lo bloquea salvo que ya tengas historial con el sitio, y
// Safari de iOS lo bloquea SIEMPRE.
//
// Solución: para YouTube usamos su IFrame Player API. Eso permite
// llamar a playVideo() DENTRO del gesto real de la persona (el toque en
// "Toca para abrir tu regalo"), que es lo único que los navegadores
// aceptan como permiso. Para un archivo propio, el mismo toque llama
// play() sobre un <audio> nativo.
//
// Spotify no expone NINGÚN control de reproducción en sus embeds — ni
// siquiera con el toque de apertura hay forma de arrancarlo desde
// fuera. Es una restricción del lado de Spotify, no algo que se pueda
// resolver con más código: quien reciba el regalo tiene que darle play
// dentro del reproductor de Spotify la primera vez.
// ─────────────────────────────────────────────────────────────────

export function musicErrorText(code) {
  if (code === 101 || code === 150) return 'Este video no se puede reproducir fuera de YouTube — prueba con otro';
  if (code === 100) return 'El video ya no existe o es privado';
  if (code === 2) return 'El link de la canción no es válido';
  if (code === -2) return 'No se pudo cargar el reproductor de YouTube';
  return 'No se pudo reproducir esta canción';
}

let ytApiPromise = null;

function loadYouTubeApi() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => reject(new Error('no se pudo cargar la API de YouTube'));
    document.head.appendChild(tag);
    setTimeout(() => reject(new Error('timeout')), 12000);
  }).catch((e) => { ytApiPromise = null; throw e; });
  return ytApiPromise;
}

function youtubeId(rawUrl) {
  const { url, provider } = toEmbedUrl(rawUrl);
  if (provider !== 'youtube') return null;
  const m = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

// forwardRef porque la pantalla de apertura necesita llamar start()
// DIRECTAMENTE dentro del toque de la persona, y la barra de volumen
// necesita llamar setVolume() en cualquier momento. Por eso este
// componente vive montado todo el tiempo, sin importar qué pantalla se
// esté viendo: si se desmontara, la canción se cortaría.
const MusicBar = forwardRef(function MusicBar({ songs }, ref) {
  const list = songs || [];
  const [index, setIndex] = useState(0);
  const holderRef = useRef(null);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const pendingStartRef = useRef(false);
  const pendingVolumeRef = useRef(null); // 0..1, aplicado apenas el player esté listo

  const current = list[index] || null;
  const isUpload = current && current.source_type === 'upload';
  const info = current && !isUpload ? toEmbedUrl(current.embed_url) : null;
  const isYouTube = info && info.provider === 'youtube';
  const vid = current && !isUpload ? youtubeId(current.embed_url) : null;

  // ── Crear el player de YouTube ─────────────────────────────────
  useEffect(() => {
    if (!isYouTube || !vid || !holderRef.current) return;
    let cancelled = false;
    let player = null;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !holderRef.current) return;
        player = new YT.Player(holderRef.current, {
          videoId: vid,
          playerVars: { rel: 0, playsinline: 1 },
          events: {
            onReady: () => {
              if (cancelled) return;
              if (pendingVolumeRef.current != null) {
                try { player.setVolume(Math.round(pendingVolumeRef.current * 100)); } catch (e) { /* noop */ }
              }
              // Si start() se llamó antes de que el player terminara de
              // cargar (normal: la API de YouTube tarda en llegar), el
              // play queda pendiente y se dispara apenas está listo.
              if (pendingStartRef.current) {
                pendingStartRef.current = false;
                try { player.unMute(); player.playVideo(); } catch (e) { /* no se pudo */ }
              }
            },
            onStateChange: (e) => {
              if (cancelled) return;
              if (e.data === 0) {
                // se acabó: pasa a la siguiente
                setIndex((i) => (list.length > 1 ? (i + 1) % list.length : i));
              }
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => { /* no se pudo cargar la API de YouTube */ });

    return () => {
      cancelled = true;
      playerRef.current = null;
      try { if (player && player.destroy) player.destroy(); } catch (e) { /* ya se fue */ }
    };
  }, [isYouTube, vid, list.length]);

  const onAudioEnded = useCallback(() => {
    setIndex((i) => (list.length > 1 ? (i + 1) % list.length : i));
  }, [list.length]);

  const doPlay = useCallback(() => {
    if (isUpload) {
      const el = audioRef.current;
      if (el) el.play().catch(() => {});
      return;
    }
    const p = playerRef.current;
    if (!p) { pendingStartRef.current = true; return; } // el player de YT aún no cargó
    try { p.unMute(); p.playVideo(); } catch (e) { /* no se pudo */ }
  }, [isUpload]);

  useImperativeHandle(ref, () => ({
    // Arranca la PRIMERA canción de la lista, llamado directo desde el
    // toque en la pantalla de apertura. Con Spotify no hay nada que
    // hacer: su embed nunca permite control externo.
    start() {
      if (list.length === 0) return;
      setIndex(0);
      const first = list[0];
      if (first.source_type === 'upload') {
        const el = audioRef.current;
        if (el) {
          if (el.src !== first.audio_data) el.src = first.audio_data;
          el.play().catch(() => {});
        }
      } else if (toEmbedUrl(first.embed_url).provider === 'youtube') {
        doPlay();
      }
    },
    // v: 0..1
    setVolume(v) {
      const clamped = Math.max(0, Math.min(1, v));
      if (audioRef.current) audioRef.current.volume = clamped;
      const p = playerRef.current;
      if (p) { try { p.setVolume(Math.round(clamped * 100)); } catch (e) { /* noop */ } }
      else { pendingVolumeRef.current = clamped; }
    },
  }), [list, doPlay]);

  if (list.length === 0) return null;

  // Todo vive fuera de pantalla y SIN display:none: algunos navegadores
  // pausan audio/video que vive dentro de un árbol con display:none.
  return (
    <div style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
      {isYouTube && <div ref={holderRef} />}
      {isUpload && (
        <audio
          ref={audioRef}
          src={current.audio_data}
          onEnded={onAudioEnded}
        />
      )}
    </div>
  );
});

export default MusicBar;
