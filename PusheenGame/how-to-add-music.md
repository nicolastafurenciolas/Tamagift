# 🎹 Cómo agregar tu música al juego

¡Hola Nicolás! Nini, aquí tienes las instrucciones para agregar la música que compusiste para Sarah al juego.

Como el juego se ejecuta en el navegador (o como app PWA), utiliza archivos de audio estándar. He configurado el código para que busque automáticamente 4 archivos de audio específicos en la carpeta `assets/audio/`.

## Pasos:

1. Graba y exporta tu música/efectos en formato **.mp3** (es el más compatible para web y móviles).
2. Nombra los archivos **exactamente** así:
   - `bg-music.mp3` → Esta es la música de fondo principal. Sonará en bucle (infinitamente) mientras Sarah juega.
   - `happy.mp3` → Un sonido corto (1-2 segundos) que sonará cuando le des de comer algo que le gusta a Sarah.
   - `angry.mp3` → Un sonido corto para cuando le des algo que no le gusta (ej: tomate).
   - `coin.mp3` → El sonidito al recolectar Roccoins.
3. Copia estos 4 archivos dentro de la carpeta:
   `C:\Users\nicol\OneDrive\Documentos\AntigravityPruebas\pusheen-game\assets\audio\`

## ¡Listo!
El juego cargará esos archivos automáticamente y ya he dejado programado tu nombre en los créditos (Menú de la moneda arriba a la derecha > Ajustes/Créditos) para que Sarah sepa que tú la hiciste.

## Notas:
- Si no pones algún archivo, el juego seguirá funcionando perfectamente, simplemente no sonará ese efecto específico.
- En los celulares, la música de fondo a veces requiere que el usuario toque la pantalla al menos una vez para empezar a sonar (es una regla de Chrome/Safari para no molestar a los usuarios). Por eso, sonará justo después de que ella toque el botón de "¡Entrar a jugar!" en la pantalla de cumpleaños.
