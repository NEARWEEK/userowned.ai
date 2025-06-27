# 🤖 UserOwned.ai - Enhanced Intelligence Platform

> The most comprehensive AI x crypto ecosystem intelligence platform, now with modular template architecture inspired by NEARWEEK/CORE

## 🚀 **v2.0 Architecture Overview**

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
│   ├── template-executor.js
│   ├── data-collector.js
│   └── channel-distributor.js
└── scripts/             # CLI tools
    └── template-runner.js
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
const template = {
  name: 'My New Template',
  type: 'my-new-template',
  schedule: '0 12 * * *', // Daily at 12:00
  channels: ['telegram', 'x'],
  
  async generate(data) {
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
node scripts/template-runner.js my-new-template
```

## 🎯 **Usage**

### **Manual Execution**
```bash
# Run daily ecosystem analysis
node scripts/template-runner.js daily-ecosystem

# Run weekly market update
node scripts/template-runner.js weekly-market

# Run project spotlight for specific project
node scripts/template-runner.js project-spotlight --project=NEAR

# Run VC intelligence report
node scripts/template-runner.js vc-intelligence
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
DUNE_API_KEY=your_dune_api_key
DAPPRADAR_API_KEY=your_dappradar_key
```

### **GitHub Secrets Setup**
1. Go to repository Settings → Secrets and Variables → Actions
2. Add each environment variable as a repository secret
3. Templates will automatically use these for authentication

## 🔄 **Migration from v1.0**

The enhanced v2.0 system maintains full backward compatibility:
- ✅ Existing automation continues working
- ✅ Same posting schedule maintained
- ✅ Enhanced content quality and precision
- ✅ New modular architecture for easy expansion

## 🏗️ **Architecture Benefits**

### **vs NEARWEEK/CORE Comparison**
| Feature | userowned.ai v2.0 | NEARWEEK/CORE | Status |
|---------|-------------------|---------------|--------|
| **Modular Templates** | ✅ | ✅ | **MATCHED** |
| **Template Registry** | ✅ | ✅ | **MATCHED** |
| **Multi-channel Distribution** | ✅ | ✅ | **MATCHED** |
| **Professional Error Handling** | ✅ | ✅ | **MATCHED** |
| **Advanced Calculations** | ✅ | ✅ | **MATCHED** |
| **Backend API** | 🔄 | ✅ | **PHASE 2** |
| **Database Persistence** | 🔄 | ✅ | **PHASE 2** |

### **Key Improvements**
- 🚀 **Easy Content Addition**: Add new templates in minutes
- 🔧 **Modular Architecture**: Each template is self-contained
- 📊 **Enhanced Data Quality**: Multi-source verification
- 🎯 **Professional Distribution**: Advanced channel management
- 🔄 **Template Reusability**: Share templates across projects

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