# 🔧 ZAPIER ZAP CREATION TEMPLATE
## UserOwned.ai Account Monitoring Setup

### 📋 **MASTER TEMPLATE**

#### **Step 1: Create New Zap**
1. Log into Zapier
2. Click "Create Zap"
3. Name: "NEARWEEK - [ACCOUNT_NAME] Monitor"

#### **Step 2: Set Trigger**
```
App: Twitter
Event: New Tweet by User
Account: Connect your Twitter account
Twitter User: [USERNAME_WITHOUT_@]
Advanced Options:
  - Include Retweets: No
  - Include Replies: No
```

#### **Step 3: Set Filter (Optional but Recommended)**
```
Filter Setup:
  Tweet Favorite Count >= [ENGAGEMENT_THRESHOLD]
  OR
  Tweet Retweet Count >= [RETWEET_THRESHOLD]
```

#### **Step 4: Set Action**
```
App: Webhooks by Zapier
Event: POST
URL: http://localhost:3000/webhook/x-api
Payload Type: JSON
Data:
  account: [USERNAME]
  text: {{tweet_text}}
  url: {{tweet_url}}
  likes: {{tweet_favorite_count}}
  retweets: {{tweet_retweet_count}}
  created_at: {{tweet_created_at}}
  priority: [PRIORITY_LEVEL]
  source: userowned_ai
```

#### **Step 5: Test & Activate**
1. Test the trigger
2. Test the webhook
3. Review and turn on

---

### 🎯 **SPECIFIC ACCOUNT CONFIGURATIONS**

#### **ZAP 1: @bittensor_ (CRITICAL)**
```
Name: NEARWEEK - Bittensor Monitor
Twitter User: bittensor_
Filter: Favorite Count >= 5 OR Retweet Count >= 3
Data:
  account: bittensor_
  priority: CRITICAL
  keywords: ["AI", "bittensor", "network", "decentralized", "TAO"]
```

#### **ZAP 2: @AethirCloud (HIGH)**
```
Name: NEARWEEK - Aethir Monitor
Twitter User: AethirCloud
Filter: Favorite Count >= 10 OR Retweet Count >= 5
Data:
  account: AethirCloud
  priority: HIGH
  keywords: ["AI", "decentralized", "cloud", "compute", "infrastructure"]
```

#### **ZAP 3: @KaitoAI (HIGH)**
```
Name: NEARWEEK - Kaito AI Monitor
Twitter User: KaitoAI
Filter: Favorite Count >= 15 OR Retweet Count >= 8
Data:
  account: KaitoAI
  priority: HIGH
  keywords: ["AI", "crypto", "data", "capital", "attention"]
```

#### **ZAP 4: @rendernetwork (HIGH)**
```
Name: NEARWEEK - Render Network Monitor
Twitter User: rendernetwork
Filter: Favorite Count >= 12 OR Retweet Count >= 6
Data:
  account: rendernetwork
  priority: HIGH
  keywords: ["GPU", "rendering", "network", "distributed", "compute"]
```

#### **ZAP 5: @virtuals_io (HIGH)**
```
Name: NEARWEEK - Virtuals Protocol Monitor
Twitter User: virtuals_io
Filter: Favorite Count >= 10 OR Retweet Count >= 5
Data:
  account: virtuals_io
  priority: HIGH
  keywords: ["AI", "agents", "virtuals", "protocol", "autonomous"]
```

#### **ZAP 6: @base (MEDIUM)**
```
Name: NEARWEEK - Base Monitor
Twitter User: base
Filter: (Favorite Count >= 20 OR Retweet Count >= 10) AND Text Contains "AI"
Data:
  account: base
  priority: MEDIUM
  keywords: ["AI", "onchain", "ethereum", "superchain", "L2"]
```

#### **ZAP 7: @NEARProtocol (CRITICAL)**
```
Name: NEARWEEK - NEAR Protocol Monitor
Twitter User: NEARProtocol
Filter: No filter (all tweets)
Data:
  account: NEARProtocol
  priority: CRITICAL
  keywords: ["NEAR", "AI", "blockchain", "protocol"]
```

---

### ⏱️ **SETUP TIMING**

```bash
# Per Zap Timing
Zap Creation: 2 minutes
Testing: 1 minute
Total per zap: 3 minutes

# Total for 7 zaps: 21 minutes
# Realistic with breaks: 30 minutes
```

### 🧪 **TESTING CHECKLIST**

```bash
# For each zap:
☐ Trigger test successful
☐ Filter working correctly  
☐ Webhook endpoint responding
☐ JSON payload format correct
☐ Zap activated and running

# System test:
☐ Webhook logs showing data
☐ Processing pipeline working
☐ No duplicate processing
☐ Error handling functional
```

### 🔧 **WEBHOOK PAYLOAD STRUCTURE**

```json
{
  "account": "bittensor_",
  "text": "Tweet content here...",
  "url": "https://twitter.com/bittensor_/status/123456789",
  "likes": 25,
  "retweets": 8,
  "created_at": "2025-06-30T10:30:00Z",
  "priority": "CRITICAL",
  "source": "userowned_ai",
  "keywords": ["AI", "bittensor", "network"]
}
```

### ⚠️ **COMMON ISSUES & SOLUTIONS**

| Issue | Solution |
|-------|----------|
| Webhook not receiving data | Check URL spelling and endpoint status |
| Too many/few tweets | Adjust engagement thresholds |
| Filter not working | Check filter logic and test data |
| Zap fails | Check Twitter account permissions |
| Rate limiting | Space out zap creation, don't test all at once |

### 📈 **MONITORING & OPTIMIZATION**

```bash
# Week 1: Monitor performance
- Check webhook logs for data flow
- Validate relevance scores
- Adjust engagement thresholds if needed

# Month 1: Optimization
- Review which accounts provide best content
- Fine-tune filters based on performance
- Document baseline for scaling decisions
```

---

**🎯 Status: Ready for manual zap creation using these exact templates**