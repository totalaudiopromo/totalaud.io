# Troubleshooting Guide

Common issues and solutions for totalaud.io development.

---

## 🚨 Common Issues

### Port 3000 Already in Use

**Symptom**: Can't start dev server, error says port 3000 is in use

**Solution**:
```bash
pnpm port:kill
# Or manually:
lsof -ti:3000 | xargs kill -9
```

---

### Type Errors After Database Changes

**Symptom**: TypeScript errors about missing database types or incorrect shapes

**Solution**:
```bash
# Regenerate database types from Supabase schema
pnpm db:types

# Then check types
pnpm typecheck
```

---

### Build Fails Mysteriously

**Symptom**: Build fails with vague errors, or works locally but not in CI

**Solution**:
```bash
# Nuclear option: clean everything and reinstall
pnpm dev:clean

# Or step by step:
pnpm clean
rm -rf node_modules .turbo apps/*/node_modules packages/*/node_modules
pnpm install
pnpm build
```

---

### Supabase Won't Start

**Symptom**: `pnpm db:start` fails or Supabase Studio won't load

**Solution**:
```bash
# Restart Supabase
pnpm db:restart

# If that doesn't work, full reset (DELETES DATA):
pnpm db:stop
docker ps -a | grep supabase | awk '{print $1}' | xargs docker rm -f
pnpm db:start
```

---

### TypeScript Complains About Missing Types

**Symptom**: `Cannot find module '@total-audio/...' or its corresponding type declarations`

**Solution**:
```bash
# Install dependencies
pnpm install

# Rebuild workspace packages
pnpm build

# Check types
pnpm typecheck
```

---

### Linter Errors on Commit

**Symptom**: Pre-commit hook fails with lint or format errors

**Solution**:
```bash
# Auto-fix what's possible
pnpm lint:fix
pnpm format

# Check what remains
pnpm check
```

---

### "American Spelling" Pre-commit Hook Failure

**Symptom**: Hook fails complaining about American spelling

**Common False Positives**:
- CSS properties like `color:`, `background-color:` (these are fine, they're CSS keywords)
- HTML/SVG attributes
- Package names and imports

**Solution**:
```bash
# If it's a real spelling error, fix it (use UK spelling)
# If it's a false positive (CSS, package name), you can bypass once:
git commit --no-verify -m "your message"
```

**Better Solution**: Report false positives so the hook can be improved.

---

### Railway Deployment Fails

**Symptom**: Deployment builds locally but fails on Railway

**Solution**:
```bash
# Ensure Railway environment variables are set
railway variables

# Check build logs
railway logs

# Test production build locally
pnpm build:web
```

---

### Database Migration Conflicts

**Symptom**: `pnpm db:migrate` fails with conflict errors

**Solution**:
```bash
# Pull latest migrations from remote
git pull origin main

# Reset local database to match migrations
pnpm db:reset

# Regenerate types
pnpm db:types
```

---

### React Hydration Errors

**Symptom**: "Text content does not match" or "Hydration failed" errors in browser console

**Common Causes**:
- Date/time formatting (server vs client timezone)
- Randomized content
- Conditional rendering based on browser-only APIs

**Solution**:
- Use `useState` + `useEffect` for client-only content
- Ensure server and client render the same initial HTML
- Use `suppressHydrationWarning` only as last resort

---

### Can't Access Supabase Studio

**Symptom**: http://localhost:54323 doesn't load

**Solution**:
```bash
# Check if Supabase is running
pnpm db:start

# Open Studio (macOS)
pnpm db:studio

# Check Docker containers
docker ps | grep supabase
```

---

### API Routes Return 500 Errors

**Symptom**: API calls fail with 500 Internal Server Error

**Debug Steps**:
1. Check server logs in terminal where `pnpm dev` is running
2. Add `console.error` to the failing route
3. Verify Supabase environment variables are set
4. Test Supabase connection:
   ```bash
   # In browser console on localhost:3000
   fetch('/api/health').then(r => r.json()).then(console.log)
   ```

---

### Module Not Found Errors

**Symptom**: `Cannot find module './path/to/file'` or `Module not found: Can't resolve '@total-audio/...'`

**Solution**:
```bash
# Ensure workspace structure is correct
cat pnpm-workspace.yaml

# Reinstall dependencies
pnpm install

# Clear Turbo cache
rm -rf .turbo
pnpm build
```

---

### Git Hooks Not Running

**Symptom**: Pre-commit checks aren't running when you commit

**Solution**:
```bash
# Ensure hooks are installed (should happen automatically on install)
ls -la .git/hooks/

# Reinstall if needed
pnpm install
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

```bash
# Turbo verbose mode
turbo run dev --verbose

# Next.js verbose mode
DEBUG=* pnpm dev:web
```

### Check Environment Variables

```bash
# List all variables
printenv | grep NEXT_PUBLIC

# Check specific variable
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Inspect Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests
5. Check request/response payloads

### Check Railway Logs

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs

# Tail logs (live)
railway logs --follow
```

---

## 🆘 Still Stuck?

1. **Check Documentation**:
   - [DEV_GUIDE.md](DEV_GUIDE.md) - Quick commands
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Full guide
   - [docs/TOTALAUD_IO_CONTEXT.md](docs/TOTALAUD_IO_CONTEXT.md) - Project context

2. **Search Issues**: Check [GitHub Issues](https://github.com/totalaudiopromo/totalaud.io/issues) for similar problems

3. **Ask for Help**: Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Error messages (full stack trace)
   - What you've already tried
   - Your environment (OS, Node version, pnpm version)

4. **Get Environment Info**:
   ```bash
   node --version
   pnpm --version
   git --version
   docker --version
   ```

---

**Last Updated**: November 2025 (Phase 18)

