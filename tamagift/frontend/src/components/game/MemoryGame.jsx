import React, { useEffect, useMemo, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { play } from '../../sound';
import { FOOD_SPRITES, MEMORY_FALLBACK, UI_SPRITES, foodSpriteFor } from '../../sprites';
import { UISprite, FoodSprite } from './common';
import { useFinish } from './meta';
import { LevelMap, StarRow } from './levelUi';

// ── Encuentra las parejas ─────────────────────────────────────────
// Nueve niveles: 6, 8 y 10 parejas. Las estrellas salen de cuántos
// movimientos tomó; en los últimos además hay reloj. Las cartas son SUS
// fotos y comidas; si no alcanzan, se completan con dibujos de la app.

export const MEMORY_LEVELS = [
  { pairs: 6, cols: 3 }, { pairs: 6, cols: 3 }, { pairs: 6, cols: 3, peek: 1.6 },
  { pairs: 8, cols: 4 }, { pairs: 8, cols: 4, peek: 1.8 }, { pairs: 8, cols: 4, time: 75 },
  { pairs: 10, cols: 4, peek: 2 }, { pairs: 10, cols: 4, time: 90 }, { pairs: 10, cols: 4, time: 70 },
];

// 3 estrellas con pocos errores; 1 por terminar.
export function memoryStars(pairs, moves) {
  if (moves <= Math.round(pairs * 1.5)) return 3;
  if (moves <= Math.round(pairs * 2.1)) return 2;
  return 1;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildCardPool(pet, n = 6) {
  const pool = [];
  ((pet && pet.photos) || []).forEach((p, i) => {
    if (pool.length < n && p.url) pool.push({ id: `photo-${i}`, type: 'photo', url: p.url });
  });
  ((pet && pet.food_preferences) || []).forEach((f, i) => {
    if (pool.length >= n) return;
    if (f.image) pool.push({ id: `food-${i}`, type: 'photo', url: f.image });
    else pool.push({ id: `food-${i}`, type: 'food', food: foodSpriteFor(f.food_name, i), label: f.food_name });
  });
  const extra = [...MEMORY_FALLBACK, ...Object.keys(UI_SPRITES).filter((k) => !MEMORY_FALLBACK.includes(k) && ['regalo', 'trofeo', 'tele', 'claqueta', 'guitarra', 'llama'].includes(k))];
  let k = 0;
  while (pool.length < n && k < extra.length) { pool.push({ id: `fallback-${k}`, type: 'sprite', name: extra[k] }); k += 1; }
  let f = 0;
  while (pool.length < n) { pool.push({ id: `fs-${f}`, type: 'food', food: FOOD_SPRITES[f % FOOD_SPRITES.length], label: FOOD_SPRITES[f % FOOD_SPRITES.length].name }); f += 1; }
  return pool.slice(0, n);
}

function buildDeck(pool) {
  return shuffle([...pool, ...pool].map((content, i) => ({ id: `card-${i}`, contentId: content.id, content, matched: false })));
}

function CardFace({ content, size }) {
  if (content.type === 'photo') {
    return <img src={content.url} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />;
  }
  if (content.type === 'food') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <FoodSprite food={content.food || FOOD_SPRITES[0]} size={Math.round(size * 0.52)} />
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink, lineHeight: 1.1, maxWidth: size - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content.label}</div>
      </div>
    );
  }
  return <UISprite name={content.name} size={Math.round(size * 0.66)} />;
}

