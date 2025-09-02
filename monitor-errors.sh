#!/bin/bash

# AkwaabaHomes Error Monitoring Script
# This script continuously monitors the project for errors and issues

echo "🚀 Starting AkwaabaHomes Error Monitoring..."
echo "================================================"
echo "Monitoring started at: $(date)"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
    echo ""
    echo "[$(date)] === STATUS CHECK ==="
    
    # 1. Check Next.js process
    local next_pid=$(pgrep -f "next dev")
    if [ ! -z "$next_pid" ]; then
        echo -e "${GREEN}✓${NC} Next.js dev server: RUNNING (PID: $next_pid)"
    else
        echo -e "${RED}✗${NC} Next.js dev server: STOPPED"
        echo -e "${YELLOW}⚠${NC} Attempting to restart..."
        npm run dev > /dev/null 2>&1 &
        sleep 3
    fi
    
    # 2. Check port 3000
    if lsof -i :3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Port 3000: LISTENING"
    else
        echo -e "${RED}✗${NC} Port 3000: NOT LISTENING"
    fi
    
    # 3. Check HTTP response
    local http_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "ERROR")
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✓${NC} HTTP Status: $http_status"
    else
        echo -e "${RED}✗${NC} HTTP Status: $http_status"
    fi
    
    # 4. Check for new errors in server.log
    if [ -f "server.log" ]; then
        local recent_errors=$(tail -50 server.log | grep -i "error\|fail\|exception\|warning" | tail -3)
        if [ ! -z "$recent_errors" ]; then
            echo -e "${YELLOW}⚠${NC} Recent errors in server.log:"
            echo "$recent_errors" | while read line; do
                echo "   $line"
            done
        else
            echo -e "${GREEN}✓${NC} No recent errors in server.log"
        fi
    fi
    
    # 5. Check memory usage
    local next_memory=$(ps aux | grep "next-server" | grep -v grep | awk '{print $4}' | head -1)
    if [ ! -z "$next_memory" ]; then
        echo -e "${GREEN}✓${NC} Next.js memory usage: ${next_memory}%"
        # Alert if memory usage is high
        if [ $(echo "$next_memory > 80" | bc -l 2>/dev/null || echo "0") -eq 1 ]; then
            echo -e "${YELLOW}⚠${NC} High memory usage detected!"
        fi
    fi
    
    # 6. Check disk space
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    echo -e "${GREEN}✓${NC} Disk usage: ${disk_usage}%"
    if [ "$disk_usage" -gt 90 ]; then
        echo -e "${RED}✗${NC} Disk usage is critically high!"
    fi
    
    # 7. Check for TypeScript compilation errors
    local ts_errors=$(npx tsc --noEmit 2>&1 | grep -i "error" | wc -l)
    if [ "$ts_errors" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} TypeScript compilation errors: $ts_errors"
    else
        echo -e "${GREEN}✓${NC} TypeScript compilation: OK"
    fi
    
    echo "================================================"
}

# Function to monitor error logs in real-time
monitor_error_logs() {
    echo "📊 Starting real-time error log monitoring..."
    if [ -f "server.log" ]; then
        tail -f server.log | grep --line-buffered -i "error\|fail\|exception\|warning" | while read line; do
            echo -e "${RED}[$(date)] ERROR DETECTED:${NC} $line"
        done
    else
        echo "server.log not found, creating it..."
        touch server.log
    fi
}

# Main monitoring loop
main() {
    # Start error log monitoring in background
    monitor_error_logs &
    local monitor_pid=$!
    
    echo "Error monitoring started with PID: $monitor_pid"
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    # Main status check loop
    while true; do
        check_status
        echo "Next check in 15 seconds..."
        sleep 15
    done
}

# Trap Ctrl+C to clean up
trap 'echo ""; echo "🛑 Stopping monitoring..."; kill $monitor_pid 2>/dev/null; exit 0' INT

# Start monitoring
main
