-- Flow Hub Summary Cache
-- Phase 16: FlowCore Recovery & Auth Reconnection

create table if not exists public.flow_hub_summary_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id),
  metrics jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '1 hour'
);

create unique index if not exists flow_hub_summary_cache_user_uidx
  on public.flow_hub_summary_cache(user_id);

create index if not exists flow_hub_summary_cache_expires_idx
  on public.flow_hub_summary_cache(expires_at);

alter table public.flow_hub_summary_cache enable row level security;

create policy "select own summary cache"
  on public.flow_hub_summary_cache
  for select
  using (auth.uid() = user_id);

create policy "delete own summary cache"
  on public.flow_hub_summary_cache
  for delete
  using (auth.uid() = user_id);

create policy "update own summary cache"
  on public.flow_hub_summary_cache
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.refresh_flow_hub_summary(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.flow_hub_summary_cache where user_id = uid;

  insert into public.flow_hub_summary_cache (user_id, metrics, generated_at, expires_at)
  values (
    uid,
    jsonb_build_object(
      'totals',
      jsonb_build_object(
        'campaigns',
        coalesce((select count(*) from public.campaigns c where c.user_id = uid), 0),
        'epks',
        coalesce((select count(distinct epk_id) from public.epk_analytics e where e.user_id = uid), 0),
        'agent_runs',
        coalesce((select count(*) from public.agent_results ar where ar.user_id = uid), 0),
        'epk_views',
        coalesce((select sum(e.views) from public.epk_analytics e where e.user_id = uid), 0),
        'epk_downloads',
        coalesce((select sum(e.downloads) from public.epk_analytics e where e.user_id = uid), 0),
        'epk_shares',
        coalesce((select sum(e.shares) from public.epk_analytics e where e.user_id = uid), 0),
        'manual_saves',
        coalesce(
          (
            select count(*)
            from public.flow_telemetry t
            where t.user_id = uid
              and t.event_type = 'save'
          ),
          0
        )
      ),
      'top_epks',
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'epk_id', ranked_epks.epk_id,
            'views', ranked_epks.view_count,
            'downloads', ranked_epks.download_count,
            'shares', ranked_epks.share_count
          )
          order by ranked_epks.view_count desc
        )
        from (
          select
            epk_id,
            coalesce(sum(views), 0) as view_count,
            coalesce(sum(downloads), 0) as download_count,
            coalesce(sum(shares), 0) as share_count
          from public.epk_analytics
          where user_id = uid
          group by epk_id
          order by view_count desc
          limit 5
        ) ranked_epks
      ), '[]'::jsonb),
      'top_agents',
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'agent_type', ranked_agents.agent_type,
            'runs', ranked_agents.run_count
          )
          order by ranked_agents.run_count desc
        )
        from (
          select
            agent_type,
            count(*) as run_count
          from public.agent_results
          where user_id = uid
          group by agent_type
          order by run_count desc
          limit 5
        ) ranked_agents
      ), '[]'::jsonb)
    ),
    now(),
    now() + interval '1 hour'
  );
end;
$$;

comment on table public.flow_hub_summary_cache is 'Cached Flow Hub metrics per user (Phase 16)';

