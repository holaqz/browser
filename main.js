//чтобы скрипт имел доступ к событиям в консоли
//тест в консоли разработчика на сопсобность вызвать функцию.

const { app, BrowserWindow, screen, ipcMain } = require('electron');

let mainWindow;
let events = [];
let inactiveTime = null;
let activityChecker;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  activityChecker = setInterval(() => {
    if (mainWindow.isDestroyed()) return;
    
    const isActive = !mainWindow.isMinimized() && mainWindow.isFocused();
    
    if (!isActive && !inactiveTime) {
      inactiveTime = Date.now();
      events.push({ timestamp: inactiveTime, type: 'inactive' });
      console.log(`Inactive: ${new Date(inactiveTime).toLocaleString()}`);
    }
    
    if (isActive && inactiveTime) {
      const activeTime = Date.now();
      const duration = (activeTime - inactiveTime) / 1000;
      events.push({ timestamp: activeTime, type: 'active', duration: duration });
      console.log(`Active: ${new Date(activeTime).toLocaleString()}`);
      console.log(`Duration: ${duration.toFixed(2)}s`);
      inactiveTime = null;
    }
  }, 100);
}

ipcMain.on('cursor-left', (_, data) => {
  if (!data) return;
  data.timestamp = Number(data.timestamp);
  events.push(data);
  console.log(`Cursor left: ${new Date(data.timestamp).toLocaleString()}`);
});

ipcMain.on('cursor-returned', (_, data) => {
  if (!data || data.duration === undefined) return;
  data.timestamp = Number(data.timestamp);
  events.push(data);
  console.log(`Cursor returned: ${new Date(data.timestamp).toLocaleString()}`);
  console.log(`Away for: ${Number(data.duration).toFixed(2)}s`);
});

ipcMain.on('close-app', () => {
  if (activityChecker) {
    clearInterval(activityChecker);
  }
  console.log('Events:', events);
  app.quit();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (activityChecker) {
    clearInterval(activityChecker);
  }
  if (process.platform !== 'darwin') app.quit();
});