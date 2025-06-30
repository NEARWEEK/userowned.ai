# 🚀 UserOwned.AI Intelligence Network

**AI-powered intelligence platform combining NEARWEEK automation with UserOwned.AI newsletter system for comprehensive AI × crypto ecosystem monitoring.**

## ⚡ Quick Start

```bash
# Clone and deploy immediately
git clone https://github.com/NEARWEEK/userowned.ai.git
cd userowned.ai
npm install
npm run deploy

# Server will be live at: http://localhost:3000
```

## ✅ Core Features

### NEARWEEK Automation System
- **15-minute response time** from X post to Buffer
- **Claude AI analysis** with 85%+ relevance accuracy
- **500-1000 tweets/day** processing capacity
- **MCP integrations** for Buffer, Telegram, GitHub, Webhooks
- **Manual approval mode** for safe production start
- **Real-time monitoring** and health checks

### UserOwned.AI Newsletter System
- **Following-based curation** from @userownedai's network
- **Intelligent content scoring** with AI/crypto keyword detection
- **Multi-format output** (HTML, Markdown, JSON)
- **Telegram integration** for POOL group distribution
- **Rate-limited X API** integration with fallback mechanisms

## 🧪 Local Testing Commands

### Basic Health Checks
```bash
npm run health     # Check system health
npm run metrics    # View performance metrics
npm run logs       # Monitor processing logs
npm run errors     # Check error logs
```

### Newsletter Testing
```bash
npm run newsletter:test      # Test newsletter generation
npm run newsletter:daily     # Generate daily newsletter
node scripts/quick-telegram-send.js  # Send to Telegram
```

### Content Testing
```bash
npm run test-webhook   # Test webhook processing
npm run test-analysis  # Test content analysis
```

### System Controls
```bash
npm run pause    # Pause processing
npm run resume   # Resume processing
```

## 🔧 Configuration

### MCP Integrations (No API keys needed)
- ✅ **Buffer**: NEARWEEK organization
- ✅ **Telegram**: Team notifications
- ✅ **GitHub**: Automated issue tracking
- ✅ **Zapier**: Webhook processing

### Environment Variables
```bash
# MCP integrations (pre-configured)
USE_MCP_BUFFER=true
USE_MCP_TELEGRAM=true
USE_MCP_GITHUB=true
USE_MCP_WEBHOOKS=true

# Safety features
ENABLE_AUTO_POSTING=false  # Manual approval mode
CONFIDENCE_THRESHOLD=85
RELEVANCE_THRESHOLD=60
```

## 📊 API Endpoints

### Health & Monitoring
- `GET /health` - System health check
- `GET /api/metrics` - Performance metrics
- `GET /api/admin/status` - Admin status

### Content Processing
- `POST /webhook/x-api` - Main webhook endpoint
- `POST /api/analyze` - Content analysis

### Testing
- `POST /api/test/buffer` - Test Buffer integration
- `POST /api/test/telegram` - Test Telegram integration
- `POST /api/test/github` - Test GitHub integration

### Admin Controls
- `POST /api/admin/pause` - Pause processing
- `POST /api/admin/resume` - Resume processing

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Response Time | <15 minutes | ✅ Ready |
| Relevance Accuracy | 85%+ | ✅ Claude AI |
| Processing Volume | 500-1000/day | ✅ Auto-scaling |
| Uptime | 99%+ | ✅ Monitoring |
| Error Rate | <5% | ✅ Handling |

## 🚨 Safety Features

- **Manual Approval**: All content queued for human review
- **Spam Filtering**: Automatic low-quality content removal
- **Rate Limiting**: Prevents system overload
- **Emergency Controls**: Instant pause/resume capability
- **Audit Logging**: Complete processing trail

## 🔍 Monitoring

### Real-time Logs
```bash
tail -f logs/automation.log  # Processing logs
tail -f logs/error.log       # Error logs
tail -f logs/access.log      # Access logs
```

### Health Dashboard
- **Health**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/api/metrics
- **Status**: http://localhost:3000/api/admin/status

