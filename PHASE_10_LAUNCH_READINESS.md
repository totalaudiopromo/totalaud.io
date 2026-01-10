# Phase 10: Launch Readiness - Invite-Only Beta Spec

**Date**: 2026-10-25
**Status**: 📋 Planning Phase
**Goal**: Prepare totalaud.io for invite-only beta launch with early artists

---

## 🎯 Overview

Transform the mystique landing page and experimental Console into a **production-ready invite-only beta** that:
1. Captures curiosity without explaining everything
2. Gates access with invite codes (FOMO + exclusivity)
3. Tracks user behaviour from landing → onboarding → usage
4. Generates social proof automatically (og:image cards, usage stats)
5. Enables controlled rollout to hand-picked artists

**Philosophy**: Mystique continues. The beta should feel like **being let into a secret**.

---

## 📋 Three Pillars

### Pillar 1: Invite System (Access Control)
### Pillar 2: Analytics Layer (Behaviour Tracking)
### Pillar 3: Social Proof Automation (Virality Engine)

---

## 🎫 Pillar 1: Invite System

### 1.1 **Invite Code Generation**

**Goal**: Create unique, time-limited invite codes for hand-picked artists

**Database**: `collaboration_invites` table (already exists from Stage 8)

**Extended Schema**:
```sql
ALTER TABLE collaboration_invites
ADD COLUMN invite_type TEXT DEFAULT 'campaign' CHECK (invite_type IN ('campaign', 'beta', 'waitlist'));

ALTER TABLE collaboration_invites
ADD COLUMN beta_metadata JSONB DEFAULT '{}';
```

**Beta metadata structure**:
```json
{
  "source": "twitter_dm" | "email_outreach" | "referral",
  "referred_by": "user_id or null",
  "artist_genre": "electronic" | "rock" | "hip-hop" | etc,
  "notes": "Personal note from you"
}
```

**API Route**: `/api/beta/create-invite`

**Request**:
```json
{
  "invited_email": "artist@example.com",
  "invite_type": "beta",
  "expires_in_hours": 72,
  "beta_metadata": {
    "source": "twitter_dm",
    "artist_genre": "electronic",
    "notes": "Mutual from BBC Radio promo days"
  }
}
```

**Response**:
```json
{
  "invite_code": "TOTALAUD-X7K9-2M4P",
  "invite_url": "https://totalaud.io/beta/TOTALAUD-X7K9-2M4P",
  "expires_at": "2026-10-28T19:00:00Z",
  "email_sent": true
}
```

---

### 1.2 **Beta Access Flow**

**Landing Page** (`/landing`)
↓
**"Request Access" clicked**
↓
**Invite Code Modal** (overlay)
```
┌─────────────────────────────────────┐
│  Enter your invite code             │
│  ▌                                   │
│                                      │
│  Don't have one?                     │
│  Join the waitlist →                 │
└─────────────────────────────────────┘
```
↓
**Code validated via `/api/beta/validate`**
↓
**Auto-creates user account** (Supabase Auth)
↓
**Redirects to onboarding** (`/?skip_onboarding=false`)

**Alternative path**: Invite URL direct access
```
https://totalaud.io/beta/TOTALAUD-X7K9-2M4P
```
Auto-fills code, skips modal.

---

### 1.3 **Waitlist System**

**For those without invite codes**

**API Route**: `/api/beta/waitlist`

**Request**:
```json
{
  "email": "artist@example.com",
  "name": "Artist Name",
  "genre": "electronic",
  "twitter_handle": "@artistname",
  "why_interested": "Short answer (optional)"
}
```

**Database**: `beta_waitlist` table

