/**
 * Detailed Daily Format - Rich Information
 * Includes development metrics and analysis
 */

const template = {
  name: 'Daily Format - Detailed',
  type: 'daily-detailed',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-detailed', format: 'B' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp || Date.now()).toISOString().split('T')[0];
    
    return `🤖 UserOwned.ai Intelligence Report - ${date}

🏆 AI x Crypto Ecosystem Analysis:
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.name} (${eco.symbol}): ${eco.score}/100
   📈 Dev: ${eco.github?.commits_7d || 0} commits, ${eco.github?.stars || 0} stars
   🔧 Issues: ${eco.github?.issues || 0} open`
).join('\n\n')}

📊 Market Overview:
• Total DeFi TVL: $${Math.round(defiData.totalTvl / 1e9)}B
• Development Activity: ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits (7d)

🔍 Multi-source analysis: GitHub + DeFi + On-chain
📈 Full analysis: userowned.ai
🔗 @userownedai`;
  },

  generateX(topThree, defiData, timestamp) {
    return `🤖 AI x Crypto Intelligence Update

🏆 Today's Leaders:
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.symbol}: ${eco.score}/100 (${eco.github?.commits_7d || 0} commits)`
).join('\n')}

📊 Development: ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits this week
💰 Market: $${Math.round(defiData.totalTvl / 1e9)}B TVL

🔗 userowned.ai

#AIxCrypto #DeFi #Development`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp || Date.now()).toISOString().split('T')[0];
    return `## 🤖 Detailed AI x Crypto Analysis - ${date} (Format B: Detailed)

### Comprehensive Rankings
${ecosystems.map((eco, i) => 
  `${i + 1}. **${eco.name}** (${eco.symbol}): ${eco.score}/100
   - Development: ${eco.github?.stars || 0} stars, ${eco.github?.commits_7d || 0} commits (7d)
   - Issues: ${eco.github?.issues || 0} open
   - Language: ${eco.github?.language || 'N/A'}`
).join('\n\n')}

*Format B: Detailed - Testing engagement with rich data*`;
  }
};

module.exports = template;