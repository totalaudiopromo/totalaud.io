/**
 * Location data for pSEO pages
 * Each location gets its own landing page at /location/[slug]
 *
 * Total: 30 locations (15 UK, 15 US)
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

// UK Cities (15)
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
  {
    slug: 'leeds',
    name: 'Leeds',
    country: 'UK',
    title: 'Music Promotion for Leeds Artists',
    description:
      "Scout contacts and plan releases as a Leeds artist. Yorkshire's music capital is thriving.",
    heroText: 'Leeds punches above its weight',
    sceneDescription:
      "Leeds has a rich musical history from Gang of Four to Alt-J. The city's DIY spirit and affordable venues nurture emerging talent.",
    localOpportunities: [
      'BBC Introducing West Yorkshire',
      'The Leeds Guide',
      'Leeds International Festival',
      'Live at Leeds',
      'Leeds Music Scene blog',
    ],
    radioStations: ['BBC Radio Leeds', 'LSR FM', 'Capital Yorkshire', 'Greatest Hits Radio'],
    venues: [
      'Brudenell Social Club',
      'The Wardrobe',
      'Hyde Park Book Club',
      'The Key Club',
      'Headrow House',
      'Oporto',
    ],
    keywords: [
      'leeds music promotion',
      'leeds artist marketing',
      'leeds music scene',
      'yorkshire band promotion',
      'leeds gig venues',
    ],
  },
  {
    slug: 'liverpool',
    name: 'Liverpool',
    country: 'UK',
    title: 'Music Promotion for Liverpool Artists',
    description:
      'Scout contacts and plan releases as a Liverpool artist. The city with the most number one hits has serious heritage.',
    heroText: "Liverpool's music legacy continues",
    sceneDescription:
      "Liverpool's musical heritage is unmatched - from The Beatles to today's thriving scene. The city champions its artists fiercely.",
    localOpportunities: [
      'BBC Introducing Merseyside',
      'Bido Lito! magazine',
      'Liverpool Sound City',
      'Eurovision 2023 legacy events',
      'Cavern Club showcases',
    ],
    radioStations: ['BBC Radio Merseyside', 'Radio City', 'Melodic Distraction', 'Getintothis'],
    venues: [
      'The Cavern Club',
      'Arts Club',
      "Jimmy's",
      'Jacaranda',
      'Phase One',
      "O'Neill's Mathew Street",
    ],
    keywords: [
      'liverpool music promotion',
      'liverpool artist marketing',
      'liverpool music scene',
      'merseyside band promotion',
      'liverpool gig venues',
    ],
  },
  {
    slug: 'edinburgh',
    name: 'Edinburgh',
    country: 'UK',
    title: 'Music Promotion for Edinburgh Artists',
    description:
      "Scout contacts and plan releases as an Edinburgh artist. Scotland's capital has a distinctive scene.",
    heroText: 'Edinburgh artists stand apart',
    sceneDescription:
      "Edinburgh's music scene is more intimate than Glasgow's but equally passionate. The Fringe provides unique exposure opportunities.",
    localOpportunities: [
      'BBC Introducing Scotland',
      'The Skinny Edinburgh',
      'Edinburgh Fringe music programme',
      'Hogmanay celebrations',
      'Edinburgh Jazz Festival',
    ],
    radioStations: ['BBC Radio Scotland', 'Forth 1', 'Castle FM', 'EH-FM'],
    venues: [
      "Sneaky Pete's",
      'The Mash House',
      'Summerhall',
      'The Voodoo Rooms',
      "Henry's Cellar Bar",
      'Bannermans',
    ],
    keywords: [
      'edinburgh music promotion',
      'edinburgh artist marketing',
      'edinburgh music scene',
      'scottish capital band promotion',
      'edinburgh gig venues',
    ],
  },
  {
    slug: 'sheffield',
    name: 'Sheffield',
    country: 'UK',
    title: 'Music Promotion for Sheffield Artists',
    description:
      'Scout contacts and plan releases as a Sheffield artist. The Steel City has a proud musical tradition.',
    heroText: 'Sheffield sound is distinctive',
    sceneDescription:
      "From Pulp to Arctic Monkeys, Sheffield breeds chart-toppers. The city's electronic heritage runs from Warp Records to today.",
    localOpportunities: [
      'BBC Introducing Sheffield',
      'Sheffield Music Hub',
      'Tramlines Festival',
      'Doc/Fest music strand',
      'Yorkshire music blogs',
    ],
    radioStations: ['BBC Radio Sheffield', 'Hallam FM', 'Sheffield Live', 'The Sheffield Channel'],
    venues: [
      'The Leadmill',
      'Yellow Arch Studios',
      'The Harley',
      'Cafe Totem',
      'Picture House Social',
      'The Greystones',
    ],
    keywords: [
      'sheffield music promotion',
      'sheffield artist marketing',
      'sheffield music scene',
      'steel city band promotion',
      'sheffield gig venues',
    ],
  },
  {
    slug: 'newcastle',
    name: 'Newcastle',
    country: 'UK',
    title: 'Music Promotion for Newcastle Artists',
    description:
      'Scout contacts and plan releases as a Newcastle artist. The North East has a fierce musical identity.',
    heroText: 'Newcastle artists are resilient',
    sceneDescription:
      "Newcastle's music scene punches above its weight with passionate fans and a strong DIY community. The city supports its own.",
    localOpportunities: [
      'BBC Introducing North East',
      'Narc. Magazine',
      'Generator NE',
      'Evolution Emerging',
      'Hit The North festival',
    ],
    radioStations: ['BBC Radio Newcastle', 'Metro Radio', 'NE1 FM', 'Pride Radio'],
    venues: [
      'The Cluny',
      'Think Tank?',
      'Riverside',
      'Little Buildings',
      'Head of Steam',
      'Cobalt Studios',
    ],
    keywords: [
      'newcastle music promotion',
      'newcastle artist marketing',
      'north east music scene',
      'geordie band promotion',
      'newcastle gig venues',
    ],
  },
  {
    slug: 'brighton',
    name: 'Brighton',
    country: 'UK',
    title: 'Music Promotion for Brighton Artists',
    description:
      'Scout contacts and plan releases as a Brighton artist. The seaside city has serious musical credentials.',
    heroText: 'Brighton breeds creativity',
    sceneDescription:
      "Brighton's liberal atmosphere attracts creatives. The city's venues and festivals punch above their weight for a town its size.",
    localOpportunities: [
      'BBC Introducing Sussex',
      'Brighton Source',
      'The Great Escape Festival',
      'Brighton Fringe',
      'Brighton Music Conference',
    ],
    radioStations: ['BBC Radio Sussex', 'Juice Brighton', 'Platform B', '1BTN'],
    venues: [
      'The Hope & Ruin',
      'Concorde 2',
      'The Green Door Store',
      'Patterns',
      'Chalk',
      'The Prince Albert',
    ],
    keywords: [
      'brighton music promotion',
      'brighton artist marketing',
      'brighton music scene',
      'sussex band promotion',
      'brighton gig venues',
    ],
  },
  {
    slug: 'nottingham',
    name: 'Nottingham',
    country: 'UK',
    title: 'Music Promotion for Nottingham Artists',
    description:
      'Scout contacts and plan releases as a Nottingham artist. The East Midlands hub has an underrated scene.',
    heroText: 'Nottingham is underrated',
    sceneDescription:
      "Nottingham's music scene flies under the radar but has produced Jake Bugg, Sleaford Mods, and a thriving DIY community.",
    localOpportunities: [
      'BBC Introducing East Midlands',
      'LeftLion magazine',
      'Hockley Hustle',
      'Dot To Dot Festival',
      'Nottingham Music Hub',
    ],
    radioStations: ['BBC Radio Nottingham', 'Capital East Midlands', 'Kemet FM', 'Radio Dawn'],
    venues: [
      'The Bodega',
      'Rough Trade Nottingham',
      'JT Soar',
      'The Maze',
      'Rescue Rooms',
      'Metronome',
    ],
    keywords: [
      'nottingham music promotion',
      'nottingham artist marketing',
      'nottingham music scene',
      'east midlands band promotion',
      'nottingham gig venues',
    ],
  },
  {
    slug: 'cardiff',
    name: 'Cardiff',
    country: 'UK',
    title: 'Music Promotion for Cardiff Artists',
    description:
      "Scout contacts and plan releases as a Cardiff artist. Wales' capital has a passionate music community.",
    heroText: 'Cardiff champions Welsh talent',
    sceneDescription:
      "Cardiff's music scene is bilingual and proud. The city supports Welsh language music while embracing all genres.",
    localOpportunities: [
      'BBC Introducing Wales',
      'Buzz Magazine',
      'Sŵn Festival',
      'Welsh Music Prize',
      'Focus Wales',
    ],
    radioStations: ['BBC Radio Wales', 'Capital South Wales', 'Nation Radio', 'Radio Cardiff'],
    venues: ['Clwb Ifor Bach', 'The Moon', 'Fuel Rock Club', 'Tiny Rebel', 'Tramshed', 'The Globe'],
    keywords: [
      'cardiff music promotion',
      'cardiff artist marketing',
      'welsh music scene',
      'cardiff band promotion',
      'wales music pr',
    ],
  },
  {
    slug: 'belfast',
    name: 'Belfast',
    country: 'UK',
    title: 'Music Promotion for Belfast Artists',
    description:
      "Scout contacts and plan releases as a Belfast artist. Northern Ireland's capital has a unique scene.",
    heroText: 'Belfast sound is distinctive',
    sceneDescription:
      "Belfast's music scene has emerged from troubled times with renewed energy. The city's artists are gaining international recognition.",
    localOpportunities: [
      'BBC Introducing Northern Ireland',
      'Oh Yeah Music Centre',
      'Sound of Belfast',
      'Output Belfast',
      'AVA Festival',
    ],
    radioStations: ['BBC Radio Ulster', 'Q Radio', 'Downtown Radio', 'Cool FM'],
    venues: ['The Black Box', 'Voodoo', 'The Limelight', 'The Sunflower', 'McHughs', 'The Empire'],
    keywords: [
      'belfast music promotion',
      'belfast artist marketing',
      'northern ireland music scene',
      'belfast band promotion',
      'ni music pr',
    ],
  },
  {
    slug: 'cambridge',
    name: 'Cambridge',
    country: 'UK',
    title: 'Music Promotion for Cambridge Artists',
    description:
      'Scout contacts and plan releases as a Cambridge artist. The university city has deep folk roots.',
    heroText: 'Cambridge nurtures folk talent',
    sceneDescription:
      "Cambridge's folk festival is legendary, and the city continues to nurture acoustic and folk artists alongside a broader scene.",
    localOpportunities: [
      'BBC Introducing Cambridgeshire',
      'Cambridge Folk Festival',
      'Strawberry Fair',
      'Cambridge Junction programming',
      'Cambridge 105 showcases',
    ],
    radioStations: ['BBC Radio Cambridgeshire', 'Cambridge 105', 'Star Radio', 'Cam FM'],
    venues: [
      'Cambridge Junction',
      'The Portland Arms',
      'The Haymakers',
      'Hidden Rooms',
      'The Blue Moon',
      'CB2',
    ],
    keywords: [
      'cambridge music promotion',
      'cambridge artist marketing',
      'cambridge folk scene',
      'cambridge band promotion',
      'cambridge gig venues',
    ],
  },
]

// US Cities (15)
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
  {
    slug: 'atlanta',
    name: 'Atlanta',
    country: 'US',
    title: 'Music Promotion for Atlanta Artists',
    description:
      'Scout contacts and plan releases as an Atlanta artist. The hip-hop capital has unmatched influence.',
    heroText: 'Atlanta runs hip-hop',
    sceneDescription:
      "Atlanta is the undisputed hip-hop capital. From OutKast to today's trap scene, the city defines trends before they go mainstream.",
    localOpportunities: [
      'Hot 107.9 new music support',
      'A3C Festival & Conference',
      'Creative Loafing Atlanta',
      'Georgia Music Partners',
      'Atlanta Music Showcase',
    ],
    radioStations: ['Hot 107.9', 'V-103', 'Streetz 94.5', 'WRAS Georgia State'],
    venues: ['The Masquerade', 'Terminal West', 'Aisle 5', '529', 'The Earl', 'Vinyl'],
    keywords: [
      'atlanta music promotion',
      'atlanta artist marketing',
      'atlanta hip hop scene',
      'georgia music pr',
      'atlanta rap promotion',
    ],
  },
  {
    slug: 'seattle',
    name: 'Seattle',
    country: 'US',
    title: 'Music Promotion for Seattle Artists',
    description:
      'Scout contacts and plan releases as a Seattle artist. The city that birthed grunge still innovates.',
    heroText: 'Seattle sound keeps evolving',
    sceneDescription:
      "Seattle's musical legacy from grunge to today's indie scene is legendary. KEXP's influence reaches globally from the Pacific Northwest.",
    localOpportunities: [
      'KEXP live sessions',
      'The Stranger',
      'Capitol Hill Block Party',
      'Bumbershoot',
      'Seattle Weekly coverage',
    ],
    radioStations: ['KEXP', 'The End (107.7)', 'KNKX', 'Rainier Avenue Radio'],
    venues: [
      'The Crocodile',
      'Neumos',
      'The Tractor Tavern',
      'Chop Suey',
      'The Showbox',
      'Barboza',
    ],
    keywords: [
      'seattle music promotion',
      'seattle artist marketing',
      'pacific northwest music scene',
      'seattle band promotion',
      'seattle indie music',
    ],
  },
  {
    slug: 'detroit',
    name: 'Detroit',
    country: 'US',
    title: 'Music Promotion for Detroit Artists',
    description:
      'Scout contacts and plan releases as a Detroit artist. The birthplace of Motown and techno still innovates.',
    heroText: 'Detroit sound is legendary',
    sceneDescription:
      "Detroit's musical contributions - from Motown soul to techno - are immeasurable. The city's scene is resilient and innovative.",
    localOpportunities: [
      'Movement Electronic Music Festival',
      'Metro Times',
      'Dally in the Alley',
      'Motown Museum events',
      'Detroit Music Foundation',
    ],
    radioStations: ['WDET', 'WJLB', 'WXYZ', "Ann Arbor's WCBN"],
    venues: [
      'El Club',
      'The Magic Stick',
      'Third Man Records Cass Corridor',
      'Marble Bar',
      'The Shelter',
      'TV Lounge',
    ],
    keywords: [
      'detroit music promotion',
      'detroit artist marketing',
      'detroit techno scene',
      'motown city music pr',
      'detroit band promotion',
    ],
  },
  {
    slug: 'miami',
    name: 'Miami',
    country: 'US',
    title: 'Music Promotion for Miami Artists',
    description:
      'Scout contacts and plan releases as a Miami artist. The gateway to Latin America and electronic music.',
    heroText: 'Miami bridges worlds',
    sceneDescription:
      "Miami's music scene is uniquely positioned between North America and Latin markets. Ultra and the bass music scene put Miami on the electronic map.",
    localOpportunities: [
      'Ultra Music Festival',
      'Miami Music Week',
      'III Points Festival',
      'Miami New Times',
      'Latin Grammy connections',
    ],
    radioStations: ['WLRN', 'Revolution 93.5', 'Power 96', 'Y100'],
    venues: ['The Ground', 'Gramps', 'Las Rosas', 'Club Space', 'Floyd Miami', 'Treehouse'],
    keywords: [
      'miami music promotion',
      'miami artist marketing',
      'south florida music scene',
      'miami electronic music',
      'miami latin music pr',
    ],
  },
  {
    slug: 'philadelphia',
    name: 'Philadelphia',
    country: 'US',
    title: 'Music Promotion for Philadelphia Artists',
    description:
      'Scout contacts and plan releases as a Philly artist. The city of brotherly love has serious soul.',
    heroText: 'Philadelphia soul runs deep',
    sceneDescription:
      "Philly's musical heritage from The Sound of Philadelphia to The Roots is legendary. Today's scene spans jazz, hip-hop, and indie rock.",
    localOpportunities: [
      'WXPN Free at Noon',
      'Philadelphia Inquirer',
      'WKDU college radio',
      'Philly Music Fest',
      'Roots Picnic',
    ],
    radioStations: ['WXPN', 'WKDU', 'WRTI', 'Radio 104.5'],
    venues: [
      'Boot & Saddle',
      "Johnny Brenda's",
      'Union Transfer',
      'PhilaMOCA',
      'World Cafe Live',
      'The Foundry',
    ],
    keywords: [
      'philadelphia music promotion',
      'philly artist marketing',
      'philadelphia music scene',
      'philly band promotion',
      'philadelphia soul music',
    ],
  },
  {
    slug: 'denver',
    name: 'Denver',
    country: 'US',
    title: 'Music Promotion for Denver Artists',
    description:
      'Scout contacts and plan releases as a Denver artist. The Mile High City has a growing scene.',
    heroText: 'Denver scene is rising',
    sceneDescription:
      "Denver's music scene has grown significantly. Red Rocks nearby and a booming population mean more opportunities and competition.",
    localOpportunities: [
      'Red Rocks showcases',
      'Westword Music Showcase',
      'UMS (Underground Music Showcase)',
      'Colorado Sound',
      'KUVO Jazz',
    ],
    radioStations: ['CPR OpenAir', 'KUVO', 'KTCL', 'Radio 1190'],
    venues: [
      'Globe Hall',
      'Lost Lake Lounge',
      'Larimer Lounge',
      'Hi-Dive',
      'Bluebird Theater',
      'Marquis Theater',
    ],
    keywords: [
      'denver music promotion',
      'denver artist marketing',
      'colorado music scene',
      'denver band promotion',
      'mile high city music',
    ],
  },
  {
    slug: 'portland',
    name: 'Portland',
    country: 'US',
    title: 'Music Promotion for Portland Artists',
    description:
      'Scout contacts and plan releases as a Portland artist. The Pacific Northwest indie capital.',
    heroText: 'Portland keeps it indie',
    sceneDescription:
      "Portland's fiercely independent music scene spawned Modest Mouse, The Decemberists, and countless others. The city values authenticity above all.",
    localOpportunities: [
      'KEXP Portland sessions',
      'Willamette Week',
      'MusicfestNW',
      'PDX Pop Now!',
      'Portland Mercury',
    ],
    radioStations: ['KEXP (syndicated)', 'KBOO', 'XRAY.fm', 'OPB'],
    venues: [
      'Mississippi Studios',
      'Doug Fir Lounge',
      'Holocene',
      'The Liquor Store',
      'Star Theater',
      'Polaris Hall',
    ],
    keywords: [
      'portland music promotion',
      'portland artist marketing',
      'portland indie scene',
      'oregon music pr',
      'pnw band promotion',
    ],
  },
  {
    slug: 'new-orleans',
    name: 'New Orleans',
    country: 'US',
    title: 'Music Promotion for New Orleans Artists',
    description:
      'Scout contacts and plan releases as a New Orleans artist. The birthplace of jazz still swings.',
    heroText: 'New Orleans is music',
    sceneDescription:
      "New Orleans doesn't just have a music scene - it IS music. Jazz, brass bands, bounce, and everything in between live here.",
    localOpportunities: [
      'Jazz Fest',
      'French Quarter Fest',
      'Offbeat Magazine',
      'WWOZ support',
      'New Orleans Jazz Museum events',
    ],
    radioStations: ['WWOZ', 'WTUL', 'WWNO', 'Q93'],
    venues: [
      "Tipitina's",
      'The Maple Leaf',
      'd.b.a.',
      'The Spotted Cat',
      'Preservation Hall',
      'One Eyed Jacks',
    ],
    keywords: [
      'new orleans music promotion',
      'nola artist marketing',
      'new orleans jazz scene',
      'louisiana music pr',
      'new orleans band promotion',
    ],
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    country: 'US',
    title: 'Music Promotion for San Francisco Artists',
    description:
      'Scout contacts and plan releases as an SF artist. The Bay Area has counterculture in its DNA.',
    heroText: 'San Francisco stays weird',
    sceneDescription:
      "San Francisco's music scene is eclectic and experimental. High cost of living has displaced artists but the spirit remains.",
    localOpportunities: [
      'Noise Pop Festival',
      'SF Weekly',
      'Hardly Strictly Bluegrass',
      'Outside Lands',
      'KQED coverage',
    ],
    radioStations: ['KEXP (syndicated)', 'KALX', 'KQED', 'BFF.fm'],
    venues: [
      'The Chapel',
      'Bottom of the Hill',
      'The Independent',
      'Rickshaw Stop',
      'Cafe du Nord',
      'Great American Music Hall',
    ],
    keywords: [
      'san francisco music promotion',
      'sf artist marketing',
      'bay area music scene',
      'san francisco band promotion',
      'sf indie music',
    ],
  },
  {
    slug: 'minneapolis',
    name: 'Minneapolis',
    country: 'US',
    title: 'Music Promotion for Minneapolis Artists',
    description:
      "Scout contacts and plan releases as a Minneapolis artist. Prince's city still innovates.",
    heroText: 'Minneapolis punches above its weight',
    sceneDescription:
      "Minneapolis has an outsized musical influence from Prince to Hüsker Dü to today's indie scene. First Avenue is legendary.",
    localOpportunities: [
      'The Current (89.3)',
      'City Pages',
      'First Avenue showcases',
      'Soundset Festival',
      'Twin Cities Music Collective',
    ],
    radioStations: ['The Current (89.3)', 'KFAI', 'Radio K', 'Go 96.3'],
    venues: [
      'First Avenue',
      'The Turf Club',
      '7th St Entry',
      'The Triple Rock',
      'Icehouse',
      'The Cedar Cultural Center',
    ],
    keywords: [
      'minneapolis music promotion',
      'twin cities artist marketing',
      'minneapolis music scene',
      'minnesota music pr',
      'minneapolis band promotion',
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
