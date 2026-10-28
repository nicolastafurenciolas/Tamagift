# Tamagift — todo junto

Todo lo construido hasta ahora, en un solo lugar. Si quieres probar la
aplicación de verdad, solo necesitas `frontend/` y `backend/` — `historial/`
es solo por si acaso, no hace falta para correr nada.

## La forma más rápida de probarlo: en tu computadora primero

### 1. Backend
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Corre en http://localhost:8000 — pruébalo abriendo http://localhost:8000/docs
en el navegador, deberías ver la documentación de la API.

### 2. Frontend
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
Abre http://localhost:5173/crear — ahí empieza el asistente.

### 3. Para probarlo en tu celular (mismo wifi, sin desplegar nada)
- Backend: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Encuentra la IP local de tu computador (Mac/Linux: `ifconfig | grep inet`;
  Windows: `ipconfig`), algo como `192.168.1.X`
- En `frontend/.env`, cambia `VITE_API_BASE` a `http://192.168.1.X:8000`
  (tu IP real, no `localhost` — desde el celular localhost es el celular)
- Frontend: `npm run dev -- --host`
- Abre en tu celular la URL "Network" que imprime la terminal, mismo wifi

Con esto: creas una mascota completa desde el asistente (dibujando con el
dedo de verdad) y la abres como la abriría tu novia, todo desde tu propio
celular, sin subir nada a internet todavía.

## Estilos visuales

La app tiene seis estilos (pixel por defecto, lo-fi, retro, papel, neón y
sticker). Cómo funcionan y cómo revisarlos: `ESTILOS.md`.

## Qué hay en cada carpeta

- **`frontend/`** — el asistente de 8 pasos + el juego completo (alimentar,
  bañar, 3 minijuegos, cuarto decorable, cinemáticas, reproductor de
  música). Proyecto real de Vite + React + rutas, no artifacts sueltos.
- **`backend/`** — FastAPI + base de datos. Probado contra Postgres real, no
  solo SQLite. `backend/DEPLOY.md` trae los pasos para subirlo (Supabase + Railway + Netlify)
  cuando estés listo para eso.
- **`historial/`** — versiones sueltas de partes del proyecto de sesiones
  anteriores (el estudio de dibujo, el asistente y el juego como archivos
  independientes). Todo lo que hacen ya está integrado dentro de
  `frontend/src/`. Guárdalos si quieres, pero no los necesitas para correr
  nada.

## Qué NO está probado todavía

- Nada de esto lo he visto correr en un navegador real — no tengo forma de
  abrir uno desde donde trabajo. Esta es literalmente la primera vez que
  esto se prueba con manos y ojos de verdad.
- El despliegue real en Railway y Netlify (la configuración está probada,
  pero no puedo crear cuentas ni desplegar por ti).
- El ícono personalizado al "agregar a inicio" en iPhone específicamente —
  la lógica está ahí, pero no la pude confirmar en un dispositivo real.

Cuando pruebes, lo más útil que me puedes decir es: qué se sintió raro,
qué botón no hacía lo que esperabas, y si dibujar con el dedo funcionó bien.
