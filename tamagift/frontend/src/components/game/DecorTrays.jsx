import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { IconBag } from '../icons';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { newPlacementKey, ROOM } from '../../gameState';
import { findDecor } from '../../shopCatalog';
import { findFurniture, findPaint } from '../../roomCatalog';
import { defaultPlacement } from '../Room';
import { ShopTab, TabRow } from './Shop';
import { PosterArt } from './posters';

// ── Bandejas de decoración ────────────────────────────────────────
// Panel bajo el cuarto para poner y quitar lo comprado sin salir de la
// escena. Tiene alto máximo y scroll propio: así nunca empuja la página
// (antes con unas pocas cosas ya obligaba a hacer scroll).

function TrayItem({ children, label, active, onClick }) {
  return (
    <button
      onClick={onClick} className="pg-focus" title={label} aria-label={label} aria-pressed={active}
      style={{
        position: 'relative', width: 62, height: 62, borderRadius: 14, cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
        background: C.surface, border: active ? `3px solid ${C.sage}` : `1.5px solid ${C.line}`,
        boxShadow: active ? SHADOW.soft : 'none', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
      {active && (
        <span style={{ position: 'absolute', top: 2, right: 2, background: C.sage, color: C.onAccent, borderRadius: '50%', width: 17, height: 17, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
      )}
    </button>
  );
}

function TrayGrid({ children, empty }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (!items.length) {
    return <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '6px 0', textAlign: 'center' }}>{empty}</p>;
  }
  return <div className="pg-scroll-x" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>{items}</div>;
}

export default function DecorTrays({ posters, customDecor, game, setGame, cameraRef, onGoShop }) {
  const [tray, setTray] = useState('muebles');
  const placedKeys = new Set((game.placed || []).map((p) => `${p.kind}:${p.refId}`));
  const isPlaced = (kind, refId) => placedKeys.has(`${kind}:${refId}`);

  function addToRoom(kind, refId) {
    play('place');
    setGame((g) => ({
      ...g,
      placed: [...(g.placed || []), {
        key: newPlacementKey(kind),
        ...defaultPlacement(kind, refId, posters, customDecor, {
          centerX: cameraRef ? cameraRef.current : ROOM.W / 2,
          placed: g.placed || [],
          paint: kind === 'mueble' ? (g.furniturePaint?.[refId] || 'natural') : 'natural',
        }),
      }],
    }));
  }
  function removeFromRoom(kind, refId) {
    play('pop');
    setGame((g) => ({ ...g, placed: (g.placed || []).filter((p) => !(p.kind === kind && String(p.refId) === String(refId))) }));
  }
  const toggle = (kind, refId) => (isPlaced(kind, refId) ? removeFromRoom(kind, refId) : addToRoom(kind, refId));

  const ownedFurniture = (game.ownedFurniture || []).map(findFurniture).filter(Boolean);

  return (
    <div className="pg-card" style={{ padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <TabRow style={{ padding: '2px 2px 6px', width: 'auto', flex: 1 }}>
          <ShopTab active={tray === 'muebles'} onClick={() => { play('pop'); setTray('muebles'); }}>Muebles</ShopTab>
          <ShopTab active={tray === 'decor'} onClick={() => { play('pop'); setTray('decor'); }}>Deco</ShopTab>
          <ShopTab active={tray === 'posters'} onClick={() => { play('pop'); setTray('posters'); }}>Pósters</ShopTab>
        </TabRow>
        {onGoShop && (
          <button onClick={onGoShop} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 11.5, fontWeight: 700, color: C.lavender, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <IconBag size={14} color={C.lavender} /> Tienda
          </button>
        )}
      </div>

      {tray === 'posters' && (
        <TrayGrid empty="Compra pósters en la tienda para colgarlos">
          {posters.filter((p) => !p.price || (game.ownedPosters || []).includes(p.id)).map((p) => (
            <TrayItem key={p.id} label="Póster" active={isPlaced('poster', p.id)} onClick={() => toggle('poster', p.id)}>
              <PosterArt poster={p} w={58} h={58} />
            </TrayItem>
          ))}
        </TrayGrid>
      )}

      {tray === 'muebles' && (
        <TrayGrid empty="Compra muebles en la tienda para amoblar el cuarto">
          {ownedFurniture.map((f) => {
            const paint = game.furniturePaint?.[f.id] || 'natural';
            return (
              <TrayItem key={f.id} label={f.name} active={isPlaced('mueble', f.id)} onClick={() => toggle('mueble', f.id)}>
                <Sprite art={f.render(findPaint(paint))} cacheKey={`furn-${f.id}-${paint}`} w={52} h={52} />
              </TrayItem>
            );
          })}
        </TrayGrid>
      )}

      {tray === 'decor' && (
        <TrayGrid empty="Compra decoración en la tienda">
          {(game.ownedDecor || []).map((id) => {
            const custom = (customDecor || []).find((d) => String(d.id) === String(id));
            const gen = findDecor(id);
            if (!custom && !gen) return null;
            return (
              <TrayItem key={id} label={custom ? custom.name : gen.name} active={isPlaced('decor', id)} onClick={() => toggle('decor', id)}>
                {custom
                  ? <Sprite src={custom.image} w={52} h={52} kind="art" />
                  : <Sprite art={gen.render()} cacheKey={`decor-${gen.id}`} w={50} h={50} />}
              </TrayItem>
            );
          })}
        </TrayGrid>
      )}
      <p style={{ fontSize: 11, color: C.inkFaint, margin: '6px 0 0', textAlign: 'center' }}>Toca para poner o quitar · arrastra en el cuarto para acomodar</p>
    </div>
  );
}
