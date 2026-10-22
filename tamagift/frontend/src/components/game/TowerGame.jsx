import React, { useEffect, useRef, useState } from 'react';
import { C, FONT, SHADOW, tint } from '../../theme';
import { Screen, ScreenHeader, Badge, Board, Toast } from '../ui';
import { IconFlame } from '../icons';
import { play } from '../../sound';
import { TOWER, resolveDrop } from '../../towerLogic';
import { useFinish } from './meta';

// ── Torre de bloques ──────────────────────────────────────────────
// Un toque suelta el bloque. Clavarlo justo encima devuelve ancho.

const W = 300;
const BLOCK_H = 18;
const COLORS = [C.rose, C.amber, C.sage, C.sky, C.lavender];

function Block({ x, w, color, perfect, moving }) {
  return (
    <div style={{
      position: 'absolute', left: `${(x / W) * 100}%`, width: `${(w / W) * 100}%`, height: BLOCK_H - 1, borderRadius: 4,
      background: `linear-gradient(180deg, ${tint(color, 0.4)} 0 5px, ${color} 5px calc(100% - 4px), ${tint(color, -0.2)} calc(100% - 4px) 100%)`,
      border: `2px solid ${perfect ? C.amber : C.ink}`,
      boxShadow: moving ? `${SHADOW.lifted}` : perfect ? `0 0 10px ${C.amberSoft}` : 'none',
    }}>
      <div style={{ position: 'absolute', inset: '2px 4px auto 4px', height: 3, background: 'rgba(255,255,255,0.55)', borderRadius: 2 }} />
    </div>
  );
}

export default function TowerGame({ onBack, onComplete }) {
  const [blocks, setBlocks] = useState([{ x: 90, w: TOWER.START_W }]);
  const [cur, setCur] = useState({ x: 0, w: TOWER.START_W, dir: 1 });
  const [over, setOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [perfectFlash, setPerfectFlash] = useState(null);
  const curRef = useRef(cur); curRef.current = cur;
  const overRef = useRef(over); overRef.current = over;
  const blocksRef = useRef(blocks); blocksRef.current = blocks;
  const streakRef = useRef(0);
  const { finish, later } = useFinish(onComplete);
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
    if (overRef.current) return;
    const list = blocksRef.current;
    const r = resolveDrop(list[list.length - 1], curRef.current, W);
    if (r.lost) {
      play('bad');
      setOver(true);
      finish(list.length - 1, 600);
      return;
    }
    if (r.perfect) {
      play('good');
      streakRef.current += 1;
      setStreak(streakRef.current);
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

  const score = blocks.length - 1;

  return (
    <Screen>
      <ScreenHeader title="Torre de bloques" subtitle="Clávalo justo encima y recuperas ancho" onBack={onBack} />
      <div style={{ display: 'flex', gap: 18, marginBottom: 8, alignItems: 'center', minHeight: 34 }}>
        <Badge label="Pisos" value={score} />
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
            <Toast color={C.sage}>¡PERFECTO!{perfectFlash.streak > 1 ? ` ×${perfectFlash.streak}` : ''} +ancho</Toast>
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: `linear-gradient(180deg, ${C.ground1}, ${C.ground2})` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, transform: `translateY(${Math.max(0, blocks.length * BLOCK_H - 200)}px)`, transition: 'transform 0.18s' }}>
          {blocks.map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: i * BLOCK_H, height: BLOCK_H }}>
              <Block x={b.x} w={b.w} color={COLORS[i % COLORS.length]} perfect={b.perfect} />
            </div>
          ))}
          {!over && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: blocks.length * BLOCK_H, height: BLOCK_H }}>
              <Block x={cur.x} w={cur.w} color={COLORS[blocks.length % COLORS.length]} moving />
            </div>
          )}
        </div>
        {over && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.glass }}>
            <p style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, marginBottom: 4, color: C.ink }}>{score} pisos</p>
            <p style={{ fontSize: 13, color: C.inkSoft }}>Se cayó la torre</p>
          </div>
        )}
      </Board>
      {!over && <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 10, textAlign: 'center' }}>Toca el tablero para soltar el bloque</p>}
    </Screen>
  );
}
