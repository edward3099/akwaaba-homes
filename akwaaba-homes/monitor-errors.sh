#!/bin/bash
echo "Starting error monitoring for akwaaba-homes..."
echo "Monitoring started at: $(date)"
echo "=================================="

while true; do
    # Check for new errors in server.log
    if [ -f "server.log" ]; then
        new_errors=$(tail -20 server.log | grep -i "error\|fail\|exception\|warning" | tail -5)
        if [ ! -z "$new_errors" ]; then
            echo "[$(date)] NEW ERRORS DETECTED:"
            echo "$new_errors"
            echo "---"
        fi
    fi
    
    # Check if Next.js process is still running
    if ! pgrep -f "next dev" > /dev/null; then
        echo "[$(date)] CRITICAL: Next.js dev server has stopped!"
        echo "Attempting to restart..."
        npm run dev &
        sleep 5
    fi
    
    # Check for high memory usage
    memory_usage=$(ps aux | grep "next-server" | grep -v grep | awk "{print \$4}" | head -1)
    if [ ! -z "$memory_usage" ] && [ $(echo "$memory_usage > 80" | bc -l 2>/dev/null || echo "0") -eq 1 ]; then
        echo "[$(date)] WARNING: High memory usage detected: ${memory_usage}%"
    fi
    
    # Check for port conflicts
    if ! lsof -i :3000 > /dev/null 2>&1; then
        echo "[$(date)] WARNING: Port 3000 is not listening"
    fi
    
    sleep 10
done
