#!/usr/bin/env node

const dotenv = require('dotenv');
dotenv.config({ silent: true });

const https = require('https');

// Environment variables
const figmaApiKey = process.env.FIGMA_API_KEY;
const runwayApiKey = process.env.RUNWAY_API_KEY;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID || '-1001559796949';

console.log('🧪 UserOwned.AI Multimedia API Test');
console.log('─'.repeat(50));
console.log(`Figma API: ${figmaApiKey ? '✅ Present' : '❌ Missing'}`);
console.log(`Runway API: ${runwayApiKey ? '✅ Present' : '❌ Missing'}`);
console.log(`Telegram: ${telegramToken ? '✅ Present' : '❌ Missing'}`);
console.log(`Chat ID: ${telegramChatId}`);
console.log('─'.repeat(50));

if (process.argv.includes('--post') && telegramToken) {
  const testMessage = `🧪 <b>UserOwned.AI Multimedia Test</b>
<i>${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</i>

<b>API Status:</b>
${figmaApiKey ? '✅' : '❌'} Figma API ${figmaApiKey ? 'configured' : 'not configured'}
${runwayApiKey ? '✅' : '❌'} Runway API ${runwayApiKey ? 'configured' : 'not configured'}
✅ Telegram Bot connected

<b>System Configuration:</b>
• Platform: UserOwned.AI
• Environment: ${process.env.NODE_ENV || 'development'}
• Chat ID: ${telegramChatId}

${(figmaApiKey || runwayApiKey) ? '✅ Multimedia APIs detected!' : '⚠️ Add API keys for full multimedia support'}

🔗 <a href="https://userowned.ai">UserOwned.AI</a> | @ai_x_crypto`;

  const postData = JSON.stringify({
    chat_id: telegramChatId,
    text: testMessage,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${telegramToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n📱 Posting test message to The Pool group...');
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.ok) {
          console.log(`✅ Message posted successfully! (ID: ${response.result.message_id})`);
        } else {
          console.error('❌ Failed to post:', response.description);
        }
      } catch (e) {
        console.error('❌ Error parsing response:', e.message);
      }
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
    process.exit(1);
  });

  req.write(postData);
  req.end();
} else {
  console.log('\n💡 To post a test report to Telegram, run:');
  console.log('   node scripts/test-multimedia-simple.js --post');
  console.log('\n📝 To add multimedia APIs, update your .env file:');
  console.log('   FIGMA_API_KEY=your_figma_api_key');
  console.log('   RUNWAY_API_KEY=your_runway_api_key');
  process.exit(0);
}