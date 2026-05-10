/**
 * The 47 items in the Indie Release Pre-Flight Checklist.
 * Free no-signup tool. Hubs to free totalaud.io workspace at the end.
 *
 * Voice: calm, indulgent, anti-hype. UK spelling. No em-dashes anywhere.
 * Each item has a one-line "why" that makes the check feel like advice
 * from someone who has shipped a release before, not a content farm.
 */

export type Phase = 'assets' | 'press' | 'platforms' | 'release-day'

export type ChecklistItem = {
  id: string
  phase: Phase
  weekOffset: string
  title: string
  why: string
  estMinutes: number
}

export const phases: Array<{ id: Phase; label: string; weekOffset: string; intro: string }> = [
  {
    id: 'assets',
    label: 'Asset readiness',
    weekOffset: 'Week minus-4',
    intro:
      'Four weeks before drop. The work that takes longest. Get the masters, the artwork, and the press kit settled now so the next three weeks can be about contacts, not about chasing files.',
  },
  {
    id: 'press',
    label: 'Press readiness',
    weekOffset: 'Week minus-3',
    intro:
      'Three weeks out. Press needs lead time. Pitches sent later than this week start to look like an afterthought, even when the music is the headline.',
  },
  {
    id: 'platforms',
    label: 'Platforms and pre-save',
    weekOffset: 'Week minus-2',
    intro:
      'Two weeks out. Spotify pitching closes seven days before release date. Apple Music likes seven days too. Pre-save campaigns peak in the last fortnight, not the last 48 hours.',
  },
  {
    id: 'release-day',
    label: 'Drop day and the fortnight after',
    weekOffset: 'Week zero plus 2',
    intro:
      'Release day and the fortnight that follows. Most artists go quiet here. The momentum work is the work most missed. Ten of these items happen after the song is already out.',
  },
]

