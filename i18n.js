// Internationalization system for Voice to Text app

const translations = {
  en: {
    // App title and general
    appTitle: 'Voice to Text',
    appSubtitle: 'Speech Transcription',
    settings: 'Settings',
    howToUse: 'How to Use',
    
    // Main window
    shortcutsSwitch: 'Shortcuts Switch',
    record: 'Record',
    tips: 'Tips',
    tipBackgroundRun: 'App runs in the background when closed - check your system tray',
    tipRightClick: 'Right-click the recording pill for quick actions',
    tipGlobalShortcuts: 'Use global shortcuts even when app is minimized',
    tipAutoClipboard: 'Transcribed text is automatically copied to clipboard for pasting',
    
    // Tutorial modal
    tutorialTitle: 'How to Use Voice to Text',
    tutorialStep1Title: 'Start Recording',
    tutorialStep1Text: 'Press {shortcut} or click the record button. Make sure your microphone is working.',
    tutorialStep2Title: 'Speak Clearly',
    tutorialStep2Text: 'Talk normally into your microphone. You\'ll see a waveform visualization showing your voice input.',
    tutorialStep3Title: 'Finish Recording',
    tutorialStep3Text: 'Press {shortcut} again or click the stop button to end recording.',
    tutorialStep4Title: 'Text Ready!',
    tutorialStep4Text: 'Your speech is automatically transcribed and saved to clipboard. Just press {pasteKey} to paste anywhere!',
    tutorialTip: 'Configure your OpenAI API key in settings to enable transcription',
    dontShowAgain: 'Don\'t show this again',
    gotIt: 'Got it!',
    
    // Settings modal
    openaiApiKey: 'OpenAI API Key',
    showNotifications: 'Show notifications when ready',
    autoStart: 'Start with {os}',
    recordingShortcut: 'Recording Shortcut',
    change: 'Change',
    language: 'Language',
    autoDetect: 'Auto-detect',
    pillPosition: 'Pill Position',
    bottomCenter: 'Bottom Center',
    topCenter: 'Top Center',
    bottomRight: 'Bottom Right',
    topRight: 'Top Right',
    cancel: 'Cancel',
    save: 'Save',
    
    // Language names
    english: 'English',
    arabic: 'Arabic',
    
    // UI Language selector
    uiLanguage: 'Interface Language',
    
    // Notifications
    setupRequired: 'Setup required',
    pleaseSetApiKey: 'Please set your OpenAI API key first',
    settingsSaved: 'Settings saved',
    settingsSavedMessage: 'Your settings have been updated successfully',
    invalidApiKey: 'Invalid API Key',
    invalidApiKeyMessage: 'OpenAI API keys start with "sk-"',
    shortcutUpdated: 'Shortcut updated',
    newShortcut: 'New shortcut: {shortcut}',
    error: 'Error',
    errorSavingSettings: 'Failed to save settings',
    errorSavingShortcut: 'Failed to save shortcut',
    transcriptionReady: 'Transcription ready!',
    textCopiedToClipboard: 'Text copied to clipboard',
    
    // Press keys placeholder
    pressKeys: 'Press keys...',
    pressShortcutKeys: 'Press shortcut keys...'
  },
  
  ar: {
    // App title and general
    appTitle: 'الصوت إلى نص',
    appSubtitle: 'نسخ الكلام',
    settings: 'الإعدادات',
    howToUse: 'كيفية الاستخدام',
    
    // Main window
    shortcutsSwitch: 'مفتاح الاختصارات',
    record: 'تسجيل',
    tips: 'نصائح',
    tipBackgroundRun: 'يعمل التطبيق في الخلفية عند إغلاقه - تحقق من صينية النظام',
    tipRightClick: 'انقر بزر الماوس الأيمن على حبة التسجيل للإجراءات السريعة',
    tipGlobalShortcuts: 'استخدم اختصارات النظام حتى عند تصغير التطبيق',
    tipAutoClipboard: 'يتم نسخ النص المنسوخ تلقائياً إلى الحافظة للصق',
    
    // Tutorial modal
    tutorialTitle: 'كيفية استخدام الصوت إلى نص',
    tutorialStep1Title: 'بدء التسجيل',
    tutorialStep1Text: 'اضغط على {shortcut} أو انقر على زر التسجيل. تأكد من أن الميكروفون يعمل.',
    tutorialStep2Title: 'تحدث بوضوح',
    tutorialStep2Text: 'تحدث بشكل طبيعي في الميكروفون. سترى رسم بياني موجي يظهر إدخال صوتك.',
    tutorialStep3Title: 'إنهاء التسجيل',
    tutorialStep3Text: 'اضغط على {shortcut} مرة أخرى أو انقر على زر الإيقاف لإنهاء التسجيل.',
    tutorialStep4Title: 'النص جاهز!',
    tutorialStep4Text: 'يتم نسخ كلامك تلقائياً وحفظه في الحافظة. فقط اضغط على {pasteKey} للصق في أي مكان!',
    tutorialTip: 'قم بتكوين مفتاح OpenAI API في الإعدادات لتمكين النسخ',
    dontShowAgain: 'لا تظهر هذا مرة أخرى',
    gotIt: 'فهمت!',
    
    // Settings modal
    openaiApiKey: 'مفتاح OpenAI API',
    showNotifications: 'إظهار الإشعارات عند الجاهزية',
    autoStart: 'البدء مع {os}',
    recordingShortcut: 'اختصار التسجيل',
    change: 'تغيير',
    language: 'اللغة',
    autoDetect: 'الكشف التلقائي',
    pillPosition: 'موضع الحبة',
    bottomCenter: 'الأسفل في الوسط',
    topCenter: 'الأعلى في الوسط',
    bottomRight: 'الأسفل على اليمين',
    topRight: 'الأعلى على اليمين',
    cancel: 'إلغاء',
    save: 'حفظ',
    
    // Language names
    english: 'الإنجليزية',
    arabic: 'العربية',
    
    // UI Language selector
    uiLanguage: 'لغة الواجهة',
    
    // Notifications
    setupRequired: 'الإعداد مطلوب',
    pleaseSetApiKey: 'يرجى تعيين مفتاح OpenAI API أولاً',
    settingsSaved: 'تم حفظ الإعدادات',
    settingsSavedMessage: 'تم تحديث إعداداتك بنجاح',
    invalidApiKey: 'مفتاح API غير صالح',
    invalidApiKeyMessage: 'مفاتيح OpenAI API تبدأ بـ "sk-"',
    shortcutUpdated: 'تم تحديث الاختصار',
    newShortcut: 'الاختصار الجديد: {shortcut}',
    error: 'خطأ',
    errorSavingSettings: 'فشل في حفظ الإعدادات',
    errorSavingShortcut: 'فشل في حفظ الاختصار',
    transcriptionReady: 'النسخ جاهز!',
    textCopiedToClipboard: 'تم نسخ النص إلى الحافظة',
    
    // Press keys placeholder
    pressKeys: 'اضغط على المفاتيح...',
    pressShortcutKeys: 'اضغط على مفاتيح الاختصار...'
  }
};

