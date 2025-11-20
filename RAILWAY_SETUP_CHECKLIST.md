# Railway Deployment Setup Checklist
## totalaud.io - Automated Setup Guide

**Date**: 2025-01-22  
**Status**: Ready for Manual Railway Configuration

---

## ✅ Pre-Deployment Verification

### Files Ready
- ✅ `railway.json` - Railway configuration
- ✅ `.env.example` - Environment variables template
- ✅ `.github/workflows/ci.yml` - CI with safety guards
- ✅ `RAILWAY_DEPLOYMENT.md` - Deployment guide

### Build Configuration
- ✅ Build Command: `pnpm turbo build --filter=aud-web`
- ✅ Start Command: `pnpm --filter=aud-web start`
- ✅ Install Command: `pnpm install --frozen-lockfile`
- ✅ Health Check: `/api/health`

---

## 📋 Manual Railway Setup Steps

Since browser automation isn't available, follow these steps:

### PHASE 1: Railway Login
1. Open https://railway.app
2. Click "Login with GitHub"
3. Authenticate (MFA if required)
4. Wait for Railway dashboard

### PHASE 2: Create/Select Project
1. If project exists: Open "totalaud.io" project
2. If not: 
   - Click "New Project"
   - Select "Deploy from GitHub repository"
   - Choose `totalaud.io` repo

### PHASE 3: Add Environment Variables

Go to: **Project → Variables**

Add these variables (copy from `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXTAUTH_URL=<your-railway-url>
NEXTAUTH_SECRET=<generate-secret>
ANTHROPIC_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
COHERE_API_KEY=<your-key>
MESHOS_ENABLED=true
OPERATOROS_ENABLED=true
HCL_ENABLED=true
NEXT_PUBLIC_POSTHOG_KEY=<optional>
NEXT_PUBLIC_POSTHOG_HOST=<optional>
```

**Note**: Railway will auto-detect `railway.json` for build settings.

### PHASE 4: Verify Build Settings

Go to: **Settings → Build & Deploy**

Verify:
- ✅ Build Command: `pnpm turbo build --filter=aud-web`
- ✅ Start Command: `pnpm --filter=aud-web start`
- ✅ Install Command: `pnpm install --frozen-lockfile`
- ✅ Healthcheck Path: `/api/health`

### PHASE 5: Push Branches (Terminal)

Run these commands:

```bash
cd /Users/chrisschofield/workspace/active/totalaud.io
git push origin import/meshos-phase-13
git push origin import/operatoros-phase2
```

### PHASE 6: Trigger Deployment

1. In Railway dashboard, click **"Deploy"**
2. Watch build logs
3. Wait for deployment to complete
4. Note the deployment URL

### PHASE 7: Smoke Tests

After deployment, test these URLs:

- ✅ `/api/health` - Should return `{status:"ok"}`
- ✅ `/os/ascii` - ASCII OS loads
- ✅ `/os/xp` - XP OS loads with Agent Monitor
- ✅ `/os/aqua` - Aqua OS loads
- ✅ `/os/daw` - DAW OS loads
- ✅ `/os/analogue` - Analogue OS loads
- ✅ `/os/loopos` - LoopOS timeline renders
- ✅ `/os/studio` - Studio OS loads
- ✅ `/demo` - Auto-demo loads

---

## 🔍 Automated Verification (Run After Setup)

After you've completed Railway setup, run:

```bash
# Check deployment URL
curl https://your-railway-url.railway.app/api/health

# Verify OS surfaces (if deployed)
curl -I https://your-railway-url.railway.app/os/ascii
curl -I https://your-railway-url.railway.app/os/xp
curl -I https://your-railway-url.railway.app/os/loopos
```

---

## 📝 Deployment Notes Template

After successful deployment, update `DEPLOYMENT_NOTES_RAILWAY.md` with:

- Deployment URL
- Environment variables added
- OS surfaces tested
- Any issues found

---

## 🚨 Troubleshooting

### Build Fails
- Check Railway logs
- Verify `pnpm-lock.yaml` is committed
- Ensure Node 20+ is set

### Runtime Errors
- Verify all env vars are set
- Check Supabase connection
- Review Railway logs

### Health Check Fails
- Verify `/api/health` route exists
- Check Railway healthcheck settings
- Review deployment logs

---

**Next Step**: Complete manual Railway setup, then run verification commands.

