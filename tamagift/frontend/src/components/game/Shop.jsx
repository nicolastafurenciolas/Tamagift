import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader, Modal } from '../ui';
import { IconCoin, IconFrame, IconShirt, IconSparkle } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import PetArt from '../PetArt';
import { lookOf } from '../../petLook';
import { HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, geometry } from '../../art/mochi';
import { DECOR_CATALOG } from '../../shopCatalog';
import {
  FURNITURE, FURNITURE_CATEGORIES, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS,
  findWall, findFloor, wallSwatchSvg, floorSwatchSvg, ownsWall, ownsFloor,
} from '../../roomCatalog';
import { ModularPetStep, useDesignerState } from '../PetDesigner';
import { FramedPoster } from './posters';

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

// Póster: se ve enmarcado y el marco se pinta antes (o después) de comprar.
function PosterShopCard({ poster, owned, paint, canAfford, onBuy, onRepaint }) {
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
        onClick={() => { if (!owned) onBuy(active); }} disabled={!can || owned} className="pg-focus"
        style={{
          marginTop: 8, padding: '7px 6px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
          cursor: owned || !can ? 'default' : 'pointer',
          background: owned ? C.surfaceAlt : can ? C.rose : C.track,
          color: owned ? C.inkSoft : can ? C.onAccent : C.inkFaint,
          border: `1.5px solid ${owned ? C.line : can ? C.rose : C.track}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        {owned ? 'Tuyo' : <><IconCoin size={12} color={can ? C.onAccent : C.inkFaint} /> {price}</>}
      </button>
    </div>
  );
}

function FurnitureShopCard({ item, owned, ownedPaint, canAfford, onBuy, onRepaint }) {
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
          onClick={() => onBuy(choice)} disabled={owned || !canAfford} className="pg-focus"
          style={{
            padding: '8px 13px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
            cursor: owned || !canAfford ? 'default' : 'pointer',
            background: owned ? C.surfaceAlt : (!canAfford ? C.track : C.rose),
            color: owned ? C.ink : !canAfford ? C.inkFaint : C.onAccent,
            border: `1.5px solid ${owned ? C.line : !canAfford ? C.track : C.rose}`, whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {owned ? 'Comprado' : 'Comprar'}
        </button>
      </div>
      <PaintRow value={activePaint} onPick={(id) => (owned ? onRepaint(id) : setChoice(id))} />
    </div>
  );
}

// Una pared o un piso: el diseño con todos sus colores. Comprar el
// diseño deja usar cualquiera de sus colores.
function SurfaceCard({ pattern, kind, owned, current, canAfford, onBuy, onApply }) {
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
            {!owned && <IconCoin size={13} color={C.amber} />} {owned ? (inUse ? 'Puesto' : 'Tuyo') : pattern.price ? `${pattern.price} monedas` : 'Gratis'}
          </div>
        </div>
        <button
          onClick={() => (owned ? onApply(value) : onBuy(value))} disabled={inUse || (!owned && !canAfford)} className="pg-focus"
          style={{
            padding: '8px 13px', borderRadius: 999, fontFamily: FONT.display, fontSize: 12, fontWeight: 700,
            cursor: inUse || (!owned && !canAfford) ? 'default' : 'pointer',
            background: inUse ? C.sage : owned ? C.surfaceAlt : (!canAfford ? C.track : C.rose),
            color: inUse ? C.onAccent : owned ? C.ink : !canAfford ? C.inkFaint : C.onAccent,
            border: `1.5px solid ${inUse ? C.sage : owned ? C.line : !canAfford ? C.track : C.rose}`, whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {inUse ? 'Puesto' : owned ? 'Poner' : 'Comprar'}
        </button>
      </div>
      <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
        {pattern.tints.map((t) => (
          <button
            key={t.id} title={t.name} aria-label={t.name} className="pg-focus pg-keep-round"
            onClick={() => { play('pop'); setTint(t.id); if (owned) onApply(`${pattern.id}.${t.id}`); }}
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

// ── Accesorios para la mochi ──────────────────────────────────────
const ACC_GROUPS = [
  { field: 'headAcc', name: 'Cabeza', list: HEAD_ACCESSORIES, base: 90 },
  { field: 'neckAcc', name: 'Cuello', list: NECK_ACCESSORIES, base: 70 },
  { field: 'extraAcc', name: 'Cara', list: EXTRA_ACCESSORIES, base: 45 },
];
export const ACC_COLORS = ['#E57B93', '#FF7FA8', '#F28C38', '#F7D56B', '#7FB894', '#7FC8F8', '#5B7BD9', '#B892E0', '#8E1F2C', '#3A3542', '#FFFFFF', '#C9A227'];
const accPrice = (g, i) => g.base + (i % 5) * 15;

function accView(field, recipe) {
  const gm = geometry(recipe.body);
  const box = (cx, cy, w) => `${(cx - w / 2).toFixed(1)} ${(cy - w / 2).toFixed(1)} ${w} ${w}`;
  if (field === 'headAcc') return box(100, gm.top + 10, 140);
  if (field === 'neckAcc') return box(100, gm.neckY + 4, 120);
  return box(100, gm.face.y + 4, 104);
}

function AccessoryCard({ group, item, index, recipe, owned, worn, color, canAfford, onBuy, onWear }) {
  const price = accPrice(group, index);
  const preview = { ...recipe, overlays: undefined, [group.field]: item.id, accColor: color };
  return (
    <div className="pg-card" style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
      <div style={{ width: 70, height: 70, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
        <PetArt recipe={preview} size={66} view={accView(group.field, recipe)} />
      </div>
      <div style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1.1, minHeight: 28, display: 'grid', placeItems: 'center' }}>{item.label}</div>
      <button
        onClick={() => (owned ? onWear() : onBuy(price))} disabled={!owned && !canAfford(price)} className="pg-focus"
        style={{
          width: '100%', padding: '6px 6px', borderRadius: 999, fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700,
          cursor: !owned && !canAfford(price) ? 'default' : 'pointer',
          background: worn ? C.sage : owned ? C.surfaceAlt : (!canAfford(price) ? C.track : C.rose),
          color: worn ? C.onAccent : owned ? C.ink : !canAfford(price) ? C.inkFaint : C.onAccent,
          border: `1.5px solid ${worn ? C.sage : owned ? C.line : !canAfford(price) ? C.track : C.rose}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        {worn ? 'Quitar' : owned ? 'Poner' : <><IconCoin size={12} color={C.onAccent} /> {price}</>}
      </button>
    </div>
  );
}

function AccessoriesTab({ game, setGame, coins, buy, baseLook }) {
  const [group, setGroup] = useState(ACC_GROUPS[0].field);
  const recipe = baseLook && baseLook.recipe;
  if (!recipe) {
    return (
      <div className="pg-card" style={{ padding: 18, textAlign: 'center' }}>
        <IconSparkle size={28} color={C.lavender} />
        <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '10px 0 0' }}>Esta mascota se dibujó a mano, así que no lleva accesorios de la tienda.</p>
      </div>
    );
  }
  const wearing = game.wearing || {};
  const color = wearing.accColor || recipe.accColor || recipe.accentColor;
  const g = ACC_GROUPS.find((x) => x.field === group);
  const owned = new Set(game.ownedAcc || []);
  const key = (id) => `${group}:${id}`;
  const wornNow = wearing[group] != null ? wearing[group] : recipe[group];
  return (
    <>
      <TabRow style={{ padding: '0 2px 8px' }}>
        {ACC_GROUPS.map((x) => <ShopTab key={x.field} active={group === x.field} onClick={() => { play('pop'); setGroup(x.field); }}>{x.name}</ShopTab>)}
      </TabRow>
      <div className="pg-card" style={{ padding: '10px 12px', marginBottom: 10 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Color de los accesorios</div>
        <div className="pg-scroll-x" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {ACC_COLORS.map((c) => (
            <button
              key={c} aria-label={`Color ${c}`} className="pg-focus pg-keep-round"
              onClick={() => { play('pop'); setGame((st) => ({ ...st, wearing: { ...(st.wearing || {}), accColor: c } })); }}
              style={{ width: 26, height: 26, flexShrink: 0, borderRadius: '50%', padding: 0, cursor: 'pointer', background: c, border: color === c ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}` }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {g.list.filter((it) => it.id !== 'ninguno').map((it, i) => {
          const fromGift = recipe[group] === it.id;   // ya venía puesto en el regalo
          const isOwned = fromGift || owned.has(key(it.id));
          const worn = wornNow === it.id;
          return (
            <AccessoryCard
              key={it.id} group={g} item={it} index={i} recipe={recipe} owned={isOwned} worn={worn} color={color}
              canAfford={(p) => coins >= p}
              onBuy={(price) => buy(price, (st) => ({ ...st, ownedAcc: [...(st.ownedAcc || []), key(it.id)], wearing: { ...(st.wearing || {}), [group]: it.id } }))}
              onWear={() => { play(worn ? 'pop' : 'place'); setGame((st) => ({ ...st, wearing: { ...(st.wearing || {}), [group]: worn ? 'ninguno' : it.id } })); }}
            />
          );
        })}
      </div>
    </>
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

export default function ShopScreen({ coins, game, setGame, outfits, customDecor, posters, onBack, hasRedesign, onStartRedesign, baseLook }) {
  const [tab, setTab] = useState('muebles');
  const [confirmingRedesign, setConfirmingRedesign] = useState(false);

  const buy = (cost, apply) => {
    const price = Math.max(0, Number(cost) || 0);
    if (coins < price) { play('bad'); return; }
    play('buy');
    setGame((g) => (g.coins < price ? g : apply({ ...g, coins: g.coins - price })));
  };

  const [cat, setCat] = useState('todo');
  function repaintFurniture(item, paintId) {
    setGame((g) => ({
      ...g,
      furniturePaint: { ...(g.furniturePaint || {}), [item.id]: paintId },
      placed: (g.placed || []).map((it) => (it.kind === 'mueble' && it.refId === item.id ? { ...it, paint: paintId } : it)),
    }));
  }
  function buyFurniture(item, paintId) {
    if ((game.ownedFurniture || []).includes(item.id)) return;
    buy(item.price, (g) => ({
      ...g,
      ownedFurniture: [...(g.ownedFurniture || []), item.id],
      furniturePaint: { ...(g.furniturePaint || {}), [item.id]: paintId || 'natural' },
    }));
  }
  function buyDecor(id, price) {
    if ((game.ownedDecor || []).map(String).includes(String(id))) return;
    buy(price, (g) => ({ ...g, ownedDecor: [...(g.ownedDecor || []), id] }));
  }
  function buyPoster(p, paintId) {
    if ((game.ownedPosters || []).includes(p.id)) return;
    buy(p.price || 0, (g) => ({ ...g, ownedPosters: [...(g.ownedPosters || []), p.id], posterPaint: { ...(g.posterPaint || {}), [p.id]: paintId || 'natural' } }));
  }
  function repaintPoster(p, paintId) {
    setGame((g) => ({
      ...g,
      posterPaint: { ...(g.posterPaint || {}), [p.id]: paintId },
      placed: (g.placed || []).map((it) => (it.kind === 'poster' && String(it.refId) === String(p.id) ? { ...it, paint: paintId } : it)),
    }));
  }
  function applyWall(value) { play('place'); setGame((g) => ({ ...g, wall: value })); }
  function applyFloor(value) { play('place'); setGame((g) => ({ ...g, floor: value })); }
  function buyWall(pattern, value) {
    if (ownsWall(game, pattern.id)) { applyWall(value); return; }
    buy(pattern.price, (g) => ({ ...g, ownedWalls: [...(g.ownedWalls || []), pattern.id], wall: value }));
  }
  function buyFloor(pattern, value) {
    if (ownsFloor(game, pattern.id)) { applyFloor(value); return; }
    buy(pattern.price, (g) => ({ ...g, ownedFloors: [...(g.ownedFloors || []), pattern.id], floor: value }));
  }
  function buyOutfit(outfit) {
    if ((game.ownedOutfits || []).includes(outfit.id)) return;
    buy(outfit.price, (g) => ({ ...g, ownedOutfits: [...(g.ownedOutfits || []), outfit.id] }));
  }
  function toggleEquipOutfit(id) {
    play('pop');
    setGame((g) => ({ ...g, equippedOutfit: g.equippedOutfit === id ? null : id }));
  }

  const TABS = [['muebles', 'Muebles'], ['accesorios', 'Accesorios'], ['decor', 'Deco'], ['pared', 'Pared'], ['piso', 'Piso'], ['posters', 'Pósters'], ['ropa', 'Ropa'], ['rediseño', 'Rediseño']];
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
                  key={p.id} poster={p} owned={owned} paint={(placed && placed.paint) || game.posterPaint?.[p.id]}
                  canAfford={coins >= (p.price || 0)} onBuy={(paintId) => buyPoster(p, paintId)} onRepaint={(paintId) => repaintPoster(p, paintId)}
                />
              );
            })}
          </div>
        ))}

        {tab === 'accesorios' && <AccessoriesTab game={game} setGame={setGame} coins={coins} buy={buy} baseLook={baseLook} />}

        {tab === 'muebles' && (
          <>
            <TabRow style={{ padding: '0 2px 8px' }}>
              {[{ id: 'todo', name: 'Todo' }, ...FURNITURE_CATEGORIES].map((c) => (
                <ShopTab key={c.id} active={cat === c.id} onClick={() => { play('pop'); setCat(c.id); }}>{c.name}</ShopTab>
              ))}
            </TabRow>
            {FURNITURE.filter((it) => cat === 'todo' || it.cat === cat).map((item) => (
              <FurnitureShopCard
                key={item.id} item={item} owned={(game.ownedFurniture || []).includes(item.id)} ownedPaint={game.furniturePaint?.[item.id]}
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
            {DECOR_CATALOG.map((item) => {
              const owned = (game.ownedDecor || []).includes(item.id);
              return (
                <ShopItemCard
                  key={item.id} image={<Sprite markup={item.svg()} cacheKey={`decor-${item.id}`} w={48} h={48} />}
                  note={item.place === 'sobre' ? 'Se puede poner encima de los muebles' : undefined}
                  name={item.name} price={item.price} owned={owned}
                  canAfford={coins >= item.price} actionLabel={owned ? 'Comprado' : 'Comprar'} onAction={() => buyDecor(item.id, item.price)}
                />
              );
            })}
          </>
        )}

        {tab === 'pared' && WALL_STYLES.map((w) => (
          <SurfaceCard
            key={w.id} pattern={w} kind="pared" owned={ownsWall(game, w.id)} current={findWall(game.wall)}
            canAfford={coins >= w.price} onBuy={(value) => buyWall(w, value)} onApply={applyWall}
          />
        ))}

        {tab === 'piso' && FLOOR_STYLES.map((f) => (
          <SurfaceCard
            key={f.id} pattern={f} kind="piso" owned={ownsFloor(game, f.id)} current={findFloor(game.floor)}
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