// Get OS name for display
function getOSName() {
  const platform = window.electronAPI?.getPlatform() || 'unknown';
  switch (platform) {
    case 'darwin': return 'macOS';
    case 'win32': return 'Windows';
    case 'linux': return 'Linux';
    default: return 'System';
  }
}

// Get paste key for current platform
function getPasteKey() {
  const platform = window.electronAPI?.getPlatform() || 'unknown';
  return platform === 'darwin' ? 'Cmd+V' : 'Ctrl+V';
}

// i18n class
class I18n {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = translations;
  }
  
  async init() {
    // Load saved language preference
    const savedLang = await window.electronAPI?.getSetting('uiLanguage');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
    this.updatePageLanguage();
  }
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      this.updatePageLanguage();
    }
  }
  
  updatePageLanguage() {
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
    
    // Update direction for RTL languages
    if (this.currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.type === 'password') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
    
    // Update elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });
    
    // Update elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
  }
  
  t(key, replacements = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || 
                       this.translations.en[key] || 
                       key;
    
    // Replace placeholders
    let result = translation;
    
    // Auto-replace {os} with current OS name
    if (result.includes('{os}')) {
      replacements.os = getOSName();
    }
    
    // Auto-replace {pasteKey} with platform-specific paste key
    if (result.includes('{pasteKey}')) {
      replacements.pasteKey = getPasteKey();
    }
    
    // Replace all placeholders
    Object.keys(replacements).forEach(key => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
    });
    
    return result;
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Export for use in renderer processes
if (typeof window !== 'undefined') {
  window.i18n = new I18n();
}
