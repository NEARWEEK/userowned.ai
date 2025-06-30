# 🔐 UserOwned.ai Secrets Configuration

## Required GitHub Secrets

To enable full automation, add these secrets to your GitHub repository:

### Telegram Bot Integration

1. **TELEGRAM_BOT_TOKEN**
   - Get from: @BotFather on Telegram
   - Create new bot: `/newbot`
   - Set name: `UserOwned AI Bot`
   - Set username: `userownedai_bot`
   - Copy the token

2. **TELEGRAM_CHAT_ID** 
   - For POOOL group: Get the chat ID where bot should post
   - Add bot to the group as admin
   - Use `/start` to get chat ID

### Buffer/X Integration

3. **ZAPIER_WEBHOOK_URL**
   - Create Zapier webhook that connects to Buffer
   - Buffer should be connected to @userownedai X account
   - Webhook receives JSON: `{"text": "content", "source": "userowned-ai"}`

## Setup Instructions

### 1. Add Secrets to GitHub

```bash
# Navigate to: GitHub Repo → Settings → Secrets and Variables → Actions
# Click "New repository secret" for each:

TELEGRAM_BOT_TOKEN: "1234567890:ABCDEF..."
TELEGRAM_CHAT_ID: "-1001234567890"
ZAPIER_WEBHOOK_URL: "https://hooks.zapier.com/hooks/catch/..."
```

### 2. Telegram Bot Setup

1. Message @BotFather on Telegram
2. `/newbot`
3. Name: `UserOwned AI Bot`
4. Username: `userownedai_bot` (or similar)
5. Copy token → Add as `TELEGRAM_BOT_TOKEN`
6. Add bot to POOOL group
7. Make bot admin with post permissions
8. Get chat ID → Add as `TELEGRAM_CHAT_ID`

### 3. Buffer/X Integration

1. Connect Buffer to @userownedai X account
2. Create Zapier automation:
   - Trigger: Webhook
   - Action: Buffer → Add to Queue
   - Channel: @userownedai X profile
3. Copy webhook URL → Add as `ZAPIER_WEBHOOK_URL`

### 4. Test the Integration

```bash
# Trigger manual run:
# GitHub → Actions → "UserOwned.ai Daily Intelligence" → "Run workflow"
```

## Troubleshooting

### Telegram Issues
- Bot not posting: Check bot is admin in group
- Permission errors: Ensure bot has "Send Messages" permission
- Chat ID issues: Use @userinfobot to get correct chat ID

### X/Buffer Issues
- Posts not appearing: Check Buffer queue
- Zapier errors: Verify webhook URL format
- Authentication: Reconnect Buffer to X account

## Current Status

✅ GitHub Actions workflow: Deployed
🔄 Telegram bot: Needs secrets configuration
🔄 Buffer/X integration: Needs Zapier webhook
⏰ Schedule: Daily 14:40 CET

---

*UserOwned.ai by NEARWEEK - The Bloomberg Terminal for AI x Crypto*