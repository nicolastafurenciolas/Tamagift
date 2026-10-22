import { useCallback, useEffect, useRef } from 'react';
import { C } from '../../theme';
import {
  IconHeart, IconCards, IconCookie, IconSparkle, IconPaw, IconCatch,
  IconPuzzle, IconMole, IconSnake, IconRoad, IconTower,
} from '../icons';

// ─────────────────────────────────────────────────────────────────
// Catálogo de minijuegos: lo que define a cada uno (cuánto paga, cuánto
// amor da, qué se dice al terminar) en un solo lugar.
//
// `id` es estable y es la llave del récord en gameState: no cambiarlo
// aunque se renombre el juego de cara a quien juega.
// ─────────────────────────────────────────────────────────────────

export const GAME_META = {
  memoria: {
    title: 'Encuentra las parejas', unit: 'movimientos', lowerIsBetter: true,
    coins: (s) => Math.min(40, Math.max(12, 42 - s)), love: 10, done: '¡Las encontraste todas!',
  },
  atrapar: {
    title: 'Atrapa la comida', unit: 'atrapadas',
    coins: (s) => Math.min(45, Math.round(s * 1.6)), love: 8, done: '¡Buena atrapada!',
  },
  rompecabezas: {
    title: 'Rompecabezas', unit: 'movimientos', lowerIsBetter: true,
    coins: (s) => Math.min(55, Math.max(18, 85 - s)), love: 10, done: '¡Armaste la foto!',
  },
  topos: {
    title: 'Dale al que salga', unit: 'aciertos',
    coins: (s) => Math.min(45, Math.round(s * 1.5)), love: 5, done: '¡Qué reflejos!',
  },
  serpiente: {
    title: 'Serpiente golosa', unit: 'comidas',
    coins: (s) => Math.min(50, s * 2), love: 5, done: '¡Buena partida!',
  },
  cruzar: {
    title: 'Cruzar la calle', unit: 'cruces',
    coins: (s) => Math.min(50, s * 5), love: 6, done: '¡Lo lograste!',
  },
  torre: {
    title: 'Torre de bloques', unit: 'pisos',
    coins: (s) => Math.min(45, s * 2), love: 6, done: '¡Qué pulso!',
  },
  trivia: {
    // Las preguntas son siempre las mismas: después de la primera
    // partida del día ya se saben las respuestas, así que repetirla
    // paga mucho menos (ver replayFactor).
    title: 'Trivia del corazón', unit: 'aciertos', fixedAnswers: true,
    coins: (s) => Math.min(60, s * 8), love: 12, done: '¡Nos conocemos bien!',
  },
  simon: {
    title: 'Simón dice', unit: 'de secuencia',
    coins: (s) => Math.min(50, s * 5), love: 6, done: '¡Qué memoria!',
  },
  volar: {
    title: 'Salta y vuela', unit: 'obstáculos',
    coins: (s) => Math.min(50, s * 4), love: 6, done: '¡Buen vuelo!',
  },
  golosinas: {
    title: 'Conecta 3 golosinas', unit: 'golosinas',
    coins: (s) => Math.min(55, Math.round(s * 0.9)), love: 8, done: '¡Qué combos!',
  },
};

// Lista del menú. Los colores son tokens: cambian con el estilo.
export const GAME_LIST = [
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

// Cuánto paga una partida según cuántas se jugaron HOY de ese juego.
// Sin esto, repetir el juego más rentable en bucle compraba todo en
// minutos y la tienda dejaba de tener sentido.
export function replayFactor(gameId, playsToday) {
  if (GAME_META[gameId]?.fixedAnswers) return playsToday === 0 ? 1 : 0.25;
  if (playsToday < 3) return 1;
  if (playsToday < 6) return 0.6;
  return 0.3;
}

// Fin de partida a prueba de todo:
//  · el aviso al padre se hace una sola vez,
//  · se usa SIEMPRE la versión más nueva de `onComplete` (antes, si el
//    padre se redibujaba durante la pausa final, el temporizador se
//    cancelaba y la partida terminaba sin resultado ni monedas),
//  · y si la persona sale del juego antes, no llega ningún resultado
//    fantasma a otra pantalla.
export function useFinish(onComplete) {
  const cb = useRef(onComplete);
  cb.current = onComplete;
  const done = useRef(false);
  const timers = useRef([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);
  const finish = useCallback((score, delay = 500) => {
    if (done.current) return;
    done.current = true;
    later(() => cb.current(score), delay);
  }, [later]);
  return { finish, later, done };
}
