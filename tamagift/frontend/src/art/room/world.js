// Arte de los sucesos del cuarto: bichitos, la carta, migas, el
// interruptor de la luz, los copitos y los fantasmitas. Piezas con roles,
// como todo (cada estilo las redibuja con su kit). Son chiquitas: formas
// claras, pocos detalles y bien gorditos para que se lean a su tamaño.

import { face, part, flat, line, shade, shine, rr, ellD, tone, Cir, Ell, INK, piece } from './draw.js';

const f1 = (n) => +n.toFixed(1);
// resplandor en escalones, solo en los estilos de luz (y pixel cuando sirve)
const halo = (cx, cy, rx, ry, c, op, only = 'lofi neon') => [1, 0.7].map((k) => Ell(cx, cy, rx * k, ry * k, { fill: c, opacity: f1(op * 0.5), 'data-r': 'tone', 'data-only': only })).join('');
const hot = (d) => shine(d, { 'data-only': 'neon' });
const eyes = (x1, x2, y, r = 1.5) => Ell(x1, y, r, r * 1.15, { fill: INK, 'data-r': 'flat' }) + Ell(x2, y, r, r * 1.15, { fill: INK, 'data-r': 'flat' });
const blush = (x1, x2, y, c = '#FF9EB8') => Ell(x1, y, 1.6, 1, { fill: c, opacity: 0.9, 'data-r': 'flat' }) + Ell(x2, y, 1.6, 1, { fill: c, opacity: 0.9, 'data-r': 'flat' });
// antenas con bolita en la punta
const antennae = (x, y, c = INK, spread = 6, h = 9) => line(`M${x - 1} ${y} Q${x - spread * 0.5} ${y - h * 0.7} ${x - spread} ${y - h} M${x + 1} ${y} Q${x + spread * 0.5} ${y - h * 0.7} ${x + spread} ${y - h}`, c, 1.3)
  + Cir(x - spread, y - h, 1.4, { fill: c, 'data-r': 'flat' }) + Cir(x + spread, y - h, 1.4, { fill: c, 'data-r': 'flat' });

const wing = (d, c, a = {}) => part(d, c, { w: 1.4, ...a });
// Achica el dibujo dentro de su caja: el borde blanco del sticker (y el
// contorno de otros estilos) necesita aire para no quedar cortado.
const roomy = (w, h, k, s) => piece(w, h, `<g transform="translate(${w / 2} ${h / 2}) scale(${k}) translate(${-w / 2} ${-h / 2})">${s}</g>`);

