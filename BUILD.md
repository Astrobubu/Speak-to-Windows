# Build Instructions for Speak to Windows

## Prerequisites

### For Windows Builds:
- Node.js (16.x or later)
- npm or yarn
- Windows SDK (for signing, optional)

### For Mac Builds:
- Node.js (16.x or later)
- npm or yarn
- Xcode Command Line Tools
- Apple Developer Certificate (for signing and notarization, optional)

### For Cross-platform Builds:
- Docker (recommended for consistent builds)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Icons (Optional):**
   - Open `build/generate-icons.html` in your browser
   - Generate and download the required icons
   - Place them in the `build/` directory:
     - `icon.ico` for Windows
     - `icon.icns` for Mac
     - `dmg-background.png` for Mac DMG

## Building

### Windows Build (on Windows)
```bash
# Build installer (NSIS)
npm run build-win

# Build portable version
npm run build-win-portable
```

### Mac Build (on macOS)
```bash
# Build DMG and ZIP
npm run build-mac
```

### Universal Build (on respective platforms)
```bash
# Build for current platform
npm run build

# Build for all platforms (requires platform-specific tools)
npm run build-all
```

### Development Build (unsigned)
```bash
# Quick build without signing
npm run pack
```

## Build Outputs

All builds will be created in the `dist/` directory:

### Windows:
- `Speak to Windows-{version}-x64.exe` - NSIS installer
- `Speak to Windows-{version}-portable.exe` - Portable version

### Mac:
- `Speak to Windows-{version}-x64.dmg` - Intel DMG
- `Speak to Windows-{version}-arm64.dmg` - Apple Silicon DMG
- `Speak to Windows-{version}-x64.zip` - Intel ZIP
- `Speak to Windows-{version}-arm64.zip` - Apple Silicon ZIP

## Code Signing (Production)

### Windows:
1. Get a code signing certificate
2. Set environment variables:
   ```bash
   set CSC_LINK=path/to/certificate.p12
   set CSC_KEY_PASSWORD=your_password
   ```

### Mac:
1. Get Apple Developer certificates
2. Set environment variables:
   ```bash
   export CSC_LINK=path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   export APPLE_ID=your@apple.id
   export APPLE_ID_PASS=app_specific_password
   ```

## Troubleshooting

### Common Issues:

1. **Node modules native dependencies**: Run `npm run postinstall`
2. **Missing icons**: Use the icon generator or provide your own icons
3. **Mac notarization fails**: Ensure proper entitlements and certificates
4. **Windows signing fails**: Check certificate validity and passwords

### Debug Build:
```bash
# Enable debug output
DEBUG=electron-builder npm run build
```

## Icon Requirements

### Windows (.ico):
- Contains multiple sizes: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
- Place at: `build/icon.ico`

### Mac (.icns):
- Contains multiple sizes: 16x16 to 1024x1024
- Place at: `build/icon.icns`

### Linux (.png):
- Multiple sizes in `build/icons/` directory
- Sizes: 16x16.png, 24x24.png, 32x32.png, 48x48.png, 64x64.png, 128x128.png, 256x256.png, 512x512.png

## CI/CD Integration

For automated builds, see the example GitHub Actions workflow in `.github/workflows/build.yml`

## Distribution

### Windows:
- NSIS installer handles installation, shortcuts, and uninstallation
- Portable version runs without installation

### Mac:
- DMG provides drag-to-Applications installation
- ZIP provides direct app bundle

### Auto-updates (Future):
Configure the `publish` section in package.json for auto-update functionality.