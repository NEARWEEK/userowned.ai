#!/usr/bin/env node

const RealTwitterAPIClient = require('../src/services/real-twitter-api-client');
require('dotenv').config();

async function testTwitterAPIConnection() {
    console.log('🔑 Testing X/Twitter API Connection');
    console.log('===================================');
    
    try {
        // Initialize client
        console.log('📡 Initializing Twitter API client...');
        const client = new RealTwitterAPIClient();
        client.initialize();
        
        // Test 1: Basic connection test
        console.log('\n🔍 Test 1: Basic API Connection');
        console.log('-------------------------------');
        try {
            const connectionTest = await client.testConnection();
            console.log('✅ API Connection: SUCCESS');
            console.log(`👤 Authenticated as: ${connectionTest.user?.name || 'API App'}`);
        } catch (error) {
            console.log('❌ API Connection: FAILED');
            console.log(`   Error: ${error.message}`);
            return;
        }
        
        // Test 2: Rate limit status
        console.log('\n📊 Test 2: Rate Limit Status');
        console.log('-----------------------------');
        const rateLimits = client.getRateLimitStatus();
        console.log(`📈 Monthly Usage: ${rateLimits.current_monthly_requests}/${rateLimits.monthly_limit}`);
        console.log(`⏱️  15-min Window: ${rateLimits.current_15min_requests}/300`);
        console.log(`🔄 Remaining Monthly: ${rateLimits.remaining_requests_monthly}`);
        
        // Test 3: User lookup (test with a known handle)
        console.log('\n👤 Test 3: User Lookup Test');
        console.log('----------------------------');
        try {
            const testUser = await client.getUserByUsername('NEARProtocol');
            console.log('✅ User Lookup: SUCCESS');
            console.log(`   Found: @${testUser.username} (${testUser.name})`);
            console.log(`   Verified: ${testUser.verified ? '✅' : '❌'}`);
            console.log(`   Followers: ${testUser.public_metrics?.followers_count?.toLocaleString() || 'N/A'}`);
        } catch (error) {
            console.log('❌ User Lookup: FAILED');
            console.log(`   Error: ${error.message}`);
        }
        
        // Test 4: Tweet fetching (if we have enough API calls remaining)
        console.log('\n📝 Test 4: Tweet Fetching Test');
        console.log('------------------------------');
        if (rateLimits.remaining_requests_monthly > 10) {
            try {
                const testUser = await client.getUserByUsername('NEARProtocol');
                const tweets = await client.getUserTweets(testUser.id, { max_results: 3 });
                
                console.log('✅ Tweet Fetching: SUCCESS');
                console.log(`   Fetched: ${tweets.data?.length || 0} tweets`);
                
                if (tweets.data && tweets.data.length > 0) {
                    console.log('   Sample tweet:');
                    const sample = tweets.data[0];
                    console.log(`   "${sample.text.substring(0, 80)}..."`);
                    console.log(`   📊 Likes: ${sample.public_metrics?.like_count || 0}, Retweets: ${sample.public_metrics?.retweet_count || 0}`);
                }
            } catch (error) {
                console.log('❌ Tweet Fetching: FAILED');
                console.log(`   Error: ${error.message}`);
            }
        } else {
            console.log('⚠️ Skipping tweet test to preserve API quota');
        }
        
        // Final status
        console.log('\n📋 Final API Status');
        console.log('===================');
        const finalStatus = client.getRateLimitStatus();
        console.log(`🔋 API Quota Used: ${finalStatus.current_monthly_requests}/${finalStatus.monthly_limit} (${((finalStatus.current_monthly_requests/finalStatus.monthly_limit)*100).toFixed(1)}%)`);
        console.log(`⏰ Next Monthly Reset: ${new Date(finalStatus.next_monthly_reset).toLocaleDateString()}`);
        
        if (finalStatus.remaining_requests_monthly > 100) {
            console.log('✅ Ready for NEAR ecosystem monitoring!');
            console.log(`🎯 Estimated handles you can monitor: ${Math.floor(finalStatus.remaining_requests_monthly / 10)}`);
        } else if (finalStatus.remaining_requests_monthly > 20) {
            console.log('⚠️ Limited API quota remaining - monitor critical handles only');
        } else {
            console.log('🔴 Very low API quota - consider upgrading to paid plan');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message.includes('Missing required Twitter API')) {
            console.log('\n📝 SETUP REQUIRED:');
            console.log('1. Copy your X API keys to .env file:');
            console.log('   TWITTER_BEARER_TOKEN=your_actual_bearer_token');
            console.log('   TWITTER_API_KEY=your_actual_api_key');
            console.log('   TWITTER_API_SECRET=your_actual_api_secret');
            console.log('2. Run this test again');
        }
    }
}

if (require.main === module) {
    testTwitterAPIConnection();
}

module.exports = { testTwitterAPIConnection };