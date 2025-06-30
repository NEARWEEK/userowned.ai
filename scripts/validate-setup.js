#!/usr/bin/env node
// NEARWEEK Automated News Sourcing - Setup Validation Script

const https = require('https');
const fs = require('fs');
const path = require('path');

class SetupValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }

  async validateSetup() {
    console.log('🔍 NEARWEEK Automated News Sourcing - Setup Validation');
    console.log('='.repeat(60));
    
    try {
      await this.checkEnvironment();
      await this.validateFileStructure();
      await this.checkDependencies();
      await this.testAPIConnections();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  async checkEnvironment() {
    console.log('\n🌱 Environment Validation');
    console.log('-'.repeat(30));
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 16) {
      console.log(`✅ Node.js version: ${nodeVersion}`);
      this.results.passed++;
    } else {
      console.log(`❌ Node.js version: ${nodeVersion} (requires 16+)`);
      this.results.failed++;
      this.results.errors.push('Node.js version too old');
    }
    
    // Check required environment variables
    const requiredEnvVars = [
      'ZAPIER_WEBHOOK_URL',
      'BUFFER_API_KEY',
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_CHAT_ID'
    ];
    
    const optionalEnvVars = [
      'RUNWAY_WEBHOOK_URL',
      'RUNWAY_API_KEY',
      'CONFIDENCE_THRESHOLD',
      'RELEVANCE_THRESHOLD'
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Configured`);
        this.results.passed++;
      } else {
        console.log(`❌ ${envVar}: Missing`);
        this.results.failed++;
        this.results.errors.push(`Missing required environment variable: ${envVar}`);
      }
    });
    
    optionalEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Configured`);
        this.results.passed++;
      } else {
        console.log(`⚠️  ${envVar}: Optional (not set)`);
        this.results.warnings++;
      }
    });
  }

  async validateFileStructure() {
    console.log('\n📁 File Structure Validation');
    console.log('-'.repeat(30));
    
    const requiredFiles = [
      'package.json',
      'src/server.js',
      'src/zapier/x-api-monitoring.js',
      'src/claude/news-analysis.js',
      'src/buffer/content-generator.js',
      'src/workflows/automated-pipeline.js',
      'scripts/setup-automation.js',
      'scripts/claude-code-setup.sh',
      '.env.example'
    ];
    
    const requiredDirs = [
      'src',
      'src/zapier',
      'src/claude', 
      'src/buffer',
      'src/workflows',
      'scripts',
      'claude-code',
      'claude-code/workflows',
      'claude-code/prompts'
    ];
    
    // Check files
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ File: ${file}`);
        this.results.passed++;
      } else {
        console.log(`❌ File: ${file} (missing)`);
        this.results.failed++;
        this.results.errors.push(`Missing required file: ${file}`);
      }
    });
    
    // Check directories
    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`✅ Directory: ${dir}`);
        this.results.passed++;
      } else {
        console.log(`❌ Directory: ${dir} (missing)`);
        this.results.failed++;
        this.results.errors.push(`Missing required directory: ${dir}`);
      }
    });
  }

  async checkDependencies() {
    console.log('\n📦 Dependencies Validation');
    console.log('-'.repeat(30));
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check if node_modules exists
      if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules directory exists');
        this.results.passed++;
      } else {
        console.log('❌ node_modules directory missing (run npm install)');
        this.results.failed++;
        this.results.errors.push('Dependencies not installed');
      }
      
      // Check critical dependencies
      const criticalDeps = ['express', 'dotenv', 'cors', 'helmet'];
      
      criticalDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          console.log(`✅ Dependency: ${dep}`);
          this.results.passed++;
        } else {
          console.log(`❌ Dependency: ${dep} (missing from package.json)`);
          this.results.failed++;
          this.results.errors.push(`Missing dependency: ${dep}`);
        }
      });
      
    } catch (error) {
      console.log('❌ Failed to read package.json');
      this.results.failed++;
      this.results.errors.push('Cannot read package.json');
    }
  }

  async testAPIConnections() {
    console.log('\n🔗 API Connection Tests');
    console.log('-'.repeat(30));
    
    // Test Buffer API if key is available
    if (process.env.BUFFER_API_KEY) {
      try {
        await this.testBufferAPI();
        console.log('✅ Buffer API: Connection successful');
        this.results.passed++;
      } catch (error) {
        console.log(`❌ Buffer API: ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`Buffer API connection failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  Buffer API: Skipped (no API key)');
      this.results.warnings++;
    }
    
    // Test Telegram API if token is available
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        await this.testTelegramAPI();
        console.log('✅ Telegram API: Connection successful');
        this.results.passed++;
      } catch (error) {
        console.log(`❌ Telegram API: ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`Telegram API connection failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  Telegram API: Skipped (no bot token)');
      this.results.warnings++;
    }
    
    // Test Zapier webhook if URL is available
    if (process.env.ZAPIER_WEBHOOK_URL) {
      try {
        await this.testZapierWebhook();
        console.log('✅ Zapier Webhook: Endpoint accessible');
        this.results.passed++;
      } catch (error) {
        console.log(`❌ Zapier Webhook: ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`Zapier webhook test failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  Zapier Webhook: Skipped (no URL configured)');
      this.results.warnings++;
    }
  }

  async testBufferAPI() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.bufferapp.com',
        port: 443,
        path: '/1/user.json',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.BUFFER_API_KEY}`
        }
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          resolve('Buffer API connection successful');
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  async testTelegramAPI() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`,
        method: 'GET'
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.ok) {
              resolve('Telegram API connection successful');
            } else {
              reject(new Error('Invalid bot token'));
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  async testZapierWebhook() {
    return new Promise((resolve, reject) => {
      const url = new URL(process.env.ZAPIER_WEBHOOK_URL);
      
      const postData = JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        source: 'setup-validation'
      });
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve('Zapier webhook is accessible');
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        reject(new Error('Request timeout'));
      });
      
      req.write(postData);
      req.end();
    });
  }

  printResults() {
    console.log('\n📋 Validation Results');
    console.log('='.repeat(30));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All critical checks passed! System is ready.');
      console.log('\n🚀 Next steps:');
      console.log('   1. Run: npm start');
      console.log('   2. Test: npm run test:pipeline');
      console.log('   3. Setup Claude Code: npm run claude-setup');
    } else {
      console.log('\n⚠️  Please fix the issues above before proceeding.');
      console.log('\n🔧 Quick fixes:');
      console.log('   - Install dependencies: npm install');
      console.log('   - Configure environment: cp .env.example .env');
      console.log('   - Add missing files: check repository structure');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SetupValidator();
  validator.validateSetup();
}

module.exports = SetupValidator;