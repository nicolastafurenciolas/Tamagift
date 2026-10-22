import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader, HeaderTag, Hearts, Board, Toast } from '../ui';
import { play } from '../../sound';
import { FOOD_SPRITES } from '../../sprites';
import Sprite from '../Sprite';
import { PetSprite, FoodSprite, useElementWidth } from './common';
import { useFinish } from './meta';

// ── Atrapa la comida ──────────────────────────────────────────────
// Cae comida; hay que atrapar SOLO lo que le gusta. Atrapar algo que
// odia cuesta una vida.
//
// La física trabaja en un tablero fijo de 300×380 unidades y se dibuja
// en porcentajes, para encogerse entera en un celular bajo.

const AREA_W = 300;
const AREA_H = 380;
const CATCHER_Y = 335;
const CATCH_RADIUS = 32;
const DURATION = 25;

export default function CatchGame({ look, foods = [], onBack, onComplete }) {
  const [catcherX, setCatcherX] = useState(150);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [badFlash, setBadFlash] = useState(null);
  const itemsRef = useRef([]);
  const nextIdRef = useRef(0);
  const catcherXRef = useRef(150);
  const scoreRef = useRef(0);
  const { finish, later } = useFinish(onComplete);
  const [boardRef, boardW] = useElementWidth(300);

  // Qué puede caer: sus comidas con foto (sabiendo cuáles odia). Hace
  // falta al menos una que le guste, si no el juego no tendría cómo
  // sumar; en ese caso se agregan comidas dibujadas.
  const dropPool = useRef((() => {
    const real = foods.filter((f) => f.image).map((f) => ({ image: f.image, bad: f.preference === 'no_gusta', label: f.food_name }));
    if (real.some((f) => !f.bad)) return real;
    return [...real, ...FOOD_SPRITES.filter((f) => f.id !== 'brocoli').map((f) => ({ sprite: f, bad: false }))];
  })()).current;

  useEffect(() => { catcherXRef.current = catcherX; }, [catcherX]);

  // Dificultad progresiva: al principio cae poco y lento; al final llueve.
  const elapsed = DURATION - timeLeft;
  const fallSpeed = 7 + elapsed * 0.32;
  const spawnMs = Math.max(380, 900 - elapsed * 22);

  useEffect(() => {
    if (gameOver) return undefined;
    const spawn = setInterval(() => {
      const drop = dropPool[Math.floor(Math.random() * dropPool.length)];
      nextIdRef.current += 1;
      itemsRef.current = [...itemsRef.current, { id: nextIdRef.current, x: 30 + Math.random() * (AREA_W - 60), y: -20, ...drop }];
      setItems(itemsRef.current);
    }, spawnMs);
    return () => clearInterval(spawn);
  }, [gameOver, spawnMs, dropPool]);

  // Caída. El estado se calcula primero y los efectos (sonido, vidas,
  // puntos) se aplican DESPUÉS: dentro de un "updater" de React corrían
  // dos veces en modo estricto y daban puntos dobles.
  useEffect(() => {
    if (gameOver) return undefined;
    const tick = setInterval(() => {
      const caughtGood = [];
      const caughtBad = [];
      const next = [];
      for (const item of itemsRef.current) {
        const ny = item.y + fallSpeed;
        const inBand = ny >= CATCHER_Y - 12 && ny <= CATCHER_Y + 18;
        if (inBand && Math.abs(item.x - catcherXRef.current) < CATCH_RADIUS) {
          (item.bad ? caughtBad : caughtGood).push(item);
          continue;
        }
        if (ny > AREA_H + 10) continue;   // dejarla caer no cuesta vida
        next.push({ ...item, y: ny });
      }
      itemsRef.current = next;
      setItems(next);
      if (caughtGood.length) {
        play('good');
        scoreRef.current += caughtGood.length;
        setScore(scoreRef.current);
      }
      if (caughtBad.length) {
        play('bad');
        setLives((v) => v - caughtBad.length);
        setBadFlash({ key: Date.now(), label: caughtBad[0].label });
        later(() => setBadFlash(null), 900);
      }
    }, 55);
    return () => clearInterval(tick);
  }, [gameOver, fallSpeed, later]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) { setGameOver(true); }
  }, [lives, gameOver]);

  useEffect(() => {
    if (gameOver) return undefined;
    if (timeLeft <= 0) { setGameOver(true); return undefined; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) finish(scoreRef.current, 500);
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

  return (
    <Screen>
      <ScreenHeader
        title="Atrapa la comida" subtitle="Atrapa solo lo que le gusta" onBack={onBack}
        right={<HeaderTag color={C.rose}>{gameOver ? '' : `${timeLeft}s`}</HeaderTag>}
      />
      <div style={{ marginBottom: 8 }}><Hearts lives={lives} /></div>
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
            }}
          >
            {item.image ? (
              <Sprite src={item.image} w={itemPx} h={itemPx} kind="photo" className="pg-keep-round" style={{ borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 2px ${C.ink}` }} />
            ) : (
              <FoodSprite food={item.sprite} size={itemPx} />
            )}
          </div>
        ))}
        {/* el piso donde camina la mascota */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '9%', background: `linear-gradient(180deg, ${C.ground1}, ${C.ground2})`, borderTop: `2px solid ${C.ink}` }} />
        {!gameOver && (
          <div style={{
            position: 'absolute', left: `${(catcherX / AREA_W) * 100}%`, top: `${((CATCHER_Y - 24) / AREA_H) * 100}%`,
            transform: 'translateX(-50%)', transition: 'left 0.12s',
          }}>
            <PetSprite look={look} mood="feliz" size={petPx} />
          </div>
        )}
        {badFlash && (
          <div key={badFlash.key} style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%,-50%)' }}>
            <Toast>{badFlash.label ? `¡Ugh, ${badFlash.label}! −1 vida` : '¡Eso no me gusta! −1 vida'}</Toast>
          </div>
        )}
      </Board>
      <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 10, fontFamily: FONT.display, fontWeight: 700 }}>Puntos: {score} · arrastra para moverte</p>
    </Screen>
  );
}
