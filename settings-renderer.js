let currentSettings = {};

// DOM elements
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');

// Settings elements
const apiKeyInput = document.getElementById('api-key');
const showNotifications = document.getElementById('show-notifications');
const autoStart = document.getElementById('auto-start');
const recordShortcutInput = document.getElementById('record-shortcut-input');
const windowShortcutInput = document.getElementById('window-shortcut-input');
const pillPosition = document.getElementById('pill-position');
const languageSelect = document.getElementById('language-select');

const cancelSettings = document.getElementById('cancel-settings');
const saveSettings = document.getElementById('save-settings');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Add loaded class to prevent flash
    document.body.classList.add('loaded');
    
    await loadSettings();
    setupEventListeners();
});

async function loadSettings() {
    try {
        // Load all settings
        currentSettings = {
            apiKey: await window.electronAPI.getApiKey() || '',
            showNotifications: await window.electronAPI.getAutoPaste() !== false,
            autoStart: await window.electronAPI.getSetting('autoStart') || false,
            recordShortcut: await window.electronAPI.getSetting('shortcuts.record') || 'Cmd+Shift+R',
            windowShortcut: await window.electronAPI.getSetting('shortcuts.toggleWindow') || 'Cmd+Shift+S',
            pillPosition: await window.electronAPI.getSetting('pillPosition') || 'bottom-center',
            language: await window.electronAPI.getSetting('language') || ''
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
        languageSelect.value = currentSettings.language;

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function setupEventListeners() {
    // Titlebar buttons
    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    closeBtn.addEventListener('click', () => {
        window.close();
    });

    // Settings actions
    cancelSettings.addEventListener('click', () => {
        window.close();
    });
    saveSettings.addEventListener('click', saveSettingsHandler);

    // Shortcut change buttons
    setupShortcutChangers();

    // Escape to close window
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.close();
        }
    });
}

async function saveSettingsHandler() {
    try {
        // Validate API key
        const apiKey = apiKeyInput.value.trim();
        if (apiKey && !apiKey.startsWith('sk-')) {
            showNotificationIfEnabled('Invalid API Key', 'OpenAI API keys start with "sk-"');
            return;
        }

        // Save all settings
        if (apiKey) {
            await window.electronAPI.setApiKey(apiKey);
            currentSettings.apiKey = apiKey;
        }

        await window.electronAPI.setAutoPaste(showNotifications.checked);
        currentSettings.showNotifications = showNotifications.checked;

        await window.electronAPI.setSetting('autoStart', autoStart.checked);
        currentSettings.autoStart = autoStart.checked;

        await window.electronAPI.setSetting('pillPosition', pillPosition.value);
        currentSettings.pillPosition = pillPosition.value;

        await window.electronAPI.setSetting('language', languageSelect.value);
        currentSettings.language = languageSelect.value;

        window.close();
        showNotificationIfEnabled('Settings saved', 'Your preferences have been updated');

    } catch (error) {
        console.error('Error saving settings:', error);
        showNotificationIfEnabled('Error', 'Failed to save settings');
    }
}

function showNotificationIfEnabled(title, message) {
    if (currentSettings.showNotifications && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, message);
    }
}

// Shortcut changing functionality (same as in chrome-renderer.js)
let waitingForShortcut = null;
let shortcutKeys = [];

function setupShortcutChangers() {
    const changeButtons = document.querySelectorAll('.change-shortcut');

    changeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetInputId = e.target.dataset.target;
            const targetInput = document.getElementById(targetInputId);

            if (waitingForShortcut === targetInputId) {
                // Cancel waiting
                cancelShortcutChange(button);
            } else {
                // Start waiting for new shortcut
                startShortcutChange(button, targetInput, targetInputId);
            }
        });
    });

    // Listen for keydown events when waiting for shortcuts
    document.addEventListener('keydown', handleShortcutKeyDown);
    document.addEventListener('keyup', handleShortcutKeyUp);
}

function startShortcutChange(button, input, inputId) {
    // Cancel any existing shortcut change
    if (waitingForShortcut) {
        const existingButton = document.querySelector(`[data-target="${waitingForShortcut}"]`);
        cancelShortcutChange(existingButton);
    }

    waitingForShortcut = inputId;
    shortcutKeys = [];

    button.textContent = 'Press keys...';
    button.classList.add('waiting');
    input.placeholder = 'Press shortcut keys...';
    input.value = '';
}

function cancelShortcutChange(button) {
    waitingForShortcut = null;
    shortcutKeys = [];

    button.textContent = 'Change';
    button.classList.remove('waiting');

    const targetInputId = button.dataset.target;
    const targetInput = document.getElementById(targetInputId);

    // Restore original value
    if (targetInputId === 'record-shortcut-input') {
        targetInput.value = currentSettings.recordShortcut;
        targetInput.placeholder = 'Cmd+Shift+R';
    } else if (targetInputId === 'window-shortcut-input') {
        targetInput.value = currentSettings.windowShortcut;
        targetInput.placeholder = 'Cmd+Shift+S';
    }
}

function handleShortcutKeyDown(e) {
    if (!waitingForShortcut) return;

    e.preventDefault();
    e.stopPropagation();

    const key = e.key;

    // Skip modifier keys on their own
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        return;
    }

    // Build shortcut string
    const modifiers = [];
    if (e.ctrlKey || e.metaKey) modifiers.push('Ctrl');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.altKey) modifiers.push('Alt');

    // Normalize key names
    let normalizedKey = key;
    if (key.length === 1) {
        normalizedKey = key.toUpperCase();
    }

    const shortcutString = [...modifiers, normalizedKey].join('+');

    // Update input
    const targetInput = document.getElementById(waitingForShortcut);
    targetInput.value = shortcutString;

    // Auto-save after a short delay
    setTimeout(() => {
        if (waitingForShortcut) {
            completeShortcutChange(shortcutString);
        }
    }, 500);
}

function handleShortcutKeyUp(e) {
    // We handle everything in keydown for now
}

async function completeShortcutChange(shortcutString) {
    if (!waitingForShortcut) return;

    const button = document.querySelector(`[data-target="${waitingForShortcut}"]`);
    const isRecordShortcut = waitingForShortcut === 'record-shortcut-input';

    try {
        if (isRecordShortcut) {
            await window.electronAPI.setSetting('shortcuts.record', shortcutString);
            currentSettings.recordShortcut = shortcutString;
        } else {
            await window.electronAPI.setSetting('shortcuts.toggleWindow', shortcutString);
            currentSettings.windowShortcut = shortcutString;
        }

        // Notify main process to refresh shortcuts
        window.electronAPI.refreshShortcuts();
        
        showNotificationIfEnabled('Shortcut updated', `New shortcut: ${shortcutString}`);
    } catch (error) {
        console.error('Error saving shortcut:', error);
        showNotificationIfEnabled('Error', 'Failed to save shortcut');
    }

    // Reset button state
    button.textContent = 'Change';
    button.classList.remove('waiting');
    waitingForShortcut = null;
}