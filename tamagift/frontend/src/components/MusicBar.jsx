import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { toEmbedUrl } from '../embed';
import { C, FONT, SHADOW } from '../theme';
import { IconClose } from './icons';

// ─────────────────────────────────────────────────────────────────
// Motor de música.
//
// Ningún navegador deja que un iframe de otro origen empiece a sonar
// solo. Por eso:
//   · YouTube se controla con su IFrame Player API: playVideo() se llama
//     DENTRO del toque de "Toca para abrir tu regalo".
//   · Un archivo propio usa un <audio> nativo, arrancado en ese mismo
//     toque.
//   · Spotify no expone ningún control a terceros: su reproductor se
//     MUESTRA (en el panel de música) para que la persona le dé play.
//
// El reproductor vive siempre montado. Cuando el panel de música está
// cerrado queda fuera de pantalla (sin display:none, que pausa el
// audio en algunos navegadores); cuando se abre, el mismo reproductor
// se mueve al panel, visible y tocable — en un celular, YouTube a veces
// solo acepta un toque directo sobre su propio reproductor.
//
// Controles que expone por ref: start, play, pause, toggle, next,
// setVolume. Avisa su estado por `onState`.
// ─────────────────────────────────────────────────────────────────

export function musicErrorText(code) {
  if (code === 101 || code === 150) return 'Este video no se puede reproducir fuera de YouTube — prueba con otro';
  if (code === 100) return 'El video ya no existe o es privado';
  if (code === 2) return 'El link de la canción no es válido';
  if (code === -2) return 'No se pudo cargar el reproductor de YouTube';
  return 'No se pudo reproducir esta canción';
}

let ytApiPromise = null;
export function loadYouTubeApi() {
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
    setTimeout(() => reject(new Error('timeout')), 20000);
  }).catch((e) => { ytApiPromise = null; throw e; });
  return ytApiPromise;
}

