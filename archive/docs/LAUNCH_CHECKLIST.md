# 🚀 Launch Checklist - Beta Release

**Use this checklist to go from current state → live beta in 1-2 days**

---

## DAY 1: Core Setup (6-8 hours)

### ☐ Morning: Database & API (2-3 hours)

#### 1. Push Migration (30 min) **DONE**
```bash
cd /Users/chrisschofield/workspace/active/totalaud.io
supabase db push --include-all
# Answer Y when prompted for 6 migrations
```

**Verify**:
- [x] Open Supabase Studio: `supabase db:studio`
- [x] Check `opportunities` table has 50 rows
- [x] Verify RLS policies exist
- [x] Test a query manually in Studio
- [x] Track memory tables exist (`track_memory`, `track_memory_entries`)

#### 2. Test Scout API (1 hour)
```bash
# Start dev server
pnpm dev:web

# In browser or curl:
# http://localhost:3000/api/scout?type=radio
# http://localhost:3000/api/scout?genre=indie
```

**Verify**:
- [ ] API returns 200 OK
- [ ] Filtering by type works
- [ ] Filtering by genre works
- [ ] Search works
- [ ] Pagination works

#### 3. Fix Any Typecheck Errors (1 hour)
```bash
pnpm typecheck:web
# Fix any errors shown
```

**Verify**:
- [ ] Zero TypeScript errors
- [ ] Build passes: `pnpm build:web`

---

### ☐ Afternoon: Mobile + Performance (3-4 hours)

#### 4. iOS Testing (1.5 hours)
Test on real iPhone:
- [ ] Ideas Mode: Canvas drag works smoothly
- [ ] Ideas Mode: Add/edit/delete ideas
- [ ] Scout Mode: Grid scrolls smoothly
- [ ] Scout Mode: Filters accessible
- [ ] Scout Mode: "Add to Timeline" works
- [ ] Timeline Mode: Events visible
- [ ] Timeline Mode: Touch interactions work
- [ ] Pitch Mode: Keyboard doesn't overlap content
- [ ] Pitch Mode: AI coach accessible
- [ ] Mobile nav switches modes correctly

#### 5. Android Testing (1.5 hours)
Same tests as iOS on Android device

#### 6. Performance Audit (1 hour)
```bash
# Build production
pnpm build:web

# Run Lighthouse on:
# - http://localhost:3000/
# - http://localhost:3000/workspace
```

**Targets**:
- [ ] Performance: 85+
- [ ] Accessibility: 90+
- [ ] SEO: 85+

---

## DAY 2: Polish & Launch (6-8 hours)

### ☐ Morning: Bug Fixes & Monitoring (3-4 hours)

#### 7. Fix Mobile Issues (2-3 hours)
Based on Day 1 testing:
- [ ] Fix touch target sizes if needed
- [ ] Fix keyboard overlap issues
- [ ] Fix any scroll behavior issues
- [ ] Test fixes on both iOS and Android

#### 8. Add Error Monitoring (1 hour)
```bash
# Sign up for Sentry (free tier)
# Add to package.json:
pnpm add @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs
```

**Verify**:
- [ ] Sentry initialized
- [ ] Test error catch works
- [ ] Production DSN configured

---

### ☐ Afternoon: Final Checks & Launch (2-3 hours)

#### 9. End-to-End Test (1 hour)
**On Production/Staging**:
- [ ] Sign up new account
- [ ] Add 3 ideas
- [ ] Browse Scout opportunities
- [ ] Add 2 opportunities to Timeline
- [ ] Create a radio pitch
- [ ] Use AI coach
- [ ] Logout and login again
- [ ] Verify data persisted

#### 10. Documentation Update (30 min)
- [ ] Update README with actual setup steps
- [ ] Verify .env.example is complete
- [ ] Add troubleshooting section if needed

#### 11. Pre-Launch Checklist (30 min)
- [ ] All 4 modes functional ✓
- [ ] Migration pushed to production ✓
- [ ] Mobile tested on real devices ✓
- [ ] Performance scores acceptable ✓
- [ ] Error monitoring active ✓
- [ ] Landing page accurate ✓
- [ ] Auth flow working ✓
- [ ] Tests passing locally ✓

---

### ☐ Launch (1 hour)

#### 12. Deploy to Production
```bash
# If using Railway:
railway up

# Verify deployment:
railway status
railway logs --tail

# Check live URL works
```

#### 13. Invite Beta Testers
Create list of 5-10 trusted artists:
- [ ] Send personalized invites
- [ ] Include:
  - What it is
  - Why you need their feedback
  - Link to sign up
  - Feedback form link

#### 14. Monitor First Users
Watch for first 24 hours:
- [ ] Sentry Dashboard (errors)
- [ ] Railway Logs (API calls)
- [ ] User feedback form responses

---

## 🎯 Success Criteria

Before inviting beta testers, ALL must be true:

### Core Functionality
- [x] All 4 modes (Ideas, Scout, Timeline, Pitch) work
- [ ] Scout returns 50 opportunities with filters
- [ ] Scout → Timeline integration works
- [ ] Pitch AI coaching generates suggestions
- [ ] Data persists across sessions

### Quality
- [ ] Zero critical bugs on mobile
- [ ] Lighthouse Performance > 85
- [ ] No console errors on production
- [ ] Error monitoring active

### Deployment
- [ ] Production URL accessible
- [ ] Database migration complete
- [ ] Auth working on production
- [ ] SSL certificate valid

---

## 🆘 Emergency Contacts

If something breaks:

**Database Issues**:
```bash
# Rollback last migration
supabase db reset
```

**Deployment Issues**:
```bash
# Rollback Railway deployment
railway rollback
```

**Code Issues**:
```bash
# Revert to last known good commit
git log --oneline
git revert <commit-hash>
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Sentry Docs**: https://docs.sentry.io

---

## ✅ Post-Launch (Week 1)

After first beta testers:
- [ ] Gather feedback from 10 users
- [ ] Fix top 3 reported bugs
- [ ] Add analytics events (Posthog/Mixpanel)
- [ ] Plan public launch improvements

---

**Current Status**: Database & migrations complete, Staging setup in progress  
**Next Step**: ☐ Verify staging deployment (15 min)  
**Time to Beta**: 1 day

**LET'S SHIP IT!** 🚀
