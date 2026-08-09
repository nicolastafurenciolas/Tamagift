import React, { useState, useEffect, useRef } from 'react';
import { C, FONT, SHADOW, tint } from '../theme';
import Pet from './Pet';
import { loadPet, feedPetRemote, redesignPetRemote, setActiveDesignRemote } from '../api';
import {
  loadGameState, saveGameState, newPlacementKey, ROOM,
  registerPlay, isDailyBonusReady, isNewRecord, DAILY_BONUS_MULTIPLIER,
} from '../gameState';
import { DECOR_CATALOG, findDecor } from '../shopCatalog';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS, findFurniture, findPaint } from '../roomCatalog';
import Room, { defaultPlacement } from './Room';
import MusicBar from './MusicBar';
import { ModularPetStep, useDesignerState } from './PetDesigner';
import { TOWER, resolveDrop } from '../towerLogic';
import { FLY, createFlyState, flapState, stepFly } from '../flyPhysics';
import {
  SIZE, MOVES_PER_GAME, createBoard, hasAnyMove, areAdjacent, previewSwap, resolveBoard, findHint,
} from '../match3';
import { Car, SimonPad, SIMON_PADS, Candy, Pipe } from '../gameArt';
import { play, installUnlock, isMuted, toggleMuted } from '../sound';

// Precio fijo de rediseñar la mascota (#41). Vive del lado del cliente,
// como el resto del sistema de monedas — no hay validación en backend.
const REDESIGN_COST = 1000;

// ── Ritmo del juego ──────────────────────────────────────────────
// Cuánto tarda en bajar UN punto de cada barra. Con los 60 puntos de
// inicio: hambre ~50 min, amor ~1h40. Antes era 1 punto cada 3 s (la
// mascota se moría de hambre en 3 minutos).
const HUNGER_MS = 50 * 1000;
const LOVE_MS = 100 * 1000;
// Cuánto avanza el baño por cada roce de la esponja, y cuánto amor da
// en total mientras lo frotas.
// Cuánto dura frotar el baño de punta a punta, y cuánto amor da en
// total mientras lo frotas (repartido, no de golpe al final).
const BATH_MS = 9000;
const BATH_LOVE = 18;
import {
  IconBowl, IconTub, IconBall, IconFrame, IconMusic, IconHeart,
  IconCookie, IconEnvelope, IconBack, IconClose, IconSparkle,
  IconCoin, IconBag, IconShirt, IconPaw,
  IconCards, IconCatch, IconPuzzle, IconMole, IconSnake, IconRoad, IconTower,
} from './icons';

const DEMO_SLUG = 'demo';

const PET_CENTER = { x: 150, y: 160 };
const SCRUB_RADIUS = 78;
const FALLBACK_EMOJIS = ['🎈', '🌸', '🎵', '⭐️', '🍓', '🎨'];

const DEMO_POSTERS = [
  { id: 'demo-poster-1', type: 'demo', color: '#C7ACEE', emoji: '🎸', price: 0 },
  { id: 'demo-poster-2', type: 'demo', color: '#9DCEEF', emoji: '🎬', price: 0 },
  { id: 'demo-poster-3', type: 'demo', color: '#FFB98A', emoji: '📺', price: 0 },
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

// ── helpers de datos ──────────────────────────────────────────────
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
    if (pool.length >= 6) return;
    if (f.image) pool.push({ id: 'food-' + i, type: 'photo', url: f.image });
    else pool.push({ id: 'food-' + i, type: 'text', value: f.food_name, emoji: '🍽️' });
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
    // Id ESTABLE del backend (no la posición): la tienda necesita saber
    // cuál póster ya se compró sin confundirse si la lista cambia de orden.
    .map((p) => ({ id: p.id, type: 'photo', url: p.url, price: p.price || 0 }));
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

const MOOD_LABEL = {
  normal: { text: 'tranquilo', color: C.sage },
  feliz: { text: 'feliz', color: C.rose },
  enojado: { text: 'de mal humor', color: C.amber },
};

// ── Escena de cuarto acogedor ─────────────────────────────────────
function RoomScene({ children, onEnterBath }) {
  const motes = [8, 26, 52, 74, 88];
  return (
    <div
      className="pg-sticker"
      style={{ position: 'relative', width: '100%', maxWidth: 330, height: 316, overflow: 'hidden', borderRadius: 30 }}
    >
      {/* pared */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #FFEAD6 0%, #FCDCC4 60%)' }} />
      {/* luz cálida entrando */}
      <div style={{ position: 'absolute', top: -46, right: -30, width: 210, height: 210, background: 'radial-gradient(circle, rgba(255,241,206,0.95) 0%, rgba(255,241,206,0) 68%)', pointerEvents: 'none' }} />

      {/* guirnalda de banderines */}
      <svg viewBox="0 0 330 40" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 42 }}>
        <path d="M8 8 Q165 26 322 8" fill="none" stroke={C.ink} strokeWidth="1.6" opacity="0.35" />
        {[[28, C.rose], [70, C.amber], [112, C.sage], [154, C.lavender], [196, C.rose], [238, C.amber], [280, C.sage]].map(([x, col], i) => {
          const y = 10 + Math.sin((x / 330) * Math.PI) * 12;
          return <path key={i} d={`M${x - 11} ${y} L${x + 11} ${y} L${x} ${y + 17} Z`} fill={col} opacity="0.9" />;
        })}
      </svg>

      {/* ventana */}
      <svg viewBox="0 0 120 120" style={{ position: 'absolute', top: 44, right: 20, width: 96, height: 96 }}>
        <rect x="6" y="6" width="108" height="108" rx="14" fill="#CFE9FB" stroke={C.ink} strokeWidth="3.5" />
        <path d="M6 78 h108" stroke="#B9DCF3" strokeWidth="2" />
        <circle cx="84" cy="34" r="15" fill="#FFE9A8" />
        <path d="M20 92 q14 -22 30 0" fill="#FBD9C2" />
        <line x1="60" y1="6" x2="60" y2="114" stroke={C.ink} strokeWidth="3.5" />
        <line x1="6" y1="60" x2="114" y2="60" stroke={C.ink} strokeWidth="3.5" />
        {/* macetita en el alféizar */}
        <rect x="14" y="98" width="20" height="14" rx="3" fill="#D98E63" stroke={C.ink} strokeWidth="2.5" />
        <path d="M24 98 q-8 -12 -2 -20 q6 4 2 20" fill="#8CC58F" stroke={C.ink} strokeWidth="2" />
        <path d="M24 98 q8 -10 3 -18 q-7 3 -3 18" fill="#A6D6A0" stroke={C.ink} strokeWidth="2" />
      </svg>

      {/* repisa con librito */}
      <svg viewBox="0 0 90 44" style={{ position: 'absolute', top: 108, left: 20, width: 84, height: 40 }}>
        <rect x="4" y="30" width="78" height="8" rx="2" fill="#D9A57A" stroke={C.ink} strokeWidth="2.5" />
        <rect x="12" y="10" width="9" height="20" rx="1.5" fill={C.rose} stroke={C.ink} strokeWidth="2" />
        <rect x="22" y="6" width="9" height="24" rx="1.5" fill={C.sage} stroke={C.ink} strokeWidth="2" />
        <rect x="32" y="12" width="9" height="18" rx="1.5" fill={C.amber} stroke={C.ink} strokeWidth="2" />
        <circle cx="60" cy="20" r="10" fill={C.lavenderSoft || '#EEE4FB'} stroke={C.ink} strokeWidth="2" />
        <path d="M56 20 a4 4 0 0 1 8 0" fill="none" stroke={C.ink} strokeWidth="1.6" />
      </svg>

      {/* piso de madera */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%', background: 'linear-gradient(180deg, #E7C49E 0%, #DDB587 100%)', borderTop: `2px solid ${C.ink}22` }} />
      {/* alfombra */}
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', width: 200, height: 62, borderRadius: '50%', background: 'radial-gradient(ellipse, #F6C9C0 0%, #EBA9A0 78%)', boxShadow: 'inset 0 0 0 5px rgba(255,255,255,0.35)' }} />

      {/* motas de polvo flotando */}
      {motes.map((left, i) => (
        <span key={i} style={{ position: 'absolute', left: `${left}%`, bottom: '28%', width: 5, height: 5, borderRadius: '50%', background: '#FFF6E0', animation: `pg-drift ${7 + i}s linear ${i * 1.3}s infinite`, pointerEvents: 'none' }} />
      ))}

      {/* mascota sobre la alfombra */}
      <div style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
        {children}
      </div>

      {/* puerta al baño — a la derecha, clara y tocable */}
      {onEnterBath && (
        <button
          onClick={onEnterBath}
          className="pg-focus"
          aria-label="Ir al baño"
          style={{ position: 'absolute', right: 8, bottom: 20, zIndex: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ width: 46, height: 60, borderRadius: '10px 10px 4px 4px', background: 'linear-gradient(180deg, #E7B98C, #D89E6B)', border: `2.5px solid ${C.ink}`, boxShadow: SHADOW.soft, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <span style={{ position: 'absolute', inset: 5, borderRadius: '6px 6px 3px 3px', border: `1.5px solid ${C.ink}22` }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, border: `1.5px solid ${C.ink}`, marginLeft: 6 }} />
          </span>
          <span className="pg-anim-nudge" style={{ display: 'flex', alignItems: 'center', gap: 3, background: C.surface, borderRadius: 999, padding: '2px 8px', border: `1.5px solid ${C.line}`, boxShadow: SHADOW.soft }}>
            <IconTub size={13} color={C.sky} />
            <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 800, color: C.ink }}>Baño</span>
          </span>
        </button>
      )}
    </div>
  );
}

// ── Burbuja de diálogo con cola ───────────────────────────────────
function SpeechBubble({ text, tone = 'casual' }) {
  const accent = tone === 'gusta' ? C.rose : tone === 'no_gusta' ? C.amber : C.line;
  return (
    <div key={text} className="pg-anim-pop" style={{ position: 'relative', maxWidth: 290, margin: '0 auto 10px' }}>
      <div
        className="pg-card"
        style={{ padding: '12px 18px', borderColor: accent, borderRadius: 20, textAlign: 'center' }}
      >
        <p style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.35, margin: 0 }}>{text}</p>
      </div>
      {/* cola */}
      <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 18, height: 18, background: C.surface, borderRight: `1.5px solid ${accent}`, borderBottom: `1.5px solid ${accent}`, borderBottomRightRadius: 4, rotate: '45deg' }} />
    </div>
  );
}

// ── Medidor de estado con carácter ────────────────────────────────
function StatMeter({ kind, value }) {
  const color = value > 55 ? C.sage : value > 25 ? C.amber : C.rose;
  const Icon = kind === 'hunger' ? IconCookie : IconHeart;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: tint(color, 0.72), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 -2px 4px rgba(120,80,55,0.08)' }}>
        <Icon size={19} color={color} fill={color} stroke={2.4} />
      </div>
      <div style={{ flex: 1, height: 15, borderRadius: 999, background: '#EEDFCF', boxShadow: 'inset 0 2px 4px rgba(120,80,55,0.16)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: `linear-gradient(180deg, ${tint(color, 0.25)}, ${color})`, transition: 'width 0.5s cubic-bezier(.34,1.4,.6,1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }} />
      </div>
      <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 12, color: C.inkSoft, width: 30, textAlign: 'right' }}>{Math.round(value)}</span>
    </div>
  );
}

// ── Botón de acción del dock ──────────────────────────────────────
function ActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
      <span style={{ width: 54, height: 54, borderRadius: 18, background: C.surface, border: `1.5px solid ${C.line}`, boxShadow: `0 4px 0 ${tint(color, 0.55)}, ${SHADOW.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.12s' }}>
        <Icon size={27} color={color} stroke={2.1} />
      </span>
      <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 11.5, color: C.ink }}>{label}</span>
    </button>
  );
}

// ── Cabecera de sub-pantalla ──────────────────────────────────────
function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <div style={{ width: '100%', maxWidth: 330, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '7px 9px', display: 'flex', alignItems: 'center' }} aria-label="Volver">
          <IconBack size={18} color={C.ink} />
        </button>
        {right || <span style={{ width: 34 }} />}
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 21, fontWeight: 800, textAlign: 'center', margin: '10px 0 2px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12.5, color: C.inkSoft, textAlign: 'center', margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// ── Baño ──────────────────────────────────────────────────────────
function BathroomScreen({ petName, mood, drawingUrl, bathProgress, bathDone, spongePos, bubbles, bathAreaRef, onBack, onSpongeDown, onSpongeMove, onSpongeUp }) {
  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Hora del baño" subtitle={bathDone ? '¡Quedó reluciente!' : `Frota la esponja sobre ${petName}`} onBack={onBack} />
      <div ref={bathAreaRef} className="pg-sticker" style={{ position: 'relative', width: 300, height: 380, overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(180deg, #D6ECFB 0%, #EAF6FD 100%)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '26%', background: 'linear-gradient(180deg, #BFE3F7, #A9D6F0)' }} />
        <div style={{ position: 'absolute', left: PET_CENTER.x - 78, top: PET_CENTER.y - 78, width: 156, height: 156 }}>
          <Pet mood={bathDone ? 'feliz' : mood} drawingUrl={drawingUrl} size={156} idle onPoke={() => {}} showShadow={false} />
          {bathProgress > 0 && !bathDone && (
            <div style={{ position: 'absolute', inset: 0, opacity: Math.min(0.9, 0.3 + bathProgress / 130), pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', left: 15, top: 25, fontSize: 22 }}>🫧</span>
              <span style={{ position: 'absolute', right: 10, top: 45, fontSize: 18 }}>🫧</span>
              <span style={{ position: 'absolute', left: 45, bottom: 15, fontSize: 16 }}>🫧</span>
            </div>
          )}
        </div>
        {bubbles.map((b) => (
          <span key={b.id} style={{ position: 'absolute', left: b.x, top: b.y, animation: 'pg-bubble-float 0.9s ease-out forwards', fontSize: 18, pointerEvents: 'none' }}>🫧</span>
        ))}
        {!bathDone && (
          <div
            onPointerDown={onSpongeDown} onPointerMove={onSpongeMove} onPointerUp={onSpongeUp}
            style={{ position: 'absolute', left: spongePos.x - 24, top: spongePos.y - 24, width: 48, height: 48, borderRadius: 14, background: '#FFF3B8', border: `3px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'grab', touchAction: 'none', boxShadow: SHADOW.lifted }}
          >
            🧽
          </div>
        )}
        {bathDone && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconSparkle size={54} color={C.amber} fill={C.amber} /></div>}
      </div>
      <div style={{ width: 280, marginTop: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconTub size={20} color={C.sage} />
        <div style={{ flex: 1, height: 13, borderRadius: 999, background: '#DCEBF5', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(80,110,130,0.2)' }}>
          <div style={{ width: `${bathProgress}%`, height: '100%', background: `linear-gradient(180deg, #BFE3F7, ${C.sky})`, transition: 'width 0.2s' }} />
        </div>
      </div>
      {bathDone && (
        <button onClick={onBack} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '11px 26px', fontSize: 14 }}>
          Volver con {petName}
        </button>
      )}
    </div>
  );
}

// ── Catálogo de minijuegos ────────────────────────────────────────
// Un solo lugar donde vive TODO lo que define cada juego: cómo paga,
// cuánto amor da, qué se muestra al terminar. Antes las fórmulas de
// monedas estaban repartidas en 7 funciones distintas y no había forma
// de ver de un vistazo si un juego pagaba mucho más que otro.
//
// `id` es estable y se usa como llave de récord en gameState — nunca
// cambiarlo aunque se renombre el juego de cara al usuario.
const GAME_META = {
  memoria: {
    title: 'Encuentra las parejas', unit: 'movimientos', lowerIsBetter: true,
    coins: (s) => Math.min(40, Math.max(12, 42 - s)), love: 10,
    done: '¡Las encontraste todas!',
  },
  atrapar: {
    title: 'Atrapa la comida', unit: 'atrapadas',
    coins: (s) => Math.min(45, Math.round(s * 1.6)), love: 8,
    done: '¡Buena atrapada!',
  },
  rompecabezas: {
    title: 'Rompecabezas', unit: 'movimientos', lowerIsBetter: true,
    coins: (s) => Math.min(55, Math.max(18, 85 - s)), love: 10,
    done: '¡Armaste la foto!',
  },
  topos: {
    title: 'Dale al que salga', unit: 'aciertos',
    coins: (s) => Math.min(45, Math.round(s * 1.5)), love: 5,
    done: '¡Qué reflejos!',
  },
  serpiente: {
    title: 'Serpiente golosa', unit: 'comidas',
    coins: (s) => Math.min(50, s * 2), love: 5,
    done: '¡Buena partida!',
  },
  cruzar: {
    title: 'Cruzar la calle', unit: 'cruces',
    coins: (s) => Math.min(50, s * 5), love: 6,
    done: '¡Lo lograste!',
  },
  torre: {
    title: 'Torre de bloques', unit: 'pisos',
    coins: (s) => Math.min(45, s * 2), love: 6,
    done: '¡Qué pulso!',
  },
  trivia: {
    title: 'Trivia del corazón', unit: 'aciertos',
    coins: (s) => Math.min(60, s * 8), love: 12,
    done: '¡Nos conocemos bien!',
  },
  simon: {
    title: 'Simón dice', unit: 'de secuencia',
    coins: (s) => Math.min(50, s * 5), love: 6,
    done: '¡Qué memoria!',
  },
  volar: {
    title: 'Salta y vuela', unit: 'obstáculos',
    coins: (s) => Math.min(50, s * 4), love: 6,
    done: '¡Buen vuelo!',
  },
  golosinas: {
    title: 'Conecta 3 golosinas', unit: 'golosinas',
    coins: (s) => Math.min(55, Math.round(s * 0.9)), love: 8,
    done: '¡Qué combos!',
  },
};

