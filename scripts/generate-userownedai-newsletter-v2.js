#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class UserOwnedAINewsletterV2 {
    constructor() {
        this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        this.requestCount = 0;
        this.maxRequests = 150; // Conservative limit
        this.delay = 3000; // 3 seconds between requests
        this.weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    async rateLimitDelay() {
        console.log(`⏱️  Waiting ${this.delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.delay));
        this.requestCount++;
        console.log(`📊 API Usage: ${this.requestCount}/${this.maxRequests}`);
    }

    async searchUserTweets(username, maxResults = 10) {
        try {
            await this.rateLimitDelay();
            
            // Use search with time filter for last week
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const startTime = oneWeekAgo.toISOString();
            
            const query = `from:${username} -is:retweet -is:reply`;
            console.log(`🔍 Searching: ${query} (since ${startTime.split('T')[0]})`);
            
            const result = await this.client.v2.search(query, {
                max_results: Math.min(maxResults, 100),
                'tweet.fields': ['id', 'text', 'created_at', 'author_id', 'public_metrics', 'context_annotations', 'entities'],
                'user.fields': ['id', 'name', 'username', 'verified', 'public_metrics'],
                expansions: ['author_id'],
                start_time: startTime
            });

            const tweets = result.data || [];
            const users = result.includes?.users || [];
            
            console.log(`📅 Found ${tweets.length} tweets from @${username} in last week`);
            
            return {
                tweets,
                users,
                username,
                success: true
            };
            
        } catch (error) {
            console.error(`❌ Error searching tweets for @${username}:`, error.message);
            return {
                tweets: [],
                users: [],
                username,
                success: false,
                error: error.message
            };
        }
    }

    analyzeContent(tweet, author) {
        const text = tweet.text.toLowerCase();
        let relevance = 40;
        
        // High-value keywords
        const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'neural', 'automation', 'agi'];
        const cryptoKeywords = ['crypto', 'blockchain', 'web3', 'defi', 'bitcoin', 'ethereum', 'near', 'solana'];
        const businessKeywords = ['startup', 'funding', 'investment', 'product', 'launch', 'growth', 'market'];
        const techKeywords = ['tech', 'innovation', 'development', 'platform', 'software', 'data', 'api'];
        
        // Score keywords
        aiKeywords.forEach(keyword => text.includes(keyword) && (relevance += 12));
        cryptoKeywords.forEach(keyword => text.includes(keyword) && (relevance += 10));
        businessKeywords.forEach(keyword => text.includes(keyword) && (relevance += 8));
        techKeywords.forEach(keyword => text.includes(keyword) && (relevance += 6));
        
        // Engagement scoring
        const metrics = tweet.public_metrics || {};
        const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);
        
        if (engagement > 500) relevance += 20;
        else if (engagement > 200) relevance += 15;
        else if (engagement > 100) relevance += 10;
        else if (engagement > 50) relevance += 5;
        
        // Content quality
        if (tweet.text.includes('http')) relevance += 8; // Has links
        if (tweet.text.length > 150) relevance += 5; // Substantial content
        if (author.verified) relevance += 10; // Verified account
        
        // Determine categories
        const categories = [];
        if (aiKeywords.some(k => text.includes(k))) categories.push('AI/Tech');
        if (cryptoKeywords.some(k => text.includes(k))) categories.push('Crypto/Web3');
        if (businessKeywords.some(k => text.includes(k))) categories.push('Business');
        if (categories.length === 0) categories.push('General');
        
        return {
            relevance_score: Math.min(relevance, 100),
            engagement_score: engagement,
            categories,
            quality_indicators: {
                has_links: tweet.text.includes('http'),
                substantial_content: tweet.text.length > 150,
                high_engagement: engagement > 100
            }
        };
    }

    generateTweetURL(username, tweetId) {
        return `https://x.com/${username}/status/${tweetId}`;
    }

    async generateNewsletter() {
        console.log('📰 UserOwned.AI Newsletter Generator v2');
        console.log('=======================================');
        console.log('🎯 Curated accounts approach (since following list is private)');
        console.log('📅 Collecting tweets from last 7 days with URLs\n');
        
        // Curated list of high-value AI/crypto/tech accounts
        const targetAccounts = [
            'elonmusk',
            'sama', 
            'VitalikButerin',
            'naval',
            'balajis',
            'karpathy',
            'AndrewYNg'
        ];
        
        console.log(`📱 Monitoring ${targetAccounts.length} curated accounts\n`);
        
        const newsletterContent = [];
        let totalTweetsFound = 0;
        
        for (const username of targetAccounts) {
            console.log(`\n📱 Processing @${username}...`);
            
            const result = await this.searchUserTweets(username, 15);
            
            if (result.success && result.tweets.length > 0) {
                const author = result.users[0] || { 
                    username: username, 
                    name: username, 
                    verified: false 
                };
                
                // Analyze all tweets
                const analyzedTweets = result.tweets.map(tweet => {
                    const analysis = this.analyzeContent(tweet, author);
                    return {
                        ...tweet,
                        author,
                        url: this.generateTweetURL(username, tweet.id),
                        analysis
                    };
                });
                
                // Get top 3 most relevant tweets
                const topTweets = analyzedTweets
                    .sort((a, b) => b.analysis.relevance_score - a.analysis.relevance_score)
                    .slice(0, 3)
                    .filter(tweet => tweet.analysis.relevance_score >= 50); // Quality threshold
                
                if (topTweets.length > 0) {
                    newsletterContent.push({
                        account: author,
                        tweets: topTweets,
                        stats: {
                            total_analyzed: result.tweets.length,
                            selected: topTweets.length,
                            best_score: topTweets[0].analysis.relevance_score,
                            avg_engagement: Math.round(
                                topTweets.reduce((sum, t) => sum + t.analysis.engagement_score, 0) / topTweets.length
                            )
                        }
                    });
                    
                    totalTweetsFound += topTweets.length;
                    console.log(`✅ Selected ${topTweets.length} high-quality tweets (best: ${topTweets[0].analysis.relevance_score}%)`);
                    
                    // Show sample
                    const sample = topTweets[0];
                    console.log(`   Sample: "${sample.text.substring(0, 70)}..."`);
                    console.log(`   URL: ${sample.url}`);
                    console.log(`   Engagement: ${sample.analysis.engagement_score} | Categories: ${sample.analysis.categories.join(', ')}`);
                } else {
                    console.log(`⚠️  No high-quality tweets found (${result.tweets.length} analyzed)`);
                }
            } else {
                console.log(`❌ No tweets found or error occurred`);
            }
        }
        
        // Generate the newsletter
        console.log(`\n📰 Generating newsletter with ${totalTweetsFound} curated tweets...`);
        const newsletter = this.formatNewsletter(newsletterContent);
        
        // Save files
        const newsletterPath = path.join(__dirname, '../reports/userownedai-weekly-newsletter.md');
        const dataPath = path.join(__dirname, '../reports/userownedai-newsletter-data.json');
        
        await fs.mkdir(path.dirname(newsletterPath), { recursive: true });
        await fs.writeFile(newsletterPath, newsletter);
        
        const reportData = {
            generated_at: new Date().toISOString(),
            target_accounts: targetAccounts,
            accounts_with_content: newsletterContent.length,
            total_tweets_curated: totalTweetsFound,
            api_requests_used: this.requestCount,
            content: newsletterContent
        };
        
        await fs.writeFile(dataPath, JSON.stringify(reportData, null, 2));
        
        console.log('\n🎉 Newsletter Generation Complete!');
        console.log('==================================');
        console.log(`📊 Accounts processed: ${newsletterContent.length}/${targetAccounts.length}`);
        console.log(`📝 Total tweets curated: ${totalTweetsFound}`);
        console.log(`🔋 API requests used: ${this.requestCount}/${this.maxRequests}`);
        console.log(`📄 Newsletter: ${newsletterPath}`);
        console.log(`📊 Data: ${dataPath}`);
        
        return { newsletter, content: newsletterContent, stats: reportData };
    }

    formatNewsletter(content) {
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let newsletter = `# 🚀 UserOwned.AI Weekly Newsletter\n`;
        newsletter += `*Generated on ${today}*\n\n`;
        newsletter += `## AI × Crypto Weekly Digest\n\n`;
        newsletter += `Curated highlights from key voices in AI and Web3, featuring the most relevant content from the past week.\n\n`;
        
        if (content.length === 0) {
            newsletter += `*No content available this week due to API limitations or low-quality posts.*\n\n`;
            return newsletter;
        }
        
        // Sort accounts by best content quality
        const sortedContent = content.sort((a, b) => b.stats.best_score - a.stats.best_score);
        
        // Add highlights section
        const allTweets = content.flatMap(acc => acc.tweets);
        const topHighlights = allTweets
            .sort((a, b) => b.analysis.relevance_score - a.analysis.relevance_score)
            .slice(0, 5);
        
        if (topHighlights.length > 0) {
            newsletter += `## 🌟 Top Highlights\n\n`;
            topHighlights.forEach((tweet, index) => {
                const metrics = tweet.public_metrics || {};
                newsletter += `### ${index + 1}. [@${tweet.author.username}](https://x.com/${tweet.author.username})\n`;
                newsletter += `**${tweet.author.name}** ${tweet.author.verified ? '✅' : ''}\n\n`;
                newsletter += `"${tweet.text}"\n\n`;
                newsletter += `**[View Tweet](${tweet.url})**\n`;
                newsletter += `*${metrics.like_count || 0} likes • ${metrics.retweet_count || 0} retweets • Relevance: ${tweet.analysis.relevance_score}%*\n\n`;
                newsletter += `---\n\n`;
            });
        }
        
        // Add by account sections
        newsletter += `## 👥 By Account\n\n`;
        sortedContent.forEach(accountData => {
            const account = accountData.account;
            const stats = accountData.stats;
            
            newsletter += `### [@${account.username}](https://x.com/${account.username}) - ${account.name} ${account.verified ? '✅' : ''}\n`;
            newsletter += `*${stats.selected} selected from ${stats.total_analyzed} tweets • Best score: ${stats.best_score}% • Avg engagement: ${stats.avg_engagement}*\n\n`;
            
            accountData.tweets.forEach((tweet, index) => {
                const metrics = tweet.public_metrics || {};
                const date = new Date(tweet.created_at).toLocaleDateString();
                
                newsletter += `#### ${index + 1}. ${date}\n`;
                newsletter += `"${tweet.text}"\n\n`;
                newsletter += `**[View Tweet](${tweet.url})**\n`;
                newsletter += `*Categories: ${tweet.analysis.categories.join(', ')} • `;
                newsletter += `${metrics.like_count || 0} likes • ${metrics.retweet_count || 0} retweets*\n\n`;
            });
            
            newsletter += `---\n\n`;
        });
        
        // Add summary stats
        const totalTweets = content.reduce((sum, acc) => sum + acc.stats.total_analyzed, 0);
        const selectedTweets = content.reduce((sum, acc) => sum + acc.stats.selected, 0);
        const avgScore = Math.round(allTweets.reduce((sum, tweet) => sum + tweet.analysis.relevance_score, 0) / allTweets.length);
        
        newsletter += `## 📊 This Week's Stats\n\n`;
        newsletter += `- **Accounts Monitored**: ${content.length}\n`;
        newsletter += `- **Tweets Analyzed**: ${totalTweets}\n`;
        newsletter += `- **High-Quality Selected**: ${selectedTweets}\n`;
        newsletter += `- **Selection Rate**: ${((selectedTweets / totalTweets) * 100).toFixed(1)}%\n`;
        newsletter += `- **Average Relevance**: ${avgScore}%\n\n`;
        
        newsletter += `---\n\n`;
        newsletter += `*🤖 Automatically curated using AI relevance scoring*\n`;
        newsletter += `*📧 Subscribe to [UserOwned.AI](https://x.com/userownedai) for more updates*\n`;
        newsletter += `*⚡ Powered by [NEARWEEK](https://nearweek.com) AI Content System*\n`;
        
        return newsletter;
    }
}

async function main() {
    try {
        const generator = new UserOwnedAINewsletterV2();
        const result = await generator.generateNewsletter();
        
        console.log('\n📋 Content Summary:');
        console.log('==================');
        result.content.forEach(account => {
            console.log(`📱 @${account.account.username}: ${account.tweets.length} tweets (best: ${account.stats.best_score}%)`);
        });
        
        console.log('\n✅ Newsletter ready for distribution!');
        
    } catch (error) {
        console.error('\n❌ Generation failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = UserOwnedAINewsletterV2;