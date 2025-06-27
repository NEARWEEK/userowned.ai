/**
 * Technical Daily Format - Developer Focus
 * Focus on technical metrics and code analysis
 */

const template = {
  name: 'Daily Format - Technical',
  type: 'daily-technical',
  
  async generate(data) {
    const { ecosystems, defiData, timestamp } = data;
    const validEcosystems = ecosystems || [];
    const sortedEcosystems = validEcosystems.sort((a, b) => b.score - a.score);
    const topThree = sortedEcosystems.slice(0, 3);
    
    return {
      telegram: this.generateTelegram(topThree, defiData, timestamp),
      x: this.generateX(topThree, defiData, timestamp),
      github: this.generateGithubIssue(sortedEcosystems, defiData, timestamp),
      metadata: { templateType: 'daily-technical', format: 'E' }
    };
  },

  generateTelegram(topThree, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    return `⚡ AI x Crypto Dev Report - ${date}

TECHNICAL METRICS:
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.name} [${eco.github?.language || 'N/A'}]
  ├─ Score: ${eco.score}/100
  ├─ Commits: ${eco.github?.commits_7d || 0} (7d)
  ├─ Stars: ${eco.github?.stars || 0}
  └─ Issues: ${eco.github?.issues || 0} open`
).join('\n\n')}

AGGREGATE STATS:
• Total commits (7d): ${topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)}
• Combined stars: ${topThree.reduce((sum, eco) => sum + (eco.github?.stars || 0), 0)}
• TVL: $${Math.round(defiData.totalTvl / 1e9)}B

METHOD: Multi-source analysis (GitHub API + DeFi data)
SOURCE: userowned.ai`;
  },

  generateX(topThree, defiData, timestamp) {
    const totalCommits = topThree.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0);
    
    return `⚡ AI x Crypto Dev Metrics

CODE ACTIVITY (7d):
${topThree.map((eco, i) => 
  `${i + 1}. ${eco.symbol}: ${eco.github?.commits_7d || 0} commits [${eco.github?.language || 'N/A'}]`
).join('\n')}

📊 ${totalCommits} total commits
⭐ ${topThree.reduce((sum, eco) => sum + (eco.github?.stars || 0), 0)} combined stars
💰 $${Math.round(defiData.totalTvl / 1e9)}B TVL

🔗 userowned.ai

#DevMetrics #AIxCrypto #OpenSource`;
  },

  generateGithubIssue(ecosystems, defiData, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `## ⚡ Technical AI x Crypto Report - ${date} (Format E: Technical)

### Development Metrics
${ecosystems.map((eco, i) => 
  `${i + 1}. **${eco.name}** (${eco.score}/100)
   - Language: ${eco.github?.language || 'N/A'}
   - Commits (7d): ${eco.github?.commits_7d || 0}
   - Stars: ${eco.github?.stars || 0}
   - Open Issues: ${eco.github?.issues || 0}
   - Repository: \`${eco.repo || 'N/A'}\``
).join('\n\n')}

### Aggregate Analysis
- Total tracked repositories: ${ecosystems.length}
- Combined development velocity: ${ecosystems.reduce((sum, eco) => sum + (eco.github?.commits_7d || 0), 0)} commits/week
- Ecosystem diversity: ${[...new Set(ecosystems.map(eco => eco.github?.language).filter(Boolean))].join(', ')}

*Format E: Technical - Testing developer audience engagement*`;
  }
};

module.exports = template;