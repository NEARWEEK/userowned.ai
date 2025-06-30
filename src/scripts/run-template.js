/**
 * Template runner script
 * Run a specific template and optionally post to channels
 * 
 * Usage: node src/scripts/run-template.js [template-type] [--post] [--dry-run]
 * 
 * Examples:
 *   node src/scripts/run-template.js daily-ecosystem
 *   node src/scripts/run-template.js weekly-market --post
 *   node src/scripts/run-template.js project-spotlight --dry-run
 */

const { logger, errorHandler, config } = require('../utils');
const { runTemplate } = require('../index');
const FormatTracker = require('../utils/format-tracker');
const axios = require('axios');

// Post content to Telegram
async function postToTelegram(content) {
  const appConfig = config.getConfig();
  const token = process.env.TELEGRAM_BOT_TOKEN || appConfig.apis?.telegram?.token;
  const chatId = process.env.TELEGRAM_CHAT_ID || appConfig.apis?.telegram?.chatId;
  
  if (!token || !chatId) {
    logger.error('Telegram configuration missing');
    return false;
  }
  
  try {
    logger.info('Posting to Telegram', { chatId });
    
    const response = await errorHandler.withRetry(
      async () => {
        return axios.post(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            chat_id: chatId,
            text: content,
            parse_mode: 'Markdown'
          }
        );
      },
      { retries: 3, delay: 1000 }
    );
    
    logger.info('Posted to Telegram successfully', {
      messageId: response.data?.result?.message_id
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to post to Telegram', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

// Post content to X via Zapier webhook
async function postToX(content) {
  const appConfig = config.getConfig();
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL || appConfig.apis?.zapier?.webhookUrl;
  
  if (!webhookUrl) {
    logger.error('Zapier webhook URL missing');
    return false;
  }
  
  try {
    logger.info('Posting to X via Zapier webhook');
    
    await errorHandler.withRetry(
      async () => {
        return axios.post(
          webhookUrl,
          { text: content }
        );
      },
      { retries: 3, delay: 1000 }
    );
    
    logger.info('Posted to X successfully');
    
    return true;
  } catch (error) {
    logger.error('Failed to post to X', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

// Run the script
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const templateType = args[0] || 'daily-ecosystem';
    const shouldPost = args.includes('--post');
    const dryRun = args.includes('--dry-run');
    
    logger.info('Running template', { templateType, shouldPost, dryRun });
    
    // Run the template
    const content = await runTemplate(templateType, { dryRun });
    
    // Track format execution
    const tracker = new FormatTracker();
    await tracker.logExecution(templateType, {
      posted: shouldPost && !dryRun,
      dryRun: dryRun
    });
    
    // Display the content
    console.log('\n===== Generated Content =====');
    console.log('\nTelegram:');
    console.log(content.telegram);
    console.log('\nX:');
    console.log(content.x);
    console.log('\n============================');
    
    // Post to channels if requested
    if (shouldPost && !dryRun) {
      const telegramResult = await postToTelegram(content.telegram);
      const xResult = await postToX(content.x);
      
      console.log('\n===== Posting Results =====');
      console.log(`Telegram: ${telegramResult ? '✅ Success' : '❌ Failed'}`);
      console.log(`X: ${xResult ? '✅ Success' : '❌ Failed'}`);
      console.log('=============================');
    } else if (dryRun) {
      console.log('\n⚠️ Dry run mode - no content was posted');
    } else {
      console.log('\n📝 Content generated but not posted (use --post to post)');
    }
    
    logger.info('Template runner completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Template runner failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run the script
main();