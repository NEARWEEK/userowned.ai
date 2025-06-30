#!/usr/bin/env node

const TwitterHandleMonitor = require('../src/services/twitter-handle-monitor');
const fs = require('fs').promises;
const path = require('path');

async function main() {
    console.log('🚀 NEAR Ecosystem Twitter Handle Monitor');
    console.log('=========================================');
    
    try {
        // Initialize monitor
        const monitor = new TwitterHandleMonitor();
        await monitor.initialize();
        
        // Get all handles
        const allHandles = monitor.getAllHandles();
        console.log(`📊 Total handles loaded: ${allHandles.length}`);
        
        // Show breakdown by priority
        const priorityBreakdown = {};
        allHandles.forEach(handle => {
            priorityBreakdown[handle.priority] = (priorityBreakdown[handle.priority] || 0) + 1;
        });
        console.log('📈 Priority breakdown:', priorityBreakdown);
        
        // Show breakdown by category
        const categoryBreakdown = {};
        allHandles.forEach(handle => {
            categoryBreakdown[handle.category] = (categoryBreakdown[handle.category] || 0) + 1;
        });
        console.log('🏷️  Category breakdown:', categoryBreakdown);
        
        console.log('\n🔍 Starting Twitter handle queries...\n');
        
        // Query critical priority handles first
        console.log('⚡ Querying CRITICAL priority handles...');
        const criticalHandles = monitor.getHandlesByPriority('critical');
        const criticalResults = await monitor.queryMultipleHandles(criticalHandles, { limit: 15 });
        
        // Query high priority handles
        console.log('🔥 Querying HIGH priority handles...');
        const highHandles = monitor.getHandlesByPriority('high');
        const highResults = await monitor.queryMultipleHandles(highHandles, { limit: 10 });
        
        // Query medium priority handles (limited to save time)
        console.log('📊 Querying MEDIUM priority handles (sample)...');
        const mediumHandles = monitor.getHandlesByPriority('medium').slice(0, 8);
        const mediumResults = await monitor.queryMultipleHandles(mediumHandles, { limit: 8 });
        
        // Combine all results
        const allResults = [...criticalResults, ...highResults, ...mediumResults];
        
        console.log('\n📋 Generating news report...');
        const newsReport = await monitor.generateNewsReport(allResults);
        
        // Display summary
        console.log('\n📊 QUERY RESULTS SUMMARY');
        console.log('========================');
        console.log(`🔢 Total handles queried: ${newsReport.summary.total_handles_queried}`);
        console.log(`📝 Total posts collected: ${newsReport.summary.total_posts_collected}`);
        console.log(`⭐ High relevance posts: ${newsReport.summary.high_relevance_posts}`);
        console.log(`🏷️  Categories covered: ${newsReport.summary.categories_covered}`);
        
        // Show top high-relevance posts
        console.log('\n🌟 TOP HIGH-RELEVANCE POSTS');
        console.log('============================');
        newsReport.high_relevance_posts.slice(0, 10).forEach((post, index) => {
            console.log(`${index + 1}. [${post.handle_info.handle}] ${post.handle_info.name}`);
            console.log(`   "${post.text}"`);
            console.log(`   ⚡ Relevance: ${post.relevance_score}% | 👍 Likes: ${post.public_metrics.like_count} | 🔄 Retweets: ${post.public_metrics.retweet_count}`);
            console.log(`   🏷️  Keywords: ${post.ai_crypto_keywords.map(k => k.keyword).join(', ')}`);
            console.log('');
        });
        
        // Category breakdown
        console.log('📊 POSTS BY CATEGORY');
        console.log('====================');
        Object.keys(newsReport.categorized_posts).forEach(category => {
            const posts = newsReport.categorized_posts[category];
            const avgRelevance = posts.reduce((sum, p) => sum + p.relevance_score, 0) / posts.length;
            console.log(`${category}: ${posts.length} posts (avg relevance: ${avgRelevance.toFixed(1)}%)`);
        });
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../reports/near-ecosystem-twitter-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(newsReport, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);
        
        // Generate news articles from high-relevance content
        console.log('\n📰 GENERATING NEWS CONTENT');
        console.log('===========================');
        
        const newsArticles = generateNewsArticles(newsReport.high_relevance_posts.slice(0, 5));
        newsArticles.forEach((article, index) => {
            console.log(`\n📰 NEWS ARTICLE ${index + 1}`);
            console.log('─'.repeat(50));
            console.log(`TITLE: ${article.title}`);
            console.log(`CATEGORY: ${article.category}`);
            console.log(`CONTENT: ${article.content}`);
            console.log(`SOURCE: ${article.source_handle} (${article.source_name})`);
            console.log(`RELEVANCE: ${article.relevance_score}%`);
        });
        
        // Save news articles
        const articlesPath = path.join(__dirname, '../reports/near-ecosystem-news-articles.json');
        await fs.writeFile(articlesPath, JSON.stringify(newsArticles, null, 2));
        console.log(`\n💾 News articles saved to: ${articlesPath}`);
        
        console.log('\n✅ NEAR Ecosystem Twitter monitoring complete!');
        console.log(`🎯 Ready to process ${newsReport.summary.high_relevance_posts} high-relevance posts for news generation`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function generateNewsArticles(highRelevancePosts) {
    return highRelevancePosts.map(post => {
        const category = post.handle_info.category;
        const title = generateTitle(post, category);
        const content = generateContent(post, category);
        
        return {
            title,
            category,
            content,
            source_handle: post.handle_info.handle,
            source_name: post.handle_info.name,
            original_post: post.text,
            relevance_score: post.relevance_score,
            engagement_metrics: post.public_metrics,
            keywords: post.ai_crypto_keywords,
            generated_at: new Date().toISOString()
        };
    });
}

function generateTitle(post, category) {
    const templates = {
        'Org': `${post.handle_info.name} Announces Major Ecosystem Update`,
        'KOL': `${post.handle_info.name} Shares Insights on AI x Crypto Future`,
        'DeFi': `${post.handle_info.name} Reaches New DeFi Milestone`,
        'AI': `${post.handle_info.name} Advances Decentralized AI Capabilities`,
        'L2': `${post.handle_info.name} Achieves Scaling Breakthrough`,
        'Builder': `${post.handle_info.name} Ships New Developer Features`
    };
    
    return templates[category] || `${post.handle_info.name} Makes Important Announcement`;
}

function generateContent(post, category) {
    const baseContent = `${post.handle_info.name} recently shared important updates regarding their ${category.toLowerCase()} initiatives. `;
    
    const contextualContent = {
        'Org': 'This development represents a significant step forward for the NEAR ecosystem and demonstrates continued innovation in the blockchain space.',
        'KOL': 'These insights from a key industry leader provide valuable perspective on the evolving AI and cryptocurrency landscape.',
        'DeFi': 'This milestone reflects growing adoption and trust in decentralized finance solutions built on NEAR Protocol.',
        'AI': 'This advancement in AI technology showcases the potential for decentralized artificial intelligence applications.',
        'L2': 'This scaling solution addresses key infrastructure challenges and improves user experience across the ecosystem.',
        'Builder': 'These developer-focused improvements will enhance the building experience and accelerate ecosystem growth.'
    };
    
    const engagement = post.public_metrics.like_count + post.public_metrics.retweet_count;
    const engagementNote = engagement > 100 ? ' The announcement has generated significant community engagement and discussion.' : '';
    
    return baseContent + (contextualContent[category] || 'This update provides important information for the NEAR community.') + engagementNote;
}

if (require.main === module) {
    main();
}

module.exports = { main };