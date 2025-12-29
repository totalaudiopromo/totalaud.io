/**
 * Location data for pSEO pages
 * Each location gets its own landing page at /location/[slug]
 */

export interface LocationData {
  slug: string
  name: string
  country: 'UK' | 'US'
  title: string
  description: string
  heroText: string
  sceneDescription: string
  localOpportunities: string[]
  radioStations: string[]
  venues: string[]
  keywords: string[]
}

// UK Cities
export const ukLocations: LocationData[] = [
  {
    slug: 'london',
    name: 'London',
    country: 'UK',
    title: 'Music Promotion for London Artists',
    description:
      "Scout contacts, plan releases, and craft pitches as a London-based artist. Navigate the capital's competitive music scene.",
    heroText: 'London artists deserve to be heard',
    sceneDescription:
      'London is the heart of the UK music industry. From grassroots venues in Camden to BBC Maida Vale, the city offers unmatched opportunities - but fierce competition.',
    localOpportunities: [
      'BBC Introducing London',
      'NME, DIY, The Line of Best Fit (London-based)',
      'The Great Escape showcase slots',
      'SXSW UK contingent',
      'Spotify UK editorial team (based in London)',
    ],
    radioStations: [
      'BBC Radio 1',
      'BBC Radio 6 Music',
      'NTS Radio',
      'Rinse FM',
      'Reprezent Radio',
      'Foundation FM',
    ],
    venues: [
      'The Windmill Brixton',
      'Rough Trade East',
      'Village Underground',
      'Oslo Hackney',
      'The Lexington',
      'The Victoria Dalston',
    ],
    keywords: [
      'london music promotion',
      'london artist marketing',
      'london music scene',
      'london band promotion',
      'london radio plugging',
    ],
  },
  {
    slug: 'manchester',
    name: 'Manchester',
    country: 'UK',
    title: 'Music Promotion for Manchester Artists',
    description:
      "Scout contacts and plan releases as a Manchester artist. Tap into the city's legendary music heritage.",
    heroText: 'Manchester never stops making music',
    sceneDescription:
      "From Factory Records to today's thriving scene, Manchester punches above its weight. The city's independent spirit runs deep.",
    localOpportunities: [
      'BBC Introducing Manchester',
      'Manchester Evening News entertainment',
      'In The City conference',
      'Manchester International Festival',
      'Northern music blogs',
    ],
    radioStations: [
      'BBC Radio Manchester',
      'XS Manchester',
      'Unity Radio',
      'Reform Radio',
      'MCR Live',
    ],
    venues: [
      'Night & Day Cafe',
      'Band on the Wall',
      'The Deaf Institute',
      'YES Manchester',
      'Soup Kitchen',
      'Gullivers',
    ],
    keywords: [
      'manchester music promotion',
      'manchester artist marketing',
      'manchester music scene',
      'manchester band promotion',
      'northern music pr',
    ],
  },
  {
    slug: 'bristol',
    name: 'Bristol',
    country: 'UK',
    title: 'Music Promotion for Bristol Artists',
    description:
      'Scout contacts and plan releases as a Bristol artist. The city that gave us trip-hop still leads the way.',
    heroText: 'Bristol sounds like nowhere else',
    sceneDescription:
      "Bristol's music scene is uniquely experimental. From Massive Attack to today's electronic underground, the city champions the unconventional.",
    localOpportunities: [
      'BBC Introducing West',
      'Bristol In Stereo',
      'Simple Things Festival',
      'Forwards Festival',
      'Bristol Music Trust',
    ],
    radioStations: ['BBC Radio Bristol', 'Ujima Radio', 'BCFM', 'SWU.FM', 'Noods Radio'],
    venues: [
      'The Fleece',
      'Rough Trade Bristol',
      'The Louisiana',
      'Strange Brew',
      'Exchange',
      'The Crofters Rights',
    ],
    keywords: [
      'bristol music promotion',
      'bristol artist marketing',
      'bristol music scene',
      'bristol electronic music',
      'west country music pr',
    ],
  },
  {
    slug: 'birmingham',
    name: 'Birmingham',
    country: 'UK',
    title: 'Music Promotion for Birmingham Artists',
    description:
      "Scout contacts and plan releases as a Birmingham artist. The UK's second city has serious musical heritage.",
    heroText: "Birmingham's sound is rising",
    sceneDescription:
      "Birmingham gave us heavy metal, UB40, and a thriving grime scene. The city's music community is tight-knit and supportive.",
    localOpportunities: [
      'BBC Introducing West Midlands',
      'Birmingham Music Archive',
      'Supersonic Festival',
      'Home of Metal',
      'Birmingham Jazz Festival',
    ],
    radioStations: ['BBC Radio WM', 'Free Radio Birmingham', 'Capital Birmingham', 'Demon FM'],
    venues: [
      'The Sunflower Lounge',
      'Hare & Hounds',
      'The Night Owl',
      'Dead Wax',
      'The Flapper',
      "Mama Roux's",
    ],
    keywords: [
      'birmingham music promotion',
      'birmingham artist marketing',
      'birmingham music scene',
      'brummie music pr',
      'west midlands band promotion',
    ],
  },
  {
    slug: 'glasgow',
    name: 'Glasgow',
    country: 'UK',
    title: 'Music Promotion for Glasgow Artists',
    description:
      "Scout contacts and plan releases as a Glasgow artist. Scotland's music capital breeds world-class talent.",
    heroText: "Glasgow's music scene is world-class",
    sceneDescription:
      "Glasgow's pound-for-pound output is unmatched. From Primal Scream to Mogwai to today's scene, the city breeds legends.",
    localOpportunities: [
      'BBC Introducing Scotland',
      'The Skinny',
      'Celtic Connections',
      'TRNSMT Festival',
      'Scottish Alternative Music Awards',
    ],
    radioStations: ['BBC Radio Scotland', 'Amazing Radio', 'Subcity Radio', 'Clyde 1'],
    venues: [
      "King Tut's Wah Wah Hut",
      'Mono',
      'Nice N Sleazy',
      'The Hug & Pint',
      'Broadcast',
      'SWG3',
    ],
    keywords: [
      'glasgow music promotion',
      'glasgow artist marketing',
      'scottish music scene',
      'glasgow band promotion',
      'scotland music pr',
    ],
  },
]