function youtubeId(rawUrl) {
  const { url, provider } = toEmbedUrl(rawUrl);
  if (provider !== 'youtube') return null;
  const m = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export function songProvider(song) {
  if (!song) return null;
  if (song.source_type === 'upload') return 'upload';
  return toEmbedUrl(song.embed_url).provider;
}

const MusicBar = forwardRef(function MusicBar({ songs, open = false, onClose, onState }, ref) {
  const list = songs || [];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const holderRef = useRef(null);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const wantPlayRef = useRef(false);   // tocar apenas el reproductor esté listo
  const volumeRef = useRef(0.7);

  const current = list[index] || null;
  const provider = songProvider(current);
  const isUpload = provider === 'upload';
  const isYouTube = provider === 'youtube';
  const vid = isYouTube ? youtubeId(current.embed_url) : null;
  const embed = current && !isUpload ? toEmbedUrl(current.embed_url) : null;

  useEffect(() => {
    if (onState) onState({ playing, index, title: current ? current.title : '', provider, count: list.length });
  }, [playing, index, provider, current, list.length, onState]);

  // Pasa a la siguiente canción y sigue sonando. Con una sola canción,
  // vuelve a empezar (antes se quedaba en silencio para siempre).
  const advance = useCallback(() => {
    if (list.length <= 1) {
      if (isUpload && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
      else if (isYouTube && playerRef.current) { try { playerRef.current.seekTo(0); playerRef.current.playVideo(); } catch (e) { /* noop */ } }
      return;
    }
    wantPlayRef.current = true;
    setIndex((i) => (i + 1) % list.length);
  }, [list.length, isUpload, isYouTube]);

  // ── Reproductor de YouTube ─────────────────────────────────────
  useEffect(() => {
    if (!isYouTube || !vid || !holderRef.current) return undefined;
    let cancelled = false;
    let player = null;
    const mount = document.createElement('div');
    holderRef.current.innerHTML = '';
    holderRef.current.appendChild(mount);
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(mount, {
          videoId: vid, width: 240, height: 135,
          playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
          events: {
            onReady: () => {
              if (cancelled) return;
              try { player.setVolume(Math.round(volumeRef.current * 100)); } catch (e) { /* noop */ }
              if (wantPlayRef.current) {
                wantPlayRef.current = false;
                try { player.unMute(); player.playVideo(); } catch (e) { /* noop */ }
              }
            },
            onStateChange: (e) => {
              if (cancelled) return;
              if (e.data === 1) setPlaying(true);
              if (e.data === 2) setPlaying(false);
              if (e.data === 0) { setPlaying(false); advance(); }
            },
            onError: () => { if (!cancelled) advance(); },
          },
        });
        playerRef.current = player;
      })
      .catch(() => { /* sin API de YouTube: el panel muestra el embed igual */ });
    return () => {
      cancelled = true;
      playerRef.current = null;
      try { if (player && player.destroy) player.destroy(); } catch (e) { /* ya se fue */ }
    };
  }, [isYouTube, vid, advance]);

  // ── Audio propio ───────────────────────────────────────────────
  useEffect(() => {
    if (!isUpload) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = volumeRef.current;
    el.loop = list.length === 1;
    if (wantPlayRef.current) {
      wantPlayRef.current = false;
      el.play().catch(() => {});
    }
  }, [index, isUpload, list.length]);

  const play = useCallback(() => {
    if (isUpload) {
      const el = audioRef.current;
      if (el) el.play().catch(() => {});
      return;
    }
    if (isYouTube) {
      const p = playerRef.current;
      if (!p) { wantPlayRef.current = true; return; }
      try { p.unMute(); p.playVideo(); } catch (e) { /* noop */ }
    }
  }, [isUpload, isYouTube]);

  const pause = useCallback(() => {
    if (isUpload && audioRef.current) audioRef.current.pause();
    if (isYouTube && playerRef.current) { try { playerRef.current.pauseVideo(); } catch (e) { /* noop */ } }
    wantPlayRef.current = false;
    setPlaying(false);
  }, [isUpload, isYouTube]);

  useImperativeHandle(ref, () => ({
    // Primera canción que se pueda arrancar sola (Spotify no puede).
    start() {
      if (!list.length) return;
      const first = list.findIndex((s) => songProvider(s) !== 'spotify');
      if (first < 0) return;
      if (first !== index) {
        wantPlayRef.current = true;
        setIndex(first);
        // El audio propio sí se puede arrancar ahora mismo, dentro del toque.
        if (list[first].source_type === 'upload' && audioRef.current) {
          audioRef.current.src = list[first].audio_data;
          audioRef.current.play().catch(() => {});
          wantPlayRef.current = false;
        }
        return;
      }
      play();
    },
    play,
    pause,
    toggle() { if (playing) pause(); else play(); },
    next() { advance(); },
    setVolume(v) {
      const clamped = Math.max(0, Math.min(1, v));
      volumeRef.current = clamped;
      if (audioRef.current) audioRef.current.volume = clamped;
      if (playerRef.current) { try { playerRef.current.setVolume(Math.round(clamped * 100)); } catch (e) { /* noop */ } }
    },
  }), [list, index, play, pause, playing, advance]);

  if (!list.length) return null;

  const showFrame = open && (isYouTube || (embed && !isUpload));
  return (
    <div
      aria-hidden={!open}
      style={open ? {
        position: 'fixed', left: '50%', bottom: 14, transform: 'translateX(-50%)', zIndex: 80,
        width: 'min(330px, calc(100vw - 24px))', padding: showFrame ? 10 : 0,
        background: showFrame ? C.surface : 'transparent', borderRadius: 18,
        boxShadow: showFrame ? SHADOW.lifted : 'none', border: showFrame ? `1.5px solid ${C.line}` : 'none',
      } : {
        position: 'fixed', left: -9999, top: 0, width: 240, height: 135, overflow: 'hidden', opacity: 0, pointerEvents: 'none',
      }}
    >
      {open && showFrame && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {current.title || 'Su canción'}{provider === 'spotify' ? ' · dale play aquí' : ''}
          </span>
          <button onClick={onClose} aria-label="Cerrar reproductor" className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <IconClose size={16} color={C.inkSoft} />
          </button>
        </div>
      )}
      {/* YouTube: el mismo reproductor, visible o fuera de pantalla. */}
      <div ref={holderRef} style={{ display: isYouTube ? 'block' : 'none', width: '100%', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden' }} />
      {/* Spotify u otro embed: solo existe con el panel abierto. */}
      {showFrame && !isYouTube && embed && (
        <iframe
          title="Reproductor de música" src={embed.url} width="100%" height={embed.height}
          style={{ border: 0, borderRadius: 12 }} allow="autoplay; clipboard-write; encrypted-media" loading="lazy"
        />
      )}
      {isUpload && (
        <audio
          ref={audioRef} src={current.audio_data} preload="auto"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); advance(); }}
        />
      )}
    </div>
  );
});

export default MusicBar;
