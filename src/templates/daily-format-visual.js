/**
 * Visual Daily Format - Emoji Heavy
 * Focus on visual appeal and readability
 */

const template = {
  name: 'Daily Format - Visual',
  type: 'daily-visual',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-visual', format: 'C' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const medals = ['🥇', '🥈', '🥉'];
    
    return `🤖 AI x CRYPTO DAILY INTEL 🚀

📅 ${date}

${topThree.map((eco, i) => 
  `${medals[i]} ${eco.name}
  📊 Score: ${eco.score}/100
  ⭐ Stars: ${eco.github?.stars || 0}
  💻 Commits: ${eco.github?.commits_7d || 0} (7d)`
).join('\n\n')}

💰 MARKET SNAPSHOT:
📈 Total TVL: $${Math.round(defiData.totalTvl / 1e9)}B
🔥 Dev Activity: ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits

🔗 userowned.ai | @userownedai`;
  },

  generateX(topThree, defiData, timestamp) {
    const medals = ['🥇', '🥈', '🥉'];
    
    return `🤖 AI x CRYPTO DAILY 🚀

${topThree.map((eco, i) => 
  `${medals[i]} ${eco.symbol}: ${eco.score}/100`
).join('\n')}

💰 $${Math.round(defiData.totalTvl / 1e9)}B market
🔥 ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits this week

🔗 userowned.ai

#AI #Crypto #DeFi 🚀`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `## 🤖 Visual AI x Crypto Report - ${date} (Format C: Visual)

### 🏆 Today's Champions
${ecosystems.map((eco, i) => 
  `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹'} ${eco.name}: ${eco.score}/100`
).join('\n')}

*Format C: Visual - Testing emoji engagement*`;
  }
};

module.exports = template;