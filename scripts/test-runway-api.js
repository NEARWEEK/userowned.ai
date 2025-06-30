#!/usr/bin/env node

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

if (!RUNWAY_API_KEY) {
  console.error('❌ RUNWAY_API_KEY not found in environment variables');
  console.log('Add to your .env file: RUNWAY_API_KEY=your_runway_token');
  process.exit(1);
}

console.log('🎬 Testing Runway API Integration\n');

// Create output directory
const outputDir = path.join(__dirname, '../public/multimedia-tests');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Test 1: Check API authentication and credits
async function testAuth() {
  return new Promise((resolve, reject) => {
    console.log('1. Testing Runway API authentication...');
    
    const options = {
      hostname: 'api.runwayml.com',
      path: '/v1/user',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('   ✅ Authentication successful');
            console.log(`   💳 Credits available: ${result.credits || 'Unknown'}`);
            console.log(`   👤 User ID: ${result.id || 'Unknown'}\n`);
            resolve(result);
          } else if (res.statusCode === 401) {
            console.log('   ❌ Authentication failed - Invalid API key');
            reject(new Error('Invalid API key'));
          } else {
            const result = JSON.parse(data);
            console.log(`   ❌ API Error (${res.statusCode}): ${result.message || 'Unknown error'}`);
            reject(new Error(result.message || 'API Error'));
          }
        } catch (e) {
          console.log(`   ❌ Response parsing error: ${e.message}`);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request error: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// Test 2: Generate an AI image
async function testImageGeneration() {
  return new Promise((resolve, reject) => {
    console.log('2. Testing AI image generation...');
    
    const prompt = 'AI and cryptocurrency convergence visualization, futuristic digital art style, blockchain networks, neural networks, glowing blue and green colors';
    
    const requestBody = JSON.stringify({
      prompt: prompt,
      width: 1024,
      height: 1024,
      guidance_scale: 7.5,
      num_inference_steps: 50,
      seed: Math.floor(Math.random() * 1000000)
    });

    const options = {
      hostname: 'api.runwayml.com',
      path: '/v1/text-to-image',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    console.log(`   🎨 Prompt: "${prompt.substring(0, 60)}..."`);
    console.log('   ⏳ Generating image...');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('   ✅ Image generation initiated successfully');
            
            if (result.id) {
              console.log(`   🆔 Task ID: ${result.id}`);
              console.log('   ⏳ Image is being processed...');
              
              // Save generation info
              const genInfo = {
                timestamp: new Date().toISOString(),
                taskId: result.id,
                prompt: prompt,
                status: 'processing',
                url: result.url || null
              };
              
              fs.writeFileSync(
                path.join(outputDir, 'runway-generation-info.json'),
                JSON.stringify(genInfo, null, 2)
              );
              
              resolve(result);
            } else if (result.url) {
              console.log('   🖼️  Image URL generated');
              downloadImage(result.url, 'runway-test-image.png');
              resolve(result);
            } else {
              console.log('   ⚠️  Unexpected response format');
              resolve(result);
            }
          } else {
            console.log(`   ❌ Generation failed (${res.statusCode}): ${result.message || result.error}`);
            reject(new Error(result.message || result.error));
          }
        } catch (e) {
          console.log(`   ❌ Response parsing error: ${e.message}`);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request error: ${error.message}`);
      reject(error);
    });
    
    req.write(requestBody);
    req.end();
  });
}

// Download generated image
function downloadImage(url, filename) {
  console.log(`   📥 Downloading image to: public/multimedia-tests/${filename}`);
  
  const file = fs.createWriteStream(path.join(outputDir, filename));
  
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('   ✅ Image downloaded successfully');
    });
  }).on('error', (err) => {
    fs.unlink(path.join(outputDir, filename), () => {});
    console.log(`   ❌ Download error: ${err.message}`);
  });
}

// Test 3: Check task status (if we have a task ID)
async function checkTaskStatus(taskId) {
  return new Promise((resolve) => {
    console.log(`3. Checking task status for ID: ${taskId}...`);
    
    const options = {
      hostname: 'api.runwayml.com',
      path: `/v1/tasks/${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
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
            console.log(`   📊 Status: ${result.status || 'Unknown'}`);
            
            if (result.status === 'completed' && result.output && result.output.length > 0) {
              console.log('   ✅ Task completed! Downloading result...');
              downloadImage(result.output[0], `runway-completed-${taskId.substring(0, 8)}.png`);
            } else if (result.status === 'processing') {
              console.log('   ⏳ Still processing... Check again later');
            } else if (result.status === 'failed') {
              console.log('   ❌ Task failed');
            }
            
            resolve(result);
          } else {
            console.log(`   ⚠️  Could not check status: ${res.statusCode}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`   ❌ Status check error: ${e.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

// Main test function
async function runRunwayTests() {
  try {
    // Test authentication
    const userInfo = await testAuth();
    
    // Test image generation
    const genResult = await testImageGeneration();
    
    // Check status if we have a task ID
    if (genResult && genResult.id) {
      // Wait a moment for processing to start
      console.log('   ⏳ Waiting 5 seconds before status check...\n');
      setTimeout(async () => {
        await checkTaskStatus(genResult.id);
        generateSummary(userInfo, genResult);
      }, 5000);
    } else {
      generateSummary(userInfo, genResult);
    }
    
  } catch (error) {
    console.error('❌ Runway test failed:', error.message);
    
    // Save error log
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      troubleshooting: [
        'Check if RUNWAY_API_KEY is valid',
        'Verify you have sufficient credits',
        'Check API endpoint availability'
      ]
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'runway-error-log.json'),
      JSON.stringify(errorLog, null, 2)
    );
    
    process.exit(1);
  }
}

function generateSummary(userInfo, genResult) {
  // Generate test summary
  const summary = {
    timestamp: new Date().toISOString(),
    tests: {
      authentication: '✅ Passed',
      imageGeneration: genResult ? '✅ Initiated' : '❌ Failed'
    },
    userInfo: userInfo,
    generation: genResult,
    nextSteps: [
      'Check generated images in public/multimedia-tests/',
      'Implement image generation in templates',
      'Set up automated visual content creation'
    ]
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'runway-test-results.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\n🎯 Runway API Test Complete!');
  console.log('━'.repeat(50));
  console.log(`✅ Authentication: Success`);
  console.log(`🎨 Image Generation: ${genResult ? 'Initiated' : 'Failed'}`);
  console.log(`📄 Results saved to: public/multimedia-tests/`);
  console.log('━'.repeat(50));
  
  console.log('\n💡 To view results:');
  console.log('   1. Check public/multimedia-tests/ folder');
  console.log('   2. Open the web viewer with: node scripts/multimedia-viewer.js');
  console.log('   3. Look for generated images and JSON logs');
}

// Run tests
runRunwayTests();