/**
 * API Endpoint: System Status
 * Shows current status of GitHub data collection
 */

const EnhancedGitHubCollector = require('../src/engine/enhanced-github-collector');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const collector = new EnhancedGitHubCollector();
    const isValid = await collector.validateSetup();
    
    res.status(200).json({
      status: isValid ? 'operational' : 'error',
      githubApi: isValid ? 'connected' : 'disconnected',
      environment: {
        hasGithubToken: !!process.env.GITHUB_TOKEN,
        hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasZapierWebhook: !!process.env.ZAPIER_WEBHOOK_URL
      },
      lastChecked: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString()
    });
  }
}