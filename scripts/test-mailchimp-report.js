#!/usr/bin/env node

/**
 * Test script for Mailchimp weekly analytics report
 * Usage: node scripts/test-mailchimp-report.js [--post]
 */

require('dotenv').config();
const { TemplateEngine } = require('../src/templates');
const { postToTelegram } = require('../src/utils/telegram');
const { createLogger } = require('../src/utils/logger');

const logger = createLogger('test-mailchimp-report');

async function testMailchimpReport() {
  const shouldPost = process.argv.includes('--post');
  
  try {
    logger.info('Testing Mailchimp weekly analytics report');
    
    // Verify required environment variables
    const requiredVars = ['MAILCHIMP_API_KEY', 'MAILCHIMP_LIST_ID'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      logger.error('Missing required environment variables:', missingVars);
      console.error('\n❌ Missing environment variables:', missingVars.join(', '));
      console.error('\nPlease set these in your .env file:');
      missingVars.forEach(v => console.error(`${v}=your_value`));
      process.exit(1);
    }
    
    if (shouldPost && !process.env.TELEGRAM_BOT_TOKEN) {
      console.error('\n❌ TELEGRAM_BOT_TOKEN is required to post to Telegram');
      process.exit(1);
    }
    
    // Create template engine
    const engine = new TemplateEngine();
    
    // Generate the report
    console.log('\n📊 Generating Mailchimp weekly analytics...\n');
    const reportData = await engine.executeTemplate('mailchimp-weekly', {});
    
    // Generate Telegram content
    const template = engine.templates['mailchimp-weekly'];
    const telegramContent = await template.generateTelegram(reportData);
    
    // Display the report
    console.log('Generated Report:');
    console.log('─'.repeat(80));
    console.log(telegramContent.content.replace(/<[^>]*>/g, '')); // Strip HTML for console
    console.log('─'.repeat(80));
    
    // Post to Telegram if requested
    if (shouldPost) {
      console.log('\n📤 Posting to Telegram...');
      
      const chatId = process.env.TELEGRAM_CHAT_ID || '-1001559796949';
      await postToTelegram({
        ...telegramContent,
        chat_id: chatId
      });
      
      console.log('✅ Posted successfully to chat:', chatId);
    } else {
      console.log('\n💡 To post this report to Telegram, run:');
      console.log('   node scripts/test-mailchimp-report.js --post');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    logger.error('Test failed', error);
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('\n⚠️  Check your MAILCHIMP_API_KEY is correct');
      console.error('   Get your API key from: https://mailchimp.com/account/api/');
    }
    
    process.exit(1);
  }
}

// Run the test
testMailchimpReport();