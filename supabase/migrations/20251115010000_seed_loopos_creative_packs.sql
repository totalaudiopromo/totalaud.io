/**
 * LoopOS Creative Packs Seed Data
 *
 * Seeds initial public creative packs for common campaign types.
 * These serve as templates users can import and customise.
 */

-- Radio Promo Pack
INSERT INTO loopos_creative_packs (
  id,
  name,
  description,
  category,
  is_public,
  author_id,
  template_nodes,
  metadata
) VALUES (
  'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
  'Radio Promo Starter',
  'Essential nodes for securing radio airplay: research stations, pitch contacts, follow up, track results',
  'radio-promo',
  true,
  NULL,
  '[
    {"title": "Research Target Stations", "description": "Identify radio stations matching your genre and audience", "status": "pending"},
    {"title": "Find Station Contacts", "description": "Gather email addresses and submission guidelines", "status": "pending"},
    {"title": "Prepare Press Kit", "description": "Artist bio, track, artwork, streaming links", "status": "pending"},
    {"title": "Send Initial Pitch", "description": "Personalised email to each station contact", "status": "pending"},
    {"title": "Follow Up (1 week)", "description": "Polite check-in with added context", "status": "pending"},
    {"title": "Track Adds & Airplay", "description": "Monitor playlists and request play reports", "status": "pending"}
  ]'::jsonb,
  '{"estimatedDuration": "6 weeks", "difficulty": "intermediate"}'::jsonb
);

-- Release Campaign Pack
INSERT INTO loopos_creative_packs (
  id,
  name,
  description,
  category,
  is_public,
  author_id,
  template_nodes,
  metadata
) VALUES (
  'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7',
  'Single Release Campaign',
  'Complete workflow for independent single release: pre-save, playlist pitch, PR, social content',
  'release-campaign',
  true,
  NULL,
  '[
    {"title": "Set Release Date", "description": "Choose date 6-8 weeks out for proper lead time", "status": "pending"},
    {"title": "Upload to Distributor", "description": "DistroKid, Ditto, TuneCore with metadata", "status": "pending"},
    {"title": "Launch Pre-Save Campaign", "description": "Feature.fm or Spotify pre-save link", "status": "pending"},
    {"title": "Pitch to Playlists", "description": "Submit to editorial and independent curators", "status": "pending"},
    {"title": "Create Social Content", "description": "Teasers, behind-the-scenes, lyric videos", "status": "pending"},
    {"title": "Send to PR Contacts", "description": "Blogs, magazines, influencers", "status": "pending"},
    {"title": "Release Day Push", "description": "Coordinated social posts and email blast", "status": "pending"},
    {"title": "Post-Release Follow-Up", "description": "Thank supporters, share playlist adds, momentum updates", "status": "pending"}
  ]'::jsonb,
  '{"estimatedDuration": "8 weeks", "difficulty": "intermediate"}'::jsonb
);

-- Playlist Push Pack
INSERT INTO loopos_creative_packs (
  id,
  name,
  description,
  category,
  is_public,
  author_id,
  template_nodes,
  metadata
) VALUES (
  'c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8',
  'Playlist Pitching Pro',
  'Systematic approach to Spotify, Apple Music, and independent playlist placements',
  'playlist-push',
  true,
  NULL,
  '[
    {"title": "Research Playlists", "description": "Find playlists in your genre with submission contact info", "status": "pending"},
    {"title": "Prepare Pitch Assets", "description": "Track link, artist bio, previous playlist adds, press quotes", "status": "pending"},
    {"title": "Submit to Spotify Editorial", "description": "Use Spotify for Artists pitch tool 7+ days before release", "status": "pending"},
    {"title": "Pitch Independent Curators", "description": "Email personalised pitches to playlist owners", "status": "pending"},
    {"title": "Follow Up Strategically", "description": "One polite follow-up if no response after 1 week", "status": "pending"},
    {"title": "Track Playlist Adds", "description": "Monitor Spotify for Artists and analytics for new placements", "status": "pending"},
    {"title": "Thank Curators", "description": "Acknowledge playlist adds and build relationships", "status": "pending"}
  ]'::jsonb,
  '{"estimatedDuration": "4 weeks", "difficulty": "beginner"}'::jsonb
);

-- Tour Support Pack
INSERT INTO loopos_creative_packs (
  id,
  name,
  description,
  category,
  is_public,
  author_id,
  template_nodes,
  metadata
) VALUES (
  'd4e5f6g7-h8i9-40j1-k2l3-m4n5o6p7q8r9',
  'Tour Announcement Strategy',
  'Maximise ticket sales with strategic tour announcement and promotion',
  'tour-support',
  true,
  NULL,
  '[
    {"title": "Announce Tour Dates", "description": "Social posts, email newsletter, press release", "status": "pending"},
    {"title": "Pitch to Local Media", "description": "Contact blogs and radio in each tour city", "status": "pending"},
    {"title": "Create Event Pages", "description": "Facebook Events, Bandsintown, Songkick", "status": "pending"},
    {"title": "Run Pre-Sale Campaign", "description": "Fan club or email list exclusive early access", "status": "pending"},
    {"title": "Weekly Promo Content", "description": "Countdown posts, venue previews, fan spotlights", "status": "pending"},
    {"title": "Coordinate Support Act Promo", "description": "Cross-promote with support bands", "status": "pending"},
    {"title": "Final Week Push", "description": "Urgent messaging, limited tickets, FOMO tactics", "status": "pending"}
  ]'::jsonb,
  '{"estimatedDuration": "6 weeks", "difficulty": "advanced"}'::jsonb
);

COMMENT ON TABLE loopos_creative_packs IS 'Seeded with 4 public template packs covering common campaign types';
