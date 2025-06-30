/**
 * GitHub Updates Daily Template
 * Real GitHub API data collection for AI x Crypto repositories
 */

const template = {
  name: 'GitHub Updates Daily',
  type: 'github-updates-daily',
  schedule: '30 9 * * *', // 10:30 CET daily
  channels: ['telegram', 'x'],
  
  // AI x Crypto repositories to track
  repositories: [
    { name: 'Bittensor', repo: 'opentensor/bittensor', symbol: 'TAO' },
    { name: 'NEAR Protocol', repo: 'near/nearcore', symbol: 'NEAR' },
    { name: 'Internet Computer', repo: 'dfinity/ic', symbol: 'ICP' },
    { name: 'Render Network', repo: 'RNDR-Inc/rndr-py', symbol: 'RNDR' },
    { name: 'Fetch.ai', repo: 'fetchai/fetchai-ledger', symbol: 'FET' },
    { name: 'Akash Network', repo: 'akash-network/node', symbol: 'AKT' }
  ],
  
  /**
   * Generate GitHub updates report using real API data
   */
  async generate(data) {
    const { githubUpdates, timestamp } = data;
    
    // Filter and prioritize updates
    const significantUpdates = this.filterSignificantUpdates(githubUpdates);
    
    if (significantUpdates.length === 0) {
      return {
        telegram: this.generateNoUpdatesMessage(timestamp),
        x: this.generateNoUpdatesMessage(timestamp, true),
        metadata: {
          templateType: 'github-updates-daily',
          updatesCount: 0,
          timestamp: timestamp
        }
      };
    }
    
    return {
      telegram: this.generateTelegram(significantUpdates, timestamp),
      x: this.generateX(significantUpdates, timestamp),
      metadata: {
        templateType: 'github-updates-daily',
        updatesCount: significantUpdates.length,
        timestamp: timestamp
      }
    };
  },

  /**
   * Filter updates to only include significant changes
   */
  filterSignificantUpdates(allUpdates) {
    return allUpdates
      .filter(update => {
        // Filter criteria for significant updates:
        if (update.type === 'release') return true; // All releases are significant
        
        if (update.type === 'pull_request') {
          // Filter PRs by keywords indicating importance
          const significantKeywords = [
            'fix', 'add', 'implement', 'update', 'improve', 'enhance',
            'optimize', 'security', 'performance', 'consensus', 'validator',
            'api', 'protocol', 'network', 'runtime', 'core', 'critical'
          ];
          const title = update.title.toLowerCase();
          return significantKeywords.some(keyword => title.includes(keyword));
        }
        
        if (update.type === 'commit') {
          // Only include commits that seem significant
          const title = update.title.toLowerCase();
          const significantCommitKeywords = [
            'implement', 'add', 'fix', 'update', 'optimize', 'enhance',
            'security', 'consensus', 'validator', 'protocol', 'api'
          ];
          return significantCommitKeywords.some(keyword => title.includes(keyword));
        }
        
        return false;
      })
      .slice(0, 6); // Limit to max 6 updates for readability
  },

  /**
   * Generate Telegram content with real data
   */
  generateTelegram(updates, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const intros = [
      "What shipped on GitHub today? Here's the latest from the AI x Crypto devs!",
      "Fresh commits from the AI x crypto teams — here's what hit GitHub.",
      "Today's AI x crypto GitHub changes, straight from the repos.",
      "New code. Updated protocols. Here's what landed today."
    ];
    const intro = intros[Math.floor(Math.random() * intros.length)];
    
    let content = `🤖 UserOwned.AI\n`;
    content += `AI x CRYPTO GITHUB UPDATES [${date}] 📊\n\n`;
    content += `${intro}\n\n`;
    
    updates.forEach((update, index) => {
      const num = index + 1;
      content += `${num}/ ${this.formatUpdateForTelegram(update)}\n\n`;
    });
    
    content += `🔗 @userownedai | @NEARWEEK`;
    
    return content;
  },

  /**
   * Generate X content with real data
   */
  generateX(updates, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const topUpdates = updates.slice(0, 3); // Limit for X character count
    
    let content = `🤖 AI x Crypto GitHub Updates\n\n`;
    content += `What shipped today?\n\n`;
    
    topUpdates.forEach((update, index) => {
      const num = index + 1;
      content += `${num}/ ${this.formatUpdateForX(update)}\n`;
    });
    
    content += `\n#UserOwnedAI #GitHub #AI #Crypto`;
    
    return content;
  },

  /**
   * Format individual update for Telegram
   */
  formatUpdateForTelegram(update) {
    const repoInfo = this.getRepoInfo(update.repo);
    const typeLabel = this.getTypeLabel(update.type, update);
    
    let formatted = `${typeLabel} - ${repoInfo.name}\n\n`;
    
    if (update.type === 'release') {
      formatted += this.formatReleaseUpdate(update, repoInfo);
    } else if (update.type === 'pull_request') {
      formatted += this.formatPullRequestUpdate(update, repoInfo);
    } else if (update.type === 'commit') {
      formatted += this.formatCommitUpdate(update, repoInfo);
    }
    
    return formatted;
  },

  /**
   * Format individual update for X (shorter)
   */
  formatUpdateForX(update) {
    const repoInfo = this.getRepoInfo(update.repo);
    const typeIcon = this.getTypeIcon(update.type);
    
    return `${repoInfo.name} ${typeIcon}\n• ${this.shortenForX(update.title)}`;
  },

  /**
   * Format release update with context
   */
  formatReleaseUpdate(update, repoInfo) {
    let content = '';
    
    if (update.changes && update.changes.length > 0) {
      update.changes.slice(0, 4).forEach(change => {
        const context = this.addAIContext(change, repoInfo.symbol);
        content += `• ${change} - ${context}\n`;
      });
    } else {
      // Fallback if no detailed changes available
      const context = this.addAIContext(update.title, repoInfo.symbol);
      content += `• ${update.title} - ${context}\n`;
    }
    
    return content;
  },

  /**
   * Format pull request update with context
   */
  formatPullRequestUpdate(update, repoInfo) {
    const context = this.addAIContext(update.title, repoInfo.symbol);
    const prNumber = update.number ? ` (#${update.number})` : '';
    return `• ${update.title}${prNumber} - ${context}\n`;
  },

  /**
   * Format commit update with context
   */
  formatCommitUpdate(update, repoInfo) {
    const context = this.addAIContext(update.title, repoInfo.symbol);
    const shortSha = update.sha ? ` (${update.sha.substring(0, 7)})` : '';
    return `• ${update.title}${shortSha} - ${context}\n`;
  },

  /**
   * Add AI/crypto context to technical changes
   */
  addAIContext(title, symbol) {
    const contexts = {
      'TAO': {
        'validator': 'strengthens consensus in decentralized AI network',
        'subnet': 'improves AI model contribution rewards',
        'consensus': 'enhances machine learning network security',
        'hotkey': 'makes it easier for miners to join AI network',
        'reward': 'ensures fair compensation for AI contributions',
        'default': 'enhances Bittensor\'s decentralized ML capabilities'
      },
      'NEAR': {
        'intent': 'improves user intent processing for AI apps',
        'chunk': 'optimizes AI workload processing',
        'runtime': 'reduces costs for AI smart contracts',
        'witness': 'makes AI transaction verification faster',
        'gas': 'lowers fees for AI applications',
        'default': 'enhances NEAR\'s AI infrastructure capabilities'
      },
      'ICP': {
        'canister': 'enables better on-chain AI model execution',
        'wasm': 'allows AI models to run directly on blockchain',
        'memory': 'optimizes resources for AI applications',
        'gpu': 'enables high-performance AI computing',
        'ml': 'improves machine learning workload support',
        'default': 'advances Internet Computer\'s AI hosting platform'
      },
      'RNDR': {
        'gpu': 'enhances decentralized rendering for AI/metaverse',
        'render': 'improves AI model training capabilities',
        'compute': 'strengthens distributed GPU network',
        'node': 'expands decentralized compute resources',
        'default': 'advances decentralized GPU rendering network'
      },
      'FET': {
        'agent': 'improves autonomous AI agent capabilities',
        'autonomous': 'enhances decentralized agent coordination',
        'ledger': 'strengthens infrastructure for AI agents',
        'smart': 'advances intelligent infrastructure automation',
        'default': 'enhances autonomous agent network capabilities'
      },
      'AKT': {
        'provider': 'expands decentralized compute marketplace',
        'deployment': 'makes AI workload deployment easier',
        'compute': 'strengthens cloud infrastructure for AI',
        'kubernetes': 'improves container orchestration for ML',
        'default': 'advances decentralized cloud computing platform'
      }
    };
    
    const symbolContexts = contexts[symbol] || contexts['default'];
    const titleLower = title.toLowerCase();
    
    // Find matching context keyword
    for (const [keyword, context] of Object.entries(symbolContexts)) {
      if (keyword !== 'default' && titleLower.includes(keyword)) {
        return context;
      }
    }
    
    return symbolContexts.default || 'advances AI x crypto development';
  },

  /**
   * Get repository information
   */
  getRepoInfo(repoPath) {
    return this.repositories.find(r => r.repo === repoPath) || 
           { name: 'Unknown', symbol: 'UNK' };
  },

  /**
   * Get type label for updates
   */
  getTypeLabel(type, update) {
    if (type === 'release') {
      return `NEW RELEASE - ${update.tag_name || update.title}`;
    } else if (type === 'pull_request') {
      return 'PULL REQUESTS MERGED';
    } else if (type === 'commit') {
      return 'DEVELOPMENT ACTIVITY';
    }
    return 'UPDATE';
  },

  /**
   * Get type icon for X posts
   */
  getTypeIcon(type) {
    const icons = {
      'release': '🚀',
      'pull_request': '🔄', 
      'commit': '🔨'
    };
    return icons[type] || '📝';
  },

  /**
   * Shorten text for X character limits
   */
  shortenForX(text) {
    if (text.length <= 60) return text;
    return text.substring(0, 57) + '...';
  },

  /**
   * Generate message when no significant updates found
   */
  generateNoUpdatesMessage(timestamp, isX = false) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    if (isX) {
      return `🤖 AI x Crypto GitHub Updates\n\nQuiet day in the repos - teams focusing on deep development work.\n\nBack tomorrow with fresh updates!\n\n#UserOwnedAI #GitHub`;
    }
    
    return `🤖 UserOwned.AI\nAI x CRYPTO GITHUB UPDATES [${date}] 📊\n\nQuiet day in the repos today - sometimes the best development happens in deep focus mode.\n\nWe'll be back tomorrow with fresh updates from the AI x crypto dev teams!\n\n🔗 @userownedai | @NEARWEEK`;
  }
};

module.exports = template;