// ── Pantalla de resultado (compartida por TODOS los minijuegos) ─────
// Antes cada juego tenía su propia pantallita de "terminaste" y ninguna
// mostraba récord ni dejaba repetir sin salir. Esto es lo que convierte
// "jugué una vez" en "una más": ves tu récord, ves si lo rompiste, y el
// botón de volver a jugar está justo ahí.
function GameResult({ result, onReplay, onExit }) {
  if (!result) return null;
  const { gameId, score, coins, record, isRecord, bonus } = result;
  const meta = GAME_META[gameId] || {};
  return (
    <div
      className="pg-anim-rise"
      style={{
        position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(74,52,57,0.55)', padding: 20,
      }}
    >
      <div className="pg-card pg-anim-pop" style={{ width: '100%', maxWidth: 320, padding: 24, textAlign: 'center' }}>
        {isRecord ? (
          <>
            <div style={{ animation: 'pg-breathe 1.4s ease-in-out infinite' }}>
              <IconSparkle size={46} color={C.amber} fill={C.amber} />
            </div>
            <p style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, color: C.amber, margin: '8px 0 0' }}>
              ¡NUEVO RÉCORD!
            </p>
          </>
        ) : (
          <>
            <IconSparkle size={40} color={C.sage} fill={C.sage} />
            <p style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 700, margin: '8px 0 0' }}>{meta.done || '¡Bien jugado!'}</p>
          </>
        )}

        <p style={{ fontFamily: FONT.display, fontSize: 34, fontWeight: 800, color: C.ink, margin: '10px 0 0', lineHeight: 1 }}>{score}</p>
        <p style={{ fontSize: 12, color: C.inkSoft, margin: '2px 0 0' }}>{meta.unit}</p>

        {record != null && !isRecord && (
          <p style={{ fontSize: 12, color: C.inkFaint, margin: '8px 0 0' }}>
            Tu récord: <b style={{ color: C.inkSoft }}>{record} {meta.unit}</b>
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '14px 0 0' }}>
          <IconCoin size={18} color={C.amber} />
          <span style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink }}>+{coins}</span>
        </div>
        {bonus && (
          <p style={{ fontSize: 11.5, color: C.sage, fontWeight: 700, margin: '4px 0 0' }}>
            ✨ Bonus del día: monedas dobles
          </p>
        )}

        <div className="flex gap-3" style={{ marginTop: 18 }}>
          <button onClick={onExit} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Volver</button>
          <button onClick={onReplay} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Jugar otra vez</button>
        </div>
      </div>
    </div>
  );
}

// ── Menú de minijuegos ────────────────────────────────────────────
function GameCard({ id, title, desc, icon: Icon, color, onClick, record, recordUnit, bonusReady }) {
  return (
    // `data-game-id` es un asidero estable para poder auditar los juegos
    // uno por uno (por ejemplo, comprobar que todos entran en la pantalla
    // de un celular sin scroll) sin depender del texto visible.
    <button data-game-id={id} onClick={onClick} className="pg-card pg-focus" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 14, marginBottom: 12, textAlign: 'left', cursor: 'pointer', borderRadius: 20 }}>
      <span style={{ width: 48, height: 48, borderRadius: 15, background: tint(color, 0.72), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={26} color={color} stroke={2.2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: C.inkSoft }}>{desc}</div>
        {record != null && (
          <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2 }}>
            🏆 Récord: <b style={{ color: C.inkSoft }}>{record} {recordUnit}</b>
          </div>
        )}
      </div>
      {/* La zanahoria para volver mañana: se ve de un vistazo en qué
          juegos todavía no cobraste el doble de hoy. */}
      {bonusReady && (
        <span style={{ flexShrink: 0, fontFamily: FONT.display, fontSize: 10, fontWeight: 800, color: '#fff', background: C.sage, borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>
          x2 hoy
        </span>
      )}
    </button>
  );
}

// Lista declarativa: agregar un minijuego nuevo es agregar una línea
// aquí + su pantalla. No hay que tocar props ni el menú.
const GAME_LIST = [
  { id: 'trivia', desc: 'Cuánto se conocen de verdad', icon: IconHeart, color: C.rose },
  { id: 'memoria', desc: 'Memoria con sus fotos', icon: IconCards, color: C.lavender },
  { id: 'golosinas', desc: 'Junta 3 de sus comidas', icon: IconCookie, color: C.peach },
  { id: 'simon', desc: 'Repite la secuencia', icon: IconSparkle, color: C.amber },
  { id: 'volar', desc: 'Un toque para volar', icon: IconPaw, color: C.sky },
  { id: 'atrapar', desc: 'Muévete y atrápala', icon: IconCatch, color: C.amber },
  { id: 'rompecabezas', desc: 'Arma la imagen', icon: IconPuzzle, color: C.sage },
  { id: 'topos', desc: 'Tócalo antes de que se esconda', icon: IconMole, color: C.peach },
  { id: 'serpiente', desc: 'Guíala para que coma', icon: IconSnake, color: C.sage },
  { id: 'cruzar', desc: 'Esquiva los carros y llega', icon: IconRoad, color: C.sky },
  { id: 'torre', desc: 'Apila sin que se caiga', icon: IconTower, color: C.rose },
];

function GamesMenu({ game, onBack, onPlay }) {
  const streak = game.streak || 0;
  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Minijuegos" subtitle="Gana monedas para su cuarto" onBack={onBack} />

      {streak > 1 && (
        <div className="pg-card" style={{ width: '100%', maxWidth: 330, padding: '9px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, background: C.amberSoft, borderColor: C.amber }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink }}>
            {streak} días seguidos jugando
          </span>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 330 }}>
        {GAME_LIST.map((g) => (
          <GameCard
            key={g.id}
            id={g.id}
            title={GAME_META[g.id].title}
            desc={g.desc}
            icon={g.icon}
            color={g.color}
            record={(game.records || {})[g.id]}
            recordUnit={GAME_META[g.id].unit}
            bonusReady={isDailyBonusReady(game, g.id)}
            onClick={() => onPlay(g.id)}
          />
        ))}
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
        aspectRatio: '1', borderRadius: 14, border: `2.5px solid ${card.matched ? C.sage : C.line}`,
        background: isFlipped ? C.surface : `linear-gradient(160deg, ${tint(C.lavender, 0.5)}, ${tint(C.rose, 0.55)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: isFlipped ? 'default' : 'pointer', padding: 2, opacity: card.matched ? 0.9 : 1,
        boxShadow: isFlipped ? 'none' : SHADOW.soft, transition: 'transform 0.15s',
      }}
    >
      {isFlipped ? (
        card.content.type === 'photo' ? (
          <img src={card.content.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
        ) : card.content.type === 'text' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>{card.content.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>{card.content.value}</div>
          </div>
        ) : (
          <span style={{ fontSize: 24 }}>{card.content.value}</span>
        )
      ) : (
        <IconHeart size={20} color="#fff" fill="#fff" style={{ opacity: 0.9 }} />
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
  // Evita que onComplete se dispare dos veces si el efecto vuelve a correr.
  const doneRef = useRef(false);

  function handleCardClick(card) {
    if (locked || card.matched || flippedIds.includes(card.id)) return;
    if (flippedIds.length === 0) { setFlippedIds([card.id]); return; }
    const firstId = flippedIds[0];
    const first = cards.find((c) => c.id === firstId);
    setFlippedIds([firstId, card.id]);
    setMoves((m) => m + 1);
    setLocked(true);
    if (first.contentId === card.contentId) {
      setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === firstId || c.id === card.id ? { ...c, matched: true } : c)));
        setFlippedIds([]); setLocked(false);
      }, 500);
    } else {
      setTimeout(() => { setFlippedIds([]); setLocked(false); }, 900);
    }
  }

  useEffect(() => {
    if (doneRef.current) return;
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      doneRef.current = true;
      setWon(true);
      // Pequeña pausa para que se vea la última pareja antes del resultado.
      setTimeout(() => onComplete(moves), 450);
    }
  }, [cards, moves, onComplete]);

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Encuentra las parejas" onBack={onBack} right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{moves} mov.</span>} />
      <div className="grid grid-cols-3 gap-2.5 mb-4" style={{ width: '100%', maxWidth: 320, opacity: won ? 0.6 : 1, transition: 'opacity 0.3s' }}>
        {cards.map((card) => (
          <MemoryCard key={card.id} card={card} isFlipped={flippedIds.includes(card.id) || card.matched} onClick={() => handleCardClick(card)} />
        ))}
      </div>
    </div>
  );
}

const FOOD_EMOJIS = ['🍕', '🍰', '🍦', '🍓', '🍩', '🍪'];
const CATCH_AREA_W = 300;
const CATCH_AREA_H = 380;
const CATCHER_Y = 335;
const CATCH_RADIUS = 32;

function CatchGame({ drawingUrl, foods = [], onBack, onComplete }) {
  const [catcherX, setCatcherX] = useState(150);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const nextIdRef = useRef(0);
  const catcherXRef = useRef(150);
  const doneRef = useRef(false);

  // Pool de "cae comida": usa las fotos de comida que subió quien regaló.
  // Cada ítem lleva si a la mascota le gusta o no, porque atrapar algo
  // que odia ahora cuesta una vida — antes daba igual qué agarraras y no
  // había ninguna decisión que tomar, solo mover el dedo.
  const dropPool = useRef(
    (() => {
      const real = foods
        .filter((f) => f.image)
        .map((f) => ({ image: f.image, bad: f.preference === 'no_gusta', label: f.food_name }));
      // Hace falta al menos una comida buena; si quien regaló solo cargó
      // cosas que no le gustan, el juego sería imposible de puntuar.
      if (real.some((f) => !f.bad)) return real;
      return [...real, ...FOOD_EMOJIS.map((e) => ({ emoji: e, bad: false }))];
    })()
  ).current;

  // Aviso flotante al atrapar algo que no le gusta.
  const [badFlash, setBadFlash] = useState(null);

  useEffect(() => { catcherXRef.current = catcherX; }, [catcherX]);

  // Dificultad progresiva: al principio cae poca comida y lenta; al final
  // llueve. Antes la velocidad era fija los 25 segundos, así que el
  // segundo 24 se sentía igual que el segundo 1 y aburría.
  const elapsed = 25 - timeLeft;
  const fallSpeed = 7 + elapsed * 0.32;          // 7 → ~15 px por tic
  const spawnMs = Math.max(380, 900 - elapsed * 22); // 900ms → 380ms

  useEffect(() => {
    if (gameOver) return;
    const spawn = setInterval(() => {
      const drop = dropPool[Math.floor(Math.random() * dropPool.length)];
      const x = 30 + Math.random() * (CATCH_AREA_W - 60);
      nextIdRef.current += 1;
      setItems((prev) => [...prev, { id: nextIdRef.current, x, y: -20, ...drop }]);
    }, spawnMs);
    return () => clearInterval(spawn);
  }, [gameOver, spawnMs]);

  useEffect(() => {
    if (gameOver) return;
    const tick = setInterval(() => {
      setItems((prev) => {
        const next = [];
        prev.forEach((item) => {
          const newY = item.y + fallSpeed;
          const inCatchBand = newY >= CATCHER_Y - 12 && newY <= CATCHER_Y + 18;
          if (inCatchBand && Math.abs(item.x - catcherXRef.current) < CATCH_RADIUS) {
            if (item.bad) {
              // Le diste de comer algo que odia: cuesta una vida. Esto es
              // lo que convierte el juego en decidir qué agarrar y qué
              // esquivar, en vez de agarrar todo lo que caiga.
              play('bad');
              setLives((v) => v - 1);
              setBadFlash({ key: Date.now(), label: item.label });
              setTimeout(() => setBadFlash(null), 900);
            } else {
              play('good');
              setScore((s) => s + 1);
            }
            return;
          }
          // Dejar caer algo NO cuesta vida: ya cuesta los puntos que no
          // sumaste. Las vidas son para lo otro — darle de comer algo que
          // odia. Con las dos penalizaciones el juego se acababa solo en
          // cuatro segundos sin que llegaras a jugar.
          if (newY > CATCH_AREA_H + 10) return;
          next.push({ ...item, y: newY });
        });
        return next;
      });
    }, 55);
    return () => clearInterval(tick);
  }, [gameOver, fallSpeed]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) { play('bad'); setGameOver(true); }
  }, [lives, gameOver]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) { if (timeLeft <= 0) setGameOver(true); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (!gameOver || doneRef.current) return;
    doneRef.current = true;
    setTimeout(() => onComplete(score), 500);
  }, [gameOver, score, onComplete]);


  // Sigue el dedo dentro del área de juego, en coordenadas del área
  // (no de la pantalla), para que funcione igual con cualquier escala.
  function dragMove(e) {
    if (gameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CATCH_AREA_W;
    setCatcherX(Math.max(28, Math.min(CATCH_AREA_W - 28, x)));
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader
        title="Atrapa la comida" subtitle="Atrapa solo lo que le gusta" onBack={onBack}
        right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.rose }}>{gameOver ? '' : `${timeLeft}s`}</span>}
      />
      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
        {[0, 1, 2].map((i) => (
          <IconHeart key={i} size={17} color={C.rose} fill={i < lives ? C.rose : 'transparent'} />
        ))}
      </div>
      {/* El tablero mantiene sus coordenadas internas de 300×380 (la
          física trabaja en esas unidades) pero se dibuja en porcentajes,
          así que puede encogerse para caber en un celular bajo sin que
          nada se descoloque. `dragMove` ya normaliza contra el ancho real. */}
      <div
        className="pg-sticker"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragMove(e); }}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') dragMove(e); }}
        style={{
          position: 'relative',
          // El alto manda y el ancho sale de la proporción: así el campo
          // se encoge entero en un celular bajo en vez de achatarse.
          height: `min(${CATCH_AREA_H}px, 56vh)`,
          aspectRatio: `${CATCH_AREA_W} / ${CATCH_AREA_H}`,
          maxWidth: '86vw',
          overflow: 'hidden', borderRadius: 28,
          background: 'linear-gradient(180deg, #E8DBFA 0%, #F5EFFC 100%)', touchAction: 'none',
        }}
      >
        {!gameOver && items.map((item) => {
          const pct = { left: `${(item.x / CATCH_AREA_W) * 100}%`, top: `${(item.y / CATCH_AREA_H) * 100}%` };
          return item.image ? (
            <img key={item.id} src={item.image} alt="" style={{
              position: 'absolute', ...pct, transform: 'translateX(-50%)',
              width: `${(32 / CATCH_AREA_W) * 100}%`, aspectRatio: '1',
              borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.ink}`, boxShadow: SHADOW.soft,
            }} />
          ) : (
            <span key={item.id} style={{ position: 'absolute', ...pct, transform: 'translateX(-50%)', fontSize: 24 }}>{item.emoji}</span>
          );
        })}
        {!gameOver && (
          <div style={{
            position: 'absolute', left: `${(catcherX / CATCH_AREA_W) * 100}%`, top: `${((CATCHER_Y - 24) / CATCH_AREA_H) * 100}%`,
            transform: 'translateX(-50%)', transition: 'left 0.12s',
          }}>
            <Pet mood={badFlash ? 'enojado' : 'feliz'} drawingUrl={drawingUrl} size={56} idle={false} onPoke={() => {}} showShadow={false} />
          </div>
        )}

        {/* Al atrapar algo que odia se dice CUÁL fue: así se aprende qué
            le gusta jugando, sin tener que memorizarlo de antemano. */}
        {badFlash && (
          <div
            key={badFlash.key}
            className="pg-anim-pop"
            style={{
              position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%,-50%)',
              background: C.rose, color: '#fff', borderRadius: 999, padding: '7px 14px',
              fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap',
              boxShadow: SHADOW.lifted, pointerEvents: 'none',
            }}
          >
            {/* Construcción que funciona con cualquier nombre de comida:
                "¡No me gusta Aceitunas!" sonaría mal, "¡Ugh, Aceitunas!" no. */}
            {badFlash.label ? `¡Ugh, ${badFlash.label}! −1 ❤️` : '¡Eso no me gusta! −1 ❤️'}
          </div>
        )}
      </div>
      {/* Sin flechas: se mueve arrastrando sobre el tablero (con dedo o
          con mouse). Quitarlas también libera el alto que hacía falta
          para que el juego entre entero en un celular. */}
      <p style={{ fontSize: 12, color: C.inkSoft, marginTop: 10, fontFamily: FONT.display, fontWeight: 700 }}>Puntos: {score}</p>
    </div>
  );
}

// ── Golpea al topo ─────────────────────────────────────────────────
const WHACK_HOLES = 9;
const WHACK_DURATION = 20;

