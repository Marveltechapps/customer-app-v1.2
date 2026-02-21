#!/bin/bash

# Run Android App
# This script sets up the Android SDK paths and runs the React Native Android app

# Set Android SDK paths
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

# Navigate to project root (parent of shell-commands)
cd "$(dirname "$0")/.."

# Check if emulator is running or device is connected
echo "🔍 Checking for connected devices/emulators..."
DEVICES=$(adb devices 2>/dev/null | grep -v "List of devices" | grep "device$" | wc -l | tr -d ' ')

if [ "$DEVICES" -eq "0" ]; then
    echo "⚠️  No devices or emulators found!"
    echo ""
    echo "Available emulators:"
    emulator -list-avds 2>/dev/null || echo "No emulators found"
    echo ""
    echo "Would you like to start an emulator? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Starting emulator..."
        emulator -avd Medium_Phone &
        echo "⏳ Waiting for emulator to boot..."
        adb wait-for-device
        echo "✅ Emulator is ready!"
    else
        echo "Please start an emulator manually or connect a device, then run this script again."
        exit 1
    fi
else
    echo "✅ Found $DEVICES device(s) connected"
    adb devices
fi

# Kill any existing Metro bundler
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "🛑 Stopping existing Metro bundler..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo ""
echo "🚀 Starting React Native app..."
npm run android

