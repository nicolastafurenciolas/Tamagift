import React, { useEffect, useMemo, useState } from 'react';
import Room from '../../Room';
import CookingGame from '../CookingGame';
import { LevelMap } from '../levelUi';
import { Screen } from '../../ui';
import { C } from '../../../theme';
import { setStory } from '../../../personal/story';
import { roomSeason } from '../../../seasons';
import { DEFAULT_RECIPE } from '../../../PetRecipe';
import { PET_STYLES } from '../../../petStyles';
import CelebrationLayer from './CelebrationLayer';
import PhotoObject from './PhotoObject';
import { photoObjectItems } from '../../../art/room/photoObjects';
import { ROOM } from '../../../gameState';

// ─────────────────────────────────────────────────────────────────
// Banco de pruebas de "su historia" (solo desarrollo), sin pasar por el
// juego entero: /arte?set=historia&ver=cuarto|cocina|mapa&estilo=pixel
//   cuarto   el cuarto con la decoración de una fecha (&fiesta=cumple,
//            aniversario, conocimos…) y los objetos con foto
//   cocina   la cocina con dos recetas de quien regala
//   mapa     el mapa de Memoria con lugares (&pasado=1: la primera zona
//            ya pasada, se abre su recuerdo)
// ─────────────────────────────────────────────────────────────────

