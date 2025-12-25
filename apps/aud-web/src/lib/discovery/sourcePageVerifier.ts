/**
 * Source Page Verifier
 *
 * CRITICAL SAFETY CONTROL: Verifies that discovered emails actually exist
 * on the source page. This prevents LLM hallucinations from being stored.
 *
 * If an email is returned by Perplexity/Claude but NOT found in the source
 * HTML, it is DROPPED - not stored.
 *
 * Copied from Total Audio Platform with permission.
 */

import { logger } from '@/lib/logger'

const log = logger.scope('Source Verifier')

export interface VerificationResult {
  verified: boolean
  method:
    | 'source_page_verified'
    | 'source_page_not_found'
    | 'hidden_content'
    | 'fetch_failed'
    | 'timeout'
    | 'invalid_url'
  foundInPage: boolean
  isVisibleContent: boolean
  sourceUrl: string
  fetchTimeMs?: number
  error?: string
}

export interface BatchVerificationResult {
  results: Map<string, VerificationResult>
  pageContent?: string // Cached for multiple email checks
}

// Timeout for source page fetch (configurable via env)
const FETCH_TIMEOUT = parseInt(process.env.SOURCE_PAGE_VERIFY_TIMEOUT || '5000', 10)

// User agent for fetching (appear as browser)
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Fetch page content with timeout
 */
async function fetchPageContent(url: string): Promise<{ html: string; status: number } | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { html: '', status: response.status }
    }

    const html = await response.text()
    return { html, status: response.status }
  } catch (error) {
    clearTimeout(timeoutId)
    log.warn(`Fetch failed for ${url}`, { error })
    return null
  }
}

/**
 * Check if email appears in visible page content (not scripts/comments)
 */
