/**
 * Enhanced error handling utility for UserOwned.ai
 * Provides robust error handling with retries and fallbacks
 */
const logger = require('./logger');

/**
 * Wraps an async function with error handling and retry logic
 * 
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Configuration options
 * @param {number} options.retries - Number of retry attempts (default: 3)
 * @param {number} options.delay - Delay between retries in ms (default: 1000)
 * @param {Function} options.onError - Function to call on each error
 * @param {Function} options.fallback - Function to call if all retries fail
 * @returns {Promise} - The result of the function or fallback
 */
async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    onError = null,
    fallback = null,
    context = {}
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Log the error
      logger.warn(`Operation failed (attempt ${attempt}/${retries + 1})`, {
        error: error.message,
        stack: error.stack,
        context
      });

      // Call the onError callback if provided
      if (onError && typeof onError === 'function') {
        onError(error, attempt);
      }

      // If this was the last attempt, don't delay
      if (attempt > retries) {
        break;
      }

      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  // All retries failed
  logger.error(`All retry attempts failed`, {
    error: lastError.message,
    stack: lastError.stack,
    context
  });

  // Use fallback if provided
  if (fallback && typeof fallback === 'function') {
    logger.info(`Using fallback function`);
    return fallback(lastError);
  }

  // No fallback, throw the last error
  throw lastError;
}

/**
 * Creates a circuit breaker to protect against repeated failures
 * 
 * @param {Object} options - Circuit breaker options
 * @param {number} options.failureThreshold - Number of failures before opening (default: 5)
 * @param {number} options.resetTimeout - Time to wait before trying again in ms (default: 30000)
 * @returns {Object} - Circuit breaker functions
 */
function createCircuitBreaker(options = {}) {
  const {
    failureThreshold = 5,
    resetTimeout = 30000
  } = options;

  let failures = 0;
  let isOpen = false;
  let lastFailureTime = null;

  return {
    /**
     * Execute a function with circuit breaker protection
     * 
     * @param {Function} fn - Function to execute
     * @param {Function} fallback - Optional fallback function
     * @returns {Promise} - Result of function or fallback
     */
    async execute(fn, fallback = null) {
      // Check if circuit is open
      if (isOpen) {
        // Check if enough time has passed to try again
        if (Date.now() - lastFailureTime > resetTimeout) {
          logger.info('Circuit breaker: Attempting reset');
          isOpen = false;
          failures = 0;
        } else {
          logger.warn('Circuit breaker: Circuit open, using fallback');
          return fallback ? fallback() : Promise.reject(new Error('Circuit breaker open'));
        }
      }

      try {
        const result = await fn();
        // Success resets the failure counter
        failures = 0;
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        logger.warn(`Circuit breaker: Operation failed`, {
          failures,
          failureThreshold,
          error: error.message
        });

        // Check if we should open the circuit
        if (failures >= failureThreshold) {
          isOpen = true;
          logger.error(`Circuit breaker: Circuit opened after ${failures} failures`);
        }

        // Use fallback or throw
        if (fallback) {
          return fallback(error);
        }
        throw error;
      }
    },
    
    /**
     * Get the current status of the circuit breaker
     * 
     * @returns {Object} - Circuit breaker status
     */
    status() {
      return {
        isOpen,
        failures,
        lastFailureTime,
        failureThreshold,
        resetTimeout
      };
    },
    
    /**
     * Reset the circuit breaker
     */
    reset() {
      failures = 0;
      isOpen = false;
      lastFailureTime = null;
      logger.info('Circuit breaker: Manual reset');
    }
  };
}

/**
 * Timeout wrapper for promises
 * 
 * @param {Promise} promise - The promise to add a timeout to
 * @param {number} ms - Timeout in milliseconds
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} - Promise that will reject if the timeout is reached
 */
function withTimeout(promise, ms, errorMessage = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(errorMessage));
      }, ms);
    })
  ]);
}

module.exports = {
  withRetry,
  createCircuitBreaker,
  withTimeout
};