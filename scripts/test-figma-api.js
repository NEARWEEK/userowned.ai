#!/usr/bin/env node

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_API_KEY = process.env.FIGMA_API_KEY;

if (!FIGMA_API_KEY) {
  console.error('❌ FIGMA_API_KEY not found in environment variables');
  console.log('Add to your .env file: FIGMA_API_KEY=your_figma_token');
  process.exit(1);
}

console.log('🎨 Testing Figma API Integration\n');

// Create output directory
const outputDir = path.join(__dirname, '../public/multimedia-tests');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Test 1: Get user info to verify API key
async function testUserInfo() {
  return new Promise((resolve, reject) => {
    console.log('1. Testing Figma API authentication...');
    
    const options = {
      hostname: 'api.figma.com',
      path: '/v1/me',
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`   ✅ Connected as: ${result.email}`);
            console.log(`   📊 Team: ${result.handle || 'Personal'}\n`);
            resolve(result);
          } else {
            console.log(`   ❌ Authentication failed: ${result.err || result.message}`);
            reject(new Error(result.err || result.message));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test 2: List recent files
async function testListFiles() {
  return new Promise((resolve, reject) => {
    console.log('2. Fetching recent Figma files...');
    
    const options = {
      hostname: 'api.figma.com',
      path: '/v1/files/recent?limit=5',
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 && result.files) {
            console.log(`   📁 Found ${result.files.length} recent files:`);
            result.files.forEach((file, i) => {
              console.log(`   ${i + 1}. ${file.name} (${file.key})`);
            });
            console.log();
            resolve(result.files);
          } else {
            console.log(`   ⚠️  No files found or access limited`);
            resolve([]);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test 3: Export sample design (if files exist)
async function testExportDesign(fileKey) {
  return new Promise((resolve, reject) => {
    console.log('3. Testing design export...');
    
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/images/${fileKey}?format=png&scale=2`,
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 && result.images) {
            console.log('   ✅ Export URLs generated successfully');
            
            // Save export info
            const exportInfo = {
              timestamp: new Date().toISOString(),
              fileKey: fileKey,
              images: result.images,
              status: 'success'
            };
            
            fs.writeFileSync(
              path.join(outputDir, 'figma-export-test.json'),
              JSON.stringify(exportInfo, null, 2)
            );
            
            console.log(`   💾 Export info saved to: public/multimedia-tests/figma-export-test.json`);
            resolve(result);
          } else {
            console.log(`   ❌ Export failed: ${result.err || 'Unknown error'}`);
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main test function
async function runFigmaTests() {
  try {
    // Test authentication
    const userInfo = await testUserInfo();
    
    // Test file listing
    const files = await testListFiles();
    
    // Test export if files exist
    if (files.length > 0) {
      const firstFile = files[0];
      await testExportDesign(firstFile.key);
    } else {
      console.log('3. Skipping export test - no accessible files found\n');
    }
    
    // Generate test summary
    const summary = {
      timestamp: new Date().toISOString(),
      tests: {
        authentication: '✅ Passed',
        fileAccess: files.length > 0 ? '✅ Passed' : '⚠️ Limited',
        export: files.length > 0 ? '✅ Tested' : '⏭️ Skipped'
      },
      userInfo: {
        email: userInfo.email,
        team: userInfo.handle || 'Personal'
      },
      filesFound: files.length,
      nextSteps: [
        'Create or access Figma files for testing',
        'Set up design templates for reports',
        'Implement automated export workflow'
      ]
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'figma-test-results.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('🎯 Figma API Test Complete!');
    console.log('━'.repeat(50));
    console.log(`✅ Authentication: Connected as ${userInfo.email}`);
    console.log(`📁 File Access: ${files.length} files accessible`);
    console.log(`📄 Results saved to: public/multimedia-tests/`);
    console.log('━'.repeat(50));
    
    if (files.length === 0) {
      console.log('\n💡 To test exports:');
      console.log('   1. Create a Figma file or get team access');
      console.log('   2. Re-run this test to export designs');
    }
    
  } catch (error) {
    console.error('❌ Figma test failed:', error.message);
    
    // Save error log
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      troubleshooting: [
        'Check if FIGMA_API_KEY is valid',
        'Verify token has not expired',
        'Ensure proper API permissions'
      ]
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'figma-error-log.json'),
      JSON.stringify(errorLog, null, 2)
    );
    
    process.exit(1);
  }
}

// Run tests
runFigmaTests();