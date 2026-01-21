# Deploy RLS Checklist

This checklist must be verified in the Supabase Dashboard SQL Editor before traffic is allowed.

## 1. Critical Tables
These tables contain private user data.

| Table | RLS Enabled? | Policy Requirement |
| :--- | :--- | :--- |
| `campaigns` | **MUST** | `auth.uid() = user_id` |
| `campaign_contacts` | **MUST** | `auth.uid() = user_id` (or via campaign) |
| `artist_assets` | **MUST** | `auth.uid() = user_id` |
| `track_memory` | **MUST** | `auth.uid() = user_id` |
| `track_memory_entries`| **MUST** | `auth.uid() = user_id` (via join) |
| `user_profiles` | **MUST** | `auth.uid() = id` |
| `campaign_patterns` | **MUST** | `auth.uid() = user_id` (via campaign) |
| `campaign_actions` | **MUST** | `auth.uid() = user_id` (via campaign) |

## 2. Verification Scripts

Run these scripts in your Supabase SQL Editor.

### A. Check RLS is Enabled
This should return rows for all tables implemented. If any return `false`, **ENABLE RLS IMMEDIATELY**.

```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN (
  'campaigns', 
  'campaign_contacts', 
  'artist_assets', 
  'track_memory', 
  'track_memory_entries',
  'user_profiles',
  'campaign_patterns',
  'campaign_actions'
);
```

### B. "The Thief Test" (Role: Anon)
This attempts to read data as an unauthenticated user. 
**EXPECTED: 0 rows (or permission denied check).**

```sql
BEGIN;
  -- Switch to anonymous web user
  SET LOCAL ROLE anon;
  
  -- Try to steal entire DB
  SELECT count(*) as stolen_campaigns FROM campaigns;
  SELECT count(*) as stolen_contacts FROM campaign_contacts;
  SELECT count(*) as stolen_profiles FROM user_profiles;
  
ROLLBACK;
```

### C. "The Neighbor Test" (Role: Authenticated)
This attempts to read data as a random authenticated user who is NOT the owner.
**EXPECTED: 0 rows (assuming you have data in DB, you should only see your own).**

```sql
BEGIN;
  -- Set to a random UUID that definitely doesn't own data
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000000';
  
  -- Try to read data
  SELECT * FROM campaigns;
  
ROLLBACK;
```

### D. Policy Auditor
List all policies to visually inspect them. Look for `true` (public) policies on private tables.

```sql
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 3. Remediation

If `The Thief Test` returns data:

1.  **Check Policy:**
    ```sql
    ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only see own campaigns" 
    ON campaigns FOR SELECT 
    USING (auth.uid() = user_id);
    ```

2.  **Verify Grants:**
    Ensure `anon` does not have `BYPASS RLS` (it shouldn't by default).
