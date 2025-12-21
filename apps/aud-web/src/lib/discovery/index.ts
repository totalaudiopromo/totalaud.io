/**
 * Discovery Module
 *
 * Contact discovery utilities for Scout Mode.
 * Ported from Total Audio Platform Intel system.
 */

// Classification
export {
  classifyContact,
  determineOutletType,
  isLikelyB2CDomain,
  isLikelyB2BDomain,
  getConfidenceLabel,
  type ContactType,
  type ClassificationResult,
  type ClassificationSignal,
} from './contactClassifier'

// Verification
export {
  verifyEmailOnSourcePage,
  verifyEmailsBatchFromSource,
  isLikelyContactPage,
  extractDomainFromUrl,
  extractEmailsFromHtml,
  type VerificationResult,
  type BatchVerificationResult,
} from './sourcePageVerifier'

// Suppression
export {
  checkSuppression,
  checkSuppressionBatch,
  addSuppression,
  clearSuppressionCache,
  type SuppressionCheck,
  type SuppressionReason,
  type SuppressionEntry,
} from './suppressionService'

// Crypto utilities
export {
  hashEmail,
  hashDomain,
  extractDomain,
  hashIP,
  encryptAES256GCM,
  decryptAES256GCM,
  generateEncryptionKey,
  isValidEncryptionKey,
  createSuppressionEntry,
  matchesSuppression,
} from './crypto'
