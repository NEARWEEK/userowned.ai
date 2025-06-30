#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Enhanced news content generator from Twitter handle monitoring
 * Creates comprehensive news articles from high-relevance social media posts
 */

class TwitterNewsGenerator {
    constructor() {
        this.reportPath = path.join(__dirname, '../reports/near-ecosystem-twitter-report.json');
        this.templatesPath = path.join(__dirname, '../templates');
    }

    async loadReport() {
        const reportData = await fs.readFile(this.reportPath, 'utf8');
        return JSON.parse(reportData);
    }

    generateNewsHeadline(post, category) {
        const templates = {
            'Org': [
                `${post.handle_info.name} Announces Major Ecosystem Development`,
                `${post.handle_info.name} Unveils Strategic Initiative`,
                `${post.handle_info.name} Shares Key Update on Platform Growth`
            ],
            'KOL': [
                `${post.handle_info.name} Provides Insights on AI x Crypto Convergence`,
                `Industry Leader ${post.handle_info.name} Discusses Future of Web3`,
                `${post.handle_info.name} Weighs In on Blockchain Innovation Trends`
            ],
            'DeFi': [
                `${post.handle_info.name} Protocol Achieves New DeFi Milestone`,
                `${post.handle_info.name} Expands DeFi Capabilities with Latest Update`,
                `${post.handle_info.name} Reports Strong Growth in Decentralized Finance`
            ],
            'AI': [
                `${post.handle_info.name} Advances AI Integration on NEAR`,
                `${post.handle_info.name} Launches Next-Gen AI Features`,
                `${post.handle_info.name} Demonstrates AI x Blockchain Innovation`
            ],
            'L2': [
                `${post.handle_info.name} Achieves Significant Scaling Breakthrough`,
                `${post.handle_info.name} Enhances Network Performance with Latest Upgrade`,
                `${post.handle_info.name} Delivers Major Infrastructure Improvement`
            ],
            'Builder': [
                `${post.handle_info.name} Ships Key Developer Features`,
                `${post.handle_info.name} Contributes Major Open Source Update`,
                `${post.handle_info.name} Enhances Builder Experience with New Tools`
            ]
        };

        const categoryTemplates = templates[category] || templates['Org'];
        return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    }

    extractKeywords(post) {
        const text = post.text.toLowerCase();
        const keywords = [];

        const keywordCategories = {
            'AI': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'model', 'algorithm'],
            'Crypto': ['crypto', 'cryptocurrency', 'blockchain', 'web3', 'defi', 'smart contract'],
            'NEAR': ['near', 'nearprotocol', 'aurora', 'octopus', 'proximity'],
            'Finance': ['tvl', 'yield', 'liquidity', 'trading', 'finance', 'protocol'],
            'Development': ['developer', 'build', 'deploy', 'integration', 'api', 'sdk']
        };

        Object.keys(keywordCategories).forEach(category => {
            keywordCategories[category].forEach(keyword => {
                if (text.includes(keyword)) {
                    keywords.push({ category, keyword });
                }
            });
        });

