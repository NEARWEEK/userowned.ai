// NEARWEEK Automated News Sourcing Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const WebhookHandler = require('./webhook-handler');
const testEndpoints = require('./test-endpoints');
const MCPIntegrations = require('./mcp-integrations');

const app = express();
const port = process.env.PORT || 3000;
const webhookHandler = new WebhookHandler();

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' })
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    integrations: {
      mcp_buffer: process.env.USE_MCP_BUFFER === 'true' ? 'ready' : 'disabled',
      mcp_telegram: process.env.USE_MCP_TELEGRAM === 'true' ? 'ready' : 'disabled',
      mcp_github: process.env.USE_MCP_GITHUB === 'true' ? 'ready' : 'disabled',
      mcp_webhooks: process.env.USE_MCP_WEBHOOKS === 'true' ? 'ready' : 'disabled'
    },
    features: {
      auto_posting: process.env.ENABLE_AUTO_POSTING === 'true',
      video_generation: process.env.ENABLE_VIDEO_GENERATION === 'true',
      team_notifications: process.env.ENABLE_TEAM_NOTIFICATIONS === 'true',
      breaking_news_alerts: process.env.ENABLE_BREAKING_NEWS_ALERTS === 'true'
    }
  });
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const metrics = webhookHandler.getMetrics();
  res.json({
    uptime: `${metrics.uptime_seconds}s`,
    requests_processed: metrics.tweets_processed,
    tweets_analyzed: metrics.tweets_processed,
    posts_created: metrics.posts_created,
    error_rate: `${metrics.error_rate.toFixed(2)}%`,
    response_time_avg: '0ms', // Placeholder
    system_status: 'operational',
    processing_rate: `${metrics.tweets_processed_rate.toFixed(1)}/min`,
    last_updated: new Date().toISOString()
  });
});

// Main webhook endpoint for X API
app.post('/webhook/x-api', async (req, res) => {
  try {
    console.log('📨 Received X API webhook:', req.body.id || 'no-id');
    
    const result = await webhookHandler.processWebhook(req.body, testEndpoints);
    
    // Log to automation log
    const logEntry = `${new Date().toISOString()} - Webhook processed: ${JSON.stringify(result)}\n`;
    fs.appendFileSync(path.join(logsDir, 'automation.log'), logEntry);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    // Log error
    const errorEntry = `${new Date().toISOString()} - ERROR: ${error.message}\n`;
    fs.appendFileSync(path.join(logsDir, 'error.log'), errorEntry);
    
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoints
app.use('/api', testEndpoints);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'NEARWEEK Automated News Sourcing',
    version: '1.0.0',
    status: 'operational',
    documentation: 'See README.md for API documentation',
    health_check: '/health',
    metrics: '/api/metrics',
    webhook_endpoint: '/webhook/x-api'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Log error
  const errorEntry = `${new Date().toISOString()} - UNHANDLED ERROR: ${error.message}\n${error.stack}\n`;
  fs.appendFileSync(path.join(logsDir, 'error.log'), errorEntry);
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 NEARWEEK Automation Server starting...');
  console.log(`📍 Server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`📊 Metrics: http://localhost:${port}/api/metrics`);
  console.log(`📨 Webhook: http://localhost:${port}/webhook/x-api`);
  console.log('');
  console.log('✅ MCP integrations loaded:');
  console.log(`  Buffer: ${process.env.USE_MCP_BUFFER === 'true' ? '✅' : '❌'}`);
  console.log(`  Telegram: ${process.env.USE_MCP_TELEGRAM === 'true' ? '✅' : '❌'}`);
  console.log(`  GitHub: ${process.env.USE_MCP_GITHUB === 'true' ? '✅' : '❌'}`);
  console.log(`  Webhooks: ${process.env.USE_MCP_WEBHOOKS === 'true' ? '✅' : '❌'}`);
  console.log('');
  console.log('🎯 Features:');
  console.log(`  Auto-posting: ${process.env.ENABLE_AUTO_POSTING === 'true' ? 'ENABLED' : 'DISABLED (safe mode)'}`);
  console.log(`  Team notifications: ${process.env.ENABLE_TEAM_NOTIFICATIONS === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`  Breaking news alerts: ${process.env.ENABLE_BREAKING_NEWS_ALERTS === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log('');
  console.log('🌟 Server ready for webhooks!');
  
  // Test MCP integrations on startup
  setTimeout(async () => {
    console.log('🧪 Testing MCP integrations...');
    try {
      const results = await MCPIntegrations.testAllIntegrations();
      console.log('✅ MCP integration test results:', results);
    } catch (error) {
      console.error('❌ MCP integration test failed:', error.message);
    }
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

module.exports = app;