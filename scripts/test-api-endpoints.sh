#!/bin/bash

echo "🔍 Testing API Endpoints..."
echo "================================"

# Get the container's internal IP if running in Docker
CONTAINER_IP=$(hostname -i 2>/dev/null || echo "localhost")
PORT=${PORT:-80}

echo "Testing on: $CONTAINER_IP:$PORT"
echo ""

# Test health endpoint
echo "1. Testing Health Check (/api/ping):"
curl -v -f "http://$CONTAINER_IP:$PORT/api/ping" 2>&1 || echo "❌ Health check failed"
echo ""

# Test docs endpoint  
echo "2. Testing Docs (/api/docs):"
curl -v -f "http://$CONTAINER_IP:$PORT/api/docs" 2>&1 || echo "❌ Docs endpoint failed"
echo ""

# Test root redirect
echo "3. Testing Root (/):"
curl -v -f "http://$CONTAINER_IP:$PORT/" 2>&1 || echo "❌ Root endpoint failed"
echo ""

# Test barbearias endpoint
echo "4. Testing Barbearias (/api/barbearias):"
curl -v -f "http://$CONTAINER_IP:$PORT/api/barbearias" 2>&1 || echo "❌ Barbearias endpoint failed"
echo ""

# Test external accessibility from within container
echo "5. Testing from 0.0.0.0:"
curl -v -f "http://0.0.0.0:$PORT/api/ping" 2>&1 || echo "❌ 0.0.0.0 binding test failed"
echo ""

# Show listening ports
echo "6. Checking listening ports:"
netstat -tlnp 2>/dev/null | grep ":$PORT " || echo "❌ Port $PORT not found in netstat"
echo ""

# Show process information
echo "7. Process information:"
ps aux | grep -E "(node|production)" | grep -v grep
echo ""

echo "================================"
echo "✅ Diagnostic completed"
