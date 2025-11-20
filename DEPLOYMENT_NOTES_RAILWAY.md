# Railway Deployment Notes
## totalaud.io Production Deployment

**Date**: 2025-01-22  
**Status**: Ready for Deployment  
**Platform**: Railway

---

## 📋 Pre-Deployment Checklist

### Configuration Files
- ✅ `railway.json` - Railway build/deploy config
- ✅ `.env.example` - Environment variables template
- ✅ `.github/workflows/ci.yml` - CI with safety guards
- ✅ `scripts/railway-deploy.sh` - Deployment automation script
- ✅ `scripts/railway-smoke-tests.sh` - Smoke test script

### Build Settings
- ✅ Build Command: `pnpm turbo build --filter=aud-web`
- ✅ Start Command: `pnpm --filter=aud-web start`
- ✅ Install Command: `pnpm install --frozen-lockfile`
- ✅ Health Check: `/api/health`

---

## 🔐 Environment Variables

### Required Variables

Add these in Railway → Project → Variables:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXTAUTH_URL=<your-railway-url>
NEXTAUTH_SECRET=<generate-secret>
ANTHROPIC_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
COHERE_API_KEY=<your-key>
```

### Optional Variables

```
MESHOS_ENABLED=true
OPERATOROS_ENABLED=true
HCL_ENABLED=true
NEXT_PUBLIC_POSTHOG_KEY=<optional>
NEXT_PUBLIC_POSTHOG_HOST=<optional>
```

**Status**: ⚠️ **PENDING** - Add these in Railway dashboard

---

## 🚀 Deployment URL

**Production URL**: `https://<your-app>.railway.app`

**Status**: ⚠️ **PENDING** - Will be generated after first deployment

---

## ✅ OS Surfaces Verification

After deployment, verify these routes:

- [ ] `/os/ascii` - ASCII OS loads
- [ ] `/os/xp` - XP OS loads with Agent Monitor
- [ ] `/os/aqua` - Aqua OS loads
- [ ] `/os/daw` - DAW OS loads
- [ ] `/os/analogue` - Analogue OS loads
- [ ] `/os/loopos` - LoopOS timeline renders
- [ ] `/os/studio` - Studio OS loads
- [ ] `/demo` - Auto-demo loads
- [ ] `/console` - Console loads

**Status**: ⚠️ **PENDING** - Run smoke tests after deployment

---

## 🧪 Smoke Test Results

### Health Check
- [ ] `/api/health` returns `{status:"ok"}`

### OS Surfaces
- [ ] All OS surfaces load without 500 errors
- [ ] No hydration errors in console
- [ ] OS layouts render correctly

### Agent System
- [ ] XP Agent Monitor opens
- [ ] AgentKernel accessible

### LoopOS
- [ ] Timeline renders
- [ ] Engines load
- [ ] Clips can be created

**Status**: ⚠️ **PENDING** - Run after deployment

---

## 📝 Deployment Log

### First Deployment
- **Date**: TBD
- **Branch**: `main`
- **Commit**: TBD
- **Status**: Pending

### Issues Found
- None yet

### Warnings
- None yet

---

## 🔧 Troubleshooting Notes

### Common Issues

1. **Build Fails**
   - Check Railway logs
   - Verify `pnpm-lock.yaml` is committed
   - Ensure Node 20+ is set

2. **Runtime Errors**
   - Verify all env vars are set
   - Check Supabase connection
   - Review Railway logs

3. **Health Check Fails**
   - Verify `/api/health` route exists
   - Check Railway healthcheck settings

---

## 📊 Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Railway Project | ⚠️ Pending | Create in Railway dashboard |
| Environment Variables | ⚠️ Pending | Add from `.env.example` |
| Build Configuration | ✅ Ready | `railway.json` configured |
| CI Pipeline | ✅ Ready | Safety guards active |
| Health Check | ✅ Ready | `/api/health` endpoint exists |
| OS Surfaces | ⚠️ Pending | Test after deployment |
| Agent System | ⚠️ Pending | Test after deployment |
| LoopOS | ⚠️ Pending | Test after deployment |

---

## 🎯 Next Steps

1. **Complete Railway Setup**:
   - [ ] Login to Railway
   - [ ] Create/select project
   - [ ] Add environment variables
   - [ ] Verify build settings
   - [ ] Trigger deployment

2. **Run Smoke Tests**:
   ```bash
   export RAILWAY_URL="https://your-app.railway.app"
   ./scripts/railway-smoke-tests.sh
   ```

3. **Update This File**:
   - [ ] Add deployment URL
   - [ ] Mark verified OS surfaces
   - [ ] Note any issues
   - [ ] Commit deployment notes

---

**Last Updated**: 2025-01-22  
**Next Update**: After Railway deployment