function isEmailInVisibleContent(html: string, email: string): boolean {
  // Remove scripts, styles, comments, and hidden elements
  const cleanedHtml = html
    // Remove script tags and content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove style tags and content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove hidden inputs
    .replace(/<input[^>]*type=["']hidden["'][^>]*>/gi, '')
    // Remove data attributes (often contain obfuscated data)
    .replace(/data-[a-z-]+="[^"]*"/gi, '')

  // Check if email appears in cleaned content
  return cleanedHtml.toLowerCase().includes(email.toLowerCase())
}

/**
 * Check if email appears anywhere in page (including hidden)
 */
function isEmailInPage(html: string, email: string): boolean {
  return html.toLowerCase().includes(email.toLowerCase())
}

/**
 * Check if email appears to be obfuscated (common anti-spam technique)
 */
function isEmailObfuscated(html: string, email: string): boolean {
  const [local, domain] = email.toLowerCase().split('@')
  if (!local || !domain) return false

  // Check for common obfuscation patterns
  const obfuscationPatterns = [
    // "user [at] domain [dot] com"
    new RegExp(`${local}\\s*\\[at\\]\\s*${domain.replace('.', '\\s*\\[dot\\]\\s*')}`, 'i'),
    // "user (at) domain (dot) com"
    new RegExp(`${local}\\s*\\(at\\)\\s*${domain.replace('.', '\\s*\\(dot\\)\\s*')}`, 'i'),
    // "user AT domain DOT com"
    new RegExp(`${local}\\s+AT\\s+${domain.replace('.', '\\s+DOT\\s+')}`, 'i'),
    // JavaScript mailto obfuscation
    new RegExp(`mailto:${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
  ]

  return obfuscationPatterns.some((pattern) => pattern.test(html))
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Verify that an email exists on its source page
 *
 * CRITICAL: Returns verified=false if email cannot be found in visible HTML.
 * This prevents LLM hallucinations from being stored.
 */
export async function verifyEmailOnSourcePage(
  email: string,
  sourceUrl: string
): Promise<VerificationResult> {
  const startTime = Date.now()

  // Validate URL
  if (!isValidUrl(sourceUrl)) {
    return {
      verified: false,
      method: 'invalid_url',
      foundInPage: false,
      isVisibleContent: false,
      sourceUrl,
      error: 'Invalid URL format',
    }
  }

  // Fetch page content
  const fetchResult = await fetchPageContent(sourceUrl)
  const fetchTimeMs = Date.now() - startTime

  if (!fetchResult) {
    return {
      verified: false,
      method: 'fetch_failed',
      foundInPage: false,
      isVisibleContent: false,
      sourceUrl,
      fetchTimeMs,
      error: 'Failed to fetch source page',
    }
  }

  if (fetchResult.status !== 200 && fetchResult.status !== 304) {
    return {
      verified: false,
      method: 'fetch_failed',
      foundInPage: false,
      isVisibleContent: false,
      sourceUrl,
      fetchTimeMs,
      error: `HTTP ${fetchResult.status}`,
    }
  }

  const html = fetchResult.html

  // Check if email exists anywhere in page
  const foundInPage = isEmailInPage(html, email)
  if (!foundInPage) {
    // Also check for obfuscated versions
    const foundObfuscated = isEmailObfuscated(html, email)
    if (foundObfuscated) {
      return {
        verified: true,
        method: 'source_page_verified',
        foundInPage: true,
        isVisibleContent: true, // Obfuscated emails are intentionally visible
        sourceUrl,
        fetchTimeMs,
      }
    }

    return {
      verified: false,
      method: 'source_page_not_found',
      foundInPage: false,
      isVisibleContent: false,
      sourceUrl,
      fetchTimeMs,
    }
  }

  // Check if email is in visible content
  const isVisible = isEmailInVisibleContent(html, email)

  if (!isVisible) {
    return {
      verified: false,
      method: 'hidden_content',
      foundInPage: true,
      isVisibleContent: false,
      sourceUrl,
      fetchTimeMs,
    }
  }

  // Email found in visible content - verified!
  return {
    verified: true,
    method: 'source_page_verified',
    foundInPage: true,
    isVisibleContent: true,
    sourceUrl,
    fetchTimeMs,
  }
}

/**
 * Verify multiple emails against the same source page
 * More efficient when checking multiple contacts from same source
 */
export async function verifyEmailsBatchFromSource(
  emails: string[],
  sourceUrl: string
): Promise<BatchVerificationResult> {
  const results = new Map<string, VerificationResult>()

  // Validate URL
  if (!isValidUrl(sourceUrl)) {
    for (const email of emails) {
      results.set(email, {
        verified: false,
        method: 'invalid_url',
        foundInPage: false,
        isVisibleContent: false,
        sourceUrl,
        error: 'Invalid URL format',
      })
    }
    return { results }
  }

  // Fetch page content once
  const startTime = Date.now()
  const fetchResult = await fetchPageContent(sourceUrl)
  const fetchTimeMs = Date.now() - startTime

  if (!fetchResult || (fetchResult.status !== 200 && fetchResult.status !== 304)) {
    for (const email of emails) {
      results.set(email, {
        verified: false,
        method: 'fetch_failed',
        foundInPage: false,
        isVisibleContent: false,
        sourceUrl,
        fetchTimeMs,
        error: fetchResult ? `HTTP ${fetchResult.status}` : 'Failed to fetch source page',
      })
    }
    return { results }
  }

  const html = fetchResult.html

  // Check each email against the same page content
  for (const email of emails) {
    const foundInPage = isEmailInPage(html, email)
    const foundObfuscated = foundInPage ? false : isEmailObfuscated(html, email)

    if (!foundInPage && !foundObfuscated) {
      results.set(email, {
        verified: false,
        method: 'source_page_not_found',
        foundInPage: false,
        isVisibleContent: false,
        sourceUrl,
        fetchTimeMs,
      })
      continue
    }

    const isVisible = foundObfuscated || isEmailInVisibleContent(html, email)

    results.set(email, {
      verified: isVisible,
      method: isVisible ? 'source_page_verified' : 'hidden_content',
      foundInPage: foundInPage || foundObfuscated,
      isVisibleContent: isVisible,
      sourceUrl,
      fetchTimeMs,
    })
  }

  return { results, pageContent: html }
}

/**
 * Quick check if a URL is likely to have contact info
 */
export function isLikelyContactPage(url: string): boolean {
  const lowercaseUrl = url.toLowerCase()

  const contactPatterns = [
    '/contact',
    '/about',
    '/team',
    '/people',
    '/staff',
    '/contributors',
    '/writers',
    '/presenters',
    '/hosts',
    '/djs',
  ]

  return contactPatterns.some((pattern) => lowercaseUrl.includes(pattern))
}

/**
 * Extract domain from URL
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/**
 * Extract all email addresses from HTML content
 */
export function extractEmailsFromHtml(html: string): string[] {
  // Email regex pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

  // Clean HTML first (remove scripts, styles)
  const cleanedHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Find all emails
  const matches = cleanedHtml.match(emailRegex) || []

  // Deduplicate and filter out common false positives
  const filtered = [...new Set(matches)].filter((email) => {
    const lower = email.toLowerCase()
    // Filter out common non-contact emails
    return (
      !lower.includes('example.com') &&
      !lower.includes('placeholder') &&
      !lower.includes('noreply') &&
      !lower.includes('no-reply') &&
      !lower.includes('donotreply') &&
      !lower.endsWith('.png') &&
      !lower.endsWith('.jpg') &&
      !lower.endsWith('.gif')
    )
  })

  return filtered
}
