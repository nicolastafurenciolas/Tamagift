import React, { useMemo, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader } from '../ui';
import { IconCoin, IconBag } from '../icons';
import { play } from '../../sound';
import PetArt from '../PetArt';
import { SLOTS } from '../../art/mochi';
import {
  WARDROBE, HAIRSTYLES, HAIR_COLORS, BROWS, FABRIC_COLORS, HAIR_PRICE, HAIR_COLOR_PRICE, FREE_HAIR_COLORS,
  ownsWear, ownedInSlot, wornNow, ownsHair, ownsHairColor, applyLook,
} from '../../wardrobeState';
import { ShopTab, TabRow } from './Shop';
import { addDelivery, pendingDelivery } from '../../deliveries';

// ─────────────────────────────────────────────────────────────────
// Moda, peluquería y el vestidor.
//   · FashionShop: la pestaña "Moda" de la tienda (comprar, por ranura y
//     por estilo de persona, eligiendo colores antes de pagar)
//   · Salon: la pestaña "Peluquería" (peinados y tintes)
//   · ClosetScreen: vestirla con lo que ya tiene y volver a teñir
// ─────────────────────────────────────────────────────────────────

// Las vistas previas muestran la mochi entera: recortarla dejaba la
// cola (o las alas, o lo que lleva en la mano) cortados a la mitad.

