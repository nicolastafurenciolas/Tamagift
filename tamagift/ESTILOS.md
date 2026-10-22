# Estilos visuales de Tamagift

Tamagift se puede ver en **seis estilos**. Quien regala elige uno en el
asistente (paso "Estilo") y quien recibe lo puede cambiar cuando quiera
desde el botón de paleta en la barra de arriba del juego. Si nadie eligió
nada, el estilo es **Pixel art**.

| id | Nombre | Interfaz | Sprites | Movimiento | Sonido |
|---|---|---|---|---|---|
| `pixel` | Pixel art (por defecto) | Pixelify Sans, esquinas mordidas, sombras duras | Rejilla de 3 px, paleta con rampas, contorno de 1 px | Saltos de 2 cuadros, sin girar | Chip (onda cuadrada) |
| `lofi` | Lo-fi noche acogedora | Noche violeta, luz de lámpara | Gradación nocturna, borde de luz cálida, grano | Respira despacio | Teclado suave con eco y crujido de vinilo |
| `retro` | Retro setentero | Righteous, bordes marrones, sombras corridas | Paleta de los 70, trama de puntos, contorno grueso | Rebote de caricatura | Funk con filtro "wah" |
| `papel` | Papel recortado | Patrick Hand, papel kraft, bordes irregulares | Cartulinas planas, corte irregular, sombra de capa | Stop motion a 8 cuadros/s | Marimba y papel |
| `neon` | Neón nocturno | Orbitron, fondo negro con rejilla, brillos | Silueta oscura con tubos de luz y resplandor | Titila | Sintetizador con eco |
| `sticker` | Sticker kawaii | Baloo 2, lunares menta, borde blanco | Colores vivos, borde blanco grueso y sombrita | Gelatina | Burbujitas |

## Cómo funciona

- **`src/styles/registry.js`**: la definición de cada estilo (colores,
  letras, sombras, cómo se redibuja el arte, movimiento y sonido).
- **`src/theme.js`**: `C`, `SHADOW` y `FONT` son variables CSS
  (`C.rose` → `var(--pg-c-rose)`). `applyStyle()` las llena. Por eso
  cualquier `style={{ color: C.rose }}` cambia solo con el estilo.
  - `tint(c, x)` aclara/oscurece (para brillos y sombras).
  - `soft(c, x)` es para FONDOS: mezcla con la superficie y no con blanco,
    así en estilos oscuros no aparecen parches claros.
  - Los colores ya no son hex: si algo necesita el valor real (canvas),
    usar `resolveColor()`.
- **`src/index.css`**: lo propio de cada estilo colgado de
  `[data-style="…"]` (esquinas en pixel, brillo en neón, etc.). En pixel
  todo es cuadrado; lo que deba ser redondo lleva la clase
  `pg-keep-round` (se recorta como octágono de píxeles).
- **`src/styles/StyleContext.jsx`**: el estilo activo (`useStyle()`).
  `?estilo=neon` en cualquier URL fuerza un estilo (para probar).
- **`src/styles/spriteEngine.js` + `components/Sprite.jsx`**: el motor
  que redibuja TODO el arte (SVG de la app o imágenes subidas) en el
  estilo activo. Resultado en caché por (fuente, tamaño, estilo).

  ```jsx
  <Sprite art={<svg…/>} cacheKey="algo-estable" w={64} h={64} />
  <Sprite src={pet.drawing_normal} w={190} h={190} kind="pet" />
  <Sprite src={foto} w={48} h={48} kind="photo" />
  ```
  `kind`: `art` (contorno), `pet`, `photo` (sin contorno; en pixel se
  tramea), `surface` (paredes y pisos), `icon`.
  `w`/`h` son el tamaño EN PANTALLA: en pixel deciden cuántos píxeles de
  arte tiene el sprite. Si el sprite vive dentro de algo escalado (el
  cuarto), pasar `pixel` ya corregido (ver `Room.jsx`).
- **`src/styles/motion.js`**: cómo respira, camina y lanza partículas la
  mascota en cada estilo.
- **`src/sound.js`**: el mismo repertorio de sonidos con seis "paquetes"
  de timbre; `setSoundPack()` lo cambia junto con el estilo.
- **`src/sprites.jsx`**: comidas, burbujas, esponja, bandera, trofeo…
  dibujos propios que reemplazan a los emojis (un emoji se ve igual en
  todos los estilos y rompe la estética).

## Agregar un estilo nuevo

1. Agregar la entrada en `STYLES` de `registry.js` (todas las claves de
   `COLOR_KEYS`, letras, sombras, `art.kind`, `motion`, `sound`).
2. Escribir su procesador en `spriteEngine.js` (o reusar uno existente
   en `art.kind`).
3. Sus detalles de interfaz en `index.css` bajo `[data-style="nuevo"]`.
4. Agregar el id al `StyleId` de `backend/schemas.py`.
5. Revisarlo en `/estilos` (laboratorio de arte) y en `/dev/main?estilo=nuevo`.

## Páginas de revisión (solo en `npm run dev`)

- `/estilos` — el mismo arte en los seis estilos (`?solo=pixel` para uno).
- `/hoja?estilo=<id>` — hoja completa de un estilo: cuartos, ánimos,
  estilos de partida, cada pieza de personalización, muebles, colores,
  paredes, pisos, decoración, comida, interfaz y minijuegos.
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
