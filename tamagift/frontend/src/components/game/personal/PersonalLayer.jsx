import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import Sprite from '../../Sprite';
import { ROOM } from '../../../gameState';
import { envelopeSvg } from '../../../art/room/world';
import { cofreSvg, hasRealCofre, voiceEnvelopeSvg } from './art';
import { chestView, chestNext, fmtCountdownShort } from '../../../personal/engine';
import { frascoSvg } from '../../../art/room/personal';

// ─────────────────────────────────────────────────────────────────
// Lo que llega de quien regala, dibujado dentro del cuarto (coordenadas
// del mundo, como los sucesos):
//   · PersonalLayer (delante): la carta por debajo de la puerta y el
//     sobrecito de voz que trajo la mascota;
//   · PersonalBack (detrás de la mascota, Room `backLayer`): el cofre de
//     recuerdos, con su cuenta regresiva y su brillo, y el frasco de
//     estrellas.
// Lo que llega y cuándo lo decide personal/engine.js (y personal/jar.js).
// ─────────────────────────────────────────────────────────────────

export const CHEST_X = 1290;            // centro del cofre en el cuarto
const CHEST_W = 118, CHEST_H = 101;
export const JAR_X = CHEST_X + 108;     // el frasco, al lado del cofre
const JAR_W = 54, JAR_H = 72;
const CHEST_BOTTOM = ROOM.H - 18;

function Tap({ x, y, w, h, onTap, label, children, className, style }) {
  return (
    <button
      data-tap aria-label={label} onClick={onTap} className={className}
      style={{ position: 'absolute', left: x, top: y, width: w, height: h, padding: 0, border: 'none', background: 'none', cursor: 'pointer', zIndex: 4, ...style }}
    >
      {children}
    </button>
  );
}

function Tag({ children, strong }) {
  return (
    <div
      data-photo-skip
      style={{
        position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)', marginBottom: 2,
        background: strong ? C.rose : C.glass, color: strong ? C.onAccent : C.ink, border: `1.5px solid ${strong ? C.roseDeep : C.line}`,
        borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap', boxShadow: SHADOW.soft,
        fontFamily: FONT.display, fontSize: 13, fontWeight: 800, pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}

export default function PersonalLayer({ personal, onLetter, onVoice, pixel }) {
  const showing = personal && personal.showing;
  if (!showing) return null;
  if (showing.kind === 'carta' || showing.kind === 'respuesta') {
    return (
      <Tap x={200} y={ROOM.H - 66} w={64} h={54} label="Abrir la carta" className="pg-parcel" onTap={() => onLetter(showing.id)}>
        <Sprite markup={envelopeSvg()} cacheKey="envelope" w={60} h={50} pixel={pixel} />
      </Tap>
    );
  }
  if (showing.kind === 'voz') {
    return (
      <Tap x={(showing.x || 600) - 32} y={ROOM.H - 66} w={64} h={54} label="Escuchar la nota de voz" className="pg-parcel" onTap={() => onVoice(showing.id)}>
        <Sprite markup={voiceEnvelopeSvg()} cacheKey="sobre-voz" w={64} h={51} pixel={pixel} />
      </Tap>
    );
  }
  return null;
}

// El cofre y el frasco: van apoyados en el piso, detrás de la mascota.
//   jar: { fill (0..1), bump: { key, n } | null } | null
export function PersonalBack({ personal, jar, editing, onChest, onJar, pixel }) {
  const hasChest = !!(personal && personal.chest && personal.chest.length);
  const [now, setNow] = useState(Date.now());
  // la cuenta regresiva: cada segundo si falta poco, si no cada medio minuto
  const next = hasChest ? chestNext(personal, now) : null;
  const fast = next && next.openAt - now < 3600 * 1000;
  useEffect(() => {
    if (!hasChest) return undefined;
    const id = setInterval(() => setNow(Date.now()), fast ? 1000 : 30000);
    return () => clearInterval(id);
  }, [hasChest, fast]);
  // "+3" sobre el frasco cuando gana estrellas
  const [bump, setBump] = useState(null);
  const bumpKey = jar && jar.bump && jar.bump.key;
  useEffect(() => {
    if (!bumpKey) return undefined;
    setBump(jar.bump);
    const t = setTimeout(() => setBump(null), 2600);
    return () => clearTimeout(t);
  }, [bumpKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (editing) return null;
  const view = hasChest ? chestView(personal, now) : [];
  const ready = view.find((it) => it.state === 'ready');
  const fillStep = jar ? Math.round(Math.max(0, Math.min(1, jar.fill || 0)) * 20) : 0;

  return (
    <>
      {hasChest && (
        <Tap
          x={CHEST_X - CHEST_W / 2} y={CHEST_BOTTOM - CHEST_H} w={CHEST_W} h={CHEST_H}
          label={ready ? 'El cofre de recuerdos brilla: ábrelo' : 'Abrir el cofre de recuerdos'}
          className={ready ? 'pg-glint' : undefined} style={{ zIndex: 'auto' }}
          onTap={onChest}
        >
          <Sprite
            markup={cofreSvg({ open: false, glow: !!ready })}
            cacheKey={`cofre-${ready ? 'glow' : 'calm'}-${hasRealCofre ? 'art' : 'tmp'}`}
            w={CHEST_W} h={CHEST_H} pixel={pixel}
          />
          {ready ? <Tag strong>¡Ábreme!</Tag> : next ? <Tag>{fmtCountdownShort(next.openAt - now)}</Tag> : null}
        </Tap>
      )}
      {jar && (
        <Tap
          x={JAR_X - JAR_W / 2} y={CHEST_BOTTOM - JAR_H} w={JAR_W} h={JAR_H}
          label="Abrir el frasco de estrellas" className={bump ? 'pg-glint' : undefined} style={{ zIndex: 'auto' }}
          onTap={onJar}
        >
          <Sprite markup={frascoSvg({ fill: fillStep / 20 })} cacheKey={`frasco-${fillStep}`} w={JAR_W} h={JAR_H} pixel={pixel} />
          {bump ? <Tag strong>+{bump.n}</Tag> : null}
        </Tap>
      )}
    </>
  );
}
