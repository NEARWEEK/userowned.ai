/**
 * Input validation utility for UserOwned.ai
 * Provides functions to validate input data
 */

/**
 * Validates that an object has all required fields
 * 
 * @param {Object} data - Object to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Object} - { valid: boolean, missing: Array<string> }
 */
function validateRequiredFields(data, requiredFields) {
  if (!data || typeof data !== 'object') {
    return { valid: false, missing: ['data object itself'], errors: ['Data must be a valid object'] };
  }

  const missing = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Validates that a value is a non-empty string
 * 
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum string length (default: 1)
 * @param {number} options.maxLength - Maximum string length (default: Infinity)
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateString(value, options = {}) {
  const { minLength = 1, maxLength = Infinity } = options;
  
  if (typeof value !== 'string') {
    return { valid: false, error: 'Value must be a string' };
  }
  
  if (value.length < minLength) {
    return { valid: false, error: `String must be at least ${minLength} characters` };
  }
  
  if (value.length > maxLength) {
    return { valid: false, error: `String must be at most ${maxLength} characters` };
  }
  
  return { valid: true };
}

/**
 * Validates that a value is a number within specified range
 * 
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value (default: -Infinity)
 * @param {number} options.max - Maximum value (default: Infinity)
 * @param {boolean} options.integer - Whether the value must be an integer (default: false)
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateNumber(value, options = {}) {
  const { min = -Infinity, max = Infinity, integer = false } = options;
  
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'Value must be a number' };
  }
  
  if (integer && !Number.isInteger(value)) {
    return { valid: false, error: 'Value must be an integer' };
  }
  
  if (value < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }
  
  if (value > max) {
    return { valid: false, error: `Value must be at most ${max}` };
  }
  
  return { valid: true };
}

/**
 * Validates that a value is an array
 * 
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum array length (default: 0)
 * @param {number} options.maxLength - Maximum array length (default: Infinity)
 * @param {Function} options.itemValidator - Function to validate each item
 * @returns {Object} - { valid: boolean, error?: string, itemErrors?: Array }
 */
function validateArray(value, options = {}) {
  const { minLength = 0, maxLength = Infinity, itemValidator = null } = options;
  
  if (!Array.isArray(value)) {
    return { valid: false, error: 'Value must be an array' };
  }
  
  if (value.length < minLength) {
    return { valid: false, error: `Array must contain at least ${minLength} items` };
  }
  
  if (value.length > maxLength) {
    return { valid: false, error: `Array must contain at most ${maxLength} items` };
  }
  
  if (itemValidator && typeof itemValidator === 'function') {
    const itemErrors = [];
    
    for (let i = 0; i < value.length; i++) {
      const result = itemValidator(value[i], i);
      
      if (!result.valid) {
        itemErrors.push({ index: i, error: result.error });
      }
    }
    
    if (itemErrors.length > 0) {
      return { valid: false, error: 'Array contains invalid items', itemErrors };
    }
  }
  
  return { valid: true };
}

/**
 * Validates a GitHub repository name
 * 
 * @param {string} repo - Repository name to validate (format: owner/repo)
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateGitHubRepo(repo) {
  if (typeof repo !== 'string') {
    return { valid: false, error: 'Repository must be a string' };
  }
  
  const parts = repo.split('/');
  
  if (parts.length !== 2) {
    return { valid: false, error: 'Repository must be in format owner/repo' };
  }
  
  const [owner, repoName] = parts;
  
  if (!owner || !repoName) {
    return { valid: false, error: 'Both owner and repo name must be provided' };
  }
  
  return { valid: true };
}

/**
 * Validates a URL
 * 
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @param {Array<string>} options.protocols - Allowed protocols (default: ['http', 'https'])
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateUrl(url, options = {}) {
  const { protocols = ['http', 'https'] } = options;
  
  if (typeof url !== 'string') {
    return { valid: false, error: 'URL must be a string' };
  }
  
  try {
    const parsedUrl = new URL(url);
    
    if (!protocols.includes(parsedUrl.protocol.replace(':', ''))) {
      return { valid: false, error: `URL must use one of these protocols: ${protocols.join(', ')}` };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

module.exports = {
  validateRequiredFields,
  validateString,
  validateNumber,
  validateArray,
  validateGitHubRepo,
  validateUrl
};