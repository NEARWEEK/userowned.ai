/**
 * Minimal GitHub Updates Template
 * Real data only, concise format, no mock content
 */

const template = {
  name: 'Minimal GitHub Updates',
  type: 'github-updates-minimal',
  schedule: '30 9 * * *', // 10:30 CET
  channels: ['telegram', 'x'],
  
  repositories: [
    { name: 'Bittensor', repo: 'opentensor/bittensor', symbol: 'TAO' },
    { name: 'NEAR', repo: 'near/nearcore', symbol: 'NEAR' },
    { name: 'ICP', repo: 'dfinity/ic', symbol: 'ICP' },
    { name: 'Render', repo: 'RNDR-Inc/rndr-py', symbol: 'RNDR' },
    { name: 'Fetch.ai', repo: 'fetchai/fetchai-ledger', symbol: 'FET' },
    { name: 'Akash', repo: 'akash-network/node', symbol: 'AKT' }
  ],
  
  async generate(data) {
    const { githubUpdates, timestamp } = data;
    
    // Only proceed if we have REAL updates
    if (!githubUpdates || githubUpdates.length === 0) {
      return this.generateNoUpdates(timestamp);
    }
    
    // Take only top 3-4 most significant updates
    const topUpdates = githubUpdates.slice(0, 4);
    
    return {
      telegram: this.generateTelegram(topUpdates, timestamp),
      x: this.generateX(topUpdates, timestamp),
      website: this.generateWebsiteData(topUpdates, timestamp), // NEW: Website data
      metadata: {
        templateType: 'github-updates-minimal',
        updatesCount: topUpdates.length,
        timestamp: timestamp,
        realData: true // Flag to confirm real data
      }
    };
  },

  generateTelegram(updates, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    let content = `🤖 UserOwned.AI\n`;
    content += `AI x CRYPTO GITHUB [${date}]\n\n`;
    
    updates.forEach((update, i) => {
      const repo = this.getRepoInfo(update.repo);
      content += `${i + 1}/ ${repo.name}: ${this.formatMinimal(update)}\n`;
    });
    
    content += `\n@userownedai`;
    return content;
  },

  generateX(updates, timestamp) {
    let content = `🤖 AI x Crypto Dev Updates\n\n`;
    
    updates.slice(0, 3).forEach((update, i) => {
      const repo = this.getRepoInfo(update.repo);
      content += `${i + 1}/ ${repo.name}: ${this.formatMinimal(update, true)}\n`;
    });
    
    content += `\n#UserOwnedAI #GitHub`;
    return content;
  },

  // NEW: Generate structured data for website
  generateWebsiteData(updates, timestamp) {
    return {
      lastUpdated: timestamp,
      updates: updates.map(update => ({
        repository: this.getRepoInfo(update.repo),
        type: update.type,
        title: update.title,
        url: update.url,
        date: update.published_at || update.merged_at || update.date,
        summary: this.formatMinimal(update)
      }))
    };
  },

  formatMinimal(update, isX = false) {
    const maxLength = isX ? 40 : 80;
    
    if (update.type === 'release') {
      return this.truncate(`Released ${update.tag_name || update.title}`, maxLength);
    } else if (update.type === 'pull_request') {
      return this.truncate(update.title, maxLength);
    } else if (update.type === 'commit') {
      return this.truncate(update.title, maxLength);
    }
    
    return this.truncate(update.title || 'Update', maxLength);
  },

  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  getRepoInfo(repoPath) {
    return this.repositories.find(r => r.repo === repoPath) || 
           { name: 'Unknown', symbol: 'UNK' };
  },

  generateNoUpdates(timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return {
      telegram: `🤖 UserOwned.AI\nAI x CRYPTO GITHUB [${date}]\n\nNo significant updates today.\n\n@userownedai`,
      x: `🤖 AI x Crypto Dev Updates\n\nQuiet day in the repos.\n\n#UserOwnedAI`,
      website: {
        lastUpdated: timestamp,
        updates: [],
        message: 'No significant updates today'
      },
      metadata: {
        templateType: 'github-updates-minimal',
        updatesCount: 0,
        timestamp: timestamp,
        realData: true
      }
    };
  }
};

module.exports = template;