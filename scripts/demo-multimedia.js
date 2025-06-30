#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎬 UserOwned.AI Multimedia Demo');
console.log('━'.repeat(50));

// Check environment variables
const figmaKey = process.env.FIGMA_API_KEY;
const runwayKey = process.env.RUNWAY_API_KEY;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

console.log('📋 Environment Check:');
console.log(`   Figma API: ${figmaKey ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Runway API: ${runwayKey ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Telegram: ${telegramToken ? '✅ Configured' : '❌ Missing'}`);
console.log('');

if (!figmaKey && !runwayKey) {
  console.log('⚠️  No multimedia APIs configured. Add to your .env file:');
  console.log('   FIGMA_API_KEY=your_figma_token');
  console.log('   RUNWAY_API_KEY=your_runway_token');
  console.log('');
  console.log('💡 Starting viewer anyway to show setup...');
}

// Ensure output directory exists
const outputDir = path.join(__dirname, '../public/multimedia-tests');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runScript(scriptName, description) {
  return new Promise((resolve) => {
    console.log(`🚀 ${description}...`);
    
    const child = spawn('node', [scriptName], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed\n`);
      } else {
        console.log(`⚠️  ${description} finished with warnings\n`);
      }
      resolve(code);
    });
    
    child.on('error', (error) => {
      console.log(`❌ ${description} failed: ${error.message}\n`);
      resolve(1);
    });
  });
}

async function runDemo() {
  console.log('🎬 Starting Multimedia Demo Sequence...\n');
  
  // Test Figma API if configured
  if (figmaKey) {
    await runScript('test-figma-api.js', 'Testing Figma API integration');
  } else {
    console.log('⏭️  Skipping Figma test - API key not configured\n');
  }
  
  // Test Runway API if configured
  if (runwayKey) {
    await runScript('test-runway-api.js', 'Testing Runway AI generation');
  } else {
    console.log('⏭️  Skipping Runway test - API key not configured\n');
  }
  
  // Start the multimedia viewer
  console.log('🌐 Starting multimedia results viewer...');
  console.log('━'.repeat(50));
  
  const viewer = spawn('node', ['multimedia-viewer.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  // Handle viewer shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down multimedia demo...');
    viewer.kill('SIGINT');
    process.exit(0);
  });
  
  viewer.on('error', (error) => {
    console.error('❌ Viewer error:', error.message);
    process.exit(1);
  });
}

// Post demo summary to Telegram if requested
async function postDemoSummary() {
  if (!telegramToken || !process.argv.includes('--post')) {
    return;
  }
  
  const https = require('https');
  const files = fs.readdirSync(outputDir);
  const images = files.filter(f => f.match(/\.(png|jpg|jpeg|gif|webp)$/i));
  const reports = files.filter(f => f.endsWith('.json'));
  
  const message = `🎬 <b>UserOwned.AI Multimedia Demo Results</b>
<i>${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</i>

<b>🧪 Demo Summary:</b>
${figmaKey ? '✅' : '❌'} Figma API: ${figmaKey ? 'Tested' : 'Not configured'}
${runwayKey ? '✅' : '❌'} Runway API: ${runwayKey ? 'Tested' : 'Not configured'}
🌐 Results Viewer: Running on localhost:3001

<b>📊 Generated Content:</b>
🖼️ Images: ${images.length}
📄 Reports: ${reports.length}

<b>🎯 Next Steps:</b>
• Review results at localhost:3001
• Add API keys for full functionality
• Integrate into content templates

🔗 <a href="https://userowned.ai">UserOwned.AI</a> | @ai_x_crypto`;

  const postData = JSON.stringify({
    chat_id: process.env.TELEGRAM_CHAT_ID || '-1001559796949',
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${telegramToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n📱 Posting demo summary to Telegram...');
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.ok) {
        console.log(`✅ Demo summary posted! (Message ID: ${result.result.message_id})`);
      } else {
        console.log('❌ Failed to post summary:', result.description);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Telegram post error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the demo
runDemo().then(() => {
  postDemoSummary();
});