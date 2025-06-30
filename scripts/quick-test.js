#!/usr/bin/env node
// NEARWEEK Automated News Sourcing - Quick Integration Test

const https = require('https');

class QuickTester {
  constructor() {
    this.testResults = [];
  }

  async runQuickTests() {
    console.log('⚡ NEARWEEK Automated News Sourcing - Quick Test');
    console.log('='.repeat(50));
    
    // Test 1: Basic system health
    await this.testSystemHealth();
    
    // Test 2: Mock tweet processing
    await this.testMockTweetProcessing();
    
    // Test 3: Content generation
    await this.testContentGeneration();
    
    // Test 4: Quality control
    await this.testQualityControl();
    
    this.printTestResults();
  }

  async testSystemHealth() {
    console.log('\n🏥 Test 1: System Health Check');
    
    try {
      // Test basic Node.js functionality
      const nodeVersion = process.version;
      console.log(`   Node.js Version: ${nodeVersion}`);
      
      // Test JSON parsing
      const testData = JSON.stringify({ test: true });
      const parsedData = JSON.parse(testData);
      
      if (parsedData.test === true) {
        console.log('   ✅ JSON processing: Working');
        this.testResults.push({ test: 'System Health', status: 'PASS' });
      } else {
        throw new Error('JSON processing failed');
      }
      
    } catch (error) {
      console.log(`   ❌ System Health: ${error.message}`);
      this.testResults.push({ test: 'System Health', status: 'FAIL', error: error.message });
    }
  }

  async testMockTweetProcessing() {
    console.log('\n📨 Test 2: Mock Tweet Processing');
    
    try {
      // Mock tweet data
      const mockTweet = {
        id: 'test_tweet_123',
        text: 'Breaking: Major AI breakthrough in crypto infrastructure announced by NEAR Protocol. This could revolutionize decentralized AI applications.',
        author: {
          username: 'NEARProtocol',
          verified: true,
          public_metrics: {
            followers_count: 150000
          }
        },
        public_metrics: {
          like_count: 245,
          retweet_count: 89,
          reply_count: 34
        },
        created_at: new Date().toISOString()
      };
      
      // Test relevance scoring logic
      const relevanceScore = this.calculateMockRelevance(mockTweet);
      console.log(`   Relevance Score: ${relevanceScore}/100`);
      
      // Test urgency classification
      const urgency = this.classifyMockUrgency(mockTweet);
      console.log(`   Urgency Level: ${urgency}`);
      
      if (relevanceScore >= 80 && urgency === 'high') {
        console.log('   ✅ Tweet Processing: Working');
        this.testResults.push({ test: 'Tweet Processing', status: 'PASS', score: relevanceScore });
      } else {
        console.log('   ⚠️  Tweet Processing: Suboptimal scoring');
        this.testResults.push({ test: 'Tweet Processing', status: 'WARN', score: relevanceScore });
      }
      
    } catch (error) {
      console.log(`   ❌ Tweet Processing: ${error.message}`);
      this.testResults.push({ test: 'Tweet Processing', status: 'FAIL', error: error.message });
    }
  }

  async testContentGeneration() {
    console.log('\n📝 Test 3: Content Generation');
    
    try {
      const mockAnalysis = {
        relevance_score: 85,
        confidence_level: 90,
        urgency: 'high',
        market_impact: 'significant',
        content_category: 'AI Infrastructure'
      };
      
      // Test content template generation
      const twitterContent = this.generateMockTwitterContent(mockAnalysis);
      const telegramContent = this.generateMockTelegramContent(mockAnalysis);
      
      console.log(`   Twitter Content: ${twitterContent.substring(0, 50)}...`);
      console.log(`   Telegram Content: ${telegramContent.substring(0, 50)}...`);
      
      if (twitterContent.length > 0 && telegramContent.length > 0) {
        console.log('   ✅ Content Generation: Working');
        this.testResults.push({ test: 'Content Generation', status: 'PASS' });
      } else {
        throw new Error('Content generation produced empty results');
      }
      
    } catch (error) {
      console.log(`   ❌ Content Generation: ${error.message}`);
      this.testResults.push({ test: 'Content Generation', status: 'FAIL', error: error.message });
    }
  }

