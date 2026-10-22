import React, { useEffect, useState } from 'react';
import { C, SHADOW } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { play } from '../../sound';
import { useFinish } from './meta';

// ── Rompecabezas deslizante ───────────────────────────────────────
// Con SU foto. La foto se recorta a un cuadrado centrado antes de
// partirla: antes se estiraba y las fotos verticales salían aplastadas.

const N = 3;
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270"><rect width="270" height="270" fill="#FBF1EC"/><circle cx="135" cy="100" r="55" fill="#D8697F"/><circle cx="80" cy="190" r="35" fill="#7FA894"/><circle cx="200" cy="190" r="35" fill="#FFE270"/><path d="M60,230 Q135,270 210,230" stroke="#4A3439" stroke-width="6" fill="none"/></svg>')}`;

function shuffleSolvable(size, movesCount) {
  const arr = Array.from({ length: size * size }, (_, i) => i);
  let blank = size * size - 1;
  let prev = -1;
  for (let m = 0; m < movesCount; m++) {
    const br = Math.floor(blank / size), bc = blank % size;
    const nb = [];
    if (br > 0) nb.push(blank - size);
    if (br < size - 1) nb.push(blank + size);
    if (bc > 0) nb.push(blank - 1);
    if (bc < size - 1) nb.push(blank + 1);
    const options = nb.filter((p) => p !== prev);
    const pick = options[Math.floor(Math.random() * options.length)];
    [arr[blank], arr[pick]] = [arr[pick], arr[blank]];
    prev = blank;
    blank = pick;
  }
  // Por si el azar lo dejó resuelto, un movimiento más.
  if (arr.every((v, i) => v === i)) return shuffleSolvable(size, movesCount);
  return arr;
}

const adjacent = (a, b) => {
  const ar = Math.floor(a / N), ac = a % N, br = Math.floor(b / N), bc = b % N;
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
};

function useSquareCrop(url) {
  const [out, setOut] = useState(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      const c = document.createElement('canvas');
      c.width = c.height = Math.min(600, s);
      c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, c.width, c.height);
      try { if (alive) setOut(c.toDataURL('image/jpeg', 0.88)); } catch (e) { if (alive) setOut(url); }
    };
    img.onerror = () => alive && setOut(PLACEHOLDER);
    img.src = url;
    return () => { alive = false; };
  }, [url]);
  return out;
}

export default function SlidingPuzzle({ photoUrl, onBack, onComplete }) {
  const [tiles, setTiles] = useState(() => shuffleSolvable(N, 80));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const url = useSquareCrop(photoUrl || PLACEHOLDER);
  const { finish } = useFinish(onComplete);
  const [px, setPx] = useState(270);
  useEffect(() => {
    const calc = () => setPx(Math.floor(Math.min(Math.min(window.innerWidth, 360) - 44, window.innerHeight - 240, 300) / N) * N);
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  const tile = px / N;

  function tapTile(pos) {
    if (won) return;
    const blankPos = tiles.indexOf(N * N - 1);
    if (!adjacent(pos, blankPos)) { play('bad'); return; }
    play('pop');
    const next = [...tiles];
    [next[pos], next[blankPos]] = [next[blankPos], next[pos]];
    setTiles(next);
    const m = moves + 1;
    setMoves(m);
    if (next.every((v, i) => v === i)) {
      setWon(true);
      play('win');
      finish(m, 900);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Rompecabezas" subtitle="Toca una pieza junto al hueco" onBack={onBack} right={<HeaderTag>{moves} mov.</HeaderTag>} />
      <div className="pg-sticker" style={{ display: 'grid', gridTemplateColumns: `repeat(${N}, ${tile}px)`, width: px, overflow: 'hidden', borderRadius: 16, boxShadow: SHADOW.lifted, touchAction: 'manipulation' }}>
        {tiles.map((t, pos) => {
          if (t === N * N - 1 && !won) {
            return <div key={pos} style={{ width: tile, height: tile, background: C.paperDeep }} />;
          }
          const row = Math.floor(t / N), col = t % N;
          return (
            <button
              key={pos} onClick={() => tapTile(pos)} aria-label={`Pieza ${t + 1}`}
              style={{
                width: tile, height: tile, padding: 0, cursor: 'pointer',
                border: won ? 'none' : `1px solid ${C.glass}`,
                backgroundColor: C.paperDeep,
                backgroundImage: url ? `url(${url})` : 'none',
                backgroundSize: `${px}px ${px}px`,
                backgroundPosition: `-${col * tile}px -${row * tile}px`,
                transition: 'border 0.3s',
              }}
            />
          );
        })}
      </div>
      {won && <p className="pg-anim-pop" style={{ marginTop: 12, fontSize: 13, color: C.sage, fontWeight: 700 }}>¡Quedó perfecta!</p>}
    </Screen>
  );
}
