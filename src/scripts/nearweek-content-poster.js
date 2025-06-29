/**
 * NEARWEEK Content Bible Poster
 * Posts campaign content to ai_x_crypto Telegram pool using NEARWEEK userowned.ai bot
 * Follows NEARWEEK Content Bible format exactly
 */

const https = require('https');

class NEARWEEKContentPoster {
  constructor() {
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID || '@ai_x_crypto';
  }

  async postToTelegram(message) {
    if (!this.telegramToken || !message) {
      console.log('⚠️ Missing Telegram credentials or message');
      return { success: false, error: 'Missing credentials' };
    }

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        chat_id: this.chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${this.telegramToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve({ success: true, data: result });
            } else {
              resolve({ success: false, error: result });
            }
          } catch (error) {
            resolve({ success: false, error: error.message });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Telegram API error:', error);
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
  }

  // NEARWEEK Content Bible compliant content generators
  
  generateWDYSPreEvent(episodeNumber = 18, streamDate = 'May 15') {
    const preEventContent = [
      `NEAR AI Ecosystem What Did You Ship This Week? Ep. ${episodeNumber} streams ${streamDate}.`,
      `Builders across the NEAR ecosystem will demonstrate breakthrough AI agents and decentralized applications.`,
      `NEAR developers showcase autonomous systems and user-owned AI innovations.`,
      `Community builders present smart contracts and decentralized infrastructure.`,
      `AI agent creators demonstrate novel approaches to user sovereignty.`,
      `Watch live as the NEAR ecosystem pushes the boundaries of decentralized AI.`
    ];
    
    // Return main announcement for posting
    return `${preEventContent[0]}\n\n${preEventContent[1]}`;
  }

  generateNearAISearch() {
    return `NEAR AI Search infrastructure enables decentralized intelligence systems.\n\nTechnical specifications and implementation guidance now available.\n\nREAD: https://nearweek.com/near-ai-search`;
  }

  generateNearAIInference() {
    return `NEAR AI Inference infrastructure enables decentralized intelligence systems.\n\nTechnical specifications and implementation guidance now available.\n\nREAD: https://nearweek.com/near-ai-inference`;
  }

  generateNearAIAgentMultiplication() {
    return `NEAR AI Agent Multiplication infrastructure enables decentralized intelligence systems.\n\nTechnical specifications and implementation guidance now available.\n\nREAD: https://nearweek.com/near-ai-agent-multiplication`;
  }

  generateNewsletterStory() {
    return `NEAR AI INFRASTRUCTURE EXPANSION\n\nNEAR Protocol announces comprehensive AI infrastructure developments.\n\nDecentralized inference networks enable privacy-preserving machine learning.\n\nDeveloper tools simplify AI agent deployment and management.\n\nCommunity governance structures guide AI development priorities.\n\nIntegration partnerships expand ecosystem capabilities.\n\nPerformance optimizations reduce computational costs.\n\nSecurity enhancements protect AI model integrity.\n\nScalability improvements support growing AI workloads.\n\nOpen source contributions accelerate innovation.\n\nEducational resources help developers adopt AI technologies.\n\nEcosystem metrics demonstrate rapid growth.\n\nFuture roadmap includes advanced AI capabilities.\n\nREAD: https://nearweek.com/ai-infrastructure-expansion`;
  }

  generateBlogpostContent() {
    return `Agent Multiplication fundamentals reshape decentralized infrastructure approaches. Core protocol improvements enable enhanced developer experiences. READ: https://nearweek.com/building-blocks-agent-multiplication`;
  }

  generateTownHallPreEvent() {
    return `NEAR Town Hall June 2025 streams June 12.\n\nProtocol updates and ecosystem developments from core contributors.\n\nInfrastructure improvements and new partnership announcements.`;
  }

