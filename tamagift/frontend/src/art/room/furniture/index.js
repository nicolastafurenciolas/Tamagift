// Catálogo de muebles: junta las categorías y los deja listos para la
// tienda y el cuarto (svg en texto; `render` para quien usa React).

import { piece } from '../draw.js';
import { FURNITURE_PAINTS, findPaint } from './paints.js';
import { REST } from './rest.js';
import { STORAGE } from './storage.js';
import { FUN } from './fun.js';
import { PLANTS } from './plants.js';
import { RUGS } from './rugs.js';
import { WALL_ITEMS } from './wall.js';

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

const ALL = [...REST, ...STORAGE, ...FUN, ...PLANTS, ...RUGS, ...WALL_ITEMS];

// Los dibujos están hechos en unidades cómodas; en el cuarto se ven un
// 25% más grandes, para que la mochi quepa en la cama y en el sofá.
export const FURNITURE_SCALE = 1.25;

export const FURNITURE_DEFS = ALL.map((f) => {
  const w = Math.round(f.w * FURNITURE_SCALE), h = Math.round(f.h * FURNITURE_SCALE);
  return {
    ...f,
    vw: f.w, vh: f.h,      // viewBox del dibujo
    w, h,                  // tamaño en el mundo del cuarto
    layer: f.layer || (f.place === 'pared' ? 'pared' : 'piso'),
    svg: (paint) => piece(f.w, f.h, f.draw(typeof paint === 'string' ? findPaint(paint) : (paint || FURNITURE_PAINTS[0]))).replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`),
  };
});

export { FURNITURE_PAINTS, findPaint };
