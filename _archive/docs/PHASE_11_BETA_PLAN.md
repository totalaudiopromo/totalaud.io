# Phase 11: Beta Release Plan

**Created**: 3 December 2025
**Goal**: Deploy totalaud.io to production with all critical fixes

---

## Part A: Immediate Fixes (Before Deploy)

### A1. Fix CI Pipeline (30 mins)
- [ ] Update `totalaudio-ci.yml` to exclude index names from TAP table check
- [ ] The `scenes_` grep is matching `canvas_scenes` indexes, not TAP tables
- [ ] Merge PR #25 once CI passes

### A2. Critical Accessibility Fixes (4-6 hours)

#### Colour Contrast (WCAG AA - 4.5:1 minimum)
- [ ] Replace all `rgba(255,255,255,0.5)` → `rgba(255,255,255,0.75)`
- [ ] Replace all `rgba(255,255,255,0.6)` → `rgba(255,255,255,0.85)`
- [ ] Files to update:
  - `IdeasToolbar.tsx` (button text)
  - `IdeaCard.tsx` (card text)
  - `OpportunityCard.tsx` (description)
  - `ScoutToolbar.tsx` (filter labels)
  - `TimelineToolbar.tsx` (button labels)
  - `PitchToolbar.tsx` (button labels)
  - `LandingPage.tsx` (feature text)
  - `LoginForm.tsx` (subtitle, labels)

#### Viewport Zoom (5 mins)
- [ ] Remove `maximumScale: 1` from `layout.tsx`
- [ ] Replace with `maximumScale: 5` (allows pinch-to-zoom)

#### Touch Targets (2 hours)
- [ ] Increase delete button padding to 44x44px minimum
- [ ] Increase view toggle buttons to 44x44px
- [ ] Increase filter tab buttons to 44x44px
- [ ] Files: `IdeaCard.tsx`, `IdeasToolbar.tsx`, various toolbars

### A3. Mobile Canvas Panning (2 hours)
- [ ] Add two-finger touch panning to `IdeasCanvas.tsx`
- [ ] Current: Alt+drag (desktop only)
- [ ] Solution: Detect touch events, use two-finger gesture for pan

---

## Part B: Deployment to totalaud.io (2 hours)

### B1. Domain Setup
- [ ] Add custom domain in Railway: `totalaud.io`
- [ ] Configure DNS at registrar (Cloudflare/Namecheap)
- [ ] Add CNAME record pointing to Railway
- [ ] Wait for SSL certificate provisioning

### B2. Environment Variables
Railway needs these secrets:
```
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
NEXT_PUBLIC_APP_URL=https://totalaud.io
NODE_ENV=production
```

### B3. Update Supabase Auth
- [ ] Add `https://totalaud.io` to Supabase Auth redirect URLs
- [ ] Add `https://www.totalaud.io` to Supabase Auth redirect URLs

---

## Part C: Pricing Strategy Rethink

### Current Pricing Issues
- £12/month is too cheap for the value provided
- Doesn't cover AI costs (Anthropic API)
- Undervalues the product

### Recommended Pricing Options

#### Option 1: Value-Based Tiering
| Tier | Price | Features |
|------|-------|----------|
| **Starter** | Free | Ideas mode only, 10 ideas max |
| **Artist** | £29/month | All 4 modes, AI coaching (50 prompts/month) |
| **Pro** | £49/month | Unlimited AI, priority support, API access |

#### Option 2: Simple Premium
| Tier | Price | Features |
|------|-------|----------|
| **Free Trial** | 14 days | Full access |
| **Pro** | £39/month | Everything, unlimited |

#### Option 3: Annual Focus
| Tier | Price | Savings |
|------|-------|---------|
| **Monthly** | £39/month | - |
| **Annual** | £299/year | 36% off (£24.92/month) |

### Pricing Justification
- **AI Coach** alone is worth £20/month (Anthropic API costs ~£2-5/user)
- **Scout Mode** aggregates data worth £15-20/month separately
- **Timeline + Pitch** tools comparable to £15/month planning tools
- **Total comparable value**: £50-55/month

### Recommendation
**£39/month** or **£299/year** with 14-day free trial
- Covers AI costs with margin
- Positions as premium tool, not cheap SaaS
- Annual option improves cash flow and reduces churn

---

## Part D: High Priority Code Fixes (8 hours)

### D1. Error Boundaries (1 hour)
- [ ] Create `ErrorBoundary.tsx` component
- [ ] Wrap workspace layout
- [ ] Wrap console layout
- [ ] Add fallback UI with retry button

### D2. TypeScript Fixes (2 hours)
- [ ] Type `createZustandStore.ts` properly (remove `any`)
- [ ] Type `mapAsset` function with database row interface
- [ ] Fix remaining 5 `any` occurrences

### D3. Animation Duration Standardisation (1 hour)
- [ ] Replace all `duration-180` with `duration-[120ms]` or `duration-[240ms]`
- [ ] Update Tailwind config to remove `180` timing
- [ ] Files: Console components, UserMenu, MobileNav

### D4. ARIA & Keyboard Navigation (2 hours)
- [ ] Add `aria-label` to navigation
- [ ] Add `aria-expanded` to dropdowns
- [ ] Add Escape key handler to modals/menus
- [ ] Add keyboard navigation to mode tabs

---

## Part E: Polish (Nice to Have - 4 hours)

### E1. Shared Components
- [ ] Create reusable `<Button>` component
- [ ] Create reusable `<Modal>` component
- [ ] Create reusable `<Dropdown>` component

### E2. Loading States
- [ ] Add skeleton loaders to Ideas canvas
- [ ] Add skeleton loaders to Timeline
- [ ] Add ARIA live regions for loading announcements

### E3. Timeline Mobile Optimisation
- [ ] Reduce lane label width on mobile
- [ ] Make NextSteps accessible on mobile (drawer)
- [ ] Show footer hint on mobile

---

## Timeline Estimate

| Phase | Effort | Priority |
|-------|--------|----------|
| A1. Fix CI | 30 mins | Critical |
| A2. Accessibility | 4-6 hours | Critical |
| A3. Mobile Panning | 2 hours | High |
| B. Deployment | 2 hours | Critical |
| C. Pricing | 1 hour (decision) | High |
| D. Code Fixes | 8 hours | Medium |
| E. Polish | 4 hours | Low |

**Total**: ~20-24 hours of focused work

---

## Recommended Order

1. **Day 1 (Morning)**: Fix CI, deploy to totalaud.io
2. **Day 1 (Afternoon)**: Critical accessibility fixes (contrast, zoom, touch)
3. **Day 2**: Mobile panning, error boundaries, TypeScript fixes
4. **Day 3**: ARIA/keyboard navigation, animation standardisation
5. **Day 4**: Polish (shared components, loading states)
6. **Ongoing**: Pricing decision + Stripe integration

---

## Success Metrics

- [ ] CI pipeline green
- [ ] Site accessible at totalaud.io
- [ ] WCAG AA colour contrast passing
- [ ] Touch targets 44px+
- [ ] Pinch-to-zoom enabled
- [ ] Mobile canvas panning works
- [ ] Error boundaries prevent white screens
- [ ] Pricing updated in UI
