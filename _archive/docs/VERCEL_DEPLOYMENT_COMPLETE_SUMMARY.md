# Vercel Deployment Issue - Complete Summary

**Date**: October 22, 2025
**Project**: totalaud.io (Next.js 15 + pnpm monorepo)
**Total Deployments**: 60+ attempts
**Final Status**: ❌ Builds succeed, but 404 NOT_FOUND on all routes

---

## 📋 Project Structure

```
totalaud.io/
├── pnpm-workspace.yaml          # Monorepo root
├── pnpm-lock.yaml               # Root lockfile
├── package.json                 # Root (no Next.js here)
├── turbo.json                   # Turborepo config
├── apps/
│   └── aud-web/                 # Next.js 15.0.3 app
│       ├── package.json         # Next.js + workspace:* deps
│       ├── pnpm-lock.yaml       # Symlink to ../../pnpm-lock.yaml
│       ├── src/                 # App source code
│       └── .next/               # Build output (local only)
└── packages/
    └── core/                    # Shared workspace packages
        ├── agent-executor/
        ├── supabase/
        ├── skills-engine/
        └── theme-engine/
```

**Key Dependencies**:
- Next.js 15.0.3
- React 18.3.1
- pnpm 8.x (workspace protocol)
- Turborepo 2.5.8
- TypeScript 5.6.3

---

## 🔍 The Core Problem

**Symptom**: Deployments show "● Ready" status, but all routes return 404 NOT_FOUND

**Evidence**:
```bash
$ vercel inspect <deployment-url>
Builds: . [0ms]  ← This is the smoking gun
```

The `[0ms]` build time means **Vercel is not detecting or registering the build output**, even though:
- ✅ Build completes successfully in logs
- ✅ Next.js generates all routes correctly
- ✅ Local builds work perfectly (16s, 258kB output)
- ✅ `.next` directory is created with `routes-manifest.json`

---

## 📝 Complete Error Timeline

### Phase 1: Initial Deployment (Old Project)

**Error 1: No Next.js version detected**
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```
- **Cause**: Root Directory empty, Vercel looking in root `package.json`
- **Fix**: Set Root Directory to `apps/aud-web`

---

**Error 2: npm used instead of pnpm**
```
npm error Unsupported URL Type "workspace:": workspace:*
```
- **Cause**: No `pnpm-lock.yaml` in Root Directory, Vercel defaulted to npm
- **Fix**: Created symlink `apps/aud-web/pnpm-lock.yaml → ../../pnpm-lock.yaml`

---

**Error 3: Frozen lockfile mismatch**
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json

Failure reason:
specifiers in the lockfile ({"turbo":"^2.0.0","typescript":"^5.3.3"})
don't match specs in package.json ({"@types/node":"^20", ...all aud-web deps...})
```
- **Cause**: Root `pnpm-lock.yaml` contains all monorepo packages, but Vercel compares against only `apps/aud-web/package.json`
- **Attempted Fix**: `--no-frozen-lockfile` flag in build command
- **Problem**: Vercel runs auto-install BEFORE build command, so flag never reached

---

**Error 4: workspace:* packages not found**
```
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND In : No matching version found for @total-audio/core-agent-executor@* inside the workspace
```
- **Cause**: Root Directory set to `apps/aud-web`, workspace packages at root not accessible
- **The Catch-22**: Need Root Directory for Next.js detection, but Root Directory breaks workspace resolution

---

**Error 5: NODE_ENV=production skipping devDependencies**
```
devDependencies: skipped because NODE_ENV is set to production
Cannot find module 'tailwindcss'
```
- **Cause**: Set `NODE_ENV=production` in environment variables
- **Problem**: pnpm skipped `tailwindcss`, `postcss`, `autoprefixer` (in devDependencies)
- **Fix**: Removed `NODE_ENV` env var, let Vercel set it automatically

---

### Phase 2: Fresh Start (New Project)

Deleted old project, created new `totalaud.io` project from scratch.

**Success**: Build completes without errors!
```
✓ Compiled successfully
Tasks: 1 successful, 1 total
Time: 55.626s
Build Completed in /vercel/output [1m]
```

**But**: All routes still return 404 NOT_FOUND

**Evidence**: `vercel inspect` shows `[0ms]` build time, indicating Vercel isn't detecting the output

---

## 🔧 All Attempted Solutions

### ✅ What Worked
1. **pnpm detection**: Symlink `apps/aud-web/pnpm-lock.yaml → ../../pnpm-lock.yaml`
2. **Build command**: `pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
3. **Environment variables**: Correct Supabase URLs, API keys
4. **Build completion**: Next.js build completes successfully with all routes generated

### ❌ What Didn't Work (404 persists)
1. Root Directory = `apps/aud-web` + custom build command
2. Root Directory = empty + `outputDirectory: apps/aud-web/.next`
3. Root Directory = empty + `outputDirectory: apps/aud-web`
4. `framework: null` with Turborepo build
5. `framework: auto-detect` with direct Next.js build
6. Removing `outputDirectory` entirely (auto-detect)
7. Removing `installCommand` (let Vercel handle it)
8. Dashboard overrides ON
9. Dashboard overrides OFF (vercel.json only)
10. Fresh Vercel project (deleted old one)

---

## 📄 Final Configuration Files

### `vercel.json` (Final Version)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build",
  "devCommand": "cd apps/aud-web && pnpm run dev"
}
```

