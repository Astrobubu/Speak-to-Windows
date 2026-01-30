const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Set cache and temp paths to D: drive to avoid C: drive access issues
const cacheDir = 'D:\\Temp\\speak-to-windows';
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}
app.setPath('cache', cacheDir);
app.setPath('temp', cacheDir);
app.setPath('crashDumps', path.join(cacheDir, 'crashes'));
app.setPath('logs', path.join(cacheDir, 'logs'));

// Disable GPU cache to avoid permission errors
app.commandLine.appendSwitch('disk-cache-dir', path.join(cacheDir, 'cache'));
app.commandLine.appendSwitch('gpu-cache-dir', path.join(cacheDir, 'gpu-cache'));

const Store = require('electron-store');

// Try to load WhisperLauncher, but don't crash if it's not available
let WhisperLauncher = null;
let whisperLauncher = null;
try {
  const launcherModule = require('./whisper-to-text/launcher');
  WhisperLauncher = launcherModule.WhisperLauncher;
  whisperLauncher = new WhisperLauncher();
} catch (err) {
  console.log('[WhisperX] Local whisper module not available - using cloud API only');
}

const store = new Store();
let whisperServerStarting = false;

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
    backgroundColor: '#00000000', // Fully transparent
    hasShadow: false, // Remove window shadow
    type: 'toolbar', // Helps ensure it stays on top on some platforms
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  pillWindow.loadFile('pill.html');
  pillWindow.hide(); // Always start hidden
  
  // Remove any default styling/vibrancy on macOS
  if (process.platform === 'darwin') {
    pillWindow.setBackgroundColor('#00000000');
  }

  // Ensure always on top even when other windows are focused
  // Use 'screen-saver' level for maximum priority on Windows
  pillWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // Windows-specific: Prevent window from going to background
  if (process.platform === 'win32') {
    pillWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    pillWindow.setSkipTaskbar(true);
  }

  // Keep window focused and on top periodically when visible
  pillWindow.on('blur', () => {
    if (pillWindow && !pillWindow.isDestroyed() && pillWindow.isVisible()) {
      pillWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    }
  });

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

  try {
    const registered = globalShortcut.register(recordShortcut, () => {
      toggleRecording();
    });

    if (!registered) {
      console.error('Failed to register recording shortcut');
    }
  } catch (error) {
    console.error('Error registering shortcuts:', error);
  }
}

