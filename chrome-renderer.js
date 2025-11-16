let isAppEnabled = false;
let isRecording = false;
let currentSettings = {};
let currentLanguage = 'en';

// DOM elements - will be initialized in DOMContentLoaded
let appToggle, toggleTrack, toggleThumb, recordShortcut;
let settingsBtn, languageBtn, helpBtn, minimizeBtn, closeBtn;
let tutorialModal, tutorialClose, tutorialGotIt, dontShowAgain;
let settingsModal, settingsClose, saveSettings, cancelSettings;
let languageModal, languageClose, saveLanguage, quickLanguageSelect;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize DOM elements
    appToggle = document.getElementById('app-toggle');
    toggleTrack = document.getElementById('toggle-track');
    toggleThumb = document.getElementById('toggle-thumb');
    recordShortcut = document.getElementById('record-shortcut');
    
    settingsBtn = document.getElementById('settings-btn');
    languageBtn = document.getElementById('language-btn');
    helpBtn = document.getElementById('help-btn');
    minimizeBtn = document.getElementById('minimize-btn');
    closeBtn = document.getElementById('close-btn');
    
    // Tutorial modal elements
    tutorialModal = document.getElementById('tutorial-modal');
    tutorialClose = document.getElementById('tutorial-close');
    tutorialGotIt = document.getElementById('tutorial-got-it');
    dontShowAgain = document.getElementById('dont-show-again');
    
    // Settings modal elements
    settingsModal = document.getElementById('settings-modal');
    settingsClose = document.getElementById('settings-close');
    saveSettings = document.getElementById('save-settings');
    cancelSettings = document.getElementById('cancel-settings');
    
    // Language modal elements
    languageModal = document.getElementById('language-modal');
    languageClose = document.getElementById('language-close');
    saveLanguage = document.getElementById('save-language');
    quickLanguageSelect = document.getElementById('quick-language-select');
    
    // Add loaded class to prevent flash
    document.body.classList.add('loaded');
    
    await loadSettings();
    setupEventListeners();
    updateShortcutDisplay();

    // Check if this is first run and show tutorial
    await checkFirstRun();

    // Load and apply saved app state
    const savedAppState = await window.electronAPI.getAppEnabled();
    isAppEnabled = savedAppState;
    updateAppState();

    // Initial window size adjustment
    setTimeout(adjustWindowSize, 100);
    
    // Load and apply UI language
    await loadUILanguage();
});

// Translation System
async function loadUILanguage() {
    try {
        const savedLanguage = await window.electronAPI.getSetting('uiLanguage') || 'en';
        currentLanguage = savedLanguage;
        applyTranslations(currentLanguage);
    } catch (error) {
        console.error('Error loading UI language:', error);
        currentLanguage = 'en';
        applyTranslations('en');
    }
}

function applyTranslations(lang) {
    if (!translations || !translations[lang]) {
        console.error('Translations not found for language:', lang);
        return;
    }
    
    const t = translations[lang];
    
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Translate option elements
    document.querySelectorAll('[data-i18n-option]').forEach(option => {
        const key = option.getAttribute('data-i18n-option');
        if (t[key]) {
            option.textContent = t[key];
        }
    });
    
    // Translate title attributes (tooltips)
    const settingsBtn = document.getElementById('settings-btn');
    const languageBtn = document.getElementById('language-btn');
    const helpBtn = document.getElementById('help-btn');
    
    if (settingsBtn) settingsBtn.setAttribute('title', t.settingsTooltip || 'Settings');
    if (languageBtn) languageBtn.setAttribute('title', t.languageTooltip || 'UI Language');
    if (helpBtn) helpBtn.setAttribute('title', t.helpTooltip || 'How to Use');
    
    currentLanguage = lang;
}

async function loadSettings() {
    try {
        // Load all settings
        currentSettings = {
            apiKey: await window.electronAPI.getApiKey() || '',
            showNotifications: await window.electronAPI.getAutoPaste() !== false,
            autoStart: await window.electronAPI.getSetting('autoStart') || false,
            recordShortcut: await window.electronAPI.getSetting('shortcuts.record') || 'Cmd+Shift+R',
            pillPosition: await window.electronAPI.getSetting('pillPosition') || 'bottom-center',
            transcriptionLanguage: await window.electronAPI.getSetting('language') || 'en'
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
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    // Language button
    if (languageBtn) {
        languageBtn.addEventListener('click', showLanguageModal);
    }
    
    // Help button
    if (helpBtn) {
        helpBtn.addEventListener('click', showTutorial);
    } else {
        console.error('Help button not found!');
    }
    
    // Tutorial modal events
    if (tutorialClose) {
        tutorialClose.addEventListener('click', hideTutorial);
    }
    if (tutorialGotIt) {
        tutorialGotIt.addEventListener('click', handleTutorialClose);
    }
    
    // Close tutorial when clicking outside
    if (tutorialModal) {
        tutorialModal.addEventListener('click', (e) => {
            if (e.target === tutorialModal) {
                hideTutorial();
            }
        });
    }
    
    // Settings modal events
    if (settingsClose) {
        settingsClose.addEventListener('click', hideSettings);
    }
    if (saveSettings) {
        saveSettings.addEventListener('click', handleSettingsSave);
    }
    if (cancelSettings) {
        cancelSettings.addEventListener('click', hideSettings);
    }
    
    // Close settings when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                hideSettings();
            }
        });
    }
    
    // Language modal events
    if (languageClose) {
        languageClose.addEventListener('click', hideLanguageModal);
    }
    if (saveLanguage) {
        saveLanguage.addEventListener('click', handleLanguageSave);
    }
    
    // Close language modal when clicking outside
    if (languageModal) {
        languageModal.addEventListener('click', (e) => {
            if (e.target === languageModal) {
                hideLanguageModal();
            }
        });
    }

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
    recordShortcut.textContent = currentSettings.recordShortcut || 'Cmd+Shift+R';
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
    // Window size is fixed at 480x720 as per user preference
    // No dynamic resizing needed
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
    // Legacy function - now just shows modal
    showSettings();
}

