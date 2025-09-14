const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey) => ipcRenderer.invoke('set-api-key', apiKey),
  getAutoPaste: () => ipcRenderer.invoke('get-auto-paste'),
  setAutoPaste: (enabled) => ipcRenderer.invoke('set-auto-paste', enabled),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  getAppEnabled: () => ipcRenderer.invoke('get-app-enabled'),
  setAppEnabled: (enabled) => ipcRenderer.invoke('set-app-enabled', enabled),

  // Recording controls
  startRecording: () => ipcRenderer.send('start-recording-manual'),
  stopRecording: () => ipcRenderer.send('stop-recording-manual'),
  startRecordingManual: () => ipcRenderer.send('start-recording-manual'),
  stopRecordingManual: () => ipcRenderer.send('stop-recording-manual'),

  // Window controls
  showMainWindow: () => ipcRenderer.send('show-main-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  hideWindow: () => ipcRenderer.send('hide-window'),
  openSettings: () => ipcRenderer.send('open-settings'),

  // Clipboard operations
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  pasteText: (text) => ipcRenderer.invoke('paste-text', text),

  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  // Pill window controls
  hidePill: () => ipcRenderer.send('hide-pill'),

  // Event listeners
  onRecordingStarted: (callback) => ipcRenderer.on('recording-started', callback),
  onRecordingStopped: (callback) => ipcRenderer.on('recording-stopped', callback),
  onTranscriptReady: (callback) => ipcRenderer.on('transcript-ready', callback),
  onShortcutsUpdated: (callback) => ipcRenderer.on('shortcuts-updated', callback),

  // Pill-specific events
  onStartRecording: (callback) => ipcRenderer.on('start-recording', callback),
  onStopRecording: (callback) => ipcRenderer.on('stop-recording', callback),

  // Processing complete
  processingComplete: (transcript) => ipcRenderer.send('processing-complete', transcript),
  
  // Refresh shortcuts
  refreshShortcuts: () => ipcRenderer.send('refresh-shortcuts')
});