// Force static generation -- no dynamic rendering needed
export const dynamic = 'force-static'
export const revalidate = 86400 // 24h

export function GET() {
  const content = `# totalaud.io

> totalaud.io is a workspace for emerging indie artists to research contacts, craft pitches, plan releases, and track results -- all in one place.

## What it does
- [Workspace modes](/workspace) -- Ideas, Scout, Timeline, Pitch, Finish
- [Console](/console) -- AI-powered intelligence, threads, automations
- [Pricing](/pricing) -- Free, Starter (GBP5/mo), Pro (GBP19/mo), Power (GBP79/mo)

## Who it's for
- Indie artists on their first or second release
- Self-releasing musicians who want professional PR tools
- Artists who want to find press, radio, and playlist contacts

## Who it's NOT for
- PR agencies (see [Total Audio Promo](https://totalaudiopromo.com) for agency tools)
- Labels with large rosters
- Artists looking for distribution or playlist pitching services

## Key features
- AI-powered contact discovery and enrichment
- Pitch coaching and AI draft generation
- Release timeline planning
- Audio mastering (Finish mode)
- Campaign tracking and analytics

## Guides
- [Compare music PR tools](/compare)
- [Genre-specific promotion guides](/genre)
- [Location-based music scenes](/location)
- [Use-case guides for music promotion](/for)
- [FAQ](/faq)

## Legal
- [Terms of Service](/terms)
- [Privacy Policy](/privacy)
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
