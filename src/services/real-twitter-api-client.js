const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');

class RealTwitterAPIClient {
    constructor() {
        this.client = null;
        this.readOnlyClient = null;
        this.rateLimitTracker = {
            requests: 0,
            resetTime: Date.now() + (15 * 60 * 1000), // 15 minutes
            monthlyRequests: 0,
            monthlyResetTime: this.getMonthlyResetTime()
        };
        this.requestDelay = parseInt(process.env.TWITTER_RATE_LIMIT_DELAY) || 2000;
        this.monthlyLimit = parseInt(process.env.TWITTER_FREE_TIER_MONTHLY_LIMIT) || 1500;
    }

    initialize() {
        if (!process.env.TWITTER_ENABLE_REAL_API || process.env.TWITTER_ENABLE_REAL_API !== 'true') {
            throw new Error('Real Twitter API is disabled. Set TWITTER_ENABLE_REAL_API=true to enable.');
        }

        // Validate required environment variables
        const requiredVars = [
            'TWITTER_API_KEY',
            'TWITTER_API_SECRET', 
            'TWITTER_BEARER_TOKEN'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName] === 'your_bearer_token_here');
        
        if (missingVars.length > 0) {
            throw new Error(`Missing required Twitter API environment variables: ${missingVars.join(', ')}`);
        }

        try {
            // Initialize with Bearer Token for read-only access (recommended for free tier)
            this.readOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
            
            // Optional: Initialize full client if access tokens are provided
            if (process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_TOKEN_SECRET && 
                process.env.TWITTER_ACCESS_TOKEN !== 'your_access_token_here') {
                this.client = new TwitterApi({
                    appKey: process.env.TWITTER_API_KEY,
                    appSecret: process.env.TWITTER_API_SECRET,
                    accessToken: process.env.TWITTER_ACCESS_TOKEN,
                    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
                });
            }

            console.log('✅ Twitter API client initialized successfully');
            console.log(`📊 Monthly limit: ${this.monthlyLimit} requests`);
            console.log(`⏱️  Rate limit delay: ${this.requestDelay}ms between requests`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Twitter API client:', error.message);
            throw error;
        }
    }

