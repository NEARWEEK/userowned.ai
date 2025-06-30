#!/usr/bin/env node

require('dotenv').config();
const https = require('https');

// Sample Mailchimp analytics data
const sampleReport = `📊 <b>MAILCHIMP WEEKLY ANALYTICS</b>
<i>Dec 23 - Dec 29, 2025</i>

<b>📧 Weekly Performance</b>
• Campaigns sent: 3
• Total emails: 12,457
• Avg open rate: 28.3%
• Avg click rate: 4.2%
• Total opens: 3,525
• Total clicks: 523

<b>👥 Subscriber Growth</b>
• Total subscribers: 4,892
• New subscribers: +127
• Unsubscribes: -8
• Net growth: +119 (+2.5%)

<b>🏆 Top Campaigns</b>
🥇 AI x Crypto Weekly Digest #47
   Open: 32.1% | Click: 5.8%
🥈 Special Report: NEAR Intents Launch
   Open: 29.4% | Click: 4.1%
🥉 Market Update: DeFi Trends 2025
   Open: 23.5% | Click: 2.7%

<b>💡 Key Insights</b>
✅ Strong engagement with 28.3% open rate
✅ Above-average click-through performance
✅ Healthy subscriber growth trend
⚠️ Consider A/B testing subject lines for better opens

🔗 <a href="https://userowned.ai">UserOwned.AI</a> | @ai_x_crypto`;

async function postToTelegram(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  const postData = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${botToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
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

async function main() {
  try {
    console.log('📤 Posting sample Mailchimp report to The Pool group...\n');
    
    const result = await postToTelegram(sampleReport);
    
    console.log('✅ Report posted successfully!');
    console.log(`Message ID: ${result.result.message_id}`);
    console.log(`Chat: ${result.result.chat.title}`);
    console.log('\nCheck The Pool group to see the formatted report.');
    
  } catch (error) {
    console.error('❌ Failed to post report:', error.message);
  }
}

main();