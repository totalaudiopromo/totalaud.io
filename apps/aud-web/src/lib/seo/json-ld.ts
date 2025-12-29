/**
 * JSON-LD Schema Generators for SEO
 * Structured data for search engines and AI answer engines
 */

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

export interface FAQItem {
  question: string
  answer: string
}

/**
 * Organization schema - used on all pages
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'totalaud.io',
    alternateName: 'Total Audio Promo',
    url: siteUrl,
    logo: `${siteUrl}/brand/png/ta-logo-cyan-512.png`,
    description:
      'Calm creative workspace for independent musicians. Scout contacts, capture ideas, plan releases, craft pitches.',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'Chris Schofield',
        jobTitle: 'Founder',
      },
    ],
    sameAs: ['https://twitter.com/totalaudiopromo', 'https://totalaudiopromo.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@totalaud.io',
    },
  }
}

/**
 * SoftwareApplication schema - used on landing page
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'totalaud.io',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Calm creative workspace for independent musicians. Scout contacts, capture ideas, plan releases, craft pitches.',
    url: siteUrl,
    screenshot: `${siteUrl}/brand/png/lockup-horizontal-cyan-4096.png`,
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '5.00',
        priceCurrency: 'GBP',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '19.00',
        priceCurrency: 'GBP',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Ideas Mode - Capture and organise creative ideas',
      'Scout Mode - Find playlist curators and radio contacts',
      'Timeline Mode - Plan your release campaign visually',
      'Pitch Mode - Craft compelling artist narratives with AI',
    ],
  }
}

/**
 * FAQPage schema - used on FAQ page and landing page
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * BreadcrumbList schema - for navigation context
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  }
}

/**
 * HowTo schema - for guide pages
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

/**
 * WebPage schema - for content pages
 */
export function generateWebPageSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${siteUrl}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'totalaud.io',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'totalaud.io',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/brand/png/ta-logo-cyan-512.png`,
      },
    },
  }
}

/**
 * LocalBusiness schema - for location pages
 */
export function generateLocalBusinessSchema(location: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `totalaud.io - ${location}`,
    description: `Music promotion workspace for independent artists in ${location}`,
    url: `${siteUrl}/location/${location.toLowerCase().replace(/\s+/g, '-')}`,
    areaServed: {
      '@type': 'Place',
      name: location,
    },
    serviceType: 'Music Promotion Tools',
    provider: {
      '@type': 'Organization',
      name: 'totalaud.io',
    },
  }
}

/**
 * Article schema - for blog/guide content
 */
export function generateArticleSchema(
  headline: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `${siteUrl}${url}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: 'totalaud.io',
    },
    publisher: {
      '@type': 'Organization',
      name: 'totalaud.io',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/brand/png/ta-logo-cyan-512.png`,
      },
    },
  }
}
