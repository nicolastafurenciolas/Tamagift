import React, { useEffect, useState } from 'react';
import { C, FONT } from '../../theme';
import { IconHeart, IconSparkle } from '../icons';
import { UISprite, PetSprite } from './common';
import Sprite from '../Sprite';
import { face, part, flat, line, shade, shine, rr, ellD, tone, piece } from '../../art/room/draw';

// ── El regalo (arte) ──────────────────────────────────────────────
// Caja en la vista 3/4 del juego: cara de adelante y, encima, la tapa
// (su cara de arriba con alto × 0.5 y su canto que sobresale). Papel
// rosa con lunares crema, cinta dorada en cruz, moño de dos lazos con
// colas y una etiqueta con corazón. La tapa va en su propio dibujo para
// poder salir volando al abrir.
const GIFT = { paper: '#F59DB8', dots: '#FFF1E2', ribbon: '#F6C752', tag: '#FFF8EE', heart: '#F0607F' };
const f1 = (n) => +n.toFixed(1);
const circ = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0Z`;
// lunares al tresbolillo dentro de un rectángulo (como tono: no recortan
// el papel en pixel)
function dotsIn(x0, y0, x1, y1, r, step, skip) {
  let d = '';
  for (let row = 0, y = y0 + step / 2; y < y1 - r; row++, y += step * 0.8) {
    for (let x = x0 + (row % 2 ? step : step / 2); x < x1 - r; x += step) if (!skip || !skip(x)) d += circ(x, y, r);
  }
  return d;
}

function giftBodySvg() {
  const P = GIFT.paper, R = GIFT.ribbon;
  let s = flat(ellD(100, 132, 86, 11), '#3A2A3E', { opacity: 0.18, 'data-r': 'tone' });
  s += face(rr(22, 8, 156, 122, 8), P, { w: 2.6 });
  s += shade(dotsIn(26, 12, 174, 126, 4.6, 26, (x) => Math.abs(x - 100) < 20), GIFT.dots, 0.95);
  // sombra que deja la tapa y lado derecho en sombra
  s += shade('M24 10H176V24H24Z', '#7A2E4A', 0.22);
  s += shade('M150 12H176V128H150Z', tone(P, -1.2), 0.25);
  s += shine('M32 34C32 70 36 98 44 116C34 100 28 72 28 36Z', { opacity: 0.55 });
  // cinta vertical con sus dos filos
  s += part('M86 8H114V130H86Z', R, { w: 2.2 });
  s += flat('M90 10H95V128H90Z', tone(R, 0.8), { opacity: 0.8 }) + shade('M106 10H113V128H106Z', tone(R, -1), 0.3);
  return piece(200, 146, s);
}

// Lo de adentro de la caja (se ve al volar la tapa, detrás de la
// mascota): la cara de arriba abierta, con el fondo en sombra y papel de
// seda asomando.
function giftInsideSvg() {
  let s = face('M22 6H178V40H22Z', tone(GIFT.paper, 0.5), { w: 2.4 });
  s += flat('M30 10H170V40H30Z', '#7A3552');
  s += shade('M30 10H170V20H30Z', '#2A1020', 0.35);
  // papel de seda arrugado en los bordes
  s += part('M30 40L36 26L46 34L54 22L64 32L72 24V40Z', '#FFF4F7', { w: 1.6 }) + part('M128 40V24L138 32L146 22L156 34L164 26L170 40Z', '#FFF4F7', { w: 1.6 });
  return piece(200, 40, s);
}

function giftLidSvg() {
  const P = GIFT.paper, R = GIFT.ribbon, Pt = tone(P, 0.55);
  let s = '';
  // cara de arriba (más clara) y canto
  s += face('M12 60H188V84H12Z', Pt, { w: 2.4 });
  s += face(rr(10, 82, 180, 28, 6), P, { w: 2.6 });
  s += shade(dotsIn(14, 86, 186, 108, 4, 26, (x) => Math.abs(x - 100) < 20), GIFT.dots, 0.95);
  s += shade('M160 84H190V110H160Z', tone(P, -1.2), 0.22);
  s += shine('M18 88H70V92H18Z', { opacity: 0.6 });
  // cinta: cruz sobre la tapa y bajando por el canto
  s += part('M88 60H112V110H88Z', R, { w: 2 });
  s += part('M12 67H188V77H12Z', R, { w: 2 });
  s += flat('M92 84H96V108H92Z', tone(R, 0.8), { opacity: 0.8 }) + flat('M16 68H186V70.6H16Z', tone(R, 0.8), { opacity: 0.8 });
  // moño: dos lazos inflados, el nudo y dos colas
  s += part('M100 66C88 72 76 82 66 76C56 70 54 52 62 42C70 32 86 40 92 50C96 56 99 61 100 66Z', R, { w: 2.4 });
  s += part('M100 66C112 72 124 82 134 76C144 70 146 52 138 42C130 32 114 40 108 50C104 56 101 61 100 66Z', R, { w: 2.4 });
  s += shade('M70 70C78 72 86 70 94 62C88 70 80 76 70 74Z', tone(R, -1.2), 0.4) + shade('M130 70C122 72 114 70 106 62C112 70 120 76 130 74Z', tone(R, -1.2), 0.4);
  s += shine('M66 48C68 42 74 40 80 42C74 44 70 46 68 52Z', { opacity: 0.85 }) + shine('M134 48C132 44 128 42 124 42C128 44 131 47 132 51Z', { opacity: 0.6 });
  s += part('M96 66L88 92L94 90L98 96L100 68Z', tone(R, -0.25), { w: 2 }) + part('M104 66L112 92L106 90L102 96L100 68Z', tone(R, -0.25), { w: 2 });
  s += part(rr(91, 57, 18, 15, 6), tone(R, 0.2), { w: 2.2 });
  s += shine('M95 60H101V63H95Z', { opacity: 0.8 });
  // etiqueta colgando del moño, con su corazón
  s += line('M108 70C122 78 138 82 150 84', '#B88A5A', 2);
  s += part('M146 80L170 76L176 98L152 102Z', GIFT.tag, { w: 2 });
  s += part('M162 94C156 90 154 86 157 84C159 82 161 83 162 85C163 82 166 81 167 84C169 87 166 91 162 94Z', GIFT.heart, { w: 1.5 });
  s += part(ellD(151, 83, 2.4, 2.4), '#E8D8C4', { w: 1.2 });
  return piece(200, 112, s);
}

// Un papelito de confeti (para la explosión al abrir).
const CONFETTI = ['#F59DB8', '#F6C752', '#8FD3C1', '#A9C8F5', '#C9A8EE', '#FFFFFF'];

const BODY = giftBodySvg();
const LID = giftLidSvg();
const INSIDE = giftInsideSvg();
const SCENE_CSS = `
@keyframes tg-rays { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes tg-gift-bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 20% { transform: translateY(-4px) rotate(-2.5deg); } 40% { transform: translateY(0) rotate(2deg); } 55% { transform: translateY(-2px) rotate(0deg); } }
@keyframes tg-float { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-140px); opacity: 0; } }
@keyframes tg-burst { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; } }
@keyframes tg-flash { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); } }
@keyframes tg-kenburns { from { transform: scale(1) rotate(var(--r)); } to { transform: scale(1.06) rotate(var(--r)); } }
@keyframes tg-bokeh { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateY(-80px); opacity: 0; } }`;

// ── Apertura: "toca para abrir tu regalo" ─────────────────────────
// Ningún navegador deja sonar música sin un toque. Ese toque obligatorio
// se convierte en parte del regalo: se abre la caja y en ESE toque
// arranca la música. La caja respira y se mueve sola (algo hay
// adentro), detrás gira un sol de rayos suaves y suben corazoncitos; al
// tocar, la tapa sale volando, estalla un destello con confeti y la
// mascota salta afuera.
export function OpeningScreen({ petName, creatorName, look, onOpen }) {
  const [opening, setOpening] = useState(false);
  function open() {
    if (opening) return;
    setOpening(true);
    onOpen();
  }
  const pieces = React.useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.2;
    const d = 110 + (i % 5) * 26;
    return { c: CONFETTI[i % CONFETTI.length], dx: Math.cos(a) * d, dy: Math.sin(a) * d - 40, rot: (i % 2 ? 1 : -1) * (180 + i * 20), w: i % 3 ? 7 : 10, h: i % 3 ? 10 : 6 };
  }), []);
  return (
    <div
      className="pg-anim-rise"
      onClick={open}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', cursor: 'pointer',
        background: `radial-gradient(circle at 50% 42%, ${C.surface} 0%, ${C.roseSoft} 34%, ${C.paper} 78%)`,
      }}
    >
      <style>{SCENE_CSS}</style>
      {/* sol de rayos que gira despacio detrás de la caja */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: '50%', top: '40%', width: 760, height: 760, pointerEvents: 'none',
          background: `repeating-conic-gradient(from 0deg, ${C.surface} 0deg 9deg, transparent 9deg 22.5deg)`,
          opacity: 0.55, animation: 'tg-rays 60s linear infinite',
          WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 62%)',
          maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 62%)',
        }}
      />
      {/* destellos y corazoncitos que suben */}
      {[[14, 22, 14], [82, 18, 18], [24, 64, 12], [78, 60, 16], [50, 12, 12], [8, 44, 10], [92, 40, 11]].map(([l, t, z], i) => (
        <span key={`s${i}`} aria-hidden="true" style={{ position: 'absolute', left: `${l}%`, top: `${t}%`, animation: `pg-shimmer ${2.2 + (i % 3) * 0.6}s ease-in-out ${i * 0.3}s infinite`, pointerEvents: 'none' }}>
          <IconSparkle size={z} color={C.amber} fill={C.amber} />
        </span>
      ))}
      {[30, 46, 62, 70].map((l, i) => (
        <span key={`h${i}`} aria-hidden="true" style={{ position: 'absolute', left: `${l}%`, top: '50%', opacity: 0, animation: `tg-float ${4 + i * 0.7}s ease-out ${i * 1.1}s infinite`, pointerEvents: 'none' }}>
          <IconHeart size={12 + (i % 2) * 5} color={C.rose} fill={C.rose} />
        </span>
      ))}

      <div style={{ position: 'relative', width: 220, height: 250, marginBottom: 4 }}>
        {/* halo detrás del regalo */}
        <div aria-hidden="true" className="pg-keep-round" style={{ position: 'absolute', left: '50%', top: '58%', width: 250, height: 250, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: `radial-gradient(circle, ${C.surface} 0%, transparent 68%)`, opacity: 0.9 }} />
        <div style={{ position: 'absolute', inset: 0, animation: opening ? 'none' : 'tg-gift-bob 2.4s ease-in-out infinite', transformOrigin: '50% 90%' }}>
          {opening && <div style={{ position: 'absolute', left: 10, top: 80 }}><Sprite markup={INSIDE} cacheKey="gift-inside" w={200} h={40} /></div>}
          {/* la mascota espera adentro: al abrir salta y queda asomada */}
          <div style={{ position: 'absolute', left: 40, top: opening ? -6 : 96, width: 140, height: 140, transition: 'top 0.42s cubic-bezier(.34,1.6,.64,1)', opacity: opening ? 1 : 0 }}>
            <PetSprite look={look} mood="feliz" size={140} />
          </div>
          <div style={{ position: 'absolute', left: 10, top: 110 }}>
            <Sprite markup={BODY} cacheKey="gift-body" w={200} h={146} />
          </div>
          <div style={{ position: 'absolute', left: 10, top: 18, transformOrigin: '70% 90%', transition: 'transform 0.42s cubic-bezier(.2,.8,.3,1), opacity 0.42s', transform: opening ? 'translate(70px, -150px) rotate(28deg)' : 'none', opacity: opening ? 0 : 1 }}>
            <Sprite markup={LID} cacheKey="gift-lid" w={200} h={112} />
          </div>
        </div>
        {opening && (
          <>
            <div aria-hidden="true" className="pg-keep-round" style={{ position: 'absolute', left: '50%', top: '52%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255,240,200,0.8) 30%, transparent 66%)', animation: 'tg-flash 0.45s ease-out forwards', pointerEvents: 'none' }} />
            {pieces.map((p, i) => (
              <span key={i} aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: p.w, height: p.h, background: p.c, borderRadius: 2, boxShadow: '0 0 0 1.5px rgba(58,42,62,0.35)', '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`, animation: 'tg-burst 0.45s ease-out forwards', pointerEvents: 'none' }} />
            ))}
          </>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <p style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.inkSoft, margin: 0 }}>
          {creatorName ? `${creatorName} te preparó algo` : 'Alguien te preparó algo'}
        </p>
        <h1 style={{ fontFamily: FONT.display, fontSize: 32, fontWeight: 800, color: C.ink, margin: '4px 0 0', letterSpacing: 0.3 }}>{petName}</h1>
      </div>
      <button onClick={(e) => { e.stopPropagation(); open(); }} className="pg-btn pg-btn-rose pg-focus pg-anim-pop" style={{ position: 'relative', fontSize: 16, padding: '14px 30px', marginTop: 4 }}>
        Toca para abrir tu regalo
      </button>
    </div>
  );
}

