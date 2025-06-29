#!/usr/bin/env node

const https = require('https');

// Get bot token from environment or command line
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.argv[2];

if (!BOT_TOKEN) {
  console.error('Error: No bot token provided');
  console.error('Usage: node get-telegram-chat-id.js YOUR_BOT_TOKEN');
  console.error('   or: TELEGRAM_BOT_TOKEN=your_token node get-telegram-chat-id.js');
  process.exit(1);
}

console.log('🔍 Fetching updates from Telegram...\n');

const options = {
  hostname: 'api.telegram.org',
  path: `/bot${BOT_TOKEN}/getUpdates?limit=100`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (!response.ok) {
        console.error('❌ Error from Telegram API:', response.description);
        return;
      }

      if (response.result.length === 0) {
        console.log('📭 No messages found.');
        console.log('\nTo get your chat ID:');
        console.log('1. Add your bot to the group');
        console.log('2. Send a message in the group (mention the bot or send /start)');
        console.log('3. Run this script again\n');
        return;
      }

      console.log(`📬 Found ${response.result.length} update(s)\n`);

      // Extract unique chats
      const chats = new Map();
      
      response.result.forEach((update, index) => {
        const message = update.message || update.channel_post;
        if (message && message.chat) {
          const chat = message.chat;
          const key = `${chat.id}_${chat.type}`;
          
          if (!chats.has(key)) {
            chats.set(key, {
              id: chat.id,
              type: chat.type,
              title: chat.title || chat.username || 'Private Chat',
              lastMessage: message.text || '[non-text message]',
              date: new Date(message.date * 1000).toLocaleString()
            });
          }
        }
      });

      console.log('💬 Unique chats found:\n');
      console.log('─'.repeat(80));
      
      chats.forEach((chat) => {
        console.log(`Chat ID: ${chat.id}`);
        console.log(`Type: ${chat.type}`);
        console.log(`Title: ${chat.title}`);
        console.log(`Last message: ${chat.lastMessage.substring(0, 50)}${chat.lastMessage.length > 50 ? '...' : ''}`);
        console.log(`Date: ${chat.date}`);
        console.log('─'.repeat(80));
      });

      console.log('\n✅ Use the Chat ID above for your TELEGRAM_CHAT_ID environment variable');
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();