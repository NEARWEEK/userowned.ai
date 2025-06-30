#!/bin/bash

# NEARWEEK Automated News Sourcing - MCP Deployment Script
echo "🚀 NEARWEEK MCP-Integrated Deployment"
echo "====================================="
echo ""

# Step 1: Environment setup
echo "📦 Setting up production environment..."
cp .env.production .env

# Step 2: Install dependencies
echo "📋 Installing dependencies..."
npm ci --production

# Step 3: Test MCP integrations
echo "🔌 Testing MCP integrations..."
node scripts/test-mcp-integrations.js

# Step 4: Start production server
echo "🌟 Starting production server..."
if command -v pm2 &> /dev/null; then
    pm2 start src/server.js --name nearweek-news-mcp
    pm2 save
else
    nohup node src/server.js > logs/production.log 2>&1 &
fi

echo "✅ NEARWEEK Automated News System deployed with MCP integrations!"
echo "🔗 Monitor at: http://localhost:3000/health"
echo "📊 Metrics at: http://localhost:3000/api/metrics"
echo "📝 Logs at: logs/production.log"