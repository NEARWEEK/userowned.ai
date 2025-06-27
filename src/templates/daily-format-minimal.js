/**
 * Minimal Daily Format - Clean & Simple
 * Focus on top 3 with scores only
 */

const template = {
  name: 'Daily Format - Minimal',
  type: 'daily-minimal',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-minimal', format: 'A' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp || Date.now()).toISOString().split('T')[0];
    
    return `🤖 AI x Crypto Daily - ${date}

🏆 Top 3:
${topThree.map((eco, i) => `${i + 1}. ${eco.symbol}: ${eco.score}/100`).join('\n')}

📊 Market: $${Math.round(defiData.totalTvl / 1e9)}B TVL
🔗 userowned.ai`;
  },

  generateX(topThree, defiData, timestamp) {
    return `🤖 AI x Crypto Daily Rankings

🏆 Top 3:
${topThree.map((eco, i) => `${i + 1}. ${eco.symbol}: ${eco.score}/100`).join('\n')}

📊 Total market: $${Math.round(defiData.totalTvl / 1e9)}B
🔗 userowned.ai

#AI #Crypto #UserOwnedAI`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `## 🤖 Daily AI x Crypto Report - ${date} (Format A: Minimal)

### Rankings
${ecosystems.map((eco, i) => `${i + 1}. ${eco.name}: ${eco.score}/100`).join('\n')}

*Format A: Minimal - Testing performance*`;
  }
};

module.exports = template;