function Swatches({ colors, value, onPick, size = 22 }) {
  return (
    <div className="pg-scroll-x" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
      {colors.map((c) => (
        <button
          key={c} aria-label={`Color ${c}`} className="pg-focus pg-keep-round"
          onClick={(e) => { e.stopPropagation(); play('pop'); onPick(c); }}
          style={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', padding: 0, cursor: 'pointer', background: c, border: value === c ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}` }}
        />
      ))}
    </div>
  );
}


function BuyButton({ owned, worn, pending, price, can, onBuy, onWear, wornLabel = 'Quitármelo' }) {
  const label = pending ? 'En camino' : worn ? wornLabel : owned ? 'Ponérmelo' : null;
  return (
    <button
      onClick={pending ? undefined : owned ? onWear : onBuy} disabled={pending || (!owned && !can)} className="pg-focus"
      style={{
        marginTop: 7, width: '100%', padding: '7px 6px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
        cursor: !owned && !can ? 'default' : 'pointer',
        background: worn ? C.sage : owned ? C.surfaceAlt : can ? C.rose : C.track,
        color: worn ? C.onAccent : owned ? C.ink : can ? C.onAccent : C.inkFaint,
        border: `1.5px solid ${worn ? C.sage : owned ? C.line : can ? C.rose : C.track}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}
    >
      {label || <><IconCoin size={12} color={can ? C.onAccent : C.inkFaint} /> {price}</>}
    </button>
  );
}

// ── Moda ─────────────────────────────────────────────────────────
export function FashionCard({ item, recipe, game, setGame, baseRecipe, coins, buy }) {
  const worn = wornNow(game, baseRecipe)[item.slot];
  const isWorn = !!worn && worn.id === item.id;
  const owned = ownsWear(game, baseRecipe, item.slot, item.id);
  const [c1, setC1] = useState(isWorn && worn.c1 ? worn.c1 : item.colors[0]);
  const [c2, setC2] = useState(isWorn && worn.c2 ? worn.c2 : item.colors[1]);
  const choice = { id: item.id, ...(item.colors[0] ? { c1 } : {}), ...(item.colors[1] ? { c2 } : {}) };
  const preview = useMemo(() => applyLook(recipe, { ...game, wear: { ...(game.wear || {}), [item.slot]: choice } }), [recipe, game, item.slot, item.id, c1, c2]); // eslint-disable-line react-hooks/exhaustive-deps
  const setWear = (v) => setGame((g) => ({ ...g, wear: { ...(g.wear || {}), [item.slot]: v } }));
  const recolor = (field, val) => {
    if (field === 'c1') setC1(val); else setC2(val);
    if (isWorn) setWear({ ...choice, [field]: val });
  };
  return (
    <div className="pg-card" style={{ padding: 9, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ height: 124, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
        <PetArt recipe={preview} mood="feliz" size={120} />
      </div>
      <div style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1.15, margin: '6px 0 5px', minHeight: 29 }}>{item.label}</div>
      {item.colors[0] && <Swatches colors={item.palette || FABRIC_COLORS} value={c1} onPick={(v) => recolor('c1', v)} size={20} />}
      {item.colors[1] && <div style={{ marginTop: 4 }}><Swatches colors={item.palette || FABRIC_COLORS} value={c2} onPick={(v) => recolor('c2', v)} size={16} /></div>}
      <BuyButton
        owned={owned} worn={isWorn} pending={pendingDelivery(game, 'ropa', `${item.slot}:${item.id}`)} price={item.price} can={coins >= item.price}
        onBuy={() => buy(item.price, (g) => addDelivery(g, { kind: 'ropa', refId: `${item.slot}:${item.id}`, label: item.label, wear: choice }))}
        onWear={() => { play(isWorn ? 'pop' : 'place'); setWear(isWorn ? { id: 'ninguno' } : choice); }}
      />
    </div>
  );
}

export function FashionShop({ game, setGame, coins, buy, baseLook }) {
  const [slot, setSlot] = useState('ropa');
  const baseRecipe = baseLook && baseLook.recipe;
  if (!baseRecipe) return <p style={{ fontSize: 12.5, color: C.inkSoft, textAlign: 'center' }}>Esta mascota se dibujó a mano, así que no usa la ropa de la tienda.</p>;
  // lo de temporada se vende en su propia pestaña (SeasonShop)
  const items = WARDROBE.filter((w) => w.slot === slot && !w.season);
  return (
    <>
      <TabRow style={{ padding: '0 2px 8px' }}>
        {SLOTS.map((s) => <ShopTab key={s.id} active={slot === s.id} onClick={() => { play('pop'); setSlot(s.id); }}>{s.label}</ShopTab>)}
      </TabRow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9 }}>
        {items.map((it) => <FashionCard key={`${it.slot}:${it.id}`} item={it} recipe={baseRecipe} game={game} setGame={setGame} baseRecipe={baseRecipe} coins={coins} buy={buy} />)}
      </div>
    </>
  );
}

// ── Peluquería ───────────────────────────────────────────────────
export function Salon({ game, setGame, coins, buy, baseLook }) {
  const baseRecipe = baseLook && baseLook.recipe;
  if (!baseRecipe) return null;
  const now = applyLook(baseRecipe, game);
  const setLook = (patch) => setGame((g) => ({ ...g, look: { ...(g.look || {}), ...patch } }));
  return (
    <>
      <div className="pg-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 96, height: 96, borderRadius: 16, background: C.paperDeep, border: `1.5px solid ${C.line}`, overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <PetArt recipe={now} mood="feliz" size={94} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, color: C.ink }}>Peluquería</div>
          <p style={{ fontSize: 11.5, color: C.inkSoft, margin: '3px 0 0', lineHeight: 1.35 }}>Cada peinado se compra una vez y es tuyo para siempre. Los tintes naturales son gratis.</p>
        </div>
      </div>
      <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '4px 0 6px' }}>Color de pelo</p>
      <div className="pg-card" style={{ padding: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {HAIR_COLORS.map((c) => {
            const own = ownsHairColor(game, baseRecipe, c);
            const sel = now.hairColor === c;
            return (
              <button
                key={c} aria-label={own ? `Teñir ${c}` : `Comprar tinte ${c}`} className="pg-focus pg-keep-round"
                onClick={() => (own ? (play('pop'), setLook({ hairColor: c })) : buy(HAIR_COLOR_PRICE, (g) => ({ ...g, ownedHairColors: [...(g.ownedHairColors || []), c], look: { ...(g.look || {}), hairColor: c } })))}
                style={{ position: 'relative', width: 30, height: 30, borderRadius: '50%', padding: 0, cursor: 'pointer', background: c, border: sel ? `3px solid ${C.ink}` : `1.5px solid ${C.line}`, opacity: own ? 1 : 0.85 }}
              >
                {!own && <span style={{ position: 'absolute', right: -5, bottom: -6, background: C.amberSoft, border: `1px solid ${C.amber}`, borderRadius: 999, fontSize: 10, fontFamily: FONT.display, fontWeight: 800, color: C.ink, padding: '0 4px' }}>{HAIR_COLOR_PRICE}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '4px 0 6px' }}>Cejas (gratis)</p>
      <TabRow style={{ padding: '0 2px 8px' }}>
        {BROWS.map((b) => <ShopTab key={b.id} active={(now.brows || 'ninguna') === b.id} onClick={() => { play('pop'); setLook({ brows: b.id }); }}>{b.label}</ShopTab>)}
      </TabRow>
      <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '4px 0 6px' }}>Peinados</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {HAIRSTYLES.map((h) => {
          const own = ownsHair(game, baseRecipe, h.id);
          const sel = (now.hair || 'ninguno') === h.id;
          const prev = { ...now, hair: h.id };
          return (
            <div key={h.id} className="pg-card" style={{ padding: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, background: C.paperDeep, border: `1.5px solid ${sel ? C.rose : C.line}`, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                <PetArt recipe={prev} mood="normal" size={80} />
              </div>
              <div style={{ fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: C.ink, margin: '4px 0 2px', textAlign: 'center', lineHeight: 1.1, minHeight: 24 }}>{h.label}</div>
              <BuyButton
                owned={own} worn={sel} price={HAIR_PRICE} can={coins >= HAIR_PRICE} wornLabel="Puesto"
                onBuy={() => buy(HAIR_PRICE, (g) => ({ ...g, ownedHair: [...(g.ownedHair || []), h.id], look: { ...(g.look || {}), hair: h.id } }))}
                onWear={() => { if (sel) return; play('place'); setLook({ hair: h.id }); }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Vestidor ─────────────────────────────────────────────────────
export function ClosetScreen({ game, setGame, baseLook, petName, onBack, onShop }) {
  const [slot, setSlot] = useState('ropa');
  const baseRecipe = baseLook && baseLook.recipe;
  if (!baseRecipe) {
    return (
      <Screen>
        <ScreenHeader title="Vestidor" onBack={onBack} />
        <p style={{ fontSize: 13, color: C.inkSoft, textAlign: 'center' }}>Esta mascota se dibujó a mano, así que no usa ropa del vestidor.</p>
      </Screen>
    );
  }
  const now = applyLook(baseRecipe, game);
  const worn = wornNow(game, baseRecipe);
  const owned = ownedInSlot(game, baseRecipe, slot);
  const current = worn[slot];
  const currentItem = current ? WARDROBE.find((w) => w.slot === slot && w.id === current.id) : null;
  const setWear = (v) => setGame((g) => ({ ...g, wear: { ...(g.wear || {}), [slot]: v } }));
  return (
    <Screen style={{ paddingBottom: 20 }}>
      <ScreenHeader title="Vestidor" subtitle={`Viste a ${petName} con lo que tiene`} onBack={onBack} />
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div className="pg-card" style={{ padding: 10, display: 'flex', justifyContent: 'center', marginBottom: 10, background: C.paperDeep }}>
          <PetArt recipe={now} mood="feliz" size={180} />
        </div>
        <TabRow style={{ padding: '0 2px 8px' }}>
          {SLOTS.map((s) => <ShopTab key={s.id} active={slot === s.id} onClick={() => { play('pop'); setSlot(s.id); }}>{s.label}</ShopTab>)}
        </TabRow>
        {currentItem && currentItem.colors.length > 0 && (
          <div className="pg-card" style={{ padding: '8px 10px', marginBottom: 10 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 5 }}>Color de {currentItem.label.toLowerCase()}</div>
            <Swatches colors={currentItem.palette || FABRIC_COLORS} value={current.c1 || currentItem.colors[0]} onPick={(c) => setWear({ ...current, c1: c })} />
            {currentItem.colors[1] && <div style={{ marginTop: 5 }}><Swatches colors={currentItem.palette || FABRIC_COLORS} value={current.c2 || currentItem.colors[1]} onPick={(c) => setWear({ ...current, c2: c })} size={18} /></div>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <button
            onClick={() => { play('pop'); setWear({ id: 'ninguno' }); }} className="pg-card pg-focus"
            style={{ padding: 7, cursor: 'pointer', border: `2px solid ${!current ? C.rose : C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 104, fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft }}
          >
            Nada
          </button>
          {owned.map((it) => {
            const sel = current && current.id === it.id;
            const prev = applyLook(baseRecipe, { ...game, wear: { ...(game.wear || {}), [slot]: sel ? current : { id: it.id } } });
            return (
              <button
                key={it.id} onClick={() => { play('place'); setWear(sel ? { id: 'ninguno' } : { id: it.id }); }} className="pg-card pg-focus"
                style={{ padding: 6, cursor: 'pointer', border: `2px solid ${sel ? C.rose : C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}
              >
                <PetArt recipe={prev} mood="normal" size={78} />
                <span style={{ fontFamily: FONT.display, fontSize: 10.5, fontWeight: 700, color: C.ink, lineHeight: 1.1, textAlign: 'center' }}>{it.label}</span>
              </button>
            );
          })}
        </div>
        <button onClick={onShop} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, width: '100%', padding: 11, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <IconBag size={15} color={C.lavender} /> Más ropa en la tienda
        </button>
      </div>
    </Screen>
  );
}