    getMonthlyResetTime() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.getTime();
    }

    async checkRateLimits() {
        const now = Date.now();
        
        // Reset 15-minute window if needed
        if (now >= this.rateLimitTracker.resetTime) {
            this.rateLimitTracker.requests = 0;
            this.rateLimitTracker.resetTime = now + (15 * 60 * 1000);
        }

        // Reset monthly counter if needed
        if (now >= this.rateLimitTracker.monthlyResetTime) {
            this.rateLimitTracker.monthlyRequests = 0;
            this.rateLimitTracker.monthlyResetTime = this.getMonthlyResetTime();
        }

        // Check limits
        if (this.rateLimitTracker.monthlyRequests >= this.monthlyLimit) {
            throw new Error(`Monthly API limit reached (${this.monthlyLimit} requests). Resets: ${new Date(this.rateLimitTracker.monthlyResetTime).toLocaleDateString()}`);
        }

        if (this.rateLimitTracker.requests >= 300) { // Conservative limit for 15-minute window
            const waitTime = this.rateLimitTracker.resetTime - now;
            throw new Error(`Rate limit reached. Wait ${Math.ceil(waitTime / 1000)} seconds before next request.`);
        }

        return true;
    }

    async makeRequest(requestFn) {
        await this.checkRateLimits();
        
        try {
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, this.requestDelay));
            
            const result = await requestFn();
            
            // Track request
            this.rateLimitTracker.requests++;
            this.rateLimitTracker.monthlyRequests++;
            
            console.log(`📊 API Usage: ${this.rateLimitTracker.requests}/300 (15min), ${this.rateLimitTracker.monthlyRequests}/${this.monthlyLimit} (monthly)`);
            
            return result;
        } catch (error) {
            if (error.code === 429) {
                console.error('⚠️ Rate limit exceeded by Twitter API');
                throw new Error('Twitter API rate limit exceeded. Please wait before making more requests.');
            }
            throw error;
        }
    }

    async testConnection() {
        if (!this.readOnlyClient) {
            throw new Error('Twitter API client not initialized');
        }

        return await this.makeRequest(async () => {
            const me = await this.readOnlyClient.v2.me();
            return {
                success: true,
                user: me.data,
                rate_limit_status: this.rateLimitTracker
            };
        });
    }

    async getUserByUsername(username) {
        if (!this.readOnlyClient) {
            throw new Error('Twitter API client not initialized');
        }

        const cleanUsername = username.replace('@', '');
        
        return await this.makeRequest(async () => {
            const user = await this.readOnlyClient.v2.userByUsername(cleanUsername, {
                'user.fields': ['id', 'name', 'username', 'verified', 'verified_type', 'public_metrics', 'description']
            });
            
            return user.data;
        });
    }

    async getUserTweets(userId, options = {}) {
        if (!this.readOnlyClient) {
            throw new Error('Twitter API client not initialized');
        }

        const {
            max_results = 10,
            exclude = ['retweets', 'replies'],
            'tweet.fields': tweetFields = ['id', 'text', 'created_at', 'author_id', 'public_metrics', 'context_annotations', 'entities'],
            'user.fields': userFields = ['id', 'name', 'username', 'verified'],
            expansions = ['author_id']
        } = options;

        return await this.makeRequest(async () => {
            const tweets = await this.readOnlyClient.v2.userTimeline(userId, {
                max_results: Math.min(max_results, 100), // API max is 100
                exclude,
                'tweet.fields': tweetFields,
                'user.fields': userFields,
                expansions
            });
            
            return tweets;
        });
    }

    async searchRecentTweets(query, options = {}) {
        if (!this.readOnlyClient) {
            throw new Error('Twitter API client not initialized');
        }

        const {
            max_results = 10,
            'tweet.fields': tweetFields = ['id', 'text', 'created_at', 'author_id', 'public_metrics', 'context_annotations'],
            'user.fields': userFields = ['id', 'name', 'username', 'verified'],
            expansions = ['author_id']
        } = options;

        return await this.makeRequest(async () => {
            const tweets = await this.readOnlyClient.v2.search(query, {
                max_results: Math.min(max_results, 100),
                'tweet.fields': tweetFields,
                'user.fields': userFields,
                expansions
            });
            
            return tweets;
        });
    }

    async getMultipleUserTweets(usernames, options = {}) {
        const results = [];
        const { max_results_per_user = 5 } = options;
        
        console.log(`🔍 Fetching tweets from ${usernames.length} users...`);
        
        for (const username of usernames) {
            try {
                console.log(`📱 Fetching tweets from ${username}...`);
                
                // Get user info first
                const user = await this.getUserByUsername(username);
                if (!user) {
                    console.log(`⚠️ User ${username} not found`);
                    continue;
                }
                
                // Get user tweets
                const tweets = await this.getUserTweets(user.id, {
                    max_results: max_results_per_user,
                    ...options
                });
                
                const processedTweets = tweets.data?.map(tweet => ({
                    ...tweet,
                    author: user,
                    processed_at: new Date().toISOString()
                })) || [];
                
                results.push({
                    username,
                    user,
                    tweets: processedTweets,
                    count: processedTweets.length
                });
                
                console.log(`✅ ${username}: ${processedTweets.length} tweets fetched`);
                
            } catch (error) {
                console.error(`❌ Error fetching tweets for ${username}:`, error.message);
                results.push({
                    username,
                    error: error.message,
                    tweets: [],
                    count: 0
                });
            }
        }
        
        return results;
    }

    formatTweetForWebhook(tweet, author) {
        return {
            id: tweet.id,
            text: tweet.text,
            author: {
                username: author.username,
                name: author.name,
                verified: author.verified || false,
                id: author.id
            },
            created_at: tweet.created_at,
            public_metrics: tweet.public_metrics || {
                retweet_count: 0,
                like_count: 0,
                reply_count: 0,
                quote_count: 0
            },
            context_annotations: tweet.context_annotations || [],
            entities: tweet.entities || {},
            source_metadata: {
                collection_method: 'real_twitter_api',
                api_version: 'v2',
                collected_at: new Date().toISOString()
            }
        };
    }

    async queryNEAREcosystemHandles(handlesList, options = {}) {
        const { priority_filter = null, max_tweets_per_handle = 5 } = options;
        
        let handlesToQuery = handlesList;
        if (priority_filter) {
            handlesToQuery = handlesList.filter(h => h.priority === priority_filter);
        }
        
        // Limit to prevent exceeding API limits
        const maxHandles = Math.floor(this.monthlyLimit / (max_tweets_per_handle + 1)) - this.rateLimitTracker.monthlyRequests;
        if (handlesToQuery.length > maxHandles) {
            console.log(`⚠️ Limiting to ${maxHandles} handles to stay within API limits`);
            handlesToQuery = handlesToQuery.slice(0, maxHandles);
        }
        
        const usernames = handlesToQuery.map(h => h.handle.replace('@', ''));
        const results = await this.getMultipleUserTweets(usernames, {
            max_results: max_tweets_per_handle
        });
        
        // Format results with handle metadata
        return results.map(result => {
            const handleInfo = handlesToQuery.find(h => h.handle.replace('@', '') === result.username);
            const formattedTweets = result.tweets?.map(tweet => 
                this.formatTweetForWebhook(tweet, result.user)
            ) || [];
            
            return {
                handle_info: handleInfo,
                user_data: result.user,
                tweets: formattedTweets,
                query_metadata: {
                    timestamp: new Date().toISOString(),
                    tweets_count: formattedTweets.length,
                    error: result.error || null
                }
            };
        });
    }

    getRateLimitStatus() {
        return {
            current_15min_requests: this.rateLimitTracker.requests,
            max_15min_requests: 300,
            current_monthly_requests: this.rateLimitTracker.monthlyRequests,
            monthly_limit: this.monthlyLimit,
            next_15min_reset: new Date(this.rateLimitTracker.resetTime).toISOString(),
            next_monthly_reset: new Date(this.rateLimitTracker.monthlyResetTime).toISOString(),
            remaining_requests_15min: 300 - this.rateLimitTracker.requests,
            remaining_requests_monthly: this.monthlyLimit - this.rateLimitTracker.monthlyRequests
        };
    }
}

module.exports = RealTwitterAPIClient;