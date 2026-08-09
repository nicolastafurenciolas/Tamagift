# PetGift — contexto completo del proyecto

Este documento es un resumen fiel de una conversación larga con otra instancia
de Claude, en la que se diseñó y construyó este proyecto desde cero. Está
pensado para que cualquiera (o cualquier IA) que no estuvo en esa conversación
entienda exactamente qué es esto, por qué existe, qué se decidió y por qué, y
qué falta. Todo lo marcado como "probado" fue realmente ejecutado y
verificado, no solo escrito.

---

## 1. Qué es esto, en una frase

Una plataforma para que cualquier persona le regale a su pareja una mascota
virtual completamente personalizada — dibujada a mano, con sus comidas
favoritas, sus fotos, su música — como una app instalable que se le entrega
como un link.

## 2. De dónde viene la idea (importa para entender el nivel de cuidado esperado)

El creador de este proyecto ya construyó, para su propia pareja (Sarah), un
juego de mascota virtual temático de Pusheen, como regalo personal. Ese
proyecto:
- Era una PWA instalable, desplegada en Netlify.
- Guardaba el progreso en localStorage (sin backend).
- Tenía secuencias cinemáticas (momentos narrativos animados).
- Tenía un reproductor de música integrado.
- Tenía baño (deslizar a un cuarto aparte y arrastrar una esponja sobre la
  mascota), minijuegos (memoria, atrapar comida, rompecabezas deslizante,
  batalla naval, quiz, snake, whack-a-mole), una tienda con monedas ganadas
  jugando, y un cuarto decorable con pósters y objetos comprados en la tienda.
- El tono era: una experiencia cuidada, emocional y personalizada — no un
  juego genérico, algo hecho a la medida de una persona específica.

**PetGift debe sentirse con ese mismo nivel de cuidado y pulido, pero
generalizado como sistema para que cualquier persona pueda crear su propia
versión para su pareja** — sin depender de un personaje con derechos de autor
como Pusheen, Hello Kitty o Cinnamoroll (se descartaron explícitamente por
temas de derechos).

## 3. Los requisitos originales, tal como se pidieron

- Cada persona (el "novio" en el lenguaje usado durante el diseño, pero el
  producto debería funcionar para cualquier pareja) puede crear una mascota
  personalizada para regalar.
- Mecánica de alimentar: hay comidas configurables; si le das una que le
  gusta a la pareja, sale un mensaje positivo; si le das una que no le gusta,
  sale un mensaje de desagrado. Los mensajes también son configurables.
- Se puede bañar a la mascota.
- Hay minijuegos que dan como recompensa cosas que le gustan a la pareja.
- Rompecabezas con fotos personalizadas de la pareja.
- Habitación decorable con pósters de películas/series que le gusten.
- Música personalizada que se puede agregar.
- La mascota necesita **muchas** opciones de personalización, tiernas, para
  que quede "súper cute" — sin usar personajes con derechos de autor.
- **Se requieren 3 diseños de la mascota: normal, feliz/con ánimo, y
  enojada.**
- Frases configurables en 3 categorías: positivas, negativas y casuales,
  según cómo se esté alimentando a la mascota o cómo estén sus barras de
  amor/hambre.
- Toda la configuración la hace quien regala, con un menú **muy visual y
  claro, pensado para hacerse desde el celular.**
- Al terminar la configuración, debe ser fácil entregarle la aplicación
  completa a la pareja, para que la agregue a la pantalla de inicio de su
  celular — **sin importar si es iPhone o Android.**
- Duda original sin resolver: no se sabía cómo lograr que cada configuración
  generara "la aplicación completa" — se sospechaba (incorrectamente) que
  haría falta una IA generando un HTML distinto por cada persona.

## 4. La respuesta a esa duda — es la base de toda la arquitectura

**No se genera código ni HTML por cada persona.** La configuración de cada
pareja (dibujos, comidas, frases, fotos, música) se guarda como **datos**
(filas en una base de datos), no como código. Existe **una sola aplicación**
(un solo código, desplegado una vez) que, según el identificador (`slug`) en
el link, busca esos datos y arma la pantalla. Agregar 10.000 mascotas nuevas
no agrega una línea de código — agrega 10.000 filas en una tabla.

