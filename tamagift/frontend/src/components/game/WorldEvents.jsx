import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Modal } from '../ui';
import Sprite from '../Sprite';
import PetArt from '../PetArt';
import { play } from '../../sound';
import { ROOM } from '../../gameState';
import { UI_SPRITES, foodSpriteFor } from '../../sprites';
import { BUG_ART, envelopeSvg, crumbSvg } from '../../art/room/world';
import { BUGS } from '../../worldEvents';
import { findFood } from '../../foodCatalog';

// ─────────────────────────────────────────────────────────────────
// Los sucesos dibujados dentro del cuarto (coordenadas del mundo) y la
// carta de quien regaló. La lógica de cuándo pasan está en
// worldEvents.js; acá solo se ven y se tocan.
// ─────────────────────────────────────────────────────────────────

const bugName = (id) => (BUGS.find((b) => b.id === id) || {}).label || 'Bichito';

function Tap({ x, y, w, h, onTap, label, children, className, style }) {
  return (
    <button
      data-tap aria-label={label} onClick={onTap} className={className}
      style={{ position: 'absolute', left: x, top: y, width: w, height: h, padding: 0, border: 'none', background: 'none', cursor: 'pointer', zIndex: 4, ...style }}
    >
      {children}
    </button>
  );
}

export default function WorldEvents({ event, onResolve, onLetter, onHip }) {
  const [gone, setGone] = useState(() => new Set());
  useEffect(() => { setGone(new Set()); }, [event && event.id]);

  // hipo: salta cada tanto; tocarla justo después cuenta
  useEffect(() => {
    if (!event || event.type !== 'hipo' || !onHip) return undefined;
    const id = setInterval(() => onHip(), 2300);
    return () => clearInterval(id);
  }, [event && event.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!event) return null;
  const d = event.data || {};
  switch (event.type) {
    case 'bichito': {
      const dir = d.dir || 1;
      const art = (BUG_ART[d.bug] || BUG_ART.mariposa)();
      return (
        <div className="pg-fly-across" style={{ position: 'absolute', left: dir > 0 ? -60 : ROOM.W + 10, top: d.y, '--pg-dist': `${dir * (ROOM.W + 80)}px`, zIndex: 4 }}>
          <Tap x={0} y={0} w={56} h={56} label={`Atrapar ${bugName(d.bug)}`} className="pg-flutter"
            onTap={() => { play('good'); onResolve({ bug: d.bug, coins: 12, reason: `${bugName(d.bug).toLowerCase()} al álbum`, bubble: `¡Atrapaste una ${bugName(d.bug).toLowerCase()}!`, react: 'happy' }); }}
          >
            <div style={{ transform: dir < 0 ? 'scaleX(-1)' : undefined }}><Sprite markup={art} cacheKey={`bug-${d.bug}`} w={56} h={56} /></div>
          </Tap>
        </div>
      );
    }
    case 'moneda': {
      const sp = UI_SPRITES.moneda;
      return (
        <Tap x={d.x - 22} y={ROOM.H - 58} w={44} h={44} label="Recoger la moneda" className="pg-glint"
          onTap={() => onResolve({ coins: d.amount || 10, reason: 'moneda encontrada', bubble: '¡Una moneda escondida!' })}
        >
          <Sprite art={sp()} cacheKey="ui-moneda" w={44} h={44} />
        </Tap>
      );
    }
    case 'migas': {
      const left = (d.crumbs || []).filter((c) => !gone.has(c.i));
      return left.map((c) => (
        <Tap key={c.i} x={c.x - 16} y={c.y - 16} w={32} h={32} label="Limpiar la miga"
          onTap={() => {
            play('scrub');
            const next = new Set(gone); next.add(c.i); setGone(next);
            if (next.size >= d.crumbs.length) onResolve({ coins: d.crumbs.length * 2, reason: 'cuarto limpio', vitals: { clean: 6 }, bubble: '¡Qué limpiecito todo!' });
          }}
        >
          <Sprite markup={crumbSvg(c.i)} cacheKey={`crumb-${c.i % 3}`} w={26} h={26} />
        </Tap>
      ));
    }
    case 'carta':
      return (
        <Tap x={200} y={ROOM.H - 66} w={64} h={54} label="Abrir la carta" className="pg-parcel" onTap={() => onLetter(d)}>
          <Sprite markup={envelopeSvg()} cacheKey="envelope" w={60} h={50} />
        </Tap>
      );
    case 'visita': {
      const g = d.gift || {};
      const fd = g.kind === 'comida' ? findFood(g.refId) : null;
      return (
        <>
          <div className="pg-anim-pop" style={{ position: 'absolute', left: 150, top: ROOM.H - 290, width: 210, zIndex: 4, pointerEvents: 'none' }}>
            <div style={{ background: C.glass, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: '7px 11px', boxShadow: SHADOW.soft, fontFamily: FONT.body, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>
              {d.line}
            </div>
          </div>
          <Tap x={170} y={ROOM.H - 186} w={170} h={170} label="Recibir el regalo de la visita"
            onTap={() => {
              play('buy');
              onResolve({
                coins: g.kind === 'monedas' ? g.value : 0, reason: 'regalo de una amiga',
                food: fd ? { id: fd.id, n: g.n || 1 } : null,
                vitals: { love: 8 }, bubble: fd ? `¡Nos trajo ${fd.name.toLowerCase()}! Lo guardé en la nevera` : '¡Qué linda visita!', react: 'love',
              });
            }}
          >
            <PetArt recipe={d.friend} mood="feliz" size={170} />
            <div className="pg-parcel" style={{ position: 'absolute', right: -6, bottom: 18, width: 46, height: 46, borderRadius: 14, background: C.surface, border: `2px solid ${C.line}`, display: 'grid', placeItems: 'center', boxShadow: SHADOW.soft }}>
              {fd ? <Sprite art={foodSpriteFor(fd.id).render()} cacheKey={`food-${foodSpriteFor(fd.id).id}`} w={34} h={34} /> : <Sprite art={UI_SPRITES.moneda()} cacheKey="ui-moneda" w={30} h={30} />}
            </div>
          </Tap>
        </>
      );
    }
    default:
      return null;
  }
}

export function LetterModal({ letter, from, petName, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={340} z={80}>
      <div className="pg-anim-pop" style={{ background: '#FFFBF3', border: '2px solid #E8D9C4', borderRadius: 14, padding: '18px 16px', textAlign: 'left', boxShadow: SHADOW.soft, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
          <Sprite markup={envelopeSvg()} cacheKey="envelope" w={46} h={38} />
        </div>
        <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 15, color: '#8C7A70', margin: '6px 0 10px' }}>Para {petName} y para ti:</p>
        {letter.photo
          ? <div style={{ borderRadius: 10, overflow: 'hidden', border: '6px solid #FFFFFF', boxShadow: SHADOW.soft, transform: 'rotate(-2deg)' }}><Sprite src={letter.photo} w={280} h={210} kind="photo" fit="cover" /></div>
          : <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 21, color: C.ink, lineHeight: 1.35, margin: 0 }}>{letter.text}</p>}
        <p style={{ fontFamily: FONT.hand || FONT.display, fontSize: 15, color: '#8C7A70', margin: '12px 0 0', textAlign: 'right' }}>— {from || 'Con cariño'}</p>
      </div>
      <button onClick={onClose} className="pg-btn pg-btn-rose pg-focus" style={{ marginTop: 14, padding: '10px 26px', fontSize: 13.5 }}>Guardarla en el corazón</button>
    </Modal>
  );
}
