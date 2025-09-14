#!/bin/bash

# Build script for Speak to Windows
# This script helps build the application for different platforms

set -e  # Exit on any error

echo "🚀 Speak to Windows Build Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16.x or later."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Function to check dependencies
check_dependencies() {
    echo "📦 Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    else
        echo "✅ Dependencies already installed"
    fi
}

# Function to build for Windows
build_windows() {
    echo "🪟 Building for Windows..."
    npm run build-win
    echo "✅ Windows build complete!"
}

# Function to build for macOS
build_mac() {
    echo "🍎 Building for macOS..."
    npm run build-mac
    echo "✅ macOS build complete!"
}

# Function to build for all platforms
build_all() {
    echo "🌍 Building for all platforms..."
    npm run build-all
    echo "✅ All builds complete!"
}

# Function to clean build directory
clean() {
    echo "🧹 Cleaning build directory..."
    rm -rf dist/
    echo "✅ Build directory cleaned!"
}

# Function to generate icons
generate_icons() {
    echo "🎨 To generate icons:"
    echo "1. Open build/generate-icons.html in your browser"
    echo "2. Click the generate buttons"
    echo "3. Download the icons to the build/ directory"
}

# Parse command line arguments
case "${1:-help}" in
    "windows" | "win")
        check_dependencies
        build_windows
        ;;
    "mac" | "macos")
        check_dependencies
        build_mac
        ;;
    "all")
        check_dependencies
        build_all
        ;;
    "clean")
        clean
        ;;
    "icons")
        generate_icons
        ;;
    "help" | *)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  windows, win    Build for Windows"
        echo "  mac, macos      Build for macOS" 
        echo "  all             Build for all platforms"
        echo "  clean           Clean build directory"
        echo "  icons           Show icon generation instructions"
        echo "  help            Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 windows      # Build Windows installer"
        echo "  $0 mac          # Build macOS DMG"
        echo "  $0 all          # Build for all platforms"
        ;;
esac