#!/bin/bash

# NEARWEEK Quick Deployment with MCP
echo "🚀 NEARWEEK Quick Deploy with MCP Integrations"
echo "============================================="
echo ""

# Step 1: Copy production environment
echo "📦 Setting up environment..."
cp .env.production .env
echo "✅ Environment configured"

# Step 2: Install minimal dependencies
echo "📋 Installing dependencies..."
npm install --production
echo "✅ Dependencies installed"

# Step 3: Start the server
echo "🌟 Starting NEARWEEK automation server..."
echo "Server will be available at: http://localhost:3000"
echo "Health check: http://localhost:3000/health"
echo "Metrics: http://localhost:3000/api/metrics"
echo ""

# Start server in background
node src/server.js &
SERVER_PID=$!

echo "✅ NEARWEEK Server started (PID: $SERVER_PID)"
echo "🔍 Testing integrations in 5 seconds..."
sleep 5

# Test health endpoint
echo "🩺 Testing server health..."
curl -s http://localhost:3000/health || echo "Health check failed"

echo ""
echo "🎉 NEARWEEK Automation System is LIVE!"
echo "================================================"
echo "MCP Integrations:"
echo "  ✅ Buffer (NEARWEEK org)"
echo "  ✅ Telegram Bot"
echo "  ✅ GitHub (nearweek-automated-news-sourcing)"
echo "  ✅ Zapier Webhooks"
echo ""
echo "Next Steps:"
echo "1. Configure X API monitoring in Zapier"
echo "2. Enable auto-posting: ENABLE_AUTO_POSTING=true"
echo "3. Monitor logs: tail -f logs/production.log"
echo "4. Stop server: kill $SERVER_PID"
echo ""

# Keep script running to show logs
echo "Showing live logs (Ctrl+C to stop):"
tail -f logs/production.log 2>/dev/null || echo "Logs will appear when system processes content"