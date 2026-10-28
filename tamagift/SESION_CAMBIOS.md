# Registro de cambios

## Sesión de estilos visuales (Opus 5.5)

**Pedido:** que la persona pueda elegir el estilo de la app (quien regala y
quien recibe), con los seis estilos votados: Pixel art (por defecto), Lo-fi
noche acogedora, Retro setentero, Papel recortado, Neón nocturno y Sticker
kawaii; rehacer todos los sprites en esos estilos, mejorar interfaces,
animaciones y sonidos, y arreglar todo lo que fallara.

**Qué se hizo** (detalle técnico en `ESTILOS.md`):
- Sistema de estilos: tokens de interfaz como variables CSS, letras, bordes,
  sombras y fondos propios por estilo; selector con vista previa real de la
  mascota en el asistente (paso "Estilo") y en el juego (botón de paleta).
- Motor de sprites (`styles/spriteEngine.js`): todo el arte (mascota,
  muebles, decoración, comida, juegos, paredes, pisos, pósters, íconos) se
  redibuja en el estilo activo. En pixel: rejilla real de 3 px con paleta de
  rampas y contorno de color.
- Sprites propios en vez de emojis (`sprites.jsx`).
- Movimiento por estilo (`styles/motion.js`) y sonido por estilo
  (seis paquetes de timbre en `sound.js`).
- El juego se dividió en `components/game/` (un archivo por minijuego,
  tienda, baño, decoración, escenas).
- Backend: `app_style`, `POST /api/pets/{slug}/style`, validación completa
  de entradas (422 en vez de 500), tope de tamaño, `pool_pre_ping`.

**Fallas corregidas (auditoría completa del código):** música de Spotify sin
reproductor; lista que no avanzaba ni repetía; sin pausa/siguiente; carga
fallida mostraba una mascota de demostración; textos largos rompían la
creación; "Salta y vuela" perdía resultados; hambre y amor no se guardaban;
el rediseño cobraba antes de guardar; cruces dobles en "Cruzar la calle";
trivia repetible para farmear monedas y con respuestas correctas como
"incorrectas"; Simón se rompía con un toque de más; la serpiente podía
girar sobre sí misma y arrancaba sola; topos escondidos antes de tiempo y
sin castigo por fallar; baño con monedas infinitas; resultados fantasma al
salir de un juego; pestañas de la tienda y modo decorar desbordaban; baño,
menú y juegos que obligaban a hacer scroll; zoom por doble toque; sonido
que no se desbloqueaba en celulares; mascota no acariciable con mouse;
rompecabezas que estiraba fotos; imágenes ilegibles guardadas rotas;
pósters locales sin id; búsqueda de comida con comodines; resumen del
asistente sin la mascota; copiar link que mentía; asistente sin borrador.

**Verificación:** capturas con Chrome emulando un celular (390×760 y
360×640) de todas las pantallas en los seis estilos; prueba de los 84
sonidos (14 efectos × 6 paquetes) sin errores; pruebas del backend y de la
lógica de los juegos; `vite build`.

**Pendiente de probar en un celular físico:** que el audio y el reproductor
de YouTube/Spotify se comporten igual que en la emulación.

---

# Sesión anterior — continuación (tareas #38-#44)

Este documento describe, tarea por tarea, todos los cambios hechos en esta sesión sobre el proyecto Tamagift, con el objetivo de que puedan ser revisados por otro modelo (Opus 5) sin necesidad de rehacer la exploración del código. Incluye: qué se pidió, qué decisiones de producto se tomaron (y quién las tomó), qué archivos cambiaron, qué se implementó exactamente, y cómo se verificó.

**Contexto previo (no cubierto en detalle aquí, ya estaba hecho antes de esta sesión):** sistema de licencias por llave de acceso, arte de mascota/cuarto/muebles, minijuegos base. Ver `CLAUDE.md` / memoria del proyecto para ese contexto.

**Convención de este documento:** cuando dice "Verificado", significa que se probó de punta a punta en un navegador real (Chrome vía herramientas de automatización) contra un backend FastAPI corriendo localmente y una base SQLite local — no solo revisión de código. Cuando dice "no verificado visualmente" se aclara explícitamente.

---

## #39 — Música automática al abrir el regalo

### Problema original
Los efectos de sonido y la música nunca sonaban solos al abrir el link del regalo. Restricción real de los navegadores (Chrome/Safari bloquean audio con sonido sin un gesto real del usuario), no un bug.

### Decisión de producto (tomada por el usuario tras discusión)
1. Se **rechazó** la idea de descargar audio de YouTube/Spotify como MP3 (ilegal: viola ToS de YouTube y elude DRM de Spotify — se explicó esto al usuario y se descartó).
2. Se implementó: **subida de archivo de audio propio** (MP3/M4A/OGG/WAV, máx. 10 MB) como alternativa a pegar un link de Spotify/YouTube.
3. Para el problema de "necesita un gesto del usuario": se agregó una **pantalla de apertura** ("Toca para abrir tu regalo 💌") — el toque en esa pantalla es el gesto real que dispara la reproducción, en vez de esperar que el usuario busque un botón de play.
4. Iteración posterior del usuario: "elimina el panel superior con la lista de canciones, mejor una barra de volumen" y "si YouTube/Spotify también pueden reproducirse igual (con el mismo toque), sería increíble".

### Qué se implementó

**Backend** (`backend/models.py`, `backend/schemas.py`, `backend/main.py`):
- `Song` (modelo): nuevas columnas `source_type` (`"embed"` | `"upload"`, default `"embed"`), `audio_data` (Text nullable, data URL del audio si es upload). `embed_url` se mantiene pero puede quedar `""` para uploads.
- `SongIn` (schema): agregados `source_type: str = "embed"`, `audio_data: Optional[str] = None`; `embed_url` pasó a `Optional[str] = None`.
- `main.py`: migración ad-hoc (`ALTER TABLE songs ADD COLUMN ...`) para agregar las columnas nuevas a la BD sqlite local ya existente (patrón ya usado en el proyecto, ver comentario en el código). `create_pet` guarda `source_type`, `audio_data`.

**Frontend — asistente** (`frontend/src/components/TamagiftWizard.jsx`, función `MusicStep`):
- Toggle "Pegar link" / "Subir archivo".
- Modo subir archivo: input de tipo file, valida `audio/*`, límite `MAX_AUDIO_BYTES = 10MB`, convierte a data URL con `FileReader`, guarda en el estado `songs` con `source_type: 'upload'`.
- `handleFinalize`: el payload de canciones ahora mapea `source_type`, `embed_url` (vacío si es upload), `audio_data`.

**Frontend — reproductor** (`frontend/src/components/MusicBar.jsx` — **reescrito completo**):
- Antes: dos sistemas de reproducción en paralelo — `MusicStage`/`MusicPlayer` (definidos en `TamagiftGame.jsx`, código MUERTO, nunca se montaban) y `MusicBar.jsx` (componente real, con UI visible de tarjeta con lista de canciones, solo se montaba cuando el usuario abría el panel manualmente).
- Ahora: `MusicBar` es un **motor sin interfaz visible** (`forwardRef`, sin JSX de tarjeta, solo un `<div>` oculto con el `<audio>` o el holder de YouTube). Expone dos métodos vía `useImperativeHandle`:
  - `start()`: arranca la PRIMERA canción de la lista. Para `upload`, llama `audioEl.play()` directo. Para YouTube, llama a la IFrame Player API (`playerRef.playVideo()`), con manejo de "pendiente" (`pendingStartRef`) si el player de YouTube aún no cargó cuando se llama `start()`.
  - `setVolume(v)` (0–1): aplica a `audio.volume` o `player.setVolume(v*100)`, con manejo de "pendiente" (`pendingVolumeRef`) igual que arriba.
- Spotify: se documenta explícitamente en comentarios que es **imposible técnicamente** controlar su reproducción desde fuera — su embed no expone ninguna API. Esto se le explicó al usuario, no es una limitación de la implementación.
- `MusicStage`/`MusicPlayer` (código muerto) se **eliminaron** de `TamagiftGame.jsx`.

