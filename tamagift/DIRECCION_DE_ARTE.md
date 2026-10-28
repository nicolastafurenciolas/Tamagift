# Dirección de arte de Tamagift

Lo más importante del proyecto es que **se vea hermoso**, en los seis
estilos. No "correcto", no "funciona": hermoso, como un juego publicado
hecho por una ilustradora con tiempo. Las mecánicas ya están; el arte es
lo que hace que alguien se enamore del regalo.

Lo que la dueña del proyecto rechazó (y no se puede repetir):

- Escenarios armados con figuras sueltas: "un par de tienditas y círculos
  como frutas, y ya". Una pastelería que son "postres alineados".
- Una zanahoria que es "un triángulo en un hueco", y que además se ve
  entera por debajo de la tierra en vez de quedar tapada.
- Muebles que son cajas lisas: sin madera, sin cojines, sin volumen.
- Hacer las cosas rápido para tachar la lista.

## 1. Coherencia del mundo

- **Una sola perspectiva** (ver `art/room/draw.js`): vista 3/4 de frente,
  sin punto de fuga. Cada objeto muestra su cara de adelante y, encima, su
  tapa (profundidad × 0.5). Lo redondo apoyado es una elipse aplastada
  (alto = ancho × 0.5). Nunca caras laterales en trapecio.
- **Una sola luz**: de arriba a la izquierda. La tapa es lo más claro, el
  frente el color base, el lado derecho y lo de abajo más oscuro. Brillos
  (`shine`) arriba a la izquierda; sombras de contacto (`tone`) abajo.
- **Escala**: la mochi mide 200 unidades del mundo. Una cama le queda a su
  medida, una taza le cabe en la mano, una flor no es del tamaño de un
  árbol. En los mapas y escenas, todo a la misma escala entre sí.
- **Física y lógica**: nada flota sin razón (lo que cuelga tiene su
  cuerda o su clavo); lo que está apoyado tiene sombra de contacto; lo que
  está dentro de algo queda tapado por el borde de adelante (una zanahoria
  en la tierra: se ve el montículo, las hojas y el hombro naranja; la
  punta NO se ve; el borde de tierra de adelante se dibuja encima). Lo que
  está detrás va primero en el orden de dibujo.
- **Agrupar y contar una historia**: en una escena las cosas forman
  grupos con sentido (un puesto del mercado con su toldo, mostrador,
  canastas llenas, un letrero de precio, una balanza), no dispersas como
  calcomanías. Primer plano, plano medio, fondo.

## 2. Forma

- Lenguaje kawaii: formas blandas, esquinas redondeadas, proporciones
  regordetas, siluetas que se leen a 60 px.
- **Nunca primitivas solas**: un círculo no es una manzana. Una manzana
  tiene su hendidura arriba, su palito, su hoja, su brillo y su color con
  un tono más oscuro abajo. Una caja de madera tiene tablas, clavitos,
  borde de grosor y una tapa. Un toldo tiene festón, rayas que siguen la
  curva, sombra debajo y sus varillas.
- Grosor: los tableros, tapas, marcos, repisas tienen grosor visible
  (borde de adelante + tapa). Las patas tienen sombra.
- Variedad: tamaños distintos, un poco de asimetría, ladeos leves. Nada
  repetido idéntico en fila salvo que tenga sentido (frascos en un
  estante, y aun así de colores y alturas distintas).

## 3. Material y detalle

Usar los roles (`face`, `part`, `flat`, `line`, `tone`, `shine`) para dar
volumen; cada estilo los redibuja a su manera.

- **Madera**: base, tapa más clara, vetas finas (líneas de un tono más
  oscuro, onduladas, NO rectas perfectas), canto iluminado arriba,
  sombra debajo de los voladizos, tiradores con brillo.
- **Tela / cojines**: formas infladas, costuras o capitoné, arrugas en los
  pliegues (tone), sombra donde se hunden, ribete de otro tono.
- **Metal**: brillo fuerte en franja, reflejo del color de al lado.
- **Vidrio**: tinte suave transparente, dos rayas de brillo diagonales,
  borde más marcado, lo de adentro un poco desaturado.
- **Cerámica**: esmalte con brillo redondo, borde del labio más claro.
- **Plantas**: racimos de hojas superpuestas con 3 tonos, nervaduras,
  hojas de adelante más claras, tierra con textura.
- **Comida**: que dé hambre: brillos jugosos, migas, capas visibles,
  colores saturados pero no estridentes.
