/**
 * Cryptographic Utilities for Discovery System
 *
 * Provides hashing (SHA-256) and encryption (AES-256-GCM) for
 * GDPR-compliant suppression list management.
 *
 * Copied from Total Audio Platform with permission.
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/**
 * Hash an email address using SHA-256
 * Used for O(1) suppression list lookups
 */
export function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

/**
 * Hash a domain using SHA-256
 */
export function hashDomain(domain: string): string {
  return createHash('sha256').update(domain.toLowerCase().trim()).digest('hex')
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string {
  const parts = email.split('@')
  return parts.length > 1 ? parts[1].toLowerCase().trim() : ''
}

/**
 * Hash an IP address using SHA-256
 * Used for audit logging without storing raw IPs
 */
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

/**
 * Encrypt data using AES-256-GCM
 * Returns base64-encoded string: iv:authTag:ciphertext
 *
 * @param plaintext - Data to encrypt
 * @param key - 32-byte encryption key (or hex string)
 */
export function encryptAES256GCM(plaintext: string, key: string | Buffer): string {
  // Convert key to buffer if string (assume hex)
  const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key

  if (keyBuffer.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (256 bits)')
  }

  // Generate random IV (12 bytes for GCM)
  const iv = randomBytes(12)

  // Create cipher
  const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv)

  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  // Get auth tag
  const authTag = cipher.getAuthTag()

  // Return iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypt data encrypted with AES-256-GCM
 *
 * @param ciphertext - Base64 string in format: iv:authTag:ciphertext
 * @param key - 32-byte encryption key (or hex string)
 */
export function decryptAES256GCM(ciphertext: string, key: string | Buffer): string {
  // Convert key to buffer if string (assume hex)
  const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key

  if (keyBuffer.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (256 bits)')
  }

  // Parse iv:authTag:ciphertext format
  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format - expected iv:authTag:ciphertext')
  }

  const iv = Buffer.from(parts[0], 'base64')
  const authTag = Buffer.from(parts[1], 'base64')
  const encrypted = parts[2]

  // Create decipher
  const decipher = createDecipheriv('aes-256-gcm', keyBuffer, iv)
  decipher.setAuthTag(authTag)

  // Decrypt
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Generate a random 32-byte encryption key
 * Returns hex-encoded string
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Validate that an encryption key is the correct format
 */
export function isValidEncryptionKey(key: string): boolean {
  // Check if it's a valid 64-character hex string (32 bytes)
  return /^[0-9a-fA-F]{64}$/.test(key)
}

/**
 * Suppression entry with both hash and encrypted values
 */
export interface SuppressionEntry {
  emailHash: string
  domainHash: string
  emailEncrypted?: string
  domainEncrypted?: string
}

/**
 * Create suppression entry with hash and optional encryption
 *
 * @param email - Email to create suppression for
 * @param encryptionKey - Optional key for encrypted backup (for DSAR)
 */
export function createSuppressionEntry(email: string, encryptionKey?: string): SuppressionEntry {
  const normalised = email.toLowerCase().trim()
  const domain = extractDomain(normalised)

  const entry: SuppressionEntry = {
    emailHash: hashEmail(normalised),
    domainHash: hashDomain(domain),
  }

  // Add encrypted versions if key provided (for DSAR matching)
  if (encryptionKey && isValidEncryptionKey(encryptionKey)) {
    entry.emailEncrypted = encryptAES256GCM(normalised, encryptionKey)
    entry.domainEncrypted = encryptAES256GCM(domain, encryptionKey)
  }

  return entry
}

/**
 * Check if an email matches a suppression entry (hash comparison)
 */
export function matchesSuppression(email: string, suppressionHash: string): boolean {
  return hashEmail(email) === suppressionHash
}
