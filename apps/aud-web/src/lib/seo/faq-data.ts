/**
 * FAQ Data for AEO (Answer Engine Optimisation)
 * Structured Q&A for FAQ page and JSON-LD schema
 */

export interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'features' | 'pricing' | 'technical' | 'industry'
}

export const faqs: FAQItem[] = [
  // General
  {
    question: 'What is totalaud.io?',
    answer:
      'totalaud.io is a calm, focused workspace for independent musicians. It combines four essential tools in one place: Ideas Mode for capturing creative thoughts, Scout Mode for finding playlist curators and radio contacts, Timeline Mode for planning releases, and Pitch Mode for crafting artist bios and pitches with AI assistance.',
    category: 'general',
  },
  {
    question: 'Who is totalaud.io for?',
    answer:
      "totalaud.io is built for independent artists who are serious about their music but overwhelmed by promotion. If you're self-releasing, on a small label, or just starting out, and you're tired of juggling 10 different tools and spreadsheets, totalaud.io gives you one calm place to organise everything.",
    category: 'general',
  },
  {
    question: 'How is totalaud.io different from SubmitHub or Groover?',
    answer:
      "SubmitHub and Groover are pay-per-pitch services. totalaud.io is a workspace. We don't charge per submission - instead, you get unlimited access to Scout Mode's curated contacts, plus tools to plan your release, capture ideas, and craft pitches. Think of it as your promotion headquarters, not a one-time submission service.",
    category: 'general',
  },

  // Features
  {
    question: 'What is Scout Mode?',
    answer:
      'Scout Mode is a curated database of playlist curators, radio contacts, music blogs, and other promotional opportunities. You can filter by genre, location, and opportunity type to find contacts that actually fit your music. Unlike scraped databases, our contacts are verified and regularly updated.',
    category: 'features',
  },
  {
    question: 'What is Ideas Mode?',
    answer:
      "Ideas Mode is your creative notebook. It's an infinite canvas where you can capture song ideas, marketing concepts, collaboration notes, and anything else that pops into your head. Everything is searchable, taggable, and exportable. No more losing ideas in scattered notes apps.",
    category: 'features',
  },
  {
    question: 'What is Timeline Mode?',
    answer:
      'Timeline Mode helps you plan your release campaign visually. Drag and drop tasks across five lanes: Planning, Creative, Release, Promo, and Analysis. See what needs to happen when, and never miss a deadline again. You can add opportunities from Scout directly to your timeline.',
    category: 'features',
  },
  {
    question: 'What is Pitch Mode?',
    answer:
      'Pitch Mode helps you write compelling artist bios, press releases, and pitch emails. Our AI coaching understands the music industry and helps you tell your story authentically - not in a robotic, AI-generated way. Export to clipboard and send.',
    category: 'features',
  },
  {
    question: 'Does totalaud.io distribute my music?',
    answer:
      'No, totalaud.io is not a distributor. We work alongside your distributor (DistroKid, TuneCore, CD Baby, etc.). We help you plan and promote your release - they get it on Spotify. Think of us as your promotion workspace, not your distribution platform.',
    category: 'features',
  },

  // Pricing
  {
    question: 'How much does totalaud.io cost?',
    answer:
      'totalaud.io starts at £5/month for Starter (Ideas Mode, limited Scout access, 1 project). Pro is £19/month for unlimited everything including AI coaching and exports. Annual Pro is £149/year (35% savings). No hidden fees, no per-pitch charges.',
    category: 'pricing',
  },
  {
    question: 'Is there a free trial?',
    answer:
      "We don't offer a traditional free trial, but Starter at £5/month is designed to be low-risk. It's less than a coffee a week. If it's not for you, cancel anytime - no questions asked.",
    category: 'pricing',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes, you can cancel your subscription at any time. No contracts, no cancellation fees. If you cancel, you'll keep access until the end of your billing period.",
    category: 'pricing',
  },

  // Technical
  {
    question: 'What devices does totalaud.io work on?',
    answer:
      "totalaud.io is a web application that works on any modern browser - Chrome, Safari, Firefox, Edge. It's designed mobile-first, so it works great on your phone too. No app download required.",
    category: 'technical',
  },
  {
    question: 'Is my data secure?',
    answer:
      "Yes. We use Supabase for our database with row-level security. Your data is encrypted in transit and at rest. We're GDPR compliant and will never sell your information. You can export and delete your data at any time.",
    category: 'technical',
  },

  // Industry
  {
    question: 'What is a radio plugger?',
    answer:
      "A radio plugger is a professional who pitches music to radio stations on behalf of artists and labels. They have relationships with programme directors and DJs. In Scout Mode, you'll find radio opportunities including BBC Introducing, community radio, and college radio contacts.",
    category: 'industry',
  },
  {
    question: 'How do I pitch to Spotify editorial playlists?',
    answer:
      'Submit through Spotify for Artists at least 7 days before release (ideally 4+ weeks). Go to your unreleased track, click "Pitch a Song", fill in genre/mood/instruments/story, and submit. Only one song per release can be pitched. totalaud.io\'s Timeline Mode helps you schedule this in advance.',
    category: 'industry',
  },
  {
    question: 'What is an EPK (Electronic Press Kit)?',
    answer:
      "An EPK is a digital portfolio for artists containing bio, photos, music links, press quotes, and contact info. It's what you send to venues, festivals, and press. totalaud.io's Pitch Mode helps you craft the written elements of your EPK.",
    category: 'industry',
  },
  {
    question: 'How far in advance should I plan a release?',
    answer:
      'For a single, plan 6-8 weeks ahead. For an EP, 10-12 weeks. For an album, 4-6 months minimum. This gives time for Spotify editorial submission (needs 7+ days), press outreach (needs 2-4 weeks for blogs, 3-6 months for print), and pre-save campaigns.',
    category: 'industry',
  },
  {
    question: 'What day should I release music?',
    answer:
      "Friday is the industry standard (New Music Friday playlists). But if you're unknown, Tuesday or Wednesday can get more individual attention since there's less competition. Avoid major release days from big artists. Check release calendars before choosing your date.",
    category: 'industry',
  },
]

export function getFAQsByCategory(category: FAQItem['category']): FAQItem[] {
  return faqs.filter((faq) => faq.category === category)
}

export function getAllFAQs(): FAQItem[] {
  return faqs
}
