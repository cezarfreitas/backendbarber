#!/bin/bash

echo "🔧 EASYPANEL IMMEDIATE FIX"
echo "========================="

echo "📋 STEP 1: Environment Variables"
echo "Copy these to EasyPanel Settings → Environment Variables:"
echo ""
cat EASYPANEL_ENV_VARS.txt
echo ""

echo "📋 STEP 2: Generate JWT Secrets"
echo "Run these commands to generate secure keys:"
echo ""
echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""
echo "JWT_REFRESH_SECRET:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""

echo "📋 STEP 3: Dockerfile Options"
echo "Option A: Use Dockerfile.simple (rename to Dockerfile)"
echo "Option B: Update Dockerfile setting in EasyPanel to: Dockerfile.simple"
echo ""

echo "📋 STEP 4: Deploy"
echo "1. Set ALL environment variables in EasyPanel"
echo "2. Click Deploy"
echo "3. Wait 5-10 minutes"
echo "4. Test: https://ide-barbearia.jzo3qo.easypanel.host/health"
echo ""

echo "✅ Complete guide: EASYPANEL_DEPLOY_STEPS.md"
echo "========================="
