#!/bin/bash
# NEARWEEK Automated News Sourcing - Claude Code Complete Setup

echo "🤖 Executing NEARWEEK Claude Code Complete Setup"
echo "================================================"

# Phase 1: Environment Initialization
echo "
🌱 Phase 1: Environment Initialization"
echo "-------------------------------------"

# Initialize Claude Code in current directory
echo "Initializing Claude Code..."
claude-code init --repo=nearweek-automated-news-sourcing --environment=production

# Set core environment variables
echo "Setting up environment configuration..."
claude-code env set NODE_ENV production
claude-code env set CONFIDENCE_THRESHOLD 85
claude-code env set RELEVANCE_THRESHOLD 60
claude-code env set MAX_CONCURRENT_PROCESSING 10
claude-code env set ENABLE_AUTO_POSTING true
claude-code env set ENABLE_VIDEO_GENERATION true
claude-code env set ENABLE_TEAM_NOTIFICATIONS true
claude-code env set ENABLE_METRICS_COLLECTION true

# Phase 2: Workflow Registration and Deployment
echo "
🔄 Phase 2: Workflow Registration and Deployment"
echo "----------------------------------------------"

# Create and deploy news processing workflow
echo "Creating news processing workflow..."
claude-code workflow create news-processing \
  --description="Main automated news processing pipeline" \
  --trigger=webhook \
  --timeout=1800s \
  --steps="validate-input,analyze-relevance,claude-analysis,route-by-priority" \
  --error-handling="retry:3,fallback:log-and-continue"

# Create breaking news response workflow
echo "Creating breaking news response workflow..."
claude-code workflow create breaking-news-response \
  --description="Rapid response for critical news" \
  --trigger="conditional:relevance_score>=90" \
  --priority=urgent \
  --timeout=900s \
  --steps="immediate-analysis,fact-verification,video-trigger,team-notification" \
  --max-execution-time=900s

# Create content creation workflow
echo "Creating content creation workflow..."
claude-code workflow create content-creation \
  --description="Multi-platform content generation" \
  --trigger="conditional:relevance_score>=60" \
  --timeout=600s \
  --steps="template-selection,content-generation,quality-review,buffer-creation" \
  --parallel-execution=true

# Create quality control workflow
echo "Creating quality control workflow..."
claude-code workflow create quality-control \
  --description="Content quality assurance and compliance" \
  --trigger="event:content_created" \
  --steps="brand-compliance,fact-verification,engagement-optimization,approval" \
  --review-gates=enabled

# Phase 3: Webhook and API Integration Setup
echo "
🔗 Phase 3: Webhook and API Integration Setup"
echo "--------------------------------------------"

# Set up X API monitoring webhook
echo "Setting up X API monitoring webhook..."
claude-code webhook create x-api-monitor \
  --endpoint="/webhook/x-api" \
  --method=POST \
  --description="Receives tweets from Zapier X API monitoring" \
  --rate-limit="60/minute" \
  --authentication=optional

# Set up Buffer integration webhook
echo "Setting up Buffer integration webhook..."
claude-code webhook create buffer-callback \
  --endpoint="/webhook/buffer-callback" \
  --method=POST \
  --description="Handles Buffer posting confirmations and callbacks" \
  --authentication=required \
  --timeout=30s

# Set up Runway video generation webhook
echo "Setting up Runway video generation webhook..."
claude-code webhook create runway-video \
  --endpoint="/webhook/runway-trigger" \
  --method=POST \
  --description="Triggers video generation for breaking news" \
  --priority=urgent \
  --timeout=60s

# Configure API integrations
echo "Configuring API integrations..."

# Buffer API integration
claude-code integration add buffer \
  --api-version=v1 \
  --base-url="https://api.bufferapp.com/1" \
  --rate-limit="300/hour" \
  --retry-policy=exponential \
  --endpoints="create-draft,schedule-post,get-profiles" \
  --authentication=bearer-token

# Telegram API integration
claude-code integration add telegram \
  --api-version=bot \
  --base-url="https://api.telegram.org/bot" \
  --rate-limit="30/second" \
  --notification-types="breaking_news,system_errors,quality_alerts" \
  --authentication=bot-token

# Zapier webhook integration
claude-code integration add zapier \
  --provider=webhook \
  --webhook-based=true \
  --rate-limit="60/minute" \
  --filters="keywords,engagement-threshold,account-verification"

