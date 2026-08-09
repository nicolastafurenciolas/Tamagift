@echo off
echo Instalando Pillow si es necesario...
python -m pip install Pillow
echo.
echo Eliminando fondos blancos de los sprites de Pusheen...
python remove_bg.py
echo.
pause
