#!/bin/bash

# Build Android APK
# This script builds a release APK file for Android

# Set Android SDK paths
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

# Navigate to project root (parent of shell-commands)
cd "$(dirname "$0")/.."

echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

echo ""
echo "📦 Building Release APK..."
cd android
./gradlew assembleRelease
cd ..

echo ""
echo "✅ APK build complete!"
echo ""
echo "📱 APK location:"
APK_PATH=$(find android/app/build/outputs/apk/release -name "*.apk" -type f 2>/dev/null | head -1)
if [ -n "$APK_PATH" ]; then
    echo "$APK_PATH"
    ls -lh "$APK_PATH"
else
    echo "APK not found. Check build logs for errors."
    exit 1
fi

