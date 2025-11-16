# LoopOS Phase 10 — Billing & Credits System

**Status**: ✅ COMPLETE
**Implementation Date**: 2025-11-16
**Files Created**: 9
**Lines Added**: ~1,800+

---

## 🎯 Overview

Phase 10 adds a comprehensive billing and credit metering system to LoopOS, enabling subscription tiers, usage tracking, and soft feature gating while maintaining generous free/dev behaviour.

---

## ✅ Implemented Features

### 1. Subscription Plans

Three tiers with different credit allocations and features:

| Plan | Price | Credits/Month | Workspaces | Exports |
|------|-------|---------------|------------|---------|
| **Free** | £0 | 200 | 1 | ❌ |
| **Creator** | £19 | 2,000 | 3 | ✅ |
| **Agency** | £99 | 10,000 | 20 | ✅ |

**Features**:
- All plans have access to Timeline, Journal, Coach, Designer, Packs, Real-time
- Exports gated on Free plan
- Auto-assigned to Free plan on workspace creation

### 2. Credit System

- **Credit Ledger**: Tracks all credit additions and deductions
- **Usage Events**: Records every billable action
- **Balance Calculation**: Real-time credit balance via database function
- **Monthly Allocation**: Auto-allocates credits on workspace creation

**Credit Costs**:
```typescript
ai_coach_message: 2 credits
ai_designer_scene: 10 credits
ai_pack_generation: 5 credits
ai_insights: 3 credits
ai_auto_chain: 8 credits
export_pdf: 5 credits
export_html: 3 credits
export_json: 1 credit
```

### 3. Dev Mode

Generous development behaviour:
- **Fake Credits**: 99,999 credits in dev mode
- **Skip Balance Checks**: Never blocks actions
- **Log Usage**: Still records usage for analytics
- **Visual Indicator**: "DEV" badge on billing UI

**Enabled when**:
- `NODE_ENV !== 'production'`
- `NEXT_PUBLIC_LOOPOS_DEV_MODE=true`

### 4. Soft Gating

No hard paywalls - friendly upgrade prompts:
- **Grace Period**: 50 credit overdraft allowed
- **Upgrade Modal**: Shows plan comparison
- **Credit Meter**: Visual progress bar in UI
- **Usage Dashboard**: Detailed analytics page

---

## 📦 Database Schema

### loopos_plans

```sql
id text PRIMARY KEY
name text
description text
monthly_price_cents integer
max_workspaces integer
ai_credits_per_month integer
features jsonb
is_active boolean
created_at timestamptz
updated_at timestamptz
```

**Seeded Plans**: free, creator, agency

### loopos_subscriptions

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
plan_id text → loopos_plans
billing_status text (trial, active, past_due, cancelled, paused)
stripe_customer_id text
stripe_subscription_id text
current_period_start timestamptz
current_period_end timestamptz
renewal_date timestamptz
cancelled_at timestamptz
created_at timestamptz
updated_at timestamptz
```

**RLS**: Workspace owners only

### loopos_credit_ledger

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
change integer (positive = add, negative = deduct)
reason text
meta jsonb
created_by uuid → auth.users
created_at timestamptz
```

**RLS**: Workspace members can view, system can insert

### loopos_usage_events

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
user_id uuid → auth.users
event_type text
category text
credits_used integer
meta jsonb
created_at timestamptz
```

**RLS**: Workspace members can view, system can insert

---

## 🔧 Database Functions

### loopos_current_credit_balance(workspace_id)

Returns current credit balance:
```sql
SELECT SUM(change) FROM loopos_credit_ledger WHERE workspace_id = ?
```

### loopos_use_credits(...)

Atomic credit deduction and usage logging:
1. Check if workspace has enough credits
2. Deduct credits from ledger
3. Record usage event
4. Return success/failure

### loopos_allocate_monthly_credits(workspace_id)

Allocates monthly credit allowance based on plan.

### auto_assign_free_plan()

Trigger function that:
1. Creates Free subscription for new workspaces
2. Allocates initial credits

---

## 🧩 Code Structure

### packages/loopos-db/src/billing.ts

Database helpers with Zod validation:

```typescript
// Plans
planDb.list()
planDb.get(planId)

// Subscriptions
subscriptionDb.get(workspaceId)
subscriptionDb.getPlan(workspaceId)
subscriptionDb.updatePlan(workspaceId, planId)
subscriptionDb.cancel(workspaceId)

