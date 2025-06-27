/**
 * Investor Daily Format - Financial Focus
 * Focus on investment insights and market signals
 */

const template = {
  name: 'Daily Format - Investor',
  type: 'daily-investor',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-investor', format: 'G' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return `📊 AI x CRYPTO INVESTMENT SIGNALS - ${date}

💎 TOP INVESTMENT THESIS:
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.name} (${eco.symbol})
  📈 Score: ${eco.score}/100 ${this.getInvestmentSignal(eco.score)}
  🏗️ Development: ${this.getDevSignal(eco.github?.commits_7d || 0)}
  💰 TVL: ${eco.tvl ? '$' + Math.round(eco.tvl / 1e6) + 'M' : 'N/A'}`
).join('\n\n')}

🎯 MARKET OVERVIEW:
• Total AI x Crypto TVL: $${Math.round(defiData.totalTvl / 1e9)}B
• Development Activity: ${this.getMarketSentiment(topThree)}
• Risk Level: ${this.getRiskAssessment(topThree)}

⚠️ DYOR: This is development analysis, not financial advice
📈 Research: userowned.ai`;
  },

  generateX(topThree, defiData, timestamp) {
    return `📊 AI x CRYPTO SIGNALS

💎 Investment Watch:
${topThree.map((eco, i) => 
  `${i + 1}. $${eco.symbol}: ${eco.score}/100 ${this.getInvestmentSignal(eco.score)}`
).join('\n')}

🎯 Signals:
📈 Development: ${this.getMarketSentiment(topThree)}
💰 Market: $${Math.round(defiData.totalTvl / 1e9)}B TVL
⚠️ Risk: ${this.getRiskAssessment(topThree)}

📊 Research: userowned.ai
🚨 DYOR - Not financial advice

#CryptoSignals #AIInvesting #DYOR`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `## 📊 AI x Crypto Investment Analysis - ${date} (Format G: Investor)

### 💎 Investment Thesis Rankings
${ecosystems.map((eco, i) => 
  `${i + 1}. **${eco.name}** (${eco.symbol}): ${eco.score}/100
   - Investment Signal: ${this.getInvestmentSignal(eco.score)}
   - Development Signal: ${this.getDevSignal(eco.github?.commits_7d || 0)}
   - TVL: ${eco.tvl ? '$' + Math.round(eco.tvl / 1e6) + 'M' : 'N/A'}`
).join('\n\n')}

### 🎯 Market Assessment
- Total AI x Crypto Market: $${Math.round(defiData.totalTvl / 1e9)}B TVL
- Development Sentiment: ${this.getMarketSentiment(ecosystems)}
- Risk Assessment: ${this.getRiskAssessment(ecosystems)}

**⚠️ Disclaimer: This is development and adoption analysis, not financial advice. Always DYOR.**

*Format G: Investor - Testing investment-focused engagement*`;
  },

  getInvestmentSignal(score) {
    if (score >= 85) return "🟢 BUY SIGNAL";
    if (score >= 70) return "🟡 WATCH";
    if (score >= 55) return "🟠 CAUTION";
    return "🔴 AVOID";
  },

  getDevSignal(commits) {
    if (commits >= 20) return "🚀 High velocity";
    if (commits >= 10) return "📈 Active";
    if (commits >= 5) return "🔄 Moderate";
    return "😴 Low activity";
  },

  getMarketSentiment(ecosystems) {
    const avgScore = ecosystems.reduce((sum, eco) => sum + eco.score, 0) / ecosystems.length;
    if (avgScore >= 75) return "📈 Bullish";
    if (avgScore >= 60) return "➡️ Neutral";
    return "📉 Bearish";
  },

  getRiskAssessment(ecosystems) {
    const scores = ecosystems.map(eco => eco.score);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - scores.reduce((a, b) => a + b) / scores.length, 2), 0) / scores.length;
    if (variance < 100) return "🟢 Low volatility";
    if (variance < 400) return "🟡 Medium volatility";
    return "🔴 High volatility";
  }
};

module.exports = template;