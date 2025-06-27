/**
 * UserOwned.ai Content Template System
 * Modular approach inspired by NEARWEEK/CORE
 */

const dailyEcosystemAnalysis = require('./daily-ecosystem-analysis');
const weeklyMarketUpdate = require('./weekly-market-update');
const projectSpotlight = require('./project-spotlight');
const vcIntelligenceReport = require('./vc-intelligence-report');

/**
 * Available content templates
 */
const templates = {
  'daily-ecosystem': dailyEcosystemAnalysis,
  'weekly-market': weeklyMarketUpdate,
  'project-spotlight': projectSpotlight,
  'vc-intelligence': vcIntelligenceReport
};

/**
 * Template registry and execution
 */
class TemplateEngine {
  constructor() {
    this.templates = templates;
  }

  /**
   * Get available template types
   */
  getAvailableTemplates() {
    return Object.keys(this.templates);
  }

  /**
   * Execute a specific template
   */
  async executeTemplate(templateType, data) {
    if (!this.templates[templateType]) {
      throw new Error(`Template '${templateType}' not found`);
    }

    const template = this.templates[templateType];
    return await template.generate(data);
  }

  /**
   * Register a new template
   */
  registerTemplate(name, template) {
    this.templates[name] = template;
  }
}

module.exports = {
  TemplateEngine,
  templates
};