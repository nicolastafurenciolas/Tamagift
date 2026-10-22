import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { lookOf, parseRecipe } from '../petLook';
import { C, FONT, SHADOW } from '../theme';
import { loadPet, feedPetRemote, redesignPetRemote, setActiveDesignRemote, setPetStyleRemote } from '../api';
import {
  loadGameState, saveGameState, ROOM, registerPlay, isDailyBonusReady, isNewRecord,
  DAILY_BONUS_MULTIPLIER, playsTodayFor,
} from '../gameState';
import Room, { defaultPlacement, DOOR_SPOT } from './Room';
import MusicBar from './MusicBar';
import Sprite from './Sprite';
import StylePicker from './StylePicker';
import { useStyle } from '../styles/StyleContext';
import { DEFAULT_STYLE, isStyleId, getStyle } from '../styles/registry';
import { play, installUnlock, isMuted, toggleMuted } from '../sound';
import { foodSpriteFor } from '../sprites';
import {
  IconBowl, IconTub, IconBall, IconFrame, IconMusic, IconHeart, IconEnvelope, IconCoin, IconBag,
  IconPalette, IconPlay, IconPause, IconNext, IconSpeaker, IconMute, IconSwap, IconShirt,
} from './icons';
import { MiniMeter, RoundBtn, ActionButton, Modal } from './ui';
import { GAME_META, replayFactor } from './game/meta';
import { GamesMenu, GameResult } from './game/GamesMenu';
import MemoryGame, { buildCardPool } from './game/MemoryGame';
import CatchGame from './game/CatchGame';
import WhackGame from './game/WhackGame';
import SnakeGame from './game/SnakeGame';
import CrossingGame from './game/CrossingGame';
import TowerGame from './game/TowerGame';
import TriviaGame from './game/TriviaGame';
import SimonGame from './game/SimonGame';
import FlyGame from './game/FlyGame';
import Match3Game from './game/Match3Game';
import SlidingPuzzle from './game/SlidingPuzzle';
import Bathroom, { PET_CENTER } from './game/Bathroom';
import ShopScreen, { RedesignScreen, REDESIGN_COST } from './game/Shop';
import DecorTrays from './game/DecorTrays';
import { ClosetScreen } from './game/Fashion';
import DeliveryModal from './game/Delivery';
import { hasPendingTrip, parcelAtDoor, arriveAll, unpack, unpackAll } from '../deliveries';
import { newPlacementKey } from '../gameState';
import { buildPosterList } from './game/posters';
import { OpeningScreen, CinematicScreen, LoadErrorScreen } from './game/Scenes';

// ─────────────────────────────────────────────────────────────────
// El juego de quien recibe el regalo: el cuarto con la mascota, el
// dock de acciones y todas las pantallas (baño, minijuegos, tienda…).
//
// Cada pantalla vive en su propio archivo dentro de components/game/;
// aquí queda solo lo que las une: el estado de la mascota, las monedas,
// el estilo visual y la música.
// ─────────────────────────────────────────────────────────────────

// Cuánto tarda en bajar UN punto de cada barra: con 60 de inicio, el
// hambre dura ~50 min y el amor ~1h40.
const HUNGER_MS = 50 * 1000;
const LOVE_MS = 100 * 1000;
// Frotar el baño de punta a punta y cuánto amor da en total.
const BATH_MS = 9000;
const BATH_LOVE = 18;
const BATH_COINS = 10;
const BATH_COIN_COOLDOWN = 30 * 60 * 1000;
const SCRUB_RADIUS = 78;

const DEMO_PET = {
  name: 'Mochi',
  current_mood: 'normal',
  hunger_meter: 65,
  love_meter: 70,
  drawing_normal: null, drawing_feliz: null, drawing_enojado: null,
  photos: [],
  food_preferences: [
    { food_name: 'Pizza', preference: 'gusta', reaction_message: '¡Mi favorita! Gracias' },
    { food_name: 'Helado', preference: 'gusta', reaction_message: '¡Delicioso, lo amo!' },
    { food_name: 'Brócoli', preference: 'no_gusta', reaction_message: 'Esto no me gusta mucho…' },
    { food_name: 'Galleta', preference: 'gusta', reaction_message: '¡Crujiente!' },
  ],
  phrases: [
    { category: 'casual', text: '¿Cómo estuvo tu día?' },
    { category: 'casual', text: 'Me alegra que estés aquí' },
    { category: 'positiva', text: 'Hoy me siento muy feliz a tu lado' },
  ],
  songs: [],
};

const MOOD_LABEL = {
  normal: { text: 'tranquilo', color: C.sage },
  feliz: { text: 'feliz', color: C.rose },
  enojado: { text: 'de mal humor', color: C.amber },
};

const clamp100 = (v) => Math.max(0, Math.min(100, v));

