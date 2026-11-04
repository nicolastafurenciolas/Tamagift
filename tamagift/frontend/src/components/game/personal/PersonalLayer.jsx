import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import Sprite from '../../Sprite';
import PetArt from '../../PetArt';
import { ROOM } from '../../../gameState';
import { envelopeSvg } from '../../../art/room/world';
import { parcelSvg } from '../../../art/room/door';
import { cofreSvg, hasRealCofre, voiceEnvelopeSvg, repisitaSvg, REPISITA } from './art';
import { chestView, chestNext, chestReady, fmtCountdownShort } from '../../../personal/engine';
import { frascoSvg, diarioSvg } from '../../../art/room/personal';
import StoryLayer from './StoryLayer';

// ─────────────────────────────────────────────────────────────────
// Lo que llega de quien regala y la vida del cuarto, dibujado dentro del
// cuarto (coordenadas del mundo, como los sucesos):
//   · PersonalLayer (delante de la mascota): la carta por debajo de la
//     puerta, el sobrecito de voz, el mochi de quien regala cuando viene
//     en persona, el paso de hoy de una historia y el letrerito del cofre
//     (encima de todo, para que la mascota no lo tape);
//   · PersonalBack (detrás de la mascota, Room `backLayer`): el cofre de
//     recuerdos, el frasco de estrellas y la repisita con el diario.
// Lo que llega y cuándo lo deciden personal/engine.js, jar.js,
// stories.js, life.js y diary.js.
// ─────────────────────────────────────────────────────────────────

export const CHEST_X = 1290;            // centro del cofre en el cuarto
const CHEST_W = 118, CHEST_H = 101;
export const JAR_X = CHEST_X + 108;     // el frasco, al lado del cofre
const JAR_W = 54, JAR_H = 72;
const CHEST_BOTTOM = ROOM.H - 18;
// la repisita del diario, en la pared sobre el cofre
const SHELF_X = CHEST_X + 40, SHELF_Y = ROOM.FLOOR_Y - 96;
const DIARY_W = 66, DIARY_H = 54;
// el mochi de quien regala, cuando viene en persona (junto a la puerta)
export const VISIT_SPOT = 480;          // donde espera la mascota
const GIVER_SIZE = 170, GIVER_LEFT = VISIT_SPOT - 70 - GIVER_SIZE;

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

function Tag({ children, strong, style }) {
  return (
    <div
      data-photo-skip
      style={{
        position: 'absolute', transform: 'translateX(-50%)',
        background: strong ? C.rose : C.glass, color: strong ? C.onAccent : C.ink, border: `1.5px solid ${strong ? C.roseDeep : C.line}`,
        borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap', boxShadow: SHADOW.soft,
        fontFamily: FONT.display, fontSize: 13, fontWeight: 800, pointerEvents: 'none', zIndex: 6, ...style,
      }}
    >
      {children}
    </div>
  );
}

// La cuenta regresiva del cofre (o "¡Ábreme!"), por encima de todo.
function ChestTag({ personal, editing }) {
  const hasChest = !!(personal && personal.chest && personal.chest.length);
  const [now, setNow] = useState(Date.now());
  const next = hasChest ? chestNext(personal, now) : null;
  const fast = next && next.openAt - now < 3600 * 1000;
  useEffect(() => {
    if (!hasChest) return undefined;
    const id = setInterval(() => setNow(Date.now()), fast ? 1000 : 30000);
    return () => clearInterval(id);
  }, [hasChest, fast]);
  if (!hasChest || editing) return null;
  const ready = chestReady(personal, now);
  if (!ready && !next) return null;
  const at = { left: CHEST_X, top: CHEST_BOTTOM - CHEST_H - 30 };
  return ready ? <Tag strong style={at}>¡Ábreme!</Tag> : <Tag style={at}>{fmtCountdownShort(next.openAt - now)}</Tag>;
}

// El mochi de quien regala, en persona: trae lo de hoy, se queda un
// ratito con la mascota y se despide.
//   visit = { phase: 'llega' | 'abrazo' | 'chau', recipe, kind, line, onTap }
function GiverVisit({ visit, pixel }) {
  const icon = visit.kind === 'voz'
    ? <Sprite markup={voiceEnvelopeSvg()} cacheKey="sobre-voz" w={52} h={42} pixel={pixel} />
    : visit.kind === 'paquete'
      ? <Sprite markup={parcelSvg(false)} cacheKey="parcel-closed" w={58} h={56} pixel={pixel} />
      : <Sprite markup={envelopeSvg()} cacheKey="envelope" w={52} h={44} pixel={pixel} />;
  const leaving = visit.phase === 'chau';
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: leaving ? 0 : 1, transition: 'opacity 1.6s ease-in 0.6s', pointerEvents: leaving ? 'none' : 'auto' }}>
      <Tap
        x={GIVER_LEFT} y={ROOM.H - 6 - GIVER_SIZE} w={GIVER_SIZE} h={GIVER_SIZE}
        label={visit.phase === 'llega' ? 'Recibir lo que trae' : 'El mochi de quien te regaló esto'}
        onTap={visit.phase === 'llega' ? visit.onTap : undefined} style={{ zIndex: 3, cursor: visit.phase === 'llega' ? 'pointer' : 'default' }}
      >
        <div className={visit.phase === 'abrazo' ? 'pg-parcel' : undefined}><PetArt recipe={visit.recipe} mood="feliz" size={GIVER_SIZE} /></div>
        {visit.phase === 'llega' && <div className="pg-parcel" style={{ position: 'absolute', right: -14, bottom: 14 }}>{icon}</div>}
      </Tap>
    </div>
  );
}

