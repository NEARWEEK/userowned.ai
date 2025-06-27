/**
 * Daily Ecosystem Analysis Template
 * Generates comprehensive AI x crypto ecosystem intelligence
 */

const template = {
  name: 'Daily Ecosystem Analysis',
  type: 'daily-ecosystem',
  schedule: '40 13 * * *', // 14:40 CET daily
  channels: ['telegram', 'x', 'github-issue'],
  
  /**
   * Generate daily ecosystem analysis report
   */
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    
    // Handle missing ecosystems data gracefully
    const validEcosystems = ecosystems || [];
    
    // Sort ecosystems by score
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: {
        templateType: 'daily-ecosystem',
        ecosystemCount: ecosystems.length,
        timestamp: timestamp
      }
    };
  },

  /**
   * Generate Telegram content
   */
  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return `🤖 User-Owned AI Daily Intelligence - ${date}

🏆 AI Ecosystem Rankings (Multi-Source Analysis):
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.name}: ${eco.score}/100 ${this.getRankingEmoji(i)}`
).join('\n')}

📊 Market Overview:
• Total DeFi TVL: $${Math.round(defiData.totalTvl / 1e9)}B
• Development Velocity: ${topThree.reduce((sum, eco) => sum + eco.github.commits_7d, 0)} commits (7d)
• Active Projects: ${topThree.length}+ tracked

🔍 Methodology:
• GitHub development tracking
• DeFi performance metrics
• On-chain adoption signals
• Multi-source verification

📈 Full analysis: userowned.ai
🔗 @userownedai | @NEARWEEK`;
  },

  /**
   * Generate X/Twitter content
   */
  generateX(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return `🤖 UserOwned.ai Daily Intel ${date}

🏆 AI x Crypto Rankings:
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.symbol}: ${eco.score}/100 ${this.getRankingEmoji(i)}`
).join('\n')}

📊 $${Math.round(defiData.totalTvl / 1e9)}B DeFi market
🔍 Multi-source analysis
📈 userowned.ai

#UserOwnedAI #AI #Crypto #DeFi`;
  },

  /**
   * Generate detailed GitHub issue report
   */
  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    let report = `## 🤖 Daily AI Ecosystem Intelligence Report\n\n`;
    report += `**Generated**: ${timestamp}\n`;
    report += `**Ecosystems Analyzed**: ${ecosystems.length}\n`;
    report += `**Total Market TVL**: $${Math.round(defiData.totalTvl / 1e9)}B\n\n`;
    
    report += `### 🏆 Ecosystem Rankings\n\n`;
    ecosystems.forEach((eco, i) => {
      report += `#### ${i + 1}. ${eco.name} (${eco.score}/100)\n`;
      report += `- **Development**: ${eco.github.stars} stars, ${eco.github.commits_7d} commits (7d)\n`;
      report += `- **Issues**: ${eco.github.issues} open\n`;
      report += `- **Language**: ${eco.github.language}\n`;
      if (eco.tvl) {
        report += `- **TVL**: $${Math.round(eco.tvl / 1e6)}M\n`;
      }
      report += `\n`;
    });
    
    report += `### 📊 Analysis Methodology\n\n`;
    report += `- **Development (40%)**: GitHub stars, commits, code quality\n`;
    report += `- **Adoption (35%)**: DApp usage, on-chain activity\n`;
    report += `- **Financial (25%)**: TVL, market metrics\n\n`;
    
    report += `---\n*UserOwned.ai by NEARWEEK - Next report: Tomorrow 14:40 CET*`;
    
    return report;
  },

  /**
   * Get ranking emoji
   */
  getRankingEmoji(index) {
    const emojis = ['⭐', '🥈', '🥉', '🔹'];
    return emojis[index] || '🔹';
  }
};

module.exports = template;