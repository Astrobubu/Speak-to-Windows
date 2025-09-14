let isAppEnabled = false;
let isRecording = false;
let currentSettings = {};

// DOM elements
const appToggle = document.getElementById('app-toggle');
const toggleTrack = document.getElementById('toggle-track');
const toggleThumb = document.getElementById('toggle-thumb');
const recordShortcut = document.getElementById('record-shortcut');

const settingsBtn = document.getElementById('settings-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Add loaded class to prevent flash
    document.body.classList.add('loaded');
    
    await loadSettings();
    setupEventListeners();
    updateShortcutDisplay();

    // Load and apply saved app state
    const savedAppState = await window.electronAPI.getAppEnabled();
    isAppEnabled = savedAppState;
    updateAppState();

    // Initial window size adjustment
    setTimeout(adjustWindowSize, 100);
});

async function loadSettings() {
    try {
        // Load all settings
        currentSettings = {
            apiKey: await window.electronAPI.getApiKey() || '',
            showNotifications: await window.electronAPI.getAutoPaste() !== false,
            autoStart: await window.electronAPI.getSetting('autoStart') || false,
            recordShortcut: await window.electronAPI.getSetting('shortcuts.record') || 'Ctrl+Shift+R',
            windowShortcut: await window.electronAPI.getSetting('shortcuts.toggleWindow') || 'Ctrl+Shift+S',
            pillPosition: await window.electronAPI.getSetting('pillPosition') || 'bottom-center'
        };

        // Note: UI updates for settings will be handled in settings window

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function setupEventListeners() {
    // App toggle
    appToggle.addEventListener('click', toggleApp);

    // Auto-resize window based on content
    window.addEventListener('resize', adjustWindowSize);
    document.addEventListener('DOMContentLoaded', adjustWindowSize);

    // Titlebar buttons
    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    closeBtn.addEventListener('click', () => {
        window.electronAPI.hideWindow();
    });

    // Settings button
    settingsBtn.addEventListener('click', openSettings);

    // Electron events
    window.electronAPI.onRecordingStarted(() => {
        updateRecordingState(true);
    });

    window.electronAPI.onRecordingStopped(() => {
        updateRecordingState(false, 'processing');
    });

    window.electronAPI.onTranscriptReady((event, transcript) => {
        updateRecordingState(false, 'ready');
        showNotificationIfEnabled('Transcription ready!', 'Text copied to clipboard');
    });
    
    // Listen for shortcut updates
    window.electronAPI.onShortcutsUpdated(() => {
        loadSettings();
        updateShortcutDisplay();
    });
}

function updateShortcutDisplay() {
    recordShortcut.textContent = currentSettings.recordShortcut || 'Ctrl+Shift+R';
    document.getElementById('window-shortcut').textContent = currentSettings.windowShortcut || 'Ctrl+Shift+S';
}

async function toggleApp() {
    // Load current API key to make sure we have it
    const apiKey = await window.electronAPI.getApiKey();

    // Check API key first
    if (!isAppEnabled && !apiKey) {
        openSettings();
        showNotificationIfEnabled('Setup required', 'Please set your OpenAI API key first');
        return;
    }

    isAppEnabled = !isAppEnabled;
    updateAppState();

    // Store app state
    await window.electronAPI.setAppEnabled(isAppEnabled);
}


function updateAppState() {
    // Update toggle
    if (toggleTrack) {
        toggleTrack.classList.toggle('enabled', isAppEnabled);
    }

    adjustWindowSize();
}


function adjustWindowSize() {
    // Calculate content height
    const content = document.querySelector('.content');
    if (content) {
        const rect = content.getBoundingClientRect();
        const titlebarHeight = 36;
        const padding = 60; // Extra padding for safety

        const newHeight = Math.max(500, rect.height + titlebarHeight + padding);
        const newWidth = Math.max(480, 520);

        // Send resize request to main process
        if (window.electronAPI.resizeWindow) {
            window.electronAPI.resizeWindow(newWidth, newHeight);
        }
    }
}

function updateRecordingState(recording, state = null) {
    isRecording = recording;

    if (state === 'processing') {
        isRecording = 'processing';
    }

    // Update app state which includes recorder
    updateAppState();

    adjustWindowSize();
}

function openSettings() {
    window.electronAPI.openSettings();
}


function showNotificationIfEnabled(title, message) {
    if (currentSettings.showNotifications && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, message);
    }
}