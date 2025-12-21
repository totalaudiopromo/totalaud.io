/**
 * Contact Classifier
 *
 * Classifies discovered contacts as B2B (business) or B2C (individual consumer).
 * This distinction is critical for GDPR compliance:
 * - B2B: Can process under Legitimate Interest
 * - B2C: Requires explicit consent for any processing
 *
 * Copied from Total Audio Platform with permission.
 */

export type ContactType = 'b2b' | 'b2c' | 'unknown'

export interface ClassificationResult {
  type: ContactType
  confidence: number // 0-1
  signals: ClassificationSignal[]
  reasoning: string
}

export interface ClassificationSignal {
  name: string
  value: string | boolean
  weight: number // -1 to 1 (negative = B2C, positive = B2B)
}

// B2B domain patterns (radio stations, labels, media outlets)
const B2B_DOMAIN_PATTERNS = [
  // Radio stations
  /bbc\.(co\.uk|com)/i,
  /radio[0-9]*\./i,
  /\.(radio|fm|am)\./i,
  /capitalfm/i,
  /heartradiou?k/i,
  /globalradio/i,
  /absolute(radio)?/i,
  /kisstfm/i,

  // Media outlets
  /nme\.com/i,
  /pitchfork/i,
  /rollingstone/i,
  /billboard/i,
  /stereogum/i,
  /consequence/i,
  /spin\.com/i,
  /diymagazine/i,
  /thequietus/i,
  /loudandquiet/i,
  /crackmagazine/i,
  /clashmusic/i,

  // Labels
  /records?\./i,
  /music\.(co\.uk|com)/i,
  /entertainment\./i,
  /publishing\./i,

  // Agencies/PR
  /pr\.com/i,
  /publicity/i,
  /agency/i,
  /management/i,

  // Platforms
  /spotify/i,
  /apple(music)?/i,
  /amazon(music)?/i,
  /deezer/i,
  /tidal/i,
  /soundcloud/i,
  /bandcamp/i,
]

// B2C domain patterns (personal/consumer domains)
const B2C_DOMAIN_PATTERNS = [
  /gmail\.com/i,
  /yahoo\.(com|co\.uk)/i,
  /hotmail\.(com|co\.uk)/i,
  /outlook\.(com|co\.uk)/i,
  /icloud\.com/i,
  /live\.(com|co\.uk)/i,
  /aol\.com/i,
  /protonmail\.com/i,
  /me\.com/i,
  /btinternet\.com/i,
  /sky\.com/i,
  /virgin\.net/i,
  /talktalk\.net/i,
]

// B2B role keywords
const B2B_ROLE_KEYWORDS = [
  'producer',
  'presenter',
  'host',
  'dj',
  'editor',
  'journalist',
  'writer',
  'critic',
  'reviewer',
  'a&r',
  'scout',
  'manager',
  'agent',
  'publicist',
  'pr ',
  'marketing',
  'promoter',
  'booker',
  'curator',
  'programmer',
  'director',
  'head of',
  'chief',
  'lead',
  'senior',
  'coordinator',
  'playlist',
]

// B2C role keywords (individual artists)
const B2C_ROLE_KEYWORDS = [
  'artist',
  'musician',
  'singer',
  'songwriter',
  'rapper',
  'vocalist',
  'band member',
  'performer',
  'composer',
  'instrumentalist',
  'solo',
  'independent',
  'unsigned',
]

// B2B outlet type keywords
const B2B_OUTLET_KEYWORDS = [
  'radio',
  'station',
  'fm',
  'am',
  'bbc',
  'magazine',
  'publication',
  'blog',
  'website',
  'label',
  'records',
  'agency',
  'pr firm',
  'publicity',
  'playlist',
  'podcast',
  'show',
  'programme',
  'channel',
  'network',
]

/**
 * Classify a contact as B2B or B2C
 */
