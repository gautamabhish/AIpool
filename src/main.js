const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const ipcMain = require('electron').ipcMain;
const suggestModels = require('./scripts/suggestModels');
const startModelServer = require('./scripts/startModel')

let dht

async function loadDHT() {
  if (!dht) dht = await import('./scripts/dht.mjs');
  return dht;
}

async function useDHT() {
  const dht = await import('./scripts/dht.mjs'); // dynamic ESM import
  await dht.registerModel("gpt2", "http://localhost:8000");
  const info = await dht.findModelNode("gpt2");
  console.log("Found node:", info);
}
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  useDHT();
  ipcMain.handle('suggest-models', async () => {
    return await suggestModels();
  });

  ipcMain.handle('start-model-server', (_, modelId) => {
    return startModelServer(modelId);
  });

  ipcMain.handle('dht-start-node', async () => {
  const dht = await loadDHT();
  return dht.startNode();
});
  ipcMain.handle('dht-register', async (_, model, addr) => {
  const dht = await loadDHT();
  return dht.registerModel(model, addr);
});


ipcMain.handle('dht-find-model-node', async (_, model) => {
  const dht = await loadDHT();
  return dht.findModelNode(model);
});

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
