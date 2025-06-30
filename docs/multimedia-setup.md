# Multimedia API Setup Guide

## Overview

UserOwned.AI supports multimedia content generation through integration with Figma and Runway APIs. This enables automated creation of visual content for reports and social media posts.

## API Configuration

### 1. Figma API Setup

Figma enables automated design generation and template creation.

**Getting your Figma API Token:**
1. Log in to [Figma](https://www.figma.com)
2. Go to **Settings** (click your profile icon)
3. Navigate to **Account** → **Personal access tokens**
4. Click **Generate new token**
5. Give it a descriptive name (e.g., "UserOwned.AI Integration")
6. Copy the token immediately (it won't be shown again)

**Add to .env:**
```bash
FIGMA_API_KEY=your_figma_personal_access_token
```

### 2. Runway API Setup

Runway provides AI-powered video and image generation capabilities.

**Getting your Runway API Key:**
1. Sign up for [Runway](https://runwayml.com)
2. Go to [API Settings](https://app.runwayml.com/settings/api)
3. Generate a new API key
4. Copy the key

**Add to .env:**
```bash
RUNWAY_API_KEY=your_runway_api_key
```

## Testing Your Setup

After adding both API keys to your `.env` file, test the configuration:

```bash
# Test multimedia APIs
node scripts/test-multimedia-simple.js

# Post test to Telegram
node scripts/test-multimedia-simple.js --post
```

## Available Features

### With Figma API:
- Generate report graphics from templates
- Create data visualizations
- Design social media cards
- Automated branding consistency

### With Runway API:
- Generate AI images for reports
- Create video summaries
- Process and enhance visuals
- Style transfer for consistent aesthetics

## Integration Examples

### 1. Generate Visual Report
```javascript
// Example: Create visual newsletter with Figma
const visualReport = await generateVisualNewsletter({
  template: 'weekly-metrics',
  data: weeklyAnalytics,
  format: 'telegram'
});
```

### 2. AI-Generated Images
```javascript
// Example: Generate ecosystem visualization with Runway
const aiImage = await generateEcosystemVisual({
  prompt: 'AI and crypto convergence visualization',
  style: 'technical-diagram'
});
```

## GitHub Actions Setup

For automated multimedia generation in CI/CD:

1. Add secrets to your GitHub repository:
   - Go to Settings → Secrets → Actions
   - Add `FIGMA_API_KEY`
   - Add `RUNWAY_API_KEY`

2. The workflows will automatically use these for multimedia generation

## Rate Limits & Best Practices

### Figma API:
- Rate limit: 150 requests per minute
- Cache generated designs for reuse
- Use templates to minimize API calls

### Runway API:
- Credit-based system
- Optimize prompts for better results
- Cache generated content when possible

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Verify API key is correct
   - Check token hasn't expired
   - Ensure proper permissions

2. **Rate Limit Exceeded**
   - Implement exponential backoff
   - Cache results
   - Batch requests when possible

3. **Generation Failures**
   - Check API credit balance (Runway)
   - Verify file permissions (Figma)
   - Review error logs

## Security Notes

- Never commit API keys to version control
- Use GitHub Secrets for CI/CD
- Rotate keys periodically
- Monitor usage for anomalies

## Next Steps

1. Configure API keys in `.env`
2. Run multimedia tests
3. Create your first visual report
4. Set up automated generation workflows

For support, check the [UserOwned.AI documentation](https://userowned.ai/docs) or create an issue on GitHub.