/**
 * Narrative Daily Format - Story-driven
 * Focus on insights and market narrative
 */

const template = {
  name: 'Daily Format - Narrative',
  type: 'daily-narrative',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-narrative', format: 'D' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const leader = topThree[0];
    const totalCommits = topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0);
    
    return `🤖 AI x Crypto Intelligence - ${date}

Today's development landscape shows ${leader?.name || 'strong leaders'} maintaining dominance with a ${leader?.score || 0}/100 score, driven by ${leader?.github?.commits_7d || 0} recent commits.

📊 Market Analysis:
${topThree.map((eco, i) => `• ${eco.name}: ${eco.score}/100 (${this.getMovementInsight(eco.score)})`).join('\n')}

The AI x crypto space processed ${totalCommits} commits this week across tracked projects, with $${Math.round(defiData.totalTvl / 1e9)}B in total value locked across DeFi protocols.

🔍 Key Insight: ${this.generateInsight(topThree)}

📈 Full analysis: userowned.ai`;
  },

  generateX(topThree, defiData, timestamp) {
    const leader = topThree[0];
    
    return `🤖 AI x Crypto Market Update

${leader?.name || 'Market leaders'} showing strong momentum today.

Top performers:
${topThree.map((eco, i) => `${i + 1}. ${eco.symbol}: ${eco.score}/100`).join('\n')}

💡 Insight: ${this.generateShortInsight(topThree)}

🔗 userowned.ai

#AIInvesting #CryptoAnalysis`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `## 🤖 Narrative AI x Crypto Analysis - ${date} (Format D: Narrative)

### Market Story
${this.generateFullNarrative(ecosystems, defiData)}

### Rankings
${ecosystems.map((eco, i) => `${i + 1}. ${eco.name}: ${eco.score}/100`).join('\n')}

*Format D: Narrative - Testing story-driven engagement*`;
  },

  getMovementInsight(score) {
    if (score >= 80) return "strong momentum";
    if (score >= 60) return "steady growth";
    if (score >= 40) return "moderate activity";
    return "building phase";
  },

  generateInsight(topThree) {
    const insights = [
      "Development velocity remains high across AI infrastructure projects",
      "Multi-chain AI solutions gaining traction",
      "Decentralized AI protocols showing strong community engagement",
      "Infrastructure-focused projects leading adoption metrics"
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  },

  generateShortInsight(topThree) {
    const insights = [
      "AI infrastructure driving growth",
      "Development activity surging",
      "Community engagement strong",
      "Multi-chain solutions winning"
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  },

  generateFullNarrative(ecosystems, defiData) {
    return `The AI x crypto ecosystem continues to evolve with ${ecosystems.length} major projects tracked. Development activity shows strong momentum across infrastructure and protocol layers, with significant progress in decentralized AI capabilities.`;
  }
};

module.exports = template;