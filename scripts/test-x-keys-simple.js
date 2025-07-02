#!/usr/bin/env node

// X API Keys Test Script - MCP Compatible
// Run this to validate all your X API credentials

require('dotenv').config();

async function testXAPIKeys() {
    console.log('🔑 X API Keys Validation Test (MCP)');
    console.log('===================================');
    
    // Check environment variables
    const requiredKeys = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET', 
        'TWITTER_BEARER_TOKEN',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET',
        'TWITTER_CLIENT_ID',
        'TWITTER_CLIENT_SECRET'
    ];
    
    console.log('\\n📋 1. Environment Variables Check:');
    console.log('----------------------------------');
    
    let allKeysPresent = true;
    requiredKeys.forEach(key => {
        const value = process.env[key];
        if (value && value !== `your_${key.toLowerCase()}_here` && value.length > 10) {
            console.log(`✅ ${key}: Present (${value.length} chars)`);
        } else {
            console.log(`❌ ${key}: Missing or placeholder`);
            allKeysPresent = false;
        }
    });
    
    console.log('\\n🎉 Test Complete!');
}

module.exports = { testXAPIKeys };
