import React from 'react';
import { C, FONT, soft } from '../../theme';
import { Screen, ScreenHeader, Modal } from '../ui';
import { IconFlame, IconTrophy, IconSparkle, IconCoin } from '../icons';
import { isDailyBonusReady } from '../../gameState';
import { LEVEL_GAMES, isLevelGame, progressOf, totalStars, dailyChallenge, isChallengeDone, goalsFor } from '../../gameProgress';
import { GAME_META, GAME_LIST, NEW_GAMES } from './meta';
import { StarRow } from './levelUi';
import { IconTarget } from './gameIcons';

// ── Menú de minijuegos ────────────────────────────────────────────
// En dos columnas. Cada tarjeta dice cómo vas (nivel y estrellas, o
// rango) y el reto de hoy: siempre hay algo que ir a buscar.

function Progress({ id, game }) {
  if (isLevelGame(id)) {
    const p = progressOf(game, id);
    return (
      <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
        <b style={{ color: C.ink }}>Nivel {Math.min(p.unlocked, LEVEL_GAMES[id])}</b>
        <span style={{ color: C.amber }}>★</span>{totalStars(game, id)}/{LEVEL_GAMES[id] * 3}
      </div>
    );
  }
  const p = progressOf(game, id);
  const record = (game.records || {})[id];
  return (
    <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <b style={{ color: C.ink }}>Rango {p.rank}</b><StarRow n={p.rankStars} size={10.5} />
      {record != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><IconTrophy size={10} color={C.amber} />{record}</span>}
    </div>
  );
}

function GameCard({ id, title, desc, icon: Icon, color, onClick, game }) {
  const ch = dailyChallenge(id);
  const chDone = isChallengeDone(game, id);
  const isNew = NEW_GAMES.has(id) && !(game.seenGames || []).includes(id);
  const bonusReady = isDailyBonusReady(game, id);
  return (
    <button
      data-game-id={id} onClick={onClick} className="pg-card pg-focus"
      style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '9px 10px 8px', textAlign: 'left', cursor: 'pointer', borderRadius: 18, minWidth: 0 }}
    >
      <span style={{ width: 34, height: 34, borderRadius: 12, background: soft(color, 0.72), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} stroke={2.2} />
      </span>
      <div style={{ minWidth: 0, width: '100%' }}>
        <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: C.inkSoft, lineHeight: 1.2, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
        <Progress id={id} game={game} />
        {ch && (
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'flex-start', gap: 4, fontSize: 10, lineHeight: 1.25, color: chDone ? C.sageDeep : C.inkSoft, background: chDone ? soft(C.sage, 0.7) : soft(C.amber, 0.82), borderRadius: 8, padding: '3px 6px', width: '100%', boxSizing: 'border-box' }}>
            {chDone ? <span style={{ fontWeight: 800 }}>✓</span> : <IconTarget size={11} color={C.amber} />}
            <span style={{ textDecoration: chDone ? 'line-through' : 'none' }}>{ch.text}</span>
          </div>
        )}
      </div>
      {(isNew || bonusReady) && (
        <span style={{ position: 'absolute', top: 9, right: 9, fontFamily: FONT.display, fontSize: 9.5, fontWeight: 800, color: C.onAccent, background: isNew ? C.rose : C.sage, borderRadius: 999, padding: '2px 7px' }}>
          {isNew ? 'Nuevo' : 'x2 hoy'}
        </span>
      )}
    </button>
  );
}

