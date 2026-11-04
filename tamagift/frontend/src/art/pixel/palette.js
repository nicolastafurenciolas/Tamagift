// Paleta común del pixel art hecho a mano. Una letra = un color; cada
// dibujo puede agregar o cambiar letras. Cada color tiene su rampa:
// oscuro (contorno y sombra), medio y claro (luz de arriba a la
// izquierda).
export const PAL = {
  k: '#3A2431', // contorno general (tinta cálida)
  w: '#FFFFFF', W: '#FFF4E6', s: '#D8CDD6', S: '#9C8FA0', n: '#5E5266', N: '#272330',
  R: '#8C1F3A', r: '#D93A4C', q: '#F47C80',
  P: '#B23F6C', p: '#F28AB0', m: '#FFC9DC',
  O: '#A0441C', o: '#EE8434', a: '#FFB866',
  Y: '#B47716', y: '#F6C945', e: '#FFEC9C',
  B: '#5A2F20', b: '#99592F', c: '#CF8D53', C: '#F2CB94',
  G: '#2C6A3D', g: '#4FA358', l: '#9BD86E',
  U: '#2E3E86', u: '#4D7BD6', i: '#A0D4F3',
  V: '#4D2D86', v: '#8A64D6', x: '#C6AAF4',
  T: '#1E6A6A', t: '#43B5A8', z: '#A8E9DA',
};

// Paleta de un dibujo = la común + lo propio.
export const pal = (own = {}) => ({ ...PAL, ...own });
