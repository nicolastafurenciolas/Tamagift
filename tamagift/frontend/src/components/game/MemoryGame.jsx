import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { play } from '../../sound';
import { FOOD_SPRITES, MEMORY_FALLBACK, foodSpriteFor } from '../../sprites';
import { UISprite, FoodSprite } from './common';
import { useFinish } from './meta';

// ── Encuentra las parejas ─────────────────────────────────────────
// Las cartas son SUS fotos y comidas; si no alcanzan, se completan con
// dibujos de la app (antes eran emojis del sistema).

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildCardPool(pet) {
  const pool = [];
  ((pet && pet.photos) || []).forEach((p, i) => {
    if (pool.length < 6 && p.url) pool.push({ id: `photo-${i}`, type: 'photo', url: p.url });
  });
  ((pet && pet.food_preferences) || []).forEach((f, i) => {
    if (pool.length >= 6) return;
    if (f.image) pool.push({ id: `food-${i}`, type: 'photo', url: f.image });
    else pool.push({ id: `food-${i}`, type: 'food', food: foodSpriteFor(f.food_name, i), label: f.food_name });
  });
  let k = 0;
  while (pool.length < 6) {
    pool.push({ id: `fallback-${k}`, type: 'sprite', name: MEMORY_FALLBACK[k % MEMORY_FALLBACK.length] });
    k += 1;
  }
  return pool.slice(0, 6);
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
        <div style={{ fontSize: 9.5, fontWeight: 700, color: C.ink, lineHeight: 1.1, maxWidth: size - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content.label}</div>
      </div>
    );
  }
  return <UISprite name={content.name} size={Math.round(size * 0.66)} />;
}

function MemoryCard({ card, isFlipped, onClick, size }) {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped}
      className="pg-focus"
      aria-label={isFlipped ? 'Carta descubierta' : 'Carta tapada'}
      style={{
        width: size, height: size, borderRadius: 14, padding: 3,
        border: `2.5px solid ${card.matched ? C.sage : C.line}`,
        background: isFlipped ? C.surface : `linear-gradient(160deg, ${soft(C.lavender, 0.35)}, ${soft(C.rose, 0.4)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: isFlipped ? 'default' : 'pointer',
        boxShadow: isFlipped ? 'none' : SHADOW.soft,
        transform: isFlipped ? 'rotateY(0deg)' : 'none',
        transition: 'transform 0.15s, background 0.15s',
        animation: card.matched ? 'pg-jelly 0.5s ease' : 'none',
      }}
    >
      {isFlipped ? <CardFace content={card.content} size={size} /> : <UISprite name="corazon" size={Math.round(size * 0.42)} />}
    </button>
  );
}

export default function MemoryGame({ cardPool, onBack, onComplete }) {
  const [cards, setCards] = useState(() => buildDeck(cardPool));
  const [flippedIds, setFlippedIds] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { finish, later } = useFinish(onComplete);

  // Que la rejilla entre en un celular bajo sin hacer scroll: el lado de
  // cada carta sale del ancho Y del alto disponibles.
  const [size, setSize] = useState(96);
  useEffect(() => {
    const calc = () => {
      const byW = (Math.min(window.innerWidth, 360) - 28 - 2 * 10) / 3;
      const byH = (window.innerHeight - 190) / 4 - 10;
      setSize(Math.max(64, Math.floor(Math.min(byW, byH, 104))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  function handleCardClick(card) {
    if (locked || card.matched || flippedIds.includes(card.id)) return;
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
      }, 450);
    } else {
      later(() => { play('bad'); setFlippedIds([]); setLocked(false); }, 900);
    }
  }

  useEffect(() => {
    if (won) return;
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setWon(true);
      finish(moves, 500);
    }
  }, [cards, moves, won, finish]);

  return (
    <Screen>
      <ScreenHeader title="Encuentra las parejas" onBack={onBack} right={<HeaderTag>{moves} mov.</HeaderTag>} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${size}px)`, gap: 10, opacity: won ? 0.65 : 1, transition: 'opacity 0.3s' }}>
        {cards.map((card) => (
          <MemoryCard key={card.id} card={card} size={size} isFlipped={flippedIds.includes(card.id) || card.matched} onClick={() => handleCardClick(card)} />
        ))}
      </div>
      <p style={{ fontFamily: FONT.display, fontSize: 12, color: C.inkSoft, marginTop: 10 }}>Voltea dos cartas iguales</p>
    </Screen>
  );
}