function MoleFace({ size = 34 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <ellipse cx="20" cy="24" rx="16" ry="14" fill="#B98A5E" stroke={C.ink} strokeWidth="2.2" />
      <ellipse cx="20" cy="28" rx="9" ry="7" fill="#E8C9A0" />
      <circle cx="13" cy="18" r="2.4" fill={C.ink} />
      <circle cx="27" cy="18" r="2.4" fill={C.ink} />
      <ellipse cx="20" cy="26" rx="2.6" ry="2" fill={C.ink} />
    </svg>
  );
}

// `targets` son las comidas y objetos que configuró quien regaló. Lo
// que sale del agujero significa algo para la pareja, en vez de ser un
// topo genérico que da igual golpear.
function WhackGame({ onBack, onComplete, targets = [] }) {
  const [holes, setHoles] = useState(() => Array(WHACK_HOLES).fill(false));
  // qué cosa salió en cada agujero esta vez
  const [what, setWhat] = useState(() => Array(WHACK_HOLES).fill(0));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WHACK_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const doneRef = useRef(false);

  // Se acelera con el tiempo: al principio salen tranquilos y se quedan
  // un rato; al final aparecen casi seguido y hay que ser rapidísima.
  // Antes el ritmo era fijo y el juego se sentía igual todo el tiempo.
  const elapsed = WHACK_DURATION - timeLeft;
  const popMs = Math.max(300, 700 - elapsed * 22);
  const visibleMs = Math.max(420, 850 - elapsed * 24);

  useEffect(() => {
    if (gameOver) return;
    const pop = setInterval(() => {
      setHoles((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * WHACK_HOLES);
        next[idx] = true;
        if (targets.length) {
          setWhat((w) => { const n = [...w]; n[idx] = Math.floor(Math.random() * targets.length); return n; });
        }
        setTimeout(() => setHoles((p2) => { const n2 = [...p2]; n2[idx] = false; return n2; }), visibleMs);
        return next;
      });
    }, popMs);
    return () => clearInterval(pop);
  }, [gameOver, popMs, visibleMs]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) { if (timeLeft <= 0) setGameOver(true); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (!gameOver || doneRef.current) return;
    doneRef.current = true;
    setTimeout(() => onComplete(score), 400);
  }, [gameOver, score, onComplete]);

  function tapHole(i) {
    if (!holes[i]) { play('bad'); return; }
    play('good');
    setHoles((prev) => { const next = [...prev]; next[i] = false; return next; });
    setScore((s) => s + 1);
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Dale al que salga" subtitle="Tócalo antes de que se esconda" onBack={onBack} right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.rose }}>{gameOver ? '' : `${timeLeft}s`}</span>} />
      {(
        <div className="grid grid-cols-3 gap-3" style={{ width: '100%', maxWidth: 280, marginBottom: 16, opacity: gameOver ? 0.5 : 1 }}>
          {holes.map((up, i) => (
            <button
              key={i} onClick={() => tapHole(i)} className="pg-focus"
              style={{
                aspectRatio: '1', borderRadius: '50%', position: 'relative',
                // Tierra alrededor + hueco oscuro dentro: antes era un
                // círculo café plano y no se leía como agujero.
                background: `radial-gradient(ellipse at 50% 38%, #3A2A22 0%, #4E382C 42%, #A97C52 43%, #C9995F 70%, #DDB07A 100%)`,
                border: `3px solid ${C.ink}`,
                boxShadow: `inset 0 8px 14px rgba(0,0,0,0.45), ${SHADOW.soft}`,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer',
              }}
            >
              <div style={{ transform: up ? 'translateY(0%)' : 'translateY(100%)', transition: 'transform 0.15s', width: '100%', height: '78%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {targets.length ? (() => {
                  const t = targets[what[i] % targets.length];
                  return t.image ? (
                    <img src={t.image} alt={t.label} style={{ width: '82%', height: '82%', objectFit: 'contain', pointerEvents: 'none' }} />
                  ) : (
                    <span style={{ width: '62%', height: '62%', borderRadius: '45% 55% 50% 50%', background: t.color, border: `2px solid ${C.ink}` }} />
                  );
                })() : <MoleFace />}
              </div>
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize: 12, color: C.inkSoft, fontFamily: FONT.display, fontWeight: 700 }}>Puntos: {score}</p>
    </div>
  );
}

// ── Serpiente golosa ───────────────────────────────────────────────
const SNAKE_COLS = 11;
const SNAKE_ROWS = 11;
const SNAKE_CELL = 24;
const SNAKE_TICK_MS = 230;

function randomCell(exclude) {
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * SNAKE_COLS), y: Math.floor(Math.random() * SNAKE_ROWS) };
  } while (exclude.some((e) => e.x === cell.x && e.y === cell.y));
  return cell;
}

function SnakeGame({ onBack, onComplete, treatEmoji, drawingUrl }) {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const dirRef = useRef({ x: 1, y: 0 });
  const [food, setFood] = useState(() => randomCell([{ x: 5, y: 5 }]));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const doneRef = useRef(false);

  function setDirection(nx, ny) {
    // no permitir invertir sobre sí misma
    if (dirRef.current.x === -nx && dirRef.current.y === -ny) return;
    dirRef.current = { x: nx, y: ny };
    setDir({ x: nx, y: ny });
  }

  // La comida se lee por ref dentro del bucle. Antes el efecto dependía
  // de `food`, así que cada vez que comía se destruía y recreaba el
  // intervalo: se perdía el ritmo justo en el momento más tenso.
  const foodRef = useRef(food);
  useEffect(() => { foodRef.current = food; }, [food]);

  // Acelera con cada comida: empieza tranquila y termina frenética.
  // Antes iba a 230ms para siempre y se volvía monótona enseguida.
  const tickMs = Math.max(110, SNAKE_TICK_MS - score * 7);

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const nx = head.x + dirRef.current.x;
        const ny = head.y + dirRef.current.y;
        if (nx < 0 || ny < 0 || nx >= SNAKE_COLS || ny >= SNAKE_ROWS) { play('bad'); setGameOver(true); return prev; }
        if (prev.some((s) => s.x === nx && s.y === ny)) { play('bad'); setGameOver(true); return prev; }
        const newHead = { x: nx, y: ny };
        const f = foodRef.current;
        const ateFood = f.x === nx && f.y === ny;
        const nextBody = [newHead, ...prev];
        if (!ateFood) nextBody.pop();
        else {
          play('good');
          setScore((s) => s + 1);
          setFood(randomCell(nextBody));
        }
        return nextBody;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [gameOver, tickMs]);

  useEffect(() => {
    if (!gameOver || doneRef.current) return;
    doneRef.current = true;
    setTimeout(() => onComplete(score), 500);
  }, [gameOver, score, onComplete]);

  // Deslizar el dedo es lo natural en un celular; las flechas siguen
  // ahí para quien juegue con mouse o prefiera tocarlas.
  const touchRef = useRef(null);
  function onTouchStart(e) {
    const t = e.touches ? e.touches[0] : e;
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touchRef.current) return;
    const t = (e.changedTouches ? e.changedTouches[0] : e);
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;   // fue un toque, no un gesto
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 1 : -1, 0);
    else setDirection(0, dy > 0 ? 1 : -1);
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Serpiente golosa" subtitle="Desliza el dedo para girar" onBack={onBack} right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{score} pts</span>} />
      <div
        className="pg-sticker"
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        onPointerDown={onTouchStart} onPointerUp={onTouchEnd}
        style={{
          position: 'relative', width: SNAKE_COLS * SNAKE_CELL, height: SNAKE_ROWS * SNAKE_CELL,
          overflow: 'hidden', borderRadius: 18, marginBottom: 14, touchAction: 'none',
          background: 'linear-gradient(180deg, #DDF0DC 0%, #EFF8EE 100%)',
          // Cuadrícula sutil: ayuda a calcular el siguiente movimiento sin
          // llenar el fondo de líneas duras.
          backgroundImage: `linear-gradient(180deg, #DDF0DC 0%, #EFF8EE 100%),
            repeating-linear-gradient(90deg, rgba(74,52,57,0.05) 0 1px, transparent 1px ${SNAKE_CELL}px),
            repeating-linear-gradient(180deg, rgba(74,52,57,0.05) 0 1px, transparent 1px ${SNAKE_CELL}px)`,
          boxShadow: `inset 0 0 0 2.5px ${C.ink}`,
        }}
      >
        {/* la comida late, para que se note dónde está */}
        <span style={{
          position: 'absolute', left: food.x * SNAKE_CELL, top: food.y * SNAKE_CELL,
          width: SNAKE_CELL, height: SNAKE_CELL, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, animation: 'pg-breathe 1.1s ease-in-out infinite',
        }}>{treatEmoji || '🍓'}</span>

        {snake.map((s, i) => {
          const isHead = i === 0;
          const isTail = i === snake.length - 1;

          // La cabeza ES la mascota: quien juega guía a SU mascota, no a
          // una serpiente genérica de otro juego. Se dibuja un poco más
          // grande que la celda y por encima del cuerpo para que se lea.
          if (isHead && drawingUrl) {
            const dir = dirRef.current;
            return (
              <img
                key={i} src={drawingUrl} alt=""
                style={{
                  position: 'absolute',
                  left: s.x * SNAKE_CELL - 3, top: s.y * SNAKE_CELL - 3,
                  width: SNAKE_CELL + 6, height: SNAKE_CELL + 6,
                  objectFit: 'contain', zIndex: 3,
                  // Se voltea para que mire hacia donde avanza (igual que
                  // en Cruzar la calle). Solo en horizontal: darla vuelta
                  // en vertical la dejaría de cabeza.
                  transform: dir.x < 0 ? 'scaleX(-1)' : 'none',
                  filter: 'drop-shadow(0 2px 3px rgba(74,52,57,0.35))',
                  transition: 'left 0.08s linear, top 0.08s linear',
                }}
              />
            );
          }

          // La cola se afina y el cuerpo alterna tono: se lee como un
          // bicho y no como una fila de cuadrados iguales.
          const shrink = isTail ? 4 : 2;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: s.x * SNAKE_CELL + shrink / 2 + 1,
              top: s.y * SNAKE_CELL + shrink / 2 + 1,
              width: SNAKE_CELL - 2 - shrink, height: SNAKE_CELL - 2 - shrink,
              borderRadius: isTail ? '50%' : 7,
              background: i % 2 ? C.sageDeep : C.sage,
              border: `1.6px solid ${C.ink}`,
              zIndex: 1,
            }} />
          );
        })}
      </div>
      {!gameOver && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gridTemplateRows: 'repeat(2, 44px)', gap: 6, justifyContent: 'center' }}>
          <span />
          <button onClick={() => setDirection(0, -1)} className="pg-btn pg-btn-ghost pg-focus" style={{ fontSize: 18 }}>▲</button>
          <span />
          <button onClick={() => setDirection(-1, 0)} className="pg-btn pg-btn-ghost pg-focus" style={{ fontSize: 18 }}>◀</button>
          <button onClick={() => setDirection(0, 1)} className="pg-btn pg-btn-ghost pg-focus" style={{ fontSize: 18 }}>▼</button>
          <button onClick={() => setDirection(1, 0)} className="pg-btn pg-btn-ghost pg-focus" style={{ fontSize: 18 }}>▶</button>
        </div>
      )}
    </div>
  );
}

// ── Quiz personalizado ──────────────────────────────────────────────
// ── Cruzar la carretera ───────────────────────────────────────────
// Reemplaza a la batalla naval. Es corto, se falla rápido y siempre
// puedes intentar llegar un carril más lejos: eso es lo que hace que
// den ganas de volver a jugarlo.
const CROSS_LANES = 7;
const CROSS_COLS = 7;

