@echo off
echo Copiando imagenes de trofeos...
set SRC=C:\Users\nicol\.gemini\antigravity\brain\bb9d4ca4-34fa-4f86-b7df-e153c7f7ea4a
set DST=C:\Users\nicol\OneDrive\Documentos\AntigravityPruebas\pusheen-game\assets\images

copy "%SRC%\trophy_sushi_1773361412322.png" "%DST%\trophy-sushi.png" /Y
copy "%SRC%\trophy_memory_1773361423463.png" "%DST%\trophy-memory.png" /Y
copy "%SRC%\trophy_battle_1773361448141.png" "%DST%\trophy-battle.png" /Y
copy "%SRC%\trophy_quiz_1773361461600.png" "%DST%\trophy-quiz.png" /Y

echo Listo!
pause