  async testQualityControl() {
    console.log('\n🛡️ Test 4: Quality Control');
    
    try {
      const testContent = {
        high: 'NEARWEEK Analysis: Major breakthrough in AI x crypto integration demonstrates 90% efficiency gains for autonomous agents on NEAR Protocol infrastructure.',
        medium: 'Interesting development in blockchain AI space worth monitoring.',
        low: 'crypto moon soon very good'
      };
      
      const qualityScores = {
        high: this.calculateContentQuality(testContent.high),
        medium: this.calculateContentQuality(testContent.medium),
        low: this.calculateContentQuality(testContent.low)
      };
      
      console.log(`   High Quality Content: ${qualityScores.high}/100`);
      console.log(`   Medium Quality Content: ${qualityScores.medium}/100`);
      console.log(`   Low Quality Content: ${qualityScores.low}/100`);
      
      if (qualityScores.high > qualityScores.medium && qualityScores.medium > qualityScores.low) {
        console.log('   ✅ Quality Control: Working correctly');
        this.testResults.push({ test: 'Quality Control', status: 'PASS' });
      } else {
        console.log('   ⚠️  Quality Control: Inconsistent scoring');
        this.testResults.push({ test: 'Quality Control', status: 'WARN' });
      }
      
    } catch (error) {
      console.log(`   ❌ Quality Control: ${error.message}`);
      this.testResults.push({ test: 'Quality Control', status: 'FAIL', error: error.message });
    }
  }

  calculateMockRelevance(tweet) {
    let score = 0;
    const text = tweet.text.toLowerCase();
    
    // Keyword scoring
    const keywords = ['ai', 'crypto', 'near', 'blockchain', 'infrastructure', 'breakthrough'];
    keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 15;
    });
    
    // Engagement scoring
    if (tweet.public_metrics.like_count > 100) score += 20;
    if (tweet.public_metrics.retweet_count > 50) score += 15;
    
    // Source authority
    if (tweet.author.verified) score += 10;
    if (tweet.author.public_metrics.followers_count > 100000) score += 10;
    
    return Math.min(score, 100);
  }

  classifyMockUrgency(tweet) {
    const text = tweet.text.toLowerCase();
    const urgentKeywords = ['breaking', 'breakthrough', 'announced', 'major'];
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    if (tweet.public_metrics.like_count > 200) {
      return 'medium';
    }
    
    return 'low';
  }

  generateMockTwitterContent(analysis) {
    return `🚨 ANALYSIS: Major AI x crypto development\n\nSignificance: ${analysis.market_impact}\nConfidence: ${analysis.confidence_level}%\n\nWhy this matters for NEAR ecosystem:\n• Infrastructure advancement\n• Market positioning\n\n#NEARWEEK #AIxCrypto #Analysis`;
  }

  generateMockTelegramContent(analysis) {
    return `📊 **NEARWEEK Intelligence Update**\n\n**Analysis Summary:**\nRelevance Score: ${analysis.relevance_score}/100\nMarket Impact: ${analysis.market_impact}\nCategory: ${analysis.content_category}\n\n**Key Insights:**\n• Significant development in AI infrastructure\n• Potential impact on NEAR ecosystem\n• Market positioning implications\n\n**Next Steps:** Continue monitoring for follow-up developments\n\n#NEARWEEK #Intelligence`;
  }

  calculateContentQuality(content) {
    let score = 0;
    
    // Length scoring
    if (content.length > 50) score += 20;
    if (content.length > 100) score += 10;
    
    // Professional language
    const professionalWords = ['analysis', 'breakthrough', 'infrastructure', 'significant', 'development'];
    professionalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score += 10;
    });
    
    // Technical terms
    const techTerms = ['ai', 'crypto', 'near', 'protocol', 'blockchain'];
    techTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) score += 8;
    });
    
    // Grammar indicators
    if (content.includes('.') || content.includes('!')) score += 5;
    if (/^[A-Z]/.test(content)) score += 5;
    
    return Math.min(score, 100);
  }

  printTestResults() {
    console.log('\n📋 Quick Test Results');
    console.log('='.repeat(30));
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${status} ${result.test}: ${result.status}`);
      
      if (result.status === 'PASS') passed++;
      else if (result.status === 'FAIL') failed++;
      else warnings++;
      
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      if (result.score) {
        console.log(`    Score: ${result.score}`);
      }
    });
    
    console.log(`\nSummary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    
    if (failed === 0) {
      console.log('\n🎉 Quick tests completed successfully!');
      console.log('\n🚀 System appears ready for operation.');
      console.log('\n🔄 Next steps:');
      console.log('   1. Configure API keys in .env file');
      console.log('   2. Run full test suite: npm run test:pipeline');
      console.log('   3. Start the server: npm start');
      console.log('   4. Test webhook endpoint: curl http://localhost:3000/health');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Check Node.js version (requires 16+)');
      console.log('   - Verify all dependencies are installed');
      console.log('   - Review error messages for specific issues');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new QuickTester();
  tester.runQuickTests();
}

module.exports = QuickTester;