# 👥 NEARWEEK TEAM ONBOARDING - AUTOMATED CONTENT FLOW

## 🎯 QUICK START GUIDE FOR CONTENT TEAM

### 📱 **DAILY ACCESS POINTS**

```bash
# System Health Check
http://localhost:3000/health

# Performance Metrics
http://localhost:3000/api/metrics

# Content Approval Queue
Buffer → NEARWEEK → Pending Posts

# Team Notifications
Telegram: #nearweek-automation
```

---

## 🔄 **NEW DAILY WORKFLOW**

### **Content Lead (30 min/day)**
```
9:00 AM  - Review overnight automated content (10 min)
10:00 AM - Strategic planning focus (15 min)
5:00 PM  - Performance metrics review (5 min)
```

### **Senior Writers (2 hours/day)**
```
Continuous - Monitor Telegram breaking news alerts
30-min blocks - Edit/enhance AI content in Buffer
2-hour focus - Deep analysis and original content
End of day - Performance review
```

### **Editors (1 hour/day)**
```
Every 2 hours - Review Buffer approval queue (5 min)
Real-time - Respond to high-priority alerts
Morning/Evening - Bulk approve standard content (30 min)
Weekly - Editorial standards review (30 min)
```

### **Social Media Manager (3 hours/day)**
```
Automated - Content posting (handled by system)
Focus time - Community engagement (2 hours)
Strategy time - Optimize schedules/formats (1 hour)
```

---

## 📊 **CONTENT APPROVAL WORKFLOW**

### **⚡ IMMEDIATE (<15 minutes)**
- Breaking news (score 90+)
- Official NEAR announcements
- Major partnerships

**Action**: Review in Buffer → Approve/Edit → Publish

### **📝 STANDARD (<2 hours)**
- High-relevance content (score 80-89)
- Industry trends
- Thought leadership

**Action**: Edit for brand voice → Add context → Schedule

### **🔍 EDITORIAL REVIEW (<24 hours)**
- Medium-relevance content (score 60-79)
- Opinion pieces
- Sensitive topics

**Action**: Deep review → Context research → Strategic edit

---

## 🚨 **EMERGENCY PROCEDURES**

### **Pause System (If Needed)**
```bash
curl -X POST http://localhost:3000/api/admin/pause
```

### **Resume System**
```bash
curl -X POST http://localhost:3000/api/admin/resume
```

### **Check System Status**
```bash
curl http://localhost:3000/api/admin/status
```

### **Emergency Contacts**
- Tech Lead: [phone/slack]
- Content Lead: [phone/slack]
- System Admin: [phone/slack]

---

## 📈 **QUALITY STANDARDS**

### **Content Scoring**
- **90-100**: Breaking news priority
- **80-89**: High priority, quick review
- **60-79**: Standard review process
- **<60**: Auto-filtered, review optional

### **Brand Voice Checklist**
- [ ] Professional but accessible tone
- [ ] Technical accuracy verified
- [ ] NEARWEEK perspective added
- [ ] Call-to-action included
- [ ] Proper attribution/links

### **Quality Gates**
- AI relevance score >85%
- Source credibility verified
- Brand voice alignment
- Fact-checking completed
- Editorial approval obtained

---

## 🔧 **TOOLS & ACCESS**

### **Required Tools**
- **Buffer**: Content approval and scheduling
- **Telegram**: Real-time notifications
- **Slack**: Team communication
- **Browser**: System dashboard access

### **Optional Tools**
- **Zapier**: Workflow monitoring
- **GitHub**: System documentation
- **Analytics**: Performance tracking

---

## 📚 **TRAINING RESOURCES**

### **Documentation**
- [Complete Go-Live Plan](GO-LIVE-PLAN.md)
- [Technical Setup Guide](PRODUCTION-DEPLOYMENT.md)
- [System Testing Results](TESTING-RESULTS.md)

### **Quick Reference**
- System health: http://localhost:3000/health
- Performance: http://localhost:3000/api/metrics
- Buffer queue: buffer.com → NEARWEEK
- Emergency pause: curl -X POST localhost:3000/api/admin/pause

---

## ❓ **FAQ**

**Q: What if I disagree with the AI's content priority?**  
A: Edit the relevance score in Buffer or escalate to Content Lead

**Q: How do I add more context to AI-generated content?**  
A: Edit directly in Buffer before approval, add market analysis

**Q: What if the system goes down?**  
A: Follow emergency procedures, contact Tech Lead immediately

**Q: How do I suggest system improvements?**  
A: Document feedback in weekly retrospective or Slack #automation

**Q: Can I override the AI's content suggestions?**  
A: Yes, you have full editorial control in Buffer approval queue

---

## 🎯 **SUCCESS TIPS**

1. **Check notifications frequently** - Breaking news waits for no one
2. **Edit for brand voice** - AI provides content, you provide perspective
3. **Use the metrics** - Data-driven decisions improve performance
4. **Communicate issues quickly** - Early detection prevents problems
5. **Focus on strategy** - Let automation handle the routine work

---

**🚀 Ready to transform NEARWEEK content production!**