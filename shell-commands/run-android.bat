@echo off
REM Run Android App (Windows Batch)
REM This script sets up the Android SDK paths and runs the React Native Android app

REM Navigate to project root (parent of shell-commands)
cd /d "%~dp0.."

REM Set Android SDK paths (Windows)
if defined ANDROID_HOME (
    set "ANDROID_SDK=%ANDROID_HOME%"
) else (
    REM Default Windows Android SDK location
    set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
    if not exist "%ANDROID_SDK%" (
        set "ANDROID_SDK=%USERPROFILE%\AppData\Local\Android\Sdk"
    )
)

if exist "%ANDROID_SDK%" (
    set "ANDROID_HOME=%ANDROID_SDK%"
    set "PATH=%PATH%;%ANDROID_SDK%\platform-tools;%ANDROID_SDK%\emulator"
    echo ✅ Android SDK found at: %ANDROID_SDK%
) else (
    echo ⚠️  Android SDK not found. Please set ANDROID_HOME environment variable.
)

REM Check if emulator is running or device is connected
echo 🔍 Checking for connected devices/emulators...
adb devices >nul 2>&1
if errorlevel 1 (
    echo ⚠️  ADB not found. Make sure Android SDK platform-tools are in your PATH.
    pause
    exit /b 1
)

for /f "tokens=2" %%a in ('adb devices ^| findstr /r "device$"') do set DEVICE_COUNT=1
if not defined DEVICE_COUNT (
    echo ⚠️  No devices or emulators found!
    echo.
    echo Available emulators:
    emulator -list-avds 2>nul || echo No emulators found
    echo.
    set /p RESPONSE="Would you like to start an emulator? (y/n): "
    if /i "%RESPONSE%"=="y" (
        set /p AVD_NAME="Enter emulator name (or press Enter for 'Medium_Phone'): "
        if "%AVD_NAME%"=="" set AVD_NAME=Medium_Phone
        echo Starting emulator...
        start "" emulator -avd %AVD_NAME%
        echo ⏳ Waiting for emulator to boot...
        adb wait-for-device
        echo ✅ Emulator is ready!
    ) else (
        echo Please start an emulator manually or connect a device, then run this script again.
        pause
        exit /b 1
    )
) else (
    echo ✅ Found device(s) connected
    adb devices
)

REM Kill any existing Metro bundler on port 8081
echo.
echo 🔍 Checking for existing Metro bundler on port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
    echo 🛑 Stopping existing Metro bundler (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo.
echo 🚀 Starting React Native app...
npm run android

pause

