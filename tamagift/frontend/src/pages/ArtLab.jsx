import React, { useEffect, useState } from 'react';
import { drawArt } from '../art/kit';
import { mochiSvg, SHAPES, MOODS, HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, EARS, EYES, MOUTHS, TAILS, PATTERNS, CHEEKS } from '../art/mochi';
import { STYLE_LIST } from '../styles/registry';

// Laboratorio de arte (solo desarrollo): /arte?set=familia&size=170
// Muestra la misma mochi dibujada por cada kit de estilo.

const FAMILY = [
  { name: 'Nube', r: { ears: 'gato', mouth: 'w', bodyColor: '#FBEEE6', accentColor: '#E9B9A2', innerColor: '#FFFFFF', eyeColor: '#6F6A8A' } },
  { name: 'Algodón', r: { ears: 'conejoCaido', mouth: 'w', bodyColor: '#F3E6FF', innerColor: '#FFFFFF', accentColor: '#D7C0F0', eyeColor: '#8A6AA8' } },
  { name: 'Moca', r: { ears: 'oso', mouth: 'hocico', bodyColor: '#D9B08C', innerColor: '#F8E7D2', accentColor: '#A7754F', eyeColor: '#6B4A34' } },
  { name: 'Pío', r: { ears: 'pollito', mouth: 'pico', bodyColor: '#FFE58A', innerColor: '#FFF6C9', accentColor: '#F7C948', eyeColor: '#7A6A3A' } },
  { name: 'Perla', r: { ears: 'ninguna', mouth: 'hocico', bodyColor: '#DFE8F2', innerColor: '#FFFFFF', accentColor: '#B6C7DA', eyeColor: '#5A6A8A' } },
  { name: 'Tito', r: { ears: 'rana', mouth: 'sonrisa', bodyColor: '#B8E6A3', innerColor: '#EFFBE6', accentColor: '#8FCF7A', eyeColor: '#4A6A3A' } },
];

function sets(name) {
  if (name === 'formas') return SHAPES.map((s) => ({ name: s.label, r: { ...FAMILY[0].r, body: s.id } }));
  if (name === 'animos') return MOODS.map((m) => ({ name: m, mood: m, r: FAMILY[(Number(new URLSearchParams(window.location.search).get('f')) || 0)].r }));
  const cyc = (list, key, extra = {}) => list.filter((x) => x.id !== 'ninguno' && x.id !== 'ninguna').map((a, i) => ({ name: a.label, r: { ...FAMILY[i % FAMILY.length].r, body: SHAPES[i % 4].id, [key]: a.id, ...extra } }));
  if (name === 'cabeza') return cyc(HEAD_ACCESSORIES, 'headAcc');
  if (name === 'cuello') return cyc(NECK_ACCESSORIES, 'neckAcc');
  if (name === 'cara') return cyc(EXTRA_ACCESSORIES, 'extraAcc');
  if (name === 'orejas') return cyc(EARS, 'ears');
  if (name === 'ojos') return cyc(EYES, 'eyes', { ears: 'gato' });
  if (name === 'bocas') return cyc(MOUTHS, 'mouth', { ears: 'oso' });
  if (name === 'colas') return cyc(TAILS, 'tail');
  if (name === 'estampados') return cyc(PATTERNS, 'pattern', { accentColor: '#E9799A', accentAlt: '#7FC8F8' });
  if (name === 'mejillas') return cyc(CHEEKS, 'cheeks');
  return FAMILY;
}

export default function ArtLab() {
  const q = new URLSearchParams(window.location.search);
  const set = sets(q.get('set') || 'familia');
  const size = Number(q.get('size') || 150);
  const only = q.get('solo');
  const styles = only ? STYLE_LIST.filter((s) => only.split(',').includes(s.id)) : STYLE_LIST;
  const [rows, setRows] = useState(null);
  useEffect(() => {
    const out = styles.map((st) => ({
      st,
      cells: set.map((c) => {
        const t0 = performance.now();
        const res = drawArt({ markup: mochiSvg(c.r, c.mood || 'normal'), styleId: st.id, w: size, h: size, kind: 'pet' });
        return { ...c, res, ms: Math.round(performance.now() - t0) };
      }),
    }));
    setRows(out);
    document.body.dataset.ready = '1';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!rows) return null;
  return (
    <div style={{ padding: 16, background: '#fff' }}>
      {rows.map(({ st, cells }) => (
        <div key={st.id} data-row={st.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: st.ui.paper, padding: '8px 12px', marginBottom: 6, borderRadius: 12 }}>
          <div style={{ width: 90, fontFamily: st.fonts.display, color: st.ui.ink, fontSize: 14 }}>{st.name}</div>
          {cells.map((c) => (
            <div key={c.name} style={{ textAlign: 'center' }}>
              <img src={c.res.url} width={size} height={size} alt="" style={{ imageRendering: c.res.pixelated ? 'pixelated' : 'auto', display: 'block' }} />
              <div style={{ fontSize: 11, color: st.ui.inkSoft, fontFamily: 'sans-serif' }}>{c.name} · {c.ms}ms</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
