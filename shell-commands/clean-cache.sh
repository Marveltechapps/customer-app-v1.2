#!/bin/bash

# Clean React Native Cache
# This script kills any running Metro bundler and cleans all caches

set -e

echo "🧹 Cleaning React Native cache and stopping Metro bundler..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Kill any process using port 8081 (Metro bundler)
echo "🛑 Stopping Metro bundler on port 8081..."
if lsof -ti:8081 > /dev/null 2>&1; then
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    echo "✅ Metro bundler stopped"
else
    echo "ℹ️  No Metro bundler running on port 8081"
fi

# Clean Metro bundler cache (zsh-safe)
echo "🧹 Cleaning Metro bundler cache..."
if [ -n "$TMPDIR" ]; then
    rm -rf "${TMPDIR}/react-"* "${TMPDIR}/metro-"* "${TMPDIR}/haste-"* 2>/dev/null || true
    echo "✅ Metro cache cleaned"
else
    echo "⚠️  TMPDIR not set, skipping cache cleanup"
fi

# Clean watchman cache
echo "🧹 Cleaning Watchman cache..."
watchman watch-del-all 2>/dev/null || echo "ℹ️  Watchman not installed or no watches to delete"

# Clean npm cache (optional)
echo ""
read -p "Do you want to clean npm cache? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm cache clean --force
    echo "✅ npm cache cleaned"
fi

echo ""
echo "✅ Cache cleanup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start Metro bundler: npm start -- --reset-cache"
echo "2. In another terminal, run: npm run ios (or npm run android)"



