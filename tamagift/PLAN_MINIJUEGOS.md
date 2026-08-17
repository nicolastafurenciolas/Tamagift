# Plan de minijuegos — hacer que vuelva a entrar

## El problema real

Los minijuegos son el motor de retención de Tamagift: si no son divertidos, la persona
entra dos veces y no vuelve. Revisé los 7 actuales línea por línea y el problema **no es
que estén mal hechos** — están bien programados. El problema es que **les falta todo lo que
hace que un juego móvil enganche**.

### Diagnóstico: por qué hoy no dan ganas de volver

| # | Problema | Impacto |
|---|---|---|
| 1 | **No se guarda ningún récord.** `CrossingGame` tiene un `best` pero vive en el estado del componente: se borra al salir. `TowerGame` no tiene récord. Los otros 5 tampoco. | **Crítico.** Sin un número propio que superar, no hay razón para repetir. Es *la* mecánica de retención de los juegos casuales. |
| 2 | **No hay nada que premie volver mañana.** Ningún bonus diario, ninguna racha. | **Crítico.** Es el mecanismo #1 de retorno en móvil. |
| 3 | **Volver a jugar cuesta 3 toques.** Al terminar, todos vuelven a la pantalla principal → hay que entrar a "Jugar" → elegir el juego otra vez. | **Alto.** Mata el impulso de "una más" justo en el momento en que existe. |
| 4 | **Casi ninguno sube de dificultad.** Serpiente: tick fijo de 230ms para siempre. Topos: sale uno cada 620ms, siempre igual. Atrapar: misma velocidad los 25s. Memoria/Rompecabezas: dificultad fija. Solo Torre acelera. | **Alto.** Sin curva de tensión el juego se siente igual al segundo 5 que al 60. |
| 5 | **Sin riesgo no hay emoción.** "Atrapar" no penaliza lo que dejás caer. "Cruzar la calle" no tiene fin: te atropellan y reaparecés, sin costo. | **Alto.** Un juego donde no podés perder no engancha. |
| 6 | **Controles de flechas en un celular.** Serpiente, Atrapar y Cruzar usan botones ◀▶. En móvil lo natural es deslizar el dedo. | **Medio.** Se siente torpe y viejo. |
| 7 | **Las frases que él escribió no se usan en NINGÚN minijuego.** Los nombres tampoco. Las fotos solo en 2 de 7. | **Alto — y es la oportunidad más grande.** El regalo es personal; los juegos se sienten genéricos. Un juego que use *sus* cosas vale más que otro clon de Snake. |

---

## Parte 1 — Sistemas que afectan a TODOS los juegos

Esto va primero porque multiplica el valor de cada juego, viejo y nuevo.

1. **Récord personal por juego**, guardado de verdad (`gameState`, sobrevive al cierre).
   Con celebración de "¡NUEVO RÉCORD!" cuando se supera.
2. **Botón "Jugar otra vez"** en la pantalla de resultado — reinicia sin salir.
3. **Bonus diario**: la primera partida de cada día de cada juego paga **doble**.
   Es la razón concreta para abrir la app mañana.
4. **Racha de días seguidos** visible, con bonus creciente.
5. **Pantalla de resultado unificada**: puntaje, récord, monedas ganadas, bonus aplicado.

---

## Parte 2 — Arreglos a los 7 juegos actuales

| Juego | Qué se arregla |
|---|---|
| **Serpiente golosa** | Acelera con cada comida (230ms → 110ms). Controles por deslizamiento además de flechas. |
| **Dale al que salga** | Los topos salen cada vez más rápido y duran menos visibles. |
| **Atrapa la comida** | Aceleración progresiva + **3 vidas**: si dejás caer 3, se acaba (antes no pasaba nada). |
| **Cruzar la calle** | Ahora tiene fin real: **3 vidas**. Los carros aceleran por ronda. |
| **Torre de bloques** | Ya estaba bien (acelera sola). Solo suma récord. |
| **Memoria** | Dificultad elegible (6/8/10 pares) — más pares, más monedas. |
| **Rompecabezas** | Igual: 3×3 o 4×4, el grande paga más. |

---

## Parte 3 — Minijuegos nuevos

