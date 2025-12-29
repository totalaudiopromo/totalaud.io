/**
 * JSON-LD Schema Component
 * Renders structured data for SEO and AEO using Next.js Script component
 */

import Script from 'next/script'

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[]
  id?: string
}

export function JsonLd({ schema, id = 'json-ld' }: JsonLdProps) {
  return (
    <Script id={id} type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(schema)}
    </Script>
  )
}
