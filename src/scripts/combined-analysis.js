/**
 * Combined DeFi + GitHub Analysis
 * Real data from GitHub API and Dune Analytics
 */

const https = require('https');

class CombinedAnalysis {
  constructor() {
    this.githubToken = process.env.DEV_TOKEN_GIT;
    this.duneApiKey = process.env.DUNE_ANALYTICS;
    
    // AI x Crypto projects to track
    this.projects = [
      {
        name: 'NEAR Protocol',
        symbol: 'NEAR',
        github: 'near/nearcore',
        duneQuery: '3655847', // NEAR Intents query
        tvlThreshold: 5, // Min 5% change to report
        commitThreshold: 5 // Min 5 commits/24h to report
      },
      {
        name: 'Internet Computer',
        symbol: 'ICP', 
        github: 'dfinity/ic',
        duneQuery: null, // Add ICP specific query if available
        tvlThreshold: 5,
        commitThreshold: 3
      },
      {
        name: 'Bittensor',
        symbol: 'TAO',
        github: 'opentensor/bittensor', 
        duneQuery: null,
        tvlThreshold: 5,
        commitThreshold: 3
      }
    ];
  }

  async fetchGitHubData(repo) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const since = yesterday.toISOString();

    try {
      // Get commits from last 24h
      const commits = await this.githubRequest(`/repos/${repo}/commits?since=${since}&per_page=100`);
      
      // Get recent PRs
      const prs = await this.githubRequest(`/repos/${repo}/pulls?state=closed&sort=updated&per_page=20`);
      const recentPRs = prs.filter(pr => {
        if (!pr.merged_at) return false;
        const mergedDate = new Date(pr.merged_at);
        return mergedDate > yesterday;
      });

      // Get repo stats
      const repoData = await this.githubRequest(`/repos/${repo}`);

      return {
        commits24h: commits.length,
        prs24h: recentPRs.length,
        stars: repoData.stargazers_count,
        openIssues: repoData.open_issues_count,
        recentCommits: commits.slice(0, 3).map(c => ({
          message: c.commit.message.split('\n')[0],
          sha: c.sha.substring(0, 7),
          url: c.html_url
        }))
      };
    } catch (error) {
      console.error(`GitHub error for ${repo}:`, error.message);
      return null;
    }
  }

  async fetchDuneData(queryId) {
    if (!queryId) return null;

    try {
      const data = await this.duneRequest(`/query/${queryId}/results`);
      
      // Parse NEAR Intents data (adjust based on actual query structure)
      if (data.result && data.result.rows) {
        const latest = data.result.rows[0];
        return {
          transactions24h: latest.transaction_count || 0,
          volume24h: latest.volume_usd || 0,
          activeWallets: latest.active_wallets || 0,
          tvlChange: latest.tvl_change_pct || 0
        };
      }
      return null;
    } catch (error) {
      console.error(`Dune error for query ${queryId}:`, error.message);
      return null;
    }
  }

  async githubRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: endpoint,
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'UserOwned-AI/1.0'
        }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`GitHub API error: ${res.statusCode}`));
            return;
          }
          resolve(JSON.parse(data));
        });
      }).on('error', reject);
    });
  }

  async duneRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.dune.com',
        path: `/api/v1${endpoint}`,
        headers: {
          'X-Dune-API-Key': this.duneApiKey,
          'User-Agent': 'UserOwned-AI/1.0'
        }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Dune API error: ${res.statusCode}`));
            return;
          }
          resolve(JSON.parse(data));
        });
      }).on('error', reject);
    });
  }

  async analyzeProjects() {
    const results = [];
    
    for (const project of this.projects) {
      console.log(`Analyzing ${project.name}...`);
      
      const [githubData, duneData] = await Promise.all([
        this.fetchGitHubData(project.github),
        this.fetchDuneData(project.duneQuery)
      ]);

      if (!githubData) {
        console.log(`No GitHub data for ${project.name}`);
        continue;
      }

      // Only include if meets activity thresholds
      const meetsGithubThreshold = githubData.commits24h >= project.commitThreshold;
      const meetsDuneThreshold = duneData && Math.abs(duneData.tvlChange) >= project.tvlThreshold;

      if (meetsGithubThreshold || meetsDuneThreshold) {
        results.push({
          project,
          github: githubData,
          dune: duneData,
          qualifies: meetsGithubThreshold && meetsDuneThreshold
        });
      }
    }

    return results.filter(r => r.qualifies || r.github.commits24h >= 5);
  }

  generateTelegramMessage(results) {
    if (results.length === 0) return null;

    const date = new Date().toISOString().split('T')[0];
    const topProject = results[0];

    let message = `AI x CRYPTO CONVERGENCE ANALYSIS [${date}]\n\n`;
    message += `Projects with significant DeFi + development activity:\n\n`;

    for (const result of results.slice(0, 3)) {
      const { project, github, dune } = result;
      
      message += `**${project.name} Analysis:**\n`;
      
      if (dune) {
        message += `DeFi Activity:\n`;
        message += `- Transactions: ${dune.transactions24h.toLocaleString()} (24h)\n`;
        message += `- Volume: $${(dune.volume24h / 1000000).toFixed(2)}M\n`;
        message += `- TVL Change: ${dune.tvlChange > 0 ? '+' : ''}${dune.tvlChange.toFixed(1)}%\n\n`;
      }

      message += `Development Activity:\n`;
      message += `- Commits: ${github.commits24h} (24h)\n`;
      message += `- PRs merged: ${github.prs24h}\n`;
      message += `- Repository: [${project.github}](https://github.com/${project.github})\n`;
      
      if (github.recentCommits.length > 0) {
        message += `- Recent: ${github.recentCommits[0].message}\n`;
      }
      message += '\n';
    }

    message += `Analysis: Real-time data from GitHub API + Dune Analytics\n`;
    message += `Tracking: ${this.projects.length} AI x crypto ecosystems`;

    return message;
  }

  generateXMessage(results) {
    if (results.length === 0) return null;

    const date = new Date().toISOString().split('T')[0];
    const topProject = results[0];

    let message = `AI x CRYPTO CONVERGENCE ANALYSIS [${date}]\n\n`;
    message += `Active projects (24h):\n\n`;

    for (const result of results.slice(0, 2)) {
      const { project, github, dune } = result;
      
      message += `${project.symbol}:\n`;
      if (dune) {
        message += `- ${dune.transactions24h.toLocaleString()} txns, $${(dune.volume24h / 1000000).toFixed(1)}M vol\n`;
      }
      message += `- ${github.commits24h} commits, ${github.prs24h} PRs\n\n`;
    }

    message += `https://github.com/${topProject.project.github}`;

    return message;
  }

  async postToTelegram(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId || !message) return;

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
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
    if (!webhookUrl || !message) return;

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        text: message,
        source: 'combined-analysis',
        timestamp: new Date().toISOString()
      });

      const url = new URL(webhookUrl);
      const options = {
        hostname: url.hostname,
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
      console.log('Starting combined analysis with real data...');
      
      const results = await this.analyzeProjects();
      
      if (results.length === 0) {
        console.log('No projects meet activity thresholds today');
        return;
      }

      const telegramMessage = this.generateTelegramMessage(results);
      const xMessage = this.generateXMessage(results);

      console.log('Generated analysis:', { projectCount: results.length });

      if (shouldPost && telegramMessage && xMessage) {
        const [tgResult, xResult] = await Promise.allSettled([
          this.postToTelegram(telegramMessage),
          this.postToX(xMessage)
        ]);

        console.log('Posted:', {
          telegram: tgResult.status === 'fulfilled',
          x: xResult.status === 'fulfilled'
        });
      }

    } catch (error) {
      console.error('Combined analysis error:', error);
    }
  }
}

if (require.main === module) {
  const shouldPost = process.argv.includes('--post');
  const analysis = new CombinedAnalysis();
  analysis.run(shouldPost);
}

module.exports = CombinedAnalysis;