import React from 'react';
import { C, FONT, soft } from '../../theme';
import { Screen, ScreenHeader, Modal } from '../ui';
import { IconFlame, IconTrophy, IconSparkle, IconCoin } from '../icons';
import { isDailyBonusReady } from '../../gameState';
import { GAME_META, GAME_LIST } from './meta';

// ── Menú de minijuegos ────────────────────────────────────────────
// En dos columnas: con once juegos en una lista había que bajar casi
// dos pantallas en un celular para ver los últimos.

function GameCard({ id, title, desc, icon: Icon, color, onClick, record, unit, bonusReady }) {
  return (
    <button
      data-game-id={id} onClick={onClick} className="pg-card pg-focus"
      style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5, padding: '9px 10px 8px', textAlign: 'left', cursor: 'pointer', borderRadius: 18, minWidth: 0 }}
    >
      <span style={{ width: 34, height: 34, borderRadius: 12, background: soft(color, 0.72), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} stroke={2.2} />
      </span>
      <div style={{ minWidth: 0, width: '100%' }}>
        <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: C.inkSoft, lineHeight: 1.2, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
        {record != null && (
          <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconTrophy size={11} color={C.amber} /> <b style={{ color: C.inkSoft }}>{record}</b> {unit}
          </div>
        )}
      </div>
      {bonusReady && (
        <span style={{ position: 'absolute', top: 9, right: 9, fontFamily: FONT.display, fontSize: 9.5, fontWeight: 800, color: C.onAccent, background: C.sage, borderRadius: 999, padding: '2px 7px' }}>
          x2 hoy
        </span>
      )}
    </button>
  );
}

export function GamesMenu({ game, onBack, onPlay }) {
  const streak = game.streak || 0;
  return (
    <Screen>
      <ScreenHeader title="Minijuegos" subtitle="Gana monedas para su cuarto" onBack={onBack} />
      {streak > 1 && (
        <div className="pg-card" style={{ width: '100%', maxWidth: 340, padding: '8px 13px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, background: C.amberSoft, borderColor: C.amber }}>
          <IconFlame size={18} color={C.peach} fill={C.amberSoft} />
          <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink }}>{streak} días seguidos jugando</span>
        </div>
      )}
      <div style={{ width: '100%', maxWidth: 340, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingBottom: 12 }}>
        {GAME_LIST.map((g) => (
          <GameCard
            key={g.id} id={g.id} title={GAME_META[g.id].title} desc={g.desc} icon={g.icon} color={g.color}
            record={(game.records || {})[g.id]} unit={GAME_META[g.id].unit}
            bonusReady={isDailyBonusReady(game, g.id)} onClick={() => onPlay(g.id)}
          />
        ))}
      </div>
    </Screen>
  );
}

// ── Resultado (compartido por todos los minijuegos) ───────────────
export function GameResult({ result, onReplay, onExit }) {
  if (!result) return null;
  const { gameId, score, coins, record, isRecord, bonus, reduced } = result;
  const meta = GAME_META[gameId] || {};
  return (
    <Modal onClose={undefined}>
      {isRecord ? (
        <>
          <div style={{ animation: 'pg-breathe 1.4s ease-in-out infinite', display: 'inline-block' }}>
            <IconTrophy size={46} color={C.amber} fill={C.amberSoft} />
          </div>
          <p style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, color: C.amber, margin: '8px 0 0' }}>¡NUEVO RÉCORD!</p>
        </>
      ) : (
        <>
          <IconSparkle size={40} color={C.sage} fill={C.sage} />
          <p style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 700, margin: '8px 0 0', color: C.ink }}>{meta.done || '¡Bien jugado!'}</p>
        </>
      )}
      <p style={{ fontFamily: FONT.display, fontSize: 34, fontWeight: 800, color: C.ink, margin: '10px 0 0', lineHeight: 1 }}>{score}</p>
      <p style={{ fontSize: 12, color: C.inkSoft, margin: '2px 0 0' }}>{meta.unit}</p>
      {record != null && !isRecord && (
        <p style={{ fontSize: 12, color: C.inkFaint, margin: '8px 0 0' }}>Tu récord: <b style={{ color: C.inkSoft }}>{record} {meta.unit}</b></p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '14px 0 0' }}>
        <IconCoin size={18} color={C.amber} />
        <span style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink }}>+{coins}</span>
      </div>
      {bonus && <p style={{ fontSize: 11.5, color: C.sage, fontWeight: 700, margin: '4px 0 0' }}>Bonus del día: monedas dobles</p>}
      {!bonus && reduced && <p style={{ fontSize: 11.5, color: C.inkFaint, margin: '4px 0 0' }}>Hoy ya jugaste mucho a este: paga menos. ¡Prueba otro!</p>}
      <div className="flex gap-3" style={{ marginTop: 18 }}>
        <button onClick={onExit} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Volver</button>
        <button onClick={onReplay} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Jugar otra vez</button>
      </div>
    </Modal>
  );
}
