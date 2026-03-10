# Railway Manual Setup Guide
## Step-by-Step Deployment Instructions

Since browser automation isn't available, follow these manual steps to complete Railway deployment.

---

## ✅ AUTOMATED (Already Complete)

### Phase 5: Branch Push
- ✅ `import/meshos-phase-13` pushed to origin
- ✅ `import/operatoros-phase2` pushed to origin

### Configuration Files
- ✅ `railway.json` configured
- ✅ `.env.example` created
- ✅ CI workflow with safety guards
- ✅ Deployment scripts created

---

## 📋 MANUAL STEPS REQUIRED

### PHASE 1: Railway Login

1. **Open Railway**: https://railway.app
2. **Click**: "Login with GitHub"
3. **Authenticate**: Complete GitHub OAuth (MFA if required)
4. **Wait**: For redirect to Railway dashboard

**⏸️ PAUSE HERE** if login requires manual intervention, then continue.

---

### PHASE 2: Create/Select Project

#### Option A: Project Exists
1. Find project named **"totalaud.io"** in dashboard
2. Click to open it

#### Option B: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repository"**
3. Choose repository: **`totalaudiopromo/totalaud.io`**
4. Railway will auto-detect `railway.json`

---

### PHASE 3: Add Environment Variables

1. **Navigate**: Project → **Variables** tab
2. **Add each variable** from the list below:

#### Copy-Paste Template

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
COHERE_API_KEY=
MESHOS_ENABLED=true
OPERATOROS_ENABLED=true
HCL_ENABLED=true
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

3. **For each variable**:
   - Click **"New Variable"**
   - Paste name
   - Paste value (or leave empty if you'll add secrets later)
   - Click **"Add"**

**⚠️ SECRET VALUES**: You'll need to provide:
- Supabase URL and keys (from Supabase dashboard)
- NEXTAUTH_SECRET (generate: `openssl rand -base64 32`)
- AI API keys (from provider dashboards)
- Railway URL (will be generated after first deploy)

---

### PHASE 4: Verify Build Settings

1. **Navigate**: Settings → **Build & Deploy**
2. **Verify these settings**:

| Setting | Expected Value |
|---------|----------------|
| **Build Command** | `pnpm turbo build --filter=aud-web` |
| **Start Command** | `pnpm --filter=aud-web start` |
| **Install Command** | `pnpm install --frozen-lockfile` |
| **Healthcheck Path** | `/api/health` |

3. **If wrong**: Click edit and update

**Note**: Railway should auto-detect from `railway.json`, but verify.

---

### PHASE 6: Trigger First Deployment

1. **Navigate**: Project dashboard
2. **Click**: **"Deploy"** button (or Railway may auto-deploy)
3. **Watch**: Build logs in real-time
4. **Wait**: For build to complete (usually 3-5 minutes)
5. **Note**: The deployment URL (e.g., `https://totalaud-io-web-production.up.railway.app`)

**Expected Build Output**:
```
✓ Installing dependencies...
✓ Building with Turborepo...
✓ Building aud-web...
✓ Next.js build complete
✓ Starting server...
```

---

### PHASE 7: Smoke Tests

After deployment completes, test these URLs:

#### Automated Test (Recommended)

```bash
export RAILWAY_URL="https://your-app.railway.app"
./scripts/railway-smoke-tests.sh
```

#### Manual Tests

Open each URL in browser:

1. **Health Check**: `https://your-app.railway.app/api/health`
   - Expected: `{"status":"ok","timestamp":"..."}`

2. **OS Surfaces**:
   - `/os/ascii` - Should load ASCII terminal
   - `/os/xp` - Should load XP OS with Agent Monitor
   - `/os/aqua` - Should load Aqua OS
   - `/os/daw` - Should load DAW OS
   - `/os/analogue` - Should load Analogue OS
   - `/os/loopos` - Should load LoopOS timeline
   - `/os/studio` - Should load Studio OS

3. **Other Routes**:
   - `/demo` - Should load auto-demo
   - `/console` - Should load console

**Check for**:
- ✅ No 500 errors
- ✅ No hydration errors in browser console
- ✅ OS layouts render correctly
- ✅ Agent Monitor opens in XP OS
- ✅ LoopOS timeline renders

---

### PHASE 8: Update Deployment Notes

1. **Open**: `DEPLOYMENT_NOTES_RAILWAY.md`
2. **Update**:
   - Deployment URL
   - Environment variables added (checklist)
   - OS surfaces tested (checklist)
   - Any issues found
3. **Commit**:
   ```bash
   git add DEPLOYMENT_NOTES_RAILWAY.md
   git commit -m "docs: add Railway deployment notes"
   git push origin main
   ```

---

## 🎯 Quick Reference

### Railway Dashboard URLs
- **Projects**: https://railway.app/dashboard
- **Your Project**: https://railway.app/project/[project-id]

### Environment Variables Checklist
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXTAUTH_URL` (use Railway URL after deploy)
- [ ] `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] `ANTHROPIC_API_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `COHERE_API_KEY`
- [ ] `MESHOS_ENABLED=true`
- [ ] `OPERATOROS_ENABLED=true`
- [ ] `HCL_ENABLED=true`

### Smoke Test Checklist
- [ ] `/api/health` returns OK
- [ ] All 8 OS surfaces load
- [ ] No console errors
- [ ] Agent Monitor works
- [ ] LoopOS timeline renders

---

## 🚨 Troubleshooting

### Build Fails
- **Check**: Railway logs for error messages
- **Verify**: `pnpm-lock.yaml` is committed
- **Ensure**: Node version is 20+ in Railway settings

### Runtime Errors
- **Check**: All environment variables are set
- **Verify**: Supabase connection (test URL/keys)
- **Review**: Railway runtime logs

### Health Check Fails
- **Verify**: `/api/health` route exists (it does)
- **Check**: Railway healthcheck settings match
- **Review**: Deployment logs for startup errors

### OS Surfaces Don't Load
- **Check**: Browser console for errors
- **Verify**: Routes exist in `apps/aud-web/src/app/os/`
- **Note**: Some OS surfaces may not be in current branch

---

## 📊 Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Login | ⚠️ Manual | Complete Railway login |
| Phase 2: Project | ⚠️ Manual | Create/select project |
| Phase 3: Env Vars | ⚠️ Manual | Add from `.env.example` |
| Phase 4: Build Settings | ⚠️ Manual | Verify in Railway |
| Phase 5: Push Branches | ✅ Complete | Branches pushed |
| Phase 6: Deploy | ⚠️ Manual | Trigger in Railway |
| Phase 7: Smoke Tests | ⚠️ Manual | Test after deploy |
| Phase 8: Notes | ⚠️ Manual | Update and commit |

---

**Next Action**: Complete Phase 1-4 manually in Railway dashboard, then proceed with deployment.

