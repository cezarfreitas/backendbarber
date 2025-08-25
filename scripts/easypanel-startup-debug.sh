#!/bin/bash

echo "🔍 EasyPanel Startup Diagnostic Script"
echo "======================================"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting diagnostic..."

# 1. Check Node.js version
log "1. Node.js version:"
node --version || log "❌ Node.js not found"

# 2. Check if production build exists
log "2. Checking production build:"
if [ -f "dist/server/production.mjs" ]; then
    log "✅ production.mjs found"
    ls -la dist/server/production.mjs
else
    log "❌ production.mjs not found - build may have failed"
    log "Contents of dist/server/:"
    ls -la dist/server/ 2>/dev/null || log "dist/server/ directory not found"
fi

# 3. Check package.json and dependencies
log "3. Checking package.json:"
if [ -f "package.json" ]; then
    log "✅ package.json found"
    log "Checking critical dependencies:"
    grep -E "(express|cors|mysql2)" package.json || log "⚠️ Some dependencies missing"
else
    log "❌ package.json not found"
fi

# 4. Check environment variables
log "4. Environment variables:"
log "NODE_ENV: ${NODE_ENV:-'not set'}"
log "PORT: ${PORT:-'not set'}"
log "DB_HOST: ${DB_HOST:-'not set'}"
log "DB_USER: ${DB_USER:-'not set'}"
log "DB_NAME: ${DB_NAME:-'not set'}"
log "DB_PASSWORD: ${DB_PASSWORD:+'set'}"

# 5. Check if can connect to database (without starting full app)
log "5. Database connectivity check:"
if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ]; then
    log "Database variables set, will test during app startup"
else
    log "⚠️ Database variables not properly set"
fi

# 6. Memory and disk space
log "6. System resources:"
log "Memory usage:"
free -h 2>/dev/null || log "Memory info not available"
log "Disk usage:"
df -h . 2>/dev/null || log "Disk info not available"

# 7. Check if port 80 is available
log "7. Port availability:"
if command -v netstat > /dev/null; then
    netstat -tlnp | grep :80 && log "⚠️ Port 80 already in use" || log "✅ Port 80 available"
else
    log "netstat not available"
fi

# 8. Test if we can start the app (with timeout)
log "8. Testing application startup..."
log "Starting app with 30 second timeout..."

timeout 30 node dist/server/production.mjs &
APP_PID=$!

sleep 5

# Check if process is still running
if kill -0 $APP_PID 2>/dev/null; then
    log "✅ App started successfully (PID: $APP_PID)"
    
    # Try to test endpoints
    sleep 2
    if command -v curl > /dev/null; then
        log "Testing health endpoint..."
        curl -f -s http://localhost:80/health && log "✅ Health endpoint responding" || log "❌ Health endpoint not responding"
        curl -f -s http://localhost:80/api/ping && log "✅ API ping responding" || log "❌ API ping not responding"
    fi
    
    # Clean up
    kill $APP_PID 2>/dev/null
    log "Test completed, app stopped"
else
    log "❌ App failed to start or crashed immediately"
    
    # Try to get error info
    log "Attempting to get error output..."
    timeout 10 node dist/server/production.mjs 2>&1 | head -20
fi

log "======================================"
log "🏁 Diagnostic completed"
log "Check the logs above for any issues"

# If we got here, try to start normally
log "🚀 Starting application normally..."
exec node dist/server/production.mjs
