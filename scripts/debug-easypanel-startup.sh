#!/bin/bash

echo "🔍 EasyPanel Container Startup Diagnosis"
echo "======================================="

# Check environment variables
echo "1. Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "PORT: ${PORT:-not set}"
echo "DB_HOST: ${DB_HOST:-not set}"
echo "DB_USER: ${DB_USER:-not set}"
echo "JWT_SECRET: ${JWT_SECRET:+set}"
echo ""

# Check if required files exist
echo "2. Checking required files:"
ls -la dist/server/production.mjs || echo "❌ production.mjs not found"
ls -la package.json || echo "❌ package.json not found"
echo ""

# Check database connection
echo "3. Testing database connection:"
if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ]; then
    echo "DB configured, will test during app startup"
else
    echo "⚠️ Database variables not set"
fi
echo ""

# Memory and process info
echo "4. System resources:"
free -h 2>/dev/null || echo "Memory info not available"
df -h . 2>/dev/null || echo "Disk info not available"
echo ""

echo "5. Starting application with debugging..."
echo "======================================="

# Start with verbose logging
exec node dist/server/production.mjs
