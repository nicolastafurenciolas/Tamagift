// Adornos de los packs por gustos (personal/packs.js): tres por pack.
//
// Misma vista 3/4 que todo el cuarto (draw.js): frente + tapa, lo
// redondo apoyado es una elipse aplastada, la luz viene de arriba a la
// izquierda. `place`: 'sobre' (encima de un mueble o colgado: `hang`
// marca lo que va en la pared, con su clavo o su gancho) o 'piso'. En el cuarto se dibujan a
// ×1.25: los detalles van de 2–3 unidades para arriba y lo repetido va
// en un solo trazo por color (el papel recortado no lo vuelve confeti).
//
// Todos llevan `pack` (de qué pack son) y `season: 'pack'`: así quedan
// fuera de la tienda de siempre (`onSale` y los filtros `!d.season`) y
// solo los ve quien tenga el pack activado (ver personal/packs.js).

import { face, part, flat, line, shade, shine, rr, rrTop, ellD, tone, mix, mat, box, cylinder, pot, leaf, tube, Cir, Ell, INK, piece, FOOT } from './draw.js';
import { CHROME, BRASS, GOLD, surf, floorSh, glow, roundShade, gloss, heart, star, moon, dot, dots, ball, eye, blush, smile, catMouth, bow, steam, grain, sparkle, spoon, blossom } from './decorVibes.js';

const f1 = (v) => +(+v).toFixed(1);
const R2 = (a) => (a * Math.PI) / 180;

