# Tracker Agent & Real Data Clients

**Design Principle**: "Every number should represent something the user actually achieved."

This system automatically populates the Campaign Mixdown Dashboard with real metrics from external APIs (Gmail, Google Sheets, Mailchimp, Airtable, Spotify).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Campaign Mixdown Dashboard               │
│  (Real-time metrics visualization with sound cues)          │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ Supabase Realtime
                              │
┌─────────────────────────────────────────────────────────────┐
│                    campaign_results table                    │
│  (Stores metrics from all agents + integrations)            │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ write metrics
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Tracker Agent                           │
│  (Orchestrates sync across all integrations)                │
└─────────────────────────────────────────────────────────────┘
                              ▲
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼────────┐  ┌───────▼────────────┐
        │    GmailClient     │  │   SheetsClient     │
        │  (Email tracking)  │  │ (Contact sync)     │
        └────────────────────┘  └────────────────────┘
                    │                   │
        ┌───────────▼────────┐  ┌───────▼────────────┐
        │    Gmail API v1    │  │  Sheets API v4     │
        │  (Google OAuth)    │  │ (Google OAuth)     │
        └────────────────────┘  └────────────────────┘
```

---

## Database Schema

### `integration_connections`

Stores OAuth credentials for external integrations.

```sql
CREATE TABLE integration_connections (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  provider text CHECK (provider IN ('gmail', 'google_sheets', 'airtable', 'mailchimp', 'spotify')),
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  status text DEFAULT 'active',
  auto_sync_enabled boolean DEFAULT true,
  metadata jsonb, -- Provider-specific data (e.g., spreadsheet_id)
  connected_at timestamptz DEFAULT now()
);

