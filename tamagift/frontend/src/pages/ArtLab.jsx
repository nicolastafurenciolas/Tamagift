import React, { useEffect, useState } from 'react';
import { drawArt } from '../art/kit';
import { mochiSvg, SHAPES, MOODS, HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, EARS, EYES, MOUTHS, TAILS, PATTERNS, CHEEKS } from '../art/mochi';
import { STYLE_LIST } from '../styles/registry';
import { renderToStaticMarkup } from 'react-dom/server';
import { FURNITURE } from '../roomCatalog';
import { FOOD_SPRITES, UI_SPRITES } from '../sprites';
import { PET_STYLES } from '../petStyles';
import { DEFAULT_RECIPE } from '../PetRecipe';
import ArtCatalog from './ArtCatalog';
import { WALLS, wallSvg } from '../art/room/walls';
import { FLOORS, floorSvg } from '../art/room/floors';
import { FURNITURE_DEFS } from '../art/room/furniture';
import { DECOR_DEFS } from '../art/room/decor';

const innerOf = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
// Un rincón del cuarto (pared + piso) a escala del juego.
export function cornerSvg(wall, floor, extra = '', W = 480) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 430" width="${W}" height="430"><g>${innerOf(wallSvg(wall, W, 320))}</g><g transform="translate(0 320)">${innerOf(floorSvg(floor, W, 110))}</g>${extra}</svg>`;
}

// Laboratorio de arte (solo desarrollo): /arte?set=familia&size=170
// Muestra un conjunto de piezas dibujado por cada kit de estilo. Sin
// ?set= abre el catálogo completo.

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
  const q = new URLSearchParams(window.location.search);
  if (name === 'paredes2') {
    const t = Number(q.get('t') || 0);
    return WALLS.map((p) => ({ name: `${p.name} · ${(p.tints[t] || p.tints[0]).name}`, kind: 'surface', w: 384, h: 344, markup: cornerSvg(`${p.id}.${(p.tints[t] || p.tints[0]).id}`, q.get('piso') || 'tablas.miel') }));
  }
  if (name === 'pisos2') {
    const t = Number(q.get('t') || 0);
    return FLOORS.map((p) => ({ name: `${p.name} · ${(p.tints[t] || p.tints[0]).name}`, kind: 'surface', w: 384, h: 344, markup: cornerSvg(q.get('pared') || 'liso.crema', `${p.id}.${(p.tints[t] || p.tints[0]).id}`) }));
  }
  if (name === 'muebles3') {
    // cada mueble en un rincón del cuarto, con una mochi al lado para la escala
    const paint = q.get('pintura') || 'natural';
    const cat = q.get('cat');
    const pet = innerOf(mochiSvg(FAMILY[0].r, 'normal'));
    const ids = q.get('ids') ? q.get('ids').split(',') : null;
    return FURNITURE_DEFS.filter((f) => (!cat || f.cat === cat) && (!ids || ids.includes(f.id))).map((f) => {
      const onWall = f.place === 'pared';
      const x = 190 - f.w / 2, y = (onWall ? 210 : f.layer === 'suelo' ? 418 : 404) - f.h + f.foot;
      const extra = `<g transform="translate(${x} ${y}) scale(${f.w / f.vw})">${innerOf(f.svg(paint))}</g><g transform="translate(330 224)">${pet}</g>`;
      return { name: f.name, kind: 'surface', w: 384, h: 344, markup: cornerSvg(q.get('pared') || 'liso.crema', q.get('piso') || 'tablas.miel', extra) };
    });
  }
  if (name === 'presets') return PET_STYLES.map((p) => ({ name: p.label, r: { ...DEFAULT_RECIPE, ...p.recipe } }));
  if (name === 'muebles') {
    const paint = new URLSearchParams(window.location.search).get('pintura') || 'natural';
    return FURNITURE.map((f) => ({ name: f.name, markup: f.svg(paint), w: f.w, h: f.h }));
  }
  if (name === 'paredes') return sets('paredes2');
  if (name === 'pisos') return sets('pisos2');
  if (name === 'comida') return FOOD_SPRITES.map((f) => ({ name: f.id, markup: renderToStaticMarkup(f.render()), w: 100, h: 100 }));
  if (name === 'deco') return DECOR_DEFS.map((d) => ({ name: d.name, markup: d.svg(), w: d.w, h: d.h }));
  if (name === 'ui') return Object.entries(UI_SPRITES).map(([k, r]) => ({ name: k, markup: renderToStaticMarkup(r()), w: 90, h: 90 }));
  return FAMILY;
}

// Sin ?set= se muestra el catálogo completo (pages/ArtCatalog.jsx).
export default function ArtLab() {
  return new URLSearchParams(window.location.search).get('set') ? <LabSet /> : <ArtCatalog />;
}

function LabSet() {
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
        let res;
        if (c.markup) {
          const k = c.w === 384 ? 1 : Math.min(size * 1.6 / c.w, size * 1.6 / c.h, c.kind === 'surface' ? 1 : 3);
          res = drawArt({ markup: c.markup, styleId: st.id, w: Math.round(c.w * k), h: Math.round(c.h * k), kind: c.kind || 'art' });
        } else res = drawArt({ markup: mochiSvg(c.r, c.mood || 'normal'), styleId: st.id, w: size, h: size, kind: 'pet' });
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
              <img src={c.res.url} width={c.res.cssW} height={c.res.cssH} alt="" style={{ imageRendering: c.res.pixelated ? 'pixelated' : 'auto', display: 'block' }} />
              <div style={{ fontSize: 11, color: st.ui.inkSoft, fontFamily: 'sans-serif' }}>{c.name} · {c.ms}ms</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
