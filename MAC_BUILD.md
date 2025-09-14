# Mac Build Instructions

## Prerequisites for Mac Builds

### Required Software
- **macOS** 10.15 (Catalina) or later
- **Node.js** 16.x or later
- **Xcode Command Line Tools**
- **npm** or **yarn**

### Optional (for Distribution)
- **Apple Developer Account** (for code signing)
- **Apple Developer Certificate** (for notarization)

## Quick Start on Mac

1. **Clone/Copy your project** to a Mac computer
2. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

3. **Navigate to project directory**:
   ```bash
   cd /path/to/Speak-to-Windows
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Generate icons**:
   ```bash
   node generate-icons.js
   ```

6. **Build for Mac**:
   ```bash
   npm run build-mac
   ```

## Expected Output

After successful build, you'll find in the `dist/` directory:

### Intel Macs (x64)
- `Voice to Text-1.0.0-x64.dmg` - Installer for Intel Macs
- `Voice to Text-1.0.0-x64.zip` - Portable app for Intel Macs

### Apple Silicon Macs (ARM64)  
- `Voice to Text-1.0.0-arm64.dmg` - Installer for M1/M2 Macs
- `Voice to Text-1.0.0-arm64.zip` - Portable app for M1/M2 Macs

## Code Signing (Optional)

For distribution outside the Mac App Store:

1. **Get Developer Certificate**:
   - Join Apple Developer Program ($99/year)
   - Create certificates in Apple Developer portal

2. **Set environment variables**:
   ```bash
   export CSC_LINK="/path/to/certificate.p12"
   export CSC_KEY_PASSWORD="your_certificate_password"
   ```

3. **Build with signing**:
   ```bash
   npm run build-mac
   ```

## Notarization (For Distribution)

For apps distributed outside Mac App Store:

1. **Set additional environment variables**:
   ```bash
   export APPLE_ID="your@apple.id"
   export APPLE_ID_PASS="app-specific-password"
   export APPLE_TEAM_ID="your_team_id"
   ```

2. **Build with notarization**:
   ```bash
   npm run build-mac
   ```

## Alternative: Using GitHub Actions

The easiest way is to use our GitHub Actions workflow:

1. **Push your code** to GitHub
2. **The workflow automatically builds** on macOS runners
3. **Download the artifacts** from the Actions tab

## Troubleshooting

### Common Issues

1. **"xcrun: error: invalid active developer path"**
   ```bash
   sudo xcode-select --reset
   xcode-select --install
   ```

2. **"codesign failed with exit code 1"**
   - Check your certificates
   - Try building without signing: `CSC_IDENTITY_AUTO_DISCOVERY=false npm run build-mac`

3. **"App is damaged and can't be opened"**
   - This happens with unsigned apps
   - Users need to right-click → Open → Open anyway

### Build without Code Signing

For testing or internal distribution:

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false npm run build-mac
```

## File Sizes (Approximate)

- **DMG files**: ~75-80 MB each
- **ZIP files**: ~73-78 MB each

## Distribution

### For End Users
- **DMG files**: Professional installer experience
- **ZIP files**: Simple extract-and-run

### For Developers
- Upload to GitHub releases
- Host on your website
- Submit to Mac App Store (requires additional setup)

## Next Steps

After building successfully:
1. Test the app on different Mac versions
2. Set up automatic updates (optional)
3. Create distribution strategy
4. Consider Mac App Store submission