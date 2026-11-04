import React from 'react';
import { C, FONT, SHADOW } from '../../../theme';
import Sprite from '../../Sprite';
import { ROOM } from '../../../gameState';
import { visitorArt } from '../../../art/room/visitors';
import { findDecor } from '../../../shopCatalog';
import { CAST } from '../../../personal/stories';

// ─────────────────────────────────────────────────────────────────
// El paso de hoy de una historia de varios días (personal/stories.js),
// dibujado en el cuarto junto a la puerta: los visitantes (Tobi, Mimi, el
// gato del barrio), lo que dicen y como mucho dos respuestas. La planta
// que crece se ve en el piso, al lado.
//
// En el cuarto van los visitantes (a la izquierda de la mascota, que
// espera en STORY_SPOT) y la planta; lo que dicen y las respuestas van en
// una tarjeta fija arriba del cuarto (StoryCard), así siempre se ve
// aunque la cámara esté en otro lado.
// ─────────────────────────────────────────────────────────────────

export const STORY_SPOT = 480;           // donde se para la mascota
const VISIT_RIGHT = STORY_SPOT - 70;  // los visitantes terminan aquí

// La planta de la historia: un adorno del catálogo que crece por etapas;
// en la última, la flor de su ficha (tulipanes, rosas o un jarrón).
function PlantProp({ prop, pixel }) {
  const stage = Math.max(0, Math.min(3, prop.stage || 0));
  const id = stage >= 3 ? (/tulip/i.test(prop.flor || '') ? 'tulipanes' : /rosa/i.test(prop.flor || '') ? 'rosas' : 'jarron') : 'planta';
  const d = findDecor(id);
  if (!d) return null;
  const k = stage >= 3 ? 1.25 : 0.7 + stage * 0.2;
  const w = Math.round(d.w * k), h = Math.round(d.h * k);
  return (
    <div style={{ position: 'absolute', left: STORY_SPOT + 120 - w / 2, top: ROOM.H - 14 - h + (d.foot || 0) * k, width: w, height: h, pointerEvents: 'none' }}>
      <Sprite markup={d.svg()} cacheKey={`historia-${id}`} w={w} h={h} pixel={pixel} />
    </div>
  );
}

export default function StoryLayer({ beat, pixel }) {
  if (!beat) return null;
  const arts = (beat.visitors || []).map((v) => visitorArt(v.id, v.pose)).filter(Boolean)
    .map((a) => { const k = 0.8; return { ...a, k, sw: Math.round(a.w * k), sh: Math.round(a.h * k) }; });
  // de derecha a izquierda, pegados a la mascota
  let right = VISIT_RIGHT;
  const placed = arts.map((a) => { const left = right - a.sw; right = left + 40; return { ...a, left }; });
  return (
    <>
      {beat.prop && beat.prop.id === 'planta' && <PlantProp prop={beat.prop} pixel={pixel} />}
      {placed.map((a, i) => (
        <div key={`${a.id}-${i}`} className="pg-anim-pop" style={{ position: 'absolute', left: a.left, top: ROOM.H - 6 - a.sh + (a.foot || 0) * a.k, width: a.sw, height: a.sh, zIndex: 3, pointerEvents: 'none' }}>
          <Sprite markup={a.svg} cacheKey={`visita-${a.id}`} w={a.sw} h={a.sh} kind="pet" pixel={pixel} />
        </div>
      ))}
    </>
  );
}

// La tarjeta del paso (fija arriba del cuarto): quién habla, qué dice y
// como mucho dos respuestas. También la usa la visita del mochi de quien
// regala (`who` + `text` + una acción).
export function StoryCard({ who, text, choices, onChoice, onDismiss, dismissLabel = '¡Ya veremos!', tone = 'lavender' }) {
  return (
    <div data-photo-skip className="pg-anim-pop" style={{ pointerEvents: 'auto', width: '100%', maxWidth: 300 }}>
      <div style={{ background: C.glass, border: `1.5px solid ${C[tone]}`, borderRadius: 14, padding: '7px 11px 9px', boxShadow: SHADOW.soft, textAlign: 'center' }}>
        {who && <div style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 800, color: C[tone], marginBottom: 2 }}>{who}</div>}
        <div style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{text}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {(choices || []).length ? choices.map((c, i) => (
          <button key={c.id} onClick={() => onChoice(c.id)} className={`pg-btn ${i === 0 ? 'pg-btn-rose' : 'pg-btn-ghost'} pg-focus`} style={{ flex: 1, padding: '7px 6px', fontSize: 12.5 }}>{c.label}</button>
        )) : onDismiss ? (
          <button onClick={onDismiss} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '7px 6px', fontSize: 12.5 }}>{dismissLabel}</button>
        ) : null}
      </div>
    </div>
  );
}

export const storyWho = (beat) => {
  const who = CAST[beat.who] ? CAST[beat.who].label : beat.title;
  return `${who || ''}${beat.of > 1 ? ` · ${beat.index + 1}/${beat.of}` : ''}`;
};