        return keywords;
    }

    generateNewsContent(post, category) {
        const keywords = this.extractKeywords(post);
        const engagement = post.public_metrics.like_count + post.public_metrics.retweet_count;
        
        let content = `${post.handle_info.name}, ${this.getCategoryDescription(category)}, `;
        
        // Add context based on original post
        if (post.text.includes('milestone') || post.text.includes('achievement')) {
            content += 'recently announced a significant milestone in their ongoing development efforts. ';
        } else if (post.text.includes('partnership') || post.text.includes('collaboration')) {
            content += 'revealed new strategic partnerships that are expected to enhance their platform capabilities. ';
        } else if (post.text.includes('update') || post.text.includes('release')) {
            content += 'shared important updates about their latest platform developments. ';
        } else {
            content += 'provided valuable insights into their current initiatives and future direction. ';
        }

        // Add keyword-based context
        if (keywords.some(k => k.category === 'AI')) {
            content += 'This development represents a significant advancement in the integration of artificial intelligence with blockchain technology, ';
        } else if (keywords.some(k => k.category === 'Crypto')) {
            content += 'This announcement highlights continued innovation in the cryptocurrency and blockchain space, ';
        } else if (keywords.some(k => k.category === 'NEAR')) {
            content += 'This update demonstrates the growing maturity and capabilities of the NEAR Protocol ecosystem, ';
        }

        // Add category-specific context
        const categoryContext = {
            'Org': 'positioning the organization as a key player in driving ecosystem growth and adoption.',
            'KOL': 'offering valuable perspective that could influence industry direction and investor sentiment.',
            'DeFi': 'contributing to the expanding decentralized finance landscape with innovative solutions.',
            'AI': 'showcasing the potential for AI-powered applications in decentralized environments.',
            'L2': 'addressing critical infrastructure needs for improved scalability and user experience.',
            'Builder': 'empowering developers with enhanced tools and capabilities for ecosystem development.'
        };

        content += categoryContext[category] || 'marking an important step forward for the project and its community.';

        // Add engagement context
        if (engagement > 200) {
            content += ' The announcement has generated significant community engagement and discussion across social media platforms.';
        } else if (engagement > 50) {
            content += ' The update has been well-received by the community with positive engagement metrics.';
        }

        // Add market context
        if (post.handle_info.priority === 'critical' || post.relevance_score > 90) {
            content += ' Given the strategic importance of this development, it may have broader implications for the NEAR ecosystem and related projects.';
        }

        return content;
    }

    getCategoryDescription(category) {
        const descriptions = {
            'Org': 'a leading organization in the NEAR Protocol ecosystem',
            'KOL': 'a prominent key opinion leader in blockchain and AI',
            'DeFi': 'a decentralized finance protocol',
            'AI': 'an artificial intelligence project',
            'L2': 'a layer-2 scaling solution',
            'Builder': 'an active ecosystem builder and developer',
            'Developer': 'a developer-focused initiative',
            'Meme': 'a community-driven project'
        };

        return descriptions[category] || 'a project in the NEAR ecosystem';
    }

    calculateNewsWorthiness(post) {
        let score = post.relevance_score;
        
        // Boost for high engagement
        const engagement = post.public_metrics.like_count + post.public_metrics.retweet_count;
        if (engagement > 200) score += 10;
        else if (engagement > 100) score += 5;
        
        // Boost for verified accounts
        if (post.author.verified) score += 5;
        
        // Boost for critical handles
        if (post.handle_info.priority === 'critical') score += 10;
        else if (post.handle_info.priority === 'high') score += 5;
        
        // Keywords boost
        const keywords = this.extractKeywords(post);
        if (keywords.some(k => k.category === 'AI')) score += 5;
        if (keywords.some(k => k.category === 'NEAR')) score += 5;
        
        return Math.min(score, 100);
    }

    async generateNewsDigest(report) {
        const articles = [];
        const highValuePosts = report.high_relevance_posts
            .map(post => ({
                ...post,
                news_worthiness: this.calculateNewsWorthiness(post)
            }))
            .filter(post => post.news_worthiness >= 80)
            .sort((a, b) => b.news_worthiness - a.news_worthiness)
            .slice(0, 15);

        console.log(`📰 Generating news articles from ${highValuePosts.length} high-value posts...`);

        for (const post of highValuePosts) {
            const article = {
                headline: this.generateNewsHeadline(post, post.handle_info.category),
                category: post.handle_info.category,
                content: this.generateNewsContent(post, post.handle_info.category),
                source: {
                    handle: post.handle_info.handle,
                    name: post.handle_info.name,
                    verified: post.author.verified,
                    priority: post.handle_info.priority
                },
                metrics: {
                    relevance_score: post.relevance_score,
                    news_worthiness: post.news_worthiness,
                    engagement: {
                        likes: post.public_metrics.like_count,
                        retweets: post.public_metrics.retweet_count,
                        replies: post.public_metrics.reply_count
                    }
                },
                keywords: this.extractKeywords(post),
                original_post: post.text,
                publication_ready: post.news_worthiness >= 85,
                estimated_reach: this.estimateReach(post),
                generated_at: new Date().toISOString()
            };

            articles.push(article);
        }

        return articles;
    }

    estimateReach(post) {
        const engagement = post.public_metrics.like_count + post.public_metrics.retweet_count;
        const priorityMultiplier = {
            'critical': 5,
            'high': 3,
            'medium': 2,
            'low': 1
        };

        const baseReach = engagement * 10; // Estimate 10x engagement for reach
        const multiplier = priorityMultiplier[post.handle_info.priority] || 1;
        
        return Math.round(baseReach * multiplier);
    }

    generateExecutiveSummary(articles, report) {
        const categories = {};
        let totalEstimatedReach = 0;
        let publicationReady = 0;

        articles.forEach(article => {
            if (!categories[article.category]) {
                categories[article.category] = { count: 0, avg_score: 0, total_score: 0 };
            }
            categories[article.category].count++;
            categories[article.category].total_score += article.metrics.news_worthiness;
            
            totalEstimatedReach += article.estimated_reach;
            if (article.publication_ready) publicationReady++;
        });

        // Calculate averages
        Object.keys(categories).forEach(cat => {
            categories[cat].avg_score = Math.round(categories[cat].total_score / categories[cat].count);
        });

        return {
            total_articles: articles.length,
            publication_ready: publicationReady,
            categories_covered: Object.keys(categories).length,
            category_breakdown: categories,
            estimated_total_reach: totalEstimatedReach,
            avg_news_worthiness: Math.round(articles.reduce((sum, a) => sum + a.metrics.news_worthiness, 0) / articles.length),
            source_handles: articles.length,
            processing_date: new Date().toISOString(),
            original_posts_analyzed: report.summary.total_posts_collected,
            conversion_rate: `${((articles.length / report.summary.total_posts_collected) * 100).toFixed(1)}%`
        };
    }
}

