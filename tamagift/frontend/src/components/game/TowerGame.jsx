import React, { useEffect, useRef, useState } from 'react';
import { C, FONT } from '../../theme';
import { Screen, ScreenHeader, Badge, Board, Toast } from '../ui';
import { IconFlame } from '../icons';
import { play } from '../../sound';
import { TOWER, resolveDrop } from '../../towerLogic';
import { useFinish } from './meta';
import Sprite, { useStyledUrl } from '../Sprite';
import { cakeLayerSvg, cakeStandSvg, towerBgSvg, TOWER_BG, TOWER_CHUNKS } from '../../art/minigames';

// ── Torre de pastel ───────────────────────────────────────────────
// Un toque suelta el piso de pastel. Clavarlo justo encima devuelve
// ancho; clavar varios seguidos da puntos extra (×2 desde el segundo).
//
// El pastel se arma sobre una bandeja en medio de una plaza; al crecer,
// el fondo (art/minigames.js: towerBgSvg) baja más lento que la torre:
// pasan los techos, las nubes, el atardecer y llega la noche.

const W = 300;
const BLOCK_H = 22;
const BASE = 34;          // alto de la bandeja: ahí apoya el primer piso
const PARALLAX = 0.8;

// Un piso de pastel dibujado a su ancho. Mientras se dibuja el ancho
// nuevo se sigue viendo el anterior (estirado un instante), así el piso
// no parpadea al soltarlo.
function Block({ x, w, flavor, perfect, moving, boardW }) {
  const px = Math.max(8, Math.round(((w / W) * boardW) / 2) * 2);
  const r = useStyledUrl({ markup: cakeLayerSvg(px, flavor), w: px, h: BLOCK_H, pixel: 2, sourceKey: `cake-${flavor}-${px}` });
  const last = useRef(null);
  if (r) last.current = r;
  const img = r || last.current;
  return (
    <div style={{
      position: 'absolute', left: `${(x / W) * 100}%`, width: `${(w / W) * 100}%`, height: BLOCK_H,
      filter: perfect ? `drop-shadow(0 0 4px ${C.amber})` : moving ? 'drop-shadow(0 4px 3px rgba(42,28,36,0.28))' : undefined,
    }}>
      {img && <img src={img.url} alt="" draggable="false" className={`pg-sprite${img.pixelated ? ' pg-pixelated' : ''}`} style={{ width: '100%', height: '100%' }} />}
    </div>
  );
}

function useBoxSize(fallback) {
  const ref = useRef(null);
  const [box, setBox] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setBox({ w: Math.round(el.clientWidth) || fallback.w, h: Math.round(el.clientHeight) || fallback.h });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, box];
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
  const [boxRef, box] = useBoxSize({ w: 330, h: 330 });
  const lift = Math.max(0, blocks.length * BLOCK_H - 200);
  // el fondo, en px de pantalla
  const sc = box.w / TOWER_BG.W;
  const chunkPx = Math.round(TOWER_BG.CHUNK * sc);
  const bgShift = Math.min(lift * PARALLAX, Math.max(0, TOWER_CHUNKS * chunkPx - box.h));

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
        style={{ width: '100%', maxWidth: 330, height: 'min(330px, 52vh)', borderRadius: 18, background: C.sky2, cursor: over ? 'default' : 'pointer', touchAction: 'manipulation' }}
      >
        <div ref={boxRef} style={{ position: 'absolute', inset: 0 }} />
        {Array.from({ length: TOWER_CHUNKS }, (_, k) => {
          const bottom = k * chunkPx - bgShift;
          if (bottom > box.h || bottom + chunkPx < 0) return null;
          return (
            <div key={k} style={{ position: 'absolute', left: 0, bottom, width: box.w, height: chunkPx, transition: 'bottom 0.18s', pointerEvents: 'none' }}>
              <Sprite markup={towerBgSvg(k)} cacheKey={`tw-bg-${k}`} w={box.w} h={chunkPx} kind="surface" />
            </div>
          );
        })}
        {perfectFlash && (
          <div key={perfectFlash.key} style={{ position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)', zIndex: 5 }}>
            <Toast color={C.sage}>¡PERFECTO!{perfectFlash.streak > 1 ? ` ×${perfectFlash.streak} · +${perfectFlash.streak - 1}` : ' +ancho'}</Toast>
          </div>
        )}
        {/* bandeja del pastel */}
        <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: `translate(-50%, ${lift}px)`, transition: 'transform 0.18s', pointerEvents: 'none' }}>
          <Sprite markup={cakeStandSvg()} cacheKey="tw-stand" w={Math.round(box.w * 0.62)} h={Math.round(box.w * 0.62 * 36 / 160)} pixel={2} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: BASE, transform: `translateY(${lift}px)`, transition: 'transform 0.18s' }}>
          {blocks.map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: i * BLOCK_H, height: BLOCK_H }}>
              <Block x={b.x} w={b.w} flavor={i} perfect={b.perfect} boardW={box.w} />
            </div>
          ))}
          {!over && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: blocks.length * BLOCK_H, height: BLOCK_H }}>
              <Block x={cur.x} w={cur.w} flavor={blocks.length} moving boardW={box.w} />
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
