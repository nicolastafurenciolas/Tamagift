import React from 'react';
import Sprite from './Sprite';
import { ROOM } from '../gameState';
import { findFurniture } from '../roomCatalog';
import { findDecor } from '../shopCatalog';
import { switchSvg } from '../art/room/world';
import { useStyle } from '../styles/StyleContext';

// ─────────────────────────────────────────────────────────────────
// Lo que el mundo le hace al cuarto: la luz según la hora, las lámparas
// que alumbran de noche, la lluvia o la nieve en las ventanas y el
// interruptor de la luz. Todo en coordenadas del mundo (1600 × 430).
//
// La luz no es un velo gris encima: el cuarto se "tiñe" multiplicando
// por el color de la hora (crema por la mañana, durazno y rosa al
// atardecer, ámbar con la luz prendida de noche, azul de luna con la luz
// apagada), y la luz que entra por las ventanas (rayos de sol o de luna
// con su charco en el piso) y la de las lámparas se SUMA encima (modo
// pantalla), así se ve cálida y viva. En pixel los degradados van en
// bandas duras, como se pinta a mano.
// ─────────────────────────────────────────────────────────────────

// Lo que da luz (id → cuánto alumbra, en múltiplos de su ancho).
const LIGHTS = {
  mueble: { lampara: 2.4, lamparaArco: 2.2, guirnalda: 1.2, letrero: 1.4, tiraLed: 0.8, tocadorLuces: 1.3, arcade: 1.3, setupGamer: 1.1, lavalamp: 1.6 },
  decor: {
    lampara: 2.6, velas: 2.4, lavalamp: 2.4, velaMono: 2.4, candelabro: 2.2, lamparaHongo: 2.6, lamparaConejo: 2.6, proyector: 2.8, lunaLampara: 2.6, lamparaBanquero: 2.4, polaroids: 1.4, bolaCristal: 1.8,
    // de temporada
    calabazaTallada: 2.2, farolito: 2.6, caldero: 1.6, arbolNavidad: 1.4, lucesNavidad: 1.1,
  },
};

// Rectángulo del vidrio de cada ventana, en su dibujo (para la lluvia).
const GLASS = {
  ventana: { x: 24, y: 24, w: 116, h: 102, vw: 164 },
  ventanaRedonda: { x: 16, y: 14, w: 92, h: 92, vw: 124, round: true },
};

function placedBox(it) {
  const f = it.kind === 'mueble' ? findFurniture(it.refId) : null;
  const d = it.kind === 'decor' ? findDecor(it.refId) : null;
  const w = f ? f.w : d ? Math.round(d.w * 1.25) : 100;
  const h = f ? f.h : d ? Math.round(d.h * 1.25) : 100;
  const foot = f ? f.foot : d ? d.foot * 1.25 : 0;
  const s = it.scale || 1;
  return { left: it.x - (w * s) / 2, top: it.y - (h - foot) * s, w: w * s, h: h * s };
}

// El vidrio de una ventana puesta, en coordenadas del mundo.
function glassOf(it) {
  const g = GLASS[it.refId];
  const b = placedBox(it);
  const k = b.w / g.vw;
  return { x: b.left + g.x * k, y: b.top + g.y * k, w: g.w * k, h: g.h * k, round: !!g.round };
}

// El clima del día lo sabe WeatherOnWindows (se dibuja antes, en el mismo
// cuarto); la luz lo necesita para saber si entran rayos de sol.
let skyNow = 'sol';

