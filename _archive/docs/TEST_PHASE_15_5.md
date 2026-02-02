# Phase 15.5 Testing Guide

**Phase**: Connected Campaign Dashboard + EPK Analytics
**Status**: Foundation complete, ready for QA
**Prerequisites**: Database migration must be applied first

---

## Step 1: Apply Database Migration

Go to Supabase Dashboard → SQL Editor:
https://supabase.com/dashboard/project/ucncbighzqudaszewjrv/sql/new

**Copy and paste the entire migration file**:

Location: `supabase/migrations/20251123000000_create_campaign_dashboard.sql`

**Expected Result**: "Success. No rows returned"

---

## Step 2: Verify Migration Applied

Run this query in the same SQL Editor:

```sql
-- Check tables exist with RLS enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'campaign_dashboard_metrics',
    'epk_analytics'
  )
ORDER BY tablename;
```

**Expected Output**:
```
tablename                     | rls_enabled
------------------------------|------------
campaign_dashboard_metrics    | true
epk_analytics                 | true
```

---

## Step 3: Verify Helper Functions

```sql
-- Test calculate_engagement_score
SELECT calculate_engagement_score(100, 50, 25) as engagement_score;
-- Expected: ~67.50

-- Test aggregate_epk_metrics
SELECT * FROM aggregate_epk_metrics(
  'test-epk-id',
  NOW() - INTERVAL '7 days',
  NOW()
);
-- Expected: Returns row with zero counts (no data yet)
```

---

## Step 4: Verify Indexes Created

```sql
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('campaign_dashboard_metrics', 'epk_analytics')
ORDER BY tablename, indexname;
```

**Expected**: 11 indexes total
- 3 for `campaign_dashboard_metrics`
- 8 for `epk_analytics`

---

## Step 5: Run Audit Script (Code Validation)

**In your terminal:**

```bash
cd /Users/chrisschofield/workspace/active/totalaud.io

# Run audit
npx tsx apps/aud-web/scripts/audit-15-5.ts
```

**Expected Result**: ≥50/50 passing checks ✅

**Categories**:
- Database: 14 checks (tables, RLS, functions, indexes)
- API: 3 checks (endpoints return 200 or 401)
- Hooks: 12 checks (file structure, TypeScript, telemetry)
- Components: 17 checks (FlowCore design, British English, a11y)
- Accessibility: 9 checks (WCAG AA compliance)

**Note**: API checks may show 401 (unauthenticated) - this is correct behaviour

---

## Step 6: Manual Testing (Local Development)

### 6.1 Start Dev Server

```bash
cd /Users/chrisschofield/workspace/active/totalaud.io
pnpm dev
```

**Wait for**: "Ready in Xms" message
**Port**: Usually 3000-3004 (check terminal output)

---

### 6.2 Test API Endpoints

**Method 1**: Browser DevTools Console

Navigate to `http://localhost:3000` (or your port) and open browser console:

```javascript
// Test dashboard summary API (requires auth, expect 401)
fetch('/api/dashboard/summary?campaignId=test&period=7')
  .then(r => r.json())
  .then(console.log)

// Test EPK metrics API (requires auth, expect 401)
fetch('/api/epk/metrics?epkId=test-epk&groupBy=region')
  .then(r => r.json())
  .then(console.log)

// Test EPK track API (requires auth, expect 401)
fetch('/api/epk/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ epkId: 'test', eventType: 'view' })
})
  .then(r => r.json())
  .then(console.log)
```

**Expected**: All return 401 Unauthorized (correct - need authentication)

---

### 6.3 Test Components (If Integrated)

**If CampaignDashboardPanel is integrated into `/console` route:**

1. Navigate to `/console` (or `/dev/console`)
2. Look for right-dock panel (320px width)
3. Verify:
   - Panel renders with "campaign dashboard" header
   - Period toggle shows "7d" and "30d" buttons
   - Metric cards show placeholders (or zeros if no data)
   - "Open EPK Analytics" button present
4. **Accessibility**:
   - Tab through all buttons (should see focus outline)
   - Screen reader should announce button purposes
5. **Motion**:
   - Panel should fade in (240ms transition)
   - Tab switching should be smooth

