# Railway Deployment Guide

## 🚂 TotalAud.io on Railway

This guide covers deploying the totalaud.io monorepo to Railway.

---

## 📋 Prerequisites

- Railway account connected to your GitHub repository
- Supabase project (or Railway PostgreSQL addon)
- API keys for OpenAI and/or Anthropic

---

## ⚙️ Environment Variables

Set these in your Railway project settings:

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NEXT_PUBLIC_APP_URL=https://your-app.railway.app

# AI Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
```

### Optional

```bash
# Google OAuth (for Gmail + Sheets integrations)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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45

# Feature Flags
NEXT_PUBLIC_ENABLE_INTEGRATIONS=true
NEXT_PUBLIC_ENABLE_SOUND_CUES=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

---

## 🔧 Configuration Files

### `railway.json`
Main Railway configuration with build and deploy settings.

**Key features:**
- Uses Turborepo filter to build only aud-web
- Healthcheck on `/api/health` endpoint
- Restart policy with 10 retries on failure
- Watch patterns for smart rebuilds

### `nixpacks.toml`
Nixpacks build configuration for optimal caching.

**Key features:**
- Pins Node.js 18.x and pnpm
- Uses `--frozen-lockfile` for reproducible builds
- Separates install and build phases for better caching

---

## 🚀 Deployment Steps

### 1. Connect Repository

```bash
# In Railway dashboard:
1. New Project → Deploy from GitHub
2. Select: totalaudiopromo/totalaud.io
3. Select branch: main
```

### 2. Configure Environment Variables

```bash
# In Railway project settings:
1. Variables tab
2. Add all required environment variables
3. Railway will auto-redeploy
```

### 3. Set Custom Domain (Optional)

```bash
# In Railway project settings:
1. Settings → Domains
2. Add custom domain: totalaud.io
3. Configure DNS (Railway provides instructions)
```

---

## 🔍 Health Check

Railway will ping `/api/health` every 60 seconds to ensure the app is running.

**Current implementation:**
- Returns `{ status: 'ok', timestamp: ISO8601 }`
- Located at: `apps/aud-web/src/app/api/health/route.ts`

---

## 📊 Build Optimization

### Caching Strategy

Railway caches between builds:
- `node_modules/` (from pnpm)
- `.next/cache/` (Next.js build cache)
- Turborepo cache (`.turbo/`)

### Build Time

Expected build times:
- **First build:** ~3-5 minutes
- **Incremental builds:** ~1-2 minutes (with cache)

### Bundle Size

Current production bundle (aud-web):
- First Load JS: ~200KB (estimated)
- Check actual size: `pnpm build --filter=aud-web` locally

---

## 🐛 Troubleshooting

### Build Fails: "Cannot find module"

**Issue:** Workspace dependencies not resolving

**Fix:**
```bash
# Ensure pnpm-workspace.yaml is correct
# Verify package.json workspaces match
# Check that all @total-audio/* packages are linked
```

### Environment Variables Not Loading

**Issue:** Next.js can't access env vars

**Fix:**
```bash
# Prefix with NEXT_PUBLIC_ for client-side access
# Rebuild after changing env vars
# Check Railway logs for missing var warnings
```

### App Crashes on Startup

**Issue:** Missing required environment variables

**Fix:**
```bash
# Add runtime validation (TODO - see TECHNICAL_AUDIT_2025.md)
# Check Railway logs for specific error
# Verify Supabase URL and keys are correct
```

### Health Check Failing

**Issue:** `/api/health` endpoint not responding

**Fix:**
```bash
# Verify route exists: apps/aud-web/src/app/api/health/route.ts
# Check that Next.js server is starting (Railway logs)
# Increase healthcheckTimeout in railway.json if needed
```

---

## 📈 Monitoring

### Railway Metrics Dashboard

Monitor your deployment:
- **CPU Usage:** Should be < 50% under normal load
- **Memory Usage:** Should be < 512MB for aud-web
- **Build Time:** Track for performance regression
- **Deployment Frequency:** Shows team velocity

### Recommended Alerts

Set up alerts for:
- Health check failures (> 3 consecutive)
- Memory usage > 80%
- Build time > 5 minutes
- Deployment failures

---

## 🔐 Security Best Practices

### Environment Variables

✅ **DO:**
- Use Railway's built-in secrets management
- Rotate API keys regularly
- Use different keys for staging/production

❌ **DON'T:**
- Commit `.env` files to git
- Share API keys in Slack/Discord
- Use same keys across environments

### Database Access

✅ **DO:**
- Use Supabase RLS (Row Level Security)
- Use service role key only in API routes
- Validate all user inputs

❌ **DON'T:**
- Expose service role key to client
- Disable RLS policies
- Trust user input without validation

---

## 🔄 CI/CD Integration

### Automatic Deployments

Railway automatically deploys on:
- Push to `main` branch
- Merged pull requests
- Manual trigger from dashboard

### Preview Deployments

Enable PR previews:
```bash
# In Railway project settings:
1. Settings → Deployments
2. Enable "PR Deploys"
3. Each PR gets unique URL
```

---

## 💰 Cost Optimization

### Railway Pricing

Current usage (estimated):
- **Hobby Plan:** $5/month (512MB RAM, shared CPU)
- **Pro Plan:** $20/month (8GB RAM, 8 vCPUs shared)

### Optimization Tips

1. **Enable Turborepo cache** - Faster builds = lower build minutes
2. **Use healthcheck** - Prevents zombie processes
3. **Monitor memory** - Right-size your plan
4. **Review build logs** - Remove unnecessary dependencies

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Nixpacks Docs](https://nixpacks.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Turborepo Docs](https://turbo.build/repo/docs)

---

## 🆘 Support

**Railway Issues:**
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp/nixpacks/issues)

**App Issues:**
- Check `TECHNICAL_AUDIT_2025.md` for known issues
- Review Railway deployment logs
- Test locally with `pnpm build && pnpm start`

---

**Last Updated:** October 2025
**Deployment Status:** ✅ Active on Railway
