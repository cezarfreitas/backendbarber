#!/bin/bash

# Build script for production deployment
set -e

echo "🚀 Building Barbearia API for production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build server only (backend API)
echo "⚙️  Building server..."
pnpm run build:server

# Verify build output
echo "✅ Verifying build output..."
if [ ! -f "dist/server/production.mjs" ]; then
    echo "❌ Build failed: production.mjs not found"
    exit 1
fi

echo "📊 Build statistics:"
echo "  - Server bundle: $(du -h dist/server/production.mjs | cut -f1)"
echo "  - Total dist size: $(du -sh dist/ | cut -f1)"

echo "✅ Production build completed successfully!"
echo "🎯 Ready for deployment!"