## 🎛️ Production Deployment

### Option 1: Simple Start
```bash
npm start
```

### Option 2: Process Manager
```bash
npm install -g pm2
pm2 start src/server.js --name nearweek-news
pm2 save
pm2 startup
```

### Option 3: Docker
```bash
docker build -t nearweek/news-sourcing .
docker run -d --name nearweek-news -p 3000:3000 nearweek/news-sourcing
```

## 🆘 Troubleshooting

### Common Issues

**Server won't start**:
```bash
lsof -i :3000  # Check if port is busy
kill $(lsof -t -i:3000)  # Kill process on port 3000
```

**High memory usage**:
```bash
pkill -f "node src/server.js"  # Stop server
rm logs/*.log  # Clear large log files
npm start  # Restart
```

**MCP integrations failing**:
```bash
cat .env | grep MCP  # Verify MCP settings
DEBUG=* npm start  # Start with debug logging
```

## 📈 Success Metrics

✅ **Speed**: Sub-15 minute automated response  
✅ **Quality**: 85%+ relevance via Claude AI  
✅ **Scale**: 500-1000 tweets/day capacity  
✅ **Safety**: Manual approval with audit trails  
✅ **Reliability**: 99%+ uptime monitoring  
✅ **Integration**: Full MCP ecosystem connectivity  

## 🔗 Links

- **Repository**: https://github.com/Kisgus/nearweek-automated-news-sourcing
- **Issues**: https://github.com/Kisgus/nearweek-automated-news-sourcing/issues
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/api/metrics

---

**Status: 🟢 Production Ready - MCP Integrated**
=======
# 🤖 UserOwned.ai - Enhanced Intelligence Platform

> The most comprehensive AI x crypto ecosystem intelligence platform, now with modular template architecture inspired by NEARWEEK/CORE

## 🚀 **v2.1 Architecture Overview**

### **Modular Template System**
UserOwned.ai now features a sophisticated template system similar to NEARWEEK/CORE, enabling easy addition of new content types and intelligence reports.

```
src/
├── templates/           # Content template definitions
│   ├── daily-ecosystem-analysis.js
│   ├── weekly-market-update.js  
│   ├── project-spotlight.js
│   ├── vc-intelligence-report.js
│   ├── index.js         # Template registry
│   └── config.js        # Template configurations
├── engine/              # Execution engines
│   ├── enhanced-github-collector.js
│   ├── enhanced-github-collector-v2.js  # New with improved reliability
│   ├── template-executor.js
│   ├── data-collector.js
│   └── channel-distributor.js
├── utils/               # New reliability utilities
│   ├── logger.js        # Enhanced structured logging
│   ├── error-handler.js # Robust error handling with retries
│   ├── validation.js    # Input validation
│   ├── rate-limiter.js  # API rate limiting
│   ├── config.js        # Configuration management
│   └── health-check.js  # System health monitoring
└── scripts/             # CLI tools
    ├── template-runner.js
    ├── run-template.js  # New with improved reliability
    └── health-check.js  # New system health checker
```

## 📊 **Available Templates**

### 1. **Daily Ecosystem Analysis** 
- **Schedule**: 14:40 CET daily
- **Channels**: Telegram, X, GitHub Issues
- **Content**: Comprehensive AI x crypto ecosystem scores

### 2. **Weekly Market Update**
- **Schedule**: Mondays 14:00 CET  
- **Channels**: Telegram, X, GitHub Issues
- **Content**: Weekly trends and performance analysis

### 3. **Project Spotlight**
- **Schedule**: Manual trigger
- **Channels**: Telegram, X, GitHub Issues
- **Content**: Deep-dive analysis of specific projects

### 4. **VC Intelligence Report**
- **Schedule**: Mondays 09:00 CET
- **Channels**: GitHub Issues (Premium)
- **Content**: Institutional-grade investment analysis

## 🔧 **Adding New Templates**

To add a new content type (like NEARWEEK/CORE):

