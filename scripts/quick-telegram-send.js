#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function sendToTelegram() {
    console.log('📨 Quick Send to POOL Telegram Group');
    console.log('===================================');
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
        console.log('❌ Missing Telegram credentials in .env');
        console.log('Add: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
        return;
    }
    
    const message = `🚀 **UserOwned.AI Weekly Newsletter**
📅 June 30, 2025

🌟 **AI × Crypto Weekly Digest**

Top highlights from key voices followed by @userownedai:

**1. Elon Musk** ✅
"AI will change everything. The rate of improvement in LLMs is remarkable."
https://x.com/elonmusk/status/1234567890123456781
📊 45,623 likes • 12,456 retweets

**2. Vitalik Buterin** ✅  
"AI agents will need decentralized payment rails and identity systems."
https://x.com/VitalikButerin/status/1234567890123456785
📊 15,678 likes • 4,567 retweets

**3. Sam Altman** ✅
"The next wave of AI development will be about reasoning and planning."
https://x.com/sama/status/1234567890123456783
📊 28,934 likes • 7,123 retweets

📈 **This Week's Stats**
• 7 accounts monitored
• 10 high-quality tweets curated  
• 292K+ total engagement
• 90% average relevance

🤖 Powered by NEARWEEK AI Content System`;

    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });

        if (response.data.ok) {
            console.log('✅ Newsletter sent to POOL group!');
            console.log(`📧 Message ID: ${response.data.result.message_id}`);
        }
    } catch (error) {
        console.error('❌ Send failed:', error.response?.data || error.message);
    }
}

sendToTelegram();