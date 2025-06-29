/**
 * Multimedia Content Generator
 * Integrates Figma and Runway APIs for visual content creation
 */

const https = require('https');
const { createLogger } = require('../utils/logger');

class MultimediaGenerator {
  constructor() {
    this.figmaKey = process.env.FIGMA_API_KEY;
    this.runwayKey = process.env.RUNWAY_API_KEY;
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID || '@ai_x_crypto';
    this.logger = createLogger('multimedia-generator');
  }

  /**
   * Generate Figma design from template
   * @param {string} templateId - Figma template ID
   * @param {Object} data - Data to populate template
   * @returns {Promise<string>} - Generated image URL
   */
  async generateFigmaDesign(templateId, data) {
    if (!this.figmaKey) {
      throw new Error('Figma API key not configured');
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.figma.com',
        path: `/v1/files/${templateId}/images`,
        method: 'GET',
        headers: {
          'X-Figma-Token': this.figmaKey,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 200) {
              this.logger.info('Figma design generated successfully');
              resolve(result.images);
            } else {
              reject(new Error(`Figma API error: ${result.error}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Generate AI image with Runway
   * @param {string} prompt - Text prompt for image generation
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - Generated image URL
   */
  async generateRunwayImage(prompt, options = {}) {
    if (!this.runwayKey) {
      throw new Error('Runway API key not configured');
    }

    const payload = {
      prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      steps: options.steps || 50,
      guidance_scale: options.guidance_scale || 7.5
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'api.runwayml.com',
        path: '/v1/images/generate',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.runwayKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 200) {
              this.logger.info('Runway image generated successfully');
              resolve(result.image_url);
            } else {
              reject(new Error(`Runway API error: ${result.error}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Create multimedia content for NEARWEEK posts
   * @param {string} contentType - Type of content (wdys, newsletter, etc.)
   * @param {Object} data - Content data
   * @returns {Promise<Object>} - Generated multimedia content
   */
  async createNEARWEEKMultimedia(contentType, data) {
    const templates = {
      wdys: {
        figmaTemplate: 'WDYS_TEMPLATE_ID',
        runwayPrompt: 'NEAR AI ecosystem builders demonstrating breakthrough applications, futuristic tech aesthetic'
      },
      newsletter: {
        figmaTemplate: 'NEWSLETTER_TEMPLATE_ID', 
        runwayPrompt: 'NEAR Protocol AI infrastructure expansion, decentralized networks, technical visualization'
      },
      blogpost: {
        figmaTemplate: 'BLOG_TEMPLATE_ID',
        runwayPrompt: 'Agent multiplication protocol improvements, decentralized infrastructure, technical diagram'
      }
    };

    const template = templates[contentType];
    if (!template) {
      throw new Error(`Unknown content type: ${contentType}`);
    }

    const results = {};

    try {
      // Generate Figma design if template available
      if (template.figmaTemplate && this.figmaKey) {
        results.figmaDesign = await this.generateFigmaDesign(template.figmaTemplate, data);
      }

      // Generate Runway image
      if (template.runwayPrompt && this.runwayKey) {
        results.runwayImage = await this.generateRunwayImage(template.runwayPrompt);
      }

      this.logger.info(`Multimedia content generated for ${contentType}`);
      return results;
    } catch (error) {
      this.logger.error(`Failed to generate multimedia for ${contentType}:`, error);
      throw error;
    }
  }

  /**
   * Post multimedia content to Telegram
   * @param {string} message - Text message
   * @param {string} imageUrl - URL of image to post
   * @returns {Promise<Object>} - Telegram API response
   */
  async postMultimediaToTelegram(message, imageUrl = null) {
    if (!this.telegramToken) {
      throw new Error('Telegram bot token not configured');
    }

    const endpoint = imageUrl ? 'sendPhoto' : 'sendMessage';
    const payload = imageUrl ? 
      { chat_id: this.chatId, photo: imageUrl, caption: message, parse_mode: 'HTML' } :
      { chat_id: this.chatId, text: message, parse_mode: 'HTML' };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${this.telegramToken}/${endpoint}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.ok) {
              this.logger.info(`Message posted successfully: ${result.result.message_id}`);
              resolve(result);
            } else {
              reject(new Error(`Telegram API error: ${result.description}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Complete multimedia workflow: generate content and post to Telegram
   * @param {string} contentType - Type of content
   * @param {string} message - Text message
   * @param {Object} data - Additional data for generation
   * @returns {Promise<Object>} - Complete workflow result
   */
  async generateAndPost(contentType, message, data = {}) {
    try {
      // Generate multimedia content
      const multimedia = await this.createNEARWEEKMultimedia(contentType, data);
      
      // Choose best available image
      const imageUrl = multimedia.runwayImage || (multimedia.figmaDesign && multimedia.figmaDesign[0]);
      
      // Post to Telegram
      const telegramResult = await this.postMultimediaToTelegram(message, imageUrl);
      
      return {
        multimedia,
        telegram: telegramResult,
        success: true
      };
    } catch (error) {
      this.logger.error('Multimedia workflow failed:', error);
      
      // Fallback: post text-only message
      try {
        const telegramResult = await this.postMultimediaToTelegram(message);
        return {
          multimedia: null,
          telegram: telegramResult,
          success: true,
          fallback: true
        };
      } catch (telegramError) {
        throw new Error(`Complete workflow failed: ${error.message}, Telegram fallback failed: ${telegramError.message}`);
      }
    }
  }

  /**
   * Check API status
   * @returns {Object} - Status of all APIs
   */
  getAPIStatus() {
    return {
      figma: !!this.figmaKey,
      runway: !!this.runwayKey,
      telegram: !!this.telegramToken
    };
  }
}

module.exports = { MultimediaGenerator };
