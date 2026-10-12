@echo off
chcp 65001 >nul
rem Windows her acildiginda Rutin Zinciri programini pencere acmadan baslatir.
set "HEDEF=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Rutin Zinciri.vbs"
> "%HEDEF%" echo CreateObject("WScript.Shell").Run "wscript.exe ""%~dp0gizli-baslat.vbs""", 0, False
if errorlevel 1 (
  echo Ayarlanamadi.
  pause
  exit /b 1
)
wscript.exe "%~dp0gizli-baslat.vbs"
echo Tamam. Rutin Zinciri artik Windows acilinca kendiliginden baslayacak.
echo Vazgecmek icin "Otomatik baslat - kapat.bat" dosyasini ac.
pause
