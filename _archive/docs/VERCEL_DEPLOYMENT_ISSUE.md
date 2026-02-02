# Vercel Deployment Issue - totalaud.io

**Date**: October 22, 2025
**Project**: totalaud.io (Next.js 15 + pnpm monorepo)
**Status**: 50+ failed deployments, systematic debugging in progress

## Project Structure

```
totalaud.io/
├── pnpm-workspace.yaml          # Monorepo root
├── pnpm-lock.yaml               # Root lockfile
├── package.json                 # Root package.json (no Next.js)
├── turbo.json                   # Turborepo config
├── apps/
│   └── aud-web/                 # Next.js 15 app
│       ├── package.json         # Has Next.js + workspace:* deps
│       ├── pnpm-lock.yaml       # Symlink to ../../pnpm-lock.yaml
│       └── .next/               # Build output (local only)
└── packages/
    └── core/                    # Shared packages
```

## The Problem

**Goal**: Deploy `apps/aud-web` (Next.js app) from pnpm monorepo to Vercel

**Issue**: Vercel build fails with various errors depending on configuration

## Error Timeline (Systematic Debugging)

### Error 1: No Next.js version detected
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```
**Cause**: Root Directory empty, Vercel looking in root package.json (no Next.js there)
**Fix**: Set Root Directory to `apps/aud-web`

### Error 2: workspace:* dependencies fail
```
npm error Unsupported URL Type "workspace:": workspace:*
```
**Cause**: Vercel using npm instead of pnpm when Root Directory set
**Fix**: Added symlink `apps/aud-web/pnpm-lock.yaml -> ../../pnpm-lock.yaml`

### Error 3: Frozen lockfile mismatch (CURRENT BLOCKER)
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json

Failure reason:
specifiers in the lockfile ({"turbo":"^2.0.0","typescript":"^5.3.3"})
don't match specs in package.json ({"@types/node":"^20", ...all aud-web deps...})
```

**Cause**: Root `pnpm-lock.yaml` contains all monorepo packages, but when Vercel is in `apps/aud-web` dir and runs `pnpm install`, it compares the lockfile against only `apps/aud-web/package.json` and sees a mismatch.

**Why this happens**: In CI environments (Vercel), pnpm defaults to `--frozen-lockfile` mode which fails if lockfile doesn't exactly match package.json.

## Current Vercel Dashboard Settings

**Settings → Build & Development Settings:**

- **Root Directory**: `apps/aud-web` ✅ (tells Vercel where Next.js is)
- **Framework Preset**: Next.js (auto-detected)
- **Build Command** (Override ON): `cd ../.. && pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
- **Output Directory** (Override ON): `.next`
- **Install Command** (Override OFF): (default)
- **Development Command** (Override ON): `pnpm run dev`

## Why Current Config Doesn't Work

1. **Install Command Override is OFF**
2. Vercel automatically runs `pnpm install` BEFORE the Build Command
3. Vercel's auto-install uses `--frozen-lockfile` (default in CI)
4. Install fails before Build Command ever runs
5. Build Command's `pnpm install --no-frozen-lockfile` never executes

## Attempted Solutions (All Failed)

1. ❌ Empty Root Directory + vercel.json config → No Next.js detected
2. ❌ Root Directory set + vercel.json → npm used instead of pnpm
3. ❌ Symlink pnpm-lock.yaml → frozen-lockfile error
4. ❌ Build Command with `--no-frozen-lockfile` → never runs (auto-install fails first)
5. ❌ Multiple vercel.json iterations → ignored by dashboard overrides
6. ❌ Deleting duplicate `aud-web` Vercel project → didn't help

## What Actually Works Locally

```bash
cd /Users/chrisschofield/workspace/active/totalaud.io
pnpm install                        # Works fine from root
pnpm turbo build --filter=aud-web   # Builds successfully in 16s
# Output: apps/aud-web/.next/        # All routes generated correctly
```

## The Solution (Needs to be Implemented)

**Disable Vercel's automatic install phase**, handle everything in Build Command:

```
Install Command Override: ON
Value: echo "Skipping default install, will install in build command"

Build Command Override: ON
Value: cd ../.. && pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build
```

This way:
1. Vercel skips auto-install (just echoes a message)
2. Build Command `cd`s to monorepo root
3. Runs `pnpm install --no-frozen-lockfile` from root (resolves workspace deps)
4. `cd`s back to `apps/aud-web`
5. Runs `pnpm run build` (Next.js build)
6. Output goes to `apps/aud-web/.next/`

## Key Files

- **Build config**: Vercel dashboard (no vercel.json in repo)
- **Monorepo**: `pnpm-workspace.yaml`, `turbo.json`
- **Next.js config**: `apps/aud-web/next.config.js`
- **Package manager**: pnpm 8.x (detected from pnpm-lock.yaml v6)

## Environment Variables (Already Configured)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<redacted>
SUPABASE_SERVICE_ROLE_KEY=<redacted>
ANTHROPIC_API_KEY=<redacted>
NEXT_PUBLIC_APP_URL=https://totalaud.io
NODE_ENV=production
```

## Important Context

- **TypeScript errors ignored**: `next.config.js` has `ignoreBuildErrors: true`
- **ESLint ignored**: `next.config.js` has `ignoreDuringBuilds: true`
- **This is experimental project**: Can break things, not customer-facing
- **Main project is separate**: total-audio-platform (customer acquisition focus)

## Ask ChatGPT to:

1. Confirm the solution approach (disable auto-install, use Build Command)
2. Provide exact Vercel dashboard settings to implement
3. Explain if there's a better monorepo deployment pattern for Vercel
4. Check if we're missing something fundamental about Vercel + pnpm monorepos

## Additional Notes

- 50+ failed deployments (mix of "Error" and "Ready" statuses)
- "Ready" deployments still return 404 (no actual build ran, shown by [0ms] build time)
- Local builds work perfectly every time
- Vercel CLI deployment (`vercel --prod`) has same issues as GitHub integration
