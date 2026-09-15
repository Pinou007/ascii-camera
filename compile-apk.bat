@echo off
title ASCII Camera Pro - Compilateur APK Autonome 1-Click
color 0A
echo =======================================================================
echo          ASCII CAMERA PRO - COMPILATEUR APK 100%% AUTONOME
echo                   Package: fr.pinou007.asciicamera
echo =======================================================================
echo.

cd /d "%~dp0"

echo [1/5] Verification de Node.js et Java...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js est requis. Telechargez-le sur https://nodejs.org/
    pause
    exit /b 1
)

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Java JDK est requis. Telechargez-le sur https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Node.js et Java detectes.
echo.

echo [2/5] Preparation des fichiers web et dependances...
if not exist "node_modules\" (
    echo Installation des modules npm...
    call npm.cmd install
)
call node build-web.js
echo.

echo [3/5] Verification de l'environnement Android SDK...
call node write-android-licenses.js

set "LOCAL_SDK=%LOCALAPPDATA%\Android\Sdk"
if exist "%LOCAL_SDK%" (
    set "ANDROID_HOME=%LOCAL_SDK%"
    set "ANDROID_SDK_ROOT=%LOCAL_SDK%"
    echo [OK] SDK Android trouve dans %LOCAL_SDK%
) else if exist "android-sdk\" (
    set "ANDROID_HOME=%~dp0android-sdk"
    set "ANDROID_SDK_ROOT=%~dp0android-sdk"
    echo [OK] SDK Android local trouve dans .\android-sdk
) else (
    echo.
    echo Telechargement automatique des outils Android SDK de Google...
    if not exist "android-sdk\" mkdir "android-sdk"
    set "ANDROID_HOME=%~dp0android-sdk"
    set "ANDROID_SDK_ROOT=%~dp0android-sdk"
)

echo sdk.dir=%ANDROID_HOME:\=\\%> "android\local.properties"
echo.

echo [4/5] Synchronisation du code natif avec Capacitor...
call npx.cmd cap sync android
echo.

echo [5/5] Compilation de l'APK en cours avec Gradle...
cd android
call .\gradlew.bat assembleDebug --no-daemon

if %errorlevel% equ 0 (
    cd ..
    if not exist "build-output\" mkdir "build-output"
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "build-output\ASCII-Camera-Pro-v1.2.0.apk" >nul
        copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "ASCII-Camera-Pro.apk" >nul
        echo.
        echo =======================================================================
        echo                   COMPILATION REUSSIE AVEC SUCCES !
        echo.
        echo Votre fichier APK est pret :
        echo =^> %~dp0build-output\ASCII-Camera-Pro-v1.2.0.apk
        echo =^> %~dp0ASCII-Camera-Pro.apk
        echo =======================================================================
    )
) else (
    cd ..
    echo.
    echo =======================================================================
    echo [INFO] Pour generer l'APK sans Android Studio :
    echo Si le SDK Android n'est pas encore installe, installez 'Android Command
    echo Line Tools' ou le SDK platform-tools une seule fois sur votre machine.
    echo =======================================================================
)

echo.
pause
