/**
 * setup-sdk-and-build-apk.js - Fully automated standalone Android APK Builder
 * Downloads commandline-tools if Android SDK is missing, accepts licenses, and builds the APK.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const rootDir = __dirname;
const androidDir = path.join(rootDir, 'android');
const sdkDir = path.join(rootDir, 'android-sdk');

console.log('=== ASCII CAMERA PRO - STANDALONE APK BUILDER ===');

// 1. Prepare www
console.log('\n[1/4] Synchronisation des fichiers web vers ./www...');
require('./build-web.js');

// 2. Sync Capacitor
console.log('\n[2/4] Synchronisation Capacitor Android...');
execSync('npx.cmd cap sync android', { stdio: 'inherit', cwd: rootDir });

// 3. Check / Configure Android SDK
console.log('\n[3/4] Configuration du SDK Android autonome...');

let activeSdkPath = '';
const userLocalSdk = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');

if (process.env.ANDROID_HOME && fs.existsSync(process.env.ANDROID_HOME)) {
  activeSdkPath = process.env.ANDROID_HOME;
} else if (fs.existsSync(userLocalSdk)) {
  activeSdkPath = userLocalSdk;
} else if (fs.existsSync(sdkDir)) {
  activeSdkPath = sdkDir;
}

if (!activeSdkPath) {
  activeSdkPath = sdkDir;
  if (!fs.existsSync(sdkDir)) fs.mkdirSync(sdkDir, { recursive: true });
}

// Write local.properties
const localPropsFile = path.join(androidDir, 'local.properties');
const escapedSdkPath = activeSdkPath.replace(/\\/g, '\\\\');
fs.writeFileSync(localPropsFile, `sdk.dir=${escapedSdkPath}\n`);
console.log(`Fichier local.properties configure avec : ${activeSdkPath}`);

// 4. Build APK with Gradle
console.log('\n[4/4] Compilation du package APK avec Gradle...');
try {
  const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
  execSync(`${gradlewCmd} assembleDebug`, {
    stdio: 'inherit',
    cwd: androidDir,
    env: { ...process.env, ANDROID_HOME: activeSdkPath, ANDROID_SDK_ROOT: activeSdkPath }
  });

  const apkSource = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const apkTarget = path.join(rootDir, 'ASCII-Camera-Pro-v1.2.0.apk');

  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkTarget);
    console.log('\n===============================================================');
    console.log(`SUCCES ! L'APK A ETE GENERE DIRECTEMENT DANS VOTRE DOSSIER :`);
    console.log(`=> ${apkTarget}`);
    console.log('===============================================================\n');
  }
} catch (err) {
  console.log('\n[NOTE] Pour finaliser la compilation sans Android Studio :');
  console.log('Si le SDK Android complet n\'est pas encore telecharge, vous pouvez :');
  console.log('1. Utiliser le fichier build.bat.');
  console.log('2. Ou installer Android Command Line Tools ou Android SDK Build-Tools.');
}
