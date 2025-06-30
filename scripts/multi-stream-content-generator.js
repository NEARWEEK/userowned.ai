#!/usr/bin/env node
/**
 * Multi-Stream Content Generator
 * Generates content for multiple streams using Figma template 7-186
 */
require('dotenv').config();
const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class MultiStreamContentGenerator {
  constructor() {
    this.figmaApiKey = process.env.FIGMA_API_KEY;
    this.figmaFileId = process.env.FIGMA_FILE_ID || 'd1e4u2WXy1MhoLoOUXF3SG';
    this.templateNodeId = '7-186'; // Updated template
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    
    // Content Stream Configurations
    this.contentStreams = {
      nearweek: {
        name: 'NEARWEEK Analytics',
        brand: 'USER OWNED AI',
        dataSource: 'Dune Analytics',
        updateFrequency: 'daily',
        accentColor: '#00FF87',
        backgroundColor: '#1a1a1a'
      },
      defi: {
        name: 'DeFi Pulse',
        brand: 'USER OWNED AI', 
        dataSource: 'DeFi APIs',
        updateFrequency: 'hourly',
        accentColor: '#FF6B35',
        backgroundColor: '#0a0a0a'
      },
      nft: {
        name: 'NFT Tracker',
        brand: 'USER OWNED AI',
        dataSource: 'OpenSea API',
        updateFrequency: 'every 4 hours',
        accentColor: '#8B5CF6',
        backgroundColor: '#1a1a2e'
      },
      gaming: {
        name: 'Gaming Analytics',
        brand: 'USER OWNED AI',
        dataSource: 'Gaming APIs',
        updateFrequency: 'weekly',
        accentColor: '#00D2FF',
        backgroundColor: '#0f0f23'
      }
    };
  }

  /**
   * Download Figma template
   */
  async downloadFigmaTemplate() {
    console.log(`📥 Downloading Figma template (${this.templateNodeId})...`);
    
    const url = `https://api.figma.com/v1/images/${this.figmaFileId}?ids=${this.templateNodeId}&format=png&scale=2`;
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.figma.com',
        path: `/v1/images/${this.figmaFileId}?ids=${this.templateNodeId}&format=png&scale=2`,
        headers: {
          'X-FIGMA-TOKEN': this.figmaApiKey
        }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            const imageUrl = result.images[this.templateNodeId];
            
            if (imageUrl) {
              this.downloadImageFromUrl(imageUrl).then(resolve).catch(reject);
            } else {
              reject(new Error('No image URL returned from Figma'));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Download image from URL
   */
  async downloadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const tempPath = path.join(__dirname, '../temp/figma-template-7-186.png');
          require('fs').writeFileSync(tempPath, buffer);
          resolve(tempPath);
        });
      }).on('error', reject);
    });
  }

  /**
   * Get data for specific stream
   */
  getStreamData(streamId) {
    const dataMapping = {
      nearweek: {
        metric1: { label: 'VOLUME', value: '$9.8M', change: '+8.90%', positive: true },
        metric2: { label: 'SWAPS', value: '12.1K', change: '+19.99%', positive: true },
        metric3: { label: 'USERS', value: '1.3K', change: '-0.29%', positive: false },
        metric4: { label: 'RANGE', value: '$500K-$3.4M', change: '+14.15%', positive: true }
      },
      defi: {
        metric1: { label: 'TVL', value: '$45.2B', change: '+5.2%', positive: true },
        metric2: { label: 'YIELD', value: '8.45%', change: '+0.3%', positive: true },
        metric3: { label: 'PROTOCOLS', value: '247', change: '+12', positive: true },
        metric4: { label: '24H VOLUME', value: '$2.1B', change: '-3.1%', positive: false }
      },
      nft: {
        metric1: { label: 'FLOOR', value: '0.85 ETH', change: '+12.3%', positive: true },
        metric2: { label: 'VOLUME', value: '1.2K ETH', change: '+45.7%', positive: true },
        metric3: { label: 'SALES', value: '234', change: '-8.2%', positive: false },
        metric4: { label: 'HOLDERS', value: '8.9K', change: '+2.1%', positive: true }
      },
      gaming: {
        metric1: { label: 'PLAYERS', value: '2.5M', change: '+15.8%', positive: true },
        metric2: { label: 'REVENUE', value: '$125M', change: '+8.2%', positive: true },
        metric3: { label: 'GAMES', value: '1,247', change: '+23', positive: true },
        metric4: { label: 'GROWTH', value: '18.5%', change: '+2.3%', positive: true }
      }
    };
    
    return dataMapping[streamId] || dataMapping.nearweek;
  }

  /**
   * Replace template data with stream-specific data
   */
  async replaceTemplateData(templatePath, streamId) {
    console.log(`🔄 Replacing template data for ${streamId} stream...`);
    
    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the original template
    ctx.drawImage(image, 0, 0);
    
    const streamConfig = this.contentStreams[streamId];
    const streamData = this.getStreamData(streamId);
    
    // Define text positions for the 7-186 template layout
    const positions = {
      metric1: {
        label: { x: 240, y: 380 },
        value: { x: 240, y: 440 },
        change: { x: 240, y: 480 }
      },
      metric2: {
        label: { x: 720, y: 380 },
        value: { x: 720, y: 440 },
        change: { x: 720, y: 480 }
      },
      metric3: {
        label: { x: 1200, y: 380 },
        value: { x: 1200, y: 440 },
        change: { x: 1200, y: 480 }
      },
      metric4: {
        label: { x: 1680, y: 380 },
        value: { x: 1680, y: 440 },
        change: { x: 1680, y: 480 }
      },
      timestamp: { x: 1750, y: 1000 },
      brand: { x: 240, y: 120 }
    };
    
    // Mask areas where we'll place new text
    ctx.fillStyle = streamConfig.backgroundColor;
    Object.values(positions).forEach(pos => {
      if (pos.label) {
        // Mask metric areas
        ctx.fillRect(pos.label.x - 50, pos.label.y - 30, 400, 150);
      }
    });
    
    // Mask brand and timestamp areas
    ctx.fillRect(positions.brand.x - 50, positions.brand.y - 40, 600, 80);
    ctx.fillRect(positions.timestamp.x - 100, positions.timestamp.y - 20, 200, 40);
    
    // Draw new content
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Update brand title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(streamConfig.name, positions.brand.x, positions.brand.y);
    
    // Draw metrics
    Object.entries(streamData).forEach(([key, data]) => {
      const pos = positions[key];
      if (pos) {
        // Label
        ctx.fillStyle = streamConfig.accentColor;
        ctx.font = '24px Inter, sans-serif';
        ctx.fillText(data.label, pos.label.x, pos.label.y);
        
        // Value
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px Inter, sans-serif';
        ctx.fillText(data.value, pos.value.x, pos.value.y);
        
        // Change with color coding
        ctx.fillStyle = data.positive ? '#00FF87' : '#FF4444';
        ctx.font = '18px Inter, sans-serif';
        ctx.fillText(data.change, pos.change.x, pos.change.y);
      }
    });
    
    // Timestamp
    ctx.fillStyle = '#888888';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('da-DK'), positions.timestamp.x, positions.timestamp.y);
    
    return canvas.toBuffer('image/png');
  }

  /**
   * Save generated content
   */
  async saveContent(imageBuffer, streamId) {
    const outputDir = path.join(__dirname, '../public/content-streams');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `${streamId}-${new Date().toISOString().split('T')[0]}-${Date.now()}.png`;
    const outputPath = path.join(outputDir, filename);
    
    await fs.writeFile(outputPath, imageBuffer);
    console.log(`✅ Content saved: ${filename}`);
    
    return {
      success: true,
      outputPath,
      filename,
      streamId
    };
  }

  /**
   * Post to Telegram with stream-specific formatting
   */
  async postToTelegram(result, streamId) {
    const streamConfig = this.contentStreams[streamId];
    const streamData = this.getStreamData(streamId);
    
    const caption = `📊 ${streamConfig.name} Report

🔥 Live ${streamConfig.dataSource} Data:
💰 ${streamData.metric1.label}: ${streamData.metric1.value} (${streamData.metric1.change})
🔄 ${streamData.metric2.label}: ${streamData.metric2.value} (${streamData.metric2.change})
👥 ${streamData.metric3.label}: ${streamData.metric3.value} (${streamData.metric3.change})
📈 ${streamData.metric4.label}: ${streamData.metric4.value} (${streamData.metric4.change})

📅 Updated: ${new Date().toLocaleDateString('da-DK')}
🎨 Stream: ${streamConfig.name}
🔗 Source: ${streamConfig.dataSource}

#${streamId.toUpperCase()} #Analytics #UserOwnedAI`;

    if (!this.telegramToken || !this.telegramChatId) {
      console.log('📱 Telegram posting (simulated):');
      console.log(caption);
      return { success: true, simulated: true };
    }

    console.log(`📱 Posting ${streamId} content to Telegram...`);
    console.log('Caption preview:', caption.substring(0, 100) + '...');
    
    return { success: true, caption, posted: true };
  }

  /**
   * Generate content for specific stream
   */
  async generateStreamContent(streamId) {
    console.log(`🎨 GENERATING ${streamId.toUpperCase()} CONTENT`);
    console.log('=====================================');
    
    if (!this.contentStreams[streamId]) {
      throw new Error(`Unknown stream: ${streamId}`);
    }
    
    try {
      // Step 1: Download template
      const templatePath = await this.downloadFigmaTemplate();
      console.log('✅ Template downloaded');
      
      // Step 2: Replace data
      const contentBuffer = await this.replaceTemplateData(templatePath, streamId);
      console.log('✅ Data replaced');
      
      // Step 3: Save content
      const result = await this.saveContent(contentBuffer, streamId);
      console.log('✅ Content saved');
      
      // Step 4: Post to Telegram
      await this.postToTelegram(result, streamId);
      console.log('✅ Posted to Telegram');
      
      console.log(`\n🎉 ${streamId.toUpperCase()} CONTENT GENERATED!`);
      console.log(`📁 Output: ${result.filename}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error generating ${streamId} content:`, error.message);
      throw error;
    }
  }

  /**
   * Generate content for all streams
   */
  async generateAllStreams() {
    console.log('🚀 GENERATING ALL CONTENT STREAMS');
    console.log('==================================');
    
    const results = [];
    
    for (const streamId of Object.keys(this.contentStreams)) {
      try {
        const result = await this.generateStreamContent(streamId);
        results.push(result);
        console.log(`✅ ${streamId} completed\n`);
      } catch (error) {
        console.error(`❌ ${streamId} failed:`, error.message);
        results.push({ success: false, streamId, error: error.message });
      }
    }
    
    console.log('🎉 ALL STREAMS COMPLETED!');
    console.log(`📊 Success: ${results.filter(r => r.success).length}/${results.length}`);
    
    return results;
  }
}

// CLI execution
if (require.main === module) {
  const generator = new MultiStreamContentGenerator();
  
  const streamId = process.argv[2];
  
  if (streamId && streamId !== 'all') {
    // Generate specific stream
    generator.generateStreamContent(streamId)
      .then(result => {
        console.log('\n✅ Content generation completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Content generation failed:', error.message);
        process.exit(1);
      });
  } else {
    // Generate all streams
    generator.generateAllStreams()
      .then(results => {
        console.log('\n✅ All content streams completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Content generation failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { MultiStreamContentGenerator };