# UserOwned.AI Figma Design System

## 🎨 Creating Your Custom Design File

### Step 1: Create New Figma File
1. Go to [figma.com](https://figma.com)
2. Click **"New design file"**
3. Name it: **"UserOwned.AI Content Templates"**

### Step 2: Design Templates to Create

#### 📊 **1. Daily Report Header** (1200x400px)
- **Background**: Gradient (blue #4299e1 to purple #764ba2)
- **Title**: "UserOwned.AI Daily Report"
- **Date**: Dynamic date placeholder
- **Logo**: UserOwned.AI branding
- **Subtitle**: "AI x Crypto Ecosystem Intelligence"

#### 📈 **2. Weekly Analytics Chart** (800x600px)
- **Background**: Clean white with subtle shadow
- **Chart area**: Placeholder for data visualization
- **Title**: "Weekly Performance Metrics"
- **Legend**: AI Tokens, DeFi TVL, Development Activity
- **Footer**: "Powered by UserOwned.AI"

#### 📱 **3. Social Media Card** (1080x1080px)
- **Background**: Brand gradient
- **Main text**: Large, bold insights
- **Data points**: Key metrics highlighting
- **Branding**: UserOwned.AI logo and handle
- **Call to action**: "Get full report at userowned.ai"

#### 📧 **4. Newsletter Header** (600x200px)
- **Clean design** for email newsletters
- **UserOwned.AI branding**
- **Episode/issue number**
- **Professional layout**

#### 🔗 **5. Ecosystem Logos Grid** (1000x800px)
- **Grid layout** for tracked ecosystems
- **NEAR Protocol, Internet Computer, Bittensor, etc.**
- **Clean, organized presentation**
- **Status indicators** (active/monitoring)

### Step 3: Design Guidelines

#### **Color Palette**
- **Primary Blue**: #4299e1
- **Secondary Purple**: #764ba2  
- **Background**: #f7fafc
- **Text Dark**: #2d3748
- **Text Light**: #718096
- **Accent**: #667eea

#### **Typography**
- **Headers**: System fonts (Segoe UI, SF Pro, etc.)
- **Body**: Clean, readable sans-serif
- **Data**: Monospace for numbers

#### **Layout Principles**
- **Clean spacing**: 16px, 24px, 32px grid
- **Consistent margins**: 24px minimum
- **Readable text**: 16px minimum size
- **High contrast**: Ensure accessibility

### Step 4: After Creating the File

1. **Get the File ID** from the URL:
   ```
   https://figma.com/file/YOUR_FILE_ID/UserOwned-AI-Content-Templates
   ```

2. **Update the script** with your new file ID

3. **Test the integration**:
   ```bash
   node scripts/figma-nearweek-generator.js
   ```

### Step 5: Frame Naming Convention

Name your frames clearly for the API:
- `daily-report-header`
- `weekly-analytics-chart`  
- `social-media-card`
- `newsletter-header`
- `ecosystem-logos-grid`

This ensures the automated system can identify and export the right templates.

## 🚀 Quick Start Template

If you want to start quickly, create just **one frame** first:

### **Minimal Setup** (5 minutes)
1. Create new Figma file
2. Add one frame: **1200x400px**
3. Add text: "UserOwned.AI Daily Report"
4. Add background color: #4299e1
5. Name the frame: `daily-header`
6. Get the file ID and test!

Once this works, you can expand with more sophisticated designs.

## 🔗 Integration Benefits

Once set up, your Figma templates will automatically:
- ✅ Export as high-quality PNG images
- ✅ Integrate with daily/weekly reports
- ✅ Post to Telegram with visual content
- ✅ Maintain consistent branding
- ✅ Scale to any new content formats

Ready to create your design file? Let me know when you have the Figma file ID!