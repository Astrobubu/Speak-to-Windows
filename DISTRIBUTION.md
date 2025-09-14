# Distribution Guide for Voice to Text App

## ✅ Successfully Built Windows Packages

### Available Downloads

#### Windows Installer (Recommended)
- **File**: `Voice to Text-1.0.0-x64.exe` (~72.6 MB)
- **Type**: NSIS Installer
- **Features**: 
  - Professional installation wizard
  - Desktop and Start Menu shortcuts
  - Automatic uninstaller
  - User-configurable installation directory
  - No elevated privileges required

#### Windows Portable
- **File**: `Voice to Text-1.0.0-portable.exe` (~72.6 MB)  
- **Type**: Portable Application
- **Features**:
  - No installation required
  - Run directly from any location
  - Perfect for USB drives
  - No registry entries
  - Self-contained

## System Requirements

### Windows
- **OS**: Windows 10 (version 1903) or later, Windows 11
- **Architecture**: x64 (64-bit)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 200 MB free space
- **Additional**: Microphone access for voice recording

## Installation Instructions

### Windows Installer
1. Download `Voice to Text-1.0.0-x64.exe`
2. Double-click to run the installer
3. Follow the setup wizard:
   - Choose installation directory (default: `C:\Program Files\Voice to Text`)
   - Select Start Menu folder
   - Choose desktop shortcut option
4. Click "Install" to complete
5. Launch from Start Menu or desktop shortcut

### Windows Portable
1. Download `Voice to Text-1.0.0-portable.exe`
2. Create a folder (e.g., `Voice-to-Text`)
3. Move the executable to the folder
4. Double-click to run directly
5. No installation required!

## 🍎 Mac Version

### Build Requirements
Due to Apple's security requirements, Mac builds must be created on macOS with:
- Xcode Command Line Tools
- Apple Developer certificates (for distribution)

### Build Options for Mac

#### Option 1: GitHub Actions (Recommended) ✅
Automated builds using GitHub's macOS runners:
1. **Push your code** to GitHub
2. **Automatic builds** triggered on push/PR
3. **Download artifacts** from Actions tab
4. **No Mac required** - builds in the cloud!

**Setup**: Already configured in `.github/workflows/build.yml`

#### Option 2: Build on Mac 🖥️
If you have access to a Mac:
```bash
# Install dependencies
npm install

# Build for Mac
npm run build-mac
```
**Detailed instructions**: See [`MAC_BUILD.md`](MAC_BUILD.md)

#### Option 3: Cloud Build Services ☁️
- **GitHub Codespaces**: macOS environment
- **CircleCI**: macOS build environment
- **Docker**: Cross-platform builds (Linux only)

#### Option 4: Cross-Platform Script 🔧
Use our enhanced build script:
```bash
# On Mac
./build.sh mac

# Auto-detect platform
./build.sh auto
```

## App Configuration

### First Launch Setup
1. **API Key**: Configure your OpenAI API key in settings
2. **Shortcuts**: Customize keyboard shortcuts:
   - Default record: `Ctrl+Shift+R`
   - Default toggle window: `Ctrl+Shift+S`
3. **Auto-paste**: Enable/disable automatic clipboard paste
4. **Permissions**: Grant microphone access when prompted

### Features
- 🎤 Voice-to-text transcription using OpenAI Whisper
- 🌊 Real-time waveform visualization
- ⚡ Global keyboard shortcuts
- 📋 Automatic clipboard integration
- 🎯 Always-on-top recording indicator
- ⚙️ Configurable settings
- 🔄 System tray integration

## Distribution Channels

### Direct Distribution
- Host files on your website
- Provide direct download links
- Include checksums for verification

### App Stores
- **Microsoft Store**: Requires additional packaging
- **Mac App Store**: Requires Apple Developer Program
- **Alternative**: Homebrew Cask for Mac

### Version Updates
The app is configured for future auto-update support. See `package.json` build configuration.

## Support

### Common Issues
1. **Microphone not working**: Check Windows privacy settings
2. **Shortcuts not working**: Ensure no conflicts with other apps
3. **API errors**: Verify OpenAI API key is correct

### File Locations
- **Settings**: Stored in user AppData
- **Logs**: Available in app settings
- **Config**: `%APPDATA%\voice-to-text\`

## Technical Details

### Architecture
- **Framework**: Electron 27
- **Main Process**: Node.js backend
- **Renderer**: HTML/CSS/JavaScript frontend
- **Store**: electron-store for configuration
- **Voice Processing**: OpenAI Whisper API

### Security
- Content Security Policy enabled
- Context isolation active
- Node integration disabled in renderer
- Secure API key storage

---
**Build Date**: September 14, 2025  
**Version**: 1.0.0  
**Platform**: Windows x64 ✅ | macOS (requires macOS build environment)