function CrossingGame({ drawingUrl, onBack, onComplete }) {
  const [row, setRow] = useState(CROSS_LANES);      // fila 0 = meta
  const [col, setCol] = useState(Math.floor(CROSS_COLS / 2));
  const [cars, setCars] = useState(() =>
    Array.from({ length: CROSS_LANES - 1 }, (_, i) => ({
      lane: i + 1,
      pos: Math.random() * CROSS_COLS,
      dir: i % 2 === 0 ? 1 : -1,
      speed: 0.9 + Math.random() * 0.8 + i * 0.12,
    })));
  const [crossings, setCrossings] = useState(0);
  const [lives, setLives] = useState(3);
  const [state, setState] = useState('play');       // play | hit | done
  const rowRef = useRef(row); rowRef.current = row;
  const colRef = useRef(col); colRef.current = col;
  const stateRef = useRef(state); stateRef.current = state;
  const doneRef = useRef(false);

  // Los coches se mueven con el reloj, no por cuadros: así van igual de
  // rápido en cualquier dispositivo.
  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (stateRef.current === 'play') {
        setCars((prev) => prev.map((c) => {
          let pos = c.pos + c.dir * c.speed * dt;
          if (pos > CROSS_COLS) pos -= CROSS_COLS + 1;
          if (pos < -1) pos += CROSS_COLS + 1;
          return { ...c, pos };
        }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Choque: se comprueba contra la posición de la mascota cada vez que
  // los coches se mueven.
  useEffect(() => {
    if (state !== 'play') return;
    const r = rowRef.current;
    if (r === 0 || r === CROSS_LANES) return;
    const hit = cars.some((c) => c.lane === r && Math.abs(c.pos - colRef.current) < 0.72);
    if (hit) {
      play('bad');
      setState('hit');
      // Ahora atropellarte CUESTA. Antes reaparecías gratis e infinitas
      // veces: sin nada que perder, cruzar no tenía ninguna emoción.
      setLives((v) => v - 1);
      setTimeout(() => {
        setRow(CROSS_LANES);
        setCol(Math.floor(CROSS_COLS / 2));
        setState('play');
      }, 700);
    }
  }, [cars, state]);

  useEffect(() => {
    if (lives > 0 || doneRef.current) return;
    doneRef.current = true;
    setState('done');
    setTimeout(() => onComplete(crossings), 700);
  }, [lives, crossings, onComplete]);

  function move(dr, dc) {
    if (state !== 'play') return;
    play('pop');
    setRow((r) => {
      const next = Math.max(0, Math.min(CROSS_LANES, r + dr));
      if (next === 0) {
        // llegó al otro lado
        play('good');
        setCrossings((n) => n + 1);
        // Cada cruce acelera el tráfico: la ronda 8 no se parece en nada
        // a la ronda 1, que es lo que hace querer "una vuelta más".
        setCars((prev) => prev.map((c) => ({ ...c, speed: c.speed * 1.09 })));
        setTimeout(() => setRow(CROSS_LANES), 420);
      }
      return next;
    });
    setCol((c) => Math.max(0, Math.min(CROSS_COLS - 1, c + dc)));
  }

  // Deslizar el dedo, como en los juegos del género. Antes solo había
  // cuatro flechas debajo del tablero: en un celular obliga a mirar los
  // botones en vez del tráfico, que es justo lo contrario de lo que pide
  // este juego. Un toque sin desplazamiento avanza (lo más frecuente).
  const touchRef = useRef(null);
  function onTouchStart(e) {
    const t = e.touches ? e.touches[0] : e;
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touchRef.current) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) { move(-1, 0); return; }  // toque = avanzar
    if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1);
    else move(dy > 0 ? 1 : -1, 0);
  }

  const cellW = 100 / CROSS_COLS;

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Cruzar la calle" subtitle="Desliza para moverte · toca para avanzar" onBack={onBack} />

      <div style={{ display: 'flex', gap: 18, marginBottom: 10, alignItems: 'center' }}>
        <Badge label="Cruces" value={crossings} />
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <IconHeart key={i} size={18} color={C.rose} fill={i < lives ? C.rose : 'transparent'} />
          ))}
        </div>
      </div>

      <div
        className="pg-sticker"
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        onPointerDown={onTouchStart} onPointerUp={onTouchEnd}
        // `maxHeight` en vh además del ancho: en un celular bajo el
        // tablero se encoge en vez de empujar los controles fuera de la
        // pantalla. La proporción 7/8 se mantiene sola.
        style={{ position: 'relative', width: '100%', maxWidth: 330, aspectRatio: '7 / 8', maxHeight: '58vh', borderRadius: 20, overflow: 'hidden', background: '#8FBF7F', touchAction: 'none' }}
      >
        {Array.from({ length: CROSS_LANES + 1 }, (_, i) => {
          const isRoad = i > 0 && i < CROSS_LANES;
          const laneH = 100 / (CROSS_LANES + 1);
          return (
            <div key={i} style={{
              position: 'absolute', left: 0, right: 0,
              top: `${(i / (CROSS_LANES + 1)) * 100}%`, height: `${laneH}%`,
              background: isRoad
                ? 'linear-gradient(180deg, #55505C 0%, #625C69 50%, #4E4955 100%)'
                : (i === 0
                  ? 'linear-gradient(180deg, #B6E0A6, #9AD187)'
                  : 'linear-gradient(180deg, #96C784, #85B975)'),
            }}>
              {/* línea discontinua del centro del carril */}
              {isRoad && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, transform: 'translateY(-50%)', background: 'repeating-linear-gradient(90deg, rgba(255,240,200,0.75) 0 16px, transparent 16px 34px)' }} />
              )}
              {/* bordillo: separa el pasto del asfalto y da relieve */}
              {(i === 1 || i === CROSS_LANES - 1) && (
                <div style={{ position: 'absolute', left: 0, right: 0, [i === 1 ? 'top' : 'bottom']: 0, height: 4, background: 'repeating-linear-gradient(90deg, #E8E0D4 0 12px, #C9BFB0 12px 24px)', borderTop: `1.5px solid ${C.ink}`, opacity: 0.85 }} />
              )}
              {/* matitas y flores en el pasto, para que no sea verde plano */}
              {!isRoad && [8, 26, 47, 68, 88].map((l, k) => (
                <span key={k} style={{ position: 'absolute', left: `${l}%`, top: `${28 + ((k * 17) % 42)}%`, fontSize: 9, opacity: 0.7 }}>
                  {k % 2 ? '🌿' : '🌼'}
                </span>
              ))}
              {i === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>🏁</span>
                  <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: '#33622C', letterSpacing: '0.06em' }}>META</span>
                  <span style={{ fontSize: 13 }}>🏁</span>
                </div>
              )}
            </div>
          );
        })}

        {cars.map((c, i) => {
          const colors = ['#D8697F', '#E2A845', '#8FC7EE', '#C3A7EA', '#7FA894', '#EE7BC8'];
          const laneH = 100 / (CROSS_LANES + 1);
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${(c.pos / CROSS_COLS) * 100}%`,
              top: `${(c.lane / (CROSS_LANES + 1)) * 100 + laneH * 0.13}%`,
              width: `${cellW * 1.5}%`, height: `${laneH * 0.78}%`,
            }}>
              {/* humito del escape, detrás del carro */}
              <span style={{
                position: 'absolute', top: '55%', [c.dir > 0 ? 'left' : 'right']: '-8%',
                width: 8, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.6)',
                animation: 'pg-exhaust 0.7s ease-out infinite',
              }} />
              <Car color={colors[c.lane % colors.length]} flip={c.dir < 0} />
            </div>
          );
        })}

        {/* la mascota */}
        <div style={{
          position: 'absolute',
          left: `${(col / CROSS_COLS) * 100}%`,
          top: `${(row / (CROSS_LANES + 1)) * 100}%`,
          width: `${cellW}%`, height: `${100 / (CROSS_LANES + 1)}%`,
          transition: 'left 0.11s, top 0.11s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: state === 'hit' ? 'grayscale(1)' : 'none',
          transform: state === 'hit' ? 'scale(0.8) rotate(-14deg)' : 'none',
        }}>
          {drawingUrl
            ? <img src={drawingUrl} alt="" style={{ width: '96%', height: '96%', objectFit: 'contain' }} />
            : <div style={{ width: '80%', height: '80%', borderRadius: '50%', background: C.peach, border: `2px solid ${C.ink}` }} />}
        </div>
      </div>

      {/* Sin botones de flechas a propósito: todo se juega sobre el
          tablero. Con el mouse funciona igual (arrastrar o hacer clic),
          y quitarlos libera el alto que hacía falta para que el juego
          entre entero en la pantalla de un celular. */}
      <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 10, textAlign: 'center' }}>
        Desliza en cualquier dirección · un toque avanza
      </p>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.inkSoft, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

// ── Torre de bloques ──────────────────────────────────────────────
// Reemplaza al quiz. Un solo botón, dificultad que sube sola y un
// récord que batir: se juega "una más" sin pensarlo.
function TowerGame({ onBack, onComplete }) {
  const W = 300;
  const [blocks, setBlocks] = useState([{ x: 90, w: TOWER.START_W }]);
  const [cur, setCur] = useState({ x: 0, w: TOWER.START_W, dir: 1 });
  const [over, setOver] = useState(false);
  // Racha de bloques perfectos seguidos: se muestra y da ancho de vuelta.
  const [streak, setStreak] = useState(0);
  const [perfectFlash, setPerfectFlash] = useState(null);
  const curRef = useRef(cur); curRef.current = cur;
  const overRef = useRef(over); overRef.current = over;
  const speed = 120 + blocks.length * 11;

  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!overRef.current) {
        setCur((c) => {
          let x = c.x + c.dir * speed * dt;
          let dir = c.dir;
          if (x + c.w > W) { x = W - c.w; dir = -1; }
          if (x < 0) { x = 0; dir = 1; }
          return { ...c, x, dir };
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  function drop() {
    if (over) return;
    const top = blocks[blocks.length - 1];
    // La resolución vive en towerLogic.js (probada aparte): aquí solo
    // se traduce el resultado a estado, sonido y animación.
    const r = resolveDrop(top, curRef.current, W);

    if (r.lost) {
      play('bad');
      setOver(true);
      setTimeout(() => onComplete(blocks.length - 1), 600);
      return;
    }

    if (r.perfect) {
      play('good');
      setStreak((s) => {
        const next = s + 1;
        setPerfectFlash({ key: Date.now(), streak: next });
        setTimeout(() => setPerfectFlash(null), 700);
        return next;
      });
    } else {
      play('pop');
      setStreak(0);
    }

    setBlocks((b) => [...b, { ...r.block, perfect: r.perfect }]);
    setCur({ x: 0, w: r.block.w, dir: 1 });
  }

  const score = blocks.length - 1;

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Torre de bloques" subtitle="Clávalo justo encima y recuperas ancho" onBack={onBack} />

      <div style={{ display: 'flex', gap: 18, marginBottom: 10, alignItems: 'center' }}>
        <Badge label="Pisos" value={score} />
        {streak > 0 && <Badge label="Seguidos" value={`🔥${streak}`} />}
      </div>

      <div
        onClick={drop}
        className="pg-sticker"
        style={{ position: 'relative', width: '100%', maxWidth: 330, height: 330, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(180deg, #DCEBF7, #F6E7D3)', cursor: over ? 'default' : 'pointer' }}
      >
        {/* Aviso de bloque clavado: es la recompensa que enseña la
            mecánica nueva sin tener que explicarla con un tutorial. */}
        {perfectFlash && (
          <div
            key={perfectFlash.key}
            className="pg-anim-pop"
            style={{
              position: 'absolute', left: '50%', top: 18, transform: 'translateX(-50%)', zIndex: 5,
              background: C.sage, color: '#fff', borderRadius: 999, padding: '6px 15px',
              fontFamily: FONT.display, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap',
              boxShadow: SHADOW.lifted, pointerEvents: 'none',
            }}
          >
            ¡PERFECTO!{perfectFlash.streak > 1 ? ` ×${perfectFlash.streak}` : ''} +ancho
          </div>
        )}
        {/* la torre crece hacia arriba: se desplaza para que la cima
            siempre se vea, aunque tengas 40 pisos */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, transform: `translateY(${Math.max(0, blocks.length * 18 - 200)}px)`, transition: 'transform 0.18s' }}>
          {blocks.map((b, i) => {
            const col = ['#D8697F', '#E2A845', '#7FA894', '#8FC7EE', '#C3A7EA'][i % 5];
            return (
              <div key={i} style={{
                position: 'absolute', bottom: i * 18, left: `${(b.x / W) * 100}%`, width: `${(b.w / W) * 100}%`,
                height: 17, borderRadius: 4,
                // Mismo principio que los muebles del cuarto: cara superior
                // iluminada + base en sombra = volumen, no una barra plana.
                background: `linear-gradient(180deg, ${tint(col, 0.42)} 0 5px, ${col} 5px calc(100% - 4px), ${tint(col, -0.001) === col ? 'rgba(0,0,0,0.18)' : col} calc(100% - 4px) 100%)`,
                // Los bloques clavados quedan marcados con un borde dorado:
                // se ve la racha en la propia torre al mirarla.
                border: b.perfect ? `2px solid ${C.amber}` : `2px solid ${C.ink}`,
                boxShadow: b.perfect
                  ? `inset 0 -3px 0 rgba(0,0,0,0.18), 0 0 8px ${C.amberSoft}`
                  : 'inset 0 -3px 0 rgba(0,0,0,0.18)',
              }}>
                <div style={{ position: 'absolute', inset: '2px 4px auto 4px', height: 3, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }} />
              </div>
            );
          })}
          {!over && (
            <div style={{
              position: 'absolute', bottom: blocks.length * 18, left: `${(cur.x / W) * 100}%`, width: `${(cur.w / W) * 100}%`,
              height: 17, borderRadius: 4,
              background: `linear-gradient(180deg, ${tint(C.rose, 0.45)} 0 5px, ${C.rose} 5px 100%)`,
              border: `2px solid ${C.ink}`,
              boxShadow: `${SHADOW.lifted}, 0 0 14px ${C.roseSoft}`,
            }}>
              <div style={{ position: 'absolute', inset: '2px 4px auto 4px', height: 3, background: 'rgba(255,255,255,0.65)', borderRadius: 2 }} />
            </div>
          )}
        </div>

        {over && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,253,248,0.9)' }}>
            <p style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{score} pisos</p>
            <p style={{ fontSize: 13, color: C.inkSoft }}>Se cayó la torre</p>
          </div>
        )}
      </div>

      {!over && (
        <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 12, textAlign: 'center' }}>
          Toca la pantalla para soltar el bloque
        </p>
      )}
    </div>
  );
}

// ── Trivia del corazón ─────────────────────────────────────────────
// El único minijuego que NO se podría jugar con otra mascota: las
// preguntas salen de lo que configuró quien regaló (comidas, frases,
// nombres). Acertar muestra la reacción real que él escribió.
const TRIVIA_ROUNDS = 6;
const FAKE_FOODS = ['Sushi', 'Tacos', 'Lasaña', 'Panqueques', 'Ceviche', 'Ramen', 'Empanadas', 'Waffles'];
const FAKE_NAMES = ['Luna', 'Mochi', 'Pelusa', 'Coco', 'Nube', 'Simba', 'Kiwi', 'Bruno'];
const FAKE_PHRASES = [
  'Hoy soñé con un pastel gigante',
  'Creo que necesito una siesta',
  'Me gusta mirar por la ventana',
  '¿Sabías que puedo contar hasta diez?',
];

function pickDistinct(pool, count, exclude) {
  const out = [];
  const used = new Set([exclude]);
  const shuffled = shuffleArray(pool);
  for (const item of shuffled) {
    if (out.length >= count) break;
    if (used.has(item)) continue;
    used.add(item);
    out.push(item);
  }
  return out;
}

function buildTriviaQuestions(pet) {
  const qs = [];
  const foods = (pet.food_preferences || []);
  const likes = foods.filter((f) => f.preference === 'gusta');
  const dislikes = foods.filter((f) => f.preference === 'no_gusta');
  const phrases = (pet.phrases || []).filter((p) => p.text);

  likes.forEach((f) => {
    const wrong = pickDistinct(
      [...dislikes.map((d) => d.food_name), ...FAKE_FOODS], 3, f.food_name
    );
    if (wrong.length < 3) return;
    qs.push({
      q: '¿Cuál de estas comidas me encanta?',
      correct: f.food_name, options: [f.food_name, ...wrong],
      reveal: f.reaction_message,
    });
  });

  dislikes.forEach((f) => {
    const wrong = pickDistinct([...likes.map((l) => l.food_name), ...FAKE_FOODS], 3, f.food_name);
    if (wrong.length < 3) return;
    qs.push({
      q: '¿Cuál de estas NO me gusta nada?',
      correct: f.food_name, options: [f.food_name, ...wrong],
      reveal: f.reaction_message,
    });
  });

  phrases.forEach((p) => {
    const wrong = pickDistinct(FAKE_PHRASES, 3, p.text);
    if (wrong.length < 3) return;
    qs.push({ q: '¿Cuál de estas frases te digo yo?', correct: p.text, options: [p.text, ...wrong], long: true });
  });

  if (pet.name) {
    qs.push({
      q: '¿Cómo me llamo?',
      correct: pet.name,
      options: [pet.name, ...pickDistinct(FAKE_NAMES, 3, pet.name)],
    });
  }
  if (pet.creator_name) {
    qs.push({
      q: '¿Quién te preparó este regalo?',
      correct: pet.creator_name,
      options: [pet.creator_name, ...pickDistinct(FAKE_NAMES, 3, pet.creator_name)],
    });
  }

  return shuffleArray(qs).slice(0, TRIVIA_ROUNDS).map((q) => ({ ...q, options: shuffleArray(q.options) }));
}

function TriviaGame({ pet, onBack, onComplete }) {
  const [questions] = useState(() => buildTriviaQuestions(pet));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const doneRef = useRef(false);

  const current = questions[idx];

  function choose(opt) {
    if (picked) return;
    const right = opt === current.correct;
    setPicked(opt);
    play(right ? 'good' : 'bad');
    if (right) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        if (doneRef.current) return;
        doneRef.current = true;
        onComplete(right ? score + 1 : score);
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, right && current.reveal ? 1900 : 1100);
  }

  if (questions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
        <ScreenHeader title="Trivia del corazón" onBack={onBack} />
        <div className="pg-card" style={{ padding: 20, textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
            Este juego usa las comidas y frases que configuró quien te regaló la mascota,
            y todavía no hay suficientes para armar preguntas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader
        title="Trivia del corazón" onBack={onBack}
        right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{idx + 1}/{questions.length}</span>}
      />

      <div style={{ width: '100%', maxWidth: 330 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i < idx ? C.sage : i === idx ? C.rose : C.line }} />
          ))}
        </div>

        <div className="pg-card" style={{ padding: 18, marginBottom: 14, textAlign: 'center' }}>
          <p style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: C.ink, margin: 0, lineHeight: 1.3 }}>
            {current.q}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {current.options.map((opt) => {
            const isCorrect = opt === current.correct;
            const isPicked = picked === opt;
            const show = picked != null;
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={show}
                className="pg-focus"
                style={{
                  padding: current.long ? '12px 14px' : '14px 16px',
                  borderRadius: 16, cursor: show ? 'default' : 'pointer', textAlign: 'left',
                  fontFamily: FONT.body, fontSize: current.long ? 13 : 14.5, fontWeight: 700, lineHeight: 1.35,
                  background: show && isCorrect ? C.sageSoft : show && isPicked ? '#FDECEC' : C.surface,
                  color: C.ink,
                  border: `2px solid ${show && isCorrect ? C.sage : show && isPicked ? C.rose : C.line}`,
                  boxShadow: show ? 'none' : SHADOW.soft,
                }}
              >
                {opt}
                {show && isCorrect && <span style={{ float: 'right', color: C.sage }}>✓</span>}
                {show && isPicked && !isCorrect && <span style={{ float: 'right', color: C.rose }}>✕</span>}
              </button>
            );
          })}
        </div>

        {picked === current.correct && current.reveal && (
          <div className="pg-card pg-anim-pop" style={{ marginTop: 14, padding: 14, background: C.sageSoft, borderColor: C.sage }}>
            <p style={{ fontFamily: FONT.hand, fontSize: 18, color: C.ink, margin: 0, lineHeight: 1.35, textAlign: 'center' }}>
              “{current.reveal}”
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Simón dice ─────────────────────────────────────────────────────
// La secuencia crece de a uno. Clásico, corto y con la tensión justa
// para querer intentarlo otra vez inmediatamente.
function SimonGame({ onBack, onComplete }) {
  const [sequence, setSequence] = useState([]);
  const [step, setStep] = useState(0);          // en qué parte va la jugadora
  const [active, setActive] = useState(null);   // pad iluminado ahora
  const [phase, setPhase] = useState('idle');   // idle | showing | input | over
  const doneRef = useRef(false);
  const timersRef = useRef([]);

  // Limpia los timers pendientes al desmontar: sin esto, salir a mitad
  // de una secuencia dejaba callbacks vivos tocando estado desmontado.
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  function schedule(fn, ms) {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }

  function showSequence(seq) {
    setPhase('showing');
    const speed = Math.max(280, 620 - seq.length * 22);
    seq.forEach((pad, i) => {
      schedule(() => { setActive(pad); play('pop'); }, i * speed + 350);
      schedule(() => setActive(null), i * speed + speed * 0.6 + 350);
    });
    schedule(() => { setPhase('input'); setStep(0); }, seq.length * speed + 450);
  }

  function nextRound() {
    const seq = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(seq);
    showSequence(seq);
  }

  function tapPad(id) {
    if (phase !== 'input') return;
    setActive(id);
    schedule(() => setActive(null), 160);

    if (id !== sequence[step]) {
      play('bad');
      setPhase('over');
      if (!doneRef.current) {
        doneRef.current = true;
        // El puntaje es la secuencia más larga que SÍ completó.
        schedule(() => onComplete(sequence.length - 1), 700);
      }
      return;
    }

    play('good');
    if (step + 1 === sequence.length) {
      schedule(nextRound, 620);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader
        title="Simón dice"
        subtitle={phase === 'showing' ? 'Mira bien…' : phase === 'input' ? 'Ahora repite' : 'Toca empezar'}
        onBack={onBack}
        right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{sequence.length} pasos</span>}
      />

      {/* Marcador de progreso de la secuencia: se ve cuánto llevas
          repetido sin tener que contar de memoria. */}
      {sequence.length > 0 && phase === 'input' && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 290 }}>
          {sequence.map((_, i) => (
            <span key={i} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: i < step ? C.sage : i === step ? C.rose : C.line,
              transform: i === step ? 'scale(1.3)' : 'scale(1)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 290, marginBottom: 18,
        // Mientras "Simón" muestra la secuencia los botones se ven algo
        // apagados: deja clarísimo cuándo mirar y cuándo te toca.
        opacity: phase === 'showing' ? 0.94 : 1,
      }}>
        {SIMON_PADS.map((p) => {
          const isLit = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => tapPad(p.id)}
              disabled={phase !== 'input'}
              className="pg-focus"
              aria-label={`Botón ${p.shape}`}
              style={{
                position: 'relative', aspectRatio: '1', border: 'none', background: 'none', padding: 0,
                cursor: phase === 'input' ? 'pointer' : 'default',
                transform: isLit ? 'scale(0.93)' : 'scale(1)',
                filter: isLit ? `drop-shadow(0 0 18px ${p.color})` : 'drop-shadow(0 3px 5px rgba(120,80,55,0.22))',
                transition: 'transform 0.11s, filter 0.16s',
                animation: isLit ? 'pg-pad-flash 0.4s ease' : 'none',
              }}
            >
              <SimonPad shape={p.shape} color={p.color} lit={isLit} dim={phase === 'showing' && !isLit} />
              {/* onda al encenderse */}
              {isLit && (
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 22, background: '#fff',
                  animation: 'pg-ripple 0.45s ease-out forwards', pointerEvents: 'none',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {phase === 'idle' && (
        <>
          <p style={{ fontSize: 12.5, color: C.inkSoft, textAlign: 'center', maxWidth: 280, lineHeight: 1.45, marginBottom: 12 }}>
            Se van a encender los botones de a uno. Memoriza el orden y repítelo:
            cada ronda suma uno más.
          </p>
          <button onClick={nextRound} className="pg-btn pg-btn-rose pg-focus pg-anim-hint" style={{ padding: '12px 30px', fontSize: 14 }}>
            Empezar
          </button>
        </>
      )}
    </div>
  );
}

// ── Salta y vuela ──────────────────────────────────────────────────
// Un solo toque, muerte rápida, reinicio instantáneo: el formato con
// más "una más" por minuto que existe en móvil.
//
// La física vive en flyPhysics.js (probada en flyPhysics.test.mjs);
// aquí solo queda el bucle de cuadros y el dibujo.
function FlyGame({ drawingUrl, onBack, onComplete }) {
  const [, setTick] = useState(0);            // fuerza el repintado
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const doneRef = useRef(false);

  // El mundo vive en un ref y no en estado: con estado sería un
  // re-render por cuadro y en un celular se sentiría pesado.
  const world = useRef(createFlyState());

  function flap() {
    const w = world.current;
    if (w.dead) return;
    if (!w.started) setStarted(true);
    flapState(w);
    play('pop');
  }

  useEffect(() => {
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      const w = world.current;
      const scoreBefore = w.score;
      const deadBefore = w.dead;
      stepFly(w, dt);

      if (w.score !== scoreBefore) { play('good'); setScore(w.score); }
      if (w.dead && !deadBefore) { play('bad'); setOver(true); }

      setTick((t) => (t + 1) % 100000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!over || doneRef.current) return;
    doneRef.current = true;
    const t = setTimeout(() => onComplete(score), 650);
    return () => clearTimeout(t);
  }, [over, score, onComplete]);

  const { petY, vel, pipes } = world.current;
  const FLY_W = FLY.W, FLY_H = FLY.H, FLY_PIPE_W = FLY.PIPE_W, FLY_GAP = FLY.GAP;

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader
        title="Salta y vuela" subtitle="Toca para aletear" onBack={onBack}
        right={<span style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, color: C.rose }}>{score}</span>}
      />

      <div
        onPointerDown={flap}
        className="pg-sticker"
        style={{
          position: 'relative', width: '100%', maxWidth: FLY_W, aspectRatio: `${FLY_W} / ${FLY_H}`,
          borderRadius: 22, overflow: 'hidden', touchAction: 'none', cursor: 'pointer',
          background: 'linear-gradient(180deg, #CFE8FA 0%, #EAF6FD 70%, #D8EFD4 100%)',
        }}
      >
        {/* nubes de fondo, puramente decorativas */}
        {[18, 55, 82].map((l, i) => (
          <div key={i} style={{ position: 'absolute', left: `${l}%`, top: `${12 + i * 22}%`, width: 46, height: 18, borderRadius: 999, background: 'rgba(255,255,255,0.7)' }} />
        ))}

        {pipes.map((p, i) => (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute', left: `${(p.x / FLY_W) * 100}%`, top: 0,
              width: `${(FLY_PIPE_W / FLY_W) * 100}%`, height: `${(p.gapY / FLY_H) * 100}%`,
            }}>
              <Pipe side="top" />
            </div>
            <div style={{
              position: 'absolute', left: `${(p.x / FLY_W) * 100}%`, top: `${((p.gapY + FLY_GAP) / FLY_H) * 100}%`,
              width: `${(FLY_PIPE_W / FLY_W) * 100}%`, bottom: 0,
            }}>
              <Pipe side="bottom" />
            </div>
          </React.Fragment>
        ))}

        {/* suelo con pasto, para que el fondo no sea un degradado vacío */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '7%',
          background: 'linear-gradient(180deg, #A8D89A, #86BC76)',
          borderTop: `2.5px solid ${C.ink}`,
        }} />

        {/* la mascota */}
        <div style={{
          position: 'absolute', left: `${((FLY.PET_X - 20) / FLY_W) * 100}%`,
          top: `${((petY - 20) / FLY_H) * 100}%`,
          width: `${(40 / FLY_W) * 100}%`, aspectRatio: '1',
          transform: `rotate(${Math.max(-25, Math.min(55, vel * 0.06))}deg)`,
        }}>
          {drawingUrl
            ? <img src={drawingUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: C.peach, border: `2px solid ${C.ink}` }} />}
        </div>

        {!started && !over && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
            <span style={{ fontSize: 30 }}>👆</span>
            <p style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink, background: 'rgba(255,255,255,0.85)', padding: '6px 14px', borderRadius: 999 }}>
              Toca para volar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Conecta 3 golosinas ────────────────────────────────────────────
// Las fichas son SUS comidas, no dulces genéricos. La lógica del
// tablero vive en match3.js (probada en match3.test.mjs).
function Match3Game({ pet, onBack, onComplete }) {
  // Hasta 5 tipos: con más, es rarísimo alinear tres y frustra.
  const tiles = useState(() => {
    const withImg = (pet.food_preferences || []).filter((f) => f.image).slice(0, 5);
    if (withImg.length >= 3) return withImg.map((f) => ({ image: f.image, label: f.food_name }));
    const names = (pet.food_preferences || []).map((f) => f.food_name);
    return Array.from({ length: 5 }, (_, i) => ({ label: names[i] || `Golosina ${i + 1}` }));
  })[0];

  const types = tiles.length;
  const [grid, setGrid] = useState(() => createBoard(types));
  const [sel, setSel] = useState(null);
  const [moves, setMoves] = useState(MOVES_PER_GAME);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(null);      // aviso de combo
  const [clearing, setClearing] = useState(null); // posiciones estallando
  const [dropping, setDropping] = useState(false);
  const [badSwap, setBadSwap] = useState(null);   // par que se sacude
  const [hint, setHint] = useState(null);         // jugada sugerida
  const [tutorial, setTutorial] = useState(true);
  const busy = clearing !== null;
  const doneRef = useRef(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  // Si se queda mirando sin jugar, se le señala una jugada posible. Sin
  // esto el juego se sentía un tablero de dibujitos sin instrucciones.
  useEffect(() => {
    if (busy || moves <= 0) return;
    const t = setTimeout(() => setHint(findHint(grid)), 4500);
    return () => clearTimeout(t);
  }, [grid, busy, moves, sel]);

  function tap(i) {
    if (moves <= 0 || busy) return;
    setHint(null);
    setTutorial(false);

    if (sel == null) { setSel(i); play('pop'); return; }
    if (sel === i) { setSel(null); return; }

    const a = sel;
    setSel(null);

    if (!areAdjacent(a, i)) {
      // No son vecinas: se sacuden las dos para explicar la regla sin texto.
      play('bad');
      setBadSwap([a, i]);
      later(() => setBadSwap(null), 450);
      return;
    }

    const { swapped, matched } = previewSwap(grid, a, i);

    if (matched.size === 0) {
      play('bad');
      setBadSwap([a, i]);
      later(() => setBadSwap(null), 450);
      return;
    }

    // 1) se ve el cambio y las fichas que hacen línea estallando…
    play('good');
    setGrid(swapped);
    setClearing(matched);

    // 2) …y recién después caen las nuevas. Antes el tablero cambiaba
    //    de golpe y era imposible entender qué había pasado.
    later(() => {
      const res = resolveBoard(swapped, types);
      let board = res.board;
      // Si quedó sin jugadas posibles se rebaraja solo: si no, la
      // partida se traba sin que sea culpa de quien juega.
      if (!hasAnyMove(board)) board = createBoard(types);

      setGrid(board);
      setClearing(null);
      setDropping(true);
      later(() => setDropping(false), 320);

      setScore((s) => s + res.cleared);
      setMoves((m) => m - 1);
      if (res.cascades > 1) {
        play('win');
        setFlash({ cascades: res.cascades });
        later(() => setFlash(null), 1100);
      }
    }, 340);
  }

  useEffect(() => {
    if (moves > 0 || doneRef.current) return;
    doneRef.current = true;
    setTimeout(() => onComplete(score), 700);
  }, [moves, score, onComplete]);

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader
        title="Conecta 3 golosinas" onBack={onBack}
        right={
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.rose }}>
            {moves} <span style={{ fontSize: 10.5, color: C.inkSoft, fontWeight: 700 }}>jugadas</span>
          </span>
        }
      />

      {/* Explicación corta y siempre visible la primera vez. */}
      {tutorial && (
        <div className="pg-card" style={{ width: '100%', maxWidth: 312, padding: '10px 13px', marginBottom: 10, background: C.amberSoft, borderColor: C.amber }}>
          <p style={{ fontSize: 12.5, color: C.ink, margin: 0, lineHeight: 1.45 }}>
            Cambia dos golosinas <b>vecinas</b> de lugar para juntar <b>3 iguales en línea</b>.
            Se comen solas y caen más desde arriba.
          </p>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', maxWidth: 312 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 5 }}>
          {grid.map((t, i) => {
            const tile = tiles[t] || tiles[0];
            const on = sel === i;
            const isClearing = clearing?.has(i);
            const isBad = badSwap?.includes(i);
            const isHint = hint?.includes(i);
            return (
              <button
                key={i}
                onClick={() => tap(i)}
                className={`pg-focus${isClearing ? ' pg-anim-clear' : ''}${isBad ? ' pg-anim-shake' : ''}${dropping ? ' pg-anim-drop' : ''}`}
                aria-label={tile.label}
                style={{
                  position: 'relative', aspectRatio: '1', borderRadius: 14, cursor: 'pointer', padding: 2,
                  background: on ? tint(C.rose, 0.75) : C.surface,
                  border: `2.5px solid ${on ? C.rose : isHint ? C.amber : C.line}`,
                  boxShadow: on ? SHADOW.glowRose : SHADOW.soft,
                  transform: on ? 'scale(0.92)' : 'scale(1)',
                  transition: 'transform 0.12s, border-color 0.12s, background 0.12s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible',
                  animationDelay: dropping ? `${(i % SIZE) * 22}ms` : undefined,
                  '--pg-drop': '46px',
                }}
              >
                {tile.image ? (
                  <img src={tile.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: `2px solid ${C.ink}`, pointerEvents: 'none' }} />
                ) : (
                  <Candy type={t} label={tile.label} />
                )}
                {/* aro que late sobre la jugada sugerida */}
                {isHint && (
                  <span className="pg-anim-hint" style={{ position: 'absolute', inset: -2, borderRadius: 16, pointerEvents: 'none' }} />
                )}
              </button>
            );
          })}
        </div>

        {flash && (
          <div className="pg-anim-combo" style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 5,
          }}>
            <span style={{
              fontFamily: FONT.display, fontSize: 26, fontWeight: 800, color: '#fff',
              background: `linear-gradient(135deg, ${C.rose}, ${C.amber})`,
              borderRadius: 999, padding: '10px 24px',
              boxShadow: `${SHADOW.lifted}, 0 0 0 4px rgba(255,255,255,0.6)`,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              ¡Combo x{flash.cascades}!
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14 }}>
        <IconCookie size={17} color={C.peach} />
        <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: C.ink }}>{score}</span>
        <span style={{ fontSize: 12, color: C.inkSoft }}>golosinas</span>
      </div>
    </div>
  );
}

// ── Bandejas de decoración ────────────────────────────────────────
// El cuarto ya es la pantalla principal, así que esto no es una
// pantalla aparte: es el panel que aparece debajo al tocar "Decorar",
// para meter y sacar cosas sin salir de la escena.
function DecorTrays({ posters, customDecor, game, setGame, cameraRef, onGoShop }) {
  const [tray, setTray] = useState('posters');

  const placedRefIds = (game.placed || []).map((p) => `${p.kind}:${p.refId}`);
  const isPlaced = (kind, refId) => placedRefIds.includes(`${kind}:${refId}`);

  function addToRoom(kind, refId) {
    play('place');
    setGame((g) => ({
      ...g,
      placed: [...(g.placed || []), {
        key: newPlacementKey(kind),
        ...defaultPlacement(kind, refId, posters, customDecor, {
          centerX: cameraRef ? cameraRef.current : ROOM.W / 2,
          placed: g.placed || [],
          // El color se eligió al comprarlo, no al colocarlo.
          paint: kind === 'mueble' ? (g.furniturePaint?.[refId] || 'natural') : 'natural',
        }),
      }],
    }));
  }
  function removeFromRoom(kind, refId) {
    play('pop');
    setGame((g) => ({ ...g, placed: (g.placed || []).filter((p) => !(p.kind === kind && String(p.refId) === String(refId))) }));
  }
  const toggle = (kind, refId) => (isPlaced(kind, refId) ? removeFromRoom(kind, refId) : addToRoom(kind, refId));

  const ownedFurniture = (game.ownedFurniture || []).map(findFurniture).filter(Boolean);
  const ownedDecorItems = (game.ownedDecor || []);

  return (
    <div className="pg-card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft }}>
          Toca para poner o quitar · arrastra en el cuarto para acomodar
        </span>
        {onGoShop && (
          <button onClick={onGoShop} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.lavender, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <IconBag size={13} color={C.lavender} /> Tienda
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <ShopTab active={tray === 'posters'} onClick={() => { play('pop'); setTray('posters'); }}>Pósters</ShopTab>
        <ShopTab active={tray === 'muebles'} onClick={() => { play('pop'); setTray('muebles'); }}>Muebles</ShopTab>
        <ShopTab active={tray === 'decor'} onClick={() => { play('pop'); setTray('decor'); }}>Decoración</ShopTab>
      </div>

      {tray === 'posters' && (
        <TrayGrid empty="Compra pósters en la tienda para colgarlos">
          {/* Sólo los ya comprados (o gratis, price 0/undefined) se pueden
              colocar — igual que muebles y decoración. */}
          {posters.filter((p) => !p.price || (game.ownedPosters || []).includes(p.id)).map((p) => (
            <TrayItem key={p.id} label="" active={isPlaced('poster', p.id)} onClick={() => toggle('poster', p.id)}>
              {renderPosterContent(p)}
            </TrayItem>
          ))}
        </TrayGrid>
      )}

      {tray === 'muebles' && (
        <TrayGrid empty="Compra muebles en la tienda para amoblar el cuarto">
          {ownedFurniture.map((f) => (
            <TrayItem key={f.id} label={f.name} active={isPlaced('mueble', f.id)} onClick={() => toggle('mueble', f.id)}>
              <div style={{ width: '100%', height: '100%', padding: 4 }}>{f.render(findPaint(game.furniturePaint?.[f.id] || 'natural'))}</div>
            </TrayItem>
          ))}
        </TrayGrid>
      )}

      {tray === 'decor' && (
        <TrayGrid empty="Compra decoración en la tienda">
          {ownedDecorItems.map((id) => {
            const custom = (customDecor || []).find((d) => String(d.id) === String(id));
            const gen = findDecor(id);
            if (!custom && !gen) return null;
            return (
              <TrayItem key={id} label={custom ? custom.name : gen.name} active={isPlaced('decor', id)} onClick={() => toggle('decor', id)}>
                {custom
                  ? <img src={custom.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <div style={{ width: '100%', height: '100%', padding: 4 }}>{gen.render()}</div>}
              </TrayItem>
            );
          })}
        </TrayGrid>
      )}
    </div>
  );
}


function TrayGrid({ children, empty }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) {
    return (
      <div className="pg-card" style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>{empty}</p>
      </div>
    );
  }
  return <div className="flex gap-2.5 flex-wrap">{items}</div>;
}

function TrayItem({ children, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative pg-focus"
      title={label}
      style={{
        width: 64, height: 64, borderRadius: 14, cursor: 'pointer', overflow: 'hidden',
        background: C.surface, border: active ? `3px solid ${C.sage}` : `1.5px solid ${C.line}`,
        boxShadow: active ? SHADOW.soft : 'none', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
      {active && (
        <span style={{ position: 'absolute', top: 2, right: 2, background: C.sage, color: '#fff', borderRadius: '50%', width: 17, height: 17, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
      )}
    </button>
  );
}

// ── Tienda ─────────────────────────────────────────────────────────
function ShopTab({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="pg-focus" style={{ flex: 1, padding: '9px 4px', borderRadius: 14, fontFamily: FONT.display, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: active ? C.rose : C.surface, color: active ? '#fff' : C.ink, border: `1.5px solid ${active ? C.rose : C.line}` }}>
      {children}
    </button>
  );
}

function ShopItemCard({ image, name, note, price, owned, equipped, onAction, actionLabel, canAfford }) {
  return (
    <div className="pg-card" style={{ padding: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {image}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700 }}>{name}</div>
        {note && <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.25, marginTop: 1 }}>{note}</div>}
        <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
          {!owned && <IconCoin size={13} color={C.amber} />} {owned ? (equipped ? 'En uso' : 'En tu colección') : `${price} monedas`}
        </div>
      </div>
      <button
        onClick={onAction}
        disabled={!owned && !canAfford}
        className="pg-focus"
        style={{
          padding: '8px 14px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700, cursor: !owned && !canAfford ? 'default' : 'pointer',
          background: equipped ? C.sage : owned ? C.surfaceAlt : (!canAfford ? C.line : C.rose),
          color: equipped ? '#fff' : owned ? C.ink : '#fff',
          border: `1.5px solid ${equipped ? C.sage : owned ? C.line : C.rose}`,
          opacity: !owned && !canAfford ? 0.6 : 1, whiteSpace: 'nowrap',
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// Tarjeta de mueble en la tienda: además de comprar, deja elegir el
// color ANTES de pagar — los muebles ya derivan sus tonos claro/oscuro
// de un color base (`lit`/`dim` en roomCatalog.jsx), así que reusar
// FURNITURE_PAINTS aquí es sólo exponer un selector, no rediseñar nada.
// Una vez comprado el color queda fijo (se guarda en game.furniturePaint).
function FurnitureShopCard({ item, owned, ownedPaint, canAfford, onBuy }) {
  const [choice, setChoice] = useState('natural');
  const activePaint = owned ? (ownedPaint || 'natural') : choice;

  return (
    <div className="pg-card" style={{ padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: 40, height: 40 }}>{item.render(findPaint(activePaint))}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700 }}>{item.name}</div>
          {item.place === 'pared' && <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.25, marginTop: 1 }}>Va colgado en la pared</div>}
          <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
            {!owned && <IconCoin size={13} color={C.amber} />} {owned ? 'Comprado' : `${item.price} monedas`}
          </div>
        </div>
        <button
          onClick={() => onBuy(choice)}
          disabled={owned || !canAfford}
          className="pg-focus"
          style={{
            padding: '8px 14px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700, cursor: owned || !canAfford ? 'default' : 'pointer',
            background: owned ? C.surfaceAlt : (!canAfford ? C.line : C.rose),
            color: owned ? C.ink : '#fff',
            border: `1.5px solid ${owned ? C.line : C.rose}`,
            opacity: !owned && !canAfford ? 0.6 : 1, whiteSpace: 'nowrap',
          }}
        >
          {owned ? 'Comprado' : 'Comprar'}
        </button>
      </div>

      {!owned && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {FURNITURE_PAINTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setChoice(p.id)}
              className="pg-focus"
              aria-label={`Color ${p.id}`}
              title={p.id}
              style={{
                width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', padding: 0,
                background: `linear-gradient(135deg, ${p.wood} 50%, ${p.cloth} 50%)`,
                border: choice === p.id ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
                boxShadow: choice === p.id ? SHADOW.soft : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Re-personalización (#41) ────────────────────────────────────────
// Aviso antes de gastar las monedas: el diseño original nunca se pierde
// (queda como póster de recuerdo la primera vez), pero hay que dejarlo
// clarísimo ANTES de que la persona pague, no después.
function RedesignConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="pg-anim-rise"
      style={{
        position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(74,52,57,0.55)', padding: 20,
      }}
    >
      <div className="pg-card" style={{ maxWidth: 340, padding: 22, textAlign: 'center' }}>
        <div style={{ marginBottom: 10 }}><IconSparkle size={30} color={C.lavender} /></div>
        <p style={{ fontFamily: FONT.hand, fontSize: 21, color: C.ink, lineHeight: 1.35, marginBottom: 16 }}>
          La mascota actual fue diseñada por tu pareja, no te olvides de ella.
          Siempre podrás volver al diseño que tu pareja te hizo con tanto cariño.
        </p>
        <p style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 18 }}>
          Rediseñarla cuesta <b>{REDESIGN_COST} monedas</b>. Vas a poder cambiar entre los dos diseños cuando quieras.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Cancelar</button>
          <button onClick={onConfirm} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Rediseñar</button>
        </div>
      </div>
    </div>
  );
}

// Pantalla completa del editor, montada sólo mientras se rediseña.
// Reusa exactamente el mismo motor que el asistente de creación
// (PetDesigner.jsx), precargado con la receta que se le pasa.
function RedesignScreen({ initialRecipe, onCancel, onSave, saving }) {
  const designer = useDesignerState(initialRecipe);
  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px 24px' }}>
      <ModularPetStep {...designer} title="Rediséñala a tu gusto" subtitle="Parte de lo que ya tenía — cambia lo que quieras" />
      <div className="flex gap-3" style={{ width: '100%', maxWidth: 430, marginTop: 8 }}>
        <button onClick={onCancel} disabled={saving} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Cancelar</button>
        <button
          onClick={async () => onSave(designer.recipe, await designer.buildPngs())}
          disabled={saving}
          className="pg-btn pg-btn-rose pg-focus"
          style={{ flex: 1, padding: 12, fontSize: 13.5, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando...' : '+ Guardar nuevo diseño'}
        </button>
      </div>
    </div>
  );
}

// Miniatura de una pared o un piso, para verlos antes de comprarlos.
function SurfaceSwatch({ style, kind }) {
  const w = kind === 'pared' ? 120 : 120, h = 120;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={style.base} />
      {style.render && style.render(w, h)}
    </svg>
  );
}

function ShopScreen({ coins, game, setGame, outfits, customDecor, posters, onBack, hasRedesign, onStartRedesign }) {
  const [tab, setTab] = useState('muebles');
  const [confirmingRedesign, setConfirmingRedesign] = useState(false);

  const buy = (cost, apply) => {
    if (coins < cost) { play('bad'); return; }
    play('buy');
    setGame((g) => apply({ ...g, coins: g.coins - cost }));
  };

  function buyFurniture(item, paintId) {
    if ((game.ownedFurniture || []).includes(item.id)) return;
    buy(item.price, (g) => ({
      ...g,
      ownedFurniture: [...(g.ownedFurniture || []), item.id],
      // El color se elige ANTES de comprar, no después: una vez pagado
      // queda fijo para ese mueble (igual que elegir la tela de un sofá
      // real antes de que lo entreguen).
      furniturePaint: { ...(g.furniturePaint || {}), [item.id]: paintId || 'natural' },
    }));
  }
  function buyDecor(id, price) {
    if ((game.ownedDecor || []).includes(id)) return;
    buy(price, (g) => ({ ...g, ownedDecor: [...(g.ownedDecor || []), id] }));
  }
  function buyPoster(p) {
    if ((game.ownedPosters || []).includes(p.id)) return;
    buy(p.price || 0, (g) => ({ ...g, ownedPosters: [...(g.ownedPosters || []), p.id] }));
  }
  function buyWall(w) {
    if ((game.ownedWalls || []).includes(w.id)) { setGame((g) => ({ ...g, wall: w.id })); return; }
    buy(w.price, (g) => ({ ...g, ownedWalls: [...(g.ownedWalls || []), w.id], wall: w.id }));
  }
  function buyFloor(f) {
    if ((game.ownedFloors || []).includes(f.id)) { setGame((g) => ({ ...g, floor: f.id })); return; }
    buy(f.price, (g) => ({ ...g, ownedFloors: [...(g.ownedFloors || []), f.id], floor: f.id }));
  }
  function buyOutfit(outfit) {
    if (game.ownedOutfits.includes(outfit.id)) return;
    buy(outfit.price, (g) => ({ ...g, ownedOutfits: [...g.ownedOutfits, outfit.id] }));
  }
  function toggleEquipOutfit(id) {
    setGame((g) => ({ ...g, equippedOutfit: g.equippedOutfit === id ? null : id }));
  }

  const TABS = [
    ['posters', 'Pósters'], ['muebles', 'Muebles'], ['decor', 'Deco'], ['pared', 'Pared'], ['piso', 'Piso'], ['ropa', 'Ropa'], ['rediseño', 'Rediseño'],
  ];

  function confirmRedesign() {
    if (coins < REDESIGN_COST) { play('bad'); return; }
    play('buy');
    setGame((g) => ({ ...g, coins: g.coins - REDESIGN_COST }));
    setConfirmingRedesign(false);
    onStartRedesign();
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader
        title="Tienda"
        subtitle="Gana monedas jugando y bañándola"
        onBack={onBack}
        right={
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.amberSoft, border: `1.5px solid ${C.amber}`, borderRadius: 999, padding: '4px 10px' }}>
            <IconCoin size={14} color={C.amber} />
            <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink }}>{coins}</span>
          </span>
        }
      />

      <div className="flex gap-1.5 mb-4" style={{ width: '100%', maxWidth: 340 }}>
        {TABS.map(([id, label]) => (
          <ShopTab key={id} active={tab === id} onClick={() => setTab(id)}>{label}</ShopTab>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 340 }}>
        {tab === 'posters' && (
          (posters || []).filter((p) => p.type === 'photo').length === 0 ? (
            <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
              <IconFrame size={28} color={C.lavender} />
              <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 0' }}>Quien te regaló esta mascota no subió fotos para pósters todavía</p>
            </div>
          ) : (posters || []).filter((p) => p.type === 'photo').map((p) => {
            const owned = !p.price || (game.ownedPosters || []).includes(p.id);
            return (
              <ShopItemCard
                key={p.id}
                image={<img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                name="Póster" price={p.price || 0} owned={owned}
                canAfford={coins >= (p.price || 0)}
                actionLabel={owned ? 'En tu colección' : 'Comprar'}
                onAction={() => buyPoster(p)}
              />
            );
          })
        )}

        {tab === 'muebles' && FURNITURE.map((item) => {
          const owned = (game.ownedFurniture || []).includes(item.id);
          const ownedPaint = game.furniturePaint?.[item.id];
          return (
            <FurnitureShopCard
              key={item.id}
              item={item}
              owned={owned}
              ownedPaint={ownedPaint}
              canAfford={coins >= item.price}
              onBuy={(paintId) => buyFurniture(item, paintId)}
            />
          );
        })}

        {tab === 'decor' && (
          <>
            {(customDecor || []).length > 0 && (
              <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '0 0 8px' }}>
                Cosas que eligió quien te regaló esto
              </p>
            )}
            {(customDecor || []).map((d) => {
              const owned = (game.ownedDecor || []).includes(d.id);
              return (
                <ShopItemCard
                  key={d.id}
                  image={<img src={d.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                  name={d.name} note={d.description} price={d.price} owned={owned}
                  canAfford={coins >= d.price}
                  actionLabel={owned ? 'Comprado' : 'Comprar'}
                  onAction={() => buyDecor(d.id, d.price)}
                />
              );
            })}
            <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '14px 0 8px' }}>
              Del catálogo
            </p>
            {DECOR_CATALOG.map((item) => {
              const owned = (game.ownedDecor || []).includes(item.id);
              return (
                <ShopItemCard
                  key={item.id}
                  image={<div style={{ width: 34, height: 34 }}>{item.render()}</div>}
                  name={item.name} price={item.price} owned={owned}
                  canAfford={coins >= item.price}
                  actionLabel={owned ? 'Comprado' : 'Comprar'}
                  onAction={() => buyDecor(item.id, item.price)}
                />
              );
            })}
          </>
        )}

        {tab === 'pared' && WALL_STYLES.map((w) => {
          const owned = (game.ownedWalls || []).includes(w.id);
          const active = game.wall === w.id;
          return (
            <ShopItemCard
              key={w.id}
              image={<SurfaceSwatch style={w} kind="pared" />}
              name={w.name} price={w.price} owned={owned} equipped={active}
              canAfford={coins >= w.price}
              actionLabel={active ? 'Puesta' : owned ? 'Pintar' : 'Comprar'}
              onAction={() => buyWall(w)}
            />
          );
        })}

        {tab === 'piso' && FLOOR_STYLES.map((f) => {
          const owned = (game.ownedFloors || []).includes(f.id);
          const active = game.floor === f.id;
          return (
            <ShopItemCard
              key={f.id}
              image={<SurfaceSwatch style={f} kind="piso" />}
              name={f.name} price={f.price} owned={owned} equipped={active}
              canAfford={coins >= f.price}
              actionLabel={active ? 'Puesto' : owned ? 'Poner' : 'Comprar'}
              onAction={() => buyFloor(f)}
            />
          );
        })}

        {tab === 'ropa' && (
          outfits.length === 0 ? (
            <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
              <IconShirt size={28} color={C.rose} />
              <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 0' }}>Quien te regaló esta mascota no diseñó ropa todavía</p>
            </div>
          ) : outfits.map((o) => {
            const owned = game.ownedOutfits.includes(o.id);
            const equipped = game.equippedOutfit === o.id;
            return (
              <ShopItemCard
                key={o.id}
                image={<img src={o.drawing_normal} alt={o.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                name={o.name} price={o.price} owned={owned} equipped={equipped}
                canAfford={coins >= o.price}
                actionLabel={owned ? (equipped ? 'Quitar' : 'Poner') : 'Comprar'}
                onAction={() => (owned ? toggleEquipOutfit(o.id) : buyOutfit(o))}
              />
            );
          })
        )}

        {tab === 'rediseño' && (
          <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
            <IconSparkle size={28} color={C.lavender} />
            <p style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, margin: '10px 0 6px' }}>
              {hasRedesign ? 'Rediseñar de nuevo' : 'Rediseña a tu mascota'}
            </p>
            <p style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.45, marginBottom: 14 }}>
              Abre el mismo creador que usó quien te regaló esto, partiendo de cómo se ve hoy. El diseño original
              nunca se pierde — vas a poder alternar entre los dos cuando quieras.
            </p>
            <button
              onClick={() => setConfirmingRedesign(true)}
              disabled={coins < REDESIGN_COST}
              className="pg-btn pg-btn-rose pg-focus"
              style={{ padding: '10px 20px', fontSize: 13, opacity: coins < REDESIGN_COST ? 0.6 : 1 }}
            >
              Rediseñar · {REDESIGN_COST} monedas
            </button>
          </div>
        )}
      </div>

      {confirmingRedesign && (
        <RedesignConfirmModal onConfirm={confirmRedesign} onCancel={() => setConfirmingRedesign(false)} />
      )}
    </div>
  );
}


// ── Rompecabezas ──────────────────────────────────────────────────
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
  const ar = Math.floor(a / size), ac = a % size, br = Math.floor(b / size), bc = b % size;
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
}

function PuzzleTile({ tileIndex, photoUrl, onClick }) {
  const total = PUZZLE_SIZE * PUZZLE_SIZE;
  if (tileIndex === total - 1) {
    return <div style={{ width: PUZZLE_TILE_PX, height: PUZZLE_TILE_PX, background: C.paperDeep }} />;
  }
  const row = Math.floor(tileIndex / PUZZLE_SIZE);
  const col = tileIndex % PUZZLE_SIZE;
  return (
    <button
      onClick={onClick}
      style={{
        width: PUZZLE_TILE_PX, height: PUZZLE_TILE_PX, padding: 0, border: `0.5px solid rgba(255,255,255,0.4)`,
        backgroundImage: `url(${photoUrl})`, backgroundSize: `${PUZZLE_PX}px ${PUZZLE_PX}px`,
        backgroundPosition: `-${col * PUZZLE_TILE_PX}px -${row * PUZZLE_TILE_PX}px`, cursor: 'pointer',
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
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    if (next.every((v, i) => v === i)) {
      setWon(true);
      play('win');
      setTimeout(() => onComplete(nextMoves), 700);
    }
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ padding: '0 14px' }}>
      <ScreenHeader title="Rompecabezas" subtitle="Toca una pieza junto al hueco" onBack={onBack} right={<span style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{moves} mov.</span>} />
      <div className="grid rounded-2xl overflow-hidden mb-4" style={{ gridTemplateColumns: `repeat(${PUZZLE_SIZE}, ${PUZZLE_TILE_PX}px)`, width: PUZZLE_PX, boxShadow: `0 0 0 4px ${C.surface}, 0 0 0 6px ${C.line}, ${SHADOW.lifted}` }}>
        {tiles.map((tileIndex, pos) => (
          <PuzzleTile key={pos} tileIndex={tileIndex} photoUrl={url} onClick={() => tapTile(pos)} />
        ))}
      </div>
    </div>
  );
}

// ── Cinemática ────────────────────────────────────────────────────
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
      setTimeout(() => { setIndex((i) => i + 1); setFading(false); }, 400);
    }, 2800);
    return () => clearTimeout(timer);
  }, [index, isDone]);

  const photo = usePhotos ? photos[index % photos.length] : null;
  const caption = positivePhrases.length > 0
    ? positivePhrases[index % positivePhrases.length].text
    : (usePhotos ? null : 'Gracias por todos estos momentos juntos');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 30%, #3A2A38, #1a1520)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* estrellitas de fondo */}
      {[12, 30, 68, 84, 22, 76].map((l, i) => (
        <span key={i} style={{ position: 'absolute', left: `${l}%`, top: `${12 + (i * 13) % 70}%`, animation: `pg-shimmer ${2 + i * 0.4}s ease-in-out infinite` }}>
          <IconSparkle size={12 + (i % 3) * 4} color="#FFE9A8" fill="#FFE9A8" />
        </span>
      ))}
      {!isDone && (
        <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.4s', textAlign: 'center', maxWidth: 320, zIndex: 1 }}>
          {photo && <img src={photo.url} alt="" style={{ maxWidth: '100%', maxHeight: '55vh', borderRadius: 16, marginBottom: 16, objectFit: 'contain', boxShadow: '0 0 0 6px rgba(255,255,255,0.9), 0 20px 40px rgba(0,0,0,0.4)' }} />}
          {caption && <p style={{ fontFamily: FONT.hand, color: '#fff', fontSize: 24, lineHeight: 1.3 }}>{caption}</p>}
        </div>
      )}
      {isDone && (
        <div style={{ textAlign: 'center', zIndex: 1 }} className="pg-anim-pop">
          <IconHeart size={56} color={C.rose} fill={C.rose} />
          <p style={{ fontFamily: FONT.hand, color: '#fff', fontSize: 26, margin: '12px 0 24px' }}>Gracias por acordarte de mí</p>
          <button onClick={onFinish} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '12px 30px', fontSize: 15 }}>Volver</button>
        </div>
      )}
      {!isDone && (
        <button onClick={onFinish} style={{ position: 'absolute', top: 16, right: 16, color: '#fff', opacity: 0.6, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Saltar ✕</button>
      )}
    </div>
  );
}

// ── Pantalla de apertura: "toca para abrir tu regalo" ──────────────
//
// Por qué existe: ningún navegador deja que el audio suene solo al
// cargar la página, sea un iframe de YouTube/Spotify o un <audio>
// nativo con un MP3 propio — Chrome y Safari exigen un gesto real de
// la persona antes de permitir sonido. En vez de pelear contra eso,
// se convierte el gesto obligatorio en parte del regalo: la persona
// toca para "abrirlo", y en ESE mismo toque arranca la música.
function OpeningScreen({ petName, creatorName, onOpen }) {
  return (
    <div
      className="pg-anim-rise"
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24,
        background: `linear-gradient(160deg, ${C.roseSoft}, ${C.lavenderSoft || C.surface})`,
        textAlign: 'center',
      }}
    >
      <div style={{ animation: 'pg-breathe 2.2s ease-in-out infinite' }}>
        <IconEnvelope size={54} color={C.roseDeep} />
      </div>
      <div>
        <p style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.inkSoft, margin: 0 }}>
          {creatorName ? `${creatorName} te preparó algo` : 'Alguien te preparó algo'}
        </p>
        <h1 style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 800, color: C.ink, margin: '4px 0 0' }}>{petName}</h1>
      </div>
      <button
        onClick={onOpen}
        className="pg-focus pg-anim-pop"
        style={{
          fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: '#fff',
          background: C.rose, border: 'none', borderRadius: 999, padding: '14px 30px',
          cursor: 'pointer', boxShadow: SHADOW.soft,
        }}
      >
        Toca para abrir tu regalo 💌
      </button>
    </div>
  );
}

// Botón redondo de la barra de arriba.
function RoundBtn({ children, onClick, label, active, activeColor }) {
  return (
    <button
      onClick={onClick} className="pg-focus" aria-label={label} title={label}
      style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        background: active ? (activeColor || C.rose) : C.surface,
        border: `1.5px solid ${active ? (activeColor || C.rose) : C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.soft,
      }}
    >
      {children}
    </button>
  );
}

