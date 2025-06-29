const MailchimpConnector = require('../../connectors/mailchimp-connector');
const { createLogger } = require('../utils/logger');
const { formatPercentage, formatNumber } = require('../utils/formatters');

const logger = createLogger('mailchimp-weekly-analytics');

const mailchimpWeeklyAnalytics = {
  name: 'Mailchimp Weekly Analytics',
  type: 'mailchimp-weekly-analytics',
  channels: ['telegram'],
  
  async generate(options = {}) {
    try {
      const connector = new MailchimpConnector();
      const analytics = await connector.getWeeklyAnalytics();
      
      logger.info('Generated Mailchimp weekly analytics', {
        campaigns: analytics.campaigns.length,
        totalSent: analytics.aggregateMetrics.totalSent
      });
      
      return analytics;
    } catch (error) {
      logger.error('Failed to generate Mailchimp analytics', error);
      throw error;
    }
  },

  async generateTelegram(data) {
    const { aggregateMetrics, campaigns, subscriberGrowth, period } = data;
    
    // Format dates
    const startDate = new Date(period.start).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endDate = new Date(period.end).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    let content = `📊 <b>MAILCHIMP WEEKLY ANALYTICS</b>\n`;
    content += `<i>${startDate} - ${endDate}</i>\n\n`;
    
    // Summary metrics
    content += `<b>📧 Weekly Performance</b>\n`;
    content += `• Campaigns sent: ${aggregateMetrics.totalCampaigns}\n`;
    content += `• Total emails: ${formatNumber(aggregateMetrics.totalSent)}\n`;
    content += `• Avg open rate: ${formatPercentage(aggregateMetrics.avgOpenRate)}\n`;
    content += `• Avg click rate: ${formatPercentage(aggregateMetrics.avgClickRate)}\n`;
    content += `• Total opens: ${formatNumber(aggregateMetrics.totalOpens)}\n`;
    content += `• Total clicks: ${formatNumber(aggregateMetrics.totalClicks)}\n\n`;
    
    // Subscriber growth
    content += `<b>👥 Subscriber Growth</b>\n`;
    content += `• Total subscribers: ${formatNumber(subscriberGrowth.current)}\n`;
    content += `• Avg sub rate: ${subscriberGrowth.avgSubRate}/month\n`;
    content += `• Avg unsub rate: ${subscriberGrowth.avgUnsubRate}/month\n`;
    content += `• Unsubscribes this week: ${aggregateMetrics.totalUnsubscribes}\n\n`;
    
    // Top performing campaigns
    if (campaigns.length > 0) {
      content += `<b>🏆 Top Campaigns</b>\n`;
      
      // Sort by open rate
      const topCampaigns = campaigns
        .sort((a, b) => (b.report.opens.open_rate || 0) - (a.report.opens.open_rate || 0))
        .slice(0, 3);
      
      topCampaigns.forEach((campaign, index) => {
        const emoji = ['🥇', '🥈', '🥉'][index];
        content += `${emoji} ${campaign.subject}\n`;
        content += `   Open: ${formatPercentage(campaign.report.opens.open_rate)} | `;
        content += `Click: ${formatPercentage(campaign.report.clicks.click_rate)}\n`;
      });
      
      content += '\n';
    }
    
    // Key insights
    content += `<b>💡 Key Insights</b>\n`;
    
    // Performance trends
    if (aggregateMetrics.avgOpenRate > 0.25) {
      content += `✅ Strong engagement with ${formatPercentage(aggregateMetrics.avgOpenRate)} open rate\n`;
    } else if (aggregateMetrics.avgOpenRate < 0.15) {
      content += `⚠️ Low engagement - consider subject line optimization\n`;
    }
    
    if (aggregateMetrics.avgClickRate > 0.05) {
      content += `✅ Good click-through performance\n`;
    } else if (aggregateMetrics.avgClickRate < 0.02) {
      content += `⚠️ Low CTR - review content relevance\n`;
    }
    
    if (aggregateMetrics.totalUnsubscribes > subscriberGrowth.current * 0.01) {
      content += `⚠️ High unsubscribe rate this week\n`;
    }
    
    content += `\n🔗 <a href="https://userowned.ai">UserOwned.AI</a> | @ai_x_crypto`;
    
    return {
      content,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };
  },

  // Not needed for X/Twitter or GitHub Issues for this template
  async generateX() {
    return null;
  },

  async generateGithubIssue() {
    return null;
  }
};

module.exports = mailchimpWeeklyAnalytics;