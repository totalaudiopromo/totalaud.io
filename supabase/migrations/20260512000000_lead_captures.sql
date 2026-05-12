-- Lead-magnet email captures for totalaud.io.
-- Mirrors the newsjack + spotcheck schema so source-tag vocab is shared across the family.

create table if not exists public.lead_captures (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists lead_captures_email_source_uniq
  on public.lead_captures (email, source);

create index if not exists lead_captures_source_created_idx
  on public.lead_captures (source, created_at desc);

alter table public.lead_captures enable row level security;

drop policy if exists "Service role only" on public.lead_captures;
create policy "Service role only"
  on public.lead_captures
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.lead_captures is
  'Lead-magnet email captures from /pre-flight and similar pages. Source field tracks which magnet drove signup.';