// Aplica el paso del tiempo a las barras guardadas.
function decayed(v, now = Date.now()) {
  const hungerLost = Math.floor((now - v.hungerAt) / HUNGER_MS);
  const loveLost = Math.floor((now - v.loveAt) / LOVE_MS);
  return {
    ...v,
    hunger: clamp100(v.hunger - Math.max(0, hungerLost)),
    love: clamp100(v.love - Math.max(0, loveLost)),
    hungerAt: v.hungerAt + Math.max(0, hungerLost) * HUNGER_MS,
    loveAt: v.loveAt + Math.max(0, loveLost) * LOVE_MS,
  };
}

function getSlugFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('slug') || 'demo';
  } catch (e) {
    return 'demo';
  }
}

// `devScreen` / `devOpened` solo los usa la página de pruebas de desarrollo.
export default function TamagiftGame({ slug: slugProp, devScreen, devOpened }) {
  const slug = slugProp || getSlugFromUrl();
  const { styleId, setStyleId } = useStyle();

  const [pet, setPet] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [game, setGame] = useState(() => loadGameState(slug));
  const gameRef = useRef(game);
  gameRef.current = game;
  useEffect(() => { saveGameState(slug, game); }, [game, slug]);

  // Hambre, amor y ánimo, con la hora del último descuento.
  const [vitals, setVitals] = useState(null);
  const DEV_OVERLAYS = ['estilo', 'comer', 'decorar', 'apertura', 'musica'];
  const [screen, setScreen] = useState(devScreen && !DEV_OVERLAYS.includes(devScreen) ? devScreen : 'main');
  const [opened, setOpened] = useState(!!devOpened);
  const [bubble, setBubble] = useState({ text: '¡Hola! Qué bueno verte', tone: 'casual' });
  const [decorating, setDecorating] = useState(devScreen === 'decorar');
  const [foodOpen, setFoodOpen] = useState(devScreen === 'comer');
  const [styleOpen, setStyleOpen] = useState(devScreen === 'estilo');
  const [muted, setMutedState] = useState(isMuted());
  const [reaction, setReaction] = useState({ key: 0, type: 'love' });
  const [flyingFood, setFlyingFood] = useState(null);
  const [coinToast, setCoinToast] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [shopTab, setShopTab] = useState('moda');
  // Pedidos y obras (pintar / enchapar)
  const [summon, setSummon] = useState(null);
  const [unboxOpen, setUnboxOpen] = useState(false);
  const [paintJob, setPaintJob] = useState(null);
  const [replayKey, setReplayKey] = useState(0);
  const cameraRef = useRef(ROOM.W / 2);
  const timers = useRef([]);
  const later = useCallback((fn, ms) => { timers.current.push(setTimeout(fn, ms)); }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ── Música ────────────────────────────────────────────────────────
  const musicRef = useRef(null);
  const [music, setMusic] = useState({ playing: false, title: '', provider: null, count: 0 });
  const [musicOpen, setMusicOpen] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [musicVolume, setMusicVolume] = useState(70);
  useEffect(() => { if (musicRef.current) musicRef.current.setVolume(musicVolume / 100); }, [musicVolume, pet]);
  const onMusicState = useCallback((s) => setMusic(s), []);

  // ── Carga ─────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setLoadState('loading');
    (async () => {
      const { pet: data, mode } = await loadPet(slug);
      if (!alive) return;
      if (mode === 'error' || mode === 'missing') { setLoadState(mode); return; }
      const p = data || DEMO_PET;
      setPet(p);
      setLoadState(data ? mode : 'demo');
      if (data) {
        document.title = data.name;
        let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (!appleTitle) {
          appleTitle = document.createElement('meta');
          appleTitle.name = 'apple-mobile-web-app-title';
          document.head.appendChild(appleTitle);
        }
        appleTitle.content = data.name;
      }
      // Estilo: lo que eligió quien recibe > lo que eligió quien regaló.
      const g = gameRef.current;
      const chosen = (isStyleId(g.style) && g.style) || (isStyleId(p.app_style) && p.app_style) || DEFAULT_STYLE;
      if (!new URLSearchParams(window.location.search).get('estilo')) setStyleId(chosen);
      // Barras: las guardadas en el dispositivo, con el tiempo transcurrido
      // descontado; si es la primera visita, las del servidor.
      const now = Date.now();
      const saved = g.vitals;
      setVitals(saved
        ? decayed(saved, now)
        : { hunger: p.hunger_meter ?? 60, love: p.love_meter ?? 60, mood: p.current_mood ?? 'normal', hungerAt: now, loveAt: now });
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, loadAttempt]);

  // Las barras bajan con el tiempo; se recalcula cada 5 s y se guarda.
  useEffect(() => {
    if (!vitals) return undefined;
    const id = setInterval(() => setVitals((v) => (v ? decayed(v) : v)), 5000);
    return () => clearInterval(id);
  }, [!!vitals]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (vitals) setGame((g) => (g.vitals === vitals ? g : { ...g, vitals }));
  }, [vitals]);

  const hunger = vitals ? vitals.hunger : 60;
  const love = vitals ? vitals.love : 60;
  const mood = vitals ? vitals.mood : 'normal';
  const setMood = (m) => setVitals((v) => ({ ...v, mood: m }));
  const addHunger = (n) => setVitals((v) => ({ ...v, hunger: clamp100(v.hunger + n), hungerAt: n > 0 && v.hunger <= 0 ? Date.now() : v.hungerAt }));
  const addLove = (n) => setVitals((v) => ({ ...v, love: clamp100(v.love + n), loveAt: n > 0 && v.love <= 0 ? Date.now() : v.loveAt }));

  const cinematicAvailable = vitals && hunger <= 0 && love <= 0;

  useEffect(() => installUnlock(), []);

  // Frases casuales cada tanto, solo en la pantalla principal.
  useEffect(() => {
    if (!pet) return undefined;
    const id = setInterval(() => {
      const casuals = (pet.phrases || []).filter((p) => p.category === 'casual');
      if (casuals.length > 0 && screen === 'main' && !cinematicAvailable) {
        setBubble({ text: casuals[Math.floor(Math.random() * casuals.length)].text, tone: 'casual' });
      }
    }, 12000);
    return () => clearInterval(id);
  }, [pet, screen, cinematicAvailable]);

  // ── Pedidos: al volver al cuarto suena el timbre ───────────────────
  useEffect(() => {
    if (screen !== 'main' || !opened || !hasPendingTrip(game)) return undefined;
    const t = setTimeout(() => {
      setGame((g) => arriveAll(g));
      play('timbre');
      setBubble({ text: '¡Din-don! Llegó un paquete', tone: 'gusta' });
      setSummon({ key: Date.now(), x: DOOR_SPOT });
    }, 2200);
    return () => clearTimeout(t);
  }, [screen, opened, (game.deliveries || []).length]); // eslint-disable-line react-hooks/exhaustive-deps

  function useDelivered(d) {
    const rest = (gameRef.current.deliveries || []).filter((x) => x.arrived && x.id !== d.id);
    if (!rest.length) setUnboxOpen(false);
    if (d.kind === 'mueble' || d.kind === 'decor' || d.kind === 'poster') {
      const kind = d.kind;
      setGame((g) => {
        const g2 = unpack(g, d);
        return {
          ...g2,
          placed: [...(g2.placed || []), { key: newPlacementKey(kind), ...defaultPlacement(kind, d.refId, posters, pet.decor_items || [], { centerX: DOOR_SPOT + 220, placed: g2.placed || [], paint: d.paint || 'natural' }) }],
        };
      });
      setDecorating(true); setFoodOpen(false);
    } else if (d.kind === 'ropa') {
      const [slot] = d.refId.split(':');
      setGame((g) => ({ ...unpack(g, d), wear: { ...(g.wear || {}), [slot]: d.wear } }));
      fireReaction('happy');
      setBubble({ text: '¡Me encanta cómo me queda!', tone: 'gusta' });
    } else if (d.kind === 'pared' || d.kind === 'piso') {
      setGame((g) => unpack(g, d));
      setUnboxOpen(false);
      setPaintJob({ kind: d.kind, value: d.value, key: Date.now() });
    } else setGame((g) => unpack(g, d));
  }

  function awardCoins(amount, reason) {
    if (amount <= 0) return;
    play('coin');
    setGame((g) => ({ ...g, coins: g.coins + amount }));
    setCoinToast({ key: Date.now(), amount, reason });
    later(() => setCoinToast(null), 2200);
  }

  function fireReaction(type) {
    setReaction((r) => ({ key: r.key + 1, type }));
  }

  // ── Estilo ───────────────────────────────────────────────────────
  function chooseStyle(id) {
    if (id === styleId) return;
    setStyleId(id);
    setGame((g) => ({ ...g, style: id }));
    // El paquete de sonido cambia junto con el estilo; el acorde suena
    // ya con el instrumento nuevo.
    setTimeout(() => play('style'), 30);
    if (loadState === 'live') setPetStyleRemote(slug, id);
  }

  // ── Apertura ─────────────────────────────────────────────────────
  function handleOpenGift() {
    play('pop');
    later(() => setOpened(true), 450);
    if (musicRef.current) musicRef.current.start();
    // Si todas sus canciones son de Spotify, no hay forma de arrancarlas
    // solas: se abre el reproductor para que le den play.
    const songs = (pet && pet.songs) || [];
    if (songs.length && songs.every((s) => s.source_type !== 'upload' && /spotify/i.test(s.embed_url || ''))) {
      later(() => { setMusicOpen(true); setPlayerVisible(true); }, 700);
    }
  }

  // ── Rediseño ─────────────────────────────────────────────────────
  const [redesignSaving, setRedesignSaving] = useState(false);
  const [redesignError, setRedesignError] = useState('');
  async function handleSaveRedesign(recipe, pngs) {
    if (gameRef.current.coins < REDESIGN_COST) { setRedesignError('No te alcanzan las monedas'); play('bad'); return; }
    setRedesignSaving(true);
    setRedesignError('');
    const updated = loadState === 'live' ? await redesignPetRemote(slug, { recipe, ...pngs }) : null;
    if (loadState === 'live' && !updated) {
      // Solo se cobra si quedó guardado: antes se descontaban las 1000
      // monedas al abrir el editor, y cancelar o perder la conexión
      // las hacía desaparecer.
      setRedesignSaving(false);
      setRedesignError('No se pudo guardar. Revisa tu conexión: no se cobró nada.');
      play('bad');
      return;
    }
    setPet((p) => updated || {
      ...p,
      recipe_redesign: JSON.stringify(recipe),
      drawing_normal_redesign: pngs.drawing_normal,
      drawing_feliz_redesign: pngs.drawing_feliz,
      drawing_enojado_redesign: pngs.drawing_enojado,
      active_design: 'redesign',
    });
    setGame((g) => ({ ...g, coins: Math.max(0, g.coins - REDESIGN_COST) }));
    play('buy');
    setRedesignSaving(false);
    setScreen('main');
  }

  async function handleToggleDesign() {
    const next = pet.active_design === 'redesign' ? 'original' : 'redesign';
    play('pop');
    const updated = loadState === 'live' ? await setActiveDesignRemote(slug, next) : null;
    setPet((p) => (updated || { ...p, active_design: next }));
  }

  // ── Comer ────────────────────────────────────────────────────────
  function feed(food) {
    play('eat');
    later(() => play(food.preference === 'no_gusta' ? 'yuck' : 'yum'), 620);
    setFlyingFood({ key: Date.now(), food });
    later(() => setFlyingFood(null), 650);
    // Alimentar sube el HAMBRE y cambia el ánimo, nunca el amor.
    if (food.preference === 'gusta') { setMood('feliz'); addHunger(20); fireReaction('yum'); }
    else if (food.preference === 'no_gusta') { setMood('enojado'); addHunger(5); fireReaction('dislike'); }
    else { setMood('normal'); addHunger(10); fireReaction('happy'); }
    setBubble({ text: food.reaction_message || 'Ñam, gracias por la comida', tone: food.preference });
    // El servidor se entera, pero las barras las lleva este dispositivo:
    // antes la respuesta del servidor pisaba el hambre local.
    if (loadState === 'live') feedPetRemote(slug, food.food_name);
  }

  function pokePet() {
    if (cinematicAvailable) return;
    play('tap');
    const pool = (pet.phrases || []).filter((p) => p.category === 'casual' || p.category === 'positiva');
    if (pool.length) setBubble({ text: pool[Math.floor(Math.random() * pool.length)].text, tone: 'casual' });
    else setBubble({ text: '¡Me encanta que me consientas!', tone: 'gusta' });
  }

  // ── Baño ─────────────────────────────────────────────────────────
  const [bathProgress, setBathProgress] = useState(0);
  const [bathDone, setBathDone] = useState(false);
  const [spongePos, setSpongePos] = useState({ x: 150, y: 320 });
  const [bubbles, setBubbles] = useState([]);
  const draggingSponge = useRef(false);
  const lastScrubAt = useRef(0);
  const bathRef = useRef(0);

  function enterBathroom() {
    play('swoosh');
    bathRef.current = 0;
    setBathProgress(0); setBathDone(false); setSpongePos({ x: 150, y: 320 }); setBubbles([]);
    setScreen('bathroom');
  }
  function completeBath() {
    setBathDone(true);
    setMood('feliz');
    play('splash');
    fireReaction('clean');
    // Monedas como mucho cada 30 minutos: antes bañarla en bucle daba
    // monedas infinitas.
    const now = Date.now();
    if (now - (gameRef.current.lastBathCoinsAt || 0) >= BATH_COIN_COOLDOWN) {
      setGame((g) => ({ ...g, lastBathCoinsAt: now }));
      awardCoins(BATH_COINS, 'baño');
    }
  }
  function scrubAt(pos) {
    const dx = pos.x - PET_CENTER.x, dy = pos.y - PET_CENTER.y;
    if (Math.hypot(dx, dy) >= SCRUB_RADIUS || bathRef.current >= 100) return;
    // El avance va por TIEMPO de frotado, no por cantidad de eventos: un
    // celular de 120 Hz llenaba la barra en la mitad de tiempo.
    const now = performance.now();
    const dt = Math.min(120, now - lastScrubAt.current);
    lastScrubAt.current = now;
    if (dt <= 0) return;
    const p = bathRef.current;
    const next = Math.min(100, p + (dt / BATH_MS) * 100);
    bathRef.current = next;
    setBathProgress(next);
    const gained = Math.floor((next / 100) * BATH_LOVE) - Math.floor((p / 100) * BATH_LOVE);
    if (gained > 0) addLove(gained);
    if (Math.floor(next / 12) !== Math.floor(p / 12)) play('scrub');
    if (next >= 100) completeBath();
    if (Math.random() < 0.3) {
      const id = Math.random().toString(36).slice(2);
      setBubbles((prev) => [...prev.slice(-14), { id, x: pos.x, y: pos.y }]);
      later(() => setBubbles((prev) => prev.filter((b) => b.id !== id)), 900);
    }
  }

  // ── Fin de minijuego ─────────────────────────────────────────────
  function finishGame(gameId, score) {
    const meta = GAME_META[gameId];
    if (!meta) return;
    play('win');
    const g = gameRef.current;
    const bonus = isDailyBonusReady(g, gameId);
    const factor = replayFactor(gameId, playsTodayFor(g, gameId));
    const base = Math.max(0, Math.round(meta.coins(score) * factor));
    const coins = bonus ? base * DAILY_BONUS_MULTIPLIER : base;
    const record = (g.records || {})[gameId];
    // Un 0 no es récord (salvo en los juegos donde gana el que hace menos).
    const beat = (meta.lowerIsBetter || score > 0) && isNewRecord(g, gameId, score);
    setGame((st) => ({ ...registerPlay(st, gameId, score), coins: st.coins + coins }));
    if (meta.love) addLove(meta.love);
    if (gameId === 'atrapar') addHunger(Math.min(10, score));
    setGameResult({ gameId, score, coins, record, isRecord: beat, bonus, reduced: factor < 1 });
  }
  function replayGame() { play('pop'); setGameResult(null); setReplayKey((k) => k + 1); }
  function exitGame() {
    const r = gameResult;
    setGameResult(null);
    if (r) setBubble({ text: (GAME_META[r.gameId] || {}).done || '¡Qué bien jugamos!', tone: 'gusta' });
    setScreen('main');
  }
  function completeCinematic() {
    setVitals((v) => ({ ...v, hunger: 55, love: 55, mood: 'feliz', hungerAt: Date.now(), loveAt: Date.now() }));
    setBubble({ text: 'Me alegra tenerte de vuelta', tone: 'gusta' });
    setScreen('main');
  }

  // "Dale al que salga" usa lo que configuró quien regaló. (Este hook va
  // antes de cualquier return: el orden de los hooks no puede cambiar.)
  const whackTargets = useMemo(() => {
    if (!pet) return [];
    const custom = (pet.whack_targets || []).filter((t) => t.image);
    if (custom.length) return custom.map((t) => ({ image: t.image, label: t.name }));
    const out = [];
    (pet.food_preferences || []).forEach((f) => out.push(f.image ? { image: f.image, label: f.food_name } : { label: f.food_name }));
    (pet.decor_items || []).forEach((d) => out.push({ image: d.image, label: d.name }));
    return out;
  }, [pet]);
  const posters = useMemo(() => buildPosterList(pet), [pet]);

  // ── Pantallas sin mascota ────────────────────────────────────────
  if (loadState === 'error') return <LoadErrorScreen onRetry={() => setLoadAttempt((a) => a + 1)} />;
  if (loadState === 'missing') {
    return (
      <div className="w-full flex flex-col items-center" style={{ padding: '70px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink }}>Este regalo no existe</h2>
        <p style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 300, lineHeight: 1.5 }}>Revisa que el link esté completo: a veces al copiarlo se corta.</p>
      </div>
    );
  }
  if (!pet || !vitals) {
    return (
      <div className="w-full min-h-full flex flex-col items-center justify-center py-16" style={{ color: C.ink }}>
        <div style={{ animation: 'pg-breathe 2s ease-in-out infinite' }}><IconHeart size={40} color={C.rose} fill={C.roseSoft} /></div>
        <p style={{ marginTop: 12, fontFamily: FONT.display, fontWeight: 700, color: C.inkSoft }}>Cargando…</p>
      </div>
    );
  }

  const displayMood = cinematicAvailable ? 'enojado' : mood;
  const outfits = pet.outfits || [];
  const activeOutfit = game.equippedOutfit != null ? outfits.find((o) => o.id === game.equippedOutfit) : null;
  // Cómo se ve ahora (receta de mochi; las mascotas viejas, sus PNG).
  const look = lookOf(pet, activeOutfit, game);
  const baseLook = lookOf(pet, activeOutfit);
  const back = () => setScreen('games');
  const style = getStyle(styleId);

  return (
    <div className="w-full min-h-full flex flex-col items-center" style={{ color: C.ink, paddingTop: 12, paddingBottom: 12, boxSizing: 'border-box' }}>
      {!opened && <OpeningScreen petName={pet.name} creatorName={pet.creator_name} look={look} onOpen={handleOpenGift} />}

      {/* Motor de música: montado siempre, en la misma posición, para que
          cambiar de pantalla no corte la canción. */}
      <MusicBar
        ref={musicRef} songs={pet.songs} open={playerVisible}
        onClose={() => setPlayerVisible(false)} onState={onMusicState}
      />

      {screen === 'cinematic' && <CinematicScreen photos={pet.photos || []} phrases={pet.phrases || []} onFinish={completeCinematic} />}

      {screen === 'bathroom' && (
        <Bathroom
          petName={pet.name} mood={mood} look={look}
          bathProgress={bathProgress} bathDone={bathDone} spongePos={spongePos} bubbles={bubbles}
          onBack={() => { play('swoosh'); setScreen('main'); }}
          onSpongeDown={() => { draggingSponge.current = true; lastScrubAt.current = performance.now(); }}
          onSpongeMove={(e, pos) => { if (!draggingSponge.current) return; setSpongePos(pos); scrubAt(pos); }}
          onSpongeUp={() => { draggingSponge.current = false; }}
        />
      )}

      {screen === 'games' && <GamesMenu game={game} onBack={() => { play('swoosh'); setScreen('main'); }} onPlay={(id) => { play('swoosh'); setReplayKey((k) => k + 1); setScreen(id); }} />}

      {screen === 'memoria' && <MemoryGame key={replayKey} cardPool={buildCardPool(pet)} onBack={back} onComplete={(s) => finishGame('memoria', s)} />}
      {screen === 'atrapar' && <CatchGame key={replayKey} look={look} foods={pet.food_preferences || []} onBack={back} onComplete={(s) => finishGame('atrapar', s)} />}
      {screen === 'rompecabezas' && (
        <SlidingPuzzle
          key={replayKey}
          photoUrl={(pet.photos || []).find((p) => p.used_for === 'puzzle' && p.url)?.url || (pet.photos || []).find((p) => p.url)?.url || null}
          onBack={back} onComplete={(s) => finishGame('rompecabezas', s)}
        />
      )}
      {screen === 'topos' && <WhackGame key={replayKey} onBack={back} onComplete={(s) => finishGame('topos', s)} targets={whackTargets} />}
      {screen === 'serpiente' && (
        <SnakeGame
          key={replayKey} onBack={back} onComplete={(s) => finishGame('serpiente', s)} look={look}
          treat={foodSpriteFor(((pet.food_preferences || []).find((f) => f.preference === 'gusta') || {}).food_name || 'fresa')}
        />
      )}
      {screen === 'cruzar' && <CrossingGame key={replayKey} look={look} onBack={back} onComplete={(s) => finishGame('cruzar', s)} />}
      {screen === 'torre' && <TowerGame key={replayKey} onBack={back} onComplete={(s) => finishGame('torre', s)} />}
      {screen === 'trivia' && <TriviaGame key={replayKey} pet={pet} onBack={back} onComplete={(s) => finishGame('trivia', s)} />}
      {screen === 'simon' && <SimonGame key={replayKey} onBack={back} onComplete={(s) => finishGame('simon', s)} />}
      {screen === 'volar' && <FlyGame key={replayKey} look={look} onBack={back} onComplete={(s) => finishGame('volar', s)} />}
      {screen === 'golosinas' && <Match3Game key={replayKey} pet={pet} onBack={back} onComplete={(s) => finishGame('golosinas', s)} />}

      <GameResult result={gameResult} onReplay={replayGame} onExit={exitGame} />

      {screen === 'shop' && (
        <ShopScreen
          coins={game.coins} game={game} setGame={setGame} outfits={outfits} baseLook={baseLook} initialTab={shopTab}
          customDecor={pet.decor_items || []} posters={posters} onBack={() => { play('swoosh'); setScreen('main'); }}
          onStartWork={(job) => { setScreen('main'); setPaintJob({ ...job, key: Date.now() }); }}
          hasRedesign={!!pet.recipe_redesign} onStartRedesign={() => { setRedesignError(''); setScreen('redesign'); }}
        />
      )}

      {screen === 'closet' && (
        <ClosetScreen
          game={game} setGame={setGame} baseLook={baseLook} petName={pet.name}
          onBack={() => { play('swoosh'); setScreen('main'); }}
          onShop={() => { play('swoosh'); setShopTab('moda'); setScreen('shop'); }}
        />
      )}

      {screen === 'redesign' && (
        <RedesignScreen
          initialRecipe={parseRecipe(pet.active_design === 'redesign' ? pet.recipe_redesign : pet.recipe_original)}
          saving={redesignSaving} error={redesignError}
          onCancel={() => setScreen('shop')} onSave={handleSaveRedesign}
        />
      )}

      {screen === 'main' && (
        <>
          {/* Barra de arriba: nombre, ánimo y botones en una sola fila. */}
          <div className="pg-screen" style={{ width: '100%', maxWidth: 560, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: C.ink }}>{pet.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span className="pg-keep-round" style={{ width: 7, height: 7, borderRadius: '50%', background: MOOD_LABEL[displayMood].color, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 11, color: MOOD_LABEL[displayMood].color, whiteSpace: 'nowrap' }}>
                  se siente {MOOD_LABEL[displayMood].text}
                </span>
              </div>
            </div>
            {(pet.songs || []).length > 0 && (
              <RoundBtn active={musicOpen} activeColor={C.lavender} onClick={() => { play('pop'); setMusicOpen((v) => !v); }} label="Música">
                <IconMusic size={16} color={musicOpen ? C.onAccent : C.lavender} />
              </RoundBtn>
            )}
            <RoundBtn active={styleOpen} activeColor={C.rose} onClick={() => { play('pop'); setStyleOpen(true); }} label="Cambiar estilo">
              <IconPalette size={16} color={C.rose} />
            </RoundBtn>
            {pet.recipe_redesign && (
              <RoundBtn onClick={handleToggleDesign} label={pet.active_design === 'redesign' ? 'Volver al diseño original' : 'Ver el rediseño'} active={pet.active_design === 'redesign'} activeColor={C.lavender}>
                <IconSwap size={16} color={pet.active_design === 'redesign' ? C.onAccent : C.lavender} />
              </RoundBtn>
            )}
            <RoundBtn
              onClick={() => {
                const m = toggleMuted();
                setMutedState(m);
                // Silenciar también pausa la música: antes solo callaba los
                // efectos y en iPhone no había forma de parar la canción.
                if (m && musicRef.current) musicRef.current.pause();
                if (!m) play('pop');
              }}
              label={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted ? <IconMute size={16} color={C.inkSoft} /> : <IconSpeaker size={16} color={C.ink} />}
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
                <div key={coinToast.key} className="pg-anim-pop" style={{ position: 'absolute', top: '112%', right: 0, background: C.ink, color: C.paper, fontFamily: FONT.display, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', zIndex: 20 }}>
                  +{coinToast.amount} · {coinToast.reason}
                </div>
              )}
            </div>
          </div>

          {/* Panel de música */}
          {musicOpen && (
            <div className="pg-card pg-anim-pop" style={{ width: 'calc(100% - 28px)', maxWidth: 532, padding: '9px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 9 }}>
              <button
                onClick={() => { play('pop'); if (musicRef.current) musicRef.current.toggle(); }}
                className="pg-btn pg-btn-rose pg-focus" aria-label={music.playing ? 'Pausar' : 'Reproducir'}
                style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                {music.playing ? <IconPause size={16} color={C.onAccent} fill={C.onAccent} /> : <IconPlay size={16} color={C.onAccent} fill={C.onAccent} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{music.title || 'Su canción'}</div>
                <input type="range" min={0} max={100} value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} aria-label="Volumen de la música" style={{ width: '100%', accentColor: C.lavender }} />
              </div>
              {music.count > 1 && (
                <button onClick={() => { play('pop'); musicRef.current && musicRef.current.next(); }} className="pg-btn pg-btn-ghost pg-focus" aria-label="Siguiente canción" style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconNext size={15} color={C.ink} />
                </button>
              )}
              {music.provider && music.provider !== 'upload' && (
                <button onClick={() => setPlayerVisible((v) => !v)} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: C.lavender, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {playerVisible ? 'Ocultar' : 'Reproductor'}
                </button>
              )}
            </div>
          )}

          {/* El cuarto, de borde a borde. Medidores y burbuja encima. */}
          <div style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
            <Room
              petName={pet.name} mood={displayMood} look={look}
              posters={posters} customDecor={pet.decor_items || []}
              game={game} setGame={setGame} editing={decorating}
              onPokePet={pokePet} reaction={reaction} cameraRef={cameraRef}
              parcel={parcelAtDoor(game)} onOpenParcel={() => { play('pop'); setUnboxOpen(true); }} summon={summon}
              paintJob={paintJob} onPaintDone={(job) => { if (job) { setGame((g) => ({ ...g, [job.kind === 'pared' ? 'wall' : 'floor']: job.value })); fireReaction('happy'); setBubble({ text: job.kind === 'pared' ? '¡Quedó precioso!' : '¡Qué piso tan lindo!', tone: 'gusta' }); } setPaintJob(null); }}
              fullBleed extraReserved={(foodOpen && !decorating ? 104 : 0) + (musicOpen ? 66 : 0)}
            />
            <div style={{ position: 'absolute', left: 12, top: 10, display: 'flex', flexDirection: 'column', gap: 5, pointerEvents: 'none', zIndex: 4 }}>
              <MiniMeter kind="hunger" value={hunger} icon={IconBowl} />
              <MiniMeter kind="love" value={love} icon={IconHeart} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 8, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 5, padding: '0 78px' }}>
              {cinematicAvailable ? (
                <button
                  onClick={() => { play('swoosh'); setScreen('cinematic'); }} className="pg-anim-pop pg-focus"
                  style={{ pointerEvents: 'auto', background: C.amberSoft, border: `2px dashed ${C.amber}`, borderRadius: 16, padding: '9px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: SHADOW.soft }}
                >
                  <IconEnvelope size={20} color={C.roseDeep} />
                  <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 12.5, color: C.ink }}>Toca para recordar juntos</span>
                </button>
              ) : bubble.text ? (
                <div
                  key={bubble.text} className="pg-anim-pop"
                  style={{
                    background: C.glass, border: `1.5px solid ${bubble.tone === 'gusta' ? C.rose : bubble.tone === 'no_gusta' ? C.amber : C.line}`, borderRadius: 16,
                    padding: '7px 13px', boxShadow: SHADOW.soft, maxWidth: '100%',
                    fontFamily: FONT.body, fontSize: 12.5, fontWeight: 600, color: C.ink, textAlign: 'center', lineHeight: 1.3,
                  }}
                >
                  {bubble.text}
                </div>
              ) : null}
            </div>
            {flyingFood && (
              <div key={flyingFood.key} style={{ position: 'absolute', left: '50%', bottom: 40, '--pg-fly': '150px', animation: 'pg-food-fly 0.6s ease-in forwards', zIndex: 6, pointerEvents: 'none' }}>
                {flyingFood.food.image
                  ? <Sprite src={flyingFood.food.image} w={36} h={36} kind="photo" className="pg-keep-round" style={{ borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 2px ${C.ink}` }} />
                  : <Sprite art={foodSpriteFor(flyingFood.food.food_name).render()} cacheKey={`food-${foodSpriteFor(flyingFood.food.food_name).id}`} w={36} h={36} />}
              </div>
            )}
          </div>

          {/* dock de acciones */}
          <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 10 }}>
            <ActionButton icon={IconBowl} label="Alimentar" color={C.rose} active={foodOpen} onClick={() => { play('pop'); setFoodOpen((v) => !v); setDecorating(false); }} />
            <ActionButton icon={IconTub} label="Bañar" color={C.sky} onClick={enterBathroom} />
            <ActionButton icon={IconBall} label="Jugar" color={C.amber} onClick={() => { play('swoosh'); setScreen('games'); }} />
            <ActionButton icon={IconShirt} label="Vestir" color={C.peach} onClick={() => { play('swoosh'); setScreen('closet'); }} />
            <ActionButton icon={IconFrame} label={decorating ? 'Listo' : 'Decorar'} color={C.sage} active={decorating} onClick={() => { play('pop'); setDecorating((v) => !v); setFoodOpen(false); }} />
            <ActionButton icon={IconBag} label="Tienda" color={C.lavender} onClick={() => { play('swoosh'); setShopTab('moda'); setScreen('shop'); }} />
          </div>

          {decorating && (
            <div style={{ width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 12 }}>
              <DecorTrays posters={posters} customDecor={pet.decor_items || []} game={game} setGame={setGame} cameraRef={cameraRef} onGoShop={() => { play('swoosh'); setScreen('shop'); }} />
            </div>
          )}

          {foodOpen && !decorating && (
            <div style={{ width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 12 }}>
              {(pet.food_preferences || []).length === 0 ? (
                <p style={{ fontSize: 12, color: C.inkFaint, textAlign: 'center' }}>Aún no hay comidas configuradas</p>
              ) : (
                <div className="flex gap-2 pg-scroll-x" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                  {(pet.food_preferences || []).map((f, i) => (
                    <button
                      key={`${f.food_name}-${i}`} onClick={() => feed(f)} className="pg-focus pg-card"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 9px', borderRadius: 14, cursor: 'pointer', flexShrink: 0, width: 78 }}
                    >
                      {f.image
                        ? <Sprite src={f.image} w={38} h={38} kind="photo" style={{ borderRadius: 10, overflow: 'hidden' }} />
                        : <Sprite art={foodSpriteFor(f.food_name, i).render()} cacheKey={`food-${foodSpriteFor(f.food_name, i).id}`} w={38} h={38} />}
                      <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 700, color: C.ink, textAlign: 'center', lineHeight: 1.1, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.food_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {unboxOpen && (
        <DeliveryModal
          items={(game.deliveries || []).filter((d) => d.arrived)} posters={posters} baseRecipe={baseLook && baseLook.recipe} game={game}
          onUse={useDelivered}
          onKeepAll={() => { setGame((g) => unpackAll(g)); setUnboxOpen(false); }}
        />
      )}

      {styleOpen && (
        <Modal onClose={() => setStyleOpen(false)} maxWidth={420} z={75}>
          <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 2px' }}>Estilo de tu mascota</h2>
          <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px' }}>
            {pet.app_style && pet.app_style !== styleId ? `Quien te la regaló eligió "${getStyle(pet.app_style).name}". ` : ''}Cámbialo cuando quieras.
          </p>
          <StylePicker value={style.id} onChange={chooseStyle} look={look} size={64} />
          <button onClick={() => { play('pop'); setStyleOpen(false); }} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 14, padding: '11px 28px', fontSize: 14 }}>Listo</button>
        </Modal>
      )}
    </div>
  );
}
