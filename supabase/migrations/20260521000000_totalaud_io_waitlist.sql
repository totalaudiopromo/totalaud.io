-- totalaud.io waiting list
-- Captures email + UTM source from the public waiting list page.
-- No auth required to insert (anon policy below).

create table if not exists totalaud_io_waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  source       text,           -- UTM source, e.g. 'tap-footer', 'spotcheck-footer', 'organic'
  utm_medium   text,
  utm_campaign text,
  created_at   timestamptz not null default now()
);

-- Unique on email so duplicate submissions are harmless
create unique index if not exists totalaud_io_waitlist_email_idx on totalaud_io_waitlist (lower(email));

-- Anyone (anon) can insert their own email
alter table totalaud_io_waitlist enable row level security;

create policy "anon_insert" on totalaud_io_waitlist
  for insert
  to anon
  with check (true);

-- Only authenticated service role can read
create policy "service_role_select" on totalaud_io_waitlist
  for select
  using (auth.role() = 'service_role');
