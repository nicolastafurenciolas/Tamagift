import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader } from '../ui';
import { IconTub, IconSparkle } from '../icons';
import Pet from '../Pet';
import { UISprite } from './common';
import Sprite from '../Sprite';
import { useStyle } from '../../styles/StyleContext';
import { bathBackSvg, bathFrontSvg, bathBubbleSvg, bathSteamSvg } from '../../art/room/bath';

// El fondo y el frente de la tina se arman una vez: son siempre iguales.
const BACK = bathBackSvg();
const FRONT = bathFrontSvg();
const BUBBLE = bathBubbleSvg();
const STEAM = bathSteamSvg();

// Burbujas que suben solas desde la espuma y vapor que se eleva: la tina
// está viva aunque no frotes. (x, tamaño, demora, duración)
const RISING = [[58, 16, 0, 3.6], [112, 12, 1.3, 3.1], [196, 14, 2.2, 3.8], [246, 11, 0.7, 3.3]];
const WISPS = [[86, 0, 5.5], [214, 2.4, 6.2]];
const KEYFRAMES = `
@keyframes tg-bath-rise { 0% { transform: translate(0, 0) scale(0.6); opacity: 0; } 12% { opacity: 1; } 50% { transform: translate(5px, -46px) scale(1); } 85% { opacity: 0.9; } 100% { transform: translate(-3px, -96px) scale(1.05); opacity: 0; } }
@keyframes tg-bath-steam { 0% { transform: translateY(0) scaleY(0.8); opacity: 0; } 30% { opacity: 0.9; } 100% { transform: translateY(-70px) scaleY(1.15); opacity: 0; } }`;

// ── Baño ──────────────────────────────────────────────────────────
// La mascota está DENTRO de la tina: fondo (pared, piso, tina por dentro)
// → mascota → frente de la tina con espuma. Todo pasa por el estilo.
// La escena trabaja en coordenadas fijas de 300×380 y se dibuja escalada
// (antes medía 300×380 píxeles fijos y en un celular bajo obligaba a
// hacer scroll). El puntero se normaliza contra el tamaño real.

export const BATH_W = 300;
export const BATH_H = 380;
export const PET_CENTER = { x: 150, y: 174 };

