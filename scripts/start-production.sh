#!/bin/bash
# NEARWEEK Automated News Sourcing - Production Startup Script

set -e  # Exit on any error

echo "🚀 Starting NEARWEEK Automated News Sourcing System - Production Mode"
echo "================================================================="
echo ""

# Configuration
APP_NAME="nearweek-news-sourcing"
PID_FILE="/var/run/${APP_NAME}.pid"
LOG_DIR="/var/log/${APP_NAME}"
DATA_DIR="/var/lib/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}"

# Create required directories
echo "📁 Creating required directories..."
sudo mkdir -p $LOG_DIR $DATA_DIR $BACKUP_DIR
sudo chown -R $(whoami):$(whoami) $LOG_DIR $DATA_DIR $BACKUP_DIR

# Environment validation
echo "🔍 Validating production environment..."

required_vars=(
    "NODE_ENV"
    "ZAPIER_WEBHOOK_URL"
    "BUFFER_API_KEY"
    "TELEGRAM_BOT_TOKEN"
    "TELEGRAM_CHAT_ID"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment validation passed"

# Start the application with proper logging
echo "🚀 Starting application..."
nohup node src/server.js > "$LOG_DIR/app.log" 2>&1 &
APP_PID=$!
echo $APP_PID > "$PID_FILE"

echo "✅ Application started with PID: $APP_PID"
echo "📊 Monitor logs: tail -f $LOG_DIR/app.log"
echo "🆔 Stop with: kill $APP_PID"
echo "🏥 Health check: curl http://localhost:3000/health"
echo ""
echo "🎉 NEARWEEK Automated News Sourcing System is now running in production!"