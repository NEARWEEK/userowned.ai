/**
 * Rate limiter utility for UserOwned.ai
 * Provides rate limiting to prevent API abuse
 */
const logger = require('./logger');

/**
 * Creates a rate limiter to control API request frequency
 * 
 * @param {Object} options - Rate limiter options
 * @param {number} options.maxRequests - Maximum requests allowed in time window
 * @param {number} options.timeWindowMs - Time window in milliseconds
 * @param {string} options.name - Name for this rate limiter (for logging)
 * @returns {Object} - Rate limiter methods
 */
function createRateLimiter(options = {}) {
  const {
    maxRequests = 5,
    timeWindowMs = 1000,
    name = 'default'
  } = options;

  // Store timestamps of requests
  const requestTimestamps = [];
  
  return {
    /**
     * Wait until a request can be made (if necessary)
     * 
     * @returns {Promise<boolean>} - Resolves when request can proceed
     */
    async acquire() {
      const now = Date.now();
      
      // Remove timestamps outside the current window
      const windowStart = now - timeWindowMs;
      
      // Keep only timestamps within the current window
      while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
        requestTimestamps.shift();
      }
      
      // If we haven't hit the limit, proceed immediately
      if (requestTimestamps.length < maxRequests) {
        requestTimestamps.push(now);
        return true;
      }
      
      // Calculate wait time (time until oldest request exits the window)
      const oldestRequest = requestTimestamps[0];
      const waitTime = Math.max(1, oldestRequest + timeWindowMs - now);
      
      logger.debug(`Rate limiter [${name}]: Waiting ${waitTime}ms before next request`, {
        currentRequests: requestTimestamps.length,
        maxRequests,
        timeWindowMs
      });
      
      // Wait until we can make another request
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Try again after waiting
      return this.acquire();
    },
    
    /**
     * Check if a request can be made immediately
     * 
     * @returns {boolean} - True if request can proceed, false otherwise
     */
    canAcquire() {
      const now = Date.now();
      const windowStart = now - timeWindowMs;
      
      // Count requests within the current window
      const activeRequests = requestTimestamps.filter(ts => ts >= windowStart).length;
      
      return activeRequests < maxRequests;
    },
    
    /**
     * Get current status of the rate limiter
     * 
     * @returns {Object} - Rate limiter status
     */
    status() {
      const now = Date.now();
      const windowStart = now - timeWindowMs;
      
      // Count requests within the current window
      const activeRequests = requestTimestamps.filter(ts => ts >= windowStart).length;
      
      return {
        activeRequests,
        maxRequests,
        remaining: Math.max(0, maxRequests - activeRequests),
        timeWindowMs,
        name
      };
    },
    
    /**
     * Reset the rate limiter
     */
    reset() {
      requestTimestamps.length = 0;
      logger.debug(`Rate limiter [${name}]: Reset`);
    }
  };
}

/**
 * Creates rate limiters for multiple APIs
 * 
 * @returns {Object} - Map of API rate limiters
 */
function createApiRateLimiters() {
  return {
    github: createRateLimiter({
      maxRequests: 30,  // GitHub allows up to 60 requests per minute for authenticated requests
      timeWindowMs: 60 * 1000,  // 1 minute
      name: 'github'
    }),
    telegram: createRateLimiter({
      maxRequests: 20,  // Telegram has limits around 30 messages per second
      timeWindowMs: 1000,  // 1 second
      name: 'telegram'
    }),
    twitter: createRateLimiter({
      maxRequests: 50,  // Twitter API v2 has complex rate limits
      timeWindowMs: 15 * 60 * 1000,  // 15 minutes
      name: 'twitter'
    }),
    defillama: createRateLimiter({
      maxRequests: 15,  // Being conservative
      timeWindowMs: 60 * 1000,  // 1 minute
      name: 'defillama'
    })
  };
}

module.exports = {
  createRateLimiter,
  createApiRateLimiters
};