// ── Cómo se ve cada momento ──────────────────────────────────────
// grade: [arriba, abajo] multiplicado sobre el cuarto (null = tal cual).
// beam: color del rayo que entra por la ventana; beamA, su fuerza;
// lean: hacia dónde cae (+ derecha por la mañana, − izquierda al
// atardecer). glow: cuánto se encienden lámparas y velas.
const LOOK = {
  manana: { grade: ['#FFEAD0', '#FFF5E8'], beam: [255, 226, 168], beamA: 0.24, lean: 1, glow: 0, pool: 0.2 },
  dia: { grade: null, beam: [255, 247, 220], beamA: 0.16, lean: 0.35, glow: 0, pool: 0.14 },
  tarde: { grade: ['#FFC8A4', '#F2BCC8'], beam: [255, 168, 108], beamA: 0.3, lean: -1.25, glow: 0.6, pool: 0.26 },
  noche: { grade: ['#E4C8AE', '#D2B8B0'], beam: null, glow: 0.8 },
};
const LOOK_OFF = {
  // de noche con la luz apagada: azul de luna, rayo de luna por la ventana
  noche: { grade: ['#6E74C0', '#4A4E92'], beam: [176, 198, 255], beamA: 0.2, lean: 0.55, glow: 1, pool: 0.2 },
  tarde: { grade: ['#A08CBA', '#7A6EA0'], beam: [255, 160, 104], beamA: 0.26, lean: -1.25, glow: 1, pool: 0.24 },
  // de día con la luz apagada: penumbra, y la ventana alumbra
  dia: { grade: ['#B4B8D2', '#9EA2C0'], beam: [255, 246, 214], beamA: 0.26, lean: 0.35, glow: 1, pool: 0.24 },
  manana: { grade: ['#C0B6CA', '#A69EBC'], beam: [255, 226, 168], beamA: 0.28, lean: 1, glow: 1, pool: 0.24 },
};
// El clima apaga o enfría los rayos.
const WEATHER_BEAM = { sol: 1, nieve: 0.55, nublado: 0.3, lluvia: 0 };
const COOL = { nublado: '#E8EAF2', lluvia: '#D8DCEA', nieve: '#EEF2FB' };
// Color de la luz de las lámparas (en el mapa de luz y en el brillo).
const LAMP_MAP = [255, 232, 196];
const LAMP_BLOOM = [255, 206, 140];

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
function mixHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
// Degradado vertical: suave en los estilos vectoriales, en bandas en pixel.
function vgrad(top, bot, pixel) {
  if (!pixel) return `linear-gradient(to bottom, ${top}, ${bot})`;
  return `linear-gradient(to bottom, ${top} 0 34%, ${mixHex(top, bot, 0.5)} 34% 67%, ${bot} 67% 100%)`;
}
// Charco de luz redondo centrado en (x, y) de radio r (dentro de una capa
// que cubre todo el cuarto). En pixel, anillos escalonados.
function pool(x, y, r, c, a, pixel) {
  const at = `circle ${Math.round(r)}px at ${Math.round(x)}px ${Math.round(y)}px`;
  if (pixel) return `radial-gradient(${at}, ${rgba(c, a)} 0 30%, ${rgba(c, a * 0.68)} 30% 54%, ${rgba(c, a * 0.36)} 54% 78%, ${rgba(c, a * 0.14)} 78% 100%, transparent 100%)`;
  return `radial-gradient(${at}, ${rgba(c, a)} 0%, ${rgba(c, a * 0.6)} 35%, ${rgba(c, a * 0.22)} 68%, transparent 100%)`;
}
// Halo en su propia caja (el brillo de una lámpara o de un vidrio).
function halo(c, a, pixel) {
  if (pixel) return `radial-gradient(circle closest-side, ${rgba(c, a)} 0 34%, ${rgba(c, a * 0.5)} 34% 66%, ${rgba(c, a * 0.18)} 66% 100%, transparent 100%)`;
  return `radial-gradient(circle closest-side, ${rgba(c, a)} 0%, ${rgba(c, a * 0.45)} 40%, transparent 100%)`;
}
const FULL = { position: 'absolute', inset: 0, pointerEvents: 'none' };

