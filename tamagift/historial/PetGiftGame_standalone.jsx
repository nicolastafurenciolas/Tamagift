import React, { useState, useEffect, useRef } from 'react';

const INK = '#4A3439';
const ROSE = '#D8697F';
const SAGE = '#7FA894';
const BG = '#FBF1EC';
const CARD = '#FFFDF9';
const BORDER = '#E8D9D2';
const AMBER = '#E2A845';

// Cambia esto por la URL real de tu backend una vez lo despliegues.
const API_BASE = 'http://localhost:8000';
const DEMO_SLUG = 'demo';

const PET_CENTER = { x: 150, y: 160 };
const SCRUB_RADIUS = 78;
const FALLBACK_EMOJIS = ['🎈', '🌸', '🎵', '⭐️', '🍓', '🎨'];

const DEMO_POSTERS = [
  { id: 'demo-poster-1', type: 'demo', color: '#C7ACEE', emoji: '🎸' },
  { id: 'demo-poster-2', type: 'demo', color: '#9DCEEF', emoji: '🎬' },
  { id: 'demo-poster-3', type: 'demo', color: '#FFB98A', emoji: '📺' },
];

function getSlugFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug') || DEMO_SLUG;
  } catch (e) {
    return DEMO_SLUG;
  }
}

const DEMO_PET = {
  name: 'Mochi',
  current_mood: 'normal',
  hunger_meter: 65,
  love_meter: 70,
  drawing_normal: null,
  drawing_feliz: null,
  drawing_enojado: null,
  photos: [],
  food_preferences: [
    { food_name: 'Pizza', preference: 'gusta', reaction_message: '¡Mi favorita! Gracias 💕' },
    { food_name: 'Helado', preference: 'gusta', reaction_message: '¡Delicioso, lo amo!' },
    { food_name: 'Brócoli', preference: 'no_gusta', reaction_message: 'Esto no me gusta mucho...' },
    { food_name: 'Espinaca', preference: 'no_gusta', reaction_message: 'Preferiría otra cosa 😕' },
  ],
  phrases: [
    { category: 'casual', text: '¿Cómo estuvo tu día?' },
    { category: 'casual', text: 'Me alegra que estés aquí' },
    { category: 'casual', text: 'Extrañaba verte' },
    { category: 'positiva', text: 'Hoy me siento muy feliz a tu lado' },
    { category: 'positiva', text: 'Cada día contigo es especial' },
  ],
  songs: [],
};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCardPool(pet) {
  const pool = [];
  const photos = (pet && pet.photos) || [];
  photos.forEach((p, i) => {
    if (pool.length < 6 && p.url) pool.push({ id: 'photo-' + i, type: 'photo', url: p.url });
  });
  const foods = (pet && pet.food_preferences) || [];
  foods.forEach((f, i) => {
    if (pool.length < 6) pool.push({ id: 'food-' + i, type: 'text', value: f.food_name, emoji: '🍽️' });
  });
  let fi = 0;
  while (pool.length < 6) {
    pool.push({ id: 'fallback-' + fi, type: 'emoji', value: FALLBACK_EMOJIS[fi % FALLBACK_EMOJIS.length] });
    fi++;
  }
  return pool.slice(0, 6);
}

function buildDeck(pool) {
  const doubled = [...pool, ...pool].map((content, i) => ({ id: 'card-' + i, contentId: content.id, content, matched: false }));
  return shuffleArray(doubled);
}

function buildPosterList(pet) {
  const real = ((pet && pet.photos) || [])
    .filter((p) => p.used_for === 'poster' && p.url)
    .map((p, i) => ({ id: 'poster-' + i, type: 'photo', url: p.url }));
  return real.length > 0 ? real : DEMO_POSTERS;
}