```sql
CREATE TABLE beta_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  genre TEXT,
  twitter_handle TEXT,
  why_interested TEXT,
  source TEXT, -- 'landing_page', 'twitter', 'referral'
  priority_score INT DEFAULT 0, -- Manual scoring for who gets invites first
  invited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Waitlist confirmation**:
- Email: "You're on the list. We'll let you know when it's your turn."
- Auto-follow-up: Weekly "Still cooking..." updates with product teasers

---

### 1.4 **Invite Code UI Components**

**Component**: `InviteCodeModal.tsx`

**Features**:
- Overlays landing page (no redirect)
- Single input field: `TOTALAUD-XXXX-XXXX`
- Real-time validation (debounced 500ms)
- Error states:
  - "Invalid code"
  - "Expired code"
  - "Already used"
- Success → Auto-creates account + redirects to Console

**Component**: `WaitlistForm.tsx`

**Features**:
- Minimal 4-field form (email, name, genre, twitter)
- Optional "why interested" textarea
- Success toast: "You're on the list"
- No confirmation page (keeps mystique)

---

## 📊 Pillar 2: Analytics Layer

### 2.1 **Landing Page Analytics**

**Events to track**:

| Event | Trigger | Data |
|-------|---------|------|
| `landing_view` | Page load | referrer, device |
| `scroll_milestone_reveal1` | 20% scroll | timestamp |
| `scroll_milestone_reveal2` | 35% scroll | timestamp |
| `scroll_milestone_reveal3` | 50% scroll | timestamp |
| `scroll_milestone_proof` | 65% scroll | timestamp |
| `cta_button_click` | "Request Access" clicked | time_on_page |
| `sound_toggle` | ⌘M pressed | is_muted |

**Implementation Options**:

**Option A: Supabase (Privacy-first)**
```typescript
// apps/aud-web/src/lib/analytics.ts
import { getSupabaseClient } from '@/lib/supabaseClient'

export async function trackEvent(
  event: string,
  data?: Record<string, any>
) {
  const supabase = getSupabaseClient()

  await supabase.from('analytics_events').insert({
    event_name: event,
    event_data: data,
    page_url: window.location.href,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  })
}
```

**Option B: Vercel Analytics (Simpler)**
```typescript
import { track } from '@vercel/analytics'

track('scroll_milestone_reveal1', {
  timestamp: Date.now(),
})
```

**Option C: PostHog (Most features)**
```typescript
import posthog from 'posthog-js'

posthog.capture('scroll_milestone_reveal1', {
  scroll_depth: 0.2,
  time_on_page: 12.5,
})
```

**Recommendation**: **Supabase** for privacy + full control

**Database**:
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
```

---

### 2.2 **Console Usage Analytics**

**Events to track**:

| Event | Trigger | Data |
|-------|---------|------|
| `console_session_start` | Console loaded | theme_selected |
| `mission_card_clicked` | Mission Stack interaction | mode (plan/do/track/learn) |
| `flow_node_created` | Flow Studio action | node_type |
| `agent_spawned` | Agent creation | agent_role |
| `command_palette_opened` | ⌘K pressed | - |
| `console_session_end` | Page unload | duration, actions_taken |

**Dashboard Query Examples**:
```sql
-- Most popular theme
SELECT theme_selected, COUNT(*) as users
FROM analytics_events
WHERE event_name = 'console_session_start'
GROUP BY theme_selected
ORDER BY users DESC;

-- Average session duration
SELECT AVG((event_data->>'duration')::int) as avg_duration
FROM analytics_events
WHERE event_name = 'console_session_end';

-- Drop-off funnel
SELECT
  COUNT(CASE WHEN event_name = 'landing_view' THEN 1 END) as landed,
  COUNT(CASE WHEN event_name = 'cta_button_click' THEN 1 END) as clicked_cta,
  COUNT(CASE WHEN event_name = 'console_session_start' THEN 1 END) as reached_console
FROM analytics_events;
```

---

### 2.3 **Admin Dashboard** (Internal Tool)

**Route**: `/admin/analytics` (RLS: Only your user_id)

**Widgets**:
1. **Total Beta Signups** (line chart, 7/30/90 days)
2. **Scroll Depth Heatmap** (where people drop off)
3. **Invite Code Usage** (how many codes active/expired/used)
4. **Waitlist Size** (with priority scoring)
5. **Top Referrers** (Twitter, email, direct)
6. **Session Duration** (avg time in Console)
7. **Theme Popularity** (ASCII vs XP vs Aqua vs DAW vs Analogue)

**Tech**: Next.js + Recharts + Supabase queries

---

## 🎨 Pillar 3: Social Proof Automation

### 3.1 **Dynamic OG Image Generation**

**Goal**: Auto-generate social card images for sharing