- **Detalle con propósito**: lo justo para que se lea el material y la
  historia. Más detalle en lo grande; lo chico, limpio.

## 4. Color

- Paleta pastel cálida y armónica, con contraste suficiente para leer.
- Sombras con el tono corrido (no gris): `tone(c, -k)` ya corre el tono.
  Nada de negro puro; el contorno es `INK` (#3A2A3E).
- Cada material con 3–4 valores (luz, base, sombra, hondo): `mat(c)`.
- Un acento por objeto (el moño, la fruta roja, el letrero), no cinco.

## 5. Pixel art (el estilo por defecto: tiene que verse MUY bien)

El kit de pixel (`art/kit.js`) rasteriza cada parte en una rejilla de
2 px de pantalla por píxel de arte, con contorno de 1 px y rampa de
color por parte. Para que se vea a mano y no "un SVG pixelado":

- Diseñar los detalles de **al menos 2–3 unidades** de grosor: lo más
  fino desaparece o queda como puntos sueltos. Revisar a tamaño real.
- Líneas largas en ángulos limpios (horizontal, vertical, 1:1, 1:2): las
  curvas suaves y ángulos raros dan escaleras feas.
- Sin píxeles huérfanos ni "ruido": agrupar el detalle en racimos.
- Contorno selectivo: el kit ya contornea; no sumar contornos dobles.
- Si algo no se puede leer en pixel, darle una versión propia con
  `data-only="pixel"` / `data-skip="pixel"`, o un sello hecho a mano
  (`art/pixelStamps.js`, `art/pixel/*`).
- Comparar a tamaño de juego: ¿se entiende qué es sin leer el nombre?

## 6. Los otros cinco estilos

- **Lo-fi**: degradados por parte y luz cálida; funciona con formas
  limpias y pocas líneas sueltas.
- **Retro**: paleta de los 70, contorno marrón grueso: las formas tienen
  que ser claras y grandes.
- **Papel recortado**: cada parte es una cartulina; demasiadas partes
  diminutas se ven como confeti. Agrupar.
- **Neón**: rellenos oscuros y tubos de luz del color de cada parte: la
  forma la define el contorno. Partes muy juntas del mismo color se
  funden; separar con color.
- **Sticker**: colores vivos, borde blanco grueso alrededor de todo.
- **Revisar SIEMPRE en los seis** antes de dar algo por terminado.

## 7. Escenas (mapas, baño, fondos de minijuegos)

- Componer como una ilustración: horizonte o planos, un camino que se
  lee, grupos con historia, marcos naturales en los bordes (árboles,
  toldos, estantes) y aire alrededor de lo que se toca (paradas,
  etiquetas, botones).
- Cada zona con identidad propia y reconocible a primera vista.
- Transiciones entre zonas con sentido (un puente, una cerca, un cambio
  de suelo), no un corte de color.

## 8. Proceso (obligatorio)

1. Mirar el estado actual en el laboratorio (`/arte?set=...`) en los seis
   estilos, a tamaño grande, y anotar qué está mal.
2. Rehacer pensando la pieza: forma, material, luz, historia.
3. Revisar en el laboratorio: tamaño grande (≥ 220), **recortes
   ampliados** de cada pieza, y a tamaño de juego. Leer las imágenes.
4. Criticar con esta lista y volver al paso 2. **Mínimo tres vueltas**
   por pieza; las importantes, más.
5. Revisar en el juego real (`/dev/<pantalla>?estilo=…`).

Lista de control por pieza: ¿se reconoce sin el nombre? ¿perspectiva y
luz del mundo? ¿materiales que se leen? ¿colores armónicos? ¿nada flota
ni atraviesa? ¿se ve bien en los seis estilos? ¿la pondría una
ilustradora profesional en un juego publicado?

## Herramientas

- Laboratorio: `/arte?set=<conjunto>&size=220&solo=pixel,sticker` y
  `/arte?set=muebles3&ids=cama,sofa` (mueble en un rincón con la mochi),
  `/arte?set=deco3&ids=osito` (adorno en un rincón, a escala),
  `/arte?set=vestidor&slot=ropa`, `/arte?set=comida`, `/arte?set=juegos`.
- El juego: `/dev/<pantalla>?estilo=pixel` (`main`, `bathroom`, `golosinas`,
  `cocina`, `memoria`, `rompecabezas`, `cruzar`, `volar`…).
- Capturas sin ventana con Playwright + Chrome (`channel='chrome'`) y
  leer el PNG; las capturas del panel del navegador no sirven.
