/**
 * build-web.js - Prepares www directory for Capacitor Android and Electron
 */

const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const outDir = path.join(__dirname, 'www');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const copyList = [
  'index.html',
  '404.html',
  'version.html',
  'manifest.json',
  'CNAME',
  'css',
  'js',
  'assets'
];

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyList.forEach(item => {
  const srcPath = path.join(srcDir, item);
  const destPath = path.join(outDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
  }
});

console.log('Synchronized web assets to ./www successfully.');
