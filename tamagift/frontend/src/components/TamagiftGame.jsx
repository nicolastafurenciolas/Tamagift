import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { lookOf, parseRecipe } from '../petLook';
import { C, FONT, SHADOW } from '../theme';
import { loadPet, feedPetRemote, redesignPetRemote, setActiveDesignRemote, setPetStyleRemote, fetchGameSave, pushGameSave, fetchLetters, fetchLetter } from '../api';
import MailArchive from './game/MailArchive';
import {
  loadGameState, saveGameState, ROOM, registerPlay, isDailyBonusReady, isNewRecord,
  DAILY_BONUS_MULTIPLIER, playsTodayFor, hydrateGameState, hasStoredGameState, todayKey,
} from '../gameState';
import { CloudSync } from '../cloudSave';
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
import { applyGameResult, progressOf } from '../gameProgress';
import CookingGame from './game/CookingGame';
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
import { phaseOf, weatherOf, isBedtime, tickVitals, defaultVitals, foodEffect, applyEffect, weightNote, moodFrom } from '../world';
import { rollEvent, endEvent, startEvent, crumbsEvent, makeEvent, BUGS } from '../worldEvents';
import { addDelivery } from '../deliveries';
import { FOODS, findFood } from '../foodCatalog';
import WorldEvents, { LetterModal } from './game/WorldEvents';
import { IconBolt, IconDrop, IconFridge } from './icons';
import { buildPosterList } from './game/posters';
import { OpeningScreen, CinematicScreen, LoadErrorScreen } from './game/Scenes';
import Tutorial, { TUTORIAL_STEPS, TUTORIAL_REWARD } from './game/Tutorial';
import { seasonNow } from '../seasons';
import DailyGift from './game/DailyGift';
import { dailyStatus, claimDaily, applyDailyReward } from '../daily';
import { DECOR_CATALOG } from '../shopCatalog';
import { pendingDelivery } from '../deliveries';

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
  normal: { text: 'tranquila', color: C.sage },
  feliz: { text: 'feliz', color: C.rose },
  enojado: { text: 'de mal humor', color: C.amber },
  triste: { text: 'triste', color: C.sky },
  dormido: { text: 'dormida', color: C.lavender },
  sorprendido: { text: 'sorprendida', color: C.peach },
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
  // (antes de que el efecto de abajo guarde la partida nueva)
  const [hadLocal] = useState(() => hasStoredGameState(slug));
  const gameRef = useRef(game);
  gameRef.current = game;
  // La partida se guarda en el dispositivo y, si el regalo está en el
  // servidor, también allá (ver cloudSave.js).
  const syncRef = useRef(null);
  useEffect(() => {
    saveGameState(slug, game);
    if (syncRef.current) syncRef.current.changed(game);
  }, [game, slug]);

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
  // Solo en desarrollo: ?obra=piso.ajedrez.clasico abre la obra directo.
  const [paintJob, setPaintJob] = useState(() => {
    if (!import.meta.env.DEV) return null;
    const v = new URLSearchParams(window.location.search).get('obra');
    if (!v) return null;
    const [kind, ...rest] = v.split('.');
    return { kind, value: rest.join('.'), key: 1 };
  });
  const [replayKey, setReplayKey] = useState(0);
  const [startLevel, setStartLevel] = useState(null);
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

  // Llegó una partida más nueva, jugada en otro dispositivo.
  const adoptRemoteRef = useRef(null);
  adoptRemoteRef.current = (state) => {
    gameRef.current = state;
    setGame(state);
    if (state.vitals) setVitals(tickVitals(state.vitals));
    if (isStyleId(state.style)) setStyleId(state.style);
    setBubble({ text: 'Traje lo que jugaste en el otro dispositivo', tone: 'gusta' });
  };

  // Al esconder o cerrar la pestaña se sube lo que falte; al volver, se
  // mira si mientras tanto se jugó en otro dispositivo.
  useEffect(() => {
    const onVisibility = () => {
      const sync = syncRef.current;
      if (!sync) return;
      if (document.visibilityState === 'hidden') sync.flush({ keepalive: true });
      else sync.pull();
    };
    const onPageHide = () => { if (syncRef.current) syncRef.current.flush({ keepalive: true }); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      if (syncRef.current) { syncRef.current.flush({ keepalive: true }); syncRef.current.stop(); syncRef.current = null; }
    };
  }, []);

  // ── Carga ─────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setLoadState('loading');
    (async () => {
      const { pet: data, mode } = await loadPet(slug);
      if (!alive) return;
      if (mode === 'error' || mode === 'missing') { setLoadState(mode); return; }
      // La partida: la de este dispositivo o la del servidor, la más nueva.
      if (mode === 'live') {
        if (syncRef.current) syncRef.current.stop();
        const sync = new CloudSync(slug, {
          api: { fetchSave: fetchGameSave, pushSave: pushGameSave },
          hydrate: hydrateGameState,
          onRemote: (state) => adoptRemoteRef.current(state),
        });
        const chosen = await sync.start(gameRef.current, hadLocal);
        if (!alive) { sync.stop(); return; }
        syncRef.current = sync;
        if (chosen !== gameRef.current) { gameRef.current = chosen; setGame(chosen); }
      }
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
        ? tickVitals(saved, now)
        : defaultVitals(now, { hunger: p.hunger_meter ?? 60, love: p.love_meter ?? 60, mood: p.current_mood ?? 'normal' }));
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, loadAttempt]);

  // Las barras bajan con el tiempo; se recalcula cada 5 s y se guarda.
  useEffect(() => {
    if (!vitals) return undefined;
    const id = setInterval(() => setVitals((v) => (v ? tickVitals(v) : v)), 5000);
    return () => clearInterval(id);
  }, [!!vitals]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (vitals) setGame((g) => (g.vitals === vitals ? g : { ...g, vitals }));
  }, [vitals]);

  const hunger = vitals ? vitals.hunger : 60;
  const love = vitals ? vitals.love : 60;
  const energy = vitals ? vitals.energy ?? 80 : 80;
  const clean = vitals ? vitals.clean ?? 85 : 85;
  const asleep = !!(vitals && vitals.asleep);
  const mood = vitals ? moodFrom(vitals, vitals.mood) : 'normal';
  const addVitals = (e) => setVitals((v) => (v ? applyEffect(v, e) : v));
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

  // ── El mundo: hora, clima, luz ───────────────────────────────────
  // Solo en desarrollo: ?hora=22&clima=lluvia&suceso=visita para revisar.
  const devQ = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null;
  const nowDate = () => { const d = new Date(); if (devQ && devQ.get('hora')) d.setHours(Number(devQ.get('hora')), 0); return d; };
  const [clock, setClock] = useState(nowDate);
  useEffect(() => { const id = setInterval(() => setClock(nowDate()), 60 * 1000); return () => clearInterval(id); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const phase = phaseOf(clock);
  const weather = (devQ && devQ.get('clima')) || weatherOf(clock, slug);
  useEffect(() => {
    const t = devQ && devQ.get('suceso');
    if (!t || !pet) return;
    const ev = makeEvent(t, gameRef.current, pet);
    if (ev) {
      setGame((g) => startEvent({ ...g, events: { ...(g.events || {}), lastDay: { regalo: 'x', carta: 'x' } } }, ev));
      if (t === 'visita' || t === 'carta' || t === 'dulceotruco') setTimeout(() => setSummon({ key: Date.now(), x: DOOR_SPOT + 60 }), 400);
    }
  }, [!!pet]); // eslint-disable-line react-hooks/exhaustive-deps
  function toggleLights() {
    const off = !asleep;
    play(off ? 'pop' : 'tap');
    setVitals((v) => ({ ...v, asleep: off, energyAt: Date.now() }));
    if (off) setBubble({ text: 'Buenas noches… zzz', tone: 'casual' });
    else setBubble({ text: (vitals.energy ?? 80) < 40 ? '¡Ay! Todavía tengo sueño…' : '¡Buenos días! Dormí rico', tone: 'gusta' });
  }
  // ── Guía de bienvenida (la primera vez que se abre el regalo) ────
  const [guideReady, setGuideReady] = useState(false);
  useEffect(() => {
    if (!opened) return undefined;
    const t = setTimeout(() => setGuideReady(true), 900);
    return () => clearTimeout(t);
  }, [opened]);
  const tutorialStep = typeof game.tutorial === 'number' ? game.tutorial : null;
  const tutorialActive = guideReady && tutorialStep != null && !!TUTORIAL_STEPS[tutorialStep] && screen === 'main' && !cinematicAvailable;
  // `from`: el paso desde el que se avanza (así dos toques seguidos no
  // se saltan uno).
  function tutorialNext(from) {
    const last = from >= TUTORIAL_STEPS.length - 1;
    setGame((g) => (g.tutorial !== from ? g : { ...g, tutorial: last ? 'listo' : from + 1 }));
    if (last) { awardCoins(TUTORIAL_REWARD, 'bienvenida'); fireReaction('love'); }
    else play('pop');
  }
  function tutorialSkip() {
    setGame((g) => ({ ...g, tutorial: 'listo' }));
    awardCoins(TUTORIAL_REWARD, 'bienvenida');
  }

  // ── Temporada (Halloween…) ────────────────────────────────────────
  const season = seasonNow(clock);
  const seasonKey = season ? `${season.id}-${clock.getFullYear()}` : null;
  useEffect(() => {
    if (!season || !opened || screen !== 'main' || tutorialActive || !guideReady) return;
    if ((gameRef.current.seasonSeen || []).includes(seasonKey)) return;
    setGame((g) => ({ ...g, seasonSeen: [...(g.seasonSeen || []), seasonKey] }));
    later(() => setBubble({ text: `¡Llegó ${season.name}! Hasta ${season.until} hay disfraces y decoración en la tienda`, tone: 'gusta' }), 600);
  }, [seasonKey, opened, screen, tutorialActive, guideReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Buzón: cartas nuevas de quien regaló (llegan como paquete) ────
  const [mailOpen, setMailOpen] = useState(false);
  const checkLetters = useRef(null);
  checkLetters.current = async () => {
    if (loadState !== 'live' || !pet) return;
    const list = await fetchLetters(slug, gameRef.current.lastLetterId || 0);
    if (!list || !list.length) return;
    const label = `Carta de ${pet.creator_name || 'alguien especial'}`;
    setGame((g) => {
      const last = g.lastLetterId || 0;
      let st = g;
      list.filter((l) => l.id > last).forEach((l) => { st = addDelivery(st, { kind: 'carta', refId: l.id, label }); });
      return { ...st, lastLetterId: Math.max(last, ...list.map((l) => l.id)) };
    });
  };
  useEffect(() => {
    if (loadState !== 'live' || !pet) return undefined;
    checkLetters.current();
    const id = setInterval(() => { if (document.visibilityState !== 'hidden') checkLetters.current(); }, 3 * 60 * 1000);
    const onVis = () => { if (document.visibilityState === 'visible') checkLetters.current(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [loadState, !!pet]); // eslint-disable-line react-hooks/exhaustive-deps
  async function openMailLetter(id) {
    setLetter({ loading: true, mail: true });
    play('unbox');
    const l = await fetchLetter(slug, id);
    setLetter(l ? { text: l.text, photo: l.photo, mail: true } : { text: 'No se pudo abrir la carta. Revisa tu conexión e intenta de nuevo desde el buzón.', mail: true });
  }

  // ── Premio de cada día (daily.js) ────────────────────────────────
  const [dailyOpen, setDailyOpen] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(null);
  const dailyShown = useRef(false);
  const daily = dailyStatus(game);
  useEffect(() => {
    // una vez por visita, después de la guía, en el cuarto
    if (dailyShown.current || !daily.ready || !opened || !guideReady || screen !== 'main' || tutorialActive || game.tutorial !== 'listo') return undefined;
    // en las páginas de prueba no estorba (salvo con ?premio=1)
    if (devOpened && !(devQ && devQ.get('premio'))) return undefined;
    const t = setTimeout(() => { dailyShown.current = true; setDailyClaimed(null); setDailyOpen(true); }, 1400);
    return () => clearTimeout(t);
  }, [daily.ready, opened, guideReady, screen, tutorialActive, game.tutorial]); // eslint-disable-line react-hooks/exhaustive-deps
  function claimDailyGift() {
    // la sorpresa del día 7: una deco que todavía no tiene (de las de siempre)
    const pick = (g) => {
      const opts = DECOR_CATALOG.filter((d) => !d.season && d.price <= 90 && !(g.ownedDecor || []).includes(d.id) && !pendingDelivery(g, 'decor', d.id));
      return opts.length ? opts[Math.floor(Math.random() * opts.length)] : null;
    };
    const res = claimDaily(gameRef.current, todayKey(), pick);
    if (!res) return;
    setGame((st) => applyDailyReward({ ...st, daily: res.game.daily }, res.reward));
    play(res.reward.kind === 'monedas' ? 'coin' : 'buy');
    if (res.reward.kind === 'monedas') { setCoinToast({ key: Date.now(), amount: res.reward.value, reason: 'premio del día' }); later(() => setCoinToast(null), 2200); }
    fireReaction('love');
    setDailyClaimed(res.reward);
  }

  // Dulce o truco: la respuesta a la visita disfrazada.
  const [flicker, setFlicker] = useState(0);
  function handleTrickOrTreat(choice) {
    const g = gameRef.current;
    const ev = (g.events || {}).active;
    if (!ev || ev.type !== 'dulceotruco') return;
    if (choice === 'truco') {
      play('bad');
      setFlicker(Date.now());
      setMood('sorprendido');
      fireReaction('scare');
      setBubble({ text: '¡Buuu! ¡Ay, qué susto!', tone: 'casual' });
      later(() => { setBubble({ text: 'Jajaja, me asustó de verdad', tone: 'gusta' }); fireReaction('happy'); addVitals({ love: 3 }); }, 1600);
      setGame((st) => endEvent(st));
      return;
    }
    // el dulce sale de la nevera si hay; si no, se compra uno (10 monedas)
    const sweet = Object.entries(g.fridge || {}).find(([id, n]) => n > 0 && (findFood(id) || {}).kind === 'dulce');
    const paid = !sweet && g.coins >= 10 ? 10 : 0;
    // a veces deja de regalo una deco de Halloween que todavía no tienes
    const options = DECOR_CATALOG.filter((d) => d.season === 'halloween' && d.price <= 85 && !(g.ownedDecor || []).includes(d.id) && !pendingDelivery(g, 'decor', d.id));
    const gift = options.length && Math.random() < 0.5 ? options[Math.floor(Math.random() * options.length)] : null;
    play('buy');
    setGame((st) => {
      let next = endEvent(st);
      if (sweet) next = { ...next, fridge: { ...(next.fridge || {}), [sweet[0]]: Math.max(0, ((next.fridge || {})[sweet[0]] || 0) - 1) } };
      if (paid) next = { ...next, coins: Math.max(0, next.coins - paid) };
      if (gift) next = addDelivery(next, { kind: 'decor', refId: gift.id, label: gift.name });
      return next;
    });
    addVitals({ love: 8 });
    fireReaction('love');
    if (gift) setBubble({ text: `¡Gracias! Te dejó de regalo: ${gift.name.toLowerCase()}`, tone: 'gusta' });
    else { awardCoins(20 + Math.floor(Math.random() * 4) * 5, 'dulce o truco'); setBubble({ text: '¡Feliz Halloween! Nos dejó caramelos', tone: 'gusta' }); }
  }

  // sueño: de noche y cansada lo pide
  useEffect(() => {
    if (screen !== 'main' || asleep || !vitals) return;
    if ((isBedtime(clock) && energy < 60) || energy < 20) setBubble({ text: 'Tengo sueño… ¿apagas la luz?', tone: 'casual' });
  }, [phase, energy < 20, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Al volver al cuarto con otra ropa o peinado, se luce.
  const outfitKey = JSON.stringify([game.wear || {}, game.look || {}, game.equippedOutfit || null]);
  const seenOutfit = useRef(outfitKey);
  const prevScreen = useRef(screen);
  useEffect(() => {
    const from = prevScreen.current;
    prevScreen.current = screen;
    if (screen !== 'main') return undefined;
    const changed = seenOutfit.current !== outfitKey;
    seenOutfit.current = outfitKey;
    // solo al volver del vestidor o de la tienda (no al cargar la partida)
    if (!changed || !['closet', 'shop'].includes(from)) return undefined;
    const t = setTimeout(() => { fireReaction('dress'); setBubble({ text: '¿Cómo me veo? ¡Me encanta!', tone: 'gusta' }); }, 450);
    return () => clearTimeout(t);
  }, [screen, outfitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lo que cocinó en la Cocina pasa a la nevera.
  useEffect(() => {
    const cooked = game.cooked || {};
    if (screen !== 'main' || !Object.keys(cooked).length) return;
    setGame((g) => {
      const fridge = { ...(g.fridge || {}) };
      Object.entries(g.cooked || {}).forEach(([id, n]) => { fridge[id] = (fridge[id] || 0) + n; });
      return { ...g, fridge, cooked: {} };
    });
    setBubble({ text: 'Guardé lo que cocinaste en la nevera', tone: 'gusta' });
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sucesos ──────────────────────────────────────────────────────
  const [letter, setLetter] = useState(null);
  useEffect(() => {
    if (screen !== 'main' || !opened || !pet) return undefined;
    const tick = () => {
      const g = gameRef.current;
      const ev = g.events || {};
      const now = Date.now();
      if (ev.active && ev.active.until < now) { setGame((st) => endEvent(st)); return; }
      if (asleep || decorating || paintJob || tutorialActive) return;
      if (!ev.nextAt) { setGame((st) => ({ ...st, events: { ...(st.events || {}), nextAt: now + 25000 } })); return; }
      const next = rollEvent(g, pet, { now });
      if (!next) return;
      if (next.type === 'regalo') {
        // el regalo del día llega como pedido, con su timbre
        setGame((st) => endEvent(addDelivery(startEvent(st, next), { ...next.data.gift, refId: next.data.gift.refId || 'monedas', label: next.data.gift.label })));
        return;
      }
      setGame((st) => startEvent(st, next));
      if (next.type === 'visita') { play('timbre'); setBubble({ text: '¡Din-don! Alguien vino a visitarte', tone: 'gusta' }); setSummon({ key: Date.now(), x: DOOR_SPOT + 60 }); }
      if (next.type === 'antojo') setBubble({ text: `Tengo antojo de ${next.data.food.name.toLowerCase()}…`, tone: 'gusta' });
      if (next.type === 'hipo') setBubble({ text: '¡Hip! … ¡hip! Tócame cuando salte', tone: 'casual' });
      if (next.type === 'dulceotruco') { play('timbre'); setBubble({ text: '¡Din-don! Alguien disfrazado tocó la puerta…', tone: 'gusta' }); setSummon({ key: Date.now(), x: DOOR_SPOT + 60 }); }
      if (next.type === 'fantasmas') setBubble({ text: '¡Hay fantasmitas sueltos por el cuarto! Atrápalos a todos', tone: 'gusta' });
      if (next.type === 'carta') { setBubble({ text: 'Mira, ¡llegó una carta por debajo de la puerta!', tone: 'gusta' }); setSummon({ key: Date.now(), x: DOOR_SPOT + 40 }); }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [screen, opened, pet, asleep, decorating, !!paintJob, tutorialActive]); // eslint-disable-line react-hooks/exhaustive-deps

  function resolveEvent(result) {
    const ev = (gameRef.current.events || {}).active;
    if (!ev) return;
    if (result.coins) awardCoins(result.coins, result.reason || 'sorpresa');
    if (result.vitals) addVitals(result.vitals);
    if (result.bubble) setBubble({ text: result.bubble, tone: 'gusta' });
    if (result.react) fireReaction(result.react);
    setGame((g) => {
      let st = endEvent(g);
      if (result.bug) st = { ...st, bugs: { ...(st.bugs || {}), [result.bug]: ((st.bugs || {})[result.bug] || 0) + 1 } };
      if (result.food) st = { ...st, fridge: { ...(st.fridge || {}), [result.food.id]: ((st.fridge || {})[result.food.id] || 0) + result.food.n } };
      return st;
    });
  }

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
      fireReaction('dress');
      setBubble({ text: '¡Me encanta cómo me queda!', tone: 'gusta' });
    } else if (d.kind === 'carta') {
      setGame((g) => unpack(g, d));
      openMailLetter(d.refId);
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
    if (asleep) { setBubble({ text: 'Zzz… está dormida. Prende la luz para despertarla.', tone: 'casual' }); return; }
    if (tutorialActive && TUTORIAL_STEPS[tutorialStep].waitFor === 'feed') { const from = tutorialStep; later(() => tutorialNext(from), 1500); }
    play('eat');
    later(() => play(food.preference === 'no_gusta' ? 'yuck' : 'yum'), 620);
    setFlyingFood({ key: Date.now(), food });
    later(() => setFlyingFood(null), 650);
    // Alimentar sube el HAMBRE y cambia el ánimo, nunca el amor.
    const eff = foodEffect(food);
    if (hunger >= 96) {
      // llena: no come más (y no se gasta la comida)
      setBubble({ text: '¡Estoy llenita! Mejor más tarde', tone: 'casual' });
      return;
    }
    addVitals(eff);
    if (food.fromFridge) setGame((g) => ({ ...g, fridge: { ...(g.fridge || {}), [food.id]: Math.max(0, ((g.fridge || {})[food.id] || 0) - 1) } }));
    if (food.preference === 'gusta') { setMood('feliz'); fireReaction('yum'); }
    else if (food.preference === 'no_gusta') { setMood('enojado'); fireReaction('dislike'); }
    else { setMood(eff.kind === 'saludable' || eff.kind === 'casera' ? 'feliz' : 'normal'); fireReaction(eff.kind === 'saludable' ? 'happy' : 'yum'); }
    const note = weightNote({ weight: (vitals.weight || 0) + eff.weight });
    setBubble({ text: (eff.weight > 0 && note) || food.reaction_message || (eff.kind === 'saludable' ? '¡Qué rico y sano!' : 'Ñam, gracias por la comida'), tone: food.preference || 'gusta' });
    // el antojo: si era justo eso, premio
    const ev = gameRef.current.events && gameRef.current.events.active;
    if (ev && ev.type === 'antojo' && ev.data.food && (ev.data.food.name === (food.food_name || food.name))) {
      later(() => { awardCoins(25, 'antojo cumplido'); addVitals({ love: 8 }); setBubble({ text: '¡Era justo lo que quería! Te quiero', tone: 'gusta' }); setGame((g) => endEvent(g)); }, 900);
    } else if (Math.random() < 0.3 && !(gameRef.current.events || {}).active) {
      // a veces se le caen migas
      later(() => setGame((g) => startEvent(g, crumbsEvent(g.petX || 800))), 1200);
    }
    // El servidor se entera, pero las barras las lleva este dispositivo:
    // antes la respuesta del servidor pisaba el hambre local.
    if (loadState === 'live') feedPetRemote(slug, food.food_name);
  }

  const hipRef = useRef({ at: 0, hits: 0 });
  function pokePet() {
    if (cinematicAvailable) return;
    const ev = (gameRef.current.events || {}).active;
    if (ev && ev.type === 'hipo') {
      if (Date.now() - hipRef.current.at < 900) {
        hipRef.current.hits += 1;
        play('good');
        if (hipRef.current.hits >= 3) { hipRef.current.hits = 0; resolveEvent({ coins: 15, reason: 'se le quitó el hipo', vitals: { love: 6 }, bubble: '¡Se me quitó! Gracias por el susto', react: 'happy' }); }
        else setBubble({ text: `¡Hip!… (${hipRef.current.hits}/3)`, tone: 'casual' });
      } else { play('tap'); setBubble({ text: 'Espera a que salte con el hipo…', tone: 'casual' }); }
      return;
    }
    if (asleep) { setBubble({ text: 'Zzz…', tone: 'casual' }); return; }
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
    addVitals({ clean: 100 });
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
  // `extra` lo manda el juego: nivel y estrellas, lo que pasó en la partida
  // (para el reto del día) y, en la Cocina, los platos (`dishes`).
  function finishGame(gameId, score, extra = {}) {
    const meta = GAME_META[gameId];
    if (!meta) return;
    play('win');
    const g = gameRef.current;
    const bonus = isDailyBonusReady(g, gameId);
    const factor = replayFactor(gameId, playsTodayFor(g, gameId));
    const base = Math.max(0, Math.round(meta.coins(score, extra) * factor));
    const coins = bonus ? base * DAILY_BONUS_MULTIPLIER : base;
    const record = (g.records || {})[gameId];
    // Un 0 no es récord (salvo en los juegos donde gana el que hace menos).
    const beat = !meta.levels && (meta.lowerIsBetter || score > 0) && isNewRecord(g, gameId, score);
    const { info } = applyGameResult(g, gameId, score, extra);
    const challengeCoins = (info.challenge && info.challenge.reward) || 0;
    setGame((st) => {
      const next = applyGameResult(st, gameId, score, extra).state;
      const cooked = { ...(next.cooked || {}) };
      (extra.dishes || []).forEach((d) => { cooked[d.id] = (cooked[d.id] || 0) + (d.n || 1); });
      return { ...registerPlay(next, gameId, score), cooked, coins: st.coins + coins + challengeCoins };
    });
    if (meta.love && (!meta.levels || extra.won)) addLove(meta.love);
    addVitals({ energy: -6, weight: -2 });
    if (gameId === 'atrapar') addHunger(Math.min(10, score));
    setGameResult({ gameId, score, coins, challengeCoins, record, isRecord: beat, bonus, reduced: factor < 1, extra, info });
  }
  // `next`: nivel con el que arranca el juego al volver a abrirse.
  function replayGame(next) { play('pop'); setStartLevel(next || null); setGameResult(null); setReplayKey((k) => k + 1); }
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

      {screen === 'games' && <GamesMenu game={game} daily={daily} onOpenDaily={() => { play('pop'); setDailyClaimed(null); setDailyOpen(true); }} onBack={() => { play('swoosh'); setScreen('main'); }} onPlay={(id) => { play('swoosh'); setStartLevel(null); setReplayKey((k) => k + 1); setScreen(id); }} />}

      {screen === 'memoria' && <MemoryGame key={replayKey} pet={pet} cardPool={buildCardPool(pet)} progress={progressOf(game, 'memoria')} startLevel={startLevel} onBack={back} onComplete={(s, x) => finishGame('memoria', s, x)} />}
      {screen === 'atrapar' && <CatchGame key={replayKey} look={look} foods={pet.food_preferences || []} rank={progressOf(game, 'atrapar').rank} onBack={back} onComplete={(s, x) => finishGame('atrapar', s, x)} />}
      {screen === 'rompecabezas' && (
        <SlidingPuzzle
          key={replayKey}
          photos={(pet.photos || []).filter((p) => p.url).sort((a, b) => (a.used_for === 'puzzle' ? -1 : 0) - (b.used_for === 'puzzle' ? -1 : 0)).map((p) => p.url)}
          progress={progressOf(game, 'rompecabezas')} startLevel={startLevel}
          onBack={back} onComplete={(s, x) => finishGame('rompecabezas', s, x)}
        />
      )}
      {screen === 'topos' && <WhackGame key={replayKey} rank={progressOf(game, 'topos').rank} onBack={back} onComplete={(s, x) => finishGame('topos', s, x)} targets={whackTargets} />}
      {screen === 'serpiente' && (
        <SnakeGame
          key={replayKey} onBack={back} onComplete={(s, x) => finishGame('serpiente', s, x)} look={look} rank={progressOf(game, 'serpiente').rank}
          treat={foodSpriteFor(((pet.food_preferences || []).find((f) => f.preference === 'gusta') || {}).food_name || 'fresa')}
        />
      )}
      {screen === 'cruzar' && <CrossingGame key={replayKey} look={look} rank={progressOf(game, 'cruzar').rank} onBack={back} onComplete={(s, x) => finishGame('cruzar', s, x)} />}
      {screen === 'torre' && <TowerGame key={replayKey} rank={progressOf(game, 'torre').rank} onBack={back} onComplete={(s, x) => finishGame('torre', s, x)} />}
      {screen === 'trivia' && <TriviaGame key={replayKey} pet={pet} onBack={back} onComplete={(s, x) => finishGame('trivia', s, x)} />}
      {screen === 'simon' && <SimonGame key={replayKey} rank={progressOf(game, 'simon').rank} onBack={back} onComplete={(s, x) => finishGame('simon', s, x)} />}
      {screen === 'volar' && <FlyGame key={replayKey} look={look} rank={progressOf(game, 'volar').rank} onBack={back} onComplete={(s, x) => finishGame('volar', s, x)} />}
      {screen === 'golosinas' && <Match3Game key={replayKey} pet={pet} progress={progressOf(game, 'golosinas')} startLevel={startLevel} onBack={back} onComplete={(s, x) => finishGame('golosinas', s, x)} />}
      {screen === 'cocina' && <CookingGame key={replayKey} look={look} progress={progressOf(game, 'cocina')} startLevel={startLevel} onBack={back} onComplete={(s, x) => finishGame('cocina', s, x)} />}

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
                <span className="pg-keep-round" style={{ width: 7, height: 7, borderRadius: '50%', background: (MOOD_LABEL[displayMood] || MOOD_LABEL.normal).color, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 11, color: (MOOD_LABEL[displayMood] || MOOD_LABEL.normal).color, whiteSpace: 'nowrap' }}>
                  se siente {(MOOD_LABEL[displayMood] || MOOD_LABEL.normal).text}
                </span>
              </div>
            </div>
            {(pet.songs || []).length > 0 && (
              <RoundBtn active={musicOpen} activeColor={C.lavender} onClick={() => { play('pop'); setMusicOpen((v) => !v); }} label="Música">
                <IconMusic size={16} color={musicOpen ? C.onAccent : C.lavender} />
              </RoundBtn>
            )}
            {(game.lastLetterId || 0) > 0 && (
              <RoundBtn onClick={() => { play('pop'); setMailOpen(true); }} label="Cartas recibidas">
                <IconEnvelope size={16} color={C.roseDeep} />
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
          <div data-tut="room" style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
            <Room
              petName={pet.name} mood={displayMood} look={look}
              posters={posters} customDecor={pet.decor_items || []}
              game={game} setGame={setGame} editing={decorating}
              onPokePet={pokePet} reaction={reaction} cameraRef={cameraRef}
              parcel={parcelAtDoor(game)} onOpenParcel={() => { play('pop'); setUnboxOpen(true); }} summon={summon}
              world={{ phase, weather, lightsOff: asleep }} onToggleLights={toggleLights} asleep={asleep} cleanLevel={clean}
              eventLayer={<WorldEvents event={(game.events || {}).active} onResolve={resolveEvent} onTrickOrTreat={handleTrickOrTreat} onLetter={(l) => { setLetter(l); play('unbox'); }} onHip={() => { hipRef.current.at = Date.now(); play('pop'); fireReaction('happy'); setBubble({ text: '¡Hip!', tone: 'casual' }); }} />}
              paintJob={paintJob} onPaintDone={(job) => { if (job) { setGame((g) => ({ ...g, [job.kind === 'pared' ? 'wall' : 'floor']: job.value })); fireReaction('happy'); setBubble({ text: job.kind === 'pared' ? '¡Quedó precioso!' : '¡Qué piso tan lindo!', tone: 'gusta' }); } setPaintJob(null); }}
              fullBleed extraReserved={(foodOpen && !decorating ? 104 : 0) + (musicOpen ? 66 : 0)}
            />
            {flicker > 0 && <div key={flicker} className="pg-flicker" style={{ position: 'absolute', inset: 0, background: '#120C1E', pointerEvents: 'none', zIndex: 3 }} />}
            <div data-tut="meters" style={{ position: 'absolute', left: 12, top: 10, display: 'flex', flexDirection: 'column', gap: 5, pointerEvents: 'none', zIndex: 4 }}>
              <MiniMeter kind="hunger" value={hunger} icon={IconBowl} />
              <MiniMeter kind="love" value={love} icon={IconHeart} />
              <MiniMeter kind="energy" value={energy} icon={IconBolt} />
              <MiniMeter kind="clean" value={clean} icon={IconDrop} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 8, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 5, padding: '0 78px' }}>
              {paintJob ? null : cinematicAvailable ? (
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
            <ActionButton tut="dock-comer" icon={IconBowl} label="Alimentar" color={C.rose} active={foodOpen} onClick={() => { play('pop'); setFoodOpen((v) => !v); setDecorating(false); }} />
            <ActionButton icon={IconTub} label="Bañar" color={C.sky} onClick={enterBathroom} />
            <ActionButton tut="dock-jugar" icon={IconBall} label="Jugar" color={C.amber} onClick={() => { play('swoosh'); setScreen('games'); }} />
            <ActionButton icon={IconShirt} label="Vestir" color={C.peach} onClick={() => { play('swoosh'); setScreen('closet'); }} />
            <ActionButton icon={IconFrame} label={decorating ? 'Listo' : 'Decorar'} color={C.sage} active={decorating} onClick={() => { play('pop'); setDecorating((v) => !v); setFoodOpen(false); }} />
            <ActionButton tut="dock-tienda" icon={IconBag} label="Tienda" color={C.lavender} badge={season ? season.color : null} onClick={() => { play('swoosh'); setShopTab(season ? 'temporada' : 'moda'); setScreen('shop'); }} />
          </div>

          {decorating && (
            <div style={{ width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 12 }}>
              <DecorTrays posters={posters} customDecor={pet.decor_items || []} game={game} setGame={setGame} cameraRef={cameraRef} onGoShop={() => { play('swoosh'); setScreen('shop'); }} />
            </div>
          )}

          {foodOpen && !decorating && (
            <div data-tut="food" style={{ width: '100%', maxWidth: 560, padding: '0 14px', marginBottom: 12 }}>
              {(pet.food_preferences || []).length === 0 && !Object.values(game.fridge || {}).some((n) => n > 0) ? (
                <p style={{ fontSize: 12, color: C.inkFaint, textAlign: 'center' }}>Aún no hay comidas: compra en el Súper o cocina algo</p>
              ) : (
                <div className="flex gap-2 pg-scroll-x" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                  {Object.entries(game.fridge || {}).filter(([, n]) => n > 0).map(([id, n]) => {
                    const fd = findFood(id);
                    if (!fd) return null;
                    const sp = foodSpriteFor(fd.id);
                    return (
                      <button
                        key={`fr-${id}`} onClick={() => feed({ id, name: fd.name, food_name: fd.name, kind: fd.kind, fromFridge: true })} className="pg-focus pg-card"
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 7px', borderRadius: 14, cursor: 'pointer', flexShrink: 0, width: 84 }}
                      >
                        <span style={{ position: 'absolute', top: 3, right: 4, display: 'flex', alignItems: 'center', gap: 2, fontFamily: FONT.display, fontSize: 11, fontWeight: 800, color: C.inkSoft }}><IconFridge size={11} color={C.sky} />{n}</span>
                        <Sprite art={sp.render()} cacheKey={`food-${sp.id}`} w={38} h={38} />
                        <span style={{ fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: C.ink, textAlign: 'center', lineHeight: 1.12, width: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflowWrap: 'anywhere', minHeight: 25 }}>{fd.name}</span>
                      </button>
                    );
                  })}
                  {(pet.food_preferences || []).map((f, i) => (
                    <button
                      key={`${f.food_name}-${i}`} onClick={() => feed(f)} className="pg-focus pg-card"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 7px', borderRadius: 14, cursor: 'pointer', flexShrink: 0, width: 84 }}
                    >
                      {f.image
                        ? <Sprite src={f.image} w={38} h={38} kind="photo" style={{ borderRadius: 10, overflow: 'hidden' }} />
                        : <Sprite art={foodSpriteFor(f.food_name, i).render()} cacheKey={`food-${foodSpriteFor(f.food_name, i).id}`} w={38} h={38} />}
                      <span style={{ fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: C.ink, textAlign: 'center', lineHeight: 1.12, width: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflowWrap: 'anywhere', minHeight: 25 }}>{f.food_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tutorialActive && (
        <Tutorial
          step={tutorialStep} petName={pet.name} creatorName={pet.creator_name} look={look} foodOpen={foodOpen}
          canFeed={(pet.food_preferences || []).length > 0 || Object.values(game.fridge || {}).some((n) => n > 0)}
          onNext={() => tutorialNext(tutorialStep)} onSkip={tutorialSkip}
        />
      )}

      {mailOpen && (
        <MailArchive slug={slug} from={pet.creator_name} onClose={() => { play('pop'); setMailOpen(false); }} onOpen={(id) => openMailLetter(id)} />
      )}

      {dailyOpen && (
        <DailyGift
          status={daily} claimed={dailyClaimed} streakAfter={daily.ready ? (daily.streak || 0) + 1 : daily.streak}
          petName={pet.name} slug={slug} giftUrl={slug && slug !== 'demo' ? `${window.location.origin}/p/${slug}` : null}
          onClaim={claimDailyGift} onClose={() => { play('pop'); setDailyOpen(false); }}
        />
      )}

      {letter && (
        <LetterModal
          letter={letter} from={pet.creator_name} petName={pet.name}
          onClose={() => {
            const mail = letter.mail;
            setLetter(null);
            // las del buzón no son un suceso: no cierran el que esté pasando
            if (mail) { if (!letter.loading) { addVitals({ love: 10 }); fireReaction('love'); setBubble({ text: 'Qué lindo mensaje…', tone: 'gusta' }); } }
            else resolveEvent({ vitals: { love: 10 }, bubble: 'Qué lindo mensaje…', react: 'love' });
          }}
        />
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