export default function Bathroom({
  petName, mood, look, bathProgress, bathDone, spongePos, bubbles, onBack,
  onSpongeDown, onSpongeMove, onSpongeUp,
}) {
  const areaRef = useRef(null);
  const { style } = useStyle();
  const [scale, setScale] = useState(1);
  useEffect(() => {
    // La escena llena el ancho del celular (antes quedaba chiquita, con
    // media pantalla vacía abajo). La escala va de a 0.02 para no volver
    // a dibujar todo por cada píxel al girar el teléfono.
    const calc = () => {
      const byH = (window.innerHeight - 236) / BATH_H;
      const byW = (Math.min(window.innerWidth, 460) - 28) / BATH_W;
      setScale(Math.round(Math.max(0.62, Math.min(1.32, byH, byW)) * 50) / 50);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // En pixel, cada píxel de arte mide 2 px de pantalla ya escalado (como
  // en el cuarto): sin esto la escena agrandada quedaba con píxeles
  // disparejos.
  const pixel = style.art.kind === 'pixel' ? (style.art.pixel || 2) / scale : undefined;

  // Coordenadas del puntero en el espacio fijo de la escena.
  const toScene = (e) => {
    const rect = areaRef.current.getBoundingClientRect();
    return {
      x: Math.max(22, Math.min(BATH_W - 22, ((e.clientX - rect.left) / rect.width) * BATH_W)),
      y: Math.max(22, Math.min(BATH_H - 22, ((e.clientY - rect.top) / rect.height) * BATH_H)),
    };
  };

  return (
    <Screen>
      <ScreenHeader title="Hora del baño" subtitle={bathDone ? '¡Quedó reluciente!' : `Frota la esponja sobre ${petName}`} onBack={onBack} />
      <div style={{ width: BATH_W * scale, height: BATH_H * scale }}>
        <div
          ref={areaRef}
          className="pg-sticker"
          style={{
            position: 'relative', width: BATH_W, height: BATH_H, overflow: 'hidden', borderRadius: 28,
            transform: `scale(${scale})`, transformOrigin: '0 0',
            background: C.water2,
            touchAction: 'none',
          }}
          onPointerMove={(e) => onSpongeMove(e, toScene(e))}
          onPointerUp={onSpongeUp}
          onPointerCancel={onSpongeUp}
        >
          <div style={{ position: 'absolute', left: 0, top: 0 }}>
            <Sprite markup={BACK} cacheKey="bath-back" w={BATH_W} h={BATH_H} kind="surface" pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: PET_CENTER.x - 78, top: PET_CENTER.y - 78, width: 156, height: 156 }}>
            <Pet mood={bathDone ? 'feliz' : mood} look={look} size={156} idle onPoke={() => {}} showShadow={false} pixel={pixel} />
            {bathProgress > 0 && !bathDone && (
              <div style={{ position: 'absolute', inset: 0, opacity: Math.min(0.95, 0.3 + bathProgress / 120), pointerEvents: 'none' }}>
                <UISprite name="burbuja" size={30} style={{ position: 'absolute', left: 12, top: 22 }} />
                <UISprite name="burbuja" size={24} style={{ position: 'absolute', right: 8, top: 44 }} />
                <UISprite name="burbuja" size={20} style={{ position: 'absolute', left: 44, bottom: 14 }} />
                <UISprite name="burbuja" size={18} style={{ position: 'absolute', right: 34, bottom: 30 }} />
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
            <Sprite markup={FRONT} cacheKey="bath-front" w={BATH_W} h={BATH_H} pixel={pixel} />
          </div>
          {/* burbujas y vapor que suben solos (en pixel, a saltitos) */}
          <style>{KEYFRAMES}</style>
          {WISPS.map(([x, delay, dur]) => (
            <div key={`w${x}`} style={{ position: 'absolute', left: x - 14, top: 150, width: 28, height: 56, pointerEvents: 'none', animation: `tg-bath-steam ${dur}s ${pixel ? 'steps(10)' : 'ease-out'} ${delay}s infinite`, opacity: 0 }}>
              <Sprite markup={STEAM} cacheKey="bath-steam" w={28} h={56} pixel={pixel} />
            </div>
          ))}
          {RISING.map(([x, size, delay, dur]) => (
            <div key={`b${x}`} style={{ position: 'absolute', left: x - size / 2, top: 206 - size / 2, width: size, height: size, pointerEvents: 'none', animation: `tg-bath-rise ${dur}s ${pixel ? 'steps(14)' : 'ease-out'} ${delay}s infinite`, opacity: 0 }}>
              <Sprite markup={BUBBLE} cacheKey="bath-bubble" w={size} h={size} pixel={pixel} />
            </div>
          ))}
          {bubbles.map((b) => (
            <div key={b.id} style={{ position: 'absolute', left: b.x - 11, top: b.y - 11, animation: 'pg-bubble-float 0.9s ease-out forwards', pointerEvents: 'none' }}>
              <UISprite name="burbuja" size={22} />
            </div>
          ))}
          {!bathDone && (
            <div
              onPointerDown={(e) => { e.preventDefault(); areaRef.current.setPointerCapture(e.pointerId); onSpongeDown(e); }}
              aria-label="Esponja"
              style={{ position: 'absolute', left: spongePos.x - 28, top: spongePos.y - 28, width: 56, height: 56, cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' }}
            >
              <UISprite name="esponja" size={56} />
            </div>
          )}
          {bathDone && (
            <div className="pg-anim-pop" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <IconSparkle size={56} color={C.amber} fill={C.amber} />
            </div>
          )}
        </div>
      </div>
      <div style={{ width: Math.min(280, BATH_W * scale), marginTop: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconTub size={20} color={C.sky} />
        <div style={{ flex: 1, height: 12, borderRadius: 999, background: C.track, overflow: 'hidden' }}>
          <div style={{ width: `${bathProgress}%`, height: '100%', background: C.sky, transition: 'width 0.2s' }} />
        </div>
      </div>
      {bathDone && (
        <button onClick={onBack} className="pg-btn pg-btn-rose pg-focus pg-anim-pop" style={{ padding: '11px 26px', fontSize: 14, fontFamily: FONT.display }}>
          Volver con {petName}
        </button>
      )}
    </Screen>
  );
}
