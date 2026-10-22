// Combinaciones de color para los muebles: madera (o estructura), tela
// y un acento (perillas, flores, detalles). Se elige al comprar y se
// puede cambiar después en el modo decorar.

export const FURNITURE_PAINTS = [
  { id: 'natural', name: 'Miel y rosa', wood: '#D9A05B', cloth: '#E57B93', accent: '#F6D365' },
  { id: 'nogal', name: 'Nogal y salvia', wood: '#8B5E3C', cloth: '#7FA894', accent: '#E8C766' },
  { id: 'blanco', name: 'Blanco y celeste', wood: '#F2EAE0', cloth: '#8FC7EE', accent: '#F7A6B9' },
  { id: 'pastel', name: 'Pastel', wood: '#F7D6C4', cloth: '#C3A7EA', accent: '#9FE0C8' },
  { id: 'menta', name: 'Menta y durazno', wood: '#CDE9DB', cloth: '#F59E8E', accent: '#FFFFFF' },
  { id: 'cielo', name: 'Cielo y limón', wood: '#BFD9EE', cloth: '#F7D56B', accent: '#FFFFFF' },
  { id: 'lila', name: 'Lila', wood: '#E3D9F2', cloth: '#8A6FD1', accent: '#F7C6D9' },
  { id: 'arena', name: 'Arena y azul', wood: '#D8C3A0', cloth: '#6E8FA8', accent: '#E9845A' },
  { id: 'bosque', name: 'Bosque y mostaza', wood: '#5E6B4F', cloth: '#E2A845', accent: '#D9643A' },
  { id: 'cereza', name: 'Cereza y crema', wood: '#9E3B3B', cloth: '#F3E6D3', accent: '#E7B04F' },
  { id: 'carbon', name: 'Carbón y naranja', wood: '#55505C', cloth: '#F28C38', accent: '#E8E2DA' },
  { id: 'negro', name: 'Negro y vino', wood: '#3B3742', cloth: '#8E1F2C', accent: '#C9A227' },
  { id: 'vino', name: 'Vino y oro', wood: '#4E1F2B', cloth: '#C9A227', accent: '#E9DCC9' },
  { id: 'neon', name: 'Neón', wood: '#2A1740', cloth: '#FF6FD8', accent: '#4BE3F0' },
];

export const findPaint = (id) => FURNITURE_PAINTS.find((p) => p.id === id) || FURNITURE_PAINTS[0];
