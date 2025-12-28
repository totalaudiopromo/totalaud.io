/**
 * SEO Module Exports
 * Central export for all SEO utilities and data
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
