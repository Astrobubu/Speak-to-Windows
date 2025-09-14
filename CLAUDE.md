# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Speak to Windows is an Electron-based cross-platform speech-to-text application that uses OpenAI's Whisper API. It features a floating "pill" UI for recording with real-time waveform visualization and auto-paste functionality.

## Development Commands

```bash
# Development
npm start              # Start the app in development mode
npm run dev           # Start with dev flag enabled

# Building
npm run build         # Build for current platform
npm run build-win     # Build Windows installer (NSIS)
npm run build-mac     # Build macOS DMG and ZIP
npm run build-all     # Build for all platforms
npm run pack          # Quick development build without installer
npm run dist          # Same as build-all

# Installation
npm install           # Install dependencies
npm run postinstall   # Install app dependencies (runs automatically)
```

## Architecture

### Multi-Window Electron Application

The app consists of three main windows managed in `main.js`:

1. **Main Window** (`index.html`) - Primary UI with app controls and status
2. **Pill Window** (`pill.html`) - Floating always-on-top recording indicator with waveform
3. **Settings Window** (`settings.html`) - Configuration interface

### Key Files Structure

- `main.js` - Main Electron process, window management, IPC handlers, global shortcuts
- `preload.js` - Secure bridge between main and renderer processes
- `chrome-renderer.js` - Main window renderer logic
- `pill-minimal.js` - Pill window renderer with recording controls
- `settings-renderer.js` - Settings window renderer
- `chrome-styles.css` - Shared styles for chrome-less windows

### Core Features

- **Recording State Management**: App has enabled/disabled states, prevents recording when disabled
- **Global Shortcuts**: Configurable keyboard shortcuts (default: Ctrl+Shift+R for record, Ctrl+Shift+S for show/hide)
- **Audio Processing**: Web Audio API for real-time waveform visualization
- **OpenAI Integration**: Whisper API for speech transcription
- **Auto-paste**: Configurable automatic text pasting or clipboard copy
- **Persistent Storage**: electron-store for settings and API keys

### Window Behavior

- **Main Window**: Hides to tray on close (doesn't quit app)
- **Pill Window**: Always-on-top, initially hidden, shows during recording
- **Settings Window**: Modal dialog, temporarily disables recording while open
- **System Tray**: Provides app access when windows are hidden

### IPC Communication

Key IPC channels used throughout the app:
- `start-recording-manual` / `stop-recording-manual` - Manual recording control
- `recording-started` / `recording-stopped` - Recording state updates
- `transcript-ready` - Completed transcription delivery
- `get-api-key` / `set-api-key` - API key management
- `get-app-enabled` / `set-app-enabled` - App state management

## Build Configuration

The app uses electron-builder with extensive cross-platform configuration in `package.json`. Build outputs go to `dist/` directory. See `BUILD.md` and `DEPLOY.md` for detailed build instructions.

## Testing

No formal test framework is currently configured. Manual testing involves:
1. Recording functionality with various audio sources
2. API integration with OpenAI Whisper
3. Cross-platform window behavior
4. Global shortcut functionality