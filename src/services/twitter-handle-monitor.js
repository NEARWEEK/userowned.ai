const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class TwitterHandleMonitor {
    constructor() {
        this.handlesConfig = null;
        this.lastFetchTimes = new Map();
        this.rateLimitDelay = 1000; // 1 second between requests
    }

    async initialize() {
        try {
            const configPath = path.join(__dirname, '../../configs/near-ecosystem-handles.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.handlesConfig = JSON.parse(configData);
            console.log(`📱 Loaded ${this.handlesConfig.metadata.total_handles} NEAR ecosystem handles`);
        } catch (error) {
            console.error('❌ Failed to load handles config:', error.message);
            throw error;
        }
    }

    getAllHandles() {
        if (!this.handlesConfig) {
            throw new Error('TwitterHandleMonitor not initialized');
        }

        const allHandles = [];
        const config = this.handlesConfig.near_ecosystem_handles;

        // Collect all handles from different categories
        Object.keys(config).forEach(category => {
            if (Array.isArray(config[category])) {
                config[category].forEach(item => {
                    if (item.handle) {
                        allHandles.push({
                            ...item,
                            category_type: category
                        });
                    }
                });
            }
        });

        return allHandles;
    }

    getHandlesByPriority(priority) {
        return this.getAllHandles().filter(handle => handle.priority === priority);
    }

    getHandlesByCategory(category) {
        return this.getAllHandles().filter(handle => handle.category === category);
    }

    // Mock Twitter API simulation (since we don't have direct API access)
    async simulateTwitterQuery(handle, options = {}) {
        const { limit = 10, includeReplies = false } = options;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

        // Mock recent posts based on handle type and category
        const handleInfo = this.getAllHandles().find(h => h.handle === handle);
        if (!handleInfo) {
            throw new Error(`Handle ${handle} not found in config`);
        }

        const mockPosts = this.generateMockPosts(handleInfo, limit);
        
        console.log(`🐦 Queried ${handle}: ${mockPosts.length} recent posts`);
        
        return {
            handle,
            posts: mockPosts,
            queryTime: new Date().toISOString(),
            metadata: {
                total_posts: mockPosts.length,
                handle_info: handleInfo
            }
        };
    }

    generateMockPosts(handleInfo, limit) {
        const posts = [];
        const baseTime = Date.now();
        
        // Generate realistic mock posts based on category
        const templates = this.getPostTemplatesByCategory(handleInfo.category);
        
        for (let i = 0; i < limit; i++) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            const post = {
                id: `${Date.now()}_${i}`,
                text: template.replace('{PROJECT}', handleInfo.name),
                author: {
                    username: handleInfo.handle.replace('@', ''),
                    name: handleInfo.name,
                    verified: handleInfo.priority === 'critical' || handleInfo.category === 'KOL'
                },
                created_at: new Date(baseTime - (i * 3600000)).toISOString(), // Posts every hour going back
                public_metrics: {
                    retweet_count: Math.floor(Math.random() * 100),
                    like_count: Math.floor(Math.random() * 500),
                    reply_count: Math.floor(Math.random() * 50),
                    quote_count: Math.floor(Math.random() * 25)
                },
                relevance_score: this.calculateRelevanceScore(template, handleInfo),
                ai_crypto_keywords: this.extractKeywords(template)
            };
            posts.push(post);
        }
        
        return posts;
    }

    getPostTemplatesByCategory(category) {
        const templates = {
            'Org': [
                'Exciting updates coming to {PROJECT} ecosystem! 🚀 #NEAR #Web3',
                'New partnership announcement: {PROJECT} collaborating with leading DeFi protocols',
                '{PROJECT} developer tools now support advanced AI integration capabilities',
                'Community update: {PROJECT} reaches new milestone in transaction volume'
            ],
            'KOL': [
                'Thoughts on the future of AI x crypto convergence in the {PROJECT} ecosystem',
                'Just shipped a major update to {PROJECT} - excited to see what builders create',
                'The intersection of AI and blockchain is getting more interesting every day',
                'Building the future of decentralized AI with {PROJECT} infrastructure'
            ],
            'DeFi': [
                '{PROJECT} TVL reaches new all-time high! 📈 #DeFi #NEAR',
                'New yield farming opportunities now live on {PROJECT} protocol',
                '{PROJECT} introduces cross-chain liquidity solutions with zero fees',
                'Major DeFi integration: {PROJECT} now supports advanced trading strategies'
            ],
            'AI': [
                '{PROJECT} AI agents now processing 10M+ requests daily 🤖 #AI #NEAR',
                'Breakthrough in decentralized AI: {PROJECT} enables privacy-preserving ML',
                'New AI model deployment on {PROJECT} achieves 99.9% accuracy',
                '{PROJECT} integrates with leading AI frameworks for seamless development'
            ],
            'L2': [
                '{PROJECT} network processes 100,000+ transactions with sub-second finality',
                'Major scaling milestone: {PROJECT} reduces gas fees by 90%',
                'Cross-chain bridge integration enables seamless {PROJECT} interoperability',
                '{PROJECT} EVM compatibility opens new possibilities for developers'
            ],
            'Builder': [
                'Just deployed a new feature on {PROJECT} - feedback welcome! 🛠️',
                'Working on exciting integrations between AI and DeFi on {PROJECT}',
                'Open source contribution to {PROJECT} ecosystem now available',
                'Developer experience improvements coming to {PROJECT} platform'
            ],
            'Meme': [
                '{PROJECT} to the moon! 🚀🚀🚀 #NEAR #Meme',
                'HODL {PROJECT} through thick and thin 💎🙌',
                '{PROJECT} community strongest in crypto! 💪',
                'When {PROJECT} hits $1? Soon™️ 😉'
            ]
        };

        return templates[category] || templates['Org'];
    }

    calculateRelevanceScore(text, handleInfo) {
        let score = 0;
        
        // Base score from handle priority
        const priorityScores = { 'critical': 90, 'high': 75, 'medium': 60, 'low': 40 };
        score += priorityScores[handleInfo.priority] || 50;
        
        // AI keywords
        const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'neural', 'model'];
        const cryptoKeywords = ['crypto', 'blockchain', 'defi', 'near', 'web3', 'smart contract'];
        
        const textLower = text.toLowerCase();
        aiKeywords.forEach(keyword => {
            if (textLower.includes(keyword)) score += 5;
        });
        cryptoKeywords.forEach(keyword => {
            if (textLower.includes(keyword)) score += 3;
        });
        
        return Math.min(score, 100);
    }

    extractKeywords(text) {
        const keywords = [];
        const textLower = text.toLowerCase();
        
        const keywordMap = {
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'model'],
            'crypto': ['crypto', 'blockchain', 'defi', 'web3', 'smart contract'],
            'near': ['near', 'aurora', 'octopus', 'proximity']
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

    async queryMultipleHandles(handles, options = {}) {
        const results = [];
        const { batchSize = 5, priority = null } = options;
        
        let handlesToQuery = handles;
        if (priority) {
            handlesToQuery = handles.filter(h => h.priority === priority);
        }
        
        console.log(`🔍 Querying ${handlesToQuery.length} handles...`);
        
        // Process in batches to respect rate limits
        for (let i = 0; i < handlesToQuery.length; i += batchSize) {
            const batch = handlesToQuery.slice(i, i + batchSize);
            const batchPromises = batch.map(handleInfo => 
                this.simulateTwitterQuery(handleInfo.handle, options)
            );
            
            try {
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
                
                // Delay between batches
                if (i + batchSize < handlesToQuery.length) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`❌ Batch query failed:`, error.message);
            }
        }
        
        return results;
    }

    async generateNewsReport(queryResults) {
        const highRelevancePosts = [];
        const categorizedPosts = {};
        
        queryResults.forEach(result => {
            result.posts.forEach(post => {
                if (post.relevance_score >= 70) {
                    highRelevancePosts.push({
                        ...post,
                        handle_info: result.metadata.handle_info
                    });
                }
                
                const category = result.metadata.handle_info.category;
                if (!categorizedPosts[category]) {
                    categorizedPosts[category] = [];
                }
                categorizedPosts[category].push(post);
            });
        });
        
        return {
            summary: {
                total_handles_queried: queryResults.length,
                total_posts_collected: queryResults.reduce((sum, r) => sum + r.posts.length, 0),
                high_relevance_posts: highRelevancePosts.length,
                categories_covered: Object.keys(categorizedPosts).length
            },
            high_relevance_posts: highRelevancePosts.slice(0, 20), // Top 20
            categorized_posts: categorizedPosts,
            generated_at: new Date().toISOString()
        };
    }
}

module.exports = TwitterHandleMonitor;