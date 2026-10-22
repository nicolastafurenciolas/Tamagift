# Tamagift: un mundo vivo al que dan ganas de volver

Documento de diseño. Dice **qué** se construye y **por qué**, para que el
juego crezca ordenado. El cómo (archivos, funciones) está en `ESTILOS.md`
y en los comentarios del código.

## 1. Para quién y qué buscamos

Quien recibe el regalo es sobre todo una chica de 15 a 35 años (también
puede ser un chico). Le gusta personalizar: ropa, peinados, colores,
su cuarto, que todo "se parezca a ella". El regalo no puede ser algo que
se abre una vez y se olvida: tiene que tener razones para volver **cada
día** y sorpresas que den ganas de contarle a alguien.

Juegos de referencia y lo que tomamos de cada uno:

| Juego | Lo que tomamos |
|---|---|
| Tomodachi Life | Sucesos inesperados y graciosos que te piden hacer algo; visitas. |
| Animal Crossing | Hora real (día/noche), clima, paquetes que llegan, temporadas, colecciones. |
| Tamagotchi / Pou | Necesidades que bajan solas; comida con consecuencias; vestir a la mascota. |
| Neko Atsume | Colecciones (bichitos, cápsulas) que se completan con el tiempo. |
| Candy Crush | Niveles cortos con objetivos y estrellas; progresión visible. |
| Cooking Mama / Papa's | Cocinar con gestos (cortar deslizando, revolver en círculos). |
| Stardew / huertas | Sembrar hoy, cosechar mañana: una cita diaria con el juego. |

## 2. Los ciclos que traen de vuelta

- **Cada visita (1-5 min):** mimarla, darle de comer, bañarla, ver qué
  pasó mientras no estabas (sucesos, cartas, paquetes), un minijuego.
- **Cada día:** regalo diario, 3 retos del día, ración de sus comidas
  favoritas que dejó quien regaló, la huerta para regar o cosechar, el
  clima y la hora cambian el cuarto.
- **Cada semana:** reto grande con premio exclusivo, colección de
  bichitos y cápsulas, temporada (San Valentín, Amor y Amistad,
  Halloween, Navidad…).
- **A largo plazo:** el vestidor y el cuarto (cientos de cosas), niveles
  de los minijuegos con estrellas, álbum de recuerdos.

## 3. El mundo vivo

### Hora del día (hora real del teléfono)
| Momento | Horas | Qué cambia |
|---|---|---|
| Mañana | 6-11 | Cielo celeste claro; la mochi se despierta y se estira. |
| Día | 11-17 | Luz plena. |
| Atardecer | 17-19 | Cielo naranja/rosado; luz cálida. |
| Noche | 19-6 | Cielo con luna y estrellas; el cuarto se oscurece; lámparas, guirnaldas, velas y letreros se encienden y alumbran alrededor. Desde las 22 la mochi tiene sueño. |

### Clima (uno por día, fijo para todo el día)
Sol (lo normal), nublado, lluvia (gotas en la ventana; después arcoíris
al rato), nieve (solo diciembre-enero). Se ve por las ventanas.

### Sucesos (lo inesperado)
Un suceso a la vez, como mucho uno cada ~4 minutos de juego y siempre uno
al entrar si pasaron más de 3 horas. Cada uno pide un gesto corto y da
algo a cambio.

| Suceso | Cuándo | Qué haces | Recompensa |
|---|---|---|---|
| Din-don: paquete | Al comprar | Ir a la puerta, abrir la caja | Lo comprado |
| Carta de quien regaló | 1 al día | Abrirla | Una de sus frases o fotos |
| Regalo misterioso | 1 al día (al entrar) | Abrir la caja | Monedas, comida o algo de ropa |
| Antojo | Al azar | Darle esa comida en 10 min | Amor y monedas |
| Bichito | Al azar (luciérnaga de noche) | Atraparlo con un toque | Va al álbum de bichitos |
| Hipo | Al azar | Darle un susto en el momento justo | Amor |
| Migas y polvo | Después de comer / con el tiempo | Barrer tocando | Monedas |
| Moneda perdida | Al azar | Encontrarla brillando bajo un mueble | Monedas |
| Visita | 1 al día como mucho | Una mochi amiga toca la puerta: charla, trae un regalo o te reta a un minijuego | Lo que trae / premio del reto |
| Resfriado | Si está muy sucia o hace frío | Baño + sopa + dormir | Se cura |
| Sueño | De noche, dormida | Ver su sueño | A veces un recuerdo (foto) |
| Fiesta | Aniversario del regalo y fechas especiales | Pastel y decoración de temporada | Algo exclusivo |

### Necesidades y consecuencias
- **Hambre** (baja en ~50 min), **Amor** (~1 h 40), **Energía** (baja
  jugando y despierta de noche; sube durmiendo), **Limpieza** (baja con
  el tiempo y al comer; sube bañándola). Si está sucia se ven manchitas
  y moscas; si tiene sueño bosteza y se pone de mal humor.
- **Peso:** cada comida tiene tipo. Chatarra y dulces suben el peso;
  frutas, verduras y comida casera lo bajan; jugar también. Con el peso
  alto la mochi se ve **más redondita** (cuerpo un poco más ancho y
  bajito, tierno, nunca burlón) y se cansa más rápido; vuelve a su forma
  comiendo mejor. El tono de los mensajes siempre es cariñoso.
