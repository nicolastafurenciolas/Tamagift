// Catálogo de muebles: junta las categorías y los deja listos para la
// tienda y el cuarto (svg en texto; `render` para quien usa React).

import { piece, FOOT } from '../draw.js';
import { FURNITURE_PAINTS, findPaint } from './paints.js';
import { REST } from './rest.js';
import { STORAGE } from './storage.js';
import { FUN } from './fun.js';
import { PLANTS } from './plants.js';
import { RUGS } from './rugs.js';
import { WALL_ITEMS, POSTER_FRAME, posterFrameDraw } from './wall.js';
import { VIBE_FURNITURE } from './vibes.js';

export const FURNITURE_CATEGORIES = [
  { id: 'camas', name: 'Camas' },
  { id: 'asientos', name: 'Asientos' },
  { id: 'mesas', name: 'Mesas y guardado' },
  { id: 'ocio', name: 'Música y juegos' },
  { id: 'plantas', name: 'Plantas' },
  { id: 'luces', name: 'Luces' },
  { id: 'alfombras', name: 'Alfombras' },
  { id: 'pared', name: 'Para la pared' },
];

const ALL = [...REST, ...STORAGE, ...FUN, ...PLANTS, ...RUGS, ...WALL_ITEMS, ...VIBE_FURNITURE];

// Los dibujos están hechos en unidades cómodas; en el cuarto se ven un
// 25% más grandes, para que la mochi quepa en la cama y en el sofá.
export const FURNITURE_SCALE = 1.25;

export const FURNITURE_DEFS = ALL.map((f) => {
  const vh = f.h + FOOT;
  const w = Math.round(f.w * FURNITURE_SCALE), h = Math.round(vh * FURNITURE_SCALE);
  return {
    ...f,
    vw: f.w, vh,           // viewBox del dibujo (con el margen de abajo)
    w, h,                  // tamaño en el mundo del cuarto
    foot: FOOT * FURNITURE_SCALE,  // cuánto del alto queda bajo el punto de apoyo
    layer: f.layer || (f.place === 'pared' ? 'pared' : 'piso'),
    svg: (paint) => piece(f.w, vh, f.draw(typeof paint === 'string' ? findPaint(paint) : (paint || FURNITURE_PAINTS[0]))).replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`),
  };
});

export { FURNITURE_PAINTS, findPaint };

// Marco de póster (en el cuarto, 1.25× como los muebles).
const PW = Math.round(POSTER_FRAME.w * FURNITURE_SCALE), PH = Math.round(POSTER_FRAME.h * FURNITURE_SCALE);
export const POSTER = {
  w: PW, h: PH, vw: POSTER_FRAME.w, vh: POSTER_FRAME.h, photo: POSTER_FRAME.photo,
  svg: (paint) => piece(POSTER_FRAME.w, POSTER_FRAME.h, posterFrameDraw(typeof paint === 'string' ? findPaint(paint) : paint))
    .replace(/width="[\d.]+" height="[\d.]+"/, `width="${PW}" height="${PH}"`),
};
