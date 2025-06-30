#!/usr/bin/env node

require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎨 UserOwned.AI Custom Figma Setup');
console.log('━'.repeat(50));

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupCustomFigma() {
  console.log('\n📋 Follow these steps to create your custom Figma file:\n');
  
  console.log('1. Go to https://figma.com');
  console.log('2. Click "New design file"');
  console.log('3. Name it: "UserOwned.AI Content Templates"');
  console.log('4. Create a frame (1200x400px) named "daily-header"');
  console.log('5. Add some text and styling');
  console.log('6. Copy the file URL\n');
  
  const fileUrl = await askQuestion('📎 Paste your Figma file URL here: ');
  
  // Extract file ID from URL
  const fileIdMatch = fileUrl.match(/\/file\/([a-zA-Z0-9]+)\//);
  
  if (!fileIdMatch) {
    console.log('❌ Invalid Figma URL format');
    console.log('Expected format: https://figma.com/file/FILE_ID/filename');
    rl.close();
    return;
  }
  
  const fileId = fileIdMatch[1];
  console.log(`\n✅ Extracted File ID: ${fileId}`);
  
  // Update the generator script
  const generatorPath = path.join(__dirname, 'figma-nearweek-generator.js');
  let generatorContent = fs.readFileSync(generatorPath, 'utf8');
  
  // Replace the file ID
  generatorContent = generatorContent.replace(
    /this\.fileId = '[^']+';/,
    `this.fileId = '${fileId}';`
  );
  
  fs.writeFileSync(generatorPath, generatorContent);
  
  console.log('✅ Updated figma-nearweek-generator.js with your file ID');
  
  // Test the connection
  console.log('\n🔍 Testing connection to your Figma file...');
  
  const { spawn } = require('child_process');
  const test = spawn('node', ['scripts/figma-nearweek-generator.js'], {
    stdio: 'inherit'
  });
  
  test.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 Success! Your Figma file is accessible');
      console.log('\n🚀 Next steps:');
      console.log('   1. Add more frames to your Figma file');
      console.log('   2. Run: gh workflow run multimedia-generation.yml --field content_type=test-all-apis');
      console.log('   3. View results at: http://localhost:3001');
    } else {
      console.log('\n❌ Connection failed. Check:');
      console.log('   1. File is public or you have access');
      console.log('   2. Figma API key is correct');
      console.log('   3. File URL is correct');
    }
    rl.close();
  });
}

// Create sample Figma content for testing
async function createSampleContent() {
  const outputDir = path.join(__dirname, '../public/multimedia-tests');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sampleFigmaData = {
    timestamp: new Date().toISOString(),
    fileId: 'CUSTOM_FILE_ID',
    fileName: 'UserOwned.AI Content Templates',
    frames: [
      {
        id: 'daily-header',
        name: 'Daily Report Header',
        size: '1200x400',
        description: 'Header design for daily ecosystem reports'
      },
      {
        id: 'weekly-chart',
        name: 'Weekly Analytics Chart',
        size: '800x600',
        description: 'Template for weekly performance visualization'
      },
      {
        id: 'social-card',
        name: 'Social Media Card',
        size: '1080x1080',
        description: 'Square template for social media posts'
      }
    ],
    exportUrls: {
      'daily-header': 'https://via.placeholder.com/1200x400/4299e1/ffffff?text=UserOwned.AI+Daily+Header',
      'weekly-chart': 'https://via.placeholder.com/800x600/667eea/ffffff?text=Weekly+Analytics',
      'social-card': 'https://via.placeholder.com/1080x1080/764ba2/ffffff?text=Social+Media+Card'
    },
    status: 'Ready for custom Figma integration'
  };

  fs.writeFileSync(
    path.join(outputDir, 'custom-figma-setup.json'),
    JSON.stringify(sampleFigmaData, null, 2)
  );

  console.log('✅ Created sample Figma data structure');
}

// Main setup flow
async function main() {
  try {
    await createSampleContent();
    console.log('\n🎯 Ready to set up your custom Figma file!');
    
    const shouldSetup = await askQuestion('\nDo you have a Figma file URL ready? (y/n): ');
    
    if (shouldSetup.toLowerCase() === 'y') {
      await setupCustomFigma();
    } else {
      console.log('\n📖 When ready, follow the guide at: docs/figma-design-guide.md');
      console.log('🔄 Then run this script again: node scripts/setup-custom-figma.js');
      rl.close();
    }
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    rl.close();
  }
}

main();