// Rayo de una ventana: un haz tenue que baja del vidrio hasta el piso y
// su charco de luz (con la cruz del marco, o redondo si la ventana lo es).
function WindowBeam({ gl, look, k, pixel }) {
  const c = look.beam;
  const a = look.beamA * k;
  if (a < 0.02) return null;
  const floorY = ROOM.H - 6;
  const dx = look.lean * 92;
  // caja que contiene el haz (en coordenadas del mundo)
  const x0 = Math.min(gl.x, gl.x + dx) - 30, x1 = Math.max(gl.x + gl.w, gl.x + gl.w + dx) + gl.w * 0.3 + 30;
  const y0 = gl.y + gl.h * 0.12, H = floorY - y0, W = x1 - x0;
  const P = (x, y) => `${(x - x0).toFixed(1)}px ${(y - y0).toFixed(1)}px`;
  const shaft = `polygon(${P(gl.x + gl.w * 0.06, y0)}, ${P(gl.x + gl.w * 0.94, y0)}, ${P(gl.x + gl.w + dx + gl.w * 0.22, floorY)}, ${P(gl.x + dx - gl.w * 0.04, floorY)})`;
  // el haz se desvanece al bajar (en pixel, en tres bandas)
  const shaftBg = pixel
    ? `linear-gradient(to bottom, ${rgba(c, a)} 0 28%, ${rgba(c, a * 0.62)} 28% 60%, ${rgba(c, a * 0.32)} 60% 100%)`
    : `linear-gradient(to bottom, ${rgba(c, a)}, ${rgba(c, a * 0.25)})`;
  // charco en el piso: la forma del vidrio "acostada" (alto × 0.5)
  const py0 = ROOM.FLOOR_Y + 24, py1 = ROOM.H - 12;
  const px0 = gl.x + dx * 0.62, pw = gl.w * 1.1;
  const pa = look.pool * k;
  // la cruz del marco hace sombra en el charco
  const cross = 'linear-gradient(to right, #000 0 46%, transparent 46% 54%, #000 54% 100%), linear-gradient(to bottom, #000 0 44%, transparent 44% 54%, #000 54% 100%)';
  return (
    <>
      <div style={{ position: 'absolute', left: x0, top: y0, width: W, height: H, pointerEvents: 'none', clipPath: shaft, background: shaftBg, mixBlendMode: 'screen' }} />
      {/* brillo del vidrio sobre la pared, alrededor de la ventana */}
      <div style={{ position: 'absolute', left: gl.x - gl.w * 0.35, top: gl.y - gl.h * 0.3, width: gl.w * 1.7, height: gl.h * 1.6, pointerEvents: 'none', background: halo(c, a * 0.6, pixel), mixBlendMode: 'screen' }} />
      {gl.round ? (
        <div className="pg-keep-round" style={{ position: 'absolute', left: px0, top: py0, width: pw, height: py1 - py0, pointerEvents: 'none', borderRadius: '50%', background: rgba(c, pa), mixBlendMode: 'screen' }} />
      ) : (
        <div
          style={{
            position: 'absolute', left: px0, top: py0, width: pw, height: py1 - py0, pointerEvents: 'none', mixBlendMode: 'screen',
            clipPath: `polygon(${dx > 0 ? '0% 0%, 88% 0%, 100% 100%, 12% 100%' : '12% 0%, 100% 0%, 88% 100%, 0% 100%'})`,
            background: rgba(c, pa),
            WebkitMaskImage: cross, WebkitMaskComposite: 'source-in', maskImage: cross, maskComposite: 'intersect',
          }}
        />
      )}
    </>
  );
}

export function NightLayer({ phase, lightsOff, placed, styleId }) {
  const pixel = styleId === 'pixel';
  // lo-fi y neón ya son de noche: ahí la luz de la hora pesa la mitad
  const soft = styleId === 'lofi' || styleId === 'neon' ? 0.5 : 1;
  const look = (lightsOff ? LOOK_OFF[phase] : LOOK[phase]) || LOOK.dia;
  const weather = skyNow;
  const wk = WEATHER_BEAM[weather] ?? 1;
  const night = phase === 'noche';
  // de noche (luz de luna) la nube o la lluvia la tapan del todo
  const beamK = look.beam ? (night ? (weather === 'sol' ? 1 : 0) : wk) * (soft < 1 ? 0.7 : 1) : 0;
  const windows = beamK > 0 ? placed.filter((it) => it.kind === 'mueble' && GLASS[it.refId]) : [];
  const glowK = look.glow;
  const lamps = glowK > 0 ? placed.flatMap((it) => {
    const k = (LIGHTS[it.kind] || {})[it.refId];
    if (!k) return [];
    const b = placedBox(it);
    const r = Math.max(84, b.w * k * 0.5);
    return [{ key: it.key, cx: b.left + b.w / 2, cy: b.top + b.h * 0.32, r }];
  }) : [];
  // Mapa de luz: el tinte de la hora, y donde hay una lámpara la luz le
  // "abre" un charco cálido (casi blanco: ahí se ven los colores de
  // verdad). Va todo en la capa que se multiplica.
  const mapA = (lightsOff ? 1 : night ? 0.75 : 0.55) * glowK;
  const map = look.grade
    ? [...lamps.map((l) => pool(l.cx, l.cy, l.r, LAMP_MAP, mapA, pixel)), vgrad(look.grade[0], look.grade[1], pixel)].join(', ')
    : null;
  const bloomA = (lightsOff ? 0.32 : night ? 0.2 : 0.16) * glowK;
  const cool = !lightsOff && !night && COOL[weather];
  return (
    <>
      {map && <div style={{ ...FULL, background: map, mixBlendMode: 'multiply', opacity: soft, transition: 'opacity 0.6s' }} />}
      {/* día nublado o de lluvia: el cuarto un poco más frío */}
      {cool && <div style={{ ...FULL, background: cool, mixBlendMode: 'multiply', opacity: soft }} />}
      {windows.map((it) => <WindowBeam key={it.key} gl={glassOf(it)} look={look} k={beamK} pixel={pixel} />)}
      {/* el resplandor junto a cada bombilla o llama */}
      {lamps.map((l) => (
        <div key={l.key} style={{ position: 'absolute', left: l.cx - l.r * 0.42, top: l.cy - l.r * 0.42, width: l.r * 0.84, height: l.r * 0.84, pointerEvents: 'none', background: halo(LAMP_BLOOM, bloomA, pixel), mixBlendMode: 'screen' }} />
      ))}
    </>
  );
}

