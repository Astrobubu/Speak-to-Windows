const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let pillWindow;
let settingsWindow;
let tray;
let isRecording = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 360,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Speak to Windows',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Hide main window on close, don't quit app
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createPillWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  pillWindow = new BrowserWindow({
    width: 160,
    height: 60,
    x: Math.floor((width - 160) / 2),
    y: 10, // Top center position
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  pillWindow.loadFile('pill.html');
  pillWindow.hide(); // Always start hidden

  // Pill interactions will be handled in pill-minimal.js
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 600,
    resizable: true,
    frame: false,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Settings - Speak to Windows',
    show: false
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray() {
  // Simple microphone icon (base64 encoded SVG)
  const trayImage = nativeImage.createFromDataURL('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAxdjRhNCA0IDAgMCAwIDQiLz48cGF0aCBkPSJNOCA4djJhNCA0IDAgMCAwIDggMHYtMiIvPjxwYXRoIGQ9Im0xMiAyMHYtNiIvPjwvc3ZnPg==');

  tray = new Tray(trayImage);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: showMainWindow
    },
    {
      label: 'Toggle Recording',
      click: toggleRecording
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Speak to Windows');

  tray.on('click', showMainWindow);
}

function showMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

function registerShortcuts() {
  const recordShortcut = store.get('shortcuts.record', 'CommandOrControl+Shift+R');
  const toggleWindowShortcut = store.get('shortcuts.toggleWindow', 'CommandOrControl+Shift+S');

  globalShortcut.register(recordShortcut, () => {
    toggleRecording();
  });

  globalShortcut.register(toggleWindowShortcut, () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showMainWindow();
    }
  });
}

app.whenReady().then(() => {
  createMainWindow();
  createPillWindow();
  createTray();
  registerShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
    createPillWindow();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  isRecording = true;
  if (pillWindow) {
    pillWindow.show();
    pillWindow.webContents.send('start-recording');
  }
  if (mainWindow) {
    mainWindow.webContents.send('recording-started');
  }
}

function stopRecording() {
  isRecording = false;
  if (pillWindow) {
    pillWindow.webContents.send('stop-recording');
  }
  if (mainWindow) {
    mainWindow.webContents.send('recording-stopped');
  }
}

// IPC handlers
ipcMain.handle('get-api-key', () => {
  return store.get('openai-api-key', '');
});

ipcMain.handle('set-api-key', (event, apiKey) => {
  store.set('openai-api-key', apiKey);
  return true;
});

ipcMain.handle('get-auto-paste', () => {
  return store.get('auto-paste', true);
});

ipcMain.handle('set-auto-paste', (event, enabled) => {
  store.set('auto-paste', enabled);
  return true;
});

ipcMain.handle('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('paste-text', async (event, text) => {
  const autoPaste = store.get('auto-paste', true);

  // Always copy to clipboard
  clipboard.writeText(text);

  if (autoPaste) {
    // Show notification that text is ready to paste
    const notification = new require('electron').Notification({
      title: 'Transcription Ready',
      body: 'Text copied to clipboard. Press Ctrl+V to paste.',
      silent: true
    });
    notification.show();
  }

  return true;
});

ipcMain.on('start-recording-manual', () => {
  startRecording();
});

ipcMain.on('stop-recording-manual', () => {
  stopRecording();
});

ipcMain.on('hide-pill', () => {
  pillWindow.hide();
});

ipcMain.on('processing-complete', (event, transcript) => {
  if (mainWindow) {
    mainWindow.webContents.send('transcript-ready', transcript);
  }
});

// Additional IPC handlers
ipcMain.handle('get-setting', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('show-notification', (event, title, body) => {
  const notification = new require('electron').Notification({
    title: title,
    body: body,
    silent: true
  });
  notification.show();
  return true;
});

ipcMain.on('show-main-window', () => {
  showMainWindow();
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('open-settings', () => {
  createSettingsWindow();
});