#!/bin/bash

echo "🏥 Testing EasyPanel Health Check Compatibility..."
echo "================================================"

# Test the exact health check command used in Dockerfile
echo "1. Testing health check command:"
curl -f http://localhost:80/api/ping || echo "❌ Health check command failed"
echo ""

# Test with verbose output
echo "2. Verbose health check:"
curl -v http://localhost:80/api/ping 2>&1
echo ""

# Test different localhost variations
echo "3. Testing localhost variations:"
echo "Testing 127.0.0.1:"
curl -f http://127.0.0.1:80/api/ping 2>&1 || echo "❌ 127.0.0.1 failed"
echo ""

echo "Testing 0.0.0.0:"
curl -f http://0.0.0.0:80/api/ping 2>&1 || echo "❌ 0.0.0.0 failed"
echo ""

# Check if the process is actually listening
echo "4. Checking listening processes:"
netstat -tlnp | grep :80 || echo "❌ Nothing listening on port 80"
echo ""

# Check if curl is available
echo "5. Checking curl availability:"
which curl || echo "❌ curl not found"
curl --version || echo "❌ curl version check failed"
echo ""

echo "================================================"
echo "✅ Health check test completed"
