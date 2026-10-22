// Arte de los sucesos del cuarto: bichitos, la carta, migas, el
// interruptor de la luz. Piezas con roles, como todo (cada estilo las
// redibuja con su kit).

import { face, part, flat, line, shade, shine, rr, ellD, tone, mix, Cir, Ell, INK, piece } from './draw.js';

const wing = (d, c, a = {}) => part(d, c, { w: 1.4, ...a });

export const BUG_ART = {
  mariposa: () => {
    let s = wing('M24 22 C18 6 2 6 4 18 C5 26 16 28 24 24Z', '#FF9EC4') + wing('M24 22 C30 6 46 6 44 18 C43 26 32 28 24 24Z', '#FF9EC4');
    s += wing('M24 26 C16 28 8 38 14 42 C20 45 23 36 24 30Z', '#FFC2D6') + wing('M24 26 C32 28 40 38 34 42 C28 45 25 36 24 30Z', '#FFC2D6');
    s += Cir(14, 16, 3, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'flat' }) + Cir(34, 16, 3, { fill: '#FFFFFF', opacity: 0.8, 'data-r': 'flat' });
    s += part(rr(22, 16, 4, 22, 2), '#5A3E50', { w: 1.2 }) + line('M23 16 C21 10 18 8 16 8 M25 16 C27 10 30 8 32 8', INK, 1.2);
    return piece(48, 48, s);
  },
  mariquita: () => {
    let s = part(ellD(24, 28, 15, 13), '#E8505E', { w: 1.8 });
    s += part('M10 22 C12 14 36 14 38 22 C32 18 16 18 10 22Z', '#2A2230', { w: 1.4 }) + line('M24 18 V40', '#2A2230', 1.6);
    [[17, 28], [31, 28], [19, 35], [29, 35], [24, 24]].forEach(([x, y]) => { s += Cir(x, y, 2.4, { fill: '#2A2230', 'data-r': 'flat' }); });
    s += Cir(20, 21, 1.4, { fill: '#FFFFFF', 'data-r': 'flat' }) + Cir(28, 21, 1.4, { fill: '#FFFFFF', 'data-r': 'flat' }) + shine('M14 26 C15 22 18 20 21 20 C18 22 16 24 16 28Z', { opacity: 0.6 });
    return piece(48, 48, s);
  },
  abejita: () => {
    let s = wing('M20 18 C14 6 26 2 26 14Z', '#EAF6FF', { a: { 'fill-opacity': 0.85 } }) + wing('M28 18 C30 6 40 6 34 18Z', '#EAF6FF', { a: { 'fill-opacity': 0.85 } });
    s += part(ellD(24, 28, 14, 10), '#FFD45C', { w: 1.8 });
    s += flat('M18 19 h4 v18 h-4Z M27 19 h4 v18 h-4Z', '#3A3044');
    s += Cir(34, 26, 1.6, { fill: INK, 'data-r': 'flat' }) + part('M10 28 l-5 1 l5 2Z', '#3A3044', { w: 1 });
    return piece(48, 48, s);
  },
  libelula: () => {
    let s = wing('M22 20 C14 10 2 10 4 16 C6 20 16 22 22 22Z', '#C7F0EA') + wing('M26 20 C34 10 46 10 44 16 C42 20 32 22 26 22Z', '#C7F0EA');
    s += wing('M22 24 C14 26 4 30 6 34 C9 37 18 30 22 26Z', '#B8E8F5') + wing('M26 24 C34 26 44 30 42 34 C39 37 30 30 26 26Z', '#B8E8F5');
    s += part(rr(22, 14, 4, 30, 2), '#3E8AB5', { w: 1.2 }) + part(ellD(24, 14, 4, 3.6), '#3E8AB5', { w: 1.2 });
    return piece(48, 48, s);
  },
  luciernaga: () => {
    let s = Ell(24, 32, 16, 14, { fill: '#FFF06A', opacity: 0.5, 'data-r': 'tone' });
    s += wing('M20 20 C14 10 22 6 24 16Z', '#E8F4FF', { a: { 'fill-opacity': 0.8 } }) + wing('M28 20 C34 10 26 6 24 16Z', '#E8F4FF', { a: { 'fill-opacity': 0.8 } });
    s += part(ellD(24, 22, 6, 6), '#3A3044', { w: 1.4 }) + part(ellD(24, 32, 6, 8), '#FFF06A', { w: 1.4 });
    return piece(48, 48, s);
  },
  polilla: () => {
    let s = wing('M24 24 C14 12 4 14 6 24 C8 32 18 30 24 28Z', '#D9D2F2') + wing('M24 24 C34 12 44 14 42 24 C40 32 30 30 24 28Z', '#D9D2F2');
    s += Cir(14, 22, 4, { fill: '#8E7FC8', 'data-r': 'flat' }) + Cir(34, 22, 4, { fill: '#8E7FC8', 'data-r': 'flat' });
    s += part(rr(22, 18, 4, 18, 2), '#F4F0EA', { w: 1.2 }) + line('M23 18 C20 12 16 10 14 11 M25 18 C28 12 32 10 34 11', INK, 1.2);
    return piece(48, 48, s);
  },
};

export function envelopeSvg() {
  let s = Ell(30, 46, 24, 4, { fill: '#2A1C24', opacity: 0.2, 'data-r': 'tone' });
  s += face(rr(6, 14, 48, 32, 3), '#FFF8EE');
  s += line('M6 16 L30 34 L54 16', '#C9B8A8', 1.8);
  s += part('M30 36 c-4 -6 -12 -6 -12 0 c0 5 8 7 12 0 c4 7 12 5 12 0 c0 -6 -8 -6 -12 0Z', '#FF6F91', { w: 1.2 });
  return piece(60, 50, s);
}

export function crumbSvg(i = 0) {
  const shapes = ['M4 10 L8 4 L14 6 L12 12 Z', 'M3 8 L9 3 L13 9 L7 13Z', 'M4 6 C6 2 12 2 13 6 C14 10 6 12 4 6Z'];
  return piece(16, 16, part(shapes[i % 3], '#E2AE6C', { w: 1.2 }) + flat('M7 7 h2 v2 h-2Z', '#B97835'));
}

export function switchSvg(on) {
  let s = face(rr(2, 2, 26, 38, 5), '#F7F0E4');
  s += face(rr(9, 9, 12, 24, 3), '#E2D8C8', { w: 1.6 });
  s += face(rr(10, on ? 10 : 20, 10, 12, 2), on ? '#FFFFFF' : '#C9BFB0', { w: 1.4 });
  return piece(30, 42, s);
}