**Frontend — juego** (`frontend/src/components/TamagiftGame.jsx`):
- Nuevo componente `OpeningScreen`: pantalla completa (`position: fixed`, `zIndex: 50`) con el nombre de la mascota, quién la regaló, y el botón "Toca para abrir tu regalo 💌". Se muestra si `!opened`.
- `handleOpenGift()`: al tocar el botón, en el MISMO gesto de click llama `musicBarRef.current.start()` — esto es lo que hace posible el autoplay real.
- `MusicBar` se monta SIEMPRE (no condicionalmente al abrir el panel), en la misma posición del árbol de componentes, para que no se desmonte al cambiar de pantalla y corte la música.
- Se eliminó el botón "Música" (RoundBtn con panel expandible) y se reemplazó por un ícono de volumen (🔊) que abre un popover chico con un `<input type="range">` (0-100). El valor se aplica llamando `musicBarRef.current.setVolume(v/100)` en un `useEffect`.
- Se eliminó el listener genérico de "primer toque en cualquier parte de la pantalla" (código viejo que ya no tenía sentido con la pantalla de apertura dedicada).

### Verificado
- Flujo completo con archivo MP3 subido: asistente → toggle "Subir archivo" → sube archivo → se guarda con `source_type: upload` → en el juego, tocar "Toca para abrir tu regalo" → `start()` se dispara → sin errores de consola.
- Flujo con YouTube: se probó con un video que SÍ permite embeber (`jNQXAC9IVRw`, "Me at the zoo") — el player de YouTube se crea correctamente (`enablejsapi=1` en el iframe, título del video cargado), sin errores de consola tras tocar "Toca para abrir". **Nota de honestidad:** no se pudo verificar 100% que el AUDIO efectivamente sonó (las herramientas de automoción no pueden verificar audio real de un iframe cross-origin de YouTube), pero el mecanismo (llamar `playVideo()` dentro del gesto de click, vía la IFrame API oficial) es el método documentado y correcto según la documentación de YouTube, y es el mismo patrón que ya existía en el proyecto antes de esta sesión (el usuario mencionó haberlo visto funcionar en un proyecto anterior).
- Barra de volumen: se abrió el popover, se movió el slider, sin errores de consola.
- Se confirmó que el panel viejo con "Cancion de prueba 1/2" ya NO aparece en el juego (`get_page_text` no lo muestra).

### Riesgo conocido / no resuelto
- El autoplay de YouTube dentro del toque de apertura depende de que el video del creador permita embeber — si no, el usuario final no oirá nada (esto ya se comunicaba antes vía `checkYouTubeEmbeddable` en el asistente, sin cambios en esa parte).

---

## #40 — Colores de mueble configurables antes de comprar

### Problema original
Los muebles ya derivaban sus tonos (claro/oscuro) de un color base vía funciones `lit`/`dim` en `roomCatalog.jsx`, y existía un catálogo `FURNITURE_PAINTS` (8 paletas: natural, nogal, blanco, pastel, negro, vino, neon, bosque) — pero nunca se exponía como selector en ningún lado. Todo se renderizaba siempre con `findPaint('natural')` hardcodeado.

### Qué se implementó

**`frontend/src/components/Room.jsx`**:
- `defaultPlacement(kind, refId, posters, customDecor, opts)`: `opts` ahora acepta `paint` (antes hardcodeaba `'natural'`). Se usa al crear el objeto de colocación.

**`frontend/src/components/TamagiftGame.jsx`**:
- `buyFurniture(item, paintId)`: ahora recibe el color elegido y lo guarda en `game.furniturePaint[item.id]` al comprar. El color queda fijo una vez pagado.
- Nuevo componente `FurnitureShopCard`: reemplaza el uso directo de `ShopItemCard` en la pestaña "Muebles" de la tienda. Muestra una fila de 8 swatches circulares (uno por `FURNITURE_PAINTS`, con gradiente `wood`/`cloth`) antes de comprar; la vista previa del mueble se actualiza en vivo según el swatch seleccionado.
- `DecorTrays.addToRoom`: al colocar un mueble, pasa `paint: game.furniturePaint?.[refId] || 'natural'` a `defaultPlacement`.
- El preview de la bandeja "Muebles" (en modo Decorar) también usa `findPaint(game.furniturePaint?.[f.id] || 'natural')` en vez de `'natural'` fijo.

**`frontend/src/gameState.js`**:
- `DEFAULT_GAME_STATE`: se agregó `furniturePaint: {}` (mapa `{ [idMueble]: idColorFURNITURE_PAINTS }`).

### Verificado
- Se dio al pet de prueba 9999 monedas, se entró a Tienda → Muebles, se seleccionó el swatch "negro" para la Camita, se compró. Se confirmó en `localStorage` (`petgift:gamestate:...`) que `furniturePaint: {"cama": "negro"}` quedó guardado y que las monedas se descontaron.
- Se colocó la Camita en el cuarto (modo Decorar) y se confirmó en `localStorage` que el objeto colocado (`game.placed`) tiene `"paint": "negro"`.
- Sin errores de consola en todo el flujo.

---

## #41 — Re-personalización de la mascota por quien la recibe

### Problema original
La mascota que arma quien regala queda fija para siempre — quien la recibe no puede cambiarle el estilo si no le gusta.

### Decisiones de producto (todas tomadas explícitamente por el usuario, en orden)
1. **¿Dónde se guarda el cambio?** → En el backend (no en localStorage del dispositivo), para que sea consistente entre dispositivos — el usuario estuvo de acuerdo con la recomendación dada.
2. **¿Qué pasa con el diseño original?** → Se **conserva siempre**, nunca se pierde. El usuario pidió explícitamente:
   - Que **cueste 1000 monedas** rediseñar (para que no sea trivial/accidental).
   - Un **aviso de confirmación** con texto EXACTO: *"La mascota actual fue diseñada por tu pareja, no te olvides de ella. Siempre podrás volver al diseño que tu pareja te hizo con tanto cariño."*
   - Que el editor se abra **partiendo de la mascota actual** (no en blanco).
   - Que el diseño anterior (el que se reemplaza) se guarde automáticamente como un **póster de recuerdo** gratis, la primera vez que se rediseña.
3. **¿Hay botón para "volver" de verdad, o solo el póster es el recuerdo?** → Botón real: deben existir exactamente **DOS diseños** ("original" y "rediseño", no una cadena de historial infinita) con un botón para alternar entre ellos.

### Qué se implementó

