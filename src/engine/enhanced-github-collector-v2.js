/**
 * Enhanced GitHub Data Collector v2
 * Improved version with robust error handling, logging, and rate limiting
 */

const https = require('https');
const { 
  logger, 
  errorHandler, 
  validation, 
  rateLimiter, 
  config 
} = require('../utils');

class EnhancedGitHubCollector {
  constructor() {
    const appConfig = config.getConfig();
    this.baseUrl = 'https://api.github.com';
    this.headers = {
      'Authorization': `token ${process.env.GITHUB_TOKEN || process.env.DEV_TOKEN_GIT || appConfig.apis?.github?.token}`,
      'User-Agent': 'UserOwned-AI-Intelligence/2.0',
      'Accept': 'application/vnd.github.v3+json'
    };
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    
    // Set up rate limiter
    this.rateLimiter = rateLimiter.createRateLimiter({
      maxRequests: 30,
      timeWindowMs: 60 * 1000, // 1 minute
      name: 'github-api'
    });
    
    // Set up circuit breaker
    this.circuitBreaker = errorHandler.createCircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000 // 30 seconds
    });
  }

  /**
   * Collect GitHub updates for all tracked repositories
   */
  async collectDailyUpdates(repositories) {
    const allUpdates = [];
    const since = this.getYesterday(); // Get updates from last 24 hours
    
    logger.info(`Collecting GitHub updates since ${since}`, { repositoryCount: repositories.length });
    
    for (const repo of repositories) {
      try {
        // Validate repo format
        const validationResult = validation.validateGitHubRepo(repo.repo);
        if (!validationResult.valid) {
          logger.warn(`Invalid repository format`, { repo: repo.repo, error: validationResult.error });
          continue;
        }
        
        logger.debug(`Processing repository`, { name: repo.name, repo: repo.repo });
        
        // Use error handler with retry logic
        const [releases, pullRequests, commits] = await Promise.all([
          errorHandler.withRetry(
            () => this.getRecentReleases(repo.repo, since),
            { retries: 3, delay: 1000, context: { repo: repo.repo, dataType: 'releases' } }
          ),
          errorHandler.withRetry(
            () => this.getRecentPullRequests(repo.repo, since),
            { retries: 3, delay: 1000, context: { repo: repo.repo, dataType: 'pull requests' } }
          ),
          errorHandler.withRetry(
            () => this.getRecentCommits(repo.repo, since),
            { retries: 3, delay: 1000, context: { repo: repo.repo, dataType: 'commits' } }
          )
        ]);
        
        // Add releases
        releases.forEach(release => {
          allUpdates.push({
            type: 'release',
            repo: repo.repo,
            title: release.name || release.tag_name,
            tag_name: release.tag_name,
            url: release.html_url,
            published_at: release.published_at,
            changes: this.parseReleaseNotes(release.body),
            priority: 10 // Releases have highest priority
          });
        });
        
        // Add merged pull requests
        pullRequests.forEach(pr => {
          allUpdates.push({
            type: 'pull_request',
            repo: repo.repo,
            title: pr.title,
            number: pr.number,
            url: pr.html_url,
            merged_at: pr.merged_at,
            priority: this.calculatePRPriority(pr)
          });
        });
        
        // Add significant commits
        commits.forEach(commit => {
          allUpdates.push({
            type: 'commit',
            repo: repo.repo,
            title: commit.commit.message.split('\n')[0], // First line only
            sha: commit.sha,
            url: commit.html_url,
            date: commit.commit.author.date,
            priority: this.calculateCommitPriority(commit.commit.message)
          });
        });
        
        // Rate limiting
        await this.delay(100);
        
      } catch (error) {
        logger.error(`Error collecting updates`, { 
          repo: repo.name, 
          error: error.message,
          stack: error.stack
        });
        // Continue with other repos even if one fails
      }
    }
    
    // Sort by priority (highest first) and timestamp (newest first)
    allUpdates.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      const aTime = new Date(a.published_at || a.merged_at || a.date);
      const bTime = new Date(b.published_at || b.merged_at || b.date);
      return bTime - aTime;
    });
    
    logger.info(`Collection completed`, { updateCount: allUpdates.length });
    return allUpdates;
  }

  /**
   * Get recent releases from repository
   */
  async getRecentReleases(repo, since) {
    try {
      const releases = await this.makeRequest(`/repos/${repo}/releases?per_page=10`);
      return releases.filter(release => {
        const publishedDate = new Date(release.published_at);
        const sinceDate = new Date(since);
        return publishedDate > sinceDate;
      });
    } catch (error) {
      logger.warn(`No releases found`, { repo, error: error.message });
      return [];
    }
  }

  /**
   * Get recent merged pull requests
   */
  async getRecentPullRequests(repo, since) {
    try {
      // Get recently closed PRs
      const prs = await this.makeRequest(
        `/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=50`
      );
      
      // Filter for merged PRs within timeframe
      return prs.filter(pr => {
        if (!pr.merged_at) return false;
        const mergedDate = new Date(pr.merged_at);
        const sinceDate = new Date(since);
        return mergedDate > sinceDate;
      }).slice(0, 10); // Limit to 10 most recent
    } catch (error) {
      logger.warn(`No pull requests found`, { repo, error: error.message });
      return [];
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(repo, since) {
    try {
      const commits = await this.makeRequest(
        `/repos/${repo}/commits?since=${since}&per_page=30`
      );
      
      // Filter for significant commits (not merge commits, not minor fixes)
      return commits.filter(commit => {
        const message = commit.commit.message.toLowerCase();
        // Skip merge commits
        if (message.startsWith('merge')) return false;
        // Skip very minor commits
        if (message.includes('typo') || message.includes('formatting')) return false;
        return true;
      }).slice(0, 5); // Limit to 5 most recent significant commits
    } catch (error) {
      logger.warn(`No commits found`, { repo, error: error.message });
      return [];
    }
  }

  /**
   * Calculate priority for pull requests
   */
  calculatePRPriority(pr) {
    const title = pr.title.toLowerCase();
    const highPriorityKeywords = ['fix', 'security', 'critical', 'hotfix', 'vulnerability'];
    const mediumPriorityKeywords = ['add', 'implement', 'feature', 'enhance', 'improve', 'update'];
    
    if (highPriorityKeywords.some(keyword => title.includes(keyword))) {
      return 8;
    } else if (mediumPriorityKeywords.some(keyword => title.includes(keyword))) {
      return 6;
    }
    return 4;
  }

  /**
   * Calculate priority for commits
   */
  calculateCommitPriority(message) {
    const msgLower = message.toLowerCase();
    const highPriorityKeywords = ['implement', 'add', 'fix', 'security', 'optimize'];
    const mediumPriorityKeywords = ['update', 'improve', 'enhance', 'refactor'];
    
    if (highPriorityKeywords.some(keyword => msgLower.includes(keyword))) {
      return 5;
    } else if (mediumPriorityKeywords.some(keyword => msgLower.includes(keyword))) {
      return 3;
    }
    return 2;
  }

  /**
   * Parse release notes to extract key changes
   */
  parseReleaseNotes(body) {
    if (!body) return [];
    
    const lines = body.split('\n');
    const changes = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for bullet points or numbered lists
      if (trimmed.match(/^[\*\-\+]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const change = trimmed.replace(/^[\*\-\+\d\.\s]+/, '').trim();
        if (change.length > 10 && change.length < 100) {
          changes.push(change);
        }
      }
    }
    
    return changes.slice(0, 5); // Limit to 5 key changes
  }

  /**
   * Enhanced HTTP request with better error handling and rate limiting
   */
  async makeRequest(endpoint) {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      logger.debug(`Using cached data`, { endpoint });
      return cached.data;
    }
    
    // Respect rate limits
    await this.rateLimiter.acquire();
    
    // Use circuit breaker to prevent repeated failures
    return this.circuitBreaker.execute(async () => {
      return new Promise((resolve, reject) => {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
          headers: this.headers,
          timeout: 15000
        };
        
        logger.debug(`Making GitHub API request`, { url });

        https.get(url, options, (res) => {
          let data = '';
          
          res.on('data', chunk => data += chunk);
          
          res.on('end', () => {
            try {
              if (res.statusCode >= 400) {
                const error = new Error(`GitHub API error: ${res.statusCode} ${res.statusMessage}`);
                logger.error(`GitHub API request failed`, { 
                  statusCode: res.statusCode, 
                  url, 
                  response: data.substring(0, 500) // Log only first 500 chars
                });
                reject(error);
                return;
              }
              
              const parsed = JSON.parse(data);
              
              // Cache successful responses
              this.cache.set(cacheKey, {
                data: parsed,
                timestamp: Date.now()
              });
              
              resolve(parsed);
            } catch (error) {
              logger.error(`JSON parse error`, { error: error.message, data: data.substring(0, 500) });
              reject(new Error(`JSON parse error: ${error.message}`));
            }
          });
        }).on('error', (error) => {
          logger.error(`Request error`, { error: error.message, url });
          reject(error);
        }).on('timeout', () => {
          logger.error(`Request timeout`, { url });
          reject(new Error('Request timeout'));
        });
      });
    }, () => {
      // Fallback when circuit is open
      logger.warn(`Circuit breaker open, returning empty result`, { endpoint });
      return [];
    });
  }

  /**
   * Get yesterday's date in ISO format
   */
  getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate GitHub token and rate limits
   */
  async validateSetup() {
    try {
      logger.info(`Validating GitHub API setup`);
      
      const response = await errorHandler.withRetry(
        () => this.makeRequest('/rate_limit'),
        { retries: 2, delay: 1000 }
      );
      
      logger.info(`GitHub API setup validated`, { 
        rateLimit: `${response.rate.remaining}/${response.rate.limit}`,
        resetAt: new Date(response.rate.reset * 1000).toISOString()
      });
      
      return true;
    } catch (error) {
      logger.error(`GitHub API setup failed`, { error: error.message, stack: error.stack });
      return false;
    }
  }
}

module.exports = EnhancedGitHubCollector;