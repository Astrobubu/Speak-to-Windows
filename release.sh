#!/bin/bash
# Release script for Voice to Text v1.1.0

echo "🚀 Preparing Voice to Text v1.1.0 Release"
echo "=========================================="

# Build for all platforms
echo "📦 Building for all platforms..."

# Build Windows
echo "🪟 Building Windows version..."
npm run build-win

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Windows build successful"
else
    echo "❌ Windows build failed"
    exit 1
fi

echo ""
echo "📋 Release Summary for v1.1.0:"
echo "------------------------------"
echo "🆕 New Features:"
echo "  • Tutorial modal system with first-run experience"
echo "  • Integrated settings modal (no separate window)"
echo "  • Enhanced user onboarding and help system"
echo "  • Question mark help icon in titlebar"
echo ""
echo "🐛 Bug Fixes:"
echo "  • Fixed window sizing to maintain 480x720 dimensions"
echo "  • Improved modal event handling and cleanup"
echo "  • Better settings persistence and loading"
echo ""
echo "🎨 UI Improvements:"
echo "  • Consistent modal design with 8px border radius"
echo "  • Smooth animations and transitions"
echo "  • Better form controls and validation"
echo ""
echo "📦 Build Artifacts:"
echo "  • Voice to Text-1.1.0-x64.exe (NSIS Installer)"
echo "  • Voice to Text-1.1.0-portable.exe (Portable)"
echo ""
echo "🍎 For macOS builds:"
echo "  • Push to GitHub to trigger GitHub Actions"
echo "  • macOS builds will be available in GitHub Actions artifacts"
echo ""
echo "🎯 Ready for release!"
echo "Next steps:"
echo "1. Commit and push changes to GitHub"
echo "2. Create GitHub release with tag v1.1.0"
echo "3. Upload Windows build artifacts"
echo "4. Download macOS builds from GitHub Actions"