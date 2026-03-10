-- Scout Mode: Opportunities Table
-- Stores curated opportunities (playlists, blogs, radio, press) for artists to discover

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  
  -- Basic Info
  name text not null,
  type text not null check (type in ('playlist', 'blog', 'radio', 'press', 'curator')),
  description text,
  
  -- Filtering Attributes
  genres text[] not null default '{}', -- Array of genres (e.g., ['indie']). 'all' implies universal appeal.
  vibes text[] default '{}',           -- Array of vibes (e.g., ['chill', 'upbeat'])
  
  -- Audience
  audience_size text check (audience_size in ('small', 'medium', 'large', 'huge')),
  follower_count int,
  
  -- Contact & Links
  url text,
  contact_email text,
  contact_info jsonb,  -- Flexible field: { "submissionUrl": "...", "socials": { "instagram": "..." }, "contactName": "..." }
  
  -- Metadata
  is_active boolean default true,
  submission_open boolean default true,
  submission_notes text,
  
  -- Stats (optional, for future trust signals)
  avg_response_time integer, -- Average response time in days
  acceptance_rate numeric(5,2), -- Acceptance rate percentage (0-100.00)
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.opportunities enable row level security;

-- Public read access (opportunities are curated, public data)
create policy "Opportunities are publicly readable"
  on public.opportunities
  for select
  using (is_active = true);

-- Only authenticated users with specific role can insert/update
-- For now, manual curation through Supabase Studio
create policy "Only service role can modify opportunities"
  on public.opportunities
  for all
  using (false); -- No one can modify via RLS (use service role key or Studio)

-- Create indexes for common queries
create index if not exists opportunities_type_idx on public.opportunities(type);
create index if not exists opportunities_genres_idx on public.opportunities using gin(genres);
create index if not exists opportunities_vibes_idx on public.opportunities using gin(vibes);
create index if not exists opportunities_active_idx on public.opportunities(is_active) where is_active = true;

-- Update updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger opportunities_updated_at
  before update on public.opportunities
  for each row
  execute function public.handle_updated_at();

