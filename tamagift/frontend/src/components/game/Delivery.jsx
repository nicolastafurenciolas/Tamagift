import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Modal } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import PetArt from '../PetArt';
import { parcelSvg } from '../../art/room/door';
import { findFurniture, wallSwatchSvg, floorSwatchSvg } from '../../roomCatalog';
import { findDecor } from '../../shopCatalog';
import { FramedPoster } from './posters';
import { applyLook } from '../../wardrobeState';
import { UI_SPRITES, foodSpriteFor } from '../../sprites';
import { envelopeSvg } from '../../art/room/world';

// ─────────────────────────────────────────────────────────────────
// Abrir el pedido: la caja se abre con brillitos y sale cada cosa, con lo
// que se puede hacer de una vez (ponerla en el cuarto, ponérsela, pintar).
// Cerrar guarda todo lo que quede en la caja.
// ─────────────────────────────────────────────────────────────────

function ItemArt({ d, posters, baseRecipe, game }) {
  if (d.kind === 'mueble') { const f = findFurniture(d.refId); return f ? <Sprite markup={f.svg(d.paint || 'natural')} cacheKey={`furn-${f.id}-${d.paint || 'natural'}`} w={70} h={70} /> : null; }
  if (d.kind === 'decor') { const x = findDecor(d.refId); return x ? <Sprite markup={x.svg(d.paint || 'natural')} cacheKey={`decor-${x.id}-${d.paint || 'natural'}`} w={66} h={66} /> : null; }
  if (d.kind === 'poster') { const p = (posters || []).find((x) => String(x.id) === String(d.refId)); return p ? <FramedPoster poster={p} paint={d.paint || 'natural'} h={70} /> : null; }
  if (d.kind === 'pared') return <Sprite markup={wallSwatchSvg(d.value, 120)} cacheKey={`swatch-pared-${d.value}`} w={64} h={64} kind="surface" fit="cover" />;
  if (d.kind === 'piso') return <Sprite markup={floorSwatchSvg(d.value, 120)} cacheKey={`swatch-piso-${d.value}`} w={64} h={64} kind="surface" fit="cover" />;
  if (d.kind === 'monedas') return <Sprite art={UI_SPRITES.moneda()} cacheKey="ui-moneda" w={52} h={52} />;
  if (d.kind === 'comida') { const sp = foodSpriteFor(d.refId); return <Sprite art={sp.render()} cacheKey={`food-${sp.id}`} w={56} h={56} />; }
  if (d.kind === 'carta') return <Sprite markup={envelopeSvg()} cacheKey="envelope" w={62} h={52} />;
  if (d.kind === 'ropa' && baseRecipe) {
    const [slot] = d.refId.split(':');
    const r = applyLook(baseRecipe, { ...game, wear: { ...(game.wear || {}), [slot]: d.wear } });
    return <PetArt recipe={r} mood="feliz" size={72} />;
  }
  return null;
}

const ACTION = { carta: 'Leerla', mueble: 'Ponerlo en el cuarto', decor: 'Ponerlo en el cuarto', poster: 'Colgarlo', ropa: 'Ponérmelo', pared: '¡A pintar!', piso: '¡A enchapar!', monedas: 'Guardarlas', comida: 'A la nevera' };

export default function DeliveryModal({ items, posters, baseRecipe, game, onUse, onKeepAll }) {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setOpened(true); play('unbox'); }, 650);
    return () => clearTimeout(t);
  }, []);
  return (
    <Modal onClose={onKeepAll} maxWidth={360} z={80}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <div className={opened ? 'pg-anim-pop' : 'pg-wiggle'} style={{ width: 104, height: 96 }}>
          <Sprite markup={parcelSvg(opened)} cacheKey={`parcel-${opened ? 'open' : 'closed'}`} w={104} h={96} />
        </div>
      </div>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 2px' }}>{opened ? '¡Llegó tu pedido!' : 'Abriendo…'}</h2>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px' }}>{items.length === 1 ? 'Una cosa nueva para ti' : `${items.length} cosas nuevas para ti`}</p>
      {opened && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '48vh', overflowY: 'auto', padding: '2px 2px 6px' }}>
          {items.map((d, i) => (
            <div key={d.id} className="pg-card pg-anim-rise" style={{ padding: 9, display: 'flex', alignItems: 'center', gap: 10, animationDelay: `${i * 90}ms` }}>
              <div style={{ width: 74, height: 74, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <ItemArt d={d} posters={posters} baseRecipe={baseRecipe} game={game} />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{d.label}</div>
                <button
                  onClick={() => { play('place'); onUse(d); }} className="pg-btn pg-btn-rose pg-focus"
                  style={{ marginTop: 6, padding: '7px 12px', fontSize: 12 }}
                >
                  {ACTION[d.kind] || 'Usar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={onKeepAll} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 10, padding: '10px 24px', fontSize: 13 }}>
        {opened ? 'Guardar lo demás' : 'Cerrar'}
      </button>
    </Modal>
  );
}
