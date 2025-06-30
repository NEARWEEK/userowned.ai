# UserOwned.AI Newsletter Setup Guide

## 🚀 Quick Implementation

This system creates personalized newsletters based on accounts that @userownedai follows, using your existing NEARWEEK infrastructure.

## 📋 Prerequisites

### 1. Update Environment Variables
Add these to your `.env` file:

```bash
# X API Credentials (map your existing ones)
X_API_KEY=${TWITTER_API_KEY}
X_API_SECRET=${TWITTER_API_SECRET}
X_ACCESS_TOKEN=${TWITTER_ACCESS_TOKEN}
X_ACCESS_SECRET=${TWITTER_ACCESS_TOKEN_SECRET}

# Telegram for POOL group
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_pool_group_chat_id

# Optional: Mailchimp integration
MAILCHIMP_API_KEY=your_mailchimp_key
MAILCHIMP_LIST_ID=your_list_id
```

### 2. Install Dependencies
```bash
cd nearweek-automated-news-sourcing
npm install twitter-api-v2
```

## 🎯 Available Commands

### Test Newsletter Generation
```bash
# Test run (no actual sending)
node scripts/x-following-newsletter.js --dry-run

# Generate daily newsletter
node scripts/x-following-newsletter.js --daily

# Generate weekly digest  
node scripts/x-following-newsletter.js --weekly
```

### Quick Telegram Send
```bash
# Send sample newsletter to POOL group
node scripts/quick-telegram-send.js
```

## 📊 System Features

### 1. Following-Based Curation
- Automatically fetches all accounts @userownedai follows
- Processes recent posts from each account
- Fallback to curated high-value accounts if API limits hit

### 2. Intelligent Content Scoring
- **AI Keywords**: +15 points each (ai, llm, machine learning, etc.)
- **Crypto Keywords**: +10 points each (crypto, defi, web3, etc.)
- **NEAR Keywords**: +20 points each (near, aurora, octopus, etc.)
- **Verified Accounts**: +10 points
- **High Followers**: +5-10 points based on count

### 3. Multi-Format Output
- **HTML Newsletter**: Beautiful email-ready format
- **Markdown**: GitHub/Telegram friendly
- **JSON Data**: Raw data for further processing

### 4. Automated Distribution
- **Telegram**: Send to POOL group
- **Mailchimp**: Email newsletter (if configured)
- **GitHub Issues**: Technical reports
- **Webhook Integration**: Feeds into existing NEARWEEK pipeline

## 📁 Output Structure

```
data/newsletters/
├── following-list.json          # Current @userownedai following list
├── newsletter-2024-06-30.html   # HTML email version
├── newsletter-2024-06-30.md     # Markdown version
└── newsletter-2024-06-30.json   # Raw structured data
```

## 🔧 Integration with Existing System

### Webhook Handler Enhancement
The newsletter system sends high-relevance posts to your existing webhook:

```javascript
// Already integrated in your webhook-handler.js
if (source === 'userownedai-following') {
  // Process with higher priority
  const processedData = {
    content: text,
    author: author,
    source: 'userownedai-following',
    relevance: relevance_score * 1.2, // Boost relevance
    category: metadata.category,
    priority: 'high',
    autoApprove: relevance_score >= 70
  };
  
  await processHighPriorityContent(processedData);
}
```

## 📅 Newsletter Sections

### 1. TRENDING
High-engagement posts across all topics

### 2. AI FOCUS  
AI and machine learning developments

### 3. CRYPTO DEFI
Blockchain and DeFi updates

### 4. NEAR ECOSYSTEM
NEAR Protocol specific content

## 🚀 Quick Start Commands

```bash
# 1. Test the system
npm run newsletter:test

# 2. Generate daily newsletter
npm run newsletter:daily

# 3. Send to Telegram immediately
node scripts/quick-telegram-send.js

# 4. Generate and distribute everywhere
npm run newsletter:distribute
```

## 📊 Sample Output

### Telegram Message Format:
```
🚀 UserOwned.AI Newsletter
UserOwned.AI Daily Intelligence Report

📅 6/30/2025

TRENDING
@elonmusk: AI will change everything. The rate of improvement...
🔗 https://x.com/elonmusk/status/123...

AI FOCUS  
@sama: The next wave of AI development will be about reasoning...
🔗 https://x.com/sama/status/456...

🤖 Powered by NEARWEEK AI
```

## ⚠️ Rate Limiting

The system includes built-in protections:
- 3-second delays between API calls
- Batch processing (5 accounts at a time)
- Fallback to curated accounts if API limits hit
- Conservative limits (20 accounts max per run)

## 🔄 Automation Setup

### Daily Newsletter (Optional)
```bash
# Install PM2 for process management
npm install -g pm2

# Create scheduler
pm2 start scripts/newsletter-scheduler.js --name userownedai-newsletter

# Schedule: Daily at 9 AM, Weekly on Mondays at 10 AM
```

## 🎯 Success Metrics

- **Following List**: Automatically tracks all @userownedai follows
- **Content Quality**: 70%+ relevance score threshold
- **Multi-Channel**: HTML, Markdown, JSON, and Telegram
- **Integration**: Feeds into existing NEARWEEK processing
- **Rate Limited**: Respects X API limits with smart batching

## 📞 Support

If you encounter issues:

1. **API Limits**: System will fallback to curated accounts
2. **Telegram Not Configured**: Newsletter still generates, just skips sending
3. **No Recent Posts**: System generates report showing this status

The system is designed to be resilient and will always produce output even if some components fail.

---

**Ready to launch the UserOwned.AI newsletter system! 🚀**