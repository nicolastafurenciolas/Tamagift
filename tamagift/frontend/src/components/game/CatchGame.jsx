import React, { useEffect, useRef, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Hearts, Board, Toast } from '../ui';
import { play } from '../../sound';
import { FOOD_SPRITES } from '../../sprites';
import Sprite from '../Sprite';
import { PetSprite, FoodSprite, useElementWidth } from './common';
import { useFinish } from './meta';
import { powerSvg } from '../../art/minigames';

// ── Atrapa la comida ──────────────────────────────────────────────
// Cae comida; hay que atrapar SOLO lo que le gusta. Atrapar algo que
// odia cuesta una vida. Atrapar seguido arma combo (puntos ×2, ×3) y
// dejar caer una buena lo corta. De vez en cuando cae un poder:
//   imán (atrae lo bueno) · escudo (perdona una mala) · reloj (+5 s)
//   doble (puntos ×2 un rato). Y a veces una comida dorada vale 3.
//
// La física trabaja en un tablero fijo de 300×380 unidades y se dibuja
// en porcentajes, para encogerse entera en un celular bajo.

const AREA_W = 300;
const AREA_H = 380;
const CATCHER_Y = 335;
const CATCH_RADIUS = 32;
const DURATION = 30;
const POWERS = ['iman', 'escudo', 'reloj', 'doble'];
const POWER_LABEL = { iman: '¡Imán!', escudo: '¡Escudo!', reloj: '+5 segundos', doble: '¡Puntos dobles!' };
const POWER_TIME = { iman: 6, doble: 7 };