// Delante de la mascota.
//   personal: game.personal · onLetter(id) · onVoice(id)
//   story: { beat, onChoice, onDismiss } | null · visit (ver GiverVisit) | null
export default function PersonalLayer({ personal, onLetter, onVoice, story, visit, editing, pixel }) {
  const showing = personal && personal.showing;
  let item = null;
  // si su mochi vino en persona, lo trae en la mano (no aparece aparte)
  if (showing && !visit && (showing.kind === 'carta' || showing.kind === 'respuesta')) {
    item = (
      <Tap x={200} y={ROOM.H - 66} w={64} h={54} label="Abrir la carta" className="pg-parcel" onTap={() => onLetter(showing.id)}>
        <Sprite markup={envelopeSvg()} cacheKey="envelope" w={60} h={50} pixel={pixel} />
      </Tap>
    );
  } else if (showing && !visit && showing.kind === 'voz') {
    item = (
      <Tap x={(showing.x || 600) - 32} y={ROOM.H - 66} w={64} h={54} label="Escuchar la nota de voz" className="pg-parcel" onTap={() => onVoice(showing.id)}>
        <Sprite markup={voiceEnvelopeSvg()} cacheKey="sobre-voz" w={64} h={51} pixel={pixel} />
      </Tap>
    );
  }
  return (
    <>
      {item}
      {visit && <GiverVisit visit={visit} pixel={pixel} />}
      {story && story.beat && <StoryLayer beat={story.beat} pixel={pixel} />}
      <ChestTag personal={personal} editing={editing} />
    </>
  );
}

// El cofre, el frasco y el diario: detrás de la mascota.
//   jar: { fill (0..1), bump: { key, n } | null } | null
//   diary: { hasNew, onOpen } | null
export function PersonalBack({ personal, jar, diary, editing, onChest, onJar, pixel }) {
  const hasChest = !!(personal && personal.chest && personal.chest.length);
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
  const ready = hasChest ? chestView(personal, Date.now()).find((it) => it.state === 'ready') : null;
  const fillStep = jar ? Math.round(Math.max(0, Math.min(1, jar.fill || 0)) * 20) : 0;

  return (
    <>
      {diary && (
        <>
          <div style={{ position: 'absolute', left: SHELF_X - REPISITA.w / 2, top: SHELF_Y - REPISITA.top, width: REPISITA.w, height: REPISITA.h, pointerEvents: 'none' }}>
            <Sprite markup={repisitaSvg()} cacheKey="repisita-diario" w={REPISITA.w} h={REPISITA.h} pixel={pixel} />
          </div>
          <Tap
            x={SHELF_X - DIARY_W / 2 - 14} y={SHELF_Y - DIARY_H + 4} w={DIARY_W} h={DIARY_H}
            label={diary.hasNew ? 'El diario tiene una página nueva' : 'Abrir el diario'} style={{ zIndex: 'auto' }}
            onTap={diary.onOpen}
          >
            <Sprite markup={diarioSvg()} cacheKey="diario-cerrado" w={DIARY_W} h={DIARY_H} pixel={pixel} />
            {diary.hasNew && (
              <span className="pg-keep-round pg-glint" aria-hidden style={{ position: 'absolute', right: 2, top: 2, width: 11, height: 11, borderRadius: '50%', background: C.rose, border: '2px solid #FFFFFF', boxShadow: SHADOW.soft }} />
            )}
          </Tap>
        </>
      )}
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
        </Tap>
      )}
      {jar && (
        <Tap
          x={JAR_X - JAR_W / 2} y={CHEST_BOTTOM - JAR_H} w={JAR_W} h={JAR_H}
          label="Abrir el frasco de estrellas" className={bump ? 'pg-glint' : undefined} style={{ zIndex: 'auto' }}
          onTap={onJar}
        >
          <Sprite markup={frascoSvg({ fill: fillStep / 20 })} cacheKey={`frasco-${fillStep}`} w={JAR_W} h={JAR_H} pixel={pixel} />
          {bump ? <Tag strong style={{ left: '50%', bottom: '100%', marginBottom: 2 }}>+{bump.n}</Tag> : null}
        </Tap>
      )}
    </>
  );
}
