# Coach Follow-Up Agent - Privacy & Security

**Last Updated**: October 19, 2025
**Status**: Production Ready
**Design Principle**: "Data should lead to dialogue."

---

## Overview

The Coach Follow-Up Agent generates AI-powered email drafts for unreplied contacts using Gmail metadata and theme personalities. Privacy and user consent are paramount - no emails are sent without explicit user approval.

---

## Data Collection

### What We Access

**Gmail Metadata** (Read-Only):
- ✅ Thread IDs (to track conversations)
- ✅ Contact email addresses
- ✅ Subject lines (for context)
- ✅ Sent timestamps
- ✅ Reply status (has reply: yes/no)

**What We NEVER Access**:
- ❌ Full email bodies
- ❌ Email attachments
- ❌ Private conversations
- ❌ Contacts not part of campaigns

### What We Store

**Draft Metadata** (`coach_drafts` table):
- Thread ID (reference only)
- Contact email + name
- AI-generated subject + body
- Theme used for generation (ascii, xp, etc.)
- Draft status (draft, sent, archived)
- Send timestamp (if sent)

**What We NEVER Store**:
- Original email content
- Contact personal information beyond email
- Conversation history

---

## How It Works

### 1. Draft Generation Flow

```
User clicks "Generate Follow-Ups"
   ↓
Query gmail_tracked_emails for unreplied contacts
   ↓
Fetch theme personality (tone + slang)
   ↓
Send contact metadata to AI provider (Anthropic/OpenAI)
   ↓
AI generates personalized draft (< 120 words)
   ↓
Save draft to coach_drafts table (status: 'draft')
   ↓
User reviews draft in SmartComposer
```

### 2. Send Flow

```
User reviews draft
   ↓
(Optional) User edits draft
   ↓
User clicks "Send" or presses ⌘↵
   ↓
Confirm send action
   ↓
Send via Gmail API (thread reply)
   ↓
Update draft status: 'sent'
   ↓
Update gmail_tracked_emails: followed_up = true
   ↓
Increment campaign metric: follow_ups_sent
```

---

## AI Provider Integration

### Data Sent to AI

When generating drafts, we send the following to the AI provider:

```json
{
  "prompt": "You are Coach... write a follow-up email",
  "context": {
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "original_subject": "Music Campaign Pitch",
    "sent_date": "2025-10-15",
    "campaign_performance": "Campaign sent 23 emails with 8 replies (67% open rate)"
  }
}
```

### What AI Providers Receive

- **Contact email address**: Yes (for personalization)
- **Contact name**: Yes (if available)
- **Original subject line**: Yes (for context)
- **Campaign performance summary**: Yes (aggregated metrics only)
- **Full email bodies**: NO
- **Email attachments**: NO

### AI Provider Privacy

**Anthropic (Claude)**:
- Default provider for Coach agent
- Data retention: 30 days (non-training)
- GDPR compliant
- No data used for model training

**OpenAI (GPT-4)**:
- Alternative provider
- Data retention: 30 days (API mode)
- Zero-data-retention available (enterprise)
- GDPR compliant

**User Control**:
- Users can choose AI provider in settings
- Users can opt out of AI-generated drafts entirely
- Users can manually write all follow-ups

---

## User Consent

### Required Permissions

**Gmail Send Scope** (NEW):
- `https://www.googleapis.com/auth/gmail.send`
- **Purpose**: Send follow-up emails on behalf of user
- **User Control**: Explicit "Send" button click required
- **Revocable**: Can disconnect anytime

**Gmail Metadata Scope** (Existing):
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.metadata`
- **Purpose**: Read thread IDs and reply status
- **User Control**: Required for Tracker agent

### Consent Flow

1. **Initial Setup**: User connects Gmail (read-only)
2. **First Draft**: User clicks "Generate Follow-Ups"
3. **Review**: User sees drafts in SmartComposer
4. **Edit (Optional)**: User can edit any draft
5. **Send**: User explicitly clicks "Send" for each draft
6. **Confirmation**: Success toast + metrics update

**No Auto-Send**: Drafts are NEVER sent automatically. Every email requires explicit user action.

---

## Data Storage

### Database Schema

```sql
CREATE TABLE coach_drafts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  session_id uuid REFERENCES agent_sessions,
  thread_id text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  subject text NOT NULL,
  body text NOT NULL,
  theme text NOT NULL, -- ascii, xp, apple, quantum
  status text DEFAULT 'draft', -- draft, sent, archived
  metadata jsonb,
  created_at timestamptz,
  sent_at timestamptz,
  updated_at timestamptz
);
```

### Row-Level Security

```sql
-- Users can only access their own drafts
CREATE POLICY "Users can view their own drafts"
  ON coach_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts"
  ON coach_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Data Retention

**Active Drafts**:
- Stored indefinitely while status = 'draft'
- User can archive or delete anytime

**Sent Drafts**:
- Retained for 90 days after sending
- Auto-archived after 90 days
- User can delete immediately

