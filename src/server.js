// NEARWEEK Automated News Sourcing Server
// Express server handling webhooks and API endpoints

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const AutomatedNewsPipeline = require('./workflows/automated-pipeline');

class NewsSourceServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize pipeline
    this.pipeline = new AutomatedNewsPipeline({
      zapierWebhookUrl: process.env.ZAPIER_WEBHOOK_URL,
      bufferApiKey: process.env.BUFFER_API_KEY,
      bufferOrganizationId: process.env.BUFFER_ORG_ID || 'NEARWEEK',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      runwayWebhookUrl: process.env.RUNWAY_WEBHOOK_URL,
      confidenceThreshold: parseInt(process.env.CONFIDENCE_THRESHOLD) || 85
    });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
    });

    // Main webhook for X API tweets
    this.app.post('/webhook/x-api', async (req, res) => {
      try {
        const tweetData = req.body;
        console.log(`📥 Received tweet from @${tweetData.author?.username}`);
        
        const result = await this.pipeline.processTweetWebhook(tweetData);
        
        res.json({
          status: 'processed',
          result: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(500).json({
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Metrics endpoint
    this.app.get('/api/metrics', (req, res) => {
      const metrics = this.pipeline.getMetrics();
      res.json({
        metrics: metrics,
        timestamp: new Date().toISOString()
      });
    });

    // Manual processing endpoint
    this.app.post('/api/manual-process', async (req, res) => {
      try {
        const { tweetData, priority } = req.body;
        const result = await this.pipeline.processTweetWebhook(tweetData);
        
        res.json({
          status: 'manually_processed',
          result: result,
          priority: priority || 'standard'
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error.message
        });
      }
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('🚨 Server error:', error);
      res.status(500).json({
        status: 'server_error',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        status: 'not_found',
        message: 'Endpoint not found',
        timestamp: new Date().toISOString()
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 NEARWEEK Automated News Sourcing Server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`📈 Metrics: http://localhost:${this.port}/api/metrics`);
      console.log(`📥 Webhook endpoint: http://localhost:${this.port}/webhook/x-api`);
    });
  }
}

// Start server if called directly
if (require.main === module) {
  const server = new NewsSourceServer();
  server.start();
}

module.exports = NewsSourceServer;