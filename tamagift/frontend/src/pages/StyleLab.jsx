import React from 'react';
import Sprite from '../components/Sprite';
import { PetRecipeMarkup, DEFAULT_RECIPE } from '../PetRecipe';
import { PET_STYLES } from '../petStyles';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, findPaint } from '../roomCatalog';
import { DECOR_CATALOG } from '../shopCatalog';
import { Car, Candy, SimonPad, SIMON_PADS } from '../gameArt';
import { FOOD_SPRITES, UI_SPRITES } from '../sprites';
import { STYLE_LIST } from '../styles/registry';

// ─────────────────────────────────────────────────────────────────
// Laboratorio de estilos (solo desarrollo, ruta /estilos).
// Pone el mismo arte en los seis estilos, uno debajo del otro, para
// revisar de un vistazo que el motor de sprites no rompa nada.
// `?solo=pixel` muestra un único estilo (más rápido de revisar).
// ─────────────────────────────────────────────────────────────────

const petArt = (recipe, mood = 'normal') => (
  <svg viewBox="0 0 200 200" width="200" height="200"><PetRecipeMarkup recipe={recipe} mood={mood} /></svg>
);

function surfaceArt(style, w = 320, h = 140) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <rect width={w} height={h} fill={style.base} />
      {style.render && style.render(w, h)}
    </svg>
  );
}

function photoArt() {
  return (
    <svg viewBox="0 0 120 90" width="120" height="90">
      <defs>
        <linearGradient id="ph-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FB8E8" /><stop offset="1" stopColor="#F6D3B8" /></linearGradient>
      </defs>
      <rect width="120" height="90" fill="url(#ph-sky)" />
      <circle cx="88" cy="28" r="12" fill="#FFE29A" />
      <path d="M0 70 Q30 50 60 66 T120 60 V90 H0 Z" fill="#6E9F72" />
      <ellipse cx="44" cy="62" rx="9" ry="14" fill="#3D3229" />
      <circle cx="44" cy="44" r="7" fill="#E8B79A" />
      <ellipse cx="62" cy="62" rx="9" ry="14" fill="#B25476" />
      <circle cx="62" cy="44" r="7" fill="#D9A07E" />
    </svg>
  );
}

const PETS = [
  { ...DEFAULT_RECIPE, ...PET_STYLES[0].recipe },
  { ...DEFAULT_RECIPE, ...PET_STYLES[1].recipe },
  { ...DEFAULT_RECIPE, ...PET_STYLES[2].recipe },
  { ...DEFAULT_RECIPE, ...(PET_STYLES[5] || PET_STYLES[3]).recipe },
];

function Row({ title, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#666', marginBottom: 4 }}>{title}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>{children}</div>
    </div>
  );
}

function StyleBlock({ s }) {
  const sid = s.id;
  return (
    <section style={{ background: s.ui.paper, padding: 14, borderRadius: 10, marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'sans-serif', fontSize: 16, margin: '0 0 10px', color: s.ui.ink }}>{s.name}</h2>
      <Row title="mascotas">
        {PETS.map((r, i) => <Sprite key={i} styleId={sid} art={petArt(r)} cacheKey={`lab-pet-${i}`} w={110} h={110} kind="pet" />)}
        {['feliz', 'enojado'].map((m) => <Sprite key={m} styleId={sid} art={petArt(PETS[0], m)} cacheKey={`lab-pet-0-${m}`} w={110} h={110} kind="pet" />)}
      </Row>
      <Row title="muebles">
        {FURNITURE.slice(0, 9).map((f) => (
          <Sprite key={f.id} styleId={sid} art={f.render(findPaint('natural'))} cacheKey={`lab-f-${f.id}`} w={Math.round(f.w * 0.55)} h={Math.round(f.h * 0.55)} />
        ))}
      </Row>
      <Row title="decoración, comida e interfaz">
        {DECOR_CATALOG.map((d) => <Sprite key={d.id} styleId={sid} art={d.render()} cacheKey={`lab-d-${d.id}`} w={60} h={60} />)}
        {FOOD_SPRITES.slice(0, 6).map((f) => <Sprite key={f.id} styleId={sid} art={f.render()} cacheKey={`lab-food-${f.id}`} w={48} h={48} />)}
        {Object.entries(UI_SPRITES).slice(0, 8).map(([k, render]) => <Sprite key={k} styleId={sid} art={render()} cacheKey={`lab-ui-${k}`} w={40} h={40} />)}
      </Row>
      <Row title="juegos, superficies y foto">
        <Sprite styleId={sid} art={<Car color="#D8697F" />} cacheKey="lab-car" w={96} h={45} />
        {[0, 1, 2, 3, 4].map((t) => <Sprite key={t} styleId={sid} art={<Candy type={t} />} cacheKey={`lab-candy-${t}`} w={44} h={44} />)}
        {SIMON_PADS.slice(0, 2).map((p) => <Sprite key={p.id} styleId={sid} art={<SimonPad shape={p.shape} color={p.color} />} cacheKey={`lab-pad-${p.id}`} w={60} h={60} />)}
        <Sprite styleId={sid} art={surfaceArt(WALL_STYLES[1] || WALL_STYLES[0])} cacheKey="lab-wall" w={220} h={96} kind="surface" fit="cover" />
        <Sprite styleId={sid} art={surfaceArt(FLOOR_STYLES[1] || FLOOR_STYLES[0])} cacheKey="lab-floor" w={220} h={96} kind="surface" fit="cover" />
        <Sprite styleId={sid} art={photoArt()} cacheKey="lab-photo" w={120} h={90} kind="photo" />
      </Row>
    </section>
  );
}

export default function StyleLab() {
  const solo = new URLSearchParams(window.location.search).get('solo');
  const list = solo ? STYLE_LIST.filter((s) => s.id === solo) : STYLE_LIST;
  return (
    <div style={{ padding: 14, background: '#8d8a94', minHeight: '100vh' }}>
      {list.map((s) => <StyleBlock key={s.id} s={s} />)}
      <div id="lab-done" />
    </div>
  );
}
