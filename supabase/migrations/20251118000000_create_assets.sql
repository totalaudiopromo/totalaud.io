/**
 * Asset Drop System Migration
 * Phase 15.2-A: Core Infrastructure Foundation
 *
 * Creates:
 * - Storage bucket: assets (private)
 * - Table: artist_assets (metadata + RLS)
 * - Storage policies (private upload/read/delete by user_id)
 * - Triggers: auto-update timestamps
 *
 * Path convention: assets/{user_id}/{yyyy}/{mm}/{dd}/{uuid}-{slug}.{ext}
 */

-- ========================================
-- STORAGE BUCKET
-- ========================================

insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

-- ========================================
-- ARTIST_ASSETS TABLE
-- ========================================

create table if not exists public.artist_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid,
  kind text not null default 'other' check (kind in ('audio', 'image', 'document', 'archive', 'link', 'other')),
  title text,
  description text,
  tags text[] default '{}',
  path text,
  url text,
  mime_type text,
  byte_size bigint check (byte_size >= 0),
  is_public boolean default false,
  public_share_id uuid unique default gen_random_uuid(),
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ========================================
-- INDEXES
-- ========================================

create index if not exists artist_assets_user_id_idx
  on public.artist_assets(user_id)
  where deleted_at is null;

create index if not exists artist_assets_campaign_id_idx
  on public.artist_assets(campaign_id)
  where deleted_at is null;

create index if not exists artist_assets_kind_idx
  on public.artist_assets(kind)
  where deleted_at is null;

create index if not exists artist_assets_created_idx
  on public.artist_assets(created_at desc);

create index if not exists artist_assets_tags_idx
  on public.artist_assets using gin(tags);

-- ========================================
-- TRIGGERS
-- ========================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_artist_assets_updated on public.artist_assets;
create trigger set_artist_assets_updated
  before update on public.artist_assets
  for each row
  execute function public.set_updated_at();

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

alter table public.artist_assets enable row level security;

create policy "owner can select"
  on public.artist_assets
  for select
  using (auth.uid() = user_id and deleted_at is null);

create policy "owner can insert"
  on public.artist_assets
  for insert
  with check (auth.uid() = user_id);

create policy "owner can update"
  on public.artist_assets
  for update
  using (auth.uid() = user_id);

create policy "owner can delete"
  on public.artist_assets
  for delete
  using (auth.uid() = user_id);

create policy "public read by share id"
  on public.artist_assets
  for select
  using (is_public = true and deleted_at is null);

-- ========================================
-- STORAGE POLICIES
-- ========================================

create policy "owners can upload to assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners can read their assets"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners can update their assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners can delete their assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ========================================
-- COMMENTS
-- ========================================

comment on table public.artist_assets is 'User-uploaded assets (audio, images, documents, links) for campaigns and EPKs (Phase 15.2-A)';
comment on column public.artist_assets.kind is 'Asset type: audio, image, document, archive, link, other';
comment on column public.artist_assets.path is 'Storage path in assets bucket (null for links)';
comment on column public.artist_assets.url is 'External URL when kind=link';
comment on column public.artist_assets.checksum is 'SHA-256 hash for de-duplication';
comment on column public.artist_assets.is_public is 'Whether asset is publicly accessible via public_share_id';
comment on column public.artist_assets.public_share_id is 'Unique ID for public sharing (EPK, etc.)';
comment on column public.artist_assets.deleted_at is 'Soft delete timestamp';

