import React from 'react';
import { asElement } from './art/room/draw';
import { FURNITURE_DEFS, FURNITURE_PAINTS, FURNITURE_CATEGORIES, findPaint } from './art/room/furniture';
import { WALLS, WALL_ALIASES, parseWall, wallSvg, wallSwatchSvg } from './art/room/walls';
import { FLOORS, FLOOR_ALIASES, parseFloor, floorSvg, floorSwatchSvg } from './art/room/floors';

// ─────────────────────────────────────────────────────────────────
// Catálogo del cuarto: muebles, paredes y pisos.
//
// El arte vive en src/art/room (una sola perspectiva para todo, ver
// draw.js) y cada estilo lo redibuja con su kit. Acá se arma lo que usan
// la tienda y el cuarto:
//   · muebles: `svg(pintura)` (texto) y `render(pintura)` (React)
//   · paredes y pisos: un diseño (`liso`, `rayas`…) con varios colores;
//     en la partida se guarda "diseño.color" (p. ej. "rayas.menta").
// Los ids viejos ("crema", "madera"…) se siguen entendiendo.
// ─────────────────────────────────────────────────────────────────

export { FURNITURE_PAINTS, FURNITURE_CATEGORIES, findPaint };

export const FURNITURE = FURNITURE_DEFS.map((f) => ({
  ...f,
  render: (paint) => asElement(React, f.svg(paint)),
}));
export const findFurniture = (id) => FURNITURE.find((f) => f.id === id) || null;

export const WALL_STYLES = WALLS;
export const FLOOR_STYLES = FLOORS;
export const findWall = (value) => parseWall(value);
export const findFloor = (value) => parseFloor(value);
export { wallSvg, floorSvg, wallSwatchSvg, floorSwatchSvg };

// ¿Tiene comprado este diseño? (las partidas viejas guardan ids sueltos)
const patternOf = (aliases) => (v) => String(aliases[v] || v || '').split('.')[0];
const wallPattern = patternOf(WALL_ALIASES);
const floorPattern = patternOf(FLOOR_ALIASES);
export const ownsWall = (game, patternId) => patternId === 'liso' || (game.ownedWalls || []).some((v) => wallPattern(v) === patternId);
export const ownsFloor = (game, patternId) => patternId === 'tablas' || (game.ownedFloors || []).some((v) => floorPattern(v) === patternId);
