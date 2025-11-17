-- EPK Comments Table
-- Phase 17: Collaboration Threads

create table if not exists public.epk_comments (
  id uuid primary key default gen_random_uuid(),
  epk_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  parent_id uuid references public.epk_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_epk_comments_epk_id
  on public.epk_comments(epk_id);

create index if not exists idx_epk_comments_parent_id
  on public.epk_comments(parent_id);

create index if not exists idx_epk_comments_user_id
  on public.epk_comments(user_id);

alter table public.epk_comments enable row level security;

create policy "Collaborators can read EPK comments"
  on public.epk_comments
  for select
  using (
    exists (
      select 1
      from public.campaign_collaborators cc
      where cc.campaign_id = epk_comments.epk_id
        and cc.user_id = auth.uid()
    )
  );

create policy "Owners and editors can insert EPK comments"
  on public.epk_comments
  for insert
  with check (
    exists (
      select 1
      from public.campaign_collaborators cc
      where cc.campaign_id = epk_comments.epk_id
        and cc.user_id = auth.uid()
        and cc.role in ('owner', 'editor')
    )
  );

create policy "Authors and owners can update comments"
  on public.epk_comments
  for update
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.campaign_collaborators cc
      where cc.campaign_id = epk_comments.epk_id
        and cc.user_id = auth.uid()
        and cc.role = 'owner'
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.campaign_collaborators cc
      where cc.campaign_id = epk_comments.epk_id
        and cc.user_id = auth.uid()
        and cc.role = 'owner'
    )
  );

create policy "Authors and owners can delete comments"
  on public.epk_comments
  for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.campaign_collaborators cc
      where cc.campaign_id = epk_comments.epk_id
        and cc.user_id = auth.uid()
        and cc.role = 'owner'
    )
  );

create trigger epk_comments_updated_at
  before update on public.epk_comments
  for each row
  execute function public.handle_updated_at();

comment on table public.epk_comments is 'Threaded comments for campaign EPK collaboration (Phase 17)';
comment on column public.epk_comments.parent_id is 'Parent comment id for threaded replies';