export function classifyContact(
  name: string,
  email?: string,
  role?: string,
  outletName?: string,
  sourceDomain?: string
): ClassificationResult {
  const signals: ClassificationSignal[] = []
  let totalWeight = 0

  // 1. Check email domain
  if (email) {
    const domain = email.split('@')[1]?.toLowerCase() || ''

    // Check B2B patterns
    for (const pattern of B2B_DOMAIN_PATTERNS) {
      if (pattern.test(domain)) {
        signals.push({
          name: 'email_b2b_domain',
          value: domain,
          weight: 0.8,
        })
        totalWeight += 0.8
        break
      }
    }

    // Check B2C patterns
    for (const pattern of B2C_DOMAIN_PATTERNS) {
      if (pattern.test(domain)) {
        signals.push({
          name: 'email_b2c_domain',
          value: domain,
          weight: -0.6,
        })
        totalWeight -= 0.6
        break
      }
    }
  }

  // 2. Check role keywords
  if (role) {
    const roleLower = role.toLowerCase()

    // B2B role check
    for (const keyword of B2B_ROLE_KEYWORDS) {
      if (roleLower.includes(keyword)) {
        signals.push({
          name: 'role_b2b_keyword',
          value: keyword,
          weight: 0.6,
        })
        totalWeight += 0.6
        break
      }
    }

    // B2C role check
    for (const keyword of B2C_ROLE_KEYWORDS) {
      if (roleLower.includes(keyword)) {
        signals.push({
          name: 'role_b2c_keyword',
          value: keyword,
          weight: -0.7,
        })
        totalWeight -= 0.7
        break
      }
    }
  }

  // 3. Check outlet name
  if (outletName) {
    const outletLower = outletName.toLowerCase()

    for (const keyword of B2B_OUTLET_KEYWORDS) {
      if (outletLower.includes(keyword)) {
        signals.push({
          name: 'outlet_b2b_keyword',
          value: keyword,
          weight: 0.7,
        })
        totalWeight += 0.7
        break
      }
    }
  }

  // 4. Check source domain (where contact was found)
  if (sourceDomain) {
    const domainLower = sourceDomain.toLowerCase()

    // Social media = likely B2C
    if (
      domainLower.includes('instagram') ||
      domainLower.includes('twitter') ||
      domainLower.includes('tiktok') ||
      domainLower.includes('facebook')
    ) {
      signals.push({
        name: 'source_social_media',
        value: sourceDomain,
        weight: -0.3,
      })
      totalWeight -= 0.3
    }

    // Professional sources = likely B2B
    if (
      domainLower.includes('linkedin') ||
      domainLower.includes('.com/about') ||
      domainLower.includes('/contact') ||
      domainLower.includes('/team')
    ) {
      signals.push({
        name: 'source_professional',
        value: sourceDomain,
        weight: 0.4,
      })
      totalWeight += 0.4
    }
  }

  // 5. Name pattern analysis
  const nameLower = name.toLowerCase()

  // Check if name looks like a band/artist name (often stylized)
  if (
    nameLower === nameLower.toUpperCase() || // ALL CAPS
    nameLower.includes('&') || // Band format "X & Y"
    nameLower.includes(' the ') || // "X the Y"
    /^the\s/i.test(name) || // "The X"
    /^\d/.test(name) // Starts with number
  ) {
    signals.push({
      name: 'name_artist_pattern',
      value: name,
      weight: -0.4,
    })
    totalWeight -= 0.4
  }

  // Calculate final classification
  const absWeight = Math.abs(totalWeight)
  const confidence = Math.min(1, absWeight / 2) // Normalize to 0-1

  let type: ContactType
  let reasoning: string

  if (absWeight < 0.3) {
    type = 'unknown'
    reasoning = 'Insufficient signals to determine contact type'
  } else if (totalWeight > 0) {
    type = 'b2b'
    reasoning = `Classified as B2B based on ${signals.filter((s) => s.weight > 0).length} positive signals`
  } else {
    type = 'b2c'
    reasoning = `Classified as B2C based on ${signals.filter((s) => s.weight < 0).length} consumer indicators`
  }

  return {
    type,
    confidence,
    signals,
    reasoning,
  }
}

/**
 * Determine outlet type from name/context
 */
export function determineOutletType(outletName?: string, sourceDomain?: string): string | null {
  const combined = `${outletName || ''} ${sourceDomain || ''}`.toLowerCase()

  if (/radio|fm\d|am\d|bbc\s*\d/i.test(combined)) return 'radio'
  if (/playlist|spotify|apple\s*music/i.test(combined)) return 'playlist'
  if (/podcast|show|episode/i.test(combined)) return 'podcast'
  if (/magazine|publication|review|blog|press/i.test(combined)) return 'press'
  if (/label|records|music\s*group/i.test(combined)) return 'label'
  if (/pr\s|publicist|agency/i.test(combined)) return 'pr'

  return null
}

/**
 * Quick check if email domain suggests B2C
 */
export function isLikelyB2CDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() || ''

  for (const pattern of B2C_DOMAIN_PATTERNS) {
    if (pattern.test(domain)) {
      return true
    }
  }

  return false
}

/**
 * Quick check if email domain suggests B2B
 */
export function isLikelyB2BDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() || ''

  for (const pattern of B2B_DOMAIN_PATTERNS) {
    if (pattern.test(domain)) {
      return true
    }
  }

  // Custom domain (not consumer) is usually B2B
  const isConsumer = B2C_DOMAIN_PATTERNS.some((p) => p.test(domain))
  return !isConsumer && domain.length > 0
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidence: number): 'High' | 'Medium' | 'Low' {
  if (confidence >= 0.7) return 'High'
  if (confidence >= 0.4) return 'Medium'
  return 'Low'
}
