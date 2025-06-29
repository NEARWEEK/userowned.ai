# 🔍 NEARWEEK Automated News Sourcing System

> Real-time AI x crypto news processing with X API integration, Claude analysis, and automated Buffer publishing

## 🎯 Overview

The NEARWEEK Automated News Sourcing System monitors curated AI x crypto thought leaders on X (Twitter), analyzes content relevance using Claude AI, and automatically creates high-quality response content within 15 minutes of breaking news.

**Key Features:**
- 🔄 Real-time X API monitoring via Zapier
- 🧠 Claude-powered relevance analysis and content generation
- 📝 Automated Buffer draft creation with platform optimization
- ⚡ <15 minute response time for breaking news
- 🎯 85%+ relevance accuracy through AI filtering
- 📊 Comprehensive quality control and metrics tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Buffer account with API access
- Zapier account for webhook integration
- Telegram bot for team notifications
- Environment variables configured

### Installation
```bash
# Clone the repository
git clone https://github.com/Kisgus/nearweek-automated-news-sourcing.git
cd nearweek-automated-news-sourcing

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys and configuration

# Run automated setup
npm run setup

# Start the system
npm start
```

### Environment Configuration
```bash
# Required Environment Variables
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-id/
BUFFER_API_KEY=your_buffer_api_key_here
BUFFER_ORG_ID=NEARWEEK
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Optional Configuration
RUNWAY_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/runway-integration/
CONFIDENCE_THRESHOLD=85
RELEVANCE_THRESHOLD=60
ENABLE_AUTO_POSTING=false
```

## 📊 Performance Metrics

### Target Performance
- **Response Time**: <15 minutes from tweet to Buffer draft
- **Relevance Accuracy**: >85% (measured by engagement)
- **Processing Capacity**: 500-1000 tweets/day
- **Success Rate**: >95% pipeline completion

---

**Built with ❤️ by the NEARWEEK Team**