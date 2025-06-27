/**
 * Format Performance Tracker
 * Tracks metrics for A/B testing different post formats
 */

const fs = require('fs').promises;
const path = require('path');

class FormatTracker {
  constructor() {
    this.trackingFile = path.join(__dirname, '../../logs/format-performance.json');
  }

  /**
   * Log format execution
   */
  async logExecution(formatType, metadata = {}) {
    try {
      const data = await this.readTrackingData();
      const today = new Date().toISOString().split('T')[0];
      
      const execution = {
        date: today,
        format: formatType,
        timestamp: new Date().toISOString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        metadata: metadata
      };

      data.executions = data.executions || [];
      data.executions.push(execution);

      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      data.executions = data.executions.filter(exec => 
        new Date(exec.date) >= thirtyDaysAgo
      );

      await this.writeTrackingData(data);
      return execution;
    } catch (error) {
      console.error('Error logging format execution:', error);
      return null;
    }
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary() {
    try {
      const data = await this.readTrackingData();
      const executions = data.executions || [];
      
      const summary = {
        totalExecutions: executions.length,
        formatBreakdown: {},
        weeklyPattern: {},
        lastWeekFormats: []
      };

      // Count by format
      executions.forEach(exec => {
        summary.formatBreakdown[exec.format] = (summary.formatBreakdown[exec.format] || 0) + 1;
        summary.weeklyPattern[exec.dayOfWeek] = (summary.weeklyPattern[exec.dayOfWeek] || 0) + 1;
      });

      // Last 7 days
      const lastWeek = executions
        .filter(exec => {
          const execDate = new Date(exec.date);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return execDate >= sevenDaysAgo;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      summary.lastWeekFormats = lastWeek;

      return summary;
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate A/B testing report
   */
  async generateABTestingReport() {
    const summary = await this.getPerformanceSummary();
    
    let report = `# A/B Testing Format Performance Report\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Total Executions**: ${summary.totalExecutions}\n\n`;

    report += `## Format Usage Breakdown\n`;
    Object.entries(summary.formatBreakdown || {}).forEach(([format, count]) => {
      report += `- **${format}**: ${count} executions\n`;
    });

    report += `\n## Last Week's Formats\n`;
    summary.lastWeekFormats.forEach(exec => {
      report += `- **${exec.date}** (${exec.dayOfWeek}): ${exec.format}\n`;
    });

    report += `\n## Weekly Pattern\n`;
    Object.entries(summary.weeklyPattern || {}).forEach(([day, count]) => {
      report += `- **${day}**: ${count} posts\n`;
    });

    report += `\n---\n*Track engagement metrics manually and correlate with formats for performance analysis*\n`;

    return report;
  }

  /**
   * Read tracking data from file
   */
  async readTrackingData() {
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(this.trackingFile);
      await fs.mkdir(logsDir, { recursive: true });

      const data = await fs.readFile(this.trackingFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty data
        return { executions: [] };
      }
      throw error;
    }
  }

  /**
   * Write tracking data to file
   */
  async writeTrackingData(data) {
    await fs.writeFile(this.trackingFile, JSON.stringify(data, null, 2));
  }
}

module.exports = FormatTracker;