#!/usr/bin/env node
require('dotenv').config();
const https = require('https');

class FigmaNEARWEEKGenerator {
  constructor() {
    this.figmaKey = process.env.FIGMA_API_KEY;
    this.fileId = 'y7D6dPdF6MkL6Ab2DENNq7';
    this.nodeId = '4-6'; // Specific node from the URL
  }

  async getFileNodes() {
    return new Promise((resolve, reject) => {
      console.log(`🔍 Accessing Figma file: ${this.fileId}`);
      console.log('📋 Note: This is a Figma Community file (buzz link)');
      
      https.get({
        hostname: 'api.figma.com',
        path: `/v1/files/${this.fileId}`,
        headers: { 'X-Figma-Token': this.figmaKey }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📊 Response status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('✅ File accessible!');
            console.log('📄 File:', result.name);
            console.log('📅 Last modified:', result.lastModified);
            
            const frames = this.findFrames(result.document);
            console.log('🖼️  Available frames:');
            frames.forEach((frame, i) => {
              console.log(`  ${i + 1}. ${frame.name} (ID: ${frame.id})`);
            });
            
            resolve(frames);
          } else {
            const errorData = JSON.parse(data);
            console.log('❌ Access failed:', errorData);
            
            if (res.statusCode === 403) {
              console.log('💡 This might be a community file that needs to be duplicated to your account first');
              console.log('📋 Steps to fix:');
              console.log('   1. Go to: https://www.figma.com/buzz/y7D6dPdF6MkL6Ab2DENNq7/NEAR-TOWN-HALL-TEMPLATE');
              console.log('   2. Click "Duplicate" to copy to your account');
              console.log('   3. Use the new file ID from your duplicated file');
            }
            
            reject(new Error(`Failed to get file: ${res.statusCode} - ${errorData.err || errorData.message}`));
          }
        });
      });
    });
  }

  findFrames(node, frames = []) {
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      frames.push({ id: node.id, name: node.name, type: node.type });
    }
    
    if (node.children) {
      node.children.forEach(child => this.findFrames(child, frames));
    }
    
    return frames;
  }

  async generateImage(nodeIds) {
    const nodeParam = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
    
    return new Promise((resolve, reject) => {
      https.get({
        hostname: 'api.figma.com',
        path: `/v1/images/${this.fileId}?ids=${nodeParam}&format=png&scale=2`,
        headers: { 'X-Figma-Token': this.figmaKey }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('✅ Images generated successfully!');
            console.log('📸 Image URLs:');
            Object.entries(result.images).forEach(([id, url]) => {
              console.log(`  Node ${id}: ${url}`);
            });
            resolve(result.images);
          } else {
            console.log('❌ Image generation failed:', data);
            reject(new Error('Failed to generate images'));
          }
        });
      });
    });
  }
}

async function main() {
  const generator = new FigmaNEARWEEKGenerator();
  
  try {
    const frames = await generator.getFileNodes();
    
    if (frames.length > 0) {
      console.log(`\n🎨 Generating image for: ${frames[0].name}`);
      await generator.generateImage(frames[0].id);
    } else {
      console.log('❌ No frames found in the file');
      console.log('🔄 Trying to generate image for specific node from URL...');
      
      // Try the specific node ID from the URL
      try {
        await generator.generateImage(generator.nodeId);
      } catch (nodeError) {
        console.log('❌ Specific node access also failed');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n🔄 Attempting direct image generation for specific node...');
      try {
        await generator.generateImage(generator.nodeId);
      } catch (directError) {
        console.log('❌ Direct node access failed as well');
        console.log('💡 Community files typically need to be duplicated to your account first');
      }
    }
  }
}

main();