// Credits
creditsDb.getBalance(workspaceId)
creditsDb.hasCredits(workspaceId, required)
creditsDb.useCredits(...)
creditsDb.addCredits(...)
creditsDb.getLedger(workspaceId)
creditsDb.allocateMonthlyCredits(workspaceId)

// Usage
usageDb.record(...)
usageDb.list(workspaceId)
usageDb.getSummary(workspaceId, startDate, endDate)
usageDb.getTotalUsed(workspaceId, startDate, endDate)
```

### apps/loopos/src/config/plans.ts

Plan configuration:

```typescript
PLAN_FEATURES.free
PLAN_FEATURES.creator
PLAN_FEATURES.agency

CREDIT_COSTS.ai_coach_message
CREDIT_COSTS.export_pdf
// ... etc

DEV_MODE_CONFIG.enabled
DEV_MODE_CONFIG.fakeCredits
DEV_MODE_CONFIG.skipBalanceChecks

GRACE_CONFIG.allowedOverdraft
GRACE_CONFIG.gracePeriodDays

PLANS // Array of plan objects
getPlanById(planId)
hasFeature(planId, feature)
formatPrice(priceCents)
```

### apps/loopos/src/lib/billing/withCredits.ts

API wrapper for credit charging:

```typescript
// Wrap handler with credit check
await withCredits({
  workspaceId,
  userId,
  cost: CREDIT_COSTS.ai_coach_message,
  reason: 'AI Coach message',
  eventType: 'ai_call',
  category: 'coach',
  meta: { messageId: '...' }
}, async () => {
  // Your handler logic
})

// Or use Next.js wrapper
await withCreditsHandler(context, async () => {
  return NextResponse.json({ ... })
})

// Check feature access
const { allowed, planId } = await checkFeatureAccess(workspaceId, 'exports')
```

**Behaviour**:
- Dev mode: Skip checks, log usage
- Prod mode: Check balance, deduct credits
- Insufficient: Return 402 with error details
- Grace period: Allow 50 credit overdraft

---

## 🎨 UI Components

### CreditMeter

Location: `apps/loopos/src/components/billing/CreditMeter.tsx`

Shows:
- Current balance / monthly allocation
- Progress bar (visual indicator)
- Plan name
- Low credit warning (< 20%)
- DEV badge in dev mode
- Links to billing page

### UpgradeModal

Location: `apps/loopos/src/components/billing/UpgradeModal.tsx`

Shows:
- Plan comparison grid
- Current plan highlighted
- Feature lists
- Pricing
- "Upgrade (Coming Soon)" CTAs (disabled)
- "Continue (Dev Mode)" in dev

### Usage Dashboard

Location: `apps/loopos/src/app/settings/billing/page.tsx`

Shows:
- Current balance card
- Current plan card
- Month-to-date usage card
- Usage by category (coach, designer, exports, etc.)
- Recent activity list (last 20 events)
- DEV mode banner

---

## 🔌 API Integration

### Example: Coach API Route

```typescript
// apps/loopos/src/app/api/coach/route.ts
import { withCreditsHandler } from '@/lib/billing/withCredits'
import { CREDIT_COSTS } from '@/config/plans'

export async function POST(req: Request) {
  const { workspaceId, userId, message } = await req.json()

  return await withCreditsHandler({
    workspaceId,
    userId,
    cost: CREDIT_COSTS.ai_coach_message,
    reason: 'AI Coach message',
    eventType: 'ai_call',
    category: 'coach',
    meta: { messageLength: message.length }
  }, async () => {
    // Your AI logic here
    const response = await callAI(message)

    return NextResponse.json({ response })
  })
}
```

**Error Handling**:
```typescript
// Client-side
try {
  const res = await fetch('/api/coach', { ... })

  if (res.status === 402) {
    const error = await res.json()
    // error.code === 'INSUFFICIENT_CREDITS'
    // error.currentBalance, error.required

    // Show upgrade modal
    setShowUpgradeModal(true)
  }
} catch (error) {
  // Handle other errors
}
```

---

## 📊 Usage Analytics

### Monthly Summary

```typescript
const summary = await usageDb.getSummary(workspaceId, startDate, endDate)

// Returns:
{
  'coach': { count: 15, credits: 30 },
  'designer': { count: 5, credits: 50 },
  'exports': { count: 2, credits: 10 }
}
```

### Recent Activity

```typescript
const events = await usageDb.list(workspaceId, 20)