export const BUG_ART = {
  // mariposa rosa: alas de arriba grandes con borde y lunares, de abajo
  // redondas; cuerpito con carita
  mariposa: () => {
    const up = (sx) => `M24 22 C${24 + sx * 4} 10 ${24 + sx * 14} 4 ${24 + sx * 19} 7 C${24 + sx * 23} 10 ${24 + sx * 21} 20 ${24 + sx * 15} 24 C${24 + sx * 10} 26.6 ${24 + sx * 5} 25 24 24Z`;
    const lo = (sx) => `M24 25 C${24 + sx * 8} 25 ${24 + sx * 15} 29 ${24 + sx * 14} 35 C${24 + sx * 13} 40 ${24 + sx * 6} 40 ${24 + sx * 3} 35 C${24 + sx * 1.6} 32 24 29 24 25Z`;
    let s = wing(lo(-1), '#FFC2D6') + wing(lo(1), '#F7AFC8');
    s += wing(up(-1), '#FF9EC4') + wing(up(1), '#F48BB4');
    s += flat('M10 9.6 C13 7 18 7.4 20 10 C16 10 12.4 11 10 13.6Z M38 9.6 C35 7 30 7.4 28 10 C32 10 35.6 11 38 13.6Z', '#D65C92');
    s += Cir(13.4, 15.6, 2.4, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'flat' }) + Cir(34.6, 15.6, 2.4, { fill: '#FFFFFF', opacity: 0.9, 'data-r': 'flat' });
    s += Cir(16.4, 33, 1.7, { fill: '#FFF3A8', 'data-r': 'flat' }) + Cir(31.6, 33, 1.7, { fill: '#FFF3A8', 'data-r': 'flat' });
    s += antennae(24, 16, '#5A3E50', 6, 9);
    s += part(rr(21.6, 19, 4.8, 20, 2.4), '#6A4A60', { w: 1.2 }) + part(ellD(24, 17.6, 3.6, 3.4), '#6A4A60', { w: 1.2 });
    s += Cir(22.8, 17.2, 0.8, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(25.2, 17.2, 0.8, { fill: '#FFFFFF', 'data-r': 'shine' });
    return roomy(48, 48, 0.9, s);
  },
  // mariquita vista desde arriba: caparazón rojo con brillo y lunares,
  // cabecita negra con ojitos y patitas
  mariquita: () => {
    let s = line('M12 24 L7 21 M11 30 L6 31 M13 36 L8 39 M36 24 L41 21 M37 30 L42 31 M35 36 L40 39', '#2A2230', 1.6);
    s += antennae(24, 13, '#2A2230', 5, 6);
    s += part(ellD(24, 15.6, 7.6, 5.6), '#2A2230', { w: 1.4 });
    s += Ell(20.8, 15, 1.6, 1.8, { fill: '#FFFFFF', 'data-r': 'flat' }) + Ell(27.2, 15, 1.6, 1.8, { fill: '#FFFFFF', 'data-r': 'flat' });
    s += part('M24 19 C14 19 9 25 9 31 C9 38 16 42 24 42 C32 42 39 38 39 31 C39 25 34 19 24 19Z', '#E8505E', { w: 1.8 });
    s += line('M24 20 V41.6', '#2A2230', 1.6);
    [[17, 26, 2.4], [31, 26, 2.4], [15, 34, 2.1], [33, 34, 2.1], [20.4, 38.4, 1.8], [27.6, 38.4, 1.8]].forEach(([x, y, r]) => { s += Cir(x, y, r, { fill: '#2A2230', 'data-r': 'flat' }); });
    s += shine('M13 28 C13.6 24.4 16.4 21.6 20 21 C17 23 15.4 25.4 15 29Z', { opacity: 0.7 });
    return roomy(48, 48, 0.9, s);
  },
  // abejita de perfil, regordeta: rayas que siguen la curva, alas de
  // vidrio, aguijón y carita
  abejita: () => {
    let s = wing('M22 20 C14 8 22 2 28 8 C30 11 28 17 25 21Z', '#EAF6FF', { a: { 'fill-opacity': 0.9 } }) + wing('M27 20 C28 8 38 6 40 12 C41 16 35 20 29 21.6Z', '#DCEFFF', { a: { 'fill-opacity': 0.9 } });
    s += line('M24.6 9.6 L25.4 18 M33 11.6 L30.6 19', '#B8D6EC', 1, { opacity: 0.8 });
    s += part('M41 30 L45.6 31.4 L41 33.2Z', '#3A3044', { w: 1 });
    s += part(ellD(27, 30, 15, 11), '#FFD45C', { w: 1.8 });
    s += flat('M24 19.4 C26.4 24 26.4 36 24 40.6 L29.4 40.8 C31.6 36 31.6 24 29.4 19.2Z M34.4 20.6 C36.4 25 36.4 35 34.4 39.4 L38.4 37.6 C39.8 33.6 39.8 26.4 38.4 22.4Z', '#3A3044');
    s += shine('M15 26 C15.6 22.6 18.4 20 22 19.4 C19 21.6 17.4 24 17 27Z', { opacity: 0.7 });
    s += part(ellD(13, 30, 7.4, 7.2), '#FFE48A', { w: 1.6 });
    s += line('M10 23.4 Q8 18 5.4 17 M13.6 23.2 Q14 18 12.4 15.6', '#3A3044', 1.2) + Cir(5.4, 17, 1.3, { fill: '#3A3044', 'data-r': 'flat' }) + Cir(12.4, 15.6, 1.3, { fill: '#3A3044', 'data-r': 'flat' });
    s += Ell(10.6, 29.6, 1.4, 1.7, { fill: INK, 'data-r': 'flat' }) + Cir(10.2, 29, 0.5, { fill: '#FFFFFF', 'data-r': 'shine' });
    s += line('M8.6 33.4 Q10.4 35 12.2 33.6', INK, 1.1) + Ell(14.6, 33, 1.6, 1, { fill: '#FF9EB8', opacity: 0.9, 'data-r': 'flat' });
    return roomy(48, 48, 0.9, s);
  },
  // libélula desde arriba: ojos grandes, cola de anillos y cuatro alas
  // largas de vidrio con nervaduras
  libelula: () => {
    const w = (d) => wing(d, '#CDEFF0');
    let s = w('M22 17 C16 10 5 8 3 12 C1.6 15.6 12 19 22 19.6Z') + w('M26 17 C32 10 43 8 45 12 C46.4 15.6 36 19 26 19.6Z');
    s += w('M22 21 C15 22 5 26 5 30 C5.6 33 16 28 22 23Z') + w('M26 21 C33 22 43 26 43 30 C42.4 33 32 28 26 23Z');
    s += line('M7 13 Q14 15 21 18 M41 13 Q34 15 27 18 M8 29 Q15 25 21 22.4 M40 29 Q33 25 27 22.4', '#8CC4D2', 1.1);
    s += Cir(5, 12.4, 1.4, { fill: '#7FB6D6', 'data-r': 'flat' }) + Cir(43, 12.4, 1.4, { fill: '#7FB6D6', 'data-r': 'flat' });
    s += part('M22 22 L26 22 L25.4 44 Q24 45.6 22.6 44Z', '#3E8AB5', { w: 1.2 });
    s += line('M22.6 27.4 H25.4 M22.8 32 H25.2 M23 36.6 H25 M23.2 41 H24.8', '#2A6A90', 1);
    s += part(ellD(24, 19.4, 3.6, 3.8), '#4FA0C8', { w: 1.2 });
    s += part(ellD(20.6, 13.6, 3.6, 3.4), '#5CC4D8', { w: 1.2 }) + part(ellD(27.4, 13.6, 3.6, 3.4), '#5CC4D8', { w: 1.2 });
    s += Cir(19.6, 12.6, 1, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(26.4, 12.6, 1, { fill: '#FFFFFF', 'data-r': 'shine' });
    return roomy(48, 48, 0.9, s);
  },
  // luciérnaga: el farolito de la cola encendido (con su halo)
  luciernaga: () => {
    let s = halo(24, 33, 15, 13, '#FFF06A', 0.7, 'pixel lofi neon');
    s += wing('M21 19 C13 12 12 22 17 27 C19 28 21 26 23 22Z', '#E8F4FF', { a: { 'fill-opacity': 0.85 } }) + wing('M27 19 C35 12 36 22 31 27 C29 28 27 26 25 22Z', '#E8F4FF', { a: { 'fill-opacity': 0.85 } });
    s += part('M24 26 C18 26 17.4 34 19 38 C20.4 41.6 27.6 41.6 29 38 C30.6 34 30 26 24 26Z', '#FFE95C', { w: 1.5 });
    s += flat('M21 31 C21 28.6 22.6 27.6 24 27.6 C22.8 29 22.4 30.4 22.6 32.4Z', '#FFFBD0') + hot('M21.4 34 C21.4 31 26.6 31 26.6 34 C26.6 37.6 21.4 37.6 21.4 34Z');
    s += part('M24 16.6 C19 16.6 18 22 19 25 C20 27.6 28 27.6 29 25 C30 22 29 16.6 24 16.6Z', '#5A4A6A', { w: 1.4 });
    s += line('M19.4 24 H28.6', '#E86A5A', 1.4);
    s += antennae(24, 13, '#3A3044', 5, 7);
    s += part(ellD(24, 13.6, 4.4, 3.6), '#3A3044', { w: 1.2 });
    s += Cir(22.4, 13, 0.8, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(25.6, 13, 0.8, { fill: '#FFFFFF', 'data-r': 'shine' });
    return roomy(48, 48, 0.9, s);
  },
  // polilla lila y peludita: alas anchas con ojos de dibujo y antenas
  // de plumita
  polilla: () => {
    let s = wing('M24 22 C18 12 6 10 3 16 C1 21 6 27 14 27 C18 27 22 26 24 25Z', '#D9D2F2') + wing('M24 22 C30 12 42 10 45 16 C47 21 42 27 34 27 C30 27 26 26 24 25Z', '#CBC2EA');
    s += wing('M24 26 C18 27 11 30 12 35 C13 39 20 37 24 30Z', '#E8E2F8') + wing('M24 26 C30 27 37 30 36 35 C35 39 28 37 24 30Z', '#DCD4F2');
    s += part(ellD(12, 19, 3.6, 3.2), '#8E7FC8', { w: 1.1 }) + part(ellD(36, 19, 3.6, 3.2), '#8E7FC8', { w: 1.1 });
    s += Cir(11.2, 18.2, 1, { fill: '#FFFFFF', 'data-r': 'flat' }) + Cir(35.2, 18.2, 1, { fill: '#FFFFFF', 'data-r': 'flat' });
    s += line('M6 22 Q12 24.4 18 23 M42 22 Q36 24.4 30 23', '#B4A8DC', 1.1, { opacity: 0.8 });
    s += part('M22.4 16 C19 11 15 8 11.6 8.6 C13 11.4 17.4 14.4 22.4 16Z', '#B49A7E', { w: 1.1 }) + part('M25.6 16 C29 11 33 8 36.4 8.6 C35 11.4 30.6 14.4 25.6 16Z', '#B49A7E', { w: 1.1 });
    s += part('M24 17 C20.4 17 20 22 20.6 28 C21 33 22.4 36 24 36 C25.6 36 27 33 27.4 28 C28 22 27.6 17 24 17Z', '#F4F0EA', { w: 1.3 });
    s += line('M21.4 25 H26.6 M21.6 29 H26.4', '#D8D0C4', 1);
    s += Cir(22.6, 20.4, 0.9, { fill: INK, 'data-r': 'flat' }) + Cir(25.4, 20.4, 0.9, { fill: INK, 'data-r': 'flat' });
    return roomy(48, 48, 0.9, s);
  },
};

// El sobre visto por atrás: las solapas, la de arriba cerrada con un
// sello de lacre en forma de corazón.
export function envelopeSvg() {
  let s = Ell(30, 46, 24, 3.6, { fill: '#2A1C24', opacity: 0.2, 'data-r': 'tone' });
  s += face(rr(6, 13, 48, 32, 3), '#FFF8EE');
  s += flat('M7.4 43.8 L30 29 L52.6 43.8Z', '#F6EADB');
  s += flat('M7.2 14.4 L24 29.6 L7.2 43Z M52.8 14.4 L36 29.6 L52.8 43Z', '#FBF1E4');
  s += line('M7.4 43.6 L26 31 M52.6 43.6 L34 31', '#D8C6B2', 1.2);
  s += shade('M7 14.6 L30 34 L53 14.6 L53 18 L30 37.4 L7 18Z', '#8C6A50', 0.18);
  s += part('M6.6 14 Q6.8 13.2 8 13.2 L52 13.2 Q53.2 13.2 53.4 14 L31.4 32.6 Q30 33.8 28.6 32.6Z', '#FFFDF7', { w: 1.6 });
  // sello de lacre
  s += part('M30 39.6 C25 36.4 22.6 33.6 23 31 C23.4 28.6 26.6 27.6 30 30.4 C33.4 27.6 36.6 28.6 37 31 C37.4 33.6 35 36.4 30 39.6Z', '#E8506E', { w: 1.4 });
  s += flat('M30 36.4 C27.6 34.8 26.4 33.4 26.6 32 C26.8 30.8 28.4 30.4 30 31.8 C31.6 30.4 33.2 30.8 33.4 32 C33.6 33.4 32.4 34.8 30 36.4Z', '#C83A58');
  s += Cir(26, 31, 1, { fill: '#FFFFFF', 'data-r': 'shine' });
  return piece(60, 50, s);
}

// Migas de galleta: trozos con su cara de arriba más clara y una chispa.
export function crumbSvg(i = 0) {
  const v = i % 3;
  let s = Ell(8, 13.6, 6, 1.6, { fill: '#2A1C24', opacity: 0.18, 'data-r': 'tone' });
  if (v === 0) {
    s += part('M2.6 10.6 L4.6 5 L10.6 3.6 L13.6 7.6 L12.6 12.4 L6 13.4Z', '#D99A5A', { w: 1.2 });
    s += flat('M4.6 5.6 L10.4 4.4 L12.8 7.6 L7 8.6Z', '#F0BF7E') + flat(rr(7.4, 9.2, 3, 2.4, 0.8), '#6A3E26');
  } else if (v === 1) {
    s += part('M3 9 L6.6 4.4 L11.4 5 L13 9.4 L9.6 13 L4.6 12.6Z', '#E8B878', { w: 1.2 });
    s += flat('M6.8 5.2 L11 5.8 L11.8 8.4 L7.4 8.8Z', '#F8D6A0') + flat(rr(5, 9.4, 2.2, 2, 0.6), '#C4884A') + flat(rr(9.4, 9, 1.8, 1.8, 0.6), '#C4884A');
  } else {
    s += part('M3.4 8.6 C3.4 5.4 6 4 8.4 4.4 C11.6 4.8 13 7 12.6 9.6 C12.2 12.2 9.6 13.2 7.4 13 C5 12.8 3.4 11.4 3.4 8.6Z', '#D9A060', { w: 1.2 });
    s += flat('M5 7.6 C5.4 5.8 7 5.2 8.6 5.4 C10.4 5.6 11.4 6.8 11.2 8 C9 7 7 7 5 7.6Z', '#F2C88E') + flat(rr(8.6, 9, 2.4, 2, 0.6), '#6A3E26');
  }
  return roomy(16, 16, 0.86, s);
}

// Interruptor de pared: placa con dos tornillos y la palanca arriba
// (encendido) o abajo (apagado: una lucecita ayuda a encontrarlo de noche).
export function switchSvg(on) {
  let s = Ell(16, 40.6, 11, 1.8, { fill: '#2A1C24', opacity: 0.16, 'data-r': 'tone' });
  s += face(rr(3, 2, 24, 38, 5), '#F7F0E4');
  s += flat('M5 6 Q5 4 7 4 L23 4 Q25 4 25 6 L25 7.4 L5 7.4Z', '#FFFFFF');
  s += shade('M23 6 L25 6 L25 36 Q25 38 23 38 L7 38 Q5 38 5 36 L5 34.6 L23 34.6Z', '#B8A890', 0.3);
  s += part(ellD(15, 7.6, 1.6, 1.6), '#D8CCBA', { w: 1 }) + part(ellD(15, 33.6, 1.6, 1.6), '#D8CCBA', { w: 1 });
  s += face(rr(9.6, 11.6, 10.8, 19, 3), '#D9CEBD', { w: 1.5 });
  if (on) {
    s += face(rr(11, 12.6, 8, 10.6, 2.6), '#FFFFFF', { w: 1.4 }) + flat(rr(12.4, 13.8, 5.2, 2.4, 1), '#F2ECE2');
  } else {
    s += face(rr(11, 18.8, 8, 10.6, 2.6), '#E8DFD2', { w: 1.4 });
    s += halo(15, 15.4, 4.2, 4.2, '#FFB86A', 0.9, 'pixel lofi neon');
    s += part(ellD(15, 15.4, 1.5, 1.5), '#FFB347', { w: 0.9 }) + hot(ellD(15, 15.4, 0.8, 0.8));
  }
  return roomy(30, 42, 0.84, s);
}

// Copito de nieve de Navidad (cae por el cuarto; tres formas). Brazos
// gruesos de hielo con contorno celeste; uno con carita.
export function flakeSvg(i = 0) {
  const v = i % 3, c = 32;
  let arms = '';
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 - Math.PI / 2;
    const P = (r, da = 0) => `${f1(c + Math.cos(a + da) * r)} ${f1(c + Math.sin(a + da) * r)}`;
    arms += `M${P(6)} L${P(24)} `;
    if (v === 0) arms += `M${P(13)} L${P(19, 0.42)} M${P(13)} L${P(19, -0.42)} M${P(19)} L${P(23.4, 0.22)} M${P(19)} L${P(23.4, -0.22)} `;
    if (v === 1) arms += `M${P(10)} L${P(14.6, 0.62)} M${P(10)} L${P(14.6, -0.62)} M${P(17)} L${P(22, 0.44)} M${P(17)} L${P(22, -0.44)} `;
    if (v === 2) arms += `M${P(14)} L${P(19.6, 0.46)} M${P(14)} L${P(19.6, -0.46)} `;
  }
  let s = halo(c, c, 26, 26, '#DFF2FF', 0.5);
  s += line(arms, '#7FA9DE', 7) + line(arms, '#FFFFFF', 3.6);
  // el centro de seis lados
  let hex = '';
  const R = v === 2 ? 9 : 7;
  for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; hex += `${k ? 'L' : 'M'}${f1(c + Math.cos(a) * R)} ${f1(c + Math.sin(a) * R)}`; }
  s += flat(`${hex}Z`, '#FFFFFF') + line(`${hex}Z`, '#7FA9DE', 2);
  s += flat(ellD(c - 1.6, c - 2, 2.2, 1.6), '#E6F4FF');
  if (v === 2) s += eyes(c - 3, c + 3, c - 0.6, 1.2) + line(`M${c - 1.8} ${c + 2.6} Q${c} ${c + 4.2} ${c + 1.8} ${c + 2.6}`, INK, 1) + blush(c - 5.4, c + 5.4, c + 2.2);
  return piece(64, 64, s);
}

