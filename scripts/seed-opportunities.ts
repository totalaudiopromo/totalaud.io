import { createAdminClient } from './config'

const supabase = createAdminClient()

const opportunities = [
  {
    name: 'BBC Radio 1 Introducing',
    type: 'radio',
    genres: ['Electronic', 'Pop', 'Indie', 'Hip Hop'],
    vibes: ['Emerging', 'Fresh'],
    audience_size: 'huge',
    description: 'The primary destination for discovering new, unsigned UK talent. Upload your tracks via the Introducing Uploader.',
    url: 'https://www.bbc.co.uk/introducing',
  },
  {
    name: 'BBC 6 Music',
    type: 'radio',
    genres: ['Alternative', 'Electronic', 'Indie', 'Jazz'],
    vibes: ['Eclectic', 'Alternative'],
    audience_size: 'huge',
    description: 'Alternative music station championing independent and cutting-edge artists.',
    url: 'https://www.bbc.co.uk/6music',
  },
  {
    name: 'NME',
    type: 'press',
    genres: ['Indie', 'Rock', 'Pop', 'Alt'],
    vibes: ['Cultural', 'Trendsetting'],
    audience_size: 'huge',
    description: 'Iconic British music journalism platform covering the biggest emerging artists.',
    url: 'https://www.nme.com',
  },
  {
    name: 'Clash Magazine',
    type: 'press',
    genres: ['Alternative', 'Electronic', 'Hip Hop', 'R&B'],
    vibes: ['Fashion-forward', 'Underground'],
    audience_size: 'large',
    description: 'Forward-thinking music and fashion publication.',
    url: 'https://www.clashmusic.com/',
  },
  {
    name: 'Spotify Fresh Finds',
    type: 'playlist',
    genres: ['Pop', 'Indie', 'Electronic'],
    vibes: ['Fresh', 'Emerging'],
    audience_size: 'huge',
    description: 'Editorial playlist focusing on the best independent artists before they break.',
    url: 'https://artists.spotify.com/pitch',
  },
  {
    name: 'Spotify New Music Friday',
    type: 'playlist',
    genres: ['All'],
    vibes: ['Mainstream', 'Trending'],
    audience_size: 'huge',
    description: 'The ultimate editorial playlist for brand new releases.',
    url: 'https://artists.spotify.com/pitch',
  },
  {
    name: 'KEXP',
    type: 'radio',
    genres: ['Alternative', 'Indie', 'World', 'Electronic'],
    vibes: ['Live', 'Authentic'],
    audience_size: 'large',
    description: 'Influential Seattle-based independent radio station and cultural hub.',
    url: 'https://www.kexp.org/',
  },
  {
    name: 'The Line of Best Fit',
    type: 'blog',
    genres: ['Indie', 'Alternative', 'Electronic'],
    vibes: ['Discovery', 'Critically-acclaimed'],
    audience_size: 'large',
    description: 'One of the UK’s biggest independent music discovery sites.',
    url: 'https://www.thelineofbestfit.com/',
  },
  {
    name: 'DIY Magazine',
    type: 'press',
    genres: ['Indie', 'Rock', 'Alternative'],
    vibes: ['DIY', 'Guitar'],
    audience_size: 'large',
    description: 'Fiercely independent music magazine focusing on guitar music and alt-pop.',
    url: 'https://diymag.com/',
  },
  {
    name: 'Pitchfork',
    type: 'press',
    genres: ['Alternative', 'Electronic', 'Hip Hop', 'Experimental'],
    vibes: ['Critical', 'Avant-garde'],
    audience_size: 'huge',
    description: 'The most trusted voice in music criticism.',
    url: 'https://pitchfork.com/',
  },
  {
    name: 'COLORSxSTUDIOS',
    type: 'curator',
    genres: ['R&B', 'Soul', 'Hip Hop', 'Alternative'],
    vibes: ['Aesthetic', 'Live'],
    audience_size: 'huge',
    description: 'Unique aesthetic music platform showcasing exceptional talent from around the globe.',
    url: 'https://colorsxstudios.com/',
  },
  {
    name: 'Majestic Casual',
    type: 'curator',
    genres: ['Electronic', 'R&B', 'Lofi', 'House'],
    vibes: ['Chill', 'Atmospheric'],
    audience_size: 'large',
    description: 'Influential YouTube channel and lifestyle brand focusing on electronic and chill music.',
    url: 'https://www.majesticcasual.com/',
  },
  {
    name: 'Lyrical Lemonade',
    type: 'curator',
    genres: ['Hip Hop', 'Rap'],
    vibes: ['Underground', 'Visual'],
    audience_size: 'huge',
    description: 'Premier multimedia company and blog championing the next generation of hip-hop.',
    url: 'https://lyricallemonade.com/',
  },
  {
    name: 'Gorilla vs. Bear',
    type: 'blog',
    genres: ['Indie', 'Electronic', 'Dream Pop'],
    vibes: ['Nostalgic', 'Ethereal'],
    audience_size: 'medium',
    description: 'Texas-based music blog known for its dreamy, nostalgic aesthetic.',
    url: 'https://www.gorillavsbear.net/',
  },
  {
    name: 'Pigeons & Planes',
    type: 'blog',
    genres: ['Hip Hop', 'Pop', 'Alternative'],
    vibes: ['Discovery', 'Trendsetting'],
    audience_size: 'large',
    description: 'Complex-owned platform focused on discovering new artists.',
    url: 'https://www.complex.com/pigeons-and-planes',
  },
  {
    name: 'Rinse FM',
    type: 'radio',
    genres: ['Electronic', 'Dance', 'Grime', 'Garage'],
    vibes: ['Underground', 'Club'],
    audience_size: 'large',
    description: 'Pioneering London community radio station for underground dance music.',
    url: 'https://rinse.fm/',
  },
  {
    name: 'NTS Radio',
    type: 'radio',
    genres: ['Electronic', 'Experimental', 'Ambient', 'World'],
    vibes: ['Eclectic', 'Avant-garde'],
    audience_size: 'large',
    description: 'Global radio platform broadcasting underground music.',
    url: 'https://www.nts.live/',
  },
  {
    name: 'Resident Advisor',
    type: 'press',
    genres: ['Electronic', 'Techno', 'House'],
    vibes: ['Club', 'Underground'],
    audience_size: 'huge',
    description: 'The definitive online music magazine and community platform dedicated to electronic music.',
    url: 'https://ra.co/',
  },
  {
    name: 'Mixmag',
    type: 'press',
    genres: ['Electronic', 'Dance'],
    vibes: ['Club', 'Mainstream'],
    audience_size: 'huge',
    description: 'The world\'s biggest dance music and clubbing destination.',
    url: 'https://mixmag.net/',
  },
  {
    name: 'Apple Music: New Music Daily',
    type: 'playlist',
    genres: ['All'],
    vibes: ['Mainstream', 'Trending'],
    audience_size: 'huge',
    description: 'Apple Music\'s premier playlist for the best new releases.',
    url: 'https://music.apple.com',
  },
  {
    name: 'HypeMachine',
    type: 'curator',
    genres: ['Indie', 'Alternative', 'Electronic'],
    vibes: ['Blogosphere', 'Discovery'],
    audience_size: 'large',
    description: 'Music blog aggregator tracking the most discussed tracks on the internet.',
    url: 'https://hypem.com/',
  },
  {
    name: 'Under the Radar',
    type: 'press',
    genres: ['Indie', 'Alternative'],
    vibes: ['Print', 'Critical'],
    audience_size: 'medium',
    description: 'Indie music magazine with in-depth interviews and reviews.',
    url: 'https://www.undertheradarmag.com/',
  },
  {
    name: 'Consequence of Sound',
    type: 'press',
    genres: ['Alternative', 'Rock', 'Pop', 'Hip Hop'],
    vibes: ['News', 'Critical'],
    audience_size: 'large',
    description: 'Independent publication featuring news, editorials, and reviews.',
    url: 'https://consequence.net/',
  },
  {
    name: 'FADER',
    type: 'press',
    genres: ['Hip Hop', 'R&B', 'Electronic', 'Pop'],
    vibes: ['Style', 'Culture'],
    audience_size: 'large',
    description: 'The definitive voice of emerging music and the lifestyle that surrounds it.',
    url: 'https://www.thefader.com/',
  },
  {
    name: 'Boiler Room',
    type: 'curator',
    genres: ['Electronic', 'Dance', 'Club'],
    vibes: ['Live', 'Underground'],
    audience_size: 'huge',
    description: 'Independent music platform and cultural curator connecting club culture to the wider world.',
    url: 'https://boilerroom.tv/',
  },
  {
    name: 'Wonderland Magazine',
    type: 'press',
    genres: ['Pop', 'R&B', 'Alternative'],
    vibes: ['Fashion', 'Culture'],
    audience_size: 'large',
    description: 'International fashion and culture publication championing new talent.',
    url: 'https://www.wonderlandmagazine.com/',
  },
  {
    name: 'Earmilk',
    type: 'blog',
    genres: ['Electronic', 'Hip Hop', 'Indie'],
    vibes: ['Discovery', 'Underground'],
    audience_size: 'medium',
    description: 'Online music publication covering dance, hip-hop, and indie.',
    url: 'https://earmilk.com/',
  },
  {
    name: 'This Song Is Sick',
    type: 'blog',
    genres: ['Electronic', 'Hip Hop', 'Indie'],
    vibes: ['Party', 'Upbeat'],
    audience_size: 'medium',
    description: 'Music blog connecting people to new music across electronic, hip-hop, and indie.',
    url: 'https://thissongissick.com/',
  },
  {
    name: 'Stereogum',
    type: 'blog',
    genres: ['Indie', 'Rock', 'Alternative'],
    vibes: ['Critical', 'News'],
    audience_size: 'large',
    description: 'Early MP3 blog turned leading music news site focusing on indie and alternative.',
    url: 'https://www.stereogum.com/',
  },
  {
    name: 'Notion Magazine',
    type: 'press',
    genres: ['Pop', 'R&B', 'Alternative'],
    vibes: ['Culture', 'Fashion'],
    audience_size: 'medium',
    description: 'Quarterly printed music and fashion magazine.',
    url: 'https://notion.online/',
  }
]

async function seedOpportunities() {
  console.log('Seeding Scout opportunities...')

  try {
    for (const opp of opportunities) {
      // Use raw SQL / generic insert to skip RLS
      const { error } = await supabase
        .from('opportunities')
        .insert(opp)
      
      if (error) {
        console.error(`Failed to insert ${opp.name}:`, error.message)
      } else {
        console.log(`✓ Inserted ${opp.name}`)
      }
    }
    
    console.log('Seed completed successfully.')
  } catch (err) {
    console.error('Seed script error:', err)
  }
}

seedOpportunities()
