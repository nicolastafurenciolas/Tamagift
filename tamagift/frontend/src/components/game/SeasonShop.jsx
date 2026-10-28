import React from 'react';
import { C, FONT, soft } from '../../theme';
import Sprite from '../Sprite';
import { WARDROBE } from '../../wardrobeState';
import { DECOR_CATALOG } from '../../shopCatalog';
import { seasonCountdown } from '../../seasons';
import { FashionCard } from './Fashion';
import { DecorShopCard } from './Shop';
import { pendingDelivery } from '../../deliveries';

// ─────────────────────────────────────────────────────────────────
// La pestaña de temporada de la tienda (Halloween): todo lo que solo se
// vende estos días, junto, con la cuenta regresiva. Lo comprado sigue en
// el vestidor y en la decoración cuando la temporada termina.
// ─────────────────────────────────────────────────────────────────

const decor = (id) => DECOR_CATALOG.find((d) => d.id === id);

function Banner({ season }) {
  const [a, b] = (season.banner || []).map(decor);
  return (
    <div className="pg-card" style={{ padding: '12px 12px 12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, background: soft(season.color, 0.82), borderColor: season.color }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>{season.name}</div>
        <p style={{ fontSize: 12, color: C.inkSoft, margin: '4px 0 7px', lineHeight: 1.35 }}>
          Disfraces y decoración solo hasta {season.until}. Lo que compres es tuyo para siempre.
        </p>
        <span style={{ display: 'inline-block', fontFamily: FONT.display, fontSize: 12, fontWeight: 800, color: C.onAccent, background: season.color, borderRadius: 999, padding: '3px 10px' }}>
          {seasonCountdown(season)}
        </span>
      </div>
      <div style={{ position: 'relative', width: 104, height: 86, flexShrink: 0 }}>
        {b && <div style={{ position: 'absolute', right: 0, top: 0 }}><Sprite markup={b.svg()} cacheKey={`season-${season.id}-b`} w={62} h={70} /></div>}
        {a && <div style={{ position: 'absolute', left: 0, bottom: 0 }}><Sprite markup={a.svg()} cacheKey={`season-${season.id}-a`} w={64} h={60} /></div>}
      </div>
    </div>
  );
}

export default function SeasonShop({ season, game, setGame, coins, buy, baseLook, onBuyDecor, onRepaintDecor }) {
  const baseRecipe = baseLook && baseLook.recipe;
  const wear = WARDROBE.filter((w) => w.season === season.id);
  const deco = DECOR_CATALOG.filter((d) => d.season === season.id && !d.giftOnly);
  const title = (t) => <p style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft, margin: '4px 0 8px' }}>{t}</p>;
  return (
    <>
      <Banner season={season} />
      {baseRecipe && (
        <>
          {title('Disfraces y accesorios')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9, marginBottom: 14 }}>
            {wear.map((it) => <FashionCard key={`${it.slot}:${it.id}`} item={it} recipe={baseRecipe} game={game} setGame={setGame} baseRecipe={baseRecipe} coins={coins} buy={buy} />)}
          </div>
        </>
      )}
      {title('Para decorar')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9 }}>
        {deco.map((item) => (
          <DecorShopCard
            key={item.id} item={item} owned={(game.ownedDecor || []).includes(item.id)} pending={pendingDelivery(game, 'decor', item.id)} paint={game.decorPaint?.[item.id]}
            canAfford={coins >= item.price} onBuy={(paintId) => onBuyDecor(item.id, item.price, item.paintable ? paintId : null)} onRepaint={(paintId) => onRepaintDecor(item.id, paintId)}
          />
        ))}
      </div>
    </>
  );
}
