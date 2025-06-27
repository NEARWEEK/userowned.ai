/**
 * Enhanced GitHub Data Collector
 * Robust GitHub API integration with accurate data collection
 */

const https = require('https');

class EnhancedGitHubCollector {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.headers = {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'User-Agent': 'UserOwned-AI-Intelligence/2.0',
      'Accept': 'application/vnd.github.v3+json'
    };
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Collect GitHub updates for all tracked repositories
   */
  async collectDailyUpdates(repositories) {
    const allUpdates = [];
    const since = this.getYesterday(); // Get updates from last 24 hours
    
    console.log(`🔍 Collecting GitHub updates since ${since}`);
    
    for (const repo of repositories) {
      try {
        console.log(`   Processing ${repo.name}...`);
        
        const [releases, pullRequests, commits] = await Promise.all([
          this.getRecentReleases(repo.repo, since),
          this.getRecentPullRequests(repo.repo, since),
          this.getRecentCommits(repo.repo, since)
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
        console.error(`Error collecting updates for ${repo.name}: ${error.message}`);
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
    
    console.log(`✅ Collected ${allUpdates.length} total updates`);
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
      console.warn(`No releases found for ${repo}: ${error.message}`);
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
      console.warn(`No pull requests found for ${repo}: ${error.message}`);
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
      console.warn(`No commits found for ${repo}: ${error.message}`);
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
   * Enhanced HTTP request with better error handling
   */
  async makeRequest(endpoint) {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      const options = {
        headers: this.headers,
        timeout: 15000
      };

      https.get(url, options, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
          try {
            if (res.statusCode >= 400) {
              reject(new Error(`GitHub API error: ${res.statusCode} ${res.statusMessage}`));
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
            reject(new Error(`JSON parse error: ${error.message}`));
          }
        });
      }).on('error', reject).on('timeout', () => {
        reject(new Error('Request timeout'));
      });
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
      const response = await this.makeRequest('/rate_limit');
      console.log(`🔑 GitHub API setup validated`);
      console.log(`   Rate limit: ${response.rate.remaining}/${response.rate.limit}`);
      console.log(`   Resets at: ${new Date(response.rate.reset * 1000).toISOString()}`);
      return true;
    } catch (error) {
      console.error(`❌ GitHub API setup failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = EnhancedGitHubCollector;