-- Insert TAP API Keys for totalaud.io
-- Run this in Supabase SQL Editor after the api_keys migration
-- https://supabase.com/dashboard/project/ucncbighzqudaszewjrv/sql

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
    ARRAY['intel:read', 'intel:write'],
    120
  ),
  -- Pitch Integration
  (
    'c5c261a8-8b35-4e77-ae6d-e293e65d746d',
    'totalaud.io - Pitch Integration',
    'tap_live_oTk',
    '8d47b03b79a155715d0150e11bca931deaf59859f0e87a06a2a082ccef7a0e04',
    ARRAY['pitch:read', 'pitch:write'],
    120
  ),
  -- Tracker Integration
  (
    'c5c261a8-8b35-4e77-ae6d-e293e65d746d',
    'totalaud.io - Tracker Integration',
    'tap_live_DaG',
    '48d1a8b9f9828de230c2bd20aa0d13c4ce3b0d68d93a48e77a264d07627a3172',
    ARRAY['tracker:read', 'tracker:write'],
    120
  )
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT name, key_prefix, scopes, rate_limit_rpm, created_at
FROM api_keys
WHERE name LIKE 'totalaud.io%';
