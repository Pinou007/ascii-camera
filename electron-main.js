/**
 * electron-main.js - Electron Main Process for ASCII Camera Pro Desktop
 */

const { app, BrowserWindow, session, shell, ipcMain } = require('electron');
const path = require('path');

const fs = require('fs');

function getAsciiCameraDir() {
  const base = app.getPath('pictures') || app.getPath('downloads');
  const dir = path.join(base, 'ASCII-Camera');
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
  return dir;
}

ipcMain.on('open-gallery-folder', () => {
  const dir = getAsciiCameraDir();
  shell.openPath(dir);
});

ipcMain.handle('save-photo', async (event, { dataUrl, filename }) => {
  try {
    const dir = getAsciiCameraDir();
    const safeName = filename || `ascii_${Date.now()}.png`;
    const filePath = path.join(dir, safeName);
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return { success: true, filePath };
  } catch (err) {
    console.error('Save photo error:', err);
    return { success: false, error: err.message };
  }
});

// Allow media capture without restrictions
app.commandLine.appendSwitch('enable-features', 'MediaStreamTrack');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-usermedia-screen-capturing');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 450,
    minHeight: 600,
    backgroundColor: '#000000',
    title: 'ASCII Camera Pro',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Automatically grant camera and audio permissions to the webview
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'camera', 'microphone', 'videoCapture', 'audioCapture', 'notifications'];
    if (allowedPermissions.includes(permission)) {
      return callback(true);
    }
    callback(true);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return true;
  });

  // Open external links (socials, URLs) in the user's default OS browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if ((url.startsWith('http:') || url.startsWith('https:')) && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