// US Cities
export const usLocations: LocationData[] = [
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    country: 'US',
    title: 'Music Promotion for Los Angeles Artists',
    description:
      'Scout contacts and plan releases as an LA artist. Navigate the entertainment capital with clarity.',
    heroText: 'LA dreams deserve to be heard',
    sceneDescription:
      "Los Angeles is the global entertainment capital. Major labels, sync opportunities, and a massive creative community - but everyone's competing.",
    localOpportunities: [
      "KCRW's Morning Becomes Eclectic",
      'LA Weekly music coverage',
      'Coachella industry showcases',
      'NAMM networking',
      'Film/TV sync opportunities',
    ],
    radioStations: ['KCRW', 'KEXP (syndicated)', 'KROQ', 'dublab', 'NTS Los Angeles'],
    venues: [
      'The Troubadour',
      'The Echo',
      'Zebulon',
      'Gold-Diggers',
      'The Moroccan Lounge',
      'Lodge Room',
    ],
    keywords: [
      'los angeles music promotion',
      'la artist marketing',
      'la music scene',
      'california music pr',
      'la band promotion',
    ],
  },
  {
    slug: 'new-york',
    name: 'New York',
    country: 'US',
    title: 'Music Promotion for New York Artists',
    description:
      'Scout contacts and plan releases as a NYC artist. The city that never sleeps breeds relentless talent.',
    heroText: 'New York artists never stop',
    sceneDescription:
      'NYC is still the cultural capital. Media headquarters, legendary venues, and a scene that demands excellence.',
    localOpportunities: [
      'Pitchfork (NYC-based)',
      'Stereogum (NYC-based)',
      'NPR Music',
      'CMJ Music Marathon',
      'NYC Winter Jazzfest',
    ],
    radioStations: ['WFUV', 'WNYC', 'The Lot Radio', 'NTS New York', 'Hot 97', 'Power 105.1'],
    venues: [
      'Bowery Ballroom',
      'Mercury Lounge',
      "Baby's All Right",
      'Elsewhere',
      'Union Pool',
      'Rough Trade NYC',
    ],
    keywords: [
      'new york music promotion',
      'nyc artist marketing',
      'new york music scene',
      'brooklyn music pr',
      'nyc band promotion',
    ],
  },
  {
    slug: 'nashville',
    name: 'Nashville',
    country: 'US',
    title: 'Music Promotion for Nashville Artists',
    description:
      "Scout contacts and plan releases as a Nashville artist. Music City isn't just country anymore.",
    heroText: 'Nashville talent runs deep',
    sceneDescription:
      "Nashville has evolved far beyond country. The city's infrastructure, songwriting community, and industry presence are unmatched.",
    localOpportunities: [
      'Americana Music Association',
      'Lightning 100 WRLT',
      'Americanafest',
      'Nashville Scene coverage',
      'Sync licensing opportunities',
    ],
    radioStations: ['Lightning 100 (WRLT)', 'WMOT Roots Radio', 'WSM (Grand Ole Opry)', 'WXNA'],
    venues: [
      'The Basement',
      'Exit/In',
      '3rd & Lindsley',
      'The High Watt',
      'The 5 Spot',
      'Mercy Lounge',
    ],
    keywords: [
      'nashville music promotion',
      'nashville artist marketing',
      'music city promotion',
      'nashville songwriter pr',
      'tennessee music marketing',
    ],
  },
  {
    slug: 'austin',
    name: 'Austin',
    country: 'US',
    title: 'Music Promotion for Austin Artists',
    description:
      'Scout contacts and plan releases as an Austin artist. The live music capital breeds passionate fans.',
    heroText: 'Austin keeps it weird and wonderful',
    sceneDescription:
      'Austin\'s "Live Music Capital of the World" title is earned. SXSW, ACL, and a year-round scene that rewards authenticity.',
    localOpportunities: [
      'SXSW showcases',
      'Austin City Limits PBS',
      'KUTX Austin',
      'Austin Chronicle',
      'ACL Festival',
    ],
    radioStations: ['KUTX 98.9', 'KEXP (syndicated)', 'Sun Radio', 'KOOP'],
    venues: [
      'The Continental Club',
      'Mohawk',
      'Hole in the Wall',
      "C-Boy's Heart & Soul",
      "Emo's",
      'Empire Control Room',
    ],
    keywords: [
      'austin music promotion',
      'austin artist marketing',
      'austin music scene',
      'texas music pr',
      'sxsw showcase promotion',
    ],
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    country: 'US',
    title: 'Music Promotion for Chicago Artists',
    description:
      "Scout contacts and plan releases as a Chicago artist. The Windy City's musical legacy lives on.",
    heroText: 'Chicago sound echoes everywhere',
    sceneDescription:
      'Chicago gave us house music, blues, and continues to breed innovative artists. The scene is supportive but underrated nationally.',
    localOpportunities: [
      'Pitchfork Music Festival',
      'Chicago Reader',
      'Empty Bottle presents',
      'Riot Fest',
      'CHIRP Radio',
    ],
    radioStations: ['WXRT', 'CHIRP Radio', 'WNUR', 'WLUW', 'Vocalo'],
    venues: ['Empty Bottle', 'Schubas', 'Lincoln Hall', 'Hideout', 'The Whistler', 'Beat Kitchen'],
    keywords: [
      'chicago music promotion',
      'chicago artist marketing',
      'chicago music scene',
      'midwest music pr',
      'chicago band promotion',
    ],
  },
]

export const locations: LocationData[] = [...ukLocations, ...usLocations]

export function getLocationBySlug(slug: string): LocationData | undefined {
  return locations.find((l) => l.slug === slug)
}

export function getAllLocationSlugs(): string[] {
  return locations.map((l) => l.slug)
}
