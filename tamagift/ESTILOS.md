# Estilos visuales de Tamagift

Tamagift se puede ver en **seis estilos**. Quien regala elige uno en el
asistente (paso "Estilo") y quien recibe lo puede cambiar cuando quiera
desde el botón de paleta en la barra de arriba del juego. Si nadie eligió
nada, el estilo es **Pixel art**.

| id | Nombre | Interfaz | Cómo dibuja (kit) | Movimiento | Sonido |
|---|---|---|---|---|---|
| `pixel` | Pixel art (por defecto) | Pixelify Sans, esquinas mordidas, sombras duras | Cada parte rasterizada en su rejilla, rampas de color con tono desplazado, contorno de 1 px por parte, caras hechas a mano píxel a píxel | Saltos de 2 cuadros, sin girar | Chip (onda cuadrada) |
| `lofi` | Lo-fi noche acogedora | Noche violeta, luz de lámpara | Degradado por parte, luz cálida en el borde, grano suave | Respira despacio | Teclado suave con eco y crujido de vinilo |
| `retro` | Retro setentero | Righteous, bordes marrones, sombras corridas | Colores llevados a la paleta de los 70, contorno marrón grueso corrido del color, trama de puntos en la sombra | Rebote de caricatura | Funk con filtro "wah" |
| `papel` | Papel recortado | Patrick Hand, papel kraft, bordes irregulares | Cada parte es una cartulina cortada a tijera, con sombra de capa y fibra | Stop motion a 8 cuadros/s | Marimba y papel |
| `neon` | Neón nocturno | Orbitron, fondo negro con rejilla, brillos | Piezas oscuras con tubos de luz del color de cada parte; los ojos se encienden | Titila | Sintetizador con eco |
| `sticker` | Sticker kawaii | Baloo 2, lunares menta, borde blanco | Colores vivos, contorno suave, sombra de celuloide, brillo y borde blanco grueso | Gelatina | Burbujitas |

## La mascota: mochis

Desde el rediseño las mascotas son **mochis**: un cuerpito blandito en
cuatro anchos (`alto`, `redondo`, `mochi`, `ancho`) con orejitas que dicen
qué animal son (19 opciones), 10 ojos, 9 bocas, 6 ánimos (`normal`,
`feliz`, `triste`, `enojado`, `dormido`, `sorprendido`), mejillas, colas,
estampados y 46 accesorios de cabeza, cuello y cara.

- **`src/art/mochi/`**: arma la mochi como SVG por partes.
  - `body.js`: los cuatro anchos y la **geometría** de cada uno (borde de
    arriba, altura de los ojos, línea del collar, coronilla). Todo lo
    demás se ancla a esto, así un gorro queda sobre la cabeza y un collar
    abraza el cuerpo en cualquier ancho.
  - `ears.js`, `face.js`, `tails.js` (colas y estampados), `accessories.js`.
  - `index.js`: `mochiSvg(receta, ánimo)`. Si alas, colas o capa
    sobresalen, achica todo un poco desde el piso para que entre entera.
- La receta usa los mismos campos de antes (`body`, `ears`, `eyes`,
  `mouth`, `tail`, `cheeks`, `pattern`, `headAcc`, `neckAcc`, `extraAcc` y
  los colores). Los cuerpos viejos se convierten al ancho más parecido.
- Los **retoques a mano** viajan dentro de la receta (`overlays`: un PNG
  transparente por ánimo). En pixel se bajan a la rejilla.
- **`src/petLook.js`**: lo que el juego muestra (receta, o los PNG de
  mascotas viejas). **`components/PetArt.jsx`** la dibuja en el estilo
  activo.
- Los trajes guardan su propia receta (la misma mochi con otros
  accesorios).

## Cómo funciona

