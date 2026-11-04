import React from 'react';
import { C, FONT } from '../../../theme';
import Sprite from '../../Sprite';
import PetArt from '../../PetArt';
import { play } from '../../../sound';
import { findDecor } from '../../../shopCatalog';
import { findWearable } from '../../../art/mochi/index.js';
import { applyLook } from '../../../wardrobeState';
import { findPack } from '../../../personal/packs';

// ─────────────────────────────────────────────────────────────────
// "De {quien regala} para ti": lo de los packs por gustos que activó
// quien regala (personal/packs.js), en la tienda. Ya está pagado: se toma
// y es tuyo (los adornos a la bandeja de decorar, la ropa al vestidor).
//   items = packItems(activePacks(profile))
// ─────────────────────────────────────────────────────────────────

function Card({ art, name, pack, owned, onTake }) {
  return (
    <div className="pg-card" style={{ padding: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center', minWidth: 0 }}>
      <div style={{ width: 86, height: 86, display: 'grid', placeItems: 'center', borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, overflow: 'hidden' }}>{art}</div>
      <div style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink, lineHeight: 1.15, minHeight: 29, overflowWrap: 'anywhere' }}>{name}</div>
      {pack && <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: -3 }}>{pack.icon} {pack.name}</div>}
      <button
        onClick={onTake} disabled={owned} className={`pg-btn ${owned ? 'pg-btn-ghost' : 'pg-btn-rose'} pg-focus`}
        style={{ width: '100%', padding: '7px 8px', fontSize: 12, opacity: owned ? 0.65 : 1 }}
      >
        {owned ? 'Ya es tuyo' : 'Tomarlo'}
      </button>
    </div>
  );
}

export default function PackGifts({ items, game, setGame, baseRecipe, giverName }) {
  const decor = (items.decor || []).map((x) => ({ ...x, def: findDecor(x.id) })).filter((x) => x.def);
  const wear = (items.wear || []).map((x) => ({ ...x, def: findWearable(x.slot, x.id) })).filter((x) => x.def);
  const ownsDecor = (id) => (game.ownedDecor || []).map(String).includes(String(id));
  const ownsWear = (slot, id) => (game.ownedWear || []).includes(`${slot}:${id}`);
  const takeDecor = (id) => { play('buy'); setGame((g) => (ownsDecorIn(g, id) ? g : { ...g, ownedDecor: [...(g.ownedDecor || []), id] })); };
  const takeWear = (slot, id) => {
    play('buy');
    setGame((g) => ((g.ownedWear || []).includes(`${slot}:${id}`) ? g : { ...g, ownedWear: [...(g.ownedWear || []), `${slot}:${id}`], wear: { ...(g.wear || {}), [slot]: { id } } }));
  };
  if (!decor.length && !wear.length) return null;
  return (
    <div>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 10px', textAlign: 'center', lineHeight: 1.4 }}>
        {giverName ? `${giverName} lo eligió` : 'Lo eligieron'} pensando en lo que te gusta. Ya está pagado: tómalo cuando quieras.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9 }}>
        {decor.map((x) => (
          <Card
            key={`d-${x.id}`} name={x.def.name} pack={findPack(x.pack)} owned={ownsDecor(x.id)} onTake={() => takeDecor(x.id)}
            art={<Sprite markup={x.def.svg()} cacheKey={`decor-${x.id}-natural`} w={72} h={72} />}
          />
        ))}
        {wear.map((x) => (
          <Card
            key={`w-${x.slot}-${x.id}`} name={x.def.label || x.def.name} pack={findPack(x.pack)} owned={ownsWear(x.slot, x.id)} onTake={() => takeWear(x.slot, x.id)}
            art={baseRecipe ? <PetArt recipe={applyLook(baseRecipe, { ...game, wear: { ...(game.wear || {}), [x.slot]: { id: x.id } } })} mood="feliz" size={84} /> : null}
          />
        ))}
      </div>
    </div>
  );
}

function ownsDecorIn(g, id) { return (g.ownedDecor || []).map(String).includes(String(id)); }
