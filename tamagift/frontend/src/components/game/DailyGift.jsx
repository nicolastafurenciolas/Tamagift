import React, { useState } from 'react';
import { C, FONT, soft } from '../../theme';
import { Modal } from '../ui';
import Sprite from '../Sprite';
import { IconFlame } from '../icons';
import { UI_SPRITES, foodSpriteFor } from '../../sprites';
import { DAILY_REWARDS } from '../../daily';
import { findFood } from '../../foodCatalog';
import { downloadReminder } from '../../reminder';
import { play } from '../../sound';

// ─────────────────────────────────────────────────────────────────
// El premio de cada día: el calendario de 7 casilleros (daily.js), la
// racha y, abajo, el recordatorio para el calendario del teléfono.
// ─────────────────────────────────────────────────────────────────

function RewardIcon({ r, size = 30 }) {
  if (r.kind === 'comida') {
    const sp = foodSpriteFor(r.refId);
    return <Sprite art={sp.render()} cacheKey={`food-${sp.id}`} w={size} h={size} />;
  }
  if (r.kind === 'sorpresa' || r.kind === 'decor') return <Sprite art={UI_SPRITES.regalo()} cacheKey="ui-regalo" w={size} h={size} />;
  return <Sprite art={UI_SPRITES.moneda()} cacheKey="ui-moneda" w={size} h={size} />;
}

const rewardLabel = (r) => {
  if (r.kind === 'monedas') return `${r.value} monedas`;
  if (r.kind === 'comida') return `${(findFood(r.refId) || {}).name || 'Comida'} ×${r.n}`;
  if (r.kind === 'decor') return r.label;
  return 'Sorpresa';
};

const HOURS = [8, 12, 18, 20, 21];

// `status`: dailyStatus(); `claimed`: el premio recién recogido (o null).
export default function DailyGift({ status, claimed, streakAfter, petName, giftUrl, slug, onClaim, onClose }) {
  const [hour, setHour] = useState(20);
  const [saved, setSaved] = useState(false);
  const step = status.step;
  const done = !!claimed;
  return (
    <Modal onClose={onClose} maxWidth={360} z={78}>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 2px' }}>Premio del día</h2>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 10px' }}>Cada día que vienes a ver a {petName} avanza un casillero.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
        {DAILY_REWARDS.map((r, i) => {
          const past = done ? i <= step : i < step;
          const today = i === step;
          const big = i === DAILY_REWARDS.length - 1;
          return (
            <div
              key={i} className={today && !done ? 'pg-glint' : undefined}
              style={{
                gridColumn: big ? 'span 2' : undefined, borderRadius: 12, padding: '6px 4px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: today ? soft(C.amber, 0.7) : C.paperDeep, border: `2px solid ${today ? C.amber : C.line}`, opacity: past && !today ? 0.55 : 1, position: 'relative',
              }}
            >
              <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 800, color: C.inkSoft }}>Día {i + 1}</span>
              <RewardIcon r={r} size={big ? 36 : 28} />
              <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 700, color: C.ink, lineHeight: 1.05, textAlign: 'center' }}>
                {r.kind === 'monedas' ? r.value : r.kind === 'comida' ? `×${r.n}` : 'Sorpresa'}
              </span>
              {past && <span className="pg-keep-round" style={{ position: 'absolute', top: 3, right: 4, width: 14, height: 14, borderRadius: '50%', background: C.sage, color: C.onAccent, fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center' }}>✓</span>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '10px 0 2px', fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.peach }}>
        <IconFlame size={17} color={C.peach} fill={C.amberSoft} />
        {streakAfter > 1 ? `${streakAfter} días seguidos` : 'Primer día de tu racha'}
      </div>

      {done ? (
        <div className="pg-anim-pop" style={{ margin: '8px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <RewardIcon r={claimed} size={34} />
          <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink, textAlign: 'left' }}>
            {claimed.kind === 'decor' ? `¡Sorpresa! ${claimed.label} llega a la puerta` : claimed.kind === 'comida' ? `${rewardLabel(claimed)} a la nevera` : `+${claimed.value} monedas`}
          </span>
        </div>
      ) : (
        <button onClick={onClaim} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 8, padding: '11px 28px', fontSize: 14.5 }}>Recoger</button>
      )}

      {giftUrl && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1.5px dashed ${C.line}`, textAlign: 'left' }}>
          <div style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: C.ink }}>¿Te recuerdo venir cada día?</div>
          <p style={{ fontSize: 11.5, color: C.inkSoft, margin: '2px 0 8px', lineHeight: 1.35 }}>Se agrega a tu calendario con el link de {petName}, y te avisa a la hora que elijas.</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select
              value={hour} onChange={(e) => setHour(Number(e.target.value))} aria-label="Hora del recordatorio" className="pg-focus"
              style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.ink, background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 10, padding: '7px 8px' }}
            >
              {HOURS.map((h) => <option key={h} value={h}>{`${h > 12 ? h - 12 : h}:00 ${h < 12 ? 'a. m.' : 'p. m.'}`}</option>)}
            </select>
            <button
              onClick={() => { play('pop'); downloadReminder({ petName, url: giftUrl, slug, hour }); setSaved(true); }}
              className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '8px 10px', fontSize: 12.5 }}
            >
              {saved ? 'Listo, revisa tu calendario' : 'Agregar a mi calendario'}
            </button>
          </div>
        </div>
      )}

      {done && <button onClick={onClose} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 14, padding: '10px 28px', fontSize: 14 }}>¡Gracias!</button>}
    </Modal>
  );
}