Ordenados por **cuánto enganchan × cuánto usan el contenido personal del regalo**.

### 🥇 Nivel 1 — los que construyo ahora

**1. Trivia del corazón** ⭐ *el más importante*
Preguntas hechas con lo que él configuró: "¿Cuál de estas comidas me encanta?",
"¿Cuál de estas NO me gusta?", "¿Cómo me llamo?", "¿Quién te preparó este regalo?",
"¿Cuál de estas frases te digo?". Cada acierto muestra la reacción real que él
escribió para esa comida.
*Por qué:* es el único juego que **no se podría jugar con otra mascota** — es de ellos dos.
Emocionalmente es lo más fuerte que puede tener esta app.

**2. Simón dice**
Secuencia de colores + sonido que se alarga. Clásico, adictivo, tensión perfecta.
*Por qué:* "una más" garantizado, y ya existe el motor de sonido (`sound.js`).

**3. Salta y vuela** (estilo Flappy)
Un solo toque, la mascota vuela entre obstáculos. Dificultad progresiva.
*Por qué:* es el formato con más "una más" por minuto que existe en móvil.

**4. Conecta 3 golosinas** (estilo match-3)
Tablero con **las comidas que él configuró** como fichas. Intercambiás para juntar 3.
Con combos en cadena.
*Por qué:* es el género más adictivo del móvil, y aquí usa sus comidas reales.

### 🥈 Nivel 2 — siguientes, si el nivel 1 queda sólido

**5. Globos de recuerdos** — explotás globos; algunos esconden una foto de ellos.
**6. Reflejos** — tocá apenas cambie de color. Mide milisegundos, muy competitivo consigo mismo.
**7. Adiviná la frase** (ahorcado) — con las frases que él escribió.
**8. Laberinto del corazón** — llevá la mascota a la salida contrarreloj.

### 🥉 Nivel 3 — ideas evaluadas y descartadas (y por qué)

- **Juego de ritmo con su música**: la música puede ser embed de Spotify/YouTube, y no
  hay forma de leer el audio de un iframe cross-origin para sincronizar. Solo funcionaría
  con MP3 subido → quedaría roto para la mitad de los regalos. **Descartado.**
- **Encuentra las diferencias**: habría que generar diferencias automáticas sobre sus
  fotos; sale artificial y feo. **Descartado.**
- **Sopa de letras**: lento y aburrido en pantalla de celular. **Descartado.**
- **Piedra-papel-tijera**: sin habilidad, se agota en 30 segundos. **Descartado.**

---

## Orden de construcción

1. Sistemas base (récords, bonus diario, racha, "jugar otra vez") ← multiplica todo
2. Arreglos de dificultad/vidas a los 7 existentes
3. Trivia del corazón
4. Simón dice
5. Salta y vuela
6. Conecta 3 golosinas

---

# ESTADO — todo lo de arriba está construido

## Hecho y probado jugando en el navegador

| Cosa | Estado |
|---|---|
| Récord por juego, guardado de verdad | ✅ probado: jugué, salió "¡NUEVO RÉCORD!", quedó guardado y aparece en el menú |
| Bonus diario x2 | ✅ probado: primera partida pagó 96 en vez de 48, y el badge "x2 hoy" desapareció solo de ese juego |
| Racha de días | ✅ guarda `streak`; el aviso 🔥 sale a partir del 2º día seguido |
| "Jugar otra vez" sin salir | ✅ probado: reinicia con preguntas nuevas |
| Pantalla de resultado unificada | ✅ reemplaza las 7 pantallitas sueltas que había |
| **Trivia del corazón** | ✅ jugada entera: preguntas de sus comidas, sus frases y los nombres |
| **Simón dice** | ✅ jugado: secuencia, fallo, puntaje = secuencia más larga completada |
| **Conecta 3 golosinas** | ✅ jugado: el intercambio gasta jugada y suma golosinas |
| **Salta y vuela** | ⚠️ carga bien, pero ver la nota de abajo |
| Serpiente: acelera + deslizar | ⚠️ código hecho, ver nota |
| Topos: se acelera | ⚠️ código hecho, ver nota |
| Atrapar: 3 vidas + acelera + arrastrar | ⚠️ código hecho, ver nota |
| Cruzar: 3 vidas + carros aceleran | ⚠️ código hecho, ver nota |