-- Unique constraint: one connection per user per provider
CREATE UNIQUE INDEX unique_user_provider ON integration_connections(user_id, provider);
```

### `integration_sync_logs`

Audit trail for all sync operations.

```sql
CREATE TABLE integration_sync_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  integration_type text,
  status text, -- 'success', 'error', 'partial'
  records_synced integer,
  sync_duration_ms integer,
  error_message text,
  synced_at timestamptz DEFAULT now()
);
```

### `campaign_results`

Stores metrics from agents and integrations.

```sql
CREATE TABLE campaign_results (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES agent_sessions,
  agent_name text CHECK (agent_name IN ('broker', 'scout', 'coach', 'tracker', 'insight')),
  metric_key text NOT NULL,
  metric_value numeric NOT NULL,
  metric_label text NOT NULL,
  metric_unit text, -- '%', 'contacts', 'emails', 'ms'
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_results;
```

---

## Tracker Agent

**Location**: `packages/core/agent-executor/src/agents/trackerAgent.ts`

### Purpose

Orchestrates syncing across all connected integrations and writes metrics to `campaign_results` for dashboard visualization.

### Usage

```typescript
import { createTrackerAgent } from '@total-audio/core-agent-executor'
import { createClient } from '@supabase/supabase-js'

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const tracker = createTrackerAgent({
  supabaseClient,
  sessionId: 'session-uuid-here',
  userId: 'user-uuid-here',
})

const result = await tracker.execute()

console.log(result.message)
// "📧 Email Tracking: 23 sent, 8 replies (67% open rate) | 🧾 Contact Sync: 120 total contacts, 5 new"
```

### Execution Flow

1. **Fetch User Integrations**: Query `integration_connections` for active connections
2. **Sync Gmail** (if connected):
   - Call `GmailClient.fetchMetrics()`
   - Get sent emails, replies, open rate, follow-ups due
   - Write metrics to `campaign_results`
3. **Sync Google Sheets** (if connected):
   - Call `SheetsClient.fetchMetrics()`
   - Get total contacts, new contacts, sync health
   - Write metrics to `campaign_results`
4. **Generate Summary**: Create Broker-friendly narration message
5. **Return Result**: Success status + metrics + message

### Result Interface

```typescript
interface TrackerAgentResult {
  success: boolean
  metrics: {
    gmail?: GmailMetrics
    sheets?: SheetsMetrics
    syncedAt: string
  }
  message: string // Broker narration
  errors?: string[] // Any errors encountered
}
```

### Metrics Written to `campaign_results`

**Gmail Metrics**:
- `emails_sent`: Number of campaign emails sent (metric_unit: 'emails')
- `email_replies`: Number of replies received (metric_unit: 'replies')
- `open_rate`: Calculated open rate (metric_unit: '%')
- `follow_ups_due`: Contacts needing follow-up (metric_unit: 'contacts')

**Google Sheets Metrics**:
- `total_contacts`: Total contacts in sheet (metric_unit: 'contacts')
- `new_contacts`: Contacts marked as "NEW" (metric_unit: 'contacts')

All metrics include:
- `agent_name: 'tracker'`
- `session_id`: Current campaign session
- `metadata`: Source info (e.g., `{ source: 'gmail' }`)

---

## Gmail Client

**Location**: `packages/core/integrations/src/gmail-client.ts`

### Purpose

Track campaign email metrics using the Gmail API v1.

### Configuration

```typescript
import { GmailClient } from '@total-audio/core-integrations'

const gmailClient = new GmailClient({
  accessToken: 'ya29.a0AfH6SMB...',
  campaignTag: 'radio-campaign', // Tag to identify campaign emails
  daysBack: 30, // Track emails from last 30 days
})
```

### Metrics

```typescript
interface GmailMetrics {
  sent: number // Total emails sent
  replies: number // Total replies received
  openRate: number // Calculated open rate (%)
  followUpsDue: number // Contacts needing follow-up
  lastSyncAt: string // ISO timestamp
}

const metrics = await gmailClient.fetchMetrics()
// {
//   sent: 23,
//   replies: 8,
//   openRate: 67,
//   followUpsDue: 5,
//   lastSyncAt: "2025-10-19T14:42:00.000Z"
// }
```

### How It Works

**Sent Emails**:
```typescript
// Query Gmail API for sent emails matching campaign tag
const query = `in:sent subject:${campaignTag} newer_than:${daysBack}d`
const response = await gmail.users.messages.list({ q: query })
```

**Replies**:
```typescript
// For each sent email, check thread for new messages
const thread = await gmail.users.threads.get({ id: threadId })
const hasReplies = thread.messages.length > 1
```

**Open Rate**:
```typescript
// Calculated as: (replies / sent) * 100
// Assumes recipients opened email before replying
const openRate = Math.round((replies / sent) * 100)
```

**Follow-Ups Due**:
```typescript
// Contacts who haven't replied after 7 days
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const followUpsDue = sentEmails.filter(email =>
  !hasReplies(email) && email.sentAt < weekAgo
).length
```

### Additional Methods

```typescript
// Track a newly sent email
await gmailClient.trackSentEmail({
  messageId: 'msg-123',
  threadId: 'thread-456',
  to: 'radio@bbc.com',
  subject: 'Radio Campaign Pitch',
})

// Check for new replies
const newReplies = await gmailClient.checkForReplies()
// [
//   { emailId: 'msg-123', from: 'radio@bbc.com', snippet: 'Thanks for the pitch...' }
// ]

// Get user Gmail profile
const profile = await gmailClient.getUserProfile()
// { emailAddress: 'you@example.com', messagesTotal: 1245 }
```

---

## Google Sheets Client

**Location**: `packages/core/integrations/src/sheets-client.ts`

### Purpose

Sync contact lists from Google Sheets and track growth.

### Configuration

```typescript
import { SheetsClient } from '@total-audio/core-integrations'

const sheetsClient = new SheetsClient({
  accessToken: 'ya29.a0AfH6SMB...',
  spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  sheetName: 'Contacts', // Default sheet name
  newContactMarker: 'NEW', // Status marker for new contacts
})
```

### Metrics

```typescript
interface SheetsMetrics {
  totalContacts: number // Total contacts in sheet
  newContacts: number // Contacts with "NEW" status
  lastModified: string // Sheet last modified time
  syncHealth: 'healthy' | 'warning' | 'error' // Sync freshness
  lastSyncAt: string // ISO timestamp
}

const metrics = await sheetsClient.fetchMetrics()
// {
//   totalContacts: 120,
//   newContacts: 5,
//   lastModified: "2025-10-18T10:30:00.000Z",
//   syncHealth: "healthy",
//   lastSyncAt: "2025-10-19T14:42:00.000Z"
// }
```

### How It Works

**Total Contacts**:
```typescript
// Fetch all rows from sheet (assumes header in row 1)
const range = `${sheetName}!A2:E1000`
const response = await sheets.spreadsheets.values.get({ range })
const totalContacts = response.data.values?.length || 0
```

**New Contacts**:
```typescript
// Count rows where status column contains "NEW"
const newContacts = contacts.filter(contact =>
  contact.status?.toUpperCase().includes('NEW')
).length
```

**Sync Health**:
```typescript
// Based on time since last sheet modification
const daysSinceUpdate = (Date.now() - lastModified) / (1000 * 60 * 60 * 24)
if (daysSinceUpdate > 7) return 'error'
if (daysSinceUpdate > 3) return 'warning'
return 'healthy'
```

### Expected Sheet Format

```
| A (Name) | B (Email)       | C (Role)      | D (Status) | E (Added Date) |
|----------|-----------------|---------------|------------|----------------|
| John Doe | john@radio.com  | Producer      | NEW        | 2025-10-15     |
| Jane Doe | jane@bbc.com    | DJ            | CONTACTED  | 2025-10-10     |
```

### Additional Methods

```typescript
// Get all contacts
const contacts = await sheetsClient.getContacts()
// [
//   { name: 'John Doe', email: 'john@radio.com', role: 'Producer', status: 'NEW', addedDate: '2025-10-15' }
// ]

// Add new contacts
const result = await sheetsClient.addContacts([
  { name: 'New Contact', email: 'new@example.com', role: 'DJ', status: 'NEW' }
])
// { success: true, added: 1, errors: [] }

// Update contact status
await sheetsClient.updateContactStatus('john@radio.com', 'CONTACTED')
// { success: true, message: 'Updated john@radio.com status to CONTACTED' }

// Search contacts
const radioProducers = await sheetsClient.searchContacts({ role: 'Producer' })

// Get statistics
const stats = await sheetsClient.getStatistics()
// {
//   total: 120,
//   byStatus: { NEW: 5, CONTACTED: 30, REPLIED: 15, ... },
//   byRole: { Producer: 40, DJ: 60, ... },
//   addedThisWeek: 8
// }
```

---

## OAuth Setup

### Google Cloud Console Setup

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Enable APIs**:
   - Gmail API v1
   - Google Sheets API v4
   - Google Drive API (for file access)

3. **Create OAuth 2.0 Credentials**:
   - Application Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/integrations/gmail/callback` (dev)
     - `https://totalaud.io/api/integrations/gmail/callback` (prod)
     - `http://localhost:3000/api/integrations/google-sheets/callback` (dev)
     - `https://totalaud.io/api/integrations/google-sheets/callback` (prod)

4. **Get Credentials**:
   - Client ID: `123456789-abcdefg.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123def456`

### Environment Variables

Add to `.env.local`:

```bash
# Gmail Integration
NEXT_PUBLIC_GMAIL_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-abc123def456

# Google Sheets Integration
NEXT_PUBLIC_GOOGLE_SHEETS_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_SHEETS_CLIENT_SECRET=GOCSPX-abc123def456

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: Gmail and Sheets can share the same OAuth credentials if both APIs are enabled in the same Google Cloud project.

### OAuth Flow

**1. Initiate Connection** (User clicks "Connect Gmail"):

```typescript
import { OAuthHandler } from '@total-audio/core-integrations'

const oauth = new OAuthHandler()
const { authUrl, state, codeVerifier } = oauth.generateOAuthParams({
  integrationType: 'gmail',
  clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!,
  redirectUri: 'http://localhost:3000/api/integrations/gmail/callback',
  scopes: ['gmail.readonly', 'gmail.send', 'gmail.metadata'],
})

// Store state + codeVerifier in database (for CSRF protection)
await supabase.from('oauth_state_tokens').insert({ state, code_verifier: codeVerifier })

// Redirect user to Google
window.location.href = authUrl
```

**2. Handle Callback** (Google redirects back):

```typescript
// /api/integrations/gmail/callback/route.ts
import { OAuthHandler } from '@total-audio/core-integrations'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  // Verify state token (CSRF protection)
  const { data: stateToken } = await supabase
    .from('oauth_state_tokens')
    .select('*')
    .eq('state', state)
    .single()

  if (!stateToken) {
    return new Response('Invalid state', { status: 400 })
  }

  // Exchange code for tokens
  const oauth = new OAuthHandler()
  const tokens = await oauth.exchangeCodeForTokens({
    integrationType: 'gmail',
    clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!,
    clientSecret: process.env.GMAIL_CLIENT_SECRET!,
    redirectUri: 'http://localhost:3000/api/integrations/gmail/callback',
    code,
  })

  // Store connection in database
  await supabase.from('integration_connections').insert({
    user_id: userId,
    provider: 'gmail',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  })

  return Response.redirect('/dashboard?connected=gmail')
}
```

**3. Auto-Refresh Tokens**:

```typescript
const oauth = new OAuthHandler()

