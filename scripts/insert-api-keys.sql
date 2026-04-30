-- Insert TAP API Keys for totalaud.io
-- Run this in Supabase SQL Editor after the api_keys migration
-- https://supabase.com/dashboard/project/ucncbighzqudaszewjrv/sql
--
-- Legacy fixture: the hashes below correspond to literal tap_live_ keys
-- already issued and in use. The prefix metadata is preserved verbatim so the
-- hashes remain valid. New keys must use tap_ak_ and the resource:action scope
-- form -- see docs/TAP_API_REFERENCE.md.

-- First, we need a valid user_id. Use the dev user from .env.local
-- SUPABASE_DEV_USER_ID=c5c261a8-8b35-4e77-ae6d-e293e65d746d

INSERT INTO api_keys (user_id, name, key_prefix, key_hash, scopes, rate_limit_rpm)
VALUES
  -- Intel Integration
  (
    'c5c261a8-8b35-4e77-ae6d-e293e65d746d',
    'totalaud.io - Intel Integration',
    'tap_live_sEf',
    '5549b919a5ab2fb36d6ac2a4529c58e4323824fd0f342a22deb4ae5be31e49f0',
    ARRAY['contacts:read', 'contacts:write', 'contacts:enrich', 'emails:validate'],
    120
  ),
  -- Pitch Integration
  (
    'c5c261a8-8b35-4e77-ae6d-e293e65d746d',
    'totalaud.io - Pitch Integration',
    'tap_live_oTk',
    '8d47b03b79a155715d0150e11bca931deaf59859f0e87a06a2a082ccef7a0e04',
    ARRAY['pitches:read', 'pitches:write'],
    120
  ),
  -- Tracker Integration
  (
    'c5c261a8-8b35-4e77-ae6d-e293e65d746d',
    'totalaud.io - Tracker Integration',
    'tap_live_DaG',
    '48d1a8b9f9828de230c2bd20aa0d13c4ce3b0d68d93a48e77a264d07627a3172',
    ARRAY['campaigns:read', 'campaigns:write', 'outcomes:read', 'outcomes:write'],
    120
  )
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT name, key_prefix, scopes, rate_limit_rpm, created_at
FROM api_keys
WHERE name LIKE 'totalaud.io%';
