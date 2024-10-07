const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../ui/index.html'));
}

// Handle folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// Get reciter folders from assets/adhans
ipcMain.handle('get-reciter-list', () => {
  const adhansPath = path.join(__dirname, '../assets/adhans');
  const reciters = fs.readdirSync(adhansPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // Only keep directories
    .map(dirent => dirent.name);
  return reciters;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
