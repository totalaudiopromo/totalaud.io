/**
 * Flow State Intelligence Migration
 * Phase 15: Create flow_telemetry table for analytics
 *
 * Purpose:
 * - Track user flow state interactions (saves, shares, agent runs, tab changes)
 * - Enable Signal Analytics sparklines and metrics
 * - Power Insight Engine pattern detection
 * - Support privacy-first local-only mode via client-side filtering
 *
 * Event Types:
 * - 'save' - Manual or auto-save (duration: time since last save)
 * - 'share' - Scene share action (metadata: shareId, permissions)
 * - 'agentRun' - Agent execution (metadata: agent type, success/failure)
 * - 'tabChange' - Console tab switch (metadata: fromTab, toTab)
 * - 'idle' - User inactive for 2+ minutes (duration: idle time in ms)
 * - 'sessionStart' - New console session
 * - 'sessionEnd' - Console session end
 */

-- Create flow_telemetry table
create table if not exists flow_telemetry (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  campaign_id uuid,
  event_type text not null check (event_type in ('save', 'share', 'agentRun', 'tabChange', 'idle', 'sessionStart', 'sessionEnd')),
  duration_ms int check (duration_ms >= 0),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_flow_telemetry_user_created
  on flow_telemetry(user_id, created_at desc);

create index if not exists idx_flow_telemetry_campaign
  on flow_telemetry(campaign_id, created_at desc);

create index if not exists idx_flow_telemetry_event_type
  on flow_telemetry(event_type, created_at desc);

create index if not exists idx_flow_telemetry_created
  on flow_telemetry(created_at desc);

-- Enable Row Level Security
alter table flow_telemetry enable row level security;

-- RLS Policy: Users can only read their own telemetry
create policy "Users can view their own telemetry"
  on flow_telemetry
  for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own telemetry
create policy "Users can insert their own telemetry"
  on flow_telemetry
  for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own telemetry
create policy "Users can delete their own telemetry"
  on flow_telemetry
  for delete
  using (auth.uid() = user_id);

-- Grant permissions
grant select, insert, delete on flow_telemetry to authenticated;
grant select, insert, delete on flow_telemetry to anon;

-- Comments for documentation
comment on table flow_telemetry is 'Tracks user flow state interactions for analytics and insight generation (Phase 15)';
comment on column flow_telemetry.event_type is 'Type of event: save, share, agentRun, tabChange, idle, sessionStart, sessionEnd';
comment on column flow_telemetry.duration_ms is 'Duration in milliseconds (e.g., time since last save, idle time)';
comment on column flow_telemetry.metadata is 'Event-specific data: shareId, agent type, tab names, etc.';
comment on column flow_telemetry.campaign_id is 'Optional campaign/scene context for the event';


