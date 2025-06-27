/**
 * Competitive Daily Format - Battle/Race Theme
 * Focus on competition and rankings
 */

const template = {
  name: 'Daily Format - Competitive',
  type: 'daily-competitive',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-competitive', format: 'F' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return `🏁 AI x CRYPTO RACE - ${date}

🏆 LEADERBOARD:
${topThree.map((eco, i) => 
  `${this.getPosition(i)} ${eco.name}
  📈 Score: ${eco.score}/100 ${this.getScoreStatus(eco.score)}
  🚀 Momentum: ${eco.github?.commits_7d || 0} commits`
).join('\n\n')}

⚔️ BATTLE STATS:
• Total contenders: ${topThree.length}+ projects
• Combined firepower: ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits
• Prize pool: $${Math.round(defiData.totalTvl / 1e9)}B market

🎯 Tomorrow's race: Same time, new rankings!
🏁 Track the competition: userowned.ai`;
  },

  generateX(topThree, defiData, timestamp) {
    return `🏁 AI x CRYPTO CHAMPIONSHIP

🏆 TODAY'S PODIUM:
${topThree.map((eco, i) => 
  `${this.getPosition(i)} ${eco.symbol}: ${eco.score}/100`
).join('\n')}

⚔️ Battle stats:
🚀 ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits this round
💰 $${Math.round(defiData.totalTvl / 1e9)}B total value

🏁 Next race: Tomorrow
🎯 userowned.ai

#AIxCrypto #Leaderboard #Competition`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `## 🏁 AI x Crypto Championship - ${date} (Format F: Competitive)

### 🏆 Race Results
${ecosystems.map((eco, i) => 
  `${this.getPosition(i)} ${eco.name}: ${eco.score}/100 ${this.getScoreStatus(eco.score)}`
).join('\n')}

### 📊 Race Statistics
- Competitors: ${ecosystems.length}
- Combined development activity: ${ecosystems.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits
- Market prize pool: $${Math.round(defiData.totalTvl / 1e9)}B

*Format F: Competitive - Testing gamification engagement*`;
  },

  getPosition(index) {
    const positions = ['🥇 CHAMPION', '🥈 RUNNER-UP', '🥉 THIRD PLACE'];
    return positions[index] || `${index + 1}th`;
  },

  getScoreStatus(score) {
    if (score >= 90) return "🔥 DOMINATING";
    if (score >= 80) return "💪 STRONG";
    if (score >= 70) return "⚡ RISING";
    if (score >= 60) return "📈 STEADY";
    return "🏗️ BUILDING";
  }
};

module.exports = template;