export const items: ChecklistItem[] = [
  // Phase 1: Asset readiness (week minus-4)
  {
    id: 'a1',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Final masters delivered, in the right format',
    why: 'Distributors want WAV 16/44.1 or 24/48. Some want both. Find out what yours wants this week, not the week of release.',
    estMinutes: 30,
  },
  {
    id: 'a2',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'ISRC code assigned (one per track)',
    why: 'Issued by your distributor or your collection society. Without it, no royalty tracking, no airplay reporting.',
    estMinutes: 15,
  },
  {
    id: 'a3',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'UPC code assigned to the release as a whole',
    why: 'Single, EP, or album. The barcode that ties tracks together. Distributor issues it.',
    estMinutes: 5,
  },
  {
    id: 'a4',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Cover art final and squared',
    why: '3000x3000 pixels minimum, RGB, no transparent layers, no text smaller than 30 pixels at output size.',
    estMinutes: 60,
  },
  {
    id: 'a5',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Promo photos shot, three usable variants',
    why: 'Press, socials, streaming canvas. One landscape, one portrait, one square. All from the same session if possible.',
    estMinutes: 240,
  },
  {
    id: 'a6',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Photo credit confirmed in writing',
    why: 'Photographers want their name in the press release. Sort the credit and the licence terms now.',
    estMinutes: 10,
  },
  {
    id: 'a7',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Lyrics typed, proofread, ready for streaming services',
    why: 'Spotify and Apple Music both display lyrics. Submit them in plain text, accurate, line breaks where you mean them.',
    estMinutes: 45,
  },
  {
    id: 'a8',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Track titles agreed and consistent across distributor, masters, and lyrics',
    why: 'Capitalisation matters. "(feat. Artist)" or "(Feat. Artist)" should match across every system.',
    estMinutes: 15,
  },
  {
    id: 'a9',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Featured artists credited correctly with metadata',
    why: 'Featured-artist splits affect their streaming dashboard, their playlist eligibility, and their pay. Not optional.',
    estMinutes: 20,
  },
  {
    id: 'a10',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Splits agreed with all collaborators in writing',
    why: 'Even an email saying "I get 50%, you get 50%" beats a verbal handshake. Worth doing before the cheques arrive.',
    estMinutes: 30,
  },
  {
    id: 'a11',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'PRS or equivalent collection society notified about the new work',
    why: 'Royalties only flow if the work is registered. UK songwriters: PRS for Music. US: ASCAP, BMI, SESAC.',
    estMinutes: 30,
  },
  {
    id: 'a12',
    phase: 'assets',
    weekOffset: 'minus-4',
    title: 'Distributor upload completed at least 21 days ahead of release date',
    why: 'Three weeks gives Spotify Editorial time to find the track via Spotify for Artists. Less and you miss the pitch window.',
    estMinutes: 30,
  },

  // Phase 2: Press readiness (week minus-3)
  {
    id: 'p1',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Press release written, one page, scannable',
    why: 'Two paragraphs of context, a who-where-when block, a quote from the artist, contact details. No more than 350 words.',
    estMinutes: 90,
  },
  {
    id: 'p2',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Three RIYL artists picked carefully',
    why: '"Recommended if you like" anchors the pitch. Three is the sweet spot. Two is thin, four is unfocused.',
    estMinutes: 20,
  },
  {
    id: 'p3',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'One-sheet drafted with cover, RIYL, key facts, contact',
    why: 'A one-sheet is what a curator skims for thirty seconds. Put the most useful information in the top quarter.',
    estMinutes: 60,
  },
  {
    id: 'p4',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Bio updated to reflect the new release',
    why: 'Long bio for press, short bio for socials, micro-bio for streaming profiles. All three need a refresh now.',
    estMinutes: 45,
  },
  {
    id: 'p5',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Press list assembled, named contacts where possible',
    why: 'Generic "info@" inboxes almost never reply. Named contacts at outlets you can credibly land in are the only worthwhile pitches.',
    estMinutes: 120,
  },
  {
    id: 'p6',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Tier-one press pitched first, with embargo if exclusive',
    why: 'Exclusives get the lead from the bigger outlets. Tier-two waits a week so they can credit the tier-one piece.',
    estMinutes: 60,
  },
  {
    id: 'p7',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Tier-two press pitched five days after tier-one with no embargo',
    why: 'Tier-two outlets value the credit chain. Pitch the same week as the tier-one piece breaks.',
    estMinutes: 90,
  },
  {
    id: 'p8',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Radio plugger briefed, station list confirmed',
    why: 'Radio works on a different timeline. UK plugger needs the music three weeks before release at the latest.',
    estMinutes: 30,
  },
  {
    id: 'p9',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Radio edit prepared if the album version is over four minutes',
    why: 'Daytime radio rarely plays anything over 3:45. A clean radio edit doubles your chances of a daytime spin.',
    estMinutes: 60,
  },
  {
    id: 'p10',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Press kit hosted publicly with a permanent link',
    why: 'A Drive folder set to "anyone with the link" is fine. Update the link after release with the live streaming URLs.',
    estMinutes: 30,
  },
  {
    id: 'p11',
    phase: 'press',
    weekOffset: 'minus-3',
    title: 'Quotes lined up from collaborators, mixers, mastering engineers',
    why: 'Press releases land better with one external voice. A producer or mastering engineer quote sells the artistry.',
    estMinutes: 30,
  },

  // Phase 3: Platforms and pre-save (week minus-2)
  {
    id: 's1',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Spotify for Artists pitch submitted, minimum seven days ahead',
    why: 'Spotify Editorial sees fresh tracks via S4A pitches. Submit at least a week before release with three carefully-chosen genre tags.',
    estMinutes: 30,
  },
  {
    id: 's2',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Apple Music pitch submitted via Apple for Artists',
    why: 'Apple Music editorial responds to AfA pitches. Long-form context block matters more than at Spotify.',
    estMinutes: 30,
  },
  {
    id: 's3',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Amazon Music for Artists submission completed',
    why: 'Smaller catalogue but real placements. Worth a 15-minute pitch.',
    estMinutes: 15,
  },
  {
    id: 's4',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'YouTube Music asset linked from artist channel',
    why: 'YouTube Music auto-generates from your distributor. Make sure the artist topic page connects to your real channel.',
    estMinutes: 15,
  },
  {
    id: 's5',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Pre-save campaign live and shareable',
    why: 'Linkfire, Feature.fm, ToneDen. Pick one, set it up once, paste the link everywhere from now until drop day.',
    estMinutes: 45,
  },
  {
    id: 's6',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Streaming canvas (vertical video loop) uploaded to Spotify',
    why: 'Eight-second loop, 9:16 portrait, no text. Spotify Canvas drives 145 percent more saves on average.',
    estMinutes: 60,
  },
  {
    id: 's7',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Bandcamp page configured if you sell direct',
    why: 'Vinyl, lossless audio, merch bundle. Bandcamp converts ten times what Spotify does for the artists who use it well.',
    estMinutes: 60,
  },
  {
    id: 's8',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Smart link service set up (Linkfire, Feature.fm, or self-hosted)',
    why: 'A single shareable URL that routes to every streaming platform. Use this everywhere instead of platform-specific links.',
    estMinutes: 30,
  },
  {
    id: 's9',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Curator outreach started for independent playlists',
    why: 'IndieMono, IndieFolk, the lo-fi networks. Each has a submission route. Validate the curators first via spotcheck.cc.',
    estMinutes: 120,
  },
  {
    id: 's10',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'TikTok and Instagram teaser content scheduled',
    why: 'Three teaser posts in the last two weeks before release. One snippet, one process clip, one personal post.',
    estMinutes: 90,
  },
  {
    id: 's11',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Email list warmed with one personal note',
    why: 'A one-line email to your existing list saying "new music in two weeks, here is why this one matters" doubles open rate on the release-day email.',
    estMinutes: 20,
  },
  {
    id: 's12',
    phase: 'platforms',
    weekOffset: 'minus-2',
    title: 'Sync agency or library notified if you have one',
    why: 'Sync placements need lead time. Two weeks before release is the latest window for inclusion in current TV and ad pitches.',
    estMinutes: 15,
  },

  // Phase 4: Release day and the fortnight after
  {
    id: 'r1',
    phase: 'release-day',
    weekOffset: '0',
    title: 'Release day social posts scheduled the night before',
    why: "Don't wake up to schedule socials. Set them the night before so the morning is calm.",
    estMinutes: 30,
  },
  {
    id: 'r2',
    phase: 'release-day',
    weekOffset: '0',
    title: 'Email to your list goes out within the first three hours of release',
    why: 'Open rates peak at 7am-10am local time. A 2pm send loses 40 percent of the opens.',
    estMinutes: 15,
  },
  {
    id: 'r3',
    phase: 'release-day',
    weekOffset: '0',
    title: 'Personally message ten people who specifically asked about the release',
    why: 'The DM-from-the-artist-themselves moment is the most underrated tactic. Ten genuine messages outperform a thousand-impression post.',
    estMinutes: 60,
  },
  {
    id: 'r4',
    phase: 'release-day',
    weekOffset: '0',
    title: 'Streaming platform links live and tested in incognito',
    why: 'Test in a clean browser, not yours. Cached redirects can mask broken links you only discover when a fan complains.',
    estMinutes: 15,
  },
  {
    id: 'r5',
    phase: 'release-day',
    weekOffset: '+1',
    title: 'Day-one Spotify analytics screenshotted at end of release day',
    why: 'Save the chart for two reasons: it tells the press story for the next pitch, and it teaches you what worked next time.',
    estMinutes: 5,
  },
  {
    id: 'r6',
    phase: 'release-day',
    weekOffset: '+3',
    title: 'Three days in, post the best moment of the rollout',
    why: 'A surprising review, a kind DM, a chart entry. The mid-week post that says "this happened, thank you" extends the cycle by a week.',
    estMinutes: 20,
  },
  {
    id: 'r7',
    phase: 'release-day',
    weekOffset: '+5',
    title: 'Week-one numbers archived in a private doc',
    why: 'Spotify monthly listeners, top cities, top playlists, top tracks. Keep the snapshot. Compare it next release.',
    estMinutes: 15,
  },
  {
    id: 'r8',
    phase: 'release-day',
    weekOffset: '+7',
    title: 'Week-one post-mortem written, even just for yourself',
    why: 'What worked, what missed, what surprised you. Twenty minutes now saves twenty hours of repeating mistakes on the next release.',
    estMinutes: 20,
  },
  {
    id: 'r9',
    phase: 'release-day',
    weekOffset: '+10',
    title: 'Tier-three and long-tail outlets pitched ten days post-release',
    why: 'Niche blogs, regional radio, podcasts. They prefer a release that is already proving itself. The "just released" pitch is for tier-one only.',
    estMinutes: 90,
  },
  {
    id: 'r10',
    phase: 'release-day',
    weekOffset: '+14',
    title: 'Two-week post-release wave: one new piece of content, one new outreach round',
    why: "Fortnight in. A behind-the-scenes video, an alternative version, a remix tease. Outreach to anyone who didn't reply the first time.",
    estMinutes: 120,
  },
  {
    id: 'r11',
    phase: 'release-day',
    weekOffset: '+14',
    title: 'Calendar the next release brief for the same fortnight next quarter',
    why: 'Releases compound when they cluster. Two months between releases, not six. Block the planning time on the calendar now.',
    estMinutes: 10,
  },
  {
    id: 'r12',
    phase: 'release-day',
    weekOffset: '+14',
    title: 'Thank everyone publicly, by name where possible',
    why: "The feature, the play, the playlist add, the kind word. The thanks-by-name post is the one most artists never write. It builds the next release's relationships.",
    estMinutes: 30,
  },
]

export function itemsByPhase(phase: Phase) {
  return items.filter((i) => i.phase === phase)
}

export const totalItems = items.length
export const totalEstMinutes = items.reduce((sum, i) => sum + i.estMinutes, 0)
