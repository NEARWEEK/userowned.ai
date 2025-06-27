/**
 * UserOwned.ai Intelligence Platform
 * Entry point for the application
 */

const { logger, errorHandler, config, healthCheck } = require('./utils');
const { TemplateEngine } = require('./templates');
const EnhancedGitHubCollector = require('./engine/enhanced-github-collector-v2');

// Initialize the application
async function initializeApp() {
  try {
    logger.info('Starting UserOwned.ai Intelligence Platform', {
      version: '2.0.1',
      environment: process.env.NODE_ENV || 'development'
    });
    
    // Load configuration
    const appConfig = config.getConfig();
    logger.debug('Configuration loaded', {
      environment: appConfig.environment,
      features: appConfig.features
    });
    
    // Check system health
    const healthStatus = await healthCheck.performHealthCheck();
    if (healthStatus.status !== 'healthy') {
      logger.warn('System health check detected issues', { healthStatus });
    } else {
      logger.info('System health check passed');
    }
    
    // Initialize the GitHub collector
    const collector = new EnhancedGitHubCollector();
    const validated = await collector.validateSetup();
    
    if (!validated) {
      logger.error('GitHub collector validation failed');
      process.exit(1);
    }
    
    // Initialize the template engine
    const templateEngine = new TemplateEngine();
    logger.info('Template engine initialized', {
      availableTemplates: templateEngine.getAvailableTemplates()
    });
    
    return {
      collector,
      templateEngine
    };
  } catch (error) {
    logger.error('Failed to initialize application', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run a specific template
async function runTemplate(templateType, options = {}) {
  try {
    logger.info('Running template', { templateType, options });
    
    // Initialize the app
    const { collector, templateEngine } = await initializeApp();
    
    // Define repositories to track
    const repositories = [
      { name: 'NEAR Protocol', repo: 'near/nearcore' },
      { name: 'Internet Computer', repo: 'dfinity/ic' },
      { name: 'Bittensor', repo: 'opentensor/bittensor' },
      { name: 'The Graph', repo: 'graphprotocol/graph-node' },
      { name: 'Injective', repo: 'InjectiveLabs/injective-chain' },
      { name: 'Fetch.ai', repo: 'fetchai/fetchd' },
      { name: 'Akash Network', repo: 'akash-network/node' },
      { name: 'Render Network', repo: 'rndr-network/render-node' }
    ];
    
    // Collect GitHub updates
    const updates = await errorHandler.withRetry(
      () => collector.collectDailyUpdates(repositories),
      { retries: 2, delay: 2000 }
    );
    
    // Generate content from template
    const content = await errorHandler.withRetry(
      () => templateEngine.executeTemplate(templateType, { updates, options }),
      { retries: 2, delay: 1000 }
    );
    
    logger.info('Template execution completed', {
      templateType,
      contentLength: {
        telegram: content.telegram?.length || 0,
        x: content.x?.length || 0
      }
    });
    
    return content;
  } catch (error) {
    logger.error('Failed to run template', {
      templateType,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Handle graceful shutdown
function setupGracefulShutdown() {
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : 'No stack trace available'
    });
    process.exit(1);
  });
}

// Run the application
async function main() {
  // Set up graceful shutdown
  setupGracefulShutdown();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const templateType = args[0] || 'daily-ecosystem';
  
  try {
    // Run the specified template
    const content = await runTemplate(templateType);
    
    // Display the results
    console.log('\n===== Generated Content =====');
    console.log('\nTelegram:');
    console.log(content.telegram);
    console.log('\nX:');
    console.log(content.x);
    console.log('\n============================');
    
    logger.info('Application completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Application failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  initializeApp,
  runTemplate,
  main
};