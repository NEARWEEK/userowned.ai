const { logger } = require('../utils');

/**
 * Buffer Zapier Data Collector
 * Fetches follower data and post URLs via Buffer Zapier MCP instead of native X API
 */
class BufferZapierCollector {
  constructor() {
    this.mcpIntegrations = require('../mcp-integrations');
    this.zapierWebhookUrl = process.env.ZAPIER_BUFFER_WEBHOOK_URL;
    this.bufferOrgId = process.env.BUFFER_ORG_ID || 'NEARWEEK';
  }

  /**
   * Fetch follower data for specific accounts via Buffer Zapier
   * @param {Array} accounts - Array of account handles to monitor
   * @returns {Object} Follower data with metrics
   */
  async fetchFollowerData(accounts = []) {
    try {
      logger.info('Fetching follower data via Buffer Zapier MCP', { accounts });

      const followerData = {
        timestamp: new Date().toISOString(),
        accounts: {},
        totalFollowers: 0,
        engagementRate: 0,
        growthMetrics: {}
      };

      for (const account of accounts) {
        const accountData = await this.getAccountMetrics(account);
        followerData.accounts[account] = accountData;
        followerData.totalFollowers += accountData.followerCount || 0;
      }

      // Calculate engagement rate
      followerData.engagementRate = this.calculateEngagementRate(followerData.accounts);

      logger.info('Successfully fetched follower data', { 
        totalAccounts: accounts.length,
        totalFollowers: followerData.totalFollowers 
      });

      return followerData;

    } catch (error) {
      logger.error('Error fetching follower data via Buffer Zapier', { error: error.message });
      throw error;
    }
  }

  /**
   * Get metrics for a specific account via Buffer API
   * @param {string} account - Account handle
   * @returns {Object} Account metrics
   */
  async getAccountMetrics(account) {
    try {
      // Prepare data for Buffer Zapier webhook
      const webhookPayload = {
        action: 'fetch_account_metrics',
        account: account,
        organizationId: this.bufferOrgId,
        metrics: ['followers', 'following', 'posts', 'engagement'],
        timestamp: new Date().toISOString()
      };

      // Send request via MCP webhook integration
      const response = await this.mcpIntegrations.sendWebhook(
        this.zapierWebhookUrl,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-UserOwned-Source': 'buffer-zapier-collector'
          }
        }
      );

      // Parse response (would come from Zapier webhook response)
      return this.parseAccountMetrics(response, account);

    } catch (error) {
      logger.error('Error fetching account metrics', { account, error: error.message });
      return {
        account,
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        engagementRate: 0,
        lastActive: null,
        error: error.message
      };
    }
  }

  /**
   * Parse account metrics from Buffer API response
   * @param {Object} response - API response
   * @param {string} account - Account handle
   * @returns {Object} Parsed metrics
   */
  parseAccountMetrics(response, account) {
    return {
      account,
      followerCount: response.data?.followers || 0,
      followingCount: response.data?.following || 0,
      postCount: response.data?.posts || 0,
      engagementRate: response.data?.engagement_rate || 0,
      lastActive: response.data?.last_active || null,
      profileUrl: `https://x.com/${account}`,
      verified: response.data?.verified || false,
      bio: response.data?.bio || '',
      location: response.data?.location || ''
    };
  }

  /**
   * Fetch post URLs and metadata via Buffer
   * @param {Array} accounts - Accounts to fetch posts from
   * @param {number} limit - Number of recent posts per account
   * @returns {Array} Array of post data with URLs
   */
  async fetchPostData(accounts = [], limit = 10) {
    try {
      logger.info('Fetching post data via Buffer Zapier', { accounts, limit });

      const allPosts = [];

      for (const account of accounts) {
        const posts = await this.getAccountPosts(account, limit);
        allPosts.push(...posts);
      }

      // Sort by engagement and recency
      allPosts.sort((a, b) => {
        const engagementA = (a.likes || 0) + (a.retweets || 0) + (a.replies || 0);
        const engagementB = (b.likes || 0) + (b.retweets || 0) + (b.replies || 0);
        return engagementB - engagementA;
      });

      logger.info('Successfully fetched post data', { totalPosts: allPosts.length });
      return allPosts;

    } catch (error) {
      logger.error('Error fetching post data', { error: error.message });
      throw error;
    }
  }

  /**
   * Get recent posts for a specific account
   * @param {string} account - Account handle
   * @param {number} limit - Number of posts to fetch
   * @returns {Array} Array of post objects
   */
  async getAccountPosts(account, limit = 10) {
    try {
      const webhookPayload = {
        action: 'fetch_account_posts',
        account: account,
        limit: limit,
        organizationId: this.bufferOrgId,
        include_metrics: true,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpIntegrations.sendWebhook(
        this.zapierWebhookUrl,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-UserOwned-Source': 'buffer-zapier-collector'
          }
        }
      );

      return this.parsePostData(response, account);

    } catch (error) {
      logger.error('Error fetching posts for account', { account, error: error.message });
      return [];
    }
  }

  /**
   * Parse post data from Buffer API response
   * @param {Object} response - API response
   * @param {string} account - Account handle
   * @returns {Array} Parsed post data
   */
  parsePostData(response, account) {
    const posts = response.data?.posts || [];
    
    return posts.map(post => ({
      id: post.id,
      account: account,
      text: post.text || '',
      url: post.url || `https://x.com/${account}/status/${post.id}`,
      createdAt: post.created_at || new Date().toISOString(),
      likes: post.likes || 0,
      retweets: post.retweets || 0,
      replies: post.replies || 0,
      engagement: (post.likes || 0) + (post.retweets || 0) + (post.replies || 0),
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      mediaUrls: post.media_urls || [],
      isRetweet: post.is_retweet || false,
      language: post.language || 'en'
    }));
  }

  /**
   * Calculate overall engagement rate from account data
   * @param {Object} accounts - Account data object
   * @returns {number} Average engagement rate
   */
  calculateEngagementRate(accounts) {
    const rates = Object.values(accounts)
      .map(account => account.engagementRate || 0)
      .filter(rate => rate > 0);
    
    return rates.length > 0 ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
  }

  /**
   * Get monitored accounts from UserOwned.ai following list
   * @returns {Array} Array of account handles
   */
  getMonitoredAccounts() {
    return [
      'userownedai',
      'NEARWEEK', 
      'NEARProtocol',
      'dfinity',
      'bittensor_',
      'graphprotocol',
      'InjectiveLabs',
      'Fetch_ai',
      'akashnet_',
      'rendernetwork',
      'AIxCryptoNews',
      'DeepChainAI',
      'SingularityNET'
    ];
  }

  /**
   * Run full data collection cycle
   * @returns {Object} Complete dataset
   */
  async collectAllData() {
    try {
      logger.info('Starting full Buffer Zapier data collection cycle');

      const accounts = this.getMonitoredAccounts();
      
      const [followerData, postData] = await Promise.all([
        this.fetchFollowerData(accounts),
        this.fetchPostData(accounts, 5)
      ]);

      const result = {
        timestamp: new Date().toISOString(),
        source: 'buffer-zapier-mcp',
        followerData,
        postData,
        summary: {
          totalAccounts: accounts.length,
          totalFollowers: followerData.totalFollowers,
          totalPosts: postData.length,
          avgEngagement: followerData.engagementRate
        }
      };

      logger.info('Buffer Zapier data collection completed', result.summary);
      return result;

    } catch (error) {
      logger.error('Error in Buffer Zapier data collection', { error: error.message });
      throw error;
    }
  }
}

module.exports = BufferZapierCollector;