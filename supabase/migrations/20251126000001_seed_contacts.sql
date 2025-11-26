-- Seed UK Music Industry Contacts
-- Phase 4: Initial contact database for Scout discovery
-- Created: 2025-11-26

-- ============================================
-- PLAYLIST CURATORS
-- ============================================

INSERT INTO public.contacts (name, type, email, submission_url, genres, region, verified, source, notes) VALUES
  ('Indie Electronica', 'playlist', 'submissions@indieelectronica.com', NULL, ARRAY['Electronic', 'Indie', 'Alternative'], 'UK', true, 'manual', 'Active Spotify curator with 50k+ followers'),
  ('Late Night Vibes', 'playlist', NULL, 'https://submithub.com/latenightvibes', ARRAY['Chill', 'Electronic', 'R&B'], 'UK', true, 'manual', 'Popular mood playlist, responds within 48 hours'),
  ('UK Underground', 'playlist', 'ukunderground.curator@gmail.com', NULL, ARRAY['Electronic', 'Dance', 'UK Garage'], 'UK', true, 'manual', 'Focuses on emerging UK electronic artists'),
  ('Fresh Finds UK', 'playlist', NULL, 'https://dailyplaylists.com/submit', ARRAY['Pop', 'Indie', 'Alternative'], 'UK', true, 'manual', 'Spotify editorial-style playlist'),
  ('Midnight Drive', 'playlist', 'midnightdrive.music@outlook.com', NULL, ARRAY['Electronic', 'Ambient', 'Chill'], 'UK', true, 'manual', 'Late night electronic music'),
  ('London Calling', 'playlist', 'londoncalling@playlistpush.com', NULL, ARRAY['Indie', 'Rock', 'Alternative'], 'UK', true, 'manual', 'UK-focused indie rock'),
  ('Bass Culture', 'playlist', 'bassculture.uk@gmail.com', NULL, ARRAY['Electronic', 'Bass', 'Dubstep', 'Drum & Bass'], 'UK', true, 'manual', 'UK bass music specialist');

-- ============================================
-- MUSIC BLOGS & PRESS
-- ============================================

INSERT INTO public.contacts (name, type, email, submission_url, genres, region, verified, source, notes) VALUES
  ('The Line of Best Fit', 'blog', 'submissions@thelineofbestfit.com', NULL, ARRAY['Indie', 'Alternative', 'Electronic'], 'UK', true, 'manual', 'Major UK music publication, premiere focus'),
  ('Clash Magazine', 'blog', NULL, 'https://clashmusic.com/submit', ARRAY['All genres'], 'UK', true, 'manual', 'Established music magazine since 2004'),
  ('Notion Magazine', 'blog', 'music@notionmag.com', NULL, ARRAY['Pop', 'R&B', 'Hip-Hop'], 'UK', true, 'manual', 'Fashion and music crossover publication'),
  ('DIY Magazine', 'blog', 'new-music@diymagazine.com', NULL, ARRAY['Indie', 'Rock', 'Alternative'], 'UK', true, 'manual', 'Focused on new and emerging artists'),
  ('Wonderland', 'blog', NULL, 'https://wonderland.com/submit', ARRAY['Pop', 'Fashion', 'Culture'], 'UK', true, 'manual', 'Fashion-forward music coverage'),
  ('The Quietus', 'blog', 'submissions@thequietus.com', NULL, ARRAY['Experimental', 'Alternative', 'Electronic'], 'UK', true, 'manual', 'In-depth music journalism'),
  ('Crack Magazine', 'blog', 'music@crackmagazine.net', NULL, ARRAY['Electronic', 'Dance', 'Club'], 'UK', true, 'manual', 'Club culture and electronic focus');

-- ============================================
-- RADIO STATIONS
-- ============================================

