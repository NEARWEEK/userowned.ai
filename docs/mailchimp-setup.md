# Mailchimp Setup Guide

## Getting Your Mailchimp Credentials

### 1. Get Your API Key
1. Log in to your Mailchimp account
2. Go to **Account & Billing** → **Extras** → **API keys**
3. Click **Create A Key**
4. Copy the full API key (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21`)

### 2. Find Your Server Prefix
Look at the end of your API key after the dash (e.g., `us21`, `us1`, `us14`)

### 3. Get Your List ID
1. Go to **Audience** → **All contacts**
2. Click **Settings** → **Audience name and defaults**
3. Find the **Audience ID** (looks like: `a1b2c3d4e5`)

## Add to Your .env File

```bash
# Mailchimp
MAILCHIMP_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21
MAILCHIMP_SERVER=us21
MAILCHIMP_LIST_ID=a1b2c3d4e5
```

## Test Your Setup

Run this command to test with real data:
```bash
node scripts/test-mailchimp-report.js
```

To post the report to Telegram:
```bash
node scripts/test-mailchimp-report.js --post
```

## Troubleshooting

- **401 Unauthorized**: Check your API key is correct
- **404 Not Found**: Verify your list ID and server prefix
- **No campaigns found**: The report looks for campaigns sent in the last 7 days