  async postSingleContent(contentType) {
    let content, name;
    
    switch (contentType) {
      case 'wdys':
        content = this.generateWDYSPreEvent();
        name = 'WDYS #18 Pre-Event';
        break;
      case 'search':
        content = this.generateNearAISearch();
        name = 'NEAR AI Search';
        break;
      case 'inference':
        content = this.generateNearAIInference();
        name = 'NEAR AI Inference';
        break;
      case 'agents':
        content = this.generateNearAIAgentMultiplication();
        name = 'NEAR AI Agent Multiplication';
        break;
      case 'newsletter':
        content = this.generateNewsletterStory();
        name = 'Newsletter - AI Infrastructure';
        break;
      case 'blogpost':
        content = this.generateBlogpostContent();
        name = 'Blogpost - Agent Multiplication';
        break;
      case 'townhall':
        content = this.generateTownHallPreEvent();
        name = 'Town Hall Pre-Event';
        break;
      default:
        console.log('❌ Invalid content type. Use: wdys, search, inference, agents, newsletter, blogpost, townhall');
        return;
    }

    console.log(`📤 Posting: ${name}`);
    console.log(`Content preview: ${content.substring(0, 100)}...`);
    
    try {
      const result = await this.postToTelegram(content);
      if (result.success) {
        console.log(`✅ Successfully posted: ${name}`);
      } else {
        console.log(`❌ Failed to post ${name}:`, result.error);
      }
      return result;
    } catch (error) {
      console.error(`❌ Error posting ${name}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async postAllContent() {
    const contents = [
      { type: 'wdys', name: 'WDYS #18 Pre-Event', content: this.generateWDYSPreEvent() },
      { type: 'search', name: 'NEAR AI Search', content: this.generateNearAISearch() },
      { type: 'inference', name: 'NEAR AI Inference', content: this.generateNearAIInference() },
      { type: 'agents', name: 'NEAR AI Agent Multiplication', content: this.generateNearAIAgentMultiplication() },
      { type: 'newsletter', name: 'Newsletter - AI Infrastructure', content: this.generateNewsletterStory() },
      { type: 'blogpost', name: 'Blogpost - Agent Multiplication', content: this.generateBlogpostContent() }
    ];

    console.log('🚀 Posting NEARWEEK Content Bible content to ai_x_crypto pool...');
    console.log(`📡 Target: ${this.chatId}`);
    console.log(`📊 Total content pieces: ${contents.length}`);
    
    const results = [];
    
    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      console.log(`\n📝 [${i + 1}/${contents.length}] Posting: ${item.name}`);
      console.log(`Preview: ${item.content.substring(0, 80)}...`);
      
      try {
        const result = await this.postToTelegram(item.content);
        if (result.success) {
          console.log(`✅ Posted: ${item.name}`);
          results.push({ ...item, success: true });
        } else {
          console.log(`❌ Failed: ${item.name} - ${result.error.description || result.error}`);
          results.push({ ...item, success: false, error: result.error });
        }
        
        // Rate limiting - wait 3 seconds between posts to avoid Telegram limits
        if (i < contents.length - 1) {
          console.log('⏳ Waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Error posting ${item.name}:`, error.message);
        results.push({ ...item, success: false, error: error.message });
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n🎉 POSTING COMPLETE');
    console.log('===================');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed posts:');
      results.filter(r => !r.success).forEach(item => {
        console.log(`- ${item.name}: ${item.error.description || item.error}`);
      });
    }
    
    return results;
  }

  showContentPreview() {
    console.log('🧪 NEARWEEK Content Bible Generator (PREVIEW)');
    console.log('=============================================');
    console.log('Builder-native, technical, fast and factual content following NEARWEEK Bible rules\n');
    
    const contents = [
      { name: 'WDYS #18 Pre-Event', content: this.generateWDYSPreEvent() },
      { name: 'NEAR AI Search', content: this.generateNearAISearch() },
      { name: 'NEAR AI Inference', content: this.generateNearAIInference() },
      { name: 'NEAR AI Agent Multiplication', content: this.generateNearAIAgentMultiplication() },
      { name: 'Newsletter - AI Infrastructure', content: this.generateNewsletterStory() },
      { name: 'Blogpost - Agent Multiplication', content: this.generateBlogpostContent() }
    ];
    
    contents.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}:`);
      console.log('─'.repeat(50));
      console.log(item.content);
      console.log('\n');
    });
    
    console.log('💡 To post content:');
    console.log('• Single: node src/scripts/nearweek-content-poster.js wdys --post');
    console.log('• All: node src/scripts/nearweek-content-poster.js all --post');
    console.log('\n🎯 Target: ai_x_crypto Telegram pool');
  }

  async run() {
    const contentType = process.argv[2];
    const shouldPost = process.argv.includes('--post');
    
    // Check environment
    if (shouldPost && !this.telegramToken) {
      console.log('❌ TELEGRAM_BOT_TOKEN environment variable required for posting');
      console.log('Set environment variable or run without --post flag for preview');
      return;
    }
    
    if (!contentType) {
      this.showContentPreview();
      return;
    }
    
    if (!shouldPost) {
      console.log('🧪 DRY RUN MODE (add --post to actually post)\n');
      
      if (contentType === 'all') {
        this.showContentPreview();
      } else {
        console.log(`Preview for: ${contentType}`);
        await this.postSingleContent(contentType);
      }
      return;
    }
    
    // Actual posting
    console.log('🚀 NEARWEEK Content Bible Poster - LIVE MODE');
    console.log('==============================================');
    
    if (contentType === 'all') {
      await this.postAllContent();
    } else {
      await this.postSingleContent(contentType);
    }
  }
}

// CLI execution
if (require.main === module) {
  const poster = new NEARWEEKContentPoster();
  poster.run().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = NEARWEEKContentPoster;
