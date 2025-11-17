/**
 * Phase 34: Global Search Engine - Text Normalisation
 *
 * Normalisation utilities for consistent search matching.
 * Handles British spellings, accents, whitespace, and case.
 */

/**
 * British to American spelling mappings
 */
const BRITISH_TO_AMERICAN: Record<string, string> = {
  colour: 'color',
  colours: 'colors',
  coloured: 'colored',
  behaviour: 'behavior',
  behaviours: 'behaviors',
  behavioural: 'behavioral',
  centre: 'center',
  centres: 'centers',
  centred: 'centered',
  optimise: 'optimize',
  optimised: 'optimized',
  optimising: 'optimizing',
  analyse: 'analyze',
  analysed: 'analyzed',
  analysing: 'analyzing',
  organise: 'organize',
  organised: 'organized',
  organising: 'organizing',
  visualise: 'visualize',
  visualised: 'visualized',
  visualising: 'visualizing',
  recognise: 'recognize',
  recognised: 'recognized',
  recognising: 'recognizing',
  realise: 'realize',
  realised: 'realized',
  realising: 'realizing',
  licence: 'license',
  practise: 'practice',
  favour: 'favor',
  favoured: 'favored',
  honour: 'honor',
  honoured: 'honored',
  labour: 'labor',
  neighbour: 'neighbor',
  programme: 'program',
  programmes: 'programs',
}

/**
 * Accent removal mappings
 */
const ACCENT_MAP: Record<string, string> = {
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  å: 'a',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  ò: 'o',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ü: 'u',
  ñ: 'n',
  ç: 'c',
}

/**
 * Normalise text for search matching
 *
 * Steps:
 * 1. Lowercase
 * 2. Replace British spellings with American
 * 3. Remove accents
 * 4. Collapse whitespace
 * 5. Trim
 *
 * @param text - Text to normalise
 * @returns Normalised text
 */
export function normaliseText(text: string): string {
  if (!text) return ''

  let normalized = text.toLowerCase()

  // Replace British spellings with American
  Object.entries(BRITISH_TO_AMERICAN).forEach(([british, american]) => {
    const regex = new RegExp(`\\b${british}\\b`, 'gi')
    normalized = normalized.replace(regex, american)
  })

  // Remove accents
  normalized = normalized
    .split('')
    .map((char) => ACCENT_MAP[char] || char)
    .join('')

  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ')

  // Trim
  normalized = normalized.trim()

  return normalized
}

/**
 * Normalise query for search
 *
 * Same as normaliseText but also removes common stop words
 * to improve search quality.
 *
 * @param query - Search query
 * @returns Normalised query
 */
export function normaliseQuery(query: string): string {
  const normalized = normaliseText(query)

  // Remove common stop words (optional - keeping it simple for now)
  // Could expand this list if needed
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']

  const words = normalized.split(' ')
  const filtered = words.filter((word) => !stopWords.includes(word) || words.length <= 2)

  return filtered.join(' ')
}

/**
 * Extract keywords from text
 *
 * Useful for indexing and relevance scoring.
 *
 * @param text - Text to extract keywords from
 * @param minLength - Minimum word length (default: 3)
 * @returns Array of keywords
 */
export function extractKeywords(text: string, minLength = 3): string[] {
  const normalized = normaliseText(text)

  const words = normalized.split(/\s+/)
  const keywords = words
    .filter((word) => word.length >= minLength)
    .filter((word, index, arr) => arr.indexOf(word) === index) // Unique

  return keywords
}
