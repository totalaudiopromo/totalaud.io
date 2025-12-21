# MVP Launch Implementation Plan
**Ready for Beta in 2 Days**

---

## Day 1: Testing & Quality (6-8 hours)

### Morning: Fix Test Suite (2-3 hours)

1. **Fix Timeline Store Test Types** (1 hour)
   ```bash
   # View the actual Timeline store interface
   code apps/aud-web/src/stores/useTimelineStore.ts
   
   # Update tests to match actual API
   code apps/aud-web/src/stores/__tests__/useTimelineStore.test.ts
   ```
   - Check if `clearAll()` method exists or needs to be added
   - Verify `getNextSteps()` method signature
   - Fix `type` field in `addEvent()`

2. **Fix Pitch Store Test Types** (1 hour)
   - Check if `exportAsMarkdown()` and `exportAsPlainText()` exist
   - Add methods to store if missing
   - Update test expectations

3. **Run Tests** (30 min)
   ```bash
   pnpm test:unit          # Run Vitest unit tests
   pnpm test               # Run Playwright E2E tests
   ```

### Afternoon: Database & API (2-3 hours)

4. **Push Migration to Supabase** (30 min)
   ```bash
   # Push all migrations including opportunities table
   cd /Users/chrisschofield/workspace/active/totalaud.io
   supabase db push --include-all
   # Answer Y when prompted
   ```

5. **Verify Opportunities Data** (30 min)
   - Open Supabase Studio
   - Check `opportunities` table has 50 rows
   - Test a few queries manually
   - Verify RLS policies work

6. **Test Scout API Endpoint** (1 hour)
   ```bash
   # Start local dev
   pnpm dev:web
   
   # Test in browser or with curl
   curl http://localhost:3000/api/scout?type=radio
   ```
   - Test filtering by type, genre, vibe, size
   - Test search functionality
   - Test pagination

### Evening: Mobile Testing Setup (2 hours)

7. **iOS Testing** (1 hour)
   - Open on iPhone via local network
   - Test Ideas canvas drag
   - Test Scout grid scroll
   - Test Timeline touch interactions
   - Test Pitch keyboard

8. **Android Testing** (1 hour)
   - Same tests as iOS
   - Note any device-specific issues

---

## Day 2: Polish & Deploy (6-8 hours)

### Morning: Fix Mobile Issues (3-4 hours)

9. **Fix Any Mobile Bugs** (2-3 hours)
   Based on Day 1 testing:
   - Touch target sizes
   - Keyboard overlap issues
   - Scroll behavior
   - Safari-specific CSS

10. **Performance Optimization** (1 hour)
    ```bash
    # Run Lighthouse
    pnpm build:web
    # Test production build locally
    ```
    - Compress images in `public/brand/`
    - Check bundle size
    - Optimize any slow API calls

### Afternoon: Monitoring & Documentation (2-3 hours)

11. **Set Up Error Monitoring** (1 hour)
    - Sign up for Sentry (free tier)
    - Add Sentry to `apps/aud-web`
    - Test error reporting

12. **Update Documentation** (1-2 hours)
    - Update README with setup instructions
    - Create Railway deployment guide in `docs/`
    - Document environment variables needed

### Final: Beta Launch (1 hour)

13. **Pre-Launch Checklist** (30 min)
    - [ ] All tests passing
    - [ ] Migration pushed to production
    - [ ] Mobile tested on real devices
    - [ ] Error monitoring active
    - [ ] Landing page copy accurate
    - [ ] Auth flow working

14. **Invite Beta Testers** (30 min)
    - Send invites to 5-10 trusted artists
    - Prepare feedback form
    - Monitor first user sessions

---

## Quick Commands Reference

```bash
# Development
pnpm dev:web                    # Start aud-web locally
pnpm db:start                   # Start local Supabase
pnpm db:studio                  # Open Supabase Studio

# Testing
pnpm test:unit                  # Vitest unit tests
pnpm test                       # Playwright E2E tests
pnpm test:headed                # Playwright with browser
pnpm test:ui                    # Playwright UI mode

# Quality Checks
pnpm typecheck:web              # TypeScript check
pnpm lint                       # ESLint
pnpm build:web                  # Production build test

# Database
supabase db push --include-all  # Push all migrations
supabase db reset               # Reset local DB
supabase gen types typescript --local > packages/schemas/database/types.ts

# Deployment (Railway)
railway up                      # Deploy to Railway
railway logs                    # View logs
railway status                  # Check status
```

---

## Known Issues to Address

### Test Type Errors (Non-Blocking)
- Timeline store: `clearAll()`, `getNextSteps()`, `type` field
- Pitch store: `exportAsMarkdown()`, `exportAsPlainText()`
- Scout store: AudienceSize type import

**Fix**: Align test interfaces with actual store implementations

### Migration UUID Extension Error
- Error: `uuid_generate_v4() does not exist`
- **Fix**: Add `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` to migration header
- Or use `gen_random_uuid()` instead (Postgres 13+)

---

## Success Criteria

Before inviting beta testers, ensure:

✅ **Core Flow Works**:
- [ ] User can add idea
- [ ] User can browse Scout opportunities
- [ ] User can add opportunity to Timeline
- [ ] User can create pitch with AI coaching
- [ ] Data persists across sessions

✅ **Mobile Works**:
- [ ] All modes accessible on mobile
- [ ] Touch interactions smooth
- [ ] No keyboard overlap issues
- [ ] Responsive layout intact

✅ **Quality**:
- [ ] No console errors in production
- [ ] All tests passing
- [ ] Lighthouse score >85
- [ ] Error monitoring active

✅ **Documentation**:
- [ ] README updated
- [ ] Deployment guide exists
- [ ] ENV vars documented

---

## Emergency Rollback Plan

If production has issues:

```bash
# Option 1: Rollback migration
supabase db reset --db-url YOUR_PROD_URL

# Option 2: Rollback Railway deployment
railway rollback
```

---

## Post-Launch Week 1 Goals

1. **Gather feedback** from 10 beta users
2. **Fix top 3 reported bugs**
3. **Add analytics** (Posthog events)
4. **Performance improvements** based on real usage
5. **Prepare for public launch**

---

*Estimated Total Time: 12-16 hours over 2 days*  
*You're 85% there - just polish and ship! 🚀*