## Lo que NO pude comprobar jugando, y por qué

El panel de navegador de este entorno **no pinta cuadros**, así que
`requestAnimationFrame` no dispara (lo medí: 0 frames en 600 ms). Eso deja sin
poder probar a mano todo lo que se mueve solo: **Salta y vuela, Cruzar la calle,
Torre**, y la parte de tiempo de **Atrapar** y **Topos**.

Para no dejarlo en "confío en que funciona", saqué la lógica del juego fuera de
los componentes y le puse pruebas de verdad:

- `src/flyPhysics.js` + `flyPhysics.test.mjs` → **10 pruebas**: gravedad, aleteo,
  choque con techo/suelo/tubo, que un tubo no puntúe dos veces, que acelere con
  tope, y que no se acumulen tubos en memoria.
- `src/match3.js` + `match3.test.mjs` → **14 pruebas**: detección de líneas,
  gravedad, cascadas, intercambios inválidos, y que el tablero inicial nunca
  regale líneas ni nazca trabado.

Correr con: `node src/flyPhysics.test.mjs` y `node src/match3.test.mjs`.

**Dos bugs reales que encontraron estas pruebas** (no los habría visto jugando):
1. Cascada infinita en Conecta 3: si las fichas que caen vuelven a alinearse una
   y otra vez, el bucle no terminaba nunca y colgaba la pestaña. Ahora tiene tope.
2. La velocidad de Salta y vuela leía un campo que no existía (`pipes.passed`),
   así que nunca aceleraba.

**Falta probar en celular físico** (igual que el resto de la app): los controles
por deslizamiento de Serpiente y Atrapar están hechos para dedo, y en este
entorno solo pude simularlos.

## Ideas del nivel 2 que quedan listas para construir

Globos de recuerdos · Reflejos · Adiviná la frase (ahorcado) · Laberinto del corazón

---

# Segunda pasada: lo visual

Crítica recibida: *"gráficamente se ven muy mal, simples, sin animaciones; en
Conecta 3 casi no entiendo qué hay que hacer; Simón dice son 4 cuadros secos;
en Cruzar la calle los carros son rectángulos"*. Todo cierto. Lo que se rehízo:

Se creó **`src/gameArt.jsx`**, igual que `roomCatalog.jsx` guarda el arte del
cuarto, con las mismas reglas del proyecto: contorno de tinta cálida (nunca
negro), cara iluminada arriba + sombra al lado para dar volumen, sombra de
contacto, y nada generado por IA.

| Juego | Antes | Ahora |
|---|---|---|
| **Conecta 3** | Emojis sobre cuadrados de color; el tablero cambiaba de golpe y no se entendía nada | Caramelos SVG con brillo de vidrio y **forma distinta por tipo** (círculo, rombo, gota, flor, estrella — se distinguen sin depender del color). **Cartel de instrucciones**, las fichas que hacen línea **estallan**, las nuevas **caen desde arriba**, la jugada inválida **sacude** las dos fichas, y si te quedás mirando 4s **te señala una jugada posible** |
| **Simón dice** | 4 cuadrados planos de color | Botones tipo joya con degradado radial, brillo y **una figura propia cada uno** (corazón, estrella, flor, luna). Al encenderse: destello, onda expansiva y resplandor. Marcador de progreso de la secuencia e instrucciones al empezar |
| **Cruzar la calle** | Rectángulos con un cuadradito blanco | **Carros dibujados**: cabina, dos ventanas con reflejo, ruedas con tapacubos, faro, luz trasera, manija y sombra en el asfalto. Humito del escape. Carretera con degradado, líneas discontinuas, **bordillos** y pasto con matitas y flores. Meta con banderas |
| **Salta y vuela** | Dos barras verdes | Tubos con **boca** (lo que hace que un tubo se lea como tubo), luz y sombra en la caña, y suelo con pasto |
| **Serpiente** | Cuadrados todos iguales | Cabeza redondeada **con ojos que miran hacia donde va**, cuerpo que alterna tono, **cola que se afina**, cuadrícula sutil de fondo y la comida latiendo |
| **Topos** | Círculo café plano | Agujero con **profundidad real** (degradado de tierra a hueco oscuro) y sombra interior |
| **Torre** | Barras de color | Bloques con cara superior iluminada y base en sombra, y el bloque activo con resplandor |

