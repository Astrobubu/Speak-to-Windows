let isAppEnabled = false;
let isRecording = false;
let currentSettings = {};

// DOM elements
const statusIndicator = document.getElementById('status-indicator');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const appToggle = document.getElementById('app-toggle');
const toggleTrack = document.getElementById('toggle-track');
const toggleThumb = document.getElementById('toggle-thumb');
const toggleText = document.getElementById('toggle-text');
const recordShortcut = document.getElementById('record-shortcut');

const settingsBtn = document.getElementById('settings-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
    updateShortcutDisplay();

    // Load and apply saved app state
    const savedAppState = await window.electronAPI.getSetting('appEnabled');
    if (savedAppState) {
        isAppEnabled = savedAppState;
        updateAppState();
    }
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

        // Update UI
        if (currentSettings.apiKey) {
            apiKeyInput.value = currentSettings.apiKey;
        }
        showNotifications.checked = currentSettings.showNotifications;
        autoStart.checked = currentSettings.autoStart;
        recordShortcutInput.value = currentSettings.recordShortcut;
        windowShortcutInput.value = currentSettings.windowShortcut;
        pillPosition.value = currentSettings.pillPosition;

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function setupEventListeners() {
    // App toggle
    appToggle.addEventListener('click', toggleApp);

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
}

function updateShortcutDisplay() {
    recordShortcut.textContent = currentSettings.recordShortcut || 'Ctrl+Shift+R';
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
    await window.electronAPI.setSetting('appEnabled', isAppEnabled);
}

function updateAppState() {
    // Update slide toggle
    toggleTrack.classList.toggle('enabled', isAppEnabled);

    if (isAppEnabled) {
        toggleText.textContent = 'Disable App';
        statusText.textContent = 'Ready';
        statusIndicator.className = 'status-indicator ready';
    } else {
        toggleText.textContent = 'Enable App';
        statusText.textContent = 'Disabled';
        statusIndicator.className = 'status-indicator';
    }
}

function updateRecordingState(recording, state = null) {
    if (!isAppEnabled) return;

    isRecording = recording;

    // Update status indicator based on recording state
    const finalState = state || (recording ? 'recording' : 'ready');
    statusIndicator.className = `status-indicator ${finalState}`;

    switch (finalState) {
        case 'recording':
            statusText.textContent = 'Recording...';
            break;
        case 'processing':
            statusText.textContent = 'Processing...';
            break;
        case 'ready':
        default:
            statusText.textContent = 'Ready';
            break;
    }
}

function openSettings() {
    window.electronAPI.openSettings();
}


function showNotificationIfEnabled(title, message) {
    if (currentSettings.showNotifications && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, message);
    }
}