**Backend** (`models.py`, `schemas.py`, `main.py`):
- `Pet` (modelo): nuevas columnas — `recipe_original` (Text, JSON del recipe con el que se creó), `recipe_redesign` (Text nullable), `drawing_normal_redesign`/`drawing_feliz_redesign`/`drawing_enojado_redesign` (Text nullable, los 3 PNG del rediseño), `active_design` (String, default `"original"`).
- Migración ad-hoc para las 6 columnas nuevas en `pets` (mismo patrón que #39).
- `schemas.py`: `PetCreate.recipe_original: Optional[str]`; `PetOut` expone las 6 columnas nuevas; nuevos schemas `RedesignIn` (`recipe: dict`, 3 drawings) y `ActiveDesignIn` (`active_design: str`).
- Dos endpoints nuevos en `main.py`:
  - `POST /api/pets/{slug}/redesign`: guarda el rediseño. Si `pet.recipe_original` está vacío (pets viejos sin este campo), lo rellena con el recipe actual como fallback. **Si es la PRIMERA vez que se rediseña** (`recipe_redesign is None` antes de este llamado), crea automáticamente un `Photo` con `used_for=poster`, `url=pet.drawing_normal` (el original, antes de sobreescribirlo), `caption="El diseño que te hizo tu pareja"`. Luego sobreescribe `recipe_redesign` + 3 drawings, pone `active_design="redesign"`.
  - `POST /api/pets/{slug}/design`: alterna `active_design` entre `"original"`/`"redesign"`. Devuelve 400 si se pide `"redesign"` sin que exista un rediseño. **No cobra nada** — el pago de 1000 monedas ya se validó/descontó en el cliente (el sistema de monedas es 100% local, sin validación server-side, igual que el resto de la tienda).

**Frontend — extracción del editor a componente reusable** (cambio más grande de esta tarea):
- **Nuevo archivo `frontend/src/components/PetDesigner.jsx`**: se movió aquí TODO lo relacionado al editor modular de mascota que antes vivía solo dentro de `TamagiftWizard.jsx`: `ModularPetStep`, `PartPicker`, `ColorPickerRow`, `StylePicker`, `RetouchSection`, `MiniThumb`, `THUMB_VIEW`, `PART_GROUPS`, y un nuevo hook `useDesignerState(initialRecipe)` que encapsula TODO el estado (recipe, retoque a mano con canvas, undo/redo, histories) que antes vivía disperso en el componente raíz del wizard. También expone `buildPngs(px)` — rasteriza recipe+retoques a los 3 PNG finales.
  - Nota de diseño: `getPos`, `CANVAS_SIZE`, `MOODS`, `StepShell`, `Chip` están **duplicados** (copias pequeñas, ~5-15 líneas cada una) entre `PetDesigner.jsx` y `TamagiftWizard.jsx` a propósito — `TamagiftWizard.jsx` los sigue usando para otras cosas (`OutfitDesigner`, `FoodsStep`, etc.), y evitar el import circular entre ambos archivos se consideró más seguro que compartirlos.
- **`TamagiftWizard.jsx`**: se eliminaron las ~310 líneas que se movieron a `PetDesigner.jsx` (líneas 217-527 de la versión pre-cambio) y se reemplazaron por un import. El componente raíz `TamagiftWizard` pasó de tener ~13 variables de estado sueltas (`recipe`, `partGroup`, `histories`, refs de canvas, funciones de dibujo...) a una sola línea: `const designer = useDesignerState(DEFAULT_RECIPE)`. Se actualizaron todos los puntos de uso (`<ModularPetStep {...designer} />`, `OutfitsStep recipe={designer.recipe}`, `SummaryStep histories={designer.histories}`, `handleFinalize` usa `designer.buildPngs()` y `designer.recipe`).
  - `handleFinalize` ahora también manda `recipe_original: JSON.stringify(designer.recipe)` en el payload (antes el recipe nunca se enviaba al backend, solo los PNG ya aplanados).
- **`frontend/src/testSeed.js`**: `buildTestPet()` ahora también incluye `recipe_original: JSON.stringify(recipe)` en el payload de prueba.
- **`frontend/src/api.js`**: `saveLocalPet` (fallback sin backend) copia `recipe_original` y agrega los campos de rediseño en `null`/`'original'`. Nuevas funciones `redesignPetRemote(slug, {...})` y `setActiveDesignRemote(slug, activeDesign)`, mismo patrón try/catch-devuelve-null que `feedPetRemote` ya existente (si el backend no responde, no rompe, solo no persiste).

**Frontend — juego** (`TamagiftGame.jsx`):
- Nuevo tab `'rediseño'` en `ShopScreen` (tienda): card explicando el feature + botón "Rediseñar · 1000 monedas" → abre `RedesignConfirmModal` (con el texto EXACTO pedido) → al confirmar, descuenta 1000 monedas y navega a `screen: 'redesign'`.
- Nueva pantalla `RedesignScreen`: monta `useDesignerState(initialRecipe)` + `<ModularPetStep>`, con botones "Cancelar"/"+ Guardar nuevo diseño". `initialRecipe` es el recipe del diseño ACTIVO actual (original o rediseño previo, lo que esté puesto), parseado de JSON.
- `handleSaveRedesign(recipe, pngs)`: llama `redesignPetRemote`; si el backend responde, reemplaza todo `pet` con la respuesta (que ya trae el póster nuevo en `photos` si era la primera vez — `buildPosterList` ya filtraba por `used_for === 'poster'`, cero cambios necesarios ahí). Si no hay backend, aplica el cambio en memoria como fallback.
- Botón de alternar diseño (🔄) en la barra superior del juego, visible solo si `pet.recipe_redesign` existe. Llama `setActiveDesignRemote` y actualiza `pet.active_design`.
- `drawingFor(mood)`: ahora respeta `pet.active_design` — si es `'redesign'` y existe el drawing correspondiente, lo usa; si no, cae al original. La ropa equipada sigue ganando por encima de cualquiera de los dos (sin cambios en esa prioridad).

### Verificado (flujo completo end-to-end contra el backend real)
1. Creación de pet de prueba con `recipe_original` real → confirmado en la API (`curl`) que llega y se guarda.
2. En el juego: Tienda → tab "Rediseño" → botón "Rediseñar · 1000 monedas" → modal con el texto EXACTO acordado → confirmar → editor abre **precargado** con la mascota actual (no en blanco) → se cambió el estilo a "Gótico" → "Guardar nuevo diseño".
3. Confirmado en la API: `active_design: "redesign"`, `recipe_redesign` presente, `drawing_normal_redesign` presente, **y un nuevo `Photo` con `caption: "El diseño que te hizo tu pareja"` y `used_for: "poster"`** — el póster de recuerdo se creó automáticamente.
4. Botón 🔄 alternar: confirmado en la API que `active_design` cambia a `"original"` y de vuelta.
5. Sin errores de consola en ningún paso.
6. **Regresión del wizard**: se verificó manualmente que el paso "Dibujar" del asistente original (clave de prueba `test`, y también el flujo manual paso a paso) sigue funcionando idéntico después de la extracción a `PetDesigner.jsx` — se completaron los pasos Inicio→Nombres→Dibujar (incluyendo seleccionar un estilo "Gótico") sin errores de consola.

---

## #42 — Arquitectura actualizable (agregar contenido después sin romper mascotas viejas)

### Investigación previa (sin cambios de código, solo diagnóstico)
Se usó un agente de exploración para auditar: catálogos declarativos, referencias por id vs. índice, y tolerancia a ids desconocidos. Hallazgos:
- **Todos los catálogos** (`FURNITURE`, `WALL_STYLES`, `FLOOR_STYLES`, `FURNITURE_PAINTS`, `DECOR_CATALOG`, `PET_STYLES`, partes/accesorios de mascota) **ya usaban ids estables tipo string**, no posición. Nada que arreglar ahí.
- **Bug real encontrado**: `game.ownedOutfits` y `game.equippedOutfit` guardaban el **índice** del array `pet.outfits`, no un id estable. Si en el futuro se reordenara o borrara una prenda de una mascota ya creada, la ropa comprada/equipada apuntaría a la prenda equivocada (o a `undefined`).
- `findFurniture`/`findDecor` devuelven `null` si el id no existe y TODO el código llamador ya lo verificaba (`.filter(Boolean)`, `if (!x) return null`) — sin riesgo de crash. `findWall`/`findFloor`/`findPaint` nunca devuelven `null` (fallback silencioso al primer elemento del catálogo) — no crashea, pero es un comportamiento a tener presente.
- El versionado de `gameState.js` era un solo `if` puntual (migración de `placedDecor` a `placed`), sin número de versión ni cadena de migraciones.
- Los minijuegos NO tienen ninguna dependencia con `gameState` persistido — se referencian solo por un string de pantalla en memoria de React, nunca guardado en localStorage. Agregar un minijuego nuevo no requiere ningún cambio de arquitectura (esto se le informó al usuario, no se "arregló" nada porque no había nada roto).

### Qué se implementó

**`frontend/src/gameState.js`** — sistema de versionado formal:
- Nueva constante `CURRENT_GAME_VERSION = 1`.
- `DEFAULT_GAME_STATE.version = CURRENT_GAME_VERSION`.
- La migración vieja (`placedDecor` → `placed`) se formalizó como `MIGRATIONS[0]` dentro de un objeto `MIGRATIONS = { 0: (state) => {...} }`.
- Nueva función `migrate(state)`: lee `state.version || 0` y aplica `MIGRATIONS[v]`, `MIGRATIONS[v+1]`, ... en cadena hasta llegar a `CURRENT_GAME_VERSION`, seteando `state.version` al final. Agregar contenido nuevo (minijuegos, muebles, estilos) **no toca este sistema en absoluto** — solo hace falta un paso nuevo en `MIGRATIONS` si el FORMATO de los datos guardados cambia de verdad.

**Backend** (`schemas.py`) — ropa por id estable:
- Nuevo schema `OutfitOut(OutfitIn)` con `id: int` (mismo patrón que `DecorItemOut`, que ya existía). `PetOut.outfits: List[OutfitOut]` (antes `List[OutfitIn]`, que no traía id).

**Frontend** (`api.js`, `TamagiftGame.jsx`) — ropa por id estable:
- `api.js` `saveLocalPet`: los outfits del fallback local ahora reciben un id estable (`o.id != null ? o.id : 'local-outfit-' + i`), mismo patrón ya usado para `decor_items`.
- `TamagiftGame.jsx`: `buyOutfit(outfit)` (antes `buyOutfit(idx, outfit)`) guarda `outfit.id` en `ownedOutfits`. `toggleEquipOutfit(id)` (antes recibía `idx`). La pestaña "Ropa" de la tienda itera `outfits.map((o) => ...)` (sin índice) comparando por `o.id`. `activeOutfit` se busca con `outfits.find((o) => o.id === game.equippedOutfit)` en vez de `outfits[game.equippedOutfit]`.

### Verificado
- Backend: `curl` creando un pet con un outfit → confirmado que la respuesta trae `"id": 2` (id real de la fila, no la posición).
- Juego: se dieron 9999 monedas, se compró la prenda "Gorrito" desde la tienda, se confirmó en `localStorage` que `ownedOutfits: [2]` (el id real, no `[0]`). Se equipó ("Poner") y se confirmó `equippedOutfit: 2`.
- Se confirmó `version: 1` en el `gameState` guardado tras cualquier operación.
- Sin errores de consola.

---

## #43 — Verificar que la decoración subida en el asistente aparece de verdad en la tienda

### Naturaleza de la tarea
Era una tarea de **verificación**, no de código — el tracker decía que la API ya soportaba esto (probado con llamadas directas) pero nunca se había probado el flujo real desde la interfaz del asistente.

### Qué se hizo
Se ejecutó el flujo completo real en el navegador (sin atajos de API):
1. Asistente: se llenó el nombre, se pasó por "Dibujar" (verificando de paso que la extracción de #41 no rompió nada), se subieron 6 fotos (3 marcadas Póster, 3 Rompecabezas, cumpliendo el mínimo del paso "Fotos"), se avanzó a "Objetos para su cuarto".
2. Se subió una imagen real, se usó la herramienta de recorte de fondo (`BgRemover.jsx`, sin tocar la varita mágica — se usó "Usar esta imagen" tal cual para simplificar la prueba, ya que el objetivo era probar el flujo de guardado, no la herramienta de recorte en sí, que no se tocó en esta sesión), se le puso nombre "Disco de vinilo" y precio 80, se guardó.
3. Se finalizó la creación del regalo (`🎁 Finalizar y crear el link`).
4. Se confirmó en el backend (`curl`) que el `decor_item` llegó con la imagen real recortada.
5. Se entró al juego con ese pet, se abrió Tienda → tab "Deco", y se confirmó que **"Disco de vinilo · 80 monedas"** aparece bajo el encabezado "Cosas que eligió quien te regaló esto".
6. Se completó el círculo: se compró el objeto, se confirmó en `localStorage` (`ownedDecor: [22]`, id real del backend), se colocó en el cuarto vía modo "Decorar", se confirmó en `localStorage` que quedó con `refId: 22`.

### Resultado
No se encontró ningún bug — el flujo ya funcionaba correctamente de punta a punta. No hubo cambios de código en esta tarea.

---

## #44 — Los pósters deben comprarse (antes estaban gratis)

### Problema original
Las fotos marcadas "póster" en el asistente quedaban disponibles gratis para colocar en el cuarto, sin pasar por la tienda.

### Qué se implementó

**Backend** (`models.py`, `schemas.py`, `main.py`):
- `Photo` (modelo): nueva columna `price` (Integer, default 0). Comentario en el código aclara: 0 = gratis, así que pets creados ANTES de este cambio (que no mandan precio) quedan gratis automáticamente en vez de romperse.
- `schemas.py`: `PhotoIn.price: int = 0`. Nuevo `PhotoOut(PhotoIn)` con `id: int` (mismo patrón que `OutfitOut`/`DecorItemOut` — id estable, no posición). `PetOut.photos: List[PhotoOut]` (antes `List[PhotoIn]`, sin id).
- Migración ad-hoc para la columna `price` en `photos`. `create_pet` guarda `price=ph.price`.

**Frontend — asistente** (`TamagiftWizard.jsx`, `PhotosStep`):
- Nueva constante `DEFAULT_POSTER_PRICE = 50`.
- Cada foto nueva se crea con `price: DEFAULT_POSTER_PRICE`. Cuando una foto se marca "Póster" (no cuando es "Rompecabezas" — esas nunca se compran), aparece un input numérico de precio junto a los chips, con una pista de cuántas partidas de minijuego representa ese precio (ver siguiente sección, compartida con #38).
- `handleFinalize`: el payload de fotos ahora manda `price: p.used_for === 'poster' ? (p.price ?? DEFAULT_POSTER_PRICE) : 0`.

**Frontend — juego** (`TamagiftGame.jsx`):
- `buildPosterList(pet)`: antes generaba ids sintéticos por posición (`'poster-' + i`) — ahora usa el `id` REAL del backend (`p.id`), y agrega `price: p.price || 0` a cada póster. `DEMO_POSTERS` (fallback sin backend) también declara `price: 0` explícito.
- Nueva pestaña "Pósters" en `ShopScreen` (primera de la lista de tabs). Muestra cada póster con su imagen, precio, y botón Comprar/"En tu colección". Nueva función `buyPoster(p)`.
- `DecorTrays` (bandeja de colocación en modo "Decorar"): la pestaña "Pósters" ahora filtra `posters.filter((p) => !p.price || game.ownedPosters?.includes(p.id))` — solo se pueden colocar los que son gratis (price 0/undefined, compatibilidad con pets viejos) o los ya comprados. Mensaje vacío actualizado a "Compra pósters en la tienda para colgarlos".
- `ShopScreen` recibe una nueva prop `posters` (pasada desde el componente raíz como `buildPosterList(pet)`).

**`frontend/src/gameState.js`**: `DEFAULT_GAME_STATE.ownedPosters: []` (ids de pósters comprados). No requirió incrementar `CURRENT_GAME_VERSION` — es un campo puramente aditivo con default seguro vía el spread `{...DEFAULT_GAME_STATE, ...JSON.parse(raw)}` en `loadGameState`, no un cambio de formato que necesite transformar datos viejos.

### Verificado
- Backend: `curl` confirmó que `photos[].price` llega y se guarda (3 pósters de prueba a 45 monedas cada uno vía `testSeed.js` actualizado).
- Juego: se confirmó que la bandeja de "Decorar" → "Pósters" muestra el mensaje "Compra pósters en la tienda para colgarlos" (ya no están gratis). Se fue a Tienda → Pósters, se vieron los 3 a 45 monedas, se compró uno. Se confirmó en `localStorage`: `ownedPosters: [111]` (id real), monedas descontadas (9999→9954). Se volvió a la bandeja de Decorar y se confirmó que **solo 1** de los 3 pósters aparece disponible para colocar (el comprado). Se colocó, y se confirmó `refId: 111` en `game.placed`.
- Sin errores de consola en todo el flujo.

---

## #38 — Recompensas de minijuegos + recomendaciones de precio

### Decisión de producto (el usuario redirigió el enfoque inicial)
Se preguntó inicialmente si las monedas por minijuego debían ser configurables en el asistente. El usuario respondió explícitamente que **NO**: deben quedar **fijas en código**, pero pidió que se **piense bien el balance** de cada recompensa junto a su bono por desempeño, y que en el asistente aparezcan **recomendaciones de precio** para lo que el creador va poniendo a la venta (ropa, decoración, pósters), basadas en cuánto se gana jugando.

### Investigación previa (agente de exploración, sin cambios de código)
Se auditaron los rangos reales de las 7 fórmulas de recompensa contra el comportamiento real de cada minijuego (duración, dificultad, qué incrementa el puntaje). Hallazgo clave: **las fórmulas viejas eran muy inconsistentes entre sí** — desde ~15 monedas (Rompecabezas, casi siempre en el piso) hasta 200-360+ monedas (Serpiente y "Cruzar la calle"). **Bug real encontrado:** "Cruzar la calle" no tenía límite de tiempo ni penalización por chocar — el jugador podía cruzar indefinidamente antes de "cobrar", permitiendo farmear monedas sin límite (`crossings * 12`, sin tope).

### Qué se implementó

**`frontend/src/components/TamagiftGame.jsx`** — las 7 funciones `completeX`:

| Minijuego | Fórmula vieja | Fórmula nueva | Rango normal (nuevo) | Rango excelente (nuevo, con tope) |
|---|---|---|---|---|
| Memoria | `max(10, 30-moves)` | `min(40, max(12, 42-moves))` | ~22-28 | ~32-35 |
| Atrapar comida | `min(50, score*2)` | `min(45, round(score*1.6))` | ~16-24 | ~35-45 |
| Rompecabezas | `max(15, 40-moves)` (casi siempre en el piso) | `min(55, max(18, 85-moves))` | ~18-45 | ~55 (tope) |
| Golpea al topo | `score*4` (sin tope, 48-120) | `min(45, round(score*1.5))` | ~18-27 | ~36-45 |
| Serpiente | `score*5` (sin tope, 40-200) | `min(50, score*2)` | ~16-30 | 50 (tope) |
| Cruzar la calle | `crossings*12` (**sin tope, exploit**, 48-360+) | `min(50, crossings*5)` | ~20-40 | 50 (tope, alcanzable en solo 10 cruces) |
| Torre | `score*6` (sin tope, 48-240) | `min(45, score*2)` | ~16-30 | 45 (tope) |

Objetivo de diseño: juego normal en cualquier minijuego da ~18-30 monedas; juego excelente tiene un tope consistente ~40-55 en todos, para que ningún minijuego sea objetivamente "el mejor para farmear" y para cerrar el exploit de Cruzar la calle.

**`frontend/src/components/TamagiftWizard.jsx`** — recomendaciones de precio:
- Nuevas constantes `COINS_PER_GAME_MIN = 18`, `COINS_PER_GAME_MAX = 30` (calibradas contra el rango "normal" de las fórmulas nuevas de arriba).
- Nueva función `gamesForPrice(price)` y componente `<PriceHint price={...} />`: calculan cuántas partidas de minijuego equivalen a un precio dado, y lo muestran como texto de ayuda ("💡 Con los minijuegos se ganan 18-30 monedas por partida — a este precio equivale a ~X partidas de minijuego").
- `<PriceHint>` se agregó en los TRES lugares donde el creador define un precio: precio de prenda (`OutfitDesigner`), precio de objeto decorativo (`DecorStep`), y precio de póster (`PhotosStep`, versión compacta inline `(~X partidas)` por espacio).

### Verificado
- Se navegó el asistente hasta el paso "Fotos" (subiendo 6 fotos, 3 marcadas póster) y se confirmó visualmente el texto `(~2-3 partidas)` junto al precio de cada póster (precio sugerido 50 monedas).
- Se navegó hasta el paso "Deco", se subió un objeto, y se confirmó el texto completo: *"💡 Con los minijuegos se ganan 18-30 monedas por partida — a este precio equivale a ~3-5 partidas de minijuego."* (para el precio por defecto de 80 monedas).
- Sin errores de consola.
- **No verificado en esta sesión:** jugar cada uno de los 7 minijuegos hasta el final para confirmar en vivo el monto exacto de monedas otorgado (se verificó por lectura de código y cálculo manual contra los rangos reportados por el agente de exploración, no jugando cada minijuego de punta a punta en el navegador).

---

## #45 — Preparación para despliegue a producción

### Decisiones de producto (tomadas explícitamente por el usuario)
1. Backend + base de datos persistente: **Railway** (Postgres administrado).
2. Imágenes (dibujos/fotos/objetos, hoy base64 dentro de la fila): **se quedan así por ahora**, no se migran a S3/R2 para este lanzamiento — decisión explícita para no bloquear el lanzamiento con más cuentas/credenciales, con la optimización documentada como pendiente futura (ya estaba anotada en un comentario de `models.py` desde antes de esta sesión).
3. Frontend: **Netlify** (ya contemplado en comentarios de CORS del código antes de esta sesión).

### Qué se implementó
- **`backend/Procfile`** (archivo nuevo): `web: uvicorn main:app --host 0.0.0.0 --port $PORT` — comando de arranque que Railway detecta automáticamente.
- **`backend/render.yaml` — eliminado**: existía de una preparación previa para Render (proveedor descartado en favor de Railway). Se quitó para no dejar configuración desactualizada/confusa en el repo. Su contenido (documentado en el historial de esta conversación, recuperable si hiciera falta) era equivalente a lo que ahora hace Railway automáticamente al detectar el `Procfile` + agregar un plugin de Postgres.
- **`backend/DEPLOY.md` — reescrito completo**: la versión anterior era de una sesión previa a esta (mencionaba `petgift_backend/` y `tamagift-frontend.zip`, nombres de carpeta que ya no existen — el proyecto se reorganizó a `tamagift/backend` y `tamagift/frontend`) y apuntaba a Render en vez de Railway. La nueva versión documenta paso a paso: desplegar el backend en Railway (con Postgres administrado enlazado automáticamente), generar el lote de llaves de acceso REAL apuntando al `DATABASE_URL` de Railway (las 300 llaves ya generadas en `llaves-lote-inicial.csv` están en la base SQLite LOCAL, no sirven para producción — hay que generar un lote nuevo), desplegar el frontend en Netlify, y conectar `ALLOWED_ORIGINS`/`VITE_API_BASE` entre ambos.
- **Verificación de que el código ya estaba listo para esto sin cambios adicionales** (revisado, no modificado):
  - `backend/database.py`: ya soporta `DATABASE_URL` de Postgres vía variable de entorno, con conversión automática de `postgres://` a `postgresql://` (necesaria porque algunos proveedores como Railway/Heroku dan la URL con el prefijo viejo).
  - `backend/requirements.txt`: ya incluye `psycopg2-binary` (driver de Postgres).
  - `backend/main.py`: `REQUIRE_ACCESS_KEY` ya default a `True` (requerido) salvo que se setee explícitamente `REQUIRE_ACCESS_KEY=0` — seguro por defecto, solo hace falta NO desactivarlo en producción (documentado en `DEPLOY.md` como variable explícita de todos modos, para que quede visible en el panel de Railway). `ALLOWED_ORIGINS` ya es configurable por variable de entorno.
  - `backend/main.py`: las migraciones ad-hoc de columnas nuevas (`ALTER TABLE...`) están correctamente restringidas a `if database.DATABASE_URL.startswith("sqlite")` — en Postgres (producción), la base nace vacía y `models.Base.metadata.create_all()` ya crea las tablas con TODAS las columnas actuales, así que esas migraciones no aplican ni hacen falta ahí.
  - `frontend/netlify.toml`: ya tenía el comando de build, carpeta de publicación, y el redirect SPA necesario para que `/p/{slug}` funcione al abrirse directo (no solo navegando desde adentro de la app) — no requirió cambios.
  - `frontend/src/api.js`: `API_BASE` ya lee `VITE_API_BASE` con fallback a `localhost:8000` — no requirió cambios.
- Se verificó que el backend sigue compilando (`python -m py_compile`) tras estos cambios.

### Verificado
- Sintaxis de todos los archivos Python (`py_compile`), sin errores.
- Revisión de código confirmando que las piezas de configuración (CORS, `DATABASE_URL`, `REQUIRE_ACCESS_KEY`) ya eran seguras/correctas para producción sin cambios adicionales.

### Explícitamente NO hecho en esta sesión (requiere acción directa del usuario, no delegable)
- **No se creó ninguna cuenta ni se desplegó nada de verdad** en Railway ni Netlify — eso requiere las credenciales/cuentas del usuario. `DEPLOY.md` deja los pasos exactos para que el usuario (o quien lo asista) los ejecute.
- **No se generó el lote de llaves de producción** — depende de tener primero el `DATABASE_URL` real de Railway, que no existe hasta que el usuario cree el proyecto ahí.
- **No se probó nada en un celular físico** — no hay forma de hacerlo desde este entorno. `DEPLOY.md` señala específicamente qué probar primero en el celular una vez desplegado: la pantalla de apertura (gesto que desbloquea audio), el editor de retoque a mano (canvas táctil), y el recorte de fondo de objetos (`BgRemover.jsx`) — son las tres piezas más dependientes de un dispositivo táctil real y menos cubiertas por la simulación de touch de las pruebas automatizadas de esta sesión.
- **No se probó el backend contra un Postgres real** (solo se revisó que el código lo soporta) — toda la verificación de esta sesión corrió contra SQLite local.

---

## Minijuegos — revisión y reconstrucción (sesión de continuación)

Ver `PLAN_MINIJUEGOS.md` para el diagnóstico completo, las ideas evaluadas
(incluidas las descartadas y por qué) y el estado detallado. Resumen de lo que
cambió en el código:

### Diagnóstico
Los 7 minijuegos estaban bien programados pero les faltaba todo lo que hace que
un juego móvil enganche: **ningún récord se guardaba** (el `best` de Cruzar la
calle vivía en estado del componente y se borraba al salir), no había nada que
premiara volver al día siguiente, repetir costaba 3 toques, casi ninguno subía
de dificultad, y "Atrapar"/"Cruzar" no tenían forma de perder. Además, **las
frases y los nombres que configura quien regala no se usaban en ningún juego**.

### Sistemas nuevos (afectan a los 10 juegos)
- `gameState.js`: `records`, `lastPlayedDay`, `streak` + helpers `registerPlay`,
  `isDailyBonusReady`, `isNewRecord`, `todayKey`. `LOWER_IS_BETTER` distingue los
  juegos donde menos movimientos es mejor (memoria, rompecabezas).
- `TamagiftGame.jsx`: `GAME_META` centraliza título/fórmula de monedas/amor de cada
  juego (antes había 7 funciones `complete*` casi idénticas con las fórmulas
  sueltas). `GameResult` es una pantalla de resultado única con récord, "¡NUEVO
  RÉCORD!", monedas, bonus del día y **"Jugar otra vez"** (remonta vía `key={replayKey}`).
- Bonus diario x2 en la primera partida de cada juego cada día, con badge "x2 hoy"
  en el menú para que se vea qué falta cobrar.
- `GAME_LIST` declarativo: agregar un juego es una línea + su pantalla.

### Juegos nuevos
- **Trivia del corazón** — preguntas armadas con sus comidas, sus frases y los
  nombres; al acertar una comida muestra la reacción que él escribió.
- **Simón dice** — secuencia creciente, acelera con la longitud.
- **Salta y vuela** — estilo flappy; física en `flyPhysics.js`.
- **Conecta 3 golosinas** — match-3 usando SUS comidas como fichas; lógica en `match3.js`.

### Arreglos a los existentes
Serpiente (acelera + deslizar + arreglo de un bug que recreaba el intervalo en
cada comida), Topos (acelera), Atrapar (3 vidas + acelera + arrastrar el dedo),
Cruzar (3 vidas reales + carros que aceleran; antes era imposible perder).

### Verificación
- Probados jugando en el navegador: Trivia, Simón, Conecta 3, y todo el sistema
  de récords/bonus/repetir.
- **No verificables en este entorno**: los juegos con `requestAnimationFrame`
  (Salta y vuela, Cruzar, Torre) porque el panel no pinta cuadros — medido: 0
  frames en 600 ms. Para cubrirlos, la lógica se extrajo a módulos puros con
  **24 pruebas** (`node src/flyPhysics.test.mjs`, `node src/match3.test.mjs`),
  que encontraron 2 bugs reales: una cascada infinita que colgaba la pestaña y
  una aceleración que nunca se aplicaba.
- Falta probar en celular físico (los controles por deslizamiento sobre todo).

---

## Mochis y dibujo nativo por estilo

Pedido: los estilos se veían "pasados por un filtro" (el pixel art era
una imagen achicada), los accesorios no calzaban (gorros muy arriba o
muy abajo, collares que no abrazaban) y la guitarra tenía mal las
medidas. Además las mascotas pasan a ser **mochis** con varios anchos.

- **Motor de kits** (`frontend/src/art/kit.js`): el arte se escribe como
  SVG con partes (`data-r`: body, part, flat, line, shine, tone) y cada
  estilo dibuja cada parte a su manera. Pixel arma la rejilla pieza por
  pieza (rampas de color, contorno de 1 px, sombra en media luna) y usa
  caras hechas a mano (`art/pixelStamps.js`); papel recorta cartulina;
  neón enciende tubos; retro corre la tinta y trama las sombras; lo-fi
  pone luz de lámpara y grano; sticker contorno suave y borde blanco.
  Las fotos y dibujos subidos siguen por el motor de imágenes.
- **Mochi** (`frontend/src/art/mochi/`): 4 anchos, 19 animalitos, 10 ojos,
  9 bocas, 6 ánimos, 7 mejillas, 8 colas, 13 estampados y 46 accesorios,
  todos anclados a la geometría del cuerpo. Las recetas viejas y los 14
  estilos de partida siguen sirviendo.
- **El juego dibuja desde la receta** (`petLook.js`, `components/PetArt.jsx`):
  cuarto, baño, apertura, minijuegos, tienda y selector de estilo. Los
  retoques a mano viajan dentro de la receta (`overlays`); los PNG quedan
  de respaldo.
- **Trajes**: el diseñador de prendas ahora elige accesorios (cabeza,
  cuello, cara) y además se puede dibujar encima. Se guarda la receta del
  traje (`outfits.recipe`, columna nueva).
- **Backend**: `recipe_original` admite hasta 3 MB (por los retoques),
  `RedesignIn` valida el tamaño, `outfits.recipe` nueva.
- **Cuarto**: guitarra redibujada con proporciones reales; trazos tenues
  de pisos y paredes ya no se vuelven líneas sólidas; neón no "enciende"
  paredes oscuras.
- **Pruebas**: `node src/mochi.test.mjs` (más de 2000 combinaciones sin
  coordenadas rotas, recetas viejas, estilos de partida).
- **Revisión**: `/arte` (laboratorio de kits), `/hoja`, `/aleatorio`,
  `/dev/<pantalla>?estilo=<id>`.

## Cuarto, muebles, decoración y tienda rehechos desde cero

Pedido: rehacer todos los muebles y cuartos (las pesas, el baúl, la
guitarra, el escritorio y el espejo estaban mal dibujados), con una
perspectiva que tenga sentido, más variedad y más opciones de
personalización en la tienda (pintura de muebles, colores de pared y
piso), en todos los estilos; rehacer la decoración; que se vea de
estudio profesional.

- **Una sola perspectiva para todo** (`frontend/src/art/room/draw.js`):
  vista 3/4 sin punto de fuga. Cada mueble muestra su frente y su tapa
  (la mitad de su fondo), sin costados ni trapecios; lo redondo es una
  elipse el doble de ancha que alta; la luz viene de arriba a la
  izquierda. Herramientas comunes: `box`, `cylinder`, `pot`, `legs`,
  `tube` (tubos que siguen una curva), `hollow` (interiores), `mat`
  (frente, tapa y brillo de un color).
- **Paredes** (`art/room/walls.js`): 17 diseños (liso, rayas, lunares,
  flores, vichy, corazones, estrellas, zócalo, ladrillo, tablas,
  azulejos, piedra, ondas, nubes, hojas, damasco, rejilla), cada uno con
  varios colores. **Pisos** (`art/room/floors.js`): 9 diseños (tablas,
  espiga, ajedrez, baldosa, hidráulico, alfombrado, losas, mármol,
  rejilla). Las tablas y baldosas van en la misma vista que los muebles
  (las líneas hacia el fondo son verticales). Se guarda
  `"diseño.color"`; los ids viejos se traducen solos.
- **46 muebles** en 8 categorías (`art/room/furniture/`): camas,
  asientos, mesas y guardado, música y juegos, plantas, luces,
  alfombras y cosas para la pared. **14 pinturas** para cada uno
  (madera, tela y detalle). Se ven 1.25× para que la mochi quepa en la
  cama y el sofá. Las alfombras van en el suelo, debajo de todo.
- **19 piezas de decoración** (`art/room/decor.js`); las que van
  "encima" (lámpara de mesa, velas, taza…) se pueden poner sobre
  cualquier mueble.
- **Pósters** con marco dibujado y pintable; la foto va adentro.
- **Margen bajo los dibujos** (`FOOT`): sombras y bases redondas ya no se
  cortan en el borde; el cuarto lo descuenta para que todo siga apoyado.
- **Tienda**: categorías de muebles, pintura antes y después de comprar,
  colores de pared y piso, y una pestaña nueva de **accesorios** para la
  mochi (cabeza, cuello y cara, con 12 colores) que se ven en el cuarto,
  en el baño y en los juegos.
- **Baño** redibujado en la misma vista, en tres capas (la mascota queda
  dentro de la tina).
- **Lo-fi**: las fotos (pósters, cartas) ya no se oscurecen de más.
- **Pruebas**: `node src/room.test.mjs` (cada pared, piso, mueble y
  pintura da un SVG sano; ids viejos; tamaños que calzan con el dibujo).
- **Revisión**: `/arte` (cuartos armados, paredes, colores, pisos,
  muebles por categoría, decoración), `/arte?set=muebles3&cat=<categoría>`
  (cada mueble en un rincón con una mochi al lado para la escala),
  `set=paredes2`, `set=pisos2`, `set=deco`.

## Mundo vivo, vestidor y minijuegos con progreso

Pedido: más rasgos para las mochis; accesorios básicos y montones más
en la tienda (ropa, estilos, accesorios, colores), pensados sobre todo
para chicas; decoración que refleje la personalidad (aesthetic, otaku,
kawaii…); que al comprar suene el timbre y se recoja la caja en la
puerta; pintar la pared y poner baldosas con el dedo; un mundo vivo
(día y noche, sucesos, consecuencias como engordar con chatarra);
minijuegos que den ganas de volver; rehacer la comida y los íconos
(sobre todo en pixel art). El plan completo está en
`DISENO_MUNDO_VIVO.md`.

- **Rasgos de la mochi** (`art/mochi/hair.js`, `marks.js`, `face.js`,
  `ears.js`, `tails.js`): 14 peinados con 16 colores, cejas, marcas de
  nacimiento, 8 animalitos nuevos (ajolote, capibara, ardilla, hámster,
  león, vaca, cervatillo, abeja), 6 ojos, 5 bocas, 3 mejillas, 4 colas y
  5 estampados, cada uno con sus píxeles hechos a mano.
- **Vestidor** (`art/mochi/wardrobe/`, `wardrobeState.js`,
  `components/game/Fashion.jsx`): 132 cosas en 6 ranuras (cabeza, cara,
  cuello, ropa, espalda, en la mano), cada una con 1-2 colores teñibles.
  Tienda con Moda (por ranura) y
  Peluquería; pantalla Vestir en el dock; kit inicial gratis.
- **Decoración con personalidad** (`art/room/decorVibes.js`,
  `furniture/vibes.js`): 42 adornos y 18 muebles nuevos para muchos
  gustos, casi todos pintables, sin etiquetas de "tipo de persona".
- **Pedidos** (`deliveries.js`, `components/game/Delivery.jsx`,
  `art/room/door.js`): lo comprado queda en camino; al volver al cuarto
  suena el timbre, la mochi corre a la puerta y aparece la caja; al
  abrirla sale cada cosa con su botón.
- **Obra con el dedo** (`components/PaintJob.jsx`): rodillo que pinta la
  pared por franjas y baldosas que caen en su cuadrícula.
- **Mundo vivo** (`world.js`, `worldEvents.js`,
  `components/WorldLayer.jsx`, `components/game/WorldEvents.jsx`):
  hora y clima reales, interruptor de la luz y sueño, energía, limpieza
  y peso con consecuencias visibles, nevera y Súper, y sucesos (regalo
  del día, carta de quien regaló, antojos, bichitos, monedas, hipo,
  migas, visitas).
- **Comida e íconos** (`art/food.js`, `art/ui.js`, `art/pixel/`): 36
  comidas dibujadas de nuevo con pixel art hecho a mano en 16×16 y
  24×24; íconos de interfaz en 16×16 píxel a píxel; topo, guitarra,
  moneda y estrella arreglados.
- **Minijuegos** (`gameProgress.js`, `match3.js`, `cooking.js`,
  `components/game/CookingGame.jsx`): niveles con estrellas y rangos,
  reto del día por juego, Conecta 3 con 30 niveles y golosinas
  especiales, Memoria y Rompecabezas por niveles, Cocina con 12 recetas
  por gestos, y los arcade con poderes, monedas y dificultad creciente.
- **Pruebas**: `world.test.mjs`, `gameProgress.test.mjs`,
  `cooking.test.mjs` nuevas; `match3`, `flyPhysics`, `mochi`, `room` y
  `towerLogic` siguen pasando.
- **Desarrollo**: `/dev/main?hora=22&clima=lluvia&suceso=visita`,
  `?obra=piso.ajedrez.clasico`, `/arte?set=pelo|vestidor&slot=ropa|…`,
  `/iconos?estilo=pixel`.

## Pixel art con más detalle y arreglos de la tienda

- **Resolución**: el píxel de arte pasa de 3 a 2 px de pantalla (la
  mochi del cuarto tiene ~100 px de ancho en vez de ~70) y en miniaturas
  la mochi siempre tiene al menos ~72 px. Ojos, bocas y mejillas grandes
  hechos píxel a píxel (`art/mochi/bigFace.js`): ojos con contorno,
  color, brillo y ánimos legibles; bocas con trazo conectado (la "w" ya
  no se ve como puntitos).
- **Tienda y vestidor**: las vistas previas muestran la mochi entera (la
  cola ya no se corta); sin etiquetas de estilo (coquette, otaku…): la
  ropa se ordena por dónde va y la deco por si va en mesas o en el piso.
- **Obra**: al pintar la pared, los muebles quedan delante de la pintura
  (antes se veían transparentes y parecía pintura encima).

## Partida en el servidor, guía de bienvenida y legibilidad

- **La partida ya no vive solo en el celular.** Monedas, compras, cuarto,
  vestidor y récords se copian al servidor (tabla `game_saves`, una fila
  por mascota; `GET/POST /api/pets/{slug}/save`). Si quien recibe cambia
  de teléfono o borra los datos del navegador, al abrir el link recupera
  todo.
  - `frontend/src/cloudSave.js` decide cuándo mandar (como mucho cada
    30 s mientras se juega y siempre al esconder o cerrar la pestaña) y
    cuál gana si hay dos dispositivos: el servidor numera cada guardado
    (`rev`) y no pisa una versión que el dispositivo no conocía; entre
    dos partidas con cambios gana el último cambio hecho a mano. Lo que
    cambia con la pestaña escondida (solo bajan las barras) no cuenta:
    un celular olvidado con el juego abierto no pisa lo jugado en otro.
  - Se manda como texto plano (sin consulta previa de CORS) para que
    salga también con `keepalive` al cerrar la pestaña.
  - Pruebas: `backend/test_save.py` (contra una base temporal) y
    `frontend/src/cloudSave.test.mjs` (9 casos: celular nuevo, partida
    vieja que se sube sola, dos celulares, choques, sin conexión…).
- **Guía de bienvenida** (`components/game/Tutorial.jsx`): al abrir el
  regalo la mascota se presenta y enseña las barras, a darle de comer
  (espera a que lo haga), los juegos, la tienda y la noche, iluminando
  cada cosa. Se puede saltar; al terminar regala 50 monedas. Quien ya
  venía jugando no la ve (migración 2 → 3 de la partida).
- **Cuarto inicial**: un regalo nuevo ya no llega a un cuarto vacío;
  trae ventana, camita, alfombra y planta (se pueden mover o guardar).
- **La mochi más grande en los minijuegos** donde era una manchita:
  Salta y vuela (y su tablero ocupa el ancho del celular), Cruzar la
  calle y la cabeza de la Serpiente.
- **Textos**: los que medían 8,5–10 px suben a 10,5–11,5; los nombres de
  comida usan dos líneas en vez de cortarse ("Pastel de chocolate"); en
  neón el dock ya no corta "Alimentar"; la mascota "se siente tranquila"
  (el resto de los textos ya la trataban en femenino).

## Halloween

Del 1 al 31 de octubre (fecha del teléfono; `seasons.js`). Lo de
temporada solo se compra esos días; lo comprado queda para siempre en el
vestidor y en la decoración.

- **Tienda**: mientras dura, la primera pestaña es "Halloween", con la
  cuenta regresiva ("Quedan 10 días", "¡Último día!"), los disfraces y la
  decoración. Fuera de temporada esa pestaña no aparece y esas cosas no
  salen en Moda ni en Deco. Un puntito naranja en el botón de la tienda
  avisa que hay temporada, y la mascota lo cuenta una vez al llegar.
- **Disfraces y accesorios** (14): calabacita en la cabeza, diadema de
  murciélago, sombrero de bruja con estrellas, antifaz de murciélago,
  colmillitos de vampiro, collar de calabacitas, disfraz de calabaza,
  disfraz de fantasmita (la sábana también tapa la cabeza), vestido de
  brujita, pijama de esqueleto, capa de vampiro, cubeta de dulces,
  escobita y piruleta embrujada. Se tiñen con una paleta de Halloween
  (naranja, morado, negro…) seguida de los tonos de siempre.
- **Decoración** (10): calabaza sonriente que brilla, montón de
  calabazas, guirnalda de murciélagos, telaraña con arañita, fantasmita
  de peluche, caldero de dulces, farolito embrujado, gatito negro de
  peluche, banderín y escoba de bruja. Tiernas antes que tenebrosas.
- **Sucesos**: una vez al día suena el timbre y llega una amiga
  disfrazada con su cubeta: "¡Dulce o truco!". Darle un dulce saca uno de
  la nevera (o cuesta 10 monedas) y deja caramelos o, a veces, una deco de
  Halloween que llega en caja a la puerta; elegir truco apaga y prende la
  luz y la mascota se asusta (y se ríe). Además salen fantasmitas
  flotando por el cuarto (más de noche): atraparlos a todos da monedas.
- El vestidor ahora recibe la altura real de la boca (`mouthY`; con
  algunas orejas la boca no se corre junto con los ojos), así los
  colmillos quedan justo debajo con cualquier oreja.

## Premio de cada día, recordatorio y buzón de cartas

- **Premio del día** (`daily.js`, `components/game/DailyGift.jsx`): un
  calendario de 7 premios (monedas, comida y, el séptimo, una deco
  sorpresa que llega a la puerta). Avanza un casillero por cada día que
  se entra, aunque no sean seguidos: faltar no borra lo avanzado. La
  racha de días seguidos se cuenta aparte, con su llamita. Se abre una
  vez por visita después de la guía, y desde Minijuegos.
- **Recordatorio** (`reminder.js`): "Agregar a mi calendario" baja un
  evento diario (.ics) con el link del regalo a la hora elegida. Sirve en
  iPhone y Android sin notificaciones push ni permisos.
- **Buzón**: quien regaló le escribe cartas (texto y foto) cuando quiera.
  - Al crear el regalo recibe, aparte del link del regalo, el link
    privado de su buzón (`/buzon/<slug>?t=<llave>`); también puede entrar
    con la llave de acceso con que compró el regalo (sirve para los
    regalos de antes).
  - Backend: columna `pets.owner_token` (se agrega sola), tabla
    `letters`, `POST …/letters` (con llave; como mucho 10 por día),
    `GET …/letters?after=` (sin fotos) y `GET …/letters/{id}` (con foto),
    `POST …/mailbox/check`. Pruebas: `backend/test_mailbox.py`.
  - A quien recibe le llega como paquete: suena el timbre, en la caja
    está "Carta de Nico" y al leerla se ve con su foto. Las cartas viejas
    se releen desde el sobre de la barra de arriba. Se revisa al abrir,
    cada 3 minutos y al volver a la pestaña. Las fotos no se guardan en
    la partida (se piden al servidor al abrir la carta).

## Gestos de la mascota

- La mochi mastica cuando come algo que le gusta, niega con la cabeza
  cuando no, salta de alegría cuando estrena ropa (al volver del
  vestidor o de la tienda con otra pinta, o al ponérsela desde la caja,
  con brillitos y "¿Cómo me veo?") y se asusta con el truco de Halloween.
- Cada estilo los hace a su manera (`ACTS` en `styles/motion.js`): en
  pixel solo se desplaza y a saltos (escalar un sprite rompe los
  píxeles), en papel a cuadros de stop motion y en el resto suave.

## Navidad

Del 1 de diciembre al 6 de enero (cruza el año: `seasons.js` ahora
entiende temporadas que pasan de diciembre a enero, y avisa una sola vez
por temporada aunque cambie el año).

- **Tienda**: pestaña "Navidad" con su cuenta regresiva, como la de
  Halloween (la portada muestra el muñeco de nieve y el arbolito).
- **Ropa y accesorios** (15): gorro de Papá Noel, cintillo de reno,
  orejeras de peluche, nariz de reno, copitos en las mejillas, bufanda
  navideña, collar de cascabeles, suéter navideño, vestido de Mamá Noel,
  pijama de copitos, saco de regalos, bastón de caramelo, chocolate
  caliente y regalito. Paleta navideña (rojo, verde, blanco, dorado…).
- **Decoración** (9 a la venta): arbolito con luces y estrella, corona,
  botas colgadas, luces de colores, muñeco de nieve de peluche, regalos
  apilados, casita de jengibre, nochebuena y renito de peluche.
- **Sucesos**: una vez al día llega una visita con ropa navideña y un
  regalito: darle un regalo (algo de la nevera, o 15 monedas) trae a
  veces una deco navideña en caja o monedas; darle un abrazo da más
  cariño. Además caen copitos de nieve en el cuarto (más de noche) para
  atrapar. El 24 y el 25 el regalo del día es la **esfera de nieve**, que
  no se vende (si ya la tiene, 150 monedas).

## Cámara y álbum de fotos

- **Cámara**: un botón con una cámara en la esquina del cuarto. Suena el
  clic, hay flash y sale una **polaroid** de lo que se ve, centrada en la
  mascota, con su nombre y la fecha escritos a mano abajo.
  - La foto se arma en `snapshot.js` copiando en un canvas lo que ya está
    pintado en el estilo activo (cada sprite es una imagen), en el orden
    en que se ve, con las capas de luz (noche, brillo de las lámparas,
    lluvia o nieve en las ventanas). No hace falta ninguna librería y la
    foto queda en pixel art, neón, papel… según el estilo.
  - Lo que lleva `data-photo-skip` (los botones de las visitas) no sale.
  - Una imagen de otro sitio que "ensucie" el canvas se deja afuera en
    vez de romper la foto.
- **Álbum**: la foto se guarda en el servidor (tabla `snapshots`, con una
  miniatura para la cuadrícula; 30 por día, se guardan las últimas 120),
  se comparte con el menú del teléfono o se baja. Se abre desde la foto
  recién tomada y desde Minijuegos ("Álbum de fotos"); cada foto se ve en
  grande, se comparte o se borra. Pruebas: `backend/test_album.py`.
- **Quien regala ve las fotos** en su buzón ("Fotos de Luna").
- Las lámparas de temporada también alumbran de noche (calabaza
  sonriente, farolito, caldero, arbolito, luces de Navidad).

## Resumen de archivos tocados en toda la sesión

**Backend:**
- `backend/models.py` — columnas nuevas en `Song`, `Pet` (rediseño), `Photo` (price).
- `backend/schemas.py` — `SongIn`, `PetCreate`, `PetOut`, `OutfitOut` (nuevo), `PhotoOut` (nuevo), `RedesignIn`/`ActiveDesignIn` (nuevos).
- `backend/main.py` — migraciones ad-hoc acumulativas, endpoints `/redesign` y `/design` (nuevos), `create_pet` actualizado.

**Frontend:**
- `frontend/src/components/MusicBar.jsx` — reescrito completo (headless, `forwardRef`).
- `frontend/src/components/PetDesigner.jsx` — **archivo nuevo** (editor modular extraído).
- `frontend/src/components/TamagiftGame.jsx` — el más tocado: música, `FurnitureShopCard`, re-personalización (`RedesignConfirmModal`, `RedesignScreen`), ropa por id, pósters comprables, fórmulas de minijuegos.
- `frontend/src/components/TamagiftWizard.jsx` — extracción del editor (import desde `PetDesigner.jsx`), subida de audio, precio+recomendación en fotos/pósters, `recipe_original` en el payload.
- `frontend/src/components/Room.jsx` — `defaultPlacement` acepta `paint` configurable.
- `frontend/src/gameState.js` — versionado formal (`CURRENT_GAME_VERSION`, `MIGRATIONS`), `furniturePaint`, `ownedPosters`.
- `frontend/src/api.js` — ids estables en fallback local, `redesignPetRemote`, `setActiveDesignRemote`.
- `frontend/src/testSeed.js` — `recipe_original`, precio en pósters de prueba.

**Minijuegos (sesión de continuación):**
- `frontend/src/flyPhysics.js` + `flyPhysics.test.mjs` — **archivos nuevos** (física de Salta y vuela, 10 pruebas).
- `frontend/src/match3.js` + `match3.test.mjs` — **archivos nuevos** (lógica de Conecta 3, 14 pruebas).
- `frontend/src/gameState.js` — récords, bonus diario, racha.
- `frontend/src/components/TamagiftGame.jsx` — `GAME_META`, `GameResult`, `GAME_LIST`, `finishGame`, 4 juegos nuevos, arreglos de dificultad/vidas en los 7 existentes.

## Cómo reproducir las pruebas manuales (para quien revise)

1. Backend: `cd tamagift/backend && REQUIRE_ACCESS_KEY=0 uvicorn main:app --port 8000`
2. Frontend: `cd tamagift/frontend && npm run dev` (puerto 5173).
3. En `http://localhost:5173`, usar la clave de prueba `test` en el paso "Inicio" del asistente para generar una mascota completa al instante (incluye canciones, fotos con precio, decoración).
4. Para dar monedas de prueba en el juego: `localStorage.setItem('petgift:gamestate:<slug>', JSON.stringify({coins: 9999}))` y recargar.
