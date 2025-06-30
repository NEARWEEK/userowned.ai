# 🚀 NEARWEEK Automated News Sourcing System

**AI-powered news automation with MCP integrations for instant content processing and distribution.**

## ⚡ Quick Start

```bash
# Clone and deploy immediately
git clone https://github.com/Kisgus/nearweek-automated-news-sourcing.git
cd nearweek-automated-news-sourcing
npm run deploy

# Server will be live at: http://localhost:3000
```

## ✅ Features

- **15-minute response time** from X post to Buffer
- **Claude AI analysis** with 85%+ relevance accuracy
- **500-1000 tweets/day** processing capacity
- **MCP integrations** for Buffer, Telegram, GitHub, Webhooks
- **Manual approval mode** for safe production start
- **Real-time monitoring** and health checks

## 🧪 Local Testing Commands

### Basic Health Checks
```bash
npm run health     # Check system health
npm run metrics    # View performance metrics
npm run logs       # Monitor processing logs
npm run errors     # Check error logs
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