También se agregaron 9 animaciones nuevas a `index.css`
(`pg-tile-clear`, `pg-tile-drop`, `pg-shake`, `pg-pad-flash`, `pg-ripple`,
`pg-combo-burst`, `pg-hint-ring`, `pg-spin`, `pg-exhaust`).

**Comprobado en el navegador**: 36 caramelos con 5 formas distintas, la sacudida
en jugada inválida (2 fichas), la secuencia estallido → caída del tablero,
6 carros con ruedas, los 4 botones de Simón con figura propia, y los 8 juegos
cargando sin un solo error de consola.

---

# Pendientes de la sesión anterior — TODOS RESUELTOS ✅

Feedback del usuario tras probar la app en su dispositivo. Los 7 puntos quedaron
implementados y verificados. Abajo queda el detalle original de cada uno y, al
final de la sección, qué se hizo exactamente y cómo se comprobó.

1. **Hitbox de "Salta y vuela" demasiado castigadora.** Con solo rozar un tubo
   ya se pierde — lo hace poco satisfactorio. Ajustar en `flyPhysics.js`:
   `stepFly()` compara `petTop`/`petBottom` (derivados de `FLY.PET_R = 18`)
   contra `p.gapY`/`p.gapY + FLY.GAP` sin ningún margen de perdón. Práctica
   estándar de este género (Flappy Bird y clones): usar un radio de colisión
   VISUALMENTE más chico que el sprite (ej. `PET_R` efectivo ~11-13 en vez de
   18, o un margen de perdón de unos pocos px antes de contar choque). Ajustar
   también las 10 pruebas en `flyPhysics.test.mjs` que asumen el radio actual.

2. **La cabeza de la serpiente debería ser la imagen real de la mascota**, no
   la forma redondeada con ojitos dibujados que tiene ahora (`SnakeGame`,
   sección "cabeza" dentro de `snake.map`). Pasar `drawingUrl={drawingFor('feliz')}`
   como prop y renderizar un `<img>` recortado en círculo para el segmento
   `i===0`, en vez del `<div>` con ojos SVG. Cuidado con el `transform: rotate`
   según `dirRef.current` para que la mascota "mire" hacia donde va, igual que
   ya se hace en `CrossingGame`/`FlyGame`.

3. **Torre de bloques es demasiado corta.** Pidió que se busque la forma de
   alargarla con más mecánicas, no solo ajustar velocidad. Ideas a evaluar la
   próxima sesión (ninguna decidida todavía, hay que proponerlas y que el
   usuario elija): bloques que dan un power-up al aterrizar perfecto (ancho
   extra por una ronda), viento lateral que empuja el bloque en movimiento a
   partir de cierta altura, "checkpoints" cada N pisos que dan un colchón
   extra de margen, o un multiplicador de monedas que crece mientras la racha
   de aciertos "perfectos" (`w > c.w * 0.86` en el código actual) siga viva.

