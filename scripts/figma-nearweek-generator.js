#!/usr/bin/env node
require('dotenv').config();
const https = require('https');

class FigmaNEARWEEKGenerator {
  constructor() {
    this.figmaKey = process.env.FIGMA_API_KEY;
    this.fileId = 'y7D6dPdF6MkL6Ab2DENNq7';
  }

  async getFileNodes() {
    return new Promise((resolve, reject) => {
      https.get({
        hostname: 'api.figma.com',
        path: `/v1/files/${this.fileId}`,
        headers: { 'X-Figma-Token': this.figmaKey }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('📄 File:', result.name);
            
            const frames = this.findFrames(result.document);
            console.log('🖼️  Available frames:');
            frames.forEach((frame, i) => {
              console.log(`  ${i + 1}. ${frame.name} (ID: ${frame.id})`);
            });
            
            resolve(frames);
          } else {
            reject(new Error(`Failed to get file: ${res.statusCode}`));
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
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();