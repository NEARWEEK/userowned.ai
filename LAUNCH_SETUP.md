# 🚀 UserOwned.ai Configuration Guide

## GitHub Secrets Setup

To complete the automation, add these secrets in **GitHub Settings > Secrets and Variables > Actions**:

### 🔑 Required Secrets

```bash
# Telegram Integration
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_FROM_BOTFATHER"
TELEGRAM_CHAT_ID="YOUR_POOOL_GROUP_CHAT_ID"

# Buffer/X Integration  
ZAPIER_WEBHOOK_URL="YOUR_ZAPIER_WEBHOOK_URL"
```

## 🤖 Telegram Bot Setup Instructions

### Step 1: Create Bot
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Bot name: `UserOwned AI Bot`
4. Username: `userownedai_nearweek_bot`
5. Copy the token → Use as `TELEGRAM_BOT_TOKEN`

### Step 2: Add to POOOL Group
1. Add bot to your POOOL group
2. Make bot admin with "Send Messages" permission
3. Get chat ID using @userinfobot
4. Use chat ID as `TELEGRAM_CHAT_ID`

## 🐦 X (Twitter) Integration

### Current Status: ✅ WORKING
- Connected via Buffer + Zapier
- Auto-posting to @userownedai
- Successfully posted launch announcement

### Webhook Configuration
If you need a new webhook:
1. Create Zapier trigger (Webhook)
2. Connect to Buffer
3. Set channel: @userownedai X profile
4. Copy webhook URL → Use as `ZAPIER_WEBHOOK_URL`

## ⏰ Automation Schedule

**Daily Intelligence Reports:**
- **Time**: 14:40 CET (13:40 UTC)
- **Frequency**: Every day
- **Triggers**: GitHub Actions automatic + manual dispatch

## 🧪 Testing

### Manual Trigger
1. Go to: https://github.com/NEARWEEK/userowned.ai/actions
2. Select "UserOwned.ai Daily Intelligence"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

### Expected Output
- ✅ GitHub Actions log with ecosystem scores
- ✅ Telegram post to POOOL (if secrets configured)
- ✅ X post via Buffer
- ✅ Full intelligence report in logs

## 📊 Data Sources

### Currently Tracking
- **NEAR Protocol**: nearcore repository
- **Internet Computer**: ic repository  
- **Bittensor**: bittensor repository
- **DeFi TVL**: DefiLlama API
- **Market Data**: Multiple sources with fallbacks

### Scoring Algorithm
```
Ecosystem Score (0-100) = 
  Development Activity (40%) +
  Adoption Metrics (35%) + 
  Financial Performance (25%)
```

## 🔧 Troubleshooting

### Telegram Issues
- **Bot not posting**: Check bot admin permissions
- **Wrong chat**: Verify chat ID with @userinfobot
- **Token errors**: Regenerate token from @BotFather

### X Integration Issues
- **Posts not appearing**: Check Buffer queue
- **Rate limits**: Buffer handles scheduling
- **Content too long**: Workflow auto-truncates

### GitHub Actions
- **Workflow failing**: Check secrets are set correctly
- **API limits**: GitHub API has rate limits (5000/hour)
- **Data errors**: Fallback values prevent total failures

## 📈 Success Metrics

### Launch Day (Today)
- ✅ Website live: userowned.ai
- ✅ X account active: @userownedai
- ✅ First post successful
- ✅ Automation deployed
- 🔄 Telegram pending secrets

### Next 7 Days
- [ ] Daily intelligence reports
- [ ] Telegram POOOL integration
- [ ] User engagement tracking
- [ ] Data source expansion

---

**UserOwned.ai by NEARWEEK** | Building the Bloomberg Terminal for AI x Crypto convergence