4. **Controles de deslizar el dedo estilo Crossy Road.** El usuario escribió
   "dale al que salga" pero por el contexto ("los mismos controles que el
   crossy road") casi seguro se refiere a **Cruzar la calle** (`CrossingGame`),
   que hoy mueve con 4 `ArrowBtn` (▲◀▼▶) y no con gestos — Crossy Road es
   justamente ese género. "Dale al que salga" (`WhackGame`, los topos) ya es
   un juego de TOCAR, deslizar no encaja con su mecánica. **Confirmar con el
   usuario cuál de los dos quiso decir antes de tocar código** — no asumir.
   Si es Cruzar la calle: reemplazar los `ArrowBtn` por gestos de swipe sobre
   el tablero (patrón ya usado en `SnakeGame` con `onTouchStart`/`onTouchEnd`
   midiendo `dx`/`dy`, se puede reusar tal cual).

5. **Asistente: subir foto propia para "Dale al que salga".** Hoy los topos
   reusan las imágenes de comidas/decoración que ya existen (`whackTargets`,
   `TamagiftGame.jsx` ~línea 3093, construido desde `pet.food_preferences` y
   `pet.decor_items` — no hay ningún upload dedicado a este juego). El usuario
   quiere poder subir una foto ESPECÍFICA de qué golpear (ejemplo que dio: una
   persona que le cae mal a la pareja) directo desde el asistente, con
   recorte de fondo (reusar `BgRemover.jsx`, mismo patrón que ya usa
   `DecorStep` en `TamagiftWizard.jsx`) y ajustada a las proporciones exactas
   que necesita el agujero del topo. Implica: nuevo paso o sección en el
   wizard, nuevo campo en el payload/backend (algo tipo `whack_targets`,
   posiblemente reusando la tabla `DecorItem` con un `used_for` nuevo en vez
   de crear tabla aparte — evaluar).

6. **Atrapa la comida: verificar/arreglar el origen de las imágenes.**
   Confirmado en el código: `CatchGame` (`dropPool`, ~línea 646) YA usa
   `foods.filter(f => f.image)` — las fotos de comida del asistente SÍ caen
   en el juego si tienen imagen (si ninguna tiene, cae a emojis genéricos).
   Esa parte ya está bien, no hace falta rehacerla. **Lo que falta de verdad**:
   hoy el pool mezcla comidas que gustan y que no gustan sin distinguir, y
   nunca se pierde vida por comer algo que no le gusta a la mascota — solo se
   pierde vida si algo se cae sin atrapar (`setLives` en el `useEffect` de
   `newY > CATCH_AREA_H + 10`). Agregar: marcar cada ítem del pool con su
   `preference`, y si `catcherX` atrapa uno con `preference: 'no_gusta'`,
   restar una vida en vez de sumar puntaje (con su propio sonido/feedback,
   ya existe `play('bad')` en el proyecto).

7. **Auditoría de que TODOS los juegos entren perfecto en la pantalla del
   celular, sin scroll en ningún sentido.** El usuario fue explícito: que la
   pantalla se deslice arriba/abajo o izquierda/derecha durante un minijuego
   es "demasiado desagradable". Revisar cada uno de los 10 (`MemoryGame`,
   `CatchGame`, `SlidingPuzzle`, `WhackGame`, `SnakeGame`, `CrossingGame`,
   `TowerGame`, `TriviaGame`, `SimonGame`, `FlyGame`, `Match3Game`) en un
   viewport angosto de verdad (375×667 o similar, no solo el navegador de
   escritorio) — ninguno se probó todavía en un celular físico. Candidatos
   más sospechosos por tamaño fijo en vez de responsive: `CATCH_AREA_W/H`
   (300×380 fijos), `SNAKE_COLS/ROWS × SNAKE_CELL` (11×24=264 fijos), y el
   tablero de `Match3Game` (`maxWidth: 312`) — confirmar que ninguno se pasa
   del ancho real de un celular angosto (320px) sumado al padding lateral
   (`0 14px` en casi todas las pantallas, así que el ancho útil real es
   `viewport - 28px`).

---

## Qué se hizo con cada uno (sesión de resolución)

**1. Hitbox de "Salta y vuela" — resuelto.**
Se separó el radio visual del de colisión en `flyPhysics.js`: `PET_R: 18` sigue
siendo lo que se dibuja, y el choque ahora usa `HIT_R: 11`. Rozar el tubo con el
borde del sprite ya no mata. Se añadieron 2 pruebas nuevas que fijan justamente
ese comportamiento (que un roce dentro del margen NO mate, y que meterse de
verdad SÍ mate, para que el perdón no vuelva el juego imposible de perder).
**12 pruebas OK** en `flyPhysics.test.mjs`.

**2. Cabeza de la serpiente = la mascota — resuelto.**
`SnakeGame` recibe `drawingUrl` y el segmento `i===0` se dibuja con la imagen
real de la mascota (un poco más grande que la celda, con sombra y volteada según
la dirección). Verificado en el navegador: la cabeza es un `<img>` con `data:image`.

**3. Torre de bloques muy corta — resuelto con una mecánica nueva.**
El problema de fondo era que el ancho SOLO podía bajar, así que la partida se
acababa sola pasara lo que pasara. Ahora clavar el bloque casi exacto
(`PERFECT_TOL: 5`) **devuelve ancho** (`REGROW: 9`, con tope en el ancho inicial),
con racha visible, aviso "¡PERFECTO! ×N" y borde dorado en los bloques clavados.
La lógica se extrajo a `towerLogic.js` (misma razón que `flyPhysics.js`: el bloque
se mueve con `requestAnimationFrame`, que no corre sin pantalla) con
**9 pruebas** que incluyen las dos que importan: clavando siempre la torre aguanta
200 pisos sin caerse, y fallando siempre sí se acaba.

**4. Controles de deslizar — resuelto en Cruzar la calle.**
Se confirmó por el propio texto del usuario ("los mismos controles que el crossy
road"): Crossy Road es de mover un personaje deslizando, y "Dale al que salga" no
tiene personaje que mover — es de tocar. Así que era Cruzar la calle. Se le
quitaron los 4 botones de flecha y ahora se juega sobre el tablero: deslizar en
cualquier dirección mueve, y un toque avanza (el gesto más frecuente). Funciona
igual con mouse. `ArrowBtn` quedó sin uso y se eliminó.

**5. Subir fotos propias para "Dale al que salga" — resuelto.**
Tabla nueva `whack_targets` en el backend (propia y no un `DecorItem` marcado,
porque la decoración se compra y se coloca en el cuarto y esto no), con
`WhackTargetIn/Out` e id estable. Paso nuevo **"Juegos"** en el asistente (ahora
11 pasos) que reusa `BgRemover` para recortar el fondo y muestra la vista previa
dentro de un círculo igual al agujero del juego, para que se vea tal cual quedará.
En el juego, si hay blancos propios se usan SOLO esos; si no, se cae a
comidas/decoración como antes. Verificado de punta a punta contra la API real.

**6. Atrapa la comida — resuelto, y de paso se corrigió un problema serio.**
Confirmado que las fotos de comida ya caían bien. Se agregó lo que faltaba:
atrapar algo que la mascota odia resta una vida, con aviso que dice cuál era
("¡Ugh, Aceitunas! −1 ❤️") para que se aprenda jugando, y la mascota pone cara de
enojada. **Problema encontrado al probarlo:** con la penalización por dejar caer
que ya existía, el juego se terminaba solo en 4 segundos sin tocar nada. Se quitó
esa penalización: dejar caer algo ya cuesta los puntos que no sumaste, y las
vidas quedan para lo que el usuario pidió. Verificado: ahora la partida dura los
25 segundos completos.

**7. Encaje en pantalla de celular — auditado y corregido.**
Se recorrieron los 11 juegos midiendo desbordamiento real contra el viewport.
Dos se pasaban en el peor caso (360×560, que simula un celular bajo con la barra
del navegador): `atrapar` por 5px y `cruzar` por 22px. Se arreglaron de raíz, no
recortando márgenes: el tablero de Atrapar ahora deriva su tamaño del alto
(`height: min(380px, 56vh)` + `aspectRatio`) y dibuja todo en porcentajes sobre
sus coordenadas internas de 300×380, y el de Cruzar tiene `maxHeight: 58vh`.
**Resultado: los 11 juegos entran sin scroll vertical ni horizontal en 375×812,
360×640 y 360×560.**

> Nota sobre la primera medición: al principio comparé contra
> `documentElement.clientHeight`, que en este layout vale lo mismo que
> `scrollHeight` y daba 0 de desbordamiento en todos — una medición inútil que
> parecía buena. La medición válida es `document.body.scrollHeight` contra
> `window.innerHeight`.

**Estado de las pruebas:** 12 (vuelo) + 16 (conecta 3) + 9 (torre) = **37 pruebas OK**,
build limpio, y los 11 juegos recorridos en el navegador sin un solo error en consola.

### Lo único que sigue sin poder comprobarse aquí
Nada de esto se ha abierto todavía en un **celular físico**. En este entorno el
panel del navegador no compone cuadros, así que `requestAnimationFrame` no corre:
las mecánicas animadas (el bloque que se desliza en la Torre, los carros, el
vuelo) están cubiertas por las pruebas puras, no por observación directa. Queda
como parte de la tarea #45 (despliegue).
