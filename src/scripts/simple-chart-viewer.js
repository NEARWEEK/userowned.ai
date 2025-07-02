#!/usr/bin/env node

/**
 * Simple Chart Viewer for NEARWEEK Analytics
 * Creates basic HTML files to view your chart data
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

class SimpleChartViewer {
  constructor() {
    this.port = 3001;
    this.outputDir = './chart-output';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Generate simple HTML dashboard
  async generateSimpleDashboard() {
    console.log('📊 Generating simple chart dashboard...');

    try {
      // Get existing data or create sample data
      let chartData;
      try {
        chartData = JSON.parse(fs.readFileSync('./claude-chart-data.json', 'utf8'));
      } catch (error) {
        console.log('📝 No existing chart data found, creating sample data...');
        chartData = this.generateSampleData();
        fs.writeFileSync('./claude-chart-data.json', JSON.stringify(chartData, null, 2));
      }

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEARWEEK Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .metric-label { color: #666; margin-top: 8px; }
        .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .chart-title { font-size: 1.2em; font-weight: bold; margin-bottom: 20px; text-align: center; }
        canvas { max-height: 300px; }
        .data-preview { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
        .data-content { background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow: auto; max-height: 300px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 NEARWEEK Analytics Dashboard</h1>
            <p>Real-time insights from your AI x Crypto ecosystem</p>
            <small>Generated: ${new Date().toLocaleString()}</small>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${chartData.metrics?.followers || '25K'}</div>
                <div class="metric-label">Total Followers</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${chartData.metrics?.commits || '312'}</div>
                <div class="metric-label">GitHub Commits</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${chartData.metrics?.healthScore || '87.5'}</div>
                <div class="metric-label">Health Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${chartData.metrics?.automation || '82.9'}%</div>
                <div class="metric-label">Automated</div>
            </div>
        </div>

        <div class="charts">
            <div class="chart-container">
                <div class="chart-title">📱 Social Media Engagement</div>
                <canvas id="socialChart"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">🐙 GitHub Activity</div>
                <canvas id="githubChart"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">📝 Content Performance</div>
                <canvas id="contentChart"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">🌐 Ecosystem Health</div>
                <canvas id="ecosystemChart"></canvas>
            </div>
        </div>

        <div class="data-preview">
            <h3>📋 Data Preview</h3>
            <div class="data-content">
                <pre>${JSON.stringify(chartData, null, 2).substring(0, 1000)}...</pre>
            </div>
        </div>
    </div>

    <script>
        const data = ${JSON.stringify(chartData, null, 2)};
        
        // Social Media Chart
        const socialCtx = document.getElementById('socialChart').getContext('2d');
        new Chart(socialCtx, {
            type: 'line',
            data: {
                labels: data.social?.timeline || ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [{
                    label: 'Engagement',
                    data: data.social?.engagement || [120, 145, 98, 167, 189, 156, 203],
                    borderColor: '#1DA1F2',
                    backgroundColor: 'rgba(29, 161, 242, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Posts',
                    data: data.social?.posts || [5, 8, 6, 9, 11, 7, 12],
                    borderColor: '#168EEA',
                    backgroundColor: 'rgba(22, 142, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });

        // GitHub Activity Chart
        const githubCtx = document.getElementById('githubChart').getContext('2d');
        new Chart(githubCtx, {
            type: 'bar',
            data: {
                labels: data.github?.timeline || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Commits',
                    data: data.github?.commits || [45, 52, 38, 61],
                    backgroundColor: 'rgba(51, 51, 51, 0.8)'
                }, {
                    label: 'Pull Requests',
                    data: data.github?.prs || [8, 12, 6, 15],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });

        // Content Performance Chart
        const contentCtx = document.getElementById('contentChart').getContext('2d');
        new Chart(contentCtx, {
            type: 'doughnut',
            data: {
                labels: data.content?.types || ['AI x Crypto', 'NEAR Protocol', 'DeFi', 'Development', 'General'],
                datasets: [{
                    data: data.content?.values || [45, 32, 28, 23, 18],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB', 
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Ecosystem Health Chart
        const ecosystemCtx = document.getElementById('ecosystemChart').getContext('2d');
        new Chart(ecosystemCtx, {
            type: 'radar',
            data: {
                labels: data.ecosystem?.components || ['Development', 'Community', 'Content', 'Growth', 'Innovation'],
                datasets: [{
                    label: 'Health Score',
                    data: data.ecosystem?.scores || [92, 85, 89, 83, 88],
                    borderColor: '#00D4AA',
                    backgroundColor: 'rgba(0, 212, 170, 0.2)',
                    pointBackgroundColor: '#00D4AA'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        console.log('📊 NEARWEEK Charts loaded successfully!');
        console.log('Data:', data);
    </script>
</body>
</html>`;

      fs.writeFileSync(path.join(this.outputDir, 'dashboard.html'), html);
      console.log('✅ Dashboard created at: chart-output/dashboard.html');
      
      return path.resolve(this.outputDir, 'dashboard.html');

    } catch (error) {
      console.error('❌ Failed to generate dashboard:', error.message);
      throw error;
    }
  }

  // Start simple Express server
  startServer() {
    const app = express();
    
    // Serve static files
    app.use('/chart-output', express.static(this.outputDir));
    
    // Main route
    app.get('/', (req, res) => {
      const dashboardPath = path.join(this.outputDir, 'dashboard.html');
      if (fs.existsSync(dashboardPath)) {
        res.sendFile(path.resolve(dashboardPath));
      } else {
        res.send(`
          <h1>NEARWEEK Chart Viewer</h1>
          <p>Dashboard not found. Run: <code>npm run charts:generate</code></p>
          <p>Then visit: <a href="/chart-output/dashboard.html">Dashboard</a></p>
        `);
      }
    });

    // API endpoint for data
    app.get('/api/data', (req, res) => {
      try {
        const data = JSON.parse(fs.readFileSync('./claude-chart-data.json', 'utf8'));
        res.json(data);
      } catch (error) {
        res.status(404).json({ error: 'Chart data not found' });
      }
    });

    app.listen(this.port, () => {
      console.log(`📊 NEARWEEK Chart Viewer running at:`);
      console.log(`🌐 http://localhost:${this.port}`);
      console.log(`📁 File: ${path.resolve(this.outputDir, 'dashboard.html')}`);
    });
  }

  // Generate sample data if none exists
  generateSampleData() {
    return {
      metadata: {
        generated_at: new Date().toISOString(),
        source: 'nearweek-analytics',
        version: '2.1.0'
      },
      metrics: {
        followers: '25.2K',
        commits: 312,
        healthScore: 87.5,
        automation: 82.9
      },
      social: {
        timeline: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        engagement: [120, 145, 98, 167, 189, 156, 203],
        posts: [5, 8, 6, 9, 11, 7, 12],
        reach: [2500, 3100, 2800, 3400, 3800, 3200, 4100]
      },
      github: {
        timeline: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        commits: [45, 52, 38, 61],
        prs: [8, 12, 6, 15],
        issues: [15, 18, 12, 22]
      },
      content: {
        types: ['AI x Crypto', 'NEAR Protocol', 'DeFi Analytics', 'Development', 'General Tech'],
        values: [45, 32, 28, 23, 18],
        engagement: [87.5, 82.1, 78.3, 75.6, 68.2]
      },
      ecosystem: {
        components: ['Development', 'Community', 'Content Quality', 'Growth Rate', 'Innovation'],
        scores: [92, 85, 89, 83, 88],
        overall_score: 87.5
      }
    };
  }

  // Open dashboard in default browser
  openDashboard() {
    const dashboardPath = path.resolve(this.outputDir, 'dashboard.html');
    
    if (fs.existsSync(dashboardPath)) {
      const open = require('child_process').exec;
      const command = process.platform === 'darwin' ? 'open' : 
                     process.platform === 'win32' ? 'start' : 'xdg-open';
      
      open(`${command} ${dashboardPath}`, (error) => {
        if (error) {
          console.log(`📁 Open manually: file://${dashboardPath}`);
        } else {
          console.log('🌐 Dashboard opened in browser');
        }
      });
    } else {
      console.log('❌ Dashboard not found. Run: npm run charts:generate');
    }
  }
}

// CLI execution
const args = process.argv.slice(2);
const command = args[0] || 'help';

const viewer = new SimpleChartViewer();

switch (command) {
  case 'generate':
    viewer.generateSimpleDashboard();
    break;
    
  case 'server':
    viewer.startServer();
    break;
    
  case 'view':
    viewer.generateSimpleDashboard().then(() => {
      viewer.openDashboard();
    });
    break;
    
  case 'open':
    viewer.openDashboard();
    break;
    
  default:
    console.log(`
📊 NEARWEEK Simple Chart Viewer

USAGE:
  node src/scripts/simple-chart-viewer.js [command]

COMMANDS:
  generate  - Create dashboard HTML file
  server    - Start web server  
  view      - Generate and open dashboard
  open      - Open existing dashboard

EXAMPLES:
  npm run charts:generate    # Create HTML dashboard
  npm run charts:server      # Start web server
  npm run charts:view        # Generate and open
`);
    break;
}

module.exports = SimpleChartViewer;