// Check if token needs refresh (5-minute buffer)
if (oauth.isTokenExpired(connection.expires_at)) {
  const newTokens = await oauth.refreshAccessToken({
    integrationType: 'gmail',
    clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!,
    clientSecret: process.env.GMAIL_CLIENT_SECRET!,
    refreshToken: connection.refresh_token,
  })

  // Update connection with new tokens
  await supabase.from('integration_connections').update({
    access_token: newTokens.access_token,
    expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
  }).eq('id', connection.id)
}
```

---

## Dashboard Integration

### Real-Time Updates

The Campaign Mixdown Dashboard subscribes to `campaign_results` for live metric updates:

```typescript
// CampaignDashboard.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export function CampaignDashboard({ sessionId }: { sessionId: string }) {
  const [metrics, setMetrics] = useState<CampaignMetric[]>([])

  useEffect(() => {
    const supabase = createClient(/* ... */)

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`campaign-results-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        table: 'campaign_results',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const newMetric = payload.new as CampaignMetric
        setMetrics((prev) => [newMetric, ...prev])

        // Play sound cue when new metric arrives
        playAgentSound('tracker', 'complete')
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  return (
    <div>
      {/* Display metrics with agent-specific colors */}
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
```

### Metric Display

**Tracker Metrics Card**:

```tsx
<div className="border-l-4 border-amber-500 bg-slate-900 p-4">
  <div className="flex items-center gap-2 mb-2">
    <span className="text-2xl">📊</span>
    <h3 className="font-mono text-amber-400">Tracker</h3>
    <span className="text-xs text-slate-500">Last update: 2 min ago</span>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <div className="text-2xl font-mono font-bold">23</div>
      <div className="text-sm text-slate-400">Emails Sent</div>
    </div>
    <div>
      <div className="text-2xl font-mono font-bold">8</div>
      <div className="text-sm text-slate-400">Replies</div>
    </div>
    <div>
      <div className="text-2xl font-mono font-bold">67%</div>
      <div className="text-sm text-slate-400">Open Rate</div>
    </div>
    <div>
      <div className="text-2xl font-mono font-bold">120</div>
      <div className="text-sm text-slate-400">Total Contacts</div>
    </div>
  </div>
</div>
```

---

## Testing

### Manual Testing Script

```typescript
// test-tracker-agent.ts
import { createClient } from '@supabase/supabase-js'
import { createTrackerAgent } from '@total-audio/core-agent-executor'

async function testTrackerSync() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Create tracker agent
  const tracker = createTrackerAgent({
    supabaseClient: supabase,
    sessionId: 'test-session-123',
    userId: 'user-uuid-here',
  })

  // Execute sync
  console.log('Starting Tracker sync...')
  const result = await tracker.execute()

  console.log('Result:', result)
  console.log('Message:', result.message)

  if (result.metrics.gmail) {
    console.log('Gmail Metrics:', result.metrics.gmail)
  }

  if (result.metrics.sheets) {
    console.log('Sheets Metrics:', result.metrics.sheets)
  }

  // Verify metrics were written to database
  const { data: campaignResults } = await supabase
    .from('campaign_results')
    .select('*')
    .eq('session_id', 'test-session-123')
    .eq('agent_name', 'tracker')

  console.log('Campaign Results:', campaignResults)
}

testTrackerSync()
```

Run with:
```bash
npx tsx test-tracker-agent.ts
```

### Expected Console Output

```
Starting Tracker sync...
Result: {
  success: true,
  metrics: {
    gmail: { sent: 23, replies: 8, openRate: 67, followUpsDue: 5, lastSyncAt: '...' },
    sheets: { totalContacts: 120, newContacts: 5, lastModified: '...', syncHealth: 'healthy', lastSyncAt: '...' },
    syncedAt: '2025-10-19T14:42:00.000Z'
  },
  message: '📧 Email Tracking: 23 sent, 8 replies (67% open rate) | ⏰ 5 follow-ups due | 🧾 Contact Sync: 120 total contacts, 5 new'
}
Gmail Metrics: { sent: 23, replies: 8, openRate: 67, followUpsDue: 5, lastSyncAt: '...' }
Sheets Metrics: { totalContacts: 120, newContacts: 5, lastModified: '...', syncHealth: 'healthy', lastSyncAt: '...' }
Campaign Results: [
  { metric_key: 'emails_sent', metric_value: 23, metric_label: 'Emails Sent', ... },
  { metric_key: 'email_replies', metric_value: 8, metric_label: 'Replies Received', ... },
  { metric_key: 'open_rate', metric_value: 67, metric_label: 'Open Rate', metric_unit: '%', ... },
  { metric_key: 'follow_ups_due', metric_value: 5, metric_label: 'Follow-Ups Due', ... },
  { metric_key: 'total_contacts', metric_value: 120, metric_label: 'Total Contacts', ... },
  { metric_key: 'new_contacts', metric_value: 5, metric_label: 'New Contacts', ... }
]
```

---

## Future Enhancements

### 1. Mailchimp Integration

**Metrics**:
- Total subscribers
- Email campaign sent
- Open rate
- Click rate
- Unsubscribes

**API**: Mailchimp Marketing API v3

### 2. Airtable Integration

**Metrics**:
- Total records in base
- New records this week
- Records by status
- Last sync time

**API**: Airtable REST API v0

### 3. Spotify Integration

**Metrics**:
- Playlist followers
- Monthly listeners
- Top track plays
- Playlist adds

**API**: Spotify Web API

### 4. Webhook Support

Replace 15-minute polling with real-time webhooks:

- Gmail: [Push Notifications](https://developers.google.com/gmail/api/guides/push)
- Sheets: [Google Drive API Change Notifications](https://developers.google.com/drive/api/guides/push)
- Mailchimp: [Webhooks](https://mailchimp.com/developer/marketing/guides/webhooks/)

### 5. Bulk Operations

Optimize for campaigns with 100+ contacts:

- Batch Gmail API requests (50 messages per batch)
- Sheets range batching (1000 rows per request)
- Background job queue for large syncs

### 6. Conflict Resolution

Handle concurrent edits intelligently:

- Last-write-wins with timestamp comparison
- User-selectable conflict resolution strategy
- Visual diff viewer for conflicting changes

---

## Summary

**What's Built**:
- ✅ Tracker Agent orchestration layer
- ✅ Gmail API client (sent, replies, open rate)
- ✅ Google Sheets API client (contacts, growth tracking)
- ✅ OAuth 2.0 handler with PKCE + auto-refresh
- ✅ Database schema for connections + metrics
- ✅ Real-time dashboard integration
- ✅ Comprehensive documentation

**What's Needed**:
- 🔧 IntegrationManager UI component (Connect buttons)
- 🔧 CampaignDashboard metric display
- 🔧 OAuth callback API routes
- 🔧 End-to-end testing with real accounts

**Timeline**:
- OAuth setup: ~30 minutes
- UI components: ~2 hours
- Testing: ~1 hour
- **Total**: ~3.5 hours to production-ready

**Impact**:
- User sees real campaign progress automatically
- No manual data entry or copy-paste
- Broker narrates results with personality
- Dashboard fills itself in with sound cues
- "The most valuable dashboard is the one that fills itself in."

---

**Built**: October 2025
**Status**: Tracker agent complete, UI components pending
**Files Created**: 3 core files, 400+ lines of production code
**Design Principle**: "Every number should represent something the user actually achieved."
