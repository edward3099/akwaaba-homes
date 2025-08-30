#!/bin/bash
echo "Real-time Next.js error monitoring started at: $(date)"
echo "================================================"

# Function to monitor Next.js output
monitor_nextjs() {
    # Get the Next.js process ID
    next_pid=$(pgrep -f "next dev" | head -1)
    
    if [ -z "$next_pid" ]; then
        echo "[$(date)] ERROR: Next.js process not found!"
        return 1
    fi
    
    echo "[$(date)] Monitoring Next.js process PID: $next_pid"
    
    # Monitor the process output in real-time
    while kill -0 $next_pid 2>/dev/null; do
        # Check for any new error logs
        if [ -f ".next/error.log" ]; then
            new_errors=$(tail -10 .next/error.log | grep -i "error\|fail\|exception" | tail -3)
            if [ ! -z "$new_errors" ]; then
                echo "[$(date)] NEXT.JS ERRORS:"
                echo "$new_errors"
                echo "---"
            fi
        fi
        
        # Check process status
        process_status=$(ps -p $next_pid -o pid,ppid,state,time,pcpu,pmem --no-headers 2>/dev/null)
        if [ ! -z "$process_status" ]; then
            echo "[$(date)] Process Status: $process_status"
        fi
        
        sleep 15
    done
    
    echo "[$(date)] Next.js process has terminated!"
}

# Start monitoring
monitor_nextjs
