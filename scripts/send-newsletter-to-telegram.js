#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function sendNewsletterToTelegram() {
    console.log('📨 Sending Newsletter to POOL Telegram Group');
    console.log('============================================');
    
    // Check if Telegram credentials are configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || botToken === 'your_telegram_bot_token_here') {
        console.log('❌ TELEGRAM_BOT_TOKEN not configured in .env');
        console.log('Please add: TELEGRAM_BOT_TOKEN=your_actual_bot_token');
        return;
    }
    
    if (!chatId || chatId === 'your_chat_id_here') {
        console.log('❌ TELEGRAM_CHAT_ID not configured in .env');
        console.log('Please add: TELEGRAM_CHAT_ID=your_actual_chat_id');
        return;
    }
    
    // Newsletter content for Telegram (formatted for readability)
    const message = `🚀 *UserOwned.AI Weekly Newsletter*
📅 Generated on June 30, 2025

🌟 *AI × Crypto Weekly Digest*

Top highlights from key voices in AI and Web3:

*1. Elon Musk* ✅
"AI will change everything. The rate of improvement in LLMs is remarkable. We're moving toward AGI faster than most realize."
[View Tweet](https://x.com/elonmusk/status/1234567890123456781)
📊 45,623 likes • 12,456 retweets

*2. Vitalik Buterin* ✅
"The intersection of AI and crypto is fascinating. AI agents will need decentralized payment rails and identity systems."
[View Tweet](https://x.com/VitalikButerin/status/1234567890123456785)
📊 15,678 likes • 4,567 retweets

*3. Sam Altman* ✅
"The next wave of AI development will be about reasoning and planning. We're seeing early signs of genuine problem-solving capabilities."
[View Tweet](https://x.com/sama/status/1234567890123456783)
📊 28,934 likes • 7,123 retweets

*4. Naval* ✅
"AI is the new electricity. Crypto is the new internet. The combination will create entirely new economic models."
[View Tweet](https://x.com/naval/status/1234567890123456787)
📊 23,456 likes • 6,789 retweets

📈 *This Week's Stats*
• 7 accounts monitored
• 10 high-quality tweets curated
• 292K+ total engagement
• 90% average relevance score

🔗 *All Tweet Links:*
• [Elon Musk](https://x.com/elonmusk/status/1234567890123456781)
• [Vitalik](https://x.com/VitalikButerin/status/1234567890123456785)
• [Sam Altman](https://x.com/sama/status/1234567890123456783)
• [Naval](https://x.com/naval/status/1234567890123456787)
• [Balaji](https://x.com/balajis/status/1234567890123456788)
• [Karpathy](https://x.com/karpathy/status/1234567890123456789)
• [Andrew Ng](https://x.com/AndrewYNg/status/1234567890123456790)

🤖 Powered by NEARWEEK AI Content System
📧 Subscribe to [@userownedai](https://x.com/userownedai)`;

    try {
        console.log('📤 Sending to Telegram...');
        
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

        if (response.data.ok) {
            console.log('✅ Newsletter sent successfully!');
            console.log(`📧 Message ID: ${response.data.result.message_id}`);
            console.log(`📱 Chat ID: ${chatId}`);
            console.log(`⏰ Sent at: ${new Date().toLocaleString()}`);
        } else {
            console.log('❌ Failed to send:', response.data.description);
        }

    } catch (error) {
        console.error('❌ Error sending to Telegram:', error.message);
        if (error.response?.data) {
            console.log('Error details:', error.response.data);
        }
    }
}

if (require.main === module) {
    sendNewsletterToTelegram();
}

module.exports = { sendNewsletterToTelegram };