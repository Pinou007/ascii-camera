const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('isNativeElectronApp', true);
contextBridge.exposeInMainWorld('electronAPI', {
  openGalleryFolder: () => ipcRenderer.send('open-gallery-folder'),
  savePhoto: (dataUrl, filename) => ipcRenderer.invoke('save-photo', { dataUrl, filename })
});
