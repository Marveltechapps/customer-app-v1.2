#!/bin/bash

# Run iOS App
# This script runs the React Native iOS app on a simulator or connected device

# Navigate to project root (parent of shell-commands)
cd "$(dirname "$0")/.."

# Check if CocoaPods dependencies are installed
if [ ! -d "ios/Pods" ]; then
    echo "📦 Installing CocoaPods dependencies..."
    cd ios
    export LANG=en_US.UTF-8
    pod install
    cd ..
fi

# Check for available simulators
echo "🔍 Checking for available iOS simulators..."
SIMULATORS=$(xcrun simctl list devices available | grep -i "iphone" | head -5)

if [ -z "$SIMULATORS" ]; then
    echo "⚠️  No iOS simulators found!"
    echo "Please create a simulator in Xcode or connect a physical device."
    exit 1
else
    echo "Available simulators:"
    echo "$SIMULATORS"
fi

# Kill any existing Metro bundler
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "🛑 Stopping existing Metro bundler..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo ""
echo "🚀 Starting React Native iOS app..."
npm run ios

