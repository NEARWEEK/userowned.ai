#!/bin/bash
# NEARWEEK Automated News Sourcing - Production Deployment Script

set -e

echo "🚀 NEARWEEK Automated News Sourcing - Production Deployment"
echo "========================================================="

# Configuration
APP_NAME="nearweek-news-sourcing"
DEPLOY_DIR="/opt/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}"
SERVICE_NAME="nearweek-news"
GIT_REPO="https://github.com/Kisgus/nearweek-automated-news-sourcing.git"
BRANCH="main"

# Deployment functions
backup_current() {
    if [ -d "$DEPLOY_DIR" ]; then
        echo "💾 Creating backup of current deployment..."
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        sudo tar -czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" -C "$DEPLOY_DIR" .
        echo "✅ Backup created: ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
    fi
}

deploy_code() {
    echo "📦 Deploying application code..."
    
    # Create deployment directory
    sudo mkdir -p "$DEPLOY_DIR"
    
    # Clone or update repository
    if [ -d "${DEPLOY_DIR}/.git" ]; then
        echo "🔄 Updating existing repository..."
        cd "$DEPLOY_DIR"
        sudo git fetch origin
        sudo git reset --hard "origin/$BRANCH"
    else
        echo "📥 Cloning repository..."
        sudo git clone -b "$BRANCH" "$GIT_REPO" "$DEPLOY_DIR"
    fi
    
    cd "$DEPLOY_DIR"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    sudo npm ci --only=production
    
    # Set proper ownership
    sudo chown -R nearweek:nearweek "$DEPLOY_DIR"
    
    echo "✅ Code deployment completed"
}

setup_systemd() {
    echo "🔧 Setting up systemd service..."
    
    sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null << EOF
[Unit]
Description=NEARWEEK Automated News Sourcing System
After=network.target
Wants=network.target

[Service]
Type=simple
User=nearweek
Group=nearweek
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

# Environment
Environment=NODE_ENV=production
EnvironmentFile=-/etc/nearweek/environment

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_DIR /var/log/nearweek /var/lib/nearweek

# Limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    
    echo "✅ Systemd service configured"
}

run_tests() {
    echo "🧪 Running deployment tests..."
    cd "$DEPLOY_DIR"
    
    # Run test suite
    npm test
    npm run test:pipeline
    
    echo "✅ All tests passed"
}

# Main deployment process
echo "🔍 Pre-deployment validation..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run with sudo privileges"
    exit 1
fi

# Create nearweek user if doesn't exist
if ! id "nearweek" &>/dev/null; then
    echo "👤 Creating nearweek user..."
    useradd -r -s /bin/bash -d /home/nearweek -m nearweek
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p "$BACKUP_DIR" /var/log/nearweek /var/lib/nearweek /etc/nearweek
chown -R nearweek:nearweek "$BACKUP_DIR" /var/log/nearweek /var/lib/nearweek

# Execute deployment steps
backup_current
deploy_code
setup_systemd
run_tests

# Start/restart service
echo "🚀 Starting service..."
systemctl restart "$SERVICE_NAME"

# Wait for service to start
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3000/health; then
    echo "✅ Health check passed"
    echo "✅ Production deployment completed successfully!"
else
    echo "❌ Health check failed"
    echo "🔄 Rolling back..."
    systemctl stop "$SERVICE_NAME"
    exit 1
fi

# Enable and start Claude Code workflows
echo "🤖 Configuring Claude Code..."
cd "$DEPLOY_DIR"
sudo -u nearweek claude-code init --environment=production
sudo -u nearweek claude-code workflow start news-processing
sudo -u nearweek claude-code workflow start breaking-news-response
sudo -u nearweek claude-code monitoring start

echo ""
echo "🎉 NEARWEEK Automated News Sourcing System deployed successfully!"
echo "Service status: systemctl status $SERVICE_NAME"
echo "View logs: journalctl -u $SERVICE_NAME -f"
echo "Health check: curl http://localhost:3000/health"