// Medidor compacto para superponer sobre la escena. La versión de
// tarjeta ocupaba un bloque entero de alto que empujaba el dock fuera
// de la pantalla.
function MiniMeter({ kind, value }) {
  const isHunger = kind === 'hunger';
  const color = isHunger ? C.peach : C.rose;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: 'rgba(255,253,248,0.82)', borderRadius: 999,
      padding: '3px 8px 3px 5px', border: `1px solid ${C.line}`, boxShadow: SHADOW.soft,
    }}>
      {isHunger ? <IconBowl size={11} color={color} /> : <IconHeart size={11} color={color} />}
      <div style={{ width: 46, height: 5, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
export default function PetGiftGame({ slug: slugProp }) {
  const resolvedSlug = slugProp || getSlugFromUrl();
  const [pet, setPet] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [hunger, setHunger] = useState(60);
  const [love, setLove] = useState(60);
  const [mood, setMood] = useState('normal');
  const [bubble, setBubble] = useState({ text: '¡Hola! Qué bueno verte', tone: 'casual' });
  // Dos relojes separados: hambre y amor bajan a ritmos distintos, y
  // con un solo timestamp compartido el mas rapido se contaria dos veces
  // (se le descontaria tiempo que ya habia gastado).
  const [lastHungerAt, setLastHungerAt] = useState(Date.now());
  const [lastLoveAt, setLastLoveAt] = useState(Date.now());
  const touchClocks = () => { const n = Date.now(); setLastHungerAt(n); setLastLoveAt(n); };
  const [tick, setTick] = useState(0);
  const [screen, setScreen] = useState('main');
  const [opened, setOpened] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [musicVolume, setMusicVolume] = useState(70); // 0..100
  const musicBarRef = useRef(null);
  const [decorating, setDecorating] = useState(false);
  const [foodOpen, setFoodOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  // Dónde está mirando la cámara del cuarto, para soltar ahí lo nuevo.
  const cameraRef = useRef(ROOM.W / 2);
  const [reaction, setReaction] = useState({ key: 0, type: 'love' });
  const [flyingFood, setFlyingFood] = useState(null);

  const bathAreaRef = useRef(null);
  const draggingSpongeRef = useRef(false);
  const [bathProgress, setBathProgress] = useState(0);
  const lastScrubAt = useRef(0);
  const [bathDone, setBathDone] = useState(false);
  const [spongePos, setSpongePos] = useState({ x: 150, y: 320 });
  const [bubbles, setBubbles] = useState([]);

  // Monedas, prendas compradas/puesta y decoración colocada — todo esto es
  // del dispositivo de quien juega, no del backend (igual que hambre/amor
  // ya se llevan localmente entre visitas).
  const [game, setGame] = useState(() => loadGameState(resolvedSlug));
  const [coinToast, setCoinToast] = useState(null);
  useEffect(() => { saveGameState(resolvedSlug, game); }, [game, resolvedSlug]);

  // Resultado del minijuego que acaba de terminar (null = ninguno). Al
  // cambiar `replayKey` se remonta el juego para empezar de cero sin
  // salir de la pantalla.
  const [gameResult, setGameResult] = useState(null);
  const [replayKey, setReplayKey] = useState(0);

  function awardCoins(amount, reason) {
    play('coin');
    if (amount <= 0) return;
    setGame((g) => ({ ...g, coins: g.coins + amount }));
    setCoinToast({ key: Date.now(), amount, reason });
    setTimeout(() => setCoinToast(null), 2200);
  }

  const cinematicAvailable = hunger <= 0 && love <= 0;

  useEffect(() => {
    async function load() {
      const slug = resolvedSlug;
      const { pet: data, mode } = await loadPet(slug);
      if (data) {
        setPet(data);
        setHunger(data.hunger_meter ?? 60);
        setLove(data.love_meter ?? 60);
        setMood(data.current_mood ?? 'normal');
        setLoadState(mode); // 'live' | 'local'
        document.title = data.name;
        let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (!appleTitle) {
          appleTitle = document.createElement('meta');
          appleTitle.name = 'apple-mobile-web-app-title';
          document.head.appendChild(appleTitle);
        }
        appleTitle.content = data.name;
      } else {
        setPet(DEMO_PET);
        setHunger(DEMO_PET.hunger_meter);
        setLove(DEMO_PET.love_meter);
        setMood(DEMO_PET.current_mood);
        setLoadState('demo');
      }
      touchClocks();
    }
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  // El navegador bloquea el audio hasta que la persona toca la pantalla.
  // Esto lo desbloquea en el primer gesto, sea cual sea.
  useEffect(() => installUnlock(), []);

  // El toque en la pantalla de apertura ("Toca para abrir tu regalo") es
  // el gesto que desbloquea la música: se llama musicBarRef.start()
  // DIRECTO dentro de ese click, que es el único momento en que el
  // navegador acepta sonido sin que la persona tenga que buscar un botón
  // de play por su cuenta.
  function handleOpenGift() {
    play('pop');
    setOpened(true);
    if (musicBarRef.current) musicBarRef.current.start();
  }

  // Aplica el volumen guardado apenas el motor de música está listo
  // (audio propio o player de YouTube), y cada vez que se mueve la barra.
  useEffect(() => {
    if (musicBarRef.current) musicBarRef.current.setVolume(musicVolume / 100);
  }, [musicVolume, pet]);

  // ── Re-personalización (#41) ─────────────────────────────────────
  const [redesignSaving, setRedesignSaving] = useState(false);

  async function handleSaveRedesign(recipe, pngs) {
    setRedesignSaving(true);
    const updated = await redesignPetRemote(resolvedSlug, { recipe, ...pngs });
    if (updated) {
      setPet(updated);
    } else {
      // Sin backend (modo local/demo): se aplica igual en memoria para
      // que la re-personalización se pueda probar, aunque no sobreviva
      // a recargar la página — igual que el resto de fallbacks locales.
      setPet((p) => ({
        ...p,
        recipe_redesign: JSON.stringify(recipe),
        drawing_normal_redesign: pngs.drawing_normal,
        drawing_feliz_redesign: pngs.drawing_feliz,
        drawing_enojado_redesign: pngs.drawing_enojado,
        active_design: 'redesign',
      }));
    }
    setRedesignSaving(false);
    setScreen('main');
  }

  async function handleToggleDesign() {
    const next = pet.active_design === 'redesign' ? 'original' : 'redesign';
    play('pop');
    const updated = await setActiveDesignRemote(resolvedSlug, next);
    setPet((p) => (updated ? updated : { ...p, active_design: next }));
  }

  // Ritmo de las barras. Antes bajaba 1 punto de hambre cada 3 segundos:
  // de lleno a vacío en 3 minutos, sin tiempo de disfrutar nada. Ahora el
  // hambre tarda ~50 min en vaciarse y el amor ~1h40, que es el ritmo de
  // una mascota que visitas de vez en cuando, no una cuenta regresiva.
  useEffect(() => {
    if (!pet) return;
    const now = Date.now();
    const hungerLost = Math.floor((now - lastHungerAt) / HUNGER_MS);
    if (hungerLost > 0) {
      setHunger((h) => Math.max(0, h - hungerLost));
      // Sólo se consume el tiempo ya aplicado: el resto queda para el
      // siguiente tic y no se pierde ni se cuenta de más.
      setLastHungerAt((t) => t + hungerLost * HUNGER_MS);
    }
    const loveLost = Math.floor((now - lastLoveAt) / LOVE_MS);
    if (loveLost > 0) {
      setLove((l) => Math.max(0, l - loveLost));
      setLastLoveAt((t) => t + loveLost * LOVE_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (!pet) return;
    const id = setInterval(() => {
      const casuals = (pet.phrases || []).filter((p) => p.category === 'casual');
      if (casuals.length > 0 && screen === 'main' && !cinematicAvailable) {
        setBubble({ text: casuals[Math.floor(Math.random() * casuals.length)].text, tone: 'casual' });
      }
    }, 12000);
    return () => clearInterval(id);
  }, [pet, screen, cinematicAvailable]);

  function fireReaction(type) {
    setReaction((r) => ({ key: r.key + 1, type }));
  }

  async function feed(food) {
    const slug = resolvedSlug;
    // animación de bocado volando + reacción de partículas
    const morselColor = food.preference === 'no_gusta' ? '#B7C3CB' : C.peach;
    play('eat');
    // el veredicto suena un momento después, cuando el bocado "llega"
    setTimeout(() => play(food.preference === 'no_gusta' ? 'yuck' : 'yum'), 620);
    setFlyingFood({ key: Date.now(), color: morselColor, image: food.image || null });
    setTimeout(() => setFlyingFood(null), 650);

    // Alimentar sube el HAMBRE y cambia el ánimo, nunca el amor.
    // El amor sólo sube bañando a la mascota o jugando minijuegos.
    const applyLocal = () => {
      if (food.preference === 'gusta') {
        setMood('feliz'); setHunger((h) => Math.min(100, h + 20)); fireReaction('yum');
      } else if (food.preference === 'no_gusta') {
        setMood('enojado'); setHunger((h) => Math.min(100, h + 5)); fireReaction('dislike');
      } else {
        setMood('normal'); setHunger((h) => Math.min(100, h + 10)); fireReaction('happy');
      }
      setBubble({ text: food.reaction_message || 'Ñam, gracias por la comida', tone: food.preference });
      touchClocks();
    };

    if (loadState === 'live') {
      const data = await feedPetRemote(slug, food.food_name);
      if (data) {
        setMood(data.mood);
        setHunger(data.hunger_meter);
        // El backend ya no toca el amor; lo dejamos como está.
        setBubble({ text: data.reaction_message, tone: food.preference });
        fireReaction(data.mood === 'feliz' ? 'yum' : data.mood === 'enojado' ? 'dislike' : 'happy');
        touchClocks();
        return;
      }
      // si el backend falló, cae a local
    }
    applyLocal();
  }

  function pokePet() {
    if (cinematicAvailable) return;
    play('tap');
    // Acariciar hace hablar y reaccionar a la mascota, pero NO sube el amor.
    // El amor sólo sube bañándola o jugando minijuegos.
    const casuals = (pet.phrases || []).filter((p) => p.category === 'casual');
    const positives = (pet.phrases || []).filter((p) => p.category === 'positiva');
    const pool = [...casuals, ...positives];
    if (pool.length > 0) {
      setBubble({ text: pool[Math.floor(Math.random() * pool.length)].text, tone: 'casual' });
    } else {
      setBubble({ text: '¡Me encanta que me consientas!', tone: 'gusta' });
    }
  }

  // baño
  function enterBathroom() { play('swoosh'); setBathProgress(0); setBathDone(false); setSpongePos({ x: 150, y: 320 }); setBubbles([]); setScreen('bathroom'); }
  function spawnBubbleParticle(x, y) {
    const id = Math.random().toString(36).slice(2);
    setBubbles((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setBubbles((prev) => prev.filter((b) => b.id !== id)), 900);
  }
  function completeBath() {
    setBathDone(true);
    setMood('feliz');
    play('splash');
    awardCoins(10, 'baño');
  }
  function checkScrub(x, y) {
    const dx = x - PET_CENTER.x, dy = y - PET_CENTER.y;
    if (Math.sqrt(dx * dx + dy * dy) >= SCRUB_RADIUS) return;
    // El avance va por TIEMPO real de frotado, no por cantidad de eventos
    // del puntero: un móvil de 120 Hz disparaba el doble de eventos y
    // llenaba la barra en la mitad de tiempo que uno de 60 Hz.
    const now = performance.now();
    const last = lastScrubAt.current;
    lastScrubAt.current = now;
    const dt = Math.min(120, now - last);   // si soltaste, no acumula
    if (dt <= 0) return;
    setBathProgress((p) => {
      if (p >= 100) return p;
      const next = Math.min(100, p + (dt / BATH_MS) * 100);
      // El amor sube MIENTRAS frotas, no de golpe al final. Antes saltaba
      // +15 en el último instante y el baño no se sentía como nada.
      const gained = Math.floor(next / 100 * BATH_LOVE) - Math.floor(p / 100 * BATH_LOVE);
      if (gained > 0) {
        setLove((l) => Math.min(100, l + gained));
        touchClocks();
      }
      if (Math.floor(next / 12) !== Math.floor(p / 12)) play('scrub');
      if (next >= 100) completeBath();
      return next;
    });
    if (Math.random() < 0.3) spawnBubbleParticle(x, y);
  }
  function handleSpongeDown(e) { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); draggingSpongeRef.current = true; lastScrubAt.current = performance.now(); }
  function handleSpongeMove(e) {
    if (!draggingSpongeRef.current) return;
    e.preventDefault();
    const rect = bathAreaRef.current.getBoundingClientRect();
    let x = Math.max(22, Math.min(278, e.clientX - rect.left));
    let y = Math.max(22, Math.min(358, e.clientY - rect.top));
    setSpongePos({ x, y }); checkScrub(x, y);
  }
  function handleSpongeUp() { draggingSpongeRef.current = false; }

  // ── Fin de partida (uno solo para los 10 minijuegos) ─────────────
  // Antes había siete funciones casi idénticas, cada una con su fórmula
  // de monedas suelta y ninguna guardaba récord. Ahora todo pasa por
  // aquí: monedas (con bonus del primer juego del día), récord, racha,
  // amor, y la pantalla de resultado que deja repetir sin salir.
  function finishGame(gameId, score) {
    const meta = GAME_META[gameId];
    if (!meta) return;
    play('win');

    const bonus = isDailyBonusReady(game, gameId);
    const base = Math.max(0, Math.round(meta.coins(score)));
    const coins = bonus ? base * DAILY_BONUS_MULTIPLIER : base;
    const record = (game.records || {})[gameId];
    const beat = isNewRecord(game, gameId, score);

    setGame((g) => ({ ...registerPlay(g, gameId, score), coins: g.coins + coins }));
    if (meta.love) setLove((l) => Math.min(100, l + meta.love));
    if (gameId === 'atrapar') setHunger((h) => Math.min(100, h + Math.min(10, score)));

    setGameResult({ gameId, score, coins, record, isRecord: beat, bonus });
  }

  function replayGame() {
    setGameResult(null);
    setReplayKey((k) => k + 1);
  }

  function exitGame() {
    const r = gameResult;
    setGameResult(null);
    if (r) {
      const meta = GAME_META[r.gameId] || {};
      setBubble({ text: meta.done || '¡Qué bien jugamos!', tone: 'gusta' });
    }
    setScreen('main');
  }
  function completeCinematic() { setHunger(55); setLove(55); setMood('feliz'); setBubble({ text: 'Me alegra tenerte de vuelta', tone: 'gusta' }); touchClocks(); setScreen('main'); }

  // "Dale al que salga" usa lo que configuró quien regaló: sus comidas y
  // sus objetos, en vez de topos genéricos que no significan nada.
  //
  // OJO: este hook tiene que ir ANTES del `if (!pet) return`. Si va
  // después, en el primer render (sin mascota todavía) no se ejecuta y
  // en el siguiente sí: React ve que cambió el orden de los hooks y
  // revienta con la pantalla en blanco.
  const whackTargets = React.useMemo(() => {
    if (!pet) return [];
    // Si quien regaló subió blancos propios en el asistente, se usan SOLO
    // esos: los eligió a propósito para este juego. Si no subió ninguno,
    // se cae a las comidas y objetos ya configurados, como antes.
    const custom = (pet.whack_targets || []).filter((t) => t.image);
    if (custom.length) return custom.map((t) => ({ image: t.image, label: t.name }));

    const out = [];
    (pet.food_preferences || []).forEach((f) => {
      if (f.image) out.push({ image: f.image, label: f.food_name });
      else out.push({ label: f.food_name, color: f.preference === 'gusta' ? C.peach : '#D5DEE3' });
    });
    (pet.decor_items || []).forEach((d) => out.push({ image: d.image, label: d.name }));
    return out;
  }, [pet]);

  if (!pet) {
    return (
      <div className="w-full min-h-full flex flex-col items-center justify-center py-16" style={{ color: C.ink }}>
        <div style={{ animation: 'pg-breathe 2s ease-in-out infinite' }}><IconHeart size={40} color={C.rose} fill={C.roseSoft} /></div>
        <p style={{ marginTop: 12, fontFamily: FONT.display, fontWeight: 700, color: C.inkSoft }}>Cargando...</p>
      </div>
    );
  }

  const displayMood = cinematicAvailable ? 'enojado' : mood;
  const outfits = pet.outfits || [];
  // Por id ESTABLE, no por posición: si el catálogo de esta mascota
  // cambiara de orden, la prenda equipada no debe volverse otra distinta.
  const activeOutfit = game.equippedOutfit != null ? outfits.find((o) => o.id === game.equippedOutfit) : null;
  // Re-personalización: si quien recibió el regalo rediseñó la mascota y
  // la dejó activa, se usan esos dibujos en vez de los originales. La
  // ropa equipada sigue ganando por encima de cualquiera de los dos.
  const drawingFor = (m) => {
    if (activeOutfit) return activeOutfit[`drawing_${m}`];
    if (pet.active_design === 'redesign' && pet[`drawing_${m}_redesign`]) return pet[`drawing_${m}_redesign`];
    return pet[`drawing_${m}`];
  };
  const currentDrawing = drawingFor(displayMood);


  // Sin padding lateral en la raíz: el cuarto llega hasta los bordes de
  // la pantalla. Cada bloque que SÍ necesita margen se lo pone él mismo,
  // para no encajonar la escena.
  return (
    <div className="w-full min-h-full flex flex-col items-center" style={{ color: C.ink, paddingTop: 12, paddingBottom: 12, boxSizing: 'border-box' }}>

      {!opened && (
        <OpeningScreen petName={pet.name} creatorName={pet.creator_name} onOpen={handleOpenGift} />
      )}

      {/* Motor de música sin interfaz propia — no dibuja nada visible,
          sólo mantiene vivo el <audio>/player de YouTube. El control
          real (volumen) vive en la barra de arriba. Montado siempre en
          la misma posición del árbol para que no se desmonte al
          cambiar de pantalla y corte la canción. */}
      <MusicBar ref={musicBarRef} songs={pet.songs} />

      {screen === 'cinematic' && (
        <CinematicScreen photos={pet.photos || []} phrases={pet.phrases || []} onFinish={completeCinematic} />
      )}

      {screen === 'bathroom' && (
        <BathroomScreen
          petName={pet.name} mood={mood} drawingUrl={drawingFor(mood)} bathProgress={bathProgress} bathDone={bathDone}
          spongePos={spongePos} bubbles={bubbles} bathAreaRef={bathAreaRef} onBack={() => setScreen('main')}
          onSpongeDown={handleSpongeDown} onSpongeMove={handleSpongeMove} onSpongeUp={handleSpongeUp}
        />
      )}

      {screen === 'games' && (
        <GamesMenu game={game} onBack={() => setScreen('main')} onPlay={(id) => { setReplayKey((k) => k + 1); setScreen(id); }} />
      )}

      {/* `key={replayKey}` es lo que hace funcionar "Jugar otra vez":
          cambiarlo remonta el juego desde cero sin salir de la pantalla. */}
      {screen === 'memoria' && (
        <MemoryGame key={replayKey} cardPool={buildCardPool(pet)} onBack={() => setScreen('games')} onComplete={(s) => finishGame('memoria', s)} />
      )}

      {screen === 'atrapar' && (
        <CatchGame key={replayKey} drawingUrl={drawingFor('feliz')} foods={pet.food_preferences || []} onBack={() => setScreen('games')} onComplete={(s) => finishGame('atrapar', s)} />
      )}

      {screen === 'rompecabezas' && (
        <SlidingPuzzle
          key={replayKey}
          photoUrl={
            (pet.photos || []).find((p) => p.used_for === 'puzzle' && p.url)?.url ||
            (pet.photos || []).find((p) => p.url)?.url || null
          }
          onBack={() => setScreen('games')} onComplete={(s) => finishGame('rompecabezas', s)}
        />
      )}

      {screen === 'topos' && (
        <WhackGame key={replayKey} onBack={() => setScreen('games')} onComplete={(s) => finishGame('topos', s)} targets={whackTargets} />
      )}

      {screen === 'serpiente' && (
        <SnakeGame
          key={replayKey}
          onBack={() => setScreen('games')} onComplete={(s) => finishGame('serpiente', s)}
          treatEmoji={(pet.food_preferences || []).find((f) => f.preference === 'gusta') ? '🍓' : '🍪'}
          drawingUrl={drawingFor('feliz')}
        />
      )}

      {screen === 'cruzar' && (
        <CrossingGame key={replayKey} drawingUrl={drawingFor('normal')} onBack={() => setScreen('games')} onComplete={(s) => finishGame('cruzar', s)} />
      )}

      {screen === 'torre' && <TowerGame key={replayKey} onBack={() => setScreen('games')} onComplete={(s) => finishGame('torre', s)} />}

      {screen === 'trivia' && (
        <TriviaGame key={replayKey} pet={pet} onBack={() => setScreen('games')} onComplete={(s) => finishGame('trivia', s)} />
      )}

      {screen === 'simon' && (
        <SimonGame key={replayKey} onBack={() => setScreen('games')} onComplete={(s) => finishGame('simon', s)} />
      )}

      {screen === 'volar' && (
        <FlyGame key={replayKey} drawingUrl={drawingFor('feliz')} onBack={() => setScreen('games')} onComplete={(s) => finishGame('volar', s)} />
      )}

      {screen === 'golosinas' && (
        <Match3Game key={replayKey} pet={pet} onBack={() => setScreen('games')} onComplete={(s) => finishGame('golosinas', s)} />
      )}

      <GameResult result={gameResult} onReplay={replayGame} onExit={exitGame} />

      {screen === 'shop' && (
        <ShopScreen
          coins={game.coins} game={game} setGame={setGame} outfits={outfits}
          customDecor={pet.decor_items || []} posters={buildPosterList(pet)} onBack={() => setScreen('main')}
          hasRedesign={!!pet.recipe_redesign}
          onStartRedesign={() => setScreen('redesign')}
        />
      )}

      {screen === 'redesign' && (
        <RedesignScreen
          initialRecipe={JSON.parse(
            (pet.active_design === 'redesign' ? pet.recipe_redesign : pet.recipe_original) || 'null'
          )}
          saving={redesignSaving}
          onCancel={() => setScreen('shop')}
          onSave={handleSaveRedesign}
        />
      )}

      {screen === 'main' && (
        <>
          {/* Barra de arriba: nombre, ánimo, música, sonido y monedas en
              UNA sola fila. Antes esto ocupaba tres bloques distintos y
              empujaba todo lo demás fuera de la pantalla. */}
          <div style={{ width: '100%', maxWidth: 560, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pet.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: MOOD_LABEL[displayMood].color, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 11, letterSpacing: '0.03em', color: MOOD_LABEL[displayMood].color, whiteSpace: 'nowrap' }}>
                  se siente {MOOD_LABEL[displayMood].text}
                </span>
              </div>
            </div>

            {(pet.songs || []).length > 0 && (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <RoundBtn
                  active={volumeOpen} activeColor={C.lavender}
                  onClick={() => { play('pop'); setVolumeOpen((v) => !v); }}
                  label="Volumen de la música"
                >
                  <IconMusic size={16} color={volumeOpen ? '#fff' : C.lavender} />
                </RoundBtn>
                {volumeOpen && (
                  <div
                    className="pg-card pg-anim-pop"
                    style={{
                      position: 'absolute', top: '110%', right: 0, zIndex: 20,
                      padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: SHADOW.soft, whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>🔈</span>
                    <input
                      type="range" min={0} max={100} value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      style={{ width: 100, accentColor: C.lavender }}
                      aria-label="Volumen de la música"
                    />
                    <span style={{ fontSize: 13 }}>🔊</span>
                  </div>
                )}
              </div>
            )}

            {pet.recipe_redesign && (
              <RoundBtn
                onClick={handleToggleDesign}
                label={pet.active_design === 'redesign' ? 'Volver al diseño original' : 'Ver el rediseño'}
                active={pet.active_design === 'redesign'} activeColor={C.lavender}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>🔄</span>
              </RoundBtn>
            )}

            <RoundBtn
              onClick={() => { const m = toggleMuted(); setMutedState(m); if (!m) play('pop'); }}
              label={muted ? 'Activar sonido' : 'Silenciar'}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{muted ? '🔇' : '🔊'}</span>
            </RoundBtn>

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => { play('swoosh'); setScreen('shop'); }} className="pg-focus"
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.amberSoft, border: `1.5px solid ${C.amber}`, borderRadius: 999, padding: '6px 10px', cursor: 'pointer', boxShadow: SHADOW.soft }}
                aria-label="Ir a la tienda"
              >
                <IconCoin size={14} color={C.amber} />
                <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink }}>{game.coins}</span>
              </button>
              {coinToast && (
                <div key={coinToast.key} className="pg-anim-pop" style={{ position: 'absolute', top: '110%', right: 0, background: C.ink, color: '#fff', fontFamily: FONT.display, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', zIndex: 20 }}>
                  +{coinToast.amount} 🪙 {coinToast.reason}
                </div>
              )}
            </div>
          </div>

          {/* El cuarto, de borde a borde. Sin márgenes a los lados: se
              aprovecha todo el ancho y deslizar con el dedo es más
              cómodo. Los medidores y la burbuja van ENCIMA, no debajo,
              para no gastar alto. */}
          <div style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
            <Room
              petName={pet.name} mood={displayMood} drawingUrl={currentDrawing}
              posters={buildPosterList(pet)} customDecor={pet.decor_items || []}
              game={game} setGame={setGame} editing={decorating}
              onPokePet={pokePet} reaction={reaction} cameraRef={cameraRef}
              fullBleed
            />

            {/* medidores superpuestos, arriba a la izquierda */}
            <div style={{ position: 'absolute', left: 12, top: 10, display: 'flex', flexDirection: 'column', gap: 5, pointerEvents: 'none', zIndex: 4 }}>
              <MiniMeter kind="hunger" value={hunger} />
              <MiniMeter kind="love" value={love} />
            </div>

            {/* lo que dice la mascota, flotando sobre la escena */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 8, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 5, padding: '0 78px' }}>
              {cinematicAvailable ? (
                <button
                  onClick={() => { play('swoosh'); setScreen('cinematic'); }}
                  className="pg-anim-pop pg-focus"
                  style={{ pointerEvents: 'auto', background: C.amberSoft, border: `2px dashed ${C.amber}`, borderRadius: 16, padding: '9px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: SHADOW.soft }}
                >
                  <IconEnvelope size={20} color={C.roseDeep} />
                  <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 12.5, color: C.ink }}>Toca para recordar juntos</span>
                </button>
              ) : (
                bubble.text ? (
                  <div
                    key={bubble.text}
                    className="pg-anim-pop"
                    style={{
                      background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 16,
                      padding: '7px 13px', boxShadow: SHADOW.soft, maxWidth: '100%',
                      fontFamily: FONT.body, fontSize: 12.5, fontWeight: 600, color: C.ink,
                      textAlign: 'center', lineHeight: 1.3,
                    }}
                  >
                    {bubble.text}
                  </div>
                ) : null
              )}
            </div>

            {/* bocado volando hacia la mascota */}
            {flyingFood && (
              <div key={flyingFood.key} style={{ position: 'absolute', left: '50%', bottom: 40, '--pg-fly': '150px', animation: 'pg-food-fly 0.6s ease-in forwards', zIndex: 6, pointerEvents: 'none' }}>
                {flyingFood.image ? (
                  <img src={flyingFood.image} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.ink}`, boxShadow: SHADOW.soft }} />
                ) : (
                  <div style={{ width: 26, height: 26, borderRadius: '45% 55% 50% 50%', background: flyingFood.color, border: `2px solid ${C.ink}`, boxShadow: SHADOW.soft }} />
                )}
              </div>
            )}
          </div>

          {/* dock de acciones */}
          <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 10 }}>
            <ActionButton icon={IconBowl} label="Alimentar" color={C.rose} onClick={() => { play('pop'); setFoodOpen((v) => !v); }} />
            <ActionButton icon={IconTub} label="Bañar" color={C.sky} onClick={enterBathroom} />
            <ActionButton icon={IconBall} label="Jugar" color={C.amber} onClick={() => { play('swoosh'); setScreen('games'); }} />
            <ActionButton icon={IconFrame} label={decorating ? 'Listo' : 'Decorar'} color={C.sage} onClick={() => { play('pop'); setDecorating((v) => !v); setFoodOpen(false); }} />
            <ActionButton icon={IconBag} label="Tienda" color={C.lavender} onClick={() => { play('swoosh'); setScreen('shop'); }} />
          </div>

          {/* Panel de decoración, en la misma pantalla */}
          {decorating && (
            <div style={{ width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 12 }}>
              <DecorTrays
                posters={buildPosterList(pet)} customDecor={pet.decor_items || []}
                game={game} setGame={setGame} cameraRef={cameraRef}
                onGoShop={() => { play('swoosh'); setScreen('shop'); }}
              />
            </div>
          )}

          {/* Comida en tira horizontal: en rejilla de dos columnas se
              comía media pantalla de alto y obligaba a bajar. */}
          {foodOpen && !decorating && (
            <div style={{ width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 12 }}>
              {(pet.food_preferences || []).length === 0 ? (
                <p style={{ fontSize: 12, color: C.inkFaint, textAlign: 'center' }}>Aún no hay comidas configuradas</p>
              ) : (
                <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                  {(pet.food_preferences || []).map((f) => (
                    <button
                      key={f.food_name} onClick={() => feed(f)} className="pg-focus"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 9px', borderRadius: 14, background: C.surface, border: `1.5px solid ${C.line}`, cursor: 'pointer', boxShadow: SHADOW.soft, flexShrink: 0, width: 76 }}
                    >
                      {f.image ? (
                        <img src={f.image} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: `1.5px solid ${C.line}` }} />
                      ) : (
                        <span style={{ width: 30, height: 30, borderRadius: '45% 55% 50% 50%', background: f.preference === 'gusta' ? C.peach : '#D5DEE3', border: `2px solid ${C.ink}` }} />
                      )}
                      <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 700, color: C.ink, textAlign: 'center', lineHeight: 1.1, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.food_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
