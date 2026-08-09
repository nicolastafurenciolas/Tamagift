# PetGift — frontend

Proyecto real de React + Vite (no artifacts sueltos). Compilado y probado antes
de entregarlo — ver la nota al final.

## Estructura

```
src/
  App.jsx              rutas: /crear y /p/:slug
  pages/
    CreatePage.jsx      envuelve el asistente
    GiftPage.jsx         envuelve el juego, cambia el manifest dinámicamente
  components/
    PetGiftWizard.jsx    el asistente de 8 pasos
    PetGiftGame.jsx       el juego (alimentar, bañar, jugar, cuarto)
```

## Para correrlo en tu máquina

```
npm install
cp .env.example .env
# edita .env con la URL de tu backend si ya lo desplegaste
npm run dev
```

Abre `http://localhost:5173/crear` para el asistente.

## Para desplegarlo

Ver `DEPLOY.md` en la carpeta del backend. En resumen: subes esta carpeta a
Netlify (usa `netlify.toml`, ya incluido), y le configuras la variable de
entorno `VITE_API_BASE` con la URL de tu backend en Render.

## Qué ya verifiqué yo mismo, de verdad

- `npm install` y `npm run build` corren sin errores.
- Las 3 rutas (`/`, `/crear`, `/p/:slug`) responden `200` incluso visitando
  `/p/algo` directamente (no solo navegando desde adentro de la app) —
  importante porque así es como tu novia va a abrir el link por primera vez.
- El manifest de la app se genera y se sirve correctamente.

## Qué NO he verificado

- Cómo se ve o se siente en un navegador real — todavía no puedo abrir un
  navegador desde donde trabajo. Ábrelo tú y dime qué encuentras.
- Los íconos en `public/icons/` son placeholders genéricos que generé yo
  (un círculo rosa) — cámbialos por algo con tu marca cuando quieras.