function fakePhoto(seed) {
  const c = document.createElement('canvas');
  c.width = 480; c.height = 360;
  const g = c.getContext('2d');
  const pal = [['#FFB38A', '#FF7FA1', '#7A6AD8'], ['#9ED8FF', '#CFEFFF', '#7FC8A0'], ['#FFE3A3', '#F7B267', '#6A8FD8']][seed % 3];
  const sky = g.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, pal[2]); sky.addColorStop(0.55, pal[1]); sky.addColorStop(1, pal[0]);
  g.fillStyle = sky; g.fillRect(0, 0, 480, 360);
  g.fillStyle = '#FFF2B8'; g.beginPath(); g.arc(330, 170, 54, 0, Math.PI * 2); g.fill();
  g.fillStyle = ['#3E5A8A', '#4E8A5A', '#8A5A3E'][seed % 3]; g.fillRect(0, 238, 480, 122);
  g.fillStyle = '#2A2238';
  g.beginPath(); g.arc(196, 150, 26, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(250, 160, 24, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(196, 260, 46, 92, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(252, 270, 42, 86, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FF5C8A'; g.beginPath(); g.moveTo(224, 108); g.bezierCurveTo(200, 86, 214, 64, 224, 80); g.bezierCurveTo(234, 64, 248, 86, 224, 108); g.fill();
  return c.toDataURL('image/jpeg', 0.9);
}

export default function StoryLab() {
  const q = new URLSearchParams(window.location.search);
  const ver = q.get('ver') || 'cuarto';
  const pet = useMemo(() => ({
    slug: 'historia-lab', name: 'Mochi', creator_name: 'Leo', recipient_name: 'Ana',
    photos: [0, 1, 2].map((i) => ({ url: fakePhoto(i), used_for: 'poster' })),
    songs: [{ title: 'Nuestra canción' }],
  }), []);
  const profile = useMemo(() => ({
    nickname: 'Ana',
    dates: [{ id: 'd1', kind: 'cumple', date: '1998-11-04' }, { id: 'd2', kind: 'aniversario', date: '2021-02-14' }],
    places: [
      { id: 'p1', name: 'El café donde nos conocimos', note: 'Pediste un chocolate y te manchaste la nariz. Ahí supe que me ibas a gustar mucho.', photo: 0 },
      { id: 'p2', name: 'La playa de ese viaje', note: 'Nuestro primer viaje juntos.' },
      { id: 'p3', name: 'Nuestra primera cita', note: '' },
    ],
    recipes: [
      { id: 'r1', name: 'La pasta de nuestra primera cita', story: 'La hice tan nervioso que se me pasó la sal. Igual dijiste que era la mejor del mundo.' },
      { id: 'r2', name: 'Panqueques de los domingos', story: 'Para despertarte despacito.', dish: 'panqueques' },
    ],
    photoObjects: [{ id: 'o1', kind: 'marco', photo: 0 }, { id: 'o2', kind: 'taza', photo: 1 }, { id: 'o3', kind: 'cojin', photo: 2 }, { id: 'o4', kind: 'postal', photo: 1 }],
  }), []);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setStory({ profile, pet, seen: q.get('pasado') ? [] : null });
    setReady(true);
    const id = setTimeout(() => { document.body.dataset.ready = '1'; }, 2500);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const look = { recipe: { ...DEFAULT_RECIPE, ...PET_STYLES[0].recipe } };
  const [game, setGame] = useState(() => ({
    wall: 'zocalo.crema', floor: 'tablas.miel', petX: 800,
    placed: [
      { key: 'd1', kind: 'mueble', refId: 'cama', x: 300, y: 404, scale: 1, flip: 1, paint: 'natural' },
      { key: 'd2', kind: 'mueble', refId: 'estanteria', x: 600, y: 396, scale: 1, flip: 1, paint: 'natural' },
      { key: 'd4', kind: 'mueble', refId: 'ventana', x: 820, y: 250, scale: 1, flip: 1, paint: 'natural' },
      { key: 'd8', kind: 'mueble', refId: 'sofa', x: 1100, y: 404, scale: 1, flip: 1, paint: 'natural' },
    ],
  }));
  if (!ready) return null;

  if (ver === 'cocina') {
    return <CookingGame look={look} progress={{ unlocked: 3, stars: { 1: 3, 2: 2 } }} onBack={() => {}} onComplete={(s, x) => console.log('fin', s, JSON.stringify(x))} />;
  }
  if (ver === 'mapa') {
    const theme = q.get('mundo') || 'memoria';
    const count = 12;
    const stars = q.get('pasado') ? { 1: 3, 2: 3, 3: 2, 4: 3 } : { 1: 2 };
    return (
      <Screen>
        <LevelMap count={count} unlocked={q.get('pasado') ? 6 : 2} stars={stars} theme={theme} look={look} colors={[C.peach, C.rose, C.amber, C.sage]} labels={Array.from({ length: count }, (_, k) => `Nivel ${k + 1}`)} onPick={() => {}} />
      </Screen>
    );
  }
  // el cuarto con la fecha de hoy forzada (?fiesta=) y los objetos con foto
  const season = roomSeason(profile, new Date(), { names: { nombre: 'Ana', yo: 'Leo' }, songs: 1 }).personal;
  const items = photoObjectItems(profile, pet);
  const spots = { marco: [640, 300], taza: [560, 300], cojin: [1080, 360], postal: [960, 150] };
  return (
    <div style={{ padding: '60px 0 0' }}>
      <Room
        petName="Mochi" mood="feliz" look={look} posters={[]} customDecor={[]} game={game} setGame={setGame} editing={false}
        fullBleed world={{ phase: 'tarde', weather: 'sol', lightsOff: false }}
        backLayer={(
          <CelebrationLayer season={season} cx={q.get('cx') ? Number(q.get('cx')) : 800}>
            <PhotoLayerPreview items={items} spots={spots} />
          </CelebrationLayer>
        )}
      />
      {season && <p style={{ textAlign: 'center', fontFamily: 'var(--pg-font-display)', color: C.ink, padding: 10 }}>{season.title} · {season.line}{season.songLine ? ` · ${season.songLine}` : ''}</p>}
    </div>
  );
}

// Vista previa: los objetos con foto donde los pondría quien recibe (el
// cuarto de verdad los pone como decoración, ver el informe).
function PhotoLayerPreview({ items, spots, pixel }) {
  return items.map((it) => {
    const [x, bottom] = spots[it.kind] || [400, 400];
    const w = Math.round(it.def.w * 1.25), h = Math.round(it.def.h * 1.25);
    return (
      <div key={it.id} style={{ position: 'absolute', left: x - w / 2, top: bottom + it.def.foot * 1.25 - h, width: w, height: h, pointerEvents: 'none' }}>
        <PhotoObject kind={it.kind} url={it.url} w={w} pixel={pixel} />
      </div>
    );
  });
}

export { ROOM };
