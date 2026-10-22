// ─────────────────────────────────────────────────────────────────
// Temporadas: fechas del año con cosas que solo se venden esos días
// (disfraces, decoración) y sucesos propios. Lo que se compra en una
// temporada es tuyo para siempre; lo que cambia es que después ya no
// se puede comprar hasta el año siguiente.
//
// Las fechas son las del teléfono de quien juega (día local).
// ─────────────────────────────────────────────────────────────────

export const SEASONS = [
  {
    id: 'halloween', name: 'Halloween',
    from: { m: 10, d: 1 }, to: { m: 10, d: 31 },
    until: 'el 31 de octubre',
    color: '#F28C38', ink: '#5A3A8A',
  },
];

// mes × 100 + día: así las fechas se comparan como números
const dayNum = (date) => (date.getMonth() + 1) * 100 + date.getDate();
const md = ({ m, d }) => m * 100 + d;

// La temporada activa en esta fecha, o null.
export function activeSeason(date = new Date()) {
  const n = dayNum(date);
  return SEASONS.find((s) => n >= md(s.from) && n <= md(s.to)) || null;
}

// Cuántos días le quedan, contando hoy (el último día devuelve 1).
export function seasonDaysLeft(season, date = new Date()) {
  const end = new Date(date.getFullYear(), season.to.m - 1, season.to.d);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((end - today) / 86400000) + 1;
}

// "Quedan 10 días", "¡Último día!"…
export function seasonCountdown(season, date = new Date()) {
  const n = seasonDaysLeft(season, date);
  return n <= 1 ? '¡Último día!' : `Quedan ${n} días`;
}

// ¿Se puede comprar hoy? Lo que no es de temporada, siempre.
export const onSale = (item, date = new Date()) => !item.season || (activeSeason(date) || {}).id === item.season;

// Solo en desarrollo: ?temporada=halloween fuerza una temporada y
// ?temporada=ninguna la apaga, para revisar las dos caras de la tienda.
export function seasonNow(date = new Date()) {
  if (import.meta.env && import.meta.env.DEV && typeof window !== 'undefined') {
    const forced = new URLSearchParams(window.location.search).get('temporada');
    if (forced === 'ninguna') return null;
    if (forced) return SEASONS.find((s) => s.id === forced) || null;
  }
  return activeSeason(date);
}
