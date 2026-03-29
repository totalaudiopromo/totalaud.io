/**
 * JSON-LD Schema Component
 * Renders structured data as a plain <script> tag for SEO and AEO.
 * AI crawlers don't execute JavaScript, so we avoid Next.js Script component
 * and render directly into the HTML.
 *
 * When multiple schemas are passed as an array, they are merged into a
 * single @graph object to avoid duplicate @context declarations.
 */

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[]
  id?: string
}

export function JsonLd({ schema, id = 'json-ld' }: JsonLdProps) {
  // Wrap multiple schemas in @graph pattern
  const data = Array.isArray(schema)
    ? {
        '@context': 'https://schema.org',
        '@graph': schema.map(({ '@context': _ctx, ...rest }) => rest),
      }
    : schema

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