export function GamesMenu({ game, onBack, onPlay }) {
  const streak = game.streak || 0;
  const doneToday = GAME_LIST.filter((g) => isChallengeDone(game, g.id)).length;
  return (
    <Screen>
      <ScreenHeader title="Minijuegos" subtitle="Gana monedas para su cuarto" onBack={onBack} />
      <div className="pg-card" style={{ width: '100%', maxWidth: 340, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconTarget size={20} color={C.amber} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink }}>Retos de hoy: {doneToday} de {GAME_LIST.length}</div>
          <div style={{ height: 6, borderRadius: 999, background: C.track, marginTop: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(doneToday / GAME_LIST.length) * 100}%`, height: '100%', background: C.sage, borderRadius: 999 }} />
          </div>
        </div>
        {streak > 1 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.peach }}>
            <IconFlame size={16} color={C.peach} fill={C.amberSoft} />{streak}
          </span>
        )}
      </div>
      <div style={{ width: '100%', maxWidth: 340, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingBottom: 12 }}>
        {GAME_LIST.map((g) => (
          <GameCard key={g.id} id={g.id} title={GAME_META[g.id].title} desc={g.desc} icon={g.icon} color={g.color} game={game} onClick={() => onPlay(g.id)} />
        ))}
      </div>
    </Screen>
  );
}

// ── Resultado (compartido por todos los minijuegos) ───────────────
export function GameResult({ result, onReplay, onExit }) {
  if (!result) return null;
  const { gameId, score, coins, challengeCoins = 0, record, isRecord, bonus, reduced, extra = {}, info = {} } = result;
  const meta = GAME_META[gameId] || {};
  const levelGame = isLevelGame(gameId);
  const won = levelGame ? !!extra.won : true;
  const lastLevel = levelGame && extra.level >= LEVEL_GAMES[gameId];
  const next = levelGame && won && !lastLevel ? extra.level + 1 : levelGame ? extra.level : null;
  const goals = !levelGame ? goalsFor(gameId, info.rank && info.rankUp ? info.rank - 1 : info.rank || 1) : null;
  return (
    <Modal onClose={undefined}>
      {levelGame ? (
        <>
          <p style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.inkSoft, margin: 0 }}>Nivel {extra.level}</p>
          <p style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: won ? C.ink : C.roseDeep, margin: '2px 0 6px' }}>
            {won ? (meta.done || '¡Nivel superado!') : '¡Casi! Inténtalo otra vez'}
          </p>
          <StarRow n={info.stars || 0} size={34} animate gap={4} />
          {info.unlockedLevel && <p style={{ fontSize: 12, color: C.sageDeep, fontWeight: 700, margin: '6px 0 0' }}>Desbloqueaste el nivel {info.unlockedLevel}</p>}
          <p style={{ fontSize: 12, color: C.inkFaint, margin: '6px 0 0' }}>{score} {meta.unit}</p>
        </>
      ) : isRecord ? (
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
      {!levelGame && (
        <>
          <p style={{ fontFamily: FONT.display, fontSize: 34, fontWeight: 800, color: C.ink, margin: '10px 0 0', lineHeight: 1 }}>{score}</p>
          <p style={{ fontSize: 12, color: C.inkSoft, margin: '2px 0 0' }}>{meta.unit}</p>
          {goals && (
            <div style={{ marginTop: 6 }}>
              <StarRow n={info.stars || 0} size={22} animate gap={3} />
              <p style={{ fontSize: 10.5, color: C.inkFaint, margin: '2px 0 0' }}>Metas: {goals.join(' · ')}</p>
            </div>
          )}
          {info.rankUp && <p style={{ fontSize: 12.5, color: C.sageDeep, fontWeight: 800, margin: '6px 0 0' }}>¡Subiste a rango {info.rank}! Las metas crecen</p>}
          {record != null && !isRecord && (
            <p style={{ fontSize: 12, color: C.inkFaint, margin: '6px 0 0' }}>Tu récord: <b style={{ color: C.inkSoft }}>{record} {meta.unit}</b></p>
          )}
        </>
      )}
      {extra.dishes && extra.dishes.length > 0 && (
        <p style={{ fontSize: 12.5, color: C.ink, margin: '8px 0 0' }}>Fue a la nevera: <b>{extra.dishes.map((d) => `${d.n || 1}× ${d.name || d.id}`).join(', ')}</b></p>
      )}
      {info.challenge && info.challenge.justDone && (
        <div className="pg-anim-pop" style={{ marginTop: 10, background: soft(C.sage, 0.6), border: `1.5px solid ${C.sage}`, borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <IconTarget size={16} color={C.sageDeep} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>Reto del día: {info.challenge.text}</span>
          <span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.sageDeep, whiteSpace: 'nowrap' }}>+{challengeCoins}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '14px 0 0' }}>
        <IconCoin size={18} color={C.amber} />
        <span style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink }}>+{coins + challengeCoins}</span>
      </div>
      {bonus && <p style={{ fontSize: 11.5, color: C.sage, fontWeight: 700, margin: '4px 0 0' }}>Bonus del día: monedas dobles</p>}
      {!bonus && reduced && <p style={{ fontSize: 11.5, color: C.inkFaint, margin: '4px 0 0' }}>Hoy ya jugaste mucho a este: paga menos. ¡Prueba otro!</p>}
      <div className="flex gap-3" style={{ marginTop: 18 }}>
        <button onClick={onExit} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Volver</button>
        <button onClick={() => onReplay(next)} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>
          {levelGame ? (won && !lastLevel ? 'Siguiente nivel' : 'Reintentar') : 'Jugar otra vez'}
        </button>
      </div>
    </Modal>
  );
}