**Period Toggle Test**:
1. Click "7d" button
   - Should highlight with slateCyan background
   - Text colour should change to matteBlack
2. Click "30d" button
   - Should highlight
   - "7d" should return to default state

---

### 6.4 Test EPK Analytics Drawer

**If drawer is integrated:**

1. Click "Open EPK Analytics" button
2. Verify:
   - Drawer slides in from right (480px width)
   - Backdrop appears behind drawer
   - Three tabs visible: "overview", "regions", "devices"
   - Overview tab selected by default
3. **Tab Switching**:
   - Click "regions" tab - content should switch with fade animation
   - Click "devices" tab - content should switch
   - Click "overview" tab - return to totals view
4. **Close Methods**:
   - Click backdrop - drawer should slide out
   - Press ⌘E (Mac) or Ctrl+E (Windows) - drawer should close
5. **Accessibility**:
   - Tab through all tabs (keyboard navigation)
   - Close button should have focus state
   - Screen reader should announce tab names

---

### 6.5 Test Real-time Updates (Advanced)

**If you have Supabase auth set up:**

1. Log in to the app
2. Open EPK Analytics drawer for a specific EPK
3. In another terminal, insert a test event:

```sql
-- In Supabase SQL Editor
INSERT INTO epk_analytics (epk_id, user_id, event_type, views, region, device)
VALUES (
  'your-epk-id-here',
  'your-user-id-here',
  'view',
  1,
  'United Kingdom',
  'mobile'
);
```

4. **Expected**: Drawer should update within ~2 seconds showing new event

---

## Step 7: Visual QA Checklist

### FlowCore Design Compliance

