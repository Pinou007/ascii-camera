@echo off
title ASCII Camera Pro - Compilateur Universel (APK Android + EXE Windows)
color 0A
echo =======================================================================
echo          ASCII CAMERA PRO - COMPILATEUR UNIVERSEL 1-CLICK
echo             [1] APK Android   +   [2] EXE Windows Portable
echo                   Package: fr.pinou007.asciicamera
echo =======================================================================
echo.

cd /d "%~dp0"

echo [1/5] Verification de l'environnement Node.js et Java...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js est requis.
    pause
    exit /b 1
)

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Java JDK est requis.
    pause
    exit /b 1
)
echo [OK] Node.js et Java detectes.
echo.

echo [2/5] Synchronisation des fichiers web...
if not exist "node_modules\" (
    echo Installation des modules npm...
    call npm.cmd install
)
call node build-web.js
echo.

echo [3/5] Configuration des licences Android SDK...
call node write-android-licenses.js

set "LOCAL_SDK=%LOCALAPPDATA%\Android\Sdk"
if exist "%LOCAL_SDK%" (
    set "ANDROID_HOME=%LOCAL_SDK%"
    set "ANDROID_SDK_ROOT=%LOCAL_SDK%"
) else (
    set "ANDROID_HOME=%~dp0android-sdk"
    set "ANDROID_SDK_ROOT=%~dp0android-sdk"
)
echo sdk.dir=%ANDROID_HOME:\=\\%> "android\local.properties"

call npx.cmd cap sync android
echo.

if not exist "build-output\" mkdir "build-output"

echo [4/5] Compilation de l'APK Android (Gradle)...
cd android
call .\gradlew.bat assembleDebug --no-daemon
cd ..

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "build-output\ASCII-Camera-Pro-v1.2.0.apk" >nul
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "ASCII-Camera-Pro.apk" >nul
    echo [SUCCES] APK Android genere dans .\build-output\ASCII-Camera-Pro-v1.2.0.apk
) else (
    echo [ATTENTION] L'APK n'a pas pu etre genere lors de cette passe.
)
echo.

echo [5/5] Compilation de l'application Windows Desktop (EXE Portable)...
call npx.cmd electron-builder --win portable

if exist "dist-electron\" (
    for %%f in (dist-electron\*.exe) do (
        copy /y "%%f" "build-output\ASCII-Camera-Pro-Windows.exe" >nul
        echo [SUCCES] EXE Windows genere dans .\build-output\ASCII-Camera-Pro-Windows.exe
    )
)

echo.
echo =======================================================================
echo                     TOUS LES FICHIERS SONT PRETS !
echo.
echo Dossier de sortie : %~dp0build-output\
if exist "build-output\ASCII-Camera-Pro-v1.2.0.apk" echo  - Android APK  : build-output\ASCII-Camera-Pro-v1.2.0.apk
if exist "build-output\ASCII-Camera-Pro-Windows.exe" echo  - Windows EXE  : build-output\ASCII-Camera-Pro-Windows.exe
echo =======================================================================
echo.
pause
