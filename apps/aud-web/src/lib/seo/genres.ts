/**
 * Genre data for pSEO pages
 * Each genre gets its own landing page at /genre/[slug]
 *
 * Total: 30 genres covering major and niche markets
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
  // === ELECTRONIC & DANCE ===
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
    slug: 'house',
    name: 'House',
    title: 'Music Promotion for House Music Producers',
    description:
      'Find house music playlist curators, radio contacts, and blog opportunities. Plan your release campaign with a focused approach.',
    heroText: 'House music built for the dancefloor',
    painPoints: [
      'Subgenre fragmentation makes targeting difficult',
      'Club culture gatekeepers are hard to reach',
      'Streaming metrics undervalue DJ-focused tracks',
      'Beatport vs Spotify strategy requires different approaches',
    ],
    opportunities: [
      'Beatport Hype Charts',
      'Spotify House Party, Deep House Relax playlists',
      'BBC Radio 1 Dance Anthems',
      'Defected Records playlist network',
      'Mixmag, DJ Mag features',
      'Traxsource promotional tools',
    ],
    keywords: [
      'house music promotion',
      'deep house marketing',
      'tech house playlist pitching',
      'house music pr uk',
      'house producer promotion',
    ],
  },
  {
    slug: 'techno',
    name: 'Techno',
    title: 'Music Promotion for Techno Producers',
    description:
      'Scout techno-focused curators and labels. Navigate the underground scene with contacts that understand your sound.',
    heroText: 'Techno demands to be felt',
    painPoints: [
      'Underground ethos clashes with mainstream marketing',
      'Algorithm favours shorter, poppier tracks',
      'Label gatekeeping is intense',
      'Berlin-centric scene can feel exclusionary',
    ],
    opportunities: [
      'Beatport Techno charts',
      'Resident Advisor features and RA Exchange',
      'Spotify Techno Bunker, Techno Train playlists',
      'BBC Radio 1 Essential Mix',
      'Dekmantel, Berghain-adjacent press',
      'XLR8R, Electronic Beats coverage',
    ],
    keywords: [
      'techno music promotion',
      'techno producer marketing',
      'berlin techno pr',
      'techno playlist pitching',
      'underground techno promotion',
    ],
  },
  {
    slug: 'drum-and-bass',
    name: 'Drum & Bass',
    title: 'Music Promotion for Drum & Bass Producers',
    description:
      'Find DnB curators, radio shows, and label contacts. Plan your release for the bass music community.',
    heroText: 'Drum & bass hits different',
    painPoints: [
      'Niche audience limits mainstream crossover',
      'Label system is highly competitive',
      'Radio play concentrated on specialist shows',
      'Streaming algorithms struggle with 170+ BPM',
    ],
    opportunities: [
      'BBC Radio 1 DnB show (Rene LaVice)',
      'Hospital Records playlist network',
      'UKF YouTube channel',
      'Spotify Drum and Bass Hits',
      'Rinse FM, Reprezent Radio',
      'Raver Magazine, Data Transmission',
    ],
    keywords: [
      'drum and bass promotion',
      'dnb music marketing',
      'jungle music pr',
      'drum bass playlist pitching',
      'dnb producer promotion',
    ],
  },
  {
    slug: 'ambient',
    name: 'Ambient',
    title: 'Music Promotion for Ambient Artists',
    description:
      'Connect with ambient music curators and blogs. Find listeners who appreciate atmospheric, textural soundscapes.',
    heroText: 'Ambient music creates space',
    painPoints: [
      'Long-form compositions conflict with streaming metrics',
      'Niche audience requires targeted outreach',
      'Playlisting favours background music over art',
      'Press coverage is limited to specialist outlets',
    ],
    opportunities: [
      'Spotify Ambient Relaxation, Deep Focus playlists',
      'Bandcamp ambient community',
      'BBC Radio 3 Late Junction',
      'Headphone Commute, A Closer Listen blogs',
      'Kranky, Room40, 12k label networks',
      'Sync licensing for film and meditation apps',
    ],
    keywords: [
      'ambient music promotion',
      'ambient electronic marketing',
      'atmospheric music pr',
      'ambient playlist pitching',
      'ambient producer tools',
    ],
  },

  // === HIP-HOP & RAP ===
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
    slug: 'grime',
    name: 'Grime',
    title: 'Music Promotion for Grime Artists',
    description:
      'Navigate the UK grime scene with targeted contacts. Find radio, playlist, and blog opportunities that champion the culture.',
    heroText: 'Grime is a UK institution',
    painPoints: [
      'Scene is tight-knit and hard to break into',
      'International exposure limited compared to US rap',
      'Radio support concentrated on few shows',
      'Authenticity gatekeeping can exclude newcomers',
    ],
    opportunities: [
      'BBC Radio 1Xtra grime shows',
      'Rinse FM, NTS Radio',
      'Spotify Grime Shutdown playlist',
      'GRM Daily, Link Up TV',
      'SBTV, JDZ Media',
      'Clash Magazine, Complex UK',
    ],
    keywords: [
      'grime music promotion',
      'grime artist marketing',
      'uk grime playlist pitching',
      'grime pr services',
      'grime blog submissions',
    ],
  },
  {
    slug: 'uk-rap',
    name: 'UK Rap',
    title: 'Music Promotion for UK Rap Artists',
    description:
      'Find UK-focused rap curators, blogs, and radio contacts. Build your campaign for the British hip-hop scene.',
    heroText: 'UK rap is having its moment',
    painPoints: [
      'Competing with US dominance in hip-hop',
      'Algorithm groups UK rap with US content',
      'Press coverage favours established names',
      'Playlist placement highly competitive',
    ],
    opportunities: [
      'Spotify UK Rap playlists',
      'BBC Radio 1Xtra, Capital Xtra',
      'GRM Daily, Link Up TV, Mixtape Madness',
      'Complex UK, Notion Magazine',
      'MOBO Awards visibility',
      'Festival slots (Wireless, Parklife)',
    ],
    keywords: [
      'uk rap promotion',
      'british hip hop marketing',
      'uk rap playlist pitching',
      'uk rap pr services',
      'british rap blog submissions',
    ],
  },

  // === ROCK & GUITAR ===
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
    slug: 'punk',
    name: 'Punk',
    title: 'Music Promotion for Punk Bands',
    description:
      'Find punk-friendly blogs, radio, and playlist curators. Navigate the DIY scene with authentic promotion.',
    heroText: 'Punk is alive and kicking',
    painPoints: [
      'DIY ethos conflicts with promotional needs',
      'Mainstream platforms underserve punk',
      'Scene is fragmented by subgenre',
      'Blog coverage limited to specialist outlets',
    ],
    opportunities: [
      'Spotify Punk Unleashed, Pop Punk Powerhouses',
      'BBC Radio 1 Rock Show',
      'Punktastic, Punktuation Magazine',
      'DIY Magazine, The Line of Best Fit',
      'Slam Dunk, Download Festival',
      'Independent punk labels and zines',
    ],
    keywords: [
      'punk music promotion',
      'punk band marketing',
      'punk playlist pitching',
      'punk rock pr',
      'punk blog submissions',
    ],
  },
  {
    slug: 'post-punk',
    name: 'Post-Punk',
    title: 'Music Promotion for Post-Punk Artists',
    description:
      'Connect with post-punk curators and blogs. Find listeners who appreciate angular guitars and dark atmospheres.',
    heroText: 'Post-punk is having a revival',
    painPoints: [
      'Niche audience requires targeted outreach',
      'Genre revival means increased competition',
      'Press gatekeeping favours established names',
      'Algorithm struggles with genre classification',
    ],
    opportunities: [
      'Spotify New Noise, All New Indie playlists',
      'BBC Radio 6 Music',
      'The Quietus, Loud and Quiet',
      'So Young Magazine, DIY Magazine',
      'The Great Escape, Eurosonic',
      'Post-punk revival blog network',
    ],
    keywords: [
      'post punk promotion',
      'post punk marketing',
      'darkwave music pr',
      'post punk playlist pitching',
      'post punk blog submissions',
    ],
  },

  // === POP & MAINSTREAM ===
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
    slug: 'synth-pop',
    name: 'Synth-Pop',
    title: 'Music Promotion for Synth-Pop Artists',
    description:
      'Find synth-pop curators and blogs. Connect with audiences who love analogue synths and 80s-inspired sounds.',
    heroText: 'Synth-pop bridges decades',
    painPoints: [
      'Caught between pop and electronic categorisation',
      'Retro aesthetic can limit perception',
      'Press coverage limited to specialist outlets',
      'Algorithm placement inconsistent',
    ],
    opportunities: [
      'Spotify Synthwave, Retro Electro playlists',
      'BBC Radio 6 Music',
      'Electronic Sound Magazine',
      'Synth History, When The Sun Hits blogs',
      'Synthwave/retrowave community',
      'Sync licensing for TV and film',
    ],
    keywords: [
      'synth pop promotion',
      'synthwave marketing',
      'electropop pr',
      'synth pop playlist pitching',
      'synthwave blog submissions',
    ],
  },

  // === R&B & SOUL ===
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
    slug: 'neo-soul',
    name: 'Neo-Soul',
    title: 'Music Promotion for Neo-Soul Artists',
    description:
      'Connect with neo-soul curators and blogs. Find listeners who appreciate organic, jazz-influenced R&B.',
    heroText: 'Neo-soul feeds the spirit',
    painPoints: [
      'Niche audience requires targeted outreach',
      'Algorithm groups with mainstream R&B',
      'Live performance is essential but costly',
      'Press coverage limited to specialist outlets',
    ],
    opportunities: [
      'Spotify Neo Soul, Chill R&B playlists',
      'BBC Radio 6 Music',
      'SoulBounce, Rated R&B',
      "Jazz Cafe, Ronnie Scott's circuit",
      'Bandcamp soul community',
      'Jazz festival crossover opportunities',
    ],
    keywords: [
      'neo soul promotion',
      'neo soul marketing',
      'neo soul playlist pitching',
      'neo soul pr services',
      'neo soul blog submissions',
    ],
  },

  // === FOLK & ACOUSTIC ===
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
  {
    slug: 'country',
    name: 'Country',
    title: 'Music Promotion for Country Artists',
    description:
      'Find country radio, playlist curators, and blog contacts. Plan your campaign for UK and US markets.',
    heroText: 'Country music crosses borders',
    painPoints: [
      'UK country scene is growing but still niche',
      'US market dominates making UK exposure difficult',
      'Radio concentrated on specialist shows',
      'Press coverage limited outside Nashville',
    ],
    opportunities: [
      'Spotify Hot Country, Country UK playlists',
      'BBC Radio 2 Country Show',
      'Country 2 Country Festival',
      'Maverick Magazine, Country Music People',
      'CMT, Country Music Television',
      'Nashville sync opportunities',
    ],
    keywords: [
      'country music promotion',
      'country artist marketing',
      'country playlist pitching',
      'country music pr uk',
      'country blog submissions',
    ],
  },
  {
    slug: 'americana',
    name: 'Americana',
    title: 'Music Promotion for Americana Artists',
    description:
      'Connect with Americana curators, radio, and blogs. Find listeners who appreciate roots music traditions.',
    heroText: 'Americana tells authentic stories',
    painPoints: [
      'Genre definition is broad and contested',
      'Press coverage limited to specialist outlets',
      'Festival circuit expensive to break into',
      'UK scene smaller than US',
    ],
    opportunities: [
      'Spotify Americana & Folk, Fresh Finds Country',
      'BBC Radio 2, Bob Harris shows',
      'Americana Music Association UK',
      'Americanafest UK',
      'No Depression, Americana UK',
      'AmericanaFest Nashville showcase',
    ],
    keywords: [
      'americana promotion',
      'americana marketing',
      'americana playlist pitching',
      'americana pr uk',
      'americana blog submissions',
    ],
  },

  // === JAZZ & CLASSICAL ===
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
    slug: 'classical',
    name: 'Classical',
    title: 'Music Promotion for Classical Musicians',
    description:
      'Navigate classical music promotion with targeted contacts. Find radio, playlist, and press opportunities.',
    heroText: 'Classical music is timeless',
    painPoints: [
      'Streaming metrics favour short pop tracks',
      'Young classical artists struggle for visibility',
      'Industry infrastructure favours established names',
      'Press coverage highly specialised',
    ],
    opportunities: [
      'Spotify Classical New Releases, Classical Focus',
      'Apple Music Classical app',
      'BBC Radio 3, Classic FM',
      'Gramophone, BBC Music Magazine',
      'Proms, Wigmore Hall visibility',
      'Decca, Deutsche Grammophon networks',
    ],
    keywords: [
      'classical music promotion',
      'classical musician marketing',
      'classical playlist pitching',
      'classical music pr',
      'classical artist promotion',
    ],
  },

  // === WORLD & GLOBAL ===
  {
    slug: 'world-music',
    name: 'World Music',
    title: 'Music Promotion for World Music Artists',
    description:
      'Find world music curators, radio, and blog contacts. Connect with audiences who appreciate global sounds.',
    heroText: 'World music connects cultures',
    painPoints: [
      'Category is broad and often misunderstood',
      'Western-centric platforms underserve global artists',
      'Press coverage limited to specialist outlets',
      'Festival circuit is competitive',
    ],
    opportunities: [
      'Spotify Global Sounds playlists',
      'BBC Radio 3 World Routes',
      'Songlines Magazine',
      'WOMAD Festival',
      'fRoots Magazine, World Music Central',
      'Rough Guides World Music',
    ],
    keywords: [
      'world music promotion',
      'global music marketing',
      'world music playlist pitching',
      'world music pr',
      'world music blog submissions',
    ],
  },
  {
    slug: 'afrobeats',
    name: 'Afrobeats',
    title: 'Music Promotion for Afrobeats Artists',
    description:
      'Scout Afrobeats curators and radio contacts. Navigate the global explosion of African music.',
    heroText: 'Afrobeats is taking over',
    painPoints: [
      'Genre is hot but competition is fierce',
      'UK and US markets have different dynamics',
      'Authenticity debates can affect perception',
      'Major label interest means indie struggle',
    ],
    opportunities: [
      'Spotify Afrobeats Hits, African Heat playlists',
      'Apple Music Africa Now',
      'BBC Radio 1Xtra Afrobeats shows',
      'Native Magazine, OkayAfrica',
      'TikTok Afrobeats trends',
      'UK Afrobeats festivals',
    ],
    keywords: [
      'afrobeats promotion',
      'afrobeats marketing',
      'afrobeats playlist pitching',
      'afrobeats pr uk',
      'afrobeats blog submissions',
    ],
  },
  {
    slug: 'latin',
    name: 'Latin',
    title: 'Music Promotion for Latin Music Artists',
    description:
      'Find Latin music curators, radio, and blog contacts. Connect with Spanish-speaking and crossover audiences.',
    heroText: 'Latin music knows no borders',
    painPoints: [
      'UK market for Latin is growing but niche',
      'Language barrier affects crossover',
      'Competition from major Latin artists',
      'Press coverage limited outside specialist outlets',
    ],
    opportunities: [
      'Spotify Viva Latino, Latin Rising playlists',
      'Apple Music ¡Dale Play!',
      'BBC Radio 1Xtra Latin shows',
      'Remezcla, Billboard Latin',
      'Latin Grammy visibility',
      'Latin festivals and club nights',
    ],
    keywords: [
      'latin music promotion',
      'latin music marketing',
      'reggaeton playlist pitching',
      'latin music pr uk',
      'latin blog submissions',
    ],
  },
  {
    slug: 'reggae',
    name: 'Reggae',
    title: 'Music Promotion for Reggae Artists',
    description:
      'Scout reggae curators, radio shows, and blog contacts. Connect with the global roots music community.',
    heroText: 'Reggae is a way of life',
    painPoints: [
      'Mainstream platforms underserve reggae',
      'Scene is traditional and gatekept',
      'Press coverage limited to specialist outlets',
      'Festival circuit has limited slots',
    ],
    opportunities: [
      'Spotify Reggae Classics, New Reggae playlists',
      'BBC Radio 1Xtra reggae shows',
      'David Rodigan shows',
      'Reggaeville, United Reggae',
      'Notting Hill Carnival',
      'One Love Festival, Boomtown',
    ],
    keywords: [
      'reggae music promotion',
      'reggae marketing',
      'reggae playlist pitching',
      'reggae pr uk',
      'reggae blog submissions',
    ],
  },

  // === EXPERIMENTAL & NICHE ===
  {
    slug: 'experimental',
    name: 'Experimental',
    title: 'Music Promotion for Experimental Artists',
    description:
      'Find curators who champion experimental music. Connect with audiences who appreciate boundary-pushing sounds.',
    heroText: 'Experimental music defies categories',
    painPoints: [
      'Commercial platforms struggle with experimental',
      'Audience is niche and hard to reach',
      'Press coverage limited to specialist outlets',
      'Live performance opportunities limited',
    ],
    opportunities: [
      'Bandcamp experimental community',
      'BBC Radio 3 Late Junction',
      'The Wire Magazine',
      'The Quietus, Boomkat',
      'Supersonic Festival',
      'NTS Radio, Resonance FM',
    ],
    keywords: [
      'experimental music promotion',
      'experimental artist marketing',
      'avant garde music pr',
      'experimental playlist pitching',
      'experimental blog submissions',
    ],
  },
  {
    slug: 'lo-fi',
    name: 'Lo-Fi',
    title: 'Music Promotion for Lo-Fi Producers',
    description:
      'Scout lo-fi curators and playlist owners. Navigate the chill beats community with targeted promotion.',
    heroText: 'Lo-fi is a mood',
    painPoints: [
      'Market is saturated with bedroom producers',
      'Low per-stream revenue in background music',
      'Hard to stand out with similar sounds',
      'Press coverage minimal for instrumental beats',
    ],
    opportunities: [
      'Spotify Lo-Fi Beats, Chill Vibes playlists',
      'Lofi Girl YouTube channel',
      'Chillhop Music network',
      'Study/focus playlist ecosystem',
      'Lo-fi record labels',
      'Sync licensing for content creators',
    ],
    keywords: [
      'lofi music promotion',
      'lo-fi beats marketing',
      'chillhop playlist pitching',
      'lo-fi producer promotion',
      'chill beats blog submissions',
    ],
  },
]

export function getGenreBySlug(slug: string): GenreData | undefined {
  return genres.find((g) => g.slug === slug)
}

export function getAllGenreSlugs(): string[] {
  return genres.map((g) => g.slug)
}
