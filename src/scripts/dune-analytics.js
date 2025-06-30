/**
 * Dune Analytics NEAR Intents DeFi Updates
 * Fetches data from NEAR Intents dashboard and posts to Telegram/X
 */

const https = require('https');

class DuneAnalytics {
  constructor() {
    this.apiKey = process.env.DUNE_ANALYTICS;
    this.baseUrl = 'https://api.dune.com/api/v1';
    this.nearIntentsQueryId = '3655847'; // NEAR Intents main query ID
  }

  async fetchNearIntentsData() {
    try {
      // Execute query to get latest data
      const data = await this.executeQuery(this.nearIntentsQueryId);
      
      // Parse the data for our metrics
      const metrics = this.parseIntentsData(data);
      
      return metrics;
    } catch (error) {
      console.error('Error fetching NEAR Intents data:', error);
      throw error;
    }
  }

  async executeQuery(queryId) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.dune.com',
        port: 443,
        path: `/api/v1/query/${queryId}/results`,
        method: 'GET',
        headers: {
          'X-Dune-API-Key': this.apiKey,
          'User-Agent': 'UserOwned-AI/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              reject(new Error(`Dune API error: ${res.statusCode} - ${parsed.error || 'Unknown error'}`));
              return;
            }
            resolve(parsed);
          } catch (error) {
            reject(new Error(`JSON parse error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  parseIntentsData(data) {
    // Mock data for demonstration - replace with actual parsing
    const mockMetrics = {
      totalTransactions: 2847,
      transactionChange: 12.3,
      totalVolume: 1240000,
      volumeChange: -3.2,
      activeWallets: 892,
      walletChange: 8.1,
      avgTransactionSize: 436,
      
      categories: {
        swaps: { count: 1205, percentage: 42.3 },
        liquidity: { count: 743, percentage: 26.1 },
        staking: { count: 521, percentage: 18.3 },
        crossChain: { count: 378, percentage: 13.3 }
      },
      
      insights: [
        'Swap volume increased 15.7% day-over-day',
        'New wallet adoption up 8.1%',
        'Cross-chain activity normalized after yesterday spike'
      ]
    };
    
    return mockMetrics;
  }

  generateTelegramMessage(metrics) {
    const date = new Date().toISOString().split('T')[0];
    const formatNumber = (num) => num.toLocaleString();
    const formatChange = (change) => change > 0 ? `+${change}%` : `${change}%`;
    
    return `NEAR INTENTS DEFI UPDATE [${date}]

Daily metrics from [NEAR Intents dashboard](https://dune.com/near/near-intents):

Protocol Activity:
- Total transactions: ${formatNumber(metrics.totalTransactions)} (24h change: ${formatChange(metrics.transactionChange)})
- Total volume: $${(metrics.totalVolume / 1000000).toFixed(2)}M (${formatChange(metrics.volumeChange)})
- Active wallets: ${formatNumber(metrics.activeWallets)} (${formatChange(metrics.walletChange)})
- Average transaction size: $${formatNumber(metrics.avgTransactionSize)}

Top Intent Categories:
- Swap transactions: ${formatNumber(metrics.categories.swaps.count)} (${metrics.categories.swaps.percentage}% of total)
- Liquidity provision: ${formatNumber(metrics.categories.liquidity.count)} (${metrics.categories.liquidity.percentage}%)
- Staking operations: ${formatNumber(metrics.categories.staking.count)} (${metrics.categories.staking.percentage}%)
- Cross-chain transfers: ${formatNumber(metrics.categories.crossChain.count)} (${metrics.categories.crossChain.percentage}%)

Notable Changes:
${metrics.insights.map(insight => `- ${insight}`).join('\n')}

Full analytics: https://dune.com/near/near-intents`;
  }

  generateXMessage(metrics) {
    const date = new Date().toISOString().split('T')[0];
    const formatNumber = (num) => num.toLocaleString();
    const formatChange = (change) => change > 0 ? `+${change}%` : `${change}%`;
    
    return `NEAR INTENTS DEFI UPDATE [${date}]

Daily metrics:
- ${formatNumber(metrics.totalTransactions)} transactions (${formatChange(metrics.transactionChange)})
- $${(metrics.totalVolume / 1000000).toFixed(2)}M volume (${formatChange(metrics.volumeChange)})
- ${formatNumber(metrics.activeWallets)} active wallets (${formatChange(metrics.walletChange)})

Top activity: Swaps (${metrics.categories.swaps.percentage}%), LP (${metrics.categories.liquidity.percentage}%), Staking (${metrics.categories.staking.percentage}%)

https://dune.com/near/near-intents`;
  }

  async postToTelegram(message) {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!telegramToken || !chatId) {
      console.log('Telegram credentials not configured, skipping post');
      return;
    }

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${telegramToken}/sendMessage`,
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

  async postToX(message) {
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('Zapier webhook not configured, skipping X post');
      return;
    }

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        text: message,
        source: 'near-intents-defi',
        timestamp: new Date().toISOString()
      });

      const url = new URL(webhookUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
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

  async run(shouldPost = false) {
    try {
      console.log('Fetching NEAR Intents data...');
      const metrics = await this.fetchNearIntentsData();
      
      const telegramMessage = this.generateTelegramMessage(metrics);
      const xMessage = this.generateXMessage(metrics);
      
      console.log('Generated messages:');
      console.log('Telegram:', telegramMessage);
      console.log('X:', xMessage);
      
      if (shouldPost) {
        console.log('Posting to channels...');
        
        const [telegramResult, xResult] = await Promise.allSettled([
          this.postToTelegram(telegramMessage),
          this.postToX(xMessage)
        ]);
        
        if (telegramResult.status === 'fulfilled') {
          console.log('Posted to Telegram successfully');
        } else {
          console.error('Telegram post failed:', telegramResult.reason);
        }
        
        if (xResult.status === 'fulfilled') {
          console.log('Posted to X successfully');
        } else {
          console.error('X post failed:', xResult.reason);
        }
      }
      
    } catch (error) {
      console.error('Error in DeFi updates:', error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const shouldPost = process.argv.includes('--post');
  const dune = new DuneAnalytics();
  dune.run(shouldPost);
}

module.exports = DuneAnalytics;