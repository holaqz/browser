const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

const { appState } = require('./ipc_handlers');

let mainWindow;
let activityChecker;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (activityChecker) clearInterval(activityChecker);
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});