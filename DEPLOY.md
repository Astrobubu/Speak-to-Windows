# Deployment Guide for Speak to Windows

## Quick Start

This guide will help you build distributable packages for Windows and Mac.

## Prerequisites

1. **Node.js 16+** installed
2. **npm** package manager
3. Platform-specific tools:
   - **Windows**: Windows SDK (optional, for code signing)
   - **Mac**: Xcode Command Line Tools

## Build Commands

### 🪟 Windows Deployment

```bash
# Build Windows installer (.exe)
npm run build-win

# Quick test build (no installer)
npm run pack
```

**Output:** `dist/Speak to Windows-{version}-x64.exe`

### 🍎 Mac Deployment

```bash
# Build Mac DMG and ZIP
npm run build-mac

# Quick test build (no DMG)
npm run pack
```

**Output:** 
- `dist/Speak to Windows-{version}-x64.dmg` (Intel)
- `dist/Speak to Windows-{version}-arm64.dmg` (Apple Silicon)

### 🌍 Cross-Platform Build

```bash
# Build for all platforms (requires platform tools)
npm run build-all
```

## Using Build Scripts

### Windows (PowerShell/CMD)
```cmd
# Run the build script
build.bat windows
build.bat mac
build.bat all
```

### Mac/Linux (Bash)
```bash
# Make script executable
chmod +x build.sh

# Run the build script
./build.sh windows
./build.sh mac
./build.sh all
```

## Distribution Files

After building, you'll find these files in the `dist/` folder:

### Windows:
- **Installer**: `Speak to Windows-{version}-x64.exe` (NSIS installer)
- **Portable**: `Speak to Windows-{version}-portable.exe` (no installation needed)

### Mac:
- **DMG**: `Speak to Windows-{version}-x64.dmg` (drag-to-install)
- **ZIP**: `Speak to Windows-{version}-x64.zip` (direct app bundle)

## Installation Instructions for Users

### Windows Users:
1. Download the `.exe` installer
2. Run the installer and follow prompts
3. Launch from Start Menu or Desktop shortcut

### Mac Users:
1. Download the `.dmg` file
2. Open the DMG and drag the app to Applications
3. Launch from Applications folder

## Code Signing (Optional)

### Windows Code Signing:
```bash
set CSC_LINK=path/to/certificate.p12
set CSC_KEY_PASSWORD=your_password
npm run build-win
```

### Mac Code Signing:
```bash
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
export APPLE_ID=your@apple.id
export APPLE_ID_PASS=app_specific_password
npm run build-mac
```

## GitHub Actions (Automated Builds)

The project includes a GitHub Actions workflow (`.github/workflows/build.yml`) that automatically builds releases when you push tags:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub will automatically build and create a release
```

## Troubleshooting

### Common Issues:

1. **Build fails with "cannot find module"**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Icon errors**: Icons are optional for basic builds
3. **Permission denied on Mac**: 
   ```bash
   sudo xcode-select --install
   ```

4. **Windows signing fails**: Check certificate path and password

### Debug Mode:
```bash
DEBUG=electron-builder npm run build
```

## Next Steps

1. **Icons**: Use `build/generate-icons.html` to create proper app icons
2. **Auto-updates**: Configure the `publish` section for automatic updates
3. **CI/CD**: Set up automated builds with the included GitHub Actions workflow

For detailed build configuration, see [BUILD.md](BUILD.md).