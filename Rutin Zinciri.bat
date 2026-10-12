@echo off
chcp 65001 >nul
title Rutin Zinciri
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. https://nodejs.org adresinden kurup bu dosyayi tekrar ac.
  pause
  exit /b 1
)
node pc\server.js --ac
if errorlevel 1 pause
