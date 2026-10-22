import React, { useEffect, useRef, useState } from 'react';
import { C, FONT, SHADOW, tint } from '../../theme';
import { Screen, ScreenHeader, Badge, Board, Toast } from '../ui';
import { IconFlame } from '../icons';
import { play } from '../../sound';
import { TOWER, resolveDrop } from '../../towerLogic';
import { useFinish } from './meta';

// ── Torre de pastel ───────────────────────────────────────────────
// Un toque suelta el piso de pastel. Clavarlo justo encima devuelve
// ancho; clavar varios seguidos da puntos extra (×2 desde el segundo).

const W = 300;
const BLOCK_H = 20;
// Sabores: bizcocho y glaseado (colores del pastel, no de la interfaz).
const FLAVORS = [
  { cake: '#F6D9A6', icing: '#FFFFFF' },  // vainilla
  { cake: '#F4A7B9', icing: '#FFF4F7' },  // fresa
  { cake: '#7E4E3A', icing: '#FFD3E2' },  // chocolate
  { cake: '#B9D89A', icing: '#FFF8E8' },  // matcha
  { cake: '#B8B2EC', icing: '#FFFFFF' },  // arándano
];

function Block({ x, w, flavor, perfect, moving }) {
  const f = FLAVORS[flavor % FLAVORS.length];
  return (
    <div style={{
      position: 'absolute', left: `${(x / W) * 100}%`, width: `${(w / W) * 100}%`, height: BLOCK_H - 1, borderRadius: 5,
      background: `linear-gradient(180deg, ${f.icing} 0 6px, ${f.cake} 6px calc(100% - 7px), ${tint(f.cake, 0.25)} calc(100% - 7px) calc(100% - 5px), ${f.cake} calc(100% - 5px) 100%)`,
      border: `2px solid ${perfect ? C.amber : C.ink}`,
      boxShadow: moving ? `${SHADOW.lifted}` : perfect ? `0 0 10px ${C.amberSoft}` : 'none',
    }}>
      {/* chorreado del glaseado */}
      <div style={{ position: 'absolute', left: 2, right: 2, top: 5, height: 6, backgroundImage: `radial-gradient(circle at 5px 0, ${f.icing} 3.6px, transparent 4px)`, backgroundSize: '13px 6px', backgroundRepeat: 'repeat-x' }} />
      <div style={{ position: 'absolute', left: 5, right: 5, top: 1.5, height: 2, background: 'rgba(255,255,255,0.8)', borderRadius: 2 }} />
    </div>
  );
}

export default function TowerGame({ onBack, onComplete, rank = 1 }) {
  const [blocks, setBlocks] = useState([{ x: 90, w: TOWER.START_W }]);
  const [cur, setCur] = useState({ x: 0, w: TOWER.START_W, dir: 1 });
  const [over, setOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [perfectFlash, setPerfectFlash] = useState(null);
  const curRef = useRef(cur); curRef.current = cur;
  const overRef = useRef(over); overRef.current = over;
  const blocksRef = useRef(blocks); blocksRef.current = blocks;
  const streakRef = useRef(0);
  const bonusRef = useRef(0);
  const [bonus, setBonus] = useState(0);
  const maxPerfect = useRef(0);
  const { finish, later } = useFinish(onComplete);
  const speed = 120 + (rank - 1) * 10 + blocks.length * 11;

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
    if (overRef.current) return;
    const list = blocksRef.current;
    const r = resolveDrop(list[list.length - 1], curRef.current, W);
    if (r.lost) {
      play('bad');
      setOver(true);
      finish(list.length - 1 + bonusRef.current, 600, { stats: { maxPerfect: maxPerfect.current, floors: list.length - 1 } });
      return;
    }
    if (r.perfect) {
      play('good');
      streakRef.current += 1;
      setStreak(streakRef.current);
      maxPerfect.current = Math.max(maxPerfect.current, streakRef.current);
      if (streakRef.current >= 2) { bonusRef.current += streakRef.current - 1; setBonus(bonusRef.current); }
      setPerfectFlash({ key: Date.now(), streak: streakRef.current });
      later(() => setPerfectFlash(null), 700);
    } else {
      play('pop');
      streakRef.current = 0;
      setStreak(0);
    }
    setBlocks((b) => [...b, { ...r.block, perfect: r.perfect }]);
    setCur({ x: 0, w: r.block.w, dir: 1 });
  }

  const floors = blocks.length - 1;
  const score = floors + bonus;

  return (
    <Screen>
      <ScreenHeader title="Torre de pastel" subtitle="Clávalo justo encima: recuperas ancho y ganas extra" onBack={onBack} />
      <div style={{ display: 'flex', gap: 18, marginBottom: 8, alignItems: 'center', minHeight: 34 }}>
        <Badge label="Puntos" value={score} />
        <Badge label="Pisos" value={floors} color={C.inkSoft} />
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconFlame size={18} color={C.peach} fill={C.amberSoft} />
            <Badge label="Seguidos" value={streak} color={C.peach} />
          </div>
        )}
      </div>
      <Board
        onPointerDown={drop}
        style={{ width: '100%', maxWidth: 330, height: 'min(330px, 52vh)', borderRadius: 18, background: `linear-gradient(180deg, ${C.sky1}, ${C.sky2})`, cursor: over ? 'default' : 'pointer', touchAction: 'manipulation' }}
      >
        {perfectFlash && (
          <div key={perfectFlash.key} style={{ position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)', zIndex: 5 }}>
            <Toast color={C.sage}>¡PERFECTO!{perfectFlash.streak > 1 ? ` ×${perfectFlash.streak} · +${perfectFlash.streak - 1}` : ' +ancho'}</Toast>
          </div>
        )}
        {/* mientras más alta la torre, más arriba en el cielo: llega la noche */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(40,30,90,0.7), rgba(120,80,160,0.25))', opacity: Math.min(1, Math.max(0, (floors - 12) / 14)), transition: 'opacity 1s' }} />
        {/* plato del pastel */}
        <div style={{ position: 'absolute', left: '18%', right: '18%', bottom: 2, height: 10, borderRadius: '50%', background: '#FFFFFF', border: `2px solid ${C.ink}`, transform: `translateY(${Math.max(0, blocks.length * BLOCK_H - 200)}px)`, transition: 'transform 0.18s' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, transform: `translateY(${Math.max(0, blocks.length * BLOCK_H - 200)}px)`, transition: 'transform 0.18s' }}>
          {blocks.map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: i * BLOCK_H, height: BLOCK_H }}>
              <Block x={b.x} w={b.w} flavor={i} perfect={b.perfect} />
            </div>
          ))}
          {!over && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: blocks.length * BLOCK_H, height: BLOCK_H }}>
              <Block x={cur.x} w={cur.w} flavor={blocks.length} moving />
            </div>
          )}
        </div>
        {over && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.glass }}>
            <p style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, marginBottom: 4, color: C.ink }}>{floors} pisos · {score} puntos</p>
            <p style={{ fontSize: 13, color: C.inkSoft }}>Se cayó el pastel</p>
          </div>
        )}
      </Board>
      {!over && <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 10, textAlign: 'center' }}>Toca el tablero para soltar el bloque</p>}
    </Screen>
  );
}