async function main() {
    console.log('📰 NEAR Ecosystem News Generator');
    console.log('=================================');

    try {
        const generator = new TwitterNewsGenerator();
        
        // Load Twitter monitoring report
        console.log('📋 Loading Twitter monitoring data...');
        const report = await generator.loadReport();
        console.log(`📊 Loaded: ${report.summary.total_posts_collected} posts, ${report.summary.high_relevance_posts} high-relevance`);

        // Generate news articles
        const articles = await generator.generateNewsDigest(report);
        
        // Generate executive summary
        const summary = generator.generateExecutiveSummary(articles, report);
        
        console.log('\n📊 NEWS GENERATION SUMMARY');
        console.log('===========================');
        console.log(`📰 Total articles generated: ${summary.total_articles}`);
        console.log(`✅ Publication ready: ${summary.publication_ready}`);
        console.log(`🏷️  Categories covered: ${summary.categories_covered}`);
        console.log(`📈 Average news worthiness: ${summary.avg_news_worthiness}%`);
        console.log(`📡 Estimated total reach: ${summary.estimated_total_reach.toLocaleString()}`);
        console.log(`🔄 Conversion rate: ${summary.conversion_rate}`);

        // Display category breakdown
        console.log('\n📊 CATEGORY BREAKDOWN');
        console.log('=====================');
        Object.keys(summary.category_breakdown).forEach(category => {
            const data = summary.category_breakdown[category];
            console.log(`${category}: ${data.count} articles (avg score: ${data.avg_score}%)`);
        });

        // Show top articles
        console.log('\n🌟 TOP NEWS ARTICLES');
        console.log('====================');
        articles.slice(0, 5).forEach((article, index) => {
            console.log(`\n${index + 1}. ${article.headline}`);
            console.log(`   Category: ${article.category} | Source: ${article.source.handle}`);
            console.log(`   News Worthiness: ${article.metrics.news_worthiness}% | Reach: ${article.estimated_reach.toLocaleString()}`);
            console.log(`   ${article.content.substring(0, 150)}...`);
        });

        // Save results
        const newsDigest = {
            summary,
            articles,
            metadata: {
                generated_at: new Date().toISOString(),
                source_report: 'near-ecosystem-twitter-report.json',
                generator_version: '1.0.0'
            }
        };

        const outputPath = path.join(__dirname, '../reports/near-ecosystem-news-digest.json');
        await fs.writeFile(outputPath, JSON.stringify(newsDigest, null, 2));
        console.log(`\n💾 News digest saved to: ${outputPath}`);

        // Generate publication-ready articles
        const publicationArticles = articles.filter(a => a.publication_ready);
        if (publicationArticles.length > 0) {
            const publicationPath = path.join(__dirname, '../reports/publication-ready-articles.json');
            await fs.writeFile(publicationPath, JSON.stringify(publicationArticles, null, 2));
            console.log(`📝 ${publicationArticles.length} publication-ready articles saved to: ${publicationPath}`);
        }

        console.log('\n✅ NEWS GENERATION COMPLETE');
        console.log(`🎯 Ready to publish ${summary.publication_ready} high-quality news articles`);
        console.log(`📡 Estimated combined reach: ${summary.estimated_total_reach.toLocaleString()} users`);

    } catch (error) {
        console.error('❌ News generation failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TwitterNewsGenerator;