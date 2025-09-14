# Speak to Windows 🎤

A cross-platform speech-to-text application that uses OpenAI's Whisper API to transcribe your voice with real-time waveform visualization and automatic pasting functionality.

## Features

- 🎙️ **Real-time Audio Recording** with waveform visualization
- 🔄 **OpenAI Whisper Integration** for accurate transcription
- 📱 **Floating Pill Interface** - Always-on-top recording indicator
- 📋 **Auto-paste** transcription where your cursor is
- ⚡ **Global Hotkeys** for quick recording
- 🖥️ **Cross-platform** - Works on Windows and Mac
- 🎨 **Modern UI** with dark/light support

## Global Shortcuts

- `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac) - Start/Stop Recording
- `Ctrl+Shift+S` (Windows) / `Cmd+Shift+S` (Mac) - Show/Hide Main Window

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your OpenAI API Key:**
   - Launch the app
   - Enter your OpenAI API key in the settings
   - The key is stored locally and securely

3. **Run the application:**
   ```bash
   npm start
   ```

## Building

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build-win  # Windows
npm run build-mac  # macOS
```

## How It Works

1. **Recording**: Click the record button or use the global hotkey to start recording
2. **Visualization**: See real-time waveform in both the main window and floating pill
3. **Transcription**: Audio is automatically sent to OpenAI's Whisper API when recording stops
4. **Pasting**: Transcribed text is either auto-pasted at cursor location or copied to clipboard

## Requirements

- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Microphone permissions** - The app will request access when first used
- **Internet connection** - Required for Whisper API calls

## Configuration

The app stores your preferences locally:
- API key (encrypted)
- Auto-paste settings
- Window positions

## Troubleshooting

**Microphone not working:**
- Check system microphone permissions
- Ensure no other app is using the microphone

**API errors:**
- Verify your OpenAI API key is correct
- Check your API usage limits
- Ensure stable internet connection

**Recording not starting:**
- Try refreshing the app
- Check microphone permissions in system settings

## Privacy & Security

- Audio is only sent to OpenAI's servers for transcription
- API keys are stored locally using encrypted storage
- No audio is saved locally unless you choose to export
- Transcripts are only stored in memory and clipboard

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **Web Audio API** - Real-time audio processing
- **OpenAI Whisper API** - Speech-to-text transcription
- **HTML5/CSS3/JavaScript** - Modern web technologies

## License

MIT License - see LICENSE file for details