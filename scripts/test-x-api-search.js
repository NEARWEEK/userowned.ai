#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function testXAPISearch() {
    console.log('🔍 X API Search Diagnostic');
    console.log('==========================');
    
    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    
    console.log('Testing different search approaches...\n');
    
    // Test 1: Basic search without time filter
    console.log('🔍 Test 1: Basic search for "AI" tweets');
    try {
        const result1 = await client.v2.search('AI', { 
            max_results: 10,
            'tweet.fields': ['id', 'text', 'created_at', 'public_metrics']
        });
        
        console.log(`✅ Found ${result1.data?.length || 0} AI tweets`);
        if (result1.data && result1.data[0]) {
            console.log(`   Sample: "${result1.data[0].text.substring(0, 60)}..."`);
        }
    } catch (error) {
        console.log(`❌ Basic search failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Search from specific user without time filter
    console.log('\n🔍 Test 2: Search from @elonmusk (no time filter)');
    try {
        const result2 = await client.v2.search('from:elonmusk', { 
            max_results: 10,
            'tweet.fields': ['id', 'text', 'created_at', 'public_metrics']
        });
        
        console.log(`✅ Found ${result2.data?.length || 0} tweets from @elonmusk`);
        if (result2.data && result2.data[0]) {
            console.log(`   Latest: "${result2.data[0].text.substring(0, 60)}..."`);
            console.log(`   Date: ${new Date(result2.data[0].created_at).toLocaleDateString()}`);
        }
    } catch (error) {
        console.log(`❌ User search failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 3: Recent search with smaller time window
    console.log('\n🔍 Test 3: Recent search (last 24 hours)');
    try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result3 = await client.v2.search('AI OR crypto', { 
            max_results: 10,
            'tweet.fields': ['id', 'text', 'created_at', 'public_metrics'],
            start_time: yesterday.toISOString()
        });
        
        console.log(`✅ Found ${result3.data?.length || 0} recent AI/crypto tweets`);
        if (result3.data && result3.data[0]) {
            console.log(`   Sample: "${result3.data[0].text.substring(0, 60)}..."`);
        }
    } catch (error) {
        console.log(`❌ Time-filtered search failed: ${error.message}`);
        if (error.message.includes('start_time')) {
            console.log('   Note: start_time may require higher API tier');
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 4: Try getting user info first
    console.log('\n🔍 Test 4: Get user info for @elonmusk');
    try {
        const user = await client.v2.userByUsername('elonmusk', {
            'user.fields': ['id', 'name', 'username', 'verified', 'public_metrics']
        });
        
        console.log(`✅ User found: ${user.data.name} (@${user.data.username})`);
        console.log(`   ID: ${user.data.id}`);
        console.log(`   Followers: ${user.data.public_metrics?.followers_count?.toLocaleString()}`);
        
        // Now try timeline
        console.log('\n🔍 Test 4b: Get user timeline');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            const timeline = await client.v2.userTimeline(user.data.id, {
                max_results: 5,
                'tweet.fields': ['id', 'text', 'created_at', 'public_metrics']
            });
            
            console.log(`✅ Timeline: ${timeline.data?.length || 0} tweets`);
            if (timeline.data && timeline.data[0]) {
                console.log(`   Latest: "${timeline.data[0].text.substring(0, 60)}..."`);
                console.log(`   Date: ${new Date(timeline.data[0].created_at).toLocaleDateString()}`);
            }
        } catch (timelineError) {
            console.log(`❌ Timeline failed: ${timelineError.message}`);
        }
        
    } catch (error) {
        console.log(`❌ User lookup failed: ${error.message}`);
    }
    
    console.log('\n📋 Diagnostic Complete');
    console.log('======================');
    console.log('If no tweets are found:');
    console.log('1. API tier may not support historical search');
    console.log('2. Time filters may require elevated access');
    console.log('3. Some accounts may have tweet protection');
    console.log('4. Rate limits may be affecting results');
}

if (require.main === module) {
    testXAPISearch();
}

module.exports = { testXAPISearch };