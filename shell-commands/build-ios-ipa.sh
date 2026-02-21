#!/bin/bash

# Build iOS IPA
# This script builds an IPA file for iOS distribution
# Note: This requires proper code signing and provisioning profiles

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

echo "🧹 Cleaning previous builds..."
cd ios
xcodebuild clean -workspace Frontend.xcworkspace -scheme Frontend
cd ..

echo ""
echo "📦 Building iOS Archive..."
cd ios

# Build archive
xcodebuild archive \
    -workspace Frontend.xcworkspace \
    -scheme Frontend \
    -configuration Release \
    -archivePath build/Frontend.xcarchive \
    -allowProvisioningUpdates

if [ $? -ne 0 ]; then
    echo "❌ Archive build failed!"
    exit 1
fi

echo ""
echo "📦 Exporting IPA..."
# Export IPA from archive
xcodebuild -exportArchive \
    -archivePath build/Frontend.xcarchive \
    -exportPath build/ipa \
    -exportOptionsPlist ExportOptions.plist 2>/dev/null

# If ExportOptions.plist doesn't exist, create a basic one
if [ ! -f ExportOptions.plist ]; then
    echo "⚠️  ExportOptions.plist not found. Creating a basic one..."
    cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
EOF
    echo "⚠️  Please update ExportOptions.plist with your Team ID and export method!"
    echo "   Then run this script again."
    exit 1
fi

cd ..

echo ""
echo "✅ IPA build complete!"
echo ""
echo "📱 IPA location:"
IPA_PATH=$(find ios/build/ipa -name "*.ipa" -type f 2>/dev/null | head -1)
if [ -n "$IPA_PATH" ]; then
    echo "$IPA_PATH"
    ls -lh "$IPA_PATH"
else
    echo "IPA not found. Check build logs for errors."
    echo "Note: You may need to configure code signing and provisioning profiles."
    exit 1
fi