function renderPosterContent(poster) {
  if (poster.type === 'photo') {
    return <img src={poster.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return (
    <div style={{ width: '100%', height: '100%', background: poster.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 22 }}>{poster.emoji}</span>
    </div>
  );
}

function PlaceholderPet({ mood, drawingUrl }) {
  if (drawingUrl) {
    return <img src={drawingUrl} alt="mascota" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  }
  return (
    <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }}>
      <circle cx="112" cy="72" r="24" fill="#FFB98A" />
      <circle cx="188" cy="72" r="24" fill="#FFB98A" />
      <path
        d="M150,75 C200,75 232,108 232,155 C232,200 225,240 195,252 C175,260 125,260 105,252 C75,240 68,200 68,155 C68,108 100,75 150,75 Z"
        fill="#FFD9BE" stroke="#FFB98A" strokeWidth="3"
      />
      <ellipse cx="150" cy="198" rx="46" ry="36" fill="#FFF0E0" />
      {mood === 'normal' && (
        <g>
          <circle cx="120" cy="168" r="9" fill={INK} />
          <circle cx="117" cy="165" r="2.5" fill="#fff" />
          <circle cx="180" cy="168" r="9" fill={INK} />
          <circle cx="177" cy="165" r="2.5" fill="#fff" />
          <path d="M138,200 Q150,206 162,200" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      {mood === 'feliz' && (
        <g>
          <path d="M110,168 Q120,155 130,168" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M170,168 Q180,155 190,168" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M132,198 Q150,222 168,198 Q150,208 132,198 Z" fill={INK} opacity="0.85" />
        </g>
      )}
      {mood === 'enojado' && (
        <g>
          <ellipse cx="120" cy="170" rx="7" ry="4" fill={INK} />
          <ellipse cx="180" cy="170" rx="7" ry="4" fill={INK} />
          <line x1="108" y1="150" x2="128" y2="160" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <line x1="192" y1="150" x2="172" y2="160" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M134,206 Q142,198 150,204 Q158,198 166,206" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

function StatBar({ icon, value }) {
  const color = value > 50 ? SAGE : value > 20 ? AMBER : ROSE;
  return (
    <div className="flex items-center gap-2 mb-2">
      <span style={{ fontSize: 16, width: 20 }}>{icon}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: BORDER }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, transition: 'width 0.4s' }} />
      </div>
      <span className="text-xs font-bold" style={{ color: INK, width: 32, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

function NavTab({ active, label, emoji, onClick, soon }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl focus:outline-none"
      style={{ background: active ? ROSE : '#fff', border: `1.5px solid ${active ? ROSE : BORDER}`, opacity: soon ? 0.65 : 1 }}
    >
      <span style={{ fontSize: 17 }}>{emoji}</span>
      <span className="text-xs font-bold" style={{ color: active ? '#fff' : INK }}>{label}</span>
    </button>
  );
}

function BathroomScreen({ petName, mood, drawingUrl, bathProgress, bathDone, spongePos, bubbles, bathAreaRef, onBack, onSpongeDown, onSpongeMove, onSpongeUp }) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center w-full mb-2" style={{ maxWidth: 300 }}>
        <button onClick={onBack} className="text-sm font-bold focus:outline-none" style={{ color: SAGE }}>← Volver</button>
      </div>
      <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Hora del baño</h2>
      <p className="text-xs mb-4 text-center" style={{ color: SAGE }}>
        {bathDone ? '¡Quedó reluciente!' : `Arrastra la esponja 🧽 sobre ${petName}`}
      </p>
      <div ref={bathAreaRef} className="relative rounded-2xl overflow-hidden mb-4" style={{ width: 300, height: 380, background: 'linear-gradient(180deg, #CFE8FA 0%, #E9F5FD 100%)', border: `3px solid ${SAGE}` }}>
        <div style={{ position: 'absolute', left: PET_CENTER.x - 75, top: PET_CENTER.y - 75, width: 150, height: 150 }}>
          <PlaceholderPet mood={bathDone ? 'feliz' : mood} drawingUrl={drawingUrl} />
          {bathProgress > 0 && !bathDone && (
            <div style={{ position: 'absolute', inset: 0, opacity: Math.min(0.9, 0.3 + bathProgress / 130) }}>
              <span style={{ position: 'absolute', left: 15, top: 25, fontSize: 22 }}>🫧</span>
              <span style={{ position: 'absolute', right: 10, top: 45, fontSize: 18 }}>🫧</span>
              <span style={{ position: 'absolute', left: 45, bottom: 15, fontSize: 16 }}>🫧</span>
            </div>
          )}
        </div>
        {bubbles.map((b) => (
          <span key={b.id} style={{ position: 'absolute', left: b.x, top: b.y, animation: 'bubbleFloat 0.9s ease-out forwards', fontSize: 18, pointerEvents: 'none' }}>🫧</span>
        ))}
        {!bathDone && (
          <div
            onPointerDown={onSpongeDown} onPointerMove={onSpongeMove} onPointerUp={onSpongeUp}
            style={{ position: 'absolute', left: spongePos.x - 22, top: spongePos.y - 22, width: 44, height: 44, borderRadius: '50%', background: '#FFF3B8', border: `3px solid ${AMBER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'grab', touchAction: 'none', boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}
          >
            🧽
          </div>
        )}
        {bathDone && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46 }}>✨</div>}
      </div>
      <div className="w-full mb-4" style={{ maxWidth: 280 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>🧴</span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: BORDER }}>
            <div style={{ width: `${bathProgress}%`, height: '100%', background: '#9DCEEF', transition: 'width 0.2s' }} />
          </div>
        </div>
      </div>
      {bathDone && (
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm font-bold focus:outline-none" style={{ background: ROSE, color: '#fff' }}>
          Volver con {petName}
        </button>
      )}
    </div>
  );
}

function GameCard({ title, desc, emoji, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 rounded-2xl p-3 mb-2 text-left focus:outline-none"
      style={{ background: CARD, border: `1px solid ${BORDER}`, opacity: disabled ? 0.55 : 1 }}
    >
      <span style={{ fontSize: 26 }}>{emoji}</span>
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs" style={{ color: SAGE }}>{desc}</div>
      </div>
    </button>
  );
}

function GamesMenu({ onBack, onPlayMemory, onPlayCatch, onPlayPuzzle }) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center w-full mb-2" style={{ maxWidth: 300 }}>
        <button onClick={onBack} className="text-sm font-bold focus:outline-none" style={{ color: SAGE }}>← Volver</button>
      </div>
      <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Minijuegos</h2>
      <div className="w-full" style={{ maxWidth: 300 }}>
        <GameCard title="Memory Match" desc="Encuentra las parejas" emoji="🧠" onClick={onPlayMemory} />
        <GameCard title="Atrapa la comida" desc="Muévete y atrápala" emoji="🍡" onClick={onPlayCatch} />
        <GameCard title="Rompecabezas de fotos" desc="Arma la imagen" emoji="🧩" onClick={onPlayPuzzle} />
      </div>
    </div>
  );
}

function MemoryCard({ card, isFlipped, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped}
      style={{
        aspectRatio: '1', borderRadius: 12, border: `2px solid ${card.matched ? SAGE : BORDER}`,
        background: isFlipped ? '#fff' : CARD, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: isFlipped ? 'default' : 'pointer', padding: 2, opacity: card.matched ? 0.85 : 1,
      }}
    >
      {isFlipped ? (
        card.content.type === 'photo' ? (
          <img src={card.content.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : card.content.type === 'text' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>{card.content.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: INK, lineHeight: 1.1 }}>{card.content.value}</div>
          </div>
        ) : (
          <span style={{ fontSize: 24 }}>{card.content.value}</span>
        )
      ) : (
        <span style={{ fontSize: 18, opacity: 0.4 }}>❓</span>
      )}
    </button>
  );
}

function MemoryGame({ cardPool, onBack, onComplete }) {
  const [cards, setCards] = useState(() => buildDeck(cardPool));
  const [flippedIds, setFlippedIds] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  function handleCardClick(card) {
    if (locked || card.matched || flippedIds.includes(card.id)) return;
    if (flippedIds.length === 0) {
      setFlippedIds([card.id]);
      return;
    }
    const firstId = flippedIds[0];
    const first = cards.find((c) => c.id === firstId);
    setFlippedIds([firstId, card.id]);
    setMoves((m) => m + 1);
    setLocked(true);
    if (first.contentId === card.contentId) {
      setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === firstId || c.id === card.id ? { ...c, matched: true } : c)));
        setFlippedIds([]);
        setLocked(false);
      }, 500);
    } else {
      setTimeout(() => {
        setFlippedIds([]);
        setLocked(false);
      }, 900);
    }
  }

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) setWon(true);
  }, [cards]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2" style={{ maxWidth: 300 }}>
        <button onClick={onBack} className="text-sm font-bold focus:outline-none" style={{ color: SAGE }}>← Volver</button>
        <span className="text-xs font-bold" style={{ color: SAGE }}>{moves} movimientos</span>
      </div>
      <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Memory Match</h2>
      {!won && (
        <div className="grid grid-cols-3 gap-2 mb-4" style={{ width: '100%', maxWidth: 300 }}>
          {cards.map((card) => (
            <MemoryCard key={card.id} card={card} isFlipped={flippedIds.includes(card.id) || card.matched} onClick={() => handleCardClick(card)} />
          ))}
        </div>
      )}
      {won && (
        <div className="w-full rounded-2xl p-5 text-center mb-4" style={{ maxWidth: 300, background: CARD, border: `1px solid ${SAGE}` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <p className="text-sm font-bold mb-1">¡Encontraste todas las parejas!</p>
          <p className="text-xs mb-4" style={{ color: SAGE }}>{moves} movimientos</p>
          <button onClick={onComplete} className="px-6 py-2.5 rounded-full text-sm font-bold focus:outline-none" style={{ background: ROSE, color: '#fff' }}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

const FOOD_EMOJIS = ['🍕', '🍰', '🍦', '🍓', '🍩', '🍪'];
const CATCH_AREA_W = 300;
const CATCH_AREA_H = 380;
const CATCHER_Y = 335;
const CATCH_RADIUS = 32;
const CATCHER_STEP = 45;

function CatchGame({ onBack, onComplete }) {
  const [catcherX, setCatcherX] = useState(150);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [gameOver, setGameOver] = useState(false);
  const nextIdRef = useRef(0);
  const catcherXRef = useRef(150);

  useEffect(() => {
    catcherXRef.current = catcherX;
  }, [catcherX]);

  useEffect(() => {
    if (gameOver) return;
    const spawn = setInterval(() => {
      const emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
      const x = 30 + Math.random() * (CATCH_AREA_W - 60);
      nextIdRef.current += 1;
      setItems((prev) => [...prev, { id: nextIdRef.current, x, y: -20, emoji }]);
    }, 850);
    return () => clearInterval(spawn);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const tick = setInterval(() => {
      setItems((prev) => {
        const next = [];
        prev.forEach((item) => {
          const newY = item.y + 9;
          const inCatchBand = newY >= CATCHER_Y - 12 && newY <= CATCHER_Y + 18;
          if (inCatchBand && Math.abs(item.x - catcherXRef.current) < CATCH_RADIUS) {
            setScore((s) => s + 1);
            return;
          }
          if (newY > CATCH_AREA_H + 10) return;
          next.push({ ...item, y: newY });
        });
        return next;
      });
    }, 55);
    return () => clearInterval(tick);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      if (timeLeft <= 0) setGameOver(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  function moveLeft() {
    setCatcherX((x) => Math.max(28, x - CATCHER_STEP));
  }
  function moveRight() {
    setCatcherX((x) => Math.min(CATCH_AREA_W - 28, x + CATCHER_STEP));
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2" style={{ maxWidth: 300 }}>
        <button onClick={onBack} className="text-sm font-bold focus:outline-none" style={{ color: SAGE }}>← Volver</button>
        <span className="text-xs font-bold" style={{ color: SAGE }}>{gameOver ? '' : `⏱ ${timeLeft}s`}</span>
      </div>
      <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Atrapa la comida</h2>
      <p className="text-xs mb-3 text-center" style={{ color: SAGE }}>Usa las flechas para moverte</p>

      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ width: CATCH_AREA_W, height: CATCH_AREA_H, background: 'linear-gradient(180deg, #E3D6FA 0%, #F4EEFC 100%)', border: `3px solid ${SAGE}` }}>
        {!gameOver &&
          items.map((item) => (
            <span key={item.id} style={{ position: 'absolute', left: item.x - 12, top: item.y, fontSize: 24 }}>{item.emoji}</span>
          ))}
        {!gameOver && (
          <div style={{ position: 'absolute', left: catcherX - 26, top: CATCHER_Y - 20, width: 52, height: 52, transition: 'left 0.12s' }}>
            <PlaceholderPet mood="feliz" drawingUrl={null} />
          </div>
        )}
        {gameOver && (
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <p className="text-sm font-bold mb-1">¡Atrapaste {score}!</p>
            <button
              onClick={() => onComplete(score)}
              className="px-6 py-2.5 rounded-full text-sm font-bold focus:outline-none mt-3"
              style={{ background: ROSE, color: '#fff' }}
            >
              Continuar
            </button>
          </div>
        )}
      </div>

      {!gameOver && (
        <div className="flex gap-4">
          <button onClick={moveLeft} className="w-16 h-12 rounded-xl text-xl font-bold focus:outline-none" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>⬅️</button>
          <button onClick={moveRight} className="w-16 h-12 rounded-xl text-xl font-bold focus:outline-none" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>➡️</button>
        </div>
      )}

      <p className="text-xs mt-3" style={{ color: SAGE }}>Puntos: {score}</p>
    </div>
  );
}

function RoomScreen({ petName, mood, drawingUrl, posters, onBack }) {
  const [selectedId, setSelectedId] = useState(null);
  const [slots, setSlots] = useState([
    { x: 20, y: 25, content: null },
    { x: 115, y: 25, content: null },
    { x: 210, y: 25, content: null },
  ]);

  function tapPoster(id) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function tapSlot(index) {
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s }));
      if (next[index].content) {
        next[index].content = null;
        return next;
      }
      if (selectedId) {
        const poster = posters.find((p) => p.id === selectedId);
        if (poster) {
          next[index].content = poster;
          setSelectedId(null);
        }
      }
      return next;
    });
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center w-full mb-2" style={{ maxWidth: 300 }}>
        <button onClick={onBack} className="text-sm font-bold focus:outline-none" style={{ color: SAGE }}>← Volver</button>
      </div>
      <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>El cuarto de {petName}</h2>
      <p className="text-xs mb-4 text-center" style={{ color: SAGE }}>Toca un póster y luego una pared para colocarlo</p>

      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ width: 300, height: 280, background: 'linear-gradient(180deg, #F4EFE7 0%, #F4EFE7 70%, #E8D4B8 70%, #E8D4B8 100%)', border: `3px solid ${BORDER}` }}>
        {slots.map((slot, i) => (
          <button
            key={i}
            onClick={() => tapSlot(i)}
            style={{
              position: 'absolute', left: slot.x, top: slot.y, width: 70, height: 90, borderRadius: 6,
              border: slot.content ? `3px solid #fff` : `2px dashed ${BORDER}`,
              background: slot.content ? '#fff' : 'rgba(255,255,255,0.5)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: slot.content ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {slot.content ? renderPosterContent(slot.content) : <span style={{ fontSize: 20, opacity: 0.3 }}>+</span>}
          </button>
        ))}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', width: 70, height: 70 }}>
          <PlaceholderPet mood={mood} drawingUrl={drawingUrl} />
        </div>
      </div>

      <div className="w-full" style={{ maxWidth: 300 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: SAGE }}>Tus pósters</p>
        <div className="flex gap-2 flex-wrap">
          {posters.map((p) => {
            const placed = slots.some((s) => s.content && s.content.id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => tapPoster(p.id)}
                className="relative"
                style={{ width: 56, height: 56, borderRadius: 8, border: selectedId === p.id ? `2.5px solid ${ROSE}` : `1.5px solid ${BORDER}`, overflow: 'hidden' }}
              >
                {renderPosterContent(p)}
                {placed && (
                  <span style={{ position: 'absolute', top: 2, right: 2, background: SAGE, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const PUZZLE_SIZE = 3;
const PUZZLE_PX = 270;
const PUZZLE_TILE_PX = PUZZLE_PX / PUZZLE_SIZE;
const PLACEHOLDER_PUZZLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270"><rect width="270" height="270" fill="#FBF1EC"/><circle cx="135" cy="100" r="55" fill="#D8697F"/><circle cx="80" cy="190" r="35" fill="#7FA894"/><circle cx="200" cy="190" r="35" fill="#FFE270"/><path d="M60,230 Q135,270 210,230" stroke="#4A3439" stroke-width="6" fill="none"/></svg>';
const PLACEHOLDER_PUZZLE_URL = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_PUZZLE_SVG)}`;

function shuffleSolvablePuzzle(size, movesCount) {
  const total = size * size;
  const arr = Array.from({ length: total }, (_, i) => i);
  let blank = total - 1;
  for (let m = 0; m < movesCount; m++) {
    const br = Math.floor(blank / size);
    const bc = blank % size;
    const neighbors = [];
    if (br > 0) neighbors.push(blank - size);
    if (br < size - 1) neighbors.push(blank + size);
    if (bc > 0) neighbors.push(blank - 1);
    if (bc < size - 1) neighbors.push(blank + 1);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [arr[blank], arr[pick]] = [arr[pick], arr[blank]];
    blank = pick;
  }
  return arr;
}

function isAdjacentTile(a, b, size) {
  const ar = Math.floor(a / size);
  const ac = a % size;
  const br = Math.floor(b / size);
  const bc = b % size;
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
}

function PuzzleTile({ tileIndex, photoUrl, onClick }) {
  const total = PUZZLE_SIZE * PUZZLE_SIZE;
  if (tileIndex === total - 1) {
    return <div style={{ width: PUZZLE_TILE_PX, height: PUZZLE_TILE_PX, background: BG }} />;
  }
  const row = Math.floor(tileIndex / PUZZLE_SIZE);
  const col = tileIndex % PUZZLE_SIZE;
  return (
    <button
      onClick={onClick}
      style={{
        width: PUZZLE_TILE_PX, height: PUZZLE_TILE_PX, padding: 0, border: `0.5px solid rgba(255,255,255,0.4)`,
        backgroundImage: `url(${photoUrl})`,
        backgroundSize: `${PUZZLE_PX}px ${PUZZLE_PX}px`,
        backgroundPosition: `-${col * PUZZLE_TILE_PX}px -${row * PUZZLE_TILE_PX}px`,
        cursor: 'pointer',
      }}
    />
  );
}

function SlidingPuzzle({ photoUrl, onBack, onComplete }) {
  const [tiles, setTiles] = useState(() => shuffleSolvablePuzzle(PUZZLE_SIZE, 80));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const url = photoUrl || PLACEHOLDER_PUZZLE_URL;

  function tapTile(pos) {
    if (won) return;
    const blankPos = tiles.indexOf(PUZZLE_SIZE * PUZZLE_SIZE - 1);
    if (!isAdjacentTile(pos, blankPos, PUZZLE_SIZE)) return;
    const next = [...tiles];
    [next[pos], next[blankPos]] = [next[blankPos], next[pos]];
    setTiles(next);
    setMoves((m) => m + 1);
    if (next.every((v, i) => v === i)) setWon(true);
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2" style={{ maxWidth: 300 }}>
        <button onClick={onBack} className="text-sm font-bold focus:outline-none" style={{ color: SAGE }}>← Volver</button>
        <span className="text-xs font-bold" style={{ color: SAGE }}>{moves} movimientos</span>
      </div>
      <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Rompecabezas</h2>
      <p className="text-xs mb-4 text-center" style={{ color: SAGE }}>Toca una pieza junto al espacio vacío</p>

      <div
        className="grid rounded-xl overflow-hidden mb-4"
        style={{ gridTemplateColumns: `repeat(${PUZZLE_SIZE}, ${PUZZLE_TILE_PX}px)`, width: PUZZLE_PX, border: `3px solid ${SAGE}`, boxShadow: '0 4px 18px rgba(74,52,57,0.12)' }}
      >
        {tiles.map((tileIndex, pos) => (
          <PuzzleTile key={pos} tileIndex={tileIndex} photoUrl={url} onClick={() => tapTile(pos)} />
        ))}
      </div>

      {won && (
        <div className="w-full rounded-2xl p-4 text-center" style={{ maxWidth: 300, background: CARD, border: `1px solid ${SAGE}` }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>🧩</div>
          <p className="text-sm font-bold mb-3">¡Armado en {moves} movimientos!</p>
          <button onClick={onComplete} className="px-6 py-2.5 rounded-full text-sm font-bold focus:outline-none" style={{ background: ROSE, color: '#fff' }}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

function CinematicScreen({ photos, phrases, onFinish }) {
  const positivePhrases = (phrases || []).filter((p) => p.category === 'positiva');
  const usePhotos = photos && photos.length > 0;
  const slideCount = usePhotos ? Math.min(photos.length, 6) : Math.min(Math.max(positivePhrases.length, 1), 4);

  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const isDone = index >= slideCount;

  useEffect(() => {
    if (isDone) return;
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => i + 1);
        setFading(false);
      }, 400);
    }, 2800);
    return () => clearTimeout(timer);
  }, [index, isDone]);

  const photo = usePhotos ? photos[index % photos.length] : null;
  const caption = positivePhrases.length > 0
    ? positivePhrases[index % positivePhrases.length].text
    : (usePhotos ? null : 'Gracias por todos estos momentos juntos');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#1a1520', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {!isDone && (
        <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.4s', textAlign: 'center', maxWidth: 320 }}>
          {photo && <img src={photo.url} alt="" style={{ maxWidth: '100%', maxHeight: '55vh', borderRadius: 12, marginBottom: 16, objectFit: 'contain' }} />}
          {caption && <p style={{ color: '#fff', fontSize: 15 }}>{caption}</p>}
        </div>
      )}
      {isDone && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💗</div>
          <p style={{ color: '#fff', fontSize: 16, marginBottom: 24 }}>Gracias por acordarte de mí</p>
          <button onClick={onFinish} className="px-6 py-2.5 rounded-full text-sm font-bold focus:outline-none" style={{ background: ROSE, color: '#fff' }}>
            Volver
          </button>
        </div>
      )}
      {!isDone && (
        <button onClick={onFinish} style={{ position: 'absolute', top: 16, right: 16, color: '#fff', opacity: 0.6, fontSize: 13, background: 'none', border: 'none' }}>
          Saltar ✕
        </button>
      )}
    </div>
  );
}

function MusicPlayer({ songs, activeIndex, onSelect }) {
  return (
    <div className="w-full rounded-2xl p-3 mb-4" style={{ maxWidth: 280, background: CARD, border: `1px solid ${BORDER}` }}>
      <p className="text-xs font-semibold mb-2" style={{ color: SAGE }}>Su música</p>
      {(!songs || songs.length === 0) && (
        <p className="text-xs" style={{ color: INK, opacity: 0.6 }}>Aún no hay canciones configuradas</p>
      )}
      {songs && songs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {songs.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(activeIndex === i ? null : i)}
              className="text-left text-xs px-2.5 py-2 rounded-lg focus:outline-none"
              style={{ background: activeIndex === i ? ROSE : '#fff', color: activeIndex === i ? '#fff' : INK, border: `1px solid ${activeIndex === i ? ROSE : BORDER}` }}
            >
              🎵 {s.title || 'Canción sin título'}
            </button>
          ))}
        </div>
      )}
      {activeIndex !== null && songs && songs[activeIndex] && (
        <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <iframe
            src={songs[activeIndex].embed_url}
            width="100%"
            height="80"
            style={{ border: 'none', display: 'block' }}
            allow="autoplay; encrypted-media"
            title={songs[activeIndex].title || 'reproductor'}
          />
        </div>
      )}
    </div>
  );
}

export default function PetGiftGame() {
  const [pet, setPet] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [hunger, setHunger] = useState(60);
  const [love, setLove] = useState(60);
  const [mood, setMood] = useState('normal');
  const [bubble, setBubble] = useState('¡Hola! 👋');
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [tick, setTick] = useState(0);
  const [screen, setScreen] = useState('main');
  const [musicOpen, setMusicOpen] = useState(false);
  const [activeSongIndex, setActiveSongIndex] = useState(null);

  const bathAreaRef = useRef(null);
  const draggingSpongeRef = useRef(false);
  const [bathProgress, setBathProgress] = useState(0);
  const [bathDone, setBathDone] = useState(false);
  const [spongePos, setSpongePos] = useState({ x: 150, y: 320 });
  const [bubbles, setBubbles] = useState([]);

  const cinematicAvailable = hunger <= 0 && love <= 0;

  useEffect(() => {
    async function load() {
      const slug = getSlugFromUrl();
      try {
        const res = await fetch(`${API_BASE}/api/pets/${slug}`);
        if (!res.ok) throw new Error('no pet');
        const data = await res.json();
        setPet(data);
        setHunger(data.hunger_meter);
        setLove(data.love_meter);
        setMood(data.current_mood);
        setLoadState('live');
      } catch (err) {
        setPet(DEMO_PET);
        setHunger(DEMO_PET.hunger_meter);
        setLove(DEMO_PET.love_meter);
        setMood(DEMO_PET.current_mood);
        setLoadState('demo');
      }
      setLastUpdated(Date.now());
    }
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pet) return;
    const elapsed = Date.now() - lastUpdated;
    const decayed = Math.floor(elapsed / 3000);
    if (decayed > 0) {
      setHunger((h) => Math.max(0, h - decayed));
      setLove((l) => Math.max(0, l - Math.ceil(decayed / 2)));
      setLastUpdated(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (!pet) return;
    const id = setInterval(() => {
      const casuals = (pet.phrases || []).filter((p) => p.category === 'casual');
      if (casuals.length > 0 && screen === 'main' && !cinematicAvailable) {
        setBubble(casuals[Math.floor(Math.random() * casuals.length)].text);
      }
    }, 12000);
    return () => clearInterval(id);
  }, [pet, screen, cinematicAvailable]);

  async function feed(food) {
    const slug = getSlugFromUrl();
    if (loadState === 'live') {
      try {
        const res = await fetch(`${API_BASE}/api/pets/${slug}/feed`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ food_name: food.food_name }),
        });
        if (!res.ok) throw new Error('feed failed');
        const data = await res.json();
        setMood(data.mood);
        setHunger(data.hunger_meter);
        setLove(data.love_meter);
        setBubble(data.reaction_message);
        setLastUpdated(Date.now());
        return;
      } catch (err) {
        // sigue al modo local abajo
      }
    }
    if (food.preference === 'gusta') {
      setMood('feliz'); setHunger((h) => Math.min(100, h + 20)); setLove((l) => Math.min(100, l + 5));
    } else if (food.preference === 'no_gusta') {
      setMood('enojado'); setHunger((h) => Math.min(100, h + 5)); setLove((l) => Math.max(0, l - 2));
    } else {
      setMood('normal'); setHunger((h) => Math.min(100, h + 10));
    }
    setBubble(food.reaction_message || 'Ñam, gracias por la comida.');
    setLastUpdated(Date.now());
  }

  function enterBathroom() {
    setBathProgress(0); setBathDone(false); setSpongePos({ x: 150, y: 320 }); setBubbles([]); setScreen('bathroom');
  }

  function spawnBubbleParticle(x, y) {
    const id = Math.random().toString(36).slice(2);
    setBubbles((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setBubbles((prev) => prev.filter((b) => b.id !== id)), 900);
  }

  function completeBath() {
    setBathDone(true); setMood('feliz'); setLove((l) => Math.min(100, l + 15)); setLastUpdated(Date.now());
  }

  function checkScrub(x, y) {
    const dx = x - PET_CENTER.x;
    const dy = y - PET_CENTER.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < SCRUB_RADIUS) {
      setBathProgress((p) => {
        if (p >= 100) return p;
        const next = Math.min(100, p + 1.6);
        if (next >= 100) completeBath();
        return next;
      });
      if (Math.random() < 0.3) spawnBubbleParticle(x, y);
    }
  }

  function handleSpongeDown(e) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingSpongeRef.current = true;
  }
  function handleSpongeMove(e) {
    if (!draggingSpongeRef.current) return;
    e.preventDefault();
    const rect = bathAreaRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(22, Math.min(278, x));
    y = Math.max(22, Math.min(358, y));
    setSpongePos({ x, y });
    checkScrub(x, y);
  }
  function handleSpongeUp() {
    draggingSpongeRef.current = false;
  }

  function completeMemoryGame() {
    setLove((l) => Math.min(100, l + 10));
    setBubble('¡Qué bien jugamos juntas! 🎉');
    setScreen('main');
  }

  function completeCatchGame(score) {
    const gained = Math.min(15, Math.ceil(score / 2));
    setLove((l) => Math.min(100, l + gained));
    setHunger((h) => Math.min(100, h + Math.min(10, score)));
    setBubble(score > 0 ? '¡Qué rica esa comida, gracias! 🍡' : 'Jugamos juntas, igual fue divertido 💕');
    setScreen('main');
  }

  function completePuzzle() {
    setLove((l) => Math.min(100, l + 10));
    setBubble('¡Me encantó armar esa foto contigo! 🧩');
    setScreen('main');
  }

  function completeCinematic() {
    setHunger(55);
    setLove(55);
    setMood('feliz');
    setBubble('Me alegra tenerte de vuelta 💕');
    setLastUpdated(Date.now());
    setScreen('main');
  }

  if (!pet) {
    return (
      <div className="w-full min-h-full flex items-center justify-center py-16" style={{ background: BG, color: INK, fontFamily: "'Nunito Sans', sans-serif" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center py-8 px-4" style={{ background: BG, fontFamily: "'Nunito Sans', sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap');
        @keyframes bubbleFloat { 0% { opacity: 0.9; transform: translateY(0) scale(0.8); } 100% { opacity: 0; transform: translateY(-40px) scale(1.3); } }
      `}</style>

      {loadState === 'demo' && screen === 'main' && (
        <div className="text-xs px-3 py-1.5 rounded-full mb-4 text-center" style={{ background: '#FFF3D6', color: INK, border: '1px solid #E8C888', maxWidth: 300 }}>
          Modo demo — no encontré backend en {API_BASE}, esta es una mascota de ejemplo
        </div>
      )}

      {screen === 'cinematic' && (
        <CinematicScreen photos={pet.photos || []} phrases={pet.phrases || []} onFinish={completeCinematic} />
      )}

      {screen === 'bathroom' && (
        <BathroomScreen
          petName={pet.name} mood={mood} drawingUrl={pet[`drawing_${mood}`]} bathProgress={bathProgress} bathDone={bathDone}
          spongePos={spongePos} bubbles={bubbles} bathAreaRef={bathAreaRef} onBack={() => setScreen('main')}
          onSpongeDown={handleSpongeDown} onSpongeMove={handleSpongeMove} onSpongeUp={handleSpongeUp}
        />
      )}

      {screen === 'games' && <GamesMenu onBack={() => setScreen('main')} onPlayMemory={() => setScreen('memory')} onPlayCatch={() => setScreen('catch')} onPlayPuzzle={() => setScreen('puzzle')} />}

      {screen === 'memory' && (
        <MemoryGame cardPool={buildCardPool(pet)} onBack={() => setScreen('games')} onComplete={completeMemoryGame} />
      )}

      {screen === 'catch' && (
        <CatchGame onBack={() => setScreen('games')} onComplete={completeCatchGame} />
      )}

      {screen === 'puzzle' && (
        <SlidingPuzzle
          photoUrl={
            (pet.photos || []).find((p) => p.used_for === 'puzzle' && p.url)?.url ||
            (pet.photos || []).find((p) => p.url)?.url ||
            null
          }
          onBack={() => setScreen('games')}
          onComplete={completePuzzle}
        />
      )}

      {screen === 'room' && (
        <RoomScreen petName={pet.name} mood={mood} drawingUrl={pet[`drawing_${mood}`]} posters={buildPosterList(pet)} onBack={() => setScreen('main')} />
      )}

      {screen === 'main' && (
        <>
          <p className="text-xs tracking-widest uppercase font-semibold mb-1" style={{ color: SAGE }}>Taller de mascotas</p>
          <div className="flex items-center gap-2 mb-4">
            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 24, fontWeight: 700 }}>{pet.name}</h1>
            <button
              onClick={() => setMusicOpen((v) => !v)}
              className="focus:outline-none"
              style={{ width: 30, height: 30, borderRadius: '50%', background: musicOpen ? ROSE : '#fff', border: `1.5px solid ${musicOpen ? ROSE : BORDER}`, fontSize: 14 }}
              aria-label="Música"
            >
              🎵
            </button>
          </div>

          {musicOpen && <MusicPlayer songs={pet.songs} activeIndex={activeSongIndex} onSelect={setActiveSongIndex} />}

          {cinematicAvailable ? (
            <button
              onClick={() => setScreen('cinematic')}
              className="rounded-2xl px-5 py-4 mb-4 text-center focus:outline-none"
              style={{ background: '#FFF3D6', border: `2px dashed ${AMBER}`, maxWidth: 280 }}
            >
              <div style={{ fontSize: 28, marginBottom: 4 }}>💌</div>
              <div className="text-sm font-bold">Toca aquí para recordar juntos</div>
            </button>
          ) : (
            <div className="rounded-2xl px-4 py-2.5 mb-4 text-center text-sm font-semibold" style={{ background: CARD, border: `1px solid ${BORDER}`, minHeight: 20, maxWidth: 280 }}>
              {bubble}
            </div>
          )}

          <div className="relative mb-5 rounded-full overflow-hidden flex items-center justify-center" style={{ width: 220, height: 220, border: `4px solid ${SAGE}`, background: CARD, boxShadow: '0 4px 18px rgba(74,52,57,0.12)' }}>
            <div style={{ width: '78%' }}>
              <PlaceholderPet mood={cinematicAvailable ? 'enojado' : mood} drawingUrl={pet[`drawing_${cinematicAvailable ? 'enojado' : mood}`]} />
            </div>
          </div>

          <div className="w-full mb-5" style={{ maxWidth: 280 }}>
            <StatBar icon="🍖" value={hunger} />
            <StatBar icon="💗" value={love} />
          </div>

          <div className="flex gap-2 mb-5">
            <NavTab active label="Alimentar" emoji="🍽️" onClick={() => {}} />
            <NavTab label="Bañar" emoji="🛁" onClick={enterBathroom} />
            <NavTab label="Jugar" emoji="🎮" onClick={() => setScreen('games')} />
            <NavTab label="Cuarto" emoji="🖼️" onClick={() => setScreen('room')} />
          </div>

          <div className="w-full grid grid-cols-2 gap-2" style={{ maxWidth: 280 }}>
            {(pet.food_preferences || []).map((f) => (
              <button
                key={f.food_name} onClick={() => feed(f)}
                className="py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
                style={{ background: '#fff', border: `1.5px solid ${BORDER}`, color: INK }}
              >
                {f.food_name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
