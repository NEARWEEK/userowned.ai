/**
 * NEARWEEK Content Bible Template
 * Generates campaign content following exact NEARWEEK formatting rules
 */

const template = {
  name: 'NEARWEEK Content Bible',
  type: 'nearweek-content-bible',
  
  async generate(data) {
    const { campaignType, campaignData, timestamp } = data;
    
    return {
      telegram: this.generateTelegram(campaignType, campaignData, timestamp),
      x: this.generateX(campaignType, campaignData, timestamp),
      github: this.generateGithubIssue(campaignType, campaignData, timestamp),
      metadata: { 
        templateType: 'nearweek-content-bible', 
        campaignType,
        timestamp: timestamp || new Date().toISOString()
      }
    };
  },

  generateTelegram(campaignType, data, timestamp) {
    switch (campaignType) {
      case 'WDYS_PRE':
        return this.generateWDYSPreEvent(data);
      case 'NEAR_AI_SEARCH':
        return this.generateNearAISearch(data);
      case 'NEAR_AI_INFERENCE':
        return this.generateNearAIInference(data);
      case 'NEAR_AI_AGENT_MULTIPLICATION':
        return this.generateNearAIAgentMultiplication(data);
      case 'NEWSLETTER':
        return this.generateNewsletterStory(data);
      case 'BLOGPOST':
        return this.generateBlogpostContent(data);
      default:
        return this.generateDefault(data);
    }
  },

  generateX(campaignType, data, timestamp) {
    // Same content for X as Telegram (NEARWEEK Bible rule: no platform-specific formatting)
    return this.generateTelegram(campaignType, data, timestamp);
  },

  generateGithubIssue(campaignType, data, timestamp) {
    const date = new Date(timestamp || Date.now()).toISOString().split('T')[0];
    return `## NEARWEEK Content Bible - ${campaignType} Campaign - ${date}

### Generated Content
${this.generateTelegram(campaignType, data, timestamp)}

### Campaign Details
- Type: ${campaignType}
- Generated: ${date}
- Status: Ready for distribution

*Following NEARWEEK Content Bible format exactly*`;
  },

  // WDYS Pre-event content (6 days before to stream day)
  generateWDYSPreEvent(data) {
    const { episodeNumber = 18, streamDate = 'May 15' } = data;
    
    const preEventContent = [
      `NEAR AI Ecosystem What Did You Ship This Week? Ep. ${episodeNumber} streams ${streamDate}.`,
      `Builders across the NEAR ecosystem will demonstrate breakthrough AI agents and decentralized applications.`,
      `NEAR developers showcase autonomous systems and user-owned AI innovations.`,
      `Community builders present smart contracts and decentralized infrastructure.`,
      `AI agent creators demonstrate novel approaches to user sovereignty.`,
      `Watch live as the NEAR ecosystem pushes the boundaries of decentralized AI.`
    ];
    
    // Rotate content based on day
    const dayIndex = Math.floor(Math.random() * preEventContent.length);
    return preEventContent[dayIndex];
  },

  // NEAR AI Search content (Day 1: Article Publication + Announcement)
  generateNearAISearch(data) {
    const { link = 'https://nearweek.com/near-ai-search' } = data;
    
    return `NEAR AI Search infrastructure enables decentralized intelligence systems.

Technical specifications and implementation guidance now available.

READ: ${link}`;
  },

  // NEAR AI Inference content  
  generateNearAIInference(data) {
    const { link = 'https://nearweek.com/near-ai-inference' } = data;
    
    return `NEAR AI Inference infrastructure enables decentralized intelligence systems.

Technical specifications and implementation guidance now available.

READ: ${link}`;
  },

  // NEAR AI Agent Multiplication content
  generateNearAIAgentMultiplication(data) {
    const { link = 'https://nearweek.com/near-ai-agent-multiplication' } = data;
    
    return `NEAR AI Agent Multiplication infrastructure enables decentralized intelligence systems.

Technical specifications and implementation guidance now available.

READ: ${link}`;
  },

  // Newsletter story format (ALL-CAPS headline + 12-line summary)
  generateNewsletterStory(data) {
    const { 
      headline = 'NEAR AI INFRASTRUCTURE EXPANSION',
      summary = `NEAR Protocol announces comprehensive AI infrastructure developments.

Decentralized inference networks enable privacy-preserving machine learning.

Developer tools simplify AI agent deployment and management.

Community governance structures guide AI development priorities.

Integration partnerships expand ecosystem capabilities.

Performance optimizations reduce computational costs.

Security enhancements protect AI model integrity.

Scalability improvements support growing AI workloads.

Open source contributions accelerate innovation.

Educational resources help developers adopt AI technologies.

Ecosystem metrics demonstrate rapid growth.

Future roadmap includes advanced AI capabilities.`,
      link = 'https://nearweek.com/ai-infrastructure-expansion',
      ctaType = 'READ'
    } = data;
    
    return `${headline.toUpperCase()}

${summary}

${ctaType}: ${link}`;
  },

  // Blogpost content (280 character limit)
  generateBlogpostContent(data) {
    const { 
      topic = 'Agent Multiplication',
      link = 'https://nearweek.com/building-blocks-agent-multiplication'
    } = data;
    
    const variations = [
      `${topic} fundamentals reshape decentralized infrastructure approaches. Core protocol improvements enable enhanced developer experiences. READ: ${link}`,
      `Technical implementation of ${topic} drives ecosystem adoption. Smart contract efficiency gains reduce transaction costs significantly. READ: ${link}`,
      `${topic} architecture enables new classes of decentralized applications. Network performance optimizations support higher throughput applications. READ: ${link}`
    ];
    
    const content = variations[Math.floor(Math.random() * variations.length)];
    
    // Ensure 280 character limit
    return content.length > 280 ? content.substring(0, 277) + '...' : content;
  },

  // Default content
  generateDefault(data) {
    return `NEAR Protocol ecosystem advances accelerate across AI infrastructure and user sovereignty.

Technical developments enable new classes of decentralized applications.

Community builders drive innovation through open source contributions.`;
  }
};

module.exports = template;
