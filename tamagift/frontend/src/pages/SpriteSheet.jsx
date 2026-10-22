import React from 'react';
import Sprite from '../components/Sprite';
import { PetRecipeMarkup, DEFAULT_RECIPE } from '../PetRecipe';
import {
  SHAPES as BODIES, EARS, EYES, MOUTHS, CHEEKS as CHEEK_STYLES, TAILS, PATTERNS,
  HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES, MOODS as ALL_MOODS,
} from '../art/mochi';
import { PET_STYLES } from '../petStyles';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS, findPaint, findFurniture, findWall, findFloor } from '../roomCatalog';
import { DECOR_CATALOG } from '../shopCatalog';
import { Car, Candy, SimonPad, SIMON_PADS, Pipe } from '../gameArt';
import { FOOD_SPRITES, UI_SPRITES } from '../sprites';
import { getStyle } from '../styles/registry';
import { ROOM } from '../gameState';

// ─────────────────────────────────────────────────────────────────
// Hoja de sprites (solo desarrollo): /hoja?estilo=pixel
// TODO el arte del juego en un estilo: mascotas, cada pieza de
// personalización, cuartos, muebles, paredes, pisos, decoración,
// comida, juegos e interfaz.
// ─────────────────────────────────────────────────────────────────

const petArt = (recipe, mood = 'normal') => (
  <svg viewBox="0 0 200 200" width="200" height="200"><PetRecipeMarkup recipe={recipe} mood={mood} /></svg>
);
const surfaceArt = (st, w, h) => (
  <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}><rect width={w} height={h} fill={st.base} />{st.render && st.render(w, h)}</svg>
);
const BASE_PET = { ...DEFAULT_RECIPE, ...PET_STYLES[0].recipe };

