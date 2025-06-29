const https = require('https');
const { createLogger } = require('../src/utils/logger');
const { handleError } = require('../src/utils/error-handler');

const logger = createLogger('mailchimp-connector');

class MailchimpConnector {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.MAILCHIMP_API_KEY;
    this.server = config.server || process.env.MAILCHIMP_SERVER || 'us21';
    this.listId = config.listId || process.env.MAILCHIMP_LIST_ID;
    
    if (!this.apiKey) {
      throw new Error('Mailchimp API key is required');
    }
    
    this.baseUrl = `https://${this.server}.api.mailchimp.com/3.0`;
  }

  async makeRequest(endpoint, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`Mailchimp API error: ${parsedData.detail || res.statusCode}`));
            } else {
              resolve(parsedData);
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async getCampaigns(count = 10, status = 'sent') {
    try {
      const endpoint = `/campaigns?count=${count}&status=${status}&sort_field=send_time&sort_dir=DESC`;
      const response = await this.makeRequest(endpoint);
      return response.campaigns || [];
    } catch (error) {
      logger.error('Failed to fetch campaigns', error);
      throw error;
    }
  }

  async getCampaignReport(campaignId) {
    try {
      const endpoint = `/reports/${campaignId}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      logger.error(`Failed to fetch report for campaign ${campaignId}`, error);
      throw error;
    }
  }

  async getListStats() {
    try {
      const endpoint = `/lists/${this.listId}`;
      const response = await this.makeRequest(endpoint);
      return response.stats || {};
    } catch (error) {
      logger.error('Failed to fetch list stats', error);
      throw error;
    }
  }

  async getWeeklyAnalytics() {
    try {
      logger.info('Fetching weekly analytics from Mailchimp');
      
      // Get campaigns from the last 7 days
      const campaigns = await this.getCampaigns(20, 'sent');
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyCampaigns = campaigns.filter(campaign => {
        const sendTime = new Date(campaign.send_time);
        return sendTime >= oneWeekAgo;
      });

      // Get detailed reports for each campaign
      const reports = await Promise.all(
        weeklyCampaigns.map(campaign => this.getCampaignReport(campaign.id))
      );

      // Get overall list stats
      const listStats = await this.getListStats();

      // Calculate aggregate metrics
      const aggregateMetrics = {
        totalCampaigns: reports.length,
        totalSent: reports.reduce((sum, r) => sum + (r.emails_sent || 0), 0),
        avgOpenRate: reports.length > 0 
          ? reports.reduce((sum, r) => sum + (r.opens.open_rate || 0), 0) / reports.length 
          : 0,
        avgClickRate: reports.length > 0
          ? reports.reduce((sum, r) => sum + (r.clicks.click_rate || 0), 0) / reports.length
          : 0,
        totalClicks: reports.reduce((sum, r) => sum + (r.clicks.clicks_total || 0), 0),
        totalOpens: reports.reduce((sum, r) => sum + (r.opens.opens_total || 0), 0),
        totalUnsubscribes: reports.reduce((sum, r) => sum + (r.unsubscribed || 0), 0)
      };

      return {
        period: {
          start: oneWeekAgo.toISOString(),
          end: new Date().toISOString()
        },
        campaigns: weeklyCampaigns.map((campaign, index) => ({
          id: campaign.id,
          subject: campaign.settings.subject_line,
          sendTime: campaign.send_time,
          report: reports[index]
        })),
        aggregateMetrics,
        listStats,
        subscriberGrowth: {
          current: listStats.member_count || 0,
          avgSubRate: listStats.avg_sub_rate || 0,
          avgUnsubRate: listStats.avg_unsub_rate || 0
        }
      };
    } catch (error) {
      logger.error('Failed to generate weekly analytics', error);
      throw error;
    }
  }
}

module.exports = MailchimpConnector;