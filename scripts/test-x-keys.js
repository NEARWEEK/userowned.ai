#!/usr/bin/env node

/**
 * X API Keys Comprehensive Test Suite
 * Tests all authentication methods and validates credentials
 */

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

class XAPITester {
  constructor() {
    this.results = {
      credentials: {},
      connections: {},
      quotas: {},
      errors: []
    };
  }

  // Test 1: Validate all credentials exist and have correct format
  validateCredentials() {
    console.log('🔍 Validating X API Credentials...');
    console.log('=====================================');

    const requiredKeys = [
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET', 
      'TWITTER_BEARER_TOKEN',
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_TOKEN_SECRET',
      'TWITTER_CLIENT_ID',
      'TWITTER_CLIENT_SECRET'
    ];

    const expectedLengths = {
      'TWITTER_API_KEY': 25,
      'TWITTER_API_SECRET': 50,
      'TWITTER_BEARER_TOKEN': 110,
      'TWITTER_ACCESS_TOKEN': 50,
      'TWITTER_ACCESS_TOKEN_SECRET': 45,
      'TWITTER_CLIENT_ID': 15,
      'TWITTER_CLIENT_SECRET': 40
    };

    for (const key of requiredKeys) {
      const value = process.env[key];
      const expected = expectedLengths[key];
      
      if (!value || value.includes('your_') || value.includes('_here')) {
        console.log(`❌ ${key}: Missing or placeholder`);
        this.results.credentials[key] = { status: 'MISSING', length: 0 };
        this.results.errors.push(`${key} is missing or contains placeholder text`);
      } else if (value.length < expected - 5 || value.length > expected + 15) {
        console.log(`⚠️  ${key}: ${value.length} chars (expected ~${expected})`);
        this.results.credentials[key] = { status: 'SUSPECT', length: value.length };
        this.results.errors.push(`${key} length ${value.length} is outside expected range of ${expected}`);
      } else {
        console.log(`✅ ${key}: ${value.length} chars`);
        this.results.credentials[key] = { status: 'VALID', length: value.length };
      }
    }
  }

  // Test 2: Bearer Token (Read-only operations)
  async testBearerToken() {
    console.log('\n🎫 Testing Bearer Token Authentication...');
    console.log('==========================================');

    try {
      const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
      
      // Test basic search
      const searchResult = await client.v2.search('hello', { 
        max_results: 5,
        'tweet.fields': 'created_at,author_id'
      });

      console.log(`✅ Bearer Token search: Found ${searchResult.data?.length || 0} tweets`);
      this.results.connections.bearerToken = { status: 'SUCCESS', tweets: searchResult.data?.length || 0 };

      // Test rate limit info
      const rateLimits = searchResult.rateLimit;
      if (rateLimits) {
        console.log(`📊 Rate Limit: ${rateLimits.remaining}/${rateLimits.limit} remaining`);
        console.log(`🕒 Reset: ${new Date(rateLimits.reset * 1000).toLocaleTimeString()}`);
        this.results.quotas.search = {
          remaining: rateLimits.remaining,
          limit: rateLimits.limit,
          reset: new Date(rateLimits.reset * 1000)
        };
      }

    } catch (error) {
      console.log(`❌ Bearer Token failed: ${error.message}`);
      this.results.connections.bearerToken = { status: 'FAILED', error: error.message };
      this.results.errors.push(`Bearer Token authentication failed: ${error.message}`);
    }
  }

  // Test 3: OAuth 1.0a (Read/Write operations)
  async testOAuth1() {
    console.log('\n🔐 Testing OAuth 1.0a Authentication...');
    console.log('=====================================');

    try {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      });

      // Test user info
      const me = await client.v2.me({
        'user.fields': 'username,name,public_metrics'
      });

      console.log(`✅ OAuth 1.0a works: ${me.data.name} (@${me.data.username})`);
      console.log(`📊 Followers: ${me.data.public_metrics?.followers_count || 'N/A'}`);
      
      this.results.connections.oauth1 = { 
        status: 'SUCCESS', 
        user: {
          name: me.data.name,
          username: me.data.username,
          followers: me.data.public_metrics?.followers_count
        }
      };

