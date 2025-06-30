#!/bin/bash

echo "🎬 EXECUTING RUNWAY VIDEO PROCESSOR"
echo "==================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this script from the nearweek-automated-news-sourcing directory"
    exit 1
fi

# Check environment variables
echo "🔑 Environment Check:"
if [ -n "$RUNWAY_API_KEY" ]; then
    echo "✅ RUNWAY_API_KEY: ${RUNWAY_API_KEY:0:10}..."
else
    echo "⚠️  RUNWAY_API_KEY not found"
fi

if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "✅ TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:0:10}..."
else
    echo "⚠️  TELEGRAM_BOT_TOKEN not found"
fi

if [ -n "$TELEGRAM_CHAT_ID" ]; then
    echo "✅ TELEGRAM_CHAT_ID: $TELEGRAM_CHAT_ID"
else
    echo "⚠️  TELEGRAM_CHAT_ID not found"
fi

# Make script executable
chmod +x scripts/runway-video-processor.js

# Execute the video processor
echo ""
echo "🚀 Running Runway video processor..."
node scripts/runway-video-processor.js

echo ""
echo "🎉 Execution completed!"
echo "Your Runway video animation workflow is ready for Telegram Pool distribution."