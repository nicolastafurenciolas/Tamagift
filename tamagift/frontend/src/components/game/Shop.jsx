import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader, Modal } from '../ui';
import { IconCoin, IconFrame, IconShirt, IconSparkle } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import PetArt from '../PetArt';
import { lookOf } from '../../petLook';
import { DECOR_CATALOG } from '../../shopCatalog';
import {
  FURNITURE, FURNITURE_CATEGORIES, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS,
  findWall, findFloor, wallSwatchSvg, floorSwatchSvg, ownsWall, ownsFloor,
} from '../../roomCatalog';
import { ModularPetStep, useDesignerState } from '../PetDesigner';
import { FramedPoster } from './posters';
import { FashionShop, Salon } from './Fashion';
import { addDelivery, pendingDelivery } from '../../deliveries';
import { FOODS, FOOD_KINDS } from '../../foodCatalog';
import { foodSpriteFor } from '../../sprites';

export const REDESIGN_COST = 1000;

// ── Tienda ────────────────────────────────────────────────────────

export function ShopTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick} className="pg-focus"
      style={{
        flexShrink: 0, padding: '8px 12px', borderRadius: 14, fontFamily: FONT.display, fontSize: 12, fontWeight: 700, cursor: 'pointer',
        background: active ? C.rose : C.surface, color: active ? C.onAccent : C.ink,
        border: `1.5px solid ${active ? C.rose : C.line}`, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

// Fila de pestañas que se desliza de lado: con siete pestañas en un
// celular de 360 px no entraban y empujaban toda la página hacia un
// costado.
export function TabRow({ children, style }) {
  return (
    <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, overflowX: 'auto', width: '100%', padding: '4px 4px 8px', ...style }}>
      {children}
    </div>
  );
}

