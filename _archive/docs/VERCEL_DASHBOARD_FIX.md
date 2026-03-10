# CRITICAL: Vercel Dashboard Manual Fix Required

## The Problem

Vercel's Root Directory setting in the dashboard **overrides** vercel.json and is causing:
- Build command being ignored (showing "0ms" builds)
- pnpm workspace dependencies not resolving
- Path doubling error

## The Solution

### Step 1: Clear Root Directory in Vercel Dashboard

1. Go to: https://vercel.com/chris-projects-6ffe0e29/totalaud-io/settings
2. Click "General" tab
3. Scroll to "Root Directory" section
4. **DELETE the text "apps/aud-web"** - make the field **COMPLETELY EMPTY**
5. **Uncheck** "Include source files outside of the Root Directory in the Build Step"
6. Click **Save**

### Step 2: Verify vercel.json is Correct

The file should contain:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd apps/aud-web && pnpm run build",
  "devCommand": "cd apps/aud-web && pnpm run dev",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/aud-web/.next",
  "framework": null
}
```

✅ This is already committed in the latest push.

### Step 3: Trigger New Deployment

After clearing Root Directory, push a new commit or redeploy:

```bash
# Option A: Empty commit to trigger deployment
git commit --allow-empty -m "chore: trigger deployment after clearing Root Directory"
git push

# Option B: Redeploy via Vercel dashboard
# Go to Deployments → Click "..." on latest → Redeploy
```

## Why This Fix Works

**Before (BROKEN)**:
- Root Directory: `apps/aud-web`
- Vercel changes to `apps/aud-web` directory
- Vercel auto-detects Next.js
- Vercel IGNORES vercel.json buildCommand
- pnpm can't find `pnpm-workspace.yaml` (it's at root)
- Workspace dependencies fail to resolve
- Build fails or uses stale cache (0ms)

**After (FIXED)**:
- Root Directory: `` (empty)
- Vercel stays at monorepo root
- `framework: null` disables auto-detection
- vercel.json buildCommand executes: `cd apps/aud-web && pnpm run build`
- pnpm finds `pnpm-workspace.yaml` at root ✅
- Workspace dependencies resolve ✅
- Build runs from `apps/aud-web` directory ✅
- Output goes to `apps/aud-web/.next` ✅

## Expected Results

After clearing Root Directory and redeploying, you should see:
- Build time > 30s (actual build running, not "0ms")
- Build logs showing pnpm install and next build
- Deployment status: ● Ready
- Site accessible at https://totalaud.io

## If It Still Fails

1. Check deployment logs for actual error messages
2. Verify Root Directory field is truly empty (not just whitespace)
3. Try direct CLI deployment: `vercel --prod`
4. Check that vercel.json is in the Git commit

---

**Root Cause Identified**: Systematic debugging revealed Vercel wasn't running builds at all (0ms = no build)
**Fix**: Clear Root Directory + explicit vercel.json with framework: null
**Status**: vercel.json fixed and committed, **waiting for Root Directory to be cleared in dashboard**
