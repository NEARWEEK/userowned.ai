#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function diagnoseTwitterAPIIssue() {
    console.log('🔍 X API Diagnostic Tool');
    console.log('=========================');
    
    // Check environment variables
    console.log('\n📋 1. Environment Variables Check');
    console.log('----------------------------------');
    
    const requiredVars = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET', 
        'TWITTER_BEARER_TOKEN',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET'
    ];
    
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value && value !== `your_${varName.toLowerCase().replace('twitter_', '').replace('_', '_')}_here`) {
            console.log(`✅ ${varName}: Present (${value.length} chars)`);
        } else {
            console.log(`❌ ${varName}: Missing or placeholder`);
        }
    });
    
    // Test different authentication methods
    console.log('\n🔑 2. Authentication Method Tests');
    console.log('----------------------------------');
    
    // Test 1: Bearer Token only (App-only auth)
    console.log('\nTest 2a: Bearer Token Authentication');
    try {
        const bearerClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        
        // Try a simple endpoint that doesn't require user context
        const result = await bearerClient.v2.search('hello', { max_results: 10 });
        console.log('✅ Bearer Token: Working');
        console.log(`   Found ${result.data?.length || 0} tweets`);
    } catch (error) {
        console.log('❌ Bearer Token: Failed');
        console.log(`   Error: ${error.message}`);
        if (error.data) {
            console.log(`   Details: ${JSON.stringify(error.data, null, 2)}`);
        }
    }
    
    // Test 2: OAuth 1.0a (User context)
    console.log('\nTest 2b: OAuth 1.0a Authentication');
    try {
        const oauthClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });
        
        const me = await oauthClient.v2.me();
        console.log('✅ OAuth 1.0a: Working');
        console.log(`   Authenticated as: ${me.data.name} (@${me.data.username})`);
    } catch (error) {
        console.log('❌ OAuth 1.0a: Failed');
        console.log(`   Error: ${error.message}`);
        if (error.data) {
            console.log(`   Details: ${JSON.stringify(error.data, null, 2)}`);
        }
    }
    
    // Test 3: API Key validation format
    console.log('\n📝 3. API Key Format Validation');
    console.log('--------------------------------');
    
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
    
    console.log(`API Key length: ${apiKey?.length || 0} (expected: ~25)`);
    console.log(`API Secret length: ${apiSecret?.length || 0} (expected: ~50)`);
    console.log(`Bearer Token length: ${bearerToken?.length || 0} (expected: ~110)`);
    console.log(`Access Token length: ${accessToken?.length || 0} (expected: ~50)`);
    console.log(`Access Secret length: ${accessSecret?.length || 0} (expected: ~45)`);
    
    // Check for common issues
    console.log('\n⚠️  4. Common Issues Check');
    console.log('---------------------------');
    
    if (bearerToken && bearerToken.includes('%')) {
        console.log('✅ Bearer Token appears URL-encoded (correct)');
    } else if (bearerToken) {
        console.log('⚠️ Bearer Token might need URL encoding');
    }
    
    if (apiKey && apiKey.length < 20) {
        console.log('⚠️ API Key seems too short');
    }
    
    if (apiSecret && apiSecret.length < 40) {
        console.log('⚠️ API Secret seems too short');
    }
    
    // Test 4: Simple search with minimal permissions
    console.log('\n🔍 5. Minimal Permission Test');
    console.log('------------------------------');
    
    try {
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        
        // Use the most basic endpoint
        const tweets = await client.v2.search('NEAR Protocol', { 
            max_results: 10,
            'tweet.fields': ['id', 'text']
        });
        
        console.log('✅ Basic search: Working');
        console.log(`   Found ${tweets.data?.length || 0} tweets about NEAR Protocol`);
        
        if (tweets.data && tweets.data.length > 0) {
            console.log(`   Sample: "${tweets.data[0].text.substring(0, 60)}..."`);
        }
        
    } catch (error) {
        console.log('❌ Basic search: Failed');
        console.log(`   Error Code: ${error.code || 'Unknown'}`);
        console.log(`   Error: ${error.message}`);
        
        if (error.code === 403) {
            console.log('\n💡 403 Error Troubleshooting:');
            console.log('   - Check if your X Developer account is approved');
            console.log('   - Verify your app has the correct permissions');
            console.log('   - Ensure you\'re using the correct API keys');
            console.log('   - Check if your app is suspended');
        }
    }
    
    console.log('\n📋 Diagnostic Complete');
    console.log('=======================');
}

if (require.main === module) {
    diagnoseTwitterAPIIssue();
}

module.exports = { diagnoseTwitterAPIIssue };