function ShopItemCard({ image, name, note, price, owned, equipped, onAction, actionLabel, canAfford }) {
  return (
    <div className="pg-card" style={{ padding: 11, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {image}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{name}</div>
        {note && <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.25, marginTop: 1 }}>{note}</div>}
        <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
          {!owned && <IconCoin size={13} color={C.amber} />} {owned ? (equipped ? 'En uso' : 'En tu colección') : `${price} monedas`}
        </div>
      </div>
      <button
        onClick={onAction} disabled={!owned && !canAfford} className="pg-focus"
        style={{
          padding: '8px 13px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
          cursor: !owned && !canAfford ? 'default' : 'pointer',
          background: equipped ? C.sage : owned ? C.surfaceAlt : (!canAfford ? C.track : C.rose),
          color: equipped ? C.onAccent : owned ? C.ink : !canAfford ? C.inkFaint : C.onAccent,
          border: `1.5px solid ${equipped ? C.sage : owned ? C.line : !canAfford ? C.track : C.rose}`,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function PaintRow({ value, onPick }) {
  return (
    <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
      {FURNITURE_PAINTS.map((p) => (
        <button
          key={p.id} onClick={() => { play('pop'); onPick(p.id); }} className="pg-focus pg-keep-round"
          aria-label={`Color ${p.name}`} title={p.name}
          style={{
            width: 26, height: 26, flexShrink: 0, borderRadius: '50%', cursor: 'pointer', padding: 0,
            background: `linear-gradient(135deg, ${p.wood} 50%, ${p.cloth} 50%)`,
            border: value === p.id ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
            boxShadow: value === p.id ? SHADOW.soft : 'none',
          }}
        />
      ))}
    </div>
  );
}

// Filtro de la deco por dónde va (no por "tipo de persona": las
// etiquetas de estilo encasillaban y podían espantar).
const PLACES = [
  { id: 'todo', label: 'Todo' },
  { id: 'sobre', label: 'Para mesas y paredes' },
  { id: 'piso', label: 'Para el piso' },
];
function PlaceRow({ value, onChange }) {
  return (
    <TabRow style={{ padding: '0 2px 8px' }}>
      {PLACES.map((v) => (
        <button
          key={v.id} onClick={() => { play('pop'); onChange(v.id); }} className="pg-focus"
          style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 999, fontFamily: FONT.display, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: value === v.id ? C.lavender : 'transparent', color: value === v.id ? C.onAccent : C.lavender, border: `1.5px solid ${C.lavender}`, whiteSpace: 'nowrap' }}
        >
          {v.label}
        </button>
      ))}
    </TabRow>
  );
}

// Adorno del catálogo: vista grande, pintura (si se puede) y compra.
function DecorShopCard({ item, owned, pending, paint, canAfford, onBuy, onRepaint }) {
  const [choice, setChoice] = useState('natural');
  const active = owned ? (paint || 'natural') : choice;
  return (
    <div className="pg-card" style={{ padding: 9, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ height: 100, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <Sprite markup={item.svg(active)} cacheKey={`decor-${item.id}-${active}`} w={86} h={86} />
      </div>
      <div style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1.15, margin: '6px 0 2px', minHeight: 29 }}>{item.name}</div>
      <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.2 }}>{item.place === 'sobre' ? 'Va encima de muebles o colgado' : 'Va en el piso'}</div>
      {item.paintable && <PaintRow value={active} onPick={(id) => (owned ? onRepaint(id) : setChoice(id))} />}
      <button
        onClick={() => { if (!owned && !pending) onBuy(active); }} disabled={owned || pending || !canAfford} className="pg-focus"
        style={{
          marginTop: 7, padding: '7px 6px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
          cursor: owned || !canAfford ? 'default' : 'pointer',
          background: owned ? C.surfaceAlt : canAfford ? C.rose : C.track,
          color: owned ? C.inkSoft : canAfford ? C.onAccent : C.inkFaint,
          border: `1.5px solid ${owned ? C.line : canAfford ? C.rose : C.track}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        {pending ? 'En camino' : owned ? 'Tuyo' : <><IconCoin size={12} color={canAfford ? C.onAccent : C.inkFaint} /> {item.price}</>}
      </button>
    </div>
  );
}

// ── Súper: comida para la nevera (se guarda al instante) ───────────
const KIND_ORDER = ['saludable', 'casera', 'dulce', 'chatarra', 'bebida'];
const KIND_NOTE = {
  saludable: 'Llena poco y ayuda a bajar de peso',
  casera: 'Llena mucho y es sana',
  dulce: 'Da energía, pero engorda',
  chatarra: 'Llena mucho, pero engorda',
  bebida: 'Da energía',
};
function SuperTab({ game, coins, buy }) {
  return KIND_ORDER.map((kind) => (
    <div key={kind} style={{ marginBottom: 12 }}>
      <p style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink, margin: '4px 0 0' }}>{FOOD_KINDS[kind].label}</p>
      <p style={{ fontSize: 11, color: C.inkFaint, margin: '0 0 6px' }}>{KIND_NOTE[kind]}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
        {FOODS.filter((f) => f.kind === kind).map((f) => {
          const sp = foodSpriteFor(f.id);
          const have = (game.fridge || {})[f.id] || 0;
          const can = coins >= f.price;
          return (
            <button
              key={f.id} disabled={!can} className="pg-card pg-focus"
              onClick={() => buy(f.price, (g) => ({ ...g, fridge: { ...(g.fridge || {}), [f.id]: ((g.fridge || {})[f.id] || 0) + 1 } }))}
              style={{ position: 'relative', padding: '7px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: can ? 'pointer' : 'default', opacity: can ? 1 : 0.6, minWidth: 0 }}
            >
              {have > 0 && <span style={{ position: 'absolute', top: 4, right: 5, fontFamily: FONT.display, fontSize: 11, fontWeight: 800, color: C.sky }}>×{have}</span>}
              <Sprite art={sp.render()} cacheKey={`food-${sp.id}`} w={40} h={40} />
              <span style={{ fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.ink, lineHeight: 1.1, textAlign: 'center', minHeight: 25 }}>{f.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: FONT.display, fontSize: 11, fontWeight: 800, color: C.inkSoft }}><IconCoin size={11} color={C.amber} />{f.price}</span>
            </button>
          );
        })}
      </div>
    </div>
  ));
}

// Póster: se ve enmarcado y el marco se pinta antes (o después) de comprar.
function PosterShopCard({ poster, owned, pending, paint, canAfford, onBuy, onRepaint }) {
  const [choice, setChoice] = useState('natural');
  const active = owned ? (paint || 'natural') : choice;
  const price = poster.price || 0;
  const can = owned || canAfford;
  return (
    <div className="pg-card" style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 0 }}>
      <div style={{ height: 150, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <FramedPoster poster={poster} paint={active} h={136} />
      </div>
      <PaintRow value={active} onPick={(id) => (owned ? onRepaint(id) : setChoice(id))} />
      <button
        onClick={() => { if (!owned && !pending) onBuy(active); }} disabled={!can || owned || pending} className="pg-focus"
        style={{
          marginTop: 8, padding: '7px 6px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
          cursor: owned || !can ? 'default' : 'pointer',
          background: owned ? C.surfaceAlt : can ? C.rose : C.track,
          color: owned ? C.inkSoft : can ? C.onAccent : C.inkFaint,
          border: `1.5px solid ${owned ? C.line : can ? C.rose : C.track}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        {pending ? 'En camino' : owned ? 'Tuyo' : <><IconCoin size={12} color={can ? C.onAccent : C.inkFaint} /> {price}</>}
      </button>
    </div>
  );
}

function FurnitureShopCard({ item, owned, pending, ownedPaint, canAfford, onBuy, onRepaint }) {
  const [choice, setChoice] = useState('natural');
  const activePaint = owned ? (ownedPaint || 'natural') : choice;
  return (
    <div className="pg-card" style={{ padding: 11, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Sprite markup={item.svg(activePaint)} cacheKey={`furn-${item.id}-${activePaint}`} w={58} h={58} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{item.name}</div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.25, marginTop: 1 }}>
            {item.place === 'pared' ? 'Va colgado en la pared' : item.layer === 'suelo' ? 'Va en el piso, debajo de todo' : owned ? 'Toca un color para repintarlo' : 'Elige el color antes de comprar'}
          </div>
          {!owned && (
            <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconCoin size={13} color={C.amber} /> {item.price} monedas
            </div>
          )}
        </div>
        <button
          onClick={() => onBuy(choice)} disabled={owned || pending || !canAfford} className="pg-focus"
          style={{
            padding: '8px 13px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
            cursor: owned || !canAfford ? 'default' : 'pointer',
            background: owned ? C.surfaceAlt : (!canAfford ? C.track : C.rose),
            color: owned ? C.ink : !canAfford ? C.inkFaint : C.onAccent,
            border: `1.5px solid ${owned ? C.line : !canAfford ? C.track : C.rose}`, whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {pending ? 'En camino' : owned ? 'Comprado' : 'Comprar'}
        </button>
      </div>
      <PaintRow value={activePaint} onPick={(id) => (owned ? onRepaint(id) : setChoice(id))} />
    </div>
  );
}

// Una pared o un piso: el diseño con todos sus colores. Comprar el
// diseño deja usar cualquiera de sus colores.
function SurfaceCard({ pattern, kind, owned, pending, current, canAfford, onBuy, onApply }) {
  const curTint = current && current.pattern.id === pattern.id ? current.tint.id : pattern.tints[0].id;
  const [tint, setTint] = useState(curTint);
  const value = `${pattern.id}.${tint}`;
  const inUse = current && current.value === value;
  const svg = kind === 'pared' ? wallSwatchSvg(value, 120) : floorSwatchSvg(value, 120);
  return (
    <div className="pg-card" style={{ padding: 11, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, border: `1.5px solid ${C.line}`, flexShrink: 0, overflow: 'hidden' }}>
          <Sprite markup={svg} cacheKey={`swatch-${kind}-${value}`} w={64} h={64} kind="surface" fit="cover" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{pattern.name}</div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.25, marginTop: 1 }}>{pattern.tints.length} colores · {(pattern.tints.find((t) => t.id === tint) || pattern.tints[0]).name}</div>
          <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
            {!owned && !pending && <IconCoin size={13} color={C.amber} />} {pending ? 'Llega en tu próximo pedido' : owned ? (inUse ? 'Puesto' : 'Tuyo · elige color y ponlo') : pattern.price ? `${pattern.price} monedas` : 'Gratis'}
          </div>
        </div>
        <button
          onClick={() => (owned ? onApply(value) : onBuy(value))} disabled={inUse || pending || (!owned && !canAfford)} className="pg-focus"
          style={{
            padding: '8px 13px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
            cursor: inUse || (!owned && !canAfford) ? 'default' : 'pointer',
            background: inUse ? C.sage : owned ? C.surfaceAlt : (!canAfford ? C.track : C.rose),
            color: inUse ? C.onAccent : owned ? C.ink : !canAfford ? C.inkFaint : C.onAccent,
            border: `1.5px solid ${inUse ? C.sage : owned ? C.line : !canAfford ? C.track : C.rose}`, whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {inUse ? 'Puesto' : pending ? 'En camino' : owned ? (kind === 'pared' ? 'Pintar' : 'Enchapar') : 'Comprar'}
        </button>
      </div>
      <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
        {pattern.tints.map((t) => (
          <button
            key={t.id} title={t.name} aria-label={t.name} className="pg-focus pg-keep-round"
            onClick={() => { play('pop'); setTint(t.id); }}
            style={{
              width: 26, height: 26, flexShrink: 0, borderRadius: '50%', padding: 0, cursor: 'pointer',
              background: t.c.length > 1 ? `linear-gradient(135deg, ${t.c[0]} 50%, ${t.c[1]} 50%)` : t.c[0],
              border: tint === t.id ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RedesignConfirmModal({ onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} maxWidth={340} z={60}>
      <div style={{ marginBottom: 10 }}><IconSparkle size={30} color={C.lavender} /></div>
      <p style={{ fontFamily: FONT.hand, fontSize: 20, color: C.ink, lineHeight: 1.35, marginBottom: 14 }}>
        La mascota actual la diseñó tu pareja para ti. Siempre podrás volver a ese diseño.
      </p>
      <p style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 18 }}>
        Rediseñarla cuesta <b>{REDESIGN_COST} monedas</b> y se cobran solo cuando guardes el nuevo diseño. Si cancelas, no pagas nada.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Cancelar</button>
        <button onClick={onConfirm} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Rediseñar</button>
      </div>
    </Modal>
  );
}

// Editor de rediseño. Reusa el mismo creador del asistente.
export function RedesignScreen({ initialRecipe, onCancel, onSave, saving, error }) {
  const designer = useDesignerState(initialRecipe);
  return (
    <Screen style={{ paddingBottom: 24 }}>
      <ModularPetStep {...designer} title="Rediséñala a tu gusto" subtitle="Parte de lo que ya tenía: cambia lo que quieras" />
      {error && <p style={{ fontSize: 12.5, color: C.rose, fontWeight: 700, textAlign: 'center', margin: '8px 0 0' }}>{error}</p>}
      <div className="flex gap-3" style={{ width: '100%', maxWidth: 430, marginTop: 10 }}>
        <button onClick={onCancel} disabled={saving} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>Cancelar</button>
        <button
          onClick={async () => onSave(designer.fullRecipe(), await designer.buildPngs())}
          disabled={saving} className="pg-btn pg-btn-rose pg-focus"
          style={{ flex: 1, padding: 12, fontSize: 13.5, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando…' : `Guardar · ${REDESIGN_COST}`}
        </button>
      </div>
    </Screen>
  );
}

export default function ShopScreen({ coins, game, setGame, outfits, customDecor, posters, onBack, hasRedesign, onStartRedesign, baseLook, initialTab = 'moda', onStartWork = () => {} }) {
  const [tab, setTab] = useState(initialTab);
  const [confirmingRedesign, setConfirmingRedesign] = useState(false);

  const buy = (cost, apply) => {
    const price = Math.max(0, Number(cost) || 0);
    if (coins < price) { play('bad'); return; }
    play('buy');
    setGame((g) => (g.coins < price ? g : apply({ ...g, coins: g.coins - price })));
  };

  const [cat, setCat] = useState('todo');
  const [place, setPlace] = useState('todo');
  function repaintFurniture(item, paintId) {
    setGame((g) => ({
      ...g,
      furniturePaint: { ...(g.furniturePaint || {}), [item.id]: paintId },
      placed: (g.placed || []).map((it) => (it.kind === 'mueble' && it.refId === item.id ? { ...it, paint: paintId } : it)),
    }));
  }
  function buyFurniture(item, paintId) {
    if ((game.ownedFurniture || []).includes(item.id) || pendingDelivery(game, 'mueble', item.id)) return;
    buy(item.price, (g) => addDelivery(g, { kind: 'mueble', refId: item.id, label: item.name, paint: paintId || 'natural' }));
  }
  function buyDecor(id, price, paintId) {
    if ((game.ownedDecor || []).map(String).includes(String(id))) return;
    if (pendingDelivery(game, 'decor', id)) return;
    const name = (DECOR_CATALOG.find((d) => d.id === id) || (customDecor || []).find((d) => String(d.id) === String(id)) || {}).name || 'Decoración';
    buy(price, (g) => addDelivery(g, { kind: 'decor', refId: id, label: name, ...(paintId ? { paint: paintId } : {}) }));
  }
  function repaintDecor(id, paintId) {
    setGame((g) => ({
      ...g,
      decorPaint: { ...(g.decorPaint || {}), [id]: paintId },
      placed: (g.placed || []).map((it) => (it.kind === 'decor' && it.refId === id ? { ...it, paint: paintId } : it)),
    }));
  }
  function buyPoster(p, paintId) {
    if ((game.ownedPosters || []).includes(p.id) || pendingDelivery(game, 'poster', p.id)) return;
    buy(p.price || 0, (g) => addDelivery(g, { kind: 'poster', refId: p.id, label: 'Póster', paint: paintId || 'natural' }));
  }
  function repaintPoster(p, paintId) {
    setGame((g) => ({
      ...g,
      posterPaint: { ...(g.posterPaint || {}), [p.id]: paintId },
      placed: (g.placed || []).map((it) => (it.kind === 'poster' && String(it.refId) === String(p.id) ? { ...it, paint: paintId } : it)),
    }));
  }
  // Pintar y enchapar se hace en el cuarto, con el dedo (ver PaintJob).
  function applyWall(value) { play('pop'); onStartWork({ kind: 'pared', value }); }
  function applyFloor(value) { play('pop'); onStartWork({ kind: 'piso', value }); }
  function buyWall(pattern, value) {
    if (ownsWall(game, pattern.id)) { applyWall(value); return; }
    buy(pattern.price, (g) => addDelivery(g, { kind: 'pared', refId: pattern.id, value, label: `Pintura: ${pattern.name}` }));
  }
  function buyFloor(pattern, value) {
    if (ownsFloor(game, pattern.id)) { applyFloor(value); return; }
    buy(pattern.price, (g) => addDelivery(g, { kind: 'piso', refId: pattern.id, value, label: `Piso: ${pattern.name}` }));
  }
  function buyOutfit(outfit) {
    if ((game.ownedOutfits || []).includes(outfit.id)) return;
    buy(outfit.price, (g) => ({ ...g, ownedOutfits: [...(g.ownedOutfits || []), outfit.id] }));
  }
  function toggleEquipOutfit(id) {
    play('pop');
    setGame((g) => ({ ...g, equippedOutfit: g.equippedOutfit === id ? null : id }));
  }

  const TABS = [['moda', 'Moda'], ['peluqueria', 'Peluquería'], ['super', 'Súper'], ['muebles', 'Muebles'], ['decor', 'Deco'], ['pared', 'Pared'], ['piso', 'Piso'], ['posters', 'Pósters'], ['ropa', 'Trajes'], ['rediseño', 'Rediseño']];
  const photoPosters = (posters || []).filter((p) => p.type === 'photo');

  return (
    <Screen>
      <ScreenHeader
        title="Tienda" subtitle="Gana monedas jugando y bañándola" onBack={onBack}
        right={
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.amberSoft, border: `1.5px solid ${C.amber}`, borderRadius: 999, padding: '4px 10px' }}>
            <IconCoin size={14} color={C.amber} />
            <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink }}>{coins}</span>
          </span>
        }
      />
      <div style={{ width: '100%', maxWidth: 340 }}>
        <TabRow>
          {TABS.map(([id, label]) => <ShopTab key={id} active={tab === id} onClick={() => { play('pop'); setTab(id); }}>{label}</ShopTab>)}
        </TabRow>
      </div>

      <div style={{ width: '100%', maxWidth: 340, paddingBottom: 16 }}>
        {tab === 'posters' && (photoPosters.length === 0 ? (
          <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
            <IconFrame size={28} color={C.lavender} />
            <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 0' }}>Quien te regaló esta mascota no subió fotos para pósters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {photoPosters.map((p) => {
              const owned = !p.price || (game.ownedPosters || []).includes(p.id);
              // si ya cuelga en el cuarto, se muestra con el color de ahí
              const placed = (game.placed || []).find((it) => it.kind === 'poster' && String(it.refId) === String(p.id));
              return (
                <PosterShopCard
                  key={p.id} poster={p} owned={owned} pending={pendingDelivery(game, 'poster', p.id)} paint={(placed && placed.paint) || game.posterPaint?.[p.id]}
                  canAfford={coins >= (p.price || 0)} onBuy={(paintId) => buyPoster(p, paintId)} onRepaint={(paintId) => repaintPoster(p, paintId)}
                />
              );
            })}
          </div>
        ))}

        {tab === 'moda' && <FashionShop game={game} setGame={setGame} coins={coins} buy={buy} baseLook={baseLook} />}
        {tab === 'peluqueria' && <Salon game={game} setGame={setGame} coins={coins} buy={buy} baseLook={baseLook} />}
        {tab === 'super' && <SuperTab game={game} coins={coins} buy={buy} />}

        {tab === 'muebles' && (
          <>
            <TabRow style={{ padding: '0 2px 8px' }}>
              {[{ id: 'todo', name: 'Todo' }, ...FURNITURE_CATEGORIES].map((c) => (
                <ShopTab key={c.id} active={cat === c.id} onClick={() => { play('pop'); setCat(c.id); }}>{c.name}</ShopTab>
              ))}
            </TabRow>
            {FURNITURE.filter((it) => cat === 'todo' || it.cat === cat).map((item) => (
              <FurnitureShopCard
                key={item.id} item={item} owned={(game.ownedFurniture || []).includes(item.id)} pending={pendingDelivery(game, 'mueble', item.id)} ownedPaint={game.furniturePaint?.[item.id]}
                canAfford={coins >= item.price} onBuy={(paintId) => buyFurniture(item, paintId)} onRepaint={(paintId) => repaintFurniture(item, paintId)}
              />
            ))}
          </>
        )}

        {tab === 'decor' && (
          <>
            {(customDecor || []).length > 0 && (
              <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '0 0 8px' }}>Cosas que eligió quien te regaló esto</p>
            )}
            {(customDecor || []).map((d) => {
              const owned = (game.ownedDecor || []).map(String).includes(String(d.id));
              return (
                <ShopItemCard
                  key={d.id} image={<Sprite src={d.image} w={50} h={50} kind="art" />}
                  name={d.name} note={d.description} price={d.price} owned={owned}
                  canAfford={coins >= d.price} actionLabel={owned ? 'Comprado' : 'Comprar'} onAction={() => buyDecor(d.id, d.price)}
                />
              );
            })}
            <p style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, margin: '14px 0 8px' }}>Del catálogo</p>
            <PlaceRow value={place} onChange={setPlace} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9 }}>
              {DECOR_CATALOG.filter((it) => place === 'todo' || it.place === place).map((item) => (
                <DecorShopCard
                  key={item.id} item={item} owned={(game.ownedDecor || []).includes(item.id)} pending={pendingDelivery(game, 'decor', item.id)} paint={game.decorPaint?.[item.id]}
                  canAfford={coins >= item.price} onBuy={(paintId) => buyDecor(item.id, item.price, item.paintable ? paintId : null)} onRepaint={(paintId) => repaintDecor(item.id, paintId)}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'pared' && WALL_STYLES.map((w) => (
          <SurfaceCard
            key={w.id} pattern={w} kind="pared" owned={ownsWall(game, w.id)} pending={pendingDelivery(game, 'pared', w.id)} current={findWall(game.wall)}
            canAfford={coins >= w.price} onBuy={(value) => buyWall(w, value)} onApply={applyWall}
          />
        ))}

        {tab === 'piso' && FLOOR_STYLES.map((f) => (
          <SurfaceCard
            key={f.id} pattern={f} kind="piso" owned={ownsFloor(game, f.id)} pending={pendingDelivery(game, 'piso', f.id)} current={findFloor(game.floor)}
            canAfford={coins >= f.price} onBuy={(value) => buyFloor(f, value)} onApply={applyFloor}
          />
        ))}

        {tab === 'ropa' && (outfits.length === 0 ? (
          <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
            <IconShirt size={28} color={C.rose} />
            <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 0' }}>Quien te regaló esta mascota no diseñó ropa</p>
          </div>
        ) : outfits.map((o) => {
          const owned = (game.ownedOutfits || []).includes(o.id);
          const equipped = game.equippedOutfit === o.id;
          return (
            <ShopItemCard
              key={o.id} image={<PetArt look={lookOf({}, o)} size={50} />}
              name={o.name} price={o.price} owned={owned} equipped={equipped} canAfford={coins >= o.price}
              actionLabel={owned ? (equipped ? 'Quitar' : 'Poner') : 'Comprar'}
              onAction={() => (owned ? toggleEquipOutfit(o.id) : buyOutfit(o))}
            />
          );
        }))}

        {tab === 'rediseño' && (
          <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
            <IconSparkle size={28} color={C.lavender} />
            <p style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, margin: '10px 0 6px', color: C.ink }}>
              {hasRedesign ? 'Rediseñar de nuevo' : 'Rediseña a tu mascota'}
            </p>
            <p style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.45, marginBottom: 14 }}>
              Abre el mismo creador que usó quien te regaló esto, partiendo de cómo se ve hoy. El diseño original nunca se pierde.
            </p>
            <button
              onClick={() => { play('pop'); setConfirmingRedesign(true); }} disabled={coins < REDESIGN_COST}
              className="pg-btn pg-btn-rose pg-focus" style={{ padding: '10px 20px', fontSize: 13 }}
            >
              Rediseñar · {REDESIGN_COST} monedas
            </button>
            {coins < REDESIGN_COST && <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 8 }}>Te faltan {REDESIGN_COST - coins} monedas</p>}
          </div>
        )}
      </div>

      {confirmingRedesign && (
        <RedesignConfirmModal
          onConfirm={() => { setConfirmingRedesign(false); onStartRedesign(); }}
          onCancel={() => setConfirmingRedesign(false)}
        />
      )}
    </Screen>
  );
}