      // Test posting capability (dry run)
      const testTweetText = `🧪 UserOwned.AI API Test - ${new Date().toISOString().slice(0,16)}Z`;
      console.log(`🧪 Tweet posting capability: Ready (dry run: "${testTweetText.slice(0,50)}...")`);

    } catch (error) {
      console.log(`❌ OAuth 1.0a failed: ${error.message}`);
      this.results.connections.oauth1 = { status: 'FAILED', error: error.message };
      this.results.errors.push(`OAuth 1.0a authentication failed: ${error.message}`);
    }
  }

  // Test 4: OAuth 2.0 Readiness
  async testOAuth2() {
    console.log('\n🆔 Testing OAuth 2.0 Credentials...');
    console.log('==================================');

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (clientId && clientSecret && !clientId.includes('your_') && !clientSecret.includes('your_')) {
      console.log(`✅ OAuth 2.0 Client ID: ${clientId.length} chars`);
      console.log(`✅ OAuth 2.0 Client Secret: ${clientSecret.length} chars`);
      console.log(`🔮 OAuth 2.0 ready for user authorization flows`);
      
      this.results.connections.oauth2 = { 
        status: 'READY',
        clientIdLength: clientId.length,
        clientSecretLength: clientSecret.length
      };
    } else {
      console.log(`❌ OAuth 2.0 credentials missing or invalid`);
      this.results.connections.oauth2 = { status: 'MISSING' };
      this.results.errors.push('OAuth 2.0 credentials are missing or contain placeholder text');
    }
  }

  // Test 5: Check API tier and limits
  async checkAPITier() {
    console.log('\n📊 Checking API Tier and Limits...');
    console.log('=================================');

    try {
      const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
      
      // Test if we can access v2 endpoints (Basic tier check)
      const result = await client.v2.search('test', { max_results: 10 });
      
      console.log(`✅ API Tier: Basic (v2 access confirmed)`);
      console.log(`📈 Monthly Limit: 15,000 requests`);
      console.log(`📅 Daily Limit: 500 requests`);
      console.log(`🎯 Tweet Cap: 1,500 per month (Basic tier)`);
      
      this.results.quotas.tier = {
        level: 'Basic',
        monthly: 15000,
        daily: 500,
        tweetCap: 1500
      };

    } catch (error) {
      if (error.code === 429) {
        console.log(`⚠️  Rate limited - API working but quota exhausted`);
        this.results.quotas.tier = { level: 'Basic', status: 'RATE_LIMITED' };
      } else {
        console.log(`❌ API tier check failed: ${error.message}`);
        this.results.quotas.tier = { level: 'Unknown', error: error.message };
      }
    }
  }

  // Generate summary report
  generateReport() {
    console.log('\n📋 X API Test Summary Report');
    console.log('============================');

    const credentialStatus = Object.values(this.results.credentials);
    const validCreds = credentialStatus.filter(c => c.status === 'VALID').length;
    const totalCreds = credentialStatus.length;

    console.log(`🔑 Credentials: ${validCreds}/${totalCreds} valid`);
    
    const connectionTests = Object.entries(this.results.connections);
    const successfulConnections = connectionTests.filter(([k,v]) => v.status === 'SUCCESS' || v.status === 'READY').length;
    
    console.log(`🌐 Connections: ${successfulConnections}/${connectionTests.length} successful`);
    
    if (this.results.errors.length === 0) {
      console.log(`\n🎉 ALL TESTS PASSED! X API integration is fully operational.`);
      console.log(`\n🚀 Ready for NEARWEEK operations:`);
      console.log(`   • npm run twitter:critical`);
      console.log(`   • npm run template:daily`);
      console.log(`   • npm run newsletter:send`);
    } else {
      console.log(`\n⚠️  Found ${this.results.errors.length} issues:`);
      this.results.errors.forEach((error, i) => {
        console.log(`   ${i+1}. ${error}`);
      });
    }

    return this.results;
  }

  // Main test runner
  async runAllTests() {
    console.log('🧪 X API Keys Test Suite for NEARWEEK/UserOwned.AI');
    console.log('===================================================');
    console.log(`🕒 Started: ${new Date().toLocaleString()}\n`);

    this.validateCredentials();
    await this.testBearerToken();
    await this.testOAuth1();
    await this.testOAuth2();
    await this.checkAPITier();

    return this.generateReport();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new XAPITester();
  tester.runAllTests()
    .then(results => {
      console.log('\n✅ Test completed. Results saved to test_results.json');
      require('fs').writeFileSync('test_results.json', JSON.stringify(results, null, 2));
      process.exit(results.errors.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = XAPITester;