// Patrones del clima para el vidrio. En pixel, gotas y copos son
// cuadraditos y escalones (un SVG con píxeles); en los demás, trazos y
// copos redondos.
const svgUrl = (inner, w, h) => `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${inner}</svg>`)}")`;
const RAIN_PX = svgUrl("<rect x='14' y='0' width='2' height='4' fill='#E6F0FF' fill-opacity='0.85'/><rect x='12' y='4' width='2' height='4' fill='#E6F0FF' fill-opacity='0.85'/><rect x='4' y='16' width='2' height='4' fill='#E6F0FF' fill-opacity='0.7'/><rect x='2' y='20' width='2' height='4' fill='#E6F0FF' fill-opacity='0.7'/>", 22, 30);
const SNOW_PX = svgUrl("<rect x='4' y='4' width='4' height='4' fill='#FFFFFF'/><rect x='17' y='15' width='2' height='2' fill='#FFFFFF'/><rect x='12' y='24' width='2' height='2' fill='#FFFFFF' fill-opacity='0.8'/>", 26, 30);
const cloudD = 'M8 34C2 34 2 26 8 25C8 18 16 15 21 19C24 11 36 11 39 19C44 15 52 18 51 25C57 25 57 34 51 34Z';
const CLOUDS = svgUrl(`<path d='${cloudD}' fill='#EEF1F8'/><path d='M6 34H53V30H6Z' fill='#C9CFDF'/><g transform='translate(52 22) scale(0.7)'><path d='${cloudD}' fill='#E2E6F0'/><path d='M6 34H53V30H6Z' fill='#BCC3D6'/></g>`, 100, 60).replace("shape-rendering%3D'crispEdges'", '');
const CLOUDS_PX = svgUrl(`<path d='${cloudD}' fill='#EEF1F8'/><path d='M6 34H53V30H6Z' fill='#C9CFDF'/><g transform='translate(52 22) scale(0.7)'><path d='${cloudD}' fill='#E2E6F0'/><path d='M6 34H53V30H6Z' fill='#BCC3D6'/></g>`, 100, 60);
const DROPS = svgUrl("<circle cx='6' cy='8' r='2' fill='#FFFFFF' fill-opacity='0.55'/><circle cx='22' cy='20' r='1.6' fill='#FFFFFF' fill-opacity='0.5'/><circle cx='14' cy='30' r='2.4' fill='#FFFFFF' fill-opacity='0.45'/><circle cx='28' cy='6' r='1.2' fill='#FFFFFF' fill-opacity='0.5'/>", 34, 36);
const DROPS_PX = svgUrl("<rect x='5' y='7' width='3' height='3' fill='#FFFFFF' fill-opacity='0.55'/><rect x='21' y='19' width='2' height='3' fill='#FFFFFF' fill-opacity='0.5'/><rect x='13' y='29' width='3' height='4' fill='#FFFFFF' fill-opacity='0.45'/>", 34, 36);

