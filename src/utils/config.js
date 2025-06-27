/**
 * Configuration management utility for UserOwned.ai
 * Provides a unified way to manage and access configuration
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Default configuration
const defaultConfig = {
  // API configuration
  apis: {
    github: {
      timeout: 10000,          // 10 seconds
      retries: 3,
      rateLimit: {
        maxRequests: 30,
        timeWindowMs: 60000    // 1 minute
      }
    },
    telegram: {
      timeout: 5000,           // 5 seconds
      retries: 3,
      rateLimit: {
        maxRequests: 20,
        timeWindowMs: 1000     // 1 second
      }
    }
  },
  
  // Content configuration
  content: {
    maxLength: {
      telegram: 4096,
      twitter: 280
    },
    formatting: {
      includeEmojis: true,
      includeSources: true,
      includeTimestamp: true
    }
  },
  
  // Ecosystem tracking
  ecosystems: [
    {
      name: 'NEAR Protocol',
      repos: ['near/nearcore', 'near/near-sdk-js', 'near/near-api-js'],
      social: {
        twitter: 'NEARProtocol',
        telegram: 'cryptonear'
      }
    },
    {
      name: 'Internet Computer',
      repos: ['dfinity/ic', 'dfinity/cdk-rs', 'dfinity/agent-js'],
      social: {
        twitter: 'dfinity',
        telegram: 'dfinity'
      }
    },
    {
      name: 'Bittensor',
      repos: ['opentensor/bittensor', 'opentensor/subtensor'],
      social: {
        twitter: 'bittensor_',
        telegram: 'bittensor'
      }
    }
  ],
  
  // Execution settings
  execution: {
    concurrency: 5,        // Number of concurrent operations
    timeout: 60000,        // Global timeout (1 minute)
    retryDelay: 1000,      // Delay between retries (1 second)
    maxRetries: 3          // Maximum number of retries
  },
  
  // Feature flags
  features: {
    enableDryRun: false,
    enableDetailedGithubStats: true,
    enableHistoricalComparisons: true,
    enableTwitterSupport: true,
    enableTelegramFormatting: true
  }
};

// Environment-specific configurations
const envConfigs = {
  development: {
    features: {
      enableDryRun: true
    },
    logging: {
      level: 'debug'
    }
  },
  staging: {
    content: {
      formatting: {
        prefix: '[TEST] '
      }
    },
    logging: {
      level: 'debug'
    }
  },
  production: {
    logging: {
      level: 'info'
    }
  }
};

/**
 * Deep merge utility for configurations
 * 
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is an object
 * 
 * @param {any} item - Value to check
 * @returns {boolean} - True if object
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Load configuration from a file
 * 
 * @param {string} filePath - Path to configuration file
 * @returns {Object|null} - Configuration object or null if file doesn't exist
 */
function loadConfigFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    logger.warn(`Failed to load configuration file: ${filePath}`, {
      error: error.message
    });
  }
  
  return null;
}

/**
 * Get the complete configuration for current environment
 * 
 * @returns {Object} - Complete configuration
 */
function getConfig() {
  // Determine environment
  const env = process.env.NODE_ENV || 'development';
  
  // Start with default config
  let config = { ...defaultConfig };
  
  // Merge with environment-specific config
  if (envConfigs[env]) {
    config = deepMerge(config, envConfigs[env]);
  }
  
  // Look for config file in project root
  const configFilePath = path.join(process.cwd(), 'config.json');
  const fileConfig = loadConfigFile(configFilePath);
  
  if (fileConfig) {
    config = deepMerge(config, fileConfig);
  }
  
  // Merge with environment variables (for selected config values)
  if (process.env.GITHUB_TOKEN) {
    config.apis = config.apis || {};
    config.apis.github = config.apis.github || {};
    config.apis.github.token = process.env.GITHUB_TOKEN;
  }
  
  if (process.env.TELEGRAM_BOT_TOKEN) {
    config.apis = config.apis || {};
    config.apis.telegram = config.apis.telegram || {};
    config.apis.telegram.token = process.env.TELEGRAM_BOT_TOKEN;
  }
  
  if (process.env.TELEGRAM_CHAT_ID) {
    config.apis = config.apis || {};
    config.apis.telegram = config.apis.telegram || {};
    config.apis.telegram.chatId = process.env.TELEGRAM_CHAT_ID;
  }
  
  if (process.env.ZAPIER_WEBHOOK_URL) {
    config.apis = config.apis || {};
    config.apis.zapier = config.apis.zapier || {};
    config.apis.zapier.webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  }
  
  if (process.env.ENABLE_DRY_RUN === 'true') {
    config.features = config.features || {};
    config.features.enableDryRun = true;
  }
  
  return config;
}

module.exports = {
  getConfig,
  deepMerge
};