- [ ] Background: Matte Black (#0F1113)
- [ ] Accent: Slate Cyan (#3AA9BE) for active states
- [ ] Text: Lowercase UI copy ("campaign dashboard" not "Campaign Dashboard")
- [ ] Borders: Subtle grey (#FFFFFF14)
- [ ] Motion: 240ms transitions with ease curves
- [ ] Cards: Consistent padding and spacing

### British English Compliance

- [ ] All UI text uses British spelling
- [ ] "colour" not "color" (in user-visible text)
- [ ] "analytics" not "analyitics"
- [ ] Lowercase tone: "loading metrics..." not "Loading Metrics..."

### WCAG AA Compliance

- [ ] All text meets 4.5:1 contrast ratio
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works (Tab/Shift+Tab)
- [ ] Screen reader announces button labels
- [ ] Keyboard shortcuts documented (⌘E hint shown)

---

## Step 8: Error Handling Tests

### API Error States

**Test 1**: Missing campaignId
```javascript
fetch('/api/dashboard/summary?period=7')
  .then(r => r.json())
  .then(console.log)
// Expected: 400 Bad Request - "campaignId is required"
```

**Test 2**: Invalid period
```javascript
fetch('/api/dashboard/summary?campaignId=test&period=90')
  .then(r => r.json())
  .then(console.log)
// Expected: 400 Bad Request - "period must be 7 or 30"
```

**Test 3**: Invalid event type
```javascript
fetch('/api/epk/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ epkId: 'test', eventType: 'invalid' })
})
  .then(r => r.json())
  .then(console.log)
// Expected: 400 Bad Request - validation error
```

### Component Error States

**If useCampaignDashboard hook shows error:**
- [ ] Error message displays in panel
- [ ] Error text uses errorRed colour
- [ ] User can still interact with period toggle
- [ ] No console errors

**If useEPKAnalytics hook shows error:**
- [ ] Error message displays in drawer
- [ ] Drawer remains functional (can switch tabs, close)
- [ ] Error doesn't crash the app

---

## Step 9: Performance Checks

### Hook Revalidation

1. Open browser DevTools → Network tab
2. Load page with CampaignDashboardPanel
3. Observe:
   - Initial fetch to `/api/dashboard/summary`
   - After 30 seconds, automatic refetch
   - After another 30 seconds, another refetch
4. **Expected**: Regular 30-second revalidation interval

### Real-time Subscription

1. Open DevTools → Console
2. Load EPK Analytics drawer
3. Look for log: "Subscribing to EPK analytics real-time updates"
4. Close drawer
5. Look for log: "Unsubscribing from EPK analytics real-time updates"
6. **Expected**: Clean subscription/unsubscription lifecycle

---

## Step 10: Data Accuracy Tests

**If you have test data:**

### Campaign Dashboard Metrics

1. Create test metrics in database:

```sql
INSERT INTO campaign_dashboard_metrics (
  campaign_id, user_id, views, downloads, shares,
  engagement_score, period_start, period_end
) VALUES (
  'test-campaign-id',
  'your-user-id',
  450, 85, 23, 62.50,
  NOW() - INTERVAL '7 days',
  NOW()
);
```

2. Load dashboard panel for that campaign
3. Verify:
   - Views: 450
   - Downloads: 85
   - Shares: 23
   - Engagement: 62.5%

### EPK Analytics

1. Create test analytics events:

```sql
INSERT INTO epk_analytics (epk_id, user_id, event_type, views, downloads, region, device)
VALUES
  ('test-epk', 'your-user-id', 'view', 1, 0, 'United Kingdom', 'mobile'),
  ('test-epk', 'your-user-id', 'view', 1, 0, 'United Kingdom', 'desktop'),
  ('test-epk', 'your-user-id', 'download', 0, 1, 'United States', 'mobile'),
  ('test-epk', 'your-user-id', 'share', 0, 0, 'Germany', 'desktop');
```

2. Open EPK Analytics drawer for 'test-epk'
3. **Overview Tab**: Should show totals (2 views, 1 download, 1 share)
4. **Regions Tab**: Should show 3 regions (UK, US, Germany) with counts
5. **Devices Tab**: Should show 2 devices (mobile, desktop) with counts

---

## Troubleshooting

### "Module not found" errors

**Issue**: Import paths not resolving
**Fix**: Ensure you're in the correct directory:
```bash
cd /Users/chrisschofield/workspace/active/totalaud.io
pnpm install  # Reinstall dependencies
```

### "Table does not exist" errors

**Issue**: Migration not applied
**Fix**: Re-run Step 1 (apply migration in Supabase SQL Editor)

### API returns 404

**Issue**: Dev server not running or wrong port
**Fix**:
```bash
# Kill existing processes
pkill -f "pnpm dev"

# Restart
pnpm dev

# Check port in terminal output
```

### Drawer doesn't open

**Issue**: `onOpenEPKAnalytics` callback not wired
**Fix**: Check parent component integration - callback must be passed and drawer state managed

### No real-time updates

**Issue**: Supabase Realtime not enabled
**Fix**:
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for `epk_analytics` table
3. Restart dev server

---

## Acceptance Criteria Summary

| Requirement | Status |
|-------------|--------|
| Migration applies without errors | ⬜ |
| All 14 database checks pass | ⬜ |
| All 3 API endpoints functional | ⬜ |
| Hooks fetch and return typed data | ⬜ |
| Dashboard panel renders (320px) | ⬜ |
| EPK drawer renders (480px, 3 tabs) | ⬜ |
| FlowCore design tokens used | ⬜ |
| British English microcopy | ⬜ |
| WCAG AA compliance | ⬜ |
| Keyboard navigation works | ⬜ |
| Real-time updates working | ⬜ |
| Audit script ≥50/50 passing | ⬜ |

---

## Next Steps After Testing

1. ✅ Confirm all acceptance criteria met
2. ✅ Take screenshots of dashboard panel and drawer
3. ✅ Document any bugs found
4. ✅ Commit and push to feature branch:

```bash
git add .
git commit -m "feat(console): Phase 15.5 — Connected Campaign Dashboard + EPK Analytics foundation

- Database: 2 tables (campaign_dashboard_metrics, epk_analytics)
- API: 3 endpoints (summary, metrics, track)
- Hooks: useCampaignDashboard (30s revalidation), useEPKAnalytics (realtime)
- Components: CampaignDashboardPanel (320px), EPKAnalyticsDrawer (480px)
- FlowCore design, British English, WCAG AA compliant
- Audit: 55+ validation checks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/phase-15-5-campaign-analytics
```

5. ✅ Create pull request targeting `main`
6. ✅ Review and merge

---

**Phase 15.5 Status**: ✅ Code complete, ready for QA validation

Once all tests pass and migration is verified, Phase 15.5 is production-ready! 🎯
