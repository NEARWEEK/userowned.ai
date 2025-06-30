#!/bin/bash

# NEARWEEK TEAM DAILY COMMANDS
# Quick access script for content team daily operations

echo "📰 NEARWEEK CONTENT TEAM - DAILY DASHBOARD"
echo "========================================="
echo ""

# Function to check system health
check_health() {
    echo "🏥 SYSTEM HEALTH CHECK"
    echo "----------------------"
    curl -s http://localhost:3000/health | jq '.' || echo "❌ System not responding"
    echo ""
}

# Function to check metrics
check_metrics() {
    echo "📊 SYSTEM METRICS"
    echo "-----------------"
    curl -s http://localhost:3000/api/metrics | jq '.' || echo "❌ Metrics not available"
    echo ""
}

# Function to check recent processing
check_recent() {
    echo "📨 RECENT PROCESSING"
    echo "-------------------"
    if [ -f "logs/automation.log" ]; then
        echo "Last 5 processed items:"
        tail -5 logs/automation.log | grep "processed" || echo "No recent processing"
    else
        echo "❌ Log file not found"
    fi
    echo ""
}

# Function to show Buffer queue status
check_buffer() {
    echo "📝 BUFFER QUEUE STATUS"
    echo "---------------------"
    echo "🔗 Access Buffer: https://buffer.com/app"
    echo "📂 NEARWEEK Organization → Pending Posts"
    echo "⚡ Check for posts awaiting approval"
    echo ""
}

# Function to show emergency commands
show_emergency() {
    echo "🚨 EMERGENCY COMMANDS"
    echo "--------------------"
    echo "Pause system:   curl -X POST http://localhost:3000/api/admin/pause"
    echo "Resume system:  curl -X POST http://localhost:3000/api/admin/resume"
    echo "Check status:   curl http://localhost:3000/api/admin/status"
    echo ""
}

# Function for team standup info
show_standup() {
    echo "👥 TEAM STANDUP INFO"
    echo "-------------------"
    check_health
    check_metrics
    check_recent
    echo "📋 DAILY CHECKLIST:"
    echo "  □ Review Buffer approval queue"
    echo "  □ Check Telegram notifications"
    echo "  □ Monitor system metrics"
    echo "  □ Respond to breaking news alerts"
    echo ""
}

# Main menu
case "$1" in
    "health")
        check_health
        ;;
    "metrics")
        check_metrics
        ;;
    "recent")
        check_recent
        ;;
    "buffer")
        check_buffer
        ;;
    "emergency")
        show_emergency
        ;;
    "standup")
        show_standup
        ;;
    "all")
        show_standup
        check_buffer
        show_emergency
        ;;
    *)
        echo "📋 AVAILABLE COMMANDS:"
        echo "  ./team-daily-commands.sh health    - Check system health"
        echo "  ./team-daily-commands.sh metrics   - View performance metrics"
        echo "  ./team-daily-commands.sh recent    - Show recent processing"
        echo "  ./team-daily-commands.sh buffer    - Buffer queue info"
        echo "  ./team-daily-commands.sh emergency - Emergency commands"
        echo "  ./team-daily-commands.sh standup   - Morning standup info"
        echo "  ./team-daily-commands.sh all       - Complete dashboard"
        echo ""
        echo "💡 Quick start: ./team-daily-commands.sh all"
        ;;
esac