El truco para que "agregar a inicio" muestre el ícono y nombre correctos de
CADA mascota (no un ícono genérico de la app): la página de cada regalo
(`/p/{slug}`) cambia dinámicamente su propio `<link rel="manifest">` para
apuntar a un manifest.json que genera el backend, específico para esa
mascota (nombre = nombre de la mascota, ícono = su dibujo). Además se fija
`apple-mobile-web-app-title` porque iOS no siempre respeta bien el manifest
dinámico solo.

## 5. Decisiones de producto tomadas durante el desarrollo (y por qué)

- **El sistema de creación del personaje pasó por dos versiones.** La
  primera fue un creador paramétrico (elegir color, orejas, ojos, accesorios
  de listas). Se rechazó por tener pocas opciones y no sentirse lo
  suficientemente "Picrew/Mii". Se expandió mucho (más de 1 millón de
  combinaciones) pero **igual se descartó por completo** a favor de la
  versión actual: **dibujo libre a mano**, al estilo Tomodachi Life — la
  pareja o quien regala dibuja la mascota, con pincel, goma, cuentagotas,
  paleta de colores, deshacer/rehacer, un estado por cada ánimo (normal,
  feliz, enojado). Se agregó un botón "copiar desde Normal" para que los 3
  ánimos se sientan como la misma mascota, en vez de dibujarla 3 veces desde
  cero.
- **Sin generación de arte por IA, nunca.** Ni para el personaje ni para
  nada visual — todo lo que ve el usuario final lo dibuja o sube la persona
  que configura el regalo.
- **Música por embed (Spotify/YouTube), nunca archivos de audio subidos.**
  Decisión explícita por temas de licencias — así la licencia la maneja la
  plataforma, no el proyecto.
- **Pósters subidos por el usuario, nunca una librería propia de imágenes
  con derechos de autor** (nada de posters de Marvel/Disney/etc. para
  elegir) — mismo motivo de licencias, pero además esto es simplemente
  reusar las fotos que la persona ya subió, marcadas como "poster" en vez de
  "puzzle".
- **Pago único sugerido, no suscripción** — se parece más a un fotolibro
  personalizado (comprar una vez) que a una app de uso diario. Esto fue una
  sugerencia, no una decisión confirmada por el creador del proyecto.
