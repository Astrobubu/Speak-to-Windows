let currentSettings = {};
let serverStatusInterval = null;

// Platform-specific labels
const modKey = window.electronAPI?.modKey || 'Ctrl';
const osName = window.electronAPI?.osName || 'Windows';

/**
 * Update all OS-specific labels in the UI
 */
function updateOSLabels() {
    // Update "Start with OS" labels
    document.querySelectorAll('.os-name').forEach(el => {
        el.textContent = `Start with ${osName}`;
    });

    // Update shortcut input placeholders
    document.querySelectorAll('input[placeholder*="Cmd"], input[placeholder*="Ctrl"]').forEach(el => {
        el.placeholder = el.placeholder.replace(/Cmd|Ctrl/, modKey);
    });
}

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

// Local mode elements
const localModeCheckbox = document.getElementById('local-mode');
const localModeOptions = document.getElementById('local-mode-options');
const whisperModel = document.getElementById('whisper-model');
const serverStatusIndicator = document.getElementById('server-status-indicator');
const serverStatusText = document.getElementById('server-status-text');
const toggleServerBtn = document.getElementById('toggle-server-btn');

const cancelSettings = document.getElementById('cancel-settings');
const saveSettings = document.getElementById('save-settings');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Add loaded class to prevent flash
    document.body.classList.add('loaded');

    // Update OS-specific labels (Cmd/Ctrl, macOS/Windows)
    updateOSLabels();

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
            recordShortcut: await window.electronAPI.getSetting('shortcuts.record') || `${modKey}+Shift+R`,
            windowShortcut: await window.electronAPI.getSetting('shortcuts.toggleWindow') || `${modKey}+Shift+S`,
            pillPosition: await window.electronAPI.getSetting('pillPosition') || 'bottom-center',
            language: await window.electronAPI.getSetting('language') || 'en',
            localMode: await window.electronAPI.getSetting('localMode') || false,
            whisperModel: await window.electronAPI.getSetting('whisperModel') || 'base'
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

        // Local mode settings
        if (localModeCheckbox) {
            localModeCheckbox.checked = currentSettings.localMode;
            toggleLocalModeOptions(currentSettings.localMode);
        }
        if (whisperModel) {
            whisperModel.value = currentSettings.whisperModel;
        }

        // Check server status
        updateServerStatus();

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

    // Local mode toggle
    if (localModeCheckbox) {
        localModeCheckbox.addEventListener('change', (e) => {
            toggleLocalModeOptions(e.target.checked);
        });
    }

    // Server toggle button
    if (toggleServerBtn) {
        toggleServerBtn.addEventListener('click', toggleServer);
    }

    // Start polling server status
    serverStatusInterval = setInterval(updateServerStatus, 3000);

    // Escape to close window
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.close();
        }
    });

    // Cleanup on window close
    window.addEventListener('beforeunload', () => {
        if (serverStatusInterval) {
            clearInterval(serverStatusInterval);
        }
    });
}

function toggleLocalModeOptions(show) {
    if (localModeOptions) {
        localModeOptions.classList.toggle('hidden', !show);
    }
}

async function updateServerStatus() {
    try {
        const status = await window.electronAPI.getWhisperXStatus();

        if (serverStatusIndicator && serverStatusText && toggleServerBtn) {
            if (status.running) {
                serverStatusIndicator.className = 'status-indicator online';
                serverStatusText.textContent = `Running (${status.model || 'base'})`;
                toggleServerBtn.textContent = 'Stop';
                toggleServerBtn.classList.add('stop');
            } else {
                serverStatusIndicator.className = 'status-indicator offline';
                serverStatusText.textContent = 'Server offline';
                toggleServerBtn.textContent = 'Start';
                toggleServerBtn.classList.remove('stop');
            }
        }
    } catch (error) {
        console.error('Error checking server status:', error);
    }
}

async function toggleServer() {
    try {
        const status = await window.electronAPI.getWhisperXStatus();

        toggleServerBtn.disabled = true;

        if (status.running) {
            toggleServerBtn.textContent = 'Stopping...';
            await window.electronAPI.stopWhisperXServer();
        } else {
            toggleServerBtn.textContent = 'Starting...';
            serverStatusIndicator.className = 'status-indicator starting';
            serverStatusText.textContent = 'Starting server...';

            // Save model setting first
            await window.electronAPI.setSetting('whisperModel', whisperModel.value);
            await window.electronAPI.startWhisperXServer();
        }

        // Wait a moment then update status
        setTimeout(async () => {
            await updateServerStatus();
            toggleServerBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Error toggling server:', error);
        toggleServerBtn.disabled = false;
        showNotificationIfEnabled('Error', 'Failed to toggle server');
    }
}

async function saveSettingsHandler() {
    try {
        // Validate API key (only if not using local mode)
        const apiKey = apiKeyInput.value.trim();
        const isLocalMode = localModeCheckbox && localModeCheckbox.checked;

        if (!isLocalMode && apiKey && !apiKey.startsWith('sk-')) {
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

        // Local mode settings
        if (localModeCheckbox) {
            await window.electronAPI.setSetting('localMode', localModeCheckbox.checked);
            currentSettings.localMode = localModeCheckbox.checked;
        }
        if (whisperModel) {
            await window.electronAPI.setSetting('whisperModel', whisperModel.value);
            currentSettings.whisperModel = whisperModel.value;
        }

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