// ── Cinemática de recuerdos ───────────────────────────────────────
// Aparece cuando la mascota se quedó sin hambre ni amor: sus fotos y
// sus frases, una por una, y al final se recupera. Las fotos van como
// polaroids con cinta, ladeadas a uno y otro lado y acercándose despacio;
// abajo, la frase escrita a mano; alrededor, luces cálidas que suben.
export function CinematicScreen({ photos, phrases, onFinish }) {
  const positive = (phrases || []).filter((p) => p.category === 'positiva');
  const usePhotos = photos && photos.length > 0;
  const slideCount = usePhotos ? Math.min(photos.length, 6) : Math.min(Math.max(positive.length, 1), 4);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const isDone = index >= slideCount;

  useEffect(() => {
    if (isDone) return undefined;
    let inner;
    const timer = setTimeout(() => {
      setFading(true);
      inner = setTimeout(() => { setIndex((i) => i + 1); setFading(false); }, 400);
    }, 2800);
    return () => { clearTimeout(timer); clearTimeout(inner); };
  }, [index, isDone]);

  const photo = usePhotos ? photos[index % photos.length] : null;
  const caption = positive.length > 0 ? positive[index % positive.length].text : (usePhotos ? null : 'Gracias por todos estos momentos juntos');
  const tilt = index % 2 ? 2.5 : -2.5;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 38%, #4A3446 0%, #2A1D2C 48%, #120D16 100%)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' }}>
      <style>{SCENE_CSS}</style>
      {/* luces cálidas desenfocadas que suben */}
      {[[10, 80, 26], [24, 92, 14], [70, 86, 30], [86, 74, 16], [44, 96, 20], [58, 70, 12], [92, 94, 22], [4, 60, 12]].map(([l, t, z], i) => (
        <span key={`b${i}`} aria-hidden="true" className="pg-keep-round" style={{ position: 'absolute', left: `${l}%`, top: `${t}%`, width: z, height: z, borderRadius: '50%', background: i % 3 ? 'rgba(255,214,150,0.35)' : 'rgba(255,170,190,0.32)', boxShadow: `0 0 ${z}px ${i % 3 ? 'rgba(255,214,150,0.4)' : 'rgba(255,170,190,0.4)'}`, opacity: 0, animation: `tg-bokeh ${6 + (i % 4)}s ease-out ${i * 0.8}s infinite`, pointerEvents: 'none' }} />
      ))}
      {[12, 30, 68, 84, 22, 76].map((l, i) => (
        <span key={i} aria-hidden="true" style={{ position: 'absolute', left: `${l}%`, top: `${8 + (i * 13) % 60}%`, animation: `pg-shimmer ${2 + i * 0.4}s ease-in-out infinite`, pointerEvents: 'none' }}>
          <IconSparkle size={10 + (i % 3) * 4} color="#FFE9A8" fill="#FFE9A8" />
        </span>
      ))}
      {!isDone && (
        <div key={index} style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.4s', textAlign: 'center', maxWidth: 330, zIndex: 1, animation: 'pg-pop-in 0.5s ease both' }}>
          {photo && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18, '--r': `${tilt}deg`, animation: 'tg-kenburns 3.2s ease-out forwards' }}>
              <div style={{ background: '#FFFDF7', padding: '10px 10px 34px', borderRadius: 4, boxShadow: '0 18px 40px rgba(0,0,0,0.45), 0 2px 0 rgba(0,0,0,0.2)' }}>
                <img src={photo.url} alt="" style={{ display: 'block', maxWidth: 'min(76vw, 290px)', maxHeight: '48vh', objectFit: 'cover', borderRadius: 2 }} />
              </div>
              {/* cinta que la sostiene */}
              <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -10, width: 74, height: 22, transform: 'translateX(-50%) rotate(-4deg)', background: 'rgba(255,226,170,0.78)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
          )}
          {caption && <p style={{ fontFamily: FONT.hand, color: '#FFF6EA', fontSize: 25, lineHeight: 1.3, margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{caption}</p>}
        </div>
      )}
      {!isDone && (
        <div style={{ position: 'absolute', bottom: 28, display: 'flex', gap: 8 }}>
          {Array.from({ length: slideCount }, (_, i) => (
            <span key={i} className="pg-keep-round" style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 999, background: i <= index ? '#FFD9A8' : 'rgba(255,255,255,0.25)', transition: 'width 0.3s' }} />
          ))}
        </div>
      )}
      {isDone && (
        <div style={{ textAlign: 'center', zIndex: 1 }} className="pg-anim-pop">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span aria-hidden="true" className="pg-keep-round" style={{ position: 'absolute', left: '50%', top: '50%', width: 150, height: 150, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,111,145,0.55) 0%, transparent 68%)' }} />
            <span style={{ position: 'relative', display: 'inline-block', animation: 'pg-bounce 1.6s ease-in-out infinite' }}>
              <IconHeart size={64} color="#FF6F91" fill="#FF6F91" />
            </span>
          </div>
          <p style={{ fontFamily: FONT.hand, color: '#fff', fontSize: 27, margin: '14px 0 24px', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>Gracias por acordarte de mí</p>
          <button onClick={onFinish} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '12px 30px', fontSize: 15 }}>Volver</button>
        </div>
      )}
      {!isDone && (
        <button onClick={onFinish} style={{ position: 'absolute', top: 16, right: 16, color: '#fff', opacity: 0.7, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.body }}>Saltar ✕</button>
      )}
    </div>
  );
}

// Pantalla de error al cargar el regalo (servidor caído, sin red…).
export function LoadErrorScreen({ onRetry }) {
  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center" style={{ padding: '60px 24px', textAlign: 'center', gap: 12 }}>
      <UISprite name="regalo" size={84} />
      <h2 style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink, margin: '6px 0 0' }}>No pudimos abrir tu regalo</h2>
      <p style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 300, lineHeight: 1.5, margin: 0 }}>
        Parece un problema de conexión. Tu regalo está a salvo: revisa tu internet y vuelve a intentarlo.
      </p>
      <button onClick={onRetry} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '12px 28px', fontSize: 14, marginTop: 6 }}>Reintentar</button>
    </div>
  );
}
