/**
 * Genre data for pSEO pages
 * Each genre gets its own landing page at /genre/[slug]
 */

export interface GenreData {
  slug: string
  name: string
  title: string
  description: string
  heroText: string
  painPoints: string[]
  opportunities: string[]
  keywords: string[]
}

export const genres: GenreData[] = [
  {
    slug: 'electronic',
    name: 'Electronic',
    title: 'Music Promotion for Electronic Producers',
    description:
      'Scout playlist curators, plan your release, and craft pitches for electronic music. One calm workspace for DJs and producers.',
    heroText: 'Electronic music deserves to be heard',
    painPoints: [
      'Spotify editorial playlists favour mainstream pop over underground electronic',
      'Hard to stand out when 100,000+ tracks drop daily',
      'DJ mag, Resident Advisor, and tastemaker blogs are gatekept',
      'Algorithm changes constantly devalue your catalogue',
    ],
    opportunities: [
      'Spotify algorithmic playlists (Release Radar, Discover Weekly)',
      'SoundCloud repost channels',
      'Beatport charting opportunities',
      'BBC Radio 1 Dance, 6 Music',
      'Mixmag, DJ Mag, Resident Advisor',
      'YouTube music channels (MrSuicideSheep, Trap Nation)',
    ],
    keywords: [
      'electronic music promotion',
      'edm playlist pitching',
      'techno music marketing',
      'house music pr',
      'electronic producer tools',
    ],
  },
  {
    slug: 'hip-hop',
    name: 'Hip-Hop',
    title: 'Music Promotion for Hip-Hop Artists',
    description:
      'Find playlist curators, blogs, and radio contacts for hip-hop. Plan your release campaign and craft authentic pitches.',
    heroText: 'Your bars deserve the right ears',
    painPoints: [
      'Oversaturated market makes breaking through nearly impossible',
      'Pay-to-play playlisting scams waste your budget',
      'Hard to get genuine blog coverage without connections',
      'Radio playlists dominated by major label releases',
    ],
    opportunities: [
      'Spotify RapCaviar, Hip-Hop UK editorial playlists',
      'Apple Music hip-hop curators',
      'BBC Radio 1Xtra, Capital Xtra',
      'Complex, Pigeons & Planes, Lyrical Lemonade',
      'YouTube hip-hop channels',
      'TikTok sound virality',
    ],
    keywords: [
      'hip hop music promotion',
      'rap music marketing',
      'hip hop playlist pitching',
      'rap pr services',
      'hip hop blog submissions',
    ],
  },
  {
    slug: 'indie-rock',
    name: 'Indie Rock',
    title: 'Music Promotion for Indie Rock Bands',
    description:
      'Discover blog contacts, radio opportunities, and playlist curators for indie rock. Plan your release and tell your story.',
    heroText: 'Indie rock still matters',
    painPoints: [
      'Guitar music gets less streaming platform support than pop',
      'Blog landscape has shrunk dramatically since 2010s',
      'Hard to tour profitably as an unknown band',
      'Press coverage requires expensive PR agencies',
    ],
    opportunities: [
      'Spotify New Music Friday UK, Indie Pop editorial',
      'BBC Radio 6 Music, Radio X',
      'DIY Magazine, The Line of Best Fit, Stereogum',
      'KEXP, BBC Introducing',
      'Independent venue circuit',
      'Festival submission opportunities',
    ],
    keywords: [
      'indie rock promotion',
      'indie band marketing',
      'rock music pr',
      'guitar music playlist pitching',
      'indie rock blog submissions',
    ],
  },
  {
    slug: 'rnb-soul',
    name: 'R&B / Soul',
    title: 'Music Promotion for R&B and Soul Artists',
    description:
      'Find curators who champion R&B and soul. Plan your campaign and craft pitches that capture your sound.',
    heroText: 'Soul music deserves to be felt',
    painPoints: [
      'Algorithm favours pop-leaning R&B over pure soul',
      'Hard to find curators who understand the genre',
      'Radio is dominated by crossover hits',
      'Authentic soul gets lost in the shuffle',
    ],
    opportunities: [
      'Spotify R&B UK, Soul Lounge editorial playlists',
      'Apple Music New Music Daily R&B',
      'BBC Radio 1Xtra, Reprezent Radio',
      'SoulBounce, Rated R&B, Soul Tracks',
      'Neo-soul playlist curators',
      'Jazz-adjacent platforms',
    ],
    keywords: [
      'rnb music promotion',
      'soul music marketing',
      'r&b playlist pitching',
      'neo soul pr',
      'rnb blog submissions',
    ],
  },
  {
    slug: 'pop',
    name: 'Pop',
    title: 'Music Promotion for Pop Artists',
    description:
      'Scout playlist curators and radio contacts for pop music. Craft pitches that get you noticed in a crowded market.',
    heroText: 'Pop music built to connect',
    painPoints: [
      'Incredibly competitive market dominated by major labels',
      'Playlist placement feels impossible without connections',
      'Expensive to compete with label marketing budgets',
      'TikTok algorithm is unpredictable',
    ],
    opportunities: [
      "Spotify Today's Top Hits, Pop Rising editorial",
      'Apple Music Pop Riser',
      'BBC Radio 1, Capital FM, Kiss FM',
      'Popjustice, Pop Crave',
      'TikTok sound trends',
      'Instagram Reels audio',
    ],
    keywords: [
      'pop music promotion',
      'pop artist marketing',
      'pop playlist pitching',
      'pop music pr',
      'pop song promotion',
    ],
  },
  {
    slug: 'folk-acoustic',
    name: 'Folk / Acoustic',
    title: 'Music Promotion for Folk and Acoustic Artists',
    description:
      'Find folk radio, playlist curators, and blog contacts. Plan your release with a calm, focused approach.',
    heroText: 'Folk music tells the story',
    painPoints: [
      'Smaller audience than mainstream genres',
      'Hard to find genre-specific curators',
      'Festival circuit is competitive and expensive',
      'Radio options are limited outside BBC Radio 2',
    ],
    opportunities: [
      'Spotify Fresh Folk, Acoustic Hits editorial',
      'BBC Radio 2, BBC Radio Scotland',
      'Folk Radio UK, fRoots Magazine',
      'Cambridge Folk Festival, Cropredy',
      'Americana UK, No Depression',
      'House concert networks',
    ],
    keywords: [
      'folk music promotion',
      'acoustic music marketing',
      'folk playlist pitching',
      'singer songwriter pr',
      'folk blog submissions',
    ],
  },
  {
    slug: 'alternative',
    name: 'Alternative',
    title: 'Music Promotion for Alternative Artists',
    description:
      'Scout curators who champion alternative sounds. Plan your release and craft pitches that stand out.',
    heroText: 'Alternative never follows the crowd',
    painPoints: [
      'Too experimental for pop, too accessible for underground',
      'Genre-fluid sound is hard to pitch',
      'Playlists favour clearly defined genres',
      'Press coverage requires clear narrative',
    ],
    opportunities: [
      'Spotify All New Indie, Alternative Hits editorial',
      'BBC Radio 6 Music, Radio X',
      'NME, The Quietus, Clash Magazine',
      'SXSW, The Great Escape, Eurosonic',
      'College radio stations',
      'Music blogs with eclectic taste',
    ],
    keywords: [
      'alternative music promotion',
      'alt rock marketing',
      'alternative playlist pitching',
      'indie alternative pr',
      'alt music blog submissions',
    ],
  },
  {
    slug: 'jazz',
    name: 'Jazz',
    title: 'Music Promotion for Jazz Musicians',
    description:
      'Find jazz radio contacts, playlist curators, and press opportunities. Plan your release with care.',
    heroText: 'Jazz demands to be heard',
    painPoints: [
      "Streaming economy doesn't value longer compositions",
      'Niche audience is harder to reach at scale',
      'Jazz press is specialised and gatekept',
      'Live performance is essential but touring is expensive',
    ],
    opportunities: [
      'Spotify State of Jazz, Jazz UK editorial',
      'Apple Music Jazz playlist',
      'BBC Radio 3, Jazz FM',
      'Jazzwise, All About Jazz, London Jazz News',
      'Jazz festivals (London Jazz Festival, Manchester Jazz)',
      'Blue Note, ACT, Edition Records',
    ],
    keywords: [
      'jazz music promotion',
      'jazz musician marketing',
      'jazz playlist pitching',
      'jazz pr services',
      'jazz blog submissions',
    ],
  },
  {
    slug: 'metal',
    name: 'Metal',
    title: 'Music Promotion for Metal Bands',
    description:
      'Scout metal blogs, radio, and playlist curators. Plan your release and craft pitches that resonate with the scene.',
    heroText: 'Metal never dies',
    painPoints: [
      "Streaming platforms don't prioritise heavy music",
      'Mainstream press ignores metal',
      'Genre is fragmented into many subgenres',
      'Touring is essential but financially challenging',
    ],
    opportunities: [
      'Spotify New Metal Tracks, Metal UK editorial',
      'Apple Music Heavy Rotation',
      'BBC Radio 1 Rock Show, Kerrang Radio',
      'Metal Hammer, Kerrang!, Blabbermouth',
      'Bloodstock, Download Festival',
      'Metal Injection, Metal Sucks',
    ],
    keywords: [
      'metal music promotion',
      'heavy metal marketing',
      'metal playlist pitching',
      'rock metal pr',
      'metal blog submissions',
    ],
  },
  {
    slug: 'singer-songwriter',
    name: 'Singer-Songwriter',
    title: 'Music Promotion for Singer-Songwriters',
    description:
      'Find curators who champion singer-songwriters. Plan your release and craft authentic pitches.',
    heroText: 'Your songs deserve to be heard',
    painPoints: [
      'Solo artists compete with full bands for attention',
      'Hard to stand out with just voice and guitar',
      'Storytelling gets lost in algorithm-driven playlists',
      'Need strong narrative to cut through noise',
    ],
    opportunities: [
      'Spotify Singer-Songwriter, Acoustic New Music editorial',
      'BBC Radio 2, BBC Introducing',
      'Acoustic Magazine, Americana UK',
      'Sofar Sounds performances',
      'Sync licensing for film/TV',
      'Patreon and direct fan support',
    ],
    keywords: [
      'singer songwriter promotion',
      'solo artist marketing',
      'acoustic music pitching',
      'songwriter pr',
      'singer songwriter blog submissions',
    ],
  },
]

export function getGenreBySlug(slug: string): GenreData | undefined {
  return genres.find((g) => g.slug === slug)
}

export function getAllGenreSlugs(): string[] {
  return genres.map((g) => g.slug)
}
