import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TamagiftGame from '../components/TamagiftGame';
import { buildTestPet, testGameState } from '../testSeed';
import { saveLocalPet } from '../api';
import { DEFAULT_RECIPE, recipeToPngDataUrl } from '../PetRecipe';
import { PET_STYLES } from '../petStyles';

// ─────────────────────────────────────────────────────────────────
// Página de pruebas (solo desarrollo): /dev/:pantalla?estilo=pixel
// Arma una mascota de prueba fija y su cuarto amoblado, y abre el juego
// directo en la pantalla pedida, para revisar cada estilo sin tener que
// pasar por el asistente.
// ─────────────────────────────────────────────────────────────────

const SLUG = 'devpet';

export default function DevGame() {
  const { pantalla } = useParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem(`tamagift:pet:${SLUG}`)) {
        const { payload } = await buildTestPet();
        const recipe = { ...DEFAULT_RECIPE, ...PET_STYLES[0].recipe };
        const [n, f, e] = await Promise.all(['normal', 'feliz', 'enojado'].map((m) => recipeToPngDataUrl(recipe, m, null, 320)));
        saveLocalPet(SLUG, { ...payload, name: 'Mochi', creator_name: 'Nico', drawing_normal: n, drawing_feliz: f, drawing_enojado: e, recipe_original: JSON.stringify(recipe), songs: [] });
      }
      if (!localStorage.getItem(`tamagift:gamestate:${SLUG}`)) {
        const base = testGameState();
        localStorage.setItem(`tamagift:gamestate:${SLUG}`, JSON.stringify({
          ...base,
          ownedDecor: ['planta', 'libros', 'osito', 'lampara', 'velas', 'cojin'],
          ownedPosters: ['local-photo-0'],
          wall: 'zocalo.crema',
          floor: 'tablas.miel',
          // la guía de bienvenida se revisa con un regalo de verdad (/p/…)
          tutorial: 'listo',
          placed: [
            { key: 'd5', kind: 'mueble', refId: 'alfombraOsito', x: 820, y: 418, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd1', kind: 'mueble', refId: 'cama', x: 300, y: 404, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd2', kind: 'mueble', refId: 'estanteria', x: 560, y: 396, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd3', kind: 'mueble', refId: 'planta', x: 1030, y: 400, scale: 1, flip: 1, paint: 'menta' },
            { key: 'd4', kind: 'mueble', refId: 'ventana', x: 820, y: 250, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd6', kind: 'mueble', refId: 'guirnalda', x: 430, y: 140, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd8', kind: 'mueble', refId: 'sofa', x: 1300, y: 404, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd9', kind: 'mueble', refId: 'lampara', x: 1500, y: 400, scale: 1, flip: 1, paint: 'natural' },
            { key: 'd7', kind: 'decor', refId: 'osito', x: 1140, y: 410, scale: 1, flip: 1 },
            { key: 'd10', kind: 'decor', refId: 'lampara', x: 1335, y: 268, scale: 1, flip: 1 },
            { key: 'd11', kind: 'decor', refId: 'velas', x: 560, y: 158, scale: 0.8, flip: 1 },
            { key: 'd12', kind: 'poster', refId: 'local-photo-0', x: 1130, y: 250, scale: 1, flip: 1, paint: 'natural' },
          ],
          petX: 800,
        }));
      }
      setReady(true);
    })();
  }, []);

  // ?debugw=1 → lista los elementos más anchos que la pantalla (para
  // cazar lo que empuja la página hacia un costado).
  useEffect(() => {
    if (!ready || !new URLSearchParams(window.location.search).get('debugw')) return undefined;
    const t = setTimeout(() => {
      const vw = document.documentElement.clientWidth;
      const out = [`vw=${vw} scrollW=${document.documentElement.scrollWidth}`];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && r.width > 0) out.push(`${el.tagName}.${(el.className || '').toString().slice(0, 40)} right=${Math.round(r.right)} w=${Math.round(r.width)} txt=${(el.textContent || '').slice(0, 30)}`);
      });
      const pre = document.createElement('pre');
      pre.id = 'dbg';
      pre.textContent = out.slice(0, 40).join(' | ');
      document.body.appendChild(pre);
    }, 4000);
    return () => clearTimeout(t);
  }, [ready]);

  if (!ready) return null;
  return <TamagiftGame slug={SLUG} devScreen={pantalla === 'main' ? undefined : pantalla} devOpened={pantalla !== 'apertura'} />;
}
