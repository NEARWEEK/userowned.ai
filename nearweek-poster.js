const https = require('https');

class NEARWEEKContentPoster {
  constructor() {
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = '@ai_x_crypto';
  }

  async postToTelegram(message) {
    if (!this.telegramToken || !message) return;

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        chat_id: this.chatId,
        text: message,
        parse_mode: 'Markdown'
      });

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${this.telegramToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  generateWDYSContent() {
    return `NEAR AI Ecosystem What Did You Ship This Week? Ep. 18 streams May 15.

Builders across the NEAR ecosystem will demonstrate breakthrough AI agents and decentralized applications.`;
  }

  generateSearchContent() {
    return `NEAR AI Search infrastructure enables decentralized intelligence systems.

Technical specifications and implementation guidance now available.

READ: https://nearweek.com/near-ai-search`;
  }

  async run() {
    const contents = [
      this.generateWDYSContent(),
      this.generateSearchContent()
    ];

    for (const content of contents) {
      await this.postToTelegram(content);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

module.exports = NEARWEEKContentPoster;