- **`src/art/kit.js`**: el motor. Lee el SVG, identifica cada parte por
  su rol y la dibuja con el kit del estilo (no filtra una imagen):
  - `data-r="body"` volumen principal · `part` pieza con contorno ·
    `flat` detalle encima · `line` trazo · `shine` brillo · `tone` luz o
    sombra transparente. Sin `data-r`, el rol se deduce.
  - `data-px="eye.redondos.feliz"`: en pixel la pieza se reemplaza por
    una hecha a mano (`src/art/pixelStamps.js`, en varios tamaños).
  - `data-skip="pixel"`: detalle que un estilo no dibuja (las cuerdas de
    la guitarra en pixel).
- **`src/art/render.js`**: caché, cola y exportar a PNG.
- **`components/Sprite.jsx`**: `art` / `markup` van al motor de kits;
  `src` (fotos, dibujos subidos) va al motor de imágenes
  (`styles/spriteEngine.js`), que sigue siendo un filtro porque ahí no hay
  partes que redibujar.
- **`src/styles/registry.js`**: colores, letras, sombras, `art.kind`
  (qué kit), movimiento y sonido de cada estilo.
- **`src/theme.js`**: `C`, `SHADOW` y `FONT` son variables CSS
  (`C.rose` → `var(--pg-c-rose)`). `applyStyle()` las llena.
  - `tint(c, x)` aclara/oscurece; `soft(c, x)` es para FONDOS (mezcla con
    la superficie, sin parches claros en estilos oscuros).
- **`src/index.css`**: lo propio de cada estilo colgado de
  `[data-style="…"]`. En pixel todo es cuadrado; lo redondo lleva
  `pg-keep-round`.
- **`src/styles/StyleContext.jsx`**: el estilo activo (`useStyle()`).
  `?estilo=neon` en cualquier URL fuerza un estilo.
- **`src/styles/motion.js`** y **`src/sound.js`**: movimiento y sonido.
- **`src/sprites.jsx`**, **`roomCatalog.jsx`**, **`gameArt.jsx`**: comida,
  muebles, paredes, pisos y arte de minijuegos, en SVG que los kits
  redibujan.

## El cuarto (`src/art/room/`)

- **Perspectiva única** (`draw.js`): vista 3/4 sin punto de fuga. Un
  mueble es su frente más su tapa (`DEPTH = 0.5` de su fondo); sin
  costados. Lo redondo es una elipse con `ry = rx × 0.5`. Luz de arriba a
  la izquierda. Todo mueble nuevo se arma con `box`, `cylinder`, `pot`,
  `legs`, `tube` y `mat(color)` para que encaje con los demás.
- **Paredes y pisos** (`walls.js`, `floors.js`): un diseño con varios
  colores; la partida guarda `"diseño.color"` (`"rayas.menta"`). Los ids
  viejos pasan por `WALL_ALIASES` / `FLOOR_ALIASES`. En pixel la luz de la
  pared va en bandas (`data-only="pixel"`), en los demás en degradado.
- **Muebles** (`furniture/`): un archivo por categoría; `index.js` los
  junta, los escala 1.25× (`FURNITURE_SCALE`) y les suma el margen de
  abajo (`FOOT`, ver `draw.js`). Cada uno recibe una pintura de
  `paints.js` (`wood`, `cloth`, `accent`).
  - `place: 'pared'` cuelga; `layer: 'suelo'` (alfombras) va debajo de
    todo.
- **Decoración** (`decor.js`): `place: 'piso'` o `'sobre'` (encima de
  cualquier mueble).
- **Baño** (`bath.js`): fondo y frente de la tina por separado, con la
  mascota en medio.
- `roomCatalog.jsx` y `shopCatalog.jsx` son la puerta de entrada para la
  tienda y el cuarto.

## La mochi vestida y el mundo

- **Vestidor** (`art/mochi/wardrobe/`): cada cosa es
  `{ id, slot, label, vibes, price, colors, draw }`. Todo se ancla a la
  geometría del cuerpo (`kit.js`: `garment`, `neckLine`, `onTop`,
  `headband`…). La receta guarda lo puesto en `wear`
  (`{ cabeza: { id, c1, c2 } }`); los `headAcc`/`neckAcc`/`extraAcc`
  viejos siguen funcionando. `renderWear` devuelve capas (back, outfit,
  neck, under, front, hand) que `art/mochi/index.js` intercala.