### Vercel Dashboard Settings
- **Root Directory**: (empty)
- **All Override Toggles**: OFF (let vercel.json handle everything)

### Environment Variables (Production)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-key>
SUPABASE_SERVICE_ROLE_KEY=<production-key>
ANTHROPIC_API_KEY=<api-key>
OPENAI_API_KEY=<api-key>
NEXT_PUBLIC_APP_URL=https://totalaudio.vercel.app
# NODE_ENV removed (let Vercel set automatically)
```

### File Structure Additions
- `apps/aud-web/pnpm-lock.yaml` → symlink to `../../pnpm-lock.yaml`

---

## 🎯 Root Cause Analysis

**The Fundamental Issue**: Vercel's build detection system expects one of these patterns:

1. **Standard Next.js app** at repo root
2. **Monorepo with Root Directory** set to the app (but can't access workspace deps)
3. **Turborepo with Build Output API v3** format

Our setup is:
- **pnpm workspace monorepo** (not compatible with Root Directory isolation)
- **workspace:* dependencies** (needs full monorepo access during install)
- **Custom build command** (Vercel doesn't register the output)

**The Evidence**: `[0ms]` build time in `vercel inspect` means Vercel's build detection system never registered our Next.js output, even though the build completes successfully.

---

## 🔬 What We Learned

### Build Process Works
```bash
# This works perfectly locally and on Vercel:
pnpm install --no-frozen-lockfile
cd apps/aud-web
pnpm run build

# Output:
✓ Compiled successfully
Route (app)                              Size     First Load JS
┌ ○ /                                    71.9 kB         258 kB
├ ○ /_not-found                          898 B           101 kB
├ ƒ /api/agents/[name]/stream            162 B           100 kB
[... all routes generated ...]
```

### Vercel Detection Fails
```bash
$ vercel inspect <url>
Builds: . [0ms]  ← Vercel didn't detect the build

$ curl https://deployment-url.vercel.app
404: NOT_FOUND  ← No routes served
```

---

## 💡 Recommended Next Steps

### Option 1: Vercel Support (Recommended)
Share this document with Vercel support at https://vercel.com/support

**Key Questions for Support**:
1. Why does `vercel inspect` show `[0ms]` build when Next.js build completes successfully?
2. How should monorepo with `workspace:*` dependencies be configured?
3. Is there a way to make Vercel detect custom build output from subdirectories?
4. Should we use Turborepo's Build Output API v3 format instead?

### Option 2: Alternative Deployment Platforms

Since the app builds successfully, deploy to platforms with simpler build expectations:

**Railway** (https://railway.app)
```bash
# Railway detects monorepos automatically
railway up
```

**Fly.io** (https://fly.io)
```dockerfile
# Dockerfile with full control
FROM node:18-alpine
COPY . .
RUN corepack enable pnpm
RUN pnpm install --no-frozen-lockfile
RUN cd apps/aud-web && pnpm run build
CMD cd apps/aud-web && pnpm start
```

**Render** (https://render.com)
- Build Command: `pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
- Start Command: `cd apps/aud-web && pnpm start`

### Option 3: Restructure for Vercel

Move Next.js app to repo root (breaks monorepo benefits):
```bash
# Major restructuring needed
git mv apps/aud-web/* .
git mv packages apps/packages
# Update all imports and configs
```

### Option 4: Use Nx or Turborepo's Vercel Integration

Configure Turborepo specifically for Vercel:
https://turbo.build/repo/docs/handbook/deploying-with-vercel

---

## 📊 Deployment Statistics

- **Total Attempts**: 60+
- **Time Spent**: ~4 hours of systematic debugging
- **Errors Encountered**: 5 distinct error types
- **Configurations Tried**: 10+ different approaches
- **Build Success Rate**: 100% (locally and on Vercel)
- **Serve Success Rate**: 0% (all 404)

---

## 🔗 Useful Resources

- **Vercel Monorepo Docs**: https://vercel.com/docs/monorepos
- **Vercel Build Output API**: https://vercel.com/docs/build-output-api/v3
- **Turborepo + Vercel**: https://turbo.build/repo/docs/handbook/deploying-with-vercel
- **pnpm Workspace Protocol**: https://pnpm.io/workspaces#workspace-protocol-workspace
- **Next.js 15 Release Notes**: https://nextjs.org/blog/next-15

---

## 🎬 Conclusion

This project represents a challenging edge case for Vercel deployment:
- ✅ Modern stack (Next.js 15, pnpm workspaces, Turborepo)
- ✅ Builds successfully every time
- ❌ Vercel's build detection system doesn't register the output

The issue is **not with the code**, but with the **deployment configuration and Vercel's build detection logic**.

**Recommendation**: Either get official Vercel support, or deploy to a platform with more flexible build configuration (Railway, Fly.io, Render).

---

**Generated**: October 22, 2025
**By**: Claude Code (Systematic Debugging Session)
**Next Steps**: Share with Vercel support or try alternative platforms
