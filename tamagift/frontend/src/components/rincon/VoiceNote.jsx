import React, { useEffect, useRef, useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { play } from '../../sound';
import { MainButton, SmallButton, TextField, Note, ERRORS } from './kit';

// ─────────────────────────────────────────────────────────────────
// Nota de voz: grabar (hasta un minuto), escucharla y recién ahí
// mandarla. Se graba con MediaRecorder y viaja como data URL de audio
// (kind 'voz' en sendLetter).
// ─────────────────────────────────────────────────────────────────

const MAX_SECONDS = 60;

const pickMime = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  const opts = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return opts.find((m) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
};

const blobToDataUrl = (blob) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.onerror = rej;
  fr.readAsDataURL(blob);
});

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function MicIcon({ size = 26, color }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
    </svg>
  );
}

export default function VoiceNote({ ctx }) {
  const { names, send } = ctx;
  const [state, setState] = useState('listo'); // listo | grabando | grabada | enviando
  const [secs, setSecs] = useState(0);
  const [audio, setAudio] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const rec = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);
  const supported = typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof MediaRecorder !== 'undefined';

  const stopTracks = () => { if (stream.current) stream.current.getTracks().forEach((t) => t.stop()); stream.current = null; };
  useEffect(() => () => { clearInterval(timer.current); try { if (rec.current && rec.current.state === 'recording') rec.current.stop(); } catch (e) { /* nada */ } stopTracks(); }, []);

  async function start() {
    setError(''); setDone('');
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError('No pude usar el micrófono. Revisa que el navegador tenga permiso.');
      return;
    }
    const mime = pickMime();
    const chunks = [];
    const r = new MediaRecorder(stream.current, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32000 });
    r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    r.onstop = async () => {
      clearInterval(timer.current);
      stopTracks();
      const blob = new Blob(chunks, { type: (r.mimeType || mime || 'audio/webm').split(';')[0] });
      if (!blob.size) { setState('listo'); setError('No se grabó nada. Prueba otra vez.'); return; }
      const url = await blobToDataUrl(blob);
      setAudio(url.startsWith('data:audio/') ? url : url.replace(/^data:[^;,]*/, 'data:audio/webm'));
      setState('grabada');
    };
    rec.current = r;
    r.start(250);
    play('pop');
    setSecs(0);
    setState('grabando');
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      setSecs(s);
      if (s >= MAX_SECONDS) stop();
    }, 200);
  }

  function stop() {
    clearInterval(timer.current);
    try { if (rec.current && rec.current.state === 'recording') rec.current.stop(); } catch (e) { /* nada */ }
  }

  async function sendIt() {
    if (!audio) return;
    setState('enviando'); setError('');
    const r = await send({ kind: 'voz', text: caption.trim() || 'Nota de voz', audio });
    if (r.ok) {
      setAudio(null); setCaption(''); setState('listo');
      setDone(`¡Enviada! ${names.pet} se la lleva a ${names.to}.`);
    } else {
      setState('grabada');
      setError(ERRORS[r.error] || ERRORS['sin-conexion']);
    }
  }

  if (!supported) return <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Este navegador no deja grabar audio. Prueba desde el celular con Chrome o Safari.</p>;

  return (
    <div>
      {state !== 'grabada' && state !== 'enviando' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={state === 'grabando' ? stop : start} aria-label={state === 'grabando' ? 'Terminar de grabar' : 'Grabar'}
            className="pg-focus pg-keep-round"
            style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
              background: state === 'grabando' ? C.rose : soft(C.rose, 0.75), border: `2px solid ${C.rose}`,
              animation: state === 'grabando' ? 'pg-nudge 1.2s ease-in-out infinite' : 'none',
            }}
          >
            {state === 'grabando'
              ? <span style={{ width: 20, height: 20, borderRadius: 5, background: C.onAccent }} />
              : <MicIcon color={C.rose} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink }}>
              {state === 'grabando' ? `Grabando… ${mmss(secs)}` : 'Toca para grabar'}
            </div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
              {state === 'grabando' ? 'Toca otra vez para terminar' : `Hasta un minuto. La escuchas antes de mandarla.`}
            </div>
            {state === 'grabando' && (
              <div style={{ height: 6, borderRadius: 999, background: C.track, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (secs / MAX_SECONDS) * 100)}%`, height: '100%', background: C.rose, transition: 'width .2s linear' }} />
              </div>
            )}
          </div>
        </div>
      )}
      {(state === 'grabada' || state === 'enviando') && audio && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <audio src={audio} controls style={{ width: '100%' }} aria-label="Tu nota de voz" />
          <TextField value={caption} onChange={setCaption} placeholder="Unas palabras para acompañarla (opcional)" max={120} />
          <div style={{ display: 'flex', gap: 8 }}>
            <SmallButton onClick={() => { setAudio(null); setState('listo'); }} disabled={state === 'enviando'} style={{ flexShrink: 0 }}>Grabar otra</SmallButton>
            <MainButton onClick={sendIt} busy={state === 'enviando'} style={{ padding: 10, fontSize: 14 }}>Mandar la nota de voz</MainButton>
          </div>
        </div>
      )}
      <Note tone="error">{error}</Note>
      <Note>{done}</Note>
    </div>
  );
}