-- Sample seed data (50 curated opportunities)
insert into public.opportunities (name, type, genres, vibes, audience_size, url, description, submission_notes) values
  -- PLAYLISTS
  ('Indie Vibes', 'playlist', ARRAY['indie', 'alternative'], ARRAY['chill', 'mellow'], 'medium', 'https://open.spotify.com/playlist/example1', 'Curated indie playlist for bedroom pop and lo-fi artists', 'Submit via SubmitHub'),
  ('Electronic Dreams', 'playlist', ARRAY['electronic', 'ambient'], ARRAY['dreamy', 'atmospheric'], 'large', 'https://open.spotify.com/playlist/example2', 'Electronic and ambient new releases', 'Direct email preferred'),
  ('Fresh Finds UK', 'playlist', ARRAY['indie', 'rock', 'pop'], ARRAY['upbeat', 'energetic'], 'huge', 'https://open.spotify.com/playlist/example3', 'Official Spotify Fresh Finds UK edition', 'Apply through Spotify for Artists'),
  ('Coffee Shop Acoustics', 'playlist', ARRAY['acoustic', 'folk'], ARRAY['calm', 'peaceful'], 'medium', 'https://open.spotify.com/playlist/example4', 'Acoustic guitar and gentle vocals', 'Open submissions via link'),
  ('Underground Techno', 'playlist', ARRAY['techno', 'electronic'], ARRAY['dark', 'energetic'], 'small', 'https://open.spotify.com/playlist/example5', 'Underground techno and minimal', 'DM on Instagram'),
  
  ('Indie Sleaze Revival', 'playlist', ARRAY['indie', 'rock'], ARRAY['edgy', 'nostalgic'], 'medium', 'https://open.spotify.com/playlist/example6', '2000s indie vibes', 'SubmitHub only'),
  ('Bedroom Pop Collective', 'playlist', ARRAY['indie', 'pop'], ARRAY['lo-fi', 'intimate'], 'large', 'https://open.spotify.com/playlist/example7', 'DIY bedroom pop artists', 'Email with streaming links'),
  ('Jazz Fusion Explorations', 'playlist', ARRAY['jazz', 'fusion'], ARRAY['sophisticated', 'experimental'], 'small', 'https://open.spotify.com/playlist/example8', 'Modern jazz fusion', 'Monthly submissions'),
  ('UK Garage Essentials', 'playlist', ARRAY['garage', 'electronic'], ARRAY['groovy', 'upbeat'], 'medium', 'https://open.spotify.com/playlist/example9', 'UKG and 2-step classics', 'Closed submissions'),
  ('Post-Rock Atmosphere', 'playlist', ARRAY['post-rock', 'instrumental'], ARRAY['cinematic', 'emotional'], 'medium', 'https://open.spotify.com/playlist/example10', 'Instrumental post-rock', 'Submit via Toneden'),
  
  -- BLOGS
  ('The Line of Best Fit', 'blog', ARRAY['indie', 'alternative', 'electronic'], ARRAY[], 'huge', 'https://www.thelineofbestfit.com', 'Leading UK music blog covering indie and alternative', 'Email press team'),
  ('DIY Magazine', 'blog', ARRAY['indie', 'rock', 'pop'], ARRAY[], 'huge', 'https://diymag.com', 'UK music and culture magazine', 'Submit via press contact'),
  ('The Quietus', 'blog', ARRAY['experimental', 'electronic', 'rock'], ARRAY['avant-garde', 'challenging'], 'large', 'https://thequietus.com', 'In-depth music journalism', 'Pitch stories to editors'),
  ('Earmilk', 'blog', ARRAY['electronic', 'hip-hop', 'indie'], ARRAY[], 'large', 'https://earmilk.com', 'Music discovery and culture', 'Submit via contact form'),
  ('Indie Shuffle', 'blog', ARRAY['indie', 'electronic', 'pop'], ARRAY[], 'large', 'https://www.indieshuffle.com', 'Music blog and playlist curator', 'SubmitHub submissions'),
  
  ('Atwood Magazine', 'blog', ARRAY['indie', 'folk', 'singer-songwriter'], ARRAY['intimate', 'thoughtful'], 'medium', 'https://atwoodmagazine.com', 'Independent music magazine', 'Email with EPK'),
  ('Clash Magazine', 'blog', ARRAY['indie', 'rock', 'electronic'], ARRAY[], 'huge', 'https://www.clashmusic.com', 'Music and style magazine', 'Via management or PR only'),
  ('Consequence', 'blog', ARRAY['rock', 'indie', 'alternative'], ARRAY[], 'huge', 'https://consequence.net', 'Music news and reviews', 'Submit to editors'),
  ('Stereogum', 'blog', ARRAY['indie', 'rock', 'pop'], ARRAY[], 'huge', 'https://www.stereogum.com', 'Music blog and news site', 'Closed submissions'),
  ('BrooklynVegan', 'blog', ARRAY['indie', 'rock', 'punk'], ARRAY['edgy'], 'large', 'https://www.brooklynvegan.com', 'NYC-based music blog', 'Submit via contact'),
  
  -- RADIO
  ('BBC Radio 6 Music', 'radio', ARRAY['indie', 'alternative', 'rock'], ARRAY[], 'huge', 'https://www.bbc.co.uk/6music', 'BBC alternative music station', 'Via BBC Introducing'),
  ('BBC Introducing', 'radio', ARRAY['all'], ARRAY[], 'huge', 'https://www.bbc.co.uk/introducing', 'Platform for unsigned artists', 'Upload to BBC Introducing'),
  ('Amazing Radio', 'radio', ARRAY['indie', 'alternative'], ARRAY[], 'large', 'https://amazingradio.com', 'New music radio station', 'Submit via Audiu platform'),
  ('NTS Radio', 'radio', ARRAY['electronic', 'experimental', 'jazz'], ARRAY['eclectic'], 'large', 'https://www.nts.live', 'Freeform online radio', 'Contact show hosts directly'),
  ('Rinse FM', 'radio', ARRAY['electronic', 'grime', 'garage'], ARRAY['underground'], 'large', 'https://rinse.fm', 'London-based underground radio', 'DM presenters'),
  
  ('Soho Radio', 'radio', ARRAY['indie', 'electronic', 'soul'], ARRAY['eclectic'], 'medium', 'https://sohoradiolondon.com', 'Independent London radio', 'Email music team'),
  ('Worldwide FM', 'radio', ARRAY['world', 'jazz', 'electronic'], ARRAY['global', 'eclectic'], 'medium', 'https://worldwidefm.net', 'Gilles Peterson''s radio station', 'Submit to shows'),
  ('The Lot Radio', 'radio', ARRAY['electronic', 'experimental'], ARRAY['underground'], 'medium', 'https://thelotradio.com', 'Brooklyn community radio', 'Contact via Instagram'),
  ('dublab', 'radio', ARRAY['electronic', 'experimental', 'jazz'], ARRAY['eclectic'], 'medium', 'https://dublab.com', 'Non-profit web radio', 'Email submissions'),
  ('Balamii', 'radio', ARRAY['electronic', 'grime', 'garage'], ARRAY['underground'], 'medium', 'https://balamii.com', 'East London community radio', 'Contact show hosts'),
  
  -- PRESS / CURATORS
  ('SubmitHub', 'curator', ARRAY['all'], ARRAY[], 'huge', 'https://www.submithub.com', 'Music submission platform', 'Create account and submit'),
  ('Musosoup', 'curator', ARRAY['all'], ARRAY[], 'large', 'https://musosoup.com', 'Music promotion platform', 'Free and paid campaigns'),
  ('Playlist Push', 'curator', ARRAY['all'], ARRAY[], 'large', 'https://playlistpush.com', 'Playlist pitching service', 'Paid service'),
  ('Daily Playlists', 'curator', ARRAY['all'], ARRAY[], 'medium', 'https://www.daily-playlists.com', 'Independent playlist network', 'Submit via website'),
  ('iMusician', 'curator', ARRAY['all'], ARRAY[], 'medium', 'https://imusician.pro', 'Distribution with playlist pitching', 'Via distribution service'),
  
  -- NICHE GENRES
  ('Hypebeast Music', 'blog', ARRAY['hip-hop', 'electronic', 'experimental'], ARRAY['cutting-edge'], 'huge', 'https://hypebeast.com/music', 'Culture and music coverage', 'Via PR agencies'),
  ('Resident Advisor', 'blog', ARRAY['techno', 'house', 'electronic'], ARRAY[], 'huge', 'https://ra.co', 'Electronic music magazine', 'Submit events and music'),
  ('Pitchfork', 'blog', ARRAY['indie', 'rock', 'electronic', 'hip-hop'], ARRAY[], 'huge', 'https://pitchfork.com', 'Music journalism and reviews', 'Closed submissions'),
  ('KEXP', 'radio', ARRAY['indie', 'rock', 'world'], ARRAY['eclectic'], 'huge', 'https://kexp.org', 'Seattle public radio', 'Submit via form'),
  ('Colors', 'curator', ARRAY['soul', 'rnb', 'indie'], ARRAY['aesthetic'], 'huge', 'https://colors.show', 'Aesthetic music platform', 'Apply for show'),
  
  -- REGIONAL
  ('For The Rabbits', 'blog', ARRAY['indie', 'folk', 'acoustic'], ARRAY['intimate'], 'medium', 'https://fortherabbits.net', 'Independent music blog', 'Email submissions'),
  ('All Things Go', 'blog', ARRAY['indie', 'pop', 'electronic'], ARRAY[], 'large', 'https://allthingsgomusic.com', 'Music blog and festival', 'Submit via contact'),
  ('Pigeons & Planes', 'blog', ARRAY['hip-hop', 'electronic', 'indie'], ARRAY['forward-thinking'], 'huge', 'https://pigeonsandplanes.com', 'Music and culture site', 'Via PR'),
  ('The FADER', 'blog', ARRAY['hip-hop', 'rnb', 'electronic'], ARRAY[], 'huge', 'https://www.thefader.com', 'Music and culture magazine', 'Via management/PR'),
  ('Crack Magazine', 'blog', ARRAY['electronic', 'experimental', 'indie'], ARRAY['underground'], 'large', 'https://crackmagazine.net', 'UK music and culture', 'Email submissions'),
  
  -- COMMUNITY / PLAYLIST CURATORS
  ('Indie Folk Central', 'playlist', ARRAY['folk', 'indie', 'acoustic'], ARRAY['warm', 'organic'], 'large', 'https://open.spotify.com/playlist/example11', 'Independent folk playlist curator', 'SubmitHub'),
  ('Chill Nation', 'playlist', ARRAY['electronic', 'chill'], ARRAY['relaxed', 'mellow'], 'huge', 'https://open.spotify.com/playlist/example12', 'Massive chill electronic playlist', 'Closed submissions'),
  ('alexrainbirdMusic', 'playlist', ARRAY['indie', 'folk'], ARRAY['acoustic', 'indie'], 'large', 'https://open.spotify.com/playlist/example13', 'YouTube and Spotify curator', 'Email submissions')
on conflict do nothing;