- **Peinados** (`art/mochi/hair.js`): casquete + flequillo en una sola
  silueta (los mechones separados se veían cuadriculados en pixel).
- **Pixel art hecho a mano**: ojos, bocas y mejillas en
  `pixelStamps.js` / `mochi/faceStamps.js`; comida, objetos e íconos con
  su propia paleta en `art/pixel/` (`defArt`). Un SVG con
  `data-px-sprite="food.x"` se pinta en pixel con su dibujo hecho a
  mano.
- **El mundo** (`world.js`): `phaseOf` (hora), `weatherOf` (clima del
  día), `tickVitals` (necesidades), `foodEffect` (comer). El cuarto
  recibe `world` y dibuja la noche, las luces y el clima en las
  ventanas (`components/WorldLayer.jsx`).

## Agregar un estilo nuevo

1. Agregar la entrada en `STYLES` de `registry.js` (todas las claves de
   `COLOR_KEYS`, letras, sombras, `art.kind`, `motion`, `sound`).
2. Escribir su kit en `art/kit.js` (o reusar uno en `art.kind`).
3. Sus detalles de interfaz en `index.css` bajo `[data-style="nuevo"]`.
4. Agregar el id al `StyleId` de `backend/schemas.py`.
5. Revisarlo en `/arte?solo=nuevo` y en `/dev/main?estilo=nuevo`.

## Páginas de revisión (solo en `npm run dev`)

- `/arte` — **catálogo completo**: todo el arte (mochi y sus piezas,
  accesorios, estilos de partida, cuartos armados, muebles, pinturas,
  paredes, pisos, decoración, comida, íconos y minijuegos) en los seis
  estilos, con botones para mostrar u ocultar estilos y elegir tamaño.
- `/arte?set=<conjunto>&size=150&solo=pixel,neon` — laboratorio de los
  kits: la misma pieza dibujada por cada estilo. Conjuntos: `familia`,
  `animos`, `formas`, `orejas`, `ojos`, `bocas`, `mejillas`, `colas`,
  `estampados`, `cabeza`, `cuello`, `cara`, `presets`, `muebles`
  (`&pintura=negro`), `muebles3` (cada mueble en un rincón con una mochi
  para la escala; `&cat=asientos&pared=rayas.menta&piso=espiga.miel`),
  `paredes2`, `pisos2`, `deco`, `comida`, `ui`.
- `/estilos` — lo mismo que `/arte`.
- `/hoja?estilo=<id>` — hoja completa de un estilo: cuartos, ánimos,
  estilos de partida, cada pieza de personalización, muebles, colores,
  paredes, pisos, decoración, comida, interfaz y minijuegos.
- `/aleatorio` — cada 3 s una mascota con rasgos al azar, en un estilo y
  un cuarto al azar (el fondo de la página sigue al estilo). Espacio
  pausa, flecha derecha pasa a la siguiente.
- `/dev/<pantalla>?estilo=<id>` — el juego con una mascota de prueba y un
  cuarto amoblado, directo en una pantalla: `main`, `comer`, `decorar`,
  `estilo`, `apertura`, `games`, `shop`, `bathroom`, `memoria`,
  `atrapar`, `topos`, `serpiente`, `cruzar`, `torre`, `trivia`, `simon`,
  `volar`, `golosinas`, `rompecabezas`.

## Dónde se guarda el estilo

- Quien regala: `app_style` en la mascota (backend). La columna se crea
  sola al arrancar el backend (`LATE_COLUMNS` en `main.py`).
- Quien recibe: `style` en el estado de juego del dispositivo, y además se
  manda a `POST /api/pets/{slug}/style` para verlo igual en otro equipo.
- Prioridad al abrir el regalo: lo que eligió quien recibe > lo que eligió
  quien regaló > pixel.