function showSettings() {
    if (settingsModal) {
        loadSettingsValues();
        settingsModal.classList.add('show');
    } else {
        console.error('Settings modal not found!');
    }
}

function hideSettings() {
    if (settingsModal) {
        settingsModal.classList.remove('show');
    }
}

async function loadSettingsValues() {
    try {
        // Load current settings into the form
        const apiKey = await window.electronAPI.getApiKey();
        const autoPaste = await window.electronAPI.getAutoPaste();
        const autoStart = await window.electronAPI.getSetting('autoStart') || false;
        const recordShortcut = await window.electronAPI.getSetting('shortcuts.record') || 'Cmd+Shift+R';
        const language = await window.electronAPI.getSetting('language') || 'en';
        const pillPosition = await window.electronAPI.getSetting('pillPosition') || 'bottom-center';

        // Update form fields
        const apiKeyInput = document.getElementById('api-key');
        const showNotificationsInput = document.getElementById('show-notifications');
        const autoStartInput = document.getElementById('auto-start');
        const recordShortcutInput = document.getElementById('record-shortcut-input');
        const languageSelect = document.getElementById('language-select');
        const pillPositionSelect = document.getElementById('pill-position');

        if (apiKeyInput) apiKeyInput.value = apiKey;
        if (showNotificationsInput) showNotificationsInput.checked = autoPaste;
        if (autoStartInput) autoStartInput.checked = autoStart;
        if (recordShortcutInput) recordShortcutInput.value = recordShortcut;
        if (languageSelect) languageSelect.value = language;
        if (pillPositionSelect) pillPositionSelect.value = pillPosition;

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function handleSettingsSave() {
    try {
        // Get form values
        const apiKey = document.getElementById('api-key').value;
        const showNotifications = document.getElementById('show-notifications').checked;
        const autoStart = document.getElementById('auto-start').checked;
        const language = document.getElementById('language-select').value;
        const pillPosition = document.getElementById('pill-position').value;
        
        // Save settings
        await window.electronAPI.setApiKey(apiKey);
        await window.electronAPI.setAutoPaste(showNotifications);
        await window.electronAPI.setSetting('autoStart', autoStart);
        await window.electronAPI.setSetting('language', language);
        await window.electronAPI.setSetting('pillPosition', pillPosition);
        
        // Update current settings
        await loadSettings();
        
        // Hide modal
        hideSettings();
        
        // Show success notification
        showNotificationIfEnabled('Settings saved', 'Your settings have been updated successfully');
        
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

// Tutorial Functions
async function checkFirstRun() {
    try {
        const hasShownTutorial = await window.electronAPI.getSetting('hasShownTutorial');
        if (!hasShownTutorial) {
            // Delay showing tutorial to ensure window is fully loaded
            setTimeout(() => {
                showTutorial();
            }, 800);
        }
    } catch (error) {
        console.error('Error checking first run:', error);
    }
}

function showTutorial() {
    if (tutorialModal) {
        tutorialModal.classList.add('show');
        // Reset checkbox state
        if (dontShowAgain) {
            dontShowAgain.checked = false;
        }
    } else {
        console.error('Tutorial modal not found!');
    }
}

function hideTutorial() {
    tutorialModal.classList.remove('show');
}

async function handleTutorialClose() {
    try {
        // Save that tutorial has been shown
        await window.electronAPI.setSetting('hasShownTutorial', true);
        
        // If user checked "don't show again", save that preference
        if (dontShowAgain.checked) {
            await window.electronAPI.setSetting('skipTutorial', true);
        }
        
        hideTutorial();
    } catch (error) {
        console.error('Error saving tutorial settings:', error);
        hideTutorial();
    }
}

// Language Modal Functions
async function showLanguageModal() {
    if (languageModal) {
        // Load current UI language setting
        const currentLanguage = await window.electronAPI.getSetting('uiLanguage') || 'en';
        if (quickLanguageSelect) {
            quickLanguageSelect.value = currentLanguage;
        }
        languageModal.classList.add('show');
    }
}

function hideLanguageModal() {
    if (languageModal) {
        languageModal.classList.remove('show');
    }
}

async function handleLanguageSave() {
    try {
        const selectedLanguage = quickLanguageSelect.value;
        
        // Save UI language setting
        await window.electronAPI.setSetting('uiLanguage', selectedLanguage);
        
        // Apply translations immediately
        applyTranslations(selectedLanguage);
        
        // Hide modal
        hideLanguageModal();
        
        // Show success notification with translated text
        const t = translations[selectedLanguage];
        showNotificationIfEnabled(t.languageUpdated, t.languageUpdatedMsg);
        
    } catch (error) {
        console.error('Error saving UI language:', error);
        const t = translations[currentLanguage] || translations['en'];
        showNotificationIfEnabled(t.error, t.errorSavingLanguage);
    }
}