# Phase 4: Quality Control and Security Setup
echo "
🛡️ Phase 4: Quality Control and Security Setup"
echo "--------------------------------------------"

# Set up quality gates
echo "Setting up quality control gates..."
claude-code quality-gates create relevance-filter \
  --threshold=60 \
  --action=reject \
  --description="Filter out low-relevance content" \
  --apply-to="all-content"

claude-code quality-gates create confidence-check \
  --threshold=70 \
  --action=human-review \
  --description="Flag low-confidence analysis for manual review" \
  --escalation=true

claude-code quality-gates create brand-compliance \
  --check=automated \
  --action=require-approval \
  --description="Ensure brand voice and messaging consistency" \
  --review-required=true

claude-code quality-gates create fact-accuracy \
  --threshold=85 \
  --action=verify \
  --description="Verify factual accuracy for high-impact content" \
  --sources-required=2

# Configure security settings
echo "Setting up security configuration..."
claude-code security configure \
  --encryption=true \
  --audit-logging=true \
  --access-control=rbac \
  --session-timeout=3600

# Set up secret management
claude-code secrets configure \
  --provider=environment \
  --rotation-policy=30days \
  --encryption=aes-256 \
  --backup=true

# Phase 5: Monitoring and Alerting Configuration
echo "
📊 Phase 5: Monitoring and Alerting Configuration"
echo "------------------------------------------------"

# Enable comprehensive monitoring
echo "Setting up monitoring system..."
claude-code monitoring enable \
  --metrics="response-time,success-rate,error-rate,quality-score,throughput" \
  --dashboard=true \
  --real-time=true \
  --retention=30days

# Create monitoring dashboard
claude-code monitoring create-dashboard \
  --name="NEARWEEK News Sourcing Production" \
  --metrics="[response-time,throughput,error-rate,quality-score]" \
  --refresh-interval=30s \
  --alerts=enabled

# Set up alerting system
echo "Setting up alerting system..."
claude-code alerting enable \
  --channels="telegram,email" \
  --severity-levels="critical,high,medium,low" \
  --escalation-rules=true

# Configure specific alerts
claude-code alerting create pipeline-failure \
  --condition="error_rate > 0.1 OR success_rate < 0.9" \
  --notification=telegram \
  --urgency=critical \
  --escalation-delay=300s

claude-code alerting create quality-degradation \
  --condition="avg_quality_score < 80" \
  --notification=email \
  --urgency=medium \
  --cooldown=1800s

claude-code alerting create response-time-spike \
  --condition="avg_response_time > 900000" \
  --notification=telegram \
  --urgency=high \
  --threshold-duration=300s

claude-code alerting create high-volume \
  --condition="request_rate > 100/minute" \
  --notification=email \
  --urgency=medium \
  --auto-scale=true

# Phase 6: Performance Optimization
echo "
⚡ Phase 6: Performance Optimization"
echo "----------------------------------"

# Configure high-performance settings
echo "Setting up performance optimization..."
claude-code performance configure \
  --max-concurrent=20 \
  --queue-size=1000 \
  --worker-timeout=300s \
  --memory-limit=1024MB \
  --cpu-limit=2

# Enable caching
claude-code cache enable \
  --provider=redis \
  --ttl=3600 \
  --max-size=500MB \
  --key-patterns="tweet-analysis,content-templates,api-responses" \
  --compression=true

# Configure auto-scaling
claude-code autoscaling enable \
  --min-instances=2 \
  --max-instances=10 \
  --scale-up-threshold=80 \
  --scale-down-threshold=30 \
  --scale-up-cooldown=300s \
  --scale-down-cooldown=600s

# Set up rate limiting
claude-code rate-limit configure \
  --requests-per-minute=300 \
  --burst-capacity=50 \
  --backoff-strategy=exponential \
  --retry-after=60s

# Phase 7: Analytics and Reporting
echo "
📈 Phase 7: Analytics and Reporting"
echo "----------------------------------"

# Enable analytics collection
echo "Setting up analytics collection..."
claude-code analytics enable \
  --metrics="processing-volume,response-time,quality-scores,engagement-rates" \
  --retention=90days \
  --aggregation-intervals="1min,5min,1hour,1day" \
  --export-format=json

# Set up automated reporting
claude-code reporting create daily-summary \
  --schedule="0 9 * * *" \
  --timezone="Europe/Berlin" \
  --metrics="processed-tweets,success-rate,avg-quality,top-sources" \
  --recipients="team@nearweek.com" \
  --format=email

