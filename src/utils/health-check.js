/**
 * Health check utility for UserOwned.ai
 * Provides functions to monitor system health
 */
const axios = require('axios');
const logger = require('./logger');
const { getConfig } = require('./config');

/**
 * Checks GitHub API health
 * 
 * @returns {Promise<Object>} - Health status object
 */
async function checkGitHubHealth() {
  const config = getConfig();
  const githubToken = config.apis?.github?.token;
  
  if (!githubToken) {
    return {
      service: 'github',
      status: 'unavailable',
      error: 'GitHub token not configured'
    };
  }
  
  try {
    const response = await axios.get('https://api.github.com/rate_limit', {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      },
      timeout: 5000
    });
    
    const rateLimit = response.data.resources.core;
    const resetTime = new Date(rateLimit.reset * 1000);
    
    return {
      service: 'github',
      status: 'healthy',
      data: {
        rateLimits: {
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetTime: resetTime.toISOString()
        }
      }
    };
  } catch (error) {
    logger.error('GitHub health check failed', { error: error.message });
    
    return {
      service: 'github',
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Checks Telegram API health
 * 
 * @returns {Promise<Object>} - Health status object
 */
async function checkTelegramHealth() {
  const config = getConfig();
  const telegramToken = config.apis?.telegram?.token;
  
  if (!telegramToken) {
    return {
      service: 'telegram',
      status: 'unavailable',
      error: 'Telegram token not configured'
    };
  }
  
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${telegramToken}/getMe`,
      { timeout: 5000 }
    );
    
    if (response.data.ok) {
      return {
        service: 'telegram',
        status: 'healthy',
        data: {
          botInfo: response.data.result
        }
      };
    } else {
      return {
        service: 'telegram',
        status: 'unhealthy',
        error: response.data.description || 'Unknown error'
      };
    }
  } catch (error) {
    logger.error('Telegram health check failed', { error: error.message });
    
    return {
      service: 'telegram',
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Checks Zapier webhook health
 * 
 * @returns {Promise<Object>} - Health status object
 */
async function checkZapierHealth() {
  const config = getConfig();
  const zapierWebhook = config.apis?.zapier?.webhookUrl;
  
  if (!zapierWebhook) {
    return {
      service: 'zapier',
      status: 'unavailable',
      error: 'Zapier webhook not configured'
    };
  }
  
  // We can't actually test a webhook without sending data
  // Just check if it's properly configured
  return {
    service: 'zapier',
    status: 'configured',
    data: {
      webhookConfigured: true
    }
  };
}

/**
 * Performs a complete health check of all services
 * 
 * @returns {Promise<Object>} - Complete health status
 */
async function performHealthCheck() {
  logger.info('Starting health check');
  
  const results = await Promise.allSettled([
    checkGitHubHealth(),
    checkTelegramHealth(),
    checkZapierHealth()
  ]);
  
  const services = {};
  let overallStatus = 'healthy';
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const serviceCheck = result.value;
      services[serviceCheck.service] = serviceCheck;
      
      if (serviceCheck.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (serviceCheck.status === 'unavailable' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    } else {
      // Promise rejection during health check
      const serviceName = ['github', 'telegram', 'zapier'][index];
      services[serviceName] = {
        service: serviceName,
        status: 'error',
        error: result.reason?.message || 'Unknown error during health check'
      };
      overallStatus = 'unhealthy';
    }
  });
  
  const healthStatus = {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    services
  };
  
  logger.info('Health check completed', { status: overallStatus });
  
  return healthStatus;
}

module.exports = {
  performHealthCheck,
  checkGitHubHealth,
  checkTelegramHealth,
  checkZapierHealth
};