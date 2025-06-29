#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🎨 Creating UserOwned.AI Figma Mockup Templates');
console.log('━'.repeat(50));

// Create output directory
const outputDir = path.join(__dirname, '../public/multimedia-tests');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create SVG templates as placeholders
const templates = [
  {
    name: 'daily-report-header',
    width: 1200,
    height: 400,
    title: 'UserOwned.AI Daily Report',
    subtitle: 'AI x Crypto Ecosystem Intelligence',
    color: '#4299e1'
  },
  {
    name: 'weekly-analytics-chart',
    width: 800,
    height: 600,
    title: 'Weekly Analytics',
    subtitle: 'Performance Metrics Dashboard',
    color: '#667eea'
  },
  {
    name: 'social-media-card',
    width: 1080,
    height: 1080,
    title: 'AI x Crypto Update',
    subtitle: 'Latest Ecosystem Insights',
    color: '#764ba2'
  },
  {
    name: 'newsletter-header',
    width: 600,
    height: 200,
    title: 'UserOwned.AI Newsletter',
    subtitle: 'Weekly Intelligence Brief',
    color: '#2d3748'
  }
];

templates.forEach(template => {
  const svg = `
<svg width="${template.width}" height="${template.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${template.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#grad)" />
  
  <!-- Main Title -->
  <text x="50%" y="40%" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="48" 
        font-weight="bold" 
        fill="white">
    ${template.title}
  </text>
  
  <!-- Subtitle -->
  <text x="50%" y="60%" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="24" 
        fill="rgba(255,255,255,0.9)">
    ${template.subtitle}
  </text>
  
  <!-- Date placeholder -->
  <text x="50%" y="80%" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="16" 
        fill="rgba(255,255,255,0.7)">
    ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
  </text>
  
  <!-- Brand mark -->
  <circle cx="100" cy="100" r="20" fill="rgba(255,255,255,0.3)" />
  <text x="100" y="108" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="16" 
        font-weight="bold" 
        fill="white">
    UO
  </text>
</svg>`.trim();

  // Save SVG file
  fs.writeFileSync(
    path.join(outputDir, `${template.name}.svg`),
    svg
  );
  
  console.log(`✅ Created: ${template.name}.svg (${template.width}x${template.height})`);
});

// Create metadata file
const metadata = {
  timestamp: new Date().toISOString(),
  platform: 'UserOwned.AI',
  source: 'Generated Templates',
  templates: templates.map(t => ({
    name: t.name,
    dimensions: `${t.width}x${t.height}`,
    file: `${t.name}.svg`,
    description: `${t.title} - ${t.subtitle}`
  })),
  nextSteps: [
    'Create actual Figma file with these designs',
    'Replace SVGs with PNG exports from Figma',
    'Integrate with automated report generation'
  ],
  figmaInstructions: {
    fileStructure: 'Create frames with these exact names for API integration',
    naming: templates.map(t => t.name),
    dimensions: 'Use the specified dimensions for each template',
    export: 'Set up auto-export to PNG at 2x resolution'
  }
};

fs.writeFileSync(
  path.join(outputDir, 'figma-templates-metadata.json'),
  JSON.stringify(metadata, null, 2)
);

console.log('\n📊 Created template metadata');
console.log(`📁 Files saved to: ${outputDir}`);

console.log('\n🎯 Next Steps:');
console.log('1. View templates: node scripts/multimedia-viewer.js');
console.log('2. Open http://localhost:3001 to see the designs');
console.log('3. Use these as reference for your Figma file');
console.log('4. Run: node scripts/setup-custom-figma.js (when Figma file ready)');

console.log('\n💡 Figma File Creation Tips:');
console.log('• Create frames with exact names: daily-report-header, weekly-analytics-chart, etc.');
console.log('• Use the specified dimensions for each template');
console.log('• Keep consistent branding and color scheme');
console.log('• Make frames exportable (select frame → Export → PNG)');