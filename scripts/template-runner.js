#!/usr/bin/env node

/**
 * Template Runner
 * CLI interface for executing UserOwned.ai templates
 * Usage: node scripts/template-runner.js <template-type> [options]
 */

const TemplateExecutor = require('../src/engine/template-executor');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Available templates:');
    const executor = new TemplateExecutor();
    const templates = executor.getAvailableTemplates();
    templates.forEach(template => {
      console.log(`  - ${template}`);
    });
    console.log('\n🚀 Usage: node scripts/template-runner.js <template-type>');
    console.log('\n📝 Examples:');
    console.log('  node scripts/template-runner.js daily-ecosystem');
    console.log('  node scripts/template-runner.js weekly-market');
    console.log('  node scripts/template-runner.js project-spotlight --project=NEAR');
    console.log('  node scripts/template-runner.js vc-intelligence');
    return;
  }

  const templateType = args[0];
  const options = parseOptions(args.slice(1));

  try {
    console.log(`🚀 UserOwned.ai Template Runner v2.0`);
    console.log(`📋 Executing template: ${templateType}`);
    console.log(`⚙️ Options:`, options);
    console.log('');

    const executor = new TemplateExecutor();
    const result = await executor.executeTemplate(templateType, options);

    console.log('');
    console.log('✅ Template execution completed!');
    console.log('📊 Results:');
    console.log(`   Template: ${result.templateType}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log(`   Channels: ${Object.keys(result.distribution).join(', ')}`);
    
    // Display distribution results
    for (const [channel, channelResult] of Object.entries(result.distribution)) {
      const status = channelResult.success ? '✅' : '❌';
      console.log(`   ${status} ${channel}: ${channelResult.success ? 'Posted' : channelResult.error}`);
    }

    console.log('');
    console.log('🎯 Next steps:');
    console.log('  - Check your channels for posted content');
    console.log('  - Review generated content quality');
    console.log('  - Monitor engagement metrics');

  } catch (error) {
    console.error('');
    console.error('❌ Template execution failed:');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('  - Check your environment variables');
    console.error('  - Verify API credentials');
    console.error('  - Ensure network connectivity');
    process.exit(1);
  }
}

/**
 * Parse command line options
 */
function parseOptions(args) {
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  }
  
  return options;
}

// Execute if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, parseOptions };