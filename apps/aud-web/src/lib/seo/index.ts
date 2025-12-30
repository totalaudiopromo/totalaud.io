/**
 * SEO Module Exports
 * Central export for all SEO utilities and data
 *
 * Total pSEO pages:
 * - 30 genres
 * - 30 locations (15 UK, 15 US)
 * - 15 use-cases
 * - 12 comparisons
 * = 87 programmatic pages
 */

// Data exports
export { genres, getGenreBySlug, getAllGenreSlugs, type GenreData } from './genres'
export {
  locations,
  ukLocations,
  usLocations,
  getLocationBySlug,
  getAllLocationSlugs,
  type LocationData,
} from './locations'
export { useCases, getUseCaseBySlug, getAllUseCaseSlugs, type UseCaseData } from './use-cases'
export { faqs, getFAQsByCategory, getAllFAQs, type FAQItem } from './faq-data'
export {
  comparisons,
  getComparisonBySlug,
  getAllComparisonSlugs,
  type ComparisonData,
} from './comparisons'

// JSON-LD schema generators
export {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateWebPageSchema,
  generateLocalBusinessSchema,
  generateArticleSchema,
} from './json-ld'