### Step 1: Create Template File
```javascript
// src/templates/my-new-template.js
const { logger } = require('../utils'); // Use new utilities

const template = {
  name: 'My New Template',
  type: 'my-new-template',
  schedule: '0 12 * * *', // Daily at 12:00
  channels: ['telegram', 'x'],
  
  async generate(data) {
    logger.info('Generating my-new-template content');
    
    return {
      telegram: this.generateTelegram(data),
      x: this.generateX(data),
      metadata: {
        templateType: 'my-new-template',
        timestamp: new Date().toISOString()
      }
    };
  },
  
  generateTelegram(data) {
    return `🚀 My New Content...`;
  },
  
  generateX(data) {
    return `🚀 My New Content (X version)...`;
  }
};

module.exports = template;
```

### Step 2: Register Template
```javascript
// src/templates/index.js
const myNewTemplate = require('./my-new-template');

const templates = {
  'daily-ecosystem': dailyEcosystemAnalysis,
  'my-new-template': myNewTemplate, // Add here
  // ... other templates
};
```

### Step 3: Add Configuration
```javascript
// src/templates/config.js
schedules: {
  'my-new-template': {
    cron: '0 12 * * *',
    timezone: 'Europe/Berlin',
    enabled: true,
    channels: ['telegram', 'x']
  }
}
```

### Step 4: Test Template
```bash
node src/scripts/run-template.js my-new-template
```

## 🎯 **Usage**

### **Manual Execution**
```bash
# Run daily ecosystem analysis
node src/scripts/run-template.js daily-ecosystem

# Run weekly market update
node src/scripts/run-template.js weekly-market

# Run weekly market update and post to channels
node src/scripts/run-template.js weekly-market --post

# Run in dry-run mode (no posting)
node src/scripts/run-template.js daily-ecosystem --dry-run

# Run project spotlight for specific project
node src/scripts/run-template.js project-spotlight --project=NEAR

# Run VC intelligence report
node src/scripts/run-template.js vc-intelligence
```

### **Automated Execution**
Templates run automatically via GitHub Actions:
- **Daily**: 14:40 CET - Ecosystem analysis
- **Weekly**: Monday 14:00 CET - Market update
- **Weekly**: Monday 09:00 CET - VC intelligence

### **Manual Trigger**
Use GitHub Actions "Run workflow" to trigger any template manually.

## 📊 **Data Sources**

### **Currently Integrated**
- ✅ **GitHub API**: Development metrics, commit velocity
- ✅ **DefiLlama**: TVL, financial performance
- ✅ **On-chain Analytics**: Transaction data, adoption metrics
- 🔄 **DappRadar**: DApp ecosystem usage (coming soon)
- 🔄 **Dune Analytics**: Advanced on-chain queries (coming soon)

### **Tracked Ecosystems**
1. **NEAR Protocol** - AI infrastructure leader
2. **Internet Computer** - On-chain AI hosting
3. **Bittensor** - Decentralized machine learning
4. **The Graph** - AI data indexing
5. **Injective** - AI-powered DeFi
6. **Fetch.ai** - Autonomous agents
7. **Akash Network** - Decentralized compute
8. **Render Network** - GPU rendering

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Required
GITHUB_TOKEN=your_github_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
ZAPIER_WEBHOOK_URL=your_zapier_webhook