**Route**: `/api/og/landing`

**Uses**: Vercel OG Image (built-in Next.js)

**Design**:
```
┌─────────────────────────────────────────┐
│                                         │
│         totalaud.io                     │  (Slate Cyan)
│                                         │
│   Creative control for artists.        │  (White)
│                                         │
│                                         │
│   BUILT BY THE TEAM BEHIND              │  (Grey, small)
│   TOTAL AUDIO PROMO                     │
│                                         │
└─────────────────────────────────────────┘
```

**Implementation**:
```typescript
// apps/aud-web/src/app/api/og/landing/route.tsx
import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F1113',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
        }}
      >
        <h1 style={{ color: '#3AA9BE', fontSize: 120 }}>totalaud.io</h1>
        <p style={{ color: '#E5E7EB', fontSize: 48 }}>Creative control for artists.</p>
        <p style={{ color: '#6B7280', fontSize: 24, marginTop: 60 }}>
          BUILT BY THE TEAM BEHIND TOTAL AUDIO PROMO
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

**Meta tags** (in `landing/page.tsx`):
```typescript
export const metadata: Metadata = {
  title: 'totalaud.io - Creative control for artists',
  description: 'The creative workspace built from real promotion work. Now in private beta.',
  openGraph: {
    title: 'totalaud.io',
    description: 'Creative control for artists.',
    images: ['/api/og/landing'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'totalaud.io',
    description: 'Creative control for artists.',
    images: ['/api/og/landing'],
  },
}
```

---

### 3.2 **Usage Stats (Public Teasers)**

**Goal**: Show activity without revealing details (mystique maintained)

**Example Stats** (on landing page or Twitter):
- "47 artists in beta"
- "1,204 radio contacts enriched this week"
- "89% open rate on BBC Radio pitches"

**Implementation**:
```sql
-- Total beta users
SELECT COUNT(*) FROM auth.users WHERE created_at > '2026-10-25';

-- Contacts enriched (from Audio Intel usage)
SELECT SUM(contacts_processed) FROM enrichment_jobs;

-- Open rates (from campaign metrics)
SELECT AVG(open_rate) FROM campaign_metrics WHERE campaign_type = 'radio';
```

**Display Location**: Footer of landing page (rotates every 10s)

---

### 3.3 **Invite Referral System**

**Goal**: Existing beta users can invite friends (viral growth)

**Each user gets**:
- 3 invite codes to share
- Codes track who invited whom
- Leaderboard: "Top Inviters" (gamification)

**Database**:
```sql
ALTER TABLE auth.users
ADD COLUMN invite_codes_remaining INT DEFAULT 3;

ALTER TABLE collaboration_invites
ADD COLUMN referred_by UUID REFERENCES auth.users(id);
```

**UI**: Console → Profile → "Invite Friends" button

---

## 📅 Implementation Timeline

### Week 1: Invite System (Critical Path)
- [ ] Create `beta_waitlist` table
- [ ] Build `InviteCodeModal` component
- [ ] Build `/api/beta/create-invite` route
- [ ] Build `/api/beta/validate` route
- [ ] Test invite flow end-to-end
- [ ] Wire up "Request Access" CTA

### Week 2: Analytics Layer
- [ ] Create `analytics_events` table
- [ ] Implement `trackEvent()` utility
- [ ] Add tracking to landing page (7 events)
- [ ] Add tracking to Console (6 events)
- [ ] Build `/admin/analytics` dashboard

### Week 3: Social Proof
- [ ] Generate OG image route (`/api/og/landing`)
- [ ] Add meta tags to landing page
- [ ] Build usage stats query
- [ ] Add rotating stats to footer
- [ ] Test social sharing (Twitter, LinkedIn)

### Week 4: Polish + Launch
- [ ] Manual QA (invite flow, analytics, social cards)
- [ ] Generate 10 beta invite codes for friends
- [ ] Soft launch: Tweet + email to waitlist
- [ ] Monitor analytics dashboard daily
- [ ] Iterate based on user feedback

---

## ✅ Launch Checklist

**Before going live**:

- [ ] Database migrations applied (waitlist, analytics)
- [ ] Invite system tested (create, validate, redeem)
- [ ] Waitlist form working (email capture)
- [ ] Analytics tracking all 13 events
- [ ] OG image generating correctly
- [ ] Admin dashboard accessible (RLS enforced)
- [ ] 10 initial invite codes generated
- [ ] Email templates ready (invite sent, waitlist confirmation)
- [ ] Error handling (expired codes, invalid codes)
- [ ] Rate limiting on `/api/beta/*` routes (10 req/min)

---

## 🎯 Success Metrics (First 30 Days)

| Metric | Target | Stretch Goal |
|--------|--------|--------------|
| **Waitlist signups** | 100 | 250 |
| **Beta users** | 25 | 50 |
| **Avg scroll depth** | 50% | 70% |
| **CTA click rate** | 15% | 25% |
| **Console session > 5min** | 60% | 80% |
| **Social shares** | 20 | 50 |
| **Referral invites sent** | 10 | 30 |

---

## 📁 Files to Create

**New Routes** (6 files):
1. `/apps/aud-web/src/app/api/beta/create-invite/route.ts`
2. `/apps/aud-web/src/app/api/beta/validate/route.ts`
3. `/apps/aud-web/src/app/api/beta/waitlist/route.ts`
4. `/apps/aud-web/src/app/api/og/landing/route.tsx`
5. `/apps/aud-web/src/app/beta/[code]/page.tsx`
6. `/apps/aud-web/src/app/admin/analytics/page.tsx`

**New Components** (3 files):
1. `/apps/aud-web/src/components/ui/InviteCodeModal.tsx`
2. `/apps/aud-web/src/components/ui/WaitlistForm.tsx`
3. `/apps/aud-web/src/components/admin/AnalyticsDashboard.tsx`

**New Utilities** (2 files):
1. `/apps/aud-web/src/lib/analytics.ts`
2. `/apps/aud-web/src/lib/inviteCodes.ts`

**Database Migrations** (2 files):
1. `/supabase/migrations/20261026000000_add_beta_system.sql`
2. `/supabase/migrations/20261026000001_add_analytics_events.sql`

---

## 💡 Optional Enhancements

**Nice-to-haves** (post-launch):

1. **Email Automation**:
   - Welcome email on beta acceptance
   - Weekly digest: "Your Console activity this week"
   - Invite reminder: "You have 3 invites remaining"

2. **Invite Leaderboard** (gamification):
   - Public page: `/beta/leaderboard`
   - Shows top inviters (anonymous or opt-in)
   - Rewards: Early access to new features

3. **Beta Feedback Loop**:
   - In-app feedback widget (Cmd+Shift+F)
   - Direct Slack/Discord integration
   - Quick surveys after key actions

4. **Social Proof Widgets**:
   - Live activity feed: "Artist in London just enriched 12 contacts"
   - Anonymous usage stats (no PII)
   - Rotating testimonials

---

## 🚀 Launch Strategy

**Soft Launch** (Week 1):
- 10 hand-picked invites to friends/trusted artists
- Private Twitter thread (followers only)
- Monitor analytics + gather feedback
- Fix critical bugs

**Public Announcement** (Week 2-3):
- Public Twitter/LinkedIn post
- Product Hunt launch (optional)
- Email to Total Audio Promo mailing list
- Reddit: /r/WeAreTheMusicMakers (if relevant)

**Controlled Expansion** (Week 4+):
- Open waitlist signups to everyone
- Give beta users 3 invite codes each (viral loop)
- Weekly invite batches (25-50 users/week)
- Monitor server load + user feedback

---

## 📊 What Good Looks Like

**After 30 days**:
- 50+ beta users actively using Console
- 200+ on waitlist (engaged, excited)
- 70% of users return within 7 days
- 20+ social shares (screenshots, tweets)
- 5+ unsolicited testimonials
- Clear product-market fit signals

**Red Flags** (pivot signals):
- <10% CTA click rate (landing page not working)
- >60% bounce rate (confused visitors)
- <30s avg time on landing page (not engaging)
- <2 min avg Console session (not sticky)
- No organic social shares (not shareable)

---

**Last Updated**: 2026-10-25
**Owner**: Chris Schofield
**Timeline**: 4 weeks to launch-ready beta
**Next**: Apply database migrations + build invite system
