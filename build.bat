@echo off
title ASCII Camera Pro - Compilation & Packaging Suite
color 0D
echo =======================================================================
echo           ASCII CAMERA PRO - COMPILATION & APK BUILDER
echo                   Package ID: fr.pinou007.asciicamera
echo =======================================================================
echo.

cd /d "%~dp0"

echo [1/4] Verification de l'environnement Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe sur ce systeme.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detecte.
echo.

echo [2/4] Verification des dependances npm...
if not exist "node_modules\" (
    echo Installation des modules npm...
    call npm.cmd install
) else (
    echo [OK] Modules npm presents.
)
echo.

echo [3/4] Preparation des fichiers web dans le dossier ./www...
call node build-web.js
echo.

echo [4/4] Synchronisation Capacitor pour Android...
if not exist "android\" (
    echo Initialisation du projet Android...
    call npx.cmd cap add android
)
call npx.cmd cap sync android

echo.
echo =======================================================================
echo                     COMPILATION TERMINEE AVEC SUCCES !
echo =======================================================================
echo.
echo 1. Pour generer l'APK Android :
echo    - Ouvrir le dossier 'android' dans Android Studio : npx.cmd cap open android
echo    - Ou compiler directement en ligne de commande :
echo      cd android ^& gradlew.bat assembleDebug
echo      (L'APK sera dans : android\app\build\outputs\apk\debug\app-debug.apk)
echo.
echo 2. Pour lancer la version Desktop Electron :
echo    - npm.cmd start
echo.
echo 3. Pour remplacer le logo de l'application :
echo    - Remplacer le fichier assets\logo.svg ou icon.png avec votre logo.
echo =======================================================================
echo.
pause
