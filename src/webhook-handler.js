// NEARWEEK Webhook Handler
const MCPIntegrations = require('./mcp-integrations');

class WebhookHandler {
  constructor() {
    this.processedTweets = new Set();
    this.metrics = {
      tweets_processed: 0,
      posts_created: 0,
      errors: 0,
      start_time: Date.now()
    };
  }

  async processWebhook(tweetData, testEndpoints) {
    try {
      // Check if system is paused
      if (testEndpoints && testEndpoints.isPaused()) {
        return { 
          status: 'ignored', 
          reason: 'system_paused',
          timestamp: new Date().toISOString()
        };
      }

      // Prevent duplicate processing
      if (this.processedTweets.has(tweetData.id)) {
        return { 
          status: 'ignored', 
          reason: 'already_processed',
          tweet_id: tweetData.id
        };
      }

      console.log(`📨 Processing webhook: ${tweetData.id}`);
      
      // Analyze content (simulate Claude analysis)
      const analysis = await this.analyzeContent(tweetData);
      
      // Check if meets threshold
      if (analysis.relevance_score < 60) {
        console.log(`❌ Content filtered: score ${analysis.relevance_score}/100`);
        return {
          status: 'filtered',
          reason: 'low_relevance',
          relevance_score: analysis.relevance_score
        };
      }

      // Check for spam
      if (analysis.is_spam) {
        console.log(`🚨 Spam detected: ${tweetData.text.substring(0, 50)}...`);
        return {
          status: 'filtered_spam',
          relevance_score: analysis.relevance_score
        };
      }

      // Mark as processed
      this.processedTweets.add(tweetData.id);
      this.metrics.tweets_processed++;

      // Determine actions based on priority
      const actions = await this.executeActions(tweetData, analysis);
      
      this.metrics.posts_created++;
      
      console.log(`✅ Tweet processed: ${analysis.relevance_score}/100 (${analysis.priority})`);
      
      return {
        status: 'processed',
        relevance_score: analysis.relevance_score,
        priority: analysis.priority,
        action: 'queued_for_approval',
        estimated_publish_time: '15 minutes',
        actions_taken: actions,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.metrics.errors++;
      console.error('❌ Webhook processing error:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async analyzeContent(tweetData) {
    // Simulate Claude AI content analysis
    const text = tweetData.text || '';
    const textLower = text.toLowerCase();
    
    let relevanceScore = 0;
    
    // Keyword analysis
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm'];
    const cryptoKeywords = ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'near', 'web3', 'defi'];
    const nearKeywords = ['near', 'nearprotocol', 'aurora', 'octopus'];
    
    // Score calculation
    relevanceScore += aiKeywords.filter(k => textLower.includes(k)).length * 20;
    relevanceScore += cryptoKeywords.filter(k => textLower.includes(k)).length * 15;
    relevanceScore += nearKeywords.filter(k => textLower.includes(k)).length * 25;
    
    // Author credibility
    const author = tweetData.author || {};
    if (author.verified) relevanceScore += 15;
    if (author.followers_count > 10000) relevanceScore += 10;
    if (author.followers_count > 100000) relevanceScore += 15;
    
    // Engagement metrics
    const metrics = tweetData.public_metrics || {};
    if (metrics.like_count > 50) relevanceScore += 10;
    if (metrics.retweet_count > 20) relevanceScore += 10;
    if (metrics.reply_count > 10) relevanceScore += 5;
    
    // Breaking news detection
    const breakingKeywords = ['breaking', 'urgent', 'announcement', 'launch', 'breakthrough'];
    const isBreaking = breakingKeywords.some(keyword => textLower.includes(keyword));
    if (isBreaking) relevanceScore += 20;
    
    // Spam detection
    const spamKeywords = ['buy now', 'get rich', 'guaranteed', 'limited time'];
    const isSpam = spamKeywords.some(keyword => textLower.includes(keyword)) || 
                   (text.match(/🚀/g) || []).length > 3;
    
    if (isSpam) relevanceScore = Math.min(relevanceScore, 20);
    
    // Cap at 100
    relevanceScore = Math.min(relevanceScore, 100);
    
    // Determine priority
    let priority = 'low';
    if (relevanceScore >= 90 && isBreaking) priority = 'breaking';
    else if (relevanceScore >= 80) priority = 'high';
    else if (relevanceScore >= 60) priority = 'medium';
    
    return {
      relevance_score: relevanceScore,
      priority,
      is_breaking: isBreaking,
      is_spam: isSpam,
      analysis_time: new Date().toISOString()
    };
  }

  async executeActions(tweetData, analysis) {
    const actions = [];
    
    try {
      // Create Buffer post (always queued for manual approval in safe mode)
      const bufferPost = await this.createBufferPost(tweetData, analysis);
      actions.push({ type: 'buffer_post', status: 'queued', data: bufferPost });
      
      // Send team notification if high priority
      if (analysis.priority === 'high' || analysis.priority === 'breaking') {
        const notification = await this.sendTeamNotification(tweetData, analysis);
        actions.push({ type: 'team_notification', status: 'sent', data: notification });
      }
      
      // Create GitHub issue for tracking
      const issue = await this.createTrackingIssue(tweetData, analysis);
      actions.push({ type: 'github_issue', status: 'created', data: issue });
      
    } catch (error) {
      console.error('Action execution error:', error);
      actions.push({ type: 'error', error: error.message });
    }
    
    return actions;
  }

  async createBufferPost(tweetData, analysis) {
    const content = this.generatePostContent(tweetData, analysis);
    return await MCPIntegrations.postToBuffer(content, {
      method: 'queue', // Always queue for manual approval
      tags: `nearweek,automation,${analysis.priority},score-${analysis.relevance_score}`
    });
  }

  async sendTeamNotification(tweetData, analysis) {
    const message = `🚨 ${analysis.priority.toUpperCase()} PRIORITY CONTENT\n\nScore: ${analysis.relevance_score}/100\nTweet: ${tweetData.text}\nAuthor: @${tweetData.author?.username}\n\n⏰ Action needed: Review queued post`;
    
    return await MCPIntegrations.sendTelegramMessage(message);
  }

  async createTrackingIssue(tweetData, analysis) {
    const title = `[AUTO] ${analysis.priority.toUpperCase()}: ${tweetData.text.substring(0, 50)}...`;
    const body = `**Automated Content Processing**\n\n**Tweet ID**: ${tweetData.id}\n**Relevance Score**: ${analysis.relevance_score}/100\n**Priority**: ${analysis.priority}\n**Author**: @${tweetData.author?.username}\n\n**Content**:\n${tweetData.text}\n\n**Actions Taken**:\n- Queued for Buffer (manual approval)\n- Team notification sent\n\n**Metrics**:\n- Likes: ${tweetData.public_metrics?.like_count || 0}\n- Retweets: ${tweetData.public_metrics?.retweet_count || 0}\n- Replies: ${tweetData.public_metrics?.reply_count || 0}`;
    
    return await MCPIntegrations.createGitHubIssue(title, body, {
      labels: ['automation', analysis.priority, 'content-processing']
    });
  }

  generatePostContent(tweetData, analysis) {
    let content = '';
    
    if (analysis.priority === 'breaking') {
      content = `🚨 BREAKING: `;
    } else if (analysis.priority === 'high') {
      content = `🔥 TRENDING: `;
    }
    
    content += `${tweetData.text}\n\n`;
    
    if (tweetData.author) {
      content += `via @${tweetData.author.username}\n`;
    }
    
    content += `\n#NEARWEEK #AI #Crypto`;
    
    if (analysis.is_breaking) {
      content += ` #Breaking`;
    }
    
    return content;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime_seconds: Math.floor((Date.now() - this.metrics.start_time) / 1000),
      tweets_processed_rate: this.metrics.tweets_processed / Math.max((Date.now() - this.metrics.start_time) / 1000 / 60, 1), // per minute
      error_rate: this.metrics.errors / Math.max(this.metrics.tweets_processed, 1) * 100
    };
  }
}

module.exports = WebhookHandler;