claude-code reporting create weekly-analysis \
  --schedule="0 9 * * 1" \
  --timezone="Europe/Berlin" \
  --metrics="trending-topics,performance-optimization,error-analysis,growth-metrics" \
  --format=pdf \
  --detailed=true

claude-code reporting create monthly-review \
  --schedule="0 9 1 * *" \
  --timezone="Europe/Berlin" \
  --metrics="all" \
  --format=dashboard \
  --stakeholders="management,technical-team"

# Configure performance benchmarking
echo "Setting up performance benchmarking..."
claude-code benchmark create response-time \
  --target="<900s" \
  --measurement-interval=5min \
  --alert-threshold=1200s \
  --trend-analysis=true

claude-code benchmark create quality-score \
  --target=">85" \
  --measurement-interval=1hour \
  --alert-threshold=80 \
  --improvement-tracking=true

claude-code benchmark create throughput \
  --target=">500/day" \
  --measurement-interval=1hour \
  --alert-threshold=400 \
  --capacity-planning=true

# Phase 8: Testing and Validation
echo "
🧪 Phase 8: Testing and Validation"
echo "----------------------------------"

# Run comprehensive system validation
echo "Running system validation..."
claude-code validate \
  --environment=production \
  --full-check=true \
  --performance-test=true \
  --security-audit=true \
  --timeout=600s

# Test individual workflows
echo "Testing individual workflows..."
claude-code workflow test news-processing \
  --mock-data=test-data/sample-tweet.json \
  --dry-run=true \
  --verbose=true

claude-code workflow test breaking-news-response \
  --mock-data=test-data/breaking-news-tweet.json \
  --dry-run=true \
  --performance-check=true

# Validate API integrations
echo "Validating API integrations..."
claude-code integration test buffer --endpoint=user-info --timeout=30s
claude-code integration test telegram --endpoint=get-me --timeout=30s
claude-code integration test zapier --endpoint=webhook-test --timeout=30s

# Test webhook endpoints
echo "Testing webhook endpoints..."
claude-code webhook test x-api-monitor --sample-payload=test-data/x-api-payload.json
claude-code webhook test buffer-callback --sample-payload=test-data/buffer-callback.json

# Phase 9: Startup and Activation
echo "
🚀 Phase 9: Startup and Activation"
echo "----------------------------------"

# Start all workflows
echo "Starting all workflows..."
claude-code workflow start news-processing
claude-code workflow start breaking-news-response
claude-code workflow start content-creation
claude-code workflow start quality-control

# Enable monitoring and alerting
echo "Enabling monitoring and alerting..."
claude-code monitoring start
claude-code alerting start

# Activate all webhooks
echo "Activating webhooks..."
claude-code webhook activate x-api-monitor
claude-code webhook activate buffer-callback
claude-code webhook activate runway-video

# Start analytics collection
echo "Starting analytics collection..."
claude-code analytics start
claude-code reporting start

# Phase 10: Final System Check and Status
echo "
✅ Phase 10: Final System Check and Status"
echo "----------------------------------------"

# Comprehensive system status check
echo "Running final system status check..."
claude-code status --detailed --health-check --performance-metrics

# Generate system summary
echo "Generating system summary..."
claude-code summary generate \
  --include-workflows=true \
  --include-integrations=true \
  --include-monitoring=true \
  --include-performance=true \
  --format=console

echo ""
echo "🎉 NEARWEEK Automated News Sourcing - Claude Code Setup Complete!"
echo "================================================================"
echo ""
echo "📊 System Status:"
claude-code status --brief
echo ""
echo "🔗 Active Webhooks:"
claude-code webhook list --status=active
echo ""
echo "🔄 Running Workflows:"
claude-code workflow list --status=running
echo ""
echo "📋 Next Steps:"
echo "1. Configure Zapier zaps to send tweets to webhook endpoints"
echo "2. Test with sample tweet data: npm run test:pipeline"
echo "3. Monitor system: claude-code dashboard open"
echo "4. View real-time metrics: claude-code metrics show --live"
echo "5. Check logs: claude-code logs tail --follow"
echo ""
echo "🚀 System is fully operational and ready for automated news processing!"
echo "\nMonitor at: claude-code dashboard open"
echo "Health check: claude-code health-check --continuous"