#!/bin/bash

# Exit on error
set -e

echo "==== Starting UserOwned.ai Staging Environment Setup ===="

# Create userowned user if not exists
if ! id -u userowned &>/dev/null; then
  echo "Creating userowned user..."
  useradd -m -s /bin/bash userowned
  echo "userowned ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/userowned
  chmod 0440 /etc/sudoers.d/userowned
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p /home/userowned/apps
mkdir -p /home/userowned/logs
mkdir -p /home/userowned/scripts
touch /home/userowned/logs/staging.log
touch /home/userowned/logs/deploy.log

# Install dependencies
echo "Installing dependencies..."
apt update
apt install -y git nodejs npm curl ssmtp mailutils

# Clone repository
echo "Cloning repository..."
cd /home/userowned/apps
if [ ! -d "userowned.ai" ]; then
  git clone https://github.com/NEARWEEK/userowned.ai.git
  cd userowned.ai
  git checkout staging
else
  cd userowned.ai
  git fetch origin
  git checkout staging
  git pull origin staging
fi

# Install node dependencies
echo "Installing Node.js dependencies..."
npm install

# Create environment file
echo "Creating environment file..."
cat > /home/userowned/.env.staging << EOF
NODE_ENV=staging
GITHUB_TOKEN=your_github_token
TELEGRAM_BOT_TOKEN=test_telegram_token
TELEGRAM_CHAT_ID=test_chat_id
ZAPIER_WEBHOOK_URL=test_zapier_webhook
GIT_BRANCH=staging
SERVER_NAME=staging
EOF

# Create auto-deployment script
echo "Creating auto-deployment script..."
cat > /home/userowned/scripts/deploy-staging.sh << EOF
#!/bin/bash
cd /home/userowned/apps/userowned.ai
git fetch origin
git checkout staging
git pull origin staging
npm install
echo "[$(date)] Staging deployed successfully" >> /home/userowned/logs/deploy.log
EOF
chmod +x /home/userowned/scripts/deploy-staging.sh

# Create health check script
echo "Creating health check script..."
cat > /home/userowned/scripts/health-check.sh << EOF
#!/bin/bash

# Load environment variables
source /home/userowned/.env.staging

# Check if GitHub API is accessible
response=\$(curl -s -o /dev/null -w "%{http_code}" \\
  -H "Authorization: token \$GITHUB_TOKEN" \\
  https://api.github.com/rate_limit)

if [ \$response -eq 200 ]; then
  echo "[\$(date)] GitHub API: OK" >> /home/userowned/logs/health.log
else
  echo "[\$(date)] GitHub API: FAILED (\$response)" | mail -s "UserOwned.ai Staging Alert" your-email@example.com
fi
EOF
chmod +x /home/userowned/scripts/health-check.sh

# Setup cron jobs
echo "Setting up cron jobs..."
(crontab -l 2>/dev/null || true; echo "# UserOwned.ai staging jobs") | crontab -
(crontab -l; echo "50 10 * * * cd /home/userowned/apps/userowned.ai && /usr/bin/node src/github-updates.js --env=staging >> /home/userowned/logs/staging.log 2>&1") | crontab -
(crontab -l; echo "*/30 * * * * /home/userowned/scripts/deploy-staging.sh") | crontab -
(crontab -l; echo "*/15 * * * * /home/userowned/scripts/health-check.sh") | crontab -

# Set correct permissions
echo "Setting permissions..."
chown -R userowned:userowned /home/userowned

echo "==== UserOwned.ai Staging Environment Setup Complete ===="
echo "Next steps:"
echo "1. Edit /home/userowned/.env.staging with your credentials"
echo "2. Update your email in health check script"
echo "3. Test the setup with: sudo -u userowned node /home/userowned/apps/userowned.ai/src/github-updates.js --env=staging --dry-run"
