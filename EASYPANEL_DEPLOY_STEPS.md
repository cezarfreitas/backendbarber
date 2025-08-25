# 🚀 EasyPanel Deployment - Step by Step

## Current Problem
Service showing "Service is not reachable" at: https://ide-barbearia.jzo3qo.easypanel.host/api/ping

## ✅ SOLUTION: 3 Simple Steps

### STEP 1: Update Dockerfile in EasyPanel
1. Go to your EasyPanel application settings
2. Change Dockerfile to: `Dockerfile.simple`
3. OR copy the content from `Dockerfile.simple` to your main `Dockerfile`

### STEP 2: Set Environment Variables
1. Go to **Settings** → **Environment Variables** in EasyPanel
2. Copy ALL variables from `EASYPANEL_ENV_VARS.txt`
3. **IMPORTANT:** Generate secure JWT keys:

```bash
# Run these commands locally to generate secure keys:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Required Variables:**
```
NODE_ENV=production
PORT=80
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db
JWT_SECRET=your_generated_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_other_generated_key_here
JWT_REFRESH_EXPIRES_IN=7d
```

### STEP 3: Deploy
1. Push any code changes to your repository
2. In EasyPanel, click **"Deploy"**
3. **Wait 5-10 minutes** (be patient!)
4. Monitor logs for success messages:
   ```
   🚀 MINIMAL STARTUP - Barbearia API for EasyPanel
   ✅ SUCCESS! Server running on port 80
   ```

## 🔍 After Deploy - Test These URLs:

1. **Health Check:** https://ide-barbearia.jzo3qo.easypanel.host/health
   - Should return: `OK`

2. **API Ping:** https://ide-barbearia.jzo3qo.easypanel.host/api/ping
   - Should return: JSON with status

3. **API Docs:** https://ide-barbearia.jzo3qo.easypanel.host/api/docs
   - Should return: HTML documentation

4. **Barbearias:** https://ide-barbearia.jzo3qo.easypanel.host/api/barbearias
   - Should return: JSON with barbershops data

## 🚨 If Still Not Working

### Check EasyPanel Logs
Look for these specific error messages:

**Missing Environment Variables:**
```
DB_HOST: NOT_SET
❌ Error: connect ECONNREFUSED
```
**Solution:** Double-check all environment variables are set

**Port Issues:**
```
❌ SERVER ERROR: EADDRINUSE
```
**Solution:** EasyPanel should handle this automatically

**Build Issues:**
```
Build failed
```
**Solution:** Make sure all dependencies are in package.json

### Alternative: Use Dockerfile.simple
If the main Dockerfile doesn't work:
1. Rename `Dockerfile` to `Dockerfile.old`
2. Rename `Dockerfile.simple` to `Dockerfile`
3. Deploy again

### Last Resort: Check These Files
Ensure these files exist and are correct:
- ✅ `package.json` has all dependencies
- ✅ `server/index.ts` exports `createServer`
- ✅ `dist/server/production.mjs` exists after build
- ✅ All environment variables set in EasyPanel

## 📞 Support
If nothing works:
1. Copy the complete EasyPanel logs
2. Verify all environment variables are exactly as specified
3. Try deploying to an alternative platform (Fly.io, Railway)

---

🎯 **Goal:** Service responds at https://ide-barbearia.jzo3qo.easypanel.host/health
