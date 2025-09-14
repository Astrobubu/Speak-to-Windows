#!/bin/bash
# Cross-platform build script for Voice to Text App
# Can be run on different platforms or cloud services

set -e  # Exit on any error

echo "🚀 Voice to Text - Cross-Platform Build Script"
echo "=============================================="

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm ci
    echo "✅ Dependencies installed"
}

# Generate icons
generate_icons() {
    echo "🎨 Generating icons..."
    node generate-icons.js
    echo "✅ Icons generated"
}

# Detect platform and build accordingly
detect_and_build() {
    echo "🔍 Detecting platform..."
    
    case "$(uname -s)" in
        Darwin*)
            echo "🍎 macOS detected - Building for Mac"
            npm run build-mac
            echo "✅ macOS build complete"
            echo "📦 Created files:"
            ls -la dist/*.dmg dist/*.zip 2>/dev/null || echo "   No DMG/ZIP files found"
            ;;
        Linux*)
            echo "🐧 Linux detected - Building for Linux"
            npm run build-linux
            echo "✅ Linux build complete"
            echo "📦 Created files:"
            ls -la dist/*.AppImage dist/*.deb 2>/dev/null || echo "   No AppImage/DEB files found"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            echo "🪟 Windows detected - Building for Windows"
            npm run build-win
            echo "✅ Windows build complete"
            echo "📦 Created files:"
            ls -la dist/*.exe 2>/dev/null || echo "   No EXE files found"
            ;;
        *)
            echo "❓ Unknown platform: $(uname -s)"
            echo "🌍 Attempting universal build..."
            npm run build
            ;;
    esac
}

# Build for all platforms (if supported)
build_all() {
    echo "🌍 Building for all platforms..."
    
    # Only works on macOS for proper cross-compilation
    if [[ "$(uname -s)" == "Darwin"* ]]; then
        npm run build-all
        echo "✅ All platforms build complete"
    else
        echo "⚠️  Cross-platform builds work best on macOS"
        echo "🔄 Building for current platform only..."
        detect_and_build
    fi
}

# Clean build directory
clean() {
    echo "🧹 Cleaning build directory..."
    rm -rf dist/
    echo "✅ Build directory cleaned"
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  mac, macos     Build for macOS (requires macOS)"
    echo "  win, windows   Build for Windows" 
    echo "  linux          Build for Linux"
    echo "  all            Build for all platforms"
    echo "  auto           Detect platform and build"
    echo "  clean          Clean build directory"
    echo "  help           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 auto        # Detect platform and build"
    echo "  $0 mac         # Build macOS DMG"
    echo "  $0 all         # Build for all platforms"
}

# Main script logic
main() {
    check_prerequisites
    install_deps
    generate_icons
    
    case "${1:-auto}" in
        "mac"|"macos")
            npm run build-mac
            ;;
        "win"|"windows")
            npm run build-win
            ;;
        "linux")
            npm run build-linux
            ;;
        "all")
            build_all
            ;;
        "auto")
            detect_and_build
            ;;
        "clean")
            clean
            exit 0
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            echo "❌ Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Build complete!"
    echo "📁 Check the 'dist/' directory for your builds"
}

# Run main function
main "$@"