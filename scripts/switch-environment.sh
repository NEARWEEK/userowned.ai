#!/bin/bash

# Environment Management Script for NEARWEEK UserOwned.AI
# Usage: ./scripts/switch-environment.sh [dev|staging|prod]

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Please specify environment: dev, staging, or prod"
    echo "Usage: ./scripts/switch-environment.sh [dev|staging|prod]"
    exit 1
fi

case $ENVIRONMENT in
  "dev"|"development")
    export NODE_ENV=development
    if [ -f .env.development ]; then
        source .env.development
    else
        echo "⚠️ .env.development not found, creating from template..."
        cp .env.example .env.development
        echo "📝 Please configure .env.development before proceeding"
    fi
    echo "🔧 Switched to DEVELOPMENT environment"
    echo "   - Mock data enabled"
    echo "   - API calls disabled"
    echo "   - Safe for local testing"
    ;;
    
  "staging")
    export NODE_ENV=staging
    if [ -f .env.staging ]; then
        source .env.staging
    else
        echo "⚠️ .env.staging not found, creating from template..."
        cp .env.example .env.staging
        echo "📝 Please configure .env.staging before proceeding"
    fi
    echo "🧪 Switched to STAGING environment"
    echo "   - Real APIs with limits"
    echo "   - Staging channels only"
    echo "   - Safe for testing"
    ;;
    
  "prod"|"production")
    export NODE_ENV=production
    if [ -f .env.production ]; then
        source .env.production
    else
        echo "❌ .env.production not found!"
        echo "⚠️ Production environment must be manually configured"
        exit 1
    fi
    echo "🚀 Switched to PRODUCTION environment"
    echo "   - Full API access"
    echo "   - Live channels"
    echo "   - LIVE OPERATIONS!"
    ;;
    
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid options: dev, staging, prod"
    exit 1
    ;;
esac

# Show current environment status
echo ""
echo "📊 Current Environment Status:"
echo "   Environment: $NODE_ENV"
echo "   X API Real: ${TWITTER_ENABLE_REAL_API:-'not set'}"
echo "   Dry Run: ${DRY_RUN_MODE:-'not set'}"
echo "   Daily Limit: ${TWITTER_DAILY_LIMIT:-'not set'}"
echo "   Auto Posting: ${ENABLE_AUTO_POSTING:-'not set'}"

# Suggest next steps
echo ""
echo "🎯 Suggested next steps:"
case $ENVIRONMENT in
  "dev"|"development")
    echo "   npm run test                # Run unit tests"
    echo "   npm run validate           # Validate setup"
    echo "   npm run template:daily -- --dry-run  # Test template"
    ;;
  "staging")
    echo "   npm run api:test           # Test API connection"
    echo "   npm run health-check       # System health"
    echo "   npm run twitter:critical   # Monitor critical handles"
    ;;
  "prod"|"production")
    echo "   npm run health            # Check production health"
    echo "   npm run metrics           # View live metrics"
    echo "   npm run scheduler:status  # Check automation"
    ;;
esac
