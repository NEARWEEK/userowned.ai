#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class NEARTwitterMonitor {
    constructor() {
        this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        this.requestCount = 0;
        this.maxRequests = 50; // Conservative limit for free tier
        this.delay = 3000; // 3 seconds between requests
    }

    async loadHandleConfig() {
        const configPath = path.join(__dirname, '../configs/near-ecosystem-handles.json');
        const configData = await fs.readFile(configPath, 'utf8');
        return JSON.parse(configData);
    }

    async waitForRateLimit() {
        console.log(`⏱️  Waiting ${this.delay}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    async searchUserTweets(username, maxResults = 5) {
        if (this.requestCount >= this.maxRequests) {
            throw new Error(`Rate limit reached (${this.maxRequests} requests). Please wait before continuing.`);
        }

        try {
            await this.waitForRateLimit();
            
            // Search for recent tweets from specific user
            const query = `from:${username.replace('@', '')} -is:retweet`;
            console.log(`🔍 Searching: ${query}`);
            
            const tweets = await this.client.v2.search(query, {
                max_results: Math.min(maxResults, 10),
                'tweet.fields': ['id', 'text', 'created_at', 'author_id', 'public_metrics', 'context_annotations'],
                'user.fields': ['id', 'name', 'username', 'verified', 'public_metrics'],
                expansions: ['author_id']
            });

            this.requestCount++;
            console.log(`📊 API Requests used: ${this.requestCount}/${this.maxRequests}`);

            return {
                username,
                tweets: tweets.data || [],
                users: tweets.includes?.users || [],
                meta: tweets.meta,
                success: true
            };

        } catch (error) {
            console.error(`❌ Error searching tweets for ${username}:`, error.message);
            return {
                username,
                tweets: [],
                users: [],
                error: error.message,
                success: false
            };
        }
    }

    async monitorCriticalHandles() {
        console.log('🚀 NEAR Ecosystem Real Twitter Monitor');
        console.log('======================================');
        
        try {
            // Load handle configuration
            const config = await this.loadHandleConfig();
            const ecosystemHandles = config.near_ecosystem_handles;
            
            // Get critical priority handles only (to conserve API calls)
            const criticalHandles = [];
            Object.values(ecosystemHandles).forEach(category => {
                if (Array.isArray(category)) {
                    category.forEach(handle => {
                        if (handle.priority === 'critical' && handle.handle) {
                            criticalHandles.push(handle);
                        }
                    });
                }
            });

            console.log(`🎯 Monitoring ${criticalHandles.length} critical handles`);
            console.log(`📊 API Budget: ${this.maxRequests} requests`);
            
            const results = [];
            
            for (const handleInfo of criticalHandles) {
                console.log(`\n📱 Monitoring: ${handleInfo.handle} (${handleInfo.name})`);
                
                const result = await this.searchUserTweets(handleInfo.handle, 3);
                
                if (result.success && result.tweets.length > 0) {
                    console.log(`✅ Found ${result.tweets.length} tweets`);
                    
                    // Process each tweet
                    const processedTweets = result.tweets.map(tweet => {
                        const author = result.users?.find(u => u.id === tweet.author_id) || {
                            username: handleInfo.handle.replace('@', ''),
                            name: handleInfo.name
                        };

                        return {
                            id: tweet.id,
                            text: tweet.text,
                            created_at: tweet.created_at,
                            author: {
                                username: author.username,
                                name: author.name,
                                verified: author.verified || false
                            },
                            public_metrics: tweet.public_metrics || {},
                            context_annotations: tweet.context_annotations || [],
                            handle_info: handleInfo,
                            relevance_score: this.calculateRelevanceScore(tweet, handleInfo),
                            keywords: this.extractKeywords(tweet.text)
                        };
                    });

                    results.push({
                        handle_info: handleInfo,
                        tweets: processedTweets,
                        query_metadata: {
                            timestamp: new Date().toISOString(),
                            success: true,
                            tweet_count: processedTweets.length
                        }
                    });

                    // Show sample tweet
                    const sample = processedTweets[0];
                    console.log(`   Sample: "${sample.text.substring(0, 80)}..."`);
                    console.log(`   Relevance: ${sample.relevance_score}% | Likes: ${sample.public_metrics.like_count || 0}`);
                    
                } else {
                    console.log(`⚠️ No tweets found or error occurred`);
                    results.push({
                        handle_info: handleInfo,
                        tweets: [],
                        query_metadata: {
                            timestamp: new Date().toISOString(),
                            success: false,
                            error: result.error
                        }
                    });
                }
            }

            // Generate summary
            const summary = this.generateSummary(results);
            console.log('\n📊 MONITORING SUMMARY');
            console.log('=====================');
            console.log(`🔢 Handles monitored: ${results.length}`);
            console.log(`📝 Total tweets collected: ${summary.total_tweets}`);
            console.log(`⭐ High relevance tweets: ${summary.high_relevance_count}`);
            console.log(`📈 Average relevance: ${summary.avg_relevance}%`);
            console.log(`🔋 API requests used: ${this.requestCount}/${this.maxRequests}`);

            // Save results
            const reportPath = path.join(__dirname, '../reports/real-twitter-monitoring-report.json');
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            
            const report = {
                summary,
                results,
                metadata: {
                    generated_at: new Date().toISOString(),
                    api_requests_used: this.requestCount,
                    handles_monitored: results.length,
                    data_source: 'real_twitter_api_v2'
                }
            };

            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n💾 Report saved: ${reportPath}`);

            // Show high-relevance tweets
            if (summary.high_relevance_tweets.length > 0) {
                console.log('\n🌟 HIGH-RELEVANCE TWEETS');
                console.log('========================');
                summary.high_relevance_tweets.slice(0, 5).forEach((tweet, index) => {
                    console.log(`${index + 1}. [${tweet.handle_info.handle}] ${tweet.handle_info.name}`);
                    console.log(`   "${tweet.text.substring(0, 100)}..."`);
                    console.log(`   🎯 Relevance: ${tweet.relevance_score}% | 👍 ${tweet.public_metrics.like_count || 0} likes`);
                    console.log('');
                });
            }

            return report;

        } catch (error) {
            console.error('❌ Monitoring failed:', error.message);
            throw error;
        }
    }

    calculateRelevanceScore(tweet, handleInfo) {
        let score = 50; // Base score
        
        // Handle priority boost
        const priorityBoosts = { critical: 25, high: 15, medium: 10, low: 5 };
        score += priorityBoosts[handleInfo.priority] || 0;
        
        // Keyword detection
        const text = tweet.text.toLowerCase();
        const keywords = {
            ai: ['ai', 'artificial intelligence', 'machine learning', 'neural'],
            crypto: ['crypto', 'blockchain', 'defi', 'web3'],
            near: ['near', 'nearprotocol', 'aurora']
        };
        
        Object.values(keywords).flat().forEach(keyword => {
            if (text.includes(keyword)) score += 5;
        });
        
        // Engagement boost
        const metrics = tweet.public_metrics || {};
        const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0);
        if (engagement > 100) score += 10;
        else if (engagement > 20) score += 5;
        
        return Math.min(score, 100);
    }

    extractKeywords(text) {
        const keywords = [];
        const textLower = text.toLowerCase();
        
        const keywordMap = {
            'AI': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'model'],
            'Crypto': ['crypto', 'cryptocurrency', 'blockchain', 'web3', 'defi'],
            'NEAR': ['near', 'nearprotocol', 'aurora', 'octopus']
        };
        
        Object.keys(keywordMap).forEach(category => {
            keywordMap[category].forEach(keyword => {
                if (textLower.includes(keyword)) {
                    keywords.push({ category, keyword });
                }
            });
        });
        
        return keywords;
    }

    generateSummary(results) {
        const allTweets = results.flatMap(r => r.tweets);
        const highRelevanceTweets = allTweets.filter(t => t.relevance_score >= 70);
        
        return {
            total_tweets: allTweets.length,
            high_relevance_count: highRelevanceTweets.length,
            high_relevance_tweets: highRelevanceTweets.sort((a, b) => b.relevance_score - a.relevance_score),
            avg_relevance: allTweets.length > 0 ? Math.round(allTweets.reduce((sum, t) => sum + t.relevance_score, 0) / allTweets.length) : 0,
            handles_with_data: results.filter(r => r.tweets.length > 0).length
        };
    }
}

async function main() {
    try {
        const monitor = new NEARTwitterMonitor();
        await monitor.monitorCriticalHandles();
        console.log('\n✅ Real Twitter monitoring complete!');
    } catch (error) {
        console.error('❌ Monitoring failed:', error.message);
        
        if (error.message.includes('Rate limit')) {
            console.log('\n💡 Rate Limit Suggestions:');
            console.log('- Wait 15 minutes for rate limit reset');
            console.log('- Consider upgrading to paid X API plan');
            console.log('- Reduce the number of handles monitored');
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = NEARTwitterMonitor;