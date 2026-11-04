import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { applyStyle } from '../theme';
import { DEFAULT_STYLE, getStyle, isStyleId } from './registry';
import { setSoundPack } from '../sound';

// ─────────────────────────────────────────────────────────────────
// Estilo activo de toda la app.
//
// Vive arriba de las rutas: el asistente lo cambia mientras quien
// regala prueba estilos, y el juego lo fija al cargar la mascota (lo
// que eligió quien regaló, o lo que prefirió después quien la recibe).
//
// Se recuerda el último usado en el dispositivo solo para que la
// primera pintura (antes de que llegue la mascota) no parpadee con
// otro estilo.
// ─────────────────────────────────────────────────────────────────

const LAST_KEY = 'tamagift:lastStyle';

// `?estilo=neon` en la URL fuerza un estilo (para probar o compartir).
export function styleFromUrl() {
  try {
    const v = new URLSearchParams(window.location.search).get('estilo');
    return isStyleId(v) ? v : null;
  } catch (e) {
    return null;
  }
}

function readLast() {
  const forced = styleFromUrl();
  if (forced) return forced;
  try {
    const v = localStorage.getItem(LAST_KEY);
    return isStyleId(v) ? v : DEFAULT_STYLE;
  } catch (e) {
    return DEFAULT_STYLE;
  }
}

const StyleCtx = createContext({ styleId: DEFAULT_STYLE, style: getStyle(DEFAULT_STYLE), setStyleId: () => {} });

export function StyleProvider({ children }) {
  const [styleId, setRaw] = useState(readLast);

  // Antes de pintar: si no, el primer cuadro sale con los colores del
  // estilo anterior y se ve el salto.
  useLayoutEffect(() => {
    const s = getStyle(styleId);
    applyStyle(s.id);
    setSoundPack(s.sound);
    try { localStorage.setItem(LAST_KEY, s.id); } catch (e) { /* modo privado */ }
  }, [styleId]);

  const value = useMemo(() => ({
    styleId,
    style: getStyle(styleId),
    setStyleId: (id) => setRaw(isStyleId(id) ? id : DEFAULT_STYLE),
  }), [styleId]);

  return <StyleCtx.Provider value={value}>{children}</StyleCtx.Provider>;
}

export function useStyle() {
  return useContext(StyleCtx);
}