# Optional
NODE_ENV=production     # Environment (development, staging, production)
LOG_LEVEL=info          # Logging level (debug, info, warn, error)
ENABLE_DRY_RUN=false    # Enable dry run mode
DUNE_API_KEY=your_dune_api_key
DAPPRADAR_API_KEY=your_dappradar_key
```

### **GitHub Secrets Setup**
1. Go to repository Settings → Secrets and Variables → Actions
2. Add each environment variable as a repository secret
3. Templates will automatically use these for authentication

## 🔄 **Migration from v1.0**

The enhanced v2.1 system maintains full backward compatibility:
- ✅ Existing automation continues working
- ✅ Same posting schedule maintained
- ✅ Enhanced content quality and precision
- ✅ New modular architecture for easy expansion
- ✅ Improved reliability and error handling

## 🛡️ **New Reliability Features (v2.1)**

### **Enhanced Error Handling**
- ✅ Automatic retries for API calls and operations
- ✅ Circuit breaker pattern to prevent cascading failures
- ✅ Fallback mechanisms for critical operations
- ✅ Graceful shutdown handling

### **Structured Logging**
- ✅ Comprehensive logging with multiple levels
- ✅ File and console output
- ✅ JSON-formatted logs for easier parsing
- ✅ Context-rich error reporting

### **Input Validation**
- ✅ Thorough validation of all inputs
- ✅ Specific validation for GitHub repositories
- ✅ URL and data format validation

### **Rate Limiting**
- ✅ Automatic rate limiting for all API calls
- ✅ Configurable limits per API
- ✅ Prevents API abuse and throttling

### **Health Monitoring**
- ✅ System health checks for all services
- ✅ Detailed status reporting
- ✅ Early detection of API issues

### **Configuration Management**
- ✅ Environment-specific configurations
- ✅ Centralized config management
- ✅ Feature flags for gradual rollouts

## 🏗️ **Architecture Benefits**

### **vs NEARWEEK/CORE Comparison**
| Feature | userowned.ai v2.1 | NEARWEEK/CORE | Status |
|---------|-------------------|---------------|--------|
| **Modular Templates** | ✅ | ✅ | **MATCHED** |
| **Template Registry** | ✅ | ✅ | **MATCHED** |
| **Multi-channel Distribution** | ✅ | ✅ | **MATCHED** |
| **Professional Error Handling** | ✅ | ✅ | **MATCHED** |
| **Advanced Calculations** | ✅ | ✅ | **MATCHED** |
| **Structured Logging** | ✅ | ✅ | **MATCHED** |
| **Rate Limiting** | ✅ | ✅ | **MATCHED** |
| **Health Monitoring** | ✅ | ✅ | **MATCHED** |
| **Backend API** | 🔄 | ✅ | **PHASE 2** |
| **Database Persistence** | 🔄 | ✅ | **PHASE 2** |

### **Key Improvements**
- 🚀 **Easy Content Addition**: Add new templates in minutes
- 🔧 **Modular Architecture**: Each template is self-contained
- 📊 **Enhanced Data Quality**: Multi-source verification
- 🎯 **Professional Distribution**: Advanced channel management
- 🔄 **Template Reusability**: Share templates across projects
- 🛡️ **Enterprise-grade Reliability**: Robust error handling and monitoring

## 📈 **Next Steps**

### **Phase 2: Backend API (Weeks 2-3)**
- RESTful API endpoints
- PostgreSQL database integration
- Historical data storage
- Real-time dashboard updates

### **Phase 3: Advanced Analytics (Weeks 3-4)**
- Machine learning scoring models
- Predictive trend analysis
- Custom investor dashboards
- Enterprise API access

## 🎯 **Success Metrics**

### **Current Status**
- ✅ **Templates**: 4 types operational
- ✅ **Automation**: 100% uptime
- ✅ **Data Quality**: Multi-source verification
- ✅ **Distribution**: 3 channels active
- ✅ **Reliability**: Enterprise-grade error handling and monitoring

### **Goals**
- 🎯 **Week 1**: 6+ template types
- 🎯 **Month 1**: Backend API operational
- 🎯 **Quarter 1**: 15+ AI ecosystems tracked

---

## 🔗 **Links**

- **Website**: [userowned.ai](https://userowned.ai)
- **X Account**: [@userownedai](https://x.com/userownedai)
- **Parent Brand**: [@NEARWEEK](https://x.com/NEARWEEK)
- **GitHub**: [NEARWEEK/userowned.ai](https://github.com/NEARWEEK/userowned.ai)

---

**UserOwned.ai by NEARWEEK** | *Building the Bloomberg Terminal for AI x crypto convergence*
