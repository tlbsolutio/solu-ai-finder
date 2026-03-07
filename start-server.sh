#!/bin/bash
# Start Solutio Carto V2 server
# Usage: ./start-server.sh

cd /home/claude-user/solu-ai-finder-v2

# Kill existing instance
pkill -f "node.*server.mjs" 2>/dev/null
sleep 1

# Start server in background
nohup node server.mjs > /home/claude-user/solu-ai-finder-v2/server.log 2>&1 &
echo "Server started on port 3002 (PID: $!)"
echo "Auth: tlb / SolutioV2Carto2026"
echo "Logs: tail -f /home/claude-user/solu-ai-finder-v2/server.log"