export default function CatchGame({ look, foods = [], onBack, onComplete, rank = 1 }) {
  const [catcherX, setCatcherX] = useState(150);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState(null);
  const [combo, setCombo] = useState(0);
  const [active, setActive] = useState({});   // { iman: segundosRestantes, doble: …, escudo: true }
  const itemsRef = useRef([]);
  const nextIdRef = useRef(0);
  const catcherXRef = useRef(150);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const activeRef = useRef({});
  const stats = useRef({ livesLost: 0, maxCombo: 0, powerups: 0, golden: 0 });
  const { finish, later } = useFinish(onComplete);
  const [boardRef, boardW] = useElementWidth(300);

  const dropPool = useRef((() => {
    const real = foods.filter((f) => f.image).map((f) => ({ image: f.image, bad: f.preference === 'no_gusta', label: f.food_name }));
    if (real.some((f) => !f.bad)) return real;
    return [...real, ...FOOD_SPRITES.filter((f) => f.id !== 'brocoli').map((f) => ({ sprite: f, bad: false }))];
  })()).current;

  useEffect(() => { catcherXRef.current = catcherX; }, [catcherX]);
  const setActiveBoth = (a) => { activeRef.current = a; setActive(a); };

  // Dificultad: sube con el tiempo de la partida y con el rango.
  const elapsed = DURATION - timeLeft;
  const fallSpeed = 7 + (rank - 1) * 0.55 + elapsed * 0.3;
  const spawnMs = Math.max(340, 880 - (rank - 1) * 35 - elapsed * 20);

  useEffect(() => {
    if (gameOver) return undefined;
    const spawn = setInterval(() => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;
      const x = 30 + Math.random() * (AREA_W - 60);
      let item;
      const hasPower = itemsRef.current.some((it) => it.power);
      if (!hasPower && Math.random() < 0.07) item = { id, x, y: -20, power: POWERS[Math.floor(Math.random() * POWERS.length)] };
      else {
        const drop = dropPool[Math.floor(Math.random() * dropPool.length)];
        item = { id, x, y: -20, ...drop, golden: !drop.bad && Math.random() < 0.08 };
      }
      itemsRef.current = [...itemsRef.current, item];
      setItems(itemsRef.current);
    }, spawnMs);
    return () => clearInterval(spawn);
  }, [gameOver, spawnMs, dropPool]);

  function say(text, color) {
    setFlash({ key: Date.now() + Math.random(), text, color });
    later(() => setFlash(null), 900);
  }

  // Caída. El estado se calcula primero y los efectos se aplican DESPUÉS
  // (dentro de un "updater" de React corrían dos veces en modo estricto).
  useEffect(() => {
    if (gameOver) return undefined;
    const tick = setInterval(() => {
      const caught = [];
      const next = [];
      let missedGood = false;
      const magnet = activeRef.current.iman > 0;
      for (const item of itemsRef.current) {
        let nx = item.x;
        if (magnet && !item.bad && !item.power && item.y > 60) nx += Math.sign(catcherXRef.current - item.x) * Math.min(6, Math.abs(catcherXRef.current - item.x));
        const ny = item.y + fallSpeed;
        const inBand = ny >= CATCHER_Y - 12 && ny <= CATCHER_Y + 18;
        if (inBand && Math.abs(nx - catcherXRef.current) < CATCH_RADIUS) { caught.push(item); continue; }
        if (ny > AREA_H + 10) { if (!item.bad && !item.power) missedGood = true; continue; }
        next.push({ ...item, x: nx, y: ny });
      }
      itemsRef.current = next;
      setItems(next);
      if (missedGood && comboRef.current > 0) { comboRef.current = 0; setCombo(0); }
      for (const it of caught) {
        if (it.power) {
          play('win');
          stats.current.powerups += 1;
          const a = { ...activeRef.current };
          if (it.power === 'reloj') setTimeLeft((s) => s + 5);
          else if (it.power === 'escudo') a.escudo = true;
          else a[it.power] = POWER_TIME[it.power];
          setActiveBoth(a);
          say(POWER_LABEL[it.power], C.sage);
        } else if (it.bad) {
          if (activeRef.current.escudo) {
            play('pop');
            setActiveBoth({ ...activeRef.current, escudo: false });
            say('¡El escudo te salvó!', C.sky);
          } else {
            play('bad');
            stats.current.livesLost += 1;
            setLives((v) => v - 1);
            comboRef.current = 0; setCombo(0);
            say(it.label ? `¡Ugh, ${it.label}! −1 vida` : '¡Eso no me gusta! −1 vida', C.rose);
          }
        } else {
          comboRef.current += 1;
          setCombo(comboRef.current);
          stats.current.maxCombo = Math.max(stats.current.maxCombo, comboRef.current);
          const mult = Math.min(3, 1 + Math.floor(comboRef.current / 5)) * (activeRef.current.doble > 0 ? 2 : 1);
          const pts = (it.golden ? 3 : 1) * mult;
          if (it.golden) { stats.current.golden += 1; play('coin'); } else play('good');
          scoreRef.current += pts;
          setScore(scoreRef.current);
          if (comboRef.current > 0 && comboRef.current % 5 === 0) say(`¡Combo ${comboRef.current}! ×${Math.min(3, 1 + Math.floor(comboRef.current / 5))}`, C.amber);
        }
      }
    }, 55);
    return () => clearInterval(tick);
  }, [gameOver, fallSpeed, later]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) setGameOver(true);
  }, [lives, gameOver]);

  // Reloj de la partida y de los poderes.
  useEffect(() => {
    if (gameOver) return undefined;
    if (timeLeft <= 0) { setGameOver(true); return undefined; }
    const t = setTimeout(() => {
      setTimeLeft((s) => s - 1);
      const a = { ...activeRef.current };
      let changed = false;
      ['iman', 'doble'].forEach((k) => { if (a[k] > 0) { a[k] -= 1; changed = true; } });
      if (changed) setActiveBoth(a);
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) finish(scoreRef.current, 500, { stats: { ...stats.current } });
  }, [gameOver, finish]);

  function dragMove(e) {
    if (gameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * AREA_W;
    setCatcherX(Math.max(28, Math.min(AREA_W - 28, x)));
  }

  const k = boardW / AREA_W;
  const itemPx = Math.max(22, Math.round(32 * k));
  const petPx = Math.max(40, Math.round(56 * k));
  const mult = Math.min(3, 1 + Math.floor(combo / 5)) * (active.doble > 0 ? 2 : 1);

  return (
    <Screen>
      <ScreenHeader
        title="Atrapa la comida" subtitle="Atrapa solo lo que le gusta" onBack={onBack}
        right={<HeaderTag color={timeLeft <= 5 ? C.rose : C.ink}>{gameOver ? '' : `${timeLeft}s`}</HeaderTag>}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, minHeight: 26 }}>
        <Hearts lives={lives} />
        {['escudo', 'iman', 'doble'].filter((p) => active[p]).map((p) => (
          <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontFamily: FONT.display, fontSize: 11, fontWeight: 800, color: C.inkSoft }}>
            <Sprite markup={powerSvg(p)} cacheKey={`pw-${p}`} w={22} h={22} />{p !== 'escudo' ? `${active[p]}s` : ''}
          </span>
        ))}
      </div>
      <Board
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragMove(e); }}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') dragMove(e); }}
        style={{
          height: `min(${AREA_H}px, 56vh)`, aspectRatio: `${AREA_W} / ${AREA_H}`, maxWidth: '86vw',
          background: `linear-gradient(180deg, ${C.sky1}, ${C.sky2})`,
        }}
      >
        <div ref={boardRef} style={{ position: 'absolute', inset: 0 }} />
        {!gameOver && items.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute', left: `${(item.x / AREA_W) * 100}%`, top: `${(item.y / AREA_H) * 100}%`,
              transform: 'translateX(-50%)', width: itemPx, height: itemPx,
              filter: item.golden ? `drop-shadow(0 0 6px ${C.amber}) drop-shadow(0 0 2px #fff)` : item.power ? `drop-shadow(0 0 5px #fff)` : undefined,
              animation: item.power ? 'pg-breathe 0.8s ease-in-out infinite' : undefined,
            }}
          >
            {item.power ? (
              <Sprite markup={powerSvg(item.power)} cacheKey={`pw-${item.power}`} w={itemPx} h={itemPx} />
            ) : item.image ? (
              <Sprite src={item.image} w={itemPx} h={itemPx} kind="photo" className="pg-keep-round" style={{ borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 2px ${item.golden ? C.amber : C.ink}` }} />
            ) : (
              <FoodSprite food={item.sprite} size={itemPx} />
            )}
          </div>
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '9%', background: `linear-gradient(180deg, ${C.ground1}, ${C.ground2})`, borderTop: `2px solid ${C.ink}` }} />
        {!gameOver && (
          <div style={{
            position: 'absolute', left: `${(catcherX / AREA_W) * 100}%`, top: `${((CATCHER_Y - 24) / AREA_H) * 100}%`,
            transform: 'translateX(-50%)', transition: 'left 0.12s',
            filter: active.escudo ? `drop-shadow(0 0 8px ${C.sky})` : active.iman > 0 ? `drop-shadow(0 0 8px ${C.rose})` : undefined,
          }}>
            {combo >= 3 && (
              <div style={{ position: 'absolute', left: '50%', top: -18, transform: 'translateX(-50%)', fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.onAccent, background: C.amber, borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap', boxShadow: SHADOW.soft }}>
                {combo} {mult > 1 ? `×${mult}` : ''}
              </div>
            )}
            <PetSprite look={look} mood="feliz" size={petPx} />
          </div>
        )}
        {flash && (
          <div key={flash.key} style={{ position: 'absolute', left: '50%', top: '36%', transform: 'translate(-50%,-50%)', zIndex: 5 }}>
            <Toast color={flash.color}>{flash.text}</Toast>
          </div>
        )}
      </Board>
      <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 10, fontFamily: FONT.display, fontWeight: 700 }}>Puntos: {score} · arrastra para moverte</p>
    </Screen>
  );
}