INSERT INTO public.contacts (name, type, email, submission_url, genres, region, verified, source, notes) VALUES
  ('BBC Radio 1 - Future Artists', 'radio', 'introducing@bbc.co.uk', NULL, ARRAY['All genres'], 'UK', true, 'manual', 'BBC Introducing pathway to national airplay'),
  ('BBC 6 Music', 'radio', NULL, 'https://www.bbc.co.uk/6music/submit', ARRAY['Alternative', 'Indie', 'Electronic'], 'UK', true, 'manual', 'Alternative music focused BBC station'),
  ('Amazing Radio', 'radio', 'music@amazingradio.com', NULL, ARRAY['Indie', 'Alternative', 'New Music'], 'UK', true, 'manual', 'Dedicated to breaking new artists'),
  ('NTS Radio', 'radio', NULL, 'https://nts.live/submit', ARRAY['Electronic', 'Experimental', 'World'], 'UK', true, 'manual', 'Independent online radio with global reach'),
  ('Rinse FM', 'radio', 'demos@rinse.fm', NULL, ARRAY['Dance', 'Electronic', 'UK Bass'], 'UK', true, 'manual', 'Influential UK underground radio'),
  ('Worldwide FM', 'radio', 'music@worldwidefm.net', NULL, ARRAY['World', 'Electronic', 'Jazz'], 'UK', true, 'manual', 'Gilles Peterson founded station'),
  ('Soho Radio', 'radio', 'submissions@sohoradiolondon.com', NULL, ARRAY['All genres'], 'UK', true, 'manual', 'London community radio');

-- ============================================
-- YOUTUBE CHANNELS
-- ============================================

INSERT INTO public.contacts (name, type, email, submission_url, genres, region, verified, source, notes) VALUES
  ('COLORS', 'youtube', NULL, 'https://colorsxstudios.com/submit', ARRAY['All genres'], 'UK', true, 'manual', 'Iconic A COLORS SHOW format, 1M+ subscribers'),
  ('Mahogany Sessions', 'youtube', 'submissions@mahogany.tv', NULL, ARRAY['Acoustic', 'Indie', 'Folk'], 'UK', true, 'manual', 'Intimate acoustic session videos'),
  ('BBC Music Introducing', 'youtube', 'introducing@bbc.co.uk', NULL, ARRAY['All genres'], 'UK', true, 'manual', 'BBC Introducing YouTube presence'),
  ('Sofar Sounds London', 'youtube', 'london@sofarsounds.com', NULL, ARRAY['Indie', 'Folk', 'Singer-Songwriter'], 'UK', true, 'manual', 'Intimate gig series with video'),
  ('The Boiler Room', 'youtube', NULL, 'https://boilerroom.tv/submit', ARRAY['Electronic', 'Dance', 'DJ'], 'UK', true, 'manual', 'Live DJ sets and electronic music');

-- ============================================
-- PODCASTS
-- ============================================

INSERT INTO public.contacts (name, type, email, submission_url, genres, region, verified, source, notes) VALUES
  ('Song Exploder', 'podcast', 'submissions@songexploder.net', NULL, ARRAY['All genres'], 'Global', true, 'manual', 'Deep dives into song creation process'),
  ('Broken Record', 'podcast', NULL, 'https://brokenrecordpodcast.com/contact', ARRAY['All genres'], 'Global', true, 'manual', 'Rick Rubin, Malcolm Gladwell interviews'),
  ('Tape Notes', 'podcast', 'hello@tapenotes.co.uk', NULL, ARRAY['Production', 'Recording'], 'UK', true, 'manual', 'UK-based music production conversations'),
  ('The First Time', 'podcast', 'thefirsttime@bbc.co.uk', NULL, ARRAY['All genres'], 'UK', true, 'manual', 'BBC Sounds podcast with Matt Everitt'),
  ('DIY Magazine Podcast', 'podcast', 'podcast@diymagazine.com', NULL, ARRAY['Indie', 'Rock', 'Alternative'], 'UK', true, 'manual', 'DIY Magazine companion podcast');