function Section({ s, title, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h3 style={{ fontFamily: s.fonts.display, fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: s.ui.ink, borderBottom: `2px solid ${s.ui.line}`, paddingBottom: 4 }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>{children}</div>
    </section>
  );
}

function Cell({ s, label, children, w }) {
  return (
    <div style={{ width: w, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>{children}</div>
      {label && <div style={{ fontFamily: s.fonts.body, fontSize: 10.5, color: s.ui.inkSoft, marginTop: 3, lineHeight: 1.1 }}>{label}</div>}
    </div>
  );
}

function PartRow({ s, list, field, extra = {}, size = 76 }) {
  return list.map((o) => (
    <Cell key={o.id} s={s} label={o.label || o.id} w={size + 6}>
      <Sprite styleId={s.id} art={petArt({ ...BASE_PET, ...extra, [field]: o.id })} cacheKey={`hoja-${field}-${o.id}`} w={size} h={size} kind="pet" />
    </Cell>
  ));
}

// Un pedazo del cuarto, armado con los mismos sprites que usa el juego.
function RoomScene({ s, wallId, floorId, items, label }) {
  const zoom = 0.48;
  const worldW = 900;
  const pixel = s.art.kind === 'pixel' ? s.art.pixel / zoom : undefined;
  const wall = findWall(wallId), floor = findFloor(floorId);
  return (
    <Cell s={s} label={label} w={worldW * zoom}>
      <div style={{ width: worldW * zoom, height: ROOM.H * zoom, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: worldW, height: ROOM.H, transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
          <div style={{ position: 'absolute', left: 0, top: 0 }}>
            <Sprite styleId={s.id} art={surfaceArt(wall, worldW, ROOM.FLOOR_Y)} cacheKey={`hoja-wall-${wall.id}-${worldW}`} w={worldW} h={ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: ROOM.FLOOR_Y }}>
            <Sprite styleId={s.id} art={surfaceArt(floor, worldW, ROOM.H - ROOM.FLOOR_Y)} cacheKey={`hoja-floor-${floor.id}-${worldW}`} w={worldW} h={ROOM.H - ROOM.FLOOR_Y} kind="surface" fit="cover" pixel={pixel} />
          </div>
          {items.map(([id, x, y, paint]) => {
            const f = findFurniture(id);
            return (
              <div key={id + x} style={{ position: 'absolute', left: x - f.w / 2, top: y - f.h }}>
                <Sprite styleId={s.id} art={f.render(findPaint(paint))} cacheKey={`furn-${f.id}-${paint}`} w={f.w} h={f.h} pixel={pixel} />
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 450 - ROOM.PET_W / 2, top: ROOM.H - ROOM.PET_W - 6 }}>
            <Sprite styleId={s.id} art={petArt(BASE_PET, 'feliz')} cacheKey="hoja-pet-room" w={ROOM.PET_W} h={ROOM.PET_W} kind="pet" pixel={pixel} />
          </div>
        </div>
      </div>
    </Cell>
  );
}

const ROOMS = [
  { wall: 'lunares', floor: 'madera', label: 'Cuarto dulce', items: [['cama', 170, 404, 'natural'], ['ventana', 450, 210, 'blanco'], ['guirnalda', 450, 95, 'natural'], ['planta', 700, 400, 'natural'], ['alfombra', 450, 420, 'pastel'], ['tocador', 820, 400, 'pastel']] },
  { wall: 'ladrillo', floor: 'nogal', label: 'Cuarto rockero', items: [['sofa', 200, 404, 'negro'], ['guitarra', 400, 400, 'vino'], ['repisa', 520, 170, 'nogal'], ['tocadiscos', 640, 404, 'nogal'], ['pesas', 790, 418, 'negro']] },
  { wall: 'medianoche', floor: 'alfombrado', label: 'Cuarto de noche', items: [['estanteria', 140, 400, 'blanco'], ['escritorio', 330, 404, 'blanco'], ['espejo', 560, 404, 'pastel'], ['bau', 690, 418, 'bosque'], ['puf', 830, 420, 'neon']] },
];

function StyleSheet({ s }) {
  const sid = s.id;
  return (
    <div style={{ background: s.ui.paper, padding: '22px 26px 10px', width: 1400, boxSizing: 'border-box' }}>
      <h1 style={{ fontFamily: s.fonts.display, fontSize: 34, fontWeight: 800, margin: '0 0 2px', color: s.ui.ink }}>{s.name}</h1>
      <p style={{ fontFamily: s.fonts.body, fontSize: 14, color: s.ui.inkSoft, margin: '0 0 18px' }}>{s.tagline}</p>

      <Section s={s} title="Cuartos">
        {ROOMS.map((r) => <RoomScene key={r.label} s={s} wallId={r.wall} floorId={r.floor} items={r.items} label={r.label} />)}
      </Section>

      <Section s={s} title="Mascota: ánimos y estilos de partida">
        {ALL_MOODS.map((m) => (
          <Cell key={m} s={s} label={m} w={102}><Sprite styleId={sid} art={petArt(BASE_PET, m)} cacheKey={`hoja-mood-${m}`} w={96} h={96} kind="pet" /></Cell>
        ))}
        {PET_STYLES.map((p) => (
          <Cell key={p.id} s={s} label={p.label} w={88}><Sprite styleId={sid} art={petArt({ ...DEFAULT_RECIPE, ...p.recipe })} cacheKey={`hoja-preset-${p.id}`} w={82} h={82} kind="pet" /></Cell>
        ))}
      </Section>

      <Section s={s} title="Anchos de mochi"><PartRow s={s} list={BODIES} field="body" /></Section>
      <Section s={s} title="Orejas"><PartRow s={s} list={EARS} field="ears" /></Section>
      <Section s={s} title="Ojos"><PartRow s={s} list={EYES} field="eyes" /></Section>
      <Section s={s} title="Bocas"><PartRow s={s} list={MOUTHS} field="mouth" /></Section>
      <Section s={s} title="Cachetes"><PartRow s={s} list={CHEEK_STYLES} field="cheeks" /></Section>
      <Section s={s} title="Colas"><PartRow s={s} list={TAILS} field="tail" /></Section>
      <Section s={s} title="Estampados"><PartRow s={s} list={PATTERNS} field="pattern" /></Section>
      <Section s={s} title="En la cabeza"><PartRow s={s} list={HEAD_ACCESSORIES} field="headAcc" /></Section>
      <Section s={s} title="En el cuello"><PartRow s={s} list={NECK_ACCESSORIES} field="neckAcc" /></Section>
      <Section s={s} title="Extras"><PartRow s={s} list={EXTRA_ACCESSORIES} field="extraAcc" /></Section>

      <Section s={s} title="Muebles">
        {FURNITURE.map((f) => (
          <Cell key={f.id} s={s} label={f.name} w={Math.max(70, Math.round(f.w * 0.5))}>
            <Sprite styleId={sid} art={f.render(findPaint('natural'))} cacheKey={`furn-${f.id}-natural`} w={Math.round(f.w * 0.5)} h={Math.round(f.h * 0.5)} />
          </Cell>
        ))}
      </Section>

      <Section s={s} title="Colores de muebles (sofá)">
        {FURNITURE_PAINTS.map((p) => (
          <Cell key={p.id} s={s} label={p.id} w={100}>
            <Sprite styleId={sid} art={findFurniture('sofa').render(p)} cacheKey={`furn-sofa-${p.id}`} w={96} h={63} />
          </Cell>
        ))}
      </Section>

      <Section s={s} title="Paredes">
        {WALL_STYLES.map((w) => (
          <Cell key={w.id} s={s} label={w.name} w={100}>
            <Sprite styleId={sid} art={surfaceArt(w, 120, 120)} cacheKey={`swatch-${w.id}`} w={96} h={96} kind="surface" fit="cover" style={{ borderRadius: 8, overflow: 'hidden' }} />
          </Cell>
        ))}
      </Section>

      <Section s={s} title="Pisos">
        {FLOOR_STYLES.map((f) => (
          <Cell key={f.id} s={s} label={f.name} w={100}>
            <Sprite styleId={sid} art={surfaceArt(f, 120, 120)} cacheKey={`swatch-${f.id}`} w={96} h={96} kind="surface" fit="cover" style={{ borderRadius: 8, overflow: 'hidden' }} />
          </Cell>
        ))}
      </Section>

      <Section s={s} title="Decoración, comida e interfaz">
        {DECOR_CATALOG.map((d) => <Cell key={d.id} s={s} label={d.name} w={70}><Sprite styleId={sid} art={d.render()} cacheKey={`decor-${d.id}`} w={64} h={64} /></Cell>)}
        {FOOD_SPRITES.map((f) => <Cell key={f.id} s={s} label={f.name} w={60}><Sprite styleId={sid} art={f.render()} cacheKey={`food-${f.id}`} w={54} h={54} /></Cell>)}
        {Object.entries(UI_SPRITES).map(([k, r]) => <Cell key={k} s={s} label={k} w={54}><Sprite styleId={sid} art={r()} cacheKey={`ui-${k}`} w={48} h={48} /></Cell>)}
      </Section>

      <Section s={s} title="Minijuegos">
        {['#D8697F', '#E2A845', '#8FC7EE', '#C3A7EA', '#7FA894', '#EE7BC8'].map((c, i) => (
          <Cell key={c} s={s} w={100}><Sprite styleId={sid} art={<Car color={c} />} cacheKey={`car-${i}`} w={96} h={45} /></Cell>
        ))}
        {[0, 1, 2, 3, 4].map((t) => <Cell key={t} s={s} w={56}><Sprite styleId={sid} art={<Candy type={t} />} cacheKey={`candy-${t}`} w={52} h={52} /></Cell>)}
        {SIMON_PADS.map((p) => <Cell key={p.id} s={s} w={76}><Sprite styleId={sid} art={<SimonPad shape={p.shape} color={p.color} />} cacheKey={`pad-${p.id}-0-0`} w={72} h={72} /></Cell>)}
        <Cell s={s} w={50}><Sprite styleId={sid} art={<Pipe side="bottom" color="#7FA894" />} cacheKey="pipe" w={44} h={110} kind="surface" /></Cell>
      </Section>
    </div>
  );
}

export default function SpriteSheet() {
  const id = new URLSearchParams(window.location.search).get('estilo') || 'pixel';
  return <StyleSheet s={getStyle(id)} />;
}