- El ánimo sale de todo eso: feliz si está bien cuidada, triste si
  falta amor, de mal humor con hambre o sueño.

## 4. Economía

Monedas por: minijuegos, retos del día, sucesos, baño (cada 30 min),
regalo diario. Se gastan en: tienda (moda, peluquería, muebles, deco,
pared y piso), súper (comida), semillas.

Precios guía: comida 5-30 · semillas 10-25 · accesorio pequeño 40-90 ·
ropa 80-220 · peinado 120-180 · tinte 60 · decoración 40-200 · mueble
80-400 · pared o piso 100-180 · rediseño 1000. Un día normal de juego
da 150-300 monedas: algo bonito cada día, algo grande cada semana.

## 5. La tienda

Secciones: **Moda** (ropa y accesorios), **Peluquería** (peinados y
tintes), **Muebles**, **Deco**, **Pared y piso**, **Súper** (comida),
**Jardín** (semillas), **Pósters** y **Temporada**.

Hay de todo para muchos gustos (tierno, romántico, gamer, gótico,
playero, de cocina, de libros, brillante, natural…), pero **sin
etiquetas**: nada se presenta como "para otakus" o "para coquettes". Las
etiquetas encasillan y pueden espantar; la tienda se ordena por **qué es
y dónde va** (cabeza, ropa, en la mano; muebles por tipo; deco para mesas
y paredes o para el piso), y cada quien arma su mezcla.

Toda prenda y casi todo objeto de casa **deja elegir color** antes y
después de comprarlo (16 colores de tela + 4 de metal).

### La entrega (nada aparece de la nada)
1. Compras: suena la caja registradora y el pedido queda "en camino".
2. Al salir de la tienda, a los pocos segundos **suena el timbre**; la
   cámara va a la puerta y la mochi corre a abrir.
3. En la puerta hay una caja: la tocas, se abre con brillitos y sale lo
   que compraste.
4. Muebles y deco salen listos para ponerlos donde quieras; la ropa, para
   probártela; la pintura y las baldosas abren el modo de obra.

### Pintar y enchapar con el dedo
- **Pared:** un rodillo sigue tu dedo y pinta franjas de pared de arriba
  a abajo; donde pasa queda la pintura nueva, con bordes rectos. La
  cámara avanza sola si llegas al borde. Al terminar, brillitos.
- **Piso:** deslizas el dedo y van cayendo las baldosas (o tablas) una a
  una, encajadas en su cuadrícula exacta.

## 6. El vestidor

Ranuras que se pueden usar a la vez: **cabeza**, **pelo**, **cara**
(lentes, maquillaje, stickers), **cuello**, **ropa**, **espalda** (alas,
mochilas, capas) y **en la mano** (té de burbujas, varita, peluche…).
Cada cosa puesta guarda su color.

- **Básicos:** lo que eligió quien regaló más un set inicial gratis; se
  cambian cuando quieras.
- **De la tienda:** más de cien, cada uno con sus colores.

## 7. Rasgos nuevos de la mochi
Peinados (flequillo, coletas, moñitos, melena, rulos, ahoge…), más
ojos, bocas, cejas, marcas en la cara (corazón, estrella, luna, pecas),
más animalitos y colas. Todo anclado a la geometría del cuerpo, igual
que ahora.

## 8. Decoración con personalidad
No solo cosas simples: rincones que cuentan quién es. Por ejemplo:
tocador con luces, estante de figuras y rincón gamer, cápsulas y
peluches, canasta de pícnic y hongos, candelabro y bola de cristal,
silla mariposa y bola disco, proyector de estrellas, caballete, tapete
de yoga… (sin etiquetarlos por "tipo de persona", ver §5).

## 9. Minijuegos: pocos pero muy buenos
Principios: partidas de 1-3 minutos, una meta clara, progreso que se
ve, algo distinto cada vez, y que lo que ganas sirva en el mundo.

- **Niveles con estrellas** en los juegos que lo aguantan (Conecta 3 con
  objetivos y golosinas especiales, Memoria, Rompecabezas).
- **Reto del día por juego** (por ejemplo "atrapa 30 sin tocar brócoli").
- **Cocina** (nuevo): recetas con gestos; lo que cocinas va a la nevera
  y alimenta a la mochi (comida casera = sana).
- **Huerta** (nuevo, sistema diario): sembrar, regar, cosechar frutas y
  verduras para la nevera.
- Los arcade (volar, cruzar, atrapar, torre, serpiente) ganan objetos
  para recoger, dificultad que sube y metas por partida.

## 10. Arte
- Una perspectiva para todo el mundo (ver `ESTILOS.md`).
- Íconos y comida en pixel art **hechos a mano píxel a píxel**, simétricos
  cuando deben serlo; en los otros estilos, dibujos vectoriales
  cuidados con su kit.
- Antes de dar algo por hecho se revisa la imagen en los seis estilos
  buscando errores de lógica (piezas sueltas, líneas que sobran,
  asimetrías, objetos que no se reconocen).