let clipN = 0;
/** Recorta `inner` a la forma `d` (en el cuarto, los kits respetan clip-path). */
const clip = (d, inner) => { const id = `pkc${++clipN}`; return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
const rot = (a, x, y, inner) => `<g transform="rotate(${a} ${x} ${y})">${inner}</g>`;
const at = (x, y, a, s, inner) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s})">${inner}</g>`;
const poly = (pts) => `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;
/** Estrella regordeta (puntas redondeadas): se lee bien chiquita. */
function puff(x, y, r, k = 0.55) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr2 = i % 2 ? r * k : r; pts.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); }
  let d = `M${f1((pts[9][0] + pts[0][0]) / 2)} ${f1((pts[9][1] + pts[0][1]) / 2)}`;
  for (let i = 0; i < 10; i += 2) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], [cx, cy] = pts[(i + 2) % 10];
    d += `Q${f1(ax)} ${f1(ay)} ${f1((ax + bx) / 2)} ${f1((ay + by) / 2)}Q${f1(bx)} ${f1(by)} ${f1((bx + cx) / 2)} ${f1((by + cy) / 2)}`;
  }
  return `${d}Z`;
}
/** Luna creciente gordita: círculo menos otro corrido arriba a la derecha. */
function crescentD(x, y, r, off = 0.5, ir = 0.8) {
  const cx2 = x + off * r * 0.92, cy2 = y - off * r * 0.4, r2 = ir * r;
  const dx = cx2 - x, dy = cy2 - y, dd = Math.hypot(dx, dy);
  const a = (r * r - r2 * r2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, r * r - a * a));
  const mx = x + (a * dx) / dd, my = y + (a * dy) / dd;
  const p1 = [mx + (h * dy) / dd, my - (h * dx) / dd], p2 = [mx - (h * dy) / dd, my + (h * dx) / dd];
  return `M${f1(p1[0])} ${f1(p1[1])}A${r} ${r} 0 1 0 ${f1(p2[0])} ${f1(p2[1])}A${f1(r2)} ${f1(r2)} 0 1 1 ${f1(p1[0])} ${f1(p1[1])}Z`;
}
/** Ojo de anime: grande, con el iris de color, dos brillos y la pestaña de arriba. */
const animeEye = (x, y, r, iris) => part(ellD(x, y, r, f1(r * 1.3)), '#3A2E5A', { w: 1 })
  + flat(ellD(x, f1(y + r * 0.35), f1(r * 0.72), f1(r * 0.8)), iris)
  + Cir(f1(x - r * 0.35), f1(y - r * 0.45), f1(r * 0.42), { fill: '#FFFFFF', 'data-r': 'shine' })
  + Cir(f1(x + r * 0.4), f1(y + r * 0.55), f1(r * 0.2), { fill: '#FFFFFF', 'data-r': 'shine' });
/** Ojo cerrado feliz (^). */
const happyEye = (x, y, w = 4) => line(`M${f1(x - w / 2)} ${f1(y + 1)}Q${x} ${f1(y - w * 0.6)} ${f1(x + w / 2)} ${f1(y + 1)}`, INK, 1.5);
/** Ojo dormido (‿). */
const sleepEye = (x, y, w = 4) => line(`M${f1(x - w / 2)} ${y}Q${x} ${f1(y + w * 0.5)} ${f1(x + w / 2)} ${y}`, INK, 1.4);
/** Grano de café: óvalo con su surco. */
const bean = (x, y, r, a = 0, c = '#7A4A30') => rot(a, x, y, part(ellD(x, y, r, f1(r * 0.72)), c, { w: 1 }) + line(`M${f1(x - r * 0.6)} ${f1(y + r * 0.12)}Q${x} ${f1(y - r * 0.32)} ${f1(x + r * 0.6)} ${f1(y + r * 0.12)}`, tone(c, -1.2), 1));
/** Hoja de corazón (potus). */
const heartLeaf = (x, y, s, a, c) => at(x, y, a, 1, part(`M0 0C${f1(-s * 1.1)} ${f1(-s * 0.3)} ${f1(-s * 0.9)} ${f1(-s * 1.4)} 0 ${f1(-s * 1.7)}C${f1(s * 0.9)} ${f1(-s * 1.4)} ${f1(s * 1.1)} ${f1(-s * 0.3)} 0 0Z`, c, { w: 1.1 }) + line(`M0 ${f1(-s * 0.2)}V${f1(-s * 1.4)}`, tone(c, -0.9), 1, { opacity: 0.7 }));

// Hoja de monstera: lámina acorazonada y ancha, punta fina, sus cortes
// hacia el nervio, nervio y venas. (x, y) es donde nace el pecíolo (la
// hendidura de la base); `ang` 0 = apunta para arriba.
const cub = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); };
function monsteraLeaf(x, y, L, ang, c, o = {}) {
  const W = L * 0.6;
  // media lámina derecha: de la punta a la hendidura, en dos curvas
  const A = [[0, -L], [W * 0.5, -L * 0.94], [W * 1.06, -L * 0.62], [W, -L * 0.34]];
  const B = [[W, -L * 0.34], [W * 0.96, -L * 0.02], [W * 0.5, L * 0.13], [W * 0.16, L * 0.1]];
  const edge = (u) => (u < 0.55 ? cub(...A, u / 0.55) : u < 0.97 ? cub(...B, (u - 0.55) / 0.42) : [W * 0.16 * (1 - (u - 0.97) / 0.03), L * 0.1 * (1 - (u - 0.97) / 0.03)]);
  const half = (side, cuts) => {
    const out = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const cut = cuts.find((cu) => Math.abs(u - cu) < 0.5 / 60);
      const [ex, ey] = edge(u);
      if (cut != null) {
        const [ax, ay] = edge(cut - 0.025), [bx, by] = edge(cut + 0.025);
        const ix = ex * 0.34, iy = ey * 0.8 + L * 0.05;
        out.push([ax * side, ay], [(ix - 0.5) * side, iy - 0.4], [(ix + 0.5) * side, iy + 0.7], [bx * side, by]);
      } else out.push([ex * side, ey]);
    }
    return out;
  };
  const cR = (o.cuts || [0.3, 0.46, 0.62, 0.78]).map((u) => Math.round(u * 60) / 60);
  const cL = (o.cutsL || cR.map((u, i) => u + (i % 2 ? -0.03 : 0.03))).map((u) => Math.round(u * 60) / 60);
  const d = poly([...half(1, cR), ...half(-1, cL).reverse()]);
  const m = mat(c);
  let s = part(d, c, { w: 1.6 });
  s += clip(d, shade(`M0 ${f1(L * 0.2)}L0 ${f1(-L * 1.1)}L${f1(W + 6)} ${f1(-L * 1.1)}L${f1(W + 6)} ${f1(L * 0.2)}Z`, m.deep, 0.2));
  let v = `M0 0L0 ${f1(-L * 0.92)}`;
  [0.2, 0.38, 0.54, 0.7, 0.86].forEach((u) => { [1, -1].forEach((sd) => { const [ex, ey] = edge(u); v += `M0 ${f1(ey * 0.8 + L * 0.02)}Q${f1(ex * 0.45 * sd)} ${f1(ey * 0.86)} ${f1(ex * 0.8 * sd)} ${f1(ey * 0.94)}`; }); });
  s += line(v, m.hi, 1.2, { opacity: 0.7 });
  return at(x, y, ang, 1, s);
}

// ── Anime ──────────────────────────────────────────────────────────
const ANIME = [
  {
    id: 'posterAnime', name: 'Póster de anime', price: 70, w: 114, h: 72, place: 'sobre', hang: true,
    draw: () => {
      const SK = '#FFE3D3', HR = '#F27BA8', mh = mat(HR);
      let s = '';
      // el clavo y el cordel
      s += line('M57 5L15 17M57 5L99 17', '#A0826A', 1.3) + ball(57, 4.6, 2.4, BRASS, 1.1);
      // el papel, con su cielo, el sol rosado y los destellos
      s += face(rr(13, 18, 88, 46, 0.5), '#BFD9FF', { w: 1.6 });
      s += clip(rr(13, 18, 88, 46, 0), flat(rr(13, 46, 88, 18, 0), '#D9E8FF') + flat(ellD(66, 42, 22, 22), '#FFD3E4') + flat(ellD(66, 42, 15, 15), '#FFE7F0')
        + line('M66 20V14M88 42H96M82 26L88 20M82 58L88 64M44 26L38 20', '#FFFFFF', 2.4, { opacity: 0.8 }));
      // el título, como un sello vertical
      s += face(rr(19, 23, 10, 34, 1), '#E8505E', { w: 1.3 }) + flat('M21.5 26h5v2h-5ZM22.5 30h3v5h-3ZM21.5 37h5v2h-5ZM21.5 42h2v5h-2ZM24.5 42h2v5h-2ZM21.5 49h5v2h-5Z', '#FFF4E8');
      s += sparkle(37, 30, 3.6, '#FFFFFF') + sparkle(92, 54, 3, '#FFFFFF') + sparkle(40, 52, 2.4, '#FFF3B0');
      // la chica: moños, pelo, cara de ojos enormes y su cuello marinero
      s += clip(rr(13, 18, 88, 46, 0),
        part('M48 64C48 55 55 51 66 51C77 51 84 55 84 64Z', '#FFFFFF', { w: 1.3 })
        + part('M55 52L66 60L77 52L73.6 51L66 56.4L58.4 51Z', '#3E4B8A', { w: 1.1 }) + part('M66 59.4l-3 2.4l3 1.8l3 -1.8Z', '#E8505E', { w: 1 }));
      s += part(ellD(52.4, 26.6, 5.6, 5.4), HR, { w: 1.3 }) + part(ellD(79.6, 26.6, 5.6, 5.4), HR, { w: 1.3 });
      s += part('M53 49C51 38 54 28.6 66 28.6C78 28.6 81 38 79 49Z', mh.side, { w: 1.3 });
      s += part(ellD(66, 40, 11.4, 10.6), SK, { w: 1.3 });
      s += part('M54.6 38C54 30.6 59 27.4 66 27.4C73 27.4 78 30.6 77.4 38C75.4 34.6 72.6 33.6 70.6 35.2C69.4 32.4 66 32 64.6 35C62.4 33.2 59 33.6 58 36.4C56.6 35.6 55.4 36.4 54.6 38Z', HR, { w: 1.2 });
      s += line('M58 30.6Q61 29 64 29.4', mh.hi, 1.4, { opacity: 0.85 });
      s += animeEye(61.4, 41.4, 2.7, '#7FA9FF') + animeEye(70.6, 41.4, 2.7, '#7FA9FF');
      s += blush(58, 46, 2.2) + blush(74, 46, 2.2) + line('M64.6 47q1.4 1.2 2.8 0', INK, 1.2);
      // las varillas de madera, arriba y abajo
      s += shade(rr(14, 21, 86, 3, 0), '#2A1C24', 0.15);
      const rod = (y) => face(rr(9, y, 96, 5, 2.5), '#C99A6A', { w: 1.4 }) + line(`M12 ${y + 1.6}H101`, '#E8C49A', 1.1, { opacity: 0.9 }) + ball(8, y + 2.5, 3, '#E57B93', 1.2) + ball(106, y + 2.5, 3, '#E57B93', 1.2);
      s += rod(15) + rod(62);
      return s;
    },
  },
  {
    id: 'acrilicos', name: 'Acrílicos de colección', price: 60, w: 80, h: 66, place: 'sobre',
    draw: () => {
      const SK = '#FFE3D3', ACR = mix('#9CC6DA', INK, 0.25);
      let s = surf(40, 63, 36);
      const stand = (x, y, h, inner) => {
        // la plaquita de acrílico recortada alrededor del dibujo, en su base
        let o = face(rr(x - 10, y - 3, 20, 5, 2), '#E3F1FA', { w: 1.3 }) + face(rrTop(x - 10, y - 5.6, 20, 3, 1.4), '#F4FAFF', { w: 1.2 });
        o += shade(rr(x - 12.5, y - 5 - h, 25, h + 1, 9), '#E4F2FC', 0.75) + line(rr(x - 12.5, y - 5 - h, 25, h + 1, 9), ACR, 1.5);
        o += inner;
        o += shine(`M${x - 10.4} ${f1(y - h + 6)}V${f1(y - h + 18)}h1.8V${f1(y - h + 6)}Z`, { opacity: 0.7 });
        return o;
      };
      const chibi = (x, y, hair, cloth, iris, extra = '') => {
        const mh = mat(hair);
        let o = part(`M${x - 7} ${y}C${x - 7} ${y - 6} ${x - 4} ${y - 9} ${x} ${y - 9}C${x + 4} ${y - 9} ${x + 7} ${y - 6} ${x + 7} ${y}Z`, cloth, { w: 1.2 });
        o += part(`M${x - 9} ${y - 10}C${x - 10} ${y - 20} ${x - 6} ${y - 26} ${x} ${y - 26}C${x + 6} ${y - 26} ${x + 10} ${y - 20} ${x + 9} ${y - 10}Z`, mh.side, { w: 1.2 });
        o += part(ellD(x, y - 15, 8, 7.6), SK, { w: 1.2 });
        o += part(`M${x - 8.6} ${y - 15}C${x - 9} ${y - 22} ${x - 5} ${y - 25} ${x} ${y - 25}C${x + 5} ${y - 25} ${x + 9} ${y - 22} ${x + 8.6} ${y - 15}C${x + 6} ${y - 19} ${x + 3} ${y - 19.4} ${x + 1} ${y - 18}C${x} ${y - 20} ${x - 3} ${y - 20.4} ${x - 4.4} ${y - 18}C${x - 6} ${y - 19} ${x - 7.6} ${y - 17.4} ${x - 8.6} ${y - 15}Z`, hair, { w: 1.1 });
        o += animeEye(x - 3.4, y - 14, 1.7, iris) + animeEye(x + 3.4, y - 14, 1.7, iris) + blush(x - 5.4, y - 11, 1.5) + blush(x + 5.4, y - 11, 1.5);
        return o + extra;
      };
      // atrás, la del medio, más alta, con su estrella
      s += stand(40, 55, 40, chibi(40, 47, '#7FA9DE', '#3E4B8A', '#5B8BE0',
        part(puff(50, 21, 4.4), '#FFE07A', { w: 1.1 }) + line('M48 24L45 30', '#C9A06A', 1.4)));
      // adelante a la izquierda: orejitas de gata
      s += stand(19, 61, 34, chibi(19, 53, '#F27BA8', '#FFFFFF', '#E8507A',
        part('M11.6 31L12.6 23L17 28.4Z', '#F27BA8', { w: 1.1 }) + part('M26.4 31L25.4 23L21 28.4Z', '#F27BA8', { w: 1.1 }) + part('M16 49.6l3 2.4l3 -2.4Z', '#E8505E', { w: 0.9 })));
      // adelante a la derecha: un bichito redondo de la serie
      s += face(rr(51, 58, 20, 5, 2), '#E3F1FA', { w: 1.3 }) + face(rrTop(51, 55.4, 20, 3, 1.4), '#F4FAFF', { w: 1.2 });
      s += shade(rr(48.5, 30, 25, 27, 10), '#E4F2FC', 0.75) + line(rr(48.5, 30, 25, 27, 10), ACR, 1.5);
      s += part('M53.4 34L55 27L59 32Z', '#FFD24D', { w: 1.1 }) + part('M68.6 34L67 27L63 32Z', '#FFD24D', { w: 1.1 });
      s += part(ellD(61, 44.4, 10.4, 9.6), '#FFD24D', { w: 1.3 }) + roundShade(61, 44.4, 10.4, 9.6, '#FFD24D', 0.3, 0.28);
      s += eye(57.4, 43, 1.7) + eye(64.6, 43, 1.7) + blush(55, 47, 1.8, '#FF6F6F') + blush(67, 47, 1.8, '#FF6F6F') + catMouth(61, 46.6, 3.4);
      s += shine('M51.4 34V46h1.8V34Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'bento', name: 'Bento de anime', price: 45, w: 80, h: 56, place: 'sobre',
    draw: () => {
      const R = '#C8303F', mr = mat(R);
      let s = surf(40, 53.6, 36);
      // la tapa, apoyada atrás, con su flor de cerezo
      s += rot(9, 64, 36, face(rr(42, 4, 34, 26, 3.4), mr.side, { w: 1.6 }) + line('M45 8H73', GOLD, 1.4) + blossom(59, 17, 6, '#FFC9DA', 5, '#FFE07A') + blossom(68, 24, 3.6, '#FFFFFF', 5, '#F7B6C4'));
      // la caja: canto de arriba (tapa clara), el fondo laqueado y el frente
      s += face(rrTop(6, 16, 64, 22, 4), mr.top, { w: 1.6 });
      s += flat(rr(9.4, 18.4, 57.2, 17, 2), '#4A3038');
      s += flat(rr(36.6, 18.4, 2.6, 17, 0), mr.top);
      // a la izquierda, el arroz con su onigiri y su ciruelita
      s += part('M10 35C10 28 14 25 22 25C30 25 35 28 36 35Z', '#FBF8F2', { w: 1.2 }) + dots([[15, 30], [20.4, 28], [27, 29.4], [31, 32]], 0.8, '#E8E0D4');
      s += part('M16.4 33C14 33 13.4 30.6 14.6 28.6L20.4 18.4C21.6 16.4 24 16.4 25.2 18.4L31 28.6C32.2 30.6 31.6 33 29.2 33Z', '#FFFFFF', { w: 1.3 });
      s += face(rr(17.6, 26, 10.4, 7, 1), '#2E4A3A', { w: 1 }) + part(ellD(22.8, 22.6, 2.4, 2.2), '#E8507A', { w: 0.9 }) + dots([[19.6, 21.4], [26, 22]], 0.6, '#F0E6D8');
      // a la derecha: tortilla enrollada, salchicha pulpito, brócoli y tomatito
      s += part('M40 36C38 30 41 25.6 46 26.4C47 24 51.4 23.4 53 26C55 22 61 22.6 62 27.4C66 27 68 31 66.4 36Z', '#8ED07A', { w: 1.2 });
      const tama = (x, y) => face(rr(x, y, 9, 8, 2.2), '#FFD966', { w: 1.2 }) + line(`M${x + 2.6} ${y + 4}a1.9 1.9 0 1 0 3.8 0a1.4 1.4 0 1 0 -2.8 0`, '#E8A93A', 1.1);
      s += tama(41, 24) + tama(48.6, 25.4);
      s += part('M58 32.4C56.6 32.4 56 30 57.4 29.6C57 27.6 58 26 60 26C62 26 63 27.6 62.6 29.6C64 30 63.4 32.4 62 32.4C61.6 33.6 60.6 33.6 60 32.6C59.4 33.6 58.4 33.6 58 32.4Z', '#F06A5A', { w: 1.1 }) + dots([[59, 28.6], [61, 28.6]], 0.7, INK);
      s += part('M63.6 26.6C61 26.6 60.6 22.6 63 22C63.4 19.6 67 19.6 67.4 22C69.4 22.6 69 26.6 66.6 26.6Z', '#5FA66A', { w: 1.1 }) + face(rr(64.2, 26.2, 1.8, 3.6, 0.6), '#9ACB7A', { w: 0.8 });
      s += ball(46, 34.4, 2.8, '#E8505E', 1) + flat(star(46, 32, 1.6), '#5FA66A');
      // el frente laqueado, con su filete dorado
      s += face(rr(6, 36, 64, 14, 3), R, { w: 1.8 });
      s += line('M9 39H67', GOLD, 1.4) + shade(rr(8, 45, 60, 4, 2), mr.deep, 0.28);
      s += blossom(14, 43.6, 3.2, '#FFC9DA', 5, '#FFE07A');
      s += line('M9 37.6H40', mr.hi, 1.2, { opacity: 0.6 });
      // los palillos sobre su apoyito
      s += face(rr(56, 49, 7, 3.4, 1.6), '#F7B6C4', { w: 1 });
      s += tube('M14 54.6L74 47.6', 2.2, '#D9B48A') + tube('M15 52.4L74.6 45.4', 2.2, '#C9A06A');
      return s;
    },
  },
];

// ── K-pop ──────────────────────────────────────────────────────────
const KPOP = [
  {
    id: 'lightstick', name: 'Lightstick en su base', price: 85, w: 52, h: 98, place: 'sobre',
    draw: () => {
      const L = '#C9A6FF', ml = mat(L), P = '#FF8FC0';
      let s = glow(26, 28, 26, 26, '#E8D4FF', 0.45) + surf(26, 95, 17);
      // la base redonda con su cunita
      s += cylinder(26, 95, 15, 6, '#F4EEF8', { w: 1.6 }) + line('M12.4 94Q26 99 39.6 94', '#FFFFFF', 1.2, { opacity: 0.7 });
      s += cylinder(26, 88.4, 7.2, 7, ml.top, { w: 1.4 });
      // el mango con sus botones
      s += part('M20.6 52H31.4L30.6 84Q26 86.4 21.4 84Z', '#FFFFFF', { w: 1.6 });
      s += shade('M27.8 52H31.4L30.6 84Q29 85.2 27.6 85.4Z', '#B8AFC4', 0.3);
      s += face(rr(23.4, 60, 5.2, 7, 2.2), P, { w: 1.1 }) + face(rr(23.6, 69.6, 4.8, 3.4, 1.6), L, { w: 1 });
      s += line('M22.4 54.6V80', '#FFFFFF', 1.2, { opacity: 0.8 });
      // el cuello y la cúpula de luz con el corazón adentro
      s += face(rr(18.6, 46, 14.8, 7, 2.6), L, { w: 1.5 }) + line('M20.6 48H31', ml.hi, 1.1, { opacity: 0.8 });
      s += part(ellD(26, 27, 19, 19), '#F4ECFF', { w: 1.8 });
      s += flat(ellD(26, 28, 15, 15), '#EADCFF');
      s += part(heart(26, 28.6, 10.4), P, { w: 1.5 }) + flat(heart(24, 26.4, 5), tone(P, 0.7));
      s += roundShade(26, 27, 19, 19, '#D8C6F4', 0.26, 0.3);
      s += shine('M12.6 22C13.6 15.6 18 11 24 10L24.4 12.4C19.4 13.4 16 17 15.2 22.6Z', { opacity: 0.8 }) + gloss(36, 37, 2, 1.2, -40, 0.7);
      s += part(ellD(26, 8.4, 4, 2.6), L, { w: 1.2 });
      s += sparkle(6, 12, 3.2, '#FFFFFF') + sparkle(46, 18, 2.6, '#FFF3B0') + sparkle(45, 46, 2, '#FFFFFF');
      return s;
    },
  },
  {
    id: 'albumKpop', name: 'Álbum y photocards', price: 65, w: 84, h: 66, place: 'sobre',
    draw: () => {
      const A = '#C9B6FF', ma = mat(A);
      let s = surf(42, 63, 38);
      // el álbum parado, con su lomo grueso y la portada holográfica
      s += face(rrTop(8, 9, 42, 4.4, 1.6), '#FFFFFF', { w: 1.4 }) + line('M10 11.4H48', '#E4DCF0', 1, { opacity: 0.9 });
      s += face(rr(8, 13, 42, 48, 1.6), A, { w: 1.8 });
      s += clip(rr(8, 13, 42, 48, 1.6), flat(rr(8, 13, 42, 26, 0), '#FFC9DE') + flat(rr(8, 33, 42, 5, 0), '#FFE7A8')
        + flat(ellD(29, 33, 14, 14), '#BFE6FF') + flat(ellD(29, 33, 9, 9), '#F4FBFF') + shade(rr(41, 13, 9, 48, 0), ma.deep, 0.2));
      s += part(heart(29, 34, 6.4), '#FF8FC0', { w: 1.3 }) + flat(heart(27.6, 32.6, 2.6), '#FFD3E6');
      s += flat('M13 18h12v2.4H13ZM13 22.4h7v2.4H13Z', '#FFFFFF') + flat('M14 52h22v2.4H14Z', ma.side);
      s += sparkle(43, 20, 2.8, '#FFFFFF') + sparkle(15, 44, 2.2, '#FFFFFF');
      // las photocards en abanico, de atrás para adelante
      const card = (cx, a, bg, hair, extra = '') => rot(a, cx, 60,
        face(rr(cx - 9.5, 32, 19, 27, 2), '#FFFFFF', { w: 1.4 })
        + flat(rr(cx - 7.6, 34, 15.2, 21, 1), bg)
        + part(`M${cx - 6.6} 55C${cx - 6.6} 49 ${cx - 3.6} 47 ${cx} 47C${cx + 3.6} 47 ${cx + 6.6} 49 ${cx + 6.6} 55Z`, '#FFFFFF', { w: 1 })
        + part(ellD(cx, 42, 4.4, 4.6), '#FFE3D3', { w: 1 })
        + part(`M${cx - 4.8} 42C${cx - 5.4} 36.6 ${cx - 2.4} 35.6 ${cx} 35.6C${cx + 2.4} 35.6 ${cx + 5.4} 36.6 ${cx + 4.8} 42C${cx + 3} 39.6 ${cx - 3} 39.6 ${cx - 4.8} 42Z`, hair, { w: 1 })
        + dots([[cx - 1.6, 42.6], [cx + 1.6, 42.6]], 0.7, INK) + extra);
      s += card(52, -16, '#BFE6FF', '#3A3044');
      s += card(62, -2, '#FFE7A8', '#E57B93');
      // la de adelante va en su funda dura con stickers
      s += card(71, 12, '#D8F2C8', '#7A5236',
        shade(rr(61.5, 30, 19, 30, 1), '#E8F4FF', 0.35) + line('M62 30.6H80', '#FFFFFF', 1.8, { opacity: 0.9 })
        + part(heart(64.6, 54, 2.6), '#FF6F91', { w: 0.9 }) + part(puff(78, 36, 2.8), '#FFE07A', { w: 0.9 }));
      return s;
    },
  },
  {
    id: 'abanicoFan', name: 'Abanico de fan', price: 50, w: 58, h: 94, place: 'sobre',
    draw: () => {
      const P = '#FF8FC0', mp = mat(P), Y = '#FFE07A';
      let s = surf(29, 91, 17);
      // la base de acrílico
      s += face(rr(16, 83, 26, 7, 2), '#E3F1FA', { w: 1.4 }) + face(rrTop(16, 79.6, 26, 4, 1.6), '#F4FAFF', { w: 1.3 }) + flat(rr(26.4, 80.6, 5.2, 2, 0.8), '#B8C8D8');
      // el palito
      s += part('M26.6 50H31.4L31 82H27Z', '#FFFFFF', { w: 1.5 }) + line('M28 54V79', '#E4DCF0', 1);
      // el abanico redondo con su borde de cintita brillante
      let sc = '';
      const n = 18, cx = 29, cy = 28, r = 25;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
        const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
        const q = [cx + Math.cos(am) * (r + 4.4), cy + Math.sin(am) * (r + 4.4)];
        sc += `${i ? '' : `M${f1(p0[0])} ${f1(p0[1])}`}Q${f1(q[0])} ${f1(q[1])} ${f1(p1[0])} ${f1(p1[1])}`;
      }
      s += part(`${sc}Z`, P, { w: 1.6 });
      s += part(ellD(cx, cy, 21.6, 21.6), '#FFF4FA', { w: 1.5 });
      s += clip(ellD(cx, cy, 21.6, 21.6), flat(rr(6, 36, 46, 16, 0), '#E9DCFF') + shade(crescentD(cx, cy, 21.6, 0.3, 0.92), mp.deep, 0.15));
      // el corazón grande y las letras como stickers
      s += part(heart(29, 30, 12), '#FF6F91', { w: 1.6 }) + flat(heart(26, 26.6, 5), '#FFB3C8');
      s += part(rr(12.6, 11.6, 7, 7, 2), Y, { w: 1.1 }) + part(rr(21, 9.4, 7, 7, 2), '#9ED9C0', { w: 1.1 }) + part(rr(30, 9.4, 7, 7, 2), '#7FC8F8', { w: 1.1 }) + part(rr(38.4, 11.6, 7, 7, 2), '#C9A6FF', { w: 1.1 });
      s += flat('M14.8 13.4h1.4v3.4h2v1.2h-3.4ZM23.2 12.2h2.6a1.2 1.2 0 0 1 0 2.4h-1.2v2.6h-1.4ZM32.2 11.4h1.4v2.2h1.6v-2.2h1.4v5.6h-1.4v-2.2h-1.6v2.2h-1.4ZM40.6 13.4h2.6v1.2h-1.2v.6h1.2v1.2h-1.2v.6h1.2v1.2h-2.6Z', '#FFFFFF');
      s += part(puff(12, 39, 3.6), Y, { w: 1 }) + part(puff(46, 41, 3), Y, { w: 1 }) + sparkle(42, 25, 2.6, '#FFFFFF');
      s += shine('M9.6 20C11 15 14 12 17 10.4L18 11.8C15 13.6 12.6 16.6 11.6 20.6Z', { opacity: 0.7 });
      // el moñito donde se une el palito
      s += bow(29, 50.6, 0.5, Y);
      return s;
    },
  },
];

// ── Gatitos ────────────────────────────────────────────────────────
// Gatito acostado hecho bolita (para la camita y el rascador).
function curledCat(x, y, k, c, o = {}) {
  const m = mat(c), IN = o.inner || '#FFC9D6', W = o.white || '#FFFFFF';
  const P = (dx, dy) => `${f1(x + dx * k)} ${f1(y + dy * k)}`;
  let s = '';
  // el lomo y la cola enroscada adelante
  s += part(`M${P(-14, 2)}C${P(-16, -10)} ${P(-4, -14)} ${P(6, -13)}C${P(18, -12)} ${P(24, -6)} ${P(23, 2)}C${P(22, 8)} ${P(-12, 8)} ${P(-14, 2)}Z`, c, { w: 1.6 });
  s += shade(`M${P(10, -12)}C${P(19, -10)} ${P(24, -5)} ${P(23, 2)}C${P(21, 6)} ${P(12, 7)} ${P(8, 7)}C${P(14, 2)} ${P(14, -6)} ${P(10, -12)}Z`, m.deep, 0.22);
  if (o.stripes) s += line(`M${P(0, -12.6)}Q${P(2, -8)} ${P(0, -4.6)}M${P(6, -12.8)}Q${P(8.6, -8)} ${P(6.6, -3.6)}M${P(12, -11.4)}Q${P(14.6, -7)} ${P(13, -3)}`, o.stripes, 2.2, { opacity: 0.85 });
  s += part(`M${P(22, 0)}C${P(24, 8)} ${P(8, 10)} ${P(-4, 8.6)}C${P(-9, 8)} ${P(-10, 5)} ${P(-6, 4.6)}C${P(4, 5.6)} ${P(14, 5)} ${P(18, -1)}Z`, c, { w: 1.4 });
  if (o.tip) s += flat(`M${P(-4, 8.6)}C${P(-9, 8)} ${P(-10, 5)} ${P(-6, 4.6)}C${P(-4, 4.8)} ${P(-2.4, 5)} ${P(-1, 5.1)}C${P(-1.6, 6.6)} ${P(-2, 8)} ${P(-4, 8.6)}Z`, o.tip);
  // la cabeza apoyada en las patitas
  s += part(`M${P(-18, -9)}L${P(-19, -21)}L${P(-11, -15)}Z`, c, { w: 1.4 }) + part(`M${P(-5, -16)}L${P(-1, -24)}L${P(1, -12)}Z`, c, { w: 1.4 });
  s += flat(`M${P(-17.4, -11.4)}L${P(-18, -18)}L${P(-13.4, -14.4)}Z`, IN) + flat(`M${P(-3.6, -15.4)}L${P(-1.4, -20.6)}L${P(-0.6, -14)}Z`, IN);
  s += part(ellD(x - 10 * k, y - 7 * k, 11 * k, 9.4 * k), c, { w: 1.6 });
  if (o.patch) s += clip(ellD(x - 10 * k, y - 7 * k, 11 * k, 9.4 * k), flat(ellD(x - 3 * k, y - 13 * k, 7 * k, 6 * k), o.patch));
  s += flat(ellD(x - 10 * k, y - 3 * k, 6.4 * k, 4 * k), W, { opacity: 0.95 });
  s += part(ellD(x - 15 * k, y + 1.4 * k, 4.4 * k, 2.8 * k), W, { w: 1.1 }) + part(ellD(x - 6.4 * k, y + 2 * k, 4.4 * k, 2.8 * k), W, { w: 1.1 });
  s += sleepEye(x - 14 * k, y - 8 * k, 4 * k) + sleepEye(x - 6 * k, y - 8 * k, 4 * k);
  s += flat(`M${P(-11, -5.4)}h${f1(2 * k)}l${f1(-1 * k)} ${f1(1.2 * k)}Z`, '#F28CA8') + catMouth(x - 10 * k, y - 3.6 * k, 3.4 * k);
  s += blush(x - 17.6 * k, y - 4.6 * k, 2 * k) + blush(x - 2.4 * k, y - 4.6 * k, 2 * k);
  return s;
}

const GATITOS = [
  {
    id: 'rascador', name: 'Árbol rascador', price: 150, w: 94, h: 152, place: 'piso',
    draw: () => {
      const CP = '#C9B6E4', mc = mat(CP), SI = '#E3C38E', ms = mat(SI);
      let s = floorSh(47, 149, 42, 6);
      const post = (x, y0, y1, w) => {
        let rope = '';
        for (let y = y0 + 3.4; y < y1 - 1; y += 3.4) rope += `M${x + 1} ${f1(y)}Q${f1(x + w / 2)} ${f1(y + 1.4)} ${x + w - 1} ${f1(y)}`;
        return face(rr(x, y0, w, y1 - y0, 1.6), SI, { w: 1.6 }) + line(rope, ms.side, 1.2, { opacity: 0.8 }) + shade(rr(x + w * 0.62, y0, w * 0.38, y1 - y0, 1.6), ms.deep, 0.22) + line(`M${x + 2.4} ${y0 + 2}V${y1 - 2}`, ms.hi, 1.2, { opacity: 0.7 });
      };
      // la base alfombrada
      s += box(6, 148, 82, 10, 30, CP, { r: 3 });
      s += shade(rr(7, 143, 80, 4, 2), mc.deep, 0.22);
      s += dots([[14, 128], [26, 124], [44, 130], [62, 125], [78, 129], [36, 133], [70, 133.4]], 1.1, mc.top);
      // un ratoncito de juguete en la base
      s += part('M66 141C66 136 70 134 74 134C78 134 80 137 80 141Z', '#B9B3CC', { w: 1.3 }) + part(ellD(68.4, 134.4, 2.6, 2.6), '#B9B3CC', { w: 1.1 }) + flat(ellD(68.4, 134.6, 1.3, 1.3), '#FFB3C6') + line('M80 140Q86 139 86 134', '#8A80B0', 1.2) + dot(67, 139, 0.8, INK);
      // los dos postes de sisal
      s += post(20, 62, 134, 15);
      s += post(60, 96, 135, 12);
      // la repisa del medio, con su pompón colgando
      s += box(50, 98, 40, 6, 20, CP, { r: 2.4 });
      s += line('M84 98V118', '#8A6A9E', 1.3) + ball(84, 121, 4.4, '#FF8FB0', 1.3) + line('M81.4 119.4l5 3.6M86.6 119.4l-5 3.6', tone('#FF8FB0', -0.8), 1.1) + dot(82.6, 119.6, 1.1, '#FFFFFF');
      // la repisa de arriba con su cojín redondo
      s += box(4, 62, 50, 6, 26, CP, { r: 2.4 });
      s += face('M8 50A21 6.4 0 0 0 50 50V54A21 6.4 0 0 1 8 54Z', mix(CP, '#FFFFFF', 0.25), { w: 1.4 });
      s += face(ellD(29, 50, 21, 6.4), mix(CP, '#FFFFFF', 0.5), { w: 1.4 });
      // el gatito naranja durmiendo arriba
      s += curledCat(32, 49, 1.12, '#F2A65A', { stripes: '#D9823A', tip: '#FFFFFF' });
      s += line('M52 18h5l-5 5h5M60 9h3.6l-3.6 3.6h3.6', '#8A80B0', 1.5);
      return s;
    },
  },
  {
    id: 'camitaGato', name: 'Gatito en su camita', price: 95, w: 92, h: 62, place: 'piso',
    draw: () => {
      const B = '#F7C6D9', mb = mat(B), G = '#B9B3CC';
      let s = floorSh(44, 59, 40, 6);
      // la camita de dona: el borde de atrás, el hueco y el gatito
      s += part(ellD(44, 42, 40, 16), B, { w: 1.8 });
      s += flat(ellD(44, 38.6, 28, 9.6), mb.side);
      s += flat(ellD(44, 40, 24, 7.4), '#FFF1F6');
      s += curledCat(50, 41, 1, G, { patch: '#8E88A6', stripes: '#9A94B4' });
      // el borde de adelante, esponjoso, tapa la panza del gatito
      s += part('M4 42A40 16 0 0 0 84 42C84 38 80 36 76 37A28 9.6 0 0 1 12 37C8 36 4 38 4 42Z', B, { w: 1.8 });
      s += line('M9 45.6Q44 61 79 45.6', mb.hi, 1.6, { opacity: 0.7 }) + shade('M60 55.4Q76 51 82 44.6Q84.4 47 82 50Q74 56 60 57.6Z', mb.deep, 0.3);
      s += line('M70 9h5l-5 5h5M78 3h3.4l-3.4 3.4h3.4', '#8A80B0', 1.5);
      // el ovillo de lana al lado
      s += ball(84, 52, 6.4, '#7FA9DE', 1.4) + line('M79 50Q84 47 89 50.6M78.6 54Q84 51 89.6 54.4M82 46.4Q86 51 84.6 58', tone('#7FA9DE', -0.9), 1.1) + line('M80 57.4Q74 60 70 58.6', '#7FA9DE', 1.4);
      return s;
    },
  },
  {
    id: 'manekiNeko', name: 'Gato de la suerte', price: 70, w: 58, h: 76, place: 'sobre',
    draw: () => {
      const W = '#FFFDF8', mw = mat('#F2EADF'), R = '#E8505E', mr = mat(R), O = '#F2A65A';
      let s = surf(29, 73, 22);
      // el cojín rojo con sus borlas doradas
      s += face(rr(6, 64, 46, 8, 4), R, { w: 1.6 }) + face(rrTop(8, 59.6, 42, 6, 3), mr.top, { w: 1.4 });
      s += part(ellD(7.6, 68, 2.4, 3.2), GOLD, { w: 1 }) + part(ellD(50.4, 68, 2.4, 3.2), GOLD, { w: 1 });
      // el cuerpo de cerámica
      s += part('M12 62C10 52 12 42 18 38H40C46 42 48 52 46 62Z', W, { w: 1.8 });
      s += clip('M12 62C10 52 12 42 18 38H40C46 42 48 52 46 62Z', flat(ellD(44, 50, 7, 10), '#3A3044') + shade('M36 38H40C46 42 48 52 46 62H38C42 54 41 44 36 38Z', mw.deep, 0.24));
      // la patita alzada que saluda
      s += part('M40 40C42 34 43 26 43 20L50 20C50 27 49 35 46 41Z', W, { w: 1.6 });
      s += part(ellD(46.6, 17.6, 5.4, 6), W, { w: 1.6 }) + flat(ellD(46.6, 18.6, 2.4, 2.2), '#FFB3C6') + dots([[44, 14.6], [46.6, 13.6], [49.2, 14.6]], 0.9, '#FFB3C6');
      // la moneda dorada en la otra patita
      s += part(rr(17.6, 44, 17, 15, 6), GOLD, { w: 1.6 }) + line('M21.4 48.6h9.4M21.4 51.6h9.4M21.4 54.6h9.4', tone(GOLD, -0.9), 1.1) + shine('M20.4 46.4h2.4v4h-2.4Z', { opacity: 0.6 });
      s += part(ellD(17, 55, 4.4, 4), W, { w: 1.4 });
      // la cabeza: orejas, mancha naranja y la carita feliz
      s += part('M14 23L15 8L25 15Z', W, { w: 1.6 }) + part('M44 23L43 8L33 15Z', O, { w: 1.6 });
      s += flat('M16.4 19L17 11.6L22 15.4Z', '#FFB3C6') + flat('M41.6 19L41 11.6L36 15.4Z', '#FFC9D6');
      s += part(ellD(29, 26, 17, 14), W, { w: 1.8 });
      s += clip(ellD(29, 26, 17, 14), flat(ellD(41, 17, 9, 7.4), O) + shade(`M36 13C44 16 47 24 44 32C40 37 34 40 30 40C40 34 41 22 36 13Z`, mw.deep, 0.2));
      s += happyEye(22.6, 25.4, 5) + happyEye(35.4, 25.4, 5);
      s += flat('M27.6 29h2.8l-1.4 1.6Z', '#F28CA8') + catMouth(29, 31, 4.4) + blush(19, 31, 3) + blush(39, 31, 3);
      s += line('M14 28.6l-5 -1M14 31.4l-5 1M44 28.6l5 -1M44 31.4l5 1', '#C9BFB4', 1.2, { 'data-skip': 'pixel' });
      s += gloss(20, 17, 3, 1.6, -40, 0.85);
      // el collar rojo con su cascabel
      s += part('M14.6 37.6Q29 44 43.4 37.6L43 41.4Q29 47.6 15 41.4Z', R, { w: 1.4 });
      s += ball(29, 45.6, 3.6, GOLD, 1.3) + line('M26.4 46.6h5.2', tone(GOLD, -1.2), 1) + dot(27.8, 44.4, 0.9, '#FFFFFF');
      return s;
    },
  },
];

// ── Café ───────────────────────────────────────────────────────────
const CAFE = [
  {
    id: 'espresso', name: 'Máquina de espresso', price: 140, w: 86, h: 82, place: 'sobre',
    draw: () => {
      const M = '#A8DCC8', mm = mat(M), mc = mat(CHROME), K = '#3A3044';
      let s = surf(43, 79, 39);
      // las tacitas sobre la bandeja calentadora de arriba
      s += face(rrTop(14, 18, 58, 4.4, 2), mc.top, { w: 1.3 }) + line('M16 20.2H70', '#FFFFFF', 1, { opacity: 0.8 });
      const cup = (x, y, c) => part(`M${x - 5} ${y - 7}H${x + 5}L${x + 4} ${y}H${x - 4}Z`, c, { w: 1.2 }) + face(ellD(x, y - 7, 5, 1.6), tone(c, 0.6), { w: 1 }) + line(`M${x + 5} ${y - 5.4}q2.6 0.6 1.4 3`, INK, 1);
      s += cup(26, 18, '#FFFFFF') + cup(39, 18, '#F7B6C4');
      // el cuerpo de la máquina con su franja cromada
      s += face(rrTop(12, 21.6, 62, 4, 2.4), mm.top, { w: 1.5 });
      s += face(rr(12, 25, 62, 31, 3), M, { w: 1.8 });
      s += face(rr(12, 37, 62, 4.6, 0), CHROME, { w: 1.3 }) + line('M14 38.4H72', '#FFFFFF', 1.1, { opacity: 0.8 });
      s += shade(rr(62, 25.6, 11.4, 30, 2.6), mm.deep, 0.22);
      // el manómetro y las perillas
      s += part(ellD(24, 31, 5.4, 5.4), CHROME, { w: 1.4 }) + flat(ellD(24, 31, 3.8, 3.8), '#FFFDF4') + line('M24 31l2.4 -2', '#E8505E', 1.2) + dot(24, 31, 0.8, K);
      s += ball(57, 30.6, 2.8, '#FF8FAB', 1.2) + ball(64.6, 30.6, 2.8, '#FFE07A', 1.2);
      // el grupo y el portafiltro con su mango
      s += face(rr(35, 45.6, 16, 6, 1.6), CHROME, { w: 1.4 }) + face(rr(33, 51, 20, 4.6, 2), mc.side, { w: 1.4 });
      s += tube('M34 53.6L13 57', 3.6, K) + part(ellD(12.4, 57.2, 2.6, 2.2), K, { w: 1.1 });
      s += line('M40 55.6V61M46 55.6V61', '#7A4A30', 1.4, { opacity: 0.95 });
      // la lanceta de vapor a un costado, soltando una nubecita
      s += tube('M66 45C68 52 69 58 68 64', 2.2, CHROME) + face(rr(64, 42, 5, 4.6, 1.4), mc.side, { w: 1.1 });
      s += steam(70, 63, 18);
      // la bandeja con su rejilla y la tacita llenándose
      s += face(rrTop(10, 64, 66, 4.4, 2), mc.top, { w: 1.4 }) + face(rr(10, 67.6, 66, 8.4, 2.4), CHROME, { w: 1.6 });
      s += line('M18 66H68', mc.side, 1.2, { 'stroke-dasharray': '3 2' });
      s += shade(rr(11, 72, 64, 3.4, 1.6), mc.deep, 0.24);
      s += part('M37 58.6H49L48 65.4Q43 67.4 38 65.4Z', '#FFFFFF', { w: 1.3 }) + flat(ellD(43, 58.8, 5.6, 1.4), '#7A4A30') + line('M49 60q2.8 0.8 1.4 3.6', INK, 1);
      s += shine('M15 27.6H36V29.2H15Z', { opacity: 0.5 });
      return s;
    },
  },
  {
    id: 'tazaLatte', name: 'Taza con arte latte', price: 45, w: 70, h: 58, place: 'sobre',
    draw: () => {
      const C = '#F7B6C4', mc = mat(C), PL = '#FBF8F4', mp = mat(PL);
      let s = surf(35, 55, 30);
      // el platito
      s += face('M5 47.4A30 7 0 0 0 65 47.4V49.6A30 7 0 0 1 5 49.6Z', mp.side, { w: 1.4 }) + face(ellD(35, 47.4, 30, 7), PL, { w: 1.5 }) + line(ellD(35, 47.4, 20, 4.4), mp.side, 1.1, { opacity: 0.6 });
      // el vapor que sube
      s += steam(29, 15, 16) + steam(39, 13, 14);
      // la taza de cerámica y su asa
      s += part('M52 26C61 24.6 64 31 61.6 36C59.6 40.4 55 42 50.4 41.4L50.6 37.6C54 38 57 36.6 58 34C59.2 30.6 57 28.6 52.4 29.6Z', C, { w: 1.6 });
      s += part('M15 23V40C15 46 23 49.4 35 49.4C47 49.4 55 46 55 40V23Z', C, { w: 1.8 });
      s += shade('M45 24H55V40C55 44 52 46.6 47 48C49 41 48.6 31 45 24Z', mc.deep, 0.24);
      s += shine('M18.4 28V38H20.6V28Z', { opacity: 0.7 }) + line('M15.6 41.4Q35 47 54.4 41.4', '#FFFFFF', 2.6, { opacity: 0.95 }) + flat(heart(36, 33.4, 3.4), '#FFFFFF');
      // la boca con el latte y su corazón de espuma
      s += face(ellD(35, 23, 20, 6), mc.top, { w: 1.6 });
      s += flat(ellD(35, 23.6, 17.4, 4.6), '#C99062');
      s += line(ellD(35, 23.6, 15.4, 3.8), '#E2B58A', 1.4);
      s += `<g transform="translate(35 23.4) scale(1 0.5)">${flat(heart(0, 0.4, 10), '#FFF6EC')}</g>`;
      // una galletita y dos terrones de azúcar en el plato
      s += part(ellD(13, 50.6, 7.6, 3.6), '#E2B070', { w: 1.3 }) + dots([[10.6, 50], [14.6, 51.2], [12.6, 49]], 1.1, '#6A4030');
      s += face(rr(54, 47.4, 5.4, 4.6, 1), '#FFFFFF', { w: 1.1 }) + face(rr(58.4, 49.4, 5.4, 4.6, 1), '#FFFFFF', { w: 1.1 });
      return s;
    },
  },
  {
    id: 'sacoCafe', name: 'Saco de café', price: 80, w: 80, h: 82, place: 'piso',
    draw: () => {
      const B = '#D9B98A', mb = mat(B), D = '#5A3424';
      let s = floorSh(40, 79, 35, 6);
      // la pala de madera enterrada en los granos
      s += tube('M50 30L66 6', 3.6, '#C99A6A') + part(ellD(66.4, 5.6, 3, 2.4), '#C99A6A', { w: 1.1 });
      // el saco de arpillera
      const body = 'M11 30C6 44 7 66 16 74Q40 80 64 74C73 66 74 44 69 30Z';
      s += part(body, B, { w: 1.8 });
      let wv = '';
      for (let y = 34; y < 78; y += 4) wv += `M6 ${y}H74`;
      let wv2 = '';
      for (let x = 10; x < 72; x += 4) wv2 += `M${x} 28V80`;
      s += clip(body, line(wv, mb.side, 1, { opacity: 0.3, 'data-skip': 'neon' }) + line(wv2, mb.hi, 1, { opacity: 0.3, 'data-skip': 'neon' }) + shade('M52 28H76V80H54C62 66 62 44 52 28Z', mb.deep, 0.24));
      // el sello estampado: un grano y su franja
      s += line('M27 50h26', '#8A4A30', 2.4, { opacity: 0.55 }) + line(ellD(40, 58, 8.4, 6.4), '#8A4A30', 1.6, { opacity: 0.6 });
      s += flat(ellD(40, 58, 4.4, 3.2), '#8A4A30', { opacity: 0.55 }) + line('M37 59q3 -2.6 6 0', '#D9B98A', 1.1);
      s += line('M27 66h26', '#8A4A30', 2.4, { opacity: 0.55 });
      // la boca enrollada y el montón de granos
      s += flat(ellD(40, 27.6, 27, 6.6), D);
      s += part('M16 28C18 18 30 14 40 14C50 14 62 18 64 28Z', '#6A3E2A', { w: 1.3 });
      [[24, 24, -20], [31, 20, 10], [39, 17.6, -6], [47, 20, 18], [55, 24, -14], [28, 26.6, 30], [36, 24, -24], [44, 25, 8], [51, 27.4, -30], [42, 20.6, 40]].forEach(([x, y, a]) => { s += bean(x, y, 3.2, a); });
      s += face('M9 28A31 9 0 0 0 71 28V34A31 9 0 0 1 9 34Z', mix(B, '#FFFFFF', 0.25), { w: 1.6 });
      s += line('M11 31Q40 41 69 31', mb.side, 1.2, { opacity: 0.7 });
      // granos que se escaparon
      s += bean(18, 79, 3, 20) + bean(26, 80, 3, -30) + bean(66, 79.4, 3, 10);
      return s;
    },
  },
];

// ── Plantas ────────────────────────────────────────────────────────
const PLANTAS = [
  {
    id: 'monstera', name: 'Monstera', price: 160, w: 102, h: 154, place: 'piso',
    draw: () => {
      const Wd = '#C99A6A', mw = mat(Wd), PT = '#F4EEE6', G = ['#3F8A5A', '#4F9E68', '#64B47A'];
      let s = floorSh(51, 151, 30, 5);
      // el soporte de madera con tres patas
      s += tube('M34 116L26 150', 4.4, Wd) + tube('M68 116L76 150', 4.4, Wd) + tube('M51 118V146', 4, mw.side);
      s += face('M26 112A25 6 0 0 0 76 112V117A25 6 0 0 1 26 117Z', mw.side, { w: 1.5 }) + face(ellD(51, 112, 25, 6), mw.top, { w: 1.4 });
      // los tallos (salen de la tierra) y las hojas, de atrás para adelante
      s += line('M50 84C50 70 50 56 50 44M48 84C42 72 36 62 32 56M54 84C60 70 66 60 70 52M46 86C42 82 38 80 35 79M56 86C60 82 63 80 66 78', '#5E9C6A', 2.6);
      s += monsteraLeaf(50, 44, 36, -4, G[0]);
      s += monsteraLeaf(32, 56, 30, -56, G[1], { cuts: [0.32, 0.5, 0.68] });
      s += monsteraLeaf(70, 52, 31, 50, G[1], { cuts: [0.3, 0.48, 0.66, 0.8] });
      s += monsteraLeaf(35, 79, 24, -104, G[2], { cuts: [0.36, 0.58, 0.78] });
      s += monsteraLeaf(66, 78, 24, 106, G[2], { cuts: [0.34, 0.56, 0.76] });
      // la hoja nueva, todavía enrollada
      s += part('M55 84C53 74 54 66 58 60C60 66 60 76 58 84Z', '#A8D88E', { w: 1.3 }) + line('M56.4 82C55.6 74 56 68 58 62', '#CDEBB8', 1.1, { opacity: 0.9 });
      // la maceta blanca de terrazo
      s += pot(51, 112, 22, 17, 28, PT, '#6B4A3A');
      s += dots([[38, 96], [46, 104], [59, 98], [64, 106], [43, 109]], 1.4, '#F2A7B5') + dots([[52, 92.6], [40, 102], [57, 108], [66, 97]], 1.2, '#7FA9DE') + dots([[48, 97], [61, 102.6], [37, 106.6]], 1.1, '#F2C14E');
      s += shine('M31.6 89L34 106H36.2L34 89Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'repisaPlantas', name: 'Repisa de plantitas', price: 90, w: 108, h: 66, place: 'sobre', hang: true,
    draw: () => {
      const Wd = '#C99A6A', mw = mat(Wd);
      let s = '';
      // la sombra en la pared y las ménsulas atornilladas
      s += shade(rr(8, 46, 92, 8, 4), '#2A1C24', 0.12);
      const br = (x) => part(`M${x} 44V60C${x} 61 ${x + 1} 62 ${x + 2} 62C${x + 2} 54 ${x + 6} 48 ${x + 12} 46V44Z`, mw.side, { w: 1.4 }) + dot(x + 2.4, 49, 1, mw.deep);
      s += br(20) + mirrorBr(88, mw);
      // la tabla con su canto
      s += face(rrTop(4, 40, 100, 5, 1.6), mw.top, { w: 1.4 });
      s += face(rr(4, 44.4, 100, 6.4, 1.6), Wd, { w: 1.6 }) + grain([[10, 34, 47.6, 0.6], [62, 96, 48, 0.6]], Wd, 0.5);
      // el potus en su maceta de barro, con las guías que caen por el borde
      s += line('M17 40C12 48 13 56 10 64M24 40C24 48 21 54 22 62M31 41C35 46 34 52 38 56', '#5E9C6A', 1.6);
      s += pot(24, 41, 10, 8, 13, '#E08A5E', '#6B4A3A');
      [[10, 64, 2.6, 180, '#5FA66A'], [11.4, 56, 2.8, 150, '#7FBF8A'], [14, 48, 3, 200, '#5FA66A'], [22, 62, 2.6, 170, '#7FBF8A'], [22.4, 54, 2.8, 200, '#5FA66A'], [38, 56, 2.6, 160, '#7FBF8A'], [35, 49, 2.8, 210, '#5FA66A']].forEach(([x, y, k, a, c]) => { s += heartLeaf(x, y, k * 2.2, a, c); });
      [[18, 27, 3, -30, '#5FA66A'], [24, 24, 3.2, 0, '#7FBF8A'], [30, 27, 3, 30, '#5FA66A'], [21, 30, 2.8, -60, '#7FBF8A'], [28, 30.4, 2.8, 60, '#86C49A']].forEach(([x, y, k, a, c]) => { s += heartLeaf(x, y + 6, k * 2.2, a, c); });
      // la lengua de suegra en su maceta blanca
      const sansev = (x, h, a, c) => rot(a, x, 38, part(`M${x - 3} 38C${x - 4} ${38 - h * 0.6} ${x - 1.6} ${38 - h * 0.9} ${x} ${38 - h}C${x + 1.6} ${38 - h * 0.9} ${x + 4} ${38 - h * 0.6} ${x + 3} 38Z`, c, { w: 1.2 }) + line(`M${x - 2.4} 36C${x - 3} ${38 - h * 0.6} ${x - 1.2} ${38 - h * 0.85} ${x} ${38 - h + 2}`, '#E8D67A', 1.2, { opacity: 0.9 }) + line(`M${x} ${36}V${38 - h * 0.6}`, tone(c, 0.6), 1, { opacity: 0.6 }));
      s += sansev(49, 24, -14, '#4F8E5E') + sansev(58, 28, 10, '#3F7A50') + sansev(53.4, 33, -2, '#5E9C6A');
      s += cylinder(54, 44, 9.4, 11, '#FBF8F4', { w: 1.5 }) + flat(ellD(54, 33, 8, 3), '#6B4A3A') + line('M45.4 39.6Q54 44 62.6 39.6', '#9ED9C0', 2);
      // el cactus redondo con su florcita
      s += part(ellD(82, 21, 9.4, 9.8), '#7FBF8A', { w: 1.5 }) + line('M77 14.4Q76 21 77.4 28M82 11.4V30M87 14.4Q88 21 86.6 28', '#5E9C6A', 1.2, { opacity: 0.8 });
      s += dots([[78.4, 17], [85.6, 17], [79.6, 24], [84.4, 24.4]], 0.8, '#FFFFFF');
      s += roundShade(82, 21, 9.4, 9.8, '#7FBF8A', 0.3, 0.25) + blossom(82, 11.6, 3.4, '#FF8FB0', 5, '#FFE07A');
      s += pot(82, 41, 10, 8, 12, '#9ED9C0', '#6B4A3A');
      return s;
    },
  },
  {
    id: 'regadera', name: 'Regadera y almácigos', price: 55, w: 84, h: 64, place: 'sobre',
    draw: () => {
      const M = '#9ED9C0', mm = mat(M), T = '#E08A5E';
      let s = surf(42, 61, 38);
      // el pico largo con su flor de agujeritos
      s += tube('M33 49C24 44 16 36 11 27', 4.4, M);
      s += rot(-38, 9, 23, part(ellD(9, 23, 4.4, 6), mm.side, { w: 1.4 }) + flat(ellD(8.4, 23, 2.6, 4.2), mm.top) + dots([[8.4, 20.6], [7.6, 23], [8.4, 25.4], [9.6, 22]], 0.6, mm.deep));
      // el asa en arco
      s += tube('M38 26C38 12 60 12 60 26', 3.6, mm.side);
      // el cuerpo esmaltado
      s += part('M32 28V54C32 58 38 60 47 60C56 60 62 58 62 54V28Z', M, { w: 1.8 });
      s += shade('M53 29H62V54C62 57 59 58.6 55 59.4C57 51 57 38 53 29Z', mm.deep, 0.24);
      s += face(ellD(47, 28, 15, 4.4), mm.top, { w: 1.5 }) + flat(ellD(47, 28.4, 11.6, 2.8), '#5A8A9A');
      s += line('M32.4 34H61.6', mm.hi, 1.2, { opacity: 0.6 }) + line('M32.4 51Q47 55 61.6 51', mm.side, 1.4, { opacity: 0.7 });
      s += shine('M35.4 32V50H37.6V32Z', { opacity: 0.7 }) + blossom(47, 43, 4.6, '#FFFFFF', 5, '#FFD966');
      // dos almácigos con sus brotes
      const sprout = (x, y, k) => line(`M${x} ${y}V${f1(y - 7 * k)}`, '#5E9C6A', 1.6) + spoon(x, f1(y - 7 * k), 6 * k, -150, 2.6 * k, '#7FBF8A') + spoon(x, f1(y - 7 * k), 6 * k, -30, 2.6 * k, '#96CFAF');
      s += pot(70, 51, 7, 5.4, 9, T, '#6B4A3A') + sprout(70, 38.4, 1);
      s += pot(78.4, 56, 5.6, 4.4, 7, tone(T, 0.3), '#6B4A3A') + sprout(78.4, 45.4, 0.85);
      // un sobrecito de semillas
      s += rot(-8, 21, 56, face(rr(14, 47, 14, 12, 1), '#FFF4E2', { w: 1.2 }) + blossom(21, 52, 3, '#F2C14E', 5, '#C9823A') + flat(rr(15.4, 48.2, 11.2, 1.8, 0.4), '#E57B93'));
      return s;
    },
  },
];
// Ménsula derecha (espejada).
function mirrorBr(x, mw) {
  return part(`M${x} 44V60C${x} 61 ${x - 1} 62 ${x - 2} 62C${x - 2} 54 ${x - 6} 48 ${x - 12} 46V44Z`, mw.side, { w: 1.4 }) + dot(x - 2.4, 49, 1, mw.deep);
}

// ── Astrología ─────────────────────────────────────────────────────
const ASTRO = [
  {
    id: 'cartaAstral', name: 'Carta astral enmarcada', price: 90, w: 72, h: 84, place: 'sobre',
    draw: () => {
      const N = '#2A2E5E', mg = mat(GOLD);
      let s = surf(36, 81, 31);
      // la patita de atrás que lo sostiene
      s += tube('M44 50L56 80', 3, '#8A6A52');
      // el marco dorado con su bisel
      s += face(rr(5, 4, 62, 74, 3), GOLD, { w: 1.8 }) + face(rr(9.4, 8.4, 53.2, 65.2, 1.4), mg.side, { w: 1.3 });
      s += line('M7 6.4H64', mg.hi, 1.4, { opacity: 0.85 });
      s += face(rr(11.6, 10.6, 48.8, 60.8, 0.6), N, { w: 1.1 });
      // la rueda: anillo de los doce signos, casas y aspectos
      const cx = 36, cy = 36;
      s += part(ellD(cx, cy, 21, 21), '#343A74', { w: 1.4 });
      s += line(`${ellD(cx, cy, 21, 21)}${ellD(cx, cy, 16, 16)}`, '#E9C46A', 1.4);
      let ticks = '';
      for (let i = 0; i < 12; i++) { const a = R2(i * 30 - 75); ticks += `M${f1(cx + Math.cos(a) * 16)} ${f1(cy + Math.sin(a) * 16)}L${f1(cx + Math.cos(a) * 21)} ${f1(cy + Math.sin(a) * 21)}`; }
      s += line(ticks, '#E9C46A', 1.1);
      const sign = [];
      for (let i = 0; i < 12; i++) { const a = R2(i * 30 - 60); sign.push([cx + Math.cos(a) * 18.5, cy + Math.sin(a) * 18.5]); }
      s += dots(sign.filter((_, i) => i % 2 === 0), 1.3, '#FFB3C8') + dots(sign.filter((_, i) => i % 2 === 1), 1.3, '#A9E4F4');
      const ptA = (deg) => { const a = R2(deg); return [cx + Math.cos(a) * 14, cy + Math.sin(a) * 14]; };
      const tri = [-70, 50, 170].map(ptA), ch = [[205, 300], [20, 95]].map(([a, b]) => [ptA(a), ptA(b)]);
      s += line(`M${tri.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`, '#9ED9C0', 1.2, { opacity: 0.95 });
      s += line(ch.map(([[x1, y1], [x2, y2]]) => `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`).join(''), '#FF8FB0', 1.2, { opacity: 0.95 });
      s += dots([...tri, ...ch.flat()], 1.5, '#FFF3C4');
      s += part(ellD(cx, cy, 3.4, 3.4), '#FFD24D', { w: 1 });
      // la luna, los destellos y la plaquita con su nombre
      s += part(crescentD(18.6, 15.6, 3.4), '#FFF3C4', { w: 0.9 }) + sparkle(54, 15, 2.6, '#FFF3C4') + sparkle(16, 58, 2, '#FFFFFF') + sparkle(56, 56, 2.2, '#FFFFFF');
      s += face(rr(22, 61, 28, 6, 1), GOLD, { w: 1.1 }) + flat('M25 63.4h10v1.4H25ZM37 63.4h10v1.4H37Z', mg.deep);
      s += shine('M7.4 10L7.4 30L9 28V12Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'movilLuna', name: 'Móvil de luna', price: 75, w: 126, h: 78, place: 'sobre', hang: true,
    draw: () => {
      const S = '#B8A890', Y = '#FFE07A', L = '#FFF3C4';
      let s = '';
      // el ganchito del techo, el hilo y la varilla dorada
      s += line('M63 3.4V15', S, 1.3) + line('M60.6 3.4a2.4 2.4 0 1 1 4.8 0', BRASS, 1.6);
      s += tube('M12 19Q63 12 114 19', 2.6, BRASS) + ball(11, 19.2, 2.6, BRASS, 1.1) + ball(115, 19.2, 2.6, BRASS, 1.1);
      // los hilos con sus cuentitas
      s += line('M24 18V46M43 15.6V33M83 15.6V36M102 18V52M63 15.4V28', S, 1.2);
      s += dots([[24, 30], [43, 24], [83, 25], [102, 33]], 1.4, '#F7B6C4');
      // las estrellas regordetas y una nubecita
      s += part(puff(24, 52, 7), Y, { w: 1.4 }) + flat(puff(22.6, 50.6, 3.2), tone(Y, 0.6));
      s += part(puff(43, 38, 5.4), L, { w: 1.3 });
      s += part(puff(83, 41, 5.6), L, { w: 1.3 });
      s += part('M93 58C91 53 95 49.6 99 51C100 47 106.4 47 107.4 51.4C111.4 51 113 56.4 109.6 58.6Z', '#FFFFFF', { w: 1.4 }) + dots([[98, 55.4], [103.6, 55.4]], 0.8, INK) + blush(96, 57, 1.4) + blush(105.6, 57, 1.4);
      // la luna dormilona del medio
      const md = crescentD(63, 44, 19, 0.55, 0.82);
      s += part(md, Y, { w: 1.8 });
      s += clip(md, shade('M40 50C50 64 70 66 82 54L84 70H40Z', tone(Y, -1.4), 0.25) + dots([[52, 50, 2.2], [56, 33, 1.6], [49, 40, 1.4]], 2, tone(Y, -0.5)));
      s += sleepEye(52, 43.4, 4.4) + blush(51, 49, 2.6) + smile(55.4, 49, 3.2);
      s += gloss(53, 31, 3, 1.6, -50, 0.8);
      s += sparkle(73, 63, 2.6, '#FFFFFF') + sparkle(34, 64, 2.2, '#FFFFFF');
      return s;
    },
  },
  {
    id: 'globoCeleste', name: 'Globo celeste', price: 95, w: 62, h: 90, place: 'sobre',
    draw: () => {
      const N = '#2E3A78', mb = mat(BRASS);
      let s = surf(31, 87, 21);
      // la base y el pie de bronce
      s += cylinder(31, 87, 16, 5, '#3E3A6A', { w: 1.6 }) + line('M17 86Q31 90.6 45 86', GOLD, 1.4);
      s += part('M27 82C28 76 28.6 72 27.4 68H34.6C33.4 72 34 76 35 82Z', BRASS, { w: 1.4 }) + part(ellD(31, 72.4, 4.4, 2.6), mb.top, { w: 1.1 });
      // la esfera azul de noche
      s += part(ellD(31, 37, 24, 24), N, { w: 1.8 });
      s += clip(ellD(31, 37, 24, 24),
        line('M4 42Q31 58 58 32', '#E9C46A', 3, { opacity: 0.55 }) + line('M5 44.6Q31 60 57 34.6', '#E9C46A', 1, { opacity: 0.6 })
        + line('M14 22L21 18L28 23L25 30M38 46L45 41L50 47L46 53', '#C9D6FF', 1, { opacity: 0.8 }));
      s += roundShade(31, 37, 24, 24, N, 0.3, 0.4);
      s += dots([[14, 22], [21, 18], [28, 23], [25, 30], [38, 46], [45, 41], [50, 47], [46, 53]], 1.4, '#FFF3C4');
      s += part(crescentD(40, 22, 4.2), '#FFE07A', { w: 1 }) + sparkle(18, 44, 2.6, '#FFFFFF') + sparkle(48, 28, 2, '#FFFFFF');
      s += gloss(19, 25, 4.4, 2.4, -40, 0.6);
      // el meridiano de bronce y su perilla
      s += tube('M31 9.4A27.6 27.6 0 0 1 31 64.6', 2.8, BRASS);
      s += ball(31, 9, 2.6, BRASS, 1.1) + line('M31 64.6V68', mb.side, 2);
      return s;
    },
  },
];
// ── Fútbol ─────────────────────────────────────────────────────────
const FUTBOL = [
  {
    id: 'balon', name: 'Balón de fútbol', price: 45, w: 58, h: 56, place: 'piso',
    draw: () => {
      const K = '#2E3446', cx = 29, cy = 30, r = 22;
      let s = floorSh(29, 53, 22, 4);
      const ballD = ellD(cx, cy, r, r);
      s += part(ballD, '#FFFFFF', { w: 1.8 });
      const pent = (x, y, rr2, a0) => poly([0, 1, 2, 3, 4].map((i) => { const a = R2(a0 + i * 72); return [x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]; }));
      // los parches: el del centro y los cinco que dan la vuelta
      let outer = '', seams = '';
      const c0 = [cx + 1, cy - 1];
      for (let i = 0; i < 5; i++) {
        const a = R2(-90 + 36 + i * 72);
        const px = c0[0] + Math.cos(a) * 17, py = c0[1] + Math.sin(a) * 17;
        outer += pent(px, py, 6.4, -90 + 36 + i * 72 + 180);
        const v = R2(-90 + i * 72);
        seams += `M${f1(c0[0] + Math.cos(v) * 6.6)} ${f1(c0[1] + Math.sin(v) * 6.6)}L${f1(c0[0] + Math.cos(v) * 12.6)} ${f1(c0[1] + Math.sin(v) * 12.6)}`;
      }
      s += clip(ballD, line(seams, '#B8BCCB', 1.4) + flat(outer, K) + flat(pent(c0[0], c0[1], 6.8, -90), K)
        + shade(`M${cx + 6} ${cy - r}A${r} ${r} 0 0 1 ${cx + 2} ${cy + r}L${cx + r + 3} ${cy + r + 3}V${cy - r}Z`, '#8C92B0', 0.28));
      s += line(ballD, INK, 1.8);
      s += gloss(19, 19, 4.6, 2.6, -40, 0.85) + dot(35, 14, 1.2, '#FFFFFF', { opacity: 0.8 });
      return s;
    },
  },
  {
    id: 'copa', name: 'Copa de campeón', price: 120, w: 64, h: 90, place: 'sobre',
    draw: () => {
      const mg = mat(GOLD), Wd = '#7A4A30', mw = mat(Wd);
      let s = surf(32, 87, 23);
      // el pedestal de madera con su plaquita
      s += box(13, 86, 38, 13, 16, Wd, { r: 2 }) + grain([[17, 30, 80, 0.5], [36, 47, 83, 0.5]], Wd, 0.6);
      s += face(rr(21, 76.4, 22, 6, 1), GOLD, { w: 1.1 }) + flat('M24 78.6h16v1.4H24Z', mg.deep);
      // el pie y el tallo con su nudo
      s += cylinder(32, 69, 12, 4, GOLD, { w: 1.5 });
      s += part('M28 65C29 59 29 55 26.4 51H37.6C35 55 35 59 36 65Z', GOLD, { w: 1.5 }) + part(ellD(32, 58, 5.4, 2.8), mg.top, { w: 1.2 });
      // las asas
      s += tube('M12 21C2 20 1 34 13 39', 3, GOLD) + tube('M52 21C62 20 63 34 51 39', 3, GOLD);
      // la copa
      s += part('M10 16H54C54 36 46 50 32 52C18 50 10 36 10 16Z', GOLD, { w: 1.8 });
      s += shade('M43 17H54C54 34 47 47 36 51C44 42 46 30 43 17Z', mg.deep, 0.32);
      s += face(ellD(32, 16, 22, 5.4), mg.top, { w: 1.6 }) + flat(ellD(32, 16.6, 18, 3.6), mg.side);
      s += part(puff(32, 33, 7), '#FFF6D8', { w: 1.3 });
      s += shine('M15.6 21C16 32 19.6 41 25 46.4L23 47C17 41 13.6 32 13.4 21Z', { opacity: 0.85 }) + line('M18 21V30', '#FFFFFF', 1.2, { opacity: 0.6 });
      // la cinta con los colores del equipo
      s += bow(56.4, 26, 0.42, '#7FB8F0');
      return s;
    },
  },
  {
    id: 'camisetaMarco', name: 'Camiseta enmarcada', price: 110, w: 76, h: 88, place: 'sobre',
    draw: () => {
      const Wd = '#5A3E30', mw = mat(Wd), J = '#7FB8F0', mj = mat(J), N = '#2E3A78';
      let s = surf(38, 85, 33);
      s += tube('M46 52L58 84', 3, '#8A6A52');
      // el marco y el paspartú
      s += face(rr(5, 4, 66, 78, 3), Wd, { w: 1.8 }) + line('M7 6.4H68', mw.hi, 1.4, { opacity: 0.7 });
      s += face(rr(9.6, 8.6, 56.8, 68.8, 1), '#F4F1EA', { w: 1.2 });
      s += shade('M10 9H66.4V12H10Z', '#2A1C24', 0.12);
      // la camiseta de espaldas, con sus rayas
      const sh = 'M24 22L31 18Q38 21 45 18L52 22L61 31L55 37L52 33V71H24V33L21 37L15 31Z';
      s += part(sh, J, { w: 1.8 });
      s += clip(sh, flat('M28 18h5v54h-5ZM38 18h5v54h-5ZM48 18h5v54h-5Z', '#FFFFFF') + shade('M46 18H62V72H46Z', mj.deep, 0.16) + flat('M14 31L21 37L23 34L16 28ZM62 31L55 37L53 34L60 28Z', N));
      s += part('M31 18Q38 23 45 18L44 21Q38 25.4 32 21Z', N, { w: 1.2 });
      // el nombre y el número 10
      s += flat('M28.6 28h3v3h-3ZM32.6 28h3v3h-3ZM36.6 28h3v3h-3ZM40.6 28h3v3h-3ZM44.6 28h3v3h-3Z', N);
      s += part('M27 37L32 35H35V58H30V41L27 42Z', N, { w: 1.4 });
      s += part('M44.4 35C38.4 35 37.6 39 37.6 46.6C37.6 54 38.4 58 44.4 58C50.4 58 51.2 54 51.2 46.6C51.2 39 50.4 35 44.4 35ZM44.4 39.6C46.2 39.6 46.4 41.4 46.4 46.6C46.4 51.6 46.2 53.4 44.4 53.4C42.6 53.4 42.4 51.6 42.4 46.6C42.4 41.4 42.6 39.6 44.4 39.6Z', N, { w: 1.4, a: { 'fill-rule': 'evenodd' } });
      s += part(puff(38, 65, 3.4), '#FFD24D', { w: 1 });
      // la plaquita dorada y el brillo del vidrio
      s += face(rr(28, 73.4, 20, 3.4, 0.8), GOLD, { w: 1 });
      s += shine('M12 12L12 30L14 27.6V14Z', { opacity: 0.55 }) + shine('M60 60L64 54V58Z', { opacity: 0.4 });
      return s;
    },
  },
];

// ── Terror bonito ──────────────────────────────────────────────────
const TERROR = [
  {
    id: 'pociones', name: 'Pociones', price: 70, w: 78, h: 74, place: 'sobre',
    draw: () => {
      const GL = mix('#9CC6DA', INK, 0.3), CK = '#C99A6A';
      let s = glow(39, 48, 36, 22, '#E4C8FF', 0.25) + surf(39, 71, 35);
      // la botella alta del medio, verde, con su calaverita
      const tall = 'M33 66V30C33 25 35 23 37 22V14H45V22C47 23 49 25 49 30V66Q41 69 33 66Z';
      s += shade(tall, '#E8F4FF', 0.45);
      s += clip(tall, flat('M30 36H52V70H30Z', '#8EE07A') + flat(ellD(41, 36, 9, 2.2), '#C2F2B0') + dots([[38, 52], [44, 46], [40, 60], [45, 57]], 1.4, '#D6FAC8'));
      s += line(tall, GL, 1.8);
      s += face(rr(35.4, 42, 11.2, 13, 2), '#FFF6E8', { w: 1.1 }) + part('M37.8 47.6C37.8 44.6 44.2 44.6 44.2 47.6C44.2 49 43.4 49.6 43 50V51.4H39V50C38.6 49.6 37.8 49 37.8 47.6Z', '#FFFFFF', { w: 1 }) + dots([[39.6, 47.6], [42.4, 47.6]], 0.9, INK);
      s += face(rr(36, 9.6, 10, 6, 2), CK, { w: 1.3 }) + part('M35.4 14H46.6L46 17C45 19 43.6 17 43 19C42 21 40.6 18 39.6 19.4C38.6 20.4 37 17.6 35.8 17Z', '#8E6FE0', { w: 1.1 });
      s += shine('M35.4 30V60H37.4V30Z', { opacity: 0.7 });
      // el matraz redondo, rosa, con un corazón
      const fl = 'M17 34V40C9.6 42 6 48 6 54C6 62 12 68 21 68C30 68 36 62 36 54C36 48 32.4 42 25 40V34Z';
      s += shade(fl, '#E8F4FF', 0.45);
      s += clip(fl, flat('M4 50H38V70H4Z', '#FF7FB8') + flat(ellD(21, 50, 14.6, 2.6), '#FFB3D6') + dots([[14, 57], [26, 61], [20, 64]], 1.6, '#FFD3E6'));
      s += line(fl, GL, 1.8);
      s += part(heart(21, 58, 5), '#FFFFFF', { w: 1 }) + flat(heart(21, 58.6, 2.6), '#FF6F91');
      s += face(rr(15.4, 28.4, 11.2, 7, 2), CK, { w: 1.3 }) + line('M16.6 31.6h8.8', tone(CK, -0.8), 1);
      s += shine('M9.6 50C10 46 12.6 43.6 15.4 42.6L16 44.4C13.6 45.4 11.8 47.4 11.4 50.6Z', { opacity: 0.8 });
      // el frasquito cuadrado, lila, con su moño
      const sq = 'M54 44V40H64V44C68 44 70 46 70 50V64C70 67 68 68 66 68H52C50 68 48 67 48 64V50C48 46 50 44 54 44Z';
      s += shade(sq, '#E8F4FF', 0.45);
      s += clip(sq, flat('M46 52H72V70H46Z', '#B58CF0') + flat(rr(48, 51, 22, 2.4, 0), '#D7C0FA') + dots([[54, 60], [62, 57], [58, 64]], 1.3, '#E4D6FF'));
      s += line(sq, GL, 1.8);
      s += part(puff(59, 59.6, 4.4), '#FFE07A', { w: 1 });
      s += face(rr(53.4, 35, 11.2, 6, 2), CK, { w: 1.3 }) + bow(59, 43, 0.4, '#FF8FB0');
      s += shine('M51 50V63H52.8V50Z', { opacity: 0.7 });
      return s;
    },
  },
  {
    id: 'ataud', name: 'Ataúd con murcielaguito', price: 110, w: 80, h: 126, place: 'piso',
    draw: () => {
      const Wd = '#5E3A62', mw = mat(Wd), SAT = '#FFC9DA', ms = mat(SAT), BT = '#3A3044';
      let s = floorSh(38, 123, 34, 6);
      // la tapa, apoyada atrás a la derecha, con su ventanita de corazón
      const lid = poly([[50, 20], [70, 20], [78, 44], [72, 120], [52, 120], [44, 44]]);
      s += rot(7, 62, 120, face(lid, tone(Wd, -0.3), { w: 1.8 }) + line('M52 26H68', mw.hi, 1.2, { opacity: 0.6 }) + part(heart(63, 52, 5.4), '#FF8FB0', { w: 1.2 }) + dots([[52, 30], [68, 30], [56, 112], [68, 112]], 1.2, GOLD));
      // el ataúd parado: canto de arriba, marco de madera y el forro acolchado
      const out = [[24, 14], [52, 14], [62, 42], [54, 120], [22, 120], [14, 42]];
      const inn = [[27.4, 19], [48.6, 19], [56.6, 42.6], [49.6, 115], [26.4, 115], [19.4, 42.6]];
      s += face(rrTop(24, 9.4, 28, 5.2, 1.6), mw.top, { w: 1.4 });
      s += face(poly(out), Wd, { w: 1.9 });
      s += shade(poly([[52, 14], [62, 42], [54, 120], [49.6, 115], [56.6, 42.6], [48.6, 19]]), mw.deep, 0.3);
      const innD = poly(inn);
      s += flat(innD, SAT);
      let q = '';
      for (let k = -100; k < 120; k += 9) q += `M${k} 10L${k + 110} 120M${k + 110} 10L${k} 120`;
      s += clip(innD, line(q, ms.side, 1.1, { opacity: 0.55 }) + dots([[30, 46], [39, 37], [48, 46], [30, 64], [39, 55], [48, 64], [39, 73], [30, 82], [48, 82], [39, 91], [33, 100], [45, 100]], 1, '#FFFFFF')
        + shade('M20 15H58V34H20Z', ms.deep, 0.3) + shade('M44 15H60V118H46Z', ms.deep, 0.18));
      // el murcielaguito durmiendo de cabeza, colgado de su barrita
      s += line('M26 28H50', BRASS, 2.2) + dots([[34.6, 29.4], [41.4, 29.4]], 1.3, BT);
      s += part('M38 30C31 30 27 36 27.4 44C27.8 51 31 56 38 56C45 56 48.2 51 48.6 44C49 36 45 30 38 30Z', BT, { w: 1.6 });
      s += part('M27.6 40C24 44 24.6 52 28 56C30 52 31 47 31 42ZM48.4 40C52 44 51.4 52 48 56C46 52 45 47 45 42Z', '#4E4460', { w: 1.3 });
      s += line('M32 33Q38 36 44 33', '#6A6080', 1.2, { opacity: 0.8 });
      s += part(ellD(38, 58, 8.4, 7.4), BT, { w: 1.6 }) + part('M31.6 61L30 68L34.6 63.6ZM44.4 61L46 68L41.4 63.6Z', BT, { w: 1.2 });
      s += flat('M31.4 62L30.8 65.6L33 63.4ZM44.6 62L45.2 65.6L43 63.4Z', '#FF9EC4');
      s += line('M33.4 57.4Q35 56 36.6 57.4M39.4 57.4Q41 56 42.6 57.4', '#FFFFFF', 1.3) + blush(32.6, 55, 1.6, '#FF8FB0') + blush(43.4, 55, 1.6, '#FF8FB0');
      s += flat('M37 52.6l1 1.2l1 -1.2Z', '#FFFFFF');
      // la almohadita del fondo con estrellitas y los clavitos del marco
      s += part('M25 108C25 100 51 100 51 108C51 113 25 113 25 108Z', '#C9A6FF', { w: 1.3 }) + part(puff(32, 106, 2.4), '#FFE07A', { w: 0.9 }) + part(puff(43, 106.6, 2.2), '#FFE07A', { w: 0.9 });
      s += dots([[24.6, 17], [51.4, 17], [17.6, 42], [58.4, 42], [24.4, 117.6], [51.6, 117.6]], 1.3, GOLD);
      s += line('M16.4 40L25.6 16.4', mw.hi, 1.3, { opacity: 0.6 });
      s += line('M60 4h5l-5 5h5M68 0.6h3.4L68 4h3.4', '#8A80B0', 1.4);
      return s;
    },
  },
  {
    id: 'plantaCarnivora', name: 'Planta carnívora', price: 65, w: 64, h: 82, place: 'sobre',
    draw: () => {
      const G = '#7FBF6A', mg = mat(G), IN = '#FF7F9E', PT = '#4A3A6A', mp = mat(PT);
      let s = surf(32, 79.4, 20);
      // una trampa: dos lóbulos abiertos con sus dientitos
      const trap = (x, y, k, a, open = 1, eyes = false) => {
        const P = (dx, dy) => `${f1(dx * k)} ${f1(dy * k)}`;
        let o = '';
        const up = `M${P(-10, 0)}C${P(-11, -9 * open)} ${P(11, -9 * open)} ${P(10, 0)}Z`;
        const dn = `M${P(-10, 0)}C${P(-11, 8)} ${P(11, 8)} ${P(10, 0)}Z`;
        o += part(dn, G, { w: 1.3 }) + flat(`M${P(-8, 0.6)}C${P(-8.6, 5.4)} ${P(8.6, 5.4)} ${P(8, 0.6)}Z`, IN);
        o += part(up, G, { w: 1.3 }) + flat(`M${P(-8, -0.6)}C${P(-8.6, -6.4 * open)} ${P(8.6, -6.4 * open)} ${P(8, -0.6)}Z`, tone(IN, -0.3));
        let t = '';
        for (let i = -3; i <= 3; i++) t += `M${P(i * 2.4 - 1, -0.4)}L${P(i * 2.4, 1.6)}L${P(i * 2.4 + 1, -0.4)}Z`;
        o += flat(t, '#FFFFFF');
        let c = '';
        for (let i = 0; i <= 6; i++) { const u = -1 + i / 3; const bx = u * 10.4, by = -Math.sqrt(Math.max(0, 1 - u * u)) * 6.8 * open; c += `M${P(bx, by)}L${P(bx * 1.15, by - 3.4)}`; }
        o += line(c, mg.side, 1.4);
        if (eyes) o += eye(-3.6 * k, -4.6 * k * open, 1.5 * k) + eye(3.6 * k, -4.6 * k * open, 1.5 * k);
        return at(x, y, a, 1, o);
      };
      // los tallos y las hojitas de la base
      s += line('M30 58C26 46 18 40 14 32M32 58C32 44 33 30 32 22M34 58C40 48 48 44 52 40', '#5E9C6A', 2.4);
      s += trap(14, 30, 0.85, -24, 0.9);
      s += trap(52, 38, 0.8, 26, 0.4);
      s += trap(32, 20, 1.15, 0, 1, true);
      s += spoon(28, 58, 11, -160, 3.6, '#86C49A') + spoon(36, 58, 11, -20, 3.6, '#86C49A') + spoon(32, 58.4, 9, -100, 3.2, '#96CFAF');
      // la maceta lila oscura con su telaraña pintada
      s += pot(32, 78, 16, 12, 18, PT, '#3A2A2E');
      s += line('M24 64L26 75M24 64L33 67M24 64L19 70M21.6 66.4Q24.6 69 27 66.2M20 69Q25 73 29.6 70', '#FFFFFF', 1.1, { opacity: 0.85 });
      s += part(heart(40, 69, 3.2), '#FF8FB0', { w: 1 });
      s += shade('M41 61L39 77L44 76L47 61Z', mp.deep, 0.2);
      return s;
    },
  },
];

const tag = (pack, list) => list.map((d) => ({ ...d, pack, season: 'pack', vibes: ['pack'] }));

// Lo crudo (como DECOR_VIBES): decor.js lo suma a DECOR_DEFS con una línea.
export const DECOR_PACKS = [
  ...tag('anime', ANIME), ...tag('kpop', KPOP), ...tag('gatitos', GATITOS), ...tag('cafe', CAFE),
  ...tag('plantas', PLANTAS), ...tag('astrologia', ASTRO), ...tag('futbol', FUTBOL), ...tag('terror', TERROR),
];

// Igual que en decor.js (alto con su margen de abajo y svg listo), para
// quien los use sin pasar por DECOR_DEFS (el laboratorio, el rincón).
export const PACK_DECOR_DEFS = DECOR_PACKS.map((d) => ({
  ...d,
  paintable: false,
  h: d.h + FOOT,
  foot: FOOT,
  svg: () => piece(d.w, d.h + FOOT, d.draw()),
}));
export const findPackDecor = (id) => PACK_DECOR_DEFS.find((d) => d.id === id) || null;