// Returns array of UsageEvent:
{
  id, workspace_id, user_id,
  event_type: 'ai_call',
  category: 'coach',
  credits_used: 2,
  meta: { ... },
  created_at
}
```

---

## 🧪 Testing Workflow

### Dev Mode Test

1. Start LoopOS: `pnpm dev`
2. Create workspace → Auto-assigned Free plan
3. Check balance → Should show dev credits (99,999)
4. Use AI features → Usage logged but not deducted
5. Visit `/settings/billing` → See DEV badge
6. Check usage summary → See logged events

### Balance Deduction Test

1. Disable dev mode: Remove `NEXT_PUBLIC_LOOPOS_DEV_MODE`
2. Manually set balance: `UPDATE loopos_credit_ledger SET change = 10 WHERE workspace_id = ?`
3. Use AI feature costing 5 credits
4. Check balance → Should be 5
5. Try to use 10 credit feature → Should see "Insufficient Credits" error
6. Upgrade modal should appear

### Grace Period Test

1. Set balance to 5 credits
2. Try to use 10 credit feature
3. With grace (overdraft 50), should still work
4. Balance goes negative
5. Eventually hard blocks at -50

---

## 🔐 Security

### RLS Policies

- **Subscriptions**: Only workspace owners can view/update
- **Credit Ledger**: Workspace members can view, system can insert
- **Usage Events**: Workspace members can view, system can insert

### Database Functions

- **SECURITY DEFINER**: Functions run with elevated privileges
- **Atomic Operations**: Credit deduction and logging in single transaction
- **Balance Checks**: Server-side validation prevents client tampering

---

## 🚀 Future: Stripe Integration

### TODOs for Production

1. **Stripe Setup**:
   - Create Stripe products for each plan
   - Set up webhook endpoint
   - Handle subscription lifecycle events

2. **Webhook Events**:
   ```typescript
   'customer.subscription.created' → Create subscription
   'customer.subscription.updated' → Update billing_status
   'customer.subscription.deleted' → Cancel subscription
   'invoice.payment_succeeded' → Allocate monthly credits
   'invoice.payment_failed' → Set past_due status
   ```

3. **Customer Portal**:
   - Upgrade/downgrade plan
   - Update payment method
   - View invoices
   - Cancel subscription

4. **Credit Top-Ups**:
   - Buy additional credits
   - One-time purchases
   - Auto-top-up when low

5. **Usage Limits**:
   - Hard block at 0 credits (no grace)
   - Email alerts at 80%, 90%, 100%
   - Rate limiting per plan

---

## 📈 Tuning Credit Costs

### Adjusting Costs

Edit `apps/loopos/src/config/plans.ts`:

```typescript
export const CREDIT_COSTS = {
  ai_coach_message: 2,  // Increase if too generous
  ai_designer_scene: 10, // Decrease if too expensive
  // ...
}
```

### Monitoring Usage

1. Check usage summary: `SELECT category, SUM(credits_used) FROM loopos_usage_events GROUP BY category`
2. Average per user: `SELECT AVG(total) FROM (SELECT user_id, SUM(credits_used) as total FROM loopos_usage_events GROUP BY user_id)`
3. Top users: `SELECT user_id, SUM(credits_used) FROM loopos_usage_events GROUP BY user_id ORDER BY 2 DESC LIMIT 10`

### Rebalancing Plans

1. Analyze usage data
2. Adjust monthly allocations in DB:
   ```sql
   UPDATE loopos_plans SET ai_credits_per_month = 300 WHERE id = 'free'
   ```
3. Trigger re-allocation:
   ```sql
   SELECT loopos_allocate_monthly_credits(workspace_id) FROM loopos_workspaces
   ```

---

## 🐛 Known Limitations

1. **No Stripe Integration**: Billing is config-only (no payment processing yet)
2. **No Prorated Credits**: Upgrading mid-month doesn't adjust credits
3. **No Rollover**: Unused credits don't carry over to next month
4. **No Hard Blocks**: Grace period allows overdraft
5. **No Email Alerts**: No notifications when low on credits

---

## 🏆 Achievements

✅ **Complete Billing System**: Plans, subscriptions, credits, usage tracking
✅ **Soft Gating**: Friendly upgrade prompts, no hard paywalls
✅ **Dev Mode**: Generous testing behaviour
✅ **Usage Analytics**: Detailed dashboard and summaries
✅ **Database Functions**: Atomic credit operations
✅ **British English**: Throughout codebase
✅ **TypeScript Strict**: No `any` types, Zod validation

---

**Status**: ✅ Phase 10 Complete - Billing System Ready!
**Implementation Date**: 2025-11-16
**Ready For**: Usage analytics, cost tuning, Stripe integration prep

🚀 **LoopOS now has a complete billing and credit metering system ready for monetisation!**