app.whenReady().then(async () => {
  // Hide app from dock on macOS
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }
  
  createMainWindow();
  createPillWindow();
  createTray();
  registerShortcuts();
  
  // Load app enabled state
  isAppEnabled = store.get('appEnabled', false);

  // Sync auto-start setting with system login item
  const autoStart = store.get('autoStart', false);
  app.setLoginItemSettings({
    openAtLogin: autoStart,
    path: app.getPath('exe')
  });

  // Auto-start WhisperX server if local mode is enabled
  autoStartWhisperServer();
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

// Stop WhisperX server when app quits
app.on('before-quit', async () => {
  if (whisperLauncher) {
    console.log('[App] Stopping WhisperX server...');
    whisperLauncher.stop();
  }
});

/**
 * Auto-start Whisper server in background if local mode is enabled
 */
function autoStartWhisperServer() {
  // Check if whisper launcher is available
  if (!whisperLauncher) {
    console.log('[App] WhisperX not available - using cloud API');
    return;
  }

  const localMode = store.get('localMode', false);

  if (!localMode) {
    console.log('[App] Local mode OFF');
    return;
  }

  console.log('[App] Starting local Whisper server in background...');
  whisperServerStarting = true;

  // Start in background - don't block the app
  whisperLauncher.start({
    model: store.get('whisperModel', 'base'),
    device: store.get('whisperDevice', 'cpu')
  }).then(result => {
    console.log('[App] Whisper server ready!');
    whisperServerStarting = false;

    // Notify user server is ready
    const { Notification } = require('electron');
    new Notification({
      title: 'Local Whisper Ready',
      body: 'Voice transcription is ready to use!',
      silent: true
    }).show();

  }).catch(error => {
    console.error('[App] Whisper server failed:', error.message);
    whisperServerStarting = false;
  });
}

/**
 * Toggle Whisper server based on local mode setting
 */
function toggleWhisperServer(enable) {
  if (!whisperLauncher) {
    console.log('[App] WhisperX not available');
    return;
  }

  if (enable) {
    if (whisperServerStarting) {
      console.log('[App] Server already starting...');
      return;
    }
    autoStartWhisperServer();
  } else {
    console.log('[App] Stopping WhisperX server (local mode disabled)');
    whisperLauncher.stop();
  }
}

let recordingLock = false;

function toggleRecording() {
  // Check if app is enabled
  if (!isAppEnabled) {
    console.log('Recording blocked: app is disabled');
    return;
  }

  // Prevent rapid successive calls (debouncing)
  if (recordingLock) {
    console.log('Recording blocked: operation in progress');
    return;
  }

  recordingLock = true;

  try {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  } catch (error) {
    console.error('Error toggling recording:', error);
    recordingLock = false;
  }

  // Release lock after a delay to prevent rapid toggling
  setTimeout(() => {
    recordingLock = false;
  }, 500);
}

function startRecording() {
  try {
    isRecording = true;

    if (pillWindow && !pillWindow.isDestroyed()) {
      // Force show the pill and ensure it stays visible
      pillWindow.show();
      pillWindow.setAlwaysOnTop(true, 'screen-saver', 1);

      // Windows-specific fixes for visibility
      if (process.platform === 'win32') {
        pillWindow.moveTop();
        pillWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      }

      // Send recording command immediately
      pillWindow.webContents.send('start-recording');
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording-started');
    }
  } catch (error) {
    console.error('Error starting recording:', error);
    isRecording = false;
    recordingLock = false;
  }
}

function stopRecording() {
  try {
    isRecording = false;

    if (pillWindow && !pillWindow.isDestroyed()) {
      pillWindow.webContents.send('stop-recording');
      // Keep pill on top even after recording stops until it auto-hides
      pillWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording-stopped');
    }
  } catch (error) {
    console.error('Error stopping recording:', error);
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
  console.log('[Main] paste-text received:', text?.substring(0, 100));
  const autoPaste = store.get('auto-paste', true);

  // Always copy to clipboard
  clipboard.writeText(text);
  console.log('[Main] Text copied to clipboard, length:', text?.length);

  if (autoPaste) {
    // Show notification that text is ready to paste
    const notification = new require('electron').Notification({
      title: 'Transcription Ready',
      body: text?.substring(0, 50) + '...',
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

  // Handle autoStart setting - set system login item
  if (key === 'autoStart') {
    app.setLoginItemSettings({
      openAtLogin: value,
      path: app.getPath('exe')
    });
    console.log('[Settings] Auto-start set to:', value);
  }

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

// Handle WhisperX server status
ipcMain.handle('get-whisperx-status', async () => {
  if (!whisperLauncher) {
    return { available: false, running: false, message: 'Local mode not available' };
  }
  return await whisperLauncher.getStatus();
});

ipcMain.handle('start-whisperx-server', async () => {
  if (!whisperLauncher) {
    return { success: false, error: 'Local whisper not available in this build' };
  }
  try {
    const result = await whisperLauncher.start({
      model: store.get('whisperModel', 'base'),
      device: store.get('whisperDevice', 'cpu'),
      computeType: store.get('whisperComputeType', 'int8')
    });
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-whisperx-server', async () => {
  if (!whisperLauncher) {
    return { success: false, error: 'Local whisper not available' };
  }
  whisperLauncher.stop();
  return { success: true };
});

// Handle local mode toggle
ipcMain.handle('set-local-mode', async (event, enabled) => {
  store.set('localMode', enabled);
  toggleWhisperServer(enabled);
  return true;
});