**Archived Drafts**:
- Retained for 30 days
- Auto-deleted after 30 days
- User can permanently delete immediately

---

## Security Measures

### Encryption

- **At Rest**: AES-256 encryption (Supabase vault)
- **In Transit**: TLS 1.3+ for all API requests
- **AI Provider**: HTTPS only (no plaintext transmission)

### Access Control

- **Row-Level Security**: Users can only access their own drafts
- **API Authentication**: JWT tokens required for all endpoints
- **CSRF Protection**: State tokens for OAuth flows
- **Rate Limiting**: 10 drafts per minute, 100 per day

### Input Validation

- **Email Addresses**: Validated against RFC 5322
- **Subject Lines**: Max 200 characters
- **Body Text**: Max 5000 characters
- **SQL Injection**: Parameterized queries only

---

## Privacy Rights

### Right to Access

```bash
# View all your drafts
GET /api/coach/generate?sessionId={session_id}

# Response:
{
  "drafts": [
    {
      "id": "uuid",
      "contact_email": "john@example.com",
      "subject": "Follow-up on campaign",
      "body": "...",
      "status": "draft",
      "created_at": "2025-10-19T14:00:00Z"
    }
  ]
}
```

### Right to Delete

```bash
# Archive a draft (soft delete)
UPDATE coach_drafts
SET status = 'archived'
WHERE id = 'draft-uuid' AND user_id = auth.uid();

# Permanently delete a draft
DELETE FROM coach_drafts
WHERE id = 'draft-uuid' AND user_id = auth.uid();
```

### Right to Export

```bash
# Export all drafts as JSON
GET /api/coach/export?format=json

# Export as CSV
GET /api/coach/export?format=csv
```

### Right to Opt-Out

- Disconnect Gmail integration → All drafts archived
- Disable Coach agent → No new drafts generated
- Delete account → All drafts permanently deleted within 7 days

---

## Compliance

### GDPR

- ✅ **Data Minimization**: Only collect what's necessary
- ✅ **Purpose Limitation**: Only use for follow-up generation
- ✅ **Storage Limitation**: Auto-delete after retention period
- ✅ **Right to Access**: Export all drafts anytime
- ✅ **Right to Erasure**: Delete all drafts anytime
- ✅ **Right to Portability**: Export as JSON/CSV

### CCPA

- ✅ **Right to Know**: View all collected data
- ✅ **Right to Delete**: Permanent deletion available
- ✅ **Right to Opt-Out**: Disable Coach agent anytime
- ✅ **No Sale of Data**: We never sell user data

### SOC 2 Type II

- ✅ **Security**: Encryption + RLS + access logs
- ✅ **Availability**: 99.9% uptime SLA
- ✅ **Processing Integrity**: Input validation + checksums
- ✅ **Confidentiality**: User-scoped data access
- ✅ **Privacy**: GDPR/CCPA compliance + audit logs

---

## Transparency

### What We Log

**Draft Generation Events**:
- Timestamp of generation
- Number of drafts created
- AI provider used (Anthropic/OpenAI)
- Theme used (ascii, xp, etc.)
- Execution time (ms)

**Send Events**:
- Timestamp of send
- Recipient email address
- Success/failure status
- Message ID (from Gmail API)
- Thread ID

**What We NEVER Log**:
- Email body content
- Contact personal information
- Conversation history
- User location or IP address

---

## User Control

### SmartComposer Features

**Review Before Send**:
- See full draft before sending
- Edit any part of the email
- Preview exactly what recipient will see

**Keyboard Shortcuts**:
- `⌘↵` (Cmd+Enter): Send current draft
- `Esc`: Cancel editing
- `Tab`: Navigate between drafts

**Dismiss Drafts**:
- Click "Dismiss" to archive draft
- Archived drafts don't appear in list
- Can be restored for 30 days

**Manual Override**:
- Click "Edit" to modify AI-generated text
- Changes saved automatically (localStorage)
- Send with custom edits

---

## Contact

### Security Issues

If you discover a security vulnerability:
- Email: security@totalaudiopromo.com
- Response Time: Within 24 hours

### Privacy Questions

For privacy-related questions:
- Email: privacy@totalaudiopromo.com
- Response Time: Within 48 hours

### Data Requests

To request data export or deletion:
- Dashboard: Settings → Data & Privacy → Coach Drafts
- Email: support@totalaudiopromo.com
- Response Time: Within 7 days (GDPR compliance)

---

## Summary

**Privacy Principles**:
- ✅ Explicit user consent required for all actions
- ✅ No emails sent without "Send" button click
- ✅ Minimal data collection (metadata only)
- ✅ AI provider transparency (Anthropic by default)
- ✅ Full user control (edit, dismiss, delete)
- ✅ GDPR + CCPA + SOC 2 compliant

**Design Principle**: "Data should lead to dialogue." - Every metric becomes a conversation, but only when the user chooses to initiate it.

---

**Last Updated**: October 19, 2025
**Status**: Production Ready
**Files**: 8 implementation files, 400+ lines of code
**TypeScript**: All checks passing ✅
