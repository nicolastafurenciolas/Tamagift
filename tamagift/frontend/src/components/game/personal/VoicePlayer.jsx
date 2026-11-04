import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import { Modal } from '../../ui';
import Sprite from '../../Sprite';
import { IconPlay, IconPause } from '../../icons';
import { voiceEnvelopeSvg } from './art';
import ReplyBox from './ReplyBox';

// ─────────────────────────────────────────────────────────────────
// La nota de voz de quien regala: el sobrecito abierto, un botón grande y
// una onda que se va pintando mientras suena.
// ─────────────────────────────────────────────────────────────────

const BARS = 30;
const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

export default function VoicePlayer({ voice, from, slug, onPlay, onClose }) {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  // alturas fijas por nota (parecen una onda, no ruido)
  const heights = useMemo(() => {
    let seed = Number(voice.id) || 7;
    const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    return Array.from({ length: BARS }, (_, i) => 0.28 + 0.72 * Math.abs(Math.sin(i * 0.55 + r() * 1.4)) * (0.55 + r() * 0.45));
  }, [voice.id]);
  useEffect(() => () => { if (audio.current) audio.current.pause(); }, []);

  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) { if (onPlay) onPlay(); a.play().catch(() => {}); } else a.pause();
  }
  const progress = dur ? t / dur : 0;

  return (
    <Modal onClose={onClose} maxWidth={340} z={85}>
      <div className="pg-anim-pop" style={{ display: 'flex', justifyContent: 'center' }}>
        <Sprite markup={voiceEnvelopeSvg()} cacheKey="sobre-voz" w={75} h={60} />
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 800, color: C.ink, margin: '4px 0 2px' }}>Una nota de voz de {from || 'alguien especial'}</h2>
      {voice.loading ? (
        <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 17, color: C.inkSoft, margin: '10px 0' }}>Abriendo el sobrecito…</p>
      ) : !voice.audio ? (
        <p style={{ fontSize: 13, color: C.inkSoft, margin: '10px 0' }}>No se pudo cargar la nota. Revisa tu conexión e intenta de nuevo desde el buzón.</p>
      ) : (
        <div className="pg-card" style={{ marginTop: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <audio
            ref={audio} src={voice.audio} preload="metadata"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(0); }}
            onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            onDurationChange={(e) => setDur(e.currentTarget.duration)}
          />
          <button
            onClick={toggle} className="pg-btn pg-btn-rose pg-focus pg-keep-round" aria-label={playing ? 'Pausar' : 'Escuchar'}
            style={{ width: 52, height: 52, borderRadius: '50%', padding: 0, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: playing ? SHADOW.glowRose : undefined }}
          >
            {playing ? <IconPause size={22} color={C.onAccent} fill={C.onAccent} /> : <IconPlay size={22} color={C.onAccent} fill={C.onAccent} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 2, height: 34 }}>
              {heights.map((h, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1, height: `${Math.round(h * 100)}%`, borderRadius: 2,
                    background: i / BARS < progress ? C.rose : C.roseSoft,
                    transform: playing && Math.abs(i / BARS - progress) < 0.06 ? 'scaleY(1.18)' : 'none', transition: 'transform 0.15s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: C.inkFaint, marginTop: 3 }}>
              <span>{fmt(t)}</span><span>{dur ? fmt(dur) : ''}</span>
            </div>
          </div>
        </div>
      )}
      {voice.text ? <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 19, color: C.ink, lineHeight: 1.35, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>{voice.text}</p> : null}
      {!voice.loading && slug && <ReplyBox slug={slug} to={from} refId={voice.id} />}
      <button onClick={onClose} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 10, padding: '9px 24px', fontSize: 13 }}>Guardarla en el corazón</button>
    </Modal>
  );
}
