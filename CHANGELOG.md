# Changelog

All notable changes to the Voice to Text application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-14

### ✨ New Features

#### Enhanced User Experience
- **Tutorial Modal System** - Interactive step-by-step guide that appears on first run
  - Shows detailed usage instructions with visual steps
  - "Don't show again" option for experienced users
  - Accessible via question mark icon in titlebar
  - Beautiful animations and transitions

- **Integrated Settings Modal** - Settings now open within the main window
  - No more separate settings window - everything stays in one place
  - Consistent design with tutorial modal
  - Smooth modal transitions with backdrop blur
  - Auto-loads current settings when opened

#### User Interface Improvements
- **Enhanced Onboarding** - New users get clear guidance on first launch
- **Consistent Modal Design** - Unified visual language across all modals
- **Question Mark Help Icon** - Easy access to help from titlebar
- **Improved Modal Styling** - Reduced border radius (8px) for modern look
- **Better Form Controls** - Enhanced settings form with proper validation

### 🐛 Bug Fixes
- **Fixed Window Sizing** - Maintained user's preferred 480x720 fixed window size
- **Removed Dynamic Resizing** - Eliminated unwanted window size changes
- **Modal Click-Outside** - Proper modal dismissal when clicking outside
- **Settings Persistence** - Improved settings loading and saving reliability

### 🔧 Technical Improvements
- **Modal Event Management** - Better event listener handling and cleanup
- **DOM Element Initialization** - Safer element selection after DOM load
- **IPC Communication** - Streamlined settings modal communication
- **Memory Management** - Improved cleanup for modal components

### 💅 UI/UX Enhancements
- **Consistent Iconography** - Question mark icon for help access
- **Smooth Animations** - Enhanced modal open/close transitions
- **Visual Hierarchy** - Better spacing and typography in modals
- **Form Styling** - Improved input fields and button designs
- **Responsive Layout** - Better content organization within fixed window

---

## [1.0.0] - 2025-09-14

### 🎉 Initial Release

First stable release of Voice to Text - a powerful cross-platform desktop application for speech-to-text transcription using OpenAI's Whisper API.

### ✨ Core Features

#### Voice Processing
- **Real-time voice recording** with visual waveform feedback
- **OpenAI Whisper integration** for accurate speech transcription
- **Automatic clipboard copying** - transcribed text instantly available for pasting
- **Global keyboard shortcuts** for seamless workflow integration
- **Always-on-top pill indicator** during recording sessions

#### User Interface
- **Modern, clean interface** with professional styling
- **Fixed window size** (480x720) for consistent experience
- **Custom titlebar** with minimize/close controls
- **System tray integration** for background operation

#### Settings & Configuration
- **OpenAI API key management** with secure storage
- **Customizable keyboard shortcuts** for recording and window toggle
- **Language selection** with auto-detect option
- **Notification preferences** for transcription completion
- **Pill position configuration** (top/bottom, center/right)
- **Auto-start with Windows** option

### ✨ Features

#### Core Functionality
- **Real-time voice recording** with visual waveform feedback
- **OpenAI Whisper integration** for accurate speech transcription
- **Automatic clipboard copying** - transcribed text is instantly available for pasting
- **Global keyboard shortcuts** for seamless workflow integration
- **Always-on-top pill indicator** during recording sessions

#### User Interface
- **Modern, clean interface** with professional styling
- **Fixed window size** (480x720) for consistent experience
- **Custom titlebar** with minimize/close controls
- **System tray integration** for background operation
- **Tutorial modal** with step-by-step usage instructions (shows on first run)
- **Settings modal** integrated within main window

#### Settings & Configuration
- **OpenAI API key management** with secure storage
- **Customizable keyboard shortcuts** for recording and window toggle
- **Language selection** with auto-detect option
- **Notification preferences** for transcription completion
- **Pill position configuration** (top/bottom, center/right)
- **Auto-start with Windows** option

#### Cross-Platform Support
- **Windows builds** with NSIS installer and portable versions
- **macOS builds** with DMG and ZIP distributions (Intel + Apple Silicon)
- **Professional installers** with proper shortcuts and uninstallation

### 🛠️ Technical Features

#### Architecture
- **Electron framework** for cross-platform desktop development
- **IPC communication** between main and renderer processes
- **electron-store** for persistent settings storage
- **Modern ES6+** JavaScript implementation

#### Build System
- **electron-builder** for professional packaging
- **GitHub Actions** CI/CD pipeline for automated builds
- **Cross-platform build scripts** (Windows batch + Unix shell)
- **Icon generation tools** for all required formats

#### Security & Performance
- **Context isolation** and disabled node integration in renderer
- **Content Security Policy** implementation
- **Secure API key storage** using OS credential management
- **Efficient memory management** with proper cleanup

### 📋 Default Shortcuts
- **Ctrl+Shift+R** - Start/Stop recording
- **Ctrl+Shift+S** - Show/Hide main window

### 🎯 Usage Workflow
1. **Configure** OpenAI API key in settings
2. **Press Ctrl+Shift+R** to start recording
3. **Speak clearly** into microphone
4. **Press Ctrl+Shift+R** again to stop
5. **Press Ctrl+V** to paste transcribed text anywhere

### 📦 Distribution
- **Windows**: NSIS installer (`Voice to Text-1.0.0-x64.exe`) and portable version
- **macOS**: DMG installer and ZIP archive for both Intel and Apple Silicon
- **File sizes**: ~72-76 MB (includes Electron runtime and dependencies)

### 🔧 System Requirements
- **Windows**: Windows 10 (1903) or later, Windows 11
- **macOS**: macOS 10.15 (Catalina) or later
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 200 MB free space
- **Network**: Internet connection for transcription API calls
- **Hardware**: Microphone access required

### 📚 Documentation
- **README.md** - Quick start guide and feature overview
- **BUILD.md** - Comprehensive build instructions for all platforms
- **DISTRIBUTION.md** - Distribution guide with download options
- **MAC_BUILD.md** - Detailed macOS build instructions

### 🙏 Acknowledgments
- OpenAI for the Whisper speech recognition API
- Electron team for the cross-platform framework
- All contributors and testers who helped make this release possible

---

## [Unreleased]

### Coming Soon
- Auto-update functionality
- Additional language models
- Cloud storage integration
- Batch transcription support
- Plugin system for extensibility

---

**Full Changelog**: https://github.com/[your-username]/Speak-to-Windows/commits/v1.0.0