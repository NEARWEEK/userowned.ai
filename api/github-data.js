/**
 * API Endpoint: Real GitHub Data
 * Serves live GitHub updates for both bot and website
 */

const EnhancedGitHubCollector = require('../src/engine/enhanced-github-collector');
const MinimalTemplate = require('../src/templates/github-updates-minimal');

// Repositories to track
const REPOSITORIES = [
  { name: 'Bittensor', repo: 'opentensor/bittensor', symbol: 'TAO' },
  { name: 'NEAR', repo: 'near/nearcore', symbol: 'NEAR' },
  { name: 'ICP', repo: 'dfinity/ic', symbol: 'ICP' },
  { name: 'Render', repo: 'RNDR-Inc/rndr-py', symbol: 'RNDR' },
  { name: 'Fetch.ai', repo: 'fetchai/fetchai-ledger', symbol: 'FET' },
  { name: 'Akash', repo: 'akash-network/node', symbol: 'AKT' }
];

let cache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Check cache first
    const now = Date.now();
    if (cache && (now - cacheTimestamp) < CACHE_DURATION) {
      res.status(200).json({
        ...cache,
        cached: true,
        cacheAge: Math.round((now - cacheTimestamp) / 1000)
      });
      return;
    }
    
    // Collect real GitHub data
    const collector = new EnhancedGitHubCollector();
    const githubUpdates = await collector.collectDailyUpdates(REPOSITORIES);
    
    // Generate formatted content
    const template = MinimalTemplate;
    const result = await template.generate({
      githubUpdates: githubUpdates,
      timestamp: new Date().toISOString()
    });
    
    // Prepare response
    const response = {
      success: true,
      lastUpdated: new Date().toISOString(),
      repositories: REPOSITORIES,
      updates: githubUpdates.slice(0, 10), // Raw updates for advanced users
      formatted: {
        telegram: result.telegram,
        x: result.x,
        website: result.website
      },
      metadata: result.metadata,
      cached: false
    };
    
    // Update cache
    cache = response;
    cacheTimestamp = now;
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('GitHub data collection error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to collect GitHub data',
      message: error.message,
      lastUpdated: new Date().toISOString()
    });
  }
}