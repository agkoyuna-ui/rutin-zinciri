@echo off
chcp 65001 >nul
rem Rutin Zinciri'nin Windows acilisinda baslamasini kapatir. Verilere dokunmaz.
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Rutin Zinciri.vbs" 2>nul
echo Tamam. Rutin Zinciri artik Windows acilinca kendiliginden baslamayacak.
echo Su an calisiyorsa bilgisayari yeniden baslatinca kapanir.
pause
