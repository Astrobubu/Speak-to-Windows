@echo off
REM Build script for Speak to Windows (Windows version)
REM This script helps build the application for different platforms

echo 🚀 Speak to Windows Build Script
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16.x or later.
    exit /b 1
)

REM Check if npm is installed  
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    exit /b 1
)

REM Parse command line arguments
if "%1"=="" goto :help
if "%1"=="help" goto :help
if "%1"=="windows" goto :build_windows
if "%1"=="win" goto :build_windows
if "%1"=="mac" goto :build_mac
if "%1"=="macos" goto :build_mac
if "%1"=="all" goto :build_all
if "%1"=="clean" goto :clean
if "%1"=="icons" goto :generate_icons
goto :help

:check_dependencies
echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)
goto :eof

:build_windows
call :check_dependencies
echo 🪟 Building for Windows...
call npm run build-win
if %errorlevel% neq 0 (
    echo ❌ Windows build failed
    exit /b 1
)
echo ✅ Windows build complete!
goto :end

:build_mac
call :check_dependencies
echo 🍎 Building for macOS...
echo ⚠️  Note: macOS builds should be run on macOS for best results
call npm run build-mac
if %errorlevel% neq 0 (
    echo ❌ macOS build failed
    exit /b 1
)
echo ✅ macOS build complete!
goto :end

:build_all
call :check_dependencies
echo 🌍 Building for all platforms...
call npm run build-all
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ All builds complete!
goto :end

:clean
echo 🧹 Cleaning build directory...
if exist "dist" rmdir /s /q "dist"
echo ✅ Build directory cleaned!
goto :end

:generate_icons
echo 🎨 To generate icons:
echo 1. Open build\generate-icons.html in your browser
echo 2. Click the generate buttons  
echo 3. Download the icons to the build\ directory
goto :end

:help
echo Usage: %0 [command]
echo.
echo Commands:
echo   windows, win    Build for Windows
echo   mac, macos      Build for macOS
echo   all             Build for all platforms
echo   clean           Clean build directory
echo   icons           Show icon generation instructions
echo   help            Show this help message
echo.
echo Examples:
echo   %0 windows      # Build Windows installer
echo   %0 mac          # Build macOS DMG
echo   %0 all          # Build for all platforms

:end
echo.
echo Build script finished.