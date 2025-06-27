# UserOwned.ai Utilities

This directory contains utility modules that enhance the reliability and stability of the UserOwned.ai codebase. These utilities are designed to be used throughout the application to improve error handling, logging, validation, and more.

## Available Utilities

### `logger.js`
Provides structured logging with different levels and formats using Winston.

```javascript
const { logger } = require('./utils');

// Different log levels
logger.debug('Detailed debug information');
logger.info('Important information');
logger.warn('Warning: something might be wrong');
logger.error('Error occurred', { error: err.message, stack: err.stack });
```

### `error-handler.js`
Provides robust error handling with retries and circuit breaker patterns.

```javascript
const { errorHandler } = require('./utils');

// Retry logic
async function fetchData() {
  return errorHandler.withRetry(
    async () => {
      // Your API call or other operation that might fail
      const response = await api.getData();
      return response.data;
    },
    {
      retries: 3,
      delay: 1000,
      onError: (error, attempt) => {
        console.log(`Attempt ${attempt} failed`);
      },
      fallback: () => {
        return { status: 'error', data: [] };
      }
    }
  );
}

// Circuit breaker
const breaker = errorHandler.createCircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});

async function protectedCall() {
  return breaker.execute(
    async () => await api.getData(),
    () => ({ status: 'fallback', data: [] })
  );
}
```

### `validation.js`
Provides input validation functions to ensure data integrity.

```javascript
const { validation } = require('./utils');

// Check required fields
const data = { id: 123, name: 'Test' };
const result = validation.validateRequiredFields(data, ['id', 'name', 'email']);

if (!result.valid) {
  console.log('Missing fields:', result.missing);
}

// Validate string
const nameResult = validation.validateString(data.name, { minLength: 2, maxLength: 50 });
if (!nameResult.valid) {
  console.log('Invalid name:', nameResult.error);
}

// Validate GitHub repo format
const repoResult = validation.validateGitHubRepo('NEARWEEK/userowned.ai');
if (!repoResult.valid) {
  console.log('Invalid repo format:', repoResult.error);
}
```

### `rate-limiter.js`
Provides rate limiting to prevent API abuse.

```javascript
const { rateLimiter } = require('./utils');

// Create rate limiters for different APIs
const limiter = rateLimiter.createRateLimiter({
  maxRequests: 5,
  timeWindowMs: 1000, // 1 second
  name: 'github-api'
});

async function fetchWithRateLimit() {
  // Wait if necessary to respect rate limits
  await limiter.acquire();
  
  // Now safe to make the API call
  return api.getData();
}

// Or use the pre-configured API rate limiters
const apiLimiters = rateLimiter.createApiRateLimiters();

async function fetchFromGitHub() {
  await apiLimiters.github.acquire();
  return github.getData();
}
```

### `config.js`
Provides a unified way to manage and access configuration.

```javascript
const { config } = require('./utils');

// Get complete configuration
const appConfig = config.getConfig();

// Use configuration values
const githubToken = appConfig.apis.github.token;
const maxRetries = appConfig.execution.maxRetries;
const isDryRun = appConfig.features.enableDryRun;
```

### `health-check.js`
Provides functions to monitor system health.

```javascript
const { healthCheck } = require('./utils');

async function checkSystemHealth() {
  // Check all services
  const status = await healthCheck.performHealthCheck();
  console.log('System status:', status.status);
  
  // Or check specific service
  const githubStatus = await healthCheck.checkGitHubHealth();
  console.log('GitHub status:', githubStatus.status);
}
```

## Integration with Existing Code

To use these utilities in your existing code:

1. Import the utilities at the top of your file:

```javascript
const { logger, errorHandler, validation } = require('../utils');
```

2. Replace console.log statements with structured logging:

```javascript
// Before
console.log('Processing item:', item);

// After
logger.info('Processing item', { item });
```

3. Wrap API calls with retry logic:

```javascript
// Before
const data = await api.fetchData();

// After
const data = await errorHandler.withRetry(() => api.fetchData());
```

4. Validate inputs before processing:

```javascript
// Before
function processRepo(repo) {
  // Process directly
}

// After
function processRepo(repo) {
  const result = validation.validateGitHubRepo(repo);
  if (!result.valid) {
    logger.warn('Invalid repository format', { repo, error: result.error });
    throw new Error(`Invalid repository: ${result.error}`);
  }
  // Process validated data
}
```

5. Use rate limiting for API calls:

```javascript
// Before
async function fetchMultipleRepos(repos) {
  return Promise.all(repos.map(repo => api.fetchRepo(repo)));
}

// After
const apiLimiters = rateLimiter.createApiRateLimiters();

async function fetchMultipleRepos(repos) {
  const results = [];
  for (const repo of repos) {
    await apiLimiters.github.acquire();
    results.push(await api.fetchRepo(repo));
  }
  return results;
}
```

## Best Practices

1. **Always use structured logging** - Include relevant objects and context in your log messages
2. **Handle all errors** - Never let errors propagate without handling
3. **Validate all inputs** - Especially for data coming from external sources
4. **Use rate limiting** - Respect API limits to prevent being blocked
5. **Use configuration** - Don't hardcode values that might change
6. **Monitor health** - Regularly check system health

## Adding New Utilities

When adding new utilities:

1. Create a new file in the `utils` directory
2. Export the utility functions
3. Add exports to `index.js`
4. Document usage in this README
