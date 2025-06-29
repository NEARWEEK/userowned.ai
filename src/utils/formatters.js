/**
 * Format a number as a percentage
 * @param {number} value - The decimal value (e.g., 0.25 for 25%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a large number with commas
 * @param {number} value - The number to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('en-US');
}

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date
 */
function formatDate(date, options = {}) {
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  };
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a time duration in human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
  formatPercentage,
  formatNumber,
  formatDate,
  formatDuration,
  formatBytes
};