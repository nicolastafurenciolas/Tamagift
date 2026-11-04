import React from 'react';
import { asElement } from './art/room/draw';
import { DECOR_DEFS } from './art/room/decor';

// ─────────────────────────────────────────────────────────────────
// Catálogo fijo de decoración para la tienda (dibujado por la app, sin
// personajes ni marcas con derechos de autor). El arte está en
// src/art/room/decor.js; cada estilo lo redibuja con su kit.
//
// `place`: 'sobre' (se puede poner encima de un mueble y se dibuja por
// delante) o 'piso'.
// ─────────────────────────────────────────────────────────────────

export const DECOR_CATALOG = DECOR_DEFS.map((d) => ({ ...d, render: () => asElement(React, d.svg()) }));

export function findDecor(id) {
  return DECOR_CATALOG.find((d) => d.id === id) || null;
}
