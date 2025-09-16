const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let pillWindow;
let settingsWindow;
let tray;
let isRecording = false;
let isAppEnabled = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 780,
    resizable: false,
    frame: false,
    show: false, // Keep hidden until ready
    backgroundColor: '#ffffff', // Set background to match app theme
    icon: path.join(__dirname, 'icon.png'), // Use the existing icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Voice to Text'
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
    type: 'toolbar', // Helps ensure it stays on top on some platforms
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  pillWindow.loadFile('pill.html');
  pillWindow.hide(); // Always start hidden
  
  // Ensure always on top even when other windows are focused
  pillWindow.setAlwaysOnTop(true, 'screen-saver');

  // Pill interactions will be handled in pill-minimal.js
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 750,
    resizable: true,
    frame: false,
    parent: mainWindow,
    show: false, // Keep hidden until ready
    backgroundColor: '#ffffff', // Set background to match app theme
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Settings'
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
  // Use the existing icon as tray icon
  const trayImage = nativeImage.createFromPath(path.join(__dirname, 'icon.png')).resize({width: 16, height: 16});

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
  tray.setToolTip('Voice to Text');

  tray.on('click', showMainWindow);
}

function showMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

function registerShortcuts() {
  // Unregister all existing shortcuts first
  globalShortcut.unregisterAll();
  
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
  
  // Load app enabled state
  isAppEnabled = store.get('appEnabled', false);
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
  // Check if app is enabled
  if (!isAppEnabled) {
    return;
  }
  
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  isRecording = true;
  if (pillWindow) {
    // Force show the pill and ensure it stays visible
    pillWindow.show();
    pillWindow.setAlwaysOnTop(true, 'screen-saver');
    pillWindow.focus();

    // Ensure the pill window is fully ready before starting recording
    setTimeout(() => {
      if (pillWindow && !pillWindow.isDestroyed()) {
        pillWindow.webContents.send('start-recording');
      }
    }, 100);
  }
  if (mainWindow) {
    mainWindow.webContents.send('recording-started');
  }
}

function stopRecording() {
  isRecording = false;
  if (pillWindow) {
    pillWindow.webContents.send('stop-recording');
    // Keep pill on top even after recording stops until it auto-hides
    pillWindow.setAlwaysOnTop(true, 'screen-saver');
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
      body: 'Text copied to clipboard. Press Cmd+V to paste.',
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
  // Settings are now handled as a modal in the main window
  // This IPC handler is kept for backward compatibility
  console.log('Settings modal should be handled in renderer process');
});

// Handle shortcut refresh
ipcMain.on('refresh-shortcuts', () => {
  registerShortcuts();
  // Notify main window to update shortcut display
  if (mainWindow) {
    mainWindow.webContents.send('shortcuts-updated');
  }
});

// Handle app enable/disable
ipcMain.handle('get-app-enabled', () => {
  return isAppEnabled;
});

ipcMain.handle('set-app-enabled', (event, enabled) => {
  isAppEnabled = enabled;
  store.set('appEnabled', enabled);
  return true;
});