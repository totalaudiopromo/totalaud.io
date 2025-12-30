import type { Metadata } from 'next'
import Link from 'next/link'
import { comparisons } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Compare Music Promotion Platforms | totalaud.io',
  description:
    'Compare totalaud.io with Groover, SubmitHub, Hypeddit, and other music promotion platforms. Find the right tools for your music career.',
  keywords: [
    'music promotion comparison',
    'submithub alternatives',
    'groover alternatives',
    'playlist pitching services',
    'best music promotion tools 2025',
    'indie artist tools',
  ],
  openGraph: {
    title: 'Compare Music Promotion Platforms | totalaud.io',
    description:
      'Compare totalaud.io with Groover, SubmitHub, Hypeddit, and other music promotion platforms.',
    type: 'website',
  },
}

// Group comparisons by category
const directCompetitors = comparisons.filter((c) =>
  ['groover', 'submithub', 'hypeddit', 'playlist-push'].includes(c.slug)
)
const categoryComparisons = comparisons.filter((c) =>
  [
    'playlist-pitching-services',
    'music-promotion-tools',
    'submithub-alternatives',
    'groover-alternatives',
  ].includes(c.slug)
)
const specificAlternatives = comparisons.filter((c) =>
  ['distrokid-promotion', 'ditto-music', 'musosoup', 'indie-music-workspace'].includes(c.slug)
)

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border/50 bg-gradient-to-b from-background to-muted/20 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            Compare Music Promotion Platforms
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Honest, detailed comparisons to help you choose the right tools for your music career.
            See how totalaud.io stacks up against the alternatives.
          </p>
        </div>
      </section>

      {/* Direct Competitors */}
      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-2xl font-semibold">Direct Comparisons</h2>
          <p className="mb-8 text-muted-foreground">
            Head-to-head comparisons with major music promotion platforms
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {directCompetitors.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">
                    vs {comparison.competitor}
                  </span>
                  <span className="text-xs text-muted-foreground">{comparison.competitorUrl}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold group-hover:text-accent transition-colors">
                  {comparison.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {comparison.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-1">
                    {comparison.features.length} features compared
                  </span>
                  <span className="text-accent group-hover:underline">Read comparison →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Comparisons */}
      <section className="border-t border-border/30 bg-muted/10 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-2xl font-semibold">Category Guides</h2>
          <p className="mb-8 text-muted-foreground">
            Comprehensive guides comparing entire categories of music promotion tools
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {categoryComparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
              >
                <h3 className="mb-2 text-lg font-semibold group-hover:text-accent transition-colors">
                  {comparison.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {comparison.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-1">Guide</span>
                  <span className="text-accent group-hover:underline">Read guide →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Specific Alternatives */}
      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-2xl font-semibold">Specific Alternatives</h2>
          <p className="mb-8 text-muted-foreground">
            Comparisons with distribution platforms and niche music tools
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {specificAlternatives.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">{comparison.competitor}</span>
                  {comparison.competitorUrl && (
                    <span className="text-xs text-muted-foreground">
                      {comparison.competitorUrl}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold group-hover:text-accent transition-colors">
                  {comparison.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {comparison.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="text-accent group-hover:underline">Read comparison →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/30 bg-gradient-to-b from-muted/20 to-background px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-semibold">Ready to try a different approach?</h2>
          <p className="mb-8 text-muted-foreground">
            totalaud.io is a calm creative workspace for independent artists. Discover
            opportunities, plan campaigns, and craft your story - all without per-submission fees.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/pricing"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent/90"
            >
              View Pricing
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-muted"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
