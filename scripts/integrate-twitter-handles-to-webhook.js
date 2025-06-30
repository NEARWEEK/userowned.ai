#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script to integrate Twitter handle monitoring with existing webhook system
 * Takes high-relevance posts and sends them through the webhook for processing
 */

class TwitterWebhookIntegrator {
    constructor() {
        this.webhookUrl = 'http://localhost:3000/webhook/x-api';
        this.reportPath = path.join(__dirname, '../reports/near-ecosystem-twitter-report.json');
    }

    async loadTwitterReport() {
        try {
            const reportData = await fs.readFile(this.reportPath, 'utf8');
            return JSON.parse(reportData);
        } catch (error) {
            console.error('❌ Failed to load Twitter report:', error.message);
            throw error;
        }
    }

    convertPostToWebhookFormat(post, handleInfo) {
        return {
            id: post.id,
            text: post.text,
            author: {
                username: post.author.username,
                name: post.author.name,
                verified: post.author.verified,
                handle_info: handleInfo
            },
            created_at: post.created_at,
            public_metrics: post.public_metrics,
            edit_history_tweet_ids: [post.id],
            context_annotations: [
                {
                    domain: {
                        id: "65",
                        name: "Interests and Hobbies Vertical",
                        description: "Cryptocurrency, AI, and Blockchain"
                    },
                    entity: {
                        id: "1007360414114435072",
                        name: "NEAR Protocol Ecosystem"
                    }
                }
            ],
            source_metadata: {
                collection_method: 'twitter_handle_monitor',
                relevance_score: post.relevance_score,
                ai_crypto_keywords: post.ai_crypto_keywords,
                handle_priority: handleInfo.priority,
                handle_category: handleInfo.category
            }
        };
    }

    async sendToWebhook(postData) {
        try {
            const response = await axios.post(this.webhookUrl, postData, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'NEARWEEK-TwitterHandleMonitor/1.0'
                },
                timeout: 10000
            });

            return {
                success: true,
                status: response.status,
                response: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.response?.status
            };
        }
    }

    async processHighRelevancePosts(report, options = {}) {
        const { 
            minRelevanceScore = 80, 
            maxPosts = 20, 
            delayBetweenPosts = 2000,
            dryRun = false
        } = options;

        const highRelevancePosts = report.high_relevance_posts
            .filter(post => post.relevance_score >= minRelevanceScore)
            .slice(0, maxPosts);

        console.log(`🎯 Processing ${highRelevancePosts.length} high-relevance posts...`);
        
        const results = [];
        
        for (let i = 0; i < highRelevancePosts.length; i++) {
            const post = highRelevancePosts[i];
            const webhookPayload = this.convertPostToWebhookFormat(post, post.handle_info);
            
            console.log(`📤 [${i + 1}/${highRelevancePosts.length}] Processing: ${post.handle_info.handle}`);
            console.log(`   Text: "${post.text.substring(0, 80)}..."`);
            console.log(`   Relevance: ${post.relevance_score}%`);
            
            if (dryRun) {
                console.log('   🔍 DRY RUN - Would send to webhook');
                results.push({
                    post_id: post.id,
                    handle: post.handle_info.handle,
                    success: true,
                    dry_run: true
                });
            } else {
                const result = await this.sendToWebhook(webhookPayload);
                
                if (result.success) {
                    console.log(`   ✅ Successfully sent to webhook (${result.status})`);
                } else {
                    console.log(`   ❌ Failed to send to webhook: ${result.error}`);
                }
                
                results.push({
                    post_id: post.id,
                    handle: post.handle_info.handle,
                    ...result
                });
            }
            
            // Add delay between requests to avoid overwhelming the webhook
            if (i < highRelevancePosts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenPosts));
            }
        }
        
        return results;
    }

    async generateProcessingSummary(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const dryRun = results.filter(r => r.dry_run).length;
        
        const summary = {
            total_processed: results.length,
            successful: successful,
            failed: failed,
            dry_run: dryRun,
            success_rate: results.length > 0 ? (successful / results.length * 100).toFixed(1) : 0,
            results: results
        };
        
        return summary;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const minRelevance = parseInt(args.find(arg => arg.startsWith('--min-relevance='))?.split('=')[1]) || 80;
    const maxPosts = parseInt(args.find(arg => arg.startsWith('--max-posts='))?.split('=')[1]) || 20;
    
    console.log('🔗 NEAR Ecosystem Twitter → Webhook Integrator');
    console.log('===============================================');
    console.log(`🎯 Min relevance score: ${minRelevance}%`);
    console.log(`📊 Max posts to process: ${maxPosts}`);
    console.log(`🔍 Dry run mode: ${dryRun ? 'ON' : 'OFF'}`);
    console.log('');

    try {
        const integrator = new TwitterWebhookIntegrator();
        
        // Load the Twitter report
        console.log('📋 Loading Twitter monitoring report...');
        const report = await integrator.loadTwitterReport();
        
        console.log(`📊 Report loaded: ${report.summary.total_posts_collected} total posts, ${report.summary.high_relevance_posts} high-relevance`);
        
        // Process high-relevance posts
        const results = await integrator.processHighRelevancePosts(report, {
            minRelevanceScore: minRelevance,
            maxPosts: maxPosts,
            dryRun: dryRun
        });
        
        // Generate summary
        const summary = await integrator.generateProcessingSummary(results);
        
        console.log('\n📊 PROCESSING SUMMARY');
        console.log('=====================');
        console.log(`📤 Total processed: ${summary.total_processed}`);
        console.log(`✅ Successful: ${summary.successful}`);
        console.log(`❌ Failed: ${summary.failed}`);
        console.log(`🔍 Dry run: ${summary.dry_run}`);
        console.log(`📈 Success rate: ${summary.success_rate}%`);
        
        // Show failed posts if any
        if (summary.failed > 0) {
            console.log('\n❌ FAILED POSTS');
            console.log('================');
            results.filter(r => !r.success).forEach(result => {
                console.log(`${result.handle}: ${result.error}`);
            });
        }
        
        // Save integration results
        const integrationResultsPath = path.join(__dirname, '../reports/twitter-webhook-integration-results.json');
        await fs.writeFile(integrationResultsPath, JSON.stringify(summary, null, 2));
        console.log(`\n💾 Integration results saved to: ${integrationResultsPath}`);
        
        if (dryRun) {
            console.log('\n🔍 DRY RUN COMPLETED');
            console.log('Run without --dry-run flag to actually send posts to webhook');
        } else {
            console.log('\n✅ INTEGRATION COMPLETED');
            console.log('Posts have been sent to the webhook for processing and distribution');
        }
        
    } catch (error) {
        console.error('❌ Integration failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TwitterWebhookIntegrator;