#!/usr/bin/env node

// X API Keys Test Script - MCP Compatible
// Run this to validate all your X API credentials

require('dotenv').config();

async function testXAPIKeys() {
    console.log('🔑 X API Keys Validation Test (MCP)');
    console.log('===================================');
    
    // Check environment variables
    const requiredKeys = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET', 
        'TWITTER_BEARER_TOKEN',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET',
        'TWITTER_CLIENT_ID',
        'TWITTER_CLIENT_SECRET'
    ];
    
    console.log('\n📋 1. Environment Variables Check:');
    console.log('----------------------------------');
    
    let allKeysPresent = true;
    requiredKeys.forEach(key => {
        const value = process.env[key];
        if (value && value !== `your_${key.toLowerCase()}_here` && value.length > 10) {
            console.log(`✅ ${key}: Present (${value.length} chars)`);
        } else {
            console.log(`❌ ${key}: Missing or placeholder`);
            allKeysPresent = false;
        }
    });
    
    if (!allKeysPresent) {
        console.log('\n⚠️ Some keys are missing. Please update your .env file.');
        return;
    }
    
    // Test Bearer Token (simplest test)
    console.log('\n🧪 2. Testing Bearer Token Authentication:');
    console.log('------------------------------------------');
    
    try {
        const { TwitterApi } = require('twitter-api-v2');
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        
        const result = await client.v2.search('hello world', { 
            max_results: 10,
            'tweet.fields': ['id', 'text', 'author_id']
        });
        
        console.log('✅ Bearer Token: WORKING');
        console.log(`   Found ${result.data?.length || 0} tweets`);
        console.log(`   Rate limit remaining: ${result.rateLimit?.remaining || 'Unknown'}`);
        
    } catch (error) {
        console.log('❌ Bearer Token: FAILED');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code || 'Unknown'}`);
        
        if (error.code === 401) {
            console.log('   → Check if Bearer Token is correct');
        } else if (error.code === 403) {
            console.log('   → Check app permissions and tier access');
        } else if (error.code === 429) {
            console.log('   → Rate limit exceeded, wait 15 minutes');
        }
    }
    
    // Test OAuth 1.0a
    console.log('\n🔐 3. Testing OAuth 1.0a Authentication:');
    console.log('----------------------------------------');
    
    try {
        const { TwitterApi } = require('twitter-api-v2');
        const oauthClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });
        
        const me = await oauthClient.v2.me({
            'user.fields': ['id', 'name', 'username', 'verified', 'public_metrics']
        });
        
        console.log('✅ OAuth 1.0a: WORKING');
        console.log(`   Authenticated as: ${me.data.name} (@${me.data.username})`);
        console.log(`   Verified: ${me.data.verified ? '✅' : '❌'}`);
        console.log(`   Followers: ${me.data.public_metrics?.followers_count?.toLocaleString() || 'N/A'}`);
        
    } catch (error) {
        console.log('❌ OAuth 1.0a: FAILED');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code || 'Unknown'}`);
        
        if (error.code === 401) {
            console.log('   → Check API Key, Secret, Access Token & Secret');
        } else if (error.code === 403) {
            console.log('   → Check app permissions (needs Read+Write for posting)');
        }
    }
    
    // Test user lookup (Basic tier compatible)
    console.log('\n👤 4. Testing User Lookup (Basic Tier):');
    console.log('--------------------------------------');
    
    try {
        const { TwitterApi } = require('twitter-api-v2');
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        
        const user = await client.v2.userByUsername('NEARProtocol', {
            'user.fields': ['id', 'name', 'username', 'verified', 'public_metrics']
        });
        
        console.log('✅ User Lookup: WORKING');
        console.log(`   Found: @${user.data.username} (${user.data.name})`);
        console.log(`   Verified: ${user.data.verified ? '✅' : '❌'}`);
        console.log(`   Followers: ${user.data.public_metrics?.followers_count?.toLocaleString() || 'N/A'}`);
        
    } catch (error) {
        console.log('❌ User Lookup: FAILED');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code || 'Unknown'}`);
    }
    
    // OAuth 2.0 Client validation (format check only)
    console.log('\n🆔 5. OAuth 2.0 Client Credentials Check:');
    console.log('----------------------------------------');
    
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    
    if (clientId && clientId.length >= 15) {
        console.log(`✅ Client ID: Present (${clientId.length} chars)`);
    } else {
        console.log('❌ Client ID: Missing or too short');
    }
    
    if (clientSecret && clientSecret.length >= 40) {
        console.log(`✅ Client Secret: Present (${clientSecret.length} chars)`);
    } else {
        console.log('❌ Client Secret: Missing or too short');
    }
    
    // Final summary
    console.log('\n📊 6. API Tier and Limits Summary:');
    console.log('----------------------------------');
    console.log('🎯 Basic Tier Capabilities:');
    console.log('   ✅ Search tweets (15k/month)');
    console.log('   ✅ User lookups (15k/month)');
    console.log('   ✅ Post tweets (with OAuth 1.0a)');
    console.log('   ✅ Upload media (with OAuth 1.0a)');
    console.log('   ❌ User timelines (Pro+ only)');
    console.log('   ❌ Advanced filtering (Pro+ only)');
    
    console.log('\n⚠️ Basic Tier Limitations:');
    console.log('   • 15,000 requests/month');
    console.log('   • 500 requests/day');
    console.log('   • No user timeline access');
    console.log('   • Limited to search API for user content');
    
    console.log('\n🎉 Test Complete!');
    console.log('=================');
}

// Auto-run if called directly
if (require.main === module) {
    testXAPIKeys().catch(console.error);
}

module.exports = { testXAPIKeys };
