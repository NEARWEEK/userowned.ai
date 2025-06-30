#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class SampleNewsletterGenerator {
    constructor() {
        this.accounts = [
            'elonmusk',
            'sama', 
            'VitalikButerin',
            'naval',
            'balajis',
            'karpathy',
            'AndrewYNg'
        ];
    }

    generateSampleTweets() {
        // Sample data representing what we would get from these accounts
        // This simulates real tweets from the last week
        const sampleData = [
            {
                account: { username: 'elonmusk', name: 'Elon Musk', verified: true },
                tweets: [
                    {
                        id: '1234567890123456781',
                        text: 'AI will change everything. The rate of improvement in LLMs is remarkable. We\'re moving toward AGI faster than most realize.',
                        created_at: '2025-06-29T14:30:00.000Z',
                        public_metrics: { like_count: 45623, retweet_count: 12456, reply_count: 3201 },
                        url: 'https://x.com/elonmusk/status/1234567890123456781',
                        analysis: {
                            relevance_score: 95,
                            categories: ['AI/Tech'],
                            engagement_score: 58280
                        }
                    },
                    {
                        id: '1234567890123456782',
                        text: 'Tesla\'s neural net training is now processing petabytes of real-world driving data. The improvements in autopilot are exponential.',
                        created_at: '2025-06-28T09:15:00.000Z',
                        public_metrics: { like_count: 32156, retweet_count: 8934, reply_count: 2187 },
                        url: 'https://x.com/elonmusk/status/1234567890123456782',
                        analysis: {
                            relevance_score: 88,
                            categories: ['AI/Tech'],
                            engagement_score: 43277
                        }
                    }
                ]
            },
            {
                account: { username: 'sama', name: 'Sam Altman', verified: true },
                tweets: [
                    {
                        id: '1234567890123456783',
                        text: 'The next wave of AI development will be about reasoning and planning. We\'re seeing early signs of genuine problem-solving capabilities.',
                        created_at: '2025-06-29T16:45:00.000Z',
                        public_metrics: { like_count: 28934, retweet_count: 7123, reply_count: 1876 },
                        url: 'https://x.com/sama/status/1234567890123456783',
                        analysis: {
                            relevance_score: 92,
                            categories: ['AI/Tech'],
                            engagement_score: 37933
                        }
                    },
                    {
                        id: '1234567890123456784',
                        text: 'Building AI systems that can safely bootstrap themselves to higher intelligence is the challenge of our generation.',
                        created_at: '2025-06-27T11:20:00.000Z',
                        public_metrics: { like_count: 19756, retweet_count: 5234, reply_count: 1345 },
                        url: 'https://x.com/sama/status/1234567890123456784',
                        analysis: {
                            relevance_score: 89,
                            categories: ['AI/Tech'],
                            engagement_score: 26335
                        }
                    }
                ]
            },
            {
                account: { username: 'VitalikButerin', name: 'Vitalik Buterin', verified: true },
                tweets: [
                    {
                        id: '1234567890123456785',
                        text: 'The intersection of AI and crypto is fascinating. AI agents will need decentralized payment rails and identity systems.',
                        created_at: '2025-06-28T13:30:00.000Z',
                        public_metrics: { like_count: 15678, retweet_count: 4567, reply_count: 987 },
                        url: 'https://x.com/VitalikButerin/status/1234567890123456785',
                        analysis: {
                            relevance_score: 94,
                            categories: ['AI/Tech', 'Crypto/Web3'],
                            engagement_score: 21232
                        }
                    },
                    {
                        id: '1234567890123456786',
                        text: 'Ethereum\'s roadmap increasingly focuses on supporting AI workloads and verifiable computation. The future is programmable.',
                        created_at: '2025-06-26T10:15:00.000Z',
                        public_metrics: { like_count: 12345, retweet_count: 3456, reply_count: 789 },
                        url: 'https://x.com/VitalikButerin/status/1234567890123456786',
                        analysis: {
                            relevance_score: 87,
                            categories: ['Crypto/Web3', 'AI/Tech'],
                            engagement_score: 16590
                        }
                    }
                ]
            },
            {
                account: { username: 'naval', name: 'Naval', verified: true },
                tweets: [
                    {
                        id: '1234567890123456787',
                        text: 'AI is the new electricity. Crypto is the new internet. The combination will create entirely new economic models.',
                        created_at: '2025-06-29T08:00:00.000Z',
                        public_metrics: { like_count: 23456, retweet_count: 6789, reply_count: 1234 },
                        url: 'https://x.com/naval/status/1234567890123456787',
                        analysis: {
                            relevance_score: 91,
                            categories: ['AI/Tech', 'Crypto/Web3', 'Business'],
                            engagement_score: 31479
                        }
                    }
                ]
            },
            {
                account: { username: 'balajis', name: 'Balaji Srinivasan', verified: true },
                tweets: [
                    {
                        id: '1234567890123456788',
                        text: 'The AI x Crypto thesis: AI needs crypto for payments, identity, and coordination. Crypto needs AI for user interfaces and automation.',
                        created_at: '2025-06-27T15:45:00.000Z',
                        public_metrics: { like_count: 18234, retweet_count: 5123, reply_count: 876 },
                        url: 'https://x.com/balajis/status/1234567890123456788',
                        analysis: {
                            relevance_score: 93,
                            categories: ['AI/Tech', 'Crypto/Web3'],
                            engagement_score: 24233
                        }
                    }
                ]
            },
            {
                account: { username: 'karpathy', name: 'Andrej Karpathy', verified: true },
                tweets: [
                    {
                        id: '1234567890123456789',
                        text: 'The transformer architecture continues to surprise. What we thought were limitations are just optimization challenges.',
                        created_at: '2025-06-28T12:00:00.000Z',
                        public_metrics: { like_count: 14567, retweet_count: 3890, reply_count: 567 },
                        url: 'https://x.com/karpathy/status/1234567890123456789',
                        analysis: {
                            relevance_score: 86,
                            categories: ['AI/Tech'],
                            engagement_score: 19024
                        }
                    }
                ]
            },
            {
                account: { username: 'AndrewYNg', name: 'Andrew Ng', verified: true },
                tweets: [
                    {
                        id: '1234567890123456790',
                        text: 'Building AI products requires both technical excellence and deep understanding of user needs. The best AI is invisible to users.',
                        created_at: '2025-06-26T14:30:00.000Z',
                        public_metrics: { like_count: 11234, retweet_count: 2890, reply_count: 445 },
                        url: 'https://x.com/AndrewYNg/status/1234567890123456790',
                        analysis: {
                            relevance_score: 84,
                            categories: ['AI/Tech', 'Business'],
                            engagement_score: 14569
                        }
                    }
                ]
            }
        ];

        return sampleData;
    }

    async generateNewsletter() {
        console.log('📰 UserOwned.AI Newsletter Generator (Sample Data)');
        console.log('================================================');
        console.log('🎯 Creating newsletter with curated sample content');
        console.log('💡 This demonstrates the format you would get with real API data\n');

        const sampleContent = this.generateSampleTweets();
        
        // Generate newsletter
        const newsletter = this.formatNewsletter(sampleContent);
        
        // Calculate stats
        const totalTweets = sampleContent.reduce((sum, acc) => sum + acc.tweets.length, 0);
        const avgScore = Math.round(
            sampleContent.flatMap(acc => acc.tweets)
                .reduce((sum, tweet) => sum + tweet.analysis.relevance_score, 0) / totalTweets
        );
        
        // Save files
        const newsletterPath = path.join(__dirname, '../reports/userownedai-sample-newsletter.md');
        const dataPath = path.join(__dirname, '../reports/userownedai-sample-data.json');
        
        await fs.mkdir(path.dirname(newsletterPath), { recursive: true });
        await fs.writeFile(newsletterPath, newsletter);
        
        const reportData = {
            generated_at: new Date().toISOString(),
            data_type: 'sample_demonstration',
            accounts_processed: sampleContent.length,
            total_tweets: totalTweets,
            average_relevance: avgScore,
            note: 'This is sample data demonstrating the newsletter format. Real implementation would use live X API data.',
            content: sampleContent
        };
        
        await fs.writeFile(dataPath, JSON.stringify(reportData, null, 2));
        
        console.log('🎉 Sample Newsletter Generated!');
        console.log('===============================');
        console.log(`📊 Accounts: ${sampleContent.length}`);
        console.log(`📝 Tweets: ${totalTweets}`);
        console.log(`📈 Avg Relevance: ${avgScore}%`);
        console.log(`📄 Newsletter: ${newsletterPath}`);
        console.log(`📊 Data: ${dataPath}`);
        
        return { newsletter, content: sampleContent, stats: reportData };
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
        
        // Add highlights section
        const allTweets = content.flatMap(acc => acc.tweets);
        const topHighlights = allTweets
            .sort((a, b) => b.analysis.relevance_score - a.analysis.relevance_score)
            .slice(0, 5);
        
        newsletter += `## 🌟 Top Highlights\n\n`;
        topHighlights.forEach((tweet, index) => {
            const metrics = tweet.public_metrics;
            newsletter += `### ${index + 1}. [@${tweet.account.username}](https://x.com/${tweet.account.username})\n`;
            newsletter += `**${tweet.account.name}** ${tweet.account.verified ? '✅' : ''}\n\n`;
            newsletter += `"${tweet.text}"\n\n`;
            newsletter += `**[View Tweet](${tweet.url})**\n`;
            newsletter += `*${metrics.like_count.toLocaleString()} likes • ${metrics.retweet_count.toLocaleString()} retweets • Relevance: ${tweet.analysis.relevance_score}%*\n\n`;
            newsletter += `---\n\n`;
        });
        
        // Add by account sections
        newsletter += `## 👥 By Account\n\n`;
        const sortedContent = content.sort((a, b) => {
            const avgA = a.tweets.reduce((sum, t) => sum + t.analysis.relevance_score, 0) / a.tweets.length;
            const avgB = b.tweets.reduce((sum, t) => sum + t.analysis.relevance_score, 0) / b.tweets.length;
            return avgB - avgA;
        });
        
        sortedContent.forEach(accountData => {
            const account = accountData.account;
            const avgScore = Math.round(accountData.tweets.reduce((sum, t) => sum + t.analysis.relevance_score, 0) / accountData.tweets.length);
            const totalEngagement = accountData.tweets.reduce((sum, t) => sum + t.analysis.engagement_score, 0);
            
            newsletter += `### [@${account.username}](https://x.com/${account.username}) - ${account.name} ${account.verified ? '✅' : ''}\n`;
            newsletter += `*${accountData.tweets.length} tweets • Avg relevance: ${avgScore}% • Total engagement: ${totalEngagement.toLocaleString()}*\n\n`;
            
            accountData.tweets.forEach((tweet, index) => {
                const metrics = tweet.public_metrics;
                const date = new Date(tweet.created_at).toLocaleDateString();
                
                newsletter += `#### ${index + 1}. ${date}\n`;
                newsletter += `"${tweet.text}"\n\n`;
                newsletter += `**[View Tweet](${tweet.url})**\n`;
                newsletter += `*Categories: ${tweet.analysis.categories.join(', ')} • `;
                newsletter += `${metrics.like_count.toLocaleString()} likes • ${metrics.retweet_count.toLocaleString()} retweets*\n\n`;
            });
            
            newsletter += `---\n\n`;
        });
        
        // Add summary stats
        const totalTweets = content.reduce((sum, acc) => sum + acc.tweets.length, 0);
        const avgScore = Math.round(allTweets.reduce((sum, tweet) => sum + tweet.analysis.relevance_score, 0) / allTweets.length);
        const totalEngagement = allTweets.reduce((sum, tweet) => sum + tweet.analysis.engagement_score, 0);
        
        newsletter += `## 📊 This Week's Stats\n\n`;
        newsletter += `- **Accounts Monitored**: ${content.length}\n`;
        newsletter += `- **High-Quality Tweets**: ${totalTweets}\n`;
        newsletter += `- **Average Relevance**: ${avgScore}%\n`;
        newsletter += `- **Total Engagement**: ${totalEngagement.toLocaleString()} interactions\n`;
        newsletter += `- **Top Categories**: AI/Tech, Crypto/Web3, Business\n\n`;
        
        newsletter += `---\n\n`;
        newsletter += `*🤖 Automatically curated using AI relevance scoring*\n`;
        newsletter += `*📧 Subscribe to [UserOwned.AI](https://x.com/userownedai) for more updates*\n`;
        newsletter += `*⚡ Powered by [NEARWEEK](https://nearweek.com) AI Content System*\n\n`;
        newsletter += `**🔗 All Tweet Links:**\n`;
        allTweets.forEach((tweet, index) => {
            newsletter += `${index + 1}. [${tweet.account.username} - ${new Date(tweet.created_at).toLocaleDateString()}](${tweet.url})\n`;
        });
        
        return newsletter;
    }
}

async function main() {
    try {
        const generator = new SampleNewsletterGenerator();
        const result = await generator.generateNewsletter();
        
        console.log('\n📋 Sample Newsletter Preview:');
        console.log('============================');
        result.content.forEach(account => {
            console.log(`📱 @${account.account.username}: ${account.tweets.length} tweets`);
            account.tweets.forEach(tweet => {
                console.log(`   "${tweet.text.substring(0, 60)}..." (${tweet.analysis.relevance_score}%)`);
                console.log(`   ${tweet.url}`);
            });
        });
        
        console.log('\n✅ Newsletter ready! This shows the format you\'d get with real API data.');
        
    } catch (error) {
        console.error('\n❌ Generation failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SampleNewsletterGenerator;