- **Copy neutral en género sugerido** ("para tu pareja" en vez de "para tu
  novia") para no limitar el mercado — también una sugerencia, no
  confirmada.
- **Economía de monedas/tienda: sigue sin construirse a propósito.** Es una
  idea que surgió de estudiar el HTML del proyecto de Sarah (que sí tenía
  monedas y tienda), pero es una sugerencia del asistente, no un
  requerimiento original. Se dejó en pausa explícitamente.
- **Interacciones táctiles nuevas vs. repetir patrones ya usados:** en un
  punto de la construcción, al notar que ya existían varias mecánicas
  táctiles sin probar en un dispositivo real (dibujar, arrastrar la esponja
  del baño), se decidió deliberadamente que las siguientes funciones
  (minijuegos, cuarto) usaran **toques simples en vez de gestos de arrastre
  nuevos**, para no acumular más superficie sin probar. Por eso "Atrapa la
  comida" se controla con botones de flecha en vez de arrastre, y el
  rompecabezas es tocar-para-intercambiar en vez de arrastrar piezas.
- **Las cinemáticas se priorizaron sobre más minijuegos en un punto** por la
  misma razón: son mayormente lectura pasiva con un toque simple, no otro
  gesto nuevo.
- **Fotos guardadas como data URLs (texto) directo en la base de datos** —
  funciona para probar, pero está marcado explícitamente como algo que NO
  aguanta muchos clientes reales sin cambiar a almacenamiento de archivos de
  verdad (ej. S3 o R2), subiendo la imagen al crear la mascota y guardando
  solo la URL resultante.

## 6. Qué está construido y probado ahora mismo

Todo lo de esta sección fue **verificado tocando la app real en un
navegador** (Vite corriendo en local, backend FastAPI real en local con
SQLite) — no solo revisado por código. Se probó creando mascotas completas
de punta a punta (asistente → backend → link → juego) y viendo la consola
del navegador limpia de errores en cada pantalla.

### Diseño — estilo "hecho a mano / storybook"
Toda la app (asistente y juego) se rediseñó desde el look genérico inicial
a un sistema de diseño propio: paleta cálida tipo papel (`theme.js`),
íconos dibujados a mano (`icons.jsx`, nunca emojis de interfaz), la
mascota respira/parpadea/reacciona al tacto con partículas (`Pet.jsx`), y
cada pantalla (baño, cuarto, minijuegos, cinemática) tiene su propia
escena, no solo un fondo liso.

### El creador de mascota — modular, estilo Tomodachi Life
Se reemplazó por completo el "dibujar desde cero" original. Ahora:
- El creador arma la mascota eligiendo partes (`petParts.jsx`,
  `petAccessories.jsx`): 8 formas de cuerpo, 16 orejas, 8 colas, 10 estilos de
  ojos y 9 de boca (cada uno ya sabe dibujarse distinto en
  normal/feliz/enojado sin que el creador dibuje 3 veces), 7 cachetes, 13
  patrones, 20 accesorios de cabeza, 13 de cuello y 13 detalles de cara.
  Colores libres de cuerpo, pancita, ojos, acento y acento secundario.
  Botones "Sorpréndeme" y "Empezar de cero".

### Estilos / modas — no todo es rosita
Regalar una mascota no es solo "hacer algo cute": hay parejas góticas,
rockeras, metaleras, deportistas, de princesa. `petStyles.js` define **14
estilos** (Kawaii, Gótico, Rockero, Metalero, Punk, Princesa, Rústico,
Hippie, Deportista, Aesthetic, Y2K, Extravagante, Elegante, Angelical).
Cada uno es un preset completo: paleta coherente + un juego de piezas que
van juntas, aplicado de un toque desde una fila de tarjetas que ya muestran
cómo quedaría la mascota.

Dos decisiones importantes:
- Elegir un estilo **no bloquea nada**. Solo reordena cada lista de piezas
  para que las que pegan con ese estilo salgan primero (`orderForStyle`);
  todas las demás siguen ahí, más atrás en la fila.
- Las paletas se ampliaron mucho más allá del pastel: hay bloques oscuros
  (gótico/metalero), terrosos (rústico) y neón (y2k/punk) en cuerpo,
  acento, pancita y ojos. "Sorpréndeme" ahora saca una de 16 paletas
  completas y coherentes, no colores sueltos al azar — antes salían
  combinaciones feas y siempre pastel.

Piezas nuevas de esta tanda: orejas de murciélago, lobo y dragón; ojos
delineados, rebeldes (párpado caído), pestañudos y en equis; bocas de media
sonrisa, labios pintados y grito; cachetes con brillitos y sombreados;
patrones de calaveras, cuadros, tie-dye, leopardo, camuflaje, flores y
rayos; cabeza: bandana, gorra, boina, sombrero de bruja, moño con calavera,
tiara, cresta punk, aureola, cuernos grandes, flequillo emo y sombrero
rústico; cuello: collar de pinchos, choker de encaje, cadenota, medalla,
collar de flores, capa y corbata; cara: piercings, parche de ojo, lágrima,
corpse paint, brillitos y rayas deportivas.

Detalle técnico que salió de aquí: los accesorios de cara ahora pueden
definir `under()`, que se dibuja **debajo de los ojos**. El corpse paint es
maquillaje sobre la piel; si fuera encima (como el resto de los accesorios
de cara) taparía la mirada. Y el preset Metalero va con cuerpo hueso, no
negro: el corpse paint es negro sobre cara pálida, sobre un cuerpo negro no
se vería nada.

Los patrones que cubren superficie (cuadros, tie-dye) se recortan a un
óvalo **calculado a mano** (largo de cada línea derivado de la ecuación de
la elipse) en vez de usar máscaras SVG — así nunca se salen del cuerpo sin
tener que inventar ids únicos ni ensuciar la consola.

### Calidad del arte (reescrito por completo)
La primera versión de las partes eran trazos planos — un accesorio era
literalmente "dos líneas". Se rehizo todo el arte con criterio de
ilustración:
- **Volumen en todo:** cada pieza lleva su luz y su sombra. El cuerpo se
  pinta en un tono oscurecido y encima la misma silueta reducida un 6% y
  corrida hacia la luz; lo que asoma abajo-derecha es la sombra. Como la
  copia de encima está escalada hacia adentro, el sombreado nunca puede
  salirse del contorno, sea cual sea la forma.
- **Anatomía real:** las orejas tienen interior, pelusa y sombra; el cuerpo
  tiene patitas con almohadillas y pancita; los ojos tienen iris, pupila y
  dos brillos; las bocas tienen lengua, colmillos o hocico con naricita.
- **Los accesorios se ponen, no se pegan encima.** Cada accesorio de cuello
  puede tener una capa `back()` que se dibuja DETRÁS del cuerpo. Por eso la
  bufanda ahora pasa por atrás del cuello y vuelve al frente, con pliegues,
  nudo lateral, caída y flecos — se comprobó midiendo que asoma 143px por
  fuera de la silueta del cuerpo, que es lo que la hace leer como envuelta.
- **Verificación automática del arte:** existe la ruta interna `/artcheck`
  que muestra todas las variantes de todas las partes en una sola página,
  los 14 estilos en sus 3 ánimos, y una sección extra que repite los
  accesorios **sobre un cuerpo oscuro** — que es donde se pierden si el
  contraste está mal.

  La validación no es a ojo: se rasteriza cada combinación a canvas y se
  inspecta el alfa píxel por píxel. Última corrida: **251 celdas de
  `/artcheck` + 90 mascotas aleatorias completas + los 42 PNG finales de
  los 14 estilos en 3 ánimos** → 0 recortes contra el borde del lienzo, 0
  piezas vacías, 0 opciones que se vean idénticas entre sí, 3 ánimos
  siempre distintos, consola limpia y build de producción sin avisos.

  Esta prueba encuentra bugs reales: en esta tanda destapó 4 recortes (la
  cola rizada, los flecos de la bufanda, el dije de la cadena y la punta
  de la corbata se salían del lienzo por unos píxeles). **Importante:** no
  sirve `getBBox` — ignora el recorte y da falsos positivos en todo. Hay
  que rasterizar y mirar el alfa de los bordes.
- **Retocar a mano (opcional):** encima de la mascota generada, se puede
  dibujar a mano con el mismo motor de pincel/goma/cuentagotas de antes —
  igual que "dibujar encima" en Tomodachi Life — un lienzo transparente por
  ánimo, con deshacer/rehacer y "copiar desde Normal".
- Al finalizar, la receta de partes + el retoque a mano se **rasterizan a
  3 PNG normales** (`PetRecipe.jsx`, función `recipeToPngDataUrl`). El
  backend no sabe ni le importa si el dibujo vino de partes o de pincel
  libre — sigue guardando exactamente los mismos 3 campos que antes.

### Asistente de configuración, 10 pasos
Bienvenida, Nombres, Diseñar mascota (el creador modular de arriba),
Comidas (con **imagen opcional** por comida, subida desde el celular),
Frases, Fotos (con regla dura: **mínimo 3 marcadas "póster" y 3 marcadas
"rompecabezas"** para poder avanzar — contador visible en vivo), Música
(pega el link normal de Spotify o YouTube, **se convierte solo** a URL de
embed y se muestra una vista previa real que suena antes de agregarlo —
antes esto se rompía si pegabas el link de compartir en vez del de
insertar), Ropa (opcional — diseña prendas reusando el mismo motor de
retoque, con nombre y precio en monedas), **Deco** (nuevo), Resumen.

El paso **Deco** deja subir fotos de objetos con significado (un vinilo,
una entrada de concierto, un peluche) para que aparezcan en la tienda del
juego y se puedan colocar en el cuarto. Trae un recortador de fondo
propio (`BgRemover.jsx`) con tres herramientas: **varita** (relleno por
inundación que borra los píxeles conectados de color parecido al que
tocas, con tolerancia ajustable), **borrador** a mano y **traer de
vuelta** (repinta el original dentro del pincel), más deshacer/rehacer y
"volver al original". Nada de esto usa IA — es aritmética de color, la
recorta la persona. Al exportar se recortan los márgenes transparentes y
se guarda la proporción para dibujarlo sin deformar.

### El juego
- **Principal:** mascota viva, burbuja de diálogo, barras de hambre/amor
  con decaimiento por tiempo real, medidor de monedas con botón directo a
  la Tienda, dock de 5 acciones (Alimentar, Bañar, Jugar, Cuarto, Tienda).
- **Regla de juego importante:** alimentar solo sube **hambre** (nunca
  amor); acariciar solo hace hablar a la mascota (nunca sube amor). El
  amor **solo** sube bañando o jugando minijuegos — igual que en el juego
  original de Sarah. Verificado tanto en frontend como en el endpoint
  `/feed` del backend (antes el backend seguía subiendo amor ahí, ya
  corregido).
- **Navegación de cuartos:** puerta visible en la escena principal para
  entrar al Baño y volver, igual que el slide lateral del juego de Sarah.
- **7 minijuegos** (todos otorgan monedas, algunos también amor/hambre):
  Memory Match, Atrapa la comida (con imágenes reales de las comidas
  configuradas), Rompecabezas deslizante, Golpea al topo, Serpiente
  golosa, Quiz personalizado (preguntas auto-generadas desde las comidas
  configuradas: "¿Le gusta comer X?"), Batalla naval (un jugador, tablero
  6x6 oculto).
- **Tienda** con 5 pestañas: **Muebles** (17 piezas dibujadas a mano:
  cama, sofá, estantería, tocadiscos, alfombra, planta grande, escritorio,
  espejo, puf, guitarra, baúl, estante-ataúd, pesas, tocador, ventana,
  repisa, guirnalda de luces — las tres últimas van colgadas en la pared),
  **Deco** (primero los objetos que subió quien regaló, con su nombre y su
  “por qué es especial”; después el catálogo fijo de 8), **Pared** (12
  pinturas y papeles: liso, rayas, lunares, ladrillo, tablones, carbón,
  vinotinto, medianoche con estrellas, neón…), **Piso** (6 acabados:
  madera clara/oscura, ajedrez, terracota, alfombrado, piedra) y **Ropa**.
  Pared y piso se compran una vez y luego se cambian gratis.
- **Monedas y estado de juego** (`gameState.js`): persistente en
  localStorage por slug, separado de la config del backend — monedas,
  muebles/decoración/paredes/pisos comprados, qué está colocado y dónde,
  la prenda equipada y hasta dónde quedó parada la mascota. Trae migración
  del formato viejo (`placedDecor`, una lista de ids apilados en una
  esquina) para que nadie pierda lo que ya tenía.

### El cuarto (reconstruido por completo)
Antes era una caja de 300×280 con tres huecos fijos para pósters y la
decoración apilada en una esquina. Ahora es un **mundo ancho de 1600×430
unidades** del que en pantalla solo se ve un pedazo:

- **La mascota se pasea sola** de un lado a otro, con arranque y frenado
  suaves, balanceo al caminar y pausas de entre 2,6 y 9 segundos. Los
  paseos son cortos casi siempre y largos de vez en cuando (la distancia
  se sesga con `rnd()²`); si fueran uniformes se pasaría la vida cruzando
  el cuarto de punta a punta. Medido sobre 5 minutos simulados: camina el
  ~50% del tiempo, se detiene ~25 veces, tramos de ~190 unidades y va
  hacia ambos lados por igual.
- **La cámara la sigue**, pero si arrastras con el dedo manda tu arrastre
  y la cámara vuelve a seguirla 3,2 segundos después.
- **Muebles, decoración y pósters se colocan libremente** y se pueden
  volver a mover, agrandar, voltear o quitar cuando quieras (botón
  “Acomodar”). Lo que va en la pared se queda en la pared y lo que va en
  el piso se queda en el piso; los muebles siempre quedan detrás de la
  mascota. Lo nuevo aterriza donde estés mirando y **busca un hueco
  libre** — si no, todo caería en el mismo punto y verías una pila.
- Los objetos se dibujan de atrás hacia adelante según su altura en el
  piso, así se gana profundidad sin trucos.

Detalle técnico: la animación **no pasa por el estado de React**. La
posición de la mascota y de la cámara viven en refs y se escriben directo
sobre el `transform` de dos divs. Con estado sería un re-render por cuadro
y en un celular se sentiría pesado. Además la posición inicial se pinta en
un `useLayoutEffect`, para que el cuarto se vea bien incluso si
`requestAnimationFrame` está suspendido (pestaña en segundo plano).
- Cinemática y reproductor de música igual que antes.
- **Rutas reales:** `/crear`, `/p/:slug`.

### Robustez de creación (sin backend)
- Si el backend no responde, `api.js` guarda la mascota completa en
  localStorage y el link `/p/:slug` funciona igual **en el mismo
  dispositivo** — el creador nunca ve el error crudo de antes ("No pudimos
  crear el link"), ve un mensaje claro y la app sigue funcionando.
- CORS del backend arreglado (`main.py`, `CORSMiddleware`) — antes el
  navegador bloqueaba toda petición del asistente al backend en local por
  estar en puertos distintos; era la causa real del error que se veía.

### Backend (FastAPI + SQLAlchemy)
- Tablas: `pets`, `food_preferences` (ahora con `image` opcional),
  `phrases`, `photos` (`used_for`: puzzle o poster), `songs`, **`outfits`**
  (nueva: nombre, precio, 3 dibujos por ánimo).
- Endpoints sin cambios de forma, solo de contenido: crear mascota, obtener
  por slug, manifest.json dinámico, alimentar (ya sin tocar el amor).
- Probado de extremo a extremo con peticiones reales del navegador (no solo
  curl) — creación completa con fotos, comidas con imagen, prendas, y
  lectura posterior, verificado que todo persiste correctamente.
- `render.yaml`, `DEPLOY.md` sin cambios — la nueva tabla `outfits` la crea
  sola `create_all` al desplegar, no hace falta migración manual.

## 7. Qué falta (honesto, sin inflar)

### Para que sea un producto vendible, no solo una app que funciona
- **No hay forma de cobrar.** Cualquiera puede crear mascotas gratis,
  ilimitadas veces. Probablemente lo más importante que falta si la meta es
  vender esto.
- **Quien crea la mascota no puede volver a editarla.** No hay cuentas ni
  login — una vez creada, no hay forma de corregir nada.
- **No hay "momento de entrega".** Quien recibe el link cae directo a la
  pantalla del juego, sin bienvenida ni mensaje personal de quien lo hizo —
  para un producto que se trata exactamente de esto, es un hueco grande.
- **No hay términos de servicio ni política de privacidad.** Se suben fotos
  de personas reales a una base de datos; hace falta al menos algo básico
  si esto lo va a usar gente además del creador.

### Cosas técnicas marcadas como "debería funcionar" pero sin confirmar
- El ícono del manifest usa la imagen como data URL directo — no se ha
  confirmado que iOS y Android lo acepten así al agregar a inicio.
- Guardar imágenes como texto en la base de datos no aguanta muchos
  clientes reales — necesita cambiar a almacenamiento de archivos real.
- Todo se probó en un navegador de escritorio automatizado (viewport móvil
  simulado) — nunca se ha tocado con un dedo real en un iPhone/Android
  físico. Los gestos táctiles (dibujar, esponja del baño) deberían
  funcionar igual pero no está confirmado en hardware real.

### Ya identificado, en pausa a propósito
- **Elegir el estilo del cuarto desde la configuración.** Ya se puede
  dejar el cuarto gótico, rústico o neón comprando pared, piso y muebles
  en la tienda (todos llevan `tags` con el estilo al que pegan), pero
  quien regala todavía no puede dejarlo preconfigurado desde el
  asistente: el cuarto arranca en crema + madera y lo cambia quien juega.
  Los `tags` de `roomCatalog.jsx` ya están puestos justamente para eso.
- **Repintar muebles.** El modelo ya lo soporta (cada objeto colocado
  guarda un `paint`, y `FURNITURE_PAINTS` tiene 8 combinaciones de
  madera/tela), pero todavía no hay botón para cambiarlo desde el juego —
  todo se coloca con la pintura “natural”.

## 8. Estructura de archivos entregada

```
frontend/    proyecto real de Vite — esto es lo que se corre y se despliega
backend/     FastAPI + base de datos — esto es lo que se despliega aparte
historial/   versiones sueltas de partes del proyecto de sesiones
             anteriores (ya integradas dentro de frontend/, no hacen falta
             para correr nada, quedaron solo como registro)
```

Dentro de `frontend/src/`:
- `App.jsx` — rutas
- `pages/CreatePage.jsx`, `pages/GiftPage.jsx` — envoltorios de ruta;
  `GiftPage.jsx` es donde vive el truco del manifest dinámico
- `components/PetGiftWizard.jsx` — el asistente completo (incluye el
  creador modular de mascota, el diseñador de prendas y el motor de
  retoque a mano)
- `components/PetGiftGame.jsx` — el juego completo (todas las pantallas:
  principal, baño, cuarto, tienda, 7 minijuegos, cinemática, música)
- `components/Pet.jsx` — la mascota viva (respira, parpadea, partículas)
- `components/icons.jsx` — set de íconos dibujados a mano
- `petParts.jsx`, `petAccessories.jsx` — librería de partes del creador
  modular (cuerpos, orejas, ojos, boca, cola, accesorios, patrones), con
  luz/sombra propia y capa trasera para los accesorios que envuelven
- `petStyles.js` — los 14 estilos/modas: preset de paleta + piezas de cada
  uno, y el reordenamiento de listas según el estilo activo
- `components/Room.jsx` — el cuarto: mundo ancho, cámara, paseo de la
  mascota y colocación libre de objetos. El paseo (`stepPet`,
  `stepCamera`) está fuera del componente a propósito, para poder
  probarlo sin depender de que el navegador pinte cuadros
- `roomCatalog.jsx` — muebles, pinturas de pared y pisos
- `components/BgRemover.jsx` — recortar el fondo de una foto a mano
  (varita por inundación, borrador, traer de vuelta)
- `pages/ArtCheck.jsx` — página interna (`/artcheck`) que muestra todas
  las variantes de arte juntas, para revisarlas de un vistazo
- `PetRecipe.jsx` — compone una "receta" de partes en SVG y la rasteriza
  a PNG (con overlay de retoque a mano opcional)
- `theme.js` — sistema de diseño (colores, sombras, tipografía)
- `embed.js` — normaliza links de Spotify/YouTube a URL de embed
- `gameState.js` — monedas y progreso de tienda, persistente por slug
- `shopCatalog.jsx` — catálogo fijo de decoración de la tienda
- `api.js` — capa de datos (backend con fallback a localStorage)

Dentro de `backend/`: `main.py` (rutas), `models.py` (tablas, incluye
`Outfit`), `schemas.py` (validación), `database.py` (conexión), `DEPLOY.md`
(guía de despliegue).

## 9. Sobre quien está construyendo esto

- Estudiante de ingeniería de sistemas/computación y desarrollador web
  freelance, en Colombia.
- Ya tiene experiencia real desplegando en Netlify (el proyecto de Sarah),
  pero al momento de este proyecto no tenía claro cómo funciona el
  despliegue de un backend con base de datos — eso ya se le explicó durante
  la conversación.
- Está tratando este proyecto como algo a mediano plazo, sin apuro — prefiere
  que se construya completo y bien a que se apure.
- Prefiere que se le hable directo y honesto sobre qué está probado de
  verdad y qué no, en vez de que se le dé por hecho que algo funciona sin
  haberlo verificado.
