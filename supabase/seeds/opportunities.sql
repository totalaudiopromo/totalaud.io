-- Starter opportunities for Scout (July 2026).
--
-- A curated set of real, long-standing outlets and platforms independent
-- artists actually use. Kept honest: public submission URLs only, no
-- personal contact emails (relationships live in TAP), and factual
-- submission notes. Genre-agnostic entries carry an empty genres array.
--
-- Data seed, not schema — run manually, not via the migrations directory.
-- Idempotent: skips any name that already exists.

INSERT INTO opportunities
  (name, type, genres, vibes, audience_size, url, description, submission_notes, importance, source, last_verified_at)
SELECT * FROM (VALUES
  -- Radio
  ('BBC Music Introducing', 'radio', '{}'::text[], ARRAY['discovery','grassroots'], 'large',
   'https://www.bbc.co.uk/introducing',
   'The BBC''s route for unsigned and independent artists. Uploads feed local Introducing shows and can step up to national airplay on Radio 1 and 6 Music.',
   'Upload through the BBC Introducing site; aimed at artists with a UK connection.', 95),
  ('Amazing Radio', 'radio', '{}'::text[], ARRAY['discovery','emerging'], 'medium',
   'https://amazingradio.com',
   'UK station that only plays new and emerging music; airplay comes directly from artist uploads.',
   'Upload via amazingtunes to be playable on air.', 70),
  ('KEXP', 'radio', ARRAY['indie','alternative','electronic','experimental'], ARRAY['tastemaker'], 'large',
   'https://www.kexp.org',
   'Listener-supported Seattle station with worldwide reach, known for live in-studio sessions and genuinely open ears.',
   'Music submissions accepted via the KEXP website.', 80),
  ('NTS Radio', 'radio', ARRAY['electronic','experimental','ambient','jazz'], ARRAY['left-field','tastemaker'], 'medium',
   'https://www.nts.live',
   'London-born online radio with hundreds of specialist shows; a natural home for left-field music.',
   'Pitch individual show hosts whose taste fits, rather than the station inbox.', 65),
  ('Soho Radio', 'radio', ARRAY['indie','jazz','electronic'], ARRAY['community'], 'small',
   'https://sohoradiolondon.com',
   'Independent London station broadcasting from Soho with eclectic, presenter-led shows.',
   'Approach individual presenters whose shows fit the record.', 50),

  -- Blogs and press
  ('The Line of Best Fit', 'blog', ARRAY['indie','alternative','pop'], ARRAY['tastemaker','editorial'], 'large',
   'https://www.thelineofbestfit.com',
   'Independent UK online magazine with a long record of championing new artists early.',
   'Read the site first and pitch the section your record actually fits.', 75),
  ('Clash', 'press', ARRAY['indie','pop','electronic','hip-hop'], ARRAY['editorial'], 'large',
   'https://www.clashmusic.com',
   'UK music and fashion magazine covering new music across genres, online and in print.',
   'Pitch editors by email with a clear angle; premieres favour a story.', 70),
  ('DIY', 'press', ARRAY['indie','alternative','rock'], ARRAY['editorial','emerging'], 'medium',
   'https://diymag.com',
   'UK magazine and site with a strong focus on breaking guitar and alternative acts.',
   'Email pitches; their Class Of features look ahead to rising artists.', 65),
  ('Dork', 'press', ARRAY['indie','pop','alternative'], ARRAY['emerging','energetic'], 'medium',
   'https://readdork.com',
   'UK title with an appetite for new pop and indie, in print and online.',
   'Email pitches with streaming links; keep it short.', 60),
  ('Atwood Magazine', 'blog', ARRAY['indie','folk','pop'], ARRAY['storytelling'], 'medium',
   'https://atwoodmagazine.com',
   'Independent publication built around storytelling, essays and premieres.',
   'Rolling submissions inbox; a strong narrative helps more than credits.', 60),
  ('EARMILK', 'blog', ARRAY['electronic','hip-hop','indie'], ARRAY['discovery'], 'medium',
   'https://earmilk.com',
   'Long-running independent blog covering electronic, hip-hop and everything between.',
   'Submissions via the site; genre editors handle their own lanes.', 60),
  ('Under the Radar', 'press', ARRAY['indie','alternative'], ARRAY['editorial'], 'medium',
   'https://www.undertheradarmag.com',
   'US magazine covering independent music in depth, in print since 2001.',
   'Email pitches; strong for interviews and album coverage.', 55),
  ('Loud And Quiet', 'press', ARRAY['indie','alternative','experimental'], ARRAY['editorial','left-field'], 'small',
   'https://www.loudandquiet.com',
   'Independent UK publication with considered, longer-form coverage.',
   'Pitch by email; they favour records with something to say.', 55),
  ('Ones to Watch', 'blog', ARRAY['pop','indie','hip-hop'], ARRAY['emerging'], 'medium',
   'https://www.onestowatch.com',
   'Discovery platform spotlighting rising artists across genres.',
   'Submissions via the site.', 55),
  ('Indie Shuffle', 'blog', ARRAY['indie','electronic'], ARRAY['discovery'], 'medium',
   'https://www.indieshuffle.com',
   'Music discovery blog and app with a long history of surfacing new tracks.',
   'Submit via SubmitHub.', 50),
  ('Bandcamp Daily', 'blog', '{}'::text[], ARRAY['storytelling','editorial'], 'medium',
   'https://daily.bandcamp.com',
   'Bandcamp''s editorial arm: features, lists and scene deep-dives.',
   'Features are pitched rather than submitted; an active Bandcamp presence matters.', 55),

  -- Curators and submission platforms
  ('Fresh On The Net', 'curator', '{}'::text[], ARRAY['community','grassroots'], 'small',
   'https://freshonthenet.co.uk',
   'Tom Robinson''s team listen to every upload; the weekly Listening Post puts five favourites in front of a voting community.',
   'Inbox opens Monday to Thursday; one track per artist per week.', 65),
  ('SubmitHub', 'curator', '{}'::text[], ARRAY['discovery'], 'large',
   'https://www.submithub.com',
   'Marketplace connecting artists with blogs, playlists, radio and labels; paid credits guarantee a listen and a reply.',
   'Check each curator''s approval rate and feedback before spending credits.', 70),
  ('Groover', 'curator', '{}'::text[], ARRAY['discovery'], 'large',
   'https://groover.co',
   'Submission platform where curators, radio and labels commit to replying within seven days.',
   'Pick recipients by genre fit; replies are guaranteed, coverage is not.', 65),
  ('Musosoup', 'curator', '{}'::text[], ARRAY['discovery'], 'medium',
   'https://www.musosoup.com',
   'Platform where curators approach the artist after a track is listed.',
   'Weigh up offers carefully; prioritise genuine editorial coverage.', 50),

  -- Playlists
  ('Spotify editorial playlists', 'playlist', '{}'::text[], ARRAY['editorial'], 'large',
   'https://artists.spotify.com',
   'Editorial consideration through Spotify for Artists; the single pitch also feeds Release Radar.',
   'Pitch at least seven days before release; fill the mood, genre and story fields properly.', 90),
  ('Indiemono', 'playlist', ARRAY['indie','pop','electronic'], ARRAY['community'], 'medium',
   'https://indiemono.com',
   'Independent playlist network with free submissions across many moods and genres.',
   'Submit through the site to the playlist that genuinely fits.', 45),
  ('alexrainbird Music', 'playlist', ARRAY['indie','folk'], ARRAY['storytelling'], 'medium',
   'https://www.alexrainbirdmusic.com',
   'YouTube-based curator whose monthly indie and folk compilations reach a large subscriber base.',
   'Submissions via the website; a small fee applies for a guaranteed listen.', 50)
) AS seed(name, type, genres, vibes, audience_size, url, description, submission_notes, importance)
CROSS JOIN LATERAL (SELECT 'curated'::text, now()) AS meta(source, last_verified_at)
WHERE NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.name = seed.name);
