# Stage 8 Phase 3: Database Migration & Testing Guide

**Date**: 2025-10-25
**Status**: Ready to Apply
**Purpose**: Make Phase 3 (Presence & Collaboration) fully functional

---

## ✅ What's Already Complete

**Code Changes** (100% done):
- ✅ PresenceAvatars component ([apps/aud-web/src/components/ui/PresenceAvatars.tsx](apps/aud-web/src/components/ui/PresenceAvatars.tsx))
- ✅ ShareCampaignModal component ([apps/aud-web/src/components/ui/ShareCampaignModal.tsx](apps/aud-web/src/components/ui/ShareCampaignModal.tsx))
- ✅ Invite creation API ([apps/aud-web/src/app/api/collaboration/invite/route.ts](apps/aud-web/src/app/api/collaboration/invite/route.ts))
- ✅ Invite acceptance API ([apps/aud-web/src/app/api/collaboration/accept/route.ts](apps/aud-web/src/app/api/collaboration/accept/route.ts))
- ✅ ConsoleLayout integration with real Supabase auth
- ✅ usePresence hook ([apps/aud-web/src/hooks/usePresence.ts](apps/aud-web/src/hooks/usePresence.ts))

**Visual Verification** (all tested):
- ✅ All buttons using Slate Cyan (#3AA9BE)
- ✅ Hover states working correctly
- ✅ Modal animations smooth (≤150ms)
- ✅ Avatar stacking and scaling

---

## 🗄️ Step 1: Apply Database Migration

### Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Environment Variables**: Ensure these are set in `apps/aud-web/.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Migration Instructions

**Option A: Via Supabase Dashboard (Recommended)**

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of:
   ```
   supabase/migrations/20251024120000_add_collaboration_tables.sql
   ```
5. Paste into the SQL editor
6. Click **"Run"** (or press ⌘/Ctrl + Enter)
7. Verify success message: "Success. No rows returned"

**Option B: Via Supabase CLI**

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the migration directly
supabase db execute --file supabase/migrations/20251024120000_add_collaboration_tables.sql
```

### What the Migration Creates

**3 New Tables**:
1. `user_prefs` - Personal settings (theme, comfort, calm, sound, tone)
2. `campaign_collaborators` - Who has access to which campaigns
3. `collaboration_invites` - Temporary 24h invite tokens

**Row Level Security (RLS)**:
- Users can only see their own preferences
- Users can only see campaigns they have access to
- Only campaign owners can invite collaborators
- Viewers have read-only access

**Triggers**:
- Auto-creates owner role when campaign is created
- Auto-updates `updated_at` on user_prefs changes

**Functions**:
- `cleanup_expired_invites()` - Removes old invite tokens

---

## 👤 Step 2: Create Test User & Campaign

You need at least one authenticated user and one campaign to test collaboration.

### Option 1: Create via Supabase Dashboard

1. **Create User**:
   - Go to **Authentication** → **Users**
   - Click **"Add user"** → **"Create new user"**
   - Enter email (e.g., `test@example.com`)
   - Set password
   - Click **"Create user"**

2. **Create Campaign** (via SQL Editor):
   ```sql
   -- Replace USER_ID with actual user ID from auth.users table
   INSERT INTO campaigns (user_id, title, goal_total)
   VALUES ('USER_ID', 'Test Campaign', 100);
   ```

3. **Verify Campaign Owner Created**:
   ```sql
   -- Check campaign_collaborators was auto-created
   SELECT * FROM campaign_collaborators;
   ```

### Option 2: Sign Up via App

1. Start dev server:
   ```bash
   cd apps/aud-web
   pnpm dev
   ```

2. Navigate to auth page (if you have one)
3. Sign up with email/password
4. Create a campaign via the app

---

## 🧪 Step 3: Test Multi-User Presence

### Test Scenario 1: Solo Presence

1. **Start dev server**:
   ```bash
   cd apps/aud-web
   pnpm dev
   ```

2. **Log in** to the app (you should see your user authenticated)

3. **Navigate to `/console`**

4. **Check header** - You should see:
   - Your presence avatar (with initials)
   - Green "Live" indicator
   - Share button

5. **Verify console logs**:
   ```
   Check browser console for:
   - "Connected to presence channel"
   - No errors from collaboration_invites query
   ```

### Test Scenario 2: Multi-User Presence (2 Browser Tabs)

**Prerequisites**: Two Supabase users created

**Steps**:

1. **Tab 1**: Log in as User A
   - Navigate to `/console`
   - You should see 1 avatar (yours)
   - Green "Live" indicator

2. **Tab 2**: Open incognito/private window
   - Log in as User B
   - Navigate to **same campaign** (important!)
   - You should see 1 avatar (User B's)

3. **Back to Tab 1**:
   - Refresh or wait 2-3 seconds
   - You should now see **2 avatars** (User A + User B)
   - Both with green active dots

4. **Hover over avatars**:
   - Should show name, theme, mode
   - Avatar should scale on hover

5. **Close Tab 2** (User B)
   - Wait 5-10 seconds
   - User B's avatar should fade out from Tab 1

**Expected Behaviour**:
- Avatars appear/disappear in <250ms
- Max 5 visible, "+N more" if > 5 users
- Each avatar has theme-coloured border
- Smooth fade/scale animations

---

## 🔄 Step 4: Test Collaboration Invite Flow

### Invite a Collaborator

1. **As Campaign Owner**:
   - Click **"Share"** button in header
   - Modal opens

2. **Fill out invite form**:
   - Email: `collaborator@example.com`
   - Role: Editor or Viewer
   - Click **"Invite"**

3. **Verify invite created**:
   - Success toast: "Invite sent to collaborator@example.com"
   - Invite URL appears below form
   - Copy invite link

4. **Check database**:
   ```sql
   SELECT * FROM collaboration_invites
   WHERE invited_email = 'collaborator@example.com';
   ```

### Accept an Invite

**Option A: Via API** (for testing)

```bash
# Get invite token from database or invite URL
curl -X POST http://localhost:3000/api/collaboration/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"invite_token": "YOUR_INVITE_TOKEN"}'
```

**Option B: Via App UI** (future feature)

Create an `/console/invite/[token]` page that:
1. Extracts token from URL
2. Calls `/api/collaboration/accept`
3. Redirects to campaign

### Verify Collaborator Added

```sql
-- Check campaign_collaborators table
SELECT cc.*, u.email
FROM campaign_collaborators cc
JOIN auth.users u ON u.id = cc.user_id
WHERE cc.campaign_id = 'YOUR_CAMPAIGN_ID';
```

Expected: 2 rows (owner + invited collaborator)

---

## 🐛 Troubleshooting

### Issue: "Failed to load collaborators" toast

**Cause**: Database migration not applied

**Solution**:
1. Check if tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('user_prefs', 'campaign_collaborators', 'collaboration_invites');
   ```
2. If empty, re-run migration

### Issue: No avatars showing

**Possible causes**:
1. **Not authenticated**: Check `supabase.auth.getUser()` returns user
2. **No campaign**: User must have at least one campaign
3. **Wrong campaign_id**: Verify presence channel uses correct campaign ID

**Debug**:
```javascript
// In browser console
const { data } = await supabase.auth.getUser()
console.log('Current user:', data.user)

const { data: campaigns } = await supabase.from('campaigns').select('*')
console.log('User campaigns:', campaigns)
```

### Issue: "Multiple GoTrueClient instances" warning

**Cause**: Multiple Supabase client instances created

**Solution**: Ensure you're using singleton from `getSupabaseClient()`

**Not a blocker**: App will still work, just a warning

### Issue: Presence not syncing between tabs

**Possible causes**:
1. **Different campaigns**: Both tabs must open same campaign
2. **Supabase Realtime not enabled**: Check project settings
3. **RLS blocking**: Check policies allow campaign access

**Debug**:
```sql
-- Check if Realtime is enabled for campaigns table
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

---

## ✅ Success Checklist

**Phase 3 is fully functional when**:

- [ ] Migration applied (3 tables exist)
- [ ] Test user created and authenticated
- [ ] Test campaign created (with owner role auto-created)
- [ ] Solo presence working (avatar + "Live" indicator)
- [ ] Multi-user presence working (2+ avatars visible)
- [ ] Share modal opens without errors
- [ ] Invite creation works (success toast)
- [ ] Collaborators list shows current users
- [ ] Invite acceptance adds collaborator
- [ ] No console errors related to collaboration tables

---

## 📊 Current Status

| Task | Status |
|------|--------|
| Database migration ready | ✅ Ready to apply |
| Code changes complete | ✅ Done |
| Real auth integrated | ✅ Done |
| Invite API created | ✅ Done |
| Accept API created | ✅ Done |
| Migration applied | ⏳ Waiting for you |
| Multi-user testing | ⏳ After migration |

---

## 🚀 Next Steps (After Testing)

**Phase 4: User Preferences Sync**
- Extend `useUserPrefs` hook for database persistence
- Auto-apply preferences on login
- Sync theme/comfort/calm/sound/tone settings

**Phase 5: Visual Accents**
- Collaborator-coloured activity stream events
- Shared Calm Mode visual feedback
- Action glow effects on avatars

**Phase 6: Audio Cues** (optional)
- Join/leave sounds
- Action notification sounds
- Respects user `sound_muted` preference

---

**Questions or issues?** Check:
1. Supabase project logs (Dashboard → Logs)
2. Browser console (F12 → Console)
3. Network tab (F12 → Network → Filter: "collaboration")

**Last Updated**: 2025-10-25
