#!/bin/bash

# Script to test Docker build for EasyPanel deployment (port 80)
set -e

echo "🧪 Testing Docker build for EasyPanel (port 80)..."

# Build the Docker image
echo "🏗️ Building Docker image..."
docker build -t barbearia-api-test .

# Run container with port 80 mapped to local port 8080
echo "🚀 Starting container (port 80 -> localhost:8080)..."
docker run -d \
  --name barbearia-test \
  -p 8080:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  -e PING_MESSAGE="Test Docker Build" \
  barbearia-api-test

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Test the API
echo "🔍 Testing API endpoints..."

# Test ping endpoint
echo "Testing /api/ping..."
curl -f http://localhost:8080/api/ping || echo "❌ Ping failed"

# Test docs endpoint
echo "Testing /api/docs..."
curl -f -s http://localhost:8080/api/docs > /dev/null && echo "✅ Docs endpoint working" || echo "❌ Docs failed"

# Show container logs
echo "📋 Container logs:"
docker logs barbearia-test --tail 10

# Cleanup
echo "🧹 Cleaning up..."
docker stop barbearia-test
docker rm barbearia-test
docker rmi barbearia-api-test

echo "✅ Docker test completed!"
echo "🎯 Ready for EasyPanel deployment on port 80!"
