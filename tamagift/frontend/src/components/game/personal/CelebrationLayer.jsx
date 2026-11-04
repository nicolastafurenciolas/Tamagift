import React from 'react';
import Sprite from '../../Sprite';
import { useStyle } from '../../../styles/StyleContext';
import { ROOM } from '../../../gameState';
import { CELEBRATION_PIECES, SWAG, CARTEL, cartelSvg, cartelInk } from '../../../art/room/celebrations';

// ─────────────────────────────────────────────────────────────────
// La decoración de una fecha de la pareja, dibujada dentro del cuarto
// (coordenadas del mundo, como PersonalLayer). Recibe la temporada de
// personal/dates.js (`season`, de roomSeason(...).personal) y pone:
//   · tres guirnaldas arriba en la pared (banderines, corazones o luces
//     de estrellas) y, colgado de la del medio, el cartel con el texto;
//   · una pieza a cada lado en el piso (globos y pastel, velas y rosas,
//     farol y caja de recuerdos) y lo tirado en el piso (confeti…).
//
//   <CelebrationLayer season={ps} pixel={px} />            todo
//   <CelebrationLayer season={ps} part="pared" … />        solo la pared
//   <CelebrationLayer season={ps} part="piso" … />         solo el piso
//
// `cx`: el centro de la decoración (por defecto, el medio del cuarto).
// `children`: otra capa que va en el mismo lugar (el cuarto le pasa
// `pixel` a esta y esta se lo pasa a sus hijos).
// ─────────────────────────────────────────────────────────────────

const WALL_TOP = 8;
const CHEST_X = 1290;   // el cofre de recuerdos (PersonalLayer): las piezas no lo tapan

function Piece({ id, x, bottom, pixel, scale = 1 }) {
  const p = CELEBRATION_PIECES[id];
  if (!p) return null;
  const w = Math.round(p.w * scale), h = Math.round(p.h * scale);
  return (
    <div data-celebration={id} style={{ position: 'absolute', left: Math.round(x - w / 2), top: Math.round(bottom + (p.foot || 0) * scale - h), width: w, height: h, pointerEvents: 'none' }}>
      <Sprite markup={p.svg()} cacheKey={`fiesta-${id}-${w}`} w={w} h={h} pixel={pixel} />
    </div>
  );
}

export default function CelebrationLayer({ season, part = 'todo', cx = ROOM.W / 2, pixel, children }) {
  const { style } = useStyle();
  const kids = children ? React.Children.map(children, (ch) => (React.isValidElement(ch) ? React.cloneElement(ch, { pixel }) : ch)) : null;
  if (!season || !season.decor) return kids;
  const { decor, theme } = season;
  const wall = part !== 'piso';
  const floor = part !== 'pared';
  // tres guirnaldas seguidas, la del medio en `cx`
  const swags = [cx - SWAG.w + 6, cx, cx + SWAG.w - 6].filter((x) => x - SWAG.w / 2 > 150 && x + SWAG.w / 2 < ROOM.W + 40);
  const left = Math.max(260, cx - 330);
  let right = Math.min(ROOM.W - 100, cx + 330);
  if (Math.abs(right - CHEST_X) < 150) right = CHEST_X - 160;
  const text = season.bannerName ? `${season.banner}, ${season.bannerName}` : season.banner;
  const neon = style.art.kind === 'neon';
  const ink = neon ? season.color : cartelInk(theme);
  const long = text.length > 22;
  return (
    <>
      {wall && swags.map((x) => (
        <div key={x} style={{ position: 'absolute', left: Math.round(x - SWAG.w / 2), top: WALL_TOP, width: SWAG.w, height: SWAG.h, pointerEvents: 'none' }}>
          <Sprite markup={CELEBRATION_PIECES[decor.wall].svg()} cacheKey={`fiesta-${decor.wall}`} w={SWAG.w} h={SWAG.h} pixel={pixel} />
        </div>
      ))}
      {wall && (
        <div data-celebration="cartel" style={{ position: 'absolute', left: Math.round(cx - CARTEL.w / 2), top: WALL_TOP + 34, width: CARTEL.w, height: CARTEL.h, pointerEvents: 'none' }}>
          <Sprite markup={cartelSvg(theme)} cacheKey={`fiesta-cartel-${theme}`} w={CARTEL.w} h={CARTEL.h} pixel={pixel} />
          <div
            style={{
              position: 'absolute', left: CARTEL.text.x, top: CARTEL.text.y - 4, width: CARTEL.text.w, height: CARTEL.text.h,
              display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              fontFamily: 'var(--pg-font-display)', fontWeight: 800, fontSize: long ? 15 : 19, lineHeight: 1.05,
              color: ink, letterSpacing: style.art.kind === 'pixel' ? 0.5 : 0,
              textShadow: neon ? `0 0 6px ${season.color}, 0 0 12px ${season.color}` : 'none',
              overflow: 'hidden', padding: '0 4px', boxSizing: 'border-box',
            }}
          >
            {text}
          </div>
        </div>
      )}
      {floor && <Piece id={decor.floor} x={cx} bottom={ROOM.H - 2} pixel={pixel} />}
      {floor && <Piece id={decor.left} x={left} bottom={ROOM.H - 10} pixel={pixel} />}
      {floor && <Piece id={decor.right} x={right} bottom={ROOM.H - 10} pixel={pixel} />}
      {kids}
    </>
  );
}
