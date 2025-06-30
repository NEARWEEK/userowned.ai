#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function checkQuotaStatus() {
    console.log('📊 X API Quota Status Check');
    console.log('============================');
    
    try {
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        
        console.log('🔍 Testing minimal API call...');
        
        // Try the smallest possible request
        try {
            const result = await client.v2.search('hello', { 
                max_results: 10,
                'tweet.fields': ['id']
            });
            
            console.log('✅ API QUOTA AVAILABLE!');
            console.log(`📝 Found ${result.data?.length || 0} tweets`);
            console.log('🎯 Ready to monitor NEAR ecosystem handles');
            
            // Test with NEAR-specific search
            console.log('\n🔍 Testing NEAR Protocol search...');
            const nearResult = await client.v2.search('NEAR Protocol', {
                max_results: 5,
                'tweet.fields': ['id', 'text', 'public_metrics']
            });
            
            console.log(`📱 Found ${nearResult.data?.length || 0} NEAR Protocol tweets`);
            if (nearResult.data && nearResult.data.length > 0) {
                console.log(`Sample: "${nearResult.data[0].text.substring(0, 80)}..."`);
            }
            
            return true;
            
        } catch (error) {
            if (error.code === 429) {
                console.log('❌ QUOTA EXCEEDED');
                console.log('⏰ Rate limit active - need to wait');
                
                // Try to get rate limit headers if available
                if (error.rateLimit) {
                    const resetTime = new Date(error.rateLimit.reset * 1000);
                    console.log(`🔄 Rate limit resets: ${resetTime.toLocaleString()}`);
                    console.log(`⏱️  Wait time: ${Math.ceil((resetTime - Date.now()) / 1000 / 60)} minutes`);
                }
                
                return false;
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking quota:', error.message);
        return false;
    }
}

async function suggestNextSteps() {
    console.log('\n💡 NEXT STEPS BASED ON QUOTA STATUS:');
    console.log('====================================');
    
    const quotaAvailable = await checkQuotaStatus();
    
    if (quotaAvailable) {
        console.log('\n🎯 QUOTA AVAILABLE - READY TO MONITOR!');
        console.log('=====================================');
        console.log('✅ Run real Twitter monitoring now:');
        console.log('   npm run twitter:real');
        console.log('');
        console.log('✅ Focus on critical handles to conserve quota:');
        console.log('   npm run twitter:critical');
        console.log('');
        console.log('✅ Monitor specific handles:');
        console.log('   node scripts/query-near-ecosystem-handles-real.js');
        
    } else {
        console.log('\n⏰ QUOTA EXHAUSTED - WAIT OR USE ALTERNATIVES');
        console.log('=============================================');
        console.log('🔄 Options while waiting:');
        console.log('   1. Use mock system: npm run twitter:mock');
        console.log('   2. Wait for quota reset (usually 15 minutes for search)');
        console.log('   3. Try again in 1 hour');
        console.log('   4. Use existing Zapier webhook system');
        console.log('');
        console.log('💰 Or upgrade to Basic plan ($100/month) for 10,000 tweets/month');
    }
    
    console.log('\n📋 FREE TIER LIMITS REMINDER:');
    console.log('=============================');
    console.log('📊 Monthly: 1,500 tweet cap');
    console.log('⏱️  Rate: 300 requests per 15-min window');
    console.log('🎯 Recommendation: Monitor 4-5 critical handles only');
    console.log('📈 Each handle query = ~2-3 API requests');
}

if (require.main === module) {
    suggestNextSteps();
}

module.exports = { checkQuotaStatus };