// Fantasmita de Halloween que flota por el cuarto (tres caritas): cabeza
// redonda, bracitos arriba y una colita que se enrosca. No toca el piso:
// no lleva sombra.
export function ghostSvg(i = 0) {
  const v = i % 3;
  let s = halo(27, 30, 26, 28, '#E7DEFF', 0.6);
  s += part('M13.6 28.6 C9.6 23.4 5.6 24.6 6 28.6 C6.4 32 10 33.6 13.4 33Z', '#FBF7FF', { w: 1.5 }) + part('M40.4 28.6 C44.4 23.4 48.4 24.6 48 28.6 C47.6 32 44 33.6 40.6 33Z', '#FBF7FF', { w: 1.5 });
  s += part('M12 32 C11 17 17 6 27 6 C37 6 43 17 42 32 C41.6 40 39 45 35 48 C32 50.4 31 53 33 55.4 C34.6 57.4 37.2 57.4 38.8 56 C37.4 60.4 31.4 61 28.4 57.8 C25.4 54.6 26.2 51 23.6 49.6 C17 46 12.6 40 12 32Z', '#FBF7FF', { w: 1.8 });
  s += shade('M36 9 C44 16 44 32 42 38 C40.6 43 37.6 46.6 34 48.6 C37 44 39.6 38 39 26 C38.6 18 37 12 33 8Z', '#DCD4F0', 0.85);
  s += shine('M16 18 C17.6 13 21 10 25 9 C21.4 12 19.6 15 18.6 20Z', { opacity: 0.85 });
  if (v === 1) {
    s += line('M17.6 24.6 Q20.4 21.6 23.2 24.6 M30.8 24.6 Q33.6 21.6 36.4 24.6', INK, 1.8);
  } else {
    s += Ell(20.4, 24, 2.8, 3.6, { fill: INK, 'data-r': 'flat' }) + Ell(33.6, 24, 2.8, 3.6, { fill: INK, 'data-r': 'flat' });
    s += Cir(21.4, 22.6, 1.1, { fill: '#FFFFFF', 'data-r': 'shine' }) + Cir(34.6, 22.6, 1.1, { fill: '#FFFFFF', 'data-r': 'shine' });
  }
  if (v === 2) s += part(ellD(27, 31.4, 2.6, 3.2), '#6A4258', { w: 1.1 }) + flat(ellD(27, 32.6, 1.4, 1.2), '#FF8FA8');
  else s += line('M24 30.6 Q27 33.4 30 30.6', INK, 1.5);
  s += Ell(15.4, 29.4, 3.2, 1.9, { fill: '#FFB6CC', opacity: 0.9, 'data-r': 'flat' }) + Ell(38.6, 29.4, 3.2, 1.9, { fill: '#FFB6CC', opacity: 0.9, 'data-r': 'flat' });
  return roomy(54, 62, 0.88, s);
}
