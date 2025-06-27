/**
 * Optimized GitHub Updates Template
 * Faster processing, precise timing, enhanced accuracy
 */

const template = {
  name: 'Optimized GitHub Updates',
  type: 'github-updates-optimized',
  schedule: '50 9 * * *', // 10:50 CET
  channels: ['telegram', 'x'],
  
  repositories: [
    { name: 'Bittensor', repo: 'opentensor/bittensor', symbol: 'TAO', twitter: '@opentensor' },
    { name: 'NEAR', repo: 'near/nearcore', symbol: 'NEAR', twitter: '@nearprotocol' },
    { name: 'ICP', repo: 'dfinity/ic', symbol: 'ICP', twitter: '@dfinity' },
    { name: 'Render', repo: 'RNDR-Inc/rndr-py', symbol: 'RNDR', twitter: '@rendernetwork' },
    { name: 'Fetch.ai', repo: 'fetchai/fetchai-ledger', symbol: 'FET', twitter: '@fetch_ai' },
    { name: 'Akash', repo: 'akash-network/node', symbol: 'AKT', twitter: '@akashnet_' }
  ],
  
  async generate(data) {
    const { githubUpdates, timestamp } = data;
    
    if (!githubUpdates || githubUpdates.length === 0) {
      return this.generateNoUpdates(timestamp);
    }
    
    // Take top 4 most significant updates
    const topUpdates = githubUpdates.slice(0, 4);
    
    return {
      telegram: this.generateTelegram(topUpdates, timestamp),
      x: this.generateX(topUpdates, timestamp),
      website: this.generateWebsiteData(topUpdates, timestamp),
      metadata: {
        templateType: 'github-updates-optimized',
        updatesCount: topUpdates.length,
        timestamp: timestamp,
        processingOptimized: true,
        significanceThreshold: Math.min(...topUpdates.map(u => u.significance || 5))
      }
    };
  },

  generateTelegram(updates, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    let content = `🤖 UserOwned.AI\n`;
    content += `AI x CRYPTO GITHUB UPDATES [${date}] 📊\n\n`;
    content += `What shipped on the AI x Crypto GitHub today? Here's the latest from the devs!\n\n`;
    
    updates.forEach((update, i) => {
      content += `${i + 1}/\n${this.formatTelegramUpdate(update)}\n\n`;
    });
    
    content += `🔗 @userownedai | @NEARWEEK`;
    return content;
  },

  generateX(updates, timestamp) {
    const uniqueTwitterAccounts = [...new Set(
      updates.map(update => {
        const repo = this.getRepoInfo(update.repo);
        return repo.twitter;
      }).filter(Boolean)
    )];
    
    const twitterTags = uniqueTwitterAccounts.join(' ');
    
    let content = `What shipped on ${twitterTags} GitHub today? Here's the latest from the AI x Crypto devs! 🧵\n\n`;
    
    updates.slice(0, 3).forEach((update, i) => {
      content += `${i + 1}/ ${this.formatXUpdate(update)}\n\n`;
    });
    
    return content.trim();
  },

  formatTelegramUpdate(update) {
    const repo = this.getRepoInfo(update.repo);
    const typeLabel = this.getTypeLabel(update.type, update);
    
    let formatted = `${typeLabel} - ${repo.name}\n\n`;
    formatted += `What changed:\n`;
    
    if (update.type === 'release' && update.changes && update.changes.length > 0) {
      update.changes.slice(0, 3).forEach(change => {
        formatted += `• ${change}\n`;
      });
    } else {
      formatted += `• ${update.title}\n`;
      if (update.additions && update.deletions) {
        formatted += `• ${update.additions} additions, ${update.deletions} deletions\n`;
      }
    }
    
    formatted += `\nWhy it matters:\n`;
    formatted += `This ${update.type.replace('_', ' ')} ${this.getImpactDescription(update, repo.symbol)}.`;
    
    return formatted;
  },

  formatXUpdate(update) {
    const repo = this.getRepoInfo(update.repo);
    const shortTitle = this.truncate(update.title, 60);
    const impact = this.getShortImpact(update, repo.symbol);
    
    return `${repo.name}: ${shortTitle} - ${impact}`;
  },

  getImpactDescription(update, symbol) {
    const impactMap = {
      'TAO': {
        'release': 'enhances Bittensor\'s decentralized machine learning network capabilities',
        'pull_request': 'improves the core infrastructure for AI model coordination and rewards',
        'commit': 'advances the development of decentralized AI training protocols',
        'issue': 'addresses critical aspects of the decentralized ML network'
      },
      'NEAR': {
        'release': 'strengthens NEAR\'s AI infrastructure and intent execution capabilities',
        'pull_request': 'optimizes the blockchain for AI applications and smart contracts',
        'commit': 'enhances the protocol\'s ability to handle AI workloads efficiently',
        'issue': 'resolves important challenges in AI x blockchain integration'
      },
      'ICP': {
        'release': 'advances Internet Computer\'s on-chain AI hosting platform',
        'pull_request': 'improves the ability to run AI models directly on blockchain',
        'commit': 'develops infrastructure for decentralized AI computation',
        'issue': 'addresses key challenges in on-chain AI execution'
      },
      'RNDR': {
        'release': 'enhances the decentralized GPU rendering network for AI applications',
        'pull_request': 'improves distributed computing capabilities for AI and metaverse',
        'commit': 'advances the development of decentralized GPU infrastructure',
        'issue': 'resolves challenges in distributed rendering and compute'
      },
      'FET': {
        'release': 'strengthens the autonomous agent network and AI coordination',
        'pull_request': 'improves infrastructure for autonomous AI agents and DeFi automation',
        'commit': 'advances development of decentralized agent coordination protocols',
        'issue': 'addresses important aspects of autonomous agent functionality'
      },
      'AKT': {
        'release': 'enhances the decentralized cloud computing marketplace for AI workloads',
        'pull_request': 'improves the infrastructure for deploying AI applications on decentralized cloud',
        'commit': 'advances development of decentralized compute infrastructure',
        'issue': 'resolves challenges in decentralized cloud deployment and management'
      }
    };
    
    const symbolMap = impactMap[symbol] || impactMap['TAO'];
    return symbolMap[update.type] || 'contributes to the advancement of AI x crypto infrastructure';
  },

  getShortImpact(update, symbol) {
    const shortImpacts = {
      'TAO': 'strengthens decentralized ML network',
      'NEAR': 'enhances AI infrastructure',
      'ICP': 'advances on-chain AI hosting',
      'RNDR': 'improves distributed GPU network',
      'FET': 'strengthens autonomous agent network',
      'AKT': 'enhances decentralized cloud platform'
    };
    
    return shortImpacts[symbol] || 'advances AI x crypto development';
  },

  getTypeLabel(type, update) {
    const labels = {
      'release': `NEW RELEASE - ${update.tag_name || update.title}`,
      'pull_request': 'PULL REQUEST MERGED',
      'commit': 'DEVELOPMENT ACTIVITY',
      'issue': 'SIGNIFICANT ISSUE'
    };
    
    return labels[type] || 'UPDATE';
  },

  getRepoInfo(repoPath) {
    return this.repositories.find(r => r.repo === repoPath) || 
           { name: 'Unknown', symbol: 'UNK', twitter: '@unknown' };
  },

  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  generateWebsiteData(updates, timestamp) {
    return {
      lastUpdated: timestamp,
      processingOptimized: true,
      updates: updates.map(update => ({
        repository: this.getRepoInfo(update.repo),
        type: update.type,
        title: update.title,
        url: update.url,
        date: update.published_at || update.merged_at || update.created_at || update.date,
        significance: update.significance || 5,
        summary: this.truncate(update.title, 100),
        impact: this.getShortImpact(update, this.getRepoInfo(update.repo).symbol)
      }))
    };
  },

  generateNoUpdates(timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return {
      telegram: `🤖 UserOwned.AI\nAI x CRYPTO GITHUB UPDATES [${date}] 📊\n\nQuiet day in the repos - teams are in deep development mode.\n\nWe'll be back tomorrow with fresh updates!\n\n🔗 @userownedai | @NEARWEEK`,
      x: `What shipped on @opentensor @nearprotocol @dfinity GitHub today?\n\nQuiet day in the repos - teams focusing on deep development work.\n\nBack tomorrow with fresh updates!`,
      website: {
        lastUpdated: timestamp,
        processingOptimized: true,
        updates: [],
        message: 'No significant updates today - teams in deep development mode'
      },
      metadata: {
        templateType: 'github-updates-optimized',
        updatesCount: 0,
        timestamp: timestamp,
        processingOptimized: true
      }
    };
  }
};

module.exports = template;