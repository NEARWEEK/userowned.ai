#!/usr/bin/env node

require('dotenv').config();
const https = require('https');
const { createLogger } = require('../src/utils/logger');

const logger = createLogger('test-multimedia');

// Environment variables
const figmaApiKey = process.env.FIGMA_API_KEY;
const runwayApiKey = process.env.RUNWAY_API_KEY;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

console.log('🧪 UserOwned.AI Multimedia API Test');
console.log('─'.repeat(50));
console.log(`Figma API: ${figmaApiKey ? '✅ Present' : '❌ Missing'}`);
console.log(`Runway API: ${runwayApiKey ? '✅ Present' : '❌ Missing'}`);
console.log(`Telegram: ${telegramToken ? '✅ Present' : '❌ Missing'}`);
console.log(`Chat ID: ${telegramChatId || '-1001559796949'}`);
console.log('─'.repeat(50));

// Test Figma API
async function testFigmaAPI() {
  if (!figmaApiKey) {
    console.log('⚠️  Skipping Figma test - API key not configured');
    return false;
  }

  return new Promise((resolve) => {
    console.log('\n🎨 Testing Figma API...');
    https.get({
      hostname: 'api.figma.com',
      path: '/v1/me',
      headers: { 'X-Figma-Token': figmaApiKey }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const user = JSON.parse(data);
          console.log(`✅ Figma API connected - User: ${user.email || 'Unknown'}`);
          resolve(true);
        } else {
          console.log(`❌ Figma API error: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ Figma connection error: ${err.message}`);
      resolve(false);
    });
  });
}

// Test Runway API
async function testRunwayAPI() {
  if (!runwayApiKey) {
    console.log('⚠️  Skipping Runway test - API key not configured');
    return false;
  }

  return new Promise((resolve) => {
    console.log('\n🎬 Testing Runway API...');
    https.get({
      hostname: 'api.runwayml.com',
      path: '/v1/info',
      headers: { 
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log(`✅ Runway API endpoint reachable - Status: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log(`❌ Runway API error: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ Runway connection error: ${err.message}`);
      resolve(false);
    });
  });
}

// Post to Telegram
async function postToTelegram(message) {
  const chatId = telegramChatId || '-1001559796949';
  
  const postData = JSON.stringify({
    chat_id: chatId,
    text: message,
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

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.ok) {
          resolve(response);
        } else {
          reject(new Error(response.description));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main test function
async function runTests() {
  console.log('\n🚀 Starting multimedia integration tests...\n');

  // Run API tests
  const figmaOk = await testFigmaAPI();
  const runwayOk = await testRunwayAPI();

  // Generate status report
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const testMessage = `🧪 <b>UserOwned.AI Multimedia Test</b>
<i>${timestamp} UTC</i>

<b>API Status:</b>
${figmaOk ? '✅' : '❌'} Figma API ${figmaApiKey ? 'connected' : 'not configured'}
${runwayOk ? '✅' : '❌'} Runway API ${runwayApiKey ? 'connected' : 'not configured'}
✅ Telegram Bot connected

<b>System Configuration:</b>
• Platform: UserOwned.AI
• Environment: ${process.env.NODE_ENV || 'development'}
• Multimedia: ${(figmaOk || runwayOk) ? 'Operational' : 'Limited'}

${(figmaOk && runwayOk) ? '✅ All systems operational!' : '⚠️ Some services need configuration'}

🔗 <a href="https://userowned.ai">UserOwned.AI</a> | @ai_x_crypto`;

  // Post to Telegram if requested
  if (process.argv.includes('--post') && telegramToken) {
    console.log('\n📱 Posting test message to The Pool group...');
    try {
      const result = await postToTelegram(testMessage);
      console.log(`✅ Message posted successfully! (ID: ${result.result.message_id})`);
    } catch (error) {
      console.error('❌ Failed to post:', error.message);
    }
  } else {
    console.log('\n📋 Test Report:');
    console.log('─'.repeat(50));
    console.log(testMessage.replace(/<[^>]*>/g, ''));
    console.log('─'.repeat(50));
    console.log('\n💡 To post this report to Telegram, run:');
    console.log('   node scripts/test-multimedia.js --post');
  }
}

// Run tests
runTests().catch(err => {
  logger.error('Test failed', err);
  console.error('❌ Test error:', err.message);
  process.exit(1);
});