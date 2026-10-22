import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader, Modal } from '../ui';
import { IconCoin, IconFrame, IconShirt, IconSparkle } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import PetArt from '../PetArt';
import { lookOf } from '../../petLook';
import { DECOR_CATALOG } from '../../shopCatalog';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS, findPaint } from '../../roomCatalog';
import { ModularPetStep, useDesignerState } from '../PetDesigner';
import { PosterArt } from './posters';

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

function FurnitureShopCard({ item, owned, ownedPaint, canAfford, onBuy }) {
  const [choice, setChoice] = useState('natural');
  const activePaint = owned ? (ownedPaint || 'natural') : choice;
  return (
    <div className="pg-card" style={{ padding: 11, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 58, height: 58, borderRadius: 12, background: C.paperDeep, border: `1.5px solid ${C.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Sprite art={item.render(findPaint(activePaint))} cacheKey={`furn-${item.id}-${activePaint}`} w={52} h={52} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink }}>{item.name}</div>
          {item.place === 'pared' && <div style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.25, marginTop: 1 }}>Va colgado en la pared</div>}
          <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
            {!owned && <IconCoin size={13} color={C.amber} />} {owned ? 'Comprado' : `${item.price} monedas`}
          </div>
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
      {!owned && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {FURNITURE_PAINTS.map((p) => (
            <button
              key={p.id} onClick={() => { play('pop'); setChoice(p.id); }} className="pg-focus pg-keep-round"
              aria-label={`Color ${p.id}`} title={p.id}
              style={{
                width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', padding: 0,
                background: `linear-gradient(135deg, ${p.wood} 50%, ${p.cloth} 50%)`,
                border: choice === p.id ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
                boxShadow: choice === p.id ? SHADOW.soft : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SurfaceSwatch({ style }) {
  const art = (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" fill={style.base} />
      {style.render && style.render(120, 120)}
    </svg>
  );
  return <Sprite art={art} cacheKey={`swatch-${style.id}`} w={52} h={52} kind="surface" fit="cover" />;
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

export default function ShopScreen({ coins, game, setGame, outfits, customDecor, posters, onBack, hasRedesign, onStartRedesign }) {
  const [tab, setTab] = useState('muebles');
  const [confirmingRedesign, setConfirmingRedesign] = useState(false);

  const buy = (cost, apply) => {
    const price = Math.max(0, Number(cost) || 0);
    if (coins < price) { play('bad'); return; }
    play('buy');
    setGame((g) => (g.coins < price ? g : apply({ ...g, coins: g.coins - price })));
  };

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
  function buyPoster(p) {
    if ((game.ownedPosters || []).includes(p.id)) return;
    buy(p.price || 0, (g) => ({ ...g, ownedPosters: [...(g.ownedPosters || []), p.id] }));
  }
  function buyWall(w) {
    if ((game.ownedWalls || []).includes(w.id)) { play('place'); setGame((g) => ({ ...g, wall: w.id })); return; }
    buy(w.price, (g) => ({ ...g, ownedWalls: [...(g.ownedWalls || []), w.id], wall: w.id }));
  }
  function buyFloor(f) {
    if ((game.ownedFloors || []).includes(f.id)) { play('place'); setGame((g) => ({ ...g, floor: f.id })); return; }
    buy(f.price, (g) => ({ ...g, ownedFloors: [...(g.ownedFloors || []), f.id], floor: f.id }));
  }
  function buyOutfit(outfit) {
    if ((game.ownedOutfits || []).includes(outfit.id)) return;
    buy(outfit.price, (g) => ({ ...g, ownedOutfits: [...(g.ownedOutfits || []), outfit.id] }));
  }
  function toggleEquipOutfit(id) {
    play('pop');
    setGame((g) => ({ ...g, equippedOutfit: g.equippedOutfit === id ? null : id }));
  }

  const TABS = [['muebles', 'Muebles'], ['decor', 'Deco'], ['posters', 'Pósters'], ['pared', 'Pared'], ['piso', 'Piso'], ['ropa', 'Ropa'], ['rediseño', 'Rediseño']];
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
        ) : photoPosters.map((p) => {
          const owned = !p.price || (game.ownedPosters || []).includes(p.id);
          return (
            <ShopItemCard
              key={p.id} image={<PosterArt poster={p} w={52} h={52} />} name="Póster" price={p.price || 0} owned={owned}
              canAfford={coins >= (p.price || 0)} actionLabel={owned ? 'Tuyo' : 'Comprar'} onAction={() => buyPoster(p)}
            />
          );
        }))}

        {tab === 'muebles' && FURNITURE.map((item) => (
          <FurnitureShopCard
            key={item.id} item={item} owned={(game.ownedFurniture || []).includes(item.id)} ownedPaint={game.furniturePaint?.[item.id]}
            canAfford={coins >= item.price} onBuy={(paintId) => buyFurniture(item, paintId)}
          />
        ))}

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
                  key={item.id} image={<Sprite art={item.render()} cacheKey={`decor-${item.id}`} w={46} h={46} />}
                  name={item.name} price={item.price} owned={owned}
                  canAfford={coins >= item.price} actionLabel={owned ? 'Comprado' : 'Comprar'} onAction={() => buyDecor(item.id, item.price)}
                />
              );
            })}
          </>
        )}

        {tab === 'pared' && WALL_STYLES.map((w) => {
          const owned = (game.ownedWalls || []).includes(w.id);
          const active = game.wall === w.id;
          return (
            <ShopItemCard
              key={w.id} image={<SurfaceSwatch style={w} />} name={w.name} price={w.price} owned={owned} equipped={active}
              canAfford={coins >= w.price} actionLabel={active ? 'Puesta' : owned ? 'Pintar' : 'Comprar'} onAction={() => buyWall(w)}
            />
          );
        })}

        {tab === 'piso' && FLOOR_STYLES.map((f) => {
          const owned = (game.ownedFloors || []).includes(f.id);
          const active = game.floor === f.id;
          return (
            <ShopItemCard
              key={f.id} image={<SurfaceSwatch style={f} />} name={f.name} price={f.price} owned={owned} equipped={active}
              canAfford={coins >= f.price} actionLabel={active ? 'Puesto' : owned ? 'Poner' : 'Comprar'} onAction={() => buyFloor(f)}
            />
          );
        })}

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