function MemoryCard({ card, isFlipped, onClick, size, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped || disabled}
      className="pg-focus"
      aria-label={isFlipped ? 'Carta descubierta' : 'Carta tapada'}
      style={{
        width: size, height: size, borderRadius: 14, padding: 3,
        border: `2.5px solid ${card.matched ? C.sage : C.line}`,
        background: isFlipped ? C.surface : `linear-gradient(160deg, ${soft(C.lavender, 0.35)}, ${soft(C.rose, 0.4)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: isFlipped ? 'default' : 'pointer',
        boxShadow: isFlipped ? 'none' : SHADOW.soft,
        transition: 'transform 0.15s, background 0.15s',
        animation: card.matched ? 'pg-jelly 0.5s ease' : 'none',
      }}
    >
      {isFlipped ? <CardFace content={card.content} size={size} /> : <UISprite name="corazon" size={Math.round(size * 0.42)} />}
    </button>
  );
}

export default function MemoryGame({ pet, look, onBack, onComplete, progress, startLevel }) {
  const unlocked = (progress && progress.unlocked) || 1;
  const [level, setLevel] = useState(startLevel && startLevel <= unlocked ? startLevel : null);
  if (level == null) {
    return (
      <Screen>
        <ScreenHeader title="Encuentra las parejas" subtitle="Elige un nivel" onBack={onBack} />
        <LevelMap
          count={MEMORY_LEVELS.length} unlocked={unlocked} stars={(progress && progress.stars) || {}} theme="memoria" look={look}
          colors={[C.lavender, C.rose, C.sky]}
          labels={MEMORY_LEVELS.map((L0) => `${L0.pairs} parejas${L0.time ? ' · reloj' : ''}`)}
          onPick={(n) => { play('pop'); setLevel(n); }}
        />
      </Screen>
    );
  }
  return <MemoryLevel key={level} level={level} pet={pet} onExit={() => setLevel(null)} onComplete={onComplete} />;
}

function MemoryLevel({ level, pet, onExit, onComplete }) {
  const L0 = MEMORY_LEVELS[level - 1];
  const pool = useMemo(() => buildCardPool(pet, L0.pairs), [pet, L0.pairs]);
  const [cards, setCards] = useState(() => buildDeck(pool));
  const [flippedIds, setFlippedIds] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [peeking, setPeeking] = useState(!!L0.peek);
  const [timeLeft, setTimeLeft] = useState(L0.time || 0);
  const { finish, later } = useFinish(onComplete);
  const rows = Math.ceil((L0.pairs * 2) / L0.cols);

  // Que la rejilla entre en un celular bajo sin hacer scroll.
  const [size, setSize] = useState(90);
  useEffect(() => {
    const calc = () => {
      const byW = (Math.min(window.innerWidth, 380) - 28 - (L0.cols - 1) * 8) / L0.cols;
      const byH = (window.innerHeight - 200) / rows - 8;
      setSize(Math.max(54, Math.floor(Math.min(byW, byH, 100))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [L0.cols, rows]);

  // Vistazo inicial: todas boca arriba un momento.
  useEffect(() => {
    if (!L0.peek) return undefined;
    const t = setTimeout(() => { setPeeking(false); play('swoosh'); }, L0.peek * 1000 + 400);
    return () => clearTimeout(t);
  }, [L0.peek]);

  useEffect(() => {
    if (!L0.time || won || lost || peeking) return undefined;
    if (timeLeft <= 0) { setLost(true); play('bad'); finish(moves, 900, { level, won: false, stars: 0 }); return undefined; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, won, lost, peeking, L0.time, finish, moves, level]);

  function handleCardClick(card) {
    if (locked || peeking || won || lost || card.matched || flippedIds.includes(card.id)) return;
    play('pop');
    if (flippedIds.length === 0) { setFlippedIds([card.id]); return; }
    const firstId = flippedIds[0];
    const first = cards.find((c) => c.id === firstId);
    setFlippedIds([firstId, card.id]);
    setMoves((m) => m + 1);
    setLocked(true);
    if (first.contentId === card.contentId) {
      later(() => {
        play('good');
        setCards((prev) => prev.map((c) => (c.id === firstId || c.id === card.id ? { ...c, matched: true } : c)));
        setFlippedIds([]);
        setLocked(false);
      }, 420);
    } else {
      later(() => { play('bad'); setFlippedIds([]); setLocked(false); }, 850);
    }
  }

  useEffect(() => {
    if (won || lost) return;
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setWon(true);
      play('win');
      finish(moves, 900, { level, won: true, stars: memoryStars(L0.pairs, moves) });
    }
  }, [cards, moves, won, lost, finish, level, L0.pairs]);

  const stars = memoryStars(L0.pairs, Math.max(moves, 1));
  return (
    <Screen>
      <ScreenHeader
        title={`Nivel ${level}`} onBack={onExit}
        right={<HeaderTag color={L0.time && timeLeft <= 10 ? C.rose : C.inkSoft}>{L0.time ? `${timeLeft}s · ` : ''}{moves} mov.</HeaderTag>}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, minHeight: 20 }}>
        {peeking ? (
          <span style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.rose }}>¡Memorízalas!</span>
        ) : (
          <>
            <StarRow n={moves ? stars : 3} size={16} />
            <span style={{ fontSize: 11.5, color: C.inkFaint }}>3★ hasta {Math.round(L0.pairs * 1.5)} mov.</span>
          </>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${L0.cols}, ${size}px)`, gap: 8, opacity: won || lost ? 0.65 : 1, transition: 'opacity 0.3s' }}>
        {cards.map((card) => (
          <MemoryCard key={card.id} card={card} size={size} disabled={peeking} isFlipped={peeking || flippedIds.includes(card.id) || card.matched} onClick={() => handleCardClick(card)} />
        ))}
      </div>
      <p style={{ fontFamily: FONT.display, fontSize: 12, color: lost ? C.rose : C.inkSoft, marginTop: 10 }}>{lost ? '¡Se acabó el tiempo!' : 'Voltea dos cartas iguales'}</p>
    </Screen>
  );
}
