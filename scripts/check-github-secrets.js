#!/usr/bin/env node

require('dotenv').config();

console.log('🔑 GitHub Organizational Secrets Check');
console.log('━'.repeat(50));

const secrets = [
  'FIGMA_API_KEY',
  'RUNWAY_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'MAILCHIMP_API_KEY',
  'GITHUB_TOKEN'
];

console.log('📋 Local Environment Status:');
secrets.forEach(secret => {
  const value = process.env[secret];
  const status = value && value !== `your_${secret.toLowerCase()}` ? '✅ Set' : '❌ Missing';
  const masked = value ? `${value.substring(0, 8)}...${value.slice(-4)}` : 'Not found';
  console.log(`   ${secret}: ${status} ${value ? `(${masked})` : ''}`);
});

console.log('\n🤖 GitHub Actions Integration:');
console.log('   Your organizational secrets will be automatically');
console.log('   injected into GitHub Actions workflows.');
console.log('');
console.log('💡 To test with real API keys:');
console.log('   1. Copy the actual values from GitHub org secrets');
console.log('   2. Update your local .env file');
console.log('   3. Run: node scripts/demo-multimedia.js --post');
console.log('');
console.log('🚀 Automated workflows will use organizational secrets:');
console.log('   • Daily multimedia generation at 15:00 UTC');
console.log('   • Manual triggers via GitHub Actions');
console.log('   • Automatic posting to The Pool group');

// Check if we can make a basic GitHub API call
if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token') {
  console.log('\n🔍 Testing GitHub API access...');
  
  const https = require('https');
  const options = {
    hostname: 'api.github.com',
    path: '/user',
    method: 'GET',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'User-Agent': 'UserOwned.AI'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const user = JSON.parse(data);
        console.log(`   ✅ GitHub API connected as: ${user.login}`);
      } else {
        console.log(`   ❌ GitHub API error: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ GitHub API request failed: ${error.message}`);
  });

  req.end();
}