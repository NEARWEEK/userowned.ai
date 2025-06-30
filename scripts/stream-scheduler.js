#!/usr/bin/env node
/**
 * Content Stream Scheduler
 * Manages automated content generation schedules for all streams
 */
require('dotenv').config();
const cron = require('node-cron');
const { MultiStreamContentGenerator } = require('./multi-stream-content-generator');
const { createLogger } = require('../src/utils/logger');

class StreamScheduler {
  constructor() {
    this.generator = new MultiStreamContentGenerator();
    this.logger = createLogger('stream-scheduler');
    
    // Schedule configurations
    this.schedules = {
      nearweek: {
        cron: '0 8,20 * * *', // Twice daily at 8 AM and 8 PM
        description: 'NEARWEEK Analytics - Twice daily',
        enabled: true
      },
      defi: {
        cron: '0 */4 * * *', // Every 4 hours
        description: 'DeFi Pulse - Every 4 hours',
        enabled: true
      },
      nft: {
        cron: '0 6,12,18 * * *', // Three times daily
        description: 'NFT Tracker - Three times daily',
        enabled: true
      },
      gaming: {
        cron: '0 9 * * 1', // Weekly on Monday at 9 AM
        description: 'Gaming Analytics - Weekly on Monday',
        enabled: true
      }
    };
    
    this.runningJobs = new Map();
  }

  /**
   * Start scheduler for specific stream
   */
  startStreamSchedule(streamId) {
    const schedule = this.schedules[streamId];
    
    if (!schedule || !schedule.enabled) {
      this.logger.warn(`Schedule not found or disabled for stream: ${streamId}`);
      return false;
    }
    
    if (this.runningJobs.has(streamId)) {
      this.logger.info(`Schedule already running for stream: ${streamId}`);
      return false;
    }
    
    const job = cron.schedule(schedule.cron, async () => {
      this.logger.info(`Executing scheduled generation for ${streamId}`);
      
      try {
        await this.generator.generateStreamContent(streamId);
        this.logger.info(`✅ Scheduled generation completed for ${streamId}`);
      } catch (error) {
        this.logger.error(`❌ Scheduled generation failed for ${streamId}:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Copenhagen' // Danish timezone
    });
    
    job.start();
    this.runningJobs.set(streamId, job);
    
    this.logger.info(`📅 Started schedule for ${streamId}: ${schedule.description}`);
    return true;
  }

  /**
   * Stop scheduler for specific stream
   */
  stopStreamSchedule(streamId) {
    const job = this.runningJobs.get(streamId);
    
    if (job) {
      job.stop();
      this.runningJobs.delete(streamId);
      this.logger.info(`⏹️ Stopped schedule for ${streamId}`);
      return true;
    }
    
    this.logger.warn(`No running schedule found for stream: ${streamId}`);
    return false;
  }

  /**
   * Start all enabled schedules
   */
  startAllSchedules() {
    console.log('🚀 STARTING ALL CONTENT STREAM SCHEDULES');
    console.log('========================================');
    
    let started = 0;
    
    Object.keys(this.schedules).forEach(streamId => {
      if (this.startStreamSchedule(streamId)) {
        started++;
        console.log(`✅ ${streamId}: ${this.schedules[streamId].description}`);
      }
    });
    
    console.log(`\n📊 Started ${started} schedules`);
    console.log('⏰ Scheduler is now running...');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping all schedules...');
      this.stopAllSchedules();
      process.exit(0);
    });
  }

  /**
   * Stop all schedules
   */
  stopAllSchedules() {
    let stopped = 0;
    
    this.runningJobs.forEach((job, streamId) => {
      job.stop();
      stopped++;
      console.log(`⏹️ Stopped ${streamId}`);
    });
    
    this.runningJobs.clear();
    console.log(`📊 Stopped ${stopped} schedules`);
  }

  /**
   * Get schedule status
   */
  getStatus() {
    console.log('📊 CONTENT STREAM SCHEDULE STATUS');
    console.log('=================================');
    
    Object.entries(this.schedules).forEach(([streamId, schedule]) => {
      const isRunning = this.runningJobs.has(streamId);
      const status = isRunning ? '🟢 RUNNING' : (schedule.enabled ? '🔴 STOPPED' : '⚪ DISABLED');
      
      console.log(`${streamId.padEnd(10)} ${status.padEnd(12)} ${schedule.description}`);
      console.log(`${''.padEnd(10)} Schedule: ${schedule.cron}`);
      console.log('');
    });
    
    console.log(`📈 Active schedules: ${this.runningJobs.size}/${Object.keys(this.schedules).length}`);
  }

  /**
   * Test run specific stream
   */
  async testStream(streamId) {
    console.log(`🧪 TESTING ${streamId.toUpperCase()} STREAM`);
    console.log('========================');
    
    try {
      const result = await this.generator.generateStreamContent(streamId);
      console.log('✅ Test completed successfully!');
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const scheduler = new StreamScheduler();
  const command = process.argv[2];
  const streamId = process.argv[3];
  
  switch (command) {
    case 'start':
      if (streamId) {
        scheduler.startStreamSchedule(streamId);
      } else {
        scheduler.startAllSchedules();
      }
      break;
      
    case 'stop':
      if (streamId) {
        scheduler.stopStreamSchedule(streamId);
      } else {
        scheduler.stopAllSchedules();
      }
      break;
      
    case 'status':
      scheduler.getStatus();
      break;
      
    case 'test':
      if (streamId) {
        scheduler.testStream(streamId).catch(console.error);
      } else {
        console.log('❌ Please specify a stream to test: nearweek, defi, nft, gaming');
      }
      break;
      
    default:
      console.log('📋 CONTENT STREAM SCHEDULER');
      console.log('===========================');
      console.log('Commands:');
      console.log('  start [stream]  - Start scheduler (all or specific stream)');
      console.log('  stop [stream]   - Stop scheduler (all or specific stream)');
      console.log('  status          - Show schedule status');
      console.log('  test <stream>   - Test generate specific stream');
      console.log('');
      console.log('Streams: nearweek, defi, nft, gaming');
      console.log('');
      console.log('Examples:');
      console.log('  node stream-scheduler.js start');
      console.log('  node stream-scheduler.js test nearweek');
      console.log('  node stream-scheduler.js status');
  }
}

module.exports = { StreamScheduler };