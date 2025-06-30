# 🤖 Claude Code Prompt: NEAR Analytics Dashboard Integration

## **Objective**
Create an automated system that fetches live Dune Analytics data and generates branded analytics dashboard images with embedded metrics for Telegram distribution.

## **Current Problem**
The analytics dashboard currently displays stats as text below the image, but we need the data integrated directly into the dashboard image itself. This requires fetching Dune data **before** Figma image generation.

## **Required System Architecture**

```bash
# Create a complete automation pipeline:

1. DATA FETCHING LAYER
   - Dune Analytics API integration
   - NEAR blockchain data queries
   - Real-time metrics collection
   - Data validation and formatting

2. IMAGE GENERATION LAYER  
   - Figma API integration with UserOwned.AI templates
   - Dynamic data overlay on dashboard images
   - Brand-consistent visual formatting
   - High-quality image export

3. DISTRIBUTION LAYER
   - Telegram bot integration
   - Automated posting with embedded images
   - Multi-format content generation
   - Cross-platform distribution
```

## **Technical Specifications**

### **Data Requirements**
```json
{
  "real_time_metrics": {
    "total_volume": "$9.8M format",
    "total_swaps": "12.1K format", 
    "unique_users": "1.3K format",
    "weekly_range": "$500K - $3.4M format"
  },
  "performance_indicators": {
    "volume_trend": "Strong Upward 📈",
    "user_growth": "Excellent Adoption 🚀",
    "activity_level": "High Activity 🔥",
    "market_position": "Market Leader 👑"
  },
  "system_status": {
    "status": "Strong Adoption",
    "top_chains": "ETH, NEAR, SOL (80%)",
    "weekly_activity": "500-1K transactions"
  }
}
```

### **Figma Integration Workflow**
```bash
# Step-by-step data integration process:

1. FETCH DUNE DATA
   curl -X GET "https://api.dune.com/api/v1/query/{query_id}/results" \
     -H "X-Dune-API-Key: $DUNE_API_KEY"

2. PROCESS AND FORMAT
   node scripts/process-analytics-data.js
   # Convert raw data to dashboard-ready format
   # Apply NEARWEEK formatting standards
   # Validate data completeness

3. UPDATE FIGMA TEMPLATE
   # Use Figma API to populate UserOwned.AI template
   # Overlay metrics directly on dashboard design
   # Maintain brand consistency and visual hierarchy

4. GENERATE FINAL IMAGE
   # Export high-quality PNG/JPG
   # Optimize for Telegram display
   # Include all metrics embedded in visual

5. DISTRIBUTE VIA TELEGRAM
   # Post complete dashboard image
   # Include relevant hashtags and context
   # No separate text metrics needed
```

## **Implementation Requirements**

### **1. Dune Analytics Integration**
```javascript
// Create robust data fetching system
const fetchNEARAnalytics = async () => {
  // Query NEAR Intents performance data
  // Get cross-chain activity metrics  
  // Calculate growth trends and indicators
  // Format for dashboard display
};
```

### **2. Figma Template System**
```javascript
// Dynamic template population
const updateDashboardTemplate = async (analyticsData) => {
  // Connect to UserOwned.AI Figma workspace
  // Update text layers with live data
  // Adjust visual elements based on performance
  // Export final branded image
};
```

### **3. Telegram Integration**
```javascript
// Automated distribution
const postToTelegram = async (dashboardImage, context) => {
  // Send complete image with embedded metrics
  // Include relevant NEAR ecosystem hashtags
  // Maintain NEARWEEK content standards
};
```

## **Expected Output Format**

### **Telegram Post Structure**
```
[DASHBOARD IMAGE WITH EMBEDDED METRICS]

📊 NEAR Intents Live Analytics
🎯 Real-Time Performance Metrics

🏆 Key Insights:
• Volume growth trajectory: Strong upward momentum
• User engagement: Active community participation  
• Transaction frequency: Consistent daily activity
• Market position: Top-tier performance metrics

✅ Data Source: NEAR Intents Dune Dashboard

#NEAR #Intents #Analytics #UserOwnedAI #CrossChain
```

### **Visual Requirements**
- **Brand Consistency**: UserOwned.AI visual identity
- **Data Integration**: All metrics embedded in image
- **Professional Quality**: High-resolution, clean design
- **Real-time Accuracy**: Live data, not static placeholders

## **Success Criteria**

✅ **Data Accuracy**: Real-time Dune Analytics integration  
✅ **Visual Quality**: Professional dashboard with embedded metrics  
✅ **Automation**: Fully automated pipeline from data to distribution  
✅ **Brand Compliance**: UserOwned.AI/NEARWEEK visual standards  
✅ **Performance**: Sub-15 minute update cycle for critical metrics  

## **Command for Claude Code**

```bash
# Execute this comprehensive automation system:
claude-code create-near-analytics-dashboard \
  --dune-integration \
  --figma-templates \
  --telegram-distribution \
  --real-time-metrics \
  --userowned-ai-branding
```

**Priority**: HIGH - This replaces manual dashboard updates with automated, branded, data-rich visual content for NEARWEEK's Telegram audience.

**Expected Outcome**: Complete automation pipeline that generates professional analytics dashboards with live data embedded directly in UserOwned.AI branded images for immediate Telegram distribution.