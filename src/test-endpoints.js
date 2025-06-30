// NEARWEEK Test Endpoints for Local Verification
const express = require('express');
const router = express.Router();
const MCPIntegrations = require('./mcp-integrations');

// Test individual MCP services
router.post('/test/buffer', async (req, res) => {
  try {
    console.log('🧪 Testing Buffer integration...');
    const result = await MCPIntegrations.postToBuffer(
      req.body.message || 'Test message from NEARWEEK local testing',
      { tags: 'test,local,automation' }
    );
    res.json({ status: 'success', service: 'buffer', result });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'buffer', error: error.message });
  }
});

router.post('/test/telegram', async (req, res) => {
  try {
    console.log('🧪 Testing Telegram integration...');
    const result = await MCPIntegrations.sendTelegramMessage(
      req.body.message || '🧪 Test message from NEARWEEK local testing'
    );
    res.json({ status: 'success', service: 'telegram', result });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'telegram', error: error.message });
  }
});

router.post('/test/github', async (req, res) => {
  try {
    console.log('🧪 Testing GitHub integration...');
    const result = await MCPIntegrations.createGitHubIssue(
      req.body.title || 'Local Test Issue',
      req.body.body || 'Testing GitHub integration from local NEARWEEK deployment'
    );
    res.json({ status: 'success', service: 'github', result });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'github', error: error.message });
  }
});

// Content analysis test endpoint
router.post('/analyze', async (req, res) => {
  try {
    console.log('🧪 Testing content analysis...');
    const { text, source, engagement } = req.body;
    
    // Simulate Claude AI analysis
    let relevanceScore = 0;
    
    // Score based on keywords
    const aiKeywords = ['AI', 'artificial intelligence', 'machine learning', 'neural', 'algorithm'];
    const cryptoKeywords = ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'NEAR', 'Web3', 'DeFi'];
    const nearKeywords = ['NEAR', 'NEARProtocol', 'Aurora', 'Octopus'];
    
    const textLower = text.toLowerCase();
    
    // AI keywords (+20 points each)
    relevanceScore += aiKeywords.filter(keyword => textLower.includes(keyword.toLowerCase())).length * 20;
    
    // Crypto keywords (+15 points each)
    relevanceScore += cryptoKeywords.filter(keyword => textLower.includes(keyword.toLowerCase())).length * 15;
    
    // NEAR specific (+25 points each)
    relevanceScore += nearKeywords.filter(keyword => textLower.includes(keyword.toLowerCase())).length * 25;
    
    // Source credibility bonus
    if (source === 'verified_account') relevanceScore += 10;
    
    // Engagement bonus
    if (engagement > 100) relevanceScore += 10;
    if (engagement > 500) relevanceScore += 15;
    
    // Breaking news detection
    const breakingKeywords = ['breaking', 'urgent', 'announcement', 'launch', 'breakthrough'];
    const isBreaking = breakingKeywords.some(keyword => textLower.includes(keyword));
    
    // Spam detection
    const spamKeywords = ['buy now', 'get rich', 'guaranteed', '🚀🚀🚀', 'limited time'];
    const isSpam = spamKeywords.some(keyword => textLower.includes(keyword));
    
    if (isSpam) relevanceScore = Math.min(relevanceScore, 20);
    
    // Cap at 100
    relevanceScore = Math.min(relevanceScore, 100);
    
    // Determine priority
    let priority = 'low';
    if (relevanceScore >= 90 && isBreaking) priority = 'breaking';
    else if (relevanceScore >= 80) priority = 'high';
    else if (relevanceScore >= 60) priority = 'medium';
    
    const result = {
      relevance_score: relevanceScore,
      priority,
      is_breaking: isBreaking,
      is_spam: isSpam,
      keywords_found: {
        ai: aiKeywords.filter(k => textLower.includes(k.toLowerCase())),
        crypto: cryptoKeywords.filter(k => textLower.includes(k.toLowerCase())),
        near: nearKeywords.filter(k => textLower.includes(k.toLowerCase()))
      }
    };
    
    console.log(`Content analysis result: ${relevanceScore}/100 (${priority})`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Admin controls
let systemPaused = false;

router.post('/admin/pause', (req, res) => {
  systemPaused = true;
  console.log('⏸️ System paused by admin');
  res.json({ status: 'paused', message: 'Processing paused' });
});

router.post('/admin/resume', (req, res) => {
  systemPaused = false;
  console.log('▶️ System resumed by admin');
  res.json({ status: 'active', message: 'Processing resumed' });
});

router.get('/admin/status', (req, res) => {
  res.json({ 
    paused: systemPaused,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Export pause status checker
router.isPaused = () => systemPaused;

module.exports = router;