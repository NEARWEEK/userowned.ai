/**
 * UserOwned.ai Content Template System
 * Modular approach inspired by NEARWEEK/CORE
 */

const dailyEcosystemAnalysis = require('./daily-ecosystem-analysis');
const dailyFormatMinimal = require('./daily-format-minimal');
const dailyFormatDetailed = require('./daily-format-detailed');
const dailyFormatVisual = require('./daily-format-visual');
const dailyFormatNarrative = require('./daily-format-narrative');
const dailyFormatTechnical = require('./daily-format-technical');
const dailyFormatCompetitive = require('./daily-format-competitive');
const dailyFormatInvestor = require('./daily-format-investor');

/**
 * Available content templates
 */
const templates = {
  'daily-ecosystem': dailyEcosystemAnalysis,
  'daily-minimal': dailyFormatMinimal,
  'daily-detailed': dailyFormatDetailed,
  'daily-visual': dailyFormatVisual,
  'daily-narrative': dailyFormatNarrative,
  'daily-technical': dailyFormatTechnical,
  'daily-competitive': dailyFormatCompetitive,
  'daily-investor': dailyFormatInvestor
};

/**
 * A/B Testing Format Cycle
 * Rotates through different formats daily for performance testing
 */
const formatCycle = [
  'daily-minimal',     // Monday - Format A
  'daily-detailed',    // Tuesday - Format B  
  'daily-visual',      // Wednesday - Format C
  'daily-narrative',   // Thursday - Format D
  'daily-technical',   // Friday - Format E
  'daily-competitive', // Saturday - Format F
  'daily-investor'     // Sunday - Format G
];

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
   * Get today's format for A/B testing cycle
   */
  getTodaysFormat() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Adjust so Monday = 0, Sunday = 6
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return formatCycle[adjustedDay];
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
  templates,
  formatCycle
};