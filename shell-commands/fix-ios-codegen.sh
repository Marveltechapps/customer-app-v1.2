#!/bin/bash

# Fix iOS Codegen Build Errors
# This script cleans and regenerates all iOS build files and codegen artifacts

set -e

echo "🧹 Cleaning iOS build artifacts..."

# Clean iOS build directories
cd ios
rm -rf build DerivedData Pods Podfile.lock

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/Frontend-*

echo "📦 Reinstalling CocoaPods dependencies..."

# Reinstall pods with proper encoding
export LANG=en_US.UTF-8
pod install --repo-update

echo "✅ iOS build artifacts cleaned and regenerated!"
echo ""
echo "Next steps:"
echo "1. Open ios/Frontend.xcworkspace in Xcode"
echo "2. Or run: npx react-native run-ios"

