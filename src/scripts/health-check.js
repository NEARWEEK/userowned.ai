/**
 * Health check script for UserOwned.ai
 * 
 * Run with: npm run health-check
 */
const { logger, healthCheck } = require('../utils');

async function main() {
  try {
    logger.info('Starting system health check');
    
    // Perform full health check
    const healthStatus = await healthCheck.performHealthCheck();
    
    // Display results
    console.log('\n=== UserOwned.ai Health Check Results ===');
    console.log(`Overall Status: ${healthStatus.status.toUpperCase()}`);
    console.log(`Timestamp: ${healthStatus.timestamp}`);
    console.log('\nService Status:');
    
    // Display each service status
    Object.values(healthStatus.services).forEach(service => {
      const statusEmoji = {
        'healthy': '✅',
        'degraded': '⚠️',
        'unhealthy': '❌',
        'unavailable': '⚪',
        'configured': '🔵'
      }[service.status] || '❓';
      
      console.log(`${statusEmoji} ${service.service}: ${service.status}`);
      
      if (service.error) {
        console.log(`   Error: ${service.error}`);
      }
      
      if (service.data) {
        Object.entries(service.data).forEach(([key, value]) => {
          if (typeof value === 'object') {
            console.log(`   ${key}:`);
            Object.entries(value).forEach(([subKey, subValue]) => {
              console.log(`     ${subKey}: ${subValue}`);
            });
          } else {
            console.log(`   ${key}: ${value}`);
          }
        });
      }
    });
    
    console.log('\n============================================');
    
    // Exit with appropriate code
    process.exit(healthStatus.status === 'healthy' ? 0 : 1);
  } catch (error) {
    logger.error('Health check failed', { error: error.message, stack: error.stack });
    console.error('\n❌ Health check failed with error:', error.message);
    process.exit(1);
  }
}

// Run the health check
main();