export function WeatherOnWindows({ weather, placed }) {
  const { style: st } = useStyle();
  skyNow = weather || 'sol';
  if (weather === 'sol') return null;
  const pixel = st.art.kind === 'pixel';
  return placed.filter((it) => it.kind === 'mueble' && GLASS[it.refId]).map((it) => {
    const gl = glassOf(it);
    const style = {
      position: 'absolute', left: gl.x, top: gl.y, width: gl.w, height: gl.h,
      overflow: 'hidden', pointerEvents: 'none', borderRadius: gl.round ? '50%' : 2,
    };
    if (weather === 'nublado') {
      // cielo tapado: gris azulado y nubes gordas que pasan despacio (un
      // dibujo con su panza en sombra; en pixel, en escalones)
      return (
        <div key={it.key} className={gl.round ? 'pg-keep-round' : undefined} style={{ ...style, background: 'linear-gradient(to bottom, rgba(146,154,182,0.62), rgba(192,198,218,0.5))' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: pixel ? CLOUDS_PX : CLOUDS, backgroundSize: `${Math.round(gl.w * 1.4)}px ${Math.round(gl.h)}px`, backgroundRepeat: 'repeat-x', imageRendering: pixel ? 'pixelated' : undefined, animation: 'tg-cloud-pass 40s linear infinite' }} />
          <style>{`@keyframes tg-cloud-pass { from { background-position: 0 0; } to { background-position: ${Math.round(gl.w * 1.4)}px 0; } }`}</style>
        </div>
      );
    }
    const rain = weather === 'lluvia';
    return (
      <div key={it.key} className={gl.round ? 'pg-keep-round' : undefined} style={{ ...style, background: rain ? 'linear-gradient(to bottom, rgba(96,108,146,0.5), rgba(128,140,176,0.35))' : 'linear-gradient(to bottom, rgba(206,218,240,0.28), rgba(236,242,252,0.18))' }}>
        <div
          className={rain ? 'pg-rain' : 'pg-snow'}
          style={{
            position: 'absolute', inset: '-50% -10% 0 -10%',
            backgroundImage: rain
              ? (pixel ? RAIN_PX : 'repeating-linear-gradient(105deg, rgba(220,235,255,0) 0 9px, rgba(220,235,255,0.75) 9px 10.5px)')
              : (pixel ? SNOW_PX : 'radial-gradient(circle, #FFFFFF 0 2.2px, transparent 2.6px), radial-gradient(circle, #FFFFFF 0 1.6px, transparent 2px)'),
            backgroundSize: rain ? (pixel ? '22px 30px' : '22px 30px') : (pixel ? '26px 30px' : '26px 26px, 17px 17px'),
            backgroundPosition: rain || pixel ? '0 0' : '0 0, 9px 11px',
            imageRendering: pixel ? 'pixelated' : undefined,
          }}
        />
        {/* gotas pegadas al vidrio / nieve juntada en el marco de abajo */}
        {rain ? (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: pixel ? DROPS_PX : DROPS, backgroundSize: '34px 36px', imageRendering: pixel ? 'pixelated' : undefined }} />
        ) : !gl.round && (
          <div style={{ position: 'absolute', left: -2, right: -2, bottom: 0, height: Math.max(7, gl.h * 0.1), background: pixel ? 'linear-gradient(to bottom, #FFFFFF 0 70%, #CFDDF2 70% 100%)' : 'linear-gradient(to bottom, #FFFFFF 60%, #D6E2F4)', borderRadius: pixel ? 0 : '8px 10px 0 0' }} />
        )}
      </div>
    );
  });
}

export function LightSwitch({ x, y, lightsOff, onToggle, pixel }) {
  return (
    <button
      data-tap onClick={onToggle} aria-label={lightsOff ? 'Prender la luz' : 'Apagar la luz'}
      style={{ position: 'absolute', left: x, top: y, width: 30, height: 42, padding: 0, border: 'none', background: 'none', cursor: 'pointer', zIndex: 3 }}
    >
      <Sprite markup={switchSvg(!lightsOff)} cacheKey={`switch-${lightsOff ? 'off' : 'on'}`} w={30} h={42} pixel={pixel} />
    </button>
  );
}

// Zzz sobre la mascota dormida.
export function Zzz() {
  return (
    <div style={{ position: 'absolute', right: 24, top: -6, pointerEvents: 'none' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="pg-zzz" style={{ position: 'absolute', left: i * 14, top: -i * 16, fontFamily: 'inherit', fontWeight: 900, fontSize: 18 + i * 5, color: '#FFFFFF', textShadow: '0 1px 0 #3A2A3E, 1px 0 0 #3A2A3E, -1px 0 0 #3A2A3E, 0 -1px 0 #3A2A3E', animationDelay: `${i * 0.5}s` }}>z</span>
      ))}
    </div>
  );
}

// Sucia: manchitas y dos moscas que dan vueltas (se quitan bañándola).
export function Dirt({ level }) {
  if (level > 30) return null;
  const heavy = level < 15;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[[34, 62, 9], [62, 70, 7], [48, 80, 6], ...(heavy ? [[70, 56, 8], [40, 50, 6]] : [])].map(([x, y, r], i) => (
        <span key={i} className="pg-keep-round" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: r, height: r * 0.8, borderRadius: '50%', background: 'rgba(120,86,60,0.45)' }} />
      ))}
      {[0, 1].map((i) => (
        <span key={`f${i}`} className="pg-fly pg-keep-round" style={{ position: 'absolute', left: '50%', top: '18%', width: 6, height: 6, borderRadius: '50%', background: '#3A3044', animationDelay: `${i * 0.7}s`, boxShadow: '0 0 0 2px rgba(255,255,255,0.6)' }} />
      ))}
    </div>
  );
}
