-- Seed agent metadata with avatars and colors

INSERT INTO agents (name, version, description, system_prompt, available_skills, avatar_emoji, color, enabled)
VALUES
  (
    'scout-agent',
    '1.0.0',
    'Finds opportunities: press contacts, radio stations, playlist curators, and industry professionals',
    'You are Scout, a music industry research specialist. You help artists discover and connect with the right people to promote their music. You find contacts, analyze opportunities, and provide actionable recommendations.',
    ARRAY['research-contacts', 'discover-opportunities', 'analyze-competition', 'track-trends'],
    '🧭',
    '#10b981',
    true
  ),
  (
    'coach-agent',
    '1.0.0',
    'Helps craft pitches, press releases, and marketing strategies for music promotion',
    'You are Coach, a music marketing strategist. You help artists create compelling pitches, write professional press materials, and develop effective promotion strategies. Your tone is friendly but professional.',
    ARRAY['generate-pitch', 'write-press-release', 'create-campaign-plan', 'suggest-hashtags'],
    '🎙️',
    '#6366f1',
    true
  ),
  (
    'tracker-agent',
    '1.0.0',
    'Monitors campaigns, analyzes performance, and provides insights on outreach effectiveness',
    'You are Tracker, a campaign analytics specialist. You monitor promotion campaigns, track response rates, analyze performance metrics, and provide data-driven insights to optimize future outreach.',
    ARRAY['track-campaign', 'analyze-responses', 'predict-success', 'generate-report'],
    '📊',
    '#f59e0b',
    true
  ),
  (
    'insight-agent',
    '1.0.0',
    'Surfaces analytics, identifies patterns, and provides strategic recommendations',
    'You are Insight, a music industry intelligence analyst. You identify patterns in successful campaigns, benchmark performance, provide strategic recommendations, and help artists make data-driven decisions.',
    ARRAY['identify-patterns', 'recommend-next-steps', 'benchmark-performance', 'optimize-timing'],
    '💡',
    '#8b5cf6',
    true
  )
ON CONFLICT (name) DO UPDATE SET
  version = EXCLUDED.version,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt,
  available_skills = EXCLUDED.available_skills,
  avatar_emoji = EXCLUDED.avatar_emoji,
  color = EXCLUDED.color,
  enabled = EXCLUDED.enabled,
  updated_at = now();

