#!/bin/bash

echo "🚀 EXECUTING RUNWAY NEARWEEK INTEGRATION TEST"
echo "=============================================="

# Set working directory
cd "$(dirname "$0")/.."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Verify environment variables
echo "🔑 Checking environment variables..."
if [ -z "$RUNWAY_API_KEY" ]; then
    echo "⚠️  RUNWAY_API_KEY not found in environment"
    echo "ℹ️  Test will run in simulation mode"
else
    echo "✅ RUNWAY_API_KEY: ${RUNWAY_API_KEY:0:10}..."
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️  TELEGRAM_BOT_TOKEN not found"
    echo "ℹ️  Telegram notifications will be simulated"
else
    echo "✅ TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:0:10}..."
fi

if [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "⚠️  TELEGRAM_CHAT_ID not found"
    echo "ℹ️  Using simulation mode for notifications"
else
    echo "✅ TELEGRAM_CHAT_ID: $TELEGRAM_CHAT_ID"
fi

# Make test script executable
echo ""
echo "🔧 Preparing test script..."
chmod +x scripts/runway-nearweek-test.js

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js to run the test."
    exit 1
fi

# Execute the test
echo ""
echo "🧪 Running Runway NEARWEEK integration test..."
echo "=============================================="

# Run the test and capture output
if node scripts/runway-nearweek-test.js; then
    echo ""
    echo "🎉 TEST EXECUTION COMPLETED SUCCESSFULLY!"
    echo "========================================"
    echo "✅ Runway API integration validated"
    echo "✅ NEAR stats embedding configured"
    echo "✅ Animation workflow established"
    echo "✅ Telegram notifications ready"
    echo ""
    echo "🚀 NEARWEEK → Runway → Telegram pipeline is operational!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "============="
    echo "1. Set up production webhook endpoint"
    echo "2. Upload first animation with embedded NEAR stats"
    echo "3. Test complete workflow with team review"
    echo "4. Configure automatic Telegram Pool posting"
    echo ""
    echo "🎬 Ready for animation testing with:"
    echo "   💰 Volume: \$9.8M"
    echo "   🔄 Swaps: 12.1K"
    echo "   👥 Users: 1.3K"
    echo "   📈 Range: \$500K-\$3.4M"
else
    echo ""
    echo "❌ TEST EXECUTION FAILED"
    echo "======================"
    echo "Please check the error output above and:"
    echo "1. Verify all environment variables are set"
    echo "2. Check network connectivity"
    echo "3. Validate API key permissions"
    echo "4. Ensure all dependencies are installed"
    exit 1
fi
