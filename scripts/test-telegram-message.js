#!/usr/bin/env node

const https = require('https');

// Parse command line arguments
const args = process.argv.slice(2);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || args[0];
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || args[1];
const MESSAGE = args[2] || '🔍 Testing pool group connection';

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ Error: Missing required parameters\n');
  console.error('Usage:');
  console.error('  node test-telegram-message.js BOT_TOKEN CHAT_ID [MESSAGE]');
  console.error('  or set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables\n');
  console.error('Examples:');
  console.error('  node test-telegram-message.js YOUR_BOT_TOKEN -1001234567890');
  console.error('  node test-telegram-message.js YOUR_BOT_TOKEN -1001234567890 "Custom test message"');
  process.exit(1);
}

console.log('📤 Sending test message to Telegram...\n');
console.log(`Bot Token: ${BOT_TOKEN.substring(0, 10)}...${BOT_TOKEN.slice(-4)}`);
console.log(`Chat ID: ${CHAT_ID}`);
console.log(`Message: ${MESSAGE}\n`);

const postData = JSON.stringify({
  chat_id: CHAT_ID,
  text: MESSAGE,
  parse_mode: 'HTML'
});

const options = {
  hostname: 'api.telegram.org',
  path: `/bot${BOT_TOKEN}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.ok) {
        console.log('✅ Message sent successfully!\n');
        console.log('Message details:');
        console.log(`- Message ID: ${response.result.message_id}`);
        console.log(`- Chat ID: ${response.result.chat.id}`);
        console.log(`- Chat Type: ${response.result.chat.type}`);
        if (response.result.chat.title) {
          console.log(`- Chat Title: ${response.result.chat.title}`);
        }
        console.log(`- Timestamp: ${new Date(response.result.date * 1000).toLocaleString()}`);
      } else {
        console.error('❌ Failed to send message\n');
        console.error('Error:', response.description);
        
        if (response.error_code === 400 && response.description.includes('chat not found')) {
          console.error('\nPossible issues:');
          console.error('1. The chat ID is incorrect');
          console.error('2. The bot is not a member of the group');
          console.error('3. The bot was removed from the group');
          console.error('\nTo fix: Add the bot to the group and try again');
        }
      }
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();