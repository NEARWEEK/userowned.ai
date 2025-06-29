#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const MULTIMEDIA_DIR = path.join(__dirname, '../public/multimedia-tests');

// Ensure multimedia directory exists
if (!fs.existsSync(MULTIMEDIA_DIR)) {
  fs.mkdirSync(MULTIMEDIA_DIR, { recursive: true });
}

function generateHTML() {
  const files = fs.readdirSync(MULTIMEDIA_DIR);
  const images = files.filter(f => f.match(/\.(png|jpg|jpeg|gif|webp)$/i));
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UserOwned.AI - Multimedia Test Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2d3748;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #718096;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border-radius: 10px;
            background: #f7fafc;
            border-left: 4px solid #4299e1;
        }
        .section h2 {
            margin-top: 0;
            color: #2d3748;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .image-card {
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
            transition: transform 0.2s;
        }
        .image-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .image-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .image-info {
            font-size: 0.9em;
            color: #666;
        }
        .json-viewer {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
            line-height: 1.5;
        }
        .no-content {
            text-align: center;
            color: #718096;
            font-style: italic;
            padding: 40px;
        }
        .refresh-btn {
            background: #4299e1;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1em;
            transition: background 0.2s;
        }
        .refresh-btn:hover {
            background: #3182ce;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            text-align: center;
        }
        .stat-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #4299e1;
        }
        .stat-label {
            color: #718096;
            font-size: 0.9em;
        }
        .instructions {
            background: #edf2f7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .instructions h3 {
            margin-top: 0;
            color: #2d3748;
        }
        .instructions code {
            background: #e2e8f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 UserOwned.AI</h1>
        <div class="subtitle">Multimedia Test Results Viewer</div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${images.length}</div>
                <div class="stat-label">Generated Images</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${jsonFiles.length}</div>
                <div class="stat-label">Test Reports</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${files.length}</div>
                <div class="stat-label">Total Files</div>
            </div>
        </div>

        ${images.length === 0 && jsonFiles.length === 0 ? `
        <div class="instructions">
            <h3>🚀 Ready to Test Multimedia APIs!</h3>
            <p>Run these commands to generate visual content:</p>
            <ul>
                <li><code>node scripts/test-figma-api.js</code> - Test Figma design exports</li>
                <li><code>node scripts/test-runway-api.js</code> - Generate AI images</li>
            </ul>
            <p>Then refresh this page to see the results!</p>
        </div>
        ` : ''}

        ${images.length > 0 ? `
        <div class="section">
            <h2>🖼️ Generated Images</h2>
            <div class="grid">
                ${images.map(img => {
                  const stats = fs.statSync(path.join(MULTIMEDIA_DIR, img));
                  return `
                    <div class="image-card">
                        <img src="/multimedia-tests/${img}" alt="${img}" loading="lazy">
                        <div class="image-info">
                            <strong>${img}</strong><br>
                            Size: ${(stats.size / 1024).toFixed(1)} KB<br>
                            Created: ${stats.mtime.toLocaleString()}
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>
        </div>
        ` : ''}

        ${jsonFiles.length > 0 ? `
        <div class="section">
            <h2>📊 Test Reports</h2>
            ${jsonFiles.map(jsonFile => {
              try {
                const content = fs.readFileSync(path.join(MULTIMEDIA_DIR, jsonFile), 'utf8');
                const data = JSON.parse(content);
                return `
                  <div style="margin: 20px 0;">
                    <h3>${jsonFile}</h3>
                    <div class="json-viewer">${JSON.stringify(data, null, 2)}</div>
                  </div>
                `;
              } catch (e) {
                return `
                  <div style="margin: 20px 0;">
                    <h3>${jsonFile}</h3>
                    <div class="json-viewer">Error reading file: ${e.message}</div>
                  </div>
                `;
              }
            }).join('')}
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Results</button>
        </div>

        <div style="text-align: center; color: #718096; font-size: 0.9em; margin-top: 40px;">
            <p>UserOwned.AI Multimedia Testing • Running on localhost:${PORT}</p>
        </div>
    </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateHTML());
  } else if (url.pathname.startsWith('/multimedia-tests/')) {
    const fileName = url.pathname.replace('/multimedia-tests/', '');
    const filePath = path.join(MULTIMEDIA_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(fileName).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.json': 'application/json'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('🎨 UserOwned.AI Multimedia Viewer');
  console.log('━'.repeat(50));
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📁 Watching directory: ${MULTIMEDIA_DIR}`);
  console.log('━'.repeat(50));
  console.log('');
  console.log('💡 Instructions:');
  console.log('   1. Keep this server running');
  console.log('   2. Run multimedia tests in another terminal');
  console.log('   3. Refresh the webpage to see new results');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log('   node scripts/test-figma-api.js     # Test Figma exports');
  console.log('   node scripts/test-runway-api.js    # Generate AI images');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});