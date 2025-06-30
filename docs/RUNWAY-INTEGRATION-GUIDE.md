# 🛬 RUNWAY INTEGRATION GUIDE
## NEARWEEK Content Management & Animation Testing

### 🎯 **INTEGRATION OVERVIEW**

**Objective**: Integrate Runway release management with NEARWEEK content workflow for animation testing and Telegram Pool notifications.

**Pipeline**: `Content Creation` → `Runway Release` → `Animation Distribution` → `Team Review` → `Telegram Publication`

---

## 📊 **RUNWAY API CAPABILITIES FOR NEARWEEK**

### **Release Management**
- **Create Releases**: Track content versions and animation updates
- **Release Steps**: Manage review workflow from draft to publication
- **Team Collaboration**: Assign release pilots and reviewers
- **Status Tracking**: Monitor progress through release pipeline

### **Build Distribution**
- **Animation Storage**: Upload and distribute test animations
- **Team Access**: Control who can review and approve content
- **Version Control**: Track animation iterations and feedback
- **File Management**: Handle MP4, GIF, PNG animation formats

### **Webhook Automation**
- **Real-time Notifications**: Instant Telegram updates on release events
- **Event Triggers**: `release.created`, `release.released`, `buildDistro.newBuildAvailable`
- **Custom Messaging**: Tailored notifications for NEARWEEK team

---

## 🎬 **ANIMATION TEST WORKFLOW**

### **Step 1: Create Animation Release**
```bash
# Create new release for animation testing
curl -X POST "https://api.runway.team/v1/app/nearweek-content/release" \
  -H "X-API-Key: $RUNWAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "v1.0.0-animation-test",
    "releaseType": "release",
    "releaseName": "NEAR Analytics Animation Test",
    "releaseDescription": "Test animation with embedded NEAR stats: $9.8M, 12.1K, 1.3K, $500K-$3.4M"
  }'
```

### **Step 2: Create Animation Bucket**
```bash
# Set up distribution bucket for animations
curl -X POST "https://api.runway.team/v1/app/nearweek-content/bucket" \
  -H "X-API-Key: $RUNWAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NEARWEEK Animations",
    "orgWideAccessEnabled": true,
    "notificationsEnabled": true,
    "rules": [{
      "type": "branch",
      "fileFilterPatterns": ["*.mp4", "*.gif", "*.png"],
      "branch": "main"
    }]
  }'
```

### **Step 3: Upload Test Animation**
```bash
# Upload animation to Build Distro
curl -X POST "https://upload-api.runway.team/v1/app/nearweek-content/bucket/{bucketId}/build" \
  -H "X-API-Key: $RUNWAY_API_KEY" \
  -F "file=@near-analytics-animation.mp4" \
  -F 'data={"testerNotes":"NEAR analytics animation with embedded stats - please review"}'
```

### **Step 4: Set Up Webhook**
```json
{
  "url": "https://your-server.com/webhook/runway",
  "events": [
    "release.created",
    "release.released", 
    "buildDistro.newBuildAvailable"
  ],
  "description": "NEARWEEK Telegram Pool notifications"
}
```

---

## 📱 **TELEGRAM NOTIFICATIONS**

### **Release Created Event**
```
🛬 New NEARWEEK release created

📦 Release: v1.0.0-animation-test
📝 NEAR Analytics Animation Test
👤 Pilot: NEARWEEK_TEAM

#NEARWEEK #Release #Runway
```

### **Animation Available Event**
```
🎬 New animation ready for review

📁 File: near-analytics-animation.mp4
📝 Notes: NEAR analytics with embedded stats
⏰ Created: 2025-06-30, 11:47:50 AM

#NEARWEEK #Animation #Review
```

### **Release Published Event**
```
🚀 NEARWEEK release published!

✅ NEAR Analytics Animation Test (v1.0.0)
📊 NEAR Stats: $9.8M | 12.1K | 1.3K | $500K-$3.4M
⏰ Released: 2025-06-30, 11:47:50 AM

#NEARWEEK #Published #NEARStats
```

---

## 🔧 **IMPLEMENTATION COMMANDS**

### **Setup Environment**
```bash
# Add Runway API key to environment
echo "RUNWAY_API_KEY=your_runway_api_key" >> .env

# Install dependencies if needed
npm install https form-data
```

### **Test Integration**
```bash
# Run complete Runway integration test
node scripts/runway-nearweek-integration.js

# Expected output:
# ✅ Release created: v1.0.0-animation-test-[timestamp]
# ✅ Bucket created: NEARWEEK Animations  
# ✅ Animation generated: near-test-animation.mp4
# ✅ Build uploaded: build-[timestamp]
# ✅ Webhook configuration ready
# ✅ Telegram notifications: 2 messages sent
```

### **Manual Animation Upload**
```bash
# Create animation directory
mkdir -p public/animations

# Generate test animation (placeholder)
echo '{"title":"NEAR Analytics","stats":{"volume":"$9.8M"}}' > public/animations/test.json

# Upload via Runway API
node scripts/upload-animation-to-runway.js public/animations/test.json
```

---

## 🎯 **INTEGRATION BENEFITS**

### **For Content Team**
- **Streamlined Workflow**: Automated release tracking and notifications
- **Version Control**: Clear animation iteration management
- **Team Collaboration**: Built-in review and approval process
- **Quality Assurance**: Systematic testing before public release

### **For NEARWEEK Audience**
- **Timely Updates**: Instant Telegram notifications on new content
- **Professional Quality**: Systematic review ensures high standards
- **Consistent Delivery**: Reliable release pipeline
- **Engagement**: Animations with embedded NEAR analytics data

### **For Technical Team**
- **API Integration**: Runway API provides robust release management
- **Webhook Automation**: Real-time event-driven notifications
- **Scalable Process**: Handles increased content volume
- **Monitoring**: Clear visibility into release pipeline status

---

## 📈 **SUCCESS METRICS**

### **Release Management**
- **Release Velocity**: Track time from creation to publication
- **Team Efficiency**: Measure review and approval cycle times
- **Quality Gates**: Monitor approval rates and feedback loops
- **Content Volume**: Scale animation production systematically

### **Telegram Engagement**
- **Notification Delivery**: 100% webhook delivery rate
- **Response Time**: <5 minute notification latency
- **Message Quality**: Formatted updates with embedded data
- **Audience Growth**: Track Pool group engagement with animations

### **Animation Quality**
- **Review Process**: Systematic feedback collection
- **Iteration Tracking**: Version control for animation improvements
- **NEAR Data Integration**: Consistent stats embedding
- **Distribution Efficiency**: Streamlined team access

---

## 🚀 **EXECUTION CHECKLIST**

### **Immediate Setup (Today)**
- [ ] Create Runway API key and add to environment
- [ ] Run integration test script
- [ ] Create NEARWEEK app in Runway
- [ ] Set up animation distribution bucket
- [ ] Configure webhook for Telegram notifications

### **First Animation Test (This Week)**
- [ ] Generate test animation with NEAR stats overlay
- [ ] Upload to Runway Build Distro
- [ ] Distribute to team for review
- [ ] Collect feedback and iterate
- [ ] Publish to Telegram Pool

### **Production Workflow (Ongoing)**
- [ ] Establish regular animation release schedule
- [ ] Train team on Runway workflow
- [ ] Monitor webhook reliability
- [ ] Optimize notification formats
- [ ] Scale animation production

---

**🎬 Status: Ready for Runway integration testing with NEARWEEK animation workflow and Telegram Pool notifications**