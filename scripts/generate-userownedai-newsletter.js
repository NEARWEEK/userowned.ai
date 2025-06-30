#!/usr/bin/env node

const UserOwnedAINewsletterGenerator = require('../src/services/userownedai-newsletter-generator');

async function main() {
    console.log('🚀 UserOwned.AI Newsletter Generator');
    console.log('====================================');
    console.log('📋 Task: Find accounts @userownedai follows and create weekly newsletter');
    console.log('⚡ Using upgraded X API with strict rate limiting');
    console.log('🎯 Target: 7 accounts, last week\'s content, with tweet URLs\n');
    
    try {
        const generator = new UserOwnedAINewsletterGenerator();
        
        console.log('⚠️  Important Notes:');
        console.log('- Following lists may be private (common limitation)');
        console.log('- Using conservative rate limiting for API safety');
        console.log('- Will fallback to curated high-value accounts if needed');
        console.log('- Each account = ~3-4 API requests');
        console.log('');
        
        const result = await generator.generateNewsletter();
        
        console.log('\n🎉 Newsletter Generation Complete!');
        console.log('==================================');
        console.log(`📊 Accounts processed: ${result.newsletterContent.length}`);
        console.log(`🔋 API requests used: ${result.requestsUsed}/200`);
        console.log(`📰 Newsletter saved with tweet URLs and analysis`);
        
        // Show preview of content
        if (result.newsletterContent.length > 0) {
            console.log('\n📋 Content Preview:');
            console.log('==================');
            result.newsletterContent.forEach(account => {
                console.log(`📱 @${account.account.username}: ${account.tweets.length} top tweets`);
                if (account.tweets.length > 0) {
                    const topTweet = account.tweets[0];
                    console.log(`   Best: "${topTweet.text.substring(0, 80)}..."`);
                    console.log(`   Score: ${topTweet.analysis.relevance_score}% | URL: ${topTweet.url}`);
                }
            });
        }
        
        console.log('\n✅ Ready for distribution!');
        
    } catch (error) {
        console.error('\n❌ Newsletter generation failed:', error.message);
        
        if (error.message.includes('Rate limit')) {
            console.log('\n💡 Rate Limit Suggestions:');
            console.log('- Reduce number of accounts monitored');
            console.log('- Increase delay between requests');
            console.log('- Try again later');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            console.log('\n💡 Authentication Suggestions:');
            console.log('- Following lists are often private');
            console.log('- System will use curated account list instead');
            console.log('- Consider using search-based approach');
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };