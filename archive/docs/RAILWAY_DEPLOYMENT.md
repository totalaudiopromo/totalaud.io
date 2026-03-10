# Railway Deployment Guide - totalaud.io

**Production-ready Railway + Supabase + CI setup**

---

## 1. Railway Environment Setup

### Projects

You will have **one Railway project**:

**totalaud-io-web**
- Builds Next.js App Router (`apps/aud-web/`)
- Deploys on Railway's Edge Runtime
- Handles static assets, pages, API routes
- Connects to Supabase via env vars

**Optional: totalaud-io-services**
- Only needed if you run Node processes outside Next.js
- Examples: MeshOS daemon, HCL mapping server, agent orchestrators
- If all logic runs inside Next.js routes → use only `totalaud-io-web`

---

## 2. Environment Variables

### Create `.env.example` in repo root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# AI Keys
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
COHERE_API_KEY=

# OS / Experimental Systems
MESHOS_ENABLED=true
OPERATOROS_ENABLED=true
HCL_ENABLED=true

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### On Railway:

1. Go to **Project → Variables**
2. Paste all env vars from `.env.example`
3. Fill in actual values
4. Railway automatically injects them at runtime

**Note**: You don't need separate prod/dev projects unless you want staging.

---

## 3. Railway Build + Deploy Settings

### Configuration File: `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm turbo build --filter=aud-web"
  },
  "deploy": {
    "startCommand": "pnpm --filter=aud-web start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

**Railway automatically detects**:
- ✅ Next.js
- ✅ pnpm
- ✅ Monorepo (Turborepo)

It will auto-install and auto-build unless overridden.

---

## 4. CI (GitHub Actions) - Railway Edition

### Workflow: `.github/workflows/ci.yml`

The CI workflow includes:

1. **Standard checks**:
   - Lint
   - Typecheck
   - Test
   - Build

2. **Safety guards**:
   - ✅ No TAP imports (`@tap/`)
   - ✅ No TAP tables in migrations (`anr_`, `rcf_`, `scenes_`, etc.)
   - ✅ Campaign tables verification

**This ensures**:
- No broken imports
- No TypeScript regression
- No slipping TAP code into totalaud.io
- Next.js builds successfully before Railway deploys

---

## 5. Supabase Integration

### How It Works

1. **Railway** hosts the Next.js frontend & server runtime
2. **Supabase** hosts the DB & Auth
3. **You pass** the Supabase env vars into Railway

### Migrations

**For totalaud.io**:
- All migrations must live under: `supabase/migrations/`
- Run locally using Supabase CLI:
  ```bash
  supabase start
  supabase db push
  ```
- **Railway does NOT auto-run Supabase migrations**
  → You control migrations manually

---

## 6. Deploying totalaud.io to Railway

### Step-by-Step

1. **Go to Railway** → "New Project" → Deploy from GitHub
   - Pick the `totalaud.io` repo

2. **Set Configuration**:
   - **Root Directory**: Monorepo root (leave empty)
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Build Command**: `pnpm turbo build --filter=aud-web`
   - **Start Command**: `pnpm --filter=aud-web start`

3. **Add Environment Variables**:
   - Copy from `.env.example`
   - Paste into Railway Variables
   - Fill in actual values

4. **Click Deploy** → Done 🎉

---

## 7. Phase Consolidation Plan (Railway-friendly)

Railway doesn't care about how many apps you run — it cares how many **services** you spin up.

### A. Next.js (apps/aud-web)

**Serves everything in ONE Railway service**:
- ✅ ASCII OS
- ✅ XP OS
- ✅ Aqua
- ✅ DAW
- ✅ Analogue
- ✅ LoopOS
- ✅ Studio
- ✅ MeshOS dashboard
- ✅ OperatorOS shell
- ✅ Demo director
- ✅ Agents
- ✅ Engines
- ✅ Onboarding
- ✅ Hardware Control Layer (JS-only)
- ✅ API routes

**This stays ONE Railway service.**

### B. Optional Background Daemons

If MeshOS or OperatorOS ever require long-running tasks:

Create an additional Railway service:
- `packages/os-mesh-daemon` → Railway service 2

**But you don't need it yet.**

---

## 8. Safety Guards for totalaud.io

### A. Prevent TAP Contamination

**CI Check** (already in workflow):
```yaml
- name: Ensure no TAP imports
  run: |
    if grep -r "@tap/" apps packages 2>/dev/null; then
      echo "❌ TAP import detected"
      exit 1
    fi
```

### B. Ensure Only Correct DB Tables

**CI Check** (already in workflow):
```yaml
- name: Ensure migrations do not contain TAP tables
  run: |
    if grep -r "anr_" supabase/migrations || \
       grep -r "rcf_" supabase/migrations || \
       grep -r "scenes_" supabase/migrations; then
      echo "❌ Forbidden TAP table detected"
      exit 1
    fi
```

---

## 9. Health Check

Railway uses `/api/health` for health checks.

**Endpoint**: `apps/aud-web/src/app/api/health/route.ts`

**Configuration**:
- `healthcheckPath`: `/api/health`
- `healthcheckTimeout`: 100ms

---

## 10. Monitoring

### Railway Dashboard

- View logs in real-time
- Monitor deployment status
- Check resource usage
- View environment variables

### Health Monitoring

Railway automatically:
- Restarts on failure (up to 10 retries)
- Monitors health endpoint
- Sends alerts on deployment failures

---

## 11. Troubleshooting

### Build Fails

1. Check Railway logs
2. Verify `pnpm-lock.yaml` is committed
3. Ensure all workspace dependencies are listed
4. Check Node version (should be 20+)

### Runtime Errors

1. Check environment variables are set
2. Verify Supabase connection
3. Check API routes are accessible
4. Review Railway logs

### Migration Issues

1. Run migrations locally first: `supabase db push`
2. Verify migration files are in `supabase/migrations/`
3. Check for TAP table contamination
4. Ensure RLS policies are correct

---

## 12. Next Steps

1. ✅ Create Railway project
2. ✅ Add environment variables
3. ✅ Deploy from GitHub
4. ✅ Monitor first deployment
5. ✅ Set up custom domain (optional)
6. ✅ Configure staging environment (optional)

---

**Railway Setup Complete** ✅

Your totalaud.io app is now ready for production deployment on Railway!

